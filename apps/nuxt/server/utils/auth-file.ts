import { promises as fs } from 'node:fs'
import path from 'node:path'

export interface AuthUser {
    uid: string
    pwd: string
    permission: string
    [key: string]: unknown
}

export function resolveAuthFilePath() {
    const configuredPath = process.env.THERMALFS_AUTH_FILE?.trim()
    return configuredPath
        ? path.resolve(configuredPath)
        : path.resolve(process.cwd(), 'auth.json')
}

export async function readAuthUsers() {
    const contents = await fs.readFile(resolveAuthFilePath(), 'utf8')
    return JSON.parse(contents) as AuthUser[]
}

export async function writeAuthUsers(users: AuthUser[]) {
    const authFilePath = resolveAuthFilePath()
    await fs.mkdir(path.dirname(authFilePath), { recursive: true })

    const temporaryPath = `${authFilePath}.tmp`
    await fs.writeFile(temporaryPath, JSON.stringify(users, null, 2), 'utf8')
    await fs.rename(temporaryPath, authFilePath)
}
