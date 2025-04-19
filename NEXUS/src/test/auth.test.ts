import request from "supertest";
import { app } from "../app";

describe("Login Process", () => {
  let response: request.Response;

  beforeAll(async () => {
    response = await request(app).post("/login").send({
      email: "theenmanuel123@gmail.com",
      password: "12345678",
    });
  });

  test("response with 200 status code", async () => {
    expect(response.status).toBe(200);
  });

  test("return a JSON", async () => {
    expect(response.type).toBe("application/json");
  });

  test("retrieve attributes on each user", async () => {
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("lastName");
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("profile");
    expect(response.body).toHaveProperty("password");
  });

  test("should return a valid token on successful login", async () => {
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
  });

  test("should return error on invalid credentials", async () => {
    const errorResponse = await request(app).post("/login").send({
      email: "theenmanuel123@gmail.com",
      password: "12345678",
    });

    expect(errorResponse.status).toBe(401);
    expect(errorResponse.body.message).toBe("Invalid credentials");
  });
});
