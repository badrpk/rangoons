from fastapi import FastAPI
from id.identity import HuobzID

app = FastAPI()
users = {}

@app.post("/id/create")
def create_identity(name: str, email: str):
    user = HuobzID(name, email)
    users[email] = user
    return user.get_identity()
