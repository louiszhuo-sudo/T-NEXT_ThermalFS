<!-- components/DateTimeRangePicker.vue -->
<template>
    <div class="d-flex align-center pr-4 selectLable">
        <!-- <h4 class="pl-4" style="width: 100px;">選擇日期</h4> -->

        <v-menu v-model="menu" :close-on-content-click="false" location="bottom" offset="8"
            transition="fade-transition">
            <template #activator="{ props }">
                <input v-bind="props" id="myInput" class="c-input ml-4" style="width:400px" type="text"
                    :value="displayValue" readonly @click="openMenu" />
            </template>

            <v-card class="pa-4" min-width="720" elevation="10" rounded="xl">
                <div class="" style="position: relative;height: 450px;overflow: auto;">
                    <!-- Start -->
                    <div class="d-flex" style="min-width:320px;" ref="elemcander">
                        <div>
                            <div class="text-subtitle-2 mb-2">選擇開始時間日期</div>
                            <v-date-picker v-model="tmpStartDateOnlyDate" :max="tmpEndDateOnlyDate" color="primary"
                                show-adjacent-months hide-header>
                                <template v-slot:day="{ props }">
                                    <div @click="props.onClick" :class="getDateCellClass(props)" class="range-day-c"
                                        :style="props.disabled ? 'pointer-events: none;opacity: 0.5;' : ''">
                                        {{ props.text }}
                                    </div>
                                    <!-- <div :class="getDateCellClass(props)" class="d-flex align-center justify-center"
                                        style="width: 100%; height: 100%; border-radius: 999px;">
                                        {{ new Date(props).getDate() }}1
                                    </div> -->
                                </template>
                            </v-date-picker>

                        </div>
                        <div>
                            <div class="text-subtitle-2 mb-2">選擇結束時間日期</div>
                            <v-date-picker v-model="tmpEndDateOnlyDate" :min="tmpStartDateOnlyDate" color="primary"
                                show-adjacent-months hide-header>
                                <template v-slot:day="{ props }">
                                    <div @click="props.onClick" :class="getDateCellClass(props)" class="range-day-c"
                                        :style="props.disabled ? 'pointer-events: none;opacity: 0.5;' : ''">
                                        {{ props.text }}
                                    </div>
                                    <!-- <div :class="getDateCellClass(props)" class="d-flex align-center justify-center"
                                        style="width: 100%; height: 100%; border-radius: 999px;">
                                        {{ new Date(props).getDate() }}1
                                    </div> -->
                                </template>
                            </v-date-picker>

                        </div>
                    </div>
                    <div style="width: 100%;" class="mt-3">
                        <v-btn block variant="tonal" @click="scrollToStartTime">⏱ 前往時間選擇</v-btn>
                    </div>
                    <!-- End -->
                    <div class="d-flex" style="min-width:320px;">
                        <div>
                            <v-time-picker v-model="tmpStartTimeStr" format="24hr" :use-seconds="true" scrollable
                                color="#1976D2" :view="view"
                                @update:hour="(e) => { updateTime(e, parseInt(tmpStartTimeStr.split(':')[1] || '0'), 'start'); view.value = 'hour'; }"
                                @update:minute="(e) => { updateTime(parseInt(tmpStartTimeStr.split(':')[0] || '0'), e, 'start'); view.value = 'minute'; }"
                                title="" />
                        </div>
                        <div>
                            <v-time-picker v-model="tmpEndTimeStr" format="24hr" :use-seconds="true" scrollable
                                :view="viewEnd" color="#1976D2"
                                @update:hour="(e) => { updateTime(e, parseInt(tmpEndTimeStr.split(':')[1] || '0'), 'end'); viewEnd.value = 'hour'; }"
                                @update:minute="(e) => { updateTime(parseInt(tmpEndTimeStr.split(':')[0] || '0'), e, 'end'); viewEnd.value = 'minute'; }"
                                title="" />
                        </div>
                    </div>
                    <div style="width: 100%;" ref="elemTime">
                        <v-btn block variant="tonal" @click="scrollToEndTime">⏱ 回日期選擇</v-btn>
                    </div>
                </div>
                <v-divider class="my-4" />

                <div class="d-flex align-center justify-space-between">
                    <div class="text-caption" style="font-size: .8em;">
                        {{ helperText }}
                    </div>
                    <div class="d-flex ga-2">
                        <v-btn variant="text" @click="onCancel">取消</v-btn>
                        <v-btn color="primary" :disabled="!isRangeValid" @click="onConfirm">
                            確定
                        </v-btn>
                    </div>
                </div>
            </v-card>
        </v-menu>
    </div>
</template>

<script setup lang="ts">
const elemTime = ref('')
const elemcander = ref('')
const view = ref<'hours' | 'minutes' | 'seconds'>('hours')
const viewEnd = ref<'hours' | 'minutes' | 'seconds'>('hours')
/** 預設：今天 00:00:00 ～ 今天 23:59:59 */
const today = new Date()
const startDefault = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
const endDefault = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

const state = reactive({
    date: [startDefault, endDefault] as [Date, Date],
})
const emit = defineEmits(['setDate'])
const scrollToStartTime = () => elemTime.value?.scrollIntoView({ behavior: 'smooth' })
const scrollToEndTime = () => elemcander.value?.scrollIntoView({ behavior: 'smooth' })
/** 下拉狀態與暫存 */
const menu = ref(false)
const tmpStart = ref<Date>(new Date(state.date[0]))
const tmpEnd = ref<Date>(new Date(state.date[1]))

/** 👉 日曆要用 Date，不是字串！ */
const tmpStartDateOnlyDate = ref<Date>(dateOnly(tmpStart.value))
const tmpEndDateOnlyDate = ref<Date>(dateOnly(tmpEnd.value))

/** 延伸功能 */

/** 時間用字串，合併時再轉 Date */
const tmpStartTimeStr = ref<string>(formatTimeOnly(tmpStart.value)) // HH:mm:ss
const tmpEndTimeStr = ref<string>(formatTimeOnly(tmpEnd.value))

const updateTime = (h: number, m: number, type: string) => {
    const hour = h.toString().padStart(2, '0')
    const minute = m.toString().padStart(2, '0')
    if (type === "start") {
        tmpStartTimeStr.value = `${hour}:${minute}:00` // 如果你不需要秒數可以省略
    } else if (type === "end") {
        tmpEndTimeStr.value = `${hour}:${minute}:00` // 如果你不需要秒數可以省略
    }
}
/** 顯示在 input 的文字 */
const displayValue = computed(() => {
    const [s, e] = state.date
    return `${formatDateTime(s)} - ${formatDateTime(e)}`
})

/** 有效性與提示 */
const isRangeValid = computed(() => tmpEnd.value.getTime() >= tmpStart.value.getTime())
const helperText = computed(() => {
    if (!isRangeValid.value) return '結束時間不可早於開始時間'
    const dur = (tmpEnd.value.getTime() - tmpStart.value.getTime()) / 1000
    return `已選：${formatDateTime(tmpStart.value)} ~ ${formatDateTime(tmpEnd.value)}（共 ${prettyDuration(dur)}）`
})

/** 同步：日曆 or 時間任一改變，就合併成 tmpStart/tmpEnd */
watch([tmpStartDateOnlyDate, tmpStartTimeStr], () => {
    tmpStart.value = mergeDateTimeFromDate(tmpStartDateOnlyDate.value, tmpStartTimeStr.value)
})
watch([tmpEndDateOnlyDate, tmpEndTimeStr], () => {
    tmpEnd.value = mergeDateTimeFromDate(tmpEndDateOnlyDate.value, tmpEndTimeStr.value)
})
/** 計算日期的範圍 */
function getDateCellClass(dateStr: string) {
    const cellDate = new Date(parseZhDate(dateStr['aria-label']))
    const start = tmpStartDateOnlyDate.value
    const end = tmpEndDateOnlyDate.value

    const isInRange =
        start && end &&
        cellDate.getTime() > start.getTime() &&
        cellDate.getTime() < end.getTime()

    const isStart = cellDate.toDateString() === start.toDateString()
    const isEnd = cellDate.toDateString() === end.toDateString()

    return {
        'range-middle': isInRange,
        'range-start': isStart,
        'range-end': isEnd,
    }
}
function parseZhDate(str: string): Date | null {
    const match = str.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
    if (!match) return null

    const [_, year, month, day] = match
    return new Date(Number(year), Number(month) - 1, Number(day))
}

/** 打開選單：把目前值複製到暫存 */
function openMenu() {
    tmpStart.value = new Date(state.date[0])
    tmpEnd.value = new Date(state.date[1])

    tmpStartDateOnlyDate.value = dateOnly(tmpStart.value)
    tmpEndDateOnlyDate.value = dateOnly(tmpEnd.value)
    tmpStartTimeStr.value = formatTimeOnly(tmpStart.value)
    tmpEndTimeStr.value = formatTimeOnly(tmpEnd.value)

    menu.value = true
}

function onCancel() {
    menu.value = false
}

function onConfirm() {
    if (!isRangeValid.value) return
    state.date = [new Date(tmpStart.value), new Date(tmpEnd.value)]
    emit('setDate', state.date)
    menu.value = false
}

/* ----------------------------------------
 * Utils
 * -------------------------------------- */
function pad(n: number) { return String(n).padStart(2, '0') }

function dateOnly(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
}
function formatDateOnly(d: Date) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function formatTimeOnly(d: Date) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
function formatDateTime(d: Date) {
    return `${formatDateOnly(d)} ${formatTimeOnly(d)}`
}

function mergeDateTimeFromDate(dateObj: Date, timeStr: string) {
    // dateObj: Date（僅取年月日）；timeStr: 'HH:mm:ss'
    const y = dateObj.getFullYear()
    const m = dateObj.getMonth()
    const dd = dateObj.getDate()
    const [hh, mm, ss] = timeStr.split(':').map(n => Number(n) || 0)
    return new Date(y, m, dd, hh, mm, ss)
}

function prettyDuration(sec: number) {
    const s = Math.max(0, Math.floor(sec))
    const days = Math.floor(s / 86400)
    const hours = Math.floor((s % 86400) / 3600)
    const minutes = Math.floor((s % 3600) / 60)
    const seconds = s % 60
    const parts: string[] = []
    if (days) parts.push(`${days}天`)
    if (hours) parts.push(`${hours}時`)
    if (minutes) parts.push(`${minutes}分`)
    if (seconds || parts.length === 0) parts.push(`${seconds}秒`)
    return parts.join('')
}
</script>

<style scoped>
.c-input {
    height: 40px;
    line-height: 40px;
    border: 1px solid var(--v-theme-outline-variant, #ddd);
    border-radius: 10px;
    padding: 0 12px;
    background: var(--v-theme-surface, #fff);
    color: var(--v-theme-on-surface, #222);
    cursor: pointer;
}

.c-input:focus {
    outline: none;
    border-color: var(--v-theme-primary, #1867c0);
    box-shadow: 0 0 0 3px rgba(24, 103, 192, 0.15);
}
</style>
<style>
.range-day-c {
    cursor: pointer;
    border: 1px solid #878787;
    width: 30px;
    height: 30px;
    text-align: center;
    border-radius: 24px;
    line-height: 1.8;
    transition: all 0.2s;
    background-color: #fff;
    color: #000;
    /* 預設黑字 */
}

.range-day-c:hover {
    background-color: #f0f0f0;
    color: #000;
}

.range-middle {
    /* background-color: rgba(25, 118, 210, 0.2); */
    /* 淺藍底 */
    /* color: #1976d2; */
    /* font-weight: bold; */
    background-color: rgba(25, 118, 210, 0.2);
    color: #1976d2;
    font-weight: bold;
    border-radius: 0px;
    border-top: 1px solid #1976d227;
    border-bottom: 1px solid #1976d227;
    border-right: 0px solid #1976d24a;
    border-left: 0px solid #1976d24a;
    width: 100%;
}

.range-middle:hover {
    background-color: rgba(25, 118, 210, 0.336);
    color: #1976d2;
}

/* 起點與終點：深藍底白字 */
.range-start,
.range-end {
    background-color: #1976d2;
    color: white;
    font-weight: bold;
}

/* 防止 hover 變白字 + 白底 */
.range-start:hover,
.range-end:hover {
    background-color: #145ea0;
    /* 深藍一點 */
    color: white;
}
</style>