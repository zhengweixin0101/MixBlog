import hljs from 'highlight.js/lib/common'
import xml from 'highlight.js/lib/languages/xml'
import bash from 'highlight.js/lib/languages/bash'
import powershell from 'highlight.js/lib/languages/powershell'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import nginx from 'highlight.js/lib/languages/nginx'
import julia from 'highlight.js/lib/languages/julia'
import dart from 'highlight.js/lib/languages/dart'
import scala from 'highlight.js/lib/languages/scala'
import haskell from 'highlight.js/lib/languages/haskell'
import erlang from 'highlight.js/lib/languages/erlang'
import matlab from 'highlight.js/lib/languages/matlab'
import protobuf from 'highlight.js/lib/languages/protobuf'
import latex from 'highlight.js/lib/languages/latex'

const EXTRA_LANGUAGES = {
  xml,
  bash,
  powershell,
  dockerfile,
  nginx,
  julia,
  dart,
  scala,
  haskell,
  erlang,
  matlab,
  protobuf,
  latex
}

for (const [name, definition] of Object.entries(EXTRA_LANGUAGES)) {
  if (!hljs.getLanguage(name)) hljs.registerLanguage(name, definition)
}

const PUNCTUATED_ALIASES = {
  'c++': 'cpp',
  'cxx': 'cpp',
  'cc': 'cpp',
  'hpp': 'cpp',
  'c++/cli': 'cpp',
  'c#': 'csharp',
  'f#': 'fsharp',
  'objc': 'objectivec',
  'objective-c': 'objectivec',
  'obj-c': 'objectivec'
}

const EXTRA_ALIASES = {
  xml: ['html', 'xhtml', 'svg', 'vue', 'svelte'],
  bash: ['sh', 'zsh', 'shell-session', 'console', 'shellsession'],
  powershell: ['ps', 'ps1', 'pwsh'],
  dockerfile: ['docker'],
  julia: ['jl'],
  haskell: ['hs'],
  erlang: ['erl'],
  protobuf: ['proto'],
  latex: ['tex'],
  json: ['json5', 'jsonc'],
  plaintext: ['mermaid', 'text', 'plain', 'output', 'log', 'none', 'language']
}

for (const [languageName, aliases] of Object.entries(EXTRA_ALIASES)) {
  if (hljs.getLanguage(languageName)) hljs.registerAliases(aliases, { languageName })
}

let canonicalMap = null

function buildCanonicalMap() {
  const map = new Map()
  for (const name of hljs.listLanguages()) {
    const language = hljs.getLanguage(name)
    map.set(name, name)
    for (const alias of language?.aliases || []) map.set(alias, name)
  }
  for (const [languageName, aliases] of Object.entries(EXTRA_ALIASES)) {
    for (const alias of aliases) {
      if (hljs.getLanguage(alias)) map.set(alias, languageName)
    }
  }
  for (const [alias, name] of Object.entries(PUNCTUATED_ALIASES)) {
    if (hljs.getLanguage(name)) map.set(alias, name)
  }
  return map
}

export function normalizeLanguage(raw) {
  if (!canonicalMap) canonicalMap = buildCanonicalMap()
  const key = String(raw || '').trim().toLowerCase()
  if (!key) return 'plaintext'
  return canonicalMap.get(key) || 'plaintext'
}

export function decodeHtmlEntities(str) {
  return String(str)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x0?27;/gi, "'")
    .replace(/&amp;/g, '&')
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function highlightToHtml(code, rawLanguage) {
  const language = normalizeLanguage(rawLanguage)
  try {
    return hljs.highlight(code, { language, ignoreIllegals: true }).value
  } catch {
    return escapeHtml(code)
  }
}

export default hljs