import sys
from core_features.instruction_set import INSTRUCTION_SET

def text_to_binary(text):
    """Converts a string into binary ASCII representation."""
    return " ".join(format(ord(char), "08b") for char in text)

def compile_huobzlang(source_file, output_file):
    compiled_lines = []
    labels = {}

    try:
        with open(source_file, "r") as file:
            lines = file.readlines()

        # First pass: Identify labels
        instruction_counter = 0
        for line in lines:
            line = line.strip()
            if line.endswith(":"):  # Label definition
                labels[line[:-1].upper()] = instruction_counter  # Ensure labels are uppercase
            else:
                instruction_counter += 1

        # Second pass: Compile instructions
        for line in lines:
            line = line.strip()
            if not line or line.startswith("#") or line.endswith(":"):
                continue

            parts = line.split()
            instruction = parts[0].upper()  # Convert instruction to uppercase

            print(f"🔍 Debug: Processing instruction -> {instruction}")  # Debugging print

            if instruction in INSTRUCTION_SET:
                opcode = INSTRUCTION_SET[instruction]
                operands = ""

                # Handle PRINT instructions with text
                if instruction == "PRINT" and len(parts) > 1:
                    operands = text_to_binary(" ".join(parts[1:]))

                # Handle JUMP, FUNCTION CALL, and KERNEL execution
                elif instruction in ["JUMP", "JUMP_IF_ZERO", "JUMP_IF_NOT_ZERO", "CALL", "KERNEL"]:
                    label_name = parts[1].replace(",", "").strip().upper()  # Remove commas and spaces

                    print(f"🔍 Debug: Processing CALL/JUMP {label_name}")  # Debugging print

                    # If it's a known label, store its position
                    if label_name in labels:
                        operands = format(labels[label_name], "012b")

                    # If it's a register (e.g., R1), handle it correctly for jumps
                    elif label_name.startswith("R") and label_name[1:].isdigit():
                        print(f"✅ Recognized Register Jump: {label_name}")
                        operands = format(int(label_name[1:]), "012b")

                    # If it's a GPU function (VECTOR_ADD, VECTOR_MULTIPLY), allow it
                    elif label_name in ["VECTOR_ADD", "VECTOR_MULTIPLY", "SYNC"]:
                        print(f"✅ Recognized GPU function: {label_name}")
                        operands = format(0, "012b")  # No need for an address

                    else:
                        print(f"⚠️ Error: Unknown reference {label_name}")
                        sys.exit(1)

                # Handle GPU Instructions (No Operands Required)
                elif instruction in ["VECTOR_ADD", "VECTOR_MULTIPLY", "SYNC"]:
                    print(f"✅ Recognized GPU instruction: {instruction}")
                    operands = format(0, "012b")  # These don't require operands

                # Handle Registers and Numeric Values
                elif len(parts) > 1:
                    value = parts[1].replace(",", "").strip().upper()  # Remove commas and spaces

                    if value in labels:
                        operands = format(labels[value], "012b")
                    elif value.isdigit():
                        operands = format(int(value), "012b")
                    elif value.startswith("R") and value[1:].isdigit():  # Register validation
                        operands = format(int(value[1:]), "012b")
                    else:
                        print(f"⚠️ Error: Unknown reference {value}")
                        sys.exit(1)

                compiled_lines.append(f"{opcode}{operands}")

            else:
                print(f"⚠️ Unknown instruction: {instruction} - Skipping")

        # Write compiled machine code to file
        with open(output_file, "w") as out_file:
            out_file.write("\n".join(compiled_lines) + "\n")

        print(f"✅ Compilation successful: {output_file}")

    except FileNotFoundError:
        print(f"❌ Error: Source file {source_file} not found.")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 core_features/compiler.py <source.hl> <output.mc>")
        sys.exit(1)

    source_file = sys.argv[1]
    output_file = sys.argv[2]
    compile_huobzlang(source_file, output_file)
