#!/bin/bash

# Check if conda is installed
if ! command -v conda &> /dev/null; then
    echo "Conda is not installed. Please install Miniconda or Anaconda first."
    exit 1
fi

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "FFmpeg is not installed. Please install it first."
    echo "On macOS: brew install ffmpeg"
    echo "On Ubuntu/Debian: sudo apt-get install ffmpeg"
    exit 1
fi

# Create and activate conda environment
echo "Creating conda environment..."
conda env create -f environment.yml

# Activate the environment
echo "Activating conda environment..."
source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate whisper-env

# Run the API server
echo "Starting Whisper API server..."
python app.py 