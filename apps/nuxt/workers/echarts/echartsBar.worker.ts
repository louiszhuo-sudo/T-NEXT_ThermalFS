// worker.ts
if (typeof global === 'undefined') {
    (self as any).global = self;
}
import { formatted } from '~/utils/timeFormatter'
import { encode, decode } from '@msgpack/msgpack';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts'; // 根據需求按需引入
import { GridComponent, TooltipComponent, MarkLineComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
// import { SVGRenderer } from 'echarts/renderers';


// 註冊必須的組件
echarts.use([
    LineChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    MarkLineComponent, // <--- 2. 務必在這裡註冊
    CanvasRenderer,
    // SVGRenderer
]);
const props = {
    chartsData: {}
}
let chart: echarts.ECharts | null = null;

self.onmessage = (e) => {
    const { type, canvas, chartsData, width, height } = e.data;

    if (type === 'init') {
        try {
            // const cData = decode(chartsData)
            // props.chartsData = cData
            // 關鍵：使用 OffscreenCanvas 初始化
            chart = echarts.init(canvas, null, {
                width,
                height
            });

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
                        top: '10%',
                        height: '46%',
                        containLabel: false
                    },
                    {
                        top: '70%',
                        height: '50%',     // 下半部：bar
                        left: 0,
                        right: 0,
                        top: '64%',
                        height: '22%',
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
                        // silent: true,                 // ✅ 關閉互動
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
                        yAxisIndex: 1,
                        barWidth: '60%',
                        itemStyle: {
                            color: (params) => (params.value >= 0 ? '#38BDA5' : '#EDB1B0')
                        },
                        emphasis: { disabled: true },
                    }
                ]
            };
            // console.log('formatted', width, height, chartsData);

            chart?.setOption(option);
        } catch (error) {
            console.log(error);
        }
    } else if (type === 'update') {
        try {
            const cData = decode(chartsData)
            // console.log('解封包', cData);
            const data = cData.absTemp_curve;
            const relativeTmepBar = cData.relativeTmep_bar;
            const mainData = data;
            const arrowStart = mainData.length - 1;
            const arrowEnd = mainData.length;
            // const xLabels = relativeTmepBar.map((_, i) => i);
            // console.log('newValnewVal', newVal);
            // ✅ 閾值
            const threshold = cData.roi_thresholdManual;

            // ✅ 呼叫改良後的 y 軸自動調整函式
            const yAxis = getDynamicYAxis(data, relativeTmepBar, threshold);

            chart?.setOption({
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
                    }
                ]
            });
            // chart?.setOption(options);
        } catch (error) {
            console.log(error);
        }
    } else if (type === 'resize') {
        chart?.resize({ width, height });
    }
};

self.postMessage({
    type: 'open',
    parameter: {}
});


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
