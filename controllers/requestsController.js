// controllers/requestsController.js

const sequelize = require("../config/config");
const { startOfMonth, endOfMonth, subMonths } = require('date-fns');
const { Op, Sequelize } = require('sequelize');
const Client = require("../models/Client");
const MarketingTransaction = require("../models/MarketingTransaction");
const Quotation = require("../models/Quotation");
const QuotationTransportation = require("../models/QuotationTransportation");
const QuotationWaste = require("../models/QuotationWaste");
const Vehicle = require("../models/Vehicle");
const VehicleType = require("../models/VehicleType");
const LogisticsTransaction = require("../models/LogisticsTransaction");
const Employee = require("../models/Employee");
const WasteCategory = require("../models/WasteCategory");
const TransactionStatus = require("../models/TransactionStatus");
const LogisticsTransactionHelper = require("../models/LogisticsTransactionHelper");
const TypeOfWaste = require("../models/TypeOfWaste");
const VehicleStatus = require("../models/VehicleStatus");
const VehicleLog = require("../models/VehicleLog");

async function getQuotationWasteByClient(req, res) {
    try {
        const clientId = req.query.clientId;
        // Fetch Quotations and include associated QuotationWastes
        const quotations = await Quotation.findAll({
            where: { clientId },
            include: [
                { model: QuotationWaste, as: 'QuotationWaste' }
            ]
        });
        // Extract QuotationWastes from the fetched Quotations
        const wastes = quotations.flatMap(quotation => quotation.QuotationWaste);
        
        // Respond with the fetched wastes in JSON format
        res.json(wastes);
    } catch (error) {
        console.error('Error fetching wastes by client:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
async function getQuotationTransportationByClient(req, res) {
    try {
        const clientId = req.query.clientId;
        // Fetch Quotations and include associated QuotationTransportation
        const quotations = await Quotation.findAll({
            where: { clientId },
            include: [{ model: QuotationTransportation, as: 'QuotationTransportation',
                include: [{ model: VehicleType, as: 'VehicleType' }]
            }],
        });
        // Extract QuotationTransportation from the fetched Quotations
        const transportation = quotations.flatMap(quotation => quotation.QuotationTransportation);
        
        // Respond with the fetched wastes in JSON format
        res.json(transportation);
    } catch (error) {
        console.error('Error fetching wastes by client:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
async function getVehicleTypes(req, res) {
    try {
        const vehicleTypes = await VehicleType.findAll();
        res.json(vehicleTypes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
async function getClients(req, res) {
    try {
        const client = await Client.findAll();
        res.json(client);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
async function getVehicles(req, res) {
    try {
        const vehicles = await Vehicle.findAll({
            include: [
                {
                    model: VehicleLog,
                    as: 'VehicleLog',
                    required: false,
                    include: [
                        {
                            model: VehicleStatus,
                            as: 'VehicleStatus',
                            required: false,
                        },
                    ],
                    order: [['createdAt', 'DESC']], // Order by createdAt in descending order to get the last transaction
                    limit: 1, // Limit to 1 to get only the last transaction
                },
                {
                    model: VehicleType,
                    as: 'VehicleType',
                },
            ],
        });

        res.json(vehicles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
async function getVehicleLogs(req, res) {
    try {
        const vehicleLogs = await VehicleLog.findAll({
            attributes: [
                'plateNumber',
                [sequelize.fn('max', sequelize.col('VehicleLog.createdAt')), 'latestCreatedAt'],
            ],
            include: [
                {
                    model: VehicleStatus,
                    as: 'VehicleStatus',
                    attributes: ['status'],
                },
            ],
            group: ['plateNumber'],
            order: [[sequelize.fn('max', sequelize.col('VehicleLog.createdAt')), 'DESC']],
        });

        if (!vehicleLogs || vehicleLogs.length === 0) {
            // No vehicle logs found
            return res.json([]);
        }

        const plateNumbers = vehicleLogs.map(log => log.plateNumber);
        const latestVehicleLogs = await VehicleLog.findAll({
            where: {
                plateNumber: plateNumbers,
                createdAt: vehicleLogs.map(log => log.get('latestCreatedAt')),
            },
            include: [
                {
                    model: VehicleStatus,
                    as: 'VehicleStatus',
                },
            ],
        });

        res.json(latestVehicleLogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
async function getMarketingTransactions(req, res) {
    try {
        const marketingTransaction = await MarketingTransaction.findAll({
            include: [
                { model: Client, as: 'Client', },
                { model: QuotationWaste, as: 'QuotationWaste' },
                { model: QuotationTransportation, as: 'QuotationTransportation',
                    include: [{ model: VehicleType, as: 'VehicleType' }]
                }
            ],
        });
        res.json(marketingTransaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
async function getMarketingTransactionsByMonth(req, res) {
    try {
        const currentDate = new Date();

        // Calculate the start of the current month
        const currentMonthStart = startOfMonth(currentDate);
        const currentMonthEnd = endOfMonth(currentDate);

        // Calculate the start of the previous 2 months
        const prevMonth1Start = subMonths(currentMonthStart, 1);
        const prevMonth2Start = subMonths(currentMonthStart, 2);

        const pendingCounts = await Promise.all([
            MarketingTransaction.count({
                where: {
                    haulingDate: {
                        [Op.gte]: prevMonth2Start,
                        [Op.lt]: prevMonth1Start,
                    },
                },
            }),
            MarketingTransaction.count({
                where: {
                    haulingDate: {
                        [Op.gte]: prevMonth1Start,
                        [Op.lt]: currentMonthStart,
                    },
                },
            }),
            MarketingTransaction.count({
                where: {
                    haulingDate: {
                        [Op.gte]: currentMonthStart,
                        [Op.lt]: currentMonthEnd,
                    },
                },
            }),
        ]);

        const result = {
            pending: [
                { month: prevMonth2Start.getMonth() + 1, year: prevMonth2Start.getFullYear(), count: pendingCounts[0] },
                { month: prevMonth1Start.getMonth() + 1, year: prevMonth1Start.getFullYear(), count: pendingCounts[1] },
                { month: currentMonthStart.getMonth() + 1, year: currentMonthStart.getFullYear(), count: pendingCounts[2] },
            ],
        };

        res.json(result);
    } catch (error) {
        console.error('Error executing Sequelize query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
async function getLogisticsTransaction(req, res) {
    try {
        const logisticsTransaction = await LogisticsTransaction.findAll({
            include: [
                {
                    model: MarketingTransaction,
                    as: 'MarketingTransaction',
                    include: [
                        { model: Client, as: 'Client' },
                        {
                            model: QuotationWaste,
                            as: 'QuotationWaste',
                            include: [
                                { model: TypeOfWaste, as: 'TypeOfWaste' },
                            ],
                        },
                        {
                            model: QuotationTransportation,
                            as: 'QuotationTransportation',
                            include: [
                                { model: VehicleType, as: 'VehicleType' },
                            ],
                        },
                        { model: Employee, as: 'Employee' },
                        { model: WasteCategory, as: 'WasteCategory' },
                        { model: TransactionStatus, as: 'TransactionStatus' },
                    ],
                },
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
            ],
        });
        res.json(logisticsTransaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
async function getLogisticsTransactionCounter(req, res) {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // Adding 1 because months are zero-based

        // First Counter: MarketingTransaction is not yet in LogisticsTransaction
        const pending = await MarketingTransaction.count({
            where: {
                haulingDate: {
                    [Op.gte]: `${currentDate.getFullYear()}-${currentMonth}-01`,
                    [Op.lt]: `${currentDate.getFullYear()}-${currentMonth + 1}-01`,
                },
                statusId: 1
            },
        });
        const pending2 = await MarketingTransaction.findAll({

        });
        console.log(pending)
        console.log(pending2[0].haulingDate)
        // Second Counter: MarketingTransaction is in LogisticsTransaction but not yet in DispatchLogisticsTransaction
        const scheduled = await MarketingTransaction.count({
            where: {
                haulingDate: {
                    [Op.gte]: `${currentDate.getFullYear()}-${currentMonth}-01`,
                    [Op.lt]: `${currentDate.getFullYear()}-${currentMonth + 1}-01`,
                },
                statusId: 2
            },
        });

        // Third Counter: MarketingTransaction is in LogisticsTransaction and is in DispatchLogisticsTransaction
        const dispatched = await MarketingTransaction.count({
            where: {
                haulingDate: {
                    [Op.gte]: `${currentDate.getFullYear()}-${currentMonth}-01`,
                    [Op.lt]: `${currentDate.getFullYear()}-${currentMonth + 1}-01`,
                },
                statusId: 3
            },
        });
        
        res.json({
            pending,
            scheduled,
            dispatched,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
async function getLogisticsTransactionsByMonth(req, res) {
    try {
        const currentDate = new Date();

        // Calculate the start of the current month
        const currentMonthStart = startOfMonth(currentDate);
        const currentMonthEnd = endOfMonth(currentDate);

        // Calculate the start of the previous 2 months
        const prevMonth1Start = subMonths(currentMonthStart, 1);
        const prevMonth2Start = subMonths(currentMonthStart, 2);

        const pendingCounts = await Promise.all([
            LogisticsTransaction.count({
                include: {
                    model: MarketingTransaction,
                    as: 'MarketingTransaction',
                    attributes: ['haulingDate'],
                    where: {
                        haulingDate: {
                            [Op.gte]: prevMonth2Start,
                            [Op.lt]: prevMonth1Start,
                        },
                    },
                },
            }),
            LogisticsTransaction.count({
                include: {
                    model: MarketingTransaction,
                    as: 'MarketingTransaction',
                    attributes: ['haulingDate'],
                    where: {
                        haulingDate: {
                            [Op.gte]: prevMonth1Start,
                            [Op.lt]: currentMonthStart,
                        },
                    },
                },
            }),
            LogisticsTransaction.count({
                include: {
                    model: MarketingTransaction,
                    as: 'MarketingTransaction',
                    attributes: ['haulingDate'],
                    where: {
                        haulingDate: {
                            [Op.gte]: currentMonthStart,
                            [Op.lt]: currentMonthEnd,
                        },
                    },
                },
            }),
        ]);

        const result = {
            pending: [
                { month: prevMonth2Start.getMonth() + 1, year: prevMonth2Start.getFullYear(), count: pendingCounts[0] },
                { month: prevMonth1Start.getMonth() + 1, year: prevMonth1Start.getFullYear(), count: pendingCounts[1] },
                { month: currentMonthStart.getMonth() + 1, year: currentMonthStart.getFullYear(), count: pendingCounts[2] },
            ],
        };

        res.json(result);
    } catch (error) {
        console.error('Error executing Sequelize query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { 
    getQuotationWasteByClient,
    getQuotationTransportationByClient,
    getVehicleTypes,
    getMarketingTransactions,
    getClients,
    getVehicles,
    getVehicleLogs,
    getMarketingTransactionsByMonth,
    getLogisticsTransaction,
    getLogisticsTransactionCounter,
    getLogisticsTransactionsByMonth,
};