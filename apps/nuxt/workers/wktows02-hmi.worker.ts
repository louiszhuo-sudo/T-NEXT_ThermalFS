import { encode, decode } from '@msgpack/msgpack';
var ws2 = null;
var reconnectInterval = 3000; // 3 秒重新連線間隔
var reconnectTimeout = null;  // 保存 setTimeout 的引用
var tabContent = null;
var runType = null;
var limitINT = null
var limitStatus = true
interface HmiContent {
    state: Record<string, any>;
    alldaychart: Record<string, any>; // 使用 Record 也是定義物件的一種方式
    weekchart: Record<string, any>;
    threelight: Record<string, any>;
    countlight: Record<string, any>;
    lable: Record<string, any>;
}
const runws2 = (url) => {
    ws2 = new WebSocket(url);
    ws2.binaryType = 'arraybuffer'; // ⭐ 關鍵這一行
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
            method: "subscribe_fs_overall_hmi_CMS",
            session: Math.random().toString(36).substr(2),
            content: {
                tab_id: tabContent.tab_id,
            },
        };
        // console.log('itemitemioutputoutputoutputoutputoutputtemitemitemitem', tabContent);

        ws2.send(JSON.stringify(output));
    };

    ws2.onclose = () => {
        console.log("WebSocket 02 已關閉，3 秒後嘗試重新連線...");
        // 每 3 秒嘗試重新連線
        reconnectTimeout = setTimeout(() => {
            runws2(url);
        }, reconnectInterval);
    };

    ws2.onerror = (err) => {
        console.error("WebSocket 02 發生錯誤:", err);
        // 關閉 WebSocket 以觸發 onclose 進行重新連線
        ws2.close();
    };

    ws2.onmessage = (e) => {
        if (limitStatus) {
            // const output = JSON.parse(e.data)
            const output = decode(new Uint8Array(e.data));
            // console.log('原始資料', output);
            // if (runType === 'ctreeviews') {
            //     output = ctree(e.data)
            // } else if (runType === 'main') {
            //     output = e.data
            // }
            const hmicontent: HmiContent = {
                state: {},
                alldaychart: {},
                weekchart: {},
                threelight: {},
                countlight: {},
                lable: {}
            };
            // 三色燈
            for (var i = 0; i < output[0].length; i++) {
                hmicontent.threelight[output[0][i][0]] = { data: output[0][i] }
            }
            // HMI
            for (var i = 0; i < output[1].length; i++) {
                hmicontent.state[output[1][i].container_id] = { data: output[1][i] }
            }
            // 警報次數
            for (var i = 0; i < output[2].length; i++) {
                hmicontent.countlight[output[2][i][0]] = { data: output[2][i] }
            }
            //24c
            for (var i = 0; i < output[3].length; i++) {
                hmicontent.alldaychart[output[3][i][0]] = { data: output[3][i] }
            }
            // week
            for (var i = 0; i < output[4].length; i++) {
                hmicontent.weekchart[output[4][i][0]] = { data: output[4][i] }
            }
            // lable
            for (var i = 0; i < output[5].length; i++) {
                hmicontent.lable[output[5][i][0]] = { data: output[5][i] }
            }
            // console.log('itemitemioutputoutputoutputoutputoutputtemitemitemitem', hmicontent);

            const view = new Uint8Array(encode(hmicontent))
            self.postMessage({
                type: 'ws',
                parameter: view,
            }, [view.buffer]);
            // self.postMessage({
            //     type: 'ws',
            //     parameter: output
            // });
            // limitStatus = false
            // output = null
        }
    };
};
// setTimeout(() => {
//     ws2.close();
//     self.postMessage({
//         type: 'close',
//         parameter: {}
//     });
//     self.close(); // 關閉 Worker
//     // }, 0.5 * 60 * 1000)
// }, 60 * 1000)
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
