import { defineConfig } from 'tsdown'

const external = /^(?:@deepseek-ai\/|ws(?:\/|$)|zod(?:\/|$))/u

export default defineConfig({
  entry: {
    index: 'lib/types/index.js',
    invariant: 'lib/types/invariant.js',
    room: 'lib/types/room/index.js',
    'room-invariant': 'lib/types/room/invariant.js',
    agent: 'lib/types/agent/index.js',
    'agent-invariant': 'lib/types/agent/invariant.js',
    persistence: 'lib/types/persistence/index.js',
    'persistence-invariant': 'lib/types/persistence/invariant.js',
    transport: 'lib/types/transport/index.js',
    'transport-invariant': 'lib/types/transport/invariant.js',
    doudizhu: 'lib/types/doudizhu/index.js',
    'doudizhu-invariant': 'lib/types/doudizhu/invariant.js',
    'doudizhu-runtime': 'lib/types/doudizhu-runtime/index.js',
    'doudizhu-runtime-invariant': 'lib/types/doudizhu-runtime/invariant.js',
  },
  outDir: 'lib',
  format: 'esm',
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: false,
  deps: {
    neverBundle: specifier => external.test(specifier),
    alwaysBundle: specifier => !external.test(specifier),
  },
})
