"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShiftModal } from "@/components/shift-modal"
import { BulkInputModal } from "@/components/bulk-input-modal"
import { CalendarIntegration } from "@/components/calendar-integration"
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns"
import { ja } from "date-fns/locale"
import { Calculator, CalendarIcon, Plus, List, Sun } from "lucide-react"
import { generatePDF } from "@/lib/pdf-generator"
import { exportToICalendar } from "@/lib/icalendar-export"

// サンプルデータ
const sampleShifts = [
  { date: new Date(2024, 11, 15), timeSlots: ["09:00-13:00", "14:00-18:00"] },
  { date: new Date(2024, 11, 16), timeSlots: ["10:00-14:00"] },
  { date: new Date(2024, 11, 18), timeSlots: ["終日"] },
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
  const [activeView, setActiveView] = useState<"calendar" | "list">("calendar")

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
        return [...filtered, { date, timeSlots }].sort((a, b) => a.date.getTime() - b.date.getTime())
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
      return updated.sort((a, b) => a.date.getTime() - b.date.getTime())
    })
    setIsBulkModalOpen(false)
    setBulkSelectedWeekday(undefined)
  }

  const getShiftForDate = (date: Date) => {
    return shifts.find((shift) => isSameDay(shift.date, date))
  }

  const calculateHoursForSlot = (slot: string): number => {
    if (slot === "終日") {
      return 8 // 終日の場合は8時間として計算
    }
    const [start, end] = slot.split("-")
    if (!start || !end) return 0
    const startHour = Number.parseInt(start.split(":")[0])
    const startMinute = Number.parseInt(start.split(":")[1])
    const endHour = Number.parseInt(end.split(":")[0])
    const endMinute = Number.parseInt(end.split(":")[1])
    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) return 0
    return endHour - startHour + (endMinute - startMinute) / 60
  }

  const getTotalHours = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)

    return shifts
      .filter((shift) => shift.date >= monthStart && shift.date <= monthEnd)
      .reduce((total, shift) => {
        const hours = shift.timeSlots.reduce((sum, slot) => sum + calculateHoursForSlot(slot), 0)
        return total + hours
      }, 0)
  }

  const calculateMonthlyIncome = () => {
    return getTotalHours() * hourlyWage
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

  const monthlyShifts = shifts
    .filter((shift) => {
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)
      return shift.date >= monthStart && shift.date <= monthEnd
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 固定ヘッダー */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl">⚡</div>
              <h1 className="text-xl font-bold text-gray-900">Shif-Post</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsBulkModalOpen(true)} className="h-9 px-3">
              <Plus className="h-4 w-4 mr-1" />
              一括入力
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        {/* 月間サマリー */}
        <div className="py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-600">月間予定時間</div>
                  <div className="text-lg font-bold">{getTotalHours().toFixed(2)}h</div>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="text-green-600">💰</div>
                <div>
                  <div className="text-xs text-gray-600">予想月収</div>
                  <div className="text-lg font-bold">¥{calculateMonthlyIncome().toLocaleString()}</div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-3">
            <div className="flex items-center gap-3">
              <Label htmlFor="hourlyWage" className="text-sm whitespace-nowrap">
                時給
              </Label>
              <Input
                id="hourlyWage"
                type="number"
                value={hourlyWage}
                onChange={(e) => setHourlyWage(Number(e.target.value))}
                className="h-9 flex-1"
              />
            </div>
          </Card>
        </div>

        {/* ビュー切り替え */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveView("calendar")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeView === "calendar" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            カレンダー
          </button>
          <button
            onClick={() => setActiveView("list")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeView === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <List className="h-4 w-4" />
            リスト
          </button>
        </div>

        {/* カレンダービュー */}
        {activeView === "calendar" && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{format(currentMonth, "yyyy年M月", { locale: ja })}</CardTitle>
              <CardDescription className="text-sm">
                日付をタップしてシフト登録 | 曜日をタップして一括入力
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={ja}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="w-full"
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
                            className={`w-full font-medium text-sm p-3 cursor-pointer transition-colors rounded-md ${weekdayColors[index]} hover:bg-gray-100 active:bg-gray-200`}
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
                    const isAllDay = shift?.timeSlots.includes("終日")
                    return (
                      <div className="relative w-full h-full flex flex-col items-center justify-center p-1 min-h-[60px]">
                        <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                        {shift && (
                          <div className="text-xs space-y-0.5 w-full">
                            {isAllDay ? (
                              <div className="bg-red-100 text-red-700 px-1 py-0.5 rounded text-center truncate text-xs font-bold">
                                終日
                              </div>
                            ) : (
                              <>
                                {shift.timeSlots.slice(0, 1).map((slot, index) => (
                                  <div
                                    key={index}
                                    className="bg-white/90 text-gray-700 px-1 py-0.5 rounded text-center truncate text-xs"
                                  >
                                    {slot}
                                  </div>
                                ))}
                                {shift.timeSlots.length > 1 && (
                                  <div className="text-xs text-center text-white/80">+{shift.timeSlots.length - 1}</div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  },
                }}
                classNames={{
                  months: "flex flex-col space-y-4 w-full",
                  month: "space-y-4 w-full",
                  caption: "flex justify-center pt-1 relative items-center text-lg font-medium",
                  caption_label: "text-lg font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-md hover:bg-gray-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex w-full",
                  head_cell: "text-muted-foreground rounded-md w-full font-normal text-sm p-2",
                  row: "flex w-full mt-1",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full min-h-[60px] border border-gray-100 rounded-md",
                  day: "h-full w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md transition-colors",
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside:
                    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_hidden: "invisible",
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* リストビュー */}
        {activeView === "list" && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">今月のシフト</CardTitle>
              <CardDescription>登録済み勤務希望一覧</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {monthlyShifts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-gray-500">まだシフトが登録されていません</p>
                  <Button onClick={() => setActiveView("calendar")} variant="outline" className="mt-3">
                    カレンダーで登録
                  </Button>
                </div>
              ) : (
                monthlyShifts.map((shift, index) => {
                  const totalHours = shift.timeSlots.reduce((sum, slot) => sum + calculateHoursForSlot(slot), 0)
                  const income = totalHours * hourlyWage
                  return (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg space-y-3 active:bg-gray-100 transition-colors"
                      onClick={() => {
                        setSelectedDate(shift.date)
                        setIsModalOpen(true)
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{format(shift.date, "M月d日(E)", { locale: ja })}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShiftDelete(shift.date)
                          }}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {shift.timeSlots.map((slot, slotIndex) => (
                          <Badge
                            key={slotIndex}
                            variant={slot === "終日" ? "destructive" : "secondary"}
                            className="text-sm py-1"
                          >
                            {slot === "終日" && <Sun className="h-3 w-3 mr-1.5" />}
                            {slot}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 flex justify-between">
                        <span>{totalHours.toFixed(2)}時間</span>
                        <span className="font-medium">¥{income.toLocaleString()}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        )}

        {/* エクスポート */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">エクスポート</CardTitle>
          </CardHeader>
          <CardContent>
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
