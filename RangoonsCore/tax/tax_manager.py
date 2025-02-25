class TaxManager:
    def __init__(self):
        self.tax_records = {}

    def file_tax(self, user_id, income, tax_rate=0.15):
        tax_amount = income * tax_rate
        self.tax_records[user_id] = tax_amount
        return f"Filed tax for user {user_id}: {tax_amount}"

    def get_tax(self, user_id):
        return self.tax_records.get(user_id, "No tax record found.")

if __name__ == "__main__":
    manager = TaxManager()
    print(manager.file_tax(1, 100000))
    print(manager.get_tax(1))
