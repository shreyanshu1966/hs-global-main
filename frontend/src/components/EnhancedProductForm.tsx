import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Image as ImageIcon, Video } from 'lucide-react';
import ProductImageManager from '../components/ProductImageManager';
import ProductSpecsEditor from '../components/ProductSpecsEditor';
import ProductVideoManager from '../components/ProductVideoManager';
import { productService, type Category } from '../services/productService';

interface EnhancedProductFormProps {
  editingProduct?: any;
  onSave: (productData: any, images: any[], customSpecs: any[], video?: File | null) => Promise<void>;
  onCancel: () => void;
  onPreview: (productData: any, images: any[], video?: File | null) => Promise<void>;
  loading?: boolean;
  previewLoading?: boolean;
  uploadProgress?: { images: number; video: number };
}

interface ProductImage {
  id: string;
  file?: File;
  url: string;
  isMain?: boolean;
  isExisting?: boolean;
  isNew?: boolean;
}

interface VideoFile {
  file: File;
  url: string;
  size: number;
  duration?: number;
  isExisting?: boolean;
}

const EnhancedProductForm: React.FC<EnhancedProductFormProps> = ({
  editingProduct,
  onSave,
  onCancel,
  onPreview,
  loading = false,
  previewLoading = false,
  uploadProgress = { images: 0, video: 0 }
}) => {
  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    subcategory: '',
    description: '',
    priceINR: '',
    status: 'active',
    available: true,
    featured: false,
    furnitureSpecs: {} as any,
    discount: {
      enabled: false,
      percentage: 0,
      startDate: null,
      endDate: null,
      description: ''
    }
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [customSpecs, setCustomSpecs] = useState<any[]>([]);
  const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  const [video, setVideo] = useState<VideoFile | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  
  // Loading states for form submission
  const [validationLoading, setValidationLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Computed value to disable form during any loading state
  const isFormDisabled = validationLoading || formSubmitting || loading || previewLoading || videoUploading;

  // Load categories/subcategories dynamically from API (no hardcoded taxonomy).
  useEffect(() => {
    const loadDynamicCategories = async () => {
      try {
        const response = await productService.getCategories();
        if (!response.success || !Array.isArray(response.data)) {
          setAvailableSubcategories([]);
          return;
        }

        const furnitureCategory = (response.data as Category[]).find(
          (item) => String(item.category).toLowerCase() === 'furniture'
        );

        setAvailableSubcategories(furnitureCategory?.subcategories || []);
      } catch (error) {
        console.error('Failed to load categories for product form:', error);
        setAvailableSubcategories([]);
      }
    };

    loadDynamicCategories();
  }, []);

  // Initialize form when editing
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        productId: editingProduct.productId || '',
        name: editingProduct.name || '',
        subcategory: editingProduct.subcategory || '',
        description: editingProduct.description || '',
        priceINR: editingProduct.priceINR || '',
        status: editingProduct.status || 'active',
        available: editingProduct.available !== false,
        featured: editingProduct.featured || false,
        furnitureSpecs: editingProduct.furnitureSpecs || {},
        discount: editingProduct.discount || {
          enabled: false,
          percentage: 0,
          startDate: null,
          endDate: null,
          description: ''
        }
      });
      // Set existing images
      if (editingProduct.images && editingProduct.images.length > 0) {
        const existingImages = editingProduct.images.map((url: string, index: number) => ({
          id: `existing_${index}`,
          url,
          isMain: index === 0,
          isExisting: true
        }));
        setImages(existingImages);
      }

      // Set custom specs
      if (editingProduct.customSpecs) {
        setCustomSpecs(editingProduct.customSpecs);
      }

      // Legacy slabs records are edited as furniture with a custom subcategory.
      if (editingProduct.category === 'slabs' && editingProduct.subcategory) {
        setShowCustomSubcategory(true);
        setCustomSubcategory(editingProduct.subcategory);
      }

      // Set existing video
      if (editingProduct.hasVideo && editingProduct.videoUrl) {
        const existingVideoFile = new File([], editingProduct.videoFilename || 'video.mp4', {
          type: 'video/mp4'
        });
        setVideo({
          file: existingVideoFile,
          url: editingProduct.videoUrl,
          size: editingProduct.videoSize || 0,
          isExisting: true
        });
      }
    }
  }, [editingProduct]);

  useEffect(() => {
    if (!editingProduct?.subcategory || availableSubcategories.length === 0) return;

    const exists = availableSubcategories.includes(editingProduct.subcategory);
    if (!exists) {
      setShowCustomSubcategory(true);
      setCustomSubcategory(editingProduct.subcategory);
    }
  }, [editingProduct, availableSubcategories]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSpecsChange = (specs: any, customSpecsData?: any[]) => {
    setFormData(prev => ({ ...prev, furnitureSpecs: specs }));

    if (customSpecsData) {
      setCustomSpecs(customSpecsData);
    }
  };

  const handleSave = async () => {
    if (isFormDisabled) return; // Prevent double submission
    
    try {
      // Step 1: Validate form fields
      setValidationLoading(true);
      
      // Validate required fields
      const finalSubcategory = showCustomSubcategory ? customSubcategory.trim() : formData.subcategory;

      if (!formData.productId || !formData.name || !formData.description || !finalSubcategory) {
        alert('Please fill in all required fields (Product ID, Name, Subcategory, Description)');
        setValidationLoading(false);
        return;
      }

      if (images.length === 0) {
        alert('Please add at least one product image');
        setValidationLoading(false);
        return;
      }
      
      // Step 2: Prepare data for submission
      setValidationLoading(false);
      setFormSubmitting(true);

      // Prepare final form data
      const finalFormData = {
        productId: formData.productId,
        name: formData.name,
        category: 'furniture',
        subcategory: finalSubcategory,
        description: formData.description,
        priceINR: formData.priceINR ? parseFloat(formData.priceINR.toString()) : undefined,
        status: formData.status,
        available: formData.available,
        featured: formData.featured,
        furnitureSpecs: formData.furnitureSpecs,
        discount: formData.discount,
        hasVideo: !!video
      };

      // Extract video file (only if it's new, not existing)
      const videoFile = video && !video.isExisting ? video.file : null;

      // Step 3: Call parent's save function (parent's loading prop will handle upload progress)
      await onSave(finalFormData, images, customSpecs, videoFile);
      
      // If we reach here, save was successful
      // Parent will handle modal closing, so we just reset our internal state
      setFormSubmitting(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setFormSubmitting(false);
      alert('Failed to save product. Please try again.');
    }
  };

  const handlePreview = async () => {
    if (isFormDisabled) return; // Prevent double submission
    
    try {
      setValidationLoading(true);
      
      // Quick validation for preview
      if (!formData.name || !formData.description) {
        alert('Please fill in at least Product Name and Description for preview');
        return;
      }
      
      setValidationLoading(false);

      const finalSubcategory = showCustomSubcategory ? customSubcategory.trim() : formData.subcategory;
      
      const finalFormData = {
        productId: formData.productId,
        name: formData.name,
        category: 'furniture',
        subcategory: finalSubcategory,
        description: formData.description,
        priceINR: formData.priceINR ? parseFloat(formData.priceINR.toString()) : undefined,
        status: formData.status,
        available: formData.available,
        featured: formData.featured,
        furnitureSpecs: formData.furnitureSpecs,
        discount: formData.discount,
        hasVideo: !!video
      };

      // Extract video file (only if it's new, not existing)
      const videoFile = video && !video.isExisting ? video.file : null;

      await onPreview(finalFormData, images, videoFile);
    } catch (error) {
      console.error('Error previewing product:', error);
      alert('Failed to generate preview. Please try again.');
    } finally {
      setValidationLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200" style={{ height: '90vh', maxHeight: '800px' }}>
        
        {/* Form Loading Overlay */}
        {isFormDisabled && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 rounded-xl">
            <div className="bg-white p-8 rounded-lg shadow-2xl border-2 border-blue-100 max-w-md w-full mx-4">
              <div className="flex flex-col items-center space-y-4">
                {/* Animated Spinner */}
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full opacity-20 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Status Message */}
                <div className="text-center space-y-2">
                  <div className="text-xl font-semibold text-gray-900">
                    {validationLoading ? '🔍 Validating Form...' :
                     formSubmitting && !loading ? '📝 Preparing Submission...' :
                     loading && uploadProgress && (uploadProgress.images > 0 || uploadProgress.video > 0) ? '☁️ Uploading Media...' :
                     loading ? (editingProduct ? '💾 Updating Product...' : '✨ Creating Product...') :
                     previewLoading ? '👁️ Generating Preview...' :
                     videoUploading ? '🎬 Processing Video...' :
                     '⏳ Processing...'}
                  </div>
                  
                  {/* Progress Details */}
                  <div className="text-sm text-gray-600 space-y-1">
                    {validationLoading && (
                      <p>Checking required fields and data...</p>
                    )}
                    {formSubmitting && !loading && (
                      <p>Preparing product data for upload...</p>
                    )}
                    {loading && images.filter(img => img.file && !img.isExisting).length > 0 && (
                      <p>Uploading {images.filter(img => img.file && !img.isExisting).length} image(s){video && !video.isExisting ? ' and video' : ''}...</p>
                    )}
                    {loading && !formSubmitting && (
                      <p>{editingProduct ? 'Saving your changes...' : 'Creating your new product...'}</p>
                    )}
                    {previewLoading && (
                      <p>Building preview with current data...</p>
                    )}
                  </div>
                  
                  {/* Upload Progress Bars */}
                  {loading && uploadProgress && (uploadProgress.images > 0 || uploadProgress.video > 0) && (
                    <div className="w-full space-y-2 mt-4">
                      {uploadProgress.images > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Images</span>
                            <span>{Math.round(uploadProgress.images)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${uploadProgress.images}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {uploadProgress.video > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Video</span>
                            <span>{Math.round(uploadProgress.video)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${uploadProgress.video}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Warning Message */}
                  <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                    {(formSubmitting || loading) ? '⚠️ Please wait, this may take a few moments...' : '⚠️ Please do not close this window'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex-none p-6 border-b border-gray-200 flex justify-between items-center bg-white z-10 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900">
            {editingProduct ? 'Edit Product' : 'Create New Product'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 p-6 space-y-6 overflow-y-auto overscroll-contain custom-scrollbar">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingProduct || isFormDisabled}
                  value={formData.productId}
                  onChange={(e) => handleInputChange('productId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g., PROD001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isFormDisabled}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g., Marble Coffee Table"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                <select
                  required={!showCustomSubcategory}
                  value={showCustomSubcategory ? 'custom' : formData.subcategory}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setShowCustomSubcategory(true);
                      setCustomSubcategory('');
                    } else {
                      setShowCustomSubcategory(false);
                      handleInputChange('subcategory', e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Subcategory</option>
                  {availableSubcategories.map(sub => (
                    <option key={sub} value={sub}>
                      {sub.charAt(0).toUpperCase() + sub.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                  <option value="custom">➕ Add Custom Subcategory</option>
                </select>

                {showCustomSubcategory && (
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      value={customSubcategory}
                      onChange={(e) => setCustomSubcategory(e.target.value)}
                      placeholder="Enter custom subcategory"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (INR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.priceINR}
                  onChange={(e) => handleInputChange('priceINR', e.target.value)}
                  disabled={isFormDisabled}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Leave empty for 'Price on Request'"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isFormDisabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter product description..."
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => handleInputChange('available', e.target.checked)}
                  disabled={isFormDisabled}
                  className="w-4 h-4 text-blue-600 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700">Available for Sale</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  disabled={isFormDisabled}
                  className="w-4 h-4 text-blue-600 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700">Featured Product</span>
              </label>
            </div>
          </div>

          {/* Discount Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.discount.enabled}
                onChange={(e) => handleInputChange('discount.enabled', e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <label className="text-sm font-medium text-gray-700">
                Enable Discount
              </label>
            </div>

            {formData.discount.enabled && (
              <div className="space-y-4 ml-6">
                {/* Discount Percentage and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Percentage <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.discount.percentage}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          if (value >= 0 && value <= 100) {
                            handleInputChange('discount.percentage', value);
                          }
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formData.discount.enabled && formData.discount.percentage <= 0
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                          }`}
                        placeholder="e.g., 10"
                        required={formData.discount.enabled}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    {formData.discount.enabled && formData.discount.percentage <= 0 && (
                      <p className="mt-1 text-xs text-red-600">Percentage must be greater than 0</p>
                    )}
                    {formData.discount.percentage > 0 && formData.discount.percentage <= 100 && (
                      <p className="mt-1 text-xs text-green-600">✓ Valid discount percentage</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Description
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      value={formData.discount.description}
                      onChange={(e) => handleInputChange('discount.description', e.target.value)}
                      placeholder="e.g., Summer Sale, Limited Time Offer"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">{formData.discount.description.length}/200 characters</p>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.discount.startDate || ''}
                      onChange={(e) => handleInputChange('discount.startDate', e.target.value || null)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formData.discount.startDate && formData.discount.endDate &&
                          new Date(formData.discount.startDate) >= new Date(formData.discount.endDate)
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                        }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">Leave empty for immediate start</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.discount.endDate || ''}
                      onChange={(e) => handleInputChange('discount.endDate', e.target.value || null)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formData.discount.startDate && formData.discount.endDate &&
                          new Date(formData.discount.startDate) >= new Date(formData.discount.endDate)
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                        }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">Leave empty for no expiration</p>
                  </div>
                </div>

                {/* Date Validation Error */}
                {formData.discount.startDate && formData.discount.endDate &&
                  new Date(formData.discount.startDate) >= new Date(formData.discount.endDate) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">⚠️ Start date must be before end date</p>
                    </div>
                  )}

                {/* Discount Preview */}
                {formData.discount.percentage > 0 && formData.priceINR && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">💰 Discount Preview</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Original Price</p>
                        <p className="font-semibold text-gray-900">₹{parseInt(formData.priceINR).toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Discount</p>
                        <p className="font-semibold text-red-600">-{formData.discount.percentage}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Final Price</p>
                        <p className="font-semibold text-green-600">
                          ₹{Math.round(parseInt(formData.priceINR) * (1 - formData.discount.percentage / 100)).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">You Save</p>
                        <p className="font-semibold text-green-600">
                          ₹{Math.round(parseInt(formData.priceINR) * formData.discount.percentage / 100).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Discount Status */}
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      {(() => {
                        const now = new Date();
                        const startDate = formData.discount.startDate ? new Date(formData.discount.startDate) : null;
                        const endDate = formData.discount.endDate ? new Date(formData.discount.endDate) : null;

                        if (startDate && now < startDate) {
                          const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          return (
                            <p className="text-sm text-blue-700">
                              🟡 <strong>Scheduled:</strong> Discount will start in {daysUntil} day(s)
                            </p>
                          );
                        } else if (endDate && now > endDate) {
                          return (
                            <p className="text-sm text-red-700">
                              🔴 <strong>Expired:</strong> This discount has already ended
                            </p>
                          );
                        } else if (endDate) {
                          const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          const hoursRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60));

                          return (
                            <p className={`text-sm ${daysRemaining <= 3 ? 'text-red-700' : 'text-green-700'}`}>
                              🟢 <strong>Active:</strong> {daysRemaining <= 3
                                ? `Ending soon! ${hoursRemaining} hour(s) remaining`
                                : `${daysRemaining} day(s) remaining`}
                            </p>
                          );
                        } else {
                          return (
                            <p className="text-sm text-green-700">
                              🟢 <strong>Active:</strong> No expiration date (permanent discount)
                            </p>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Specifications */}
          <div className="space-y-4 border-t pt-4">
            <ProductSpecsEditor
              category={'furniture'}
              furnitureSpecs={formData.furnitureSpecs}
              slabSpecs={{}}
              customSpecs={customSpecs}
              onSpecsChange={handleSpecsChange}
            />
          </div>

          {/* Images Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Product Images <span className="text-red-500">*</span>
            </h3>
            <ProductImageManager
              images={images}
              onImagesChange={setImages}
              onMainImageChange={() => {}}
              aspectRatio={1}
              allowCrop={true}
              maxImages={10}
            />
            
            {/* Upload Progress for Images */}
            {uploadProgress.images > 0 && uploadProgress.images < 100 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm text-blue-700 mb-1">
                      <span>Uploading images...</span>
                      <span>{uploadProgress.images}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.images}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Video className="w-5 h-5" />
              Product Video
              <span className="text-sm font-normal text-gray-500">(Optional)</span>
            </h3>
            <p className="text-sm text-gray-600">
              Add a product video to showcase features and enhance customer engagement
            </p>
            <ProductVideoManager
              video={video}
              onVideoChange={(newVideo) => {
                setVideo(newVideo);
                if (newVideo && !newVideo.isExisting) {
                  setVideoUploading(true);
                  // Simulate upload completion after a delay
                  setTimeout(() => setVideoUploading(false), 1000);
                }
              }}
              disabled={loading || videoUploading}
              maxSize={100 * 1024 * 1024} // 100MB
            />
            
            {/* Upload Progress for Video */}
            {uploadProgress.video > 0 && uploadProgress.video < 100 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm text-purple-700 mb-1">
                      <span>Uploading video...</span>
                      <span>{uploadProgress.video}%</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.video}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {videoUploading && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-700 border-t-transparent"></div>
                  <span className="text-sm font-medium">Processing video...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-none border-t border-gray-200 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={isFormDisabled}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePreview}
              disabled={isFormDisabled}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {(previewLoading || validationLoading) && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <Eye className="w-4 h-4" />
              {previewLoading ? 'Previewing...' : validationLoading ? 'Validating...' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={isFormDisabled}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {(loading || videoUploading || formSubmitting || validationLoading) && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <Save className="w-4 h-4" />
              {validationLoading ? 'Validating...' :
               formSubmitting && !loading ? 'Preparing...' :
               loading && uploadProgress && (uploadProgress.images > 0 || uploadProgress.video > 0) ? 'Uploading...' :
               loading ? (editingProduct ? 'Updating...' : 'Creating...') :
               videoUploading ? 'Processing Video...' :
               (editingProduct ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductForm;