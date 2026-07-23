<template>
    <div class="windows">
        <!-- 上區塊 -->
        <div class="item-card-content-window" style="overflow: hidden;">
            <div class="d-flex mt-1 def-point-btn" @click="state.menu = !state.menu">
                <div class="def-point-grid pa-1" style="pointer-events: none;">
                    <button>
                        <NuxtImg src="images/icon/menufs-meun.svg" width="30"></NuxtImg>
                    </button>
                </div>
            </div>
            <div class="d-flex mt-1 def-point-btn">
                <NuxtLink to="/">
                    <div class="def-point-grid pa-1" style="pointer-events: none;">
                        <button>
                            <NuxtImg src="images/fs/icon/back.svg" width="30"></NuxtImg>
                        </button>
                    </div>
                </NuxtLink>
            </div>
        </div>
        <!-- 中區域內容 -->
        <div class="t-content-grid" style="height: calc(100% - 44px)"
            :style="state.menu ? 'grid-template-columns: 15% 85%;' : 'grid-template-columns: 0% 100%;'">
            <div class="t-meun" :style="state.menu ? 'opacity: 1;' : 'opacity: 0;'">
                <ClientOnly>
                    <v-treeview activatable :items="state.items" open-all></v-treeview>
                </ClientOnly>
            </div>
            <div style="height: 100%;">
                <div class="d-flex align-center">
                    <span class="mx-3">雲台</span>
                    <div style="width: 150px;">
                        <v-select v-model="state.ptzTitle" :items="state.ptzItems" variant="outlined"
                            hide-details></v-select>
                    </div>
                </div>
                <div class="c-grid-ptz">
                    <div class="c-grid-ptz-col">
                        <ClientOnly>
                            <MapDefault ref="mapImport1" :formtData="{}" :mainMode="[]"
                                @dataFromChild="handleDataFromChild" :mainProps="''" :camID="1" camType="ir" />
                        </ClientOnly>
                        <ClientOnly>
                            <MapDefault ref="mapImport1" :formtData="{}" :mainMode="[]"
                                @dataFromChild="handleDataFromChild" :mainProps="''" :camID="1" camType="vis" />
                        </ClientOnly>
                    </div>
                    <!-- control ptz -->
                    <div class="c-grid-ptz-col">
                        <div>
                            <div class="d-flex justify-space-between py-1" style="border-bottom: 2px solid #878787;">
                                <div>預設點參數設置</div>
                                <div class="d-flex">
                                    <span class="mr-3">巡弋狀態</span>
                                    <div class="c-switch-lo" style="width: 150px;">
                                        <div class="c-switch-a"
                                            :class="!state.ptzswitch ? 'c-switch-foucs' : 'c-switch-after-add'"
                                            @click="ptzswitchEvent(false)">
                                            閒置中
                                        </div>
                                        <div class="c-switch-b" :class="state.ptzswitch ? 'c-switch-foucs' : ''"
                                            @click="ptzswitchEvent(true)">巡弋中
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style="display: grid;grid-template-columns: 47% 53%;">
                                <div class="d-flex justify-center align-center">
                                    <NuxtImg src="images/fs/icon/Thermal FS.svg"></NuxtImg>
                                </div>
                                <div class="ptz-control-dialogs">
                                    <div class="ptz-text d-flex justify-space-around">
                                        <div>預設點位置 / 模式設定</div>
                                        <div class="c-switch-lo" style="width:200px">
                                            <div class="c-switch-a"
                                                :class="!state.ptzswitch ? 'c-switch-foucs' : 'c-switch-after-add'"
                                                @click="ptzswitchEvent(false)">
                                                單點建立
                                            </div>
                                            <div class="c-switch-b" :class="state.ptzswitch ? 'c-switch-foucs' : ''"
                                                @click="ptzswitchEvent(true)">扇掃建立
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-2 pa-2" style="border: 2px #878787 solid;">
                                        <div class="ptz-input-grid">
                                            <div style="border-right: 1px #878787 solid;" class="d-flex justify-center">
                                                <v-checkbox label="(左上)" hide-details hide-spin-buttons
                                                    density="compact"></v-checkbox>
                                            </div>
                                            <div class="d-flex w-100 my-1 align-center justify-center">
                                                <div class="ptz-text">水平角</div>
                                                <div class="w-50 px-1">
                                                    <v-text-field v-model="state.ptzCurrentAngle[0]" hide-details
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number"></v-text-field>
                                                </div>
                                            </div>
                                            <div class="d-flex w-100 my-1 align-center justify-center">
                                                <div class="ptz-text">垂直角</div>
                                                <div class="w-50  px-1">
                                                    <v-text-field v-model="state.ptzCurrentAngle[1]" hide-details
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number"></v-text-field>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="ptz-input-grid mt-1">
                                            <div style="border-right: 1px #878787 solid;" class="d-flex justify-center">
                                                <v-checkbox label="(右上)" hide-details hide-spin-buttons
                                                    density="compact"></v-checkbox>
                                            </div>
                                            <div class="d-flex w-100 my-1 align-center justify-center">
                                                <div class="ptz-text">水平角</div>
                                                <div class="w-50 px-1">
                                                    <v-text-field v-model="state.ptzCurrentAngle[0]" hide-details
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number"></v-text-field>
                                                </div>
                                            </div>
                                            <div class="d-flex w-100 my-1 align-center justify-center">
                                                <div class="ptz-text">垂直角</div>
                                                <div class="w-50  px-1">
                                                    <v-text-field v-model="state.ptzCurrentAngle[1]" hide-details
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number"></v-text-field>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="w-100 d-flex justify-center">
                                            <div class="ptz-control">
                                                <NuxtImg src="images/控制圓盤.svg" style="width: 100%;margin-left: -4px;">
                                                </NuxtImg>
                                                <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-top"></div>
                                                <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-bottom"></div>
                                                <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-left"></div>
                                                <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-right"></div>
                                            </div>
                                        </div>
                                        <div class="ptz-selection-grid">
                                            <div class="ptz-selection001-grid w-100 my-1 align-center">
                                                <div class="ptz-text">參考預設點</div>
                                                <div class="w-100 px-1">
                                                    <v-select hide-details :items="state.cursingPointItems"
                                                        v-model="state.cursingPointValue"
                                                        ></v-select>
                                                </div>
                                            </div>
                                            <div class="ml-1 mt-1" style="width: 30px">
                                                <v-btn id="menu-activator" flat block color="#96B4DD">
                                                    <NuxtImg src="/images/fs/icon/Undo.svg" width="30px" />
                                                </v-btn>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex justify-space-evenly py-1">
                                <div class="d-flex align-center">
                                    <div class="mr-3">巡弋路徑</div>
                                    <div style="width: 200px;">
                                        <v-text-field variant="outlined" disabled hide-details
                                            hide-spin-buttons></v-text-field>
                                    </div>
                                </div>
                                <v-divider class="ms-3" inset vertical></v-divider>
                                <div class="d-flex align-center">
                                    <div class="mr-3">預設點名稱</div>
                                    <div style="width: 200px;">
                                        <v-text-field variant="outlined" disabled hide-details
                                            hide-spin-buttons></v-text-field>
                                    </div>
                                    <div class="ml-1 mt-1" style="width: 100px">
                                        <v-btn id="menu-activator" flat block color="#96B4DD">
                                            <span style="color:#fff;">新增預設點</span>
                                        </v-btn>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- control ptz end -->
                        <ClientOnly>
                            <MapDefault ref="mapImport1" :formtData="state" :mainMode="[]"
                                @dataFromChild="handleDataFromChild" :mainProps="''" :camID="i" camType="vis"
                                :usePhoto="true" />
                        </ClientOnly>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
const { $webSocketconnect02 } = useNuxtApp()
const { $webSocketconnect03 } = useNuxtApp()
const { $webSocketconnect05 } = useNuxtApp()
const state = reactive({
    wsRoiData: null,
    wsRoiData1: null,
    mainMode: 'roi', // review = 監控模式 ,roi = ROI模式,mask = MASK模式,mask-temp-select = 溫度區域選取模式
    mainModeItems: ['review', 'roi', 'mask', 'mask-temp-select'],
    items: [
        {
            id: 1,
            title: 'Server 01',
            children: [
                { id: 2, title: '戶外監測' },
            ],
        }
    ],
    menu: false,
    ws2: {
        readyState: 0
    },
    wsListener2: {
        close: null,
        message: null
    },
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
    ptzswitch: false,
    ptzCurrentAngle: [0, 0],
    ptzCurrentAngleInput: true,
    cursingPointItems: [],
    cursingPointValue: 0,
    ptzTitle:0,
    ptzItems: []
})
const handleDataFromChild = () => {
    console.log('handleDataFromChild');
}
const ptzswitchEvent = (e) => {
    if (e) {
        state.ptzswitch = true
    } else {
        state.ptzswitch = false
    }
    // var output = {
    //     "feature": "ptz",
    //     "method": "set_cursingStatus",
    //     "content": {
    //         "ptz_id": state.ptzinto.id,
    //         "cursing_status": e ? 1 : 0
    //     },
    //     "session": "asdasd"
    // }
    // state.ws3.send(JSON.stringify(output))
}
const setPtzCurrentAngle = () => {
    console.log('go');
}
const initWs2 = () => {
    const openwebsocket02 = () => {
        if ($webSocketconnect02().readyState === 1) {
            state.ws2 = $webSocketconnect02()
            if (state.wsListener2.close !== null) {
                state.ws2.removeEventListener("close", state.wsListener2.close)
                state.wsListener2.close = null
            }
            const colseEvent = () => {
                setTimeout(() => {
                    openwebsocket02()
                }, 1000)
            }
            state.ws2.addEventListener("close", colseEvent)
            state.wsListener2.close = colseEvent
            // var tew = 0
            const messageEvent = (event) => {
                // var data = JSON.parse(event.data)
                // console.log("data", data);
            }
            state.ws2.addEventListener("message", messageEvent)
            // state.wsListener3.message = messageEvent
        } else if ($webSocketconnect02().readyState !== 1) {
            setTimeout(() => {
                openwebsocket02()
            }, 1000)
        }
    }
    openwebsocket02()
}
const initWs3 = () => {
    const openwebsocket03 = () => {
        if ($webSocketconnect03().readyState === 1) {
            state.ws3 = $webSocketconnect03()
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
                state.wsRoiData = data
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
const initWs5 = () => {
    const openwebsocket05 = () => {
        if ($webSocketconnect05().readyState === 1) {
            state.ws5 = $webSocketconnect05()
            if (state.wsListener5.close !== null) {
                state.ws5.removeEventListener("close", state.wsListener5.close)
                state.wsListener5.close = null
            }
            const colseEvent = () => {
                setTimeout(() => {
                    openwebsocket05()
                }, 1000)
            }
            state.ws5.addEventListener("close", colseEvent)
            state.wsListener5.close = colseEvent
            // var tew = 0
            const messageEvent1 = (event) => {
                var data = JSON.parse(event.data)
                state.wsRoiData1 = data
                var ptzItems = []
                var ptzContent = data.overall_ptzStatus.ptz_content
                ptzContent.forEach((item1, index1) => {
                    item1.ptz_name
                    ptzItems.push({
                        title: item1.ptz_name,
                        value: index1
                    })
                })
                state.ptzItems = ptzItems
            }
            state.ws5.addEventListener("message", messageEvent1)
            // state.wsListener3.message = messageEvent
        } else if ($webSocketconnect05().readyState !== 1) {
            setTimeout(() => {
                openwebsocket05()
            }, 1000)
        }
    }
    openwebsocket05()
}
onMounted(() => {
    initWs2()
    initWs3()
    initWs5()
})
onBeforeUnmount(() => {
    if (state.wsListener2.close !== null) {
        state.ws2.removeEventListener("close", state.wsListener2.close)
        state.wsListener2.close = null
    }
    if (state.wsListener2.message !== null) {
        state.ws2.removeEventListener("message", state.wsListener2.message)
        state.wsListener2.message = null
    }
    if (state.ws2 !== null) {
        // state.ws.close()
        state.ws2 = null
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
        // state.ws.close()
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
})
</script>
<style scoped>
.windows {
    background: #fff;
    width: 100%;
    height: 100%;
}

.t-content-grid {
    display: grid;
    transition: all .3s;
    height: 100%;
}

.t-meun {
    border-right: #B4B4B4 1px solid;
    transition: all .3s;
    overflow: auto;
    display: flex;
    flex-direction: column;
}

.item-card-content-window {
    /* flex-grow: 1;
    padding: .5em; */
    overflow: auto;
    display: flex;
    height: 44px;
    border-bottom: 1px #B4B4B4 solid;
}

.def-point-grid {
    width: 100%;
    display: grid;
    grid-template-columns: 7% 83% 11%;
    cursor: pointer;
    /* background-color: #fff; */
    align-items: center;
}

.def-point-btn {
    background-color: #fff;
    transition: .2s;
    /* border: 2px #EAEAEA solid; */
    cursor: pointer;
}

.def-point-btn:hover {
    background-color: #fdfdfd;
}

.c-grid-ptz {
    height: calc(100% - 35px);
    display: grid;
    grid-template-rows: 40% 60%;
}

.c-grid-ptz-col {
    height: 100%;
    display: grid;
    grid-template-columns: 50% 50%;
}

.c-grid-ptz-col>div {
    padding: .15em;
}

.ptz-control-canvas {
    background-color: #fff;
    position: absolute;
    bottom: 30px;
    right: 30px;
}

.c-btn-e {
    display: flex;
    padding: .3em;
    transition: all .1s;
    background-color: #ffffff00;
}

.c-btn-e:hover {
    background-color: #d1d1d1;
}

.c-btn-e:active {
    background-color: #b6b6b6;
}

.ptz-control-dialogs {
    background-color: #fff;
    /* position: fixed; */
    /* right: 10%; */
    /* bottom: 40%; */
    width: 100%;
    /* border: 2px #878787 solid; */
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
    width: 180px;
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
    grid-template-columns: 30% 35% 35%
}

.ptz-selection-grid {
    display: grid;
    grid-template-columns: 90% 10%;
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