const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
require("./src/libs/hbs-helper");
const config = require("./config/config.json");
const { Sequelize, QueryTypes } = require("sequelize");
const sequelize = new Sequelize(config.development);
const session = require("express-session");
const flash = require("express-flash");
const methodOverride = require("method-override");
const { body, validationResult } = require("express-validator");
const morgan = require("morgan");
const fs = require("fs");

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

// Swagger Configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "User Management API",
      version: "1.0.0",
      description: "API for managing users",
    },
    servers: [{ url: `http://localhost:${port}` }],
  },
  apis: [__filename], // Swagger annotations in this file
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "my-session",
    secret: "kelapamiringlarilurus",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24, // 1 hari
    },
  })
);
app.use(flash());

// Logging middleware with morgan
const logStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});
app.use(morgan("combined", { stream: logStream }));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./src/views"));

// Middleware untuk validasi input
const validateUserInput = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 3 }).withMessage("Name should be at least 3 characters long."),
  body("email")
    .isEmail().withMessage("Invalid email format.")
    .normalizeEmail(),
  body("age")
    .isInt({ min: 1 }).withMessage("Age must be a positive integer.")
    .toInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("addUser", { 
        errors: errors.array(), 
        oldData: req.body 
      });
    }
    next();
  },
];

module.exports = app;

// Routes
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     responses:
 *       200:
 *         description: List of users
 */
app.get("/users", home);

app.get("/addUser", addUser);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Add a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               age:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User added successfully
 */
app.post("/users", validateUserInput, users);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve detailed information about a user by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
app.get("/users/:id", userDetail);
app.get("/users/:id/edit", userEditForm);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Edit user details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               age:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User updated successfully
 */
app.put("/users/:id", validateUserInput, userEdit);

app.post("/users/:id/delete", userDelete);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Permanently delete a user from the database by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

app.delete("/users/:id", userDelete);

// Function to display add user form
function addUser(req, res) {
  res.render("addUser");
}

// Function to add a new user to the database
async function users(req, res) {
  const { name, email, age } = req.body;

  try {
    const query = `INSERT INTO users(name, email, age) VALUES('${name}', '${email}', '${age}')`;
    await sequelize.query(query, { type: QueryTypes.INSERT });
    req.flash("success", "User added successfully!");
    res.redirect("/users");
  } catch (err) {
    console.error("Error inserting user:", err);
    req.flash("error", "Error adding user.");
    res.redirect("/addUser");
  }
}

// Function to fetch and display all users
function home(req, res) {
  const query = `SELECT * FROM users`;

  sequelize
    .query(query, { type: QueryTypes.SELECT })
    .then((users) => {
      res.render("index", { users });
    })
    .catch((err) => {
      console.error("Error fetching users:", err);
      res.status(500).send("Internal Server Error");
    });
}

// Function to fetch and display a specific user
async function userDetail(req, res) {
  const { id } = req.params;

  const query = `SELECT * FROM users WHERE id='${id}'`;

  try {
    const user = await sequelize.query(query, { type: QueryTypes.SELECT });

    if (user.length > 0) {
      res.render("detailUser", { user: user[0] });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Function to edit a user
async function userEdit(req, res) {
  const { id } = req.params;
  const { name, email, age } = req.body;

  const query = `UPDATE users SET name='${name}', email='${email}', age=${age} WHERE id='${id}'`;

  try {
    await sequelize.query(query, { type: QueryTypes.UPDATE });
    req.flash("success", "User updated successfully!");
    res.redirect(`/users/${id}`);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Function to display the edit form for a specific user
async function userEditForm(req, res) {
  const { id } = req.params;

  const query = `SELECT * FROM users WHERE id='${id}'`;

  try {
    const user = await sequelize.query(query, { type: QueryTypes.SELECT });

    if (user.length > 0) {
      res.render("editUser", { user: user[0] });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Function to delete a user
async function userDelete(req, res) {
  const { id } = req.params;

  const query = `DELETE FROM users WHERE id='${id}'`;

  try {
    await sequelize.query(query, { type: QueryTypes.DELETE });
    req.flash("success", "User deleted successfully!");
    res.redirect("/users");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
