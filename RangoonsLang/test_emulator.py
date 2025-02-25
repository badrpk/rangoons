import sys
import os
import unittest

# Fix import path by adding `core_features` to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../core_features')))

# Now import the emulator correctly
from emulator import HuobzEmulator  

class TestEmulator(unittest.TestCase):
    def setUp(self):
        """Initialize a fresh emulator instance before each test."""
        self.emulator = HuobzEmulator()

    def test_load_instruction(self):
        """Test if the LOAD instruction correctly loads values into registers."""
        self.emulator.memory = ["0001000100001010"]  # LOAD R1, 10
        self.emulator.run()
        self.assertEqual(self.emulator.registers[1], 10)

    def test_store_instruction(self):
        """Test if the STORE instruction correctly stores register values into memory."""
        self.emulator.memory = ["0001000100001010",  # LOAD R1, 10
                                "0010000100000001"]  # STORE R1, Mem[1]
        self.emulator.run()
        self.assertEqual(self.emulator.memory[1], 10)

    def test_add_instruction(self):
        """Test ADD instruction (R1 = R1 + R2)."""
        self.emulator.memory = ["0001000100000010",  # LOAD R1, 2
                                "0001001000000011",  # LOAD R2, 3
                                "0011000100100011"]  # ADD R3 = R1 + R2
        self.emulator.run()
        self.assertEqual(self.emulator.registers[3], 5)

    def test_sub_instruction(self):
        """Test SUB instruction (R3 = R1 - R2)."""
        self.emulator.memory = ["0001000100000011",  # LOAD R1, 3
                                "0001001000000010",  # LOAD R2, 2
                                "0100000100100011"]  # SUB R3 = R1 - R2
        self.emulator.run()
        self.assertEqual(self.emulator.registers[3], 1)

    def test_mul_instruction(self):
        """Test MUL instruction (R3 = R1 * R2)."""
        self.emulator.memory = ["0001000100000010",  # LOAD R1, 2
                                "0001001000000011",  # LOAD R2, 3
                                "0101000100100011"]  # MUL R3 = R1 * R2
        self.emulator.run()
        self.assertEqual(self.emulator.registers[3], 6)

    def test_div_instruction(self):
        """Test DIV instruction (R3 = R1 / R2)."""
        self.emulator.memory = ["0001000100000110",  # LOAD R1, 6
                                "0001001000000011",  # LOAD R2, 3
                                "0110000100100011"]  # DIV R3 = R1 / R2
        self.emulator.run()
        self.assertEqual(self.emulator.registers[3], 2)

    def test_jump_instruction(self):
        """Test unconditional jump (JMP)."""
        self.emulator.memory = ["1010000000000010"]  # JMP to address 2
        self.emulator.run()
        self.assertEqual(self.emulator.pc, 2)

    def test_jump_if_zero_instruction(self):
        """Test conditional jump if R0 == 0 (JMPZ)."""
        self.emulator.memory = ["0001000100000000",  # LOAD R1, 0
                                "1011000100000010"]  # JMPZ to address 2 if R1 == 0
        self.emulator.run()
        self.assertEqual(self.emulator.pc, 2)

    def test_jump_if_not_zero_instruction(self):
        """Test conditional jump if R0 != 0 (JMPNZ)."""
        self.emulator.memory = ["0001000100000001",  # LOAD R1, 1
                                "1100000100000010"]  # JMPNZ to address 2 if R1 != 0
        self.emulator.run()
        self.assertEqual(self.emulator.pc, 2)


# Run tests if executed directly
if __name__ == "__main__":
    unittest.main()
