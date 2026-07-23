<template>
    <div>
        <!-- <p> {{ props }}</p> -->
        <!-- <a :href="`http://${$getIpaddress()}:5002/api/alarmEvent/share/${vedioSrc}`">IR連結</a>
        <br /> <a :href="`http://${$getIpaddress()}:5002/api/alarmEvent/share/${vedioSrc2}`">VIS連結</a>
        <br /> -->
        <!-- <v-btn @click="setTo15()">123</v-btn> -->
        <!-- {{ getWs4() }} -->
        <!-- {{   echartData  }} -->
        <!-- {{ data123 }} -->
        <!-- 【當前時間】<span style="color:red;font-size: 20px;font-weight: 900;">{{ formatTime(currentDuration) }} / {{
            formatTime(totalDuration)
            }}</span><br /> -->
        <!-- {{currentDuration}}<br />
        {{ totalDuration }}<br /> -->
        <!-- <p>Current Time: {{ currentTime123.toFixed() }} seconds</p>
        123__ {{ xIndex123 }}<br /> -->

        <!-- 【時間轉畫布pixel】 -->
        <!-- <span style="color:red;font-size: 20px;font-weight: 900;">{{ dragPosition.x }}</span> -->
        <v-row no-gutters>
            <v-col cols="4" class="px-8">
                <div class="mv">
                    <v-responsive :aspect-ratio="4 / 3" class="responsive-container">
                        <!-- <video ref="videoPlayer123" @timeupdate="updateCurrentTime" controls
                            :src="`http://${$getIpaddress()}:5002/api/alarmEvent/share/${vedioSrc}`" type="video/mp4">
                            <source />
                            Your browser does not support the video tag.
                        </video> -->




                        <video :src="`http://${$getIpaddress()}:5002/api/alarmEvent/share/${vedioSrc}`" controls />
                    </v-responsive>
                </div>
                <div class="mv">
                    <v-responsive :aspect-ratio="4 / 3" class="responsive-container">

                        <video :src="`http://${$getIpaddress()}:5002/api/alarmEvent/share/${vedioSrc2}`" controls />

                    </v-responsive>

                </div>
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
                                        <v-data-table :headers="headers" :items="[props.myProp]" hide-default-footer
                                            items-per-page="-1">







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
                                            <v-btn disabled variant="outlined"
                                                style="min-width:36px;width:36px;max-width:36px;">
                                                <v-icon>mdi-play</v-icon>
                                            </v-btn>
                                            <v-btn disabled variant="outlined"
                                                style="min-width:36px;width:36px;max-width:36px;">
                                                2X
                                            </v-btn>
                                        </div>
                                        <div class="">{{ formatTime(currentDuration) }}</div>
                                    </v-col>
                                    <v-col cols="11" class="pa-1" style="position: relative;">
                                        <div id="chart5" class='echarts' ref="chart5"
                                            style="height: 50px;width: 100%; ">
                                        </div>
                                        <div id="regularTooltip5" class="tooltip" ref="regularTooltip5"
                                            style="display: none;">
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
                                    <v-col cols="1" class="d-flex flex-column align-items-center justify-center">
                                    </v-col>
                                    <v-col cols="11" class="pa-1" style="position: relative;">
                                        <div id="chart1" class='echarts' ref="chart1"
                                            style="height: 150px;width: 100%; ">
                                        </div>
                                        <!-- <div class="tooltip" ref="fixedTooltip1"
                                            :style="{ top: '0px', left: dragPosition.x + 'px' }">
                                        </div> -->
                                        <div id="regularTooltip1" class="tooltip" ref="regularTooltip1"
                                            style="display: none;">
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
                                    <v-col cols="1" class="d-flex flex-column align-items-center justify-center">
                                    </v-col>
                                    <v-col cols="11" class="pa-1" style="position: relative;">
                                        <div id="chart2" class='echarts' ref="chart2"
                                            style="height: 90px;width: 100%; ">
                                        </div>
                                        <!-- <div class="tooltip" ref="fixedTooltip2"
                                            :style="{ top: '60px', left: dragPosition.x + 'px' }">
                                        </div> -->
                                        <div id="regularTooltip2" class="tooltip" ref="regularTooltip2"
                                            style="display: none;">
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
                                    <v-col cols="1" class="d-flex flex-column align-items-center justify-center">
                                    </v-col>
                                    <v-col cols="11" class="pa-1" style="position: relative;">
                                        <div id="chart3" class='echarts' ref="chart3"
                                            style="height: 90px;width: 100%; ">
                                        </div>
                                        <!-- <div class="tooltip" ref="fixedTooltip2"
                                            :style="{ top: '60px', left: dragPosition.x + 'px' }">
                                        </div> -->
                                        <div id="regularTooltip3" class="tooltip" ref="regularTooltip3"
                                            style="display: none;">
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
                                    <v-col cols="1" class="d-flex flex-column align-items-center justify-center">
                                    </v-col>
                                    <v-col cols="11" class="pa-1" style="position: relative;">
                                        <div id="chart4" class='echarts' ref="chart4"
                                            style="height: 150px;width: 100%; ">
                                        </div>
                                        <div id="regularTooltip4" class="tooltip" ref="regularTooltip4"
                                            style="display: none;">
                                        </div>
                                    </v-col>
                                </v-row>
                            </div>
                        </div>
                    </v-col>





                </v-row>
            </v-col>
        </v-row>




    </div>
</template>

<script setup >
import { ref, onMounted, defineProps } from 'vue';
import * as echarts from 'echarts';

const { $getIpaddress } = useNuxtApp()
const props = defineProps({
    myProp: {
        type: String,
        required: true
    }
});


// 定义一个引用来绑定视频元素
const videoPlayer123 = ref(null)

// 定义一个状态来存储当前时间
const currentTime123 = ref(0)
// 定义一个状态来存储当前时间
const currentD = ref()
// 定义一个函数来更新当前时间
// const updateCurrentTime = () => {
//     currentTime123.value = videoPlayer123.value.currentTime
// }



let myChart1 = reactive({})
let myChart2 = reactive({})
let myChart3 = reactive({})
let myChart4 = reactive({})
let myChart5 = reactive({})


const data123 = ref('')
const vedioSrc = ref([]);
const vedioSrc2 = ref([]);

const echartData = ref([]);
const echartData2 = ref([])
const echartData3 = ref([])
const echartData4 = ref([])
const echartData5 = ref([])
const echartMarkArea = ref([])
const totalDuration = ref(0);
const headers = ref([
    { title: '發生位置', align: 'center', sortable: true, key: 'alarmEvent_occur_locationName' },
    { title: '偵測相機名稱', align: 'center', sortable: true, key: 'alarmEvent_cameraName' },
    { title: '預設點編號', align: 'center', sortable: true, key: 'alarmEvent_cursingPoint_name' },
    { title: '警報類型', align: 'center', sortable: true, key: 'alarmEvent_roi_alarmStatus' },
    { title: '最高溫度', align: 'center', sortable: true, key: 'alarmEvent_roi_maxTemperature' },
    { title: '警報閾值', align: 'center', sortable: true, key: 'alarmEvent_roi_threshold' },
    { title: '事件處理', align: 'center', sortable: true, key: 'alarmEvent_resolvedType' },
]);

const desserts = ref([
    {
        alarmEvent_occur_locationName: "室內掩埋區1",
        alarmEvent_cameraName: "FHR2",
        alarmEvent_cursingPoint_name: 123,
        alarmEvent_occur_gps: [0, 0],
        alarmEvent_roi_alarmStatus: 1,
        alarmEvent_roi_maxTemperature: 39.9,
        alarmEvent_roi_threshold: 39.9,
        alarmEvent_resolvedType: 1
    },
]);


const panels = reactive([
    { title: '警報事件', content: 'Content for Panel 1', isOpen: true },
    { title: 'ROI 溫度監測', content: 'Content for Panel 2', isOpen: true },
    { title: '動態偵測', content: 'Content for Panel 3', isOpen: true },
    { title: 'Dio 狀態', content: 'Content for Panel 4', isOpen: true },
]);

const togglePanel = (index) => {
    panels[index].isOpen = !panels[index].isOpen;
};

// function getEchartXAxis(e) {
//     const maxLength = 0;
//     const longestData = [];

//     e.value.forEach((item) => {
//         if (item.data.length > maxLength) {
//             maxLength = item.data.length;
//             longestData = item.data;
//         }
//     });

//     const result = longestData.map((_, index) => index);
//     return result
//     // console.log(result);
// }

function getEchartData(e) {
    let formate = [];

    for (let i = 0; i < e.value.length; i++) {
        let item = e.value[i];
        let seriesData = {
            name: item.roi_name,
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
                    formatter: '{a}: {@[1]}',
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

function getEchartDynamicData(e) {
    let formate = [];

    for (let i = 0; i < e.value.length; i++) {
        let item = e.value[i];
        let seriesData = {
            step: 'end',
            name: item.roi_name,
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
                    formatter: '{a}: {@[1]}',
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
            name: item.roi_name,
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
                        return `${params.seriesName}: ${params.value[1] === 1 ? 'ON' : 'OFF'}`;
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
            name: item.roi_name,
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



function fixedTooltip() {

}

const dragPosition = reactive({ x: 38.480000000000004, y: 0 });




function getOptionPoint() {
    return {
        graphic: {
            z: 100,
            type: 'circle',
            shape: {
                cx: 0,
                cy: 0,
                r: 10,
            },
            style: {
                fill: '#36619D',
            },
            top: 'center',
            position: [dragPosition.x, dragPosition.y],
            draggable: true,

            ondrag: function (event) {
                var xIndex = myChart5.convertFromPixel('grid', [
                    event.offsetX,
                    event.offsetY
                ])[0];
                xIndex = Math.round(xIndex);
                var newX = myChart5.convertToPixel('grid', [xIndex, 0])[0];
                this.position[0] = newX;
                // 當前


                //
                // this.position[1] = 0;
                dragPosition.x = newX;
                dragPosition.y = event.offsetY

                // myChart5.setOption({
                //   graphic: {
                //     elements: [this]
                //   }
                // });
            }

        },
    }
}









function getOption() {
    return {
        graphic:
            [
                {
                    type: 'group',
                    position: [dragPosition.x, dragPosition.y],

                    draggable: true,
                    // ondrag: function (event) {
                    //   dragPosition.x = event.offsetX;
                    //   dragPosition.y = 0;
                    // },
                    ondrag: function (event) {
                        var xIndex = myChart5.convertFromPixel('grid', [
                            event.offsetX,
                            event.offsetY
                        ])[0];
                        xIndex = Math.round(xIndex);
                        var newX = myChart5.convertToPixel('grid', [xIndex, 0])[0];
                        this.position[0] = newX;
                        console.log("sdssdds", xIndex);
                        // 當前

                        //
                        // this.position[1] = 0;
                        dragPosition.x = newX;





                        // dragPosition.y = 0

                        // myChart5.setOption({
                        //   graphic: {
                        //     elements: [this]
                        //   }
                        // });
                    },
                    children: [
                        {
                            type: 'rect',
                            left: 0,
                            top: 'center',
                            shape: {
                                width: 2,
                                height: 9999999,
                            },
                            style: {
                                fill: '#36619D',
                                // stroke: '#555',
                                // lineWidth: 1,
                                // shadowBlur: 8,
                                // shadowOffsetX: 3,
                                // shadowOffsetY: 3,
                                // shadowColor: 'rgba(0,0,0,0.2)'
                            },
                        },
                        // {
                        //   type: 'rect',
                        //   z: 100,
                        //   left: 'end',
                        //   top: 'middle',
                        //   shape: {
                        //     width: 240,
                        //     height: 90
                        //   },
                        //   style: {
                        //     fill: '#fff',
                        //     stroke: '#555',
                        //     lineWidth: 1,
                        //     shadowBlur: 8,
                        //     shadowOffsetX: 3,
                        //     shadowOffsetY: 3,
                        //     shadowColor: 'rgba(0,0,0,0.2)'
                        //   }
                        // },
                        // {
                        //   type: 'text',
                        //   z: 100,
                        //   left: 'end',
                        //   top: 90,
                        //   style: {
                        //     fill: '#333',
                        //     width: 220,
                        //     overflow: 'break',
                        //     text: JSON.stringify(dragPosition),
                        //     font: '14px Microsoft YaHei'
                        //   }
                        // }
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
        (remainingSeconds < 10 ? '0' : '') + remainingSeconds;

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
    myChart5.setOption(getOptionPoint());


};








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


const ws5 = ref()
const xIndex123 = ref()
function ws8704() {
    //! ws5



    ws5.value = new WebSocket(`ws://${$getIpaddress()}:8704`);
    ws5.value.onopen = () => {
        console.log("websocket 8704 命令/查詢通道 已連線!!!!!");

        ws5.value.send(
            JSON.stringify({
                "feature": "history_alarm",
                "method": "query_detail_overTempEvent",
                "content": {
                    "alarmEvent_filed_id": props.myProp.alarmEvent_filed_id,
                    "alarmEvent_id": props.myProp.alarmEvent_id
                },
                "session": "sckji8452s"
            })
        );
    };

    ws5.value.onmessage = (params1) => {
        var params = {
            data: JSON.parse(params1.data),
        };
        console.log("dskjsksk", params.data);
        vedioSrc.value = encodeBackslash(params.data.content.alarmEvent_video_URL.ir)
        vedioSrc2.value = encodeBackslash(params.data.content.alarmEvent_video_URL.vis)







        echartData.value = params.data.content.echart_roiTemp.echart_data
        echartData2.value = params.data.content.echart_dymanicMask.echart_data
        echartData3.value = params.data.content.echart_doStatus.echart_data
        echartData4.value = params.data.content.echart_dymanicMask.echart_data
        echartData5.value = params.data.content.echart_overallStatus.echart_data
        echartMarkArea.value = params.data.content.echart_overallStatus.markarea.data
        renderCharts()

        const charts = [myChart1, myChart2, myChart3, myChart4, myChart5];
        const echartDataSets = [echartData, echartData2, echartData3, echartData4, echartData5];

        charts.forEach((chart, index) => {
            chart.getZr().on('mousemove', params => {
                const pointInPixel = [params.offsetX, params.offsetY];
                if (chart.containPixel('grid', pointInPixel)) {
                    xIndex123.value = chart.convertFromPixel({ seriesIndex: 0 }, pointInPixel)[0];
                    // videoElement.currentTime = parseFloat(xIndex);
                    // currentTime123.value = Math.round(xIndex);


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
                        }
                    });

                }
            });
        });









    };
}


function encodeBackslash(input) {
    return input.replace(/\\/g, '%5C');
}


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


function setTo15() {
    // videoPlayer123.value.currentTime = 15
}


onMounted(() => {
    initCharts()
    ws8704()


    // 添加事件监听器

});


// watch(currentTime123, (newTime) => {
//     if (videoPlayer123.value) {
//         videoPlayer123.value.currentTime = newTime
//     } else {
//         updateCurrentTime()
//         // videoPlayer123.value.currentTime = newTime
//     }
// })


// watch(xIndex123, (newTime) => {
//     if (videoPlayer123.value) {
//         videoPlayer123.value.currentTime = newTime
//     } else {
//         updateCurrentTime()
//         // videoPlayer123.value.currentTime = newTime
//     }
// })




watch(dragPosition, (newPos) => {

    [myChart1, myChart2, myChart3, myChart4, myChart5].forEach((chart) => {
        chart.setOption({
            graphic: {
                position: [newPos.x, newPos.y],
            },
        });
    });
});
</script>
<style>
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
</style>

<style scoped>
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
</style>