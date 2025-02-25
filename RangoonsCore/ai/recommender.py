import random

def recommend_items(user_id):
    """Provide AI-powered recommendations."""
    items = ["Item A", "Item B", "Item C"]
    return random.sample(items, 2)

# Example usage
print(recommend_items(123))
