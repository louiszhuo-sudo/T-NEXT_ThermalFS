<template>
    <div style="width: 100%; height: 100%;">
        <video id="video" style="width: 100%; height: 100%" controls></video>
        <div id="message" style="display: none;">
        </div>
    </div>
</template>
<script setup>
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
    // init()
    window.addEventListener('DOMContentLoaded', init());
}
onMounted(() => {
    const currentPort = window.location.port;
    runRTC('video', `http://localhost:8889/video/realtime/ir1`, 'vis')
})
</script>