const request = require("supertest");
const app = require("./app");

let server;

beforeAll(() => {
  server = app.listen(3000); // Explicitly start the server for the tests
});

afterAll(() => {
  server.close(); // Close the server after tests
});

describe("User Management API Endpoints", () => {
  test("GET /users - should return list of users", async () => {
    const response = await request(app).get("/users");
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("users"); // Adjust based on your view content
  });
  
  test("GET /addUser - should display add user form", async () => {
    const response = await request(app).get("/addUser");
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("form"); // Adjust based on your view content
  });


  test("POST /users - should add a new user", async () => {
    const newUser = { name: "John Doe", email: "john@example.com", age: 30 };
    const response = await request(app)
      .post("/users")
      .send(newUser)
      .type("form");
    expect(response.statusCode).toBe(302); // Redirect status
  });

  // Route to retrieve user by ID
app.get('/users/:id', async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id); // Using Sequelize to find user by UUID
      if (!user) return res.status(404).send('User not found');
      res.render('userDetails', { user }); // Adjust according to your view
    } catch (err) {
      res.status(500).send('Server error');
    }
  });
  
  // Route to display the edit form
  app.get('/users/:id/edit', async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).send('User not found');
      res.render('editUser', { user }); // Adjust according to your view
    } catch (err) {
      res.status(500).send('Server error');
    }
  });
  

  test("PUT /users/:id - should update user details", async () => {
    const userId = "d7b77c97-e0ba-4b6b-9c39-ec19ef0d8a9a"; // Example UUID, change based on your DB
    const updatedUser = { name: "Jane Doe", email: "jane@example.com", age: 25 };
    const response = await request(app)
      .put(`/users/${userId}`)
      .send(updatedUser)
      .type("form");
    expect(response.statusCode).toBe(302); // Redirect status
  });

  test("DELETE /users/:id - should delete a user", async () => {
    const userId = "d7b77c97-e0ba-4b6b-9c39-ec19ef0d8a9a"; // Example UUID, change based on your DB
    const response = await request(app).delete(`/users/${userId}`);
    expect(response.statusCode).toBe(302); // Redirect status
  });
});
