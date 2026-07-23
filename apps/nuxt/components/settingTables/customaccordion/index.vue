<template>
    <div style="height: calc(-100px + 100vh);overflow-y: scroll;" ref="container" class="accodion-main">
        <!-- 控制按鈕 (僅多開時顯示) -->
        <div v-if="allowMultiple" class="d-flex mb-1 justify-end">
            <div style="width: 30px;height: 30px;" class="mr-2">
                <v-btn @click="items.length !== opened.size ? expandAll() : collapseAll()" flat block color="#ffffff00">
                    <img v-if="items.length !== opened.size" src="/images/icon/text.png"
                        style="width: 20px;height: 20px;" />
                    <img v-else src="/images/icon/graphic.png" style="width: 20px;height: 20px;" />
                </v-btn>
            </div>
            <!-- <div style="width: 30px;">
                <v-btn @click="collapseAll" flat block>
                    <img src="/images/icon/graphic.png" style="width: 30px;" />
                </v-btn>
            </div> -->
        </div>

        <!-- 折疊項目 -->
        <div v-for="item in items" :key="item.name" class="mb-1 overflow-hidden ex-item-o">
            <div class="d-flex justify-space-between pr-3 accord-item"
                @click="emit('highlightlable', { type: 'customaccordion', name: item.name })">
                <div class="accord-title">
                    <div class="flag-label c1976d2 mr-3">
                        {{ item.name }}
                    </div>
                    <div class="d-flex align-center mr-4 "><img src="/images/newicon/calendar.png"
                            style="width: 20px;height: 20px;" class="mr-1" />{{
                                item.date }} </div>
                    <div class="d-flex align-center mr-4 "><img src="/images/newicon/roialarm.png"
                            style="width: 20px;height: 20px;" class="mr-1" />{{ item.alarm_ROI }} </div>
                    <div class="d-flex align-center mr-4"><img src="/images/newicon/smoke.png"
                            style="width: 20px;height: 20px;" class="mr-1" />{{ item.alarm_smoke }} </div>
                    <div class="d-flex align-center mr-4 "><img src="/images/newicon/bell.png"
                            style="width: 20px;height: 20px;" class="mr-1" />{{ item.alarm }} </div>
                    <div class="d-flex align-center mr-4"><img src="/images/newicon/roimax.png"
                            style="width: 20px;height: 20px;" class="mr-1" />{{ item.temp_max }} </div>
                    <!-- 位置:{{ item.location }} -->
                </div>
                <div style="width: 30px;">
                    <v-btn @click="toggle(item.name)" class="ml-2" color="#ffffff00" flat block>
                        <img src="/images/icon/down.png" :style="isOpen(item.name) ? 'transform: rotate(180deg);' : ''"
                            style="width: 30px;" />
                        <!-- <svg :class="['w-5 h-5 transition-transform duration-300', isOpen(item.name) ? 'rotate-90' : 'rotate-0']"
                        fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg> -->
                    </v-btn>
                </div>
            </div>

            <Transition name="accordion">
                <div v-if="isOpen(item.name)">
                    <!-- <div v-if="editTimehandleBarSwitch !== null && item.name === editTimehandleBarSwitch?.name">
                        編輯 {{ editTimehandleBarSwitch }}
                    </div> -->
                    <!-- <template v-for="(item2, index2) in item.base64" :key="index2"> -->
                    <SettingTablesCustomaccordionTempgetimg :date="item.date" :locations="item.location"
                        :groupItem="groupItem">
                    </SettingTablesCustomaccordionTempgetimg>
                    <!-- <div class="d-flex flex-wrap">
                        <div class="pa-1 accordion-canvas">
                            <div class="d-flex accordion-item flex-wrap">
                                <div class="accordion-title"> CAM {{ 1 }} - LOC 1</div>
                                <div class="accordion-item-img">
                                    <img :src="`/mock/ppp/cam_1_loc1_ir.png`"
                                        style="object-fit: fill;width: 100%;height: 100%;" />
                                </div>
                                <div class="accordion-item-img">
                                    <img :src="`/mock/ppp/cam_1_loc1_vis.png`"
                                        style="object-fit: fill;width: 100%;height: 100%;" />
                                </div>
                            </div>
                        </div>

                    </div> -->
                    <!-- <img :src="item2.base64" style="object-fit: fill;width: 100%;height: 100%;" /> -->
                    <!-- </template> -->
                </div>
            </Transition>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAttrs } from 'vue'
const editTimehandleBarSwitch = useState('editTimehandleBarSwitch')
const container = ref('')
const emit = defineEmits([])
const props = defineProps({
    items: Array,
    getimgf: Function,
    defaultOpened: {
        type: Array,
        default: () => []
    }, groupItem: {
        type: String
    }
})

const attrs = useAttrs()
const allowMultiple = computed(() => attrs['data-multiple'] === 'true')

const opened = ref(allowMultiple.value ? new Set() : null)

onMounted(() => {
    if (allowMultiple.value) {
        props.defaultOpened.forEach(name => opened.value.add(name))
    } else {
        opened.value = props.defaultOpened[0] ?? null
    }
})

const isOpen = (name) => {
    if (allowMultiple.value) return opened.value.has(name)
    return opened.value === name
}

const toggle = (name) => {
    if (allowMultiple.value) {
        if (opened.value.has(name)) {
            opened.value.delete(name)
        } else {
            opened.value.add(name)
        }
    } else {
        opened.value = opened.value === name ? null : name
    }
}

// 一鍵展開與收折
const expandAll = () => {
    if (allowMultiple.value) {
        opened.value = new Set(props.items.map(i => i.name))
    }
}
const collapseAll = () => {
    if (allowMultiple.value) {
        opened.value.clear()
    }
}
const highlightlable = (name) => {
    console.log('highlightlable 摺疊 被觸發了', name, props.items);
    const index = props.items.findIndex((item) => item.name === name)
    if (allowMultiple.value) {
        if (!opened.value.has(props.items[index].name)) {
            opened.value.add(props.items[index].name)
        }
    }

    const divList = document.querySelectorAll('.ex-item-o')
    const div = divList[index]
    setTimeout(() => {
        const scrollTop = div.offsetTop - 60;     // 垂直滾動位置
        container.value.scrollTo({
            top: scrollTop,
            behavior: 'smooth'  // 平滑滾動
        });
        div.classList.add('flash-effect');
        // 0.3 秒後移除 class 還原顏色
        setTimeout(() => {
            div.classList.remove('flash-effect');
        }, 1000);
    }, 150);
}
defineExpose({
    highlightlable
})
</script>

<style scoped>
.accodion-main {
    background: #ffffff;
    box-shadow: 1px 1px 3px 3px #0000000f;
    border-radius: 5px;
}

.accordion-enter-active,
.accordion-leave-active {
    transition: max-height 0.1s ease, opacity 0.1s ease;
}

.accordion-enter-from,
.accordion-leave-to {
    max-height: 0;
    opacity: 0;
}

.accordion-enter-to,
.accordion-leave-from {
    max-height: 500px;
    opacity: 1;
}
</style>

<style>
.flash-effect {
    animation: blink-blue .5s infinite;
}

@keyframes blink-blue {
    0% {
        background-color: transparent;
    }

    50% {
        background-color: rgba(199, 199, 253, 0.329);
    }

    100% {
        background-color: transparent;
    }
}

.accord-title {
    line-height: 2.2;
    user-select: none;
    display: grid;
    grid-template-columns: 60px 200px 55px 60px 60px 60px 60px;
}

.accord-item {
    cursor: pointer;
    background: #fff;
    transition: background .2s;
}

.accord-item:hover {
    background: #d8d8d8;
}

.accord-item:active {
    background: #bebebe;
}

.accordion-canvas {
    /* padding: .5em; */
    width: 50%;
}

.accordion-item {
    width: 100%;
    background-color: #f5f5f5;
    padding: .25em;
    border-radius: .25em;
}

.accordion-title {
    width: 100%;
}

.accordion-item-img {
    padding: .15em;
    width: 50%;
}

.ex-item-o {
    border-bottom: 1px solid #eeeeee;
    border-top: 1px solid #eeeeee;
}

.flag-label {
    display: inline-block;
    /* 藍底 */
    color: #fff;
    /* 白字 */
    font-size: 14px;
    font-weight: 600;
    padding: 6px 12px 6px 12px;
    position: relative;
    border-radius: 0px 0 0 0px;
    height: 38px;
    white-space: nowrap;
    /* 不換行 */
    text-overflow: ellipsis;
    /* 超過用 ... 代替 */
    /* 左邊圓角 */
}

.flag-label::after {
    content: "";
    position: absolute;
    top: 0;
    right: -10px;
    /* 三角形超出去 */
    width: 0;
    height: 0;
    border-top: 19px solid transparent;
    border-bottom: 19px solid transparent;
    /* 旗標的箭頭 */
}

.c1976d2 {
    background: #1976d2;
}

.c1976d2::after {
    border-left: 10px solid #1976d2;
}

</style>