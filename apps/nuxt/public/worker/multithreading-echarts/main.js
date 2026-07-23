// importScripts('../gpu.js');
// const gpu = new GPU.GPU()
// 定义 GPU 核心函数来计算标准差
// const computeStandardDeviation = gpu.createKernel(function (data, mean) {
//     const diff = data[this.thread.x] - mean;
//     return diff * diff;
// }).setOutput([1]);

// // 输入数据
// const data = [2, 4, 4, 4, 5, 5, 7, 9];

// // 计算数据平均值
// const sum = data.reduce((acc, val) => acc + val, 0);
// const mean = sum / data.length;

// // 在 GPU 上计算标准差
// const squaredDifferences = computeStandardDeviation(data, mean);
// const sumOfSquaredDifferences = squaredDifferences.reduce((acc, val) => acc + val, 0);
// const standardDeviation = Math.sqrt(sumOfSquaredDifferences / data.length);

// console.log(standardDeviation); // 输出标准差

// 宣告變數
var init1 = true
var time = []
var arr = []
var datalen = 0
var temp = []
var outputKey = []
var TempMax = 1
var TempMin = 0
var splice = 0 // 分割
var spliceArr = []
var colors = ['#FF4800', '#FFB839', '#79FF66', '#00C3FF', '#A189E5']
var colorSelectSum = 0
var wklist = []
var wkTempMaxMin = []
// var ws1 = new WebSocket('ws://192.168.0.173:8704')
var ws1 = new WebSocket('ws://localhost:8704')
ws1.onopen = (e) => {
    console.log('websocket open to webworker 8704');
}
ws1.onclose = (e) => {
    console.log('websocket close to webworker 8704');
}
ws1.onmessage = (e) => {
    var data = JSON.parse(e.data)
    if (init1) {
        time = data.time
        datalen += data.time.length
        self.postMessage({ type: 'mockTime', time }); // 將TEIM傳給主線程(MOCK ECHARTS)
        for (var i = 0; i < splice; i++) {
            wklist[i].postMessage({ type: 'rander-time', time })
        }
        init1 = false
    } else {
        Object.keys(data).forEach((key) => {
            if (key !== 'time') {
                var find = temp.findIndex((item) => item.name === key)
                //         datalen += data[key].length
                if (find === -1) {
                    var minIndex = Math.min(...spliceArr)
                    minIndex = spliceArr.findIndex((item) => item === minIndex)
                    var arrNew = []
                    var timelen = data.time.length
                    for (var ie1 = 0; ie1 < timelen; ie1++) {
                        arrNew.push([data.time[ie1], data[key][ie1]])
                    }
                    var tmOut = {
                        coords: arrNew,
                        lineStyle: {
                            color: colors[colorSelectSum],
                        },
                        emphasis: {
                            disabled: true
                        },
                        large: true,
                        name: key,
                        onlyId: minIndex
                    }
                    temp.push(tmOut)
                    spliceArr[minIndex] = spliceArr[minIndex] + 1
                    colorSelectSum++
                    if (colorSelectSum > colors.length) {
                        colorSelectSum = 0
                    }
                    wklist[minIndex].postMessage({ type: 'rander-data', data: tmOut })
                } else {
                    var arrNew = []
                    var timelen = data.time.length
                    for (var ie1 = 0; ie1 < timelen; ie1++) {
                        arrNew.push([data.time[ie1], data[key][ie1]])
                    }
                    temp[find].coords = arrNew
                    //             var timelen = data.time.length
                    //             for (var ie1 = 0; ie1 < timelen; ie1++) {
                    //                 var find2 = temp[find].coords.findIndex((item) => item[0] === data.time[ie1])
                    //                 if (find2 !== -1) {
                    //                     temp[find].coords[find2] = [data.time[ie1], data[key][ie1]]
                    //                 } else {
                    //                     temp[find].coords.push(
                    //                         [data.time[ie1], data[key][ie1]]
                    //                     )
                    //                 }
                    //             }
                    //         }
                    //         var keyfind = outputKey.findIndex((item) => item === key)
                    //         if (keyfind === -1) {
                    //             outputKey.push(key)
                    wklist[temp[find].onlyId].postMessage({ type: 'rander-data', data: temp[find] })
                }
                var keyfind = outputKey.findIndex((item) => item === key)
                if (keyfind === -1) {
                    outputKey.push(key)
                }
            }
        })
    }
    data = null
}
// 判斷最高最低值
const handleEchartsScale = () => {
    var handleXlimitsMax = 1
    var handleXlimitsMin = 0
    for (var i = 0; i < wkTempMaxMin.length; i++) {
        if (wkTempMaxMin[i]?.TempMax > handleXlimitsMax) {
            handleXlimitsMax = Math.ceil(wkTempMaxMin[i].TempMax * 1.2)
        }
        if (wkTempMaxMin[i]?.TempMin < handleXlimitsMin) {
            handleXlimitsMin = Math.ceil(wkTempMaxMin[i].TempMin * 0.8)
        }
    }
    TempMax = handleXlimitsMax
    TempMin = handleXlimitsMin
    for (var i = 0; i < splice; i++) {
        wklist[i].postMessage({
            type: 'rander-zoom', TempMax, TempMin
            // type: 'rander-zoom', TempMax: 200, TempMin: 0
        })
    }
}
setInterval(() => {
    handleEchartsScale()
    // console.log(outputKey);
    self.postMessage({ type: 'outputKey', outputKey });
    // console.log(temp);
}, 1000)
self.addEventListener('message', function (event) {
    var data = event.data
    if (data.type === 'init') {
        // console.log(event.data);
        splice = data.splice
        wkTempMaxMin = new Array(data.splice)
        for (var i = 0; i < splice; i++) {
            spliceArr.push(0)
            var wk = new Worker('/worker/multithreading-echarts/rendering-charts.js');
            wk.addEventListener('message', function (event1) {
                wkTempMaxMin[event1.data[0]] = event1.data[1]
            })
            wk.postMessage({ type: 'init', yShow: i === 0 ? 1 : 0, canvas: data.canvas[i], width: data.width, height: data.height, onlyID: i }, [data.canvas[i]])
            wklist.push(wk)
        }
        // init()
        // const canvas = event.data.canvas;
        // canvas.width = event.data.width
        // canvas.height = event.data.height
        // chart = echarts.init(canvas, { renderer: 'canvas' });
        // init()
    } else if (data.type === 'deleteChart') {
        // console.log(data);
        temp = temp.filter((item) => !item.name.includes(data.parameter.type + data.parameter.id));
        for (var i = 0; i < splice; i++) {
            wklist[i].postMessage({ type: 'deleteChart', id: data.parameter.type + data.parameter.id })
        }
    } else if (data.type === 'wheelEvent') {
        for (var i = 0; i < splice; i++) {
            wklist[i].postMessage({
                type: 'wheelEvent', wheelEvent: {
                    start: data.wheelEvent.start,
                    end: data.wheelEvent.end,
                    // xAxisScale
                }
            })
        }
        // chart.setOption({
        //     dataZoom: [{
        //         type: 'inside',
        //         realtime: true,
        //         start: event.data.wheelEvent.start,
        //         end: event.data.wheelEvent.end,
        //     }]
        // }, { lazyUpdate: true })
        handleEchartsScale()
    }
})