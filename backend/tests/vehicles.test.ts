
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { initDb, pool } from "../src/db";

let token = "";
let vehicleId = 0;

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

  expect(registration.status).toBe(201);

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

    vehicleId = response.body.vehicle.id;
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

  it("searches vehicles by make", async () => {
    const response = await request(app)
      .get("/api/vehicles?search=Toyota")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(
      response.body.vehicles.some(
        (vehicle: { make: string }) => vehicle.make === "Toyota"
      )
    ).toBe(true);
  });

  it("purchases a vehicle and reduces its quantity", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 1 });

    expect(response.status).toBe(200);
    expect(Number(response.body.vehicle.quantity)).toBe(2);
  });

  it("rejects a purchase when stock is insufficient", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 999999 });

    expect(response.status).toBe(409);
  });

  it("prevents regular users from restocking vehicles", async () => {
    const response = await request(app)
      .patch(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 5 });

    expect(response.status).toBe(403);
  });

  it("prevents regular users from deleting vehicles", async () => {
    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it("returns 404 when purchasing a nonexistent vehicle", async () => {
    const response = await request(app)
      .post("/api/vehicles/999999999/purchase")
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 1 });

    expect(response.status).toBe(404);
  });
});
