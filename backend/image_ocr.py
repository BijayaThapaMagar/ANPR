import cv2
import numpy as np
from ultralytics import YOLO
import os
import uuid
from pymongo import MongoClient
from datetime import datetime
from roboflow_ocr import roboflow_ocr_text

# --- MongoDB Connection ---
mongo_uri = os.environ.get("MONGODB_URI", "mongodb://mongodb:27017/")
mongo_client = MongoClient(mongo_uri)
db = mongo_client["anpr_db"]
detections_collection = db["detections"]

# Import local OCR
def get_yolo_ocr_text(image_np, character_detector):
    """
    Performs OCR on a cropped plate image using a second YOLO model.
    """
    if not character_detector:
        return {"error": "Character detector model is not available."}
        
    try:
        char_results = character_detector(image_np)
        
        detections = []
        for result in char_results:
            class_names = result.names
            boxes = result.boxes.xyxy.cpu().numpy()
            classes = result.boxes.cls.cpu().numpy()
            
            for box, cls_id in zip(boxes, classes):
                x1, y1, x2, y2 = box
                char_label = class_names[int(cls_id)]
                detections.append({'box': (x1, y1, x2, y2), 'label': char_label})

        if not detections:
            return {"text": ""}

        # Sort characters from left to right based on their bounding box
        detections.sort(key=lambda d: d['box'][0])
        ocr_text = "".join([d['label'] for d in detections])
        
        return {"text": ocr_text}
        
    except Exception as e:
        error_msg = f"An error occurred during local OCR: {e}"
        print(f"❌ ERROR: {error_msg}")
        return {"error": error_msg}

# Toggle for OCR method
USE_ROBOFLOW_OCR = os.environ.get("USE_ROBOFLOW_OCR", "0") == "1"

def process_image_file(plate_detector, character_detector, image_contents, image_filename, ocr_mode=None):
    print(f"[DEBUG] OCR mode in backend: {ocr_mode}")
    RESULTS_DIR = "results"
    os.makedirs(RESULTS_DIR, exist_ok=True)

    # Generate a unique result folder for this request
    result_id = str(uuid.uuid4())
    result_folder = os.path.join(RESULTS_DIR, result_id)
    os.makedirs(result_folder, exist_ok=True)

    np_arr = np.frombuffer(image_contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # Save the original image
    original_path = os.path.join(result_folder, "original.jpg")
    cv2.imwrite(original_path, img)

    # Stage 1: Detect License Plates
    plate_results = plate_detector(img)

    viz_img = img.copy()
    final_results = []
    
    # Check if any results were found
    if len(plate_results) > 0 and len(plate_results[0].boxes) > 0:
        boxes = plate_results[0].boxes.xyxy.cpu().numpy()
        confs = plate_results[0].boxes.conf.cpu().numpy() # <-- FIX: Get confidences

        for idx, (box, conf) in enumerate(zip(boxes, confs)):
            x1, y1, x2, y2 = map(int, box)
            # Draw only the bounding box for the license plate on the main image
            cv2.rectangle(viz_img, (x1, y1), (x2, y2), (0, 255, 0), 2)

            cropped_plate = img[y1:y2, x1:x2]
            if cropped_plate.size == 0:
                continue

            if ocr_mode == "roboflow":
                print("[DEBUG] Using Roboflow OCR branch.")
                print("[INFO] Using Roboflow OCR for plate text recognition.")
                ocr_result = roboflow_ocr_text(cropped_plate)
                print(f"[DEBUG] Roboflow OCR result: {ocr_result}")
                # Draw only subtle, semi-transparent, thin colored outlines for each character
                color_palette = [
                    (255, 0, 0),    # Red
                    (0, 255, 0),    # Green
                    (0, 0, 255),    # Blue
                    (255, 255, 0),  # Cyan
                    (255, 0, 255),  # Magenta
                    (0, 255, 255),  # Yellow
                    (255, 128, 0),  # Orange
                    (128, 0, 255),  # Purple
                    (0, 128, 255),  # Light Blue
                    (128, 255, 0),  # Lime
                ]
                char_color_legend = {}
                overlay = cropped_plate.copy()
                alpha = 0.4  # Opacity for the overlay
                thickness = 1  # Thin outline
                if "characters" in ocr_result:
                    for i, char in enumerate(ocr_result["characters"]):
                        color = color_palette[i % len(color_palette)]
                        char_label = char["class"]
                        char_color_legend[char_label] = color
                        x1c = int(char["x"] - char["width"] / 2)
                        y1c = int(char["y"] - char["height"] / 2)
                        x2c = int(char["x"] + char["width"] / 2)
                        y2c = int(char["y"] + char["height"] / 2)
                        cv2.rectangle(overlay, (x1c, y1c), (x2c, y2c), color, thickness)
                # Blend the overlay with the original cropped plate
                cv2.addWeighted(overlay, alpha, cropped_plate, 1 - alpha, 0, cropped_plate)
            else:
                print("[DEBUG] Using local OCR branch.")
                print("[INFO] Using local YOLO OCR for plate text recognition.")
                ocr_result = get_yolo_ocr_text(cropped_plate, character_detector)
                print(f"[DEBUG] Local OCR result: {ocr_result}")
            # Save each cropped plate image for debugging (after drawing color-coded character boxes)
            cropped_plate_path = os.path.join(result_folder, f"cropped_plate_{idx}.jpg")
            cv2.imwrite(cropped_plate_path, cropped_plate)

            plate_data = {
                "bounding_box": { "x1": float(x1), "y1": float(y1), "x2": float(x2), "y2": float(y2) },
                "confidence": float(conf) # <-- FIX: Add confidence to result
            }

            # Remove drawing of plate_text on the full annotated image (viz_img)
            # Draw the OCR text on the annotated image (above or inside the bounding box)
            plate_text = ocr_result.get("text") if "text" in ocr_result else "OCR_FAILED"
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.8
            font_thickness = 2
            text_color = (0, 255, 0) if plate_text != "OCR_FAILED" else (0, 0, 255)
            text = plate_text if plate_text else "OCR_FAILED"
            # Calculate text size and position
            (text_width, text_height), _ = cv2.getTextSize(text, font, font_scale, font_thickness)
            text_x = x1
            text_y = y1 - text_height - 5 # Position above the bounding box
            # cv2.putText(viz_img, text, (text_x, text_y), font, font_scale, text_color, font_thickness, cv2.LINE_AA)

            if "error" in ocr_result:
                plate_data["plate_text"] = "OCR_FAILED"
                plate_data["error_message"] = ocr_result["error"]
            else:
                plate_data["plate_text"] = ocr_result["text"]
            # Add char_color_legend to plate_data for frontend reference
            if ocr_mode == "roboflow" and 'char_color_legend' in locals():
                plate_data['char_color_legend'] = char_color_legend
            final_results.append(plate_data)

    # --- FIX: Save the annotated image ---
    annotated_img_path = os.path.join(result_folder, "plate_detection.jpg")
    cv2.imwrite(annotated_img_path, viz_img)
    annotated_image_url = f"/results/{result_id}/plate_detection.jpg"
    # Now log to MongoDB
    now = datetime.utcnow()
    for plate in final_results:
        detections_collection.insert_one({
            "type": "image",
            "plate": plate.get("plate_text", "OCR_FAILED"),
            "confidence": plate.get("confidence", 0), # This now works correctly
            "status": "Success" if plate.get("plate_text") and plate.get("plate_text") != "OCR_FAILED" else "Failed",
            "timestamp": now,
            "result_id": result_id # Link to the specific result folder
        })
        
    # --- FIX: Return the URL to the annotated image ---
    return {
        "results": final_results, 
        "result_id": result_id,
        "annotated_image_url": annotated_image_url
    }