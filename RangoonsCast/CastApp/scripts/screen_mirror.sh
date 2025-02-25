#!/bin/bash
ffmpeg -f x11grab -r 30 -s 1366x768 -i :0.0 -c:v libx264 -preset ultrafast -f mpegts udp://192.168.1.100:5000
