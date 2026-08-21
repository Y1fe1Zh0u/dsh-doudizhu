import { copyFile, mkdir } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
await mkdir(new URL('lib/', root), { recursive: true })
for (const file of [
  'typert.host.js',
  'typert.host.d.ts',
  'typert.remote-client.js',
  'typert.remote-client.d.ts',
]) {
  await copyFile(new URL(`generated/${file}`, root), new URL(`lib/${file}`, root))
}
