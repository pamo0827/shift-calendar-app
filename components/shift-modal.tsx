"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Clock, Save, Trash2, X } from "lucide-react"

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
                  <Badge key={slot} variant="default" className="text-sm py-1">
                    {slot}
                  </Badge>
                ))}
              </div>
              <Separator />
            </div>
          )}

          {/* 時間帯選択 */}
          <div className="space-y-4">
            <div className="text-sm font-medium">勤務可能時間帯を選択:</div>
            <div className="space-y-3">
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
          </div>

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
                disabled={selectedTimeSlots.length === 0}
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
