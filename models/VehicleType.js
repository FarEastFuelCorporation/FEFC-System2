// models/VehicleType.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const VehicleType = sequelize.define(
    'VehicleType', {
        vehicleId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        typeOfVehicle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        vehicleCode: {
            type: DataTypes.STRING,
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

module.exports = VehicleType;
