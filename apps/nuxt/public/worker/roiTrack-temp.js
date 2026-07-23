// 暫時收取8702資料
// 宣告

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

    ws2.onmessage = (e) => {
        if (canvasStatus) {
            var data = JSON.parse(e.data);
            // console.log(data);
            // wsDATA = data
            getRoiData(data);
            data = null
        }
    };
};
if (false) {
    setTimeout(() => {
        self.postMessage({
            type: 'close',
            parameter: {}
        });
        self.close(); // 關閉 Worker
    }, 0.5 * 60 * 1000)
}
// const runws2 = (url) => {
//     ws2 = new WebSocket(url)
//     ws2.onopen = () => {
//         // console.log('cameraphoto worker run websoket 02');
//         var output = {
//             "feature": "refresh_ROIs_PTZ",
//             "method": "subscribe_combinationId",
//             "session": Math.random().toString(36).substr(2),
//             "content": {
//                 "combination_id": camID
//             }
//         }
//         ws2.send(JSON.stringify(output))
//         // 測試
//         // setTimeout(() => {
//         //     // console.log('test cur pit', cursingPoint_id);
//         //     ptz.forEach((item) => {
//         //         self.postMessage({
//         //             type: 'addPtzs',
//         //             parameter: item
//         //         });
//         //     })
//         // }, 2000)

//     }
//     ws2.onclose = () => {
//         console.log('cameraphoto worker close websoket 02');
//     }
//     ws2.onmessage = (e) => {
//         if (canvasStatus) {
//             // ws5Message(e)
//             var data = JSON.parse(e.data)
//             // let roidata = {}
//             // data.forEach((item0001) => {
//             // if (item0001.cam_id === camID) {
//             //     roidata = item0001
//             // }
//             // })
//             // console.log(data);
//             getRoiData(data)
//         }
//     }
// }
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
})
const getRoiData = (parameter) => {
    try {
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
        if (roiData?.image_info && isList(roiData?.image_info)) {
            roiData.image_info.forEach((ar) => {
                if (ar?.roi_info && isList(ar?.roi_info)) {
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
                        if (ar1.roi_subGroup_list && isList(ar1.roi_subGroup_list)) {
                            ar1.roi_subGroup_list.forEach((ar2) => {
                                if (ar1.roi_mainGroup_type === 1) {
                                    output.data.push({
                                        title: ar2.roi_subGroup_name,
                                        value: ar2.roi_subGroup_id
                                    })
                                }
                                if (ar2.roi_roi_content_list && isList(ar2.roi_roi_content_list)) {
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
                                                    "alarm_status": item.roi_alarmStatus,
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
                                                item.roi_nodeSystem.forEach((blobs, index) => {
                                                // item.roi_nodeManual.forEach((blobs, index) => {
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
                                                        "number": index === 0 ? item.roi_id : item.roi_id + `_${index}`,
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
                                                })
                                            }
                                        }
                                    })
                                }
                            })
                        }
                        // }
                        if (ar1.roi_mainGroup_type === 1) {
                            mainGroupItems.push(output)
                        }
                    })
                }
            })
        }
        // console.log('get roi ', data.line);
        self.postMessage({
            type: 'roiData',
            parameter: {
                data,
                rawData: parameter
            }
        });

        // runSpot(data.spot)
        // runLine(data.line)
        // runScope(data.scope)
        // runBlob(data.blob)
    } catch (e) {
        console.log(e);
    }
}
self.postMessage({
    type: 'open',
    parameter: {}
});

function isList(arr) {
    return Array.isArray(arr);
}
