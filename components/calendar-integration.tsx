"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

interface CalendarIntegrationProps {
  shifts: Array<{ date: Date; timeSlots: string[] }>
  currentMonth: Date
  onExportICalendar: () => void
  onExportPDF: () => void
  hourlyWage: number
  calculateMonthlyIncome: () => number
  getTotalHours: () => number
}

export function CalendarIntegration({
  shifts,
  currentMonth,
  onExportICalendar,
  onExportPDF,
  hourlyWage,
  calculateMonthlyIncome,
  getTotalHours,
}: CalendarIntegrationProps) {
  return (
    <div className="space-y-4">
      {/* Export Options */}
      <div className="space-y-3">
        <Button onClick={onExportICalendar} variant="outline" className="w-full h-12 text-base">
          <Download className="h-5 w-5 mr-2" />
          iCal出力
        </Button>

        <Button onClick={onExportPDF} variant="outline" className="w-full h-12 text-base">
          <FileText className="h-5 w-5 mr-2" />
          PDF出力
        </Button>
      </div>

      <div className="text-sm text-gray-500 text-center leading-relaxed">
        TimeTree、Googleカレンダーなどに
        <br />
        iCalファイルをインポートできます
      </div>
    </div>
  )
}
