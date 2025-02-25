# test_emulator.py

import unittest
from emulator import HuobzEmulator

class TestEmulator(unittest.TestCase):
    def test_emulator_execution(self):
        program = [
            "0001000100001010",  # LOAD R1, 10
            "0010000100000001",  # STORE R1, 0x0001
            "0011000100100011",  # ADD R1, R2, R3
            "0100000000000010"   # JUMP 0x0002
        ]
        emulator = HuobzEmulator()
        emulator.load_program(program)
        emulator.run()
        self.assertEqual(emulator.registers[1], 10)
        self.assertEqual(emulator.memory[1], 10)
        self.assertEqual(emulator.registers[3], 10)

if __name__ == '__main__':
    unittest.main()
