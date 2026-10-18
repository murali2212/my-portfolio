import { chromium } from 'playwright-core'

const base = process.argv[2] || 'http://localhost:5175'
const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const ORDER = [
  'cognitive-engine', 'teamhub-mcp', 'cura', 'ai-automation', 'interview-agent',
  'dualstream-player', 'journey', 'factorybrain', 'experimental-ai',
]

const results = []
const log = (name, pass, extra = {}) => {
  results.push({ name, pass: !!pass })
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${Object.keys(extra).length ? ' ' + JSON.stringify(extra) : ''}`)
}

const browser = await chromium.launch({ executablePath: EXE, headless: true })
const issues = []
const watch = (p) => {
  p.on('console', async (m) => {
    if (m.type() !== 'error') return
    let extra = ''
    try {
      const vals = await Promise.all(m.args().map((a) => a.jsonValue().catch(() => null)))
      extra = vals.filter((v) => v != null).map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ')
    } catch { /* ignore */ }
    issues.push('error: ' + (m.text() + ' ' + extra).slice(0, 220))
  })
  p.on('pageerror', (e) => issues.push('pageerror: ' + e.message))
}

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
watch(page)

// ---------- HOMEPAGE ----------
await page.goto(base + '/', { waitUntil: 'networkidle' })
const home = await page.evaluate(() => ({
  slider: !!document.querySelector('.project-showcase'),
  articles: document.querySelectorAll('#projects article').length,
  hrefs: [...document.querySelectorAll('#projects article a')].map((a) => a.getAttribute('href')),
  viewAll: [...document.querySelectorAll('a')].find((a) => /view all projects/i.test(a.textContent || ''))?.getAttribute('href'),
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}))
log('home_4_featured', home.articles === 4 && JSON.stringify(home.hrefs) === JSON.stringify([
  '/projects/cognitive-engine', '/projects/teamhub-mcp', '/projects/cura', '/projects/ai-automation',
]), { hrefs: home.hrefs })
log('home_no_slider', !home.slider)
log('home_view_all', home.viewAll === '/projects', { viewAll: home.viewAll })
log('home_no_overflow', home.overflowX === 0)

const h1 = await page.evaluate(() => document.documentElement.scrollHeight)
await page.waitForTimeout(700)
const h2 = await page.evaluate(() => document.documentElement.scrollHeight)
log('home_no_layout_shift', h1 === h2, { h1, h2 })

// ---------- PROJECTS PAGE ----------
await page.goto(base + '/projects', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
// lazy-loaded covers: wait until every slide cover finishes decoding
await page.waitForFunction(() => {
  const imgs = [...document.querySelectorAll('.project-showcase img')]
  return imgs.length >= 9 && imgs.every((i) => i.complete && i.naturalWidth > 0)
}, { timeout: 5000 }).catch(() => {})

const pp = await page.evaluate(() => {
  const showcase = document.querySelector('.project-showcase')
  const slideLinks = showcase ? [...showcase.querySelectorAll('.swiper-slide a[href^="/projects/"]')] : []
  const unique = [...new Set(slideLinks.map((a) => a.getAttribute('href')))]
  const anyGrid = !!document.querySelector('#projects article')
  const covers = showcase ? [...showcase.querySelectorAll('img')].map((img) => ({
    src: img.getAttribute('src'),
    loaded: img.complete && img.naturalWidth > 0,
  })) : []
  return {
    hasSlider: !!showcase,
    slideCount: showcase ? showcase.querySelectorAll('.swiper-slide').length : 0,
    unique,
    gridBelow: anyGrid,
    covers,
    bodyText: document.body.innerText,
    buttons: document.querySelectorAll('#projects button, #projects [role="button"], #projects [aria-label*="next" i], #projects [aria-label*="previous" i], #projects .swiper-pagination, #projects [role="tablist"]').length,
    dots: document.querySelectorAll('.swiper-pagination, .swiper-pagination-bullet').length,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    docScrollY: getComputedStyle(document.documentElement).overflowY,
  }
})

const expected = ORDER.map((s) => `/projects/${s}`)
log('projects_only_slider', pp.hasSlider && !pp.gridBelow, { hasSlider: pp.hasSlider, gridBelow: pp.gridBelow })
log('projects_all9_in_slider', JSON.stringify([...pp.unique].sort()) === JSON.stringify([...expected].sort()), { unique: pp.unique })
log('projects_slide_count_min', pp.slideCount >= 9, { slideCount: pp.slideCount })
log('no_image_pending', !pp.bodyText.includes('IMAGE PENDING') && !pp.bodyText.toLowerCase().includes('image pending'))
log('covers_loaded', pp.covers.length >= 9 && pp.covers.every((c) => c.loaded && c.src?.startsWith('/covers/')), { count: pp.covers.length, bad: pp.covers.filter((c) => !c.loaded || !c.src?.startsWith('/covers/')) })
log('no_controls', pp.buttons === 0 && pp.dots === 0, { buttons: pp.buttons, dots: pp.dots })
log('projects_no_overflow', pp.overflowX === 0, { overflowX: pp.overflowX })

// scroll slider into view
await page.evaluate(() => document.querySelector('.project-showcase').scrollIntoView({ block: 'center' }))
await page.waitForTimeout(400)

// visual states: active dominant, sides covered/faded/depth
const vis = await page.evaluate(() => {
  const active = document.querySelector('.project-showcase .swiper-slide-active')
  const next = document.querySelector('.project-showcase .swiper-slide-next')
  const prev = document.querySelector('.project-showcase .swiper-slide-prev')
  if (!active || !next || !prev) return null
  const read = (slide) => {
    const inner = slide.querySelector('.slide-inner')
    const st = getComputedStyle(inner)
    return {
      scale: new DOMMatrixReadOnly(st.transform).a,
      opacity: Number(st.opacity),
      filter: st.filter,
      slideTransform: slide.style.transform || '',
      z: getComputedStyle(slide).zIndex,
      rect: (() => { const r = slide.getBoundingClientRect(); return { left: r.left, right: r.right, w: r.width } })(),
    }
  }
  return { active: read(active), next: read(next), prev: read(prev) }
})
const sideRotated = /rotateY\(-?[\d.]+deg\)/.test(vis.next.slideTransform) && /rotateY\(-?[\d.]+deg\)/.test(vis.prev.slideTransform)
const depthBehind = /translateZ\(-/.test(vis.next.slideTransform) || /translate3d\([^)]*,\s*[^)]*,\s*-/.test(vis.next.slideTransform)
log('center_larger', vis.active.scale > vis.next.scale + 0.05, { active: +vis.active.scale.toFixed(3), side: +vis.next.scale.toFixed(3) })
log('center_sharper_faded_sides', vis.active.filter === 'none' && vis.next.filter !== 'none' && vis.active.opacity > 0.95 && vis.next.opacity < 0.7, {
  activeOp: vis.active.opacity, sideOp: vis.next.opacity, sideFilter: vis.next.filter,
})
log('sides_depth_rotation', sideRotated && depthBehind, { nextTransform: vis.next.slideTransform.slice(0, 120) })
log('center_covers_sides', Number(vis.active.z) > Number(vis.next.z), { zActive: vis.active.z, zSide: vis.next.z })

// ---------- DRAG ----------
const readWrapper = () => page.evaluate(() => {
  const w = document.querySelector('.project-showcase .swiper-wrapper')
  return new DOMMatrixReadOnly(getComputedStyle(w).transform).m41
})
const activeSlug = () => page.evaluate(() =>
  document.querySelector('.project-showcase .swiper-slide-active a')?.getAttribute('href'))

const geom = await page.evaluate(() => {
  const r = document.querySelector('.project-showcase').getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
})

// drag LEFT: wrapper moves left (translate decreases)
const w0 = await readWrapper()
const s0 = await activeSlug()
await page.mouse.move(geom.x, geom.y)
await page.mouse.down()
const samples = []
for (let i = 1; i <= 14; i++) {
  await page.mouse.move(geom.x - i * 30, geom.y)
  await page.waitForTimeout(12)
  samples.push(await readWrapper())
}
await page.mouse.up()
await page.waitForTimeout(900)
const w1 = await readWrapper()
const s1 = await activeSlug()
const leftMoved = samples.length && samples[samples.length - 1] < w0 - 100
let smooth = true
for (let i = 1; i < samples.length; i++) if (samples[i] - samples[i - 1] > 5) smooth = false // moving left => decreasing, no big backward jump mid-drag
log('drag_left_moves', leftMoved, { from: +w0.toFixed(0), to: +samples[samples.length - 1].toFixed(0) })
log('drag_smooth_no_jump', smooth && s1 !== s0, { from: s0, to: s1 })

// drag does NOT navigate
log('drag_no_click_nav', new URL(page.url()).pathname === '/projects', { url: new URL(page.url()).pathname })

// drag RIGHT
const w2 = await readWrapper()
const s2 = await activeSlug()
await page.mouse.move(geom.x, geom.y)
await page.mouse.down()
for (let i = 1; i <= 14; i++) {
  await page.mouse.move(geom.x + i * 30, geom.y)
  await page.waitForTimeout(12)
}
const w3 = await readWrapper()
await page.mouse.up()
await page.waitForTimeout(900)
const s3 = await activeSlug()
log('drag_right_moves', w3 > w2 + 100 && s3 !== s2, { from: +w2.toFixed(0), to: +w3.toFixed(0), fromSlug: s2, toSlug: s3 })
log('drag_right_no_nav', new URL(page.url()).pathname === '/projects')

// infinite loop both directions: walk forward ~11 advances, collect slugs
const seq = [await activeSlug()]
for (let k = 0; k < 11; k++) {
  await page.mouse.move(geom.x, geom.y)
  await page.mouse.down()
  for (let i = 1; i <= 14; i++) {
    await page.mouse.move(geom.x - i * 35, geom.y)
    await page.waitForTimeout(10)
  }
  await page.mouse.up()
  await page.waitForTimeout(850)
  seq.push(await activeSlug())
}
const idx = (s) => ORDER.indexOf((s || '').replace('/projects/', ''))
let cyclicFwd = true
for (let i = 1; i < seq.length; i++) {
  const d = ((idx(seq[i]) - idx(seq[i - 1])) % 9 + 9) % 9
  if (d < 1 || d > 4) cyclicFwd = false
}
const visited = new Set(seq.map((s) => (s || '').replace('/projects/', '')))
log('loop_forward_cyclic', cyclicFwd && visited.size >= 8, { seq: seq.map((s) => (s || '').replace('/projects/', '')) })

// walk backward
const seqB = [await activeSlug()]
for (let k = 0; k < 11; k++) {
  await page.mouse.move(geom.x, geom.y)
  await page.mouse.down()
  for (let i = 1; i <= 14; i++) {
    await page.mouse.move(geom.x + i * 35, geom.y)
    await page.waitForTimeout(10)
  }
  await page.mouse.up()
  await page.waitForTimeout(850)
  seqB.push(await activeSlug())
}
let cyclicBwd = true
for (let i = 1; i < seqB.length; i++) {
  const d = ((idx(seqB[i]) - idx(seqB[i - 1])) % 9 + 9) % 9
  if (d !== 0 && d < 5) cyclicBwd = false // backwards => forward-delta 5..8
}
const visitedB = new Set(seqB.map((s) => (s || '').replace('/projects/', '')))
log('loop_backward_cyclic', cyclicBwd && visitedB.size >= 8, { seq: seqB.map((s) => (s || '').replace('/projects/', '')) })

// trackpad: horizontal wheel moves slider (real input events)
// note: loop wrap can return wrapper tx to same value while slides reorder;
// assert active slug moved backward instead of raw tx delta
const pw0 = await activeSlug()
await page.mouse.move(geom.x, geom.y)
for (let i = 0; i < 6; i++) {
  await page.mouse.wheel(-80, 0)
  await page.waitForTimeout(40)
}
await page.waitForTimeout(900)
const pw1 = await activeSlug()
const pd = ((idx(pw1) - idx(pw0)) % 9 + 9) % 9
log('trackpad_horizontal', pd >= 5 && pd <= 8, { from: pw0, to: pw1, step: pd })

// click active opens correct detail
const target = await page.evaluate(() => {
  const a = document.querySelector('.project-showcase .swiper-slide-active a')
  const r = a.getBoundingClientRect()
  return { href: a.getAttribute('href'), x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 140) }
})
await page.mouse.click(target.x, target.y)
await page.waitForTimeout(700)
const afterClick = new URL(page.url()).pathname
log('click_opens_detail', afterClick === target.href, { expected: target.href, got: afterClick })

// detail page shows designed cover, no IMAGE PENDING
const detail = await page.evaluate(() => ({
  h1: document.querySelector('main h1')?.textContent?.trim(),
  pending: document.body.innerText.toLowerCase().includes('image pending'),
  imgLoaded: [...document.querySelectorAll('main img')].map((i) => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0 })),
}))
log('detail_cover_ok', !detail.pending && detail.imgLoaded.length > 0 && detail.imgLoaded[0].ok, detail)

// all covers fetch 200
const coverStatus = {}
for (const slug of ORDER) {
  const r = await page.request.get(`${base}/covers/${slug}.svg`)
  coverStatus[slug] = r.status()
}
log('covers_exist_http', Object.values(coverStatus).every((s) => s === 200), coverStatus)

// ---------- MOBILE ----------
const mp = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
watch(mp)
await mp.goto(base + '/projects', { waitUntil: 'networkidle' })
await mp.waitForTimeout(600)
const mInfo = await mp.evaluate(() => ({
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  slides: document.querySelectorAll('.project-showcase .swiper-slide').length,
  activeW: document.querySelector('.project-showcase .swiper-slide-active')?.getBoundingClientRect().width,
  sidePeek: (() => {
    const next = document.querySelector('.project-showcase .swiper-slide-next')
    return next ? next.getBoundingClientRect().left < window.innerWidth : false
  })(),
}))
log('mobile_no_overflow', mInfo.overflowX === 0, { overflowX: mInfo.overflowX, activeW: mInfo.activeW })
log('mobile_center_and_peek', mInfo.activeW > 250 && mInfo.sidePeek, mInfo)

// mobile touch swipe via CDP touch events (real touch stream)
await mp.evaluate(() => document.querySelector('.project-showcase').scrollIntoView({ block: 'center' }))
await mp.waitForTimeout(300)
const beforeSwipe = await mp.evaluate(() => {
  const w = document.querySelector('.project-showcase .swiper-wrapper')
  return new DOMMatrixReadOnly(getComputedStyle(w).transform).m41
})
const geomM = await mp.evaluate(() => {
  const r = document.querySelector('.project-showcase').getBoundingClientRect()
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }
})
const cdp = await mp.context().newCDPSession(mp)
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: geomM.x + 120, y: geomM.y }] })
for (let i = 1; i <= 10; i++) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: geomM.x + 120 - i * 22, y: geomM.y }] })
  await mp.waitForTimeout(16)
}
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await mp.waitForTimeout(900)
const afterSwipe = await mp.evaluate(() => {
  const w = document.querySelector('.project-showcase .swiper-wrapper')
  return new DOMMatrixReadOnly(getComputedStyle(w).transform).m41
})
log('mobile_swipe_moves', afterSwipe < beforeSwipe - 60, { before: +beforeSwipe.toFixed(0), after: +afterSwipe.toFixed(0) })

// ---------- CONSOLE ----------
log('no_console_errors', issues.length === 0, { issues: issues.slice(0, 4) })

await browser.close()

const failed = results.filter((r) => !r.pass)
console.log('\n==== SUMMARY ====')
console.log(`total ${results.length} | pass ${results.length - failed.length} | fail ${failed.length}`)
if (failed.length) {
  console.log('FAILED:', failed.map((f) => f.name).join(', '))
  process.exit(1)
}
