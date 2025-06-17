"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ShiftModal } from "@/components/shift-modal"
import { BulkInputModal } from "@/components/bulk-input-modal"
import { CalendarIntegration } from "@/components/calendar-integration"
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns"
import { ja } from "date-fns/locale"
import { Calculator, CalendarIcon } from "lucide-react"
import { generatePDF } from "@/lib/pdf-generator"
import { exportToICalendar } from "@/lib/icalendar-export"

// サンプルデータ
const sampleShifts = [
  { date: new Date(2024, 11, 15), timeSlots: ["09:00-13:00", "14:00-18:00"] },
  { date: new Date(2024, 11, 16), timeSlots: ["10:00-14:00"] },
  { date: new Date(2024, 11, 20), timeSlots: ["13:00-17:00", "18:00-22:00"] },
  { date: new Date(2024, 11, 22), timeSlots: ["09:00-13:00"] },
]

export default function ShifPostApp() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkSelectedWeekday, setBulkSelectedWeekday] = useState<number | undefined>()
  const [shifts, setShifts] = useState(sampleShifts)
  const [hourlyWage, setHourlyWage] = useState<number>(1000)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setIsModalOpen(true)
    }
  }

  const handleWeekdayClick = (weekday: number) => {
    setBulkSelectedWeekday(weekday)
    setIsBulkModalOpen(true)
  }

  const handleShiftSave = (date: Date, timeSlots: string[]) => {
    setShifts((prev) => {
      const filtered = prev.filter((shift) => !isSameDay(shift.date, date))
      if (timeSlots.length > 0) {
        return [...filtered, { date, timeSlots }]
      }
      return filtered
    })
    setIsModalOpen(false)
  }

  const handleShiftDelete = (date: Date) => {
    setShifts((prev) => prev.filter((shift) => !isSameDay(shift.date, date)))
  }

  const handleBulkSave = (dates: Date[], timeSlots: string[]) => {
    setShifts((prev) => {
      let updated = [...prev]
      dates.forEach((date) => {
        updated = updated.filter((shift) => !isSameDay(shift.date, date))
        if (timeSlots.length > 0) {
          updated.push({ date, timeSlots })
        }
      })
      return updated
    })
    setIsBulkModalOpen(false)
    setBulkSelectedWeekday(undefined)
  }

  const getShiftForDate = (date: Date) => {
    return shifts.find((shift) => isSameDay(shift.date, date))
  }

  const calculateMonthlyIncome = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)

    let totalHours = 0
    shifts.forEach((shift) => {
      if (shift.date >= monthStart && shift.date <= monthEnd) {
        shift.timeSlots.forEach((slot) => {
          const [start, end] = slot.split("-")
          const startHour = Number.parseInt(start.split(":")[0])
          const endHour = Number.parseInt(end.split(":")[0])
          totalHours += endHour - startHour
        })
      }
    })

    return totalHours * hourlyWage
  }

  const getTotalHours = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)

    let totalHours = 0
    shifts.forEach((shift) => {
      if (shift.date >= monthStart && shift.date <= monthEnd) {
        shift.timeSlots.forEach((slot) => {
          const [start, end] = slot.split("-")
          const startHour = Number.parseInt(start.split(":")[0])
          const endHour = Number.parseInt(end.split(":")[0])
          totalHours += endHour - startHour
        })
      }
    })

    return totalHours
  }

  const modifiers = {
    hasShift: (date: Date) => !!getShiftForDate(date),
    saturday: (date: Date) => date.getDay() === 6,
    sunday: (date: Date) => date.getDay() === 0,
  }

  const modifiersStyles = {
    hasShift: {
      backgroundColor: "hsl(var(--primary))",
      color: "hsl(var(--primary-foreground))",
      fontWeight: "bold",
    },
    saturday: {
      color: "#2563eb",
      fontWeight: "600",
    },
    sunday: {
      color: "#dc2626",
      fontWeight: "600",
    },
  }

  const handleExportPDF = () => {
    generatePDF(shifts, currentMonth, hourlyWage, calculateMonthlyIncome(), getTotalHours())
  }

  const handleExportICalendar = () => {
    exportToICalendar(shifts, currentMonth)
  }

  const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"]
  const weekdayColors = [
    "text-red-600 hover:text-red-700",
    "text-gray-700 hover:text-gray-900",
    "text-gray-700 hover:text-gray-900",
    "text-gray-700 hover:text-gray-900",
    "text-gray-700 hover:text-gray-900",
    "text-gray-700 hover:text-gray-900",
    "text-blue-600 hover:text-blue-700",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="text-4xl">⚡</div>
            <h1 className="text-4xl font-bold text-gray-900">Shif-Post</h1>
          </div>
          <p className="text-gray-600">カレンダーから日付を選択して、勤務可能な時間帯を登録してください</p>
          <p className="text-sm text-blue-600">💡 曜日をタップすると、その曜日で一括入力できます</p>
        </div>

        {/* 統計情報とアクション */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-600">月間予定時間</div>
                  <div className="text-2xl font-bold">{getTotalHours()}h</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="text-green-600">💰</div>
                <div>
                  <div className="text-sm text-gray-600">予想月収</div>
                  <div className="text-2xl font-bold">¥{calculateMonthlyIncome().toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <Label htmlFor="hourlyWage" className="text-sm">
                時給設定
              </Label>
              <Input
                id="hourlyWage"
                type="number"
                value={hourlyWage}
                onChange={(e) => setHourlyWage(Number(e.target.value))}
                className="h-8"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <CalendarIntegration
                shifts={shifts}
                currentMonth={currentMonth}
                onExportICalendar={handleExportICalendar}
                onExportPDF={handleExportPDF}
                hourlyWage={hourlyWage}
                calculateMonthlyIncome={calculateMonthlyIncome}
                getTotalHours={getTotalHours}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* 大きなカレンダー */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                シフトカレンダー - {format(currentMonth, "yyyy年M月", { locale: ja })}
              </CardTitle>
              <CardDescription>
                日付をクリックしてシフトを登録・編集 |<span className="text-blue-600 font-medium"> 土曜日</span> |
                <span className="text-red-600 font-medium"> 日曜日</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    locale={ja}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    className="rounded-md border shadow-sm w-full"
                    disabled={(date) => date < new Date()}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    components={{
                      Head: ({ children, ...props }) => (
                        <thead {...props}>
                          <tr className="flex w-full">
                            {weekdayLabels.map((label, index) => (
                              <th
                                key={index}
                                className={`rounded-md w-full font-normal text-sm p-2 cursor-pointer transition-colors ${weekdayColors[index]} hover:bg-gray-100`}
                                onClick={() => handleWeekdayClick(index)}
                                title={`${label}曜日で一括入力`}
                              >
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                      ),
                      DayContent: ({ date }) => {
                        const shift = getShiftForDate(date)
                        return (
                          <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
                            <div className="text-sm font-medium">{date.getDate()}</div>
                            {shift && (
                              <div className="text-xs space-y-0.5 mt-1 w-full">
                                {shift.timeSlots.slice(0, 2).map((slot, index) => (
                                  <div
                                    key={index}
                                    className="bg-white/90 text-gray-700 px-1 py-0.5 rounded text-center truncate"
                                  >
                                    {slot}
                                  </div>
                                ))}
                                {shift.timeSlots.length > 2 && (
                                  <div className="text-xs text-center text-white/80">+{shift.timeSlots.length - 2}</div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      },
                    }}
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4 w-full",
                      caption: "flex justify-center pt-1 relative items-center text-lg font-medium",
                      caption_label: "text-lg font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex w-full",
                      head_cell: "text-muted-foreground rounded-md w-full font-normal text-sm p-2",
                      row: "flex w-full mt-2",
                      cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-middle)]:rounded-none w-full h-24 border border-gray-100",
                      day: "h-full w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      day_range_start: "day-range-start",
                      day_range_end: "day-range-end",
                      day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day_outside:
                        "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      day_hidden: "invisible",
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 登録済みシフト一覧 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">📋 今月のシフト</CardTitle>
              <CardDescription>登録済み勤務希望一覧</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {shifts.filter((shift) => {
                const monthStart = startOfMonth(currentMonth)
                const monthEnd = endOfMonth(currentMonth)
                return shift.date >= monthStart && shift.date <= monthEnd
              }).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">まだシフトが登録されていません</p>
              ) : (
                shifts
                  .filter((shift) => {
                    const monthStart = startOfMonth(currentMonth)
                    const monthEnd = endOfMonth(currentMonth)
                    return shift.date >= monthStart && shift.date <= monthEnd
                  })
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .map((shift, index) => (
                    <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-sm">{format(shift.date, "M月d日(E)", { locale: ja })}</div>
                        <button
                          onClick={() => handleShiftDelete(shift.date)}
                          className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {shift.timeSlots.map((slot, slotIndex) => (
                          <Badge key={slotIndex} variant="secondary" className="text-xs">
                            {slot}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {shift.timeSlots.reduce((total, slot) => {
                          const [start, end] = slot.split("-")
                          const startHour = Number.parseInt(start.split(":")[0])
                          const endHour = Number.parseInt(end.split(":")[0])
                          return total + (endHour - startHour)
                        }, 0)}
                        時間 / ¥
                        {shift.timeSlots
                          .reduce((total, slot) => {
                            const [start, end] = slot.split("-")
                            const startHour = Number.parseInt(start.split(":")[0])
                            const endHour = Number.parseInt(end.split(":")[0])
                            return total + (endHour - startHour) * hourlyWage
                          }, 0)
                          .toLocaleString()}
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* シフト登録モーダル */}
      <ShiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        existingShift={selectedDate ? getShiftForDate(selectedDate) : undefined}
        onSave={handleShiftSave}
        onDelete={selectedDate ? () => handleShiftDelete(selectedDate) : undefined}
      />

      {/* 一括入力モーダル */}
      <BulkInputModal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false)
          setBulkSelectedWeekday(undefined)
        }}
        onSave={handleBulkSave}
        currentMonth={currentMonth}
        preselectedWeekday={bulkSelectedWeekday}
      />
    </div>
  )
}
