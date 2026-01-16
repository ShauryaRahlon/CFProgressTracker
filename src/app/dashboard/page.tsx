import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddEmailsForm from "./AddEmailsForm";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-600 mt-1">CF Progress Tracker</p>
                        </div>
                        <form
                            action={async () => {
                                "use server";
                                await signOut();
                            }}
                        >
                            <button
                                type="submit"
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Sign Out
                            </button>
                        </form>
                    </div>

                    <div className="border-t pt-6">
                        <h2 className="text-xl font-semibold mb-4">User Information</h2>
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                <span className="font-medium">Name:</span> {session.user.name}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-medium">Email:</span> {session.user.email}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-medium">Role:</span>{" "}
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {session.user.role}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {session.user.role === "admin" && (
                    <div>
                        <AddEmailsForm />
                    </div>
                )}
            </div>
        </div>
    );
}
