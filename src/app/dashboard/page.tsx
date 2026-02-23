import Link from "next/link"
import { getContests } from "@/lib/db-queries"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge, getContestBadgeVariant } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { SearchInput } from "@/components/SearchInput"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolved = await searchParams
  const currentPage = Number(resolved.page) || 1
  const currentType = (resolved.type as string) || "All"
  const currentSearch = (resolved.q as string) || ""

  const { data: contests, pagination } = await getContests({
    page: currentPage,
    type: currentType,
    search: currentSearch,
  })

  const formatDate = (seconds: number) => {
    return new Date(seconds * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    return `${h}h`
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10 animate-in">
        <h1 className="text-2xl font-semibold text-white mb-1">Contests</h1>
        <p className="text-white/40 text-sm">Track your competitive programming progress</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6 animate-in" style={{ animationDelay: '0.1s' }}>
        <form className="flex items-center gap-2 w-full">
          <input type="hidden" name="page" value="1" />
          <SearchInput placeholder="Search contests…" defaultValue={currentSearch} />
          <Select name="type" defaultValue={currentType} className="w-36 text-sm">
            <option value="All">All</option>
            <option value="Div. 1">Div. 1</option>
            <option value="Div. 2">Div. 2</option>
            <option value="Div. 3">Div. 3</option>
          </Select>
          <Button type="submit" variant="secondary" size="sm">Search</Button>
        </form>
      </div>

      {/* Table */}
      <Card className="animate-in" style={{ animationDelay: '0.15s' }}>
        <CardContent className="p-0">
          <table className="minimal-table">
            <thead>
              <tr>
                <th>Contest</th>
                <th>Division</th>
                <th>Date</th>
                <th>Duration</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {contests.map((contest) => (
                <tr key={contest._id}>
                  <td>
                    <Link href={`/contest/${contest.id}`} className="text-white hover:text-white/70 transition-colors">
                      {contest.name}
                    </Link>
                    <div className="text-xs text-white/30 mt-0.5">#{contest.id}</div>
                  </td>
                  <td>
                    <Badge variant={getContestBadgeVariant(contest.classification)}>
                      {contest.classification}
                    </Badge>
                  </td>
                  <td className="text-white/50">{formatDate(contest.startTimeSeconds)}</td>
                  <td className="text-white/50">{formatDuration(contest.durationSeconds)}</td>
                  <td className="text-right">
                    <Badge variant={contest.phase === "FINISHED" ? "success" : "warning"}>
                      {contest.phase === "FINISHED" ? "Done" : "Live"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {contests.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-white/40">
                    No contests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 animate-in" style={{ animationDelay: '0.2s' }}>
        <span className="text-sm text-white/40">
          Page {pagination.page} of {pagination.pages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            asChild={currentPage > 1}
          >
            {currentPage > 1 ? (
              <Link href={`/dashboard?page=${currentPage - 1}&type=${currentType}`}>Prev</Link>
            ) : (
              "Prev"
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= pagination.pages}
            asChild={currentPage < pagination.pages}
          >
            {currentPage < pagination.pages ? (
              <Link href={`/dashboard?page=${currentPage + 1}&type=${currentType}`}>Next</Link>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
