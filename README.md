# Corte girado / abatido — Presentación web + demo 3D

Presentación inmersiva (estilo GenSpark) y visualizador 3D para la exposición de dibujo técnico.

## Presentación publicada

[Abrir la presentación en Vercel](https://dibujo-tecnico.vercel.app)

## Arranque

```bash
npm install
npm run dev
```

Abre la URL que indique Vite (por defecto `http://localhost:5173`).

## Controles

| Tecla | Acción |
|---|---|
| `→` / `Espacio` | Siguiente diapositiva |
| `←` | Anterior |
| `N` | Notas del presentador |
| `D` | Alternar demo 3D a pantalla completa |
| `Esc` | Volver a la presentación (desde demo) |

En la demo: **Reveal corte**, **Abatir 90°**, **Planos concurrentes**, slider del plano A–A.

## Entregables incluidos

- Presentación condensada de 11 láminas (rúbrica completa; recorrido vivo de 8 min)
- Demo 3D de una varilla de control compuesta (tubo Ø30 · Ø24 · pared 3 mm) con sección de canto + abatimiento 90°
- Plantilla imprimible: [`public/print/plantilla-varilla-control.svg`](public/print/plantilla-varilla-control.svg)
- Pautas del dibujo: [`public/print/pautas-dibujo.md`](public/print/pautas-dibujo.md)
- Guion cronometrado: [`public/print/guion-8min.md`](public/print/guion-8min.md)

## Estructura (8 minutos, 3 actos)

- **Integrante 1 (0:00–3:10):** límite de las vistas, definición, regla de uso y plano A–A.
- **Integrante 2 (3:10–7:50):** rayado, demo ≤1:05, diferencias, tolerancia industrial, ejercicio y cierre.

## Checklist del ejercicio gráfico (varilla de control compuesta)

- [ ] Vista exterior con ojo, tubo central y horquilla
- [ ] Indicación del plano de corte A–A con extremos engrosados
- [ ] Dos flechas de dirección de observación, mismo sentido
- [ ] Letras A en ambos extremos
- [ ] Sección girada 90° (pared tubular rayada a 45°; el hueco limpio)
- [ ] Cotas Ø30, Ø24 y pared nominal e = 3 mm
- [ ] Identificación “Corte A–A”
- [ ] Explicación breve de por qué es adecuado

## Build de producción

```bash
npm run build
npm run preview
```
