import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const CafeCustomer = sequelize.define('CafeCustomer', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        loyalty_points: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_spent: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0
        },
        total_orders: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        last_visit: {
            type: DataTypes.DATE,
            allowNull: true
        },
        tier: {
            type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
            defaultValue: 'bronze'
        },
        telegram_chat_id: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        otp_code: {
            type: DataTypes.STRING(6),
            allowNull: true
        },
        otp_expiry: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'cafe_customers',
        underscored: true,
        indexes: [
            { unique: true, fields: ['phone'] },
            { fields: ['tier'] },
            { fields: ['loyalty_points'] }
        ]
    });

    (CafeCustomer as any).associate = (models: any) => {
        CafeCustomer.hasMany(models.CafeOrder, { foreignKey: 'customer_id', as: 'orders' });
    };

    return CafeCustomer;
};
