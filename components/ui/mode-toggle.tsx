"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="w-9 h-9" />

  const isDark = theme === "dark"

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation(); // Oprește navbar-ul din a fura click-ul
        setTheme(isDark ? "light" : "dark");
      }}
      className="relative z-9999 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-transparent hover:bg-accent hover:text-accent-foreground cursor-pointer pointer-events-auto"
      type="button"
      aria-label="Schimbă tema"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-500" />
      ) : (
        <Moon className="h-4 w-4 text-stone-700" />
      )}
    </button>
  )
}