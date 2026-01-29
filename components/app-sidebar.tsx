"use client"

import Link from "next/link"
import { Shield, MapPin } from "lucide-react"

export default function AppSidebar() {
  return (
    <aside className="w-64 border-r bg-background">
      {/* Logo / App Name */}
      <Link
        href="/"
        className="p-4 text-lg font-semibold flex items-center gap-2 hover:bg-muted transition-colors"
      >
        <Shield className="h-5 w-5" />
        safety-tools
      </Link>

      {/* Navigation */}
      <nav className="px-2 space-y-1">
        <Link
          href="/gps-lost-report"
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
        >
          <MapPin className="h-4 w-4" />
          GPS Lost Report
        </Link>
      </nav>
    </aside>
  )
}
