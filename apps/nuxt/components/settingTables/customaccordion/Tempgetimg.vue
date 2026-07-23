<template>
    <div class="d-flex flex-wrap">
        <div class="pa-1 accordion-canvas" v-for="(item, index) in imgItems" :key="index">
            <div class="d-flex accordion-item flex-wrap">
                <div class="accordion-title"> {{ item.title }}</div>
                <div class="accordion-item-img">
                    <img :src="item.ir === null ? `/images/EMPTYv1-fill.png` : 'data:image/png;base64,' + item.ir"
                        style="object-fit: fill;width: 100%;height: 100%;" />
                </div>
                <div class="accordion-item-img">
                    <img :src="item.vis === null ? `/images/EMPTYv1-fill.png` : 'data:image/png;base64,' + item.vis"
                        style="object-fit: fill;width: 100%;height: 100%;" />
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
const props = defineProps({
    date: {
        type: String
    },
    locations: Array,
    roiClass: {
        type: String
    }, groupItem: {
        type: String
    }
})
const imgItems = ref([])

// 避免送出ws太快
const lastSendTime = ref(0);
const throttleDelay = ref(200); // ms
const moveTimer = ref(null);

watch(() => props.date, (val) => {
    const sendData = ({ selected_time, selected_cruisingPoint_id, roiClass_id }) => {
        let output = {
            feature: 'history_playback',
            method: 'query_history_cruisingImages',
            session: Math.random().toString(36).substr(2),
            content: {
                field_id: 1,
                selected_time,
                selected_cruisingPoint_id,
                roiClass_id
            },
        }
        console.log('outputoutputoutput', output);
        ws041.value.send(JSON.stringify(output))
    }

    const now = Date.now();
    if (now - lastSendTime.value >= throttleDelay.value) {
        sendData({
            selected_time: props.date,
            selected_cruisingPoint_id: props.locations,
            roiClass_id: props.groupItem
        });
        lastSendTime.value = now;
    } else {
        // 如果100ms內又觸發，排定最後一次
        clearTimeout(moveTimer.value);
        moveTimer.value = setTimeout(() => {
            sendData({
                selected_time: props.date,
                selected_cruisingPoint_id: props.locations,
                roiClass_id: props.groupItem
            });
            lastSendTime.value = Date.now();
        }, throttleDelay.value - (now - lastSendTime.value));
    }
}, { deep: true })
const { $webSocket04URL } = useNuxtApp()
const ws041 = ref(null)
const runws04 = () => {
    ws041.value = new WebSocket($webSocket04URL())
    ws041.value.onopen = (e) => {
        console.log('(plugins)串流連接成功::8704');
        let output = {
            feature: 'history_playback',
            method: 'query_history_cruisingImages',
            session: Math.random().toString(36).substr(2),
            content: {
                field_id: 1,
                selected_time: props.date,
                selected_cruisingPoint_id: props.locations,
                roiClass_id: props.groupItem
            },
        }
        console.log('outputoutputoutput', output);
        ws041.value.send(JSON.stringify(output))
    }
    const messageEvent = (event) => {
        var data = JSON.parse(event.data)
        var feature = data.feature
        var method = data.method
        // console.log('messageEvent', data);
        if (feature === "history_playback" && method === "query_history_cruisingImages") {
            var content = data.content
            var output = []
            content.forEach((item) => {
                output.push({
                    title: item.ptz_curisingPoint_name,
                    vis: item.image_base64.vis,
                    ir: item.image_base64.ir
                })
            })
            imgItems.value = output
        }
    }
    ws041.value.addEventListener("message", messageEvent)
    ws041.value.onclose = (e) => {
        console.log("(plugins)串流連接中斷::8704");
        setTimeout(() => {
            runws04()
        }, 3000)
    }
}
const getimgf = (e) => {
    return 're'
}
onMounted(() => {
    runws04() // 給折疊呼叫圖片用
})

onUnmounted(() => {
    if (ws041.value !== null) {
        // ws041.close()
        ws041.value = null
    }

})
</script>
<style scoped></style>

<style></style>