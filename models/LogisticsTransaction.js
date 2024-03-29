// models/LogisticsTransaction.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const LogisticsTransaction = sequelize.define(
    'LogisticsTransaction',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        mtfId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        departureDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        departureTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        plateNumber: {
            type: DataTypes.STRING,
            // Add an index to the plateNumber column
            indexes: [
                {
                    unique: true, // adjust based on your requirements
                    fields: ['plateNumber'],
                },
            ],
        },
        driverId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        remarks: {
            type: DataTypes.STRING,
        },
        scheduledBy: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true, 
            defaultValue: null, 
        },
    },
    {
        // Add the paranoid option for soft delete
        paranoid: true,
    }
);

module.exports = LogisticsTransaction;