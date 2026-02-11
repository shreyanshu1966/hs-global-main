import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RotateCw, Crop as CropIcon } from 'lucide-react';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImageBlob: Blob, croppedImageUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
  fileName?: string;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  minWidth = 150,
  minHeight = 150,
  fileName = 'cropped-image.jpg'
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  const [completedCrop, setCompletedCrop] = useState<PercentCrop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(0);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      setCrop({
        unit: '%',
        width: 80,
        height: 80,
        x: 10,
        y: 10
      });
    }
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;

    setIsProcessing(true);

    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      // Configure high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Handle rotation if needed
      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      // Convert to blob with high quality
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error('Failed to create blob');
          }
          const croppedImageUrl = URL.createObjectURL(blob);
          onCropComplete(blob, croppedImageUrl);
        },
        'image/jpeg',
        0.95 // High quality
      );
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, rotation, onCropComplete]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <CropIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Crop Image</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <ReactCrop
                crop={crop}
                onComplete={(c) => setCompletedCrop(c)}
                onChange={(c) => setCrop(c)}
                aspect={aspectRatio}
                minWidth={minWidth}
                minHeight={minHeight}
                className="max-w-full max-h-[60vh]"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={src}
                  style={{ transform: `rotate(${rotation}deg)` }}
                  onLoad={onImageLoad}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </ReactCrop>
            </div>

            {/* Crop Info */}
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
              Drag to select area to crop. Resize handles to adjust.
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
                Rotate 90°
              </button>
            </div>

            <div className="text-sm text-gray-600">
              Current rotation: {rotation}°
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={getCroppedImg}
              disabled={!completedCrop || isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Apply Crop
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;