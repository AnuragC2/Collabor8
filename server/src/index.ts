import "dotenv/config";
import app from "./app.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/collabor8";

async function startServer() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
