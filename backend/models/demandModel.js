import mongoose from "mongoose";

const demandSchema = new mongoose.Schema({
  region: { type: String, required: true },
  timestamp: { type: Date, required: true },
  temperature: Number,
  humidity: Number,
  windSpeed: Number,
  demand: { type: Number, default: 0 },
  predictedDemand: { type: Number, default: 0 }
}, { timestamps: true });

demandSchema.index(
  { region: 1, timestamp: 1 },
  { unique: true }
);


const Demand = mongoose.models.demand || mongoose.model('demand', demandSchema);
export default Demand;

// code to update the weather fields :

// const ops = weatherRecords.map(w => ({
//   updateOne: {
//     filter: {
//       region: w.region,
//       timestamp: w.timestamp
//     },
//     update: {
//       $set: {
//         temperature: w.temperature,
//         humidity: w.humidity,
//         windSpeed: w.windSpeed
//       }
//     }
//   }
// }));

// await Demand.bulkWrite(ops);
