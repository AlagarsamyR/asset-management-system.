const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Asset = require('./Asset'); // Import Asset model
const Employee = require('./Employee'); // Import Employee model

const AssetEvent = sequelize.define('AssetEvent', {
    assetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Asset, // Use imported Asset model
            key: 'id'
        }
    },
    eventType: {
        type: DataTypes.ENUM('issued', 'returned', 'scrapped'),
        allowNull: false
    },
    eventDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    employeeId: {
        type: DataTypes.INTEGER,
        references: {
            model: Employee, // Use imported Employee model
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER
    },
    location: {
        type: DataTypes.STRING
    },
    notes: {
        type: DataTypes.STRING
    },
    reasonForReturn: {
        type: DataTypes.STRING
    }
});

AssetEvent.belongsTo(Asset, { foreignKey: 'assetId', as: 'asset' });
AssetEvent.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' })

module.exports = AssetEvent;
