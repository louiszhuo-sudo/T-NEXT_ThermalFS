<template>
    <div class="timeline-canvas">
        <div class="timeline-title d-flex justify-space-between align-center px-2">
            <div>
                標題
                <!-- {{ state.eee }} -->
            </div>
            <div class="d-flex">
                <v-btn v-if="editTimehandleBarSwitch !== null" @click="setLabelindex('delete')">
                    刪除
                </v-btn>
                <v-btn v-if="editTimehandleBarSwitch !== null" @click="setLabelindex('close')">
                    取消編輯
                </v-btn>
                <v-btn v-if="editTimehandleBarSwitch !== null" @click="setLabelindex('save')">
                    儲存
                </v-btn>
                <div style="width: 30px;height: 30px;" class="mr-2"
                    :style="state.lableST || editTimehandleBarSwitch !== null ? 'pointer-events: none;opacity: 0.5;' : ''">
                    <v-btn @click="state.lableST = true" flat block color="#ffffff00">
                        <img src="/images/icon/placeholder-filled-point.png" style="width: 20px;height: 20px;" />
                    </v-btn>
                </div>
                <div style="width: 30px;height: 30px;" class="mr-2"
                    :style="state.lableST || editTimehandleBarSwitch !== null ? 'pointer-events: none;opacity: 0.5;' : ''">
                    <v-btn @click="state.selectST = true" flat block color="#ffffff00">
                        <img src="/images/icon/range.png" style="width: 20px;height: 20px;" />
                    </v-btn>
                </div>
                <div style="width: 30px;height: 30px;" class="mr-2"
                    :style="state.lableST || editTimehandleBarSwitch !== null ? 'pointer-events: none;opacity: 0.5;' : ''">
                    <v-btn flat block color="#ffffff00">
                        <img src="/images/icon/logout.png" style="width: 20px;height: 20px;" />
                    </v-btn>
                </div>
            </div>
        </div>
        <div class="timeline-context" @mousedown="notDef" ref="timelineContext">
            <div class="d-flex flex-column" style="position: relative;">
                <div style="height: 199px;" class="timeline-name">
                    <!-- 圖表 -->
                </div>
                <div v-for="(item, index) in state.sliderList" :key="index" style="height: 90px;"
                    class="timeline-name flag-label-slider c1976d2">
                    {{ item.name }}
                </div>
            </div>
            <div style="position: relative;">
                <div class="s-container" ref="container" @wheel.prevent="handleWheel" @mousedown="startDrag">
                    <div class="slider-container" ref="content" :style="style">
                        <div class="slider-handle-vr" ref="handleVR" style="opacity: 0;"></div>
                        <div class="slider-handle-vrx" ref="handleVRx" style="opacity: 0;"></div>
                        <div class="slider-handle" ref="handle"></div>
                        <div class="time-display" ref="time"></div>
                        <div class="slider-et"></div>
                        <template v-for="(item, index) in state.lables" :key="index">
                            <div class="slider-label" :style="getItemLocation(item)"
                                :class="editTimehandleBarSwitch === null ? '' : item.name === editTimehandleBarSwitch?.name ? 'label-foucs' : 'label-lock'"
                                @mousedown="lableMousedown(index, item)">
                            </div>
                            <div class="slider-label-text" :style="getItemLocation(item)"
                                @mousedown="lableMousedown(index, item)"
                                :class="editTimehandleBarSwitch === null ? '' : item.name === editTimehandleBarSwitch?.name ? 'label-foucs' : 'label-lock'">
                                {{
                                    item.name }}</div>
                            <div class="slider-label-text-2" :style="getItemLocation(item)" v-if="editTimehandleBarSwitch === null ? false : item.name ===
                                editTimehandleBarSwitch?.name ? true : false" @mousedown="lableMousedown(index, item)"
                                :class="'label-foucs'">
                                {{ item.date }}</div>
                        </template>
                        <template v-if="state.clonelable.length > 0">
                            <div class="slider-label-clone" :style="getItemLocation(state.clonelable[0])"></div>
                            <div class="slider-label-text-clone" :style="getItemLocation(state.clonelable[0])">
                                {{
                                    state.clonelable[0].date }}</div>
                        </template>
                    </div>
                </div>
                <div ref="echarts001" class="echarts001">
                    <div class="controls-content">
                        <div id="controls"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
const editTimehandleBarSwitch = useState('editTimehandleBarSwitch')
const echarts001 = ref('')
const slider = ref('')
const handleVR = ref('')
const handleVRx = ref('')
const handle = ref('')
const time = ref('')
const sliderContent = ref('')
const emit = defineEmits(['addlable', 'sendseries', 'setUpdateImg'])
const proups = useAttrs().mainData

const state = reactive({
    alarm: false,
    // alarmRange: [],
    selectRange: [],
    eee: '',
    myChart: null,
    wkechatsItems: null,
    selectST: false,
    lableST: false,
    saveSelect: [null, null],
    tempDIV: null,
    sliderList: [],
    eventLable: null,
    lables: [],
    clonelable: [],
    selectLable: null,
    tempSaveLableIndex: ''
})
const timeSliderBarFunction = ref(null)
const tempOffsetX = ref(0);
const container = ref(null);
const content = ref(null);
const scale = ref(1);
const offsetX = ref(0);
const startX = ref(0);
const isDragging = ref(false);
const minScale = 1;
const maxScale = 1000;
const style = computed(() => ({
    width: `${scale.value * 100}%`,
    left: `${offsetX.value}px`
}));
const timelineContext = ref(null)
const temptimeSliderBar = reactive({
    times: [],
    series: []
})
watch(
    () => proups.lables,
    (data, prevData) => {
        console.log('proups.lables', proups.lables);
        state.lables = data
        setTimeout(() => {
            const divs = document.querySelectorAll('.slider-label-text')
            console.log('content.value.scrollTop', timelineContext.value.scrollTop);
            divs.forEach((div) => {
                div.style.top = timelineContext.value.scrollTop + 'px'
            })
        }, 100)
    }
)
const lableMousedown = (index, item) => {
    // 加入分身
    state.eventLable = index
    if (state.clonelable.length <= 0) {
        state.clonelable = item
        state.tempSaveLableIndex = JSON.parse(JSON.stringify(state.lables))
        let temp = JSON.parse(JSON.stringify(item))
        temp.name = item.name
        state.clonelable[0] = temp
    }
    // let cloneIndex = state.lables.findIndex((item) => item.clone === true)
    // if (cloneIndex === -1) {
    //     state.tempSaveLableIndex = JSON.parse(JSON.stringify(state.lables))
    //     let temp = JSON.parse(JSON.stringify(item))
    //     temp.clone = true
    //     temp.name = ''
    //     temp.olduid = item.uid
    //     state.lables.push(temp)
    // }
    emit('highlightlable', { type: 'slider', name: item.name, data: item })
    // state.selectLable = item.uid
}
const setLabelindex = (e) => {
    if (e === 'close') {
        // state.lables =
        emit('closeChangelable', state.tempSaveLableIndex)
        state.clonelable = []
    } else if (e === 'delete') {
        // console.log('delete', state.lables.filter((item) => item.clone === true));
        // let tempDate = state.lables.filter((item) => item.clone === true)
        // if (tempDate !== undefined) {
        emit('removelable', state.clonelable[0].name)
        // }
        // console.log('delete', tempDate)
        state.lables = []
        state.clonelable = []
    } else if (e === 'save') {
        // state.lables = state.lables.filter((item) => item.clone === false)
    }
    // state.lables = state.lables.filter((item) => item.clone === true)
    // timeSliderBarFunction.value.updateHandlePosition({ clientX: 0 }, false)
    // console.log(state.lables);

    editTimehandleBarSwitch.value = null
    state.tempSaveLableIndex = []
    // state.selectLable = null
}
const getItemLocation = (item) => {
    const lable = item
    const times = temptimeSliderBar.times
    let style = {
        left: 0
    }
    const startPercentage = times.indexOf(lable.date.toString()) / (times.length - 1);
    style.left = `${startPercentage * 100}%`
    return style
}
const onScroll = (event) => {
    time.value.style.top = event.scrollTop + 'px'
    echarts001.value.style.top = event.scrollTop + 'px'
    const divs = document.querySelectorAll('.slider-label-text')
    divs.forEach((div) => {
        div.style.top = event.scrollTop + 'px'
    })
    const divs2 = document.querySelectorAll('.slider-label-text-2')
    divs2.forEach((div) => {
        div.style.top = event.scrollTop + 'px'
    })
}
let animationFrame1;
const handleWheel = (event) => {
    if (event.ctrlKey) {
        const rect = container.value.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const newScale = Math.min(maxScale, Math.max(minScale, scale.value * (event.deltaY > 0 ? 0.9 : 1.1)));
        // test
        const times = temptimeSliderBar.times;
        if (!times || times.length <= 1) return;
        const containerWidth = container.value.clientWidth;
        const totalPoints = times.length;
        const sliderWidth = containerWidth * newScale;
        const visibleStartX = -offsetX.value;
        const visibleEndX = visibleStartX + containerWidth;
        const startRatio = visibleStartX / sliderWidth;
        const endRatio = visibleEndX / sliderWidth;

        const startIndex = Math.max(0, Math.floor(startRatio * (totalPoints - 1)));
        const endIndex = Math.min(totalPoints - 1, Math.ceil(endRatio * (totalPoints - 1)));
        const newLimt = Math.max(endIndex - startIndex, 5);
        state.eee = `可視 index：${startIndex} ~ ${endIndex}` + `可視時間：${times[startIndex]} ~ ${times[endIndex]} ,可視數量 ${endIndex - startIndex} , ${newScale} , ${newLimt}`        // 
        if (newLimt === 5) return;
        // test
        if (newScale === scale.value) return;
        const scaleFactor = newScale / scale.value;
        scale.value = newScale;
        state.sliderList.forEach((item) => {
            renderTimeMarkers(item, Math.floor(150 * (newScale / maxScale)))
        })
        let newOffsetX = mouseX - (mouseX - offsetX.value) * scaleFactor;
        // console.log(mouseX, newScale, newOffsetX); 

        adjustOffset(newOffsetX);
        emitVisibleRange()
    } else {
        // 控制 scrollTop（加上或減去 delta）
        // timelineContext.value.scrollTop += delta;
        // if (timelineContext.value !== null) {
        //     const div = timelineContext.value;
        //     targetScrollTop += e.deltaY; // 累加目標位置
        //     targetScrollTop = Math.max(0, Math.min(div.scrollHeight - div.clientHeight, targetScrollTop));
        // }
        // if (!animationFrame1) smoothScroll();
        // function smoothScroll() {
        //     const current = div.scrollTop;
        //     const distance = targetScrollTop - current;

        //     div.scrollTop = current + distance * 0.1; // 0.1 是緩動速度

        //     if (Math.abs(distance) > 0.5) {
        //         animationFrame1 = requestAnimationFrame(smoothScroll);
        //     } else {
        //         div.scrollTop = targetScrollTop;
        //         animationFrame1 = null;
        //     }
        // }
    }
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
    // console.log(event.clientX);
    // const div = document.querySelectorAll('.slider-label')
    // console.log(div[1].getBoundingClientRect().left);

    adjustOffset(offsetX.value + event.clientX - startX.value); // 滑動設定
    tempOffsetX.value = offsetX.value + event.clientX - startX.value
    emitVisibleRange(); // 控制webworker echarts
    startX.value = event.clientX;
};
// 測試
let animationFrameId = null;

const easeInOutQuad = (t) => {
    return t < 0.5
        ? 2 * t * t
        : -1 + (4 - 2 * t) * t;
}

const animateOffset = (from, to, duration = 300) => {
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const t = Math.min(elapsed / duration, 1); // [0,1]
        const easedT = easeInOutQuad(t);
        const currentValue = from + (to - from) * easedT;

        adjustOffset(currentValue);
        emitVisibleRange();
        if (t < 1) {
            animationFrameId = requestAnimationFrame(step);
        } else {
            tempOffsetX.value = to; // 動畫結束，更新 temp
        }
    }

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); // 取消前一個動畫
    }

    animationFrameId = requestAnimationFrame(step);
}

// 模擬 re 值每秒更新一次
// 測試結束
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
    // console.log('sliderWidth', newOffsetX, containerWidth, contentWidth, maxOffset, minOffset, Math.min(maxOffset, Math.max(minOffset, newOffsetX)));

};
const renderTimeMarkers = (data, Limit) => {
    let dom = data.DOM
    dom.slider1.innerHTML = ""
    const sliderWidth = content.value.offsetWidth;
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
        dom.slider1.appendChild(markerElement);
        dom.slider1.appendChild(markerTimeElement);
        const markerTimeElementWidth = markerTimeElement.offsetWidth;
        const markerTimeElementleft = i === 0 ? `${markerTimeElementWidth / 2}px` : i === totalMarkers - 1 ? `calc(${(markerLocation[index] / sliderWidth) * 100}% - ${markerTimeElementWidth / 2}px)` : `${(markerLocation[index] / sliderWidth) * 100}%`
        markerTimeElement.style.left = markerTimeElementleft;
    }
    // cm
    const markerLocationCm = [];

    const widthHandleCm = sliderWidth / (temptimeSliderBar.times.length - 1);
    for (let i = 0; i < temptimeSliderBar.times.length; i++) {
        markerLocationCm.push(widthHandleCm * i);
    }

    const totalMarkersCm = Math.min(temptimeSliderBar.times.length, Limit); // Limit to 5 markers
    for (let i = 0; i < totalMarkersCm; i++) {
        const index = Math.round((i / (totalMarkersCm - 1)) * (temptimeSliderBar.times.length - 1));
        const markerElement = document.createElement('div');
        const markerTimeElement = document.createElement('div');
        markerElement.className = 'time-marker-cm';
        markerElement.style.left = `${(markerLocationCm[index] / sliderWidth) * 100}%`;
        // markerTimeElement.className = 'time-marker-text-cm';
        // markerTimeElement.style.left = `${(markerLocationCm[index] / sliderWidth) * 100}%`;
        // markerTimeElement.innerHTML = temptimeSliderBar.times[index]
        // console.log('totleMarkers', markerLocation[index], times[index]);
        dom.slider1.appendChild(markerElement);
        // dom.slider1.appendChild(markerTimeElement);
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
    // renderMarkers()
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

const timeSliderBar = (data, Limit = 15) => { // 時間軸核心程式
    temptimeSliderBar.times = data.times;
    temptimeSliderBar.series = data.series;
    let times = data.times
    let sliderList = data.series
    let cHeight = 199 + (sliderList.length * 90)

    // console.log(times, data.times);
    container.value.style.minHeight = `${cHeight}px`
    // 

    // 
    // slider.value.innerHTML = ''
    // Predefined times for the slider
    // const sliderWidth = slider.value.offsetWidth;
    let isDragging = false;
    let overcontent = false
    // state.tempDIV = null

    document.addEventListener('mousemove', (event) => {
        if (isDragging || state.selectST && editTimehandleBarSwitch.value === null) {
            updateHandlePosition(event, false); // 跟隨滑鼠移動，不吸附
            if (state.selectST) {
                selectRanger(event, false, true)
            }
        }
        if (state.eventLable !== null) {
            let timedate = getSelectDate(event)
            let analyze1 = analyzeEvents(timedate, state.sliderList)
            state.lables[state.eventLable].date = timedate
            state.lables[state.eventLable].alarm_smoke = analyze1.smoke
            state.lables[state.eventLable].alarm = analyze1.alarm
        }
        if (overcontent) {
            updateHandleVRPosition(event)
        }
    });

    document.addEventListener('mouseup', (event) => {
        if (isDragging) {
            updateHandlePosition(event, true); // 放開時吸附到最近 time
            isDragging = false;
        }
        state.eventLable = null
    });

    handle.value.addEventListener('mousedown', (event) => {  // 監聽當前時間條
        if (event.button === 0 && editTimehandleBarSwitch.value === null) {
            isDragging = true;
        }
    });

    handle.value.addEventListener('mouseover', () => { // 監聽當前時間條
        const handleRect = handle.value.getBoundingClientRect();
        handle.value.style.transform = `translate(-${handleRect.width / 2}px, 0px)`;
    });

    handle.value.addEventListener('mouseout', () => { // 監聽當前時間條
        handle.value.style.transform = `translate(0px, 0px)`;
    });
    content.value.addEventListener('mouseover', (event) => { // 監聽時間軸總容器
        handleVR.value.style.opacity = '1'
        handleVRx.value.style.opacity = '1'
        overcontent = true
    })
    content.value.addEventListener('mousedown', (event) => { // 監聽時間軸總容器
        if (event.button === 0 && editTimehandleBarSwitch.value === null) {
            isDragging = true;
            updateHandlePosition(event);
            if (state.selectST) {
                selectRanger(event, false, false)
            }
        }
    });
    content.value.addEventListener('mouseout', (event) => { // 監聽時間軸總容器
        handleVR.value.style.opacity = '0'
        handleVRx.value.style.opacity = '0'
        overcontent = false
    })
    const renderMarkers = (data) => {
        console.log('renderMarkers');
        // time
        // state.alarmRange = []
        let dom = data.DOM
        let markers = data.marker
        let cmmarkers = data.cm
        markers.forEach(marker => {
            const markerElement12 = document.createElement('div');
            const startPercentage = times.indexOf(marker.start.toString()) / (times.length - 1);
            const endPercentage = times.indexOf(marker.end.toString()) / (times.length - 1);
            markerElement12.className = marker.type === "marker" ? 'slider-marker' : 'slider-empty';
            markerElement12.style.left = `${startPercentage * 100}%`;
            markerElement12.style.width = `${(endPercentage - startPercentage) * 100}%`;
            dom.sliderContent.appendChild(markerElement12);
            // state.alarmRange.push([times.indexOf(marker.start.toString()), times.indexOf(marker.end.toString())])
        });
        // cm
        cmmarkers.forEach(marker => {
            const markerElement = document.createElement('div');
            const startPercentage = times.indexOf(marker.start.toString()) / (times.length - 1);
            const endPercentage = times.indexOf(marker.end.toString()) / (times.length - 1);

            markerElement.className = marker.type === "marker" ? 'slider-marker-cm' : 'slider-empty-cm';
            markerElement.style.left = `${startPercentage * 100}%`;
            markerElement.style.width = `${(endPercentage - startPercentage) * 100}%`;

            dom.sliderContent.appendChild(markerElement);
        });
        document.querySelectorAll('.slider-label').forEach(el => el.remove());
        document.querySelectorAll('.slider-label-text').forEach(el => el.remove());
        state.lables = proups.lables
    }
    function getSelectDate(event, snap = false) {
        const sliderWidth = content.value.offsetWidth;
        const rect = content.value.getBoundingClientRect();
        const handleRect = handle.value.getBoundingClientRect();
        // 滑鼠在 slider 上的 x 相對座標
        let x = event.clientX - rect.left;

        // 限制在 slider 範圍內
        x = Math.max(0, Math.min(x, sliderWidth - (snap ? 0 : handleRect.width / 2)));
        const percentage = x / sliderWidth;
        const index = Math.round(percentage * (times.length - 1));
        return times[index]
    }

    function moveHandleToTime(time) {
        console.log(time);
        if (!times.includes(time)) return

        const sliderWidth = content.value.offsetWidth
        const handleWidth = handle.value.offsetWidth
        const index = times.indexOf(time)

        const percentage = index / (times.length - 1)
        const x = percentage * sliderWidth

        // 把 handle 移動到對應位置（考慮中心點）
        handle.value.style.transform = `translateX(${x - handleWidth / 2}px)`
    }

    function updateHandlePosition(event, snap = false) {
        const sliderWidth = content.value.offsetWidth;
        const rect = content.value.getBoundingClientRect();
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
        // console.log(state.lables);
        time.value.textContent = times[index];
        if (state.lableST) {
            emit('addlable', { time: times[index], analyze: analyzeEvents(times[index], state.sliderList) })
            console.log('addlable', analyzeEvents(times[index], state.sliderList));
            state.lableST = false
        }
        emit('setUpdateImg', times[index])
    }
    updateHandlePosition({ clientX: 0 }, false)
    function updateHandleVRPosition(event, snap = false) {
        const sliderWidth = content.value.offsetWidth;
        const rect = content.value.getBoundingClientRect();
        const handleRect = handleVR.value.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        x = Math.max(0, Math.min(x, sliderWidth - (snap ? 0 : handleRect.width / 2)));
        const percentage = x / sliderWidth;
        const index = Math.round(percentage * (times.length - 1));
        const finalX = snap
            ? (index / (times.length - 1)) * sliderWidth
            : x;
        const leftPercent = (finalX / sliderWidth) * 100;
        handleVR.value.style.left = `${leftPercent}%`;
        handleVRx.value.style.top = `${y}px`;
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
            content.value.appendChild(markerElement12);
        } else if (state.saveSelect[0] !== null && state.saveSelect[1] !== null && !draging) {
            state.saveSelect[1] = startPercentage
            const markerElement12 = state.tempDIV;
            // markerElement12.className = 'slider-select-ranger';
            // markerElement12.style.left = `${saveSelect[0] * 100}%`;
            markerElement12.style.width = `${(state.saveSelect[1] - state.saveSelect[0]) * 100}%`;
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
        const sliderWidth = content.value.offsetWidth;
        const rect = content.value.getBoundingClientRect();
        const handleRect = handle.value.getBoundingClientRect();
        let x = event.clientX - rect.left;
        x = Math.max(0, Math.min(x, sliderWidth - (snap ? 0 : handleRect.width / 2)));
        const percentage = x / sliderWidth;
        const index = Math.round(percentage * (times.length - 1));
        // state.tes = times[index];
        const startPercentage = times.indexOf(times[index].toString()) / (times.length - 1);
        return startPercentage
    }
    // 建立外層容器
    sliderList.forEach((item, index) => {
        const sliderContent = document.createElement('div');
        sliderContent.className = 'slider-content';

        // 建立背景 bar
        const sliderBar = document.createElement('div');
        sliderBar.className = 'slider-bar';

        const sliderBarCm = document.createElement('div');
        sliderBarCm.className = 'slider-bar-cm';

        // 建立 slider 主體
        const slider1 = document.createElement('div');
        slider1.id = 'slider-canvas';
        slider1.className = '';
        // 若你使用 ref="slider"，可以額外設為 ref.slider = slider
        sliderContent.appendChild(sliderBar);
        sliderContent.appendChild(sliderBarCm);
        sliderContent.appendChild(slider1);

        // 假設你有個容器要加進去
        content.value.appendChild(sliderContent); // 或指定你的根節點

        // ✅ 若需要對應變數使用，可以包成物件
        const sliderElements = {
            sliderContent,
            sliderBar,
            sliderBarCm,
            slider1
        };
        sliderList[index].DOM = sliderElements
        renderMarkers(item);
        renderTimeMarkers(item, Limit)
    })
    state.sliderList = sliderList
    // renderMarkers();

    // Ensure slider width is updated on window resize
    // window.addEventListener('resize', () => {
    //     const newWidth = slider.offsetWidth;
    // });
    return { updateHandlePosition, moveHandleToTime }
}
const analyzeEvents = (time, items) => {
    const target = new Date(time).getTime();
    let alarm = 0;
    let smoke = 0;

    items.forEach(obj => {
        // 處理 marker (警報)
        obj.marker.forEach(m => {
            if (
                m.type === "marker" &&
                target >= new Date(m.start).getTime() &&
                target <= new Date(m.end).getTime()
            ) {
                alarm++;
            }
        });

        // 處理 cm (煙霧)
        obj.cm.forEach(c => {
            if (
                c.type === "marker" && // 注意：你的資料裡 smoke 也用了 type=marker
                target >= new Date(c.start).getTime() &&
                target <= new Date(c.end).getTime()
            ) {
                smoke++;
            }
        });
    });

    return { alarm, smoke };
}
const highlightlable = (event) => {
    let index = state.lables.findIndex((item) =>
        event === item.name
    )
    // console.log('highlightlable slider 被觸發了', state.lables, index, event);
    const times = temptimeSliderBar.times
    const startPercentage = times.indexOf(state.lables[index].date.toString()) / (times.length - 1);
    const containerWidth = container.value.clientWidth;
    const contentWidth = scale.value * containerWidth;
    const re = (contentWidth * -startPercentage) + (containerWidth / 2);
    // console.log('New re:', re, startPercentage, containerWidth, contentWidth);

    animateOffset(tempOffsetX.value, re, 800);
}
const runSmoothScroll = () => {
    if (timelineContext.value !== null) {
        const div = timelineContext.value;
        let targetScrollTop = 0;
        let animationFrame;
        div.addEventListener('wheel', (e) => {
            if (!e.ctrlKey) {
                e.preventDefault(); // 阻止原生滾動
                targetScrollTop += e.deltaY; // 累加目標位置
                targetScrollTop = Math.max(0, Math.min(div.scrollHeight - div.clientHeight, targetScrollTop));

                if (!animationFrame) smoothScroll();
            }
        }, { passive: false });
        function smoothScroll() {
            const current = div.scrollTop;
            const distance = targetScrollTop - current;

            div.scrollTop = current + distance * 0.1; // 0.1 是緩動速度

            if (Math.abs(distance) > 0.5) {
                animationFrame = requestAnimationFrame(smoothScroll);
            } else {
                div.scrollTop = targetScrollTop;
                animationFrame = null;
            }
        }
    } else {
        setTimeout(() => { runSmoothScroll() }, 10)
    }
}
const sendSliderData = (e) => {
    console.log('sendSliderData', e);
    const mock = {
        series: [],
        temp: [],
        times: [],
        tempMaxLine: 0,
    }
    mock.times = e[0].echart_xAxis_absolute
   
    let test01 = []
    e.forEach((item, index) => {
        if (index !== 0) {
            let output = {
                name: "",
                marker: [],
                cm: [],
                DOM: {}
            }
            item.dna_roiAlarmStatus.alarm_marker.forEach((item0001) => {
                output.marker.push({ start: item0001.start, end: item0001.end, type: 'marker' })
            })
            item.dna_roiAlarmStatus.normal_marker.forEach((item0001) => {
                output.marker.push({ start: item0001.start, end: item0001.end, type: 'empty' })
            })

            item.dna_smokeAlarmStatus.alarm_marker.forEach((item0001) => {
                output.cm.push({ start: item0001.start, end: item0001.end, type: 'marker' })
            })
            item.dna_smokeAlarmStatus.normal_marker.forEach((item0001) => {
                output.cm.push({ start: item0001.start, end: item0001.end, type: 'empty' })
            })
            item.echart_roiMaxAbs.echart_data.forEach((d1) => {
                test01.push({
                    name: item.ptz_curisingPoint_name + ' ' + d1.roi_number,
                    item: d1.data
                })
            })
            output.name = item.ptz_curisingPoint_name
            mock.series.push(output)
        }
    })

    const createChartsCanvas = () => {
        const div = echarts001.value;
        let canvas = document.createElement("canvas");
        const controls = document.getElementById('controls');
        canvas.style.position = "absolute"
        canvas.style.bottom = "0px"
        canvas.style.left = "0px"
        canvas.style.height = div.getBoundingClientRect().height - 40 + 'px'
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
                            data: {
                                xAxis: mock.times,
                                items: test01,
                                tempMaxLine: mock.tempMaxLine,
                            }
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
                } else if (type === 'seriesColors') {
                    console.log('mina', res.colors);
                    const colors = e.data.colors;
                    // 更新按鈕顏色
                    Array.from(controls.children).forEach((btn, idx) => {
                        btn.style.backgroundColor = colors[idx % colors.length];
                        btn.style.color = '#fff';
                    });
                }
                res = null
                type = null
            })
        }
        runEchartsWebworker()
        // 建立控制物件
        test01.forEach(o => {
            const btn = document.createElement('button');
            btn.textContent = o.name;
            btn.dataset.active = "true"; // 預設顯示
            btn.onclick = () => {
                const isActive = btn.dataset.active === "true";
                btn.dataset.active = String(!isActive);
                btn.style.opacity = isActive ? 0.4 : 1.0;

                tempwk.postMessage({
                    type: 'toggleSeries',
                    name: o.name,
                    visible: !isActive
                });
            };
            controls.appendChild(btn);
        });
        // 拖動控制物件
        const movectrlobject = () => {
            let isDown = false;
            let startX = 0;
            let scrollLeft = 0;
            let moved = false;   // 用來判斷是否拖曳過

            // ------- Mouse -------
            controls.addEventListener('mousedown', (e) => {
                isDown = true;
                moved = false;
                startX = e.pageX - controls.offsetLeft;
                scrollLeft = controls.scrollLeft;
                controls.style.cursor = 'grabbing';
            });
            controls.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                const x = e.pageX - controls.offsetLeft;
                const walk = x - startX;
                if (Math.abs(walk) > 5) moved = true;   // 超過5px才算拖曳
                controls.scrollLeft = scrollLeft - walk;
            });
            ['mouseup', 'mouseleave'].forEach(evt =>
                controls.addEventListener(evt, () => {
                    isDown = false;
                    controls.style.cursor = 'grab';
                })
            );

            // ------- Touch -------
            controls.addEventListener('touchstart', (e) => {
                if (e.touches.length !== 1) return;
                isDown = true;
                moved = false;
                startX = e.touches[0].pageX - controls.offsetLeft;
                scrollLeft = controls.scrollLeft;
            }, { passive: true });

            controls.addEventListener('touchmove', (e) => {
                if (!isDown) return;
                const x = e.touches[0].pageX - controls.offsetLeft;
                const walk = x - startX;
                if (Math.abs(walk) > 5) moved = true;
                controls.scrollLeft = scrollLeft - walk;
                e.preventDefault();
            }, { passive: false });

            ['touchend', 'touchcancel'].forEach(evt =>
                controls.addEventListener(evt, () => { isDown = false; }, { passive: true })
            );

            // ------- 阻止 Button 在拖曳後觸發 click -------
            controls.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (moved) {
                        e.stopImmediatePropagation();
                        e.preventDefault(); // 阻止拖曳後的點擊
                    }
                });
            });
        }
        movectrlobject()
    }
    mock.tempMaxLine = e[0].data
    timeSliderBarFunction.value = timeSliderBar(mock) // 送出
    createChartsCanvas()
    runSmoothScroll()
}
onMounted(() => {
    if (timelineContext.value !== null) {
        const divTX = timelineContext.value
        divTX.addEventListener('scroll', (e) => { onScroll(divTX) })
    }

    scale.value = 1;
    offsetX.value = 0;

    let mock = generateMockData(10)
    // console.log(mock);
    let test01 = []
    for (var z = 0; z < 5; z++) {
        let output = {
            name: 'cam 1 _ loc ' + z,
            item: []
        }
        for (var i = 0; i < mock.times.length; i++) {
            // mock.times.push('M_' + i)
            output.item.push(Math.floor(Math.random() * 500))
        }
        test01.push(output)
    }


    console.log(mock);
    // timeSliderBar(mock) // 送出
    // createChartsCanvas()
    // runSmoothScroll()

    function generateMockData(seriesCount = 5, maxSegments = 100, totalRange = 500) {
        // 這個方法隨時可以刪掉
        const mock = {
            times: [],
            temp: [],
            series: []
        };

        // 填入時間軸資料 M_1 ~ M_800
        for (let i = 1; i <= totalRange; i++) {
            mock.times.push(`M_${i}`);
            // mock.temp.push(Math.);
        }

        // 輔助函式：產生不重疊區間
        function generateNonOverlappingSegments(count, rangeMax) {
            const segments = [];
            const used = new Array(rangeMax).fill(false);

            let tries = 0;
            while (segments.length < count && tries < 10000) {
                const start = Math.floor(Math.random() * (rangeMax - 5)) + 1;
                const maxLen = Math.min(30, rangeMax - start); // 每段最大長度限制
                const length = Math.floor(Math.random() * maxLen) + 1;
                const end = start + length;

                // 檢查是否有重疊
                let overlap = false;
                for (let i = start; i <= end; i++) {
                    if (used[i]) {
                        overlap = true;
                        break;
                    }
                }

                if (!overlap) {
                    segments.push({
                        start: `M_${start}`,
                        end: `M_${end}`,
                        type: Math.random() < 0.5 ? 'marker' : 'empty'
                    });
                    for (let i = start; i <= end; i++) used[i] = true;
                }

                tries++;
            }

            return segments;
        }

        // 產生 series 資料
        for (let i = 0; i < seriesCount; i++) {
            const markerCount = Math.floor(Math.random() * (maxSegments - 1)) + 1;
            const cmCount = Math.floor(Math.random() * (maxSegments - 1)) + 1;

            const series = {
                name: `CAM 1 _ LOC ${i + 1}`,
                marker: generateNonOverlappingSegments(markerCount, totalRange),
                cm: generateNonOverlappingSegments(cmCount, totalRange)
            };

            mock.series.push(series);
        }

        return mock;
    }
})

onUnmounted(() => {
    console.log('HistroyRes Unmounted');
})

defineExpose({
    highlightlable,
    sendSliderData
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
    height: calc(100% - 10px);
    background-color: #fff;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    box-shadow: 1px 1px 3px 3px #0000000f;
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
    position: relative;
    /* scroll-behavior: smooth; */
    /* 平滑滾動 */
}


.s-container {
    display: flex;
    flex-direction: column;
    /* position: relative;
    width: calc(100%);
    overflow: hidden;
    height: 100%;
    padding-left: 36px; */
    position: relative;
    width: calc(100% - 36px);
    overflow: hidden;
    min-height: 1000px;
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

.slider-et {
    width: 100%;
    height: 199px;
}

.slider-handle {
    position: absolute;
    top: -12px;
    left: 0;
    width: 3px;
    height: 200%;
    background: #656565;
    cursor: pointer;
    transition: width .3s, transform .3s;
    z-index: 4;
    margin-top: 32px;
}

.slider-handle-vr {
    position: absolute;
    top: 0;
    left: 10px;
    width: 1px;
    height: 100%;
    /* background: #656565; */
    border: 1px dashed #8f8f8f;
    cursor: pointer;
    transition: width .3s, transform .3s;
    z-index: 4;
    pointer-events: none;
}

.slider-handle-vrx {
    position: absolute;
    top: 200px;
    left: 0;
    width: 100%;
    height: 1px;
    /* background: #656565; */
    border: 1px dashed #8f8f8f;
    cursor: pointer;
    transition: width .3s, transform .3s;
    z-index: 4;
    pointer-events: none;
}

.slider-handle:hover {
    width: 5px;
    /* transform: translate(-5px, 0px); */
}

/* 時間軸 END */
.echarts001 {
    width: 100%;
    /* height: 161px; */
    height: 195px;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    background: #fff;
    z-index: 3;
    border-bottom: 1px #c1c1c1 solid;
}

.controls-content {
    margin-top: 30px;
    width: 100%;
    display: flex;
    pointer-events: auto !important;
    justify-content: flex-end;
}

#controls {
    margin-top: 5px;
    width: 500px;
    overflow: hidden;
    /* 隱藏原生 scrollbar */
    white-space: nowrap;
    user-select: none;
    /* 拖曳時避免選到文字 */
}
</style>

<style>
#controls>button {
    margin: 0px .25em;
    border-radius: 5px;
    padding: 0px .5em;
}

/* 時間軸 */
.slider-content {
    position: relative;
    width: 100%;
    height: 90px;
    /* background: #ff7777c9; */
}

.time-marker {
    position: absolute;
    top: 16px;
    height: 24px;
    width: 1px;
    background: #939393;
    z-index: 3;
}

.time-marker-text {
    position: absolute;
    top: 0px;
    z-index: 3;
    transform: translate(-50%, 0px);
    width: fit-content;
    font-size: 11px;
    white-space: nowrap;
    display: none;
}

.slider-bar {
    position: absolute;
    width: 100%;
    height: 24px;
    background: #D9D9D9;
    left: 0;
    top: 16px;
}

.timeline-name {
    border-top: 1px solid #c1c1c1;
    border-right: 1px solid #c1c1c1;
}

.time-marker-cm {
    position: absolute;
    bottom: 16px;
    height: 24px;
    width: 1px;
    background: #939393;
    z-index: 3;
}

.slider-bar-cm {
    position: absolute;
    left: 0;
    width: 100%;
    height: 24px;
    bottom: 16px;
    background: #D9D9D9;
    z-index: 1;
}



.time-marker-text-cm {
    position: absolute;
    bottom: 0px;
    z-index: 3;
    transform: translate(-50%, 0px);
    width: fit-content;
    font-size: 11px;
    white-space: nowrap;
}

.time-display {
    /* position: absolute;
    transform: translate(-50%, 4px);
    top: 0;
    left: 0;
    width: -moz-fit-content;
    width: fit-content;
    z-index: 4;
    white-space: nowrap;
    background: #9d9d9d;
    white-space: nowrap;
    padding: .05em .25em;
    border-radius: .25em; */
    position: absolute;
    transform: translate(-50%, 4px);
    top: 0;
    left: 0;
    width: -moz-fit-content;
    width: fit-content;
    z-index: 4;
    background: #9d9d9d;
    white-space: nowrap;
    padding: .01em 0.25em;
    border-radius: .25em;
    font-size: .9em;
}

.slider-marker {
    position: absolute;
    top: 16px;
    height: 24px;
    background: #FF9494;
    z-index: 2;
    pointer-events: none;
}

.slider-empty {
    position: absolute;
    top: 16px;
    height: 24px;
    background: #ffffff;
    z-index: 2;
    pointer-events: none;
}

.slider-marker-cm {
    position: absolute;
    bottom: 16px;
    height: 24px;
    background: #FF9494;
    z-index: 2;
    pointer-events: none;
}

.slider-empty-cm {
    position: absolute;
    bottom: 16px;
    height: 24px;
    background: #ffffff;
    z-index: 2;
    pointer-events: none;
}

.slider-select-ranger {
    position: absolute;
    left: 100px;
    width: 30%;
    height: calc(100% - 30px);
    top: 24px;
    background: #ffff0000;
    border: 4px dashed #64D6FF;
    /* 粗細、樣式、顏色 */
    /* background: #ffff0077; */
    cursor: pointer;
    z-index: 11;
}

.slider-label {
    position: absolute;
    top: 0;
    left: 50%;
    width: 3px;
    height: 100%;
    background: #F28919;
    cursor: pointer;
    transition: width .3s, transform .3s;
    z-index: 12;
    margin-top: 32px;
}

.slider-label:hover {
    width: 5px;
    /* transform: translate(-5px, 0px); */
}

.slider-label-text {
    position: absolute;
    transform: translate(-50%, 4px);
    top: 0px;
    left: 50%;
    width: -moz-fit-content;
    width: fit-content;
    cursor: pointer;
    background-color: #F28919;
    border: 1px solid #ffa443;
    border-radius: .25em;
    z-index: 12;
    white-space: nowrap;
    padding: .05em .25em;
}

.slider-label-text-2 {
    position: absolute;
    transform: translate(-50%, 182px);
    top: 0px;
    left: 50%;
    width: -moz-fit-content;
    width: fit-content;
    cursor: pointer;
    background-color: #F28919;
    border: 1px solid #ffa443;
    border-radius: .25em;
    z-index: 12;
    white-space: nowrap;
    padding: .05em .25em;
}

.slider-label-check {
    position: absolute;
    transform: translate(-50%, 4px);
    top: 0px;
    left: 50%;
    width: -moz-fit-content;
    width: fit-content;
    cursor: pointer;
    background-color: #F28919;
    border: 1px solid #ffa443;
    border-radius: .25em;
    z-index: 4;
    white-space: nowrap;
}

.slider-label-clone {
    position: absolute;
    top: 0;
    left: 50%;
    width: 3px;
    height: 100%;
    background: #b6b6b6;
    transition: width .3s, transform .3s;
    z-index: 12;
    margin-top: 32px;
    pointer-events: none;
}

.slider-label-text-clone {
    position: absolute;
    transform: translate(-50%, 4px);
    top: 0px;
    left: 50%;
    width: -moz-fit-content;
    width: fit-content;
    background-color: #b6b6b6;
    border: 1px solid #b6b6b6;
    border-radius: .25em;
    z-index: 12;
    white-space: nowrap;
    padding: .05em .25em;
    pointer-events: none;
}

.label-lock {
    pointer-events: none;
    opacity: 0.5;
}

.label-foucs {
    z-index: 90;
}

.histroy-canvas .v-expansion-panel .v-expansion-panel--disabled {
    background-color: #fff !important;
    opacity: 1 !important;
}

/* 時間軸 END */
.flag-label-slider {
    display: inline-block;
    /* 藍底 */
    color: #fff;
    /* 白字 */
    font-size: 14px;
    font-weight: 600;
    padding: 6px 12px 6px 12px;
    position: relative;
    border-radius: 0px 0 0 0px;
    height: 38px;
    white-space: nowrap;
    /* 不換行 */
    text-overflow: ellipsis;
    /* 超過用 ... 代替 */
    /* 左邊圓角 */
}

.flag-label-slider::after {
    content: "";
    position: absolute;
    top: 0;
    right: -10px;
    /* 三角形超出去 */
    width: 0;
    height: 0;
    border-top: 19px solid transparent;
    border-bottom: 19px solid transparent;
    /* 旗標的箭頭 */
}

.c1976d2 {
    background: #1976d2;
}

.c1976d2::after {
    border-left: 10px solid #1976d2;
}
</style>