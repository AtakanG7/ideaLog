/**
 * This file creates a Redis client and exports it as a module
 */

// Importing the necessary dependencies
import { createClient } from 'redis'; // Redis client library
import Config from '../../config/config.js'; // Configuration file

// Initializing the configuration file
const keyValt = new Config();

// Creating a new Redis client
const client = createClient({
  // Authentication options
  password: keyValt.REDIS_PASSWORD, // Redis password from config file
  socket: {
    host: keyValt.REDIS_HOST, // Redis host from config file
    port: keyValt.REDIS_PORT, // Redis port from config file
  },
});

// Connecting to the Redis server
client.connect()
  .then(() => {
    // If the connection is successful, log the event to the console
    console.log('Redis connected');
  })
  .catch((error) => {
    // If the connection fails, log the error to the console
    console.log('Redis connection error:', error);
  });

// Graceful shutdown event listeners
// Close Redis connection on SIGINT (Ctrl+C) or SIGTERM (kill command)
process.on('SIGINT', () => {
    console.log('Received SIGINT signal. Closing Redis connection...');
    client.quit();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal. Closing Redis connection...');
    client.quit();
    process.exit(0);
});

// Exporting the client so that it can be used in other files
export default client;
