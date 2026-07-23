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
    const bardata = [];
    const linedata = [];
    const xLabels = bardata.map((_, i) => i);

    const option = {
        animation: false,                // 🚫 關閉整體動畫（最重要）
        backgroundColor: 'transparent',  // ✅ 背景完全透明
        tooltip: { show: false },        // ✅ 不顯示提示框
        // 🧭 上下分兩個 grid
        grid: [
            {
                top: '20%',
                height: '50%',     // 上半部：line
                left: 0,
                right: 0,
                containLabel: false
            },
            {
                top: '70%',
                height: '50%',     // 下半部：bar
                left: 0,
                right: 0,
                containLabel: false
            }
        ],

        // ✴️ 共用同一組 X 軸
        xAxis: [
            {
                type: 'category',
                data: xLabels,
                boundaryGap: false,
                gridIndex: 0,
                show: false
            },
            {
                type: 'category',
                data: xLabels,
                boundaryGap: false,
                gridIndex: 1,
                show: false
            }
        ],

        // ✴️ 各自一組 Y 軸
        yAxis: [
            {
                type: 'value',
                gridIndex: 0,
                min: 50,   // 折線數據範圍
                max: 100,
                show: false
            },
            {
                type: 'value',
                gridIndex: 1,
                min: -5,   // bar 範圍
                max: 5,
                inverse: false, // ✅ 讓 bar 向下
                show: false
            }
        ],

        series: [
            // 🔶 上半部 Line
            {
                type: 'line',
                data: linedata,
                xAxisIndex: 0,
                yAxisIndex: 0,
                symbol: 'none',
                silent: true,                 // ✅ 關閉互動
                lineStyle: {
                    color: '#399600',
                    width: 2
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(28,200,48,0.5)' },
                        { offset: 1, color: 'rgba(28,200,48,0)' }
                    ])
                },
                markLine: {
                    silent: true,
                    symbol: ['none', 'circle'],
                    symbolSize: 5,
                    lineStyle: {
                        color: '#399600',
                        width: 2
                    },
                    data: [
                        [
                            { coord: [linedata.length - 1, linedata[linedata.length - 1]] },
                            { coord: [linedata.length - 1, linedata[linedata.length - 1]] }
                        ]
                    ]
                }
            },

            // 🔷 下半部 Bar
            {
                type: 'bar',
                data: bardata,
                xAxisIndex: 1,
                silent: true,                 // ✅ 關閉互動
                yAxisIndex: 1,
                barWidth: '60%',
                itemStyle: {
                    color: (params) => (params.value >= 0 ? '#38BDA5' : '#EDB1B0')
                },
                emphasis: { disabled: true },
                silent: true
            }
        ]
    };
    option && myChart.setOption(option);
    return myChart
}
const runEcharts1 = (refValue, key) => {
    var myChart = echarts.init(refValue);
    const data = props.chartsData.absTemp_curve;
    const relativeTmepBar = props.chartsData.relativeTmep_bar;
    // for (var i = 0; i < 30; i++) {
    //     data.push(Math.floor(Math.random() * 3000))
    // }
    // const mainData = data.slice(0, -1);
    const mainData = data;
    const arrowStart = mainData.length - 1;
    const arrowEnd = mainData.length;

    const option = {
        // 💡 背景色 (可省略)
        backgroundColor: '#fff',

        grid: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            containLabel: false // 不保留軸文字區域 → 滿版
        },

        xAxis: {
            type: 'category',
            data: data.map((_, i) => i),
            show: false, // ❌ 不顯示軸線/刻度/標籤
            nameLocation: 'middle',
            boundaryGap: false,  // ✅ 線貼齊邊界
        },
        yAxis: {
            type: 'value',
            show: false, // ❌ 不顯示軸線/刻度/標籤
            inverse: false
        },

        series: [
            // 🔷 背景 Bar
            {
                type: 'bar',
                data: relativeTmepBar,
                barWidth: '80%',
                itemStyle: {
                    color: '#AFAFAF' // 半透明藍色底
                },
                emphasis: { disabled: true }, // 不要 hover 效果
                silent: true // 不可互動
            },

            // 🔶 主趨勢線 + 箭頭
            {
                type: 'line',
                data: mainData,
                symbol: 'none',
                lineStyle: {
                    color: '#399600',
                    width: 1,
                    type: 'solid'
                },
                itemStyle: {
                    color: '#1CC830'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(28,200,48,0.5)' },
                        { offset: 1, color: 'rgba(28,200,48,0)' }
                    ])
                },
                markLine: {
                    silent: true,
                    symbol: ['none', 'circle'],  // ✅ 終點為圓點
                    symbolSize: 6,               // ✅ 圓點大小 (px)
                    lineStyle: {
                        color: '#399600',
                        width: 3,
                        type: 'solid'
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
            }
        ]
    };

    option && myChart.setOption(option);
    return myChart
}
const echartSize = () => {
    setTimeout(() => {
        if (chart.value !== null) {
            chart.value.resize();
        }
    }, 1)
}
watch(
    () => props.chartsData,
    (newVal) => {
        if (!chart.value) return;
        const data = newVal.absTemp_curve;
        const relativeTmepBar = newVal.relativeTmep_bar;
        const mainData = data;
        const arrowStart = mainData.length - 1;
        const arrowEnd = mainData.length;
        // const xLabels = relativeTmepBar.map((_, i) => i);
        // console.log('newValnewVal', newVal);
        // ✅ 閾值
        const threshold = props.chartsData.roi_thresholdManual;

        // ✅ 呼叫改良後的 y 軸自動調整函式
        const yAxis = getDynamicYAxis(data, relativeTmepBar, threshold);

        chart.value.setOption({
            yAxis, // ✅ 更新兩個 Y 軸
            xAxis: { data: data.map((_, i) => i) },
            series: [
                {
                    data,
                    lineStyle: {
                        color: data[data.length - 1] >= threshold ? '#F31414' : '#399600',
                        width: 2
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
                        symbolSize: 5,
                        lineStyle: {
                            color: data[data.length - 1] >= threshold ? '#F31414' : '#399600',
                            width: 2
                        },
                        data: [
                            [
                                { coord: [data.length - 1, data[data.length - 1]] },
                                { coord: [data.length - 1, data[data.length - 1]] }
                            ],
                            {
                                name: '',
                                yAxis: threshold,
                                lineStyle: {
                                    color: '#575757',
                                    width: 1,
                                    type: 'dashed'
                                },
                                label: {
                                    formatter: '{b}',
                                    position: 'insideStartTop'
                                }
                            }
                        ]
                    }
                },
                {
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: relativeTmepBar.map(v => Math.abs(v)),
                    // barWidth: '60%',
                    barWidth: '95%',        // ✅ 控制柱寬
                    barCategoryGap: '1%',  // ✅ 控制柱之間的間距
                    itemStyle: {
                        color: params => {
                            const originalValue = relativeTmepBar[params.dataIndex];
                            return originalValue < 0 ? '#78C781' : '#F3C9C8';
                        }
                    },
                    emphasis: { disabled: true },
                    silent: true
                }
            ]
        });
        if (false) {
            const data = newVal.absTemp_curve;
            const relativeTmepBar = newVal.relativeTmep_bar;
            // for (var i = 0; i < 30; i++) {
            //     data.push(Math.floor(Math.random() * 3000))
            // }
            // const mainData = data.slice(0, -1);
            const mainData = data;
            const arrowStart = mainData.length - 1;
            const arrowEnd = mainData.length;

            chart.value.setOption(
                {
                    yAxis: getDynamicYAxis(data, relativeTmepBar.map(v => {
                        // console.log(Math.abs(v));
                        return Math.abs(v)
                    })),
                    xAxis: { data: data.map((_, i) => i) },
                    series: [
                        {
                            data,
                            lineStyle: {
                                color: data[data.length - 1] >= props.chartsData.roi_thresholdManual ? '#F31414' : '#399600',
                                width: 2
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
                                symbol: ['none', 'circle'],
                                symbolSize: 5,
                                lineStyle: {
                                    color: data[data.length - 1] >= props.chartsData.roi_thresholdManual ? '#F31414' : '#399600',
                                    width: 2
                                },
                                data: [
                                    [
                                        { coord: [data.length - 1, data[data.length - 1]] },
                                        { coord: [data.length - 1, data[data.length - 1]] }
                                    ], {
                                        name: '',
                                        yAxis: props.chartsData.roi_thresholdManual,
                                        lineStyle: {
                                            color: '#575757',
                                            width: 1,
                                            type: 'dashed'
                                        },
                                        label: {
                                            formatter: '{b}',
                                            position: 'insideStartTop'
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            type: 'bar',
                            xAxisIndex: 1,
                            yAxisIndex: 1,
                            // ✅ 把負數絕對值化 → 都往上畫
                            data: relativeTmepBar.map(v => {
                                // console.log(Math.abs(v));
                                return Math.abs(v)
                            }),

                            barWidth: '60%',

                            itemStyle: {
                                // ✅ 顏色仍依原始數值正負決定
                                color: (params) => {
                                    const originalValue = relativeTmepBar[params.dataIndex];
                                    return originalValue < 0 ? '#F3C9C8' : '#78C781';
                                }
                            },

                            emphasis: { disabled: true },
                            silent: true
                        }
                    ]
                },
            )

        }
        // chart.value.setOption(
        //     {
        //         xAxis: { data: data.map((_, i) => i) },

        //         series: [
        //             { type: 'bar', data: relativeTmepBar },
        //             {
        //                 type: 'line',
        //                 data: mainData,
        //                 markLine: {
        //                     silent: true,
        //                     symbol: ['none', 'circle'],  // ✅ 終點為圓點
        //                     symbolSize: 6,               // ✅ 圓點大小 (px)
        //                     lineStyle: {
        //                         color: '#399600',
        //                         width: 3,
        //                         type: 'solid'
        //                     },
        //                     data: [
        //                         [
        //                             { coord: [arrowEnd, data[arrowEnd]] },
        //                             { coord: [arrowEnd, data[arrowEnd]] }
        //                         ]
        //                     ]
        //                 }
        //             }
        //         ]
        //     }
        // );
    },
    { deep: true }
);
function getDynamicYAxis(lineData, barData, threshold) {
    // 折線範圍
    const lineMin = Math.min(...lineData);
    const lineMax = Math.max(...lineData);
    const padLine = (lineMax - lineMin) * 0.1;

    // 若最大值低於閾值，強制 max >= 閾值
    const safeLineMax = lineMax < threshold ? threshold * 1.05 : lineMax;
    const safeLineMin = lineMin;
    const finalLineMax = safeLineMax + padLine;
    const finalLineMin = safeLineMin - padLine;

    // Bar 範圍（對稱）
    const barAbsMax = Math.max(
        Math.abs(Math.min(...barData)),
        Math.abs(Math.max(...barData))
    );
    const padBar = barAbsMax * 0.2;

    return [
        {
            type: 'value',
            gridIndex: 0,
            min: finalLineMin,
            max: finalLineMax,
            show: false
        },
        {
            type: 'value',
            gridIndex: 1,
            min: -barAbsMax - padBar,
            max: barAbsMax + padBar,
            show: false,
            inverse: false
        }
    ];
}

function getDynamicYAxis1(linedata, bardata) {
    // 折線範圍
    const lineMin = Math.min(...linedata);
    const lineMax = Math.max(...linedata);
    const padLine = (lineMax - lineMin) * 0.1;

    // Bar 範圍（包含正負）
    const barAbsMax = Math.max(Math.abs(Math.min(...bardata)), Math.abs(Math.max(...bardata)));
    const padBar = barAbsMax * 0.2; // 適度留白

    return [
        {
            type: 'value',
            gridIndex: 0,
            min: lineMin - padLine,
            max: lineMax + padLine,
            show: false
        },
        {
            type: 'value',
            gridIndex: 1,
            // 讓 bar 的最大值對應「下半畫面上緣」
            // 並確保畫布中線是 0
            min: -barAbsMax - padBar, // 最低值略多一點空間
            max: barAbsMax + padBar,  // 保留對稱空間
            show: false,
            inverse: false // ✅ 讓正值往上、負值往下
        }
    ];
}
onMounted(() => {
    setTimeout(() => {
        chart.value = runEcharts(echarts2.value)
    }, 1)
})


onBeforeUnmount(() => { })

defineExpose({
    echartSize
})
</script>