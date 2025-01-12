# User Management API

This is a simple User Management API built with Express.js, Sequelize (PostgreSQL), and Supertest for testing.

## Features

- **CRUD Operations**:
  - **Create**: Add a new user.
  - **Read**: View the list of users and individual user details.
  - **Update**: Edit user details.
  - **Delete**: Remove a user.
  
- **API Endpoints**:
  - `GET /users`: Get the list of all users.
  - `GET /addUser`: Display the form to add a new user.
  - `POST /users`: Create a new user.
  - `GET /users/:id`: Get the details of a user by UUID.
  - `GET /users/:id/edit`: Display the form to edit a user.
  - `PUT /users/:id`: Update a user's details.
  - `DELETE /users/:id`: Delete a user.

## Installation

### Prerequisites

- Node.js (v14+)
- PostgreSQL Database

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/user-management-api.git
   cd user-management-api

2. Install dependencies:

   npm install
3. Configure the database connection in the config/config.json file. Update the database settings to match your PostgreSQL instance.

4. Run the migrations to set up the database schema:
   npx sequelize-cli db:migrate
5. Start the server:
    npm start
   The server will be running on http://localhost:3000.


Testing
To run the tests for this application, you can use Jest with Supertest.

Steps:
1. Run the tests:
   npm test
2. The tests will execute the following:

Test the GET, POST, PUT, and DELETE requests to ensure proper functionality of the API.
The server will be automatically started and stopped during the test execution.

Common Issues:
Port already in use: If you encounter the error EADDRINUSE, make sure no other application is using port 3000. You can kill the process using port 3000 or change the port in the app.js file.

Example (Linux/Mac):
kill $(lsof -t -i:3000)
