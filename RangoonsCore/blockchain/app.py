import unittest
from blockchain.wallet import Wallet

class TestWallet(unittest.TestCase):
    def test_transfer(self):
        wallet = Wallet("User1", 1000)
        wallet.transfer("User2", 500)
        self.assertEqual(wallet.balance, 500)
