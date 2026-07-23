<template>
    <div @mousemove="mousemove" @mouseup="mouseup" style="height: 100%;" id="movwwwe">
        <div class="container-canvas">
            <div class="item-canvas">
                <div class="item-card-top d-flex justify-space-between">
                    <div>-</div>
                    <div class="d-flex">
                        <!-- 畫面物件顯示設定 -->
                        <div style="width: 25px">
                            <v-btn id="menu-activator12" flat block @click="operation">
                                <img src="/images/eye-on.png" width="30px" />
                            </v-btn>
                        </div>
                        <v-menu activator="#menu-activator12" :close-on-content-click="false">
                            <v-card class="pa-3" color="rgb(255 255 255 / 100%)" min-width="300">
                                <!-- <div class="d-flex justify-space-between align-center">
                                    <div>溫標</div>
                                    <div class="">
                                        <div class="switch-field py-0 my-0 px-1">
                                            <input id="radio-one-email-notice4" type="radio" name="switch-one4"
                                                value="yes" :checked="state.displayObject4 ? true : false"
                                                @click="state.displayObject4 = true" />
                                            <label for="radio-one-email-notice4">ON</label>
                                            <input id="radio-two-email-notice4" type="radio" name="switch-one4"
                                                value="no" :checked="state.displayObject4 ? false : true"
                                                @click="state.displayObject4 = false" />
                                            <label for="radio-two-email-notice4">OFF</label>
                                        </div>
                                    </div>
                                </div> -->
                                <!-- 超解析影像顯示 -->
                                <div class="d-flex justify-space-between align-center mb-2">
                                    <div class="d-flex align-center">
                                        <div>超解析影像</div>
                                    </div>
                                    <div class="">
                                        <div class="switch-field py-0 my-0 px-1">
                                            <input id="radio-one-email-notice5" type="radio" name="switch-one5"
                                                value="yes" :checked="state.displayObject5 ? true : false"
                                                @click="srshwish(true)" />
                                            <label for="radio-one-email-notice5">ON</label>
                                            <input id="radio-two-email-notice5" type="radio" name="switch-one5"
                                                value="no" :checked="state.displayObject5 ? false : true"
                                                @click="srshwish(false)" />
                                            <label for="radio-two-email-notice5">OFF</label>
                                        </div>
                                    </div>
                                </div>
                                <!-- <div class="d-flex justify-space-between align-center mb-2">
                                    <div>自動加入ROI</div>
                                    <div class="">
                                        <div class="switch-field py-0 my-0 px-1">
                                            <input id="radio-one-email-notice3" type="radio" name="switch-one3"
                                                value="yes" :checked="state.displayObject3 ? true : false"
                                                @click="(e) => { setCustomRangerChange('cameraParams_AutoRoi_Status', 'set', true) }" />
                                            <label for="radio-one-email-notice3">ON</label>
                                            <input id="radio-two-email-notice3" type="radio" name="switch-one3"
                                                value="no" :checked="state.displayObject3 ? false : true"
                                                @click="(e) => { setCustomRangerChange('cameraParams_AutoRoi_Status', 'set', false) }" />
                                            <label for="radio-two-email-notice3">OFF</label>
                                        </div>
                                    </div>

                                </div> -->
                                <!-- <v-divider class="my-2"></v-divider> -->
                                <!-- 高溫區域顯示 -->
                                <!-- <div class="d-flex justify-space-between align-center mb-2">
                                    <div class="d-flex align-center">
                                        <div>高溫區域</div>
                                        <div>
                                            <div style="width: 25px">
                                                <v-btn id="menu-activator12-1" flat block>
                                                    <img src="/images/setting.png" width="30px" />
                                                </v-btn>
                                                <span>畫面物件顯示設定</span>
                                            </div>
                                            <v-menu activator="#menu-activator12-1" min-width="600"
                                                :close-on-content-click="false">
                                                <v-card class="pa-3" color="rgb(255 255 255 / 100%)" min-width="300">
                                                    <div>
                                                        <div class="d-flex">
                                                            <div>
                                                                <img class="" alt="line" src="/images/setting.png"
                                                                    width="20px" />
                                                            </div>
                                                            <div>高溫區域顯示 設定</div>
                                                        </div>
                                                        <div class="d-flex align-center">
                                                            <div style="width:100px;">高溫前 {{
        state.temperatureRanger.toFixed(1) }} % </div>
                                                            <div style="width:30px;">
                                                                <v-btn depressed small tile block color="#fff"
                                                                    @click="settemperatureRanger(0)">-</v-btn>
                                                            </div>
                                                            <v-slider v-model="state.temperatureRanger" dense
                                                                hide-details
                                                                @change="temperatureRangerChange"></v-slider>
                                                            <div style="width:30px">
                                                                <v-btn depressed small tile block color="#fff"
                                                                    @click="settemperatureRanger(1)">+</v-btn>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </v-card>
                                            </v-menu>
                                        </div>
                                    </div>
                                    <div class="">
                                        <div class="switch-field py-0 my-0 px-1">
                                            <input id="radio-one-email-notice6" type="radio" name="switch-one6"
                                                value="yes" :checked="displayObject6 ? true : false"
                                                @click="highTemperatureArea(true)" />
                                            <label for="radio-one-email-notice6">ON</label>
                                            <input id="radio-two-email-notice6" type="radio" name="switch-one6"
                                                value="no" :checked="displayObject6 ? false : true"
                                                @click="highTemperatureArea(false)" />
                                            <label for="radio-two-email-notice6">OFF</label>
                                        </div>
                                    </div>
                                </div> -->
                                <!-- 低溫慮波 -->
                                <!-- <div class="d-flex justify-space-between align-center mb-2">
                                    <div class="d-flex align-center">
                                        <div>低溫濾波</div>
                                        <div>
                                            <div style="width: 25px">
                                                <v-btn id="menu-activator12-2" flat block>
                                                    <img src="/images/setting.png" width="30px" />
                                                </v-btn>
                                                <span>設定範圍</span>
                                            </div>
                                            <v-menu activator="#menu-activator12-2" min-width="600"
                                                :close-on-content-click="false">
                                                <v-card class="pa-3" color="rgb(255 255 255 / 100%)" min-width="300">
                                                    <div>
                                                        <div class="d-flex">
                                                            <div>
                                                                <img class="" alt="line" src="/images/setting.png"
                                                                    width="20px" />
                                                            </div>
                                                            <div>低溫濾波顯示 設定</div>
                                                        </div>
                                                        <div class="d-flex align-center">
                                                            <div style="width:100px;"> {{
        (state.cameraParamsLowTempFilter / 10).toFixed(1)
    }} %
                                                            </div>
                                                            <div style="width:30px;">
                                                                <v-btn depressed small tile block color="#fff"
                                                                    @click="setCustomRangerslider('cameraParamsLowTempFilter', 0)">-</v-btn>
                                                            </div>
                                                            <v-slider v-model="state.cameraParamsLowTempFilter" dense
                                                                hide-details
                                                                @change="(e) => { setCustomRangerChange('cameraParamsLowTempFilter', 'set', e) }"
                                                                min="10" max="350"
                                                                @input="state.allsilderSt = true"></v-slider>
                                                            <div style="width:30px">
                                                                <v-btn depressed small tile block color="#fff"
                                                                    @click="setCustomRangerslider('cameraParamsLowTempFilter', 1)">+</v-btn>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </v-card>
                                            </v-menu>
                                        </div>
                                    </div>
                                    <div class="">
                                        <div class="switch-field py-0 my-0 px-1">
                                            <input id="radio-one-email-notice8" type="radio" name="switch-one8"
                                                value="yes" :checked="state.displayObject8 ? true : false"
                                                @click="setCustomRangerChange('cameraParamsLowTempFilter', 'swh', true)" />
                                            <label for="radio-one-email-notice8">ON</label>
                                            <input id="radio-two-email-notice8" type="radio" name="switch-one8"
                                                value="no" :checked="state.displayObject8 ? false : true"
                                                @click="setCustomRangerChange('cameraParamsLowTempFilter', 'swh', false)" />
                                            <label for="radio-two-email-notice8">OFF</label>
                                        </div>
                                    </div>
                                </div> -->
                                <!-- 影像均衡化 -->
                                <!-- <div class="d-flex justify-space-between align-center">
                                    <div class="d-flex align-center">
                                        <div>影像均衡化</div>
                                        <div>
                                            <div style="width: 25px">
                                                <v-btn id="menu-activator12-3" flat block>
                                                    <img src="/images/setting.png" width="30px" />
                                                </v-btn>
                                                <span>影像均衡化設定</span>
                                            </div>
                                            <v-menu activator="#menu-activator12-3" min-width="600"
                                                :close-on-content-click="false">
                                                <v-card class="pa-3" color="rgb(255 255 255 / 100%)" min-width="300">
                                                    <div>
                                                        <div class="d-flex">
                                                            <div>
                                                                <img class="" alt="line" src="/images/setting.png"
                                                                    width="20px" />
                                                            </div>
                                                            <div>影像均衡化 設定</div>
                                                        </div>
                                                        <div class="d-flex align-center">
                                                            <div style="width:100px;">{{ (state.ClipLimit /
        10).toFixed(1) }} % </div>
                                                            <div style="width:30px;">
                                                                <v-btn depressed small tile block color="#fff"
                                                                    @click="setCustomRangerslider('cameraParams_Clip_limit', 0)">-</v-btn>
                                                            </div>
                                                            <v-slider v-model="state.ClipLimit" dense hide-details
                                                                @change="(e) => { setCustomRangerChange('cameraParams_Clip_limit', 'set', e) }"
                                                                min="10" max="100"
                                                                @input="state.allsilderSt = true"></v-slider>
                                                            <div style="width:30px">
                                                                <v-btn depressed small tile block color="#fff"
                                                                    @click="setCustomRangerslider('cameraParams_Clip_limit', 1)">+</v-btn>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </v-card>
                                            </v-menu>
                                        </div>
                                    </div>
                                    <div class="">
                                        <div class="switch-field py-0 my-0 px-1">
                                            <input id="radio-one-email-notice9" type="radio" name="switch-one9"
                                                value="yes" :checked="state.displayObject9 ? true : false"
                                                @click="setCustomRangerChange('cameraParams_Clip_limit', 'swh', true)" />
                                            <label for="radio-one-email-notice9">ON</label>
                                            <input id="radio-two-email-notice9" type="radio" name="switch-one9"
                                                value="no" :checked="state.displayObject9 ? false : true"
                                                @click="setCustomRangerChange('cameraParams_Clip_limit', 'swh', false)" />
                                            <label for="radio-two-email-notice9">OFF</label>
                                        </div>
                                    </div>
                                </div> -->
                            </v-card>
                        </v-menu>
                        <div style="width: 25px">
                            <v-btn id="menu-activator" flat block>
                                <img src="/images/fs/雲台控制按鈕.svg" width="25px" />
                            </v-btn>
                        </div>
                        <v-menu activator="#menu-activator" :close-on-content-click="false">
                            <div class="ptz-control-dialogs">
                                <div class="my-1">
                                    <div class="ptz-text">{{ state.ptzinto.name }}</div>
                                </div>
                                <v-divider class="my-2"></v-divider>
                                <div class="ptz-status-grid">
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
                                            @mouseup="state.ptzControlStatus = 'none'"
                                            @mouseout="state.ptzControlStatus = 'none'"></div>
                                        <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-bottom"
                                            @mousedown="state.ptzControlStatus = 'down', sendPtzControl()"
                                            @mouseup="state.ptzControlStatus = 'none'"
                                            @mouseout="state.ptzControlStatus = 'none'"></div>
                                        <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-left"
                                            @mousedown="state.ptzControlStatus = 'left', sendPtzControl()"
                                            @mouseup="state.ptzControlStatus = 'none'"
                                            @mouseout="state.ptzControlStatus = 'none'"></div>
                                        <div class="ptz-ctrl-btn-bg ptz-ctrl-btn-right"
                                            @mousedown="state.ptzControlStatus = 'right', sendPtzControl()"
                                            @mouseup="state.ptzControlStatus = 'none'"
                                            @mouseout="state.ptzControlStatus = 'none'"></div>
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
                                        <div class="w-50 px-1">
                                            <v-text-field v-model="state.ptzCurrentAngle[0]" hide-details
                                                @update:modelValue="state.ptzCurrentAngleInput = false" type="number"
                                                hide-spin-buttons></v-text-field>
                                        </div>
                                    </div>
                                    <div class="d-flex w-100 my-1 align-center">
                                        <div class="ptz-text">垂直角</div>
                                        <div class="w-50  px-1">
                                            <v-text-field v-model="state.ptzCurrentAngle[1]" hide-details
                                                @update:modelValue="state.ptzCurrentAngleInput = false" type="number"
                                                hide-spin-buttons></v-text-field>
                                        </div>
                                    </div>
                                    <div>
                                        <v-btn class="mt-1" block @click="setPtzCurrentAngle">GO</v-btn>
                                    </div>
                                </div>
                                <div class="ptz-selection-grid">
                                    <div class="ptz-selection001-grid w-100 my-1 align-center">
                                        <div class="ptz-text">預設點</div>
                                        <div class="w-100 px-1">
                                            <v-select hide-details :items="state.cursingPointItems"
                                                v-model="state.cursingPointValue"
                                                @update:modelValue="changeCursingPoint" hide-spin-buttons></v-select>
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
                                <!-- id="menu-activator123" -->
                                <v-btn flat block @click="displayVis" id="openVISbtn">
                                    <img src="/images/fs/sadasd.svg" width="30px" />
                                </v-btn>
                            </div>
                            <!-- <v-menu activator="#menu-activator123" :close-on-content-click="false"> -->
                            <div style="background-color: #fff; border: 1px solid #878787;border-radius: 3px;width:448px; height: 386px;"
                                class="pa-3 visss123" id="visss12323123"
                                :class="state.openVISwo ? '' : 'visss123333213123354'">
                                <div class="drag-handle"></div>
                                <div class="d-flex">
                                    <div>影像模式預覽</div>
                                </div>
                                <div style="width:100%; height: calc(100% - 30px);">
                                    <ClientOnly>
                                        <MapDefault ref="mapImport2" :formtData="{}" :mainMode="[]"
                                            @dataFromChild="handleDataFromChild" :mainProps="''" :camID="camID"
                                            camType="vis" />
                                    </ClientOnly>
                                </div>
                                <div class="resize-handle resize-handle-tl"></div>
                                <div class="resize-handle resize-handle-tr"></div>
                                <div class="resize-handle resize-handle-bl"></div>
                                <div class="resize-handle resize-handle-br"></div>
                            </div>
                            <!-- </v-menu> -->
                        </div>
                        <!-- <div class="ml-2" style="width: 30px">
                            <v-btn flat block>
                                <img src="/images/fs/按鈕控制.svg" width="30px" />
                            </v-btn>
                        </div>
                        <div class="ml-2" style="width: 30px">
                            <v-btn flat block>
                                <img src="/images/fs/圖層開關.svg" width="30px" />
                            </v-btn>
                        </div>
                        <div class="ml-2" style="width: 30px">
                            <v-btn flat block>
                                <img src="/images/fs/照片安紐.svg" width="30px" />
                            </v-btn>
                        </div>
                        <div class="ml-2" style="width: 30px">
                            <v-btn flat block>
                                <img src="/images/fs/設定按鈕1.svg" width="30px" />
                            </v-btn>
                        </div>
                        <div class="ml-2" style="width: 30px">
                            <v-btn flat block>
                                <img src="/images/fs/sadasd.svg" width="30px" />
                            </v-btn>
                        </div> -->
                        <!-- 參數設定 -->
                        <div style="width: 25px">
                            <v-btn id="menu-activator3" flat block @click="queryCameraInfo">
                                <img src="/images/setting-icon.png" width="30px" />
                            </v-btn>
                            <!-- <span>參數設定</span> -->
                        </div>
                        <v-menu activator="#menu-activator3" :close-on-content-click="false">
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
                                                    :class="state.frameSettingChange ? 'ml-1' : 'ml-1 openedit'"
                                                    type="number" variant="outlined" hide-details hide-spin-buttons
                                                    block
                                                    :disabled="item.name === '穿透率' ? true : state.frameSettingChange">
                                                </v-text-field>
                                                <!--  :disabled="item.name === '穿透率' ? true : state.frameSettingChange" :style="item.name === '環境濕度' ? 'width: 70px' : 'width: 80px'" -->
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
                                                    <input v-model="item.value" class="ml-1" type="number"
                                                        style="width: 33px" :disabled="frameSettingChange" />
                                                </div>
                                                <div v-else>
                                                    <v-checkbox :ripple="false" class="ma-0" hide-details dense
                                                        v-model="item.value"
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
                    <!-- <div class="item-select" style="width:100px">
                        <v-select :items="state.areaItems" v-model="state.area" dense outlined hide-details
                            full-width></v-select>
                    </div>
                    <div class="item-select ml-3" style="width:100px">
                        <v-select :items="state.cameraItems" v-model="state.camera" dense outlined hide-details
                            full-width></v-select>
                    </div> -->
                    <!-- <v-btn @click="putVideo()">切換預覽模式</v-btn>
                    <v-btn @click="requestBtnGroupEvent('remove')">清除</v-btn>
                    <v-btn @click="requestBtnGroupEvent('spot')">spot</v-btn>
                    <v-btn @click="requestBtnGroupEvent('line')">line</v-btn>
                    <v-btn @click="requestBtnGroupEvent('scope')">scope</v-btn>
                    <v-btn @click="requestBtnGroupEvent('blob')" id='hint-0001'>blob</v-btn> -->
                    <!-- <div class="item-select ml-3" style="width:100px">
                        <v-select :items="state.mainModeItems" v-model="state.mainMode" dense outlined hide-details
                            full-width></v-select>
                    </div> -->
                </div>
                <div class="item-card-content position-relative" id="map-top-b" style="z-index: 0;">
                    <div class="Thermal-bar-w" :style="!state.displayObject4 ? 'display:none;' : ''">
                        <form @submit.prevent="setColorbarTemp">
                            <div class="text-center">
                                <!-- <v-btn elevation="1" type="submit" name="maxAuto" x-small dark>Auto</v-btn> -->
                                <v-btn elevation="1" name="maxAuto" x-small dark @click="setColorbarTemp('MaxBtn')"
                                    :disabled="state.ColorMaxAuto">Auto</v-btn>
                                <br />
                                <input type="number" v-model="state.colorbar.max" name="maxTemp"
                                    @focus="state.focusColorMax = true" @blur="state.focusColorMax = false"
                                    @change="(e) => { setColorbarTemp('inputMax', e) }" />°C
                                <!-- <v-text-field color="#fff" type="number" :value="colorbar.max"></v-text-field>°C -->
                            </div>
                            <div class="text-center">
                                <img :src="state.thermalimg" />
                            </div>
                            <div class="text-center">
                                <input type="number" name="minTemp" v-model="state.colorbar.min"
                                    @focus="state.focusColorMin = true" @blur="state.focusColorMin = false"
                                    @change="(e) => { setColorbarTemp('inputMin', e) }" />°C<br />
                                <v-btn elevation="1" x-small dark name="minAuto" @click="setColorbarTemp('MinBtn')"
                                    :disabled="state.ColorMinAuto">Auto</v-btn>
                            </div>
                        </form>
                    </div>
                    <!-- <mapImport ref="mapImport1" :wsRoiData="wsRoiData" :mainMode="mainMode" /> -->
                    <!-- 測試MAP -->
                    <ClientOnly>
                        <MapCameraphoto ref="mapImport3" :formtData="state" :mainProps="''" :camID="camID" camType="vis"
                            :ptzinto="state.ptzinto" :ptzAlarmID="state.alarmID" />
                    </ClientOnly>
                    <!-- <ClientOnly>
                        <MapDefault ref="mapImport1" :formtData="state" @dataFromChild="handleDataFromChild"
                            :camID="camID" :camType="camType" />
                    </ClientOnly> -->
                    <!-- map -->
                    <!-- <l-map :ref="'map'" :min-zoom="minZoom" :crs="crs" style="height: 100%; width: 100%" @ready="runIndex++"
                    :options="mapOptions"> -->
                    <!-- <l-image-overlay :url="url" :bounds="bounds" /> -->
                    <!-- <l-marker v-for="star in stars" :key="star.name" :lat-lng="star">
            <l-popup :content="star.name" />
          </l-marker> -->
                    <!-- <l-polyline :lat-lngs="travel" /> -->
                    <!-- </l-map> -->
                    <div class="ptz-control-canvas">
                        <button class="c-btn-e">
                            <!-- <img src="/images/控制按鈕icon.svg" width="30"></img> -->
                            LIVE
                        </button>
                    </div>
                    <div class="groupwindow-open-canvas" id="groupwindowObject">
                        <!-- <div class="groupwindow-open-icon" id="groupwindowObject-icon" style="width:60px;">
                <img src="/images/fs/Group 638755fs-tools-icon.svg" style="width:60px;margin-top: 5px;" />
            </div> -->
                        <div class="group-content">
                            <template v-if="state.addRoi">
                                <div style="width:45px;" @click="requestBtnGroupEvent({ type: 'spot' })">
                                    <img src="/images/icon/Iconspot.svg" class="pa-2" width="45" />
                                </div>
                                <div style="width:45px;" @click="requestBtnGroupEvent({ type: 'line' })">
                                    <img src="/images/icon/Iconline.svg" class="pa-2" width="45" />
                                </div>
                                <div style="width:45px;" @click="requestBtnGroupEvent({ type: 'scope' })">
                                    <img src="/images/icon/Iconscope.svg" class="pa-2" width="45" />
                                </div>
                                <div style="width:45px;" @click="requestBtnGroupEvent({ type: 'blob' })">
                                    <img src="/images/icon/Iconblob.svg" class="pa-2" width="45" />
                                </div>
                                <div style="width:45px;pointer-events: none;opacity: 0.4;"
                                    @click="requestBtnGroupEvent({ type: 'polygon' })">
                                    <img src="/images/icon/Iconpolygon.svg" class="pa-2" width="45" />
                                </div>
                            </template>
                            <template v-else>
                                <div class="pa-2" :class="state.maskAddMode === 'add' ? 'group-content-foucs' : ''"
                                    @click="state.maskAddMode = 'add'">
                                    <img src="/images/fs/muen-bar-icon/增加 區域.svg" width="28" />
                                </div>
                                <div class="pa-2 group-divider-right"
                                    :class="state.maskAddMode === 'remove' ? 'group-content-foucs' : ''"
                                    @click="state.maskAddMode = 'remove'">
                                    <img src="/images/fs/muen-bar-icon/減去 區域.svg" width="28" />
                                </div>
                                <div style="width:45px;" @click="requestBtnGroupEvent('mask-scope')">
                                    <img src="/images/fs/muen-bar-icon/irregular.svg" width="45" />
                                </div>
                                <div style="width:45px;" @click="requestBtnGroupEvent('mask-polygon')">
                                    <img src="/images/fs/muen-bar-icon/irregular-blob.svg" width="45" />
                                </div>
                                <div class="group-divider-right" style="width:45px;"
                                    @click="requestBtnGroupEvent('mask-blob')">
                                    <img src="/images/fs/muen-bar-icon/irregular-ploy.svg" width="45" />
                                </div>
                                <div style="width:45px;">
                                    <img src="/images/fs/muen-bar-icon/image.svg" width="45" />
                                </div>
                                <div style="width:45px;">
                                    <img src="/images/fs/muen-bar-icon/pattern.svg" width="45" />
                                </div>
                                <div style="width:45px;">
                                    <img src="/images/fs/muen-bar-icon/polygon.svg" width="45" />
                                </div>
                                <div style="width:45px;">
                                    <img src="/images/fs/muen-bar-icon/irregular-blob.svg" width="45" />
                                </div>
                                <div style="width:45px;">
                                    <img src="/images/fs/muen-bar-icon/scale to fit.svg" width="45" />
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
            <div class="item-grid">
                <div class="item-canvas coustom-table">
                    <div class="item-card-top d-flex justify-space-between position-sticky"
                        style="top: 0;z-index: 2;background-color: #fff;">
                        <div>
                            <!-- <div class="c-switch-lo" style="width:160px">
                                <div class="c-switch-a"
                                    :class="state.mainMode1 === 'roi' ? 'c-switch-foucs' : 'c-switch-after-add1'"
                                    @click="state.mainMode1 = 'roi'">
                                    ROI
                                </div>
                                <div class="c-switch-b" :class="state.mainMode1 !== 'roi' ? 'c-switch-foucs' : ''"
                                    @click="state.mainMode1 = 'mask'">MASK
                                </div>
                            </div> -->
                        </div>
                        <div class="d-flex">
                            <v-btn @click="openCtreeview">新增群組</v-btn>
                            <!-- <div class="v-c-btn" style="height: 30px;" >
                                <img src="/images/fs/icon_pop up.svg" width="30px" />
                            </div> -->
                        </div>
                    </div>
                    <!-- roi -->
                    <template v-if="state.mainMode1 === 'roi'">
                        <CtreeviewA ref="ctreeviewA" :formtData="state" :camID="camID"
                            :cursingPointId="state.cursingPointValue" @requestAddRoi="requestBtnGroupEvent">
                        </CtreeviewA>
                        <!-- <v-expansion-panels>
                            <v-expansion-panel title="Title">
                                <template v-slot:text>
                                    <div class="px-3">
                                        <v-expansion-panels>
                                            <v-expansion-panel title="AAA">
                                                <template v-slot:text>
                                                    <v-table class="ma-0 pa-0">
                                                        <thead class="ma-0 pa-0">
                                                            <tr>
                                                                <th class="text-center ma-0 pa-0">
                                                                    項目
                                                                </th>
                                                                <th class="text-center ma-0 pa-0">
                                                                    ROI名稱
                                                                </th>
                                                                <th class="text-center ma-0 pa-0">
                                                                    最高溫度(C)
                                                                </th>
                                                                <th class="text-center ma-0 pa-0">
                                                                    警報狀態
                                                                </th>
                                                                <th class="text-center ma-0 pa-0">
                                                                    <div>
                                                                        <div>一級警報</div>
                                                                        <div>閾值(˚C)</div>
                                                                    </div>
                                                                </th>
                                                                <th class="text-center ma-0 pa-0">
                                                                    <div>
                                                                        <div>二級警報</div>
                                                                        <div>閾值(˚C) 開關</div>
                                                                    </div>
                                                                </th>
                                                                <th class="text-center ma-0 pa-0"></th>
                                                            </tr>
                                                        </thead>
                                                    </v-table>
                                                </template>
        </v-expansion-panel>
        </v-expansion-panels>
    </div>
    </template>
    </v-expansion-panel>
    </v-expansion-panels> -->
                        <!-- <v-expansion-panels v-model="state.groupPanel" multiple>
                            <v-expansion-panel v-for="itemGroup in state.desserts" :title="itemGroup.name"
                                :value="itemGroup.name" @group:selected="state.userSelectedGroup = false">
                                <template v-slot:text>
                                    <v-table class="ma-0 pa-0">
                                        <thead class="ma-0 pa-0">
                                            <tr>
                                                <th class="text-center ma-0 pa-0">
                                                    項目
                                                </th>
                                                <th class="text-center ma-0 pa-0">
                                                    ROI名稱
                                                </th>
                                                <th class="text-center ma-0 pa-0">
                                                    最高溫度(C)
                                                </th>
                                                <th class="text-center ma-0 pa-0">
                                                    警報狀態
                                                </th>
                                                <th class="text-center ma-0 pa-0">
                                                    <div>
                                                        <div>一級警報</div>
                                                        <div>閾值(˚C)</div>
                                                    </div>
                                                </th>
                                                <th class="text-center ma-0 pa-0">
                                                    <div>
                                                        <div>二級警報</div>
                                                        <div>閾值(˚C) 開關</div>
                                                    </div>
                                                </th>
                                                <th class="text-center ma-0 pa-0"></th>
                                            </tr>
                                        </thead>
                                        <tbody class="ma-0 pa-0">
                                            <tr v-for="item in itemGroup.items" :key="item.name"
                                                :style="tableAlarmColor(item.roiAlarmStatus)">
                                                <td class="text-center">
                                                    <div style="width: 30px">
                                                        <v-badge :content="item.id" overlap color="#828C8F"
                                                            class="my-2">
                                                            <v-btn icon class="right-btn alarm-btn-icon">
                                                                <img v-if="item.type === 'spot'" class="" alt="alert"
                                                                    src="/images/right-icons/spot2.png" width="18px" />
                                                                <img v-if="item.type === 'scope'" class="" alt="alert"
                                                                    src="/images/right-icons/rectangle2.png"
                                                                    width="18px" />
                                                                <img v-if="item.type === 'line'" class="" alt="alert"
                                                                    src="/images/right-icons/line2.png" width="18px" />
                                                                <img v-if="item.type === 'blob'" class="" alt="alert"
                                                                    src="/images/right-icons/blob.png" width="18px" />
                                                            </v-btn>
                                                        </v-badge>
                                                    </div>
                                                </td>
                                                <td class="text-center">
                                                    {{ item.name }}
                                                </td>
                                                <td class="text-center">{{ item.temperature }}</td>
                                                <td class="text-center">
                                                    <template v-if="item.roiAlarmStatus === 1">
                                                        <div style="color:#FFC700">
                                                            一級警報
                                                        </div>
                                                    </template>
                                                    <template v-else-if="item.roiAlarmStatus === 2">
                                                        <div style="color:rgb(255 0 0)">
                                                            二級警報
                                                        </div>
                                                    </template>
                                                    <template v-else>
                                                        無警報
                                                    </template>
                                                </td>
                                                <td class="text-center">
                                                    <div class="d-flex align-center justify-center">
                                                        <div>{{ item.thresholdSystem }}</div>
                                                    </div>
                                                </td>
                                                <td class="text-center">
                                                    <div class="d-flex align-center justify-center">
                                                        <div>{{ item.thresholdManual }}</div>
                                                        <div>
                                                            <div class="ml-2" style="width: 30px">
                                                                <v-btn flat block color="#00000000"
                                                                    @click="changeRoiItem(item.alarmStatus === 0 ? 'alarmOn' : 'alarmOff', item)">
                                                                    <img src="/images/fs/icon/alarm-off.svg"
                                                                        width="30px" v-if="item.alarmStatus === 0" />
                                                                    <img src="/images/fs/icon/alarm-on.svg" width="30px"
                                                                        v-else-if="item.alarmStatus === 1" />
                                                                </v-btn>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="text-center">
                                                    <div class="d-flex align-center justify-center">
                                                        <div>
                                                            <div class="ml-2" style="width: 30px">
                                                                <v-btn flat block color="#00000000">
                                                                    <img src="/images/fs/icon/more.svg" width="30px" />
                                                                    <template v-if="itemGroup.name === '室外曝曬類'">
                                                                        <v-menu activator="parent">
                                                                            <v-list :items="state.roiControlItems"
                                                                                @click:select="(e) => { changeRoiItem(e.id, item) }"></v-list>
                                                                        </v-menu>
                                                                    </template>
                                                                    <template v-else-if="itemGroup.name === '自動偵測異溫區域'">
                                                                        <v-menu activator="parent">
                                                                            <v-list
                                                                                :items="state.roiControlItemsAutoROI"
                                                                                @click:select="(e) => { changeRoiItem(e.id, item) }"></v-list>
                                                                        </v-menu>
                                                                    </template>
                                                                </v-btn>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                </template>
                            </v-expansion-panel>
                        </v-expansion-panels> -->
                    </template>
                    <template v-else>
                        <!-- mask -->
                        <v-expansion-panels v-model="state.groupPanel2" multiple>
                            <v-expansion-panel v-for="itemGroup in state.desserts2" :title="itemGroup.name"
                                :value="itemGroup.name" @group:selected="state.userSelectedGroup = false">
                                <template v-slot:text>
                                    <v-table class="ma-0 pa-0">
                                        <thead class="ma-0 pa-0">
                                            <tr>
                                                <th class="text-center ma-0 pa-0">
                                                    項目
                                                </th>
                                                <th class="text-center ma-0 pa-0">
                                                    ROI名稱
                                                </th>
                                                <th class="text-center ma-0 pa-0">
                                                </th>
                                                <th class="text-center ma-0 pa-0">
                                                </th>
                                                <th class="text-center ma-0 pa-0">
                                                </th>
                                                <th class="text-center ma-0 pa-0">
                                                </th>
                                                <th class="text-center ma-0 pa-0"></th>
                                            </tr>
                                        </thead>
                                        <tbody class="ma-0 pa-0">
                                            <tr v-for="item in itemGroup.items" :key="item.name"
                                                :style="tableAlarmColor(item.roiAlarmStatus)">
                                                <td class="text-center">
                                                    <div style="width: 30px">
                                                        <v-badge :content="item.id" overlap color="#828C8F"
                                                            class="my-2">
                                                            <v-btn icon class="right-btn alarm-btn-icon">
                                                                <img v-if="item.type === 'spot'" class="" alt="alert"
                                                                    src="/images/right-icons/spot2.png" width="18px" />
                                                                <img v-if="item.type === 'scope'" class="" alt="alert"
                                                                    src="/images/right-icons/rectangle2.png"
                                                                    width="18px" />
                                                                <img v-if="item.type === 'line'" class="" alt="alert"
                                                                    src="/images/right-icons/line2.png" width="18px" />
                                                                <img v-if="item.type === 'blob'" class="" alt="alert"
                                                                    src="/images/right-icons/blob.png" width="18px" />
                                                            </v-btn>
                                                        </v-badge>
                                                    </div>
                                                </td>
                                                <td class="text-center">
                                                    {{ item.name }}
                                                    <!-- <v-text-field :value="item.name" variant="solo" hide-details
                                                    focused></v-text-field> -->
                                                </td>
                                                <td class="text-center">
                                                </td>
                                                <td class="text-center">
                                                </td>
                                                <td class="text-center">
                                                </td>
                                                <td class="text-center">
                                                </td>
                                                <td class="text-center">
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                </template>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </template>
                </div>
                <!-- 重新命名/刪除對話框 -->
                <v-dialog v-model="state.roiItemDialog" width="auto">
                    <template v-if="state.roiItemDialogType === 0">
                        <v-card max-width="400" prepend-icon="mdi-update" title="重新命名">
                            <template v-slot:text>
                                <v-sheet class="mx-auto" width="300">
                                    <v-form @submit.prevent>
                                        <v-text-field v-model="state.reNameValue" :rules="state.rules"
                                            label="ROI項目名稱"></v-text-field>
                                    </v-form>
                                </v-sheet>
                            </template>
                            <template v-slot:actions>
                                <v-btn text="取消" @click="state.roiItemDialog = false"></v-btn>
                                <v-btn text="送出" @click="changeRoiItem('save')"
                                    :disabled="state.reNameValue === ''"></v-btn>
                            </template>
                        </v-card>
                    </template>
                    <template v-else-if="state.roiItemDialogType === 1">
                        <v-card max-width="400" prepend-icon="mdi-update" title="確定要刪除該ROI?"
                            :text="'即將刪除' + state.reNameValue">
                            <template v-slot:actions>
                                <v-btn text="取消" @click="state.roiItemDialog = false"></v-btn>
                                <v-btn text="送出" @click="changeRoiItem('delete')"
                                    :disabled="state.reNameValue === ''"></v-btn>
                            </template>
                        </v-card>
                    </template>
                    <template v-else-if="state.roiItemDialogType === 2">
                        <v-card max-width="400" prepend-icon="mdi-update" title="調整閾值">
                            <template v-slot:text>
                                <v-sheet class="mx-auto" width="300">
                                    <v-form @submit.prevent>
                                        <v-text-field v-model="state.tempValue" :rules="state.rules" label="溫度"
                                            type="number"></v-text-field>
                                    </v-form>
                                </v-sheet>
                            </template>
                            <template v-slot:actions>
                                <v-btn text="取消" @click="state.roiItemDialog = false"></v-btn>
                                <v-btn text="送出" @click="changeRoiItem('temp')"
                                    :disabled="state.tempValue === ''"></v-btn>
                            </template>
                        </v-card>
                    </template>
                    <template v-if="state.roiItemDialogType === 3">
                        <v-card max-width="400" prepend-icon="mdi-update" title="保留自動ROI">
                            <template v-slot:text>
                                <v-sheet class="mx-auto" width="300">
                                    <v-form @submit.prevent>
                                        <v-text-field v-model="state.reNameValue" :rules="state.rules"
                                            label="ROI項目名稱"></v-text-field>
                                    </v-form>
                                </v-sheet>
                            </template>
                            <template v-slot:actions>
                                <v-btn text="取消" @click="state.roiItemDialog = false"></v-btn>
                                <v-btn text="送出" @click="changeRoiItem('save')"
                                    :disabled="state.reNameValue === ''"></v-btn>
                            </template>
                        </v-card>
                    </template>
                </v-dialog>
                <div class="item-canvas">
                    <div class="item-card-top d-flex justify-space-between align-center">
                        <!-- <div>
                            <span class="item-878787">預設點名稱</span>
                        </div> -->
                        <div class="d-flex align-center">
                            <!-- <div class="v-c-btn item-AEBBC3 ml-2">切換預覽模式</div>
                            <div class="v-c-btn ml-2">
                                <img src="/images/fs/settingsetting.svg" width="30" />
                            </div> -->
                        </div>
                    </div>
                    <div class="item-card-content position-relative">
                        <!-- <ClientOnly>
                            <MapDefault ref="mapImport2" :formtData="state" @dataFromChild="handleDataFromChild"
                                :mainProps="''" :camID="1" camType="vis" :usePhoto="true" :ptzinto="state.ptzinto"
                                :ptzAlarmID="state.alarmID" />
                        </ClientOnly> -->
                        <ClientOnly>
                            <MapDefault ref="mapImport1" :formtData="state" @dataFromChild="handleDataFromChild"
                                :camID="camID" :camType="camType" />
                        </ClientOnly>
                        <div class="show-GPS">N {{ state.ptz_currentView_gps[1] }} S {{ state.ptz_currentView_gps[0] }}
                        </div>
                    </div>
                </div>
            </div>
            <div id="temp-copy-object"></div>
            <!-- <div class="recorder-canvas">
            <a id="recorder-start">錄製</a>
            <a id="recorder-stop" class="vdisplay">停止錄製</a>
            <div>已錄製: {{ state.recoderTime }}</div>
        </div> -->
        </div>
        <div id="message" style="display: none;">
        </div>
        <!-- <umsdataelement id="UMSDataElement" style="display: none;"></umsdataelement> -->
        <div id="tmtoolbar_manual_rating_injected" style="display: none;">init</div>
        <div id="UMSSendDataEventElement" style="display: none;">init</div>
        <div class="object"></div>
        <!-- <div class="A">
            <div class="drag-handle"></div>
            <div class="resize-handle resize-handle-tl"></div>
            <div class="resize-handle resize-handle-tr"></div>
            <div class="resize-handle resize-handle-bl"></div>
            <div class="resize-handle resize-handle-br"></div>
        </div> -->
    </div>
</template>
<script setup>
const { $webSocketconnect02 } = useNuxtApp()
const { $webSocketconnect03 } = useNuxtApp()
const { $webSocketconnect05 } = useNuxtApp()
const { $displayRoi } = useNuxtApp()
const camID = useAttrs().camID
const camType = useAttrs().camType
const props = defineProps({
    refName: {
        type: String,
        required: true
    }
});
const mapImport1 = ref(null)
const ctreeviewA = ref(null)
const state = reactive({
    treeviews: [],
    cursingPointId: null,
    openVISwo: false,
    ptzControlStatus: 'none',
    roiControlItems: [
        {
            title: '重新命名',
            value: 1,
        },
        {
            title: '調整閾值',
            value: 2,
        },
        {
            title: '刪除ROI項目',
            value: 3,
        }
    ],
    roiControlItemsAutoROI: [
        {
            title: '保留',
            value: 4,
        }, {
            title: '刪除自動ROI項目',
            value: 3,
        }

    ],
    ptzswitch: 1,
    userSelectedGroup: true,
    maskAddMode: '',
    addRoi: true,
    desserts: [],
    desserts2: [],
    groupPanel: [],
    groupPanel2: [],
    mainMode: 'roi', // review = 監控模式 ,roi = ROI模式,mask = MASK模式,mask-temp-select = 溫度區域選取模式
    mainMode1: 'roi',
    mainModeItems: ['review', 'roi', 'mask', 'mask-temp-select'],
    wsRoiData: null,
    // wsRoiData1: null,
    cursingPointValue: 0,
    cursingPointItems: [],
    ptzCurrentAngle: [0, 0],
    ptzCurrentAngleInput: true,
    ptzinto: {
        name: '',
        id: 0
    },
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
    recoderTime: 0,
    rtcPeerConnectionItems: [],
    rtcVIDEOLIST: {
        vis: null,
        ir: null
    },
    rtcVIDETYPE: 'vis',
    ws3: {
        readyState: 0
    },
    wsListener3: {
        close: null,
        message: null
    },
    areaItems: ['area 1'],
    area: 'area 1',
    cameraItems: ['P640'],
    camera: 'P640',
    pathList: [
        {
            name: '六號出口',
            stoptime: 10,
            alarm: false,
        }
    ],
    cameraList: [
        {
            img: '/mock/ir13802.jpg',
            name: '港口000'
        }
    ],
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
    roiItemDialog: false,
    roiItemDialogType: 0,
    reNameValue: '',
    tempValue: '',
    reNameID: 0,
    rules: [
        value => {
            if (value) return true

            return '項目名稱不能為空'
        },
    ],
    rules: [
        value => {
            if (value) return true

            return '項目名稱不能為空'
        },
    ],
    ptz_currentView_gps: [],
    alarmID: [],
    // 畫面設定
    displayObject3: false,
    displayObject4: false,
    displayObject5: false,
    displayObject6: false,
    displayObject8: false,
    displayObject9: false,
    ClipLimit: 10,
    temperatureRanger: 0,
    cameraParamsLowTempFilter: 10,
    allsilderSt: false,
    // 畫面設定 end
    // 參數設定
    frameSettingChange: true,
    screenSettings: [
        // { name: '一般溫度', value: 0.95, check: false },
        { name: '反射溫度', value: null, check: false },
        { name: '環境溫度', value: null, check: false },
        { name: '環境濕度', value: null, check: false },
        { name: '量測距離', value: null, check: false },
        { name: '放射率', value: null, check: false },
        { name: '穿透率', value: null, check: false },
        // { name: '放射率', value: false, check: true },

        // { name: 'External IR Window', value: false, check: true },
    ],
    Transmissiondispaly: [
        { name: 'Transmission', value: 0.95, check: false },
        { name: 'Temperature', value: 20.0, check: false },
    ],
    TransmissiondispalyStatus: false,
    queryCameraInfoloading: true,
    // 參數設定 end
    thermalimg: '/images/colorbar_greyscale.png',
    focusColorMax: false,
    focusColorMin: false,
    ColorMaxAuto: false,
    ColorMinAuto: false,
    colorbar: {
        max: 0,
        min: 0
    },
})
const setColorbarTemp = () => {
    console.log('setColorbarTemp');
}
// 超解析度開關
const srshwish = (e) => {
    console.log('srshwish');
    state.displayObject5 = e
    var output = {
        "feature": "ir_operation",
        "method": "set_operationStatus",
        "session": Math.random().toString(36).substr(2),
        "content": {
            "camera_id": camID,
            "feature_id": 1,
            "function_type": 1,
            "target_value": e ? 1 : 0,
        }
    }
    state.ws3.send(JSON.stringify(output))
}
const setCustomRangerChange = (e) => {
    console.log('setCustomRangerChange');
}
const temperatureRangerChange = (e) => {
    console.log('temperatureRangerChange');
}
// 高溫區域顯示開關
const highTemperatureArea = (e) => {
    console.log('highTemperatureArea');
}
const setCustomRangerslider = (e) => {
    console.log('setCustomRangerslider');
}

const queryCameraInfo = () => {
    state.queryCameraInfoloading = true
    var output = {
        "feature": "camera",
        "method": "query_thermalParameters",
        "session": Math.random().toString(36).substr(2),
        "content": {
            "camera_id": camID
        }
    }
    state.ws3.send(JSON.stringify(output))
}
const sendCameraInfo = (e) => {
    state.queryCameraInfoloading = true
    var params = {
        feature: "camera",
        session: Math.random().toString(36).substr(2),
        method: "set_thermalParameters",
        content: {
            camera_id: camID,
            atmosphericTemperature: state.screenSettings[1].value,
            objectDistance: state.screenSettings[3].value,
            objectEmissivity: state.screenSettings[4].value,
            reflectedTemperature: state.screenSettings[0].value,
            relativeHumidity: state.screenSettings[2].value,
            transmittance: state.screenSettings[5].value
        }
    }
    // console.log("send", params);
    state.ws3.send(
        JSON.stringify(params)
    )
    state.frameSettingChange = true
    params = null
}
// const setCustomRangerChange = (e) => {
//     console.log('setCustomRangerChange');
// }
// watch(
//     () => state.mainMode1,
//     (e, prevData) => {
//         if (e === 'roi') {
//             var output = [
//                 {
//                     name: "室外曝曬類",
//                     items: []
//                 }, {
//                     name: "自動偵測異溫區域",
//                     items: []
//                 }, {
//                     name: "動態偵測",
//                     items: []
//                 }

//             ]
//             state.groupPanel = [
//                 "室外曝曬類", "自動偵測異溫區域", "動態偵測"]
//             state.desserts = output
//         } else if (e === 'mask') {
//             var output = [
//                 {
//                     name: "固定世區域",
//                     items: []
//                 }, {
//                     name: "自動偵測異溫動態遮罩區域",
//                     items: []
//                 }

//             ]
//             state.groupPanel = [
//                 "室外曝曬類", "自動偵測異溫區域", "動態偵測"]
//             state.desserts = output
//             state.groupPanel = [
//                 "固定世區域", "動態遮罩"]
//         }
//     })
// ---------------


const displayVis = (e) => {
    state.openVISwo = !state.openVISwo;
    var btn = e.target.getBoundingClientRect();
    var window = document.getElementById('visss12323123')
    // console.log('btn', btn);
    var topValue = btn.top;
    var leftValue = btn.left;
    window.style.top = (topValue + btn.width) + 'px';
    window.style.left = (leftValue + btn.height) + 'px';
}
const operation = () => {
    var output = {
        "feature": "ir_operation",
        "method": "query_allOperationStatus",
        "session": Math.random().toString(36).substr(2),
        "content": {
            "camera_id": camID
        }
    }
    state.ws3.send(JSON.stringify(output))
}
const changeRoiItem = (e, data) => {
    if (e === 'save') {
        state.roiItemDialog = false;
        var output = {
            "feature": "roi",
            "method": "set_roinName",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "camera_id": camID,
                "cursingPoint_id": state.cursingPointValue,
                "image_type": camType,
                "roi_id": state.reNameID,
                "roi_name": state.reNameValue
            }
        }
        state.ws3.send(JSON.stringify(output))
    } else if (e === 'delete') {
        state.roiItemDialog = false;
        var removeROI = {
            "feature": "roi",
            "method": "set_roiExist",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "type": 2,
                "content": {
                    "camera_id": camID,
                    "cursingPoint_id": state.cursingPointValue,
                    "image_type": camType,
                    "roi_id": state.reNameID,
                }
            }
        }
        state.ws3.send(JSON.stringify(removeROI))
    } else if (e === 'alarmOn' || e === 'alarmOff') {
        var output = {
            "feature": "roi",
            "method": "set_alarmSwitch",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "camera_id": camID,
                "cursingPoint_id": state.cursingPointValue,
                "image_type": camType,
                "roi_id": data.id,
                "roi_alarmSwitch": e === 'alarmOn' ? 1 : 0
            }
        }
        state.ws3.send(JSON.stringify(output))
    } else if (e === 'temp') {
        state.roiItemDialog = false;
        var output = {
            "feature": "roi",
            "method": "set_manualThreshold",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "camera_id": camID,
                "cursingPoint_id": state.cursingPointValue,
                "image_type": camType,
                "roi_id": state.reNameID,
                "roi_thresholdManual": parseFloat(state.tempValue)
            }
        }
        state.ws3.send(JSON.stringify(output))
    } else if (e === 1) {
        state.roiItemDialogType = 0
        state.roiItemDialog = true;
        state.reNameValue = data.name
        state.reNameID = data.id
    } else if (e === 3) {
        state.roiItemDialogType = 1
        state.roiItemDialog = true;
        state.reNameValue = data.name
        state.reNameID = data.id
    } else if (e === 2) {
        state.roiItemDialogType = 2
        state.roiItemDialog = true;
        state.tempValue = data.thresholdManual
        state.reNameID = data.id
    } else if (e === 4) {
        state.roiItemDialogType = 3
        state.roiItemDialog = true;
        state.reNameValue = data.name
        state.reNameID = data.id
    }
}
const handleDataFromChild = (data) => {
    console.log('Received data from child:', data)
}
const putVideo = () => {
    // $refs.mapImport1.putVideo()
}
const requestBtnGroupEvent = (data) => {
    // 接收btnGroup 資料傳送至pixijscanvas1
    // console.log('main requestBtnGroupEvent', data);
    mapImport1.value.requestBtnGroupEvent(data)
}
const openCtreeview = () => {
    ctreeviewA.value.opendialog(null, 9)
}
const mouseover = (e) => {
    const elementsWithClass = e.target.getElementsByClassName('def-point-meun');
    if (elementsWithClass.length > 0) {
        elementsWithClass[0].style.opacity = 1
        elementsWithClass[0].style.pointerEvents = 'auto'
        state.tempHoverDiv = elementsWithClass[0]
    }
}
const mousemove = (e) => {
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
        if (e.offsetY < (location.height / 2)) {
            if (state.tempMoveFocusDiv.up === null) {
                var newdiv = document.createElement('div')
                newdiv.classList.add('path-add-message');
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
                newdiv.classList.add('path-add-message');
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
        state.tempPathItemDiv = null
        var copyDiv = document.getElementById('temp-copy-object') // 宣告克隆物件內容
        copyDiv.innerHTML = '' // 清空克隆物件內容
        var arr = state.pathList
        const valueToMove = arr.splice(state.saveIndex.old, 1)[0];
        arr.splice(state.saveIndex.new, 0, valueToMove);
        state.pathList = arr
    }
}
const mousedown = (e) => {
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

}
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

const messageEvent = (event) => {
    var data = JSON.parse(event.data)
    state.wsRoiData = data
    var output = [
        {
            name: "室外曝曬類",
            items: []
        }, {
            name: "自動偵測異溫區域",
            items: []
        }, {
            name: "動態偵測",
            items: []
        }

    ]
    var output2 = [
        {
            name: "固定式區域",
            items: []
        }, {
            name: "自動偵測異溫動態遮罩區域",
            items: []
        }
    ]
    var keys = []
    var treeview = []
    data.forEach((item0001) => {
        if (item0001.cam_id === camID) {
            state.cursingPointId = item0001.ptz_info[0].ptz_onLocation
            // console.log('8702', item0001.ptz_info[0].ptz_onLocation);
            if (item0001?.image_info) {
                item0001.image_info.forEach((item0002) => {
                    item0002.roi_info.forEach((item0003) => {
                        var output = {
                            num: 0,
                            data: item0003,
                            childNodes: []
                        }
                        item0003.roi_subGroup_list.forEach((item0004) => {
                            var output2 = {
                                num: 0,
                                data: item0004,
                                childNodes: []
                            }
                            if (item0004.roi_roi_content_list) {
                                item0004.roi_roi_content_list.forEach((item0005) => {
                                    output2.childNodes.push({
                                        data: item0005,
                                    })
                                    // console.log("item0004", item0005.roi_type + item0005.roi_number, item0005.roi_alarmStatus);
                                    output2.num++
                                })
                            }
                            output.num++
                            output.childNodes.push(output2)
                        })
                        treeview.push(output)
                    })
                })
            }
            state.cursingPointValue = item0001.ptz_info[0].ptz_onLocation
            state.ptzinto.id = item0001.ptz_info[0].ptz_id
            state.ptzinto.name = item0001.ptz_info[0].ptz_name
        }
    })
    // console.log("treeview", treeview);
    // data.forEach((item0001) => {
    //     if (item0001.cam_id === camID) {
    //         var image_info = item0001.image_info
    //         image_info.forEach((item0002) => {
    //             var image_type = item0002.image_type
    //             if (image_type === 'ir') {
    //                 var roi_info = item0002.roi_info
    //                 roi_info.forEach((item0003) => {
    //                     var roiAlarmStatus = 0 // 0 = normal ; 1 = level 1 ; 2 = level 2 ; 3 = auto
    //                     var approval = item0003.autoROI_approval
    //                     if (approval === 1) {
    //                         roiAlarmStatus = 4
    //                     } else if (approval === 0 && item0003.roi_alarmSwitch === 1) {
    //                         roiAlarmStatus = item0003.roi_alarmStatus
    //                     }
    //                     var findkey = output.findIndex((e) => e.name === (approval === 1 ? "自動偵測異溫區域" : "室外曝曬類"))
    //                     if ($displayRoi()[item0003.roi_type] !== undefined) {
    //                         if ($displayRoi()[item0003.roi_type]) {
    //                             output[findkey].items.push(
    //                                 {
    //                                     type: item0003.roi_type,
    //                                     id: item0003.roi_id,
    //                                     name: item0003.roi_name,
    //                                     temperature: item0003.roi_maxTemperature.toFixed(1),
    //                                     alarmStatus: item0003.roi_alarmSwitch,
    //                                     alarmLevel: item0003.roi_alarmStatus,
    //                                     roiAlarmStatus,
    //                                     thresholdSystem: item0003.roi_thresholdSystem,
    //                                     thresholdManual: item0003.roi_thresholdManual
    //                                 }
    //                             )
    //                         }
    //                     }
    //                 })
    //                 item0002.mask_info.forEach((item0003) => {
    //                     var findkey = output2.findIndex((e) => e.name === '自動偵測異溫動態遮罩區域')
    //                     output2[findkey].items.push(
    //                         {
    //                             type: item0003.roi_type,
    //                             id: item0003.roi_id,
    //                             name: item0003.roi_name,
    //                             temperature: '',
    //                             alarmStatus: '',
    //                             alarmLevel: '',
    //                             roiAlarmStatus: '',
    //                             thresholdSystem: '',
    //                             thresholdManual: ''
    //                         }
    //                     )
    //                 })
    //             }
    //         })
    //         state.cursingPointValue = item0001.ptz_info[0].ptz_onLocation
    //         state.ptzinto.id = item0001.ptz_info[0].ptz_id
    //         state.ptzinto.name = item0001.ptz_info[0].ptz_name
    //     }
    // })
    // console.log('output', output);
    var log = []; // 用于记录满足条件的 cam_id

    // 遍历所有的摄像机数据
    data.forEach(camera => {
        // 遍历 image_info
        camera.image_info.forEach(image => {
            // 遍历 roi_info
            image.roi_info.forEach(roi => {
                // 遍历 roi_subGroup_list
                roi.roi_subGroup_list.forEach(subGroup => {
                    // 遍历 roi_roi_content_list
                    subGroup.roi_roi_content_list.forEach(content => {
                        // 检查 roi_alarmStatus 是否为 1
                        if (content.roi_alarmStatus !== 0 && content.roi_alarmSwitch === 1) {
                            // 如果找到符合条件的，记录 cam_id 到 log 中
                            log.push(camera.cam_id);
                            return; // 终止 further iterations as we found a match
                        }
                    });
                });
            });
        });
    });
    state.alarmID = log
    state.treeviews = treeview
    state.desserts = output
    state.desserts2 = output2
    // if (state.userSelectedGroup) {
    //     state.groupPanel = keys
    // }
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
            "ptz_id": state.ptzinto.id,
            "cursing_status": e === 1 ? 0 : 1
        },
        "session": "asdasd"
    }
    console.log("output", output);
    state.ws3.send(JSON.stringify(output))
}
const changeCursingPoint = (e) => {
    // console.log('changeCursingPoint', e);
    var output = {
        "feature": "ptz",
        "method": "set_cursingPoint",
        "content": {
            "ptz_id": state.ptzinto.id,
            "cursingPoint_id": e
        },
        "session": "asdasd"
    }
    state.ws3.send(JSON.stringify(output))
}
const setPtzCurrentAngle = () => {
    state.ptzCurrentAngleInput = true
    let intArray = state.ptzCurrentAngle.map(value => Number(value));
    var output = {
        "feature": "ptz",
        "method": "set_PtzAngle",
        "content": {
            "ptz_id": state.ptzinto.id,
            "ptz_currentAngle": intArray
        },
        "session": "asdasd"
    }
    state.ws3.send(JSON.stringify(output))
}
const tableAlarmColor = (e) => {
    if (e === 1) {
        return 'background-color:rgb(255 232 27 / 10%)'
    } else if (e === 2) {
        return 'background-color:rgb(255 0 0 / 10%)'
    }
    return ''
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
            const colseEvent = () => {
                setTimeout(() => {
                    openwebsocket03()
                }, 1000)
            }
            state.ws3.addEventListener("close", colseEvent)
            state.wsListener3.close = colseEvent
            // var tew = 0
            const messageEvent = (event) => {
                var data = JSON.parse(event.data)
                var feature = data.feature
                var method = data.method
                if (feature === "camera" && method === "query_thermalParameters") {
                    var info = data.content
                    state.screenSettings = [
                        // { name: '一般溫度', value: 0.95, check: false },
                        { name: '反射溫度', value: info.reflectedTemperature, check: false },
                        { name: '環境溫度', value: info.atmosphericTemperature, check: false },
                        { name: '環境濕度', value: info.relativeHumidity, check: false }, // %
                        { name: '量測距離', value: info.objectDistance, check: false },
                        { name: '放射率', value: info.objectEmissivity, check: false },
                        { name: '穿透率', value: info.transmittance, check: false },
                        // { name: '放射率', value: false, check: true },
                        // { name: 'External IR Window', value: false, check: true }
                    ]
                    setTimeout(() => {
                        state.queryCameraInfoloading = false
                    }, 1000)
                } if (feature === "camera" && method === "set_thermalParameters") {
                    console.log("data123", data);
                    setTimeout(() => {
                        state.queryCameraInfoloading = false
                    }, 1000)
                } else if (feature === "ir_operation" && method === "query_allOperationStatus") {
                    state.displayObject5 = data.content.working_status === 1 ? true : false
                    // mapImport1.value.superResolution(data.content.working_status === 1 ? true : false)
                } else if (feature === "ir_operation" && method === "set_operationStatus") {
                    operation()
                }
            }
            state.ws3.addEventListener("message", messageEvent)
            const initConnent = () => {
                queryCameraInfo()
            }
            initConnent()
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
                // state.wsRoiData1 = data
                // console.log(data);

                var arr = [{
                    title: '-',
                    value: 0
                }]
                var ptzContent = data.overall_ptzStatus.ptz_content
                ptzContent.forEach((item1) => {
                    // 預設點
                    if (item1.ptz_id === state.ptzinto.id) {
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
                var findPtz = data.overall_ptzStatus.ptz_content.findIndex((item) => item.ptz_id === state.ptzinto.id)
                // console.log('findPtz', ptzContent[findPtz]);
                state.ptz_currentView_gps = ptzContent[findPtz].ptz_currentView_gps
                if (ptzContent[findPtz]?.ptz_working_status) {
                    state.ptzswitch = ptzContent[findPtz].ptz_working_status
                }
                if (state.ptzCurrentAngleInput && ptzContent[findPtz]?.ptz_currentAngle) {
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
// --------------------------
onMounted(() => {
    state.groupPanel = [
        "室外曝曬類", "自動偵測異溫區域", "動態偵測"]
    state.groupPanel2 = [
        "固定式區域", "自動偵測異溫動態遮罩區域"]
    setTimeout(() => {
        initWs2()
        initWs3()
        initWs5()
    }, 1000)
    console.log('掛鉤');
    var arr = [{
        name: '六號出口',
        stoptime: 10,
        alarm: false,
    }]
    for (var i = 0; i < 5; i++) {
        arr.push({
            name: '海域B-' + i,
            stoptime: 8,
            alarm: true,
        })
    }
    state.pathList = arr

    var arr01 = [];
    for (var z = 0; z < 100; z++) {
        arr01.push({
            img: '/mock/ir13802.jpg',
            name: '港口000'
        })
    }
    state.cameraList = arr01
    // 漂浮工具 腳本
    // var window1 = document.body
    // var divtemppostion = {
    //     x: 0,
    //     y: 0
    // }
    // var templocation = {
    //     x: 0,
    //     y: 0
    // }
    // var focusTemp = null
    // window1.addEventListener("mousedown", (e) => {
    //     templocation.x = e.clientX
    //     templocation.y = e.clientY
    // })
    // window1.addEventListener("mousemove", (e) => {
    //     if (focusTemp !== null) {
    //         var nl = {
    //             x: templocation.x - e.clientX,
    //             y: templocation.y - e.clientY
    //         }
    //         focusTemp.style.left = (divtemppostion.x - nl.x) + 'px'
    //         focusTemp.style.top = (divtemppostion.y - nl.y) + 'px' // 限制只能左右移動
    //     }
    // })
    // var tooltipClick = document.getElementById('groupwindowObject')
    // var tooltipClickIcon = document.getElementById('groupwindowObject-icon')
    // tooltipClick.addEventListener('mousedown', (e) => {
    //     focusTemp = tooltipClick
    //     divtemppostion.x = tooltipClick.getBoundingClientRect().x;
    //     divtemppostion.y = tooltipClick.getBoundingClientRect().y;
    // })
    // tooltipClick.addEventListener('mouseup', (e) => {
    //     focusTemp = null
    // })
    // tooltipClickIcon.addEventListener('mousedown', (e) => {
    //     tooltipClickIcon.style.transform = 'scale(1.3)';
    // })
    // tooltipClickIcon.addEventListener('mouseenter', (e) => {
    //     tooltipClickIcon.style.transform = 'scale(1.2)';
    // })
    // tooltipClickIcon.addEventListener("mouseout", (e) => {
    //     tooltipClickIcon.style.transform = 'scale(1)';
    // })
    // tooltipClickIcon.addEventListener('mouseup', (e) => {
    //     tooltipClickIcon.style.transform = 'scale(1)';
    // })
    // PTZ控制
    // let isResizing = false;
    // let initialX, initialY, initialWidth, initialHeight, initialMouseX, initialMouseY;
    // const divA = document.getElementById('visss12323123')
    // const resizeHandles = divA.querySelectorAll('.resize-handle');
    // const canvas213 = document.getElementById('movwwwe')
    // resizeHandles.forEach(handle => {
    //     handle.addEventListener('mousedown', function (e) {
    //         isResizing = true;
    //         initialWidth = divA.offsetWidth;
    //         initialHeight = divA.offsetHeight;
    //         initialX = divA.offsetLeft;
    //         initialY = divA.offsetTop;
    //         initialMouseX = e.clientX;
    //         initialMouseY = e.clientY;
    //         canvas213.addEventListener('mousemove', handleResize);
    //         canvas213.addEventListener('mouseup', stopResize);
    //         e.preventDefault(); // 防止文字選取等預設行為
    //     });
    // });
    // function handleResize(e) {
    //     if (!isResizing) return;
    //     let dx = e.clientX - initialMouseX;
    //     let dy = e.clientY - initialMouseY;
    //     // if (e.target.classList.contains('resize-handle-bl')) {
    //     divA.style.width = `${initialWidth - dx}px`;
    //     divA.style.height = `${initialHeight + dy}px`;
    //     divA.style.left = `${initialX + dx}px`;
    //     // }
    // }

    // function stopResize() {
    //     isResizing = false;
    //     canvas213.removeEventListener('mousemove', handleResize);
    //     canvas213.removeEventListener('mouseup', stopResize);
    // }
    const test22 = (e) => {
        // const divA = document.querySelector('.A');
        const divA = document.getElementById('visss12323123')
        const dragHandle = divA.querySelector('.drag-handle');
        const resizeHandles = divA.querySelectorAll('.resize-handle');
        const canvas213 = document.getElementById('movwwwe')
        // const resizeHandles = divA.querySelectorAll('.resize-handle');
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
            e.preventDefault(); // 防止文字選取等預設行為
        });

        function handleDrag(e) {
            if (!isDragging) return;
            const dx = e.clientX - initialMouseX;
            const dy = e.clientY - initialMouseY;
            divA.style.left = `${initialX + dx}px`;
            divA.style.top = `${initialY + dy}px`;
        }

        function stopDrag() {
            isDragging = false;
            canvas213.removeEventListener('mousemove', handleDrag);
            canvas213.removeEventListener('mouseup', stopDrag);
        }

        // 調整大小功能
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
                e.preventDefault(); // 防止文字選取等預設行為
            });
        });

        function handleResize(e) {
            if (!isResizing) return;
            let dx = e.clientX - initialMouseX;
            let dy = e.clientY - initialMouseY;

            if (down === 'resize-handle-tl') {
                divA.style.width = `${initialWidth - dx}px`;
                divA.style.height = `${initialHeight - dy}px`;
                divA.style.left = `${initialX + dx}px`;
                divA.style.top = `${initialY + dy}px`;
            } else if (down === 'resize-handle-tr') {
                divA.style.width = `${initialWidth + dx}px`;
                divA.style.height = `${initialHeight - dy}px`;
                divA.style.top = `${initialY + dy}px`;
            } else if (down === 'resize-handle-bl') {
                divA.style.width = `${initialWidth - dx}px`;
                divA.style.height = `${initialHeight + dy}px`;
                divA.style.left = `${initialX + dx}px`;
            } else if (down === 'resize-handle-br') {
                divA.style.width = `${initialWidth + dx}px`;
                divA.style.height = `${initialHeight + dy}px`;
            }
        }

        function stopResize() {
            console.log('stop');
            isResizing = false;
            canvas213.removeEventListener('mousemove', handleResize);
            canvas213.removeEventListener('mouseup', stopResize);
        }
    }
    const runDIV1 = () => {
        if (document.getElementById('visss12323123')) {
            test22()
        } else {
            setTimeout(() => {
                runDIV1
            }, 100);
        }
    }
    runDIV1()
})
// const ptzControl = () => {
//     sendPtzControl()
//     setTimeout(() => {
//         ptzControl()
//     }, 300)
// }
const sendPtzControl = () => {
    if (state.ptzControlStatus !== 'none') {
        // console.log('ptz', state.ptzControlStatus);
        var output = {
            "feature": "ptz",
            "method": "set_continuousMove",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "ptz_id": camID,
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
.container-canvas {
    display: grid;
    /* grid-template-columns: 65% 35%; */
    grid-template-columns: 60% 40%;
    height: 100%;
    /* background-color: #F2F2F2; */
    /* border: #D3D5D4 1px solid; */
}

.item-canvas {
    /* border-radius: 5px; */
    /* border: 1px #C5C5C7 solid; */
    /* margin: .25em; */
    display: flex;
    flex-direction: column;
    background-color: #fff;
    box-shadow: 0px 0px 3px 1px #b7b7b7;
    /* overflow: auto; */
    overflow: hidden;
}

.item-card-top {
    padding: 0 .5em;
    box-shadow: 0px 2px 2px 0px #b7b7b7;
    height: 36px;
}

.item-grid {
    display: grid;
    grid-template-rows: 50% 50%;
    height: 100%;
}

.item-878787 {
    color: #878787;
}

.item-AEBBC3 {
    color: #AEBBC3;
}

.v-c-btn {
    cursor: pointer;
    transition: all .3s;
}

.v-c-btn:hover {
    opacity: .7;
}

.v-c-btn:active {
    opacity: .9;
}

.bg-f1f1f1ba {
    background-color: #f1f1f1ba;
}

.item-card-content {
    flex-grow: 1;

    padding: .5em;
}

.item-hint-message {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.def-point-grid {
    width: 100%;
    display: grid;
    grid-template-columns: 12% 64% 24%;
    cursor: pointer;
    /* background-color: #fff; */
}

.def-point-item {
    background-color: #fff;
    transition: .2s;
    border: 2px #EAEAEA solid;
}

.def-point-item:hover {
    background-color: #f5f5f5;
}

.def-point-id {
    display: flex;
    align-items: center;
    justify-content: center;
}

.def-point-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: #AEBBC3;
    border-radius: 5px;
    color: #fff;
    font-size: 1.5em;
}

.def-point-name {
    color: #2B2D2C;
    font-weight: 700;
}

.def-point-stoptime {
    font-size: 14px;
}

.def-point-meun {
    display: flex;
    align-items: center;
}

.def-point-meun-btn {
    width: 32px;
    pointer-events: auto;
    background-color: #ffffff00;
    transition: .2s;
    border-radius: 5px;
}

.def-point-meun-btn:hover {
    background-color: #ececec;
}

.def-point-meun-btn:active {
    background-color: #d3d3d3;
}

.cameraList-gird {
    display: grid;
    grid-template-columns: 25% 25% 25% 25%;
    width: 100%;
}

.camera-canvas>img {
    border-radius: 3px;
    border: 2px #EAEAEA solid;
}

#temp-copy-object {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    pointer-events: none;
    opacity: .8;
}

.groupwindow-open-canvas {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translate(-50%, 0px);
    /* top: 90%;
    left: 95%; */
    /* left: 500px; */
    /* top: 38px; */
    z-index: 9;
    display: flex;
    align-items: center;
    flex-direction: row;
}

.groupwindow-open-icon {
    cursor: pointer;
    transition: transform 0.3s;
    width: 40px;
}

.group-content {
    border: 1px #878787 solid;
    background-color: #fff;
    border-radius: 6px;
    display: flex;
}


.group-divider-right {
    border-right: 1px #878787 solid;
}

.group-content>div {
    background-color: #ffffff00;
    transition: all .2s;
    cursor: pointer;
}

.group-content>div:first-child {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
}

.group-content>div:last-child {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
}

.group-content>.group-content-foucs {
    background-color: #dcdcdc;
}

.group-content>div:hover {
    background-color: #DBE2E5;
}

.ptz-control-dialogs {
    background-color: #fff;
    /* position: fixed; */
    /* right: 10%; */
    /* bottom: 40%; */
    width: 370px;
    border: 2px #878787 solid;
    padding: .5em;
    border-radius: 5px;
    /* z-index: 1; */
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
/* 移動視窗 */
.A {
    position: fixed;
    top: 0;
    left: 0;
    width: 100px;
    height: 100px;
    background-color: lightblue;
    box-sizing: border-box;
}

.drag-handle {
    height: 10px;
    /* background-color: #fff; */
    /* box-shadow: 1px 1px 11px 1px #87878787; */
    cursor: move;
}

.resize-handle {
    width: 10px;
    height: 10px;
    position: absolute;
    /* border: 1px solid #878787; */
    background-color: #fff;
    box-shadow: 1px 1px 11px 1px #87878787;
}

.resize-handle-tl {
    top: -5px;
    left: -5px;
    cursor: nwse-resize;
}

.resize-handle-tr {
    top: -5px;
    right: -5px;
    cursor: nesw-resize;
}

.resize-handle-bl {
    bottom: -5px;
    left: -5px;
    cursor: nesw-resize;
}

.resize-handle-br {
    bottom: -5px;
    right: -5px;
    cursor: nwse-resize;
}

.Thermal-bar-w {
    position: absolute;
    top: 50%;
    right: 16px;
    z-index: 99;
    transform: translate(0, -50%);
    color: #fff;
    cursor: pointer;
    pointer-events: auto;
}

.Thermal-bar-w input {
    width: 38px;
    color: #fff;
}

.Thermal-bar-w img {
    max-height: 400px;
}
</style>

<style>
.path-add-message {
    width: 100%;
    position: relative;
    /* height: 1px; */
    /* background-color: #8297ff; */
}

.path-add-message>div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: #8297ff;
}

.leaflet-div-icon {
    background: unset !important;
    border: unset !important;
}


.floatingDiv-111 {
    position: fixed;
    padding: 5px;
    background: rgb(227 227 227);
    font-size: 25px;
    color: crimson;
    animation: floatLeftRight 2s infinite;
    box-shadow: 1px 1px 1px #b2b2b2;
    border-radius: 9px;
    width: fit-content;
    transform: translateY(-50%);
}

@keyframes floatLeftRight {
    0% {
        transform: translateX(0);
    }

    50% {
        transform: translateX(3px);
    }

    100% {
        transform: translateX(0);
    }
}

.recorder-canvas {
    position: fixed;
    left: 10px;
    bottom: 10px;
    background-color: #fff;
    border: 1px solid #000;
}

.vdisplay {
    pointer-events: none;
    color: #5e5e5e !important;
    opacity: 0.4;
}

.alarm-btn-icon {
    width: 28px;
    height: 28px;
    background-color: #f2f4f4;
}

.right-btn {
    background-color: #f2f4f4;
    width: 2.25em;
    height: 2.25em;
}

.coustom-table .v-expansion-panel-text__wrapper {
    padding: 0 !important;
}

#map-top-b {
    position: relative;
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

.visss123 {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 99;
    opacity: 1;
    transition: opacity .3s;
}

.visss123333213123354 {
    opacity: 0;
    pointer-events: none;
}

.show-GPS {
    position: absolute;
    bottom: 10px;
    left: 10px;
    font-size: 20px;
    color: #000;
    /* mix-blend-mode: difference */
}

.patrol-puse-control-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #00000023;
}

.patrol-puse-control {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #ffffffc9;
    text-align: center;
    width: 300px;
    height: 120px;
    opacity: 1;
    color: #9D9D9D;
    font-size: 18px;
}

.frame-content input {
    padding: 0 !important;
    min-height: 0 !important;
}

.frame-content .v-field__field {
    height: 20px !important;
}
</style>