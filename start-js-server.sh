#!/bin/bash

# Start JavaScript server and Vite frontend in parallel using concurrently
# If concurrently is not installed, install it first
if ! command -v concurrently &> /dev/null
then
    echo "Installing concurrently..."
    npm install -g concurrently
fi

echo "Starting JavaScript server and Vite frontend..."
concurrently \
  "cd js-server && npm run dev" \
  "node start-frontend.js"