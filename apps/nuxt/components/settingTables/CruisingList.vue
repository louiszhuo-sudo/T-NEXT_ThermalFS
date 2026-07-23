<template>
    <div class="device-tree">
        <div v-if="props.userName.name === 'admin' || props.userName.name === 'user'">
            <v-container fluid>

                <v-row>
                    <v-col cols="12" class="d-flex justify-start bordered-section" style="white-space: nowrap;">


                        <div class="d-flex align-center pr-4">

                            <h4 class="my-auto pr-2">雲台</h4>
                            <div style="width: 300px;" class="my-auto">
                                <v-select density="compact" variant="outlined" :items="cursingPointItems"
                                    item-title="name" item-value="combination_id" hide-details
                                    v-model="cursingPointSelected" return-object label="" single-line></v-select>
                            </div>




                            <h4 class="my-auto px-2">巡弋路徑</h4>
                            <div style="width: 300px;" class="my-auto">
                                <v-select density="compact" variant="outlined" :items="cursingPointItems"
                                    item-title="cursingPoint_name" item-value="cursingPoint_id" hide-details
                                    label="巡弋路徑1" disabled single-line></v-select>
                            </div>
                        </div>
                    </v-col>

                    <v-col cols="12" class="d-flex justify-start bordered-section" style="white-space: nowrap;">


                        <v-data-table height="750px" width="100%" :headers="headers" :items="desserts"
                            hide-default-footer items-per-page="-1">


                            <template v-slot:item.cursingPoint_buildMethod="{ item }">
                                <div class="">{{ item.cursingPoint_buildMethod === 1 ? "單點" :
                                    item.cursingPoint_buildMethod ===
                                        2 ? "扇掃"
                                    : "" }}</div>
                            </template>




                            <template v-slot:item.cursingPoint_image_URL="{ item }">

                                <v-menu open-on-hover location="end">
                                    <template v-slot:activator="{ props }">
                                        <div class="d-flex justify-space-evenly" v-bind="props">
                                            <v-img width="100"
                                                :src="`http://${$getIpaddress()}:5002/api/alarmEvent/share/${encodeBackslash(item.cursingPoint_image_URL.ir)}`"
                                                class="ma-1" />
                                            <v-img width="100"
                                                :src="`http://${$getIpaddress()}:5002/api/alarmEvent/share/${encodeBackslash(item.cursingPoint_image_URL.vis)}`"
                                                class="ma-1" />

                                        </div>
                                    </template>
                                    <v-card class="d-flex justify-space-evenly">
                                        <v-img width="400"
                                            :src="`http://${$getIpaddress()}:5002/api/alarmEvent/share/${encodeBackslash(item.cursingPoint_image_URL.ir)}`"
                                            class="ma-1" />
                                        <v-img width="400"
                                            :src="`http://${$getIpaddress()}:5002/api/alarmEvent/share/${encodeBackslash(item.cursingPoint_image_URL.vis)}`"
                                            class="ma-1" />

                                    </v-card>
                                </v-menu>
                            </template>



                            <template v-slot:item.cursingPoint_ptzAngle="{ item }">

                                <div class="">{{ item.cursingPoint_ptzAngle[0] }},&nbsp;&nbsp;&nbsp;{{
                                    item.cursingPoint_ptzAngle[1] }}
                                </div>
                            </template>

                            <template v-slot:item.cursingPoint_gps="{ item }">
                                <div class="">{{ item.cursingPoint_gps[0] }},&nbsp;&nbsp;&nbsp;{{
                                    item.cursingPoint_gps[1] }}
                                </div>
                            </template>




                            <template v-slot:item.cursingPoint_active_status="{ item }">
                                <div class="">{{ item.cursingPoint_active_status === 0 ? "關閉" :
                                    item.cursingPoint_active_status
                                        ===
                                    1 ?
                                    "啟用" : "" }}</div>

                            </template>


                            <template v-slot:item.cursingPoint_autoTrigger_status="{ item }">
                                <div class="">{{ item.cursingPoint_autoTrigger_status === 0 ? "關閉" :
                                    item.cursingPoint_autoTrigger_status ===
                                        1 ?
                                    "啟用" : "" }}</div>

                            </template>





                            <template v-slot:item.actions="{ item }">
                                <v-icon class="me-2" size="small" @click="editItem(item)">
                                    mdi-pencil
                                </v-icon>
                                <v-icon size="small" @click="deleteItem(item)">
                                    mdi-delete
                                </v-icon>
                            </template>
                            <!-- <template v-slot:no-data>
                <v-btn color="primary" @click="initialize">
                    Reset
                </v-btn>
            </template> -->
                        </v-data-table>
                    </v-col>
                </v-row>






                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <!-- <v-btn class="mb-2" color="primary" dark v-bind="props">
                                New Item
                            </v-btn> -->
                    </template>
                    <v-card>
                        <v-card-title>
                            <!-- <span class="text-h5">{{ formTitle }}</span> -->
                        </v-card-title>

                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" md="4" sm="6">
                                        <v-text-field v-model="editedItem.cursingPoint_name"
                                            label="巡弋點名稱"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="4" sm="6">
                                        <v-text-field v-model="editedItem.cursingPoint_dwellTime"
                                            label="停留時間"></v-text-field>
                                    </v-col>

                                    <v-col cols="12" md="4" sm="6">
                                        <v-select v-model="tempIdForChangeOrder" :items="desserts"
                                            item-title="cursingPoint_id" item-value="cursingPoint_id"
                                            label="更換順序"></v-select>
                                    </v-col>
                                    <!-- <v-col cols="12" md="4" sm="6">
                                            <v-text-field v-model="editedItem.cursingPoint_name"
                                                label="Fat (g)"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="4" sm="6">
                                            <v-text-field v-model="editedItem.cursingPoint_image_URL"
                                                label="Carbs (g)"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="4" sm="6">
                                            <v-text-field v-model="editedItem.cursingPoint_ptzAngle"
                                                label="Protein (g)"></v-text-field>
                                        </v-col> -->
                                </v-row>
                            </v-container>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue-darken-1" variant="text" @click="close">
                                Cancel
                            </v-btn>
                            <v-btn color="blue-darken-1" variant="text" @click="save">
                                Save
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog v-model="dialogDelete" max-width="500px">
                    <v-card>
                        <v-card-title class="text-h5">確認刪除此預設點?</v-card-title>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
                            <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
                            <v-spacer></v-spacer>
                        </v-card-actions>
                    </v-card>
                </v-dialog>



            </v-container>
        </div>
        <div v-else>暫無權限訪問</div>
    </div>
    <v-dialog v-model="dialogExtra" max-width="1200px" class="overflow-visible">
        <v-card class="overflow-visible">
            <v-card-title>重疊區域預覽</v-card-title>
            <v-card-text class="overflow-visible">
                <v-slider
                  v-model="irOpacity"
                  min="0"
                  max="1"
                  step="0.01"
                  label="IR透明度"
                  style="max-width: 300px;"
                ></v-slider>
                <div style="position: relative; display: inline-block; overflow: visible;">
                    <canvas ref="canvasRef" style="border: 1px solid #ccc; cursor: crosshair;"></canvas>
                    <canvas ref="irCanvasRef" style="position: absolute; top: 0; left: 0; pointer-events: none; overflow: visible;"></canvas>
                    <!-- 拖拽手柄 -->
                    <div v-for="(corner, index) in irCorners" :key="index" 
                         :style="getCornerStyle(corner)"
                         class="corner-handle"
                         @mousedown="startResize(index, $event)">
                    </div>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="dialogExtra = false">關閉</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, reactive, onBeforeUnmount } from 'vue';
const { $getIpaddress } = useNuxtApp()
const props = defineProps(['userName'])
const cursingPointItems = ref([
    // { name: "單機監測/室外堆置區1", combination_id: 1, cursingPath_id: 1 },
    // { name: "單機監測/室外堆置區2", combination_id: 2, cursingPath_id: 1 },
    // { name: "單機監測/室外堆置區3", combination_id: 3, cursingPath_id: 1 },
    // { name: "單機監測/室外堆置區4", combination_id: 4, cursingPath_id: 1 }
]
)
const cursingPointSelected = ref({ name: "", combination_id: 1, cursingPath_id: 1 })
const state = reactive({
    ws3: {
        readyState: 0
    },
    wsListener3: {
        close: null,
        message: null
    }
})
const { $webSocketconnect03 } = useNuxtApp()
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
                                cursingPointSelected.value = { name: layout[i].tab_name, combination_id: layout[i].container_list[0].container_camera_id, cursingPath_id: 1 }
                                first = false
                            }
                            items.push({ name: layout[i].tab_name, combination_id: layout[i].container_list[0].container_camera_id, cursingPath_id: 1 })
                        }
                    }
                    cursingPointItems.value = items
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

const tempIdForChangeOrder = ref()



const dialog = ref(false);
const dialogDelete = ref(false);
const dialogExtra = ref(false);
const overlapNodes = ref([]);
const irImage_base64 = ref('');
const visImage_base64 = ref('');
const canvasRef = ref(null);
const irCanvasRef = ref(null);
const irCorners = ref([]);
const headers = ref([
    { title: '巡弋順序', align: 'center', sortable: true, key: 'cursingPoint_order' },
    { title: '建立方式', align: 'center', sortable: true, key: 'cursingPoint_buildMethod' },
    { title: '巡弋點名稱', align: 'center', sortable: true, key: 'cursingPoint_name' },
    { title: '預覽圖', align: 'center', sortable: true, key: 'cursingPoint_image_URL' },
    { title: '雲台角度', align: 'center', sortable: true, key: 'cursingPoint_ptzAngle' },

    { title: 'GPS', align: 'center', sortable: true, key: 'cursingPoint_gps' },
    { title: '啟用狀態', align: 'center', sortable: true, key: 'cursingPoint_active_status' },
    { title: '自動警報觸發', align: 'center', sortable: true, key: 'cursingPoint_autoTrigger_status' },
    { title: '停留時間', align: 'center', sortable: true, key: 'cursingPoint_dwellTime' },



    { title: 'Actions', key: 'actions', sortable: false },
]);
const desserts = ref([]);
const editedIndex = ref(-1);
const editedItem = ref({
    cursingPoint_id: 0,
    cursingPoint_order: 0,
    cursingPoint_number: 0,
    cursingPoint_name: 0,
    cursingPoint_buildMethod: 0,
    cursingPoint_image_URL: { ir: "", vis: "" },
    cursingPoint_ptzAngle: [0, 0],
    cursingPoint_gps: [0, 0],
    cursingPoint_location: 0,
    cursingPoint_height: 0,
    cursingPoint_dwellTime: 0,
    cursingPoint_fov: 0,
    cursingPoint_focus: 0,
    cursingPoint_active_status: 0,
    cursingPoint_autoTrigger_status: 0
});
const defaultItem = {
    cursingPoint_id: 0,
    cursingPoint_order: 0,
    cursingPoint_number: 0,
    cursingPoint_name: 0,
    cursingPoint_buildMethod: 0,
    cursingPoint_image_URL: { ir: "", vis: "" },
    cursingPoint_ptzAngle: [0, 0],
    cursingPoint_gps: [0, 0],
    cursingPoint_location: 0,
    cursingPoint_height: 0,
    cursingPoint_dwellTime: 0,
    cursingPoint_fov: 0,
    cursingPoint_focus: 0,
    cursingPoint_active_status: 0,
    cursingPoint_autoTrigger_status: 0
};

const formTitle = computed(() => (editedIndex.value === -1 ? 'New Item' : 'Edit Item'));

const ws5 = ref(null)



function changeOrder() {
    ws5.value.send(
        JSON.stringify(
            {
                feature: "cursing",
                method: "set_orderCursingPoints",
                content: {
                    combination_id: cursingPointSelected.value.combination_id,
                    cursingPath_id: cursingPointSelected.value.cursingPath_id,
                    cursingPoint_id_A_B: [editedItem.value.cursingPoint_id, tempIdForChangeOrder.value]
                },
                session: "sckji8452s"
            }
        )
    );
    console.log("dfsfsdf", [editedItem.value.cursingPoint_id, tempIdForChangeOrder.value]
    );
}


function changeTime() {
    ws5.value.send(
        JSON.stringify(
            {
                feature: "cursing",
                method: "set_dwelltimeCursingPoints",
                content: {
                    combination_id: cursingPointSelected.value.combination_id,
                    cursingPath_id: cursingPointSelected.value.cursingPath_id,
                    ...editedItem.value
                },
                session: "sckji8452s"
            }
        )
    );
    console.log("dfsfsdfsaaaasa", {
        combination_id: cursingPointSelected.value.combination_id,
        cursingPath_id: cursingPointSelected.value.cursingPath_id,
        ...editedItem.value
    }
    );
}




function changeName() {
    ws5.value.send(
        JSON.stringify(
            {
                feature: "cursing",
                method: "set_nameCursingPoint",
                content: {
                    combination_id: cursingPointSelected.value.combination_id,
                    cursingPath_id: cursingPointSelected.value.cursingPath_id,
                    ...editedItem.value
                },
                session: "sckji8452s"
            }
        )
    );
    console.log("dfsfsdfsaaaasa", {
        combination_id: cursingPointSelected.value.combination_id,
        cursingPath_id: cursingPointSelected.value.cursingPath_id,
        ...editedItem.value
    }
    );
}



function delete123() {
    ws5.value.send(
        JSON.stringify(
            {
                feature: "cursing",
                method: "set_deleteCursingPoint",
                content: {
                    combination_id: cursingPointSelected.value.combination_id,
                    cursingPath_id: cursingPointSelected.value.cursingPath_id,
                    ...editedItem.value
                },
                session: "sckji8452s"
            }
        )
    );
    console.log("dfswwwwwwsa", {
        combination_id: cursingPointSelected.value.combination_id,
        cursingPath_id: cursingPointSelected.value.cursingPath_id,
        ...editedItem.value
    }
    );
}



function getList() {
    ws5.value.send(
        JSON.stringify(
            {
                feature: "cursing",
                method: "query_cursingPoint",
                content: {
                    combination_id: cursingPointSelected.value.combination_id,
                    cursingPath_id: cursingPointSelected.value.cursingPath_id
                },
                session: "sckji8452s"
            }
        )
    );
}





function encodeBackslash(input) {
    return input.replace(/\\/g, '%5C%5C');
}




function ws8703() {
    ws5.value = new WebSocket(`ws://${$getIpaddress()}:8703`);
    ws5.value.onopen = () => {
        console.log("websocket 8703 命令/查詢通道 已連線!!!!!");
        getList();

        ws5.value.onmessage = (params1) => {
            var params = {
                data: JSON.parse(params1.data),
            };
            console.log("dsfdssdfssdf", params.data);
            
            if (params.data.feature === "cursing" && params.data.method === "query_cursingPoint") {
                desserts.value = params.data.content;
            }
            
            if (params.data.feature === "cursing" && params.data.method === "query_cursingPointOverlap") {
                overlapNodes.value = params.data.content.cursingPoint_overlapNodes;
                irImage_base64.value = params.data.content.irImage_base64;
                visImage_base64.value = params.data.content.visImage_base64;
                
                // 在下一幀渲染圖像到畫布
                nextTick(() => {
                    renderImageToCanvas();
                    // 初始化 IR 圖像位置和尺寸
                    initializeIRImage();
                });
            }
        };
    }
}








const initialize = () => {
    desserts.value = [
        // {
        //     cursingPoint_id: 0,
        //     cursingPoint_order: 0,
        //     cursingPoint_number: 0,
        //     cursingPoint_name: 0,
        //     cursingPoint_buildMethod: 0,
        //     cursingPoint_image_URL: { ir: "", vis: "" },
        //     cursingPoint_ptzAngle: [0, 0],
        //     cursingPoint_gps: [0, 0],
        //     cursingPoint_location: 0,
        //     cursingPoint_height: 0,
        //     cursingPoint_dwellTime: 0,
        //     cursingPoint_fov: 0,
        //     cursingPoint_focus: 0,
        //     cursingPoint_active_status: 0,
        //     cursingPoint_autoTrigger_status: 0
        // }
    ];
};

const editItem = (item) => {
    editedIndex.value = desserts.value.indexOf(item);
    editedItem.value = { ...item };
    tempIdForChangeOrder.value = editedItem.value.cursingPoint_id
    dialog.value = true;
};

const deleteItem = (item) => {
    editedIndex.value = desserts.value.indexOf(item);
    editedItem.value = { ...item };
    dialogDelete.value = true;
};

const deleteItemConfirm = () => {
    desserts.value.splice(editedIndex.value, 1);
    delete123()
    closeDelete();
};

const close = () => {
    dialog.value = false;
    nextTick(() => {
        editedItem.value = { ...defaultItem };
        editedIndex.value = -1;
    });
};

const closeDelete = () => {
    dialogDelete.value = false;
    nextTick(() => {
        editedItem.value = { ...defaultItem };
        editedIndex.value = -1;
    });
};

const save = () => {
    if (editedIndex.value > -1) {


        Object.assign(desserts.value[editedIndex.value], editedItem.value);
        changeName()
        changeTime()
        changeOrder()
    } else {
        desserts.value.push(editedItem.value);
    }
    close();
};




onMounted(() => {
    initialize();
    initWs3()
    ws8703()
    window.addEventListener('keydown', handleKeyDown)
});

// 監聽畫布引用變化，添加事件監聽器
watch(canvasRef, (newCanvas) => {
    if (newCanvas) {
        newCanvas.addEventListener('mousedown', startDrag);
    }
}, { immediate: true });

// 監聽對話框狀態變化
watch(dialogExtra, (isOpen) => {
    if (isOpen) {
        // 對話框打開時，確保畫布準備好
        nextTick(() => {
            if (canvasRef.value && irImage_base64.value) {
                renderImageToCanvas();
                initializeIRImage();
            }
        });
    }
});

// 監聽 cursingPointSelected 變化，當選擇的雲台變動時刷新 desserts 數據
watch(cursingPointSelected, (newValue, oldValue) => {
    // 確保 WebSocket 已連接且有有效的選擇
    if (ws5.value && ws5.value.readyState === 1 && newValue.combination_id) {
        getList();
    }
}, { deep: true });

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
    window.removeEventListener('keydown', handleKeyDown)
    
    // 移除畫布事件
    if (canvasRef.value) {
        canvasRef.value.removeEventListener('mousedown', startDrag);
    }
})

function handleKeyDown(e) {
    if (dialog.value && (e.key === 'o' || e.key === 'O')) {
        dialogExtra.value = true;
        // 發送 WebSocket 請求
        ws5.value.send(
            JSON.stringify({
                "feature": "cursing",
                "method": "query_cursingPointOverlap",
                "content": {
                    "combination_id": cursingPointSelected.value.combination_id,
                    "cursingPoint_id": editedItem.value.cursingPoint_id
                },
                "session": "sckji8452s"
            })
        );
    }
}

function initializeIRImage() {
    if (!irImage_base64.value || !overlapNodes.value || overlapNodes.value.length === 0) return;
    
    const irImg = new window.Image();
    irImg.onload = () => {
        if (canvasRef.value) {
            // 從 overlapNodes 獲取座標 [左上x, 左上y, 右下x, 右下y]
            const [x0, y0, x1, y1] = overlapNodes.value;
            
            // 計算相對於畫布的實際像素位置
            const mainCanvasWidth = canvasRef.value.width;
            const mainCanvasHeight = canvasRef.value.height;
            
            const actualX0 = x0 * mainCanvasWidth;
            const actualY0 = y0 * mainCanvasHeight;
            const actualX1 = x1 * mainCanvasWidth;
            const actualY1 = y1 * mainCanvasHeight;
            
            // 設置 IR 圖像位置為左上角座標
            irPosition.value.x = actualX0;
            irPosition.value.y = actualY0;
            
            // 計算需要的縮放比例
            const targetWidth = actualX1 - actualX0;
            const targetHeight = actualY1 - actualY0;
            
            irScale.value.x = targetWidth / irImg.width;
            irScale.value.y = targetHeight / irImg.height;
            irRotation.value = 0;
            
            renderIRImage();
            updateCornerHandles();
            
            // 初始化後輸出位置比例（僅 console）
            calculateAndLogRatioOnly();
        }
    };
    irImg.src = `data:image/jpeg;base64,${irImage_base64.value}`;
}

// 新增渲染圖像到畫布的函數
const irOpacity = ref(0.5); // IR 疊加透明度
const irPosition = ref({ x: 0, y: 0 }); // IR 圖像位置
const irScale = ref({ x: 1, y: 1 }); // IR 圖像縮放
const irRotation = ref(0); // IR 圖像旋轉
const isDragging = ref(false);
const isResizing = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const resizeStart = ref({ x: 0, y: 0 });
const resizeCorner = ref(null);

function renderImageToCanvas() {
    if (!canvasRef.value || !visImage_base64.value || !irImage_base64.value) return;

    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    const visImg = new window.Image();
    const irImg = new window.Image();

    visImg.onload = () => {
        canvas.width = visImg.width;
        canvas.height = visImg.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
        ctx.drawImage(visImg, 0, 0);
        
        // 渲染 IR 圖像到第二個畫布
        renderIRImage();
        
        // 更新角落手柄位置
        updateCornerHandles();
    };
    visImg.src = `data:image/jpeg;base64,${visImage_base64.value}`;
}

function renderIRImage() {
    if (!irCanvasRef.value || !irImage_base64.value) return;
    
    const canvas = irCanvasRef.value;
    const ctx = canvas.getContext('2d');
    const irImg = new window.Image();
    
    irImg.onload = () => {
        // 計算 IR 圖像的實際尺寸
        const irWidth = irImg.width * irScale.value.x;
        const irHeight = irImg.height * irScale.value.y;
        
        // 計算需要的畫布尺寸，包含可能超出主畫布的部分
        const mainCanvasWidth = canvasRef.value.width;
        const mainCanvasHeight = canvasRef.value.height;
        
        // 計算 IR 圖像的邊界
        const irLeft = irPosition.value.x;
        const irTop = irPosition.value.y;
        const irRight = irPosition.value.x + irWidth;
        const irBottom = irPosition.value.y + irHeight;
        
        // 計算需要的畫布尺寸
        const canvasLeft = Math.min(0, irLeft);
        const canvasTop = Math.min(0, irTop);
        const canvasRight = Math.max(mainCanvasWidth, irRight);
        const canvasBottom = Math.max(mainCanvasHeight, irBottom);
        
        const canvasWidth = canvasRight - canvasLeft;
        const canvasHeight = canvasBottom - canvasTop;
        
        // 設置 IR 畫布尺寸
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // 調整 IR 畫布的位置，使其與主畫布對齊
        canvas.style.left = `${canvasLeft}px`;
        canvas.style.top = `${canvasTop}px`;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 設置變換
        ctx.save();
        ctx.globalAlpha = irOpacity.value;
        
        // 調整繪製位置，考慮畫布偏移
        const drawX = irPosition.value.x - canvasLeft;
        const drawY = irPosition.value.y - canvasTop;
        
        // 繪製 IR 圖像
        ctx.drawImage(irImg, 
                     drawX, 
                     drawY,
                     irWidth, 
                     irHeight);
        ctx.restore();
    };
    irImg.src = `data:image/jpeg;base64,${irImage_base64.value}`;
}

function updateCornerHandles() {
    if (!canvasRef.value || !irImage_base64.value) return;
    
    const irImg = new window.Image();
    irImg.onload = () => {
        const irWidth = irImg.width * irScale.value.x;
        const irHeight = irImg.height * irScale.value.y;
        
        // 計算 IR 畫布的偏移量
        const mainCanvasWidth = canvasRef.value.width;
        const mainCanvasHeight = canvasRef.value.height;
        
        const irLeft = irPosition.value.x;
        const irTop = irPosition.value.y;
        const irRight = irPosition.value.x + irWidth;
        const irBottom = irPosition.value.y + irHeight;
        
        const canvasLeft = Math.min(0, irLeft);
        const canvasTop = Math.min(0, irTop);
        
        const corners = [
            { x: irPosition.value.x, y: irPosition.value.y }, // 左上
            { x: irPosition.value.x + irWidth, y: irPosition.value.y }, // 右上
            { x: irPosition.value.x, y: irPosition.value.y + irHeight }, // 左下
            { x: irPosition.value.x + irWidth, y: irPosition.value.y + irHeight } // 右下
        ];
        
        irCorners.value = corners;
    };
    irImg.src = `data:image/jpeg;base64,${irImage_base64.value}`;
}

function getCornerStyle(corner) {
    const size = 10;
    return {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        border: '2px solid #007bff',
        borderRadius: '50%',
        cursor: 'pointer',
        top: `${corner.y - size/2}px`,
        left: `${corner.x - size/2}px`,
        zIndex: 1000
    };
}

function startResize(index, event) {
    event.preventDefault();
    isResizing.value = true;
    resizeCorner.value = index;
    resizeStart.value = { x: event.clientX, y: event.clientY };
    
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
}

function handleResize(event) {
    if (!isResizing.value) return;
    
    const deltaX = event.clientX - resizeStart.value.x;
    const deltaY = event.clientY - resizeStart.value.y;
    
    // 獲取 IR 圖像的實際尺寸
    const irImg = new window.Image();
    irImg.onload = () => {
        const irWidth = irImg.width * irScale.value.x;
        const irHeight = irImg.height * irScale.value.y;
        
        // 根據拖拽的角落調整位置和縮放
        if (resizeCorner.value === 0) { // 左上角
            irPosition.value.x += deltaX;
            irPosition.value.y += deltaY;
            irScale.value.x -= deltaX / irImg.width;
            irScale.value.y -= deltaY / irImg.height;
        } else if (resizeCorner.value === 1) { // 右上角
            irPosition.value.y += deltaY;
            irScale.value.x += deltaX / irImg.width;
            irScale.value.y -= deltaY / irImg.height;
        } else if (resizeCorner.value === 2) { // 左下角
            irPosition.value.x += deltaX;
            irScale.value.x -= deltaX / irImg.width;
            irScale.value.y += deltaY / irImg.height;
        } else if (resizeCorner.value === 3) { // 右下角
            irScale.value.x += deltaX / irImg.width;
            irScale.value.y += deltaY / irImg.height;
        }
        
        // 限制縮放範圍
        irScale.value.x = Math.max(0.1, Math.min(3, irScale.value.x));
        irScale.value.y = Math.max(0.1, Math.min(3, irScale.value.y));
        
        resizeStart.value = { x: event.clientX, y: event.clientY };
        renderIRImage();
        updateCornerHandles();
    };
    irImg.src = `data:image/jpeg;base64,${irImage_base64.value}`;
}

function stopResize() {
    isResizing.value = false;
    resizeCorner.value = null;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
    
    // 縮放結束後輸出位置比例
    calculateAndLogRatio();
}

// 添加拖拽功能
function startDrag(event) {
    // 檢查是否點擊在 IR 圖像區域內
    const rect = canvasRef.value.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 獲取 IR 圖像的實際尺寸
    const irImg = new window.Image();
    irImg.onload = () => {
        const irWidth = irImg.width * irScale.value.x;
        const irHeight = irImg.height * irScale.value.y;
        
        // 檢查是否在 IR 圖像範圍內
        if (x >= irPosition.value.x && 
            x <= irPosition.value.x + irWidth &&
            y >= irPosition.value.y && 
            y <= irPosition.value.y + irHeight) {
            
            isDragging.value = true;
            dragStart.value = { 
                x: event.clientX - irPosition.value.x, 
                y: event.clientY - irPosition.value.y 
            };
            
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', stopDrag);
        }
    };
    irImg.src = `data:image/jpeg;base64,${irImage_base64.value}`;
}

function handleDrag(event) {
    if (!isDragging.value) return;
    
    irPosition.value.x = event.clientX - dragStart.value.x;
    irPosition.value.y = event.clientY - dragStart.value.y;
    
    renderIRImage();
    updateCornerHandles();
}

function stopDrag() {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
    
    // 拖拽結束後輸出位置比例
    calculateAndLogRatio();
}

// 監聽透明度變化
watch(irOpacity, () => {
    renderIRImage();
});

// 監聽位置和縮放變化
watch([irPosition, irScale, irRotation], () => {
    renderIRImage();
    updateCornerHandles();
    // 計算並輸出位置比例（但不發送 WebSocket）
    calculateAndLogRatioOnly();
}, { deep: true });

// 計算並輸出位置比例（僅 console 輸出，不發送 WebSocket）
function calculateAndLogRatioOnly() {
    if (!canvasRef.value || !irImage_base64.value) return;
    
    const irImg = new window.Image();
    irImg.onload = () => {
        const irWidth = irImg.width * irScale.value.x;
        const irHeight = irImg.height * irScale.value.y;
        
        // 計算 IR 圖像的邊界
        const x0 = irPosition.value.x;
        const y0 = irPosition.value.y;
        const x1 = irPosition.value.x + irWidth;
        const y1 = irPosition.value.y + irHeight;
        
        // 計算相對於主畫布的比例
        const mainCanvasWidth = canvasRef.value.width;
        const mainCanvasHeight = canvasRef.value.height;
        
        const ratioX0 = x0 / mainCanvasWidth;
        const ratioY0 = y0 / mainCanvasHeight;
        const ratioX1 = x1 / mainCanvasWidth;
        const ratioY1 = y1 / mainCanvasHeight;
        
        // 創建新的重疊節點數據
        const cursingPoint_overlapNodes = [ratioX0, ratioY0, ratioX1, ratioY1];
        
        // 輸出到 console
        console.log({
            cursingPoint_overlapNodes: cursingPoint_overlapNodes
        });
    };
    irImg.src = `data:image/jpeg;base64,${irImage_base64.value}`;
}

// 計算並輸出位置比例
function calculateAndLogRatio() {
    if (!canvasRef.value || !irImage_base64.value) return;
    
    const irImg = new window.Image();
    irImg.onload = () => {
        const irWidth = irImg.width * irScale.value.x;
        const irHeight = irImg.height * irScale.value.y;
        
        // 計算 IR 圖像的邊界
        const x0 = irPosition.value.x;
        const y0 = irPosition.value.y;
        const x1 = irPosition.value.x + irWidth;
        const y1 = irPosition.value.y + irHeight;
        
        // 計算相對於主畫布的比例
        const mainCanvasWidth = canvasRef.value.width;
        const mainCanvasHeight = canvasRef.value.height;
        
        const ratioX0 = x0 / mainCanvasWidth;
        const ratioY0 = y0 / mainCanvasHeight;
        const ratioX1 = x1 / mainCanvasWidth;
        const ratioY1 = y1 / mainCanvasHeight;
        
        // 創建新的重疊節點數據
        const cursingPoint_overlapNodes = [ratioX0, ratioY0, ratioX1, ratioY1];
        
        // 輸出到 console
        console.log({
            cursingPoint_overlapNodes: cursingPoint_overlapNodes
        });
        
        // 通過 WebSocket 發送更新後的重疊節點數據
        if (ws5.value && ws5.value.readyState === 1) {
            const wsMessage = {
                "feature": "cursing",
                "method": "set_cursingPointOverlap",
                "content": {
                    "combination_id": cursingPointSelected.value.combination_id,
                    "cursingPoint_id": editedItem.value.cursingPoint_id,
                    "cursingPoint_overlapNodes": cursingPoint_overlapNodes
                },
                "session": "sckji8452s"
            };
            
            console.log("發送 WebSocket 消息:", wsMessage);
            
            ws5.value.send(JSON.stringify(wsMessage));
        }
    };
    irImg.src = `data:image/jpeg;base64,${irImage_base64.value}`;
}
</script>
<style>
.bordered-section {
    outline: 1px solid #B8B8B8;
    position: relative;
    background: #fff;
}

.corner-handle {
    transition: all 0.2s ease;
}

.corner-handle:hover {
    background-color: rgba(255, 255, 255, 1) !important;
    border-color: #0056b3 !important;
    transform: scale(1.2);
}

/* 確保對話框內容可以顯示超出的部分 */
.v-dialog .v-card-text {
    overflow: visible !important;
}

/* 確保 IR 畫布可以正確定位 */
canvas[ref="irCanvasRef"] {
    pointer-events: none;
    overflow: visible;
}
</style>