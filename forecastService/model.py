

from pymongo import MongoClient
import pandas as pd
import numpy as np

from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, r2_score


MONGO_URI = "mongodb+srv://aabishkar02:aabishkar02@cluster0.bnqwt.mongodb.net/mern-auth"
DB_NAME = "mern-auth"
COLLECTION = "demands"

TARGET = "demand"
TIME_COL = "timestamp"


REGION = "ERCO"  #for now, we are only considering one region

def load_data():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    col = db[COLLECTION]

    cursor = col.find(
        {"region": REGION},   
        {
            "_id": 0,
            TIME_COL: 1,
            TARGET: 1
        }
    ).sort(TIME_COL, 1)

    df = pd.DataFrame(list(cursor))
    df[TIME_COL] = pd.to_datetime(df[TIME_COL])
    return df


def add_time_features(df):
    df = df.copy()

    df["hour"] = df[TIME_COL].dt.hour
    df["dayofweek"] = df[TIME_COL].dt.dayofweek
    df["month"] = df[TIME_COL].dt.month

    df["hour_sin"]  = np.sin(2*np.pi*df["hour"]/24)
    df["hour_cos"]  = np.cos(2*np.pi*df["hour"]/24)
    df["month_sin"] = np.sin(2*np.pi*df["month"]/12)
    df["month_cos"] = np.cos(2*np.pi*df["month"]/12)

    df.drop(columns=["hour", "month"], inplace=True)
    return df


def add_lag_features(df):
    df = df.copy()

    df["lag_24"]  = df[TARGET].shift(24)
    df["lag_168"] = df[TARGET].shift(168)

    for w in [6, 12, 24]:
        df[f"roll_mean_{w}"] = df[TARGET].rolling(w).mean().shift(1)
        df[f"roll_std_{w}"]  = df[TARGET].rolling(w).std().shift(1)

    return df


def prepare_dataset():
    df = load_data()
    df = add_time_features(df)
    df = add_lag_features(df)

    df = df.dropna().reset_index(drop=True)

    feature_cols = [c for c in df.columns if c not in [TARGET, TIME_COL]]
    X = df[feature_cols]
    y = df[TARGET]
    t = df[TIME_COL]

    return X, y, t


def train_model():
    X, y, t = prepare_dataset()

    split = int(len(X) * 0.85)
    X_train, X_val = X.iloc[:split], X.iloc[split:]
    y_train, y_val = y.iloc[:split], y.iloc[split:]
    t_val = t.iloc[split:]

    model = XGBRegressor(
        n_estimators=500,
        max_depth=6,
        learning_rate=0.03,
        subsample=0.8,
        colsample_bytree=1.0,
        random_state=42,
        eval_metric="mae"
    )

    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=False
    )

    preds = model.predict(X_val)

    metrics = {
        "MAE": mean_absolute_error(y_val, preds),
        "R2":  r2_score(y_val, preds)
    }

    results = pd.DataFrame({
        "timestamp": t_val,
        "predictedDemand": preds
    })

    return model, metrics, results



def predict_latest(model, steps=24):
    X, _, t = prepare_dataset()

    X_future = X.tail(steps)
    t_future = t.tail(steps)

    preds = model.predict(X_future)

    return pd.DataFrame({
        "timestamp": t_future,
        "predictedDemand": preds
    })





'''
for saving the prediction
'''

def write_predictions_to_mongo(df_preds):
    """
    df_preds columns:
    - timestamp
    - predictedDemand
    """

    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    col = db["predictions"]

    for _, row in df_preds.iterrows():
        col.update_one(
            {
                "region": REGION,
                "timestamp": row["timestamp"]
            },
            {
                "$set": {
                    "region": REGION,
                    "timestamp": row["timestamp"],
                    "predictedDemand": float(row["predictedDemand"])
                }
            },
            upsert=True
        )

    print(f"Wrote {len(df_preds)} predictions for region={REGION}")
