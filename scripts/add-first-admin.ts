import dotenv from "dotenv";
import { connectDB } from "../src/lib/db";
import AllowedEmail from "../src/models/AllowedEmail";

// Load environment variables from .env file
dotenv.config();

async function addFirstAdmin() {
    try {
        console.log("Connecting to database...");
        await connectDB();

        const adminEmail = "shauryagoyal1404@gmail.com";

        // Check if email already exists
        const existing = await AllowedEmail.findOne({ email: adminEmail });

        if (existing) {
            console.log(`✅ Email ${adminEmail} already exists with role: ${existing.role}`);
            return;
        }

        // Add the admin email
        await AllowedEmail.create({
            email: adminEmail,
            role: "admin",
        });

        console.log(`✅ Successfully added ${adminEmail} as admin!`);
        console.log("You can now sign in using either Google OAuth or credentials.");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error adding admin:", error);
        process.exit(1);
    }
}

addFirstAdmin();