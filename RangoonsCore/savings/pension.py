class PensionPlan:
    def __init__(self, name, monthly_contribution, duration_years):
        self.name = name
        self.monthly_contribution = monthly_contribution
        self.duration_years = duration_years

    def calculate_pension(self):
        total_contribution = self.monthly_contribution * self.duration_years * 12
        return total_contribution * 1.05  # 5% interest rate

# Example usage
pension = PensionPlan("Basic Plan", 1000, 20)
print(f"Expected pension: {pension.calculate_pension()}")
