import mongoose from 'mongoose';
import Config from '../../config/config.js';

// Initializing the configuration file
const keyValt = new Config();

// Creating a new MongoDB connection
const db = mongoose.createConnection(keyValt.MONGODB_DEPLOYMENT_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connection events
db.on('connected', () => {
  console.log('Connected to MongoDB');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

// Graceful shutdown event listeners
// Close MongoDB connection on SIGINT (Ctrl+C) or SIGTERM (kill command)
process.on('SIGINT', () => {
  console.log('Received SIGINT signal. Closing MongoDB connection...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Closing MongoDB connection...');
  db.close();
  process.exit(0);
});

// Exporting the connection object
export default db;