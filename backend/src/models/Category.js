const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Category = sequelize.define('Category', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        name_kh: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Khmer name for the category'
        },
        is_serialized: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'True for phones/laptops that need IMEI tracking'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'categories'
    });

    return Category;
};
