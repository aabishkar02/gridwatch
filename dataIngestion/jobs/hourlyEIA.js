import cron from "node-cron";
import Demand from "../models/demandModel.js";
import { fetchEIAHourlyDemand } from "../services/eiaService.js";

// just for erco now
const REGION = "ERCO";

// Helper functhn: format date for EIA API
const toEIAFormat = (date) => date.toISOString().slice(0, 13);

const runHourlyEIA = async () => {
  try {
    let currentHour = getCurrentHourUTC();
    // Check if data already exists
    const exists = await Demand.exists({
      region: REGION,
      timestamp: currentHour // ISO format for timestamp field in MongoDB      
    });

    if (exists) {
      console.log(`Data already exists for ${currentHour.toISOString()}`);
      return;
    }

    console.log(`Fetching EIA data for ${currentHour.toISOString()}`);

    // Fetch ONLY current hour
    
    currentHour.setUTCHours(currentHour.getUTCHours() - 1);
    let currentEnd = getCurrentHourUTC();
    currentEnd = addMonths(currentEnd, 1);

    console.log(`Fetching data from ${currentHour.toISOString()} to ${currentEnd.toISOString()}`);
    const raw = await fetchEIAHourlyDemand({
      apiKey: process.env.EIA_API_KEY,
      region: REGION,
      start: toEIAFormat(currentHour),
      end: toEIAFormat(currentEnd)
    });

    const records = raw?.response?.data || [];

    if (records.length === 0) {
      console.log("No data returned yet for this hour");
      return;
    }

  
    for (const r of records) {
      const doc = {
        region: r.respondent,
        timestamp: new Date(r.period + ":00Z"),
        demandMW: r.value,
        source: "EIA"
      };

      const exists = await Demand.exists({
        region: REGION,
        timestamp: currentHour // ISO format for timestamp field in MongoDB      
      });

      if (exists) {
        console.log("Data already exists for this hour");
        return;
      } else {
          try {
            await Demand.create(doc);
            console.log("New hourly data:", doc);
          } catch (err) {
            throw err;
          }
        }
    } 
    
    return;
  
  } catch (err) {
    console.error("Hourly EIA job failed:", err.message);
  }
};

const getCurrentHourUTC = () => {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  return now;
};

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};


// schedulong job runs every hour at minute 5
cron.schedule("5 * * * *", async () => {
  console.log("Running hourly EIA job...");
  await runHourlyEIA();
});

export default runHourlyEIA;