import { marked } from 'marked'

export async function loadMarkdown(url) {
  const res = await fetch(url)
  const raw = await res.text()
  return marked(raw)
}
