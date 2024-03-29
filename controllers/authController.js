// controllers/authController.js

const { getDb } = require("../config/db");
const bcrypt = require("bcrypt");

async function getSignupController(req, res) {
  try {
    const viewsData = {
      pageTitle: "Sign Up",
    };
    res.render("signup", viewsData); // Assuming you have a signup.ejs file in your views folder
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Controller function for handling signup
async function postSignupController(req, res) {
  try {
    const { employeeId, password } = req.body;
    const database = getDb();

    const employees = await database
      .collection("employeeData")
      .find()
      .toArray();
    const users = await database.collection("users").find().toArray();

    // Check if the employeeId exists in the Employee collection
    const existingEmployee = employees.find(
      (employee) => employee.employeeId === employeeId
    );
    if (!existingEmployee) {
      // Employee ID is not valid, render the signup page with an error message
      const viewsData = {
        pageTitle: "Sign Up",
        error: "Invalid Employee ID",
      };
      return res.render("signup", viewsData);
    }

    // Check if the employeeId is already registered in the User collection
    const existingUser = users.find((user) => user.employeeId === employeeId);
    if (existingUser) {
      // Employee is already registered, render the signup page with an error message
      const viewsData = {
        pageTitle: "Sign Up",
        error: "Employee is already registered",
      };
      return res.render("signup", viewsData);
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the User collection
    const newUser = {
      employeeId,
      password: hashedPassword,
      createdAt: new Date(),
    };

    await database.collection("users").insertOne(newUser);
    // Set session data or other authentication mechanisms if needed
    // Redirect to a dashboard or home page after successful sign-up
    return res.redirect("/");
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Internal Server Error");
  }
}

async function getLoginController(req, res) {
  try {
    const viewsData = {
      pageTitle: "Login",
    };
    res.render("login", viewsData); // Assuming you have a login.ejs file in your views folder
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function postLoginController(req, res) {
  try {
    const { employeeId, password } = req.body;
    const database = getDb();

    const employees = await database
      .collection("employeeData")
      .find()
      .toArray();
    const users = await database.collection("users").find().toArray();

    const employee = employees.find(
      (employee) => employee.employeeId === employeeId
    );
    const user = users.find((user) => user.employeeId === employeeId);
    // Find the user with the provided employee ID and populate the associated employee data
    console.log(user);
    console.log(employee);

    // Check if the user exists and the password is correct (implement your authentication logic)
    if (user && (await bcrypt.compare(password, user.password))) {
      // Check the employeeRoleId
      if (employee.employeeRoleId == 2) {
        req.session.employeeId = user.employeeId;
        res.redirect(`/marketing_dashboard`);
      } else if (employee.employeeRoleId == 3) {
        req.session.employeeId = user.employeeId;
        res.redirect(`/dispatching_dashboard`);
      } else if (employee.employeeRoleId == 4) {
        req.session.employeeId = user.employeeId;
        res.redirect(`/receiving_dashboard`);
      } else {
        // Redirect to a different route if needed
        res.redirect(`/`);
      }
      console.log(req.session);
    } else {
      // Display an error message for incorrect credentials
      const viewsData = {
        pageTitle: "Login",
        error: "Invalid employee ID or password",
      };
      res.render("login", viewsData);
    }
  } catch (error) {
    console.error("Error:", error);
    // Handle errors gracefully, redirect to an error page, or display a generic error message
    return res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  getSignupController,
  postLoginController,
  getLoginController,
  postSignupController,
};
