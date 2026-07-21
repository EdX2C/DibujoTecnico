# Levantamiento: Redundancia en la presentación «Corte girado o abatido»

> Fecha: 2026-07-20 · Estado: aplicado (recorte ejecutado)

## 1. Pregunta / alcance

Qué está **redundante** en el deck (contenido, figuras, demo, guion) de forma que:
- consuma tiempo de los 8 minutos sin aportar cobertura de rúbrica, o
- diga lo mismo en dos o más sitios (lámina / figura / clave / nota / guion).

**Fuera de alcance:** calidad normativa ISO (ya evaluada), estilo visual, bugs de clipping 3D.

**Decisión que habilita:** qué cortar o fusionar antes del ensayo cronometrado, sin perder ítems de la consigna.

## 2. TL;DR

- El gesto **cortar → girar 90° → magnitud real** se enseña en ≥5 capas (hero, idea, demo, ejercicio, recap). Para 8 min basta **idea + demo**; el resto refuerza o sobra.
- Hay **código muerto**: figura `usos` registrada y nunca montada; `HeroScene.tsx` sin importadores; el guion aún agenda «Cortar para construir».
- **Key ≈ bullets** en `idea` y `definicion` (triple decir con la figura).
- `cuando` ↔ `aplicacion` ↔ `exerciseWhy` repiten «pieza alargada de perfil constante».
- Camino vivo sugerido: **saltar `recap`**, no narrar Concurrente ni el SVG del ejercicio, alinear guion con el deck.

## 3. Hallazgos

1. **Hallazgo:** El núcleo pedagógico (abatir 90°) se repite como tesis completa en hero, idea, definición, recap y cierre.
   - Evidencia: `src/content/slides.ts` — hero body (~L36), idea bullets/key (~L101–107), definicion bullet (~L129), recap (~L269–271), cierre (~L282).
   - Confianza: alta

2. **Hallazgo:** Tres animaciones enseñan el mismo movimiento espacial (plano → 90° → corona/óvalo): `HeroArt`, `IdeaFig`, `EjercicioFig`, más el demo 3D.
   - Evidencia: `Diagrams.tsx` HeroArt / IdeaFig / EjercicioFig; `DemoScene.tsx` modo Abatir; nota demo «mismo buje del ejercicio».
   - Confianza: alta

3. **Hallazgo:** Figura `usos` (`UsosFig`) está en el registry y **no tiene** `figure: 'usos'` en ninguna lámina (huérfana tras fusionar disciplina → historia).
   - Evidencia: registry en `Diagrams.tsx` clave `usos`; `slides.ts` solo usa historia/objetivo/idea/definicion/cuando/plano/flechas/rayado/aplicacion (+ ejercicio hardcodeado).
   - Confianza: alta

4. **Hallazgo:** `src/scene/HeroScene.tsx` existe y exporta la escena 3D de portada, pero Presentation usa solo `HeroArt` SVG; no hay importadores.
   - Evidencia: archivo presente; Presentation importa `HeroArt` de Diagrams.
   - Confianza: alta

5. **Hallazgo:** El guion de 8 min agenda una lámina «Cortar para construir» que ya no existe en el deck.
   - Evidencia: `public/print/guion-8min.md` fila ~1:05; README Acto I aún menciona el tema; contenido absorbido en nota de `historia`.
   - Confianza: alta

6. **Hallazgo:** En `idea` y `definicion`, la chip **Clave**, las viñetas y los rótulos de la figura dicen casi lo mismo.
   - Evidencia: idea key «Se gira 90°…» ≈ bullet 3; definicion key «Sección =… Corte =…» ≈ bullets 1–2 ≈ labels del isométrico.
   - Confianza: alta

7. **Hallazgo:** «Pieza alargada / perfil constante» aparece en `cuando`, `aplicacion` y `exerciseWhy`.
   - Evidencia: `slides.ts` cuando title/bullets; aplicacion bullets; `exerciseWhy`.
   - Confianza: alta

8. **Hallazgo:** `recap` («tres golpes») resume idea + plano + rayado + ejercicio; el guion salta de ejercicio a cierre y no le reserva tiempo.
   - Evidencia: lámina `recap` en `slides.ts`; `guion-8min.md` flujo ejercicio → cierre.
   - Confianza: alta

9. **Hallazgo:** Dualidad «sección abatida» vs «corte girado concurrente» se explica en nota de `definicion`, en `diferencias` y opcionalmente en el demo Concurrente.
   - Evidencia: notes en definicion/diferencias; botón Concurrente en DemoScene.
   - Confianza: media

10. **Hallazgo:** Acto III (plano / flechas / rayado) tiene buen solape figura↔viñeta (refuerzo útil para rúbrica), no es basura — pero sí es lento si se leen las viñetas en voz alta.
    - Evidencia: labels en PlanoFig/FlechasFig/RayadoFig vs bullets correspondientes.
    - Confianza: media

## 4. Restricciones y riesgos

- **Tiempo:** 19 láminas + demo en 8 min ≈ 25 s/lámina si se muestran todas; el desborde es el riesgo #1 de exposición.
- **Rúbrica:** no se puede borrar `problema`, `definicion`, plano/flechas/rayado, diferencias, aplicación ni ejercicio+justificación.
- **Nombre del tema:** «girado o abatido» obliga a no borrar del todo el concurrente del discurso, pero sí se puede aparcar del demo en vivo.
- **Solo lectura de este brief:** los arreglos visuales de láminas 06/08/17 se hicieron *antes* de este levantamiento; la limpieza de huérfanos (`usos`, `HeroScene`, guion) queda como próximo paso de ejecución.

## 5. Preguntas abiertas

- ¿El profesor evalúa el concurrente en el demo, o basta nombrarlo en `diferencias`?
- ¿Prefieren restaurar 30 s de «usos» (presa / IPE / detalle) o borrar `UsosFig` y dejar una frase en `historia`?
- ¿`recap` se mantiene como coro de 15 s o se quita del flujo vivo?

## 6. Próximo paso sugerido

Definir un **objetivo de recorte** (`goal`) con criterios verificables, p. ej.:
1. Eliminar o restaurar `usos` + alinear `guion-8min.md`.
2. Borrar `HeroScene.tsx` si no se vuelve a la portada 3D.
3. Ensayo cronometrado con path: hero → historia → problema → idea+demo → definición → cuando → plano+flechas → rayado → diferencias → aplicación → ejercicio → cierre (**sin recap**, Concurrente opcional).
4. Recortar viñetas de `idea`/`definicion` a favor de figura+clave.

## Fuentes

- Código: `src/content/slides.ts`, `src/presentation/Diagrams.tsx`, `src/presentation/Presentation.tsx`, `src/scene/DemoScene.tsx`, `src/scene/HeroScene.tsx`.
- Guion/docs: `public/print/guion-8min.md`, `README.md`.
- Audit paralelo: agente explore sobre el mismo repo (2026-07-20).
