from flask import Flask, request, jsonify
import tensorflow as tf
import joblib
import numpy as np
from celery import Celery

# Initialize Flask App
app = Flask(__name__)

# Initialize Celery (Task Queue)
celery = Celery(
    app.name,
    broker='redis://localhost:6379/0',  # Uses Redis for task distribution
    backend='redis://localhost:6379/0'
)

# Load trained Neural Network Model & Scaler
model = tf.keras.models.load_model("fraud_nn_model.h5")
scaler = joblib.load("scaler.pkl")

@celery.task
def detect_fraud_task(amount, location_risk, time_of_day):
    """Distributed fraud detection task"""
    features = np.array([[amount, location_risk, time_of_day]])
    features_scaled = scaler.transform(features)

    prediction = model.predict(features_scaled)
    return bool(prediction[0] > 0.5)  # If output > 0.5, mark as fraud

@app.route("/predict_fraud", methods=["GET"])
def predict_fraud():
    """Submit fraud detection task to HuobzEdge"""
    amount = float(request.args.get("amount"))
    location_risk = int(request.args.get("location_risk"))
    time_of_day = int(request.args.get("time_of_day"))

    task = detect_fraud_task.apply_async(args=[amount, location_risk, time_of_day])
    
    return jsonify({"task_id": task.id, "status": "Processing"})

@app.route("/task_status/<task_id>", methods=["GET"])
def task_status(task_id):
    """Check task results"""
    task_result = detect_fraud_task.AsyncResult(task_id)
    
    if task_result.state == 'PENDING':
        return jsonify({"task_id": task_id, "status": "Pending"})
    elif task_result.state == 'SUCCESS':
        return jsonify({"task_id": task_id, "fraud_detected": task_result.result})
    else:
        return jsonify({"task_id": task_id, "status": task_result.state})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8100)
