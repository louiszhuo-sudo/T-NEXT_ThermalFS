const DEFAULTS = Object.freeze({
    requestTimeoutMs: 8000,
    stallTimeoutMs: 8000,
    disconnectGraceMs: 5000,
    watchdogIntervalMs: 2000,
    maxRetryDelayMs: 15000,
    retryJitterMs: 1000
})

const now = () => performance.now()

const parseIceServers = (links) => {
    if (!links) return []

    return links.split(', ').flatMap((link) => {
        const match = link.match(
            /^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i
        )
        if (!match) return []

        const server = { urls: [match[1]] }
        if (match[3] !== undefined) {
            server.username = JSON.parse(`"${match[3]}"`)
            server.credential = JSON.parse(`"${match[4]}"`)
            server.credentialType = 'password'
        }
        return [server]
    })
}

const parseOffer = (offer) => {
    const parsed = {
        iceUfrag: '',
        icePwd: '',
        medias: []
    }

    for (const line of offer.split('\r\n')) {
        if (line.startsWith('m=')) {
            parsed.medias.push(line.slice(2))
        } else if (!parsed.iceUfrag && line.startsWith('a=ice-ufrag:')) {
            parsed.iceUfrag = line.slice('a=ice-ufrag:'.length)
        } else if (!parsed.icePwd && line.startsWith('a=ice-pwd:')) {
            parsed.icePwd = line.slice('a=ice-pwd:'.length)
        }
    }

    return parsed
}

const enableStereoOpus = (section) => {
    const lines = section.split('\r\n')
    const opusLine = lines.find((line) => (
        line.startsWith('a=rtpmap:') && line.toLowerCase().includes('opus/')
    ))
    if (!opusLine) return section

    const payloadFormat = opusLine.slice('a=rtpmap:'.length).split(' ')[0]
    return lines.map((line) => {
        if (!line.startsWith(`a=fmtp:${payloadFormat} `)) return line
        if (!line.includes('stereo')) line += ';stereo=1'
        if (!line.includes('sprop-stereo')) line += ';sprop-stereo=1'
        return line
    }).join('\r\n')
}

const editOffer = (offer) => {
    const sections = offer.sdp.split('m=')
    offer.sdp = sections.map((section) => (
        section.startsWith('audio') ? enableStereoOpus(section) : section
    )).join('m=')
}

const generateSdpFragment = (offerData, candidates) => {
    const candidatesByMedia = new Map()

    for (const candidate of candidates) {
        const mediaIndex = candidate.sdpMLineIndex
        const mediaCandidates = candidatesByMedia.get(mediaIndex) || []
        mediaCandidates.push(candidate)
        candidatesByMedia.set(mediaIndex, mediaCandidates)
    }

    let fragment = `a=ice-ufrag:${offerData.iceUfrag}\r\n`
        + `a=ice-pwd:${offerData.icePwd}\r\n`

    offerData.medias.forEach((media, mediaIndex) => {
        const mediaCandidates = candidatesByMedia.get(mediaIndex)
        if (!mediaCandidates?.length) return

        fragment += `m=${media}\r\n`
            + `a=mid:${mediaIndex}\r\n`
        for (const candidate of mediaCandidates) {
            fragment += `a=${candidate.candidate}\r\n`
        }
    })

    return fragment
}

export const createWhepPlayer = (options) => {
    const settings = { ...DEFAULTS, ...options }
    const video = settings.video
    const baseUrl = String(settings.url || '').replace(/\/+$/, '')
    const whepUrl = `${baseUrl}/whep`

    if (!video) throw new Error('createWhepPlayer requires a video element')
    if (!baseUrl) throw new Error('createWhepPlayer requires a WHEP stream URL')

    let playerState = 'idle'
    let lastError = ''
    let attempt = 0
    let lastFrameAt = 0
    let remoteDescriptionAt = 0
    let generation = 0
    let stopped = true
    let peerConnection = null
    let remoteStream = null
    let sessionUrl = ''
    let offerData = null
    let queuedCandidates = []
    let retryTimer = null
    let watchdogTimer = null
    let disconnectTimer = null
    let trackMuteTimer = null
    let frameCallbackId = null
    let fallbackTimeUpdateHandler = null
    const requestControllers = new Set()

    const emitState = (nextState, detail = {}) => {
        playerState = nextState
        settings.onStateChange?.({
            state: playerState,
            attempt,
            lastError,
            lastFrameAt,
            ...detail
        })
    }

    const isCurrent = (expectedGeneration) => (
        !stopped && expectedGeneration === generation
    )

    const clearTimer = (timer) => {
        if (timer !== null) window.clearTimeout(timer)
        return null
    }

    const fetchWithTimeout = async (input, init = {}) => {
        const controller = new AbortController()
        const timeout = window.setTimeout(
            () => controller.abort(),
            settings.requestTimeoutMs
        )
        requestControllers.add(controller)

        try {
            return await fetch(input, {
                ...init,
                signal: controller.signal
            })
        } finally {
            window.clearTimeout(timeout)
            requestControllers.delete(controller)
        }
    }

    const deleteSession = (url) => {
        if (!url) return

        const controller = new AbortController()
        const timeout = window.setTimeout(() => controller.abort(), 3000)
        fetch(url, {
            method: 'DELETE',
            signal: controller.signal
        })
            .catch(() => {})
            .finally(() => window.clearTimeout(timeout))
    }

    const stopFrameMonitor = () => {
        if (
            frameCallbackId !== null
            && typeof video.cancelVideoFrameCallback === 'function'
        ) {
            video.cancelVideoFrameCallback(frameCallbackId)
        }
        frameCallbackId = null

        if (fallbackTimeUpdateHandler) {
            video.removeEventListener('timeupdate', fallbackTimeUpdateHandler)
            fallbackTimeUpdateHandler = null
        }
    }

    const teardown = ({ clearVideo = true } = {}) => {
        generation += 1
        disconnectTimer = clearTimer(disconnectTimer)
        trackMuteTimer = clearTimer(trackMuteTimer)
        stopFrameMonitor()

        for (const controller of requestControllers) controller.abort()
        requestControllers.clear()

        const previousSessionUrl = sessionUrl
        sessionUrl = ''
        if (previousSessionUrl) deleteSession(previousSessionUrl)

        const previousPeerConnection = peerConnection
        peerConnection = null
        if (previousPeerConnection) {
            previousPeerConnection.onicecandidate = null
            previousPeerConnection.oniceconnectionstatechange = null
            previousPeerConnection.onconnectionstatechange = null
            previousPeerConnection.ontrack = null
            for (const receiver of previousPeerConnection.getReceivers()) {
                receiver.track?.stop()
            }
            previousPeerConnection.close()
        }

        queuedCandidates = []
        offerData = null
        remoteStream = null
        remoteDescriptionAt = 0
        lastFrameAt = 0

        if (clearVideo) {
            video.pause()
            video.srcObject = null
        }
    }

    const retryDelay = () => {
        const exponentialDelay = Math.min(
            1000 * (2 ** Math.max(0, attempt - 1)),
            settings.maxRetryDelayMs
        )
        return exponentialDelay + Math.floor(Math.random() * settings.retryJitterMs)
    }

    let connect = null

    const restart = (reason = 'unknown') => {
        if (stopped || retryTimer !== null) return

        lastError = String(reason)
        console.warn(`[RTC] reconnecting ${baseUrl}: ${lastError}`)
        attempt += 1
        teardown()
        emitState('retrying', { reason: lastError })

        retryTimer = window.setTimeout(() => {
            retryTimer = null
            connect()
        }, retryDelay())
    }

    const markFrame = (expectedGeneration) => {
        if (!isCurrent(expectedGeneration)) return

        lastFrameAt = now()
        if (playerState !== 'playing') {
            attempt = 0
            lastError = ''
            emitState('playing')
        }
    }

    const startFrameMonitor = (expectedGeneration) => {
        stopFrameMonitor()

        if (typeof video.requestVideoFrameCallback === 'function') {
            const onFrame = () => {
                if (!isCurrent(expectedGeneration)) return
                markFrame(expectedGeneration)
                frameCallbackId = video.requestVideoFrameCallback(onFrame)
            }
            frameCallbackId = video.requestVideoFrameCallback(onFrame)
            return
        }

        fallbackTimeUpdateHandler = () => markFrame(expectedGeneration)
        video.addEventListener('timeupdate', fallbackTimeUpdateHandler)
    }

    const sendCandidates = async (candidates, expectedGeneration) => {
        if (!isCurrent(expectedGeneration) || !sessionUrl || !offerData) return

        try {
            const response = await fetchWithTimeout(
                sessionUrl + window.location.search,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/trickle-ice-sdpfrag',
                        'If-Match': '*'
                    },
                    body: generateSdpFragment(offerData, candidates)
                }
            )
            if (response.status !== 204) {
                throw new Error(`WHEP candidate PATCH returned ${response.status}`)
            }
        } catch (error) {
            if (isCurrent(expectedGeneration)) restart(error)
        }
    }

    const handleTrack = (event, expectedGeneration) => {
        if (!isCurrent(expectedGeneration)) return

        video.autoplay = true
        video.muted = true
        video.playsInline = true

        const eventStream = event.streams[0]
        if (eventStream) {
            remoteStream = eventStream
        } else {
            remoteStream ||= new MediaStream()
            if (!remoteStream.getTracks().includes(event.track)) {
                remoteStream.addTrack(event.track)
            }
        }
        if (video.srcObject !== remoteStream) {
            video.srcObject = remoteStream
        }

        if (event.track.kind === 'video') {
            event.track.onended = () => {
                if (isCurrent(expectedGeneration)) restart('video track ended')
            }
            event.track.onmute = () => {
                if (!isCurrent(expectedGeneration)) return
                trackMuteTimer = clearTimer(trackMuteTimer)
                trackMuteTimer = window.setTimeout(() => {
                    trackMuteTimer = null
                    if (isCurrent(expectedGeneration)) {
                        restart('video track remained muted')
                    }
                }, settings.disconnectGraceMs)
            }
            event.track.onunmute = () => {
                trackMuteTimer = clearTimer(trackMuteTimer)
            }

            startFrameMonitor(expectedGeneration)
            video.play().catch((error) => {
                if (!isCurrent(expectedGeneration)) return
                if (error?.name === 'AbortError') return
                restart(error)
            })
        }
    }

    connect = async () => {
        if (stopped) return

        teardown()
        const expectedGeneration = ++generation
        emitState(attempt > 0 ? 'retrying' : 'connecting')

        try {
            const optionsResponse = await fetchWithTimeout(whepUrl, {
                method: 'OPTIONS'
            })
            if (!optionsResponse.ok) {
                throw new Error(`WHEP OPTIONS returned ${optionsResponse.status}`)
            }
            if (!isCurrent(expectedGeneration)) return

            const localPeerConnection = new RTCPeerConnection({
                iceServers: parseIceServers(optionsResponse.headers.get('Link')),
                sdpSemantics: 'unified-plan'
            })
            peerConnection = localPeerConnection

            localPeerConnection.addTransceiver('video', { direction: 'sendrecv' })
            localPeerConnection.addTransceiver('audio', { direction: 'sendrecv' })

            localPeerConnection.onicecandidate = (event) => {
                if (!isCurrent(expectedGeneration) || !event.candidate) return
                if (!sessionUrl) {
                    queuedCandidates.push(event.candidate)
                } else {
                    void sendCandidates([event.candidate], expectedGeneration)
                }
            }

            const handleConnectionState = () => {
                if (!isCurrent(expectedGeneration)) return

                const iceState = localPeerConnection.iceConnectionState
                const connectionState = localPeerConnection.connectionState
                if (iceState === 'failed' || connectionState === 'failed') {
                    restart(`RTC failed (${connectionState}/${iceState})`)
                    return
                }

                if (iceState === 'disconnected' || connectionState === 'disconnected') {
                    if (disconnectTimer === null) {
                        disconnectTimer = window.setTimeout(() => {
                            disconnectTimer = null
                            if (isCurrent(expectedGeneration)) {
                                restart('RTC remained disconnected')
                            }
                        }, settings.disconnectGraceMs)
                    }
                } else {
                    disconnectTimer = clearTimer(disconnectTimer)
                }
            }

            localPeerConnection.oniceconnectionstatechange = handleConnectionState
            localPeerConnection.onconnectionstatechange = handleConnectionState
            localPeerConnection.ontrack = (event) => (
                handleTrack(event, expectedGeneration)
            )

            const offer = await localPeerConnection.createOffer()
            editOffer(offer)
            offerData = parseOffer(offer.sdp)
            await localPeerConnection.setLocalDescription(offer)

            const offerResponse = await fetchWithTimeout(whepUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/sdp'
                },
                body: offer.sdp
            })
            if (offerResponse.status !== 201) {
                throw new Error(`WHEP POST returned ${offerResponse.status}`)
            }
            if (!isCurrent(expectedGeneration)) return

            const location = offerResponse.headers.get('location')
            if (!location) throw new Error('WHEP response did not include a session location')

            sessionUrl = new URL(location, `${baseUrl}/`).toString()
            const answer = await offerResponse.text()
            await localPeerConnection.setRemoteDescription({
                type: 'answer',
                sdp: answer
            })
            remoteDescriptionAt = now()

            if (queuedCandidates.length) {
                const pendingCandidates = queuedCandidates
                queuedCandidates = []
                await sendCandidates(pendingCandidates, expectedGeneration)
            }
        } catch (error) {
            if (isCurrent(expectedGeneration)) restart(error)
        }
    }

    const start = () => {
        stopped = false
        retryTimer = clearTimer(retryTimer)
        attempt = 0
        lastError = ''

        if (watchdogTimer === null) {
            watchdogTimer = window.setInterval(() => {
                if (stopped || document.hidden || retryTimer !== null) return

                const timestamp = now()
                if (lastFrameAt && timestamp - lastFrameAt >= settings.stallTimeoutMs) {
                    restart('no video frames received')
                } else if (
                    !lastFrameAt
                    && remoteDescriptionAt
                    && timestamp - remoteDescriptionAt >= settings.stallTimeoutMs
                ) {
                    restart('RTC connected without receiving a video frame')
                }
            }, settings.watchdogIntervalMs)
        }

        void connect()
    }

    const stop = () => {
        if (stopped && playerState === 'stopped') return

        stopped = true
        retryTimer = clearTimer(retryTimer)
        if (watchdogTimer !== null) {
            window.clearInterval(watchdogTimer)
            watchdogTimer = null
        }
        teardown()
        emitState('stopped')
    }

    return {
        start,
        restart,
        stop,
        getSnapshot: () => ({
            state: playerState,
            attempt,
            lastError,
            lastFrameAt,
            connectionState: peerConnection?.connectionState || 'closed',
            iceConnectionState: peerConnection?.iceConnectionState || 'closed'
        })
    }
}
