import mongoose from 'mongoose';
import Config from '../../config/config.js';

const keyValt = new Config();

const db = mongoose.createConnection(keyValt.MONGODB_DEPLOYMENT_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db.on('connected', () => {
  console.log('Connected to MongoDB');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

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

export default db;