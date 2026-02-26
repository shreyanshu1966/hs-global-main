import React, { useState } from 'react';
import { Plus, Minus, Wrench, Layers, Save, RotateCcw } from 'lucide-react';

interface FurnitureSpecs {
  product?: string;
  type?: string;
  shape?: string;
  material?: string;
  size?: string;
  surfaceFinish?: string;
  delivery?: string;
  height?: string;
  colorName?: string;
  packagingDetails?: string;
  location?: string;
}

interface SlabSpecs {
  finish?: string;
  thickness?: string;
  origin?: string;
  material?: string;
  application?: string;
}

interface CustomSpec {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  options?: string[];
}

interface ProductSpecsEditorProps {
  category: 'furniture' | 'slabs';
  furnitureSpecs?: FurnitureSpecs;
  slabSpecs?: SlabSpecs;
  customSpecs?: CustomSpec[];
  onSpecsChange: (specs: FurnitureSpecs | SlabSpecs, customSpecs?: CustomSpec[]) => void;
}

const ProductSpecsEditor: React.FC<ProductSpecsEditorProps> = ({
  category,
  furnitureSpecs = {},
  slabSpecs = {},
  customSpecs = [],
  onSpecsChange
}) => {
  const [localCustomSpecs, setLocalCustomSpecs] = useState<CustomSpec[]>(customSpecs);
  
  // Predefined specifications for furniture
  const furnitureSpecFields = [
    { key: 'type', label: 'Furniture Type', type: 'select' as const, options: ['Table', 'Chair', 'Cabinet', 'Wash Basin', 'Sculpture', 'Bench', 'Planter', 'Fountain', 'Fireplace', 'Column', 'Urn', 'Decorative', 'Other'] },
    { key: 'shape', label: 'Shape', type: 'select' as const, options: ['Round', 'Square', 'Rectangle', 'Oval', 'Irregular', 'Freeform', 'Custom'] },
    { key: 'material', label: 'Material', type: 'select' as const, options: ['Marble', 'Granite', 'Quartzite', 'Onyx', 'Limestone', 'Travertine', 'Wood', 'Metal', 'Glass', 'Stone', 'Composite'] },
    { key: 'size', label: 'Size/Dimensions', type: 'text' as const },
    { key: 'surfaceFinish', label: 'Surface Finish', type: 'select' as const, options: ['Polished', 'Honed', 'Brushed', 'Antique', 'Natural', 'Matte', 'Custom'] },
    { key: 'colorName', label: 'Color/Pattern Name', type: 'text' as const },
    { key: 'height', label: 'Height', type: 'text' as const },
    { key: 'location', label: 'Origin/Location', type: 'text' as const },
    { key: 'packagingDetails', label: 'Packaging Details', type: 'textarea' as const }
  ];

  // Predefined specifications for slabs
  const slabSpecFields = [
    { key: 'finish', label: 'Finish', type: 'select' as const, options: ['Polished', 'Honed', 'Leather', 'Brushed', 'Flamed', 'Bush Hammered'] },
    { key: 'thickness', label: 'Thickness', type: 'select' as const, options: ['12mm', '18mm', '20mm', '30mm', '40mm', '50mm', 'Custom'] },
    { key: 'origin', label: 'Origin', type: 'text' as const },
    { key: 'material', label: 'Material Type', type: 'select' as const, options: ['Marble', 'Granite', 'Quartzite', 'Onyx', 'Limestone', 'Travertine', 'Sandstone', 'Slate'] },
    { key: 'application', label: 'Application', type: 'select' as const, options: ['Kitchen Countertop', 'Bathroom Vanity', 'Flooring', 'Wall Cladding', 'Outdoor', 'Fireplace', 'General Purpose'] }
  ];

  const currentSpecs = category === 'furniture' ? furnitureSpecs : slabSpecs;
  const currentSpecFields = category === 'furniture' ? furnitureSpecFields : slabSpecFields;

  const handleSpecChange = (key: string, value: string) => {
    const newSpecs = { ...currentSpecs, [key]: value };
    onSpecsChange(newSpecs, localCustomSpecs);
  };

  const addCustomSpec = () => {
    const newSpec: CustomSpec = {
      key: `custom_${Date.now()}`,
      label: '',
      value: '',
      type: 'text'
    };
    const newCustomSpecs = [...localCustomSpecs, newSpec];
    setLocalCustomSpecs(newCustomSpecs);
    onSpecsChange(currentSpecs, newCustomSpecs);
  };

  const updateCustomSpec = (index: number, field: keyof CustomSpec, value: string | string[]) => {
    const newCustomSpecs = [...localCustomSpecs];
    newCustomSpecs[index] = { ...newCustomSpecs[index], [field]: value };
    setLocalCustomSpecs(newCustomSpecs);
    onSpecsChange(currentSpecs, newCustomSpecs);
  };

  const removeCustomSpec = (index: number) => {
    const newCustomSpecs = localCustomSpecs.filter((_, i) => i !== index);
    setLocalCustomSpecs(newCustomSpecs);
    onSpecsChange(currentSpecs, newCustomSpecs);
  };

  const resetSpecs = () => {
    const emptySpecs = category === 'furniture' ? {} : {};
    setLocalCustomSpecs([]);
    onSpecsChange(emptySpecs, []);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {category === 'furniture' ? (
            <Wrench className="w-5 h-5 text-blue-600" />
          ) : (
            <Layers className="w-5 h-5 text-green-600" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {category === 'furniture' ? 'Furniture' : 'Slab'} Specifications
          </h3>
        </div>
        <button
          type="button"
          onClick={resetSpecs}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Standard Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentSpecFields.map(({ key, label, type, options }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            {type === 'select' ? (
              <select
                value={currentSpecs[key as keyof typeof currentSpecs] || ''}
                onChange={(e) => handleSpecChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select {label}</option>
                {options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : type === 'textarea' ? (
              <textarea
                value={currentSpecs[key as keyof typeof currentSpecs] || ''}
                onChange={(e) => handleSpecChange(key, e.target.value)}
                rows={3}
                placeholder={`Enter ${label.toLowerCase()}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <input
                type={type}
                value={currentSpecs[key as keyof typeof currentSpecs] || ''}
                onChange={(e) => handleSpecChange(key, e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        ))}
      </div>

      {/* Custom Specifications */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Custom Specifications</h4>
          <button
            type="button"
            onClick={addCustomSpec}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Custom Field
          </button>
        </div>

        {localCustomSpecs.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No custom specifications added yet.</p>
            <p className="text-xs mt-1">Click "Add Custom Field" to create product-specific specifications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {localCustomSpecs.map((spec, index) => (
              <div key={spec.key} className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Label
                    </label>
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) => updateCustomSpec(index, 'label', e.target.value)}
                      placeholder="e.g., Weight, Warranty, Special Features"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Type
                    </label>
                    <select
                      value={spec.type}
                      onChange={(e) => updateCustomSpec(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Dropdown</option>
                      <option value="textarea">Long Text</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-end gap-2 h-full">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {spec.type === 'select' ? 'Options (comma separated)' : 'Value'}
                        </label>
                        {spec.type === 'select' ? (
                          <input
                            type="text"
                            value={spec.options?.join(', ') || ''}
                            onChange={(e) => updateCustomSpec(index, 'options', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="Option 1, Option 2, Option 3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        ) : spec.type === 'textarea' ? (
                          <textarea
                            value={spec.value}
                            onChange={(e) => updateCustomSpec(index, 'value', e.target.value)}
                            placeholder={`Enter ${spec.label || 'value'}`}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <input
                            type={spec.type}
                            value={spec.value}
                            onChange={(e) => updateCustomSpec(index, 'value', e.target.value)}
                            placeholder={`Enter ${spec.label || 'value'}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCustomSpec(index)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove custom field"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Preview of custom field */}
                {spec.label && (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="text-xs text-gray-600 mb-1">Preview:</div>
                    <div className="text-sm">
                      <span className="font-medium">{spec.label}:</span>{' '}
                      {spec.type === 'select' && spec.options && spec.options.length > 0 
                        ? `[${spec.options.join(', ')}]`
                        : spec.value || '[No value set]'
                      }
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Card */}
      {(Object.keys(currentSpecs).some(key => currentSpecs[key as keyof typeof currentSpecs]) || localCustomSpecs.some(spec => spec.value)) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="text-sm font-semibold text-blue-900 mb-2">Specifications Summary</h5>
          <div className="space-y-1 text-sm text-blue-800">
            {Object.entries(currentSpecs).map(([key, value]) => {
              if (!value) return null;
              const field = currentSpecFields.find(f => f.key === key);
              return (
                <div key={key} className="flex justify-between">
                  <span>{field?.label || key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              );
            })}
            {localCustomSpecs.map((spec, index) => {
              if (!spec.value || !spec.label) return null;
              return (
                <div key={index} className="flex justify-between">
                  <span>{spec.label}:</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSpecsEditor;