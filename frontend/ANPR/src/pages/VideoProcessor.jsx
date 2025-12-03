import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Video as VideoIcon, File as FileIcon, Loader2, Car, CheckCircle } from 'lucide-react';
import { toast } from "sonner";

const VideoProcessor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResults(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) handleFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const openFileDialog = () => {
    inputRef.current.click();
  };

  const processVideo = async () => {
    if (!selectedFile) {
      toast.error("Please select a video first");
      return;
    }
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await fetch('http://localhost:8000/api/v1/process-video', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to process video');
      }
      const data = await response.json();
      setResults(data);
      toast.success("Video processed successfully");
    } catch (error) {
      console.error('Error processing video:', error);
      toast.error("Failed to process video. Make sure the backend is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine icon based on file type
  const fileIcon = selectedFile && selectedFile.type.startsWith('video')
    ? <VideoIcon className="h-6 w-6 text-primary" />
    : <FileIcon className="h-6 w-6 text-primary" />;

  return (
    <div className="min-h-screen w-full bg-graph-paper dark:bg-graph-paper-dark flex flex-col items-center py-8 px-2 font-sparrow">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 font-sparrow">Video License Plate Detection</h1>
        <p className="text-muted-foreground font-sparrow">Upload a video to track vehicles and detect license plates</p>
      </div>
      <div className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 mb-8 w-full max-w-2xl transition font-sparrow">
        <div className="flex flex-col md:flex-row items-stretch gap-4 mb-4 w-full">
          {/* Drag-and-drop glassmorphic dropzone */}
          <div
            className={`flex flex-row items-center justify-center gap-2 flex-1 min-h-[80px] md:min-h-[56px] rounded-xl cursor-pointer select-none transition border-2 border-dashed ${isDragActive ? 'border-primary bg-primary/10' : 'border-white/30 dark:border-[#444]/30 bg-white/70 dark:bg-[#232526]/70'} backdrop-blur-lg shadow w-full md:w-auto`}
            onClick={openFileDialog}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            tabIndex={0}
            role="button"
            aria-label="Choose or drop video file"
          >
            {selectedFile ? fileIcon : <Upload className="h-6 w-6 text-primary" />}
            <span className="font-semibold text-foreground font-sparrow text-center break-words truncate max-w-[180px]">
              {selectedFile ? selectedFile.name : (isDragActive ? 'Drop video here' : 'Click or drag video file')}
            </span>
            <input
              ref={inputRef}
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <div className="flex items-center justify-center md:justify-start w-full md:w-auto">
            <Button 
              onClick={processVideo}
              disabled={!selectedFile || isProcessing}
              className="min-w-[120px] h-[56px] md:h-full backdrop-blur bg-white/60 dark:bg-[#232526]/60 text-foreground rounded-lg hover:bg-white/80 dark:hover:bg-[#232526]/80 border border-white/30 dark:border-[#444]/30 font-sparrow shadow-[0_2px_12px_0_rgba(31,38,135,0.10)]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                  Process
                </>
              )}
            </Button>
          </div>
        </div>
        {previewUrl && (
          <div className="mt-4">
            <video 
              src={previewUrl} 
              controls 
              className="max-w-full max-h-96 mx-auto rounded-lg border font-sparrow"
            />
          </div>
        )}
      </div>
      {results && (
        <div className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 mb-8 w-full max-w-2xl transition font-sparrow">
          <div className="text-xl font-bold text-foreground mb-4 font-sparrow">Detection Results</div>
          {results.tracked_vehicles && results.tracked_vehicles.length > 0 ? (
            <div className="space-y-6">
              {results.tracked_vehicles.map((vehicle, index) => {
                const best = vehicle.best_frames[0]; // Only the best shot
                const bbox = best.licence_plate_details.bounding_box;
                const croppedUrl = results.result_id
                  ? `http://localhost:8000/results/${results.result_id}/vehicle_${vehicle.vehicle_id}_best.jpg`
                  : null;
                return (
                  <div key={index} className="p-4 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_4px_24px_0_rgba(31,38,135,0.10)] bg-white/60 dark:bg-[#232526]/60 backdrop-blur font-sparrow mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground font-sparrow">Vehicle {vehicle.vehicle_id}</h3>
                      <span className="ml-2 px-2 py-1 rounded bg-muted text-xs font-semibold border border-white/30 dark:border-[#444]/30 text-muted-foreground font-sparrow">
                        {vehicle.vehicle_type ? vehicle.vehicle_type.charAt(0).toUpperCase() + vehicle.vehicle_type.slice(1) : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div>
                        <p className="font-mono text-lg text-foreground font-sparrow">OCR: {best.ocr_result || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground font-sparrow">
                          Confidence: {best.licence_plate_details.confidence ? `${(best.licence_plate_details.confidence * 100).toFixed(1)}%` : 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground font-sparrow">
                          Frame: {best.frame_info}
                        </p>
                      </div>
                    </div>
                    {croppedUrl && (
                      <div className="mt-4">
                        <img src={croppedUrl} alt="Best Plate" className="w-48 rounded border mx-auto font-sparrow" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground font-sparrow">No vehicles or license plates detected</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoProcessor;