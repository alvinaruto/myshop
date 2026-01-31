import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
    const MenuModifier = sequelize.define('MenuModifier', {
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
        category: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'extras'
            // Categories: extras, milk, syrup, size_modifier
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        sort_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'menu_modifiers',
        underscored: true,
        indexes: [
            { fields: ['category'] },
            { fields: ['is_available'] }
        ]
    });

    return MenuModifier;
};
