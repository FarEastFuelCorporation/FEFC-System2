// routes/auth.js

const express = require('express');
const router = express.Router();

const { getSignupController, postLoginController, getLoginController, postSignupController } = require('../controllers/authController');

// Display the sign-up form
router.get('/signup', getSignupController);

router.post('/signup', postSignupController);

// Display the login form
router.get('/login', getLoginController);

// Handle login form submission
router.post('/login', postLoginController);


module.exports = router;
