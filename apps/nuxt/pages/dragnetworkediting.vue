<template>
    <v-btn @click="addWidget()">➕ 新增元件</v-btn>
    <div class="dashboard" id="dashboard">
        <div class="widget" v-for="(item, index) in state.widgets" :key="index" @mousedown="startDrag">
            Widget {{ index }}
            <button class="close-btn" @click="(e) => { removeWidget(item.id) }">❌</button>
            <div class="resize-handle" @mousedown="startResize"></div>
        </div>
    </div>
</template>
<script setup>
const dashboard = document.getElementById("dashboard");
const gridSize = 50; // 單位網格大小
let activeWidget = null, offsetX = 0, offsetY = 0, isResizing = false;
const state = reactive({
    widgets: []
})
// 新增元件
function addWidget() {
    state.widgets.push({
        id: Math.random().toString(36).substr(2),
        style: {
            left: 0,
            top: 0
        }
    })
}

// 移除元件
function removeWidget(id) {
    state.widgets = state.widgets.filter((item) => item.id !== id)
}

// 開始拖動
function startDrag(e) {
    if (e.target.classList.contains("resize-handle")) return; // 避免誤觸調整大小
    if (e.target.classList.contains("close-btn")) return; // 避免誤觸調整大小
    activeWidget = e.target;
    offsetX = e.clientX - activeWidget.offsetLeft;
    offsetY = e.clientY - activeWidget.offsetTop;
    document.addEventListener("mousemove", dragMove);
    document.addEventListener("mouseup", stopDrag);
}

// 拖動過程
function dragMove(e) {
    if (!activeWidget || isResizing) return;
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;

    // 讓元素對齊網格
    x = Math.round(x / gridSize) * gridSize;
    y = Math.round(y / gridSize) * gridSize;

    activeWidget.style.left = `${x}px`;
    activeWidget.style.top = `${y}px`;
}

// 結束拖動
function stopDrag() {
    document.removeEventListener("mousemove", dragMove);
    document.removeEventListener("mouseup", stopDrag);
    activeWidget = null;
}

// 開始調整大小
function startResize(e) {
    e.stopPropagation();
    isResizing = true;
    activeWidget = e.target.parentElement;
    document.addEventListener("mousemove", resizeMove);
    document.addEventListener("mouseup", stopResize);
}

// 調整大小過程
function resizeMove(e) {
    if (!activeWidget) return;
    let width = e.clientX - activeWidget.offsetLeft;
    let height = e.clientY - activeWidget.offsetTop;

    // 限制最小大小 & 對齊網格
    width = Math.max(100, Math.round(width / gridSize) * gridSize);
    height = Math.max(100, Math.round(height / gridSize) * gridSize);

    activeWidget.style.width = `${width}px`;
    activeWidget.style.height = `${height}px`;
}

// 停止調整大小
function stopResize() {
    document.removeEventListener("mousemove", resizeMove);
    document.removeEventListener("mouseup", stopResize);
    isResizing = false;
    activeWidget = null;
}
onMounted(() => {
})
</script>
<style>
body {
    font-family: Arial, sans-serif;
}

.dashboard {
    display: grid;
    grid-template-columns: repeat(6, 100px);
    grid-template-rows: repeat(4, 100px);
    gap: 5px;
    background: #ddd;
    padding: 10px;
    position: relative;
    width: fit-content;
}

.widget {
    position: absolute;
    width: 200px;
    height: 200px;
    background: #3498db;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    cursor: grab;
    user-select: none;
}

.widget .resize-handle {
    position: absolute;
    width: 15px;
    height: 15px;
    background: white;
    bottom: 0;
    right: 0;
    cursor: nwse-resize;
}

.widget .close-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: red;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 12px;
    padding: 3px;
}
</style>