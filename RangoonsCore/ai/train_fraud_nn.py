import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

# Load dataset
df = pd.read_csv("fraud_dataset.csv")

# Split into features (X) and target (y)
X = df.drop(columns=["is_fraud"])
y = df["is_fraud"]

# Standardize data for better neural network performance
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split data into training & testing sets
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Build Neural Network Model
model = keras.Sequential([
    keras.layers.Dense(16, activation='relu', input_shape=(X_train.shape[1],)),
    keras.layers.Dense(8, activation='relu'),
    keras.layers.Dense(1, activation='sigmoid')  # Output layer for binary classification
])

# Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Train the model
model.fit(X_train, y_train, epochs=20, batch_size=32, validation_data=(X_test, y_test))

# Save the model & scaler
model.save("fraud_nn_model.h5")
joblib.dump(scaler, "scaler.pkl")

print("✅ Neural Network Model Trained & Saved")
