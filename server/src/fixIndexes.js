const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/school-os');
    console.log('Connected to MongoDB');

    const subjectsColl = mongoose.connection.db.collection('subjects');
    const classesColl = mongoose.connection.db.collection('classsections');
    
    console.log('Dropping old Subject index...');
    try {
      await subjectsColl.dropIndex('schoolId_1_name_1');
      console.log('Subject index dropped.');
    } catch (e) {
      console.log('Subject index not found or already dropped.');
    }

    console.log('Dropping old ClassSection index...');
    try {
      await classesColl.dropIndex('schoolId_1_branchId_1_academicYearId_1_grade_1_section_1');
      console.log('ClassSection index dropped.');
    } catch (e) {
      console.log('ClassSection index not found or already dropped.');
    }

    console.log('\nIndexes dropped. Mongoose will re-create them with partialFilterExpression on next startup.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixIndexes();
