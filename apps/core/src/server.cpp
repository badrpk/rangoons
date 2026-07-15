#include "rangoons.h"

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#endif

#include <cstring>
#include <string>
#include <sstream>
#include <iostream>
#include <algorithm>
#include <map>
#include <vector>
#include <cstdlib>
#include <iomanip>
#include <fstream>
#include <sstream>
#include <chrono>
#include <ctime>

// ---------------- Globals -----------------
static std::unique_ptr<DB> g_db;
static Config g_config;

// ---------------- Helpers -----------------

// Minimal URL encoder for query strings
static std::string url_encode(const std::string& s) {
    std::ostringstream o;
    o << std::uppercase << std::hex;
    for (unsigned char c : s) {
        if ((c >= 'A' && c <= 'Z') ||
            (c >= 'a' && c <= 'z') ||
            (c >= '0' && c <= '9') ||
            c=='-' || c=='_' || c=='.' || c=='~') {
            o << c;
        } else if (c == ' ') {
            o << "%20";
        } else {
            o << '%' << std::setw(2) << std::setfill('0') << int(c);
        }
    }
    return o.str();
}

// Minimal JSON escaper for strings
static std::string json_escape(const std::string& s) {
    std::string out; out.reserve(s.size()+8);
    for (unsigned char c : s) {
        switch (c) {
            case '\"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\b': out += "\\b";  break;
            case '\f': out += "\\f";  break;
            case '\n': out += "\\n";  break;
            case '\r': out += "\\r";  break;
            case '\t': out += "\\t";  break;
            default:
                if (c < 0x20) { // control
                    char buf[7]; std::snprintf(buf, sizeof(buf), "\\u%04X", c);
                    out += buf;
                } else {
                    out += c;
                }
        }
    }
    return out;
}

// Price formatting
static std::string format_price(int price_cents) {
    std::ostringstream oss;
    oss << "Rs " << std::fixed << std::setprecision(2) << (price_cents / 100.0);
    return oss.str();
}

// Generate UUID
static std::string generate_uuid() {
    static std::random_device rd;
    static std::mt19937 gen(rd());
    static std::uniform_int_distribution<> dis(0, 15);
    static const char* hex = "0123456789abcdef";
    
    std::string uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    for (char& c : uuid) {
        if (c == 'x') c = hex[dis(gen)];
        else if (c == 'y') c = hex[dis(gen) & 0x3 | 0x8];
    }
    return uuid;
}

// ---------------- HTTP Parsing -----------------

struct HttpRequest {
    std::string method;
    std::string target;
    std::map<std::string, std::string> headers;
    std::string body;
    std::map<std::string, std::string> query_params;
};

static std::string trim(const std::string& s){
    size_t a=0,b=s.size();
    while (a<b && (s[a]==' '||s[a]=='\t'||s[a]=='\r'||s[a]=='\n')) ++a;
    while (b>a && (s[b-1]==' '||s[b-1]=='\t'||s[b-1]=='\r'||s[b-1]=='\n')) --b;
    return s.substr(a,b-a);
}

static std::string tolower_str(std::string v){ for(char& c:v) c=std::tolower((unsigned char)c); return v; }

static bool parse_request(const std::string& raw_request, HttpRequest& request) {
    std::istringstream ss(raw_request);
    std::string line;
    
    // Parse first line (method, target, version)
    if (!std::getline(ss, line)) return false;
    
    std::istringstream first_line(line);
    first_line >> request.method >> request.target;
    
    // Parse query parameters
    size_t query_pos = request.target.find('?');
    if (query_pos != std::string::npos) {
        std::string query_string = request.target.substr(query_pos + 1);
        request.target = request.target.substr(0, query_pos);
        
        std::istringstream query_ss(query_string);
        std::string param;
        while (std::getline(query_ss, param, '&')) {
            size_t equal_pos = param.find('=');
            if (equal_pos != std::string::npos) {
                std::string key = param.substr(0, equal_pos);
                std::string value = param.substr(equal_pos + 1);
                request.query_params[url_encode(key)] = url_encode(value);
            }
        }
    }
    
    // Parse headers
    while (std::getline(ss, line) && line != "\r" && line != "") {
        size_t colon_pos = line.find(':');
        if (colon_pos != std::string::npos) {
            std::string key = trim(line.substr(0, colon_pos));
            std::string value = trim(line.substr(colon_pos + 1));
            request.headers[tolower_str(key)] = value;
        }
    }
    
    // Parse body
    std::stringstream body_ss;
    while (std::getline(ss, line)) {
        body_ss << line << "\n";
    }
    request.body = body_ss.str();
    
    return true;
}

// ---------------- HTML Generation -----------------

static std::string generate_html_header(const std::string& title) {
    return R"(
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>)" + title + R"( - Rangoons</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 20px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .header h1 { color: #333; text-align: center; font-size: 2.5em; margin-bottom: 10px; }
        .header p { text-align: center; color: #666; font-size: 1.1em; }
        .nav { display: flex; justify-content: center; gap: 20px; margin-top: 20px; }
        .nav a { background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; transition: transform 0.3s ease; }
        .nav a:hover { transform: translateY(-2px); }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; margin-top: 30px; }
        .product-card { background: rgba(255,255,255,0.95); border-radius: 15px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
        .product-card:hover { transform: translateY(-5px); }
        .product-image { width: 100%; height: 250px; object-fit: cover; }
        .product-info { padding: 20px; }
        .product-title { font-size: 1.3em; color: #333; margin-bottom: 10px; font-weight: 600; }
        .product-price { font-size: 1.5em; color: #667eea; font-weight: bold; margin-bottom: 15px; }
        .product-description { color: #666; margin-bottom: 15px; line-height: 1.5; }
        .add-to-cart { background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-size: 1em; transition: transform 0.3s ease; }
        .add-to-cart:hover { transform: scale(1.05); }
        .search-bar { background: rgba(255,255,255,0.95); padding: 20px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .search-input { width: 100%; padding: 15px; border: 2px solid #ddd; border-radius: 10px; font-size: 1.1em; outline: none; }
        .search-input:focus { border-color: #667eea; }
        .category-filter { display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap; }
        .category-btn { background: #f0f0f0; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; transition: background 0.3s ease; }
        .category-btn.active { background: #667eea; color: white; }
        .footer { text-align: center; margin-top: 50px; color: rgba(255,255,255,0.8); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛍️ Rangoons</h1>
            <p>Your Premium Shopping Destination</p>
            <div class="nav">
                <a href="/">🏠 Home</a>
                <a href="/products">📦 Products</a>
                <a href="/cart">🛒 Cart</a>
                <a href="/admin">⚙️ Admin</a>
            </div>
        </div>
    )";
}

static std::string generate_html_footer() {
    return R"(
        <div class="footer">
            <p>&copy; 2024 Rangoons. All rights reserved. | 📱 WhatsApp: )" + g_config.whatsapp_number + R"(</p>
        </div>
    </div>
</body>
</html>
    )";
}

static std::string generate_product_card(const Product& product) {
    std::ostringstream oss;
    oss << R"(
        <div class="product-card">
            <img src=")" << (product.image_url.empty() ? "https://via.placeholder.com/300x250?text=Product" : product.image_url) << R"(" alt=")" << product.title << R"(" class="product-image">
            <div class="product-info">
                <h3 class="product-title">)" << product.title << R"(</h3>
                <div class="product-price">)" << format_price(product.price_cents) << R"(</div>
                <p class="product-description">)" << (product.description.empty() ? "No description available" : product.description) << R"(</p>
                <button class="add-to-cart" onclick="addToCart()" data-product-id=")" << product.id << R"(" data-price=")" << product.price_cents << R"(">🛒 Add to Cart</button>
            </div>
        </div>
    )";
    return oss.str();
}

// ---------------- Route Handlers -----------------

static HttpResponse handle_home() {
    HttpResponse response;
    response.content_type = "text/html";
    
    std::ostringstream html;
    html << generate_html_header("Home");
    
    // Get featured products
    std::vector<Product> products = g_db->list_products("", 6, 0);
    
    html << R"(
        <div class="search-bar">
            <input type="text" class="search-input" placeholder="🔍 Search products..." id="searchInput">
            <div class="category-filter">
                <button class="category-btn active" data-category="">All Categories</button>
                <button class="category-btn" data-category="Electronics">Electronics</button>
                <button class="category-btn" data-category="Fashion">Fashion</button>
                <button class="category-btn" data-category="Home">Home & Garden</button>
            </div>
        </div>
        
        <h2 style="text-align: center; color: white; margin: 30px 0; font-size: 2em;">Featured Products</h2>
        
        <div class="products-grid">
    )";
    
    for (const auto& product : products) {
        html << generate_product_card(product);
    }
    
    html << R"(
        </div>
        
        <script>
            // Search functionality
            document.getElementById('searchInput').addEventListener('input', function(e) {
                const query = e.target.value.toLowerCase();
                const products = document.querySelectorAll('.product-card');
                
                products.forEach(product => {
                    const title = product.querySelector('.product-title').textContent.toLowerCase();
                    const description = product.querySelector('.product-description').textContent.toLowerCase();
                    
                    if (title.includes(query) || description.includes(query)) {
                        product.style.display = 'block';
    } else {
                        product.style.display = 'none';
                    }
                });
            });
            
            // Category filtering
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const category = this.dataset.category;
                    // Implement category filtering
                });
            });
            
            // Add to cart functionality
            function addToCart() {
                alert('Product added to cart!');
            }
        </script>
    )";
    
    html << generate_html_footer();
    response.body = html.str();
    return response;
}

static HttpResponse handle_products() {
    HttpResponse response;
    response.content_type = "text/html";
    
    std::ostringstream html;
    html << generate_html_header("Products");
    
    // Get all products
    std::vector<Product> products = g_db->list_products();
    
    html << R"(
        <div class="search-bar">
            <input type="text" class="search-input" placeholder="🔍 Search products..." id="searchInput">
        </div>
        
        <h2 style="text-align: center; color: white; margin: 30px 0; font-size: 2em;">All Products</h2>
        
        <div class="products-grid">
    )";
    
    for (const auto& product : products) {
        html << generate_product_card(product);
    }
    
    html << R"(
        </div>
        
        <script>
            document.getElementById('searchInput').addEventListener('input', function(e) {
                const query = e.target.value.toLowerCase();
                const products = document.querySelectorAll('.product-card');
                
                products.forEach(product => {
                    const title = product.querySelector('.product-title').textContent.toLowerCase();
                    const description = product.querySelector('.product-description').textContent.toLowerCase();
                    
                    if (title.includes(query) || description.includes(query)) {
                        product.style.display = 'block';
                    } else {
                        product.style.display = 'none';
                    }
                });
            });
        </script>
    )";
    
    html << generate_html_footer();
    response.body = html.str();
    return response;
}

static HttpResponse handle_admin() {
    HttpResponse response;
    response.content_type = "text/html";
    
    std::ostringstream html;
    html << generate_html_header("Admin Dashboard");
    
    html << R"(
        <div style="background: rgba(255,255,255,0.95); padding: 30px; border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
            <h2 style="text-align: center; margin-bottom: 30px;">🛠️ Admin Dashboard</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; text-align: center;">
                    <h3>📱 WhatsApp</h3>
                    <p>Connect and manage WhatsApp integration</p>
                    <a href="/admin/whatsapp/qr" style="background: #25d366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Manage WhatsApp</a>
                </div>
                
                <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; text-align: center;">
                    <h3>📊 Import Products</h3>
                    <p>Import product catalog from CSV files</p>
                    <a href="/admin/import" style="background: #ffc107; color: #212529; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Import CSV</a>
                </div>
                
                <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; text-align: center;">
                    <h3>📤 Export Database</h3>
                    <p>Export database for mobile backup server</p>
                    <a href="/admin/export" style="background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Export DB</a>
                </div>
                
                <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; text-align: center;">
                    <h3>📊 Status Monitor</h3>
                    <p>Monitor server status and failover system</p>
                    <a href="/server-status-widget.html" style="background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">View Status</a>
                </div>
            </div>
        </div>
    )";
    
    html << generate_html_footer();
    response.body = html.str();
    return response;
}

static HttpResponse handle_health() {
    HttpResponse response;
    response.content_type = "application/json";
    
    std::ostringstream json;
    json << "{";
    json << "\"server\": \"C++_PRIMARY\",";
    json << "\"status\": \"online\",";
    json << "\"ip\": \"" << g_config.host << ":" << g_config.port << "\",";
    json << "\"database\": \"postgresql\",";
    json << "\"uptime\": " << std::chrono::system_clock::now().time_since_epoch().count() << ",";
    json << "\"timestamp\": \"" << std::chrono::system_clock::now().time_since_epoch().count() << "\"";
    json << "}";
    
    response.body = json.str();
    return response;
}

static HttpResponse handle_status() {
    HttpResponse response;
    response.content_type = "application/json";
    
    std::ostringstream json;
    json << "{";
    json << "\"activeServer\": \"cpp\",";
    json << "\"cppStatus\": \"online\",";
    json << "\"cppIP\": \"" << g_config.host << ":" << g_config.port << "\",";
    json << "\"database\": \"postgresql\",";
    json << "\"uptime\": " << std::chrono::system_clock::now().time_since_epoch().count() << ",";
    json << "\"timestamp\": \"" << std::chrono::system_clock::now().time_since_epoch().count() << "\"";
    json << "}";
    
    response.body = json.str();
    return response;
}

// ---------------- Main Server Function -----------------

int run_server(const Config& config) {
    g_config = config;
    
    // Initialize database
    g_db = std::make_unique<DB>();
    std::string db_conn_str = config.db_host + ":" + std::to_string(config.db_port) + ":" + 
                              config.db_name + ":" + config.db_user + ":" + config.db_password;
    
    if (!g_db->open(db_conn_str)) {
        std::cerr << "❌ Failed to connect to database" << std::endl;
        return 1;
    }
    
    if (!g_db->init_schema()) {
        std::cerr << "❌ Failed to initialize database schema" << std::endl;
        return 1;
    }
    
    // Initialize networking
    #ifdef _WIN32
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "❌ WSAStartup failed" << std::endl;
        return 1;
    }
    #endif
    
    // Create socket
    int server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket == -1) {
        std::cerr << "❌ Failed to create socket" << std::endl;
        return 1;
    }
    
    // Set socket options
    int opt = 1;
    setsockopt(server_socket, SOL_SOCKET, SO_REUSEADDR, (char*)&opt, sizeof(opt));
    
    // Bind socket
    struct sockaddr_in server_addr;
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(config.port);
    
    if (bind(server_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        std::cerr << "❌ Failed to bind socket" << std::endl;
        return 1;
    }
    
    // Listen for connections
    if (listen(server_socket, 10) < 0) {
        std::cerr << "❌ Failed to listen on socket" << std::endl;
        return 1;
    }
    
    std::cout << "✅ Server listening on " << config.host << ":" << config.port << std::endl;
    std::cout << "🌐 Access your website at: http://localhost:" << config.port << std::endl;
    std::cout << "📊 Admin panel: http://localhost:" << config.port << "/admin" << std::endl;
    
    // Main server loop
    while (true) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        
        int client_socket = accept(server_socket, (struct sockaddr*)&client_addr, &client_len);
        if (client_socket < 0) {
            std::cerr << "❌ Failed to accept connection" << std::endl;
            continue;
        }
        
        // Read request
        char buffer[4096];
        int bytes_read = recv(client_socket, buffer, sizeof(buffer) - 1, 0);
        if (bytes_read <= 0) {
            #ifdef _WIN32
            closesocket(client_socket);
            #else
            close(client_socket);
            #endif
            continue;
        }
        
        buffer[bytes_read] = '\0';
        std::string request_str(buffer);
        
        // Parse request
        HttpRequest request;
        if (!parse_request(request_str, request)) {
            #ifdef _WIN32
            closesocket(client_socket);
            #else
            close(client_socket);
            #endif
            continue;
        }
        
        // Handle request
        HttpResponse response;
        if (request.target == "/" || request.target == "/home") {
            response = handle_home();
        } else if (request.target == "/products") {
            response = handle_products();
        } else if (request.target == "/admin") {
            response = handle_admin();
        } else if (request.target == "/health") {
            response = handle_health();
        } else if (request.target == "/status") {
            response = handle_status();
        } else {
            // 404 Not Found
            response.status_code = 404;
            response.content_type = "text/html";
            response.body = R"(
                <!DOCTYPE html>
                <html>
                <head><title>404 Not Found</title></head>
                <body>
                    <h1>404 - Page Not Found</h1>
                    <p>The requested page could not be found.</p>
                    <a href="/">Go Home</a>
                </body>
                </html>
            )";
        }
        
        // Build response
        std::ostringstream response_stream;
        response_stream << "HTTP/1.1 " << response.status_code << " OK\r\n";
        response_stream << "Content-Type: " << response.content_type << "\r\n";
        response_stream << "Content-Length: " << response.body.length() << "\r\n";
        response_stream << "Connection: close\r\n";
        response_stream << "\r\n";
        response_stream << response.body;
        
        std::string response_str = response_stream.str();
        send(client_socket, response_str.c_str(), response_str.length(), 0);
        
        #ifdef _WIN32
        closesocket(client_socket);
        #else
        close(client_socket);
        #endif
    }
    
    // Cleanup
    #ifdef _WIN32
    closesocket(server_socket);
    WSACleanup();
    #else
    close(server_socket);
    #endif
    
    return 0;
}
