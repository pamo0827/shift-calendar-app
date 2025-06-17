export function generatePDF(
  shifts: Array<{ date: Date; timeSlots: string[] }>,
  currentMonth: Date,
  hourlyWage: number,
  monthlyIncome: number,
  totalHours: number,
) {
  // シンプルなHTML文字列を作成してPDF化
  const monthName = currentMonth.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>シフト表 - ${monthName}</title>
      <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .shift-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .shift-table th, .shift-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .shift-table th { background-color: #f2f2f2; }
        .time-slot { background: #e3f2fd; padding: 2px 6px; margin: 2px; border-radius: 3px; display: inline-block; font-size: 12px; }
        .weekend { color: #1976d2; font-weight: bold; }
        .sunday { color: #d32f2f; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>シフト表</h1>
        <h2>${monthName}</h2>
      </div>
      
      <div class="summary">
        <h3>月間サマリー</h3>
        <p><strong>総勤務時間:</strong> ${totalHours}時間</p>
        <p><strong>時給:</strong> ¥${hourlyWage.toLocaleString()}</p>
        <p><strong>予想月収:</strong> ¥${monthlyIncome.toLocaleString()}</p>
      </div>
      
      <table class="shift-table">
        <thead>
          <tr>
            <th>日付</th>
            <th>曜日</th>
            <th>勤務時間</th>
            <th>時間数</th>
            <th>日給</th>
          </tr>
        </thead>
        <tbody>
  `

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

  const monthShifts = shifts
    .filter((shift) => shift.date >= monthStart && shift.date <= monthEnd)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  monthShifts.forEach((shift) => {
    const dayOfWeek = shift.date.toLocaleDateString("ja-JP", { weekday: "short" })
    const dayClass = shift.date.getDay() === 0 ? "sunday" : shift.date.getDay() === 6 ? "weekend" : ""

    const dailyHours = shift.timeSlots.reduce((total, slot) => {
      const [start, end] = slot.split("-")
      const startHour = Number.parseInt(start.split(":")[0])
      const endHour = Number.parseInt(end.split(":")[0])
      return total + (endHour - startHour)
    }, 0)

    const dailyWage = dailyHours * hourlyWage

    htmlContent += `
      <tr>
        <td>${shift.date.getDate()}日</td>
        <td class="${dayClass}">${dayOfWeek}</td>
        <td>
          ${shift.timeSlots.map((slot) => `<span class="time-slot">${slot}</span>`).join("")}
        </td>
        <td>${dailyHours}時間</td>
        <td>¥${dailyWage.toLocaleString()}</td>
      </tr>
    `
  })

  htmlContent += `
        </tbody>
      </table>
      
      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
        生成日時: ${new Date().toLocaleString("ja-JP")}
      </div>
    </body>
    </html>
  `

  // 新しいウィンドウでHTMLを開いて印刷ダイアログを表示
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()

    // 少し待ってから印刷ダイアログを開く
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}
