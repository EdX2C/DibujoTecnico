import { useEffect, useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { INNER_R, LENGTH, OUTER_R } from './HandleModel'
import type { DemoMode } from './demoStore'

type Point3 = [number, number, number]
type Segment = [Point3, Point3]

const DIMENSION_COLOR = '#8fe15f'
const FRONT_Z = 0.74

function SegmentLines({ segments, opacity = 1 }: { segments: Segment[]; opacity?: number }) {
  const geometry = useMemo(() => {
    const values = segments.flatMap(([start, end]) => [...start, ...end])
    const next = new THREE.BufferGeometry()
    next.setAttribute('position', new THREE.Float32BufferAttribute(values, 3))
    return next
  }, [segments])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineSegments geometry={geometry} renderOrder={80}>
      <lineBasicMaterial
        color={DIMENSION_COLOR}
        transparent
        opacity={opacity}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  )
}

function ArrowHead({
  position,
  direction,
  opacity = 1,
}: {
  position: Point3
  direction: 'up' | 'down' | 'left' | 'right'
  opacity?: number
}) {
  const rotationZ = {
    up: 0,
    down: Math.PI,
    right: -Math.PI / 2,
    left: Math.PI / 2,
  }[direction]

  return (
    <mesh position={position} rotation={[0, 0, rotationZ]} renderOrder={82}>
      <coneGeometry args={[0.035, 0.105, 12]} />
      <meshBasicMaterial
        color={DIMENSION_COLOR}
        transparent
        opacity={opacity}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

function DimensionLabel({ position, children }: { position: Point3; children: string }) {
  return (
    <Html position={position} center zIndexRange={[30, 20]}>
      <span className="scene-dimension-label">{children}</span>
    </Html>
  )
}

const SOLID_SEGMENTS: Segment[] = [
  [[-LENGTH / 2, -OUTER_R, FRONT_Z], [-LENGTH / 2, -0.86, FRONT_Z]],
  [[LENGTH / 2, -OUTER_R, FRONT_Z], [LENGTH / 2, -0.86, FRONT_Z]],
  [[-LENGTH / 2, -0.82, FRONT_Z], [LENGTH / 2, -0.82, FRONT_Z]],
  [[LENGTH / 2, -OUTER_R, FRONT_Z], [1.64, -OUTER_R, FRONT_Z]],
  [[LENGTH / 2, OUTER_R, FRONT_Z], [1.64, OUTER_R, FRONT_Z]],
  [[1.6, -OUTER_R, FRONT_Z], [1.6, OUTER_R, FRONT_Z]],
]

function SolidDimensions() {
  return (
    <group>
      <SegmentLines segments={SOLID_SEGMENTS} />
      <ArrowHead position={[-LENGTH / 2, -0.82, FRONT_Z]} direction="right" />
      <ArrowHead position={[LENGTH / 2, -0.82, FRONT_Z]} direction="left" />
      <ArrowHead position={[1.6, -OUTER_R, FRONT_Z]} direction="up" />
      <ArrowHead position={[1.6, OUTER_R, FRONT_Z]} direction="down" />
      <DimensionLabel position={[0, -0.82, FRONT_Z]}>130</DimensionLabel>
      <DimensionLabel position={[1.86, 0, FRONT_Z]}>Ø55</DimensionLabel>
    </group>
  )
}

function AbatirDimensions({ cutPosition, opacity }: { cutPosition: number; opacity: number }) {
  const outerDimX = -0.78
  const frontZ = 0.8
  const segments = useMemo<Segment[]>(
    () => [
      [[cutPosition - OUTER_R, -OUTER_R, frontZ], [cutPosition + outerDimX, -OUTER_R, frontZ]],
      [[cutPosition - OUTER_R, OUTER_R, frontZ], [cutPosition + outerDimX, OUTER_R, frontZ]],
      [[cutPosition + outerDimX, -OUTER_R, frontZ], [cutPosition + outerDimX, OUTER_R, frontZ]],
      [[cutPosition - INNER_R, 0, frontZ], [cutPosition + INNER_R, 0, frontZ]],
      [[cutPosition + INNER_R, 0, frontZ], [cutPosition + 0.72, 0.28, frontZ]],
      [[cutPosition + 0.72, 0.28, frontZ], [cutPosition + 1.02, 0.28, frontZ]],
      [[cutPosition + 0.39, -0.39, frontZ], [cutPosition + 0.72, -0.7, frontZ]],
      [[cutPosition + 0.72, -0.7, frontZ], [cutPosition + 1.08, -0.7, frontZ]],
    ],
    [cutPosition, outerDimX],
  )

  return (
    <group>
      <SegmentLines segments={segments} opacity={opacity} />
      <ArrowHead position={[cutPosition + outerDimX, -OUTER_R, frontZ]} direction="up" opacity={opacity} />
      <ArrowHead position={[cutPosition + outerDimX, OUTER_R, frontZ]} direction="down" opacity={opacity} />
      <ArrowHead position={[cutPosition - INNER_R, 0, frontZ]} direction="right" opacity={opacity} />
      <ArrowHead position={[cutPosition + INNER_R, 0, frontZ]} direction="left" opacity={opacity} />
      <ArrowHead position={[cutPosition + 0.39, -0.39, frontZ]} direction="left" opacity={opacity} />
      {opacity > 0.72 && (
        <>
          <DimensionLabel position={[cutPosition - 1.02, 0, frontZ]}>Ø55</DimensionLabel>
          <DimensionLabel position={[cutPosition + 1.18, 0.28, frontZ]}>Ø30</DimensionLabel>
          <DimensionLabel position={[cutPosition + 1.26, -0.7, frontZ]}>12.5</DimensionLabel>
        </>
      )}
    </group>
  )
}

export function TechnicalDimensions({
  mode,
  cutPosition,
  abatirAmount,
}: {
  mode: DemoMode
  cutPosition: number
  abatirAmount: number
}) {
  if (mode === 'solid') return <SolidDimensions />
  if (mode === 'abatir' && abatirAmount > 0.4) {
    return <AbatirDimensions cutPosition={cutPosition} opacity={THREE.MathUtils.smoothstep(abatirAmount, 0.4, 0.82)} />
  }
  return null
}
