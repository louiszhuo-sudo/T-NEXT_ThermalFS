<template>
    <!-- <h2 v-if="loggedIn">{{ user.name }}</h2>
    <h2 v-if="loggedIn">
        <v-btn @click="logout">登出</v-btn>
    </h2>
    <input v-model="username" placeholder="Username" />
    <input type="password" v-model="password" placeholder="Password" />
    <button @click="login">Login</button>
    <div>{{ state.errorManager }}</div> -->
    <div>
        <NuxtImg class="bgimg ma-0" height="100vh" />
        <v-card class="mx-auto card" width="60em" height="35em" elevation="6">
            <v-row no-gutters>
                <v-col cols="12" md="7">
                    <v-row>
                        <!-- 左區塊----------------------------------------------------------------------------------------------- -->
                        <!-- <v-col cols="12" lg="12"> -->
                        <v-col cols="12" lg="12">
                            <v-card class="left-card">
                                <v-responsive :aspect-ratio="1 / 1">
                                    <NuxtImg src="/images/fs/icon/Thermal FS.svg" width="25em"
                                        class="logo mx-auto my-16" />
                                </v-responsive>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>

                <v-col cols="12" md="5">
                    <v-row>
                        <!-- 右區塊----------------------------------------------------------------------------------------------- -->
                        <v-col cols="12" lg="12">
                            <v-card class="ma-auto right-card1" flat>
                                <v-alert dense outlined v-if="state.errorMessage !== null" type="error" show>
                                    {{ state.errorMessage }}
                                </v-alert>
                            </v-card>
                        </v-col>

                        <v-col cols="12" lg="12">
                            <v-card class="ma-auto right-card2" flat>
                                <!-- <v-responsive :aspect-ratio="1 / 1"> -->
                                <v-text-field class="mx-16 input" v-model="state.username" color="#051a1f"
                                    label="username"></v-text-field>
                                <v-text-field class="mx-16" v-model="state.password" color="#051a1f" label="Password"
                                    type="password"></v-text-field>
                                <v-btn dark width="" class="btn mx-16 mt-10" color="#051a1f" @click="login">
                                    Login
                                </v-btn>
                                <div class="text mx-16" style="visibility: hidden;">default :
                                    <div class="mx-16" style="visibility: hidden;">admin/admin</div>
                                    <div class="mx-16" style="visibility: hidden;">user01/0000</div>
                                    <div class="mx-16" style="visibility: hidden;">user02/0000</div>
                                    <div class="mx-16" style="visibility: hidden;">user03/0000</div>
                                </div>
                                <!-- <br/><br/><br/> -->
                                <div class="text mx-16">
                                    If you forgot your password you need to hard reset THERMAL
                                    FS device to the default settings. The default login
                                    credentials can be found on a label on the calibration
                                    certificate.
                                </div>
                                <!-- </v-responsive> -->
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-card>
    </div>
</template>
<script setup>
import { ref } from 'vue'
// import { useFetch } from '#app'
const { user, loggedIn } = useJwtAuth()
const { $jwtAuth } = useNuxtApp()
const router = useRouter()
const state = reactive({
    errorMessage: null,
    username: 'admin',
    password: 'admin'
})
const login = async () => {
    try {
        await $jwtAuth.login(
            {
                username: state.username,
                password: state.password,
                // expiresIn: '1d'
            },
            // optional callback function
            (data) => {
                // console.log(data)
                // navigateTo('/')
                // const cookie = useCookie("nuxt-jwt-auth-token");
                // console.log('cookie.value', cookie.value);
                // 设置新的过期时间为 7 天
                // authToken.value = authToken.value; // 保持当前的 Cookie 值
                // const authData = useState("data", () => cookie.value);
                // cookie.update({
                //     expires: new Date(Date.now() + 1 * 86400000),
                //     sameSite: "strict"
                // });
                window.location.replace('/')
            }
        )
    } catch (error) {
        // your error handling
        console.error('Login failed:', error)
        state.errorMessage = error.message
    }
    // try {
    //     const { data } = await useFetch('/api/login', {
    //         method: 'POST',
    //         body: { username: username.value, password: password.value }
    //     })

    //     // 在这里你可以将 token 存储到 localStorage 或 cookie 中
    //     console.log('Login successful, token:', data.value.token)
    // } catch (error) {
    //     console.error('Login failed:', error)
    // }
}
async function logout() {
    try {
        await $jwtAuth.logout()
    } catch (e) {
        // your error handling
    }
}
</script>
<style scoped>
.bgimg {
    position: absolute;
    z-index: 0;
    left: 0em;
    top: 0em;
}

.btn {
    width: 12em;
}

.text {
    z-index: 9999;
    font-size: 12px;
    text-align: justify;
    -moz-text-align-last: center;
    text-align-last: left;
    color: #828c8f;
}

.card {
    margin-top: 8em;
}

.left-card {
    background: linear-gradient(to right, #59595b, rgba(5, 26, 31, 1));
    border-radius: 5px 0px 0px 5px;
}

.right-card2 {
    border-radius: 0px 0px 5px 0px;
}

.right-card1 {
    border-radius: 0px 5px 0px 0px;
    height: 2.5em;
}

.logo {
    margin-top: 15em;
}

.input {
    margin-top: 5.5em;
}
</style>
