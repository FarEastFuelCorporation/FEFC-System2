require("dotenv").config();
require("events").EventEmitter.defaultMaxListeners = 25;

const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const { connectToDb, getDb } = require("./config/db");

const app = express();
const port = process.env.PORT || 3001;

// Set up EJS as the view engine
app.set("view engine", "ejs");

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Serve Bootstrap files from the 'node_modules' folder
app.use(
  "/bootstrap",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist"))
);
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

// Set Cache-Control header to prevent caching
app.use((req, res, next) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));

// Use express-session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Use only with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 10000, // Session expiration time
    },
  })
);

// Middleware to check authentication
const { isAuthenticated } = require("./middlewares/auth");
app.use("/requests", isAuthenticated);
app.use("/marketing_dashboard", isAuthenticated);
app.use("/dispatching_dashboard", isAuthenticated);

// Include your routes
const authRoutes = require("./routes/auth");
const othersRoutes = require("./routes/others");
const requestsRoutes = require("./routes/requests");
const marketingDashboardRoutes = require("./routes/marketing_dashboard");
const dispatchingDashboardRoutes = require("./routes/dispatching_dashboard");
const receivingDashboardRoutes = require("./routes/receiving_dashboard");
const { error404Controller } = require("./controllers/othersController");

app.use(authRoutes);
app.use(othersRoutes);
app.use("/requests", requestsRoutes);
app.use("/marketing_dashboard", marketingDashboardRoutes);
app.use("/dispatching_dashboard", dispatchingDashboardRoutes);
app.use("/receiving_dashboard", receivingDashboardRoutes);

app.use(express.json()); // Middleware to parse JSON request bodies
// app.use(error404Controller);

let database;

connectToDb((err) => {
  if (!err) {
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    database = getDb();
  }
});

app.get("/employee", (req, res) => {
  let employees = [];

  database
    .collection("employeeData")
    .find()
    .sort({ employeeId: 1 })
    .forEach((employee) => employees.push(employee))
    .then(() => {
      res.status(200).json(employees);
    })
    .catch(() => {
      res.status(500).json({ error: "Could not fetch the documents" });
    });
});
