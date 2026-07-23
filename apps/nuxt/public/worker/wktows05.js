var ws5 = null;
var reconnectInterval = 3000; // 3 秒重新連線間隔
var reconnectTimeout = null;  // 保存 setTimeout 的引用
const runws5 = (url) => {
    ws5 = new WebSocket(url);
    ws5.onopen = () => {
        // console.log("WebSocket 02 已連線");
        // 清除之前的重新連線計時器
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
    };

    ws5.onclose = () => {
        // console.log("WebSocket 02 已關閉，3 秒後嘗試重新連線...");
        // 每 3 秒嘗試重新連線
        // reconnectTimeout = setTimeout(() => {
        //     runws5(url);
        // }, reconnectInterval);
    };

    ws5.onerror = (err) => {
        // console.error("WebSocket 02 發生錯誤:", err);
        // 關閉 WebSocket 以觸發 onclose 進行重新連線
        ws5.close();
    };

    ws5.onmessage = (e) => {
        self.postMessage({
            type: 'ws',
            parameter: JSON.stringify(e.data)
        });
    };
};
setTimeout(() => {
    ws5.close();
    self.postMessage({
        type: 'close',
        parameter: {}
    });
    self.close(); // 關閉 Worker
}, 0.5 * 60 * 1000)
self.addEventListener('message', function (e) {
    // console.log('object');
    var res = e.data
    var type = res.type
    var parameter = res.parameter
    if (type === 'start') {
        runws5(parameter.wsURL)
    }
})
self.postMessage({
    type: 'open',
    parameter: {}
});
