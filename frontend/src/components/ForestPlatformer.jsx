import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGameSession } from '../hooks/useGameSession'
import { api } from '../api'

const W = 960
const H = 540
const GAME = 'forest'
const PLAYER = { w: 38, h: 54 }
const MAX_RENDER_SCALE = 3

function rand(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function makePlatform(index, lastY) {
  const x = index * 250 + 120
  const width = 170 + Math.floor(rand(index + 2) * 170)
  const climb = (rand(index + 6) - 0.5) * 140
  const y = Math.max(170, Math.min(420, lastY + climb))
  return { x, y, w: width, h: 26, kind: rand(index + 9) > 0.65 ? 'log' : 'moss' }
}

function difficultyForIndex(index) {
  if (index < 7) return 0
  if (index < 13) return 1
  if (index < 21) return 2
  return 3
}

function makeWorldUntil(world, targetX) {
  while (world.generatedTo < targetX) {
    const index = world.platforms.length
    const previous = world.platforms[index - 1]
    const difficulty = difficultyForIndex(index)
    const platform = index === 0
      ? { x: -80, y: 430, w: 560, h: 34, kind: 'moss' }
      : makePlatform(index, previous.y)

    world.platforms.push(platform)

    const cx = platform.x + platform.w * 0.5
    if (index > 0 && rand(index + 20) > 0.22) {
      world.collectibles.push({ x: cx - 12, y: platform.y - 74, r: 13, type: 'acorn', taken: false })
    }
    if (index > 1 && rand(index + 40) > 0.62) {
      world.collectibles.push({ x: platform.x + platform.w * 0.25, y: platform.y - 116, r: 10, type: 'firefly', taken: false })
      world.collectibles.push({ x: platform.x + platform.w * 0.58, y: platform.y - 142, r: 10, type: 'firefly', taken: false })
    }
    const spikeChance = 0.74 - difficulty * 0.1
    if (index > 2 && rand(index + 70) > spikeChance) {
      const spikeWidth = 42 + difficulty * 13
      world.hazards.push({ x: platform.x + platform.w - spikeWidth - 8, y: platform.y - 22, w: spikeWidth, h: 22 })
    }
    if (difficulty >= 1 && platform.w > 210 && rand(index + 130) > 0.62) {
      world.movingHazards.push({
        x: platform.x + 52,
        y: platform.y - 38,
        w: 34,
        h: 28,
        range: Math.min(120 + difficulty * 28, platform.w - 92),
        speed: 0.0018 + difficulty * 0.00055,
        phase: rand(index + 131) * Math.PI * 2,
      })
    }
    if (difficulty >= 2 && rand(index + 170) > 0.56) {
      world.fallingHazards.push({
        x: platform.x + platform.w * (0.3 + rand(index + 172) * 0.42),
        y: platform.y - 190 - rand(index + 173) * 70,
        w: 24,
        h: 30,
        drop: 96 + difficulty * 34,
        speed: 0.002 + difficulty * 0.0005,
        phase: rand(index + 174) * Math.PI * 2,
      })
    }
    if (index > 0 && rand(index + 100) > 0.72) {
      world.springPads.push({ x: platform.x + 28, y: platform.y - 12, w: 36, h: 12 })
    }

    world.generatedTo = platform.x + platform.w
  }
}

function resetWorld() {
  const world = {
    platforms: [],
    collectibles: [],
    hazards: [],
    movingHazards: [],
    fallingHazards: [],
    springPads: [],
    generatedTo: 0,
  }
  makeWorldUntil(world, 1800)
  return world
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
  ctx.fill()
}

function prepareCanvas(canvas, ctx) {
  const rect = canvas.getBoundingClientRect()
  const cssWidth = Math.max(1, rect.width || W)
  const cssHeight = Math.max(1, rect.height || H)
  const dpr = Math.min(MAX_RENDER_SCALE, window.devicePixelRatio || 1)
  const pixelWidth = Math.round(cssWidth * dpr)
  const pixelHeight = Math.round(cssHeight * dpr)

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth
    canvas.height = pixelHeight
  }

  ctx.setTransform(pixelWidth / W, 0, 0, pixelHeight / H, 0, 0)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.clearRect(0, 0, W, H)
}

function drawForest(ctx, camera, time) {
  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, '#9bd6ff')
  sky.addColorStop(0.52, '#d9f7d6')
  sky.addColorStop(1, '#f7f4c4')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  for (let i = -2; i < 8; i += 1) {
    const x = i * 190 - (camera * 0.12 % 190)
    ctx.beginPath()
    ctx.ellipse(x, 82 + Math.sin(i + time * 0.0004) * 5, 64, 18, 0, 0, Math.PI * 2)
    ctx.ellipse(x + 45, 75, 48, 20, 0, 0, Math.PI * 2)
    ctx.ellipse(x - 42, 78, 40, 16, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 0.2
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.5
  for (let i = -1; i < 8; i += 1) {
    const y = 136 + i * 18
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x <= W + 80; x += 80) {
      ctx.quadraticCurveTo(x + 40, y - 8 + Math.sin(time * 0.0005 + i) * 4, x + 80, y)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const layers = [
    { speed: 0.18, trunk: '#6f5737', leaf: '#2e7d4c', y: 306, scale: 1.25, alpha: 0.38 },
    { speed: 0.32, trunk: '#68452f', leaf: '#176a43', y: 352, scale: 1.5, alpha: 0.58 },
    { speed: 0.52, trunk: '#573622', leaf: '#0f5a36', y: 400, scale: 1.8, alpha: 0.82 },
  ]

  layers.forEach((layer) => {
    ctx.globalAlpha = layer.alpha
    for (let i = -2; i < 14; i += 1) {
      const base = i * 120 - (camera * layer.speed % 120)
      const h = (72 + rand(i + layer.y) * 76) * layer.scale
      ctx.fillStyle = layer.trunk
      drawRoundedRect(ctx, base + 48, layer.y - h * 0.22, 18, h * 0.5, 8)
      ctx.strokeStyle = 'rgba(255,255,255,0.14)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(base + 54, layer.y - h * 0.18)
      ctx.quadraticCurveTo(base + 48, layer.y + h * 0.04, base + 56, layer.y + h * 0.22)
      ctx.stroke()
      ctx.fillStyle = layer.leaf
      ctx.shadowColor = 'rgba(9, 40, 24, 0.18)'
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.moveTo(base + 57, layer.y - h)
      ctx.lineTo(base + 10, layer.y - h * 0.12)
      ctx.lineTo(base + 104, layer.y - h * 0.12)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(base + 57, layer.y - h * 0.78)
      ctx.lineTo(base + 0, layer.y + h * 0.06)
      ctx.lineTo(base + 114, layer.y + h * 0.06)
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 0
    }
    ctx.globalAlpha = 1
  })

  const ground = ctx.createLinearGradient(0, 478, 0, H)
  ground.addColorStop(0, '#1f7a46')
  ground.addColorStop(0.24, '#174d33')
  ground.addColorStop(1, '#0f2f22')
  ctx.fillStyle = ground
  ctx.fillRect(0, 478, W, 62)
  ctx.fillStyle = 'rgba(31, 132, 78, 0.5)'
  for (let i = 0; i < 90; i += 1) {
    const x = (i * 37 - camera * 0.9) % (W + 80)
    ctx.fillRect(x, 470 + rand(i) * 38, 4, 26 + rand(i + 1) * 24)
  }
}

function drawPlatform(ctx, platform, camera) {
  const x = platform.x - camera
  const y = platform.y
  const body = ctx.createLinearGradient(0, y, 0, y + platform.h)
  if (platform.kind === 'log') {
    body.addColorStop(0, '#a86c3a')
    body.addColorStop(0.58, '#7a4a2a')
    body.addColorStop(1, '#4e2d1b')
  } else {
    body.addColorStop(0, '#76bd58')
    body.addColorStop(0.52, '#3f8b40')
    body.addColorStop(1, '#246332')
  }
  ctx.shadowColor = 'rgba(20, 45, 28, 0.26)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 5
  ctx.fillStyle = body
  drawRoundedRect(ctx, x, y, platform.w, platform.h, 12)
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
  ctx.fillStyle = platform.kind === 'log' ? '#5f371f' : '#246332'
  ctx.fillRect(x + 8, y + platform.h - 6, platform.w - 16, 6)
  ctx.fillStyle = platform.kind === 'log' ? 'rgba(255,255,255,0.12)' : '#8fd06e'
  ctx.fillRect(x + 14, y + 7, platform.w - 28, 5)
  ctx.strokeStyle = platform.kind === 'log' ? 'rgba(55, 30, 14, 0.34)' : 'rgba(19, 74, 34, 0.34)'
  ctx.lineWidth = 1.25
  for (let i = 34; i < platform.w - 20; i += 54) {
    ctx.beginPath()
    ctx.moveTo(x + i, y + 8)
    ctx.quadraticCurveTo(x + i + 16, y + 17, x + i + 38, y + 10)
    ctx.stroke()
  }
}

function drawPlayer(ctx, player, camera, time) {
  const x = player.x - camera
  const bob = Math.sin(time * 0.012) * (player.grounded ? 2 : 0)
  ctx.save()
  ctx.translate(x + PLAYER.w / 2, player.y + PLAYER.h / 2 + bob)
  if (player.facing < 0) ctx.scale(-1, 1)

  ctx.fillStyle = 'rgba(10, 20, 15, 0.18)'
  ctx.beginPath()
  ctx.ellipse(0, 34, 26, 8, 0, 0, Math.PI * 2)
  ctx.fill()

  const body = ctx.createRadialGradient(7, -4, 5, 0, 4, 30)
  body.addColorStop(0, '#ffd486')
  body.addColorStop(0.48, '#f4b657')
  body.addColorStop(1, '#c87536')
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.ellipse(0, 4, 19, 25, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(105, 60, 25, 0.3)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.fillStyle = '#ffce7a'
  ctx.beginPath()
  ctx.ellipse(6, 2, 10, 13, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#173628'
  ctx.beginPath()
  ctx.arc(8, -4, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#8a4d27'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(9, 6, 4, 0.1, Math.PI * 0.8)
  ctx.stroke()
  ctx.fillStyle = '#8a4d27'
  drawRoundedRect(ctx, -15, -23, 30, 11, 5)
  ctx.fillStyle = '#2d7c44'
  ctx.beginPath()
  ctx.ellipse(0, -30, 20, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#75b85a'
  ctx.beginPath()
  ctx.ellipse(5, -32, 9, 3, -0.25, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#2a6d3f'
  drawRoundedRect(ctx, -16, 22, 11, 14, 4)
  drawRoundedRect(ctx, 5, 22, 11, 14, 4)
  ctx.restore()
}

function movingHazardBox(hazard, now) {
  const offset = (Math.sin(now * hazard.speed + hazard.phase) + 1) * 0.5 * hazard.range
  return { x: hazard.x + offset, y: hazard.y, w: hazard.w, h: hazard.h }
}

function fallingHazardBox(hazard, now) {
  const drop = (Math.sin(now * hazard.speed + hazard.phase) + 1) * 0.5 * hazard.drop
  return { x: hazard.x, y: hazard.y + drop, w: hazard.w, h: hazard.h }
}

function drawMovingHazard(ctx, hazard, camera, now) {
  const box = movingHazardBox(hazard, now)
  const x = box.x - camera
  if (x < -90 || x > W + 90) return

  ctx.strokeStyle = 'rgba(85, 38, 18, 0.38)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(hazard.x - camera + 8, hazard.y + hazard.h + 8)
  ctx.lineTo(hazard.x - camera + hazard.range + hazard.w - 8, hazard.y + hazard.h + 8)
  ctx.stroke()

  const cx = x + box.w / 2
  const cy = box.y + box.h / 2
  const wobble = Math.sin(now * 0.004 + hazard.phase) * 0.12

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(wobble)

  ctx.fillStyle = 'rgba(55, 33, 18, 0.22)'
  ctx.beginPath()
  ctx.ellipse(0, box.h * 0.45, box.w * 0.55, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  const twigGradient = ctx.createRadialGradient(-6, -7, 5, 0, 0, 27)
  twigGradient.addColorStop(0, '#8b5a2f')
  twigGradient.addColorStop(0.6, '#5a3a22')
  twigGradient.addColorStop(1, '#2d2117')
  ctx.strokeStyle = twigGradient
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (let i = 0; i < 13; i += 1) {
    const angle = i * 0.78 + hazard.phase * 0.4
    const inner = 4 + rand(i + hazard.phase) * 7
    const outer = 14 + rand(i + 17 + hazard.phase) * 10
    const bend = (rand(i + 31 + hazard.phase) - 0.5) * 10
    ctx.lineWidth = i % 3 === 0 ? 4 : 2.3
    ctx.beginPath()
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
    ctx.quadraticCurveTo(
      Math.cos(angle + 0.45) * (outer * 0.55) + bend,
      Math.sin(angle - 0.35) * (outer * 0.55),
      Math.cos(angle) * outer,
      Math.sin(angle) * outer,
    )
    ctx.stroke()
  }

  ctx.strokeStyle = '#6f4a2a'
  ctx.lineWidth = 2
  for (let i = 0; i < 5; i += 1) {
    const y = -10 + i * 5
    ctx.beginPath()
    ctx.moveTo(-16 + rand(i + 200) * 5, y)
    ctx.quadraticCurveTo(-3, y - 8 + rand(i + 220) * 8, 15 - rand(i + 240) * 5, y + 3)
    ctx.stroke()
  }

  ctx.fillStyle = '#315b2c'
  for (let i = 0; i < 6; i += 1) {
    const angle = i * 1.18 + hazard.phase
    const lx = Math.cos(angle) * (9 + rand(i + 300) * 11)
    const ly = Math.sin(angle) * (7 + rand(i + 320) * 9)
    ctx.beginPath()
    ctx.ellipse(lx, ly, 4.5, 2.5, angle, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#d8c39a'
  for (let i = 0; i < 7; i += 1) {
    const angle = i * 0.9 + 0.35
    const tx = Math.cos(angle) * 17
    const ty = Math.sin(angle) * 13
    ctx.beginPath()
    ctx.moveTo(tx, ty)
    ctx.lineTo(tx + Math.cos(angle) * 7, ty + Math.sin(angle) * 5)
    ctx.lineTo(tx + Math.cos(angle + 1.5) * 3, ty + Math.sin(angle + 1.5) * 3)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
}

function drawFallingHazard(ctx, hazard, camera, now) {
  const box = fallingHazardBox(hazard, now)
  const x = box.x - camera
  if (x < -90 || x > W + 90) return

  ctx.strokeStyle = 'rgba(92, 51, 29, 0.45)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x + box.w / 2, hazard.y - 22)
  ctx.lineTo(x + box.w / 2, box.y + 3)
  ctx.stroke()

  const cone = ctx.createLinearGradient(0, box.y, 0, box.y + box.h)
  cone.addColorStop(0, '#d69b52')
  cone.addColorStop(0.5, '#8a4d27')
  cone.addColorStop(1, '#4d2b18')
  ctx.fillStyle = cone
  ctx.beginPath()
  ctx.moveTo(x + box.w / 2, box.y)
  ctx.quadraticCurveTo(x + box.w, box.y + 13, x + box.w / 2, box.y + box.h)
  ctx.quadraticCurveTo(x, box.y + 13, x + box.w / 2, box.y)
  ctx.fill()
  ctx.strokeStyle = 'rgba(65, 34, 18, 0.52)'
  ctx.lineWidth = 1.25
  for (let i = 7; i < box.h; i += 7) {
    ctx.beginPath()
    ctx.moveTo(x + 7, box.y + i)
    ctx.quadraticCurveTo(x + box.w / 2, box.y + i + 4, x + box.w - 7, box.y + i)
    ctx.stroke()
  }
}

export default function ForestPlatformer() {
  const canvasRef = useRef(null)
  const navigate = useNavigate()
  const { activeChild } = useAuth()
  const { setScore: setSessionScore } = useGameSession(GAME)
  const [phase, setPhase] = useState('ready')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [message, setMessage] = useState('Jump through the forest and collect acorns.')
  const [xp, setXp] = useState(null)
  const [spendingXp, setSpendingXp] = useState(false)
  const stateRef = useRef(null)
  const keysRef = useRef({ left: false, right: false, jump: false })
  const phaseRef = useRef('ready')
  const scoreRef = useRef(0)
  const messageRef = useRef('Jump through the forest and collect acorns.')

  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { messageRef.current = message }, [message])

  useEffect(() => {
    if (!activeChild) return
    Promise.all([
      api.getHighScore(activeChild.id, GAME),
      api.getChildXp(activeChild.id),
    ])
      .then(([highScoreRes, xpRes]) => {
        setHighScore(highScoreRes.score ?? 0)
        setXp(xpRes)
        setMessage(`Spend ${xpRes.forest_entry_cost} XP to start a forest run.`)
      })
      .catch(() => {
        setHighScore(0)
        setXp(null)
      })
  }, [activeChild])

  const beginRun = useCallback(() => {
    stateRef.current = {
      world: resetWorld(),
      player: {
        x: 40,
        y: 320,
        vx: 0,
        vy: 0,
        grounded: false,
        facing: 1,
        grace: 0,
        hurtUntil: 0,
      },
      camera: 0,
      bestX: 0,
      acorns: 0,
      fireflies: 0,
      health: 3,
      particles: [],
      last: performance.now(),
      over: false,
    }
    scoreRef.current = 0
    setScore(0)
    setSessionScore(0)
    setMessage('Find springy mushrooms, grab glowing fireflies, and keep moving.')
    setPhase('playing')
  }, [setSessionScore])

  const startGame = useCallback(async () => {
    if (!activeChild || spendingXp) return
    const cost = xp?.forest_entry_cost ?? 25
    const balance = xp?.balance ?? 0
    if (balance < cost) {
      setMessage(`Earn ${cost - balance} more XP in Let's Play before exploring.`)
      return
    }
    setSpendingXp(true)
    try {
      const nextXp = await api.spendForestEntryXp(activeChild.id)
      setXp(nextXp)
      beginRun()
    } catch (err) {
      setMessage(err.message || 'Not enough XP for Forest Explore.')
    } finally {
      setSpendingXp(false)
    }
  }, [activeChild, beginRun, spendingXp, xp])

  const finishGame = useCallback((finalScore) => {
    const nextBest = Math.max(highScore, finalScore)
    setHighScore(nextBest)
    setPhase('over')
    setMessage(finalScore >= highScore && finalScore > 0 ? 'New forest record!' : 'Try another run through the trees.')
    if (activeChild && finalScore > highScore) {
      api.updateHighScore({ child_id: activeChild.id, game: GAME, score: finalScore })
        .then((res) => setHighScore(res.score ?? nextBest))
        .catch(() => {})
    }
  }, [activeChild, highScore])

  useEffect(() => {
    const down = (event) => {
      const gameControlKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'A', 'd', 'D', 'w', 'W']
      if (gameControlKeys.includes(event.key)) event.preventDefault()
      if (['ArrowLeft', 'a', 'A'].includes(event.key)) keysRef.current.left = true
      if (['ArrowRight', 'd', 'D'].includes(event.key)) keysRef.current.right = true
      if ([' ', 'ArrowUp', 'w', 'W'].includes(event.key)) {
        keysRef.current.jump = true
        if (phaseRef.current === 'ready' || phaseRef.current === 'over') startGame()
      }
    }
    const up = (event) => {
      const gameControlKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'A', 'd', 'D', 'w', 'W']
      if (gameControlKeys.includes(event.key)) event.preventDefault()
      if (['ArrowLeft', 'a', 'A'].includes(event.key)) keysRef.current.left = false
      if (['ArrowRight', 'd', 'D'].includes(event.key)) keysRef.current.right = false
      if ([' ', 'ArrowUp', 'w', 'W'].includes(event.key)) keysRef.current.jump = false
    }
    window.addEventListener('keydown', down, { passive: false })
    window.addEventListener('keyup', up, { passive: false })
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [startGame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frame = 0

    const tick = (now) => {
      prepareCanvas(canvas, ctx)
      const s = stateRef.current
      const camera = s?.camera ?? 0
      drawForest(ctx, camera, now)

      if (s) {
        const dt = Math.min(0.033, (now - s.last) / 1000 || 0.016)
        s.last = now

        if (phaseRef.current === 'playing' && !s.over) {
          const p = s.player
          const keys = keysRef.current
          const accel = p.grounded ? 2200 : 1320
          const maxSpeed = 330
          const friction = p.grounded ? 0.82 : 0.96

          if (keys.left) {
            p.vx -= accel * dt
            p.facing = -1
          }
          if (keys.right) {
            p.vx += accel * dt
            p.facing = 1
          }
          if (!keys.left && !keys.right) p.vx *= friction
          p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx))

          p.grace -= dt
          if (keys.jump && (p.grounded || p.grace > 0)) {
            p.vy = -620
            p.grounded = false
            p.grace = 0
            keys.jump = false
          }

          p.vy += 1500 * dt
          p.x += p.vx * dt
          p.y += p.vy * dt
          p.grounded = false

          makeWorldUntil(s.world, p.x + W + 1000)

          const body = { x: p.x, y: p.y, w: PLAYER.w, h: PLAYER.h }
          for (const platform of s.world.platforms) {
            if (body.x + body.w < platform.x || body.x > platform.x + platform.w) continue
            const previousBottom = p.y + PLAYER.h - p.vy * dt
            if (p.vy >= 0 && previousBottom <= platform.y + 8 && p.y + PLAYER.h >= platform.y && p.y + PLAYER.h <= platform.y + platform.h + 18) {
              p.y = platform.y - PLAYER.h
              p.vy = 0
              p.grounded = true
              p.grace = 0.08
            }
          }

          const playerBox = { x: p.x + 5, y: p.y + 5, w: PLAYER.w - 10, h: PLAYER.h - 8 }
          s.world.collectibles.forEach((item) => {
            if (item.taken) return
            const dx = p.x + PLAYER.w / 2 - item.x
            const dy = p.y + PLAYER.h / 2 - item.y
            if (Math.hypot(dx, dy) < item.r + 26) {
              item.taken = true
              if (item.type === 'acorn') s.acorns += 1
              else s.fireflies += 1
              for (let i = 0; i < 8; i += 1) {
                s.particles.push({ x: item.x, y: item.y, vx: (rand(now + i) - 0.5) * 160, vy: -80 - rand(i) * 120, life: 0.55, color: item.type === 'acorn' ? '#f0a33a' : '#ffe96a' })
              }
            }
          })

          s.world.springPads.forEach((pad) => {
            if (overlaps(playerBox, pad) && p.vy >= 0) {
              p.vy = -850
              p.grounded = false
              s.particles.push({ x: pad.x + pad.w / 2, y: pad.y, vx: 0, vy: -60, life: 0.35, color: '#f472b6' })
            }
          })

          if (now > p.hurtUntil) {
            let damaged = false
            const takeDamage = (knockbackX, knockbackY) => {
              if (damaged) return
              damaged = true
              s.health -= 1
              p.hurtUntil = now + 1200
              p.vx = -p.facing * knockbackX
              p.vy = knockbackY
            }
            s.world.hazards.forEach((hazard) => {
              if (overlaps(playerBox, hazard)) {
                takeDamage(240, -420)
              }
            })
            ;(s.world.movingHazards ?? []).forEach((hazard) => {
              if (overlaps(playerBox, movingHazardBox(hazard, now))) {
                takeDamage(310, -470)
              }
            })
            ;(s.world.fallingHazards ?? []).forEach((hazard) => {
              if (overlaps(playerBox, fallingHazardBox(hazard, now))) {
                takeDamage(230, -520)
              }
            })
          }

          s.particles = s.particles
            .map((pt) => ({ ...pt, x: pt.x + pt.vx * dt, y: pt.y + pt.vy * dt, vy: pt.vy + 260 * dt, life: pt.life - dt }))
            .filter((pt) => pt.life > 0)

          s.bestX = Math.max(s.bestX, p.x)
          s.camera = Math.max(0, p.x - 250)
          const nextScore = Math.max(0, Math.floor(s.bestX / 9) + s.acorns * 55 + s.fireflies * 90)
          if (nextScore !== scoreRef.current) {
            scoreRef.current = nextScore
            setScore(nextScore)
            setSessionScore(nextScore)
          }

          if (p.y > H + 160 || s.health <= 0) {
            s.over = true
            finishGame(nextScore)
          }
        }

        s.world.platforms.forEach((platform) => {
          if (platform.x - s.camera > -260 && platform.x - s.camera < W + 260) drawPlatform(ctx, platform, s.camera)
        })

        s.world.springPads.forEach((pad) => {
          const x = pad.x - s.camera
          if (x < -80 || x > W + 80) return
          const padGradient = ctx.createLinearGradient(0, pad.y, 0, pad.y + pad.h)
          padGradient.addColorStop(0, '#f9a8d4')
          padGradient.addColorStop(0.42, '#ec4899')
          padGradient.addColorStop(1, '#be185d')
          ctx.fillStyle = padGradient
          drawRoundedRect(ctx, x, pad.y, pad.w, pad.h, 8)
          ctx.strokeStyle = '#831843'
          ctx.lineWidth = 1.5
          ctx.stroke()
          ctx.fillStyle = '#fff1f8'
          ctx.fillRect(x + 7, pad.y + 3, pad.w - 14, 3)
        })

        s.world.hazards.forEach((hazard) => {
          const x = hazard.x - s.camera
          if (x < -80 || x > W + 80) return
          const spikeCount = Math.max(3, Math.ceil(hazard.w / 14))
          for (let i = 0; i < spikeCount; i += 1) {
            const left = x + i * 14
            const spike = ctx.createLinearGradient(0, hazard.y, 0, hazard.y + hazard.h)
            spike.addColorStop(0, '#ef4444')
            spike.addColorStop(0.5, '#8b1d1d')
            spike.addColorStop(1, '#461515')
            ctx.fillStyle = spike
            ctx.beginPath()
            ctx.moveTo(left, hazard.y + hazard.h)
            ctx.lineTo(left + 8, hazard.y)
            ctx.lineTo(left + 16, hazard.y + hazard.h)
            ctx.closePath()
            ctx.fill()
            ctx.strokeStyle = 'rgba(54, 18, 18, 0.65)'
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })

        ;(s.world.movingHazards ?? []).forEach((hazard) => drawMovingHazard(ctx, hazard, s.camera, now))
        ;(s.world.fallingHazards ?? []).forEach((hazard) => drawFallingHazard(ctx, hazard, s.camera, now))

        s.world.collectibles.forEach((item) => {
          if (item.taken) return
          const x = item.x - s.camera
          if (x < -80 || x > W + 80) return
          if (item.type === 'acorn') {
            const acorn = ctx.createRadialGradient(x - 5, item.y - 5, 3, x, item.y, 18)
            acorn.addColorStop(0, '#d99b50')
            acorn.addColorStop(0.56, '#9a5a2b')
            acorn.addColorStop(1, '#5c331d')
            ctx.fillStyle = acorn
            ctx.beginPath()
            ctx.ellipse(x, item.y, 12, 15, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = 'rgba(68, 35, 15, 0.55)'
            ctx.lineWidth = 1.5
            ctx.stroke()
            ctx.fillStyle = '#5c331d'
            drawRoundedRect(ctx, x - 11, item.y - 16, 22, 8, 4)
            ctx.fillStyle = '#d6a15d'
            ctx.beginPath()
            ctx.arc(x - 4, item.y - 4, 2.5, 0, Math.PI * 2)
            ctx.fill()
          } else {
            ctx.fillStyle = 'rgba(255, 244, 128, 0.42)'
            ctx.beginPath()
            ctx.arc(x, item.y + Math.sin(now * 0.006 + item.x) * 5, 24, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#fff176'
            ctx.beginPath()
            ctx.arc(x, item.y + Math.sin(now * 0.006 + item.x) * 5, 7, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = 'rgba(255,255,255,0.7)'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(x - 12, item.y - 2)
            ctx.quadraticCurveTo(x, item.y - 12, x + 12, item.y - 2)
            ctx.stroke()
          }
        })

        s.particles.forEach((pt) => {
          ctx.globalAlpha = Math.max(0, pt.life * 1.8)
          ctx.fillStyle = pt.color
          ctx.beginPath()
          ctx.arc(pt.x - s.camera, pt.y, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        })

        if (phaseRef.current !== 'ready') drawPlayer(ctx, s.player, s.camera, now)

        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        drawRoundedRect(ctx, 22, 18, 250, 58, 18)
        ctx.fillStyle = '#173628'
        ctx.textBaseline = 'alphabetic'
        ctx.font = '800 24px Lexend, sans-serif'
        ctx.fillText(`Score ${scoreRef.current}`, 44, 54)
        ctx.font = '700 18px Lexend, sans-serif'
        ctx.fillStyle = '#b91c1c'
        ctx.fillText('♥'.repeat(Math.max(0, s.health)), 188, 54)
      }

      if (phaseRef.current !== 'playing') {
        ctx.fillStyle = 'rgba(10, 35, 24, 0.5)'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = 'rgba(255,255,255,0.95)'
        drawRoundedRect(ctx, 248, 132, 464, 236, 24)
        ctx.fillStyle = '#123b28'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        ctx.font = '900 38px Lexend, sans-serif'
        ctx.fillText(phaseRef.current === 'over' ? 'Forest Run Complete' : 'Forest Explore', W / 2, 195)
        ctx.font = '600 18px Lexend, sans-serif'
        ctx.fillStyle = '#456052'
        ctx.fillText(messageRef.current, W / 2, 238)
        ctx.font = '900 46px Lexend, sans-serif'
        ctx.fillStyle = '#15803d'
        ctx.fillText(`${scoreRef.current}`, W / 2, 300)
        ctx.font = '700 16px Lexend, sans-serif'
        ctx.fillStyle = '#647067'
        ctx.fillText('Press Space or tap Start', W / 2, 336)
        ctx.textAlign = 'left'
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [finishGame, setSessionScore])

  const setControl = (name, value) => {
    keysRef.current[name] = value
  }

  const forestCost = xp?.forest_entry_cost ?? 25
  const xpBalance = xp?.balance ?? 0
  const canStart = xpBalance >= forestCost && !spendingXp

  return (
    <div className="min-h-screen bg-[#e9f7d7] text-slate-900 font-display flex flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-md border-b border-white/70 shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-emerald-700 transition-colors"
          aria-label="Home"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="text-center min-w-0">
          <h1 className="font-black text-lg sm:text-2xl tracking-tight text-emerald-950">Forest Explore</h1>
          <p className="text-xs sm:text-sm text-slate-500 truncate">
            Best: {highScore} · XP: {xpBalance} · Entry: {forestCost}
          </p>
        </div>
        <button
          onClick={startGame}
          disabled={!canStart}
          className={`px-4 py-2 rounded-full font-black shadow-sm border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
            canStart
              ? 'bg-emerald-500 text-white border-emerald-700'
              : 'bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed'
          }`}
        >
          {spendingXp ? 'Spending…' : phase === 'playing' ? `Restart -${forestCost} XP` : `Start -${forestCost} XP`}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-3 py-4 gap-3">
        <div className="w-full max-w-6xl rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-emerald-950">
          <canvas
            ref={canvasRef}
            className="block w-full aspect-video outline-none"
            aria-label="Procedurally generated forest platformer game"
            tabIndex={0}
          />
        </div>

        <div className="w-full max-w-6xl grid grid-cols-2 sm:grid-cols-4 gap-2">
          <HudStat label="Score" value={score} />
          <HudStat label="High Score" value={highScore} />
          <HudStat label="Move" value="A / D" />
          <HudStat label="Jump" value="Space / W" />
        </div>

        <div className="sm:hidden w-full max-w-md grid grid-cols-3 gap-3 pt-1 touch-none select-none">
          <TouchButton label="Left" icon="arrow_back" onChange={(v) => setControl('left', v)} />
          <TouchButton label="Jump" icon="keyboard_arrow_up" onChange={(v) => setControl('jump', v)} />
          <TouchButton label="Right" icon="arrow_forward" onChange={(v) => setControl('right', v)} />
        </div>
      </main>
    </div>
  )
}

function HudStat({ label, value }) {
  return (
    <div className="bg-white/90 rounded-lg px-4 py-3 shadow-sm border border-white/70">
      <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">{label}</div>
      <div className="font-black text-slate-800 text-lg">{value}</div>
    </div>
  )
}

function TouchButton({ label, icon, onChange }) {
  const props = {
    onPointerDown: (event) => {
      event.currentTarget.setPointerCapture(event.pointerId)
      onChange(true)
    },
    onPointerUp: () => onChange(false),
    onPointerCancel: () => onChange(false),
    onPointerLeave: () => onChange(false),
  }

  return (
    <button
      type="button"
      className="h-16 rounded-xl bg-white text-emerald-800 shadow-sm border-b-4 border-emerald-200 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center"
      aria-label={label}
      {...props}
    >
      <span className="material-symbols-outlined text-3xl">{icon}</span>
      <span className="text-xs font-bold">{label}</span>
    </button>
  )
}
