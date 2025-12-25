from model import train_model, predict_latest, write_predictions_to_mongo
from pymongo import MongoClient
from datetime import datetime, timedelta, timezone
import os
import time


INTERVAL_SECONDS = 3600 * 24          # 1 day
POLL_SECONDS = 60              # check every minute
REGION = "ERCO"

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "mern-auth")
COLLECTION_NAME = "demands"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
demand_collection = db[COLLECTION_NAME]


def last_completed_hour_utc():
    now = datetime.now(timezone.utc)
    return now.replace(minute=0, second=0, microsecond=0) - timedelta(hours=1)

def data_exists_for_hour(collection, region, hour_ts):
    return collection.count_documents({
        "region": region,
        "timestamp": hour_ts
    }) > 0

def wait_for_latest_hour_data(collection, region):
    while True:
        target_hour = last_completed_hour_utc()

        if data_exists_for_hour(collection, region, target_hour):
            print(f"Data available for {target_hour}", flush=True)
            return target_hour

        print(f"Waiting for data at {target_hour}", flush=True)
        time.sleep(POLL_SECONDS)

if __name__ == "__main__":
    print("Forecast service started", flush=True)

    while True:
        try:
            wait_for_latest_hour_data(demand_collection, REGION)

            model, metrics, _ = train_model()

            print("Model trained. Metrics:", metrics, flush=True)
            

            preds = predict_latest(model, steps=24)
            print(preds, flush=True)
            write_predictions_to_mongo(preds)

            print("Forecast written to MongoDB", flush=True)

        except Exception as e:
            print("Forecast error:", e, flush=True)

        time.sleep(INTERVAL_SECONDS)
