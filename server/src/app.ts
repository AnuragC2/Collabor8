import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Health route
import healthRoute from "./routes/health.routes.js";
app.use("/health", healthRoute);

export default app;
