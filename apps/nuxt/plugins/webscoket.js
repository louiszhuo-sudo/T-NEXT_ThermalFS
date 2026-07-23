try {
    var ipaddress = window.location.hostname
    // var ipaddress = 'localhost'
    // var ipaddress = '192.168.0.116'
    var webstust = true
    // ws02
    var ws02 = null
    var wsURL02 = `ws://${ipaddress}:8702/`
    var ws02Int = null
    var connectWs02 = () => {
        // ws02 = new WebSocket("ws://localhost:8702/");
        ws02 = new WebSocket(`ws://${ipaddress}:8702/`);
        // ws02 = new WebSocket("ws://192.168.0.128:8702/");
        // ws03 = new WebSocket("ws://192.168.0.116:8703/");
        // ws03 = new WebSocket("ws://localhost:8703/");
        ws02.onopen = (e) => {
            console.log('(plugins)串流連接成功::8702');
        }
        ws02.onclose = (e) => {
            console.log("(plugins)串流連接中斷::8702");
            if (webstust) {
                console.log("(plugins)嘗試重新連結...::8702");
                if (ws02Int !== null) {
                    clearTimeout(ws02Int)
                }
                ws02Int = setTimeout(() => {
                    connectWs02()
                    clearTimeout(ws02Int)
                    ws02Int = null
                }, 3000)
            }
        }
    }
    connectWs02()
    // ws03


    var wsURL03 = `ws://${ipaddress}:8703/`
    // var ws03 = createWS(wsURL03);
    var ws03 = null
    var ws03Int = null
    let pingInterval03 = null;
    let pongTimeout03 = null;
    let lastSession03 = null;

    const PING_INTERVAL03 = 1000 * 10; // 每 10 秒送一次 ping
    const PONG_TIMEOUT03 = 1000 * 30;  // 30 秒內沒回應就視為斷線
    function genSession() {
        return Math.random().toString(36).substr(2, 9);
    }
    function startHeartbeat() {
        clearInterval(pingInterval03);
        clearTimeout(pongTimeout03);

        pingInterval03 = setInterval(() => {
            if (ws03.readyState === WebSocket.OPEN) {
                lastSession03 = genSession();
                const output = {
                    feature: "ping",
                    method: "",
                    session: lastSession03,
                    content: {}
                };
                ws03.send(JSON.stringify(output));
                // console.log('this last Session :', lastSession03);
                resetPongTimeout();
            }
        }, PING_INTERVAL03);
    }
    function stopHeartbeat() {
        clearInterval(pingInterval03);
        clearTimeout(pongTimeout03);
    }
    function resetPongTimeout() {
        clearTimeout(pongTimeout03);
        pongTimeout03 = setTimeout(() => {
            console.warn("WebSocket timeout (no pong match), 強制關閉");
            ws03.close(); // 交給你既有的重連機制
        }, PONG_TIMEOUT03);
    }
    var connectWs03 = () => {
        ws03 = new WebSocket(`ws://${ipaddress}:8703/`);
        ws03.onopen = (e) => {
            console.log('(plugins)串流連接成功::8703');
            startHeartbeat()
        }
        ws03.onmessage = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            } catch {
                data = event.data;
            }

            // 判斷 pingpong 回應
            safeLog("get back-end 8703", data);
            if (data.feature === "ping" && data.method === "") {
                if (data.session === lastSession03) {
                    // console.log("PONG OK, session=", data.session);
                    resetPongTimeout();
                } else {
                    // console.warn("PONG session 不符:", data.session, "期望:", lastSession03);
                }
            }
        };
        ws03.onclose = (e) => {
            console.log("(plugins)串流連接中斷::8703");
            // if (webstust && !manualrestart) {
            if (webstust) {
                console.log("(plugins)嘗試重新連結...::8703");
                if (ws03Int !== null) {
                    clearTimeout(ws03Int)
                }
                ws03Int = setTimeout(() => {
                    connectWs03()
                    clearTimeout(ws03Int)
                    ws03Int = null
                }, 3000)
            }
        }
    }
    connectWs03()
    function safeLog(label, data, maxSize = 500) {
        let str;
        try {
            str = JSON.stringify(data);
        } catch (err) {
            console.warn(label, "資料無法 stringify:", err);
            return;
        }

        if (str.length > maxSize) {
            // console.log(`${label} (截斷輸出，原始長度=${str.length}) :`, str.slice(0, maxSize) + "...[TRUNCATED]");
        } else {
            // console.log(`${label} :`, str);
        }
    }
    // ws04
    var ws04 = null
    var wsURL04 = `ws://${ipaddress}:8704/`
    var ws04Int = null
    var connectws04 = () => {
        // ws04 = new WebSocket("ws://localhost:8704/");
        ws04 = new WebSocket(`ws://${ipaddress}:8704/`);
        // ws04 = new WebSocket("ws://192.168.0.142:8703/");
        // ws04 = new WebSocket("ws://192.168.0.116:8704/");
        // ws04 = new WebSocket("ws://localhost:8703/");
        ws04.onopen = (e) => {
            console.log('(plugins)串流連接成功::8703');
        }
        ws04.onclose = (e) => {
            console.log("(plugins)串流連接中斷::8703");
            if (webstust) {
                console.log("(plugins)嘗試重新連結...::8703");
                if (ws04Int !== null) {
                    clearTimeout(ws04Int)
                }
                ws04Int = setTimeout(() => {
                    connectws04()
                    clearTimeout(ws04Int)
                    ws04Int = null
                }, 3000)
            }
        }
    }
    connectws04()

    // ws05
    var ws05 = null
    var wsURL05 = `ws://${ipaddress}:8705/`
    var ws05Int = null
    var connectws05 = () => {
        // ws05 = new WebSocket("ws://localhost:8705/");
        ws05 = new WebSocket(`ws://${ipaddress}:8705/`);
        // ws05 = new WebSocket("ws://192.168.0.142:8703/");
        // ws05 = new WebSocket("ws://192.168.0.116:8705/");
        // ws05 = new WebSocket("ws://localhost:8703/");
        ws05.onopen = (e) => {
            console.log('(plugins)串流連接成功::8703');
        }
        ws05.onclose = (e) => {
            console.log("(plugins)串流連接中斷::8703");
            if (webstust) {
                console.log("(plugins)嘗試重新連結...::8703");
                if (ws05Int !== null) {
                    clearTimeout(ws05Int)
                }
                ws05Int = setTimeout(() => {
                    connectws05()
                    clearTimeout(ws05Int)
                    ws05Int = null
                }, 3000)
            }
        }
    }
    connectws05()

    // ws07
    var ws07 = null
    var wsURL07 = `ws://${ipaddress}:8707/`
    var ws07Int = null
    var connectws07 = () => {
        // ws05 = new WebSocket("ws://localhost:8705/");
        ws07 = new WebSocket(`ws://${ipaddress}:8707/`);
        // ws05 = new WebSocket("ws://192.168.0.142:8703/");
        // ws05 = new WebSocket("ws://192.168.0.116:8705/");
        // ws05 = new WebSocket("ws://localhost:8703/");
        ws07.onopen = (e) => {
            console.log('(plugins)串流連接成功::8707');
        }
        ws07.onclose = (e) => {
            console.log("(plugins)串流連接中斷::8707");
            if (webstust) {
                console.log("(plugins)嘗試重新連結...::8707");
                if (ws07Int !== null) {
                    clearTimeout(ws07Int)
                }
                ws07Int = setTimeout(() => {
                    connectws07()
                    clearTimeout(ws07Int)
                    ws07Int = null
                }, 3000)
            }
        }
    }
    connectws07()

    // 物件導向
    function createWS(url) {
        let ws;
        let pingInterval = null;
        let pongTimeout = null;
        let lastSession = null;

        const PING_INTERVAL = 10000; // 每 10 秒 ping 一次
        const PONG_TIMEOUT = 30000;  // 30 秒內沒回應就斷線

        function genSession() {
            return Math.random().toString(36).substr(2, 9);
        }

        function startHeartbeat() {
            clearInterval(pingInterval);
            clearTimeout(pongTimeout);

            pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    lastSession = genSession();
                    const output = {
                        feature: "ping",
                        method: "",
                        session: lastSession,
                        content: {}
                    };
                    ws.send(JSON.stringify(output));
                    resetPongTimeout();
                }
            }, PING_INTERVAL);
        }

        function resetPongTimeout() {
            clearTimeout(pongTimeout);
            pongTimeout = setTimeout(() => {
                console.warn("WebSocket timeout (no pong match), 強制關閉");
                ws.close(); // 交給你既有的重連機制
            }, PONG_TIMEOUT);
        }

        function stopHeartbeat() {
            clearInterval(pingInterval);
            clearTimeout(pongTimeout);
        }

        function connect() {
            ws = new WebSocket(url);

            ws.onopen = () => {
                console.log("WebSocket 已連線");
                startHeartbeat();
            };

            ws.onmessage = (event) => {
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch {
                    data = event.data;
                }

                // 只判斷 pingpong 回應
                if (data.feature === "test" && data.method === "pingpong") {
                    if (data.session === lastSession) {
                        // console.log("PONG OK, session=", data.session);
                        resetPongTimeout();
                    } else {
                        // console.warn("PONG session 不符:", data.session, "期望:", lastSession);
                    }
                } else {
                    console.log("收到訊息:", data);
                }
            };

            ws.onerror = (err) => {
                console.error("WebSocket 錯誤:", err);
            };

            ws.onclose = () => {
                console.warn("WebSocket 已關閉");
                stopHeartbeat();
            };
        }

        connect();
        return ws;
    }
} catch (error) {
    console.log('webscoket plugins error');
}

export default defineNuxtPlugin(() => {
    return {
        provide: {
            getIpaddress: (msg) => {
                return ipaddress
            },
            webSocketconnect02: (msg) => {
                return ws02
            },
            webSocketconnect03: (msg) => {
                return ws03
            },
            webSocketconnect04: (msg) => {
                return ws04
            },
            webSocketconnect05: (msg) => {
                return ws05
            },
            webSocketconnect07: (msg) => {
                return ws07
            },
            webSocket05URL: (msg) => {
                return wsURL05
            },
            webSocket02URL: (msg) => {
                return wsURL02
            },
            webSocket03URL: (msg) => {
                return wsURL03
            },
            webSocket04URL: (msg) => {
                return wsURL04
            },
            displayRoi: (msg) => {
                var roi = {
                    spot: true,
                    scope: true,
                    line: true,
                    blob: true
                }
                return roi
            },

        }
    }
})