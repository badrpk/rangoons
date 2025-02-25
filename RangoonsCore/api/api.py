from fastapi import FastAPI
from api.routes.user_routes import user_router

app = FastAPI()

# Include Routes
app.include_router(user_router, prefix="/users", tags=["Users"])

@app.get("/")
def root():
    return {"message": "Welcome to Huobz API!"}
