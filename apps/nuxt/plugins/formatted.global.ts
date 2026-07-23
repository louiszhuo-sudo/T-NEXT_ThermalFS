export default defineNuxtPlugin(() => {
    const formatted = (
        ts: number | string | Date,
        format: string = 'YYYY-MM-DD HH:mm:SS'
    ) => {
        if (ts === null || ts === undefined || ts === '') return '--'

        let num = Number(ts)

        if (!Number.isFinite(num)) return '--'
        if (num < 1e9 || num > 1e13) return '--'

        if (num < 1e11) num *= 1000

        const date = new Date(num)
        if (isNaN(date.getTime())) return '--'

        const YYYY = String(date.getFullYear())
        const MM = String(date.getMonth() + 1).padStart(2, '0')   // 月
        const DD = String(date.getDate()).padStart(2, '0')
        const HH = String(date.getHours()).padStart(2, '0')
        const mm = String(date.getMinutes()).padStart(2, '0')     // 分
        const ss = String(date.getSeconds()).padStart(2, '0')

        // 🔥 替換順序必須先換分鐘再換月份，避免 MM 衝突
        return format
            .replace(/YYYY/g, YYYY)
            .replace(/DD/g, DD)
            .replace(/HH/g, HH)
            .replace(/mm/g, mm) // <--- 分鐘優先
            .replace(/SS/g, ss)
            .replace(/ss/g, ss)
            .replace(/MM/g, MM) // <--- 月份最後
    }

    return {
        provide: { formatted }
    }
})
