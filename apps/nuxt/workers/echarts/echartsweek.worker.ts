// worker.ts
if (typeof global === 'undefined') {
    (self as any).global = self;
}
import { formatted } from '~/utils/timeFormatter'
import { encode, decode } from '@msgpack/msgpack';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, HeatmapChart } from 'echarts/charts'; // 根據需求按需引入
import { GridComponent, TooltipComponent, MarkLineComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
// import { SVGRenderer } from 'echarts/renderers';


// 註冊必須的組件
echarts.use([
    LineChart,
    BarChart,
    HeatmapChart,          // ✅ 重要
    VisualMapComponent,   // ✅ 重要
    GridComponent,
    TooltipComponent,
    MarkLineComponent, // <--- 2. 務必在這裡註冊
    CanvasRenderer,
    // SVGRenderer
]);
const props = {
    chartsData: {}
}
let chart1: echarts.ECharts | null = null;
let chart2: echarts.ECharts | null = null;


const runEcharts = (myChart, key) => {
    // 取得最小值
    var option;

    option = {
        animation: false,                // 🚫 關閉整體動畫（最重要）
        // 💡 背景色 (可省略)
        backgroundColor: '#fff',

        grid: {
            top: 20,
            bottom: 25,
            left: 30,
            right: 60,
            // containLabel: false // 不保留軸文字區域 → 滿版
        },
        xAxis: {
            type: 'category',
            data: []
        },
        yAxis: {
            type: 'value',
            position: 'right',     // 1. 將 Y 軸移到右邊
        },
        series: [
            {
                data: [],
                type: 'bar',
                showBackground: true,
                backgroundStyle: {
                    color: 'rgba(180, 180, 180, 0.2)'
                },
            }
        ]
    };

    option && myChart.setOption(option);
}

const runEchartshotpoint = (myChart, key) => {
    // 簡化後的數據
    const days = ['溫度', '煙霧']; // 只有兩行
    const hours = ['12a', '1a', '2a'];    // 縮短 X 軸以便觀察

    // 數據格式：[小時索引, 天數索引, 數值]
    const data = [];
    var option;
    option = {
        animation: false,                // 🚫 關閉整體動畫（最重要）
        backgroundColor: '#fff',
        grid: {
            top: 20,
            bottom: 30,
            left: 30,
            right: 60,
            // containLabel: false // 不保留軸文字區域 → 滿版
        },
        xAxis: {
            type: 'category',
            data: hours
        },
        yAxis: {
            type: 'category',
            data: days,
            position: 'right',     // 1. 將 Y 軸移到右邊
            // axisLabel: {
            //     align: 'right',      // 2. 讓文字內容靠右對齊
            //     margin: 15           // 3. 調整文字與圖表的距離
            // },
            splitArea: { show: true }
        },
        visualMap: {
            type: 'piecewise', // 改為分段型
            orient: 'horizontal',
            left: 'center',
            show: false,       // 雖然隱藏，但邏輯依然生效
            pieces: [
                { gt: 50, color: '#FD903D' },          // 50 以上 (50+)
                { gt: 10, lte: 50, color: '#FEC460' }, // 10 ~ 50
                { gt: 5, lte: 10, color: '#FFE898' },  // 6 ~ 10
                { gt: 0, lte: 5, color: '#FFFECB' },   // 1 ~ 5
                { value: 0, color: '#f0f0f0' }         // 固定 0
            ]
        },
        series: [{
            type: 'heatmap',
            data: data,
            label: { show: true }
        }]
    };

    option && myChart.setOption(option);
}
self.onmessage = (e) => {
    const { type, canvas1, canvas2, chartsData, echarts1Size, echarts2Size } = e.data;

    if (type === 'init') {
        try {
            // const cData = decode(chartsData)
            // props.chartsData = cData
            // 關鍵：使用 OffscreenCanvas 初始化
            chart1 = echarts.init(canvas1, null, {
                width: echarts1Size.width,
                height: echarts1Size.height
            });

            chart2 = echarts.init(canvas2, null, {
                width: echarts2Size.width,
                height: echarts2Size.height
            });
            runEcharts(chart1)
            runEchartshotpoint(chart2)
        } catch (error) {
            console.log(error);
        }
    } else if (type === 'update') {
        try {
            const newVal = decode(chartsData)
            // console.log('解封包', cData);
            const day_type = newVal[4]; // 取得你的類型陣列 [0, 0, 1, 0, 0]

            chart1?.setOption({
                xAxis: {
                    data: newVal[1]
                },
                series: [
                    {
                        data: newVal[2],
                        type: 'bar',
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(180, 180, 180, 0.2)'
                        },
                        // --- 修改這裡：根據索引值對應 day_type ---
                        itemStyle: {
                            color: (params) => {
                                // params.dataIndex 會告訴我們現在是第幾個 bar
                                const type = day_type[params.dataIndex];

                                // 判斷：1 為藍色，0 為灰色
                                if (type === 1) {
                                    return '#91BADB'; // 淺藍色
                                } else {
                                    return '#898989'; // 深灰色
                                }
                            }
                        }
                    },
                    {
                        name: 'Step Line',
                        type: 'line',
                        // step: 'start',
                        showSymbol: false,
                        data: newVal[3],
                        lineStyle: {
                            color: '#2E00FA',
                            width: 3,
                            type: 'dashed'
                        },
                        itemStyle: {
                            color: '#2E00FA'
                        }
                    }
                ]
            });

            let valdata = [
                // [0, 0, 5], [1, 0, 1], [2, 0, 0], // Saturday 的數據
                // [0, 1, 7], [1, 1, 3], [2, 1, 2]  // Friday 的數據
            ]
            for (var i = 0; i < newVal[5].length; i++) {
                valdata.push([
                    i, 0, newVal[5][i]
                ])
            }
            for (var i = 0; i < newVal[6].length; i++) {
                valdata.push([
                    i, 1, newVal[6][i]
                ])
            }
            chart2?.setOption({
                xAxis: {
                    data: newVal[1]
                },
                series: [
                    {
                        data: valdata
                    }
                ]
            })
        } catch (error) {
            console.log(error);
        }
        // chart?.setOption(options);
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