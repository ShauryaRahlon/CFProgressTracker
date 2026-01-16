require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env file');
    process.exit(1);
}

console.log('Connecting to MongoDB...');
console.log('URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB connected successfully');

        const AllowedEmailSchema = new mongoose.Schema({
            email: { type: String, required: true, unique: true },
            role: { type: String, enum: ['admin', 'user'], default: 'user' },
        }, { timestamps: true });

        const AllowedEmail = mongoose.models.AllowedEmail || mongoose.model('AllowedEmail', AllowedEmailSchema);

        const adminEmail = 'shauryagoyal1404@gmail.com';

        // Check if email already exists
        const existing = await AllowedEmail.findOne({ email: adminEmail });

        if (existing) {
            console.log(`✅ Email ${adminEmail} already exists with role: ${existing.role}`);
            process.exit(0);
        }

        // Add the admin email
        await AllowedEmail.create({
            email: adminEmail,
            role: 'admin',
        });

        console.log(`✅ Successfully added ${adminEmail} as admin!`);
        console.log('You can now sign in using either Google OAuth or credentials.');

        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });
