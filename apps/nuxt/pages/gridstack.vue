<template>
    <div class="container">
        <v-btn @click="randomizePositions">隨機變更位置</v-btn>
        <v-btn @click="reset">恢復位置</v-btn>
        <v-btn @click="lockObjects">{{ lock.value ? '鎖住' : '解鎖' }}</v-btn>
        <h1>測試</h1>
        <div class="row2">
            <div class="sidepanel col-md-2 d-none d-md-block">
                <div id="trash" class="sidepanel-item" style="background-color:red">
                    <div style="font-size:30px; font-weight:bold;">item移動到這邊會刪除</div>
                </div>
                <div class="grid-stack-item sidepanel-item" style="background-color:green">
                    <div style="font-size:30px; font-weight:bold;">拖動新增item</div>
                </div>
                <div>
                    操作:<br>
                    滾輪 = zoom in/out,<br>
                    按下滾輪 = 拖動畫布,<br>
                    滑鼠左鍵 = 拖動item
                </div>
                <div
                    style="width:300px; max-height:300px;display: flex;background-color: aliceblue;flex-direction: column;position: fixed;bottom: 0;left: 0;z-index: 66;">
                    <div>本次修改物件:</div>
                    <div v-for="(item, index) in state.changes" :key="index">
                        [{{ index + 1 }}] --id: {{ item.id }} ,座標: x:{{ item.x }} , y: {{ item.y }} ,佔位: w:{{ item.w }},
                        h:{{
                            item.h }}
                    </div>
                </div>
            </div>
            <div class="transform-canvas"
                style="width: 1728px;height: 770px;overflow: auto;background-color:gray;overflow: hidden;"
                @wheel="mousewheel" @mousedown="startDrag" @mousemove="drag" @mouseup="stopDrag" @mouseleave="stopDrag">
                <div class="transform-container" style="transform: translate(0, 0) scale(1, 1); transform-origin: 0 0;">
                    <div class="grid-stack">
                        <template v-for="(item, index) in state.childrenROI" :key="index">
                            <div class="grid-stack-item" :gs-x="item.x" :gs-y="item.y" :gs-w="item.w" :gs-h="item.h"
                                @mouseover="state.itemMouseOver = true" @mouseout="state.itemMouseOver = false">
                                <div class="grid-stack-item-content">
                                    <div style="width: 100%; height:100%;">
                                        <ClientOnly>
                                            <MapOnlyroi :camID="1" :camType="'ir'" />
                                        </ClientOnly>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <div id="message" style="display: none;">
        </div>

    </div>
</template>
<script setup>
let grid = null
const state = reactive({
    changes: [],
    itemMouseOver: false,
    childrenROI: [
        { x: 6, y: 1, w: 6, h: 2, content: '', id: 1 }
    ]
})
const lock = reactive({
    value: true
})
let children = [
    { x: 0, y: 0, w: 3, h: 1, content: '<div class="item90-content"></div>', id: 0 },
    // { x: 3, y: 0, w: 3, h: 1, content: '1', id: 1 },
    // { x: 6, y: 0, w: 3, h: 1, content: '2', id: 2 },
    // { x: 9, y: 0, w: 3, h: 1, content: '4', id: 4 },

    // { x: 0, y: 1, w: 3, h: 1, content: '5', id: 5 },
    // { x: 3, y: 1, w: 3, h: 1, content: '6', id: 6 },
    // { x: 6, y: 1, w: 3, h: 1, content: '7', id: 7 },
    // { x: 9, y: 1, w: 3, h: 1, content: '8', id: 8 },

    // { x: 0, y: 2, w: 3, h: 1, content: '9', id: 9 },
    // { x: 3, y: 2, w: 3, h: 1, content: '10', id: 10 },
    // { x: 6, y: 2, w: 3, h: 1, content: '11', id: 11 },
    // { x: 9, y: 2, w: 3, h: 1, content: '12', id: 12 }
];
// useHead({
//     script: [{
//         src: '/js/gridstack-all.js',
//         async: true,
//         defer: true,
//         onload: () => {
//             var grid = GridStack.init({});
//             console.log(grid);
//             grid.on('drag', function (event, el) {
//                 console.log(event);
//             });
//         }
//     }]
// })
const runRTC = (id, url, videoType) => {
    console.log('建立RTC連線');
    const retryPause = 2000;

    const video = id;
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
                console.log('sessionUrl', sessionUrl);
                fetch(sessionUrl, {
                    method: 'DELETE',
                });
            }
            sessionUrl = '';

            queuedCandidates = [];
        }
    };

    const sendLocalCandidates = (candidates) => {
        console.log('sendLocalCandidates', sessionUrl + window.location.search);
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
        console.log('sendOffer', url);
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
        console.log('完成RTC連線');
        video.srcObject = evt.streams[0];

    };

    const requestICEServers = () => {
        console.log('requestICEServers', url);
        fetch(`${url}/` + 'whep', {
            method: 'OPTIONS',
        })
            .then((res) => {
                pc = new RTCPeerConnection({
                    iceServers: linkToIceServers(res.headers.get('Link')),
                    // https://webrtc.org/getting-started/unified-plan-transition-guide
                    sdpSemantics: 'unified-plan',
                });
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
const randomizePositions = () => {
    if (!grid) return;

    grid.engine.nodes.forEach((node) => {
        // 生成隨機位置
        const newX = Math.floor(Math.random() * 4);
        const newY = Math.floor(Math.random() * 4);

        // 更新 item 位置
        grid.update(node.el, { x: newX, y: newY });
    });
}
const reset = () => {
    if (!grid) return;

    grid.engine.nodes.forEach((node) => {
        console.log(node);
        const findex = children.find((item) => item.id === node.id)
        if (findex !== undefined) {
            const newX = findex.x
            const newY = findex.y
            grid.update(node.el, { x: newX, y: newY, w: findex.w, h: findex.h });
        }
    })
}
const lockObjects = () => {
    lock.value = !lock.value
    if (!grid) return;

    grid.engine.nodes.forEach((node) => {
        // grid.movable(node.el, lock.value)
        // grid.resizable(node.el, lock.value)
        grid.enableMove(lock.value)
        grid.enableResize(lock.value)
        // grid.update(node.el, { locked: lock.value });
    })
}

// 變數
const scaleX = ref(1);
const scaleY = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);
const lastMousePos = ref({ x: 0, y: 0 });

let container; // 容器 DOM
let content; // 內部的 transform 物件

// 更新 CSS 變數
const updateTransform = () => {
    content.style.transform = `translate(${translateX.value}px, ${translateY.value}px) scale(${scaleX.value}, ${scaleY.value})`;
};

// 滾輪縮放（以滑鼠位置為中心）
const mousewheel = (e) => {
    e.preventDefault();
    // if (!e.ctrlKey) return;

    // 滑鼠在畫布內的相對座標
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 縮放前的相對偏移
    const offsetX = (mouseX - translateX.value) / scaleX.value;
    const offsetY = (mouseY - translateY.value) / scaleY.value;

    // 計算縮放比例
    const scaleStep = scaleX.value < 1 ? 0.05 : 0.2;
    const newScale = e.deltaY > 0 ? Math.max(scaleX.value - scaleStep, 0.2) : scaleX.value + scaleStep;
    if (newScale > 6) {
        return;
    } else if (newScale < 0.5) {
        return;
    }
    // 確保縮放後滑鼠仍在相同相對位置
    translateX.value = mouseX - offsetX * newScale;
    translateY.value = mouseY - offsetY * newScale;

    scaleX.value = newScale;
    scaleY.value = newScale;

    updateTransform();
};

// 滑鼠拖動開始
const startDrag = (e) => {
    e.preventDefault();
    if (e.button !== 1 || state.itemMouseOver) return;
    isDragging.value = true;
    lastMousePos.value = { x: e.clientX, y: e.clientY };
};

// 滑鼠移動時拖動
const drag = (e) => {
    e.preventDefault();
    if (!isDragging.value || state.itemMouseOver) return;
    const dx = e.clientX - lastMousePos.value.x;
    const dy = e.clientY - lastMousePos.value.y;

    translateX.value += dx;
    translateY.value += dy;
    lastMousePos.value = { x: e.clientX, y: e.clientY };

    updateTransform();
};

// 滑鼠拖動結束
const stopDrag = () => {
    isDragging.value = false;
};

onMounted(() => {
    container = document.querySelector(".transform-canvas");
    content = document.querySelector(".transform-container");
    GridStack.renderCB = function (el, w) {
        el.innerHTML = w.content;
    };
    let insert = [{ w: 3, h: 1, content: 'new item' }];
    grid = GridStack.init({
        column: 12,
        float: true,
        // cellHeight: 70,
        acceptWidgets: true,
        removable: '#trash', // drag-out delete class
        children
    });
    GridStack.setupDragIn('.sidepanel>.grid-stack-item', undefined, insert);
    // grid.column(13, 'moveScale')
    grid.on('added', function (el, items) {
        console.log(el, items);
        grid.removeWidget(items[0].el)
        let x = items[0].x
        let y = items[0].y
        let w = items[0].w
        let h = items[0].h
        state.childrenROI.push(
            { x, y, w, h, content: '' }
        )
    })
    grid.on('removed change', function (e, items) {
        state.changes = items;
        // items.forEach((item) => {
        // grid.compact('list')
        // });
    });
    grid.cellHeight(container.getBoundingClientRect().height / 3);
    const div = document.querySelector('.item90-content')
    const video = document.createElement('video');
    video.autoplay = true;
    video.controls = false;
    video.muted = true;
    video.loop = true;
    video.className = 'video-player';
    div.appendChild(video);
    runRTC(video, `http://192.168.0.173:3000/video/realtime/ir1`, 'vis')
    // runRTC2()
})
</script>
<style>
.video-player {
    width: 100%;
    height: 100%;
}

.item90-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.transform-canvas {
    width: 100%;
}

.row2 {
    display: grid;
    grid-template-columns: 10% 90%;
}

.sidepanel-item {
    width: 100%;
    height: 200px;
}

.grid-stack>div {
    background-color: beige;
}


/* required file for gridstack to work */
@import "../node_modules/gridstack/dist/gridstack.min.css";

/* Optional styles for demos */
.btn-primary {
    color: #fff;
    background-color: #007bff;
}

.btn {
    display: inline-block;
    padding: .375rem .75rem;
    line-height: 1.5;
    border-radius: .25rem;
}

a {
    text-decoration: none;
}

h1 {
    font-size: 2.5rem;
    margin-bottom: .5rem;
}

.sidebar {
    background: rgb(215, 243, 215);
    padding: 25px 0;
    height: 100px;
    text-align: center;
}


.sidebar>.grid-stack-item,
.sidebar-item {
    width: 100px;
    height: 50px;
    border: 2px dashed green;
    text-align: center;
    line-height: 35px;
    background: rgb(192, 231, 192);
    cursor: default;
    display: inline-block;
}

.grid-stack {
    background: #FAFAD2;
}

.grid-stack.grid-stack-static {
    background: #ffffff;
}

.sidebar>.grid-stack-item,
.grid-stack-item-content {
    text-align: center;
    background-color: #ffffff;
}

.ui-draggable-disabled.ui-resizable-disabled>.grid-stack-item-content {
    background-color: #f1f1f1;
}

.grid-stack-item-removing {
    opacity: 0.5;
}

.trash {
    height: 100px;
    background: rgba(255, 0, 0, 0.1) center center url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCIgdmlld0JveD0iMCAwIDQzOC41MjkgNDM4LjUyOSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDM4LjUyOSA0MzguNTI5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTQxNy42ODksNzUuNjU0Yy0xLjcxMS0xLjcwOS0zLjkwMS0yLjU2OC02LjU2My0yLjU2OGgtODguMjI0TDMwMi45MTcsMjUuNDFjLTIuODU0LTcuMDQ0LTcuOTk0LTEzLjA0LTE1LjQxMy0xNy45ODkgICAgQzI4MC4wNzgsMi40NzMsMjcyLjU1NiwwLDI2NC45NDUsMGgtOTEuMzYzYy03LjYxMSwwLTE1LjEzMSwyLjQ3My0yMi41NTQsNy40MjFjLTcuNDI0LDQuOTQ5LTEyLjU2MywxMC45NDQtMTUuNDE5LDE3Ljk4OSAgICBsLTE5Ljk4NSw0Ny42NzZoLTg4LjIyYy0yLjY2NywwLTQuODUzLDAuODU5LTYuNTY3LDIuNTY4Yy0xLjcwOSwxLjcxMy0yLjU2OCwzLjkwMy0yLjU2OCw2LjU2N3YxOC4yNzQgICAgYzAsMi42NjQsMC44NTUsNC44NTQsMi41NjgsNi41NjRjMS43MTQsMS43MTIsMy45MDQsMi41NjgsNi41NjcsMi41NjhoMjcuNDA2djI3MS44YzAsMTUuODAzLDQuNDczLDI5LjI2NiwxMy40MTgsNDAuMzk4ICAgIGM4Ljk0NywxMS4xMzksMTkuNzAxLDE2LjcwMywzMi4yNjQsMTYuNzAzaDIzNy41NDJjMTIuNTY2LDAsMjMuMzE5LTUuNzU2LDMyLjI2NS0xNy4yNjhjOC45NDUtMTEuNTIsMTMuNDE1LTI1LjE3NCwxMy40MTUtNDAuOTcxICAgIFYxMDkuNjI3aDI3LjQxMWMyLjY2MiwwLDQuODUzLTAuODU2LDYuNTYzLTIuNTY4YzEuNzA4LTEuNzA5LDIuNTctMy45LDIuNTctNi41NjRWODIuMjIxICAgIEM0MjAuMjYsNzkuNTU3LDQxOS4zOTcsNzcuMzY3LDQxNy42ODksNzUuNjU0eiBNMTY5LjMwMSwzOS42NzhjMS4zMzEtMS43MTIsMi45NS0yLjc2Miw0Ljg1My0zLjE0aDkwLjUwNCAgICBjMS45MDMsMC4zODEsMy41MjUsMS40Myw0Ljg1NCwzLjE0bDEzLjcwOSwzMy40MDRIMTU1LjMxMUwxNjkuMzAxLDM5LjY3OHogTTM0Ny4xNzMsMzgwLjI5MWMwLDQuMTg2LTAuNjY0LDguMDQyLTEuOTk5LDExLjU2MSAgICBjLTEuMzM0LDMuNTE4LTIuNzE3LDYuMDg4LTQuMTQxLDcuNzA2Yy0xLjQzMSwxLjYyMi0yLjQyMywyLjQyNy0yLjk5OCwyLjQyN0gxMDAuNDkzYy0wLjU3MSwwLTEuNTY1LTAuODA1LTIuOTk2LTIuNDI3ICAgIGMtMS40MjktMS42MTgtMi44MS00LjE4OC00LjE0My03LjcwNmMtMS4zMzEtMy41MTktMS45OTctNy4zNzktMS45OTctMTEuNTYxVjEwOS42MjdoMjU1LjgxNVYzODAuMjkxeiIgZmlsbD0iI2ZmOWNhZSIvPgoJCTxwYXRoIGQ9Ik0xMzcuMDQsMzQ3LjE3MmgxOC4yNzFjMi42NjcsMCw0Ljg1OC0wLjg1NSw2LjU2Ny0yLjU2N2MxLjcwOS0xLjcxOCwyLjU2OC0zLjkwMSwyLjU2OC02LjU3VjE3My41ODEgICAgYzAtMi42NjMtMC44NTktNC44NTMtMi41NjgtNi41NjdjLTEuNzE0LTEuNzA5LTMuODk5LTIuNTY1LTYuNTY3LTIuNTY1SDEzNy4wNGMtMi42NjcsMC00Ljg1NCwwLjg1NS02LjU2NywyLjU2NSAgICBjLTEuNzExLDEuNzE0LTIuNTY4LDMuOTA0LTIuNTY4LDYuNTY3djE2NC40NTRjMCwyLjY2OSwwLjg1NCw0Ljg1MywyLjU2OCw2LjU3QzEzMi4xODYsMzQ2LjMxNiwxMzQuMzczLDM0Ny4xNzIsMTM3LjA0LDM0Ny4xNzJ6IiBmaWxsPSIjZmY5Y2FlIi8+CgkJPHBhdGggZD0iTTIxMC4xMjksMzQ3LjE3MmgxOC4yNzFjMi42NjYsMCw0Ljg1Ni0wLjg1NSw2LjU2NC0yLjU2N2MxLjcxOC0xLjcxOCwyLjU2OS0zLjkwMSwyLjU2OS02LjU3VjE3My41ODEgICAgYzAtMi42NjMtMC44NTItNC44NTMtMi41NjktNi41NjdjLTEuNzA4LTEuNzA5LTMuODk4LTIuNTY1LTYuNTY0LTIuNTY1aC0xOC4yNzFjLTIuNjY0LDAtNC44NTQsMC44NTUtNi41NjcsMi41NjUgICAgYy0xLjcxNCwxLjcxNC0yLjU2OCwzLjkwNC0yLjU2OCw2LjU2N3YxNjQuNDU0YzAsMi42NjksMC44NTQsNC44NTMsMi41NjgsNi41N0MyMDUuMjc0LDM0Ni4zMTYsMjA3LjQ2NSwzNDcuMTcyLDIxMC4xMjksMzQ3LjE3MnogICAgIiBmaWxsPSIjZmY5Y2FlIi8+CgkJPHBhdGggZD0iTTI4My4yMiwzNDcuMTcyaDE4LjI2OGMyLjY2OSwwLDQuODU5LTAuODU1LDYuNTctMi41NjdjMS43MTEtMS43MTgsMi41NjItMy45MDEsMi41NjItNi41N1YxNzMuNTgxICAgIGMwLTIuNjYzLTAuODUyLTQuODUzLTIuNTYyLTYuNTY3Yy0xLjcxMS0xLjcwOS0zLjkwMS0yLjU2NS02LjU3LTIuNTY1SDI4My4yMmMtMi42NywwLTQuODUzLDAuODU1LTYuNTcxLDIuNTY1ICAgIGMtMS43MTEsMS43MTQtMi41NjYsMy45MDQtMi41NjYsNi41Njd2MTY0LjQ1NGMwLDIuNjY5LDAuODU1LDQuODUzLDIuNTY2LDYuNTdDMjc4LjM2NywzNDYuMzE2LDI4MC41NSwzNDcuMTcyLDI4My4yMiwzNDcuMTcyeiIgZmlsbD0iI2ZmOWNhZSIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=) no-repeat;
}

/* make nested grid have slightly darker bg take almost all space (need some to tell them apart) so items inside can have similar to external size+margin */
.grid-stack>.grid-stack-item.grid-stack-sub-grid>.grid-stack-item-content {
    background: rgba(0, 0, 0, 0.1);
    inset: 0 2px;
}

.grid-stack.grid-stack-nested {
    background: none;
    inset: 0;
}

.grid-stack {
    background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
    background-size: 8.33%;
    /* 控制網格大小 */
}
</style>

<style lang="scss">
$columns: 12;

@function fixed($float) {
    @return round($float * 1000) / 1000; // total 2+3 digits being %
}

.gs-#{$columns}>.grid-stack-item {

    width: fixed(100% / $columns);

    @for $i from 1 through $columns - 1 {
        &[gs-x='#{$i}'] {
            left: fixed((100% / $columns) * $i);
        }

        &[gs-w='#{$i+1}'] {
            width: fixed((100% / $columns) * ($i+1));
        }
    }
}
</style>