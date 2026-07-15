#include "rangoons.h"
#include <cstdlib>
#include <iostream>

static std::string getenv_str(const char* k, const std::string& def="") {
    const char* v = std::getenv(k);
    return v ? std::string(v) : def;
}

static int getenv_int(const char* k, int def=0) {
    const char* v = std::getenv(k);
    return v ? std::stoi(v) : def;
}

static bool getenv_bool(const char* k, bool def=false) {
    const char* v = std::getenv(k);
    if (!v) return def;
    std::string val = v;
    return val == "true" || val == "1" || val == "yes" || val == "on";
}

int main() {
    Config cfg;
    
    // Database configuration
    cfg.db_host = getenv_str("DB_HOST", "localhost");
    cfg.db_name = getenv_str("DB_NAME", "rangoons");
    cfg.db_user = getenv_str("DB_USER", "postgres");
    cfg.db_password = getenv_str("DB_PASSWORD", "Karachi5846$");
    cfg.db_port = getenv_int("DB_PORT", 5432);
    
    // Server configuration
    cfg.host = getenv_str("RANGOONS_HOST", "0.0.0.0");
    cfg.port = (unsigned short)getenv_int("RANGOONS_PORT", 8080);
    cfg.admin_key = getenv_str("ADMIN_KEY", "");
    cfg.whatsapp_number = getenv_str("WHATSAPP_NUMBER", "923001555681");

    // Edge computing configuration
    cfg.enable_edge_computing = getenv_bool("ENABLE_EDGE_COMPUTING", true);
    cfg.edge_cache_size_mb = getenv_int("EDGE_CACHE_SIZE_MB", 512);
    cfg.max_concurrent_connections = getenv_int("MAX_CONCURRENT_CONNECTIONS", 10000);
    cfg.enable_compression = getenv_bool("ENABLE_COMPRESSION", true);
    cfg.enable_http2 = getenv_bool("ENABLE_HTTP2", false);
    
    // Performance tuning
    cfg.worker_threads = getenv_int("WORKER_THREADS", 4);
    cfg.connection_pool_size = getenv_int("CONNECTION_POOL_SIZE", 100);
    cfg.request_buffer_size = getenv_int("REQUEST_BUFFER_SIZE", 8192);
    cfg.response_buffer_size = getenv_int("RESPONSE_BUFFER_SIZE", 16384);
    cfg.enable_keep_alive = getenv_bool("ENABLE_KEEP_ALIVE", true);
    cfg.keep_alive_timeout = getenv_int("KEEP_ALIVE_TIMEOUT", 30);

    // Configure edge nodes for load balancing
    cfg.load_balancer.strategy = getenv_str("LOAD_BALANCER_STRATEGY", "least_connections");
    cfg.load_balancer.health_check_interval_ms = getenv_int("HEALTH_CHECK_INTERVAL_MS", 5000);
    cfg.load_balancer.max_failures = getenv_int("MAX_FAILURES", 3);
    cfg.load_balancer.auto_failover = getenv_bool("AUTO_FAILOVER", true);

    // Primary server node (this computer)
    EdgeNode primary_node;
    primary_node.id = "primary-server";
    primary_node.name = "Primary C++ Server";
    primary_node.ip = cfg.host;
    primary_node.port = cfg.port;
    primary_node.type = "primary";
    primary_node.active = true;
    primary_node.load_score = 0; // Best score
    primary_node.response_time_ms = 0;
    primary_node.active_connections = 0;
    primary_node.healthy = true;
    cfg.load_balancer.nodes.push_back(primary_node);

    // Vivo mobile edge node
    EdgeNode vivo_node;
    vivo_node.id = "vivo-mobile";
    vivo_node.name = "Vivo Mobile Edge";
    vivo_node.ip = getenv_str("VIVO_MOBILE_IP", "192.168.18.22");
    vivo_node.port = getenv_int("VIVO_MOBILE_PORT", 8081);
    vivo_node.type = "vivo";
    vivo_node.active = getenv_bool("VIVO_MOBILE_ACTIVE", true);
    vivo_node.load_score = 25; // Good score
    vivo_node.response_time_ms = 50;
    vivo_node.active_connections = 0;
    vivo_node.healthy = true;
    cfg.load_balancer.nodes.push_back(vivo_node);

    // Samsung mobile edge node
    EdgeNode samsung_node;
    samsung_node.id = "samsung-mobile";
    samsung_node.name = "Samsung Mobile Edge";
    samsung_node.ip = getenv_str("SAMSUNG_MOBILE_IP", "192.168.18.160");
    samsung_node.port = getenv_int("SAMSUNG_MOBILE_PORT", 8082);
    samsung_node.type = "samsung";
    samsung_node.active = getenv_bool("SAMSUNG_MOBILE_ACTIVE", true);
    samsung_node.load_score = 30; // Good score
    samsung_node.response_time_ms = 60;
    samsung_node.active_connections = 0;
    samsung_node.healthy = true;
    cfg.load_balancer.nodes.push_back(samsung_node);

    std::cout << "🚀 Starting Rangoons C++ E-commerce Server with Edge Computing..." << std::endl;
    std::cout << "📊 Database: " << cfg.db_host << ":" << cfg.db_port << "/" << cfg.db_name << std::endl;
    std::cout << "🌐 Server: " << cfg.host << ":" << cfg.port << std::endl;
    std::cout << "📱 WhatsApp: " << cfg.whatsapp_number << std::endl;
    
    if (cfg.enable_edge_computing) {
        std::cout << "🔧 Edge Computing: ENABLED" << std::endl;
        std::cout << "📱 Edge Nodes:" << std::endl;
        std::cout << "   • Primary: " << primary_node.ip << ":" << primary_node.port << " (C++ High-Perf)" << std::endl;
        std::cout << "   • Vivo: " << vivo_node.ip << ":" << vivo_node.port << " (Mobile Edge)" << std::endl;
        std::cout << "   • Samsung: " << samsung_node.ip << ":" << samsung_node.port << " (Mobile Edge)" << std::endl;
        std::cout << "⚡ Load Balancer: " << cfg.load_balancer.strategy << std::endl;
        std::cout << "💾 Cache Size: " << cfg.edge_cache_size_mb << " MB" << std::endl;
        std::cout << "🧵 Worker Threads: " << cfg.worker_threads << std::endl;
        std::cout << "🔗 Max Connections: " << cfg.max_concurrent_connections << std::endl;
    } else {
        std::cout << "🔧 Edge Computing: DISABLED" << std::endl;
    }
    
    if (cfg.admin_key.empty()) {
        std::cout << "⚠️  WARNING: ADMIN_KEY not set. Admin panel will be locked." << std::endl;
    }

    std::cout << "\n🎯 Performance Features:" << std::endl;
    std::cout << "   • Compression: " << (cfg.enable_compression ? "ON" : "OFF") << std::endl;
    std::cout << "   • Keep-Alive: " << (cfg.enable_keep_alive ? "ON" : "OFF") << std::endl;
    std::cout << "   • HTTP/2: " << (cfg.enable_http2 ? "ON" : "OFF") << std::endl;
    std::cout << "   • Buffer Size: " << cfg.request_buffer_size << "/" << cfg.response_buffer_size << " bytes" << std::endl;

    return run_server(cfg);
}
