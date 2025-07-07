import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  (global as any).__MONGOD__ = mongod;
  process.env.MONGO_URI = uri;
  await mongoose.connect(uri);
  console.log('\nMongoDB Memory Server started at:', uri);
};