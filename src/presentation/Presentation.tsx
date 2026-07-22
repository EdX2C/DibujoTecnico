import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { slides, exerciseWhy } from '../content/slides'
import { DiagramFigure, HeroArt, MiniIcon } from './Diagrams'
import { LightweightSectionDemo } from './LightweightSectionDemo'

interface PresentationProps {
  onOpenFullscreenDemo: () => void
}

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const MARQUEE_TERMS = [
  'CORTE A–A',
  'SECCIÓN',
  'ABATIMIENTO 90°',
  'ISO 128-3:2022',
  'RAYADO 45°',
  'VERDADERA MAGNITUD',
  'PLANO DE CORTE',
  'GEOMETRÍA DESCRIPTIVA',
]

const REVERSED_FIGURE_SLIDES = new Set(['historia', 'definicion', 'plano', 'aplicacion'])

type VisualAct = 0 | 1 | 2 | 3 | 4

const ACT_SPLASHES: Record<Exclude<VisualAct, 0>, { roman: string; title: string; subtitle: string }> = {
  1: { roman: 'I', title: 'Ver lo oculto', subtitle: 'El problema' },
  2: { roman: 'II', title: 'Girar la sección', subtitle: 'La idea' },
  3: { roman: 'III', title: 'Aplicar la norma', subtitle: 'El método' },
  4: { roman: 'IV', title: 'Llevarlo a la pieza', subtitle: 'La prueba' },
}

function MarqueeStrip() {
  const items = [...MARQUEE_TERMS, ...MARQUEE_TERMS]
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {items.map((t, i) => (
          <span key={i}>
            {t} <em>·</em>
          </span>
        ))}
      </div>
    </div>
  )
}

/** Un solo corte horizontal: una hoja cruza el título y las mitades se separan y vuelven. */
function CutTitle() {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const top = el.querySelector('.cut-top')
    const bot = el.querySelector('.cut-bot')
    const blade = el.querySelector('.cut-blade')
    if (!top || !bot || !blade) return

    gsap.set(blade, { scaleX: 0, transformOrigin: '0% 50%', opacity: 1 })
    gsap.set([top, bot], { y: 0 })

    const tl = gsap.timeline({ delay: 1.2 })
    // la hoja cruza
    tl.to(blade, { scaleX: 1, duration: 0.5, ease: 'power3.inOut' })
    // las mitades se separan
    tl.to(top, { y: -10, duration: 0.5, ease: 'power3.out' }, 0.45)
    tl.to(bot, { y: 10, duration: 0.5, ease: 'power3.out' }, 0.45)
    tl.to(blade, { opacity: 0, duration: 0.35 }, 0.7)
    // y vuelven a su sitio
    tl.to([top, bot], { y: 0, duration: 0.7, ease: 'power3.inOut' }, 2.0)
    tl.set(blade, { scaleX: 0, opacity: 1 }, 2.8)

    return () => {
      tl.kill()
    }
  }, [])

  const title = (
    <>
      Corte <em>girado</em>
      {'\n'}o abatido
    </>
  )

  return (
    <h1 className="cut-title anim-item" ref={ref} aria-label="Corte girado o abatido">
      <span className="cut-top" aria-hidden>
        {title}
      </span>
      <span className="cut-bot" aria-hidden>
        {title}
      </span>
      <span className="cut-blade" aria-hidden />
    </h1>
  )
}

/** Visual chapter (0=portada, 1..4) for the 14-slide deck.
    Act II opens with the bridge slide (isométrico → PV/PH/PL). */
function actForIndex(i: number): VisualAct {
  if (i === 0) return 0
  if (i <= 2) return 1
  if (i <= 6) return 2
  if (i <= 10) return 3
  return 4
}

/** Slide-enter animation for text blocks; figures run one explanatory build. */
function animateSlideIn(el: HTMLElement) {
  const items = el.querySelectorAll('.anim-item')

  if (prefersReducedMotion()) {
    gsap.set(items, { clearProps: 'all', autoAlpha: 1 })
    return
  }

  gsap.fromTo(
    items,
    { y: 30, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.09, ease: 'power3.out', delay: 0.15, overwrite: true },
  )
}

export function Presentation({ onOpenFullscreenDemo }: PresentationProps) {
  const [index, setIndex] = useState(0)
  const [notesOpen, setNotesOpen] = useState(false)
  const [actSplash, setActSplash] = useState<Exclude<VisualAct, 0> | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const animating = useRef(false)
  const actSplashTimer = useRef<number | null>(null)

  const goTo = useCallback(
    (next: number) => {
      if (animating.current) return
      const clamped = Math.max(0, Math.min(slides.length - 1, next))
      if (clamped === index) return

      const nextAct = actForIndex(clamped)
      if (nextAct !== actForIndex(index) && nextAct !== 0) {
        if (actSplashTimer.current !== null) window.clearTimeout(actSplashTimer.current)
        setActSplash(nextAct)
        actSplashTimer.current = window.setTimeout(() => setActSplash(null), 1320)
      }

      const stage = stageRef.current
      if (!stage) {
        setIndex(clamped)
        return
      }

      const currentEl = stage.querySelector<HTMLElement>(`.slide[data-i="${index}"]`)
      const nextEl = stage.querySelector<HTMLElement>(`.slide[data-i="${clamped}"]`)
      if (!currentEl || !nextEl) {
        setIndex(clamped)
        return
      }

      if (prefersReducedMotion()) {
        currentEl.classList.remove('is-active')
        nextEl.classList.add('is-active')
        setIndex(clamped)
        animateSlideIn(nextEl)
        return
      }

      animating.current = true
      const dir = clamped > index ? 1 : -1

      // dramatic wipe reveal
      gsap.set(nextEl, {
        autoAlpha: 1,
        clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)',
      })
      nextEl.classList.add('is-active')

      const tl = gsap.timeline({
        onComplete: () => {
          currentEl.classList.remove('is-active')
          gsap.set(currentEl, { clearProps: 'all' })
          gsap.set(nextEl, { clearProps: 'clipPath,transform' })
          setIndex(clamped)
          animating.current = false
        },
      })

      tl.to(currentEl, { autoAlpha: 0, x: -46 * dir, duration: 0.45, ease: 'power2.in' }, 0)
      tl.to(nextEl, { clipPath: 'inset(0 0% 0 0%)', duration: 0.7, ease: 'power3.inOut' }, 0.08)

      animateSlideIn(nextEl)
    },
    [index],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        goTo(index + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        goTo(index - 1)
      } else if (e.key === 'n' || e.key === 'N') {
        setNotesOpen((v) => !v)
      } else if (e.key === 'Home') {
        goTo(0)
      } else if (e.key === 'End') {
        goTo(slides.length - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo, index])

  useEffect(() => {
    let touchX = 0
    const onStart = (e: TouchEvent) => {
      touchX = e.changedTouches[0]?.clientX ?? 0
    }
    const onEnd = (e: TouchEvent) => {
      const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX
      if (Math.abs(dx) > 50) goTo(index + (dx < 0 ? 1 : -1))
    }
    window.addEventListener('touchstart', onStart)
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
    }
  }, [goTo, index])

  useEffect(() => {
    const first = stageRef.current?.querySelector<HTMLElement>('.slide.is-active')
    if (first) animateSlideIn(first)
  }, [])

  useEffect(
    () => () => {
      if (actSplashTimer.current !== null) window.clearTimeout(actSplashTimer.current)
    },
    [],
  )

  const slide = slides[index]
  const progress = ((index + 1) / slides.length) * 100
  const act = actForIndex(index)

  return (
    <div className="app-shell" data-act={act}>
      <div className="glow-a" />
      <div className="glow-b" />
      <div className="grain" />
      <div className="sheet-frame" />
      <div className="progress" style={{ width: `${progress}%` }} />

      {actSplash !== null && (
        <div key={actSplash} className={`act-splash is-act-${actSplash}`} aria-hidden="true">
          <div className="act-splash-roman">{ACT_SPLASHES[actSplash].roman}</div>
          <span>ACTO {ACT_SPLASHES[actSplash].roman}</span>
          <strong>{ACT_SPLASHES[actSplash].title}</strong>
          <p>{ACT_SPLASHES[actSplash].subtitle}</p>
        </div>
      )}

      <div className="speaker-rail" aria-hidden>
        {slides.map((s, i) => (
          <span
            key={s.id}
            className={i === index ? 'is-on' : i < index ? 'is-past' : ''}
            title={s.title.replace(/\n/g, ' ')}
          />
        ))}
      </div>

      <div
        className="slide-stage"
        ref={stageRef}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button, a, input, summary, .canvas-frame')) return
          goTo(index + 1)
        }}
      >
        {slides.map((s, i) => (
          <section
            key={s.id}
            className={`slide ${i === index ? 'is-active' : ''}`}
            data-i={i}
            aria-hidden={i !== index}
          >
            <div className="slide-inner">
              {s.kind !== 'hero' && s.kind !== 'chapter' && (
                <div className="ghost-num" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </div>
              )}

              {s.kind === 'hero' && (
                <>
                  <div className="hero-layout">
                    <div className="hero-copy">
                      <p className="sheet-kicker anim-item">Un viaje al interior de las piezas</p>
                      <CutTitle />
                      {s.body?.map((p) => (
                        <p key={p} className="lead anim-item">
                          {p}
                        </p>
                      ))}
                      <p className="hero-strip anim-item">
                        <b>Luis Eduardo Carela</b> · 12-0869 &nbsp;&nbsp; <b>Arantza Naomi Cáceres</b> · 25-1576
                      </p>
                    </div>
                    <div className="hero-figure anim-item" aria-hidden>
                      <HeroArt active={i === index} />
                    </div>
                  </div>
                  <MarqueeStrip />
                </>
              )}

              {s.kind === 'chapter' && (
                <div className="chapter-wrap">
                  <div className="chapter-scan" aria-hidden />
                  <span className="chapter-num anim-item" aria-hidden>
                    {s.chapter}
                  </span>
                  <h1 className="anim-item">{s.title}</h1>
                  {s.body?.map((p) => (
                    <p key={p} className="lead anim-item">
                      {p}
                    </p>
                  ))}
                  <div className="chapter-rule anim-item" />
                  <div className="acts-track anim-item" aria-hidden>
                    {['I', 'II', 'III', 'IV'].map((r) => (
                      <span key={r} className={r === s.chapter ? 'is-here' : ''}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(s.kind === 'content' || !s.kind) && (
                <div className={`split-layout ${s.figure ? 'has-figure' : ''} ${REVERSED_FIGURE_SLIDES.has(s.id) ? 'is-reversed' : ''}`}>
                  <div>
                    {s.eyebrow && <p className="slide-eyebrow anim-item">{s.eyebrow}</p>}
                    <h2 className="anim-item">{s.title}</h2>
                    {s.body?.map((p) => (
                      <p key={p} className="lead anim-item">
                        {p}
                      </p>
                    ))}
                    {s.bullets && (
                      <ol className="nota-list">
                        {s.bullets.map((b, bi) => (
                          <li key={b} className="anim-item">
                            <span className="nota-n">N{bi + 1}</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                    {s.key && (
                      <p className="clave anim-item">
                        <b>Clave</b>
                        <span>{s.key}</span>
                      </p>
                    )}
                  </div>
                  {s.figure && (
                    <div className="split-figure anim-item">
                      <DiagramFigure id={s.figure} active={i === index} />
                    </div>
                  )}
                </div>
              )}

              {s.kind === 'compare' && (
                <>
                  {s.eyebrow && <p className="slide-eyebrow anim-item">{s.eyebrow}</p>}
                  <h2 className="anim-item">{s.title}</h2>
                  <div className="compare-grid compare-spectrum">
                    {(s.bullets ?? []).map((b, bi) => {
                      const [label, ...rest] = b.split(':')
                      const isOurs = label.trim() === 'Sección abatida'
                      return (
                        <div key={b} className={`compare-item anim-item ${isOurs ? 'is-hero' : ''}`}>
                          <span className="compare-index">0{bi + 1}</span>
                          {isOurs && <span className="compare-hero-label">TEMA ASIGNADO</span>}
                          <MiniIcon label={label.trim()} />
                          <div>
                            <strong>{label}</strong>
                            <p>{rest.join(':').trim()}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {s.key && (
                    <p className="clave anim-item">
                      <b>Clave</b>
                      <span>{s.key}</span>
                    </p>
                  )}
                </>
              )}

              {s.kind === 'demo' && (
                <>
                  <h2 className="anim-item demo-slide-title" style={{ marginBottom: '0.6rem' }}>
                    {s.title}
                  </h2>
                  <div className="anim-item">
                    <LightweightSectionDemo onOpen3D={onOpenFullscreenDemo} />
                  </div>
                </>
              )}

              {s.kind === 'exercise' && (
                <>
                  {s.eyebrow && <p className="slide-eyebrow anim-item">{s.eyebrow}</p>}
                  <h2 className="anim-item">{s.title}</h2>
                  <div className="exercise-layout">
                    <div>
                      <ol className="nota-list">
                        {(s.bullets ?? []).map((b, bi) => (
                          <li key={b} className="anim-item">
                            <span className="nota-n">N{bi + 1}</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="exercise-card anim-item">
                        <h3>Por qué este corte</h3>
                        <p>{exerciseWhy}</p>
                        <p className="exercise-link">
                          <a href="/print/plantilla-buje.svg" target="_blank" rel="noreferrer">
                            Plantilla imprimible →
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="split-figure anim-item">
                      <DiagramFigure id="ejercicio" active={i === index} />
                    </div>
                  </div>
                </>
              )}

              {s.kind === 'close' && (
                <div className="closing-wrap">
                  {s.eyebrow && <p className="slide-eyebrow anim-item">{s.eyebrow}</p>}
                  <h1 className="anim-item">
                    {s.title}
                  </h1>
                  <div className="closing-formula anim-item" aria-label="De oculto a visible y medible">
                    <span>OCULTO</span><i>→</i><span>VISIBLE</span><i>→</i><span>MEDIBLE</span>
                  </div>
                  {s.body?.map((p, bi) => (
                    <p key={p} className={`${bi === 0 ? 'lead' : 'closing-code'} anim-item`}>
                      {p}
                    </p>
                  ))}
                  <p className="closing-question anim-item">¿Preguntas?</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className={`notes-panel ${notesOpen ? 'is-open' : ''}`}>
        <strong>Notas del presentador · tecla N</strong>
        <p>{slide.note}</p>
      </div>

      <div className="chrome chrome-bottom">
        <div className="nav-cluster">
          <button type="button" className="tool-btn" onClick={() => goTo(index - 1)} disabled={index === 0}>
            ←
          </button>
          <button
            type="button"
            className="tool-btn"
            onClick={() => goTo(index + 1)}
            disabled={index === slides.length - 1}
          >
            →
          </button>
          <span className="nav-hints">
            <kbd>N</kbd> notas · <kbd>D</kbd> 3D opcional
          </span>
        </div>

        <div className="cajetin" aria-label="Cajetín de la lámina">
          <span>
            Tema
            <b>Corte girado o abatido</b>
          </span>
          <span>
            Lámina
            <b className="hl">
              {String(index + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
            </b>
          </span>
        </div>
      </div>
    </div>
  )
}
