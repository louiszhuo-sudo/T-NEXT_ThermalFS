<template>
    <div class="timeline-canvas">
        <div class="timeline-title d-flex justify-space-between align-center px-2">
            <div>
                標題 {{ state.eee }}
            </div>
            <div>
                <v-btn @click="state.selectST = true" :disabled="state.selectST">標記點</v-btn>
            </div>
        </div>
        <div class="timeline-context" @mousedown="notDef">
            <div>123 {{ state.selectRange }}</div>
            <div style="position: relative;">
                <div class="s-container" ref="container" @wheel.prevent="handleWheel" @mousedown="startDrag">
                    <div class="slider-container" ref="content" :style="style">
                        <div class="slider-handle" ref="handle"></div>
                        <div class="time-display" ref="time"></div>
                        <div class="slider-bar"></div>
                        <div class="slider-bar-cm"></div>
                        <!-- <div class="slider-select-ranger"></div> -->
                        <div ref="slider" id="slider-canvas"></div>
                    </div>
                </div>
                <div ref="echarts001" class="echarts001"></div>
            </div>
        </div>
    </div>
</template>
<script setup>
const echarts001 = ref('')
const slider = ref('')
const handle = ref('')
const time = ref('')
const emit = defineEmits(['getChildChart'])
const state = reactive({
    alarm: false,
    alarmRange: [],
    selectRange: [],
    eee: '',
    myChart: null,
    wkechatsItems: null,
    selectST: false,
    saveSelect: [null, null],
    tempDIV: null
})

const container = ref(null);
const content = ref(null);
const scale = ref(1);
const offsetX = ref(0);
const startX = ref(0);
const isDragging = ref(false);
const minScale = 1;
const maxScale = 10;
const style = computed(() => ({
    width: `${scale.value * 100}%`,
    left: `${offsetX.value}px`
}));
const temptimeSliderBar = ref({
    times: null, markers: null, cms: null, cmmarkers: null
})
const handleWheel = (event) => {
    const rect = container.value.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const newScale = Math.min(maxScale, Math.max(minScale, scale.value * (event.deltaY > 0 ? 0.9 : 1.1)));
    if (newScale === scale.value) return;

    const scaleFactor = newScale / scale.value;
    scale.value = newScale;
    renderTimeMarkers(Math.floor(150 * (newScale / maxScale)))
    let newOffsetX = mouseX - (mouseX - offsetX.value) * scaleFactor;
    // console.log(mouseX, newScale, newOffsetX);

    adjustOffset(newOffsetX);
    emitVisibleRange()
};
const notDef = (e) => {
    e.preventDefault()
}
const startDrag = (event) => {
    if (event.button === 1) {
        isDragging.value = true;
        startX.value = event.clientX;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
    }
};

const onDrag = (event) => {
    if (!isDragging.value) return;
    adjustOffset(offsetX.value + event.clientX - startX.value);
    emitVisibleRange();
    startX.value = event.clientX;
};

const stopDrag = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
};
const adjustOffset = (newOffsetX) => {
    const containerWidth = container.value.clientWidth;
    const contentWidth = scale.value * containerWidth;
    const maxOffset = 0;
    const minOffset = Math.min(0, containerWidth - contentWidth);
    offsetX.value = Math.min(maxOffset, Math.max(minOffset, newOffsetX));
};
const renderTimeMarkers = (Limit) => {
    slider.value.innerHTML = ""
    const sliderWidth = slider.value.offsetWidth;
    // time
    const markerLocation = [];

    // Calculate marker positions
    const widthHandle = sliderWidth / (temptimeSliderBar.times.length - 1);
    for (let i = 0; i < temptimeSliderBar.times.length; i++) {
        markerLocation.push(widthHandle * i);
    }

    const totalMarkers = Math.min(temptimeSliderBar.times.length, Limit); // Limit to 5 markers
    for (let i = 0; i < totalMarkers; i++) {
        const index = Math.round((i / (totalMarkers - 1)) * (temptimeSliderBar.times.length - 1));
        const markerElement = document.createElement('div');
        const markerTimeElement = document.createElement('div');
        markerElement.className = 'time-marker';
        markerElement.style.left = `${(markerLocation[index] / sliderWidth) * 100}%`;
        markerTimeElement.className = 'time-marker-text';
        markerTimeElement.innerHTML = temptimeSliderBar.times[index]
        // console.log('totleMarkers', markerLocation[index], times[index]);
        slider.value.appendChild(markerElement);
        slider.value.appendChild(markerTimeElement);
        const markerTimeElementWidth = markerTimeElement.offsetWidth;
        const markerTimeElementleft = i === 0 ? `${markerTimeElementWidth / 2}px` : i === totalMarkers - 1 ? `calc(${(markerLocation[index] / sliderWidth) * 100}% - ${markerTimeElementWidth / 2}px)` : `${(markerLocation[index] / sliderWidth) * 100}%`
        markerTimeElement.style.left = markerTimeElementleft;
    }
    // cm
    const markerLocationCm = [];

    const widthHandleCm = sliderWidth / (temptimeSliderBar.cms.length - 1);
    for (let i = 0; i < temptimeSliderBar.times.length; i++) {
        markerLocationCm.push(widthHandleCm * i);
    }

    const totalMarkersCm = Math.min(temptimeSliderBar.cms.length, Limit); // Limit to 5 markers
    for (let i = 0; i < totalMarkersCm; i++) {
        const index = Math.round((i / (totalMarkersCm - 1)) * (temptimeSliderBar.cms.length - 1));
        const markerElement = document.createElement('div');
        const markerTimeElement = document.createElement('div');
        markerElement.className = 'time-marker-cm';
        markerElement.style.left = `${(markerLocationCm[index] / sliderWidth) * 100}%`;
        markerTimeElement.className = 'time-marker-text-cm';
        markerTimeElement.style.left = `${(markerLocationCm[index] / sliderWidth) * 100}%`;
        markerTimeElement.innerHTML = temptimeSliderBar.cms[index]
        // console.log('totleMarkers', markerLocation[index], times[index]);
        slider.value.appendChild(markerElement);
        slider.value.appendChild(markerTimeElement);
    }
    const renderMarkers = () => {
        // time
        const times = temptimeSliderBar.times
        const markers = temptimeSliderBar.markers;
        const cms = temptimeSliderBar.cms
        const cmmarkers = temptimeSliderBar.cmmarkers
        state.alarmRange = []
        markers.forEach(marker => {
            const markerElement12 = document.createElement('div');
            const startPercentage = times.indexOf(marker.start.toString()) / (times.length - 1);
            const endPercentage = times.indexOf(marker.end.toString()) / (times.length - 1);
            markerElement12.className = marker.type === "marker" ? 'slider-marker' : 'slider-empty';
            markerElement12.style.left = `${startPercentage * 100}%`;
            markerElement12.style.width = `${(endPercentage - startPercentage) * 100}%`;
            slider.value.appendChild(markerElement12);
            state.alarmRange.push([times.indexOf(marker.start.toString()), times.indexOf(marker.end.toString())])
        });
        // cm
        cmmarkers.forEach(marker => {
            const markerElement = document.createElement('div');
            const startPercentage = cms.indexOf(marker.start.toString()) / (cms.length - 1);
            const endPercentage = cms.indexOf(marker.end.toString()) / (cms.length - 1);

            markerElement.className = marker.type === "marker" ? 'slider-marker-cm' : 'slider-empty-cm';;
            markerElement.style.left = `${startPercentage * 100}%`;
            markerElement.style.width = `${(endPercentage - startPercentage) * 100}%`;

            slider.value.appendChild(markerElement);
        });
        // select
        state.selectRange.forEach(marker => {
            const markerElement12 = document.createElement('div');
            markerElement12.className = 'slider-select-ranger';
            markerElement12.style.left = `${marker[0] * 100}%`;
            markerElement12.style.width = `${(marker[1] - marker[0]) * 100}%`;
            slider.value.appendChild(markerElement12);
        })
        if (state.tempDIV !== null) {
            const markerElement12 = document.createElement('div');
            markerElement12.className = 'slider-select-ranger';
            markerElement12.style.left = `${state.saveSelect[0] * 100}%`;

            markerElement12.style.width = state.saveSelect[1] === null ? `0%` : `${(state.saveSelect[1] - state.saveSelect[0]) * 100}%`;
            state.tempDIV = markerElement12
            slider.value.appendChild(markerElement12);
        }

    }
    renderMarkers()
}
const emitVisibleRange = () => {
    const times = temptimeSliderBar.times;
    if (!times || times.length <= 1) return;

    const containerWidth = container.value.clientWidth;
    const totalPoints = times.length;

    // slider 實際長度是 scale 倍的 container
    const sliderWidth = containerWidth * scale.value;

    // 可視區在 slider 內的位置（正數）
    const visibleStartX = -offsetX.value;
    const visibleEndX = visibleStartX + containerWidth;

    // 對應的比例（0~1），再換成 index
    const startRatio = visibleStartX / sliderWidth;
    const endRatio = visibleEndX / sliderWidth;

    const startIndex = Math.max(0, Math.floor(startRatio * (totalPoints - 1)));
    const endIndex = Math.min(totalPoints - 1, Math.ceil(endRatio * (totalPoints - 1)));

    // ⏰ Log 或 emit
    state.eee = `可視 index：${startIndex} ~ ${endIndex}` + `可視時間：${times[startIndex]} ~ ${times[endIndex]}`
    // console.log(`👁️ 可視 index：${startIndex} ~ ${endIndex}`);
    // console.log(`⏰ 可視時間：${times[startIndex]} ~ ${times[endIndex]}`);
    if (state.wkechatsItems !== null) {
        let startPercent = (startIndex / (times.length - 1)) * 100
        let endPercent = (endIndex / (times.length - 1)) * 100
        // state.myChart.setOption({
        //     dataZoom: [{
        //         type: 'inside', // 或 'inside'
        //         start: startPercent,  // 對應 data 的百分比，這邊會解釋怎麼用 index
        //         end: endPercent
        //     }]
        // });
        state.wkechatsItems.postMessage({
            type: 'datazoom',
            parameter: {
                dataZoom: [{
                    type: 'inside', // 或 'inside'
                    start: startPercent,  // 對應 data 的百分比，這邊會解釋怎麼用 index
                    end: endPercent
                }]
            }
        })
    }

    // 如果是 Vue 組件你可以用 emit：
    // emit('getChildChart', { startIndex, endIndex, startTime: times[startIndex], endTime: times[endIndex] })
}
const timeSliderBar = (times, markers, cms, cmmarkers, Limit = 15) => {
    temptimeSliderBar.times = times;
    temptimeSliderBar.markers = markers;
    temptimeSliderBar.cms = cms;
    temptimeSliderBar.cmmarkers = cmmarkers;
    slider.value.innerHTML = ''
    // Predefined times for the slider
    // const sliderWidth = slider.value.offsetWidth;
    let isDragging = false;
    // state.tempDIV = null

    document.addEventListener('mousemove', (event) => {
        if (isDragging || state.selectST) {
            updateHandlePosition(event, false); // 跟隨滑鼠移動，不吸附
            if (state.selectST) {
                selectRanger(event, false, true)
            }
        }
    });

    document.addEventListener('mouseup', (event) => {
        if (isDragging) {
            updateHandlePosition(event, true); // 放開時吸附到最近 time
            isDragging = false;
        }
    });

    handle.value.addEventListener('mousedown', (event) => {
        if (event.button === 0) {
            isDragging = true;
        }
    });

    handle.value.addEventListener('mouseover', () => {
        const handleRect = handle.value.getBoundingClientRect();
        handle.value.style.transform = `translate(-${handleRect.width / 2}px, 0px)`;
    });

    handle.value.addEventListener('mouseout', () => {
        handle.value.style.transform = `translate(0px, 0px)`;
    });

    content.value.addEventListener('mousedown', (event) => {
        if (event.button === 0) {
            isDragging = true;
            updateHandlePosition(event);
            if (state.selectST) {
                selectRanger(event, false, false)
            }
        }
    });

    const renderMarkers = () => {
        // time
        state.alarmRange = []
        markers.forEach(marker => {
            const markerElement12 = document.createElement('div');
            const startPercentage = times.indexOf(marker.start.toString()) / (times.length - 1);
            const endPercentage = times.indexOf(marker.end.toString()) / (times.length - 1);
            markerElement12.className = marker.type === "marker" ? 'slider-marker' : 'slider-empty';
            markerElement12.style.left = `${startPercentage * 100}%`;
            markerElement12.style.width = `${(endPercentage - startPercentage) * 100}%`;
            slider.value.appendChild(markerElement12);
            state.alarmRange.push([times.indexOf(marker.start.toString()), times.indexOf(marker.end.toString())])
        });
        // cm
        cmmarkers.forEach(marker => {
            const markerElement = document.createElement('div');
            const startPercentage = cms.indexOf(marker.start.toString()) / (cms.length - 1);
            const endPercentage = cms.indexOf(marker.end.toString()) / (cms.length - 1);

            markerElement.className = marker.type === "marker" ? 'slider-marker-cm' : 'slider-empty-cm';
            markerElement.style.left = `${startPercentage * 100}%`;
            markerElement.style.width = `${(endPercentage - startPercentage) * 100}%`;

            slider.value.appendChild(markerElement);
        });
    }
    function updateHandlePosition(event, snap = false) {
        const sliderWidth = slider.value.offsetWidth;
        const rect = slider.value.getBoundingClientRect();
        const handleRect = handle.value.getBoundingClientRect();

        // 滑鼠在 slider 上的 x 相對座標
        let x = event.clientX - rect.left;

        // 限制在 slider 範圍內
        x = Math.max(0, Math.min(x, sliderWidth - (snap ? 0 : handleRect.width / 2)));

        // 計算 index
        const percentage = x / sliderWidth;
        const index = Math.round(percentage * (times.length - 1));

        // 若 snap 為 true，則吸附到格點位置
        const finalX = snap
            ? (index / (times.length - 1)) * sliderWidth
            : x;

        // 切換動畫
        handle.value.style.transition = snap ? 'left 0.05s ease' : 'left 0s ease';

        // 設定位置與時間
        const leftPercent = (finalX / sliderWidth) * 100;
        handle.value.style.left = `${leftPercent}%`;
        time.value.style.left = `${leftPercent}%`;
        time.value.textContent = times[index];
    }
    function selectRanger(event, snap = false, draging = false) {
        const startPercentage = handleSelect(event, snap)
        if (state.saveSelect[0] === null && state.saveSelect[1] === null && !draging) {
            state.saveSelect[0] = startPercentage
            const markerElement12 = document.createElement('div');
            markerElement12.className = 'slider-select-ranger';
            markerElement12.style.left = `${state.saveSelect[0] * 100}%`;
            markerElement12.style.width = `0%`;
            state.tempDIV = markerElement12
            slider.value.appendChild(markerElement12);
        } else if (state.saveSelect[0] !== null && state.saveSelect[1] !== null && !draging) {
            state.saveSelect[1] = startPercentage
            const markerElement12 = state.tempDIV;
            // markerElement12.className = 'slider-select-ranger';
            // markerElement12.style.left = `${saveSelect[0] * 100}%`;
            markerElement12.style.width = `${(state.saveSelect[1] - state.saveSelect[0]) * 100}%`;
            // console.log('startPercentage', saveSelect);
            state.saveSelect.sort((a, b) => a - b);
            state.selectRange.push(state.saveSelect)
            state.saveSelect = [null, null]
            state.selectST = false
            state.tempDIV = null
        }
        if (state.saveSelect[0] !== null && draging) {
            state.saveSelect[1] = startPercentage
            const markerElement12 = state.tempDIV;
            if (startPercentage - state.saveSelect[0] <= 0) {
                markerElement12.style.left = `${startPercentage * 100}%`;
                markerElement12.style.width = `${-(startPercentage - state.saveSelect[0]) * 100}%`; // 負負得正
            } else {
                markerElement12.style.width = `${(startPercentage - state.saveSelect[0]) * 100}%`;
            }
        }
    }
    function handleSelect(event, snap) {
        const sliderWidth = slider.value.offsetWidth;
        const rect = slider.value.getBoundingClientRect();
        const handleRect = handle.value.getBoundingClientRect();
        let x = event.clientX - rect.left;
        x = Math.max(0, Math.min(x, sliderWidth - (snap ? 0 : handleRect.width / 2)));
        const percentage = x / sliderWidth;
        const index = Math.round(percentage * (times.length - 1));
        // state.tes = times[index];
        const startPercentage = times.indexOf(times[index].toString()) / (times.length - 1);
        return startPercentage
    }
    renderTimeMarkers(Limit)
    renderMarkers();

    // Ensure slider width is updated on window resize
    // window.addEventListener('resize', () => {
    //     const newWidth = slider.offsetWidth;
    // });
}
onMounted(() => {
    scale.value = 1;
    offsetX.value = 0;
    let mock = {
        time: [],
        series: [
            {
                name: "測試一",
                marker: [
                    {
                        "start": "M_20",
                        "end": "M_50",
                        "type": "marker"

                    }, {
                        "start": "M_70",
                        "end": "M_100",
                        "type": "empty"
                    }
                ]
            }, {
                name: "測試二",
                marker: [
                    {
                        "start": "M_70",
                        "end": "M_80",
                        "type": "marker"

                    }, {
                        "start": "M_130",
                        "end": "M_150",
                        "type": "empty"
                    }
                ]
            }
        ]
    }
    let test = []
    let test01 = []
    for (var i = 0; i < 810; i++) {
        mock.time.push('M_' + i)
        test.push('M_' + i)
        test01.push(Math.floor(Math.random() * 500))
    }
    let alarm_dnd = [
        {
            "start": "M_20",
            "end": "M_50",
            "type": "marker"

        }, {
            "start": "M_70",
            "end": "M_100",
            "type": "empty"
        }
    ]
    timeSliderBar(test, alarm_dnd, test, alarm_dnd)

    const createChartsCanvas = () => {
        const div = echarts001.value;
        let canvas = document.createElement("canvas");
        canvas.style.position = "absolute"
        canvas.style.top = "0px"
        canvas.style.left = "0px"
        canvas.style.height = '100%'
        canvas.style.width = '100%'
        div.appendChild(canvas)
        let tempwk = null
        const runEchartsWebworker = () => {
            tempwk = new Worker('/worker/wkEcharts.js');
            state.wkechatsItems = tempwk
            tempwk.addEventListener('message', (e) => {
                let res = e.data
                let type = res.type
                if (type === 'open') {
                    // console.log('開啟worker');
                    tempwk.postMessage({
                        type: 'start',
                        parameter: {
                            data: [test, test01]
                        }
                    })
                    let width = canvas.getBoundingClientRect().width
                    let height = canvas.getBoundingClientRect().height
                    const offscreen01 = canvas.transferControlToOffscreen();
                    tempwk.postMessage({
                        type: 'canvas',
                        canvas: offscreen01,
                        width,
                        height
                    }, [offscreen01])
                } else if (type === 'close') {
                    tempwk.terminate();
                    tempwk = null
                    canvas.remove();
                    // 確保刪除事件處理器和其他引用
                    canvas.innerHTML = null; // 清空子節點內容
                    canvas = null; // 解除引用，便於垃圾回收
                    setTimeout(() => {
                        createChartsCanvas(key)
                    }, 1)
                }
                res = null
                type = null
            })
        }
        runEchartsWebworker()
    }
    createChartsCanvas()
    // let canvas = document.createElement("canvas");
    // canvas.style.position = "absolute"
    // canvas.style.top = "0px"
    // canvas.style.left = "0px"
    // const rect = echarts001.value.getBoundingClientRect();
    // canvas.width = rect.width;
    // canvas.height = rect.height;
    // echarts001.value.appendChild(canvas)

    // var chartDom = canvas;
    // var myChart = echarts.init(chartDom);
    // var option;

    // option = {
    //     animation: false,  // 全部動畫都關閉
    //     xAxis: {
    //         type: 'category',
    //         data: test
    //     },
    //     dataZoom: [{
    //         type: 'inside', // 或 'slider' 看你需不需要顯示滑軸
    //         start: 0,
    //         end: 100
    //     }],
    //     grid: {
    //         show: false,
    //         top: '20',
    //         bottom: '30',
    //         right: '10',
    //         left: '40',
    //     },
    //     yAxis: {
    //         type: 'value'
    //     },
    //     series: [
    //         {
    //             data: test01,
    //             type: 'line'
    //         }
    //     ]
    // };

    // option && myChart.setOption(option);
    // state.myChart = myChart
})

onUnmounted(() => {
    console.log('HistroyRes Unmounted');
})
</script>
<style scoped>
.histroy-canvas {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 60% 40%;
}

.histroy-canvas>div {
    height: 100%;
    width: 100%;
    /* overflow: auto; */
}

.histroy-rows {
    display: grid;
    height: 100%;
    grid-template-rows: 60% 40%;
}

/* 時間軸 */
.timeline-canvas {
    width: 100%;
    height: 100%;
    background-color: #EAEAEA;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
}

.timeline-title {
    width: 100%;
    height: 40px;
    border-bottom: 1px #8b8b8b solid;
}

.timeline-context {
    display: grid;
    grid-template-columns: 20% 80%;
    height: 100%;
    overflow: auto;
}


.s-container {
    /* position: relative;
    width: calc(100%);
    overflow: hidden;
    height: 100%;
    padding-left: 36px; */
    position: relative;
    width: calc(100% - 36px);
    overflow: hidden;
    min-height: 400px;
    margin-left: 36px;
}

.slider-container-ps {
    width: 25px;
    font-size: 12px;
}

.slider-container {
    position: absolute;
    width: 100%;
    /* width: calc(100% - 120px); */
    /* max-width: 800px; */
    /* height: 70px; */
    background: #ffffff00;
    border-radius: 5px;
    height: 100%;
    cursor: cell;
    /* overflow: hidden; */
}

.slider-bar {
    position: absolute;
    left: 0;
    width: 100%;
    height: 24px;
    top: 165px;
    transform: translate(0px, -50%);
    background: #D9D9D9;
    cursor: pointer;
    z-index: 1;
}


.slider-handle {
    position: absolute;
    top: 6%;
    left: 0;
    width: 3px;
    height: 100%;
    background: #656565;
    cursor: pointer;
    transition: width .3s, transform .3s;
    z-index: 4;
}

.slider-handle:hover {
    width: 5px;
    /* transform: translate(-5px, 0px); */
}

/* 時間軸 END */
.echarts001 {
    width: 100%;
    height: 150px;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
}
</style>

<style>
/* 時間軸 */
.time-marker {
    position: absolute;
    top: 165px;
    transform: translate(0px, -50%);
    height: 24px;
    width: 1px;
    background: #939393;
    z-index: 3;
}

.time-marker-text {
    position: absolute;
    top: 138px;
    transform: translate(0px, -50%);
    height: 24px;
    width: 2px;
    /* background: rgba(0, 0, 0, 0.8); */
    z-index: 3;
    transform: translate(-50%, 0px);
    width: -moz-fit-content;
    width: fit-content;
    font-size: 11px;
    white-space: nowrap;
}

.slider-bar-cm {
    position: absolute;
    left: 0;
    width: 100%;
    height: 24px;
    top: 194px;
    transform: translate(0px, -50%);
    background: #D9D9D9;
    z-index: 1;
}



.time-marker-text-cm {
    position: absolute;
    top: 207px;
    transform: translate(0px, -50%);
    height: 24px;
    width: 2px;
    /* background: rgba(0, 0, 0, 0.8); */
    z-index: 3;
    transform: translate(-50%, 0px);
    width: -moz-fit-content;
    width: fit-content;
    font-size: 11px;
    white-space: nowrap;
}

.time-display {
    position: absolute;
    transform: translate(-50%, -33%);
    top: 2%;
    left: 0;
    width: -moz-fit-content;
    width: fit-content;
    z-index: 2;
    white-space: nowrap;
}

.slider-marker {
    position: absolute;
    top: 153px;
    height: 24px;
    background: #FF9494;
    z-index: 2;
    pointer-events: none;
}

.slider-empty {
    position: absolute;
    top: 153px;
    height: 24px;
    background: #ffffff;
    z-index: 2;
    pointer-events: none;
}

.slider-marker-cm {
    position: absolute;
    top: 182px;
    height: 24px;
    background: #FF9494;
    z-index: 2;
    pointer-events: none;
}

.slider-empty-cm {
    position: absolute;
    top: 182px;
    height: 24px;
    background: #ffffff;
    z-index: 2;
    pointer-events: none;
}

.slider-select-ranger {
    position: absolute;
    left: 100px;
    width: 30%;
    height: 100%;
    top: 2%;
    background: #ffff0000;
    border: 4px dashed #64D6FF;
    /* 粗細、樣式、顏色 */
    /* background: #ffff0077; */
    cursor: pointer;
    z-index: 1;
}

/* 時間軸 END */
</style>