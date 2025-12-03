# ANPR System Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Backend Documentation](#backend-documentation)
3. [Frontend Documentation](#frontend-documentation)
4. [Installation & Setup](#installation--setup)
5. [API Reference](#api-reference)
6. [Features & Capabilities](#features--capabilities)
7. [Architecture](#architecture)
8. [Usage Examples](#usage-examples)

---

## System Overview

The ANPR (Automatic Number Plate Recognition) system is a comprehensive solution for detecting and recognizing license plates from images and videos using advanced AI models. The system consists of a FastAPI backend with YOLO-based detection models and a React frontend with a modern, glassmorphic UI.

### Key Features

- **Image Processing**: Single image license plate detection and OCR
- **Video Processing**: Multi-vehicle tracking with best frame selection
- **Real-time Analytics**: Dashboard with performance metrics and statistics
- **Dual OCR Support**: Local YOLO OCR and Roboflow cloud OCR
- **Modern UI**: Glassmorphic design with dark/light theme support
- **MongoDB Integration**: Persistent storage of detection results

---

## Backend Documentation

### Technology Stack

- **Framework**: FastAPI (Python)
- **AI Models**: YOLOv8 (Ultralytics)
- **Database**: MongoDB
- **OCR**: Local YOLO + Roboflow API
- **Image Processing**: OpenCV
- **Dependencies**: See `requirements.txt`

### Core Components

#### 1. Main Application (`app.py`)

**Features:**

- FastAPI application with CORS middleware
- Static file serving for result images
- Health check endpoint
- Model loading and management
- API route definitions

**Key Endpoints:**

- `GET /` - Health check
- `POST /api/v1/process-image` - Image processing
- `POST /api/v1/process-video` - Video processing
- `GET /api/v1/stats` - System statistics
- `GET /api/v1/recent-detections` - Recent detection history

#### 2. Image Processing (`image_ocr.py`)

**Features:**

- License plate detection using YOLO model
- Character recognition (OCR) on cropped plates
- Support for both local YOLO OCR and Roboflow OCR
- Result visualization with bounding boxes
- MongoDB logging of detection results

**Processing Pipeline:**

1. Load and preprocess input image
2. Detect license plates using YOLO detector
3. Crop detected plate regions
4. Perform OCR on cropped plates
5. Generate annotated result images
6. Store results in MongoDB
7. Return detection data and image URLs

#### 3. Video Processing (`video_ocr.py`)

**Features:**

- Multi-vehicle tracking using YOLOv8
- License plate detection per frame
- Best frame selection for each vehicle
- IoU-based plate-vehicle association
- Top 5 best shots per vehicle

**Processing Pipeline:**

1. Load video file
2. Track vehicles across frames
3. Detect license plates in each frame
4. Associate plates with vehicles using IoU
5. Select best quality shots per vehicle
6. Perform OCR on best shots
7. Return vehicle tracking results

#### 4. Roboflow OCR Integration (`roboflow_ocr.py`)

**Features:**

- Cloud-based OCR using Roboflow API
- Configurable via environment variables
- Fallback to local OCR if needed
- Character-level detection with confidence scores

**Configuration:**

```bash
ROBOFLOW_API_KEY=your_api_key
ROBOFLOW_PROJECT=your_project
ROBOFLOW_VERSION=your_version
USE_ROBOFLOW_OCR=1
```

### Database Schema

#### Detections Collection

```javascript
{
  "_id": ObjectId,
  "type": "image" | "video",
  "plate": "string", // OCR result
  "confidence": "number", // Detection confidence
  "status": "Success" | "Failed",
  "timestamp": "datetime",
  "result_id": "string" // Links to result folder
}
```

### Model Architecture

#### License Plate Detector

- **Model**: Custom YOLOv8 model (`license_plate_detector.pt`)
- **Purpose**: Detect license plate regions in images
- **Output**: Bounding boxes with confidence scores

#### Character Detector

- **Model**: Custom YOLOv8 model (`character_detector.pt`)
- **Purpose**: Recognize individual characters in cropped plates
- **Output**: Character-level bounding boxes and classifications

#### Vehicle Tracker

- **Model**: YOLOv8n (`yolov8n.pt`)
- **Purpose**: Track vehicles across video frames
- **Classes**: Car, Motorcycle, Bus, Truck

---

## Frontend Documentation

### Technology Stack

- **Framework**: React 18 with Vite
- **UI Library**: Custom components with shadcn/ui
- **Styling**: Tailwind CSS with glassmorphic design
- **Charts**: Recharts for data visualization
- **Routing**: React Router DOM
- **State Management**: React Query + useState
- **Notifications**: Sonner toast notifications

### Core Components

#### 1. Main Application (`App.jsx`)

**Features:**

- React Query provider for data fetching
- Tooltip provider for enhanced UX
- Browser router for navigation
- Toast notifications system
- Responsive layout with navbar

#### 2. Navigation System (`nav-items.jsx`)

**Routes:**

- `/` - Home/Landing page
- `/dashboard` - Analytics dashboard
- `/image-processor` - Image processing interface
- `/video-processor` - Video processing interface

#### 3. Dashboard (`Dashboard.jsx`)

**Features:**

- Real-time backend status monitoring
- System statistics and KPIs
- Interactive charts and visualizations
- Recent detections table
- System information display

**Charts & Metrics:**

- Daily inference activity (Bar chart)
- Confidence distribution (Horizontal bar chart)
- Processing time trends (Line chart)
- Model performance metrics
- Recent detections table

**Status Monitoring:**

- Backend health check every 30 seconds
- Visual status indicators
- Error handling and user feedback

#### 4. Image Processor (`ImageProcessor.jsx`)

**Features:**

- Drag-and-drop file upload
- Image preview functionality
- Real-time processing status
- Result visualization with annotated images
- Cropped plate display
- OCR text and confidence display

**UI Elements:**

- Glassmorphic upload zone
- Processing progress indicators
- Side-by-side result comparison
- Color-coded confidence indicators

#### 5. Video Processor (`VideoProcessor.jsx`)

**Features:**

- Video file upload and preview
- Vehicle tracking results display
- Best frame selection visualization
- Vehicle type classification
- OCR results per vehicle

**Result Display:**

- Vehicle ID and type
- Best OCR result with confidence
- Frame number information
- Cropped plate images

#### 6. Landing Page (`Index.jsx`)

**Features:**

- Hero section with call-to-action
- Feature highlights and statistics
- Responsive design with animations
- Direct navigation to processors

#### 7. Theme System (`ThemeToggle.jsx`)

**Features:**

- Light/dark mode toggle
- Persistent theme storage
- Smooth transitions
- System preference detection

### UI Design System

#### Glassmorphic Design

- **Background**: Semi-transparent overlays
- **Borders**: Subtle white/dark borders
- **Shadows**: Layered shadow effects
- **Blur**: Backdrop blur for depth

#### Color Scheme

- **Primary**: Blue accent colors
- **Secondary**: Complementary colors
- **Success**: Green indicators
- **Error**: Red indicators
- **Warning**: Yellow/orange indicators

#### Typography

- **Font**: Custom Sparrow font family
- **Weights**: Regular, medium, semibold, bold
- **Sizes**: Responsive text scaling

---

## Installation & Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB 7.0+
- Git

### Backend Setup

```bash
# Clone repository
git clone <repository-url>
cd ANPR_/anpr-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB
brew services start mongodb-community@7.0  # macOS
# or equivalent for your OS

# Run backend
uvicorn app:app --reload
```

### Frontend Setup

```bash
cd anpr-frontend/ANPR

# Install dependencies
npm install

# Start development server
npm run dev
```

### Quick Start Script

```bash
# Use the provided startup script
chmod +x run_all.sh
./run_all.sh
```

---

## API Reference

### Base URL

```
http://localhost:8000
```

### Endpoints

#### Health Check

```http
GET /
```

**Response:**

```json
{
  "status": "ANPR Backend is running."
}
```

#### Process Image

```http
POST /api/v1/process-image
Content-Type: multipart/form-data
```

**Request:** Form data with image file
**Response:**

```json
{
  "results": [
    {
      "bounding_box": {
        "x1": 100.0,
        "y1": 200.0,
        "x2": 300.0,
        "y2": 250.0
      },
      "confidence": 0.95,
      "plate_text": "ABC123",
      "char_color_legend": {}
    }
  ],
  "result_id": "uuid-string",
  "annotated_image_url": "/results/uuid/plate_detection.jpg"
}
```

#### Process Video

```http
POST /api/v1/process-video
Content-Type: multipart/form-data
```

**Request:** Form data with video file
**Response:**

```json
{
  "tracked_vehicles": [
    {
      "vehicle_id": 1,
      "vehicle_type": "car",
      "best_frames": [
        {
          "frame_info": 150,
          "licence_plate_details": {
            "confidence": 0.92,
            "bounding_box": {
              "x1": 100.0,
              "y1": 200.0,
              "x2": 300.0,
              "y2": 250.0
            }
          },
          "ocr_result": "XYZ789"
        }
      ]
    }
  ],
  "result_id": "uuid-string"
}
```

#### Get Statistics

```http
GET /api/v1/stats
```

**Response:**

```json
{
  "totalInferences": 1234,
  "avgConfidence": 87.5,
  "ocrFailureRate": 12.3,
  "avgProcessingTime": 145
}
```

#### Get Recent Detections

```http
GET /api/v1/recent-detections
```

**Response:**

```json
[
  {
    "plate": "ABC123",
    "confidence": 94.5,
    "status": "Success",
    "timestamp": "2024-01-15 14:30:22"
  }
]
```

---

## Features & Capabilities

### Image Processing Features

- **Multi-Plate Detection**: Detect multiple license plates in single image
- **High Accuracy**: YOLO-based detection with confidence scoring
- **OCR Integration**: Dual OCR support (local + cloud)
- **Result Visualization**: Annotated images with bounding boxes
- **Character-Level Detection**: Individual character recognition
- **Error Handling**: Graceful failure handling and user feedback

### Video Processing Features

- **Vehicle Tracking**: Persistent vehicle tracking across frames
- **Best Frame Selection**: Automatic selection of clearest plate shots
- **Multi-Vehicle Support**: Process multiple vehicles simultaneously
- **Frame Analysis**: Detailed frame-by-frame analysis
- **Vehicle Classification**: Car, motorcycle, bus, truck detection
- **IoU Association**: Intelligent plate-vehicle association

### Analytics Features

- **Real-time Monitoring**: Live backend status checking
- **Performance Metrics**: Processing time, accuracy, failure rates
- **Data Visualization**: Interactive charts and graphs
- **Historical Data**: Recent detection history
- **System Statistics**: Comprehensive system overview

### UI/UX Features

- **Responsive Design**: Mobile-first responsive layout
- **Dark/Light Theme**: Toggleable theme system
- **Glassmorphic Design**: Modern glass-like interface
- **Drag & Drop**: Intuitive file upload system
- **Real-time Feedback**: Live processing status updates
- **Error Handling**: User-friendly error messages

### Security Features

- **CORS Configuration**: Secure cross-origin requests
- **File Validation**: Input file type and size validation
- **Error Sanitization**: Safe error message handling
- **Environment Variables**: Secure configuration management

---

## Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   AI Models     │    │   Detection     │
│   - Dashboard   │    │   - YOLO        │    │   Results       │
│   - Processors  │    │   - OCR         │    │   - Statistics  │
│   - Analytics   │    │   - Tracking    │    │   - History     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

#### Image Processing Flow

1. User uploads image via frontend
2. Frontend sends image to backend API
3. Backend processes image with YOLO detector
4. Detected plates are cropped and OCR processed
5. Results are stored in MongoDB
6. Annotated images are saved to file system
7. Results are returned to frontend
8. Frontend displays results with visualizations

#### Video Processing Flow

1. User uploads video via frontend
2. Frontend sends video to backend API
3. Backend loads video and initializes tracking
4. Each frame is processed for vehicle detection
5. License plates are detected and associated with vehicles
6. Best frames are selected for each vehicle
7. OCR is performed on best shots
8. Results are stored and returned to frontend
9. Frontend displays vehicle tracking results

### File Structure

```
ANPR_/
├── anpr-backend/
│   ├── app.py                 # Main FastAPI application
│   ├── image_ocr.py           # Image processing logic
│   ├── video_ocr.py           # Video processing logic
│   ├── roboflow_ocr.py        # Cloud OCR integration
│   ├── models/                # AI model files
│   ├── results/               # Generated result images
│   ├── temp/                  # Temporary files
│   └── requirements.txt       # Python dependencies
├── anpr-frontend/
│   └── ANPR/
│       ├── src/
│       │   ├── pages/         # Main page components
│       │   ├── components/    # Reusable UI components
│       │   ├── App.jsx        # Main application
│       │   └── nav-items.jsx  # Navigation configuration
│       └── package.json       # Node.js dependencies
└── run_all.sh                 # Development startup script
```

---

## Usage Examples

### Processing a Single Image

1. Navigate to `/image-processor`
2. Drag and drop or click to select an image
3. Click "Process" button
4. View results with annotated image and OCR text
5. Download or share results

### Processing a Video

1. Navigate to `/video-processor`
2. Upload a video file
3. Wait for processing to complete
4. Review vehicle tracking results
5. Examine best frame selections for each vehicle

### Monitoring System Performance

1. Navigate to `/dashboard`
2. View real-time system statistics
3. Monitor backend status
4. Analyze performance trends
5. Review recent detections

### API Integration

```javascript
// Process image via API
const formData = new FormData();
formData.append("file", imageFile);

const response = await fetch("http://localhost:8000/api/v1/process-image", {
  method: "POST",
  body: formData,
});

const results = await response.json();
console.log("Detection results:", results);
```

---

## Troubleshooting

### Common Issues

#### Backend Not Starting

- Check MongoDB is running
- Verify Python dependencies are installed
- Check port 8000 is available
- Review error logs in terminal

#### Model Loading Errors

- Ensure model files exist in `models/` directory
- Check file permissions
- Verify model file integrity

#### Frontend Connection Issues

- Confirm backend is running on port 8000
- Check CORS configuration
- Verify network connectivity

#### OCR Failures

- Check image quality and lighting
- Verify license plate is clearly visible
- Review OCR configuration settings
- Check Roboflow API credentials if using cloud OCR

### Performance Optimization

- Use GPU acceleration for YOLO models
- Optimize image resolution for processing
- Implement caching for repeated requests
- Monitor memory usage during video processing

### Security Considerations

- Validate all input files
- Implement rate limiting
- Secure API endpoints
- Regular security updates
- Monitor system logs

---

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards

- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React
- Write comprehensive tests
- Document new features
- Update documentation as needed

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

For support and questions:

- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

---

_Last updated: January 2024_
