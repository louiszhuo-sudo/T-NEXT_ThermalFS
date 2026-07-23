<template>
    <div style="width: 100%; height: calc(100vh - 43px - 16px - 16px);">
        <div class="histroy-bar d-flex">
            <div class="d-flex align-center pr-4">
                <h4 class="pl-4" style="width: 100px;">選擇日期</h4>
                <!-- <input type="text" class="c-input ml-4" style="width:400px" id="myInput" /> -->
                <selectDate @setDate="setDate"></selectDate>
            </div>
            <div style="width: 28px;" class="mr-2" ref="openmapbtn">
                <v-btn flat block color="#ffffff00" @click="switchMap()">
                    <img src="/images/icon/cctv.png" style="width: 28px;" />
                </v-btn>
            </div>
        </div>
        <!-- v-if="runData" -->
        <div class="histroy-canvas pa-2">
            <div class="histroy-rows" ref="histroyRows">
                <div class="images-main" style="overflow-y: scroll;">
                    <div class="d-flex flex-wrap">
                        <!-- 假圖片 要改掉 左上圖片預覽 -->
                        <div class="pa-1 accordion-canvas" v-for="(item, index) in state.imgItems" :key="index">
                            <div class="d-flex accordion-item flex-wrap">
                                <div class="accordion-title">{{ item.title }}</div>
                                <div class="accordion-item-img">
                                    <img :src="item.ir === null ? `/images/EMPTYv1-fill.png` : 'data:image/png;base64,' + item.ir"
                                        style="object-fit: fill;width: 100%;height: 100%;" />
                                </div>
                                <div class="accordion-item-img">
                                    <img :src="item.vis === null ? `/images/EMPTYv1-fill.png` : 'data:image/png;base64,' + item.vis"
                                        style="object-fit: fill;width: 100%;height: 100%;" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="position: relative;">
                    <div class="histroy-row-handle-bar" ref="histroyHandleBar"></div>
                    <!-- 下方slider區域 -->
                    <SettingTablesSlider ref="silderTable" :mainData="state" @addlable="addlable"
                        @removelable="removelable" @highlightlable="highlightlable" @sendseries="sendseries"
                        v-if="runData" @setUpdateImg="setUpdateImg" />
                </div>
            </div>
            <div class="pl-3" style="height: 100%;">
                <!-- 右邊摺疊區域 -->
                <SettingTablesCustomaccordion ref="customaccordion" :items="state.lables" :default-opened="[]"
                    data-multiple="true" @highlightlable="highlightlable" @closeChangelable="closeChangelable"
                    v-if="state.lables.length > 0 && ws041 !== null" :groupItem="state.groupItem" />

            </div>
        </div>
        <div style="background-color: #fff; border: 1px solid #878787;border-radius: 3px;width:1018px; height: 550px;"
            class="c-res-visss123" id="visss12323123" ref="visss12323123"
            :class="!state.mapdig ? 'visss1233332131233542' : ''">
            <div class="drag-handle" ref="dragHandle123">地圖選項</div>
            <div style="width:100%; height:560px;overflow: auto;" class="c-res-win-col">
                <div>
                    <div class="px-1">選取範圍可篩選相機</div>
                    <div style="width: 100%;height: 500px;">
                        <ClientOnly>
                            <MapSelectpointmap ref="mapImport3" :formtData="state" :mainProps="''" :camID="null"
                                camType="vis" :ptzAlarmID="state.alarmID" @selectCam="selectCam" />
                        </ClientOnly>
                    </div>
                </div>
                <div>
                    <div style="width:100%; height:200px;overflow: auto;">
                        選擇元件
                        <v-radio-group v-model="state.groupItem">
                            <v-radio v-for="(item, index) in state.groupItems" :key="index" :label="item.title"
                                :value="item.value"></v-radio>
                        </v-radio-group>
                    </div>
                    <div style="width:100%; height:320px;overflow: auto;">
                        <div class="px-1">可勾選增刪相機</div>
                        <template v-for="(item, index) in state.cameraItems" :key="index">
                            <v-checkbox v-model="state.selectedCamera" :label="item.title" :value="item.id"
                                density="compact" hide-details @update:modelValue="refreshSelectCamera"></v-checkbox>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
const { $webSocketconnect04 } = useNuxtApp()
const { $webSocket04URL } = useNuxtApp()
const editTimehandleBarSwitch = useState('editTimehandleBarSwitch')
const runData = ref(false)
const openmapbtn = ref(null)
const mapImport3 = ref(null)
const visss12323123 = ref('')
const dragHandle123 = ref('')
const resizeHandle123 = ref([])
const silderTable = ref('')
const customaccordion = ref('')
const histroyRows = ref(null)
const histroyHandleBar = ref(null)
const state = reactive({
    mapdig: false,
    alarmID: [],
    tempminmaplocaltion: [0, 0],
    image: null,
    ws4: {
        readyState: 0
    },
    wsListener4: {
        close: null,
        message: null
    },
    images: [
        { id: 1, base64: '/mock/image 348656882.png' },
        { id: 2, base64: '/mock/螢幕擷取畫面 2025-07-09 161224.png' },
        { id: 3, base64: '/mock/ChatGPT Image 2025年7月3日 下午02_06_07.png' },
        { id: 4, base64: '/mock/ChatGPT Image 2025年7月3日 下午02_06_07.png' },
        { id: 5, base64: '/mock/ChatGPT Image 2025年7月3日 下午02_06_07.png' },
        { id: 6, base64: '/mock/ChatGPT Image 2025年7月3日 下午02_06_07.png' },
        { id: 7, base64: '/mock/ChatGPT Image 2025年7月3日 下午02_06_07.png' },
        { id: 8, base64: '/mock/ChatGPT Image 2025年7月3日 下午02_06_07.png' }
    ],
    imgItems: [],
    labelIndex: 1,
    lables: [],
    panel: [],
    items: [],
    ptzswitch: 1,
    date: [new Date(), new Date()],
    cameraItems: [],
    // { title: 'CAM 1 - LOC 1', id: 0 }, { title: 'CAM 1 - LOC 2', id: 1 }, { title: 'CAM 2 - LOC 1', id: 2 }, { title: 'CAM 2 - LOC 2', id: 3 }
    selectedCamera: [],
    groupItem: 0,
    groupItems: [],
})

const setDate = (date) => {
    console.log('date', formatDate(date[0]), formatDate(date[1]))
    const output = {
        feature: 'history_playback',
        method: 'query_history_cursingPoint',
        session: Math.random().toString(36).substr(2),
        content: {
            field_id: 1,
            selected_time: [{ start_time: formatDate(date[0]), end_time: formatDate(date[1]) }]
        }
    };
    state.date = [formatDate(date[0]), formatDate(date[1])]
    state.ws4.send(JSON.stringify(output));
    function formatDate(date) {
        const pad = (n) => n.toString().padStart(2, '0')

        const year = date.getFullYear()
        const month = pad(date.getMonth() + 1) // 月份從0開始
        const day = pad(date.getDate())

        const hours = pad(date.getHours())
        const minutes = pad(date.getMinutes())
        const seconds = pad(date.getSeconds())

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
}
const selectCam = (e) => {
    state.selectedCamera = e
    refreshSelectCamera()
}

// 避免送出ws太快
const lastSendTime = ref(0);
const throttleDelay = ref(200); // ms
const moveTimer = ref(null);

const setUpdateImg = (ev) => {
    const sendData = (e) => {
        console.log('setUpdateImg', state.selectedCamera);
        let output = {
            feature: 'history_playback',
            method: 'query_history_cruisingImages',
            session: Math.random().toString(36).substr(2),
            content: {
                field_id: 1,
                selected_time: e,
                selected_cruisingPoint_id: state.selectedCamera,
                roiClass_id: state.groupItem
            },
        }
        state.ws4.send(JSON.stringify(output))
    }

    const now = Date.now();
    if (now - lastSendTime.value >= throttleDelay.value) {
        sendData(ev);
        lastSendTime.value = now;
    } else {
        // 如果100ms內又觸發，排定最後一次
        clearTimeout(moveTimer.value);
        moveTimer.value = setTimeout(() => {
            sendData(ev);
            lastSendTime.value = Date.now();
        }, throttleDelay.value - (now - lastSendTime.value));
    }

}
const refreshSelectCamera = () => {

    // 把目前選取的相機列表傳給後端
    let output = {
        feature: 'history_playback',
        method: 'query_history_cursingPoint_status',
        session: Math.random().toString(36).substr(2),
        content: {
            field_id: 1,
            selected_time: [{ "start_time": state.date[0], "end_time": state.date[1] }],
            selected_cruisingPoint: state.selectedCamera,
            roiClass_id: state.groupItem
        },
    }
    console.log('refreshSelectCamera', JSON.stringify(output));

    state.ws4.send(JSON.stringify(output))
}
const switchMap = (e) => {
    state.mapdig = e ? e : !state.mapdig
    var div = openmapbtn.value.getBoundingClientRect()
    var divA = visss12323123.value
    let newLeft = !state.mapdig ? '-1000px' : `${div.x + div.width}px`
    let newTop = !state.mapdig ? '-1000px' : `${div.y + div.top}px`
    divA.style.left = `${newLeft}`;
    divA.style.top = `${newTop}`;

}
const runRowhandle = () => {
    const container = histroyRows.value;
    const handleBar = histroyHandleBar.value;
    let isDragging = false;
    let startY = 0;
    let startHeightPercent = 50;

    handleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
        startHeightPercent = parseFloat(container.style.gridTemplateRows) || 50;
        container.style.transition = 'none'; // 拖曳時不要動畫
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaY = e.clientY - startY;
        const containerHeight = container.offsetHeight;
        let newPercent = ((startHeightPercent / 100) * containerHeight + deltaY) / containerHeight * 100;

        // 限制範圍 5%~95%
        newPercent = Math.max(0, Math.min(100, newPercent));

        container.style.gridTemplateRows = `${newPercent}% ${100 - newPercent}%`;
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;

        // 四捨五入到最近的 5%
        let currentPercent = parseFloat(container.style.gridTemplateRows);
        let snappedPercent = Math.round(currentPercent / 5) * 5;

        // 限制範圍
        snappedPercent = Math.max(20, Math.min(80, snappedPercent));

        // 加回動畫
        container.style.transition = 'grid-template-rows 0.3s ease';
        container.style.gridTemplateRows = `${snappedPercent}% ${100 - snappedPercent}%`;
    });

}
const closeChangelable = (e) => {
    state.lables = []
    setTimeout(() => {
        state.lables = e
    }, 1)
}
const highlightlable = (e) => {
    // 這邊直接觸發label 編輯
    const type = e.type
    if (type === 'slider') {
        // console.log('highlightlable', e);
        editTimehandleBarSwitch.value = e.data
        customaccordion.value.highlightlable(e.name)
    } else if (type === 'customaccordion') {
        silderTable.value.highlightlable(e.name)
    }
}
const addlable = ({ time, analyze }) => {
    // console.log(e);
    state.lables.push({
        name: state.labelIndex,
        // uid: Math.random().toString(36).substr(2),
        clone: false,
        date: time,
        alarm_ROI: 0,
        alarm_smoke: analyze.smoke,
        alarm: analyze.alarm,
        temp_max: 0,
        location: state.selectedCamera
    })
    const temp = state.lables
    state.lables = []
    setTimeout(() => {
        state.lables = temp
    }, 1)
    state.labelIndex++
}

const removelable = (date) => {
    // console.log('removelable', state.lables.filter((item) => item.date === date));
    const temp = state.lables.filter((item) => item.name !== date)
    state.lables = []
    console.log('removelable', temp, date);
    setTimeout(() => {
        state.lables = temp
    }, 1)
}
const switchWK = (e) => {
    // console.log(mapImport3);
    if (mapImport3.value !== null) {
        mapImport3.value.switchWK(e)
    } else {
        setTimeout(() => {
            switchWK(e)
        }, 100)
    }
    // if (!e) {
    // stopProgram()
    // }
}

const formatDate = (date) => {
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
const formattedDates = state.date.map(formatDate);
const initws4 = () => {
    const openwebsocket04 = () => {
        if ($webSocketconnect04().readyState === 1) {
            state.ws4 = $webSocketconnect04()

            // 送出測試資料
            // setTimeout(() => {
            //     let mockdata = { "feature": "history_playback", "method": "query_history_cursingPoint_status", "session": "906k85fewem", "content": { "field_id": 1, "selected_time": [{ "start_time": "2025-09-16 00:00:00", "end_time": "2025-09-16 00:10:00" }], "selected_cruisingPoint": [2004, 3001, 3003], "roiClass_id": 0 } }
            //     state.ws4.send(JSON.stringify(mockdata))
            // }, 2000)
            // end

            if (state.wsListener4.close !== null) {
                state.ws4.removeEventListener("close", state.wsListener4.close)
                state.wsListener4.close = null
            }
            // emit('maskloing', true)
            const colseEvent = () => {
                setTimeout(() => {
                    openwebsocket04()
                }, 1000)
            }
            state.ws4.addEventListener("close", colseEvent)
            state.wsListener4.close = colseEvent
            // var tew = 0
            const messageEvent = (event) => {
                var data = JSON.parse(event.data)
                var feature = data.feature
                var method = data.method
                // console.log('messageEvent', data);
                if (feature === "history_playback" && method === "query_history_cursingPoint") {
                    var content = data.content
                    console.log(content);
                    mapImport3.value.updateBase64ImageSize('data:image/png;base64,' + content.map_image_base64)
                    var ptzContent = content.ptz_info
                    let output = []
                    ptzContent.forEach((item1) => {
                        var ptzCursingPointsContent = item1.ptz_cursingPoints_content
                        ptzCursingPointsContent.forEach((item2) => {
                            output.push(
                                { title: `CAM ${item1.ptz_id} - LOC ${item2.cursingPoint_id}`, id: item2.cursingPoint_id }
                            )
                        })
                    })
                    const mapped = content.roiClass_info.map(item => ({
                        value: item.roiClass_id,
                        title: item.roiClass_name
                    }))
                    state.groupItems = mapped
                    state.cameraItems = output
                    switchMap(true)
                    setTimeout(() => {
                        mapImport3.value.refreshMapObject(ptzContent) // 把雲台資訊傳給map > wk
                    }, 300)
                } if (feature === "history_playback" && method === "query_history_cursingPoint_status") {
                    var content = data.content
                    runData.value = false
                    setTimeout(() => {
                        runData.value = true
                        setTimeout(() => {
                            console.log('content', content);
                            silderTable.value.sendSliderData(content)
                            state.imgItems = []
                            // content.forEach((item, index) => {
                            //     if (index !== 0) {
                            //         state.imgItems.push({
                            //             title: item.ptz_curisingPoint_name,
                            //             id: item.cruisingPoint_id
                            //         })
                            //     }
                            // })
                        }, 10)
                    }, 10)
                } if (feature === "history_playback" && method === "query_history_cruisingImages") {
                    var content = data.content
                    var output = []
                    content.forEach((item) => {
                        output.push({
                            title: item.ptz_curisingPoint_name,
                            vis: item.image_base64.vis,
                            ir: item.image_base64.ir
                        })
                    })
                    state.imgItems = output
                }
                data = null
                feature = null
                method = null
            }
            state.ws4.addEventListener("message", messageEvent)
            // state.wsListener4.message = messageEvent
        } else if ($webSocketconnect04().readyState !== 1) {
            setTimeout(() => {
                openwebsocket04()
            }, 1000)
        }
    }
    openwebsocket04()
}
const sendseries = (e) => {
    console.log('sendseries', e);
}
const inittimerange = () => {
    const inputSelector = '#myInput';

    $(inputSelector).daterangepicker({
        autoUpdateInput: false, // ❗️改成 false，避免預設 override 我們的 writeInput
        startDate: moment().startOf('day'),
        endDate: moment().endOf('day'),
        timePicker: false,
        parentEl: 'body',
        drops: 'down',
        locale: {
            format: 'YYYY-MM-DD HH:mm:ss',
            separator: ' 至 ',
            applyLabel: '確定',
            cancelLabel: '取消',
            fromLabel: '從',
            toLabel: '到',
            customRangeLabel: '自定義範圍',
            weekLabel: '週',
            daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
                '七月', '八月', '九月', '十月', '十一月', '十二月'],
            firstDay: 1
        }
    });

    const picker = $(inputSelector).data('daterangepicker');

    // 插入自訂時間列
    $(inputSelector).on('show.daterangepicker', function () {
        const $c = picker.container;
        if ($c.data('customTimeInjected')) return;

        const $buttons = $c.find('.drp-buttons');
        const custom = $(`
    <div class="drp-custom-time" role="group">
      <div class="group">
        <label>開始時間</label>
        <select id="drp-sh"></select> : 
        <select id="drp-sm"></select> : 
        <select id="drp-ss"></select>
      </div>
      <div class="group">
        <label>結束時間</label>
        <select id="drp-eh"></select> : 
        <select id="drp-em"></select> : 
        <select id="drp-es"></select>
      </div>
    </div>
  `);
        $buttons.before(custom);
        $c.data('customTimeInjected', true);

        function buildOptions(max) {
            let html = '';
            for (let i = 0; i <= max; i++) {
                const v = String(i).padStart(2, '0');
                html += `<option value="${v}">${v}</option>`;
            }
            return html;
        }

        $c.find('#drp-sh,#drp-eh').html(buildOptions(23));
        $c.find('#drp-sm,#drp-em,#drp-ss,#drp-es').html(buildOptions(59));

        custom.on('mousedown click', 'select', e => e.stopPropagation());

        syncSelectsFromPicker();
    });

    // 下拉選時間（不送出，只更新 picker 內部時間）
    $(document).on('change', '#drp-sh,#drp-sm,#drp-ss,#drp-eh,#drp-em,#drp-es', function () {
        applyCustomTimeToPicker(true);
        writeInput(picker);  // ✅ 預覽同步（預設 preview 綁定 input）
        updatePreviewText(); // ✅ 右下角預覽強制刷新
    });

    // 點日期 → 維持原下拉時間（避免變回 00:00:00）
    picker.container.on('click', '.calendar-table td.available', function () {
        const $c = picker.container;
        const sh = +$c.find('#drp-sh').val(),
            sm = +$c.find('#drp-sm').val(),
            ss = +$c.find('#drp-ss').val(),
            eh = +$c.find('#drp-eh').val(),
            em = +$c.find('#drp-em').val(),
            es = +$c.find('#drp-es').val();

        setTimeout(() => {
            const s = picker.startDate.clone().hour(sh).minute(sm).second(ss);
            const e = picker.endDate.clone().hour(eh).minute(em).second(es);
            picker.setStartDate(s);
            picker.setEndDate(e);
            writeInput(picker);
            updatePreviewText();
        }, 0);
    });

    // 確定按下（Apply）才送出，並更新 input + 預覽
    $(inputSelector).on('apply.daterangepicker', function () {
        applyCustomTimeToPicker(false);  // ⚠️ 確保這時更新時間
        writeInput(picker);              // ✅ 寫入 input 顯示
        updatePreviewText();            // ✅ 更新右下角預覽
        sendDateToServer();             // ✅ 送出
    });

    // 切月時同步下拉
    $(inputSelector).on('showCalendar.daterangepicker', function () {
        syncSelectsFromPicker();
    });

    function syncSelectsFromPicker() {
        const s = picker.startDate, e = picker.endDate, $c = picker.container;
        $c.find('#drp-sh').val(s.format('HH'));
        $c.find('#drp-sm').val(s.format('mm'));
        $c.find('#drp-ss').val(s.format('ss'));
        $c.find('#drp-eh').val(e.format('HH'));
        $c.find('#drp-em').val(e.format('mm'));
        $c.find('#drp-es').val(e.format('ss'));

        state.date = [
            s.format('YYYY-MM-DD HH:mm:ss'),
            e.format('YYYY-MM-DD HH:mm:ss')
        ];
    }

    function applyCustomTimeToPicker(silent) {
        const $c = picker.container;
        const sh = +$c.find('#drp-sh').val(),
            sm = +$c.find('#drp-sm').val(),
            ss = +$c.find('#drp-ss').val(),
            eh = +$c.find('#drp-eh').val(),
            em = +$c.find('#drp-em').val(),
            es = +$c.find('#drp-es').val();

        let s = picker.startDate.clone().hour(sh).minute(sm).second(ss);
        let e = picker.endDate.clone().hour(eh).minute(em).second(es);
        if (e.isBefore(s)) e = s.clone();

        picker.setStartDate(s);
        picker.setEndDate(e);
        if (!silent) picker.updateCalendars();

        state.date = [
            s.format('YYYY-MM-DD HH:mm:ss'),
            e.format('YYYY-MM-DD HH:mm:ss')
        ];
    }

    function writeInput(p) {
        const start = p.startDate ?? picker.startDate;
        const end = p.endDate ?? picker.endDate;
        $(inputSelector).val(`${start.format('YYYY-MM-DD HH:mm:ss')} 至 ${end.format('YYYY-MM-DD HH:mm:ss')}`);
    }

    // ✅ 更新右下角預覽文字（同步 input 顯示）
    function updatePreviewText() {
        const $preview = picker.container.find('.drp-selected');
        $preview.text($(inputSelector).val());
    }

    function sendDateToServer() {
        const output = {
            feature: 'history_playback',
            method: 'query_history_cursingPoint',
            session: Math.random().toString(36).substr(2),
            content: {
                field_id: 1,
                selected_time: [{ start_time: state.date[0], end_time: state.date[1] }]
            }
        };
        state.ws4.send(JSON.stringify(output));
    }

}
// const ws041 = ref(null)
// const runws04 = () => {
//     ws041.value = new WebSocket($webSocket04URL())
//     ws041.value.onopen = (e) => {
//         console.log('(plugins)串流連接成功::8704');
//     }
//     ws041.value.onclose = (e) => {
//         console.log("(plugins)串流連接中斷::8704");
//         setTimeout(() => {
//             runws04()
//         }, 3000)
//     }
// }
// const getimgf = (e) => {
//     return 're'
// }
onMounted(() => {
    initws4()
    // runws04() // 給折疊呼叫圖片用
    state.image = state.images[0]
    // 假標籤資料
    // setTimeout(() => {
    //     state.lables = [

    //         {
    //             name: '2',
    //             date: 'M_150',
    //             alarm_ROI: 0,
    //             alarm_smoke: 0,
    //             alarm: 0,
    //             temp_max: 50,
    //             location: 'CAM1 - LOC3',
    //             base64: [
    //                 {
    //                     name: 'CAM 01',
    //                     base64: '/mock/ChatGPT Image 2025年7月3日 下午02_06_07.png'
    //                 }
    //             ]
    //         }, {
    //             name: '3',
    //             date: 'M_188',
    //             alarm_ROI: 0,
    //             alarm_smoke: 0,
    //             alarm: 0,
    //             temp_max: 50,
    //             location: 'CAM1 - LOC3',
    //             base64: [
    //                 {
    //                     name: 'CAM 01',
    //                     base64: '/mock/ChatGPT Image 2025年7月3日 下午02_06_07.png'
    //                 }
    //             ]
    //         }
    //     ]
    //     setTimeout(() => {
    //         state.lables.push({
    //             name: '4',
    //             date: 'M_300',
    //             alarm_ROI: 0,
    //             alarm_smoke: 0,
    //             alarm: 0,
    //             temp_max: 50,
    //             location: 'CAM1 - LOC3',
    //             base64: [
    //                 {
    //                     name: 'CAM 01',
    //                     base64: '/mock/ChatGPT Image 2025年7月3日 下午02_06_07.png'
    //                 }
    //             ]
    //         })
    //         const temp = state.lables
    //         state.lables = []
    //         setTimeout(() => {
    //             state.lables = temp
    //         }, 1)
    //     }, 3000)
    // }, 3000)


    // 視窗移動
    const windowDrag = (e) => {
        var divA = visss12323123.value
        const dragHandle = dragHandle123.value;
        const resizeHandles = resizeHandle123.value;
        const canvas213 = window
        var down = ''
        let isDragging = false;
        let isResizing = false;
        let initialX, initialY, initialWidth, initialHeight, initialMouseX, initialMouseY;

        // 拖曳功能
        dragHandle.addEventListener('mousedown', function (e) {
            isDragging = true;
            initialX = divA.offsetLeft;
            initialY = divA.offsetTop;
            initialMouseX = e.clientX;
            initialMouseY = e.clientY;
            canvas213.addEventListener('mousemove', handleDrag);
            canvas213.addEventListener('mouseup', stopDrag);
            // e.preventDefault(); // 防止文字選取等預設行為
        });

        function handleDrag(e) {
            if (!isDragging) return;
            const dx = e.clientX - initialMouseX;
            const dy = e.clientY - initialMouseY;
            divA.style.left = `${initialX + dx}px`;
            divA.style.top = `${initialY + dy}px`;
            // mapImport2.value.invaliMapSzie()
        }

        function stopDrag() {
            isDragging = false;
            canvas213.removeEventListener('mousemove', handleDrag);
            canvas213.removeEventListener('mouseup', stopDrag);
        }

        // 調整大小功能
        // console.log(resizeHandles);
        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', function (e) {
                isResizing = true;
                initialWidth = divA.offsetWidth;
                initialHeight = divA.offsetHeight;
                initialX = divA.offsetLeft;
                initialY = divA.offsetTop;
                initialMouseX = e.clientX;
                initialMouseY = e.clientY;
                if (e.target.classList.contains('resize-handle-tl')) {
                    down = 'resize-handle-tl'
                } else if (e.target.classList.contains('resize-handle-tr')) {
                    down = 'resize-handle-tr'
                } else if (e.target.classList.contains('resize-handle-bl')) {
                    down = 'resize-handle-bl'
                } else if (e.target.classList.contains('resize-handle-br')) {
                    down = 'resize-handle-br'
                }
                canvas213.addEventListener('mousemove', handleResize);
                canvas213.addEventListener('mouseup', stopResize);
                // e.preventDefault(); // 防止文字選取等預設行為
            });
        });
        function handleResize(e) {
            if (!isResizing) return;
            let min = 300
            let dx = e.clientX - initialMouseX;
            let dy = e.clientY - initialMouseY;
            // mapImport2.value.invaliMapSzie();

            let newWidth = initialWidth;
            let newHeight = initialHeight;
            let newLeft = initialX;
            let newTop = initialY;

            if (down === 'resize-handle-tl') {
                newWidth = Math.max(initialWidth - dx, min);
                newHeight = Math.max(initialHeight - dy, min);

                // 只有當新寬度大於 200 才修改 left
                if (newWidth > min) newLeft = initialX + dx;
                if (newHeight > min) newTop = initialY + dy;
            } else if (down === 'resize-handle-tr') {
                newWidth = Math.max(initialWidth + dx, min);
                newHeight = Math.max(initialHeight - dy, min);

                if (newHeight > min) newTop = initialY + dy;
            } else if (down === 'resize-handle-bl') {
                newWidth = Math.max(initialWidth - dx, min);
                newHeight = Math.max(initialHeight + dy, min);

                if (newWidth > min) newLeft = initialX + dx;
            } else if (down === 'resize-handle-br') {
                newWidth = Math.max(initialWidth + dx, min);
                newHeight = Math.max(initialHeight + dy, min);
            }

            divA.style.width = `${newWidth}px`;
            divA.style.height = `${newHeight}px`;
            divA.style.left = `${newLeft}px`;
            divA.style.top = `${newTop}px`;
            state.tempminmaplocaltion = [newLeft, newTop]
        }


        function stopResize() {
            console.log('stop');
            isResizing = false;
            canvas213.removeEventListener('mousemove', handleResize);
            canvas213.removeEventListener('mouseup', stopResize);
        }
    }
    windowDrag()
    switchWK(true)

    runRowhandle()
    // inittimerange() // 廢掉

})

onUnmounted(() => {
    console.log('HistroyRes Unmounted');
    if (state.wsListener4.close !== null) {
        state.ws4.removeEventListener("close", state.wsListener4.close)
        state.wsListener4.close = null
    }
    if (state.wsListener4.message !== null) {
        state.ws4.removeEventListener("message", state.wsListener4.message)
        state.wsListener4.message = null
    }
    if (state.ws4 !== null) {
        // state.ws.close()
        state.ws4 = null
    }
    if (ws041 !== null) {
        // ws041.close()
        ws041 = null
    }

})
</script>
<style scoped>
.histroy-bar {
    height: 35px;
    border-bottom: 1px solid #c9c9c9;
}

.histroy-canvas {
    box-sizing: border-box;
    width: 100%;
    height: calc(100vh - 43px - 16px - 16px - 5px);
    /* height: calc(100vh - 43px - 16px - 16px); */
    display: grid;
    grid-template-columns: 60% 40%;
    background: #f1f1f1;
}

.histroy-canvas>div {
    max-height: 100%;
    width: 100%;
    /* overflow: auto; */
}

.histroy-canvas *::-webkit-scrollbar {
    width: 7px;
}

.histroy-canvas *::-webkit-scrollbar-button {
    background: transparent;
    border-radius: 4px;
    height: 5px;
}

.histroy-canvas *::-webkit-scrollbar-track-piece {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
}

.histroy-canvas *::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.3);
}

.histroy-canvas * ::-webkit-scrollbar-track {
    box-shadow: transparent;
}

.histroy-rows {
    display: grid;
    /* height: 100%; */
    height: calc(100vh - 43px - 16px - 16px - 30px);
    grid-template-rows: 40% 60%;
    transition: grid-template-rows 0.3s ease;
    /* 平滑動畫 */
}

.histroy-row-handle-bar {
    margin: 5px 0px;
    height: 5px;
    background: #bdbdbd;
    width: 100%;
    border-radius: 5px;
    cursor: n-resize;
    transition: background .2s;
}

.histroy-row-handle-bar:hover {
    background: #a0a0a0;
}

.histroy-row-handle-bar:active {
    background: #646464;
}

.images-main {
    padding-bottom: .25em;
    height: 100%;
    background: #ffffff;
    box-shadow: 1px 1px 3px 3px #0000000f;
    border-radius: 5px;
}

.images-content {
    width: 100%;
    height: 100%;
    background-color: #696464;
    border-radius: .25em;
}

.images-content {
    display: grid;
    grid-template-columns: 15% 85%;
    height: 100%;
}

.image-item {
    cursor: pointer;
    background-color: #EFEFEF;
    padding: .25em;
    transition: all .1s;
    height: 90px;
}

.image-item:hover {
    background-color: #e2e2e2;
}

.image-item:active {
    background-color: #fdfdfd;
}

.image-item-ac {
    opacity: .8;
    background-color: #9c9c9c !important;
}

.image-sor {
    width: 100%;
    height: 100%;
    overflow: auto;
}

.image-add {
    width: 100%;
    height: 64px;
    background-color: #e2e2e2;
}

.images-content-img {
    object-fit: fill;
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
}

.c-res-visss123 {
    position: fixed;
    top: -10000px;
    left: -10000px;
    z-index: 99;
    opacity: 1;
    transition: opacity .3s;
}

.c-res-win-col {
    display: grid;
    grid-template-columns: 718px 1fr;
}

.drag-handle {
    height: 21px;
    background-color: #F2F2F2;
    /* box-shadow: 1px 1px 11px 1px #87878787; */
    cursor: move;
    text-align: start;
    font-size: 15px;
    padding: 0em .5em;
}

.drag-handle-bar {
    height: 25px;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    flex-wrap: nowrap;
}

.c-input {
    border: #999999 1px solid;
    border-radius: .25em;
}
</style>

<style>
.visss1233332131233542 {
    opacity: 0 !important;
    pointer-events: none !important;
}

.calendar-time select {
    -moz-appearance: auto !important;
    -webkit-appearance: auto !important;
    pointer-events: auto !important;
}

.daterangepicker {
    z-index: 20000 !important;
}

.daterangepicker .drp-custom-time {
    clear: both;
    width: 100%;
    border-top: 1px solid #e5e7eb;
    padding: 8px 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    align-items: center;
}

.daterangepicker .drp-custom-time .group {
    display: flex;
    align-items: center;
    gap: 6px;
}

.daterangepicker .drp-custom-time select {
    padding: 4px 6px;
}

.daterangepicker .drp-custom-time label {
    font-size: 12px;
    color: #374151;
    white-space: nowrap;
}
</style>