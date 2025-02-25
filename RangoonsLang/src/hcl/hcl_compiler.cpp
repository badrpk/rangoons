#include <iostream>
#include <fstream>
#include <vector>
#include <unordered_map>
#include <sstream>

using namespace std;

// HCL to HAL opcode mapping
unordered_map<string, string> hcl_to_hal = {
    {"let", "MOV"}, {"add", "ADD"}, {"sub", "SUB"},
    {"mul", "MUL"}, {"div", "DIV"}, {"store", "STORE"},
    {"load", "LOAD"}, {"jmp", "JMP"}, {"ifz", "JZ"},
    {"ifnz", "JNZ"}, {"stop", "HLT"}
};

// Compile HCL to HAL with Proper Argument Parsing
vector<string> compile_hcl(vector<string> hcl_code) {
    vector<string> hal_code;
    unordered_map<string, int> labels;
    int line_number = 0;

    // First Pass: Identify and Store Labels
    for (const auto& line : hcl_code) {
        if (line.back() == ':') {
            string label_name = line.substr(0, line.size() - 1);
            labels[label_name] = line_number;
        } else {
            line_number++;
        }
    }

    // Second Pass: Convert HCL to HAL
    for (const auto& line : hcl_code) {
        if (line.back() == ':') continue; // Skip labels

        stringstream ss(line);
        string command, arg1, keyword, arg2;
        ss >> command >> arg1 >> keyword >> arg2;

        if (hcl_to_hal.find(command) != hcl_to_hal.end()) {
            string hal_instruction = hcl_to_hal[command] + " " + arg1;

            // Handle "ifz" and "ifnz" instructions
            if ((command == "ifz" || command == "ifnz") && keyword == "then") {
                if (labels.find(arg2) != labels.end()) {
                    hal_instruction += ", " + to_string(labels[arg2]);
                } else {
                    cerr << "[ERROR] Undefined label: " << arg2 << endl;
                    return {};
                }
            } else if (!arg2.empty()) {
                hal_instruction += ", " + arg2;
            }

            hal_code.push_back(hal_instruction);
        } else {
            cerr << "[ERROR] Unknown HCL instruction: " << line << endl;
            return {};
        }
    }
    return hal_code;
}

// Compile HCL to HAL
int main(int argc, char *argv[]) {
    if (argc != 3) {
        cerr << "Usage: " << argv[0] << " <source.hcl> <output.hal>" << endl;
        return 1;
    }

    ifstream inputFile(argv[1]);
    if (!inputFile) {
        cerr << "[ERROR] Could not open file: " << argv[1] << endl;
        return 1;
    }

    vector<string> hcl_code;
    string line;
    while (getline(inputFile, line)) {
        hcl_code.push_back(line);
    }
    inputFile.close();

    vector<string> hal_code = compile_hcl(hcl_code);

    if (hal_code.empty()) return 1; // Stop if compilation failed

    ofstream outputFile(argv[2]);
    for (const auto& instruction : hal_code) {
        outputFile << instruction << endl;
    }
    outputFile.close();

    cout << "[SUCCESS] Compilation completed. Output saved as " << argv[2] << endl;
    return 0;
}
