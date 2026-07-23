<template>
    <!-- <div style="width: 500px;height: 500px;">
        <ClientOnly>
            <Userlist />
        </ClientOnly>
    </div> -->
    <div class="windows">
        <!-- 中區域內容 -->
        <div class="t-content-grid" style="height: calc(100% - 44px)">
            <v-card-title class="px-0" style="color: #80898C">
                <h5>使用者開通狀態</h5>
            </v-card-title>
            <v-card-text>
                <div class="d-flex">
                    <v-card width="300" v-for="item in state.items1" class="mr-3">
                        <v-card-text>
                            <v-row class="py-4 px-6">
                                <v-col cols="5">
                                    <div style="color: #80898C">
                                        <h4>{{ item.name }}</h4>
                                    </div>
                                    <div style="color: #80898C;font-size: 14px;">
                                        <div>
                                            開通數量:{{ item.data.opened }}
                                        </div>
                                        <div>
                                            啟用:{{ item.data.on }}
                                        </div>
                                        <div>
                                            停用:{{ item.data.off }}
                                        </div>
                                        <div>
                                            尚有:{{ item.data.nohave }}
                                        </div>
                                    </div>
                                </v-col>
                                <v-col cols="7" class="pa-0">
                                    <Userlist :formtData="item.data" />
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </div>
            </v-card-text>
            <v-card-title class="px-0" style="color: #80898C">
                <h5>使用者管理</h5>
                <!-- {{ $permissionsPlugins(user, 'admin') }} -->
            </v-card-title>
            <v-card-text>
                <v-text-field v-model="state.search" prepend-inner-icon="mdi-magnify" label="搜尋 使用者身分、使用者名稱、系統ID"
                    outlined hide-details dense color="#828c8f" style="
                            color: #828c8f;
                            width: 300px;
                          "></v-text-field>
                <div>
                    <v-btn @click="state.dialog = true" icon="mdi-account-plus" variant="plain"></v-btn>
                    <!-- <v-btn @click="deleteUser()" icon="mdi-account-remove" variant="plain"></v-btn> -->
                </div>
            </v-card-text>
            <v-card-text>
                <div class="">
                    <v-data-table :headers="state.headers" :items="state.desserts" :search="state.search" fixed-header
                        height="390">
                        <template v-slot:item.move="{ item }">
                            <v-btn color="error" @click="deleteUser(item)" v-if="item.id !== 'admin'">刪除</v-btn>
                        </template>
                    </v-data-table>
                </div>
            </v-card-text>
            <v-dialog v-model="state.dialog" width="auto" style="z-index: 1000;">
                <v-card max-width="400" prepend-icon="mdi-update" :title="`新增使用者`">
                    <template v-slot:text>
                        <v-sheet class="mx-auto" width="300">
                            <v-form @submit.prevent>
                                <v-text-field :error="!!state.errorMessage" :error-messages="state.errorMessage"
                                    v-model="state.userinput" :rules="state.rules" label="名稱"></v-text-field>
                                <v-text-field v-model="state.passwdinput" :rules="state.rules" label="名稱"
                                    type="password"></v-text-field>
                                <v-select v-model="state.selectedpermission" :items="state.selectedpermissionItems"
                                    item-text="roi_mainGroup_name" label="主群組"></v-select>
                            </v-form>
                        </v-sheet>
                    </template>
                    <template v-slot:actions>
                        <v-btn text="取消" @click="state.dialog = false"></v-btn>
                        <v-btn text="送出" @click="sendUser()"
                            :disabled="state.userinput === '' || state.passwdinput === ''"></v-btn>
                    </template>
                </v-card>
            </v-dialog>
        </div>
    </div>
</template>
<script setup>
const { user, loggedIn } = useJwtAuth()
const { $permissionsPlugins } = useNuxtApp()
const username1 = ref('')
const state = reactive({
    errorMessage: '',
    dialog: false,
    userinput: '',
    passwdinput: '',
    rules: [
        value => {
            if (value) return true

            return '項目名稱不能為空'
        },
    ],
    selectedpermission: 'user',
    selectedpermissionItems: ['admin', 'user', 'viewer'],
    items1: [
        {
            name: 'ADMIN',
            opened: 1,
            used: 1,
            left: 0,
            data: {
                opened: 1,
                on: 1,
                off: 0,
                nohave: 0
            }
        },
        {
            name: 'USER',
            opened: 1,
            used: 0,
            left: 0,
            data: {
                opened: 1,
                on: 1,
                off: 0,
                nohave: 0
            }
        },
        {
            name: 'VIEWER',
            opened: 1,
            used: 0,
            left: 0,
            data: {
                opened: 1,
                on: 1,
                off: 0,
                nohave: 0
            }
        },
    ],
    search: null,
    headers: [
        { title: '#', key: 'idx' },
        { title: '狀態', key: 'Status' },
        { title: 'ID', key: 'id', class: 'my-header-style' },
        { title: '名稱', key: 'Name', class: 'my-header-style' },
        { title: '權限', key: 'Permission', class: 'my-header-style' },
        // { text: '信箱', value: 'email', class: 'my-header-style' },
        {
            title: '密碼',
            key: 'Password',
            class: 'my-header-style pwd-hide',
            sortable: false,
            type: 'password',
        },
        { title: '建立時間', key: 'createdTime', class: 'my-header-style' },
        {
            title: '最後編輯時間',
            key: 'Lastmodified',
            class: 'my-header-style',
        },
        {
            title: '動作',
            key: 'move',
        }
    ],
    desserts: [
        // {
        //     idx: 1,
        //     Status: '已開通',
        //     id: 'admin',
        //     Name: 'admin',
        //     Permission: 'admin',
        //     Password: '****',
        //     createdTime: '2023-01-01 00:00:00',
        //     Lastmodified: '2023-01-01 00:00:00',
        //     actions: '-'
        // },
        // {
        //     idx: 2,
        //     Status: '已開通',
        //     id: 'user',
        //     Name: 'user',
        //     Permission: 'user',
        //     Password: '****',
        //     createdTime: '2023-01-01 00:00:00',
        //     Lastmodified: '2023-01-01 00:00:00',
        //     actions: '-'
        // },
        // {
        //     idx: 3,
        //     Status: '已開通',
        //     id: 'viewer',
        //     Name: 'viewer',
        //     Permission: 'viewer',
        //     Password: '****',
        //     createdTime: '2023-01-01 00:00:00',
        //     Lastmodified: '2023-01-01 00:00:00',
        //     actions: '-'
        // }
    ],
    timeid: null,
    newUser: { uid: 'admin1', pwd: '123', permission: 'admin' },
    deleteUserUid: 'admin1'
})

const sendUser = async () => {
    try {
        await $fetch('/api/adduser', {
            method: 'post',
            body: { uid: state.userinput, pwd: state.userinput, permission: state.selectedpermission }
        }).then((e) => {

            if (e?.error) {
                state.errorMessage = e.message
            } else {
                state.userinput = ''
                state.passwdinput = ''
                state.dialog = false
            }

        }).catch((error) => {
            console.log(error);
        })
    } catch (error) {
        console.error(error)
        // 可以加入錯誤訊息提示
    }
}
const deleteUser = async (item) => {
    try {
        await $fetch('/api/user', {
            method: 'delete',
            body: { uid: item.Name }
        })
        // showDeleteUserDialog.value = false
        // deleteUserUid.value = ''
        // 可以加入成功訊息提示，並重新整理使用者列表
        // refresh()
    } catch (error) {
        console.error(error)
        // 可以加入錯誤訊息提示
    }
}

const test = async () => {
    try {
        const { data } = await useFetch('/api/users', {
            method: 'get',
        })
        // 在这里你可以将 token 存储到 localStorage 或 cookie 中
        var array = JSON.parse(JSON.stringify(data.value))
        var output = []
        array.forEach((element, index) => {
            output.push({
                idx: index + 1,
                Status: '已開通',
                id: element.uid,
                Name: element.uid,
                Permission: element.permission,
                Password: '****',
                createdTime: '2023-01-01 00:00:00',
                Lastmodified: '2023-01-01 00:00:00',
                actions: '-'
            })
        });
        state.desserts = output
    } catch (error) {
        console.error('Login failed:', error)
    }
    state.timeid = setTimeout(() => { test() }, 1000)

}
onMounted(() => {
    test()
})
onBeforeUnmount(() => {
    if (state.timeid !== null) {
        clearTimeout(state.timeid)
        state.timeid = null
    }
})
</script>
<style scoped>
.windows {
    background: #fff;
    width: 100%;
    height: 849px;
}

.t-content-grid {
    display: grid;
    transition: all .3s;
    height: 100%;
}

.table-123 {
    width: 100%;
    height: 300px;
}
</style>
