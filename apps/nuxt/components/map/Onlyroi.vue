<template>
    <div class="item-card-content pa-0" id="map-top-b" style="height: 100%; width: 100%;z-index: 0;" ref="mapcanvas">
        <!-- LMap 使用leaflatjs vue版本 crs = 改變座標模式 options = 基本設定  -->
        <!-- @ready 等待地圖載入後直接初始化 請直接看 leafletJsInit() 方法 -->
        <LMap ref="LMmap" :min-zoom="state.minZoom" :crs="state.crs" style="height: 100%; width: 100%"
            :options="state.mapOptions">
        </LMap>
        <div id="message" style="display: none;">
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue'
const { $getIpaddress } = useNuxtApp()
const LMmap = ref(null)
const mapcanvas = ref(null)
const runIndex = reactive({
    index: 0
})
const { $webSocket02URL } = useNuxtApp()
const camID = useAttrs().camID
const camType = useAttrs().camType
const aspectRatio = useAttrs().aspectRatio
var map = null
const state = reactive({
    timeRunwk: null,
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
    imgHeight: -360,
    // imgHeight: -480,
    dragObjectStatus: true,
    // map
    mapOptions: {
        minZoom: -3,
        maxZoom: 20,
        crs: L.CRS.Simple,
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
    tempBlobObject: [],
    videoTag: null
})
// 初始化地圖
const leafletJsInit = () => {
    setTimeout(() => {
        leafletJsInit123()
    }, 1000)
}
const leafletJsInit123 = () => {
    // 宣告地圖變數
     map = L.map(LMmap.value, state.mapOptions).on('load', () => {
            console.log('✅ Leaflet 地圖已準備好！')
        });
    let mapWidth = mapcanvas.value.getBoundingClientRect().width
    let mapHeight = mapcanvas.value.getBoundingClientRect().height
    state.imgHeight = mapHeight
    state.imgWidth = mapWidth
    // map = LMmap.value.leafletObject
    // console.log(mapWidth, mapHeight);
    // state.imgHeight = -(state.imgWidth / aspectRatio)
    // console.log(state.imgHeight, aspectRatio);
    map.setView([state.imgHeight / 2, state.imgWidth / 2], 1);
    map._layersMaxZoom = 20;
    // 預設背景圖片 - 這邊會先加載一個灰底圖片
    const imgPane = map.createPane('blob-pane');
    imgPane.style.zIndex = 0; // 設定 z-index
    var imageUrl = '/images/EMPTYv1-fill.png', // /mock/ir13807.jpg
        imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    var imageOverlay = L.imageOverlay(imageUrl, imageBounds, { pane: imgPane });
    imageOverlay.addTo(map);
    map.fitBounds(imageBounds)
    // 影片物件建立
    const videoPane = map.createPane('blob-pane');
    videoPane.style.zIndex = 1; // 設定 z-index
    const video = document.createElement('video');
    video.autoplay = true;
    video.controls = false;
    video.muted = true;
    video.loop = true;
    video.id = `video${camType}${camID}-${state.randomID}`;
    video.className = 'video-player1';
    var videoBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    var videoTag = L.videoOverlay(video, videoBounds, { pane: videoPane }).addTo(map);
    videoTag.getElement().onload = function () {
        // rotateImageOverlay(imageOverlay, 45); // 改變影片物件角度
    };
    state.videoTag = videoTag
    // runRTC = 執行 webRTC 程式 runRTC(id = video物件id , url = rtc server 連接網址 , type = 影片類型)
    const currentPort = window.location.port;
    runRTC(`video${camType}${camID}-${state.randomID}`, `http://${$getIpaddress()}:${currentPort}/video/realtime/${camType}${camID}`, 'vis') // [element id,video url]

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
        for (let i = 0; i < 60; i++) {
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
            };
        }
    }
    const createTempLine = () => {
        for (let i = 0; i < 60; i++) {
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
            // addDragHandlers(pointB, lines, pointA, 'B', [numberPoint, tempNumPoint]);
            // addDragHandlers(pointA, lines, pointB, 'A', [numberPoint, tempNumPoint]);
        }
    }
    const createTempScope = () => {
        for (let i = 0; i < 60; i++) {
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
            // rectangular.on('mouseover', (e) => {
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
            // rectangular.on('mouseout', (e) => {
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
    const createTempBlob = () => {
        var color = ['255 255 255', '255 232 27', '255 0 0', '255 107 0']
        for (let i = 0; i < 100; i++) {
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
// 取得邊界
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

// roi 物件控制 add = 新增ROI change = 修改或刪除
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
        if (type === 'all' || type === 'delect') {
            // console.log('addMapSpot', e, currentEvent);
            let numberPoint = currentEvent.object.numberPoint
            let tempNumPoint = currentEvent.object.tempNumPoint
            let pointA = currentEvent.object.pointA
            let pointB = currentEvent.object.pointB
            let lines = currentEvent.object.lines
            let myIcon1 = L.divIcon({ html: type === 'delect' ? '' : e.html.myIcon1 });
            let myIconHtml = L.divIcon({ html: type === 'delect' ? '' : e.html.myIconHtml });
            numberPoint.setLatLng(type === 'delect' ? state.initLocation : [e.location[0], e.location[1]])
            tempNumPoint.setLatLng(type === 'delect' ? state.initLocation : [e.location[0], e.location[1]])
            pointA.setLatLng(type === 'delect' ? state.initLocation : [e.location[0], e.location[1]])
            pointB.setLatLng(type === 'delect' ? state.initLocation : [e.location[2], e.location[3]])
            lines[0].setLatLngs(type === 'delect' ? [state.initLocation, state.initLocation] : [[e.location[0], e.location[1]], [e.location[2], e.location[3]]])
            lines[1].setLatLngs(type === 'delect' ? [state.initLocation, state.initLocation] : [[e.location[0], e.location[1]], [e.location[2], e.location[3]]])
            numberPoint.setIcon(myIcon1)
            numberPoint.setLatLng(type === 'delect' ? state.initLocation : [e.location[0], e.location[1]])
            tempNumPoint.setLatLng(type === 'delect' ? state.initLocation : [e.location[0], e.location[1]])
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
        if (type === 'all' || type === 'delect') {
            let tempNumPoint = currentEvent.object.tempNumPoint
            let marker = currentEvent.object.marker
            let rectangleBorder1 = currentEvent.object.rectangleBorder1
            let rectangleBorder2 = currentEvent.object.rectangleBorder2
            let rectangular = currentEvent.object.rectangular
            let myIcon1 = L.divIcon({ html: type === 'delect' ? '' : e.html.myIcon1 });
            let myIconHtml = L.divIcon({ html: type === 'delect' ? '' : e.html.myIconHtml });
            marker.setLatLng(type === 'delect' ? state.initLocation : [e.location[0], e.location[1]])
            marker.setIcon(myIcon1)
            tempNumPoint.setLatLng(type === 'delect' ? state.initLocation : [e.location[0], e.location[1]])
            tempNumPoint.setIcon(myIconHtml)
            const bounds = [
                [type === 'delect' ? state.initLocation[0] : e.location[0], type === 'delect' ? state.initLocation[1] : e.location[1]], // 左上角
                [type === 'delect' ? state.initLocation[0] : e.location[0], type === 'delect' ? state.initLocation[1] : e.location[3]], // 右上角
                [type === 'delect' ? state.initLocation[0] : e.location[2], type === 'delect' ? state.initLocation[1] : e.location[3]], // 右下角
                [type === 'delect' ? state.initLocation[0] : e.location[2], type === 'delect' ? state.initLocation[1] : e.location[1]]  // 左下角
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
    let index = findFirstNullIndex(state.tempBlobObject)
    if (index !== null) {
        let currentEvent = state.tempBlobObject[index]
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
        // console.log('addMapblob main', spline);
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
        currentEvent.data = type === 'delect' ? null : e.data;
        currentEvent.tempPointID = type === 'delect' ? null : e.tempPointID;
        if (type === 'all' || type === 'delect') {
            let tempLocation = [-10000, 10000]
            let blob = currentEvent.object.blob
            let tempNumPoint = currentEvent.object.tempNumPoint
            let marker = currentEvent.object.marker
            let myIcon1 = L.divIcon({ html: e.html.myIcon1 });
            let myIconHtml = L.divIcon({ html: e.html.myIconHtml });
            marker.setLatLng(type === 'delect' ? tempLocation : [-e.markerLocation.y, e.markerLocation.x])
            marker.setIcon(myIcon1)
            tempNumPoint.setLatLng(type === 'delect' ? tempLocation : [-e.markerLocation.y, e.markerLocation.x])
            tempNumPoint.setIcon(myIconHtml)
            var spline = Array.from(e.location)
            // console.log('addMapblob main', e);
            blob.setLatLngs(type === 'delect' ? [tempLocation, tempLocation, tempLocation] : [spline])
            blob = null
            tempNumPoint = null
            marker = null
            myIcon1 = null
            myIconHtml = null
            spline = null
            tempLocation = null
        }
        currentEvent = null
    }
    index = null
}
// 畫面置中
const invaliMapSzie = (aspectRatio = 1.725) => {
    if (map !== null) {
        let mapWidth = mapcanvas.value.getBoundingClientRect().width
        let mapHeight = mapcanvas.value.getBoundingClientRect().height
        state.imgHeight = mapHeight
        state.imgWidth = mapWidth
        // state.imgHeight = (state.imgWidth * (1 - aspectRatio))
        state.videoTag.setBounds(imageBounds)
        var imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
        map.invalidateSize()
        map.fitBounds(imageBounds)
        imageBounds = null
        // var div = document.querySelector('.' + state.className)
        // console.log('div', div);
        // div.classList.add('hidden')
    }
}
// webRTC 連接
const runRTC = (id, url, videoType) => {
    var logTime = new Date().getTime()
    // console.log('建立RTC連線', videoType, logTime, url);
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
        // console.log('完成RTC連線', videoType, (logTimeVidoe - logTime) / 1000 + 's');
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
// ROI 處理
const findFirstNullIndex = (arr) => {
    let len = arr.length
    for (let i = 0; i < len; i++) {
        if (arr[i].data === null) {
            return i; // 找到第一个 data = null 的索引，立即返回
        }
    }
    return null; // 如果没有找到，返回 null
}
// ROI 處理
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
onMounted(() => {
    leafletJsInit()
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
    // 運行webworker
    const runwk = () => {
        if (state.timeRunwk !== null) {
            clearTimeout(state.timeRunwk)
            state.timeRunwk = null
        }
        state.webWorker = new Worker('/worker/roiTrack-onlyroi.js');
        state.webWorker.addEventListener('message', (e) => {
            let res = e.data
            let type = res.type
            let parameter = res.parameter
            if (type === 'open') {
                // console.log('開啟worker');
                state.webWorker.postMessage({
                    type: 'start',
                    parameter: {
                        wsURL: $webSocket02URL(),
                        camID
                    }
                })
                const sendMap = () => {
                    if (map !== null) {
                        state.webWorker.postMessage({
                            type: 'canvasSize',
                            parameter: {
                                imgWidth: state.imgWidth,
                                imgHeight: state.imgHeight
                            }
                        })
                    } else {
                        setTimeout(() => {
                            sendMap()
                        }, 100)
                    }
                }
                sendMap()
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
                changeMapLine(parameter, 'delect')
            } else if (type === 'addMapScope') {
                addMapScope(parameter)
            } else if (type === 'changeMapScope') {
                changeMapScope(parameter, 'all')
            } else if (type === 'changeMapScopeDATA') {
                changeMapScope(parameter, 'temp')
            } else if (type === 'removeMapScope') {
                changeMapScope(parameter, 'delect')
            } else if (type === 'addMapBlob') {
                addMapBlob(parameter)
            } else if (type === 'changeMapBlob') {
                changeMapBlob(parameter, 'all')
            } else if (type === 'changeMapBlobDATA') {
                changeMapBlob(parameter, 'temp')
            } else if (type === 'removeMapBlob') {
                changeMapBlob(parameter, 'delect')
            } else if (type === 'close') {
                console.log('close');
                state.webWorker.terminate();
                state.webWorker = null
                setTimeout(() => {
                    runwk()
                }, 1)
            }
            res = null
            type = null
            parameter = null
        })
    }
    runwk()

    if (state.templatePointInt !== null) {
        clearInterval(state.templatePointInt)
        state.templatePointInt = null
    }
    const runChangeObject = () => {
        state.templatePointInt = setInterval(() => {
            try {
                let arr = []
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
                state.tempBlobObject.forEach((item) => {
                    arr.push(item)
                })
                arr.forEach((item) => {
                    if (item.tempPointID !== null) {
                        let bumMain = document.getElementById(`bum-main-${item.tempPointID}`)
                        let temperatureBarBubbleNumber = document.getElementById(`temperature-bar-bubble-number-${item.tempPointID}`)
                        if (bumMain !== undefined) {
                            let alarmList = ['P-ADFF00', 'P-FFDD28', 'P-FF0909', 'P-FF7223']
                            let alarmIndex = item.data?.temperature_max >= item.data?.threshold && item.data?.alarm_status === 1 ? 2 : 0
                            bumMain.classList = `alarm-point-1 ${alarmList[alarmIndex]}`
                            let randomInt = 0;
                            if (item.data?.temperature) {
                                randomInt = item.data?.temperature
                            } else if (item.data?.temperature_max) {
                                randomInt = item.data?.temperature_max
                            }
                            if (true) {
                                temperatureBarBubbleNumber.innerHTML = `(${randomInt})`
                            } else {
                                temperatureBarBubbleNumber.innerHTML = ``
                            }
                            alarmList = null
                            alarmIndex = null
                            randomInt = null
                        }
                        bumMain = null
                        temperatureBarBubbleNumber = null
                    }
                })
                arr = null
            } catch (error) {
                console.log(error);
            }
        }, 1000)
    }
    runChangeObject()
})

onBeforeUnmount(() => {
    console.log('onBeforeUnmount');
    // 安全關閉webworker
    if (state.webWorker !== null) {
        state.webWorker.terminate();
        state.webWorker = null
    }
})
defineExpose({
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

.temperature-bar-main {
    /* position: fixed;
    top: 50%; */
    /* left: 50%; */
    /* z-index: 9999; */
    /* transform: translate(-2px, -23px); */
    transform: translate(23px, -26px);
}

.temperature-bar-canvas {
    position: relative;
    width: 100px;
    height: 10px;
    border: 1px solid black;
    overflow: hidden;
}

.temperature-bar {
    width: 300px;
    height: 10px;
    position: relative;
    /* background: blanchedalmond; */
    transition: all .1s;
    transform: translateX(-100px);
    background: linear-gradient(to right,
            #B6B6B6 0px, #B6B6B6 120px,
            /* 0~200px 灰 */
            #FFE55B 121px, #FFE55B 160px,
            /* 201~280px 黃 */
            #FF5A13 160px, #FF5A13 300px
            /* 281~400px 紅 */
        );
}

.temperature-bar::before {
    content: '';
    position: absolute;
    height: 40%;
    width: 100%;
    background: repeating-linear-gradient(to right,
            black,
            black 1px,
            rgba(255, 255, 255, 0) 1px,
            rgba(255, 255, 255, 0) 10px);
}

.temperature-bar::after {
    content: '';
    position: absolute;
    height: 60%;
    width: 100%;
    background: repeating-linear-gradient(to right,
            black,
            black 1px,
            rgba(255, 255, 255, 0) 1px,
            rgba(255, 255, 255, 0) 50px);
}

.temperature-bar-bubble {
    position: absolute;
    top: -38px;
    left: 40px;
    padding: 10px;
    background-color: #DBE2E5;
    border-radius: 4px;
    height: 27px;
    width: 30px;
    /* border: 1px solid #000;
    /* border: 1px solid #000; */
}

.temperature-bar-bubble::after {
    content: '';
    position: absolute;
    bottom: -14px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 7px;
    border-style: solid;
    border-color: #DBE2E5 transparent transparent transparent;
    /* border: 1px solid #000; */
}

.bum-main {
    position: relative;
}

.temperature-bar-bubble-number {
    /* position: absolute;
    left: 50%;
    top: 56%;
    transform: translate(-50%, -50%); */
    color: #fff;
    position: absolute;
    right: 0;
    top: 56%;
    transform: translate(90%, -50%);
    font-size: 17px;
}

.alarm-point-1 {
    width: 10px;
    height: 10px;
    border-radius: 10px;
    transform: translate(-16px, -24px)
}

.P-ADFF00 {
    background-color: #ADFF00;
}

.P-FFDD28 {
    background-color: #FFDD28;
}

.P-FF0909 {
    background-color: #FF0909;
}

.P-FF7223 {
    background-color: #FF7223;
}

.video-player1 {
    width: 100%;
    height: 100%;
    object-fit: fill;
    /* 強制拉伸填滿容器，會變形 */
}
</style>