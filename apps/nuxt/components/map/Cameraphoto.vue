<template>
    <div class="item-card-content" id="map-top-b" style="height: 100%; width: 100%;z-index: 0;" ref="mapcanvas">
        <!-- <LMap ref="LMmap" :min-zoom="state.minZoom" :crs="state.crs" style="height: 100%; width: 100%"
            :options="state.mapOptions" @ready="rundev('map')">
            <div :class="`reset-btn123 hidden ${state.className}`" @click="backmap">
                <img src="/images/icon/return.png">
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
const { $webSocket05URL } = useNuxtApp()
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
const camType = useAttrs().camType
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
        marker2 = null
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
    var index = findFirstNullIndex(state.tempCursingPoint)
    if (index !== null) {
        let currentEvent = state.tempCursingPoint[index]
        currentEvent.data = e
        let marker = currentEvent.object
        marker.options.cursingPointparameter = currentEvent.data
        currentEvent.polyline.options.cursingPointparameter = marker
        // console.log('test add ', marker)
        let myIconHtml = e.html
        let myIcon = L.divIcon({ html: myIconHtml });
        var latlngs = [
            e.location,
            e.ptz_location
        ];
        // console.log(e, latlngs);
        currentEvent.polyline.setLatLngs(latlngs)
        currentEvent.polyline.setStyle({
            color: e.objectStyle.color
            // opacity: e.objectStyle.currentPtz ? 1 : 0.6
        })
        marker.setLatLng(e.location)
        marker.setIcon(myIcon)
        // marker.setStyle({
        //     interactive:false,
        //     // opacity: e.objectStyle.currentPtz ? 1 : 0.6
        // })
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
        // let myIconHtml = e.html
        let myIcon = L.divIcon({ html: '' });
        marker.setLatLng([10000, -10000])
        marker.setIcon(myIcon)
        var latlngs = [
            [10000, -10000],
            [10000, -10000]
        ];
        currentEvent.polyline.setLatLngs(latlngs)
        currentEvent = null
        marker = null
        // myIconHtml = null
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
const emit = defineEmits(['toTab', 'mapSetMapPtzStatus', 'mapSetCursingPint', 'backbtnfn'])
const leafletJsInitForPhoto = () => {

    map = L.map(LMmap.value, state.mapOptions);
    const ro = new ResizeObserver(() => {
        // map.invalidateSize();
        // console.log('ResizeObserver');
        invaliMapSzie()
    });

    ro.observe(LMmap.value);
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
    // 刷新地圖
    // state.refreshMapTimeout = setTimeout(() => {
    //     removeMap()
    //     state.ptz = []
    //     state.cursingPoint_id = []
    //     leafletJsInitForPhoto()
    //     console.log('refresh Map');
    // }, 300 * 1000)
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
    // var myIconHtml = `<div class="lnder0move" style="border: 2px solid #878787;"></div><div class="lnder0move-font" style="color:#878787;">tesstt</div>`
    // var myIcon = L.divIcon({ html: myIconHtml });
    var setCursingPointMarker = L.marker([-10000, 10000], { draggable: false, zIndexOffset: 9999 }).addTo(map);
    var setCursingPointType = 0
    var selectedPtzID = null
    var selectedCursingPointID = null
    setCursingPointMarker.on('click', () => {
        if (setCursingPointType === 0) {
            // console.log('選擇當前PTZ 但該PTZ正在巡弋', selectedPtzID);
            emit('mapSetMapPtzStatus', 1)
        } else {
            // console.log('不是選擇到當前PTZ TAB', selectedPtzID);
            emit('toTab', selectedPtzID)
        }
        setCursingPointMarker.setLatLng([-10000, 10000])
    })
    for (var i = 0; i < 300; i++) {
        var marker123333 = L.marker([10000, -10000], {
            index: i,
            // riseOnHover: true 
            // interactive: false
            cursingPointparameter: null
        }).addTo(map);
        var latlngs = [
            [10000, -10000],
            [10000, -10000]
        ];
        var polyline = L.polyline(latlngs, { color: 'red', weight: 1, cursingPointparameter: null }).addTo(map);
        marker123333.setZIndexOffset(10)
        marker123333.on('mousemove', (e) => {
            // console.log("mousemove", state.tempCursingPoint[e.target.options.index].data);
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
            // console.log('oo', props.ptzswitch, e);
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
                // console.log('clge', p1.getLatLng(), p2.getLatLng());
            } else if (index !== null && judgePtz && props.ptzswitch === 2) {
                // console.log('選擇當前PTZ 但該PTZ正在巡弋');
                setCursingPointType = 0
                var setCursingPoinHtml = `<div class="setCursingPointDig"><div>解除巡弋狀態</div></div>`
                let myIcon = L.divIcon({ html: setCursingPoinHtml });
                setCursingPointMarker.setIcon(myIcon)
                setCursingPointMarker.setLatLng(e.latlng)
            } else if (index !== null && !judgePtz) {
                // console.log('不是選擇到當前PTZ TAB');
                setCursingPointType = 1
                var setCursingPoinHtml = `<div class="setCursingPointDig"><div>移到該雲台</div></div>`
                let myIcon = L.divIcon({ html: setCursingPoinHtml });
                setCursingPointMarker.setIcon(myIcon)
                setCursingPointMarker.setLatLng(e.latlng)
            }

        })
        const addindex = (e) => {
            // var index = e.target.options?.index
            // mouseleaveObject = index
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
        // polygon.on('mousemove', (e) => {
        //     var index = e.target.options?.index
        //     mouseleaveObject = index
        // })
        // polygon.on('mouseout', (e) => {
        //     mouseleaveObject = null
        // })
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
    // var colorItems = ['#4845FF', '#00C1DC', '#FF6D6D', '#9859FF']
    // var index = 0
    // setInterval(() => {
    //     // console.log('test 5000');
    //     for (var i = 0; i < state.tempCursingPoint.length; i++) {
    //         if (index > colorItems.length) {
    //             index = 0
    //         }
    //         var color = colorItems[index]
    //         // ${Math.random().toString(36)}
    //         var myIconHtml123 = `<div class="lnder0move" style="border: 2px solid ${color};"></div><div class="lnder0move-font" style="color:${color};"> ${Math.random().toString(36)}</div>`
    //         var myIcon123 = L.divIcon({ html: myIconHtml123 });
    //         state.tempCursingPoint[i].object.setIcon(myIcon123)
    //         state.tempCursingPoint[i].object.setLatLng([-Math.floor(Math.random() * 1012), Math.floor(Math.random() * 1920)])
    //         myIconHtml123 = null
    //         myIcon123 = null
    //         index++
    //         // myIcon123.remove()
    //     }
    // }, 100)
    // 建立暫存物件 end



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
        // console.log('dragend');
        if (state.focusCursingPoint !== null) {
            latlng = state.focusCursingPoint
            event.target.setLatLng(latlng);
            // console.log('送出', selectedCursingPointID);
            emit('mapSetCursingPint', selectedCursingPointID)
        }
        // let len = state.tempCursingPoint.length
        // for (var i = 0; i < len; i++) {
        //     if (state.tempCursingPoint[i].data !== null) {
        //         let ma = state.tempCursingPoint[i].object
        //         console.log('dragstart', ma);
        //         ma.options.interactive = true
        //     }
        // }
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
    // state.webWorker.postMessage({
    //     type: 'canvasSize',
    //     parameter: {
    //         imgWidth: state.imgWidth,
    //         imgHeight: state.imgHeight
    //     }
    // })
    map.on('click', (e) => {
        // console.log('click map');
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
        // var index = mouseleaveObject
        // var p1 = [-10000, 10000]
        // var p2 = [-10000, 10000]
        // if (index === null) {
        //     p1 = state.tempPtz[index].object.marker1.getLatLng()
        //     p2 = state.tempPtz[index].object.marker2.getLatLng()
        // }
        //     userMarker.setLatLng(p1)
        //     userMarker2.setLatLng(p2)
        //     r = (360 - calculateAngle(userMarker.getLatLng(), userMarker2.getLatLng())) + 90
        //     if (r > 360) {
        //         r = r - 360
        //     }
        //     rw.remove()
        //     rw = runRadiusUser(userMarker.getLatLng().lat, userMarker.getLatLng().lng, calculatePixelDistance(userMarker2.getLatLng(), userMarker.getLatLng()), r, angle)
        //     console.log('clge', p1.getLatLng(), p2.getLatLng());
    })
    // 回到預設位置
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
}
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
const initRadius = (a, b, color, data, currentPTZ, ptzId) => {
    var rw = null
    var angle = 25
    var myIcon = L.divIcon({ html: `<div class="lnder0move-ptz" style="background-color: ${color};"></div><div class="lnder0move-font-ptz" style="color:${color};">${data.ptz_name}</div>` });
    var marker = L.marker(a, {
        icon: myIcon,
        draggable: false,
        opacity: currentPTZ ? 1 : 0.6
    });
    var marker2 = L.marker(b, {
        icon: myIcon,
        draggable: false,
        opacity: currentPTZ ? 1 : 0.6
    });
    var latlng = marker.getLatLng();
    var r = (360 - calculateAngle(latlng, marker2.getLatLng())) + 90
    if (r > 360) {
        r = r - 360
    }
    rw = runRadius(latlng.lat, latlng.lng, calculatePixelDistance(marker2.getLatLng(), latlng), r, angle, currentPTZ, ptzId)
    marker.addTo(rw)
    marker2.addTo(rw)
    function calculatePixelDistance(pointAPixel, pointBPixel) {
        var dx = pointBPixel.lng - pointAPixel.lng;
        var dy = pointBPixel.lat - pointAPixel.lat;
        return Math.sqrt(dx * dx + dy * dy);
    }
    return rw
}
const runRadius = (y, x, radius, rotate, angle, currentPTZ, ptzId) => {
    var alarm1 = false
    if (props.alarmID !== undefined) {
        // console.log(PTZalarmID);
        const ptzID = props.alarmID.findIndex((item) => item === ptzId)
        alarm1 = ptzID !== -1 ? true : false
    }
    var center = [y, x];
    var r = rotate
    var startAngle = r - (angle / 2);
    var endAngle = r + (angle / 2); // 结束角度，以度为单位
    if (r > (angle / 2)) {
        startAngle = startAngle - 360
        endAngle = endAngle - 360
    }
    var polygon = null
    var centerLine = null
    var group = L.layerGroup([], {}).addTo(map);
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
            fillColor: alarm1 ? 'rgb(255 0 0 / 50%)' : '#F6EE73',
            fillOpacity: currentPTZ ? 0.7 : 0.3,
        }).addTo(group);
        centerLine = L.polyline(lines, {
            stroke: true,
            weight: 1.5,
            color: 'gray',
            opacity: currentPTZ ? 1 : 0.6
            // dashArray: '10, 10'
        }).addTo(group);
        var path = centerLine.getLatLngs();

        // 创建标记
        var imgurl = '/images/fs/current positionpoint_drag.svg'
        var myIcon = L.icon({
            iconUrl: imgurl,
            iconSize: [34, 34],
        });
        var marker1 = L.marker(path[1], {
            icon: myIcon,
            opacity: 0,
            draggable: false,
            opacity: currentPTZ ? 1 : 0.6
        }).addTo(group);

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
let temprefusimgint = null
let temprefusimginttimeout = ref(null)
const initWs3 = () => {
    const openwebsocket03 = () => {
        if ($webSocketconnect03().readyState === 1) {
            state.ws3 = $webSocketconnect03()
            if (temprefusimginttimeout.value !== null) {
                clearTimeout(temprefusimginttimeout.value)
            }
            if (temprefusimgint !== null) {
                clearInterval(temprefusimgint)
            }
            temprefusimginttimeout.value = setTimeout(() => {
                if (state.ws3 !== null && state.ws3?.readyState === 1) {
                    let queryBackground = {
                        feature: 'image',
                        method: 'query_background_map',
                        // cam_id: state.$route.query.cam,
                        session: Math.random().toString(36).substr(2),
                        content: {},
                    }
                    // emit('maskloing', true)
                    state.ws3.send(JSON.stringify(queryBackground))
                }
            }, 1000)
            temprefusimgint = setInterval(() => {
                let queryBackground = {
                    feature: 'image',
                    method: 'query_background_map',
                    // cam_id: state.$route.query.cam,
                    session: Math.random().toString(36).substr(2),
                    content: {},
                }
                // emit('maskloing', true)
                state.ws3.send(JSON.stringify(queryBackground))
            }, 1000 * 30)
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
                var data = JSON.parse(event.data)
                var feature = data.feature
                var method = data.method
                // console.log(data);
                if (feature === "image" && method === "query_background_map") {
                    state.mapUrlBase64 = 'data:image/png;base64,' + data.content[0].image_day_base64
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
                data = null
                feature = null
                method = null
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
// =================================================================
const switchWK = (e) => {
    // console.log('map switchWK', e);
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
            initWs3()
            runwk()
            state.time111 = null
        }, 100)
    } else {
        stopProgram()
    }
}
const runwk = () => {
    // console.log('啟動wk 5', state.imgWidth, state.imgHeight, state.imageOverlayTemp !== null ? state.imageOverlayTemp.getBounds() : '');
    state.webWorker = new Worker('/worker/cameraphoto.js');
    state.webWorker.addEventListener('message', (e) => {
        let res = e.data
        let type = res.type
        let parameter = res.parameter
        if (type === 'open') {
            // console.log('開啟worker');
            state.webWorker.postMessage({
                type: 'websoket05-URL',
                parameter: {
                    url: $webSocket05URL(),
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
                    // console.log('mapaaaa', state.imgWidth, state.imgHeight);
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
    if (state.webWorker !== null) {
        state.webWorker.terminate();
        state.webWorker = null
    }
    if (state.ws3 !== null) {
        if (state.ws3.readyState === 1) {
            state.ws3.close()
        }
        // console.log(state.ws3);
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
        // console.log(state.ws3);
        state.ws3 = null
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
    addlistenerMainBack
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
<style scoped>
.lnder0move {
    width: 12px;
    height: 12px;
    background-color: #fff;
    position: relative;
    border-radius: 20px;
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
</style>