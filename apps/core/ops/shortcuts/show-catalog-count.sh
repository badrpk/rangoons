#!/data/data/com.termux/files/usr/bin/bash
COUNT=$(sqlite3 ~/rangoons/core/rangoons.db "SELECT COUNT(*) FROM products;")
termux-toast "🛍️ Items available: ${COUNT}"
