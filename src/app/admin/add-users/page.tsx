import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AddEmailsForm from "@/app/dashboard/AddEmailsForm";

export default async function AddUsersPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    if (session.user.role !== "admin") {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar session={session} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Add Allowed Users
                    </h1>
                    <p className="text-gray-600">
                        Add multiple email addresses to allow users to access the platform
                    </p>
                </div>

                <AddEmailsForm />
            </div>
        </div>
    );
}
