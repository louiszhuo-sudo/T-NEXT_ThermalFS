<template>
    <div class="w-100 h-100" @mouseup="itemMouseup()">
        <template v-for="(item, i) in state.cctvolnyROI" :key="i">
            <!-- <div
                :class="state.focusPage === item.container_camera_id && item.container_type === 1 ? 'cctv-mode-edit' : 'cctv-mode-display'">
                <ClientOnly>
                    <MapMain :ref="el => refsHandler(el, item.container_camera_id)" :camID="item.container_camera_id"
                        :camType="'ir'" @toTab="toMapPage" />
                </ClientOnly>
            </div> -->
        </template>
        <!-- <div class="realTimeCover-temp" ref="realTimeCanvasTemp" @mousedown="onMousedown" @mouseup="onMouseup"
            @mousemove="onMousemove"></div> -->
        <div class="transform-canvas"
            style="width: 100%;height: 100%;overflow: auto;background-color:#fff;overflow: hidden;">
            <div class="transform-container" style="transform: translate(0, 0) scale(1, 1); transform-origin: 0 0;">
                <div class="grid-stack">
                    <template v-for="(item, index) in state.childrenROI" :key="index">
                        <div class="grid-stack-item"
                            :gs-x="state.focusPage === item.option.camID && item.type === 'main' ? 0 : item.x"
                            :gs-y="state.focusPage === item.option.camID && item.type === 'main' ? 0 : item.y"
                            :gs-w="state.focusPage === item.option.camID && item.type === 'main' ? state.cols : item.w"
                            :gs-h="state.focusPage === item.option.camID && item.type === 'main' ? state.rows : item.h"
                            @mouseover="state.itemMouseOver = true" @mouseout="state.itemMouseOver = false"
                            :style="{ zIndex: state.focusPage === item.option.camID && item.type === 'main' ? 999 : item.z, opacity: state.savedownID === item.option.container_index ? 0.3 : 1 }"
                            @mousedown="item.type !== 'fullview' && state.focusPage !== item.option.camID && item.type !== 'main' ? itemMouseDown(item.option.tabId, item.option.container_index) : ''"
                            @mouseup="itemMouseup(item.option.tabId, item.option.container_index)">
                            <div class="grid-stack-item-content">
                                <template v-if="item.type === 'fullview'">
                                    <div style="width: 100%; height:100%;">
                                        <ClientOnly>
                                            <MapPanoramic :camID="item.option.camID" :camType="'ir'" :formtData="state"
                                                :base64="item.image_base64" @topage123="toMapPage1" />
                                        </ClientOnly>
                                    </div>
                                </template>
                                <template v-else-if="item.type === 'main'">
                                    <div style="width: 100%; height:100%;overflow: hidden;">
                                        <div class="main-dis-c"
                                            :class="[state.focusPage === item.option.camID ? 'cctv-mode-edit' : 'cctv-mode-display', state.savedownID !== null ? 'grid-stack-item-content-canvas-hole' : '']"
                                            @click="toMapPage1(item.option.camID)">
                                        </div>
                                        <ClientOnly>
                                            <MapMain :ref="el => refsHandler(el, item.option.camID)"
                                                :camID="item.option.camID" :camType="'ir'" @toTab="toMapPage" />
                                        </ClientOnly>
                                    </div>
                                </template>
                                <template v-else-if="item.type === 'vis'">
                                    <div class="grid-stack-item-content-canvas"
                                        :class="state.savedownID !== null ? 'grid-stack-item-content-canvas-hole' : ''">
                                    </div>
                                    <div style="width: 100%; height:100%;overflow: hidden;">
                                        <!-- <ClientOnly>
                                            <MapOnlyvideo :formtData="state" :camID="item.option.camID"
                                                :camType="'vis'" />
                                        </ClientOnly> -->
                                        <ClientOnly>
                                            <MapOnlyvideo :ref="el => refsHandlerMapImport1(el, index)"
                                                :formtData="state" :camID="item.option.camID" :camType="'vis'" />
                                        </ClientOnly>
                                    </div>
                                </template>
                                <template v-else-if="item.type === 'map'">
                                    <div class="grid-stack-item-content-canvas"
                                        :class="state.savedownID !== null ? 'grid-stack-item-content-canvas-hole' : ''">
                                    </div>
                                    <div style="width: 100%; height:100%;overflow: hidden;">
                                        <ClientOnly>
                                            <MapCameraphoto :formtData="state" :mainProps="''" :camID="null"
                                                camType="vis" :ptzAlarmID="state.alarmID" />
                                        </ClientOnly>
                                    </div>
                                </template>
                                <template v-else-if="item.type === 'null'">
                                    <div style="width: 100%; height:100%;overflow: hidden;"></div>
                                </template>
                                <template v-else-if="item.type === 'bg'">
                                    <div style="width: 100%; height:100%;overflow: hidden;"></div>
                                </template>
                                <!-- <div class="grid-stack-item-content-canvas"
                                    @click="item.type === 'main' ? toMapPage1(item.option.camID) : ''">
                                </div> -->
                            </div>
                        </div>
                    </template>
                    <!-- <div class="grid-stack-item" :gs-x="0" :gs-y="0" :gs-w="1" :gs-h="1" :style="{ zIndex: 2 }">
                        <div class="grid-stack-item-content">123</div>
                    </div> -->
                </div>
            </div>
        </div>
        <!-- <div class="realTimeCover" ref="realTimeCanvas">
            <template v-for="(item, index) in state.cctvDisplayList" :key="index">
                <template v-if="item.container_type === 0">
                    <div :ref="el => refsrealTimeCover(el, index)" class="realTimeCover-item"
                        :class="item.display ? 'el-display' : ''" :data-id="item.container_index"
                        :data-json="JSON.stringify(item)" @mousedown="(e) => clickContainer(e, item, index, false)"
                        @mouseup="(e) => upContainer(e, item, index, false)">
                        <div class="mock-div1"></div>
                    </div>
                </template>
                <template v-else>
                    <div :ref="el => refsrealTimeCover(el, index)" class="realTimeCover-item goToMore-canvas"
                        :data-id="item.container_index" :data-json="JSON.stringify(item)"
                        @mousedown="(e) => clickContainer(e, item, index, state.focusPage === item.container_camera_id && item.container_type === 1)"
                        @mouseup="(e) => upContainer(e, item, index, state.focusPage === item.container_camera_id && item.container_type === 1)">
                        <div class="goToMore-canvas-u goToMore-canvas-hover"
                            @click="toMapPage1(item.container_camera_id)"
                            v-if="state.focusPage !== item.container_camera_id && item.container_navigation === 1">
                        </div>
                        <div class="goToMore-canvas-u" v-if="item.container_navigation === 0"></div>
                        <div :class="state.focusPage === item.container_camera_id && item.container_type === 1 ? '' : 'pointer-none-map'"
                            style="width: 100%;height: 100%;">
                            <template v-if="item.container_type === 2">
                                <ClientOnly>
                                    <MapOnlyvideo :ref="el => refsHandlerMapImport1(el, index)" :formtData="state"
                                        :camID="item.container_camera_id" :camType="'vis'" />
                                </ClientOnly>
                            </template>
                            <template v-else-if="item.container_type === 1">
                                <ClientOnly>
                                    <MapOnlyroi :ref="el => refsHandler2(el, index)" :camID="item.container_camera_id"
                                        :camType="'ir'" />
                                </ClientOnly>
                            </template>
                            <template v-else-if="item.container_type === 3">
                                <ClientOnly>
                                    <MapCameraphoto :ref="el => refsHandlerMapImport2(el, index)" :formtData="state"
                                        :mainProps="''" :camID="null" camType="vis" :ptzAlarmID="state.alarmID"
                                        @toTab="toMapPage" />
                                </ClientOnly>
                            </template>
                        </div>
                    </div>
                </template>
            </template>
        </div> -->
        <div id="message" style="display: none;">
        </div>
        <!-- <umsdataelement id="UMSDataElement" style="display: none;"></umsdataelement> -->
        <div id="tmtoolbar_manual_rating_injected" style="display: none;">init</div>
        <div id="UMSSendDataEventElement" style="display: none;">init</div>
        <div id="temp-copy-object"></div>
    </div>
</template>
<script setup>
const { $webSocketconnect02 } = useNuxtApp()
const { $webSocketconnect03 } = useNuxtApp()
const { $webSocketconnect05 } = useNuxtApp()
let grid = null
let container; // 容器 DOM
let container2; // 容器 DOM
let content; // 內部的 transform 物件
let content2; // 內部的 transform 物件
const props = useAttrs().formtData
const tabId = useAttrs().tabId
const mapmain = ref([])
const realTimeCover = ref([])
const mapImport1 = ref([])
const mapImport2 = ref([])
const mapImport3 = ref([])
const realTimeCovertatle = reactive({
    value: 0
})
const realTimeCanvasTemp = ref(null);
const realTimeCanvas = ref(null);
const state = reactive({
    mainMode: 'roi', // review = 監控模式 ,roi = ROI模式,mask = MASK模式,mask-temp-select = 溫度區域選取模式
    wsRoiData: null,
    wsRoiData1: null,
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
    alarmID: [],
    focusPage: null, // null = 全局
    cctvDisplayList: [],
    cctvolnyROI: [],
    mapimg: '',
    mousedownLocations: { // 暫存滑鼠點擊第一位置
        x: 0,
        y: 0
    },
    tempHoverDiv: null,
    tempHoverindex: 0,
    tempPathItemDivLocaltion: {
        x: 0,
        y: 0
    },
    tempscreensplitList: [],
    tempTabId: 0,
    tempcurrentcctv: [],
    olnytag: true,
    childrenROI: [],
    ptzswitch: 1,
    allItemMain: [],
    cols: 1,
    rows: 1,
    savedownID: null
})
const itemMouseDown = (tabid, index) => {
    // console.log(index);
    state.savedownID = index
}
const itemMouseup = (tabid1, index) => {
    if (state.savedownID !== null) {
        console.log(state.savedownID, index);
        var output = {
            "feature": "layout",
            "method": "set_orderContainer",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "tab_id": state.tempTabId,
                "changed_index": [parseInt(state.savedownID), parseInt(index)]
            }
        }
        state.ws3.send(JSON.stringify(output))
        toMapPage(state.tempTabId)
    }
    state.savedownID = null
}
// const winMousemove = (e) => {
//     if (state.savedownID !== null) {
//         console.log(e.target);
//         console.log('sd');

//     }
// }
const generateTemporaryArray = (mainArray, filterArray) => {
    // 將 filterArray 中的物件轉成字串，方便比較
    const filterSet = new Set(filterArray.map(item => JSON.stringify(item)));

    // 使用 map 建立新陣列
    return mainArray.map(item => {
        const isMatched = filterSet.has(JSON.stringify(item));
        return {
            ...item, // 保留原有的鍵值
            display: !isMatched // 如果匹配則 display = false，否則 display = true
        };
    });
}
const refsHandler = (el, index) => {
    if (el) {
        mapmain.value[index] = el
    }
}
const refsHandler2 = (el, index) => {
    if (el) {
        mapImport2.value[index] = el
    }
}
const refsHandlerMapImport1 = (el, index) => {
    if (el) {
        mapImport1.value[index] = el
    }
}
const refsHandlerMapImport2 = (el, index) => {
    if (el) {
        mapImport3.value[index] = el
    }
}
const refsrealTimeCover = (el, index) => {
    if (el) {
        realTimeCover.value[index] = el

    }
    if (realTimeCovertatle.value - 1 === index && state.olnytag) {
        rundisplay()
        state.olnytag = false
    }
}
const emit = defineEmits(['cctvToMapMain'])
const toMapPage = (e) => {
    let data = props.layoutData
    state.tempTabId = e
    let findID = data.layout.findIndex((item) => item.tab_id === e)
    const containerData = data.layout[findID]
    // console.log('toMapPage', e, containerData);
    if (containerData.tab_type === 2) {
        state.childrenROI = []
        let cols = containerData.container_splitScreen.total_column // 豎
        let rows = containerData.container_splitScreen.total_row// 橫
        state.cols = cols
        state.rows = rows
        grid.column(cols);
        grid.cellHeight(container.getBoundingClientRect().height / rows);
        setTimeout(() => {
            let TempchildrenROI = []
            containerData.container_list.forEach((item, index) => {
                const container_type = item.container_type
                TempchildrenROI.push(
                    {
                        x: item.container_location.column_start,
                        y: item.container_location.row_start,
                        w: item.container_location.column_width,
                        h: item.container_location.column_height,
                        option: {
                            camID: item.container_camera_id,
                            tabId: findID,
                            container_index: item.container_index
                        },
                        id: index,
                        z: container_type === 1 ? 1 : container_type === 2 ? 1 : container_type === 3 ? 1 : container_type === 4 ? 3 : 2,
                        type: container_type === 1 ? 'main' : container_type === 2 ? 'vis' : container_type === 3 ? 'map' : container_type === 4 ? 'fullview' : 'null',
                        image_base64: container_type === 4 ? item.image_base64 : undefined
                    }
                )
            })
            // console.log('state.allItemMain', state.allItemMain);
            state.allItemMain.forEach((item) => {
                let findeindex = TempchildrenROI.findIndex((e) => { return e.option.camID === item.option.camID && e.type === 'main' })
                if (findeindex === -1) {
                    TempchildrenROI.push(item)
                }
            })
            state.childrenROI = TempchildrenROI
        }, 1)
        // setTimeout(() => {
        //     let mock2 = [[
        //         { x: 0, y: 0, w: 12, h: 2, option: {}, id: 1, z: 3, type: 'fullview' },
        //         { x: 0, y: 4, w: 12, h: 2, option: {}, id: 3, z: 3, type: 'fullview' },
        //         { x: 1, y: 1, w: 1, h: 1, option: { camID: 1 }, id: 4, z: 1, type: 'main' },
        //         { x: 1, y: 1, w: 3, h: 3, option: { camID: 2 }, id: 5, z: 1, type: 'main' },
        //         { x: 1, y: 1, w: 3, h: 2, option: { camID: 3 }, id: 6, z: 1, type: 'main' },
        //         { x: 1, y: 1, w: 6, h: 3, option: { camID: 4 }, id: 7, z: 1, type: 'main' },
        //     ], [
        //         { x: 0, y: 0, w: 12, h: 2, option: {}, id: 1, z: 3, type: 'fullview' },
        //         { x: 0, y: 2, w: 6, h: 2, option: {}, id: 2, z: 3, type: 'fullview' },
        //         { x: 6, y: 2, w: 6, h: 2, option: {}, id: 8, z: 3, type: 'fullview' },
        //         { x: 0, y: 4, w: 12, h: 2, option: {}, id: 3, z: 3, type: 'fullview' },
        //         { x: 1, y: 1, w: 1, h: 1, option: { camID: 1 }, id: 4, z: 1, type: 'main' },
        //         { x: 1, y: 1, w: 3, h: 3, option: { camID: 2 }, id: 5, z: 1, type: 'main' },
        //         { x: 1, y: 1, w: 3, h: 2, option: { camID: 3 }, id: 6, z: 1, type: 'main' },
        //         { x: 1, y: 1, w: 6, h: 3, option: { camID: 4 }, id: 7, z: 1, type: 'main' },
        //     ]]
        //     state.childrenROI = mock2[e === 8 ? 0 : 1]
        // }, 1)
    }
    // setTimeout(() => {
    //     state.childrenROI.push(
    //         { x: 0, y: 0, w: 12, h: 6, option: {}, id: 0, z: 1, type: 'bg' }
    //     )
    // }, 10)
    // if (containerData.tab_type === 2) {
    //     let cols = containerData.container_splitScreen.total_column // 豎
    //     let rows = containerData.container_splitScreen.total_row // 橫

    //     // 找到指定的 div (替換 '#yourDivId' 為你的 div 的 ID 或其他選擇器)
    //     let divlist = ['.realTimeCover', '.realTimeCover-temp']
    //     divlist.forEach((item) => {
    //         let div = document.querySelector(item);
    //         // 動態生成 CSS
    //         div.style.display = 'grid';
    //         div.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    //         div.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    //     })
    //     let arr = containerData.container_list.sort((a, b) => a.container_index - b.container_index);
    //     rundisplay(arr)
    // }
    const focusCam = data.layout[findID].tab_type === 2 ? null : data.layout[findID].container_list[0].container_camera_id
    state.focusPage = focusCam
    setTimeout(() => {
        mapmain.value.forEach((item, index) => {
            item.cutoverCanvasMap(focusCam)
        })
    }, 500)
    emit('cctvToMapMain', e)

}
const toMapPage1 = (e) => {
    // console.log('toMapPage1', e);
    state.focusPage = e
    setTimeout(() => {
        mapmain.value.forEach((item, index) => {
            item.cutoverCanvasMap(e)
        })
    }, 500)
    emit('cctvToMapMainCamid', e)
    rundisplay([])
}
const handleDataFromChild = () => {
    // console.log('handleDataFromChild');
}
const saveMapImg = (el) => {
    state.mapimg = el.PTZ_map_img_base64
    // console.log('saveMapImg', el);
}
const clickContainer = (e, item, index, sw) => {
    if (!sw) {
        state.tempHoverindex = index
        let copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
        let location = e.target.getBoundingClientRect() // 讀取被觸發的物件
        copyDiv.style.top = location.y + 'px'
        copyDiv.style.left = location.x + 'px'
        copyDiv.style.width = location.width + 'px'
        copyDiv.style.height = location.height + 'px'
        let cloneDiv = e.currentTarget.cloneNode(true)
        copyDiv.appendChild(cloneDiv)
        state.mousedownLocations.x = e.x
        state.mousedownLocations.y = e.y
        state.tempPathItemDivLocaltion.y = location.y
        state.tempPathItemDivLocaltion.x = location.x
        state.tempHoverDiv = e.currentTarget
    }
}
const onMousedown = (e) => { }
const onMousemove = (e) => {
    if (state.tempHoverDiv !== null) {
        let copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
        let location = {
            x: 0,
            y: 0
        }
        location.y = state.mousedownLocations.y - e.y
        location.x = state.mousedownLocations.x - e.x
        copyDiv.style.top = state.tempPathItemDivLocaltion.y - location.y + 'px'
        copyDiv.style.left = state.tempPathItemDivLocaltion.x - location.x + 'px'
    }
}
const onMouseup = (e) => {
    // if (state.tempHoverDiv !== null) {
    // state.tempHoverDiv = null
    var copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
    copyDiv.innerHTML = '' // 清空克隆物件內容
    // 調換位置
    // 選擇父容器和子元素
    // }
}
const upContainer = (e, item, index, sw) => {
    if (state.tempHoverDiv !== null && state.tempHoverindex !== index) {
        const parent = realTimeCanvasTemp.value;
        const divA = state.tempHoverDiv
        const divC = e.currentTarget
        let aID = divA.getAttribute("data-id");
        let cID = divC.getAttribute("data-id");
        var output = {
            "feature": "layout",
            "method": "set_orderContainer",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "tab_id": state.tempTabId,
                "changed_index": [parseInt(aID), parseInt(cID)]
            }
        }
        state.ws3.send(JSON.stringify(output))
        let data = props.layoutData
        let findID = data.layout.findIndex((item) => item.tab_id === state.tempTabId)
        let findaID = data.layout[findID].container_list.findIndex((item) => divA.getAttribute("data-json") === JSON.stringify(item))
        let findcID = data.layout[findID].container_list.findIndex((item) => divC.getAttribute("data-json") === JSON.stringify(item))
        data.layout[findID].container_list[findaID].container_index = parseInt(cID)
        data.layout[findID].container_list[findcID].container_index = parseInt(aID)
        divA.setAttribute('data-json', JSON.stringify(data.layout[findID].container_list[findaID]));
        divC.setAttribute('data-json', JSON.stringify(data.layout[findID].container_list[findcID]));
        // console.log(findaID, containerData, divA.getAttribute("data-json"), findcID, divC.getAttribute("data-json"));
        // // 對調位置
        if (parent && divA && divC) {
            // 建立兩個占位符
            const placeholderB = document.createElement('div');
            const placeholderD = document.createElement('div');

            // 用占位符替換原位置的元素
            parent.replaceChild(placeholderB, divA);
            parent.replaceChild(placeholderD, divC);

            // 將元素插回到對方的位置
            parent.replaceChild(divA, placeholderD);
            parent.replaceChild(divC, placeholderB);
        }
        state.tempHoverDiv = null
    }
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
            const messageEvent = (event) => {
                var data = JSON.parse(event.data)
                state.wsRoiData1 = data
                data = null
                // console.log(data);
            }
            state.ws5.addEventListener("message", messageEvent)
            // state.wsListener3.message = messageEvent
        } else if ($webSocketconnect05().readyState !== 1) {
            setTimeout(() => {
                openwebsocket05()
            }, 1000)
        }
    }
    openwebsocket05()
}

const rundisplay = (arr = state.tempcurrentcctv.container_list) => {
    // 先把 realTimeCover-temp 的東西塞回 realTimeCover
    moveChildren(realTimeCanvasTemp.value, realTimeCanvas.value);
    // 用arr(目前的overall) 去判斷 realTimeCover裡面的 data-josn，符合移動到realTimeCover-temp 中
    arr.forEach((item) => {
        let rel = Array.from(realTimeCanvas.value.children);
        let findDiv = rel.findIndex((e1) => {
            // let findDiv = realTimeCover.value.findIndex((e1) => {
            // console.log(e1.getAttribute("data-json"), JSON.stringify(item));
            return e1.getAttribute("data-json") === JSON.stringify(item)
        })
        if (findDiv !== -1) {
            realTimeCanvasTemp.value.appendChild(realTimeCanvas.value.children[findDiv]); // 將子元素移動到目標 div
        }
    })
    function moveChildren(sourceId, targetId) {
        const source = sourceId; // 取得來源 div
        const target = targetId; // 取得目標 div

        // 持續移動子元素直到 source 沒有任何子元素
        while (source.firstChild) {
            const child = source.firstChild; // 取得第一個子元素
            target.appendChild(child); // 將子元素移動到目標 div
        }
    }
    setTimeout(() => {
        mapImport1.value.forEach((item) => {
            item.invaliMapSzie()
        })
        mapImport2.value.forEach((item) => {
            // item.resize()
            item.invaliMapSzie()
        })
        mapImport3.value.forEach((item) => {
            item.invaliMapSzie()
        })
    }, 100)
}
let children = [
    // { x: 0, y: 6, w: 12, h: 2, content: '123123', id: 0 },
    // { x: 3, y: 0, w: 3, h: 2, content: '123123', id: 0 }
];
onMounted(() => {
    initWs3()
    if (false) {
        let data = props.layoutData
        let findID = data.layout.findIndex((item) => item.tab_id === tabId)
        const containerData = data.layout[findID]
        let cols = containerData.container_splitScreen.total_column // 豎
        let rows = containerData.container_splitScreen.total_row // 橫
        // 找到指定的 div (替換 '#yourDivId' 為你的 div 的 ID 或其他選擇器)
        let divlist = ['.realTimeCover', '.realTimeCover-temp']
        divlist.forEach((item) => {
            let div = document.querySelector(item);
            // 動態生成 CSS
            div.style.display = 'grid';
            div.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            div.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        })
        // CCTV排序
        // state.tempscreensplitList
        let screensplitList = []
        data.layout.forEach((item, index) => {
            if (item.tab_type === 2) {
                if (state.tempcurrentcctv.length === 0) {
                    state.tempcurrentcctv = item
                }
                let arr = item.container_list.sort((a, b) => a.container_index - b.container_index);
                arr.forEach((item2, index2) => {
                    screensplitList.push({ ...item2 })
                })
            }
        })
        state.cctvolnyROI = filterUniqueContainerType(screensplitList)
        // screensplitList = removeDuplicates(screensplitList)
        // state.tempscreensplitList = screensplitList
        // console.log(screensplitList);
        state.cctvDisplayList = screensplitList
        realTimeCovertatle.value = screensplitList.length
        state.tempTabId = tabId
        // console.log('data.container_list', generateTemporaryArray(screensplitList, containerData.container_list));
    }
    initWs5()
    function removeDuplicates(array) {
        const uniqueItems = new Set(); // 用來存放唯一的物件字串

        return array.filter(item => {
            // 排除 container_index 的 key
            const { container_index, ...rest } = item;
            const itemString = JSON.stringify(rest); // 將剩餘屬性轉為字串
            if (uniqueItems.has(itemString)) {
                return false; // 如果已存在，過濾掉
            } else {
                uniqueItems.add(itemString); // 不存在則加入集合
                return true; // 保留該物件
            }
        });
    }
    function filterUniqueContainerType(data) {
        const tempArr = [];
        const uniqueCameraIds = new Set();

        data.forEach(item => {
            if (item.container_type === 1 && !uniqueCameraIds.has(item.container_camera_id)) {
                uniqueCameraIds.add(item.container_camera_id); // 記錄已處理的 camera_id
                tempArr.push(item); // 加入暫存陣列
            }
        });

        return tempArr;
    }
    // function removeDuplicates(array) {
    //     const uniqueItems = new Set(); // 用來存放唯一的物件字串
    //     return array.filter(item => {
    //         const itemString = JSON.stringify(item); // 將物件轉為字串
    //         if (uniqueItems.has(itemString)) {
    //             return false; // 如果已存在，過濾掉
    //         } else {
    //             uniqueItems.add(itemString); // 不存在則加入集合
    //             return true; // 保留該物件
    //         }
    //     });
    // }

    // var index = 1
    // for (var i = 1; i < 5; i++) {
    //     runRTC(`realTimeCover-video${index}`, `http://localhost:3001/video/realtime/vis${i}`, 'vis')
    //     index++
    //     runRTC(`realTimeCover-video${index}`, `http://localhost:3001/video/realtime/ir${i}`, 'vis')
    //     index++
    // }
    // gridstack 執行
    if (true) {
        // grid 1
        container = document.querySelector(".transform-canvas");
        content = document.querySelector(".transform-container");
        GridStack.renderCB = function (el, w) {
            el.innerHTML = w.content;
        };
        grid = GridStack.init({
            column: 2,
            float: true,
            margin: 1, // 單位：px，所有方向的間距
            animate:false,
            // cellHeight: 70,
            // acceptWidgets: true,
            // removable: '#trash', // drag-out delete class
            children,
            row: 100
        });
        // grids.forEach(function (grid, i) {
        // addEvents(grid, i);
        grid.enableMove(false)
        grid.enableResize(false)
        // });
        let data = props.layoutData
        let findID = data.layout.findIndex((item) => item.tab_id === tabId)
        const containerData = data.layout[findID]
        let cols = containerData.container_splitScreen.total_column // 豎
        let rows = containerData.container_splitScreen.total_row // 橫
        state.cols = cols
        state.rows = rows
        grid.column(cols);
        grid.cellHeight(container.getBoundingClientRect().height / rows);
        // setInterval(() => {
        //     grid.column(Math.floor(Math.random() * 50));
        // }, 2000)
        props.layoutData.layout.forEach((item) => {
            if (item.tab_type === 1) {
                const container_type = item.container_list[0].container_type
                state.allItemMain.push({
                    x: 50,
                    y: 50,
                    w: 1,
                    h: 1,
                    option: container_type === 4 ? {} : {
                        camID: item.container_list[0].container_camera_id,
                        tabId: findID,
                        container_index: item.container_list[0].container_index
                    },
                    id: "camID" + item.container_list[0].container_camera_id,
                    z: container_type === 1 ? 1 : container_type === 2 ? 1 : container_type === 3 ? 1 : container_type === 4 ? 3 : 2,
                    type: container_type === 1 ? 'main' : container_type === 2 ? 'vis' : container_type === 3 ? 'map' : container_type === 4 ? 'fullview' : 'null'
                })
            }
        })
        state.childrenROI = []
        let TempchildrenROI = []
        containerData.container_list.forEach((item, index) => {
            const container_type = item.container_type
            TempchildrenROI.push(
                {
                    x: item.container_location.column_start,
                    y: item.container_location.row_start,
                    w: item.container_location.column_width,
                    h: item.container_location.column_height,
                    option: {
                        camID: item.container_camera_id
                    },
                    id: index,
                    z: container_type === 1 ? 1 : container_type === 2 ? 1 : container_type === 3 ? 1 : container_type === 4 ? 3 : 2,
                    type: container_type === 1 ? 'main' : container_type === 2 ? 'vis' : container_type === 3 ? 'map' : container_type === 4 ? 'fullview' : 'null',
                    image_base64: container_type === 4 ? item.image_base64 : undefined
                }
            )
        })
        // 這邊判斷
        state.allItemMain.forEach((item) => {
            let findeindex = TempchildrenROI.findIndex((e) => { return e.option.camID === item.option.camID && e.type === 'main' })
            if (findeindex === -1) {
                TempchildrenROI.push(item)
            }
        })

        // console.log(TempchildrenROI);
        // 這邊判斷
        state.childrenROI = TempchildrenROI
        // setTimeout(() => {
        //     state.childrenROI.push(
        //         { x: 0, y: 0, w: 12, h: 6, option: {}, id: 0, z: 1, type: 'bg' }
        //     )
        // }, 10)




        // grid 2
        // container2 = document.querySelector(".transform-canvas2");
        // content2 = document.querySelector(".transform-container2");
        // GridStack.renderCB = function (el, w) {
        //     el.innerHTML = w.content;
        // };
        // grid2 = GridStack.init({
        //     column: 12,
        //     float: true,
        //     // cellHeight: 70,
        //     // acceptWidgets: true,
        //     removable: '#trash', // drag-out delete class
        //     children,
        //     row: 6
        // });
        // grid2.cellHeight(container2.getBoundingClientRect().height / 6);
        // grid2.enableMove(false)
        // grid2.enableResize(false)
    }
    // GridStack.setupDragIn('.sidepanel>.grid-stack-item', undefined, insert);
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
defineExpose({
    toMapPage,
    toMapPage1
})
</script>
<style scope>
.mock-div1 {
    background: #DDDDDD;
    width: 100%;
    height: 100%;
}

.realTimeCover1 {
    /* width: 100%;
    height: 100%; */
    /* position: absolute;
    z-index: -999; */
}

.realTimeCover,
.realTimeCover-temp {
    width: 100%;
    height: 100%;
    /* display: flex; */
    /* flex-wrap: wrap; */
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
}

.realTimeCover>div,
.realTimeCover-temp>div {
    padding: .25em;
}

.realTimeCover-item {
    width: 100%;
    height: 100%;
    /* padding: .25em; */
    /* transition: all 1s; */
    /* border: 1px solid #000; */
}

.goToMore-canvas {
    position: relative;
}

.goToMore-canvas-u {
    position: absolute;
    top: 0;
    left: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.goToMore-canvas-hover {
    background-color: #000;
    opacity: 0;
    transition: opacity .3s;
}

.goToMore-canvas-hover:hover {
    opacity: .4;
}

.pointer-none-map * {
    pointer-events: none !important;
}



#temp-copy-object {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    pointer-events: none;
    opacity: .8;
}
</style>
<style>
.main-dis-c {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 9;
    cursor: pointer;
    transition: background .3s;
}

.main-dis-c:hover {
    background: #00000013;
}


.cctv-mode-display {
    /* pointer-events: none !important; */
    /* visibility: hidden; */
}

.cctv-mode-edit {
    pointer-events: none !important;
    visibility: hidden;
    /* position: absolute; */
    /* width: 100%; */
    /* height: 100%; */
    /* top: 0; */
    /* left: 0; */
    /* z-index: 999; */
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
    background: #ffffff;
}

.grid-stack.grid-stack-static {
    background: #ffffff;
}

.sidebar>.grid-stack-item,
.grid-stack-item-content {
    text-align: center;
    background-color: #ffffff;
    position: relative;
}

.grid-stack-item-content-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99999;
    transition: background .3s;
    cursor: pointer;
}

.grid-stack-item-content-canvas:hover {
    background: #00000013;
}

.grid-stack-item-content-canvas-hole {
    transition: background .3s;
}

.grid-stack-item-content-canvas-hole:hover {
    background: #0077ff28;
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
    /* background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
    background-size: 8.33%; */
    /* 控制網格大小 */
}
</style>
<style lang="scss">
@for $columns from 1 through 50 {
    .gs-#{$columns}>.grid-stack-item {
        width: calc(100% / #{$columns});

        @for $i from 1 through $columns - 1 {
            &[gs-x='#{$i}'] {
                left: calc(100% / #{$columns} * #{$i});
            }

            &[gs-w='#{$i+1}'] {
                width: calc(100% / #{$columns} * #{$i + 1});
            }
        }
    }
}
</style>