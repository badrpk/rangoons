# test_extended_instructions.py

import unittest
from emulator import HuobzEmulator

class TestExtendedInstructions(unittest.TestCase):
    def test_mul_instruction(self):
        program = ["0101000100100011"]  # MUL R1, R2, R3
        emulator = HuobzEmulator()
        emulator.load_program(program)
        emulator.registers[1] = 2
        emulator.registers[2] = 3
        emulator.run()
        self.assertEqual(emulator.registers[3], 6)

    def test_fadd_instruction(self):
        program = ["1011000100100011"]  # FADD R1, R2, R3
        emulator = HuobzEmulator()
        emulator.load_program(program)
        emulator.registers[1] = 2.0
        emulator.registers[2] = 3.0
        emulator.run()
        self.assertEqual(emulator.registers[3], 5.0)

    # Additional tests for other new instructions...

if __name__ == '__main__':
    unittest.main()
