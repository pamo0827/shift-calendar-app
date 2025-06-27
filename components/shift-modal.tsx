"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Clock, Save, Trash2, X, Plus } from "lucide-react"

interface ShiftModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate?: Date
  existingShift?: { date: Date; timeSlots: string[] }
  onSave: (date: Date, timeSlots: string[]) => void
  onDelete?: () => void
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

export function ShiftModal({ isOpen, onClose, selectedDate, existingShift, onSave, onDelete }: ShiftModalProps) {
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([])
  const [isAllDay, setIsAllDay] = useState(false)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  useEffect(() => {
    if (isOpen && existingShift) {
      const isExistingAllDay = existingShift.timeSlots.includes("終日")
      setIsAllDay(isExistingAllDay)
      if (isExistingAllDay) {
        setSelectedTimeSlots(["終日"])
      } else {
        setSelectedTimeSlots(existingShift.timeSlots)
      }
    } else {
      setSelectedTimeSlots([])
      setIsAllDay(false)
      setStartTime("")
      setEndTime("")
    }
  }, [existingShift, isOpen])

  const handleTimeSlotToggle = (timeSlot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(timeSlot) ? prev.filter((slot) => slot !== timeSlot) : [...prev, timeSlot],
    )
  }

  const handleAllDayToggle = () => {
    setIsAllDay((prev) => {
      const newIsAllDay = !prev
      if (newIsAllDay) {
        setSelectedTimeSlots(["終日"])
      } else {
        setSelectedTimeSlots([])
      }
      return newIsAllDay
    })
  }

  const handleAddCustomTime = () => {
    if (startTime && endTime && `${startTime}-${endTime}`.match(/^\d{2}:\d{2}-\d{2}:\d{2}$/)) {
      const newTimeSlot = `${startTime}-${endTime}`
      if (!selectedTimeSlots.includes(newTimeSlot)) {
        setSelectedTimeSlots((prev) => [...prev, newTimeSlot])
      }
      setStartTime("")
      setEndTime("")
    } else {
      // Handle invalid time format
      alert("時間の形式が正しくありません (HH:MM-HH:MM)")
    }
  }

  const handleSave = () => {
    if (selectedDate) {
      if (isAllDay) {
        onSave(selectedDate, ["終日"])
      } else {
        onSave(selectedDate, selectedTimeSlots)
      }
    }
  }

  const handleClear = () => {
    setSelectedTimeSlots([])
    setIsAllDay(false)
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
      onClose()
    }
  }

  if (!selectedDate) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              シフト登録
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-base">
            {format(selectedDate, "M月d日(E)", { locale: ja })} の勤務可能時間を選択
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 選択中の時間帯表示 */}
          {selectedTimeSlots.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium">選択中の時間帯:</div>
              <div className="flex flex-wrap gap-2">
                {selectedTimeSlots.map((slot) => (
                  <Badge key={slot} variant={slot === "終日" ? "destructive" : "default"} className="text-sm py-1">
                    {slot}
                  </Badge>
                ))}
              </div>
              <Separator />
            </div>
          )}

          {/* 終日設定 */}
          <div
            className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
            onClick={handleAllDayToggle}
          >
            <Checkbox id="all-day" checked={isAllDay} onChange={handleAllDayToggle} className="pointer-events-none" />
            <label htmlFor="all-day" className="text-base font-medium leading-none cursor-pointer flex-1">
              終日
            </label>
          </div>

          <fieldset disabled={isAllDay} className="space-y-4">
            {/* カスタム時間入力 */}
            <div className="space-y-2">
              <div className="text-sm font-medium">時間帯を直接入力:</div>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-10"
                  aria-label="開始時間"
                />
                <span className="text-gray-500">-</span>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-10"
                  aria-label="終了時間"
                />
                <Button onClick={handleAddCustomTime} size="icon" variant="outline" className="h-10 w-10">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* 時間帯選択 */}
            <div className="space-y-3">
              <div className="text-sm font-medium">または、時間帯を選択:</div>
              {TIME_SLOTS.map((timeSlot) => (
                <div
                  key={timeSlot}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleTimeSlotToggle(timeSlot)}
                >
                  <Checkbox
                    id={timeSlot}
                    checked={selectedTimeSlots.includes(timeSlot)}
                    onChange={() => handleTimeSlotToggle(timeSlot)}
                    className="pointer-events-none"
                  />
                  <label htmlFor={timeSlot} className="text-base font-medium leading-none cursor-pointer flex-1">
                    {timeSlot}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>

          {/* アクションボタン */}
          <div className="space-y-3 pt-4">
            {existingShift && (
              <Button variant="destructive" onClick={handleDelete} className="w-full h-12 text-base">
                <Trash2 className="h-5 w-5 mr-2" />
                削除
              </Button>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleClear}
                className="h-12 text-base"
                disabled={selectedTimeSlots.length === 0 && !isAllDay}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                クリア
              </Button>
              <Button onClick={handleSave} className="h-12 text-base">
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

