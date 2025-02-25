import time

class HuobzCoin:
    def __init__(self):
        self.chain = []
        self.create_block(proof=1, previous_hash="0")

    def create_block(self, proof, previous_hash):
        block = {
            "index": len(self.chain) + 1,
            "timestamp": time.time(),
            "proof": proof,
            "previous_hash": previous_hash,
        }
        self.chain.append(block)
        return block

    def get_previous_block(self):
        return self.chain[-1]

    def proof_of_work(self, previous_proof):
        new_proof = 1
        while True:
            if (new_proof ** 2 - previous_proof ** 2) % 97 == 0:
                return new_proof
            new_proof += 1
