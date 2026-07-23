// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { zhHant } from 'vuetify/locale' // ⬅️ 引入繁體中文語系

export default defineNuxtPlugin((app) => {
    const vuetify = createVuetify({
        // ... your configuration
        locale: {
            locale: 'zhHant',    // ⬅️ 使用繁體中文
            fallback: 'en',
            messages: { zhHant },
        }
    })
    app.vueApp.use(vuetify)
})