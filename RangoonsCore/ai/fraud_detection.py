def detect_fraud(transaction_data):
    """AI-powered fraud detection logic."""
    if transaction_data["amount"] > 10000:
        return True
    return False

# Example usage
print(detect_fraud({"amount": 20000}))
