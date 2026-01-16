"use client";

import { useState } from "react";

export default function AddEmailsForm() {
    const [emails, setEmails] = useState("");
    const [role, setRole] = useState<"user" | "admin">("user");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        added: string[];
        alreadyExists: string[];
        errors: string[];
    } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        // Split emails by newlines or commas
        const emailList = emails
            .split(/[\n,]/)
            .map((e) => e.trim())
            .filter((e) => e.length > 0);

        try {
            const response = await fetch("/api/admin/add-emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    emails: emailList,
                    role: role,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data.results);
                // Clear form if all emails were successfully added
                if (data.results.added.length > 0 && data.results.errors.length === 0) {
                    setEmails("");
                }
            } else {
                alert(data.error || "Failed to add emails");
            }
        } catch (error) {
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add Allowed Emails</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="emails" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Addresses
                    </label>
                    <textarea
                        id="emails"
                        rows={6}
                        value={emails}
                        onChange={(e) => setEmails(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email addresses (one per line or comma-separated)&#10;example1@gmail.com&#10;example2@gmail.com"
                        required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Enter multiple emails separated by new lines or commas
                    </p>
                </div>

                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                        Default Role
                    </label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as "user" | "admin")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? "Adding..." : "Add Emails"}
                </button>
            </form>

            {/* Results Display */}
            {result && (
                <div className="mt-6 space-y-3">
                    {result.added.length > 0 && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <h3 className="text-sm font-medium text-green-800 mb-1">
                                ✅ Successfully Added ({result.added.length})
                            </h3>
                            <ul className="text-sm text-green-700 list-disc list-inside">
                                {result.added.map((email) => (
                                    <li key={email}>{email}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.alreadyExists.length > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <h3 className="text-sm font-medium text-yellow-800 mb-1">
                                ⚠️ Already Exists ({result.alreadyExists.length})
                            </h3>
                            <ul className="text-sm text-yellow-700 list-disc list-inside">
                                {result.alreadyExists.map((email) => (
                                    <li key={email}>{email}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.errors.length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <h3 className="text-sm font-medium text-red-800 mb-1">
                                ❌ Errors ({result.errors.length})
                            </h3>
                            <ul className="text-sm text-red-700 list-disc list-inside">
                                {result.errors.map((email) => (
                                    <li key={email}>{email}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
