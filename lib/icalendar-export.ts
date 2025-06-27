use client"

interface Shift {
  date: Date
  timeSlots: string[]
}

const toYyyyMmDd = (date: Date): string => {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  const d = date.getDate().toString().padStart(2, "0")
  return `${y}${m}${d}`
}

const toVCalendarDateTime = (date: Date): string => {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  const d = date.getDate().toString().padStart(2, "0")
  const H = date.getHours().toString().padStart(2, "0")
  const M = date.getMinutes().toString().padStart(2, "0")
  const S = date.getSeconds().toString().padStart(2, "0")
  return `${y}${m}${d}T${H}${M}${S}`
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
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Tokyo",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0900",
    "TZOFFSETTO:+0900",
    "TZNAME:JST",
    "END:STANDARD",
    "END:VTIMEZONE",
  ]

  monthShifts.forEach((shift) => {
    shift.timeSlots.forEach((timeSlot, slotIndex) => {
      const uid = `shift-${shift.date.getTime()}-${slotIndex}@shif-post.app`
      const dtStamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 15) + "Z"

      icalContent.push("BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${dtStamp}`)

      if (timeSlot === "終日") {
        const startDate = toYyyyMmDd(shift.date)
        const nextDay = new Date(shift.date)
        nextDay.setDate(nextDay.getDate() + 1)
        const endDate = toYyyyMmDd(nextDay)

        icalContent.push(`DTSTART;VALUE=DATE:${startDate}`, `DTEND;VALUE=DATE:${endDate}`, `SUMMARY:シフト (終日)`)
      } else {
        const [startTime, endTime] = timeSlot.split("-")
        if (!startTime || !endTime || !startTime.includes(":") || !endTime.includes(":")) {
          return
        }
        const [startHour, startMinute] = startTime.split(":").map(Number)
        const [endHour, endMinute] = endTime.split(":").map(Number)

        const startDateTime = new Date(shift.date)
        startDateTime.setHours(startHour, startMinute, 0, 0)

        const endDateTime = new Date(shift.date)
        endDateTime.setHours(endHour, endMinute, 0, 0)

        if (endDateTime <= startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1)
        }

        const dtStart = toVCalendarDateTime(startDateTime)
        const dtEnd = toVCalendarDateTime(endDateTime)

        icalContent.push(
          `DTSTART;TZID=Asia/Tokyo:${dtStart}`,
          `DTEND;TZID=Asia/Tokyo:${dtEnd}`,
          `SUMMARY:シフト (${timeSlot})`,
        )
      }

      icalContent.push(
        "DESCRIPTION:Shif-Postで登録されたシフトです。",
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
  link.download = `shif-post-${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
