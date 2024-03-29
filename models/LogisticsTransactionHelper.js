// models/LogisticsTransactionHelper.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const LogisticsTransactionHelper = sequelize.define(
    'LogisticsTransactionHelper', 
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        logisticsTransactionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        truckHelperId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        paranoid: true,
    }
);

module.exports = LogisticsTransactionHelper;
