"use client";

import { useState } from "react";
import { Session } from "next-auth";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface NavbarProps {
    session: Session | null;
}

export default function Navbar({ session }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Title */}
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex items-center space-x-3">
                            <div className="bg-white p-2 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                            <span className="text-white font-bold text-xl hidden sm:block">
                                CF Progress Tracker
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link
                            href="/dashboard"
                            className="text-white hover:text-blue-100 transition-colors font-medium"
                        >
                            Dashboard
                        </Link>

                        {session?.user?.role === "admin" && (
                            <Link
                                href="/admin/add-users"
                                className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors font-medium shadow-sm"
                            >
                                Add Users
                            </Link>
                        )}

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/20 transition-colors"
                            >
                                <div className="text-right">
                                    <p className="text-white text-sm font-medium">
                                        {session?.user?.name}
                                    </p>
                                    <p className="text-blue-100 text-xs capitalize">
                                        {session?.user?.role}
                                    </p>
                                </div>
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold text-sm">
                                        {session?.user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/login" })}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-white p-2"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {mobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4">
                        <div className="space-y-2">
                            <Link
                                href="/dashboard"
                                className="block text-white hover:bg-white/10 px-3 py-2 rounded-md"
                            >
                                Dashboard
                            </Link>
                            {session?.user?.role === "admin" && (
                                <Link
                                    href="/admin/add-users"
                                    className="block text-white hover:bg-white/10 px-3 py-2 rounded-md"
                                >
                                    Add Users
                                </Link>
                            )}
                            <div className="pt-2 border-t border-white/20">
                                <p className="text-white px-3 py-1 text-sm">
                                    {session?.user?.name}
                                </p>
                                <p className="text-blue-100 px-3 text-xs capitalize mb-2">
                                    {session?.user?.role}
                                </p>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="w-full text-left text-red-300 hover:bg-white/10 px-3 py-2 rounded-md"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
