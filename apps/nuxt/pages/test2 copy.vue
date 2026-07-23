<template>
    <div class="layout-container">
        <div>
            <v-btn @click="add">add</v-btn>
            <div v-for="(item, index) in state.data" :key="index">
                {{ item }}
            </div>
        </div>
    </div>
</template>

<script setup>
// 可以根据需要添加任何逻辑，比如加载图片或处理交互事件
const state = reactive({
    data: []
})
const add = () => {
    state.data.push(state.data.length)
}
</script>

<style scoped>
.layout-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f0f0;
}

.header {
    display: flex;
    justify-content: flex-start;
    padding: 10px;
    background-color: #e0e0e0;
}

.icon {
    width: 24px;
    height: 24px;
    margin-right: 10px;
}

.grid-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 10px;
    padding: 10px;
    background-color: #fff;
    flex-grow: 1;
}

.grid-item {
    background-color: #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
}

.grid-item img {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
}
</style>
