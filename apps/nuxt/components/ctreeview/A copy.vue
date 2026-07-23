<template>
    <div id="c-treeView" style="max-height: 458px;overflow: auto;">
        <div class="tree-table" style="font-size:12px;">
            <div class="tree-table-td tree-table-lv1">群組</div>
            <div class="tree-table-td tree-table-lv2-0"></div>
            <div class="tree-table-td tree-table-lv2">ROI名稱</div>
            <div class="tree-table-td tree-table-lv3">警報狀態</div>
            <div class="tree-table-td tree-table-lv4">最高溫度</div>
            <div class="tree-table-td tree-table-lv5">一級/二級警報</div>
            <div class="tree-table-td tree-table-lv6">最大溫差</div>
            <div class="tree-table-td tree-table-lv7">溫差警報</div>
            <div class="tree-table-td tree-table-lv8">警報開關</div>
            <div class="tree-table-td tree-table-lv9"></div>
        </div>
        <div class="c-treeView-plane c-treeView-plane-active" v-for="item in state.treeviews" :key="'xs' + item.title"
            style="font-size:12px;">
            <!-- level 1 -->
            <template v-if="item?.childNodes">
                <div class="c-treeView-plane-tag">
                    <div class="c-treeView-plane-h" @click="activeNode">
                        <div class="tree-table-td point0-log d-flex tree-table-lv1">
                            <div class="muen-btns mr-3">
                                <b class="muen-btn muen-btn-up active-btn">▲</b>
                                <b class="muen-btn muen-btn-down">▼</b>
                            </div>
                            <div>
                                {{ item.data.roi_mainGroup_name }}({{ item.num }})
                            </div>
                        </div>
                        <div class="tree-table-td tree-table-lv2-0"></div>
                        <div class="tree-table-td tree-table-lv2"></div>
                        <div class="tree-table-td tree-table-lv3"></div>
                        <div class="tree-table-td tree-table-lv4"></div>
                        <div class="tree-table-td tree-table-lv5"></div>
                        <div class="tree-table-td tree-table-lv6"></div>
                        <div class="tree-table-td tree-table-lv7"></div>
                        <div class="tree-table-td tree-table-lv8 d-flex justify-center"
                            style="pointer-events: all !important;">
                            <v-checkbox :indeterminate="vCheckboxindeterminatelevel1(item) === 1"
                                :model-value="vCheckboxindeterminatelevel1(item) === 2" hide-details
                                @update:model-value="(e) => checkboxSend('main', e, item.data, item.data.roi_mainGroup_id, null)"
                                color="blue" :disabled="item.data.roi_mainGroup_type === 3"></v-checkbox>
                        </div>
                        <div class="tree-table-td tree-table-lv9 d-flex justify-space-between"
                            style="pointer-events: all !important;">
                            <div class="c-table-btn mt-1" style="width: 70px;">
                                <v-btn v-if="item.data.roi_mainGroup_type === 1" block
                                    @click="opendialog(item.data, 11)">新增子群組</v-btn>
                            </div>
                            <div>
                                <div class="ml-2" style="width: 30px" v-if="item.data.roi_mainGroup_type === 1">
                                    <v-btn flat block color="#00000000">
                                        <img src="/images/fs/icon/more.svg" width="30px" />
                                        <template v-if="item.data.roi_mainGroup_type === 1">
                                            <v-menu activator="parent">
                                                <v-list>
                                                    <v-list-item
                                                        v-for="meunItem1 in [{ title: '修改名稱', value: 7 }, { title: '刪除主群組', value: 10 }]"
                                                        @click="opendialog(item.data, meunItem1.value)">
                                                        <v-list-item-title>{{ meunItem1.title }}</v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                        </template>
                                    </v-btn>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="c-treeView-content">
                    <template v-if="item?.childNodes">
                        <!-- level 2 -->
                        <!-- A.vue 是主選單 B.vue 是帶有itme的副選單 -->
                        <!-- <CtreeviewB ref="subItem" :formtData="item.childNodes">
                        </CtreeviewB> -->
                        <div id="c-treeView">
                            <div class="c-treeView-plane c-treeView-plane-active"
                                v-for="childNodeItem in item.childNodes">
                                <template v-if="childNodeItem?.childNodes">
                                    <div class="c-treeView-plane-tag">
                                        <div class="c-treeView-plane-h" @click="activeNode"
                                            style="border-bottom: #c4c4c4 1px solid;"
                                            :style="alarmBackground(childNodeItem.data.roi_subGroup_alarmStatus)">
                                            <div class="tree-table-td tree-table-lv2-0"></div>

                                            <div class="tree-table-td point0-log d-flex tree-table-lv2">
                                                <div class="muen-btns mr-3">
                                                    <b class="muen-btn muen-btn-up active-btn">▲</b>
                                                    <b class="muen-btn muen-btn-down">▼</b>
                                                </div>
                                                <template v-if="childNodeItem.data.roi_subGroup_numberLimitation === 0">
                                                    <div>
                                                        {{ childNodeItem.data.roi_subGroup_name }}({{ childNodeItem.num
                                                        }})
                                                    </div>
                                                </template>
                                                <template v-else>
                                                    <div>
                                                        {{ childNodeItem.data.roi_subGroup_name }}({{ childNodeItem.num
                                                        }}/{{
                                                        childNodeItem.data.roi_subGroup_numberLimitation }})
                                                    </div>
                                                </template>
                                            </div>
                                            <div class=" tree-table-td tree-table-lv3 d-flex justify-center">
                                                <div style="width:100%;">
                                                    <v-btn class="text-none" flat block color="#00000000">
                                                        <v-badge color="error"
                                                            :content="childNodeItem.data.roi_subGroup_alarmContent.length"
                                                            :model-value="childNodeItem.data.roi_subGroup_alarmContent.length > 0">
                                                            <template
                                                                v-if="vCheckboxindeterminatelevel2(childNodeItem) === 0">
                                                                <img class="ml-2" src="/images/fs/icon/alarm-off.svg"
                                                                    width="30px" />
                                                            </template>
                                                            <template v-else>
                                                                <img class="ml-2" src="/images/fs/icon/Doorbell.svg"
                                                                    width="30px"
                                                                    v-if="childNodeItem.data.roi_subGroup_alarmStatus === 0" />
                                                                <img src="/images/fs/icon/alarm-on.svg" width="30px"
                                                                    v-else />
                                                            </template>
                                                        </v-badge>
                                                        <v-tooltip activator="parent" location="end">
                                                            <div v-for="itemSubAlarmContent in childNodeItem.data.roi_subGroup_alarmContent"
                                                                v-if="childNodeItem.data.roi_subGroup_alarmContent.length > 0">
                                                                {{ itemSubAlarmContent }}
                                                            </div>
                                                        </v-tooltip>
                                                    </v-btn>
                                                </div>
                                                <!-- <div class="d-flex align-center justify-center">
                                                    <div>{{ item.thresholdManual }}</div>
                                                    <div>
                                                        <div class="ml-2" style="width: 30px">
                                                            <v-btn flat block color="#00000000"
                                                                @click="changeRoiItem(item.alarmStatus === 0 ? 'alarmOn' : 'alarmOff', item)">
                                                                <img src="/images/fs/icon/alarm-off.svg" width="30px"
                                                                    v-if="item.alarmStatus === 0" />
                                                                <img src="/images/fs/icon/alarm-on.svg" width="30px"
                                                                    v-else-if="item.alarmStatus === 1" />
                                                            </v-btn>
                                                        </div>
                                                    </div>
                                                </div> -->
                                            </div>
                                            <div class="tree-table-td tree-table-lv4">{{
                                                childNodeItem.data.roi_subGroup_maxTemperature }}</div>
                                            <div class="tree-table-td tree-table-lv5">{{
                                                childNodeItem.data.roi_subGroup_thresholdSystem }}/{{
                                                childNodeItem.data.roi_subGroup_thresholdManual }}</div>
                                            <div class="tree-table-td tree-table-lv6">
                                                {{ childNodeItem.data.roi_subGroup_maxTemperatureDiff }}
                                                <!-- -- -->
                                            </div>
                                            <div class="tree-table-td tree-table-lv7">
                                                {{ childNodeItem.data.roi_subGroup_thresholdManual_TempDiff }}
                                                <!-- -- -->
                                            </div>
                                            <div class="tree-table-td tree-table-lv8 d-flex justify-center"
                                                style="pointer-events: all !important;">
                                                <v-checkbox
                                                    :indeterminate="vCheckboxindeterminatelevel2(childNodeItem) === 1"
                                                    :model-value="vCheckboxindeterminatelevel2(childNodeItem) === 2"
                                                    @update:model-value="(e) => checkboxSend('sub', e, childNodeItem.data, item.data.roi_mainGroup_id, childNodeItem.data.roi_subGroup_id)"
                                                    hide-details color="blue"
                                                    :disabled="item.data.roi_mainGroup_type === 3"></v-checkbox>
                                            </div>
                                            <div class="tree-table-td tree-table-lv9 d-flex justify-space-between"
                                                style="pointer-events: all !important;">
                                                <!-- level 2 btn -->
                                                <div class="c-table-btn mt-1" style="width: 65px;">
                                                    <v-menu v-if="item.data.roi_mainGroup_type === 1">
                                                        <template v-slot:activator="{ props }">
                                                            <v-btn v-bind="props">
                                                                新增ROI <b class="">▼</b>
                                                            </v-btn>
                                                        </template>
                                                        <v-list>
                                                            <v-list-item
                                                                v-for="(itemList, index) in state.createRoiItems"
                                                                :key="index" :value="index"
                                                                @click="$emit('requestAddRoi', { mainGroupData: item.data, subGroupData: childNodeItem.data, type: itemList.value })">
                                                                <v-list-item-title>{{ itemList.title
                                                                    }}</v-list-item-title>
                                                            </v-list-item>
                                                        </v-list>
                                                    </v-menu>
                                                    <!-- <v-btn v-if="item.data.roi_mainGroup_type === 1" block
                                                            @click="$emit('requestAddRoi', { mainGroupData: item.data, subGroupData: childNodeItem.data })">新增ROI</v-btn> -->
                                                </div>
                                                <div>
                                                    <div class="ml-2" style="width: 30px"
                                                        v-if="item.data.roi_mainGroup_type === 1 && childNodeItem.data.roi_subGroup_name !== 'others'">
                                                        <v-btn flat block color="#00000000">
                                                            <img src="/images/fs/icon/more.svg" width="30px" />
                                                            <template v-if="item.data.roi_mainGroup_type === 1">
                                                                <v-menu activator="parent">
                                                                    <v-list>
                                                                        <!-- :style="item.name === '環境濕度' ? 'width: 70px' : 'width: 80px'" -->
                                                                        <v-list-item
                                                                            v-for="meunItem1 in [{ title: '修改名稱', value: 8 }, { title: '修改二級警報溫度', value: 2 }, { title: '修改溫差警報溫度', value: 14 }, { title: '刪除次群組', value: 12 }]"
                                                                            @click="opendialog(childNodeItem.data, meunItem1.value)">
                                                                            <v-list-item-title>{{ meunItem1.title
                                                                                }}</v-list-item-title>
                                                                        </v-list-item>
                                                                    </v-list>
                                                                </v-menu>
                                                            </template>
                                                        </v-btn>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- <div class="tree-table-td">
                            xxx
                        </div> -->
                                        </div>
                                    </div>
                                    <div>
                                        <template v-if="childNodeItem?.childNodes">
                                            <!-- level 3 -->
                                            <!-- <CtreeviewB :formtData="childNodeItem.childNodes"></CtreeviewB> -->
                                            <div id="c-treeView">
                                                <div class="c-treeView-plane c-treeView-plane-active position-relative"
                                                    v-for="childNodeItem2 in childNodeItem.childNodes">
                                                    <div class="tree-table align-center" style="height:35px;"
                                                        :style="alarmBackground(childNodeItem2.data.roi_alarmStatus)">
                                                        <div class="tree-table-td tree-table-lv2-0">
                                                            <!-- {{ childNodeItem2.data.roi_type }} -->
                                                            <div class="roi-type-icon-content">
                                                                <div class="roi-type-id">{{ childNodeItem2.data.roi_id
                                                                    }}</div>
                                                                <div class="roi-type-icon">
                                                                    <img src="/images/icon/Iconspot.svg" width="100%"
                                                                        v-if="childNodeItem2.data.roi_type === 'spot'" />
                                                                    <img src="/images/icon/Iconline.svg" width="100%"
                                                                        v-else-if="childNodeItem2.data.roi_type === 'line'" />
                                                                    <img src="/images/icon/Iconscope.svg" width="100%"
                                                                        v-else-if="childNodeItem2.data.roi_type === 'scope'" />
                                                                    <img src="/images/icon/Iconblob.svg" width="100%"
                                                                        v-else-if="childNodeItem2.data.roi_type === 'blob'" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="tree-table-td tree-table-lv2">
                                                            {{
                                                            childNodeItem2.data.roi_name
                                                            }}
                                                        </div>
                                                        <div class="tree-table-td tree-table-lv3">
                                                            <div class="d-flex align-center justify-center">
                                                                <div style="width:100%;">
                                                                    <div class="ml-2" style="width: 30px">
                                                                        <div style="width:100%;">
                                                                            <v-btn class="text-none" flat block
                                                                                color="#00000000">
                                                                                <v-badge color="error"
                                                                                    :model-value="childNodeItem2.data.roi_alarmContent.length > 0"
                                                                                    :content="childNodeItem2.data.roi_alarmContent.length">
                                                                                    <template
                                                                                        v-if="childNodeItem2.data.roi_alarmSwitch === 0">
                                                                                        <img class="ml-2"
                                                                                            src="/images/fs/icon/alarm-off.svg"
                                                                                            width="30px" />
                                                                                    </template>
                                                                                    <template v-else>
                                                                                        <img class="ml-2"
                                                                                            src="/images/fs/icon/Doorbell.svg"
                                                                                            width="30px"
                                                                                            v-if="childNodeItem2.data.roi_alarmStatus === 0" />
                                                                                        <img src="/images/fs/icon/alarm-on.svg"
                                                                                            width="30px" v-else />
                                                                                    </template>

                                                                                </v-badge>
                                                                                <v-tooltip activator="parent"
                                                                                    location="end">
                                                                                    <div v-for="itemSubAlarmContent1 in childNodeItem2.data.roi_alarmContent"
                                                                                        v-if="childNodeItem2.data.roi_alarmContent.length > 0">
                                                                                        {{ itemSubAlarmContent1 }}
                                                                                    </div>
                                                                                </v-tooltip>
                                                                            </v-btn>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="tree-table-td tree-table-lv4"
                                                            :style="childNodeItem2.data.roi_alarmStatus !== 0 ? 'color:rgb(255 0 0 )' : ''">
                                                            {{ childNodeItem2.data.roi_maxTemperature }}
                                                        </div>
                                                        <div class="tree-table-td tree-table-lv5"></div>
                                                        <div class="tree-table-td tree-table-lv6"></div>
                                                        <div class="tree-table-td tree-table-lv7">

                                                            <!-- <v-checkbox v-model="selected" value="Jacob" hide-details></v-checkbox> -->
                                                        </div>
                                                        <div class="tree-table-td tree-table-lv8 d-flex justify-center">
                                                            <v-checkbox
                                                                :model-value="childNodeItem2.data.roi_alarmSwitch === 1"
                                                                color="blue" hide-details
                                                                @update:model-value="(e) => checkboxSend('roi', e, childNodeItem2.data, item.data.roi_mainGroup_id, childNodeItem.data.roi_subGroup_id)"
                                                                :disabled="item.data.roi_mainGroup_type === 3"></v-checkbox>
                                                        </div>
                                                        <div
                                                            class="tree-table-td tree-table-lv9 d-flex justify-space-between">
                                                            <!-- level 3 btn -->
                                                            <div></div>
                                                            <div>
                                                                <div class="ml-2" style="width: 30px"
                                                                    v-if="item.data.roi_mainGroup_type === 1">
                                                                    <v-btn flat block color="#00000000">
                                                                        <img src="/images/fs/icon/more.svg"
                                                                            width="30px" />
                                                                        <template
                                                                            v-if="item.data.roi_mainGroup_type === 1">
                                                                            <v-menu activator="parent">
                                                                                <v-list>
                                                                                    <!-- { title: '修改名稱', value: 1 } -->
                                                                                    <v-list-item
                                                                                        v-for="meunItem1 in [{ title: '修改名稱', value: 6 }, { title: '修改群組', value: 13 }, { title: '刪除項目', value: 5 }]"
                                                                                        @click="opendialog(childNodeItem2.data, meunItem1.value)">
                                                                                        <v-list-item-title>{{
                                                                                            meunItem1.title
                                                                                            }}</v-list-item-title>
                                                                                    </v-list-item>
                                                                                </v-list>
                                                                            </v-menu>
                                                                        </template>
                                                                    </v-btn>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                        <!-- <template v-else>
                        <div>{{ childNodeItem.title }}</div>
                    </template> -->
                                    </div>
                                </template>
                                <template v-else>

                                    <!-- <div>sdasde</div> -->
                                    <!-- <div class="tree-table">
                    <div class="tree-table-td">AAA</div>
                    <div class="tree-table-td">AAA</div>
                    <div class="tree-table-td">AAA</div>
                    <div class="tree-table-td">AAA</div>
                    <div class="tree-table-td">AAA</div>
                </div> -->
                                    <!-- <div>{{ childNodeItem.title }}</div> -->
                                </template>
                            </div>
                        </div>

                    </template>
                    <!-- <template v-else>
                        <div>{{ item.title }}</div>
                    </template> -->
                </div>
            </template>
            <template v-else>
                <!-- <div>sdasde</div> -->
                <!-- <div class="tree-table">
                    <div class="tree-table-td">AAA</div>
                    <div class="tree-table-td">AAA</div>
                    <div class="tree-table-td">AAA</div>
                    <div class="tree-table-td">AAA</div>
                    <div class="tree-table-td">AAA</div>
                </div> -->
                <!-- <div>{{ item.title }}</div> -->
            </template>
        </div>
        <!-- 重新命名/刪除對話框 -->
        <v-dialog v-model="state.roiItemDialog" width="auto" style="z-index: 1000;">
            <template v-if="state.roiItemDialogType === 14">
                <v-card max-width="400" prepend-icon="mdi-update" title="修改溫差警報溫度">
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
                        <v-btn text="送出" @click="changeRoiItem()" :disabled="state.tempValue === ''"></v-btn>
                    </template>
                </v-card>
            </template>
            <template v-if="state.roiItemDialogType === 2">
                <v-card max-width="400" prepend-icon="mdi-update" title="修改二級警報溫度">
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
                        <v-btn text="送出" @click="changeRoiItem()" :disabled="state.tempValue === ''"></v-btn>
                    </template>
                </v-card>
            </template>
            <template v-else-if="state.roiItemDialogType === 5">
                <v-card max-width="400" prepend-icon="mdi-update" title="是否刪除項目?">
                    <template v-slot:actions>
                        <v-btn text="取消" @click="state.roiItemDialog = false"></v-btn>
                        <v-btn text="送出" @click="changeRoiItem()"></v-btn>
                    </template>
                </v-card>
            </template>
            <template
                v-else-if="state.roiItemDialogType === 6 || state.roiItemDialogType === 7 || state.roiItemDialogType === 8">
                <v-card max-width="400" prepend-icon="mdi-update"
                    :title="state.roiItemDialogType === 6 ? '修改項目名稱' : state.roiItemDialogType === 7 ? '修改主群組名稱' : '修改次群組名稱'">
                    <template v-slot:text>
                        <v-sheet class="mx-auto" width="300">
                            <v-form @submit.prevent>
                                <v-text-field v-model="state.tempValue" :rules="state.rules" label="名稱"></v-text-field>
                            </v-form>
                        </v-sheet>
                    </template>
                    <template v-slot:actions>
                        <v-btn text="取消" @click="state.roiItemDialog = false"></v-btn>
                        <v-btn text="送出" @click="changeRoiItem()" :disabled="state.tempValue === ''"></v-btn>
                    </template>
                </v-card>
            </template>
            <template v-if="state.roiItemDialogType === 9 || state.roiItemDialogType === 11">
                <v-card max-width="400" prepend-icon="mdi-update"
                    :title="`新增${state.roiItemDialogType === 9 ? '主' : '次'}群組`">
                    <template v-slot:text>
                        <v-sheet class="mx-auto" width="300" v-if="state.roiItemDialogType === 9">
                            <v-select v-model="state.selectedMainClassID" :items="state.roiMainClassID"
                                label="主群組類別"></v-select>
                        </v-sheet>
                        <v-sheet class="mx-auto" width="300">
                            <v-form @submit.prevent>
                                <v-text-field v-model="state.tempValue" :rules="state.rules"
                                    label="輸入名稱"></v-text-field>
                            </v-form>
                        </v-sheet>
                    </template>
                    <template v-slot:actions>
                        <v-btn text="取消" @click="state.roiItemDialog = false"></v-btn>
                        <v-btn text="送出" @click="changeRoiItem()" :disabled="state.tempValue === ''"></v-btn>
                    </template>
                </v-card>
            </template>
            <template v-if="state.roiItemDialogType === 10 || state.roiItemDialogType === 12">
                <v-card max-width="400" prepend-icon="mdi-update"
                    :title="`即將刪除${state.roiItemDialogType === 10 ? '主' : '次'}群組`">
                    <template v-slot:actions>
                        <v-btn text="取消" @click="state.roiItemDialog = false"></v-btn>
                        <v-btn text="刪除" @click="changeRoiItem()"></v-btn>
                    </template>
                </v-card>
            </template>
            <template v-if="state.roiItemDialogType === 13">
                <v-card max-width="400" prepend-icon="mdi-update" :title="`切換群組`">
                    <template v-slot:text>
                        <v-select v-model="state.selectedMainGroup" :items="state.roiMainGroups"
                            item-text="roi_mainGroup_name" label="主群組" @update:modelValue="updateSubGroup"></v-select>
                        <v-select v-model="state.selectedSubGroup" :items="state.roiSubGroups"
                            item-text="roi_subGroup_name" label="次群組"
                            v-if="state.selectedMainGroup !== null"></v-select>
                    </template>
                    <template v-slot:actions>
                        <v-btn text="取消" @click="state.roiItemDialog = false"></v-btn>
                        <v-btn text="確定" @click="changeRoiItem()"></v-btn>
                    </template>
                </v-card>
            </template>
        </v-dialog>
    </div>
</template>
<script setup>
const { $webSocketconnect03 } = useNuxtApp()
const props = useAttrs().formtData
const camID = useAttrs().camID
// const cursingPointId = useAttrs().cursingPointId
const state = reactive({
    treeviews: [],

    ws3: {
        readyState: 0
    },
    wsListener3: {
        close: null,
        message: null
    },
    roiItemDialog: false,
    roiItemDialogType: 1,
    tempValue: null,
    tempDate: null,
    rules: [
        value => {
            if (value) return true

            return '項目名稱不能為空'
        },
    ],
    createRoiItems: [{
        title: '點',
        value: 'spot'
    }, {
        title: '線',
        value: 'line'
    }, {
        title: '矩形',
        value: 'scope'
    },
    // {
    //     title: '多邊形',
    //     value: 'plo'
    // },
    {
        title: '球狀',
        value: 'blob'
    }, {
        title: 'AI點',
        value: 'aiSpot'
    }],
    selectedMainClassID: 0,
    roiMainClassID: [{
        title: 'others',
        value: 0
    }, {
        title: '電抗',
        value: 3
    }, {
        title: '電容',
        value: 4
    }, {
        title: '接點',
        value: 5
    }],
    selectedMainGroup: null,
    roiMainGroups: [],
    selectedSubGroup: null,
    roiSubGroups: [],
    tempsubGroup:null
})
watch(
    () => state.selectedMainGroup,
    (e, prevData) => {
        // if (JSON.stringify(prevData) !== JSON.stringify(e)) {
        // state.treeviews = []
        // setTimeout(() => {
        // state.treeviews = e
        // console.log(state.treeviews);
        // }, 0);
        // }
    }
)
watch(
    () => props.treeviews,
    (e, prevData) => {
        let data = e
        // if (JSON.stringify(prevData) !== JSON.stringify(e)) {
        // state.treeviews = []
        // setTimeout(() => {
        state.treeviews = data
        // console.log('watch', e);
        state.roiMainGroups = transformData(data)
        data = null
        // }, 0);
        // }
    }
)
const updateSubGroup = (e) => {
    let data = state.treeviews.find((item) => {
        return item.data.roi_mainGroup_id === e
    })
    state.roiSubGroups = transformDataSubGroup(data.data.roi_subGroup_list)
    data = null
}
const transformData = (data) => {
    return data.map(item => ({
        title: item.data.roi_mainGroup_name,
        value: item.data.roi_mainGroup_id
    }));
}
const transformDataSubGroup = (data) => {
    return data.map(item => ({
        title: item.roi_subGroup_name,
        value: item.roi_subGroup_id
    }));
}
const alarmBackground = (e) => {
    if (e === 0) {
        return ''
    } else if (e === 1) {
        return ''
    } else if (e === 2) {
        return 'background-color:#FFEFEF;'
    }
}
const activeNode = (e) => {
    // 自訂樹狀
    const parentNode = e.target.parentNode.parentNode;
    const isActive = parentNode.classList.toggle('c-treeView-plane-active');

    e.target.childNodes.forEach((node) => {
        if (node.classList.contains('point0-log')) {
            node.childNodes.forEach((nodec) => {
                if (nodec.classList.contains('muen-btns')) {
                    nodec.childNodes.forEach((nodeb) => {
                        nodeb.classList.toggle('active-btn', isActive === nodeb.classList.contains('muen-btn-up'));
                    })
                }
            });
        }
    });
};
const opendialog = (data, type) => {
    state.roiItemDialog = true
    if (type === 2) {
        state.tempValue = data.roi_subGroup_thresholdManual
    } else if (type === 5) {
        state.tempValue = data.roi_id
    } else if (type === 6) {
        state.tempValue = data.roi_name
    } else if (type === 7) {
        state.tempValue = data.roi_mainGroup_name
    } else if (type === 8) {
        state.tempValue = data.roi_subGroup_name
    } else if (type === 13) {
        console.log('change group');
        state.tempValue = data.roi_id
        // state.tempValue = data.roi_subGroup_name
    } else if (type === 14) {
        state.tempValue = data.roi_subGroup_thresholdManual_TempDiff
        state.tempsubGroup = data.roi_subGroup_id
    }
    state.tempDate = data
    state.roiItemDialogType = type
}

const changeRoiItem = () => {
    if (state.roiItemDialogType === 2) {
        // 修改二次溫度 / 次群組
        // console.log('cursingPointId', props.cursingPointId);
        var output = {
            "feature": "roi",
            "method": "set_manualThreshold",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "camera_id": camID,
                "cursingPoint_id": props.cursingPointId,
                "image_type": 'ir',
                "roi_subGroup_thresholdManual": parseFloat(state.tempValue),
                "roi_subGroup_id": state.tempDate.roi_subGroup_id
            }
        }
        state.ws3.send(JSON.stringify(output))
    } else if (state.roiItemDialogType === 5) {
        // 刪除ROI項目
        // console.log('cursingPointId', props.cursingPointId);
        var output = {
            "feature": "roi",
            "method": "set_roiExist",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "camera_id": camID,
                "cursingPoint_id": props.cursingPointId,
                "image_type": 'ir',
                "curd_type": 2,
                "roi_id": state.tempValue
            }
        }
        state.ws3.send(JSON.stringify(output))
    } else if (state.roiItemDialogType === 6 || state.roiItemDialogType === 7 || state.roiItemDialogType === 8) {
        // 刪除ROI項目
        // console.log('cursingPointId', props.cursingPointId);
        var output = {
            "feature": "roi",
            "method": "set_roi_group_Name",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "camera_id": camID,
                "cursingPoint_id": props.cursingPointId,
                "image_type": 'ir',
                "name_type": null
            }
        }
        if (state.roiItemDialogType === 6) {
            output.content.name_type = 1 // 修改 ROI 名稱
            output.content.roi_id = state.tempDate.roi_id
            output.content.roi_name = state.tempValue
        } else if (state.roiItemDialogType === 7) {
            output.content.name_type = 3 // 修改 Main Group 名稱
            output.content.roi_mainGroup_id = state.tempDate.roi_mainGroup_id
            output.content.roi_mainGroup_name = state.tempValue
        } else if (state.roiItemDialogType === 8) {
            output.content.name_type = 2 // 修改 Sub Group 名稱
            output.content.roi_subGroup_id = state.tempDate.roi_subGroup_id
            output.content.roi_subGroup_name = state.tempValue
        }
        state.ws3.send(JSON.stringify(output))
    } else if (state.roiItemDialogType === 9 || state.roiItemDialogType === 10 || state.roiItemDialogType === 11 || state.roiItemDialogType === 12) {
        console.log('state.roiItemDialogType', state.roiItemDialogType);
        // 9  主群組新增
        // 10 主群組刪除
        // 11 次群組新增
        // 12 次群組刪除
        var output = {
            "feature": "roi",
            "method": "set_roiGroup",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "camera_id": camID,
                "cursingPoint_id": props.cursingPointId,
                "image_type": 'ir',
                "group_type": state.roiItemDialogType === 11 || state.roiItemDialogType === 12 ? 1 : 2,
                "curd_type": state.roiItemDialogType === 9 || state.roiItemDialogType === 11 ? 1 : 2,
                "field_id": 1,
            }
        }
        if (state.roiItemDialogType === 9) {
            // 9  主群組新增
            output.content.roi_mainGroup_name = state.tempValue
            output.content.roi_mainGroup_type = 0
            output.content.roiClass_id = state.selectedMainClassID
        } else if (state.roiItemDialogType === 10) {
            // 10 主群組刪除
            output.content.roi_mainGroup_id = state.tempDate.roi_mainGroup_id
        } else if (state.roiItemDialogType === 11) {
            // 11 次群組新增
            output.content.roi_mainGroup_type = 0
            output.content.roi_mainGroup_id = state.tempDate.roi_mainGroup_id
            output.content.roi_subGroup_name = state.tempValue
        } else if (state.roiItemDialogType === 12) {
            // 12 次群組刪除
            output.content.roi_subGroup_id = state.tempDate.roi_subGroup_id
        }
        state.ws3.send(JSON.stringify(output))
    } else if (state.roiItemDialogType === 13) {
        var output = {
            "feature": "roi",
            "method": "set_roi_mainSubGroup",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "curd_type":1,
                "field_id":1,
                "camera_id": camID,
                "cursingPoint_id": props.cursingPointId,
                "image_type": 'ir',
                "roi_id": state.tempValue,
                "roi_mainGroup_id": state.selectedMainGroup,
                "roi_subGroup_id": state.selectedSubGroup
            }
        }
        console.log('send group', output);
        state.ws3.send(JSON.stringify(output))
    } else if (state.roiItemDialogType === 14) {
        var output = {
            "feature": "roi",
            "method": "set_manualTempDiffThreshold",
            "session": Math.random().toString(36).substr(2),
            "content": {
                // "field_id": 1,
                "camera_id": camID,
                "cursingPoint_id": props.cursingPointId,
                "image_type": 'ir',
                "roi_subGroup_thresholdManual_TempDiff": parseFloat(state.tempValue),
                "roi_subGroup_id": parseInt(state.tempsubGroup)
            }
        }
        // console.log('send group', output);
        state.ws3.send(JSON.stringify(output))
    }
    state.tempValue = null
    state.tempDate = null
    state.roiItemDialog = false
}
const checkboxSend = (type, e, data, mainGroupId, subGroupId) => {
    // console.log('checkboxSend', e, data);
    var output = null
    if (type === 'roi') {
        output = {
            "feature": "roi",
            "method": "set_alarmSwitch",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "camera_id": data.camera_id,
                "switch_type": 1,
                "cursingPoint_id": data.cursingPoint_id,
                "image_type": 'ir',
                "roi_id": data.roi_id,
                "roi_alarmSwitch": e === true ? 1 : 0,
                "roi_mainGroup_id": mainGroupId,
                "roi_subGroup_id": subGroupId
            }
        }
    } else if (type === 'sub') {
        output = {
            "feature": "roi",
            "method": "set_alarmSwitch",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "camera_id": data.camera_id,
                "switch_type": 2,
                "cursingPoint_id": data.cursingPoint_id,
                "image_type": 'ir',
                "roi_alarmSwitch": e === true ? 1 : 0,
                // "roi_mainGroup_id": mainGroupId,
                "roi_subGroup_id": subGroupId
            }
        }
    } else if (type === 'main') {
        output = {
            "feature": "roi",
            "method": "set_alarmSwitch",
            "session": Math.random().toString(36).substr(2),
            "content": {
                "camera_id": data.camera_id,
                "switch_type": 3,
                "cursingPoint_id": data.cursingPoint_id,
                "image_type": 'ir',
                "roi_alarmSwitch": e === true ? 1 : 0,
                "roi_mainGroup_id": mainGroupId,
                // "roi_subGroup_id": subGroupId
            }
        }
    }
    if (output !== null) {
        state.ws3.send(JSON.stringify(output))
    }
}
const vCheckboxindeterminatelevel1 = (e) => {
    let arr = []
    for (const item of e.data.roi_subGroup_list) {
        const result = vCheckboxindeterminatelevel2({ data: item });
        arr.push(result)
        // if (result === 1) {
        //     hasOne = true; // 标记有返回值为1的情况
        // }

        // if (result !== 0) {
        //     allZero = false; // 如果有任何不是0的情况，allZero就设为false
        // }

        // if (result === 2 && !hasOne) {
        //     return 2; // 如果结果是2并且没有遇到过1，立即返回2
        // }
    }
    return checkArray(arr);
    function checkArray(arr) {
        const uniqueValues = new Set(arr); // 去重，得到陣列中的唯一值
        if (uniqueValues.size === 1) {
            if (uniqueValues.has(0)) return 0;
            if (uniqueValues.has(2)) return 2;
        }
        return 1; // 混雜的情況
    }
}
const vCheckboxindeterminatelevel2 = (e) => {
    var index = 0
    var length = e.data.roi_roi_content_list.length
    e.data.roi_roi_content_list.forEach((item) => {
        if (item.roi_alarmSwitch !== 0) {
            index++
        }
    })
    if (index === 0) {
        return 0;
    } else if (index > 0 && index !== length) {
        return 1
    } else if (index > 0 && index === length) {
        return 2
    }
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
                // var data = JSON.parse(event.data)
                // console.log("data", data);
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
onMounted(() => {
    initWs3()
})
onBeforeUnmount(() => {
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
})
defineExpose({
    opendialog,
})
</script>
<style scoped>
/* 自定義樹狀 */
.tree-table {
    display: flex;
    padding: .5em 1em;
    /* background-color: #fff; */
    position: sticky;
    top: 0;
    /* justify-content: space-around; */
}

.tree-table-td {
    /* width: 80px; */
    text-align: center;
}

.c-treeView-plane {
    overflow: hidden;
    transition: all .2s;
    max-height: 35px;
}

.c-treeView-plane-active {
    max-height: 1000px;
}

.c-treeView-plane-tag {
    height: 35px;
    /* padding: .5em; */
}

.c-treeView-plane-h {
    width: 100%;
    height: 100%;
    /* box-shadow: 1px 1px 6px 3px #00000017; */
    background-color: #ffffff;
    cursor: pointer;
    transition: all .3s;
    border-radius: .2em;
    display: flex;
    align-items: center;
    /* justify-content: space-between; */
    padding: 0em 1em;
}

.c-treeView-plane-h:hover {
    background-color: #e7e7e7;
}

.c-treeView-plane-h:active {
    background-color: #c4c4c4;
}

.c-treeView-plane-h>div {
    pointer-events: none;
}

.muen-btn {
    display: none;
}

.active-btn {
    display: unset;
}

.c-treeView-content {
    padding-left: 90px;
}

.c-table-btn button {
    height: 27px;
}

/* 自定義樹狀 end */
</style>
<style>
.tree-table-lv1 {
    width: 90px;
}

.tree-table-lv2-0 {
    width: 30px;
}

.tree-table-lv2 {
    width: 160px;
}

.tree-table-lv3 {
    width: 60px;
}

.tree-table-lv4 {
    width: 80px;
}

.tree-table-lv5 {
    width: 80px;
}

.tree-table-lv6 {
    width: 80px;
}

.tree-table-lv7 {
    width: 60px;
}

.tree-table-lv8 {
    width: 60px;
}

.tree-table-lv9 {
    width: 120px;
}

.c-table-btn span {
    font-size: 12px !important;
}

.roi-type-icon-content {
    position: relative;
}

.roi-type-id {
    position: absolute;
    bottom: -1px;
    right: -52%;
    border-radius: 30px;
    background-color: #F2F2F2;
    border: #87878766 1px solid;
    width: 25px;
    height: 25px;
    line-height: 2;
}

.roi-type-icon {
    background-color: #F2F2F2;
    padding: 4px;
    border-radius: 5px;
}
</style>