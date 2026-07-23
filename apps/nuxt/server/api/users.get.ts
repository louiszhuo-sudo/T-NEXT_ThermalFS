import { defineEventHandler } from 'h3'
import { readAuthUsers } from '../utils/auth-file'
export default defineEventHandler(async (event) => {
    return readAuthUsers()
})
