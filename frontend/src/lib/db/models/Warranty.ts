// @ts-nocheck
import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const Warranty = sequelize.define('Warranty', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        serial_item_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        sale_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        duration_months: {
            type: DataTypes.INTEGER,
            defaultValue: 12
        },
        terms: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: 'Standard manufacturer warranty. Does not cover physical damage or water damage.'
        },
        status: {
            type: DataTypes.ENUM('active', 'expired', 'claimed', 'voided'),
            defaultValue: 'active'
        },
        claim_notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'warranties',
        underscored: true,
        indexes: [
            { fields: ['serial_item_id'] },
            { fields: ['sale_id'] },
            { fields: ['end_date'] },
            { fields: ['status'] }
        ]
    });

    (Warranty as any).associate = (models: any) => {
        Warranty.belongsTo(models.SerialItem, { foreignKey: 'serial_item_id', as: 'serialItem' });
        Warranty.belongsTo(models.Sale, { foreignKey: 'sale_id', as: 'sale' });
    };

    (Warranty.prototype as any).isValid = function () {
        const today = new Date();
        const endDate = new Date(this.end_date);
        return this.status === 'active' && endDate >= today;
    };

    return Warranty;
};
