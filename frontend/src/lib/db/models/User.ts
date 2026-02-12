// @ts-nocheck
import { DataTypes, Model, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';

export default (sequelize: Sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                len: [3, 50]
            }
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        full_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('admin', 'manager', 'cashier'),
            allowNull: false,
            defaultValue: 'cashier'
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'users',
        underscored: true,
        hooks: {
            beforeCreate: async (user: any) => {
                if (user.password_hash) {
                    user.password_hash = await bcrypt.hash(user.password_hash, 12);
                }
            },
            beforeUpdate: async (user: any) => {
                if (user.changed('password_hash')) {
                    user.password_hash = await bcrypt.hash(user.password_hash, 12);
                }
            }
        }
    });

    (User.prototype as any).validatePassword = async function (password: string) {
        return bcrypt.compare(password, this.password_hash);
    };

    (User.prototype as any).toJSON = function () {
        const values = { ...this.get() };
        delete values.password_hash;
        return values;
    };

    return User;
};
