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
// var zoomRoiData = []
// var testtttt = 0
var colors = ['#FF4800', '#FFB839', '#79FF66', '#00C3FF', '#A189E5']
var colorSelectSum = 0
var wklist = []
// 宣告 wk


// 宣告ws
// var ws1 = new WebSocket('ws://192.168.0.173:8704')
var ws1 = new WebSocket('ws://localhost:8704')
ws1.onopen = (e) => {
    console.log('websocket open to webworker 8704');
    // ws1.send(JSON.stringify({
    //     type: 'init'
    // }))
}
ws1.onclose = (e) => {
    console.log('websocket close to webworker 8704');
}

ws1.onmessage = (e) => {
    // test
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
        for (var i = 0; i < splice; i++) {
            wklist[i].postMessage({ type: 'rander-time', time })
        }
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
    }
    data = null
}
const handleEchartsScale = () => {
    var handleXlimitsMax = 1
    var handleXlimitsMin = 0
    // var xAxis = chart.getModel().getComponent('xAxis', 0); // 0 表示第一個 x 軸
    // var xAxisScale = xAxis.axis.scale.getTicks()
    // var xAxisScalelen = xAxisScale.length
    for (var i = 0; i < temp.length; i++) {
        var xAxisScalelen = temp[i].coords.length
        for (var j = 0; xAxisScalelen; j++) {
            if (temp[i]?.coords[j] !== undefined) {
                var indexTemp = temp[i]?.coords[j]
                for (var z = 0; z < indexTemp.length; z++) {
                    var indexTemp1 = indexTemp[1]
                    // console.log(indexTemp1);
                    if (indexTemp1 > handleXlimitsMax) {
                        handleXlimitsMax = Math.ceil(indexTemp1 * 1.2)
                    }
                    if (indexTemp1 < handleXlimitsMin) {
                        handleXlimitsMin = Math.ceil(indexTemp1 * 0.8)
                    }
                }
            } else {
                break;
            }
        }
        // console.log("qsd", temp, xAxisScale);
        // console.log(handleXlimitsMax, handleXlimitsMin);
        TempMax = handleXlimitsMax
        TempMin = handleXlimitsMin
        // chart.setOption({
        //     yAxis: [
        //         {
        //             max: Math.floor(TempMax),
        //             min: Math.floor(TempMin),
        //             scale: true
        //         }
        //     ],
        // }, { lazyUpdate: false });
    }
    // console.log(TempMax, TempMin);
    for (var i = 0; i < splice; i++) {
        wklist[i].postMessage({
            type: 'rander-zoom', TempMax, TempMin
        })
    }
}
setInterval(() => {
    console.log('sdcc');
    handleEchartsScale()
}, 1000)
const init = () => {
    // 這邊要思考一下，如何分割資料，目前一次傳打包過的資料過去
    // 想看看過出去後，把傳過的資料刪除
    setInterval(() => {
        var totlelen = outputKey.length
        for (var i = 0; i < splice; i++) {
            var start = Math.floor((totlelen / splice) * i)
            var end = Math.floor((totlelen / splice) * (i + 1))
            wklist[i].postMessage({ type: 'rander-data', data: temp.slice(start, end), key: outputKey.slice(start, end) })
            // 移除傳過的資料
            // console.log(start, end);
            // for (var j = start; j < end; j++) {
                // console.log(temp[j]);
                // temp[j].coords = []
            // }
        }
    }, 1000 / 20)
}

self.addEventListener('message', function (event) {
    var data = event.data
    if (data.type === 'init') {
        // console.log(event.data);
        splice = data.splice
        for (var i = 0; i < splice; i++) {
            var wk = new Worker('/worker/multithreading-echarts/rendering-charts.js');
            wk.postMessage({ type: 'init', yShow: i === 0 ? 1 : 0, canvas: data.canvas[i], width: data.width, height: data.height }, [data.canvas[i]])
            wklist.push(wk)
        }
        init()
        // const canvas = event.data.canvas;
        // canvas.width = event.data.width
        // canvas.height = event.data.height
        // chart = echarts.init(canvas, { renderer: 'canvas' });
        // init()
    }
})