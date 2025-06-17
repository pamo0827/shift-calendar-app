"use client"

interface Shift {
  date: Date
  timeSlots: string[]
}

export function exportToICalendar(shifts: Shift[], currentMonth: Date): void {
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

  const monthShifts = shifts.filter((shift) => shift.date >= monthStart && shift.date <= monthEnd)

  const icalContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shif-Post//Shift Calendar//JP",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Shif-Post シフト表",
    "X-WR-TIMEZONE:Asia/Tokyo",
    "X-WR-CALDESC:Shif-Postで作成されたシフト表",
  ]

  monthShifts.forEach((shift, shiftIndex) => {
    shift.timeSlots.forEach((timeSlot, slotIndex) => {
      const [startTime, endTime] = timeSlot.split("-")
      const [startHour, startMinute] = startTime.split(":").map(Number)
      const [endHour, endMinute] = endTime.split(":").map(Number)

      const startDateTime = new Date(shift.date)
      startDateTime.setHours(startHour, startMinute, 0, 0)

      const endDateTime = new Date(shift.date)
      endDateTime.setHours(endHour, endMinute, 0, 0)

      const uid = `shift-${shift.date.getTime()}-${slotIndex}@shif-post.app`
      const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
      const dtStart = startDateTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
      const dtEnd = endDateTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

      icalContent.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:シフト勤務 (${timeSlot})`,
        "DESCRIPTION:Shif-Postで登録されたシフト",
        "STATUS:CONFIRMED",
        "TRANSP:OPAQUE",
        "END:VEVENT",
      )
    })
  })

  icalContent.push("END:VCALENDAR")

  const icalString = icalContent.join("\r\n")
  const blob = new Blob([icalString], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `shif-post-${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, "0")}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
