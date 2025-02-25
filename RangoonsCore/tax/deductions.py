class TaxDeductions:
    def __init__(self):
        self.deductions = []

    def add_deduction(self, name, amount):
        self.deductions.append({"name": name, "amount": amount})

    def total_deductions(self):
        return sum([deduction["amount"] for deduction in self.deductions])

# Example usage
deductions = TaxDeductions()
deductions.add_deduction("Charity", 5000)
deductions.add_deduction("Medical", 3000)
print(f"Total deductions: {deductions.total_deductions()}")
