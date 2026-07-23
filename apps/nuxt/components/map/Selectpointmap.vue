<template>
    <div class="item-card-content" id="map-top-b" style="height: 100%; width: 100%;z-index: 0;" ref="mapcanvas">
        <!-- <LMap ref="LMmap" :min-zoom="state.minZoom" :crs="state.crs" style="height: 100%; width: 100%"
            :options="state.mapOptions" @ready="rundev('map')">
            <div :class="`reset-btn123 hidden ${state.className}`" @click="backmap">
                <NuxtImg src="/images/icon/return.png">
            </div>
        </LMap> -->
        <div ref="LMmap" style="height: 100%; width: 100%;z-index: 0;">
            <div :class="`reset-btn123 hidden ${state.className}`" @click="backmap">
                <NuxtImg src="/images/icon/return.png" />
            </div>
        </div>
        <div id="message" style="display: none;">
        </div>
        <!-- <div class="setCursingPointDig" id="setCursingPointDig"
            :class="state.setCursingPointDig ? '' : 'display-setCursingPointDig'">
            <div v-if="state.setCursingPointType === 0">解除巡弋狀態</div>
            <div v-else-if="state.setCursingPointType === 1">移到該雲台</div>
        </div> -->
    </div>
</template>
<script setup>
import { ref } from 'vue'
// import L from 'leaflet'
const { $webSocketconnect03 } = useNuxtApp()
const { $webSocketconnect05 } = useNuxtApp()
const { $webSocket03URL } = useNuxtApp()
const LMmap = ref(null)
const mapcanvas = ref(null)
var map = null
const runIndex = reactive({
    index: 0
})
const backbtn = useAttrs().backbtn
const state = reactive({
    mainbackbtn: true,
    rtcPeerConnectionItems: [],
    keyctrl: false,
    ws3: {
        readyState: 0
    },
    wsListener3: {
        close: null,
        message: null
    },
    ws5: {
        readyState: 0
    },
    wsListener5: {
        close: null,
        message: null
    },
    wkTemp: {
        cursingPoint_id: [],
        ptz: [],
        ptzinto: null
    },
    imgWidth: 640 / 3,
    imgHeight: -480 / 3,
    minZoom: -3,
    maxZoom: 20,
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
    webWorker: null,
    ptz: [],
    cursingPoint_id: [],
    tempPtz: [],
    tempCursingPoint: [],
    focusCursingPoint: null,
    className: 'rest0-btn' + Math.random().toString(36).substr(2),
    mapUrlBase64: '/EMPTYv1-fill.png', imageBounds: [],
    initPTZimgStatus: true,
    imageOverlayTemp: null,
    time111: null,
})
const props = useAttrs().formtData
const camID = useAttrs().camID
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
// watch(
//     () => runIndex.index,
//     (data, prevData) => {
//         var loadingPlugin = 6 // 要載入幾個地圖套件(需含主程式)
//         if (data === loadingPlugin) {
//             // console.log(runIndex.index);
//             // leafletJsInitForPhoto()
//         }
//     }
// )
//  測試子組件使用父組件方法
// const emit = defineEmits(['dataFromChild'])
// setTimeout(() => {
//     sendDataToParent()
// }, 1000)
// const sendDataToParent = () => {
//     const data = { example: 'some data' }
//     emit('dataFromChild', data)
// }
const addPtzs = (e) => {
    var index = findFirstNullIndex(state.tempPtz)
    if (index !== null) {
        let currentEvent = state.tempPtz[index]
        currentEvent.data = e
        let marker1 = currentEvent.object.marker1
        // let marker2 = currentEvent.object.marker2
        let polygon = currentEvent.object.polygon
        let centerLine = currentEvent.object.centerLine
        let myIconHtml = e.html
        let myIcon = L.divIcon({ html: myIconHtml });
        marker1.setLatLng(e.location.marker1)
        marker1.setIcon(myIcon)
        // marker2.setLatLng(e.location.marker2)
        polygon.setLatLngs(e.location.polygon)
        polygon.setStyle({
            className: 'rotated-polygon', // Apply the class for rotation
            weight: 0,
            color: '#64646A',
            fillColor: '#F6EE73',
            // fillOpacity: 0.7
            // fillColor: alarm1 ? 'rgb(255 0 0 / 50%)' : '#F6EE73',
            fillOpacity: e.objectStyle.currentPtz ? 0.7 : 0.3
        })
        centerLine.setLatLngs(e.location.centerLine)
        centerLine.setStyle({
            stroke: true,
            weight: 1.5,
            color: 'gray',
            // opacity: 1
            opacity: e.objectStyle.currentPtz ? 1 : 0.6
            // dashArray: '10, 10'
        })
        currentEvent = null
        marker1 = null
        // marker2 = null
        polygon = null
        centerLine = null
        myIconHtml = null
        myIcon = null
    }
    index = null
    function findFirstNullIndex(arr) {
        let len = arr.length
        for (let i = 0; i < len; i++) {
            if (arr[i].data === null) {
                return i; // 找到第一个 data = null 的索引，立即返回
            }
        }
        return null; // 如果没有找到，返回 null
    }
}
const changePtzs = (e) => {
    var index = findFirstNullIndex(state.tempPtz, e.id)
    // console.log("main changeCursingPoints", index);
    if (index !== null) {
        let currentEvent = state.tempPtz[index]
        currentEvent.data = e
        let marker1 = currentEvent.object.marker1
        let marker2 = currentEvent.object.marker2
        let polygon = currentEvent.object.polygon
        let centerLine = currentEvent.object.centerLine
        let myIconHtml = e.html
        let myIcon = L.divIcon({ html: myIconHtml });
        marker1.setLatLng(e.location.marker1)
        marker1.setIcon(myIcon)
        marker2.setLatLng(e.location.marker2)
        polygon.setLatLngs(e.location.polygon)
        polygon.setStyle({
            className: 'rotated-polygon', // Apply the class for rotation
            weight: 0,
            color: '#64646A',
            fillColor: '#F6EE73',
            fillOpacity: e.objectStyle.currentPtz ? 0.7 : 0.3,
            // fillColor: alarm1 ? 'rgb(255 0 0 / 50%)' : '#F6EE73',
            // fillOpacity: currentPTZ ? 0.7 : 0.3,

        })
        centerLine.setLatLngs(e.location.centerLine)
        centerLine.setStyle({
            stroke: true,
            weight: 1.5,
            color: 'gray',
            opacity: e.objectStyle.currentPtz ? 1 : 0.6
            // opacity: currentPTZ ? 1 : 0.6
            // dashArray: '10, 10'
        })
        currentEvent = null
        marker1 = null
        marker2 = null
        polygon = null
        centerLine = null
        myIconHtml = null
        myIcon = null
    }
    index = null
    function findFirstNullIndex(arr, id) {
        let len = arr.length
        for (let i = 0; i < len; i++) {
            if (arr[i].data !== null) {
                if (arr[i].data?.id === id) {
                    return i
                }
            }
        }
        return null; // 如果没有找到，返回 null
    }
}
const removePtzs = (e) => {
    var index = findFirstNullIndex(state.tempPtz, e.id)
    // console.log("main changeCursingPoints", index);
    if (index !== null) {
        let currentEvent = state.tempPtz[index]
        currentEvent.data = null
        let marker1 = currentEvent.object.marker1
        let marker2 = currentEvent.object.marker2
        let polygon = currentEvent.object.polygon
        let centerLine = currentEvent.object.centerLine
        let myIcon = L.divIcon({ html: '' });
        marker1.setLatLng([10000, -10000])
        marker1.setIcon(myIcon)
        marker2.setLatLng([10000, -10000])
        polygon.setLatLngs([[10000, -10000], [10000, -10000], [10000, -10000]])
        centerLine.setLatLngs([[10000, -10000], [10000, -10000], [10000, -10000]])
        currentEvent = null
        marker1 = null
        marker2 = null
        polygon = null
        centerLine = null
        myIcon = null
    }
    index = null
    function findFirstNullIndex(arr, id) {
        let len = arr.length
        for (let i = 0; i < len; i++) {
            if (arr[i].data !== null) {
                if (arr[i].data?.id === id) {
                    return i
                }
            }
        }
        return null; // 如果没有找到，返回 null
    }
}
const addCursingPoints = (e) => {
    // console.log(e);
    var index = findFirstNullIndex(state.tempCursingPoint)
    if (index !== null) {
        let currentEvent = state.tempCursingPoint[index]
        currentEvent.data = e
        let marker = currentEvent.object
        marker.options.cursingPointparameter = currentEvent.data
        currentEvent.polyline.options.cursingPointparameter = marker
        // console.log('test add ', marker);cursingPointparameter
        let myIconHtml = e.html
        let myIcon = L.divIcon({ html: myIconHtml });
        var latlngs = [
            e.location,
            e.ptz_location
        ];
        currentEvent.polyline.setLatLngs(latlngs)
        currentEvent.polyline.setStyle({
            color: e.objectStyle.color
            // opacity: e.objectStyle.currentPtz ? 1 : 0.6
        })
        marker.setLatLng(e.location)
        marker.setIcon(myIcon)
        currentEvent = null
        marker = null
        myIconHtml = null
        myIcon = null
    }
    index = null
    function findFirstNullIndex(arr) {
        let len = arr.length
        for (let i = 0; i < len; i++) {
            if (arr[i].data === null) {
                return i; // 找到第一个 data = null 的索引，立即返回
            }
        }
        return null; // 如果没有找到，返回 null
    }
}
const changeCursingPoints = (e) => {
    var index = findFirstNullIndex(state.tempCursingPoint, e.id)
    // console.log("main changeCursingPoints", index);
    if (index !== null) {
        let currentEvent = state.tempCursingPoint[index]
        currentEvent.data = e
        let marker = currentEvent.object
        let myIconHtml = e.html
        let myIcon = L.divIcon({ html: myIconHtml, iconSize: [100, 100] });
        marker.setLatLng(e.location)
        marker.setIcon(myIcon)
        // marker.setStyle({
        //     opacity: e.objectStyle.currentPtz ? 1 : 0.6
        // })
        currentEvent = null
        marker = null
        myIconHtml = null
        myIcon = null
    }
    index = null
    function findFirstNullIndex(arr, id) {
        let len = arr.length
        for (let i = 0; i < len; i++) {
            if (arr[i].data !== null) {
                if (arr[i].data?.id === id) {
                    return i
                }
            }
        }
        return null; // 如果没有找到，返回 null
    }
}
const removeCursingPoints = (e) => {
    var index = findFirstNullIndex(state.tempCursingPoint, e.id)
    // console.log("main changeCursingPoints", index);
    if (index !== null) {
        let currentEvent = state.tempCursingPoint[index]
        currentEvent.data = null
        let marker = currentEvent.object
        marker.options.cursingPointparameter = null
        currentEvent.polyline.options.cursingPointparameter = null
        let myIconHtml = e.html
        let myIcon = L.divIcon({ html: '' });
        var latlngs = [
            [10000, -10000],
            [10000, -10000]
        ];
        currentEvent.polyline.setLatLngs(latlngs)
        marker.setLatLng([10000, -10000])
        marker.setIcon(myIcon)
        currentEvent = null
        marker = null
        myIconHtml = null
        myIcon = null
    }
    index = null
    function findFirstNullIndex(arr, id) {
        let len = arr.length
        for (let i = 0; i < len; i++) {
            if (arr[i].data !== null) {
                if (arr[i].data?.id === id) {
                    return i
                }
            }
        }
        return null; // 如果没有找到，返回 null
    }
}
const invaliMapSzie = () => {
    if (map !== null) {
        let mapWidth = mapcanvas.value.getBoundingClientRect().width
        let mapHeight = -mapcanvas.value.getBoundingClientRect().height
        state.imgHeight = mapHeight / 4
        state.imgWidth = mapWidth / 4
        if (state.webWorker !== null) {
            state.webWorker.postMessage({
                type: 'canvasSize',
                parameter: {
                    imgWidth: state.imgWidth,
                    imgHeight: state.imgHeight
                }
            })
        }
        // var Bounds = [[0, 0], [state.imgHeight * 2, state.imgWidth * 2]];

        var imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
        state.imageBounds = imageBounds
        state.imageOverlayTemp.setBounds(imageBounds)
        map.invalidateSize()
        map.setMaxBounds(imageBounds)
        map.fitBounds(imageBounds)
        // setTimeout(() => {
        //     const buttonElement = document.querySelector(`.${state.className}`);
        //     buttonElement.classList.add('hidden');
        // }, 1000)
        setTimeout(() => {
            if (backbtn === undefined) {
                const buttonElement = document.querySelector(`.${state.className}`);
                buttonElement.classList.add('hidden');
            } else {
                emit('backbtnfn', 'hidden')
            }
        }, 1000)


        // var imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
        // map.invalidateSize()
        // map.fitBounds(imageBounds)

        // let mapWidth = mapcanvas.value.getBoundingClientRect().width
        // let mapHeight = mapcanvas.value.getBoundingClientRect().height
        // const minZoomX = Math.log2(state.imgWidth / mapWidth);
        // const minZoomY = Math.log2(Math.abs(state.imgHeight) / mapHeight);
        // let minZoom = Math.max(minZoomX, minZoomY); // 確保不會小於 0
        // map.setMinZoom(state.imgWidth < mapWidth || Math.abs(state.imgHeight) < mapHeight ? Math.abs(minZoom) : minZoom)
        // map.setMaxZoom(3)
        // map.fitBounds(imageBounds)
        // var div = document.querySelector('.' + state.className)
        // div.classList.add('hidden')
    }
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
const emit = defineEmits(['toTab', 'mapSetMapPtzStatus', 'mapSetCursingPint', 'backbtnfn', 'selectCam'])
const leafletJsInitForPhoto = () => {

    map = L.map(LMmap.value, state.mapOptions);
    // map = LMmap.value.leafletObject
    var zindex = 10
    // console.log(map);
    // state.imgHeight = state.imgHeight / 4
    // state.imgWidth = state.imgWidth / 4
    map.setView([state.imgHeight / 2, state.imgWidth / 2], 1);
    map._layersMaxZoom = 20;
    // let data = props.layoutData
    var imageUrl = state.mapUrlBase64, // /mock/ir13807.jpg
        imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    var imageOverlay = L.imageOverlay(imageUrl, imageBounds, { opacity: 0.7 });
    imageOverlay.setZIndex(-2);
    imageOverlay.addTo(map);
    state.imageOverlayTemp = imageOverlay
    state.imageBounds = imageBounds
    map.setMaxBounds(imageBounds)
    map.fitBounds(imageBounds)
    // console.log(state.imgHeight, state.imgWidth);
    let mapWidth = mapcanvas.value.getBoundingClientRect().width
    let mapHeight = mapcanvas.value.getBoundingClientRect().height
    const minZoomX = Math.log2(state.imgWidth / mapWidth);
    const minZoomY = Math.log2(Math.abs(state.imgHeight) / mapHeight);
    let minZoom = Math.max(minZoomX, minZoomY); // 確保不會小於 0
    map.setMinZoom(state.imgWidth < mapWidth || Math.abs(state.imgHeight) < mapHeight ? Math.abs(minZoom) : minZoom)
    map.setMaxZoom(3)

    if (state.refreshMapTimeout !== null) {
        clearTimeout(state.refreshMapTimeout)
    }
    // 雷達
    var mouseleaveObject = null
    var imgurl = '/images/fs/current positionpoint_drag.svg'
    var myIcon = L.icon({
        iconUrl: imgurl,
        iconSize: [34, 34],
    });
    var userMarker = L.marker([-10000, 10000], { draggable: false, opacity: 0.001 }).addTo(map);
    var userMarker2 = L.marker([-10000, 10000], { icon: myIcon, draggable: true }).addTo(map);
    userMarker.setZIndexOffset(5)
    userMarker2.setZIndexOffset(5)
    var angle = 25
    var latlng = userMarker.getLatLng();
    var r = (360 - calculateAngle(latlng, userMarker2.getLatLng())) + 90
    if (r > 360) {
        r = r - 360
    }
    var rw = runRadiusUser(userMarker.getLatLng().lat, userMarker.getLatLng().lng, calculatePixelDistance(userMarker2.getLatLng(), userMarker.getLatLng()), r, angle)

    // 建立暫存物件
    var setCursingPointMarker = L.marker([-10000, 10000], { draggable: false, zIndexOffset: 9999 }).addTo(map);
    var setCursingPointType = 0
    var selectedPtzID = null
    var selectedCursingPointID = null
    // setCursingPointMarker.on('click', () => {
    //     if (setCursingPointType === 0) {
    //         emit('mapSetMapPtzStatus', 1)
    //     } else {
    //         console.log('不是選擇到當前PTZ TAB', selectedPtzID);
    //         emit('toTab', selectedPtzID)
    //     }
    //     setCursingPointMarker.setLatLng([-10000, 10000])
    // })
    for (var i = 0; i < 300; i++) {
        var marker123333 = L.marker([10000, -10000], {
            index: i,
            cursingPointparameter: null
        }).addTo(map);
        var latlngs = [
            [10000, -10000],
            [10000, -10000]
        ];

        var polyline = L.polyline(latlngs, { color: 'red', weight: 1, cursingPointparameter: null }).addTo(map);
        marker123333.setZIndexOffset(10)
        marker123333.on('mousemove', (e) => {
            if (state.tempCursingPoint[e.target.options.index].data.objectStyle.currentPtz) {
                selectedCursingPointID = state.tempCursingPoint[e.target.options.index].data.id
                state.focusCursingPoint = e.target.getLatLng()
            }
            mouseleaveObject = true
        })
        marker123333.on('mouseout', (e) => {
            state.focusCursingPoint = null
            mouseleaveObject = false
        })
        state.tempCursingPoint.push({
            id: i,
            object: marker123333,
            data: null,
            polyline
        })
        marker123333 = null
        zindex++
    }
    var imgurl = '/images/fs/current positionpoint_drag.svg'
    var myIcon = L.icon({
        iconUrl: imgurl,
        iconSize: [34, 34],
    });
    for (var i = 0; i < 50; i++) {
        var marker1 = L.marker([10000, -10000]).addTo(map);
        var marker2 = L.marker([10000, -10000], { icon: myIcon, index: i }).addTo(map);
        var marker3 = L.marker([10000, -10000]).addTo(map);
        var polygon = L.polygon([[10000, -10000], [10000, -10000], [10000, -10000]], { index: i }).addTo(map);
        var centerLine = L.polygon([[10000, -10000], [10000, -10000], [10000, -10000]]).addTo(map);
        marker1.setZIndexOffset(-1)
        marker2.setZIndexOffset(-1)
        marker3.setZIndexOffset(-1)
        polygon.on('click', (e) => {
            var index = e.target.options?.index
            var judgePtz = state.tempPtz[index].data.ptz_id === camID
            selectedPtzID = state.tempPtz[index].data.ptz_id
            if (index !== null && judgePtz && props.ptzswitch === 1) {
                var p1 = state.tempPtz[index].object.marker1.getLatLng()
                var p2 = state.tempPtz[index].object.marker2.getLatLng()
                userMarker.setLatLng(p1)
                userMarker2.setLatLng(p2)
                r = (360 - calculateAngle(userMarker.getLatLng(), userMarker2.getLatLng())) + 90
                if (r > 360) {
                    r = r - 360
                }
                rw.remove()
                rw = runRadiusUser(userMarker.getLatLng().lat, userMarker.getLatLng().lng, calculatePixelDistance(userMarker2.getLatLng(), userMarker.getLatLng()), r, angle)
            } else if (index !== null && judgePtz && props.ptzswitch === 2) {
                setCursingPointType = 0
                var setCursingPoinHtml = `<div class="setCursingPointDig"><div>解除巡弋狀態</div></div>`
                let myIcon = L.divIcon({ html: setCursingPoinHtml });
                setCursingPointMarker.setIcon(myIcon)
                setCursingPointMarker.setLatLng(e.latlng)
            } else if (index !== null && !judgePtz) {
                setCursingPointType = 1
                var setCursingPoinHtml = `<div class="setCursingPointDig"><div>移到該雲台</div></div>`
                let myIcon = L.divIcon({ html: setCursingPoinHtml });
                setCursingPointMarker.setIcon(myIcon)
                setCursingPointMarker.setLatLng(e.latlng)
            }

        })
        const addindex = (e) => {
            mouseleaveObject = true
        }
        const removeindex = (e) => {
            mouseleaveObject = false
            console.log('out');
        }
        const runEvent = (object, type) => {
            object.on(type, (e) => { type === 'mousemove' ? addindex(e) : removeindex(e) })
        }
        let oblisten = [
            polygon, marker2
        ]
        oblisten.forEach((item) => {
            runEvent(item, 'mousemove')
            runEvent(item, 'mouseout')
        })
        state.tempPtz.push({
            id: i,
            object: {
                marker1,
                marker2,
                marker3,
                polygon,
                centerLine
            },
            data: null
        })
        marker1 = null
        marker2 = null
        marker3 = null
        polygon = null
        centerLine = null
        zindex++
    }

    userMarker.on('drag', (event) => {
        var latlng = event.target.getLatLng();
        rw.remove()
        var r = (360 - calculateAngle(latlng, userMarker2.getLatLng())) + 90
        if (r > 360) {
            r = r - 360
        }
        rw = runRadiusUser(latlng.lat, latlng.lng, calculatePixelDistance(userMarker2.getLatLng(), latlng), r, angle)
    });
    userMarker2.on('dragend', (event) => {
        if (state.focusCursingPoint !== null) {
            latlng = state.focusCursingPoint
            event.target.setLatLng(latlng);
            emit('mapSetCursingPint', selectedCursingPointID)
        }
    })
    userMarker2.on('mousemove', (event) => {
        event.target.setZIndexOffset(99)
        mouseleaveObject = true
    })
    userMarker2.on('mouseout', (event) => {
        event.target.setZIndexOffset(1)
        mouseleaveObject = false

    })
    userMarker2.on('drag', (event) => {
        var latlng = event.target.getLatLng();
        event.target.setZIndexOffset(1)
        if (state.focusCursingPoint !== null) {
            latlng = state.focusCursingPoint
        }
        rw.remove()
        var r = (360 - calculateAngle(userMarker.getLatLng(), latlng)) + 90
        if (r > 360) {
            r = r - 360
        }
        rw = runRadiusUser(userMarker.getLatLng().lat, userMarker.getLatLng().lng, calculatePixelDistance(latlng, userMarker.getLatLng()), r, angle)
    });

    function calculatePixelDistance(pointAPixel, pointBPixel) {
        var dx = pointBPixel.lng - pointAPixel.lng;
        var dy = pointBPixel.lat - pointAPixel.lat;
        return Math.sqrt(dx * dx + dy * dy);
    }
    map.on('click', (e) => {
        if (!mouseleaveObject) {
            var p1 = [-10000, 10000]
            var p2 = [-10000, 10000]
            userMarker.setLatLng(p1)
            userMarker2.setLatLng(p2)
            r = (360 - calculateAngle(userMarker.getLatLng(), userMarker2.getLatLng())) + 90
            if (r > 360) {
                r = r - 360
            }
            rw.remove()
            rw = runRadiusUser(userMarker.getLatLng().lat, userMarker.getLatLng().lng, calculatePixelDistance(userMarker2.getLatLng(), userMarker.getLatLng()), r, angle)
            setCursingPointMarker.setLatLng([-10000, 10000])
        }
    })
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
    // const selectorControl = 
    let selectCamItems = []
    let objectArray = state.tempCursingPoint.map(item => item.object);
    let polylineArray = state.tempCursingPoint.map(item => item.polyline);
    enableRectangleSelection(map, {
        style: {
            color: '#1a73e8',
            fillOpacity: 0.18
        },
        autoClearDelay: 400,
        onComplete: (bounds) => {
            selectCamItems = []
            // bounds 是 L.LatLngBounds
            // console.log('使用者選取的範圍（LatLngBounds）:', objectArray); // bbox string
            let filtered = objectArray.filter(m => bounds.contains(m.getLatLng()));
            // let filteredpolyline = polylineArray.filter(m => bounds.contains(m.getLatLngs()));
            let filteredPolyline = polylineArray.filter(m => {
                let line = turf.lineString(m.getLatLngs().map(ll => [ll.lng, ll.lat]));
                let box = turf.bboxPolygon([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]);
                return turf.booleanIntersects(line, box);
            });
            objectArray.forEach((item) => {
                if (item.options.cursingPointparameter !== null) {
                    var myIconHtml = `<div class="lnder0move" style="border: 2px solid ${item.options.cursingPointparameter.objectStyle.color};opacity:0.6;pointer-events:auto;width:12px;height:12px;"></div><div class="lnder0move-font" style="color:${item.options.cursingPointparameter.objectStyle.color};opacity:0.6;pointer-events: none;">${item.options.cursingPointparameter.objectStyle.cursingPoint_name}</div>`
                    let myIcon = L.divIcon({ html: myIconHtml });
                    item.setIcon(myIcon)
                }
            })
            // polylineArray.forEach((item) => {
            //     if (item.options.cursingPointparameter !== null) {
            //         console.log('使用者選取的範圍（LatLngBounds）:', item);
            //     }
            // })
            filtered.forEach((item) => {
                var myIconHtml = `<div class="lnder0move" style="border: 2px solid red;opacity:1;pointer-events:auto;width:12px;height:12px;"></div><div class="lnder0move-font" style="color:red;opacity:1;pointer-events: none;">${item.options.cursingPointparameter.objectStyle.cursingPoint_name}</div>`
                let myIcon = L.divIcon({ html: myIconHtml });
                item.setIcon(myIcon)
                selectCamItems.push(item.options.cursingPointparameter.id)
            })
            filteredPolyline.forEach((item) => {
                let marker = item.options.cursingPointparameter
                var myIconHtml = `<div class="lnder0move" style="border: 2px solid red;opacity:1;pointer-events:auto;width:12px;height:12px;"></div><div class="lnder0move-font" style="color:red;opacity:1;pointer-events: none;">${marker.options.cursingPointparameter.objectStyle.cursingPoint_name}</div>`
                let myIcon = L.divIcon({ html: myIconHtml });
                item.options.cursingPointparameter.setIcon(myIcon)
                selectCamItems.push(marker.options.cursingPointparameter.id)
                console.log('使用者選取的範圍（LatLngBounds）:', item);
            })
            emit('selectCam', selectCamItems)
            // 你可以做到：map.fitBounds(bounds), 查詢圖層內點, 或顯示結果資訊等
            // 範例：縮放到選取範圍
            // map.fitBounds(bounds);
        }
    });
}
// 選取框
const enableRectangleSelection = (map, options = {}) => {
    const style = Object.assign({
        color: '#1a73e8',       // 邊框顏色（藍）
        weight: 1.5,
        dashArray: null,
        fillColor: '#1a73e8',   // 填充顏色（藍）
        fillOpacity: 0.15,      // 透明度
    }, options.style || {});
    let objectArray = state.tempCursingPoint.map(item => item.object);
    let polylineArray = state.tempCursingPoint.map(item => item.polyline);
    let startPoint = null;         // L.Point (container point)
    let rect = null;               // L.Rectangle instance
    let isSelecting = false;
    let lastMouseEvent = null;

    // 暫停地圖互動（避免拖動衝突）
    function disableMapInteraction() {
        if (map.dragging && map.dragging.enabled()) map.dragging.disable();
        if (map.doubleClickZoom && map.doubleClickZoom.enabled()) map.doubleClickZoom.disable();
        if (map.boxZoom && map.boxZoom.enabled()) map.boxZoom.disable();
        map.getContainer().style.cursor = 'crosshair';
    }
    function enableMapInteraction() {
        if (map.dragging && !map.dragging.enabled()) map.dragging.enable();
        if (map.doubleClickZoom && !map.doubleClickZoom.enabled()) map.doubleClickZoom.enable();
        if (map.boxZoom && !map.boxZoom.enabled()) map.boxZoom.enable();
        map.getContainer().style.cursor = '';
    }

    // 畫矩形（從 startPoint 到 currentPoint）
    function updateRect(currentPoint) {
        const startLatLng = map.containerPointToLatLng(startPoint);
        const currentLatLng = map.containerPointToLatLng(currentPoint);
        const bounds = L.latLngBounds(startLatLng, currentLatLng);

        if (!rect) {
            rect = L.rectangle(bounds, style).addTo(map);
        } else {
            rect.setBounds(bounds);
        }
        let filtered = objectArray.filter(m => bounds.contains(m.getLatLng()));
        let filteredPolyline = polylineArray.filter(m => {
            let line = turf.lineString(m.getLatLngs().map(ll => [ll.lng, ll.lat]));
            let box = turf.bboxPolygon([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]);
            return turf.booleanIntersects(line, box);
        });
        objectArray.forEach((item) => {
            if (item.options.cursingPointparameter !== null) {
                var myIconHtml = `<div class="lnder0move" style="border: 2px solid ${item.options.cursingPointparameter.objectStyle.color};opacity:0.6;pointer-events:auto;width:12px;height:12px;"></div><div class="lnder0move-font" style="color:${item.options.cursingPointparameter.objectStyle.color};opacity:0.6;pointer-events: none;">${item.options.cursingPointparameter.objectStyle.cursingPoint_name}</div>`
                let myIcon = L.divIcon({ html: myIconHtml });
                item.setIcon(myIcon)
            }
        })
        polylineArray.forEach((item) => {
            if (item.options.cursingPointparameter !== null) {
                let color = item.options.cursingPointparameter.options.cursingPointparameter.objectStyle.color
                item.setStyle({
                    color: color,
                    weight: 1
                })
            }
        })
        filtered.forEach((item) => {
            var myIconHtml = `<div class="lnder0move" style="border: 2px solid red;opacity:1;pointer-events:auto;width:12px;height:12px;"></div><div class="lnder0move-font" style="color:red;opacity:1;pointer-events: none;">${item.options.cursingPointparameter.objectStyle.cursingPoint_name}</div>`
            let myIcon = L.divIcon({ html: myIconHtml });
            item.setIcon(myIcon)
        })
        filteredPolyline.forEach((item) => {
            let marker = item.options.cursingPointparameter
            var myIconHtml = `<div class="lnder0move" style="border: 2px solid red;opacity:1;pointer-events:auto;width:12px;height:12px;"></div><div class="lnder0move-font" style="color:red;opacity:1;pointer-events: none;">${marker.options.cursingPointparameter.objectStyle.cursingPoint_name}</div>`
            let myIcon = L.divIcon({ html: myIconHtml });
            item.options.cursingPointparameter.setIcon(myIcon)
            item.setStyle({
                color: 'red',
                weight: 2
            })
            // selectCamItems.push(marker.options.cursingPointparameter.id)
            // console.log('使用者選取的範圍（LatLngBounds）:', item);
        })
    }

    function clearRect() {
        if (rect) {
            map.removeLayer(rect);
            rect = null;
            objectArray.forEach((item) => {
                if (item.options.cursingPointparameter !== null) {
                    var myIconHtml = `<div class="lnder0move" style="border: 2px solid ${item.options.cursingPointparameter.objectStyle.color};opacity:0.6;pointer-events:auto;width:12px;height:12px;"></div><div class="lnder0move-font" style="color:${item.options.cursingPointparameter.objectStyle.color};opacity:0.6;pointer-events: none;">${item.options.cursingPointparameter.objectStyle.cursingPoint_name}</div>`
                    let myIcon = L.divIcon({ html: myIconHtml });
                    item.setIcon(myIcon)
                }
            })
        }
    }

    // 當完成選取時的 callback（可以由外部傳入）
    const onComplete = typeof options.onComplete === 'function' ? options.onComplete : (bounds) => {
        console.log('Selection bounds:', bounds);
    };

    // 事件處理
    function onMouseDown(e) {
        // 只在左鍵開始選取
        // if (e.originalEvent && e.originalEvent.button !== 0) return;
        if (e.button !== 0) return;

        isSelecting = true;
        startPoint = map.mouseEventToContainerPoint(e.originalEvent || e);
        lastMouseEvent = startPoint;
        disableMapInteraction();

        // 防止選取時觸發地圖本身的 boxZoom / drag
        clearRect();

    }

    function onMouseMove(e) {
        if (!isSelecting) return;
        const p = map.mouseEventToContainerPoint(e.originalEvent || e);
        lastMouseEvent = p;
        updateRect(p);
    }

    function onMouseUp(e) {
        if (!isSelecting) return;
        isSelecting = false;

        // 若沒有 rect（極小移動也可能沒有建立），就取消
        if (!rect) {
            enableMapInteraction();
            return;
        }

        const bounds = rect.getBounds(); // L.LatLngBounds
        // 給使用者的 callback（選取完成）
        onComplete(bounds);

        // 若需要保留矩形就不要呼叫 clearRect(); 這裡示範放開後保留 500ms 再消失
        // setTimeout(() => {
        //     clearRect();
        // }, options.autoClearDelay ?? 500);

        enableMapInteraction();
    }

    function onKeyDown(e) {
        if (e.key === 'Escape' && isSelecting) {
            isSelecting = false;
            clearRect();
            enableMapInteraction();
        }
    }

    // 將事件綁到 map 的 container（避免用 map.on('drag'...) 等）
    const container = map.getContainer();
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);

    // 返回一組可用來關閉的 function
    return {
        disable() {
            container.removeEventListener('mousedown', onMouseDown);
            container.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('keydown', onKeyDown);
            clearRect();
            enableMapInteraction();
        },
        cancelCurrent() {
            isSelecting = false;
            clearRect();
            enableMapInteraction();
        },
        getCurrentRect() {
            return rect ? rect.getBounds() : null;
        }
    };
}
// 選取框結束
var timeoutid123 = null
const addlistenerMainBack = () => {
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
const runRadiusUser = (y, x, radius, rotate, angle) => {
    let center = [y, x];
    let r = rotate
    let startAngle = r - (angle / 2);
    let endAngle = r + (angle / 2); // 结束角度，以度为单位
    if (r > (angle / 2)) {
        startAngle = startAngle - 360
        endAngle = endAngle - 360
    }
    let polygon = null
    let centerLine = null
    let group = L.layerGroup([], {}).addTo(map);
    const randerRadius = () => {
        if (endAngle > 360) {
            endAngle = 0
            startAngle = endAngle - rotate;
        }
        var points = [center];
        var lines = [center]
        for (var i = startAngle; i <= endAngle; i++) {
            var angle = i * Math.PI / 180;
            var x = center[0] + radius * Math.cos(angle);
            var y = center[1] + radius * Math.sin(angle);
            points.push([x, y]);
        }
        var angle1 = ((startAngle / 2) + (endAngle / 2)) * Math.PI / 180;
        var x1 = center[0] + radius * Math.cos(angle1);
        var y1 = center[1] + radius * Math.sin(angle1);
        lines.push([x1, y1]);
        polygon = L.polygon(points, {
            className: 'rotated-polygon', // Apply the class for rotation
            weight: 0,
            color: '#64646A',
            fillColor: '#7D7D7D',
            fillOpacity: 0.7,
        }).addTo(group);
        centerLine = L.polyline(lines, {
            stroke: true,
            weight: 1.5,
            color: 'gray',
            opacity: 1
            // dashArray: '10, 10'
        }).addTo(group);
        var path = centerLine.getLatLngs();

        // 创建标记
        // var imgurl = '/images/fs/current positionpoint_drag.svg'
        // var myIcon = L.icon({
        //     iconUrl: imgurl,
        //     iconSize: [34, 34],
        // });
        // L.marker(path[1], {
        //     icon: myIcon,
        //     opacity: 0,
        //     draggable: false,
        //     opacity: 1
        // }).addTo(group);

        // marker1.on('drag', (event) => {
        //     var latlng = event.target.getLatLng();
        //     // 判斷標記是否在路徑上
        //     var closestPoint = L.GeometryUtil.closest(map, path, latlng);
        //     // 如果标记不在路径上，则将标记移动到最近的路径点
        //     if (!latlng.equals(closestPoint)) {
        //         marker1.setLatLng(closestPoint);
        //     }
        // });

    }
    randerRadius()
    return group
}
const calculateAngle = (pointA, pointB) => {
    const deltaX = pointB.lng - pointA.lng;
    const deltaY = pointB.lat - pointA.lat;
    const angleInRadians = Math.atan2(deltaY, deltaX);
    const angleInDegrees = angleInRadians * 180 / Math.PI;
    const brng = (angleInDegrees + 360) % 360; // 转换到0-360范围内
    return brng;
}

let temprefusimgint = null
// const initWs5 = () => {
//     const openwebsocket05 = () => {
//         if ($webSocketconnect05().readyState === 1) {
//             console.log('開啟ooo5');
//             state.ws5 = $webSocketconnect05()
//             if (state.wsListener5.close !== null) {
//                 state.ws5.removeEventListener("close", state.wsListener5.close)
//                 state.wsListener5.close = null
//             }
//             const colseEvent = () => {
//                 setTimeout(() => {
//                     openwebsocket05()
//                 }, 1000)
//             }
//             state.ws5.addEventListener("close", colseEvent)
//             state.wsListener5.close = colseEvent
//             // var tew = 0
//             const messageEvent = (event) => {
//                 // var data = JSON.parse(event.data)
//                 // state.wsRoiData1 = data
//                 // data = null
//                 // console.log(data);
//             }
//             state.ws5.addEventListener("message", messageEvent)
//             // state.wsListener3.message = messageEvent
//         } else if ($webSocketconnect05().readyState !== 1) {
//             setTimeout(() => {
//                 openwebsocket05()
//             }, 1000)
//         }
//     }
//     openwebsocket05()
// }
const updateBase64ImageSize = (base64) => {
    state.mapUrlBase64 = base64
    getBase64ImageSize(state.mapUrlBase64)
        .then(size => {
            // console.log(`圖片尺寸：寬 ${size.width}px, 高 ${}px`);
            let mapWidth = mapcanvas.value.getBoundingClientRect().width
            let mapHeight = mapcanvas.value.getBoundingClientRect().height
            state.imgWidth = mapWidth / 4
            state.imgHeight = -mapHeight / 4
            // console.log(state.imgWidth, state.imgHeight);
            if (state.initPTZimgStatus) {
                rundev('base64')
            } else {
                if (state.imageOverlayTemp !== null) {
                    state.imageOverlayTemp.setUrl(state.mapUrlBase64);
                }
            }
        })
        .catch(err => {
            // console.error("錯誤：", err.message);
        });
    function getBase64ImageSize(base64String) {
        return new Promise((resolve, reject) => {
            // 建立 Image 元素
            const img = new Image();
            img.onload = () => {
                // 圖片加載完成後，取得寬高
                resolve({
                    width: img.width,
                    height: img.height
                });
            };
            img.onerror = (err) => {
                reject(new Error("無法載入圖片"));
            };

            // 設定圖片的來源為 Base64 字串
            img.src = base64String;
        });
    }
}
const refreshMapObject = (data) => {
    state.webWorker.postMessage({
        type: 'query_PTZcursing_list',
        parameter: data
    })
}
// =================================================================
const switchWK = (e) => {
    if (e) {
        state.tempPtz.forEach((item) => {
            if (item.data !== null) {
                removePtzs({ id: item.data.id })
            }
        })
        state.tempCursingPoint.forEach((item) => {
            if (item.data !== null) {
                removeCursingPoints({ id: item.data.id })
            }
        })
        state.wkTemp = {
            cursingPoint_id: [],
            ptz: [],
            ptzinto: camID
        }
        if (state.time111 !== null) {
            clearTimeout(state.time111)
        }
        state.time111 = setTimeout(() => {
            // initWs3()
            runwk()
            state.time111 = null
        }, 100)
    } else {
        stopProgram()
    }
}
const runwk = () => {
    // console.log('啟動wk 5', state.imgWidth, state.imgHeight, state.imageOverlayTemp !== null ? state.imageOverlayTemp.getBounds() : '');
    state.webWorker = new Worker('/worker/Selectpointmap.js');
    state.webWorker.addEventListener('message', (e) => {
        let res = e.data
        let type = res.type
        let parameter = res.parameter
        if (type === 'open') {
            // console.log('開啟worker');
            state.webWorker.postMessage({
                type: 'websoket03-URL',
                parameter: {
                    url: $webSocket03URL(),
                    saveData: JSON.stringify(state.wkTemp)
                    // saveData: JSON.stringify({
                    //     cursingPoint_id: [],
                    //     ptz: [],
                    //     ptzinto: camID
                    // })
                }
            })
            state.webWorker.postMessage({
                type: 'ptzinto',
                parameter: {
                    ptzinto: camID
                }
            })
            const sendMap = () => {
                if (map !== null) {
                    // let mapWidth = mapcanvas.value.getBoundingClientRect().width
                    // let mapHeight = -mapcanvas.value.getBoundingClientRect().height
                    // state.imgWidth = mapWidth / 4
                    // state.imgHeight = -mapHeight / 4
                    state.webWorker.postMessage({
                        type: 'canvasSize',
                        parameter: {
                            imgWidth: state.imageOverlayTemp !== null ? state.imageOverlayTemp.getBounds()._northEast.lng : state.imgWidth,
                            imgHeight: state.imageOverlayTemp !== null ? state.imageOverlayTemp.getBounds()._southWest.lat : state.imgHeight
                        }
                    })
                } else {
                    setTimeout(() => {
                        sendMap()
                    }, 100)
                }
            }
            sendMap()
        } else if (type === 'addCursingPoints') {
            addCursingPoints(parameter)
        } else if (type === 'changeCursingPoints') {
            changeCursingPoints(parameter)
        } else if (type === 'removeCursingPoints') {
            removeCursingPoints(parameter)
        } else if (type === 'addPtzs') {
            // console.log('addptz', parameter);
            addPtzs(parameter)
        } else if (type === 'changePtzs') {
            changePtzs(parameter)
        } else if (type === 'removePtz') {
            removePtzs(parameter)
        } else if (type === 'close') {
            state.wkTemp = JSON.parse(parameter.saveData)
            // state.wkTemp.cursingPoint_id = parameter.cursingPoint_id
            // state.wkTemp.ptzinto = parameter.ptzinto
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
const stopProgram = () => {
    if (state.webWorker !== null) {
        state.webWorker.terminate();
        state.webWorker = null
    }
    if (state.wsListener5.close !== null) {
        state.ws5.removeEventListener("close", state.wsListener5.close)
        state.wsListener5.close = null
    }
    if (state.wsListener5.message !== null) {
        state.ws5.removeEventListener("message", state.wsListener5.message)
        state.wsListener5.message = null
    }
    if (state.ws5 !== null) {
        // state.ws.close()
        state.ws5 = null
    }
    if (state.refreshMapTimeout !== null) {
        clearTimeout(state.refreshMapTimeout)
    }
    if (temprefusimgint !== null) {
        clearInterval(temprefusimgint)
    }
}
onMounted(() => {
    // initWs3()
    // initWs5()
    // setInterval(() => {
    //     console.log('displayRoi', $displayRoi());
    // },1000)

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
    console.log('onBeforeUnmount');
    state.rtcPeerConnectionItems.forEach((item) => {
        item.close();
    })
    stopProgram()
})
defineExpose({
    invaliMapSzie,
    switchWK,
    addlistenerMainBack,
    updateBase64ImageSize,
    refreshMapObject
    //     requestBtnGroupEvent,
    //     superResolution
})
</script>
<style>
.lnder-hover2 {
    width: 35px;
    height: 35px;
    background-color: #fff;
    /* position: absolute; */
    /* top: 0; */
    /* left: 0; */
    /* transform: translate(-44%, -14%); */
    border-radius: 35px;
}

.setCursingPointDig {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 100px;
    z-index: 999;
    transform: translate(10px, 10px);
}

.setCursingPointDig>div {
    background-color: #fff;
    cursor: pointer;
    padding: 1em;
    transition: background-color .3s;
}

.setCursingPointDig>div:hover {
    background-color: rgb(236, 236, 236);
}

.setCursingPointDig>div:active {
    background-color: rgb(177, 177, 177);
}

.display-setCursingPointDig {
    opacity: 0;
    pointer-events: none;
}
</style>
<style>
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

.checkChangeBoxDiv-btn {
    background-color: #fff;
    display: flex;
    width: fit-content;
    padding: 0em 0.5em;
    pointer-events: none;
}

.leaflet-div-icon {
    background: unset !important;
    border: unset !important;
}
</style>