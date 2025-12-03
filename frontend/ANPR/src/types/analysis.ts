// This file defines the data structures for your API responses.

// --- For Image Processing ---
export interface PlateVisualization {
  original: string;
  plateDetection: string;
  characterSegmentation: string | null;
}

export interface PlateDetection {
  plateNumber: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number; };
  processingTime?: number;
  visualization: PlateVisualization;
}

// --- For Video Processing (Updated) ---
// Represents the final result for a single recognized plate.
export interface RecognizedPlate {
    plate_text: string;
    confidence: number;
}

// The main object returned by the video processing API.
// It contains a 'recognized_plates' property which is a dictionary-like object.
// The keys are vehicle IDs (as strings), and the values are the recognized plate details.
export interface VideoAnalysisResults {
  recognized_plates: Record<string, RecognizedPlate>;
}
