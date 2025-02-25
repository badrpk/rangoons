# test_compiler.py

import unittest
from compiler import compile_huobzlang

class TestCompiler(unittest.TestCase):
    def test_if_else(self):
        code = "if_else(condition, then_block, else_block)"
        machine_code = compile_huobzlang(code)
        expected_code = ["..."]
        self.assertEqual(machine_code, expected_code)

    def test_while_loop(self):
        code = "while_loop(condition, body)"
        machine_code = compile_huobzlang(code)
        expected_code = ["..."]
        self.assertEqual(machine_code, expected_code)

if __name__ == '__main__':
    unittest.main()
