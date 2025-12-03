from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import uuid
import os
import shutil
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

# --- Local Imports ---
from image_ocr import process_image_file, detections_collection as image_detections_collection
from video_ocr import process_video_file, detections_collection as video_detections_collection

# --- Configuration ---
PLATE_DETECTOR_PATH = "./models/license_plate_detector.pt"
CHARACTER_DETECTOR_PATH = "./models/character_detector.pt"
TEMP_DIR = "temp"
RESULTS_DIR = "results"
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

app = FastAPI(title="ANPR System")

# --- CORS Middleware ---
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mount Static Directory to Serve Result Images ---
app.mount("/results", StaticFiles(directory=RESULTS_DIR), name="results")

# --- Load Models ---
try:
    plate_detector = YOLO(PLATE_DETECTOR_PATH)
    character_detector = YOLO(CHARACTER_DETECTOR_PATH)
    print("✅ All models loaded successfully.")
except Exception as e:
    plate_detector, character_detector = None, None
    print(f"❌ ERROR: Error loading models: {e}")

OCR_MODE_FILE = "ocr_mode.txt"
def get_ocr_mode():
    try:
        with open(OCR_MODE_FILE, "r") as f:
            return f.read().strip()
    except Exception:
        return "local"
def set_ocr_mode(mode):
    with open(OCR_MODE_FILE, "w") as f:
        f.write(mode)
# Ensure file exists
if not os.path.exists(OCR_MODE_FILE):
    set_ocr_mode("local")

# --- API Endpoints ---
@app.get("/")
def read_root():
    """Root endpoint to confirm the API is active."""
    return {"status": "ANPR Backend is running."}

@app.post("/api/v1/process-image")
async def process_image_endpoint(file: UploadFile = File(...)):
    """API endpoint to process a single image for ANPR."""
    if not plate_detector or not character_detector:
        raise HTTPException(status_code=503, detail="A required model is not loaded.")
    contents = await file.read()
    ocr_mode = get_ocr_mode()
    return process_image_file(plate_detector, character_detector, contents, file.filename, ocr_mode=ocr_mode)

@app.post("/api/v1/process-video")
async def process_video_endpoint(file: UploadFile = File(...)):
    """API endpoint to process a video file for ANPR."""
    if not plate_detector or not character_detector:
        raise HTTPException(status_code=503, detail="A required model is not loaded.")
    
    temp_video_path = os.path.join(TEMP_DIR, f"{uuid.uuid4()}_{file.filename}")
    try:
        with open(temp_video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        ocr_mode = get_ocr_mode()
        return process_video_file(plate_detector, character_detector, temp_video_path, ocr_mode=ocr_mode)
    finally:
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)

@app.get("/api/v1/stats")
def get_stats():
    """Endpoint to get statistics about detections."""
    # Use either detections_collection (from image or video processor, they are the same DB)
    collection = image_detections_collection
    total = collection.count_documents({})
    avg_conf = collection.aggregate([{"$group": {"_id": None, "avg": {"$avg": "$confidence"}}}])
    avg_conf = next(avg_conf, {}).get("avg", 0)
    ocr_failures = collection.count_documents({"status": "Failed"})
    avg_proc = 127  # Optionally, log and calculate this
    fail_rate = (ocr_failures / total * 100) if total else 0
    return {
        "totalInferences": total,
        "avgConfidence": round(avg_conf, 2),
        "ocrFailureRate": round(fail_rate, 2),
        "avgProcessingTime": avg_proc
    }

@app.get("/api/v1/recent-detections")
def get_recent_detections():
    """Endpoint to get the most recent detections."""
    collection = image_detections_collection
    # Get last 5 detections, most recent first
    detections = list(collection.find().sort("timestamp", -1).limit(5))
    # Convert MongoDB ObjectId and datetime to string
    for d in detections:
        d["timestamp"] = d["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
        d.pop("_id", None)
    return detections

@app.get("/api/v1/ocr-mode")
def get_ocr_mode_endpoint():
    return {"ocr_mode": get_ocr_mode()}

@app.post("/api/v1/ocr-mode")
async def set_ocr_mode_endpoint(request: Request):
    data = await request.json()
    mode = data.get("ocr_mode")
    if mode not in ["local", "roboflow"]:
        raise HTTPException(status_code=400, detail="Invalid OCR mode")
    set_ocr_mode(mode)
    return {"ocr_mode": mode}
