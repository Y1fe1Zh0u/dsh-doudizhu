import { readFile, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const root = new URL('../', import.meta.url)
const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
const sections = ['dependencies', 'peerDependencies', 'optionalDependencies', 'devDependencies']
for (const section of sections) {
  for (const [name, spec] of Object.entries(manifest[section] ?? {})) {
    if (/^(?:workspace|link|file):/u.test(String(spec))) {
      throw new Error(`${section}.${name} uses forbidden local dependency ${JSON.stringify(spec)}`)
    }
  }
}

const packed = spawnSync('npm', ['pack', '--json', '--ignore-scripts'], {
  cwd: new URL('.', root),
  encoding: 'utf8',
})
if (packed.status !== 0) throw new Error(packed.stderr || packed.stdout || 'npm pack failed')
const result = JSON.parse(packed.stdout)[0]
if (result?.filename === undefined || !Array.isArray(result.files)) throw new Error('npm pack returned no file inventory')

const allowed = /^(?:package\/(?:package\.json|README(?:\.zh)?\.md|LICENSE|NOTICE|THIRD_PARTY_NOTICES\.md|cordis\.patch\.yml|LICENSES\/[^/]+|lib\/.+))$/u
const forbidden = /(?:^|\/)(?:src|tests|packages|apps|vendor)(?:\/|$)|deepseek-harness|node_modules/u
try {
  for (const file of result.files) {
    const path = `package/${file.path}`
    if (!allowed.test(path)) throw new Error(`pack allowlist rejected ${path}`)
    if (forbidden.test(path)) throw new Error(`no-core guard rejected ${path}`)
  }
  const runtimeFiles = result.files.filter(file => /^lib\/.*\.js$/u.test(file.path))
  for (const file of runtimeFiles) {
    const text = await readFile(new URL(file.path, root), 'utf8')
    if (/deepseek-harness|packages\/(?:core|apps|vendor|experimental)|workspace:|link:|file:/mu.test(text)) {
      throw new Error(`no-core guard found a private repository reference in ${file.path}`)
    }
  }
  const typertHost = await readFile(new URL('lib/typert.host.js', root), 'utf8')
  if (!typertHost.includes("package: 'dsh-doudizhu'")) {
    throw new Error('Typert Host manifest must be owned by the installable root package')
  }
  process.stdout.write(`pack guard passed: ${result.files.length} files, ${result.size} bytes\n`)
} finally {
  await rm(new URL(result.filename, root), { force: true })
}
