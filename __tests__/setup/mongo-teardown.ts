import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
  var __MONGOD__: MongoMemoryServer;
}

module.exports = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }
  console.log('\nMongoDB Memory Server stopped.');
};