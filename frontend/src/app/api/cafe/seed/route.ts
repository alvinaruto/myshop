import { NextRequest, NextResponse } from 'next/server';
import { getModels, getSequelize } from '@/lib/db';

// Sample data for café module
const CATEGORIES = [
    { name: 'Hot Drinks', name_kh: 'ភេសជ្ជៈក្តៅ', icon: '☕', display_order: 1 },
    { name: 'Iced Drinks', name_kh: 'ភេសជ្ជៈទឹកកក', icon: '🧊', display_order: 2 },
    { name: 'Blended', name_kh: 'លាយ', icon: '🥤', display_order: 3 },
    { name: 'Tea', name_kh: 'តែ', icon: '🍵', display_order: 4 },
    { name: 'Food', name_kh: 'អាហារ', icon: '🥐', display_order: 5 },
];

const INGREDIENTS = [
    { name: 'Espresso Beans', name_kh: 'គ្រាប់កាហ្វេ Espresso', unit: 'g', cost_per_unit: 0.05, quantity: 5000, low_stock_threshold: 500 },
    { name: 'Whole Milk', name_kh: 'ទឹកដោះគោសុទ្ធ', unit: 'ml', cost_per_unit: 0.003, quantity: 20000, low_stock_threshold: 2000 },
    { name: 'Oat Milk', name_kh: 'ទឹកដោះ Oat', unit: 'ml', cost_per_unit: 0.008, quantity: 10000, low_stock_threshold: 1000 },
    { name: 'Vanilla Syrup', name_kh: 'ស្រួយ Vanilla', unit: 'ml', cost_per_unit: 0.02, quantity: 2000, low_stock_threshold: 200 },
    { name: 'Caramel Syrup', name_kh: 'ស្រួយ Caramel', unit: 'ml', cost_per_unit: 0.02, quantity: 2000, low_stock_threshold: 200 },
    { name: 'Chocolate Sauce', name_kh: 'សូស Chocolate', unit: 'ml', cost_per_unit: 0.03, quantity: 2000, low_stock_threshold: 200 },
    { name: 'Whipped Cream', name_kh: 'Cream វាយ', unit: 'ml', cost_per_unit: 0.015, quantity: 3000, low_stock_threshold: 300 },
    { name: 'Ice', name_kh: 'ទឹកកក', unit: 'g', cost_per_unit: 0.001, quantity: 50000, low_stock_threshold: 5000 },
    { name: 'Sugar Syrup', name_kh: 'ស្រួយស្ករ', unit: 'ml', cost_per_unit: 0.01, quantity: 5000, low_stock_threshold: 500 },
    { name: 'Matcha Powder', name_kh: 'ម្សៅ Matcha', unit: 'g', cost_per_unit: 0.15, quantity: 1000, low_stock_threshold: 100 },
    { name: 'Paper Cups (Small)', name_kh: 'កែវក្រដាស តូច', unit: 'pcs', cost_per_unit: 0.08, quantity: 500, low_stock_threshold: 50 },
    { name: 'Paper Cups (Medium)', name_kh: 'កែវក្រដាស មធ្យម', unit: 'pcs', cost_per_unit: 0.10, quantity: 500, low_stock_threshold: 50 },
    { name: 'Paper Cups (Large)', name_kh: 'កែវក្រដាស ធំ', unit: 'pcs', cost_per_unit: 0.12, quantity: 500, low_stock_threshold: 50 },
    { name: 'Croissant', name_kh: 'នំ Croissant', unit: 'pcs', cost_per_unit: 1.00, quantity: 50, low_stock_threshold: 10 },
    { name: 'Chocolate Muffin', name_kh: 'នំ Muffin Chocolate', unit: 'pcs', cost_per_unit: 0.80, quantity: 40, low_stock_threshold: 10 },
];

const MENU_ITEMS = [
    // Hot Drinks
    { categoryIndex: 0, name: 'Espresso', name_kh: 'Espresso', base_price: 2.00, price_medium: null, price_large: null, has_sizes: false, has_sugar_option: true, has_ice_option: false },
    { categoryIndex: 0, name: 'Americano', name_kh: 'Americano', base_price: 2.50, price_medium: 3.00, price_large: 3.50, has_sizes: true, has_sugar_option: true, has_ice_option: false },
    { categoryIndex: 0, name: 'Cappuccino', name_kh: 'Cappuccino', base_price: 3.50, price_medium: 4.00, price_large: 4.50, has_sizes: true, has_sugar_option: true, has_ice_option: false },
    { categoryIndex: 0, name: 'Latte', name_kh: 'Latte', base_price: 3.50, price_medium: 4.00, price_large: 4.50, has_sizes: true, has_sugar_option: true, has_ice_option: false },
    { categoryIndex: 0, name: 'Mocha', name_kh: 'Mocha', base_price: 4.00, price_medium: 4.50, price_large: 5.00, has_sizes: true, has_sugar_option: true, has_ice_option: false },
    { categoryIndex: 0, name: 'Hot Chocolate', name_kh: 'Chocolate ក្តៅ', base_price: 3.50, price_medium: 4.00, price_large: 4.50, has_sizes: true, has_sugar_option: true, has_ice_option: false },

    // Iced Drinks
    { categoryIndex: 1, name: 'Iced Americano', name_kh: 'Americano ទឹកកក', base_price: 2.75, price_medium: 3.25, price_large: 3.75, has_sizes: true, has_sugar_option: true, has_ice_option: true },
    { categoryIndex: 1, name: 'Iced Latte', name_kh: 'Latte ទឹកកក', base_price: 3.75, price_medium: 4.25, price_large: 4.75, has_sizes: true, has_sugar_option: true, has_ice_option: true },
    { categoryIndex: 1, name: 'Iced Mocha', name_kh: 'Mocha ទឹកកក', base_price: 4.25, price_medium: 4.75, price_large: 5.25, has_sizes: true, has_sugar_option: true, has_ice_option: true },
    { categoryIndex: 1, name: 'Iced Caramel Macchiato', name_kh: 'Caramel Macchiato ទឹកកក', base_price: 4.50, price_medium: 5.00, price_large: 5.50, has_sizes: true, has_sugar_option: true, has_ice_option: true },
    { categoryIndex: 1, name: 'Cold Brew', name_kh: 'Cold Brew', base_price: 3.50, price_medium: 4.00, price_large: 4.50, has_sizes: true, has_sugar_option: true, has_ice_option: true },
    { categoryIndex: 1, name: 'Iced Vanilla Latte', name_kh: 'Vanilla Latte ទឹកកក', base_price: 4.00, price_medium: 4.50, price_large: 5.00, has_sizes: true, has_sugar_option: true, has_ice_option: true },

    // Blended
    { categoryIndex: 2, name: 'Caramel Frappuccino', name_kh: 'Caramel Frappuccino', base_price: 5.00, price_medium: 5.50, price_large: 6.00, has_sizes: true, has_sugar_option: true, has_ice_option: false },
    { categoryIndex: 2, name: 'Mocha Frappuccino', name_kh: 'Mocha Frappuccino', base_price: 5.00, price_medium: 5.50, price_large: 6.00, has_sizes: true, has_sugar_option: true, has_ice_option: false },
    { categoryIndex: 2, name: 'Java Chip Frappuccino', name_kh: 'Java Chip Frappuccino', base_price: 5.50, price_medium: 6.00, price_large: 6.50, has_sizes: true, has_sugar_option: true, has_ice_option: false },

    // Tea
    { categoryIndex: 3, name: 'Hot Green Tea', name_kh: 'តែបៃតង ក្តៅ', base_price: 2.50, price_medium: 3.00, price_large: 3.50, has_sizes: true, has_sugar_option: true, has_ice_option: false },
    { categoryIndex: 3, name: 'Iced Green Tea Latte', name_kh: 'Green Tea Latte ទឹកកក', base_price: 4.00, price_medium: 4.50, price_large: 5.00, has_sizes: true, has_sugar_option: true, has_ice_option: true },
    { categoryIndex: 3, name: 'Matcha Latte', name_kh: 'Matcha Latte', base_price: 4.50, price_medium: 5.00, price_large: 5.50, has_sizes: true, has_sugar_option: true, has_ice_option: true },

    // Food
    { categoryIndex: 4, name: 'Butter Croissant', name_kh: 'Croissant ប៊ឺ', base_price: 2.50, has_sizes: false, has_sugar_option: false, has_ice_option: false },
    { categoryIndex: 4, name: 'Chocolate Croissant', name_kh: 'Croissant Chocolate', base_price: 3.00, has_sizes: false, has_sugar_option: false, has_ice_option: false },
    { categoryIndex: 4, name: 'Chocolate Muffin', name_kh: 'នំ Muffin Chocolate', base_price: 2.75, has_sizes: false, has_sugar_option: false, has_ice_option: false },
    { categoryIndex: 4, name: 'Blueberry Muffin', name_kh: 'នំ Muffin Blueberry', base_price: 2.75, has_sizes: false, has_sugar_option: false, has_ice_option: false },
];

export async function POST(request: NextRequest) {
    try {
        const sequelize = getSequelize();
        if (!sequelize) {
            return NextResponse.json(
                { success: false, message: 'Database not initialized' },
                { status: 500 }
            );
        }

        const { MenuCategory, MenuItem, Ingredient, Recipe } = getModels();

        // Check for existing data
        const existingCategories = await MenuCategory.count();
        if (existingCategories > 0) {
            return NextResponse.json({
                success: false,
                message: 'Café data already exists. Delete existing data first if you want to reseed.'
            }, { status: 400 });
        }

        // Create categories
        const categoryRecords: any[] = [];
        for (const cat of CATEGORIES) {
            const record = await MenuCategory.create(cat);
            categoryRecords.push(record);
        }

        // Create ingredients
        const ingredientRecords: any[] = [];
        for (const ing of INGREDIENTS) {
            const record = await Ingredient.create(ing);
            ingredientRecords.push(record);
        }

        // Create menu items
        const menuItemRecords: any[] = [];
        for (const item of MENU_ITEMS) {
            const categoryId = categoryRecords[item.categoryIndex].id;
            const record = await MenuItem.create({
                ...item,
                category_id: categoryId,
                categoryIndex: undefined
            });
            menuItemRecords.push(record);
        }

        // Create some basic recipes (simplified - just espresso and milk for coffee drinks)
        const espresso = ingredientRecords.find(i => i.name === 'Espresso Beans');
        const milk = ingredientRecords.find(i => i.name === 'Whole Milk');
        const ice = ingredientRecords.find(i => i.name === 'Ice');

        // Add recipes to some coffee drinks
        for (const item of menuItemRecords) {
            const itemData = item.toJSON();
            if (itemData.name.includes('Latte') || itemData.name.includes('Cappuccino') || itemData.name.includes('Americano')) {
                // Espresso recipe
                await Recipe.create({
                    menu_item_id: itemData.id,
                    ingredient_id: espresso.id,
                    quantity_regular: 18,
                    quantity_medium: 24,
                    quantity_large: 30
                });

                // Milk for lattes and cappuccinos
                if (itemData.name.includes('Latte') || itemData.name.includes('Cappuccino')) {
                    await Recipe.create({
                        menu_item_id: itemData.id,
                        ingredient_id: milk.id,
                        quantity_regular: 180,
                        quantity_medium: 240,
                        quantity_large: 300
                    });
                }

                // Ice for iced drinks
                if (itemData.name.includes('Iced')) {
                    await Recipe.create({
                        menu_item_id: itemData.id,
                        ingredient_id: ice.id,
                        quantity_regular: 100,
                        quantity_medium: 130,
                        quantity_large: 160
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Café sample data created successfully',
            data: {
                categories: categoryRecords.length,
                ingredients: ingredientRecords.length,
                menuItems: menuItemRecords.length
            }
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to seed café data', error: String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const sequelize = getSequelize();
        if (!sequelize) {
            return NextResponse.json(
                { success: false, message: 'Database not initialized' },
                { status: 500 }
            );
        }

        const { MenuCategory, MenuItem, Ingredient, Recipe } = getModels();

        // Delete in order (respecting foreign keys)
        await Recipe.destroy({ where: {}, truncate: true, cascade: true });
        await MenuItem.destroy({ where: {}, truncate: true, cascade: true });
        await MenuCategory.destroy({ where: {}, truncate: true, cascade: true });
        await Ingredient.destroy({ where: {}, truncate: true, cascade: true });

        return NextResponse.json({
            success: true,
            message: 'Café data deleted successfully'
        });
    } catch (error) {
        console.error('Delete seed error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete café data', error: String(error) },
            { status: 500 }
        );
    }
}
