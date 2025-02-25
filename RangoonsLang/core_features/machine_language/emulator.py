# emulator.py

class HuobzEmulator:
    def __init__(self):
        self.registers = [0] * 16
        self.memory = [0] * 65536
        self.pc = 0  # Program counter

    def load_program(self, program):
        self.memory[:len(program)] = program

    def execute_instruction(self, instruction):
        opcode = instruction[:4]
        operands = instruction[4:]

        if opcode == "0001":  # LOAD
            reg = int(operands[:4], 2)
            value = int(operands[4:], 2)
            self.registers[reg] = value
        elif opcode == "0010":  # STORE
            reg = int(operands[:4], 2)
            address = int(operands[4:], 2)
            self.memory[address] = self.registers[reg]
        elif opcode == "0011":  # ADD
            reg1 = int(operands[:4], 2)
            reg2 = int(operands[4:8], 2)
            reg3 = int(operands[8:], 2)
            self.registers[reg3] = self.registers[reg1] + self.registers[reg2]
        elif opcode == "0100":  # JUMP
            address = int(operands, 2)
            self.pc = address
        elif opcode == "0101":  # MUL
            reg1 = int(operands[:4], 2)
            reg2 = int(operands[4:8], 2)
            reg3 = int(operands[8:], 2)
            self.registers[reg3] = self.registers[reg1] * self.registers[reg2]
        elif opcode == "0110":  # DIV
            reg1 = int(operands[:4], 2)
            reg2 = int(operands[4:8], 2)
            reg3 = int(operands[8:], 2)
            self.registers[reg3] = self.registers[reg1] // self.registers[reg2]
        elif opcode == "0111":  # AND
            reg1 = int(operands[:4], 2)
            reg2 = int(operands[4:8], 2)
            reg3 = int(operands[8:], 2)
            self.registers[reg3] = self.registers[reg1] & self.registers[reg2]
        elif opcode == "1000":  # OR
            reg1 = int(operands[:4], 2)
            reg2 = int(operands[4:8], 2)
            reg3 = int(operands[8:], 2)
            self.registers[reg3] = self.registers[reg1] | self.registers[reg2]
        elif opcode == "1001":  # XOR
            reg1 = int(operands[:4], 2)
            reg2 = int(operands[4:8], 2)
            reg3 = int(operands[8:], 2)
            self.registers[reg3] = self.registers[reg1] ^ self.registers[reg2]
        elif opcode == "1010":  # JMPZ
            reg = int(operands[:4], 2)
            address = int(operands[4:], 2)
            if self.registers[reg] == 0:
                self.pc = address

    def run(self):
        while self.pc < len(self.memory):
            instruction = self.memory[self.pc]
            self.execute_instruction(instruction)
            self.pc += 1

# Example usage
program = [
    "0001000100001010",  # LOAD R1, 10
    "0010000100000001",  # STORE R1, 0x0001
    "0011000100100011",  # ADD R1, R2, R3
    "0100000000000010",  # JUMP 0x0002
    "0101000100100011",  # MUL R1, R2, R3
    "0110000100100011",  # DIV R1, R2, R3
    "0111000100100011",  # AND R1, R2, R3
    "1000000100100011",  # OR R1, R2, R3
    "1001000100100011",  # XOR R1, R2, R3
    "1010000100000010"   # JMPZ R1, 0x0002
]

emulator = HuobzEmulator()
emulator.load_program(program)
emulator.run()
print(emulator.registers)
