// models/DispatchLogisticsTransaction.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const DispatchLogisticsTransaction = sequelize.define(
    'DispatchLogisticsTransaction', 
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
        dispatchedDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        dispatchedTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        remarks: {
            type: DataTypes.STRING,
        },
        dispatchedBy: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        paranoid: true,
    }
);

module.exports = DispatchLogisticsTransaction;
