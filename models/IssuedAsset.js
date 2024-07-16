// IssuedAsset.js

const { DataTypes } = require('sequelize');
const sequelize = require('./db'); // Adjust the path as per your project structure
const Asset = require('./Asset');
const Employee = require('./Employee');

const IssuedAsset = sequelize.define('IssuedAsset', {
    assetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Asset,
            key: 'id'
        }
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Employee,
            key: 'id'
        }
    },
    issuedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    returnedDate: {
        type: DataTypes.DATE
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    branch: {
        type: DataTypes.STRING
    },
    notes: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('issued', 'returned', 'scrapped'),
        defaultValue: 'issued'
    },
    reasonForReturn: {
        type: DataTypes.STRING
    }
});

// Define associations after model definitions
IssuedAsset.belongsTo(Asset, { foreignKey: 'assetId' });
IssuedAsset.belongsTo(Employee, { foreignKey: 'employeeId' });

module.exports = IssuedAsset;
