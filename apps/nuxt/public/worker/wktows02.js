var ws2 = null;
var reconnectInterval = 3000; // 3 秒重新連線間隔
var reconnectTimeout = null;  // 保存 setTimeout 的引用
var camID = null;
var runType = null;
var limitINT = null
var limitStatus = true
const runws2 = (url) => {
    ws2 = new WebSocket(url);
    limitINT = setInterval(() => {
        limitStatus = true
    }, 1500)
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
        // console.error("WebSocket 02 發生錯誤:", err);
        // 關閉 WebSocket 以觸發 onclose 進行重新連線
        ws2.close();
    };

    ws2.onmessage = (e) => {
        if (limitStatus) {
            let output = {}
            if (runType === 'ctreeviews') {
                output = ctree(e.data)
            } else if (runType === 'main') {
                output = e.data
            }
            self.postMessage({
                type: 'ws',
                parameter: output
            });
            limitStatus = false
        }
    };
};
setTimeout(() => {
    ws2.close();
    self.postMessage({
        type: 'close',
        parameter: {}
    });
    self.close(); // 關閉 Worker
    // }, 0.5 * 60 * 1000)
}, 60 * 1000)
self.addEventListener('message', function (e) {
    // console.log('object');
    var res = e.data
    var type = res.type
    var parameter = res.parameter
    if (type === 'start') {
        camID = parameter.camID
        runType = parameter.type
        runws2(parameter.wsURL)
    }
})
self.postMessage({
    type: 'open',
    parameter: {}
});

function ctree(arr) {
    let treeview = []

    let item0001 = JSON.parse(arr)
    if (item0001?.image_info && isList(item0001?.image_info)) {
        item0001.image_info.forEach((item0002) => {
            if (item0002?.roi_info && isList(item0002?.roi_info)) {
                item0002.roi_info.forEach((item0003) => {
                    let output = {
                        num: 0,
                        data: item0003,
                        childNodes: []
                    }
                    item0003.roi_subGroup_list.forEach((item0004) => {
                        let output2 = {
                            num: 0,
                            data: item0004,
                            childNodes: []
                        }
                        if (item0004.roi_roi_content_list) {
                            item0004.roi_roi_content_list.forEach((item0005) => {
                                output2.childNodes.push({
                                    data: item0005,
                                })
                                // console.log("item0004", item0005.roi_type + item0005.roi_number, item0005.roi_alarmStatus);
                                output2.num++
                            })
                        }
                        output.num++
                        output.childNodes.push(output2)
                        output2 = null
                    })
                    treeview.push(output)
                    output = null
                })
            }
        })
    }
    return treeview
}

function isList(arr) {
    return Array.isArray(arr);
}