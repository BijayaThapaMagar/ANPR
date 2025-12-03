import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, File as FileIcon, Loader2, CheckCircle } from 'lucide-react';
import { toast } from "sonner";

// VisualizationSteps component
const VisualizationSteps = ({ resultId }) => {
  if (!resultId) return null;
  const baseUrl = `http://localhost:8000/results/${resultId}`;
  return (
    <div className="mb-6">
      <h4 className="font-semibold mb-2 text-foreground font-sparrow">Detected Plate(s)</h4>
      <img src={`${baseUrl}/plate_detection.jpg`} alt="Plate Detection" className="w-full rounded border" />
    </div>
  );
};

// Add a helper to convert [r,g,b] to CSS rgb string
const rgb = (arr) => `rgb(${arr[0]},${arr[1]},${arr[2]})`;

const ImageProcessor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultId, setResultId] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResults(null);
    setResultId(null);
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

  const processImage = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await fetch('http://localhost:8000/api/v1/process-image', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to process image');
      }
      const data = await response.json();
      setResults(data);
      setResultId(data.result_id || data.resultId || data.uuid || data.id || null);
      toast.success("Image processed successfully");
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error("Failed to process image. Make sure the backend is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine icon based on file type
  const fileIcon = selectedFile && selectedFile.type.startsWith('image')
    ? <ImageIcon className="h-6 w-6 text-primary" />
    : <FileIcon className="h-6 w-6 text-primary" />;

  return (
    <div className="min-h-screen w-full bg-graph-paper dark:bg-graph-paper-dark flex flex-col items-center py-8 px-2 font-sparrow">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 font-sparrow">Image License Plate Detection</h1>
        <p className="text-muted-foreground font-sparrow">Upload an image to detect and read license plates</p>
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
            aria-label="Choose or drop image file"
          >
            {selectedFile ? fileIcon : <Upload className="h-6 w-6 text-primary" />}
            <span className="font-semibold text-foreground font-sparrow text-center break-words truncate max-w-[180px]">
              {selectedFile ? selectedFile.name : (isDragActive ? 'Drop image here' : 'Click or drag image file')}
            </span>
            <input
              ref={inputRef}
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <div className="flex items-center justify-center md:justify-start w-full md:w-auto">
            <Button 
              onClick={processImage}
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
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-w-full max-h-96 mx-auto rounded-lg border font-sparrow"
            />
          </div>
        )}
      </div>
      {results && (
        <>
          <div className="backdrop-blur-xl bg-white/60 dark:bg-[#232526]/60 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 mb-8 w-full max-w-6xl transition font-sparrow">
            <VisualizationSteps resultId={resultId} />
            {results.results && results.results.length > 0 ? (
              <div className="space-y-6">
                {results.results.map((plate, index) => {
                  const croppedUrl = resultId
                    ? `http://localhost:8000/results/${resultId}/cropped_plate_${index}.jpg`
                    : null;
                  return (
                    <div key={index} className="p-4 border border-white/30 dark:border-[#444]/30 rounded-xl shadow-[0_4px_24px_0_rgba(31,38,135,0.10)] bg-white/60 dark:bg-[#232526]/60 backdrop-blur font-sparrow mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-semibold text-primary font-sparrow">Plate {index + 1}</span>
                      </div>
                      
                      {/* Side by side layout for detected plate and cropped plate */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left side - Detected plate container */}
                        <div className="space-y-3">
                          <h5 className="font-semibold text-foreground font-sparrow">Detected Plate Container</h5>
                          <div className="p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
                            <p className="font-mono text-lg text-foreground font-sparrow mb-2">
                              OCR Text: <span className="text-primary font-bold">{plate.plate_text || 'N/A'}</span>
                            </p>
                            <p className="text-sm text-muted-foreground font-sparrow">
                              Bounding Box: X1: {plate.bounding_box?.x1?.toFixed(1) || 'N/A'}, Y1: {plate.bounding_box?.y1?.toFixed(1) || 'N/A'}, X2: {plate.bounding_box?.x2?.toFixed(1) || 'N/A'}, Y2: {plate.bounding_box?.y2?.toFixed(1) || 'N/A'}
                            </p>
                            {plate.confidence && (
                              <p className="text-sm text-muted-foreground font-sparrow">
                                Confidence: <span className="text-primary font-semibold">{plate.confidence.toFixed(2)}%</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right side - Cropped license plate */}
                        <div className="space-y-3">
                          <h5 className="font-semibold text-foreground font-sparrow">Cropped License Plate</h5>
                          {croppedUrl ? (
                            <div className="flex flex-col items-center">
                              <img 
                                src={croppedUrl} 
                                alt={`Cropped Plate ${index + 1}`} 
                                className="w-full max-w-xs rounded-lg border shadow-sm" 
                              />
                              {/* Color legend below the cropped plate image */}
                              {plate.char_color_legend && (
                                <div className="mt-3 p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
                                  <p className="text-sm font-semibold text-foreground font-sparrow mb-2">Character Color Legend:</p>
                                  <div className="flex flex-wrap justify-center gap-3">
                                    {Object.entries(plate.char_color_legend).map(([char, color], idx) => (
                                      <div key={idx} className="flex items-center gap-2">
                                        <span
                                          style={{
                                            display: "inline-block",
                                            width: 16,
                                            height: 16,
                                            background: rgb(color),
                                            border: "1px solid #333",
                                            borderRadius: 3,
                                          }}
                                        />
                                        <span className="text-sm font-bold text-foreground font-sparrow">{char}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-32 bg-muted/50 dark:bg-muted/20 rounded-lg">
                              <p className="text-muted-foreground font-sparrow">Cropped image not available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground font-sparrow">No license plates detected</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageProcessor;