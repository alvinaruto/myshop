import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const StockTransaction = sequelize.define('StockTransaction', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        ingredient_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        // Transaction type
        type: {
            type: DataTypes.ENUM('in', 'out', 'adjustment', 'waste'),
            allowNull: false
        },
        // Quantity changed (positive for in, negative for out)
        quantity: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        // Reference to related record
        reference_type: {
            type: DataTypes.ENUM('sale', 'purchase', 'manual'),
            allowNull: true
        },
        reference_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        // Notes for the transaction
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // User who created this transaction
        created_by: {
            type: DataTypes.UUID,
            allowNull: true,
        }
    }, {
        tableName: 'stock_transactions',
        underscored: true,
        indexes: [
            { fields: ['ingredient_id'] },
            { fields: ['type'] },
            { fields: ['reference_type', 'reference_id'] },
            { fields: ['created_at'] }
        ]
    });

    (StockTransaction as any).associate = (models: any) => {
        StockTransaction.belongsTo(models.Ingredient, { foreignKey: 'ingredient_id', as: 'ingredient' });
        StockTransaction.belongsTo(models.User, { foreignKey: 'created_by', as: 'createdBy' });
    };

    return StockTransaction;
};
