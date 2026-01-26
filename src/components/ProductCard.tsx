'use client';

import { FiSmartphone, FiCheckCircle, FiMinusCircle } from 'react-icons/fi';
import { resolveImageUrl } from '@/lib/api';

interface Product {
    id: string;
    name: string;
    selling_price: string | number;
    image_url?: string;
    is_serialized: boolean;
    quantity: number;
    available_stock?: number;
    brand?: { name: string };
    category?: { name: string };
}

export const ProductCard = ({ product, onClick }: { product: Product; onClick?: () => void }) => {
    const stock = product.is_serialized ? (product.available_stock ?? 0) : product.quantity;
    const isOutOfStock = stock <= 0;

    return (
        <div
            onClick={onClick}
            className="group relative bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
        >
            {/* Image Placeholder/Image */}
            <div className="aspect-square bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center relative overflow-hidden">
                {product.image_url ? (
                    <img
                        src={resolveImageUrl(product.image_url)}
                        alt={product.name}
                        className="object-contain w-full h-full p-6 group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <FiSmartphone className="w-16 h-16 text-gray-200 dark:text-gray-600" />
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.brand && (
                        <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-primary-600 shadow-sm border border-gray-100 dark:border-gray-800">
                            {product.brand.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
                <div className="mb-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        {product.category?.name || 'Accessories'}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Price</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                            ${Number(product.selling_price).toFixed(2)}
                        </p>
                    </div>

                    <div className="text-right">
                        {isOutOfStock ? (
                            <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs uppercase tracking-widest">
                                <FiMinusCircle />
                                Out Of Stock
                            </div>
                        ) : (
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5 text-green-500 font-bold text-xs uppercase tracking-widest mb-1">
                                    <FiCheckCircle />
                                    In Stock
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium">{stock} units left</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 bg-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
};
