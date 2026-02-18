'use client';

import { FiPlus } from 'react-icons/fi';
import { formatPrice } from '@/lib/khqr.util';

interface CoffeeItem {
    id: string;
    name: string;
    name_kh?: string;
    description?: string;
    image_url?: string;
    base_price: number;
    has_sizes?: boolean;
    is_available?: boolean;
}

interface CoffeeCardProps {
    item: CoffeeItem;
    onClick?: () => void;
    onAdd?: (e: React.MouseEvent) => void;
}

export const CoffeeCard = ({ item, onClick, onAdd }: CoffeeCardProps) => {
    return (
        <div
            onClick={onClick}
            className="group bg-espresso-light rounded-2xl overflow-hidden shadow-xl hover:shadow-gold/10 transition-all duration-500 cursor-pointer flex flex-col h-full border border-white/5 hover:border-gold/30"
        >
            {/* Image Section */}
            <div className="aspect-[4/5] relative overflow-hidden">
                <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 font-serif"
                />

                {/* Availability Overlay */}
                {item.is_available === false && (
                    <div className="absolute inset-0 bg-espresso/80 backdrop-blur-sm flex items-center justify-center">
                        <span className="px-4 py-2 bg-red-950/50 text-red-500 border border-red-500/30 rounded-full font-bold uppercase tracking-widest text-xs">
                            Sold Out
                        </span>
                    </div>
                )}

                {/* Quick Add Button */}
                {item.is_available !== false && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdd?.(e);
                        }}
                        className="absolute bottom-4 right-4 w-12 h-12 bg-gold hover:bg-gold-light text-espresso rounded-full flex items-center justify-center shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10"
                    >
                        <FiPlus className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6 bg-cream flex flex-col flex-1">
                <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex-1">
                        <h3 className="font-serif text-xl text-espresso font-bold group-hover:text-gold-dark transition-colors duration-300">
                            {item.name}
                        </h3>
                        {item.name_kh && (
                            <p className="text-espresso/60 text-sm font-khmer mt-0.5">{item.name_kh}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="font-serif text-lg font-black text-espresso">
                            {formatPrice(item.base_price)}
                        </p>
                    </div>
                </div>

                {item.description && (
                    <p className="text-espresso/70 text-sm line-clamp-2 mt-2 leading-relaxed italic">
                        {item.description}
                    </p>
                )}

                {/* Footer Info */}
                <div className="mt-auto pt-4 flex items-center gap-2">
                    {item.has_sizes && (
                        <div className="flex gap-1.5">
                            {['S', 'M', 'L'].map(size => (
                                <span key={size} className="w-6 h-6 flex items-center justify-center rounded-md border border-espresso/10 text-[10px] font-bold text-espresso/40">
                                    {size}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
