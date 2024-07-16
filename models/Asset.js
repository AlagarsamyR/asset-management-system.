const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Asset = sequelize.define('Asset', {
    serialNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    assetId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    make: {
        type: DataTypes.STRING
    },
    model: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING
    },
    quantity: {
        type: DataTypes.INTEGER
    },
    price: {
        type: DataTypes.DECIMAL
    },
    branch: {
        type: DataTypes.STRING
    },
    assignedquantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports = Asset;
