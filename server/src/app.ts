import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js"
import { errorHandler } from "./core/middleware/errorHandler.js";
const app = express();

app.use(cors());
app.use(express.json());

// Health route
import healthRoute from "./routes/health.routes.js";
app.use("/health", healthRoute);

//Auth route
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

export default app;
