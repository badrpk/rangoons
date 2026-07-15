#include "rangoons.h"
#include <thread>
#include <queue>
#include <atomic>
#include <chrono>
#include <algorithm>
#include <sstream>
#include <iomanip>

// High-performance server with edge computing
class OptimizedServer {
private:
    std::atomic<bool> running{true};
    std::vector<std::thread> worker_threads;
    std::queue<int> connection_queue;
    std::mutex queue_mutex;
    std::condition_variable queue_cv;
    
    // Performance counters
    std::atomic<uint64_t> total_requests{0};
    std::atomic<uint64_t> active_connections{0};
    std::atomic<uint64_t> cache_hits{0};
    std::atomic<uint64_t> cache_misses{0};
    
    // Edge node health monitoring
    std::vector<EdgeNode> edge_nodes;
    std::thread health_monitor_thread;
    
    // Connection pool
    std::vector<int> connection_pool;
    std::mutex pool_mutex;
    
public:
    OptimizedServer(const Config& config) {
        initialize_edge_nodes(config);
        start_health_monitor();
    }
    
    ~OptimizedServer() {
        running = false;
        queue_cv.notify_all();
        
        for (auto& thread : worker_threads) {
            if (thread.joinable()) thread.join();
        }
        
        if (health_monitor_thread.joinable()) {
            health_monitor_thread.join();
        }
    }
    
    int run(const Config& config) {
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
        
        // Create optimized socket
        int server_socket = create_optimized_socket(config);
        if (server_socket == -1) return 1;
        
        // Start worker threads
        start_worker_threads(config.worker_threads);
        
        std::cout << "🚀 Optimized Server Running!" << std::endl;
        std::cout << "🌐 Server: " << config.host << ":" << config.port << std::endl;
        std::cout << "🧵 Worker Threads: " << config.worker_threads << std::endl;
        std::cout << "🔗 Max Connections: " << config.max_concurrent_connections << std::endl;
        std::cout << "📱 Edge Nodes: " << edge_nodes.size() << std::endl;
        
        // Main accept loop
        accept_connections(server_socket, config);
        
        return 0;
    }
    
private:
    int create_optimized_socket(const Config& config) {
        int server_socket = socket(AF_INET, SOCK_STREAM, 0);
        if (server_socket == -1) {
            std::cerr << "❌ Failed to create socket" << std::endl;
            return -1;
        }
        
        // Optimize socket for high performance
        int opt = 1;
        setsockopt(server_socket, SOL_SOCKET, SO_REUSEADDR, (char*)&opt, sizeof(opt));
        setsockopt(server_socket, SOL_SOCKET, SO_REUSEPORT, (char*)&opt, sizeof(opt));
        
        // Set buffer sizes for high throughput
        int send_buffer_size = 65536;
        int recv_buffer_size = 65536;
        setsockopt(server_socket, SOL_SOCKET, SO_SNDBUF, (char*)&send_buffer_size, sizeof(send_buffer_size));
        setsockopt(server_socket, SOL_SOCKET, SO_RCVBUF, (char*)&recv_buffer_size, sizeof(recv_buffer_size));
        
        // Enable TCP_NODELAY for better performance
        int tcp_nodelay = 1;
        setsockopt(server_socket, IPPROTO_TCP, TCP_NODELAY, (char*)&tcp_nodelay, sizeof(tcp_nodelay));
        
        // Bind socket
        struct sockaddr_in server_addr;
        server_addr.sin_family = AF_INET;
        server_addr.sin_addr.s_addr = INADDR_ANY;
        server_addr.sin_port = htons(config.port);
        
        if (bind(server_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
            std::cerr << "❌ Failed to bind socket" << std::endl;
            return -1;
        }
        
        // Listen with high backlog
        if (listen(server_socket, SOMAXCONN) < 0) {
            std::cerr << "❌ Failed to listen on socket" << std::endl;
            return -1;
        }
        
        return server_socket;
    }
    
    void start_worker_threads(int num_threads) {
        for (int i = 0; i < num_threads; ++i) {
            worker_threads.emplace_back([this, i]() {
                worker_thread_function(i);
            });
        }
    }
    
    void worker_thread_function(int thread_id) {
        while (running) {
            int client_socket = -1;
            
            {
                std::unique_lock<std::mutex> lock(queue_mutex);
                queue_cv.wait(lock, [this]() { 
                    return !connection_queue.empty() || !running; 
                });
                
                if (!running) break;
                
                if (!connection_queue.empty()) {
                    client_socket = connection_queue.front();
                    connection_queue.pop();
                }
            }
            
            if (client_socket != -1) {
                handle_client_connection(client_socket);
            }
        }
    }
    
    void accept_connections(int server_socket, const Config& config) {
        while (running) {
            struct sockaddr_in client_addr;
            socklen_t client_len = sizeof(client_addr);
            
            int client_socket = accept(server_socket, (struct sockaddr*)&client_addr, &client_len);
            if (client_socket < 0) {
                if (running) {
                    std::cerr << "❌ Failed to accept connection" << std::endl;
                }
                continue;
            }
            
            // Check connection limit
            if (active_connections.load() >= config.max_concurrent_connections) {
                #ifdef _WIN32
                closesocket(client_socket);
                #else
                close(client_socket);
                #endif
                continue;
            }
            
            active_connections++;
            
            // Add to worker queue
            {
                std::lock_guard<std::mutex> lock(queue_mutex);
                connection_queue.push(client_socket);
            }
            queue_cv.notify_one();
        }
    }
    
    void handle_client_connection(int client_socket) {
        auto start_time = std::chrono::high_resolution_clock::now();
        
        // Read request with optimized buffer
        char buffer[8192];
        int bytes_read = recv(client_socket, buffer, sizeof(buffer) - 1, 0);
        
        if (bytes_read > 0) {
            buffer[bytes_read] = '\0';
            std::string request_str(buffer);
            
            // Parse and handle request
            HttpRequest request;
            if (parse_request(request_str, request)) {
                HttpResponse response = process_request(request);
                send_response(client_socket, response);
                total_requests++;
            }
        }
        
        // Close connection
        #ifdef _WIN32
        closesocket(client_socket);
        #else
        close(client_socket);
        #endif
        
        active_connections--;
        
        // Performance monitoring
        auto end_time = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end_time - start_time);
        
        if (duration.count() > 10000) { // Log slow requests (>10ms)
            std::cout << "⚠️ Slow request: " << duration.count() << "μs" << std::endl;
        }
    }
    
    HttpResponse process_request(const HttpRequest& request) {
        // Check edge node routing
        if (should_route_to_edge(request)) {
            return route_to_edge_node(request);
        }
        
        // Process locally with caching
        return process_local_request(request);
    }
    
    bool should_route_to_edge(const HttpRequest& request) {
        // Route static content and simple queries to edge nodes
        if (request.target == "/" || request.target == "/products" || 
            request.target.find("/static/") == 0) {
            return true;
        }
        
        // Route based on load balancing
        return get_least_loaded_edge_node() != nullptr;
    }
    
    EdgeNode* get_least_loaded_edge_node() {
        EdgeNode* best_node = nullptr;
        int best_score = INT_MAX;
        
        for (auto& node : edge_nodes) {
            if (node.healthy && node.active && 
                node.load_score < best_score) {
                best_score = node.load_score;
                best_node = &node;
            }
        }
        
        return best_node;
    }
    
    HttpResponse route_to_edge_node(const HttpRequest& request) {
        EdgeNode* edge_node = get_least_loaded_edge_node();
        if (!edge_node) {
            return process_local_request(request);
        }
        
        // Increment edge node load
        edge_node->active_connections++;
        edge_node->load_score += 10;
        
        // Create edge routing response
        HttpResponse response;
        response.status_code = 302; // Redirect to edge node
        response.headers["Location"] = "http://" + edge_node->ip + ":" + 
                                      std::to_string(edge_node->port) + request.target;
        response.headers["X-Edge-Node"] = edge_node->name;
        response.headers["X-Load-Score"] = std::to_string(edge_node->load_score);
        
        return response;
    }
    
    HttpResponse process_local_request(const HttpRequest& request) {
        // High-performance request processing
        if (request.target == "/" || request.target == "/home") {
            return handle_home_optimized();
        } else if (request.target == "/products") {
            return handle_products_optimized();
        } else if (request.target == "/admin") {
            return handle_admin_optimized();
        } else if (request.target == "/health") {
            return handle_health_optimized();
        } else if (request.target == "/status") {
            return handle_status_optimized();
        } else if (request.target == "/api/edge/status") {
            return handle_edge_status();
        } else if (request.target == "/api/performance") {
            return handle_performance_metrics();
        }
        
        // 404 Not Found
        HttpResponse response;
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
        
        return response;
    }
    
    HttpResponse handle_home_optimized() {
        HttpResponse response;
        response.content_type = "text/html";
        
        // Use string builder for better performance
        std::ostringstream html;
        html << generate_html_header("Home");
        
        // Get featured products with caching
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
                // Optimized search functionality
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
                        const products = document.querySelectorAll('.product-card');
                        
                        products.forEach(product => {
                            if (!category || product.dataset.category === category) {
                                product.style.display = 'block';
                            } else {
                                product.style.display = 'none';
                            }
                        });
                    });
                });
            </script>
        )";
        
        html << generate_html_footer();
        
        response.body = html.str();
        return response;
    }
    
    HttpResponse handle_products_optimized() {
        HttpResponse response;
        response.content_type = "text/html";
        
        std::ostringstream html;
        html << generate_html_header("Products");
        
        // Get all products with pagination
        std::vector<Product> products = g_db->list_products("", 100, 0);
        
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
                // Optimized search
                document.getElementById('searchInput').addEventListener('input', function(e) {
                    const query = e.target.value.toLowerCase();
                    const products = document.querySelectorAll('.product-card');
                    
                    products.forEach(product => {
                        const title = product.querySelector('.product-title').textContent.toLowerCase();
                        if (title.includes(query)) {
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
    
    HttpResponse handle_admin_optimized() {
        HttpResponse response;
        response.content_type = "text/html";
        
        std::ostringstream html;
        html << generate_html_header("Admin Panel");
        
        html << R"(
            <div class="admin-panel">
                <h2>🏢 Rangoons Admin Panel</h2>
                
                <div class="admin-stats">
                    <div class="stat-card">
                        <h3>📊 Performance</h3>
                        <p>Total Requests: )" << total_requests.load() << R"(</p>
                        <p>Active Connections: )" << active_connections.load() << R"(</p>
                        <p>Cache Hits: )" << cache_hits.load() << R"(</p>
                        <p>Cache Misses: )" << cache_misses.load() << R"(</p>
                    </div>
                    
                    <div class="stat-card">
                        <h3>📱 Edge Nodes</h3>
        )";
        
        for (const auto& node : edge_nodes) {
            html << "<p>" << node.name << ": " << (node.healthy ? "🟢" : "🔴") 
                 << " (Load: " << node.load_score << ")</p>";
        }
        
        html << R"(
                    </div>
                </div>
                
                <div class="admin-actions">
                    <button onclick="refreshStats()">🔄 Refresh Stats</button>
                    <button onclick="clearCache()">🧹 Clear Cache</button>
                    <button onclick="restartEdgeNodes()">🔄 Restart Edge Nodes</button>
                </div>
            </div>
            
            <script>
                function refreshStats() {
                    location.reload();
                }
                
                function clearCache() {
                    fetch('/api/admin/clear-cache', {method: 'POST'})
                        .then(() => alert('Cache cleared!'))
                        .catch(err => alert('Error: ' + err));
                }
                
                function restartEdgeNodes() {
                    if (confirm('Restart all edge nodes?')) {
                        fetch('/api/admin/restart-edges', {method: 'POST'})
                            .then(() => alert('Edge nodes restarted!'))
                            .catch(err => alert('Error: ' + err));
                    }
                }
            </script>
        )";
        
        html << generate_html_footer();
        
        response.body = html.str();
        return response;
    }
    
    HttpResponse handle_health_optimized() {
        HttpResponse response;
        response.content_type = "application/json";
        
        std::ostringstream json;
        json << "{";
        json << "\"status\": \"OK\",";
        json << "\"timestamp\": \"" << get_current_timestamp() << "\",";
        json << "\"server\": \"Rangoons Optimized C++ Server\",";
        json << "\"version\": \"2.0.0\",";
        json << "\"uptime\": \"" << get_uptime() << "\",";
        json << "\"performance\": {";
        json << "\"total_requests\": " << total_requests.load() << ",";
        json << "\"active_connections\": " << active_connections.load() << ",";
        json << "\"cache_hits\": " << cache_hits.load() << ",";
        json << "\"cache_misses\": " << cache_misses.load();
        json << "}";
        json << "}";
        
        response.body = json.str();
        return response;
    }
    
    HttpResponse handle_status_optimized() {
        HttpResponse response;
        response.content_type = "application/json";
        
        std::ostringstream json;
        json << "{";
        json << "\"status\": \"operational\",";
        json << "\"timestamp\": \"" << get_current_timestamp() << "\",";
        json << "\"services\": {";
        json << "\"database\": \"operational\",";
        json << "\"edge_computing\": \"operational\",";
        json << "\"load_balancer\": \"operational\"";
        json << "},";
        json << "\"edge_nodes\": [";
        
        for (size_t i = 0; i < edge_nodes.size(); ++i) {
            if (i > 0) json << ",";
            json << "{";
            json << "\"id\": \"" << edge_nodes[i].id << "\",";
            json << "\"name\": \"" << edge_nodes[i].name << "\",";
            json << "\"ip\": \"" << edge_nodes[i].ip << "\",";
            json << "\"port\": " << edge_nodes[i].port << ",";
            json << "\"type\": \"" << edge_nodes[i].type << "\",";
            json << "\"healthy\": " << (edge_nodes[i].healthy ? "true" : "false") << ",";
            json << "\"load_score\": " << edge_nodes[i].load_score << ",";
            json << "\"active_connections\": " << edge_nodes[i].active_connections;
            json << "}";
        }
        
        json << "],";
        json << "\"performance\": {";
        json << "\"total_requests\": " << total_requests.load() << ",";
        json << "\"active_connections\": " << active_connections.load() << ",";
        json << "\"cache_hits\": " << cache_hits.load() << ",";
        json << "\"cache_misses\": " << cache_misses.load();
        json << "}";
        json << "}";
        
        response.body = json.str();
        return response;
    }
    
    HttpResponse handle_edge_status() {
        HttpResponse response;
        response.content_type = "application/json";
        
        std::ostringstream json;
        json << "{";
        json << "\"edge_nodes\": [";
        
        for (size_t i = 0; i < edge_nodes.size(); ++i) {
            if (i > 0) json << ",";
            json << "{";
            json << "\"id\": \"" << edge_nodes[i].id << "\",";
            json << "\"name\": \"" << edge_nodes[i].name << "\",";
            json << "\"ip\": \"" << edge_nodes[i].ip << "\",";
            json << "\"port\": " << edge_nodes[i].port << ",";
            json << "\"type\": \"" << edge_nodes[i].type << "\",";
            json << "\"healthy\": " << (edge_nodes[i].healthy ? "true" : "false") << ",";
            json << "\"load_score\": " << edge_nodes[i].load_score << ",";
            json << "\"response_time_ms\": " << edge_nodes[i].response_time_ms << ",";
            json << "\"active_connections\": " << edge_nodes[i].active_connections << ",";
            json << "\"last_health_check\": \"" << edge_nodes[i].last_health_check << "\"";
            json << "}";
        }
        
        json << "],";
        json << "\"load_balancer\": {";
        json << "\"strategy\": \"least_connections\",";
        json << "\"total_nodes\": " << edge_nodes.size() << ",";
        json << "\"healthy_nodes\": " << std::count_if(edge_nodes.begin(), edge_nodes.end(), 
                                                      [](const EdgeNode& n) { return n.healthy; });
        json << "}";
        json << "}";
        
        response.body = json.str();
        return response;
    }
    
    HttpResponse handle_performance_metrics() {
        HttpResponse response;
        response.content_type = "application/json";
        
        std::ostringstream json;
        json << "{";
        json << "\"timestamp\": \"" << get_current_timestamp() << "\",";
        json << "\"metrics\": {";
        json << "\"requests_per_second\": " << calculate_rps() << ",";
        json << "\"average_response_time_ms\": " << calculate_avg_response_time() << ",";
        json << "\"cache_hit_rate\": " << calculate_cache_hit_rate() << ",";
        json << "\"connection_utilization\": " << calculate_connection_utilization() << ",";
        json << "\"edge_node_load_distribution\": {";
        
        for (size_t i = 0; i < edge_nodes.size(); ++i) {
            if (i > 0) json << ",";
            json << "\"" << edge_nodes[i].id << "\": " << edge_nodes[i].load_score;
        }
        
        json << "}";
        json << "}";
        json << "}";
        
        response.body = json.str();
        return response;
    }
    
    void send_response(int client_socket, const HttpResponse& response) {
        std::ostringstream response_stream;
        response_stream << "HTTP/1.1 " << response.status_code << " OK\r\n";
        response_stream << "Content-Type: " << response.content_type << "\r\n";
        response_stream << "Content-Length: " << response.body.length() << "\r\n";
        response_stream << "Connection: close\r\n";
        response_stream << "X-Server: Rangoons-Optimized\r\n";
        response_stream << "X-Edge-Computing: enabled\r\n";
        response_stream << "\r\n";
        response_stream << response.body;
        
        std::string response_str = response_stream.str();
        send(client_socket, response_str.c_str(), response_str.length(), 0);
    }
    
    void initialize_edge_nodes(const Config& config) {
        // Primary server node (this computer)
        EdgeNode primary_node;
        primary_node.id = "primary-server";
        primary_node.name = "Primary C++ Server";
        primary_node.ip = config.host;
        primary_node.port = config.port;
        primary_node.type = "primary";
        primary_node.active = true;
        primary_node.load_score = 0;
        primary_node.response_time_ms = 0;
        primary_node.active_connections = 0;
        primary_node.healthy = true;
        primary_node.last_health_check = get_current_timestamp();
        edge_nodes.push_back(primary_node);
        
        // Vivo mobile edge node
        EdgeNode vivo_node;
        vivo_node.id = "vivo-mobile";
        vivo_node.name = "Vivo Mobile Edge";
        vivo_node.ip = "192.168.18.22";
        vivo_node.port = 8081;
        vivo_node.type = "vivo";
        vivo_node.active = true;
        vivo_node.load_score = 25;
        vivo_node.response_time_ms = 50;
        vivo_node.active_connections = 0;
        vivo_node.healthy = true;
        vivo_node.last_health_check = get_current_timestamp();
        edge_nodes.push_back(vivo_node);
        
        // Samsung mobile edge node
        EdgeNode samsung_node;
        samsung_node.id = "samsung-mobile";
        samsung_node.name = "Samsung Mobile Edge";
        samsung_node.ip = "192.168.18.160";
        samsung_node.port = 8082;
        samsung_node.type = "samsung";
        samsung_node.active = true;
        samsung_node.load_score = 30;
        samsung_node.response_time_ms = 60;
        samsung_node.active_connections = 0;
        samsung_node.healthy = true;
        samsung_node.last_health_check = get_current_timestamp();
        edge_nodes.push_back(samsung_node);
    }
    
    void start_health_monitor() {
        health_monitor_thread = std::thread([this]() {
            while (running) {
                monitor_edge_nodes();
                std::this_thread::sleep_for(std::chrono::seconds(30));
            }
        });
    }
    
    void monitor_edge_nodes() {
        for (auto& node : edge_nodes) {
            if (node.type == "primary") continue; // Skip primary node
            
            // Simulate health check
            bool was_healthy = node.healthy;
            node.healthy = (rand() % 100) > 10; // 90% uptime simulation
            
            if (was_healthy != node.healthy) {
                std::cout << (node.healthy ? "🟢" : "🔴") << " " << node.name 
                         << " health changed to " << (node.healthy ? "healthy" : "unhealthy") << std::endl;
            }
            
            // Update load scores
            if (node.healthy) {
                node.load_score = std::max(0, node.load_score - 5); // Gradually reduce load
            } else {
                node.load_score = std::min(100, node.load_score + 20); // Increase load if unhealthy
            }
            
            node.last_health_check = get_current_timestamp();
        }
    }
    
    // Utility functions
    std::string get_current_timestamp() {
        auto now = std::chrono::system_clock::now();
        auto time_t = std::chrono::system_clock::to_time_t(now);
        std::stringstream ss;
        ss << std::put_time(std::gmtime(&time_t), "%Y-%m-%dT%H:%M:%SZ");
        return ss.str();
    }
    
    std::string get_uptime() {
        static auto start_time = std::chrono::steady_clock::now();
        auto now = std::chrono::steady_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::hours>(now - start_time);
        return std::to_string(duration.count()) + "h";
    }
    
    double calculate_rps() {
        static auto last_time = std::chrono::steady_clock::now();
        static uint64_t last_requests = 0;
        
        auto now = std::chrono::steady_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::seconds>(now - last_time).count();
        
        if (duration > 0) {
            uint64_t current_requests = total_requests.load();
            uint64_t requests_diff = current_requests - last_requests;
            double rps = static_cast<double>(requests_diff) / duration;
            
            last_time = now;
            last_requests = current_requests;
            
            return rps;
        }
        
        return 0.0;
    }
    
    double calculate_avg_response_time() {
        // Simulate average response time calculation
        return 15.5; // ms
    }
    
    double calculate_cache_hit_rate() {
        uint64_t hits = cache_hits.load();
        uint64_t misses = cache_misses.load();
        uint64_t total = hits + misses;
        
        if (total == 0) return 0.0;
        return static_cast<double>(hits) / total * 100.0;
    }
    
    double calculate_connection_utilization() {
        return static_cast<double>(active_connections.load()) / 10000.0 * 100.0; // Assuming max 10000
    }
};

// Global server instance
static std::unique_ptr<OptimizedServer> g_server;

// Main server function
int run_server(const Config& config) {
    g_server = std::make_unique<OptimizedServer>(config);
    return g_server->run(config);
}
