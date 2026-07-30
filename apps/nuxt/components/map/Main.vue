<template>
    <div @mousemove="mousemove" @mouseup="mouseup" style="height: 100%;" id="movwwwe" ref="movwwwe">
        <div style="width: 100px;height: 100px;opacity: 0;pointer-events: none;position: absolute;top: 0;left: 0;">
            <div style="width: 100%; height: 100%;padding: 0 !important;" ref="mapCanvas" class="pa-0">
                <ClientOnly>
                    <!-- <MapDefault ref="mapImport1" :formtData="state" :camID="camID" :camType="camType" :backbtn="true"
                        @backbtnfn="backbtnfn" /> -->
                    <MapDefaultnew ref="mapImport1" :formtData="state" :camID="camID" :camType="camType" :backbtn="true"
                        @backbtnfn="backbtnfn" />
                    <!-- backbtn = 自訂main的返回鍵 -->
                </ClientOnly>
            </div>
            <!-- 假空間 -->
            <div style="position: fixed;top:-10000;left:-10000;width: 300px;height: 300px;" ref="tempvideodiv">
                <div style="width: 100%; height:100%;overflow: hidden;" ref="videoitem">
                    <ClientOnly>
                        <!-- v-if="state.vide1"  -->
                        <MapOnlyvideo :camID="camID" :camType="'vis'" :test="'test111'" :ref="refsHandlerVideo"
                            @backbtnfn="backvideobtnfn" :backbtn="true" />
                    </ClientOnly>

                    <div class="item-card-content position-relative" id="map-top-b" style="z-index: 0;" ref="mapVideo">
                        <div class="BR-btn-group">
                            <div class="BR-btn ml-2" @click="mainvideoback()" v-if="state.mainVideobackbtn">
                                <NuxtImg src="/images/icon/come-back.png" class="mr-1" />
                                <div>
                                    回到一倍
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--  -->
                </div>
            </div>
        </div>
        <div id="message" style="display: none;">
        </div>
        <div ref="mapVeiwMode" class="map-veiw-mode"
            :class="state.cutoverCanvasMapCurrent === 'view' ? '' : 'map-veiw-hidde'"></div>
        <div class="container-canvas" :class="state.cutoverCanvasMapCurrent === 'edit' ? '' : 'map-veiw-hidde'">
            <div class="item-canvas item-left">
                <!-- 刪除行 001 -->
                <div class="item-card-content position-relative" id="map-top-b" style="z-index: 0;" ref="mapEditMode">
                    <div class="BR-btn-group">
                        <div v-if="state.ws3 === null"
                            style="position: absolute;width: 100%;height: 100%;background-color: rgb(0 0 0 / 30%);z-index: 9;">
                        </div>
                        <div class="BR-btn ml-2 px-3">
                            <div class="d-flex">
                                <div class="pt-1 mr-3">警報測試</div>
                                <div class="c-switch-lo">
                                    <div class="c-switch-a"
                                        :class="state.smokeAlarm === 0 ? 'c-switch-foucs' : 'c-switch-after-add-2'"
                                        @click="smokeSwitchEvent(0)">
                                        off
                                    </div>
                                    <div class="c-switch-b" :style="state.smokeAlarm === 1 ? 'color:#878787' : ''"
                                        :class="state.smokeAlarm === 1 ? 'c-switch-foucs' : ''"
                                        @click="smokeSwitchEvent(1)">
                                        on
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="BR-btn ml-2" @click="mainback()" v-if="state.mainbackbtn">
                            <NuxtImg src="/images/icon/come-back.png" class="mr-1" />
                            <div>
                                回到一倍
                            </div>
                        </div>
                        <div class="BR-btn1 ml-2" v-if="props.viewMode === 1">
                            <div class="BR-btn BR-btn23 ml-2" style=""
                                @click="state.switchpattenMenu = !state.switchpattenMenu">
                                <div class="d-flex align-center">
                                    <NuxtImg src="/images/icon/layers-btn-on.png" class="mr-1" />
                                    <div>
                                        色譜
                                    </div>
                                </div>
                            </div>
                            <div style="position: relative;" v-if="state.switchpattenMenu">
                                <div class="menu-ptten-text"
                                    style="position: absolute;position: absolute;bottom: 30px;right: -7px;">
                                    <div class="pa-1">
                                        <div class="menu0-item-canvas-grid my-2">
                                            <div class="menu0-item-title pl-3">紅外線色譜</div>
                                            <div class="menu0-item-content  d-flex align-center">
                                                <div style="width:200px">
                                                    <v-select v-model="state.iRimageMode"
                                                        :disabled="state.mainMode === 0" :items="state.iRimageModeItems"
                                                        density="compact" hide-details
                                                        @update:modelValue="saveIrImgae()"></v-select>
                                                </div>
                                                <div style="width:100px">
                                                    <v-checkbox v-model="state.isothermColor_status" label="等溫遮罩"
                                                        :disabled="state.mainMode === 0" density="compact" flat
                                                        hide-details @update:modelValue="saveIrImgae()"></v-checkbox>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="menu0-item-canvas-grid my-2">
                                            <div class="menu0-item-title pl-3">第一段遮罩</div>
                                            <div class="menu0-item-content d-flex">
                                                <div style="width:100px">
                                                    <v-select v-model="state.isothermColor_level1"
                                                        :disabled="state.mainMode === 0"
                                                        :items="state.isothermColor_level1Items" density="compact"
                                                        hide-details @update:modelValue="saveIrImgae()">
                                                        <template v-slot:item="{ props }">
                                                            <v-list-item v-bind="props">
                                                                <template v-slot:title="{ title }">
                                                                    <div :style="{
                                                                        backgroundColor: title,
                                                                        width: '40px',
                                                                        height: '24px',
                                                                        borderRadius: '4px'
                                                                    }"></div>
                                                                </template>
                                                            </v-list-item>
                                                        </template>

                                                        <!-- 自訂選擇後的顯示方式 -->
                                                        <template v-slot:selection="{ item }">
                                                            <div :style="{
                                                                backgroundColor: item.raw,
                                                                width: '40px',
                                                                height: '24px',
                                                                borderRadius: '4px'
                                                            }"></div>
                                                        </template>
                                                    </v-select>
                                                </div>
                                                <div style="width: 150px;" class="pl-2">
                                                    <v-text-field v-model="state.isothermPercent_level1"
                                                        density="compact" hide-details type="number" min="0" max="100"
                                                        suffix="(%)" hide-spin-buttons
                                                        @update:modelValue="saveIrImgae()"></v-text-field>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="menu0-item-canvas-grid my-2">
                                            <div class="menu0-item-title pl-3">第二段遮罩</div>
                                            <div class="menu0-item-content d-flex">
                                                <div style="width:100px">
                                                    <v-select v-model="state.isothermColor_level2"
                                                        :items="state.isothermColor_level2Items" density="compact"
                                                        :disabled="state.mainMode === 0" hide-details
                                                        @update:modelValue="saveIrImgae()">
                                                        <template v-slot:item="{ props }">
                                                            <v-list-item v-bind="props">
                                                                <template v-slot:title="{ title }">
                                                                    <div :style="{
                                                                        backgroundColor: title,
                                                                        width: '40px',
                                                                        height: '24px',
                                                                        borderRadius: '4px'
                                                                    }"></div>
                                                                </template>
                                                            </v-list-item>
                                                        </template>
                                                        <!-- 自訂選擇後的顯示方式 -->
                                                        <template v-slot:selection="{ item }">
                                                            <div :style="{
                                                                backgroundColor: item.raw,
                                                                width: '40px',
                                                                height: '24px',
                                                                borderRadius: '4px'
                                                            }"></div>
                                                        </template>
                                                    </v-select>
                                                </div>
                                                <div style="width: 150px;" class="pl-2">
                                                    <v-text-field v-model="state.isothermPercent_level2"
                                                        density="compact" hide-details type="number" min="0" max="100"
                                                        suffix="(%)" hide-spin-buttons
                                                        @update:modelValue="saveIrImgae()"></v-text-field>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="menu0-item-canvas-grid my-2">
                                            <div class="menu0-item-title pl-3 pt-2">ROI渲染</div>
                                            <div class="menu0-item-content d-flex">
                                                <div style="width:100px">
                                                    <v-btn @click="runroirander">選取</v-btn>
                                                    <!-- <v-checkbox v-model="state.roirander_status" label=""
                                                        :disabled="state.mainMode === 0" density="compact" flat
                                                        hide-details @update:modelValue="runroirander"></v-checkbox> -->
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="BR-btn ml-2">
                            <NuxtImg src="/images/icon/layers-btn-on.png" class="mr-1" />
                            <div>
                                關閉圖層
                            </div>
                        </div>
                        <div class="BR-btn ml-2">
                            <NuxtImg src="/images/icon/ir-vis-db-btn.png" class="mr-1" />
                            <div>
                                雙光截圖
                            </div>
                        </div>
                        <div class="BR-btn-ptz-status ml-2">
                            <div class="d-flex align-center">
                                <NuxtImg src="/images/icon/crtl-btn.png" class="mr-1" />
                                <div>
                                    巡弋狀態
                                </div>
                                <div class="c-switch-lo ml-3">
                                    <template v-if="state.btnlock">
                                        設定中...
                                    </template>
                                    <template v-else>
                                        <div class="c-switch-a"
                                            :class="state.ptzswitch === 1 ? 'c-switch-foucs' : 'c-switch-after-add'"
                                            @click="ptzswitchEvent(1)">
                                            閒置中
                                        </div>
                                        <div class="c-switch-b" :class="state.ptzswitch === 2 ? 'c-switch-foucs' : ''"
                                            @click="ptzswitchEvent(2)">
                                            巡弋中
                                        </div>
                                    </template>
                                </div>
                            </div>
                            <div style="position: relative;">
                                <v-btn @click="state.ctrlmenu = !state.ctrlmenu" text flat color="#ffffff00" block>
                                    <NuxtImg
                                        :src="state.ctrlmenu ? '/images/icon/menu-on.png' : '/images/icon/menu-off.png'"
                                        alt="menu icon" width="16" />
                                </v-btn>

                                <div class="menu-ptz-text" v-if="state.ctrlmenu"
                                    style="position: absolute;position: absolute;bottom: 49px;right: -7px;">
                                    <div>
                                        <div class="menu-ptz-item">
                                            <div class="d-flex justify-center align-center">
                                                <div class="menu-title">巡弋點</div>
                                            </div>
                                            <div class="pa-1">
                                                <v-select hide-details :items="state.cursingPointItems"
                                                    v-model="state.cursingPointValue" return-object location="top"
                                                    @update:modelValue="changeCursingPoint" hide-spin-buttons
                                                    :menu-props="{ maxHeight: 1080, location: 'top' }"
                                                    :disabled="state.ptzswitch === 2" density="compact">
                                                    <template #item="{ props, item }">
                                                        <v-list-item v-bind="props" style="min-height: 20px;">
                                                            {{ item.raw.text }}
                                                        </v-list-item>
                                                    </template>
                                                </v-select>
                                            </div>
                                        </div>
                                        <div class="menu-ptz-item-o">
                                            <div class="menu-ptz-row-p">
                                                <div class="menu-title">水平角</div>
                                                <div class="menu-title">垂直角</div>
                                            </div>
                                            <div class="menu-ptz-row-p px-1">
                                                <div>
                                                    <v-text-field v-model="state.ptzCurrentAngle[0]" hide-details
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number" hide-spin-buttons density="compact"
                                                        :disabled="state.ptzswitch === 2"></v-text-field>
                                                </div>
                                                <div>
                                                    <v-text-field v-model="state.ptzCurrentAngle[1]" hide-details
                                                        @update:modelValue="state.ptzCurrentAngleInput = false"
                                                        type="number" hide-spin-buttons density="compact"
                                                        :disabled="state.ptzswitch === 2"></v-text-field>
                                                </div>
                                            </div>
                                            <div class="pa-1">
                                                <v-btn class="mt-1" block @click="setPtzCurrentAngle"
                                                    :disabled="state.ptzswitch === 2" style="height: 88px;">GO</v-btn>
                                            </div>
                                        </div>

                                        <div class="menu-ptz-item">
                                            <div class="d-flex justify-center align-center">
                                                <div class="menu-title">回前一點</div>
                                            </div>
                                            <div class="pa-1">
                                                <v-btn class="mt-1" block :disabled="state.ptzswitch === 2">
                                                    <div style="width:30px;">
                                                        <NuxtImg src="/images/icon/back-point.png"
                                                            style="width: 20px;" />
                                                    </div>
                                                </v-btn>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="menu-btn-crtl-ptz">
                                        <!-- top -->
                                        <div class="pa-1">
                                            <v-btn class="pa-1" block :disabled="state.ptzswitch === 2"
                                                @mousedown="state.ptzControlStatus = 'up left', sendPtzControl()"
                                                @mouseup="state.ptzControlStatus = 'none'"
                                                @mouseout="state.ptzControlStatus = 'none'">
                                                <div style="width:30px;">
                                                    <NuxtImg src="/images/icon/asdasdasd.png"
                                                        style="width: 18px;height: 14px;transform: rotate(-45deg);" />
                                                </div>
                                            </v-btn>
                                        </div>
                                        <div class="pa-1">
                                            <v-btn class="pa-1" block :disabled="state.ptzswitch === 2"
                                                @mousedown="state.ptzControlStatus = 'up', sendPtzControl()"
                                                @mouseup="state.ptzControlStatus = 'none'"
                                                @mouseout="state.ptzControlStatus = 'none'">
                                                <div style="width:30px;">
                                                    <NuxtImg src="/images/icon/asdasdasd.png" style="width: 20px;" />
                                                </div>
                                            </v-btn>
                                        </div>
                                        <div class="pa-1">
                                            <v-btn class="pa-1" block :disabled="state.ptzswitch === 2"
                                                @mousedown="state.ptzControlStatus = 'up right', sendPtzControl()"
                                                @mouseup="state.ptzControlStatus = 'none'"
                                                @mouseout="state.ptzControlStatus = 'none'">
                                                <div style="width:30px;">
                                                    <NuxtImg src="/images/icon/asdasdasd.png"
                                                        style="width: 18px;height: 14px;transform: rotate(45deg);" />
                                                </div>
                                            </v-btn>
                                        </div>
                                        <!-- 中 -->
                                        <div class="pa-1">
                                            <v-btn class="pa-1" block :disabled="state.ptzswitch === 2"
                                                @mousedown="state.ptzControlStatus = 'left', sendPtzControl()"
                                                @mouseup="state.ptzControlStatus = 'none'"
                                                @mouseout="state.ptzControlStatus = 'none'">
                                                <div style="width:30px;">
                                                    <NuxtImg src="/images/icon/asdasdasd.png"
                                                        style="width: 18px;height: 14px;transform: rotate(-90deg);" />
                                                </div>
                                            </v-btn>
                                        </div>
                                        <div></div>
                                        <div class="pa-1">
                                            <v-btn class="pa-1" block :disabled="state.ptzswitch === 2"
                                                @mousedown="state.ptzControlStatus = 'right', sendPtzControl()"
                                                @mouseup="state.ptzControlStatus = 'none'"
                                                @mouseout="state.ptzControlStatus = 'none'">
                                                <div style="width:30px;">
                                                    <NuxtImg src="/images/icon/asdasdasd.png"
                                                        style="width: 18px;height: 14px;transform: rotate(90deg);" />
                                                </div>
                                            </v-btn>
                                        </div>
                                        <!-- 下 -->
                                        <div class="pa-1">
                                            <v-btn class="pa-1" block :disabled="state.ptzswitch === 2"
                                                @mousedown="state.ptzControlStatus = 'down left', sendPtzControl()"
                                                @mouseup="state.ptzControlStatus = 'none'"
                                                @mouseout="state.ptzControlStatus = 'none'">
                                                <div style="width:30px;">
                                                    <NuxtImg src="/images/icon/asdasdasd.png"
                                                        style="width: 18px;height: 14px;transform: rotate(245deg);" />
                                                </div>
                                            </v-btn>
                                        </div>
                                        <div class="pa-1">
                                            <v-btn class="pa-1" block :disabled="state.ptzswitch === 2"
                                                @mousedown="state.ptzControlStatus = 'down', sendPtzControl()"
                                                @mouseup="state.ptzControlStatus = 'none'"
                                                @mouseout="state.ptzControlStatus = 'none'">
                                                <div style="width:30px;">
                                                    <NuxtImg src="/images/icon/asdasdasd.png"
                                                        style="width: 18px;height: 14px;transform: rotate(180deg);" />
                                                </div>
                                            </v-btn>
                                        </div>
                                        <div class="pa-1">
                                            <v-btn class="pa-1" block :disabled="state.ptzswitch === 2"
                                                @mousedown="state.ptzControlStatus = 'down right', sendPtzControl()"
                                                @mouseup="state.ptzControlStatus = 'none'"
                                                @mouseout="state.ptzControlStatus = 'none'">
                                                <div style="width:30px;">
                                                    <NuxtImg src="/images/icon/asdasdasd.png"
                                                        style="width: 18px;height: 14px;transform: rotate(-245deg);" />
                                                </div>
                                            </v-btn>
                                        </div>
                                    </div>
                                    <div class="patrol-puse-control-canvas" v-if="state.ptzswitch === 2">
                                        <div
                                            class="patrol-puse-control-123 justify-center align-center d-flex flex-column">
                                            <div>控制前先切換為閒置中</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="item-grid">
                <div class="item-canvas coustom-table pa-1" ref="videoCanvas">
                    <!-- 刪除行 002 -->

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
                <div class="item-canvas pa-1" ref="anchorPoint">
                    <div class="item-card-content position-relative">
                        <div class="swbtn">
                            <div class="c-switch-lo-1">
                                <div class="c-switch-a-1" :class="state.tablemode === 0 ? 'c-switch-foucs-1' : ''"
                                    @click="state.tablemode = 0">
                                    HMI
                                </div>
                                <div class="c-switch-b-1" :class="state.tablemode === 1 ? 'c-switch-foucs-1' : ''"
                                    @click="state.tablemode = 1">
                                    地圖
                                </div>
                            </div>
                        </div>

                        <div :style="state.tablemode === 1 ? 'visibility: hidden !important;pointer-events: none !important;' : ''"
                            style="position: absolute; width: 100%;height: 100%;top: 0;left: 0;display: flex;flex-direction: column;">
                            <!-- 左上 -->
                            <div style="pointer-events: auto !important;height: 40%;">
                                <div class="grid-stack-item-content"
                                    style="background-color: #FFF;overflow: hidden;height: 100%;">
                                    <div class="stack-item-type5-grid-row0">
                                        <div class="d-flex flex-column align-start justify-center">
                                            <div class="stack-item-type5-grid-title01 ml-2 mt-3 py-1 px-3">
                                                {{
                                                    hmicontent.state[0]?.data.camera_name
                                                }}
                                            </div>
                                        </div>
                                        <div class="stack-item-type5-grid pl-1">
                                            <div class="d-flex flex-column align-center justify-center"
                                                style="font-size:1.5em;">
                                                <div class="d-flex">
                                                    <div class="d-rect-www01-1 mr-1 mb-1"
                                                        :style="hmicontent.state[0]?.data.alarm_info.roiAlarm_status === 1 ? 'background:#00FF1D;' : hmicontent.state[0]?.data.alarm_info.roiAlarm_status === 2 ? 'background:#FF0000;' : hmicontent.state[0]?.data.alarm_info.roiAlarm_status === 3 ? 'background:#CFCFCF;' : 'background:#fff;'">
                                                    </div>
                                                    <div>超溫監測</div>
                                                </div>
                                                <div class="d-flex my-4">
                                                    <div class="d-rect-www01-1 mr-1 mb-1"
                                                        :style="hmicontent.state[0]?.data.alarm_info.smokeAlarm_status === 1 ? 'background:#00FF1D;' : hmicontent.state[0]?.data.alarm_info.smokeAlarm_status === 2 ? 'background:#FF0000;' : hmicontent.state[0]?.data.alarm_info.smokeAlarm_status === 3 ? 'background:#CFCFCF;' : 'background:#fff;'">
                                                    </div>
                                                    <div>煙霧監測</div>
                                                </div>
                                                <div class="d-flex">
                                                    <div class="d-rect-www01-1 mr-1 mb-1"
                                                        :style="hmicontent.state[0]?.data.alarm_info.ptz_working_status === 1 ? 'background:#CFCFCF;' : hmicontent.state[0]?.data.alarm_info.ptz_working_status === 2 ? 'background:#00FF1D;' : hmicontent.state[0]?.data.alarm_info.ptz_working_status === 3 ? 'background:#FF0000;' : 'background:#fff;'">
                                                    </div>
                                                    <div>巡弋狀態</div>
                                                </div>
                                            </div>
                                            <div style="position: relative;">
                                                <div style="    position: absolute;
    width: 100%;
    height: 116%;
    top: -16%;">
                                                    <moduleEcharttop :ref="(e) => { runmoduleEcharttop(0, e) }"
                                                        :chartsData="hmicontent.state[0]?.data.realtime_roiCurve"
                                                        chartTextSize="0.08em"
                                                        xAxisTextSize="0.05em"
                                                        v-if="hmicontent.state[0]?.data">
                                                    </moduleEcharttop>
                                                </div>
                                            </div>
                                            <div class="d-flex align-end justify-end">
                                                <div class="d-flex flex-column align-end">
                                                    <div style="font-size: 56px;line-height: 1;"
                                                        :style="hmicontent.state[0]?.data.realtime_roiCurve.data.length > 0 ? hmicontent.state[0]?.data.realtime_roiCurve.data[hmicontent.state[0]?.data.realtime_roiCurve.data.length
                                                            - 1][1] >= hmicontent.state[0]?.data.realtime_roiCurve.roi_thresholdManual ? 'color:#F31414' : 'color:#399600' : ''">
                                                        {{
                                                            hmicontent.state[0]?.data.realtime_roiCurve.data.length
                                                                > 0 ?
                                                                (hmicontent.state[0]?.data.realtime_roiCurve.data[hmicontent.state[0]?.data.realtime_roiCurve.data.length
                                                                    - 1][1]).toFixed(1)
                                                                : '--'
                                                        }}
                                                    </div>
                                                    <div style="font-size: 1.8em;">℃</div>
                                                    <div class="c-switch-lo20-1">
                                                        <div class="c-switch-a20"
                                                            :class="hmicontent.state[0]?.data.alarm_info.ptz_working_status === 1 ? 'c-switch-foucs20' : 'c-switch-after-add20'"
                                                            @click="ptzswitchEvent(1, hmicontent.state[0])">
                                                            閒置中
                                                        </div>
                                                        <div class="c-switch-b20"
                                                            :class="hmicontent.state[0]?.data.alarm_info.ptz_working_status === 2 ? 'c-switch-foucs20' : ''"
                                                            @click="ptzswitchEvent(2, hmicontent.state[0])">
                                                            巡弋中
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- 左下 -->
                            <div style="height: 60%;">
                                <div class="grid-stack-item-content" style="background-color: #FFF;height: 100%;"
                                    v-if="true">
                                    <!-- <moduleEchartsbar></moduleEchartsbar> -->
                                    <!-- direction="vertical"  -->
                                    <template v-if="hmicontent.state.length > 0">
                                        <swiper :slidesPerView="'auto'" :pagination="{
                                            clickable: true,
                                        }" :centeredSlides="false" :spaceBetween="2" grabCursor :mousewheel="true" loop
                                            :modules="modules" class="mySwiper">
                                            <swiper-slide
                                                v-for="(item001, index001) in handlecruising(hmicontent.state[0]?.data.cruising_history)"
                                                :key="index001">
                                                <div class="myswiper-slider-div-ca001">
                                                    <div class="myswiper-slider-div-container001 pa-1">

                                                        <template v-for="(item002, index002) in item001"
                                                            :key="index002">
                                                            <div class="myswiper-slider-item-01">
                                                                <div class="triangle-badge"
                                                                    v-if="hmicontent.state[0]?.data.alarm_info.ptz_working_status === 1"
                                                                    :style="hmicontent.state[0]?.data.ptz_onLocation === item002.cruising_id ? 'background: #2F84FF;' : ''">
                                                                    <span
                                                                        v-if="hmicontent.state[0]?.data.ptz_onLocation === item002.cruising_id">✔</span>
                                                                </div>
                                                                <div class="myswiper-slider-div"
                                                                    :class="hmicontent.state[0]?.data.alarm_info.ptz_working_status === 1 ? 'myswiper-slider-div-on' : ''"
                                                                    :style="hmicontent.state[0]?.data.ptz_onLocation === item002.cruising_id ? 'background: #F3F9FF;' : ''"
                                                                    @click="changeCursingPointHMI(item002, hmicontent.state[0], hmicontent.state[0]?.data.alarm_info.ptz_working_status)">
                                                                    <div class="d-flex align-center justify-center">
                                                                        <div style="font-size:1.1em;">
                                                                            {{
                                                                                item002.cruising_number
                                                                            }} {{
                                                                                item002.cruising_name }}
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        style="pointer-events: none; min-width: 0; min-height: 0; overflow: hidden;">
                                                                        <moduleEchartsbar
                                                                            :ref="(e) => { runmoduleEchartsbar(item002.cruising_id, e) }"
                                                                            :chartsData="item002">
                                                                        </moduleEchartsbar>
                                                                    </div>
                                                                    <div
                                                                        class="d-flex align-center justify-space-evenly">
                                                                        <div :style="item002.absTemp_curve.length > 0 ? item002.absTemp_curve[item002.absTemp_curve.length
                                                                            - 1] >= item002.roi_thresholdManual ? 'color:#399600' : 'color:#F31414' : ''"
                                                                            style="font-size: 1.1em;">
                                                                            {{
                                                                                item002.absTemp_curve.length
                                                                                    > 1
                                                                                    ? (() => {
                                                                                        const diff =
                                                                                            item002.absTemp_curve.at(-1)
                                                                                            -
                                                                                            item002.absTemp_curve.at(-2)
                                                                                        const fixed =
                                                                                            diff.toFixed(1)
                                                                                        return diff > 0 ?
                                                                                            `+${fixed}` : fixed
                                                                                    })()
                                                                                    : ''
                                                                            }}</div>
                                                                        <div class="ml-2"
                                                                            style="color: #272727;font-weight: 500;font-size:1.1em;">
                                                                            {{
                                                                                item002.absTemp_curve.length
                                                                                    > 0 ?
                                                                                    item002.absTemp_curve[item002.absTemp_curve.length
                                                                                    - 1] : ''
                                                                            }}</div>
                                                                        <div
                                                                            :style="item002.absTemp_curve.length > 0 ? item002.absTemp_curve[item002.absTemp_curve.length
                                                                                - 1] >= item002.roi_thresholdManual ? 'opacity: 1;' : 'opacity: 0;' : ''">
                                                                            <img src="/images/icon/alarm-red.png" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </template>
                                                        <template v-for="(item002, index02) in 10 - item001.length"
                                                            :key="index02">
                                                            <div class="myswiper-slider-div01"></div>
                                                        </template>
                                                    </div>
                                                </div>
                                            </swiper-slide>
                                        </swiper>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <!-- <template v-else-if="state.tablemode === 1"> -->
                        <div :style="state.tablemode === 0 ? 'visibility: hidden !important;pointer-events: none !important;' : ''"
                            style="position: absolute; width: 100%;height: 100%;top: 0;left: 0;">
                            <template v-if="state.sw">
                                <ClientOnly>
                                    <MapCameraphoto ref="mapImport3" :formtData="state" :mainProps="''" :camID="camID"
                                        camType="vis" :ptzinto="state.ptzinto" :ptzAlarmID="state.alarmID"
                                        @toTab="toTab" @mapSetMapPtzStatus="ptzswitchEvent"
                                        @mapSetCursingPint="changeCursingPoint" :backbtn="true"
                                        @backbtnfn="backmapbtnfn" />
                                </ClientOnly>
                            </template>
                            <div class="show-GPS">N {{ readGPS(1) }} S {{ readGPS(0) }}</div>
                            <div class="item-card-content position-relative" id="map-top-b" style="z-index: 0;"
                                ref="mapVideo">
                                <div class="BR-btn-group">
                                    <div class="BR-btn ml-2" @click="mainmapback()" v-if="state.mainmapbackbtn">
                                        <NuxtImg src="/images/icon/come-back.png" class="mr-1" />
                                        <div>
                                            回到一倍
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- </template> -->
                    </div>
                </div>
            </div>
            <div id="temp-copy-object"></div>
        </div>
        <div id="message" style="display: none;">
        </div>
        <div id="tmtoolbar_manual_rating_injected" style="display: none;">init</div>
        <div id="UMSSendDataEventElement" style="display: none;">init</div>
        <div class="object"></div>
        <div style="background-color: #fff; border: 1px solid #878787;border-radius: 3px;width:718px; height: 576px;"
            class="visss123" id="visss12323123" ref="visss12323123"
            :class="state.openVISwo && props.viewMode === 1 ? '' : 'visss123333213123354'">
            <div class="drag-handle" ref="dragHandle123">ROI項目</div>
            <div class="drag-handle-bar">
                <div></div>
                <div>
                    <div v-if="state.ptzswitch === 2" class="w-message-s">
                        設定前請先解巡弋
                    </div>
                </div>
                <div style="position: relative;">
                    <div class="c-table-btn mt-1"
                        style="width: 70px;position: absolute;top: 44px;z-index: 99999;right: 25px;">
                        <v-btn @click="openCtreeview" :disabled="state.ptzswitch === 2">新增群組</v-btn>
                    </div>
                </div>
            </div>
            <div style="width:100%; height: calc(100% - 90px);overflow: auto;">
                <CtreeviewA ref="ctreeviewA" :formtData="state" :camID="camID" :cursingPointId="state.cursingPointValue"
                    @requestAddRoi="requestBtnGroupEvent">
                </CtreeviewA>
            </div>
            <div class="resize-handle resize-handle-tl" :ref="(e) => refsHandler(e, 0)"
                style="opacity: 0;pointer-events: none;">
            </div>
            <div class="resize-handle resize-handle-tr" :ref="(e) => refsHandler(e, 1)"
                style="opacity: 0;pointer-events: none;">
            </div>
            <div class="resize-handle resize-handle-bl" :ref="(e) => refsHandler(e, 2)"
                style="opacity: 0;pointer-events: none;">
            </div>
            <div class="resize-handle resize-handle-br" :ref="(e) => refsHandler(e, 3)" style="
            opacity: 0;pointer-events: none;">
            </div>
        </div>
    </div>
</template>
<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Mousewheel, Pagination } from 'swiper/modules'

import 'swiper/css/pagination';
import 'swiper/css'
import 'swiper/css/autoplay'

import { map } from "leaflet"
const modules = ref([Mousewheel, Pagination])
const { $getIpaddress } = useNuxtApp()
const { $webSocketconnect03 } = useNuxtApp()
const { $webSocket02URL } = useNuxtApp()
const { $webSocket05URL } = useNuxtApp()
// const { $webSocketconnect05 } = useNuxtApp()
const anchorPoint = ref('')
const { $displayRoi } = useNuxtApp()
const camID = useAttrs().camID
const camType = useAttrs().camType
const tabId = useAttrs().tabId
const video1 = ref('')
const refsHandlerVideo = (e) => {
    console.log('會依植被呼叫?');
    video1.value = null
    video1.value = e
    // const currentPort = window.location.port;
    // setTimeout(() => {
    //     console.log(video1);
    //     runRTC(video1.value, `http://${$getIpaddress()}:${currentPort}/video/realtime/roiChart${camID}/`, 'vis')
    // }, 300)
}
// const props = defineProps({
//     refName: {
//         type: String,
//         required: true
//     }
// });
const props = useAttrs().formtData
const mapImport1 = ref([])
// const mapImport2 = ref([])
const mapImport3 = ref(null)
const mapImport4 = ref('')
const tempvideodiv = ref('')
const mapCanvas = ref('')
const videoCanvas = ref('')
const videoitem = ref('')
const mapVeiwMode = ref('')
const mapEditMode = ref('')
const refmoduleEcharttop = ref([])
const refmoduleEchartsbar = ref([])
const visss12323123 = ref('')
const dragHandle123 = ref('')
const resizeHandle123 = ref([])
const movwwwe = ref('')
const ctreeviewA = ref(null)
const refsHandler = (el, index) => {
    if (el) {
        resizeHandle123.value[index] = el
    }
}
const hmicontent = reactive({
    state: []
})
const state = reactive({
    vide1: false,
    ctrlmenu: false,
    switchpattenMenu: false,
    tablemode: 0,
    sw: true,
    treeviews: [],
    cursingPointId: null,
    openVISwo: true,
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
    btnlock: false,
    ptzswitch: 1,
    smokeAlarm: 0,
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
    wsRoiData1: null,
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
    ptz_currentView_gps: ['', ''],
    alarmID: [],
    // 畫面設定
    displayObject3: false,
    displayObject4: false,
    displayObject5: false,
    displayObject6: false,
    displayObject8: false,
    displayObject9: false,
    displayObject10: true,
    ClipLimit: 10,
    temperatureRanger: 0,
    cameraParamsLowTempFilter: 10,
    allsilderSt: false,
    // 畫面設定 end
    // 參數設定
    frameSettingChange: true,
    screenSettings: [
        // { name: '一般溫度', value: 0.95, check: false },
        // { name: '反射溫度', value: null, check: false, disabled: true},
        { name: '環境溫度', value: null, check: false, disabled: false },
        { name: '環境濕度', value: null, check: false, disabled: false },
        { name: '量測距離', value: null, check: false, disabled: false },
        { name: '放射率', value: null, check: false, disabled: false },
        { name: '穿透率', value: null, check: false, disabled: false },
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
    cutoverCanvasMapCurrent: 'edit', // view = 觀看模式 edit = 編輯模式
    queryAllOperationStatusTable: [],
    fovMenu: false,
    visFov: 23,
    webWorker: null,
    webWorker02: null,
    className: 'rest0-btn' + Math.random().toString(36).substr(2), viewMode: 0,
    mainbackbtn: false,
    mainVideobackbtn: true,
    mainmapbackbtn: true,
    thermalimg: '/colorbar_greyscale.png',
    iRimageMode: 1,
    isothermColor_status: false,
    iRimageModeItems: [
        { title: '鐵灰', value: 1 },
        { title: '彩虹', value: 2 },
        { title: '灰階', value: 3 }
    ],
    isothermColor_level1: 'cyan',
    isothermColor_level2: 'pink',
    isothermColor_level1Items: ['red',
        'yellow',
        'green',
        'pink',
        'cyan',
        'gray'],
    isothermColor_level2Items: ['red',
        'yellow',
        'green',
        'pink',
        'cyan',
        'gray'],
    isothermPercent_level1: 0,
    isothermPercent_level2: 0,
    roirander_status: false
})
watch(
    () => props.viewMode,
    (data, prevData) => {
        state.viewMode = data
        if (data === 1 && state.cutoverCanvasMapCurrent === 'edit') {
            state.ctrlmenu = false
            setTimeout(() => {
                const rect = anchorPoint.value.getBoundingClientRect();
                console.log(rect, visss12323123.value);
                visss12323123.value.style.left = rect.left + 'px'
                visss12323123.value.style.top = (rect.top - 35) + 'px'
                visss12323123.value.style.width = rect.width + 'px'
                visss12323123.value.style.height = rect.height + 'px'
            }, 1000)
            // console.log('index > main', data);
        }
    }
)

const saveIrImgae = () => {
    if (state.isothermPercent_level1 >= 100) {
        state.isothermPercent_level1 = 100
    }
    if (state.isothermPercent_level1 <= 0) {
        state.isothermPercent_level1 = 0
    }
    if (state.isothermPercent_level2 >= 100) {
        state.isothermPercent_level2 = 100
    }
    if (state.isothermPercent_level2 <= 0) {
        state.isothermPercent_level2 = 0
    }
    let output = {
        "feature": "camera",
        "method": "set_pattern",
        "session": "020420230331143215980",
        "content": {
            "camera_id": camID,
            "imageMode_ir": state.iRimageMode,
            "isothermColor_status": state.isothermColor_status ? 1 : 0,
            "isothermColor_level1": state.isothermColor_level1,
            "isothermColor_level2": state.isothermColor_level2,
            "isothermPercent_level1": parseInt(state.isothermPercent_level1),
            "isothermPercent_level2": parseInt(state.isothermPercent_level2)
        }
    }

    state.ws3.send(JSON.stringify(output))
}
const runmoduleEcharttop = (id, el) => {
    // console.log('runmoduleEcharttop', id, el);
    const index = refmoduleEcharttop.value.findIndex((e) => e.id === id)
    // if (index !== -1) refmoduleEcharttop.value.splice(index, 1);
    if (index !== -1) return;
    refmoduleEcharttop.value.push({
        id, el
    })
}
const backbtnfn = (e) => {
    state.mainbackbtn = e === 'play' ? true : false
}
const mainback = () => {
    mapImport1.value.addlistenerMainBack()
}

const backvideobtnfn = (e) => {
    state.mainVideobackbtn = e === 'play' ? true : false
}
const mainvideoback = () => {
    if (video1.value !== null) {
        video1.value.addlistenerMainBack()
    }
}

const backmapbtnfn = (e) => {
    state.mainmapbackbtn = e === 'play' ? true : false
}
const handlecruising = (arr) => {
    // const result = [];

    // for (let i = 0; i < arr.length; i += size) {
    //     let chunk = arr.slice(i, i + size);

    //     // 若不足 size，就補滿
    //     if (chunk.length < size) {
    //         const missing = size - chunk.length;
    //         const fillItems = Array.from({ length: missing }, () => ({ type: 'none' }));
    //         chunk = chunk.concat(fillItems);
    //     }

    //     result.push(chunk);
    // }

    // return result;
    const result = [];
    for (let i = 0; i < arr.length; i += 10) {
        result.push(arr.slice(i, i + 10));
    }
    return result;
}
const mainmapback = () => {
    if (mapImport3.value !== null) {
        mapImport3.value.addlistenerMainBack()
    }
}
const fovsubmit = (type) => {
    state.visFov = parseFloat(state.visFov).toFixed(1)
    var output = {
        "feature": "camera",
        "method": "set_lensFovFocus",
        "session": Math.random().toString(36).substr(2),
        "content": {
            "camera_id": camID,
            "ir_autoFocus": type === 'ir_autoFocus' ? 1 : 0,
            "ir_nuc": type === 'ir_nuc' ? 1 : 0,
            "vis_autoFocus": type === 'vis_autoFocus' ? 1 : 0,
            "vis_fov": type === 'vis_fov' ? parseFloat(state.visFov) : 0.0
        }
    }
    state.ws3.send(JSON.stringify(output))
}
let timeoutid = null
let timeoutid2 = null
const cutoverCanvasMap = (e) => {
    let type = e === camID ? 'edit' : 'view'
    state.ctrlmenu = false
    state.openVISwo = false
    state.vide1 = false
    if (type === 'edit') {
        state.ctrlmenu = false
        state.openVISwo = true
        state.vide1 = true
    }
    if (props.viewMode === 1 && type === 'edit') {
        state.ctrlmenu = false
        setTimeout(() => {
            const rect = anchorPoint.value.getBoundingClientRect();
            console.log(rect, visss12323123.value);
            visss12323123.value.style.left = rect.left + 'px'
            visss12323123.value.style.top = (rect.top - 35) + 'px'
            visss12323123.value.style.width = rect.width + 'px'
            visss12323123.value.style.height = rect.height + 'px'
        }, 1)
        // console.log('index > main', data);
    }
    // console.log('cutoverCanvasMap', type, e);
    const mapElement = mapCanvas.value;
    const targetContainer1 = mapVeiwMode.value;
    const targetContainer2 = mapEditMode.value;
    state.cutoverCanvasMapCurrent = type
    // console.log('cutoverCanvasMap', type);
    if (state.cutoverCanvasMapCurrent === 'view') {
        targetContainer1.appendChild(mapElement);
        tempvideodiv.value.appendChild(videoitem.value);
        // videoitem.value.style.pointerEvents = 'none'
        // videoitem.value.style.opacity = '0'
    } else if (state.cutoverCanvasMapCurrent === 'edit') {
        targetContainer2.appendChild(mapElement);
        videoCanvas.value.appendChild(videoitem.value);
        // videoitem.value.style.pointerEvents = 'auto'
        // videoitem.value.style.opacity = '1'
    }
    // console.log('event cutoverCanvasMap', e);
    if (mapImport1.value !== null) {
        if (mapImport3.value !== null) {
            mapImport3.value.switchWK(false)
        }
        // state.sw = false
        // mapImport1.value = ''
        // mapImport3.value = ''
        if (timeoutid !== null) {
            clearTimeout(timeoutid)
        }
        if (timeoutid2 !== null) {
            clearTimeout(timeoutid)
        }
        // timeoutid = setTimeout(() => {
        // state.sw = true
        // mapImport1.value.invaliMapSzie()
        // video1.value.invaliMapSzie()
        // timeoutid = null
        // }, 10)
        timeoutid = setTimeout(() => {
            // mapImport3.value.invaliMapSzie()

            if (mapImport3.value !== null) {
                mapImport3.value.switchWK(true)
            }
            timeoutid2 = null
        }, 10)
        refmoduleEcharttop.value.forEach((e) => {
            e.el.echartSize()
        })
        refmoduleEchartsbar.value.forEach((e) => {
            e.el.echartSize()
        })
    }
}
// setInterval(()=>{
//     mapImport2.value.invaliMapSzie()
// },2000)
const resize = () => {
    mapImport1.value.invaliMapSzie()
}
const readGPS = (e) => {
    try {
        return state?.ptz_currentView_gps[e]
    } catch (error) {
        return ''
    }

}
const emit = defineEmits([])
const toTab = (e) => {
    console.log('totab', e);
    emit('toTab', e)
}
const offdig = (e) => {
    state.openVISwo = false
}
const setColorbarTemp = () => {
    console.log('setColorbarTemp');
}
// 超解析度開關
const tempdisplay = (e) => {
    state.displayObject10 = e
}
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
const setCustomRangerslider = (type, index) => {
    if (type === 'cameraParamsLowTempFilter-') {
        state.queryAllOperationStatusTable[index].current_value--
        if (state.queryAllOperationStatusTable[index].current_value <= state.queryAllOperationStatusTable[index].lower_limit) {
            state.queryAllOperationStatusTable[index].current_value = state.queryAllOperationStatusTable[index].lower_limit
        }
    } else if (type === 'cameraParamsLowTempFilter+') {
        state.queryAllOperationStatusTable[index].current_value++
        if (state.queryAllOperationStatusTable[index].current_value >= state.queryAllOperationStatusTable[index].upper_limit) {
            state.queryAllOperationStatusTable[index].current_value = state.queryAllOperationStatusTable[index].upper_limit
        }
    } else if (type === 'set+') {

    }
    var output = {
        "feature": "ir_operation",
        "method": "set_operationStatus",
        "session": Math.random().toString(36).substr(2),
        "content": {
            "camera_id": camID,
            "feature_id": state.queryAllOperationStatusTable[index].feature_id,
            "function_type": 2,
            "target_value": state.queryAllOperationStatusTable[index].current_value
        }
    }
    // state.queryAllOperationStatusTable.forEach((item) => {
    //     output.content.push({
    //         "camera_id": camID,
    //         "feature_id": item.feature_id,
    //         "function_type": item.feature_type,
    //         "target_value": item.feature_type === 1 ? item.working_status : item.current_value
    //     })
    // })
    state.ws3.send(JSON.stringify(output))
}
const changeStatus = (index, type) => {
    state.queryAllOperationStatusTable[index].working_status = type
    var output = {
        "feature": "ir_operation",
        "method": "set_operationStatus",
        "session": Math.random().toString(36).substr(2),
        "content": {
            "camera_id": camID,
            "feature_id": state.queryAllOperationStatusTable[index].feature_id,
            "function_type": 1,
            "target_value": state.queryAllOperationStatusTable[index].working_status
        }
    }
    // var output = {
    //     "feature": "ir_operation",
    //     "method": "set_operationStatus",
    //     "session": Math.random().toString(36).substr(2),
    //     "content": []
    // }
    // state.queryAllOperationStatusTable.forEach((item) => {
    //     output.content.push({
    //         "camera_id": camID,
    //         "feature_id": item.feature_id,
    //         "function_type": item.feature_type,
    //         "target_value": item.feature_type === 1 ? item.working_status : item.current_value
    //     })
    // })
    state.ws3.send(JSON.stringify(output))
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
            atmosphericTemperature: state.screenSettings[0].value,
            objectDistance: state.screenSettings[2].value,
            objectEmissivity: state.screenSettings[3].value,
            // reflectedTemperature: state.screenSettings[0].value,
            relativeHumidity: state.screenSettings[1].value,
            transmittance: state.screenSettings[4].value
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
    var window = visss12323123.value
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
const refreshHmiWk = ref(null)
let isWorkActive = false
let ws3RetryTimer = null
let worker02RestartTimer = null
let worker05RestartTimer = null
let hmiWorkerRestartTimer = null
let ptzControlTimer = null

const clearTimer = (timer) => {
    if (timer !== null) clearTimeout(timer)
    return null
}

const clearWorkRetryTimers = () => {
    ws3RetryTimer = clearTimer(ws3RetryTimer)
    worker02RestartTimer = clearTimer(worker02RestartTimer)
    worker05RestartTimer = clearTimer(worker05RestartTimer)
    hmiWorkerRestartTimer = clearTimer(hmiWorkerRestartTimer)
    ptzControlTimer = clearTimer(ptzControlTimer)
}

const runHMIwk = (item) => {
    if (!isWorkActive) return
    hmiWorkerRestartTimer = clearTimer(hmiWorkerRestartTimer)
    if (refreshHmiWk.value !== null) {
        refreshHmiWk.value.e.terminate()
        refreshHmiWk.value = null
    }
    // console.log('runHMIwk', item.tab_id);
    let temp = new Worker('/worker/wktows02-hmi.js')
    temp.addEventListener('message', (e) => {
        var res = e.data
        var type = res.type
        var parameter = res.parameter
        if (type === 'open') {
            // console.log('開啟worker /worker/wktows02-cctv.js', item);
            temp.postMessage({
                type: 'start',
                parameter: {
                    wsURL: $webSocket02URL(),
                    item: JSON.stringify(item)
                }
            })
        } else if (type === 'ws') {
            let jsonData = JSON.parse(parameter)
            hmicontent.state = [
                { data: jsonData[0] }
            ]
            // state.childrenROI = temp
            // }
        } else if (type === 'close') {
            temp.terminate();
            temp = null
            if (isWorkActive && hmiWorkerRestartTimer === null) {
                hmiWorkerRestartTimer = setTimeout(() => {
                    hmiWorkerRestartTimer = null
                    if (isWorkActive) runHMIwk(item)
                }, 1)
            }
        }
    })
    refreshHmiWk.value = {
        e: temp,
        item
    }
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

const putVideo = () => {
    // $refs.mapImport1.putVideo()
}
const requestBtnGroupEvent = (data) => {
    // 接收btnGroup 資料傳送至pixijscanvas1
    console.log('main requestBtnGroupEvent', data);
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
    let output = [
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
    let output2 = [
        {
            name: "固定式區域",
            items: []
        }, {
            name: "自動偵測異溫動態遮罩區域",
            items: []
        }
    ]
    // let treeview = []
    // data.forEach((item0001) => {
    let item0001 = event
    state.cursingPointId = item0001.ptz_info[0].ptz_onLocation
    try {
        state.ptzswitch = item0001.ptz_info[0].ptz_working_status
        state.smokeAlarm = item0001.alarm_info.test_alarm_status
    } catch (error) {
        console.log('error', error);
    }
    if (state.ptzCurrentAngleInput && item0001.ptz_info[0]?.ptz_currentAngle) {
        state.ptzCurrentAngle = item0001.ptz_info[0]?.ptz_currentAngle
    }

    state.cursingPointValue = item0001.ptz_info[0].ptz_onLocation
    state.ptzinto.id = item0001.ptz_info[0].ptz_id
    state.ptzinto.name = item0001.ptz_info[0].ptz_name
    // console.log('item0001.ptz_info[0].ptz_iditem0001.ptz_info[0].ptz_id', item0001.ptz_info[0].ptz_id);
    let log = [];
    let camera = event
    if (camera?.image_info && isList(camera.image_info)) {
        camera.image_info.forEach(image => {
            if (image?.roi_info && isList(image?.roi_info)) {
                image.roi_info.forEach(roi => {
                    if (roi?.roi_subGroup_list && isList(roi?.roi_subGroup_list)) {
                        roi.roi_subGroup_list.forEach(subGroup => {
                            subGroup.roi_roi_content_list.forEach(content => {
                                if (content.roi_alarmStatus !== 0 && content.roi_alarmSwitch === 1) {
                                    log.push(camera.cam_id);
                                    return;
                                }
                            });
                        });
                    }
                });
            }
            if (image?.thermal_pattern) {
                state.iRimageMode = image?.thermal_pattern.imageMode_ir
                state.isothermColor_status = image?.thermal_pattern.isothermColor_status === 1 ? true : false
                state.isothermColor_level1 = image?.thermal_pattern.isothermColor_level1
                state.isothermColor_level2 = image?.thermal_pattern.isothermColor_level2
            }
        });
    }
    state.alarmID = log
    // state.treeviews = treeview
    state.desserts = output
    state.desserts2 = output2
    output = null
    output2 = null
    item0001 = null
    log = null
    camera = null
}
const runmoduleEchartsbar = (id, el) => {
    // console.log('runmoduleEcharttop', id, el);
    const index = refmoduleEchartsbar.value.findIndex((e) => e.id === id)
    if (index !== -1) return;
    refmoduleEchartsbar.value.push({
        id, el
    })
}
const isList = (arr) => {
    return Array.isArray(arr);
}
const ptzswitchEvent = (e) => {
    state.btnlock = true
    setTimeout(() => {
        state.btnlock = false
    }, 3000)
    console.log('state.ws3', state.ws3);
    // console.log(state.ws3);
    // if (e) {
    // state.ptzswitch = e
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
    // console.log("output", output);
    state.ws3.send(JSON.stringify(output))
}

const smokeSwitchEvent = (e) => {
    // if (e) {
    // state.smokeAlarm = e
    // } else {
    // state.ptzswitch = 1
    // }
    var output = {
        "feature": "test",
        "method": "set_alarm_singleCam",
        "content": {
            "camera_id": state.ptzinto.id,
            "test_alarm_status": e
        },
        "session": "asdasd"
    }
    state.ws3.send(JSON.stringify(output))
}
const changeCursingPoint = (e) => {
    // console.log('changeCursingPoint', e);
    var output = {
        "feature": "ptz",
        "method": "set_cursingPoint",
        "content": {
            "ptz_id": state.ptzinto.id,
            "cursingPoint_id": e.value
        },
        "session": Math.random().toString(36).substring(2, 9)
    }
    state.ws3.send(JSON.stringify(output))
}
const changeCursingPointHMI = (e, hmi, type) => {
    if (type === 1) {
        var output = {
            "feature": "ptz",
            "method": "set_cursingPoint",
            "content": {
                "ptz_id": hmi.data.camera_id,
                "cursingPoint_id": e.cruising_id
            },
            "session": Math.random().toString(36).substring(2, 9)
        }
        console.log('changeCursingPoint', hmi, output);
        state.ws3.send(JSON.stringify(output))
    }
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

const initWs3 = () => {
    const openwebsocket03 = () => {
        if (!isWorkActive) return
        if ($webSocketconnect03().readyState === 1) {
            ws3RetryTimer = clearTimer(ws3RetryTimer)
            console.log('$webSocketconnect03()', $webSocketconnect03());
            state.ws3 = $webSocketconnect03()
            if (state.wsListener3.close !== null) {
                state.ws3.removeEventListener("close", state.wsListener3.close)
                state.wsListener3.close = null
            }
            if (state.wsListener3.message !== null) {
                state.ws3.removeEventListener("message", state.wsListener3.message)
                state.wsListener3.message = null
            }
            const colseEvent = () => {
                if (isWorkActive && ws3RetryTimer === null) {
                    ws3RetryTimer = setTimeout(() => {
                        ws3RetryTimer = null
                        if (isWorkActive) openwebsocket03()
                    }, 1000)
                }
            }
            state.ws3.addEventListener("close", colseEvent)
            state.wsListener3.close = colseEvent
            // var tew = 0
            const messageEvent03 = (event) => {
                var data = JSON.parse(event.data)
                var feature = data.feature
                var method = data.method
                if (feature === "camera" && method === "query_thermalParameters") {
                    var info = data.content
                    state.screenSettings = [
                        // { name: '一般溫度', value: 0.95, check: false },
                        // { name: '反射溫度', value: info.reflectedTemperature, check: false, disabled: true },
                        { name: '環境溫度', value: info.atmosphericTemperature, check: false, disabled: false },
                        { name: '環境濕度', value: info.relativeHumidity, check: false, disabled: false }, // %
                        { name: '量測距離', value: info.objectDistance, check: false, disabled: false },
                        { name: '放射率', value: info.objectEmissivity, check: false, disabled: false },
                        { name: '穿透率', value: info.transmittance, check: false, disabled: false },
                        // { name: '放射率', value: false, check: true },
                        // { name: 'External IR Window', value: false, check: true }
                    ]
                    setTimeout(() => {
                        state.queryCameraInfoloading = false
                    }, 1000)
                } if (feature === "camera" && method === "set_thermalParameters") {
                    // console.log("data123", data);
                    setTimeout(() => {
                        state.queryCameraInfoloading = false
                    }, 1000)
                } else if (feature === "ir_operation" && method === "query_allOperationStatus") {
                    // state.displayObject5 = data.content.working_status === 1 ? true : false

                    console.log('query_allOperationStatus', data.content);
                    state.queryAllOperationStatusTable = data.content
                    // mapImport1.value.superResolution(data.content.working_status === 1 ? true : false)
                } else if (feature === "ir_operation" && method === "set_operationStatus") {
                    operation()
                }
            }
            state.ws3.addEventListener("message", messageEvent03)
            state.wsListener3.message = messageEvent03
            const initConnent = () => {
                queryCameraInfo()
            }
            initConnent()
        } else if ($webSocketconnect03().readyState !== 1) {
            if (isWorkActive && ws3RetryTimer === null) {
                ws3RetryTimer = setTimeout(() => {
                    ws3RetryTimer = null
                    if (isWorkActive) openwebsocket03()
                }, 1000)
            }
        }
    }
    openwebsocket03()
}
// const initWs5 = () => {
//     const openwebsocket05 = () => {
//         if ($webSocketconnect05().readyState === 1) {
//             state.ws5 = $webSocketconnect05()
//             if (state.wsListener5.close !== null) {
//                 state.ws5.removeEventListener("close", state.wsListener5.close)
//                 state.wsListener5.close = null
//             }
//             const colseEvent = () => {
//                 setTimeout(() => {
//                     openwebsocket05()
//                 }, 1000)
//             }
//             state.ws5.addEventListener("close", colseEvent)
//             state.wsListener5.close = colseEvent
//             // var tew = 0
//             const messageEvent1 = (event) => {
//                 var data = JSON.parse(event.data)
//                 state.wsRoiData1 = data
//                 // console.log(data);

//                 var arr = [{
//                     title: '-',
//                     value: 0
//                 }]
//                 var ptzContent = data.overall_ptzStatus.ptz_content
//                 ptzContent.forEach((item1) => {
//                     // 預設點
//                     if (item1.ptz_id === state.ptzinto.id) {
//                         var ptzCursingPointsContent = item1.ptz_cursingPoints_content
//                         ptzCursingPointsContent.forEach((item1) => {
//                             // console.log('預設點', item1);
//                             arr.push({
//                                 title: item1.cursingPoint_name,
//                                 value: item1.cursingPoint_id
//                             })
//                         })
//                     }
//                 })
//                 state.cursingPointItems = arr
//                 var findPtz = data.overall_ptzStatus.ptz_content.findIndex((item) => item.ptz_id === state.ptzinto.id)
//                 // console.log('findPtz', ptzContent[findPtz]);
//                 state.ptz_currentView_gps = ptzContent[findPtz]?.ptz_currentView_gps
//                 if (ptzContent[findPtz]?.ptz_working_status) {
//                     state.ptzswitch = ptzContent[findPtz].ptz_working_status
//                 }
//                 if (state.ptzCurrentAngleInput && ptzContent[findPtz]?.ptz_currentAngle) {
//                     state.ptzCurrentAngle = ptzContent[findPtz].ptz_currentAngle
//                 }
//             }
//             state.ws5.addEventListener("message", messageEvent1)
//             // state.wsListener3.message = messageEvent
//         } else if ($webSocketconnect05().readyState !== 1) {
//             setTimeout(() => {
//                 openwebsocket05()
//             }, 1000)
//         }
//     }
//     openwebsocket05()
// }
// --------------------------
const runroirander = (e) => {
    requestBtnGroupEvent({ type: 'roiRander' })
    state.switchpattenMenu = false
    // if (e) {
    // }
    //  else {
    //     requestBtnGroupEvent({ type: 'roiRanderClear' })
    // }
}
const switchWK = (e) => {
    const enabled = Boolean(e)
    if (isWorkActive === enabled) return
    isWorkActive = enabled
    mapImport1.value.switchWK(enabled)
    if (mapImport3.value !== null) {
        mapImport3.value.switchWK(enabled)
    }
    ctreeviewA.value.switchWK(enabled)
    if (enabled) {
        console.log('switchWKswitchWKswitchWKswitchWK', camID);
        initWs3()
        runwk02()
        runwk05()
        runHMIwk({ tab_id: tabId })
    } else {
        stopProgram()
    }
}
const stopProgram = () => {
    isWorkActive = false
    clearWorkRetryTimers()
    if (refreshHmiWk.value !== null) {
        refreshHmiWk.value.e.terminate()
        refreshHmiWk.value = null
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

    if (state.webWorker02 !== null) {
        state.webWorker02.terminate()
        state.webWorker02 = null
    }
    if (state.webWorker !== null) {
        state.webWorker.terminate()
        state.webWorker = null
    }
}
const runwk02 = () => {
    if (!isWorkActive) return
    worker02RestartTimer = clearTimer(worker02RestartTimer)
    if (state.webWorker02 !== null) {
        state.webWorker02.terminate()
        state.webWorker02 = null
    }
    console.log('runwk02runwk02runwk02');
    state.webWorker02 = new Worker('/worker/wktows02.js');
    state.webWorker02.addEventListener('message', (e) => {
        var res = e.data
        var type = res.type
        var parameter = res.parameter
        if (type === 'open') {
            // console.log('開啟worker 123');
            state.webWorker02.postMessage({
                type: 'start',
                parameter: {
                    wsURL: $webSocket02URL(),
                    camID,
                    type: 'main'
                }
            })
        } else if (type === 'ws') {
            let data = JSON.parse(parameter)
            // console.log('datadatadata', data);
            messageEvent(data)
        } else if (type === 'close') {
            console.log('close');
            state.webWorker02.terminate();
            state.webWorker02 = null
            if (isWorkActive && worker02RestartTimer === null) {
                worker02RestartTimer = setTimeout(() => {
                    worker02RestartTimer = null
                    if (isWorkActive) runwk02()
                }, 1)
            }
        }
    })
}
const runwk05 = () => {
    if (!isWorkActive) return
    worker05RestartTimer = clearTimer(worker05RestartTimer)
    if (state.webWorker !== null) {
        state.webWorker.terminate()
        state.webWorker = null
    }
    state.webWorker = new Worker('/worker/wktows05.js');
    state.webWorker.addEventListener('message', (e) => {
        var res = e.data
        var type = res.type
        var parameter = res.parameter
        if (type === 'open') {
            // console.log('開啟worker 123');
            state.webWorker.postMessage({
                type: 'start',
                parameter: {
                    wsURL: $webSocket05URL(),
                    camID
                }
            })
        } else if (type === 'ws') {
            let data = JSON.parse(JSON.parse(parameter))
            state.wsRoiData1 = data

            var arr = []
            var ptzContent = data.overall_ptzStatus.ptz_content
            ptzContent.forEach((item1, index) => {
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
            // console.log('findPtz', data.overall_ptzStatus.ptz_content, state.ptzinto.id)
            // state.cursingPointItems = [{
            //     title: 'test',
            //     value: 1
            // }]
            var findPtz = data.overall_ptzStatus.ptz_content.findIndex((item) => item.ptz_id === state.ptzinto.id)
            state.ptz_currentView_gps = ptzContent[findPtz]?.ptz_currentView_gps
            // if (ptzContent[findPtz]?.ptz_working_status) {
            //     state.ptzswitch = ptzContent[findPtz].ptz_working_status
            // }
            // if (state.ptzCurrentAngleInput && ptzContent[findPtz]?.ptz_currentAngle) {
            //     state.ptzCurrentAngle = ptzContent[findPtz].ptz_currentAngle
            // }

            data = null
            arr = null
            ptzContent = null
            findPtz = null
        } else if (type === 'close') {
            console.log('close');
            state.webWorker.terminate();
            state.webWorker = null
            if (isWorkActive && worker05RestartTimer === null) {
                worker05RestartTimer = setTimeout(() => {
                    worker05RestartTimer = null
                    if (isWorkActive) runwk05()
                }, 1)
            }
        }
    })
}
onMounted(() => {

    // setInterval(()=>{
    //     console.log(state.ws3);
    // },1000)
    // setTimeout(() => {
    //     treeviewTimeOut(false)
    // }, 30 * 1000)
    state.groupPanel = [
        "室外曝曬類", "自動偵測異溫區域", "動態偵測"]
    state.groupPanel2 = [
        "固定式區域", "自動偵測異溫動態遮罩區域"]
    // setTimeout(() => {
    // initWs3()
    // runwk02()
    // runwk05()
    // }, 1000)
    // console.log('掛鉤');
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
        var divA = visss12323123.value
        const dragHandle = dragHandle123.value;
        const resizeHandles = resizeHandle123.value;
        const canvas213 = movwwwe.value
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
    cutoverCanvasMap('view')
    // const currentPort = window.location.port;
    // setTimeout(() => {
    //     const divvdioe = document.getElementById(state.className)
    //     runRTC(divvdioe, `http://${$getIpaddress()}:${currentPort}/video/realtime/roiChart${camID}/`, 'vis')
    // }, 300)
    // const currentPort = window.location.port;
    // setTimeout(() => {
    //     const divvdioe = document.getElementById(state.className)
    //     runRTC(divvdioe, `http://${$getIpaddress()}:${currentPort}/video/realtime/roiChart${camID}`, 'vis')
    // }, 10)
})
// const ptzControl = () => {
//     sendPtzControl()
//     setTimeout(() => {
//         ptzControl()
//     }, 300)
// }
const runRTC = (dom, url, videoType) => {
    console.log('建立RTC連線 (main)', videoType, url);
    const retryPause = 2000;

    const video = dom;
    // console.log('rtc video (onlyvideo)', video);
    // const startBtn = document.getElementById('recorder-start');
    // const stopBtn = document.getElementById('recorder-stop');

    const message = document.getElementById('message');

    let pc = null;
    let restartTimeout = null;
    let sessionUrl = '';
    let offerData = '';
    let queuedCandidates = [];
    let defaultControls = false;
    // let redomID = Math.random().toString(36).substring(2, 9);
    const setMessage = (str) => {
        if (str !== '') {
            // video.controls = false;
        } else {
            // video.controls = defaultControls;
        }
        message.innerText = str;
    };

    const unquoteCredential = (v) => (
        JSON.parse(`"${v}"`)
    );

    const linkToIceServers = (links) => (
        (links !== null) ? links.split(', ').map((link) => {
            const m = link.match(/^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i);
            const ret = {
                urls: [m[1]],
            };

            if (m[3] !== undefined) {
                ret.username = unquoteCredential(m[3]);
                ret.credential = unquoteCredential(m[4]);
                ret.credentialType = 'password';
            }

            return ret;
        }) : []
    );

    const parseOffer = (offer) => {
        const ret = {
            iceUfrag: '',
            icePwd: '',
            medias: [],
        };

        for (const line of offer.split('\r\n')) {
            if (line.startsWith('m=')) {
                ret.medias.push(line.slice('m='.length));
            } else if (ret.iceUfrag === '' && line.startsWith('a=ice-ufrag:')) {
                ret.iceUfrag = line.slice('a=ice-ufrag:'.length);
            } else if (ret.icePwd === '' && line.startsWith('a=ice-pwd:')) {
                ret.icePwd = line.slice('a=ice-pwd:'.length);
            }
        }

        return ret;
    };

    const enableStereoOpus = (section) => {
        let opusPayloadFormat = '';
        let lines = section.split('\r\n');

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('a=rtpmap:') && lines[i].toLowerCase().includes('opus/')) {
                opusPayloadFormat = lines[i].slice('a=rtpmap:'.length).split(' ')[0];
                break;
            }
        }

        if (opusPayloadFormat === '') {
            return section;
        }

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('a=fmtp:' + opusPayloadFormat + ' ')) {
                if (!lines[i].includes('stereo')) {
                    lines[i] += ';stereo=1';
                }
                if (!lines[i].includes('sprop-stereo')) {
                    lines[i] += ';sprop-stereo=1';
                }
            }
        }

        return lines.join('\r\n');
    };

    const editOffer = (offer) => {
        const sections = offer.sdp.split('m=');

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            if (section.startsWith('audio')) {
                sections[i] = enableStereoOpus(section);
            }
        }

        offer.sdp = sections.join('m=');
    };

    const generateSdpFragment = (od, candidates) => {
        const candidatesByMedia = {};
        for (const candidate of candidates) {
            const mid = candidate.sdpMLineIndex;
            if (candidatesByMedia[mid] === undefined) {
                candidatesByMedia[mid] = [];
            }
            candidatesByMedia[mid].push(candidate);
        }

        let frag = 'a=ice-ufrag:' + od.iceUfrag + '\r\n'
            + 'a=ice-pwd:' + od.icePwd + '\r\n';

        let mid = 0;

        for (const media of od.medias) {
            if (candidatesByMedia[mid] !== undefined) {
                frag += 'm=' + media + '\r\n'
                    + 'a=mid:' + mid + '\r\n';

                for (const candidate of candidatesByMedia[mid]) {
                    frag += 'a=' + candidate.candidate + '\r\n';
                }
            }
            mid++;
        }

        return frag;
    };

    const loadStream = () => {
        requestICEServers();
    };

    const onError = (err) => {
        if (restartTimeout === null) {
            setMessage(err + ', retrying in some seconds');

            if (pc !== null) {
                pc.close();
                pc = null;
            }

            restartTimeout = window.setTimeout(() => {
                restartTimeout = null;
                loadStream();
            }, retryPause);

            if (sessionUrl) {
                fetch(sessionUrl, {
                    method: 'DELETE',
                });
            }
            sessionUrl = '';

            queuedCandidates = [];
        }
    };

    const sendLocalCandidates = (candidates) => {
        fetch(sessionUrl + window.location.search, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/trickle-ice-sdpfrag',
                'If-Match': '*',
            },
            body: generateSdpFragment(offerData, candidates),
        })
            .then((res) => {
                switch (res.status) {
                    case 204:
                        break;
                    case 404:
                        throw new Error('stream not found');
                    default:
                        throw new Error(`bad status code ${res.status}`);
                }
            })
            .catch((err) => {
                onError(err.toString());
            });
    };

    const onLocalCandidate = (evt) => {
        if (restartTimeout !== null) {
            return;
        }

        if (evt.candidate !== null) {
            if (sessionUrl === '') {
                queuedCandidates.push(evt.candidate);
            } else {
                sendLocalCandidates([evt.candidate])
            }
        }
    };

    const onRemoteAnswer = (sdp) => {
        if (restartTimeout !== null) {
            return;
        }

        pc.setRemoteDescription(new RTCSessionDescription({
            type: 'answer',
            sdp,
        }));

        if (queuedCandidates.length !== 0) {
            sendLocalCandidates(queuedCandidates);
            queuedCandidates = [];
        }
    };

    const sendOffer = (offer) => {
        fetch(`${url}/` + 'whep', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/sdp',
            },
            body: offer.sdp,
        })
            .then((res) => {
                switch (res.status) {
                    case 201:
                        break;
                    case 404:
                        throw new Error('stream not found');
                    default:
                        throw new Error(`bad status code ${res.status}`);
                }
                sessionUrl = new URL(res.headers.get('location'), url).toString();
                return res.text();
            })
            .then((sdp) => onRemoteAnswer(sdp))
            .catch((err) => {
                onError(err.toString());
            });
    };

    const createOffer = () => {
        pc.createOffer()
            .then((offer) => {
                editOffer(offer);
                offerData = parseOffer(offer.sdp);
                pc.setLocalDescription(offer);
                sendOffer(offer);
            });
    };

    const onConnectionState = () => {
        if (restartTimeout !== null) {
            return;
        }

        if (pc.iceConnectionState === 'disconnected') {
            onError('peer connection disconnected');
        }
    };

    const onTrack = (evt) => {
        setMessage('');
        // console.log('完成RTC連線  (main)', video, evt.streams[0]);
        video.style.objectFit = 'fill'
        video.srcObject = evt.streams[0];
    };

    const requestICEServers = () => {
        fetch(`${url}/` + 'whep', {
            method: 'OPTIONS',
        })
            .then((res) => {
                pc = new RTCPeerConnection({
                    iceServers: linkToIceServers(res.headers.get('Link')),
                    // https://webrtc.org/getting-started/unified-plan-transition-guide
                    sdpSemantics: 'unified-plan',
                });
                state.rtcPeerConnectionItems.push(pc);
                const direction = 'sendrecv';
                pc.addTransceiver('video', { direction });
                pc.addTransceiver('audio', { direction });

                pc.onicecandidate = (evt) => onLocalCandidate(evt);
                pc.oniceconnectionstatechange = () => onConnectionState();
                pc.ontrack = (evt) => onTrack(evt);

                createOffer();
            })
            .catch((err) => {
                onError(err.toString());
            });
    };

    const parseBoolString = (str, defaultVal) => {
        str = (str || '');

        if (['1', 'yes', 'true'].includes(str.toLowerCase())) {
            return true;
        }
        if (['0', 'no', 'false'].includes(str.toLowerCase())) {
            return false;
        }
        return defaultVal;
    };
    const loadAttributesFromQuery = () => {
        const params = new URLSearchParams(window.location.search);
        // video.controls = parseBoolString(params.get('controls'), true);
        // video.muted = parseBoolString(params.get('muted'), true);
        // video.autoplay = parseBoolString(params.get('autoplay'), true);
        // video.playsInline = parseBoolString(params.get('playsinline'), true);
        defaultControls = video.controls;
    };

    const init = () => {
        loadAttributesFromQuery();
        loadStream();
    };
    init()
    // window.addEventListener('DOMContentLoaded', init);
}
const sendPtzControl = () => {
    if (isWorkActive && state.ws3?.readyState === WebSocket.OPEN && state.ptzControlStatus !== 'none') {
        ptzControlTimer = clearTimer(ptzControlTimer)
        const comboMap = {
            'up left': ['up', 'left'],
            'up right': ['up', 'right'],
            'down left': ['down', 'left'],
            'down right': ['down', 'right'],
        }

        const makeOutput = (direction) => ({
            feature: 'ptz',
            method: 'set_continuousMove',
            session: Math.random().toString(36).substr(2),
            content: {
                ptz_id: camID,
                ptz_continuousMove: direction,
            }
        })

        const directions = comboMap[state.ptzControlStatus]

        if (directions) {
            for (const dir of directions) {
                state.ws3.send(JSON.stringify(makeOutput(dir)))
            }
        } else {
            state.ws3.send(JSON.stringify(makeOutput(state.ptzControlStatus)))
        }

        ptzControlTimer = setTimeout(() => {
            ptzControlTimer = null
            if (isWorkActive && state.ptzControlStatus !== 'none') {
                sendPtzControl()
            }
        }, 300)
    }

}
onBeforeUnmount(() => {
    stopProgram()
})
defineExpose({
    offdig,
    cutoverCanvasMap,
    resize,
    switchWK
})
</script>
<style scoped>
.container-canvas {
    display: grid;
    /* grid-template-columns: 65% 35%; */
    grid-template-columns: 62.5% 37.5%;
    /* grid-template-columns: auto 1fr; */
    /* 第一格自動寬度，第二格撿剩下的 */
    height: 100%;
    /* height: calc(); */
    /* background-color: #F2F2F2; */
    /* border: #D3D5D4 1px solid; */
}

.item-left {
    /* aspect-ratio: 4 / 3; */
    /* height: 100%; */
    /* 高度決定寬度 */
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
    grid-template-rows: 44% 56%;
    /* height: 100%; */
    height: calc(100vh - 35px);
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

    padding: .25em;
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

.c-switch-lo-1 {
    position: relative;
    display: grid;
    grid-template-columns: 50% 50%;
    text-align: center;
    border-radius: 5px;
    color: #121212;
    cursor: pointer;
    width: 120px;
    background: #ffffff;
    font-size: 20px;
}

.c-switch-a-1 {
    position: relative;
    z-index: 1;
}

.c-switch-b-1 {
    z-index: 1;
}

/* 開關css */
.c-switch-lo {
    position: relative;
    display: grid;
    grid-template-columns: 50% 50%;
    text-align: center;
    border: #878787 1px solid;
    border-radius: 3px;
    color: #878787;
    cursor: pointer;
    background: #fff;
    width: 153px;
    height: 30px;
    line-height: 2;
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
    border-radius: 3px;
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

.c-switch-after-add-2::after {
    background-color: #ffe56f;
    border: #ffe56f 1px solid;
    left: 100%;
    box-shadow: 0px 0px 0px 0px #6795D4;
    animation: gogogo2 2.5s infinite linear;
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

@keyframes gogogo2 {
    0% {
        opacity: 0.65;
        box-shadow: 0px 0px 0px 0px #ffe56f;
    }

    50% {
        opacity: 1;
        box-shadow: 1px 1px 8px 5px #f5d23a;
    }

    100% {
        opacity: 0.65;
        box-shadow: 0px 0px 0px 0px #ffe56f;
    }
}

/* 開關css */
/* 開關css */
.c-switch-lo1 {
    position: relative;
    display: grid;
    grid-template-columns: 50% 50%;
    text-align: center;
    border: #878787 1px solid;
    border-radius: 5px;
    color: #878787;
    cursor: pointer;
    width: 100px;
    font-size: 12px;
    height: 26px;
    line-height: 2;
}

.c-switch-a1 {
    position: relative;
    z-index: 1;
}

.c-switch-b1 {
    z-index: 1;
}

.c-switch-a1::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #878787;
    border: #979797 1px solid;
    border-radius: 5px;
    z-index: -1;
    transition: all .3s;
    opacity: 0.65;
}

.c-switch-after-add1::after {
    background-color: #d1d1d1;
    border: #979797 1px solid;
    left: 100%;
    box-shadow: 0px 0px 0px 0px #c3c4c5;
}

.c-switch-after-add1::after {
    border: #979797 1px solid;
    left: 100%;
}

.c-switch-foucs1 {
    color: #fff;
}

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
    height: 21px;
    background-color: #F2F2F2;
    /* box-shadow: 1px 1px 11px 1px #87878787; */
    cursor: move;
    text-align: start;
    font-size: 15px;
    padding: 0em .5em;
}

.drag-handle-bar {
    height: 42px;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    flex-wrap: nowrap;
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

.map-veiw-mode {
    z-index: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* display: none; */
    background: #fff;
}

.map-veiw-mode .item-card-content {
    padding: 0 !important;
}

.map-veiw-hidde {
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none !important;
}

.swbtn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 9;
}

.BR-btn-group {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 9;
    display: flex;
    flex-direction: row;
}

.BR-btn {
    border-radius: .25em;
    background: #00000070;
    font-size: 14px;
    color: #fff;
    padding: 0.5em .3em;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background .3s;
}

.BR-btn23 {
    background: #00000000;
}

.BR-btn:hover {
    background: #57575770;
}

.BR-btn:active {
    background: #31313170;
}

.BR-btn-ptz-status {
    border-radius: .25em;
    background: #00000070;
    font-size: 14px;
    color: #fff;
    padding: 0.5em .5em;
    width: 400px;
    display: flex;
    align-items: center;
    transition: background .3s;
    justify-content: space-between;
}

.BR-btn1 {
    border-radius: .25em;
    background: #00000070;
    font-size: 14px;
    color: #fff;
    padding: 0.5em .3em;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background .3s;
}

.menu-ptz-text {
    background: #00000070;
    border-radius: .25em;
    width: 400px;
    height: 203px;
    padding: .25em;
    color: #fff;
    font-size: 14px;
    display: grid;
    grid-template-columns: 60% 40%;
}

.menu-ptten-text {
    background: #00000070;
    border-radius: .25em;
    width: 400px;
    height: 205px;
    padding: .25em;
    color: #fff;
    font-size: 14px;
    display: grid;
}

.menu-ptz-item {
    display: grid;
    grid-template-columns: 30% 70%;
    text-align: center;
}

.menu-ptz-item-o {
    display: grid;
    grid-template-columns: 30% 45% 25%;
    text-align: center;
}

.menu-ptz-row-p {
    display: grid;
    grid-template-rows: 50% 50%;
    align-items: center;
}

.menu-title {
    width: 100%;
    text-align: justify;
    text-justify: distribute;
    font-family: monospace;
    padding: 0.25em;
    height: 26px;
    /* 或其他固定寬度字體 */
}

.menu-title::after {
    content: "";
    display: inline-block;
    width: 100%;
}

.menu-btn-crtl-ptz {
    width: 100%;
    display: grid;
    grid-template-columns: 33.3% 33.3% 33.3%;
    height: 124px;
}

.c-table-btn button {
    height: 27px;
}

.menu0-item-canvas-grid {
    width: 100%;
    display: grid;
    grid-template-columns: 25% 75%;
}
</style>

<style>
.w-message-s {
    background-color: #808080;
    border-radius: 3px;
    color: #fff;
    font-size: 17px;
    padding: .25em;
}

.c-table-btn span {
    font-size: 12px !important;
}

.c-switch-foucs-1 {
    background-color: #6795D4;
    border-radius: 5px;
}

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

.coustom-table {
    position: relative;
    /* padding: 0 !important; */
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
    top: calc(100vh - 500px);
    left: calc(100vw - 863px);
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

.frame-content input {
    padding: 0 !important;
    min-height: 0 !important;
}

.frame-content .v-field__field {
    height: 20px !important;
}

.patrol-puse-control-123 {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #080808c9;
    text-align: center;
    width: 300px;
    height: 120px;
    opacity: 1;
    color: #fff;
    font-size: 18px;
    border: 1px solid;
    border-radius: 5px;
}
</style>
<style>
.swiper {
    width: 100%;
    height: 100%;
    user-select: none;
}

.swiper-slide {
    text-align: center;
    font-size: 18px;
    background: #FBFBFB;
    /* width: calc(570px / 2) !important; */
    width: calc(100% - 5px) !important;
    height: 100% !important;
    /* Center slide text vertically */
    /* display: flex; */
    /* justify-content: center; */
    /* align-items: center; */
}

.myswiper-slider-div-ca001 {
    width: 100%;
    height: 95%;
    border: 1px solid #aaa;
}

.myswiper-slider-div-container001 {
    display: grid;


    /* 🟢 定義 2 欄，每欄寬 50% */
    grid-template-columns: 49% 49%;

    /* 🟢 每欄最多 4 行（可依需求調整） */
    grid-template-rows: repeat(5, 1fr);

    /* 🟢 關鍵：改成從上往下填，滿一欄後換到右邊 */
    grid-auto-flow: column;

    /* (可選) 間距 */
    gap: 0px;
    height: 90%;
}

.myswiper-slider-item-01 {
    /* background: #2196f3; */
    /* color: white; */
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    border: 1px solid #fff;
    width: 100%;
    position: relative;
    max-height: 50px;
}


.myswiper-slider-div {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 30% 40% 30%;
    font-size: 14px;
    font-weight: 400;
    border: 0.5px solid #aaa;
    transition: background .2s;
}

.myswiper-slider-div01 {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 30% 40% 30%;
    font-size: 14px;
    font-weight: 400;
    border: 0.5px solid #CACACA;
    background: #FBFBFB;
}

.myswiper-slider-div>div {
    width: 100%;
    height: 100%;
}

.myswiper-slider-div-on {
    cursor: pointer;
}

.myswiper-slider-div-on:hover {
    background: #e9e9e9;
}

.myswiper-slider-div-on:active {
    background: #cccccc;
}

.swiper-slide-active {
    border: #fff 3px solid;
}

.triangle-badge {
    position: absolute;
    top: 5px;
    left: 5px;
    width: 18px;
    /* 整個形狀寬度 */
    height: 18px;
    /* 整個形狀高度 */
    background: #DDDDDD;
    /* 底色，可改 */
    clip-path: polygon(0 0, 100% 0, 0 100%);
    /* 斜三角形 */

    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    color: white;
    /* 文字顏色 */
    font-size: 10px;
    /* ✔ 大小 */
    font-weight: bold;
}

.triangle-badge>span {
    margin-left: 3px;
    margin-top: -2px;
}

.swiper-pagination {
    margin: 0px 0px -5px 0px;
}

.swiper-pagination.swiper-pagination-lock {
    display: flex !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    justify-content: center;
}

.swiper-pagination.swiper-pagination-lock>span {
    width: 8px;
    /* 整個形狀寬度 */
    height: 8px;
    display: block !important;
}
</style>
<style>
/* 這邊是type 5 專用css */
.stack-item-type5-grid-row0 {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: 30px 1fr;
}

.stack-item-type5-grid {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 20% 60% 20%;
}

.d-rect-www01-1 {
    width: 32px;
    height: 24px;
    border: 1px #000 solid;
    border-radius: 2px;
}

/* 開關css */
.c-switch-lo20-1 {
    position: relative;
    display: grid;
    grid-template-columns: 50% 50%;
    text-align: center;
    border: #878787 1px solid;
    border-radius: 3px;
    color: #878787;
    cursor: pointer;
    background: #fff;
    width: 116px;
    height: 30px;
    line-height: 2;
}

.c-switch-a20 {
    position: relative;
    z-index: 1;
}

.c-switch-b20 {
    z-index: 1;
}

.c-switch-a20::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #878787;
    border: #979797 1px solid;
    border-radius: 3px;
    z-index: -1;
    /* transition: all .3s; */
    opacity: 0.65;
}

.c-switch-after-add20::after {
    background-color: #6795D4;
    border: #5075A9 1px solid;
    left: 100%;
    box-shadow: 0px 0px 0px 0px #6795D4;
    /* animation: gogogo20 2.5s infinite linear; */
}

.c-switch-after-add-220::after {
    background-color: #ffe56f;
    border: #ffe56f 1px solid;
    left: 100%;
    box-shadow: 0px 0px 0px 0px #6795D4;
    /* animation: gogogo220 2.5s infinite linear; */
}

.c-switch-after-add120::after {
    border: #5075A9 1px solid;
    left: 100%;
}

.c-switch-foucs20 {
    color: #fff;
}

@keyframes gogogo20 {
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

@keyframes gogogo220 {
    0% {
        opacity: 0.65;
        box-shadow: 0px 0px 0px 0px #ffe56f;
    }

    50% {
        opacity: 1;
        box-shadow: 1px 1px 8px 5px #f5d23a;
    }

    100% {
        opacity: 0.65;
        box-shadow: 0px 0px 0px 0px #ffe56f;
    }
}

/* 開關css */

/* 未選中的圓點 */
.swiper-pagination-bullet {
    width: 8px;
    height: 8px;
    background: #EDEDED;
    /* 灰色 */
    opacity: 1;
    /* Swiper 預設 0.2，改成 1 比較清楚 */
    margin: 7px 4px !important;
}

/* 選中的圓點 */
.swiper-pagination-bullet-active {
    background: #D5D5D5;
    /* 你想要的顏色 */
    /* width: 14px; */
    /* height: 14px; */
}
</style>
