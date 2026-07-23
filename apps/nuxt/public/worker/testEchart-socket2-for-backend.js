importScripts('echarts.min.js');
// 圖表一 - realTime 模式
// var ws1 = new WebSocket('ws://192.168.0.128:8702')
var ws1 = new WebSocket('ws://localhost:8702')
var output
var chart = null
var fps = 0
var chartfps = 0
var datalen = 0
ws1.onopen = (e) => {
    console.log('websocket open to webworker 8704');
    // ws1.send(JSON.stringify({
    //     type: 'init'
    // }))
}
ws1.onclose = (e) => {
    console.log('websocket close to webworker 8704');
}
const init = () => {
    output = {
        animation: false,
        xAxis: {
            silent: true,
            type: 'category',
            axisLabel: {
                formatter: (value) => {
                    var date = new Date(parseInt(value));
                    // var date = new Date(value);
                    var year = date.getFullYear();
                    var month = ('0' + (date.getMonth() + 1)).slice(-2);
                    var day = ('0' + date.getDate()).slice(-2);
                    var hour = ('0' + date.getHours()).slice(-2);
                    var minute = ('0' + date.getMinutes()).slice(-2);
                    var second = ('0' + date.getSeconds()).slice(-2);
                    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
                }
            },
            // data: time
        },
        grid: {
            show: false,
            top: '30',
            left: '50',
            width: '95%',
            height: '70%'
        },
        yAxis: [
            {
                silent: true,
                // max: 0.2,
                // min: -0.2,
                scale: true
            }
        ],
        series: []
    }
    chart.setOption(output);
    console.log("成功初始化echarts");
}
var init1 = true
var time = []
var arr = []
var temp = {}
var series = []
var cahe1 = false
ws1.onmessage = (e) => {
    var data = JSON.parse(e.data)
    // console.log("xxx", data);
    if (init1) {
        time = data.time
        datalen += data.time.length
        // time = ['1691562640000', '1691562641000', '1691562642000', '1691562643000', '1691562644000']
        init1 = false
    } else {
        // 加key
        Object.keys(data).forEach((key) => {
            if (key !== 'time') {
                if (temp[key] === undefined) {
                    temp[key] = []
                }
            }
        })
        Object.keys(data).forEach((key) => {
            if (key !== 'time') {
                for (var w = 0; w < data[key].max.length; w++) {
                    datalen++
                    temp[key].push(data[key].max[w])
                }
            }
        })
    }
    series = [
        // {
        //     type: 'lines',
        //     polyline: true,
        //     coordinateSystem: 'cartesian2d',
        //     emphasis: {
        //         disabled: true
        //     },
        //     effect: {
        //         show: false
        //     },
        //     silent: true,
        //     lineStyle: {
        //         //   width:2,
        //         //   cap:'round',
        //         // color: '#80898c',
        //         // curveness: 0.5,
        //     },
        //     // lineStyle:{
        //     //   width:2,
        //     //   cap:'round',
        //     // },
        //     // large: true,
        //     data: [
        //         ['1691562640000', '0.1'],  // 起点
        //         ['1691562642000', '-0.1']   // 终点
        //     ]
        // }
    ]
    Object.keys(temp).forEach((key) => {
        series.push({
            symbol: 'none',
            // sampling: 'lttb',
            showSymbol: false,
            emphasis: {
                scale: false,
            },
            name: key,
            data: temp[key],
            type: 'line'
        })
    })
    // console.log(temp);

    data = null
    // arr = null
    // time = null
    fps++
    cahe1 = true
    // datalen++
}
setInterval(() => {
    if (cahe1) {
        if (chart !== null) {
            chart.setOption({
                xAxis: {
                    data: time
                },
                series
            }, { lazyUpdate: true });  // 設置圖表選項
        }
        chartfps++
    }
}, 1000 / 10)
setInterval(() => {
    // self.postMessage(fps);
    self.postMessage({ fps, datalen, chartfps });
    chartfps = 0
    fps = 0
}, 1000)
var start = 0
var end = 100
self.addEventListener('message', function (event) {
    if (event.data.type === 'init') {
        const canvas = event.data.canvas;
        canvas.width = event.data.width
        canvas.height = event.data.height
        chart = echarts.init(canvas, { renderer: 'canvas' });
        init()
    } else if (event.data.type === 'wheelEvent') {
        // 高亮指定索引的数据项
        console.log(start, end);
        var wheelEvent = event.data.wheelEvent
        var sw = start < 45 ? 1 : 0.1 
        if (wheelEvent.up) {
            start = start + sw
            end = end - sw
        } else {
            start = start - sw
            end = end + sw
        }
        if (start < 0) {
            start = 0
        } else if (start > 50) {
            start = 50
        }
        if (end > 100) {
            end = 100
        } else if (end < 50) {
            end = 50
        }
        chart.setOption({
            dataZoom: [{
                type: 'inside',
                realtime: true,
                start,
                end,
            }]
        }, { lazyUpdate: true })
    }
})