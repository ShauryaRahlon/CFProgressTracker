import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import AllowedEmail from "@/models/AllowedEmail";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const session = await auth();

        // Check if user is authenticated and is admin
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { emails, role = "user" } = body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json(
                { error: "Please provide an array of emails" },
                { status: 400 }
            );
        }

        await connectDB();

        const results = {
            added: [] as string[],
            alreadyExists: [] as string[],
            errors: [] as string[],
        };

        for (const email of emails) {
            const trimmedEmail = email.trim().toLowerCase();

            if (!trimmedEmail || !trimmedEmail.includes("@")) {
                results.errors.push(trimmedEmail || "invalid email");
                continue;
            }

            try {
                const existing = await AllowedEmail.findOne({ email: trimmedEmail });

                if (existing) {
                    results.alreadyExists.push(trimmedEmail);
                } else {
                    await AllowedEmail.create({
                        email: trimmedEmail,
                        role: role,
                    });
                    results.added.push(trimmedEmail);
                }
            } catch (error) {
                results.errors.push(trimmedEmail);
            }
        }

        return NextResponse.json({
            success: true,
            results,
        });
    } catch (error) {
        console.error("Error adding allowed emails:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
