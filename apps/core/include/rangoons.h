#pragma once
#include <string>
#include <vector>
#include <optional>
#include <unordered_map>

struct Product {
    int id = 0;
    std::string name;
    std::string description;
    int price_cents = 0;
    int stock = 0;
    std::string image_url;
};

struct CartItem {
    int product_id = 0;
    int qty = 0;
    std::string name;
    int price_cents = 0;
};

struct Order {
    int id = 0;
    std::string cart_id;
    std::string customer_name;
    std::string phone;
    std::string address;
    int total_cents = 0;
};

struct DB {
    void* handle = nullptr;
    bool open(const std::string& path);
    void close();
    bool init_schema(std::string* err=nullptr);

    bool create_product(const Product& p, int* out_id=nullptr, std::string* err=nullptr);
    std::vector<Product> list_products();
    std::optional<Product> get_product(int id);
    bool delete_product(int id, std::string* err=nullptr);

    bool ensure_cart(const std::string& cart_id);
    bool add_to_cart(const std::string& cart_id, int product_id, int qty, std::string* err=nullptr);
    std::vector<CartItem> get_cart_items(const std::string& cart_id);
    bool clear_cart(const std::string& cart_id);

    bool create_order(const Order& o, int* out_id=nullptr, std::string* err=nullptr);
};

std::string url_decode(const std::string& s);
std::unordered_map<std::string,std::string> parse_form(const std::string& body);
std::unordered_map<std::string,std::string> parse_cookies(const std::string& cookie_header);
std::string html_escape(const std::string& s);
std::string gen_cart_id();
std::string money_fmt(int cents);

struct Config {
    std::string db_path = "rangoons.db";
    std::string host = "0.0.0.0";
    unsigned short port = 8080;
    std::string admin_key = "";
};

int run_server(const Config& cfg);
