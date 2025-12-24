import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/mongodb.js";
import runBackfill from "./jobs/backFillEIA.js";
import startHourlyEIA from "./jobs/hourlyEIA.js";

dotenv.config();

const startDatabaseServer = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("MongoDB connected");

    console.log("Starting EIA backfill...");
    await runBackfill();
    console.log("EIA backfill completed");

    console.log("Starting hourly EIA job...");
    startHourlyEIA(); 

    console.log("Database ingestion server is running");

  } catch (err) {
    console.error("Database server failed:", err);
    process.exit(1);
  }
};

startDatabaseServer();
