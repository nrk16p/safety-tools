import Link from "next/link"
import { Shield, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          🛡️ Safety Tools
        </h1>
        <p className="text-muted-foreground mt-1">
          Internal safety & monitoring utilities
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GPS Lost Report */}
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              GPS Lost Report
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ตรวจสอบรถที่ GPS ขาดการส่งสัญญาณ
              และดาวน์โหลดรายงาน Excel
            </p>

            <Button asChild className="w-full">
              <Link href="/gps-lost-report">
                Open Report
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Placeholder for future tools */}
        <Card className="opacity-40">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Safety tools จะถูกเพิ่มในเร็ว ๆ นี้
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
