// models/employee.js

const mongoose = require("mongoose");

// Define the schema for the Employee collection
const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    employeeRoleId: {
      type: Number,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    middleName: String,
    lastName: {
      type: String,
      required: true,
    },
    spouseName: String,
    affix: String,
    gender: {
      type: String,
      required: true,
    },
    civilStatus: {
      type: String,
      required: true,
    },
    birthDate: Date,
    birthPlace: String,
    mobileNo: String,
    emailAddress: String,
    nationality: {
      type: String,
      required: true,
    },
    permanentAddress: String,
    otherAddress: String,
    motherMaidenName: String,
    educationalAttainment: String,
    course: String,
    yearGraduate: String,
    tinNo: String,
    sssGsisNo: String,
    philhealthNo: String,
    pagIbigNo: String,
    driversLicenseNo: String,
    nbiNo: String,
    policeClearanceNo: String,
    cedulaNo: String,
    dateHire: Date,
    employeeType: {
      type: String,
      required: true,
    },
    payrollType: {
      type: String,
      required: true,
    },
    salaryType: {
      type: String,
      required: true,
    },
    employeeStatus: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    dailyRate: {
      type: Number,
      required: true,
    },
    dayAllowance: {
      type: Number,
      required: true,
    },
    nightAllowance: {
      type: Number,
      required: true,
    },
    timeIn: String,
    timeOut: String,
    dateOfResignation: Date,
    reasonOfResignation: String,
    picture: String,
    submittedBy: String,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: "employeeData", // Specify the collection name
  }
);

// Create the Employee model from the schema
const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
