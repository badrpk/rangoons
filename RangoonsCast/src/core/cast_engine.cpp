#include <iostream>

class CastEngine {
public:
    void start() {
        std::cout << "Initializing Cast Engine..." << std::endl;
    }
};

int main() {
    CastEngine cast;
    cast.start();
    return 0;
}
