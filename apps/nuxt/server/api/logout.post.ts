import { defineEventHandler, readBody } from 'h3'
import { promises as fs } from 'fs'
export default defineEventHandler(async (event) => {
    // const getUserList = await fs.readFile('./auth.json', 'utf-8');
    // const user = JSON.parse(getUserList)
    return {}
})