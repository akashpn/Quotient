#!/bin/bash

# Install main project dependencies
echo "Installing main project dependencies..."
npm install

# Install JavaScript server dependencies
echo "Installing JavaScript server dependencies..."
cd js-server
npm install
cd ..

echo "Installation complete!"
echo ""
echo "To run the TypeScript server (default option):"
echo "npm run dev"
echo ""
echo "To run the JavaScript server:"
echo "1. In one terminal: cd js-server && npm run dev"
echo "2. In another terminal: node start-frontend.js"