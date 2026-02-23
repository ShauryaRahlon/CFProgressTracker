"use client"

interface SearchInputProps {
    name?: string
    placeholder?: string
    defaultValue?: string
}

export function SearchInput({ name = "q", placeholder = "Search…", defaultValue = "" }: SearchInputProps) {
    return (
        <input
            type="text"
            name={name}
            placeholder={placeholder}
            defaultValue={defaultValue}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] focus:border-white/25 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition-colors"
        />
    )
}
