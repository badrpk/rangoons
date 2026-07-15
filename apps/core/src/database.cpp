#include "rangoons.h"
#include <libpq-fe.h>
#include <sstream>
#include <iostream>
#include <sstream>
#include <iomanip>
#include <chrono>
#include <ctime>

// PostgreSQL connection wrapper
class PGConnection {
public:
    PGConnection() : conn(nullptr) {}
    ~PGConnection() { close(); }
    
    bool open(const std::string& host, const std::string& dbname, 
              const std::string& user, const std::string& password, int port) {
        close();
        
        std::ostringstream conninfo;
        conninfo << "host=" << host 
                << " dbname=" << dbname 
                << " user=" << user 
                << " password=" << password 
                << " port=" << port;
        
        conn = PQconnectdb(conninfo.str().c_str());
        return PQstatus(conn) == CONNECTION_OK;
    }
    
    void close() {
        if (conn) {
            PQfinish(conn);
            conn = nullptr;
        }
    }
    
    bool is_connected() const {
        return conn && PQstatus(conn) == CONNECTION_OK;
    }
    
    PGresult* exec(const std::string& query) {
        if (!is_connected()) return nullptr;
        return PQexec(conn, query.c_str());
    }
    
    PGresult* exec_params(const std::string& query, int n_params, 
                          const char* const* param_values, 
                          const int* param_lengths, const int* param_formats) {
        if (!is_connected()) return nullptr;
        return PQexecParams(conn, query.c_str(), n_params, nullptr, 
                           param_values, param_lengths, param_formats, 0);
    }
    
    int get_last_insert_id() {
        if (!is_connected()) return 0;
        
        PGresult* result = exec("SELECT LASTVAL()");
        if (!result || PQresultStatus(result) != PGRES_TUPLES_OK) {
            PQclear(result);
            return 0;
        }
        
        int id = std::stoi(PQgetvalue(result, 0, 0));
        PQclear(result);
        return id;
    }
    
    std::string get_last_error() const {
        if (!conn) return "No connection";
        return PQerrorMessage(conn);
    }

private:
    PGconn* conn;
};

// DB implementation
DB::DB() : handle(nullptr), connected(false) {
    handle = new PGConnection();
}

DB::~DB() {
    close();
}

bool DB::open(const std::string& connection_string) {
    // Parse connection string: host:port:dbname:user:password
    std::istringstream ss(connection_string);
    std::string host, port_str, dbname, user, password;
    
    std::getline(ss, host, ':');
    std::getline(ss, port_str, ':');
    std::getline(ss, dbname, ':');
    std::getline(ss, user, ':');
    std::getline(ss, password, ':');
    
    int port = port_str.empty() ? 5432 : std::stoi(port_str);
    
    PGConnection* pg = static_cast<PGConnection*>(handle);
    connected = pg->open(host, dbname, user, password, port);
    
    if (connected) {
        std::cout << "✅ Connected to PostgreSQL database: " << dbname << std::endl;
    } else {
        std::cerr << "❌ Failed to connect to PostgreSQL: " << pg->get_last_error() << std::endl;
    }
    
    return connected;
}

void DB::close() {
    if (handle) {
        PGConnection* pg = static_cast<PGConnection*>(handle);
        pg->close();
        connected = false;
    }
}

bool DB::is_open() const {
    return connected;
}

bool DB::init_schema(std::string* err) {
    if (!is_open()) {
        if (err) *err = "Database not connected";
        return false;
    }
    
    PGConnection* pg = static_cast<PGConnection*>(handle);
    
    const char* schema_sql = R"(
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            handle VARCHAR(255) UNIQUE NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT '',
            vendor VARCHAR(100) DEFAULT '',
            category VARCHAR(100) DEFAULT '',
            tags TEXT DEFAULT '',
            published BOOLEAN DEFAULT true,
            sku VARCHAR(100) DEFAULT '',
            stock INTEGER DEFAULT 0,
            price_cents INTEGER NOT NULL,
            compare_price_cents INTEGER DEFAULT 0,
            image_url TEXT DEFAULT '',
            weight_grams INTEGER DEFAULT 0,
            option1_name VARCHAR(100) DEFAULT '',
            option1_value VARCHAR(100) DEFAULT '',
            option2_name VARCHAR(100) DEFAULT '',
            option2_value VARCHAR(100) DEFAULT '',
            option3_name VARCHAR(100) DEFAULT '',
            option3_value VARCHAR(100) DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS product_stats (
            product_id INTEGER PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
            sold_count INTEGER DEFAULT 0,
            view_count INTEGER DEFAULT 0,
            like_count INTEGER DEFAULT 0
        );
        
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            image_url TEXT,
            parent_id INTEGER REFERENCES categories(id),
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS carts (
            cart_id VARCHAR(100) PRIMARY KEY,
            user_id VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS cart_items (
            cart_id VARCHAR(100) NOT NULL,
            product_id INTEGER NOT NULL,
            qty INTEGER NOT NULL,
            selected_options JSONB DEFAULT '{}',
            PRIMARY KEY (cart_id, product_id),
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            cart_id VARCHAR(100) NOT NULL,
            customer_name VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            email VARCHAR(255),
            address TEXT NOT NULL,
            city VARCHAR(100),
            postal_code VARCHAR(20),
            country VARCHAR(100) DEFAULT 'Pakistan',
            total_cents INTEGER NOT NULL,
            shipping_cents INTEGER DEFAULT 0,
            tax_cents INTEGER DEFAULT 0,
            status VARCHAR(50) DEFAULT 'pending',
            payment_status VARCHAR(50) DEFAULT 'pending',
            whatsapp_sent BOOLEAN DEFAULT FALSE,
            tracking_number VARCHAR(100),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
            product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
            quantity INTEGER DEFAULT 1,
            price_cents INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_products_handle ON products(handle);
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        CREATE INDEX IF NOT EXISTS idx_products_published ON products(published);
        CREATE INDEX IF NOT EXISTS idx_products_price ON products(price_cents);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
    )";
    
    PGresult* result = pg->exec(schema_sql);
    if (!result || PQresultStatus(result) != PGRES_COMMAND_OK) {
        if (err) *err = pg->get_last_error();
        PQclear(result);
        return false;
    }
    
    PQclear(result);
    std::cout << "✅ Database schema initialized successfully" << std::endl;
    return true;
}

bool DB::create_product(const Product& p, int* out_id, std::string* err) {
    if (!is_open()) {
        if (err) *err = "Database not connected";
        return false;
    }
    
    PGConnection* pg = static_cast<PGConnection*>(handle);
    
    const char* sql = R"(
        INSERT INTO products (
            handle, title, description, vendor, category, tags, published,
            sku, stock, price_cents, compare_price_cents, image_url,
            weight_grams, option1_name, option1_value, option2_name,
            option2_value, option3_name, option3_value
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    )";
    
    const char* param_values[19] = {
        p.handle.c_str(), p.title.c_str(), p.description.c_str(), p.vendor.c_str(),
        p.category.c_str(), p.tags.c_str(), p.published ? "true" : "false",
        p.sku.c_str(), std::to_string(p.stock).c_str(), std::to_string(p.price_cents).c_str(),
        std::to_string(p.compare_price_cents).c_str(), p.image_url.c_str(),
        std::to_string(p.weight_grams).c_str(), p.option1_name.c_str(), p.option1_value.c_str(),
        p.option2_name.c_str(), p.option2_value.c_str(), p.option3_name.c_str(), p.option3_value.c_str()
    };
    
    PGresult* result = pg->exec_params(sql, 19, param_values, nullptr, nullptr);
    if (!result || PQresultStatus(result) != PGRES_COMMAND_OK) {
        if (err) *err = pg->get_last_error();
        PQclear(result);
        return false;
    }
    
    if (out_id) {
        *out_id = pg->get_last_insert_id();
    }
    
    PQclear(result);
    return true;
}

std::vector<Product> DB::list_products(const std::string& category, int limit, int offset) {
    std::vector<Product> products;
    if (!is_open()) return products;
    
    PGConnection* pg = static_cast<PGConnection*>(handle);
    
    std::string sql = "SELECT id, handle, title, description, vendor, category, tags, published, "
                      "sku, stock, price_cents, compare_price_cents, image_url, weight_grams, "
                      "option1_name, option1_value, option2_name, option2_value, option3_name, option3_value, "
                      "created_at FROM products WHERE published = true";
    
    if (!category.empty()) {
        sql += " AND category = $1";
    }
    
    sql += " ORDER BY created_at DESC";
    
    if (limit > 0) {
        sql += " LIMIT " + std::to_string(limit);
        if (offset > 0) {
            sql += " OFFSET " + std::to_string(offset);
        }
    }
    
    PGresult* result;
    if (category.empty()) {
        result = pg->exec(sql);
    } else {
        const char* param_values[1] = { category.c_str() };
        result = pg->exec_params(sql, 1, param_values, nullptr, nullptr);
    }
    
    if (!result || PQresultStatus(result) != PGRES_TUPLES_OK) {
        PQclear(result);
        return products;
    }
    
    int rows = PQntuples(result);
    for (int i = 0; i < rows; i++) {
    Product p;
        p.id = std::stoi(PQgetvalue(result, i, 0));
        p.handle = PQgetvalue(result, i, 1);
        p.title = PQgetvalue(result, i, 2);
        p.description = PQgetvalue(result, i, 3);
        p.vendor = PQgetvalue(result, i, 4);
        p.category = PQgetvalue(result, i, 5);
        p.tags = PQgetvalue(result, i, 6);
        p.published = (std::string(PQgetvalue(result, i, 7)) == "t");
        p.sku = PQgetvalue(result, i, 8);
        p.stock = std::stoi(PQgetvalue(result, i, 9));
        p.price_cents = std::stoi(PQgetvalue(result, i, 10));
        p.compare_price_cents = std::stoi(PQgetvalue(result, i, 11));
        p.image_url = PQgetvalue(result, i, 12);
        p.weight_grams = std::stoi(PQgetvalue(result, i, 13));
        p.option1_name = PQgetvalue(result, i, 14);
        p.option1_value = PQgetvalue(result, i, 15);
        p.option2_name = PQgetvalue(result, i, 16);
        p.option2_value = PQgetvalue(result, i, 17);
        p.option3_name = PQgetvalue(result, i, 18);
        p.option3_value = PQgetvalue(result, i, 19);
        p.created_at = PQgetvalue(result, i, 20);
        
        products.push_back(p);
    }
    
    PQclear(result);
    return products;
}

bool DB::import_products_from_csv(const std::string& csv_data, std::string* err) {
    if (!is_open()) {
        if (err) *err = "Database not connected";
        return false;
    }
    
    PGConnection* pg = static_cast<PGConnection*>(handle);
    
    // Clear existing products first
    PGresult* clear_result = pg->exec("DELETE FROM products");
    if (!clear_result || PQresultStatus(clear_result) != PGRES_COMMAND_OK) {
        if (err) *err = "Failed to clear existing products: " + pg->get_last_error();
        PQclear(clear_result);
        return false;
    }
    PQclear(clear_result);
    
    // Parse CSV and insert products
    std::istringstream csv_stream(csv_data);
    std::string line;
    int line_num = 0;
    int inserted = 0;
    
    while (std::getline(csv_stream, line)) {
        line_num++;
        if (line_num == 1) continue; // Skip header
        
        std::istringstream line_stream(line);
        std::string field;
        std::vector<std::string> fields;
        
        while (std::getline(line_stream, field, ',')) {
            fields.push_back(field);
        }
        
        if (fields.size() < 5) continue; // Skip invalid lines
        
        Product p;
        p.handle = fields[0];
        p.title = fields[1];
        p.description = fields.size() > 2 ? fields[2] : "";
        p.price_cents = std::stoi(fields[3]) * 100; // Convert to cents
        p.stock = std::stoi(fields[4]);
        p.category = fields.size() > 5 ? fields[5] : "General";
        p.image_url = fields.size() > 6 ? fields[6] : "";
        
        if (!create_product(p, nullptr, err)) {
            return false;
        }
        inserted++;
    }
    
    std::cout << "✅ Imported " << inserted << " products from CSV" << std::endl;
    return true;
}

std::string DB::export_database(std::string* err) {
    if (!is_open()) {
        if (err) *err = "Database not connected";
        return "";
    }
    
    PGConnection* pg = static_cast<PGConnection*>(handle);
    
    // Export products
    std::ostringstream export_sql;
    export_sql << "-- Rangoons Database Export\n";
    export_sql << "-- Generated: " << std::chrono::system_clock::now().time_since_epoch().count() << "\n\n";
    
    // Get all products
    std::vector<Product> products = list_products();
    for (const auto& p : products) {
        export_sql << "INSERT INTO products (handle, title, description, vendor, category, tags, "
                   << "published, sku, stock, price_cents, compare_price_cents, image_url, "
                   << "weight_grams, option1_name, option1_value, option2_name, option2_value, "
                   << "option3_name, option3_value) VALUES ("
                   << "'" << Utils::json_escape(p.handle) << "', "
                   << "'" << Utils::json_escape(p.title) << "', "
                   << "'" << Utils::json_escape(p.description) << "', "
                   << "'" << Utils::json_escape(p.vendor) << "', "
                   << "'" << Utils::json_escape(p.category) << "', "
                   << "'" << Utils::json_escape(p.tags) << "', "
                   << (p.published ? "true" : "false") << ", "
                   << "'" << Utils::json_escape(p.sku) << "', "
                   << p.stock << ", "
                   << p.price_cents << ", "
                   << p.compare_price_cents << ", "
                   << "'" << Utils::json_escape(p.image_url) << "', "
                   << p.weight_grams << ", "
                   << "'" << Utils::json_escape(p.option1_name) << "', "
                   << "'" << Utils::json_escape(p.option1_value) << "', "
                   << "'" << Utils::json_escape(p.option2_name) << "', "
                   << "'" << Utils::json_escape(p.option2_value) << "', "
                   << "'" << Utils::json_escape(p.option3_name) << "', "
                   << "'" << Utils::json_escape(p.option3_value) << "');\n";
    }
    
    return export_sql.str();
}

// Additional database methods would be implemented here...
bool DB::update_product(const Product& p, std::string* err) { /* Implementation */ return true; }
bool DB::delete_product(int id, std::string* err) { /* Implementation */ return true; }
Product DB::get_product(int id, std::string* err) { /* Implementation */ return Product(); }
std::vector<Product> DB::search_products(const std::string& query, int limit, int offset) { /* Implementation */ return std::vector<Product>(); }
int DB::get_product_count(const std::string& category) { /* Implementation */ return 0; }
bool DB::create_category(const Category& c, int* out_id, std::string* err) { /* Implementation */ return true; }
std::vector<Category> DB::list_categories() { /* Implementation */ return std::vector<Category>(); }
bool DB::create_order(const Order& o, int* out_id, std::string* err) { /* Implementation */ return true; }
bool DB::update_order_status(int order_id, const std::string& status, std::string* err) { /* Implementation */ return true; }
std::vector<Order> DB::list_orders(int limit, int offset) { /* Implementation */ return std::vector<Order>(); }
Order DB::get_order(int id, std::string* err) { /* Implementation */ return Order(); }
bool DB::create_cart(const Cart& c, std::string* err) { /* Implementation */ return true; }
bool DB::add_to_cart(const CartItem& item, std::string* err) { /* Implementation */ return true; }
bool DB::remove_from_cart(const std::string& cart_id, int product_id, std::string* err) { /* Implementation */ return true; }
std::vector<CartItem> DB::get_cart_items(const std::string& cart_id, std::string* err) { /* Implementation */ return std::vector<CartItem>(); }
bool DB::update_product_stats(int product_id, const std::string& stat_type, int value, std::string* err) { /* Implementation */ return true; }
ProductStats DB::get_product_stats(int product_id, std::string* err) { /* Implementation */ return ProductStats(); }
