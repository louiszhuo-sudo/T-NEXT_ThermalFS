// utils/timeFormatter.ts

/**
 * 通用的時間格式化工具，不依賴 Nuxt 環境
 */
export const formatted = (
    ts: number | string | Date,
    format: string = 'YYYY-MM-DD HH:mm:ss' // 習慣上秒建議用小寫 ss
) => {
    if (ts === null || ts === undefined || ts === '') return '--'

    let num = Number(ts)

    if (!Number.isFinite(num)) return '--'
    // 檢查是否為合理的 Timestamp 範圍 (秒級或毫秒級)
    if (num < 1e9 || num > 1e13) return '--'
    // 如果是秒級 (10位數)，轉為毫秒級 (13位數)
    if (num < 1e11) num *= 1000

    const date = new Date(num)
    if (isNaN(date.getTime())) return '--'

    const YYYY = String(date.getFullYear())
    const MM = String(date.getMonth() + 1).padStart(2, '0')
    const DD = String(date.getDate()).padStart(2, '0')
    const HH = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    const ss = String(date.getSeconds()).padStart(2, '0')

    return format
        .replace(/YYYY/g, YYYY)
        .replace(/DD/g, DD)
        .replace(/HH/g, HH)
        .replace(/mm/g, mm)
        .replace(/SS/g, ss)
        .replace(/ss/g, ss)
        .replace(/MM/g, MM)
}