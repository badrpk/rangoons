#include "rangoons.h"
#include <sstream>
#include <iomanip>
#include <random>
#include <chrono>
#include <ctime>
#include <algorithm>
#include <cctype>

namespace Utils {

std::string trim(const std::string& s) {
    size_t a = 0, b = s.size();
    while (a < b && (s[a] == ' ' || s[a] == '\t' || s[a] == '\r' || s[a] == '\n')) ++a;
    while (b > a && (s[b-1] == ' ' || s[b-1] == '\t' || s[b-1] == '\r' || s[b-1] == '\n')) --b;
    return s.substr(a, b-a);
}

std::string tolower_str(std::string v) {
    std::transform(v.begin(), v.end(), v.begin(), [](unsigned char c) { return std::tolower(c); });
    return v;
}

std::string toupper_str(std::string v) {
    std::transform(v.begin(), v.end(), v.begin(), [](unsigned char c) { return std::toupper(c); });
    return v;
}

std::string format_price(int price_cents) {
    std::ostringstream oss;
    oss << "Rs " << std::fixed << std::setprecision(2) << (price_cents / 100.0);
    return oss.str();
}

std::string format_date(const std::string& date_str) {
    if (date_str.empty()) return "";
    
    try {
        // Parse ISO timestamp format
        std::tm tm = {};
        std::istringstream ss(date_str);
        ss >> std::get_time(&tm, "%Y-%m-%dT%H:%M:%S");
        
        if (ss.fail()) {
            // Try alternative format
            ss.clear();
            ss.str(date_str);
            ss >> std::get_time(&tm, "%Y-%m-%d %H:%M:%S");
        }
        
        if (!ss.fail()) {
            std::ostringstream formatted;
            formatted << std::put_time(&tm, "%B %d, %Y at %I:%M %p");
            return formatted.str();
        }
    } catch (...) {
        // If parsing fails, return original
    }
    
    return date_str;
}

std::string generate_uuid() {
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

std::string hash_password(const std::string& password) {
    // Simple hash implementation - in production, use bcrypt or similar
    std::hash<std::string> hasher;
    std::ostringstream oss;
    oss << std::hex << hasher(password);
    return oss.str();
}

bool verify_password(const std::string& password, const std::string& hash) {
    return hash_password(password) == hash;
}

std::string generate_qr_code(const std::string& data) {
    // Simple QR code generation using ASCII art
    // In production, use a proper QR library like qrencode
    std::ostringstream qr;
    qr << "╔══════════════════════════════════════╗\n";
    qr << "║  QR Code for: " << data.substr(0, 20);
    if (data.length() > 20) qr << "...";
    else qr << std::string(20 - data.length(), ' ');
    qr << "  ║\n";
    qr << "║                                      ║\n";
    qr << "║  ████████████████████████████████████  ║\n";
    qr << "║  █ ▄▄▄▄▄ █▀█ █▄█▄█ ▄▄▄▄▄ █  ║\n";
    qr << "║  █ ███ ██ █▀▀▀█ ▀▄█ ███ ██ █  ║\n";
    qr << "║  █ ███ ██ █▀ █▀▀▀▀▀█ ███ ██ █  ║\n";
    qr << "║  █ ███ ██ █▀▄▀▀▀▀▀▀▄█ ███ ██ █  ║\n";
    qr << "║  █ ▄▄▄▄▄ █▀▀▀▀▀▀▀▀▀▀█ ▄▄▄▄▄ █  ║\n";
    qr << "║  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  ║\n";
    qr << "║                                      ║\n";
    qr << "║  Scan with WhatsApp to connect       ║\n";
    qr << "╚══════════════════════════════════════╝\n";
    
    return qr.str();
}

std::string send_whatsapp_message(const std::string& phone, const std::string& message) {
    // In production, integrate with WhatsApp Business API
    // For now, return a formatted message
    std::ostringstream result;
    result << "📱 WhatsApp Message Sent\n";
    result << "To: " << phone << "\n";
    result << "Message: " << message << "\n";
    result << "Status: Queued for delivery\n";
    result << "Note: WhatsApp integration requires API setup";
    
    return result.str();
}

// Additional utility functions
std::string html_escape(const std::string& s) {
    std::string out;
    out.reserve(s.size() + 8);
    
    for (unsigned char c : s) {
        switch (c) {
            case '&': out += "&amp;"; break;
            case '<': out += "&lt;"; break;
            case '>': out += "&gt;"; break;
            case '"': out += "&quot;"; break;
            case '\'': out += "&#39;"; break;
            default: out += c;
        }
    }
    
    return out;
}

std::string money_fmt(int cents) {
    std::ostringstream oss;
    oss << "Rs " << std::fixed << std::setprecision(2) << (cents / 100.0);
    return oss.str();
}

std::string parse_form(const std::string& body) {
    // Simple form parsing - in production, use a proper parser
    std::map<std::string, std::string> form_data;
    std::istringstream ss(body);
    std::string line;
    
    while (std::getline(ss, line)) {
        size_t equal_pos = line.find('=');
        if (equal_pos != std::string::npos) {
            std::string key = line.substr(0, equal_pos);
            std::string value = line.substr(equal_pos + 1);
            
            // URL decode
            key = url_decode(key);
            value = url_decode(value);
            
            form_data[key] = value;
        }
    }
    
    // Convert to string representation (simplified)
    std::ostringstream result;
    for (const auto& pair : form_data) {
        result << pair.first << "=" << pair.second << "&";
    }
    
    std::string result_str = result.str();
    if (!result_str.empty() && result_str.back() == '&') {
        result_str.pop_back();
    }
    
    return result_str;
}

std::string url_decode(const std::string& s) {
    std::string result;
    result.reserve(s.size());
    
    for (size_t i = 0; i < s.size(); ++i) {
        if (s[i] == '%' && i + 2 < s.size()) {
            int value;
            std::istringstream iss(s.substr(i + 1, 2));
            iss >> std::hex >> value;
            result += static_cast<char>(value);
            i += 2;
        } else if (s[i] == '+') {
            result += ' ';
        } else {
            result += s[i];
        }
    }
    
    return result;
}

std::string get_current_timestamp() {
    auto now = std::chrono::system_clock::now();
    auto time_t = std::chrono::system_clock::to_time_t(now);
    auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(
        now.time_since_epoch()) % 1000;
    
    std::ostringstream oss;
    oss << std::put_time(std::localtime(&time_t), "%Y-%m-%d %H:%M:%S");
    oss << '.' << std::setfill('0') << std::setw(3) << ms.count();
    
    return oss.str();
}

std::string generate_random_string(size_t length) {
    static const char charset[] = "0123456789"
                                 "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                                 "abcdefghijklmnopqrstuvwxyz";
    
    static std::random_device rd;
    static std::mt19937 gen(rd());
    static std::uniform_int_distribution<> dis(0, sizeof(charset) - 2);
    
    std::string result;
    result.reserve(length);
    
    for (size_t i = 0; i < length; ++i) {
        result += charset[dis(gen)];
    }
    
    return result;
}

bool is_valid_email(const std::string& email) {
    // Simple email validation
    if (email.empty()) return false;
    
    size_t at_pos = email.find('@');
    if (at_pos == std::string::npos || at_pos == 0) return false;
    
    size_t dot_pos = email.find('.', at_pos);
    if (dot_pos == std::string::npos || dot_pos == at_pos + 1) return false;
    
    if (dot_pos == email.length() - 1) return false;
    
    return true;
}

std::string sanitize_filename(const std::string& filename) {
    std::string result = filename;
    
    // Replace invalid characters
    const std::string invalid_chars = "<>:\"/\\|?*";
    for (char c : invalid_chars) {
        std::replace(result.begin(), result.end(), c, '_');
    }
    
    // Remove leading/trailing spaces and dots
    result = trim(result);
    while (result.back() == '.') {
        result.pop_back();
    }
    
    // Limit length
    if (result.length() > 255) {
        result = result.substr(0, 255);
    }
    
    return result;
}

} // namespace Utils
