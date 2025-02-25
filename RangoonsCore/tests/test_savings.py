from savings.savings_manager import SavingsManager

def test_create_account():
    manager = SavingsManager()
    result = manager.create_account(1, 100)
    assert result == "Account created for user 1 with balance 100."

def test_deposit():
    manager = SavingsManager()
    manager.create_account(1, 100)
    result = manager.deposit(1, 50)
    assert result == "Deposited 50 to user 1's account."

def test_get_balance():
    manager = SavingsManager()
    manager.create_account(1, 100)
    balance = manager.get_balance(1)
    assert balance == 100
