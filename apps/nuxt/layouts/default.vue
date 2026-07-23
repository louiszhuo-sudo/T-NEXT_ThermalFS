<template>
    <v-app dark id="custom-bg">
        <!-- <v-app-bar fixed flat app color="#435155" style="height:64px" class="py-0">
            <img class="ml-6 mr-3 logo" alt="logo" src="/logo.png" width="125em" />
            <v-tabs color="white" hide-slider>
                <template v-for="(item, i) in items">
                    <template>
                        <NuxtLink :to="item.to">
                            <v-tab :key="i" :disabled="item.disabled">
                                <img :src="item.img" max-width="20"></img>
                                <div class="ml-2 ffffont"><span class="ffffont">{{ item.title }}</span></div>
                            </v-tab>
                        </NuxtLink>
                    </template>
</template>
</v-tabs>
<div style="color:#fff;">admin</div>
<v-btn class="mr-1" small depressed color="#00000000" @click="testclick">
    <img src="/images/icon/LOGOUT ICONlogout.svg" />
</v-btn>
</v-app-bar> -->
        <v-main>
            <v-container class="container-custom pa-0 ma-0" style="height: calc(100vh);">
                <!-- <template v-for="(item, i) in snackbarList" :keys="'snackbarxs' + i">
                    <v-snackbar v-model="item.snackbar" :timeout="item.timeout * 1000" :color="item.color" id="ccclww"
                        transition="scroll-x-transition"
                        :style="{ 'margin-bottom': item.calcMargin, 'transition': 'all 0.3s' }" right
                        @input="removeSnackbar(i)">
                        {{ item.text }}
                    </v-snackbar>
                </template> -->
                <NuxtPage />
            </v-container>
        </v-main>
        <!-- <div class="test001111"></div> -->
        <!-- <v-footer height="36" color="#F3F3F3" app>
            <div></div>
        </v-footer> -->
    </v-app>

    <!-- <v-app id="inspire">
        <v-navigation-drawer v-model="drawer">
            <v-list>
                <v-list-item title="home" to="/">

                </v-list-item>
                <v-list-item title="test" to="/test">

                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

            <v-app-bar-title>Application</v-app-bar-title>
        </v-app-bar>

        <v-main>
            <NuxtPage />
        </v-main>
    </v-app> -->
</template>
<script setup>
import L from 'leaflet'
useState('editTimehandleBarSwitch', () => null)
useHead({
    // script: [{
    //     src: '/js/Leaflet.markercluster-1.4.1/dist/leaflet.markercluster.js',
    //     async: false,
    //     defer: true,
    //     onload: () => {
    //         // runIndex.index++
    //     }
    // },
    // {
    //     src: '/js/Leaflet.markercluster-1.4.1/dist/leaflet.geometryutil.js',
    //     async: false,
    //     defer: true,
    //     onload: () => {
    //         // runIndex.index++
    //     }
    // },
    // {
    //     src: '/js/turf.min.js',
    //     async: false,
    //     defer: true,
    //     onload: () => {
    //         // runIndex.index++
    //     }
    // },
    // { src: '/js/L.PixiOverlay.js' }, // 目前沒有用到pixijs
    // {
    //     src: '/js/crypto-js.min.js',
    //     async: false,
    //     defer: true,
    //     onload: () => {
    //         // runIndex.index++
    //     }
    // },
    // {
    //     src: '/js/leaflet.rotatedMarker.js',
    //     async: false,
    //     defer: true,
    //     onload: () => {
    //         // runIndex.index++
    //     }
    // },
    // {
    //     src: '/js/Leaflet.ImageOverlay.Rotated.js',
    //     async: false,
    //     defer: true,
    //     onload: () => {
    //         // runIndex.index++
    //     }
    // },
    // {
    //     src: '/js/Leaflet.GeotagPhoto.min.js',
    //     async: false,
    //     defer: true,
    //     onload: () => {
    //         // runIndex.index++
    //     }
    // }]
});
// const locales = useLocales()
// const locale = useLocale()
// const date = useLocaleDate(new Date('2016-10-26'))
const items = reactive([
    {
        icon: "mdi-tooltip-image-outline",
        img: '/images/head-icon/fileMessage.svg',
        title: "home",
        to: "/",
        disabled: false,
        // permission: this.$auth.hasScope('user'),
    },
    {
        icon: "mdi-tooltip-image-outline",
        img: '/images/head-icon/fileMessage.svg',
        title: "設定",
        to: "/setting",
        disabled: false,
        // permission: this.$auth.hasScope('user'),
    },
    // {
    //   icon: "mdi-tooltip-image-outline",
    //   img: '/images/head-icon/analyze.svg',
    //   title: "檢測分析",
    //   to: "/analyze",
    //   disabled: false
    // },
    // {
    //   icon: "mdi-tooltip-image-outline",
    //   img: '/images/head-icon/output.svg',
    //   title: "報告輸出",
    //   to: "/",
    //   disabled: true
    // },
    // {
    //   icon: "mdi-tooltip-image-outline",
    //   img: '/images/head-icon/stroy.svg',
    //   title: "檢測歷史",
    //   to: "/historyData",
    //   disabled: false,
    //   permission: this.$auth.hasScope('user'),
    // },
    // {
    //   icon: "mdi-tooltip-image-outline",
    //   img: '/images/head-icon/setting.svg',
    //   title: "基本設定",
    //   to: "/setup",
    //   disabled: false,
    //   permission: this.$auth.hasScope('user'),
    //   // permission: this.$auth.hasScope('louis'),
    // },
    // {
    //   icon: "mdi-tooltip-image-outline",
    //   img: '/images/head-icon/setting.svg',
    //   title: "權限設定",
    //   to: "/permission",
    //   disabled: false,
    //   permission: this.$auth.hasScope('admin'),
    // }
    {
        icon: "mdi-tooltip-image-outline",
        img: '/images/head-icon/fileMessage.svg',
        title: "setting",
        to: "/setting",
        disabled: false,
        // permission: this.$auth.hasScope('user'),
    },
])
const testclick = () => {
    console.log('click btn');
}
var ws9 = null
const fps = () => {
    if (ws9 !== null) {
        ws9.close()
        ws9 = null
    }
    ws9 = new WebSocket(`ws://localhost:8901/`);
    ws9.onopen = (e) => {
        console.log('(plugins)串流連接成功::8901');
    }
    // eslint-disable-next-line no-undef
    // var stats1 = new Stats();
    // stats1.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    // document.body.appendChild(stats1.dom);
    var index = 0
    function animate() {
        // stats1.begin();
        // monitored code goes here
        index++
        // stats1.end();
        requestAnimationFrame(animate);
    }
    setInterval(() => {
        // console.log(index);
        ws9.send(JSON.stringify({
            f: index
        }))
        index = 0
    }, 1000)
    requestAnimationFrame(animate);
}
const lows = () => {
    const stats = document.createElement('div');
    stats.style.position = 'fixed';
    stats.style.top = '10px';
    stats.style.left = '10px';
    stats.style.padding = '8px';
    stats.style.background = 'rgba(0, 0, 0, 0.7)';
    stats.style.color = 'white';
    stats.style.fontSize = '14px';
    stats.style.fontFamily = 'monospace';
    stats.style.zIndex = '1000';
    stats.style.borderRadius = '4px';
    // stats.style.display = 'none'; // 預設隱藏
    stats.style.zIndex = '9999';
    document.body.appendChild(stats);

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    stats.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let lastTime = performance.now();
    let frameTimes = [];
    let fps = 0;
    let lowFrametime = Infinity;
    let fpsHistory = [];
    let lowHistory = [];
    let shift1 = 100
    function update() {
        const now = performance.now();
        const delta = now - lastTime;
        lastTime = now;

        frameTimes.push(delta);
        if (frameTimes.length > shift1) frameTimes.shift();

        const avgFrametime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        fps = Math.round(1000 / avgFrametime);
        lowFrametime = Math.min(...frameTimes).toFixed(2);

        fpsHistory.push(fps);
        lowHistory.push(parseFloat(lowFrametime));
        if (fpsHistory.length > shift1) fpsHistory.shift();
        if (lowHistory.length > shift1) lowHistory.shift();

        stats.innerHTML = `<span style="color: lime;">FPS: ${fps}</span><br><span style="color: red;">Low Frametime: ${lowFrametime} ms</span><br>`;
        stats.appendChild(canvas);

        drawChart();
        requestAnimationFrame(update);
    }

    function drawChart() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'lime';
        ctx.beginPath();
        for (let i = 0; i < fpsHistory.length; i++) {
            const x = (i / fpsHistory.length) * canvas.width;
            const y = canvas.height - (fpsHistory[i] / 100 * canvas.height);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = 'red';
        ctx.beginPath();
        for (let i = 0; i < lowHistory.length; i++) {
            const x = (i / lowHistory.length) * canvas.width;
            const y = canvas.height - (lowHistory[i] / 50 * canvas.height);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === '`') {
            stats.style.display = stats.style.display === 'none' ? 'block' : 'none';
        }
    });

    update();
}
onMounted(() => {
    if (false) {
        // ===== 設定 =====
        const PRIMARY = "http://localhost:3000";
        const BACKUPS = [
            "http://192.168.0.173:3001",
            "http://192.168.0.67:3000",
            "http://192.168.0.68:3000"
        ];

        const CHECK_INTERVAL = 3000;
        const FAILURE_THRESHOLD = 2;
        const HEALTH_PATH = "/api/health";

        let failCount = 0;
        let mode = "primary";
        // primary = 我現在就是主要機
        // backup  = 我現在是備援機


        // ===== 取得目前所在 server =====
        const CURRENT = window.location.origin;
        if (CURRENT !== PRIMARY) {
            mode = "backup";
        }


        // ===== ping =====
        async function ping(url) {
            try {
                const res = await fetch(url + HEALTH_PATH);
                console.log('ping ok : ', mode);
                return res.ok;
            } catch (err) {
                console.log('ping fail : ', mode);
                return false;
            }
        }


        // ===== main loop =====
        async function monitor() {
            if (mode === "primary") {
                // 主機永遠不該跳備援（主機 localhost:3000 故障無意義）
                return;
            }

            if (mode === "backup") {
                // 在備援時：要監控 primary 是否恢復
                const alive = await ping(PRIMARY);

                if (alive) {
                    console.warn("Primary recovered. Switching back.");
                    window.location.href = PRIMARY;
                }
            }
        }


        // ===== 專門處理 failover（主機掛了時呼叫一次） =====
        async function failoverToBackup() {
            for (const b of BACKUPS) {
                const ok = await ping(b);
                if (ok) {
                    console.warn("Switching to backup:", b);
                    window.location.href = b;
                    return;
                }
            }

            console.error("No backup server available!");
        }


        // ===== 主機掛掉後才要做 failover (發生在 primary 時) =====
        async function monitorPrimary() {
            if (window.location.origin !== PRIMARY) return;

            const alive = await ping(PRIMARY);

            if (!alive) {
                failCount++;

                if (failCount >= FAILURE_THRESHOLD) {
                    await failoverToBackup();
                }
            } else {
                failCount = 0;
            }
        }


        // ===== 啟動 =====

        if (CURRENT === PRIMARY) {
            setInterval(monitorPrimary, CHECK_INTERVAL);
        } else {
            setInterval(monitor, CHECK_INTERVAL);
        }
    }
})
</script>
<style scoped>
.ffffont {
    color: #fff !important;
}

.container-custom {
    position: absolute;
    max-width: 100%;
    width: 100%;
    height: 100%;
    background-image: url('/bgimg.png');
    background-repeat: no-repeat;
    background-size: cover;
}

.test001111 {
    position: fixed;
    left: 100%;
    top: 100%;
    width: 30px;
    height: 30px;
    background-color: #000;
    transform: translate(-30px, -30px);
    transition: all .3s;
    z-index: 99;
}

.test001111:hover {
    width: 300px;
    height: 300px;
    transform: translate(-300px, -300px);
}
</style>
<style>
.div-point {
    background-color: #fff;
    width: 22px;
    height: 22px;
    border-radius: 24px;
    border: 1px #000 solid;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    transform: translate(2px, -11px);
}

.spot-div-number {
    background-color: #fff;
    width: fit-content;
    height: 22px;
    border-radius: 24px;
    /* border: 1px #000 solid; */
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1em;
    /* transform: translate(-23px, -29px); */
    /* transform: translate(-26%, -46px);*/
    transform: translate(-5%, -39px);
    padding: .0em .3em;
    color: #565656;
}

.temperature-bar-bubble-number {
    /* position: absolute;
    left: 50%;
    top: 56%;
    transform: translate(-50%, -50%); */
    color: #000000;
    position: absolute;
    right: 0;
    top: 56%;
    /* transform: translate(90%, -50%); */
    transform: translate(109%, -28%);
    font-size: 17px;
    text-shadow: 1px 0px 0px rgb(255, 255, 0), 0px 1px 0px rgb(255, 255, 0), -1px 0px 0px rgb(255, 255, 0), 0px -1px 0px rgb(255, 255, 0),
        0px 0px 2px rgb(255, 255, 0);
    pointer-events: none;
}

.alarm-point {
    width: 10px;
    height: 10px;
    border-radius: 10px;
    /* transform: translate(-22px, -30px); */
    transform: translate(-16px, -23px);
}

.P-ADFF00 {
    background-color: #ADFF00;
}

.P-FFDD28 {
    background-color: #FFDD28;
}

.P-FF0909 {
    background-color: #FF0909;
}

.P-FF7223 {
    background-color: #FF7223;
}

.c-meun-treeview-item {
    box-shadow: 1px 1px 7px 0px #00000061;
}

.c-meun-treeview {
    padding: .50em;
    background: #fff;
    transition: background .2s;
    cursor: pointer;
}

.c-meun-treeview:hover {
    background: #e4e4e4;
}

.c-meun-treeview:active {
    background: #c7c7c7;
}

.page-enter-active,
.page-leave-active {
    transition: all 0.4s;
}

.page-enter-from,
.page-leave-to {
    opacity: 0;
    filter: blur(1rem);
}

/* * {
    user-select: none;
} */

html {
    overflow-y: hidden;
}

.switch-field {
    display: flex;
    margin-bottom: 36px;
    overflow: hidden;
}

.switch-field input {
    position: absolute !important;
    clip: rect(0, 0, 0, 0);
    height: 1px;
    width: 1px;
    border: 0;
    overflow: hidden;
}

.switch-field label {
    /* 	background-color: #e4e4e4; */
    font-size: 9px;
    line-height: 1;
    text-align: center;
    padding: 8px 16px;
    margin-right: -1px;
    border: 1px solid rgba(0, 0, 0, 0.102);
    /* 	box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px rgba(255, 255, 255, 0.1); */
    transition: all 0.3s ease-in-out;
    color: rgba(0, 0, 0, 0.102);
    font-size: 9px;
}

.switch-field label:hover {
    cursor: pointer;
}

.switch-field input:checked+label {
    background-color: white;
    box-shadow: none;
    color: #4f5e62;
    border: 1px solid #4f5e62;
}

.switch-field label:first-of-type {
    border-radius: 4px 0 0 4px;
}

.switch-field label:last-of-type {
    border-radius: 0 4px 4px 0;
}

.frame-hard-cam {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    /* width: 106px; */
    justify-content: space-between;
}

.frame-hard-cam-status {
    width: 15px;
    height: 15px;
    border-radius: 15px;
    background-color: #8ab284;
}

.frame-hard-cam-log {
    max-height: 268px;
    overflow-y: scroll;
}

.frame-hard-cam-log>div {
    background-color: #f0f2f3;
    font-size: 14px;
    color: #4f5e62;
}

.frame-hard-setting div {
    font-size: 14px;
}

.frame-hard-btu {
    cursor: pointer;
}

.frame-content {
    border: 1px solid #d7dbdc;
    border-radius: 8px;
}

.frame-content>div {
    border-bottom: 1px solid #d7dbdc;
    display: grid;
    grid-template-columns: 110px 35px;
}

.frame-content>div:last-child {
    border-bottom: 0px solid #d7dbdc;
}

.frame-content input::-webkit-outer-spin-button,
.frame-content input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.openedit {
    border: 1px solid #d9d9d9 !important;
    border-radius: 5px !important;
}

.reset-btn {
    background-color: white;
    border: 2px solid #ccc;
    border-radius: 5px;
    padding: 8px;
    cursor: pointer;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    /* 設置按鈕大小 */
    height: 32px;
}

.reset-btn img {
    width: 26px;
    height: 26px;
    opacity: 0.7;
}

.reset-btn123 {
    background-color: white;
    border: 2px solid #ccc;
    border-radius: 5px;
    padding: 8px;
    cursor: pointer;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    /* 設置按鈕大小 */
    height: 32px;
    position: absolute;
    right: 5px;
    bottom: 5px;
}

.reset-btn123 img {
    width: 26px;
    height: 26px;
    opacity: 0.7;
}

.hidden {
    display: none;
}

.el-display * {
    visibility: hidden;
    pointer-events: none;
}

.hidden-btn {
    visibility: hidden;
    pointer-events: none;
    position: fixed;
    top: -100000px;
    left: -10000px;
}

.camera-pr-canvas {
    width: 440px;
    box-shadow: 0px 0px 4px 2px #00000038;
    min-height: 100px;
    background-color: #FFF;
}

.camera-pr-title {
    line-height: 2.1;
    color: #444;
}

.camera-pr-content-title {
    color: #5F5F5F;
}

.camera-pr-content-btn {
    background-color: #5C9ACC;
    color: #fff;
    padding: 0.1em 1.0em;
    cursor: pointer;
    transition: background-color .1s;
    border-radius: 1px;
    height: 27px;
}

.camera-pr-content-btn:hover {
    background-color: #4e94ce;
}

.camera-pr-content-btn:active {
    background-color: #228ce2;
}

#fov-input div {
    /* height: 20px !important; */
    /* padding: 0px; */
}

#fov-input input {
    min-height: 20px !important;
    padding: 0px !important;
}

#fov-input123 input {
    min-height: 20px !important;
    padding: 0px !important;
    color: #000 !important;
    border: 1px solid !important;
}

.patrol-puse-control-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #00000023;
}

.patrol-puse-control {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #ffffffc9;
    text-align: center;
    width: 300px;
    height: 120px;
    opacity: 1;
    color: #9D9D9D;
    font-size: 18px;
}

.checkChangeBoxDiv-btn {
    background-color: #fff;
    display: flex;
    width: fit-content;
    padding: 0em 0.5em;
    pointer-events: none;
}

.ptz-input-grid .v-field {
    height: 30px;
}

.ptz-input-grid .v-field input {
    padding: 0px 3px !important;
    min-height: 30px !important;
}

/* input {
    user-select: text !important;
} */
</style>