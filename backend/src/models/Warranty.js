const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Warranty = sequelize.define('Warranty', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        serial_item_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'serial_items',
                key: 'id'
            }
        },
        sale_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'sales',
                key: 'id'
            }
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
        indexes: [
            { fields: ['serial_item_id'] },
            { fields: ['sale_id'] },
            { fields: ['end_date'] },
            { fields: ['status'] }
        ]
    });

    // Check if warranty is valid
    Warranty.prototype.isValid = function () {
        const today = new Date();
        const endDate = new Date(this.end_date);
        return this.status === 'active' && endDate >= today;
    };

    return Warranty;
};
