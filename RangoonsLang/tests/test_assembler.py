# test_assembler.py

import unittest
from assembler import assemble_program

class TestAssembler(unittest.TestCase):
    def test_assemble_instruction(self):
        program = """
        LOAD R1, 10
        STORE R1, 0x1000
        ADD R1, R2, R3
        JUMP 0x2000
        """
        machine_code = assemble_program(program)
        expected_code = ["0001000100001010", "0010000100000001", "0011000100100011", "0100000000000010"]
        self.assertEqual(machine_code, expected_code)

if __name__ == '__main__':
    unittest.main()
