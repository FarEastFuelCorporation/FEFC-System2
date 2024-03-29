// models/Client.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Client = sequelize.define(
    'Client',
    {
        clientId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        clientName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        natureOfBusiness: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contactNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        billerName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        billerAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        billerContactPerson: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        billerContactNumber: {
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

module.exports = Client;
