import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const HappyHour = sequelize.define('HappyHour', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        discount_type: {
            type: DataTypes.ENUM('percentage', 'fixed'),
            defaultValue: 'percentage'
        },
        discount_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
            // If percentage: 20 = 20%, if fixed: 1.00 = $1 off
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false
            // e.g., '14:00:00' for 2pm
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: false
            // e.g., '16:00:00' for 4pm
        },
        days_of_week: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            defaultValue: [1, 2, 3, 4, 5]
            // 0=Sunday, 1=Monday, ... 6=Saturday
        },
        category_id: {
            type: DataTypes.UUID,
            allowNull: true
            // If set, applies only to this category
        },
        menu_item_ids: {
            type: DataTypes.ARRAY(DataTypes.UUID),
            defaultValue: []
            // If set, applies only to specific items
        },
        applies_to_all: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
            // If true, applies to all items
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        valid_from: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        valid_until: {
            type: DataTypes.DATEONLY,
            allowNull: true
        }
    }, {
        tableName: 'happy_hours',
        underscored: true,
        indexes: [
            { fields: ['is_active'] },
            { fields: ['start_time', 'end_time'] }
        ]
    });

    (HappyHour as any).associate = (models: any) => {
        HappyHour.belongsTo(models.MenuCategory, { foreignKey: 'category_id', as: 'category' });
    };

    return HappyHour;
};
