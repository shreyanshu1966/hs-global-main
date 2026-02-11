import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Image as ImageIcon } from 'lucide-react';
import ProductImageManager from '../components/ProductImageManager';
import ProductSpecsEditor from '../components/ProductSpecsEditor';

interface EnhancedProductFormProps {
  editingProduct?: any;
  onSave: (productData: any, images: any[], customSpecs: any[]) => Promise<void>;
  onCancel: () => void;
  onPreview: (productData: any, images: any[]) => Promise<void>;
  loading?: boolean;
  previewLoading?: boolean;
}

interface ProductImage {
  id: string;
  file?: File;
  url: string;
  isMain?: boolean;
  isExisting?: boolean;
  isNew?: boolean;
}

const EnhancedProductForm: React.FC<EnhancedProductFormProps> = ({
  editingProduct,
  onSave,
  onCancel,
  onPreview,
  loading = false,
  previewLoading = false
}) => {
  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    category: 'furniture',
    subcategory: '',
    description: '',
    priceINR: '',
    status: 'active',
    available: true,
    featured: false,
    dimensions: {
      length: '',
      width: '',
      height: '',
      unit: 'cm'
    },
    weight: '',
    furnitureSpecs: {} as any,
    slabSpecs: {} as any,
    discount: {
      enabled: false,
      percentage: 0,
      startDate: null,
      endDate: null,
      description: ''
    }
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [mainImageId, setMainImageId] = useState<string>('');
  const [customSpecs, setCustomSpecs] = useState<any[]>([]);
  const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
  const [customSubcategory, setCustomSubcategory] = useState('');

  // Predefined subcategories
  const subcategories = {
    furniture: [
      'tables', 'coffee-table', 'console-table', 'dining-table', 'side-table',
      'wash-basins', 'pedestal', 'countertop', 'sculptures', 'benches',
      'planters', 'fountains', 'fireplace', 'columns', 'urns', 'other'
    ],
    slabs: [
      'granite', 'marble', 'quartzite', 'onyx', 'limestone',
      'travertine', 'sandstone', 'slate', 'other'
    ]
  };

  // Initialize form when editing
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        productId: editingProduct.productId || '',
        name: editingProduct.name || '',
        category: editingProduct.category || 'furniture',
        subcategory: editingProduct.subcategory || '',
        description: editingProduct.description || '',
        priceINR: editingProduct.priceINR || '',
        status: editingProduct.status || 'active',
        available: editingProduct.available !== false,
        featured: editingProduct.featured || false,
        dimensions: {
          length: editingProduct.dimensions?.length || '',
          width: editingProduct.dimensions?.width || '',
          height: editingProduct.dimensions?.height || '',
          unit: editingProduct.dimensions?.unit || 'cm'
        },
        weight: editingProduct.weight || '',
        furnitureSpecs: editingProduct.furnitureSpecs || {},
        slabSpecs: editingProduct.slabSpecs || {},
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
        setMainImageId(existingImages[0]?.id || '');
      }

      // Set custom specs
      if (editingProduct.customSpecs) {
        setCustomSpecs(editingProduct.customSpecs);
      }
    }
  }, [editingProduct]);

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
    if (formData.category === 'furniture') {
      setFormData(prev => ({ ...prev, furnitureSpecs: specs }));
    } else {
      setFormData(prev => ({ ...prev, slabSpecs: specs }));
    }

    if (customSpecsData) {
      setCustomSpecs(customSpecsData);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.productId || !formData.name || !formData.description || !formData.subcategory) {
        alert('Please fill in all required fields (Product ID, Name, Subcategory, Description)');
        return;
      }

      if (images.length === 0) {
        alert('Please add at least one product image');
        return;
      }

      // Prepare final form data
      const finalFormData = {
        ...formData,
        subcategory: showCustomSubcategory ? customSubcategory : formData.subcategory,
        priceINR: formData.priceINR ? parseFloat(formData.priceINR.toString()) : undefined,
        weight: formData.weight ? parseFloat(formData.weight.toString()) : undefined,
        dimensions: {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length.toString()) : undefined,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width.toString()) : undefined,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height.toString()) : undefined,
          unit: formData.dimensions.unit
        }
      };

      await onSave(finalFormData, images, customSpecs);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handlePreview = async () => {
    try {
      const finalFormData = {
        ...formData,
        subcategory: showCustomSubcategory ? customSubcategory : formData.subcategory,
      };

      await onPreview(finalFormData, images);
    } catch (error) {
      console.error('Error previewing product:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200" style={{ height: '90vh', maxHeight: '800px' }}>
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
                  disabled={!!editingProduct}
                  value={formData.productId}
                  onChange={(e) => handleInputChange('productId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Marble Coffee Table"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="furniture">Furniture</option>
                  <option value="slabs">Slabs</option>
                </select>
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
                  {subcategories[formData.category as keyof typeof subcategories].map(sub => (
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product description..."
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => handleInputChange('available', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Available for Sale</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="w-4 h-4 text-amber-600"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount.percentage}
                    onChange={(e) => handleInputChange('discount.percentage', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Description
                  </label>
                  <input
                    type="text"
                    value={formData.discount.description}
                    onChange={(e) => handleInputChange('discount.description', e.target.value)}
                    placeholder="e.g., Summer Sale"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dimensions Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900">Dimensions & Weight</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                <input
                  type="number"
                  min="0"
                  value={formData.dimensions.length}
                  onChange={(e) => handleInputChange('dimensions.length', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <input
                  type="number"
                  min="0"
                  value={formData.dimensions.width}
                  onChange={(e) => handleInputChange('dimensions.width', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <input
                  type="number"
                  min="0"
                  value={formData.dimensions.height}
                  onChange={(e) => handleInputChange('dimensions.height', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={formData.dimensions.unit}
                  onChange={(e) => handleInputChange('dimensions.unit', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mm">mm</option>
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                  <option value="in">in</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>

            <div className="md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                min="0"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 50"
              />
            </div>
          </div>

          {/* Product Specifications */}
          <div className="space-y-4 border-t pt-4">
            <ProductSpecsEditor
              category={formData.category as 'furniture' | 'slabs'}
              furnitureSpecs={formData.furnitureSpecs}
              slabSpecs={formData.slabSpecs}
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
              onMainImageChange={setMainImageId}
              aspectRatio={1}
              allowCrop={true}
              maxImages={10}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-none border-t border-gray-200 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePreview}
              disabled={loading || previewLoading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {previewLoading ? 'Previewing...' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <Save className="w-4 h-4" />
              {loading ? (editingProduct ? 'Updating...' : 'Creating...') : (editingProduct ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductForm;