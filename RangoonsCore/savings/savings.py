class SavingsAccount:
    def __init__(self, account_holder):
        self.account_holder = account_holder
        self.balance = 0

    def deposit(self, amount):
        self.balance += amount
        return f"{amount} deposited. Total balance: {self.balance}"

    def withdraw(self, amount):
        if amount <= self.balance:
            self.balance -= amount
            return f"{amount} withdrawn. Remaining balance: {self.balance}"
        return "Insufficient balance!"

# Example usage
savings = SavingsAccount("John Doe")
print(savings.deposit(5000))
print(savings.withdraw(2000))
