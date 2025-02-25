class TaxFiling:
    def __init__(self, name, income):
        self.name = name
        self.income = income

    def calculate_tax(self):
        if self.income <= 50000:
            return self.income * 0.05
        elif self.income <= 100000:
            return self.income * 0.1
        else:
            return self.income * 0.2

# Example usage
tax = TaxFiling("John Doe", 75000)
print(f"Tax to be paid: {tax.calculate_tax()}")
