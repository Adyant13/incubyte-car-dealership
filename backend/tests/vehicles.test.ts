
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { initDb, pool } from "../src/db";

let token = "";

beforeAll(async () => {
  await initDb();

  await pool.query("DELETE FROM users WHERE email = $1", [
    "vehicle-test@example.com",
  ]);

  const registration = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Vehicle Tester",
      email: "vehicle-test@example.com",
      password: "StrongPass123!",
    });

  const login = await request(app)
    .post("/api/auth/login")
    .send({
      email: "vehicle-test@example.com",
      password: "StrongPass123!",
    });

  token = login.body.token;

  await pool.query("DELETE FROM vehicles WHERE make = $1 AND model = $2", [
    "Toyota",
    "Corolla",
  ]);
});

afterAll(async () => {
  await pool.end();
});

describe("Vehicle inventory", () => {
  it("rejects requests without authentication", async () => {
    const response = await request(app).get("/api/vehicles");

    expect(response.status).toBe(401);
  });

  it("creates a vehicle for an authenticated user", async () => {
    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        make: "Toyota",
        model: "Corolla",
        year: 2024,
        price: 25000,
        quantity: 3,
      });

    expect(response.status).toBe(201);
    expect(response.body.vehicle.make).toBe("Toyota");
    expect(response.body.vehicle.model).toBe("Corolla");
    expect(Number(response.body.vehicle.quantity)).toBe(3);
  });

  it("lists vehicles in the inventory", async () => {
    const response = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles).toBeInstanceOf(Array);
    expect(
      response.body.vehicles.some(
        (vehicle: { make: string; model: string }) =>
          vehicle.make === "Toyota" && vehicle.model === "Corolla"
      )
    ).toBe(true);
  });
});
