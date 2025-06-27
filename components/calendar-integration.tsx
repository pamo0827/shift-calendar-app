"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText, CalendarPlus } from "lucide-react"

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
}: CalendarIntegrationProps) {
  const createGoogleCalendarUrl = (shift: { date: Date; timeSlots: string[] }) => {
    const [timeSlot] = shift.timeSlots
    const isAllDay = timeSlot === "終日"

    const toGoogleCalendarDateTime = (date: Date, time?: string) => {
      const d = new Date(date)
      if (time) {
        const [hours, minutes] = time.split(":").map(Number)
        d.setHours(hours, minutes, 0, 0)
        return d.toISOString().replace(/[-:.]/g, "").substring(0, 15) + "Z"
      }
      return (
        d.getFullYear() +
        (d.getMonth() + 1).toString().padStart(2, "0") +
        d.getDate().toString().padStart(2, "0")
      )
    }

    let dates
    if (isAllDay) {
      const startDate = toGoogleCalendarDateTime(shift.date)
      const nextDay = new Date(shift.date)
      nextDay.setDate(nextDay.getDate() + 1)
      const endDate = toGoogleCalendarDateTime(nextDay)
      dates = `${startDate}/${endDate}`
    } else {
      const [startTime, endTime] = timeSlot.split("-")
      const startDateTime = toGoogleCalendarDateTime(shift.date, startTime)
      const endDateTime = toGoogleCalendarDateTime(shift.date, endTime)
      dates = `${startDateTime}/${endDateTime}`
    }

    const url = new URL("https://www.google.com/calendar/render")
    url.searchParams.append("action", "TEMPLATE")
    url.searchParams.append("text", `シフト: ${timeSlot}`)
    url.searchParams.append("dates", dates)
    url.searchParams.append("details", "Shif-Postで登録されたシフトです。")
    url.searchParams.append("location", "")
    url.searchParams.append("trp", "true")

    return url.toString()
  }

  const handleAddToGoogleCalendar = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    const monthShifts = shifts.filter((shift) => shift.date >= monthStart && shift.date <= monthEnd)

    if (monthShifts.length > 0) {
      // 最初のシフトのみをGoogleカレンダーに追加する（複数イベントの同時追加は複雑なため）
      const url = createGoogleCalendarUrl(monthShifts[0])
      window.open(url, "_blank")
    } else {
      alert("この月のシフトはありません。")
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Button onClick={handleAddToGoogleCalendar} variant="outline" className="w-full h-12 text-base">
          <CalendarPlus className="h-5 w-5 mr-2" />
          Googleカレンダーに追加
        </Button>
        <Button onClick={onExportICalendar} variant="outline" className="w-full h-12 text-base">
          <Download className="h-5 w-5 mr-2" />
          iCal形式で出力
        </Button>
        <Button onClick={onExportPDF} variant="outline" className="w-full h-12 text-base">
          <FileText className="h-5 w-5 mr-2" />
          PDF形式で出力
        </Button>
      </div>

      <div className="text-sm text-gray-500 text-center leading-relaxed">
        Googleカレンダーに直接追加するか、
        <br />
        iCalファイルを各種カレンダーアプリにインポートできます。
      </div>
    </div>
  )
}
