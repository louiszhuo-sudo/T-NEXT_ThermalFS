<template>

    <div>
        <v-card>

            <v-card-title style="background-color:#F7F7F7;font-size: 15px;" class="pa-1">偵測器即時資訊</v-card-title>
            <v-card-text>
                <v-data-table density="compact" :headers="headers" :items="desserts" hide-default-footer
                    items-per-page="-1">
                </v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>
<script setup>
const headers = ([
    {
        title: '監測項目',
        align: 'center',
        sortable: true,
        key: 'item',
    },
    {
        title: '數據',
        align: 'center',
        sortable: true,
        key: 'value',
    },
]);
const desserts = ref([
    // {
    //     item: 'Frozen Yogurt',
    //     value: 0
    // },
    // {
    //     item: 'Jelly bean',
    //     value: 0
    // }
]);

// 使用 const 來聲明不變的值
const WS_URL = "ws://localhost:8705";
const alarmData = ref([]);
let ws = null; // 使用 let 因為這個值會被重新賦值

function setupWebSocket() {
    if (ws) ws.close();

    ws = new WebSocket(WS_URL);

    ws.onopen = () => console.log("WebSocket connected");

    ws.onmessage = (e) => {
        try {
            const data = JSON.parse(e.data);
            desserts.value = data.overall_deviceStatus[0];
            console.log("dfgdgfg",data.overall_deviceStatus);
        } catch (error) {
            console.error("Error parsing WebSocket message:", error);
            // desserts.value = []

        }
    };

    ws.onclose = () => {
        console.log("WebSocket disconnected");
        setTimeout(setupWebSocket, 1000);
    };
}

onMounted(setupWebSocket);

onUnmounted(() => {
    if (ws) {
        ws.close();
        ws = null;
    }
});


</script>