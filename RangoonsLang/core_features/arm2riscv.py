# Define ARM to RISC-V translation map
arm_to_riscv = {
    "ADD": "ADD",
    "MOV": "ADDI",
    "SUB": "SUB",
    # More mappings can be added here as needed
}

def translate_arm_to_riscv(arm_instr):
    """Translate ARM assembly to RISC-V assembly."""
    opcode = arm_instr.split()[0]  # Get the opcode from ARM instruction
    operands = arm_instr.split()[1:]  # Get operands

    # Translate ARM instruction to RISC-V
    if opcode in arm_to_riscv:
        riscv_instr = arm_to_riscv[opcode] + " " + ", ".join(operands)
        return riscv_instr
    else:
        print(f"⚠️ Error: No RISC-V equivalent for ARM instruction {arm_instr}")
        return None

# Sample ARM instructions
arm_instructions = [
    "ADD R0, R1, R2",
    "MOV R3, R4",
    "SUB R5, R6, R7",
    # Add more ARM instructions for testing
]

# Convert each ARM instruction to RISC-V
for instr in arm_instructions:
    riscv_instruction = translate_arm_to_riscv(instr)
    if riscv_instruction:
        print(f"ARM: {instr} → RISC-V: {riscv_instruction}")
