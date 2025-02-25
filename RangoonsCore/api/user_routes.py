from fastapi import APIRouter

user_router = APIRouter()

@user_router.get("/")
def get_users():
    return [{"id": 1, "name": "John Doe"}, {"id": 2, "name": "Jane Doe"}]

@user_router.post("/")
def create_user(name: str):
    return {"id": 3, "name": name}
