#!/data/data/com.termux/files/usr/bin/bash
tmux kill-session -t rng-import 2>/dev/null
termux-wake-unlock
termux-toast "🛑 Importer stopped"
