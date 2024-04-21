# Build the image
docker build -t blog  -f .\Dockerfile . --no-cache
# Tag the image
docker tag blog atakan1927/blog
# Send the image
docker push atakan1927/blog
# Trigger deployment
wget https://api.render.com/deploy/srv-coigpd5jm4es739nrnqg?key=XLnl4UZeQV8