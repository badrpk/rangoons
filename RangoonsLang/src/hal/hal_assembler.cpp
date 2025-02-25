#include <iostream>
#include <fstream>
#include <vector>
#include <unordered_map>
#include <sstream>

using namespace std;

// HAL Opcodes
unordered_map<string, uint8_t> opcodes = {
    {"MOV", 0x10}, {"ADD", 0x11}, {"SUB", 0x12}, {"MUL", 0x13}, {"DIV", 0x14},
    {"LOAD", 0x20}, {"STORE", 0x21}, {"JMP", 0x30}, {"JZ", 0x31}, {"JNZ", 0x32},
    {"HLT", 0xFF}
};

// Convert HAL to HML (Binary)
vector<uint8_t> assemble(vector<string> instructions) {
    vector<uint8_t> binary;
    for (const auto &line : instructions) {
        stringstream ss(line);
        string opcode, arg1, arg2;
        ss >> opcode >> arg1 >> arg2;

        if (opcodes.find(opcode) != opcodes.end()) {
            binary.push_back(opcodes[opcode]);

            // Check if arg1 is a valid number before using stoi
            if (!arg1.empty()) {
                try {
                    binary.push_back(stoi(arg1));
                } catch (invalid_argument &e) {
                    cerr << "[ERROR] Invalid argument for instruction: " << line << endl;
                    exit(1);
                }
            }

            // Check if arg2 is a valid number before using stoi
            if (!arg2.empty()) {
                try {
                    binary.push_back(stoi(arg2));
                } catch (invalid_argument &e) {
                    cerr << "[ERROR] Invalid argument for instruction: " << line << endl;
                    exit(1);
                }
            }
        } else {
            cerr << "[ERROR] Unknown instruction: " << line << endl;
            exit(1);
        }
    }
    return binary;
}

// Compile HAL to HML
int main(int argc, char *argv[]) {
    if (argc != 2) {
        cerr << "Usage: " << argv[0] << " <hal_source.txt>" << endl;
        return 1;
    }

    ifstream inputFile(argv[1]);
    if (!inputFile) {
        cerr << "[ERROR] Could not open file: " << argv[1] << endl;
        return 1;
    }

    vector<string> instructions;
    string line;
    while (getline(inputFile, line)) {
        instructions.push_back(line);
    }
    inputFile.close();

    vector<uint8_t> binary = assemble(instructions);
    ofstream outputFile("output.bin", ios::binary);
    outputFile.write(reinterpret_cast<char *>(binary.data()), binary.size());
    outputFile.close();

    cout << "[SUCCESS] Assembly completed. Output saved as output.bin" << endl;
    return 0;
}
