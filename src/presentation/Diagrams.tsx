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
   PROBLEMA — una pieza compuesta invalida la lectura por el extremo:
   ojo y horquilla no revelan el perfil del tubo central.
   ================================================================ */
function buildProblema(tl: TL, root: SVGSVGElement) {
  pop(tl, qa(root, '.p-title'), 0)
  drawIn(tl, q(root, '.p-body'), 0.85, 0.15)
  fadeIn(tl, qa(root, '.p-terminal'), 0.62, 0.55, 0.08)
  fadeIn(tl, qa(root, '.p-center'), 0.3, 0.8)
  fadeIn(tl, qa(root, '.p-plane'), 0.5, 1.02)
  pop(tl, qa(root, '.p-letter'), 1.25)
  pop(tl, qa(root, '.p-profile'), 1.48)
  fadeIn(tl, qa(root, '.p-link'), 1.72, 0.4)
  pop(tl, q(root, '.p-not-equal'), 2.05)
  pop(tl, q(root, '.p-question'), 2.28)
  pop(tl, q(root, '.p-result'), 2.55)
}

function ProblemaFig({ active }: FigProps) {
  const ref = useBuildOnce(buildProblema, active)
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 300"
      style={baseStyle}
      role="img"
      aria-label="Varilla de control compuesta: el perfil de ojo y la horquilla de los extremos no revelan si el tubo central es macizo o hueco en A–A"
    >
      <defs>
        <linearGradient id="probMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#657b8c" stopOpacity=".66" />
          <stop offset=".5" stopColor="#243340" stopOpacity=".78" />
          <stop offset="1" stopColor="#0f171e" stopOpacity=".9" />
        </linearGradient>
      </defs>

      <Label cls="p-title" x={24} y={24} size={13} color={C.thin} anchor="start">
        VISTAS CONOCIDAS · ALZADO
      </Label>
      <g transform="translate(18,44)">
        <line className="p-center" x1="0" y1="74" x2="444" y2="74" stroke={C.hidden} strokeWidth="1" strokeDasharray="12 4 2 4" opacity="0" />
        <path className="p-body" d="M104,50 H346 V98 H104 Z" fill="url(#probMetal)" stroke={C.contour} strokeWidth="2.2" opacity="0" />

        {/* terminal articulado izquierdo */}
        <path className="p-terminal" d="M104,54 L80,43 L70,30" fill="none" stroke={C.contour} strokeWidth="18" strokeLinecap="round" opacity="0" />
        <circle className="p-terminal" cx="47" cy="26" r="31" fill={C.solid} stroke={C.contour} strokeWidth="2.2" opacity="0" />
        <circle className="p-terminal" cx="47" cy="26" r="14" fill={C.solid} stroke={C.section} strokeWidth="2" opacity="0" />

        {/* horquilla derecha */}
        <path className="p-terminal" d="M346,61 H374 L391,42 H430" fill="none" stroke={C.contour} strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
        <path className="p-terminal" d="M346,87 H374 L391,106 H430" fill="none" stroke={C.contour} strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
        <circle className="p-terminal" cx="423" cy="42" r="7" fill={C.solid} stroke={C.section} strokeWidth="1.7" opacity="0" />
        <circle className="p-terminal" cx="423" cy="106" r="7" fill={C.solid} stroke={C.section} strokeWidth="1.7" opacity="0" />

        {/* punto que realmente se necesita inspeccionar */}
        <line className="p-plane" x1="226" y1="17" x2="226" y2="128" stroke={C.cut} strokeWidth="2" strokeDasharray="11 4 2 4" opacity="0" />
        <rect className="p-plane" x="221" y="11" width="10" height="10" fill={C.cut} opacity="0" />
        <rect className="p-plane" x="221" y="127" width="10" height="10" fill={C.cut} opacity="0" />
        <Label cls="p-letter" x={207} y={17} color={C.cut} size={15}>A</Label>
        <Label cls="p-letter" x={207} y={140} color={C.cut} size={15}>A</Label>
      </g>

      <g transform="translate(42,208)">
        <circle className="p-profile" cx="44" cy="0" r="30" fill="none" stroke={C.contour} strokeWidth="2.2" opacity="0" />
        <circle className="p-profile" cx="44" cy="0" r="13" fill="none" stroke={C.section} strokeWidth="2" opacity="0" />
        <Label cls="p-profile" x={44} y={50} size={12.5}>PERFIL DEL OJO</Label>
      </g>
      <path className="p-link" d="M122,208 H186" stroke={C.thin} strokeWidth="1.4" strokeDasharray="7 5" opacity="0" />
      <Label cls="p-not-equal" x={218} y={213} size={26} color={C.cut}>≠</Label>
      <path className="p-link" d="M247,208 H306" stroke={C.thin} strokeWidth="1.4" strokeDasharray="7 5" opacity="0" />
      <g transform="translate(344,208)">
        <circle className="p-question" cx="38" cy="0" r="30" fill="none" stroke={C.cut} strokeWidth="2" strokeDasharray="7 5" opacity="0" />
        <Label cls="p-question" x={38} y={8} size={28} color={C.cut}>?</Label>
        <Label cls="p-question" x={38} y={50} size={12.5} color={C.cut}>SECCIÓN EN A–A</Label>
      </g>
      <Label cls="p-result" x={240} y={292} size={13} color={C.section}>
        EL EXTREMO NO REVELA SI EL CENTRO ES MACIZO O TUBULAR
      </Label>
    </svg>
  )
}

/* ================================================================
   IDEA — corta → de canto → gira 90° → de frente
   ================================================================ */
function buildIdea(tl: TL, root: SVGSVGElement) {
  fadeIn(tl, q(root, '.i-ax'), 0, 0.3)
  drawIn(tl, q(root, '.i-bar'), 0.65, 0.1)
  pop(tl, q(root, '.i-s1'), 0.72)
  tl.fromTo(q(root, '.i-knife'), { y: -70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38, ease: 'power3.in' }, 0.88)
  tl.fromTo(q(root, '.i-flash'), { opacity: 0 }, { opacity: 1, duration: 0.09, yoyo: true, repeat: 1 }, 1.22)
  tl.fromTo(q(root, '.i-edge'), { opacity: 0 }, { opacity: 1, duration: 0.25 }, 1.32)
  tl.to(q(root, '.i-knife'), { opacity: 0, duration: 0.22 }, 1.5)
  tl.to(q(root, '.i-slice'), { x: 365, y: 155, duration: 0.65, ease: 'power2.inOut' }, 1.62)
  pop(tl, q(root, '.i-s2'), 2.08)
  pop(tl, q(root, '.i-s3'), 2.4)
  drawIn(tl, q(root, '.i-arc'), 0.42, 2.4)
  tl.fromTo(
    q(root, '.i-oval'),
    { opacity: 0, scaleX: 0.04, transformOrigin: '50% 50%', transformBox: 'fill-box' },
    { opacity: 1, scaleX: 1, duration: 0.62, ease: 'power2.inOut' },
    2.48,
  )
  tl.to(q(root, '.i-line'), { opacity: 0, duration: 0.28 }, 2.5)
  tl.to(q(root, '.i-arc'), { opacity: 0, duration: 0.3 }, 3.14)
  pop(tl, q(root, '.i-s4'), 3.22)
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
        <g className="i-oval" opacity="0">
          <ellipse cx="0" cy="0" rx="28" ry="28" fill="url(#ideaHatch45)" stroke={C.section} strokeWidth="2.2" />
          <ellipse cx="0" cy="0" rx="17" ry="17" fill={C.solid} stroke={C.contour} strokeWidth="1.8" />
        </g>
        <path className="i-arc" d="M0,-42 A42,42 0 0 1 40,-12" fill="none" stroke={C.cut} strokeWidth="2.2" markerEnd="url(#arrowCut)" opacity="0" />
      </g>
      <Label cls="i-s2" x={365} y={204} size={13} color={C.section}>
        2 · DE CANTO: LÍNEA
      </Label>
      <Label cls="i-s3" x={365} y={226} size={13} color={C.cut}>
        3 · GIRA 90°
      </Label>
      <Label cls="i-s4" x={365} y={248} size={13} color={C.section}>
        4 · PERFIL REAL DEL TUBO
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
        MISMO BUJE ESCALONADO · PLANO A–A
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
   CUÁNDO — regla visual de decisión: superponer un perfil local
   simple o desplazarlo si roba claridad.
   ================================================================ */
function buildCuando(tl: TL, root: SVGSVGElement) {
  pop(tl, qa(root, '.c-head'), 0)
  drawIn(tl, q(root, '.c-bar'), 0.65, 0.15)
  fadeIn(tl, qa(root, '.c-plane'), 0.42, 0.58)
  tl.fromTo(
    q(root, '.c-simple'),
    { opacity: 0, scaleX: 0.04, transformOrigin: '50% 50%', transformBox: 'fill-box' },
    { opacity: 1, scaleX: 1, duration: 0.62, ease: 'power2.inOut' },
    0.88,
  )
  pop(tl, qa(root, '.c-yes'), 1.35)
  drawIn(tl, q(root, '.c-complex-body'), 0.55, 1.65)
  fadeIn(tl, qa(root, '.c-complex'), 0.5, 2.03)
  tl.fromTo(q(root, '.c-move'), { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.42 }, 2.35)
  pop(tl, qa(root, '.c-no'), 2.72)
}

function CuandoFig({ active }: FigProps) {
  const ref = useBuildOnce(buildCuando, active)
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 300"
      style={baseStyle}
      role="img"
      aria-label="Regla de decisión: un perfil local simple se superpone como sección abatida; un perfil complejo se desplaza fuera de la vista"
    >
      <Defs />
      <defs>
        <pattern id="whenHatch45" width="9" height="9" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="9" stroke={C.section} strokeWidth="1.2" />
        </pattern>
      </defs>
      <line x1="240" y1="18" x2="240" y2="282" stroke={C.thin} strokeWidth="1" strokeDasharray="3 6" opacity=".45" />
      <Label cls="c-head" x={121} y={24} size={13.5} color={C.section}>SÍ · ABATIDA</Label>
      <Label cls="c-head" x={360} y={24} size={13.5} color={C.cut}>NO LA FUERCES</Label>

      <g transform="translate(18,54)">
        <line x1="0" y1="63" x2="208" y2="63" stroke={C.hidden} strokeWidth="1" strokeDasharray="10 4 2 4" />
        <path className="c-bar" d="M9,38 H199 Q212,38 212,63 Q212,88 199,88 H9 Q-4,88 -4,63 Q-4,38 9,38 Z" fill="none" stroke={C.contour} strokeWidth="2.1" opacity="0" />
        <line className="c-plane" x1="106" y1="12" x2="106" y2="113" stroke={C.cut} strokeWidth="1.8" strokeDasharray="10 4 2 4" opacity="0" />
        <Label cls="c-plane" x={91} y={13} size={13} color={C.cut}>A</Label>
        <Label cls="c-plane" x={91} y={124} size={13} color={C.cut}>A</Label>
        <g className="c-simple" opacity="0">
          <circle cx="106" cy="63" r="25" fill="url(#whenHatch45)" stroke={C.section} strokeWidth="1.8" />
          <circle cx="106" cy="63" r="15" fill={C.solid} stroke={C.contour} strokeWidth="1.5" />
        </g>
        <Label cls="c-yes" x={106} y={154} size={13} color={C.section}>LOCAL · SIMPLE · LEGIBLE</Label>
        <Label cls="c-yes" x={106} y={173} size={12.5}>queda ligada a A–A</Label>
      </g>

      <g transform="translate(262,54)">
        <path className="c-complex-body" d="M0,42 H145 L198,18 V108 L145,84 H0 Z" fill="none" stroke={C.contour} strokeWidth="2.1" opacity="0" />
        <path className="c-complex" d="M98,32 L119,47 L143,39 L151,62 L139,86 L112,77 L91,94 L76,71 L78,43 Z" fill="none" stroke={C.cut} strokeWidth="2" opacity="0" />
        <line className="c-complex" x1="110" y1="10" x2="110" y2="118" stroke={C.cut} strokeWidth="1.7" strokeDasharray="10 4 2 4" opacity="0" />
        <path className="c-move" d="M138,118 C148,143 167,151 188,154" fill="none" stroke={C.section} strokeWidth="2" markerEnd="url(#arrow)" opacity="0" />
        <path className="c-move" d="M154,142 l18,-5 15,13 -6,21 -21,5 -15,-14 Z" fill="url(#whenHatch45)" stroke={C.section} strokeWidth="1.8" opacity="0" />
        <Label cls="c-no" x={99} y={194} size={13} color={C.contour}>COMPLEJA O SUPERPUESTA</Label>
        <Label cls="c-no" x={99} y={213} size={12.5}>desplázala fuera</Label>
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
  fadeIn(tl, qa(root, '.pl-local'), 2.35, 0.35)
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
      aria-label="Plano de corte A–A: traza de trazo y punto con extremos gruesos, letras A, flechas de observación en el mismo sentido y sección local producida en la traza"
    >
      <Defs />
      <Label cls="pl-title" x={240} y={24} size={15} color={C.cut}>PLANO DE CORTE A–A</Label>

      <rect className="pl-piece" x="65" y="88" width="350" height="118" fill="none" stroke={C.contour} strokeWidth="2.2" opacity="0" />
      <line className="pl-hidden" x1="45" y1="147" x2="435" y2="147" stroke={C.thin} strokeWidth="1" strokeDasharray="12 4 2 4" opacity="0" />
      <rect className="pl-local" x="232" y="88" width="16" height="118" fill={C.section} fillOpacity="0.12" opacity="0" />
      <Label cls="pl-local" x={142} y={126} size={13} color={C.section}>SECCIÓN PRODUCIDA EN A–A</Label>

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
      <Label cls="pl-note" x={240} y={288} size={13.5} color={C.section}>TRAZA = LUGAR · FLECHAS = MIRADA · GIRO = PERFIL</Label>
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
   APLICACIÓN — varilla de control compuesta. Los terminales no
   describen la pared central; A–A concentra cotas y tolerancias.
   ================================================================ */
function buildAplicacion(tl: TL, root: SVGSVGElement) {
  pop(tl, qa(root, '.a-title'), 0)
  drawIn(tl, q(root, '.a-body'), 0.7, 0.2)
  fadeIn(tl, qa(root, '.a-terminal'), 0.58, 0.55, 0.08)
  fadeIn(tl, qa(root, '.a-cut'), 0.45, 0.92)
  pop(tl, qa(root, '.a-cut-label'), 1.12)
  tl.fromTo(
    q(root, '.a-section'),
    { opacity: 0.2, scaleX: 0.025, transformOrigin: '50% 50%', transformBox: 'fill-box' },
    { opacity: 1, scaleX: 1, duration: 0.72, ease: 'power3.inOut' },
    1.35,
  )
  fadeIn(tl, qa(root, '.a-dim'), 2.02, 0.42, 0.08)
  pop(tl, qa(root, '.a-tolerance'), 2.45)
  pop(tl, q(root, '.a-cap'), 2.78)
}

function AplicacionFig({ active }: FigProps) {
  const ref = useBuildOnce(buildAplicacion, active)
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 310"
      style={baseStyle}
      role="img"
      aria-label="Varilla de control compuesta con ojo y horquilla; la sección A–A del tubo central muestra diámetros 30 y 24 milímetros y pared nominal de 3 milímetros"
    >
      <Defs />
      <defs>
        <pattern id="appHatch45" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke={C.section} strokeWidth="1.1" />
        </pattern>
        <marker id="appDimArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#8fe15f" />
        </marker>
      </defs>
      <Label cls="a-title" x={22} y={24} size={13} color={C.cut} anchor="start">VARILLA DE CONTROL · CASO DIDÁCTICO</Label>
      <Label cls="a-title" x={458} y={24} size={12.5} color={C.thin} anchor="end">COTAS EN mm</Label>

      <g transform="translate(18,72)">
        <line x1="0" y1="63" x2="444" y2="63" stroke={C.hidden} strokeWidth="1" strokeDasharray="12 4 2 4" />
        <path className="a-body" d="M104,42 H346 V84 H104 Z" fill="none" stroke={C.contour} strokeWidth="2.2" opacity="0" />
        <path className="a-terminal" d="M104,50 L78,38 L68,24" fill="none" stroke={C.contour} strokeWidth="17" strokeLinecap="round" opacity="0" />
        <circle className="a-terminal" cx="46" cy="21" r="28" fill={C.solid} stroke={C.contour} strokeWidth="2.2" opacity="0" />
        <circle className="a-terminal" cx="46" cy="21" r="12" fill={C.solid} stroke={C.section} strokeWidth="2" opacity="0" />
        <path className="a-terminal" d="M346,52 H374 L392,35 H430" fill="none" stroke={C.contour} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
        <path className="a-terminal" d="M346,75 H374 L392,92 H430" fill="none" stroke={C.contour} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
        <circle className="a-terminal" cx="424" cy="35" r="6.5" fill={C.solid} stroke={C.section} strokeWidth="1.6" opacity="0" />
        <circle className="a-terminal" cx="424" cy="92" r="6.5" fill={C.solid} stroke={C.section} strokeWidth="1.6" opacity="0" />

        <line className="a-cut" x1="226" y1="-12" x2="226" y2="138" stroke={C.cut} strokeWidth="1.9" strokeDasharray="11 4 2 4" opacity="0" />
        <rect className="a-cut" x="221" y="-17" width="10" height="12" fill={C.cut} opacity="0" />
        <rect className="a-cut" x="221" y="138" width="10" height="12" fill={C.cut} opacity="0" />
        <Label cls="a-cut-label" x={209} y={-9} size={14.5} color={C.cut}>A</Label>
        <Label cls="a-cut-label" x={209} y={153} size={14.5} color={C.cut}>A</Label>

        <g className="a-section" opacity="0">
          <circle cx="226" cy="63" r="21" fill="url(#appHatch45)" stroke={C.section} strokeWidth="1.9" />
          <circle cx="226" cy="63" r="16.8" fill={C.solid} stroke={C.contour} strokeWidth="1.7" />
          <line x1="199" y1="63" x2="253" y2="63" stroke={C.hidden} strokeWidth="1" strokeDasharray="9 4 2 4" />
          <line x1="226" y1="36" x2="226" y2="90" stroke={C.hidden} strokeWidth="1" strokeDasharray="9 4 2 4" />
        </g>

        <g className="a-dim" opacity="0" stroke="#8fe15f" fill="none">
          <line x1="194" y1="42" x2="194" y2="84" strokeWidth="1.2" markerStart="url(#appDimArrow)" markerEnd="url(#appDimArrow)" />
          <text x="185" y="67" fill="#8fe15f" stroke="none" fontSize="12.5" fontFamily={MONO} textAnchor="end">Ø30 ±0.05</text>
        </g>
        <g className="a-dim" opacity="0" stroke="#8fe15f" fill="none">
          <line x1="258" y1="46.2" x2="258" y2="79.8" strokeWidth="1.2" markerStart="url(#appDimArrow)" markerEnd="url(#appDimArrow)" />
          <text x="266" y="67" fill="#8fe15f" stroke="none" fontSize="12.5" fontFamily={MONO}>Ø24 ±0.05</text>
        </g>
      </g>

      <g transform="translate(30,228)">
        <rect className="a-tolerance" x="0" y="0" width="420" height="48" rx="4" fill="none" stroke={C.thin} strokeWidth="1.2" opacity="0" />
        <Label cls="a-tolerance" x={105} y={21} size={11.8} color={C.thin}>PARED NOMINAL</Label>
        <Label cls="a-tolerance" x={105} y={40} size={13} color={C.section}>e = (30 − 24) / 2 = 3.00</Label>
        <line className="a-tolerance" x1="214" y1="7" x2="214" y2="41" stroke={C.thin} strokeWidth="1" opacity="0" />
        <Label cls="a-tolerance" x={325} y={21} size={11.8} color={C.thin}>INTERVALO RESULTANTE</Label>
        <Label cls="a-tolerance" x={325} y={40} size={14} color={C.cut}>2.95 ≤ e ≤ 3.05</Label>
      </g>
      <Label cls="a-cap" x={240} y={301} size={11.8} color={C.cut}>COTAS DIDÁCTICAS · NO CORRESPONDEN A UNA PIEZA CERTIFICADA</Label>
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
   EJERCICIO — la misma varilla compuesta, ahora como entrega.
   ================================================================ */
function buildEjercicio(tl: TL, root: SVGSVGElement) {
  pop(tl, q(root, '.e-t'), 0)
  fadeIn(tl, q(root, '.e-ax'), 0.15, 0.3)
  drawIn(tl, q(root, '.e-body'), 0.7, 0.45)
  fadeIn(tl, qa(root, '.e-terminal'), 0.75, 0.8, 0.06)
  fadeIn(tl, qa(root, '.e-plane'), 0.5, 1.25)
  pop(tl, qa(root, '.e-letter'), 1.52)
  tl.fromTo(
    qa(root, '.e-arrow'),
    { opacity: 0, x: -14 },
    { opacity: 1, x: 0, duration: 0.4, stagger: 0.12 },
    1.72,
  )
  tl.fromTo(
    q(root, '.e-sec'),
    { opacity: 0.2, scaleX: 0.035, transformOrigin: '50% 50%', transformBox: 'fill-box' },
    { opacity: 1, scaleX: 1, duration: 0.72, ease: 'power2.inOut' },
    2.05,
  )
  pop(tl, qa(root, '.e-lab'), 2.75)
}

function EjercicioFig({ active }: FigProps) {
  const ref = useBuildOnce(buildEjercicio, active)
  return (
    <svg
      ref={ref}
      viewBox="0 0 480 240"
      style={baseStyle}
      role="img"
      aria-label="Ejercicio de varilla de control: vista exterior compuesta, plano A–A, flechas y sección abatida del tubo central con pared rayada"
    >
      <Defs />
      <defs>
        <pattern id="exerciseHatch45" width="9" height="9" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="9" stroke={C.section} strokeWidth="1.25" />
        </pattern>
      </defs>
      <g transform="translate(20,38)">
        <Label cls="e-t" x={220} y={-15} size={13}>
          VARILLA DE CONTROL · VISTA EXTERIOR
        </Label>
        <line className="e-ax" x1="0" y1="60" x2="440" y2="60" stroke={C.thin} strokeWidth="1" strokeDasharray="12 4 2 4" opacity="0" />
        <path className="e-body" d="M105,39 H335 V81 H105 Z" fill="none" stroke={C.contour} strokeWidth="2.2" opacity="0" />
        <path className="e-terminal" d="M105,47 L80,36 L68,23" fill="none" stroke={C.contour} strokeWidth="16" strokeLinecap="round" opacity="0" />
        <circle className="e-terminal" cx="45" cy="20" r="27" fill={C.solid} stroke={C.contour} strokeWidth="2.1" opacity="0" />
        <circle className="e-terminal" cx="45" cy="20" r="11" fill={C.solid} stroke={C.section} strokeWidth="1.8" opacity="0" />
        <path className="e-terminal" d="M335,49 H365 L384,33 H426" fill="none" stroke={C.contour} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
        <path className="e-terminal" d="M335,72 H365 L384,88 H426" fill="none" stroke={C.contour} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
        <circle className="e-terminal" cx="421" cy="33" r="6" fill={C.solid} stroke={C.section} strokeWidth="1.5" opacity="0" />
        <circle className="e-terminal" cx="421" cy="88" r="6" fill={C.solid} stroke={C.section} strokeWidth="1.5" opacity="0" />

        <rect className="e-plane" x="215" y="-10" width="10" height="11" fill={C.cut} opacity="0" />
        <rect className="e-plane" x="215" y="120" width="10" height="11" fill={C.cut} opacity="0" />
        <line className="e-plane" x1="220" y1="1" x2="220" y2="120" stroke={C.cut} strokeWidth="1.8" strokeDasharray="12 4 2 4" opacity="0" />
        <Label cls="e-letter" x={203} y={-6} color={C.cut} size={15}>
          A
        </Label>
        <Label cls="e-letter" x={203} y={141} color={C.cut} size={15}>
          A
        </Label>
        <line className="e-arrow" x1="233" y1="-5" x2="268" y2="-5" stroke={C.section} strokeWidth="2.2" markerEnd="url(#arrow)" opacity="0" />
        <line className="e-arrow" x1="233" y1="126" x2="268" y2="126" stroke={C.section} strokeWidth="2.2" markerEnd="url(#arrow)" opacity="0" />
        <g className="e-sec" opacity="0">
          <circle cx="220" cy="60" r="21" fill="url(#exerciseHatch45)" stroke={C.section} strokeWidth="1.7" />
          <circle cx="220" cy="60" r="16.8" fill={C.solid} stroke={C.contour} strokeWidth="1.6" />
        </g>
        <Label cls="e-lab" x={220} y={166} color={C.section} size={13}>
          CORTE A–A · Ø30 / Ø24 · e = 3 mm
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
  fadeIn(tl, qa(root, '.h-terminal'), 0.4, 0.45, 0.06)
  // plane appears
  fadeIn(tl, qa(root, '.h-plane'), 1.3, 0.4)
  pop(tl, qa(root, '.h-letter'), 1.6)
  fadeIn(tl, q(root, '.h-arrow'), 1.9, 0.4)
  // blade flash = the cut happens
  tl.fromTo(q(root, '.h-blade'), { scaleY: 0, transformOrigin: '50% 0%', opacity: 0.9 }, { scaleY: 1, duration: 0.35, ease: 'power3.in' }, 2.3)
  tl.to(q(root, '.h-blade'), { opacity: 0, duration: 0.35 }, 2.7)
  // slice appears edge-on, rotates 90° to face us
  drawIn(tl, q(root, '.h-arc'), 0.7, 2.9)
  pop(tl, q(root, '.h-90'), 3.2)
  tl.fromTo(
    q(root, '.h-oval'),
    { opacity: 0, scaleX: 0.05, transformOrigin: '50% 50%', transformBox: 'fill-box' },
    { opacity: 1, scaleX: 1, duration: 1.0, ease: 'power2.inOut' },
    3.0,
  )
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
          d="M-120,-34 H120 V34 H-120 Z"
          fill="none"
          stroke={C.contour}
          strokeWidth="2.6"
          opacity="0"
        />
        <path className="h-terminal" d="M-120,-20 L-145,-31 L-155,-45" fill="none" stroke={C.contour} strokeWidth="19" strokeLinecap="round" opacity="0" />
        <circle className="h-terminal" cx="-184" cy="-49" r="39" fill={C.solid} stroke={C.contour} strokeWidth="2.6" opacity="0" />
        <circle className="h-terminal" cx="-184" cy="-49" r="17" fill={C.solid} stroke={C.section} strokeWidth="2.2" opacity="0" />
        <path className="h-terminal" d="M120,-19 H145 L166,-38 H208" fill="none" stroke={C.contour} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
        <path className="h-terminal" d="M120,19 H145 L166,38 H208" fill="none" stroke={C.contour} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
        <circle className="h-terminal" cx="201" cy="-38" r="7" fill={C.solid} stroke={C.section} strokeWidth="1.8" opacity="0" />
        <circle className="h-terminal" cx="201" cy="38" r="7" fill={C.solid} stroke={C.section} strokeWidth="1.8" opacity="0" />
        {/* blade */}
        <rect className="h-blade" x="-45" y="-90" width="10" height="180" fill={C.cut} opacity="0" />
        {/* revolved oval */}
        <g className="h-oval" opacity="0">
          <circle cx="-40" cy="0" r="34" fill="url(#heroHatch)" stroke={C.section} strokeWidth="2.8" />
          <circle cx="-40" cy="0" r="27.2" fill={C.solid} stroke={C.contour} strokeWidth="2.2" />
        </g>
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
          <line x1="-120" y1="54" x2="-120" y2="102" stroke={C.thin} strokeWidth="1" />
          <line x1="120" y1="54" x2="120" y2="102" stroke={C.thin} strokeWidth="1" />
          <line x1="-120" y1="96" x2="120" y2="96" stroke={C.thin} strokeWidth="1" />
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
  _historyReference: {
    comp: HistoriaFig,
    caption: 'Material de respaldo no incluido en el recorrido de 8 minutos',
  },
  _sectionDifferenceReference: {
    comp: DefinicionFig,
    caption: 'Material de respaldo no incluido en el recorrido de 8 minutos',
  },
  objetivo: {
    comp: ProblemaFig,
    caption: 'El ojo y la horquilla describen los extremos; ninguno revela el perfil del tubo en A–A',
  },
  idea: {
    comp: IdeaFig,
    caption: 'Aísla la sección → de canto es línea → gira 90° → aparece el perfil local real',
  },
  cuando: {
    comp: CuandoFig,
    caption: 'Abatida si el perfil local es simple; desplazada si superponerlo sacrifica claridad',
  },
  plano: {
    comp: PlanoFig,
    caption: 'Traza A–A y dirección de observación en una sola vista; el observador queda en la cola',
  },
  rayado: {
    comp: RayadoFig,
    caption: 'La regla visual: material rayado, huecos limpios y piezas contiguas con dirección distinta',
  },
  aplicacion: {
    comp: AplicacionFig,
    caption: (
      <>
        Caso didáctico inspirado en varillas push-pull ·{' '}
        <a href="https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_65-15A.pdf" target="_blank" rel="noreferrer">
          FAA AC 65-15A
        </a>
        {' · '}cotas no certificadas
      </>
    ),
  },
  ejercicio: {
    comp: EjercicioFig,
    caption: 'Vista exterior compuesta, plano A–A, flechas, sección abatida y cotas de la pared tubular',
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
