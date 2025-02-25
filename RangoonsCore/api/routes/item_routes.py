from fastapi import APIRouter

item_router = APIRouter()

@item_router.get("/")
def get_items():
    return [{"id": 101, "name": "Item A"}, {"id": 102, "name": "Item B"}]

@item_router.post("/")
def create_item(name: str):
    return {"id": 103, "name": name}
