<template>
    <div class="device-tree">

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

        <div v-if="props.userName.name === 'admin'">
            <v-container fluid>
                <v-row>
                    <v-col cols="12" class="d-flex justify-start bordered-section" style="white-space: nowrap;">
                        <div class="d-flex align-center pr-4">
                            <div class="d-flex align-center pr-4">
                                <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" density="compact"
                                    variant="outlined" single-line hide-details type="text" class="my-auto"
                                    label="搜尋 使用者身分、使用者名稱" size="40" @input="handleSearch"></v-text-field>
                            </div>

                            <div class="d-flex align-center pr-4">
                                <h4 class="pr-4">顯示蒐集時間範圍</h4>
                                <v-text-field @click="datePlugin" v-model="dateRangeSelected" density="compact" variant="outlined"
                                    hide-details type="text" id="datetimerange-input1234" class="v-field__input"
                                    size="40"></v-text-field>
                            </div>

                            <v-btn color="grey" @click="handleConfirm">
                        確定
                    </v-btn>
                        </div>
                    </v-col>

                    <v-col cols="12" class="d-flex justify-start bordered-section" style="white-space: nowrap;">
                        <v-card flat width="100%">
                            <v-card-text class="pa-0">
                                <v-data-table :headers="headers" :items="filteredItems" :search="searchQuery"
                                    fixed-header>
                                    <template v-slot:item.role_type="{ item }">
                                        <div class="">{{ item.role_type === 1 ? "admin" :
                                            item.role_type ===
                                                2 ? "user"
                                                : item.role_type ===
                                            3 ? "viewer": "" }}</div>
                                    </template>



                                    <template v-slot:item.event_type="{ item }">
                                        <div class="">{{ item.event_type === 1 ? "login" :
                                            item.event_type ===
                                                2 ? ""
                                                : item.event_type ===
                                            3 ? "": "" }}</div>
                                    </template>
                                </v-data-table>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </div>
        <div v-else>暫無權限訪問</div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
const { $getIpaddress } = useNuxtApp()
const props = defineProps(['userName'])
// Reactive references
const searchQuery = ref('');
const dateRangeSelected = ref('');
const ws4 = ref(null);
const items = ref([
    // { loginEvent_id: '', role_type: 1, username: 'admin', event_time: '2024-11-02 00:00:00', event_type: 'login' },
    // Add more items as needed
]);
const isLoading = ref(false);  // 新增載入狀態
const loadingError = ref(false);  // 新增載入錯誤狀態
const loadingTimeout = ref(null);  // 新增載入超時計時器


// Table headers
const headers = [
    { title: '#', key: 'loginEvent_id', align: 'center', width: '20%' },
    { title: '使用者身分', key: 'role_type', align: 'center', width: '20%' },
    { title: '使用者名稱', key: 'username', align: 'center', width: '20%' },
    { title: '時間', key: 'event_time', align: 'center', width: '20%' },
    { title: '事件', key: 'event_type', align: 'center', width: '20%' },
];

// Computed property for filtered items
const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value;

    const query = searchQuery.value.toLowerCase().trim();

    return items.value.filter(item => {
        return (
            // item.loginEvent_id.toString().includes(query) ||
            // item.role_type.toLowerCase().includes(query) ||
            item.username.toLowerCase().includes(query) ||
            item.event_time.toLowerCase().includes(query)
            // item.event_type.toLowerCase().includes(query)
        );
    });
});



const getHistoryCruising = (e, e2) => {
    if (ws4.value && ws4.value.readyState === WebSocket.OPEN) {
        console.log("qwqeqweweqwdsfd", {
            "feature": "history_login",
            "method": "query_historyLogin",
            "content": {
                "start_time": e,
                "end_time": e2
            },
            "session": "sckji8452s",
        });

        // 設置載入狀態
        isLoading.value = true;
        loadingError.value = false;
        
        // 設置載入超時計時器
        loadingTimeout.value = setTimeout(() => {
            isLoading.value = false;
            loadingError.value = true;
        }, 30000); // 30秒超時

        ws4.value.send(JSON.stringify({
            "feature": "history_login",
            "method": "query_historyLogin",
            "content": {
                "start_time": e,
                "end_time": e2
            },
            "session": "sckji8452s",
        }));
    }
}

// 處理確認按鈕點擊
const handleConfirm = () => {
    if (!dateRangeSelected.value) {
        alert('請選擇時間範圍');
        return;
    }
    
    const dates = dateRangeSelected.value.split(' - ');
    if (dates.length === 2) {
        getHistoryCruising(dates[0], dates[1]);
    }
};

// 處理錯誤返回
const handleErrorReturn = () => {
    loadingError.value = false;
};


// Watch for changes in search query
watch(searchQuery, (newValue) => {
    console.log('Search query changed:', newValue);
});

// Handle search input
const handleSearch = () => {
    // Additional search handling if needed
    console.log('Searching for:', searchQuery.value);
};

// WebSocket connection

const getWebSocket4 = () => {
    ws4.value = new WebSocket(`ws://${$getIpaddress()}:8704`);

    ws4.value.onopen = () => {
        console.log("WebSocket4 connected");

        // getCruisingList()
    };

    ws4.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // console.log("sdsddsdsd", data);

        if (data.feature === "history_dataframe" && data.method === "query_historyLogin") {
            console.log("user list", data.content);
            
            // 清除載入超時計時器
            if (loadingTimeout.value) {
                clearTimeout(loadingTimeout.value);
                loadingTimeout.value = null;
            }
            
            // 更新資料並關閉載入狀態
            items.value = data.content;
            isLoading.value = false;
        }

    };

    ws4.value.onerror = (error) => {
        console.error("WebSocket4 error:", error);
        isLoading.value = false;
        loadingError.value = true;
    };

    ws4.value.onclose = () => {
        console.log("WebSocket4 disconnected");
        setTimeout(getWebSocket4, 5000); // 重連機制
    };
}

// Date plugin implementation
const datePlugin = () => {
    console.log("重新載入datarangepicker")
    let drp = new DateRangePicker('datetimerange-input1234', {
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
        // 防止日期選擇器在點擊確定後自動更新輸入框
        autoUpdateInput: false
    }, function (start, end) {
        // 在回調中手動更新日期範圍顯示
        const startFormatted = convertISOToCustomFormat(start.format());
        const endFormatted = convertISOToCustomFormat(end.format());
        
        dateRangeSelected.value = `${startFormatted} - ${endFormatted}`;
        
        // 不要在這裡調用 getHistoryCruising，而是讓用戶點擊確定按鈕時調用
        console.log("Date range selected:", startFormatted, endFormatted);
    });
}

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

// Lifecycle hook
onMounted(() => {
    datePlugin();
    getWebSocket4();
});
</script>

<style>
.bordered-section {
    outline: 1px solid #B8B8B8;
    position: relative;
    background: #fff;
}
</style>
<style>
/* 確保日期時間選擇器的下拉選單永遠在最上層 */
.daterangepicker {
    z-index: 99999 !important; /* 使用很大的值確保在最上層 */
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