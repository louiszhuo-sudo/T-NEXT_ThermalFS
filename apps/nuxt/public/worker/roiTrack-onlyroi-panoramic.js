// 宣告
var pixispot = []
var pixiline = []
var pixiscope = []
var pixiBlob = []
var imgHeight = 0
var imgWidth = 0
var canvasStatus = false
var rendomWk = Math.random().toString(36).substr(2)
var camID = null
var ws2 = null;
var reconnectInterval = 3000; // 3 秒重新連線間隔
var reconnectTimeout = null;  // 保存 setTimeout 的引用
const runws2 = (url) => {
    ws2 = new WebSocket(url);
    ws2.onopen = () => {
        // console.log("WebSocket 02 已連線");
        // 清除之前的重新連線計時器
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
        // 連線成功後發送初始請求
        var output = {
            feature: "refresh_ROIs_PTZ",
            method: "subscribe_combinationId",
            session: Math.random().toString(36).substr(2),
            content: {
                combination_id: camID,
            },
        };
        ws2.send(JSON.stringify(output));
    };

    ws2.onclose = () => {
        // console.log("WebSocket 02 已關閉，3 秒後嘗試重新連線...");

        // 每 3 秒嘗試重新連線
        // reconnectTimeout = setTimeout(() => {
        //     runws2(url);
        // }, reconnectInterval);
    };

    ws2.onerror = (err) => {
        console.error("WebSocket 02 發生錯誤:", err);

        // 關閉 WebSocket 以觸發 onclose 進行重新連線
        ws2.close();
    };

    // ws2.onmessage = () => { }
    ws2.onmessage = (e) => {
        if (canvasStatus) {
            var data = JSON.parse(e.data);
            // console.log(data);
            self.postMessage({
                type: 'panoramic_info',
                parameter: data
            });
            getRoiData(data);
            data = null
        }
    };
};
if (false) {
    setTimeout(() => {
        const removeRoiAll = () => {
            pixispot.forEach((item, index) => {
                let output = {
                    html: {},
                    location: [],
                    id: item.data.number,
                    tempPointID: null,
                    data: null
                }
                self.postMessage({
                    type: 'removeMapSpot',
                    parameter: output
                });
            })
            pixiline.forEach((item) => {
                let output = {
                    html: {},
                    location: [],
                    id: item.data.number,
                    tempPointID: null,
                    data: null
                }
                self.postMessage({
                    type: 'removeMapLine',
                    parameter: output
                });
            })
            pixiscope.forEach((item) => {
                let output = {
                    html: {},
                    location: [],
                    id: item.data.number,
                    tempPointID: null,
                    data: null
                }
                self.postMessage({
                    type: 'removeMapScope',
                    parameter: output
                });
            })
            pixiBlob.forEach((item) => {
                let output = {
                    html: {},
                    location: [],
                    id: item.info.number,
                    tempPointID: null,
                    data: null
                }
                self.postMessage({
                    type: 'removeMapBlob',
                    parameter: output
                });
            })
        }
        removeRoiAll()
        self.postMessage({
            type: 'close',
            parameter: {}
        });
        self.close(); // 關閉 Worker
    }, 0.5 * 60 * 1000)
}
//  }, 1 * 60 * 1000)
// setInterval(() => {
//     if (wsDATA !== null) {
//         getRoiData(wsDATA);
//     }
// }, 1500)
// 接收主線程訊息
self.addEventListener('message', function (e) {
    // console.log('object');
    var res = e.data
    var type = res.type
    var parameter = res.parameter
    if (type === 'getRoiData') {
        // 開始處理ROI資訊
        // if (canvasStatus) {
        //     getRoiData(parameter)
        // }
    } else if (type === 'canvasSize') {
        // 開啟ws05
        imgHeight = parameter.imgHeight
        imgWidth = parameter.imgWidth
        canvasStatus = true
    } else if (type === 'start') {
        // 開始處理ROI資訊
        // if (canvasStatus) {
        //     getRoiData(parameter)
        // }
        camID = parameter.camID
        runws2(parameter.wsURL)
    }
    res = null
    type = null
    parameter = null
})
// 方法
const getRoiData = (parameter) => {
    // var roiData = JSON.parse(parameter.data)
    var roiData = parameter
    var data = {
        spot: [],
        line: [],
        scope: [],
        blob: [],
        polygon: [],
        mask: [],
    }
    var mainGroupItems = []
    if (roiData?.image_info) {
        roiData.image_info.forEach((ar) => {
            ar.roi_info.forEach((ar1) => {
                let output = null
                if (ar1.roi_mainGroup_type === 1) {
                    output = {
                        title: ar1.roi_mainGroup_name,
                        value: ar1.roi_mainGroup_id,
                        data: []
                    }
                    // mainGroupItems.push()
                }
                // if (ar?.roi_info.roi_subGroup_list) {
                ar1.roi_subGroup_list.forEach((ar2) => {
                    if (ar1.roi_mainGroup_type === 1) {
                        output.data.push({
                            title: ar2.roi_subGroup_name,
                            value: ar2.roi_subGroup_id
                        })
                    }
                    if (ar2.roi_roi_content_list) {
                        ar2.roi_roi_content_list.forEach((item) => {
                            // console.log('aaaarrr', item);
                            if (data[item.roi_type] !== undefined) {
                                if (item.roi_type === 'scope') {
                                    data.scope.push({
                                        "number": item.roi_id,
                                        "temperature_max": parseFloat(item.roi_maxTemperature),
                                        "temperature_min": 0,
                                        "temperature_point": {
                                            "median": {
                                                "start": item.thermometer_info.level1,
                                                "end": item.thermometer_info.level2
                                            },
                                            "temperature_ranger": {
                                                "max": item.thermometer_info.max,
                                                "min": item.thermometer_info.min
                                            }
                                        },
                                        "position_point_A": {
                                            "x": item.roi_nodeManual[0],
                                            "y": item.roi_nodeManual[1]
                                        },
                                        "position_point_B": {
                                            "x": item.roi_nodeManual[2],
                                            "y": item.roi_nodeManual[3]
                                        },
                                        "alarm_status": item.roi_alarmSwitch,
                                        "threshold": item.roi_thresholdManual,
                                        "approval": item.autoROI_approval,
                                        "temperature_avg": 46.3
                                    })
                                } else if (item.roi_type === 'spot') {
                                    data.spot.push({
                                        "number": item.roi_id,
                                        "temperature_max": parseFloat(item.roi_maxTemperature),
                                        "temperature_min": 0,
                                        "temperature_point": {
                                            "median": {
                                                "start": item.thermometer_info.level1,
                                                "end": item.thermometer_info.level2
                                            },
                                            "temperature_ranger": {
                                                "max": item.thermometer_info.max,
                                                "min": item.thermometer_info.min
                                            }
                                        },
                                        "position": {
                                            "x": item.roi_nodeManual[0],
                                            "y": item.roi_nodeManual[1]
                                        },
                                        "alarm_status": item.roi_alarmSwitch,
                                        "threshold": item.roi_thresholdManual,
                                        "approval": item.autoROI_approval,
                                        "temperature_avg": 46.3
                                    })
                                } else if (item.roi_type === 'line') {
                                    // console.log('item.roi_type ', item);
                                    data.line.push({
                                        "number": item.roi_id,
                                        "temperature_max": parseFloat(item.roi_maxTemperature),
                                        "temperature_min": 0,
                                        "temperature_point": {
                                            "median": {
                                                "start": item.thermometer_info.level1,
                                                "end": item.thermometer_info.level2
                                            },
                                            "temperature_ranger": {
                                                "max": item.thermometer_info.max,
                                                "min": item.thermometer_info.min
                                            }
                                        },
                                        "position_point_A": {
                                            "x": item.roi_nodeManual[0],
                                            "y": item.roi_nodeManual[1]
                                        },
                                        "position_point_B": {
                                            "x": item.roi_nodeManual[2],
                                            "y": item.roi_nodeManual[3]
                                        },
                                        "alarm_status": item.roi_alarmSwitch,
                                        "threshold": item.roi_thresholdManual,
                                        "approval": item.autoROI_approval,
                                        "temperature_avg": 46.3
                                    })
                                } else if (item.roi_type === 'blob') {
                                    item.roi_nodeManual.forEach((blobs, index) => {
                                        var roiAlarmStatus = 0 // 0 = normal ; 1 = level 1 ; 2 = level 2 ; 3 = auto
                                        var approval = item.autoROI_approval
                                        // if (approval === 1) {
                                        //     roiAlarmStatus = 3
                                        // } else if (approval === 0 && item.roi_alarmSwitch === 1 && item.roi_maxTemperature >= item.thermometer_info.level1 && item.roi_maxTemperature < item.thermometer_info.level2) {
                                        //     roiAlarmStatus = 1
                                        // } else if (approval === 0 && item.roi_alarmSwitch === 1 && item.roi_maxTemperature >= item.thermometer_info.level1 && item.roi_maxTemperature >= item.thermometer_info.level2) {
                                        //     roiAlarmStatus = 2
                                        // }
                                        if (approval === 1) {
                                            roiAlarmStatus = 3
                                        } else if (approval === 0 && item.roi_alarmSwitch === 1) {
                                            roiAlarmStatus = item.roi_alarmStatus
                                        }
                                        data.blob.push({
                                            "number": index === 0 ? item.roi_id : item.roi_id + index,
                                            "d_number": item.roi_id,
                                            "temperature_max": parseFloat(item.roi_maxTemperature),
                                            "temperature_min": 0,
                                            "temperature_point": {
                                                "median": {
                                                    "start": item.thermometer_info.level1,
                                                    "end": item.thermometer_info.level2
                                                },
                                                "temperature_ranger": {
                                                    "max": item.thermometer_info.max,
                                                    "min": item.thermometer_info.min
                                                }
                                            },
                                            "points": [
                                                blobs
                                            ],
                                            "alarm_status": item.roi_alarmSwitch,
                                            "threshold": item.roi_thresholdManual,
                                            "approval": roiAlarmStatus,
                                            "temperature_avg": 46.3
                                        })
                                        roiAlarmStatus = null
                                        approval = null
                                    })
                                }
                            }
                        })
                    }
                })
                // }
                if (ar1.roi_mainGroup_type === 1) {
                    mainGroupItems.push(output)
                }
                output = null
            })
        })
    }
    // console.log('get roi ', data);
    runSpot(data.spot)
    runLine(data.line)
    runScope(data.scope)
    runBlob(data.blob)
    roiData = null
    data = null
    mainGroupItems = null
}
const runSpot = (data) => {
    var len = data.length
    var oldData = pixispot
    var oldDataLen = pixispot.length
    try {
        for (var z = 0; z < oldDataLen; z++) {
            var selectRoi1 = data.find((item) => item.number.toString() === oldData[z].data.number.toString())
            if (selectRoi1 === undefined) {
                let output = {
                    html: {},
                    location: [],
                    id: oldData[z].data.number,
                    tempPointID: null,
                    data: null
                }
                oldData = oldData.filter(obj => obj.data.number !== oldData[z].data.number);
                self.postMessage({
                    type: 'removeMapSpot',
                    parameter: output
                });
                console.log('remove spot');
            }
            selectRoi1 = null
        }
    } catch (error) {
        console.log("Spot function", error);
    }
    for (var x = 0; x < len; x++) {
        var spotfindIndex = oldData.findIndex((item) => item.data.number.toString() === data[x].number.toString())
        data[x].temperature = roundDown(data[x].temperature, 1)
        var tempPointID = 'spot' + data[x].number + rendomWk
        // let myIcon1 = `<div class="spot-div-number">${data[x].number}</div>`
        // let myIconHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}">0</div></div><div class="temperature-bar-canvas"><div class="temperature-bar" id="temperature-bar-${tempPointID}"></div></div></div>`
        let myIcon1 = `<div class="bum-main"><div class="alarm-point-1" id="bum-main-${tempPointID}"></div><div class="spot-div-number">${data[x].number}</div></div>`
        let myIconHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}"></div></div>`
        let output = {
            html: { myIconHtml, myIcon1 },
            location: [data[x].position.y * imgHeight, data[x].position.x * imgWidth],
            id: data[x].number,
            tempPointID,
            data: data[x]
        }
        if (spotfindIndex !== -1) {
            var newAlarm = data[x].alarm_status === 1 && data[x].temperature >= data[x].threshold
            var oldAlarm = oldData[spotfindIndex].data.alarm_status === 1 && oldData[spotfindIndex].data.temperature >= oldData[spotfindIndex].data.threshold
            if (
                JSON.stringify(data[x].position) === JSON.stringify(oldData[spotfindIndex].data.position)
                && newAlarm === oldAlarm
            ) {
                oldData[spotfindIndex].data = data[x]
                self.postMessage({
                    type: 'changeMapSpotDATA',
                    parameter: output
                });
            } else {
                oldData[spotfindIndex].data = data[x]
                console.log('change spot');
                self.postMessage({
                    type: 'changeMapSpot',
                    parameter: output
                });
            }
            newAlarm = null
            oldAlarm = null
        } else {
            oldData.push({
                data: data[x],
            })
            self.postMessage({
                type: 'addMapSpot',
                parameter: output
            });
        }
        spotfindIndex = null
    }
    pixispot = oldData
    len = null
    oldData = null
    oldDataLen = null
}
const runLine = (data) => {
    var len = data.length
    var oldData = pixiline
    var oldDataLen = pixiline.length
    try {
        for (var z1 = 0; z1 < oldDataLen; z1++) {
            var selectRoi1 = data.find((item) => JSON.stringify(item.number) === JSON.stringify(oldData[z1].data.number))
            if (selectRoi1 === undefined) {
                let output = {
                    html: {},
                    location: [],
                    id: oldData[z1].data.number,
                    tempPointID: null,
                    data: null
                }
                // oldData[z1].pixi.remove()
                oldData = oldData.filter(obj => obj.data.number !== oldData[z1].data.number);
                self.postMessage({
                    type: 'removeMapLine',
                    parameter: output
                });
                console.log('wk remove line');
            }
            selectRoi1 = null
        }
    } catch (error) {
        console.log("runLine function", error);
    }
    for (var x = 0; x < len; x++) {
        data[x].temperature_max = roundDown(data[x].temperature_max, 1)
        var linefindIndex = oldData.findIndex((item) => item.data.number.toString() === data[x].number.toString())
        var tempPointID = 'line' + data[x].number + rendomWk
        // let myIcon1 = `<div class="spot-div-number">${data[x].number}</div>`
        // let myIconHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}">0</div></div><div class="temperature-bar-canvas"><div class="temperature-bar" id="temperature-bar-${tempPointID}"></div></div></div>`
        let myIcon1 = `<div class="bum-main"><div class="alarm-point-1" id="bum-main-${tempPointID}"></div><div class="spot-div-number">${data[x].number}</div></div>`
        let myIconHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}"></div></div>`
        let output = {
            html: { myIconHtml, myIcon1 },
            location: [data[x].position_point_A.y * imgHeight, data[x].position_point_A.x * imgWidth, data[x].position_point_B.y * imgHeight, data[x].position_point_B.x * imgWidth],
            id: data[x].number,
            tempPointID,
            data: data[x]
        }
        if (linefindIndex !== -1) {
            var newAlarm = data[x].alarm_status === 1 && data[x].temperature_max >= data[x].threshold
            var oldAlarm = oldData[linefindIndex].data.alarm_status === 1 && oldData[linefindIndex].data.temperature_max >= oldData[linefindIndex].data.threshold
            if (
                JSON.stringify(data[x].position_point_A) === JSON.stringify(oldData[linefindIndex].data.position_point_A) && JSON.stringify(data[x].position_point_B) === JSON.stringify(oldData[linefindIndex].data.position_point_B)
                && newAlarm === oldAlarm
            ) {
                oldData[linefindIndex].data = data[x]
                self.postMessage({
                    type: 'changeMapLineDATA',
                    parameter: output
                });
            } else {
                // oldData[linefindIndex].pixi.remove()
                oldData[linefindIndex].data = data[x]
                self.postMessage({
                    type: 'changeMapLine',
                    parameter: output
                });
                // oldData[linefindIndex].pixi = pixiaddLine(data[x], 'line', tempPointID = oldData[linefindIndex].tempPointID)
            }
            newAlarm = null
            oldAlarm = null
        } else {
            // var tempPointID = Math.random().toString(36).substr(2)
            oldData.push({
                data: data[x],
                // pixi: pixiaddLine(data[x], 'line', tempPointID),
                // tempPointID
            })
            self.postMessage({
                type: 'addMapLine',
                parameter: output
            });
        }
        linefindIndex = null
    }
    pixiline = oldData
    len = null
    oldData = null
    oldDataLen = null
}
const runScope = (data) => {
    var len = data.length
    var oldData = pixiscope
    var oldDataLen = pixiscope.length
    try {
        for (var z1 = 0; z1 < oldDataLen; z1++) {
            var selectRoi1 = data.find((item) => JSON.stringify(item.number) === JSON.stringify(oldData[z1].data.number))
            if (selectRoi1 === undefined) {
                // oldData[z1].pixi.remove()
                let output = {
                    html: {},
                    location: [],
                    id: oldData[z1].data.number,
                    tempPointID: null,
                    data: null
                }
                // removeObject(oldData[z1].pixi)
                oldData = oldData.filter(obj => obj.data.number !== oldData[z1].data.number);
                self.postMessage({
                    type: 'removeMapScope',
                    parameter: output
                });
            }
            selectRoi1 = null
        }
    } catch (error) {
        console.log(error);
    }
    for (var x = 0; x < len; x++) {
        data[x].temperature_max = roundDown(data[x].temperature_max, 1)
        var scopefindIndex = oldData.findIndex((item) => item.data.number.toString() === data[x].number.toString())
        var tempPointID = 'scope' + data[x].number + rendomWk
        // let myIcon1 = `<div class="spot-div-number">${data[x].number}</div>`
        // let myIconHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}">0</div></div><div class="temperature-bar-canvas"><div class="temperature-bar" id="temperature-bar-${tempPointID}"></div></div></div>`
        let myIcon1 = `<div class="bum-main"><div class="alarm-point-1" id="bum-main-${tempPointID}"></div><div class="spot-div-number">${data[x].number}</div></div>`
        let myIconHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}"></div></div>`
        let output = {
            html: { myIconHtml, myIcon1 },
            location: [data[x].position_point_A.y * imgHeight, data[x].position_point_A.x * imgWidth, data[x].position_point_B.y * imgHeight, data[x].position_point_B.x * imgWidth],
            id: data[x].number,
            tempPointID,
            data: data[x]
        }
        if (scopefindIndex !== -1) {
            // 超溫判斷
            var newAlarm = data[x].alarm_status === 1 && data[x].temperature_max >= data[x].threshold
            var oldAlarm = oldData[scopefindIndex].data.alarm_status === 1 && oldData[scopefindIndex].data.temperature_max >= oldData[scopefindIndex].data.threshold
            if (
                JSON.stringify(data[x].position_point_A) === JSON.stringify(oldData[scopefindIndex].data.position_point_A)
                && JSON.stringify(data[x].position_point_B) === JSON.stringify(oldData[scopefindIndex].data.position_point_B)
                && JSON.stringify(data[x].approval) === JSON.stringify(oldData[scopefindIndex].data.approval)
                && JSON.stringify(data[x].alarm_status) === JSON.stringify(oldData[scopefindIndex].data.alarm_status)
                && newAlarm === oldAlarm
            ) {
                oldData[scopefindIndex].data = data[x]
                self.postMessage({
                    type: 'changeMapScopeDATA',
                    parameter: output
                });
            } else {
                // oldData[scopefindIndex].pixi.remove()
                // removeObject(oldData[scopefindIndex].pixi)
                // oldData[scopefindIndex].data = data[x]
                // let groupInfo = pixiaddScope(data[x], 'scope', tempPointID = oldData[scopefindIndex].tempPointID)
                // oldData[scopefindIndex].pixi = groupInfo
                self.postMessage({
                    type: 'changeMapScope',
                    parameter: output
                });
            }
            newAlarm = null
            oldAlarm = null
        } else {
            oldData.push({
                data: data[x],
                // pixi: pixiaddScope(data[x], 'scope', tempPointID),
                // tempPointID
            })
            self.postMessage({
                type: 'addMapScope',
                parameter: output
            });
        }
        scopefindIndex = null
    }
    pixiscope = oldData
    len = null
    oldData = null
    oldDataLen = null
}
const runBlob = (data) => {
    var oldData = pixiBlob
    var oldDataLen = pixiBlob.length
    var newDataLen = data.length
    // console.log('run blob ', data, pixiBlob);
    // var pixiBlob = pixiJsRoiBlobData
    // 以下判斷ROI 是否遭到刪除
    try {
        for (var z = 0; z < oldDataLen; z++) {
            // console.log('oldData[z]?.info?.number', oldData[z]?.info?.number);
            if (oldData[z]?.info?.number) {
                var selectRoi1 = data.find((item) => JSON.stringify(item?.number) === JSON.stringify(oldData[z]?.info?.number))
                if (selectRoi1 === undefined) {
                    let output = {
                        html: {},
                        location: [],
                        id: oldData[z].info.number,
                        tempPointID: null,
                        data: null
                    }
                    oldData = oldData.filter((obj) => {
                        // console.log('wk delect blob DATA', JSON.stringify(obj.info.number), JSON.stringify(oldData[z].info.number));
                        return JSON.stringify(obj.info.number) !== JSON.stringify(oldData[z].info.number)
                    });
                    // console.log('wk delect blob DATA', oldData, JSON.stringify(obj.info.number) , JSON.stringify(oldData[z].number));
                    self.postMessage({
                        type: 'removeMapBlob',
                        parameter: output
                    });
                }
                selectRoi1 = null
            }
        }
    } catch (error) {
        console.log('判斷ROI 是否遭到刪除', error);
    }
    // 判斷
    for (var i = 0; i < newDataLen; i++) {
        var selectRoi = oldData.find((item) => JSON.stringify(item.info.number) === JSON.stringify(data[i].number))
        data[i].temperature_max = roundDown(data[i].temperature_max, 1)
        var tempPointID = 'blob' + data[i].number + rendomWk
        // let myIcon1 = `<div class="spot-div-number">${data[i].number}</div>`
        // let myIconHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}">0</div></div><div class="temperature-bar-canvas"><div class="temperature-bar" id="temperature-bar-${tempPointID}"></div></div></div>`
        let myIcon1 = `<div class="bum-main" ><div class="alarm-point-1" id="bum-main-${tempPointID}"></div><div class="spot-div-number">${data[i].d_number}</div></div>`
        let myIconHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}"></div></div>`
        var getSpline = getSplineAndMakerPoint(data[i].points[0])
        var blobpoint = []
        var k1 = { lng: 0, lat: 0 }
        for (var k = 0; k < data[i].points[0].length; k++) {
            let p = data[i].points[0][k]
            if (k % 2) {
                k1.lat = p * imgHeight
                // console.log('y', p);
                blobpoint.push(k1)
                k1 = { lng: 0, lat: 0 }
            } else {
                // console.log('x', p)
                k1.lng = p * imgWidth
            }
        }
        // console.log('getSpline', blobpoint);
        // transformToPairs(getSpline.spline)
        var output = {
            html: { myIconHtml, myIcon1 },
            location: blobpoint,
            markerLocation: getSpline.filterAgeThan5,
            id: data[i].number,
            tempPointID,
            data: data[i]
        }
        if (selectRoi !== undefined) {

            // console.log('wk ', transformToPairs(splineCurrent(pr, 0.5, 25, true)));
            // console.log('wk ', pr);
            if (JSON.stringify(selectRoi.info.points) === JSON.stringify(data[i].points)
                && selectRoi.info.alarmStatus === data[i].alarmStatus
                && selectRoi.info.approval === data[i].approval
                && selectRoi.info.group_name === data[i].group_name
                && selectRoi.info.group_id === data[i].group_id
            ) {
                var pixiBlobfind12 = pixiBlob.findIndex((item) => JSON.stringify(item.info.number) === JSON.stringify(data[i].number))
                pixiBlob[pixiBlobfind12].info = data[i]
                pixiBlobfind12 = null
                // console.log('wk changes blob DATA');
                self.postMessage({
                    type: 'changeMapBlobDATA',
                    parameter: output
                });
            } else {
                // var olddata = pixiBlob.find((item) => JSON.stringify(item.info.number) === JSON.stringify(data[i].number))
                // var oldpixilen = olddata.pixi.length
                // for (var deletepixi = 0; deletepixi < oldpixilen; deletepixi++) {
                // olddata.pixi[deletepixi].remove()
                // olddata.pixibg[deletepixi].destroy()
                // olddata.marker[deletepixi].remove()
                // }
                // var newpodata = []
                // var newpodatabg1 = []
                // var newmarkerdata = []
                // var tempPointID = Math.random().toString(36).substr(2)
                // newpodatabg1.push(ObjectChangedbg([data[i].spline, data[i].alarmStatus])) // 20230731 add spline bg
                // newpodata.push(ObjectChanged([data[i].spline, data[i].alarmStatus], true, data[i], objectName))
                var pixiBlobfind1 = pixiBlob.findIndex((item) => JSON.stringify(item.info.number) === JSON.stringify(data[i].number))
                // newmarkerdata.push(markerPointObjcet(data[i].markerPoint, data[i].number, data[i].alarmStatus, data[i], objectName, pixiBlob[pixiBlobfind1].tempPointID))
                pixiBlob[pixiBlobfind1].info = data[i]
                // pixiBlob[pixiBlobfind1].pixi = newpodata
                // pixiBlob[pixiBlobfind1].pixibg = newpodatabg1
                // pixiBlob[pixiBlobfind1].marker = newmarkerdata
                // console.log('wk changes blob object');

                self.postMessage({
                    type: 'changeMapBlob',
                    parameter: output
                });
            }
        } else {
            // var points = []
            // var newpodatabg = []
            // var marker = []
            // var tempPointID = Math.random().toString(36).substr(2)
            // newpodatabg.push(ObjectChangedbg([data[i].spline, data[i].alarmStatus])) // 20230731 add spline bg
            // points.push(ObjectChanged([data[i].spline, data[i].alarmStatus], true, data[i], objectName))
            // marker.push(markerPointObjcet(data[i].markerPoint, data[i].number, data[i].alarmStatus, data[i], objectName, tempPointID))
            oldData.push({
                info: data[i],
                // pixi: points,
                // pixibg: newpodatabg,
                // marker,
                // tempPointID
            })
            // console.log('wk add blob');
            self.postMessage({
                type: 'addMapBlob',
                parameter: output
            });
            // points = null
            // marker = null
            // newpodatabg = null
        }
        selectRoi = null
    }
    // if (objectName === "blob") {
    // pixiJsRoiBlobData = pixiBlob
    pixiBlob = oldData
    // } else if (objectName === "mask") {
    //     pixiJsRoiMaskData = pixiBlob
    //     pixiMask = data
    // }
    // oldData = null
    // oldDataLen = null
    // newDataLen = null
    // pixiBlob = null
}
const roundDown = (num, decimal) => {
    return Math.floor((num + Number.EPSILON) * Math.pow(10, decimal)) / Math.pow(10, decimal);
}
// 其他
self.postMessage({
    type: 'open',
    parameter: {}
});


// Spline
const getSplineAndMakerPoint = (points) => {
    var blobpoint = points
    var blobpointlen = points.length
    var x = 0
    var y = 0
    var w = 0
    var h = 0
    var yArr = []
    var xArr = []
    var pr = []
    for (var z = 0; z < blobpointlen; z++) {
        if (z % 2) {
            pr.push((blobpoint[z] * imgHeight))
        } else {
            pr.push((blobpoint[z] * imgWidth))
        }
    }
    var spline1 = splineCurrent(pr, 0, 25, true)
    var splinelen = spline1.length
    for (var ew = 0; ew < spline1.length; ew++) {
        if (ew % 2) {
            yArr.push((-spline1[ew]))
        } else {
            xArr.push((spline1[ew]))
        }
    }
    x = Math.min.apply(null, xArr)
    y = Math.min.apply(null, yArr)
    w = Math.max.apply(null, xArr)
    h = Math.max.apply(null, yArr)
    var makArr = []
    for (let i = 0; i < xArr.length; i++) {
        makArr.push({
            x: xArr[i],
            y: yArr[i]
        })
    }
    // console.log(makArr);

    var arr = []
    var tmp = { x: 0, y: 0 }
    var arr1 = []
    var tmp1 = [0, 0]
    for (var sep = 0; sep < splinelen; sep++) {
        if (sep % 2) {
            tmp.x = spline1[sep]
            arr.push(tmp)
            tmp = { x: 0, y: 0 }
            tmp1[0] = spline1[sep]
            arr1.push(tmp1)
            tmp1 = [0, 0]
        } else {
            tmp.y = spline1[sep]
            tmp1[1] = spline1[sep]
        }
    }
    // console.log('filterAgeThan5', calculateTopLeft(makArr, 0));
    return { spline: spline1, filterAgeThan5: calculateTopLeft(makArr, 0) }
}
function calculateTopLeft(arr, adjustPercent = 0) {
    if (!arr || arr.length === 0) return null;

    // 找到最小的 x 和 y
    let minX = arr[0].x;
    let minY = arr[0].y;

    arr.forEach(point => {
        if (point.x < minX) minX = point.x;
        if (point.y < minY) minY = point.y;
    });

    // 進行微調，向下調整 minY，增加百分比
    const adjustedMinY = minY + (minY * (adjustPercent / 100));

    return { x: minX, y: adjustedMinY };
}
const runCurrent = (res) => {
    var bloblen = res.data[0].length
    var blob = res.data[0]
    for (var i = 0; i < bloblen; i++) {
        var blobpointslen = blob[i].points.length
        var blobpoints = blob[i].points
        var spline = []
        var markerPoint = []
        for (var j = 0; j < blobpointslen; j++) {
            var blobpointlen = blobpoints[j].length
            var blobpoint = blobpoints[j]
            // 
            var x = 0
            var y = 0
            var w = 0
            var h = 0
            var yArr = []
            var xArr = []
            for (var ew = 0; ew < blobpointlen; ew++) {
                if (ew % 2 === 0) {
                    xArr.push(blobpoint[ew] * res.data[2])
                } else {
                    yArr.push(blobpoint[ew] * res.data[1])
                }
            }
            x = Math.min.apply(null, xArr)
            y = Math.min.apply(null, yArr)
            w = Math.max.apply(null, xArr)
            h = Math.max.apply(null, yArr)
            // console.log(x, y, w, h, yArr, xArr);
            // 
            var pr = []
            for (var z = 0; z < blobpointlen; z++) {
                if (z % 2) {
                    pr.push((res.data[1] * blobpoint[z]))
                } else {
                    pr.push((res.data[2] * blobpoint[z]))
                }
            }
            // (backup)20230714 spline 函數移交至後端計算
            var spline1 = this.splineCurrent(pr, 0.5, 25, true)
            // var spline1 = this.splineCurrent(pr, 0, 25, true)
            // console.log('spline1', spline1);
            // (backup)20230714 spline 函數移交至後端計算 end
            // var spline1 = pr
            var splinelen = spline1.length
            var arr = []
            var tmp = { x: 0, y: 0 }
            var arr1 = []
            var tmp1 = [0, 0]
            for (var sep = 0; sep < splinelen; sep++) {
                if (sep % 2) {
                    tmp.x = spline1[sep]
                    arr.push(tmp)
                    tmp = { x: 0, y: 0 }
                    tmp1[0] = spline1[sep]
                    arr1.push(tmp1)
                    tmp1 = [0, 0]
                } else {
                    tmp.y = spline1[sep]
                    tmp1[1] = spline1[sep]
                }
            }
            // console.log("aarr", h, y);
            var filterAgeThan5 = arr.filter(function (item, index, array) {
                // return item.y > e.data[1][key].y + (e.data[1][key].height * 0) && item.y <= e.data[1][key].y + (e.data[1][key].height * 0.05);
                // return item.y > y + (h * 0) && item.y <= y + (h * 0.05);
                return item.y > y + (h * 0) && item.y >= y + (h * 1);
            });
            filterAgeThan5.sort(compare)
            // console.log('filterAgeThan5',filterAgeThan5);
            markerPoint.push(filterAgeThan5[0])
            // 
            // spline.push(spline1)
            spline.push(arr1)
            blobpointlen = null
            blobpoint = null
            pr = null
            spline1 = null
            x = null
            y = null
            w = null
            h = null
            yArr = null
            xArr = null
            splinelen = null
            arr = null
            tmp = null
            filterAgeThan5 = null
        }
        blob[i].spline = spline
        if (blob[i].blob_alarm_status === 0 || blob[i].blob_alarm_status === 1 && blob[i].blob_temperature_max
            < blob[i].blob_threshold) {
            blob[i].alarmStatus = false
        } else {
            blob[i].alarmStatus = true
        }
        blob[i].markerPoint = markerPoint
        blobpointslen = null
        blobpoints = null
        spline = null
        markerPoint = null
    }
    return blob
    // bloblen = null
    // blob = null
}
function transformToPairs(array) {
    const pairs = [];
    for (let i = 0; i < array.length; i += 2) {
        if (array[i + 1] !== undefined) {
            pairs.push({ lat: array[i + 1], lng: array[i] });
        }
    }
    return pairs;
}
function compare(a, b) {
    if (a.x > b.x) {
        return -1;
    }
    if (a.x < b.x) {
        return 1;
    }
    return 0;
}

function splineCurrent(points, tension, numOfSeg, close) {
    // var points = e.data.points
    // var tension = e.data.tension
    // var numOfSeg = e.data.numOfSeg

    tension = typeof tension === 'number' ? tension : 0.5
    // numOfSeg = typeof numOfSeg === 'number' ? numOfSeg : 25
    numOfSeg = 70

    var pts // for cloning point array
    var i = 1
    var l = points.length
    var rPos = 0
    var rLen = (l - 2) * numOfSeg + 2 + (close ? 2 * numOfSeg : 0)
    var res = new Float32Array(rLen)
    var cache = new Float32Array((numOfSeg + 2) * 4)
    var cachePtr = 4
    var st, st2, st3, st23, st32, parse

    pts = points.slice(0)
    if (close) {
        pts.unshift(points[l - 1]) // insert end point as first point
        pts.unshift(points[l - 2])
        pts.push(points[0], points[1]) // first point as last point
    } else {
        pts.unshift(points[1]) // copy 1. point and insert at beginning
        pts.unshift(points[0])
        pts.push(points[l - 2], points[l - 1]) // duplicate end-points
    }
    // cache inner-loop calculations as they are based on t alone
    cache[0] = 1 // 1,0,0,0
    for (; i < numOfSeg; i++) {
        st = i / numOfSeg
        st2 = st * st
        st3 = st2 * st
        st23 = st3 * 2
        st32 = st2 * 3
        cache[cachePtr++] = st23 - st32 + 1 // c1
        cache[cachePtr++] = st32 - st23 // c2
        cache[cachePtr++] = st3 - 2 * st2 + st // c3
        cache[cachePtr++] = st3 - st2 // c4
    }
    cache[++cachePtr] = 1 // 0,1,0,0

    parse = function (pts, cache, l) {
        var i = 2
        var t, pt1, pt2, pt3, pt4, t1x, t1y, t2x, t2y, c, c1, c2, c3, c4

        for (i; i < l; i += 2) {
            pt1 = pts[i]
            pt2 = pts[i + 1]
            pt3 = pts[i + 2]
            pt4 = pts[i + 3]
            t1x = (pt3 - pts[i - 2]) * tension
            t1y = (pt4 - pts[i - 1]) * tension
            t2x = (pts[i + 4] - pt1) * tension
            t2y = (pts[i + 5] - pt2) * tension
            for (t = 0; t < numOfSeg; t++) {
                // t * 4;
                c = t << 2 // jshint ignore: line
                c1 = cache[c]
                c2 = cache[c + 1]
                c3 = cache[c + 2]
                c4 = cache[c + 3]

                res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x
                res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y
            }
        }
        i = null
        t = null
        pt1 = null
        pt2 = null
        pt3 = null
        pt4 = null
        t1x = null
        t1y = null
        t2x = null
        t2y = null
        c = null
        c1 = null
        c2 = null
        c3 = null
        c4 = null
    }

    // calc. points
    parse(pts, cache, l)

    if (close) {
        // l = points.length;
        pts = []
        pts.push(points[l - 4], points[l - 3], points[l - 2], points[l - 1]) // second last and last
        pts.push(points[0], points[1], points[2], points[3]) // first and second
        parse(pts, cache, 4)
    }
    // add last point
    l = close ? 0 : points.length - 2
    res[rPos++] = points[l]
    res[rPos] = points[l + 1]

    pts = null
    i = null
    l = null
    rPos = null
    rLen = null
    // res = null
    cache = null
    cachePtr = null
    st = null
    st2 = null
    st3 = null
    st23 = null
    st32 = null
    parse = null

    return res
}