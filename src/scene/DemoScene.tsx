import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import {
  AbatirSection,
  AnnularCutFace,
  BujeBody,
  CuttingPlaneVisual,
  INNER_R,
  OUTER_R,
  type CutAxis,
} from './HandleModel'
import type { DemoMode } from './demoStore'
import { TechnicalDimensions } from './SceneDimensions'

interface DemoSceneProps {
  embedded?: boolean
  onOpenFullscreen?: () => void
}

export function DemoScene({ embedded = false, onOpenFullscreen }: DemoSceneProps) {
  const [mode, setMode] = useState<DemoMode>('solid')
  const [cutAxis, setCutAxis] = useState<CutAxis>('x')
  const [cutPosition, setCutPosition] = useState(0)
  const [revealAmount, setRevealAmount] = useState(0)
  const [abatirAmount, setAbatirAmount] = useState(0)
  const [concurrenteAmount, setConcurrenteAmount] = useState(0)
  const [autoOrbit, setAutoOrbit] = useState(false)
  const animRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null)

  const posLimit = cutAxis === 'x' ? 0.9 : 0.45

  const runMode = (next: DemoMode) => {
    animRef.current?.kill()
    setMode(next)

    if (next === 'solid') {
      setAutoOrbit(false)
      const state = { r: revealAmount, a: abatirAmount, c: concurrenteAmount }
      animRef.current = gsap.to(state, {
        r: 0,
        a: 0,
        c: 0,
        duration: 0.8,
        ease: 'power3.inOut',
        onUpdate: () => {
          setRevealAmount(state.r)
          setAbatirAmount(state.a)
          setConcurrenteAmount(state.c)
        },
      })
      return
    }

    if (next === 'reveal') {
      setAutoOrbit(false)
      setAbatirAmount(0)
      setConcurrenteAmount(0)
      const state = { r: 0 }
      animRef.current = gsap.to(state, {
        r: 1,
        duration: 1.4,
        ease: 'power3.inOut',
        onUpdate: () => setRevealAmount(state.r),
      })
      return
    }

    if (next === 'abatir') {
      setAutoOrbit(false)
      const tl = gsap.timeline()
      animRef.current = tl
      const revealState = { r: revealAmount }
      const abatirState = { a: 0 }
      setConcurrenteAmount(0)
      tl.to(revealState, {
        r: 0.85,
        duration: 0.7,
        ease: 'power2.inOut',
        onUpdate: () => setRevealAmount(revealState.r),
      }).to(
        abatirState,
        {
          a: 1,
          duration: 1.5,
          ease: 'power3.inOut',
          onUpdate: () => setAbatirAmount(abatirState.a),
        },
        '-=0.2',
      )
      return
    }

    if (next === 'concurrente') {
      setCutAxis('x')
      setRevealAmount(0.5)
      setAbatirAmount(0)
      const state = { c: 0 }
      animRef.current = gsap.to(state, {
        c: 1,
        duration: 1.6,
        ease: 'power3.inOut',
        onUpdate: () => setConcurrenteAmount(state.c),
      })
    }
  }

  const switchAxis = (axis: CutAxis) => {
    animRef.current?.kill()
    setCutAxis(axis)
    setCutPosition(0)
    setRevealAmount(0)
    setAbatirAmount(0)
    setConcurrenteAmount(0)
    setMode('solid')
  }

  return (
    <div className={embedded ? 'demo-wrap' : 'fullscreen-demo'}>
      <div className="demo-toolbar">
        <button
          type="button"
          className={`tool-btn ${mode === 'solid' ? 'is-active' : ''}`}
          onClick={() => runMode('solid')}
        >
          1 · Exterior
        </button>
        <button
          type="button"
          className={`tool-btn primary ${mode === 'reveal' ? 'is-active' : ''}`}
          onClick={() => runMode('reveal')}
        >
          2 · Revelar interior
        </button>
        <button
          type="button"
          className={`tool-btn primary ${mode === 'abatir' ? 'is-active' : ''}`}
          onClick={() => runMode('abatir')}
        >
          3 · Girar 90°
        </button>
        <div className="spacer" />
        {embedded && onOpenFullscreen && (
          <button type="button" className="tool-btn" onClick={onOpenFullscreen}>
            Pantalla completa ↗
          </button>
        )}
        <details className="demo-advanced">
          <summary className="tool-btn">Más opciones</summary>
          <div className="demo-advanced-panel">
            <button
              type="button"
              className={`tool-btn ${mode === 'concurrente' ? 'is-active' : ''}`}
              onClick={() => runMode('concurrente')}
            >
              Planos concurrentes
            </button>
            <span className="tool-sep" />
            <button
              type="button"
              className={`tool-btn ${cutAxis === 'x' ? 'is-active' : ''}`}
              onClick={() => switchAxis('x')}
              title="Corte transversal (corona circular)"
            >
              Corte transversal
            </button>
            <button
              type="button"
              className={`tool-btn ${cutAxis === 'y' ? 'is-active' : ''}`}
              onClick={() => switchAxis('y')}
              title="Corte longitudinal (a lo largo del taladro)"
            >
              Corte longitudinal
            </button>
            <label className="tool-btn" style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
              Plano
              <input
                type="range"
                min={-posLimit}
                max={posLimit}
                step={0.01}
                value={cutPosition}
                onChange={(e) => setCutPosition(Number(e.target.value))}
                style={{ width: 110 }}
              />
            </label>
            <button type="button" className="tool-btn" onClick={() => setAutoOrbit((v) => !v)}>
              {autoOrbit ? 'Pausar órbita' : 'Auto-órbita'}
            </button>
          </div>
        </details>
      </div>

      <div className="canvas-frame">
        <Canvas
          dpr={[1, 1.4]}
          shadows
          gl={{
            antialias: true,
            localClippingEnabled: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
        >
          <color attach="background" args={['#0d1016']} />
          <fog attach="fog" args={['#0d1016', 8, 15]} />
          <Suspense fallback={null}>
            <SceneContent
              cutAxis={cutAxis}
              cutPosition={cutPosition}
              revealAmount={revealAmount}
              abatirAmount={abatirAmount}
              concurrenteAmount={concurrenteAmount}
              mode={mode}
              autoOrbit={autoOrbit}
            />
          </Suspense>
        </Canvas>
        <div className={`demo-tech-label mode-${mode}`} aria-hidden="true">
          {mode === 'solid' && (
            <>
              PLANO A–A
              <span>VISTA ESPACIAL · L 130 mm · Ø55 mm</span>
            </>
          )}
          {mode === 'reveal' && (
            <>
              SECCIÓN DE CANTO
              <span>VISTA ORTOGONAL · PERFIL AÚN EN SU PLANO</span>
            </>
          )}
          {mode === 'abatir' && (
            <>
              SECCIÓN ABATIDA A–A
              <span>VERDADERA MAGNITUD · Ø55 · Ø30 · e 12.5 mm</span>
            </>
          )}
          {mode === 'concurrente' && (
            <>
              PLANOS CONCURRENTES
              <span>INTERSECCIÓN COMÚN</span>
            </>
          )}
        </div>
        {mode === 'abatir' && (
          <div className="demo-rotation-cue" aria-hidden="true">
            <svg viewBox="0 0 170 126" role="img" aria-label="Giro de noventa grados">
              <defs>
                <marker id="rotation-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff6b2e" />
                </marker>
              </defs>
              <path d="M24 105 A82 82 0 0 1 130 24" markerEnd="url(#rotation-arrow)" />
              <text x="93" y="33">90°</text>
            </svg>
          </div>
        )}
        <div className="demo-units-badge" aria-hidden="true">
          COTAS VERDES · UNIDADES mm
        </div>
        <div className="demo-hint">
          {mode === 'solid' &&
            (cutAxis === 'x'
              ? 'Paso 1 · La abertura es visible, pero no revela el espesor interior.'
              : 'Corte longitudinal: el plano recorre el eje del taladro. Pulse Revelar.')}
          {mode === 'reveal' &&
            (cutAxis === 'x'
              ? 'Paso 2 · La mitad retirada queda tenue; la sección todavía se observa de canto sobre A–A.'
              : 'Se retira la mitad superior: se ven las dos paredes y el hueco del taladro.')}
          {mode === 'abatir' && 'Paso 3 · La sección gira 90° y permite leer Ø55, Ø30 y una pared de 12.5 mm en verdadera magnitud.'}
          {mode === 'concurrente' && 'El plano B gira hasta alinearse con A: todo en una sola vista.'}
        </div>
      </div>
    </div>
  )
}

function SceneContent({
  cutAxis,
  cutPosition,
  revealAmount,
  abatirAmount,
  concurrenteAmount,
  mode,
  autoOrbit,
}: {
  cutAxis: CutAxis
  cutPosition: number
  revealAmount: number
  abatirAmount: number
  concurrenteAmount: number
  mode: DemoMode
  autoOrbit: boolean
}) {
  const { gl, camera } = useThree()
  useEffect(() => {
    gl.localClippingEnabled = true
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.08
    gl.outputColorSpace = THREE.SRGBColorSpace
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap
  }, [gl])

  const frontClip = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), [])
  const backClip = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), [])

  const removedOffset = revealAmount * 1.8
  const showHatch = revealAmount > 0.15 || abatirAmount > 0.05

  // Removed half slides along the cut axis
  const removedPos: [number, number, number] =
    cutAxis === 'x'
      ? [removedOffset, 0, revealAmount * 0.35]
      : [0, removedOffset, revealAmount * 0.35]
  const spatialCamera = useMemo(() => new THREE.Vector3(4.8, 2.6, 6.3), [])
  const technicalCamera = useMemo(() => new THREE.Vector3(0, 0.85, 6.6), [])

  useFrame(() => {
    if (!autoOrbit && mode !== 'concurrente') {
      const technicalView = THREE.MathUtils.smoothstep(revealAmount, 0.05, 0.82)
      camera.position.lerpVectors(spatialCamera, technicalCamera, technicalView)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
    }

    // Clipping planes live in WORLD space and do NOT follow an object's own
    // transform. The kept half sits at the origin, so its plane stays at cutPosition.
    // The removed half is translated by `removedOffset` along the cut axis, so its
    // plane's constant must be shifted by the same amount — otherwise the whole
    // (unclipped) tube slides away and it looks like it "grows".
    if (cutAxis === 'x') {
      frontClip.normal.set(-1, 0, 0)
      backClip.normal.set(1, 0, 0)
    } else {
      frontClip.normal.set(0, -1, 0)
      backClip.normal.set(0, 1, 0)
    }
    // Kept half: keep the far side of the cut plane.
    frontClip.constant = cutPosition
    // Removed half: keep the near side, following the mesh as it slides away.
    backClip.constant = -(cutPosition + removedOffset)
  })

  const plane2Angle = THREE.MathUtils.lerp(-Math.PI / 3, -0.12, concurrenteAmount)

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0.85, 6.6]} zoom={122} near={0.1} far={100} />
      <ambientLight intensity={0.42} />
      <hemisphereLight color="#d9e8f4" groundColor="#101820" intensity={0.82} />
      <directionalLight
        position={[4.5, 6, 5]}
        intensity={2.05}
        color="#f2f7fb"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={18}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight position={[0, 1.2, 7]} intensity={1.15} color="#a9cadd" />
      <spotLight position={[-4, 3.4, 4.5]} intensity={1.35} angle={0.52} penumbra={0.9} color="#53d5e0" />
      <spotLight position={[3, -0.2, 5]} intensity={0.72} angle={0.5} penumbra={1} color="#ff9a68" />
      <pointLight position={[-2.8, 0.5, -2.5]} intensity={0.55} color="#8fb9d2" />

      <group>
        <BujeBody clipPlanes={revealAmount > 0.01 ? [frontClip] : []} color="#7a91a8" />

        {revealAmount > 0.01 && (
          <BujeBody
            clipPlanes={[backClip]}
            color="#657581"
            opacity={Math.max(0.2, 1 - revealAmount * 0.82)}
            position={removedPos}
            ghost
          />
        )}

        {/* cara del corte en la pieza (antes de abatir del todo) */}
        {showHatch &&
          abatirAmount < 0.98 &&
          (cutAxis === 'x' ? (
            <AnnularCutFace
              cutPos={cutPosition}
              opacity={mode === 'abatir' ? Math.max(0.18, 1 - abatirAmount) : 1}
            />
          ) : (
            <group position={[0, cutPosition + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <mesh position={[0, (OUTER_R + INNER_R) / 2, 0]}>
                <planeGeometry args={[2.6, OUTER_R - INNER_R]} />
                <meshBasicMaterial color="#1a3038" transparent opacity={0.9} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, -(OUTER_R + INNER_R) / 2, 0]}>
                <planeGeometry args={[2.6, OUTER_R - INNER_R]} />
                <meshBasicMaterial color="#1a3038" transparent opacity={0.9} side={THREE.DoubleSide} />
              </mesh>
            </group>
          ))}

        {abatirAmount > 0.01 && (
          <AbatirSection amount={abatirAmount} cutPos={cutPosition} axis={cutAxis} />
        )}

        {mode !== 'concurrente' && (
          <CuttingPlaneVisual
            pos={cutPosition}
            axis={cutAxis}
            label="A"
            showSheet={mode !== 'abatir'}
          />
        )}

        {mode === 'concurrente' && (
          <>
            <CuttingPlaneVisual pos={cutPosition} axis="x" angle={0} label="A" showSheet />
            <CuttingPlaneVisual pos={cutPosition} axis="x" angle={plane2Angle} label="B" showSheet />
            <mesh position={[cutPosition, 0, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshBasicMaterial color="#ff6b2e" />
            </mesh>
          </>
        )}

        <TechnicalDimensions mode={mode} cutPosition={cutPosition} abatirAmount={abatirAmount} />
      </group>

      <mesh position={[0, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#0b1117" metalness={0.08} roughness={0.92} />
      </mesh>
      <gridHelper args={[10, 20, '#25333d', '#141d24']} position={[0, -1.34, 0]} />
      <OrbitControls
        enabled={autoOrbit || mode === 'concurrente'}
        enablePan={false}
        autoRotate={autoOrbit}
        autoRotateSpeed={0.6}
        enableRotate={autoOrbit || mode === 'concurrente'}
        enableZoom={false}
        target={[0, 0, 0]}
      />
    </>
  )
}
