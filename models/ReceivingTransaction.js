// models/ReceivingTransaction.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const ReceivingTransaction = sequelize.define(
  "ReceivingTransaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    mtfId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dispatchLogisticsTransactionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receivingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    receivingTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    plateNumber: {
      type: DataTypes.STRING,
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

module.exports = ReceivingTransaction;
