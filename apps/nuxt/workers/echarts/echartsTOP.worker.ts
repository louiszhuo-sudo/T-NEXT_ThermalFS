if (typeof global === 'undefined') {
    (self as any).global = self;
}

import { formatted } from '~/utils/timeFormatter'
import { decode } from '@msgpack/msgpack';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, MarkLineComponent, GraphicComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    LineChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    MarkLineComponent,
    GraphicComponent,
    CanvasRenderer,
]);

const props = {
    chartsData: {} as any,
    textFontSize: 12,
    xAxisTextFontSize: 12
}

let chart: echarts.ECharts | null = null;

const normalizeTextFontSize = (value: unknown, fallback = 12) => {
    const fontSize = Number(value);
    return Number.isFinite(fontSize) && fontSize > 0 ? fontSize : fallback;
}

const getCurveValues = (chartData: any, timeFormatter: (value: any) => string) => {
    const time: string[] = []
    const data: number[] = []

    if (Array.isArray(chartData?.data)) {
        chartData.data.forEach((item: [any, number]) => {
            time.push(timeFormatter(item[0]))
            data.push(item[1])
        })
    }

    return { time, data }
}

const buildGraphic = () => ([])

const buildMarkLine = (data: number[], threshold: number, fontSize: number) => {
    const markLineData: any[] = []

    if (data.length > 0) {
        const lastIndex = data.length - 1
        markLineData.push([
            { coord: [lastIndex, data[lastIndex]] },
            { coord: [lastIndex, data[lastIndex]] }
        ])
    }

    if (Number.isFinite(threshold)) {
        markLineData.push(
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
                    position: 'insideStartTop',
                    fontSize
                }
            },
            {
                yAxis: threshold,
                lineStyle: {
                    color: 'transparent'
                },
                label: {
                    show: true,
                    formatter: threshold,
                    position: 'end',
                    color: '#000',
                    padding: [2, 4],
                    borderRadius: 3,
                    fontSize
                }
            }
        )
    }

    return {
        silent: true,
        symbol: ['none', 'none'],
        symbolSize: 6,
        lineStyle: {
            width: 3,
            type: 'solid'
        },
        itemStyle: {
            color: '#1CC830'
        },
        data: markLineData
    }
}

self.onmessage = (e) => {
    const { type, canvas, chartsData, width, height, textFontSize, xAxisTextFontSize } = e.data;
    const resolvedFontSize = normalizeTextFontSize(textFontSize)
    const resolvedXAxisFontSize = normalizeTextFontSize(xAxisTextFontSize, resolvedFontSize)
    props.textFontSize = resolvedFontSize
    props.xAxisTextFontSize = resolvedXAxisFontSize

    if (type === 'init') {
        try {
            const cData = decode(chartsData)
            props.chartsData = cData

            chart = echarts.init(canvas, null, {
                width,
                height
            });

            const { time, data } = getCurveValues(cData, (value) => formatted(value))

            chart.setOption({
                animation: false,
                backgroundColor: 'transparent',
                tooltip: { show: false },
                grid: {
                    top: 20,
                    bottom: 30,
                    right: 30,
                },
                xAxis: {
                    type: 'category',
                    data: time,
                    axisLabel: {
                        fontSize: resolvedXAxisFontSize
                    },
                    align: 'left',
                    boundaryGap: false,
                },
                yAxis: {
                    type: 'value',
                    show: false,
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
                        data
                    }
                ],
                graphic: buildGraphic()
            });
        } catch (error) {
            console.log(error);
        }
    } else if (type === 'update') {
        const cData = decode(chartsData)
        props.chartsData = cData

        const { time, data } = getCurveValues(cData, (value) => formatted(value, "HH:SS"))
        const threshold = Number(cData?.roi_thresholdManual)
        const maxVal = data.length > 0 ? Math.max(...data) : 0
        const yMax = maxVal < threshold ? threshold * 1.1 : undefined

        chart?.setOption({
            xAxis: {
                data: time,
                axisLabel: {
                    fontSize: resolvedXAxisFontSize
                }
            },
            yAxis: {
                max: yMax,
                min: 0
            },
            graphic: buildGraphic(),
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
                markLine: buildMarkLine(data, threshold, resolvedFontSize)
            }]
        })
    } else if (type === 'resize') {
        const data = Array.isArray(props.chartsData?.data)
            ? props.chartsData.data.map((item: [any, number]) => item[1])
            : []
        const threshold = Number(props.chartsData?.roi_thresholdManual)

        chart?.resize({ width, height });
        chart?.setOption({
            xAxis: {
                axisLabel: {
                    fontSize: resolvedXAxisFontSize
                }
            },
            graphic: buildGraphic(),
            series: [{
                markLine: buildMarkLine(data, threshold, resolvedFontSize)
            }]
        })
    }
};

self.postMessage({
    type: 'open',
    parameter: {}
});
