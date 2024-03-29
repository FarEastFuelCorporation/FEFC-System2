// models/TypeOfWaste.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const TreatmentProcess = require('./TreatmentProcess');

const TypeOfWaste = sequelize.define(
    'TypeOfWaste', {
        wasteId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        wasteCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        wasteDescription: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tpId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
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

// Define the associations
TypeOfWaste.belongsTo(TreatmentProcess, { foreignKey: 'tpId', targetKey: 'tpId' });

module.exports = TypeOfWaste;