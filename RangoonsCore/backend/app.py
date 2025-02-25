from flask import Flask, request, jsonify
import sqlite3
import boto3
import cv2
import random

app = Flask(__name__)

# AWS S3 Configuration
S3_BUCKET = "your-s3-bucket"
S3_REGION = "your-region"
AWS_ACCESS_KEY = "your-access-key"
AWS_SECRET_KEY = "your-secret-key"

s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY, region_name=S3_REGION)

# Database setup
DB_FILE = "huobz.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE NOT NULL,
        otp TEXT,
        id_photo_url TEXT,
        face_photo_url TEXT,
        verified BOOLEAN DEFAULT 0
    )
    """)
    conn.commit()
    conn.close()

init_db()

# API for photo uploads
@app.route("/upload-id-photo", methods=["POST"])
def upload_id_photo():
    file = request.files['file']
    phone = request.form['phone']
    filename = f"{phone}_id_photo.jpg"
    s3.upload_fileobj(file, S3_BUCKET, filename)
    url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{filename}"

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET id_photo_url=? WHERE phone=?", (url, phone))
    conn.commit()
    conn.close()
    return jsonify({"message": "ID photo uploaded successfully", "url": url})

@app.route("/upload-face-photo", methods=["POST"])
def upload_face_photo():
    file = request.files['file']
    phone = request.form['phone']
    filename = f"{phone}_face_photo.jpg"
    s3.upload_fileobj(file, S3_BUCKET, filename)
    url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{filename}"

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET face_photo_url=? WHERE phone=?", (url, phone))
    conn.commit()
    conn.close()
    return jsonify({"message": "Face photo uploaded successfully", "url": url})

if __name__ == "__main__":
    app.run(debug=True)
