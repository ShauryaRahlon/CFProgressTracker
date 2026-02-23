'use client';

import { useState } from 'react';

export default function AddEmailsForm() {
    const [emails, setEmails] = useState('');
    const [role, setRole] = useState<'user' | 'admin'>('user');
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

        const emailList = emails
            .split(/[\n,]/)
            .map((e) => e.trim())
            .filter((e) => e.length > 0);

        try {
            const response = await fetch('/api/admin/add-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emails: emailList, role }),
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data.results);
                if (data.results.added.length > 0 && data.results.errors.length === 0) {
                    setEmails('');
                }
            } else {
                alert(data.error || 'Failed to add emails');
            }
        } catch {
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ae-form-card">
            <form onSubmit={handleSubmit} className="ae-form-body">
                <div>
                    <label htmlFor="emails" className="ae-label">Email Addresses</label>
                    <textarea
                        id="emails"
                        rows={5}
                        value={emails}
                        onChange={(e) => setEmails(e.target.value)}
                        className="ae-textarea"
                        placeholder={"example1@gmail.com\nexample2@gmail.com"}
                        required
                    />
                    <p className="ae-hint">One per line or comma-separated</p>
                </div>

                <div>
                    <label htmlFor="role" className="ae-label">Default Role</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                        className="ae-select"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <button type="submit" disabled={loading} className="ae-submit-btn">
                    {loading ? 'Adding...' : 'Add Emails'}
                </button>
            </form>

            {result && (
                <div className="ae-results">
                    {result.added.length > 0 && (
                        <div className="ae-result-block ae-result-success">
                            <p className="ae-result-title">✓ Added ({result.added.length})</p>
                            <ul>{result.added.map((e) => <li key={e}>{e}</li>)}</ul>
                        </div>
                    )}
                    {result.alreadyExists.length > 0 && (
                        <div className="ae-result-block ae-result-warning">
                            <p className="ae-result-title">Already exists ({result.alreadyExists.length})</p>
                            <ul>{result.alreadyExists.map((e) => <li key={e}>{e}</li>)}</ul>
                        </div>
                    )}
                    {result.errors.length > 0 && (
                        <div className="ae-result-block ae-result-error">
                            <p className="ae-result-title">✗ Errors ({result.errors.length})</p>
                            <ul>{result.errors.map((e) => <li key={e}>{e}</li>)}</ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
