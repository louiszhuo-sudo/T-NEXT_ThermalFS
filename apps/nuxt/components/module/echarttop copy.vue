<template>
    <div style="width: 100%;height: 100%;">
        <div style="width: 100%;height: 100%;" ref="echarts2"></div>
    </div>
</template>

<script setup>
const { $formatted } = useNuxtApp()
const props = defineProps({
    chartsData: {
        type: Object,
        required: true
    }
    // windowData: Object,
    // onClose: Function,
    // onBringToFront: Function,
    // onMinimize: Function,
    // openhistory: Function
})

const echarts2 = ref(null)
const chart = ref(null)
const runEcharts = (refValue, key) => {
    var myChart = echarts.init(refValue);
    const time = []
    const data = [0];
    // 取得最小值
    const minValue = Math.min(...data);
    if (props.chartsData?.data) {
        props.chartsData.data.forEach((item) => {
            time.push($formatted(item[0]))
            data.push(item[1])
        })
        const mainData = data.slice(0, -1);
        const arrowStart = mainData.length - 1;
        const arrowEnd = mainData.length;
    }

    const option = {
        animation: false,                // 🚫 關閉整體動畫（最重要）
        // 💡 背景色 (可省略)
        backgroundColor: '#fff',

        grid: {
            top: 50,
            bottom: 50,
            // left: 20,
            // right: 20,
            // containLabel: false // 不保留軸文字區域 → 滿版
        },

        xAxis: {
            type: 'category',
            data: time,
            // show: false, // ❌ 不顯示軸線/刻度/標籤
            align: 'left',       // 對齊方式 (left/right/center)
            boundaryGap: false,  // ✅ 線貼齊邊界
        },
        yAxis: {
            type: 'value',
            show: false, // ❌ 不顯示軸線/刻度/標籤
        },

        series: [
            {
                name: 'Fake Data',
                type: 'line',
                smooth: true,
                symbol: 'none',
                symbolSize: 5,
                sampling: 'average',
                itemStyle: {
                    color: '#1CC830'
                },
                stack: 'a',
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgba(28,200,48,1)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(28,200,48,0.2)'
                        }
                    ])
                },
                data: data
            }
        ],
        graphic: [
            {
                type: 'text',
                left: '91%',
                bottom: "25%",
                style: {
                    text: `${minValue}`,
                    fill: '#272727',
                    // font: 'bold 16px "Microsoft YaHei", sans-serif',
                    textAlign: 'right',
                    textVerticalAlign: 'bottom'
                }
            }
        ]
    };

    option && myChart.setOption(option);
    return myChart
}

// 🔥 監聽 props 更新 → 更新圖表
watch(
    () => props.chartsData,
    (newVal) => {
        if (!chart.value) return;
        const time = []
        const data = []

        newVal.data.forEach((item) => {
            time.push($formatted(item[0], "HH:SS"))
            data.push(item[1])
        })

        const mainData = data.slice(0, -1)
        const arrowStart = mainData.length - 1
        const arrowEnd = mainData.length

        // ✅ 閾值
        const threshold = props.chartsData.roi_thresholdManual
        // ✅ 資料最大值
        const maxVal = Math.max(...data)

        // ✅ 如果所有數值都低於閾值 → 人為提升 y 軸最大值
        const yMax = maxVal < threshold ? threshold * 1.1 : undefined   // +10% buffer

        chart.value.setOption({
            xAxis: { data: time },
            yAxis: {
                max: yMax,               // ✅ 強制 max (若 undefined，ECharts 自動決定)
                min: 0
            },
            series: [{
                data,
                itemStyle: {
                    color: data[data.length - 1] >= threshold ? '#F31414' : '#399600'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: data[data.length - 1] >= threshold
                                ? 'rgba(243,20,20,0.2)'
                                : 'rgba(28,200,48,0.2)'
                        },
                        {
                            offset: 1,
                            color: data[data.length - 1] >= threshold
                                ? 'rgba(243,20,20,0)'
                                : 'rgba(28,200,48,0)'
                        }
                    ])
                },
                markLine: {
                    silent: true,
                    symbol: ['none', 'none'],
                    symbolSize: 6,
                    lineStyle: {
                        color: data[data.length - 1] >= threshold ? '#F31414' : '#399600',
                        width: 3,
                        type: 'solid'
                    },
                    itemStyle: {
                        color: '#1CC830'
                    },
                    data: [
                        [
                            { coord: [arrowEnd, data[arrowEnd]] },
                            { coord: [arrowEnd, data[arrowEnd]] }
                        ],
                        {
                            name: '閾值',
                            yAxis: threshold,
                            lineStyle: {
                                color: '#000',
                                width: 1,
                                type: 'dashed'
                            },
                            label: {
                                formatter: '{b}',
                                position: 'insideStartTop'
                            }
                        },
                        {
                            yAxis: threshold,
                            lineStyle: { color: 'transparent' },
                            label: {
                                show: true,
                                formatter: threshold,
                                position: 'end',
                                color: '#000',
                                padding: [2, 4],
                                borderRadius: 3
                            }
                        }
                    ]
                }
            }]
        })

        if (false) {
            const time = []
            const data = [];
            newVal.data.forEach((item) => {
                time.push($formatted(item[0], "HH:SS"))
                data.push(item[1])
            })
            const mainData = data.slice(0, -1);
            const arrowStart = mainData.length - 1;
            const arrowEnd = mainData.length;
            // newVal.data.forEach((item) => {
            //     time.push($formatted(item[0]));
            //     data.push(item[1]);
            // });

            chart.value.setOption(
                {
                    xAxis: {
                        data: time
                    },
                    series: [{
                        data,
                        itemStyle: {
                            color: data[data.length - 1] >= props.chartsData.roi_thresholdManual ? '#F31414' : '#399600'
                        },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: data[data.length - 1] >= props.chartsData.roi_thresholdManual ? 'rgba(243,20,20,0.2)' : 'rgba(28,200,48,0.2)'
                                },
                                {
                                    offset: 1,
                                    color: data[data.length - 1] >= props.chartsData.roi_thresholdManual ? 'rgba(243,20,20,0)' : 'rgba(28,200,48,0)'
                                }
                            ])
                        },
                        markLine: {
                            silent: true,
                            symbol: ['none', 'circle'],  // ✅ 終點為圓點
                            symbolSize: 6,               // ✅ 圓點大小 (px)
                            lineStyle: {
                                color: data[data.length - 1] >= props.chartsData.roi_thresholdManual ? '#F31414' : '#399600',
                                width: 3,
                                type: 'solid'
                            },
                            itemStyle: {
                                color: '#1CC830'
                            },
                            data: [
                                [
                                    { coord: [arrowEnd, data[arrowEnd]] },
                                    { coord: [arrowEnd, data[arrowEnd]] }
                                ],
                                {
                                    name: '閾值',
                                    yAxis: props.chartsData.roi_thresholdManual,
                                    lineStyle: {
                                        color: '#000',
                                        width: 1,
                                        type: 'dashed'
                                    },
                                    label: {
                                        formatter: '{b}',
                                        position: 'insideStartTop'
                                    }
                                }, // 右邊：顯示數值 (20)
                                {
                                    yAxis: props.chartsData.roi_thresholdManual,
                                    lineStyle: {
                                        color: 'transparent'        // ← 隱藏線，只留標籤
                                    },
                                    label: {
                                        show: true,
                                        formatter: props.chartsData.roi_thresholdManual,
                                        position: 'end',            // ← 右邊
                                        color: '#000',
                                        padding: [2, 4],
                                        borderRadius: 3
                                    }
                                }
                            ]
                        }
                    }]
                }
            );

        }
    },
    { deep: true }
);
const echartSize = () => {
    setTimeout(() => {
        console.log('echartSize');
        if (chart.value !== null) {
            chart.value.resize();
        }
    }, 1)
}

onMounted(() => {
    setTimeout(() => {
        chart.value = runEcharts(echarts2.value)
        // myChart.resize();
    }, 1)
})


onBeforeUnmount(() => { })

defineExpose({
    echartSize
})
</script>