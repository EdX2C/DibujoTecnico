import { useId, useState } from 'react'

type DemoStep = 1 | 2 | 3

const STEP_COPY: Record<DemoStep, { title: string; body: string; term: string }> = {
  1: {
    title: 'La abertura no revela todo el interior.',
    body: 'Vemos el agujero, pero no el espesor del material justo donde pasa A–A.',
    term: 'Plano de corte A–A',
  },
  2: {
    title: 'Separamos la mitad situada frente al plano.',
    body: 'La sección permanece en su plano: desde esta vista se reduce a una línea.',
    term: 'Sección de canto',
  },
  3: {
    title: 'Giramos solamente la sección 90°.',
    body: 'La corona rayada aparece de frente y muestra la forma real del material cortado.',
    term: 'Sección abatida · verdadera magnitud',
  },
}

export function LightweightSectionDemo({ onOpen3D }: { onOpen3D: () => void }) {
  const [step, setStep] = useState<DemoStep>(1)
  const uid = useId().replace(/:/g, '')
  const metalId = `lite-metal-${uid}`
  const ghostId = `lite-ghost-${uid}`
  const hatchId = `lite-hatch-${uid}`
  const cyanArrowId = `lite-cyan-arrow-${uid}`
  const orangeArrowId = `lite-orange-arrow-${uid}`
  const copy = STEP_COPY[step]

  return (
    <div className={`lite-demo is-step-${step}`}>
      <div className="demo-toolbar lite-demo-toolbar" aria-label="Pasos de la demostración">
        <button type="button" className={`tool-btn ${step === 1 ? 'is-active' : ''}`} onClick={() => setStep(1)}>
          1 · Ver la pieza
        </button>
        <button type="button" className={`tool-btn primary ${step === 2 ? 'is-active' : ''}`} onClick={() => setStep(2)}>
          2 · Cortar y retirar
        </button>
        <button type="button" className={`tool-btn primary ${step === 3 ? 'is-active' : ''}`} onClick={() => setStep(3)}>
          3 · Girar la sección 90°
        </button>
        <div className="spacer" />
        <button
          type="button"
          className="tool-btn lite-open-3d"
          onClick={onOpen3D}
          title="Carga la versión WebGL interactiva"
        >
          Explorar en 3D ↗
        </button>
      </div>

      <div className="lite-demo-frame">
        <svg
          className="lite-demo-svg"
          viewBox="0 0 1000 430"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={metalId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#dce8f2" />
              <stop offset="0.45" stopColor="#8098ac" />
              <stop offset="1" stopColor="#3f5366" />
            </linearGradient>
            <linearGradient id={ghostId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8ca0ae" stopOpacity="0.32" />
              <stop offset="1" stopColor="#42515e" stopOpacity="0.12" />
            </linearGradient>
            <pattern id={hatchId} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#53d5e0" strokeWidth="3" />
            </pattern>
            <marker id={cyanArrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 Z" fill="#53d5e0" />
            </marker>
            <marker id={orangeArrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 Z" fill="#ff6b2e" />
            </marker>
          </defs>

          <g className="lite-grid" aria-hidden="true">
            <path d="M90 350 H910 M130 322 H870 M180 296 H820" />
            <path d="M300 282 L210 365 M430 282 L380 365 M570 282 L620 365 M700 282 L790 365" />
          </g>

          <g className="lite-spatial" aria-hidden="true">
            <ellipse className="lite-shadow" cx="485" cy="306" rx="250" ry="24" />
            <rect x="245" y="140" width="420" height="150" fill={`url(#${metalId})`} />
            <ellipse cx="245" cy="215" rx="33" ry="75" fill="#657b8e" stroke="#dce8f2" strokeWidth="2" />
            <ellipse cx="665" cy="215" rx="33" ry="75" fill="#7790a5" stroke="#e7eef5" strokeWidth="3" />
            <ellipse cx="665" cy="215" rx="16" ry="39" fill="#121b24" stroke="#dce8f2" strokeWidth="2" />
            <path className="lite-body-highlight" d="M258 153 H650" />
            <path className="lite-centerline" d="M205 215 H715" />
            <path className="lite-cut-sheet" d="M500 92 L554 75 V337 L500 354 Z" />
          </g>

          <g className="lite-orthographic" aria-hidden="true">
            <ellipse className="lite-shadow" cx="530" cy="306" rx="300" ry="22" />
            <g className="lite-kept-half">
              <rect x="260" y="145" width="240" height="140" fill={`url(#${metalId})`} stroke="#dbe6f0" strokeWidth="2" />
              <path className="lite-body-highlight" d="M275 157 H486" />
              <path className="lite-hidden-line" d="M260 190 H500 M260 240 H500" />
            </g>
            <g className="lite-removed-half">
              <rect x="660" y="145" width="190" height="140" fill={`url(#${ghostId})`} stroke="#7c919e" strokeWidth="2" />
              <rect x="660" y="190" width="190" height="50" fill="#101820" fillOpacity="0.62" />
              <path className="lite-hidden-line" d="M660 190 H850 M660 240 H850" />
              <path d="M660 145 V285" stroke="#a8bac4" strokeWidth="2" />
            </g>
          </g>

          <g className="lite-cut-trace" aria-hidden="true">
            <path d="M500 70 V352" />
            <rect x="494" y="66" width="12" height="18" rx="1" />
            <rect x="494" y="338" width="12" height="18" rx="1" />
            <text x="482" y="58">A</text>
            <text x="482" y="382">A</text>
            <path className="lite-view-arrow" d="M600 92 H526" markerEnd={`url(#${cyanArrowId})`} />
            <path className="lite-view-arrow" d="M600 330 H526" markerEnd={`url(#${cyanArrowId})`} />
          </g>

          <g className="lite-annulus" aria-hidden="true">
            <circle cx="500" cy="215" r="72" fill="#173038" stroke="#e7eef5" strokeWidth="3" />
            <circle cx="500" cy="215" r="70" fill={`url(#${hatchId})`} />
            <circle cx="500" cy="215" r="32" fill="#0d1016" stroke="#e7eef5" strokeWidth="3" />
          </g>

          <g className="lite-callouts lite-callouts-1" aria-hidden="true">
            <text className="lite-callout-main" x="292" y="86">POR AQUÍ CORTAMOS</text>
            <text className="lite-callout-sub" x="292" y="108">plano A–A</text>
            <path d="M438 101 L495 118" />
            <text className="lite-callout-main" x="705" y="135">ABERTURA VISIBLE</text>
            <path d="M702 145 L680 188" />
            <text className="lite-callout-main" x="618" y="354">MIRAMOS HACIA ACÁ</text>
            <text className="lite-callout-sub" x="618" y="376">dirección de las flechas</text>
            <path d="M615 338 L575 328" />
          </g>

          <g className="lite-callouts lite-callouts-2" aria-hidden="true">
            <text className="lite-callout-main" x="286" y="116">MITAD CONSERVADA</text>
            <path d="M375 122 L390 145" />
            <text className="lite-callout-main" x="690" y="116">MITAD RETIRADA</text>
            <text className="lite-callout-sub" x="690" y="136">referencia tenue</text>
            <path d="M755 140 L755 154" />
            <text className="lite-callout-main" x="520" y="314">DE CANTO = LÍNEA</text>
            <path d="M518 304 L502 283" />
            <text className="lite-callout-main" x="705" y="326">HUECO PASANTE</text>
            <path d="M704 315 L758 240" />
          </g>

          <g className="lite-callouts lite-callouts-3" aria-hidden="true">
            <path className="lite-rotation-arc" d="M510 137 A92 92 0 0 1 602 214" markerEnd={`url(#${orangeArrowId})`} />
            <text className="lite-rotation-text" x="566" y="152">90°</text>
            <text className="lite-callout-main" x="596" y="112">MATERIAL CORTADO</text>
            <path d="M594 120 L550 168" />
            <text className="lite-callout-main" x="586" y="276">HUECO</text>
            <path d="M578 266 L530 235" />
            <text className="lite-callout-main lite-true-size" x="478" y="104" textAnchor="end">FORMA REAL</text>
            <text className="lite-callout-sub" x="478" y="124" textAnchor="end">verdadera magnitud</text>
          </g>
        </svg>

        <div className="lite-step-copy" aria-live="polite">
          <span>Paso {step} · {copy.term}</span>
          <strong>{copy.title}</strong>
          <p>{copy.body}</p>
        </div>
      </div>
    </div>
  )
}
