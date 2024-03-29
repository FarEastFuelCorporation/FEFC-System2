// config/config.js

const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql",
});

sequelize.options.logging = console.log;

module.exports = sequelize;
