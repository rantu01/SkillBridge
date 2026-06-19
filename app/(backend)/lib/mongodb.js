import dns from 'node:dns';
import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is missing');
    }

    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (dnsError) {
      console.warn('Failed to set public DNS servers, falling back to system defaults:', dnsError.message);
    }

    mongoose.set('strictQuery', true);

    const options = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, options);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;