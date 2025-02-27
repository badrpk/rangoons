from fastapi import FastAPI
import requests

app = FastAPI()

# ✅ Home route
@app.get("/")
def home():
    return {"message": "Rangoons API is running!"}

# ✅ Route to check API health
@app.get("/health")
def health_check():
    return {"status": "OK", "message": "API is healthy"}

# ✅ Load balancing across RangoonsEdge nodes
@app.get("/loadbalance")
def forward_request():
    edge_nodes = ["192.168.18.60", "192.168.18.61"]  # Add more edge devices
    for node in edge_nodes:
        try:
            response = requests.get(f"http://{node}:8000")
            return response.json()  # Return first successful response
        except:
            continue
    return {"error": "No active nodes available"}

# ✅ Sample API endpoint for RangoonsRides module
@app.get("/rides")
def rides():
    return {"message": "RangoonsRides is active"}

# ✅ Sample API endpoint for RangoonsMaps module
@app.get("/maps")
def maps():
    return {"message": "RangoonsMaps is working"}

# ✅ Sample API endpoint for RangoonsEdge module
@app.get("/edge")
def edge():
    return {"message": "RangoonsEdge is computing"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
