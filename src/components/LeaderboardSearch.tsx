"use client"

import { useState } from "react"
import Link from "next/link"
import { StudentRank } from "@/lib/db-queries"

interface LeaderboardSearchProps {
    leaderboard: StudentRank[]
}

export function LeaderboardSearch({ leaderboard }: LeaderboardSearchProps) {
    const [query, setQuery] = useState("")

    const filtered = query.trim()
        ? leaderboard.filter((row) =>
            row.student.name.toLowerCase().includes(query.toLowerCase()) ||
            row.handle.toLowerCase().includes(query.toLowerCase()) ||
            row.student.batch.toLowerCase().includes(query.toLowerCase())
        )
        : leaderboard

    return (
        <>
            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, handle or batch…"
                    className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] focus:border-white/25 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition-colors"
                />
            </div>

            {/* Count hint */}
            {query && (
                <p className="text-xs text-white/30 mb-3">
                    {filtered.length} of {leaderboard.length} participants
                </p>
            )}

            {/* Table */}
            <table className="minimal-table">
                <thead>
                    <tr>
                        <th className="w-16">Rank</th>
                        <th>Student</th>
                        <th>Handle</th>
                        <th className="text-center">Solved</th>
                        <th className="text-center">Points</th>
                        <th className="text-right">Penalty</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((row) => (
                        <tr key={row._id}>
                            <td className="text-white/60">#{row.rank}</td>
                            <td>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-white/60">
                                        {row.student.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-white">{row.student.name}</div>
                                        <div className="text-xs text-white/30">{row.student.batch}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <Link
                                    href={`/student/${row.handle}`}
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    {row.handle}
                                </Link>
                            </td>
                            <td className="text-center text-white/80">{row.solvedCount}</td>
                            <td className="text-center text-white">{row.points}</td>
                            <td className="text-right text-white/40">{row.penalty}</td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center py-12 text-white/40">
                                {query ? `No results for "${query}"` : "No data available"}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    )
}
