importScripts('echarts.min.js');
// 圖表一 - realTime 模式
// var ws1 = new WebSocket('ws://192.168.0.128:8702')
var ws1 = new WebSocket('ws://localhost:8704')
var output
var chart = null
var fps = 0
var chartfps = 0
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
            type: 'category',
            show:false,
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
        dataZoom: [
            {
                type: 'inside',
                realtime: true,
            },
        ],
        grid: {
            show: false,
            top: '30',
            left: '50',
            width: '95%',
            height: '70%'
        },
        yAxis: [
            {
                show: false,
                max: 80,
                min: 0,
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
var test = []
var datalen = 0
var temp = []
var cahe1 = false
ws1.onmessage = (e) => {
    // datalen = 0
    var data = JSON.parse(e.data)
    // console.log("xx", data);
    if (init1) {
        time = data.time
        datalen += data.time.length
        // console.log("init", data);
        // time = ['1691562640000', '1691562641000', '1691562642000', '1691562643000', '1691562644000']
        init1 = false
    } else {
        // time = data.time
        // 加key
        Object.keys(data).forEach((key) => {
            // if (key === 'blob1') {
            //     test = data[key]
            // }
            if (key !== 'time') {
                // datalen = datalen + data[key].length
                var find = temp.findIndex((item) => item.name === key)
                datalen += data[key].min.length
                // temp.push({
                //     coords: [],
                //     name: key
                // })
                if (find === -1) {
                    // temp[key] = []
                    temp.push({
                        coords: [],
                        name: key
                    })
                } else {
                    // var timeTemp = []
                    var timelen = data.time.length
                    for (var ie1 = 0; ie1 < timelen; ie1++) {
                        temp[find].coords.push(
                            [data.time[ie1], data[key].max[ie1]]
                        )
                    }
                    // temp[find].coords.push(
                    //     [data.time[0], data[key].max[0]]
                    // )
                    // console.log(temp);
                }
            }
        })
        // console.log("ttt", temp);
        // Object.keys(data).forEach((key) => {
        //     if (key !== 'time') {
        //         for (var w = 0; w < data[key].max.length; w++) {
        //             temp[key].push(data[key].max[w])
        //         }
        //     }
        // })
    }

    // Object.keys(temp).forEach((key) => {6
    //     var tem = {}
    //     series.data.push(tem)
    // series.push({
    //     symbol: 'none',
    //     sampling: 'lttb',
    //     name: key,
    //     data: temp[key],
    //     type: 'line'
    // })
    // })
    data = null
    // arr = null
    // time = null
    fps++
    cahe1 = true
}
setInterval(() => {
    if (cahe1) {
        var series = [
            {
                type: 'lines',
                polyline: true,
                coordinateSystem: 'cartesian2d',
                emphasis: {
                    disabled: true
                },
                effect: {
                    show: false
                },
                silent: true,
                lineStyle: {
                    width: 1,
                    //   cap:'round',
                    color: '#80898c',
                    // curveness: 0.5,
                },
                // lineStyle:{
                //   width:2,
                //   cap:'round',
                // },
                // large: true,
                data: temp
            }
        ]
        if (chart !== null) {
            chart.setOption({
                xAxis: {
                    data: time
                },
                series
            }, { lazyUpdate: false });  // 設置圖表選項 , useDirtyRect: true { lazyUpdate: false }
        }
        chartfps++
        cahe1 = false
    }
}, 1000 / 10)
setInterval(() => {
    // var series = [
    //     {
    //         type: 'lines',
    //         polyline: true,
    //         coordinateSystem: 'cartesian2d',
    //         emphasis: {
    //             disabled: true
    //         },
    //         effect: {
    //             show: false
    //         },
    //         silent: true,
    //         lineStyle: {
    //               width:2,
    //             //   cap:'round',
    //             color: '#80898c',
    //             // curveness: 0.5,
    //         },
    //         // lineStyle:{
    //         //   width:2,
    //         //   cap:'round',
    //         // },
    //         // large: true,
    //         data: temp
    //     }
    // ]
    // if (chart !== null) {
    //     chart.setOption({
    //         xAxis: {
    //             data: time
    //         },
    //         series
    //     });  // 設置圖表選項, useDirtyRect: true { lazyUpdate: false }
    // }
    self.postMessage({ fps, datalen, chartfps });
    fps = 0
    chartfps = 0
}, 1000)
var es = null
var start = 0
var end = 100
var index1 = 0
// var highlightedIndex = 0;
self.addEventListener('message', function (event) {
    if (event.data.type === 'init') {
        const canvas = event.data.canvas;
        canvas.width = event.data.width
        canvas.height = event.data.height
        chart = echarts.init(canvas, { renderer: 'canvas' });
        init()
    } else if (event.data.type === 'wheelEvent') {
        // 高亮指定索引的数据项
        var wheelEvent = event.data.wheelEvent
        var zoom = 3
        const minRange = 0; // 最小范围
        const maxRange = 100; // 最大范围

        if (wheelEvent.up) {
            const zoomFactor = wheelEvent.start * zoom;
            const newStart = start + zoomFactor;
            const newEnd = end - wheelEvent.end * zoom;

            if (newEnd - newStart >= minRange && newEnd <= maxRange) {
                start = newStart;
                end = newEnd;
            }
        } else {
            const zoomFactor = wheelEvent.start * zoom;
            const newStart = start - zoomFactor;
            const newEnd = end + wheelEvent.end * zoom;
            start = newStart;
            end = newEnd;
            if (start <= 0) {
                start = 0
            }
            if (end >= 100) {
                end = 100
            }
        }

        if (end - start < minRange) {
            const center = (start + end) / 2;
            start = center - minRange / 2;
            end = center + minRange / 2;
        }

        if (end > maxRange) {
            end = maxRange;
        }

        if (start < 0) {
            start = 0;
        }
        // console.log(wheelEvent, start, end);
        // index1++
        // if (index1 < 0) {
        //     index1 = 0
        // } else if (index1 > zoom.length) {
        //     index1 = zoom.length
        // }
        // if (start < 0) {
        //     start = 0
        // } else if (start > 50) {
        //     start = 50
        // }
        // if (end > 100) {
        //     end = 100
        // } else if (end < 50) {
        //     end = 50
        // }
        chart.setOption({
            dataZoom: [{
                type: 'inside',
                realtime: true,
                start,
                end,
            }]
        }, { lazyUpdate: true })
    } else if (event.data.type === 'move') {
        var move = event.data.move
        var left = start
        var right = end
        console.log(left - move.x, right - move.x);
    }
})