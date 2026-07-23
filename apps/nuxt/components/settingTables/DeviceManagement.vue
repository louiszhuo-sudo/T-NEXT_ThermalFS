<template>
  <div class="device-tree">
    <div v-if="props.userName.name === 'admin'">
      <div v-for="(server, index) in servers" :key="server.server_name" class="server-area">
        <div @click="toggleServer(index)" class="server-item pa-2">
          <v-icon>{{ serverStates[index] ? 'mdi-menu-down' : 'mdi-menu-right' }}</v-icon>
          <v-icon size="x-small" color="green">mdi-circle</v-icon>
          {{ server.server_name }} {{ server.server_info }}
        </div>
        <div v-if="serverStates[index]">
          <div v-for="deviceType in getSectionKeys(server)" :key="deviceType" class="type-area ma-4">
            <div @click="toggleDeviceType(index, deviceType)" class="pa-2 type-item">
              <v-icon>{{ deviceTypeStates[index]?.[deviceType] ? 'mdi-menu-down' : 'mdi-menu-right' }}</v-icon>
              {{ server[deviceType].title }} ({{ server[deviceType].data?.length || 0 }})
            </div>

            <div v-if="deviceTypeStates[index]?.[deviceType]">
              <div v-for="(device, deviceIndex) in server[deviceType].data" :key="deviceIndex" class="type-area ma-4">
                <div @click="toggleDevice(index, deviceType, deviceIndex)" class="pa-2 type-item">
                  <v-icon>{{ deviceStates[index]?.[deviceType]?.[deviceIndex] ? 'mdi-menu-down' : 'mdi-menu-right'
                    }}</v-icon>
                  <v-icon size="x-small" color="green">mdi-circle</v-icon>
                  {{ device.title }}
                </div>

                <div v-if="deviceStates[index]?.[deviceType]?.[deviceIndex]">
                  <div v-for="(subDevice, subIndex) in device['data:']" :key="subIndex" class="ma-4">
                    <div class="table-container">
                      <div class="d-flex align-center ">
                        <div class="flex-grow-1">
                          <table class="custom-table">
                            <thead>
                              <tr>
                                <th @click="toggleSubDevice(index, deviceType, deviceIndex, subIndex)"
                                  class="text-left cursor-pointer type-item">
                                  <v-icon>{{ subDeviceStates[index]?.[deviceType]?.[deviceIndex]?.[subIndex] ?
                                    'mdi-menu-down' : 'mdi-menu-right' }}</v-icon>
                                  {{ subDevice.title }}
                                </th>
                                <th v-for="header in subDevice.header" :key="header.key" class="text-center type-item"
                                  v-if="subDeviceStates[index]?.[deviceType]?.[deviceIndex]?.[subIndex]">
                                  {{ header.title }}
                                </th>
                                <th class="text-left cursor-pointer type-item">
                                </th>
                              </tr>
                            </thead>
                            <tbody
                              v-if="subDeviceStates[index]?.[deviceType]?.[deviceIndex]?.[subIndex] && subDevice['data:']?.length > 0">
                              <tr v-for="(row, rowIndex) in subDevice['data:']" :key="rowIndex">
                                <td class="text-left"></td>
                                <!-- <td v-for="header in subDevice.header" :key="header.key" class="text-center"> -->
                                <!-- {{ row[header.key] }} -->
                                <td class="text-center my-auto"><v-icon size="x-small" color="green">mdi-circle</v-icon>
                                  {{ row.name }}</td>
                                <td class="text-center"> {{ row.brand }}</td>
                                <td class="text-center"> {{ row.model }}</td>
                                <td class="text-center"> {{ row.ip }}</td>
                                <td class="text-center"> {{ row.mac }}</td>
                                <td class="text-center"><input type="checkbox" :checked="row.select === 1"> </td>
                                <td class="text-center"><v-icon size="small">mdi-dots-horizontal-circle-outline</v-icon>
                                </td>

                                <!-- </td> -->
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>暫無權限訪問</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const { $getIpaddress } = useNuxtApp()
// 定義 props
const props = defineProps(['userName'])

const servers = ref([])
const ws3 = ref(null)

// States for different levels
const serverStates = ref([])
const deviceTypeStates = ref({})
const deviceStates = ref({})
const subDeviceStates = ref({})

// Initialize all states
const initializeStates = (serverData) => {
  // 所有服務器預設展開
  serverStates.value = serverData.map(() => true)

  serverData.forEach((server, serverIndex) => {
    deviceTypeStates.value[serverIndex] = {}
    deviceStates.value[serverIndex] = {}
    subDeviceStates.value[serverIndex] = {}

    const deviceTypes = getSectionKeys(server)
    deviceTypes.forEach(deviceType => {
      // 所有設備類型預設展開
      deviceTypeStates.value[serverIndex][deviceType] = true

      deviceStates.value[serverIndex][deviceType] = {}
      subDeviceStates.value[serverIndex][deviceType] = {}

      if (server[deviceType].data) {
        server[deviceType].data.forEach((_, deviceIndex) => {
          // 所有設備預設展開
          deviceStates.value[serverIndex][deviceType][deviceIndex] = true
          subDeviceStates.value[serverIndex][deviceType][deviceIndex] = {}

          // 所有子設備預設展開
          if (server[deviceType].data[deviceIndex]['data:']) {
            server[deviceType].data[deviceIndex]['data:'].forEach((_, subIndex) => {
              if (!subDeviceStates.value[serverIndex][deviceType][deviceIndex]) {
                subDeviceStates.value[serverIndex][deviceType][deviceIndex] = {}
              }
              subDeviceStates.value[serverIndex][deviceType][deviceIndex][subIndex] = true
            })
          }
        })
      }
    })
  })
}

const getSectionKeys = (server) => {
  return Object.keys(server).filter(key =>
    !['server_name', 'server_info', 'title'].includes(key)
  )
}

const toggleServer = (index) => {
  serverStates.value[index] = !serverStates.value[index]
}

const toggleDeviceType = (serverIndex, deviceType) => {
  if (!deviceTypeStates.value[serverIndex]) {
    deviceTypeStates.value[serverIndex] = {}
  }
  deviceTypeStates.value[serverIndex][deviceType] = !deviceTypeStates.value[serverIndex][deviceType]
}

const toggleDevice = (serverIndex, deviceType, deviceIndex) => {
  if (!deviceStates.value[serverIndex]) {
    deviceStates.value[serverIndex] = {}
  }
  if (!deviceStates.value[serverIndex][deviceType]) {
    deviceStates.value[serverIndex][deviceType] = {}
  }
  deviceStates.value[serverIndex][deviceType][deviceIndex] =
    !deviceStates.value[serverIndex][deviceType][deviceIndex]
}

const toggleSubDevice = (serverIndex, deviceType, deviceIndex, subIndex) => {
  if (!subDeviceStates.value[serverIndex]) {
    subDeviceStates.value[serverIndex] = {}
  }
  if (!subDeviceStates.value[serverIndex][deviceType]) {
    subDeviceStates.value[serverIndex][deviceType] = {}
  }
  if (!subDeviceStates.value[serverIndex][deviceType][deviceIndex]) {
    subDeviceStates.value[serverIndex][deviceType][deviceIndex] = {}
  }
  subDeviceStates.value[serverIndex][deviceType][deviceIndex][subIndex] =
    !subDeviceStates.value[serverIndex][deviceType][deviceIndex][subIndex]
}

const getDeviceList = () => {
  if (ws3.value && ws3.value.readyState === WebSocket.OPEN) {
    ws3.value.send(JSON.stringify({
      "feature": "device",
      "method": "query_deviceMatching",
      "content": {},
      "session": "sckji8452s"
    }))
  }
}

const getWebSocket3 = () => {
  ws3.value = new WebSocket(`ws://${$getIpaddress()}:8703`)
  ws3.value.onopen = () => {
    console.log("WebSocket3 connected")
    getDeviceList()
  }
  ws3.value.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.feature === "device" && data.method === "query_deviceMatching") {
      servers.value = data.content
      initializeStates(data.content)
    }
  }
}

onMounted(() => {
  getWebSocket3()
})
</script>

<style scoped>
.device-tree {
  margin: 10px;
}

.server-area {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.server-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #FFF2DE;
  cursor: pointer;
}

.type-area {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.type-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #F1F1F1;
  cursor: pointer;
}

.device-type {
  margin-left: 20px;
  padding: 4px;
  cursor: pointer;
}

/* New table styles */
.table-container {
  width: 100%;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.custom-table th,
.custom-table td {
  /* border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0; */
  border: 1px solid #e0e0e0;
  padding: 8px;
  word-wrap: break-word;
}
</style>