# assembler.py

instruction_set = {
    "LOAD": "0001",
    "STORE": "0010",
    "ADD": "0011",
    "JUMP": "0100",
    "MUL": "0101",
    "DIV": "0110",
    "AND": "0111",
    "OR": "1000",
    "XOR": "1001",
    "JMPZ": "1010",
    "FADD": "1011",  # Floating-point Add
    "FSUB": "1100",  # Floating-point Subtract
    "SHL": "1101",   # Logical Shift Left
    "SHR": "1110"    # Logical Shift Right
}

def assemble_instruction(instruction):
    parts = instruction.split()
    opcode = instruction_set[parts[0]]
    operands = "".join(format(int(part.strip('R'), 16), '04b') for part in parts[1:])
    return opcode + operands

def assemble_program(program):
    return [assemble_instruction(instr) for instr in program.splitlines() if instr]

# Example usage
program = """
LOAD R1, 10
STORE R1, 0x1000
ADD R1, R2, R3
JUMP 0x2000
MUL R1, R2, R3
FADD R1, R2, R3
"""
machine_code = assemble_program(program)
print(machine_code)
