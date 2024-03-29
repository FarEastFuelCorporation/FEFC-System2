// models/Vehicle.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Vehicle = sequelize.define(
    'Vehicle', {
        plateNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        vehicleName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        netCapacity: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        ownership: {
            type: DataTypes.ENUM('OWNED', 'LEASED'),
            allowNull: false,
        },
        vehicleId: {
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

module.exports = Vehicle;
