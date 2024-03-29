const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const QuotationWaste = sequelize.define(
    'QuotationWaste', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        quotationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        wasteId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        wasteName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        unitPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        vatCalculation: {
            type: DataTypes.STRING,
        },
        maxCapacity: {
            type: DataTypes.INTEGER,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
    },
);

module.exports = QuotationWaste;
