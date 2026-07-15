#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
cd ~/rangoons/core
export ADMIN_KEY=secret123
tmux has-session -t rangoons 2>/dev/null || tmux new -d -s rangoons './bin/rangoons >> ~/rangoons.log 2>&1'
termux-toast "🚀 RangoonsCore started"
