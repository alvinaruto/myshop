'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiGrid, FiPlus, FiEdit2, FiTrash2, FiLoader, FiUsers, FiCheck, FiClock, FiXCircle } from 'react-icons/fi';

interface Table {
    id: string;
    table_number: number;
    name?: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'cleaning';
    section?: string;
    current_order_id?: string;
}

export default function TableManagementPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [sections, setSections] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [formData, setFormData] = useState({
        table_number: '',
        name: '',
        capacity: '4',
        section: ''
    });

    const fetchTables = async () => {
        try {
            const res = await fetch('/api/cafe/tables');
            const data = await res.json();
            if (data.success) {
                setTables(data.data.tables || []);
                setSections(data.data.sections || []);
            }
        } catch (error) {
            toast.error('Failed to load tables');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
        // Refresh every 10 seconds
        const interval = setInterval(fetchTables, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/cafe/tables', {
                method: editingTable ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(editingTable && { id: editingTable.id }),
                    table_number: parseInt(formData.table_number),
                    name: formData.name || null,
                    capacity: parseInt(formData.capacity) || 4,
                    section: formData.section || null
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingTable ? 'Table updated!' : 'Table created!');
                setShowModal(false);
                setEditingTable(null);
                setFormData({ table_number: '', name: '', capacity: '4', section: '' });
                fetchTables();
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save table');
        }
    };

    const updateStatus = async (table: Table, status: string) => {
        try {
            const res = await fetch('/api/cafe/tables', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: table.id, status })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Table ${table.table_number} marked as ${status}`);
                fetchTables();
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    const deleteTable = async (table: Table) => {
        if (!confirm(`Delete table ${table.table_number}?`)) return;

        try {
            const res = await fetch(`/api/cafe/tables?id=${table.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Table removed');
                fetchTables();
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete table');
        }
    };

    const openEditModal = (table: Table) => {
        setEditingTable(table);
        setFormData({
            table_number: table.table_number.toString(),
            name: table.name || '',
            capacity: table.capacity.toString(),
            section: table.section || ''
        });
        setShowModal(true);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-500 border-green-600';
            case 'occupied': return 'bg-red-500 border-red-600';
            case 'reserved': return 'bg-blue-500 border-blue-600';
            case 'cleaning': return 'bg-yellow-500 border-yellow-600';
            default: return 'bg-gray-500 border-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available': return <FiCheck className="w-4 h-4" />;
            case 'occupied': return <FiUsers className="w-4 h-4" />;
            case 'reserved': return <FiClock className="w-4 h-4" />;
            case 'cleaning': return <FiXCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    // Group tables by section
    const tablesBySection = tables.reduce((acc: Record<string, Table[]>, table) => {
        const section = table.section || 'Main';
        if (!acc[section]) acc[section] = [];
        acc[section].push(table);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <FiLoader className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiGrid className="text-amber-500" />
                        Table Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage tables and track their status</p>
                </div>
                <button
                    onClick={() => {
                        setEditingTable(null);
                        setFormData({ table_number: '', name: '', capacity: '4', section: '' });
                        setShowModal(true);
                    }}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <FiPlus className="w-5 h-5" />
                    Add Table
                </button>
            </div>

            {/* Status Legend */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-4">
                    {['available', 'occupied', 'reserved', 'cleaning'].map((status) => (
                        <div key={status} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${getStatusStyle(status)}`}></div>
                            <span className="text-sm capitalize">{status}</span>
                        </div>
                    ))}
                    <div className="ml-auto text-sm text-gray-500">
                        Total: {tables.length} | Available: {tables.filter(t => t.status === 'available').length}
                    </div>
                </div>
            </div>

            {/* Tables by Section */}
            {Object.entries(tablesBySection).map(([section, sectionTables]) => (
                <div key={section} className="card p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{section}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {sectionTables.sort((a, b) => a.table_number - b.table_number).map((table) => (
                            <div
                                key={table.id}
                                className={`relative rounded-xl border-4 p-4 text-center text-white transition-all hover:scale-105 cursor-pointer ${getStatusStyle(table.status)}`}
                            >
                                {/* Table Number */}
                                <div className="text-3xl font-bold mb-1">{table.table_number}</div>

                                {/* Table Name */}
                                {table.name && (
                                    <div className="text-xs opacity-80 mb-1 truncate">{table.name}</div>
                                )}

                                {/* Capacity */}
                                <div className="text-xs flex items-center justify-center gap-1 opacity-80">
                                    <FiUsers className="w-3 h-3" />
                                    {table.capacity}
                                </div>

                                {/* Status Icon */}
                                <div className="absolute top-2 right-2">
                                    {getStatusIcon(table.status)}
                                </div>

                                {/* Actions Dropdown */}
                                <div className="absolute top-2 left-2 opacity-0 hover:opacity-100 transition-opacity">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEditModal(table); }}
                                            className="p-1 bg-white/20 rounded hover:bg-white/30"
                                        >
                                            <FiEdit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteTable(table); }}
                                            className="p-1 bg-white/20 rounded hover:bg-white/30"
                                        >
                                            <FiTrash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Status Change */}
                                <div className="mt-3 flex gap-1 justify-center">
                                    {table.status !== 'available' && (
                                        <button
                                            onClick={() => updateStatus(table, 'available')}
                                            className="text-[10px] bg-white/20 px-2 py-0.5 rounded hover:bg-white/30"
                                        >
                                            Free
                                        </button>
                                    )}
                                    {table.status !== 'occupied' && (
                                        <button
                                            onClick={() => updateStatus(table, 'occupied')}
                                            className="text-[10px] bg-white/20 px-2 py-0.5 rounded hover:bg-white/30"
                                        >
                                            Seat
                                        </button>
                                    )}
                                    {table.status !== 'cleaning' && (
                                        <button
                                            onClick={() => updateStatus(table, 'cleaning')}
                                            className="text-[10px] bg-white/20 px-2 py-0.5 rounded hover:bg-white/30"
                                        >
                                            Clean
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {tables.length === 0 && (
                <div className="card p-12 text-center">
                    <FiGrid className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">No tables configured</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary"
                    >
                        Add Your First Table
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            {editingTable ? 'Edit Table' : 'Add New Table'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Table Number *
                                </label>
                                <input
                                    type="number"
                                    value={formData.table_number}
                                    onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                                    className="input w-full"
                                    placeholder="1"
                                    required
                                    disabled={!!editingTable}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input w-full"
                                    placeholder="e.g., Window Seat, VIP Booth"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Capacity
                                </label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    className="input w-full"
                                    placeholder="4"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Section
                                </label>
                                <input
                                    type="text"
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    className="input w-full"
                                    placeholder="e.g., Indoor, Outdoor, Terrace"
                                    list="sections"
                                />
                                <datalist id="sections">
                                    {sections.map((s) => <option key={s} value={s} />)}
                                </datalist>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 btn btn-primary">
                                    {editingTable ? 'Update' : 'Add Table'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
