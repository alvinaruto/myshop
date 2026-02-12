'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiLoader, FiCoffee, FiPackage, FiSearch, FiGrid, FiList } from 'react-icons/fi';

interface Category {
    id: string;
    name: string;
    name_kh?: string;
    icon: string;
    display_order: number;
}

interface MenuItem {
    id: string;
    name: string;
    name_kh?: string;
    description?: string;
    category_id: string;
    base_price: number;
    price_medium?: number;
    price_large?: number;
    has_sizes: boolean;
    has_sugar_option: boolean;
    has_ice_option: boolean;
    image_url?: string;
    is_available: boolean;
    category?: Category;
}

const ICONS = ['☕', '🧊', '🍵', '🥤', '🧃', '🍹', '🥛', '🍩', '🍰', '🥐', '🥪', '🍔'];

// Default coffee images based on drink type
const COFFEE_IMAGES: Record<string, string> = {
    // Hot drinks
    'espresso': 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300&h=300&fit=crop',
    'americano': 'https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=300&h=300&fit=crop',
    'cappuccino': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=300&fit=crop',
    'latte': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=300&fit=crop',
    'mocha': 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=300&h=300&fit=crop',
    'chocolate': 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=300&h=300&fit=crop',
    // Iced drinks
    'cold brew': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=300&fit=crop',
    'frappuccino': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=300&fit=crop',
    'iced': 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300&h=300&fit=crop',
    // Tea
    'matcha': 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=300&h=300&fit=crop',
    'tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop',
    'green tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop',
    // Food
    'croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=300&fit=crop',
    'muffin': 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=300&h=300&fit=crop',
    'default': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop'
};

const getItemImage = (item: MenuItem): string => {
    if (item.image_url) return item.image_url;
    const name = item.name.toLowerCase();
    for (const [key, url] of Object.entries(COFFEE_IMAGES)) {
        if (name.includes(key)) return url;
    }
    return COFFEE_IMAGES.default;
};

export default function CafeMenuPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'categories' | 'items'>('items');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Category form
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', name_kh: '', icon: '☕', display_order: 0 });

    // Menu item form
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [itemForm, setItemForm] = useState({
        name: '', name_kh: '', description: '', category_id: '',
        base_price: 0, price_medium: 0, price_large: 0,
        has_sizes: true, has_sugar_option: true, has_ice_option: true, image_url: ''
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [catRes, itemRes] = await Promise.all([
                fetch('/api/cafe/menu-categories'),
                fetch('/api/cafe/menu-items')
            ]);
            const catData = await catRes.json();
            const itemData = await itemRes.json();
            if (catData.success) setCategories(catData.data);
            if (itemData.success) setMenuItems(itemData.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Category CRUD
    const openCategoryModal = (cat?: Category) => {
        if (cat) {
            setEditingCategory(cat);
            setCategoryForm({ name: cat.name, name_kh: cat.name_kh || '', icon: cat.icon, display_order: cat.display_order });
        } else {
            setEditingCategory(null);
            setCategoryForm({ name: '', name_kh: '', icon: '☕', display_order: categories.length });
        }
        setShowCategoryModal(true);
    };

    const saveCategory = async () => {
        if (!categoryForm.name) {
            toast.error('Name is required');
            return;
        }
        setSaving(true);
        try {
            const url = editingCategory
                ? `/api/cafe/menu-categories/${editingCategory.id}`
                : '/api/cafe/menu-categories';
            const method = editingCategory ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryForm)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            toast.success(editingCategory ? 'Category updated' : 'Category created');
            setShowCategoryModal(false);
            loadData();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const deleteCategory = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        try {
            const res = await fetch(`/api/cafe/menu-categories/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            toast.success('Category deleted');
            loadData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Menu item CRUD
    const openItemModal = (item?: MenuItem) => {
        if (item) {
            setEditingItem(item);
            setItemForm({
                name: item.name,
                name_kh: item.name_kh || '',
                description: item.description || '',
                category_id: item.category_id,
                base_price: item.base_price,
                price_medium: item.price_medium || 0,
                price_large: item.price_large || 0,
                has_sizes: item.has_sizes,
                has_sugar_option: item.has_sugar_option,
                has_ice_option: item.has_ice_option,
                image_url: item.image_url || ''
            });
        } else {
            setEditingItem(null);
            setItemForm({
                name: '', name_kh: '', description: '', category_id: categories[0]?.id || '',
                base_price: 0, price_medium: 0, price_large: 0,
                has_sizes: true, has_sugar_option: true, has_ice_option: true, image_url: ''
            });
        }
        setShowItemModal(true);
    };

    const saveItem = async () => {
        if (!itemForm.name || !itemForm.category_id || !itemForm.base_price) {
            toast.error('Name, category, and price are required');
            return;
        }
        setSaving(true);
        try {
            const url = editingItem
                ? `/api/cafe/menu-items/${editingItem.id}`
                : '/api/cafe/menu-items';
            const method = editingItem ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemForm)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            toast.success(editingItem ? 'Item updated' : 'Item created');
            setShowItemModal(false);
            loadData();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const deleteItem = async (id: string) => {
        if (!confirm('Delete this menu item?')) return;
        try {
            const res = await fetch(`/api/cafe/menu-items/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            toast.success('Item deleted');
            loadData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const toggleAvailability = async (item: MenuItem) => {
        try {
            const res = await fetch(`/api/cafe/menu-items/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_available: !item.is_available })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            loadData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const filteredItems = menuItems.filter(item =>
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name_kh?.includes(searchQuery)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <FiLoader className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiCoffee className="text-amber-500" /> Café Menu Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your coffee shop menu items and categories</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => openCategoryModal()}
                        className="btn btn-outline flex items-center gap-2"
                    >
                        <FiPlus className="w-4 h-4" /> Add Category
                    </button>
                    <button
                        onClick={() => openItemModal()}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <FiPlus className="w-4 h-4" /> Add Menu Item
                    </button>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`px-4 py-2 rounded-lg font-medium transition border ${activeTab === 'items'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        Menu Items ({menuItems.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`px-4 py-2 rounded-lg font-medium transition border ${activeTab === 'categories'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        Categories ({categories.length})
                    </button>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="input pl-10 w-64"
                        />
                    </div>
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="btn btn-outline p-2"
                    >
                        {viewMode === 'grid' ? <FiList /> : <FiGrid />}
                    </button>
                </div>
            </div>

            {/* Categories Tab */}
            {activeTab === 'categories' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="card p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{cat.icon}</span>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                                    {cat.name_kh && <p className="text-sm text-gray-500">{cat.name_kh}</p>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openCategoryModal(cat)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteCategory(cat.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Menu Items Tab */}
            {activeTab === 'items' && (
                <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-3'
                }>
                    {filteredItems.map(item => (
                        <div key={item.id} className={`card overflow-hidden ${!item.is_available ? 'opacity-60' : ''}`}>
                            {viewMode === 'grid' ? (
                                <>
                                    <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={getItemImage(item)}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = COFFEE_IMAGES.default }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                                                {item.name_kh && <p className="text-sm text-gray-500">{item.name_kh}</p>}
                                            </div>
                                            <span className="text-lg font-bold text-amber-600">${parseFloat(String(item.base_price)).toFixed(2)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">{item.category?.name}</p>
                                        <div className="flex justify-between items-center">
                                            <button
                                                onClick={() => toggleAvailability(item)}
                                                className={`px-2 py-1 text-xs rounded-full ${item.is_available
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                {item.is_available ? 'Available' : 'Unavailable'}
                                            </button>
                                            <div className="flex gap-1">
                                                <button onClick={() => openItemModal(item)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => deleteItem(item.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                        <img
                                            src={getItemImage(item)}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = COFFEE_IMAGES.default }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                                        <p className="text-sm text-gray-500">{item.category?.name}</p>
                                    </div>
                                    <span className="text-lg font-bold text-amber-600">${parseFloat(String(item.base_price)).toFixed(2)}</span>
                                    <button
                                        onClick={() => toggleAvailability(item)}
                                        className={`px-2 py-1 text-xs rounded-full ${item.is_available
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {item.is_available ? 'Available' : 'Unavailable'}
                                    </button>
                                    <div className="flex gap-1">
                                        <button onClick={() => openItemModal(item)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => deleteItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h3>
                            <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    className="input"
                                    placeholder="Hot Drinks"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Khmer Name</label>
                                <input
                                    type="text"
                                    value={categoryForm.name_kh}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name_kh: e.target.value })}
                                    className="input"
                                    placeholder="ភេសជ្ជៈក្តៅ"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Icon</label>
                                <div className="flex flex-wrap gap-2">
                                    {ICONS.map(icon => (
                                        <button
                                            key={icon}
                                            onClick={() => setCategoryForm({ ...categoryForm, icon })}
                                            className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 transition ${categoryForm.icon === icon
                                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
                                                : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t flex gap-3">
                            <button onClick={() => setShowCategoryModal(false)} className="flex-1 btn btn-outline">
                                Cancel
                            </button>
                            <button onClick={saveCategory} disabled={saving} className="flex-1 btn btn-primary">
                                {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Item Modal */}
            {showItemModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingItem ? 'Edit Menu Item' : 'New Menu Item'}
                            </h3>
                            <button onClick={() => setShowItemModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={itemForm.name}
                                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                        className="input"
                                        placeholder="Iced Latte"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Khmer Name</label>
                                    <input
                                        type="text"
                                        value={itemForm.name_kh}
                                        onChange={(e) => setItemForm({ ...itemForm, name_kh: e.target.value })}
                                        className="input"
                                        placeholder="ឡាតេទឹកកក"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Category *</label>
                                <select
                                    value={itemForm.category_id}
                                    onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                                    className="input"
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={itemForm.description}
                                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                                    className="input"
                                    rows={2}
                                    placeholder="Smooth espresso with cold milk and ice"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Regular Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={itemForm.base_price || ''}
                                        onChange={(e) => setItemForm({ ...itemForm, base_price: parseFloat(e.target.value) || 0 })}
                                        className="input"
                                        placeholder="3.50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Medium Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={itemForm.price_medium || ''}
                                        onChange={(e) => setItemForm({ ...itemForm, price_medium: parseFloat(e.target.value) || 0 })}
                                        className="input"
                                        placeholder="4.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Large Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={itemForm.price_large || ''}
                                        onChange={(e) => setItemForm({ ...itemForm, price_large: parseFloat(e.target.value) || 0 })}
                                        className="input"
                                        placeholder="4.50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={itemForm.has_sizes}
                                        onChange={(e) => setItemForm({ ...itemForm, has_sizes: e.target.checked })}
                                        className="w-4 h-4 text-amber-500"
                                    />
                                    <span className="text-sm">Has size options (S/M/L)</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={itemForm.has_sugar_option}
                                        onChange={(e) => setItemForm({ ...itemForm, has_sugar_option: e.target.checked })}
                                        className="w-4 h-4 text-amber-500"
                                    />
                                    <span className="text-sm">Has sugar level option</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={itemForm.has_ice_option}
                                        onChange={(e) => setItemForm({ ...itemForm, has_ice_option: e.target.checked })}
                                        className="w-4 h-4 text-amber-500"
                                    />
                                    <span className="text-sm">Has ice level option</span>
                                </label>
                            </div>
                        </div>
                        <div className="p-4 border-t flex gap-3">
                            <button onClick={() => setShowItemModal(false)} className="flex-1 btn btn-outline">
                                Cancel
                            </button>
                            <button onClick={saveItem} disabled={saving} className="flex-1 btn btn-primary">
                                {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
