"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"

interface SiteHeaderProps {
    isAdmin: boolean
    userName?: string
}

export function SiteHeader({ isAdmin, userName }: SiteHeaderProps) {
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    if (pathname === "/login") return null

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${scrolled
                    ? "bg-black/80 backdrop-blur-md border-white/10"
                    : "bg-white/[0.02] backdrop-blur-sm border-white/5"
                    }`}
            >
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex h-14 items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-md bg-white/10 flex items-center justify-center">
                                <span className="text-sm font-bold">CF</span>
                            </div>
                            <span className="text-sm font-medium text-white/80">Tracker</span>
                        </Link>

                        {userName && (
                            <nav className="flex items-center gap-6">
                                <Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">
                                    Contests
                                </Link>
                                <Link href="/students" className="text-sm text-white/50 hover:text-white transition-colors">
                                    Students
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin/add-users" className="text-sm text-white/50 hover:text-white transition-colors">
                                        Admin
                                    </Link>
                                )}
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-white/30 border border-white/10 rounded px-2 py-1">
                                        {userName}
                                    </span>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/login" })}
                                        className="text-xs text-white/50 hover:text-red-400 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </nav>
                        )}
                    </div>
                </div>
            </header>
            <div className="h-14" />
        </>
    )
}
