importScripts('../echarts.min.js');
var chart = null
var TempMax = 1
var TempMin = 0
var time = []
const init = (show) => {
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
                show: show,
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
    output = null
    // console.log("成功初始化echarts");
}
var tempArr = []
var tempseries = false
var onlyID = 0
setInterval(() => {
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
            data: tempArr
        }
    ]

    if (chart !== null && tempseries) {
        if (tempArr.length === 0 || tempArr === null) {
            console.log(123);
        }
        chart.setOption({
            xAxis: {
                data: time
            },
            series
        },
            { lazyUpdate: false, replaceMerge: ['series'] }
        );  // 設置圖表選項 , useDirtyRect: true { lazyUpdate: false }
        tempseries = false
    }
    handleEchartsScale()
}, 1000 / 23)
var TempMax = 1
var TempMin = 0
const handleEchartsScale = () => {
    if (chart !== null) {
        var handleXlimitsMax = 1
        var handleXlimitsMin = 0
        var xAxis = chart.getModel().getComponent('xAxis', 0); // 0 表示第一個 x 軸
        var xAxisScale = xAxis.axis.scale.getTicks()
        var xAxisScalelen = xAxisScale.length
        for (var i = 0; i < tempArr.length; i++) {
            for (var j = 0; xAxisScalelen; j++) {
                if (tempArr[i]?.coords[xAxisScale[j]?.value] !== undefined) {
                    var indexTemp = tempArr[i].coords[xAxisScale[j].value]
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
        self.postMessage([onlyID, { TempMax, TempMin }])
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
}
self.addEventListener('message', function (event) {
    var data = event.data
    if (data.type === 'init') {
        const canvas = data.canvas;
        canvas.width = data.width
        canvas.height = data.height
        chart = echarts.init(canvas, { renderer: 'canvas' });
        onlyID = data.onlyID
        init(data.yShow === 1 ? true : false)
    } else if (data.type === 'rander-time') {
        // console.log(data);
        time = data.time
    } else if (data.type === 'rander-data-sg') {
        console.log(data);
    } else if (data.type === 'rander-data') {
        var chartData = data.data
        var findIndex = tempArr.findIndex((item) => item.name === chartData.name)
        if (findIndex === -1) {
            tempArr.push(chartData)
        } else {
            var findIndex2 = tempArr[findIndex].coords.findIndex((item) => item[0] === chartData.coords[0][0])
            if (findIndex2 === -1) {
                tempArr[findIndex].coords = [...tempArr[findIndex].coords, ...chartData.coords]
            } else {

                tempArr[findIndex].coords[findIndex2] = chartData.coords[0]
            }
        }
        tempseries = true
        // for (var i = 0; i < data.data.length; i++) {
        //         var arr0001 = tempArr[findIndex].coords
        //         var len0001 = data.data[i].coords.length
        //         for (var ie1 = 0; ie1 < len0001; ie1++) {
        //             var find2 = arr0001.findIndex((item) => item[0] === data.data[i].coords[ie1][0])
        //             if (find2 !== -1) {
        //                 arr0001[find2] = data.data[i].coords[ie1]
        //             } else {
        //                 arr0001.push(data.data[i].coords[ie1])
        //             }
        //         }
        //         tempArr[findIndex].coords = arr0001
        //     } else {
        //         tempArr.push(data.data[i])
        //     }
        // }

    } else if (data.type === 'rander-zoom') {
        chart.setOption({
            yAxis: [
                {
                    max: data.TempMax,
                    min: data.TempMin,
                    scale: true
                }
            ],
        },
            { lazyUpdate: false }
        );  // 設置圖表選項 , useDirtyRect: true { lazyUpdate: false }
    } else if (data.type === 'deleteChart') {
        tempArr = tempArr.filter((item) => !item.name.includes(data.id));
        tempseries = true
    } else if (data.type === 'wheelEvent') {
        handleEchartsScale()
        chart.setOption({
            dataZoom: [{
                type: 'inside',
                realtime: true,
                start: data.wheelEvent.start,
                end: data.wheelEvent.end,
            }]
        }, { lazyUpdate: true })
    }
    data = null
    // console.log(event.data);
})
