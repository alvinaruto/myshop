import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/db';

/**
 * Seed API for Cambodian Coffee Menu
 * POST /api/cafe/seed-menu - Add popular Cambodian coffee and drink menu items
 */

const CATEGORIES = [
    { name: 'Hot Coffee', name_kh: 'កាហ្វេក្តៅ', icon: '☕', display_order: 1 },
    { name: 'Iced Coffee', name_kh: 'កាហ្វេទឹកកក', icon: '🧊', display_order: 2 },
    { name: 'Frappes & Blended', name_kh: 'ភេសជ្ជៈលាយ', icon: '🥤', display_order: 3 },
    { name: 'Tea', name_kh: 'តែ', icon: '🍵', display_order: 4 },
    { name: 'Fresh Drinks', name_kh: 'ភេសជ្ជៈស្រស់', icon: '🍹', display_order: 5 },
    { name: 'Smoothies', name_kh: 'ស្មូធី', icon: '🫐', display_order: 6 },
    { name: 'Food', name_kh: 'អាហារ', icon: '🥐', display_order: 7 },
];

const MENU_ITEMS = [
    // Hot Coffee
    { category: 'Hot Coffee', name: 'Espresso', name_kh: 'អេស្ប្រេសូ', base_price: 1.50, price_medium: 1.75, price_large: 2.00, description: 'Classic single or double shot espresso' },
    { category: 'Hot Coffee', name: 'Americano', name_kh: 'អាមេរីកាណូ', base_price: 1.75, price_medium: 2.00, price_large: 2.25, description: 'Espresso with hot water' },
    { category: 'Hot Coffee', name: 'Cappuccino', name_kh: 'កាពូឈីណូ', base_price: 2.00, price_medium: 2.50, price_large: 2.75, description: 'Espresso with steamed milk and foam' },
    { category: 'Hot Coffee', name: 'Latte', name_kh: 'ឡាតេ', base_price: 2.00, price_medium: 2.50, price_large: 2.75, description: 'Espresso with steamed milk' },
    { category: 'Hot Coffee', name: 'Mocha', name_kh: 'ម៉ូកា', base_price: 2.25, price_medium: 2.75, price_large: 3.00, description: 'Espresso with chocolate and steamed milk' },
    { category: 'Hot Coffee', name: 'Flat White', name_kh: 'ហ្វ្លែតវ៉ាយ', base_price: 2.25, price_medium: 2.75, price_large: 3.00, description: 'Double espresso with micro-foam milk' },
    { category: 'Hot Coffee', name: 'Vanilla Latte', name_kh: 'វេនីឡាឡាតេ', base_price: 2.25, price_medium: 2.75, price_large: 3.00, description: 'Latte with vanilla syrup' },
    { category: 'Hot Coffee', name: 'Caramel Latte', name_kh: 'ការ៉ាម៉េលឡាតេ', base_price: 2.25, price_medium: 2.75, price_large: 3.00, description: 'Latte with caramel syrup' },
    { category: 'Hot Coffee', name: 'Hot Chocolate', name_kh: 'សូកូឡាក្តៅ', base_price: 2.00, price_medium: 2.50, price_large: 2.75, description: 'Rich hot chocolate', has_ice_option: false },
    { category: 'Hot Coffee', name: 'Hot Matcha Latte', name_kh: 'ម៉ាឆាឡាតេក្តៅ', base_price: 2.50, price_medium: 3.00, price_large: 3.25, description: 'Japanese matcha with steamed milk' },

    // Iced Coffee
    { category: 'Iced Coffee', name: 'Khmer Iced Coffee', name_kh: 'កាហ្វេទឹកកកខ្មែរ', base_price: 1.50, price_medium: 2.00, price_large: 2.50, description: 'Traditional Cambodian coffee with condensed milk' },
    { category: 'Iced Coffee', name: 'Iced Americano', name_kh: 'អាមេរីកាណូទឹកកក', base_price: 2.00, price_medium: 2.50, price_large: 2.75, description: 'Espresso with cold water over ice' },
    { category: 'Iced Coffee', name: 'Iced Latte', name_kh: 'ឡាតេទឹកកក', base_price: 2.25, price_medium: 2.75, price_large: 3.00, description: 'Espresso with cold milk over ice' },
    { category: 'Iced Coffee', name: 'Iced Cappuccino', name_kh: 'កាពូឈីណូទឹកកក', base_price: 2.25, price_medium: 2.75, price_large: 3.00, description: 'Iced coffee with foam' },
    { category: 'Iced Coffee', name: 'Iced Mocha', name_kh: 'ម៉ូកាទឹកកក', base_price: 2.50, price_medium: 3.00, price_large: 3.25, description: 'Espresso with chocolate and cold milk' },
    { category: 'Iced Coffee', name: 'Iced Vanilla Latte', name_kh: 'វេនីឡាឡាតេទឹកកក', base_price: 2.50, price_medium: 3.00, price_large: 3.25, description: 'Iced latte with vanilla' },
    { category: 'Iced Coffee', name: 'Iced Caramel Macchiato', name_kh: 'ការ៉ាម៉េលម៉ាគីយ៉ាតូទឹកកក', base_price: 2.75, price_medium: 3.25, price_large: 3.50, description: 'Layered espresso with caramel and milk' },
    { category: 'Iced Coffee', name: 'Iced Hazelnut Latte', name_kh: 'ហេហ្សលណាតឡាតេទឹកកក', base_price: 2.50, price_medium: 3.00, price_large: 3.25, description: 'Iced latte with hazelnut' },
    { category: 'Iced Coffee', name: 'Coconut Coffee', name_kh: 'កាហ្វេដូង', base_price: 2.50, price_medium: 3.00, price_large: 3.50, description: 'Coffee with coconut milk' },
    { category: 'Iced Coffee', name: 'Iced Matcha Latte', name_kh: 'ម៉ាឆាឡាតេទឹកកក', base_price: 2.75, price_medium: 3.25, price_large: 3.50, description: 'Japanese matcha with cold milk' },
    { category: 'Iced Coffee', name: 'Palm Sugar Latte', name_kh: 'ឡាតេស្ករត្នោត', base_price: 2.50, price_medium: 3.00, price_large: 3.50, description: 'Latte sweetened with Cambodian palm sugar' },
    { category: 'Iced Coffee', name: 'Vietnamese Coffee', name_kh: 'កាហ្វេវៀតណាម', base_price: 2.00, price_medium: 2.50, price_large: 2.75, description: 'Strong drip coffee with condensed milk' },
    { category: 'Iced Coffee', name: 'Cold Brew', name_kh: 'កូលប្រូ', base_price: 2.50, price_medium: 3.00, price_large: 3.50, description: 'Slow-steeped cold brew coffee' },
    { category: 'Iced Coffee', name: 'Salted Cream Coffee', name_kh: 'កាហ្វេគ្រីមប្រៃ', base_price: 2.75, price_medium: 3.25, price_large: 3.50, description: 'Coffee topped with salted cream foam' },

    // Frappes & Blended
    { category: 'Frappes & Blended', name: 'Coffee Frappe', name_kh: 'កាហ្វេហ្វ្រាពេ', base_price: 2.75, price_medium: 3.25, price_large: 3.75, description: 'Blended iced coffee', has_sugar_option: true, has_ice_option: false },
    { category: 'Frappes & Blended', name: 'Mocha Frappe', name_kh: 'ម៉ូកាហ្វ្រាពេ', base_price: 3.00, price_medium: 3.50, price_large: 4.00, description: 'Blended mocha with whipped cream' },
    { category: 'Frappes & Blended', name: 'Caramel Frappe', name_kh: 'ការ៉ាម៉េលហ្វ្រាពេ', base_price: 3.00, price_medium: 3.50, price_large: 4.00, description: 'Blended coffee with caramel' },
    { category: 'Frappes & Blended', name: 'Java Chip Frappe', name_kh: 'ជាវ៉ាឈីបហ្វ្រាពេ', base_price: 3.25, price_medium: 3.75, price_large: 4.25, description: 'Blended coffee with chocolate chips' },
    { category: 'Frappes & Blended', name: 'Matcha Frappe', name_kh: 'ម៉ាឆាហ្វ្រាពេ', base_price: 3.00, price_medium: 3.50, price_large: 4.00, description: 'Blended matcha green tea' },
    { category: 'Frappes & Blended', name: 'Chocolate Frappe', name_kh: 'សូកូឡាហ្វ្រាពេ', base_price: 2.75, price_medium: 3.25, price_large: 3.75, description: 'Blended chocolate drink' },
    { category: 'Frappes & Blended', name: 'Oreo Frappe', name_kh: 'អូរេអូហ្វ្រាពេ', base_price: 3.25, price_medium: 3.75, price_large: 4.25, description: 'Blended cookies and cream' },
    { category: 'Frappes & Blended', name: 'Taro Frappe', name_kh: 'ត្រាវហ្វ្រាពេ', base_price: 3.00, price_medium: 3.50, price_large: 4.00, description: 'Blended taro drink' },

    // Tea
    { category: 'Tea', name: 'Thai Milk Tea', name_kh: 'តែគោថៃ', base_price: 2.00, price_medium: 2.50, price_large: 3.00, description: 'Classic Thai iced tea with milk' },
    { category: 'Tea', name: 'Green Tea Latte', name_kh: 'តែបៃតងឡាតេ', base_price: 2.25, price_medium: 2.75, price_large: 3.00, description: 'Green tea with milk' },
    { category: 'Tea', name: 'Iced Lemon Tea', name_kh: 'តែក្រូចឆ្មារទឹកកក', base_price: 1.75, price_medium: 2.25, price_large: 2.50, description: 'Refreshing iced tea with lemon' },
    { category: 'Tea', name: 'Iced Peach Tea', name_kh: 'តែផ្លែប៉េសទឹកកក', base_price: 2.00, price_medium: 2.50, price_large: 2.75, description: 'Iced tea with peach flavor' },
    { category: 'Tea', name: 'Passion Fruit Tea', name_kh: 'តែផ្លែម៉ារាគុយ៉ា', base_price: 2.25, price_medium: 2.75, price_large: 3.00, description: 'Iced tea infused with passion fruit' },
    { category: 'Tea', name: 'Brown Sugar Milk Tea', name_kh: 'តែគោស្ករត្នោត', base_price: 2.50, price_medium: 3.00, price_large: 3.50, description: 'Milk tea with brown sugar syrup' },
    { category: 'Tea', name: 'Taro Milk Tea', name_kh: 'តែគោត្រាវ', base_price: 2.50, price_medium: 3.00, price_large: 3.50, description: 'Creamy taro flavored milk tea' },
    { category: 'Tea', name: 'Hot Green Tea', name_kh: 'តែបៃតងក្តៅ', base_price: 1.50, price_medium: 1.75, price_large: 2.00, description: 'Traditional hot green tea', has_ice_option: false },
    { category: 'Tea', name: 'Jasmine Tea', name_kh: 'តែម្លិះ', base_price: 1.50, price_medium: 1.75, price_large: 2.00, description: 'Fragrant jasmine tea' },

    // Fresh Drinks
    { category: 'Fresh Drinks', name: 'Fresh Coconut', name_kh: 'ទឹកដូងស្រស់', base_price: 2.00, price_medium: 2.50, price_large: 3.00, description: 'Fresh young coconut water', has_sugar_option: false },
    { category: 'Fresh Drinks', name: 'Sugar Cane Juice', name_kh: 'ទឹកអំពៅ', base_price: 1.50, price_medium: 2.00, price_large: 2.50, description: 'Fresh pressed sugar cane' },
    { category: 'Fresh Drinks', name: 'Fresh Orange Juice', name_kh: 'ទឹកក្រូចស្រស់', base_price: 2.50, price_medium: 3.00, price_large: 3.50, description: 'Freshly squeezed oranges' },
    { category: 'Fresh Drinks', name: 'Lemonade', name_kh: 'ទឹកក្រូចឆ្មារ', base_price: 1.75, price_medium: 2.25, price_large: 2.50, description: 'Fresh lemonade' },
    { category: 'Fresh Drinks', name: 'Iced Chocolate', name_kh: 'សូកូឡាទឹកកក', base_price: 2.25, price_medium: 2.75, price_large: 3.00, description: 'Rich chocolate milk over ice' },
    { category: 'Fresh Drinks', name: 'Palm Juice', name_kh: 'ទឹកត្នោត', base_price: 1.50, price_medium: 2.00, price_large: 2.50, description: 'Traditional Cambodian palm juice' },

    // Smoothies
    { category: 'Smoothies', name: 'Mango Smoothie', name_kh: 'ស្មូធីស្វាយ', base_price: 2.50, price_medium: 3.00, price_large: 3.50, description: 'Fresh mango blended smoothie' },
    { category: 'Smoothies', name: 'Strawberry Smoothie', name_kh: 'ស្មូធីស្ត្របឺរី', base_price: 2.75, price_medium: 3.25, price_large: 3.75, description: 'Fresh strawberry smoothie' },
    { category: 'Smoothies', name: 'Banana Smoothie', name_kh: 'ស្មូធីចេក', base_price: 2.25, price_medium: 2.75, price_large: 3.25, description: 'Creamy banana smoothie' },
    { category: 'Smoothies', name: 'Mixed Berry Smoothie', name_kh: 'ស្មូធីផ្លែប៊រី​ផ្សំ', base_price: 3.00, price_medium: 3.50, price_large: 4.00, description: 'Blueberry, raspberry, strawberry mix' },
    { category: 'Smoothies', name: 'Passion Fruit Smoothie', name_kh: 'ស្មូធីម៉ារាគុយ៉ា', base_price: 2.75, price_medium: 3.25, price_large: 3.75, description: 'Tropical passion fruit smoothie' },
    { category: 'Smoothies', name: 'Avocado Smoothie', name_kh: 'ស្មូធីផ្លែប៊ឺ', base_price: 3.00, price_medium: 3.50, price_large: 4.00, description: 'Creamy avocado smoothie' },
    { category: 'Smoothies', name: 'Dragon Fruit Smoothie', name_kh: 'ស្មូធីផ្លែដ្រាហ្គន', base_price: 3.00, price_medium: 3.50, price_large: 4.00, description: 'Vibrant dragon fruit smoothie' },

    // Food
    { category: 'Food', name: 'Croissant', name_kh: 'នំគ្រួសង់', base_price: 2.00, price_medium: null, price_large: null, description: 'Buttery French croissant', has_sizes: false, has_sugar_option: false, has_ice_option: false },
    { category: 'Food', name: 'Chocolate Croissant', name_kh: 'នំគ្រួសង់សូកូឡា', base_price: 2.50, price_medium: null, price_large: null, description: 'Croissant filled with chocolate', has_sizes: false, has_sugar_option: false, has_ice_option: false },
    { category: 'Food', name: 'Banana Bread', name_kh: 'នំប៉ាំងចេក', base_price: 2.00, price_medium: null, price_large: null, description: 'Homemade banana bread slice', has_sizes: false, has_sugar_option: false, has_ice_option: false },
    { category: 'Food', name: 'Chicken Sandwich', name_kh: 'សាំងវិចសាច់មាន់', base_price: 4.00, price_medium: null, price_large: null, description: 'Grilled chicken sandwich', has_sizes: false, has_sugar_option: false, has_ice_option: false },
    { category: 'Food', name: 'Tuna Sandwich', name_kh: 'សាំងវិចត្រីថូណា', base_price: 4.00, price_medium: null, price_large: null, description: 'Classic tuna salad sandwich', has_sizes: false, has_sugar_option: false, has_ice_option: false },
    { category: 'Food', name: 'Cheese Cake', name_kh: 'នំឈីស', base_price: 3.50, price_medium: null, price_large: null, description: 'Creamy New York cheesecake', has_sizes: false, has_sugar_option: false, has_ice_option: false },
    { category: 'Food', name: 'Chocolate Brownie', name_kh: 'ប្រោនីសូកូឡា', base_price: 2.50, price_medium: null, price_large: null, description: 'Rich chocolate brownie', has_sizes: false, has_sugar_option: false, has_ice_option: false },
    { category: 'Food', name: 'Waffle', name_kh: 'វ៉ាហ្វល', base_price: 3.50, price_medium: null, price_large: null, description: 'Belgian waffle with toppings', has_sizes: false, has_sugar_option: false, has_ice_option: false },
];

export async function POST(request: NextRequest) {
    try {
        const results = { categories: 0, items: 0, skipped: 0 };
        const categoryMap: Record<string, string> = {};

        // Create categories
        for (const cat of CATEGORIES) {
            const [category, created] = await models.MenuCategory.findOrCreate({
                where: { name: cat.name },
                defaults: cat
            });
            categoryMap[cat.name] = (category as any).id;
            if (created) results.categories++;
        }

        // Create menu items
        for (const item of MENU_ITEMS) {
            const categoryId = categoryMap[item.category];
            if (!categoryId) continue;

            const [menuItem, created] = await models.MenuItem.findOrCreate({
                where: {
                    name: item.name,
                    category_id: categoryId
                },
                defaults: {
                    category_id: categoryId,
                    name: item.name,
                    name_kh: item.name_kh,
                    description: item.description,
                    base_price: item.base_price,
                    price_medium: item.price_medium,
                    price_large: item.price_large,
                    has_sizes: item.has_sizes !== false,
                    has_sugar_option: item.has_sugar_option !== false,
                    has_ice_option: item.has_ice_option !== false,
                    is_available: true,
                    is_active: true
                }
            });

            if (created) {
                results.items++;
            } else {
                results.skipped++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Created ${results.categories} categories and ${results.items} menu items (${results.skipped} already existed)`,
            data: results
        });
    } catch (error: any) {
        console.error('Error seeding menu:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'POST to this endpoint to seed Cambodian coffee menu',
        categories: CATEGORIES.length,
        items: MENU_ITEMS.length
    });
}
