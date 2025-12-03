#!/bin/bash

# --- Development Environment Startup Script ---
# This script starts MongoDB, the backend, and the frontend in separate terminal tabs.

# Function to clean up all background processes on exit
cleanup() {
    echo ""
    echo "🚨 Shutting down all services..."
    
    # Kill all background jobs started by this script's sub-shells
    # The pgrep command is more robust for finding child processes of the script
    pkill -P $$
    
    # Ensure MongoDB service is stopped
    brew services stop mongodb-community@7.0
    
    echo "✅ Cleanup complete. All services stopped."
    exit 0
}

# Trap Ctrl+C (SIGINT) and call the cleanup function
trap cleanup INT

echo "🚀 Starting development environment..."

# --- Step 1: Start MongoDB ---
echo "[1/3] Starting MongoDB service..."
brew services start mongodb-community@7.0
# Give the service a moment to initialize
sleep 3
echo "✅ MongoDB service started."

# --- Step 2: Start Backend in a new tab ---
echo "[2/3] Starting Backend server in a new tab..."
osascript <<EOD
tell application "Terminal"
    do script "cd '$(pwd)/anpr-backend' && source ../venv/bin/activate && echo '✅ Backend environment activated.' && uvicorn app:app --reload"
end tell
EOD

# --- Step 3: Start Frontend in a new tab ---
echo "[3/3] Starting Frontend server in a new tab..."
osascript <<EOD
tell application "Terminal"
    do script "cd '$(pwd)/anpr-frontend/ANPR' && echo '✅ Frontend directory reached.' && npm run dev"
end tell
EOD

echo ""
echo "🎉 All services are starting in new tabs."
echo "👉 This terminal window is now the master controller."
echo "🔴 Press [CTRL+C] in THIS window to shut down everything."

# Wait indefinitely, keeping the script alive so the trap can work
wait
