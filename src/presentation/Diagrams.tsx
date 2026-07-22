import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactElement, ReactNode, RefObject } from 'react'
import gsap from 'gsap'

const C = {
  contour: '#f2f5f7',
  thin: '#aab6c2',
  hidden: '#8293a3',
  cut: '#ff6b2e',
  section: '#53d5e0',
  panel: 'rgba(13, 16, 21, 0.55)',
  solid: '#101318',
}

const MONO = 'IBM Plex Mono, monospace'

const baseStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  display: 'block',
  overflow: 'hidden',
}

/* ---------------- animation helpers ---------------- */

type TL = gsap.core.Timeline
type BuildFn = (tl: TL, root: SVGSVGElement) => void

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function useBuildOnce(build: BuildFn, active: boolean): RefObject<SVGSVGElement | null> {
  const ref = useRef<SVGSVGElement>(null)
  const tlRef = useRef<TL | null>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const tl = gsap.timeline({ paused: true })
    build(tl, root)
    tlRef.current = tl
    return () => {
      tl.kill()
      tlRef.current = null
    }
  }, [build])

  useEffect(() => {
    const tl = tlRef.current
    if (!tl) return
    if (!active) {
      tl.pause(0)
      return
    }
    if (prefersReduced()) {
      // show the finished drawing, no motion
      tl.pause(tl.duration())
    } else {
      tl.restart()
    }
  }, [active])

  return ref
}

function q(root: SVGSVGElement, sel: string) {
  return root.querySelector(sel)
}

function qa(root: SVGSVGElement, sel: string) {
  return Array.from(root.querySelectorAll(sel))
}

/** Trace a solid stroke like a pen drawing it. */
function drawIn(tl: TL, el: Element | null, dur: number, pos: number) {
  if (!el) return
  const g = el as SVGGeometryElement
  let len = 0
  try {
    len = g.getTotalLength()
  } catch {
    len = 0
  }
  if (!len) {
    tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: dur }, pos)
    return
  }
  tl.set(g, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 }, pos)
  tl.to(g, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' }, pos)
}

function fadeIn(tl: TL, els: Element | Element[] | null, pos: number, dur = 0.45, stagger = 0.08) {
  if (!els || (Array.isArray(els) && els.length === 0)) return
  tl.fromTo(els, { opacity: 0 }, { opacity: 1, duration: dur, stagger, ease: 'power2.out' }, pos)
}

function pop(tl: TL, els: Element | Element[] | null, pos: number, dur = 0.45) {
  if (!els || (Array.isArray(els) && els.length === 0)) return
  tl.fromTo(
    els,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: dur, stagger: 0.1, ease: 'power2.out' },
    pos,
  )
}

/* ---------------- shared bits ---------------- */

function Defs() {
  return (
    <defs>
      <pattern id="hatch45" width="9" height="9" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="9" stroke={C.section} strokeWidth="1.1" opacity="0.9" />
      </pattern>
      <pattern id="hatch45b" width="9" height="9" patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="9" stroke={C.cut} strokeWidth="1.1" opacity="0.8" />
      </pattern>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
        <path d="M0,0 L7,3 L0,6 Z" fill={C.section} />
      </marker>
      <marker id="arrowCut" markerWidth="12" markerHeight="12" refX="8" refY="3.5" orient="auto">
        <path d="M0,0 L8,3.5 L0,7 Z" fill={C.cut} />
      </marker>
    </defs>
  )
}

function Label({
  x,
  y,
  children,
  color = C.thin,
  size = 13,
  anchor = 'middle',
  cls,
  visible = false,
}: {
  x: number
  y: number
  children: ReactNode
  color?: string
  size?: number
  anchor?: 'start' | 'middle' | 'end'
  cls?: string
  visible?: boolean
}) {
  return (
    <text
      className={cls}
      x={x}
      y={y}
      fill={color}
      fontSize={size}
      fontFamily={MONO}
      textAnchor={anchor}
      letterSpacing="0.06em"
      opacity={visible ? 1 : 0}
    >
      {children}
    </text>
  )
}

interface FigProps {
  active: boolean
}

/* ================================================================
   PROBLEMA — pieza con cámara interna + agujero: por fuera son
   líneas ocultas confusas; el corte deja el interior nítido.
   ================================================================ */
function buildProblema(tl: TL, root: SVGSVGElement) {
  pop(tl, qa(root, '.p-title'), 0)
  drawIn(tl, q(root, '.p-c1'), 0.65, 0.15)
  drawIn(tl, q(root, '.p-c2'), 0.65, 0.15)
  fadeIn(tl, qa(root, '.p-hid'), 0.75, 0.35, 0.12)
  pop(tl, q(root, '.p-q'), 1.25)
  fadeIn(tl, q(root, '.p-arr'), 1.55, 0.35)
  fadeIn(tl, q(root, '.p-hatch'), 1.85, 0.55)
  pop(tl, qa(root, '.p-hole'), 2.15)
  pop(tl, q(root, '.p-ok'), 2.45)
  pop(tl, q(root, '.p-result'), 2.75)
}

function ProblemaFig({ active }: FigProps) {
  const ref = useBuildOnce(buildProblema, active)
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 300"
      style={baseStyle}
      role="img"
      aria-label="Comparación: la vista exterior deja el interior en líneas ocultas ambiguas; la vista en corte muestra las cavidades visibles y el material rayado"
    >
      <defs>
        <pattern id="probHatch45" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke={C.section} strokeWidth="1.1" />
        </pattern>
        <marker id="probArrow" markerWidth="11" markerHeight="11" refX="8" refY="3.5" orient="auto">
          <path d="M0,0 L8,3.5 L0,7 Z" fill={C.cut} />
        </marker>
      </defs>

      <g transform="translate(20,54)">
        <Label cls="p-title" x={95} y={-20} size={13.5}>
          ANTES · PV SIN CORTAR
        </Label>
        <rect className="p-c1" x="0" y="0" width="190" height="150" fill="none" stroke={C.contour} strokeWidth="2.4" opacity="0" />
        <rect className="p-hid" x="52" y="32" width="86" height="70" fill="none" stroke={C.hidden} strokeWidth="1.5" strokeDasharray="7 5" opacity="0" />
        <circle className="p-hid" cx="95" cy="120" r="16" fill="none" stroke={C.hidden} strokeWidth="1.5" strokeDasharray="7 5" opacity="0" />
        <line className="p-hid" x1="0" y1="32" x2="190" y2="32" stroke={C.hidden} strokeWidth="1.1" strokeDasharray="6 5" opacity="0" />
        <line className="p-hid" x1="0" y1="102" x2="190" y2="102" stroke={C.hidden} strokeWidth="1.1" strokeDasharray="6 5" opacity="0" />
        <Label cls="p-q" x={95} y={178} size={13} color={C.cut}>
          ¿QUÉ HAY DENTRO?
        </Label>
      </g>

      <path className="p-arr" d="M220,128 H260" stroke={C.cut} strokeWidth="2.4" markerEnd="url(#probArrow)" fill="none" opacity="0" />

      <g transform="translate(270,54)">
        <Label cls="p-title" x={95} y={-20} color={C.section} size={13.5}>
          DESPUÉS · PV EN CORTE
        </Label>
        <rect className="p-hatch" x="0" y="0" width="190" height="150" fill="url(#probHatch45)" opacity="0" />
        <rect className="p-c2" x="0" y="0" width="190" height="150" fill="none" stroke={C.contour} strokeWidth="2.4" opacity="0" />
        <rect className="p-hole" x="52" y="32" width="86" height="70" fill={C.solid} stroke={C.contour} strokeWidth="2" opacity="0" />
        <circle className="p-hole" cx="95" cy="120" r="16" fill={C.solid} stroke={C.contour} strokeWidth="2" opacity="0" />
        <Label cls="p-ok" x={95} y={178} size={13} color={C.section}>
          INTERIOR VISIBLE
        </Label>
      </g>
      <Label cls="p-result" x={240} y={282} size={13} color={C.section}>
        MISMA PIEZA · MENOS AMBIGÜEDAD
      </Label>
    </svg>
  )
}

/* ================================================================
   IDEA — corta → de canto → gira 90° → de frente
   ================================================================ */
function buildIdea(tl: TL, root: SVGSVGElement) {
  fadeIn(tl, q(root, '.i-ax'), 0, 0.3)
  drawIn(tl, q(root, '.i-bar'), 0.9, 0.1)
  // 1) knife descends and cuts
  pop(tl, q(root, '.i-s1'), 1.1)
  tl.fromTo(q(root, '.i-knife'), { y: -70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.in' }, 1.3)
  tl.fromTo(q(root, '.i-flash'), { opacity: 0 }, { opacity: 1, duration: 0.1, yoyo: true, repeat: 1 }, 1.8)
  // 2) the slice, seen edge-on, slides out
  tl.fromTo(q(root, '.i-edge'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.95)
  tl.to(q(root, '.i-knife'), { opacity: 0, duration: 0.3 }, 2.2)
  // group starts at translate(145,78); move it to the empty stage at (365,155)
  tl.to(q(root, '.i-slice'), { x: 365, y: 155, duration: 1.0, ease: 'power2.inOut' }, 2.5)
  pop(tl, q(root, '.i-s2'), 3.4)
  // 3) rotate 90°: the line becomes the circular profile in true size
  tl.to(q(root, '.i-s2'), { opacity: 0, duration: 0.3 }, 4.6)
  pop(tl, q(root, '.i-s3'), 4.7)
  drawIn(tl, q(root, '.i-arc'), 0.6, 4.8)
  tl.set(q(root, '.i-oval'), { opacity: 1 }, 5.0)
  tl.fromTo(q(root, '.i-oval'), { attr: { rx: 2 } }, { attr: { rx: 28 }, duration: 0.9, ease: 'power2.inOut' }, 5.0)
  tl.to(q(root, '.i-line'), { opacity: 0, duration: 0.4 }, 5.0)
  tl.to(q(root, '.i-arc'), { opacity: 0, duration: 0.4 }, 5.9)
  // 4) frontal, true size
  tl.to(q(root, '.i-s3'), { opacity: 0, duration: 0.3 }, 6.1)
  pop(tl, q(root, '.i-s4'), 6.2)
}

function IdeaFig({ active }: FigProps) {
  const ref = useBuildOnce(buildIdea, active)
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 280"
      style={baseStyle}
      role="img"
      aria-label="Secuencia en cuatro pasos: cortar la barra, ver la sección de canto como una línea, girarla 90 grados y verla de frente en magnitud real"
    >
      <Defs />
      <defs>
        <pattern id="ideaHatch45" width="9" height="9" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="9" stroke={C.section} strokeWidth="1.25" />
        </pattern>
      </defs>
      <line className="i-ax" x1="16" y1="78" x2="300" y2="78" stroke={C.thin} strokeWidth="1" strokeDasharray="10 4 2 4" opacity="0" />
      <path className="i-bar" d="M30,50 h230 a28,28 0 0 1 0,56 h-230 a28,28 0 0 1 0,-56 Z" fill="none" stroke={C.contour} strokeWidth="2.2" opacity="0" />
      <Label cls="i-s1" x={145} y={22} color={C.cut} size={13}>
        1 · CORTA
      </Label>
      <g className="i-knife" opacity="0">
        <line x1="145" y1="32" x2="145" y2="124" stroke={C.cut} strokeWidth="3" />
        <rect x="138" y="22" width="14" height="10" fill={C.cut} />
      </g>
      <rect className="i-flash" x="141" y="46" width="8" height="64" fill={C.cut} opacity="0" />
      {/* slice: starts at the cut, travels to the right stage */}
      <g className="i-slice" transform="translate(145,78)">
        <line className="i-edge i-line" x1="0" y1="-28" x2="0" y2="28" stroke={C.section} strokeWidth="4" opacity="0" />
        <ellipse className="i-oval" cx="0" cy="0" rx="2" ry="28" fill="url(#ideaHatch45)" stroke={C.section} strokeWidth="2.2" opacity="0" />
        <path className="i-arc" d="M0,-42 A42,42 0 0 1 40,-12" fill="none" stroke={C.cut} strokeWidth="2.2" markerEnd="url(#arrowCut)" opacity="0" />
      </g>
      <Label cls="i-s2" x={365} y={248} size={13} color={C.section}>
        2 · DE CANTO: LÍNEA
      </Label>
      <Label cls="i-s3" x={365} y={248} size={13} color={C.cut}>
        3 · GIRA 90°
      </Label>
      <Label cls="i-s4" x={365} y={248} size={13} color={C.section}>
        4 · DE FRENTE: MAGNITUD REAL
      </Label>
    </svg>
  )
}

/* ================================================================
   DEFINICIÓN — mismo buje escalonado: CORTE = cara + fondo;
   SECCIÓN = solo el perfil que toca el plano.
   ================================================================ */
function buildDefinicion(tl: TL, root: SVGSVGElement) {
  pop(tl, q(root, '.d-source-title'), 0)
  drawIn(tl, q(root, '.d-source'), 0.75, 0.1)
  fadeIn(tl, qa(root, '.d-hidden'), 0.55, 0.35)
  fadeIn(tl, qa(root, '.d-plane'), 0.9, 0.35)
  tl.fromTo(
    qa(root, '.d-arrow'),
    { opacity: 0, x: -12 },
    { opacity: 1, x: 0, duration: 0.4, stagger: 0.12, ease: 'power2.out' },
    1.15,
  )
  pop(tl, qa(root, '.d-title'), 1.45)
  drawIn(tl, q(root, '.d-behind'), 0.55, 1.65)
  fadeIn(tl, qa(root, '.d-face'), 1.95, 0.55)
  pop(tl, qa(root, '.d-label'), 2.55)
}

function DefinicionFig({ active }: FigProps) {
  const ref = useBuildOnce(buildDefinicion, active)
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 310"
      style={baseStyle}
      role="img"
      aria-label="Buje escalonado cortado por el plano A–A: el corte muestra la cara rayada más el contorno de la brida posterior; la sección muestra solo la cara cortada"
    >
      <defs>
        <pattern id="defHatch45" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke={C.section} strokeWidth="1.1" />
        </pattern>
      </defs>

      <Label cls="d-source-title" x={240} y={18} size={13}>
        MISMO BUJE ESCALONADO · PV CON EL PLANO A–A
      </Label>
      <g transform="translate(90,32)">
        <path className="d-source" d="M0,24 H180 V8 H250 V24 H300 V76 H250 V92 H180 V76 H0 Z" fill="none" stroke={C.contour} strokeWidth="2" opacity="0" />
        <line className="d-hidden" x1="0" y1="42" x2="300" y2="42" stroke={C.hidden} strokeWidth="1.2" strokeDasharray="7 5" opacity="0" />
        <line className="d-hidden" x1="0" y1="58" x2="300" y2="58" stroke={C.hidden} strokeWidth="1.2" strokeDasharray="7 5" opacity="0" />
        <line className="d-plane" x1="112" y1="-2" x2="112" y2="102" stroke={C.cut} strokeWidth="1.8" strokeDasharray="12 4 2 4" opacity="0" />
        <rect className="d-plane" x="106" y="-8" width="12" height="8" fill={C.cut} opacity="0" />
        <rect className="d-plane" x="106" y="102" width="12" height="8" fill={C.cut} opacity="0" />
        <Label cls="d-plane" x={132} y={6} color={C.cut} size={14}>A</Label>
        <Label cls="d-plane" x={132} y={106} color={C.cut} size={14}>A</Label>
        {/* dirección de observación: hacia la brida, que queda detrás del plano */}
        <g className="d-arrow" opacity="0">
          <line x1="64" y1="-4" x2="94" y2="-4" stroke={C.section} strokeWidth="2.2" />
          <path d="M108,-4 L96,-10 V2 Z" fill={C.section} />
        </g>
        <g className="d-arrow" opacity="0">
          <line x1="64" y1="106" x2="94" y2="106" stroke={C.section} strokeWidth="2.2" />
          <path d="M108,106 L96,100 V112 Z" fill={C.section} />
        </g>
      </g>

      <g transform="translate(130,224)">
        <Label cls="d-title" x={0} y={-72} color={C.cut} size={15}>CORTE A–A</Label>
        <circle className="d-behind" cx="0" cy="0" r="58" fill="none" stroke={C.cut} strokeWidth="2" opacity="0" />
        <circle className="d-face" cx="0" cy="0" r="42" fill="url(#defHatch45)" stroke={C.section} strokeWidth="2" opacity="0" />
        <circle className="d-face" cx="0" cy="0" r="18" fill={C.solid} stroke={C.contour} strokeWidth="2" opacity="0" />
        <Label cls="d-label" x={0} y={78} size={13}>cara cortada + contorno detrás</Label>
      </g>

      <g transform="translate(350,224)">
        <Label cls="d-title" x={0} y={-72} color={C.section} size={15}>SECCIÓN A–A</Label>
        <circle className="d-face" cx="0" cy="0" r="42" fill="url(#defHatch45)" stroke={C.section} strokeWidth="2" opacity="0" />
        <circle className="d-face" cx="0" cy="0" r="18" fill={C.solid} stroke={C.contour} strokeWidth="2" opacity="0" />
        <Label cls="d-label" x={0} y={78} size={13}>solo la cara cortada</Label>
      </g>
    </svg>
  )
}

/* ================================================================
   CUÁNDO — pieza larga: la sección girada aparece sobre la vista
   ================================================================ */
function buildCuando(tl: TL, root: SVGSVGElement) {
  fadeIn(tl, q(root, '.c-ax'), 0, 0.3)
  drawIn(tl, q(root, '.c-bar'), 0.9, 0.1)
  drawIn(tl, q(root, '.c-brk'), 0.5, 1.0)
  pop(tl, q(root, '.c-l3'), 1.4)
  // the edge line appears at the cut, then rotates into an oval
  tl.fromTo(q(root, '.c-line'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 2.0)
  drawIn(tl, q(root, '.c-arc'), 0.6, 2.3)
  tl.set(q(root, '.c-oval'), { opacity: 1 }, 2.5)
  tl.fromTo(q(root, '.c-oval'), { attr: { rx: 2 } }, { attr: { rx: 21 }, duration: 0.8, ease: 'power2.inOut' }, 2.5)
  tl.to(q(root, '.c-line'), { opacity: 0, duration: 0.3 }, 2.6)
  tl.to(q(root, '.c-arc'), { opacity: 0, duration: 0.4 }, 3.3)
  pop(tl, q(root, '.c-l1'), 3.4)
  pop(tl, q(root, '.c-l2'), 3.6)
}

function CuandoFig({ active }: FigProps) {
  const ref = useBuildOnce(buildCuando, active)
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 300"
      style={baseStyle}
      role="img"
      aria-label="Pieza larga de perfil constante con la sección girada 90 grados superpuesta sobre la propia vista, dibujada con contorno fino"
    >
      <Defs />
      <defs>
        <pattern id="whenHatch45" width="9" height="9" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="9" stroke={C.section} strokeWidth="1.2" />
        </pattern>
      </defs>
      <g transform="translate(30,128)">
        <line className="c-ax" x1="-6" y1="0" x2="366" y2="0" stroke={C.thin} strokeWidth="1" strokeDasharray="12 4 2 4" opacity="0" />
        <path className="c-bar" d="M20,-36 h340 a18,36 0 0 1 0,72 h-340 a18,36 0 0 1 0,-72 Z" fill="none" stroke={C.contour} strokeWidth="2.2" opacity="0" />
        <path className="c-brk" d="M250,-44 q7,11 -4,22 q-11,11 4,22 q11,11 0,24" fill="none" stroke={C.thin} strokeWidth="1.5" opacity="0" />
        <line className="c-line" x1="110" y1="-36" x2="110" y2="36" stroke={C.section} strokeWidth="3.5" opacity="0" />
        <ellipse className="c-oval" cx="110" cy="0" rx="2" ry="36" fill="url(#whenHatch45)" stroke={C.section} strokeWidth="1.2" opacity="0" />
        <path className="c-arc" d="M110,-58 A58,58 0 0 1 166,-16" fill="none" stroke={C.cut} strokeWidth="2" markerEnd="url(#arrowCut)" opacity="0" />
        <Label cls="c-l1" x={110} y={64} color={C.section} size={13.5}>
          perfil girado sobre la vista
        </Label>
        <Label cls="c-l2" x={110} y={80} size={13}>
          contorno en línea fina (norma)
        </Label>
        <Label cls="c-l3" x={300} y={-58} size={13}>
          perfil constante → basta una sección
        </Label>
      </g>
    </svg>
  )
}

/* ================================================================
   PLANO — la receta: 1 traza, 2 letras, 3 flechas
   ================================================================ */
function buildPlano(tl: TL, root: SVGSVGElement) {
  pop(tl, q(root, '.pl-title'), 0)
  drawIn(tl, q(root, '.pl-piece'), 0.65, 0.15)
  fadeIn(tl, qa(root, '.pl-hidden'), 0.55, 0.3)
  fadeIn(tl, q(root, '.pl-line'), 0.75, 0.45)
  tl.fromTo(
    qa(root, '.pl-end'),
    { scale: 0, opacity: 0, transformOrigin: '50% 50%' },
    { scale: 1, opacity: 1, duration: 0.4, stagger: 0.12, ease: 'back.out(2.5)' },
    1.05,
  )
  pop(tl, qa(root, '.pl-letter'), 1.35)
  pop(tl, q(root, '.pl-eye'), 1.55)
  tl.fromTo(
    qa(root, '.pl-arr'),
    { opacity: 0, x: -14 },
    { opacity: 1, x: 0, duration: 0.45, stagger: 0.12, ease: 'power2.out' },
    1.75,
  )
  pop(tl, qa(root, '.pl-callout'), 2.15)
  fadeIn(tl, qa(root, '.pl-removed'), 2.35, 0.35)
  pop(tl, q(root, '.pl-note'), 2.75)
}

function PlanoFig({ active }: FigProps) {
  const ref = useBuildOnce(buildPlano, active)
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 310"
      style={baseStyle}
      role="img"
      aria-label="Plano de corte A–A: traza de trazo y punto con extremos gruesos, letras A, flechas de observación en el mismo sentido y la mitad retirada sombreada"
    >
      <Defs />
      <Label cls="pl-title" x={240} y={24} size={15} color={C.cut}>PLANO DE CORTE A–A SOBRE LA PV</Label>

      <rect className="pl-piece" x="65" y="88" width="350" height="118" fill="none" stroke={C.contour} strokeWidth="2.2" opacity="0" />
      <line className="pl-hidden" x1="45" y1="147" x2="435" y2="147" stroke={C.thin} strokeWidth="1" strokeDasharray="12 4 2 4" opacity="0" />
      <circle className="pl-hidden" cx="240" cy="147" r="34" fill="none" stroke={C.hidden} strokeWidth="1.3" strokeDasharray="7 5" opacity="0" />
      <rect className="pl-removed" x="65" y="88" width="175" height="118" fill={C.cut} fillOpacity="0.1" opacity="0" />
      <Label cls="pl-removed" x={150} y={126} size={13} color={C.cut}>MITAD RETIRADA</Label>

      <line className="pl-line" x1="240" y1="64" x2="240" y2="230" stroke={C.cut} strokeWidth="1.9" strokeDasharray="14 5 3 5" opacity="0" />
      <rect className="pl-end" x="232" y="54" width="16" height="12" fill={C.cut} opacity="0" />
      <rect className="pl-end" x="232" y="230" width="16" height="12" fill={C.cut} opacity="0" />

      <Label cls="pl-letter" x={214} y={64} color={C.cut} size={19}>A</Label>
      <Label cls="pl-letter" x={214} y={246} color={C.cut} size={19}>A</Label>
      <g transform="translate(18,136)">
        <g className="pl-eye" opacity="0">
          <path d="M0,10 Q16,-5 32,10 Q16,25 0,10 Z" fill={C.solid} stroke={C.section} strokeWidth="1.8" />
          <circle cx="16" cy="10" r="4" fill={C.section} />
          <text x="16" y="38" fill={C.section} fontSize="13" fontFamily={MONO} textAnchor="middle">OBS.</text>
        </g>
      </g>
      <g className="pl-arr" opacity="0">
        <line x1="168" y1="60" x2="224" y2="60" stroke={C.section} strokeWidth="2.4" />
        <path d="M236,60 L222,52 V68 Z" fill={C.section} />
      </g>
      <g className="pl-arr" opacity="0">
        <line x1="168" y1="236" x2="224" y2="236" stroke={C.section} strokeWidth="2.4" />
        <path d="M236,236 L222,228 V244 Z" fill={C.section} />
      </g>

      <Label cls="pl-callout" x={332} y={76} size={13.5} color={C.cut}>EXTREMO GRUESO</Label>
      <Label cls="pl-callout" x={348} y={226} size={13.5} color={C.section}>MISMO SENTIDO</Label>
      <Label cls="pl-note" x={240} y={288} size={13.5} color={C.section}>OBSERVADOR → FLECHAS → PLANO A–A</Label>
    </svg>
  )
}

/* ================================================================
   RAYADO — se raya el material; los huecos no
   ================================================================ */
function buildRayado(tl: TL, root: SVGSVGElement) {
  pop(tl, qa(root, '.r-title'), 0)
  drawIn(tl, q(root, '.r-c1'), 0.6, 0.15)
  fadeIn(tl, q(root, '.r-fill1'), 0.65, 0.5)
  drawIn(tl, q(root, '.r-ang'), 0.35, 1.0)
  pop(tl, q(root, '.r-langle'), 1.15)
  fadeIn(tl, q(root, '.r-hole'), 1.35, 0.4)
  pop(tl, q(root, '.r-lh'), 1.65)
  drawIn(tl, q(root, '.r-c2a'), 0.5, 2.0)
  drawIn(tl, q(root, '.r-c2b'), 0.5, 2.05)
  fadeIn(tl, qa(root, '.r-fill2'), 2.35, 0.45)
  pop(tl, qa(root, '.r-lp'), 2.75)
  pop(tl, q(root, '.r-rule'), 3.05)
}

function RayadoFig({ active }: FigProps) {
  const ref = useBuildOnce(buildRayado, active)
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 310"
      style={baseStyle}
      role="img"
      aria-label="Regla del rayado: líneas finas a 45 grados solo en el material cortado, huecos sin rayar y piezas contiguas con direcciones distintas"
    >
      <defs>
        <pattern id="rayHatch45" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke={C.section} strokeWidth="1.2" />
        </pattern>
        <pattern id="rayHatchMinus45" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke={C.cut} strokeWidth="1.2" />
        </pattern>
      </defs>

      <g transform="translate(28,54)">
        <Label cls="r-title" x={95} y={-20} size={14}>UNA PIEZA</Label>
        <rect className="r-fill1" x="5" y="0" width="180" height="170" fill="url(#rayHatch45)" opacity="0" />
        <rect className="r-c1" x="5" y="0" width="180" height="170" fill="none" stroke={C.section} strokeWidth="2.2" opacity="0" />
        <circle className="r-hole" cx="95" cy="75" r="31" fill={C.solid} stroke={C.contour} strokeWidth="2.2" opacity="0" />
        <path className="r-ang" d="M12,162 L57,117" stroke={C.cut} strokeWidth="1.8" opacity="0" />
        <Label cls="r-langle" x={66} y={146} color={C.cut} size={14}>45°</Label>
        <Label cls="r-lh" x={95} y={198} size={13} color={C.cut}>HUECO = SIN RAYADO</Label>
      </g>

      <g transform="translate(270,54)">
        <Label cls="r-title" x={90} y={-20} size={14}>DOS PIEZAS</Label>
        <rect className="r-fill2" x="0" y="0" width="90" height="170" fill="url(#rayHatch45)" opacity="0" />
        <rect className="r-fill2" x="90" y="0" width="90" height="170" fill="url(#rayHatchMinus45)" opacity="0" />
        <rect className="r-c2a" x="0" y="0" width="90" height="170" fill="none" stroke={C.section} strokeWidth="2.2" opacity="0" />
        <rect className="r-c2b" x="90" y="0" width="90" height="170" fill="none" stroke={C.cut} strokeWidth="2.2" opacity="0" />
        <Label cls="r-lp" x={45} y={198} size={13} color={C.section}>PIEZA 1</Label>
        <Label cls="r-lp" x={135} y={198} size={13} color={C.cut}>PIEZA 2</Label>
      </g>

      <Label cls="r-rule" x={240} y={290} size={13} color={C.section}>MATERIAL = RAYADO · HUECO = LIMPIO</Label>
    </svg>
  )
}

/* ================================================================
   APLICACIÓN — segundo caso completo: mango ergonómico ovalado
   ================================================================ */
function buildAplicacion(tl: TL, root: SVGSVGElement) {
  pop(tl, qa(root, '.a-title'), 0)
  fadeIn(tl, qa(root, '.a-body-fill'), 0.22, 0.55)
  qa(root, '.a-part').forEach((el, i) => drawIn(tl, el, 0.58, 0.28 + i * 0.1))
  pop(tl, q(root, '.a-view-label'), 0.72)
  qa(root, '.a-cut').forEach((el, i) => drawIn(tl, el, 0.46, 1.05 + i * 0.08))
  pop(tl, qa(root, '.a-cut-label'), 1.28)
  drawIn(tl, q(root, '.a-edge'), 0.42, 1.58)
  pop(tl, q(root, '.a-edge-label'), 1.7)
  drawIn(tl, q(root, '.a-rotation'), 0.62, 1.9)
  pop(tl, q(root, '.a-rotation-label'), 2)
  tl.fromTo(
    q(root, '.a-section'),
    { opacity: 0.3, scaleX: 0.025, transformOrigin: '50% 50%', transformBox: 'fill-box' },
    { opacity: 1, scaleX: 1, duration: 0.95, ease: 'power3.inOut' },
    2.12,
  )
  fadeIn(tl, qa(root, '.a-dim'), 2.92, 0.48, 0.08)
  pop(tl, q(root, '.a-section-label'), 3.12)
  pop(tl, q(root, '.a-cap'), 3.5)
}

function AplicacionFig({ active }: FigProps) {
  const ref = useBuildOnce(buildAplicacion, active)
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 310"
      style={baseStyle}
      role="img"
      aria-label="Mango ovalado en vista lateral: la sección A–A se ve de canto como una línea y, al girar 90 grados, aparece el óvalo de 26 por 38 milímetros sobre la misma vista"
    >
      <Defs />
      <defs>
        <pattern id="appHatch45" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke={C.section} strokeWidth="1.1" />
        </pattern>
        <linearGradient id="appMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#70869a" stopOpacity="0.72" />
          <stop offset="0.48" stopColor="#293746" stopOpacity="0.86" />
          <stop offset="1" stopColor="#121a22" stopOpacity="0.96" />
        </linearGradient>
        <marker id="appDimArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#8fe15f" />
        </marker>
      </defs>
      <Label cls="a-title" x={26} y={26} size={13} color={C.cut} anchor="start">CASO B · MANGO OVALADO</Label>
      <Label cls="a-title" x={454} y={26} size={13} color={C.thin} anchor="end">PIEZA DIDÁCTICA · mm</Label>

      {/* una sola pieza: la silueta lateral del mango */}
      <g>
        <path
          className="a-body-fill"
          d="M35,121 Q47,108 76,110 C160,116 245,117 328,119 L411,124 Q438,127 443,150 Q438,173 411,176 L328,181 C245,183 160,184 76,190 Q47,192 35,179 Q24,150 35,121 Z"
          fill="url(#appMetal)"
          opacity="0"
        />
        <path
          className="a-part"
          d="M35,121 Q47,108 76,110 C160,116 245,117 328,119 L411,124 Q438,127 443,150 Q438,173 411,176 L328,181 C245,183 160,184 76,190 Q47,192 35,179 Q24,150 35,121 Z"
          fill="none"
          stroke={C.contour}
          strokeWidth="2.2"
          opacity="0"
        />
        <path className="a-part" d="M48,126 C135,128 233,128 327,130 L405,134" fill="none" stroke={C.thin} strokeWidth="1.1" opacity="0" />
        <line className="a-part" x1="18" y1="150" x2="457" y2="150" stroke={C.hidden} strokeWidth="1.1" strokeDasharray="14 5 3 5" opacity="0" />
        <Label cls="a-view-label" x={87} y={95} size={13} color={C.thin}>VISTA LATERAL</Label>
      </g>

      {/* plano A–A y dirección de observación */}
      <g>
        <line className="a-cut" x1="252" y1="66" x2="252" y2="234" stroke={C.cut} strokeWidth="1.9" strokeDasharray="11 4 2 4" opacity="0" />
        <rect className="a-cut" x="247" y="62" width="10" height="16" fill={C.cut} opacity="0" />
        <rect className="a-cut" x="247" y="222" width="10" height="16" fill={C.cut} opacity="0" />
        <path className="a-cut" d="M205,76 H242" fill="none" stroke={C.cut} strokeWidth="2" markerEnd="url(#arrowCut)" opacity="0" />
        <path className="a-cut" d="M205,224 H242" fill="none" stroke={C.cut} strokeWidth="2" markerEnd="url(#arrowCut)" opacity="0" />
        <Label cls="a-cut-label" x={191} y={80} size={15} color={C.cut}>A</Label>
        <Label cls="a-cut-label" x={191} y={228} size={15} color={C.cut}>A</Label>
      </g>

      {/* de canto → giro → sección abatida, todo en el mismo lugar */}
      <line className="a-edge" x1="252" y1="114" x2="252" y2="186" stroke={C.section} strokeWidth="3.2" opacity="0" />
      <Label cls="a-edge-label" x={252} y={254} size={13} color={C.section}>DE CANTO = LÍNEA</Label>
      <path className="a-rotation" d="M260,107 A61,61 0 0 1 315,149" fill="none" stroke={C.cut} strokeWidth="2.2" strokeDasharray="7 4" markerEnd="url(#arrowCut)" opacity="0" />
      <Label cls="a-rotation-label" x={358} y={108} size={13.5} color={C.cut}>GIRA 90°</Label>
      <g className="a-section" opacity="0">
        <ellipse cx="252" cy="150" rx="25" ry="36" fill={C.solid} stroke={C.contour} strokeWidth="4.4" />
        <ellipse cx="252" cy="150" rx="25" ry="36" fill="url(#appHatch45)" stroke={C.section} strokeWidth="2.2" />
        <line x1="217" y1="150" x2="287" y2="150" stroke={C.hidden} strokeWidth="1" strokeDasharray="9 4 2 4" />
        <line x1="252" y1="104" x2="252" y2="196" stroke={C.hidden} strokeWidth="1" strokeDasharray="9 4 2 4" />
      </g>

      {/* cotas del óvalo ya girado */}
      <g className="a-dim" opacity="0" fill="none" stroke="#8fe15f">
        <line x1="227" y1="190" x2="227" y2="207" strokeWidth="1" />
        <line x1="277" y1="190" x2="277" y2="207" strokeWidth="1" />
        <line x1="227" y1="204" x2="277" y2="204" strokeWidth="1.6" markerStart="url(#appDimArrow)" markerEnd="url(#appDimArrow)" />
        <text x="252" y="218" fill="#8fe15f" stroke="none" fontSize="13" fontFamily={MONO} textAnchor="middle">26</text>
      </g>
      <g className="a-dim" opacity="0" fill="none" stroke="#8fe15f">
        <line x1="283" y1="114" x2="332" y2="114" strokeWidth="1" />
        <line x1="283" y1="186" x2="332" y2="186" strokeWidth="1" />
        <line x1="328" y1="114" x2="328" y2="186" strokeWidth="1.6" markerStart="url(#appDimArrow)" markerEnd="url(#appDimArrow)" />
        <text x="340" y="154" fill="#8fe15f" stroke="none" fontSize="13" fontFamily={MONO}>38</text>
      </g>
      <Label cls="a-section-label" x={395} y={206} size={13} color={C.section}>SECCIÓN A–A</Label>
      <Label cls="a-cap" x={240} y={290} size={13} color={C.section}>LÍNEA → GIRO 90° → ÓVALO 26 × 38 mm</Label>
    </svg>
  )
}

/* ================================================================
   PUENTE — del isométrico que ya dibujan a las tres vistas
   (PV/PH/PL, primer diedro) y el gancho: la PL sin salir de la PV.
   Buje del ejercicio a escala 1.5 px/mm: 100→150, Ø40→60, Ø18→27.
   ================================================================ */
function buildPuente(tl: TL, root: SVGSVGElement) {
  pop(tl, q(root, '.b-tiso'), 0)
  qa(root, '.b-iso').forEach((el, i) => drawIn(tl, el, 0.45, 0.12 + i * 0.1))
  fadeIn(tl, qa(root, '.b-isohid'), 0.95, 0.3)
  fadeIn(tl, q(root, '.b-isoax'), 1.05, 0.3)
  pop(tl, q(root, '.b-lpv'), 1.25)
  drawIn(tl, q(root, '.b-pv'), 0.5, 1.35)
  fadeIn(tl, qa(root, '.b-pvhid'), 1.7, 0.3)
  pop(tl, q(root, '.b-lph'), 1.95)
  drawIn(tl, q(root, '.b-ph'), 0.5, 2.05)
  fadeIn(tl, qa(root, '.b-phhid'), 2.4, 0.3)
  pop(tl, q(root, '.b-lpl'), 2.65)
  drawIn(tl, q(root, '.b-pl1'), 0.45, 2.75)
  drawIn(tl, q(root, '.b-pl2'), 0.4, 2.9)
  fadeIn(tl, qa(root, '.b-vax'), 3.15, 0.35)
  fadeIn(tl, qa(root, '.b-corr'), 3.35, 0.3)
  pop(tl, q(root, '.b-hid'), 3.6)
  tl.fromTo(
    q(root, '.b-hoy'),
    { opacity: 0, scale: 0.85, transformOrigin: '50% 50%', transformBox: 'fill-box' },
    { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' },
    4.05,
  )
  pop(tl, q(root, '.b-cap'), 4.25)
}

function PuenteFig({ active }: FigProps) {
  const ref = useBuildOnce(buildPuente, active)
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 310"
      style={baseStyle}
      role="img"
      aria-label="Del isométrico del cilindro salen las tres vistas: alzado PV y planta PH como rectángulos con el agujero en líneas ocultas, y perfil PL como dos círculos; la sección abatida entrega ese perfil dentro del alzado"
    >
      {/* isométrico del cilindro: eje a 30°, tapas elípticas tangentes,
          taladro pasante insinuado en líneas ocultas */}
      <g transform="translate(105,106) rotate(-30)">
        <line className="b-isoax" x1="-68" y1="0" x2="72" y2="0" stroke={C.thin} strokeWidth="1" strokeDasharray="12 4 2 4" opacity="0" />
        <path className="b-iso" d="M-55,-22 H55" fill="none" stroke={C.contour} strokeWidth="2.2" opacity="0" />
        <path className="b-iso" d="M-55,22 H55" fill="none" stroke={C.contour} strokeWidth="2.2" opacity="0" />
        <path className="b-iso" d="M-55,-22 A9,22 0 0 0 -55,22" fill="none" stroke={C.contour} strokeWidth="2" opacity="0" />
        <ellipse className="b-iso" cx="55" cy="0" rx="9" ry="22" fill="none" stroke={C.contour} strokeWidth="2.2" opacity="0" />
        <ellipse className="b-iso" cx="55" cy="0" rx="4" ry="9.9" fill="none" stroke={C.contour} strokeWidth="1.8" opacity="0" />
        <line className="b-isohid" x1="-55" y1="-9.9" x2="53" y2="-9.9" stroke={C.hidden} strokeWidth="1.2" strokeDasharray="6 4" opacity="0" />
        <line className="b-isohid" x1="-55" y1="9.9" x2="53" y2="9.9" stroke={C.hidden} strokeWidth="1.2" strokeDasharray="6 4" opacity="0" />
      </g>
      <Label cls="b-tiso" x={105} y={192} size={13}>ISOMÉTRICO</Label>

      {/* primer diedro: PV arriba, PH debajo (misma x), PL a la derecha (misma y) */}
      <Label cls="b-lpv" x={315} y={20} size={13}>PV · ALZADO</Label>
      <rect className="b-pv" x="240" y="30" width="150" height="60" fill="none" stroke={C.contour} strokeWidth="2" opacity="0" />
      <line className="b-pvhid" x1="240" y1="46.5" x2="390" y2="46.5" stroke={C.hidden} strokeWidth="1.3" strokeDasharray="7 5" opacity="0" />
      <line className="b-pvhid" x1="240" y1="73.5" x2="390" y2="73.5" stroke={C.hidden} strokeWidth="1.3" strokeDasharray="7 5" opacity="0" />

      <Label cls="b-lpl" x={432} y={20} size={13}>PL · PERFIL</Label>
      <circle className="b-pl1" cx="432" cy="60" r="30" fill="none" stroke={C.contour} strokeWidth="2" opacity="0" />
      <circle className="b-pl2" cx="432" cy="60" r="13.5" fill="none" stroke={C.contour} strokeWidth="1.8" opacity="0" />

      <rect className="b-ph" x="240" y="120" width="150" height="60" fill="none" stroke={C.contour} strokeWidth="2" opacity="0" />
      <line className="b-phhid" x1="240" y1="136.5" x2="390" y2="136.5" stroke={C.hidden} strokeWidth="1.3" strokeDasharray="7 5" opacity="0" />
      <line className="b-phhid" x1="240" y1="163.5" x2="390" y2="163.5" stroke={C.hidden} strokeWidth="1.3" strokeDasharray="7 5" opacity="0" />
      <Label cls="b-lph" x={315} y={198} size={13}>PH · PLANTA</Label>

      {/* ejes: uno común PV→PL y los del perfil y la planta */}
      <line className="b-vax" x1="232" y1="60" x2="470" y2="60" stroke={C.thin} strokeWidth="1" strokeDasharray="12 4 2 4" opacity="0" />
      <line className="b-vax" x1="432" y1="22" x2="432" y2="98" stroke={C.thin} strokeWidth="1" strokeDasharray="12 4 2 4" opacity="0" />
      <line className="b-vax" x1="232" y1="150" x2="398" y2="150" stroke={C.thin} strokeWidth="1" strokeDasharray="12 4 2 4" opacity="0" />

      {/* correspondencia PV ↔ PH */}
      <line className="b-corr" x1="240" y1="92" x2="240" y2="118" stroke={C.thin} strokeWidth="1" strokeDasharray="4 4" opacity="0" />
      <line className="b-corr" x1="390" y1="92" x2="390" y2="118" stroke={C.thin} strokeWidth="1" strokeDasharray="4 4" opacity="0" />

      <Label cls="b-hid" x={240} y={226} size={13} color={C.cut}>EL INTERIOR: SOLO LÍNEAS OCULTAS</Label>

      {/* el gancho: los círculos de la PL se encienden en cian */}
      <g className="b-hoy" opacity="0">
        <circle cx="432" cy="60" r="30" fill="none" stroke={C.section} strokeWidth="2.6" />
        <circle cx="432" cy="60" r="13.5" fill="none" stroke={C.section} strokeWidth="2.2" />
      </g>
      <Label cls="b-cap" x={240} y={290} size={13.5} color={C.section}>HOY: LO QUE DA LA PL · RAYADO · SIN SALIR DE LA PV</Label>
    </svg>
  )
}

/* ================================================================
   HISTORIA — línea de tiempo: Monge → industria → ISO → BIM
   ================================================================ */
function buildHistoria(tl: TL, root: SVGSVGElement) {
  drawIn(tl, q(root, '.hi-line'), 1.0, 0)
  const nodes = ['.hi-n1', '.hi-n2', '.hi-n3', '.hi-n4']
  nodes.forEach((sel, i) => {
    const base = 0.7 + i * 1.0
    tl.fromTo(
      q(root, `${sel} .hi-dot`),
      { scale: 0, opacity: 0, transformOrigin: '50% 50%' },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.5)' },
      base,
    )
    pop(tl, qa(root, `${sel} .hi-txt`), base + 0.15)
    qa(root, `${sel} .hi-icon`).forEach((el, j) => drawIn(tl, el, 0.45, base + 0.3 + j * 0.12))
  })
  pop(tl, q(root, '.hi-cap'), 4.9)
}

function HistoriaFig({ active }: FigProps) {
  const ref = useBuildOnce(buildHistoria, active)
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 300"
      style={baseStyle}
      role="img"
      aria-label="Línea de tiempo de la convención: Monge en 1795, la industria en 1850, la norma ISO R 128 en 1959 y CAD y BIM hoy"
    >
      <Defs />
      <line className="hi-line" x1="30" y1="150" x2="450" y2="150" stroke={C.thin} strokeWidth="1.6" opacity="0" />

      {/* 1795 Monge: dos planos de proyección */}
      <g className="hi-n1">
        <circle className="hi-dot" cx="70" cy="150" r="7" fill={C.cut} opacity="0" />
        <Label cls="hi-txt" x={70} y={112} color={C.cut} size={15}>
          1795
        </Label>
        <Label cls="hi-txt" x={70} y={190} size={13}>
          MONGE
        </Label>
        <Label cls="hi-txt" x={70} y={206} size={13} color={C.thin}>
          geometría
        </Label>
        <Label cls="hi-txt" x={70} y={220} size={13} color={C.thin}>
          descriptiva
        </Label>
        <path className="hi-icon" d="M50,56 h40 v28 h-40 Z" fill="none" stroke={C.contour} strokeWidth="1.8" opacity="0" />
        <path className="hi-icon" d="M50,84 l14,14 h40 l-14,-14" fill="none" stroke={C.thin} strokeWidth="1.4" opacity="0" />
      </g>

      {/* 1850 industria: viga */}
      <g className="hi-n2">
        <circle className="hi-dot" cx="190" cy="150" r="7" fill={C.section} opacity="0" />
        <Label cls="hi-txt" x={190} y={112} color={C.section} size={15}>
          1850
        </Label>
        <Label cls="hi-txt" x={190} y={190} size={13}>
          INDUSTRIA
        </Label>
        <Label cls="hi-txt" x={190} y={206} size={13} color={C.thin}>
          piezas
        </Label>
        <Label cls="hi-txt" x={190} y={220} size={13} color={C.thin}>
          en serie
        </Label>
        <path
          className="hi-icon"
          d="M172,52 h36 v9 h-13 v22 h13 v9 h-36 v-9 h13 v-22 h-13 Z"
          fill="none"
          stroke={C.contour}
          strokeWidth="1.8"
          opacity="0"
        />
      </g>

      {/* 1959 norma: A—A */}
      <g className="hi-n3">
        <circle className="hi-dot" cx="310" cy="150" r="7" fill={C.cut} opacity="0" />
        <Label cls="hi-txt" x={310} y={112} color={C.cut} size={15}>
          1959
        </Label>
        <Label cls="hi-txt" x={310} y={190} size={13}>
          ISO/R 128
        </Label>
        <Label cls="hi-txt" x={310} y={206} size={13} color={C.thin}>
          norma de
        </Label>
        <Label cls="hi-txt" x={310} y={220} size={13} color={C.thin}>
          líneas y cortes
        </Label>
        <g className="hi-icon" opacity="0">
          <rect x="286" y="60" width="7" height="9" fill={C.cut} />
          <line x1="293" y1="64" x2="327" y2="64" stroke={C.cut} strokeWidth="1.6" strokeDasharray="8 3 2 3" />
          <rect x="327" y="60" width="7" height="9" fill={C.cut} />
          <text x="310" y="52" fill={C.cut} fontSize="13.5" fontFamily={MONO} textAnchor="middle">
            A–A
          </text>
        </g>
      </g>

      {/* HOY: cubo wireframe CAD/BIM */}
      <g className="hi-n4">
        <circle className="hi-dot" cx="430" cy="150" r="7" fill={C.section} opacity="0" />
        <Label cls="hi-txt" x={430} y={112} color={C.section} size={15}>
          HOY
        </Label>
        <Label cls="hi-txt" x={430} y={190} size={13}>
          CAD · BIM
        </Label>
        <Label cls="hi-txt" x={430} y={206} size={13} color={C.thin}>
          misma
        </Label>
        <Label cls="hi-txt" x={430} y={220} size={13} color={C.thin}>
          convención
        </Label>
        <path className="hi-icon" d="M412,60 h24 v24 h-24 Z" fill="none" stroke={C.contour} strokeWidth="1.6" opacity="0" />
        <path className="hi-icon" d="M412,60 l9,-9 h24 v24 l-9,9 M436,60 l9,-9" fill="none" stroke={C.thin} strokeWidth="1.3" opacity="0" />
      </g>

      <Label cls="hi-cap" x={240} y={266} size={13.5}>
        de la tinta a la pantalla: la convención es la misma
      </Label>
    </svg>
  )
}

/* ================================================================
   EJERCICIO — buje: cilindro con agujero pasante
   ================================================================ */
function buildEjercicio(tl: TL, root: SVGSVGElement) {
  pop(tl, q(root, '.e-t'), 0)
  fadeIn(tl, q(root, '.e-ax'), 0.15, 0.3)
  drawIn(tl, q(root, '.e-body'), 0.7, 0.45)
  fadeIn(tl, qa(root, '.e-hid'), 1.2, 0.35)
  // plane trace + thick ends
  fadeIn(tl, qa(root, '.e-plane'), 1.7, 0.4)
  pop(tl, qa(root, '.e-letter'), 2.05)
  tl.fromTo(
    qa(root, '.e-arrow'),
    { opacity: 0, x: -14 },
    { opacity: 1, x: 0, duration: 0.4, stagger: 0.12 },
    2.4,
  )
  // la sección aparece de canto en A–A y gira sin abandonar la vista
  tl.set(q(root, '.e-sec'), { opacity: 1 }, 2.95)
  drawIn(tl, q(root, '.e-arc'), 0.5, 3.05)
  pop(tl, q(root, '.e-90'), 3.15)
  tl.fromTo(q(root, '.e-out'), { attr: { rx: 3 } }, { attr: { rx: 38 }, duration: 0.9, ease: 'power2.inOut' }, 3.35)
  tl.fromTo(q(root, '.e-in'), { attr: { rx: 1.4 } }, { attr: { rx: 17 }, duration: 0.9, ease: 'power2.inOut' }, 3.35)
  tl.to(qa(root, '.e-arc, .e-90'), { opacity: 0, duration: 0.3 }, 4.35)
  pop(tl, qa(root, '.e-lab'), 4.55)
}

function EjercicioFig({ active }: FigProps) {
  const ref = useBuildOnce(buildEjercicio, active)
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 240"
      style={baseStyle}
      role="img"
      aria-label="Buje del ejercicio: vista exterior con plano A–A, flechas de observación y la sección abatida superpuesta con la corona rayada"
    >
      <Defs />
      <defs>
        <pattern id="exerciseHatch45" width="9" height="9" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="9" stroke={C.section} strokeWidth="1.25" />
        </pattern>
      </defs>
      <g transform="translate(50,38)">
        <Label cls="e-t" x={330} y={-14} size={13}>
          BUJE · PV
        </Label>
        <line className="e-ax" x1="-10" y1="48" x2="400" y2="48" stroke={C.thin} strokeWidth="1" strokeDasharray="12 4 2 4" opacity="0" />
        <path className="e-body" d="M0,8 h380 v80 h-380 Z" fill="none" stroke={C.contour} strokeWidth="2.4" opacity="0" />
        <line className="e-hid" x1="0" y1="30" x2="380" y2="30" stroke={C.hidden} strokeWidth="1.5" strokeDasharray="7 5" opacity="0" />
        <line className="e-hid" x1="0" y1="66" x2="380" y2="66" stroke={C.hidden} strokeWidth="1.5" strokeDasharray="7 5" opacity="0" />
        <rect className="e-plane" x="184" y="-22" width="12" height="12" fill={C.cut} opacity="0" />
        <rect className="e-plane" x="184" y="96" width="12" height="12" fill={C.cut} opacity="0" />
        <line className="e-plane" x1="190" y1="-10" x2="190" y2="96" stroke={C.cut} strokeWidth="1.8" strokeDasharray="12 4 2 4" opacity="0" />
        <Label cls="e-letter" x={172} y={-12} color={C.cut} size={16}>
          A
        </Label>
        <Label cls="e-letter" x={168} y={124} color={C.cut} size={16}>
          A
        </Label>
        <line className="e-arrow" x1="206" y1="-16" x2="250" y2="-16" stroke={C.section} strokeWidth="2.2" markerEnd="url(#arrow)" opacity="0" />
        <line className="e-arrow" x1="206" y1="102" x2="250" y2="102" stroke={C.section} strokeWidth="2.2" markerEnd="url(#arrow)" opacity="0" />
        <g className="e-sec" opacity="0">
          <ellipse className="e-out" cx="190" cy="48" rx="3" ry="38" fill="url(#exerciseHatch45)" stroke={C.contour} strokeWidth="1.4" />
          <ellipse className="e-in" cx="190" cy="48" rx="1.4" ry="17" fill={C.solid} stroke={C.contour} strokeWidth="1.4" />
        </g>
        <path className="e-arc" d="M190,100 A52,52 0 0 1 238,122" fill="none" stroke={C.cut} strokeWidth="2" markerEnd="url(#arrowCut)" opacity="0" />
        <Label cls="e-90" x={250} y={110} color={C.cut} size={14}>
          90°
        </Label>
        <Label cls="e-lab" x={190} y={150} color={C.section} size={13}>
          ABATIDA SOBRE LA PV · LO QUE DARÍA LA PL
        </Label>
        <Label cls="e-lab" x={190} y={170} size={13}>
          RÓTULO: CORTE A–A
        </Label>
      </g>
    </svg>
  )
}

/* ================================================================
   HERO — la historia completa en la portada
   ================================================================ */
function buildHero(tl: TL, root: SVGSVGElement) {
  fadeIn(tl, q(root, '.h-ax'), 0, 0.3)
  drawIn(tl, q(root, '.h-body'), 1.2, 0.1)
  // plane appears
  fadeIn(tl, qa(root, '.h-plane'), 1.3, 0.4)
  pop(tl, qa(root, '.h-letter'), 1.6)
  fadeIn(tl, q(root, '.h-arrow'), 1.9, 0.4)
  // blade flash = the cut happens
  tl.fromTo(q(root, '.h-blade'), { scaleY: 0, transformOrigin: '50% 0%', opacity: 0.9 }, { scaleY: 1, duration: 0.35, ease: 'power3.in' }, 2.3)
  tl.to(q(root, '.h-blade'), { opacity: 0, duration: 0.35 }, 2.7)
  // slice appears edge-on, rotates 90° to face us
  tl.set(q(root, '.h-oval'), { opacity: 1 }, 2.75)
  drawIn(tl, q(root, '.h-arc'), 0.7, 2.9)
  pop(tl, q(root, '.h-90'), 3.2)
  tl.fromTo(q(root, '.h-oval'), { attr: { rx: 3 } }, { attr: { rx: 31 }, duration: 1.0, ease: 'power2.inOut' }, 3.0)
  tl.to(q(root, '.h-arc'), { opacity: 0, duration: 0.4 }, 4.2)
  // dimension line last
  fadeIn(tl, q(root, '.h-dim'), 4.4, 0.5)
}

export function HeroArt({ active }: { active: boolean }) {
  const ref = useBuildOnce(buildHero, active)
  return (
    <svg ref={ref} viewBox="0 0 520 500" className="hero-art" role="img" aria-hidden>
      <defs>
        <pattern id="heroHatch" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="10" stroke={C.section} strokeWidth="1.2" opacity="0.95" />
        </pattern>
        <marker id="heroArrow" markerWidth="12" markerHeight="12" refX="8" refY="3.5" orient="auto">
          <path d="M0,0 L8,3.5 L0,7 Z" fill={C.cut} />
        </marker>
      </defs>
      <g transform="translate(260,235)">
        <line className="h-ax" x1="-215" y1="0" x2="215" y2="0" stroke={C.thin} strokeWidth="1" strokeDasharray="16 5 3 5" opacity="0" />
        <path
          className="h-body"
          d="M-150,-48 h300 a25,48 0 0 1 0,96 h-300 a25,48 0 0 1 0,-96 Z"
          fill="none"
          stroke={C.contour}
          strokeWidth="2.6"
          opacity="0"
        />
        {/* blade */}
        <rect className="h-blade" x="-45" y="-90" width="10" height="180" fill={C.cut} opacity="0" />
        {/* revolved oval */}
        <ellipse className="h-oval" cx="-40" cy="0" rx="3" ry="54" fill="url(#heroHatch)" stroke={C.section} strokeWidth="2.8" opacity="0" />
        {/* rotation sweep */}
        <path className="h-arc" d="M-40,-80 A80,80 0 0 1 36,-31" fill="none" stroke={C.cut} strokeWidth="2.2" markerEnd="url(#heroArrow)" opacity="0" />
        <text className="h-90" x="34" y="-66" fill={C.cut} fontSize="22" fontFamily={MONO} opacity="0">
          90°
        </text>
        {/* cut plane trace */}
        <rect className="h-plane" x="-46" y="-104" width="12" height="14" fill={C.cut} opacity="0" />
        <rect className="h-plane" x="-46" y="90" width="12" height="14" fill={C.cut} opacity="0" />
        <line className="h-plane" x1="-40" y1="-90" x2="-40" y2="90" stroke={C.cut} strokeWidth="2" strokeDasharray="16 5 3 5" opacity="0" />
        <text className="h-letter" x="-40" y="-116" fill={C.cut} fontSize="24" fontFamily={MONO} textAnchor="middle" opacity="0">
          A
        </text>
        <text className="h-letter" x="-40" y="130" fill={C.cut} fontSize="24" fontFamily={MONO} textAnchor="middle" opacity="0">
          A
        </text>
        <line className="h-arrow" x1="-20" y1="-97" x2="30" y2="-97" stroke={C.section} strokeWidth="2.4" markerEnd="url(#heroArrow)" opacity="0" />
        <g className="h-dim" opacity="0">
          <line x1="-150" y1="76" x2="-150" y2="102" stroke={C.thin} strokeWidth="1" />
          <line x1="150" y1="76" x2="150" y2="102" stroke={C.thin} strokeWidth="1" />
          <line x1="-150" y1="96" x2="150" y2="96" stroke={C.thin} strokeWidth="1" />
          <text x="0" y="90" fill={C.thin} fontSize="14" fontFamily={MONO} textAnchor="middle">
            120
          </text>
        </g>
      </g>
    </svg>
  )
}

/* ================================================================
   Mini icons (static, comparison slide)
   ================================================================ */
let miniUid = 0

const miniBodies: Record<string, (h: string) => ReactElement> = {
  'Corte total': (h) => (
    <>
      <rect x="8" y="8" width="44" height="44" fill={`url(#${h})`} stroke={C.section} strokeWidth="2" />
      <circle cx="30" cy="30" r="9" fill={C.solid} stroke={C.contour} strokeWidth="1.8" />
    </>
  ),
  Semicorte: (h) => (
    <>
      <rect x="8" y="8" width="44" height="44" fill="none" stroke={C.contour} strokeWidth="2" />
      <path d="M30,8 v44 h22 v-44 Z" fill={`url(#${h})`} stroke={C.section} strokeWidth="2" />
      <line x1="30" y1="8" x2="30" y2="52" stroke={C.cut} strokeWidth="1.4" strokeDasharray="6 3 1 3" />
    </>
  ),
  'Sección desplazada': (h) => (
    <>
      <line x1="18" y1="8" x2="18" y2="52" stroke={C.cut} strokeWidth="1.4" strokeDasharray="6 3 1 3" />
      <ellipse cx="40" cy="30" rx="12" ry="18" fill={`url(#${h})`} stroke={C.contour} strokeWidth="2.4" />
    </>
  ),
  'Sección abatida': (h) => (
    <>
      <path d="M8,30 h44" stroke={C.thin} strokeWidth="1" strokeDasharray="8 3 1 3" />
      <path d="M14,18 h32 a8,12 0 0 1 0,24 h-32 Z" fill="none" stroke={C.contour} strokeWidth="1.8" />
      <ellipse cx="26" cy="30" rx="8" ry="12" fill={`url(#${h})`} stroke={C.section} strokeWidth="2" />
    </>
  ),
  'Corte por planos concurrentes': () => (
    <>
      <circle cx="30" cy="30" r="22" fill="none" stroke={C.contour} strokeWidth="2" />
      <line x1="30" y1="8" x2="30" y2="52" stroke={C.cut} strokeWidth="1.6" strokeDasharray="6 3 1 3" />
      <line x1="12" y1="42" x2="48" y2="18" stroke={C.cut} strokeWidth="1.6" strokeDasharray="6 3 1 3" />
      <circle cx="30" cy="30" r="3" fill={C.cut} />
    </>
  ),
}

export function MiniIcon({ label }: { label: string }) {
  const body = miniBodies[label]
  if (!body) return null
  const h = `mini-hatch-${miniUid++}`
  return (
    <svg viewBox="0 0 60 60" className="mini-icon" aria-hidden>
      <defs>
        <pattern id={h} width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke={C.section} strokeWidth="1" opacity="0.9" />
        </pattern>
      </defs>
      {body(h)}
    </svg>
  )
}

/* ================================================================
   Registry
   ================================================================ */
const registry: Record<string, { comp: (p: FigProps) => ReactElement; caption: ReactNode }> = {
  historia: {
    comp: HistoriaFig,
    caption: (
      <>
        Evolución técnica ·{' '}
        <a href="https://www.iso.org/standard/83356.html" target="_blank" rel="noreferrer">ISO 128-3:2022</a>
        {' · '}
        <a href="https://virtual.unphu.edu.do/mod/url/view.php?id=1753645" target="_blank" rel="noreferrer">material UNPHU</a>
      </>
    ),
  },
  puente: {
    comp: PuenteFig,
    caption: 'Del isométrico salen PV, PH y PL; la sección abatida entrega la PL dentro de la PV',
  },
  objetivo: {
    comp: ProblemaFig,
    caption: 'Antes: líneas ocultas ambiguas · Después: cavidades visibles y material rayado',
  },
  idea: {
    comp: IdeaFig,
    caption: 'Corta → de canto es línea → gira 90° → de frente en magnitud real',
  },
  definicion: {
    comp: DefinicionFig,
    caption: 'Buje escalonado: el corte incluye la brida posterior; la sección conserva solo la corona',
  },
  cuando: {
    comp: CuandoFig,
    caption: 'Sección girada sobre la pieza: contorno fino para no confundir con aristas',
  },
  plano: {
    comp: PlanoFig,
    caption: 'Traza A–A y dirección de observación sobre la PV; el observador queda en la cola de las flechas',
  },
  rayado: {
    comp: RayadoFig,
    caption: 'La regla visual: material rayado, huecos limpios y piezas contiguas con dirección distinta',
  },
  aplicacion: {
    comp: AplicacionFig,
    caption: 'Mango ovalado: la línea de canto gira 90° y revela un óvalo 26 × 38 mm sobre la propia vista',
  },
  ejercicio: {
    comp: EjercicioFig,
    caption: 'PV del buje, plano A–A, flechas y sección abatida superpuesta en verdadera magnitud',
  },
}

export function DiagramFigure({ id, active }: { id: string; active: boolean }) {
  const entry = registry[id]
  if (!entry) return null
  const Comp = entry.comp
  return (
    <figure className="figure-panel">
      <Comp active={active} />
      <figcaption className="figure-caption">{entry.caption}</figcaption>
    </figure>
  )
}
