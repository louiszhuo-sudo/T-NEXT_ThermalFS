<template>
    <client-only>
        <v-app>
            <v-app-bar prominent elevation="0" style="border:1px solid grey" height="43">
                <v-app-bar-nav-icon @click.stop="toggleDrawer"></v-app-bar-nav-icon>
                <v-btn icon="mdi-arrow-left" variant="text" @click="toIndex()"></v-btn>

                <v-toolbar-title>回到監測</v-toolbar-title>
                <v-spacer></v-spacer>
                <template v-if="$vuetify.display.mdAndUp">
                    <v-btn icon="mdi-account-circle" variant="text" id="menu-activator1sd34lr"></v-btn>
                    <v-menu activator="#menu-activator1sd34lr">
                        <v-list>
                            <v-list-item>
                                <v-list-item-title>HI , {{ user.name }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="logout">
                                <v-list-item-title>登出</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <v-btn icon="mdi-bell" variant="text" @click="openSideD()"></v-btn>
                </template>
                <!-- <v-btn icon="mdi-dots-vertical" variant="text"></v-btn> -->
            </v-app-bar>

            <v-navigation-drawer v-model="drawer" app>

                <div class="d-flex pa-4 ">
                    <v-icon>mdi-cog</v-icon>
                    <div class="pl-3">配置設定</div>
                </div>
                <v-divider />
                <v-text-field dense v-model="keyword" @input="filter" class="pb-2" :loading="loading"
                    append-inner-icon="mdi-magnify" density="compact" label="搜尋" variant="outlined" hide-details
                    single-line @click:append-inner="onClick"></v-text-field>

                <!-- 123 -->
                <v-card class="mx-auto" width="350px" variant="text">
                    <Draggable class="mtl-tree" v-model="treeData">
                        <template #default="{ node, stat }">

                            <div style="width:100%" :class="['tree-node', nodeClass(node)]"
                                @click="handleNodeClick(node, stat), remountComponent()">
                                <v-icon v-if="!stat.children.length" class="mtl-mr">mdi-cog</v-icon>
                                <span class="mtl-ml">{{ node.text }}</span>
                            </div>

                        </template>
                    </Draggable>
                </v-card>
                <!-- 123 -->
            </v-navigation-drawer>
            <v-main>
                <!-- 这里是你的主要内容 -->
                <v-container fluid :class="selectedNode.id == 17 ? 'pa-0' : ''">
                    <!-- <SettingTablesOld></SettingTablesOld> -->
                    <!-- <client-only> -->
                    <SettingTablesDeviceManagement :key="componentKey" v-if="selectedNode.id == 2" :userName="user">
                    </SettingTablesDeviceManagement>
                    <SettingTablesSystemSettingAlertNotice :key="componentKey" v-if="selectedNode.id == 4"
                        :userName="user">
                    </SettingTablesSystemSettingAlertNotice>
                    <UserlistUser v-if="selectedNode.id == 6" :userName="user"></UserlistUser>
                    <SettingTablesCruisingPoint :key="componentKey" v-if="selectedNode.id == 8" :userName="user">
                    </SettingTablesCruisingPoint>
                    <SettingTablesCruisingList :key="componentKey" v-if="selectedNode.id == 9" :userName="user">
                    </SettingTablesCruisingList>
                    <SettingTablesAlertList :key="componentKey" v-if="selectedNode.id == 14" :userName="user">
                    </SettingTablesAlertList>
                    <SettingTablesTempMonitoring :key="componentKey" v-if="selectedNode.id == 13" :userName="user">
                    </SettingTablesTempMonitoring>
                    <SettingTablesDataCollecting :key="componentKey" v-if="selectedNode.id == 12" :userName="user">
                    </SettingTablesDataCollecting>
                    <SettingTablesLoginStatus :key="componentKey" v-if="selectedNode.id == 11" :userName="user">
                    </SettingTablesLoginStatus>
                    <SettingTablesHighRiskArea :key="componentKey" v-if="selectedNode.id == 15" :userName="user">
                    </SettingTablesHighRiskArea>
                    <SettingTablesAssetAging :key="componentKey" v-if="selectedNode.id == 16" :userName="user">
                    </SettingTablesAssetAging>
                    <SettingTablesHistroyRes :key="componentKey" v-if="selectedNode.id == 17" :userName="user">
                    </SettingTablesHistroyRes>
                    <!-- </client-only> -->
                </v-container>
            </v-main>

            <v-navigation-drawer v-model="drawer2" location="right" temporary width="330">
                <client-only>
                    <SideWindowsSideD @update2="autoUpdate"></SideWindowsSideD>
                </client-only>
            </v-navigation-drawer>

        </v-app>
    </client-only>
</template>

<script setup>
import { onMounted } from 'vue'
import { reloadNuxtApp } from '#app'
const { $jwtAuth } = useNuxtApp()
const { user, loggedIn } = useJwtAuth()
const { $permissionsPlugins } = useNuxtApp()
definePageMeta({
    middleware: ['auth']
})
import { useRouter } from 'vue-router';
const router = useRouter();
const componentKey = ref(0)  // 初始化為 0

const remountComponent = () => {
    componentKey.value++  // 增加 key 值
    console.log("ddddddddfdfdf", componentKey.value)
}
const alertNumber = ref(0);
const parentData = ref('');
const autoUpdate = (data2) => {
    alertNumber.value = data2
};
async function logout() {
    try {
        await $jwtAuth.logout()
    } catch (e) {
        // your error handling
    }
}


const toIndex = () => {
    window.location.href = '/';
};
import { ref, computed } from 'vue';
import { Draggable } from '@he-tree/vue';
import '@he-tree/vue/style/default.css';
import '@he-tree/vue/style/material-design.css';
useHead({
    title: '',
    meta: [
        { charset: 'UTF-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' }
    ],
    link: [
        {
            rel: 'stylesheet',
            type: 'text/css',
            href: '/css/vanilla-datetimerange-picker-dark.css'
        }
    ],
    script: [
        {
            src: '/js/moment.min.js',
            type: 'text/javascript'
        },
        {
            src: '/js/vanilla-datetimerange-picker.js',
            type: 'text/javascript'
        }
    ],
    style: [
        { children: 'body { color: white; background-color: #fff; }' }
    ]
})
const drawer = ref(true)
const drawer2 = ref(false)
function openSideD() {
    drawer2.value = !drawer2.value;
}

const treeData = ref([
    {
        id: 1,
        text: '系統設定',
        children: [
            {
                id: 2,
                text: '裝置管理',
                icon: 'mdi-cog',
                permisssion: $permissionsPlugins(user.value, 'admin')
            },
            // {
            //     id: 3,
            //     text: '地圖及裝置配置',
            //     icon: 'mdi-cog',
            //     permisssion: $permissionsPlugins(user.value, 'admin')
            // },
            {
                id: 4,
                text: '警報及通知',
                icon: 'mdi-cog',
                permisssion: $permissionsPlugins(user.value, 'admin')
            },
        ]
    },
    {
        id: 5,
        text: '權限管理',
        children: [
            {
                id: 6,
                text: '使用者權限',
                icon: 'mdi-cog',
                permisssion: $permissionsPlugins(user.value, 'admin')
            },
        ]
    },
    {
        id: 7,
        text: '巡弋設定',
        children: [
            {
                id: 8,
                text: '預設點',
                icon: 'mdi-cog',
                permisssion: $permissionsPlugins(user.value, 'user')
            },
            {
                id: 9,
                text: '巡弋路徑',
                icon: 'mdi-cog',
                permisssion: $permissionsPlugins(user.value, 'user')
            },
        ]
    },
    {
        id: 10,
        text: '歷史數據分析',
        children: [

            {
                id: 11,
                text: '登入狀態',
                icon: 'mdi-cog',
                permisssion: $permissionsPlugins(user.value, 'admin')
            },
            {
                id: 12,
                text: '數據蒐集狀況',
                icon: 'mdi-cog',
                permisssion: $permissionsPlugins(user.value, 'viewer')
            },
            {
                id: 13,
                text: '溫度監測',
                icon: 'mdi-cog',
                permisssion: $permissionsPlugins(user.value, 'viewer')
            },
            {
                id: 14,
                text: '超溫警報',
                icon: 'mdi-cog',
                permisssion: $permissionsPlugins(user.value, 'viewer')
            },
            {
                id: 15,
                text: '超溫區域統計分析',
                icon: 'mdi-cog',
                permisssion: $permissionsPlugins(user.value, 'viewer')
            },
            {
                id: 16,
                text: '物件老化分析',
                icon: 'mdi-cog',
                permisssion: $permissionsPlugins(user.value, 'viewer')
            }
            , {
                id: 17,
                text: '歷史回放',
                icon: 'mdi-cog',
                permisssion: $permissionsPlugins(user.value, 'viewer')
            }
        ]
    }
]);

const selectedNode = ref({
    id: 2,
    text: '裝置管理',
    icon: 'mdi-cog'
},);
// const selectedNode = ref({
//     id: 17,
//     text: '歷史回放',
//     icon: 'mdi-cog'
// },);
const handleNodeClick = (node, stat) => {
    if (!stat.children.length) {
        selectedNode.value = node;
        // 获取所有包含 vt-index 属性的元素

        console.log('Clicked leaf node ID:', node.id, node);
    }
};




// nodeClass(selectedNode)



const nodeClass = computed(() => (node) => {

    return {
        'selectable': !node.children || node.children.length === 0,
        'selected': selectedNode.value.id === node.id
    };
});

function toggleDrawer() {
    drawer.value = !drawer.value
}
onMounted(() => {
    // reloadNuxtApp()
})
</script>

<style scoped>
.tree-node {
    padding: 5px;
    transition: background-color 0.3s, color 0.3s;
}

.tree-node.selectable {
    cursor: pointer;
}

.tree-node.selectable:hover {
    background-color: #e0e0e0;
}

.tree-node.selected {
    background-color: #2196F3;
    color: white;
    width: 150px
}
</style>



<style scoped>
.bg-primary {
    background-color: rgba(var(--v-theme-primary), 0.12);
}
</style>


<style scoped>
.windows {
    background: #fff;
    width: 100%;
    height: 100%;
}



.t-content-grid {
    display: grid;
    transition: all .3s;
    height: 100%;
}

.t-meun {
    border-right: #B4B4B4 1px solid;
    transition: all .3s;
    overflow: auto;
    display: flex;
    flex-direction: column;
}

.item-card-content-window {
    /* flex-grow: 1;
padding: .5em; */
    overflow: auto;
    display: flex;
    height: 44px;
    border-bottom: 1px #B4B4B4 solid;
}

.def-point-grid {
    width: 100%;
    display: grid;
    grid-template-columns: 7% 83% 11%;
    cursor: pointer;
    /* background-color: #fff; */
    align-items: center;
}

.def-point-item {
    background-color: #E7EEEF;
    transition: .2s;
    border: 1px #B4B4B4 solid;
    cursor: pointer;
    width: 263px;
}

.def-point-btn {
    background-color: #fff;
    transition: .2s;
    /* border: 2px #EAEAEA solid; */
    cursor: pointer;
}

.active-tag {
    border-bottom: 0px;
    /* border: 0px #B4B4B4 solid; */
    background-color: #fff;
}

.def-point-item:hover,
.def-point-btn:hover {
    background-color: #fdfdfd;
}

.def-point-name {
    color: #2B2D2C;
    font-weight: 700;
}

.def-point-stoptime {
    font-size: 14px;
}

.def-point-conent {
    /* width: 100px; */
    overflow: hidden;
}

#temp-copy-object {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    pointer-events: none;
    opacity: .8;
}

.path-add-message-window {
    width: 4px;
    position: relative;
    /* height: 114px; */
    background-color: #8297ff;
}

.path-add-message-window>div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: #8297ff;
}

/* select style */
.windows .item-select .v-select.v-input--dense .v-select__selection--comma {
    margin: 0px !important;
}

.windows .item-select .v-text-field fieldset,
.windows .v-text-field .v-input__control {
    height: 35px !important;
}

.windows .item-select .v-text-field.v-text-field--enclosed:not(.v-text-field--rounded)>.v-input__control>.v-input__slot,
.v-text-field.v-text-field--enclosed .v-text-field__details {
    height: 35px !important;
}

.windows .item-select .v-select__slot {
    height: 32px !important;
}

.windows .item-select .v-input__append-inner {
    margin-top: 3px !important;
}

.windows .item-select .v-input__slot {
    padding: 0px 6px !important;
}

.windows .v-field__input {
    padding: 0px 0px 0px 9px !important;
    min-height: 38px !important;
}
</style>