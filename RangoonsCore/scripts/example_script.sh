#!/bin/bash
echo "Starting Huobz API..."
uvicorn ../api/api:app --reload --port 8000 &
echo "Starting Blockchain Interaction Script..."
python ../blockchain/huobzcoins.py
