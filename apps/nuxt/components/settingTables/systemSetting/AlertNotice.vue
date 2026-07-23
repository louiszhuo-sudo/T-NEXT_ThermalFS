<template>
    <div class="device-tree">
        <div v-if="props.userName.name === 'admin'">
            <v-container fluid>

                <v-row>
                    <v-col cols="12" class="d-flex justify-start bordered-section" style="white-space: nowrap;">
                        <div class="d-flex align-center pr-4">
                            <h4 class="pr-4">Email 發報通知</h4>
                            <v-radio-group v-model="editedItem.emailAlarmNotification.sendingStatus" hide-details
                                inline>
                                <v-radio label="ON" :value="1"></v-radio>
                                <v-radio label="OFF" :value="0"></v-radio>
                            </v-radio-group>
                        </div>


                    </v-col>
                    <v-col cols="12" class="d-flex justify-start bordered-section" style="white-space: nowrap;">



                        <v-row>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">
                                    <h4 style="width:100px">重複發報</h4>
                                    <v-select density="compact" variant="outlined" :items="ynItems" item-title="title"
                                        item-value="value" hide-details
                                        v-model="editedItem.emailAlarmNotification.repeatSendingStatus" label=""
                                        single-line>
                                    </v-select>
                                </div>
                            </v-col>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">
                                    <h4 style="width:100px">發報頻率</h4>
                                    <v-select density="compact" variant="outlined" :items="emailFeqItems"
                                        item-title="title" item-value="value" hide-details
                                        v-model="editedItem.emailAlarmNotification.sendingFrequency" label=""
                                        single-line>
                                    </v-select>
                                </div>
                            </v-col>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">
                                    <h4 style="width:100px">是否含警報圖</h4>
                                    <v-select density="compact" variant="outlined" :items="ynItems" item-title="title"
                                        item-value="value" hide-details
                                        v-model="editedItem.emailAlarmNotification.alarmImageStatus" label=""
                                        single-line>
                                    </v-select>
                                </div>
                            </v-col>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">

                                </div>
                            </v-col>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">
                                    <h4 style="width:100px">Smtp Host</h4>
                                    <v-text-field v-model="editedItem.emailAlarmNotification.smtpHost" density="compact"
                                        variant="outlined" hide-details type="text"></v-text-field>
                                </div>
                            </v-col>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">
                                    <h4 style="width:100px">Smtp Post</h4>
                                    <v-text-field v-model="editedItem.emailAlarmNotification.smtpPost" density="compact"
                                        variant="outlined" hide-details type="text"></v-text-field>
                                </div>
                            </v-col>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">
                                    <h4 style="width:100px">寄件人帳號</h4>
                                    <v-text-field v-model="editedItem.emailAlarmNotification.senderAccount"
                                        density="compact" variant="outlined" hide-details type="text"></v-text-field>
                                </div>
                            </v-col>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">
                                    <h4 style="width:100px">寄件人密碼</h4>
                                    <v-text-field type="password"
                                        v-model="editedItem.emailAlarmNotification.senderPassword" density="compact"
                                        variant="outlined" hide-details></v-text-field>
                                </div>
                            </v-col>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">
                                    <h4 style="width:100px">寄件者類型</h4>
                                    <v-select disabled density="compact" chips multiple variant="outlined"
                                        :items="senderTypeItems" item-title="title" item-value="value" hide-details
                                        v-model="editedItem.emailAlarmNotification.senderType" label="" single-line>
                                    </v-select>
                                </div>
                            </v-col>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">
                                    <h4 style="width:100px">收件人帳號</h4>
                                    <v-text-field v-model="editedItem.emailAlarmNotification.recipientAccount"
                                        density="compact" variant="outlined" hide-details type="text"></v-text-field>
                                </div>
                            </v-col>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">
                                    <h4 style="width:100px">郵件主題</h4>
                                    <v-text-field v-model="editedItem.emailAlarmNotification.emailSubject"
                                        density="compact" variant="outlined" hide-details type="text"></v-text-field>
                                </div>
                            </v-col>

                            <v-col cols="12" class="text-right" style="white-space: nowrap;">
                                <v-btn variant="outlined" @click="editSavingStatus">儲存</v-btn>
                            </v-col>
                        </v-row>


                    </v-col>




                </v-row>


                <v-row class="pt-5">
                    <v-col cols="12" class="d-flex justify-start bordered-section" style="white-space: nowrap;">
                        <div class="d-flex align-center pr-4">
                            <h4 class="pr-4">Telegram 發報通知</h4>
                            <v-radio-group v-model="editedItem.lineAlarmNotification.sendingStatus" hide-details inline>
                                <v-radio label="ON" :value="1"></v-radio>
                                <v-radio label="OFF" :value="0"></v-radio>
                            </v-radio-group>
                        </div>


                    </v-col>
                    <v-col cols="12" class="d-flex justify-start bordered-section" style="white-space: nowrap;">



                        <v-row>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">
                                    <h4 style="width:100px">重複發報</h4>
                                    <v-select density="compact" variant="outlined" :items="ynItems" item-title="title"
                                        item-value="value" hide-details
                                        v-model="editedItem.lineAlarmNotification.repeatSendingStatus" label=""
                                        single-line>
                                    </v-select>
                                </div>
                            </v-col>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">
                                    <h4 style="width:100px">發報頻率</h4>
                                    <v-select density="compact" variant="outlined" :items="lineFeqItems"
                                        item-title="title" item-value="value" hide-details
                                        v-model="editedItem.lineAlarmNotification.sendingFrequency" label=""
                                        single-line>
                                    </v-select>
                                </div>
                            </v-col>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">
                                    <h4 style="width:100px">是否含警報圖</h4>
                                    <v-select density="compact" variant="outlined" :items="ynItems" item-title="title"
                                        item-value="value" hide-details
                                        v-model="editedItem.lineAlarmNotification.alarmImageStatus" label=""
                                        single-line>
                                    </v-select>
                                </div>
                            </v-col>
                            <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">

                                </div>
                            </v-col>
                            <!-- <v-col cols="3" style="white-space: nowrap;">
                                <div class="d-flex align-center">
                                    <h4 style="width:100px">LINE Token</h4>
                                    <v-text-field v-model="editedItem.lineAlarmNotification.lineToken" density="compact"
                                        variant="outlined" hide-details type="text"></v-text-field>
                                </div>
                            </v-col> -->

                            <!-- <v-col cols="9" style="white-space: nowrap;">
                                <div class="d-flex align-center">

                                </div>
                            </v-col> -->

                            <v-col cols="12" class="text-right" style="white-space: nowrap;">
                                <v-btn variant="outlined" @click="editSavingStatus">儲存</v-btn>
                            </v-col>
                        </v-row>


                    </v-col>




                </v-row>
            </v-container>
        </div>
        <div v-else>暫無權限訪問</div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
const { $getIpaddress } = useNuxtApp()
const props = defineProps(['userName'])

const emailFeqItems = ref([{ title: '1秒', value: 1 }, { title: '1分鐘', value: 60 }, { title: '5分鐘', value: 300 }, { title: '10分鐘', value: 600 }])
const lineFeqItems = ref([{ title: '1秒', value: 1 }, { title: '30秒', value: 30 }, { title: '1分鐘', value: 60 }, { title: '5分鐘', value: 300 }, { title: '10分鐘', value: 600 }])
const senderTypeItems = ref([{ title: 'User', value: 1 }, { title: 'Mail Server', value: 0 }])

const ynItems = [{ value: 1, title: "Yes" }, { value: 0, title: "No" }]

const ws3 = ref(null);
const editedItem = ref(
    {
        emailAlarmNotification: {
            smtpHost: "",
            smtpPost: "",
            senderAccount: "",
            senderPassword: "",
            senderType: 1,
            emailSubject: "",
            recipientAccount: "",
            sendingStatus: 1,
            repeatSendingStatus: 1,
            sendingFrequency: 1,
            alarmImageStatus: 1,
        },
        lineAlarmNotification: {
            lineToken: "",
            sendingStatus: 1,
            repeatSendingStatus: 1,
            sendingFrequency: 1,
            alarmImageStatus: 1
        }
    }

)
//! step 1
const editSavingStatus = (e, e2) => {

    console.log("sfsdfdssdfsd", {
        "feature": "notice",
        "method": "set_alarmInfo",
        "content": {
            ...editedItem.value
        },
        "session": "sckji8452s"
    });

    if (ws3.value && ws3.value.readyState === WebSocket.OPEN) {
        ws3.value.send(JSON.stringify({
            "feature": "notice",
            "method": "set_alarmInfo",
            "content": {
                ...editedItem.value
            },
            "session": "sckji8452s"
        }));
    }
}





const getSavingStatus = () => {

    if (ws3.value && ws3.value.readyState === WebSocket.OPEN) {
        ws3.value.send(JSON.stringify({
            "feature": "notice",
            "method": "query_alarmInfo",
            "content": {},
            "session": "sckji8452s"
        }));
    }
}



// Simulate WebSocket connection
let websocketInterval;

const getWebSocket3 = () => {
    ws3.value = new WebSocket(`ws://${$getIpaddress()}:8703`);

    ws3.value.onopen = () => {
        console.log("WebSocket connected");
        getSavingStatus()
    };

    ws3.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("9999999999", data);

        if (data.feature === "notice" && data.method === "query_alarmInfo") {
            console.log("sdfsfsfsfsf", data.content)
            editedItem.value = data.content



        }
    };

    ws3.value.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    ws3.value.onclose = () => {
        console.log("WebSocket disconnected");
        setTimeout(initWebSocket, 5000); // 重連機制
    };
}





onMounted(() => {
    getWebSocket3();
});

onUnmounted(() => {
});

</script>

<style scoped>
.bordered-section {
    outline: 1px solid #B8B8B8;
    position: relative;
    background: #fff;
}
</style>