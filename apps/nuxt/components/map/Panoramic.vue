<template>
    <div class="item-card-content" id="map-top-b" style="height: 100%; width: 100%;z-index: 0;" ref="mapcanvas">
        <div ref="LMmap" style="height: 100%; width: 100%;z-index: 0;">
            <div :class="`reset-btn123 hidden ${state.className}`" @click="backmap">
                <NuxtImg src="/images/icon/return.png" />
            </div>
        </div>
        <div style="position: absolute;top: 0;left: 0;width: 100px;height: 100px;opacity: 0;pointer-events: none;">
            <ClientOnly>
                <!-- <div style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;" class="only-roi0" ref="roidiv">
                    <MapOnlyroiforpanoramic ref="mapmain" :camID="camID" :camType="'ir'"
                        :aspectRatio="state.aspectRatio" />
                </div> -->
                <div style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;" class="only-roi0" ref="roidiv">
                    <MapOnlyvideo ref="mapmain" :formtData="{}" :mainMode="[]" :mainProps="''" :camID="camID"
                        camType="ir" />
                </div>
            </ClientOnly>
        </div>
        <div id="message" style="display: none;">
        </div>

        <div class="ptz-control-c pa-1">
            <div class="ptzctrolContent">
                <v-btn class="ptz-c-btn pa-1" @click="topage(camID)" color="#6795D4">進入頁面</v-btn>
                <!-- <v-btn class="ptz-c-btn pa-1 ml-1">巡弋</v-btn>
                <v-btn class="ptz-c-btn pa-1 ml-1">閒置</v-btn> -->
                <v-menu :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                        <div>
                            <v-btn id="menu-activator" flat block v-bind="props" class="ptz-c-btn ml-1" color="#6795D4">
                                開啟控制面板
                            </v-btn>
                        </div>
                    </template>
                    <div class="ptz-control-dialogs">
                        <div class="my-1">
                            <div class="ptz-text">{{ state.ptzinto.ptz_name }}</div>
                        </div>
                        <v-divider class="my-2"></v-divider>
                        <div class="ptz-status-grid" style="opacity: .5;">
                            <div class="text-center">巡弋狀態</div>
                            <div class="c-switch-lo">
                                <div class="c-switch-a"
                                    :class="state.ptzswitch === 1 ? 'c-switch-foucs' : 'c-switch-after-add'"
                                    @click="ptzswitchEvent(1)">
                                    閒置中
                                </div>
                                <div class="c-switch-b" :class="state.ptzswitch === 2 ? 'c-switch-foucs' : ''"
                                    @click="ptzswitchEvent(2)">
                                    巡弋中
                                </div>
                            </div>
                            <div></div>
                        </div>
                        <div class="w-100 d-flex justify-center position-relative">
                            <div class="ptz-control">
                                <NuxtImg src="/images/控制圓盤.svg" style="width: 100%;margin-left: -4px;" />
                                <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-top"
                                    @mousedown="state.ptzControlStatus = 'up', sendPtzControl()"
                                    @mouseup="state.ptzControlStatus = 'none'"
                                    @mouseout="state.ptzControlStatus = 'none'"></div>
                                <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-bottom"
                                    @mousedown="state.ptzControlStatus = 'down', sendPtzControl()"
                                    @mouseup="state.ptzControlStatus = 'none'"
                                    @mouseout="state.ptzControlStatus = 'none'"></div>
                                <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-left"
                                    @mousedown="state.ptzControlStatus = 'left', sendPtzControl()"
                                    @mouseup="state.ptzControlStatus = 'none'"
                                    @mouseout="state.ptzControlStatus = 'none'"></div>
                                <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-right"
                                    @mousedown="state.ptzControlStatus = 'right', sendPtzControl()"
                                    @mouseup="state.ptzControlStatus = 'none'"
                                    @mouseout="state.ptzControlStatus = 'none'"></div>
                            </div>
                            <div class="patrol-puse-control-canvas" v-if="state.ptzswitch === 2">
                                <div class="patrol-puse-control justify-center align-center d-flex flex-column">
                                    <div>巡弋中</div>
                                    <div>(如欲控制雲台，請先解除巡弋)</div>
                                </div>
                            </div>
                        </div>
                        <div class="ptz-input-grid">
                            <div class="d-flex w-100 my-1 align-center">
                                <div class="ptz-text">水平角</div>
                                <div class="w-50 px-1">
                                    <v-text-field v-model="state.ptzCurrentAngle[0]" hide-details
                                        @click="state.ptzCurrentAngleInput = false" type="number" hide-spin-buttons
                                        :disabled="state.ptzswitch === 2"></v-text-field>
                                </div>
                            </div>
                            <div class="d-flex w-100 my-1 align-center">
                                <div class="ptz-text">垂直角</div>
                                <div class="w-50  px-1">
                                    <v-text-field v-model="state.ptzCurrentAngle[1]" hide-details
                                        @click="state.ptzCurrentAngleInput = false" type="number" hide-spin-buttons
                                        :disabled="state.ptzswitch === 2"></v-text-field>
                                </div>
                            </div>
                            <div>
                                <v-btn class="mt-1" block @click="setPtzCurrentAngle"
                                    :disabled="state.ptzswitch === 2">GO</v-btn>
                            </div>
                        </div>
                        <!-- <div class="ptz-selection-grid">
                            <div class="ptz-selection001-grid w-100 my-1 align-center">
                                <div class="ptz-text">預設點</div>
                                <div class="w-100 px-1">
                                    <v-select hide-details :items="state.cursingPointItems"
                                        v-model="state.cursingPointValue" @update:modelValue="changeCursingPoint"
                                        hide-spin-buttons :disabled="state.ptzswitch === 2"></v-select>
                                </div>
                            </div>
                            <div>
                            </div>
                        </div> -->
                    </div>
                </v-menu>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue'
const { $getIpaddress } = useNuxtApp()
const { $webSocket02URL } = useNuxtApp()
const { $webSocketconnect03 } = useNuxtApp()
const LMmap = ref(null)
const mapmain = ref(null)
const roidiv = ref(null)
const mapcanvas = ref(null)
const base64 = useAttrs().base64
var map = null
const state = reactive({
    rtcPeerConnectionItems: [],
    keyctrl: false,
    webWorker: null,
    ws3: {
        readyState: 0
    },
    wsListener3: {
        close: null,
        message: null
    },
    imgWidth: 640 / 3,
    imgHeight: -480 / 3,
    minZoom: -3,
    maxZoom: 20,
    aspectRatio: 1.333333,
    imgrealsize: {
        w: 0, h: 0
    },
    // crs: L.CRS.Simple,
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
    className: 'rest0-btn' + Math.random().toString(36).substr(2),
    mapUrlBase64: '/EMPTYv1-fill.png', imageBounds: [],
    initPTZimgStatus: true,
    imageOverlayTemp: null,
    // scope相關
    tempMouseDownScope: false,
    tempMouseDownScopeObject: null,
    saveFOVObject: {
        scope: null,
        PTZSTATUS: null,
        target: null,
        ROITEMPMARKER: null
    },
    maxHeightEm: 0,
    minHeightEm: 0,
    Cdiv: null,
    scopectrl: false,
    // scope相關 end
    // PTZ 控制面板
    ptzswitch: 1,
    ptzinto: {
        ptz_name: '',
        ptz_id: 0,
        ptz_onLocation: 0
    },
    cursingPointValue: 0,
    cursingPointItems: [],
    ptzCurrentAngle: [0, 0],
    ptzCurrentAngleInput: true,
    tempcursingPoint_list: {},
    tempcursingPointObject: [],
    temptimeee: null,
    imageOverlay: null
})
const props = useAttrs().formtData
const camID = useAttrs().camID
const router = useRouter()
const route = useRoute()
window.topage1 = (camID) => {
    router.push({
        query: {
            ...route.query,
            page: 'next'
        }
    })
    setTimeout(() => {
        router.push({
            query: {
                ...route.query,
                page: camID
            }
        })
    }, 10)
}
watch(() => route.query.page, (newPage) => {
    if (newPage !== 'next') {
        console.log('Page changed to:', newPage)
        setTimeout(() => {
            topage(parseInt(newPage))
            router.push({
                query: {
                    ...route.query,
                    page: 'next'
                }
            })
        }, 10)
    }
})
// const refsHandler = (el, index) => {
//     if (el) {
//         mapmain.value[index] = el
//     }
// }
let su = {
    map: false,
    base64: false
}
const rundev = (type) => {
    if (type === "map") {
        su.map = true
    } else if (type === "base64") {
        su.base64 = true
    }
    if (su.base64) {
        // if (su.map && su.base64) {
        leafletJsInitForPhoto()
        state.initPTZimgStatus = false
    }
}
const invaliMapSzie = () => {
    if (map !== null) {
        let mapWidth = mapcanvas.value.getBoundingClientRect().width
        let mapHeight = -mapcanvas.value.getBoundingClientRect().height
        state.imgHeight = mapHeight
        state.imgWidth = mapWidth

        // var Bounds = [[0, 0], [state.imgHeight * 2, state.imgWidth * 2]];

        var imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
        state.imageOverlay.setBounds(imageBounds)
        map.invalidateSize()
        map.setMaxBounds(imageBounds)
        map.fitBounds(imageBounds, {
            animate: false
        })
        console.log('map.getZoom()', map.getZoom());
        map.setMinZoom(map.getZoom());  // 把目前 zoom 設為最小縮放
        setTimeout(() => {
            const buttonElement = document.querySelector(`.${state.className}`);
            buttonElement.classList.add('hidden');
        }, 1000)
        // var imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
        // map.fitBounds(imageBounds)
        // let mapWidth = mapcanvas.value.getBoundingClientRect().width
        // let mapHeight = mapcanvas.value.getBoundingClientRect().height
        // map.setView([state.imgHeight / 2, state.imgWidth / 2], 1);
        // const minZoomX = Math.log2(state.imgWidth / mapWidth);
        // const minZoomY = Math.log2(Math.abs(state.imgHeight) / mapHeight);
        // let minZoom = Math.max(minZoomX, minZoomY); // 確保不會小於 0
        // map.setMinZoom(state.imgWidth < mapWidth || Math.abs(state.imgHeight) < mapHeight ? Math.abs(minZoom) : minZoom)
        // map.setMaxZoom(5)
        // map.setMaxZoom(3)
        // map.invalidateSize()
        // map.fitBounds(imageBounds)
        // var div = document.querySelector('.' + state.className)
        // div.classList.add('hidden')
    }
}
const removeObject = (e) => {
    if (e instanceof L.LayerGroup || e instanceof L.FeatureGroup) {
        e.eachLayer(function (layer) {
            removeObject(layer);
            if (typeof layer.off === 'function') {
                layer.off();
            }
            if (map.hasLayer(layer)) {
                map.removeLayer(layer);
            }
        });
    }
    if (typeof e.off === 'function') {
        e.off();
    }
    if (map.hasLayer(e)) {
        map.removeLayer(e);
    }
};
const emit = defineEmits(['toTab', 'mapSetMapPtzStatus', 'mapSetCursingPint', 'topage123'])
const leafletJsInitForPhoto = () => {
    map = L.map(LMmap.value, state.mapOptions);
    let mapWidth = mapcanvas.value.getBoundingClientRect().width
    let mapHeight = mapcanvas.value.getBoundingClientRect().height
    // state.imgHeight = -mapHeight / 10
    // state.imgWidth = mapWidth / 10
    // let saveoldimgHeight = state.imgHeight
    state.imgHeight = -(state.imgWidth / (mapWidth / mapHeight))
    // console.log(state.imgHeight);
    map.setView([state.imgHeight / 2, state.imgWidth / 2], 1);
    // map._layersMaxZoom = 20;
    var imageUrl = state.mapUrlBase64, // /mock/ir13807.jpg
        imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    var imageOverlay = L.imageOverlay(imageUrl, imageBounds, { opacity: .5 });
    // imageOverlay.setZIndex(-2);
    state.imageOverlay = imageOverlay
    imageOverlay.addTo(map);
    state.imageOverlayTemp = imageOverlay
    state.imageBounds = imageBounds
    map.setMaxBounds(imageBounds)
    map.fitBounds(imageBounds)

    const minZoomX = Math.log2(state.imgWidth / mapWidth);
    const minZoomY = Math.log2(Math.abs(state.imgHeight) / mapHeight);
    let minZoom = Math.max(minZoomX, minZoomY); // 確保不會小於 0
    map.setMinZoom(state.imgWidth < mapWidth || Math.abs(state.imgHeight) < mapHeight ? Math.abs(minZoom) : minZoom)
    map.setMaxZoom(5)
    if (state.refreshMapTimeout !== null) {
        clearTimeout(state.refreshMapTimeout)
    }
    // 回到預設位置
    var timeoutid = null
    var className = state.className
    const resetButton = L.Control.extend({
        options: {
            position: 'bottomright'  // 設定按鈕顯示位置為右下角
        },

        onAdd: function (map) {
            const container = L.DomUtil.create('div', `reset-btn hidden ${className}`); // hidden
            const img = L.DomUtil.create('img', '', container);
            img.src = '/images/icon/return.png';  // 圖片的路徑
            img.alt = '回到預設位置';
            container.onclick = function () {
                map.fitBounds(imageBounds);  // 回到預設邊界
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
    // 監聽地圖的移動和縮放事件
    const hiddenBtn = () => {
        const currentBounds = map.getBounds();  // 目前地圖的邊界
        const isAtDefaultPosition = currentBounds.equals(imageBounds);  // 檢查邊界是否相同

        const buttonElement = document.querySelector(`.${className}`);
        if (isAtDefaultPosition) {
            buttonElement.classList.add('hidden');
        } else {
            buttonElement.classList.remove('hidden');
        }
    }
    map.on('zoomend', hiddenBtn);
    map.on('moveend', hiddenBtn);
    // 回到預設位置 end
    // test for scope

    let Mockbounds = [
        // [
        //     [
        //         0.1643201568916099, 0.03100666126581386
        //     ],
        //     [
        //         0.8413096916284846, 0.2291339713880482
        //     ]
        // ],
        // [
        //     [
        //         0.15184108712687486, 0.6159289322632854
        //     ],
        //     [
        //         0.379584110333289, 0.724189478377822
        //     ]
        // ],
        // [
        //     [
        //         0.6385248079515407, 0.6248630550008928
        //     ],
        //     [
        //         0.9843338328211607, 0.8536078528313019
        //     ]
        // ]
    ];
    Mockbounds.forEach((item, index) => {
        let locationTemp = item
        for (var i = 0; i < locationTemp.length; i++) {
            locationTemp[i][0] = locationTemp[i][0] * state.imgHeight
            locationTemp[i][1] = locationTemp[i][1] * state.imgWidth
        }
        const scopeMock = L.rectangle(locationTemp, {
            color: "#fff", weight: 1, objectType: 'rectangle', fillOpacity: 0.01
        }).addTo(map);

        scopeMock.on('mouseover', (e) => {
            // console.log(e);
            e.target.setStyle({
                color: "#00A0E9"
            })
        })
        scopeMock.on('mouseout', (e) => {
            e.target.setStyle({
                color: "#fff"
            })
        })
    })
    // test for scope end
    // test 

    // test
    // test for realTimeScope
    const testFOV = {
        centerX_em: 0.5,
        centerY_em: 0.5,
        currentH_em: 0.5,
        fov_ratio: [1, 1],
        maxHeight_em: 0.8,
        minHeight_em: 0.2,
        target_centerX_em: 0.5,
        target_centerY_em: 0.5,
        target_H_em: 0.5,
        alarmStatus: 0
    };

    state.aspectRatio = testFOV.fov_ratio[0];

    // 優化版 createFOVRectangle：使用解構並重構重複邏輯
    function createFOVRectangle({
        centerX_em,
        centerY_em,
        currentH_em,
        aspectRatio = 1.725,
        maxHeight_em,
        minHeight_em
    }) {
        const { imgWidth, imgHeight, imgrealsize } = state;
        const { w, h } = imgrealsize;

        const centerX = w * centerX_em;
        const centerY = h * centerY_em;

        // 更新 state 最大/最小高
        if (maxHeight_em !== undefined) {
            state.maxHeightEm = maxHeight_em * imgHeight;
            state.minHeightEm = minHeight_em * imgHeight;
        }

        const height = h * currentH_em;
        const halfHeight = height / 2;
        const halfWidth = (height * aspectRatio) / 2;

        return [
            [((centerY - halfHeight) / h) * imgHeight, ((centerX - halfWidth) / w) * imgWidth], // SW
            [((centerY + halfHeight) / h) * imgHeight, ((centerX + halfWidth) / w) * imgWidth]  // NE
        ];
    }

    // 使用時傳入物件即可，精簡參數傳遞
    const bounds = createFOVRectangle({
        ...testFOV,
        aspectRatio: testFOV.fov_ratio[0]
    });

    const targetBounds = createFOVRectangle({
        centerX_em: testFOV.target_centerX_em,
        centerY_em: testFOV.target_centerY_em,
        currentH_em: testFOV.target_H_em,
        aspectRatio: testFOV.fov_ratio[0]
    });
    const targetScope = L.rectangle(targetBounds, {
        color: "#8EAEFF", weight: 2, objectType: 'rectangle', fillOpacity: 0.01
    }).addTo(map);
    state.saveFOVObject.target = targetScope
    // console.log(targetBounds);
    // let ptzctrolContent = `<div class="ptzctrolContent"><div class="ptz-c-btn" onclick="topage1(${camID})">進入</div><div class="ptz-c-btn ml-1">巡弋</div><div class="ptz-c-btn ml-1">閒置</div></div>`
    let ptzctrolContent = `<div class="ptzctrolContent1">巡弋中</div>` // 按鈕改成地圖左下方
    let ptzctroldivIcon = L.divIcon({ html: ptzctrolContent });
    let PTZSTATUS = L.marker([bounds[0][0], bounds[0][1]], { icon: ptzctroldivIcon, draggable: false }).addTo(map);
    let saveObject = null
    let clicktmepBounds = null
    const scope = L.rectangle(bounds, {
        color: "#fff", weight: 1, objectType: 'rectangle', fillOpacity: 0.01
    }).addTo(map);
    const video = document.createElement('video');
    const videoID = `video001` + Math.random().toString();
    video.autoplay = true;
    video.controls = false;
    video.muted = true;
    video.loop = true;
    video.id = videoID;
    // var videoTag = L.videoOverlay(video, bounds, { type: 'video', interactive: true }).addTo(map);
    // const currentPort = window.location.port;
    // runRTC(videoID, `http://${$getIpaddress()}:${currentPort}/video/realtime/vis1`, 'vis')
    // 建立ROI TEMP DIV
    state.Cdiv = document.createElement('div')
    // state.Cdiv.addEventListener('click', () => {
    //     console.log('sdasd');
    //     topage(camID)
    // })
    // Cdiv.innerHTML = '123'
    state.Cdiv.classList = 'c-roitempdiv'
    let ROITEMPDIV = state.Cdiv
    let ROITEMPDIVOBJECT = L.divIcon({ html: ROITEMPDIV });
    let ROITEMPMARKER = L.marker([bounds[0][0], bounds[1][1]], { icon: ROITEMPDIVOBJECT, draggable: false }).addTo(map);
    state.Cdiv.appendChild(roidiv.value); // 將 A 放到 B 裡（成為子元素，位於底下）
    let resizeTimeout = null
    resizeTimeout = setTimeout(() => {
        mapmain.value.invaliMapSzie()
    }, 1000)
    const reszieDIV = () => {
        const scopebounds = scope.getBounds();

        const nw = scopebounds.getNorthWest(); // 左上角
        const se = scopebounds.getSouthEast(); // 右下角

        const nwPoint = map.latLngToLayerPoint(nw);
        const sePoint = map.latLngToLayerPoint(se);

        const pixelWidth = Math.abs(sePoint.x - nwPoint.x);
        const pixelHeight = Math.abs(sePoint.y - nwPoint.y);
        state.Cdiv.style.width = pixelWidth + 'px'
        state.Cdiv.style.height = pixelHeight + 'px'
    }
    reszieDIV()
    state.saveFOVObject.scope = scope
    // state.saveFOVObject.videoTag = videoTag
    state.saveFOVObject.PTZSTATUS = PTZSTATUS
    state.saveFOVObject.ROITEMPMARKER = ROITEMPMARKER
    // console.log('寬：', width);
    // console.log('高：', height);
    // 建立ROI TEMP DIV END
    var down = null
    let center = null;
    let dragging = false;
    let startMouse = null;
    let startSize = null;
    if (false) {
        scope.on('mousedown', (e) => {
            // console.log('scope down');
            state.scopectrl = true
            saveObject = e.target
            // state.saveFOVObject.saveObject = saveObject
            // center = e.latlng;
            center = scope.getBounds().getCenter();
            dragging = true;
            startMouse = e.originalEvent;
            const bounds = scope.getBounds();
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            startSize = [
                Math.abs(ne.lat - sw.lat),
                Math.abs(ne.lng - sw.lng)
            ];
            clicktmepBounds = e.target.getLatLngs()
        })
        scope.on('mouseup', (e) => {
            const newscopeFOV = extractFOVFromScope(scope);
            console.log("newscopeFOV", newscopeFOV);
            state.scopectrl = false
        })
    }
    let mousedownButton = null
    map.on('mousedown', (e) => {
        // console.log(e.latlng.lat / state.imgHeight + ' , ' + e.latlng.lng / state.imgWidth);

        mousedownButton = e.originalEvent.button
        down = {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        }
    })
    map.on('mousemove', (e) => {
        if (!dragging || !scope || mousedownButton !== 0) return;
        state.imgHeight = -(state.imgWidth / (mapWidth / mapHeight))
        if (e.originalEvent.ctrlKey) {
            const dx = e.originalEvent.clientX - startMouse.clientX;
            const dy = e.originalEvent.clientY - startMouse.clientY;
            const scale = 1 + (dx + dy) / 200;
            const newHalfHeight = (startSize[0] / 2) * scale;
            const newHalfWidth = (startSize[1] / 2) * scale;
            // console.log(newHalfHeight, newHalfWidth);
            // if (newHalfHeight > maxHeightEm || newHalfHeight < minHeightEm) return;
            const south = center.lat - newHalfHeight;
            const north = center.lat + newHalfHeight;
            const west = center.lng - newHalfWidth;
            const east = center.lng + newHalfWidth;
            const minLat = state.imgHeight;
            const maxLat = 0;
            const minLng = 0;
            const maxLng = state.imgWidth;
            const heightnow = south - north
            // console.log(south - north);
            if (heightnow < state.maxHeightEm || heightnow > state.minHeightEm) {
                return; // 超出允許縮放高度
            }
            if (south <= minLat || north >= maxLat || west <= minLng || east >= maxLng) {
                return;
            }
            // if (south <= minLat) {
            //     const overshoot = minLat - south;
            //     south = minLat;
            //     north = south + newHalfHeight * 2 - overshoot;
            // }
            // if (north >= maxLat) {
            //     const overshoot = north - maxLat;
            //     north = maxLat;
            //     south = north - newHalfHeight * 2 + overshoot;
            // }
            // // 左右邊界修正
            // if (west <= minLng) {
            //     const overshoot = minLng - west;
            //     west = minLng;
            //     east = west + newHalfWidth * 2 - overshoot;
            // }
            // if (east >= maxLng) {
            //     const overshoot = east - maxLng;
            //     east = maxLng;
            //     west = east - newHalfWidth * 2 + overshoot;
            // }
            const newBounds = [
                [south, west],
                [north, east]
            ];
            scope.setBounds(newBounds);
            // videoTag.setBounds(newBounds);
            // set latlng contorl
            PTZSTATUS.setLatLng([newBounds[1][0], newBounds[1][1]]);
            ROITEMPMARKER.setLatLng([newBounds[1][0], newBounds[0][1]]);
            reszieDIV()
            // if (resizeTimeout !== null) {
            //     clearTimeout(resizeTimeout)
            // }
            // resizeTimeout = setTimeout(() => {
            //     mapmain.value.resize()
            // }, 10)
            mapmain.value.invaliMapSzie()
        } else if (clicktmepBounds !== null && !e.originalEvent.ctrlKey) {
            var y = down.lat - e.latlng.lat
            var x = down.lng - e.latlng.lng
            let tmepBounds = clicktmepBounds
            let scopewidth = Math.abs(tmepBounds[0][2].lng - tmepBounds[0][1].lng);
            let scopehight = Math.abs(tmepBounds[0][0].lat - tmepBounds[0][1].lat);
            var temp1 = JSON.stringify(tmepBounds)
            var temp = JSON.parse(temp1)
            for (var i = 0; i < tmepBounds[0].length; i++) {
                temp[0][i].lat = tmepBounds[0][i].lat - y
                temp[0][i].lng = tmepBounds[0][i].lng - x
            }
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
            // console.log(temp[0][1].lat, (state.imgHeight + scopehight));
            // console.log(temp);
            saveObject.setLatLngs(temp)
            // videoTag.setBounds(temp)
            // set latlng contorl
            // console.log(JSON.stringify([temp[0][2].lat, temp[0][2].lng]));
            PTZSTATUS.setLatLng([temp[0][2].lat, temp[0][2].lng]);
            ROITEMPMARKER.setLatLng([temp[0][1].lat, temp[0][1].lng]);
            reszieDIV()
            if (resizeTimeout !== null) {
                clearTimeout(resizeTimeout)
            }
            resizeTimeout = setTimeout(() => {
                mapmain.value.invaliMapSzie()
            }, 10)
        }
    })
    map.on('mouseup', (e) => {

        down = null
        clicktmepBounds = null
        dragging = false;
        mousedownButton = null
    })
    map.on('zoomend', () => { reszieDIV(); mapmain.value.invaliMapSzie(); });
    function extractFOVFromScope(scope) {
        const { imgWidth, imgHeight, imgrealsize } = state;
        const { w, h } = imgrealsize;

        // 取得 Rectangle 的座標 (左下、左上、右上、右下)
        const latlngs = scope.getLatLngs()?.[0];
        if (!latlngs || latlngs.length !== 4) return null;

        const latMin = Math.min(...latlngs.map(p => p.lat));
        const latMax = Math.max(...latlngs.map(p => p.lat));
        const lngMin = Math.min(...latlngs.map(p => p.lng));
        const lngMax = Math.max(...latlngs.map(p => p.lng));

        // 邊界的中心點
        const centerLat = (latMin + latMax) / 2;
        const centerLng = (lngMin + lngMax) / 2;

        // 將 map 坐標轉換回比例 (em)
        const centerY_em = (centerLat / imgHeight) * h;
        const centerX_em = (centerLng / imgWidth) * w;

        const currentH_em = ((latMax - latMin) / imgHeight) * h;

        return {
            centerX_em: centerX_em / w,
            centerY_em: centerY_em / h,
            currentH_em: currentH_em / h
        };
    }
    // test for realTimeScope end
}
const topage = (e) => {
    console.log(e);
    emit('topage123', e)
}
const panoramicGet = (event) => {
    // console.log('panoramicGet', event);
    const e = event.panoramic_info
    state.ptzinto = event.ptz_info[0]
    state.ptzswitch = event.ptz_info[0].ptz_working_status
    if (state.ptzCurrentAngleInput) {
        state.ptzCurrentAngle = event.ptz_info[0].ptz_currentAngle
    }
    // state.ptz_info = e.[0]
    // const testFOV = {
    //     centerX_em: e[0].fov_info.current_centerX_em,
    //     centerY_em: e[0].fov_info.current_centerY_em,
    //     currentH_em: e[0].fov_info.current_H_em,
    //     fov_ratio: [e[0].fov_info.fov_ratio, 1],
    //     maxHeight_em: e[0].fov_info.maxHeight_em,
    //     minHeight_em: e[0].fov_info.minHeight_em,
    // }
    if (!state.scopectrl) {
        roidiv.value.style.boxShadow = e[0].fov_info.alarmStatus === 0 ? '#00ff2b 0px 0px 0px 1px' : '0 0 0 3px red'; /* 內框紅色 2px #00ff2b 0px 0px 0px 3px */
        let ptzctrolContent = `<div class="ptzctrolContent1">${state.ptzswitch === 1 ? '閒置中' : '巡弋中'}</div>` // 按鈕改成地圖左下方
        let ptzctroldivIcon = L.divIcon({ html: ptzctrolContent });
        state.saveFOVObject.PTZSTATUS.setIcon(ptzctroldivIcon)
        const cursingPoint_list = e[0].fov_info.curisingPoint_list
        if (JSON.stringify(state.tempcursingPoint_list) !== JSON.stringify(cursingPoint_list)) {
            state.tempcursingPointObject.forEach((item) => {
                item.remove()
            })
            state.tempcursingPointObject = []
            cursingPoint_list.forEach((item) => {
                const targetBounds = boundsToLatLngObjects(createFOVRectangle({
                    centerX_em: item.cursingPoint_panoramicCenter_em[0],
                    centerY_em: item.cursingPoint_panoramicCenter_em[1],
                    currentH_em: item.cursingPoint_panoramicHeight_em,
                    aspectRatio: item.cursingPoint_panoramicFov_ratio
                }));
                const scope123 = L.rectangle(targetBounds, {
                    color: "#fff", weight: 1, objectType: 'rectangle', fillOpacity: 0.01, eData: item
                }).addTo(map);
                state.tempcursingPointObject.push(scope123)
                scope123.on('click', (e) => {

                    // console.log(e.target.options.eData.cursingPoint_id);
                    if (state.ptzswitch === 1) {
                        changeCursingPoint(e.target.options.eData.cursingPoint_id)
                    }
                })
                scope123.on('mouseover', () => {
                    if (state.ptzswitch === 1) {
                        scope123.setStyle({
                            color: "#fffff4", // 滑鼠進入時的邊框顏色
                            weight: 2
                        });
                    }
                });

                scope123.on('mouseout', () => {
                    if (state.ptzswitch === 1) {
                        scope123.setStyle({
                            color: "#ffffff", // 回到原本的邊框顏色
                            weight: 1
                        });
                    }
                });
            })
            state.tempcursingPoint_list = cursingPoint_list
        }
        const testFOV = {
            centerX_em: e[0].fov_info.current_center_em[0],
            centerY_em: e[0].fov_info.current_center_em[1],
            currentH_em: e[0].fov_info.current_height_em,
            fov_ratio: [e[0].fov_info.fov_ratio, 1],
            maxHeight_em: e[0].fov_info.limit_height_em[1],
            minHeight_em: e[0].fov_info.limit_height_em[0],
            target_centerX_em: e[0].fov_info.target_center_em[0],
            target_centerY_em: e[0].fov_info.target_center_em[1],
            target_H_em: e[0].fov_info.target_height_em,
            alarmStatus: e[0].fov_info.alarmStatus
        };

        state.aspectRatio = testFOV.fov_ratio[0];

        // 優化版 createFOVRectangle：使用解構並重構重複邏輯
        function createFOVRectangle({
            centerX_em,
            centerY_em,
            currentH_em,
            aspectRatio = 1.725,
            maxHeight_em,
            minHeight_em
        }) {
            const { imgWidth, imgHeight, imgrealsize } = state;
            const { w, h } = imgrealsize;

            const centerX = w * centerX_em;
            const centerY = h * centerY_em;

            // 更新 state 最大/最小高
            if (maxHeight_em !== undefined) {
                state.maxHeightEm = maxHeight_em * imgHeight;
                state.minHeightEm = minHeight_em * imgHeight;
            }

            const height = h * currentH_em;
            const halfHeight = height / 2;
            const halfWidth = (height * aspectRatio) / 2;

            return [
                [((centerY - halfHeight) / h) * imgHeight, ((centerX - halfWidth) / w) * imgWidth], // SW
                [((centerY + halfHeight) / h) * imgHeight, ((centerX + halfWidth) / w) * imgWidth]  // NE
            ];
        }

        // 使用時傳入物件即可，精簡參數傳遞
        const temp = boundsToLatLngObjects(createFOVRectangle({
            ...testFOV,
            aspectRatio: testFOV.fov_ratio[0]
        }));

        const targetBounds = boundsToLatLngObjects(createFOVRectangle({
            centerX_em: testFOV.target_centerX_em,
            centerY_em: testFOV.target_centerY_em,
            currentH_em: testFOV.target_H_em,
            aspectRatio: testFOV.fov_ratio[0]
        }));
        // console.log(testFOV.target_centerX_em,
        //     testFOV.target_centerY_em,
        //     testFOV.target_H_em,
        //     testFOV.fov_ratio[0]);
        if (state.saveFOVObject.target !== null) {
            state.saveFOVObject.target.setLatLngs(targetBounds)
        }
        if (state.saveFOVObject.scope !== null) {
            state.saveFOVObject.scope.setLatLngs(temp)
        }
        // if (state.saveFOVObject.videoTag !== null) {
        //     state.saveFOVObject.videoTag.setBounds(temp)
        // }
        if (state.saveFOVObject.PTZSTATUS !== null) {
            state.saveFOVObject.PTZSTATUS.setLatLng([temp[0][2].lat, temp[0][2].lng])
        }
        if (state.saveFOVObject.ROITEMPMARKER !== null) {
            state.saveFOVObject.ROITEMPMARKER.setLatLng([temp[0][2].lat, temp[0][1].lng])
        }
        if (state.Cdiv !== null) {
            const scopebounds = state.saveFOVObject.scope.getBounds();
            // console.log(scopebounds);
            const nw = scopebounds.getNorthWest(); // 左上角
            const se = scopebounds.getSouthEast(); // 右下角

            const nwPoint = map.latLngToLayerPoint(nw);
            const sePoint = map.latLngToLayerPoint(se);

            const pixelWidth = Math.abs(sePoint.x - nwPoint.x);
            const pixelHeight = Math.abs(sePoint.y - nwPoint.y);
            state.Cdiv.style.width = pixelWidth + 'px'
            state.Cdiv.style.height = pixelHeight + 'px'
            setTimeout(() => {
                mapmain.value.invaliMapSzie()
            }, 500)
        }
    }
}
const boundsToLatLngObjects = (bounds) => {
    const [ne, sw] = bounds;

    return [[
        { lat: sw[0], lng: sw[1] }, // 左下
        { lat: ne[0], lng: sw[1] }, // 左上
        { lat: ne[0], lng: ne[1] }, // 右上
        { lat: sw[0], lng: ne[1] }  // 右下
    ]];
}
const ptzswitchEvent = (e) => {
    // if (e) {
    state.ptzswitch = e
    // } else {
    // state.ptzswitch = 1
    // }
    var output = {
        "feature": "ptz",
        "method": "set_cursingStatus",
        "content": {
            "ptz_id": state.ptzinto.ptz_id,
            "cursing_status": e === 1 ? 0 : 1
        },
        "session": "asdasd"
    }
    // console.log("output", output);
    state.ws3.send(JSON.stringify(output))
}
const changeCursingPoint = (e) => {
    // console.log('changeCursingPoint', e);
    var output = {
        "feature": "ptz",
        "method": "set_cursingPoint",
        "content": {
            "ptz_id": state.ptzinto.ptz_id,
            "cursingPoint_id": e
        },
        "session": "asdasd"
    }
    state.ws3.send(JSON.stringify(output))
}
const sendPtzControl = () => {
    if (state.ptzControlStatus !== 'none') {
        // console.log('ptz', state.ptzControlStatus);
        var output = {
            "feature": "ptz",
            "method": "set_continuousMove",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "ptz_id": camID,
                "ptz_continuousMove": state.ptzControlStatus,
            }
        }
        state.ws3.send(JSON.stringify(output))
        setTimeout(() => {
            if (state.ptzControlStatus !== 'none') {
                sendPtzControl()
            }
        }, 300)
    }
}
const setPtzCurrentAngle = () => {
    state.ptzCurrentAngleInput = true
    let intArray = state.ptzCurrentAngle.map(value => Number(value));
    var output = {
        "feature": "ptz",
        "method": "set_PtzAngle",
        "content": {
            "ptz_id": state.ptzinto.ptz_id,
            "ptz_currentAngle": intArray
        },
        "session": "asdasd"
    }
    state.ws3.send(JSON.stringify(output))
}
const backmap = (e) => {
    const buttonElement = document.querySelector(`.${state.className}`);
    var timeoutid = null
    map.fitBounds(state.imageBounds);  // 回到預設邊界
    if (timeoutid !== null) {
        clearTimeout(timeoutid);
        timeoutid = null;
    }
    timeoutid = setTimeout(() => {
        buttonElement.classList.add('hidden');
        timeoutid = null;
    }, 1000)
}
let temprefusimgint = null
const initWs3 = () => {
    const openwebsocket03 = () => {
        if ($webSocketconnect03().readyState === 1) {
            state.ws3 = $webSocketconnect03()
            setTimeout(() => {
                state.mapUrlBase64 = 'data:image/png;base64,' + base64
                getBase64ImageSize(state.mapUrlBase64)
                    .then(size => {
                        state.imgWidth = size.width / 4
                        state.imgHeight = -size.height / 4
                        state.imgrealsize.w = size.width / 4
                        state.imgrealsize.h = -size.height / 4
                        // state.imgHeight = -300
                        if (state.initPTZimgStatus) {
                            rundev('base64')
                        } else {
                            if (state.imageOverlayTemp !== null) {
                                state.imageOverlayTemp.setUrl(state.mapUrlBase64);
                            }
                        }
                    })
                    .catch(err => {
                        console.error("錯誤：", err.message);
                    });
                function getBase64ImageSize(base64String) {
                    return new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => {
                            resolve({
                                width: img.width,
                                height: img.height
                            });
                        };
                        img.onerror = (err) => {
                            reject(new Error("無法載入圖片"));
                        };
                        img.src = base64String;
                        // img.style.opacity = '.5'
                        // console.log(img);
                    });
                }
            }, 1000)
            // temprefusimgint = setInterval(() => {
            //     let queryBackground = {
            //         feature: 'image',
            //         method: 'query_background_map',
            //         session: Math.random().toString(36).substr(2),
            //         content: {},
            //     }
            //     state.ws3.send(JSON.stringify(queryBackground))
            // }, 1000)
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
            const messageEvent = (event) => {
                var data = JSON.parse(event.data)
                var feature = data.feature
                var method = data.method
                if (feature === "image" && method === "query_background_map") {
                    // state.mapUrlBase64 = 'data:image/png;base64,' + data.content[0].image_day_base64
                    // getBase64ImageSize(state.mapUrlBase64)
                    //     .then(size => {
                    //         state.imgWidth = size.width / 4
                    //         state.imgHeight = -size.height / 4
                    //         state.imgrealsize.w = size.width / 4
                    //         state.imgrealsize.h = -size.height / 4
                    //         // state.imgHeight = -300
                    //         if (state.initPTZimgStatus) {
                    //             rundev('base64')
                    //         } else {
                    //             if (state.imageOverlayTemp !== null) {
                    //                 state.imageOverlayTemp.setUrl(state.mapUrlBase64);
                    //             }
                    //         }
                    //     })
                    //     .catch(err => {
                    //         console.error("錯誤：", err.message);
                    //     });
                    // function getBase64ImageSize(base64String) {
                    //     return new Promise((resolve, reject) => {
                    //         const img = new Image();
                    //         img.onload = () => {
                    //             resolve({
                    //                 width: img.width,
                    //                 height: img.height
                    //             });
                    //         };
                    //         img.onerror = (err) => {
                    //             reject(new Error("無法載入圖片"));
                    //         };
                    //         img.src = base64String;
                    //         // img.style.objectFit = 'fill'
                    //         // console.log(img);
                    //     });
                    // }
                }
                data = null
                feature = null
                method = null
            }
            state.ws3.addEventListener("message", messageEvent)
        } else if ($webSocketconnect03().readyState !== 1) {
            setTimeout(() => {
                openwebsocket03()
            }, 1000)
        }
    }
    openwebsocket03()
}
const switchWK = (e) => {
    if (e) {
        runwk()
    } else {
        stopProgram()
        state.tempcursingPoint_list = {}
    }
}
const stopProgram = () => {
    if (state.webWorker !== null) {
        state.webWorker.terminate();
        state.webWorker = null
    }
}
const cutoverCanvasMap = () => {
    console.log('ccutoverCanvasMap');
    if (map !== null) {
        let mapWidth = mapcanvas.value.getBoundingClientRect().width
        let mapHeight = -mapcanvas.value.getBoundingClientRect().height
        state.imgHeight = mapHeight / 8
        state.imgWidth = mapWidth / 8
        state.webWorker.postMessage({
            type: 'canvasSize',
            parameter: {
                imgWidth: state.imgWidth,
                imgHeight: state.imgHeight
            }
        })
        // var Bounds = [[0, 0], [state.imgHeight * 2, state.imgWidth * 2]];

        var imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
        state.imageBounds = imageBounds
        state.imageOverlayTemp.setBounds(imageBounds)
        map.invalidateSize()
        map.setMaxBounds(imageBounds)
        map.fitBounds(imageBounds)
        console.log('map.getZoom()', map.getZoom());
        map.setMinZoom(map.getZoom());  // 把目前 zoom 設為最小縮放
    }
}
const runwk = () => {
    state.webWorker = new Worker('/worker/roiTrack-onlyroi-panoramic.js');
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
                state.webWorker.postMessage({
                    type: 'canvasSize',
                    parameter: {
                        imgWidth: 640,
                        imgHeight: 480
                    }
                })
            }
            sendMap()
        } else if (type === 'panoramic_info') {
            // console.log('panoramic_info', parameter);
            // temp = parameter
            panoramicGet(parameter)
            // changeMapBlob(parameter, 'delect')
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
onMounted(() => {
    initWs3()
    // let temp = null

    // const randere = () => {
    //     state.temptimeee = setTimeout(() => {
    //         if (temp !== null) {
    //             panoramicGet(temp)
    //         }
    //         randere()
    //     }, 1000)
    // }
    // randere()
    document.addEventListener('mousedown', (event) => {
        // event.preventDefault()
        if (event.button === 0 && map !== null) {
            map.dragging.disable()
        }

    });
    document.addEventListener('mouseup', () => {
        if (event.button === 0 && map !== null) {
            map.dragging.enable()
        }
    });
})
onBeforeUnmount(() => {
    if (state.wsListener3.close !== null) {
        state.ws3.removeEventListener("close", state.wsListener3.close)
        state.wsListener3.close = null
    }
    if (state.wsListener3.message !== null) {
        state.ws3.removeEventListener("message", state.wsListener3.message)
        state.wsListener3.message = null
    }
    if (state.ws3 !== null) {
        state.ws3 = null
    }
    if (state.webWorker !== null) {
        state.webWorker.terminate();
        state.webWorker = null
    }
    if (state.temptimeee !== null) {
        clearTimeout(state.temptimeee)
        state.temptimeee = null
    }
})
defineExpose({
    invaliMapSzie,
    switchWK,
    cutoverCanvasMap
})
</script>
<style>
.only-roi0 * {
    pointer-events: none !important;
}

.ptzctrolContent {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    width: fit-content;
    /* transform: translate(-98%, -100%); */
}

.ptzctrolContent1 {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    /* width: fit-content; */
    width: 40px;
    transform: translate(-66%, -79%);
    color: #ffa2a2;
}

.ptz-c-btn {
    background-color: #FFC164;
    /* width: 50px; */
    height: 25px;
    line-height: 1.5;
    cursor: pointer;
}

.ptz-c-btn:hover {
    background-color: #ffb341;
}

.ptz-c-btn:active {
    background-color: #fcc36d;
}

.c-roitempdiv {
    background-color: #ff99005d;
    transform: translate(6px, 6px);
    pointer-events: none;
    position: relative;
}
</style>
<style scoped>
.ptz-control-c {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 999;
}

.ptz-control-dialogs {
    background-color: #fff;
    /* position: fixed; */
    /* right: 10%; */
    /* bottom: 40%; */
    width: 370px;
    border: 2px #878787 solid;
    padding: .5em;
    border-radius: 5px;
    /* z-index: 1; */
}

.ptz-text {
    font-size: 18px;
    color: #878787;
}

.ptz-control {
    position: relative;
    width: 80%;
}

.ptz-ctrl-btn-bg {
    background-color: #ffffff00;
    cursor: pointer;
    transition: all .1s;
}

.ptz-ctrl-btn-bg:hover {
    background-color: #00000012;
}

.ptz-ctrl-btn-bg:active {
    background-color: #88888848;
}

.ptz-ctrl-btn-top {
    position: absolute;
    top: 8%;
    left: 34%;
    width: 32%;
    height: 19%;
    border-bottom-right-radius: 57px;
    border-bottom-left-radius: 57px;
}

.ptz-ctrl-btn-bottom {
    position: absolute;
    top: 75%;
    left: 34%;
    width: 32%;
    height: 19%;
    border-top-right-radius: 57px;
    border-top-left-radius: 57px;
}

.ptz-ctrl-btn-left {
    position: absolute;
    top: 36%;
    left: 6%;
    width: 19%;
    height: 32%;
    border-top-right-radius: 57px;
    border-bottom-right-radius: 57px;
}

.ptz-ctrl-btn-right {
    position: absolute;
    top: 36%;
    left: 74%;
    width: 19%;
    height: 32%;
    border-top-left-radius: 57px;
    border-bottom-left-radius: 57px;
}

.ptz-status-grid {
    width: 100%;
    display: grid;
    grid-template-columns: 24% 56% 20%;
}

.ptz-input-grid {
    display: grid;
    grid-template-columns: 40% 40% 20%
}

.ptz-selection-grid {
    display: grid;
    grid-template-columns: 60% 40%;
}

.ptz-selection001-grid {
    display: grid;
    grid-template-columns: 26% 74%;
}

/* 開關css */
.c-switch-lo {
    position: relative;
    display: grid;
    grid-template-columns: 50% 50%;
    text-align: center;
    border: #878787 1px solid;
    border-radius: 1em;
    color: #878787;
    cursor: pointer;
}

.c-switch-a {
    position: relative;
    z-index: 1;
}

.c-switch-b {
    z-index: 1;
}

.c-switch-a::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #878787;
    border: #979797 1px solid;
    border-radius: 1em;
    z-index: -1;
    transition: all .3s;
    opacity: 0.65;
}

.c-switch-after-add::after {
    background-color: #6795D4;
    border: #5075A9 1px solid;
    left: 100%;
    box-shadow: 0px 0px 0px 0px #6795D4;
    animation: gogogo 2.5s infinite linear;
}

.c-switch-after-add1::after {
    border: #5075A9 1px solid;
    left: 100%;
}

.c-switch-foucs {
    color: #fff;
}

@keyframes gogogo {
    0% {
        opacity: 0.65;
        box-shadow: 0px 0px 0px 0px #6795D4;
    }

    50% {
        opacity: 1;
        box-shadow: 1px 1px 8px 5px #6795D4;
    }

    100% {
        opacity: 0.65;
        box-shadow: 0px 0px 0px 0px #6795D4;
    }
}

/* 開關css */
</style>