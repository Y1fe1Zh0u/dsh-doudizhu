import { defineConfig } from 'vitest/config'
import ts from 'typescript'

export default defineConfig({
  plugins: [{
    name: 'standard-decorators',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.ts') || !/^\s*@[A-Za-z_$][\w$]*/mu.test(code)) return null
      const result = ts.transpileModule(code, {
        fileName: id,
        compilerOptions: {
          target: ts.ScriptTarget.ES2024,
          module: ts.ModuleKind.ESNext,
          sourceMap: true,
        },
      })
      return { code: result.outputText, map: result.sourceMapText }
    },
  }],
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.ts', 'tests/**/*.spec.tsx'],
  },
})
