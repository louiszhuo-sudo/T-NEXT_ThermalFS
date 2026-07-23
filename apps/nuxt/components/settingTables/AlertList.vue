<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" class="d-flex justify-start bordered-section" style="white-space: nowrap;">


                <div v-if="isLoading" style="z-index: 10" class="overlay"></div>
                <div v-if="isLoading" class="text-center"
                    style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 100">
                    <v-progress-circular :size="70" :width="7" color="" indeterminate></v-progress-circular>
                </div>

                <!-- 加載超時錯誤提示 -->
                <div v-if="loadingError" style="z-index: 10" class="overlay"></div>
                <div v-if="loadingError" class="text-center"
                    style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 100; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <div class="mb-4">載入超時，請稍後再試</div>
                    <v-btn color="primary" @click="handleErrorReturn">返回</v-btn>
                </div>


                <div class="d-flex align-center pr-4">
                    <h4 v-if="tab123 == 0" class="my-auto pr-4">選擇日期</h4>

                    <v-btn variant="tonal" density="compact" v-if="tab123 == 1" icon class="my-auto mr-2"
                        @click="tab123 = 0">
                        <v-icon>mdi-arrow-left</v-icon></v-btn>
                    <h4 v-if="tab123 == 1" class="my-auto pr-4">事件清單</h4>



                    <div style="width: 350px;" class="my-auto mr-4">
                        <input @click="datePlugin" :disabled="tab123 === 1" type="text" id="datetimerange-input1"
                            size="40" class="v-field__input"
                            style="text-align:center;border: 1px solid grey; height:39px;border-radius: 5px;" :style="{
                                border: tab123 === 1 ? '1px solid #C5C5C5' : '1px solid grey',
                                color: tab123 === 1 ? '#C5C5C5' : 'black'
                            }">
                    </div>

                    <v-btn class="mr-2" color="grey" @click="handleConfirm">
                        確定
                    </v-btn>

                    <div>
                        <v-menu v-model="menu" :close-on-content-click="false" location="end" treeLine>
                            <template v-slot:activator="{ props }">
                                <v-btn :disabled="desserts.length === 0" class="my-auto justify-end mr-4"
                                    color="#BF444C" variant="flat" v-bind="props" style="margin: 0px 0px">
                                    警報次數 {{ desserts.length }}
                                </v-btn>
                            </template>
                            <v-card>
                                <v-card-text class="pa-2">
                                    <BaseTree v-model="formattedEvents" table>
                                        <template #prepend="{ tree }">
                                            <thead>
                                                <tr>
                                                    <th v-if="!tree.dragOvering"></th>
                                                    <th align="left">警報發生日期</th>
                                                    <th>警報次數</th>
                                                </tr>
                                            </thead>
                                        </template>

                                        <template #default="{ node, stat, indentStyle, tree }">
                                            <td v-if="!tree.dragOvering">
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
                                            </td>
                                            <td :style="indentStyle">
                                                {{ node.text }}
                                            </td>
                                            <td align="center">
                                                <v-chip :color="node.count > 20 ? color[19] : color[node.count - 1]"
                                                    variant="flat" :size="stat.level === 1 ? 'default' : 'x-small'">
                                                    {{ node.count }}
                                                </v-chip>
                                            </td>
                                        </template>
                                    </BaseTree>
                                </v-card-text>
                            </v-card>
                        </v-menu>
                    </div>

                    <h4 v-if="tab123 == 1" class="my-auto pr-4" style="color:#adadad">警報發生時間: </h4>

                    <div v-if="tab123 == 1" style="width: 320px;" class="my-auto">
                        {{ parentsData.alarmEvent_startTime }} -
                        {{ parentsData.alarmEvent_endTime }}
                    </div>
                </div>
                <!-- <v-spacer />
                <div class="d-flex align-center  text-right">
                    <v-btn v-if="tab123 == 1" class="my-auto " color="#6795D4" variant="flat" disabled>確認事件</v-btn>
                </div> -->
            </v-col>

            <v-col cols="12" class="d-flex justify-start bordered-section" style="white-space: nowrap;">

                <v-card flat width="100%">
                    <v-tabs style="height: 0px" v-model="tab123">
                        <v-tab value="one">Item One</v-tab>
                        <v-tab value="two">Item Two</v-tab>
                    </v-tabs>

                    <v-card-text class="pa-0">
                        <v-tabs-window v-model="tab123" width="100%">
                            <v-tabs-window-item value="one">
                                <v-data-table height="750px" width="100%" :headers="headers" :items="desserts"
                                    hide-default-footer items-per-page="-1">


                                    <template v-slot:item.alarmEvent_image_URL="{ item }">
                                        <v-menu open-on-hover location="end">
                                            <template v-slot:activator="{ props }">
                                                <div class="d-flex justify-space-evenly" v-bind="props">
                                                    <v-img width="100"
                                                        :src="`http://${$getIpaddress()}:5002/api/alarmEvent/share/${encodeBackslash(item.alarmEvent_image_URL.ir)}`"
                                                        class="ma-1" />
                                                    <v-img width="100"
                                                        :src="`http://${$getIpaddress()}:5002/api/alarmEvent/share/${encodeBackslash(item.alarmEvent_image_URL.vis)}`"
                                                        class="ma-1" />
                                                    <!-- <v-img width="100" src="http://${$getIpaddress()}:5002/api/database/share" class="ma-1" /> -->
                                                    <!-- <v-img width="100" src="http://${$getIpaddress()}:5002/api/database/share" class="ma-1" /> -->
                                                </div>
                                            </template>
                                            <v-card class="d-flex justify-space-evenly">
                                                <v-img width="400"
                                                    :src="`http://${$getIpaddress()}:5002/api/alarmEvent/share/${encodeBackslash(item.alarmEvent_image_URL.ir)}`"
                                                    class="ma-1" />
                                                <v-img width="400"
                                                    :src="`http://${$getIpaddress()}:5002/api/alarmEvent/share/${encodeBackslash(item.alarmEvent_image_URL.vis)}`"
                                                    class="ma-1" />
                                                <!-- <v-img width="400" src="http://${$getIpaddress()}:5002/api/database/share" class="ma-1" />
                                    <v-img width="400" src="http://${$getIpaddress()}:5002/api/database/share" class="ma-1" /> -->
                                            </v-card>
                                        </v-menu>
                                    </template>

                                    <template v-slot:item.alarmEvent_startTime="{ item }">
                                        <div class="">發生 {{ item.alarmEvent_startTime }}</div>
                                        <div class="">結束 {{ item.alarmEvent_endTime }}</div>
                                    </template>

                                    <template v-slot:item.alarmEvent_DOTriggered_startTime="{ item }">
                                        <div class="">觸發成功</div>
                                        <div class="">發生 {{ item.alarmEvent_DOTriggered_startTime }}</div>
                                        <div class="">結束 {{ item.alarmEvent_DOTriggered_endTime }}</div>
                                    </template>

                                    <template v-slot:item.alarmEvent_cursingPoint_name="{ item }">

                                        <div class="">{{ item.alarmEvent_cursingPoint_name }}</div>
                                        <div class="">{{ item.alarmEvent_occur_gps[0] }},&nbsp;&nbsp;&nbsp;{{
                                            item.alarmEvent_occur_gps[1]
                                            }}
                                        </div>
                                    </template>

                                    <template v-slot:item.alarmEvent_roi_alarmStatus="{ item }">
                                        <div class="">{{ item.alarmEvent_roi_alarmStatus === 1 ? "一級超溫警報" :
                                            item.alarmEvent_roi_alarmStatus
                                                ===
                                                2 ?
                                                "二級超溫警報" : "" }}</div>

                                    </template>

                                    <template v-slot:item.alarmEvent_roi_maxTemperature="{ item }">
                                        <div class="">{{ item.alarmEvent_roi_maxTemperature }} °C</div>
                                    </template>

                                    <template v-slot:item.alarmEvent_roi_threshold="{ item }">
                                        <div class="">{{ item.alarmEvent_roi_threshold }} °C</div>
                                    </template>

                                    <template v-slot:item.alarmEvent_resolvedType="{ item }">
                                        <div class="">{{ item.alarmEvent_roi_alarmStatus === 1 ? "手動關閉警報" :
                                            item.alarmEvent_roi_alarmStatus
                                                ===
                                                2 ?
                                                "自動解除" : "" }}</div>
                                    </template>

                                    <template v-slot:item.link="{ item }">

                                        <v-btn icon @click="getVideoNChart(item), sendData(item)" variant="text">
                                            <v-icon>mdi-open-in-new</v-icon>
                                            <div style="font-size: 9px;">{{ item.alarmEvent_id }}</div>
                                        </v-btn>
                                    </template>

                                </v-data-table>
                            </v-tabs-window-item>

                            <v-tabs-window-item value="two">
                                <v-row no-gutters>
                                    <v-col cols="4">

                                        <v-row>
                                            <v-col cols="12" class="text-center">
                                                <!-- 第一部影片 -->
                                                <video ref="videoPlayer1" :src="vedioSrc" type="video/mp4"
                                                    style="width:475px" @timeupdate="updateCurrentTime">
                                                    <source />
                                                    無影片或影片載入失敗!
                                                </video>
                                            </v-col>
                                            <v-col cols="12" class="text-center">

                                                <!-- 第二部影片 -->
                                                <video ref="videoPlayer2" :src="vedioSrc2" type="video/mp4"
                                                    style="width:475px" @timeupdate="updateCurrentTime">
                                                    <source />
                                                    無影片或影片載入失敗!
                                                </video>
                                            </v-col>
                                        </v-row>
                                        <!-- <p>影片總時長: {{ totalDuration }} 秒</p> -->



                                        <!-- <p>當前時間: {{ currentTime }} 秒</p> -->

                                        <!-- 播放/暂停按钮 -->
                                        <!-- <v-btn @click="togglePlay">{{ isPlaying ? '暂停' : '播放' }}</v-btn> -->
                                    </v-col>


                                    <v-col cols="8">
                                        <v-row no-gutters>

                                            <!-- table -->
                                            <v-col cols="12">
                                                <div class="panel">
                                                    <div @click="togglePanel(0)" class="panel-header">
                                                        {{ panels[0].title }}
                                                    </div>
                                                    <div v-show="panels[0].isOpen" class="panel-content">
                                                        <v-row no-gutters>

                                                            <v-col cols="12" class="pa-1" style="position: relative;">
                                                                <v-data-table :headers="headers2" :items="[parentsData]"
                                                                    hide-default-footer items-per-page="-1">







                                                                    <template
                                                                        v-slot:item.alarmEvent_cursingPoint_name="{ item }">

                                                                        <div class="">{{
                                                                            item.alarmEvent_cursingPoint_name }}
                                                                        </div>
                                                                        <div class="">{{ item.alarmEvent_occur_gps[0]
                                                                        }},&nbsp;&nbsp;&nbsp;{{
                                                                                item.alarmEvent_occur_gps[1]
                                                                            }}
                                                                        </div>
                                                                    </template>

                                                                    <template
                                                                        v-slot:item.alarmEvent_roi_alarmStatus="{ item }">
                                                                        <div class="">{{ item.alarmEvent_roi_alarmStatus
                                                                            === 1 ?
                                                                            "一級超溫警報" :
                                                                            item.alarmEvent_roi_alarmStatus
                                                                                ===
                                                                                2 ?
                                                                                "二級超溫警報" : "" }}</div>

                                                                    </template>

                                                                    <template
                                                                        v-slot:item.alarmEvent_roi_maxTemperature="{ item }">
                                                                        <div class="">{{
                                                                            item.alarmEvent_roi_maxTemperature }}
                                                                            °C</div>
                                                                    </template>

                                                                    <template
                                                                        v-slot:item.alarmEvent_roi_threshold="{ item }">
                                                                        <div class="">{{ item.alarmEvent_roi_threshold
                                                                        }} °C
                                                                        </div>
                                                                    </template>

                                                                    <template
                                                                        v-slot:item.alarmEvent_resolvedType="{ item }">
                                                                        <div class="">{{ item.alarmEvent_roi_alarmStatus
                                                                            === 1 ?
                                                                            "手動關閉警報" :
                                                                            item.alarmEvent_roi_alarmStatus
                                                                                ===
                                                                                2 ?
                                                                                "自動解除" : "" }}</div>
                                                                    </template>



                                                                </v-data-table>
                                                            </v-col>
                                                        </v-row>
                                                    </div>
                                                </div>
                                            </v-col>


                                            <!-- 5th chart -->
                                            <v-col cols="12">
                                                <div class="panel">
                                                    <div class="panel-content">
                                                        <v-row no-gutters>
                                                            <v-col cols="1"
                                                                class="d-flex flex-column align-items-center justify-center text-center my-auto">
                                                                <div class="d-flex justify-space-around mb-2">

                                                                    <!-- <v-btn @click="togglePlay">{{ isPlaying ? '暂停' : '播放' }}</v-btn> -->

                                                                    <v-btn variant="outlined" @click="togglePlay"
                                                                        style="min-width:36px;width:36px;max-width:36px;">
                                                                        <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play'
                                                                        }}</v-icon>
                                                                    </v-btn>
                                                                    <v-btn disabled variant="outlined"
                                                                        style="min-width:36px;width:36px;max-width:36px;">
                                                                        2X
                                                                    </v-btn>
                                                                </div>
                                                                <div class="">{{ formatTime(currentTime) }}</div>
                                                            </v-col>
                                                            <v-col cols="11" class="pa-1" style="position: relative;">
                                                                <div id="chart5" class='echarts' ref="chart5"
                                                                    style="height: 50px;width: 100%; ">
                                                                </div>
                                                                <div id="regularTooltip5" class="tooltip"
                                                                    ref="regularTooltip5" style="display: none;">
                                                                </div>
                                                            </v-col>
                                                        </v-row>
                                                    </div>
                                                </div>
                                            </v-col>


                                            <!-- 1st chart -->

                                            <v-col cols="12">
                                                <div class="panel">
                                                    <div @click="togglePanel(1)" class="panel-header">
                                                        {{ panels[1].title }}
                                                    </div>
                                                    <div v-show="panels[1].isOpen" class="panel-content">
                                                        <v-row no-gutters>
                                                            <v-col cols="1"
                                                                class="d-flex flex-column align-items-center justify-center">
                                                            </v-col>
                                                            <v-col cols="11" class="pa-1" style="position: relative;">
                                                                <div id="chart1" class='echarts' ref="chart1"
                                                                    style="height: 150px;width: 100%; ">
                                                                </div>

                                                                <div id="regularTooltip1" class="tooltip"
                                                                    ref="regularTooltip1" style="display: none;">
                                                                </div>
                                                            </v-col>
                                                        </v-row>
                                                    </div>
                                                </div>
                                            </v-col>



                                            <!-- 2nd chart -->

                                            <v-col cols="12">
                                                <div class="panel">
                                                    <div @click="togglePanel(2)" class="panel-header">
                                                        {{ panels[2].title }}
                                                    </div>
                                                    <div v-show="panels[2].isOpen" class="panel-content">
                                                        <v-row no-gutters>
                                                            <v-col cols="1"
                                                                class="d-flex flex-column align-items-center justify-center">
                                                            </v-col>
                                                            <v-col cols="11" class="pa-1" style="position: relative;">
                                                                <div id="chart2" class='echarts' ref="chart2"
                                                                    style="height: 90px;width: 100%; ">
                                                                </div>

                                                                <div id="regularTooltip2" class="tooltip"
                                                                    ref="regularTooltip2" style="display: none;">
                                                                </div>
                                                            </v-col>
                                                        </v-row>
                                                    </div>
                                                </div>
                                            </v-col>




                                            <!-- 3rd chart -->
                                            <v-col cols="12">
                                                <div class="panel">
                                                    <div @click="togglePanel(3)" class="panel-header">
                                                        {{ panels[3].title }}
                                                    </div>
                                                    <div v-show="panels[3].isOpen" class="panel-content">
                                                        <v-row no-gutters>
                                                            <v-col cols="1"
                                                                class="d-flex flex-column align-items-center justify-center">
                                                            </v-col>
                                                            <v-col cols="11" class="pa-1" style="position: relative;">
                                                                <div id="chart3" class='echarts' ref="chart3"
                                                                    style="height: 90px;width: 100%; ">
                                                                </div>

                                                                <div id="regularTooltip3" class="tooltip"
                                                                    ref="regularTooltip3" style="display: none;">
                                                                </div>
                                                            </v-col>
                                                        </v-row>
                                                    </div>
                                                </div>
                                            </v-col>




                                            <!-- 4th chart -->
                                            <v-col cols="12" v-show="false">
                                                <div class="panel">
                                                    <div class="panel-header">
                                                        ?
                                                    </div>
                                                    <div class="panel-content">
                                                        <v-row no-gutters>
                                                            <v-col cols="1"
                                                                class="d-flex flex-column align-items-center justify-center">
                                                            </v-col>
                                                            <v-col cols="11" class="pa-1" style="position: relative;">
                                                                <div id="chart4" class='echarts' ref="chart4"
                                                                    style="height: 150px;width: 100%; ">
                                                                </div>
                                                                <div id="regularTooltip4" class="tooltip"
                                                                    ref="regularTooltip4" style="display: none;">
                                                                </div>
                                                            </v-col>
                                                        </v-row>
                                                    </div>
                                                </div>
                                            </v-col>





                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-tabs-window-item>


                        </v-tabs-window>
                    </v-card-text>
                </v-card>


            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import * as echarts from 'echarts';
import { BaseTree } from '@he-tree/vue'
import '@he-tree/vue/style/default.css'
import { colorBitGl } from 'pixi.js';
const datePickerInstance = ref(null);
const { $getIpaddress } = useNuxtApp()
//! 影片相關
const tab123 = ref(0)
const vedioSrc = ref("")
const vedioSrc2 = ref("")

const videoPlayer1 = ref(null)
const videoPlayer2 = ref(null)
const currentTime = ref(0)
const totalDuration = ref(0)
const inputTime = ref(0)
const isPlaying = ref(false) // 用于记录当前是否正在播放


const panels = reactive([
    { title: '警報事件', content: 'Content for Panel 1', isOpen: true },
    { title: 'ROI 溫度監測', content: 'Content for Panel 2', isOpen: true },
    { title: '動態偵測', content: 'Content for Panel 3', isOpen: true },
    { title: 'Dio 狀態', content: 'Content for Panel 4', isOpen: true },
]);

const togglePanel = (index) => {
    panels[index].isOpen = !panels[index].isOpen;
};




//! Chart
let myChart1 = reactive({})
let myChart2 = reactive({})
let myChart3 = reactive({})
let myChart4 = reactive({})
let myChart5 = reactive({})
const echartData = ref([]);
const echartData2 = ref([])
const echartData3 = ref([])
const echartData4 = ref([])
const echartData5 = ref([])
const echartMarkArea = ref([])
let chart1 = ref()
let chart2 = ref()
let chart3 = ref()
let chart4 = ref()
let chart5 = ref()
let regularTooltip1 = ref()
let regularTooltip2 = ref()
let regularTooltip3 = ref()
let regularTooltip4 = ref()
let regularTooltip5 = ref()
const xIndex123 = ref()
function getEchartData(e) {
    let formate = [];

    for (let i = 0; i < e.value.length; i++) {
        let item = e.value[i];
        let seriesData = {
            name: item.roi_number,
            type: 'line',
            data: item.data,
            animation: false,
            animationDuration: 0,
            animationDurationUpdate: 0, // 设置更新时的动画过渡时间为 0
            symbol: 'none',
            showSymbol: false,
            hoverAnimation: false,
            smooth: true,
            emphasis: {
                disabled: true,
                focus: 'none',
                label: {
                    show: true,
                    position: 'right',
                    formatter: '({a}): {@[1]}',
                    backgroundColor: item.color === 'red' ? 'red' : 'rgba(54, 97, 157, 0.5)', // 设置底色
                    color: '#fff',
                    padding: 5
                }
            },
            lineStyle: {
                width: 1  // 設置線寬為1px
            },
            // large: true,
            // largeThreshold :10000,
            // sampling: "average",
            color: item.color,
            // sampling: "lttb",
        };
        formate.push(seriesData);
    }
    return formate
}

function getEchartDynamicData(e) {
    let formate = [];

    for (let i = 0; i < e.value.length; i++) {
        let item = e.value[i];
        let seriesData = {
            step: 'end',
            name: item.roi_number,
            type: 'line',
            data: item.data,
            animation: false,
            animationDuration: 0,
            animationDurationUpdate: 0, // 设置更新时的动画过渡时间为 0
            symbol: 'none',
            showSymbol: false,
            hoverAnimation: false,
            emphasis: {
                disabled: true,
                focus: 'none',
                label: {
                    show: true,
                    position: 'right',
                    formatter: '({a}): {@[1]}',
                    backgroundColor: 'rgba(54, 97, 157, 0.5)', // 设置底色
                    color: '#fff',
                    padding: 5
                }
            },
            // large: true,
            // largeThreshold :10000,
            // sampling: "average",
            color: "black",
            sampling: "lttb",
        };
        formate.push(seriesData);
    }
    return formate
}

function getEchartDoData(e) {
    let formate = [];

    for (let i = 0; i < e.value.length; i++) {
        let item = e.value[i];
        let seriesData = {
            step: 'end',
            name: item.roi_number,
            type: 'line',
            data: item.data,
            animation: false,
            animationDuration: 0,
            animationDurationUpdate: 0, // 设置更新时的动画过渡时间为 0
            symbol: 'none',
            showSymbol: false,
            hoverAnimation: false,
            emphasis: {
                disabled: true,
                focus: 'none',
                label: {
                    show: true,
                    position: 'right',

                    formatter: function (params) {
                        // 假设你的数据在 params.value 中，检查它是否等于 1
                        return `(${params.seriesName}): ${params.value[1] === 1 ? 'ON' : 'OFF'}`;
                    },


                    backgroundColor: 'rgba(54, 97, 157, 0.5)', // 设置底色
                    color: '#fff',
                    padding: 5
                }
            },
            // large: true,
            // largeThreshold :10000,
            // sampling: "average",
            color: "black",
            sampling: "lttb",
        };
        formate.push(seriesData);
    }
    return formate
}

function getEchartDataButOnlyCtrlSpot(e) {
    let formate = [];

    for (let i = 0; i < e.value.length; i++) {
        let item = e.value[i];
        let seriesData = {
            name: item.roi_number,
            type: 'line',
            data: item.data,
            color: "transparent",
            animation: false,
            animationDuration: 0,
            animationDurationUpdate: 0, // 设置更新时的动画过渡时间为 0
            symbol: 'none',
            showSymbol: false,
            hoverAnimation: false,
            emphasis: {
                disabled: true,
                focus: 'none'
            },
            // large: true,
            // largeThreshold :10000,
            // sampling: "average",
            sampling: "lttb",
        };
        formate.push(seriesData);
    }
    return formate
}

function getEchartMarkAreaData(e) {
    let formate = [];
    const colorMap = {
        0: "#DFF7D1",
        1: "#FFF4CC",
        2: "#iFFD0D0"
    };
    const transformedData = e.value.map(array =>
        array.map(item => {
            if (item.itemStyle && item.itemStyle.color !== undefined) {
                // 替换颜色值
                item.itemStyle.color = colorMap[item.itemStyle.color];
            }
            return item;
        })
    );
    // 建立輸出對象
    return formate = {
        "silent": true,
        "data": transformedData
    };

}
const dragPosition = reactive({ x: 38.480000000000004, y: 0 });

function getOption() {
    return {
        graphic:
            [
                {
                    type: 'group',
                    position: [dragPosition.x, dragPosition.y],

                    draggable: true,
                    ondrag: function (event) {
                        var xIndex = myChart5.convertFromPixel('grid', [
                            event.offsetX,
                            event.offsetY
                        ])[0];
                        xIndex = Math.round(xIndex);
                        
                        // 獲取圖表數據的第一個和最後一個時間點
                        let firstDataPoint = Infinity;
                        let lastDataPoint = -Infinity;
                        
                        // 遍歷所有數據系列找出最早和最晚的時間點
                        echartData5.value.forEach(series => {
                            if (series.data && series.data.length > 0) {
                                const firstTime = series.data[0][0];
                                const lastTime = series.data[series.data.length - 1][0];
                                
                                firstDataPoint = Math.min(firstDataPoint, firstTime);
                                lastDataPoint = Math.max(lastDataPoint, lastTime);
                            }
                        });
                        
                        // 限制拖曳範圍在數據的第一個和最後一個時間點之間
                        if (xIndex < firstDataPoint) {
                            xIndex = firstDataPoint;
                        } else if (xIndex > lastDataPoint) {
                            xIndex = lastDataPoint;
                        }
                        
                        var newX = myChart5.convertToPixel('grid', [xIndex, 0])[0];
                        this.position[0] = newX;
                        console.log("sdssdds", xIndex);
                        
                        dragPosition.x = newX;
                    },
                    children: [
                        {
                            type: 'rect',
                            z: 100,
                            left: 0,
                            top: 'center',
                            shape: {
                                width: 2,
                                height: 9999999,
                            },
                            style: {
                                fill: '#36619D',
                            },
                        },
                    ]
                }
            ],
    };
};


function getOptionDrag() {
    return {
        graphic:
            [
                {
                    type: 'group',
                    position: [dragPosition.x, dragPosition.y],

                    draggable: true,
                    ondrag: function (event) {
                        var xIndex = myChart5.convertFromPixel('grid', [
                            event.offsetX,
                            event.offsetY
                        ])[0];
                        xIndex = Math.round(xIndex);
                        
                        // 獲取圖表數據的第一個和最後一個時間點
                        let firstDataPoint = Infinity;
                        let lastDataPoint = -Infinity;
                        
                        // 遍歷所有數據系列找出最早和最晚的時間點
                        echartData5.value.forEach(series => {
                            if (series.data && series.data.length > 0) {
                                const firstTime = series.data[0][0];
                                const lastTime = series.data[series.data.length - 1][0];
                                
                                firstDataPoint = Math.min(firstDataPoint, firstTime);
                                lastDataPoint = Math.max(lastDataPoint, lastTime);
                            }
                        });
                        
                        // 限制拖曳範圍在數據的第一個和最後一個時間點之間
                        if (xIndex < firstDataPoint) {
                            xIndex = firstDataPoint;
                        } else if (xIndex > lastDataPoint) {
                            xIndex = lastDataPoint;
                        }
                        
                        var newX = myChart5.convertToPixel('grid', [xIndex, 0])[0];
                        this.position[0] = newX;
                        console.log("sdssdds", xIndex);
                        
                        dragPosition.x = newX;
                    },
                    children: [
                        {
                            type: 'rect',
                            z: 100,
                            left: 0,
                            top: 'center',
                            shape: {
                                width: 6,
                                height: 9999999,
                            },
                            style: {
                                fill: '#36619D',
                            },
                        },
                    ]
                }
            ],
    };
};



function formatTime(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = seconds % 60;

    var formattedTime =
        (hours < 10 ? '0' : '') + hours + ':' +
        (minutes < 10 ? '0' : '') + minutes + ':' +
        (remainingSeconds < 10 ? '0' : '') + remainingSeconds.toFixed();

    return formattedTime;
}

const currentDuration = ref(0)

function initCharts() {
    myChart1 = echarts.init(chart1.value)
    let option = {
        animation: false,
        animationDurationUpdate: 0,

        dataZoom: [
            {
                type: "inside",
                realtime: true,
            },
        ],

        xAxis: {
            show: false,
            type: 'time',
            boundaryGap: false,
            interval: 1,
            // data: getEchartXAxis(echartData),
            axisPointer: {
                snap: true,
                // snap: false,
                lineStyle: {
                    color: '#7581BD',
                    width: 2
                },
                // handle: {
                //   show: true,
                //   color: '#7581BD'
                // }
            },
            axisLabel: {
                showMaxLabel: true,
                formatter: function (value, index) {
                    return formatTime(value) + "";
                },
            }
        },
        yAxis: {
            type: 'value',
            scale: true
        },
        grid: {
            left: "4%",
            top: "10%",
            right: "4%",
            bottom: "10%",
            // containLabel: true
        },
        tooltip: {
            animation: false,
            transitionDuration: 0,
            show: true,
            trigger: 'axis',
            showContent: false,
            showDelay: 0,
            axisPointer: {
                show: true,
                animation: false
            }
        },
        series: [],
    };
    myChart1.setOption(option)


    myChart2 = echarts.init(chart2.value)
    let option2 = {
        animation: false,
        animationDurationUpdate: 0,
        dataZoom: [
            {
                type: "inside",
                realtime: true,
            },
        ],
        xAxis: {
            show: false,
            type: 'time',
            boundaryGap: false,
            interval: 1,
            axisPointer: {
                snap: true,
                // snap: false,
                lineStyle: {
                    color: '#7581BD',
                    width: 2
                },
                // handle: {
                //   show: true,
                //   color: '#7581BD'
                // }
            },
            axisLabel: {
                showMaxLabel: true,
                formatter: function (value, index) {
                    return formatTime(value) + "";
                },
            }
        },
        yAxis: {
            type: 'value',
            scale: true
        },
        grid: {
            left: "4%",
            top: "10%",
            right: "4%",
            bottom: "10%",
            // containLabel: true
        },
        tooltip: {
            animation: false,
            transitionDuration: 0,
            show: true,
            trigger: 'axis',
            showContent: false,
            showDelay: 0,
            axisPointer: {
                show: true,
                animation: false

            }
        },
        series: [],
    };
    myChart2.setOption(option2)
    myChart3 = echarts.init(chart3.value)
    let option3 = {
        animation: false,
        animationDurationUpdate: 0,
        dataZoom: [
            {
                type: "inside",
                realtime: true,
            },
        ],
        xAxis: {
            show: false,
            type: 'time',
            boundaryGap: false,
            interval: 1,
            axisPointer: {
                snap: true,
                // snap: false,
                lineStyle: {
                    color: '#7581BD',
                    width: 2
                },
                // handle: {
                //   show: true,
                //   color: '#7581BD'
                // }
            },
            axisLabel: {
                showMaxLabel: true,
                formatter: function (value, index) {
                    return formatTime(value) + "";
                },
            }
        },
        yAxis: {
            type: 'value',
            scale: true,
            min: 0,
            max: 1,
            interval: 1,
            axisLabel: {
                formatter: function (value) {
                    return value === 1 ? 'ON' : 'OFF';
                }
            }
        },
        grid: {
            left: "4%",
            top: "10%",
            right: "4%",
            bottom: "10%",
            // containLabel: true
        },
        tooltip: {
            animation: false,
            transitionDuration: 0,
            show: true,
            trigger: 'axis',
            showContent: false,
            showDelay: 0,
            axisPointer: {
                show: true,
                animation: false

            }
        },
        series: [],
    };
    myChart3.setOption(option3)
    myChart4 = echarts.init(chart4.value)
    let option4 = {
        animation: false,
        animationDurationUpdate: 0,
        dataZoom: [
            {
                type: "inside",
                realtime: true,
            },
        ],
        xAxis: {
            show: false,
            type: 'time',
            boundaryGap: false,
            interval: 1,
            axisPointer: {
                snap: true,
                // snap: false,
                lineStyle: {
                    color: '#7581BD',
                    width: 2
                },
                // handle: {
                //   show: true,
                //   color: '#7581BD'
                // }
            },
            axisLabel: {
                showMaxLabel: true,
                formatter: function (value, index) {
                    return formatTime(value) + "";
                },
            }
        },
        yAxis: {
            type: 'value',
            scale: true
        },
        grid: {
            left: "4%",
            top: "10%",
            right: "4%",
            bottom: "10%",
            // containLabel: true
        },
        tooltip: {
            animation: false,
            transitionDuration: 0,
            show: true,
            trigger: 'axis',
            showContent: false,
            showDelay: 0,
            axisPointer: {
                show: true,
                animation: false

            }
        },
        series: [],
    };
    myChart4.setOption(option4)
    myChart5 = echarts.init(chart5.value)
    let option5 = {
        animation: false,
        animationDurationUpdate: 0,
        dataZoom: [
            {
                type: "inside",
                realtime: true,
            },
        ],
        xAxis: {
            type: 'time',
            boundaryGap: false,
            interval: 1,
            axisPointer: {
                snap: true,
                // snap: false,
                lineStyle: {
                    color: '#7581BD',
                    width: 2
                },
                // handle: {
                //   show: true,
                //   color: '#7581BD'
                // }
            },
            axisLabel: {
                showMaxLabel: true,
                formatter: function (value, index) {
                    return formatTime(value) + "";
                },
            }
        },
        yAxis: {
            show: false,
            type: 'value',
            scale: true
        },
        grid: {
            left: "4%",
            top: "25%",
            right: "4%",
            bottom: "35%",
            // containLabel: true
        },
        tooltip: {
            animation: false,
            transitionDuration: 0,
            show: true,
            trigger: 'axis',
            showContent: false,
            showDelay: 0,
            axisPointer: {
                show: true,
                animation: false

            }
        },
        series: [],
    };
    myChart5.setOption(option5)

    myChart1.setOption(getOption());
    myChart2.setOption(getOption());
    myChart3.setOption(getOption());
    myChart4.setOption(getOption());
    myChart5.setOption(getOptionDrag());


};

function renderCharts() {
    // initCharts()
    myChart1.setOption({
        series: getEchartData(echartData)
    })

    myChart2.setOption({
        series: getEchartDynamicData(echartData2)
    })

    myChart3.setOption({
        series: getEchartDoData(echartData3)
    })

    myChart4.setOption({
        series: getEchartData(echartData4)
    })

    myChart5.setOption({
        series: getEchartDataButOnlyCtrlSpot(echartData4)
    })
    myChart5.setOption({
        series: {
            markArea: getEchartMarkAreaData(echartMarkArea)
        }
    })
}

const vedioSrcReplace = ref("")
const vedioSrc2Replace = ref("")
const menu = ref(false)
const color = ref([
    "#F3E4A1",
    "#F0D99C",
    "#EDCE97",
    "#EAC392",
    "#E7B98D",
    "#E4AE87",

    "#E1A382",
    "#DE987D",
    "#DB8D78",
    "#D88273",

    "#D67C6F",
    "#D3766B",
    "#D16F67",
    "#CE6963",
    "#CC6360",

    "#C95D5C",
    "#C75758",
    "#C45054",
    "#C24A50",
    "#BF444C"
])




const ws5 = ref(null)

function encodeBackslash(input) {
    return input.replace(/\\/g, '%5C%5C');
}


const tab = ref(0)


const parentsData = ref({})


const sendData = (n) => {
    parentsData.value = n
}





const headers = ref([
    // { title: 'ID', align: 'center', sortable: true, key: 'alarmEvent_id' },
    { title: '影像', align: 'center', sortable: false, key: 'alarmEvent_image_URL' },
    { title: '警報發生時間', align: 'center', sortable: true, key: 'alarmEvent_startTime' },
    { title: 'DIO觸發時間', align: 'center', sortable: true, key: 'alarmEvent_DOTriggered_startTime' },
    { title: '發生位置', align: 'center', sortable: true, key: 'alarmEvent_occur_locationName' },
    { title: '偵測相機名稱', align: 'center', sortable: true, key: 'alarmEvent_cameraName' },
    { title: '預設點編號', align: 'center', sortable: true, key: 'alarmEvent_cursingPoint_name' },
    { title: '警報類型', align: 'center', sortable: true, key: 'alarmEvent_roi_alarmStatus' },
    { title: '最高溫度', align: 'center', sortable: true, key: 'alarmEvent_roi_maxTemperature' },
    { title: '警報閾值', align: 'center', sortable: true, key: 'alarmEvent_roi_threshold' },
    { title: '事件處理', align: 'center', sortable: true, key: 'alarmEvent_resolvedType' },
    { title: '', align: 'center', sortable: false, key: 'link' },

    // { title: 'Actions', key: 'actions', sortable: false },
]);


const headers2 = ref([
    { title: 'ID', align: 'center', sortable: false, key: 'alarmEvent_id' },
    { title: '發生位置', align: 'center', sortable: false, key: 'alarmEvent_occur_locationName' },
    { title: '偵測相機名稱', align: 'center', sortable: false, key: 'alarmEvent_cameraName' },
    { title: '預設點編號', align: 'center', sortable: false, key: 'alarmEvent_cursingPoint_name' },
    { title: '警報類型', align: 'center', sortable: false, key: 'alarmEvent_roi_alarmStatus' },
    { title: '最高溫度', align: 'center', sortable: false, key: 'alarmEvent_roi_maxTemperature' },
    { title: '警報閾值', align: 'center', sortable: false, key: 'alarmEvent_roi_threshold' },
    { title: '事件處理', align: 'center', sortable: false, key: 'alarmEvent_resolvedType' },
]);

const desserts = ref([]);
const editedIndex = ref(-1);
const editedItem = ref({
    alarmEvent_filed_id: 0,
    alarmEvent_filed_name: '',
    alarmEvent_id: 0,
    alarmEvent_startTime: 0,
    alarmEvent_endTime: 0,
    alarmEvent_DOTriggered_startTime: 0,
    alarmEvent_DOTriggered_endTime: 0,
    alarmEvent_occur_locationName: 0,
    alarmEvent_occur_location: 0,
    alarmEvent_occur_gps: 0,
    alarmEvent_roi_threshold: 0,
    alarmEvent_roi_thresholdSystem: 0,
    alarmEvent_roi_thresholdManual: 0,
    alarmEvent_roi_alarmStatus: 0,
    alarmEvent_roi_maxTemperature: 0,
    alarmEvent_cursingPoint_name: 0,
    alarmEvent_resolvedType: 0,
    alarmEvent_cameraID: 0,
    alarmEvent_cameraName: 0,
    alarmEvent_image_URL: 0
});
const defaultItem = {
    alarmEvent_filed_id: 0,
    alarmEvent_filed_name: '',
    alarmEvent_id: 0,
    alarmEvent_startTime: 0,
    alarmEvent_endTime: 0,
    alarmEvent_DOTriggered_startTime: 0,
    alarmEvent_DOTriggered_endTime: 0,
    alarmEvent_occur_locationName: 0,
    alarmEvent_occur_location: 0,
    alarmEvent_occur_gps: 0,
    alarmEvent_roi_threshold: 0,
    alarmEvent_roi_thresholdSystem: 0,
    alarmEvent_roi_thresholdManual: 0,
    alarmEvent_roi_alarmStatus: 0,
    alarmEvent_roi_maxTemperature: 0,
    alarmEvent_cursingPoint_name: 0,
    alarmEvent_resolvedType: 0,
    alarmEvent_cameraID: 0,
    alarmEvent_cameraName: 0,
    alarmEvent_image_URL: 0
};

const formTitle = computed(() => (editedIndex.value === -1 ? 'New Item' : 'Edit Item'));

const initialize = () => {
    desserts.value = [
        // {
        //     alarmEvent_filed_id: 0,
        //     alarmEvent_filed_name: "",
        //     alarmEvent_id: 0,
        //     alarmEvent_startTime: "",
        //     alarmEvent_endTime: "",
        //     alarmEvent_DOTriggered_startTime: "",
        //     alarmEvent_DOTriggered_endTime: "",
        //     alarmEvent_occur_locationName: "",
        //     alarmEvent_occur_location: 0,
        //     alarmEvent_occur_gps: [0, 0],
        //     alarmEvent_roi_threshold: 0,
        //     alarmEvent_roi_thresholdSystem: 0,
        //     alarmEvent_roi_thresholdManual: 0,
        //     alarmEvent_roi_alarmStatus: 0,
        //     alarmEvent_roi_maxTemperature: 0,
        //     alarmEvent_cursingPoint_name: "",
        //     alarmEvent_resolvedType: 0,
        //     alarmEvent_cameraID: 0,
        //     alarmEvent_cameraName: "",
        //     alarmEvent_image_URL: { ir: "", vis: "" }
        // },
    ];
};












const dateSelected = ref(0)



function getVideoNChart(e) {
    vedioSrc.value = vedioSrcReplace.value
    vedioSrc2.value = vedioSrc2Replace.value
    ws5.value.send(
        JSON.stringify({
            "feature": "history_alarm",
            "method": "query_detail_overTempEvent",
            "content": {
                "alarmEvent_filed_id": parseInt(e.alarmEvent_filed_id),
                "alarmEvent_id": parseInt(e.alarmEvent_id)
            },
            "session": "sckji8452s"
        })
    );


    setTimeout(() => {
        getVideoNChart2(e)
    }, 500);
}


function getVideoNChart2(e) {
    vedioSrc.value = vedioSrcReplace.value
    vedioSrc2.value = vedioSrc2Replace.value
    ws5.value.send(
        JSON.stringify({
            "feature": "history_alarm",
            "method": "query_detail_overTempEvent",
            "content": {
                "alarmEvent_filed_id": parseInt(e.alarmEvent_filed_id),
                "alarmEvent_id": parseInt(e.alarmEvent_id)
            },
            "session": "sckji8452s"
        })
    );
    tab123.value = 1
}


function ws8704() {
    //! ws5
    ws5.value = new WebSocket(`ws://${$getIpaddress()}:8704`);
    ws5.value.onopen = () => {
        console.log("websocket 8704 命令/查詢通道 已連線!!!!!");
        // 不再自動發送請求
    };

    ws5.value.onmessage = (params1) => {
        var params = {
            data: JSON.parse(params1.data),
        };

        // 收到數據後關閉加載狀態
        isLoading.value = false;

        if (params.data.method == "query_detail_overTempEvent") {
            console.log("1234456", `http://${$getIpaddress()}:5002/api/alarmEvent/share/${vedioSrc.value}`);
            vedioSrc.value = `http://${$getIpaddress()}:5002/api/alarmEvent/share/${encodeBackslash(params.data.content.alarmEvent_video_URL.ir)}`
            vedioSrc2.value = `http://${$getIpaddress()}:5002/api/alarmEvent/share/${encodeBackslash(params.data.content.alarmEvent_video_URL.vis)}`

            videoPlayer1.value.onloadedmetadata = () => {
                totalDuration.value += videoPlayer1.value.duration
            }
            videoPlayer2.value.onloadedmetadata = () => {
                totalDuration.value += videoPlayer2.value.duration
            }


            echartData.value = params.data.content.echart_roiTemp.echart_data
            console.log("echart_roiTemp", params.data.content.echart_roiTemp.echart_data)
            echartData2.value = params.data.content.echart_dymanicMask.echart_data
            echartData3.value = params.data.content.echart_doStatus.echart_data
            echartData4.value = params.data.content.echart_dymanicMask.echart_data
            echartData5.value = params.data.content.echart_overallStatus.echart_data
            echartMarkArea.value = params.data.content.echart_overallStatus.markarea.data
            initCharts()

            renderCharts()

            const charts = [myChart1, myChart2, myChart3, myChart4, myChart5];
            const echartDataSets = [echartData, echartData2, echartData3, echartData4, echartData5];

            charts.forEach((chart, index) => {
                chart.getZr().on('mousemove', params => {
                    const pointInPixel = [params.offsetX, params.offsetY];
                    if (chart.containPixel('grid', pointInPixel)) {
                        xIndex123.value = chart.convertFromPixel({ seriesIndex: 0 }, pointInPixel)[0];


                        // Dispatch actions to other charts
                        charts.forEach((otherChart, i) => {
                            if (i !== index) {
                                let longestIndex = -1;
                                let maxLength = 0;
                                echartDataSets[i].value.forEach((series, seriesIndex) => {
                                    if (series.data.length > maxLength) {
                                        maxLength = series.data.length;
                                        longestIndex = seriesIndex;
                                    }
                                });

                                otherChart.dispatchAction({
                                    type: "showTip",
                                    seriesIndex: longestIndex,
                                    dataIndex: Math.round(xIndex123.value),
                                });

                                // currentTime.value = xIndex123.value

                            }
                        });

                    }
                });


                chart.getZr().on('globalout', params => {
                    xIndex123.value = 0

                    charts.forEach((otherChart, i) => {
                        if (i !== index) {
                            let longestIndex = -1;
                            let maxLength = 0;
                            echartDataSets[i].value.forEach((series, seriesIndex) => {
                                if (series.data.length > maxLength) {
                                    maxLength = series.data.length;
                                    longestIndex = seriesIndex;
                                }
                            });

                            otherChart.dispatchAction({
                                type: "legendUnSelect",
                                seriesIndex: longestIndex,
                                dataIndex: Math.round(xIndex123.value),
                            });

                            // currentTime.value = xIndex123.value

                        }
                    });
                })
            });


        }
        
        if (params.data instanceof Array) {
            desserts.value = params.data
            console.log("dskjsksk", params.data);
        } else {
            console.log("", params.data);
        }
    };
    
    // 添加錯誤處理
    ws5.value.onerror = () => {
        isLoading.value = false;
        loadingError.value = true;
    };
    
    // 添加連接關閉處理
    ws5.value.onclose = () => {
        if (isLoading.value) {
            isLoading.value = false;
            loadingError.value = true;
        }
    };
}

// 更新当前播放时间
const updateCurrentTime = () => {
    currentTime.value = Math.max(videoPlayer1.value.currentTime, videoPlayer2.value.currentTime)
    inputTime.value = currentTime.value // 同步文本框中的值
}

// 设置两个视频的当前播放时间
const setCurrentTime = () => {
    const time = parseFloat(inputTime.value)
    if (!isNaN(time)) {
        videoPlayer1.value.currentTime = time
        videoPlayer2.value.currentTime = time
        currentTime.value = time
    }
}

// 切换播放/暂停状态
const togglePlay = () => {
    if (isPlaying.value) {
        // 暂停视频
        videoPlayer1.value.pause()
        videoPlayer2.value.pause()
    } else {
        // 播放视频
        videoPlayer1.value.play()
        videoPlayer2.value.play()
    }
    isPlaying.value = !isPlaying.value // 切换播放状态
}


useHead({
    // title: 'vanilla-datetimerange-picker simple example',
    meta: [
        { charset: 'UTF-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' }
    ],
    link: [
        {
            rel: 'stylesheet',
            type: 'text/css',
            href: '/css/vanilla-datetimerange-picker-dark.css'
        }
    ],
    script: [
        {
            src: '/js/moment.min.js',
            type: 'text/javascript'
        },
        {
            src: '/js/vanilla-datetimerange-picker.js',
            type: 'text/javascript'
        }
    ],
    style: [
        { children: 'body { color: white; background-color: #fff; }' }
    ]
})


function convertISOToCustomFormat(isoString) {
    const date = new Date(isoString);

    // 提取年、月、日、小时、分钟和秒
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要加1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // 格式化为 'YYYY-MM-DD HH:MM:SS'
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


function getTodayDateRange() {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return {
        start: convertISOToCustomFormat(startDate),
        end: convertISOToCustomFormat(endDate)
    };
}



// const isoString = "2024-07-17T00:00:00+08:00";
// const formattedString = convertISOToCustomFormat(isoString);

// console.log(formattedString); // 输出：2024-07-17 00:00:00


// watch(tab, (newValue, oldValue) => {


// });


const formattedEvents = computed(() => {
    const eventsByDate = {};

    desserts.value.forEach(event => {
        const date = event.alarmEvent_startTime.split(' ')[0];
        const hour = parseInt(event.alarmEvent_startTime.split(' ')[1].split(':')[0]);

        if (!eventsByDate[date]) {
            eventsByDate[date] = {
                text: date,
                count: 0,
                children: []
            };
        }

        eventsByDate[date].count++;

        const hourRange = `${hour.toString().padStart(2, '0')}:00:00 ~ ${(hour + 1).toString().padStart(2, '0')}:00:00`;
        let hourEvent = eventsByDate[date].children.find(child => child.text.includes(hourRange));

        if (!hourEvent) {
            hourEvent = {
                text: `於 ${hourRange} 間發生警報`,
                count: 0
            };
            eventsByDate[date].children.push(hourEvent);
        }

        hourEvent.count++;
    });

    return Object.values(eventsByDate);
});




const datePlugin = () => {
    // 先清理已存在的實例
    if (datePickerInstance.value) {
        datePickerInstance.value.destroy();
    }

    // 先清空輸入框
    document.getElementById('datetimerange-input1').value = '';

    // 確保 DOM 完全加載
    nextTick(() => {
        setTimeout(() => {
            datePickerInstance.value = new DateRangePicker('datetimerange-input1', {
                timePicker: true,
                alwaysShowCalendars: true,
                timePickerSeconds: true,
                autoUpdateInput: false, // 防止自動填充
                startEmpty: true, // 添加這個選項，開始時為空
                locale: {
                    format: "YYYY-MM-DD HH:mm:ss",
                    cancelLabel: '清除',
                    applyLabel: '確定'
                }
            }, function (start, end) {
                console.log("開始時間:", convertISOToCustomFormat(start.format()));
                console.log("結束時間:", convertISOToCustomFormat(end.format()));

                dateSelected.value = convertISOToCustomFormat(start.format()).toString() + " - " + convertISOToCustomFormat(end.format()).toString();
                
                // 更新輸入框的值
                document.getElementById('datetimerange-input1').value = dateSelected.value;
            });
            
            // 添加事件監聽器，當用戶點擊取消按鈕時清空輸入框
            document.querySelector('.cancelBtn').addEventListener('click', function() {
                document.getElementById('datetimerange-input1').value = '';
                dateSelected.value = '';
            });
        }, 100);
    });
}






onMounted(() => {
    // initCharts()
    initialize();
    ws8704()


    datePlugin();  // 調用 datePlugin 替換原有的直接初始化

    // 添加事件監聽
    window.addEventListener('apply.daterangepicker', function (ev) {
        console.log(ev.detail.startDate.format('YYYY-MM-DD'));
        console.log(ev.detail.endDate.format('YYYY-MM-DD'));
    });
    
    // 不再自動加載今天的數據
    dateSelected.value = ''; // 初始化為空字符串
});



watch(currentTime, (e) => {

    // myChart5.on('finished', function () {
    // 找到 x 軸的第五項，也就是 [5, 230] 的 x 值
    const xValue = e.toFixed()
    // 使用 convertToPixel 方法，將數據值轉換成像素位置


    const xAxisPx = myChart5.convertToPixel('grid', [xValue, 0])
    console.log('x 軸第五項的像素位置:', xAxisPx);

    dragPosition.x = xAxisPx[0]
    // });


})


watch(dragPosition, (newPos) => {

    [myChart1, myChart2, myChart3, myChart4, myChart5].forEach((chart) => {
        chart.setOption({
            graphic: {
                position: [newPos.x, newPos.y],
            },
        });
    });
});

const isLoading = ref(false);
const loadingError = ref(false);

const handleConfirm = () => {
    if (!dateSelected.value) {
        alert('請選擇日期範圍'); // Add alert when date is empty
        return; // 如果沒有選擇日期，不執行任何操作
    }
    
    isLoading.value = true;
    loadingError.value = false;
    
    const [startDateStr, endDateStr] = dateSelected.value.split(' - ');
    
    // 發送WebSocket請求
    ws5.value.send(
        JSON.stringify({
            feature: "history_alarm",
            method: "query_OverTemperature",
            content: {
                filed_id: [1, 2],
                alarmEvent_startTime: startDateStr,
                alarmEvent_endTime: endDateStr
            },
            session: "sckji8452s"
        })
    );
    
    // 設置超時處理 - 改為10秒
    const timeoutId = setTimeout(() => {
        if (isLoading.value) {
            isLoading.value = false;
            loadingError.value = true;
        }
    }, 10000); // 10秒超時
}

const handleErrorReturn = () => {
    loadingError.value = false;
}

</script>
<style>
.top-header {
    padding: 10px;
    border: 1px solid grey
}



.panel {
    border: 1px solid #ccc;
    margin-bottom: 10px;
}

.panel-header {
    background-color: #f5f5f5;
    padding: 0px 8px;
    cursor: pointer;
}

.top-header {
    padding: 10px;
}

.panel-content {
    padding: 10px;
    border-top: 1px solid #ccc;
}


.mv video {
    height: 100%;
    width: 100%;
    padding: 0px
}

.tooltip {
    position: absolute;
    background-color: white;
    border: 1px solid black;
    padding: 5px;
    pointer-events: none;
    z-index: 1000;
}


.bordered-section {
    outline: 1px solid #B8B8B8;
    position: relative;
    background: #fff;
}
</style>
<style>
/* 確保日期時間選擇器的下拉選單永遠在最上層 */
.daterangepicker {
    z-index: 99999 !important;
    /* 使用很大的值確保在最上層 */
}

/* 時間選擇器的下拉部分 */
.calendar-time {
    z-index: 99999 !important;
}

/* 確保時間選擇器的下拉選單也在最上層 */
.daterangepicker .calendar-time select {
    z-index: 100000 !important;
}
</style>