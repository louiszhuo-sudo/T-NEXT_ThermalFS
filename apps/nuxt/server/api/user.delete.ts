import { defineEventHandler, readBody } from 'h3'
import { readAuthUsers, writeAuthUsers } from '../utils/auth-file'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event) // 取得使用者傳送的資料
        const userList = await readAuthUsers()

        // 檢查使用者是否存在
        const userIndex = userList.findIndex(user => user.uid === body.uid)
        if (userIndex === -1) {
            return { error: '使用者不存在' }
        }

        userList.splice(userIndex, 1) // 從使用者列表中移除使用者
        await writeAuthUsers(userList)

        return { message: '刪除使用者成功' }
    } catch (error) {
        console.error(error)
        return { error: '刪除使用者失敗' }
    }
})
