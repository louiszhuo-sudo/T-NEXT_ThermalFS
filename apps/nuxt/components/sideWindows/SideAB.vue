<template>
    <div>
        <div class="lists-container">

            <div class="fixed pt-1" style="background-color: #fff;">

                <div class="tab-header">
                    <button @click="changeTab(1)" :class="{ active: activeTab === 1 }" class="tab-button d-flex">
                        <v-icon style="color:grey">mdi-transit-connection-variant</v-icon>
                        <div class="pl-2 font mt-1" style="color:grey">巡弋狀態</div>
                    </button>
                </div>

                <div class="pt-2 px-2">
                    <!-- v-model="keyword" @input="filter" @click:append-inner="onClick" -->
                    <v-text-field dense class="pb-2" :loading="loading" append-inner-icon="mdi-magnify"
                        density="compact" label="搜尋" variant="outlined" hide-details single-line>
                    </v-text-field>
                </div>

            </div>
            <!-- 內部巢狀結構 (如果有子項目並且已展開) -->
            <v-card color="">
                <v-card-text class="pa-0">
                    <draggable v-model="transformedData" group="shared" tag="ul" animation="300" @start="onDragStart"
                        @end="onDragEnd">
                        <template #item="{ element: n, index }">
                            <li :key="n.header">
                                <!-- 收折按鈕 -->
                                <div class="d-flex  align-center">
                                    <div class="treeHeader">{{ n.header }}</div>
                                    <v-spacer />
                                    <v-icon size="20" @click="n.expanded = !n.expanded">{{ n.expanded ? 'mdi-menu-down'
                                        :
                                        'mdi-menu-right' }}</v-icon>


                                </div>
                                <!-- 新增子項目按鈕 -->
                                <!-- <button @click="addChild(index, 'group1')">新增子項目</button> -->

                                <!-- 內部巢狀結構 (如果有子項目並且已展開) -->
                                <draggable v-if="n.content && n.expanded" v-model="n.content" :move="checkIfDraggable"
                                    group="shared" tag="ul" animation="300" style="background-color: #fff;">
                                    <template #item="{ element: n2 }">
                                        <div :key="n2.id">
                                            <!-- 收折按鈕 -->
                                            <div class="d-flex  align-center">
                                                <v-icon v-if="n2.children" size="20"
                                                    @click="n2.expanded = !n2.expanded">{{ n2.expanded ?
                                                    'mdi-menu-down'
                                                    :
                                                    'mdi-menu-right' }}</v-icon>
                                                <div v-for="(e2, indexE2) in getFirstStatus(n2.overall_status)"
                                                    :key="indexE" class="image-container">
                                                    <div v-if="e2 === 'online'"
                                                        style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                        <v-icon size="12" color="#74E041">
                                                            mdi-circle
                                                        </v-icon>
                                                    </div>
                                                    <div v-if="e2 === 'offline'"
                                                        style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                        <v-icon size="12" color="red">
                                                            mdi-circle
                                                        </v-icon>
                                                    </div>
                                                    <div v-if="e2 === 'unknow'"
                                                        style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                        <v-icon size="12" color="red">
                                                            mdi-circle
                                                        </v-icon>
                                                    </div>
                                                    <div v-if="e2 === 'recording'"
                                                        style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                        <v-icon size="12" color="red">
                                                            mdi-record-circle-outline
                                                        </v-icon>
                                                    </div>
                                                    <div v-if="e2 === 'recordingIdle'"
                                                        style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                        <v-icon size="12" color="grey">
                                                            mdi-record-circle-outline
                                                        </v-icon>
                                                    </div>
                                                    <div v-if="e2 === 'cruisingIdle'"
                                                        style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                        <v-icon size="12" color="grey">
                                                            mdi-video
                                                        </v-icon>
                                                    </div>
                                                    <div v-if="e2 === 'cruisingNoAlarm'"
                                                        style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                        <v-icon size="12" color="red">
                                                            mdi-video
                                                        </v-icon>
                                                    </div>
                                                    <div v-if="e2 === 'cruisingAlarm'"
                                                        style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                        <v-icon size="12" color="red">
                                                            mdi-alert
                                                        </v-icon>
                                                    </div>
                                                    <!-- <div v-if="n === 'space'" style="background-color: red;width:20px;height:20px"> -->
                                                    <div v-if="e2 === 'space'" style="width:20px;height:20px">

                                                    </div>
                                                    <div class="container"
                                                        v-if="e2 !== 'space' && e2 !== 'online' && e2 !== 'offline' && e2 !== 'recording' && e2 !== 'recordingIdle' && e2 !== 'cruisingIdle' && e2 !== 'cruisingNoAlarm' && e2 !== 'cruisingAlarm'"
                                                        :class="indexE2 === 1 ? '' : ''">
                                                        <NuxtImg :src="e2" />
                                                    </div>
                                                </div>
                                                <div class="treeTitle">&nbsp;{{ n2.name }}</div>
                                                <div class="treeSubtitle">&nbsp;{{ n2.sub_name }}</div>


                                                <v-spacer />
                                                <div v-for="(e2L, indexN5L) in getLastStatus(n2.overall_status)"
                                                    :key="indexN2L">
                                                    <div v-if="e2L === 'ptzCruising'" class="right-red-alert">巡弋中
                                                    </div>
                                                    <div v-else-if="e2L === 'ptzIdle'" class="right-grey-alert">閒置中
                                                    </div>
                                                    <div v-else-if="e2L === 'ptzSupport'" class="right-red-alert">支援偵測
                                                    </div>
                                                    <div v-else-if="e2L === 'ptzSetting'" class="right-blue-alert">設定中
                                                    </div>
                                                    <div v-else-if="e2L === 'aidiNoTriggered'" class="right-grey-alert">
                                                        未觸發
                                                    </div>
                                                    <div v-else-if="e2L === 'aidiTriggered'" class="right-red-alert">已觸發
                                                    </div>
                                                    <div v-else-if="e2L === 'stopped'" class="right-red-alert">停用
                                                    </div>
                                                    <div v-else-if="e2L === 'unknown'" class="right-red-alert">未知
                                                    </div>

                                                    <!-- <div v-if="e2L === 'space'" style="background-color: red;width:20px;height:20px"> -->
                                                    <div v-if="e2L === 'space'" style="width:20px;height:20px">
                                                    </div>
                                                </div>



                                                <v-menu :close-on-content-click="false" location="end">
                                                    <template v-slot:activator="{ props }">
                                                        <v-icon size="15" v-if="n2.id === 100" v-bind="props">
                                                            mdi-information-outline
                                                        </v-icon>
                                                    </template>
                                                    <SideWindowsDetectorList></SideWindowsDetectorList>
                                                </v-menu>


                                            </div>

                                            <!-- 內部巢狀結構 (如果有子項目並且已展開) -->
                                            <draggable v-if="n2.children && n2.expanded" v-model="n2.children"
                                                :move="checkIfDraggable" group="shared" tag="div" animation="300">
                                                <template #item="{ element: n3 }">
                                                    <div :key="n3.id">
                                                        <!-- 收折按鈕 -->

                                                        <div class="d-flex  align-center">
                                                            <div style="width:20px"></div>
                                                            <v-icon v-if="n3.children" size="20"
                                                                @click="n3.expanded = !n3.expanded">{{
                                                                n3.expanded ?
                                                                'mdi-menu-down'
                                                                :
                                                                'mdi-menu-right' }}</v-icon>
                                                            <div v-for="(e3, indexE3) in getFirstStatus(n3.overall_status)"
                                                                :key="indexE" class="image-container">
                                                                <div v-if="e3 === 'online'"
                                                                    style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                    <v-icon size="12" color="#74E041">
                                                                        mdi-circle
                                                                    </v-icon>
                                                                </div>
                                                                <div v-if="e3 === 'offline'"
                                                                    style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                    <v-icon size="12" color="red">
                                                                        mdi-circle
                                                                    </v-icon>
                                                                </div>
                                                                <div v-if="e3 === 'unknow'"
                                                                    style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                    <v-icon size="12" color="red">
                                                                        mdi-circle
                                                                    </v-icon>
                                                                </div>
                                                                <div v-if="e3 === 'recording'"
                                                                    style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                    <v-icon size="12" color="red">
                                                                        mdi-record-circle-outline
                                                                    </v-icon>
                                                                </div>
                                                                <div v-if="e3 === 'recordingIdle'"
                                                                    style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                    <v-icon size="12" color="grey">
                                                                        mdi-record-circle-outline
                                                                    </v-icon>
                                                                </div>
                                                                <div v-if="e3 === 'cruisingIdle'"
                                                                    style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                    <v-icon size="12" color="grey">
                                                                        mdi-video
                                                                    </v-icon>
                                                                </div>
                                                                <div v-if="e3 === 'cruisingNoAlarm'"
                                                                    style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                    <v-icon size="12" color="red">
                                                                        mdi-video
                                                                    </v-icon>
                                                                </div>
                                                                <div v-if="e3 === 'cruisingAlarm'"
                                                                    style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                    <v-icon size="12" color="red">
                                                                        mdi-alert
                                                                    </v-icon>
                                                                </div>
                                                                <!-- <div v-if="n === 'space'" style="background-color: red;width:20px;height:20px"> -->
                                                                <div v-if="e3 === 'space'"
                                                                    style="width:20px;height:20px">

                                                                </div>
                                                                <div class="container "
                                                                    v-if="e3 !== 'space' && e3 !== 'online' && e3 !== 'offline' && e3 !== 'recording' && e3 !== 'recordingIdle' && e3 !== 'cruisingIdle' && e3 !== 'cruisingNoAlarm' && e3 !== 'cruisingAlarm'"
                                                                    :class="indexE3 === 1 ? '' : ''">
                                                                    <NuxtImg :src="e3" />
                                                                </div>
                                                            </div>
                                                            <div class="treeTitle">&nbsp;{{ n3.name }}</div>
                                                            <div class="treeSubtitle">&nbsp;{{ n3.sub_name }}</div>
                                                            <v-spacer />

                                                            <div v-for="(e3L, indexN3L) in getLastStatus(n3.overall_status)"
                                                                :key="indexN3L">
                                                                <div v-if="e3L === 'ptzCruising'"
                                                                    class="right-red-alert">巡弋中
                                                                </div>
                                                                <div v-else-if="e3L === 'ptzIdle'"
                                                                    class="right-grey-alert">閒置中
                                                                </div>
                                                                <div v-else-if="e3L === 'ptzSupport'"
                                                                    class="right-red-alert">支援偵測
                                                                </div>
                                                                <div v-else-if="e3L === 'ptzSetting'"
                                                                    class="right-blue-alert">設定中
                                                                </div>
                                                                <div v-else-if="e3L === 'aidiNoTriggered'"
                                                                    class="right-grey-alert">未觸發
                                                                </div>
                                                                <div v-else-if="e3L === 'aidiTriggered'"
                                                                    class="right-red-alert">已觸發
                                                                </div>
                                                                <div v-else-if="e3L === 'stopped'"
                                                                    class="right-red-alert">停用
                                                                </div>
                                                                <div v-else-if="e3L === 'unknown'"
                                                                    class="right-red-alert">未知
                                                                </div>

                                                                <!-- <div v-if="e4L === 'space'" style="background-color: red;width:20px;height:20px"> -->
                                                                <div v-if="e3L === 'space'"
                                                                    style="width:20px;height:20px">
                                                                </div>
                                                            </div>

                                                            <v-menu :close-on-content-click="false" location="end">
                                                                <template v-slot:activator="{ props }">
                                                                    <v-icon size="15" v-if="n3.id === 100"
                                                                        v-bind="props">
                                                                        mdi-information-outline
                                                                    </v-icon>
                                                                </template>
                                                                <SideWindowsDetectorList></SideWindowsDetectorList>
                                                            </v-menu>


                                                        </div>


                                                        <!-- 內部巢狀結構 (如果有子項目並且已展開) -->
                                                        <draggable v-if="n3.children && n3.expanded"
                                                            v-model="n3.children" :move="checkIfDraggable"
                                                            group="shared" tag="div" animation="300">
                                                            <template #header></template> <!-- 加這行就不會 crash -->
                                                            <template #item="{ element: n4 }">
                                                                <div :key="n4.id">
                                                                    <!-- 收折按鈕 -->
                                                                    <div class="d-flex  align-center">
                                                                        <div style="width:40px"></div>
                                                                        <v-icon v-if="n4.children" size="20"
                                                                            @click="n4.expanded = !n4.expanded">{{
                                                                            n4.expanded ?
                                                                            'mdi-menu-down'
                                                                            :
                                                                            'mdi-menu-right' }}</v-icon>

                                                                        <div v-for="(e4, indexE4) in getFirstStatus(n4.overall_status)"
                                                                            :key="indexE" class="image-container">
                                                                            <div v-if="e4 === 'online'"
                                                                                style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                <v-icon size="12" color="#74E041">
                                                                                    mdi-circle
                                                                                </v-icon>
                                                                            </div>
                                                                            <div v-if="e4 === 'offline'"
                                                                                style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                <v-icon size="12" color="red">
                                                                                    mdi-circle
                                                                                </v-icon>
                                                                            </div>
                                                                            <div v-if="e4 === 'unknow'"
                                                                                style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                <v-icon size="12" color="red">
                                                                                    mdi-circle
                                                                                </v-icon>
                                                                            </div>
                                                                            <div v-if="e4 === 'recording'"
                                                                                style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                <v-icon size="12" color="red">
                                                                                    mdi-record-circle-outline
                                                                                </v-icon>
                                                                            </div>
                                                                            <div v-if="e4 === 'recordingIdle'"
                                                                                style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                <v-icon size="12" color="grey">
                                                                                    mdi-record-circle-outline
                                                                                </v-icon>
                                                                            </div>
                                                                            <div v-if="e4 === 'cruisingIdle'"
                                                                                style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                <v-icon size="12" color="grey">
                                                                                    mdi-video
                                                                                </v-icon>
                                                                            </div>
                                                                            <div v-if="e4 === 'cruisingNoAlarm'"
                                                                                style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                <v-icon size="12" color="red">
                                                                                    mdi-video
                                                                                </v-icon>
                                                                            </div>
                                                                            <div v-if="e4 === 'cruisingAlarm'"
                                                                                style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                <v-icon size="12" color="red">
                                                                                    mdi-alert
                                                                                </v-icon>
                                                                            </div>
                                                                            <!-- <div v-if="n === 'space'" style="background-color: red;width:20px;height:20px"> -->
                                                                            <div v-if="e4 === 'space'"
                                                                                style="width:20px;height:20px">

                                                                            </div>
                                                                            <div class="container "
                                                                                v-if="e4 !== 'space' && e4 !== 'online' && e4 !== 'offline' && e4 !== 'recording' && e4 !== 'recordingIdle' && e4 !== 'cruisingIdle' && e4 !== 'cruisingNoAlarm' && e4 !== 'cruisingAlarm'"
                                                                                :class="indexE4 === 1 ? '' : ''">
                                                                                <NuxtImg :src="e4" />
                                                                            </div>
                                                                        </div>
                                                                        <div class="treeTitle">&nbsp;{{ n4.name }}</div>
                                                                        <div class="treeSubtitle">&nbsp;{{ n4.sub_name
                                                                            }}</div>

                                                                        <v-spacer />
                                                                        <div v-for="(e4L, indexN4L) in getLastStatus(n4.overall_status)"
                                                                            :key="indexN4L">
                                                                            <div v-if="e4L === 'ptzCruising'"
                                                                                class="right-red-alert">巡弋中
                                                                            </div>
                                                                            <div v-else-if="e4L === 'ptzIdle'"
                                                                                class="right-grey-alert">閒置中
                                                                            </div>
                                                                            <div v-else-if="e4L === 'ptzSupport'"
                                                                                class="right-red-alert">支援偵測
                                                                            </div>
                                                                            <div v-else-if="e4L === 'ptzSetting'"
                                                                                class="right-blue-alert">設定中
                                                                            </div>
                                                                            <div v-else-if="e4L === 'aidiNoTriggered'"
                                                                                class="right-grey-alert">未觸發
                                                                            </div>
                                                                            <div v-else-if="e4L === 'aidiTriggered'"
                                                                                class="right-red-alert">已觸發
                                                                            </div>
                                                                            <div v-else-if="e4L === 'stopped'"
                                                                                class="right-red-alert">停用
                                                                            </div>
                                                                            <div v-else-if="e4L === 'unknown'"
                                                                                class="right-red-alert">未知
                                                                            </div>

                                                                            <!-- <div v-if="e4L === 'space'" style="background-color: red;width:20px;height:20px"> -->
                                                                            <div v-if="e4L === 'space'"
                                                                                style="width:20px;height:20px">
                                                                            </div>
                                                                        </div>

                                                                        <v-menu :close-on-content-click="false"
                                                                            location="end">
                                                                            <template v-slot:activator="{ props }">
                                                                                <v-icon size="15" v-if="n4.id === 100"
                                                                                    v-bind="props">
                                                                                    mdi-information-outline
                                                                                </v-icon>
                                                                            </template>
                                                                            <SideWindowsDetectorList>
                                                                            </SideWindowsDetectorList>
                                                                        </v-menu>



                                                                    </div>

                                                                    <!-- 內部巢狀結構 (如果有子項目並且已展開) -->
                                                                    <draggable v-if="n4.children && n4.expanded"
                                                                        v-model="n4.children" :move="checkIfDraggable"
                                                                        group="shared" tag="div" animation="300">
                                                                        <template #item="{ element: n5 }">
                                                                            <div :key="n.id">
                                                                                <!-- 收折按鈕 -->
                                                                                <div class="d-flex  align-center">
                                                                                    <div style="width:40px"></div>
                                                                                    <v-icon v-if="n5.children" size="20"
                                                                                        @click="n5.expanded = !n5.expanded">{{
                                                                                        n5.expanded ?
                                                                                        'mdi-menu-down'
                                                                                        :
                                                                                        'mdi-menu-right' }}</v-icon>

                                                                                    <div v-for="(e5, indexE5) in getFirstStatus(n5.overall_status)"
                                                                                        :key="indexE"
                                                                                        class="image-container">
                                                                                        <div v-if="e5 === 'online'"
                                                                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                            <v-icon size="12"
                                                                                                color="#74E041">
                                                                                                mdi-circle
                                                                                            </v-icon>
                                                                                        </div>
                                                                                        <div v-if="e5 === 'offline'"
                                                                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                            <v-icon size="12"
                                                                                                color="red">
                                                                                                mdi-circle
                                                                                            </v-icon>
                                                                                        </div>
                                                                                        <div v-if="e5 === 'unknow'"
                                                                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                            <v-icon size="12"
                                                                                                color="red">
                                                                                                mdi-circle
                                                                                            </v-icon>
                                                                                        </div>
                                                                                        <div v-if="e5 === 'recording'"
                                                                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                            <v-icon size="12"
                                                                                                color="red">
                                                                                                mdi-record-circle-outline
                                                                                            </v-icon>
                                                                                        </div>
                                                                                        <div v-if="e5 === 'recordingIdle'"
                                                                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                            <v-icon size="12"
                                                                                                color="grey">
                                                                                                mdi-record-circle-outline
                                                                                            </v-icon>
                                                                                        </div>
                                                                                        <div v-if="e5 === 'cruisingIdle'"
                                                                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                            <v-icon size="12"
                                                                                                color="grey">
                                                                                                mdi-video
                                                                                            </v-icon>
                                                                                        </div>
                                                                                        <div v-if="e5 === 'cruisingNoAlarm'"
                                                                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                            <v-icon size="12"
                                                                                                color="red">
                                                                                                mdi-video
                                                                                            </v-icon>
                                                                                        </div>
                                                                                        <div v-if="e5 === 'cruisingAlarm'"
                                                                                            style="width:20px;height:20px; display: flex; align-items: center; justify-content: center;">
                                                                                            <v-icon size="12"
                                                                                                color="red">
                                                                                                mdi-alert
                                                                                            </v-icon>
                                                                                        </div>
                                                                                        <!-- <div v-if="n === 'space'" style="background-color: red;width:20px;height:20px"> -->
                                                                                        <div v-if="e5 === 'space'"
                                                                                            style="width:20px;height:20px">

                                                                                        </div>
                                                                                        <div class="container "
                                                                                            v-if="e5 !== 'space' && e5 !== 'online' && e5 !== 'offline' && e5 !== 'recording' && e5 !== 'recordingIdle' && e5 !== 'cruisingIdle' && e5 !== 'cruisingNoAlarm' && e5 !== 'cruisingAlarm'"
                                                                                            :class="indexE5 === 1 ? '' : ''">
                                                                                            <NuxtImg :src="e5" />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="treeTitle">&nbsp;{{
                                                                                        n5.name }}</div>
                                                                                    <div class="treeSubtitle">&nbsp;{{
                                                                                        n5.sub_name
                                                                                        }}</div>


                                                                                    <v-spacer />
                                                                                    <div v-for="(e5L, indexN5L) in getLastStatus(n5.overall_status)"
                                                                                        :key="indexN5L">
                                                                                        <div v-if="e5L === 'ptzCruising'"
                                                                                            class="right-red-alert">巡弋中
                                                                                        </div>
                                                                                        <div v-else-if="e5L === 'ptzIdle'"
                                                                                            class="right-grey-alert">閒置中
                                                                                        </div>
                                                                                        <div v-else-if="e5L === 'ptzSupport'"
                                                                                            class="right-red-alert">支援偵測
                                                                                        </div>
                                                                                        <div v-else-if="e5L === 'ptzSetting'"
                                                                                            class="right-blue-alert">設定中
                                                                                        </div>
                                                                                        <div v-else-if="e5L === 'aidiNoTriggered'"
                                                                                            class="right-grey-alert">未觸發
                                                                                        </div>
                                                                                        <div v-else-if="e5L === 'aidiTriggered'"
                                                                                            class="right-red-alert">已觸發
                                                                                        </div>
                                                                                        <div v-else-if="e5L === 'stopped'"
                                                                                            class="right-red-alert">停用
                                                                                        </div>
                                                                                        <div v-else-if="e5L === 'unknown'"
                                                                                            class="right-red-alert">未知
                                                                                        </div>

                                                                                        <!-- <div v-if="e5L === 'space'" style="background-color: red;width:20px;height:20px"> -->
                                                                                        <div v-if="e5L === 'space'"
                                                                                            style="width:20px;height:20px">
                                                                                        </div>
                                                                                    </div>

                                                                                    <v-menu
                                                                                        :close-on-content-click="false"
                                                                                        location="end">
                                                                                        <template
                                                                                            v-slot:activator="{ props }">
                                                                                            <v-icon size="15"
                                                                                                v-if="n5.id === 100"
                                                                                                v-bind="props">
                                                                                                mdi-information-outline
                                                                                            </v-icon>
                                                                                        </template>
                                                                                        <SideWindowsDetectorList>
                                                                                        </SideWindowsDetectorList>
                                                                                    </v-menu>



                                                                                </div>
                                                                            </div>
                                                                        </template>
                                                                    </draggable>
                                                                </div>
                                                            </template>
                                                        </draggable>




                                                    </div>
                                                </template>
                                            </draggable>



                                        </div>
                                    </template>
                                </draggable>
                            </li>
                        </template>
                    </draggable>
                </v-card-text>
            </v-card>



        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import draggable from 'vuedraggable'
const { $getIpaddress } = useNuxtApp()

// 拖動開始時的事件處理器
const onDragStart = (evt) => {
    evt.from.classList.add('dragging')
}

// 拖動結束時的事件處理器
const onDragEnd = (evt) => {
    evt.from.classList.remove('dragging')
}

// 檢查是否允許拖動
const checkIfDraggable = (evt) => {
    return evt.relatedContext.element.draggable !== false
}

// 新增子項目
const addChild = (index, group) => {
    const newItem = {
        id: Date.now(),
        name: `New Subitem ${Date.now()}`,
        draggable: true
    }
    if (group === 'group1') {
        if (!group1.value[index].children) {
            group1.value[index].children = []
        }
        group1.value[index].children.push(newItem)
    } else if (group === 'group2') {
        if (!group2.value[index].children) {
            group2.value[index].children = []
        }
        group2.value[index].children.push(newItem)
    }
}




//燈號判斷
const getStatus = (place, library, index) => {
    if (place === 2 && library === 5) {
        return `/images/sideWindowsIcon/${index}.svg`;
    } else if (place === 2 && library === 2) {
        switch (index) {
            case 1:
                return 'online';
            case 2:
                return 'offline';
            case 3:
                return 'unknow';
        }
    } else if (place === 2 && library === 4) {
        return index === 0 ? 'recordingIdle' : 'recording';
    } else if (place === 2 && library === 3) {
        switch (index) {
            case 0:
                return 'cruisingIdle';
            case 1:
                return 'cruisingNoAlarm';
            case 2:
                return 'cruisingAlarm';
        }
    } else if (place === 1) {
        return 'space';
    }
};

const getFirstStatus = (e) => {
    let result = [];
    for (let i = 0; i < e.place[0].length; i++) {
        let status = getStatus(e.place[0][i], e.library[0][i], e.index[0][i]);
        if (status) result.push(status);
    }
    // console.log("aass", result);
    return result;
};

const getLastStatus = (e) => {
    let result = [];
    for (let i = 0; i < e.place[1].length; i++) {
        if (e.place[1][i] === 2 && e.library[1][i] === 6) {
            switch (e.index[1][i]) {
                case 1.1:
                    result.push('ptzCruising');
                    break;
                case 1.2:
                    result.push('ptzIdle');
                    break;
                case 1.3:
                    result.push('ptzSupport');
                    break;
                case 1.4:
                    result.push('ptzSetting');
                    break;
                case 2.1:
                    result.push('aidiNoTriggered');
                    break;
                case 2.2:
                    result.push('aidiTriggered');
                    break;
                case 2.3:
                    result.push('stopped');
                    break;
                case 2.4:
                    result.push('unknown');
                    break;
            }
        } else {
            let status = getStatus(e.place[1][i], e.library[1][i], e.index[1][i]);
            if (status) result.push(status);
        }
    }
    // console.log("aass", result);
    return result;
};



//convert data
const transformedData = ref([]);
const addExpandedProperty = (item, existingItem = null) => {
    if (Array.isArray(item)) {
        return item.map((subItem, index) =>
            addExpandedProperty(subItem, existingItem && existingItem[index])
        );
    }

    if (typeof item === 'object' && item !== null) {
        const newItem = { ...item };

        if (newItem.children || newItem.content) {
            if (existingItem && existingItem.expanded === false) {
                newItem.expanded = false;
            } else {
                newItem.expanded = true;
            }
        }

        for (const key in newItem) {
            if (Array.isArray(newItem[key]) || (typeof newItem[key] === 'object' && newItem[key] !== null)) {
                newItem[key] = addExpandedProperty(newItem[key], existingItem && existingItem[key]);
            }
        }

        return newItem;
    }

    return item;
};

const updateTransformedData = () => {
    transformedData.value = addExpandedProperty(originalData.value, transformedData.value);
};



// websocket
let ws = null;
const originalData = ref([]);
const WS_URL = `ws://${$getIpaddress()}:8705`;
const activeTab = ref(1);
const setupWebSocket = () => {
    if (ws) ws.close();
    ws = new WebSocket(WS_URL);
    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (e) => {
        try {
            const data = JSON.parse(e.data);
            if (activeTab.value === 0) {
                originalData.value = data.overall_systemStatus[0].content;
            } else if (activeTab.value === 1) {
                originalData.value = data.overall_systemStatus[1].content;
            }

            updateTransformedData()
        } catch (error) {
            console.error("Error parsing WebSocket message:", error);
        }

    };
    ws.onclose = () => {
        console.log("WebSocket disconnected");
        setTimeout(setupWebSocket, 1000);
    };
};


watch(originalData, updateTransformedData, { deep: true });


onMounted(() => {
    setupWebSocket()

});


onUnmounted(() => {
    if (ws) {
        ws.close();
        ws = null;
    }

});

</script>

<style>
/* .lists-container {
    display: flex;
    gap: 20px;
} */

ul {
    list-style-type: none;
    padding-left: 0;
    border: 1px solid #ddd;
    /* min-width: 200px;
    min-height: 100px; */
    padding: 10px;
}

li {
    padding: 5px;
    margin: 5px 0;
    background-color: #f2f2f2;
    border: 1px solid #ccc;
    cursor: pointer;
}

button {
    margin-right: 10px;
}

.dragging li {
    opacity: 0.5;
}

.dragging {
    transition: opacity 0.3s;
}

.treeHeader {
    font-size: 14px;
    font-weight: bolder;
}

.treeTitle {
    font-size: 12px;
    font-weight: bolder;
}

.treeSubtitle {
    font-size: 9px;
    color: #9A9A9A;
}

/* 照片置中 */
.container {
    display: flex;
    justify-content: center;
    /* 水平置中 */
    align-items: center;
    /* 垂直置中 */
    width: 20px;
    height: 20px;
    padding: 1px
        /* 父容器高度可自行調整 */
}

.container img {
    max-width: 100%;
    height: auto;
}


/* 右側燈號樣式 */

.right-red-alert {
    color: #EF2730;
    font-weight: bolder;
    border: 1px solid #EF2730 !important;
    border-radius: 2px;
    width: 40px;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
}

.right-grey-alert {
    color: grey;
    font-weight: bolder;
    border: 1px solid grey !important;
    border-radius: 2px;
    width: 40px;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
}

.right-blue-alert {
    color: #36619D;
    font-weight: bolder;
    border: 1px solid #36619D !important;
    border-radius: 2px;
    width: 40px;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
}


/* tab */

.tab-header {
    display: flex;
    border-bottom: 1px solid #ccc;
    width: 100%;
}

/* .fixed {
    position: fixed;
    z-index: 9999;
} */

.tab-button {
    padding: 10px 20px;
    border: none;
    background-color: #f1f1f1;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%;
    justify-content: center;
}

.tab-button.active {
    background-color: #fff;
    border-bottom: 2px solid #007bff;
}



.tab-content {
    position: absolute;
    width: 100%;
    transition: transform 0.5s;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: transform 0.5s;
}

.slide-left-enter-from {
    transform: translateX(100%);
}

.slide-left-leave-to {
    transform: translateX(-100%);
}

.slide-right-enter-from {
    transform: translateX(-100%);
}

.slide-right-leave-to {
    transform: translateX(100%);
}
</style>