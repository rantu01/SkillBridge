import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    // console.log("Using existing MongoDB connection"); // Optional: logic check
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB Connected Successfully!"); // <--- Eta add koro
      return mongoose;
    }).catch((err) => {
      console.error("❌ MongoDB Connection Error:", err); // <--- Error hole eta dekhabe
      throw err;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;