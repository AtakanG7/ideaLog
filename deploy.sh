#!/bin/bash

# Build the image
sudo docker build -t blog -f Dockerfile . --no-cache
if [ $? -ne 0 ]; then
    echo "Error: Docker build failed."
    exit 1
fi

# Tag the image
sudo docker tag blog atakan1927/blog
if [ $? -ne 0 ]; then
    echo "Error: Docker tag failed."
    exit 1
fi

# Send the image to Docker Hub
sudo docker push atakan1927/blog
if [ $? -ne 0 ]; then
    echo "Error: Docker push failed."
    exit 1
fi

# Trigger deployment on Render
wget -qO- https://api.render.com/deploy/srv-cqtifc5ds78s739ms430?key=iORcOVgbEOg
if [ $? -ne 0 ]; then
    echo "Error: Render deployment trigger failed."
    exit 1
fi

echo "Deployment triggered successfully on Render."
