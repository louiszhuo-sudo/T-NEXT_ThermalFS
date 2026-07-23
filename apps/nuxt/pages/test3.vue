<template>
    <div class="layout-container">
        <div class="test">
            <MapOnlyroiInter :camID="1" :formtData="state" :camType="'ir'" />
            {{ low() }} + {{ lo2() }}
            <!-- {{ state.maskAddMode }} -->
            <!-- <MapDefault ref="mapImport1" :formtData="state" :camID="1" :camType="'ir'" /> -->
        </div>
        <div class="test01">
            <!-- <MapDefault ref="mapImport1" :formtData="state" :camID="1" :camType="'ir'" />
            <MapDefault ref="mapImport1" :formtData="state" :camID="1" :camType="'ir'" />
            <MapDefault ref="mapImport1" :formtData="state" :camID="1" :camType="'ir'" /> -->
            <MapOnlyroiInter :camID="1" :formtData="state" :camType="'ir'" />
            <MapOnlyroiInter :camID="1" :formtData="state" :camType="'ir'" />
            <MapOnlyroiInter :camID="1" :formtData="state" :camType="'ir'" />
        </div>
    </div>
</template>

<script setup>
import { low, lo2, show } from '@/utils/leaflat/utils';
const state = reactive({
    cursingPointId: null,
    maskAddMode: '',
    mainMode: 'roi', // review = 監控模式 ,roi = ROI模式,mask = MASK模式,mask-temp-select = 溫度區域選取模式
    mainMode1: 'roi',
    mainModeItems: ['review', 'roi', 'mask', 'mask-temp-select'],
    wsRoiData: null,
    wsRoiData1: null,
    cursingPointValue: 0,
    cursingPointItems: [],
    alarmID: [],
})
onMounted(() => {
    setInterval(() => {
        console.log(show());
    }, 1000)
})
</script>

<style scoped>
.layout-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.test {
    width: 1024px;
    height: 768px;
    background-color: antiquewhite;
}

.test01 {
    position: fixed;
    right: 0;
    top: 0;
    width: 400px;
    height: 100vh;
    background-color: antiquewhite;
    display: grid;
    grid-template-rows: 33% 33% 33%;
}
</style>
