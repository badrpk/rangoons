from typing import Dict

# ✅ Store connected devices
devices: Dict[str, dict] = {}

# ✅ Add a user device
def add_device(user_id: str):
    if user_id in devices:
        return {"error": "Device already connected"}
    
    devices[user_id] = {"CPU": 4, "GPU": 1, "Storage": 100}  # Default resources
    return {"status": "Connected", "device": devices[user_id]}

# ✅ List all connected devices (Admins only)
def list_devices():
    return devices
