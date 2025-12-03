# ANPR System (Automatic Number Plate Recognition)

## Project Overview

This project is a modern web application for Automatic Number Plate Recognition (ANPR). It allows users to upload images or videos, detects license plates using AI (YOLOv8), and performs OCR to extract plate numbers. The system provides real-time analytics, visualizations, and a user-friendly dashboard.

## Features

- Upload images or videos for license plate detection
- Real-time OCR and bounding box visualization
- Dashboard with analytics (inferences, confidence, failure rate, etc.)
- Modern, responsive UI with dark/light mode
- Error handling and notifications

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, shadcn-ui
- **Backend:** FastAPI (see ANPR-back1)
- **AI Models:** YOLOv8 for detection and OCR

## Setup Instructions

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd ANPR-front1/ANPR
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Run the development server:**
   ```sh
   npm run dev
   ```
4. **Access the app:**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

- Use the navigation bar to access the Dashboard, Image Processor, or Video Processor.
- Upload an image or video to process license plates.
- View results, analytics, and visualizations directly in the app.

## Folder Structure

```
ANPR-front1/ANPR/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Main app pages (Dashboard, ImageProcessor, etc.)
│   ├── lib/          # Utility functions
│   ├── hooks/        # Custom React hooks
│   ├── types/        # TypeScript types (if any)
│   └── main.jsx      # App entry point
├── index.html        # Main HTML file
├── package.json      # Project metadata and scripts
└── README.md         # Project documentation
```

## License

This project is licensed under the MIT License.
