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
    console.log("成功初始化echarts");
}
var tempArr = []
self.addEventListener('message', function (event) {
    var data = event.data
    if (data.type === 'init') {
        const canvas = data.canvas;
        canvas.width = data.width
        canvas.height = data.height
        chart = echarts.init(canvas, { renderer: 'canvas' });
        init(data.yShow === 1 ? true : false)
    } else if (data.type === 'rander-time') {
        // console.log(data);
        time = data.time
    } else if (data.type === 'rander-data-sg') {
        console.log(data);
    } else if (data.type === 'rander-data') {
        // for (var i = 0; i < data.data.length; i++) {
        //     // console.log(data.data[i]);
        //     var findIndex = tempArr.findIndex((item) => item.name === data.data[i].name)
        //     if (findIndex !== -1) {
        //         tempArr[findIndex].coords = [...tempArr[findIndex].coords, ...data.data[i].coords]
        //     } else {
        //         tempArr.push(data.data[i])
        //     }
        // }
        // console.log("x", tempArr);
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
                data: data.data
            }
        ]
        if (chart !== null) {
            // console.log({
            //     xAxis: {
            //         data: time
            //     },
            //     // yAxis: [
            //     //     {
            //     //         max: TempMax,
            //     //         min: TempMin,
            //     //         scale: true
            //     //     }
            //     // ],
            //     series
            // });
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
                { lazyUpdate: false, replaceMerge: ['series'] }
            );  // 設置圖表選項 , useDirtyRect: true { lazyUpdate: false }
        }
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
    }
    data = null
    // console.log(event.data);
})
