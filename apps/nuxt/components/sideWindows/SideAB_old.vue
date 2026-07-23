<template>
    <div>
        <div class="fixed pt-1" style="background-color: #fff;">

            <div class="tab-header">
                <button @click="changeTab(1)" :class="{ active: activeTab === 1 }" class="tab-button d-flex">
                    <v-icon style="color:grey">mdi-transit-connection-variant</v-icon>
                    <div class="pl-2 font mt-1" style="color:grey">巡弋狀態</div>
                </button>
            </div>

            <div class="pt-2 px-2">
                <!-- v-model="keyword" @input="filter" @click:append-inner="onClick" -->
                <v-text-field dense class="pb-2" :loading="loading" append-inner-icon="mdi-magnify" density="compact"
                    label="搜尋" variant="outlined" append-icon="mdi-filter-outline" hide-details single-line>
                </v-text-field>
            </div>

        </div>

        <div v-for="(n2, index) in alarmData" :key="index" class="panel">
            <div @click="togglePanel(index)" class="panel-header">
                {{ n2.header }}
            </div>
            <div class="panel-content">
                <client-only>
                    <BaseTree class="mtl-tree" v-model="n2.content" table ref="tree">
                        <template #default="{ node, stat, indentStyle, tree }">
                            <td>
                                <div @click="pp(stat.data)" class="d-flex" :style="indentStyle">
                                    <v-icon v-if="stat.children.length && stat.open" size="20"
                                        @click.native="stat.open = !stat.open">
                                        mdi-menu-down
                                    </v-icon>
                                    <v-icon v-else-if="stat.children.length && !stat.open" size="20"
                                        @click.native="stat.open = !stat.open">
                                        mdi-menu-right
                                    </v-icon>
                                    <v-icon v-else size="20" color="transparent">
                                        mdi-menu-right
                                    </v-icon>
                                    <div v-for="(n, index) in getFirstStatus(node.overall_status)" :key="index"
                                        class="image-container">
                                        <div v-if="n === 'online'"
                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                            <v-icon size="12" color="#74E041">
                                                mdi-circle
                                            </v-icon>
                                        </div>
                                        <div v-if="n === 'offline'"
                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                            <v-icon size="12" color="red">
                                                mdi-circle
                                            </v-icon>
                                        </div>
                                        <div v-if="n === 'unknow'"
                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                            <v-icon size="12" color="red">
                                                mdi-circle
                                            </v-icon>
                                        </div>
                                        <div v-if="n === 'recording'"
                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                            <v-icon size="12" color="red">
                                                mdi-record-circle-outline
                                            </v-icon>
                                        </div>
                                        <div v-if="n === 'recordingIdle'"
                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                            <v-icon size="12" color="grey">
                                                mdi-record-circle-outline
                                            </v-icon>
                                        </div>
                                        <div v-if="n === 'cruisingIdle'"
                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                            <v-icon size="12" color="grey">
                                                mdi-video
                                            </v-icon>
                                        </div>
                                        <div v-if="n === 'cruisingNoAlarm'"
                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                            <v-icon size="12" color="red">
                                                mdi-video
                                            </v-icon>
                                        </div>
                                        <div v-if="n === 'cruisingAlarm'"
                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                            <v-icon size="12" color="red">
                                                mdi-alert
                                            </v-icon>
                                        </div>
                                        <!-- <div v-if="n === 'space'" style="background-color: red;width:20px;height:20px"> -->
                                        <div v-if="n === 'space'" style="width:20px;height:20px">

                                        </div>
                                        <img v-if="n !== 'space' && n !== 'online' && n !== 'offline' && n !== 'recording' && n !== 'recordingIdle' && n !== 'cruisingIdle' && n !== 'cruisingNoAlarm' && n !== 'cruisingAlarm'"
                                            :class="index === 1 ? 'ml-1' : ''" :src="n" />
                                    </div>
                                    <strong class="pl-1 treeTitle">{{ node.name }}</strong>
                                    <span v-if="node.sub_name !== ''" class="pl-1 treeSubtitle">{{ node.sub_name
                                        }}</span>
                                </div>
                            </td>
                            <td v-if="tab !== 0" align="right">
                                <div v-for="(n, index) in getLastStatus(node.overall_status)" :key="index">
                                    <div v-if="n === 'ptzCruising'" class="right-red-alert">巡弋中</div>
                                    <div v-else-if="n === 'ptzIdle'" class="right-grey-alert">閒置中</div>
                                    <div v-else-if="n === 'ptzSupport'" class="right-red-alert">支援偵測</div>
                                    <div v-else-if="n === 'ptzSetting'" class="right-blue-alert">設定中</div>
                                    <div v-else-if="n === 'aidiNoTriggered'" class="right-grey-alert">未觸發</div>
                                    <div v-else-if="n === 'aidiTriggered'" class="right-red-alert">已觸發</div>
                                    <div v-else-if="n === 'stopped'" class="right-red-alert">停用</div>
                                    <div v-else-if="n === 'unknown'" class="right-red-alert">未知</div>

                                    <!-- <div v-if="n === 'space'" style="background-color: red;width:20px;height:20px"> -->
                                    <div v-if="n === 'space'" style="width:20px;height:20px">
                                    </div>
                                </div>
                                <v-menu :close-on-content-click="false" location="end">
                                    <template v-slot:activator="{ props }">
                                        <v-icon size="15" v-if="stat.data.id === 100" v-bind="props">
                                            mdi-information-outline
                                        </v-icon>
                                    </template>
                                    <SideWindowsDetectorList></SideWindowsDetectorList>
                                </v-menu>
                            </td>
                        </template>
                    </BaseTree>
                </client-only>
            </div>
        </div>

        <!-- <v-expansion-panels v-model="panelA" multiple static="true" class="px-2">
            <v-expansion-panel v-for="n2 in alarmData" :key="n2.header" style="border: 1px solid #B4B4B4" static="true">
                <v-expansion-panel-title static="true" color="#F7F7F7">
                    <template v-slot:default>
                        <div class="font float-left">{{ n2.header }}</div>
                    </template>
<template v-slot:actions="{ expanded }">
                        <v-btn v-show="tab === 0 && n2.header === '佈局'" icon class="ma-1" variant="text" size="15"
                            @click.stop="addLayout()">
                            <v-icon size="15">mdi-plus</v-icon>
                        </v-btn>
                        <v-icon v-if="expanded">mdi-menu-up</v-icon>
                        <v-icon v-else>mdi-menu-down</v-icon>
                    </template>
</v-expansion-panel-title>
<v-expansion-panel-text style="padding: 0px;"> -->
        <!-- 123 -->
        <!-- 123 -->
        <!-- </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels> -->
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { BaseTree } from '@he-tree/vue';
import '@he-tree/vue/style/default.css';
import '@he-tree/vue/style/material-design.css';

const notice = ref(null);
const notice2 = ref(null);
const noticeDynamic = ref(null);
const activeTab = ref(1);
const transitionName = ref('slide-left');
const tab = ref(1);
const panelA = ref([0, 1, 2, 3]);
const panelB = ref([0, 1, 2, 3]);
const WS_URL = "ws://localhost:8705";
const alarmData = ref([]);
let ws = null;
const menu = ref(false);
const keyword = ref('');
const loading = ref(false);


const isOpen = ref(false);





const togglePanel = (index) => {
    alarmData.value[index] = !alarmData.value[index];
};



const changeTab = (index) => {
    transitionName.value = index > activeTab.value ? 'slide-left' : 'slide-right';
    activeTab.value = index;
};

const addLayout = () => {
    console.log("12345");
};

const getStatus = (place, library, index) => {
    if (place === 2 && library === 5) {
        return `/images/sideWindowsIcon/${index}.svg`;
    } else if (place === 2 && library === 2) {
        switch (index) {
            case 1:
                return 'online';
            case 2:
                return 'offline';
            case 3:
                return 'unknow';
        }
    } else if (place === 2 && library === 4) {
        return index === 0 ? 'recordingIdle' : 'recording';
    } else if (place === 2 && library === 3) {
        switch (index) {
            case 0:
                return 'cruisingIdle';
            case 1:
                return 'cruisingNoAlarm';
            case 2:
                return 'cruisingAlarm';
        }
    } else if (place === 1) {
        return 'space';
    }
};

const getFirstStatus = (e) => {
    let result = [];
    for (let i = 0; i < e.place[0].length; i++) {
        let status = getStatus(e.place[0][i], e.library[0][i], e.index[0][i]);
        if (status) result.push(status);
    }
    // console.log("aass", result);
    return result;
};

const getLastStatus = (e) => {
    let result = [];
    for (let i = 0; i < e.place[1].length; i++) {
        if (e.place[1][i] === 2 && e.library[1][i] === 6) {
            switch (e.index[1][i]) {
                case 1.1:
                    result.push('ptzCruising');
                    break;
                case 1.2:
                    result.push('ptzIdle');
                    break;
                case 1.3:
                    result.push('ptzSupport');
                    break;
                case 1.4:
                    result.push('ptzSetting');
                    break;
                case 2.1:
                    result.push('aidiNoTriggered');
                    break;
                case 2.2:
                    result.push('aidiTriggered');
                    break;
                case 2.3:
                    result.push('stopped');
                    break;
                case 2.4:
                    result.push('unknown');
                    break;
            }
        } else {
            let status = getStatus(e.place[1][i], e.library[1][i], e.index[1][i]);
            if (status) result.push(status);
        }
    }
    // console.log("aass", result);
    return result;
};

const setupWebSocket = () => {
    if (ws) ws.close();
    ws = new WebSocket(WS_URL);
    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (e) => {
        try {
            const data = JSON.parse(e.data);
            if (activeTab.value === 0) {
                alarmData.value = data.overall_systemStatus[0].content;
            } else if (activeTab.value === 1) {
                alarmData.value = data.overall_systemStatus[1].content;
            }
        } catch (error) {
            console.error("Error parsing WebSocket message:", error);
        }
    };
    ws.onclose = () => {
        console.log("WebSocket disconnected");
        setTimeout(setupWebSocket, 1000);
    };
};

const pp = (e) => {
    console.log("sdesxxx", e.id);
};

onMounted(setupWebSocket);

onUnmounted(() => {
    if (ws) {
        ws.close();
        ws = null;
    }
});
</script>

<style scoped>
.image-container {
    display: flex;
    justify-content: center;
    /* 水平置中 */
    align-items: center;
    /* 垂直置中 */
    height: 20px;
    /* 根據需要調整高度 */
    width: 20px;
    /* 根據需要調整寬度 */
}

.image-container img {
    max-width: 100%;
    /* 根據需要調整大小 */
    max-height: 100%;
    /* 根據需要調整大小 */
}









.bb {
    background-color: #fff
}

.font {
    font-weight: 700;
    /* color: #434343; */
}





.image {
    width: 20px;
    /* 你可以根據需要調整寬度 */
    height: 20px;
    /* 你可以根據需要調整高度 */
    object-fit: cover;
    /* cover 將保持圖片的縱橫比並裁剪多餘部分 */
}

.mtl-tree td,
.mtl-tree th {
    border-bottom: 0px solid rgba(224, 224, 224, 1) !important;
    line-height: 1.5;
}


.right-red-alert {
    color: #EF2730;
    font-weight: bolder;
    border: 1px solid #EF2730 !important;
    border-radius: 2px;
    width: 40px;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
}

.right-grey-alert {
    color: grey;
    font-weight: bolder;
    border: 1px solid grey !important;
    border-radius: 2px;
    width: 40px;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
}

.right-blue-alert {
    color: #36619D;
    font-weight: bolder;
    border: 1px solid #36619D !important;
    border-radius: 2px;
    width: 40px;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
}

.treeTitle {
    font-size: 12px;
}

.treeSubtitle {
    font-size: 9px;
    color: #9A9A9A;
}
</style>
<style lang="scss">
.v-expansion-panel-text__wrapper {
    padding: 8px 4px 16px !important;
    flex: 1 1 auto;
    max-width: 100%;

}

.v-expansion-panel-title {
    padding: 8px 8px !important;
    min-height: 0px !important;
}


.v-tab__slider {
    height: 3px !important;
}
</style>



<style scoped>
.tab-header {
    display: flex;
    border-bottom: 1px solid #ccc;
    width: 100%;
}

/* .fixed {
    position: fixed;
    z-index: 9999;
} */

.tab-button {
    padding: 10px 20px;
    border: none;
    background-color: #f1f1f1;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%;
    justify-content: center;
}

.tab-button.active {
    background-color: #fff;
    border-bottom: 2px solid #007bff;
}

.carousel {
    position: relative;
    /* overflow: auto; */
    height: 900px;
    /* Adjust height as needed */
}

.tab-content {
    position: absolute;
    width: 100%;
    transition: transform 0.5s;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: transform 0.5s;
}

.slide-left-enter-from {
    transform: translateX(100%);
}

.slide-left-leave-to {
    transform: translateX(-100%);
}

.slide-right-enter-from {
    transform: translateX(-100%);
}

.slide-right-leave-to {
    transform: translateX(100%);
}
</style>

<style scoped>
.panel {
    border: 1px solid #ccc;
    margin-bottom: 10px;
}

.panel-header {
    background-color: #f5f5f5;
    padding: 10px;
    cursor: pointer;
}

.panel-content {
    padding: 10px;
    border-top: 1px solid #ccc;
}
</style>