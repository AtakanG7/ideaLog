# Use the official Node.js image as the base image
FROM node

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json from the parent directory
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code from the parent directory
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]