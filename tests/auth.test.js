const request = require("supertest");
const app = require("../src/app");

describe("Auth Endpoints", () => {

  it("should signup a new user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User created successfully");
  });

  it("should not allow duplicate email", async () => {
    await request(app).post("/api/auth/signup").send({
      first_name: "Jane",
      last_name: "Doe",
      email: "duplicate@example.com",
      password: "password123"
    });

    const res = await request(app).post("/api/auth/signup").send({
      first_name: "Jane",
      last_name: "Doe",
      email: "duplicate@example.com",
      password: "password123"
    });

    expect(res.statusCode).toBe(500);
  });

  it("should login successfully", async () => {
    await request(app).post("/api/auth/signup").send({
      first_name: "Mike",
      last_name: "Smith",
      email: "mike@example.com",
      password: "password123"
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "mike@example.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

});
