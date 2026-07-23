importScripts('echarts.min.js');
// 圖表一 - realTime 模式
// var ws1 = new WebSocket('ws://192.168.0.116:8704')
var ws1 = new WebSocket('ws://localhost:8704')
var output
var chart = null
var fps = 0
ws1.onopen = (e) => {
    console.log('websocket open to webworker 8704');
}
ws1.onclose = (e) => {
    console.log('websocket close to webworker 8704');
}
ws1.onmessage = (e) => {
    var data = JSON.parse(e.data)
    var arr = []
    var time = []
    Object.keys(data).forEach(key => {
        if (key === 'time') {
            var strArray1 = data.time.map(function (num) {
                return num.toString();
            });
            time = strArray1
        } else if (key === "reference") { }
        else {
            var strArray = data[key].map(function (num) {
                return [num[0].toString(), num[1].toString()];
            });
            // console.log(strArray);
            arr.push({
                coords: strArray,
                name: key
            })
        }
    })
    // var strArray = arr.map(function (num) {
    //     return num.toString();
    // });
    // console.log("8704 get", time);
    // console.log(arr);
    output = {
        animation: false,
        xAxis: {
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
            data: time
        },
        grid: {
            show: false,
            top: '30',
            left: '50',
            width: '700',
            height: '120'
        },
        yAxis: [
            {
                max: 0.2,
                min: -0.2,
                scale: true
            }
        ],
        series: [
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
                    //   width:2,
                    //   cap:'round',
                    color: '#80898c',
                    // curveness: 0.5,
                },
                // lineStyle:{
                //   width:2,
                //   cap:'round',
                // },
                // large: true,
                data: arr
            }
        ]
    }
    console.log(output);
    if (chart !== null) {
        chart.setOption(output);  // 設置圖表選項
    }
    data = null
    arr = null
    time = null
    fps++
}
setInterval(() => {
    self.postMessage(fps);
    fps = 0
}, 1000)
self.addEventListener('message', function (event) {
    const canvas = event.data.canvas;
    canvas.width = 796
    canvas.height = 170
    chart = echarts.init(canvas, { renderer: 'canvas' });
})