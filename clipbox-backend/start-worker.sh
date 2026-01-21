#!/bin/sh
# Start a simple HTTP server to satisfy Render's port requirement
# using python (since we switched to the fat node image which has python)
python3 -m http.server $PORT &

# Start the worker process
echo "Starting Dedicated Worker Process..."
npm run worker
