<template>
    <div id="c-treeView">
        <div class="c-treeView-plane c-treeView-plane-active" v-for="item in treeviews">
            <template v-if="item?.childNodes">
                <div class="c-treeView-plane-tag">
                    <div class="c-treeView-plane-h" @click="activeNode">
                        <div class="muen-btns mr-3">
                            <b class="muen-btn muen-btn-up active-btn">▲</b>
                            <b class="muen-btn muen-btn-down">▼</b>
                        </div>
                        <div>
                            {{ item.title }}
                        </div>
                    </div>
                </div>
                <div class="pl-10">
                    <template v-if="item?.childNodes">
                        <Ctreeview :formtData="item.childNodes"></Ctreeview>
                    </template>
                    <template v-else>
                        <div>{{ item.title }}</div>
                    </template>
                </div>
            </template>
            <template v-else>
                <div>{{ item.title }}</div>
            </template>
        </div>
    </div>
</template>
<script setup>
const treeviews = useAttrs().formtData
const activeNode = (e) => {
    // 自訂樹狀
    const parentNode = e.target.parentNode.parentNode;
    const isActive = parentNode.classList.toggle('c-treeView-plane-active');

    e.target.childNodes.forEach((node) => {
        if (node.classList.contains('muen-btns')) {
            node.childNodes.forEach((nodec) => {
                nodec.classList.toggle('active-btn', isActive === nodec.classList.contains('muen-btn-up'));
            });
        }
    });
};
// onMounted(() => {
// })
</script>
<style scoped>
/* 自定義樹狀 */
.c-treeView-plane {
    overflow: hidden;
    transition: all .2s;
    max-height: 50px;
}

.c-treeView-plane-active {
    max-height: 1000px;
}

.c-treeView-plane-tag {
    height: 50px;
    padding: .5em;
}

.c-treeView-plane-h {
    width: 100%;
    height: 100%;
    box-shadow: 1px 1px 6px 3px #00000017;
    background-color: #ffffff;
    cursor: pointer;
    transition: all .3s;
    border-radius: .2em;
    display: flex;
    align-items: center;
    /* justify-content: space-between; */
    padding: 0em 1em;
}

.c-treeView-plane-h:hover {
    background-color: #e7e7e7;
}

.c-treeView-plane-h:active {
    background-color: #c4c4c4;
}

.c-treeView-plane-h div {
    pointer-events: none;
}

.muen-btn {
    display: none;
}

.active-btn {
    display: unset;
}

/* 自定義樹狀 end */
</style>