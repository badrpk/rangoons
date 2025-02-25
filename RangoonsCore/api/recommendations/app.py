from fastapi import FastAPI
app = FastAPI()

@app.get("/api/recommendations/{user_id}")
def get_recommendations(user_id: str):
    return {"user_id": user_id, "recommendations": ["Resource1", "Resource2"]}
