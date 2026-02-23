'use client';

import { useState, useEffect } from 'react';

type SyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface SyncResult {
    message: string;
    contestsAdded: number;
    newContestsSynced: number;
    performancesSaved: number;
}

const LOADING_MESSAGES = [
    'Connecting to Codeforces API...',
    'Fetching contest list...',
    'Checking for new contests...',
    'Syncing student performances...',
    'Writing to database...',
    'Almost done...',
];

export default function SyncButton() {
    const [status, setStatus] = useState<SyncStatus>('idle');
    const [result, setResult] = useState<SyncResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [msgIndex, setMsgIndex] = useState(0);

    // Cycle loading messages while syncing
    useEffect(() => {
        if (status !== 'loading') return;
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2200);
        return () => clearInterval(interval);
    }, [status]);

    const handleSync = async () => {
        setStatus('loading');
        setResult(null);
        setError(null);
        setMsgIndex(0);

        try {
            const res = await fetch('/api/admin/sync', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Sync failed');
            }

            setResult(data);
            setStatus('success');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            setStatus('error');
        }
    };

    const handleReset = () => {
        setStatus('idle');
        setResult(null);
        setError(null);
    };

    return (
        <div className="sync-wrapper">
            {/* Idle State */}
            {status === 'idle' && (
                <button onClick={handleSync} className="sync-btn">
                    <svg
                        className="sync-btn-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    Sync Now
                </button>
            )}

            {/* Loading State */}
            {status === 'loading' && (
                <div className="sync-loading-card">
                    <div className="sync-spinner-row">
                        <div className="sync-spinner" />
                        <span className="sync-loading-title">Syncing in progress...</span>
                    </div>
                    <p className="sync-loading-msg">{LOADING_MESSAGES[msgIndex]}</p>
                    <p className="sync-loading-note">
                        This may take a few minutes depending on the number of new contests. Please keep this page open.
                    </p>
                </div>
            )}

            {/* Success State */}
            {status === 'success' && result && (
                <div className="sync-result-card sync-result-success">
                    <div className="sync-result-header">
                        <div className="sync-result-icon sync-icon-success">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="sync-result-title">Sync Complete</p>
                            <p className="sync-result-msg">{result.message}</p>
                        </div>
                    </div>
                    <div className="sync-stats">
                        <div className="sync-stat">
                            <span className="sync-stat-value">{result.contestsAdded}</span>
                            <span className="sync-stat-label">Total Contests</span>
                        </div>
                        <div className="sync-stat">
                            <span className="sync-stat-value">{result.newContestsSynced}</span>
                            <span className="sync-stat-label">New Contests Synced</span>
                        </div>
                        <div className="sync-stat">
                            <span className="sync-stat-value">{result.performancesSaved}</span>
                            <span className="sync-stat-label">Performances Saved</span>
                        </div>
                    </div>
                    <button onClick={handleReset} className="sync-reset-btn">
                        Sync Again
                    </button>
                </div>
            )}

            {/* Error State */}
            {status === 'error' && (
                <div className="sync-result-card sync-result-error">
                    <div className="sync-result-header">
                        <div className="sync-result-icon sync-icon-error">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="sync-result-title">Sync Failed</p>
                            <p className="sync-result-msg">{error}</p>
                        </div>
                    </div>
                    <button onClick={handleReset} className="sync-reset-btn">
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
}
