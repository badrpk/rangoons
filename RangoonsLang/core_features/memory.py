class Memory:
    def __init__(self):
        self.instructions = []
        self.data = {}

    def store(self, address, value):
        self.data[address] = value

    def load(self, address):
        return self.data.get(address, 0)
