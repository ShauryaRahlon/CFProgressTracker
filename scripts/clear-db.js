const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function clearDB() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    const db = mongoose.connection.db;
    const students = await db.collection('students').deleteMany({});
    const contests = await db.collection('contests').deleteMany({});
    const performances = await db.collection('performances').deleteMany({});

    console.log(`🗑️  Deleted ${students.deletedCount} students`);
    console.log(`🗑️  Deleted ${contests.deletedCount} contests`);
    console.log(`🗑️  Deleted ${performances.deletedCount} performances`);

    await mongoose.disconnect();
    console.log('✅ Done');
}

clearDB().catch(console.error);
