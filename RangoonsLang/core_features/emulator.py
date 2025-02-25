import sys

# Registers and Memory
registers = {f"R{i}": 0 for i in range(16)}  # 16 General-Purpose Registers
pc = 0  # Program Counter

def load(reg, value):
    """LOAD instruction: Load a value into a register."""
    registers[reg] = value
    print(f"📥 {reg} ← {value}")

def add(dest, src1, src2):
    """ADD instruction: Add values of two registers and store in a third register."""
    registers[dest] = registers[src1] + registers[src2]
    print(f"➕ {dest} = {registers[src1]} + {registers[src2]} → {registers[dest]}")

def sub(dest, src1, src2):
    """SUB instruction: Subtract values of two registers and store in a third register."""
    registers[dest] = registers[src1] - registers[src2]
    print(f"➖ {dest} = {registers[src1]} - {registers[src2]} → {registers[dest]}")

def mov(dest, value):
    """MOV instruction: Move a value into a register."""
    registers[dest] = value
    print(f"📤 {dest} ← {value}")

def print_reg(reg):
    """PRINT instruction: Output the value stored in a register."""
    print(f"💡 Output: {registers[reg]}")

def halt():
    """HALT instruction: Stop execution."""
    print("🛑 HALT encountered - Stopping execution")

def execute_program(program):
    """Execute the given machine code program."""
    global pc
    print(f"✅ Loaded program with {len(program)} instructions")

    while pc < len(program):
        instruction = program[pc]
        print(f"🔹 Executing Instruction: {instruction}")
        parts = instruction.split()

        if len(parts) == 0:
            continue

        cmd = parts[0]
        operands = parts[1:]

        if cmd == "ADD":
            # R0 = R1 + R2
            add(operands[0], operands[1], operands[2])
        elif cmd == "MOV":
            # MOV R3, R4
            mov(operands[0], int(operands[1]))
        elif cmd == "SUB":
            # R5 = R6 - R7
            sub(operands[0], operands[1], operands[2])
        elif cmd == "PRINT":
            print_reg(operands[0])
        elif cmd == "HALT":
            halt()
            break
        else:
            print(f"⚠️ ERROR: Unknown opcode {cmd}")

        pc += 1  # Move to the next instruction

    print("🏁 Execution complete.")

# Load and execute a HuobzLang machine code program
if len(sys.argv) < 2:
    print("❌ Error: No program file provided.")
    sys.exit(1)

program_path = sys.argv[1]

try:
    with open(program_path, "r") as f:
        program = f.read().splitlines()
    execute_program(program)
except FileNotFoundError:
    print(f"❌ Error: File {program_path} not found.")
