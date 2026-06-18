import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

type AdjustmentType = 'percentage' | 'fixed';
type RegionKey = 'UAE' | 'Europe' | 'India' | 'USA' | 'UK';

const ALL_REGIONS: RegionKey[] = ['UAE', 'Europe', 'India', 'USA', 'UK'];
const REGION_CURRENCIES: Record<RegionKey, string> = {
  UAE: 'AED (د.إ)', Europe: 'EUR (€)', India: 'INR (₹)', USA: 'USD ($)', UK: 'GBP (£)'
};

const defaultRP = () =>
  Object.fromEntries(ALL_REGIONS.map(r => [r, { enabled: false, adjustmentType: 'percentage' as AdjustmentType, adjustmentValue: 0 }])) as Record<RegionKey, { enabled: boolean; adjustmentType: AdjustmentType; adjustmentValue: number }>;

interface BulkRegionalPricingProps {
  categories: Array<{ category: string; subcategories: string[] }>;
}

const BulkRegionalPricing: React.FC<BulkRegionalPricingProps> = ({ categories }) => {
  const [scopeType, setScopeType] = useState<'all' | 'category' | 'subcategory'>('category');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  const [regionalPricing, setRegionalPricing] = useState(defaultRP());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ modifiedCount: number; affectedCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<{ totalProducts: number; regionStats: Record<string, number> } | null>(null);

  // Load overview stats
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_URL}/admin/products/regional-pricing/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) setOverview(data);
        }
      } catch {}
    };
    fetchOverview();
  }, [result]);

  useEffect(() => {
    const cat = categories.find(c => c.category === selectedCategory);
    setAvailableSubcategories(cat?.subcategories || []);
    setSelectedSubcategory('');
  }, [selectedCategory, categories]);

  const updateRegion = (region: RegionKey, field: string, value: any) => {
    setRegionalPricing(prev => ({ ...prev, [region]: { ...prev[region], [field]: value } }));
  };

  const handleApply = async () => {
    const enabledRegions = ALL_REGIONS.filter(r => regionalPricing[r].enabled);
    if (enabledRegions.length === 0) {
      setError('Please enable at least one region');
      return;
    }
    if (scopeType === 'category' && !selectedCategory) {
      setError('Please select a category');
      return;
    }
    if (scopeType === 'subcategory' && (!selectedCategory || !selectedSubcategory)) {
      setError('Please select a category and subcategory');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('authToken');
      const body: Record<string, any> = { regionalPricing };
      if (scopeType === 'category' || scopeType === 'subcategory') body.category = selectedCategory;
      if (scopeType === 'subcategory') body.subcategory = selectedSubcategory;

      const res = await fetch(`${API_URL}/admin/products/regional-pricing/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setResult({ modifiedCount: data.modifiedCount, affectedCount: data.affectedCount });
      } else {
        setError(data.message || 'Failed to apply bulk pricing');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRegionalPricing(defaultRP());
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      {overview && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Regional Pricing Coverage ({overview.totalProducts} total products)</h4>
          <div className="flex flex-wrap gap-3">
            {ALL_REGIONS.map(r => (
              <div key={r} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-gray-700">{r}</span>
                <span className="text-sm text-blue-600 font-semibold">{overview.regionStats[r] || 0} products</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scope Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Apply To</label>
        <div className="flex gap-3">
          {(['all', 'category', 'subcategory'] as const).map(s => (
            <button
              key={s}
              onClick={() => setScopeType(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${scopeType === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}
            >
              {s === 'all' ? 'All Products' : s === 'category' ? 'By Category' : 'By Subcategory'}
            </button>
          ))}
        </div>
      </div>

      {/* Category / Subcategory Selectors */}
      {(scopeType === 'category' || scopeType === 'subcategory') && (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category...</option>
              {categories.map(c => (
                <option key={c.category} value={c.category}>{c.category}</option>
              ))}
            </select>
          </div>
          {scopeType === 'subcategory' && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                value={selectedSubcategory}
                onChange={e => setSelectedSubcategory(e.target.value)}
                disabled={!selectedCategory}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select subcategory...</option>
                {availableSubcategories.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Regional Pricing Config */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Configure Regions</label>
        <div className="space-y-3">
          {ALL_REGIONS.map(region => {
            const rp = regionalPricing[region];
            return (
              <div key={region} className={`border rounded-lg p-4 transition-colors ${rp.enabled ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`bulk-rp-${region}`}
                      checked={rp.enabled}
                      onChange={e => updateRegion(region, 'enabled', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor={`bulk-rp-${region}`} className="font-medium text-gray-800 cursor-pointer">
                      {region}
                    </label>
                    <span className="text-xs text-gray-400">({REGION_CURRENCIES[region]})</span>
                  </div>
                  {rp.enabled && (
                    <div className="flex gap-2 items-center">
                      <select
                        value={rp.adjustmentType}
                        onChange={e => updateRegion(region, 'adjustmentType', e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Value ($)</option>
                      </select>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={rp.adjustmentValue}
                          onChange={e => updateRegion(region, 'adjustmentValue', parseFloat(e.target.value) || 0)}
                          placeholder={rp.adjustmentType === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
                          className="w-32 text-sm border border-gray-300 rounded-lg px-3 py-1.5 pr-8"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
                          {rp.adjustmentType === 'percentage' ? '%' : '$'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error / Success */}
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
          Regional pricing applied to <strong>{result.modifiedCount}</strong> products (out of {result.affectedCount} in scope).
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleApply}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
        >
          {loading && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
          {loading ? 'Applying...' : 'Apply Bulk Pricing'}
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-lg font-medium text-sm transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default BulkRegionalPricing;
