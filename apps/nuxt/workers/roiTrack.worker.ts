import { encode, decode } from '@msgpack/msgpack';
// const data = decode(new Uint8Array(e.data))
/* =========================
 * 基本狀態
 * ========================= */
let canvasStatus = false;
let randomWk = Math.random().toString(36).substr(2);
let camID: string | null = null;
let imgWidth: number = 0
let imgHeight: number = 0
let ws2: WebSocket | null = null;
const roimap = new Map()
const reconnectInterval = 3000;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

let fps = 0;

/* =========================
 * WebSocket
 * ========================= */
interface RoiItem {
    type: 'scope' | 'blob' | 'spot' | 'line';
    [key: string]: any;
}
const runws2 = (url: string) => {
    ws2 = new WebSocket(url);
    // ws2 = new WebSocket('ws://192.168.0.116:8702');
    ws2.binaryType = 'arraybuffer'; // ⭐ 關鍵這一行
    ws2.onopen = () => {
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }

        const output = {
            feature: 'refresh_ROIs_PTZ',
            method: 'subscribe_combinationId',
            session: Math.random().toString(36).substr(2),
            content: {
                combination_id: camID,
            },
        };

        ws2!.send(JSON.stringify(output));
        // ws2!.send(encode(output));
        // console.log('send 8702 encode', encode(output));
    };

    ws2.onclose = () => {
        // 可自行加 reconnect
    };

    ws2.onerror = (err) => {
        console.error('WebSocket 02 發生錯誤:', err);
        ws2?.close();
    };

    ws2.onmessage = (e) => {
        if (!canvasStatus) return;

        try {
            const data = decode(new Uint8Array(e.data))
            // const data = JSON.parse(e.data);
            // console.log('data', data);

            if (data?.feature) {
                if (data.feature === 'initial') {
                    getRoiData(data.content);
                } else if (data.feature === 'refresh_lastInfo') {
                    self.postMessage({
                        type: 'refresh_lastInfo',
                        parameter: { data },
                    });
                    fps++;
                } else if (data.method === 'modify_roi_nodeManual') {
                    const arr = data.content
                    // console.log('arrarrarr', arr);
                    const sendData = []
                    for (let i = 0; i < arr.length; i++) {
                        const key = roimap.get(arr[i][0]);
                        if (key?.type === 'blob') {
                            const output = runCurrent(arr[i][2])
                            // console.log('arr[i]arr[i]', output);
                            sendData.push([arr[i][0], arr[i][1], output])
                        } else {
                            sendData.push(arr[i])
                        }
                    }
                    const endc = encode(sendData)
                    const view = new Uint8Array(endc)
                    self.postMessage({
                        type: 'modify_roi_nodeManual',
                        parameter: view,
                    }, [view.buffer]);
                    // console.log('data', Array.from(roimap), arr);
                    // const output: { value: any[] } = {
                    //     value: []
                    // };

                    // 2. 定義處理函數的型別
                    if (false) {
                        const modifyblob = (item: any) => {
                            // console.log('find modifyblob', item);
                            let temp = [item[0], item[1], []]
                            var output = runCurrent(item[2])
                            console.log(item[2]);
                            // temp[2] = transformToPairs(splineCurrent(pr1, 0.5, 25, true))
                            return temp
                        }
                        const modifyspot = (item: any) => {
                            return item
                        }
                        const modifyline = (item: any) => {
                            return item
                        }
                        const modifyscope = (item: any) => {
                            return item
                        }

                        // 3. 關鍵：明確宣告 processors 的型別
                        // 使用 Record 確保索引安全，或是直接定義
                        const processors: Record<string, (item: any) => void> = {
                            scope: modifyscope,
                            blob: modifyblob,
                            spot: modifyspot,
                            line: modifyline
                        };

                        // 假設 arr 是從後端來的二維陣列
                        const arr = data.content;
                        console.log('arrarrarr', arr);
                        // 效能優化：先用一個暫存陣列，減少對物件屬性的頻繁存取
                        const tempResults: any[] = [];

                        for (let i = 0; i < arr.length; i++) {
                            const key = roimap.get(arr[i][0]) as RoiItem | undefined;
                            console.log(arr[i]);
                            if (key?.type) {
                                const handler = processors[key.type];
                                if (handler) {
                                    // 4. 執行並將結果存入暫存陣列
                                    const result = handler(arr[i]);
                                    if (result) {
                                        tempResults.push(result);
                                    }
                                }
                            }
                        }
                        // 最後一次性更新到 output
                        const output = encode(tempResults)
                        // output.value = tempResults;

                        // console.log('Final output:', output.value);
                        const view = new Uint8Array(output)
                        self.postMessage({
                            type: 'modify_roi_nodeManual',
                            parameter: view,
                        }, [view.buffer]);
                    }
                    // const output = arr.map((item) => {
                    // var getSpline = getSplineAndMakerPoint(item[2][0])
                    // return [item[0], item[1], item[2][0]]
                    // })

                } else if (data.method === 'add_roi') {
                    // 正式code
                    const sendData = []
                    for (var i = 0; i < data.content.length; i++) {
                        if (data.content[i][4] === 'blob') {
                            data.content[i][6] = runCurrent(data.content[i][6])
                        }
                        sendData.push(data.content[i])
                    }
                    // console.log('addaddaddaddadd', sendData);
                    const endc = encode(sendData)
                    const view = new Uint8Array(endc)
                    self.postMessage({
                        type: 'add_roi',
                        parameter: view,
                    }, [view.buffer]);
                }
                else if (data.method === 'delete_roi') {
                    let endc2 = encode(data.content)
                    let view2 = new Uint8Array(endc2)
                    self.postMessage({
                        type: 'delete_roi',
                        parameter: view2,
                    }, [view2.buffer]);
                }
                else if (data.method === 'rename_roi') {
                    let endc1 = encode(data.content)
                    let view1 = new Uint8Array(endc1)
                    self.postMessage({
                        type: 'rename_roi',
                        parameter: view1,
                    }, [view1.buffer]);
                }
                else if (data.method === 'modify_roi_alarmSwitch') { }
            }
        } catch (err) {
            console.error('WS message parse error', err);
        }
    };
};

/* =========================
 * FPS reset
 * ========================= */
setInterval(() => {
    fps = 0;
}, 1000);

/* =========================
 * Worker message handler
 * ========================= */
self.addEventListener('message', (e: MessageEvent<any>) => {
    const { type, parameter } = e.data ?? {};

    if (type === 'canvasSize') {
        canvasStatus = true;
    }

    if (type === 'start') {
        camID = parameter.camID;
        runws2(parameter.wsURL);
        imgWidth = parameter.imgWidth
        imgHeight = parameter.imgHeight
    }
});

/* =========================
 * ROI data parser
 * ========================= */
type RoiType = 'spot' | 'line' | 'scope' | 'blob' | 'polygon' | 'mask';

interface RoiResultMap {
    spot: any[];
    line: any[];
    scope: any[];
    blob: any[];
    polygon: any[];
    mask: any[];
}

interface WorkerPostMessage {
    type: string;
    parameter: any;
}

/**
 * 判斷是否為 Array
 */
const isList = (arr: unknown): arr is any[] => {
    return Array.isArray(arr);
};

/**
 * ROI 資料解析
 */
const getRoiData = (parameter: any): void => {
    try {
        const roiData = parameter;

        const data: RoiResultMap = {
            spot: [],
            line: [],
            scope: [],
            blob: [],
            polygon: [],
            mask: [],
        };

        const mainGroupItems: any[] = [];

        if (roiData?.image_info && isList(roiData.image_info)) {
            roiData.image_info.forEach((ar: any) => {
                if (!ar?.roi_info || !isList(ar.roi_info)) return;

                ar.roi_info.forEach((ar1: any) => {
                    let output: any = null;

                    if (ar1.roi_mainGroup_type === 1) {
                        output = {
                            title: ar1.roi_mainGroup_name,
                            value: ar1.roi_mainGroup_id,
                            data: [] as any[],
                        };
                    }

                    if (ar1.roi_subGroup_list && isList(ar1.roi_subGroup_list)) {
                        ar1.roi_subGroup_list.forEach((ar2: any) => {
                            if (ar1.roi_mainGroup_type === 1 && output) {
                                output.data.push({
                                    title: ar2.roi_subGroup_name,
                                    value: ar2.roi_subGroup_id,
                                });
                            }

                            if (!ar2.roi_roi_content_list || !isList(ar2.roi_roi_content_list)) return;

                            ar2.roi_roi_content_list.forEach((item: any) => {
                                const roiType: RoiType = item.roi_type;

                                if (!(roiType in data)) return;

                                if (roiType === 'scope') {
                                    roimap.set(item.roi_id, {
                                        type: 'scope'
                                    })
                                    data.scope.push({
                                        id: item.roi_id,
                                        number: item.roi_id,
                                        temperature_max: parseFloat(item.roi_maxTemperature),
                                        temperature_min: 0,
                                        temperature_point: {
                                            median: {
                                                start: item.thermometer_info.level1,
                                                end: item.thermometer_info.level2,
                                            },
                                            temperature_ranger: {
                                                max: item.thermometer_info.max,
                                                min: item.thermometer_info.min,
                                            },
                                        },
                                        position_point_A: {
                                            x: item.roi_nodeManual[0],
                                            y: item.roi_nodeManual[1],
                                        },
                                        position_point_B: {
                                            x: item.roi_nodeManual[2],
                                            y: item.roi_nodeManual[3],
                                        },
                                        alarm_status: item.roi_alarmStatus,
                                        threshold: item.roi_thresholdManual,
                                        approval: item.autoROI_approval,
                                        temperature_avg: 46.3,
                                    });
                                }

                                else if (roiType === 'spot') {
                                    roimap.set(item.roi_id, {
                                        type: 'spot'
                                    })
                                    data.spot.push({
                                        id: item.roi_id,
                                        number: item.roi_id,
                                        temperature_max: parseFloat(item.roi_maxTemperature),
                                        temperature_min: 0,
                                        temperature_point: {
                                            median: {
                                                start: item.thermometer_info.level1,
                                                end: item.thermometer_info.level2,
                                            },
                                            temperature_ranger: {
                                                max: item.thermometer_info.max,
                                                min: item.thermometer_info.min,
                                            },
                                        },
                                        position: {
                                            x: item.roi_nodeManual[0],
                                            y: item.roi_nodeManual[1],
                                        },
                                        alarm_status: item.roi_alarmSwitch,
                                        threshold: item.roi_thresholdManual,
                                        approval: item.autoROI_approval,
                                        temperature_avg: 46.3,
                                    });
                                }

                                else if (roiType === 'line') {
                                    roimap.set(item.roi_id, {
                                        type: 'line'
                                    })
                                    data.line.push({
                                        id: item.roi_id,
                                        number: item.roi_id,
                                        temperature_max: parseFloat(item.roi_maxTemperature),
                                        temperature_min: 0,
                                        temperature_point: {
                                            median: {
                                                start: item.thermometer_info.level1,
                                                end: item.thermometer_info.level2,
                                            },
                                            temperature_ranger: {
                                                max: item.thermometer_info.max,
                                                min: item.thermometer_info.min,
                                            },
                                        },
                                        position_point_A: {
                                            x: item.roi_nodeManual[0],
                                            y: item.roi_nodeManual[1],
                                        },
                                        position_point_B: {
                                            x: item.roi_nodeManual[2],
                                            y: item.roi_nodeManual[3],
                                        },
                                        alarm_status: item.roi_alarmSwitch,
                                        threshold: item.roi_thresholdManual,
                                        approval: item.autoROI_approval,
                                        temperature_avg: 46.3,
                                    });
                                }

                                else if (roiType === 'blob' && isList(item.roi_nodeSystem)) {
                                    roimap.set(item.roi_id, {
                                        type: 'blob'
                                    })
                                    item.roi_nodeSystem.forEach((blob: any, index: number) => {
                                        let roiAlarmStatus = 0;

                                        if (item.autoROI_approval === 1) {
                                            roiAlarmStatus = 3;
                                        } else if (item.autoROI_approval === 0 && item.roi_alarmSwitch === 1) {
                                            roiAlarmStatus = item.roi_alarmStatus;
                                        }

                                        data.blob.push({
                                            id: item.roi_id,
                                            number: index === 0 ? item.roi_id : `${item.roi_id}_${index}`,
                                            d_number: item.roi_id,
                                            temperature_max: parseFloat(item.roi_maxTemperature),
                                            temperature_min: 0,
                                            temperature_point: {
                                                median: {
                                                    start: item.thermometer_info.level1,
                                                    end: item.thermometer_info.level2,
                                                },
                                                temperature_ranger: {
                                                    max: item.thermometer_info.max,
                                                    min: item.thermometer_info.min,
                                                },
                                            },
                                            points: [blob],
                                            alarm_status: item.roi_alarmSwitch,
                                            threshold: item.roi_thresholdManual,
                                            approval: roiAlarmStatus,
                                            temperature_avg: 46.3,
                                        });
                                    });
                                }
                            });
                        });
                    }

                    if (ar1.roi_mainGroup_type === 1 && output) {
                        mainGroupItems.push(output);
                    }
                });
            });
        }
        self.postMessage({
            type: 'roiData',
            parameter: {
                data,
                rawData: parameter,
            },
        } as WorkerPostMessage);
    } catch (e) {
        console.error(e);
    }
};

/* =========================
 * Worker ready
 * ========================= */
self.postMessage({
    type: 'open',
    parameter: {},
});

const getSplineAndMakerPoint = (points: any) => {
    const blobpoint = points;
    const blobpointlen = points.length;

    // 1. 預分配 Float32Array 處理輸入點，避免不斷 push
    const pr = new Float32Array(blobpointlen);
    for (let z = 0; z < blobpointlen; z++) {
        pr[z] = blobpoint[z] * (z % 2 ? imgHeight : imgWidth);
    }

    // 2. 呼叫原本優化過的 splineCurrent (它回傳 Float32Array)
    const spline1 = splineCurrent(pr, 0.5, 25, true);
    const splinelen = spline1.length;

    // 3. 一次遍歷找出 Min/Max 並計算 TopLeft
    // 這裡完全取代了 xArr, yArr, makArr, calculateTopLeft 的功能
    let minX = Infinity;
    let minY = Infinity;

    for (let ew = 0; ew < splinelen; ew += 2) {
        const x = spline1[ew];
        const y = -spline1[ew + 1]; // 這裡直接帶入原本 yArr 的邏輯

        if (x < minX) minX = x;
        if (y < minY) minY = y;
    }

    // 處理 adjustPercent 邏輯 (原本 calculateTopLeft 的部分)
    // 假設你的 adjustPercent 是 0
    const adjustedMinY = minY + (minY * (0 / 100));

    // 4. 移除原本後段那些沒用的 arr, arr1, tmp, tmp1 迴圈
    // 那些迴圈只是在重新包裝資料，如果後端不需要，就不應該在 60Hz 裡跑

    return {
        spline: spline1,
        filterAgeThan5: { x: minX, y: adjustedMinY }
    };
}

const getSplineAndMakerPointbak = (points: any) => {
    var blobpoint = points
    var blobpointlen = points.length
    var x = 0
    var y = 0
    var w = 0
    var h = 0
    var yArr: number[] = []
    var xArr: number[] = []
    var pr: number[] = []
    for (var z = 0; z < blobpointlen; z++) {
        if (z % 2) {
            pr.push((blobpoint[z] * imgHeight))
        } else {
            pr.push((blobpoint[z] * imgWidth))
        }
    }
    var spline1: any = splineCurrent(pr, 0.5, 25, true)
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
function calculateTopLeft(arr: any, adjustPercent = 0) {
    if (!arr || arr.length === 0) return null;

    // 找到最小的 x 和 y
    let minX = arr[0].x;
    let minY = arr[0].y;

    arr.forEach((point: { x: number; y: number; }) => {
        if (point.x < minX) minX = point.x;
        if (point.y < minY) minY = point.y;
    });

    // 進行微調，向下調整 minY，增加百分比
    const adjustedMinY = minY + (minY * (adjustPercent / 100));

    return { x: minX, y: adjustedMinY };
}
const runCurrent = (res) => {
    let output = []
    var bloblen = [res.length]
    var blob = [res]
    // console.log(res);
    for (var i = 0; i < bloblen; i++) {
        const blobpointslen = blob[i].length
        const blobpoints = blob[i]
        // console.log('blobpointslen, blobpoints', blobpointslen, blobpoints);
        const tempSave = {
            spline: [],
            markerPoint: []
        }
        for (var j = 0; j < blobpointslen; j++) {
            let blobpointlen = blobpoints[j].length
            let blobpoint = blobpoints[j]
            // console.log('blobpointlen, blobpoint', blobpointlen, blobpoint);
            let x = 0
            let y = 0
            let w = 0
            let h = 0
            let yArr = []
            let xArr = []
            for (var ew = 0; ew < blobpointlen; ew++) {
                if (ew % 2 === 0) {
                    xArr.push(blobpoint[ew] * imgWidth)
                } else {
                    yArr.push(blobpoint[ew] * imgHeight)
                }
            }
            x = Math.min.apply(null, xArr)
            y = Math.min.apply(null, yArr)
            w = Math.max.apply(null, xArr)
            h = Math.max.apply(null, yArr)
            // console.log(x, y, w, h, yArr, xArr);
            var pr = []
            for (var z = 0; z < blobpointlen; z++) {
                if (z % 2) {
                    pr.push((imgHeight * blobpoint[z]))
                } else {
                    pr.push((imgWidth * blobpoint[z]))
                }
            }
            // (backup)20230714 spline 函數移交至後端計算
            var spline1 = splineCurrent(pr, 0.5, 25, true)
            const { arr, arr1, pr1 } = processSpline(spline1, pr);
            // var filterAgeThan5 = arr.filter(function (item, index, array) {
            //     return item.lat > y + (h * 0) && item.lat >= y + (h * 1);
            // });
            // console.log('getTopRightPoint(pr1)', getTopRightPoint(pr1));
            // filterAgeThan5.sort(compare)
            // tempSave.markerPoint.push(filterAgeThan5[0])
            tempSave.markerPoint.push(getTopRightPoint(pr1))
            tempSave.spline.push(pr1)
        }
        output.push(tempSave)
    }
    return output
}
function getTopRightByRotation(path: { lat: number, lng: number }[], angle: number = 45) {
    // 使用三角函數算標記點，較耗效能，評估後使用
    let sumLat = 0, sumLng = 0, maxDist = 0;
    const len = path.length;

    // 1. 先求質心 (Centroid)
    for (let i = 0; i < len; i++) {
        sumLat += path[i].lat;
        sumLng += path[i].lng;
    }
    const center = { lat: sumLat / len, lng: sumLng / len };

    // 2. 找出最遠點的距離 (半徑)
    for (let i = 0; i < len; i++) {
        const d = Math.hypot(path[i].lat - center.lat, path[i].lng - center.lng);
        if (d > maxDist) maxDist = d;
    }

    // 3. 根據 45 度角推算 Marker 位置
    const rad = (angle * Math.PI) / 180;
    return {
        lng: center.lat + Math.sin(rad) * maxDist * 1.1, // 1.1 倍距離避免重疊
        lat: center.lng + Math.cos(rad) * maxDist * 1.1
    };
}
function getTopRightPoint(path: { lat: number, lng: number }[], offsetFactor: number = 0.0001) {
    // 從現有路徑找出一個適合的點，不太耗效能
    let len = path.length;
    if (len === 0) return null;

    // 初始化邊界
    let maxLat = -Infinity;
    let maxLng = -Infinity;

    // 效能優化：一次迴圈找出最大值
    for (let i = 0; i < len; i++) {
        const point = path[i];
        if (point.lat > maxLat) maxLat = point.lat;
        if (point.lng > maxLng) maxLng = point.lng;
    }

    // 針對 45 度角的物理擺放進行微調
    // 如果單純給 maxLat, maxLng，Marker 會壓在邊緣
    // 加上 offsetFactor 讓它在視覺上往「東北方」挪動
    return {
        lng: maxLng + offsetFactor,
        lat: maxLat + offsetFactor
    };
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
function processSpline(spline, old) {
    const arr = [];
    const arr1 = [];
    const pr1 = []

    for (let i = 0; i < spline.length; i += 2) {
        const x = spline[i + 1];
        const y = spline[i];

        arr.push({ lat: x, lng: y });
        // arr1.push([x, y]);
        arr1.push({ lat: x, lng: y });
    }
    for (let i = 0; i < old.length; i += 2) {
        const x = old[i + 1];
        const y = old[i];

        pr1.push({ lat: x, lng: y });
    }
    return { arr, arr1, pr1 };
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

function transformToPairs(array) {
    const pairs = [];
    for (let i = 0; i < array.length; i += 2) {
        if (array[i + 1] !== undefined) {
            pairs.push({ lat: array[i + 1], lng: array[i] });
        }
    }
    return pairs;
}