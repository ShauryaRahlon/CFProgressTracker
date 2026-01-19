import Link from "next/link"
import { getStudent } from "@/lib/mock-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RankChart } from "@/components/rank-chart"

export default async function StudentPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const studentData = await getStudent(handle)

  if (!studentData) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="text-white/40 mb-4">Student not found: {handle}</p>
        <Button variant="secondary" asChild>
          <Link href="/dashboard">Back</Link>
        </Button>
      </div>
    )
  }

  const { profile, history } = studentData
  const totalContests = history.length
  const bestRank = totalContests > 0 ? Math.min(...history.map(h => h.rank)) : 0
  const totalSolved = history.reduce((acc, h) => acc + h.solvedCount, 0)

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Back */}
      <div className="mb-8 animate-in">
        <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition-colors">
          ← Back
        </Link>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-4 mb-10 animate-in" style={{ animationDelay: '0.05s' }}>
        <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center text-lg text-white/60">
          {profile.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">{profile.name}</h1>
          <p className="text-white/40 text-sm">
            @{profile.cfHandle} · {profile.batch} · {profile.enrolment}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 animate-in" style={{ animationDelay: '0.1s' }}>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-white">{totalContests}</div>
            <div className="text-xs text-white/40 mt-1">Contests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-white">#{bestRank}</div>
            <div className="text-xs text-white/40 mt-1">Best Rank</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-white">{totalSolved}</div>
            <div className="text-xs text-white/40 mt-1">Problems</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <div className="mb-8 animate-in" style={{ animationDelay: '0.15s' }}>
        <RankChart history={history} />
      </div>

      {/* History */}
      <Card className="animate-in" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle className="text-base font-medium">History</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-0">
          <table className="minimal-table">
            <thead>
              <tr>
                <th>Contest</th>
                <th className="text-center">Rank</th>
                <th className="text-center">Solved</th>
                <th className="text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry._id}>
                  <td>
                    <Link
                      href={`/contest/${entry.contest.id}`}
                      className="text-white hover:text-white/70 transition-colors"
                    >
                      {entry.contest.name}
                    </Link>
                    <div className="text-xs text-white/30 mt-0.5">
                      {new Date(entry.contest.startTimeSeconds * 1000).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="text-center text-white/60">#{entry.rank}</td>
                  <td className="text-center text-white/80">{entry.solvedCount}</td>
                  <td className="text-right text-white">{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
