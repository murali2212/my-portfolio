// Automatic cover art. Used only when a project has no cover of its own.
// 1) It picks a hand-designed line drawing that matches the project (from its
//    title, tags and description).
// 2) Every drawing has several layouts and settings, chosen from the slug, so
//    two projects of the same type still look clearly different.
// No text in the picture, no network requests, same project -> same cover.

const INK = '#161616'
const SOFT = '#cfcfc8'
const PAPER = '#fafaf7'
const W = 1.5

export interface CoverInput {
  slug: string
  title?: string
  tags?: string[]
  description?: string
}

export type Motif =
  | 'network'
  | 'audio'
  | 'chat'
  | 'hub'
  | 'journey'
  | 'factory'
  | 'layers'
  | 'code'
  | 'data'
  | 'web'

// keyword -> how strongly it points to a drawing
const KEYWORDS: Record<Motif, Array<[string, number]>> = {
  chat: [['interview', 4], ['chat', 3], ['conversation', 3], ['assistant', 2], ['dialog', 3], ['message', 2], ['talk', 2], ['voice', 1]],
  audio: [['music', 4], ['song', 4], ['audio', 4], ['sound', 3], ['headphone', 4], ['stream', 3], ['player', 2], ['podcast', 4], ['listen', 3]],
  hub: [['mcp', 3], ['server', 3], ['backend', 3], ['database', 3], ['sqlite', 3], ['supabase', 3], ['team', 2], ['collaborat', 3], ['shared', 2], ['cloud', 2]],
  journey: [['journey', 4], ['anniversary', 4], ['wedding', 4], ['travel', 3], ['timeline', 3], ['story', 2], ['trip', 3], ['roadmap', 3], ['love', 2]],
  factory: [['factory', 4], ['manufactur', 4], ['machine', 3], ['industr', 3], ['sensor', 3], ['robot', 3], ['plant', 2]],
  layers: [['cognitive', 4], ['memory', 3], ['reasoning', 3], ['layer', 3], ['brain', 2], ['runtime', 2], ['architecture', 2]],
  code: [['terminal', 3], ['developer', 3], ['compiler', 3], ['sdk', 3], ['library', 2], ['framework', 2], ['extension', 2], ['typescript', 1], ['code', 1]],
  data: [['analytics', 4], ['dashboard', 4], ['finance', 4], ['account', 3], ['report', 2], ['chart', 4], ['spreadsheet', 4], ['ledger', 4], ['budget', 3], ['data', 1]],
  web: [['website', 3], ['landing', 3], ['frontend', 3], ['design', 2], ['portfolio', 3], ['ecommerce', 4]],
  network: [['multi-agent', 3], ['graph', 3], ['network', 3], ['swarm', 3], ['workflow', 2], ['automation', 2], ['agent', 1]],
}

function pickMotif(input: CoverInput): Motif {
  const fields: Array<[string, number]> = [
    [(input.title ?? '').toLowerCase(), 3],
    [(input.tags ?? []).join(' ').toLowerCase(), 2],
    [`${input.description ?? ''} ${input.slug}`.toLowerCase(), 1],
  ]
  let best: Motif = 'network'
  let bestScore = 0
  for (const motif of Object.keys(KEYWORDS) as Motif[]) {
    let score = 0
    for (const [text, mult] of fields) {
      for (const [kw, weight] of KEYWORDS[motif]) {
        if (text.includes(kw)) score += weight * mult
      }
    }
    if (score > bestScore) {
      best = motif
      bestScore = score
    }
  }
  return best
}

// ---------- small helpers ----------
type Rand = () => number

function seeded(seed: string): Rand {
  // mix the text into one well-spread number...
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  let a = (h ^ (h >>> 16)) >>> 0
  // ...then a small, fast random number generator
  const next = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = 0; i < 6; i++) next() // skip the first few values
  return next
}

const f = (n: number) => n.toFixed(1)
const between = (r: Rand, a: number, b: number) => a + r() * (b - a)
const whole = (r: Rand, a: number, b: number) => a + Math.floor(r() * (b - a + 1))
const mirror = (svg: string) => `<g transform="translate(800 0) scale(-1 1)">${svg}</g>`
const stroke = (c: string) =>
  `fill="none" stroke="${c}" stroke-width="${W}" stroke-linecap="round" stroke-linejoin="round"`

const line = (x1: number, y1: number, x2: number, y2: number, c = INK, extra = '') =>
  `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" ${stroke(c)}${extra}/>`
const circle = (cx: number, cy: number, r: number, c = INK) =>
  `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" ${stroke(c)}/>`
const dot = (cx: number, cy: number, r = 3.2) =>
  `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${INK}"/>`
const path = (d: string, c = INK, extra = '') => `<path d="${d}" ${stroke(c)}${extra}/>`
const rect = (x: number, y: number, w: number, h: number, rx = 0, c = INK) =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}" ${stroke(c)}/>`

// ---------- the drawings (centred on 400,200 in an 800x400 picture) ----------
function network(rand: Rand): string {
  const count = whole(rand, 4, 6)
  const start = rand() * Math.PI * 2
  const nodes = Array.from({ length: count }, (_, i) => {
    const angle = start + (i * Math.PI * 2) / count + (rand() - 0.5) * 0.5
    const spread = 0.8 + rand() * 0.35
    return {
      x: 400 + Math.cos(angle) * 150 * spread,
      y: 200 + Math.sin(angle) * 95 * spread,
      r: 11 + rand() * 20,
    }
  })
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const gap = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
      if (gap < nodes[i].r + nodes[j].r + 10) {
        const shrink = Math.max(8, (gap - 10) / 2)
        nodes[i].r = Math.min(nodes[i].r, shrink)
        nodes[j].r = Math.min(nodes[j].r, shrink)
      }
    }
  }
  const pairs: Array<[number, number]> = nodes.map((_, i) => [i, (i + 1) % count])
  pairs.push([0, 2])
  if (count >= 5 && rand() < 0.5) pairs.push([1, 3])
  const lines = pairs.map(([a, b]) => line(nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y)).join('')
  const rings = nodes.map((p) => circle(p.x, p.y, p.r) + dot(p.x, p.y)).join('')
  return lines + rings
}

function audio(rand: Rand): string {
  if (rand() < 0.5) {
    // two headphones sharing one waveform
    const phones = [330, 470]
      .map(
        (cx) =>
          path(`M ${cx - 38} 200 A 38 44 0 0 1 ${cx + 38} 200`) +
          rect(cx - 48, 196, 14, 34, 5) +
          rect(cx + 34, 196, 14, 34, 5),
      )
      .join('')
    const link = line(378, 213, 422, 213, SOFT, ' stroke-dasharray="4 5"')
    const cycles = whole(rand, 5, 12)
    const amp = between(rand, 16, 30)
    const phase = rand() * Math.PI
    let d = ''
    for (let x = 250; x <= 550; x += 5) {
      const t = (x - 250) / 300
      const y = 290 + Math.sin(t * Math.PI * cycles + phase) * amp * Math.sin(t * Math.PI)
      d += `${x === 250 ? 'M' : 'L'} ${f(x)} ${f(y)} `
    }
    return phones + link + path(d) + dot(400, 290)
  }
  // one big headphone with equaliser bars
  const head =
    path('M 330 215 A 70 82 0 0 1 470 215') + rect(316, 208, 22, 58, 8) + rect(462, 208, 22, 58, 8)
  const bars = (x0: number, dir: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const h = between(rand, 18, 78)
      const x = x0 + dir * i * 14
      return line(x, 236 - h / 2, x, 236 + h / 2)
    }).join('')
  return head + bars(290, -1) + bars(510, 1) + dot(400, 240)
}

function chat(rand: Rand): string {
  if (rand() < 0.5) {
    const textLines = (x: number, y0: number, n: number, max: number) =>
      Array.from({ length: n }, (_, i) =>
        line(x, y0 + i * 18, x + between(rand, 50, max), y0 + i * 18, i === n - 1 && n > 1 ? SOFT : INK),
      ).join('')
    const a =
      path('M 264 112 H 406 Q 420 112 420 126 V 188 Q 420 202 406 202 H 304 L 276 228 L 280 202 H 264 Q 250 202 250 188 V 126 Q 250 112 264 112 Z') +
      textLines(272, 134, whole(rand, 2, 4), 126)
    const b =
      path('M 404 226 H 546 Q 560 226 560 240 V 290 Q 560 304 546 304 H 526 L 530 330 L 498 304 H 404 Q 390 304 390 290 V 240 Q 390 226 404 226 Z') +
      textLines(412, 252, whole(rand, 1, 3), 108)
    const angle = between(rand, 0.35, 2.8)
    const gauge =
      path('M 462 168 A 40 40 0 0 1 542 168') +
      line(502, 168, 502 + Math.cos(angle) * 30, 168 - Math.sin(angle) * 30) +
      dot(502, 168)
    const body = a + b + gauge
    return rand() < 0.5 ? mirror(body) : body
  }
  // one big bubble with a confidence slider
  const bubble =
    path('M 304 100 H 496 Q 512 100 512 116 V 196 Q 512 212 496 212 H 330 L 302 240 L 306 212 H 304 Q 288 212 288 196 V 116 Q 288 100 304 100 Z') +
    line(310, 132, 310 + between(rand, 80, 190), 132) +
    line(310, 152, 310 + between(rand, 80, 190), 152) +
    line(310, 172, 310 + between(rand, 60, 130), 172, SOFT)
  const fill = between(rand, 60, 190)
  const slider =
    line(288, 288, 512, 288, SOFT) +
    line(288, 288, 288 + fill, 288) +
    dot(288 + fill, 288, 4.5) +
    [0.25, 0.5, 0.75].map((t) => line(288 + 224 * t, 281, 288 + 224 * t, 295, SOFT)).join('')
  return rand() < 0.5 ? mirror(bubble + slider) : bubble + slider
}

function hub(rand: Rand): string {
  const base = rand() * Math.PI * 2
  if (rand() < 0.5) {
    // a stack of servers with users around it
    const units = whole(rand, 2, 4)
    const top = 200 - (units * 32 - 6) / 2
    const stack = Array.from({ length: units }, (_, i) => {
      const y = top + i * 32
      return rect(355, y, 90, 26, 5) + dot(371, y + 13, 2.6) + line(392, y + 13, 430, y + 13)
    }).join('')
    const users = whole(rand, 3, 5)
    const around = Array.from({ length: users }, (_, i) => {
      const a = base + (i * Math.PI * 2) / users
      const dx = Math.cos(a)
      const dy = Math.sin(a)
      const x = 400 + dx * 165
      const y = 200 + dy * 105
      return (
        line(x - dx * 16, y - dy * 16, 400 + dx * 60, 200 + dy * 60) +
        circle(x, y, 16) +
        dot(x, y)
      )
    }).join('')
    return around + stack
  }
  // one hub with boxes around it
  const count = whole(rand, 5, 7)
  const boxes = Array.from({ length: count }, (_, i) => {
    const a = base + (i * Math.PI * 2) / count
    const dx = Math.cos(a)
    const dy = Math.sin(a)
    const x = 400 + dx * 150
    const y = 200 + dy * 92
    return (
      line(400 + dx * 28, 200 + dy * 28, x - dx * 20, y - dy * 14) + rect(x - 16, y - 11, 32, 22, 4)
    )
  }).join('')
  return boxes + circle(400, 200, 26) + dot(400, 200)
}

function journey(rand: Rand): string {
  if (rand() < 0.5) {
    // a winding path with milestones
    const amp = between(rand, 45, 80)
    const phase = rand() * Math.PI * 2
    const waves = rand() < 0.5 ? 1 : 1.5
    const y = (x: number) => 200 + Math.sin(((x - 210) / 380) * Math.PI * 2 * waves + phase) * amp
    let d = ''
    for (let x = 210; x <= 590; x += 5) d += `${x === 210 ? 'M' : 'L'} ${f(x)} ${f(y(x))} `
    const n = whole(rand, 3, 6)
    const stops = Array.from({ length: n }, (_, i) => {
      const x = 210 + (i * 380) / n
      return circle(x, y(x), 9) + dot(x, y(x))
    }).join('')
    return path(d) + stops + circle(590, y(590), 16) + dot(590, y(590))
  }
  // a climb with a flag on the highest peak
  const peaks = whole(rand, 3, 5)
  const total = peaks * 2
  const pts = Array.from({ length: total }, (_, k) => {
    const x = 220 + (k * 360) / (total - 1)
    const isPeak = k % 2 === 1
    const rise = peaks > 1 ? ((k - 1) / 2) * (95 / (peaks - 1)) : 0
    const yy = isPeak ? 225 - rise + between(rand, -10, 10) : between(rand, 255, 295)
    return { x, y: yy, isPeak }
  })
  pts[total - 1].y = 130
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${f(p.x)} ${f(p.y)}`).join(' ')
  const top = pts[total - 1]
  const flag =
    line(top.x, top.y, top.x, top.y - 44) +
    path(`M ${f(top.x)} ${f(top.y - 44)} L ${f(top.x + 30)} ${f(top.y - 34)} L ${f(top.x)} ${f(top.y - 24)} Z`)
  const marks = pts.filter((p) => p.isPeak).map((p) => dot(p.x, p.y)).join('')
  return path(d) + marks + flag
}

function gearPath(cx: number, cy: number, rOut: number, rIn: number, teeth: number): string {
  const step = (Math.PI * 2) / teeth
  const pts: string[] = []
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const p = (r: number, off: number) =>
      `${f(cx + Math.cos(a + off) * r)} ${f(cy + Math.sin(a + off) * r)}`
    pts.push(p(rIn, -step * 0.32), p(rOut, -step * 0.18), p(rOut, step * 0.18), p(rIn, step * 0.32))
  }
  return `M ${pts.join(' L ')} Z`
}

function factory(rand: Rand): string {
  const boxCount = whole(rand, 1, 3)
  const special = whole(rand, 0, boxCount - 1)
  const belt =
    line(250, 306, 550, 306) +
    circle(250, 306, 8) +
    circle(550, 306, 8) +
    Array.from({ length: boxCount }, (_, i) => {
      const x = 380 + i * 48
      return rect(x, 276, 30, 30) + (i === special ? dot(x + 15, 291) : '')
    }).join('')
  if (rand() < 0.5) {
    const gear =
      path(gearPath(320, 180, 62, 50, whole(rand, 8, 14))) + circle(320, 180, 18) + dot(320, 180)
    const pulse =
      path(`M 420 180 L 455 180 L 470 ${f(180 - between(rand, 25, 45))} L 490 ${f(180 + between(rand, 30, 48))} L 506 180 L 560 180`) +
      dot(560, 180)
    return gear + pulse + belt
  }
  // two gears meshing
  const big = path(gearPath(350, 175, 56, 45, 10)) + circle(350, 175, 16) + dot(350, 175)
  const small = path(gearPath(430, 212, 34, 26, 7)) + circle(430, 212, 10) + dot(430, 212)
  return big + small + belt
}

function layers(rand: Rand): string {
  if (rand() < 0.6) {
    const plates = whole(rand, 2, 4)
    const hw = between(rand, 80, 105)
    const hh = hw * 0.4
    const gap = 45
    const topY = 200 - ((plates - 1) * gap) / 2
    const L = 400 - hw
    const R = 400 + hw
    let svg = path(`M ${f(L)} ${f(topY)} L 400 ${f(topY - hh)} L ${f(R)} ${f(topY)} L 400 ${f(topY + hh)} Z`)
    for (let i = 1; i < plates; i++) {
      const yc = topY + i * gap
      svg += path(
        `M ${f(L)} ${f(yc - gap)} V ${f(yc)} L 400 ${f(yc + hh)} L ${f(R)} ${f(yc)} V ${f(yc - gap)}`,
      )
    }
    const circleY = topY - hh - 38
    const thought =
      circle(400, circleY, 16, SOFT) +
      line(400, circleY + 16, 400, topY - hh + 10, SOFT, ' stroke-dasharray="4 5"')
    return thought + svg + dot(400, topY)
  }
  // a core of nested diamonds
  const rings = whole(rand, 3, 4)
  let svg = ''
  for (let i = 0; i < rings; i++) {
    const s = 30 + i * 28
    svg += path(
      `M ${f(400 - s * 1.5)} 200 L 400 ${f(200 - s)} L ${f(400 + s * 1.5)} 200 L 400 ${f(200 + s)} Z`,
      i === rings - 1 ? SOFT : INK,
    )
  }
  const inner = 30
  const vertices =
    dot(400 - inner * 1.5, 200) + dot(400 + inner * 1.5, 200) + dot(400, 200 - inner) + dot(400, 200 + inner)
  return svg + vertices
}

function code(rand: Rand): string {
  const style = Math.floor(rand() * 3)
  if (style === 0) {
    return (
      rect(280, 110, 240, 180, 10) +
      line(280, 140, 520, 140) +
      dot(300, 125, 3) + circle(316, 125, 3) + circle(332, 125, 3) +
      path('M 310 175 L 332 195 L 310 215') +
      line(346, 215, 378, 215) +
      line(310, 242, 310 + between(rand, 70, 180), 242, SOFT) +
      line(310, 260, 310 + between(rand, 50, 150), 260, SOFT) +
      line(310, 278, 310 + between(rand, 40, 120), 278, SOFT)
    )
  }
  if (style === 1) {
    const tilt = between(rand, -14, 14)
    return (
      path('M 330 165 L 285 200 L 330 235') +
      path('M 470 165 L 515 200 L 470 235') +
      line(400 + tilt * 0.6, 155, 400 - tilt * 0.6, 245) +
      line(320, 290, 320 + between(rand, 80, 160), 290, SOFT) +
      line(350, 308, 350 + between(rand, 40, 100), 308, SOFT)
    )
  }
  return (
    path('M 340 140 Q 316 140 316 166 V 180 Q 316 200 292 200 Q 316 200 316 220 V 234 Q 316 260 340 260') +
    path('M 460 140 Q 484 140 484 166 V 180 Q 484 200 508 200 Q 484 200 484 220 V 234 Q 484 260 460 260') +
    rect(392, 184, 16, 32, 2) +
    line(340, 290, 340 + between(rand, 60, 120), 290, SOFT)
  )
}

function data(rand: Rand): string {
  const style = Math.floor(rand() * 3)
  if (style === 0) {
    const n = whole(rand, 4, 7)
    const bw = 230 / n - 10
    const tops: Array<[number, number]> = []
    const bars = Array.from({ length: n }, (_, i) => {
      const h = between(rand, 40, 160)
      const x = 306 + i * (bw + 10)
      tops.push([x + bw / 2, 290 - h - 8])
      return rect(x, 290 - h, bw, h, 3)
    }).join('')
    const trend =
      rand() < 0.7
        ? path(`M ${tops.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L ')}`) +
          tops.map(([x, y]) => dot(x, y, 2.8)).join('')
        : ''
    return path('M 280 110 V 290 H 560') + bars + trend
  }
  if (style === 1) {
    const n = whole(rand, 7, 9)
    const pts = Array.from({ length: n }, (_, i) => ({
      x: 296 + (i * 250) / (n - 1),
      y: between(rand, 130, 270),
    }))
    const grid = [150, 200, 250].map((y) => line(280, y, 550, y, SOFT)).join('')
    return (
      path('M 280 110 V 290 H 560') +
      grid +
      path(`M ${pts.map((p) => `${f(p.x)} ${f(p.y)}`).join(' L ')}`) +
      pts.map((p) => dot(p.x, p.y, 2.8)).join('')
    )
  }
  const angles = [rand() * 2, 2 + rand() * 2, 4.2 + rand() * 2].sort((a, b) => a - b)
  const spokes = angles
    .map((a) => line(360 + Math.cos(a) * 38, 200 + Math.sin(a) * 38, 360 + Math.cos(a) * 82, 200 + Math.sin(a) * 82))
    .join('')
  const legend = [0, 1, 2]
    .map((i) => dot(486, 150 + i * 40, 4) + line(502, 150 + i * 40, 502 + between(rand, 30, 70), 150 + i * 40, i === 2 ? SOFT : INK))
    .join('')
  return circle(360, 200, 82) + circle(360, 200, 38) + spokes + dot(360, 200) + legend
}

function web(rand: Rand): string {
  if (rand() < 0.65) {
    const cards = whole(rand, 2, 4)
    const cw = (220 - (cards - 1) * 14) / cards
    const row = Array.from({ length: cards }, (_, i) => rect(290 + i * (cw + 14), 230, cw, 50, 4)).join('')
    const body =
      rect(270, 105, 260, 190, 8) +
      line(270, 135, 530, 135) +
      dot(288, 120, 3) + circle(304, 120, 3) + circle(320, 120, 3) +
      rect(290, 150, 120, 62, 4) +
      line(290, 212, 410, 150, SOFT) +
      rect(430, 150, 80, 26, 4) +
      rect(430, 186, 80, 26, 4) +
      row
    return rand() < 0.5 ? mirror(body) : body
  }
  // a phone
  const rows = [0, 1, 2]
    .map((i) => dot(364, 214 + i * 26, 3) + line(378, 214 + i * 26, 378 + between(rand, 30, 62), 214 + i * 26, i === 2 ? SOFT : INK))
    .join('')
  return (
    rect(340, 92, 120, 216, 18) +
    line(382, 108, 418, 108) +
    rect(354, 126, 92, 62, 6) +
    rows +
    line(386, 294, 414, 294, SOFT) +
    path('M 300 150 Q 284 200 300 250', SOFT) +
    path('M 500 150 Q 516 200 500 250', SOFT)
  )
}

const DRAW: Record<Motif, (rand: Rand) => string> = {
  network, audio, chat, hub, journey, factory, layers, code, data, web,
}

const cache = new Map<string, string>()

// Draws one specific motif for a slug (also handy for testing).
export function drawCover(motif: Motif, slug: string): string {
  const rand = seeded(`${slug}:${motif}`)
  const art = DRAW[motif](rand)

  // small unique twist: a tiny tilt and one soft grey circle
  const tilt = (rand() - 0.5) * 6
  const ax = rand() < 0.5 ? 215 : 585
  const ay = rand() < 0.5 ? 90 : 310
  const accent = motif === 'network' ? '' : circle(ax, ay, 14 + rand() * 12, SOFT)

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">` +
    `<rect width="800" height="400" fill="${PAPER}"/>` +
    `<g transform="rotate(${f(tilt)} 400 200)">${art}</g>${accent}</svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// Returns an image address you can use as <img src="...">.
// The picture is 2:1 wide with the art in the middle, so it stays safe when a
// card crops it to 16:10 or 16:9.
export function coverFor(input: CoverInput): string {
  const key = `${input.slug}|${input.title ?? ''}|${(input.tags ?? []).join(',')}|${input.description ?? ''}`
  const hit = cache.get(key)
  if (hit) return hit
  const uri = drawCover(pickMotif(input), input.slug || 'project')
  cache.set(key, uri)
  return uri
}
