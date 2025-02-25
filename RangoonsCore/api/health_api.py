from fastapi import FastAPI
from health.health_records import HealthRecords

app = FastAPI()
health = HealthRecords()

@app.post("/health/add_record")
def add_record(patient_name: str, record: dict):
    return {"message": health.add_record(patient_name, record)}

@app.get("/health/get_records")
def get_records(patient_name: str):
    return {"records": health.get_records(patient_name)}
