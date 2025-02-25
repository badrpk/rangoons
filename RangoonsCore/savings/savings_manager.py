class SavingsManager:
    def __init__(self):
        self.accounts = {}

    def create_account(self, user_id, initial_balance=0):
        if user_id in self.accounts:
            return f"Account for user {user_id} already exists."
        self.accounts[user_id] = initial_balance
        return f"Account created for user {user_id} with balance {initial_balance}."

    def deposit(self, user_id, amount):
        if user_id not in self.accounts:
            return f"No account found for user {user_id}."
        self.accounts[user_id] += amount
        return f"Deposited {amount} to user {user_id}'s account."

    def get_balance(self, user_id):
        return self.accounts.get(user_id, "No account found.")

if __name__ == "__main__":
    manager = SavingsManager()
    print(manager.create_account(1, 100))
    print(manager.deposit(1, 50))
    print(manager.get_balance(1))
