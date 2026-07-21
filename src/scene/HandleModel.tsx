import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

/* La pieza del demo: un buje — casquillo alargado (largo > diámetro) con agujero pasante.
   Coincide con la pieza del ejercicio gráfico. */
export const OUTER_R = 0.55
export const INNER_R = 0.3
export const LENGTH = 2.6

export type CutAxis = 'x' | 'y'

function tubeGeometry() {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, OUTER_R, 0, Math.PI * 2, false)
  const hole = new THREE.Path()
  hole.absarc(0, 0, INNER_R, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: LENGTH,
    bevelEnabled: false,
    curveSegments: 64,
  })
  geo.translate(0, 0, -LENGTH / 2)
  geo.rotateY(Math.PI / 2)
  return geo
}

export function BujeBody({
  opacity = 1,
  color = '#6d8499',
  position = [0, 0, 0] as [number, number, number],
  clipPlanes,
}: {
  opacity?: number
  color?: string
  position?: [number, number, number]
  clipPlanes?: THREE.Plane[]
}) {
  const geo = useMemo(tubeGeometry, [])

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0.55,
        roughness: 0.35,
        transparent: opacity < 1,
        opacity,
        side: THREE.DoubleSide,
        clipShadows: true,
      }),
    [color, opacity],
  )

  material.opacity = opacity
  material.transparent = opacity < 1
  material.color.set(color)
  material.clippingPlanes = clipPlanes ?? []
  material.needsUpdate = true

  return <mesh geometry={geo} material={material} position={position} castShadow receiveShadow />
}

/* Sección A–A del buje que se abate 90° y permanece superpuesta en la vista.
   axis 'x' = corte transversal (corona circular).
   axis 'y' = corte longitudinal (dos bandas de pared + hueco del taladro). */
export function AbatirSection({
  amount,
  cutPos,
  axis = 'x',
}: {
  amount: number
  cutPos: number
  axis?: CutAxis
}) {
  const group = useRef<THREE.Group>(null)

  useFrame(() => {
    const g = group.current
    if (!g) return
    if (axis === 'x') {
      // de canto (+X) → de frente (+Z), conservando el centro en A–A
      g.rotation.set(0, (-Math.PI / 2) * amount, 0)
      g.position.set(cutPos, 0, 0)
    } else {
      // sección horizontal: gira sobre el eje X sin abandonar su plano
      g.rotation.set((Math.PI / 2) * amount, 0, 0)
      g.position.set(0, cutPos, 0)
    }
  })

  return (
    <group ref={group}>
      {axis === 'x' ? (
        <>
          <mesh rotation={[0, Math.PI / 2, 0]} renderOrder={20}>
            <ringGeometry args={[INNER_R, OUTER_R, 64]} />
            <meshBasicMaterial
              color="#1e3a40"
              transparent
              opacity={0.15 + amount * 0.75}
              side={THREE.DoubleSide}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]} position={[0.004, 0, 0]} renderOrder={21}>
            <planeGeometry args={[OUTER_R * 2.16, OUTER_R * 2.16]} />
            <meshBasicMaterial
              transparent
              opacity={0.3 + amount * 0.7}
              side={THREE.DoubleSide}
              depthTest={false}
              depthWrite={false}
              map={makeAnnulusTexture()}
            />
          </mesh>
          <sprite position={[0.2, 0.85, 0]} scale={[0.9, 0.35, 1]}>
            <spriteMaterial transparent depthTest={false} map={makeTextTexture('A-A')} />
          </sprite>
        </>
      ) : (
        <>
          {/* fondo sólido del panel (silueta del cilindro cortado a lo largo) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.003, 0]} renderOrder={20}>
            <planeGeometry args={[LENGTH, OUTER_R * 2]} />
            <meshBasicMaterial
              color="#12242a"
              transparent
              opacity={0.15 + amount * 0.75}
              side={THREE.DoubleSide}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
          {/* rayado, paredes y contorno de la sección longitudinal */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={21}>
            <planeGeometry args={[LENGTH, OUTER_R * 2]} />
            <meshBasicMaterial
              transparent
              opacity={0.3 + amount * 0.7}
              side={THREE.DoubleSide}
              depthTest={false}
              depthWrite={false}
              map={makeLongitudinalTexture()}
            />
          </mesh>
          {/* la etiqueta se ancla en X para que la rotación sobre X no la esconda */}
          <sprite position={[LENGTH / 2 + 0.35, 0, 0]} scale={[0.9, 0.35, 1]}>
            <spriteMaterial transparent depthTest={false} map={makeTextTexture('A-A')} />
          </sprite>
        </>
      )}
    </group>
  )
}

export function CuttingPlaneVisual({
  pos,
  axis = 'x',
  angle = 0,
  label = 'A',
}: {
  pos: number
  axis?: CutAxis
  angle?: number
  label?: string
}) {
  if (axis === 'y') {
    // plano horizontal a la altura y=pos, extendido a lo largo de X
    return (
      <group position={[0, pos, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[LENGTH + 0.4, OUTER_R * 2 + 0.4]} />
          <meshBasicMaterial color="#ff6b2e" transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[LENGTH / 2 + 0.2, 0, 0]}>
          <boxGeometry args={[0.16, 0.05, 0.05]} />
          <meshBasicMaterial color="#ff6b2e" />
        </mesh>
        <mesh position={[-LENGTH / 2 - 0.2, 0, 0]}>
          <boxGeometry args={[0.16, 0.05, 0.05]} />
          <meshBasicMaterial color="#ff6b2e" />
        </mesh>
        <ArrowMarker position={[LENGTH / 2 + 0.05, 0.32, 0]} dir={-1} vertical />
        <ArrowMarker position={[-LENGTH / 2 - 0.05, 0.32, 0]} dir={-1} vertical />
        <HtmlLabel position={[LENGTH / 2 + 0.32, 0.15, 0]} text={label} />
        <HtmlLabel position={[-LENGTH / 2 - 0.32, 0.15, 0]} text={label} />
      </group>
    )
  }
  return (
    <group position={[pos, 0, 0]} rotation={[0, 0, angle]}>
      <mesh>
        <planeGeometry args={[0.02, 2.0]} />
        <meshBasicMaterial color="#ff6b2e" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.12, 0]}>
        <boxGeometry args={[0.06, 0.18, 0.06]} />
        <meshBasicMaterial color="#ff6b2e" />
      </mesh>
      <mesh position={[0, -1.12, 0]}>
        <boxGeometry args={[0.06, 0.18, 0.06]} />
        <meshBasicMaterial color="#ff6b2e" />
      </mesh>
      <ArrowMarker position={[0.35, 0.98, 0]} dir={-1} />
      <ArrowMarker position={[0.35, -0.98, 0]} dir={-1} />
      <HtmlLabel position={[0.15, 1.32, 0]} text={label} />
      <HtmlLabel position={[0.15, -1.32, 0]} text={label} />
    </group>
  )
}

function ArrowMarker({
  position,
  dir,
  vertical = false,
}: {
  position: [number, number, number]
  dir: number
  vertical?: boolean
}) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, vertical ? 0 : Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.45, 8]} />
        <meshBasicMaterial color="#53d5e0" />
      </mesh>
      <mesh
        position={vertical ? [0, dir * 0.28, 0] : [dir * 0.28, 0, 0]}
        rotation={[0, 0, vertical ? (dir > 0 ? 0 : Math.PI) : dir > 0 ? -Math.PI / 2 : Math.PI / 2]}
      >
        <coneGeometry args={[0.05, 0.12, 12]} />
        <meshBasicMaterial color="#53d5e0" />
      </mesh>
    </group>
  )
}

function HtmlLabel({ position, text }: { position: [number, number, number]; text: string }) {
  return (
    <sprite position={position} scale={[0.35, 0.35, 1]}>
      <spriteMaterial transparent depthTest={false} map={makeTextTexture(text)} />
    </sprite>
  )
}

const textureCache = new Map<string, THREE.CanvasTexture>()

function makeTextTexture(text: string) {
  const cached = textureCache.get(text)
  if (cached) return cached
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, 128, 128)
  ctx.fillStyle = '#ff8a54'
  ctx.font = 'bold 72px IBM Plex Mono, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 64, 64)
  const tex = new THREE.CanvasTexture(canvas)
  textureCache.set(text, tex)
  return tex
}

let annulusTexture: THREE.CanvasTexture | null = null

/** Corona con rayado a 45°; el agujero queda transparente. */
function makeAnnulusTexture() {
  if (annulusTexture) return annulusTexture
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const outer = size / 2 / 1.08
  const inner = outer * (INNER_R / OUTER_R)

  const ring = new Path2D()
  ring.arc(cx, cx, outer, 0, Math.PI * 2, false)
  ring.arc(cx, cx, inner, 0, Math.PI * 2, true)

  ctx.save()
  ctx.clip(ring, 'evenodd')
  ctx.strokeStyle = '#53d5e0'
  ctx.lineWidth = 5
  for (let d = -size; d < size; d += 30) {
    ctx.beginPath()
    ctx.moveTo(d, size)
    ctx.lineTo(d + size, 0)
    ctx.stroke()
  }
  ctx.restore()

  ctx.strokeStyle = '#ff6b2e'
  ctx.lineWidth = 9
  ctx.beginPath()
  ctx.arc(cx, cx, outer - 4, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cx, inner + 4, 0, Math.PI * 2)
  ctx.stroke()

  annulusTexture = new THREE.CanvasTexture(canvas)
  return annulusTexture
}

let longitudinalTexture: THREE.CanvasTexture | null = null

/** Sección longitudinal del tubo: silueta rectangular (largo × Ø exterior),
    las dos paredes rayadas con relleno sólido y el taladro (banda central)
    marcado con su eje. Se lee como el cilindro cortado a lo largo y girado. */
function makeLongitudinalTexture() {
  if (longitudinalTexture) return longitudinalTexture
  const w = 512
  const h = 240
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, w, h)

  // fracción de la altura ocupada por el taladro (centro), resto = paredes
  const boreFrac = INNER_R / OUTER_R // 0.545
  const wall = (h * (1 - boreFrac)) / 2
  const bands = [
    { y0: 0, y1: wall },
    { y0: h - wall, y1: h },
  ]

  // 1) relleno sólido de las paredes (material cortado)
  ctx.fillStyle = '#1e3a40'
  for (const b of bands) ctx.fillRect(0, b.y0, w, b.y1 - b.y0)

  // 2) rayado a 45° dentro de cada pared
  for (const b of bands) {
    ctx.save()
    const clip = new Path2D()
    clip.rect(0, b.y0, w, b.y1 - b.y0)
    ctx.clip(clip)
    ctx.strokeStyle = '#53d5e0'
    ctx.lineWidth = 4
    for (let d = -h; d < w; d += 26) {
      ctx.beginPath()
      ctx.moveTo(d, b.y1)
      ctx.lineTo(d + h, b.y0)
      ctx.stroke()
    }
    ctx.restore()
  }

  // 3) bordes del taladro (líneas interiores de cada pared)
  ctx.strokeStyle = '#ff6b2e'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(0, wall)
  ctx.lineTo(w, wall)
  ctx.moveTo(0, h - wall)
  ctx.lineTo(w, h - wall)
  ctx.stroke()

  // 4) contorno exterior completo (silueta del cilindro en sección)
  ctx.strokeStyle = '#ff8a54'
  ctx.lineWidth = 9
  ctx.strokeRect(5, 5, w - 10, h - 10)

  // 5) eje del taladro (línea de centro trazo y punto)
  ctx.strokeStyle = '#7aa0b0'
  ctx.lineWidth = 3
  ctx.setLineDash([20, 8, 4, 8])
  ctx.beginPath()
  ctx.moveTo(0, h / 2)
  ctx.lineTo(w, h / 2)
  ctx.stroke()
  ctx.setLineDash([])

  longitudinalTexture = new THREE.CanvasTexture(canvas)
  return longitudinalTexture
}
