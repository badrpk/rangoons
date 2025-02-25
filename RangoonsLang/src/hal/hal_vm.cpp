#include <iostream>
#include <fstream>
#include <vector>
#include <unordered_map>
#include <cstdint>

using namespace std;

#define MEMORY_SIZE 4096  // Define memory size
uint8_t memory[MEMORY_SIZE] = {0};  // Memory array
uint8_t registers[8] = {0};  // 8 general-purpose registers

// HAL Opcodes
enum Opcodes {
    MOV = 0x10, ADD = 0x11, SUB = 0x12, MUL = 0x13, DIV = 0x14,
    LOAD = 0x20, STORE = 0x21, JMP = 0x30, JZ = 0x31, JNZ = 0x32,
    HLT = 0xFF
};

// Print register values
void print_registers() {
    cout << "\n--- Register State ---" << endl;
    for (int i = 0; i < 8; i++) {
        cout << "R" << i << " = " << int(registers[i]) << endl;
    }
}

// Print memory contents (first 20 addresses)
void print_memory() {
    cout << "\n--- Memory State (First 20 Bytes) ---" << endl;
    for (int i = 0; i < 20; i++) {
        cout << "Mem[" << i << "] = " << int(memory[i]) << endl;
    }
}

// Execute HAL machine code
void execute(vector<uint8_t> &program) {
    size_t pc = 0;  // Program Counter

    while (pc < program.size()) {
        uint8_t opcode = program[pc++];

        switch (opcode) {
            case MOV:
                if (pc + 2 < program.size()) {
                    uint8_t reg = program[pc++];
                    uint8_t value = program[pc++];
                    registers[reg] = value;
                    cout << "[DEBUG] MOV R" << int(reg) << ", " << int(value) << endl;
                }
                break;
            
            case ADD:
                if (pc + 2 < program.size()) {
                    uint8_t reg1 = program[pc++];
                    uint8_t reg2 = program[pc++];
                    registers[reg1] += registers[reg2];
                    cout << "[DEBUG] ADD R" << int(reg1) << ", R" << int(reg2) << endl;
                }
                break;

            case SUB:
                if (pc + 2 < program.size()) {
                    uint8_t reg1 = program[pc++];
                    uint8_t reg2 = program[pc++];
                    registers[reg1] -= registers[reg2];
                    cout << "[DEBUG] SUB R" << int(reg1) << ", R" << int(reg2) << endl;
                }
                break;

            case MUL:
                if (pc + 2 < program.size()) {
                    uint8_t reg1 = program[pc++];
                    uint8_t reg2 = program[pc++];
                    registers[reg1] *= registers[reg2];
                    cout << "[DEBUG] MUL R" << int(reg1) << ", R" << int(reg2) << endl;
                }
                break;

            case DIV:
                if (pc + 2 < program.size()) {
                    uint8_t reg1 = program[pc++];
                    uint8_t reg2 = program[pc++];
                    if (registers[reg2] != 0) {
                        registers[reg1] /= registers[reg2];
                        cout << "[DEBUG] DIV R" << int(reg1) << ", R" << int(reg2) << endl;
                    } else {
                        cerr << "[ERROR] Division by zero!" << endl;
                    }
                }
                break;

            case LOAD:
                if (pc + 2 < program.size()) {
                    uint8_t reg = program[pc++];
                    uint16_t addr = program[pc++];
                    registers[reg] = memory[addr];
                    cout << "[DEBUG] LOAD R" << int(reg) << ", Mem[" << int(addr) << "]" << endl;
                }
                break;

            case STORE:
                if (pc + 2 < program.size()) {
                    uint8_t reg = program[pc++];
                    uint16_t addr = program[pc++];
                    memory[addr] = registers[reg];
                    cout << "[DEBUG] STORE R" << int(reg) << " -> Mem[" << int(addr) << "]" << endl;
                }
                break;

            case JMP:
                if (pc < program.size()) {
                    uint16_t addr = program[pc++];
                    pc = addr;
                    cout << "[DEBUG] JMP " << int(addr) << endl;
                }
                break;

            case JZ:
                if (pc + 2 < program.size()) {
                    uint8_t reg = program[pc++];
                    uint16_t addr = program[pc++];
                    if (registers[reg] == 0) {
                        pc = addr;
                        cout << "[DEBUG] JZ R" << int(reg) << " -> " << int(addr) << endl;
                    }
                }
                break;

            case JNZ:
                if (pc + 2 < program.size()) {
                    uint8_t reg = program[pc++];
                    uint16_t addr = program[pc++];
                    if (registers[reg] != 0) {
                        pc = addr;
                        cout << "[DEBUG] JNZ R" << int(reg) << " -> " << int(addr) << endl;
                    }
                }
                break;

            case HLT:
                cout << "Execution halted." << endl;
                print_registers();
                print_memory();
                return;

            default:
                cout << "Unknown instruction: " << int(opcode) << endl;
                return;
        }
    }
}

// Load binary program from file
vector<uint8_t> load_program(const string &filename) {
    ifstream file(filename, ios::binary);
    if (!file) {
        cerr << "Error loading file: " << filename << endl;
        return {};
    }

    return vector<uint8_t>((istreambuf_iterator<char>(file)), istreambuf_iterator<char>());
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        cerr << "Usage: " << argv[0] << " <program.bin>" << endl;
        return 1;
    }

    vector<uint8_t> program = load_program(argv[1]);
    if (!program.empty()) {
        execute(program);
    }

    return 0;
}
