'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Pencil, Trash2, Users, X, Loader2, Check, Tag } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  perUserLimit: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  code: '',
  discountType: 'percentage' as 'percentage' | 'fixed',
  discountValue: '',
  minOrderAmount: '',
  maxUses: '',
  perUserLimit: '1',
  startDate: '',
  endDate: '',
  isActive: true,
};

export default function CouponManagement() {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [usageModal, setUsageModal] = useState<{ id: string; code: string } | null>(null);
  const [usageLog, setUsageLog] = useState<any[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/coupons?page=${page}&limit=20`, { headers: authHeaders });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      setCoupons(data.coupons);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e: any) {
      setError(e.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, [page]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setSaveError(null);
    setShowModal(true);
  };

  const openEdit = (c: Coupon) => {
    setEditId(c._id);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      minOrderAmount: String(c.minOrderAmount),
      maxUses: c.maxUses === null ? '' : String(c.maxUses),
      perUserLimit: String(c.perUserLimit),
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
      isActive: c.isActive,
    });
    setSaveError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const body: any = {
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: parseFloat(form.minOrderAmount) || 0,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        perUserLimit: parseInt(form.perUserLimit) || 1,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        isActive: form.isActive,
      };

      if (!editId) body.code = form.code;

      const url = editId ? `${API_URL}/coupons/${editId}` : `${API_URL}/coupons`;
      const method = editId ? 'PATCH' : 'POST';

      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);

      setShowModal(false);
      fetchCoupons();
    } catch (e: any) {
      setSaveError(e.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/coupons/${id}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      fetchCoupons();
    } catch (e: any) {
      alert(e.message || 'Failed to delete coupon');
    }
  };

  const handleToggle = async (c: Coupon) => {
    try {
      const res = await fetch(`${API_URL}/coupons/${c._id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      fetchCoupons();
    } catch (e: any) {
      alert(e.message || 'Failed to update coupon');
    }
  };

  const openUsage = async (id: string, code: string) => {
    setUsageModal({ id, code });
    setUsageLog([]);
    setUsageLoading(true);
    try {
      const res = await fetch(`${API_URL}/coupons/${id}/usage`, { headers: authHeaders });
      const data = await res.json();
      if (data.ok) setUsageLog(data.usageLog);
    } finally {
      setUsageLoading(false);
    }
  };

  const getStatusBadge = (c: Coupon) => {
    if (!c.isActive) return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">Inactive</span>;
    const now = new Date();
    if (c.endDate && new Date(c.endDate) < now) return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">Expired</span>;
    if (c.startDate && new Date(c.startDate) > now) return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">Scheduled</span>;
    return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Active</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-lg">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
              <p className="text-sm text-gray-500">{total} coupons total</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            New Coupon
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Tag className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No coupons yet</p>
              <p className="text-sm mt-1">Create your first coupon to get started</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Code', 'Discount', 'Min Order', 'Uses', 'Validity', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">{c.code}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.minOrderAmount > 0 ? `$${c.minOrderAmount.toFixed(2)}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <button onClick={() => openUsage(c._id, c.code)} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                        <Users className="w-3.5 h-3.5" />
                        {c.usedCount}{c.maxUses !== null ? `/${c.maxUses}` : ''}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {c.startDate ? new Date(c.startDate).toLocaleDateString() : '—'}
                      {' → '}
                      {c.endDate ? new Date(c.endDate).toLocaleDateString() : '∞'}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(c)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(c)}
                          title={c.isActive ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded transition-colors ${c.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c._id, c.code)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <span className="text-xs text-gray-500">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-gray-300 rounded text-xs disabled:opacity-40 hover:bg-gray-50">Prev</button>
                <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-gray-300 rounded text-xs disabled:opacity-40 hover:bg-gray-50">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {!editId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SAVE20"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                  <select
                    value={form.discountType}
                    onChange={e => setForm(f => ({ ...f, discountType: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value * {form.discountType === 'percentage' ? '(%)' : '(USD)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={form.discountType === 'percentage' ? 100 : undefined}
                    value={form.discountValue}
                    onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderAmount}
                    onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses (blank = unlimited)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxUses}
                    onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                    placeholder="Unlimited"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label>
                <input
                  type="number"
                  min="1"
                  value={form.perUserLimit}
                  onChange={e => setForm(f => ({ ...f, perUserLimit: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-sm text-gray-700 font-medium">Active</span>
              </label>

              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editId ? 'Save Changes' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Modal */}
      {usageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Usage — {usageModal.code}</h2>
              <button onClick={() => setUsageModal(null)} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {usageLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
              ) : usageLog.length === 0 ? (
                <p className="text-center text-gray-400 py-10 text-sm">No usage recorded yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-200">{['User', 'Order ID', 'Used At'].map(h => <th key={h} className="pb-2 text-left text-xs text-gray-500 font-semibold uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {usageLog.map((entry, i) => (
                      <tr key={i} className="py-2">
                        <td className="py-2 text-gray-700">{entry.userId?.email || entry.userId?.name || '—'}</td>
                        <td className="py-2 font-mono text-xs text-gray-500">{entry.orderId}</td>
                        <td className="py-2 text-gray-500 text-xs">{new Date(entry.usedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
