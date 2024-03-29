// models/TreatmentProcess.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const TreatmentProcess = sequelize.define(
    'TreatmentProcess', {
        tpId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        treatmentProcess: {
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

module.exports = TreatmentProcess;
