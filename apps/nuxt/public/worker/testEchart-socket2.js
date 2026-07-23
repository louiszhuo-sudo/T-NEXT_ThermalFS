importScripts('echarts.min.js');
// 圖表一 - realTime 模式
// var ws1 = new WebSocket('ws://192.168.0.128:8704')
var ws1 = new WebSocket('ws://localhost:8704')
var output
var chart = null
var fps = 0
var chartfps = 0
var TempMax = 1
var TempMin = 0
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
            show: false,
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
        dataZoom: [
            {
                type: 'inside',
                realtime: true,
            },
        ],
        grid: {
            show: false,
            top: '10',
            left: '50',
            width: '95%',
            height: '75%'
        },
        yAxis: [
            {
                max: TempMax,
                min: TempMin,
                splitNumber: 4,
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: ['#fff'],
                        opacity: 0.2
                    }
                },
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
var outputKey = []
// var zoomRoiData = []
// var testtttt = 0
var colors = ['#FF4800', '#FFB839', '#79FF66', '#00C3FF', '#A189E5']
var colorSelectSum = 0
const handleEchartsScale = () => {
    if (chart !== null) {
        var handleXlimitsMax = 1
        var handleXlimitsMin = 0
        var xAxis = chart.getModel().getComponent('xAxis', 0); // 0 表示第一個 x 軸
        var xAxisScale = xAxis.axis.scale.getTicks()
        var xAxisScalelen = xAxisScale.length
        for (var i = 0; i < temp.length; i++) {
            for (var j = 0; xAxisScalelen; j++) {
                if (temp[i]?.coords[xAxisScale[j]?.value] !== undefined) {
                    var indexTemp = temp[i].coords[xAxisScale[j].value]
                    indexTemp = indexTemp[1]
                    if (indexTemp > handleXlimitsMax) {
                        handleXlimitsMax = Math.ceil(indexTemp * 1.2)
                    }
                    if (indexTemp < handleXlimitsMin) {
                        handleXlimitsMin = Math.ceil(indexTemp * 0.8)
                    }
                } else {
                    break;
                }
            }
        }
        // console.log("qsd", temp, xAxisScale);
        // console.log(handleXlimitsMax, handleXlimitsMin);
        TempMax = handleXlimitsMax
        TempMin = handleXlimitsMin
        chart.setOption({
            yAxis: [
                {
                    max: Math.floor(TempMax),
                    min: Math.floor(TempMin),
                    scale: true
                }
            ],
        }, { lazyUpdate: false });
    }
}
ws1.onmessage = (e) => {
    // testtttt++
    // console.log(testtttt);
    // datalen = 0
    var data = JSON.parse(e.data)
    // console.log("xx", data.time);
    if (init1) {
        time = data.time
        datalen += data.time.length
        // console.log("init", data);
        // time = ['1691562640000', '1691562641000', '1691562642000', '1691562643000', '1691562644000']
        self.postMessage({ type: 'mockTime', time }); // 將TEIM傳給主線程(MOCK ECHARTS)
        init1 = false
    } else {
        // time = data.time
        // 加key
        // var fineTest = time.findIndex((item) => item === data.time[0])
        // if (fineTest === -1) {
        //     console.log("xxx", data.time[0]);
        // }else{
        //     // console.log(parseInt(time[fineTest - 1]), parseInt(data.time[0]));
        //     if (parseInt(time[fineTest - 1]) >= parseInt(data.time[0])) {
        //         console.log("xxx",data.time[0]);
        //     }

        // }
        Object.keys(data).forEach((key) => {
            // if (key === 'blob1') {
            //     test = data[key]
            // }
            if (key !== 'time') {
                // datalen = datalen + data[key].length
                var find = temp.findIndex((item) => item.name === key)
                // datalen += data[key].max.length
                datalen += data[key].length
                // temp.push({
                //     coords: [],
                //     name: key
                // })
                if (find === -1) {
                    var arrNew = []
                    var timelen = data.time.length
                    for (var ie1 = 0; ie1 < timelen; ie1++) {
                        // if (data[key][ie1] > TempMax) {
                        // TempMax = data[key][ie1] + 20
                        // }
                        // if (data[key][ie1] < TempMin) {
                        // TempMin = data[key][ie1] + -20
                        // }
                        arrNew.push([data.time[ie1], data[key][ie1]])
                    }
                    temp.push({
                        coords: arrNew,
                        lineStyle: {
                            color: colors[colorSelectSum],
                            // width: 1
                        },
                        emphasis: {
                            disabled: true
                        },
                        // progressive: 3000,
                        large: true,
                        name: key
                    })
                    colorSelectSum++
                    if (colorSelectSum > colors.length) {
                        colorSelectSum = 0
                    }
                } else {
                    // var timeTemp = []
                    var timelen = data.time.length
                    for (var ie1 = 0; ie1 < timelen; ie1++) {
                        if (data[key][ie1] > TempMax) {
                            TempMax = data[key][ie1] + 20
                        }
                        // console.log(data[key][ie1]);
                        var find2 = temp[find].coords.findIndex((item) => item[0] === data.time[ie1])
                        // if (data.time[ie1].length > 2) {
                        if (find2 !== -1) {
                            // console.log('ok');
                            temp[find].coords[find2] = [data.time[ie1], data[key][ie1]]
                        } else {
                            // if (temp[find].coords.length > 0) {
                            //     console.log(temp[find].coords);
                            // }
                            temp[find].coords.push(
                                [data.time[ie1], data[key][ie1]]
                            )
                        }
                        // }
                    }
                    // temp[find].coords.push(
                    //     [data.time[0], data[key].max[0]]
                    // )
                    // console.log(temp);
                }
                var keyfind = outputKey.findIndex((item) => item === key)
                if (keyfind === -1) {
                    outputKey.push(key)
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
// var handleXlimits = () => {
//     var handleXlimitsMax = 1
//     var handleXlimitsMin = 0
//     for (var q = 0; q < temp.length; q++) {
//         var limitslen = temp[q].coords.length
//         for (var v = 0; v < limitslen; v++) {
//             if (temp[q].coords[v][1] > handleXlimitsMax) {
//                 handleXlimitsMax = temp[q].coords[v][1] + (temp[q].coords[v][1] * 1.2)
//             }
//             if (temp[q].coords[v][1] < handleXlimitsMin) {
//                 handleXlimitsMin = temp[q].coords[v][1] + -(temp[q].coords[v][1] * 1.2)
//             }
//         }
//     }
//     TempMax = handleXlimitsMax
//     TempMin = handleXlimitsMin
//     if (chart !== null) {
//         chart.setOption({
//             yAxis: [
//                 {
//                     max: Math.floor(TempMax),
//                     min: Math.floor(TempMin),
//                     scale: true
//                 }
//             ],
//         }, { lazyUpdate: false });
//     }
// }
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
            // console.log(series[0].data[0].coords);
            chart.setOption({
                xAxis: {
                    data: time
                },
                // yAxis: [
                //     {
                //         max: TempMax,
                //         min: TempMin,
                //         scale: true
                //     }
                // ],
                series
            },
                { lazyUpdate: false }
            );  // 設置圖表選項 , useDirtyRect: true { lazyUpdate: false }
        }
        chartfps++
        cahe1 = false
        // console.log(temp);
        // xAxis大小值
        // handleXlimits()

    }
    self.postMessage({ type: 'outputKey', outputKey });
}, 1000 / 60)

setInterval(() => {
    handleEchartsScale()
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
    self.postMessage({ type: 'fps', fps, datalen, chartfps });
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
        chart.setOption({
            dataZoom: [{
                type: 'inside',
                realtime: true,
                start: event.data.wheelEvent.start,
                end: event.data.wheelEvent.end,
            }]
        }, { lazyUpdate: true })
        handleEchartsScale()
    } else if (event.data.type === 'movetime') {
        var move = event.data.move.pointInGrid
        if (move < 1) {
            move = 1
        }
        chart.setOption({
            xAxis: {
                axisPointer: {
                    value: time[move[0]],
                    snap: true,
                    lineStyle: {
                        color: '#7581BD',
                        width: 2
                    },
                    label: {
                        show: true,
                        // formatter: function (params) {
                        //     return echarts.format.formatTime('yyyy-MM-dd', params.value);
                        // },
                        formatter: (params) => {
                            var date = new Date(parseInt(params.value));
                            // var date = new Date(value);
                            var year = date.getFullYear();
                            var month = ('0' + (date.getMonth() + 1)).slice(-2);
                            var day = ('0' + date.getDate()).slice(-2);
                            var hour = ('0' + date.getHours()).slice(-2);
                            var minute = ('0' + date.getMinutes()).slice(-2);
                            var second = ('0' + date.getSeconds()).slice(-2);
                            return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
                        },
                        backgroundColor: '#7581BD'
                    },
                    handle: {
                        show: true,
                        color: '#7581BD'
                    }
                },
            }
        }, { lazyUpdate: true })
        handleEchartsScale()
        // console.log(move[0]);
    } else if (event.data.type === 'deleteChart') {
        // console.log("deleteChart", event.data.parameter.type, event.data.parameter.id);
        var deleteROI = () => {
            var finde = temp.findIndex((item) => item.name.includes(event.data.parameter.type + event.data.parameter.id))
            var findeKey = outputKey.findIndex((item) => item.includes(event.data.parameter.type + event.data.parameter.id))
            // console.log("找到:", finde);
            // var finde = temp.filter((item) => item.name.includes(event.data.parameter.type + event.data.parameter.id))
            temp.splice(finde, 1);
            outputKey.splice(findeKey, 1);
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
                        width: 2,
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
                // console.log(series[0].data[0].coords);
                chart.setOption({
                    series
                });  // 設置圖表選項 , useDirtyRect: true { lazyUpdate: false }
            }
        }
        deleteROI()
        handleXlimits()
        var intval = this.setInterval(() => {
            var finde = temp.findIndex((item) => item.name.includes(event.data.parameter.type + event.data.parameter.id))
            var findeKey = outputKey.findIndex((item) => item.includes(event.data.parameter.type + event.data.parameter.id))
            if (finde !== -1 && findeKey !== -1) {
                deleteROI()
                // handleXlimits()
            } else {
                this.clearInterval(intval)
                // console.log('stop');
            }
        }, 33)
    }
})