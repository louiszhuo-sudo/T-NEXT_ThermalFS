import { defineEventHandler, readBody } from 'h3'
import jsonwebtoken from 'jsonwebtoken'
import { readAuthUsers } from '../utils/auth-file'
export default defineEventHandler(async (event) => {
    const { username, password } = await readBody(event)

    // 验证用户名和密码（这里简单模拟）
    // console.log(await readBody(event));
    var data = await verify()
    if (data[0]) {
        // 使用 JWT 创建 token
        // const token = jsonwebtoken.sign({ username }, 'your-secret-key', { expiresIn: '1h' })
        const token = jsonwebtoken.sign({ username }, 'your-secret-key', { expiresIn: '1d' })
        return {
            token,
            "user": {
                "name": username,
                "permission": data[1]
            }
        }
        // 返回 token
        // return { token }
    } else {
        throw new Error('輸入的帳號或密碼可能有誤!!!')
    }
    async function verify() {
        const user = await readAuthUsers()
        
        const verify = user.find(element => element.uid === username)

        if (verify === undefined) {
            return [false]
        } else {
            if (verify.pwd === password) {
                // 判斷權限
                var permission = null
                if (verify.permission === 'admin') {
                    permission = ['admin', 'user', 'viewer']
                } else if (verify.permission === 'user') {
                    permission = ['user', 'viewer']
                } else if (verify.permission === 'viewer') {
                    permission = ['viewer']
                }
                else if (verify.permission === 'louis') {
                    permission = ['louis', 'admin', 'user', 'viewer']
                }
                else if (verify.permission === 'ray') {
                    permission = ['ray', 'admin', 'user', 'viewer']
                }
                return [true, permission]
            } else {
                return [false]
            }
        }
    }
})
