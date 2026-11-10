#!/usr/bin/env node
// Live-Smoke nach einem erfolgreichen Live-Deploy (C-011).
// Kein Merge-Gate: Aufruf nur aus .github/workflows/live-smoke.yml.
// Rot bei HTTP-Fehler, leerem #root/#app oder unbehandeltem JS-Fehler.
// Playwright wird im Runner neben dieser Datei installiert, nicht im App-Lockfile.

import { chromium } from 'playwright'

const url = process.argv[2]
if (!url || !url.startsWith('https://')) {
  console.error('Aufruf: node live-smoke.mjs <https-url>')
  process.exit(2)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (err) => {
  pageErrors.push(err && err.message ? err.message : String(err))
})
await page.addInitScript(() => {
  window.__vosSmokeRejections = []
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    const text = reason && reason.message ? reason.message : String(reason)
    window.__vosSmokeRejections.push(text.slice(0, 500))
  })
})

const failures = []
let status = 0
try {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
  status = response ? response.status() : 0
} catch (error) {
  failures.push(`Seite nicht geladen: ${error.message}`)
}

if (!status || status >= 400) {
  failures.push(`HTTP-Status ${status || 'kein Antwortobjekt'}`)
}

try {
  await page.waitForFunction(() => {
    const root = document.querySelector('#root, #app')
    return Boolean(root && root.childElementCount > 0)
  }, { timeout: 8000 })
} catch {
  // Leeres Root wird unten als Blackscreen gewertet.
}

const dom = await page.evaluate(() => {
  const root = document.querySelector('#root, #app')
  const text = (document.body?.innerText || '').replace(/\s+/g, ' ').trim()
  return {
    title: document.title,
    childCount: root ? root.childElementCount : null,
    textSample: text.slice(0, 180),
    rejections: window.__vosSmokeRejections || [],
  }
})

if (dom.childCount === null || dom.childCount === 0) {
  failures.push(
    `Blackscreen: #root/#app ohne Kindknoten (Titel „${dom.title}“, Text „${dom.textSample}“)`,
  )
}
for (const message of pageErrors) failures.push(`Unbehandelter JS-Fehler: ${message}`)
for (const message of dom.rejections) failures.push(`Unbehandelte Promise-Ablehnung: ${message}`)

console.log(
  `Live-Smoke ${url} HTTP ${status} Titel „${dom.title}“ Root-Kinder ${dom.childCount}`,
)
await browser.close()

if (failures.length) {
  for (const line of failures) console.error(line)
  console.error('Live-Smoke rot. Merge nicht anfassen. Im CTO-Tagesbericht melden.')
  process.exit(1)
}

console.log('Live-Smoke grün.')
