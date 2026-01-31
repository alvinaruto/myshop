import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const CafeTable = sequelize.define('CafeTable', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        table_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: true
            // e.g., "Window Seat", "Outdoor 1"
        },
        capacity: {
            type: DataTypes.INTEGER,
            defaultValue: 4
        },
        status: {
            type: DataTypes.ENUM('available', 'occupied', 'reserved', 'cleaning'),
            defaultValue: 'available'
        },
        current_order_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        section: {
            type: DataTypes.STRING(50),
            allowNull: true
            // e.g., "Indoor", "Outdoor", "Terrace"
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'cafe_tables',
        underscored: true,
        indexes: [
            { unique: true, fields: ['table_number'] },
            { fields: ['status'] },
            { fields: ['section'] }
        ]
    });

    return CafeTable;
};
