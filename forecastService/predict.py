
from model import train_model, predict_latest

model, _, _ = train_model()
preds = predict_latest(model, steps=24)
print(preds)
