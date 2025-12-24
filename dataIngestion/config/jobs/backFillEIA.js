import { fetchEIAHourlyDemand } from "../services/eiaService.js";
import  Demand  from "../models/demandModel.js";
const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const toEIAFormat = (date) => {
  return date.toISOString().slice(0, 13);
};

const REGION = "ERCO";
const START_DATE = new Date("2025-06-01T00:00:00Z");

const runBackfill = async () => {
  let currentStart = START_DATE;
  const now = new Date();

  while (currentStart < now) {
    let currentEnd = addMonths(currentStart, 3);

    if (currentEnd > now) {
      currentEnd = addMonths(now, 1);
    }

    console.log(
      `Fetching data from ${toEIAFormat(currentStart)} → ${toEIAFormat(currentEnd)}`
    );

    const raw = await fetchEIAHourlyDemand({
      apiKey: process.env.EIA_API_KEY,
      region: REGION,
      start: toEIAFormat(currentStart),
      end: toEIAFormat(currentEnd)
    });

    const records = raw?.response?.data || [];
    console.log(`Received ${records.length} records`);

   

    const ops = records.map(r => ({
      updateOne: {
        filter: {
          region: r.respondent,
          timestamp: new Date(r.period + ":00Z")
        },
        update: {
          $set: {
            region: r.respondent,
            timestamp: new Date(r.period + ":00Z"),
            demand: Number(r.value),
            source: "EIA"
          }
        },
        upsert: true
      }
    }));
    console.log(`Bulk upsert completed: ${ops.length} records`);
    await Demand.bulkWrite(ops);


    
    currentStart = new Date(currentEnd);
    currentStart.setHours(currentStart.getHours() + 1);

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log("Backfill completed up to today");
  console.log(now);
};

export default runBackfill;
