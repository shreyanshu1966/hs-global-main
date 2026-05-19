import React, { useState, useEffect, useRef } from 'react';
import {
  Save, ToggleLeft, ToggleRight, Clock, Tag, Percent, Calendar,
  Image as ImageIcon, Eye, EyeOff, Loader2, Check, AlertCircle,
  ImagePlus, Timer, Bell, LogIn, MessageSquare, Zap, X, RefreshCw
} from 'lucide-react';
import { popupConfigService, PopupConfig, DEFAULT_POPUP_CONFIG } from '../../services/popupConfigService';
import ImageCropper from '../ImageCropper';
import { homePageConfigService } from '../../services/homePageConfigService';

// ─── Reusable field components ─────────────────────────────────

const FieldLabel: React.FC<{ children: React.ReactNode; optional?: boolean }> = ({ children, optional }) => (
  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
    {children}
    {optional && <span className="ml-1.5 normal-case tracking-normal text-gray-400 font-normal">(optional)</span>}
  </label>
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#111827]' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
    <span className="text-sm text-gray-700 font-medium">{label}</span>
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${checked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {checked ? 'Active' : 'Off'}
    </span>
  </div>
);

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

const ImageUploadField: React.FC<ImageUploadProps> = ({ value, onChange, label }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSource, setCropSource] = useState<{ src: string; file: File } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('Max image size is 10MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setCropSource({ src: String(ev.target?.result || ''), file });
    reader.readAsDataURL(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleCropComplete = async (blob: Blob) => {
    if (!cropSource) return;
    try {
      setUploading(true);
      const croppedFile = new File([blob], cropSource.file.name.replace(/\.[^.]+$/, '') + '-cropped.jpg', { type: 'image/jpeg' });
      const url = await homePageConfigService.uploadHomePageImage(croppedFile);
      onChange(url);
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      setCropSource(null);
    }
  };

  return (
    <div>
      <FieldLabel optional>{label}</FieldLabel>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste CDN URL or upload below"
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
        />
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" id={`img-${label}`} />
        <label htmlFor={`img-${label}`} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
          Upload
        </label>
      </div>
      {value && (
        <div className="mt-2 relative w-full h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange('')}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      {cropSource && (
        <ImageCropper
          src={cropSource.src}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropSource(null)}
          fileName={cropSource.file.name}
        />
      )}
    </div>
  );
};

// ─── Expiry preview badge ────────────────────────────────────────

const ExpiryBadge: React.FC<{ expiryDate: string }> = ({ expiryDate }) => {
  if (!expiryDate) return null;
  const label = popupConfigService.getExpiryLabel(expiryDate);
  const isExpired = popupConfigService.isExpired(expiryDate);
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${isExpired ? 'bg-red-100 text-red-600' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
      <Clock className="w-3 h-3" />
      {label}
    </span>
  );
};

// ─── Section card ────────────────────────────────────────────────

const SectionCard: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }> = ({ icon, title, subtitle, children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/60">
      <div className="w-8 h-8 bg-[#111827] rounded-lg flex items-center justify-center text-white flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[#111827] uppercase tracking-wider">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
    <div className="p-6 space-y-5">{children}</div>
  </div>
);

// ─── Main component ──────────────────────────────────────────────

const PopupManagement: React.FC = () => {
  const [config, setConfig] = useState<PopupConfig>(DEFAULT_POPUP_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'entry' | 'exit' | 'toast'>('entry');

  useEffect(() => {
    popupConfigService.getAdminConfig()
      .then(setConfig)
      .catch(err => setError(err.message || 'Failed to load config'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await popupConfigService.updateAdminConfig(config);
      setConfig(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all popup settings to defaults?')) return;
    setSaving(true);
    setError('');
    try {
      const updated = await popupConfigService.updateAdminConfig({ ...DEFAULT_POPUP_CONFIG });
      setConfig(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset');
    } finally {
      setSaving(false);
    }
  };

  const setEntry = (patch: Partial<PopupConfig['entryPopup']>) =>
    setConfig(prev => ({ ...prev, entryPopup: { ...prev.entryPopup, ...patch } }));

  const setExit = (patch: Partial<PopupConfig['exitIntent']>) =>
    setConfig(prev => ({ ...prev, exitIntent: { ...prev.exitIntent, ...patch } }));

  const setToast = (patch: Partial<PopupConfig['pageToast']>) =>
    setConfig(prev => ({ ...prev, pageToast: { ...prev.pageToast, ...patch } }));

  const tabs = [
    { key: 'entry', label: 'Entry Popup', icon: <LogIn className="w-3.5 h-3.5" />, enabled: config.entryPopup.enabled },
    { key: 'exit', label: 'Exit Intent', icon: <Zap className="w-3.5 h-3.5" />, enabled: config.exitIntent.enabled },
    { key: 'toast', label: 'Page Toast', icon: <Bell className="w-3.5 h-3.5" />, enabled: config.pageToast.enabled },
  ] as const;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 flex flex-col items-center gap-3 text-gray-400">
        <Loader2 className="w-7 h-7 animate-spin" />
        <p className="text-sm">Loading popup settings…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111827] uppercase tracking-wider">Popup Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure content, discounts & visibility for all site popups</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all uppercase tracking-wider disabled:opacity-50 ${saved ? 'bg-green-600 text-white' : 'bg-[#111827] text-white hover:bg-[#1f2937]'}`}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save All'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Status overview */}
      <div className="grid grid-cols-3 gap-3">
        {tabs.map(tab => (
          <div key={tab.key} className={`flex items-center gap-2.5 p-3 rounded-xl border ${tab.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tab.enabled ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}>
              {tab.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">{tab.label}</p>
              <p className={`text-[10px] font-medium ${tab.enabled ? 'text-green-600' : 'text-gray-400'}`}>{tab.enabled ? 'Active' : 'Disabled'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === tab.key ? 'bg-white shadow text-[#111827]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Entry Popup Tab ── */}
      {activeTab === 'entry' && (
        <SectionCard
          icon={<LogIn className="w-4 h-4" />}
          title="Entry Popup"
          subtitle="Shown after X seconds on first visit. Captures lead info + shows discount code."
        >
          <Toggle
            checked={config.entryPopup.enabled}
            onChange={(v) => setEntry({ enabled: v })}
            label="Enable entry popup"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Timer (seconds)</FieldLabel>
              <div className="relative">
                <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min={3}
                  max={120}
                  value={config.entryPopup.timerSeconds}
                  onChange={(e) => setEntry({ timerSeconds: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Popup appears after this many seconds</p>
            </div>
          </div>

          <div>
            <FieldLabel>Left panel heading</FieldLabel>
            <input
              type="text"
              value={config.entryPopup.heading}
              onChange={(e) => setEntry({ heading: e.target.value })}
              placeholder="Premium Stone & Marble"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
            />
          </div>

          <div>
            <FieldLabel>Left panel subheading</FieldLabel>
            <input
              type="text"
              value={config.entryPopup.subheading}
              onChange={(e) => setEntry({ subheading: e.target.value })}
              placeholder="Connect with our specialists for custom bulk orders..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
            />
          </div>

          <ImageUploadField
            value={config.entryPopup.backgroundImage}
            onChange={(url) => setEntry({ backgroundImage: url })}
            label="Left panel background image"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Coupon code</FieldLabel>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={config.entryPopup.couponCode}
                  onChange={(e) => setEntry({ couponCode: e.target.value.toUpperCase() })}
                  placeholder="HS10"
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] uppercase"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Shown to user after form submit</p>
            </div>
            <div>
              <FieldLabel>Discount %</FieldLabel>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={config.entryPopup.discountPercentage}
                  onChange={(e) => setEntry({ discountPercentage: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Shown as highlight at top of popup</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 space-y-1">
                <p className="font-medium">Lead form fields (fixed)</p>
                <p>Name · Mobile · Email · Country · Pincode (optional)</p>
                <p>On submit: user sees the coupon code set above.</p>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Exit Intent Tab ── */}
      {activeTab === 'exit' && (
        <SectionCard
          icon={<Zap className="w-4 h-4" />}
          title="Exit Intent Popup"
          subtitle="Triggers when mouse leaves the browser window. Shows discount to prevent abandonment."
        >
          <Toggle
            checked={config.exitIntent.enabled}
            onChange={(v) => setExit({ enabled: v })}
            label="Enable exit intent popup"
          />

          <div>
            <FieldLabel>Heading</FieldLabel>
            <input
              type="text"
              value={config.exitIntent.heading}
              onChange={(e) => setExit({ heading: e.target.value })}
              placeholder="Exclusive Offer For You"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
            />
          </div>

          <div>
            <FieldLabel>Body text</FieldLabel>
            <textarea
              rows={2}
              value={config.exitIntent.bodyText}
              onChange={(e) => setExit({ bodyText: e.target.value })}
              placeholder="Get 10% off on your first bulk order..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Coupon code</FieldLabel>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={config.exitIntent.couponCode}
                  onChange={(e) => setExit({ couponCode: e.target.value.toUpperCase() })}
                  placeholder="HS10"
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] uppercase"
                />
              </div>
            </div>
            <div>
              <FieldLabel>Discount %</FieldLabel>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={config.exitIntent.discountPercentage}
                  onChange={(e) => setExit({ discountPercentage: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel optional>Coupon expiry date</FieldLabel>
              {config.exitIntent.expiryDate && <ExpiryBadge expiryDate={config.exitIntent.expiryDate} />}
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="datetime-local"
                value={config.exitIntent.expiryDate}
                onChange={(e) => setExit({ expiryDate: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
              />
            </div>
            <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Shown as countdown in popup — creates urgency to buy faster
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3 font-medium">Popup preview</p>
            <div className="bg-[#111827] rounded-xl p-4 text-white max-w-xs">
              <p className="text-[8px] uppercase tracking-[0.3em] text-gray-500 mb-1">Before you go</p>
              <p className="text-base font-light mb-2">{config.exitIntent.heading || 'Exclusive Offer'}</p>
              <p className="text-xs text-gray-400 mb-3">{config.exitIntent.bodyText || 'Special offer for you...'}</p>
              <div className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-gray-500">Code</p>
                  <p className="text-lg font-bold tracking-widest">{config.exitIntent.couponCode || 'HS10'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-gray-500">Discount</p>
                  <p className="text-lg font-bold text-green-400">{config.exitIntent.discountPercentage}%</p>
                </div>
              </div>
              {config.exitIntent.expiryDate && !popupConfigService.isExpired(config.exitIntent.expiryDate) && (
                <p className="text-[9px] text-amber-400 mt-2 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {popupConfigService.getExpiryLabel(config.exitIntent.expiryDate)}
                </p>
              )}
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Page Toast Tab ── */}
      {activeTab === 'toast' && (
        <SectionCard
          icon={<Bell className="w-4 h-4" />}
          title="Page Toast"
          subtitle="Small bottom-right notification that slides in when navigating between pages."
        >
          <Toggle
            checked={config.pageToast.enabled}
            onChange={(v) => setToast({ enabled: v })}
            label="Enable page toast notifications"
          />

          <div>
            <FieldLabel>Message text</FieldLabel>
            <input
              type="text"
              value={config.pageToast.message}
              onChange={(e) => setToast({ message: e.target.value })}
              placeholder="Apply at checkout for marble & stone orders."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Coupon code</FieldLabel>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={config.pageToast.couponCode}
                  onChange={(e) => setToast({ couponCode: e.target.value.toUpperCase() })}
                  placeholder="HS10"
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] uppercase"
                />
              </div>
            </div>
            <div>
              <FieldLabel>Discount %</FieldLabel>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={config.pageToast.discountPercentage}
                  onChange={(e) => setToast({ discountPercentage: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Auto-dismiss (seconds)</FieldLabel>
              <div className="relative">
                <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min={3}
                  max={30}
                  value={config.pageToast.autoDismissSeconds}
                  onChange={(e) => setToast({ autoDismissSeconds: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
                />
              </div>
            </div>
            <div>
              <FieldLabel>Show every N pages</FieldLabel>
              <input
                type="number"
                min={1}
                max={10}
                value={config.pageToast.showEveryNPages}
                onChange={(e) => setToast({ showEveryNPages: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
              />
              <p className="text-[10px] text-gray-400 mt-1">Toast re-appears every N page navigations</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel optional>Coupon expiry date</FieldLabel>
              {config.pageToast.expiryDate && <ExpiryBadge expiryDate={config.pageToast.expiryDate} />}
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="datetime-local"
                value={config.pageToast.expiryDate}
                onChange={(e) => setToast({ expiryDate: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]"
              />
            </div>
            <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Displays countdown in toast — urgency drives faster purchases
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3 font-medium">Toast preview</p>
            <div className="bg-[#111827] rounded-2xl p-4 text-white max-w-[280px]">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center">
                    <Tag className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-[7px] uppercase tracking-wider text-gray-500">Limited Offer</p>
                    <p className="text-xs font-semibold">{config.pageToast.discountPercentage}% Off Bulk Orders</p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mb-2">{config.pageToast.message || 'Apply at checkout...'}</p>
              <div className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 flex items-center justify-between">
                <div>
                  <p className="text-[7px] text-gray-600">Code</p>
                  <p className="text-sm font-bold tracking-widest">{config.pageToast.couponCode || 'HS10'}</p>
                </div>
                {config.pageToast.expiryDate && !popupConfigService.isExpired(config.pageToast.expiryDate) && (
                  <p className="text-[8px] text-amber-400 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {popupConfigService.getExpiryLabel(config.pageToast.expiryDate)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Save footer */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button onClick={handleReset} disabled={saving} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors uppercase tracking-wider disabled:opacity-50">
          Reset Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition-all uppercase tracking-wider disabled:opacity-50 ${saved ? 'bg-green-600 text-white' : 'bg-[#111827] text-white hover:bg-[#1f2937]'}`}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};

export default PopupManagement;
