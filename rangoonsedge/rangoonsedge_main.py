from fastapi import FastAPI, Depends
from auth import authenticate_user, get_current_user
import edge_computing
import rangoonscoins

app = FastAPI()

# ✅ Home Page (Login/Register)
@app.get("/")
def home():
    return {"message": "Welcome to RangoonsEdge! Login as Admin or User."}

# ✅ User Dashboard
@app.get("/dashboard")
def user_dashboard(user: dict = Depends(get_current_user)):
    return {"user": user, "status": "Connected to RangoonsEdge"}

# ✅ Admin Dashboard (Full Access)
@app.get("/admin")
def admin_dashboard(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        return {"error": "Access denied"}
    return {"admin": user, "devices": edge_computing.list_devices()}

# ✅ Connect User Device
@app.post("/connect")
def connect_device(user: dict = Depends(get_current_user)):
    return edge_computing.add_device(user["id"])

# ✅ Get Earnings
@app.get("/earnings")
def earnings(user: dict = Depends(get_current_user)):
    return rangoonscoins.get_user_balance(user["id"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
