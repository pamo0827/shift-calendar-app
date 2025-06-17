import DOMPurify from "isomorphic-dompurify"

export class InputValidator {
  // XSS対策のためのHTMLサニタイズ
  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    })
  }

  // SQLインジェクション対策のための文字列エスケープ
  static escapeSQL(input: string): string {
    return input.replace(/'/g, "''").replace(/;/g, "\\;")
  }

  // 時間スロットの検証
  static validateTimeSlot(timeSlot: string): boolean {
    const timeSlotRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeSlotRegex.test(timeSlot)
  }

  // 日付の検証
  static validateDate(date: string): boolean {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime()) && parsedDate > new Date()
  }

  // 時給の検証
  static validateHourlyWage(wage: number): boolean {
    return typeof wage === "number" && wage > 0 && wage <= 10000
  }

  // 一般的な文字列の検証
  static validateString(input: string, maxLength = 255): boolean {
    return typeof input === "string" && input.length <= maxLength && input.trim().length > 0
  }

  // 配列の検証
  static validateArray<T>(input: any, validator: (item: T) => boolean, maxLength = 10): boolean {
    return Array.isArray(input) && input.length <= maxLength && input.every(validator)
  }
}
