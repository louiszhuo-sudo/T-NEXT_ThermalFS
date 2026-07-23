var ws2 = null;
var reconnectInterval = 3000; // 3 秒重新連線間隔
var reconnectTimeout = null;  // 保存 setTimeout 的引用
var tabContent = null;
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
            feature: "refresh_hmi",
            method: "subscribe_fs_overall_hmi1",
            session: Math.random().toString(36).substr(2),
            content: {
                tab_id: tabContent.tab_id,
            },
        };
        // console.log('itemitemioutputoutputoutputoutputoutputtemitemitemitem', tabContent);

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
            let output = e.data
            // if (runType === 'ctreeviews') {
            //     output = ctree(e.data)
            // } else if (runType === 'main') {
            //     output = e.data
            // }
            // console.log('itemitemioutputoutputoutputoutputoutputtemitemitemitem', JSON.parse(output));
            self.postMessage({
                type: 'ws',
                parameter: output
            });
            limitStatus = false
            output = null
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
        tabContent = JSON.parse(parameter.item)
        runType = parameter.type
        runws2(parameter.wsURL)
    }
})
self.postMessage({
    type: 'open',
    parameter: {}
});
