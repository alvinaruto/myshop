'use client';

import { FiX, FiSmartphone, FiCheckCircle, FiMinusCircle, FiInfo, FiTag } from 'react-icons/fi';
import { resolveImageUrl } from '@/lib/api';

interface Product {
    id: string;
    name: string;
    name_kh?: string;
    model?: string;
    sku: string;
    description?: string;
    selling_price: string | number;
    image_url?: string;
    is_serialized: boolean;
    quantity: number;
    available_stock?: number;
    brand?: { name: string };
    category?: { name: string };
    storage_capacity?: string;
    color?: string;
    condition?: string;
}

export const ProductQuickView = ({ product, onClose }: { product: Product; onClose: () => void }) => {
    const stock = product.is_serialized ? (product.available_stock ?? 0) : product.quantity;
    const isOutOfStock = stock <= 0;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row animate-slideIn">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
                >
                    <FiX className="w-6 h-6" />
                </button>

                {/* Left: Image Gallery (Simplified) */}
                <div className="md:w-1/2 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center p-12">
                    {product.image_url ? (
                        <div className="relative w-full aspect-square group">
                            <img
                                src={resolveImageUrl(product.image_url)}
                                alt={product.name}
                                className="object-contain w-full h-full drop-shadow-2xl translate-y-0 group-hover:-translate-y-4 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl flex items-center justify-center">
                                <FiSmartphone className="w-16 h-16 text-primary-500" />
                            </div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No image provided</p>
                        </div>
                    )}
                </div>

                {/* Right: Info */}
                <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            {product.brand && (
                                <span className="bg-primary-50 dark:bg-primary-900/30 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-primary-600 border border-primary-100/50 dark:border-primary-500/20">
                                    {product.brand.name}
                                </span>
                            )}
                            {product.condition && (
                                <span className="bg-gray-100 dark:bg-gray-800 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-gray-500 dark:text-gray-400">
                                    {product.condition}
                                </span>
                            )}
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                            {product.name}
                        </h2>
                        {product.name_kh && (
                            <p className="text-xl font-medium text-gray-400 dark:text-gray-500 font-khmer">{product.name_kh}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <FiTag /> Current Price
                            </p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">
                                ${Number(product.selling_price).toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <FiInfo /> Availability
                            </p>
                            <div className={`flex items-center gap-2 text-lg font-black ${isOutOfStock ? 'text-red-500' : 'text-green-500'}`}>
                                {isOutOfStock ? <FiMinusCircle /> : <FiCheckCircle />}
                                {isOutOfStock ? 'Out Of Stock' : 'In Stock'}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 mb-10 border-t border-gray-100 dark:border-gray-800 pt-8">
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Storage</span>
                            <span className="font-bold text-gray-900 dark:text-white">{product.storage_capacity || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Color</span>
                            <span className="font-bold text-gray-900 dark:text-white">{product.color || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Model/SKU</span>
                            <span className="font-bold text-gray-900 dark:text-white">{product.sku}</span>
                        </div>
                    </div>

                    {product.description && (
                        <div className="mb-10">
                            <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-3">Professional Specs</h4>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm font-medium">
                                {product.description}
                            </p>
                        </div>
                    )}

                    <div className="mt-auto">
                        <button
                            onClick={onClose}
                            className="w-full btn btn-primary py-5 text-sm font-black uppercase tracking-[0.25em] shadow-2xl shadow-primary-500/30 group"
                        >
                            Return To Exhibition
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
