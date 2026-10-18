import { chromium } from 'playwright-core'

const out = 'C:/Users/bmura/AppData/Local/Temp/opencode/shots'
const exe = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: exe, headless: true })

const d = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const p = await d.newPage()
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' })
await p.waitForTimeout(1600)
await p.screenshot({ path: `${out}/r1-desktop.png` })

const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const mp = await m.newPage()
await mp.goto('http://localhost:4173', { waitUntil: 'networkidle' })
await mp.waitForTimeout(1600)
await mp.screenshot({ path: `${out}/r2-mobile.png` })

await browser.close()
console.log('done')
