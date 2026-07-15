# RangoonsCore C++ E-commerce Server Makefile

# Compiler and flags
CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2 -g
INCLUDES = -I/usr/include/postgresql -I/usr/local/include/postgresql
LIBS = -lpq -lpthread

# Windows-specific settings
ifeq ($(OS),Windows_NT)
    CXX = g++
    CXXFLAGS += -DWIN32
    LIBS = -lws2_32 -lpq -lpthread
    INCLUDES = -I"C:/Program Files/PostgreSQL/*/include" -I"C:/Program Files/PostgreSQL/*/include/server"
    LIBS += -L"C:/Program Files/PostgreSQL/*/lib"
endif

# Source files
SRCDIR = src
SOURCES = $(wildcard $(SRCDIR)/*.cpp)
OBJECTS = $(SOURCES:.cpp=.o)

# Target executable
TARGET = rangoons-server

# Default target
all: $(TARGET)

# Build the executable
$(TARGET): $(OBJECTS)
	$(CXX) $(OBJECTS) -o $(TARGET) $(LIBS)
	@echo "✅ Build complete: $(TARGET)"

# Compile source files
%.o: %.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

# Clean build files
clean:
	rm -f $(OBJECTS) $(TARGET)
	@echo "🧹 Cleaned build files"

# Install dependencies (Ubuntu/Debian)
install-deps-ubuntu:
	@echo "📦 Installing dependencies for Ubuntu/Debian..."
	sudo apt update
	sudo apt install -y g++ make libpq-dev postgresql postgresql-contrib
	@echo "✅ Dependencies installed"

# Install dependencies (CentOS/RHEL/Fedora)
install-deps-centos:
	@echo "📦 Installing dependencies for CentOS/RHEL/Fedora..."
	sudo yum install -y gcc-c++ make postgresql-devel postgresql postgresql-contrib
	@echo "✅ Dependencies installed"

# Install dependencies (Windows with MSYS2)
install-deps-windows:
	@echo "📦 Installing dependencies for Windows (MSYS2)..."
	pacman -S mingw-w64-x86_64-gcc mingw-w64-x86_64-make mingw-w64-x86_64-postgresql
	@echo "✅ Dependencies installed"

# Run the server
run: $(TARGET)
	@echo "🚀 Starting Rangoons server..."
	./$(TARGET)

# Run with custom environment
run-dev: $(TARGET)
	@echo "🚀 Starting Rangoons server in development mode..."
	DB_HOST=localhost DB_NAME=rangoons DB_USER=postgres DB_PASSWORD=Karachi5846$ DB_PORT=5432 RANGOONS_PORT=8080 ./$(TARGET)

# Database setup
setup-db:
	@echo "🗄️ Setting up PostgreSQL database..."
	sudo -u postgres createdb rangoons 2>/dev/null || echo "Database 'rangoons' already exists"
	sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'Karachi5846$';" 2>/dev/null || echo "Password already set"
	@echo "✅ Database setup complete"

# Test the build
test: $(TARGET)
	@echo "🧪 Testing server build..."
	@if [ -f "$(TARGET)" ]; then \
		echo "✅ Server binary created successfully"; \
		echo "📊 Binary size: $$(stat -c%s $(TARGET) 2>/dev/null || stat -f%z $(TARGET) 2>/dev/null || echo 'unknown') bytes"; \
	else \
		echo "❌ Server binary not found"; \
		exit 1; \
	fi

# Development mode with auto-rebuild
dev: clean all
	@echo "🔄 Development build complete"
	@echo "💡 Run 'make run-dev' to start the server"

# Help
help:
	@echo "🚀 RangoonsCore C++ E-commerce Server"
	@echo ""
	@echo "Available targets:"
	@echo "  all              - Build the server (default)"
	@echo "  clean            - Remove build files"
	@echo "  install-deps-ubuntu  - Install dependencies on Ubuntu/Debian"
	@echo "  install-deps-centos   - Install dependencies on CentOS/RHEL/Fedora"
	@echo "  install-deps-windows  - Install dependencies on Windows (MSYS2)"
	@echo "  setup-db         - Setup PostgreSQL database"
	@echo "  run              - Build and run the server"
	@echo "  run-dev          - Run with development environment"
	@echo "  test             - Test the build"
	@echo "  dev              - Clean build for development"
	@echo "  help             - Show this help message"
	@echo ""
	@echo "Environment variables:"
	@echo "  DB_HOST          - PostgreSQL host (default: localhost)"
	@echo "  DB_NAME          - Database name (default: rangoons)"
	@echo "  DB_USER          - Database user (default: postgres)"
	@echo "  DB_PASSWORD      - Database password (default: Karachi5846$)"
	@echo "  DB_PORT          - Database port (default: 5432)"
	@echo "  RANGOONS_PORT    - Server port (default: 8080)"
	@echo "  ADMIN_KEY        - Admin panel access key"
	@echo "  WHATSAPP_NUMBER  - WhatsApp number (default: 923001555681)"

# Phony targets
.PHONY: all clean install-deps-ubuntu install-deps-centos install-deps-windows setup-db run run-dev test dev help
