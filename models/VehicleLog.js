// models/VehicleLog.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const VehicleLog = sequelize.define(
    'VehicleLog', 
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        dispatchId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        plateNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        vehicleStatusId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
        },
    },
);

module.exports = VehicleLog;
