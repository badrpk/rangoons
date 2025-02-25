class Inventory:
    def __init__(self):
        self.items = {}

    def add_item(self, item_name, quantity, price):
        self.items[item_name] = {"quantity": quantity, "price": price}
        return f"Added {quantity} of {item_name} at {price} each."

    def update_item(self, item_name, quantity):
        if item_name in self.items:
            self.items[item_name]["quantity"] += quantity
            return f"Updated {item_name} quantity to {self.items[item_name]['quantity']}."
        return f"{item_name} not found in inventory."

    def get_inventory(self):
        return self.items

if __name__ == "__main__":
    inventory = Inventory()
    print(inventory.add_item("Laptop", 10, 1000))
    print(inventory.update_item("Laptop", 5))
    print(inventory.get_inventory())
