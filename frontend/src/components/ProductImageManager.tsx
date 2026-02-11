import React, { useState, useRef } from 'react';
import { Upload, Star, Trash2, Edit, Move, Grid, Eye } from 'lucide-react';
import ImageCropper from './ImageCropper';

interface ProductImage {
  id: string;
  file?: File;
  url: string;
  isMain?: boolean;
  isExisting?: boolean;
  isNew?: boolean;
}

interface ProductImageManagerProps {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  onMainImageChange: (imageId: string) => void;
  maxImages?: number;
  aspectRatio?: number;
  allowCrop?: boolean;
}

const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  images,
  onImagesChange,
  onMainImageChange,
  maxImages = 10,
  aspectRatio,
  allowCrop = true
}) => {
  const [showCropper, setShowCropper] = useState(false);
  const [cropImage, setCropImage] = useState<{ src: string; file: File; imageId?: string } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      if (images.length >= maxImages) {
        alert(`Maximum ${maxImages} images allowed`);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        // Always add image directly without cropping first
        addImage(file, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addImage = (file: File, url: string) => {
    const newImage: ProductImage = {
      id: Date.now().toString(),
      file,
      url,
      isMain: images.length === 0, // First image is main by default
      isNew: true
    };

    const newImages = [...images, newImage];
    onImagesChange(newImages);

    if (newImage.isMain) {
      onMainImageChange(newImage.id);
    }
  };

  const handleCropComplete = (croppedBlob: Blob, croppedUrl: string) => {
    if (!cropImage) return;

    // Convert blob to file
    const croppedFile = new File([croppedBlob], cropImage.file.name, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    if (cropImage.imageId) {
      // Update existing image with cropped version
      const newImages = images.map(img => 
        img.id === cropImage.imageId 
          ? { ...img, file: croppedFile, url: croppedUrl }
          : img
      );
      onImagesChange(newImages);
    } else {
      // Add new cropped image
      addImage(croppedFile, croppedUrl);
    }
    
    setShowCropper(false);
    setCropImage(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropImage(null);
  };

  const removeImage = (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove?.isExisting) {
      // For existing images, we need to track them for removal in the main form
      // This would be handled by the parent component
    }

    const newImages = images.filter(img => img.id !== imageId);
    
    // If we removed the main image, set the first remaining image as main
    if (imageToRemove?.isMain && newImages.length > 0) {
      newImages[0].isMain = true;
      onMainImageChange(newImages[0].id);
    }

    onImagesChange(newImages);
  };

  const setMainImage = (imageId: string) => {
    const newImages = images.map(img => ({
      ...img,
      isMain: img.id === imageId
    }));
    onImagesChange(newImages);
    onMainImageChange(imageId);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    onImagesChange(newImages);
    setDraggedIndex(null);
  };

  const handleEditImage = (image: ProductImage) => {
    if (image.file) {
      setCropImage({ src: image.url, file: image.file, imageId: image.id });
      setShowCropper(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-sm text-gray-600 mb-2">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Upload images and use the edit button to crop them. Supports JPG, PNG, WebP up to 5MB
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          ref={fileInputRef}
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
        >
          Select Images
        </label>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Product Images ({images.length}/{maxImages})
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Grid className="w-3 h-3" />
              Drag to reorder
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="relative group cursor-move"
              >
                <div className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                  image.isMain ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}>
                  <img
                    src={image.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  
                  {/* Labels */}
                  {image.isMain && (
                    <span className="absolute top-1 left-1 px-2 py-1 bg-blue-600 text-white text-xs rounded font-semibold shadow-sm">
                      Main
                    </span>
                  )}
                  {image.isNew && (
                    <span className="absolute top-1 right-1 px-2 py-1 bg-green-600 text-white text-xs rounded shadow-sm">
                      New
                    </span>
                  )}
                  
                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {!image.isMain && (
                      <button
                        type="button"
                        onClick={() => setMainImage(image.id)}
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        title="Set as main image"
                      >
                        <Star className="w-3 h-3" />
                      </button>
                    )}
                    {allowCrop && image.file && (
                      <button
                        type="button"
                        onClick={() => handleEditImage(image)}
                        className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                        title="Edit/Crop image"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = image.url;
                        link.target = '_blank';
                        link.click();
                      }}
                      className="p-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                      title="View full size"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Drag Handle */}
                  <div className="absolute bottom-1 right-1 p-1 bg-white/80 rounded">
                    <Move className="w-3 h-3 text-gray-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && cropImage && (
        <ImageCropper
          src={cropImage.src}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={aspectRatio}
          fileName={cropImage.file.name}
        />
      )}
    </div>
  );
};

export default ProductImageManager;