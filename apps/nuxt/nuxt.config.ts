// https://nuxt.com/docs/api/configuration/nuxt-config
import fs from 'fs'
import path from 'path'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  // app 設定
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      titleTemplate: '%s - ThermalFS',
      title: 'ThermalFS',
      htmlAttrs: {
        lang: 'zh-TW'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: '/css/leaflet.css' },
        { rel: 'stylesheet', href: '/css/Leaflet.GeotagPhoto.css' },
        { rel: 'stylesheet', href: '/css/gridstack.min.css' },
        // { rel: 'stylesheet', href: '/css/daterangepicker.css' }
      ],
      script: [
        { src: '/js/echarts.js' },
        { src: '/js/leaflet.js' },
        { src: '/js/Leaflet/js/leaflet.markercluster.js' },
        { src: '/js/Leaflet/js/leaflet.geometryutil.js' },
        { src: '/js/turf.min.js' },
        // { src: '/js/L.PixiOverlay.js' },
        { src: '/js/crypto-js.min.js' },
        { src: '/js/gridstack-all.js' },
        { src: '/js/events.js' },
        { src: '/js/hls.js@latest.js' },
        // { src: '/js/date/jquery.min.js' },
        // { src: '/js/date/moment.min.js' },
        // { src: '/js/date/daterangepicker.min.js' }
      ]
    }
  },
  plugins: [
    {
      src: '~/plugins/vuetify.ts',
    }, {
      src: '~/plugins/webscoket.js',
      ssr: false
    }
    , {
      src: '~/plugins/authPermission.js'
    }
  ],
  css: ['@mdi/font/css/materialdesignicons.min.css', 'video.js/dist/video-js.css'],
  // 預設
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    'nuxt-echarts',
    'nuxt-jwt-auth',
    '@nuxt/image',
    'nuxt-proxy-request',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config, { isServer }) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
        if (isServer) {
          config.resolve ||= {}
          config.resolve.alias ||= {}
          Object.assign(config.resolve.alias, {
            leaflet: path.resolve(__dirname, 'shims/leaflet.server.ts'),
            'leaflet/dist/leaflet-src.esm': path.resolve(__dirname, 'shims/leaflet.server.ts'),
            'leaflet/dist/leaflet-src.js': path.resolve(__dirname, 'shims/leaflet.server.ts'),
          })
        }
      })
    },
    //...
  ],
  echarts: {
    charts: ['BarChart'],
    components: ['DatasetComponent', 'GridComponent', 'TooltipComponent'],
  },
  nuxtJwtAuth: {
    baseUrl: `/api`, // API 服務位置
    // baseUrl: 'http://192.168.0.173:3001/api', // API 服務位置
    // baseUrl: 'http://192.168.0.182:3001/api', // API 服務位置

    endpoints: {
      login: '/login', // 登入使用者代理 (POST)
      logout: '/logout', // 登出使用者帳號代理 (POST)
      user: '/user', // 查詢user代理 (GET)
      signup: '/signup' // 註冊帳號代理 (POST)
    },
    redirects: {
      home: '/', // 登入後重定向到指定的位置
      login: '/login', // 如果還沒登入會重定向指定位置
      logout: '/logout' // 如果已登入的使用者到訪客頁面，會被導向到這邊
    }
  },
  proxy: {
    options: [
      {
        target: 'http://localhost:8889',
        // target: 'http://192.168.0.128:8889',
        pathFilter: ['/video/**/**'],
        // pathRewrite: {
        // '^/video': ''
        // }
      }
    ]
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  devServer: {
    host: '0.0.0.0', // Louis
    port: 3000
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, '192.168.0.173+2-key.pem'), 'utf8'),
    //   cert: fs.readFileSync(path.resolve(__dirname, '192.168.0.173+2.pem'), 'utf8'),
    // }
  },
})
