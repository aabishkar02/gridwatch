import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema({
  region: { type: String, required: true },
  timestamp: { type: Date, required: true },
  demand: { type: Number, default: 0 },
  predictedDemand: { type: Number, default: 0 }
}, { timestamps: true });

predictionSchema.index(
  { region: 1, timestamp: 1 },
  { unique: true }
);


const Prediction = mongoose.models.prediction || mongoose.model('prediction', predictionSchema);
export default Prediction;

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
