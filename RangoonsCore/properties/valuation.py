class PropertyValuation:
    def __init__(self, address, market_value):
        self.address = address
        self.market_value = market_value

    def update_value(self, new_value):
        self.market_value = new_value
        return f"Updated market value of {self.address}: {self.market_value}"

# Example usage
valuation = PropertyValuation("123 Main St", 500000)
print(valuation.update_value(550000))
