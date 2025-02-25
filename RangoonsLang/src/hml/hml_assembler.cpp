#include <iostream>
#include <fstream>
#include <vector>
#include <unordered_map>

using namespace std;

unordered_map<string, uint8_t> opcodes = {
    {"LOAD", 0x01}, {"STORE", 0x02}, {"ADD", 0x03},
    {"SUB", 0x04}, {"MUL", 0x05}, {"DIV", 0x06},
    {"JMP", 0x07}, {"JZ", 0x08}, {"JNZ", 0x09},
    {"HLT", 0xFF}
};

vector<uint8_t> assemble(vector<string> instructions) {
    vector<uint8_t> binary;
    for (const auto &line : instructions) {
        auto it = opcodes.find(line);
        if (it != opcodes.end()) {
            binary.push_back(it->second);
        } else {
            cerr << "Unknown instruction: " << line << endl;
        }
    }
    return binary;
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        cerr << "Usage: " << argv[0] << " <hml_source.txt>" << endl;
        return 1;
    }

    ifstream inputFile(argv[1]);
    if (!inputFile) {
        cerr << "Error opening file: " << argv[1] << endl;
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

    cout << "Assembly completed. Output saved as output.bin" << endl;
    return 0;
}
