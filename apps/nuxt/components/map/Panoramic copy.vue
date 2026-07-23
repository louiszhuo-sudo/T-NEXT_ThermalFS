<template>
    <div class="item-card-content" id="map-top-b" style="height: 100%; width: 100%;z-index: 0;" ref="mapcanvas">
        <div ref="LMmap" style="height: 100%; width: 100%;z-index: 0;">
            <div :class="`reset-btn123 hidden ${state.className}`" @click="backmap">
                <img src="/images/icon/return.png">
            </div>
        </div>
        <div style="position: absolute;top: 0;left: 0;width: 100px;height: 100px;opacity: 0;pointer-events: none;">
            <ClientOnly>
                <div style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;" class="only-roi0" ref="roidiv">
                    <MapOnlyroi ref="mapmain" :camID="1" :camType="'ir'" />
                </div>
            </ClientOnly>
        </div>
        <div id="message" style="display: none;">
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue'
const { $webSocketconnect03 } = useNuxtApp()
const LMmap = ref(null)
const mapmain = ref(null)
const roidiv = ref(null)
const mapcanvas = ref(null)
var map = null
const state = reactive({
    rtcPeerConnectionItems: [],
    keyctrl: false,
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
    // scope相關 end
})
const props = useAttrs().formtData
const camID = useAttrs().camID
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
        var imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
        map.invalidateSize()
        map.fitBounds(imageBounds)

        let mapWidth = mapcanvas.value.getBoundingClientRect().width
        let mapHeight = mapcanvas.value.getBoundingClientRect().height
        const minZoomX = Math.log2(state.imgWidth / mapWidth);
        const minZoomY = Math.log2(Math.abs(state.imgHeight) / mapHeight);
        let minZoom = Math.max(minZoomX, minZoomY); // 確保不會小於 0
        map.setMinZoom(state.imgWidth < mapWidth || Math.abs(state.imgHeight) < mapHeight ? Math.abs(minZoom) : minZoom)
        map.setMaxZoom(3)
        map.fitBounds(imageBounds)
        var div = document.querySelector('.' + state.className)
        div.classList.add('hidden')
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
const emit = defineEmits(['toTab', 'mapSetMapPtzStatus', 'mapSetCursingPint'])
const leafletJsInitForPhoto = () => {
    map = L.map(LMmap.value, state.mapOptions);
    map.setView([state.imgHeight / 2, state.imgWidth / 2], 1);
    map._layersMaxZoom = 20;
    var imageUrl = state.mapUrlBase64, // /mock/ir13807.jpg
        imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    var imageOverlay = L.imageOverlay(imageUrl, imageBounds, { opacity: 1 });
    imageOverlay.setZIndex(-2);
    imageOverlay.addTo(map);
    state.imageOverlayTemp = imageOverlay
    state.imageBounds = imageBounds
    map.setMaxBounds(imageBounds)
    map.fitBounds(imageBounds)
    let mapWidth = mapcanvas.value.getBoundingClientRect().width
    let mapHeight = mapcanvas.value.getBoundingClientRect().height
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
        [
            [
                -2.3858158512559635,
                60.37102055780283
            ],
            [
                -21.112027241854005,
                95.02398635798166
            ]
        ],
        [
            [
                -5.526986794194989,
                121.7079774445305
            ],
            [
                -29.448211667346037,
                173.50631308312532
            ]
        ],
        [
            [
                -12.413400015253625,
                193.79097599054708
            ],
            [
                -35.36811075211574,
                226.63281117399183
            ]
        ]
    ];
    Mockbounds.forEach((item, index) => {
        const scopeMock = L.rectangle(item, {
            color: "#fff", weight: 1, objectType: 'rectangle', fillOpacity: 0.01
        }).addTo(map);

        scopeMock.on('mouseover', (e) => {
            console.log(e);
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
    let bounds = [
        [-5, 5],
        [-30, 50],
    ];
    let ptzctrolContent = `<div class="ptzctrolContent"><div class="ptz-c-btn">巡弋</div><div class="ptz-c-btn ml-2">閒置</div></div>`
    let ptzctroldivIcon = L.divIcon({ html: ptzctrolContent });
    let PTZSTATUS = L.marker([bounds[0][0], bounds[1][1]], { icon: ptzctroldivIcon, draggable: false }).addTo(map);
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
    var videoTag = L.videoOverlay(video, bounds, { type: 'video', interactive: true }).addTo(map);
    const currentPort = window.location.port;
    runRTC(videoID, `http://localhost:${currentPort}/video/realtime/vis1`, 'vis')
    // 建立ROI TEMP DIV
    let Cdiv = document.createElement('div')
    // Cdiv.innerHTML = '123'
    Cdiv.classList = 'c-roitempdiv'
    let ROITEMPDIV = Cdiv
    let ROITEMPDIVOBJECT = L.divIcon({ html: ROITEMPDIV });
    let ROITEMPMARKER = L.marker([bounds[0][0], bounds[0][1]], { icon: ROITEMPDIVOBJECT, draggable: false }).addTo(map);
    Cdiv.appendChild(roidiv.value); // 將 A 放到 B 裡（成為子元素，位於底下）
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
        Cdiv.style.width = pixelWidth + 'px'
        Cdiv.style.height = pixelHeight + 'px'
    }
    reszieDIV()
    // console.log('寬：', width);
    // console.log('高：', height);
    // 建立ROI TEMP DIV END
    var down = null
    let center = null;
    let dragging = false;
    let startMouse = null;
    let startSize = null;
    scope.on('mousedown', (e) => {
        saveObject = e.target
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
    let mousedownButton = null
    map.on('mousedown', (e) => {
        mousedownButton = e.originalEvent.button
        down = {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        }
    })
    map.on('mousemove', (e) => {
        if (!dragging || !scope || mousedownButton !== 0) return;
        if (e.originalEvent.ctrlKey) {
            const dx = e.originalEvent.clientX - startMouse.clientX;
            const dy = e.originalEvent.clientY - startMouse.clientY;
            const scale = 1 + (dx + dy) / 200;
            const newHalfHeight = (startSize[0] / 2) * scale;
            const newHalfWidth = (startSize[1] / 2) * scale;
            if (newHalfHeight < 5 || newHalfWidth < 5) return;
            const south = center.lat - newHalfHeight;
            const north = center.lat + newHalfHeight;
            const west = center.lng - newHalfWidth;
            const east = center.lng + newHalfWidth;
            const minLat = state.imgHeight;
            const maxLat = 0;
            const minLng = 0;
            const maxLng = state.imgWidth;
            if (south <= minLat) {
                const overshoot = minLat - south;
                south = minLat;
                north = south + newHalfHeight * 2 - overshoot;
            }
            if (north >= maxLat) {
                const overshoot = north - maxLat;
                north = maxLat;
                south = north - newHalfHeight * 2 + overshoot;
            }
            // 左右邊界修正
            if (west <= minLng) {
                const overshoot = minLng - west;
                west = minLng;
                east = west + newHalfWidth * 2 - overshoot;
            }
            if (east >= maxLng) {
                const overshoot = east - maxLng;
                east = maxLng;
                west = east - newHalfWidth * 2 + overshoot;
            }
            const newBounds = [
                [south, west],
                [north, east]
            ];
            scope.setBounds(newBounds);
            videoTag.setBounds(newBounds);
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
            saveObject.setLatLngs(temp)
            videoTag.setBounds(temp)
            // set latlng contorl
            console.log(JSON.stringify([temp[0][2].lat, temp[0][2].lng]));
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
    // test for realTimeScope end
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
            temprefusimgint = setInterval(() => {
                let queryBackground = {
                    feature: 'image',
                    method: 'query_background_map',
                    session: Math.random().toString(36).substr(2),
                    content: {},
                }
                state.ws3.send(JSON.stringify(queryBackground))
            }, 1000)
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
                    state.mapUrlBase64 = 'data:image/png;base64,' + data.content[0].image_day_base64
                    getBase64ImageSize(state.mapUrlBase64)
                        .then(size => {
                            state.imgWidth = size.width / 4
                            state.imgHeight = -size.height / 4
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
                        });
                    }
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

const runRTC = (id, url) => {
    var logTime = new Date().getTime()
    const retryPause = 2000;
    const video = document.getElementById(id);
    const message = document.getElementById('message');
    let pc = null;
    let restartTimeout = null;
    let sessionUrl = '';
    let offerData = '';
    let queuedCandidates = [];
    let defaultControls = false;
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
        video.srcObject = evt.streams[0];
    };
    const requestICEServers = () => {
        fetch(`${url}/` + 'whep', {
            method: 'OPTIONS',
        })
            .then((res) => {
                pc = new RTCPeerConnection({
                    iceServers: linkToIceServers(res.headers.get('Link')),
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
    const loadAttributesFromQuery = () => {
        const params = new URLSearchParams(window.location.search);
        defaultControls = video.controls;
    };
    const init = () => {
        loadAttributesFromQuery();
        loadStream();
    };
    init()
}
onMounted(() => {
    initWs3()
    document.addEventListener('mousedown', (event) => {
        event.preventDefault()
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
})
defineExpose({
    invaliMapSzie
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
    transform: translate(-98%, -100%);
}

.ptz-c-btn {
    background-color: #FFC164;
    width: 50px;
    height: 25px;
    line-height: 2;
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
<style scoped></style>