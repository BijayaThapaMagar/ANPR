import cv2
import numpy as np
from ultralytics import YOLO
import os
import uuid
from collections import defaultdict

# This function will be imported into app.py
from image_ocr import get_yolo_ocr_text
from pymongo import MongoClient
from datetime import datetime
from roboflow_ocr import roboflow_ocr_text

# Toggle for OCR method
USE_ROBOFLOW_OCR = os.environ.get("USE_ROBOFLOW_OCR", "0") == "1"

mongo_uri = os.environ.get("MONGODB_URI", "mongodb://mongodb:27017/")
mongo_client = MongoClient(mongo_uri)
db = mongo_client["anpr_db"]
detections_collection = db["detections"]
def calculate_iou(boxA, boxB):
    """
    Calculates the Intersection over Union (IoU) of two bounding boxes.
    """
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0, xB - xA) * max(0, yB - yA)

    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    
    iou = interArea / float(boxAArea + boxBArea - interArea + 1e-6)
    
    return iou

def process_video_file(plate_detector, character_detector, video_path, ocr_mode=None):
    print(f"[DEBUG] OCR mode in backend: {ocr_mode}")
    """
    Processes a video file to track vehicles, find the top 5 best license plate shots for each,
    and perform OCR on each shot.
    """
    import shutil
    RESULTS_DIR = "results"
    os.makedirs(RESULTS_DIR, exist_ok=True)
    result_id = str(uuid.uuid4())
    result_folder = os.path.join(RESULTS_DIR, result_id)
    os.makedirs(result_folder, exist_ok=True)

    # Map YOLO class index to vehicle type
    class_map = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}

    vehicle_tracker = YOLO('yolov8n.pt') 
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {"error": "Could not open video file."}

    tracked_vehicles = {}
    vehicle_types = {}  # vehicle_id -> type
    frame_nmr = -1

    while True:
        frame_nmr += 1
        ret, frame = cap.read()
        if not ret:
            break

        # Stage 1: Track Vehicles
        vehicle_results = vehicle_tracker.track(frame, persist=True, classes=[2, 3, 5, 7])
        # Get class index for each vehicle
        if hasattr(vehicle_results[0].boxes, 'cls'):
            for box in vehicle_results[0].boxes:
                if box.id is not None:
                    vehicle_id = int(box.id[0])
                    class_idx = int(box.cls[0])
                    vehicle_types[vehicle_id] = class_map.get(class_idx, "unknown")

        # Stage 2: Detect Plates in the Same Frame
        plate_results = plate_detector(frame)

        num_vehicles = len(vehicle_results[0].boxes) if hasattr(vehicle_results[0].boxes, 'id') and vehicle_results[0].boxes.id is not None else 0
        num_plates = len(plate_results[0].boxes)

        if num_vehicles > 0 and num_plates > 0:
            for vehicle_box in vehicle_results[0].boxes:
                if vehicle_box.id is None:
                    continue
                vx1, vy1, vx2, vy2 = map(int, vehicle_box.xyxy[0])
                vehicle_id = int(vehicle_box.id[0])
                if vehicle_id not in tracked_vehicles:
                    tracked_vehicles[vehicle_id] = {'shots': []}
                for plate_box in plate_results[0].boxes:
                    px1, py1, px2, py2 = map(int, plate_box.xyxy[0])
                    iou = calculate_iou((vx1, vy1, vx2, vy2), (px1, py1, px2, py2))
                    if iou > 0.01:
                        confidence = float(plate_box.conf[0])
                        cropped_plate = frame[py1:py2, px1:px2]
                        current_shot = {
                            'image': cropped_plate,
                            'confidence': confidence,
                            'frame_number': frame_nmr,
                            'plate_box': (px1, py1, px2, py2)
                        }
                        tracked_vehicles[vehicle_id]['shots'].append(current_shot)
                        tracked_vehicles[vehicle_id]['shots'].sort(key=lambda x: x['confidence'], reverse=True)
                        tracked_vehicles[vehicle_id]['shots'] = tracked_vehicles[vehicle_id]['shots'][:5]
    cap.release()

    print("\n--- OCR Stage ---")
    final_results = []
    now = datetime.utcnow()
    for vehicle_id, data in tracked_vehicles.items():
        if not data['shots']:
            continue
        vehicle_info = {
            "vehicle_id": vehicle_id,
            "vehicle_type": vehicle_types.get(vehicle_id, "unknown"),
            "best_frames": []
        }
        print(f"  - Processing top {len(data['shots'])} shots for Vehicle ID {vehicle_id}")
        for idx, shot in enumerate(data['shots']):
            if shot['image'] is not None and shot['image'].size > 0:
                if ocr_mode == "roboflow":
                    print("[DEBUG] Using Roboflow OCR branch.")
                    print("[INFO] Using Roboflow OCR for plate text recognition.")
                    ocr_result = roboflow_ocr_text(shot['image'])
                    print(f"[DEBUG] Roboflow OCR result: {ocr_result}")
                else:
                    print("[DEBUG] Using local OCR branch.")
                    print("[INFO] Using local YOLO OCR for plate text recognition.")
                    ocr_result = get_yolo_ocr_text(shot['image'], character_detector)
                    print(f"[DEBUG] Local OCR result: {ocr_result}")
                plate_text = "OCR_FAILED"
                if "error" not in ocr_result and ocr_result['text']:
                    plate_text = ocr_result['text']
                px1, py1, px2, py2 = shot['plate_box']
                frame_details = {
                    "frame_info": shot['frame_number'],
                    "licence_plate_details": {
                        "confidence": shot['confidence'],
                        "bounding_box": {"x1": px1, "y1": py1, "x2": px2, "y2": py2}
                    },
                    "ocr_result": plate_text
                }
                vehicle_info["best_frames"].append(frame_details)
                # Save the best cropped plate image for this vehicle (only for the first shot)
                if idx == 0:
                    cropped_path = os.path.join(result_folder, f"vehicle_{vehicle_id}_best.jpg")
                    cv2.imwrite(cropped_path, shot['image'])
                    # Log only the best frame for each vehicle
                    detections_collection.insert_one({
                        "type": "video",
                        "plate": plate_text,
                        "confidence": shot.get("confidence", 0),
                        "status": "Success" if plate_text != "OCR_FAILED" else "Failed",
                        "timestamp": now
                    })
        if vehicle_info["best_frames"]:
            final_results.append(vehicle_info)
    os.remove(video_path)
    return {"tracked_vehicles": final_results, "result_id": result_id}