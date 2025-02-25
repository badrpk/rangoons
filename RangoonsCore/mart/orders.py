class Orders:
    def __init__(self):
        self.orders = []

    def place_order(self, customer_name, item, quantity):
        """Place a new order."""
        self.orders.append({"customer": customer_name, "item": item, "quantity": quantity})
        return f"Order for {item} placed successfully by {customer_name}!"

    def list_orders(self):
        """List all orders."""
        return self.orders

# Example usage
orders = Orders()
orders.place_order("John Doe", "Laptop", 1)
print(orders.list_orders())
