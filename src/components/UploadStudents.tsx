"use client"

import { useState, useRef } from "react"

export default function UploadStudents() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ message: string; stats?: { matched: number; modified: number; upserted: number } } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResult(null)
        setError(null)
        setFile(e.target.files?.[0] ?? null)
    }

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)
        setResult(null)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error ?? "Upload failed")
            } else {
                setResult(data)
                setFile(null)
                if (inputRef.current) inputRef.current.value = ""
            }
        } catch {
            setError("Network error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-3">
            {/* File picker */}
            <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
            />

            <div
                onClick={() => inputRef.current?.click()}
                className="border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all"
                style={{ minHeight: '140px', padding: '48px 24px' }}
            >
                {file ? (
                    <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-white text-sm font-medium">{file.name}</p>
                        <p className="text-white/30 text-xs">{(file.size / 1024).toFixed(1)} KB &mdash; click to change</p>
                    </>
                ) : (
                    <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: 'rgba(255,255,255,0.2)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <p className="text-white/40 text-sm">Click to select an Excel file (.xlsx)</p>
                        <p className="text-white/20 text-xs">Columns: Enrolment, Name, Handle, Batch</p>
                    </>
                )}
            </div>

            {/* Upload button */}
            <button
                onClick={handleUpload}
                className="sync-btn"
                style={{ marginTop: '16px', cursor: (!file || loading) ? 'not-allowed' : 'pointer' }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="sync-btn-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {loading ? "Uploading..." : "Upload"}
            </button>

            {/* Success */}
            {result && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-emerald-400 text-sm font-medium mb-3">{result.message}</p>
                    {result.stats && (
                        <div className="flex gap-6 text-xs text-white/40">
                            <span><span className="text-white font-semibold text-sm">{result.stats.upserted}</span> &nbsp;added</span>
                            <span><span className="text-white font-semibold text-sm">{result.stats.modified}</span> &nbsp;updated</span>
                            <span><span className="text-white font-semibold text-sm">{result.stats.matched}</span> &nbsp;matched</span>
                        </div>
                    )}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {error}
                </div>
            )}
        </div>
    )
}
