<template>
    <!-- 刪除行 001 -->
    <div class="item-card-top d-flex justify-space-between">
        <div>-</div>
        <div class="d-flex">
            <!-- 畫面物件顯示設定 -->
            <v-menu :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                    <div style="width: 25px">
                        <v-btn id="menu-activator12" flat block v-bind="props" @click="operation">
                            <img src="/images/eye-on.png" width="30px" />
                        </v-btn>
                    </div>
                </template>
                <v-card class="pa-3" color="rgb(255 255 255 / 100%)" min-width="400">
                    <div class="d-flex justify-space-between align-center mb-2">
                        <div class="d-flex align-center">
                            <div>最大溫度</div>
                        </div>
                        <div class="">
                            <div class="switch-field py-0 my-0 px-1">
                                <div class="c-switch-lo1">
                                    <div class="c-switch-a1"
                                        :class="state.displayObject10 ? 'c-switch-foucs1' : 'c-switch-after-add1'"
                                        @click="tempdisplay(true)">
                                        ON
                                    </div>
                                    <div class="c-switch-b1" :class="!state.displayObject10 ? 'c-switch-foucs1' : ''"
                                        @click="tempdisplay(false)">OFF
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <template v-for="(item, index) in state.queryAllOperationStatusTable" :key="index">
                        <!-- feature_type : 1 = 只有按鈕開關 feature_type : 2 = 有silder -->
                        <div class="d-flex justify-space-between align-center mb-2" v-if="item.feature_type === 1">
                            <div class="d-flex align-center">
                                <div>{{ item.feature_name }}</div>
                            </div>
                            <div class="">
                                <div class="switch-field py-0 my-0 px-1">
                                    <div class="c-switch-lo1">
                                        <div class="c-switch-a1"
                                            :class="item.working_status === 1 ? 'c-switch-foucs1' : 'c-switch-after-add1'"
                                            @click="changeStatus(index, 1)">
                                            ON
                                        </div>
                                        <div class="c-switch-b1"
                                            :class="item.working_status === 0 ? 'c-switch-foucs1' : ''"
                                            @click="changeStatus(index, 0)">OFF
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex justify-space-between align-center mb-2" v-if="item.feature_type === 2">
                            <div class="d-flex align-center">
                                <div>{{ item.feature_name }}</div>
                                <div>
                                    <v-menu min-width="600" :close-on-content-click="false">
                                        <template v-slot:activator="{ props }">
                                            <div style="width: 25px">
                                                <v-btn v-bind="props" flat block>
                                                    <img src="/images/setting.png" width="30px" />
                                                </v-btn>
                                                <!-- <span>設定範圍</span> -->
                                            </div>
                                        </template>
                                        <v-card class="pa-3" color="rgb(255 255 255 / 100%)" min-width="300">
                                            <div>
                                                <div class="d-flex">
                                                    <div>
                                                        <img class="" alt="line" src="/images/setting.png"
                                                            width="20px" />
                                                    </div>
                                                    <div>{{ item.feature_name }} 設定</div>
                                                </div>
                                                <div class="d-flex align-center">
                                                    <div style="width:100px;"> {{ item.current_value }}
                                                        {{
                                                        item.feature_unit }}
                                                    </div>
                                                    <div style="width:30px;">
                                                        <v-btn depressed small tile block color="#fff"
                                                            @click="setCustomRangerslider('cameraParamsLowTempFilter-', index)">-</v-btn>
                                                    </div>
                                                    <v-slider v-model="item.current_value" dense hide-details
                                                        @end="(e) => { setCustomRangerslider('set+', index) }"
                                                        :min="item.lower_limit" :max="item.upper_limit"
                                                        @start="state.allsilderSt = true"></v-slider>
                                                    <div style="width:30px">
                                                        <v-btn depressed small tile block color="#fff"
                                                            @click="setCustomRangerslider('cameraParamsLowTempFilter+', index)">+</v-btn>
                                                    </div>
                                                </div>
                                            </div>
                                        </v-card>
                                    </v-menu>
                                </div>
                            </div>
                            <div class="">
                                <div class="switch-field py-0 my-0 px-1">
                                    <div class="c-switch-lo1">
                                        <div class="c-switch-a1"
                                            :class="item.working_status === 1 ? 'c-switch-foucs1' : 'c-switch-after-add1'"
                                            @click="changeStatus(index, 1)">
                                            ON
                                        </div>
                                        <div class="c-switch-b1"
                                            :class="item.working_status === 0 ? 'c-switch-foucs1' : ''"
                                            @click="changeStatus(index, 0)">OFF
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </v-card>
            </v-menu>
            <v-menu :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                    <div style="width: 25px">
                        <v-btn id="menu-activator" flat block v-bind="props">
                            <img src="/images/fs/雲台控制按鈕.svg" width="25px" />
                        </v-btn>
                    </div>
                </template>
                <div class="ptz-control-dialogs">
                    <div class="my-1">
                        <div class="ptz-text">{{ state.ptzinto.name }}</div>
                    </div>
                    <v-divider class="my-2"></v-divider>
                    <div class="ptz-status-grid" style="opacity: .5;">
                        <div class="text-center">巡弋狀態</div>
                        <div class="c-switch-lo">
                            <div class="c-switch-a"
                                :class="state.ptzswitch === 1 ? 'c-switch-foucs' : 'c-switch-after-add'"
                                @click="ptzswitchEvent(1)">
                                閒置中
                            </div>
                            <div class="c-switch-b" :class="state.ptzswitch === 2 ? 'c-switch-foucs' : ''"
                                @click="ptzswitchEvent(2)">巡弋中
                            </div>
                        </div>
                        <div></div>
                    </div>
                    <div class="w-100 d-flex justify-center position-relative">
                        <div class="ptz-control">
                            <img src="/images/控制圓盤.svg" style="width: 100%;margin-left: -4px;"></img>
                            <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-top"
                                @mousedown="state.ptzControlStatus = 'up', sendPtzControl()"
                                @mouseup="state.ptzControlStatus = 'none'" @mouseout="state.ptzControlStatus = 'none'">
                            </div>
                            <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-bottom"
                                @mousedown="state.ptzControlStatus = 'down', sendPtzControl()"
                                @mouseup="state.ptzControlStatus = 'none'" @mouseout="state.ptzControlStatus = 'none'">
                            </div>
                            <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-left"
                                @mousedown="state.ptzControlStatus = 'left', sendPtzControl()"
                                @mouseup="state.ptzControlStatus = 'none'" @mouseout="state.ptzControlStatus = 'none'">
                            </div>
                            <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-right"
                                @mousedown="state.ptzControlStatus = 'right', sendPtzControl()"
                                @mouseup="state.ptzControlStatus = 'none'" @mouseout="state.ptzControlStatus = 'none'">
                            </div>
                        </div>
                        <div class="patrol-puse-control-canvas" v-if="state.ptzswitch === 2">
                            <div class="patrol-puse-control justify-center align-center d-flex flex-column">
                                <div>控制前先切換為閒置中</div>
                            </div>
                        </div>
                    </div>
                    <div class="ptz-input-grid">
                        <div class="d-flex w-100 my-1 align-center">
                            <div class="ptz-text">水平角</div>
                            <div class="w-50 px-1">
                                <v-text-field v-model="state.ptzCurrentAngle[0]" hide-details
                                    @update:modelValue="state.ptzCurrentAngleInput = false" type="number"
                                    hide-spin-buttons :disabled="state.ptzswitch === 2"></v-text-field>
                            </div>
                        </div>
                        <div class="d-flex w-100 my-1 align-center">
                            <div class="ptz-text">垂直角</div>
                            <div class="w-50  px-1">
                                <v-text-field v-model="state.ptzCurrentAngle[1]" hide-details
                                    @update:modelValue="state.ptzCurrentAngleInput = false" type="number"
                                    hide-spin-buttons :disabled="state.ptzswitch === 2"></v-text-field>
                            </div>
                        </div>
                        <div>
                            <v-btn class="mt-1" block @click="setPtzCurrentAngle"
                                :disabled="state.ptzswitch === 2">GO</v-btn>
                        </div>
                    </div>
                    <div class="ptz-selection-grid">
                        <div class="ptz-selection001-grid w-100 my-1 align-center">
                            <div class="ptz-text">預設點</div>
                            <div class="w-100 px-1">
                                <v-select hide-details :items="state.cursingPointItems"
                                    v-model="state.cursingPointValue" @update:modelValue="changeCursingPoint"
                                    hide-spin-buttons :disabled="state.ptzswitch === 2"></v-select>
                            </div>
                        </div>
                        <div>
                            <!-- <v-btn class="mt-1" block>回到前預設點</v-btn> -->
                        </div>
                    </div>
                </div>
            </v-menu>
            <div class="d-flex">
                <div style="width: 30px">
                    <v-btn flat block @click="displayVis" id="openVISbtn">
                        <img src="/images/fs/sadasd.svg" width="30px" />
                    </v-btn>
                </div>
                <div style="background-color: #fff; border: 1px solid #878787;border-radius: 3px;width:448px; height: 386px;"
                    class="pa-3 visss123" id="visss12323123" ref="visss12323123"
                    :class="state.openVISwo ? '' : 'visss123333213123354'">
                    <div class="drag-handle" ref="dragHandle123"></div>
                    <div class="d-flex">
                        <div>影像模式預覽</div>
                    </div>
                    <div style="width:100%; height: calc(100% - 30px);">
                        <ClientOnly>
                            <MapOnlyvideo ref="mapImport2" :formtData="{}" :mainMode="[]" :mainProps="''" :camID="camID"
                                camType="vis" />
                        </ClientOnly>
                    </div>
                    <div class="resize-handle resize-handle-tl" :ref="(e) => refsHandler(e, 0)" style="opacity: 0;">
                    </div>
                    <div class="resize-handle resize-handle-tr" :ref="(e) => refsHandler(e, 1)" style="opacity: 0;">
                    </div>
                    <div class="resize-handle resize-handle-bl" :ref="(e) => refsHandler(e, 2)" style="opacity: 0;">
                    </div>
                    <div class="resize-handle resize-handle-br" :ref="(e) => refsHandler(e, 3)">
                    </div>
                </div>
            </div>
            <!-- 參數設定 -->
            <v-menu :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                    <div style="width: 25px">
                        <v-btn id="menu-activator3" flat block v-bind="props" @click="queryCameraInfo">
                            <img src="/images/setting-icon.png" width="30px" />
                        </v-btn>
                    </div>
                </template>
                <v-card class="pa-3" color="rgb(255 255 255 / 100%)" min-width="158px">
                    <div class="frame-hard-setting">
                        <div class="frame-hard-setting-top d-flex justify-space-between mb-2">
                            <div class="d-flex align-center ml-3 frame-hard-btu">
                                <img class="mr-1" src="/images/connect-normal.png" width="20px" />
                                連線ON
                            </div>
                            <div class="d-flex align-center mr-3 frame-hard-btu" @click="state.frameSettingChange
                                ? state.frameSettingChange = false
                                : state.frameSettingChange = true">
                                <img class="mr-1" src="/images/change-pen.png" width="20px" />
                                編輯

                            </div>
                        </div>
                        <div class="frame-content px-2">
                            <div class="justify-space-between align-center my-1 py-1"
                                v-for="(item, index) in state.screenSettings" :key="index">
                                <div class="pl-1">{{ item.name }}</div>
                                <div v-if="!item.check" :class="item.name === '環境濕度' ? 'd-flex' : ''"
                                    style="width: 40px">
                                    <v-text-field v-model="item.value"
                                        :class="state.frameSettingChange ? 'ml-1' : 'ml-1 openedit'" type="number"
                                        variant="outlined" hide-details hide-spin-buttons block
                                        :disabled="item.name === '穿透率' ? true : state.frameSettingChange">
                                    </v-text-field>
                                    <div v-if="item.name === '環境濕度'">%</div>
                                </div>
                                <div v-else>
                                    <v-checkbox :ripple="false" class="ma-0" hide-details dense
                                        v-model="state.TransmissiondispalyStatus"
                                        :disabled="state.frameSettingChange"></v-checkbox>
                                </div>
                            </div>
                            <template v-if="state.TransmissiondispalyStatus">
                                <div class="justify-space-between align-center my-1 py-1"
                                    v-for="(item, index) in state.Transmissiondispaly" :key="index">
                                    <div class="pl-1">{{ item.name }}</div>
                                    <div v-if="!item.check" style="width: 55px">
                                        <input v-model="item.value" class="ml-1" type="number" style="width: 33px"
                                            :disabled="frameSettingChange" />
                                    </div>
                                    <div v-else>
                                        <v-checkbox :ripple="false" class="ma-0" hide-details dense v-model="item.value"
                                            :disabled="state.frameSettingChange"></v-checkbox>
                                    </div>
                                </div>
                            </template>
                        </div>
                        <div class="text-center mt-2">
                            <v-btn depressed small @click="queryCameraInfo"
                                :loading="state.queryCameraInfoloading">refresh</v-btn>
                            <v-btn depressed small @click="sendCameraInfo"
                                :loading="state.queryCameraInfoloading">SAVE</v-btn>
                        </div>
                    </div>
                </v-card>
            </v-menu>
        </div>
    </div>
    <!-- 刪除行 001  end -->
    <!-- 刪除行 002 -->
    <div class="item-card-top d-flex justify-space-between position-sticky"
        style="top: 0;z-index: 2;background-color: #fff;">
        <div>
        </div>
        <div class="d-flex">
            <v-btn @click="openCtreeview">新增群組</v-btn>
        </div>
    </div>
    <!-- 刪除行 002  end -->


</template>