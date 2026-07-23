<template>
    <div ref="chartWrap" style="width: 100%; height: 100%;">
        <canvas style="width: 100%; height: 100%;" ref="echarts2"></canvas>
    </div>
</template>

<script setup>
import { encode } from "@msgpack/msgpack";

const props = defineProps({
    chartsData: {
        type: Object,
        required: true
    },
    chartTextSize: {
        type: String,
        default: '12px'
    },
    xAxisTextSize: {
        type: String,
        default: ''
    }
})

const chartWrap = ref(null)
const echarts2 = ref(null)
const wk = ref(null)
const DEFAULT_CHART_TEXT_SIZE_PX = 12

const resolveSizePx = (rawInput, fallback = DEFAULT_CHART_TEXT_SIZE_PX) => {
    const rawSize = `${rawInput ?? ''}`.trim().toLowerCase()
    const match = rawSize.match(/^(\d+(?:\.\d+)?)\s*(px|em)$/)

    if (!match) return fallback

    const value = Number(match[1])

    if (!Number.isFinite(value) || value <= 0) {
        return fallback
    }

    if (match[2] === 'px') {
        return value
    }

    const container = chartWrap.value ?? echarts2.value
    const containerHeight = container?.clientHeight ?? 0

    if (containerHeight <= 0) {
        return fallback
    }

    return Number((containerHeight * value).toFixed(2))
}

const resolveChartTextSizePx = () => resolveSizePx(props.chartTextSize)

const resolveXAxisTextSizePx = () => {
    const fallback = resolveChartTextSizePx()
    return resolveSizePx(props.xAxisTextSize, fallback)
}

const postWorkerUpdate = () => {
    if (wk.value === null || !props.chartsData) return;

    try {
        const newdata = encode(props.chartsData)
        const view = new Uint8Array(newdata)
        wk.value.postMessage({
            type: 'update',
            chartsData: view,
            textFontSize: resolveChartTextSizePx(),
            xAxisTextFontSize: resolveXAxisTextSizePx()
        }, [view.buffer]);
    } catch (error) {
        console.log(error);
    }
}

watch(
    () => props.chartsData,
    () => {
        postWorkerUpdate()
    },
    { deep: true }
);

watch(
    () => [props.chartTextSize, props.xAxisTextSize],
    () => {
        postWorkerUpdate()
    }
)

const echartSize = () => {
    setTimeout(() => {
        if (wk.value === null || echarts2.value === null) return;

        const width = echarts2.value.clientWidth;
        const height = echarts2.value.clientHeight;

        if (width <= 0 || height <= 0) return;

        wk.value.postMessage({
            type: 'resize',
            width,
            height,
            textFontSize: resolveChartTextSizePx(),
            xAxisTextFontSize: resolveXAxisTextSizePx()
        });
    }, 1)
}

const runwk = () => {
    const temp = new Worker(new URL('/workers/echarts/echartsTOP.worker.ts', import.meta.url), {
        type: 'module',
    })

    temp.addEventListener('message', (e) => {
        const res = e.data
        if (res.type === 'open') {
            try {
                const offscreen = echarts2.value.transferControlToOffscreen();
                const cData = encode(props.chartsData)
                const view = new Uint8Array(cData)

                temp.postMessage({
                    type: 'init',
                    canvas: offscreen,
                    width: echarts2.value.clientWidth,
                    height: echarts2.value.clientHeight,
                    chartsData: view,
                    textFontSize: resolveChartTextSizePx(),
                    xAxisTextFontSize: resolveXAxisTextSizePx()
                }, [offscreen, view.buffer]);
            } catch (error) {
                console.log(error);
            }
        }
    })

    wk.value = temp
}

onMounted(() => {
    runwk()
})

onBeforeUnmount(() => { })

defineExpose({
    echartSize
})
</script>
