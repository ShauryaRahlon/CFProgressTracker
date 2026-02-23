import Link from "next/link"
import { getContest, getContestById } from "@/lib/db-queries"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LeaderboardSearch } from "@/components/LeaderboardSearch"
import { BackButton } from "@/components/BackButton"

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

  const [leaderboard, contestInfo] = await Promise.all([
    getContest(contestId),
    getContestById(contestId),
  ])

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Back */}
      <div className="mb-8 animate-in">
        <BackButton />
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

      {/* Leaderboard with search */}
      <Card className="animate-in" style={{ animationDelay: '0.1s' }}>
        <CardContent className="pt-4 pb-0 px-4">
          <LeaderboardSearch leaderboard={leaderboard} />
        </CardContent>
      </Card>
    </div>
  )
}
