import unittest
from compiler import compile_huobzlang

class TestHighLevelConstructs(unittest.TestCase):
    def test_if_else(self):
        code = "if_else(condition, then_block, else_block)"
        machine_code = compile_huobzlang(code)
        expected_code = ["JUMP_IF_NOT condition then_block", "else_block"]
        self.assertEqual(machine_code, expected_code)

    def test_while_loop(self):
        code = "while_loop(condition, body)"
        machine_code = compile_huobzlang(code)
        expected_code = ["while_loop"]
        self.assertEqual(machine_code, expected_code)

    def test_for_loop(self):
        code = "for_loop(init, condition, increment, body)"
        machine_code = compile_huobzlang(code)
        expected_code = ["for_loop"]
        self.assertEqual(machine_code, expected_code)

    def test_try_catch(self):
        code = "try_catch(try_block, catch_block)"
        machine_code = compile_huobzlang(code)
        expected_code = ["try_block", "CATCH", "catch_block"]
        self.assertEqual(machine_code, expected_code)

    def test_switch_case(self):
        code = "switch_case(value, cases)"
        machine_code = compile_huobzlang(code)
        expected_code = ["switch_case"]
        self.assertEqual(machine_code, expected_code)

if __name__ == '__main__':
    unittest.main()
