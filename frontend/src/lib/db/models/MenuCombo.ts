import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const MenuCombo = sequelize.define('MenuCombo', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        name_kh: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        original_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
            // Sum of individual items, for showing savings
        },
        items: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: []
            // Array of { menu_item_id, size, quantity }
        },
        image_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        valid_from: {
            type: DataTypes.DATE,
            allowNull: true
        },
        valid_until: {
            type: DataTypes.DATE,
            allowNull: true
        },
        sort_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'menu_combos',
        underscored: true,
        indexes: [
            { fields: ['is_active'] },
            { fields: ['valid_from', 'valid_until'] }
        ]
    });

    return MenuCombo;
};
