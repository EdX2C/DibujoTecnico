import { lazy, Suspense, useEffect, useState } from 'react'
import { Presentation } from './presentation/Presentation'

const DemoScene = lazy(() =>
  import('./scene/DemoScene').then((m) => ({ default: m.DemoScene })),
)

type Mode = 'presentation' | 'demo'

export default function App() {
  const [mode, setMode] = useState<Mode>('presentation')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        if ((e.target as HTMLElement)?.tagName === 'INPUT') return
        setMode((m) => (m === 'demo' ? 'presentation' : 'demo'))
      }
      if (e.key === 'Escape' && mode === 'demo') {
        setMode('presentation')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode])

  return (
    <>
      <Presentation onOpenFullscreenDemo={() => setMode('demo')} />
      {mode === 'demo' && (
        <div className="demo-modal-layer" role="dialog" aria-modal="true" aria-label="Exploración 3D de la varilla de control">
          <div className="app-shell">
            <div className="grain" />
            <div className="chrome chrome-top">
              <div className="badge">
                <span className="badge-dot" />
                Demo 3D · Varilla de control compuesta
              </div>
              <button type="button" className="tool-btn" onClick={() => setMode('presentation')}>
                ← Volver a presentación (Esc)
              </button>
            </div>
            <div style={{ height: '100%', paddingTop: '3.2rem' }}>
              <Suspense
                fallback={
                  <div className="canvas-frame demo-3d-loading" style={{ margin: '1rem', height: '80%' }}>
                    <strong>Preparando la vista 3D…</strong>
                    <span>Este modo se descarga solo cuando decides explorarlo.</span>
                  </div>
                }
              >
                <DemoScene />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
