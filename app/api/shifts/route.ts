import { type NextRequest, NextResponse } from "next/server"
import { InputValidator } from "@/lib/input-validator"
import { CSRFProtection } from "@/lib/csrf-protection"

export async function POST(request: NextRequest) {
  try {
    // CSRF トークンの検証
    const csrfToken = request.headers.get("x-csrf-token")
    const sessionToken = request.cookies.get("session-token")?.value

    if (!csrfToken || !sessionToken || !CSRFProtection.validateToken(csrfToken, sessionToken)) {
      return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 })
    }

    const body = await request.json()

    // 入力値の検証
    if (!InputValidator.validateString(body.userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    if (!InputValidator.validateDate(body.date)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    if (!InputValidator.validateArray(body.timeSlots, InputValidator.validateTimeSlot)) {
      return NextResponse.json({ error: "Invalid time slots" }, { status: 400 })
    }

    // 入力値のサニタイズ
    const sanitizedData = {
      userId: InputValidator.sanitizeHTML(body.userId),
      date: body.date,
      timeSlots: body.timeSlots.map((slot: string) => InputValidator.sanitizeHTML(slot)),
    }

    // データベース操作（実際の実装では適切なORM/クエリビルダーを使用）
    // const result = await saveShift(sanitizedData)

    return NextResponse.json({ success: true, message: "Shift saved successfully" })
  } catch (error) {
    console.error("Shift save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId || !InputValidator.validateString(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const sanitizedUserId = InputValidator.sanitizeHTML(userId)

    // データベースからシフトを取得
    // const shifts = await getShifts(sanitizedUserId)

    return NextResponse.json({ success: true, data: [] })
  } catch (error) {
    console.error("Shift fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
