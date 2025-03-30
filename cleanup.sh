#!/bin/bash

# This script cleans up temporary files and directories

# Clean up temp directories
echo "Cleaning up temporary directories..."
rm -rf js-server/temp

# Clean up node_modules (optional, uncomment if needed)
# echo "Removing node_modules (this will require reinstallation)..."
# rm -rf node_modules
# rm -rf js-server/node_modules

echo "Cleanup complete!"