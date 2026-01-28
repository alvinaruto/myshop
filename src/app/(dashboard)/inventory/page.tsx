'use client';

import { useState, useEffect } from 'react';
import { productApi, categoryApi, brandApi, serialApi, resolveImageUrl } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiX, FiPackage, FiSmartphone, FiTag, FiPrinter } from 'react-icons/fi';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ProductLabel } from '@/components/ProductLabel';
import { BarcodePrintModal } from '@/components/BarcodePrintModal';

interface Product {
    id: string;
    name: string;
    name_kh?: string;
    sku: string;
    barcode?: string;
    cost_price?: number;
    selling_price: number;
    is_serialized: boolean;
    quantity: number;
    low_stock_threshold: number;
    color?: string;
    storage_capacity?: string;
    condition: string;
    image_url?: string;
    category?: { id: string; name: string };
    brand?: { id: string; name: string };
}

interface Category {
    id: string;
    name: string;
    name_kh?: string;
    is_serialized: boolean;
}

interface Brand {
    id: string;
    name: string;
}

export default function InventoryPage() {
    const { canViewCostPrice } = useAuthStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showImeiModal, setShowImeiModal] = useState(false);
    const [selectedProductForImei, setSelectedProductForImei] = useState<Product | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);

    const labelRef = useRef<HTMLDivElement>(null);
    const [printingProduct, setPrintingProduct] = useState<Product | null>(null);

    const handlePrintLabel = useReactToPrint({
        content: () => labelRef.current,
        onAfterPrint: () => setPrintingProduct(null)
    });

    useEffect(() => {
        if (printingProduct) {
            handlePrintLabel();
        }
    }, [printingProduct, handlePrintLabel]);

    useEffect(() => {
        loadData();
    }, [page, search, categoryFilter]);

    useEffect(() => {
        loadMasterData();
    }, []);

    const loadMasterData = async () => {
        try {
            const [catRes, brandRes] = await Promise.all([
                categoryApi.getAll(),
                brandApi.getAll(),
            ]);
            setCategories(catRes.data.data);
            setBrands(brandRes.data.data);
        } catch (error) {
            toast.error('Failed to load categories/brands');
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await productApi.getAll({
                page,
                limit: 20,
                search: search || undefined,
                category_id: categoryFilter || undefined,
            });
            setProducts(res.data.data.products);
            setTotalPages(res.data.data.pagination.totalPages);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productApi.delete(id);
            toast.success('Product deleted');
            loadData();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const openAddImei = (product: Product) => {
        setSelectedProductForImei(product);
        setShowImeiModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="hidden">
                {printingProduct && (
                    <ProductLabel ref={labelRef} product={printingProduct} />
                )}
            </div>
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Inventory</h1>
                    <p className="text-gray-500">Manage products and stock</p>
                </div>
                <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="btn btn-primary">
                    <FiPlus className="w-5 h-5" />
                    Add Product
                </button>
                {selectedProducts.length > 0 && (
                    <button
                        onClick={() => setShowBarcodeModal(true)}
                        className="btn btn-outline"
                    >
                        <FiPrinter className="w-5 h-5" />
                        Print Barcodes ({selectedProducts.length})
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-10"
                            placeholder="Search products..."
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="input w-48"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-2 py-3 text-center">
                                    <input
                                        type="checkbox"
                                        checked={products.length > 0 && selectedProducts.length === products.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedProducts(products);
                                            } else {
                                                setSelectedProducts([]);
                                            }
                                        }}
                                        className="w-4 h-4 rounded"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                {canViewCostPrice() && (
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                                )}
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No products found</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-2 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.some(p => p.id === product.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedProducts([...selectedProducts, product]);
                                                    } else {
                                                        setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
                                                    }
                                                }}
                                                className="w-4 h-4 rounded"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
                                                    {product.image_url ? (
                                                        <img src={resolveImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FiSmartphone className="text-gray-300 dark:text-gray-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-white">{product.name}</p>
                                                    {product.brand && <p className="text-sm text-gray-500">{product.brand.name}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{product.sku}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{product.category?.name}</td>
                                        {canViewCostPrice() && (
                                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                                                ${Number(product.cost_price || 0).toFixed(2)}
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-white">
                                            ${Number(product.selling_price).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${product.quantity <= product.low_stock_threshold
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-green-100 text-green-700'
                                                    }`}
                                            >
                                                {product.is_serialized ? 'Track by IMEI' : product.quantity}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {product.is_serialized ? (
                                                <FiSmartphone className="w-4 h-4 mx-auto text-primary-600" />
                                            ) : (
                                                <FiPackage className="w-4 h-4 mx-auto text-gray-400" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                {product.is_serialized && (
                                                    <button
                                                        onClick={() => openAddImei(product)}
                                                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                                                        title="Add IMEI"
                                                    >
                                                        <FiPlus className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setPrintingProduct(product)}
                                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                                                    title="Print Label"
                                                >
                                                    <FiTag className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setEditingProduct(product); setShowModal(true); }}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t flex justify-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Modal */}
            {showModal && (
                <ProductModal
                    product={editingProduct}
                    categories={categories}
                    brands={brands}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadData(); }}
                />
            )}

            {/* IMEI Modal */}
            {showImeiModal && selectedProductForImei && (
                <ImeiModal
                    product={selectedProductForImei}
                    onClose={() => setShowImeiModal(false)}
                    onSave={() => { setShowImeiModal(false); loadData(); }}
                />
            )}

            {/* Barcode Print Modal */}
            {showBarcodeModal && selectedProducts.length > 0 && (
                <BarcodePrintModal
                    products={selectedProducts}
                    onClose={() => {
                        setShowBarcodeModal(false);
                        setSelectedProducts([]);
                    }}
                />
            )}
        </div>
    );
}

function ProductModal({ product, categories, brands, onClose, onSave }: {
    product: Product | null;
    categories: Category[];
    brands: Brand[];
    onClose: () => void;
    onSave: () => void;
}) {
    const [form, setForm] = useState({
        name: product?.name || '',
        name_kh: product?.name_kh || '',
        sku: product?.sku || '',
        barcode: product?.barcode || '',
        category_id: product?.category?.id || '',
        brand_id: product?.brand?.id || '',
        cost_price: product?.cost_price?.toString() || '0',
        selling_price: product?.selling_price?.toString() || '0',
        is_serialized: product?.is_serialized || false,
        quantity: product?.quantity?.toString() || '0',
        low_stock_threshold: product?.low_stock_threshold?.toString() || '5',
        color: product?.color || '',
        storage_capacity: product?.storage_capacity || '',
        condition: product?.condition || 'new',
        image_url: product?.image_url || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = {
                ...form,
                cost_price: parseFloat(form.cost_price),
                selling_price: parseFloat(form.selling_price),
                quantity: parseInt(form.quantity),
                low_stock_threshold: parseInt(form.low_stock_threshold),
            };

            if (product) {
                await productApi.update(product.id, data);
                toast.success('Product updated');
            } else {
                await productApi.create(data);
                toast.success('Product created');
            }
            onSave();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{product ? 'Edit Product' : 'Add Product'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Product Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name (Khmer)</label>
                            <input
                                type="text"
                                value={form.name_kh}
                                onChange={(e) => setForm({ ...form, name_kh: e.target.value })}
                                className="input font-khmer"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-600">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Product Visuals</label>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Preview */}
                            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600 flex-shrink-0 flex items-center justify-center overflow-hidden bg-white dark:bg-gray-800">
                                {form.image_url ? (
                                    <img src={resolveImageUrl(form.image_url)} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <FiSmartphone className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex-1 space-y-3 w-full">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={form.image_url}
                                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                        className="input flex-1 py-2 text-xs"
                                        placeholder="Paste image URL here..."
                                    />
                                    <label className="btn btn-outline py-2 px-4 text-xs cursor-pointer flex-shrink-0">
                                        <FiPlus className="w-4 h-4" />
                                        Upload File
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const formData = new FormData();
                                                    formData.append('image', file);
                                                    try {
                                                        toast.loading('Uploading...', { id: 'uploading' });
                                                        const res = await productApi.uploadImage(formData);
                                                        setForm({ ...form, image_url: res.data.data.url });
                                                        toast.success('Uploaded successfully', { id: 'uploading' });
                                                    } catch (err) {
                                                        toast.error('Upload failed', { id: 'uploading' });
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    Support JPG, PNG (Max 5MB). Direct upload recommended.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">SKU *</label>
                            <input
                                type="text"
                                value={form.sku}
                                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                className="input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Barcode</label>
                            <input
                                type="text"
                                value={form.barcode}
                                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                                className="input"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category *</label>
                            <select
                                value={form.category_id}
                                onChange={(e) => {
                                    const cat = categories.find(c => c.id === e.target.value);
                                    setForm({
                                        ...form,
                                        category_id: e.target.value,
                                        is_serialized: cat?.is_serialized || false
                                    });
                                }}
                                className="input"
                                required
                            >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Brand</label>
                            <select
                                value={form.brand_id}
                                onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                                className="input"
                            >
                                <option value="">Select brand</option>
                                {brands.map((brand) => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Cost Price ($) *</label>
                            <input
                                type="number"
                                value={form.cost_price}
                                onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                                className="input"
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Selling Price ($) *</label>
                            <input
                                type="number"
                                value={form.selling_price}
                                onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                                className="input"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Color</label>
                            <input
                                type="text"
                                value={form.color}
                                onChange={(e) => setForm({ ...form, color: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Storage</label>
                            <input
                                type="text"
                                value={form.storage_capacity}
                                onChange={(e) => setForm({ ...form, storage_capacity: e.target.value })}
                                className="input"
                                placeholder="e.g. 256GB"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Condition</label>
                            <select
                                value={form.condition}
                                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                                className="input"
                            >
                                <option value="new">New</option>
                                <option value="secondhand">Second-hand</option>
                            </select>
                        </div>
                    </div>

                    {!form.is_serialized && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Quantity</label>
                                <input
                                    type="number"
                                    value={form.quantity}
                                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Low Stock Threshold</label>
                                <input
                                    type="number"
                                    value={form.low_stock_threshold}
                                    onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                                    className="input"
                                />
                            </div>
                        </div>
                    )}

                    {form.is_serialized && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                📱 This is a serialized product. Stock is tracked by IMEI/Serial numbers.
                            </p>
                        </div>
                    )}
                </form>

                <div className="p-4 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="btn btn-outline">Cancel</button>
                    <button onClick={handleSubmit} disabled={saving} className="btn btn-primary">
                        {saving ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </div >
        </div >
    );
}

function ImeiModal({ product, onClose, onSave }: {
    product: Product;
    onClose: () => void;
    onSave: () => void;
}) {
    const [imeiList, setImeiList] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        const imeis = imeiList.split('\n').filter(i => i.trim().length > 0);

        if (imeis.length === 0) {
            toast.error('Please enter at least one IMEI');
            return;
        }

        setSaving(true);
        try {
            const items = imeis.map(imei => ({ imei: imei.trim() }));
            const res = await serialApi.bulkCreate(product.id, items);

            toast.success(res.data.message);
            onSave();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add IMEIs');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold">Add IMEI - {product.name}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Enter IMEI numbers (one per line)
                    </label>
                    <textarea
                        value={imeiList}
                        onChange={(e) => setImeiList(e.target.value)}
                        className="input h-48 font-mono"
                        placeholder="352015091234567&#10;352015091234568&#10;352015091234569"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        IMEI must be exactly 15 digits
                    </p>
                </div>

                <div className="p-4 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="btn btn-outline">Cancel</button>
                    <button onClick={handleSubmit} disabled={saving} className="btn btn-primary">
                        {saving ? 'Adding...' : 'Add IMEIs'}
                    </button>
                </div>
            </div>
        </div>
    );
}
