class PropertyRegistry:
    def __init__(self):
        self.properties = []

    def register_property(self, owner, address, value):
        property_details = {
            "owner": owner,
            "address": address,
            "value": value
        }
        self.properties.append(property_details)
        return f"Property registered: {address}"

    def list_properties(self):
        return self.properties

# Example usage
registry = PropertyRegistry()
print(registry.register_property("John Doe", "123 Main St", 500000))
print(registry.list_properties())
