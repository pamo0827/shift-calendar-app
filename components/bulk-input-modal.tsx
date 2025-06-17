"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns"
import { ja } from "date-fns/locale"
import { Users, Save, Zap } from "lucide-react"

interface BulkInputModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (dates: Date[], timeSlots: string[]) => void
  currentMonth: Date
  preselectedWeekday?: number
}

const TIME_SLOTS = [
  "09:00-13:00",
  "10:00-14:00",
  "11:00-15:00",
  "12:00-16:00",
  "13:00-17:00",
  "14:00-18:00",
  "15:00-19:00",
  "16:00-20:00",
  "17:00-21:00",
  "18:00-22:00",
]

const WEEKDAYS = [
  { value: 0, label: "日曜日", color: "text-red-600" },
  { value: 1, label: "月曜日", color: "text-gray-700" },
  { value: 2, label: "火曜日", color: "text-gray-700" },
  { value: 3, label: "水曜日", color: "text-gray-700" },
  { value: 4, label: "木曜日", color: "text-gray-700" },
  { value: 5, label: "金曜日", color: "text-gray-700" },
  { value: 6, label: "土曜日", color: "text-blue-600" },
]

export function BulkInputModal({ isOpen, onClose, onSave, currentMonth, preselectedWeekday }: BulkInputModalProps) {
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([])
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([])

  useEffect(() => {
    if (preselectedWeekday !== undefined) {
      setSelectedWeekdays([preselectedWeekday])
    }
  }, [preselectedWeekday])

  useEffect(() => {
    if (!isOpen) {
      setSelectedWeekdays([])
      setSelectedTimeSlots([])
    }
  }, [isOpen])

  const handleWeekdayToggle = (weekday: number) => {
    setSelectedWeekdays((prev) => (prev.includes(weekday) ? prev.filter((day) => day !== weekday) : [...prev, weekday]))
  }

  const handleTimeSlotToggle = (timeSlot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(timeSlot) ? prev.filter((slot) => slot !== timeSlot) : [...prev, timeSlot],
    )
  }

  const getTargetDates = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

    return allDays.filter((date) => {
      return selectedWeekdays.includes(date.getDay()) && date >= new Date()
    })
  }

  const handleSave = () => {
    const targetDates = getTargetDates()
    onSave(targetDates, selectedTimeSlots)
    setSelectedWeekdays([])
    setSelectedTimeSlots([])
  }

  const handleClear = () => {
    setSelectedWeekdays([])
    setSelectedTimeSlots([])
  }

  const getWeekdayName = (weekday: number) => {
    return WEEKDAYS.find((w) => w.value === weekday)?.label || ""
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {preselectedWeekday !== undefined ? <Zap className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            {preselectedWeekday !== undefined ? `${getWeekdayName(preselectedWeekday)}の一括入力` : "一括シフト入力"}
          </DialogTitle>
          <DialogDescription>
            {format(currentMonth, "yyyy年M月", { locale: ja })} の曜日を指定してまとめて登録
            {preselectedWeekday !== undefined && (
              <span className="block text-blue-600 font-medium mt-1">
                {getWeekdayName(preselectedWeekday)}が選択されています
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 曜日選択 */}
          <div className="space-y-3">
            <div className="text-sm font-medium">対象曜日を選択:</div>
            <div className="grid grid-cols-2 gap-2">
              {WEEKDAYS.map((weekday) => (
                <div key={weekday.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`weekday-${weekday.value}`}
                    checked={selectedWeekdays.includes(weekday.value)}
                    onCheckedChange={() => handleWeekdayToggle(weekday.value)}
                  />
                  <label
                    htmlFor={`weekday-${weekday.value}`}
                    className={`text-sm font-medium leading-none cursor-pointer ${weekday.color}`}
                  >
                    {weekday.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* 時間帯選択 */}
          <div className="space-y-3">
            <div className="text-sm font-medium">勤務可能時間帯を選択:</div>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((timeSlot) => (
                <div key={timeSlot} className="flex items-center space-x-2">
                  <Checkbox
                    id={`bulk-${timeSlot}`}
                    checked={selectedTimeSlots.includes(timeSlot)}
                    onCheckedChange={() => handleTimeSlotToggle(timeSlot)}
                  />
                  <label htmlFor={`bulk-${timeSlot}`} className="text-sm font-medium leading-none cursor-pointer">
                    {timeSlot}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* プレビュー */}
          {selectedWeekdays.length > 0 && selectedTimeSlots.length > 0 && (
            <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">登録予定:</div>
              <div className="text-sm text-blue-700">対象日数: {getTargetDates().length}日</div>
              <div className="flex flex-wrap gap-1">
                {selectedTimeSlots.map((slot) => (
                  <Badge key={slot} variant="secondary" className="text-xs">
                    {slot}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1"
              disabled={selectedWeekdays.length === 0 && selectedTimeSlots.length === 0}
            >
              クリア
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={selectedWeekdays.length === 0 || selectedTimeSlots.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              一括登録
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
