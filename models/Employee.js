const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;
const CONSTANT_SALT = bcrypt.genSaltSync(SALT_ROUNDS);

const Employee = sequelize.define('Employee', {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    department: { type: DataTypes.STRING, allowNull: false },
    position: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    salary: { type: DataTypes.INTEGER, allowNull: false },
    branch: { type: DataTypes.STRING, allowNull: false },
    isAssetIssuer: { type: DataTypes.BOOLEAN, defaultValue: false },
    dateJoined: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    dateTerminate: { type: DataTypes.DATE }
}, {
    hooks: {
        beforeCreate: async (employee) => {
            employee.password = await bcrypt.hash(employee.password, CONSTANT_SALT);
        },
        beforeUpdate: async (employee) => {
            if (employee.changed('password')) {
                employee.password = await bcrypt.hash(employee.password, CONSTANT_SALT);
            }
        }
    }
});

module.exports = Employee;
