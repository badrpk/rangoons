class Inventory:
    def __init__(self):
        self.items = []

    def add_item(self, name, price, stock):
        """Add an item to the inventory."""
        self.items.append({"name": name, "price": price, "stock": stock})
        return f"Item '{name}' added successfully!"

    def list_items(self):
        """List all available items."""
        return self.items

# Example usage
inventory = Inventory()
inventory.add_item("Laptop", 1000, 10)
print(inventory.list_items())
