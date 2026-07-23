<template>
    <div class="item-card-content pa-0" id="map-top-b" style="height: 100%; width: 100%;z-index: 0;">
        <LMap ref="LMmap" :min-zoom="state.minZoom" :crs="state.crs" style="height: 100%; width: 100%"
            :options="state.mapOptions" @ready="leafletJsInit()">
        </LMap>
        <div id="message" style="display: none;">
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue'
import L from 'leaflet'
const LMmap = ref(null)
const runIndex = reactive({
    index: 0
})
const { $webSocket02URL } = useNuxtApp()
const props = useAttrs().formtData
const camID = useAttrs().camID
const camType = useAttrs().camType
var peerConnection = null
var signalingChannel = null
// useHead({
//     script: [{
//         src: '/js/Leaflet.markercluster-1.4.1/dist/leaflet.markercluster.js',
//         async: true,
//         defer: true,
//         onload: () => {
//             runIndex.index++
//         }
//     },
//     {
//         src: '/js/Leaflet.markercluster-1.4.1/dist/leaflet.geometryutil.js',
//         async: true,
//         defer: true,
//         onload: () => {
//             runIndex.index++
//         }
//     },
//     {
//         src: '/js/turf.min.js',
//         async: true,
//         defer: true,
//         onload: () => {
//             runIndex.index++
//         }
//     },
//     // { src: '/js/L.PixiOverlay.js' }, // 目前沒有用到pixijs
//     {
//         src: '/js/crypto-js.min.js',
//         async: true,
//         defer: true,
//         onload: () => {
//             runIndex.index++
//         }
//     },
//     {
//         src: '/js/leaflet.rotatedMarker.js',
//         async: true,
//         defer: true,
//         onload: () => {
//             runIndex.index++
//         }
//     },
//     {
//         src: '/js/Leaflet.ImageOverlay.Rotated.js',
//         async: true,
//         defer: true,
//         onload: () => {
//             runIndex.index++
//         }
//     },
//     {
//         src: '/js/Leaflet.GeotagPhoto.min.js',
//         async: true,
//         defer: true,
//         onload: () => {
//             runIndex.index++
//         }
//     }]
// });
var map = null
const state = reactive({
    refreshMapTimeout: null,
    inputRoiNameWindow: false,
    reNameValue: '',
    tempROIdata: {},
    rules: [
        value => {
            if (value) return true

            return '項目名稱不能為空'
        },
    ],
    rotat:
    {
        rotated: 0
    },
    // contextmenu: false,
    // MenuX: 0,
    // MenuY: 0,
    keyctrl: false,
    templatePointInt: null,
    workerTurf: null, // 計算TURF
    globalMouseMoved: {
        x: 0,
        y: 0
    },
    tempMouseLocation: {
        x: 0,
        y: 0
    },
    ws3: {
        readyState: 0
    },
    wsListener3: {
        close: null,
        message: null
    },
    recoderTime: 0,
    rtcPeerConnectionItems: [],
    rtcVIDEOLIST: [],
    rtcVIDETYPEIndex: 0,
    rtcVIDETYPE: 'vis',
    imgWidth: 640,
    imgHeight: -480,
    dragObjectStatus: true,
    // map
    minZoom: -3,
    maxZoom: 20,
    crs: L.CRS.Simple,
    mapOptions: {
        dragging: true,
        zoomSnap: 0.05,
        zoomDelta: 0.05,
        zoomAnimation: false,
        wheelDebounceTime: 40,
        wheelPxPerZoomLevel: 200,
        doubleClickZoom: false,
        zoomControl: false,
        attributionControl: false,
        // scrollWheelZoom: useAttrs().scrollWheelZoom
    },
    // map end
    tempHoverDiv: null,
    // 紀錄滑鼠位置
    mousedownLocations: { // 暫存滑鼠點擊第一位置
        x: 0,
        y: 0
    },
    tempPathItemDiv: null,
    tempPathItemDivLocaltion: {
        x: 0,
        y: 0
    },
    tempMoveFocusDiv: {
        div: null,
        up: null,
        down: null
    },
    saveIndex: {
        old: 0,
        new: 0
    },
    speed: 0,
    // ROI區域
    pixiWebWorker: null, // 處理blob 路徑的webworker
    pixireference: [],
    reference: [],
    pixispot: [],
    pixiline: [],
    pixiscope: [],
    revisionObject: [],
    revisionObjectleave: false,
    tempMouseDownScope: null,
    tempMouseDownScopeObject: null,
    tempMouseDownScopelnglat: null,
    pixiblob: [],
    pixiJsRoiBlobData: [],
    pixiMask: [],
    pixiJsRoiMaskData: [],
    intiRevisionScopeData: null,
    mousesaveLocation: { x: 0, y: 0 },
    tempScopePosition: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    saveFouceTempRevision: null, // 暫存revisionTransformerMove 函數，做刪除監聽用
    dragTargettemp: { x: 0, y: 0 },
    blobStatusAdd: false,
    spotStatusAdd: false,
    lineStatusAdd: false,
    scopeStatusAdd: false,
    lineTempAddObject: null,
    lineTempAddLocation: [],
    scopeTempAddObject: null,
    scopeTempAddLocation: [],
    moveRemovePoint: false,
    AddTempPoints: [],
    removePoint: null,
    blobAddTempObject: null,
    blobPutTempPoint: [],
    blobChangeTempObject: null,
    objectMask: null,
    reqAnim: null,
    changeModeStatus: false,
    addPoint: null,
    testLine: null,
    maskAddMode: 'add', // add or remove
    focusObjectList: {
        spot: [],
        line: [],
        scope: [],
        blob: []
    },
    ptz: [],
    cursingPoint_id: [],
    randomID: Math.random().toString(36).substr(2),
    tempAlarmSwitch: false,
    selectMainGroupValue: null,
    selectSubGroupValue: null,
    mainGroupItems: [],
    subGroupItems: [],
    addroiGroupInputStatus: false,
    checkChangeBox: null,
    tempSRstatus: null,
    tempSRstatusTimeout: null,
    initLocation: [-10000, 10000],
    className: 'rest0-btn' + Math.random().toString(36).substr(2),
    webWorker: null,
    tempSpotObject: [],
    tempLineObject: [],
    tempScopeObject: [],
    tempBlobObject: []
})
// watch(
//     () => runIndex.index,
//     (data, prevData) => {
//         var loadingPlugin = 8 // 要載入幾個地圖套件(需含主程式)
//         // console.log(data);
//         if (data === loadingPlugin) {
//             leafletJsInit()
//         }
//     }
// )
// watch(
//     () => props.wsRoiData,
//     (e, prevData) => {
//         var output = JSON.stringify(e)
//         if (state.webWorker !== null) {
//             state.webWorker.postMessage({
//                 type: 'getRoiData',
//                 parameter: {
//                     data: output
//                 }
//             })
//         }
//         output = null
//     }
// )

const leafletJsInit = () => {
    map = LMmap.value.leafletObject
    map.on('load', () => {
        console.log('map load');
    })
    map.setView([state.imgHeight / 2, state.imgWidth / 2], 1);
    map._layersMaxZoom = 20;
    var markers = L.markerClusterGroup({
        iconCreateFunction: (cluster) => {
            return L.divIcon({ html: '<div class="markerClusterGroupStyle"><div class="markerClusterGroupStyleCount"><span>' + cluster.getChildCount() + '</span></div><div class="markerClusterGroupStyleIcon"><img src="/images/fs/iconporint-icon.svg" /></div></div>' });
        },
        maxClusterRadius: 20
    });
    map.addLayer(markers);
    // 圖片
    const imgPane = map.createPane('blob-pane');
    imgPane.style.zIndex = 0; // 設定 z-index
    var imageUrl = '/images/EMPTYv1-fill.png', // /mock/ir13807.jpg
        imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    var imageOverlay = L.imageOverlay(imageUrl, imageBounds, { pane: imgPane });
    // imageOverlay.setZIndex(-2);
    imageOverlay.addTo(map);
    map.fitBounds(imageBounds)
    // 影片
    const videoPane = map.createPane('blob-pane');
    videoPane.style.zIndex = 1; // 設定 z-index
    const video = document.createElement('video');
    video.autoplay = true;
    video.controls = false;
    video.muted = true;
    video.loop = true;
    video.id = `video${camType}${camID}-${state.randomID}`;
    video.className = 'video-player';
    var videoBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    var videoTag = L.videoOverlay(video, videoBounds, { pane: videoPane }).addTo(map);
    videoTag.getElement().onload = function () {
        // rotateImageOverlay(imageOverlay, 45); // 旋转 45 度
    };
    const currentPort = window.location.port;
    // runRTC(`video${camType}${camID}-${state.randomID}`, `http://192.168.0.173:${currentPort}/video/realtime/${camType}${camID}`, 'vis') // [element id,video url]
    state.webWorker.postMessage({
        type: 'canvasSize',
        parameter: {
            imgWidth: state.imgWidth,
            imgHeight: state.imgHeight
        }
    })
    // 建立暫存物件
    // 宣告各物件的Pane (請從3開始，已佔用 0 = 畫布 1 = 影片物件 2 = 保留)
    const fixedPane = map.createPane('fixed-pane');
    fixedPane.style.zIndex = 2; // 設定 z-index
    const fixedRectangular = L.rectangle([[0, 0], [state.imgHeight, state.imgWidth]], { color: "#fff00", weight: 2, fillOpacity: 0, pane: 'fixed-pane' }).addTo(map);
    const hoverSelectRectangularPane = map.createPane('hoverSelectRectangularPane-pane');
    hoverSelectRectangularPane.style.zIndex = 7; // 設定 z-index
    const hoverSelectRectangular = L.rectangle([[-10000, 10000], [-10000, 10000]], { fill: false, pane: 'hoverSelectRectangularPane-pane' }).addTo(map);
    const spotPane = map.createPane('spot-pane');
    spotPane.style.zIndex = 6; // 設定 z-index
    const linePane = map.createPane('line-pane');
    linePane.style.zIndex = 5; // 設定 z-index
    const scopePane = map.createPane('scope-pane');
    scopePane.style.zIndex = 4; // 設定 z-index
    const blobPane = map.createPane('blob-pane');
    blobPane.style.zIndex = 3; // 設定 z-index
    // ____
    var tempLocation = [-10000, 10000]
    const createTempSpot = () => {
        var imgurl = '/images/spot_1.png'
        var myIcon = L.icon({
            iconUrl: imgurl,
            iconSize: [33, 33],
            iconAnchor: [16.5, 16.5],
        });
        for (let i = 0; i < 30; i++) {
            let tempNumPoint = L.marker(tempLocation, { pane: 'spot-pane', zIndexOffset: 1 }).addTo(map); // 
            let number = L.marker(tempLocation, { draggable: true, pane: 'spot-pane', zIndexOffset: 2 }).addTo(map);
            let point = L.marker(tempLocation, { icon: myIcon, draggable: true, pane: 'spot-pane' }).addTo(map);
            state.tempSpotObject.push({
                id: i,
                object: {
                    number,
                    tempNumPoint,
                    point
                },
                tempPointID: null,
                data: null
            })
            const addDragHandlers = (draggableElement, targetElement) => {
                // draggableElement.on('dragstart', (e) => {
                //     state.dragObjectStatus = false
                // })
                draggableElement.on('drag', (e) => {
                    // state.pushSpot({ location: e.target.getLatLng(), id: roidata.number }) // 註解可減少耗能
                    targetElement.setLatLng(e.target.getLatLng())
                    tempNumPoint.setLatLng(e.target.getLatLng())
                });
                // draggableElement.on('dragend', (e) => {
                //     pushSpot({ location: e.target.getLatLng(), id: roidata.number })
                //     state.dragObjectStatus = true
                // });
            };
            // if (props.mainMode !== 'review') {
            addDragHandlers(point, number);
            addDragHandlers(number, point);
            point.on('mouseover', (e) => {
                const bounds = getLayerBounds(e.target); // 獲取目標圖層的邊界
                console.log('獲取目標圖層的邊界', bounds);
                hoverSelectRectangular.setLatLngs([
                    bounds.getSouthWest(),
                    bounds.getNorthWest(),
                    bounds.getNorthEast(),
                    bounds.getSouthEast()
                ]);
            })
        }
    }
    const createTempLine = () => {
        for (let i = 0; i < 30; i++) {
            var myPoint = L.divIcon({ html: `<div class="div-point"></div>` });
            var nullhtml = L.divIcon({ html: `` });
            var lines = []
            lines[0] = L.polyline([tempLocation, tempLocation], {
                stroke: true,
                weight: 3,
                color: '#000',
                pane: 'line-pane'
            }).addTo(map);
            lines[1] = L.polyline([tempLocation, tempLocation], {
                stroke: true,
                weight: 2,
                color: '#fff',
                pane: 'line-pane'
            }).addTo(map);
            var tempNumPoint = L.marker(tempLocation, { draggable: false, icon: nullhtml, pane: 'line-pane', zIndexOffset: 0 }).addTo(map);
            var numberPoint = L.marker(tempLocation, { icon: nullhtml, pane: 'line-pane', zIndexOffset: 0 }).addTo(map);
            var pointB = L.marker(tempLocation, { icon: myPoint, draggable: true, pane: 'line-pane', zIndexOffset: 9999 }).addTo(map);
            var pointA = L.marker(tempLocation, { icon: myPoint, draggable: true, pane: 'line-pane', zIndexOffset: 9999 }).addTo(map);
            state.tempLineObject.push({
                id: i,
                object: {
                    numberPoint,
                    tempNumPoint,
                    pointB,
                    pointA,
                    lines
                },
                tempPointID: null,
                data: null
            })
            const addDragHandlers = (draggableElement, targetLinesElement, notmovedElement, type, numberOB) => {
                // draggableElement.on('dragstart', (e) => {
                //     state.dragObjectStatus = false
                // })
                draggableElement.on('drag', (e) => {
                    var latlngs = type === 'B' ? [notmovedElement.getLatLng(), e.target.getLatLng()] : [e.target.getLatLng(), notmovedElement.getLatLng()]
                    targetLinesElement.forEach((item) => {
                        item.setLatLngs(latlngs)
                    })
                    if (type === 'A') {
                        numberOB.forEach((item) => {
                            item.setLatLng(e.target.getLatLng())
                        })
                        // numberPoint.setLatLng(e.target.getLatLng())
                        // tempNumPoint.setLatLng(e.target.getLatLng())
                    }
                    // pushline({ location: latlngs, id: data.number })
                });
                // draggableElement.on('dragend', (e) => {
                // var latlngs = type === 'B' ? [notmovedElement.getLatLng(), e.target.getLatLng()] : [e.target.getLatLng(), notmovedElement.getLatLng()]
                // pushline({ location: latlngs, id: data.number })
                // state.dragObjectStatus = true
                // });
            };
            addDragHandlers(pointB, lines, pointA, 'B', [numberPoint, tempNumPoint]);
            addDragHandlers(pointA, lines, pointB, 'A', [numberPoint, tempNumPoint]);
        }
    }
    const createTempScope = () => {
        for (let i = 0; i < 30; i++) {
            var tempNumPoint = L.marker(tempLocation, { draggable: false, pane: 'scope-pane', zIndexOffset: 1 }).addTo(map);
            var marker = L.marker(tempLocation, { pane: 'scope-pane', zIndexOffset: 2 }).addTo(map);
            var rectangleBorder1 = L.rectangle([tempLocation, tempLocation], { color: "#000", weight: 3, fill: false, pane: 'scope-pane' }).addTo(map);
            var rectangleBorder2 = L.rectangle([tempLocation, tempLocation], { color: "#fff", weight: 2, fill: false, pane: 'scope-pane' }).addTo(map);
            var rectangular = L.rectangle([tempLocation, tempLocation], { color: "#fff00", weight: 2, fillOpacity: 0, pane: 'scope-pane' }).addTo(map);
            state.tempScopeObject.push({
                id: i,
                object: {
                    tempNumPoint,
                    marker,
                    rectangleBorder1,
                    rectangleBorder2,
                    rectangular
                },
                tempPointID: null,
                data: null
            })
            rectangular.on('mouseover', (e) => {
                // e.target.setStyle({
                //     color: `rgb(${color[1]} / 50%)`,
                // })
                const bounds = getLayerBounds(e.target); // 獲取目標圖層的邊界
                hoverSelectRectangular.setLatLngs([
                    bounds.getSouthWest(),
                    bounds.getNorthWest(),
                    bounds.getNorthEast(),
                    bounds.getSouthEast()
                ]);
            })
            rectangular.on('mouseout', (e) => {
                // e.target.setStyle({
                //     color: `rgb(${color[0]} / 50%)`,
                // })
                const bounds = [
                    [-10000, 10000], // 左上角
                    [-10000, 10000], // 右上角
                    [-10000, 10000], // 右下角
                    [-10000, 10000]  // 左下角
                ];
                hoverSelectRectangular.setLatLngs(bounds)
            })
        }
    }
    const createTempBlob = () => {
        var color = ['255 255 255', '255 232 27', '255 0 0', '255 107 0']
        for (let i = 0; i < 1000; i++) {
            var tempNumPoint = L.marker(tempLocation, { draggable: false, pane: 'blob-pane', zIndexOffset: 1 }).addTo(map);
            var marker = L.marker(tempLocation, { pane: 'blob-pane', zIndexOffset: 2 }).addTo(map);
            var blob = L.polygon([tempLocation, tempLocation, tempLocation], {
                color: `rgb(${color[0]} / 50%)`,
                // data: roidata,
                fill: 'depends',
                pane: 'blob-pane'
                // renderer: createRenderer('blob-pane')
            }).addTo(map)
            state.tempBlobObject.push({
                id: i,
                object: {
                    tempNumPoint,
                    marker,
                    blob
                },
                tempPointID: null,
                data: null
            })
            // blob.on('mouseover', (e) => {
            //     // e.target.setStyle({
            //     //     color: `rgb(${color[1]} / 50%)`,
            //     // })
            //     const bounds = getLayerBounds(e.target); // 獲取目標圖層的邊界
            //     hoverSelectRectangular.setLatLngs([
            //         bounds.getSouthWest(),
            //         bounds.getNorthWest(),
            //         bounds.getNorthEast(),
            //         bounds.getSouthEast()
            //     ]);
            // })
            // blob.on('mouseout', (e) => {
            //     // e.target.setStyle({
            //     //     color: `rgb(${color[0]} / 50%)`,
            //     // })
            //     const bounds = [
            //         [-10000, 10000], // 左上角
            //         [-10000, 10000], // 右上角
            //         [-10000, 10000], // 右下角
            //         [-10000, 10000]  // 左下角
            //     ];
            //     hoverSelectRectangular.setLatLngs(bounds)
            // })
        }
    }
    createTempSpot()
    createTempLine()
    createTempScope()
    createTempBlob()
    fixedRectangular.on('click', (e) => {
        console.log('click video object');
    })
    map.on('contextmenu', (e) => {
        // e.target.preventDefault();
        console.log('map rigtclick');
    })
}
const getLayerBounds = (layer) => {
    if (!layer) return null;

    // 如果圖層支援 getBounds() 方法 (例如 Polygon, Polyline, Circle, Rectangle)
    if (layer.getBounds && typeof layer.getBounds === 'function') {
        return layer.getBounds();
    }

    // 如果是 Marker，手動創建一個只有一個點的 LatLngBounds
    if (layer instanceof L.Marker) {
        const latLng = layer.getLatLng();
        return L.latLngBounds(latLng, latLng);
    }

    // 如果是 CircleMarker 或 Circle，手動創建邊界
    if (layer instanceof L.Circle || layer instanceof L.CircleMarker) {
        const latLng = layer.getLatLng();
        const radius = layer.getRadius(); // 若是 Circle，這是半徑 (公尺)

        // 計算以中心點和半徑產生的邊界
        return L.latLngBounds(
            latLng.toBounds(radius).getSouthWest(),
            latLng.toBounds(radius).getNorthEast()
        );
    }

    // 無法處理的圖層，返回 null
    return null;
}
const addMapSpot = (e) => {
    let index = findFirstNullIndex(state.tempSpotObject)
    if (index !== null) {
        let currentEvent = state.tempSpotObject[index]
        currentEvent.data = e.data
        currentEvent.tempPointID = e.tempPointID
        // console.log('addMapSpot', e, currentEvent);
        let number = currentEvent.object.number
        let point = currentEvent.object.point
        let tempNumPoint = currentEvent.object.tempNumPoint
        let myIcon1 = L.divIcon({ html: e.html.myIcon1 });
        let myIconHtml = L.divIcon({ html: e.html.myIconHtml });
        number.setLatLng(e.location)
        number.setIcon(myIcon1)
        point.setLatLng(e.location)
        tempNumPoint.setLatLng(e.location)
        tempNumPoint.setIcon(myIconHtml)
        // 移除
        currentEvent = null
        number = null
        point = null
        tempNumPoint = null
        myIcon1 = null
        myIconHtml = null
    }
    index = null
}
const changeMapSpot = (e, type) => {
    let index = findFirstIDIndex(state.tempSpotObject, e.id)
    if (index !== null) {
        let currentEvent = state.tempSpotObject[index]
        currentEvent.data = e.data
        currentEvent.tempPointID = e.tempPointID
        if (type === 'all') {
            let number = currentEvent.object.number
            let point = currentEvent.object.point
            let tempNumPoint = currentEvent.object.tempNumPoint
            let myIcon1 = L.divIcon({ html: e.html.myIcon1 });
            let myIconHtml = L.divIcon({ html: e.html.myIconHtml });
            number.setLatLng(e.location)
            point.setLatLng(e.location)
            tempNumPoint.setLatLng(e.location)
            number.setIcon(myIcon1)
            tempNumPoint.setIcon(myIconHtml)
            number = null
            point = null
            tempNumPoint = null
            myIcon1 = null
            myIconHtml = null
        }
        currentEvent = null
    }
    index = null
}
const removeMapSpot = (e) => {
    let index = findFirstIDIndex(state.tempSpotObject, e.id)
    if (index !== null) {
        let currentEvent = state.tempSpotObject[index]
        currentEvent.data = null
        currentEvent.tempPointID = null
        let number = currentEvent.object.number
        let point = currentEvent.object.point
        let tempNumPoint = currentEvent.object.tempNumPoint
        let myIcon1 = L.divIcon({ html: `` });
        let myIconHtml = L.divIcon({ html: `` });
        number.setLatLng([10000, -10000])
        number.setIcon(myIcon1)
        point.setLatLng([10000, -10000])
        tempNumPoint.setLatLng([10000, -10000])
        tempNumPoint.setIcon(myIconHtml)
        currentEvent = null
        number = null
        point = null
        tempNumPoint = null
        myIcon1 = null
        myIconHtml = null
    }
    index = null
}
const addMapLine = (e) => {
    let index = findFirstNullIndex(state.tempLineObject)
    // console.log('addMapLine', e, index, state.tempLineObject);
    if (index !== null) {
        let currentEvent = state.tempLineObject[index]
        currentEvent.data = e.data
        currentEvent.tempPointID = e.tempPointID
        // console.log('addMapSpot', e, currentEvent);
        let numberPoint = currentEvent.object.numberPoint
        let tempNumPoint = currentEvent.object.tempNumPoint
        let pointA = currentEvent.object.pointA
        let pointB = currentEvent.object.pointB
        let lines = currentEvent.object.lines
        let myIcon1 = L.divIcon({ html: e.html.myIcon1 });
        let myIconHtml = L.divIcon({ html: e.html.myIconHtml });
        numberPoint.setLatLng([e.location[0], e.location[1]])
        tempNumPoint.setLatLng([e.location[0], e.location[1]])
        pointA.setLatLng([e.location[0], e.location[1]])
        pointB.setLatLng([e.location[2], e.location[3]])
        lines[0].setLatLngs([[e.location[0], e.location[1]], [e.location[2], e.location[3]]])
        lines[1].setLatLngs([[e.location[0], e.location[1]], [e.location[2], e.location[3]]])
        numberPoint.setIcon(myIcon1)
        numberPoint.setLatLng([e.location[0], e.location[1]])
        tempNumPoint.setLatLng([e.location[0], e.location[1]])
        tempNumPoint.setIcon(myIconHtml)
        currentEvent = null
        numberPoint = null
        tempNumPoint = null
        pointA = null
        pointB = null
        lines = null
        myIcon1 = null
        myIconHtml = null
    }
    index = null
}
const changeMapLine = (e, type) => {
    let index = findFirstIDIndex(state.tempLineObject, e.id)
    // console.log('changeMapSpot', index, type, state.tempLineObject, e.id);
    if (index !== null) {
        let currentEvent = state.tempLineObject[index]
        currentEvent.data = e.data;
        currentEvent.tempPointID = e.tempPointID;
        if (type === 'all' || type === 'delete') {
            // console.log('addMapSpot', e, currentEvent);
            let numberPoint = currentEvent.object.numberPoint
            let tempNumPoint = currentEvent.object.tempNumPoint
            let pointA = currentEvent.object.pointA
            let pointB = currentEvent.object.pointB
            let lines = currentEvent.object.lines
            let myIcon1 = L.divIcon({ html: type === 'delete' ? '' : e.html.myIcon1 });
            let myIconHtml = L.divIcon({ html: type === 'delete' ? '' : e.html.myIconHtml });
            numberPoint.setLatLng(type === 'delete' ? state.initLocation : [e.location[0], e.location[1]])
            tempNumPoint.setLatLng(type === 'delete' ? state.initLocation : [e.location[0], e.location[1]])
            pointA.setLatLng(type === 'delete' ? state.initLocation : [e.location[0], e.location[1]])
            pointB.setLatLng(type === 'delete' ? state.initLocation : [e.location[2], e.location[3]])
            lines[0].setLatLngs(type === 'delete' ? [state.initLocation, state.initLocation] : [[e.location[0], e.location[1]], [e.location[2], e.location[3]]])
            lines[1].setLatLngs(type === 'delete' ? [state.initLocation, state.initLocation] : [[e.location[0], e.location[1]], [e.location[2], e.location[3]]])
            numberPoint.setIcon(myIcon1)
            numberPoint.setLatLng(type === 'delete' ? state.initLocation : [e.location[0], e.location[1]])
            tempNumPoint.setLatLng(type === 'delete' ? state.initLocation : [e.location[0], e.location[1]])
            tempNumPoint.setIcon(myIconHtml)
            numberPoint = null
            tempNumPoint = null
            pointA = null
            pointB = null
            lines = null
            myIcon1 = null
            myIconHtml = null
        }
        currentEvent = null
    }
    index = null
}
const addMapScope = (e) => {
    let index = findFirstNullIndex(state.tempScopeObject)
    if (index !== null) {
        let currentEvent = state.tempScopeObject[index]
        currentEvent.data = e.data
        currentEvent.tempPointID = e.tempPointID
        let tempNumPoint = currentEvent.object.tempNumPoint
        let marker = currentEvent.object.marker
        let rectangleBorder1 = currentEvent.object.rectangleBorder1
        let rectangleBorder2 = currentEvent.object.rectangleBorder2
        let rectangular = currentEvent.object.rectangular
        let myIcon1 = L.divIcon({ html: e.html.myIcon1 });
        let myIconHtml = L.divIcon({ html: e.html.myIconHtml });
        marker.setLatLng([e.location[0], e.location[1]])
        marker.setIcon(myIcon1)
        tempNumPoint.setLatLng([e.location[0], e.location[1]])
        tempNumPoint.setIcon(myIconHtml)
        const bounds = [
            [e.location[0], e.location[1]], // 左上角
            [e.location[0], e.location[3]], // 右上角
            [e.location[2], e.location[3]], // 右下角
            [e.location[2], e.location[1]]  // 左下角
        ];
        rectangleBorder1.setLatLngs(bounds)
        rectangleBorder2.setLatLngs(bounds)
        rectangular.setLatLngs(bounds)

        currentEvent = null
        tempNumPoint = null
        marker = null
        rectangleBorder1 = null
        rectangleBorder2 = null
        rectangular = null
        myIcon1 = null
        myIconHtml = null
    }
    index = null
}
const changeMapScope = (e, type) => {
    let index = findFirstIDIndex(state.tempScopeObject, e.id)
    if (index !== null) {
        let currentEvent = state.tempScopeObject[index]
        currentEvent.data = e.data;
        currentEvent.tempPointID = e.tempPointID;
        if (type === 'all' || type === 'delete') {
            let tempNumPoint = currentEvent.object.tempNumPoint
            let marker = currentEvent.object.marker
            let rectangleBorder1 = currentEvent.object.rectangleBorder1
            let rectangleBorder2 = currentEvent.object.rectangleBorder2
            let rectangular = currentEvent.object.rectangular
            let myIcon1 = L.divIcon({ html: type === 'delete' ? '' : e.html.myIcon1 });
            let myIconHtml = L.divIcon({ html: type === 'delete' ? '' : e.html.myIconHtml });
            marker.setLatLng(type === 'delete' ? state.initLocation : [e.location[0], e.location[1]])
            marker.setIcon(myIcon1)
            tempNumPoint.setLatLng(type === 'delete' ? state.initLocation : [e.location[0], e.location[1]])
            tempNumPoint.setIcon(myIconHtml)
            const bounds = [
                [type === 'delete' ? state.initLocation[0] : e.location[0], type === 'delete' ? state.initLocation[1] : e.location[1]], // 左上角
                [type === 'delete' ? state.initLocation[0] : e.location[0], type === 'delete' ? state.initLocation[1] : e.location[3]], // 右上角
                [type === 'delete' ? state.initLocation[0] : e.location[2], type === 'delete' ? state.initLocation[1] : e.location[3]], // 右下角
                [type === 'delete' ? state.initLocation[0] : e.location[2], type === 'delete' ? state.initLocation[1] : e.location[1]]  // 左下角
            ];
            rectangleBorder1.setLatLngs(bounds)
            rectangleBorder2.setLatLngs(bounds)
            rectangular.setLatLngs(bounds)
            tempNumPoint = null
            marker = null
            rectangleBorder1 = null
            rectangleBorder2 = null
            rectangular = null
            myIcon1 = null
            myIconHtml = null
        }
        currentEvent = null
    }
    index = null
}
const addMapBlob = (e) => {
    // console.log('add');
    let index = findFirstNullIndex(state.tempBlobObject)
    if (index !== null) {
        // console.log(e);
        let currentEvent = state.tempBlobObject[index]
        // currentEvent.id = e.id
        currentEvent.data = e.data
        currentEvent.tempPointID = e.tempPointID
        let blob = currentEvent.object.blob
        let tempNumPoint = currentEvent.object.tempNumPoint
        let marker = currentEvent.object.marker
        let myIcon1 = L.divIcon({ html: e.html.myIcon1 });
        let myIconHtml = L.divIcon({ html: e.html.myIconHtml });
        marker.setLatLng([-e.markerLocation.y, e.markerLocation.x])
        marker.setIcon(myIcon1)
        tempNumPoint.setLatLng([-e.markerLocation.y, e.markerLocation.x])
        tempNumPoint.setIcon(myIconHtml)
        var spline = Array.from(e.location)
        // console.log('addMapblob main', e.location);
        blob.setLatLngs([spline])
        currentEvent = null
        blob = null
        tempNumPoint = null
        marker = null
        myIcon1 = null
        myIconHtml = null
        spline = null
    }
    index = null
}
const changeMapBlob = (e, type) => {
    let index = findFirstIDIndex(state.tempBlobObject, e.id)
    if (index !== null) {
        let currentEvent = state.tempBlobObject[index]
        currentEvent.data = type === 'delete' ? null : e.data;
        currentEvent.tempPointID = type === 'delete' ? null : e.tempPointID;
        if (type === 'all' || type === 'delete') {
            // console.log(currentEvent, index);
            let blob = currentEvent.object.blob
            let tempNumPoint = currentEvent.object.tempNumPoint
            let marker = currentEvent.object.marker
            let myIcon1 = L.divIcon({ html: type === 'delete' ? '' : e.html.myIcon1 });
            let myIconHtml = L.divIcon({ html: type === 'delete' ? '' : e.html.myIconHtml });
            marker.setLatLng(type === 'delete' ? [-10000, 10000] : [-e.markerLocation.y, e.markerLocation.x])
            marker.setIcon(myIcon1)
            tempNumPoint.setLatLng(type === 'delete' ? [-10000, 10000] : [-e.markerLocation.y, e.markerLocation.x])
            tempNumPoint.setIcon(myIconHtml)
            var spline = Array.from(e.location)
            // console.log('addMapblob main', e);
            blob.setLatLngs(type === 'delete' ? [{ lat: -10000, lng: 10000 }, { lat: -10000, lng: 10000 }, { lat: -10000, lng: 10000 }] : [spline])
            blob = null
            tempNumPoint = null
            marker = null
            myIcon1 = null
            myIconHtml = null
            spline = null
        }
        currentEvent = null
    }
    index = null
}
const invaliMapSzie = () => {
    if (map !== null) {
        var imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
        map.invalidateSize()
        map.fitBounds(imageBounds)
        imageBounds = null
        // var div = document.querySelector('.' + state.className)
        // console.log('div', div);
        // div.classList.add('hidden')
    }
}

const requestBtnGroupEvent = () => {
    console.log('requestBtnGroupEvent');
}

const runRTC = (id, url, videoType) => {
    var logTime = new Date().getTime()
    console.log('建立RTC連線', videoType, logTime, url);
    const retryPause = 2000;

    const video = document.getElementById(id);
    // console.log('rtc video', video);
    // const startBtn = document.getElementById('recorder-start');
    // const stopBtn = document.getElementById('recorder-stop');

    const message = document.getElementById('message');

    let pc = null;
    let restartTimeout = null;
    let sessionUrl = '';
    let offerData = '';
    let queuedCandidates = [];
    let defaultControls = false;
    // let redomID = Math.random().toString(36).substring(2, 9);
    const setMessage = (str) => {
        if (str !== '') {
            // video.controls = false;
        } else {
            // video.controls = defaultControls;
        }
        message.innerText = str;
    };

    const unquoteCredential = (v) => (
        JSON.parse(`"${v}"`)
    );

    const linkToIceServers = (links) => (
        (links !== null) ? links.split(', ').map((link) => {
            const m = link.match(/^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i);
            const ret = {
                urls: [m[1]],
            };

            if (m[3] !== undefined) {
                ret.username = unquoteCredential(m[3]);
                ret.credential = unquoteCredential(m[4]);
                ret.credentialType = 'password';
            }

            return ret;
        }) : []
    );

    const parseOffer = (offer) => {
        const ret = {
            iceUfrag: '',
            icePwd: '',
            medias: [],
        };

        for (const line of offer.split('\r\n')) {
            if (line.startsWith('m=')) {
                ret.medias.push(line.slice('m='.length));
            } else if (ret.iceUfrag === '' && line.startsWith('a=ice-ufrag:')) {
                ret.iceUfrag = line.slice('a=ice-ufrag:'.length);
            } else if (ret.icePwd === '' && line.startsWith('a=ice-pwd:')) {
                ret.icePwd = line.slice('a=ice-pwd:'.length);
            }
        }

        return ret;
    };

    const enableStereoOpus = (section) => {
        let opusPayloadFormat = '';
        let lines = section.split('\r\n');

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('a=rtpmap:') && lines[i].toLowerCase().includes('opus/')) {
                opusPayloadFormat = lines[i].slice('a=rtpmap:'.length).split(' ')[0];
                break;
            }
        }

        if (opusPayloadFormat === '') {
            return section;
        }

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('a=fmtp:' + opusPayloadFormat + ' ')) {
                if (!lines[i].includes('stereo')) {
                    lines[i] += ';stereo=1';
                }
                if (!lines[i].includes('sprop-stereo')) {
                    lines[i] += ';sprop-stereo=1';
                }
            }
        }

        return lines.join('\r\n');
    };

    const editOffer = (offer) => {
        const sections = offer.sdp.split('m=');

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            if (section.startsWith('audio')) {
                sections[i] = enableStereoOpus(section);
            }
        }

        offer.sdp = sections.join('m=');
    };

    const generateSdpFragment = (od, candidates) => {
        const candidatesByMedia = {};
        for (const candidate of candidates) {
            const mid = candidate.sdpMLineIndex;
            if (candidatesByMedia[mid] === undefined) {
                candidatesByMedia[mid] = [];
            }
            candidatesByMedia[mid].push(candidate);
        }

        let frag = 'a=ice-ufrag:' + od.iceUfrag + '\r\n'
            + 'a=ice-pwd:' + od.icePwd + '\r\n';

        let mid = 0;

        for (const media of od.medias) {
            if (candidatesByMedia[mid] !== undefined) {
                frag += 'm=' + media + '\r\n'
                    + 'a=mid:' + mid + '\r\n';

                for (const candidate of candidatesByMedia[mid]) {
                    frag += 'a=' + candidate.candidate + '\r\n';
                }
            }
            mid++;
        }

        return frag;
    };

    const loadStream = () => {
        requestICEServers();
    };

    const onError = (err) => {
        if (restartTimeout === null) {
            setMessage(err + ', retrying in some seconds');

            if (pc !== null) {
                pc.close();
                pc = null;
            }

            restartTimeout = window.setTimeout(() => {
                restartTimeout = null;
                loadStream();
            }, retryPause);

            if (sessionUrl) {
                fetch(sessionUrl, {
                    method: 'DELETE',
                });
            }
            sessionUrl = '';

            queuedCandidates = [];
        }
    };

    const sendLocalCandidates = (candidates) => {
        fetch(sessionUrl + window.location.search, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/trickle-ice-sdpfrag',
                'If-Match': '*',
            },
            body: generateSdpFragment(offerData, candidates),
        })
            .then((res) => {
                switch (res.status) {
                    case 204:
                        break;
                    case 404:
                        throw new Error('stream not found');
                    default:
                        throw new Error(`bad status code ${res.status}`);
                }
            })
            .catch((err) => {
                onError(err.toString());
            });
    };

    const onLocalCandidate = (evt) => {
        if (restartTimeout !== null) {
            return;
        }

        if (evt.candidate !== null) {
            if (sessionUrl === '') {
                queuedCandidates.push(evt.candidate);
            } else {
                sendLocalCandidates([evt.candidate])
            }
        }
    };

    const onRemoteAnswer = (sdp) => {
        if (restartTimeout !== null) {
            return;
        }

        pc.setRemoteDescription(new RTCSessionDescription({
            type: 'answer',
            sdp,
        }));

        if (queuedCandidates.length !== 0) {
            sendLocalCandidates(queuedCandidates);
            queuedCandidates = [];
        }
    };

    const sendOffer = (offer) => {
        fetch(`${url}/` + 'whep', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/sdp',
            },
            body: offer.sdp,
        })
            .then((res) => {
                switch (res.status) {
                    case 201:
                        break;
                    case 404:
                        throw new Error('stream not found');
                    default:
                        throw new Error(`bad status code ${res.status}`);
                }
                sessionUrl = new URL(res.headers.get('location'), url).toString();
                return res.text();
            })
            .then((sdp) => onRemoteAnswer(sdp))
            .catch((err) => {
                onError(err.toString());
            });
    };

    const createOffer = () => {
        pc.createOffer()
            .then((offer) => {
                editOffer(offer);
                offerData = parseOffer(offer.sdp);
                pc.setLocalDescription(offer);
                sendOffer(offer);
            });
    };

    const onConnectionState = () => {
        if (restartTimeout !== null) {
            return;
        }

        if (pc.iceConnectionState === 'disconnected') {
            onError('peer connection disconnected');
        }
    };

    const onTrack = (evt) => {
        setMessage('');
        var logTimeVidoe = new Date().getTime()
        console.log('完成RTC連線', videoType, (logTimeVidoe - logTime) / 1000 + 's');
        if (videoType === 'vis') {
            video.srcObject = evt.streams[0];
            // state.rtcVIDEOLIST.vis = evt.streams[0];
            state.rtcVIDEOLIST.push(evt.streams[0]);
            // let chunks = []
            // var mediaRecorder = new MediaRecorder(evt.streams[0])
            // const onStartRecording = () => {
            // mediaRecorder.start(1000)   // 可使錄製影音串流
            // stopBtn.classList.remove('vdisplay')
            // startBtn.classList.add('vdisplay')
            // state.recoderTime = 0
            // }
            // const onStopRecording = () => {
            //     mediaRecorder.stop()    // 結束錄製影音串流
            //     var blob = new Blob(chunks, { 'type': 'video/webm; codecs=vp9' })
            //     // 把 blob 物件透過 URL.createObjectURL() 代入 src 內
            //     var outputVideoURL = URL.createObjectURL(blob)
            //     let downloadLink = document.createElement('a');
            //     downloadLink.href = outputVideoURL;
            //     downloadLink.download = 'recordedVideo.webm'; // 设置下载文件名
            //     downloadLink.innerText = '下載'
            //     document.body.appendChild(downloadLink);
            //     downloadLink.click();
            //     // 清理掉创建的下载链接元素
            //     document.body.removeChild(downloadLink);
            //     startBtn.classList.remove('vdisplay')
            //     stopBtn.classList.add('vdisplay')
            // }
            // startBtn.addEventListener('click', e => onStartRecording())
            // stopBtn.addEventListener('click', e => onStopRecording())
            // const mediaRecorderOnDataAvailable = (e) => {
            // state.recoderTime++
            // chunks.push(e.data)
            // }
            // mediaRecorder.addEventListener('dataavailable', mediaRecorderOnDataAvailable)
        } else if (videoType === 'ir') {
            // state.rtcVIDEOLIST.ir = evt.streams[0];
            state.rtcVIDEOLIST.push(evt.streams[0]);
        }
    };

    const requestICEServers = () => {
        fetch(`${url}/` + 'whep', {
            method: 'OPTIONS',
        })
            .then((res) => {
                pc = new RTCPeerConnection({
                    iceServers: linkToIceServers(res.headers.get('Link')),
                    // https://webrtc.org/getting-started/unified-plan-transition-guide
                    sdpSemantics: 'unified-plan',
                });
                state.rtcPeerConnectionItems.push(pc);
                const direction = 'sendrecv';
                pc.addTransceiver('video', { direction });
                pc.addTransceiver('audio', { direction });

                pc.onicecandidate = (evt) => onLocalCandidate(evt);
                pc.oniceconnectionstatechange = () => onConnectionState();
                pc.ontrack = (evt) => onTrack(evt);

                createOffer();
            })
            .catch((err) => {
                onError(err.toString());
            });
    };

    const parseBoolString = (str, defaultVal) => {
        str = (str || '');

        if (['1', 'yes', 'true'].includes(str.toLowerCase())) {
            return true;
        }
        if (['0', 'no', 'false'].includes(str.toLowerCase())) {
            return false;
        }
        return defaultVal;
    };
    const loadAttributesFromQuery = () => {
        const params = new URLSearchParams(window.location.search);
        // video.controls = parseBoolString(params.get('controls'), true);
        // video.muted = parseBoolString(params.get('muted'), true);
        // video.autoplay = parseBoolString(params.get('autoplay'), true);
        // video.playsInline = parseBoolString(params.get('playsinline'), true);
        defaultControls = video.controls;
    };

    const init = () => {
        loadAttributesFromQuery();
        loadStream();
    };
    init()
    // window.addEventListener('DOMContentLoaded', init);
}
const findFirstNullIndex = (arr) => {
    let len = arr.length
    for (let i = 0; i < len; i++) {
        if (arr[i].data === null) {
            return i; // 找到第一个 data = null 的索引，立即返回
        }
    }
    return null; // 如果没有找到，返回 null
}

const findFirstIDIndex = (arr, id) => {
    let len = arr.length
    for (let i = 0; i < len; i++) {
        if (arr[i].data !== null) {
            if (arr[i].data?.number === id) {
                return i
            }
        }
    }
    return null; // 如果没有找到，返回 null
}

// rtc
const runWebRTC = () => {
    peerConnection = new RTCPeerConnection();
    peerConnection.ondatachannel = (event) => {
        let receiveChannel = event.channel;
        state.webWorker.postMessage({
            type: 'rtc',
            parameter: {
                peerConnection: receiveChannel
            }
        }, [receiveChannel])
        // receiveChannel.onmessage = (e) => {
        //     console.log(e.data);
        //     // dataChannelDiv.textContent = e.data;
        // };
        // receiveChannel.onopen = (e) => {
        //     // dataChannelDivWebRTC.textContent = 'webRTC Data channel 成功';
        //     console.log('onopen', e)
        // };;
        // receiveChannel.onclose = (e) => {
        //     console.log('onclose', e)
        // };
    }
    peerConnection.onicecandidate = e => {
        const message = {
            type: 'candidate',
            candidate: null,
        };
        if (e.candidate) {
            message.candidate = e.candidate.candidate;
            message.sdpMid = e.candidate.sdpMid;
            message.sdpMLineIndex = e.candidate.sdpMLineIndex;
        }
        console.log(message);
        // dataChannelDivWebRTC.textContent = 'webRTC 發送SDP';
        signalingChannel.send(JSON.stringify(message));
    }

    signalingChannel.addEventListener('message', async event => {
        var message = JSON.parse(event.data)
        console.log("main ws", message);
        // if (message.offer) {
        if (message.type == 'offer') {
            // peerConnection.setRemoteDescription({ type: 'offer', sdp: message.offer.sdp });
            peerConnection.setRemoteDescription({ type: 'offer', sdp: message.sdp });
            const answer = await peerConnection.createAnswer();
            // console.log("xxxx", answer);
            // (2) 收到offer ; 並傳送answer to 接收端
            signalingChannel.send(JSON.stringify(answer));
            console.log("mainEnd", answer);
            await peerConnection.setLocalDescription(answer);
        } else if (message.candidate) {
            handleCandidate(message.candidate)
        }
    });
    peerConnection.ontrack = (e) => {
        // let remoteVideo = videoElement;
        // remoteVideo.srcObject = e.streams[0]
        console.log("ontrack", e);
    };
    var chkint = null
    chkint = setInterval(() => {
        if (peerConnection.iceConnectionState === 'connected') {
            console.log('RTC连接已建立！');

            clearInterval(chkint)
        } else {
            console.log(peerConnection.iceConnectionState);
        }
    }, 1000)
}
const runWebSocket = () => {
    // dataChannelDivWebSocket.textContent = '建立ws連線中';
    signalingChannel = new WebSocket('ws://192.168.0.128:12345')
    signalingChannel.onopen = (e) => {
        // dataChannelDivWebSocket.textContent = 'ws已連線';
        console.log('ws 連接');
        // this.createMedia()
        runWebRTC()
    }
    signalingChannel.onclose = (e) => {
        // dataChannelDivWebSocket.textContent = 'ws 中斷';
        console.log("ws 中斷");
    }
}
const handleCandidate = async (candidate) => {
    // 6
    if (!peerConnection) {
        console.error('no peerconnection');
        return;
    }
    if (!candidate.candidate) {
        // await this.peerConnection.addIceCandidate(null);
    } else {
        // console.log("candidate1", this.peerConnection);
        await peerConnection.addIceCandidate(candidate);
    }
}
onMounted(() => {
    // runWebSocket()
    // console.log('onMounted', window.performance);
    document.addEventListener('mousedown', (event) => {
        // event.preventDefault()
        if (event.button === 0 && map !== null) {
            map.dragging.disable()
        }

    });
    document.addEventListener('mouseup', () => {
        if (map !== null) {
            map.dragging.enable()
        }
    });
    state.webWorker = new Worker('/worker/roiTrackRTC.js');
    state.webWorker.addEventListener('message', (e) => {
        var res = e.data
        var type = res.type
        var parameter = res.parameter
        if (type === 'open') {
            console.log('開啟worker');
            state.webWorker.postMessage({
                type: 'start',
                parameter: {
                    wsURL: $webSocket02URL(),
                    camID
                }
            })
        } else if (type === 'addMapSpot') {
            addMapSpot(parameter)
        } else if (type === 'changeMapSpot') {
            changeMapSpot(parameter, 'all')
        } else if (type === 'changeMapSpotDATA') {
            changeMapSpot(parameter, 'temp')
        } else if (type === 'removeMapSpot') {
            removeMapSpot(parameter)
        } else if (type === 'addMapLine') {
            addMapLine(parameter)
        } else if (type === 'changeMapLine') {
            changeMapLine(parameter, 'all')
        } else if (type === 'changeMapLineDATA') {
            changeMapLine(parameter, 'temp')
        } else if (type === 'removeMapLine') {
            changeMapLine(parameter, 'delete')
        } else if (type === 'addMapScope') {
            addMapScope(parameter)
        } else if (type === 'changeMapScope') {
            changeMapScope(parameter, 'all')
        } else if (type === 'changeMapScopeDATA') {
            changeMapScope(parameter, 'temp')
        } else if (type === 'removeMapScope') {
            changeMapScope(parameter, 'delete')
        } else if (type === 'addMapBlob') {
            addMapBlob(parameter)
        } else if (type === 'changeMapBlob') {
            changeMapBlob(parameter, 'all')
        } else if (type === 'changeMapBlobDATA') {
            changeMapBlob(parameter, 'temp')
        } else if (type === 'removeMapBlob') {
            changeMapBlob(parameter, 'delete')
            // console.log('main delete');
        }
        res = null
        type = null
        parameter = null
    })
    if (state.templatePointInt !== null) {
        clearInterval(state.templatePointInt)
        state.templatePointInt = null
    }
    state.templatePointInt = setInterval(() => {
        try {
            var arr = []
            state.tempSpotObject.forEach((item) => {
                if (item.data !== null) {
                    arr.push(item)
                }
            })
            state.tempLineObject.forEach((item) => {
                if (item.data !== null) {
                    arr.push(item)
                }
            })
            state.tempScopeObject.forEach((item) => {
                if (item.data !== null) {
                    arr.push(item)
                }
            })
            arr.forEach((item) => {
                var temperatureBar = document.getElementById(`temperature-bar-${item.tempPointID}`)
                var temperatureBarBubbleNumber = document.getElementById(`temperature-bar-bubble-number-${item.tempPointID}`)
                if (temperatureBar !== undefined) {
                    var max = item.data?.temperature_point?.temperature_ranger.max
                    var min = item.data?.temperature_point?.temperature_ranger.min
                    var randomInt = 0;
                    if (item.data?.temperature) {
                        randomInt = item.data?.temperature
                    } else if (item.data?.temperature_max) {
                        randomInt = item.data?.temperature_max
                    }
                    var num = ((randomInt / (max - min)) * 100) + 100
                    temperatureBar.style.transform = `translateX(-${num - 50}px)`; // 更改translateX的值
                    temperatureBarBubbleNumber.innerHTML = `${randomInt}`
                    temperatureBar.style.background = `linear-gradient(to right,
    #B6B6B6 0px, #B6B6B6 ${item.data.temperature_point.median.start + 100}px,
    #FFE55B ${item.data.temperature_point.median.start + 101}px, #FFE55B ${item.data.temperature_point.median.end + 100}px,
    #FF5A13  ${item.data.temperature_point.median.end + 100}px, #FF5A13 300px
)`;
                    max = null
                    min = null
                    randomInt = null
                    num = null
                }
                temperatureBar = null
                temperatureBarBubbleNumber = null
            })
            arr = null
        } catch (error) {
            console.log(error);
        }
        // var testdiv = document.querySelector('.temperature-bar')
        // var terstbum = document.querySelector('.temperature-bar-bubble-number')
        // if (testdiv !== undefined) {
        //     var max = 1000
        //     var min = 0
        //     var randomInt = getRandomInteger(min, max);
        //     var num = ((randomInt / (max - min)) * 100) + 100
        //     testdiv.style.transform = `translateX(-${num - 50}px)`; // 更改translateX的值
        //     terstbum.innerHTML = `${randomInt}`
        // }
        // 測試邊界
        // console.log(state.pixiscope);

    }, 1000)
})

onBeforeUnmount(() => {
    console.log('onBeforeUnmount');
    if (state.webWorker !== null) {
        state.webWorker.terminate();
        state.webWorker = null
    }
})
defineExpose({
    requestBtnGroupEvent,
    // superResolution,
    invaliMapSzie
})
</script>
<style>
.div-point {
    background-color: #fff;
    width: 22px;
    height: 22px;
    border-radius: 24px;
    border: 1px #000 solid;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    transform: translate(-50%, -50%);
    position: absolute;
    top: 50%;
    left: 50%;
}
</style>