import mongoose from 'mongoose';
import Config from '../../config/config.js';

const keyValt = new Config();

const image_server_db = mongoose.createConnection(keyValt.MONGODB_IMAGE_SERVER_DEPLOYMENT_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

image_server_db.on('connected', () => {
  console.log('Connected to Image Server MongoDB');
});

image_server_db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

image_server_db.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT signal. Closing MongoDB connection...');
  image_server_db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Closing MongoDB connection...');
  image_server_db.close();
  process.exit(0);
});

export default image_server_db;