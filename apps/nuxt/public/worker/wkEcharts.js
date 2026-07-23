importScripts('echarts56.min.js')
let chart = null
let camID = null
let width = 100
let height = 100
let ws = null;
let reconnectTimeout = null
let key1 = ''
let tempMaxLine = 0
const runws = (url, key) => {
    // ws = new WebSocket('ws://192.168.0.116:8707/');
    ws = new WebSocket(url);
    ws.onopen = () => {
        // console.log("WebSocket 02 已連線");
        // 清除之前的重新連線計時器
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
        // 連線成功後發送初始請求
        var output = {
            "feature": "fix_curve",
            "method": "query_realtime_curve",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "camera_id": camID,
                "echart_type": key
            }
        }
        key1 = key
        ws.send(JSON.stringify(output))
    };

    ws.onclose = () => {
        // console.log("WebSocket 02 已關閉，3 秒後嘗試重新連線...");
        // 每 3 秒嘗試重新連線
        // reconnectTimeout = setTimeout(() => {
        //     runws(url);
        // }, reconnectInterval);
    };

    ws.onerror = (err) => {
        // console.error("WebSocket 02 發生錯誤:", err);
        // 關閉 WebSocket 以觸發 onclose 進行重新連線
        ws.close();
    };

    ws.onmessage = (e) => {
        // console.log(JSON.parse(e.data));
        let arr = JSON.parse(e.data)
        runChartData(arr[key1])
    };
};
setTimeout(() => {
    ws.close();
    self.postMessage({
        type: 'close',
        parameter: {}
    });
    self.close(); // 關閉 Worker
}, 10 * 60 * 1000)

let tempData = [[], []]
let xAxis = []
let items = []
const initcharts = () => {

    let option
    // option = {
    //     grid: {
    //         show: false,
    //         top: '10',
    //         left: '50',
    //     },
    //     xAxis: {
    //         type: 'category',
    //         data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    //     },
    //     yAxis: {
    //         type: 'value'
    //     },
    //     series: [
    //         {
    //             data: [150, 230, 224, 218, 135, 147, 260],
    //             type: 'line'
    //         }
    //     ]
    // }
    option = {
        animation: false, // 關閉全局動畫
        title: {
            text: ''
        },
        legend: {
            data: []
        },
        grid: {
            show: false,
            top: '30',
            bottom: '30',
            right: '5',
            left: '40',
        },
        legend: {
            data: ['asd', 'sss']
        },
        dataZoom: [
            {
                type: 'inside',
                realtime: true,
                start: 0,
                end: 100,
            }
        ],
        xAxis: {
            type: 'category',
            data: xAxis
        },
        yAxis: {
            type: 'value',
            max: 100,
            min: 0,
            axisLabel: {
                formatter: function (value) {
                    return value.toFixed(1); // 保留最多一位小數
                }
            }
        },
        series: []
    }
    items.forEach((e) => {
        const segments = [];
        let current = [];

        e.item.forEach((val, i) => {
            if (val == null) {
                // 碰到 null → 結束目前段落
                if (current.length > 1) segments.push([...current]);
                current = [];
            } else {
                current.push([i, val]); // 存成 [x, y]
            }
        });
        if (current.length > 1) segments.push(current); // 收尾

        // 每個段落做成一條線
        const convertedData = segments.map(seg => ({
            coords: seg
        }));
        console.log('e.data', e.data);
        option.series.push({
            name: e.name,
            type: 'lines',
            coordinateSystem: 'cartesian2d',
            polyline: true,           // 這裡要設 true → 支援多點折線
            emphasis: { disabled: true },
            effect: { show: false },
            silent: true,
            large: true,
            z: 9999,
            lineStyle: { width: 2 },
            markLine: {},
            data: convertedData
        });
    });
    const { min: yMin, max: yMax } = computeNiceBoundsFromItems(items, 0.10);
    option.yAxis = {
        type: 'value',
        // min: yMin,
        min: 0,
        max: 100,
        // max: yMax,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: true, lineStyle: { type: 'dashed', opacity: 0.4 } },
        axisLabel: {
            formatter: (v) => {
                // 依數值大小自動格式化
                const av = Math.abs(v);
                if (av >= 1e6) return (v / 1e6).toFixed(2) + 'M';
                if (av >= 1e3) return (v / 1e3).toFixed(2) + 'k';
                return String(Math.round(v * 100) / 100);
            }
        }
    };
    console.log('tempMaxLinetempMaxLinetempMaxLinetempMaxLine', tempMaxLine);
    option.series.push({
        name: '溫度',
        type: 'line',
        data: xAxis,
        markLine: {
            symbol: 'none',   // 不要箭頭
            label: { show: false }, // 不要文字
            lineStyle: {
                type: 'dashed',
                color: 'red',
                width: 2
            },
            data: [
                { yAxis: tempMaxLine }   // 峰值位置
            ]
        }
    })
    chart.setOption(option);  // 設置圖表選項

    const opt = chart.getOption();
    self.postMessage({ type: 'seriesColors', colors: opt.color });
}
function computeNiceBoundsFromItems(items, paddingRatio = 0.10) {
    let gmin = +Infinity;
    let gmax = -Infinity;

    // 收集所有有效數值
    for (const e of items || []) {
        for (const v of e.item || []) {
            const num = v == null ? NaN : +v;   // 轉數字，null/undefined -> NaN
            if (!Number.isFinite(num)) continue;
            if (num < gmin) gmin = num;
            if (num > gmax) gmax = num;
        }
    }

    // 全部是空/無效資料
    if (!Number.isFinite(gmin) || !Number.isFinite(gmax)) {
        return { min: 0, max: 1 };  // 給個安全預設
    }

    // 若全域範圍為 0，給一個小範圍避免上下限相等
    let span = gmax - gmin;
    if (span === 0) {
        const delta = Math.max(1, Math.abs(gmax) * 0.1); // 至少 1 或 10%
        gmin -= delta;
        gmax += delta;
        span = gmax - gmin;
    }

    // 先加 10% padding
    const pad = span * paddingRatio;
    let minP = gmin - pad;
    let maxP = gmax + pad;

    // 漂亮化到 1-2-5 刻度
    const nice = niceBounds(minP, maxP, 6); // 目標 5~7 格之間
    return { min: nice.min, max: nice.max };
}

// 依 1-2-5 規則把 [min,max] 漂亮化
function niceBounds(minVal, maxVal, targetTicks = 6) {
    const span = maxVal - minVal;
    if (span <= 0 || !Number.isFinite(span)) return { min: minVal, max: maxVal };

    const roughStep = span / targetTicks;
    const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const norm = roughStep / mag;

    let niceStep;
    if (norm <= 1) niceStep = 1 * mag;
    else if (norm <= 2) niceStep = 2 * mag;
    else if (norm <= 5) niceStep = 5 * mag;
    else niceStep = 10 * mag;

    const niceMin = Math.floor(minVal / niceStep) * niceStep;
    const niceMax = Math.ceil(maxVal / niceStep) * niceStep;
    return { min: niceMin, max: niceMax, step: niceStep };
}
self.addEventListener('message', function (event) {
    var res = event.data
    var type = res.type
    var parameter = res.parameter
    if (type === 'start') {
        console.log('parameter.dataparameter.data', parameter.data);
        tempData = parameter.data
        xAxis = parameter.data.xAxis
        items = parameter.data.items
        tempMaxLine = parameter.data.tempMaxLine
        // camID = parameter.camID
        // if (parameter.key === 'echart_doStatus_for_wk') {
        //     runws(parameter.url, 'echart_doStatus')
        // } else if (parameter.key === 'echart_roiLineDiff_for_wk') {
        //     runws(parameter.url, 'echart_roiLineDiff')
        // } else if (parameter.key === 'echart_roiMaxAbs_for_wk') {
        //     runws(parameter.url, 'echart_roiMaxAbs')
        // } else if (parameter.key === 'echart_roiMaxDiff_for_wk') {
        //     runws(parameter.url, 'echart_roiMaxDiff')
        // }
    } else if (type === 'canvas') {
        const canvas = event.data.canvas;
        canvas.width = event.data.width
        canvas.height = event.data.height
        width = event.data.width
        height = event.data.height
        chart = echarts.init(canvas, { renderer: 'canvas' });
        initcharts()
    } else if (type === 'datazoom') {
        let dataZoom = parameter.dataZoom
        chart.setOption({
            dataZoom
        });
    } else if (type === 'toggleSeries') {
        const { name, visible } = res;
        chart.dispatchAction({
            type: visible ? 'legendSelect' : 'legendUnSelect',
            name
        });
    }
})

self.postMessage({
    type: 'open',
    parameter: {}
});