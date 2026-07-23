<template>
    <!-- test git checkout -b mailiao -->
    <div class="windows" @mousemove="mousemove" @mouseup="mouseup">
        <template v-if="state.loading">
            <div style="width: 100vw;height: 100vh;">
                <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);text-align: center;">
                    <v-progress-circular model-value="20" :size="128" :width="12" indeterminate></v-progress-circular>
                    <div class="pt-4">初始化</div>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="item-card-content-window" :class="state.pageItems.length > 0 ? '' : 'bg-f1f1f1ba'"
                style="overflow: hidden;font-size: 12px;">
                <div class="d-flex def-point-btn" @click="state.menu = !state.menu">
                    <div class="def-point-grid pa-1" style="pointer-events: none;">
                        <button>
                            <img src="/images/icon/menufs-meun.svg" width="30" />
                        </button>
                    </div>
                </div>
                <div class="d-flex def-point-btn">
                    <NuxtLink to="setting">
                        <div class="def-point-grid pa-1" style="pointer-events: none;">
                            <button>
                                <img src="/images/icon/icon_pop upsetup.svg" width="30" />
                            </button>
                        </div>
                    </NuxtLink>
                </div>
                <template v-if="state.pageItems.length > 0">
                    <div class="d-flex def-point-item" v-for="(item, index) in state.pageItems" :key="index"
                        @mousedown="(e) => mousedown(e, item.name, item.id)" @mouseover="mouseover"
                        @mouseleave="mouseleave" :data-index="index" data-type="pathItem"
                        :class="item.name === state.page ? 'active-tag' : ''">
                        <div class="def-point-grid pa-1" style="pointer-events: none;">
                            <img class="ml-3" src="/images/icon/icon_pop upcomput-c.svg" width="15" />
                            <div class="def-point-conent">
                                <div class="def-point-name">{{ item.name }}</div>
                            </div>
                            <!-- <button v-if="item.name !== '全局監測'" class="pt-1" @click="deleteTab(item.id)"
                                style="pointer-events: auto !important;">
                                <img src="/images/icon/icon_pop upclosoe.svg" width="16"></img>
                            </button> -->
                        </div>
                    </div>
                </template>
                <!-- <div class="d-flex ml-1 mt-1 def-point-btn" @click="state.dialog = true">
                <div class="def-point-grid pa-1" style="pointer-events: auto;">
                    <div>
                        <img src="/images/icon/icon_pop upaddpage.svg" width="27"></img>
                    </div>
                </div>
            </div> -->
                <!-- side D 視窗-->
                <v-spacer></v-spacer>
                <div style="width: 150px;">
                    <v-select v-model="state.viewMode" density="compact" hide-details details
                        :items="state.viewModeItems" @update:modelValue="updataSelectMode"></v-select>
                </div>
                <v-btn icon="mdi-account-circle" variant="text" style="margin-top: -5px"
                    id="menu-activator1sdlr"></v-btn>
                <v-menu activator="#menu-activator1sdlr">
                    <v-list>
                        <v-list-item>
                            <v-list-item-title>HI , {{ user.name }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="logout">
                            <v-list-item-title>登出</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <v-btn icon variant="text" color="black" @click="openSideD()" style="margin-top: -5px">
                    <v-badge :color="alertNumber !== 0 ? 'error' : 'transparent'" style="color:transparent"
                        :content="alertNumber">
                        <v-icon color="black">mdi-bell</v-icon>
                    </v-badge>
                </v-btn>


                <v-navigation-drawer v-model="drawer2" location="right" temporary width="330">
                    <client-only>
                        <!-- 這邊暫時關掉 -->
                        <SideWindowsSideD @update="cctvToMapMainCamidSidD" @update2="autoUpdate"></SideWindowsSideD>
                    </client-only>
                </v-navigation-drawer>
                <!-- side D 視窗 -->
                <!-- {{ user }} -->
                <!-- <h2 v-if="loggedIn">
                <v-btn @click="logout">登出</v-btn>
            </h2> -->
            </div>
            <div id="temp-copy-object"></div>
            <div class="t-content-grid" style="height: calc(100% - 36px)"
                :style="state.menu ? 'grid-template-columns: 18.5% 81.5%;' : 'grid-template-columns: 0% 100%;'">
                <div class="t-meun" :style="state.menu ? 'opacity: 1;' : 'opacity: 0;'">
                    <!-- side A 視窗-->
                    <ClientOnly>
                        <!-- 這邊暫時關掉 -->
                        <SideWindowsSideAB></SideWindowsSideAB>
                    </ClientOnly>
                    <!-- side A 視窗-->
                </div>
                <div style="height: 100%;width:100%;font-size: 12px;position: relative;overflow: hidden;"
                    class="scrollable-container">
                    <div style="width:100%;height:100%">
                        <!-- <MapDefault ref="mapImport1" :formtData="state" :mainMode="state.mainMode"
                                        @dataFromChild="handleDataFromChild" /> -->
                        <ClientOnly>
                            <Cctv @cctvToMapMain="cctvToMapMain" @cctvToMapMainCamid="cctvToMapMainCamid"
                                ref="cctvRefe2" :formtData="state" :tabId="state.focusTabId"
                                v-if="state.focusTabId !== null" />
                        </ClientOnly>
                    </div>
                    <!-- <div v-for="(item, index) in state.pageItems" style="width: 100%;height: 100%"
                        :class="`a-tab-a${index}`"> -->
                    <!-- position: absolute;top: 0;left: 0;transition: 0.1s !important; -->
                    <!-- :class="state.page === item.name ? 'tab-auto' : 'tab-hidde'" -->
                    <!-- <template v-if="item.to === 'map'"> -->
                    <!-- <template v-if="state.page === 'map'">  如果要暫存請使用item 反之請使用state -->
                    <!-- <div style="width:100%;height:100%"> -->
                    <!-- <MapDefault ref="mapImport1" :formtData="state" :mainMode="state.mainMode"
                                        @dataFromChild="handleDataFromChild" /> -->
                    <!-- <MapMain :camID="item.camID" :camType="state.selectMainPage.type" @toTab="cctvToMapMain"
                                :ref="(e) => addMainref(e, index)" /> -->
                    <!-- </div>
                    </template> -->
                    <!-- <template v-if="item.to === 'home'"> -->
                    <!-- <template v-else-if="item.to === 'home'"> -->

                    <!-- </template> -->
                    <!-- </div> -->
                </div>
            </div>
            <v-dialog v-model="state.dialog" max-width="400" persistent>
                <!-- <template v-slot:activator="{ props: activatorProps }">
                <v-btn v-bind="activatorProps">
                    Open Dialog
                </v-btn>
            </template> -->

                <v-card prepend-icon="mdi-open-in-new" title="你要新增嗎?">
                    <v-card-text class="bg-surface-light pt-4">
                        <v-text-field label="視窗名稱" v-model="state.windowName"></v-text-field>
                        <v-select label="Select" v-model="state.addWindow" :items="state.addWindowItems"></v-select>
                    </v-card-text>
                    <template v-slot:actions>
                        <v-spacer></v-spacer>

                        <v-btn @click="state.dialog = false, state.windowName = ''">
                            取消
                        </v-btn>

                        <v-btn @click="pagePush()">
                            新增
                        </v-btn>
                    </template>
                </v-card>
            </v-dialog>
        </template>
        <v-dialog v-model="state.dialogpwd" width="400">
            <v-card>
                <v-card-title class="text-h6">工程模式</v-card-title>

                <v-card-text>
                    <v-text-field v-model="state.password" label="密碼" type="password" @keydown.enter="checkPassword"
                        autofocus />
                </v-card-text>

                <v-card-actions>
                    <v-spacer />
                    <v-btn color="primary" @click="checkPassword">解鎖</v-btn>
                    <v-btn @click="state.dialogpwd = false, state.password = null, state.viewMode = 0">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script setup>
import { reloadNuxtApp } from '#app'

const { $jwtAuth } = useNuxtApp()
const { $webSocketconnect03 } = useNuxtApp()
const { user, loggedIn } = useJwtAuth()
const cctvRefe2 = ref('')
definePageMeta({
    middleware: ['auth']
})

async function logout() {
    try {
        await $jwtAuth.logout()
    } catch (e) {
        // your error handling
    }
}


const handleReload = () => {
    reloadNuxtApp()
}

//Side D 視窗
const drawer2 = ref(false)
function openSideD() {
    drawer2.value = !drawer2.value;
}
const alertNumber = ref(0);
const parentData = ref('');
const mainRef = ref([]);
const handleUpdate = (data) => {
    parentData.value = data;
};

const autoUpdate = (data2) => {
    alertNumber.value = data2
};
//Side D 視窗
const state = reactive({
    dialogpwd: false,
    mainMode: 0, // 0 = 監測模式 1 = 工程模式
    viewMode: 0,
    viewModeItems: [
        { title: '監測模式', value: 0 },
        { title: '工程模式', value: 1 }
    ],
    loading: true,
    ws3: {
        readyState: 0
    },
    wsListener3: {
        close: null,
        message: null
    },
    items: [
        {
            id: 1,
            title: 'Server 01',
            children: [
                { id: 2, title: '戶外監測' },
            ],
        }
    ],
    panel: [0, 1],
    menuName: '',
    dialog: false,
    mainMode: 'roi', // review = 監控模式 ,roi = ROI模式,mask = MASK模式,mask-temp-select = 溫度區域選取模式
    mainModeItems: ['review', 'roi', 'mask', 'mask-temp-select'],
    addWindowItems: ['map'],
    addWindow: 'map',
    windowName: '',
    wsRoiData: null,
    menu: false,
    pageItems: [],
    // page: '單機監測/IEM4 諧波器室(4F)', // 全局監測 / 單機監測/室內1
    page: '全局監測', // 全局監測 / 單機監測/室內1
    defaultPorintList: [],
    tempHoverDiv: null,
    // 紀錄滑鼠位置
    mousedownLocations: { // 暫存滑鼠點擊第一位置
        x: 0,
        y: 0
    },
    tempPathItemDiv: null,
    tempPathItemDivLocaltion: {
        x: 0,
        y: 0
    },
    tempMoveFocusDiv: {
        div: null,
        up: null,
        down: null
    },
    saveIndex: {
        old: 0,
        new: 0
    },
    layoutData: null,
    focusTabId: null,
    password: null,
    // correctPassword: ''
    correctPassword: 'sa80700271'
})
const checkPassword = () => {
    if (state.password === state.correctPassword) {
        state.dialogpwd = false
        state.password = null
        next(1)
    } else {
        // state.dialogpwd = false
        // state.password = null
        alert('密碼錯誤')
    }
}
const next = (e) => {
    // alert('登入成功，進入下一步')
    // 可加上更多邏輯
    state.mainMode = e
}
const updataSelectMode = (e) => {
    if (e === 1) {
        state.dialogpwd = true
    }else {
        state.mainMode = e
    }
}
const deleteTab = (id) => {
    // console.log('deleteTab', id);
    state.pageItems = state.pageItems.filter((item) => item.id !== id)
}

const cctvToMapMain = (e) => {
    let index = state.pageItems.findIndex((item) => item.id === e)
    state.page = state.pageItems[index].name
}
const cctvToMapMainCamid = (e) => {
    console.log('cctvToMapMainCamid', e);
    let index = state.pageItems.findIndex((item) => item.camID === e)
    state.page = state.pageItems[index].name
}
const cctvToMapMainCamidSidD = (e) => {
    console.log('cctvToMapMainCamid', e);
    let index = state.pageItems.findIndex((item) => item.camID === e)
    state.page = state.pageItems[index].name
    cctvRefe2.value.toMapPage1(e)
}
const pagePush = () => {
    state.pageItems.push(
        {
            name: state.windowName,
            to: state.addWindow,
            id: Math.random().toString(36).substr(2),
            stoptime: 10,
            alarm: false,
        }
    )
    state.dialog = false
    state.windowName = ''
}
const mouseover = (e) => {

}
const mousemove = (e) => {
    current(e)
}
const handleDataFromChild = (data) => {
    console.log('Received data from child:', data)
}
const current = (e) => {
    var type = e.target.getAttribute('data-type') // .parentNode
    if (type === 'pathItem' && state.tempPathItemDiv !== null) {
        var index = e.target.getAttribute('data-index')
        state.saveIndex.new = parseInt(index)
        var location = e.target.getBoundingClientRect() // 讀取被觸發的物件
        if (state.tempMoveFocusDiv.div !== e.target) {
            state.tempMoveFocusDiv.div = e.target
            if (state.tempMoveFocusDiv.down !== null) {
                state.tempMoveFocusDiv.down.remove();
                state.tempMoveFocusDiv.down = null
            }
            if (state.tempMoveFocusDiv.up !== null) {
                state.tempMoveFocusDiv.up.remove();
                state.tempMoveFocusDiv.up = null
            }
        }
        if (e.offsetX < (location.width / 2)) {
            if (state.tempMoveFocusDiv.up === null) {
                var newdiv = document.createElement('div')
                newdiv.classList.add('path-add-message-window');
                newdiv.innerHTML = '<div></div>'
                state.tempMoveFocusDiv.up = newdiv
                e.target.parentNode.insertBefore(newdiv, e.target);
                if (state.tempMoveFocusDiv.down !== null) {
                    state.tempMoveFocusDiv.down.remove();
                    state.tempMoveFocusDiv.down = null
                }
            }
        } else {
            if (state.tempMoveFocusDiv.down === null) {
                var newdiv = document.createElement('div')
                newdiv.classList.add('path-add-message-window');
                newdiv.innerHTML = '<div></div>'
                state.tempMoveFocusDiv.down = newdiv
                e.target.insertAdjacentElement('afterend', newdiv);
                if (state.tempMoveFocusDiv.up !== null) {
                    state.tempMoveFocusDiv.up.remove();
                    state.tempMoveFocusDiv.up = null
                }
            }
        }
    }
    if (state.tempPathItemDiv !== null) { // 判斷是否有抓取路徑table item
        var copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
        var location = {
            x: 0,
            y: 0
        }
        location.y = state.mousedownLocations.y - e.y
        location.x = state.mousedownLocations.x - e.x
        copyDiv.style.top = state.tempPathItemDivLocaltion.y - location.y + 'px'
        copyDiv.style.left = state.tempPathItemDivLocaltion.x - location.x + 'px'
    }
}
const mouseup = (e) => {
    if (state.tempPathItemDiv !== null) {
        var copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
        copyDiv.innerHTML = '' // 清空克隆物件內容
        var arr = state.pageItems
        const valueToMove = arr.splice(state.saveIndex.old, 1)[0];
        arr.splice(state.saveIndex.new, 0, valueToMove);
        state.pageItems = arr
    }
    state.tempPathItemDiv = null
}
const mousedown = (e, to, index) => {
    // const container = document.querySelector('.scrollable-container');
    // container.scrollTop = 500;  // 直接滾動到容器內部的 500 像素位置
    // scrollToElement(`a-tab-a${index}`)
    state.page = to
    cctvRefe2.value.toMapPage(index)
    // cctvRefe2.value.toMapPage(index)
    // if (state.page !== to) {
    //     state.page = 'loading'
    //     setTimeout(() => {
    // console.log(e, to, index);
    mainRef.value.forEach((item) => {
        item.offdig()
    })
    //     }, 500)
    // }
    var type = e.target.getAttribute('data-type') // .parentNode
    if (type === 'pathItem') {
        var index = e.target.getAttribute('data-index')
        state.saveIndex.old = parseInt(index)
        var copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
        var location = e.target.getBoundingClientRect() // 讀取被觸發的物件
        copyDiv.style.top = location.y + 'px'
        copyDiv.style.left = location.x + 'px'
        var cloneDiv = e.target.cloneNode(true)
        copyDiv.appendChild(cloneDiv)
        state.mousedownLocations.x = e.x
        state.mousedownLocations.y = e.y
        state.tempPathItemDivLocaltion.y = location.y
        state.tempPathItemDivLocaltion.x = location.x
        state.tempPathItemDiv = e.target
    }
    current(e)
}
// const mousedown = (e, to) => {
//     if (state.page !== to) {
//         state.page = 'loading'
//         setTimeout(() => {
//             state.page = to
//         }, 500)
//     }
//     var type = e.target.getAttribute('data-type') // .parentNode
//     if (type === 'pathItem') {
//         var index = e.target.getAttribute('data-index')
//         state.saveIndex.old = parseInt(index)
//         var copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
//         var location = e.target.getBoundingClientRect() // 讀取被觸發的物件
//         copyDiv.style.top = location.y + 'px'
//         copyDiv.style.left = location.x + 'px'
//         var cloneDiv = e.target.cloneNode(true)
//         copyDiv.appendChild(cloneDiv)
//         state.mousedownLocations.x = e.x
//         state.mousedownLocations.y = e.y
//         state.tempPathItemDivLocaltion.y = location.y
//         state.tempPathItemDivLocaltion.x = location.x
//         state.tempPathItemDiv = e.target
//     }
//     current(e)
// }
const mouseleave = (e) => {
    const elementsWithClass = state.tempHoverDiv;
    if (state.tempHoverDiv !== null) {
        elementsWithClass.style.opacity = 0
        elementsWithClass.style.pointerEvents = 'none'
        state.tempHoverDiv = null
    }
    if (state.tempMoveFocusDiv.div !== null) {
        state.tempMoveFocusDiv.div = null
        if (state.tempMoveFocusDiv.down !== null) {
            state.tempMoveFocusDiv.down.remove();
            state.tempMoveFocusDiv.down = null
        }
        if (state.tempMoveFocusDiv.up !== null) {
            state.tempMoveFocusDiv.up.remove();
            state.tempMoveFocusDiv.up = null
        }
    }
}
// 切換page 因對應名稱不同 暫寫死
// watch(parentData, (newValue, oldValue) => {
//     if (newValue == 1) {
//         console.log("sddfssdsd", newValue);
//         state.page = "單機監測/室外堆置區1"
//     } else if (newValue == 2) {
//         console.log("sddfssdsd", newValue);
//         state.page = "單機監測/室外堆置區2"
//     } else if (newValue == 3) {
//         console.log("sddfssdsd", newValue);
//         state.page = "單機監測/室外堆置區3"
//     } else if (newValue == 4) {
//         console.log("sddfssdsd", newValue);
//         state.page = "單機監測/室外堆置區4"
//     }
// });

// watch(state, (newValue, oldValue) => {
//     parentData.value = ""
//     console.log("sdskab", newValue.page, parentData.value);
// });
// 切換page
const initWs3 = () => {
    const openwebsocket03 = () => {
        if ($webSocketconnect03().readyState === 1) {
            const requestBackend = () => {
                let output = [{
                    "feature": "streaming",
                    "method": "query_webRTC_list",
                    "session": Math.random().toString(36).substr(2),
                    "content": {}
                }, {
                    "feature": "layout",
                    "method": "query_overallTabContainer",
                    "session": Math.random().toString(36).substr(2),
                    "content": {}
                }]
                output.forEach((item) => state.ws3.send(JSON.stringify(item)))

            }

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
            let layoutData = {
                layout: null,
                historyDataframe: null
            }
            const runLayout = () => {
                if (layoutData.layout !== null && layoutData.historyDataframe !== null) {
                    // console.log('tablist', layoutData);
                    state.loading = false;
                    state.layoutData = layoutData
                    let pageItemsOut = []
                    let tablist = layoutData.layout
                    let searchType = true
                    tablist.forEach((item, index) => {
                        if (item.tab_type === 2 && searchType) {
                            state.focusTabId = item.tab_id
                            searchType = false
                            // console.log('state.focusTabId = item.tab_id', state.focusTabId);
                        }
                        console.log(item);
                        pageItemsOut.push({
                            name: item.tab_name,
                            to: item.tab_type === 1 ? 'home' : 'map',
                            camID: item.tab_type === 1 ? item.container_list[0].container_camera_id : undefined,
                            id: item.tab_id,
                            stoptime: 10,
                            alarm: false,
                            top: 0
                        })
                    })
                    state.pageItems = pageItemsOut
                    // console.log("init", layoutData);
                }
            }
            const messageEvent = (event) => {
                let data = JSON.parse(event.data)
                let feature = data.feature
                let method = data.method
                if (feature === "layout" && method === "query_overallTabContainer") {
                    layoutData.layout = data.content
                    // console.log('query_overallTabContainer', data.content);
                    runLayout()
                } else if (feature === "streaming" && method === "query_webRTC_list") {
                    layoutData.historyDataframe = data.content
                    runLayout()
                }

            }
            state.ws3.addEventListener("message", messageEvent)
            requestBackend()
        } else if ($webSocketconnect03().readyState !== 1) {
            setTimeout(() => {
                openwebsocket03()
            }, 1000)
        }
    }
    openwebsocket03()
}
onMounted(() => {
    initWs3()
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
        // state.ws.close()
        state.ws3 = null
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
    height: 36px;
    border-bottom: 1px #B4B4B4 solid;
}

.def-point-grid {
    width: 100%;
    display: grid;
    grid-template-columns: 12% 77% 11%;
    cursor: pointer;
    /* background-color: #fff; */
    align-items: center;
}

.def-point-item {
    background-color: #E7EEEF;
    transition: .2s;
    border: 1px #B4B4B4 solid;
    cursor: pointer;
    width: 263px;
}

.def-point-btn {
    background-color: #fff;
    transition: .2s;
    /* border: 2px #EAEAEA solid; */
    cursor: pointer;
}

.active-tag {
    border-bottom: 0px;
    /* border: 0px #B4B4B4 solid; */
    background-color: #fff;
}

.def-point-item:hover,
.def-point-btn:hover {
    background-color: #fdfdfd;
}

.def-point-name {
    color: #2B2D2C;
    font-weight: 700;
}

.def-point-stoptime {
    font-size: 14px;
}

.def-point-conent {
    /* width: 100px; */
    overflow: hidden;
}

#temp-copy-object {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    pointer-events: none;
    opacity: .8;
}

.path-add-message-window {
    width: 4px;
    position: relative;
    /* height: 114px; */
    background-color: #8297ff;
}

.path-add-message-window>div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: #8297ff;
}

/* select style */
.windows .item-select .v-select.v-input--dense .v-select__selection--comma {
    margin: 0px !important;
}

.windows .item-select .v-text-field fieldset,
.windows .v-text-field .v-input__control {
    height: 35px !important;
}

.windows .item-select .v-text-field.v-text-field--enclosed:not(.v-text-field--rounded)>.v-input__control>.v-input__slot,
.v-text-field.v-text-field--enclosed .v-text-field__details {
    height: 35px !important;
}

.windows .item-select .v-select__slot {
    height: 32px !important;
}

.windows .item-select .v-input__append-inner {
    margin-top: 3px !important;
}

.windows .item-select .v-input__slot {
    padding: 0px 6px !important;
}

.windows .v-field__input {
    padding: 0px 0px 0px 9px !important;
    min-height: 38px !important;
}
</style>