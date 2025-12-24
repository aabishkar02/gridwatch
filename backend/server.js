import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import { authRouter } from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import apiRouter from "./routes/apiRoutes.js";
import dataRouter from "./routes/dataRoutes.js";
import { apiKeyLimiter } from "./middleware/rateLimiter.js";
import "./models/predictionModel.js";


const app = express();
const PORT = process.env.PORT || 4000;

/* ---------- Database ---------- */
connectDB();

/* ---------- Middleware ---------- */
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", // frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ---------- Routes ---------- */
app.get("/", (req, res) => {
  res.send("GridWatch Backend is running");
});

// app.get("/api/data", (req, res) => {
//   res.json({
//     status: "success",
//     data: {
//       message: "This is sample data from GridWatch backend",
//     },
//   });
// });

// Auth & User routes
app.use("/auth", authRouter);
app.use("/info/user", userRouter);
app.use("/api", apiKeyLimiter, apiRouter);
app.use("/frontend/data", dataRouter);


/* ---------- Server ---------- */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
