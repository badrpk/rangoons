from fastapi import FastAPI
import random

app = FastAPI()

# Fraud Detection Function
def detect_fraud(amount):
    return amount > 5000  # Example rule

@app.get("/predict_fraud")
def predict_fraud(amount: float):
    fraud = detect_fraud(amount)
    return {"amount": amount, "fraud_detected": fraud}

# Recommender Function
def recommend_items():
    items = ["Item A", "Item B", "Item C", "Item D"]
    return random.sample(items, 2)

@app.get("/recommend")
def recommend():
    recommendations = recommend_items()
    return {"recommendations": recommendations}
