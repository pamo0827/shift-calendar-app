"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Clock, Save, Trash2 } from "lucide-react"

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

  useEffect(() => {
    if (existingShift) {
      setSelectedTimeSlots(existingShift.timeSlots)
    } else {
      setSelectedTimeSlots([])
    }
  }, [existingShift, isOpen])

  const handleTimeSlotToggle = (timeSlot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(timeSlot) ? prev.filter((slot) => slot !== timeSlot) : [...prev, timeSlot],
    )
  }

  const handleSave = () => {
    if (selectedDate) {
      onSave(selectedDate, selectedTimeSlots)
    }
  }

  const handleClear = () => {
    setSelectedTimeSlots([])
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            シフト登録
          </DialogTitle>
          <DialogDescription>
            {format(selectedDate, "M月d日(E)", { locale: ja })} の勤務可能時間を選択してください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 選択中の時間帯表示 */}
          {selectedTimeSlots.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">選択中の時間帯:</div>
              <div className="flex flex-wrap gap-1">
                {selectedTimeSlots.map((slot) => (
                  <Badge key={slot} variant="default" className="text-xs">
                    {slot}
                  </Badge>
                ))}
              </div>
              <Separator />
            </div>
          )}

          {/* 時間帯選択 */}
          <div className="space-y-3">
            <div className="text-sm font-medium">勤務可能時間帯を選択:</div>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((timeSlot) => (
                <div key={timeSlot} className="flex items-center space-x-2">
                  <Checkbox
                    id={timeSlot}
                    checked={selectedTimeSlots.includes(timeSlot)}
                    onCheckedChange={() => handleTimeSlotToggle(timeSlot)}
                  />
                  <label
                    htmlFor={timeSlot}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {timeSlot}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2 pt-4">
            {existingShift && (
              <Button variant="destructive" onClick={handleDelete} className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1"
              disabled={selectedTimeSlots.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              クリア
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
