// controllers/dispatchingDashboardControllers.js

require('dotenv').config();
const { Op, Sequelize } = require('sequelize');
const Client = require("../models/Client");
const Employee = require("../models/Employee");
const MarketingTransaction = require("../models/MarketingTransaction");
const QuotationTransportation = require("../models/QuotationTransportation");
const QuotationWaste = require("../models/QuotationWaste");
const TransactionStatus = require("../models/TransactionStatus");
const TypeOfWaste = require("../models/TypeOfWaste");
const Vehicle = require("../models/Vehicle");
const VehicleType = require("../models/VehicleType");
const WasteCategory = require("../models/WasteCategory");
const LogisticsTransaction = require('../models/LogisticsTransaction');
const LogisticsTransactionHelper = require('../models/LogisticsTransactionHelper');
const DispatchLogisticsTransaction = require('../models/DispatchLogisticsTransaction');
const VehicleStatus = require('../models/VehicleStatus');
const VehicleLog = require('../models/VehicleLog');

// Dashboard controller
async function getDispatchingDashboardController(req, res) {
    try {
        // Retrieve data from the database or perform other logic
        const employeeId = req.session.employeeId;
        const employee = await Employee.findOne({ where: { employeeId } });
        
        // Render the dashboard view with data
        const viewsData = {
            pageTitle: 'Dispatching User - Dashboard',
            sidebar: 'dispatching/dispatching_sidebar',
            content: 'dispatching/dispatching_dashboard',
            route: 'dispatching_dashboard',
            employee,
        };
        res.render('dashboard', viewsData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

// Vehicle Tracker controller
async function getVehicleTrackerController(req, res) {
    try {
        // Retrieve data from the database or perform other logic
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const employeeId = req.session.employeeId;
        const employee = await Employee.findOne({ where: { employeeId } });
        // Render the dashboard view with data
        const viewsData = {
            pageTitle: 'Dispatching User - Vehicle Tracker',
            sidebar: 'dispatching/dispatching_sidebar',
            content: 'dispatching/vehicle_tracker',
            route: 'vehicle_tracker',
            employee,
            apiKey: apiKey,
        };
        res.render('dashboard', viewsData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

// Dispatching Transactions controller
async function getDispatchingTransactionsController(req, res) {
    try {
        // Fetch all clients from the database
        const marketingTransactions = await MarketingTransaction.findAll({
            where: { submitTo: 'LOGISTICS' },
            include: [
                { model: Client, as: 'Client' },
                { model: QuotationWaste, as: 'QuotationWaste',
                    include: [ 
                        { model: TypeOfWaste, as: 'TypeOfWaste' },
                    ],
                },
                { model: QuotationTransportation, as: 'QuotationTransportation',
                    include: [ 
                        { model: VehicleType, as: 'VehicleType' },
                    ], 
                },
                { model: Employee, as: 'Employee' },
                { model: WasteCategory, as: 'WasteCategory' },
                { model: TransactionStatus, as: 'TransactionStatus' },
                {
                    model: LogisticsTransaction, as: 'LogisticsTransaction',
                    where: { mtfId: Sequelize.col('MarketingTransaction.id') },
                    required: false, // Use 'false' to perform a LEFT JOIN
                    include: [
                        {
                            model: Employee,
                            as: 'Employee',
                        },
                        {
                            model: Employee,
                            as: 'Driver',
                        },
                        {
                            model: LogisticsTransactionHelper,
                            as: 'LogisticsTransactionHelper',
                            where: { logisticsTransactionId: Sequelize.col('LogisticsTransaction.id') },
                            required: false, // Use 'false' to perform a LEFT JOIN
                            include: [
                                {
                                    model: Employee,
                                    as: 'Employee',
                                },
                            ],
                        },
                        {
                            model: DispatchLogisticsTransaction,
                            as: 'DispatchLogisticsTransaction',
                            where: { logisticsTransactionId: Sequelize.col('LogisticsTransaction.id') },
                            required: false, // Use 'false' to perform a LEFT JOIN
                            include: [
                                {
                                    model: Employee,
                                    as: 'Employee',
                                },
                            ],
                        },      
                    ]
                },
            ],
        });

        // Get logistics transactions for all MTF IDs
        const logisticsTransactions = await LogisticsTransaction.findAll({
            where: { mtfId: marketingTransactions.map(transaction => transaction.id) },
        });
        const vehicles = await Vehicle.findAll();
        const drivers = await Employee.findAll({
            where: {
                designation: {
                    [Sequelize.Op.like]: '%Driver%', // Use the like operator with a wildcard
                },
            },
            order: [
                ['lastName', 'ASC'], // Sort by lastName in ascending order
            ],
        });
        const truckHelpers = await Employee.findAll({
            where: {
                designation: {
                    [Sequelize.Op.like]: '%Truck Helper%', // Use the like operator with a wildcard
                },
            },
            order: [
                ['lastName', 'ASC'], // Sort by lastName in ascending order
            ],
        });

        // Get the page number, entries per page, and search query from the query parameters
        const currentPage = parseInt(req.query.page) || 1;
        const entriesPerPage = parseInt(req.query.entriesPerPage) || 10;
        const searchQuery = req.query.search || ''; // Default to an empty string if no search query

        // Additional logic to filter clients based on the search query
        const filteredMarketingTransactions = marketingTransactions.filter(marketingTransaction => {
            // Customize this logic based on how you want to perform the search
            return (
                marketingTransaction.Client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
                // Add more fields if needed
            );
        });

        // Check if mtfId is present in LogisticsTransaction for each MarketingTransaction
        filteredMarketingTransactions.map(async (marketingTransaction) => {
            const logisticsTransaction = await LogisticsTransaction.findOne({
                where: { mtfId: marketingTransaction.id },
            });
            return !!logisticsTransaction; // Return true if logisticsTransaction exists, false otherwise
        });

        // Add the dispatched property to each transaction
        const transactionsWithLogisticsInfo = await Promise.all(filteredMarketingTransactions.map(async (marketingTransaction, index) => {
            const logisticsTransaction = logisticsTransactions.find(lt => lt.mtfId === marketingTransaction.id);

            // Check if there is a DispatchLogisticsTransaction for the current transaction
            const dispatchLogisticsTransactionExists = await DispatchLogisticsTransaction.findOne({
                where: { logisticsTransactionId: logisticsTransaction ? logisticsTransaction.id : null },
            });

            return {
                ...marketingTransaction.toJSON(),
                logisticsTransactionExists: !!logisticsTransaction,
                dispatchLogisticsTransactionExists: !!dispatchLogisticsTransactionExists,
            };
        }));

        // Sort the array by haulingDate and haulingTime
        transactionsWithLogisticsInfo.sort((a, b) => {
            const dateA = new Date(`${a.haulingDate} ${a.haulingTime}`);
            const dateB = new Date(`${b.haulingDate} ${b.haulingTime}`);
            return dateB - dateA;
        });

        // Calculate total pages based on the total number of filtered transactions and entries per page
        const totalFilteredTransactions = transactionsWithLogisticsInfo.length;
        const totalPages = Math.ceil(totalFilteredTransactions / entriesPerPage);

        // Implement pagination and send the filtered transactions to the view
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = currentPage * entriesPerPage;
        const paginatedTransactions = transactionsWithLogisticsInfo.slice(startIndex, endIndex);

        // Check for the success query parameter
        let successMessage;
        if(req.query.success === 'newSchedule'){
            successMessage = 'Transaction scheduled successfully!';
        } else if (req.query.success === 'updateSchedule'){
            successMessage = 'Transaction scheduled updated successfully!';
        } else if (req.query.success === 'deleteSchedule'){
            successMessage = 'Transaction scheduled deleted successfully!';
        } else if (req.query.success === 'dispatch'){
            successMessage = 'Transaction dispatched successfully!';
        }
        // Check for the error query parameter
        let errorMessage;
        let vehicleMessage = req.query.vehicle;
        let statusMessage = req.query.status;
        if(req.query.error === 'dispatch'){
            errorMessage = `Invalid Transaction! Vehicle: ${vehicleMessage} Unavailable. Status: ${statusMessage}`;
        } 

        // Render the 'dashboard' view and pass the necessary data
        const viewsData = {
            pageTitle: 'Dispatching User - Dispatching Transactions',
            sidebar: 'dispatching/dispatching_sidebar',
            content: 'dispatching/dispatching_transactions',
            route: 'dispatching_transactions',
            paginatedTransactions: paginatedTransactions,
            vehicles,
            drivers,
            truckHelpers,
            currentPage,
            totalPages,
            entriesPerPage,
            searchQuery,
            successMessage,
            errorMessage,
        };
        res.render('dashboard', viewsData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}
async function postScheduleTransactionsController(req, res) {
    try {
        const employeeId = req.session.employeeId;
        // Extracting data from the request body
        const {
            mtfId,
            departureDate,
            departureTime,
            vehicle,
            plateNumber,
            driverId,
            truckHelperId,
            remarks,
        } = req.body;

        const logisticsTransaction = await LogisticsTransaction.create({
            mtfId,
            departureDate,
            departureTime,
            vehicle,
            plateNumber,
            driverId,
            remarks,
            scheduledBy: employeeId,
        });
        await LogisticsTransactionHelper.create({
            logisticsTransactionId: logisticsTransaction.id,
            truckHelperId,
        });
        await MarketingTransaction.update(
            {
                statusId: "2",
            },
            {
                where: { id: logisticsTransaction.mtfId },
            }
        );

        // Redirect back to the client route with a success message
        res.redirect('/dispatching_dashboard/dispatching_transactions?success=newSchedule');
    } catch (error) {
        // Handling errors
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
async function updateScheduleTransactionsController(req, res) {
    try {
        const employeeId = req.session.employeeId;
        // Extracting data from the request body
        const {
            mtfId,
            departureDate,
            departureTime,
            vehicle,
            plateNumber,
            driverId,
            truckHelperId,
            remarks,
        } = req.body;

        const logisticsTransactionId = req.params.id;

        await LogisticsTransaction.update(
            {
                mtfId,
                departureDate,
                departureTime,
                vehicle,
                plateNumber,
                driverId,
                truckHelperId,
                remarks,
                scheduledBy: employeeId,
            },            
            {
                where: { id: logisticsTransactionId },
            }
        );
        await LogisticsTransactionHelper.update(
            {
                truckHelperId,
            },            
            {
                where: { logisticsTransactionId: logisticsTransactionId },
            }
        );

        // Redirect back to the client route with a success message
        res.redirect('/dispatching_dashboard/dispatching_transactions?success=updateSchedule');
    } catch (error) {
        // Handling errors
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
async function deleteScheduleTransactionsController(req, res) {
    try {
        const logisticsTransactionId = req.params.id;
        // Find the LogisticsTransaction record to get the mtfId
        const logisticsTransaction = await LogisticsTransaction.findOne({
            where: {
                mtfId: logisticsTransactionId,
            },
        });

        console.log('Found logistics transaction:', logisticsTransaction);

        // Update the MarketingTransaction status
        const marketingTransaction = await MarketingTransaction.findOne({
            where: {
                id: logisticsTransaction.mtfId,
            },
        });

        console.log('Found marketing transaction:', marketingTransaction);

        if (marketingTransaction) {
            await marketingTransaction.update({
                statusId: 1,
            });
        }

        // Delete the LogisticsTransaction
        await logisticsTransaction.destroy();

        console.log('Logistics transaction deleted successfully.');
        console.log('Before redirection');
        res.redirect('/dispatching_dashboard/dispatching_transactions?success=updateSchedule');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
async function postDispatchTransactionsController(req, res) {
    try {
        const employeeId = req.session.employeeId;
        // Extracting data from the request body
        const {
            logisticsTransactionId,
            dispatchedDate,
            dispatchedTime,
            remarks,
        } = req.body;
        
        const logisticsTransaction = await LogisticsTransaction.findOne(
            {
                where: { id: logisticsTransactionId },
            }
        );

        // Retrieve the last transaction for each plateNumber
        const lastTransactions = await VehicleLog.findOne({
            where: {
                plateNumber: logisticsTransaction.plateNumber,
            },
            include: [
                {
                    model: VehicleStatus,
                    as: 'VehicleStatus',
                    attributes: ['status'],
                },
            ],
            required: false,
            order: [['createdAt', 'DESC']],
        });

        if (lastTransactions) {
            if(lastTransactions.vehicleStatusId == "1"){
                const dispatchLogisticsTransaction =  await DispatchLogisticsTransaction.create({
                    logisticsTransactionId,
                    dispatchedDate,
                    dispatchedTime,
                    remarks,
                    dispatchedBy: employeeId,
                });
                await VehicleLog.create(
                    {
                        dispatchId: dispatchLogisticsTransaction.id,
                        plateNumber: logisticsTransaction.plateNumber,
                        vehicleStatusId: "2",
                    },
                );
                await MarketingTransaction.update(
                    {
                        statusId: "3",
                    },
                    {
                        where: { id: logisticsTransaction.mtfId },
                    }
                );
                // Redirect back to the client route with a success message
                res.redirect('/dispatching_dashboard/dispatching_transactions?success=dispatch');            
            } else {
                // Redirect back to the client route with a success message
                res.redirect(`/dispatching_dashboard/dispatching_transactions?error=dispatch&vehicle=${lastTransactions.plateNumber}&status=${lastTransactions.VehicleStatus.status}`);
            }       
        } else {
            const dispatchLogisticsTransaction =  await DispatchLogisticsTransaction.create({
                logisticsTransactionId,
                dispatchedDate,
                dispatchedTime,
                remarks,
                dispatchedBy: employeeId,
            });
            await VehicleLog.create(
                {
                    dispatchId: dispatchLogisticsTransaction.id,
                    plateNumber: logisticsTransaction.plateNumber,
                    vehicleStatusId: "2",
                },
            );
            await MarketingTransaction.update(
                {
                    statusId: "3",
                },
                {
                    where: { id: logisticsTransaction.mtfId },
                }
            );
            // Redirect back to the client route with a success message
            res.redirect('/dispatching_dashboard/dispatching_transactions?success=dispatch');            
        }
    } catch (error) {
        // Handling errors
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Vehicles controller
async function getVehiclesController(req, res) {
    try {
        const vehicles = await Vehicle.findAll({
            include: [
                { model: VehicleType, as: 'VehicleType' },
            ]
        });
        const vehicleTypes = await VehicleType.findAll({
            where: {
                vehicleId: {
                    [Op.not]: "V000"
                }
            }
        });
        
        // Get the page number, entries per page, and search query from the query parameters
        const currentPage = parseInt(req.query.page) || 1;
        const entriesPerPage = parseInt(req.query.entriesPerPage) || 10;
        const searchQuery = req.query.search || ''; // Default to an empty string if no search query

        const filteredVehicles = vehicles.filter(vehicle => {
            // Customize this logic based on how you want to perform the search
            return (
                vehicle.vehicleName.toLowerCase().includes(searchQuery.toLowerCase())
                // Add more fields if needed
            );
        });

        // Calculate total pages based on the total number of filtered clients and entries per page
        const totalFilteredVehicles = filteredVehicles.length;
        const totalPages = Math.ceil(totalFilteredVehicles / entriesPerPage);

        // Implement pagination and send the filtered clients to the view
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = currentPage * entriesPerPage;
        const paginatedClients = filteredVehicles.slice(startIndex, endIndex);

        // Check for the success query parameter
        let successMessage;
        if(req.query.success === 'new'){
            successMessage = 'Vehicle added successfully!';
        } else if (req.query.success === 'update'){
            successMessage = 'Vehicle updated successfully!';
        }

        const viewsData = {
            pageTitle: 'Dispatching User - Vehicles',
            sidebar: 'dispatching/dispatching_sidebar',
            content: 'dispatching/vehicles',
            route: 'vehicles',
            vehicles: paginatedClients,
            vehicleTypes,
            currentPage,
            totalPages,
            entriesPerPage,
            searchQuery,
            successMessage,
        };
        res.render('dashboard', viewsData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}
async function postVehicleController(req, res) {
    try {
        // Extracting data from the request body
        const {
            plateNumber,
            vehicleName,
            netCapacity,
            ownership,
            vehicleId,
        } = req.body;

        await Vehicle.create({
            plateNumber,
            vehicleName,
            netCapacity,
            ownership,
            vehicleId,
        });

        // Redirect back to the client route with a success message
        res.redirect('/dispatching_dashboard/vehicles?success=new');
    } catch (error) {
        // Handling errors
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
async function updateVehicleController(req, res) {
    try {
        // Extracting data from the request body
        const {
            plateNumber,
            vehicleName,
            netCapacity,
            ownership,
            vehicleId,
        } = req.body;

        await Vehicle.update(
            {
                plateNumber,
                vehicleName,
                netCapacity,
                ownership,
                vehicleId,
            },
            {
                where: { plateNumber },
            }
        );

        // Redirect back to the client route with a success message
        res.redirect('/dispatching_dashboard/vehicles?success=update');
    } catch (error) {
        // Handling errors
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { 
    getDispatchingDashboardController,
    getVehicleTrackerController,
    getDispatchingTransactionsController,
    postScheduleTransactionsController,
    updateScheduleTransactionsController,
    deleteScheduleTransactionsController,
    postDispatchTransactionsController,
    getVehiclesController,
    postVehicleController,
    updateVehicleController,
};