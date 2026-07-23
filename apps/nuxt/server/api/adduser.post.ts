
import { defineEventHandler, readBody } from 'h3'
import { readAuthUsers, writeAuthUsers, type AuthUser } from '../utils/auth-file'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<AuthUser>(event) // 取得使用者傳送的資料
        const userList = await readAuthUsers()

        // 檢查使用者是否已存在
        const existingUser = userList.find(user => user.uid === body.uid)
        if (existingUser) {
            return { error: '使用者已存在' }
        }

        userList.push(body) // 將新使用者加入到使用者列表
        await writeAuthUsers(userList)

        return { message: '新增使用者成功' }
    } catch (error) {
        console.error(error)
        return { error: '新增使用者失敗' }
    }
})
