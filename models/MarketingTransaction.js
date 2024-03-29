// models/MarketingTransaction.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const MarketingTransaction = sequelize.define(
    'MarketingTransaction', 
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        mtfNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        clientId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quotationWasteId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quotationTransportationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        wasteCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        haulingDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        haulingTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        pullOutFormNumber: {
            type: DataTypes.STRING,
        },
        pttNumber: {
            type: DataTypes.STRING,
        },
        manifestNumber: {
            type: DataTypes.STRING,
        },
        remarks: {
            type: DataTypes.STRING,
        },
        submitTo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        statusId: {
            type: DataTypes.INTEGER,
        },
        submittedBy: {
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

module.exports = MarketingTransaction;