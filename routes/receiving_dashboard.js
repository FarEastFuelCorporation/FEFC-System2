// routes/receiving_dashboard.js

const express = require('express');
const { getReceivingDashboardController, getVehicleTrackerController, getReceivingTransactionsController } = require('../controllers/receivingDashboardController');
const router = express.Router();

// Dashboard route
router.get('/', getReceivingDashboardController);

// Vehicle Tracker route
router.get('/vehicle_tracker', getVehicleTrackerController);

// Dispatching Transactions route
router.get('/receiving_transactions', getReceivingTransactionsController);


module.exports = router;