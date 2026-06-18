import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, ArrowRight, FolderTree, AlertCircle, Save, X, Search } from 'lucide-react';
import {
    fetchCustomCategories,
    addCustomSubcategory,
    updateCustomSubcategory,
    deleteCustomSubcategory,
} from '../../services/categoryService';
import { productService } from '../../services/productService';
import { adminProductApi } from '../../modules/product/api';
import type { AdminProduct as Product } from '../../modules/product/types';

const panelClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';
const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100';

interface SubcategoryMeta {
    name: string;
    isCustom: boolean;
    productCount: number;
    subcategoryId?: string; // Only for custom
}

interface CategoryMeta {
    categoryId: string;
    subcategories: SubcategoryMeta[];
    totalProducts: number;
}

const CategoryManagement = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<CategoryMeta[]>([]);
    
    // UI State
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('furniture');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Add Subcategory State
    const [newSubcategoryName, setNewSubcategoryName] = useState('');
    
    // Edit Subcategory State
    const [editingSubcategory, setEditingSubcategory] = useState<{ id: string; name: string } | null>(null);

    // Product Assignment State
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [targetSubcategory, setTargetSubcategory] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            const [customData, categoriesData, adminProductsData] = await Promise.all([
                fetchCustomCategories(),
                productService.getCategories(),
                adminProductApi.getAdminProducts({ page: 1, limit: 1000, sortBy: 'name', sortOrder: 'asc' }),
            ]);

            const productList = adminProductsData?.data || [];
            setAllProducts(productList);

            const categoryMap = new Map<string, CategoryMeta>();

            // 1. Process dynamic categories from products
            if (categoriesData.success) {
                categoriesData.data.forEach((item) => {
                    const catId = item.category.toLowerCase();
                    categoryMap.set(catId, {
                        categoryId: catId,
                        totalProducts: item.count || 0,
                        subcategories: (item.subcategories || []).map(sub => ({
                            name: sub,
                            isCustom: false,
                            productCount: 0 
                        }))
                    });
                });
            }

            // 2. Count exact product distributions
            productList.forEach((product) => {
                const catId = String(product.category || '').toLowerCase().trim();
                const subName = String(product.subcategory || '').trim();
                
                if (!catId) return;

                if (!categoryMap.has(catId)) {
                    categoryMap.set(catId, { categoryId: catId, subcategories: [], totalProducts: 0 });
                }
                
                const meta = categoryMap.get(catId)!;
                if (!meta.subcategories.find(s => s.name.toLowerCase() === subName.toLowerCase())) {
                    if (subName) {
                        meta.subcategories.push({ name: subName, isCustom: false, productCount: 0 });
                    }
                }
                
                const sub = meta.subcategories.find(s => s.name.toLowerCase() === subName.toLowerCase());
                if (sub) {
                    sub.productCount++;
                }
            });

            // 3. Inject explicit/custom subcategories
            Object.keys(customData || {}).forEach((catIdRaw) => {
                const catId = catIdRaw.toLowerCase().trim();
                if (!categoryMap.has(catId)) {
                    categoryMap.set(catId, { categoryId: catId, subcategories: [], totalProducts: 0 });
                }
                
                const meta = categoryMap.get(catId)!;
                
                (customData[catIdRaw] || []).forEach((customSub) => {
                    const existing = meta.subcategories.find(s => s.name.toLowerCase() === customSub.name.toLowerCase());
                    if (existing) {
                        existing.isCustom = true;
                        existing.subcategoryId = customSub.id;
                    } else {
                        meta.subcategories.push({
                            name: customSub.name,
                            isCustom: true,
                            subcategoryId: customSub.id,
                            productCount: 0
                        });
                    }
                });
            });

            // Format final array
            const finalCategories = Array.from(categoryMap.values()).map(cat => ({
                ...cat,
                subcategories: cat.subcategories.sort((a, b) => a.name.localeCompare(b.name))
            })).sort((a,b) => a.categoryId.localeCompare(b.categoryId));

            setCategories(finalCategories);
            
            if (finalCategories.length > 0 && !finalCategories.find(c => c.categoryId === selectedCategoryId)) {
                setSelectedCategoryId(finalCategories[0].categoryId);
            }

        } catch (error) {
            console.error('Failed to load category data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const selectedCategoryMeta = categories.find(c => c.categoryId === selectedCategoryId);
    
    // Derived lists correctly ignoring casing where necessary
    const currentSubcategories = selectedCategoryMeta?.subcategories || [];
    const filteredSubcategories = currentSubcategories.filter(sub => 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatCategoryName = (id: string) => id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // ACTION HANDLERS
    const handleAddSubcategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newSubcategoryName.trim();
        if (!selectedCategoryId || !name) return;

        setSaving(true);
        try {
            await addCustomSubcategory(selectedCategoryId, formatCategoryName(selectedCategoryId), name);
            setNewSubcategoryName('');
            await loadData();
        } catch (error: any) {
            alert(error.message || 'Failed to add custom subcategory');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSubcategory = async () => {
        if (!editingSubcategory || !editingSubcategory.name.trim()) return;
        
        setSaving(true);
        try {
            await updateCustomSubcategory(selectedCategoryId, editingSubcategory.id, editingSubcategory.name.trim());
            setEditingSubcategory(null);
            await loadData();
        } catch (error: any) {
            alert(error.message || 'Failed to update custom subcategory');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSubcategory = async (subcategoryId: string, productCount: number) => {
        if (productCount > 0) {
            if (!confirm(`Warning: This subcategory has ${productCount} active products. Are you sure you want to delete it? The products will lose this subcategory mapping.`)) {
                return;
            }
        } else {
            if (!confirm('Delete this custom subcategory?')) return;
        }

        setSaving(true);
        try {
            await deleteCustomSubcategory(selectedCategoryId, subcategoryId);
            await loadData();
        } catch (error: any) {
            alert(error.message || 'Failed to delete custom subcategory');
        } finally {
            setSaving(false);
        }
    };

    const handleAssignProductToSubcategory = async () => {
        if (!selectedProductId || !targetSubcategory) {
            alert('Please select both a product and a subcategory');
            return;
        }

        const product = allProducts.find(p => p.productId === selectedProductId);
        if (!product) return;

        setSaving(true);
        try {
            await adminProductApi.updateProduct(
                product.productId,
                {
                    ...product,
                    category: selectedCategoryId,
                    subcategory: targetSubcategory,
                    preserveExistingImages: true,
                },
                undefined,
                undefined,
                false
            );
            
            setSelectedProductId('');
            setTargetSubcategory('');
            await loadData();
            alert('Product assigned successfully!');
        } catch (error: any) {
            alert(error.message || 'Failed to assign product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mr-3"></div>
                Loading category infrastructure...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="sticky top-4 z-20 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 px-5 py-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-700">
                            <FolderTree size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wider">Navigation Engine</span>
                        </div>
                        <h2 className="mt-1 text-2xl font-bold text-slate-900">Category & Subcategory Routing</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Manage your dynamic product taxonomy. Subcategories explicitly created here are guaranteed to appear in frontend menus, regardless of product count.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar: Master Categories */}
                <div className="lg:col-span-1 space-y-4">
                    <div className={panelClass}>
                        <h3 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Primary Categories</h3>
                        <div className="space-y-2">
                            {categories.map((cat) => {
                                const isActive = cat.categoryId === selectedCategoryId;
                                return (
                                    <button
                                        key={cat.categoryId}
                                        onClick={() => setSelectedCategoryId(cat.categoryId)}
                                        className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                                            isActive 
                                            ? 'bg-emerald-600 text-white shadow-md' 
                                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                                        }`}
                                    >
                                        <div>
                                            <p className={`font-semibold ${isActive ? 'text-white' : 'text-slate-800'}`}>
                                                {formatCategoryName(cat.categoryId)}
                                            </p>
                                            <p className={`text-xs mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                                                {cat.subcategories.length} subcategories
                                            </p>
                                        </div>
                                        {isActive && <ArrowRight size={18} className="text-emerald-200" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Area: Subcategory Management */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Subcategories Editor Panel */}
                    <div className={panelClass}>
                        <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    {formatCategoryName(selectedCategoryId)} Subcategories
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {currentSubcategories.length} active routes
                                </p>
                            </div>
                            
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`${inputClass} pl-9 w-full sm:w-64`}
                                />
                            </div>
                        </div>

                        {/* Add New Subcategory inline form */}
                        <form onSubmit={handleAddSubcategory} className="mb-6 flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <input
                                type="text"
                                value={newSubcategoryName}
                                onChange={(e) => setNewSubcategoryName(e.target.value)}
                                placeholder="Create new guaranteed subcategory (e.g. Marble Tables)"
                                className={inputClass}
                                required
                            />
                            <button
                                type="submit"
                                disabled={saving || !newSubcategoryName.trim()}
                                className="whitespace-nowrap inline-flex items-center gap-2 justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition"
                            >
                                <Plus size={16} /> Add Subcategory
                            </button>
                        </form>

                        {/* Subcategories Data Grid */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">Subcategory Name</th>
                                        <th className="px-5 py-3">Origin</th>
                                        <th className="px-5 py-3">Products</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 relative">
                                    {filteredSubcategories.map((sub, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition">
                                            <td className="px-5 py-3 font-medium text-slate-900">
                                                {editingSubcategory?.id === sub.subcategoryId && sub.isCustom ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            value={editingSubcategory!.name}
                                                            onChange={(e) => setEditingSubcategory({ ...editingSubcategory!, name: e.target.value })}
                                                            className={`${inputClass} py-1.5`}
                                                        />
                                                    </div>
                                                ) : (
                                                    sub.name
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                {sub.isCustom ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                                        Guaranteed <span className="opacity-60 text-[10px] ml-1">(Custom)</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                                        Implicit <span className="opacity-60 text-[10px] ml-1">(From Product)</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                {sub.productCount > 0 ? (
                                                    <span className="font-semibold text-slate-700">{sub.productCount}</span>
                                                ) : (
                                                    <span className="text-amber-500 flex items-center gap-1 text-xs">
                                                        <AlertCircle size={14} /> Empty
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {sub.isCustom ? (
                                                    editingSubcategory?.id === sub.subcategoryId ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={handleUpdateSubcategory} disabled={saving} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                                                <Save size={16} />
                                                            </button>
                                                            <button onClick={() => setEditingSubcategory(null)} disabled={saving} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button 
                                                                onClick={() => setEditingSubcategory({ id: sub.subcategoryId!, name: sub.name })}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteSubcategory(sub.subcategoryId!, sub.productCount)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    )
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic" title="Implicit subcategories are inferred from products and cannot be explicitly deleted. Change the product's subcategory instead.">
                                                        Read-only
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredSubcategories.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                                                No subcategories found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Fast Assign Product Panel */}
                    <div className={panelClass}>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                            Product Subcategory Reassignment
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                            <div className="md:col-span-3">
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Select Product (Any Category)</label>
                                <select 
                                    className={inputClass}
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                >
                                    <option value="">-- Choose Product --</option>
                                    {allProducts.map(p => (
                                        <option key={p.productId} value={p.productId}>{p.name} ({p.subcategory || 'Uncategorized'})</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Target Subcategory</label>
                                <select 
                                    className={inputClass}
                                    value={targetSubcategory}
                                    onChange={(e) => setTargetSubcategory(e.target.value)}
                                >
                                    <option value="">-- Choose Target --</option>
                                    {currentSubcategories.map((sub, idx) => (
                                        <option key={idx} value={sub.name}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    onClick={handleAssignProductToSubcategory}
                                    disabled={saving || !selectedProductId || !targetSubcategory}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                                >
                                    Assign Product
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CategoryManagement;
