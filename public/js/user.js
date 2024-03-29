// js/user.js

const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

class User extends Model {
    // ... your existing model definition

    validPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }
}

// ... your existing model setup

module.exports = User;