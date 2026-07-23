<template>
    <div class="windows">
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
                    <!-- <span class="mx-3">{{ state.ptzID }}</span> -->
                    <div style="width: 300px;">
                        <v-select v-model="state.ptzID" :items="state.ptzItems" variant="outlined" hide-details density
                            @update:model-value="changesPage()" :disabled="state.vSelectDisplay"></v-select>
                    </div>
                    <div class="ml-3" style="width: 30px">

                        <v-btn flat block @click="state.diaglogsPTZ = !state.diaglogsPTZ"
                            >
                            <NuxtImg src="/images/fs/雲台控制按鈕.svg" width="30px" />
                        </v-btn>


                    </div>
                    <v-menu :close-on-content-click="false" v-model="state.fovMenu">
                        <template v-slot:activator="{ props }">
                            <div style="width: 28px">
                                <v-btn id="menu-activator" flat block v-bind="props"
                                    >
                                    <NuxtImg src="/images/icon/相機控制icon.png" width="18px" />
                                </v-btn>
                            </div>
                        </template>
                        <div class="camera-pr-canvas">
                            <div class="camera-pr-top justify-space-between d-flex px-2 py-1">
                                <div class="camera-pr-title">
                                    相機控制
                                </div>
                                <div style="width: 28px">
                                    <v-btn @click="state.fovMenu = false" flat block>
                                        <NuxtImg src="/images/icon/Group 1663delete.svg" width="18px" />
                                    </v-btn>
                                </div>
                            </div>
                            <v-divider></v-divider>
                            <div class="px-4 py-3">
                                <div class="camera-pr-content-title mb-2">
                                    紅外線影像
                                </div>
                                <div class="d-flex mb-5">
                                    <div class="camera-pr-content-btn" @click="fovsubmit('ir_autoFocus')">
                                        自動對焦
                                    </div>
                                    <div class="camera-pr-content-btn ml-2" @click="fovsubmit('ir_nuc')">
                                        NUC校正
                                    </div>
                                </div>
                                <v-divider class="mb-4"></v-divider>
                                <div class="camera-pr-content-title mb-2">
                                    可見光影像
                                </div>
                                <div class="d-flex align-center">
                                    <div class="camera-pr-content-btn mr-2" @click="fovsubmit('vis_autoFocus')">
                                        自動對焦
                                    </div>
                                    <div class="mr-2">
                                        視野
                                    </div>
                                    <div style="width: 180px;" class="mr-2">
                                        <v-slider v-model="state.visFov" hide-details depressed small tile block
                                            color="#EBF7FF" min="1" max="23" @end="fovsubmit('vis_fov')"></v-slider>
                                    </div>
                                    <div style="width: 60px;" id="fov-input123">
                                        <v-form validate-on="submit" @submit.prevent="fovsubmit('vis_fov')">
                                            <!-- <input type="number" value="23" name="visFov" /> -->
                                            <v-text-field type="number" v-model="state.visFov" hide-details depressed
                                                small block variant="outlined" min="1" max="23"></v-text-field>
                                            <v-btn type="submit" class="hidden-btn"></v-btn>
                                        </v-form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </v-menu>
                </div>
                <template v-if="state.refreshPage === 0">
                    <div class="c-grid-ptz">
                        <div class="c-grid-ptz-col">
                            <ClientOnly>
                                <MapDefault :formtData="state" @dataFromChild="handleDataFromChild" :mainProps="''"
                                    :camID="state.ptzID" camType="ir" />
                                <MapDefault :formtData="state" @dataFromChild="handleDataFromChild" :mainProps="''"
                                    :camID="state.ptzID" camType="vis" />
                            </ClientOnly>
                        </div>
                        <!-- control ptz -->
                        <div class="c-grid-ptz-col">
                            <div>
                                <div class="d-flex justify-space-between py-1"
                                    style="border-bottom: 2px solid #878787;">
                                    <div>預設點參數設置</div>
                                    <div class="d-flex">
                                        <span class="mr-3">參數設定</span>
                                        <div class="c-switch-lo" style="width: 150px;pointer-events: none;opacity: .5;">
                                            <div class="c-switch-a"
                                                :class="!state.cursingPorintScanningType ? 'c-switch-foucs' : 'c-switch-after-add'"
                                                @click="cursingPorintScanningTypeEvent(false)">
                                                單點建立
                                            </div>
                                            <div class="c-switch-b"
                                                :class="state.cursingPorintScanningType ? 'c-switch-foucs' : ''"
                                                @click="cursingPorintScanningTypeEvent(true)">自動扇掃
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: grid;grid-template-columns: 47% 53%;">
                                    <div class="d-flex justify-center align-center">
                                        <NuxtImg src="/images/fs/icon/Thermal FS.svg" />
                                    </div>
                                    <div>
                                        <!-- 單點 -->
                                        <div class="ptz-input-grid-table">
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">單點</div>
                                            </div>
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">水平角</div>
                                                <div class="w-50 px-1">
                                                    <v-text-field v-model="state.cursingRange_base_single[0]"
                                                        hide-details density="compact"
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number" hide-spin-buttons
                                                        style="pointer-events: none;opacity: .5;"></v-text-field>
                                                </div>
                                            </div>
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">垂直角</div>
                                                <div class="w-50  px-1">
                                                    <v-text-field v-model="state.cursingRange_base_single[1]"
                                                        hide-details density="compact"
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number" hide-spin-buttons
                                                        style="pointer-events: none;opacity: .5;"></v-text-field>
                                                </div>
                                            </div>
                                            <div>
                                                <v-btn class="mt-1"
                                                    style="font-size: 23px;pointer-events: none;opacity: .5;"
                                                    color="#6795D4" block density="compact"
                                                    @click="saveCursingRange('sig')"
                                                    :disabled="state.cursingPorintScanningType">+</v-btn>
                                            </div>
                                        </div>
                                        <!-- 自動扇掃 -->
                                        <div class="d-flex w-100 mt-5 mb-1 align-center">
                                            <div class="ptz-text">拍攝區域</div>
                                        </div>
                                        <div class="ptz-input-grid-table">
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">右上</div>
                                            </div>
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">水平角</div>
                                                <div class="w-50 px-1">
                                                    <v-text-field v-model="state.cursingRange_base_multi[0]"
                                                        class="c-sdisables" hide-details density="compact"
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number" hide-spin-buttons></v-text-field>
                                                </div>
                                            </div>
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">垂直角</div>
                                                <div class="w-50  px-1">
                                                    <v-text-field v-model="state.cursingRange_base_multi[1]"
                                                        class="c-sdisables" hide-details density="compact"
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number" hide-spin-buttons></v-text-field>
                                                </div>
                                            </div>
                                            <div>
                                                <v-btn class="mt-1 c-sdisables" style="font-size: 23px;" color="#6795D4"
                                                    block @click="saveCursingRange('RT')"
                                                    :disabled="!state.cursingPorintScanningType">+</v-btn>
                                            </div>
                                        </div>
                                        <div class="ptz-input-grid-table">
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">右下</div>
                                            </div>
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">水平角</div>
                                                <div class="w-50 px-1">
                                                    <v-text-field v-model="state.cursingRange_base_multi[2]"
                                                        hide-details density="compact"
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number" hide-spin-buttons
                                                        class="c-sdisables"></v-text-field>
                                                </div>
                                            </div>
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">垂直角</div>
                                                <div class="w-50  px-1">
                                                    <v-text-field v-model="state.cursingRange_base_multi[3]"
                                                        hide-details density="compact"
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number" hide-spin-buttons
                                                        class="c-sdisables"></v-text-field>
                                                </div>
                                            </div>
                                            <div>
                                                <v-btn class="mt-1 c-sdisables" style="font-size: 23px;" color="#6795D4"
                                                    block @click="saveCursingRange('RB')"
                                                    :disabled="!state.cursingPorintScanningType">+</v-btn>
                                            </div>
                                        </div>
                                        <div class="d-flex w-100 mt-16 mb-3 align-center">
                                            <div class="ptz-text">排除區域</div>
                                            <div class="ml-3 c-sdisables">
                                                <v-btn-toggle color="#6795D4" v-model="state.toggle_exclusive"
                                                    :border="true" density="compact">
                                                    <v-btn value="1" style="width:23px;">1</v-btn>
                                                    <v-btn value="2" style="width:23px;">2</v-btn>
                                                    <v-btn value="3" style="width:23px;">3</v-btn>
                                                    <v-btn value="4" style="width:23px;">4</v-btn>
                                                    <v-btn value="5" style="width:23px;">5</v-btn>
                                                </v-btn-toggle>
                                            </div>
                                        </div>
                                        <div class="ptz-input-grid-table">
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">右上</div>
                                            </div>
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">水平角</div>
                                                <div class="w-50 px-1">
                                                    <v-text-field
                                                        v-model="state.ptzCuringInputItems[state.toggle_exclusive - 1][0]"
                                                        hide-details density="compact"
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number" hide-spin-buttons
                                                        class="c-sdisables"></v-text-field>
                                                </div>
                                            </div>
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">垂直角</div>
                                                <div class="w-50  px-1">
                                                    <v-text-field
                                                        v-model="state.ptzCuringInputItems[state.toggle_exclusive - 1][1]"
                                                        hide-details density="compact"
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number" hide-spin-buttons
                                                        class="c-sdisables"></v-text-field>
                                                </div>
                                            </div>
                                            <div>
                                                <v-btn class="mt-1 c-sdisables" style="font-size: 23px;" color="#6795D4"
                                                    block @click="saveCursingRange('of', state.toggle_exclusive)"
                                                    :disabled="!state.cursingPorintScanningType">+</v-btn>
                                            </div>
                                        </div>
                                        <div class="ptz-input-grid-table">
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">右下</div>
                                            </div>
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">水平角</div>
                                                <div class="w-50 px-1">
                                                    <v-text-field
                                                        v-model="state.ptzCuringInputItems[state.toggle_exclusive - 1][2]"
                                                        hide-details density="compact"
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number" hide-spin-buttons
                                                        class="c-sdisables"></v-text-field>
                                                </div>
                                            </div>
                                            <div class="d-flex w-100 my-1 align-center">
                                                <div class="ptz-text">垂直角</div>
                                                <div class="w-50  px-1">
                                                    <v-text-field
                                                        v-model="state.ptzCuringInputItems[state.toggle_exclusive - 1][3]"
                                                        hide-details density="compact"
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number" hide-spin-buttons
                                                        class="c-sdisables"></v-text-field>
                                                </div>
                                            </div>
                                            <div>
                                                <v-btn class="mt-1 c-sdisables" style="font-size: 23px;" color="#6795D4"
                                                    block @click="saveCursingRange('ofs', state.toggle_exclusive)"
                                                    :disabled="!state.cursingPorintScanningType">+</v-btn>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="d-flex justify-space-evenly py-1">
                                    <div class="d-flex align-center">
                                        <div class="mr-3">巡弋路徑</div>
                                        <div style="width: 200px;">
                                            <v-text-field variant="outlined" value="巡弋路徑_1" disabled hide-details
                                                hide-spin-buttons density="compact" class="c-sdisables"></v-text-field>
                                        </div>
                                    </div>
                                    <v-divider class="ms-3" inset vertical></v-divider>
                                    <div class="d-flex align-center">
                                        <div class="mr-3">預設點名稱</div>
                                        <div style="width: 200px;">
                                            <v-text-field v-model="state.cursing_name" variant="outlined" hide-details
                                                hide-spin-buttons density="compact" class="c-sdisables"></v-text-field>
                                        </div>
                                        <div class="ml-1 mt-1">
                                            <v-btn id="menu-activator" flat color="#6795D4" block class="c-sdisables"
                                                :disabled="state.cursing_name === ''" @click="setBuildCursingPoint">
                                                <span style="color:#fff;">{{
                                                    !state.cursingPorintScanningType ? '新增預設點' : '開始建制扇掃預設點' }}</span>
                                            </v-btn>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- control ptz end -->
                            <ClientOnly>
                                <!-- <MapDefault ref="mapImport1" :formtData="state" :mainMode="[]"
                                    @dataFromChild="handleDataFromChild" :mainProps="''" :camID="1" camType="vis"
                                    :usePhoto="true" /> -->
                                <MapCameraphoto ref="mapImport3" :formtData="state" :mainProps="''" :camID="state.ptzID"
                                    camType="vis" :ptzinto="state.ptzinto" :ptzAlarmID="state.alarmID" @toTab="toTab"
                                    @mapSetMapPtzStatus="ptzswitchEvent" @mapSetCursingPint="changeCursingPoint" />
                            </ClientOnly>
                        </div>
                    </div>
                </template>
                <template v-if="state.refreshPage === 1">
                    切換中
                </template>
            </div>
        </div>
        <v-dialog v-model="state.sweeingDialogs" width="auto" persistent>
            <v-card max-width="400" :text="state.sweeingMassage" title="建立扇掃預設點中">
            </v-card>
        </v-dialog>
        <div class="ptz-control-dialogs" id="groupwindowObject"
            :style="!state.diaglogsPTZ ? 'opacity: 0; pointer-events: none;' : ''">
            <v-divider class="my-2"></v-divider>
            <div class="ptz-status-grid">
                <div class="text-center">巡弋狀態</div>
                <div class="c-switch-lo">
                    <div class="c-switch-a" :class="state.ptzswitch === 1 ? 'c-switch-foucs' : 'c-switch-after-add'"
                        @click="ptzswitchEvent(1)">
                        閒置中
                    </div>
                    <div class="c-switch-b" :class="state.ptzswitch === 2 ? 'c-switch-foucs' : ''"
                        @click="ptzswitchEvent(2)">
                        巡弋中
                    </div>
                </div>
                <div></div>
            </div>
            <div class="w-100 d-flex justify-center position-relative">
                <div class="ptz-control">
                    <NuxtImg src="/images/控制圓盤.svg" style="width: 100%;margin-left: -4px;" />
                    <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-top"
                        @mousedown="state.ptzControlStatus = 'up', sendPtzControl()"
                        @mouseup="state.ptzControlStatus = 'none'" @mouseout="state.ptzControlStatus = 'none'"></div>
                    <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-bottom"
                        @mousedown="state.ptzControlStatus = 'down', sendPtzControl()"
                        @mouseup="state.ptzControlStatus = 'none'" @mouseout="state.ptzControlStatus = 'none'"></div>
                    <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-left"
                        @mousedown="state.ptzControlStatus = 'left', sendPtzControl()"
                        @mouseup="state.ptzControlStatus = 'none'" @mouseout="state.ptzControlStatus = 'none'"></div>
                    <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-right"
                        @mousedown="state.ptzControlStatus = 'right', sendPtzControl()"
                        @mouseup="state.ptzControlStatus = 'none'" @mouseout="state.ptzControlStatus = 'none'"></div>
                </div>
                <div class="patrol-puse-control-canvas" v-if="state.ptzswitch === 2">
                    <div class="patrol-puse-control justify-center align-center d-flex flex-column">
                        <div>巡弋中</div>
                        <div>(如欲控制雲台，請先解除巡弋)</div>
                    </div>
                </div>
            </div>
            <div class="ptz-input-grid">
                <div class="d-flex w-100 my-1 align-center">
                    <div class="ptz-text">水平角</div>
                    <div class="w-50 px-1" style="color: #000000;">
                        <v-text-field v-model="state.ptzCurrentAngle[0]" hide-details
                            @update:modelValue="state.ptzCurrentAngleInput = false" type="number" hide-spin-buttons
                            :disabled="state.ptzswitch === 2"></v-text-field>
                    </div>
                </div>
                <div class="d-flex w-100 my-1 align-center">
                    <div class="ptz-text">垂直角</div>
                    <div class="w-50  px-1" style="color: #000000;">
                        <v-text-field v-model="state.ptzCurrentAngle[1]" hide-details
                            @update:modelValue="state.ptzCurrentAngleInput = false" type="number" hide-spin-buttons
                            :disabled="state.ptzswitch === 2"></v-text-field>
                    </div>
                </div>
                <div>
                    <v-btn class="mt-1" block @click="setPtzCurrentAngle" :disabled="state.ptzswitch === 2">GO</v-btn>
                </div>
            </div>
            <div class="ptz-selection-grid">
                <div class="ptz-selection001-grid w-100 my-1 align-center">
                    <div class="ptz-text">預設點</div>
                    <div class="w-100 px-1" style="color: #000000;">
                        <v-select hide-details :items="state.cursingPointItems" v-model="state.cursingPointValue"
                            @update:modelValue="changeCursingPoint" hide-spin-buttons
                            :disabled="state.ptzswitch === 2"></v-select>
                    </div>
                </div>
                <div>
                    <!-- <v-btn class="mt-1" block>回到前預設點</v-btn> -->
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
    diaglogsPTZ: false,
    sweeingDialogs: false,
    sweeingMassage: '',
    ptzControlStatus: 'none',
    refreshPage: 0,
    vSelectDisplay: false,
    pageItems: [{
        name: '單機監測/室外堆置區1',
        to: 'map',
        camID: 1,
        id: Math.random().toString(36).substr(2),
        stoptime: 10,
        alarm: false,
    }, {
        name: '單機監測/室外堆置區2',
        to: 'map',
        camID: 2,
        id: Math.random().toString(36).substr(2),
        stoptime: 10,
        alarm: false,
    }, {
        name: '單機監測/室外堆置區3',
        to: 'map',
        camID: 3,
        id: Math.random().toString(36).substr(2),
        stoptime: 10,
        alarm: false,
    }, {
        name: '單機監測/室外堆置區4',
        to: 'map',
        camID: 4,
        id: Math.random().toString(36).substr(2),
        stoptime: 10,
        alarm: false,
    }],
    wsRoiData: null,
    wsRoiData1: null,
    mainMode: 'roi', // review = 監控模式 ,roi = ROI模式,mask = MASK模式,mask-temp-select = 溫度區域選取模式
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
    cursingPorintScanningType: false,
    ptzswitch: false,
    ptzCurrentAngle: [0, 0],
    ptzCurrentAngleInput: true,
    cursingPointItems: [],
    cursingPointValue: 0,
    ptzID: 1,
    // ptzItems: [{
    //     title: '資料載入中',
    //     value: 0
    // }],
    ptzItems: [],
    toggle_exclusive: "1",
    cursingRange_base_single: [0, 0],
    cursingRange_base_multi: [0, 0, 0, 0],
    ptzCuringInputItems: [
        [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]
    ],
    cursing_name: '',
    fovMenu: false,
    visFov: 23
})
const toTab = () => {
    console.log('toTab');
}
const fovsubmit = (type) => {
    console.log('fovsubmit');
    state.visFov = parseFloat(state.visFov).toFixed(1)
    var output = {
        "feature": "camera",
        "method": "set_lensFovFocus",
        "session": Math.random().toString(36).substr(2),
        "content": {
            "camera_id": state.ptzID,
            "ir_autoFocus": type === 'ir_autoFocus' ? 1 : 0,
            "ir_nuc": type === 'ir_nuc' ? 1 : 0,
            "vis_autoFocus": type === 'vis_autoFocus' ? 1 : 0,
            "vis_fov": type === 'vis_fov' ? parseFloat(state.visFov) : 0.0
        }
    }
    state.ws3.send(JSON.stringify(output))
}
const changesPage = () => {
    state.refreshPage = 1
    state.vSelectDisplay = true
    setTimeout(() => {
        state.refreshPage = 0
        state.vSelectDisplay = false
    }, 1000)
}
const handleDataFromChild = () => {
    console.log('handleDataFromChild');
}
const ptzswitchEvent = (e) => {
    // if (e) {
    state.ptzswitch = e
    // } else {
    // state.ptzswitch = 1
    // }
    var output = {
        "feature": "ptz",
        "method": "set_cursingStatus",
        "content": {
            "ptz_id": state.ptzID,
            "cursing_status": e === 1 ? 0 : 1
        },
        "session": Math.random().toString(36).substr(2),
    }
    // console.log("output", output);
    state.ws3.send(JSON.stringify(output))
}

const cursingPorintScanningTypeEvent = (e) => {
    if (e) {
        state.cursingPorintScanningType = true
    } else {
        state.cursingPorintScanningType = false
    }
    // var output = {
    //     "feature": "ptz",
    //     "method": "set_cursingStatus",
    //     "content": {
    //         "ptz_id": state.ptzinto.id,
    //         "cursing_status": e ? 1 : 0
    //     },
    //     "session": Math.random().toString(36).substr(2),
    // }
    // state.ws3.send(JSON.stringify(output))
}
const setPtzCurrentAngle = () => {
    state.ptzCurrentAngleInput = true
    let intArray = state.ptzCurrentAngle.map(value => Number(value));
    var output = {
        "feature": "ptz",
        "method": "set_PtzAngle",
        "content": {
            "ptz_id": state.ptzID,
            "ptz_currentAngle": intArray
        },
        "session": Math.random().toString(36).substr(2),
    }
    state.ws3.send(JSON.stringify(output))
}
const changeCursingPoint = (e) => {
    // console.log('changeCursingPoint', e);
    var output = {
        "feature": "ptz",
        "method": "set_cursingPoint",
        "content": {
            "ptz_id": state.ptzID,
            "cursingPoint_id": e
        },
        "session": Math.random().toString(36).substr(2),
    }
    state.ws3.send(JSON.stringify(output))
}
const sendPtzControl = () => {
    if (state.ptzControlStatus !== 'none') {
        // console.log('ptz', state.ptzControlStatus);
        var output = {
            "feature": "ptz",
            "method": "set_continuousMove",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "ptz_id": state.ptzID,
                "ptz_continuousMove": state.ptzControlStatus,
            }
        }
        state.ws3.send(JSON.stringify(output))
        setTimeout(() => {
            if (state.ptzControlStatus !== 'none') {
                sendPtzControl()
            }
        }, 300)
    }
}
const setBuildCursingPoint = (e) => {
    // console.log('changeCursingPoint', e);
    var output = {
        "feature": "ptz",
        "method": "set_buildCursingPoint",
        "content": {
            "ptz_id": state.ptzID,
            "cursingPoint_name": state.cursing_name,
            "build_mode": !state.cursingPorintScanningType ? 1 : 2,
            "cursingRange_base": !state.cursingPorintScanningType ? state.cursingRange_base_single : state.cursingRange_base_multi,
            "cursingRange_ignore": !state.cursingPorintScanningType ? undefined : state.ptzCuringInputItems
        },
        "session": Math.random().toString(36).substr(2),
    }
    console.log("setBuildCursingPoint", output);
    state.ws3.send(JSON.stringify(output))
}
const saveCursingRange = (e, id) => {
    if (e === 'sig') {
        state.cursingRange_base_single[0] = state.ptzCurrentAngle[0]
        state.cursingRange_base_single[1] = state.ptzCurrentAngle[1]
    } else if (e === 'RT') {
        state.cursingRange_base_multi[0] = state.ptzCurrentAngle[0]
        state.cursingRange_base_multi[1] = state.ptzCurrentAngle[1]
    } else if (e === 'RB') {
        state.cursingRange_base_multi[2] = state.ptzCurrentAngle[0]
        state.cursingRange_base_multi[3] = state.ptzCurrentAngle[1]
    } else if (e === 'of') {
        state.ptzCuringInputItems[id - 1][0] = state.ptzCurrentAngle[0]
        state.ptzCuringInputItems[id - 1][1] = state.ptzCurrentAngle[1]
    } else if (e === 'ofs') {
        state.ptzCuringInputItems[id - 1][2] = state.ptzCurrentAngle[0]
        state.ptzCuringInputItems[id - 1][3] = state.ptzCurrentAngle[1]
    }
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
            let output = {
                "feature": "layout",
                "method": "query_overallTabContainer",
                "session": Math.random().toString(36).substr(2),
                "content": {}
            }
            state.ws3.send(JSON.stringify(output))
            const colseEvent = () => {
                setTimeout(() => {
                    openwebsocket03()
                }, 1000)
            }
            state.ws3.addEventListener("close", colseEvent)
            state.wsListener3.close = colseEvent
            // var tew = 0
            const messageEvent = (event) => {
                let data = JSON.parse(event.data)
                let feature = data.feature
                let method = data.method
                if (feature === "layout" && method === "query_overallTabContainer") {
                    let layout = data.content
                    let items = []
                    let first = true
                    for (let i = 0; i < layout.length; i++) {
                        if (layout[i].tab_type === 1) {
                            if (first) {
                                state.ptzID = layout[i].container_list[0].container_camera_id
                                first = false
                            }
                            items.push({
                                title: layout[i].tab_name,
                                value: layout[i].container_list[0].container_camera_id
                            })
                        } 
                    }
                    state.ptzItems = items
                }

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
                // var ptzItems = []
                // var ptzContent = data.overall_ptzStatus.ptz_content
                // ptzContent.forEach((item1, index1) => {
                //     item1.ptz_name
                //     ptzItems.push({
                //         title: item1.ptz_name,
                //         value: index1
                //     })
                // })
                // state.ptzItems = ptzItems
                // console.log(ptzContent[state.ptzTitle]);
                // state.ptzCurrentAngle = ptzContent[state.ptzTitle].ptz_currentAngle
                // console.log(ptzContent[state.ptzTitle].ptz_currentAngle);
                var arr = [{
                    title: '-',
                    value: 0
                }]
                var ptzContent = data.overall_ptzStatus.ptz_content
                ptzContent.forEach((item1) => {
                    // 預設點
                    if (item1.ptz_id === state.ptzID) {
                        var ptzCursingPointsContent = item1.ptz_cursingPoints_content
                        ptzCursingPointsContent.forEach((item1) => {
                            // console.log('預設點', item1);
                            arr.push({
                                title: item1.cursingPoint_name,
                                value: item1.cursingPoint_id
                            })
                        })
                    }
                })
                state.cursingPointItems = arr
                var findPtz = data.overall_ptzStatus.ptz_content.findIndex((item) => item.ptz_id === state.ptzID)
                // console.log('findPtz', ptzContent[findPtz]);
                state.ptzswitch = ptzContent[findPtz].ptz_working_status
                if (ptzContent[findPtz].ptz_working_status === 3) {
                    state.sweeingDialogs = true
                    state.sweeingMassage = ptzContent[findPtz].ptz_sweepStatus
                } else {
                    state.sweeingDialogs = false
                }
                if (state.ptzCurrentAngleInput) {
                    state.ptzCurrentAngle = ptzContent[findPtz].ptz_currentAngle
                }
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

    // setInterval(() => {
    //     let intArray = state.ptzCuringInputItems.map(obj => ([obj[0] = parseInt(obj[0], 10), obj[1] = parseInt(obj[1], 10), obj[2] = parseInt(obj[2], 10), obj[3] = parseInt(obj[3], 10)]));

    //     console.log(intArray);
    // }, 1000);
    var window1 = document.body
    var divtemppostion = {
        x: 0,
        y: 0
    }
    var templocation = {
        x: 0,
        y: 0
    }
    var focusTemp = null
    window1.addEventListener("mousedown", (e) => {
        templocation.x = e.clientX
        templocation.y = e.clientY
    })
    window1.addEventListener("mousemove", (e) => {
        if (focusTemp !== null) {
            var nl = {
                x: templocation.x - e.clientX,
                y: templocation.y - e.clientY
            }
            focusTemp.style.left = (divtemppostion.x - nl.x) + 'px'
            focusTemp.style.top = (divtemppostion.y - nl.y) + 'px' // 限制只能左右移動
        }
    })
    var tooltipClick = document.getElementById('groupwindowObject')
    tooltipClick.addEventListener('mousedown', (e) => {
        focusTemp = tooltipClick
        divtemppostion.x = tooltipClick.getBoundingClientRect().x;
        divtemppostion.y = tooltipClick.getBoundingClientRect().y;
    })
    tooltipClick.addEventListener('mouseup', (e) => {
        focusTemp = null
    })
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
    height: 849px;
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
    grid-template-rows: 60% 40%;
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
    position: fixed;
    bottom: 6%;
    width: 370px;
    height: 466px;
    border: 2px #878787 solid;
    padding: .5em;
    border-radius: 5px;
    z-index: 1;
}

.ptz-text {
    font-size: 18px;
    color: #878787;
}

.ptz-control {
    position: relative;
    width: 80%;
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
    grid-template-columns: 40% 40% 20%
}

.ptz-selection-grid {
    display: grid;
    grid-template-columns: 60% 40%;
}

.ptz-selection001-grid {
    display: grid;
    grid-template-columns: 26% 74%;
}

.ptz-input-grid-table {
    display: grid;
    grid-template-columns: 18% 36% 36% 9%;
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
.c-sdisables {
    pointer-events: none;
    opacity: .5;
}
</style>