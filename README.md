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

- Presentación de 14 láminas (rúbrica completa + puente isométrico → PV/PH/PL; recorrido vivo de ~8:20)
- Demo 3D del buje (casquillo alargado, Ø40 · Ø18 · 100 mm — la misma pieza del ejercicio) con revelar + abatir 90°
- Plantilla imprimible: [`public/print/plantilla-buje.svg`](public/print/plantilla-buje.svg)
- Pautas del dibujo: [`public/print/pautas-dibujo.md`](public/print/pautas-dibujo.md)
- Guion cronometrado: [`public/print/guion-8min.md`](public/print/guion-8min.md)

## Estructura (8 minutos, 4 actos)

- **Integrante 1 (0:00–4:30):** problema, contexto Monge → ISO 128 → BIM, puente isométrico → PV/PH/PL, giro 90°, definición, cuándo usarlo y plano A–A.
- **Integrante 2 (4:30–8:20):** rayado, demo ≤1:00 (3D opcional), diferencias, mango ovalado, ejercicio y cierre.

## Checklist del ejercicio gráfico (buje: cilindro con agujero pasante)

- [ ] Vista exterior del buje (rectángulo + agujero en líneas ocultas)
- [ ] Indicación del plano de corte A–A con extremos engrosados
- [ ] Dos flechas de dirección de observación, mismo sentido
- [ ] Letras A en ambos extremos
- [ ] Sección girada 90° (corona rayada a 45°; el agujero limpio)
- [ ] Identificación “Corte A–A”
- [ ] Explicación breve de por qué es adecuado

## Build de producción

```bash
npm run build
npm run preview
```
