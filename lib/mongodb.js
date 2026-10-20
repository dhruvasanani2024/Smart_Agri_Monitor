import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

function isUriConfigured(u) {
  if (!u) return false;
  if (u.includes('<db_password>') || u.includes('<password>') || u.includes('YOUR_MONGODB')) {
    return false;
  }
  return true;
}

let clientPromise;

if (!isUriConfigured(uri)) {
  // Provide a controlled promise with handled rejection so Node does not crash or spam terminal
  clientPromise = Promise.reject(
    new Error('MongoDB URI contains placeholder <db_password>. Please update your actual password in .env')
  );
  clientPromise.catch(() => {});
} else {
  let client;
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect().catch((err) => {
        console.warn('⚠️ MongoDB connection error:', err.message);
        throw err;
      });
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
}

export default clientPromise;
