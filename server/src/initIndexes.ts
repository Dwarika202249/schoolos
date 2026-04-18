const mongoose = require('mongoose');
const path = require('path');

// Mocking environment for models
process.env.NODE_ENV = 'development';

async function triggerInit() {
  try {
    await mongoose.connect('mongodb://localhost:27017/school-os');
    console.log('Connected to MongoDB');

    // Manually register models if they haven't been
    require('./models/Subject.model');
    require('./models/ClassSection.model');

    const Subject = mongoose.model('Subject');
    const ClassSection = mongoose.model('ClassSection');

    console.log('Initializing Subject model indexes...');
    await Subject.init();
    console.log('Initializing ClassSection model indexes...');
    await ClassSection.init();

    console.log('Indexes should now be created. Verifying...');
    const subjects = await mongoose.connection.db.collection('subjects').indexes();
    const classes = await mongoose.connection.db.collection('classsections').indexes();

    console.log('SUBJECTS:', JSON.stringify(subjects, null, 2));
    console.log('CLASSES:', JSON.stringify(classes, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

triggerInit();
