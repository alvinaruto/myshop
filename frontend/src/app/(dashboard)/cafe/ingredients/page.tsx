'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiLoader, FiPackage, FiSearch, FiArrowUp, FiArrowDown, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

interface Ingredient {
    id: string;
    name: string;
    name_kh?: string;
    unit: string;
    cost_per_unit: number;
    quantity: number;
    low_stock_threshold: number;
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

const UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'cups', 'shots', 'tbsp', 'tsp'];

export default function IngredientsPage() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    // Form
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Ingredient | null>(null);
    const [form, setForm] = useState({
        name: '', name_kh: '', unit: 'g', cost_per_unit: 0, quantity: 0, low_stock_threshold: 10
    });

    // Stock adjustment
    const [showStockModal, setShowStockModal] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
    const [stockForm, setStockForm] = useState({ type: 'in', quantity: 0, notes: '' });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [showLowStockOnly]);

    const loadData = async () => {
        setLoading(true);
        try {
            const url = showLowStockOnly
                ? '/api/cafe/ingredients?low_stock=true'
                : '/api/cafe/ingredients';
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) setIngredients(data.data);
        } catch (error) {
            toast.error('Failed to load ingredients');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (ing?: Ingredient) => {
        if (ing) {
            setEditing(ing);
            setForm({
                name: ing.name,
                name_kh: ing.name_kh || '',
                unit: ing.unit,
                cost_per_unit: ing.cost_per_unit,
                quantity: ing.quantity,
                low_stock_threshold: ing.low_stock_threshold
            });
        } else {
            setEditing(null);
            setForm({ name: '', name_kh: '', unit: 'g', cost_per_unit: 0, quantity: 0, low_stock_threshold: 10 });
        }
        setShowModal(true);
    };

    const saveIngredient = async () => {
        if (!form.name || !form.unit) {
            toast.error('Name and unit are required');
            return;
        }
        setSaving(true);
        try {
            const url = editing ? `/api/cafe/ingredients/${editing.id}` : '/api/cafe/ingredients';
            const method = editing ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            toast.success(editing ? 'Ingredient updated' : 'Ingredient created');
            setShowModal(false);
            loadData();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const deleteIngredient = async (id: string) => {
        if (!confirm('Delete this ingredient?')) return;
        try {
            const res = await fetch(`/api/cafe/ingredients/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            toast.success('Ingredient deleted');
            loadData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const openStockModal = (ing: Ingredient) => {
        setSelectedIngredient(ing);
        setStockForm({ type: 'in', quantity: 0, notes: '' });
        setShowStockModal(true);
    };

    const adjustStock = async () => {
        if (!stockForm.quantity || stockForm.quantity <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/cafe/ingredients/${selectedIngredient!.id}/stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stockForm)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            toast.success(data.message);
            setShowStockModal(false);
            loadData();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredIngredients = ingredients.filter(ing =>
        !searchQuery ||
        ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ing.name_kh?.includes(searchQuery)
    );

    const lowStockCount = ingredients.filter(i => i.stock_status !== 'in_stock').length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'in_stock': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'low_stock': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'out_of_stock': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

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
                        <FiPackage className="text-amber-500" /> Ingredient Stock
                    </h1>
                    <p className="text-gray-500">Manage coffee shop ingredients and supplies</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <FiPlus className="w-4 h-4" /> Add Ingredient
                </button>
            </div>

            {/* Low Stock Alert */}
            {lowStockCount > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 flex items-center gap-3">
                    <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
                    <div>
                        <p className="font-bold text-yellow-800 dark:text-yellow-200">Low Stock Alert</p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            {lowStockCount} ingredient{lowStockCount > 1 ? 's' : ''} running low
                        </p>
                    </div>
                    <button
                        onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                        className={`ml-auto px-3 py-1 rounded-lg text-sm font-medium ${showLowStockOnly
                                ? 'bg-yellow-600 text-white'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            }`}
                    >
                        {showLowStockOnly ? 'Show All' : 'Show Low Stock'}
                    </button>
                </div>
            )}

            {/* Search & Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search ingredients..."
                        className="input pl-10 w-full"
                    />
                </div>
                <button onClick={loadData} className="btn btn-outline p-2" title="Refresh">
                    <FiRefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Ingredients Table */}
            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Ingredient</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Unit</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">Cost/Unit</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">Stock</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredIngredients.map(ing => (
                            <tr key={ing.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900 dark:text-white">{ing.name}</p>
                                    {ing.name_kh && <p className="text-sm text-gray-500">{ing.name_kh}</p>}
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{ing.unit}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                                    ${parseFloat(String(ing.cost_per_unit)).toFixed(4)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {parseFloat(String(ing.quantity)).toLocaleString()}
                                    </span>
                                    <span className="text-gray-500 ml-1">{ing.unit}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ing.stock_status)}`}>
                                        {ing.stock_status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => openStockModal(ing)}
                                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                                            title="Adjust Stock"
                                        >
                                            <FiArrowUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openModal(ing)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                            title="Edit"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteIngredient(ing.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            title="Delete"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredIngredients.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        <FiPackage className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No ingredients found</p>
                    </div>
                )}
            </div>

            {/* Ingredient Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editing ? 'Edit Ingredient' : 'New Ingredient'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="input"
                                        placeholder="Espresso Beans"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Khmer Name</label>
                                    <input
                                        type="text"
                                        value={form.name_kh}
                                        onChange={(e) => setForm({ ...form, name_kh: e.target.value })}
                                        className="input"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Unit *</label>
                                    <select
                                        value={form.unit}
                                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                        className="input"
                                    >
                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Cost per Unit ($)</label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={form.cost_per_unit || ''}
                                        onChange={(e) => setForm({ ...form, cost_per_unit: parseFloat(e.target.value) || 0 })}
                                        className="input"
                                        placeholder="0.05"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Initial Stock</label>
                                    <input
                                        type="number"
                                        value={form.quantity || ''}
                                        onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
                                        className="input"
                                        placeholder="1000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Low Stock Alert</label>
                                    <input
                                        type="number"
                                        value={form.low_stock_threshold || ''}
                                        onChange={(e) => setForm({ ...form, low_stock_threshold: parseFloat(e.target.value) || 0 })}
                                        className="input"
                                        placeholder="100"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t flex gap-3">
                            <button onClick={() => setShowModal(false)} className="flex-1 btn btn-outline">Cancel</button>
                            <button onClick={saveIngredient} disabled={saving} className="flex-1 btn btn-primary">
                                {saving ? <FiLoader className="animate-spin" /> : <FiSave />} Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Adjustment Modal */}
            {showStockModal && selectedIngredient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Adjust Stock: {selectedIngredient.name}
                            </h3>
                            <button onClick={() => setShowStockModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-500">Current Stock</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {parseFloat(String(selectedIngredient.quantity)).toLocaleString()} {selectedIngredient.unit}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Transaction Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { value: 'in', label: 'Stock In', color: 'green' },
                                        { value: 'out', label: 'Stock Out', color: 'red' },
                                        { value: 'adjustment', label: 'Set Value', color: 'blue' },
                                        { value: 'waste', label: 'Waste', color: 'orange' }
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setStockForm({ ...stockForm, type: opt.value })}
                                            className={`py-2 px-2 rounded-lg text-xs font-medium transition ${stockForm.type === opt.value
                                                    ? `bg-${opt.color}-500 text-white`
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {stockForm.type === 'adjustment' ? 'New Total Quantity' : 'Quantity'} ({selectedIngredient.unit})
                                </label>
                                <input
                                    type="number"
                                    value={stockForm.quantity || ''}
                                    onChange={(e) => setStockForm({ ...stockForm, quantity: parseFloat(e.target.value) || 0 })}
                                    className="input text-lg"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                                <input
                                    type="text"
                                    value={stockForm.notes}
                                    onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
                                    className="input"
                                    placeholder="Purchase from supplier"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t flex gap-3">
                            <button onClick={() => setShowStockModal(false)} className="flex-1 btn btn-outline">Cancel</button>
                            <button onClick={adjustStock} disabled={saving} className="flex-1 btn btn-primary">
                                {saving ? <FiLoader className="animate-spin" /> : <FiSave />} Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
