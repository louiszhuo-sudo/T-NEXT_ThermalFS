<template>
    <div class="item-card-content" id="map-top-b" style="height: 100%; width: 100%;z-index: 0;" ref="mapcanvas">
        <div ref="LMmap" style="height: 100%; width: 100%">
            <div ref="aispotControl" class="aispotControl"
                :style="state.aiSpotStatusAdd ? '' : 'opacity: 0;pointer-events: none;'">
                <div>
                    <v-btn block :color="state.aiSpotStatus === 1 ? 'rgb(0,255,0)' : ''" @click="state.aiSpotStatus = 1"
                        :class="{ 'flash-red': state.isFlashing }">+</v-btn>
                </div>
                <div>
                    <v-btn block :color="state.aiSpotStatus === 0 ? 'rgb(255,0,0)' : ''" @click="state.aiSpotStatus = 0"
                        :class="{ 'flash-red': state.isFlashing }">-</v-btn>
                </div>
                <div>
                    <v-btn block @click="saveAIBLOB()" :disabled="state.aiSpotTemppathObject.length === 0">v</v-btn>
                </div>
                <div>
                    <v-btn block @click="removeAddRoiStatus();">x</v-btn>
                </div>
            </div>
            <div ref="roiMorphControl" class="roiMorphControl"
                :style="state.roiMorphStatusAdd ? '' : 'opacity: 0;pointer-events: none;'">
                <div>
                    <v-slider :max="10" :min="-10" v-model="state.roiMorphslider2" :ticks="state.roiMorphtickLabels"
                        show-ticks="always" step="0.1" thumb-label="always" tick-size="4"
                        @start="roiMorphsendItemsslider(1)" @end="roiMorphsendItemsslider(0)"></v-slider>
                </div>
                <div class="roiMorphControl-btn">
                    <div>
                        <v-btn @click="roiMorphsendItems(2)">OK</v-btn>
                    </div>
                    <div>
                        <v-btn @click="roiMorphsendItems(0)">cancel</v-btn>
                    </div>
                </div>
            </div>
            <div class="roiMorphControl" :style="state.roiRanderStatusAdd ? '' : 'opacity: 0;pointer-events: none;'">
                <div class="roiMorphControl-btn">
                    <div>
                        <v-btn @click="roiRandersendItems(2)">OK</v-btn>
                    </div>
                    <div>
                        <v-btn @click="roiRandersendItems(0)">cancel</v-btn>
                    </div>
                </div>
            </div>
        </div>
        <!-- 重新命名/刪除對話框 -->
        <v-dialog v-model="state.inputRoiNameWindow" width="auto" persistent>
            <v-card max-width="400" prepend-icon="mdi-update" title="新增手動ROI項目">
                <template v-slot:text>
                    <template v-if="state.addroiGroupInputStatus">
                        <v-select label="所屬主群組" v-model="state.selectMainGroupValue" :items="state.mainGroupItems"
                            variant="outlined" :rules="[v => !!v || '必選其中一項目']" required
                            @update:model-value="mainGroupUpdate"></v-select>
                        <v-select label="所屬子群組" v-model="state.selectSubGroupValue" :items="state.subGroupItems"
                            variant="outlined" :rules="[v => !!v || '必選其中一項目']" required
                            :disabled="state.subGroupItems.length === 0">
                        </v-select>
                    </template>
                    <v-sheet class="mx-auto" width="300">
                        <v-form @submit.prevent>
                            <v-text-field v-model="state.reNameValue" label="ROI項目名稱" />
                        </v-form>
                    </v-sheet>
                    <v-switch color="primary" v-model="state.tempAlarmSwitch"
                        :label="`警報開關: ${state.tempAlarmSwitch ? '開' : '關'}`" hide-details inset></v-switch>
                </template>
                <template v-slot:actions>
                    <v-btn text="取消" @click="inputRoiName('delete')"></v-btn>
                    <v-btn text="送出" @click="inputRoiName('save')" :disabled="state.reNameValue === ''"></v-btn>
                </template>
            </v-card>
        </v-dialog>
        <div id="message" style="display: none;">
        </div>

    </div>
</template>
<script setup>
import { ref } from 'vue'
import { createWhepPlayer } from '../../utils/whepPlayer'
const { $getIpaddress } = useNuxtApp()
const { $webSocket02URL } = useNuxtApp()
const { $webSocketconnect03 } = useNuxtApp()
const { $webSocketconnect07 } = useNuxtApp()
const { $displayRoi } = useNuxtApp()
const LMmap = ref(null)
const mapcanvas = ref(null)
const backbtn = useAttrs().backbtn
var map = null
const state = reactive({
    mainbackbtn: true,
    webWorker: null,
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
    ws7: {
        readyState: 0
    },
    wsListener7: {
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
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 20,
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
    tempboundsScope: [],
    saveFouceTempRevision: null, // 暫存revisionTransformerMove 函數，做刪除監聽用
    dragTargettemp: { x: 0, y: 0 },
    blobStatusAdd: false,
    spotStatusAdd: false,
    lineStatusAdd: false,
    scopeStatusAdd: false,
    isFlashing: false,
    aiSpotStatusAdd: false,
    aiSpotStatus: -1,
    aiSpotSavePoints: [],
    aiSpotTempblobObject: [],
    aiSpotTempPointObject: [],
    aiSpotTemppathObject: [],
    // ROI 膨脹
    roiMorphStatusAdd: false,
    roiMorphtickLabels: [-10, -5, 0, 5, 10],
    roiMorphTempblobObject: [],
    roiMorphsave: [],
    roiMorphslider2: 0,
    // ROI 膨脹 end
    // ROI 渲染
    roiRanderStatusAdd: false,
    roiRanderTempblobObject: [],
    roiRandersave: [],
    // ROI 渲染 end
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
    className: 'rest0-btn' + Math.random().toString(36).substr(2),
    videoTag: null,
    imageOverlay: null,
    imageBounds: []
})
const props = useAttrs().formtData
const camID = useAttrs().camID
const camType = useAttrs().camType
const usePhoto = useAttrs().usePhoto

watch(
    () => props.viewMode,
    (data, prevData) => {
        if (data === 0) {
            const runCleanRoi = () => {
                runSpot([])
                runLine([])
                runScope([])
                if (state.pixiWebWorker !== null) {
                    state.pixiWebWorker.postMessage({
                        type: 'splineCurrent',
                        objectName: 'blob',
                        data: [[], state.imgHeight, state.imgWidth]
                    })
                    state.pixiWebWorker.postMessage({
                        type: 'splineCurrent',
                        objectName: 'mask',
                        data: [[], state.imgHeight, state.imgWidth]
                    })
                }
                // 檢查是否還是否有未移除的物件
                if (state.pixispot.length > 0 || state.pixiline.length > 0 || state.pixiscope.length > 0 || state.pixiblob.length > 0 || state.pixiMask.length > 0) {
                    // Your code here
                    setTimeout(() => {
                        // console.log('runCleanRoi');
                        runCleanRoi()
                    }, 20)
                }
                state.roiMorphStatusAdd = false
                state.roiMorphTempblobObject.forEach((item) => {
                    if (item.objectMarker !== null) {
                        item.objectMarker.remove()
                    }
                })
                state.roiMorphsave.forEach((item) => {
                    item.remove()
                })
                state.roiMorphTempblobObject = []
                state.roiMorphsave = []
                console.log('tempMouseDownScopeObject', state.tempMouseDownScopeObject)
                if (state.revisionObject.length > 0) {
                    for (var z = 0; z < state.revisionObject.length; z++) {
                        state.revisionObject[z].remove()
                    }
                    state.revisionObject = []
                }
                if (state.checkChangeBox !== null) {
                    state.checkChangeBox.remove()
                    state.checkChangeBox = null
                }
                state.dragObjectStatus = true
            }
            runCleanRoi()
        }
    })
watch(
    () => props.mainMode,
    (data, prevData) => {
        if (!usePhoto) {
            state.changeModeStatus = true
            // console.log('change mode:', data);
            createMasking()
            const runMask = () => {
                state.changeModeStatus = false
            }
            // 未移除的物件
            const runCleanRoi = () => {
                runSpot([])
                runLine([])
                runScope([])
                // ROI膨脹
                state.roiMorphStatusAdd = false
                state.roiMorphTempblobObject.forEach((item) => {
                    if (item.objectMarker !== null) {
                        item.objectMarker.remove()
                    }
                })
                state.roiMorphsave.forEach((item) => {
                    item.remove()
                })
                state.roiMorphTempblobObject = []
                state.roiMorphsave = []
                // ROI膨脹
                if (state.pixiWebWorker !== null) {
                    state.pixiWebWorker.postMessage({
                        type: 'splineCurrent',
                        objectName: 'blob',
                        data: [[], state.imgHeight, state.imgWidth]
                    })
                    state.pixiWebWorker.postMessage({
                        type: 'splineCurrent',
                        objectName: 'mask',
                        data: [[], state.imgHeight, state.imgWidth]
                    })
                }
                // 檢查是否還是否有未移除的物件
                if (state.pixispot.length > 0 || state.pixiline.length > 0 || state.pixiscope.length > 0 || state.pixiblob.length > 0 || state.pixiMask.length > 0) {
                    // Your code here
                    setTimeout(() => {
                        // console.log('runCleanRoi');
                        runCleanRoi()
                    }, 20)
                } else {
                    // console.log('state.pixispot', state.pixispot);
                    runMask()
                }
            }
            runCleanRoi()
        }
    }
)

//  測試子組件使用父組件方法
const emit = defineEmits(['dataFromChild', 'messageEvent', 'backbtnfn'])
setTimeout(() => {
    sendDataToParent()
}, 1000)
const sendDataToParent = () => {
    const data = { example: 'some data' }
    emit('dataFromChild', data)
}
const removeMap = () => {
    map.eachLayer((layer) => {
        layer.off();               // 移除事件監聽器
        map.removeLayer(layer);    // 從地圖上移除
    });
    map.off();                      // 移除地圖上的所有事件
    // map.remove();                   // 最後移除地圖本身
    // map = null
}
const removeObject = (e) => {
    // 检查是否是 LayerGroup 或 FeatureGroup
    if (e instanceof L.LayerGroup || e instanceof L.FeatureGroup) {
        // 对每个图层递归调用 removeObject
        e.eachLayer(function (layer) {
            removeObject(layer);       // 递归移除子图层
            if (typeof layer.off === 'function') {
                layer.off();           // 移除事件监听器
            }
            if (map.hasLayer(layer)) {
                map.removeLayer(layer); // 从地图上移除图层
            }
        });
    }

    // 最终移除当前层
    if (typeof e.off === 'function') {
        e.off();  // 移除事件监听器
    }
    if (map.hasLayer(e)) {
        map.removeLayer(e);  // 从地图上移除对象
    }
};
//  測試子組件使用父組件方法 end
const leafletJsInitForPhoto = () => {
    state.imgWidth = 474
    state.imgHeight = -402
    map = LMmap.value.leafletObject

    map.setView([state.imgHeight / 2, state.imgWidth / 2], 1);
    map._layersMaxZoom = 20;
    var imageUrl = '/images/mapBackground_1.png', // /mock/ir13807.jpg
        imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    var imageOverlay = L.imageOverlay(imageUrl, imageBounds, { opacity: 0.25 });
    imageOverlay.setZIndex(-2);
    imageOverlay.addTo(map);
    map.fitBounds(imageBounds)
    if (state.refreshMapTimeout !== null) {
        clearTimeout(state.refreshMapTimeout)
    }
    // 刷新地圖
    state.refreshMapTimeout = setTimeout(() => {
        removeMap()
        state.ptz = []
        state.cursingPoint_id = []
        leafletJsInitForPhoto()
        console.log('refresh Map');
    }, 300 * 1000)
    // 雷達


}
// invaliMapSzie = resize fn
const invaliMapSzie = () => {
    
    let mapWidth = mapcanvas.value.getBoundingClientRect().width
    let mapHeight = -mapcanvas.value.getBoundingClientRect().height
    state.imgHeight = mapHeight
    state.imgWidth = mapWidth

    // var Bounds = [[0, 0], [state.imgHeight * 2, state.imgWidth * 2]];

    var imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    state.imageOverlay.setBounds(imageBounds)
    state.videoTag.setBounds(imageBounds)
    if (state.webWorker !== null) {
        state.webWorker.postMessage({
            type: 'canvasSize',
            parameter: {
                imgWidth: state.imgWidth,
                imgHeight: state.imgHeight
            }
        })
    }
    const runCleanRoi = () => {
        runSpot([])
        runLine([])
        runScope([])
        // ROI膨脹
        state.roiMorphStatusAdd = false
        state.roiMorphTempblobObject.forEach((item) => {
            if (item.objectMarker !== null) {
                item.objectMarker.remove()
            }
        })
        state.roiMorphsave.forEach((item) => {
            item.remove()
        })
        state.roiMorphTempblobObject = []
        state.roiMorphsave = []
        // ROI膨脹
        if (state.pixiWebWorker !== null) {
            state.pixiWebWorker.postMessage({
                type: 'splineCurrent',
                objectName: 'blob',
                data: [[], state.imgHeight, state.imgWidth]
            })
            state.pixiWebWorker.postMessage({
                type: 'splineCurrent',
                objectName: 'mask',
                data: [[], state.imgHeight, state.imgWidth]
            })
        }
        // 檢查是否還是否有未移除的物件
        if (state.pixispot.length > 0 || state.pixiline.length > 0 || state.pixiscope.length > 0 || state.pixiblob.length > 0 || state.pixiMask.length > 0) {
            // Your code here
            setTimeout(() => {
                // console.log('runCleanRoi');
                runCleanRoi()
            }, 20)
        }
        // else {
        // console.log('state.pixispot', state.pixispot);
        // console.log('s');
        // }
    }
    runCleanRoi()
    state.imageBounds = imageBounds
    map.invalidateSize()
    map.setMaxBounds(imageBounds)
    map.fitBounds(imageBounds, {
        animate: false
    })
    setTimeout(() => {
        if (backbtn === undefined) {
            const buttonElement = document.querySelector(`.${state.className}`);
            buttonElement.classList.add('hidden');
        } else {
            emit('backbtnfn', 'hidden')
        }
    }, 1000)
    // const minZoomX = Math.log2(state.imgWidth / mapcanvas.value.getBoundingClientRect().width);
    // const minZoomY = Math.log2(Math.abs(state.imgHeight) / mapcanvas.value.getBoundingClientRect().height);
    // const minZoom = Math.max(minZoomX, minZoomY); // 避免圖片變形
    // map.setMinZoom(Math.abs(minZoom))
    // map.setMaxBounds(imageBounds)
}
// leafletJsInit = 初始化地圖
const leafletJsInit = () => {
    map = L.map(LMmap.value, state.mapOptions).on('load', () => {
        console.log('✅ Leaflet 地圖已準備好！')
    });
    let mapWidth = mapcanvas.value.getBoundingClientRect().width
    let mapHeight = mapcanvas.value.getBoundingClientRect().height
    state.imgHeight = -mapHeight
    state.imgWidth = mapWidth
    const ro = new ResizeObserver(() => {
        invaliMapSzie()
    });

    ro.observe(LMmap.value);
    map.setView([state.imgHeight / 2, state.imgWidth / 2], 1);
    map._layersMaxZoom = 20;
    // 移動
    const onMapMove = (e) => {
        // 新增line物件
        if (state.lineTempAddObject !== null) {
            let latLng = e.latlng
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
            var linelen = state.lineTempAddObject.getLatLngs()
            linelen[1] = latLng
            state.lineTempAddObject.setLatLngs(linelen)
        }
        // 新增scope物件
        if (state.scopeTempAddObject !== null) {
            var scopelen = state.scopeTempAddObject.getLatLngs()
            scopelen[0][3] = e.latlng
            scopelen[0][2].lng = e.latlng.lng
            scopelen[0][0].lat = e.latlng.lat
            state.scopeTempAddObject.setLatLngs(scopelen)
        }
        // 新增blob物件
        if (state.blobStatusAdd) {
            if (state.removePoint !== null) {
                var map1 = null
                if (state.moveRemovePoint) {
                    map1 = state.AddTempPoints
                } else {
                    map1 = state.AddTempPoints.concat(e.latlng.lng, e.latlng.lat)
                }
                // map1.push(event.global.x, event.global.y)
                if (state.pixiWebWorker !== null) {
                    state.pixiWebWorker.postMessage({
                        type: 'splineCurrentOnly',
                        data: [map1, state.moveRemovePoint]
                    })
                }
                map1 = null
            }
        }
    }
    var imageUrl = '/images/EMPTYv1-fill.png', // /mock/ir13807.jpg
        imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    var imageOverlay = L.imageOverlay(imageUrl, imageBounds);

    imageOverlay.setZIndex(-2);
    imageOverlay.addTo(map);
    map.fitBounds(imageBounds)
    const minZoomX = Math.log2(state.imgWidth / mapcanvas.value.getBoundingClientRect().width);
    const minZoomY = Math.log2(Math.abs(state.imgHeight) / mapcanvas.value.getBoundingClientRect().height);
    const minZoom = Math.max(minZoomX, minZoomY); // 避免圖片變形
    map.setMinZoom(Math.abs(minZoom))
    map.setMaxBounds(imageBounds)
    map.on('mousemove', onMapMove)
    map.on('mousedown', (e) => {
        state.mousesaveLocation.y = e.latlng.lat
        state.mousesaveLocation.x = e.latlng.lng
        if (e.originalEvent.which === 1) {
            onCanvasDown(e)
        }
    })
    map.on('contextmenu', (e) => {
        removeAddRoiStatus()
    })
    // 创建 video 元素
    let randomstr = getRandomString(10)
    const video = document.createElement('video');
    video.autoplay = true;
    video.controls = false;
    video.muted = true;
    video.loop = true;
    // video.id = `video${camType}${camID}`;
    video.id = `video${camType}${camID}-${state.randomID}`;
    video.className = 'video-player';
    video.style.objectFit = 'fill'
    var videoBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    var videoTag = L.videoOverlay(video, videoBounds,).addTo(map);
    state.videoTag = videoTag
    state.imageOverlay = imageOverlay
    function monitorVideoFrame(video1) {
        let lastFrameTime = performance.now();

        function checkFrame(now, metadata) {
            const timeSinceLastFrame = now - lastFrameTime;
            lastFrameTime = now;

            if (timeSinceLastFrame > 1000) {
                console.log('幀更新延遲超過 1 秒，可能卡住了');
                const stream = video1.srcObject;
                video1.srcObject = null; // 暫時清掉
                video1.srcObject = stream; // 重設
                video1.play();
            }

            video1.requestVideoFrameCallback(checkFrame);
        }

        video1.requestVideoFrameCallback(checkFrame);
    }
    // monitorVideoFrame(video) // 判斷影片是否故障，並且自動修復
   
    const currentPort = window.location.port;
    if (camType === 'ir') {
        runRTC(`video${camType}${camID}-${state.randomID}`, `http://${$getIpaddress()}:${currentPort}/video/realtime/${camType}${camID}`, 'vis')
    } else {
        runRTC(`video${camType}${camID}-${state.randomID}`, `http://${$getIpaddress()}:${currentPort}/video/realtime/${camType}${camID}`, 'vis') // [element id,video url]
    }
    const animate = () => {
        // 排序
        if (state.objectMask !== null) {
            state.objectMask.eachLayer((item) => {
                if (props.mainMode === 'mask') {
                    item.bringToFront()
                } else {
                    item.bringToBack()
                }
            })
        }
        // 多選框跟蹤
        // if (state.map !== null) {
        //     var p1 = []
        //     state.pixiscope.forEach((item, index) => {
        //         var object = item.pixi
        //         var scope = null
        //         object.eachLayer((layer) => {
        //             if (layer.options?.objectType === "rectangle") {
        //                 scope = layer
        //                 // console.log(scope);
        //             }
        //         });
        //         // console.log(scope.getLatLngs());
        //         scope.getLatLngs()[0].forEach((item, index) => {
        //             p1.push([item.lat, item.lng])
        //         })
        //         // if (index === 0) {
        //         //     p1 = scope
        //         // } else if (index === 1) {
        //         //     p2 = scope
        //         //     var bounds = L.bounds(p1.getBounds(), p2.getBounds())
        //         //     console.log(bounds, p1.getBounds(), p2.getBounds());
        //         // }
        //     })
        //     if (p1.length > 0) {
        //         var polyline = L.polyline(p1);
        //         if (boundsScope !== null) {
        //             boundsScope.remove()
        //             boundsScope = null
        //         }
        //         boundsScope = L.rectangle(polyline.getBounds(), { fill: false, color: 'red' }).addTo(state.map);
        //     }
        //     // console.log(polyline.getBounds());
        // }
        // 多選框跟蹤 end
        requestAnimationFrame(animate);
    }
    animate();
    // 測試多個物件同時移動
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey) {
            state.keyctrl = true
        }
    });
    document.addEventListener('keyup', (event) => {
        if (event.key === 'Control') {
            state.keyctrl = false
        }
    });
    state.focusObjectList = {
        spot: [],
        line: [],
        scope: [],
        blob: []
    } // 集合要被移動的物件
    var temp = {
        spot: [],
        line: [],
        scope: [],
        blob: []
    }
    var holdobject = false
    var boundsScope = L.rectangle([[0, 0], [0, 0]], { fill: !state.keyctrl, fillOpacity: 0.001, color: "#FFF", weight: 3 }).addTo(map);

    const animatetest = () => {
        var p1 = []
        state.focusObjectList.scope.forEach((item, index) => {
            var scopeGroupList = item.getLayers()
            for (var i = 0; i < scopeGroupList.length; i++) {
                if (scopeGroupList[i].options.objectType === 'rectangle') {
                    scopeGroupList[i].getLatLngs()[0].forEach((item, index) => {
                        p1.push([item.lat, item.lng])
                    })
                    break;
                }
            }

        })
        state.focusObjectList.blob.forEach((item, index) => {
            var blobGroupList = item.getLayers()
            blobGroupList[0].getLatLngs()[0].forEach((item, index) => {
                p1.push([item.lat, item.lng])
            })
        })
        if (p1.length > 0) {
            var polyline = L.polyline(p1);
            var tempScope = L.rectangle(polyline.getBounds())
            boundsScope.setLatLngs(tempScope.getLatLngs())
            boundsScope.setStyle({ fill: !state.keyctrl, fillOpacity: 0.001, color: '#FFF' })
            boundsScope.bringToFront()
        } else {
            boundsScope.setLatLngs([[0, 0], [0, 0]])
        }
        requestAnimationFrame(animatetest);
    }
    animatetest()
    boundsScope.on('mouseover', (e) => {
        holdobject = true
        state.dragObjectStatus = false
    })
    boundsScope.on('mouseout', (e) => {
        holdobject = false
        state.dragObjectStatus = true
    })
    var down = null
    map.on('mousedown', (e) => {
        down = {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        }
        state.focusObjectList.scope.forEach((item, index) => {
            var scopeGroupList = item.getLayers()
            for (var i = 0; i < scopeGroupList.length; i++) {
                if (scopeGroupList[i].options.objectType === 'rectangle') {
                    temp.scope.push(scopeGroupList[i].getLatLngs())
                    break;
                }
            }
        })
        state.focusObjectList.blob.forEach((item, index) => {
            var blobGroupList = item.getLayers()
            temp.blob.push(blobGroupList[0].getLatLngs())
        })
    })
    map.on('mousemove', (e) => {
        if (down !== null && holdobject) {
            if (state.revisionObject.length > 0) {
                for (var z = 0; z < state.revisionObject.length; z++) {
                    state.revisionObject[z].remove()
                }
                state.revisionObject = []
            }
            if (state.blobPutTempPoint.length > 0) {
                for (var z = 0; z < state.blobPutTempPoint.length; z++) {
                    state.blobPutTempPoint[z].remove()
                }
                state.blobPutTempPoint = []
            }
            var lat = down.lat - e.latlng.lat
            var lng = down.lng - e.latlng.lng
            Object.keys(temp).forEach((key) => {
                temp[key].forEach((item, index) => {
                    let type = key
                    if (type === 'scope') {
                        var newLocation = []
                        item[0].forEach((item1, index1) => {
                            newLocation.push([item1.lat - lat, item1.lng - lng])
                        })
                        var scopeGroupList = state.focusObjectList[key][index].getLayers()
                        for (var i = 0; i < scopeGroupList.length; i++) {
                            if (scopeGroupList[i].options.objectType === 'rectangle') {
                                scopeGroupList[i].setLatLngs(newLocation)
                                // break;
                            } else {
                                scopeGroupList[i].setLatLng(newLocation[1])
                            }
                        }
                    } else if (type === 'blob') {
                        var newLocation = []
                        item[0].forEach((item1, index1) => {
                            newLocation.push([item1.lat - lat, item1.lng - lng])
                        })
                        var blobGroupList = state.focusObjectList[key][index].getLayers()
                        blobGroupList[0].setLatLngs(newLocation)
                    }
                })
            })
        }
        // scope 移動
        if (state.tempMouseDownScope !== null) {
            var y = state.tempMouseDownScopelnglat.lat - e.latlng.lat
            var x = state.tempMouseDownScopelnglat.lng - e.latlng.lng
            var tmepBounds = state.tempMouseDownScopeObject.tmepBounds
            var tempmarker = state.tempMouseDownScopeObject.tempmarker
            let scopewidth = Math.abs(tmepBounds[0][2].lng - tmepBounds[0][1].lng);
            let scopehight = Math.abs(tmepBounds[0][0].lat - tmepBounds[0][1].lat);
            var temp1 = JSON.stringify(tmepBounds)
            var temp = JSON.parse(temp1)
            for (var i = 0; i < tmepBounds[0].length; i++) {
                temp[0][i].lat = tmepBounds[0][i].lat - y
                temp[0][i].lng = tmepBounds[0][i].lng - x
            }
            var temp2 = JSON.stringify(tempmarker)
            var temp3 = JSON.parse(temp2)
            if (temp[0][1].lng < 0) {
                temp[0][0].lng = 0
                temp[0][1].lng = 0
                temp[0][2].lng = scopewidth
                temp[0][3].lng = scopewidth
            } else if (temp[0][1].lng > (state.imgWidth - scopewidth)) {
                temp[0][0].lng = state.imgWidth - scopewidth
                temp[0][1].lng = state.imgWidth - scopewidth
                temp[0][2].lng = state.imgWidth
                temp[0][3].lng = state.imgWidth
            }
            if (temp[0][1].lat > 0) {
                temp[0][0].lat = -scopehight
                temp[0][1].lat = 0
                temp[0][2].lat = 0
                temp[0][3].lat = -scopehight
            } else if (temp[0][1].lat < (state.imgHeight + scopehight)) {
                temp[0][0].lat = state.imgHeight
                temp[0][1].lat = state.imgHeight + scopehight
                temp[0][2].lat = state.imgHeight + scopehight
                temp[0][3].lat = state.imgHeight
            }

            state.tempboundsScope = temp
            let markerNew = [
                temp[0][1].lat, temp[0][1].lng
            ]
            state.tempMouseDownScopeObject.marker.setLatLng(markerNew)
            state.tempMouseDownScopeObject.tempNumPoint.setLatLng(markerNew)
            state.tempMouseDownScopeObject.target.setLatLngs(temp)
            state.tempMouseDownScopeObject.rectangleBorder1.setLatLngs(temp)
            state.tempMouseDownScopeObject.rectangleBorder2.setLatLngs(temp)
            if (state.revisionObject.length > 0) {
                for (var z = 0; z < state.revisionObject.length; z++) {
                    state.revisionObject[z].remove()
                }
                state.revisionObject = []
            }
            if (state.checkChangeBox !== null) {
                state.checkChangeBox.remove()
                state.checkChangeBox = null
            }
        }
    })
    map.on('mouseup', (e) => {
        down = null
        temp = {
            spot: [],
            line: [],
            scope: [],
            blob: []
        }
        state.focusObjectList.scope.forEach((item, index) => {
            var scopeGroupList = item.getLayers()
            for (var i = 0; i < scopeGroupList.length; i++) {
                if (scopeGroupList[i].options.objectType === 'rectangle') {
                    var getBounds = scopeGroupList[i].getLatLngs()
                    var newLocation = [
                        [getBounds[0][1].lat, getBounds[0][1].lng],
                        [getBounds[0][3].lat, getBounds[0][3].lng]
                    ]
                    pushScope(newLocation, item.options.data)
                    break;
                }
            }
        })
        state.focusObjectList.blob.forEach((item, index) => {
            console.log('updata blob');
        })
        if (state.tempMouseDownScope !== null) {
            createRevisionCheckBox()
            state.tempMouseDownScope = null
        }
    })
    const clearEventObject = () => {
        // 清除scope 調整物件
        if (state.revisionObject.length > 0) {
            for (var z = 0; z < state.revisionObject.length; z++) {
                state.revisionObject[z].remove()
            }
            state.revisionObject = []
        }
        state.focusObjectList = {
            spot: [],
            line: [],
            scope: [],
            blob: []
        }
    }
    // 回到預設位置
    var timeoutid = null
    var className = state.className
    state.imageBounds = imageBounds
    const resetButton = L.Control.extend({
        options: {
            position: 'bottomright'  // 設定按鈕顯示位置為右下角
        },
        onAdd: function (map) {
            const container = L.DomUtil.create('div', `reset-btn hidden ${className}`); // hidden
            // container.innerHTML = '回到預設位置';
            const img = L.DomUtil.create('img', '', container);
            img.src = '/images/icon/return.png';  // 圖片的路徑
            img.alt = '回到預設位置';
            container.onclick = function () {
                map.fitBounds(state.imageBounds);  // 回到預設邊界
                if (timeoutid !== null) {
                    clearTimeout(timeoutid);
                    timeoutid = null;
                }
                timeoutid = setTimeout(() => {
                    container.classList.add('hidden');
                    timeoutid = null;
                }, 1000)

            };
            return container;
        }
    });

    // 將自訂按鈕加到地圖
    if (backbtn === undefined) {
        const resetControl = new resetButton();
        map.addControl(resetControl);
    } else {
        if (timeoutid !== null) {
            clearTimeout(timeoutid);
            timeoutid = null;
        }
        timeoutid = setTimeout(() => {
            emit('backbtnfn', 'hidden')
            timeoutid = null;
        }, 1000)
    }

    // 監聽地圖的移動和縮放事件
    const hiddenBtn = (e) => {
        const currentBounds = map.getBounds();  // 目前地圖的邊界
        const isAtDefaultPosition = currentBounds.equals(state.imageBounds);  // 檢查邊界是否相同
        const buttonElement = document.querySelector(`.${className}`);
        if (backbtn === undefined) {
            if (isAtDefaultPosition) {
                buttonElement.classList.add('hidden');
            } else {
                buttonElement.classList.remove('hidden');
            }
        } else {
            if (isAtDefaultPosition) {
                emit('backbtnfn', 'hidden')
            } else {
                emit('backbtnfn', 'play')
            }
            if (map.getZoom() === 0) {
                emit('backbtnfn', 'hidden')
            }
        }
        // emit('backbtnfn', { type: 'getzoom', data: map.getZoom() })
        // console.log('map.getZoom()', 1 + map.getZoom() + 'x');
    }
    map.on('zoomend', hiddenBtn);
    map.on('moveend', hiddenBtn);
    // 回到預設位置 end
}
var timeoutid123 = null
const addlistenerMainBack = () => {
    console.log('addlistenerMainBack');
    map.fitBounds(state.imageBounds);  // 回到預設邊界
    if (timeoutid123 !== null) {
        clearTimeout(timeoutid123);
        timeoutid123 = null;
    }
    timeoutid123 = setTimeout(() => {
        emit('backbtnfn', 'hidden')
        timeoutid123 = null;
    }, 1000)
}
const sendSR = () => {
    if (state.ws3.readyState === 0) {
        setTimeout(() => {
            sendSR()
        }, 1000)
    } else {
        var output = {
            "feature": "ir_operation",
            "method": "query_allOperationStatus",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "camera_id": camID
            }
        }
        state.ws3.send(JSON.stringify(output))
    }
}
const superResolution = (e) => {
    const currentPort = window.location.port;
    if (state.tempSRstatus !== e) {
        if (e) {
            // console.log('superResolution', "開啟SR", e);
            runRTC(`video${camType}${camID}-${state.randomID}`, `http://${$getIpaddress()}:${currentPort}/video/realtime/${camType}${camID}_SR`, 'vis')
        } else {
            // console.log('superResolution', "關閉SR", e);
            runRTC(`video${camType}${camID}-${state.randomID}`, `http://${$getIpaddress()}:${currentPort}/video/realtime/${camType}${camID}`, 'vis')
        }
        state.tempSRstatus = e
    }

}
const roiMorphsendItemstemp = (data, bounds, LatLngs) => {
    let findIndex = state.roiMorphTempblobObject.findIndex((item) => item.data.number === data.number)
    if (findIndex === -1) {
        const objectMarker = CheckPin.create(bounds._northEast, { size: 24 }).addTo(map);
        state.roiMorphTempblobObject.push({
            objectMarker: objectMarker,
            object: null,
            data
        })
    } else {
        if (state.roiMorphTempblobObject[findIndex].objectMarker !== null) {
            state.roiMorphTempblobObject[findIndex].objectMarker.remove()
        }
        state.roiMorphTempblobObject.splice(findIndex, 1);
    }
    roiMorphsendItems(1)
    console.log(state.roiMorphTempblobObject, bounds, LatLngs);
}

const roiRandersendItemstemp = (data, bounds, LatLngs) => {
    let findIndex = state.roiRanderTempblobObject.findIndex((item) => item.data.number === data.number)
    if (findIndex === -1) {
        const objectMarker = CheckPin.create(bounds._northEast, { size: 24 }).addTo(map);
        state.roiRanderTempblobObject.push({
            objectMarker: objectMarker,
            object: null,
            data
        })
    } else {
        if (state.roiRanderTempblobObject[findIndex].objectMarker !== null) {
            state.roiRanderTempblobObject[findIndex].objectMarker.remove()
        }
        state.roiRanderTempblobObject.splice(findIndex, 1);
    }
}
const yyytime = ref(null)
const roiMorphsendItemsslider = (e) => {
    if (yyytime.value !== null) {
        clearTimeout(yyytime.value)
    }
    if (e === 1) {
        const timeout12 = () => {
            yyytime.value = setTimeout(() => {
                roiMorphsendItems(1)
                timeout12()
            }, 200)
        }
        timeout12()
    }
}
const roiMorphsendItems = (type) => {
    // 0 = 取消 1 = 點物件送出 2 = 點ok
    if (type === 1 && state.roiMorphTempblobObject.length > 0) {
        let output = {
            "feature": "roi",
            "method": "set_roiMorph",
            "session": "sdddaw4154rg1@F",
            "content": {
                "roi_id_list": [],
                "roi_scale": state.roiMorphslider2
            }
        }
        state.roiMorphTempblobObject.forEach((item) => {
            output.content.roi_id_list.push(item.data.number)
        })
        state.ws7.send(JSON.stringify(output))
    }
    // ROI膨脹送出
    if (type !== 1) {
        state.roiMorphsave.forEach((item) => {
            item.remove()
        })
        state.roiMorphStatusAdd = false
        state.roiMorphTempblobObject.forEach((item) => {
            if (item.objectMarker !== null) {
                item.objectMarker.remove()
            }
        })
        state.roiMorphTempblobObject = []
        state.roiMorphsave = []
    }
}

const roiRandersendItems = (type) => {
    // Roi 渲染
    // 0 = 取消 1 = 點物件送出 2 = 點ok
    if (type === 2 && state.roiRanderTempblobObject.length > 0) {
        console.log('1747 觸發roirandersenditems ', type, state.roiRanderTempblobObject, state.roiRanderTempblobObject.length);
        let output = {
            "feature": "roi",
            "method": "set_roiRander",
            "session": "sdddaw4154rg1@F",
            "content": {
                "roi_id_list": [],
            }
        }
        state.roiRanderTempblobObject.forEach((item) => {
            output.content.roi_id_list.push(item.data.number)
        })
        state.ws7.send(JSON.stringify(output))
    }
    // ROI膨脹送出
    if (type !== 1) {
        state.roiRandersave.forEach((item) => {
            item.remove()
        })
        state.roiRanderStatusAdd = false
        state.roiRanderTempblobObject.forEach((item) => {
            if (item.objectMarker !== null) {
                item.objectMarker.remove()
            }
        })
        state.roiRanderTempblobObject = []
        state.roiRandersave = []
    }
}
// 把單一扁平路徑 [x0,y0,x1,y1,...] 從 0~1 轉成像素
function normToLatLngs(normFlat, width, height) {
    const latlngs = [];
    for (let i = 0; i < normFlat.length; i += 2) {
        const x = normFlat[i] * width;
        const y = normFlat[i + 1] * height;
        // 注意：這裡直接把像素座標當成 lat/lng 使用
        // 如果你要真的地理座標，要再做投影轉換
        latlngs.push([y, x]);
    }
    return latlngs;
}

const mainGroupUpdate = (e) => {
    // console.log('sadasd', e, state.selectMainGroupValue);
    var index = state.mainGroupItems.findIndex((item) => item.value === e)
    state.subGroupItems = state.mainGroupItems[index].data
    state.selectSubGroupValue = null
}
const getRandomString = (length) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
const createMasking = () => {

    if (state.objectMask !== null) {
        state.objectMask.remove()
        state.objectMask = null
    }
    if (state.reqAnim !== null) {
        // window.cancelAnimationFrame(state.reqAnim);
        clearInterval(state.reqAnim)
        state.reqAnim = null
    }
    var fillOpacity = props.mainMode === 'mask' ? 0.7 : 0.3
    var group = L.layerGroup().addTo(map);

    L.polygon([
        [[0, 0], [state.imgHeight, 0], [state.imgHeight, state.imgWidth], [0, state.imgWidth]]
    ], { stroke: false, color: '#000', fillOpacity }).addTo(group);
    // mask.bringToFront()
    state.objectMask = group
    const processNewPath = () => {
        var latlngs2233 = [
            [
                [[0, 0], [state.imgHeight, 0], [state.imgHeight, state.imgWidth], [0, state.imgWidth]]
            ], // outer ring
        ];
        return latlngs2233
    }
    const runAnime = () => {
        var arr = []
        var latlngs2233 = processNewPath()
        state.pixiMask.forEach((item, index) => {
            arr.push(item.spline)
        })
        if (state.blobAddTempObject !== null) {
            const transformed = state.blobAddTempObject.getLatLngs().map(innerArray =>
                innerArray.map(item => [item.lat, item.lng])
            );
            arr.push(transformed)
        }
        if (state.workerTurf !== null) {
            state.workerTurf.postMessage({
                type: 'intersection',
                parameter: {
                    main: latlngs2233,
                    object: arr
                }
            })
        }
        requestAnimationFrame(runAnime);
    }
    // const call = (timestamp) => {
    runAnime()
}
// 狀態 = 新增ROI
const requestBtnGroupEvent = (e) => {
    console.log('requestBtnGroupEvent', e);
    var data = e.type
    var mainGroupID = e.mainGroupData !== undefined ? e.mainGroupData.roi_mainGroup_id : null
    var subGroupID = e.subGroupData !== undefined ? e.subGroupData.roi_subGroup_id : null
    state.addroiGroupInputStatus = e.mainGroupData === undefined
    state.selectMainGroupValue = mainGroupID
    state.selectSubGroupValue = subGroupID
    if (data !== 'remove') {
        // state.removeAddRoistatus()
        removeAddRoiStatus()
        const runMask = () => {
            if (data === 'mask-scope') {
                state.scopeTempAddObject = null
                state.scopeStatusAdd = true
                state.dragObjectStatus = false
            } else if (data === 'mask-polygon') {
                state.blobStatusAdd = true
                state.dragObjectStatus = false
            } else if (data === 'mask-blob') {
                state.blobStatusAdd = true
                state.dragObjectStatus = false
            }
        }
        if (data !== 'blob') {
            document.body.style.setProperty('cursor', 'crosshair', 'important');
        }
        if (data === 'spot') {
            state.spotStatusAdd = true
            state.dragObjectStatus = false
        } else if (data === 'scope') {
            state.scopeTempAddObject = null
            state.scopeStatusAdd = true
            state.dragObjectStatus = false
        } else if (data === 'line') {
            state.lineTempAddObject = null
            state.lineStatusAdd = true
            state.dragObjectStatus = false
        } else if (data === 'blob') {
            // state.blobAddSwitch()
            state.blobStatusAdd = true
            state.dragObjectStatus = false
        } else if (data === 'mask-scope') {
            // console.log('add mask-scope');
            runMask()
        } else if (data === 'mask-polygon') {
            // console.log('add mask-polygon');
            runMask()
        } else if (data === 'mask-blob') {
            // console.log('add mask-blob');
            runMask()
        } else if (data === 'aiSpot') {
            state.aiSpotTempblobObject.forEach((item) => {
                item.remove()
            })
            state.aiSpotTempblobObject = []
            state.aiSpotTempPointObject.forEach((item) => {
                item.remove()
            })
            state.aiSpotTempPointObject = []
            state.aiSpotStatusAdd = true // 開啟ai點新增狀態
            state.aiSpotStatus = -1 // 初始化 ai 新增/刪除模式
            state.aiSpotSavePoints = []
            state.aiSpotTempblobObject = []
            state.aiSpotTemppathObject = []
            // const divA = aispotControl.value;
            // const divB = LMmap.value.root;
            // 獲取 div B 的位置信息
            // const rectB = divB.getBoundingClientRect();

            // 設置 div A 的絕對定位，使其左下角對齊到 div B 的右下角
            // divA.style.left = `${rectB.right - divA.offsetWidth}px`;
            // divA.style.top = `${rectB.top}px`;
            // 新增元件
            // aispotControl.value.addChild()
        } else if (data === 'roiMorphs') {
            console.log('roiMorphs');
            // 先初始化
            state.roiMorphStatusAdd = true
            state.roiMorphTempblobObject.forEach((item) => {
                if (item.objectMarker !== null) {
                    item.objectMarker.remove()
                }
            })
            state.roiMorphsave.forEach((item) => {
                item.remove()
            })
            state.roiMorphTempblobObject = []
            state.roiMorphsave = []
        } else if (data === 'roiRander') {
            console.log('roiRander');
            // 先初始化
            state.roiRanderStatusAdd = true
            state.roiRanderTempblobObject.forEach((item) => {
                if (item.objectMarker !== null) {
                    item.objectMarker.remove()
                }
            })
            state.roiRandersave.forEach((item) => {
                item.remove()
            })
            state.roiRanderTempblobObject = []
            state.roiMorphsave = []
        } else if (data === 'roiRanderClear') {
            roiRandersendItems(0)
            state.roiRanderStatusAdd = false
            state.roiRanderTempblobObject.forEach((item) => {
                if (item.objectMarker !== null) {
                    item.objectMarker.remove()
                }
            })
            state.roiRandersave.forEach((item) => {
                item.remove()
            })
            state.roiRanderTempblobObject = []
            state.roiMorphsave = []
        }

        // const targetElement = document.querySelector('.map-top-b');
        // targetElement.classList.add('map-top-c');
        // thi?s.$store.dispatch('myData/incrementAsync', { type: 'addSnackbar', params: { text: `進入新增${data}物件模式，取消此模式請在串流畫面中點擊滑鼠右鍵`, type: 3, timeout: 0, session: 'ADD' } });
    } else {
        var stateSpotData = {
            type: 'ROI',
            method: 'modify',
            // cam_id: state.$route.query.cam,
            session: Math.random().toString(36).substr(2),
            content: {
                RoiType: 'removeAll',
            },
        }
        // emit('maskloing', true)
        state.ws3.send(JSON.stringify(stateSpotData))
    }
}
const removeAddRoiStatus = (e) => {
    if (state.spotStatusAdd || state.scopeStatusAdd || state.lineStatusAdd || state.blobStatusAdd)
        // state.$store.dispatch('myData/incrementAsync', { type: 'addSnackbar', params: { text: '已點擊滑鼠右鍵取消新增ROI模式', type: 2, timeout: 1 } });
        if (state.spotStatusAdd) {
            state.spotStatusAdd = false
            state.dragObjectStatus = true
        }
    if (state.lineStatusAdd) {
        if (state.lineTempAddObject !== null) {
            state.lineTempAddObject.remove()
            state.lineTempAddObject = null
        }
        state.lineTempAddLocation = []
        state.lineStatusAdd = false
        state.dragObjectStatus = true
    }
    if (state.scopeStatusAdd) {
        if (state.scopeTempAddObject !== null) {
            state.scopeTempAddObject.remove()
            state.scopeTempAddObject = null
        }
        state.scopeTempAddLocation = []
        state.scopeStatusAdd = false
        state.dragObjectStatus = true
    }
    if (state.aiSpotStatusAdd) {
        state.aiSpotStatusAdd = false // 開啟ai點新增狀態
        state.aiSpotTempblobObject.forEach((item) => {
            item.remove()
        })
        state.aiSpotTempblobObject = []
        state.aiSpotTempPointObject.forEach((item) => {
            item.remove()
        })
        state.aiSpotTempPointObject = []
        state.aiSpotStatus = -1 // 初始化 ai 新增/刪除模式
        state.aiSpotSavePoints = []
        state.aiSpotTempblobObject = []
        state.aiSpotTemppathObject = []
    }
    if (state.blobStatusAdd !== null) {
        state.moveRemovePoint = false
        state.AddTempPoints = []
        if (state.blobAddTempObject !== null) {
            state.blobAddTempObject.remove()
            state.blobAddTempObject = null
        }
        if (state.removePoint !== null) {
            state.removePoint.remove()
            state.removePoint = null
        }
        state.blobStatusAdd = false;
        state.dragObjectStatus = true
    }
}
const onCanvasDown = (e) => {
    var width = state.imgWidth
    var height = state.imgHeight
    var x = e.latlng.lng
    var y = e.latlng.lat
    if (y > 0) {
        y = 0
    } else if (y < state.imgHeight) {
        y = state.imgHeight
    }
    // 新增
    if (state.spotStatusAdd) {
        var tempAddSpot = {
            "feature": "roi",
            "method": "set_roiExist",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "curd_type": 1,
                "roi_type": "spot",
                "camera_id": camID,
                "cursingPoint_id": props.cursingPointValue,
                "image_type": camType,
                "field_id": 1,
                "roi_nodeManual": [
                    x / width,
                    y / height,
                ],
                "roi_name": state.reNameValue,
                "roi_alarmSwitch": state.tempAlarmSwitch ? 1 : 0,
                "roi_mainGroup_id": state.selectMainGroupValue,
                "roi_subGroup_id": state.selectSubGroupValue,
            }
        }
        state.tempROIdata = tempAddSpot
        state.inputRoiNameWindow = true
        state.spotStatusAdd = false
        state.dragObjectStatus = true
        document.body.style.cursor = 'auto'
    }
    if (state.lineStatusAdd) {
        state.lineTempAddLocation.push([y, x])
        if (state.lineTempAddLocation.length === 1) {
            var latlngs = [
                [y, x],
                [y, x],
            ];
            state.lineTempAddObject = L.polyline(latlngs, { color: '#fff' }).addTo(map);
        } else if (state.lineTempAddLocation.length === 2) {
            var newLocation = state.lineTempAddObject.getLatLngs()
            var tempAddLine = {
                "feature": "roi",
                "method": "set_roiExist",
                "session": Math.random().toString(36).substr(2),
                "content": {
                    "curd_type": 1,
                    "roi_type": "line",
                    "camera_id": camID,
                    "cursingPoint_id": props.cursingPointValue,
                    "image_type": camType,
                    "field_id": 1,
                    "roi_nodeManual": [
                        newLocation[0].lng / width,
                        newLocation[0].lat / height,
                        newLocation[1].lng / width,
                        newLocation[1].lat / height
                    ],
                    "roi_name": state.reNameValue,
                    "roi_alarmSwitch": state.tempAlarmSwitch ? 1 : 0,
                    "roi_mainGroup_id": state.selectMainGroupValue,
                    "roi_subGroup_id": state.selectSubGroupValue
                }
            }
            // state.ws3.send(JSON.stringify(tempAddLine))
            state.tempROIdata = tempAddLine
            state.inputRoiNameWindow = true
            state.lineTempAddObject.remove()
            state.lineTempAddObject = null
            state.lineTempAddLocation = []
            state.lineStatusAdd = false
            state.dragObjectStatus = true
            // state.$store.dispatch('myData/incrementAsync', { type: 'addSnackbar', params: { text: 'line 完成新增', type: 0, timeout: 1 } });
        }
    }
    if (state.scopeStatusAdd) {
        state.scopeTempAddLocation.push([y, x])
        if (state.scopeTempAddLocation.length === 1) {
            var bounds = [
                [y, x],
                [y, x],
            ];
            state.scopeTempAddObject = L.rectangle(bounds, { color: "#fff", weight: 1 }).addTo(map);
        } else if (state.scopeTempAddLocation.length === 2) {
            var newLocation = state.scopeTempAddObject.getLatLngs()
            var tempAddscope = {
                "feature": "roi",
                "method": "set_roiExist",
                "session": Math.random().toString(36).substr(2),
                "content": {
                    "camera_id": camID,
                    "cursingPoint_id": props.cursingPointValue,
                    "image_type": camType,
                    "curd_type": 1,
                    "roi_type": "scope",
                    "field_id": 1,
                    "roi_nodeManual": [
                        newLocation[0][1].lng / width,
                        newLocation[0][1].lat / height,
                        newLocation[0][3].lng / width,
                        newLocation[0][3].lat / height
                    ],
                    "roi_name": state.reNameValue,
                    "roi_alarmSwitch": state.tempAlarmSwitch ? 1 : 0,
                    "roi_mainGroup_id": state.selectMainGroupValue,
                    "roi_subGroup_id": state.selectSubGroupValue,
                }
            }
            // state.ws3.send(JSON.stringify(tempAddscope))
            state.tempROIdata = tempAddscope
            state.inputRoiNameWindow = true
            state.scopeTempAddObject.remove()
            state.scopeTempAddObject = null
            state.scopeTempAddLocation = []
            state.scopeStatusAdd = false
            state.dragObjectStatus = true
            // state.$store.dispatch('myData/incrementAsync', { type: 'addSnackbar', params: { text: 'scope 完成新增', type: 0, timeout: 1 } });
        }
    }
    if (state.aiSpotStatusAdd) {
        if (state.aiSpotStatus === -1) {
            console.log('沒有按下')
            state.isFlashing = true;

            // 在 500 毫秒後移除閃爍效果
            setTimeout(() => {
                state.isFlashing = false;
            }, 500);
        } else {
            let myIcon1Html = `<div class="aiMarker" style="background-color:rgb(${state.aiSpotStatus === 1 ? '0,244,0' : '244,0,0'});"></div>`
            let myIcon1 = L.divIcon({ html: myIcon1Html });
            let point = L.marker([y, x], { icon: myIcon1, draggable: false }).addTo(map);
            state.aiSpotTempPointObject.push(point)
            state.aiSpotSavePoints.push([
                state.aiSpotStatus,
                [x / width, y / height]
            ])
        }
        if (state.aiSpotSavePoints.length > 0) {
            var output = {
                "feature": "roi",
                "method": "query_nodes_aiSpots",
                "session": Math.random().toString(36).substr(2),
                "content": {
                    "camera_id": camID,
                    "label_type": [],
                    "roi_nodeManual_spots": [],
                }
            }
            state.aiSpotSavePoints.forEach((item) => {
                output.content.label_type.push(item[0])
                output.content.roi_nodeManual_spots.push(item[1])
            })
            state.ws3.send(JSON.stringify(output))
        }
    }
    if (state.blobStatusAdd && state.removePoint === null) {
        // state.removePoint = 
        var latlngs = [[y, x], [y, x]];
        var tempblob = L.polygon(latlngs, { color: '#fff' }).addTo(map);
        var myIcon = L.divIcon({ html: `<div class="removepoint"></div>` });
        var removePoint = L.marker([y, x], { icon: myIcon, draggable: false }).addTo(map);
        removePoint.on('mouseover', e => { state.moveRemovePoint = true })
        removePoint.on('mouseout', e => { state.moveRemovePoint = false })
        removePoint.on('click', e => { endAddBlob() })
        state.removePoint = removePoint
        state.AddTempPoints.push(x, y)

        state.blobAddTempObject = tempblob
    } else if (state.blobStatusAdd && state.removePoint !== null) {
        if (!state.moveRemovePoint) {
            state.AddTempPoints.push(x, y)
        }
    }
    // 修改
    // e.target.eachLayer(function (layer) {
    //     console.log(layer);
    // });
}
const saveAIBLOB = () => {
    var reqdata = {
        "feature": "roi",
        "method": "set_roiExist",
        "session": Math.random().toString(36).substr(2),
        "content": {
            "camera_id": camID,
            "cursingPoint_id": props.cursingPointValue,
            "image_type": camType,
            "curd_type": 1,
            "roi_type": "blob",
            "field_id": 1,
            "roi_nodeManual": state.aiSpotTemppathObject,
            "roi_name": state.reNameValue,
            "roi_alarmSwitch": state.tempAlarmSwitch ? 1 : 0,
            "roi_mainGroup_id": state.selectMainGroupValue,
            "roi_subGroup_id": state.selectSubGroupValue
        }
    }
    // var reqdata = {
    //     "type": "masking_add",
    //     "points": [tttt]
    // }
    // console.log(reqdata);
    // state.ws3.send(JSON.stringify(reqdata))
    state.tempROIdata = reqdata
    state.inputRoiNameWindow = true
    state.aiSpotTempblobObject.forEach((item) => {
        item.remove()
    })
    state.aiSpotTempblobObject = []
    state.aiSpotTempPointObject.forEach((item) => {
        item.remove()
    })
    state.aiSpotTempPointObject = []
    state.aiSpotStatusAdd = false // 開啟ai點新增狀態
    state.aiSpotStatus = -1 // 初始化 ai 新增/刪除模式
    state.aiSpotSavePoints = []
    state.aiSpotTempblobObject = []
    // state.aiSpotTemppathObject = []
}
const inputRoiName = (e) => {
    if (e === 'save') {
        state.tempROIdata.content.roi_name = state.reNameValue
        state.tempROIdata.content.roi_mainGroup_id = state.selectMainGroupValue
        state.tempROIdata.content.roi_subGroup_id = state.selectSubGroupValue
        state.ws3.send(JSON.stringify(state.tempROIdata))
    }
    state.reNameValue = ''
    state.tempROIdata = {}
    state.inputRoiNameWindow = false
    state.selectMainGroupValue = null
    state.selectSubGroupValue = null
}
const roundDown = (num, decimal) => {
    return Math.floor((num + Number.EPSILON) * Math.pow(10, decimal)) / Math.pow(10, decimal);
}
const runSpot = (data) => {
    var len = data.length
    // console.log(data, len);
    var oldData = state.pixispot
    var oldDataLen = state.pixispot.length
    try {
        for (var z = 0; z < oldDataLen; z++) {
            var selectRoi1 = data.find((item) => item.number.toString() === oldData[z].data.number.toString())
            if (selectRoi1 === undefined) {
                // oldData[z].pixi.destroy()
                // console.log('spot object', oldData[z].pixi);
                // oldData[z].pixi.eachLayer((layer) => {
                //     layer.off();               // 移除事件監聽器
                //     map.removeLayer(layer);    // 從地圖上移除
                // });
                // oldData[z].pixi.remove()
                removeObject(oldData[z].pixi)
                oldData = oldData.filter(obj => obj.data.number !== oldData[z].data.number);
            }
            selectRoi1 = null
        }
    } catch (error) {
        console.log("Spot function", error);
    }
    for (var x = 0; x < len; x++) {
        var spotfindIndex = oldData.findIndex((item) => item.data.number.toString() === data[x].number.toString())
        data[x].temperature = roundDown(data[x].temperature, 1)
        if (spotfindIndex !== -1) {
            var newAlarm = data[x].alarm_status === 1 && data[x].temperature >= data[x].threshold
            var oldAlarm = oldData[spotfindIndex].data.alarm_status === 1 && oldData[spotfindIndex].data.temperature >= oldData[spotfindIndex].data.threshold
            if (
                JSON.stringify(data[x].position) === JSON.stringify(oldData[spotfindIndex].data.position)
                && newAlarm === oldAlarm
            ) {
                oldData[spotfindIndex].data = data[x]
            } else {
                // oldData[spotfindIndex].pixi.destroy()
                removeObject(oldData[spotfindIndex].pixi)
                // oldData[spotfindIndex].pixi.remove()
                oldData[spotfindIndex].data = data[x]
                oldData[spotfindIndex].pixi = addpoint({ x: data[x].position.x, y: data[x].position.y, tempPointID: oldData[spotfindIndex].tempPointID }, data[x], 'spot', true)
            }
            newAlarm = null
            oldAlarm = null
        } else {
            if (map !== null) {
                var tempPointID = Math.random().toString(36).substr(2)
                var temppixijsdata = addpoint({ x: data[x].position.x, y: data[x].position.y, tempPointID }, data[x], 'spot', true)
                oldData.push({
                    data: data[x],
                    pixi: temppixijsdata,
                    tempPointID
                })
            }
            // temppixijsdata = null
        }
        spotfindIndex = null
    }
    state.pixispot = oldData
    len = null
    oldData = null
    oldDataLen = null
}
const addpoint = (data, roidata, name, dragging) => {
    var tempPointID = data.tempPointID
    var width = state.imgWidth
    var height = state.imgHeight
    var imgurl = '/images/spot_1.png'
    var group = L.layerGroup().addTo(map);
    var myIcon = L.icon({
        iconUrl: imgurl,
        iconSize: [33, 33],
        iconAnchor: [16.5, 16.5],
    });
    var opacity = props.mainMode === 'mask' ? 0.3 : 1
    var draggable = props.mainMode === 'mask' || props.mainMode === 'review' ? false : true
    var myIcon1Html = `<div class="bum-main"><div class="alarm-point" id="bum-main-${tempPointID}"></div><div class="spot-div-number">${roidata.number}</div></div>`
    var tempNumPointDivHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}">(-)</div></div>`
    var myIcon1 = L.divIcon({ html: myIcon1Html });
    // var tempNumPointDivHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}">0</div></div><div class="temperature-bar-canvas"><div class="temperature-bar" id="temperature-bar-${tempPointID}"></div></div></div>`
    var tempNumPointDiv = L.divIcon({ html: tempNumPointDivHtml });
    var number = L.marker([data.y * height, data.x * width], { icon: myIcon1, draggable, opacity }).addTo(group);
    var tempNumPoint = L.marker([data.y * height, data.x * width], { icon: tempNumPointDiv, draggable: false, opacity }).addTo(group); // 
    var point = L.marker([data.y * height, data.x * width], { icon: myIcon, draggable, opacity }).addTo(group);
    myIcon1Html = null
    tempNumPointDivHtml = null
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
            pushSpot({ location: e.target.getLatLng(), id: roidata.number })
            state.dragObjectStatus = true
        });
    };
    // if (props.mainMode !== 'review') {
    addDragHandlers(point, number);
    addDragHandlers(number, point);
    // }
    // var alarm = false
    // var color = '#ffffff'
    // var number = 'R'
    // if (name === 'spot') {
    //     number = roidata.number
    // }
    // if (roidata.alarm_status === 1 && roidata.temperature >= roidata.threshold) {
    //     imgurl = '/images/spot_1_red.png'
    //     color = '#B82E40'
    //     alarm = true
    // }
    // var group = new PIXI.Container();
    // state.appPixi.stage.addChild(group);
    // group.x = data.x * width;
    // group.y = data.y * height;
    // group.name = name
    // if (name === 'spot') {
    //     group.custom = {
    //         number
    //     }
    // }
    // group.interactive = dragging;
    // group.cursor = dragging ? 'pointer' : 'auto';
    // var newSprite = PIXI.Sprite.from(imgurl);
    // group.addChild(newSprite);
    // newSprite.x = -16.5
    // newSprite.y = -16.5
    // var graphics = new PIXI.Graphics();
    // if (!alarm) {
    //     graphics.lineStyle(1, "rgb(0,0,0)", 1);
    // }
    // graphics.beginFill(color, 1);
    // graphics.drawCircle(-20, -20, 10);
    // graphics.endFill();
    // group.addChild(graphics);
    // var style = new PIXI.TextStyle({
    //     fontSize: 16,
    // });
    // var basicText = new PIXI.Text(number, style);
    // if (parseInt(number) < 10 || number === 'R') {
    //     basicText.x = -25.5;
    //     basicText.y = -28.5;
    // } else {
    //     basicText.x = -29.5;
    //     basicText.y = -28.5;
    // }
    // group.addChild(basicText);
    // group.on('mousedown', (e) => { state.onDragStart(e, 'spot') });
    return group
}
const pushSpot = (data) => {
    var width = state.imgWidth
    var height = state.imgHeight
    var findindex1 = state.pixispot.findIndex((item) => parseInt(item.data.number) === parseInt(data.id))
    var newPosition = {
        x: data.location.lng / width,
        y: data.location.lat / height
    }
    // state.pixispot[findindex1].position = newPosition
    var stateSpotData = {
        feature: 'roi',
        method: 'set_roiNodes',
        // cam_id: state.$route.query.cam,
        session: Math.random().toString(36).substr(2),
        content: {
            field_id: 1,
            camera_id: camID,
            cursingPoint_id: props.cursingPointValue,
            image_type: 'ir',
            roi_id: parseInt(data.id),
            // alarm_status: state.pixispot[findindex1].data.alarm_status,
            // threshold: state.pixispot[findindex1].data.threshold,
            // group_name: '',
            // group_id: '',
            roi_nodeManual: [
                parseFloat(newPosition.x),
                parseFloat(newPosition.y)
            ]
            // points: {
            //     A: {
            //         x: [parseFloat(newPosition.x)],
            //         y: [parseFloat(newPosition.y)]
            //     },
            //     B: {
            //         x: [],
            //         y: []
            //     }
            // }
        },
    }
    // state.$emit('maskloing', true)
    state.ws3.send(JSON.stringify(stateSpotData))
    // state.$store.dispatch('myData/incrementAsync', { type: 'addSnackbar', params: { text: 'SPOT 已更新', type: 0, timeout: 1 } });
    // state.tempSetScopenumber = null
    // state.newSpotLocation = { x: 0, y: 0 }
    // findindex1 = null
    // newPosition = null
    // stateSpotData = null
    // canvas = null
}
const runLine = (data) => {
    var len = data.length
    var oldData = state.pixiline
    var oldDataLen = state.pixiline.length
    try {
        for (var z1 = 0; z1 < oldDataLen; z1++) {
            var selectRoi1 = data.find((item) => JSON.stringify(item.number) === JSON.stringify(oldData[z1].data.number))
            if (selectRoi1 === undefined) {
                // oldData[z1].pixi.remove()
                removeObject(oldData[z1].pixi)
                oldData = oldData.filter(obj => obj.data.number !== oldData[z1].data.number);
            }
            selectRoi1 = null
        }
    } catch (error) {
        console.log("runLine function", error);
    }
    // var oldDataLen = state.line.length
    for (var x = 0; x < len; x++) {
        data[x].temperature_max = roundDown(data[x].temperature_max, 1)
        var linefindIndex = oldData.findIndex((item) => item.data.number.toString() === data[x].number.toString())
        if (linefindIndex !== -1) {
            var newAlarm = data[x].alarm_status === 1 && data[x].temperature_max >= data[x].threshold
            var oldAlarm = oldData[linefindIndex].data.alarm_status === 1 && oldData[linefindIndex].data.temperature_max >= oldData[linefindIndex].data.threshold
            if (
                JSON.stringify(data[x].position_point_A) === JSON.stringify(oldData[linefindIndex].data.position_point_A) && JSON.stringify(data[x].position_point_B) === JSON.stringify(oldData[linefindIndex].data.position_point_B)
                && newAlarm === oldAlarm
            ) {
                oldData[linefindIndex].data = data[x]
            } else {
                // oldData[linefindIndex].pixi.remove()
                removeObject(oldData[linefindIndex].pixi)
                oldData[linefindIndex].data = data[x]
                oldData[linefindIndex].pixi = pixiaddLine(data[x], 'line', tempPointID = oldData[linefindIndex].tempPointID)
            }
            newAlarm = null
            oldAlarm = null
        } else {
            var tempPointID = Math.random().toString(36).substr(2)
            oldData.push({
                data: data[x],
                pixi: pixiaddLine(data[x], 'line', tempPointID),
                tempPointID
            })
        }
        linefindIndex = null
    }
    state.pixiline = oldData
    len = null
    oldData = null
    oldDataLen = null
}
const pixiaddLine = (data, name, tempPointID) => {
    var width = state.imgWidth
    var height = state.imgHeight
    // var tempPointID = data.tempPointID
    // console.log(tempPointID);
    var group = L.layerGroup().addTo(map);
    var latlngs = [
        [data.position_point_A.y * height, data.position_point_A.x * width],
        [data.position_point_B.y * height, data.position_point_B.x * width],
    ]
    var opacity = props.mainMode === 'mask' ? 0.3 : 1
    var draggable = props.mainMode === 'mask' || props.mainMode === 'review' ? false : true
    var lines = []
    lines[0] = L.polyline(latlngs, {
        stroke: true,
        weight: 3,
        color: '#000',
    }).addTo(group);
    lines[1] = L.polyline(latlngs, {
        stroke: true,
        weight: 2,
        color: '#fff',
    }).addTo(group);
    // var tempNumPointDivHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}">0</div></div><div class="temperature-bar-canvas"><div class="temperature-bar" id="temperature-bar-${tempPointID}"></div></div></div>`
    // var myIconHtml = `<div class="spot-div-number">${data.number}</div>`
    var myIconHtml = `<div class="bum-main"><div class="alarm-point" id="bum-main-${tempPointID}"></div><div class="spot-div-number">${data.number}</div></div>`
    var tempNumPointDivHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}">(-)</div></div>`
    var myPointHtml = `<div class="div-point"></div>`
    var tempNumPointDiv = L.divIcon({ html: tempNumPointDivHtml });
    var tempNumPoint = L.marker([data.position_point_B.y * height, data.position_point_B.x * width], { icon: tempNumPointDiv, draggable: false, opacity }).addTo(group);
    var myIcon = L.divIcon({ html: myIconHtml });
    var myPoint = L.divIcon({ html: myPointHtml });
    var numberPoint = L.marker([data.position_point_B.y * height, data.position_point_B.x * width], { icon: myIcon, draggable, opacity }).addTo(group);
    var pointB = L.marker([data.position_point_B.y * height, data.position_point_B.x * width], { icon: myPoint, draggable, opacity }).addTo(group);
    var pointA = L.marker([data.position_point_A.y * height, data.position_point_A.x * width], { icon: myPoint, draggable, opacity }).addTo(group);
    tempNumPointDivHtml = null
    myIconHtml = null
    myPointHtml = null
    const addDragHandlers = (draggableElement, targetLinesElement, notmovedElement, type) => {
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
            pushline({ location: latlngs, id: data.number })
            state.dragObjectStatus = true
        });
    };
    addDragHandlers(pointB, lines, pointA, 'B');
    addDragHandlers(pointA, lines, pointB, 'A');
    return group
}
const pushline = (e) => {
    var width = state.imgWidth
    var height = state.imgHeight
    // var canvas = document.getElementById(state.canvasId)
    var findindex = state.pixiline.findIndex((item) => parseInt(item.data.number) === parseInt(e.id))
    var data = state.pixiline[findindex].data
    var LineData = {
        feature: 'roi',
        method: 'set_roiNodes',
        session: Math.random().toString(36).substr(2),
        content: {
            field_id: 1,
            image_type: 'ir',
            camera_id: camID,
            cursingPoint_id: props.cursingPointValue,
            // RoiType: 'line',
            roi_id: data.number,
            roi_nodeManual: [
                e.location[0].lng / width,
                e.location[0].lat / height,
                e.location[1].lng / width,
                e.location[1].lat / height
            ]
            // alarm_status: data.alarm_status,
            // threshold: data.threshold,
            // group_name: '',
            // group_id: '',
            // points: {
            //     A: {
            //         x: [e.location[0].lng / width],
            //         y: [e.location[0].lat / height]
            //     },
            //     B: {
            //         x: [e.location[1].lng / width],
            //         y: [e.location[1].lat / height]
            //     }
            // }
        },
    }
    // state.$emit('maskloing', true)
    state.ws3.send(JSON.stringify(LineData))
    // state.$store.dispatch('myData/incrementAsync', { type: 'addSnackbar', params: { text: 'LINE 已更新', type: 0, timeout: 1 } });
    // findindex = null
    // data = null
    // LineData = null
    // canvas = null
}
const runScope = (data) => {
    var len = data.length
    var oldData = state.pixiscope
    var oldDataLen = state.pixiscope.length
    try {
        for (var z1 = 0; z1 < oldDataLen; z1++) {
            var selectRoi1 = data.find((item) => JSON.stringify(item.number) === JSON.stringify(oldData[z1].data.number))
            if (selectRoi1 === undefined) {
                // oldData[z1].pixi.remove()
                removeObject(oldData[z1].pixi)
                oldData = oldData.filter(obj => obj.data.number !== oldData[z1].data.number);
            }
            selectRoi1 = null
        }
    } catch (error) {
        console.log(error);
    }
    for (var x = 0; x < len; x++) {
        data[x].temperature_max = roundDown(data[x].temperature_max, 1)
        var scopefindIndex = oldData.findIndex((item) => item.data.number.toString() === data[x].number.toString())
        if (scopefindIndex !== -1) {
            // 超溫判斷
            var newAlarm = data[x].alarm_status === 1 && data[x].temperature_max >= data[x].threshold
            var oldAlarm = oldData[scopefindIndex].data.alarm_status === 1 && oldData[scopefindIndex].data.temperature_max >= oldData[scopefindIndex].data.threshold
            if (
                JSON.stringify(data[x].position_point_A) === JSON.stringify(oldData[scopefindIndex].data.position_point_A)
                && JSON.stringify(data[x].position_point_B) === JSON.stringify(oldData[scopefindIndex].data.position_point_B)
                && JSON.stringify(data[x].approval) === JSON.stringify(oldData[scopefindIndex].data.approval)
                && JSON.stringify(data[x].alarm_status) === JSON.stringify(oldData[scopefindIndex].data.alarm_status)
                && newAlarm === oldAlarm
            ) {
                oldData[scopefindIndex].data = data[x]
            } else {
                // oldData[scopefindIndex].pixi.remove()
                removeObject(oldData[scopefindIndex].pixi)
                oldData[scopefindIndex].data = data[x]
                let groupInfo = pixiaddScope(data[x], 'scope', tempPointID = oldData[scopefindIndex].tempPointID)
                oldData[scopefindIndex].pixi = groupInfo
                // 取代選取陣列中的物件
                let findFocusObject = state.focusObjectList.scope.findIndex((item) => item.options.id === groupInfo.options.id)
                if (findFocusObject !== -1) {
                    state.focusObjectList.scope[findFocusObject] = groupInfo
                }
                // 取代選取陣列中的物件 end
            }
            newAlarm = null
            oldAlarm = null
        } else {
            var tempPointID = Math.random().toString(36).substr(2)
            oldData.push({
                data: data[x],
                pixi: pixiaddScope(data[x], 'scope', tempPointID),
                tempPointID
            })
        }
        scopefindIndex = null
    }
    state.pixiscope = oldData
    len = null
    oldData = null
    oldDataLen = null
}
const pixiaddScope = (data, name, tempPointID) => {
    if (state.revisionObject.length > 0) {
        for (var z = 0; z < state.revisionObject.length; z++) {
            state.revisionObject[z].remove()
        }
        state.revisionObject = []
    }
    var width = state.imgWidth
    var height = state.imgHeight
    var group = L.layerGroup([], { type: 'scope', id: `scope${data.number}`, data }).addTo(map);
    var bounds = [
        [data.position_point_B.y * height, data.position_point_B.x * width],
        [data.position_point_A.y * height, data.position_point_A.x * width]
    ];
    var opacity = props.mainMode === 'mask' ? 0.3 : 1
    // 物件新增
    // var iconHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}">0</div></div><div class="temperature-bar-canvas"><div class="temperature-bar" id="temperature-bar-${tempPointID}"></div></div></div>`
    // var myIconHtml = `<div class="spot-div-number">${data.number}</div>`
    var myIconHtml = `<div class="bum-main"><div class="alarm-point" id="bum-main-${tempPointID}"></div><div class="spot-div-number">${data.number}</div></div>`
    var iconHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}">(-)</div></div>`

    var tempNumPointDiv = L.divIcon({ html: iconHtml });
    var tempNumPoint = L.marker([data.position_point_A.y * height, data.position_point_A.x * width], { icon: tempNumPointDiv, draggable: false, opacity, id: `scope${data.number}` }).addTo(group);
    var myIcon = L.divIcon({ html: myIconHtml });
    var marker = L.marker([data.position_point_A.y * height, data.position_point_A.x * width], { icon: myIcon, objectType: 'icon', opacity, draggable: false, id: `scope${data.number}` }).addTo(group);
    var rectangleBorder1 = L.rectangle(bounds, { color: "#000", weight: 3, fill: false, objectType: 'rectangle', id: `scope${data.number}` }).addTo(group);
    var rectangleBorder2 = L.rectangle(bounds, { color: "#fff", weight: 2, fill: false, fillColor: 'rgb(255 0 0 / 50%)', objectType: 'rectangle', id: `scope${data.number}` }).addTo(group);
    // var rectangleBorder2 = L.rectangle(bounds, { color: "#fff", weight: 2, fill: data.alarm_status === 2, fillColor: 'rgb(255 0 0 / 50%)', objectType: 'rectangle', id: `scope${data.number}` }).addTo(group);
    var rectangular = L.rectangle(bounds, { color: "#fff00", weight: 2, fillOpacity: 0, objectType: 'rectangle', id: `scope${data.number}`, draggable: true }).addTo(group);
    tempNumPointDiv = null
    myIcon = null
    iconHtml = null
    myIconHtml = null
    // var checkChangeBoxDiv = L.divIcon({ html: `<div class="temperature-bar-main">123</div>` });
    // var checkChangeBox = L.marker([data.position_point_A.y * height, data.position_point_A.x * width], { icon: checkChangeBoxDiv, objectType: 'icon', opacity, draggable: false, id: `scope${data.number}` }).addTo(group);
    // 物件新增 END
    // rectangular.on('dblclick', (e) => {
    // var northEast = e.target.getBounds()._northEast
    // northEast.lat = -northEast.lat * 0.8
    // northEast.lng = northEast.lng * 0.8
    // e.target.getBounds()._northEast = northEast
    // var southWest = e.target.getBounds()._southWest
    // southWest.lat = -southWest.lat * 0.8
    // southWest.lng = southWest.lng * 0.8
    // e.target.getBounds()._southWest = southWest
    // state.map.fitBounds(e.target.getBounds())
    // })
    // 先關閉scope 監聽器
    if (true) {
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
        // const outputNewLoction = (getBounds) => {
        //     // var getBounds = e.target.getLatLngs()
        //     var newLocation = [
        //         [getBounds[0][1].lat, getBounds[0][1].lng],
        //         [getBounds[0][3].lat, getBounds[0][3].lng]
        //     ]
        //     moveStatus = false
        //     // state.dragObjectStatus = true
        //     pushScope(newLocation, data)
        //     // runResize(newLocation)
        // }
        rectangular.on('mousedown pointerdown', (e) => {
            if (props.mainMode === 'roi' && !state.blobStatusAdd && e.originalEvent.button === 0 && !state.roiMorphStatusAdd && !state.roiRanderStatusAdd) {
                // console.log('mdow roi');
                // state.createRevisionObject(data, 'scope', undefined, group)
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
                state.tempMouseDownScopeObject.data = data
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
                // 把物件新增到選框暫存中
                // var options = e.target.options
                // var find = state.focusObjectList.scope.findIndex((findItem) => findItem.options.id === options.id)
                // if (find === -1) {
                //     state.focusObjectList.scope.push(group)
                //     // state.focusObjectList.push(e.target)
                // } else {
                //     // 移除
                //     if (state.keyctrl) {
                //         state.focusObjectList.scope = state.focusObjectList.scope.filter(filterItem => filterItem.options.id !== options.id)
                //     }
                // }
            }
            // 新增膨脹
            if (state.roiMorphStatusAdd) {
                let LatLngs = e.target.getLatLngs()
                let bounds = e.target.getBounds()
                roiMorphsendItemstemp(data, bounds, LatLngs)
            }

            if (state.roiRanderStatusAdd) {
                let LatLngs = e.target.getLatLngs()
                let bounds = e.target.getBounds()
                roiRandersendItemstemp(data, bounds, LatLngs)
            }
        })
        // rectangular.on('drag', (e) => {
        //     console.log(e);
        // })
        // rectangular.on('mousemove', (e) => {

        // })
        // rectangular.on('mousemove', (e) => {
        // console.log(e);
        // e.setLatLngs([[0, 0], [0, 0]])
        //     if (moveStatus) {
        //         var y = state.tempMouseDownScopelnglat.lat - e.latlng.lat
        //         var x = state.tempMouseDownScopelnglat.lng - e.latlng.lng
        //         var temp1 = JSON.stringify(tmepBounds)
        //         var temp = JSON.parse(temp1)
        //         for (var i = 0; i < tmepBounds[0].length; i++) {
        //             temp[0][i].lat = tmepBounds[0][i].lat - y
        //             temp[0][i].lng = tmepBounds[0][i].lng - x
        //         }
        //         var temp2 = JSON.stringify(tempmarker)
        //         var temp3 = JSON.parse(temp2)
        //         var markerNew = [
        //             temp3.lat - y,
        //             temp3.lng - x
        //         ]
        //         marker.setLatLng(markerNew)
        //         tempNumPoint.setLatLng(markerNew)
        //         e.target.setLatLngs(temp)
        //         rectangleBorder1.setLatLngs(temp)
        //         rectangleBorder2.setLatLngs(temp)
        //         // state.createRevisionObject(data, 'scope', temp, group)
        //         // var newLocation = [
        //         //     [temp[0][1].lat, temp[0][1].lng],
        //         //     [temp[0][3].lat, temp[0][3].lng]
        //         // ]s
        //         if (state.revisionObject.length > 0) {
        //             for (var z = 0; z < state.revisionObject.length; z++) {
        //                 state.revisionObject[z].remove()
        //             }
        //             state.revisionObject = []
        //         }
        //     }
        // })
        // rectangular.on('mouseup', (e) => {
        //     if (props.mainMode === 'roi') {
        //         var getBounds = e.target.getLatLngs()
        //         outputNewLoction(getBounds)
        //         createRevisionObject(data, 'scope', getBounds, group)
        //     }
        // })
        // rectangular.on('mouseout', (e) => {
        // if (!state.revisionObjectleave) {
        // var getBounds = e.target.getLatLngs()
        // var newLocation = [
        //     [getBounds[0][1].lat, getBounds[0][1].lng],
        //     [getBounds[0][3].lat, getBounds[0][3].lng]
        // ]
        // state.pushScope(newLocation, data)
        // moveStatus = false
        // state.dragObjectStatus = true
        // }
        // })
    }
    return group
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
                runScope([])
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
const runBlob = (data, objectName) => {
    // console.log('run blob ', data);
    var oldData = objectName === 'blob' ? state.pixiblob : state.pixiMask
    var oldDataLen = objectName === 'blob' ? state.pixiblob.length : state.pixiMask.length
    var newDataLen = data.length
    var pixiBlob = objectName === 'blob' ? state.pixiJsRoiBlobData : state.pixiJsRoiMaskData
    // 以下判斷ROI 是否遭到刪除
    try {
        for (var z = 0; z < oldDataLen; z++) {
            var selectRoi1 = data.find((item) => JSON.stringify(item.number) === JSON.stringify(oldData[z].number))
            if (selectRoi1 === undefined) {
                var pixiBlobfind = pixiBlob.findIndex((item) => item.info.number === oldData[z].number)
                var pixilen = pixiBlob[pixiBlobfind].pixi.length
                var pixibglen = pixiBlob[pixiBlobfind].pixibg.length
                var markerlen = pixiBlob[pixiBlobfind].marker.length
                for (var o = 0; o < pixilen; o++) {
                    pixiBlob[pixiBlobfind].pixi[o].remove()
                }
                for (var as1 = 0; as1 < markerlen; as1++) {
                    pixiBlob[pixiBlobfind].marker[as1].remove()
                }
                for (var as2 = 0; as2 < pixibglen; as2++) {
                    // pixiBlob[pixiBlobfind].pixibg[as2].destroy()
                }
                // pixiBlob[pixiBlobfind].pixi = []
                pixiBlob = pixiBlob.filter(obj => obj.info.number !== oldData[z].number);
                pixiBlobfind = null
                pixilen = null
                markerlen = null
                pixibglen = null
            }
            selectRoi1 = null
        }
    } catch (error) {
        console.log('判斷ROI 是否遭到刪除', error);
    }
    // 判斷
    for (var i = 0; i < newDataLen; i++) {
        data[i].temperature_max = roundDown(data[i].temperature_max, 1)
        var selectRoi = oldData.find((item) => JSON.stringify(item.number) === JSON.stringify(data[i].number))
        if (selectRoi !== undefined) {
            if (JSON.stringify(selectRoi.points) === JSON.stringify(data[i].points)
                && selectRoi.alarmStatus === data[i].alarmStatus
                && selectRoi.approval === data[i].approval
                && selectRoi.group_name === data[i].group_name
                && selectRoi.group_id === data[i].group_id
            ) {
                var pixiBlobfind12 = pixiBlob.findIndex((item) => JSON.stringify(item.info.number) === JSON.stringify(data[i].number))
                pixiBlob[pixiBlobfind12].info = data[i]
                pixiBlobfind12 = null
            } else {
                var olddata = pixiBlob.find((item) => JSON.stringify(item.info.number) === JSON.stringify(data[i].number))
                var oldpixilen = olddata.pixi.length
                for (var deletepixi = 0; deletepixi < oldpixilen; deletepixi++) {
                    olddata.pixi[deletepixi].remove()
                    // olddata.pixibg[deletepixi].destroy()
                    olddata.marker[deletepixi].remove()
                }
                var newpodata = []
                var newpodatabg1 = []
                var newmarkerdata = []
                // var tempPointID = Math.random().toString(36).substr(2)
                // newpodatabg1.push(state.ObjectChangedbg([data[i].spline, data[i].alarmStatus])) // 20230731 add spline bg
                newpodata.push(ObjectChanged([data[i].spline, data[i].alarmStatus], true, data[i], objectName))
                var pixiBlobfind1 = pixiBlob.findIndex((item) => JSON.stringify(item.info.number) === JSON.stringify(data[i].number))
                newmarkerdata.push(markerPointObjcet(data[i].markerPoint, data[i].d_number, data[i].alarmStatus, data[i], objectName, pixiBlob[pixiBlobfind1].tempPointID))
                pixiBlob[pixiBlobfind1].info = data[i]
                pixiBlob[pixiBlobfind1].pixi = newpodata
                pixiBlob[pixiBlobfind1].pixibg = newpodatabg1
                pixiBlob[pixiBlobfind1].marker = newmarkerdata
                olddata = null
                oldpixilen = null
                newpodata = null
                newpodatabg1 = null
                newmarkerdata = null
                pixiBlobfind1 = null
            }
        } else {
            var points = []
            var newpodatabg = []
            var marker = []
            var tempPointID = Math.random().toString(36).substr(2)
            // newpodatabg.push(state.ObjectChangedbg([data[i].spline, data[i].alarmStatus])) // 20230731 add spline bg
            points.push(ObjectChanged([data[i].spline, data[i].alarmStatus], true, data[i], objectName))
            marker.push(markerPointObjcet(data[i].markerPoint, data[i].d_number, data[i].alarmStatus, data[i], objectName, tempPointID))
            pixiBlob.push({
                info: data[i],
                pixi: points,
                pixibg: newpodatabg,
                marker,
                tempPointID
            })
            points = null
            marker = null
            newpodatabg = null
        }
        selectRoi = null
    }
    if (objectName === "blob") {
        state.pixiJsRoiBlobData = pixiBlob
        state.pixiblob = data
    } else if (objectName === "mask") {
        state.pixiJsRoiMaskData = pixiBlob
        state.pixiMask = data
    }
    oldData = null
    oldDataLen = null
    newDataLen = null
    pixiBlob = null
}
const ObjectChanged = (data, type, roidata, objectName) => {// 渲染BLOB 物件 
    var spline1 = L.layerGroup([], {
        type: objectName === 'mask' ? 'mask' : 'blob',
        id: `blob${roidata.number}`
    }).addTo(map);
    var latlngs = data[0];
    // console.log('latlngs', latlngs);
    var color = ['255 255 255', '255 232 27', '255 0 0', '255 107 0']
    // console.log('run blob', roidata);
    var roiAlarmStatus = roidata.approval // 0 = normal ; 1 = level 1 ; 2 = level 2 ; 3 = auto
    // if (approval === 1) {
    //     roiAlarmStatus = 3
    // } else if (approval === 0 && roidata.temperature_max >= roidata.temperature_point.median.start && roidata.temperature_max < roidata.temperature_point.median.end) {
    //     roiAlarmStatus = 1
    // } else if (approval === 0 && roidata.temperature_max >= roidata.temperature_point.median.start && roidata.temperature_max >= roidata.temperature_point.median.end) {
    //     roiAlarmStatus = 2
    // }
    // console.log('blob alarm', roiAlarmStatus, roidata.temperature_max, roidata.temperature_point.median.start, roidata.temperature_point.median.end);

    // var gradient = {
    //     0: 'red',
    //     0.5: 'yellow',
    //     1: 'green'
    // };
    if (state.blobPutTempPoint.length > 0) {
        for (var z = 0; z < state.blobPutTempPoint.length; z++) {
            state.blobPutTempPoint[z].remove()
        }
        state.blobPutTempPoint = []
    }
    var blob = L.polygon(latlngs, {
        color: `rgb(${color[roiAlarmStatus]} / 50%)`,
        data: roidata,
        fill: objectName === 'mask' && props.mainMode !== 'mask' ? false : 'depends',
        objectType: objectName === 'mask' ? 'mask' : 'blob'
    }).addTo(spline1);

    // fillRule: 'nonzero'
    // var blob = L.polygon(latlngs, { data: roidata }).addTo(spline1);
    // var addPoint = null
    // var testLine = null
    // blob.on('dblclick', e => map.fitBounds(e.target.getBounds()))
    blob.on('click', (e) => {
        //     if (props.mainMode !== 'review') {
        //         createBlobEditPoint(e.target)
        //     }
        // 新增膨脹
        if (state.roiMorphStatusAdd) {
            let LatLngs = blob.getLatLngs()
            let bounds = blob.getBounds()
            roiMorphsendItemstemp(roidata, bounds, LatLngs)
        }

        if (state.roiRanderStatusAdd) {
            let LatLngs = e.target.getLatLngs()
            let bounds = e.target.getBounds()
            roiRandersendItemstemp(data, bounds, LatLngs)
        }
    })
    // blob.on('mousedown', (e) => {
    //     // 把物件新增到選框暫存中
    //     if (props.mainMode !== 'review') {
    //         createBlobEditPoint(e.target)
    //     }
    //     var options = e.target.options
    //     if (!state.keyctrl) {
    //         state.focusObjectList = {
    //             spot: [],
    //             line: [],
    //             scope: [],
    //             blob: []
    //         }
    //     }
    //     var find = state.focusObjectList.blob.findIndex((findItem) => findItem.options.id === options.id)
    //     if (find === -1) {
    //         state.focusObjectList.blob.push(spline1)
    //         // console.log('add blob to focus list');
    //         // state.focusObjectList.push(e.target)
    //     } else {
    //         // 移除
    //         if (state.keyctrl) {
    //             state.focusObjectList.blob = state.focusObjectList.blob.filter(filterItem => filterItem.options.id !== options.id)
    //         }
    //     }
    // })
    // blob.on('mouseover', (e) => {
    //     e.target.setStyle({
    //         color: `rgb(${color[roiAlarmStatus]} / 70%)`
    //     })
    //     if (state.addPoint !== null) {
    //         state.addPoint.remove()
    //         state.addPoint = null
    //     }
    //     if (state.testLine !== null) {
    //         state.testLine.remove()
    //         state.testLine = null
    //     }

    //     var myIcon = L.divIcon({ html: `<div class="blob-div-addpoint"></div>` });
    //     state.addPoint = L.marker([0, 0], { icon: myIcon }).addTo(map);
    //     state.testLine = L.polyline([[0, 0], [1, 1]], { color: '#858585', interactive: false }).addTo(map);
    // })
    // blob.on('mousemove', (e) => {
    //     var latlng = e.latlng;
    //     var path = blob.getLatLngs();
    //     var closestPoint = L.GeometryUtil.closest(map, path, latlng);
    //     var latlngs = [
    //         [latlng.lat, latlng.lng],
    //         [closestPoint.lat, closestPoint.lng],
    //     ];
    //     state.addPoint.setLatLng(closestPoint)
    //     state.testLine.setLatLngs(latlngs)
    //     // console.log(testLine.getLatLngs());

    // })
    // blob.on('mouseout', (e) => {
    //     e.target.setStyle({
    //         color: `rgb(${color[roiAlarmStatus]} / 50%)`
    //     })
    //     if (state.addPoint !== null) {
    //         state.addPoint.remove()
    //         state.addPoint = null
    //     }
    //     if (state.testLine !== null) {
    //         state.testLine.remove()
    //         state.testLine = null
    //     }
    // })
    return spline1
}

const CheckPin = (() => {
    function makeIcon({
        size = 24,             // 直徑(px)
        color = '#22c55e',     // 圓形顏色（或外框色）
        checkColor = '#fff',   // 打勾顏色
        outlined = false,      // true=只外框；false=實心
        strokeWidth = 2        // 外框粗細(outlined=true時)
    } = {}) {
        const fill = outlined ? 'none' : color;
        const stroke = outlined ? color : 'none';
        const sw = outlined ? strokeWidth : 0;

        const html = `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block">
        <circle cx="12" cy="12" r="11" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
        <path d="M7 12.5l3 3.5 7-8"
              fill="none" stroke="${checkColor}" stroke-width="3"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

        return L.divIcon({
            className: 'check-pin-icon',        // 不額外加樣式，用 SVG 控制
            html,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]    // 讓標記以中心對準座標
        });
    }

    function create(latlng, options = {}, markerOptions = {}) {
        return L.marker(latlng, { icon: makeIcon(options), ...markerOptions });
    }

    function update(marker, options = {}) {
        marker.setIcon(makeIcon(options));    // Leaflet 1.x：更新 icon 用 setIcon
    }

    return { create, update };
})();
const markerPointObjcet = (data, number, alarm, roidata, objectName, tempPointID) => { // 渲染BLOB編號 物件
    // console.log(tempPointID);
    var opacity = props.mainMode === 'mask' && objectName !== 'mask' ? 0.3 : 1
    var group = L.layerGroup().addTo(map);
    var myIconHtml = `<div class="bum-main" ><div class="alarm-point" id="bum-main-${tempPointID}"></div><div class="spot-div-number">${number}</div></div>`

    // var myIconHtml = `<div class="spot-div-number">${number}</div>`
    var myIcon = L.divIcon({ html: myIconHtml });
    if (objectName !== 'mask') {
        var tempNumPointDivHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}">(-)</div></div>`

        // var tempNumPointDivHtml = `<div class="temperature-bar-main"><div class="temperature-bar-bubble"><div class="temperature-bar-bubble-number" id="temperature-bar-bubble-number-${tempPointID}">0</div></div><div class="temperature-bar-canvas"><div class="temperature-bar" id="temperature-bar-${tempPointID}"></div></div></div>`
        var tempNumPointDiv = L.divIcon({ html: tempNumPointDivHtml });
        L.marker([data[0].x, data[0].y], { icon: tempNumPointDiv, draggable: false, opacity }).addTo(group); // var tempNumPoint =
        tempNumPointDivHtml = null
    }
    L.marker([data[0].x, data[0].y], { icon: myIcon, opacity }).addTo(group);
    myIconHtml = null
    return group
}
const tempRanderTempBlob = (data) => {
    if (state.blobChangeTempObject !== null) {
        var blob = data[0].spline[0]
        state.blobChangeTempObject.setLatLngs([blob])
        state.blobChangeTempObject.redraw()
    }
}
const endAddBlob = () => {
    var width = state.imgWidth
    var height = state.imgHeight
    var newpoint = state.AddTempPoints
    var newpointlen = newpoint.length
    var x = []
    var y = []
    var tttt = []
    for (var i = 0; i < newpointlen; i++) {
        if (i % 2) {
            tttt.push(newpoint[i] / height)
            y.push(newpoint[i] / height)
        } else {
            tttt.push(newpoint[i] / width)
            x.push(newpoint[i] / width)
        }
    }
    var reqdata = {
        "feature": "roi",
        "method": "set_roiExist",
        "session": Math.random().toString(36).substr(2),
        "content": {
            "camera_id": camID,
            "cursingPoint_id": props.cursingPointValue,
            "image_type": camType,
            "curd_type": 1,
            "roi_type": props.mainMode === "mask" ? "mask" : "blob",
            "field_id": 1,
            "roi_nodeManual": [
                tttt
            ],
            "roi_name": state.reNameValue,
            "roi_alarmSwitch": state.tempAlarmSwitch ? 1 : 0,
            "roi_mainGroup_id": state.selectMainGroupValue,
            "roi_subGroup_id": state.selectSubGroupValue
        }
    }
    state.tempROIdata = reqdata
    state.inputRoiNameWindow = true
    state.moveRemovePoint = false
    state.AddTempPoints = []
    state.blobAddTempObject.remove()
    state.blobAddTempObject = null
    state.removePoint.remove()
    state.removePoint = null
    state.blobStatusAdd = false;
    state.dragObjectStatus = true
    state.$store.dispatch('myData/incrementAsync', { type: 'addSnackbar', params: { text: 'blob 完成新增', type: 0, timeout: 1 } });
}
const pushBlob = (data) => {
    // var width = state.imgWidth
    // var height = state.imgHeight
    var newpoint = data.points[0]
    var newpointlen = newpoint.length
    var x = []
    var y = []
    for (var i = 0; i < newpointlen; i++) {
        if (i % 2) {
            y.push(newpoint[i])
        } else {
            x.push(newpoint[i])
        }
    }
    var reqdata = {
        type: "ROI",
        // cam_id: "xxxx",
        method: "modify",
        content: {
            RoiType: props.mainMode === "mask" ? "mask" : "blob",
            id: data.number,
            alarm_status: 0,
            threshold: 30.0,
            group_name: '',
            group_id: '',
            points: {
                A: {
                    x,
                    y
                },
                B: {
                    x: [],
                    y: []
                }
            }
        },
        session: Math.random().toString(36).substr(2)
    }
    // console.log("push end", reqdata);
    state.ws3.send(JSON.stringify(reqdata))
}
const rtcPlayers = new Map()
const runRTC = (id, url) => {
    const video = document.getElementById(id)
    if (!video) {
        console.warn(`[RTC] video element not found: ${id}`)
        return null
    }

    rtcPlayers.get(id)?.stop()
    const player = createWhepPlayer({
        video,
        url
    })
    rtcPlayers.set(id, player)
    player.start()
    return player
}

// Kept temporarily for reference while every RTC view migrates to createWhepPlayer.
const runRTCLegacy = (id, url, videoType) => {
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
        video.srcObject = evt.streams[0];
        video.autoplay = true;
        video.muted = true;          // 需要靜音才能自動播放
        video.playsInline = true;    // iOS 必須這樣才不會全螢幕播放

        // ✅ 嘗試手動播放（Promise-based）
        const playPromise = video.play();

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
const initWs3 = () => {
    const openwebsocket03 = () => {
        if ($webSocketconnect03().readyState === 1) {
            state.ws3 = $webSocketconnect03()
            if (state.wsListener3.close !== null) {
                state.ws3.removeEventListener("close", state.wsListener3.close)
                state.wsListener3.close = null
            }
            if (state.wsListener3.message !== null) {
                state.ws3.removeEventListener("message", state.wsListener3.message)
                state.wsListener3.message = null
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
            state.wsListener3.message = messageEvent
        } else if ($webSocketconnect03().readyState !== 1) {
            setTimeout(() => {
                openwebsocket03()
            }, 1000)
        }
    }
    openwebsocket03()
}

const initWs7 = () => {
    const openwebsocket07 = () => {
        if ($webSocketconnect07().readyState === 1) {
            state.ws7 = $webSocketconnect07()
            if (state.wsListener7.close !== null) {
                state.ws7.removeEventListener("close", state.wsListener7.close)
                state.wsListener7.close = null
            }
            if (state.wsListener7.message !== null) {
                state.ws7.removeEventListener("message", state.wsListener7.message)
                state.wsListener7.message = null
            }
            const colseEvent = () => {
                setTimeout(() => {
                    openwebsocket07()
                }, 1000)
            }
            state.ws7.addEventListener("close", colseEvent)
            state.wsListener7.close = colseEvent
            // var tew = 0
            const messageEvent = (event) => {
                if (camType === 'ir') {
                    var data = JSON.parse(event.data)
                    // console.log(data);
                    var feature = data.feature
                    var method = data.method
                    if (feature === "roi" && method === "set_roiMorph") {
                        const h = state.imgHeight
                        const w = state.imgWidth
                        state.roiMorphsave.forEach((item) => {
                            item.remove()
                        })
                        data.content.roi_info.forEach((item001) => {
                            item001.roi_nodeSystem_Morph.forEach((item002) => {
                                // state.imgHeight, state.imgWidth
                                const scopeStyle = {
                                    color: '#3b82f6',      // 選取藍
                                    weight: 2,             // 邊框粗細
                                    dashArray: '6 6',      // 虛線
                                    fill: false,           // 不要填滿
                                    opacity: 1,            // 邊框不透明度
                                    interactive: true     // 不吃滑鼠事件（可選）
                                };
                                // 建立並加入地圖
                                // console.log(item002);
                                const pxFlat = normToLatLngs(item002, w, h);
                                const scope = L.polygon(pxFlat, scopeStyle).addTo(map);
                                state.roiMorphsave.push(scope)
                            })
                        })
                        // state.roiMorphsave.forEach((item) => {
                        //     item.remove()
                        // })
                        // state.roiMorphTempblobObject = []
                    }
                }
            }
            state.ws7.addEventListener("message", messageEvent)
            state.wsListener7.message = messageEvent
        } else if ($webSocketconnect07().readyState !== 1) {
            setTimeout(() => {
                openwebsocket07()
            }, 1000)
        }
    }
    openwebsocket07()
}
// =================================================================
const switchWK = (e) => {
    if (e) {
        // const currentPort = window.location.port;
        // if (camType === 'ir') {
        //     runRTC(`video${camType}${camID}-${state.randomID}`, `http://${$getIpaddress()}:${currentPort}/video/realtime/${camType}${camID}`, 'vis')
        // } else {
        //     runRTC(`video${camType}${camID}-${state.randomID}`, `http://${$getIpaddress()}:${currentPort}/video/realtime/${camType}${camID}`, 'vis') // [element id,video url]
        // }

        runWorkerTurf()
        runpixiWebWorker()
        runTempNumber()
        runwk()
        initWs3()
        initWs7()
        // console.log('def wk start');
    } else {
        stopProgram()
        // console.log('def wk stop');
    }
}
const runWorkerTurf = () => {
    state.workerTurf = new Worker('/worker/workerTurf.js');
    state.workerTurf.addEventListener('message', (e) => {
        var data = e.data.parameter
        // console.log(data);
        if (state.objectMask !== null) {
            state.objectMask.eachLayer((item) => {
                item.setLatLngs(data)
            })
            // state.objectMask
        }
        data = null
    })
}
const runpixiWebWorker = () => {
    state.pixiWebWorker = new Worker('/worker/workerpixpjs.js');
    state.pixiWebWorker.addEventListener('message', (e) => {
        var data = e.data
        if (data.type === 'splineCurrent') {
            // (backup)20230714 spline 函數移交至後端計算
            if (!state.waitingToJoin) {
                runBlob(data.parameter, data.objectName)
            }
            // (backup)20230714 spline 函數移交至後端計算 end
        } else if (data.type === 'splineCurrentOnly') {
            if (state.blobAddTempObject !== null) {
                var blob = Array.from(data.parameter)
                state.blobAddTempObject.setLatLngs([blob])
            }
            // state.blobAddTempObject.setLatLngs(Array.from(data.parameter))
            // state.drawTempBlob(Array.from(data.parameter))
        } else if (data.type === 'splineChange') {
            tempRanderTempBlob(data.parameter)
        }
        data = null
    }, false);
}
const stopProgram = () => {
    // state.rtcPeerConnectionItems.forEach((item) => {
    //     item.close();
    // })
    if (state.workerTurf !== null) {
        state.workerTurf.terminate();
        state.workerTurf = null
    }
    if (state.webWorker !== null) {
        state.webWorker.terminate();
        state.webWorker = null
    }
    if (state.pixiWebWorker !== null) {
        state.pixiWebWorker.terminate();
        state.pixiWebWorker = null
    }
    if (state.templatePointInt !== null) {
        clearInterval(state.templatePointInt)
        state.templatePointInt = null
    }
    if (state.reqAnim !== null) {
        clearInterval(state.reqAnim)
        state.reqAnim = null
    }

    if (state.wsListener3.close !== null) {
        state.ws3.removeEventListener("close", state.wsListener3.close)
        state.wsListener3.close = null
    }
    if (state.wsListener3.message !== null) {
        state.ws3.removeEventListener("message", state.wsListener3.message)
        state.wsListener3.message = null
    }
    if (state.ws3 !== null) {
        // state.ws.close()
        state.ws3 = null
    }

    if (state.wsListener7.close !== null) {
        state.ws7.removeEventListener("close", state.wsListener7.close)
        state.wsListener7.close = null
    }
    if (state.wsListener7.message !== null) {
        state.ws7.removeEventListener("message", state.wsListener7.message)
        state.wsListener7.message = null
    }
    if (state.ws7 !== null) {
        // state.ws.close()
        state.ws7 = null
    }
    if (state.refreshMapTimeout !== null) {
        clearTimeout(state.refreshMapTimeout)
    }
    if (state.tempSRstatusTimeout !== null) {
        clearTimeout(state.tempSRstatusTimeout)
    }
}
const runTempNumber = () => {
    state.templatePointInt = setInterval(() => {
        try {
            let arr = []
            state.pixispot.forEach((item) => {
                arr.push(item)
            })
            state.pixiline.forEach((item) => {
                // console.log('state.pixiline', item);
                arr.push(item)
            })
            state.pixiscope.forEach((item) => {
                arr.push(item)
            })
            state.pixiJsRoiBlobData.forEach((item) => {
                arr.push({ data: item.info, tempPointID: item.tempPointID })
            })
            arr.forEach((item) => {
                let bumMain = document.getElementById(`bum-main-${item.tempPointID}`)
                let temperatureBarBubbleNumber = document.getElementById(`temperature-bar-bubble-number-${item.tempPointID}`)
                if (bumMain !== undefined) {
                    let alarmList = ['P-ADFF00', 'P-FFDD28', 'P-FF0909', 'P-FF7223']
                    let alarmIndex = item.data?.temperature_max >= item.data?.threshold && item.data?.alarm_status === 1 ? 2 : 0
                    // console.log(item.data?.temperature_max, item.data?.threshold, item.data?.alarm_status);

                    bumMain.classList = `alarm-point ${alarmList[alarmIndex]}`
                    // console.log(item);
                    // var temperatureBar = document.getElementById(`temperature-bar-${item.tempPointID}`)
                    // var temperatureBarBubbleNumber = document.getElementById(`temperature-bar-bubble-number-${item.tempPointID}`)
                    //                         var max = item.data?.temperature_point?.temperature_ranger.max
                    //                         var min = item.data?.temperature_point?.temperature_ranger.min
                    let randomInt = 0;
                    if (item.data?.temperature) {
                        randomInt = item.data?.temperature
                    } else if (item.data?.temperature_max) {
                        randomInt = item.data?.temperature_max
                    }
                    // console.log('item.data?.temperature', item.data?.temperature, item);
                    // console.log('item.data?.temperature_max', item.data?.temperature_max, item);
                    //                         var num = ((randomInt / (max - min)) * 100) + 100
                    //                         temperatureBar.style.transform = `translateX(-${num - 50}px)`; // 更改translateX的值
                    if (props?.displayObject10) {
                        temperatureBarBubbleNumber.innerHTML = `(${randomInt})`
                    } else {
                        temperatureBarBubbleNumber.innerHTML = ``
                    }
                    //                         temperatureBar.style.background = `linear-gradient(to right,
                    //     #B6B6B6 0px, #B6B6B6 ${item.data.temperature_point.median.start + 100}px,
                    //     #FFE55B ${item.data.temperature_point.median.start + 101}px, #FFE55B ${item.data.temperature_point.median.end + 100}px,
                    //     #FF5A13  ${item.data.temperature_point.median.end + 100}px, #FF5A13 300px
                    // )`;
                }
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
}
const runwk = () => {
    state.webWorker = new Worker('/worker/roiTrack-temp.js');
    state.webWorker.addEventListener('message', (e) => {
        var res = e.data
        var type = res.type
        var parameter = res.parameter
        if (type === 'open' && camType === 'ir') {
            // console.log('開啟worker 123');
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
        } else if (type === 'roiData') {
            // console.log(parameter.data);
            if (state.dragObjectStatus && map !== null && !state.changeModeStatus && props.viewMode === 1) {
                if (state.aiSpotStatusAdd) {
                    runSpot([])
                    runLine([])
                    runScope([])
                    state.roiMorphStatusAdd = false
                    state.roiMorphTempblobObject.forEach((item) => {
                        if (item.objectMarker !== null) {
                            item.objectMarker.remove()
                        }
                    })
                    state.roiMorphsave.forEach((item) => {
                        item.remove()
                    })
                    state.roiMorphTempblobObject = []
                    state.roiMorphsave = []
                    if (state.pixiWebWorker !== null) {
                        state.pixiWebWorker.postMessage({
                            type: 'splineCurrent',
                            objectName: 'blob',
                            data: [[], state.imgHeight, state.imgWidth]
                        })
                        state.pixiWebWorker.postMessage({
                            type: 'splineCurrent',
                            objectName: 'mask',
                            data: [[], state.imgHeight, state.imgWidth]
                        })
                    }
                } else {
                    runSpot($displayRoi().spot ? parameter.data.spot : [])
                    runLine($displayRoi().line ? parameter.data.line : [])
                    runScope($displayRoi().scope ? parameter.data.scope : [])
                    if (state.pixiWebWorker !== null) {
                        state.pixiWebWorker.postMessage({
                            type: 'splineCurrent',
                            objectName: 'blob',
                            data: [JSON.parse(JSON.stringify($displayRoi().blob ? parameter.data.blob : [])), state.imgHeight, state.imgWidth]
                        })
                        state.pixiWebWorker.postMessage({
                            type: 'splineCurrent',
                            objectName: 'mask',
                            data: [JSON.parse(JSON.stringify(parameter.data.mask)), state.imgHeight, state.imgWidth]
                        })
                    }
                }

            }
            emit('messageEvent', parameter.rawData)
        } else if (type === 'close') {
            console.log('close');
            state.webWorker.terminate();
            state.webWorker = null
            setTimeout(() => {
                runwk()
            }, 1)
        }
    })
}
onMounted(() => {
    leafletJsInit()
    document.addEventListener('mousedown', (event) => {
        if (event.button === 0 && map !== null) {
            map.dragging.disable()
        }

    });
    document.addEventListener('mouseup', () => {
        if (event.button === 0 && map !== null) {
            map.dragging.enable()
        }
    });
    if (state.templatePointInt !== null) {
        clearInterval(state.templatePointInt)
        state.templatePointInt = null
    }
})
onBeforeUnmount(() => {
    rtcPlayers.forEach((player) => player.stop())
    rtcPlayers.clear()
    state.rtcPeerConnectionItems.forEach((item) => {
        item.close();
    })
    stopProgram()
})
defineExpose({
    requestBtnGroupEvent,
    superResolution,
    invaliMapSzie,
    addlistenerMainBack,
    switchWK
})
</script>
<style scoped>
.aispotControl {
    position: absolute;
    z-index: 999;
    right: 5px;
    top: 5px;
    background: #fff;
    font-size: 21px;
    display: grid;
    grid-template-columns: 45px 45px;
    border-radius: 5px;
    padding: 0.1em 0.1em 0.1em 0.4em;
}

.aispotControl>div {
    position: relative;
    width: 40px;
    height: 40px;
    padding: .1em;
}

.roiMorphControl {
    position: absolute;
    z-index: 999;
    bottom: 5px;
    left: 5px;
    background: #ffffff00;
    font-size: 21px;
    border-radius: 5px;
    display: grid;
    grid-template-columns: 1fr;
    padding: 0.1em 0.1em 0.1em 0.4em;
}

.roiMorphControl-btn {
    display: grid;
    grid-template-columns: 1fr 1fr;
}

.def-point-grid {
    width: 100%;
    display: grid;
    grid-template-columns: 12% 64% 24%;
    cursor: pointer;
    /* background-color: #fff; */
}

.def-point-item {
    background-color: #fff;
    transition: .2s;
    border: 2px #EAEAEA solid;
}

.def-point-item:hover {
    background-color: #f5f5f5;
}

.def-point-id {
    display: flex;
    align-items: center;
    justify-content: center;
}

.def-point-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: #AEBBC3;
    border-radius: 5px;
    color: #fff;
    font-size: 1.5em;
}

.def-point-name {
    color: #2B2D2C;
    font-weight: 700;
}

.def-point-stoptime {
    font-size: 14px;
}

.def-point-meun {
    display: flex;
    align-items: center;
}

.def-point-meun-btn {
    width: 32px;
    pointer-events: auto;
    background-color: #ffffff00;
    transition: .2s;
    border-radius: 5px;
}

.def-point-meun-btn:hover {
    background-color: #ececec;
}

.def-point-meun-btn:active {
    background-color: #d3d3d3;
}

.cameraList-gird {
    display: grid;
    grid-template-columns: 25% 25% 25% 25%;
    width: 100%;
}

.camera-canvas>img {
    border-radius: 3px;
    border: 2px #EAEAEA solid;
}

#temp-copy-object {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    pointer-events: none;
    opacity: .8;
}

.test-show-rotate {
    top: 39%;
    left: 30%;
    position: fixed;
    z-index: 99999;
    white-space: pre-wrap;
    /* Preserve whitespace and wrap lines */
    font-family: monospace;
    /* Use a monospace font */
    background-color: #f4f4f4;
    /* Light background color */
    border: 1px solid #ccc;
    /* Light border */
    padding: 10px;
    /* Padding */
    margin: 20px;
    /* Margin */
    overflow: auto;
    /* Scroll if necessary */
    max-height: 400px;
    /* Limit max height */
    line-height: 1.5;
    /* Line height for better readability */
    word-wrap: break-word;
    /* Break long words */
}
</style>

<style>
.blob-div-addpoint {
    background-color: #fff;
    width: 10px;
    height: 10px;
    border-radius: 24px;
    border: 1px #000 solid;
    /* transform: translate(2px, -11px); */
}

.RevisionObject {
    background-color: #fff;
    width: 20px;
    height: 20px;
    border: 1px #000 solid;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    transform: translate(-3px, 0px);
}

.BlobEditPoint {
    background-color: #fff;
    width: 20px;
    height: 20px;
    border-radius: 20px;
    border: 1px #000 solid;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    transform: translate(-3px, 0px);
}

.removepoint {
    background-color: #fff;
    width: 20px;
    height: 20px;
    border: 1px #000 solid;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    transform: translate(-3px, 0px);
    z-index: 99;
}

.cur-top-left,
.cur-bottom-right {
    cursor: nw-resize;
}

.cur-top,
.cur-bottom {
    cursor: n-resize;
}

.cur-top-right,
.cur-bottom-left {
    cursor: ne-resize;
}

.cur-right,
.cur-left {
    cursor: w-resize;
}

.item-card-content {
    transition: all 1s;
}

.map-top-c {
    z-index: 5;
    width: 90vw;
    height: 95vh;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.floatingDiv-111 {
    position: fixed;
    padding: 5px;
    background: rgb(227 227 227);
    font-size: 25px;
    color: crimson;
    animation: floatLeftRight 2s infinite;
    box-shadow: 1px 1px 1px #b2b2b2;
    border-radius: 9px;
    width: fit-content;
    transform: translateY(-50%);
}

@keyframes floatLeftRight {
    0% {
        transform: translateX(0);
    }

    50% {
        transform: translateX(3px);
    }

    100% {
        transform: translateX(0);
    }
}

.recorder-canvas {
    position: fixed;
    left: 10px;
    bottom: 10px;
    background-color: #fff;
    border: 1px solid #000;
}

.vdisplay {
    pointer-events: none;
    color: #5e5e5e !important;
    opacity: 0.4;
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




.lnder0move {
    width: 12px;
    height: 12px;
    background-color: #fff;
    border-radius: 30px;
    transform: translate(-0px, -0px);
}

.lnder0move-font {
    width: 100px;
    font-size: 16px;
}

.lnder0move-ptz {
    width: 12px;
    height: 12px;
    /* background-color: #FFE55B; */
    border-radius: 20px;
    transform: translate(-0px, -0px);
}

.lnder0move-font-ptz {
    width: 100px;
    font-size: 16px;
}


.aiMarker {
    width: 15px;
    height: 15px;
    border-radius: 15px;
}

.flash-red {
    animation: flash 0.5s;
}

@keyframes flash {
    0% {
        background-color: red;
    }

    100% {
        background-color: initial;
    }
}
</style>
