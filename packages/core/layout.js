// ESM wrapper for napi-rs generated CommonJS bindings
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const native = require('./index.cjs')

export const LayoutTree = native.LayoutTree
