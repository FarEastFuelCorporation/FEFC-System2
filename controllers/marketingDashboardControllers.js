// controllers/marketingDashboardControllers.js

const { getDb } = require("../config/db");

// Dashboard controller
async function getMarketingDashboardController(req, res) {
  try {
    // Retrieve data from the database or perform other logic
    const employeeId = req.session.employeeId;
    const database = getDb();

    const employees = await database
      .collection("employeeData")
      .find()
      .toArray();
    const marketingTransactions = await database
      .collection("transactions")
      .find()
      .toArray();

    const employee = employees.find(
      (employee) => employee.employeeId === employeeId
    );

    // const marketingTransactions = await MarketingTransaction.findAll({
    //   where: {
    //     haulingDate: {
    //       [Op.between]: [
    //         currentMonthStartLocal.format(),
    //         currentMonthEndLocal.format(),
    //       ],
    //     },
    //   },
    //   include: [{ model: TransactionStatus, as: "TransactionStatus" }],
    // });

    // Calculate counts for each status
    const counts = {
      booked: marketingTransactions.length,
      forSchedule: marketingTransactions.filter(
        (transaction) => transaction.statusId === 1
      ).length,
      forHauling: marketingTransactions.filter(
        (transaction) => transaction.statusId === 2
      ).length,
      forReceiving: marketingTransactions.filter(
        (transaction) => transaction.statusId === 3
      ).length,
      forWarehousing: marketingTransactions.filter(
        (transaction) => transaction.statusId === 4
      ).length,
      forSorting: marketingTransactions.filter(
        (transaction) => transaction.statusId === 5
      ).length,
      forTreatment: marketingTransactions.filter(
        (transaction) => transaction.statusId === 6
      ).length,
      forCertification: marketingTransactions.filter(
        (transaction) => transaction.statusId === 7
      ).length,
      forBilling: marketingTransactions.filter(
        (transaction) => transaction.statusId === 8
      ).length,
      forBillingDistribution: marketingTransactions.filter(
        (transaction) => transaction.statusId === 9
      ).length,
      forCollection: marketingTransactions.filter(
        (transaction) => transaction.statusId === 10
      ).length,
      finished: marketingTransactions.filter(
        (transaction) => transaction.statusId === 11
      ).length,
    };

    // Render the dashboard view with data
    const viewsData = {
      pageTitle: "Marketing User - Dashboard",
      sidebar: "marketing/marketing_sidebar",
      content: "marketing/marketing_dashboard",
      route: "marketing_dashboard",
      employee,
      marketingTransactions,
      counts,
    };
    res.render("dashboard", viewsData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Booked Transactions controller
async function getBookedTransactionsController(req, res) {
  try {
    const employeeId = req.session.employeeId;
    const employee = employees.find(
      (employee) => employee.employeeId === employeeId
    );

    // Fetch all clients from the database
    const clients = await Client.findAll();
    const quotation = await Quotation.findAll({
      where: {
        status: "ACTIVE", // Add this condition
      },
      include: [
        { model: Client, as: "Client" },
        {
          model: QuotationWaste,
          as: "QuotationWaste",
          include: [{ model: TypeOfWaste, as: "TypeOfWaste" }],
        },
        {
          model: QuotationTransportation,
          as: "QuotationTransportation",
          include: [{ model: VehicleType, as: "VehicleType" }],
        },
        { model: Employee, as: "Employee" },
      ],
    });

    // Check for the success query parameter
    let successMessage;
    if (req.query.success === "new") {
      successMessage = "Transaction created successfully!";
    } else if (req.query.success === "update") {
      successMessage = "Transaction updated successfully!";
    } else if (req.query.success === "delete") {
      successMessage = "Transaction deleted successfully!";
    }

    // Fetch all clients from the database
    const marketingTransactions = await MarketingTransaction.findAll({
      include: [
        { model: Client, as: "Client" },
        {
          model: QuotationWaste,
          as: "QuotationWaste",
          include: [{ model: TypeOfWaste, as: "TypeOfWaste" }],
        },
        {
          model: QuotationTransportation,
          as: "QuotationTransportation",
          include: [{ model: VehicleType, as: "VehicleType" }],
        },
        { model: Employee, as: "Employee" },
        { model: WasteCategory, as: "WasteCategory" },
        { model: TransactionStatus, as: "TransactionStatus" },
        {
          model: LogisticsTransaction,
          as: "LogisticsTransaction",
          where: { mtfId: Sequelize.col("MarketingTransaction.id") },
          required: false, // Use 'false' to perform a LEFT JOIN
          include: [
            {
              model: Employee,
              as: "Employee",
            },
            {
              model: Employee,
              as: "Driver",
            },
            {
              model: LogisticsTransactionHelper,
              as: "LogisticsTransactionHelper",
              where: {
                logisticsTransactionId: Sequelize.col(
                  "LogisticsTransaction.id"
                ),
              },
              required: false, // Use 'false' to perform a LEFT JOIN
              include: [
                {
                  model: Employee,
                  as: "Employee",
                },
              ],
            },
            {
              model: DispatchLogisticsTransaction,
              as: "DispatchLogisticsTransaction",
              where: {
                logisticsTransactionId: Sequelize.col(
                  "LogisticsTransaction.id"
                ),
              },
              required: false, // Use 'false' to perform a LEFT JOIN
              include: [
                {
                  model: Employee,
                  as: "Employee",
                },
              ],
            },
          ],
        },
      ],
    });

    // Get logistics transactions for all MTF IDs
    const logisticsTransactions = await LogisticsTransaction.findAll({
      where: {
        mtfId: marketingTransactions.map((transaction) => transaction.id),
      },
    });
    const vehicles = await Vehicle.findAll();
    const drivers = await Employee.findAll({
      where: {
        designation: {
          [Sequelize.Op.like]: "%Driver%", // Use the like operator with a wildcard
        },
      },
      order: [
        ["lastName", "ASC"], // Sort by lastName in ascending order
      ],
    });
    const truckHelpers = await Employee.findAll({
      where: {
        designation: {
          [Sequelize.Op.like]: "%Truck Helper%", // Use the like operator with a wildcard
        },
      },
      order: [
        ["lastName", "ASC"], // Sort by lastName in ascending order
      ],
    });

    // Get the page number, entries per page, and search query from the query parameters
    const currentPage = parseInt(req.query.page) || 1;
    const entriesPerPage = parseInt(req.query.entriesPerPage) || 10;
    const searchQuery = req.query.search || ""; // Default to an empty string if no search query

    // Additional logic to filter clients based on the search query
    const filteredMarketingTransactions = marketingTransactions.filter(
      (marketingTransaction) => {
        // Customize this logic based on how you want to perform the search
        return marketingTransaction.Client.clientName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        // Add more fields if needed
      }
    );

    // Check if mtfId is present in LogisticsTransaction for each MarketingTransaction
    filteredMarketingTransactions.map(async (marketingTransaction) => {
      const logisticsTransaction = await LogisticsTransaction.findOne({
        where: { mtfId: marketingTransaction.id },
      });
      return !!logisticsTransaction; // Return true if logisticsTransaction exists, false otherwise
    });

    // Add the dispatched property to each transaction
    const transactionsWithLogisticsInfo = await Promise.all(
      filteredMarketingTransactions.map(async (marketingTransaction, index) => {
        const logisticsTransaction = logisticsTransactions.find(
          (lt) => lt.mtfId === marketingTransaction.id
        );

        // Check if there is a DispatchLogisticsTransaction for the current transaction
        const dispatchLogisticsTransactionExists =
          await DispatchLogisticsTransaction.findOne({
            where: {
              logisticsTransactionId: logisticsTransaction
                ? logisticsTransaction.id
                : null,
            },
          });

        return {
          ...marketingTransaction.toJSON(),
          logisticsTransactionExists: !!logisticsTransaction,
          dispatchLogisticsTransactionExists:
            !!dispatchLogisticsTransactionExists,
        };
      })
    );

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
    const paginatedTransactions = transactionsWithLogisticsInfo.slice(
      startIndex,
      endIndex
    );

    // Render the 'marketing/booked_transactions' view and pass the necessary data
    const viewsData = {
      pageTitle: "Marketing User - Booked Transactions",
      sidebar: "marketing/marketing_sidebar",
      content: "marketing/booked_transactions",
      route: "booked_transactions",
      paginatedTransactions: paginatedTransactions,
      vehicles,
      drivers,
      truckHelpers,
      currentPage,
      totalPages,
      entriesPerPage,
      searchQuery,
      paginatedTransactions: paginatedTransactions,
      employeeId,
      clients,
      quotation,
      successMessage,
    };
    res.render("dashboard", viewsData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}
async function postBookedTransactionsController(req, res) {
  try {
    const {
      status,
      haulingDate,
      haulingTime,
      clientId,
      submitTo,
      wasteId,
      wasteCategory,
      vehicleCounter,
      ptt,
      manifest,
      pull_out_form,
      remarks,
    } = req.body;

    const lastMTFTransaction = await MarketingTransaction.findOne({
      order: [["createdAt", "DESC"]],
    });

    const employeeId = req.session.employeeId;

    // Get the current year and month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString();
    const currentMonth = (currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0");

    // Check if it's a new year
    const mtfNumber = generateMTFNumber(lastMTFTransaction);
    function generateMTFNumber(lastMTFTransaction) {
      if (lastMTFTransaction) {
        const lastYear = lastMTFTransaction.mtfNumber.slice(3, 7);
        const lastCounter = parseInt(lastMTFTransaction.mtfNumber.slice(-4));

        if (lastYear === currentYear) {
          // Generate the MTF number with the current year and month
          const newCounter = (lastCounter + 1).toString().padStart(4, "0");
          const generatedMtfNumber = `MTF${currentYear}${currentMonth}${newCounter}`;

          return generatedMtfNumber.toString(); // Explicitly convert to string
        } else {
          // If it's a new year, start the counter at 1
          const generatedMtfNumber = `MTF${currentYear}${currentMonth}0001`;

          return generatedMtfNumber;
        }
      } else {
        // If there are no previous transactions, start the counter at 1
        const generatedMtfNumber = `MTF${currentYear}${currentMonth}0001`;

        return generatedMtfNumber;
      }
    }

    // Process dynamic fields
    var vehicleId;
    for (let i = 1; i <= vehicleCounter; i++) {
      vehicleId = req.body[`vehicleId${i}`];

      // Creating a new MarketingTransaction
      await MarketingTransaction.create({
        mtfNumber: `MTF${parseInt(mtfNumber.slice(3)) - 1 + i}`,
        clientId: clientId,
        quotationWasteId: wasteId,
        quotationTransportationId: vehicleId,
        wasteCategoryId: wasteCategory,
        haulingDate: haulingDate,
        haulingTime: haulingTime,
        pullOutFormNumber: pull_out_form,
        pttNumber: ptt,
        manifestNumber: manifest,
        remarks: remarks,
        submitTo: submitTo,
        statusId: status,
        submittedBy: employeeId,
      });
    }

    // const clientName = await Client.findByPk(clientId)
    // const employeeName = await Employee.findByPk(employeeId)
    // const wasteName = await QuotationWaste.findByPk(wasteId)
    // const vehicle = await QuotationTransportation.findByPk(vehicleId, {
    //     include: [
    //         { model: VehicleType, as: 'VehicleType'  }
    //     ]
    // });

    // const toNumbers = [
    //     '+639369481844',
    //     '+639915126568', // Add more numbers as needed
    //     '+639455223999'
    // ];
    // const messageTemplate = `Booked Transaction:
    //                 Hauling Date: ${haulingDate}
    //                 Hauling Time: ${haulingTime}
    //                 Client: ${clientName.clientName}
    //                 Waste Name: ${wasteName.wasteName}
    //                 Vehicle: ${vehicle.VehicleType.typeOfVehicle}
    //                 Booked By: ${employeeName.firstName} ${employeeName.lastName}
    //                 `;

    // toNumbers.forEach(to => {
    //     client.messages
    //         .create({
    //             body: messageTemplate,
    //             from: from,
    //             to: to
    //         })
    //     .then(message => console.log(`Message SID ${message.sid} sent.`))
    //     .catch(error => console.error('Error sending message:', error));
    // });

    // Redirect back to the quotation route with a success message
    res.redirect("/marketing_dashboard/booked_transactions?success=new");
  } catch (error) {
    // Handling errors
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
async function updateBookedTransactionsController(req, res) {
  try {
    const {
      mtfNumber,
      status,
      haulingDate,
      haulingTime,
      clientId,
      submitTo,
      wasteId,
      wasteCategory,
      vehicleId,
      ptt,
      manifest,
      pull_out_form,
      remarks,
    } = req.body;

    const mtfId = req.params.id;

    const employeeId = req.session.employeeId;

    // Updating MarketingTransaction
    await MarketingTransaction.update(
      {
        mtfNumber: mtfNumber,
        clientId: clientId,
        quotationWasteId: wasteId,
        quotationTransportationId: vehicleId,
        wasteCategoryId: wasteCategory,
        haulingDate: haulingDate,
        haulingTime: haulingTime,
        pullOutFormNumber: pull_out_form,
        pttNumber: ptt,
        manifestNumber: manifest,
        remarks: remarks,
        submitTo: submitTo,
        statusId: status,
        submittedBy: employeeId,
      },
      {
        where: { id: mtfId },
      }
    );

    // Redirect back to the quotation route with a success message
    res.redirect("/marketing_dashboard/booked_transactions?success=new");
  } catch (error) {
    // Handling errors
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
async function delete_booked_transactionsController(req, res) {
  try {
    const id = req.params.id;
    console.log(id);
    // Update the MarketingTransaction status
    const marketingTransaction = await MarketingTransaction.findOne({
      where: {
        id: id,
      },
    });

    // Delete the LogisticsTransaction
    await marketingTransaction.destroy();

    res.redirect("/marketing_dashboard/booked_transactions?success=delete");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Clients controller
async function getClientsController(req, res) {
  try {
    // Fetch all clients from the database

    const database = getDb();

    const clients = await database.collection("clients").find().toArray();

    // Get the page number, entries per page, and search query from the query parameters
    const currentPage = parseInt(req.query.page) || 1;
    const entriesPerPage = parseInt(req.query.entriesPerPage) || 10;
    const searchQuery = req.query.search || ""; // Default to an empty string if no search query

    // Additional logic to filter clients based on the search query
    const filteredClients = clients.filter((client) => {
      // Customize this logic based on how you want to perform the search
      return client["CLIENT NAME"]
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      // Add more fields if needed
    });

    // Calculate total pages based on the total number of filtered clients and entries per page
    const totalFilteredClients = filteredClients.length;
    const totalPages = Math.ceil(totalFilteredClients / entriesPerPage);

    // Implement pagination and send the filtered clients to the view
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = currentPage * entriesPerPage;
    const paginatedClients = filteredClients.slice(startIndex, endIndex);

    // Check for the success query parameter
    let successMessage;
    if (req.query.success === "new") {
      successMessage = "Client added successfully!";
    } else if (req.query.success === "update") {
      successMessage = "Client updated successfully!";
    }

    // Render the 'marketing/clients' view and pass the necessary data
    const viewsData = {
      pageTitle: "Marketing User - Clients",
      sidebar: "marketing/marketing_sidebar",
      content: "marketing/clients",
      route: "clients",
      clients: paginatedClients,
      currentPage,
      totalPages,
      entriesPerPage,
      searchQuery,
      successMessage,
    };
    res.render("dashboard", viewsData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}
async function getClientDetails(req, res) {
  try {
    const clientId = req.params.clientId;

    // Find the client by ID
    const client = await Client.findOne({
      where: {
        clientId: clientId,
      },
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Respond with client details
    return res.status(200).json(client);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// New Client controller
async function getNewClientController(req, res) {
  try {
    // Render the dashboard view with data
    const viewsData = {
      pageTitle: "Marketing User - New Client Form",
      sidebar: "marketing/marketing_sidebar",
      content: "marketing/new_client",
      route: "marketing_dashboard",
    };
    res.render("dashboard", viewsData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}
async function postNewClientController(req, res) {
  try {
    // Extracting data from the request body
    const {
      clientName,
      address,
      natureOfBusiness,
      contactNumber,
      billerName,
      billerAddress,
      billerContactPerson,
      billerContactNumber,
    } = req.body;

    // Creating a new client
    await Client.create({
      clientName,
      address,
      natureOfBusiness,
      contactNumber,
      billerName,
      billerAddress,
      billerContactPerson,
      billerContactNumber,
      clientId: await generateClientId(), // You need to implement this function to generate a unique client ID
    });

    // Redirect back to the client route with a success message
    res.redirect("/marketing_dashboard/clients?success=new");
  } catch (error) {
    // Handling errors
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Function to generate a unique client ID (You need to implement this)
async function generateClientId(req, res) {
  try {
    // Find the last created client
    const lastClient = await Client.findOne({
      order: [["clientId", "DESC"]], // Order by clientId in descending order
    });

    // Extract the counter from the last client's ID
    const lastCounter = lastClient
      ? parseInt(lastClient.clientId.slice(-4), 10)
      : 0;

    // Increment the counter
    const counter = lastCounter + 1;

    // Generate the new client ID
    const currentYear = new Date().getFullYear();
    const clientId = `C${currentYear}${counter.toString().padStart(4, "0")}`;

    return clientId;
  } catch (error) {
    console.error("Error:", error);
    // Handle the error appropriately in your application
    return null; // or throw a different error or provide a default value
  }
}

async function postUpdateClientController(req, res) {
  try {
    // Extracting data from the request body
    const {
      clientId,
      clientName,
      address,
      natureOfBusiness,
      contactNumber,
      billerName,
      billerAddress,
      billerContactPerson,
      billerContactNumber,
    } = req.body;

    // Find the client in the database based on the provided client ID
    const existingClient = await Client.findOne({
      where: {
        clientId: clientId,
      },
    });

    // If the client is not found, return an error
    if (!existingClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Update the client with the new data
    await existingClient.update({
      clientName,
      address,
      natureOfBusiness,
      contactNumber,
      billerName,
      billerAddress,
      billerContactPerson,
      billerContactNumber,
    });

    // Redirect back to the client route with a success message
    res.redirect("/marketing_dashboard/clients?success=update");
  } catch (error) {
    // Handling errors
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Type of Waste controller
async function getTypeOfWasteController(req, res) {
  try {
    const database = getDb();

    const typeOfWastes = await database
      .collection("typeOfWastes")
      .find()
      .toArray();

    console.log(typeOfWastes);

    // Get the page number, entries per page, and search query from the query parameters
    const currentPage = parseInt(req.query.page) || 1;
    const entriesPerPage = parseInt(req.query.entriesPerPage) || 10;
    const searchQuery = req.query.search || ""; // Default to an empty string if no search query

    // Additional logic to filter types of waste based on the search query
    const filteredTypesOfWaste = typeOfWastes.filter((typeOfWaste) => {
      // Customize this logic based on how you want to perform the search
      return typeOfWaste["WASTE NAME"]
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      // Add more fields if needed
    });

    // Calculate total pages based on the total number of filtered types of waste and entries per page
    const totalFilteredTypesOfWaste = filteredTypesOfWaste.length;
    const totalPages = Math.ceil(totalFilteredTypesOfWaste / entriesPerPage);

    // Implement pagination and send the filtered types of waste to the view
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = currentPage * entriesPerPage;
    const paginatedTypesOfWaste = filteredTypesOfWaste.slice(
      startIndex,
      endIndex
    );

    const viewsData = {
      pageTitle: "Marketing User - Type of Waste",
      sidebar: "marketing/marketing_sidebar",
      content: "marketing/type_of_waste",
      route: "type_of_waste",
      typesOfWaste: paginatedTypesOfWaste,
      currentPage,
      totalPages,
      entriesPerPage,
      searchQuery,
    };
    res.render("dashboard", viewsData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Quotations controller
async function getQuotationsController(req, res) {
  try {
    // Fetch all quotations from the database
    const quotations = await Quotation.findAll({
      include: [
        { model: Client, as: "Client" },
        { model: Employee, as: "Employee" },
      ],
    });

    // Get the page number, entries per page, and search query from the query parameters
    const currentPage = parseInt(req.query.page) || 1;
    const entriesPerPage = parseInt(req.query.entriesPerPage) || 10;
    const searchQuery = req.query.search || ""; // Default to an empty string if no search query

    // Additional logic to filter types of waste based on the search query
    const filteredQuotations = quotations.filter((quotation) => {
      // Customize this logic based on how you want to perform the search
      const clientName = quotation.Client.clientName;
      return clientName.toLowerCase().includes(searchQuery.toLowerCase());
      // Add more fields if needed
    });

    // Calculate total pages based on the total number of filtered types of waste and entries per page
    const totalFilteredQuotations = filteredQuotations.length;
    const totalPages = Math.ceil(totalFilteredQuotations / entriesPerPage);

    // Implement pagination and send the filtered types of waste to the view
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = currentPage * entriesPerPage;
    const paginatedQuotations = filteredQuotations.slice(startIndex, endIndex);

    // Check for the success query parameter
    let successMessage;
    if (req.query.success === "new") {
      successMessage = "Quotation created successfully!";
    } else if (req.query.success === "update") {
      successMessage = "Quotation updated successfully!";
    }

    const viewsData = {
      pageTitle: "Marketing User - Quotations",
      sidebar: "marketing/marketing_sidebar",
      content: "marketing/quotations",
      route: "quotations",
      quotations: paginatedQuotations,
      currentPage,
      totalPages,
      entriesPerPage,
      searchQuery,
      successMessage,
    };
    res.render("dashboard", viewsData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

// New Quotation controller
async function getNewQuotationController(req, res) {
  try {
    var currentPage, totalPages, entriesPerPage, searchQuery;
    const employeeId = req.session.employeeId;

    const employee = await Employee.findOne({ where: { employeeId } });
    const clients = await Client.findAll();
    const typesOfWastes = await TypeOfWaste.findAll();
    const vehicleTypes = await VehicleType.findAll();

    // Function to convert a string to proper case
    function toProperCase(str) {
      return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }

    // Apply the function to the employee's first and last names
    const employeeName = `${toProperCase(employee.firstName)} ${toProperCase(
      employee.lastName
    )}`;
    const employeeSignature = employee.picture.replace(/\.jpg$/, ".png");

    // Sorting the clients array by clientName
    clients.sort((clientA, clientB) => {
      const nameA = clientA.clientName.toUpperCase(); // Convert names to uppercase for case-insensitive sorting
      const nameB = clientB.clientName.toUpperCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0; // Names are equal
    });

    // Render the dashboard view with data
    const viewsData = {
      pageTitle: "Marketing User - New Quotation Form",
      sidebar: "marketing/marketing_sidebar",
      content: "marketing/new_quotation",
      route: "marketing_dashboard",
      currentPage,
      totalPages,
      entriesPerPage,
      searchQuery,
      employeeName,
      employeeId,
      employeeSignature,
      typesOfWastes,
      clients,
      vehicleTypes,
    };
    res.render("dashboard", viewsData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}
async function postNewQuotationController(req, res) {
  try {
    const {
      userId,
      quotation_no,
      revision_no,
      validity,
      terms,
      terms2,
      clientId,
      scope_of_work,
      remarks,
      list_counter,
      tf_counter,
    } = req.body;

    // Creating a new Quotation
    const quotation = await Quotation.create({
      quotationCode: quotation_no,
      revisionNumber: revision_no,
      validity: validity,
      clientId: clientId,
      termsCharge: terms,
      termsBuying: terms2,
      scopeOfWork: scope_of_work,
      remarks: remarks,
      submittedBy: userId,
    });
    console.log(quotation.quotationId);
    // Process dynamic fields
    for (let i = 1; i <= list_counter; i++) {
      const waste_code = req.body[`waste_code${i}`];
      const waste_name = req.body[`waste_name${i}`];
      const mode = req.body[`mode${i}`];
      const unit = req.body[`unit${i}`];
      const unit_price = req.body[`unit_price${i}`];
      const vat_calculation = req.body[`vat_calculation${i}`];
      const fix_price = req.body[`fix_price${i}`];

      // Creating a new QuotationWaste
      await QuotationWaste.create({
        quotationId: quotation.quotationId,
        wasteId: waste_code,
        wasteName: waste_name,
        mode: mode,
        unit: unit,
        unitPrice: unit_price,
        vatCalculation: vat_calculation,
        maxCapacity: fix_price,
      });
    }

    // Process dynamic transportation fields
    for (let i = 1; i <= tf_counter; i++) {
      const type_of_vehicle = req.body[`type_of_vehicle${i}`];
      const hauling_area = req.body[`hauling_area${i}`];
      const tf_mode = req.body[`tf_mode${i}`];
      const tf_unit = req.body[`tf_unit${i}`];
      const tf_unit_price = req.body[`tf_unit_price${i}`];
      const tf_vat_calculation = req.body[`tf_vat_calculation${i}`];
      const max_capacity = req.body[`max_capacity${i}`];

      // Creating a new QuotationTransportation
      await QuotationTransportation.create({
        quotationId: quotation.quotationId,
        vehicleId: type_of_vehicle,
        haulingArea: hauling_area,
        mode: tf_mode,
        unit: tf_unit,
        unitPrice: tf_unit_price,
        vatCalculation: tf_vat_calculation,
        maxCapacity: max_capacity,
      });
    }

    // Redirect back to the quotation route with a success message
    res.redirect("/marketing_dashboard/quotations?success=new");
  } catch (error) {
    // Handling errors
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update Quotation controller
async function getUpdateQuotationController(req, res) {
  try {
    var currentPage, totalPages, entriesPerPage, searchQuery;
    const employeeId = req.session.employeeId;
    const quotationCode = req.params.quotationCode;
    const revisionNumber = req.params.revisionNumber;

    const employee = await Employee.findOne({ where: { employeeId } });
    const typesOfWastes = await TypeOfWaste.findAll();
    const vehicleTypes = await VehicleType.findAll();
    const quotation = await Quotation.findAll({
      where: {
        quotationCode,
        revisionNumber,
        status: "ACTIVE", // Add this condition
      },
      include: [
        { model: Client, as: "Client" },
        {
          model: QuotationWaste,
          as: "QuotationWaste",
          include: [{ model: TypeOfWaste, as: "TypeOfWaste" }],
        },
        {
          model: QuotationTransportation,
          as: "QuotationTransportation",
          include: [{ model: VehicleType, as: "VehicleType" }],
        },
        { model: Employee, as: "Employee" },
      ],
    });

    // Function to convert a string to proper case
    function toProperCase(str) {
      return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }

    // Apply the function to the employee's first and last names
    const employeeName = `${toProperCase(employee.firstName)} ${toProperCase(
      employee.lastName
    )}`;
    const employeeSignature = employee.picture.replace(/\.jpg$/, ".png");

    // Render the dashboard view with data
    const viewsData = {
      pageTitle: "Marketing User - Update Quotation Form",
      sidebar: "marketing/marketing_sidebar",
      content: "marketing/update_quotation",
      route: "marketing_dashboard",
      currentPage,
      totalPages,
      entriesPerPage,
      searchQuery,
      employeeName,
      employeeId,
      employeeSignature,
      quotation,
      typesOfWastes,
      vehicleTypes,
    };
    res.render("dashboard", viewsData);
  } catch (error) {
    console.error("Error:", error);
    // Handle the error appropriately (e.g., send an error response)
    res.status(500).send("Internal Server Error");
  }
}
async function postUpdateQuotationController(req, res) {
  try {
    const {
      userId,
      quotation_no,
      revision_no,
      validity,
      terms,
      terms2,
      client,
      scope_of_work,
      remarks,
      list_counter,
      tf_counter,
      imageDataUrl,
    } = req.body;

    // Convert base64 image data to buffer
    const imageDataBuffer = Buffer.from(imageDataUrl.split(",")[1], "base64");

    // You may want to generate a unique filename or use the quotation code as the filename
    const filename = "your-unique-filename.png";

    // Save the image to a specific directory (create the directory if it doesn't exist)
    const imagePath = path.join(__dirname, "images", filename);
    await fs.writeFile(imagePath, imageDataBuffer);
    // Creating a new Quotation
    const newQuotation = await Quotation.create({
      quotationCode: quotation_no,
      revisionNumber: revision_no,
      validity: validity,
      clientId: client,
      termsCharge: terms,
      termsBuying: terms2,
      scopeOfWork: scope_of_work,
      remarks: remarks,
      submittedBy: userId,
      quotationImage: `/images/${filename}`,
    });

    // Process dynamic fields
    for (let i = 1; i <= list_counter; i++) {
      const waste_code = req.body[`waste_code${i}`];
      const waste_name = req.body[`waste_name${i}`];
      const mode = req.body[`mode${i}`];
      const unit = req.body[`unit${i}`];
      const unit_price = req.body[`unit_price${i}`];
      const vat_calculation = req.body[`vat_calculation${i}`];
      const fix_price = req.body[`fix_price${i}`];

      // Creating a new QuotationWaste
      const newQuotationWaste = await QuotationWaste.create({
        quotationCode: quotation_no,
        wasteId: waste_code,
        wasteName: waste_name,
        mode: mode,
        unit: unit,
        unitPrice: unit_price,
        vatCalculation: vat_calculation,
        maxCapacity: fix_price,
      });
    }

    // Process dynamic transportation fields
    for (let i = 1; i <= tf_counter; i++) {
      const type_of_vehicle = req.body[`type_of_vehicle${i}`];
      const hauling_area = req.body[`hauling_area${i}`];
      const tf_mode = req.body[`tf_mode${i}`];
      const tf_unit = req.body[`tf_unit${i}`];
      const tf_unit_price = req.body[`tf_unit_price${i}`];
      const tf_vat_calculation = req.body[`tf_vat_calculation${i}`];
      const max_capacity = req.body[`max_capacity${i}`];

      // Creating a new QuotationTransportation
      const newQuotationTransportation = await QuotationTransportation.create({
        quotationCode: quotation_no,
        vehicleId: type_of_vehicle,
        haulingArea: hauling_area,
        mode: tf_mode,
        unit: tf_unit,
        unitPrice: tf_unit_price,
        vatCalculation: tf_vat_calculation,
        maxCapacity: max_capacity,
      });
    }

    // Redirect back to the quotation route with a success message
    res.redirect("/marketing_dashboard/quotations?success=new");
  } catch (error) {
    // Handling errors
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Commissions controller
async function getCommissionsController(req, res) {
  try {
    // Fetch all quotations from the database
    const quotations = await Quotation.findAll({
      include: [
        { model: Client, as: "Client" },
        { model: Employee, as: "Employee" },
      ],
    });

    // Get the page number, entries per page, and search query from the query parameters
    // const currentPage = parseInt(req.query.page) || 1;
    const currentPage = 1;
    const entriesPerPage = parseInt(req.query.entriesPerPage) || 10;
    const searchQuery = req.query.search || ""; // Default to an empty string if no search query

    // Additional logic to filter types of waste based on the search query
    const filteredQuotations = quotations.filter((quotation) => {
      // Customize this logic based on how you want to perform the search
      const clientName = quotation.Client.clientName;
      return clientName.toLowerCase().includes(searchQuery.toLowerCase());
      // Add more fields if needed
    });

    // Calculate total pages based on the total number of filtered types of waste and entries per page
    // const totalFilteredQuotations = filteredQuotations.length;
    const totalFilteredQuotations = 1;
    const totalPages = Math.ceil(totalFilteredQuotations / entriesPerPage);

    // Implement pagination and send the filtered types of waste to the view
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = currentPage * entriesPerPage;
    const paginatedQuotations = filteredQuotations.slice(startIndex, endIndex);

    // Check for the success query parameter
    let successMessage;
    if (req.query.success === "new") {
      successMessage = "Quotation created successfully!";
    } else if (req.query.success === "update") {
      successMessage = "Quotation updated successfully!";
    }

    const viewsData = {
      pageTitle: "Marketing User - Commissions",
      sidebar: "marketing/marketing_sidebar",
      content: "marketing/commissions",
      route: "commissions",
      quotations: paginatedQuotations,
      currentPage,
      totalPages,
      entriesPerPage,
      searchQuery,
      successMessage,
    };
    res.render("dashboard", viewsData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  getMarketingDashboardController,
  getBookedTransactionsController,
  postBookedTransactionsController,
  updateBookedTransactionsController,
  delete_booked_transactionsController,
  getClientsController,
  getClientDetails,
  getNewClientController,
  postNewClientController,
  postUpdateClientController,
  getTypeOfWasteController,
  getQuotationsController,
  getNewQuotationController,
  postNewQuotationController,
  getUpdateQuotationController,
  postUpdateQuotationController,
  getCommissionsController,
};
