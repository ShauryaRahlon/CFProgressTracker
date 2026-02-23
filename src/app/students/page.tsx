import Link from "next/link"
import { getStudents } from "@/lib/db-queries"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/SearchInput"

export default async function StudentsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolved = await searchParams
    const currentPage = Number(resolved.page) || 1
    const currentSearch = (resolved.q as string) || ""

    const { data: students, pagination } = await getStudents({
        page: currentPage,
        search: currentSearch,
    })

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-10 animate-in">
                <h1 className="text-2xl font-semibold text-white mb-1">Students</h1>
                <p className="text-white/40 text-sm">{pagination.total} registered students</p>
            </div>

            {/* Search */}
            <div className="mb-6 animate-in" style={{ animationDelay: '0.1s' }}>
                <form className="flex items-center gap-2">
                    <input type="hidden" name="page" value="1" />
                    <SearchInput placeholder="Search by name, handle, enrolment or batch…" defaultValue={currentSearch} />
                    <Button type="submit" variant="secondary" size="sm">Search</Button>
                    {currentSearch && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/students">Clear</Link>
                        </Button>
                    )}
                </form>
            </div>

            {/* Table */}
            <Card className="animate-in" style={{ animationDelay: '0.15s' }}>
                <CardContent className="p-0">
                    <table className="minimal-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>CF Handle</th>
                                <th>Enrolment</th>
                                <th className="text-right">Batch</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student._id}>
                                    <td>
                                        <Link
                                            href={`/student/${student.cfHandle}`}
                                            className="text-white hover:text-white/70 transition-colors font-medium"
                                        >
                                            {student.name}
                                        </Link>
                                    </td>
                                    <td className="text-white/50 font-mono text-sm">@{student.cfHandle}</td>
                                    <td className="text-white/50">{student.enrolment}</td>
                                    <td className="text-right text-white/50">{student.batch}</td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-white/40">
                                        {currentSearch ? `No students matching "${currentSearch}"` : "No students found"}
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
                            <Link href={`/students?page=${currentPage - 1}&q=${currentSearch}`}>Prev</Link>
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
                            <Link href={`/students?page=${currentPage + 1}&q=${currentSearch}`}>Next</Link>
                        ) : (
                            "Next"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
