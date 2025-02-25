def calculate_bmi(weight, height):
    """Calculate BMI given weight (kg) and height (m)."""
    bmi = weight / (height ** 2)
    return round(bmi, 2)

# Example usage
print(calculate_bmi(70, 1.75))
