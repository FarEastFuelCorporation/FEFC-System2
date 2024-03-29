// routes/dispatching_dashboard.js

const express = require('express');
const { getDispatchingDashboardController, getVehicleTrackerController, getDispatchingTransactionsController, postScheduleTransactionsController, postDispatchTransactionsController, updateScheduleTransactionsController, getVehiclesController, postVehicleController, updateVehicleController, deleteScheduleTransactionsController } = require('../controllers/dispatchingDashboardController');
const router = express.Router();

// Dashboard route
router.get('/', getDispatchingDashboardController);

// Vehicle Tracker route
router.get('/vehicle_tracker', getVehicleTrackerController);

// Dispatching Transactions route
router.get('/dispatching_transactions', getDispatchingTransactionsController);
router.post('/new_schedule_transactions', postScheduleTransactionsController);
router.post('/update_schedule_transactions/:id', updateScheduleTransactionsController);
router.delete('/delete_schedule_transactions/:id', deleteScheduleTransactionsController);
router.post('/dispatch_transactions', postDispatchTransactionsController);

// Vehicles route
router.get('/vehicles', getVehiclesController);
router.post('/vehicles/new', postVehicleController);
router.post('/vehicles/update', updateVehicleController);

module.exports = router;