#include <iostream>
#include <boost/asio.hpp>

using namespace boost::asio;
using namespace boost::asio::ip;

std::string handle_request(const std::string& request) {
    if (request.find("GET /health") != std::string::npos) {
        return "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nAPI is healthy!";
    } else {
        return "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nRangoons API is running!";
    }
}

int main() {
    try {
        io_service service;
        tcp::acceptor acceptor(service, tcp::endpoint(tcp::v4(), 8000));

        std::cout << "✅ Rangoons API is running on port 8000...\n";

        while (true) {
            tcp::socket socket(service);
            acceptor.accept(socket);

            char data_buffer[1024] = {0};
            socket.read_some(boost::asio::buffer(data_buffer, 1024));

            std::string response = handle_request(std::string(data_buffer));
            socket.write_some(boost::asio::buffer(response.c_str(), response.size()));

            socket.close();
        }
    } catch (std::exception& e) {
        std::cerr << "❌ Error: " << e.what() << std::endl;
    }

    return 0;
}
