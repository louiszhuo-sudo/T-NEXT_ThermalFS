import { encode, decode } from '@msgpack/msgpack';
let ws2: WebSocket | null = null;
var reconnectInterval = 3000; // 3 秒重新連線間隔
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let camID: string | null = null;
let runType: string | null = null;
var limitINT = null
var limitStatus = true
let treeview: any = []
let savetreeview: any = []
let indexMap = new Map()
interface WsMessage {
    feature?: string;
    content?: [] | {} | null;
}
const runws2 = (url: string) => {
    ws2 = new WebSocket(url);
    // ws2 = new WebSocket('ws://192.168.0.116:8702');
    ws2.binaryType = 'arraybuffer'; // ⭐ 關鍵這一行
    // ws2 = new WebSocket('ws://localhost:8702');
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
        ws2!.send(JSON.stringify(output));
        // ws2!.send(encode(output));
    };

    ws2.onclose = () => {
        console.log("WebSocket 02 已關閉，3 秒後嘗試重新連線...");
        // 每 3 秒嘗試重新連線
        reconnectTimeout = setTimeout(() => {
            runws2(url);
        }, reconnectInterval);
    };

    ws2.onerror = (err) => {
        // console.error("WebSocket 02 發生錯誤:", err);
        // 關閉 WebSocket 以觸發 onclose 進行重新連線
        ws2!.close();
    };

    ws2.onmessage = (e) => {
        if (limitStatus) {
            try {
                const data = decode(new Uint8Array(e.data)) as WsMessage;
                // console.log('treeview', data);
                if (data?.feature) {
                    const feature = data?.feature
                    const method = data?.method
                    if (feature === 'initial') {
                        let output = {}
                        if (runType === 'ctreeviews') {
                            output = ctree(data.content)
                        } else if (runType === 'main') {
                            output = JSON.stringify(data.content)
                        }
                        indexMap = buildIndexMap(treeview)
                        savetreeview = output
                        self.postMessage({
                            type: 'ws',
                            parameter: output
                        });
                        limitStatus = false
                    } else if (feature === 'refresh_lastInfo') {
                        // console.log('refresh_lastInfo', data);
                        const content = (data.content || []) as any[];

                        console.log(content);
                        // const sendData = encode(savetreeview)
                        // const view = new Uint8Array(sendData)
                        // self.postMessage({
                        //     type: 'UPDATE_DATA',
                        //     payload: view
                        // }, [view.buffer]);
                    }
                    if (method === 'add_roi') {
                        const content = (data.content || []) as any[];
                        // console.log('addroi in treeview wk', content, Array.from(indexMap));
                        for (let i = 0; i < content.length; i++) {
                            const targetKey = content[i][2];
                            const targetConfig = indexMap.get(targetKey);
                            const roihas = indexMap.has(content[i][3]);
                            if (targetConfig && !roihas) {
                                // 缺少建立sub
                                if (targetConfig.type === 'sub') {
                                    const roi = {
                                        "roi_type": content[i][4],
                                        "roi_id": content[i][3],
                                        "roi_nodeManual": [],
                                        "roi_nodeSystem": [],
                                        "roi_thresholdSystem": 0,
                                        "roi_thresholdManual": 0,
                                        "roi_alarmStatus": 0,
                                        "roi_alarmSwitch": content[i][7],
                                        "roi_maxTemperature": 0,
                                        "roi_alarmContent": [],
                                        "roi_name": content[i][9],
                                        "thermometer_location": [
                                            0,
                                            0
                                        ],
                                        "thermometer_info": {
                                            "min": 0,
                                            "max": 0,
                                            "current": 0,
                                            "level1": 0,
                                            "level2": 0
                                        }
                                    }
                                    savetreeview[targetConfig.path[0]].childNodes[targetConfig.path[1]].childNodes.push({ data: roi })
                                    indexMap.set(content[i][3], {
                                        type: 'roi',
                                        path: [targetConfig.path[0], targetConfig.path[1], savetreeview[targetConfig.path[0]].childNodes[targetConfig.path[1]].childNodes.length - 1]
                                    })
                                    // console.log('savetreeview[targetConfig.path[0]].childNodes[targetConfig.path[1]].data', savetreeview[targetConfig.path[0]].childNodes[targetConfig.path[1]], content[i]);
                                    // savetreeview[targetConfig.path[0]].childNodes[targetConfig.path[1]].data.roi_subGroup_maxTemperatureDiff = row[1]
                                    // savetreeview[targetConfig.path[0]].childNodes[targetConfig.path[1]].data.roi_subGroup_alarmStatus = row[2]
                                    // savetreeview[targetConfig.path[0]].childNodes[targetConfig.path[1]].data.roi_subGroup_alarmContent = row[3]
                                    // savetreeview[targetConfig.path[0]].childNodes[targetConfig.path[1]].data.roi_subGroup_thresholdManual_TempDiff = row[4]
                                }
                            }
                        }
                        const sendData = encode(savetreeview)
                        const view = new Uint8Array(sendData)
                        self.postMessage({
                            type: 'UPDATE_DATA',
                            payload: view
                        }, [view.buffer]);
                    } else if (method === 'delete_roi') {
                        const content = (data.content || []) as any[];
                        // console.log('data'ㄝ);
                        for (let i = 0; i < content.length; i++) {
                            const targetKey = content[i][0];
                            const targetConfig = indexMap.get(targetKey);
                            if (targetConfig !== undefined) {
                                // 缺少sub方法
                                if (targetConfig.type === 'roi') {
                                    // 1. 先定位到該元素所在的「父陣列」
                                    const parentArray = savetreeview[targetConfig.path[0]]
                                        .childNodes[targetConfig.path[1]]
                                        .childNodes;

                                    // 2. 取得要刪除的索引
                                    const targetIndex = targetConfig.path[2];

                                    // 3. 執行刪除 (從 targetIndex 開始刪除 1 個元素)
                                    if (parentArray && parentArray[targetIndex]) {
                                        parentArray.splice(targetIndex, 1);
                                    }
                                    indexMap.delete(targetKey);
                                }
                            }
                        }
                        // console.log('delete_roi in treeview wk', data, Array.from(indexMap));
                        const sendData = encode(savetreeview)
                        const view = new Uint8Array(sendData)
                        self.postMessage({
                            type: 'UPDATE_DATA',
                            payload: view
                        }, [view.buffer]);
                    } else if (method === 'rename_roi' || method === 'modify_roi_alarmSwitch') {
                        const content = (data.content || []) as any[];
                        // console.log('data'ㄝ);
                        for (let i = 0; i < content.length; i++) {
                            const targetKey = content[i][0];
                            const targetConfig = indexMap.get(targetKey);
                            if (targetConfig !== undefined) {
                                // 缺少sub方法
                                if (targetConfig.type === 'roi') {
                                    // 1. 先定位到該元素所在的「父陣列」
                                    const parentArray = savetreeview[targetConfig.path[0]]
                                        .childNodes[targetConfig.path[1]]
                                        .childNodes;

                                    // 2. 取得要刪除的索引
                                    const targetIndex = targetConfig.path[2];
                                    if (method === 'rename_roi') {
                                        parentArray[targetIndex].data.roi_name = content[i][1]
                                    } else if (method === 'modify_roi_alarmSwitch') {
                                        parentArray[targetIndex].data.roi_alarmSwitch = content[i][1]
                                    }
                                    // console.log('parentArray[targetIndex]', parentArray[targetIndex]);
                                    // indexMap.delete(targetKey);
                                }
                            }
                        }
                        // console.log('delete_roi in treeview wk', data, Array.from(indexMap));
                        const sendData = encode(savetreeview)
                        const view = new Uint8Array(sendData)
                        self.postMessage({
                            type: 'UPDATE_DATA',
                            payload: view
                        }, [view.buffer]);
                    }
                }
            } catch (err) {
                console.error('WS message parse error', err);
            }


        }
    };
};
function sendMainRefresh(e: any) {
    self.postMessage({
        type: 'refresh_lastInfo',
        parameter: e
    });
}
function buildIndexMap(tree: any[]) {
    const indexMap = new Map()

    tree.forEach((mainNode, mIdx) => {
        const mainId = mainNode?.data?.roi_mainGroup_id
        if (mainId != null) {
            indexMap.set(mainId, {
                type: 'main',
                path: [mIdx]
            })
        }

        if (!Array.isArray(mainNode?.childNodes)) return

        mainNode.childNodes.forEach((subNode: any, sIdx: any) => {
            const subId = subNode?.data?.roi_subGroup_id
            if (subId != null) {
                indexMap.set(subId, {
                    type: 'sub',
                    path: [mIdx, sIdx]
                })
            }

            if (!Array.isArray(subNode?.childNodes)) return

            subNode.childNodes.forEach((roiNode: any, rIdx: any) => {
                const roiId = roiNode?.data?.roi_id
                if (roiId != null) {
                    indexMap.set(roiId, {
                        type: 'roi',
                        path: [mIdx, sIdx, rIdx]
                    })
                }
            })
        })
    })

    return indexMap
}
const map = [
    [1, [0]], // main
    [13, [0, 0]], // sub
    [101, [0, 0, 0]] // roi
]
// setTimeout(() => {
//     ws2!.close();
// }, 10 * 1000)
setTimeout(() => {
    ws2!.close();
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
function ctree(arr: any) {
    if (!Array.isArray(arr?.image_info)) return treeview

    arr.image_info.forEach((image: { roi_info: any[]; }) => {
        if (!Array.isArray(image?.roi_info)) return

        image.roi_info.forEach(roi => {
            const roiNode = {
                num: 0,
                data: roi,
                childNodes: []
            }

            if (!Array.isArray(roi?.roi_subGroup_list)) return

            roi.roi_subGroup_list.forEach((group: { roi_roi_content_list: any[]; }) => {
                const groupNode = {
                    num: 0,
                    data: group,
                    childNodes: []
                }

                if (Array.isArray(group?.roi_roi_content_list)) {
                    group.roi_roi_content_list.forEach(content => {
                        groupNode.childNodes.push({ data: content })
                        groupNode.num++
                    })
                }

                roiNode.childNodes.push(groupNode)
                roiNode.num++
            })

            treeview.push(roiNode)
        })
    })

    return treeview
}
