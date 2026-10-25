
import express from "express";
import cors from "cors";
import authRouter from "./auth";
import vehiclesRouter from "./vehicles";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/vehicles", vehiclesRouter);

export default app;
