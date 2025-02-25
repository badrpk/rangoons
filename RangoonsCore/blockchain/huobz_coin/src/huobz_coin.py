from web3 import Web3

class HuobzCoin:
    def __init__(self, contract_address, abi, private_key, provider_url):
        self.web3 = Web3(Web3.HTTPProvider(provider_url))
        self.contract = self.web3.eth.contract(address=contract_address, abi=abi)
        self.private_key = private_key
        self.account = self.web3.eth.account.from_key(private_key)

    def get_balance(self, address):
        balance = self.contract.functions.balanceOf(address).call()
        return self.web3.fromWei(balance, 'ether')
