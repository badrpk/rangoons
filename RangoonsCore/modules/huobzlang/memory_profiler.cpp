#include <iostream>
#include <fstream>
#include <cstdlib>
#include <sys/resource.h>

class MemoryProfiler {
public:
    static long getPeakMemoryUsage() {
        struct rusage usage;
        getrusage(RUSAGE_SELF, &usage);
        return usage.ru_maxrss;  // Memory usage in KB
    }

    static void logMemoryUsage(const std::string& phase) {
        long memoryUsed = getPeakMemoryUsage();
        std::ofstream logFile("memory_log.txt", std::ios::app);
        if (logFile.is_open()) {
            logFile << "[Memory Log] " << phase << ": " << memoryUsed << " KB" << std::endl;
            logFile.close();
        }
    }
};

int main() {
    MemoryProfiler::logMemoryUsage("Start of Program");

    // Simulating memory allocation
    int* array = new int[1000000];  // Allocate memory
    MemoryProfiler::logMemoryUsage("After Allocation");

    delete[] array;  // Free memory
    MemoryProfiler::logMemoryUsage("After Deallocation");

    return 0;
}
