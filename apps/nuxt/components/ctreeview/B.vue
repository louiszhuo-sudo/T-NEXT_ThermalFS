<template>
    <div id="c-treeView">
        <div class="c-treeView-plane c-treeView-plane-active" v-for="item in treeviews">
            <template v-if="item?.childNodes">
                <div class="c-treeView-plane-tag">
                    <div class="c-treeView-plane-h" @click="activeNode">
                        <div class="tree-table-td point0-log d-flex tree-table-lv2">
                            <div class="muen-btns mr-3">
                                <b class="muen-btn muen-btn-up active-btn">▲</b>
                                <b class="muen-btn muen-btn-down">▼</b>
                            </div>
                            <div>
                                {{ item.data.roi_subGroup_name }}({{ item.num }}/{{
                                item.data.roi_subGroup_numberLimitation }})
                            </div>
                        </div>
                        <div class="tree-table-td tree-table-lv3">-</div>
                        <div class="tree-table-td tree-table-lv4">{{ item.data.roi_subGroup_maxTemperature }}</div>
                        <div class="tree-table-td tree-table-lv5">{{ item.data.roi_subGroup_thresholdSystem }}/{{
                            item.data.roi_subGroup_thresholdManual }}</div>
                        <div class="tree-table-td tree-table-lv6">{{ item.data.roi_subGroup_maxTemperatureDiff }}</div>
                        <div class="tree-table-td tree-table-lv7">
                            {{ item.data.roi_subGroup_thresholdManual_TempDiff }}
                        </div>
                        <div class="tree-table-td tree-table-lv8 d-flex justify-center"
                            style="pointer-events: all !important;">
                            <v-checkbox indeterminate hide-details></v-checkbox>
                        </div>
                        <div class="tree-table-td tree-table-lv9">
                            按鈕
                        </div>
                        <!-- <div class="tree-table-td">
                            xxx
                        </div> -->
                    </div>
                </div>
                <div class="c-treeView-content">
                    <template v-if="item?.childNodes">
                        <CtreeviewB :formtData="item.childNodes"></CtreeviewB>
                    </template>
                    <!-- <template v-else>
                        <div>{{ item.title }}</div>
                    </template> -->
                </div>
            </template>
            <template v-else>
                <div class="tree-table align-center" style="height:50px;">
                    <div class="tree-table-td tree-table-lv2">{{ item.data.roi_name }}</div>
                    <div class="tree-table-td tree-table-lv3"></div>
                    <div class="tree-table-td tree-table-lv4">{{ item.data.roi_maxTemperature }}</div>
                    <div class="tree-table-td tree-table-lv5"></div>
                    <div class="tree-table-td tree-table-lv6"></div>
                    <div class="tree-table-td tree-table-lv7">
                        
                        <!-- <v-checkbox v-model="selected" value="Jacob" hide-details></v-checkbox> -->
                    </div>
                    <div class="tree-table-td tree-table-lv8 d-flex justify-center">
                        <v-checkbox indeterminate hide-details></v-checkbox>
                    </div>
                    <div class="tree-table-td tree-table-lv9">
                        按鈕
                    </div>
                </div>
                <!-- <div>sdasde</div> -->
                <!-- <div class="tree-table">
                    <div class="tree-table-td">AAA</div>
                    <div class="tree-table-td">AAA</div>
                    <div class="tree-table-td">AAA</div>
                    <div class="tree-table-td">AAA</div>
                    <div class="tree-table-td">AAA</div>
                </div> -->
                <!-- <div>{{ item.title }}</div> -->
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
        if (node.classList.contains('point0-log')) {
            node.childNodes.forEach((nodec) => {
                if (nodec.classList.contains('muen-btns')) {
                    nodec.childNodes.forEach((nodeb) => {
                        nodeb.classList.toggle('active-btn', isActive === nodeb.classList.contains('muen-btn-up'));
                    })
                }
            });
        }
    });
};
// onMounted(() => {
// })
</script>
<style scoped>
/* 自定義樹狀 */
.tree-table {
    display: flex;
    padding: .5em 1.5em;
    /* justify-content: space-around; */
}

.tree-table-td {
    /* width: 80px; */
    text-align: center;
}

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

.c-treeView-plane-h>div {
    pointer-events: none;
}

.muen-btn {
    display: none;
}

.active-btn {
    display: unset;
}

.c-treeView-content {
    padding-left: 0px;
}

/* 自定義樹狀 end */
</style>