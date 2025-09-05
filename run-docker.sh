#!/bin/bash

# Resume Docker Runner
# This script builds and runs the Jekyll resume site using Docker

set -e  # Exit on any error

echo "🏗️  Building Docker image..."
docker image build -t resume-template .

echo "🚀 Starting Jekyll server..."
echo "📱 Your resume will be available at: http://localhost:4000"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

# Run the container with proper port mapping and volume mounting
docker run --rm \
    --name resume-template \
    -p 4000:4000 \
    -v "$PWD":/home/app \
    --network host \
    resume-template

echo ""
echo "✅ Jekyll server stopped."
