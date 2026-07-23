
<template>
    <div id="c-treeView" style="max-height: 458px; overflow: auto;">
        <div class="tree-table" style="font-size:12px;">
            <div class="tree-table-td tree-table-lv1">群組</div>
            <div class="tree-table-td tree-table-lv2-0"></div>
            <div class="tree-table-td tree-table-lv2">ROI名稱</div>
            <div class="tree-table-td tree-table-lv3">警報狀態</div>
            <div class="tree-table-td tree-table-lv4">最高溫度</div>
            <div class="tree-table-td tree-table-lv5">一級/二級警報</div>
            <div class="tree-table-td tree-table-lv6">最大溫差</div>
            <div class="tree-table-td tree-table-lv7">溫差警報</div>
            <div class="tree-table-td tree-table-lv8">警報開關</div>
            <div class="tree-table-td tree-table-lv9"></div>
        </div>
        <div
            class="c-treeView-plane c-treeView-plane-active"
            v-for="item in state.treeviews"
            :key="item.id"
            style="font-size:12px;"
            v-if="item.childNodes"
        >
            <div class="c-treeView-plane-tag">
                <div class="c-treeView-plane-h" @click="activeNode(item)">
                    <div class="tree-table-td point0-log d-flex tree-table-lv1">
                        <div class="muen-btns mr-3">
                            <b class="muen-btn muen-btn-up active-btn">▲</b>
                            <b class="muen-btn muen-btn-down">▼</b>
                        </div>
                        <div>
                            {{ item.data.roi_mainGroup_name }}({{ item.num }})
                        </div>
                    </div>
                    <div class="tree-table-td tree-table-lv2-0"></div>
                    <div class="tree-table-td tree-table-lv2"></div>
                    <div class="tree-table-td tree-table-lv3"></div>
                    <div class="tree-table-td tree-table-lv4"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            state: {
                treeviews: []
            }
        };
    },
    methods: {
        activeNode(item) {
            console.log("Active node:", item);
        },
        updateTreeviews(newData) {
            if (JSON.stringify(newData) !== JSON.stringify(this.state.treeviews)) {
                this.state.treeviews = Object.freeze(newData);
            }
        }
    },
    mounted() {
        setInterval(() => {
            const newData = this.fetchTreeviews();
            this.updateTreeviews(newData);
        }, 1000);
    }
};
</script>
