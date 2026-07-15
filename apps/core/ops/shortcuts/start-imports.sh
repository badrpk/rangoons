#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
SESSION=rng-import
if tmux has-session -t "$SESSION" 2>/dev/null; then
  termux-toast "Importer already running"
  exit 0
fi
tmux new -d -s "$SESSION" '
  while true; do
    MARKUP=0.20 python ~/rangoons/core/tools/import_dir.py | tee ~/rangoons/core/tools/import.log
    COUNT=$(sqlite3 ~/rangoons/core/rangoons.db "SELECT COUNT(*) FROM products;")
    termux-toast "📦 Catalog updated: ${COUNT} items"
    sleep 600
  done
'
termux-toast "📥 Importer started"
