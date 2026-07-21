import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'

/* La pieza del demo: un buje — casquillo alargado (largo > diámetro) con agujero pasante.
   Coincide con la pieza del ejercicio gráfico. */
export const OUTER_R = 0.55
export const INNER_R = 0.3
export const LENGTH = 2.6
const CHAMFER = 0.035

export type CutAxis = 'x' | 'y'

function tubeGeometry() {
  const radialSegments = 64
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const geometry = new THREE.BufferGeometry()

  const addStrip = (
    a: { x: number; r: number },
    b: { x: number; r: number },
    inward: boolean,
    materialIndex: number,
  ) => {
    const vertexStart = positions.length / 3
    const indexStart = indices.length
    const slope = (b.r - a.r) / (b.x - a.x)

    for (let i = 0; i <= radialSegments; i += 1) {
      const u = i / radialSegments
      const angle = u * Math.PI * 2
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const normal = new THREE.Vector3(-slope, cos, sin).normalize()
      if (inward) normal.multiplyScalar(-1)

      for (const [v, ring] of [a, b].entries()) {
        positions.push(ring.x, ring.r * cos, ring.r * sin)
        normals.push(normal.x, normal.y, normal.z)
        uvs.push(u, v)
      }
    }

    for (let i = 0; i < radialSegments; i += 1) {
      const a0 = vertexStart + i * 2
      const b0 = a0 + 1
      const a1 = a0 + 2
      const b1 = a0 + 3
      indices.push(a0, b0, a1, a1, b0, b1)
    }

    geometry.addGroup(indexStart, radialSegments * 6, materialIndex)
  }

  const addEndFace = (x: number, normalX: number) => {
    const vertexStart = positions.length / 3
    const indexStart = indices.length
    const outerFaceR = OUTER_R - CHAMFER
    const innerFaceR = INNER_R + CHAMFER

    for (let i = 0; i <= radialSegments; i += 1) {
      const u = i / radialSegments
      const angle = u * Math.PI * 2
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      positions.push(x, outerFaceR * cos, outerFaceR * sin)
      positions.push(x, innerFaceR * cos, innerFaceR * sin)
      normals.push(normalX, 0, 0, normalX, 0, 0)
      uvs.push(u, 1, u, 0)
    }

    for (let i = 0; i < radialSegments; i += 1) {
      const outer0 = vertexStart + i * 2
      const inner0 = outer0 + 1
      const outer1 = outer0 + 2
      const inner1 = outer0 + 3
      indices.push(outer0, inner0, outer1, outer1, inner0, inner1)
    }

    geometry.addGroup(indexStart, radialSegments * 6, 2)
  }

  const leftX = -LENGTH / 2
  const rightX = LENGTH / 2
  const outerRings = [
    { x: leftX, r: OUTER_R - CHAMFER },
    { x: leftX + CHAMFER, r: OUTER_R },
    { x: rightX - CHAMFER, r: OUTER_R },
    { x: rightX, r: OUTER_R - CHAMFER },
  ]
  const innerRings = [
    { x: leftX, r: INNER_R + CHAMFER },
    { x: leftX + CHAMFER, r: INNER_R },
    { x: rightX - CHAMFER, r: INNER_R },
    { x: rightX, r: INNER_R + CHAMFER },
  ]

  for (let i = 0; i < outerRings.length - 1; i += 1) addStrip(outerRings[i], outerRings[i + 1], false, 0)
  for (let i = 0; i < innerRings.length - 1; i += 1) addStrip(innerRings[i], innerRings[i + 1], true, 1)
  addEndFace(leftX, -1)
  addEndFace(rightX, 1)

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  return geometry
}

export function BujeBody({
  opacity = 1,
  color = '#6d8499',
  position = [0, 0, 0] as [number, number, number],
  clipPlanes,
  ghost = false,
}: {
  opacity?: number
  color?: string
  position?: [number, number, number]
  clipPlanes?: THREE.Plane[]
  ghost?: boolean
}) {
  const geo = useMemo(tubeGeometry, [])

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        metalness: ghost ? 0.12 : 0.24,
        roughness: ghost ? 0.62 : 0.36,
        clearcoat: ghost ? 0 : 0.12,
        clearcoatRoughness: 0.3,
        transparent: opacity < 1,
        opacity,
        side: THREE.DoubleSide,
        clipShadows: true,
        depthWrite: opacity > 0.92,
        envMapIntensity: 0.7,
      }),
    [color, ghost, opacity],
  )

  const boreMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: ghost ? '#334650' : '#17242c',
        metalness: ghost ? 0.1 : 0.42,
        roughness: 0.5,
        transparent: opacity < 1,
        opacity: ghost ? opacity * 0.72 : opacity,
        side: THREE.DoubleSide,
        depthWrite: opacity > 0.92,
      }),
    [ghost, opacity],
  )

  const endMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: ghost ? '#536572' : '#93aabd',
        metalness: ghost ? 0.1 : 0.22,
        roughness: ghost ? 0.6 : 0.37,
        clearcoat: ghost ? 0 : 0.1,
        transparent: opacity < 1,
        opacity,
        side: THREE.DoubleSide,
        depthWrite: opacity > 0.92,
      }),
    [ghost, opacity],
  )

  material.opacity = opacity
  material.transparent = opacity < 1
  material.depthWrite = opacity > 0.92
  material.color.set(color)
  material.clippingPlanes = clipPlanes ?? []
  material.needsUpdate = true
  boreMaterial.opacity = ghost ? opacity * 0.72 : opacity
  boreMaterial.transparent = opacity < 1
  boreMaterial.depthWrite = opacity > 0.92
  boreMaterial.clippingPlanes = clipPlanes ?? []
  boreMaterial.needsUpdate = true
  endMaterial.opacity = opacity
  endMaterial.transparent = opacity < 1
  endMaterial.depthWrite = opacity > 0.92
  endMaterial.clippingPlanes = clipPlanes ?? []
  endMaterial.needsUpdate = true

  return (
    <group position={position}>
      <mesh geometry={geo} material={[material, boreMaterial, endMaterial]} castShadow={!ghost} receiveShadow={!ghost}>
        <Edges
          threshold={22}
          scale={1.001}
          color={ghost ? '#607986' : '#e4edf4'}
          transparent
          opacity={ghost ? 0.32 : 0.68}
        />
      </mesh>
    </group>
  )
}

export function AnnularCutFace({
  cutPos,
  opacity = 1,
}: {
  cutPos: number
  opacity?: number
}) {
  return (
    <group position={[cutPos + 0.012, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <mesh renderOrder={18}>
        <ringGeometry args={[INNER_R, OUTER_R, 48]} />
        <meshBasicMaterial
          color="#14272d"
          transparent
          opacity={Math.max(0.16, opacity * 0.92)}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.006]} renderOrder={19}>
        <planeGeometry args={[OUTER_R * 2.16, OUTER_R * 2.16]} />
        <meshBasicMaterial
          transparent
          opacity={Math.max(0.18, opacity)}
          side={THREE.DoubleSide}
          depthTest={false}
          depthWrite={false}
          map={makeAnnulusTexture()}
        />
      </mesh>
    </group>
  )
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
  const trailAmounts = [Math.max(0, amount - 0.12), Math.max(0, amount - 0.26)]

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
    <>
      {axis === 'x' && amount > 0.08 && amount < 0.98 &&
        trailAmounts.map((trailAmount, index) => (
          <mesh
            key={index}
            position={[cutPos, 0, 0]}
            rotation={[0, (Math.PI / 2) * (1 - trailAmount), 0]}
            renderOrder={18 + index}
          >
            <ringGeometry args={[INNER_R, OUTER_R, 48]} />
            <meshBasicMaterial
              color="#53d5e0"
              transparent
              opacity={index === 0 ? 0.12 : 0.055}
              side={THREE.DoubleSide}
              depthTest={false}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        ))}
      <group ref={group}>
      {axis === 'x' ? (
        <>
          <mesh rotation={[0, Math.PI / 2, 0]} renderOrder={20}>
            <ringGeometry args={[INNER_R, OUTER_R, 48]} />
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
          <mesh rotation={[0, Math.PI / 2, 0]} position={[0.008, 0, 0]} renderOrder={22}>
            <ringGeometry args={[OUTER_R * 0.982, OUTER_R * 1.025, 64]} />
            <meshBasicMaterial
              color="#53d5e0"
              transparent
              opacity={0.12 + amount * 0.52}
              side={THREE.DoubleSide}
              depthTest={false}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]} position={[0.009, 0, 0]} renderOrder={23}>
            <ringGeometry args={[INNER_R * 0.955, INNER_R * 1.04, 64]} />
            <meshBasicMaterial
              color="#53d5e0"
              transparent
              opacity={0.1 + amount * 0.44}
              side={THREE.DoubleSide}
              depthTest={false}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
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
        </>
      )}
      </group>
    </>
  )
}

export function CuttingPlaneVisual({
  pos,
  axis = 'x',
  angle = 0,
  label = 'A',
  showSheet = true,
}: {
  pos: number
  axis?: CutAxis
  angle?: number
  label?: string
  showSheet?: boolean
}) {
  if (axis === 'y') {
    // plano horizontal a la altura y=pos, extendido a lo largo de X
    return (
      <group position={[0, pos, 0]}>
        {showSheet && (
          <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={8}>
            <planeGeometry args={[LENGTH + 0.4, OUTER_R * 2 + 0.4]} />
            <meshBasicMaterial
              color="#ff6b2e"
              transparent
              opacity={0.075}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        )}
        <CuttingTrace axis="x" />
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
      {showSheet && (
        <mesh rotation={[0, Math.PI / 2, 0]} renderOrder={8}>
          <planeGeometry args={[OUTER_R * 2 + 1.15, OUTER_R * 2 + 1.15]} />
          <meshBasicMaterial
            color="#ff6b2e"
            transparent
            opacity={0.07}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
      <CuttingTrace axis="y" />
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

/* La traza A–A es recta, pero su tipo de línea es mixto: raya larga y punto.
   Los extremos engrosados y las flechas se dibujan por separado. */
function CuttingTrace({ axis }: { axis: 'x' | 'y' }) {
  const dashPositions = axis === 'y' ? [-0.86, -0.29, 0.29, 0.86] : [-1.12, -0.38, 0.38, 1.12]
  const dotPositions = axis === 'y' ? [-0.575, 0, 0.575] : [-0.75, 0, 0.75]
  const dashLength = axis === 'y' ? 0.32 : 0.42

  return (
    <group>
      {dashPositions.map((p) => (
        <mesh key={`dash-${p}`} position={axis === 'y' ? [0, p, 0.015] : [p, 0.015, 0]} renderOrder={30}>
          <boxGeometry args={axis === 'y' ? [0.035, dashLength, 0.035] : [dashLength, 0.035, 0.035]} />
          <meshBasicMaterial color="#ff6b2e" depthTest={false} />
        </mesh>
      ))}
      {dotPositions.map((p) => (
        <mesh key={`dot-${p}`} position={axis === 'y' ? [0, p, 0.015] : [p, 0.015, 0]} renderOrder={30}>
          <boxGeometry args={[0.055, 0.055, 0.04]} />
          <meshBasicMaterial color="#ff6b2e" depthTest={false} />
        </mesh>
      ))}
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
  const size = 256
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
  ctx.lineWidth = 3
  for (let d = -size; d < size; d += 16) {
    ctx.beginPath()
    ctx.moveTo(d, size)
    ctx.lineTo(d + size, 0)
    ctx.stroke()
  }
  ctx.restore()

  ctx.strokeStyle = '#e7eef5'
  ctx.lineWidth = 4
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
  const w = 384
  const h = 180
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
    ctx.lineWidth = 3
    for (let d = -h; d < w; d += 18) {
      ctx.beginPath()
      ctx.moveTo(d, b.y1)
      ctx.lineTo(d + h, b.y0)
      ctx.stroke()
    }
    ctx.restore()
  }

  // 3) bordes del taladro (líneas interiores de cada pared)
  ctx.strokeStyle = '#ff6b2e'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(0, wall)
  ctx.lineTo(w, wall)
  ctx.moveTo(0, h - wall)
  ctx.lineTo(w, h - wall)
  ctx.stroke()

  // 4) contorno exterior completo (silueta del cilindro en sección)
  ctx.strokeStyle = '#ff8a54'
  ctx.lineWidth = 5
  ctx.strokeRect(5, 5, w - 10, h - 10)

  // 5) eje del taladro (línea de centro trazo y punto)
  ctx.strokeStyle = '#7aa0b0'
  ctx.lineWidth = 2
  ctx.setLineDash([14, 6, 3, 6])
  ctx.beginPath()
  ctx.moveTo(0, h / 2)
  ctx.lineTo(w, h / 2)
  ctx.stroke()
  ctx.setLineDash([])

  longitudinalTexture = new THREE.CanvasTexture(canvas)
  return longitudinalTexture
}
