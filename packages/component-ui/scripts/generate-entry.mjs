import fs from 'node:fs'
import path from 'node:path'

const componentsDir = path.resolve('src/components')
const entryFile = path.resolve('src/index.ts')

const components = fs
  .readdirSync(componentsDir, { withFileTypes: true })
  .filter(item => item.isDirectory())
  .map(item => item.name)
  .sort()

const modules = ['theme', 'locale', 'preferences']
  .map(name => `export * from './${name}'`)
  .join('\n')

const content = [
  ...components.map(name => `export * from './components/${name}'`),
  modules,
].filter(Boolean).join('\n')

fs.writeFileSync(entryFile, `${content}\n`)
