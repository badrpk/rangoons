#!/data/data/com.termux/files/usr/bin/bash
tmux kill-session -t rangoons 2>/dev/null
termux-wake-unlock
termux-toast "🛑 RangoonsCore stopped"
