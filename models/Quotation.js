// models/Quotation.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Quotation = sequelize.define(
    'Quotation',
    {
        quotationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        quotationCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        revisionNumber: {
            type: DataTypes.STRING,
        },
        validity: {
            type: DataTypes.DATE,
        },
        clientId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        termsCharge: {
            type: DataTypes.STRING,
        },
        termsBuying: {
            type: DataTypes.STRING,
        },
        scopeOfWork: {
            type: DataTypes.STRING,
        },
        remarks: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
        },
        submittedBy: {
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

module.exports = Quotation;
