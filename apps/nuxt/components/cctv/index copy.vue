<!-- 這邊是備份 -->
<template>
    <div class="w-100 h-100">
        <template v-for="(item, i) in state.cctvolnyROI" :key="i">
            <div
                :class="state.focusPage === item.container_camera_id && item.container_type === 1 ? 'cctv-mode-edit' : 'cctv-mode-display'">
                <ClientOnly>
                    <MapMain :ref="el => refsHandler(el, item.container_camera_id)" :camID="item.container_camera_id"
                        :camType="'ir'" />
                </ClientOnly>
            </div>
        </template>
        <div class="realTimeCover-temp" ref="realTimeCanvasTemp" @mousedown="onMousedown" @mouseup="onMouseup"
            @mousemove="onMousemove"></div>
        <div class="realTimeCover" ref="realTimeCanvas">
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
        </div>
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
    olnytag: true
})
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
    if (containerData.tab_type === 2) {
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
        let arr = containerData.container_list.sort((a, b) => a.container_index - b.container_index);
        rundisplay(arr)
    }
    const focusCam = data.layout[findID].tab_type === 2 ? null : data.layout[findID].container_list[0].container_camera_id
    state.focusPage = focusCam
    mapmain.value.forEach((item, index) => {
        item.cutoverCanvasMap(focusCam)
    })
    emit('cctvToMapMain', e)

}
const toMapPage1 = (e) => {
    console.log('data.s', e);
    state.focusPage = e
    mapmain.value.forEach((item, index) => {
        item.cutoverCanvasMap(e)
    })
    emit('cctvToMapMainCamid', e)
    rundisplay([])
}
const handleDataFromChild = () => {
    console.log('handleDataFromChild');
}
const saveMapImg = (el) => {
    state.mapimg = el.PTZ_map_img_base64
    console.log('saveMapImg', el);
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
        console.log(data.layout[findID].container_list);
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
    }, 50)
}
onMounted(() => {
    initWs3()
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
.cctv-mode-display * {
    pointer-events: none !important;
    visibility: hidden;
}

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

.cctv-mode-edit {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 999;
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