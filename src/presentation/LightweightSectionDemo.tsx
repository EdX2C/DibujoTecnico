import { useId, useState } from 'react'

type DemoStep = 1 | 2 | 3

const STEP_COPY: Record<DemoStep, { title: string; body: string; term: string }> = {
  1: {
    title: 'El perfil muestra el terminal, no el tubo central.',
    body: 'Ojo a la izquierda, horquilla a la derecha: ninguno describe la pared en A–A.',
    term: 'Vistas conocidas',
  },
  2: {
    title: 'A–A aísla solo el perfil transversal.',
    body: 'De canto, la sección se reduce a una línea en su posición real.',
    term: 'Sección de canto',
  },
  3: {
    title: 'El giro convierte la línea en información medible.',
    body: 'Sin ampliar la sección aparecen Ø30, Ø24 y una pared nominal de 3 mm.',
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
  const dimensionArrowId = `lite-dimension-arrow-${uid}`
  const copy = STEP_COPY[step]

  return (
    <div className={`lite-demo is-step-${step}`}>
      <div className="demo-toolbar lite-demo-toolbar" aria-label="Pasos de la demostración">
        <button type="button" className={`tool-btn ${step === 1 ? 'is-active' : ''}`} onClick={() => setStep(1)}>
          1 · Leer las vistas
        </button>
        <button type="button" className={`tool-btn primary ${step === 2 ? 'is-active' : ''}`} onClick={() => setStep(2)}>
          2 · Cortar en A–A
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
            <marker
              id={dimensionArrowId}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 Z" fill="#8fe15f" />
            </marker>
          </defs>

          <g className="lite-grid" aria-hidden="true">
            <path d="M90 350 H910 M130 322 H870 M180 296 H820" />
            <path d="M300 282 L210 365 M430 282 L380 365 M570 282 L620 365 M700 282 L790 365" />
          </g>

          <g className="lite-spatial" aria-hidden="true">
            <ellipse className="lite-shadow" cx="505" cy="306" rx="340" ry="24" />
            <rect x="275" y="175" width="450" height="80" rx="4" fill={`url(#${metalId})`} stroke="#dce8f2" strokeWidth="2" />
            <path d="M275 190 L242 170 L226 142" fill="none" stroke="#8098ac" strokeWidth="34" strokeLinecap="round" />
            <circle cx="190" cy="128" r="58" fill={`url(#${metalId})`} stroke="#e7eef5" strokeWidth="3" />
            <circle cx="190" cy="128" r="26" fill="#121b24" stroke="#dce8f2" strokeWidth="3" />
            <path d="M725 188 H772 L803 158 H862" fill="none" stroke="#8199ad" strokeWidth="31" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M725 242 H772 L803 272 H862" fill="none" stroke="#657b8e" strokeWidth="31" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="842" cy="158" r="13" fill="#121b24" stroke="#dce8f2" strokeWidth="2.5" />
            <circle cx="842" cy="272" r="13" fill="#121b24" stroke="#dce8f2" strokeWidth="2.5" />
            <path className="lite-body-highlight" d="M292 186 H708" />
            <path className="lite-centerline" d="M110 215 H905" />
            <path className="lite-cut-sheet" d="M500 92 L554 75 V337 L500 354 Z" />
          </g>

          <g className="lite-orthographic" aria-hidden="true">
            <ellipse className="lite-shadow" cx="505" cy="306" rx="340" ry="22" />
            <g className="lite-kept-half">
              <rect x="275" y="175" width="450" height="80" rx="4" fill={`url(#${metalId})`} stroke="#dbe6f0" strokeWidth="2" />
              <path d="M275 190 L242 170 L226 142" fill="none" stroke="#8098ac" strokeWidth="34" strokeLinecap="round" />
              <circle cx="190" cy="128" r="58" fill={`url(#${metalId})`} stroke="#e7eef5" strokeWidth="3" />
              <circle cx="190" cy="128" r="26" fill="#121b24" stroke="#dce8f2" strokeWidth="3" />
              <path d="M725 188 H772 L803 158 H862" fill="none" stroke="#8199ad" strokeWidth="31" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M725 242 H772 L803 272 H862" fill="none" stroke="#657b8e" strokeWidth="31" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="842" cy="158" r="13" fill="#121b24" stroke="#dce8f2" strokeWidth="2.5" />
              <circle cx="842" cy="272" r="13" fill="#121b24" stroke="#dce8f2" strokeWidth="2.5" />
              <path className="lite-body-highlight" d="M292 186 H708" />
              <path className="lite-hidden-line" d="M275 193 H725 M275 237 H725" />
            </g>
            <g className="lite-removed-half" opacity=".14">
              <rect x="500" y="175" width="225" height="80" fill={`url(#${ghostId})`} />
            </g>
            <path className="lite-centerline" d="M110 215 H905" />
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
            <circle cx="500" cy="215" r="40" fill="#173038" stroke="#e7eef5" strokeWidth="3" />
            <circle cx="500" cy="215" r="38.5" fill={`url(#${hatchId})`} />
            <circle cx="500" cy="215" r="32" fill="#0d1016" stroke="#e7eef5" strokeWidth="2.4" />
          </g>

          <g className="lite-dimensions lite-dimensions-1" aria-hidden="true">
            <path className="lite-extension-line" d="M275 175 V112 M725 175 V112" />
            <path
              className="lite-dimension-line"
              d="M275 112 H725"
              markerStart={`url(#${dimensionArrowId})`}
              markerEnd={`url(#${dimensionArrowId})`}
            />
            <text className="lite-dimension-text" x="500" y="102" textAnchor="middle">120 · CUERPO TUBULAR</text>
          </g>

          <g className="lite-dimensions lite-dimensions-3" aria-hidden="true">
            <path className="lite-center-mark" d="M444 215 H556 M500 159 V271" />
            <path className="lite-extension-line" d="M460 175 H435 M460 255 H435" />
            <path
              className="lite-dimension-line"
              d="M435 175 V255"
              markerStart={`url(#${dimensionArrowId})`}
              markerEnd={`url(#${dimensionArrowId})`}
            />
            <text className="lite-dimension-text" x="422" y="220" textAnchor="end">Ø30</text>
            <path
              className="lite-dimension-line"
              d="M468 215 H532"
              markerStart={`url(#${dimensionArrowId})`}
              markerEnd={`url(#${dimensionArrowId})`}
            />
            <path className="lite-dimension-leader" d="M532 215 L570 241 H622" />
            <text className="lite-dimension-text" x="630" y="246">Ø24</text>
            <path
              className="lite-dimension-leader lite-wall-leader"
              d="M526 244 L570 282 H626"
              markerStart={`url(#${dimensionArrowId})`}
            />
            <text className="lite-dimension-text" x="624" y="276" textAnchor="end">3</text>
            <text className="lite-dimension-note" x="624" y="300" textAnchor="end">PARED NOMINAL</text>
          </g>

          <g className="lite-callouts lite-callouts-1" aria-hidden="true">
            <text className="lite-callout-main" x="292" y="145">A–A ESTÁ EN EL TUBO</text>
            <path d="M440 150 L494 166" />
            <text className="lite-callout-main" x="80" y="224">PERFIL = OJO</text>
            <path d="M178 216 L188 178" />
            <text className="lite-callout-main" x="734" y="332">PERFIL = HORQUILLA</text>
            <text className="lite-callout-sub" x="734" y="354">ninguno describe el centro</text>
            <path d="M770 316 L809 278" />
          </g>

          <g className="lite-callouts lite-callouts-2" aria-hidden="true">
            <text className="lite-callout-main" x="286" y="130">SOLO AISLAMOS LA SECCIÓN</text>
            <path d="M470 136 L496 165" />
            <text className="lite-callout-main" x="530" y="314">DE CANTO = LÍNEA</text>
            <path d="M528 304 L502 283" />
            <text className="lite-callout-main" x="694" y="116">LA PIEZA NO GIRA</text>
            <text className="lite-callout-sub" x="694" y="136">permanece en su vista</text>
          </g>

          <g className="lite-callouts lite-callouts-3" aria-hidden="true">
            <path className="lite-rotation-arc" d="M507 164 A56 56 0 0 1 558 213" markerEnd={`url(#${orangeArrowId})`} />
            <text className="lite-rotation-text" x="548" y="176">90°</text>
            <text className="lite-callout-main lite-true-size" x="478" y="137" textAnchor="end">PERFIL LOCAL REAL</text>
            <text className="lite-callout-sub" x="478" y="157" textAnchor="end">Ø30 REAL · MISMA ESCALA</text>
          </g>

          <g className="lite-cad-reference" aria-hidden="true">
            <g className="lite-ucs" transform="translate(920 374)">
              <path d="M0 0 H38 M0 0 V-38" />
              <path d="M38 0 L31 -4 V4 Z M0 -38 L-4 -31 H4 Z" />
              <text x="45" y="5">X</text>
              <text x="-4" y="-46">Y</text>
              <circle cx="0" cy="0" r="3" />
            </g>
          </g>
        </svg>

        <div className="demo-color-key" aria-hidden="true">
          <span className="is-cut">PLANO DE CORTE</span>
          <span className="is-section">SECCIÓN</span>
          <span className="is-dimension">COTAS · mm</span>
        </div>

        <div className="lite-step-copy" aria-live="polite">
          <span>Paso {step} · {copy.term}</span>
          <strong>{copy.title}</strong>
          <p>{copy.body}</p>
        </div>
      </div>
    </div>
  )
}
