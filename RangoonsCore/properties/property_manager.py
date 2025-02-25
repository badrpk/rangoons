class PropertyManager:
    def __init__(self):
        self.properties = []

    def add_property(self, property_name, owner_name, value):
        property_data = {
            "property_name": property_name,
            "owner_name": owner_name,
            "value": value,
        }
        self.properties.append(property_data)
        return f"Property {property_name} added successfully."

    def list_properties(self):
        return self.properties

if __name__ == "__main__":
    manager = PropertyManager()
    print(manager.add_property("Lakeview Apartment", "John Doe", 250000))
    print(manager.list_properties())
