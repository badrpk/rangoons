class Wallet:
    def __init__(self, address):
        self.address = address
        self.balance = 0

    def add_funds(self, amount):
        self.balance += amount

    def transfer(self, amount, to_address):
        if self.balance >= amount:
            self.balance -= amount
            print(f"Transferred {amount} to {to_address}")
        else:
            print("Insufficient balance")

# Example usage
wallet = Wallet("0xABC123")
wallet.add_funds(500)
wallet.transfer(200, "0xDEF456")
