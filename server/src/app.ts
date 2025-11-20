import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js"
import { errorHandler } from "./core/middleware/errorHandler.js";
import userRoutes from "./modules/user/user.routes.js";
const app = express();

app.use(cors());
app.use(express.json());

// Health route
import healthRoute from "./routes/health.routes.js";
import workspaceroutes from "./modules/workspace/workspace.routes.js";
app.use("/health", healthRoute);

//Auth route
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspace", workspaceroutes)
app.use("/api/v1/user", userRoutes);

app.use(errorHandler);

export default app;
