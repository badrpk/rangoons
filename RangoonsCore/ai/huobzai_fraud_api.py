from flask import Flask, request, jsonify
import tensorflow as tf
import joblib
import numpy as np

app = Flask(__name__)

# Load trained Neural Network Model & Scaler
model = tf.keras.models.load_model("fraud_nn_model.h5")
scaler = joblib.load("scaler.pkl")

@app.route("/predict_fraud", methods=["GET"])
def predict_fraud():
    """Predict if a transaction is fraudulent using a Neural Network."""
    amount = float(request.args.get("amount"))
    location_risk = int(request.args.get("location_risk"))
    time_of_day = int(request.args.get("time_of_day"))

    features = np.array([[amount, location_risk, time_of_day]])
    features_scaled = scaler.transform(features)

    prediction = model.predict(features_scaled)
    fraud_detected = bool(prediction[0] > 0.5)  # If output > 0.5, mark as fraud

    return jsonify({"amount": amount, "fraud_detected": fraud_detected})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8100)
