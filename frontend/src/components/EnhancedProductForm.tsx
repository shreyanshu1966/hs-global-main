import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Save, Eye, Image as ImageIcon, Video, Globe, ArrowLeft, Upload } from 'lucide-react';
import { countries } from '../data/countries';
import ProductImageManager from '../components/ProductImageManager';
import ProductSpecsEditor from '../components/ProductSpecsEditor';
import ProductVideoManager from '../components/ProductVideoManager';
import { productService, type Category } from '../services/productService';
import { DEFAULT_RATES } from '../utils/pricing';
import { useCurrency } from '../contexts/CurrencyContext';

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

type AdjustmentType = 'percentage' | 'fixed';
type RegionKey = 'UAE' | 'Europe' | 'India' | 'USA' | 'UK';

const REGION_DISPLAY_CURRENCY: Record<RegionKey, string> = {
  UAE: 'AED (د.إ)', Europe: 'EUR (€)', India: 'INR (₹)', USA: 'USD ($)', UK: 'GBP (£)'
};
const REGION_CURRENCY_SYMBOL: Record<RegionKey, string> = {
  UAE: 'AED', Europe: '€', India: '₹', USA: '$', UK: '£'
};
const REGION_CURRENCY_CODE: Record<RegionKey, string> = {
  UAE: 'AED', Europe: 'EUR', India: 'INR', USA: 'USD', UK: 'GBP'
};
const ALL_REGIONS: RegionKey[] = ['UAE', 'Europe', 'India', 'USA', 'UK'];

const SECTION_TABS = [
  { id: 'photos',          label: 'Photos' },
  { id: 'details',         label: 'Title & Info' },
  { id: 'listing-details', label: 'Details' },
  { id: 'pricing',         label: 'Pricing' },
  { id: 'specs',           label: 'Specs' },
  { id: 'shipping',        label: 'Shipping' },
] as const;
type SectionId = typeof SECTION_TABS[number]['id'];

const defaultRegionalPricing = (): Record<RegionKey, { enabled: boolean; adjustmentType: AdjustmentType; adjustmentValue: number }> => ({
  UAE:    { enabled: false, adjustmentType: 'percentage', adjustmentValue: 0 },
  Europe: { enabled: false, adjustmentType: 'percentage', adjustmentValue: 0 },
  India:  { enabled: false, adjustmentType: 'percentage', adjustmentValue: 0 },
  USA:    { enabled: false, adjustmentType: 'percentage', adjustmentValue: 0 },
  UK:     { enabled: false, adjustmentType: 'percentage', adjustmentValue: 0 },
});

const EnhancedProductForm: React.FC<EnhancedProductFormProps> = ({
  editingProduct,
  onSave,
  onCancel,
  onPreview,
  loading = false,
  previewLoading = false,
  uploadProgress = { images: 0, video: 0 }
}) => {
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    category: 'furniture',
    subcategory: '',
    description: '',
    subDescription: '',
    priceUSD: '',
    status: 'active',
    available: true,
    featured: false,
    furnitureSpecs: {} as any,
    discount: { enabled: false, percentage: 0, startDate: null as any, endDate: null as any, description: '' }
  });

  const [images, setImages]               = useState<ProductImage[]>([]);
  const [customSpecs, setCustomSpecs]     = useState<any[]>([]);
  const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
  const [customSubcategory, setCustomSubcategory]         = useState('');
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  const [video, setVideo]                 = useState<VideoFile | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [regionalPricing, setRegionalPricing] = useState<Record<RegionKey, { enabled: boolean; adjustmentType: AdjustmentType; adjustmentValue: number }>>(defaultRegionalPricing);
  const [priceINR, setPriceINR]           = useState<string>('');
  const [pricePerSqFtINR, setPricePerSqFtINR] = useState<string>('');
  const [stoneSpecs, setStoneSpecs] = useState({
    minSlabSize: '', maxSlabSize: '', thickness: '', surfaceFinish: '',
    form: '', material: '', usage: '', moh: '', refractiveIndex: '',
    waterAbsorption: '', priceRange: '',
  });
  const [shippingConfig, setShippingConfig] = useState<{ shipsWorldwide: boolean; excludedCountries: string[] }>({ shipsWorldwide: true, excludedCountries: [] });
  const [excludeSearch, setExcludeSearch] = useState('');
  const [similarProductIds, setSimilarProductIds] = useState<string[]>([]);
  const [simSearch, setSimSearch]         = useState('');
  const [simResults, setSimResults]       = useState<any[]>([]);
  const [simSearching, setSimSearching]   = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [formSubmitting, setFormSubmitting]       = useState(false);
  const [unifiedDragOver, setUnifiedDragOver]     = useState(false);
  const unifiedInputRef = useRef<HTMLInputElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isFormDisabled = validationLoading || formSubmitting || loading || previewLoading || videoUploading;

  const handleUnifiedFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const videoFiles = files.filter(f => f.type.startsWith('video/'));

    if (imageFiles.length > 0) {
      const remaining = 10 - images.length;
      const validImages = imageFiles.slice(0, remaining).filter(f => f.size <= 5 * 1024 * 1024);
      if (validImages.length > 0) {
        const results = await Promise.all(validImages.map(file =>
          new Promise<{ file: File; url: string; id: string }>(resolve => {
            const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const reader = new FileReader();
            reader.onload = ev => resolve({ file, url: ev.target?.result as string, id });
            reader.readAsDataURL(file);
          })
        ));
        setImages(prev => {
          const hasNone = prev.length === 0;
          const newImgs: ProductImage[] = results.map((r, i) => ({
            id: r.id, file: r.file, url: r.url,
            isMain: hasNone && i === 0, isNew: true,
          }));
          return [...prev, ...newImgs];
        });
      }
    }

    if (videoFiles.length > 0 && !video) {
      const file = videoFiles[0];
      if (file.size <= 100 * 1024 * 1024) {
        const videoUrl = URL.createObjectURL(file);
        const el = document.createElement('video');
        el.src = videoUrl;
        const duration = await new Promise<number>(resolve => {
          el.addEventListener('loadedmetadata', () => resolve(el.duration));
          el.addEventListener('error', () => resolve(0));
        });
        setVideo({ file, url: videoUrl, size: file.size, duration, isExisting: false });
        setVideoUploading(true);
        setTimeout(() => setVideoUploading(false), 1000);
      }
    }
  }, [images, video]);

  // Live exchange rates (fetched by CurrencyContext every 30 min; falls back to DEFAULT_RATES)
  const { exchangeRates } = useCurrency();
  const liveRate = (code: string): number =>
    (exchangeRates[code] as number | undefined) ?? (DEFAULT_RATES[code as keyof typeof DEFAULT_RATES] as number | undefined) ?? 1;

  // Scroll-spy
  const bodyRef      = useRef<HTMLDivElement>(null);
  const sectionRefs  = useRef<Partial<Record<SectionId, HTMLDivElement | null>>>({});
  const [activeSection, setActiveSection] = useState<SectionId>('photos');

  // ─── Load categories ───────────────────────────────────────────────────────
  useEffect(() => {
    productService.getCategories().then(r => {
      if (r.success && Array.isArray(r.data)) setAllCategories(r.data as Category[]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const match = allCategories.find(i => String(i.category).toLowerCase() === formData.category.toLowerCase());
    setAvailableSubcategories(match?.subcategories || []);
  }, [formData.category, allCategories]);

  // ─── Populate form when editing ────────────────────────────────────────────
  useEffect(() => {
    if (!editingProduct) return;
    const validCategories = ['furniture', 'handicraft', 'leather', 'semi-precious-stone'];
    setFormData({
      productId:      editingProduct.productId    || '',
      name:           editingProduct.name         || '',
      category:       validCategories.includes(editingProduct.category) ? editingProduct.category : 'furniture',
      subcategory:    editingProduct.subcategory  || '',
      description:    editingProduct.description  || '',
      subDescription: editingProduct.subDescription || '',
      priceUSD:       editingProduct.priceUSD     || '',
      status:         editingProduct.status       || 'active',
      available:      editingProduct.available    !== false,
      featured:       editingProduct.featured     || false,
      furnitureSpecs: editingProduct.furnitureSpecs || {},
      discount: editingProduct.discount || { enabled: false, percentage: 0, startDate: null, endDate: null, description: '' }
    });
    if (editingProduct.images?.length > 0) {
      setImages(editingProduct.images.map((url: string, i: number) => ({ id: `existing_${i}`, url, isMain: i === 0, isExisting: true })));
    }
    if (editingProduct.customSpecs)     setCustomSpecs(editingProduct.customSpecs);
    if (editingProduct.similarProducts?.length > 0) setSimilarProductIds(editingProduct.similarProducts);

    if (editingProduct.category === 'slabs' && editingProduct.subcategory) {
      setShowCustomSubcategory(true);
      setCustomSubcategory(editingProduct.subcategory);
    }

    if (editingProduct.regionalPricing) {
      const def = defaultRegionalPricing();
      const cvt = (rp: any) => !rp ? null : { ...rp, adjustmentValue: rp.adjustmentType === 'fixed' ? Math.round(rp.adjustmentValue * liveRate('INR')) : rp.adjustmentValue };
      setRegionalPricing({
        UAE:    cvt(editingProduct.regionalPricing.UAE)    || def.UAE,
        Europe: cvt(editingProduct.regionalPricing.Europe) || def.Europe,
        India:  cvt(editingProduct.regionalPricing.India)  || def.India,
        USA:    cvt(editingProduct.regionalPricing.USA)    || def.USA,
        UK:     cvt(editingProduct.regionalPricing.UK)     || def.UK,
      });
    }

    setPriceINR(editingProduct.priceUSD ? String(Math.round(editingProduct.priceUSD * liveRate('INR'))) : '');
    setPricePerSqFtINR(editingProduct.pricePerSqFt ? String(editingProduct.pricePerSqFt) : '');
    if (editingProduct.stoneSpecs) {
      setStoneSpecs({
        minSlabSize:     editingProduct.stoneSpecs.minSlabSize     || '',
        maxSlabSize:     editingProduct.stoneSpecs.maxSlabSize     || '',
        thickness:       editingProduct.stoneSpecs.thickness       || '',
        surfaceFinish:   editingProduct.stoneSpecs.surfaceFinish   || '',
        form:            editingProduct.stoneSpecs.form            || '',
        material:        editingProduct.stoneSpecs.material        || '',
        usage:           editingProduct.stoneSpecs.usage           || '',
        moh:             editingProduct.stoneSpecs.moh             || '',
        refractiveIndex: editingProduct.stoneSpecs.refractiveIndex || '',
        waterAbsorption: editingProduct.stoneSpecs.waterAbsorption || '',
        priceRange:      editingProduct.stoneSpecs.priceRange      || '',
      });
    }

    if (editingProduct.shipping) {
      setShippingConfig({ shipsWorldwide: editingProduct.shipping.shipsWorldwide !== false, excludedCountries: editingProduct.shipping.excludedCountries || [] });
    }
    if (editingProduct.hasVideo && editingProduct.videoUrl) {
      setVideo({ file: new File([], editingProduct.videoFilename || 'video.mp4', { type: 'video/mp4' }), url: editingProduct.videoUrl, size: editingProduct.videoSize || 0, isExisting: true });
    }
  }, [editingProduct]);

  useEffect(() => {
    if (!editingProduct?.subcategory || availableSubcategories.length === 0) return;
    if (!availableSubcategories.includes(editingProduct.subcategory)) {
      setShowCustomSubcategory(true);
      setCustomSubcategory(editingProduct.subcategory);
    }
  }, [editingProduct, availableSubcategories]);

  // Auto-resize description textarea when value is populated (e.g. loading existing product)
  useEffect(() => {
    const el = descTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [formData.description]);

  // ─── Similar products search ────────────────────────────────────────────────
  useEffect(() => {
    if (!simSearch.trim()) { setSimResults([]); return; }
    let cancelled = false;
    const run = async () => {
      setSimSearching(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const token   = localStorage.getItem('authToken');
        const res     = await fetch(`${API_URL}/admin/products?search=${encodeURIComponent(simSearch.trim())}&limit=10`, { headers: { Authorization: `Bearer ${token}` } });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setSimResults((data.data || []).filter((p: any) => p.productId !== formData.productId && !similarProductIds.includes(p.productId)));
        }
      } catch { if (!cancelled) setSimResults([]); }
      finally  { if (!cancelled) setSimSearching(false); }
    };
    const t = setTimeout(run, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [simSearch, formData.productId, similarProductIds]);

  // ─── Scroll-spy (uses window scroll) ──────────────────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id as SectionId); }),
      { root: null, rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const scrollToSection = (id: SectionId) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent as keyof typeof prev], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePriceINRChange = (rawVal: string) => {
    setPriceINR(rawVal);
    const n = parseFloat(rawVal);
    handleInputChange('priceUSD', rawVal && !isNaN(n) ? String(n / liveRate('INR')) : '');
  };

  const handleSpecsChange = (specs: any, customSpecsData: any[]) => {
    setFormData(prev => ({ ...prev, furnitureSpecs: specs }));
    setCustomSpecs(customSpecsData);
  };

  const addSimilarProduct = (p: any) => {
    if (!similarProductIds.includes(p.productId)) setSimilarProductIds(prev => [...prev, p.productId]);
    setSimSearch(''); setSimResults([]);
  };
  const removeSimilarProduct = (pid: string) => setSimilarProductIds(prev => prev.filter(id => id !== pid));

  const handleSave = async () => {
    if (isFormDisabled) return;
    try {
      setValidationLoading(true);
      const finalSubcategory = showCustomSubcategory ? customSubcategory.trim() : formData.subcategory;
      if (!formData.productId || !formData.name || !formData.description || !finalSubcategory) {
        alert('Please fill in all required fields (Product ID, Name, Subcategory, Description)');
        setValidationLoading(false); return;
      }
      if (images.length === 0) { alert('Please add at least one product image'); setValidationLoading(false); return; }

      setValidationLoading(false);
      setFormSubmitting(true);

      const cvtSave = (rp: { enabled: boolean; adjustmentType: AdjustmentType; adjustmentValue: number }) => ({
        ...rp, adjustmentValue: rp.adjustmentType === 'fixed' ? rp.adjustmentValue / liveRate('INR') : rp.adjustmentValue,
      });
      const regionalPricingForSave = Object.fromEntries(
        (Object.entries(regionalPricing) as [RegionKey, typeof regionalPricing[RegionKey]][]).map(([k, v]) => [k, cvtSave(v)])
      );

      const formattedCustomSpecs = customSpecs
        .filter((s: any) => s.label && s.label.trim())
        .map((s: any, i: number) => ({
          key: (s.key || s.label).trim().toLowerCase().replace(/\s+/g, '_'),
          label: s.label.trim(),
          value: (s.value || '').trim(),
          type: 'text',
          order: i,
        }));

      await onSave({
        productId: formData.productId, name: formData.name, category: formData.category,
        subcategory: finalSubcategory, description: formData.description,
        subDescription: formData.subDescription || '',
        priceUSD: formData.category === 'semi-precious-stone' ? undefined : (formData.priceUSD ? parseFloat(formData.priceUSD.toString()) : undefined),
        pricePerSqFt: formData.category === 'semi-precious-stone' && pricePerSqFtINR ? parseFloat(pricePerSqFtINR) : undefined,
        status: formData.status, available: formData.available, featured: formData.featured,
        furnitureSpecs: formData.furnitureSpecs, discount: formData.discount, hasVideo: !!video,
        stoneSpecs: formData.category === 'semi-precious-stone' ? stoneSpecs : undefined,
        customSpecs: formattedCustomSpecs,
        similarProducts: similarProductIds, regionalPricing: regionalPricingForSave,
        shipping: { shipsWorldwide: shippingConfig.shipsWorldwide, excludedCountries: shippingConfig.excludedCountries },
      }, images, customSpecs, video && !video.isExisting ? video.file : null);

      setFormSubmitting(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setFormSubmitting(false);
      alert('Failed to save product. Please try again.');
    }
  };

  const handlePreview = async () => {
    if (isFormDisabled) return;
    try {
      setValidationLoading(true);
      if (!formData.name || !formData.description) {
        alert('Please fill in at least Product Name and Description for preview'); return;
      }
      setValidationLoading(false);
      const finalSubcategory = showCustomSubcategory ? customSubcategory.trim() : formData.subcategory;
      await onPreview({
        productId: formData.productId, name: formData.name, category: formData.category,
        subcategory: finalSubcategory, description: formData.description,
        subDescription: formData.subDescription || '',
        priceUSD: formData.category === 'semi-precious-stone' ? undefined : (formData.priceUSD ? parseFloat(formData.priceUSD.toString()) : undefined),
        pricePerSqFt: formData.category === 'semi-precious-stone' && pricePerSqFtINR ? parseFloat(pricePerSqFtINR) : undefined,
        status: formData.status, available: formData.available, featured: formData.featured,
        furnitureSpecs: formData.furnitureSpecs, discount: formData.discount,
        stoneSpecs: formData.category === 'semi-precious-stone' ? stoneSpecs : undefined,
        hasVideo: !!video, similarProducts: similarProductIds,
      }, images, video && !video.isExisting ? video.file : null);
    } catch (error) {
      console.error('Error previewing product:', error);
      alert('Failed to generate preview. Please try again.');
    } finally {
      setValidationLoading(false);
    }
  };

  // ─── Tiny helpers ──────────────────────────────────────────────────────────
  const Spinner = () => (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors bg-white';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

  // ─── Section anchor helper ─────────────────────────────────────────────────
  const secRef = (id: SectionId) => (el: HTMLDivElement | null) => { sectionRefs.current[id] = el; };

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#f5f4f0]">

      {/* ── Loading overlay ── */}
      {isFormDisabled && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-sm w-full mx-4 text-center space-y-4">
            <div className="relative mx-auto w-14 h-14">
              <div className="w-14 h-14 border-4 border-gray-100 border-t-orange-500 rounded-full animate-spin" />
            </div>
            <p className="text-base font-semibold text-gray-800">
              {validationLoading ? 'Validating…' :
               formSubmitting && !loading ? 'Preparing…' :
               loading && (uploadProgress.images > 0 || uploadProgress.video > 0) ? 'Uploading media…' :
               loading ? (editingProduct ? 'Updating product…' : 'Creating product…') :
               previewLoading ? 'Generating preview…' :
               videoUploading ? 'Processing video…' : 'Processing…'}
            </p>
            {loading && (uploadProgress.images > 0 || uploadProgress.video > 0) && (
              <div className="space-y-2 text-left">
                {uploadProgress.images > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Images</span><span>{Math.round(uploadProgress.images)}%</span></div>
                    <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${uploadProgress.images}%` }} /></div>
                  </div>
                )}
                {uploadProgress.video > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Video</span><span>{Math.round(uploadProgress.video)}%</span></div>
                    <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${uploadProgress.video}%` }} /></div>
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-gray-400">Please do not close this window</p>
          </div>
        </div>
      )}

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3.5 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onCancel} disabled={isFormDisabled}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium shrink-0 disabled:opacity-40">
              <ArrowLeft className="w-4 h-4" />
              Listings
            </button>
            <span className="text-gray-300">/</span>
            <h1 className="text-sm font-semibold text-gray-900 truncate max-w-xs">
              {editingProduct ? (formData.name || 'Edit Listing') : 'New Listing'}
            </h1>
            <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
              formData.status === 'active'   ? 'bg-green-100 text-green-700' :
              formData.status === 'inactive' ? 'bg-gray-100 text-gray-600'  : 'bg-yellow-100 text-yellow-700'
            }`}>{formData.status}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handlePreview} disabled={isFormDisabled}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40">
              {previewLoading ? <Spinner /> : <Eye className="w-4 h-4" />}
              {previewLoading ? 'Previewing…' : 'Preview'}
            </button>
            <button onClick={handleSave} disabled={isFormDisabled}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-sm transition-colors disabled:opacity-40">
              {(loading || formSubmitting || validationLoading || videoUploading) ? <Spinner /> : <Save className="w-4 h-4" />}
              {validationLoading ? 'Validating…' :
               formSubmitting && !loading ? 'Preparing…' :
               loading && (uploadProgress.images > 0 || uploadProgress.video > 0) ? 'Uploading…' :
               loading ? (editingProduct ? 'Updating…' : 'Publishing…') :
               videoUploading ? 'Processing…' :
               editingProduct ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Section jump-tabs */}
        <div className="flex border-t border-gray-100 px-2 overflow-x-auto scrollbar-none">
          {SECTION_TABS.map(tab => (
            <button key={tab.id} onClick={() => scrollToSection(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeSection === tab.id
                  ? 'text-orange-600 border-orange-500'
                  : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div ref={bodyRef} className="max-w-4xl mx-auto px-8 py-7 space-y-5 pb-16">

          {/* ① Photos & Video */}
          <div ref={secRef('photos')} id="photos" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-50">
              <ImageIcon className="w-4 h-4 text-gray-400" />
              <div>
                <h2 className="font-semibold text-gray-900 text-[15px]">Photos & Video</h2>
                <p className="text-xs text-gray-400 mt-0.5">Up to 10 photos + 1 video. First photo is the main image.</p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Unified upload zone */}
              <div
                className={`border-2 border-dashed rounded-xl px-6 py-5 text-center cursor-pointer transition-all ${unifiedDragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-white'}`}
                onClick={() => !isFormDisabled && unifiedInputRef.current?.click()}
                onDrop={e => { e.preventDefault(); setUnifiedDragOver(false); if (!isFormDisabled) handleUnifiedFiles(Array.from(e.dataTransfer.files)); }}
                onDragOver={e => { e.preventDefault(); setUnifiedDragOver(true); }}
                onDragLeave={() => setUnifiedDragOver(false)}
              >
                <input
                  ref={unifiedInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  disabled={isFormDisabled}
                  onChange={e => { if (e.target.files) handleUnifiedFiles(Array.from(e.target.files)); e.target.value = ''; }}
                />
                <Upload className={`w-7 h-7 mx-auto mb-2 ${unifiedDragOver ? 'text-orange-400' : 'text-gray-300'}`} />
                <p className="text-sm font-medium text-gray-600">Drop photos or a video here, or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">Images: JPG, PNG, WebP up to 5 MB · Video: MP4, MOV up to 100 MB</p>
              </div>

              {/* Image grid */}
              <ProductImageManager images={images} onImagesChange={setImages} onMainImageChange={() => {}} aspectRatio={1} allowCrop maxImages={10} hideUploadZone />
              {uploadProgress.images > 0 && uploadProgress.images < 100 && (
                <div className="rounded-xl bg-orange-50 border border-orange-100 p-3">
                  <div className="flex justify-between text-xs text-orange-700 mb-1.5"><span>Uploading images…</span><span>{uploadProgress.images}%</span></div>
                  <div className="h-1.5 bg-orange-100 rounded-full"><div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${uploadProgress.images}%` }} /></div>
                </div>
              )}

              {/* Video preview */}
              {(video || videoUploading) && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Video <span className="text-gray-400 font-normal text-xs">(optional)</span></span>
                  </div>
                  <ProductVideoManager
                    video={video}
                    onVideoChange={v => { setVideo(v); if (v && !v.isExisting) { setVideoUploading(true); setTimeout(() => setVideoUploading(false), 1000); } }}
                    disabled={loading || videoUploading}
                    maxSize={100 * 1024 * 1024}
                    hideUploadZone
                  />
                  {uploadProgress.video > 0 && uploadProgress.video < 100 && (
                    <div className="rounded-xl bg-purple-50 border border-purple-100 p-3 mt-3">
                      <div className="flex justify-between text-xs text-purple-700 mb-1.5"><span>Uploading video…</span><span>{uploadProgress.video}%</span></div>
                      <div className="h-1.5 bg-purple-100 rounded-full"><div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${uploadProgress.video}%` }} /></div>
                    </div>
                  )}
                  {videoUploading && (
                    <div className="flex items-center gap-2 text-amber-600 text-xs mt-2">
                      <div className="animate-spin w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full" />
                      Processing video…
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ② Title & Description */}
          <div ref={secRef('details')} id="details" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900 text-[15px]">Title & Description</h2>
              <p className="text-xs text-gray-400 mt-0.5">Help buyers understand and find your listing.</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Product ID <span className="text-red-400">*</span></label>
                  <input type="text" required disabled={!!editingProduct || isFormDisabled}
                    value={formData.productId} onChange={e => handleInputChange('productId', e.target.value)}
                    className={inputCls} placeholder="e.g. PROD001" />
                </div>
                <div>
                  <label className={labelCls}>Product Name <span className="text-red-400">*</span></label>
                  <input type="text" required disabled={isFormDisabled}
                    value={formData.name} onChange={e => handleInputChange('name', e.target.value)}
                    className={inputCls} placeholder="e.g. Marble Coffee Table" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                <textarea
                  ref={descTextareaRef}
                  required
                  disabled={isFormDisabled}
                  value={formData.description}
                  onChange={e => {
                    handleInputChange('description', e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  className={`${inputCls} resize-none overflow-hidden`}
                  style={{ minHeight: '96px' }}
                  placeholder="Describe your product — materials, dimensions, craftsmanship…"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Sub Description <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                  <span className={`text-xs ${formData.subDescription.length > 160 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>{formData.subDescription.length}/160</span>
                </div>
                <input type="text" maxLength={160} disabled={isFormDisabled}
                  value={formData.subDescription} onChange={e => handleInputChange('subDescription', e.target.value)}
                  className={inputCls} placeholder="Short subtitle shown below the product name (max 160 chars)" />
              </div>
              <div className="flex gap-5 pt-1">
                {[
                  { field: 'available', label: 'Available for Sale', checked: formData.available },
                  { field: 'featured',  label: 'Featured Product',   checked: formData.featured },
                ].map(({ field, label, checked }) => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={checked} disabled={isFormDisabled}
                      onChange={e => handleInputChange(field, e.target.checked)}
                      className="w-4 h-4 text-orange-500 rounded border-gray-300 disabled:opacity-50" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ③ Listing Details */}
          <div ref={secRef('listing-details')} id="listing-details" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900 text-[15px]">Listing Details</h2>
              <p className="text-xs text-gray-400 mt-0.5">Category, status and visibility settings.</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category <span className="text-red-400">*</span></label>
                  <select value={formData.category} disabled={isFormDisabled}
                    onChange={e => { setFormData(prev => ({ ...prev, category: e.target.value, subcategory: '' })); setShowCustomSubcategory(false); setCustomSubcategory(''); }}
                    className={inputCls}>
                    <option value="furniture">Furniture</option>
                    <option value="handicraft">Handicraft</option>
                    <option value="leather">Leather</option>
                    <option value="semi-precious-stone">Semi Precious Stone</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={formData.status} onChange={e => handleInputChange('status', e.target.value)} className={inputCls}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Subcategory <span className="text-red-400">*</span></label>
                <select required={!showCustomSubcategory}
                  value={showCustomSubcategory ? 'custom' : formData.subcategory}
                  onChange={e => {
                    if (e.target.value === 'custom') { setShowCustomSubcategory(true); setCustomSubcategory(''); }
                    else { setShowCustomSubcategory(false); handleInputChange('subcategory', e.target.value); }
                  }}
                  className={inputCls}>
                  <option value="">Select subcategory…</option>
                  {availableSubcategories.map(sub => (
                    <option key={sub} value={sub}>{sub.charAt(0).toUpperCase() + sub.slice(1).replace('-', ' ')}</option>
                  ))}
                  <option value="custom">➕ Add Custom Subcategory</option>
                </select>
                {showCustomSubcategory && (
                  <input type="text" required value={customSubcategory} onChange={e => setCustomSubcategory(e.target.value)}
                    placeholder="Enter custom subcategory" className={`${inputCls} mt-2`} />
                )}
              </div>
            </div>
          </div>

          {/* ④ Pricing */}
          <div ref={secRef('pricing')} id="pricing" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900 text-[15px]">Pricing</h2>
              <p className="text-xs text-gray-400 mt-0.5">Set your price and optional discount.</p>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Price input — sq/ft for semi-precious-stone, regular price otherwise */}
              {formData.category === 'semi-precious-stone' ? (
                <div>
                  <label className={labelCls}>Price per Sq.ft (INR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none">₹</span>
                    <input type="number" min="0" value={pricePerSqFtINR}
                      onChange={e => setPricePerSqFtINR(e.target.value)}
                      disabled={isFormDisabled}
                      className={`${inputCls} pl-8`} placeholder="e.g. 450" />
                  </div>
                  {pricePerSqFtINR && parseFloat(pricePerSqFtINR) > 0 && (
                    <p className="text-xs text-gray-400 mt-1.5">Shown as ₹{parseFloat(pricePerSqFtINR).toLocaleString('en-IN')} / sq.ft to customers</p>
                  )}
                  <p className="text-xs text-purple-500 mt-1.5">Customers will see this price and request a quotation — no cart/checkout.</p>
                </div>
              ) : (
                <div>
                  <label className={labelCls}>Price (INR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none">₹</span>
                    <input type="number" min="0" value={priceINR} onChange={e => handlePriceINRChange(e.target.value)} disabled={isFormDisabled}
                      className={`${inputCls} pl-8`} placeholder="e.g. 83500" />
                  </div>
                  {priceINR && parseFloat(priceINR) > 0 && (
                    <p className="text-xs text-gray-400 mt-1.5">≈ ${(parseFloat(priceINR) / liveRate('INR')).toFixed(2)} USD</p>
                  )}
                </div>
              )}

              {/* Discount */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.discount.enabled}
                    onChange={e => handleInputChange('discount.enabled', e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-800">Enable Discount</span>
                </label>

                {formData.discount.enabled && (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Discount % <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <input type="number" min="0" max="100" step="0.01"
                            value={formData.discount.percentage}
                            onChange={e => { const v = parseFloat(e.target.value) || 0; if (v >= 0 && v <= 100) handleInputChange('discount.percentage', v); }}
                            className={`${inputCls} pr-8 ${formData.discount.percentage <= 0 ? 'border-red-300 bg-red-50' : ''}`}
                            placeholder="e.g. 10" required={formData.discount.enabled} />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">%</span>
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Label</label>
                        <input type="text" maxLength={200} value={formData.discount.description}
                          onChange={e => handleInputChange('discount.description', e.target.value)}
                          placeholder="e.g. Summer Sale" className={inputCls} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Start Date</label>
                        <input type="datetime-local" value={formData.discount.startDate || ''}
                          onChange={e => handleInputChange('discount.startDate', e.target.value || null)}
                          className={`${inputCls} ${formData.discount.startDate && formData.discount.endDate && new Date(formData.discount.startDate) >= new Date(formData.discount.endDate) ? 'border-red-300' : ''}`} />
                        <p className="text-xs text-gray-400 mt-1">Leave empty for immediate start</p>
                      </div>
                      <div>
                        <label className={labelCls}>End Date</label>
                        <input type="datetime-local" value={formData.discount.endDate || ''}
                          onChange={e => handleInputChange('discount.endDate', e.target.value || null)}
                          className={`${inputCls} ${formData.discount.startDate && formData.discount.endDate && new Date(formData.discount.startDate) >= new Date(formData.discount.endDate) ? 'border-red-300' : ''}`} />
                        <p className="text-xs text-gray-400 mt-1">Leave empty for no expiration</p>
                      </div>
                    </div>
                    {formData.discount.startDate && formData.discount.endDate && new Date(formData.discount.startDate) >= new Date(formData.discount.endDate) && (
                      <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">⚠️ Start date must be before end date</p>
                    )}
                    {/* Discount preview */}
                    {formData.discount.percentage > 0 && formData.priceUSD && (
                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                        {[
                          { label: 'Original', val: `₹${Math.round(parseFloat(formData.priceUSD) * liveRate('INR')).toLocaleString('en-IN')}`, cls: 'text-gray-700' },
                          { label: 'Discount', val: `−${formData.discount.percentage}%`, cls: 'text-red-500' },
                          { label: 'Final Price', val: `₹${Math.round(parseFloat(formData.priceUSD) * (1 - formData.discount.percentage / 100) * liveRate('INR')).toLocaleString('en-IN')}`, cls: 'text-orange-600 font-bold' },
                          { label: 'You Save', val: `₹${Math.round(parseFloat(formData.priceUSD) * formData.discount.percentage / 100 * liveRate('INR')).toLocaleString('en-IN')}`, cls: 'text-green-600' },
                        ].map(({ label, val, cls }) => (
                          <div key={label}>
                            <p className="text-xs text-gray-400">{label}</p>
                            <p className={`font-semibold mt-0.5 ${cls}`}>{val}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Regional Pricing (paired with base pricing) ── */}
              <div className="border-t border-gray-100 pt-5 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Regional Pricing</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Override price per region. Leave disabled to use the base price.</p>
                </div>
                <div className="space-y-2">
                  {ALL_REGIONS.map(region => {
                    const rp = regionalPricing[region];
                    const basePrice    = parseFloat(formData.priceUSD?.toString() || '0') || 0;
                    let   previewPrice = basePrice;
                    if (rp.enabled && rp.adjustmentValue) {
                      previewPrice = rp.adjustmentType === 'percentage'
                        ? basePrice * (1 + rp.adjustmentValue / 100)
                        : basePrice + rp.adjustmentValue / liveRate('INR');
                      previewPrice = Math.max(0, Math.round(previewPrice * 100) / 100);
                    }
                    const basePriceINR    = Math.round(basePrice    * liveRate('INR'));
                    const premiumPriceINR = Math.round(previewPrice * liveRate('INR'));
                    const code            = REGION_CURRENCY_CODE[region];
                    const sym             = REGION_CURRENCY_SYMBOL[region];
                    const regionRate      = liveRate(code);
                    const basePriceReg    = parseFloat((basePrice    * regionRate).toFixed(2));
                    const premiumPriceReg = parseFloat((previewPrice * regionRate).toFixed(2));

                    return (
                      <div key={region} className={`rounded-xl border p-3.5 transition-colors ${rp.enabled ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <input type="checkbox" id={`rp-${region}`} checked={rp.enabled}
                              onChange={e => setRegionalPricing(prev => ({ ...prev, [region]: { ...prev[region], enabled: e.target.checked } }))}
                              className="w-4 h-4 text-orange-500 rounded mt-0.5" disabled={isFormDisabled} />
                            <div>
                              <label htmlFor={`rp-${region}`} className="text-sm font-semibold text-gray-800 cursor-pointer">{region}</label>
                              <p className="text-xs text-gray-400">{REGION_DISPLAY_CURRENCY[region]}</p>
                            </div>
                          </div>
                          {basePrice > 0 && (
                            <div className="text-right text-xs space-y-0.5">
                              <div className="text-gray-500">
                                <span className="text-gray-400">Base: </span>
                                <span className="font-medium">₹{basePriceINR.toLocaleString('en-IN')}</span>
                                {code !== 'INR' && <span className="text-gray-400 ml-1">({sym}{basePriceReg} {code})</span>}
                              </div>
                              {rp.enabled && rp.adjustmentValue !== 0 && (
                                <div className={premiumPriceINR > basePriceINR ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'}>
                                  With: ₹{premiumPriceINR.toLocaleString('en-IN')}
                                  {code !== 'INR' && <span className="opacity-70 ml-1">({sym}{premiumPriceReg} {code})</span>}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {rp.enabled && (
                          <div className="flex gap-2 items-center mt-3 pl-6">
                            <select value={rp.adjustmentType}
                              onChange={e => setRegionalPricing(prev => ({ ...prev, [region]: { ...prev[region], adjustmentType: e.target.value as AdjustmentType } }))}
                              disabled={isFormDisabled}
                              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-orange-400 focus:border-transparent">
                              <option value="percentage">Percentage (%)</option>
                              <option value="fixed">Fixed (₹)</option>
                            </select>
                            <div className="relative flex-1">
                              <input type="number" step={rp.adjustmentType === 'percentage' ? '0.01' : '1'}
                                value={rp.adjustmentValue}
                                onChange={e => setRegionalPricing(prev => ({ ...prev, [region]: { ...prev[region], adjustmentValue: parseFloat(e.target.value) || 0 } }))}
                                placeholder={rp.adjustmentType === 'percentage' ? 'e.g. 10' : 'e.g. 5000'}
                                disabled={isFormDisabled}
                                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 pr-7 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white" />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
                                {rp.adjustmentType === 'percentage' ? '%' : '₹'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* ⑤ Stone Specifications — only for semi-precious-stone */}
          {formData.category === 'semi-precious-stone' && (
            <div ref={secRef('specs')} id="specs" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h2 className="font-semibold text-gray-900 text-[15px]">Stone Specifications</h2>
                <p className="text-xs text-gray-400 mt-0.5">Technical details shown on the product page.</p>
              </div>
              <div className="px-6 py-5 grid grid-cols-2 gap-4">
                {([
                  ['minSlabSize',     'Minimum Slab Size', 'e.g. 180 × 60 cm'],
                  ['maxSlabSize',     'Maximum Slab Size', 'e.g. 280 × 180 cm'],
                  ['thickness',       'Thickness',         'e.g. 10mm / 15mm / 20mm'],
                  ['surfaceFinish',   'Surface Finish',    'e.g. Polished, Honed, Brushed'],
                  ['form',            'Form',              'e.g. Slab, Tile, Custom'],
                  ['material',        'Material',          'e.g. Amethyst, Agate, Onyx'],
                  ['usage',           'Usage',             'e.g. Tabletop, Wall Cladding'],
                  ['moh',             'MOH Hardness',      'e.g. 7'],
                  ['refractiveIndex', 'Refractive Index',  'e.g. 1.544'],
                  ['waterAbsorption', 'Water Absorption',  'e.g. < 0.1%'],
                  ['priceRange',      'Price Range',       'e.g. ₹400 – ₹800 / sq.ft'],
                ] as [keyof typeof stoneSpecs, string, string][]).map(([key, label, placeholder]) => (
                  <div key={key} className={key === 'priceRange' ? 'col-span-2' : ''}>
                    <label className={labelCls}>{label}</label>
                    <input
                      type="text"
                      value={stoneSpecs[key]}
                      onChange={e => setStoneSpecs(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      disabled={isFormDisabled}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ⑤ Product Specs (furniture / other categories) */}
          {formData.category !== 'semi-precious-stone' && (
            <div id="specs" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5">
                <ProductSpecsEditor
                  category={formData.category}
                  furnitureSpecs={formData.furnitureSpecs}
                  customSpecs={customSpecs}
                  onSpecsChange={handleSpecsChange}
                />
              </div>
            </div>
          )}

          {/* ⑥ Similar Products */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900 text-[15px]">Similar Products</h2>
              <p className="text-xs text-gray-400 mt-0.5">Shown as a curated strip at the top of this product's page.</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              {similarProductIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {similarProductIds.map(pid => (
                    <span key={pid} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-full">
                      {pid}
                      <button type="button" onClick={() => removeSimilarProduct(pid)} className="text-gray-400 hover:text-red-500 transition-colors">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <input type="text" value={simSearch} onChange={e => setSimSearch(e.target.value)}
                  placeholder="Search product by name or ID…" className={inputCls} />
                {simSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {simResults.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                    {simResults.map((p: any) => (
                      <button key={p.productId} type="button" onClick={() => addSimilarProduct(p)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm">
                        {p.image && <img src={p.image} alt={p.name} className="w-9 h-9 object-cover rounded-lg flex-shrink-0" />}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.productId}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ⑦ Shipping */}
          <div ref={secRef('shipping')} id="shipping" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-50">
              <Globe className="w-4 h-4 text-gray-400" />
              <div>
                <h2 className="font-semibold text-gray-900 text-[15px]">Shipping</h2>
                <p className="text-xs text-gray-400 mt-0.5">Control which countries this product ships to.</p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">Ships Worldwide</p>
                  <p className="text-xs text-gray-400 mt-0.5">Ship to all countries</p>
                </div>
                <button type="button" disabled={isFormDisabled}
                  onClick={() => setShippingConfig(prev => ({ ...prev, shipsWorldwide: !prev.shipsWorldwide }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${shippingConfig.shipsWorldwide ? 'bg-orange-500' : 'bg-gray-300'} disabled:opacity-50`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${shippingConfig.shipsWorldwide ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {shippingConfig.shipsWorldwide && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Exclude countries <span className="text-gray-400 font-normal text-xs">(optional)</span></p>
                  {shippingConfig.excludedCountries.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {shippingConfig.excludedCountries.map(code => {
                        const c = countries.find(x => x.code === code);
                        return (
                          <span key={code} className="inline-flex items-center gap-1 bg-red-50 border border-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                            {c?.flag} {c?.name || code}
                            <button type="button" disabled={isFormDisabled}
                              onClick={() => setShippingConfig(prev => ({ ...prev, excludedCountries: prev.excludedCountries.filter(x => x !== code) }))}
                              className="ml-0.5 hover:text-red-900 disabled:opacity-50">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="relative">
                    <input type="text" value={excludeSearch} onChange={e => setExcludeSearch(e.target.value)}
                      placeholder="Search country to exclude…" disabled={isFormDisabled} className={inputCls} />
                    {excludeSearch.trim() && (
                      <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
                        {countries
                          .filter(c => !shippingConfig.excludedCountries.includes(c.code) &&
                            (c.name.toLowerCase().includes(excludeSearch.toLowerCase()) || c.code.toLowerCase().includes(excludeSearch.toLowerCase())))
                          .slice(0, 20)
                          .map(c => (
                            <button key={c.code} type="button" disabled={isFormDisabled}
                              onClick={() => { setShippingConfig(prev => ({ ...prev, excludedCountries: [...prev.excludedCountries, c.code] })); setExcludeSearch(''); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left text-sm">
                              <span>{c.flag}</span>
                              <span className="font-medium text-gray-800">{c.name}</span>
                              <span className="text-gray-400 text-xs ml-auto">{c.code}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!shippingConfig.shipsWorldwide && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-sm text-amber-700 font-medium">Product restricted from all countries.</p>
                  <p className="text-xs text-amber-600 mt-0.5">Enable "Ships Worldwide" to allow deliveries.</p>
                </div>
              )}
            </div>
          </div>

      </div>{/* end body */}

    </div>
  );
};

export default EnhancedProductForm;
