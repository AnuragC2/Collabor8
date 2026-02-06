import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js"
import { errorHandler } from "./core/middleware/errorHandler.js";
import userRoutes from "./modules/user/user.routes.js";
import  taskRoutes  from './modules/task/task.routes.js'
import projectRoutes from "./modules/project/project.routes.js";
import commentRoutes from "./modules/comment/comment.routes.js";
const app = express();

const allowedDomains = [
  /\.vercel\.app$/,
  /^http:\/\/localhost:5173$/, 
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); 

      const isAllowed = allowedDomains.some(domain => domain.test(origin));
      
      if (isAllowed) {
        callback(null, true); 
      } else {
        console.log(`CORS rejected origin: ${origin}`);
        callback(new Error('Not allowed by CORS'), false); 
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Health route
import healthRoute from "./routes/health.routes.js";
import workspaceroutes from "./modules/workspace/workspace.routes.js";
app.use("/health", healthRoute);

//Auth route
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspace", workspaceroutes)
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/task", taskRoutes);
app.use("/api/v1/comment", commentRoutes);

app.use(errorHandler);

export default app;
