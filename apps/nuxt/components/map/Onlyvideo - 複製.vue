<template>
    <div class="item-card-content pa-0" id="map-top-b" style="height: 100%; width: 100%;z-index: 0;" ref="mapcanvas">
        <div ref="LMmap" style="height: 100%; width: 100%">
        </div>
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
const backbtn = useAttrs().backbtn
const camID = useAttrs().camID
const camType = useAttrs().camType
useHead({
    script: []
});
var map = null
const generateRandomString = (length = 10) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}
const state = reactive({
    recoderTime: 0,
    rtcVIDEOLIST: [],
    rtcVIDETYPEIndex: 0,
    rtcVIDETYPE: 'vis',
    imgWidth: 640 / 1,
    imgHeight: 480 / 1,
    dragObjectStatus: true,
    // map
    minzoomtemp: 0,
    mapOptions: {
        minZoom: -20,
        maxZoom: 40,
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
        maxBoundsViscosity: 1.0, // 設定粘滯度，1.0 表示無法超出
        fadeAnimation: false,
        markerZoomAnimation: false
    },
    randomID: camID + 'onlyvideo' + generateRandomString(),
    className: 'rest0-btn' + Math.random().toString(36).substr(2),
    videoTag: null, imageBounds: []
})
const emit = defineEmits(['backbtnfn'])
const leafletJsInit =() => {
    map = L.map(LMmap.value, state.mapOptions).on('load', () => {
        console.log('✅ Leaflet 地圖已準備好！');
    });

    // 取得容器大小
    let mapWidth = mapcanvas.value.getBoundingClientRect().width;
    let mapHeight = mapcanvas.value.getBoundingClientRect().height;

    // ❗ 不要用負高度（Leaflet Simple CRS 會錯亂）
    state.imgWidth = mapWidth;
    state.imgHeight = mapHeight;

    // 建立影像 (0,0) → (height,width)
    const imageBounds = [[0, 0], [state.imgHeight, state.imgWidth]];

    // 設定初始視角（不會鎖住 zoom）
    map.setView([state.imgHeight / 2, state.imgWidth / 2], 0);

    // 放入背景影像
    let imageOverlay = L.imageOverlay('/images/EMPTYv1-fill.png', imageBounds).addTo(map);

    // Fit 一次即可
    map.fitBounds(imageBounds);

    // 最小縮放避免影像變形
    const minZoomX = Math.log2(state.imgWidth / mapWidth);
    const minZoomY = Math.log2(state.imgHeight / mapHeight);
    const minZoom = Math.max(minZoomX, minZoomY);

    // map.setMinZoom(minZoom);

    // 最大邊界（建議使用比影像更大的 padding）
    let paddedBounds = L.latLngBounds(
        L.latLng(-state.imgHeight * 0.1, -state.imgWidth * 0.1),
        L.latLng(state.imgHeight * 1.1, state.imgWidth * 1.1)
    );
    map.setMaxBounds(paddedBounds);

    // --- Video overlay ---
    const video = document.createElement('video');
    video.autoplay = true;
    video.controls = false;
    video.muted = true;
    video.loop = true;
    video.id = `video${camType}${camID}-${state.randomID}`;
    video.className = 'video-player';
    video.style.objectFit = 'fill';

    // video overlay 使用與 image 一樣的 bounds
    const videoTag = L.videoOverlay(video, imageBounds).addTo(map);
    state.videoTag = videoTag;

    // 記錄預設視角範圍
    state.imageBounds = imageBounds;

    // 啟動 RTC
    const currentPort = window.location.port;
    runRTC(
        `video${camType}${camID}-${state.randomID}`,
        `http://${$getIpaddress()}:${currentPort}/video/realtime/${camType}${camID}`,
        'vis'
    );

    // 回預設位置按鈕顯示控制
    function hiddenBtn() {
        const b = map.getBounds();
        const isDefault = b.equals(state.imageBounds);

        if (backbtn !== undefined) {
            if (isDefault) emit("backbtnfn", "hidden");
            else emit("backbtnfn", "play");
        }
    }

    map.on("zoomend", hiddenBtn);
    map.on("moveend", hiddenBtn);

}
const leafletJsInitbak = () => {
    map = L.map(LMmap.value, state.mapOptions).on('load', () => {
        console.log('✅ Leaflet 地圖已準備好！')
    });
    let mapWidth = mapcanvas.value.getBoundingClientRect().width
    let mapHeight = mapcanvas.value.getBoundingClientRect().height
    state.imgHeight = -mapHeight
    state.imgWidth = mapWidth
    // map = LMmap.value.leafletObject
    map.setView([state.imgHeight / 2, state.imgWidth / 2], 1);
    map._layersMaxZoom = 20;
    // 預設背景圖片 - 這邊會先加載一個灰底圖片
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
    // 影片物件建立
    // const videoPane = map.createPane('blob-pane');
    // videoPane.style.zIndex = 1; // 設定 z-index
    const video = document.createElement('video');
    video.autoplay = true;
    video.controls = false;
    video.muted = true;
    video.loop = true;
    video.id = `video${camType}${camID}-${state.randomID}`;
    video.className = 'video-player';
    video.style.objectFit = 'fill'
    var videoBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    var videoTag = L.videoOverlay(video, videoBounds).addTo(map);
    map.fitBounds(videoBounds)
    map.setMinZoom(map.getZoom());  // 把目前 zoom 設為最小縮放
    map.setMaxBounds(videoBounds)
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
    monitorVideoFrame(video)
    // videoTag.getElement().onload = function () {
    // rotateImageOverlay(imageOverlay, 45); // 旋转 45 度
    // };
    state.videoTag = videoTag
    const currentPort = window.location.port;
    runRTC(`video${camType}${camID}-${state.randomID}`, `http://${$getIpaddress()}:${currentPort}/video/realtime/${camType}${camID}`, 'vis') // [element id,video url]
   
    // 回到預設位置
    var timeoutid = null
    state.imageBounds = videoBounds
    // 將自訂按鈕加到地圖
    if (backbtn !== undefined) {
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
        console.log('asdasdasda');
        const currentBounds = map.getBounds();  // 目前地圖的邊界
        const isAtDefaultPosition = currentBounds.equals(state.imageBounds);  // 檢查邊界是否相同
        if (backbtn !== undefined) {
            if (isAtDefaultPosition) {
                emit('backbtnfn', 'hidden')
            } else {
                emit('backbtnfn', 'play')
            }
            if (map.getZoom() === 0) {
                emit('backbtnfn', 'hidden')
            }
        }
    }
    map.on('zoomend', hiddenBtn);
    map.on('moveend', hiddenBtn);
    // 回到預設位置 end
    map.on("zoom", function (e) {
        console.log("Leaflet 有收到 zoom 事件！ zoom =", map.getZoom());
    });
}

const invaliMapSzie = () => {
    console.log("回到預設視角");
    if (!map) return;

    // 🔧 重新取得容器大小
    const mapWidth = mapcanvas.value.getBoundingClientRect().width;
    const mapHeight = -mapcanvas.value.getBoundingClientRect().height;

    // 🔧 更新全域紀錄
    state.imgWidth = mapWidth;
    state.imgHeight = mapHeight;

    // 🔧 每次都重新計算 bounds，避免因 resize 造成偏移
    const newBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    state.imageBounds = newBounds;

    // 🔧 更新 videoOverlay 的位置（確保不會偏移）
    if (state.videoTag) {
        state.videoTag.setBounds(newBounds);
    }

    // 🔧 必須先 invalidateSize 才能正確 fitBounds
    map.invalidateSize({ animate: false });

    // 🔧 回到預設視角
    map.fitBounds(newBounds, { animate: false });
    map.setMaxBounds(newBounds);

    // 按鈕延遲隱藏
    if (timeoutid123) clearTimeout(timeoutid123);

    timeoutid123 = setTimeout(() => {
        emit("backbtnfn", "hidden");
        timeoutid123 = null;
    }, 500);
}
var timeoutid123 = null
const addlistenerMainBack = () => {
    console.log("回到預設視角");
    if (!map) return;

    // 🔧 重新取得容器大小
    const mapWidth = mapcanvas.value.getBoundingClientRect().width;
    const mapHeight = -mapcanvas.value.getBoundingClientRect().height;

    // 🔧 更新全域紀錄
    state.imgWidth = mapWidth;
    state.imgHeight = mapHeight;

    // 🔧 每次都重新計算 bounds，避免因 resize 造成偏移
    const newBounds = [[0, 0], [state.imgHeight, state.imgWidth]];
    state.imageBounds = newBounds;

    // 🔧 更新 videoOverlay 的位置（確保不會偏移）
    if (state.videoTag) {
        state.videoTag.setBounds(newBounds);
    }

    // 🔧 必須先 invalidateSize 才能正確 fitBounds
    map.invalidateSize({ animate: false });

    // 🔧 回到預設視角
    map.fitBounds(newBounds, { animate: false });
    map.setMaxBounds(newBounds);

    // 按鈕延遲隱藏
    if (timeoutid123) clearTimeout(timeoutid123);

    timeoutid123 = setTimeout(() => {
        emit("backbtnfn", "hidden");
        timeoutid123 = null;
    }, 500);
}
const runRTC = (id, url, videoType) => {
    var logTime = new Date().getTime()
    // console.log('建立RTC連線 (onlyvideo)', videoType, logTime, url);
    const retryPause = 2000;

    const video = document.getElementById(id);
    // console.log('rtc video (onlyvideo)', video);
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
        video.srcObject = evt.streams[0];
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
                state.rtcPeerConnectionItems = pc;
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
onMounted(() => {
    leafletJsInit()
})

onBeforeUnmount(() => {
    if (state.rtcPeerConnectionItems) {
        state.rtcPeerConnectionItems.getSenders().forEach(sender => {
            console.log('video', sender);

            if (sender.track) sender.track.stop();
        });
        state.rtcPeerConnectionItems.close();
        state.rtcPeerConnectionItems = null;
    }
    const video = state.videoTag
    if (video) {
        video.srcObject = null;
    }

})
defineExpose({
    invaliMapSzie,
    addlistenerMainBack
})
</script>
<style></style>