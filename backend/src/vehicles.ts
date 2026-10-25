
import { Router, Response } from "express";
import { z } from "zod";
import { pool } from "./db";
import { authenticateToken, AuthRequest, requireAdmin } from "./authMiddleware";

const router = Router();

const vehicleSchema = z.object({
  make: z.string().trim().min(1).max(100),
  model: z.string().trim().min(1).max(100),
  year: z.number().int().min(1886).max(2100),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative().default(0),
});

const quantitySchema = z.object({
  quantity: z.number().int().positive(),
});

router.use(authenticateToken);

// List vehicles, optionally searching by make or model.
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const search = String(req.query.search ?? "").trim();

    const result = await pool.query(
      `SELECT id, make, model, year, price, quantity, created_at
       FROM vehicles
       WHERE $1 = '' OR make ILIKE $2 OR model ILIKE $2
       ORDER BY id`,
      [search, `%${search}%`]
    );

    return res.status(200).json({ vehicles: result.rows });
  } catch {
    return res.status(500).json({ message: "Failed to fetch vehicles" });
  }
});

// Create a vehicle.
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

// Purchase vehicles by decreasing the available quantity.
router.post("/:id/purchase", async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const parsed = quantitySchema.safeParse(req.body);

  if (!Number.isInteger(id) || id <= 0 || !parsed.success) {
    return res.status(400).json({ message: "Invalid vehicle ID or quantity" });
  }

  try {
    const result = await pool.query(
      `UPDATE vehicles
       SET quantity = quantity - $1
       WHERE id = $2 AND quantity >= $1
       RETURNING id, make, model, year, price, quantity, created_at`,
      [parsed.data.quantity, id]
    );

    if (result.rowCount === 0) {
      const exists = await pool.query(
        "SELECT id FROM vehicles WHERE id = $1",
        [id]
      );

      if (exists.rowCount === 0) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      return res.status(409).json({ message: "Insufficient stock" });
    }

    return res.status(200).json({ vehicle: result.rows[0] });
  } catch {
    return res.status(500).json({ message: "Failed to purchase vehicle" });
  }
});

// Restock is restricted to admins.
router.patch(
  "/:id/restock",
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const parsed = quantitySchema.safeParse(req.body);

    if (!Number.isInteger(id) || id <= 0 || !parsed.success) {
      return res.status(400).json({ message: "Invalid vehicle ID or quantity" });
    }

    try {
      const result = await pool.query(
        `UPDATE vehicles
         SET quantity = quantity + $1
         WHERE id = $2
         RETURNING id, make, model, year, price, quantity, created_at`,
        [parsed.data.quantity, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      return res.status(200).json({ vehicle: result.rows[0] });
    } catch {
      return res.status(500).json({ message: "Failed to restock vehicle" });
    }
  }
);

// Delete is restricted to admins.
router.delete(
  "/:id",
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    try {
      const result = await pool.query(
        "DELETE FROM vehicles WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      return res.status(200).json({ message: "Vehicle deleted successfully" });
    } catch {
      return res.status(500).json({ message: "Failed to delete vehicle" });
    }
  }
);

export default router;
