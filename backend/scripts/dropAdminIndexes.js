require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function dropIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Drop all indexes except _id
    await Admin.collection.dropIndexes();
    console.log('Successfully dropped all indexes from Admin collection');

    // Create only the necessary indexes
    await Admin.collection.createIndex({ email: 1 }, { unique: true });
    console.log('Successfully created email index');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropIndexes();