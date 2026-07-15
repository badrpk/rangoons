#pragma once

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <atomic>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <chrono>

// Forward declarations
struct sqlite3;
struct sqlite3_stmt;

// Edge node configuration
struct EdgeNode {
    std::string id;
    std::string name;
    std::string ip;
    int port;
    std::string type; // "primary", "vivo", "samsung"
    bool active;
    int load_score; // 0-100, lower is better
    int response_time_ms;
    int active_connections;
    std::string last_health_check;
    std::atomic<bool> healthy{true};
    
    EdgeNode() : port(8080), active(false), load_score(100), response_time_ms(0), active_connections(0) {}
};

// Load balancer configuration
struct LoadBalancerConfig {
    std::vector<EdgeNode> nodes;
    std::string strategy; // "round_robin", "least_connections", "weighted"
    int health_check_interval_ms;
    int max_failures;
    bool auto_failover;
    
    LoadBalancerConfig() : strategy("least_connections"), health_check_interval_ms(5000), max_failures(3), auto_failover(true) {}
};

// Configuration structure
struct Config {
    std::string db_host = "localhost";
    std::string db_name = "rangoons";
    std::string db_user = "postgres";
    std::string db_password = "Karachi5846$";
    int db_port = 5432;
    std::string host = "0.0.0.0";
    unsigned short port = 8080;
    std::string admin_key;
    std::string whatsapp_number = "923001555681";
    
    // Edge computing configuration
    LoadBalancerConfig load_balancer;
    bool enable_edge_computing = true;
    int edge_cache_size_mb = 512;
    int max_concurrent_connections = 10000;
    bool enable_compression = true;
    bool enable_http2 = false;
    
    // Performance tuning
    int worker_threads = 4;
    int connection_pool_size = 100;
    int request_buffer_size = 8192;
    int response_buffer_size = 16384;
    bool enable_keep_alive = true;
    int keep_alive_timeout = 30;
};

// Product structure
struct Product {
    int id = 0;
    std::string handle;
    std::string title;
    std::string description;
    std::string vendor;
    std::string category;
    std::string tags;
    bool published = true;
    std::string sku;
    int stock = 0;
    int price_cents = 0;
    int compare_price_cents = 0;
    std::string image_url;
    int weight_grams = 0;
    std::string option1_name;
    std::string option1_value;
    std::string option2_name;
    std::string option2_value;
    std::string option3_name;
    std::string option3_value;
    std::string created_at;
    
    // Edge computing fields
    std::string cache_key;
    int cache_ttl_seconds;
    std::vector<std::string> edge_nodes;
};

// Order structure
struct Order {
    int id = 0;
    std::string cart_id;
    std::string customer_name;
    std::string phone;
    std::string email;
    std::string address;
    std::string city;
    std::string postal_code;
    std::string country;
    int total_cents = 0;
    int shipping_cents = 0;
    int tax_cents = 0;
    std::string status;
    std::string payment_status;
    bool whatsapp_sent = false;
    std::string tracking_number;
    std::string notes;
    std::string created_at;
    
    // Edge computing fields
    std::string processing_node;
    int priority_score;
    std::string estimated_delivery;
};

// Order item structure
struct OrderItem {
    int id = 0;
    int order_id = 0;
    int product_id = 0;
    int quantity = 1;
    int price_cents = 0;
    std::string created_at;
};

// Cart structure
struct Cart {
    std::string cart_id;
    std::string user_id;
    std::string created_at;
    std::string edge_node;
    int last_activity;
};

// Cart item structure
struct CartItem {
    std::string cart_id;
    int product_id = 0;
    int qty = 0;
    std::string selected_options;
};

// Category structure
struct Category {
    int id = 0;
    std::string name;
    std::string slug;
    std::string description;
    std::string image_url;
    int parent_id = 0;
    int sort_order = 0;
    std::string created_at;
};

// Product statistics structure
struct ProductStats {
    int product_id = 0;
    int sold_count = 0;
    int view_count = 0;
    int like_count = 0;
    int cache_hits = 0;
    int cache_misses = 0;
    std::string most_active_edge_node;
};

// HTTP request structure
struct HttpRequest {
    std::string method;
    std::string target;
    std::map<std::string, std::string> headers;
    std::string body;
    std::map<std::string, std::string> query_params;
    std::string client_ip;
    std::string user_agent;
    std::string session_id;
    int priority = 0;
    std::string edge_node_id;
};

// HTTP response structure
struct HttpResponse {
    int status_code = 200;
    std::map<std::string, std::string> headers;
    std::string body;
    std::string content_type = "text/html";
    bool compressed = false;
    int content_length = 0;
    std::string cache_control;
    std::string edge_node_id;
};

// Edge computing cache entry
struct CacheEntry {
    std::string key;
    std::string data;
    std::string content_type;
    int ttl_seconds;
    std::chrono::system_clock::time_point expires_at;
    int access_count;
    std::string edge_node_id;
    bool is_compressed;
    
    CacheEntry() : ttl_seconds(300), access_count(0), is_compressed(false) {}
};

// Database interface
class DB {
public:
    DB();
    ~DB();
    
    bool open(const std::string& connection_string);
    void close();
    bool is_open() const;
    
    // Schema management
    bool init_schema(std::string* err = nullptr);
    
    // Product management
    bool create_product(const Product& p, int* out_id = nullptr, std::string* err = nullptr);
    bool update_product(const Product& p, std::string* err = nullptr);
    bool delete_product(int id, std::string* err = nullptr);
    Product get_product(int id, std::string* err = nullptr);
    std::vector<Product> list_products(const std::string& category = "", int limit = 0, int offset = 0);
    std::vector<Product> search_products(const std::string& query, int limit = 0, int offset = 0);
    int get_product_count(const std::string& category = "");
    
    // Category management
    bool create_category(const Category& c, int* out_id = nullptr, std::string* err = nullptr);
    std::vector<Category> list_categories();
    
    // Order management
    bool create_order(const Order& o, int* out_id = nullptr, std::string* err = nullptr);
    bool update_order_status(int order_id, const std::string& status, std::string* err = nullptr);
    std::vector<Order> list_orders(int limit = 0, int offset = 0);
    Order get_order(int id, std::string* err = nullptr);
    
    // Cart management
    bool create_cart(const Cart& c, std::string* err = nullptr);
    bool add_to_cart(const CartItem& item, std::string* err = nullptr);
    bool remove_from_cart(const std::string& cart_id, int product_id, std::string* err = nullptr);
    std::vector<CartItem> get_cart_items(const std::string& cart_id, std::string* err = nullptr);
    
    // Statistics
    bool update_product_stats(int product_id, const std::string& stat_type, int value, std::string* err = nullptr);
    ProductStats get_product_stats(int product_id, std::string* err = nullptr);
    
    // CSV import
    bool import_products_from_csv(const std::string& csv_data, std::string* err = nullptr);
    
    // Database export
    std::string export_database(std::string* err = nullptr);
    
    // Edge computing
    bool sync_with_edge_node(const std::string& edge_node_id, std::string* err = nullptr);
    std::vector<std::string> get_edge_node_status();

private:
    void* handle = nullptr; // PostgreSQL connection
    bool connected = false;
};

// Edge computing cache manager
class EdgeCache {
public:
    EdgeCache(size_t max_size_mb = 512);
    ~EdgeCache();
    
    bool put(const std::string& key, const std::string& data, const std::string& content_type, int ttl_seconds = 300);
    std::string get(const std::string& key, std::string* content_type = nullptr);
    bool remove(const std::string& key);
    void clear();
    size_t size() const;
    size_t capacity() const;
    
    // Edge node synchronization
    bool sync_to_node(const std::string& edge_node_id, const std::string& key);
    bool sync_from_node(const std::string& edge_node_id, const std::string& key);
    
    // Cache statistics
    int get_hit_count() const;
    int get_miss_count() const;
    double get_hit_ratio() const;

private:
    std::map<std::string, CacheEntry> cache;
    size_t max_size_bytes;
    std::atomic<int> hit_count{0};
    std::atomic<int> miss_count{0};
    mutable std::mutex cache_mutex;
    
    void evict_lru();
    void cleanup_expired();
};

// Load balancer
class LoadBalancer {
public:
    LoadBalancer(const LoadBalancerConfig& config);
    ~LoadBalancer();
    
    bool start();
    void stop();
    bool is_running() const;
    
    // Node management
    bool add_node(const EdgeNode& node);
    bool remove_node(const std::string& node_id);
    bool update_node_health(const std::string& node_id, bool healthy, int response_time_ms);
    
    // Load balancing
    EdgeNode* get_next_node(const std::string& strategy = "");
    EdgeNode* get_least_loaded_node();
    EdgeNode* get_fastest_node();
    
    // Health monitoring
    void start_health_monitoring();
    void stop_health_monitoring();
    std::vector<EdgeNode> get_healthy_nodes() const;
    
    // Statistics
    std::map<std::string, int> get_node_loads() const;
    std::map<std::string, double> get_node_response_times() const;

private:
    LoadBalancerConfig config;
    std::atomic<bool> running{false};
    std::thread health_monitor_thread;
    mutable std::mutex nodes_mutex;
    
    void health_monitor_loop();
    void check_node_health(EdgeNode& node);
    void redistribute_load();
};

// HTTP server interface
class Server {
public:
    Server();
    ~Server();
    
    bool start(const Config& config);
    void stop();
    bool is_running() const;
    
    // Request handling
    HttpResponse handle_request(const HttpRequest& request);
    
    // Route handlers
    HttpResponse handle_home();
    HttpResponse handle_products();
    HttpResponse handle_product_detail(int id);
    HttpResponse handle_cart();
    HttpResponse handle_checkout();
    HttpResponse handle_admin();
    HttpResponse handle_admin_import();
    HttpResponse handle_admin_export();
    HttpResponse handle_whatsapp_qr();
    HttpResponse handle_health();
    HttpResponse handle_status();
    HttpResponse handle_edge_sync();
    
    // API endpoints
    HttpResponse handle_api_products();
    HttpResponse handle_api_product(int id);
    HttpResponse handle_api_cart(const std::string& cart_id);
    HttpResponse handle_api_orders();
    HttpResponse handle_api_order(int id);
    HttpResponse handle_api_edge_status();
    
    // Utility functions
    std::string generate_html(const std::string& template_name, const std::map<std::string, std::string>& data);
    std::string generate_json(const std::map<std::string, std::string>& data);
    std::string url_encode(const std::string& s);
    std::string json_escape(const std::string& s);
    
    // Edge computing
    bool enable_edge_computing(bool enable);
    bool register_edge_node(const EdgeNode& node);
    bool unregister_edge_node(const std::string& node_id);
    std::vector<EdgeNode> get_edge_nodes() const;

private:
    bool running = false;
    int server_socket = -1;
    std::unique_ptr<DB> database;
    std::unique_ptr<EdgeCache> cache;
    std::unique_ptr<LoadBalancer> load_balancer;
    Config config;
    std::vector<std::thread> worker_threads;
    
    // Helper functions
    bool parse_request(const std::string& raw_request, HttpRequest& request);
    std::string build_response(const HttpResponse& response);
    void log_request(const HttpRequest& request, const HttpResponse& response);
    void worker_thread_function();
    
    // Edge computing helpers
    bool should_use_edge_computing(const HttpRequest& request) const;
    std::string get_optimal_edge_node(const HttpRequest& request);
    bool sync_data_with_edge_nodes();
};

// Utility functions
namespace Utils {
    std::string trim(const std::string& s);
    std::string tolower_str(std::string v);
    std::string toupper_str(std::string v);
    std::string format_price(int price_cents);
    std::string format_date(const std::string& date_str);
    std::string generate_uuid();
    std::string hash_password(const std::string& password);
    bool verify_password(const std::string& password, const std::string& hash);
    std::string generate_qr_code(const std::string& data);
    std::string send_whatsapp_message(const std::string& phone, const std::string& message);
    
    // Edge computing utilities
    std::string compress_data(const std::string& data);
    std::string decompress_data(const std::string& compressed_data);
    std::string generate_cache_key(const std::string& url, const std::map<std::string, std::string>& params);
    int calculate_load_score(int connections, int response_time, int cpu_usage);
    std::string get_client_ip_from_request(const HttpRequest& request);
    bool is_mobile_user_agent(const std::string& user_agent);
    
    // Performance utilities
    void set_thread_affinity(std::thread& thread, int cpu_core);
    void optimize_memory_pool(size_t initial_size, size_t max_size);
    void enable_turbo_boost(bool enable);
    int get_cpu_core_count();
    double get_memory_usage_percent();
}

// Main server function
int run_server(const Config& config);
