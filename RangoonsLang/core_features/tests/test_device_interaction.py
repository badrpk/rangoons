import unittest

# Enhanced dummy functions to test (replace these with actual functions from your project)
def interact_with_cpu(cpu):
    return f"Interacting with {cpu}"

def interact_with_gpu(gpu):
    return f"Interacting with {gpu}"

def interact_with_ram(ram):
    return f"Interacting with {ram}"

def interact_with_rom(rom):
    return f"Interacting with {rom}"

def interact_with_storage(storage):
    return f"Interacting with {storage}"

class TestDeviceInteraction(unittest.TestCase):

    def test_interact_with_cpu(self):
        result = interact_with_cpu("Intel CPU")
        self.assertEqual(result, "Interacting with Intel CPU")

    def test_interact_with_gpu(self):
        result = interact_with_gpu("NVIDIA GPU")
        self.assertEqual(result, "Interacting with NVIDIA GPU")

    def test_interact_with_ram(self):
        result = interact_with_ram("8GB RAM")
        self.assertEqual(result, "Interacting with 8GB RAM")

    def test_interact_with_rom(self):
        result = interact_with_rom("32GB ROM")
        self.assertEqual(result, "Interacting with 32GB ROM")

    def test_interact_with_storage(self):
        result = interact_with_storage("SSD Storage")
        self.assertEqual(result, "Interacting with SSD Storage")

if __name__ == '__main__':
    unittest.main()
