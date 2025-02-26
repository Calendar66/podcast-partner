#!/bin/bash

# Display a welcome message
echo "Starting LearnEnglish application..."
echo "This will start both the React frontend and the Whisper API server"
echo "-------------------------------------------------------------"

# Start the Whisper API server in the background
echo "Starting Whisper API server..."
cd whisper-api
./setup_and_run.sh &
WHISPER_PID=$!
cd ..

# Give the Whisper API server a moment to start
sleep 2

# Start the React application
echo "Starting React frontend..."
cd learn-english
npm start &
REACT_PID=$!

# Function to handle script termination
cleanup() {
  echo "Shutting down services..."
  kill $WHISPER_PID $REACT_PID 2>/dev/null
  exit 0
}

# Set up trap to catch termination signals
trap cleanup SIGINT SIGTERM

# Keep the script running
echo "Both services are now running!"
echo "Press Ctrl+C to stop all services"
wait 