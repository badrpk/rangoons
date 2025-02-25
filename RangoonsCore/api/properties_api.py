from fastapi import FastAPI
from properties.property_registry import PropertyRegistry

app = FastAPI()
registry = PropertyRegistry()

@app.post("/properties/register")
def register_property(owner: str, address: str, value: int):
    return {"message": registry.register_property(owner, address, value)}

@app.get("/properties/list")
def list_properties():
    return {"properties": registry.list_properties()}
