import mongoose from 'mongoose';
import Config from '../config/config.js';

// Initializing the configuration file
const keyValt = new Config();

// Connecting to the database
const db = mongoose.connect(keyValt.MONGODB_DEPLOYMENT_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });

// Exporting the mongoose object
export default db;
