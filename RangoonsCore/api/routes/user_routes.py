from fastapi import APIRouter

user_router = APIRouter()

@user_router.get("/")
def get_users():
    return {"message": "List of users"}

@user_router.post("/")
def create_user():
    return {"message": "User created"}
