import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddEmailsForm from "@/app/dashboard/AddEmailsForm";
import SyncButton from "@/components/SyncButton";
import UploadStudents from "@/components/UploadStudents";

export default async function AddUsersPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    if (session.user.role !== "admin") redirect("/dashboard");

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">

            {/* Sync Section */}
            <div className="mb-10 animate-in">
                <h1 className="text-2xl font-semibold text-white mb-1">Admin</h1>
                <p className="text-white/40 text-sm">Sync contest data and manage allowed users</p>
            </div>

            <section className="mb-10 animate-in" style={{ animationDelay: '0.05s' }}>
                <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">Sync Contest Data</h2>
                <p className="text-white/30 text-sm mb-4">
                    Fetch new contests from Codeforces and sync student performances. Only unsynced contests are processed.
                </p>
                <SyncButton />
            </section>

            <div className="border-t border-white/5 mb-10" />

            {/* Upload Students Section */}
            <section className="mb-10 animate-in" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">Upload Students</h2>
                <p className="text-white/30 text-sm mb-4">
                    Upload an Excel file to bulk add or update students. Required columns: <code className="text-white/40">Enrolment, Name, Handle, Batch</code>.
                </p>
                <UploadStudents />
            </section>

            <div className="border-t border-white/5 mb-10" />

            {/* Add Emails Section */}
            <section className="animate-in" style={{ animationDelay: '0.15s' }}>
                <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">Allowed Users</h2>
                <p className="text-white/30 text-sm mb-4">
                    Add email addresses to allow users to access the platform.
                </p>
                <AddEmailsForm />
            </section>
        </div>
    );
}
