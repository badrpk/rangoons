from fastapi import FastAPI
from savings.savings import SavingsAccount

app = FastAPI()
savings = SavingsAccount("John Doe")

@app.post("/savings/deposit")
def deposit(amount: int):
    return {"message": savings.deposit(amount)}

@app.post("/savings/withdraw")
def withdraw(amount: int):
    return {"message": savings.withdraw(amount)}

@app.get("/savings/balance")
def get_balance():
    return {"balance": savings.balance}
