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
    <div className="space-y-3">
      <div className="text-sm font-medium flex items-center gap-2">📤 エクスポート</div>

      {/* Export Options */}
      <div className="space-y-2">
        <Button onClick={onExportICalendar} variant="outline" size="sm" className="w-full">
          <Download className="h-4 w-4 mr-2" />
          iCal出力
        </Button>

        <Button onClick={onExportPDF} variant="outline" size="sm" className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          PDF出力
        </Button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        TimeTree、GoogleカレンダーなどにiCalファイルをインポートできます
      </div>
    </div>
  )
}
