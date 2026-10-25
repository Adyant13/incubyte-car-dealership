
import { describe, it, expect, beforeAll, } from "vitest";
import request from "supertest";
import app from "../src/app";
import { initDb, pool } from "../src/db";

beforeAll(async () => {
  await initDb();
  await pool.query("DELETE FROM users WHERE email = $1", [
    "test@example.com",
  ]);
});


describe("Authentication", () => {
  it("registers a user with valid details", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "StrongPass123!",
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("test@example.com");
    expect(response.body.user).not.toHaveProperty("password");
    expect(response.body.user).not.toHaveProperty("password_hash");
  });

  it("logs in a registered user and returns a JWT", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "StrongPass123!",
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTypeOf("string");
    expect(response.body.user.email).toBe("test@example.com");
    expect(response.body.user).not.toHaveProperty("password_hash");
  });
});
