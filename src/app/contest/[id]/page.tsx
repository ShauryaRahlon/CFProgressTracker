import Link from "next/link"
import { getContest, getContests } from "@/lib/mock-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function ContestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const contestId = Number(id)
  
  if (isNaN(contestId)) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="text-white/40 mb-4">Invalid contest ID</p>
        <Button variant="secondary" asChild>
          <Link href="/dashboard">Back</Link>
        </Button>
      </div>
    )
  }

  const leaderboard = await getContest(contestId)
  const { data: contests } = await getContests({ page: 1 })
  const contestInfo = contests.find(c => c.id === contestId)

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Back */}
      <div className="mb-8 animate-in">
        <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition-colors">
          ← Back
        </Link>
      </div>

      {/* Header */}
      <div className="mb-10 animate-in" style={{ animationDelay: '0.05s' }}>
        <h1 className="text-2xl font-semibold text-white mb-1">
          {contestInfo?.name || `Contest #${contestId}`}
        </h1>
        <p className="text-white/40 text-sm">
          {leaderboard.length} participants
        </p>
      </div>

      {/* Leaderboard */}
      <Card className="animate-in" style={{ animationDelay: '0.1s' }}>
        <CardContent className="p-0">
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
              {leaderboard.map((row) => (
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
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/40">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
