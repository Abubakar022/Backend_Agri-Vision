// cleanup-phone-index.js
require('dotenv').config();
const mongoose = require('mongoose');

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const db = mongoose.connection.db;
  const collection = db.collection('users');
  
  // Drop the phone index
  try {
    await collection.dropIndex('phone_1');
    console.log('✅ Removed old phone index');
  } catch (err) {
    console.log('ℹ️ Phone index already removed or never existed');
  }
  
  // Check current indexes
  const indexes = await collection.indexes();
  console.log('\n📊 Current indexes after cleanup:');
  indexes.forEach((idx, i) => {
    console.log(`${i}. ${JSON.stringify(idx.key)} - ${idx.name}`);
  });
  
  await mongoose.disconnect();
}

cleanup().catch(console.error);