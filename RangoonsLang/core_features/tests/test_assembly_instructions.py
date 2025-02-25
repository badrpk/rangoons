import unittest

# Enhanced dummy functions to test (replace these with actual functions from your project)
def load_register(register, value):
    return f"Loaded {value} into {register}"

def store_register(register, address):
    return f"Stored {register} value into {address}"

def add_registers(register1, register2):
    return f"Added {register1} and {register2}"

def jump_to_address(address):
    return f"Jumped to {address}"

class TestAssemblyInstructions(unittest.TestCase):

    def test_load_register(self):
        result = load_register("R1", 10)
        self.assertEqual(result, "Loaded 10 into R1")

    def test_store_register(self):
        result = store_register("R1", "0x1000")
        self.assertEqual(result, "Stored R1 value into 0x1000")

    def test_add_registers(self):
        result = add_registers("R1", "R2")
        self.assertEqual(result, "Added R1 and R2")

    def test_jump_to_address(self):
        result = jump_to_address("0x2000")
        self.assertEqual(result, "Jumped to 0x2000")

if __name__ == '__main__':
    unittest.main()
