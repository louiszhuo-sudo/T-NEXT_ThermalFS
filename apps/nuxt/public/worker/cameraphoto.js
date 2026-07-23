// 全局變數
var ws5 = null
var ptz = []
var cursingPoint_id = []
var ptzinto = null
var imgHeight = 0
var imgWidth = 0
var canvasStatus = false
// 方法
const calculateAngle = (pointA, pointB) => {
    const deltaX = pointB.lng - pointA.lng;
    const deltaY = pointB.lat - pointA.lat;
    const angleInRadians = Math.atan2(deltaY, deltaX);
    const angleInDegrees = angleInRadians * 180 / Math.PI;
    const brng = (angleInDegrees + 360) % 360; // 转换到0-360范围内
    return brng;
}
const runWs5 = (url) => {
    ws5 = new WebSocket(url)
    ws5.onopen = () => {
        // console.log('cameraphoto worker run websoket 05');
    }
    ws5.onclose = () => {
        // console.log('cameraphoto worker close websoket 05');
    }
    ws5.onmessage = (e) => {
        if (canvasStatus) {
            let data = e
            ws5Message(data)
            data = null;
        }
    }
}
if (true) {
    setTimeout(() => {
        // const removeRoiAll = () => {
        //     ptz.forEach((e, index) => {
        //         self.postMessage({
        //             type: 'removePtz',
        //             parameter: {
        //                 id: e.id
        //             }
        //         });
        //     })
        //     cursingPoint_id.forEach((e) => {
        //         self.postMessage({
        //             type: 'removeCursingPoints',
        //             parameter: {
        //                 id: e.id
        //             }
        //         });
        //     })
        // }
        // removeRoiAll()
        self.postMessage({
            type: 'close',
            parameter: {
                saveData: JSON.stringify({ cursingPoint_id, ptz, ptzinto }), // 傳給main 保存
            }
        });
        self.close(); // 關閉 Worker
    }, 30 * 1000)
}
const ws5Message = (e) => {
    // 監聽8705
    var data = JSON.parse(e.data)

    // s
    var colorItems = ['#4845FF', '#00C1DC', '#FF6D6D', '#9859FF']
    var index = 0
    // ptz.forEach((item) => {
    // item.off()
    // item.remove()
    // map.removeLayer(item);
    // })
    // cursingPoint_id.forEach((item) => {
    // item.off()
    // item.remove()
    // map.removeLayer(item);
    // })
    // ptz = []
    var tempPtz = [] // 保存這次的預設物件
    var tempCursingPoint_id = [] // 保存這次的預設物件
    var ptzContent = data.overall_ptzStatus.ptz_content
    // console.log('ptzinto', ptzinto);
    ptzContent.forEach((item1) => {
        var currentPtz = item1.ptz_id === ptzinto
        var ptzListExist = ptz.findIndex((ex) => ex.id === item1.ptz_id)
        if (ptzinto === undefined) {
            currentPtz = true
        }
        if (index > colorItems.length) {
            index = 0
        }
        var color = colorItems[index]
        // PTZ
        var a = [item1.ptz_location[1] * imgHeight, item1.ptz_location[0] * imgWidth]
        var b = [item1.ptz_currentView_location[1] * imgHeight, item1.ptz_currentView_location[0] * imgWidth]
        // var object = initRadius(a, b, color, item1, currentPtz, item1.ptz_id)
        // ptz.push(item1)
        // 扇型計算
        var rw = initRadius1(a, b)
        // 扇型計算 end
        var ptzHtml = `<div class="lnder0move-ptz" style="background-color: ${color};"></div><div class="lnder0move-font-ptz" style="color:${color};">${item1.ptz_name}</div>`
        var ptzOut = {
            html: ptzHtml,
            location: {
                marker1: a,
                marker2: b,
                polygon: rw.points,
                centerLine: rw.lines
            },
            objectStyle: {
                color,
                currentPtz
            },
            id: item1.ptz_id,
            ptz_id: item1.ptz_id
        }
        // ptz.push(ptzOut)
        if (ptzListExist === -1) {
            // 判斷沒有存在過則新增
            self.postMessage({
                type: 'addPtzs',
                parameter: ptzOut
            });
        } else {
            // 判斷已存在
            // console.log('listExist判斷已存在', JSON.stringify(output));
            if (JSON.stringify(ptzOut) !== JSON.stringify(ptz[ptzListExist])) {
                // console.log('修改');
                self.postMessage({
                    type: 'changePtzs',
                    parameter: ptzOut
                });
            }
        }
        tempPtz.push(ptzOut);
        // 預設點
        var ptzCursingPointsContent = item1.ptz_cursingPoints_content
        ptzCursingPointsContent.forEach((item2) => {
            // var currentCursingPoint_id = item1.ptz_id === item2.cursingPoint_id
            var px = currentPtz ? '12px' : '12px'
            var myIconHtml = `<div class="lnder0move" style="border: 2px solid ${color};opacity:${currentPtz ? 1 : 0.6};pointer-events:auto;width:${px};height:${px};"></div><div class="lnder0move-font" style="color:${color};opacity:${currentPtz ? 1 : 0.6};pointer-events: none;">${item2.cursingPoint_name}</div>`
            var listExist = cursingPoint_id.findIndex((ex) => ex.id === item2.cursingPoint_id)
            let output = {
                html: myIconHtml,
                location: [item2.cursingPoint_location[1] * imgHeight, item2.cursingPoint_location[0] * imgWidth],
                // opacity: currentPtz ? 1 : 0.6,
                objectStyle: {
                    color,
                    currentPtz
                },
                ptz_location: ptzOut.location.marker1,
                id: item2.cursingPoint_id,
                ptz_id: item1.ptz_id
            }
            if (listExist === -1) {
                // 判斷沒有存在過則新增
                self.postMessage({
                    type: 'addCursingPoints',
                    parameter: output
                });
            } else {
                // 判斷已存在
                // console.log('listExist判斷已存在', JSON.stringify(output));
                if (JSON.stringify(output) !== JSON.stringify(cursingPoint_id[listExist])) {
                    // console.log('修改');
                    self.postMessage({
                        type: 'changeCursingPoints',
                        parameter: output
                    });
                }

            }
            tempCursingPoint_id.push(output)
        })
        index++
        color = null
        ptzCursingPointsContent = null
    })
    // 判斷是否有刪除的物件
    ptz.forEach((e) => {
        let index = tempPtz.findIndex((item) => item.id === e.id)
        if (index === -1) {
            self.postMessage({
                type: 'removePtz',
                parameter: {
                    id: e.id
                }
            });
        }
    })
    cursingPoint_id.forEach((e) => {
        let index = tempCursingPoint_id.findIndex((item) => item.id === e.id)
        if (index === -1) {
            self.postMessage({
                type: 'removeCursingPoints',
                parameter: {
                    id: e.id
                }
            });
        }
    })
    colorItems = null
    index = null
    ptzContent = null
    ptz = tempPtz
    cursingPoint_id = tempCursingPoint_id
    // console.log('object ,, ', ptz, cursingPoint_id);
    // end
}
const initRadius1 = (a, b) => {
    var latlng = {
        lat: a[0],
        lng: a[1],
    }
    var latlng2 = {
        lat: b[0],
        lng: b[1],
    }
    var angle = 25
    var r = (360 - calculateAngle(latlng, latlng2)) + 90
    if (r > 360) {
        r = r - 360
    }
    var rw = runRadius(latlng.lat, latlng.lng, calculatePixelDistance(latlng2, latlng), r, angle)
    function runRadius(y, x, radius, rotate, angle) {
        // console.log('aasdasdasd', y, x, radius, rotate, angle);
        var center = [y, x];
        var r = rotate
        var startAngle = r - (angle / 2);
        var endAngle = r + (angle / 2); // 结束角度，以度为单位
        if (r > (angle / 2)) {
            startAngle = startAngle - 360
            endAngle = endAngle - 360
        }
        if (endAngle > 360) {
            endAngle = 0
            startAngle = endAngle - rotate;
        }
        var points = [center];
        var lines = [center]
        for (var i = startAngle; i <= endAngle; i++) {
            var angle = i * Math.PI / 180;
            var x = center[0] + radius * Math.cos(angle);
            var y = center[1] + radius * Math.sin(angle);
            points.push([x, y]);
        }
        var angle1 = ((startAngle / 2) + (endAngle / 2)) * Math.PI / 180;
        var x1 = center[0] + radius * Math.cos(angle1);
        var y1 = center[1] + radius * Math.sin(angle1);
        lines.push([x1, y1]);
        return { points, lines }
    }
    function calculatePixelDistance(pointAPixel, pointBPixel) {
        var dx = pointBPixel.lng - pointAPixel.lng;
        var dy = pointBPixel.lat - pointAPixel.lat;
        return Math.sqrt(dx * dx + dy * dy);
    }
    return rw
}
// 監聽主線程
self.addEventListener('message', function (e) {
    var res = e.data
    var type = res.type
    var parameter = res.parameter
    if (type === 'websoket05-URL') {
        // 開啟ws05
        wsUrl = parameter.url
        const de = JSON.parse(parameter.saveData)
        cursingPoint_id = de.cursingPoint_id
        ptz = de.ptz
        ptzinto = de.ptzinto
        runWs5(wsUrl)
    } else if (type === 'canvasSize') {
        // 開啟ws05
        imgHeight = parameter.imgHeight
        imgWidth = parameter.imgWidth
        canvasStatus = true
    } else if (type === 'ptzinto') {
        // 開啟ws05
        ptzinto = parameter.ptzinto
        // console.log('ptzinto', ptzinto);
    }
})
// 以下為其他
// webWorket 通知主線呈worker 已開啟
self.postMessage({
    type: 'open',
    parameter: {}
});
// self.postMessage({  });

// setInterval(() => {
//     self.postMessage({ d: 123 });
// }, 1000)