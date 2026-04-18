const mongoose = require('mongoose');

async function checkIndexes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/school-os');
    console.log('Connected to MongoDB');

    const collections = ['subjects', 'classsections'];
    
    for (const collName of collections) {
      const indexes = await mongoose.connection.db.collection(collName).indexes();
      console.log(`\nIndexes for ${collName}:`);
      console.log(JSON.stringify(indexes, null, 2));
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkIndexes();
