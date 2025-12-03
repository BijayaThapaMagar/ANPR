"""
roboflow_ocr.py

Provides a function to perform OCR using a Roboflow-hosted model.
This can be used as a drop-in replacement for local YOLO character detection.

Instructions:
- Set your Roboflow API key, project, and version as environment variables:
    ROBOFLOW_API_KEY, ROBOFLOW_PROJECT, ROBOFLOW_VERSION
- You can use a .env file and python-dotenv, or set them in your shell.
- The function accepts a numpy image (cropped plate) and returns OCR results.
"""
import requests
import numpy as np
import cv2
import base64
import os

# --- Roboflow API Configuration (from environment variables) ---
ROBOFLOW_API_KEY = os.environ.get("ROBOFLOW_API_KEY")
ROBOFLOW_PROJECT = os.environ.get("ROBOFLOW_PROJECT")
ROBOFLOW_VERSION = os.environ.get("ROBOFLOW_VERSION")
print("[DEBUG] ROBOFLOW_API_KEY:", ROBOFLOW_API_KEY)
print("[DEBUG] ROBOFLOW_PROJECT:", ROBOFLOW_PROJECT)
print("[DEBUG] ROBOFLOW_VERSION:", ROBOFLOW_VERSION)

if not all([ROBOFLOW_API_KEY, ROBOFLOW_PROJECT, ROBOFLOW_VERSION]):
    raise RuntimeError(
        "Roboflow API configuration is missing. "
        "Please set ROBOFLOW_API_KEY, ROBOFLOW_PROJECT, and ROBOFLOW_VERSION as environment variables."
    )

# Example cURL equivalent:
# cat [YOUR_IMAGE_FILE] | base64 | curl -d @- "https://detect.roboflow.com/[MODEL_ID]/[VERSION_NUMBER]?api_key=[YOUR_API_KEY]"
ROBOFLOW_API_URL = f"https://detect.roboflow.com/{ROBOFLOW_PROJECT}/{ROBOFLOW_VERSION}?api_key={ROBOFLOW_API_KEY}"

def roboflow_ocr_text(image_np: np.ndarray) -> dict:
    """
    Performs OCR on a cropped plate image using a Roboflow-hosted model.
    Args:
        image_np (np.ndarray): Cropped plate image (BGR or RGB)
    Returns:
        dict: {"text": str, "characters": list} or {"error": str}
    """
    try:
        # Encode the image to JPG format and then to a base64 string
        _, img_encoded = cv2.imencode('.jpg', image_np)
        img_base64 = base64.b64encode(img_encoded).decode('utf-8')
        # Set the correct headers for the Roboflow API
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        # Send the request
        response = requests.post(ROBOFLOW_API_URL, data=img_base64, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        data = response.json()
        predictions = data.get("predictions", [])
        if not predictions:
            return {"text": "", "characters": []}
        predictions.sort(key=lambda p: p.get("x", 0))
        ocr_text = "".join([p.get("class", "") for p in predictions])
        return {"text": ocr_text, "characters": predictions}
    except requests.exceptions.HTTPError as http_err:
        return {"error": f"Roboflow API error: {http_err.response.status_code} {http_err.response.text}"}
    except Exception as e:
        return {"error": f"Exception in Roboflow OCR: {e}"}