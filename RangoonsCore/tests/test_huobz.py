import requests

def test_api_status():
    response = requests.get("http://127.0.0.1:8000/status")
    assert response.status_code == 200
    assert response.json()["status"] == "API is running successfully"
