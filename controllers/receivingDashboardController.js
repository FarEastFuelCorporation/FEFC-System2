// controllers/receivingDashboardController.js

require('dotenv').config();
const { Op, Sequelize } = require('sequelize');
const Employee = require('../models/Employee');
const MarketingTransaction = require('../models/MarketingTransaction');
const VehicleType = require('../models/VehicleType');
const WasteCategory = require('../models/WasteCategory');
const TransactionStatus = require('../models/TransactionStatus');
const LogisticsTransaction = require('../models/LogisticsTransaction');
const LogisticsTransactionHelper = require('../models/LogisticsTransactionHelper');
const DispatchLogisticsTransaction = require('../models/DispatchLogisticsTransaction');
const QuotationWaste = require('../models/QuotationWaste');
const Client = require('../models/Client');
const TypeOfWaste = require('../models/TypeOfWaste');
const QuotationTransportation = require('../models/QuotationTransportation');
const Vehicle = require('../models/Vehicle');

// Dashboard controller
async function getReceivingDashboardController(req, res) {
    try {
        // Retrieve data from the database or perform other logic
        const employeeId = req.session.employeeId;
        const employee = await Employee.findOne({ where: { employeeId } });
        
        // Render the dashboard view with data
        const viewsData = {
            pageTitle: 'Receiving User - Dashboard',
            sidebar: 'receiving/receiving_sidebar',
            content: 'receiving/receiving_dashboard',
            route: 'receiving_dashboard',
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
            pageTitle: 'Receiving User - Vehicle Tracker',
            sidebar: 'receiving/receiving_sidebar',
            content: 'receiving/vehicle_tracker',
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
async function getReceivingTransactionsController(req, res) {
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
            pageTitle: 'Receiving User - Receiving Transactions',
            sidebar: 'receiving/receiving_sidebar',
            content: 'receiving/receiving_transactions',
            route: 'receiving_transactions',
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

module.exports = { 
    getReceivingDashboardController,
    getVehicleTrackerController,
    getReceivingTransactionsController,
};