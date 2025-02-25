#!/bin/bash
cd ~/HuobzLang || exit 1
git add .
git commit -m "Auto-update: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main
echo "✅ HuobzLang repository updated successfully!"
