"use server"

import { revalidatePath } from "next/cache"

export interface Shift {
  id?: string
  userId: string
  date: string
  timeSlots: string[]
  createdAt?: Date
  updatedAt?: Date
}

// 実際の実装では、データベース（Supabase、Neon等）を使用
let shifts: Shift[] = []

export async function saveShift(userId: string, date: string, timeSlots: string[]) {
  try {
    // 既存のシフトを削除
    shifts = shifts.filter((shift) => !(shift.userId === userId && shift.date === date))

    // 新しいシフトを追加（時間帯が選択されている場合のみ）
    if (timeSlots.length > 0) {
      const newShift: Shift = {
        id: `${userId}-${date}-${Date.now()}`,
        userId,
        date,
        timeSlots,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      shifts.push(newShift)
    }

    revalidatePath("/")
    return { success: true, message: "シフトを保存しました" }
  } catch (error) {
    console.error("Error saving shift:", error)
    return { success: false, message: "シフトの保存に失敗しました" }
  }
}

export async function getShifts(userId: string) {
  try {
    const userShifts = shifts.filter((shift) => shift.userId === userId)
    return { success: true, data: userShifts }
  } catch (error) {
    console.error("Error fetching shifts:", error)
    return { success: false, data: [] }
  }
}

export async function deleteShift(userId: string, date: string) {
  try {
    shifts = shifts.filter((shift) => !(shift.userId === userId && shift.date === date))
    revalidatePath("/")
    return { success: true, message: "シフトを削除しました" }
  } catch (error) {
    console.error("Error deleting shift:", error)
    return { success: false, message: "シフトの削除に失敗しました" }
  }
}
