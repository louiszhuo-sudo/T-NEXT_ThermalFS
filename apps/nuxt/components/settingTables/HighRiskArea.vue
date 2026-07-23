<template>
    <v-container fluid>
        <v-row>



            <div v-if="isLoading" style="z-index: 10" class="overlay"></div>
            <div v-if="isLoading" class="text-center"
                style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 100">
                <v-progress-circular :size="70" :width="7" color="" indeterminate></v-progress-circular>
            </div>

            <!-- 加載超時錯誤提示 -->
            <div v-if="loadingError" style="z-index: 10" class="overlay"></div>
            <div v-if="loadingError" class="text-center"
                style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 100; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <div class="mb-4">載入超時，請稍後再試</div>
                <v-btn color="primary" @click="handleErrorReturn">返回</v-btn>
            </div>


            <!-- {{ cruisingItems }} -->
            <v-col cols="12" class="d-flex justify-start bordered-section" style="white-space: nowrap">
                <!-- 調試信息 -->
                <!-- <div class="d-flex align-center pr-4">
                    <small class="text-grey">Debug: camItems count: {{ camItems.length }}, camera_id: {{ camera_id }}</small>
                </div> -->
                
                <div class="d-flex align-center pr-4">
                    <h4 class="pr-4">相機名稱</h4>
                    <v-select width="200px" density="compact" variant="outlined" :items="camItems" item-title="tab_name"
                        item-value="tab_sort" hide-details v-model="camera_id" label="" single-line>
                    </v-select>
                </div>

                <div class="d-flex align-center pr-4">
                    <h4 class="pr-4">巡弋點名稱</h4>
                    <v-select width="150px" density="compact" variant="outlined" :items="cruisingItems"
                        item-title="cursingPoint_name" item-value="cursingPoint_id" hide-details
                        v-model="cursingPoint_id" label="" single-line>
                    </v-select>
                </div>

                <div class="d-flex align-center pr-4">
                    <h4 class="pr-4">選擇日期</h4>
                    <v-text-field @click="datePlugin" v-model="dateRangeSelected" density="compact" variant="outlined"
                        hide-details type="text" id="datetimerange-input123" size="40"
                        class="v-field__input"></v-text-field>
                </div>

                <v-btn color="grey" @click="handleConfirm">
                        確定
                    </v-btn>
                <!-- 
                <v-btn @click="clearChart">清除</v-btn>
                <v-btn @click="showNewData">新Data</v-btn> -->
            </v-col>

            <v-col cols="4" class="bordered-section pa-3">

                <img :src="image_base64.ir" width="450" class="h-auto pointer-events-none" ref="bgImage"
                    @dragstart.prevent />

                <img :src="image_base64.vis" width="450" class="h-auto pointer-events-none" ref="bgImage"
                    @dragstart.prevent />
            </v-col>

            <v-col cols="8" class="bordered-section">


                <v-data-table height="750px" width="100%" :headers="headers" :items="desserts" hide-default-footer
                    items-per-page="-1">

                </v-data-table>
            </v-col>


        </v-row>
    </v-container>
</template>

<script setup>
useHead({
    // title: '',
    meta: [
        { charset: 'UTF-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' }
    ],
    link: [
        {
            rel: 'stylesheet',
            type: 'text/css',
            href: '/css/vanilla-datetimerange-picker-dark.css'
        }
    ],
    script: [
        {
            src: '/js/moment.min.js',
            type: 'text/javascript'
        },
        {
            src: '/js/vanilla-datetimerange-picker.js',
            type: 'text/javascript'
        }
    ],
    style: [
        { children: 'body { color: white; background-color: #fff; }' }
    ]
})
const { $getIpaddress } = useNuxtApp()
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue';
const datePickerInstance = ref(null);

const camItems = ref([]);
const camera_id = ref(null);
const cruisingItems = ref([]);
const cursingPoint_id = ref(null);
// const dateRangeItems = ref([{ name: '2024-08-30' }]);
const dateRangeSelected = ref("");
const current_selected_time = ref([]);
const desserts = ref([]);

const isLoading = ref(false);
const loadingError = ref(false);

const headers = ref([
    { title: '主群組', align: 'center', sortable: false, key: 'roi_mainGroup_name' },
    { title: '副群組', align: 'center', sortable: true, key: 'roi_subGroup_name' },
    { title: 'ROI編號', align: 'center', sortable: true, key: 'roi_number' },
    { title: 'ROI名稱', align: 'center', sortable: true, key: 'roi_name' },
    { title: '超溫發生次數', align: 'center', sortable: true, key: 'alarm_count' },
    { title: '超溫發生占比(%)', align: 'center', sortable: true, key: 'alarm_percentage' },

    // { title: 'Actions', key: 'actions', sortable: false },
]);

const image_base64 = ref({ ir: "", vis: "" })

const ws3 = ref(null);
const ws4 = ref(null);

const convertISOToCustomFormat = (isoString) => {
    const date = new Date(isoString);

    // 提取年、月、日、小时、分钟和秒
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要加1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // 格式化为 'YYYY-MM-DD HH:MM:SS'
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}



const camIdList = () => {
    console.log("Requesting camera list...");
    
    if (ws3.value && ws3.value.readyState === WebSocket.OPEN) {
        const requestData = {
            "feature": "layout",
            "method": "query_overallTabContainer",
            "content": {},
            "session": "sckji8452s"
        };
        
        console.log("Sending camera list request:", requestData);
        ws3.value.send(JSON.stringify(requestData));
    } else {
        console.error("WebSocket3 is not connected, cannot get camera list");
    }
}


const handleErrorReturn = () => {
    loadingError.value = false;
};

// Date Range Picker 初始化函數
const datePlugin = () => {
    // 先清理已存在的實例
    if (datePickerInstance.value) {
        datePickerInstance.value.destroy();
    }

    // 確保 DOM 完全加載
    nextTick(() => {
        setTimeout(() => {
            datePickerInstance.value = new DateRangePicker('datetimerange-input123', {
                timePicker: true,
                alwaysShowCalendars: true,
                timePickerSeconds: true,
                locale: {
                    applyLabel: '確定',
                    cancelLabel: '取消',
                    format: "YYYY-MM-DD HH:mm:ss",
                    daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
                    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
                        '七月', '八月', '九月', '十月', '十一月', '十二月'
                    ],
                },
                autoUpdateInput: false
            }, function (start, end) {

                console.log("", convertISOToCustomFormat(start.format()));
                console.log("", convertISOToCustomFormat(end.format()));

                dateRangeSelected.value = convertISOToCustomFormat(start.format()).toString() + " " + "-" + " " + convertISOToCustomFormat(end.format()).toString()

                // console.log("dfgdggfdfdgdg", convertISOToCustomFormat(start.format()), convertISOToCustomFormat(end.format()))
                // getHistoryCruising(convertISOToCustomFormat(start.format()), convertISOToCustomFormat(end.format()))

                // alert(start.format() + " - " + end.format());



            });
        }, 100); // 給予一個小延遲確保 DOM 已經準備好
    });
}




const handleConfirm = async () => {
    if (!camera_id.value || !cursingPoint_id.value || !dateRangeSelected.value) {
        // 如果沒有選擇相機、巡弋點或日期範圍，則顯示警告
        alert('請選擇相機、巡弋點和日期範圍');
        return;
    }
    
    isLoading.value = true;
    loadingError.value = false;
    
    try {
        // 從日期範圍字符串中提取開始和結束時間
        const [startStr, endStr] = dateRangeSelected.value.split(' - ');
        
        // 設置超時處理
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 30000); // 30秒超時
        });
        
        // 使用 Promise.race 來處理可能的超時
        await Promise.race([
            new Promise(resolve => {
                // 設置一個臨時的消息處理器來等待數據返回
                const originalOnMessage = ws4.value.onmessage;
                ws4.value.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.feature === "history_dataframe" && data.method === "query_historyLogin") {
                        // 恢復原始的消息處理器
                        ws4.value.onmessage = originalOnMessage;
                        // 處理數據
                        desserts.value = data.content.table_content;
                        image_base64.value.ir = `data:image/jpg;base64,${data.content.image_base64.ir}`;
                        image_base64.value.vis = `data:image/jpg;base64,${data.content.image_base64.vis}`;
                        resolve();
                    } else {
                        // 對於其他消息，使用原始處理器
                        originalOnMessage(event);
                    }
                };
                
                // 發送請求
                getHistoryCruising(startStr, endStr);
            }),
            timeoutPromise
        ]);
    } catch (error) {
        console.error("Error fetching data:", error);
        loadingError.value = true;
    } finally {
        isLoading.value = false;
    }
};


//! step 1
const getCruisingList = () => {
    console.log("Getting cruising list for camera_id:", camera_id.value);
    
    if (!camera_id.value) {
        console.warn("No camera_id selected, skipping cruising list request");
        return;
    }

    if (ws3.value && ws3.value.readyState === WebSocket.OPEN) {
        const requestData = {
            "feature": "cursing",
            "method": "query_cursingPoint",
            "content": {
                "combination_id": camera_id.value,
                "cursingPath_id": camera_id.value,
            },
            "session": "sckji8452s"
        };
        
        console.log("Sending cruising list request:", requestData);
        ws3.value.send(JSON.stringify(requestData));
    } else {
        console.error("WebSocket3 is not connected, cannot get cruising list");
    }
}






const getWebSocket4 = () => {
    ws4.value = new WebSocket(`ws://${$getIpaddress()}:8704`);

    ws4.value.onopen = () => {
        console.log("WebSocket4 connected");
    };

    ws4.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("WebSocket4 message:", data);

        if (data.feature === "history_dataframe" && data.method === "query_historyLogin") {
            console.log("query_highRiskArea", data.content);
            desserts.value = data.content.table_content;
            image_base64.value.ir = `data:image/jpg;base64,${data.content.image_base64.ir}`;
            image_base64.value.vis = `data:image/jpg;base64,${data.content.image_base64.vis}`;
            isLoading.value = false; // 數據加載完成後關閉加載狀態
        }
    };

    ws4.value.onerror = (error) => {
        console.error("WebSocket4 error:", error);
    };

    ws4.value.onclose = () => {
        console.log("WebSocket4 disconnected");
        // 使用正確的函數名進行重連
        setTimeout(getWebSocket4, 5000);
    };
}



const getWebSocket3 = () => {
    ws3.value = new WebSocket(`ws://${$getIpaddress()}:8703`);

    ws3.value.onopen = () => {
        console.log("WebSocket3 connected");
        // 確保在連接建立後立即獲取相機列表
        camIdList();
    };

    ws3.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("WebSocket3 message:", data);

        if (data.feature === "cursing" && data.method === "query_cursingPoint") {
            cruisingItems.value = data.content;
        }

        if (data.feature === "layout" && data.method === "query_overallTabContainer") {
            const originalArray = data.content;
            // Filter out items that don't contain "單機" in their tab_name
            camItems.value = originalArray.filter(item => item.tab_name.includes("單機"));
            console.log("Camera items loaded:", camItems.value);
            
            // 如果還沒有選擇相機，自動選擇第一個
            if (camItems.value.length > 0 && !camera_id.value) {
                camera_id.value = camItems.value[0].tab_sort;
            }
        }
    };

    ws3.value.onerror = (error) => {
        console.error("WebSocket3 error:", error);
    };

    ws3.value.onclose = () => {
        console.log("WebSocket3 disconnected");
        // 使用正確的函數名進行重連
        setTimeout(getWebSocket3, 5000);
    };
}





function requestInitialData() {

    if (ws5.value && ws5.value.readyState === WebSocket.OPEN) {
        ws5.value.send(JSON.stringify({
            "feature": "request_initial_data",
            "session": "sckji8452s"
        }));
    }
}

//! step 2
const getHistoryCruising = (e, e2) => {

    if (ws4.value && ws4.value.readyState === WebSocket.OPEN) {


        console.log("qwqeqweweqwdsfd", {
            "feature": "history_analysis",
            "method": "query_highRiskArea",
            "content": {
                "camera_id": camera_id.value,
                "cursingPoint_id": cursingPoint_id.value,
                "selected_start_time": e,
                "selected_end_time": e2
            },
            "session": "sckji8452s",
        });

        ws4.value.send(JSON.stringify({
            "feature": "history_analysis",
            "method": "query_highRiskArea",
            "content": {
                "camera_id": camera_id.value,
                "cursingPoint_id": cursingPoint_id.value,
                "selected_start_time": e,
                "selected_end_time": e2
            },
            "session": "sckji8452s",
        }));
    }

}





onMounted(() => {
    // 初始化空數據
    desserts.value = [];
    image_base64.value = { ir: "", vis: "" };
    
    // 建立 WebSocket 連接
    getWebSocket3();
    getWebSocket4();
    
    // 初始化日期選擇器
    datePlugin();
});



onUnmounted(() => {


});

// 監聽相機ID變化
watch(camera_id, (newVal) => {
    console.log("Camera ID changed to:", newVal);
    if (newVal) {
        // 當相機ID變化時，重新獲取巡弋點列表
        getCruisingList();
        // 清空巡弋點選擇
        cursingPoint_id.value = null;
    }
});

// 監聽巡弋點列表變化
watch(cruisingItems, (newItems) => {
    console.log("Cruising items updated:", newItems);
    // 當 cruisingItems 更新後，設置第一個巡弋點為預設值
    if (newItems && newItems.length > 0) {
        cursingPoint_id.value = newItems[0].cursingPoint_id;
    }
});

// 監聽 camItems 變化，用於調試
watch(camItems, (newItems) => {
    console.log("Camera items updated:", newItems);
});
</script>
<style scoped>
.bordered-section {
    outline: 1px solid #B8B8B8;
    position: relative;
    background: #fff;
}

.relative {
    position: relative;
}

.absolute {
    position: absolute;
}

.select-none {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

img {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
}
</style>
<style>
/* 確保日期時間選擇器的下拉選單永遠在最上層 */
.daterangepicker {
    z-index: 99999 !important;
    /* 使用很大的值確保在最上層 */
}

/* 時間選擇器的下拉部分 */
.calendar-time {
    z-index: 99999 !important;
}

/* 確保時間選擇器的下拉選單也在最上層 */
.daterangepicker .calendar-time select {
    z-index: 100000 !important;
}
</style>