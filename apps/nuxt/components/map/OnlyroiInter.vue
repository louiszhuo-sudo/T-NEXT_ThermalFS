<template>
    <div class="item-card-content pa-0" id="map-top-b" style="height: 100%; width: 100%;z-index: 0;" ref="mapcanvas">
        <!-- LMap 使用leaflatjs vue版本 crs = 改變座標模式 options = 基本設定  -->
        <!-- @ready 等待地圖載入後直接初始化 請直接看 leafletJsInit() 方法 -->
        <LMap ref="LMmap" :min-zoom="state.minZoom" :crs="state.crs" style="height: 100%; width: 100%"
            :options="state.mapOptions" @ready="leafletJsInit()">
        </LMap>
        <div id="message" style="display: none;">
        </div>
    </div>
</template>
<script setup>
import { low } from '@/utils/leaflat/utils';
import { ref } from 'vue'
import L from 'leaflet'
const { $getIpaddress } = useNuxtApp()
const { $webSocketconnect03 } = useNuxtApp()
const LMmap = ref(null)
const mapcanvas = ref(null)
const runIndex = reactive({
    index: 0
})
const { $webSocket02URL } = useNuxtApp()
const props = useAttrs().formtData
const camID = useAttrs().camID
const camType = useAttrs().camType
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
    imgWidth: 640 / 3,
    imgHeight: -480 / 3,
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
        maxBoundsViscosity: 1.0 // 設定粘滯度，1.0 表示無法超出
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
// 初始化地圖
const leafletJsInit = () => {
    // 宣告地圖變數
    map = LMmap.value.leafletObject
    map.setView([state.imgHeight / 2, state.imgWidth / 2], 1);
    map._layersMaxZoom = 20;
    // 預設背景圖片 - 這邊會先加載一個灰底圖片
    const imgPane = map.createPane('blob-pane');
    imgPane.style.zIndex = 0; // 設定 z-index
    var imageUrl = '/images/EMPTYv1-fill.png', // /mock/ir13807.jpg
        imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    var imageOverlay = L.imageOverlay(imageUrl, imageBounds, { pane: imgPane });
    imageOverlay.addTo(map);
    const minZoomX = Math.log2(state.imgWidth / mapcanvas.value.getBoundingClientRect().width);
    const minZoomY = Math.log2(Math.abs(state.imgHeight) / mapcanvas.value.getBoundingClientRect().height);
    const minZoom = Math.max(minZoomX, minZoomY); // 避免圖片變形
    map.setMinZoom(Math.abs(minZoom))
    // map.setMaxZoom(6)
    map.setMaxBounds(imageBounds)
    // 影片物件建立
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
        // rotateImageOverlay(imageOverlay, 45); // 改變影片物件角度
    };
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
                draggableElement.on('dragstart', (e) => {
                    state.dragObjectStatus = false
                })
                draggableElement.on('drag', (e) => {
                    // state.pushSpot({ location: e.target.getLatLng(), id: roidata.number }) // 註解可減少耗能
                    let latLng = e.target.getLatLng()
                    if (latLng.lat > 0) {
                        latLng.lat = 0
                    } else if (latLng.lat < state.imgHeight) {
                        latLng.lat = state.imgHeight
                    }
                    if (latLng.lng < 0) {
                        latLng.lng = 0
                    } else if (latLng.lng > state.imgWidth) {
                        latLng.lng = state.imgWidth
                    }
                    e.target.setLatLng(latLng)

                    targetElement.setLatLng(e.target.getLatLng())
                    tempNumPoint.setLatLng(e.target.getLatLng())
                });
                draggableElement.on('dragend', (e) => {
                    pushSpot({ location: e.target.getLatLng() })
                    state.dragObjectStatus = true
                });
            };
            // if (props.mainMode !== 'review') {
            addDragHandlers(point, number);
            addDragHandlers(number, point);
        }
    }
    const pushSpot = (data) => {
        var width = state.imgWidth
        var height = state.imgHeight
        var newPosition = {
            x: data.location.lng / width,
            y: data.location.lat / height
        }
        var stateSpotData = {
            feature: 'roi',
            method: 'set_roiNodes',
            session: Math.random().toString(36).substr(2),
            content: {
                field_id: 1,
                camera_id: camID,
                cursingPoint_id: props.cursingPointValue,
                image_type: 'ir',
                roi_id: parseInt(data.id),
                roi_nodeManual: [
                    parseFloat(newPosition.x),
                    parseFloat(newPosition.y)
                ]
            }
        }
        state.ws3.send(JSON.stringify(stateSpotData))
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
            const addDragHandlers = (draggableElement, targetLinesElement, notmovedElement, type, numberPoint, tempNumPoint) => {
                draggableElement.on('dragstart', (e) => {
                    state.dragObjectStatus = false
                })
                draggableElement.on('drag', (e) => {
                    var tempnewlatlngs = type === 'B' ? [notmovedElement.getLatLng(), e.target.getLatLng()] : [e.target.getLatLng(), notmovedElement.getLatLng()]
                    let latlngs = []
                    tempnewlatlngs.forEach((item) => {
                        latlngs.push(boundsLatlng(item))
                    })
                    targetLinesElement.forEach((item) => {
                        item.setLatLngs(latlngs)
                    })
                    if (type === 'B') {
                        // console.log(numberPoint);
                        numberPoint.setLatLng(latlngs[1])
                        tempNumPoint.setLatLng(latlngs[1])
                    }
                    e.target.setLatLng(boundsLatlng(e.target.getLatLng()))
                    function boundsLatlng(item) {
                        let latlng = item
                        if (latlng.lat > 0) {
                            latlng.lat = 0
                        } else if (latlng.lat < state.imgHeight) {
                            latlng.lat = state.imgHeight
                        }
                        if (latlng.lng < 0) {
                            latlng.lng = 0
                        } else if (latlng.lng > state.imgWidth) {
                            latlng.lng = state.imgWidth
                        }
                        return latlng
                    }
                    // pushline({ location: latlngs, id: data.number })
                });
                draggableElement.on('dragend', (e) => {
                    var latlngs = type === 'B' ? [notmovedElement.getLatLng(), e.target.getLatLng()] : [e.target.getLatLng(), notmovedElement.getLatLng()]
                    pushline({ location: latlngs })
                    state.dragObjectStatus = true
                });
            };
            addDragHandlers(pointB, lines, pointA, 'B', numberPoint, tempNumPoint);
            addDragHandlers(pointA, lines, pointB, 'A', numberPoint, tempNumPoint);
        }
    }
    const pushline = (e) => {
        var width = state.imgWidth
        var height = state.imgHeight
        var findindex = state.pixiline.findIndex((item) => parseInt(item.data.number) === parseInt(e.id))
        // var data = state.pixiline[findindex].data
        var LineData = {
            feature: 'roi',
            method: 'set_roiNodes',
            session: Math.random().toString(36).substr(2),
            content: {
                field_id: 1,
                image_type: 'ir',
                camera_id: camID,
                cursingPoint_id: props.cursingPointValue,
                // roi_id: data.number,
                roi_nodeManual: [
                    e.location[0].lng / width,
                    e.location[0].lat / height,
                    e.location[1].lng / width,
                    e.location[1].lat / height
                ]
            },
        }
        state.ws3.send(JSON.stringify(LineData))
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

            var tmepBounds = []
            var tempmarker = {}
            var moveStatus = false
            const updatePoint = (temp, item) => {
                var newLocation = [
                    [temp[0][1].lat, temp[0][1].lng],
                    [temp[0][3].lat, temp[0][3].lng]
                ]
                updateRevisionObjectNew(newLocation, item)
            }
            const runResize = (e) => {
                var resizePoint = createRevisionObjectNew(e)
                var anchors = ['top-left', 'top', 'top-right', 'left', 'right', 'bottom-left', 'bottom', 'bottom-right']
                var temp1 = JSON.stringify(tmepBounds)
                var temp = JSON.parse(temp1)
                anchors.forEach((item, index) => {
                    if (item === 'top-left') {
                        resizePoint[index].on('drag', (e) => {
                            // let platlng = e.target.getLatLng()
                            let latLng = e.target.getLatLng()
                            if (latLng.lat > 0) {
                                latLng.lat = 0
                            } else if (latLng.lat < state.imgHeight) {
                                latLng.lat = state.imgHeight
                            }
                            if (latLng.lng < 0) {
                                latLng.lng = 0
                            } else if (latLng.lng > state.imgWidth) {
                                latLng.lng = state.imgWidth
                            }
                            temp[0][1] = latLng
                            temp[0][2].lat = latLng.lat
                            temp[0][0].lng = latLng.lng
                            marker.setLatLng(latLng)
                            tempNumPoint.setLatLng(latLng)
                            // checkChangeBox.setLatLng(e.target.getLatLng())
                            rectangleBorder1.setLatLngs(temp)
                            rectangleBorder2.setLatLngs(temp)
                            rectangular.setLatLngs(temp)
                            updatePoint(temp, item)
                            if (state.checkChangeBox !== null) {
                                // checkChangeBox.off()
                                state.checkChangeBox.remove()
                                state.checkChangeBox = null
                            }
                        })
                        // outputNewLoction(getBounds)
                    } else if (item === 'top') {
                        var sx = resizePoint[index].getLatLng()
                        resizePoint[index].on('dragstart', (e) => {
                            e.target.setLatLng([e.target.getLatLng().lat, sx.lng])
                        })
                        resizePoint[index].on('drag', (e) => {
                            let lat = e.target.getLatLng().lat
                            if (lat > 0) {
                                lat = 0
                            } else if (lat < state.imgHeight) {
                                lat = state.imgHeight
                            }
                            e.target.setLatLng([lat, sx.lng])
                            temp[0][1].lat = lat
                            temp[0][2].lat = lat
                            marker.setLatLng(temp[0][1])
                            tempNumPoint.setLatLng(temp[0][1])
                            // checkChangeBox.setLatLng(temp[0][1])
                            rectangleBorder1.setLatLngs(temp)
                            rectangleBorder2.setLatLngs(temp)
                            rectangular.setLatLngs(temp)
                            updatePoint(temp, item)
                            if (state.checkChangeBox !== null) {
                                // checkChangeBox.off()
                                state.checkChangeBox.remove()
                                state.checkChangeBox = null
                            }
                        })
                    } else if (item === 'top-right') {
                        resizePoint[index].on('drag', (e) => {
                            let latLng = e.target.getLatLng()
                            if (latLng.lat > 0) {
                                latLng.lat = 0
                            } else if (latLng.lat < state.imgHeight) {
                                latLng.lat = state.imgHeight
                            }
                            if (latLng.lng < 0) {
                                latLng.lng = 0
                            } else if (latLng.lng > state.imgWidth) {
                                latLng.lng = state.imgWidth
                            }
                            temp[0][2] = latLng
                            temp[0][1].lat = latLng.lat
                            temp[0][3].lng = latLng.lng
                            marker.setLatLng(temp[0][1])
                            tempNumPoint.setLatLng(temp[0][1])
                            // checkChangeBox.setLatLng(temp[0][1])
                            rectangleBorder1.setLatLngs(temp)
                            rectangleBorder2.setLatLngs(temp)
                            rectangular.setLatLngs(temp)
                            updatePoint(temp, item)
                            if (state.checkChangeBox !== null) {
                                // checkChangeBox.off()
                                state.checkChangeBox.remove()
                                state.checkChangeBox = null
                            }
                        })
                    } else if (item === 'left') {
                        var sx = resizePoint[index].getLatLng()
                        resizePoint[index].on('dragstart', (e) => {
                            e.target.setLatLng([sx.lat, e.target.getLatLng().lng])
                        })
                        resizePoint[index].on('drag', (e) => {
                            let lng = e.target.getLatLng().lng
                            if (lng < 0) {
                                lng = 0
                            } else if (lng > state.imgWidth) {
                                lng = state.imgWidth
                            }
                            e.target.setLatLng([sx.lat, lng])
                            temp[0][0].lng = lng
                            temp[0][1].lng = lng
                            marker.setLatLng(temp[0][1])
                            tempNumPoint.setLatLng(temp[0][1])
                            // checkChangeBox.setLatLng(temp[0][1])
                            rectangleBorder1.setLatLngs(temp)
                            rectangleBorder2.setLatLngs(temp)
                            rectangular.setLatLngs(temp)
                            updatePoint(temp, item)
                            if (state.checkChangeBox !== null) {
                                // checkChangeBox.off()
                                state.checkChangeBox.remove()
                                state.checkChangeBox = null
                            }
                        })
                    } else if (item === 'right') {
                        var sx = resizePoint[index].getLatLng()
                        resizePoint[index].on('dragstart', (e) => {
                            e.target.setLatLng([sx.lat, e.target.getLatLng().lng])
                        })
                        resizePoint[index].on('drag', (e) => {
                            let lng = e.target.getLatLng().lng
                            if (lng < 0) {
                                lng = 0
                            } else if (lng > state.imgWidth) {
                                lng = state.imgWidth
                            }
                            e.target.setLatLng([sx.lat, lng])
                            temp[0][2].lng = lng
                            temp[0][3].lng = lng
                            rectangleBorder1.setLatLngs(temp)
                            rectangleBorder2.setLatLngs(temp)
                            rectangular.setLatLngs(temp)
                            updatePoint(temp, item)
                            if (state.checkChangeBox !== null) {
                                // checkChangeBox.off()
                                state.checkChangeBox.remove()
                                state.checkChangeBox = null
                            }
                        })
                    } else if (item === 'bottom-left') {
                        resizePoint[index].on('drag', (e) => {
                            let latLng = e.target.getLatLng()
                            if (latLng.lat > 0) {
                                latLng.lat = 0
                            } else if (latLng.lat < state.imgHeight) {
                                latLng.lat = state.imgHeight
                            }
                            if (latLng.lng < 0) {
                                latLng.lng = 0
                            } else if (latLng.lng > state.imgWidth) {
                                latLng.lng = state.imgWidth
                            }
                            temp[0][0] = latLng
                            temp[0][3].lat = latLng.lat
                            temp[0][1].lng = latLng.lng
                            marker.setLatLng(temp[0][1])
                            tempNumPoint.setLatLng(temp[0][1])
                            // checkChangeBox.setLatLng(temp[0][1])
                            rectangleBorder1.setLatLngs(temp)
                            rectangleBorder2.setLatLngs(temp)
                            rectangular.setLatLngs(temp)
                            updatePoint(temp, item)
                            if (state.checkChangeBox !== null) {
                                // checkChangeBox.off()
                                state.checkChangeBox.remove()
                                state.checkChangeBox = null
                            }
                        })
                        // outputNewLoction(getBounds)
                    } else if (item === 'bottom') {
                        var sx = resizePoint[index].getLatLng()
                        resizePoint[index].on('dragstart', (e) => {
                            e.target.setLatLng([e.target.getLatLng().lat, sx.lng])
                        })
                        resizePoint[index].on('drag', (e) => {
                            let lat = e.target.getLatLng().lat
                            if (lat > 0) {
                                lat = 0
                            } else if (lat < state.imgHeight) {
                                lat = state.imgHeight
                            }
                            e.target.setLatLng([lat, sx.lng])
                            temp[0][0].lat = lat
                            temp[0][3].lat = lat
                            rectangleBorder1.setLatLngs(temp)
                            rectangleBorder2.setLatLngs(temp)
                            rectangular.setLatLngs(temp)
                            updatePoint(temp, item)
                            if (state.checkChangeBox !== null) {
                                // checkChangeBox.off()
                                state.checkChangeBox.remove()
                                state.checkChangeBox = null
                            }
                        })
                    } else if (item === 'bottom-right') {
                        resizePoint[index].on('drag', (e) => {
                            let latLng = e.target.getLatLng()
                            if (latLng.lat > 0) {
                                latLng.lat = 0
                            } else if (latLng.lat < state.imgHeight) {
                                latLng.lat = state.imgHeight
                            }
                            if (latLng.lng < 0) {
                                latLng.lng = 0
                            } else if (latLng.lng > state.imgWidth) {
                                latLng.lng = state.imgWidth
                            }
                            temp[0][3] = latLng
                            temp[0][0].lat = latLng.lat
                            temp[0][2].lng = latLng.lng
                            marker.setLatLng(temp[0][1])
                            tempNumPoint.setLatLng(temp[0][1])
                            // checkChangeBox.setLatLng(temp[0][1])
                            rectangleBorder1.setLatLngs(temp)
                            rectangleBorder2.setLatLngs(temp)
                            rectangular.setLatLngs(temp)
                            updatePoint(temp, item)
                            if (state.checkChangeBox !== null) {
                                // checkChangeBox.off()
                                state.checkChangeBox.remove()
                                state.checkChangeBox = null
                            }
                        })
                        // outputNewLoction(getBounds)
                    }
                    resizePoint[index].on('dragend', (e) => {
                        // outputNewLoction(temp)
                        createRevisionCheckBox()
                    })
                })
            }
            rectangular.on('mousedown', (e) => {
                if (props.mainMode === 'roi' && !state.blobStatusAdd && e.originalEvent.button === 0) {
                    state.tempMouseDownScopelnglat = e.latlng
                    state.tempMouseDownScope = true
                    tmepBounds = e.target.getLatLngs()
                    tempmarker = marker.getLatLng()
                    state.tempMouseDownScopeObject = {}
                    state.tempMouseDownScopeObject.tmepBounds = e.target.getLatLngs()
                    state.tempMouseDownScopeObject.tempmarker = marker.getLatLng()
                    state.tempMouseDownScopeObject.marker = marker
                    state.tempMouseDownScopeObject.tempNumPoint = tempNumPoint
                    state.tempMouseDownScopeObject.target = e.target
                    state.tempMouseDownScopeObject.rectangleBorder1 = rectangleBorder1
                    state.tempMouseDownScopeObject.rectangleBorder2 = rectangleBorder2
                    // state.tempMouseDownScopeObject.data = data
                    moveStatus = true
                    state.dragObjectStatus = false
                    var newLocation = [
                        [tmepBounds[0][1].lat, tmepBounds[0][1].lng],
                        [tmepBounds[0][3].lat, tmepBounds[0][3].lng]
                    ]
                    runResize(newLocation)
                    if (!state.keyctrl) {
                        state.focusObjectList = {
                            spot: [],
                            line: [],
                            scope: [],
                            blob: []
                        }
                    }
                }
            })
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
const createRevisionCheckBox = (e) => {
    var getBounds = state.tempMouseDownScopeObject.target.getLatLngs()
    if (state.checkChangeBox !== null) {
        // checkChangeBox.off()
        state.checkChangeBox.remove()
        state.checkChangeBox = null
    }
    var checkChangeBoxDiv = L.divIcon({ html: `<div class="checkChangeBoxDiv-btn"><div id="checkChangeBoxOOO" style="pointer-events: auto;"><img style="pointer-events: none;" src="/images/A_sign_2.svg" /></div><div id="checkChangeBoxXXX" style="pointer-events: auto;"><img style="pointer-events: none;" src="/images/A_sign_3.svg" /></div></div>` });
    let porinX = getBounds[0][3].lng
    let porinY = getBounds[0][1].lat + 8
    let tempbound = map.getBounds()
    porinX = porinX > (tempbound._northEast.lng - 20) ? (tempbound._northEast.lng - 20) : porinX
    porinY = porinY > 0 ? 0 : porinY
    state.checkChangeBox = L.marker([porinY, porinX], { icon: checkChangeBoxDiv, draggable: false }).addTo(map);
    // console.log(getBounds[0][1].lat + 25, getBounds[0][3].lng + 5, map.getBounds());
    state.checkChangeBox.on('click', (e) => {
        const targetId = e.originalEvent.target.id;
        // console.log(e.originalEvent.target.id);
        if (targetId === 'checkChangeBoxOOO') {
            // var getBounds = state.tempMouseDownScopeObject.target.getLatLngs()
            var newLocation = [
                [getBounds[0][1].lat, getBounds[0][1].lng],
                [getBounds[0][3].lat, getBounds[0][3].lng]
            ]
            pushScope(newLocation, state.tempMouseDownScopeObject.data)
            // state.tempMouseDownScopeObject = null
        } else if (targetId === 'checkChangeBoxXXX') {
            const runCleanRoi = () => {
                // runScope([])
                // 檢查是否還是否有未移除的物件
                if (state.pixiscope.length > 0) {
                    setTimeout(() => {
                        runCleanRoi()
                    }, 20)
                }
            }
            runCleanRoi()
        }
        if (state.checkChangeBox !== null) {
            // checkChangeBox.off()
            state.checkChangeBox.remove()
            state.checkChangeBox = null
        }
        state.dragObjectStatus = true
    });
    // var checkChangeBoxOOO = document.getElementById('checkChangeBoxOOO')
    // checkChangeBoxOOO.on('click' , (e) => {
    //     console.log('checkChangeBoxOOO');
    // })
}
const pushScope = (location, data) => {
    var width = state.imgWidth
    var height = state.imgHeight
    var scopePositionLT = {
        y: location[1][0] / height,
        x: location[1][1] / width,
    }
    var scopePositionBR = {
        y: location[0][0] / height,
        x: location[0][1] / width,
    }
    // console.log(data);
    var InputScopeData = {
        feature: 'roi',
        method: 'set_roiNodes',
        session: Math.random().toString(36).substr(2),
        content: {
            field_id: 1,
            camera_id: camID,
            cursingPoint_id: props.cursingPointValue,
            // roi_type: 'scope',
            roi_id: data.number,
            image_type: 'ir',
            roi_nodeManual: [
                parseFloat(scopePositionBR.x),
                parseFloat(scopePositionBR.y),
                parseFloat(scopePositionLT.x),
                parseFloat(scopePositionLT.y)
            ]
            // alarm_status: data.alarm_status,
            // threshold: data.threshold,
            // group_name: '',
            // group_id: '',
            // points: {
            //     A: {
            //         x: [parseFloat(scopePositionLT.x)],
            //         y: [parseFloat(scopePositionLT.y)]
            //     },
            //     B: {
            //         x: [parseFloat(scopePositionBR.x)],
            //         y: [parseFloat(scopePositionBR.y)]
            //     }
            // }
        }
    }
    // state.pixiscope[state.tempSetScopenumber].data.position_point_A = scopePositionLT
    // state.pixiscope[state.tempSetScopenumber].data.position_point_B = scopePositionBR
    // state.$emit('maskloing', true)
    state.ws3.send(JSON.stringify(InputScopeData))
    // state.$store.dispatch('myData/incrementAsync', { type: 'addSnackbar', params: { text: 'SCOPE 已更新', type: 0, timeout: 1 } });
    // // state.intiRevisionScopeData = null
    // state.tempScopePosition = {
    //     x: 0,
    //     y: 0,
    //     width: 0,
    //     height: 0
    // }
    // scopePositionLT = null
    // scopePositionBR = null
    // InputScopeData = null
    // canvas = null
    // state.dragObjectStatus = true
}
const updateRevisionObjectNew = (moveLocation, moveType) => {
    var x = moveLocation[0][1]
    var y = moveLocation[0][0]
    var width = moveLocation[1][1] - moveLocation[0][1]
    var height = moveLocation[1][0] - moveLocation[0][0]
    // var width = moveLocation[1][1] - moveLocation[0][1]
    // var height = moveLocation[1][0] - moveLocation[0][0]
    const randerings = (moveName, type) => {
        var anchors = ['top-left', 'top', 'top-right', 'left', 'right', 'bottom-left', 'bottom', 'bottom-right']
        anchors.forEach((item, index) => {
            var tempX = 0
            var tempY = 0
            if (item === 'top-left') {
                tempX = x
                tempY = y
            } else if (item === 'top') {
                //         rect.cursor = 'n-resize';
                tempX = x + (width / 2)
                tempY = y
            } else if (item === 'top-right') {
                //         rect.cursor = 'ne-resize';
                tempX = width + x
                tempY = y
            } else if (item === 'left') {
                //         rect.cursor = 'w-resize';
                tempX = x
                tempY = y + (height / 2)
            } else if (item === 'right') {
                //         rect.cursor = 'w-resize';
                tempX = x + width
                tempY = y + (height / 2)
            } else if (item === 'bottom-left') {
                //         rect.cursor = 'ne-resize';
                tempX = x
                tempY = y + height
            } else if (item === 'bottom') {
                //         rect.cursor = 'n-resize';
                tempX = x + (width / 2)
                tempY = y + height
            } else if (item === 'bottom-right') {
                //         rect.cursor = 'nw-resize';
                tempX = width + x
                tempY = height + y
            }
            if (moveType !== item) {
                state.revisionObject[index].setLatLng([tempY, tempX])
            }
            // var myIcon = L.divIcon({ html: `<div class="RevisionObject"></div>` });
            // var rect = L.marker([tempY, tempX], { icon: myIcon, draggable: true }).addTo(state.map);
            // outarr.push(rect)
        })
    }
    randerings()
}
const createRevisionObjectNew = (moveLocation) => {
    if (state.revisionObject.length > 0) {
        for (var z = 0; z < state.revisionObject.length; z++) {
            state.revisionObject[z].remove()
        }
        state.revisionObject = []
    }
    var x = moveLocation[0][1]
    var y = moveLocation[0][0]
    var width = moveLocation[1][1] - moveLocation[0][1]
    var height = moveLocation[1][0] - moveLocation[0][0]
    const randerings = (moveName, type) => {
        var anchors = ['top-left', 'top', 'top-right', 'left', 'right', 'bottom-left', 'bottom', 'bottom-right']
        var outarr = []
        anchors.forEach((item, index) => {
            var tempX = 0
            var tempY = 0
            var rect = null
            if (item === 'top-left') {
                tempX = x
                tempY = y
            } else if (item === 'top') {
                //         rect.cursor = 'n-resize';
                tempX = x + (width / 2)
                tempY = y
            } else if (item === 'top-right') {
                //         rect.cursor = 'ne-resize';
                tempX = width + x
                tempY = y
            } else if (item === 'left') {
                //         rect.cursor = 'w-resize';
                tempX = x
                tempY = y + (height / 2)
            } else if (item === 'right') {
                //         rect.cursor = 'w-resize';
                tempX = x + width
                tempY = y + (height / 2)
            } else if (item === 'bottom-left') {
                //         rect.cursor = 'ne-resize';
                tempX = x
                tempY = y + height
            } else if (item === 'bottom') {
                //         rect.cursor = 'n-resize';
                tempX = x + (width / 2)
                tempY = y + height
            } else if (item === 'bottom-right') {
                //         rect.cursor = 'nw-resize';
                tempX = width + x
                tempY = height + y
            }
            var myIcon = L.divIcon({ html: `<div class="RevisionObject cur-${item}"></div>` });
            var rect = L.marker([tempY, tempX], { icon: myIcon, draggable: true }).addTo(map);
            outarr.push(rect)
        })
        state.revisionObject = outarr
        return outarr
    }
    return randerings()
}
const createRevisionObject = (e, objcetName, moveLocation1, group) => {
    var deflatwidth = state.imgWidth
    var deflatheight = state.imgHeight
    if (objcetName === 'scope') {
        // var canvas = document.getElementById(state.canvasId)
        // // 先清除暫存
        if (state.revisionObject.length > 0) {
            for (var z = 0; z < state.revisionObject.length; z++) {
                state.revisionObject[z].remove()
            }
            state.revisionObject = []
        }
        var object = e
        var x = 0
        var y = 0
        var width = 0
        var height = 0
        const getLatLng1 = (moveLocation2) => {
            var moveLocation = moveLocation2 === undefined ? moveLocation1 : moveLocation2
            if (moveLocation !== undefined) {
                var newLocation = [
                    [moveLocation[0][1].lat, moveLocation[0][1].lng],
                    [moveLocation[0][3].lat, moveLocation[0][3].lng]
                ]
                x = newLocation[0][1]
                y = newLocation[0][0]
                width = newLocation[1][1] - newLocation[0][1]
                height = newLocation[1][0] - newLocation[0][0]
            } else {
                x = object.position_point_B.x * deflatwidth
                y = object.position_point_B.y * deflatheight
                width = object.position_point_A.x * deflatwidth - object.position_point_B.x * deflatwidth
                height = object.position_point_A.y * deflatheight - object.position_point_B.y * deflatheight
            }
        }
        getLatLng1()
        const eventRun = (rect, type) => {
            var temp00002 = null
            rect.on('dragstart', () => {
                state.revisionObjectleave = true
                state.dragObjectStatus = false
            })
            rect.on('dragend', () => {
                state.revisionObjectleave = false
                state.dragObjectStatus = true
                if (temp00002 !== null) {
                    var newLocation = [
                        [temp00002[1].lat, temp00002[1].lng],
                        [temp00002[3].lat, temp00002[3].lng]
                    ]
                    pushScope(newLocation, e)
                }
            })
            rect.on('drag', (e1) => {
                group.eachLayer((layer) => {
                    if (layer.options.objectType === 'rectangle') {
                        var temp00001 = JSON.stringify(layer.getLatLngs()[0])
                        temp00002 = JSON.parse(temp00001)
                        temp00002[1].lat = e1.latlng.lat
                        temp00002[1].lng = e1.latlng.lng
                        temp00002[2].lat = e1.latlng.lat
                        temp00002[0].lng = e1.latlng.lng
                        layer.setLatLngs(temp00002)
                    }
                });
                getLatLng1([temp00002])
                randerings(type)
                // state.revisionTransformerStart(e1, 'top-left', e, group)
            });
        }
        const randerings = (moveName, type) => {
            var anchors = ['top-left', 'top', 'top-right', 'left', 'right', 'bottom-left', 'bottom', 'bottom-right']
            var outarr = []

            anchors.forEach((item, index) => {
                var myIcon = L.divIcon({ html: `<div class="RevisionObject"></div>` });
                var tempX = 0
                var tempY = 0
                // var rect = new PIXI.Graphics();
                var rect = null
                if (item === 'top-left' && moveName !== 'top-left') {
                    tempX = x
                    tempY = y
                    if (moveName === undefined) {
                        var rect = L.marker([tempY, tempX], { icon: myIcon, draggable: true }).addTo(map);
                        eventRun(rect, item)
                    } else {
                        var rect = state.revisionObject[index]
                        rect.setLatLng([tempY, tempX])
                    }
                } else if (item === 'top' && moveName !== 'top') {
                    //         rect.cursor = 'n-resize';
                    tempX = x + (width / 2)
                    tempY = y
                    if (moveName === undefined) {
                        var rect = L.marker([tempY, tempX], { icon: myIcon }).addTo(map);
                    } else {
                        var rect = state.revisionObject[index - 1]
                        rect.setLatLng([tempY, tempX])
                    }
                    // rect.on('mousedown', (e1) => {
                    //     state.revisionTransformerStart(e1, 'top', e, group)
                    // });
                } else if (item === 'top-right' && moveName !== 'top-right') {
                    //         rect.cursor = 'ne-resize';
                    tempX = width + x
                    tempY = y
                    if (moveName === undefined) {
                        var rect = L.marker([tempY, tempX], { icon: myIcon }).addTo(map);
                        rect.on('mousedown', (e1) => {
                            revisionTransformerStart(e1, 'top-right', e, group)
                        });
                    } else {
                        var rect = state.revisionObject[index - 1]
                        rect.setLatLng([tempY, tempX])
                    }
                } else if (item === 'left' && moveName !== 'left') {
                    //         rect.cursor = 'w-resize';
                    tempX = x
                    tempY = y + (height / 2)
                    if (moveName === undefined) {
                        var rect = L.marker([tempY, tempX], { icon: myIcon }).addTo(map);
                        rect.on('mousedown', (e1) => {
                            revisionTransformerStart(e1, 'left', e, group)
                        });
                    } else {
                        var rect = state.revisionObject[index - 1]
                        rect.setLatLng([tempY, tempX])
                    }
                } else if (item === 'right' && moveName !== 'right') {
                    //         rect.cursor = 'w-resize';
                    tempX = x + width
                    tempY = y + (height / 2)
                    if (moveName === undefined) {
                        var rect = L.marker([tempY, tempX], { icon: myIcon }).addTo(map);
                        rect.on('mousedown', (e1) => {
                            revisionTransformerStart(e1, 'right', e, group)
                        });
                    } else {
                        var rect = state.revisionObject[index - 1]
                        rect.setLatLng([tempY, tempX])
                    }
                } else if (item === 'bottom-left' && moveName !== 'bottom-left') {
                    //         rect.cursor = 'ne-resize';
                    tempX = x
                    tempY = y + height
                    if (moveName === undefined) {
                        var rect = L.marker([tempY, tempX], { icon: myIcon }).addTo(map);
                        rect.on('mousedown', (e1) => {
                            revisionTransformerStart(e1, 'bottom-left', e, group)
                        });
                    } else {
                        var rect = state.revisionObject[index - 1]
                        rect.setLatLng([tempY, tempX])
                    }
                } else if (item === 'bottom' && moveName !== 'bottom') {
                    //         rect.cursor = 'n-resize';
                    tempX = x + (width / 2)
                    tempY = y + height
                    if (moveName === undefined) {
                        var rect = L.marker([tempY, tempX], { icon: myIcon }).addTo(map);
                        rect.on('mousedown', (e1) => {
                            revisionTransformerStart(e1, 'bottom', e, group)
                        });
                    } else {
                        var rect = state.revisionObject[index - 1]
                        rect.setLatLng([tempY, tempX])
                    }
                } else if (item === 'bottom-right' && moveName !== 'bottom-right') {
                    //         rect.cursor = 'nw-resize';
                    tempX = width + x
                    tempY = height + y
                    if (moveName === undefined) {
                        var rect = L.marker([tempY, tempX], { icon: myIcon }).addTo(map);
                        rect.on('mousedown', (e1) => {
                            revisionTransformerStart(e1, 'bottom-right', e, group)
                        });
                    } else {
                        var rect = state.revisionObject[index - 1]
                        rect.setLatLng([tempY, tempX])
                    }
                }
                // rect.on('mouseover', () => state.revisionObjectleave = true)
                // rect.on('mouseout', () => state.revisionObjectleave = false)
                if (moveName === undefined) {
                    outarr.push(rect)
                }
            })
            if (moveName === undefined) {
                state.revisionObject = outarr
            }
        }
        randerings()
        // object = null
        // x = null
        // y = null
        // width = null
        // height = null
        // anchors = null
        // anchorslen = null
        // canvas = null
    }
}
const revisionTransformerStart = (e, type, roidata, group) => {
    var defaultWidth = state.imgWidth
    var defaultHeight = state.imgHeight
    var ObjectX = 0
    var ObjectY = 0
    var width = 0
    var height = 0
    if (state.intiRevisionScopeData === null) {
        var num = state.pixiscope.findIndex((item) => item.data.number === roidata.number)
        var newObject = state.pixiscope[num].data
        ObjectX = newObject.position_point_B.x * defaultWidth
        ObjectY = newObject.position_point_B.y * defaultHeight
        width = newObject.position_point_A.x * defaultWidth
        height = newObject.position_point_A.y * defaultHeight
    } else {
        ObjectX = state.intiRevisionScopeData.x
        ObjectY = state.intiRevisionScopeData.y
        width = state.intiRevisionScopeData.width
        height = state.intiRevisionScopeData.height
    }
    const updateScope = (newPosition) => {
        var tempLocation = [
            [newPosition.height, newPosition.x],
            [newPosition.y, newPosition.x],
            [newPosition.y, newPosition.width],
            [newPosition.height, newPosition.width],
        ]
        group.eachLayer((layer) => {
            if (layer.options.objectType === 'rectangle') {
                layer.setLatLngs(tempLocation)
            }
        });
    }
    const revisionTransformerMove = (event) => {
        // state.dragObjectStatus = false
        var x1 = state.mousesaveLocation.x - event.latlng.lng
        var y1 = state.mousesaveLocation.y - event.latlng.lat
        var newPosition = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
        var positions = {
            'top-left': { x: ObjectX - x1, y: ObjectY - y1, width: width, height: height },
            // 'top-left': { x: ObjectX - x1, y: ObjectY - y1, width: width - -x1, height: height - -y1 },
            'top': { x: ObjectX, y: ObjectY - y1, width, height: height },
            // 'top': { x: ObjectX, y: ObjectY - y1, width, height: height - -y1 },
            'top-right': { x: ObjectX, y: ObjectY - y1, width: width - x1, height: height - -y1 },
            // 'top-right': { x: ObjectX, y: ObjectY - y1, width: width - x1, height: height - -y1 },
            'left': { x: ObjectX - x1, y: ObjectY, width: width - -x1, height },
            'right': { x: ObjectX, y: ObjectY, width: width - x1, height },
            'bottom-left': { x: ObjectX - x1, y: ObjectY, width: width - -x1, height: height - y1 },
            'bottom': { x: ObjectX, y: ObjectY, width, height: height - y1 },
            'bottom-right': { x: ObjectX, y: ObjectY, width: width - x1, height: height - y1 },
            // 'all': { x: ObjectX - x1, y: ObjectY - y1, width, height }
        };
        newPosition = positions[type];
        updateScope(newPosition)
        //     // 限制調整範圍
        //     var limitX = 8;
        //     var limitY = 8;

        //     if (type !== 'all') {
        //         newPosition.width = newPosition.width < limitX ? limitX : newPosition.width;
        //         newPosition.x = newPosition.x > width + ObjectX - limitX ? width + ObjectX - limitX : newPosition.x;
        //         newPosition.height = newPosition.height < limitY ? limitY : newPosition.height;
        //         newPosition.y = newPosition.y > height + ObjectY - limitY ? height + ObjectY - limitY : newPosition.y;
        //     }
        //     state.tempScopePosition = newPosition
        // state.pixiUpdateScope(state.dragTarget2, newPosition) // 更新scope
        //     // state.ChangeRevisionbject(newPosition) // 更新調整框
        //     state.intiRevisionScopeData = newPosition
        //     newPosition = null
        //     x1 = null
        //     y1 = null
        //     positions = null
        //     limitX = null
        //     limitY = null
    }
    // state.saveFouceTempRevision = e.target
    // state.mousesaveLocation = {
    //     x: e.global.x,
    //     y: e.global.y
    // }
    // state.dragTargettemp = {
    //     x: e.target.position.x,
    //     y: e.target.position.y
    // }
    state.saveonDragStart = revisionTransformerMove(e) // 讓使用的函數暫存，後續刪除監聽
    map.on('mousemove', (e1) => {
        revisionTransformerMove(e1)
    });
    // e.target.on('mousemove', (e1) => {
    //     revisionTransformerMove(e1)
    // });
    // e.target.on('mouseout', (e1) => {
    //     e.target.off()
    // });
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
const invaliMapSzie = () => {
    const minZoomX = Math.log2(state.imgWidth / mapcanvas.value.getBoundingClientRect().width);
    const minZoomY = Math.log2(Math.abs(state.imgHeight) / mapcanvas.value.getBoundingClientRect().height);
    const minZoom = Math.max(minZoomX, minZoomY); // 避免圖片變形
    map.setMinZoom(Math.abs(minZoom))
    // map.setMaxZoom(3)
    if (map !== null) {
        var imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
        map.invalidateSize()
        map.fitBounds(imageBounds)
        var div = document.querySelector('.' + state.className)
        // console.log('div', div);
        div.classList.add('hidden')
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
const initWs3 = () => {
    const openwebsocket03 = () => {
        if ($webSocketconnect03().readyState === 1) {
            state.ws3 = $webSocketconnect03()
            if (state.wsListener3.close !== null) {
                state.ws3.removeEventListener("close", state.wsListener3.close)
                state.wsListener3.close = null
            }
            const colseEvent = () => {
                setTimeout(() => {
                    openwebsocket03()
                }, 1000)
            }
            state.ws3.addEventListener("close", colseEvent)
            state.wsListener3.close = colseEvent
            // var tew = 0
            const messageEvent = (event) => {
                if (camType === 'ir') {
                    var data = JSON.parse(event.data)
                    // console.log(data);
                    var feature = data.feature
                    var method = data.method
                    if (feature === "ir_operation" && method === "query_allOperationStatus") {
                        // console.log(data);
                        // superResolution(data.content.working_status === 1 ? true : false)
                    } else if (feature === "roi" && method === "query_nodes_aiSpots" && state.aiSpotStatusAdd) {
                        state.aiSpotTempblobObject.forEach((item) => {
                            item.remove()
                        })
                        state.aiSpotTempblobObject = []
                        data.content.roi_nodeSystem_AI.forEach((item) => {
                            const arr = item
                            const coordinates = [];
                            for (let i = 0; i < arr.length; i += 2) {
                                coordinates.push([arr[i + 1] * state.imgHeight, arr[i] * state.imgWidth]); // Leaflet 需要 [lat, lng] 格式
                            }
                            const blob = L.polygon(coordinates, {
                                color: `rgb(255,255,255)`,
                                fill: false,
                            }).addTo(map);
                            state.aiSpotTempblobObject.push(blob);
                        })
                        state.aiSpotTemppathObject = data.content.roi_nodeSystem_AI
                    }
                }
            }
            state.ws3.addEventListener("message", messageEvent)
            // state.wsListener3.message = messageEvent
        } else if ($webSocketconnect03().readyState !== 1) {
            setTimeout(() => {
                openwebsocket03()
            }, 1000)
        }
    }
    openwebsocket03()
}
onMounted(() => {
    initWs3()
    setInterval(() => {
        low()
    }, 1000)
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
        state.webWorker = new Worker('/worker/roiTrack-onlyroi-inter.js');
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
/* .div-point {
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
} */

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
</style>