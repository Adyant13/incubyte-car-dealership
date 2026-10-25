
import { Router, Response } from "express";
import { z } from "zod";
import { pool } from "./db";
import {
  authenticateToken,
  AuthRequest,
} from "./authMiddleware";

const router = Router();

const vehicleSchema = z.object({
  make: z.string().trim().min(1).max(100),
  model: z.string().trim().min(1).max(100),
  year: z.number().int().min(1886).max(2100),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative().default(0),
});

router.use(authenticateToken);

router.get("/", async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, make, model, year, price, quantity, created_at FROM vehicles ORDER BY id"
    );

    return res.status(200).json({ vehicles: result.rows });
  } catch {
    return res.status(500).json({ message: "Failed to fetch vehicles" });
  }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const parsed = vehicleSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid vehicle details",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const { make, model, year, price, quantity } = parsed.data;

    const result = await pool.query(
      `INSERT INTO vehicles (make, model, year, price, quantity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, make, model, year, price, quantity, created_at`,
      [make, model, year, price, quantity]
    );

    return res.status(201).json({ vehicle: result.rows[0] });
  } catch {
    return res.status(500).json({ message: "Failed to create vehicle" });
  }
});

export default router;
