from model import train_model, predict_latest, write_predictions_to_mongo

if __name__ == "__main__":
    model, metrics, _ = train_model()

    print("\nValidation Metrics")
    for k, v in metrics.items():
        print(f"{k}: {v:.2f}")

    # Predict next 24 hours
    future_preds = predict_latest(model, steps=24)

    print("\nNext 24-hour forecast:")
    print(future_preds)

    write_predictions_to_mongo(future_preds)
