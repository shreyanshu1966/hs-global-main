'use client';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { X, Layout } from 'lucide-react';
import { createPortal } from 'react-dom';
import EnhancedProductForm from '../components/EnhancedProductForm';
import { adminProductApi } from '../modules/product/api';
import { formatAdminINR } from '../utils/pricing';

export default function AdminProductFormPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate      = useNavigate();
  const location      = useLocation();
  const isNew         = productId === 'new';

  // Product to edit (passed via navigation state, or fetched below)
  const [editingProduct, setEditingProduct]   = useState<any>(location.state?.product ?? null);
  const [fetchingProduct, setFetchingProduct] = useState(!isNew && !location.state?.product);

  // Page-level loading / preview state
  const [productLoading, setProductLoading]   = useState(false);
  const [previewLoading, setPreviewLoading]   = useState(false);
  const [previewProduct, setPreviewProduct]   = useState<any>(null);
  const [showPreview, setShowPreview]         = useState(false);
  const [saveMessage, setSaveMessage]         = useState<string | null>(null);

  // If editing but product wasn't passed in nav state, fetch it
  useEffect(() => {
    if (isNew || editingProduct) return;
    setFetchingProduct(true);
    adminProductApi.getAdminProducts({ page: 1, limit: 1, search: productId })
      .then(res => {
        const found = res.data?.find((p: any) => p.productId === productId);
        if (found) setEditingProduct(found);
      })
      .catch(console.error)
      .finally(() => setFetchingProduct(false));
  }, [isNew, productId, editingProduct]);

  // Carry the products-list position (page/filters/search/scroll) we arrived with
  // back to the admin page, so "Listings" returns to the exact spot the user was at.
  const listState = location.state?.listState;
  const goBack = () => navigate('/admin', { state: { tab: 'products', listState } });

  // Auto-dismiss the post-save confirmation banner
  useEffect(() => {
    if (!saveMessage) return;
    const t = setTimeout(() => setSaveMessage(null), 4000);
    return () => clearTimeout(t);
  }, [saveMessage]);

  const handleSave = async (productData: any, images: any[], _customSpecs: any[], video?: File | null) => {
    setProductLoading(true);
    try {
      // New gallery files and per-variant files travel in separate FormData fields,
      // each with a token manifest (index-aligned to the files) so the backend can
      // resolve token references in variants[].images to final Cloudinary URLs.
      const galleryNew = images.filter(i => i.file && !i.isExisting && !i.variantOnly);
      const variantNew = images.filter(i => i.file && !i.isExisting && i.variantOnly);

      const newImageFiles      = galleryNew.map(i => i.file!);
      const variantImageFiles  = variantNew.map(i => i.file!);
      const imageTokens        = galleryNew.map(i => i.token ?? '');
      const variantImageTokens = variantNew.map(i => i.token ?? '');
      const existingImageUrls  = images.filter(i => i.isExisting && !i.variantOnly && i.url).map(i => i.url);

      const finalData = { ...productData, existingImages: existingImageUrls, imageTokens, variantImageTokens };

      let saved;
      if (!isNew && editingProduct) {
        saved = await adminProductApi.updateProduct(editingProduct.productId, finalData, newImageFiles, video || null, !video, variantImageFiles);
      } else {
        saved = await adminProductApi.createProduct(finalData, newImageFiles, video || null, variantImageFiles);
      }

      const savedProduct = saved?.data ?? { ...finalData };
      setEditingProduct(savedProduct);
      setSaveMessage(isNew ? 'Product created successfully.' : 'Product updated successfully.');

      // A newly created product must switch to edit mode so a further save
      // updates it instead of creating a duplicate.
      if (isNew && savedProduct?.productId) {
        navigate(`/admin/products/${savedProduct.productId}/edit`, { replace: true, state: { product: savedProduct } });
      }
    } catch (err) {
      console.error('Error saving product:', err);
      throw err;
    } finally {
      setProductLoading(false);
    }
  };

  const handlePreview = async (productData: any, images: any[], video?: File | null) => {
    setPreviewLoading(true);
    try {
      const newImageFiles     = images.filter(i => i.file && !i.isExisting).map(i => i.file!);
      const existingImageUrls = images.filter(i => i.isExisting && i.url).map(i => i.url);
      const res = await adminProductApi.previewProduct(productData, newImageFiles, video || undefined, existingImageUrls);
      if (res.success) { setPreviewProduct(res.data); setShowPreview(true); }
    } catch (err) {
      console.error('Error previewing product:', err);
      alert('Failed to generate preview');
      throw err;
    } finally {
      setPreviewLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Loading product…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {saveMessage && (
        <div className="fixed top-4 right-4 z-[10000] px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-lg shadow-lg">
          {saveMessage}
        </div>
      )}

      <EnhancedProductForm
        editingProduct={isNew ? undefined : editingProduct}
        loading={productLoading}
        previewLoading={previewLoading}
        onSave={handleSave}
        onCancel={goBack}
        onPreview={handlePreview}
      />

      {/* Preview modal */}
      {showPreview && previewProduct && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col"
            style={{ height: '85vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-none px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Layout className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Product Preview</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Preview Mode</span>
              </div>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: images + video */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900">Images & Media</h3>
                  {previewProduct.image && (
                    <div className="relative">
                      <img src={previewProduct.image} alt={previewProduct.name}
                        className="w-full h-72 object-cover rounded-xl border border-gray-100" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded font-semibold">Main</span>
                    </div>
                  )}
                  {previewProduct.images?.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {previewProduct.images.slice(1).map((img: string, i: number) => (
                        <img key={i} src={img} alt={`${previewProduct.name} ${i + 2}`}
                          className="w-full h-16 object-cover rounded-lg border border-gray-100" />
                      ))}
                    </div>
                  )}
                  {previewProduct.hasVideo && previewProduct.videoUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Video</h4>
                      <video src={previewProduct.videoUrl} controls
                        className="w-full max-h-48 rounded-xl border border-gray-100" />
                    </div>
                  )}
                </div>

                {/* Right: details */}
                <div className="space-y-5">
                  <h3 className="text-base font-semibold text-gray-900">Product Details</h3>
                  <dl className="space-y-3 text-sm">
                    {[
                      ['Product ID',   previewProduct.productId],
                      ['Name',         previewProduct.name],
                      ['Category',     previewProduct.category],
                      ['Subcategory',  previewProduct.subcategory],
                      ['Status',       previewProduct.status],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between gap-4 border-b border-gray-50 pb-2">
                        <dt className="text-gray-500 font-medium shrink-0">{label}</dt>
                        <dd className="text-gray-900 capitalize text-right">{val || '—'}</dd>
                      </div>
                    ))}
                    {previewProduct.priceINR && (
                      <div className="flex justify-between gap-4 border-b border-gray-50 pb-2">
                        <dt className="text-gray-500 font-medium">Price</dt>
                        <dd className="text-gray-900 font-semibold">
                          {previewProduct.discount?.enabled && previewProduct.discount.percentage > 0 ? (
                            <span>
                              <span className="text-green-600">{formatAdminINR(previewProduct.priceINR * (1 - previewProduct.discount.percentage / 100))}</span>
                              <span className="ml-2 text-gray-400 line-through text-xs">{formatAdminINR(previewProduct.priceINR)}</span>
                            </span>
                          ) : formatAdminINR(previewProduct.priceINR)}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {previewProduct.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1.5">Description</h4>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{previewProduct.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
