export type Speaker = 1 | 2

export interface SlideContent {
  id: string
  speaker: Speaker
  title: string
  eyebrow?: string
  body?: string[]
  bullets?: string[]
  key?: string
  note: string
  figure?: string
  chapter?: string
  kind?: 'hero' | 'chapter' | 'content' | 'demo' | 'compare' | 'exercise' | 'close'
}

export const SPEAKER_LABELS: Record<Speaker, string> = {
  1: 'Luis Carela · 0–4 min',
  2: 'Arantza Cáceres · 4–8 min',
}

export const SPEAKER_NAMES: Record<Speaker, string> = {
  1: 'Luis Eduardo Carela',
  2: 'Arantza Naomi Cáceres',
}

export const slides: SlideContent[] = [
  /* ============ PORTADA ============ */
  {
    id: 'hero',
    speaker: 1,
    kind: 'hero',
    eyebrow: 'Portada',
    title: 'Corte girado\no abatido',
    body: [
      'Un viaje al interior de las piezas: cortar con un plano imaginario y girar la sección 90° hasta verla de frente.',
    ],
    note: 'Saluden con energía. Señalen el título: "miren la palabra girado: se corta por la mitad y la sección gira 90° hacia ustedes — eso es el tema de hoy". Anuncien el viaje: de dónde viene, qué es, cómo se usa.',
  },

  /* ============ PROBLEMA Y CONTEXTO ============ */
  {
    id: 'problema',
    speaker: 1,
    kind: 'content',
    figure: 'objetivo',
    eyebrow: 'Objetivo y utilidad',
    title: 'No se ve el interior',
    bullets: [
      'Por fuera, la pieza esconde agujeros y cavidades: líneas ocultas amontonadas.',
      'Objetivo: mostrar el interior como visible, en verdadera magnitud, listo para acotar.',
      'Utilidad: menos vistas, cero ambigüedad — el taller fabrica sin preguntar.',
    ],
    key: 'El corte convierte lo oculto en visible y medible.',
    note: '35 s. Este es el punto "objetivo y utilidad" de la rúbrica: decirlo con esas palabras. Empezar por el dolor: "¿cómo dibujas lo que no se ve?". Las líneas ocultas funcionan con 1 agujero, pero con varios el dibujo se vuelve ilegible. Cierre-puente: "resolver ese problema exigió un lenguaje común".',
  },
  {
    id: 'historia',
    speaker: 1,
    kind: 'content',
    figure: 'historia',
    eyebrow: 'Por qué existe la convención',
    title: 'Un lenguaje común',
    bullets: [
      '1795 · Monge formaliza cómo representar objetos 3D en un plano 2D.',
      '1850 · La industria exige dibujos precisos para fabricar en serie.',
      '1959 → 2022 · ISO/R 128 antecede a ISO 128-3:2022 para vistas, cortes y secciones.',
      'Hoy · CAD y BIM conservan la convención en piezas, vigas y edificios.',
    ],
    key: 'Leer un corte conecta el plano con la fabricación y la construcción.',
    note: '30 s. Timeline: Monge → industria → ISO/R 128:1959 como antecedente → ISO 128-3:2022 vigente → CAD/BIM. Una sola frase de obra: "una presa o una viga IPE se definen por su corte". Cierre-puente: "la regla que nos importa hoy es cortar y girar".',
  },

  /* ============ CONCEPTO Y DEFINICIÓN ============ */
  {
    id: 'idea',
    speaker: 1,
    kind: 'content',
    figure: 'idea',
    eyebrow: 'La idea',
    title: 'Cortar y girar 90°',
    bullets: [
      'Cuatro pasos en la figura: corta → de canto → gira 90° → de frente.',
    ],
    key: 'Se gira 90° para ver la sección en verdadera magnitud.',
    note: '30 s. Hablar mirando la animación, no las viñetas. Analogía: tubo o barra — de canto es una línea; al girar 90° aparece el perfil (en el buje, la corona). El rayado a 45° marca el material macizo. Cierre-puente: "ya entendemos el gesto; ahora pongámosle el nombre correcto".',
  },
  {
    id: 'definicion',
    speaker: 1,
    kind: 'content',
    figure: 'definicion',
    eyebrow: 'Definición',
    title: 'Corte no es lo mismo que sección',
    bullets: [
      'Sección abatida: perfil transversal girado 90° alrededor de la traza hasta quedar paralelo al plano de proyección y superpuesto en la vista.',
      'En el buje escalonado, el corte conserva el contorno de la brida que queda detrás; la sección muestra solo la corona tocada por el plano.',
    ],
    key: 'Sección = cara cortada. Corte = cara + fondo. Aquí gira la sección, no la pieza.',
    note: '45 s. Definición formal: el perfil gira 90° ALREDEDOR DE LA TRAZA hasta que su plano queda paralelo al plano de proyección. Después usar el buje escalonado: en CORTE aparece la corona rayada y también la brida posterior; en SECCIÓN queda solo la corona. No decir que la sección gira "en su propio plano". Puente: "¿cuándo vale la pena usarla?".',
  },

  /* ============ APLICACIÓN DE LA NORMA ============ */
  {
    id: 'cuando',
    speaker: 1,
    kind: 'content',
    figure: 'cuando',
    eyebrow: 'Cuándo usarlo',
    title: 'Piezas largas de perfil constante',
    bullets: [
      'Manijas, radios, brazos, nervios, perfiles.',
      'Cuando un corte total no aporta nada más.',
    ],
    key: 'Sin desplazar → contorno fino. Desplazada → contorno grueso.',
    note: '30 s. La chip Clave lleva la norma fina/gruesa — no la lean dos veces. Hablar ejemplos: mango de herramienta, radio de volante, ala de perfil. No re-explicar el "por qué 90°" (ya está en Idea; el demo lo integrará luego). Puente: "elegida la pieza, hay que indicar por dónde se corta".',
  },
  {
    id: 'plano',
    speaker: 1,
    kind: 'content',
    figure: 'plano',
    eyebrow: 'Plano de corte',
    title: 'La línea que ordena todo',
    bullets: [
      'Convención del curso: línea fina de trazo y punto, con extremos engrosados.',
      'Letras A–A y flechas perpendiculares, ambas en el mismo sentido.',
      'El observador está en la cola de las flechas; se retira la mitad que queda delante del plano.',
    ],
    key: 'La traza se marca en otra vista; las flechas indican desde dónde mirar.',
    note: '50 s. Esta lámina reúne plano de corte y dirección de observación. Primero: traza de trazo y punto, extremos gruesos y letras A–A. Segundo: las flechas son perpendiculares y apuntan igual. El observador está en la cola; se elimina mentalmente la mitad entre observador y plano. Handoff: "ya sabemos por dónde mirar; Arantza mostrará qué superficies se rayan".',
  },
  {
    id: 'rayado',
    speaker: 2,
    kind: 'content',
    figure: 'rayado',
    eyebrow: 'Rayado / achurado',
    title: 'Se raya solo lo que se corta',
    bullets: [
      'Líneas finas continuas, uniformes y normalmente a 45°.',
      'Misma pieza = mismo ángulo y separación.',
      'Nervios, radios y ejes no se rayan si el corte es longitudinal.',
    ],
    key: 'Se raya solo el material macizo; los huecos, nunca.',
    note: '40 s. Retomar: "ya marcamos por dónde cortar; ahora vemos qué tocó el plano". El rayado marca material macizo; los huecos NO se rayan. En conjuntos, cada pieza cambia el ángulo o el espaciado. Un nervio cortado transversalmente sí se raya. Puente: "con todas las reglas claras, veámoslas trabajar juntas".',
  },
  {
    id: 'demo',
    speaker: 2,
    kind: 'demo',
    eyebrow: 'Síntesis visual',
    title: 'Línea → forma real',
    body: ['Mismo buje del ejercicio: revelar el corte y abatir la sección 90°.'],
    note: 'Tope duro 1:00. Lea primero el código visual: naranja = plano de corte, cian = observación y sección, verde = cotas en mm. Paso 1: la abertura no revela el espesor interior. Paso 2: se retira la mitad frente al plano y la sección queda de canto. Paso 3: solo la sección gira 90° y aparece la corona rayada en verdadera magnitud: Ø55 exterior, Ø30 interior y pared (55 − 30) / 2 = 12.5 mm. Abrir el 3D únicamente si preguntan o sobra tiempo. Cierre-puente: "ahora comparemos este recurso con los demás".',
  },
  {
    id: 'diferencias',
    speaker: 2,
    kind: 'compare',
    eyebrow: 'Diferencias',
    title: 'Cortes y secciones no son equivalentes',
    bullets: [
      'Corte total: superficie cortada + fondo visible.',
      'Semicorte: mitad exterior + mitad en corte.',
      'Sección desplazada: perfil fuera de la vista.',
      'Sección abatida: perfil girado sobre la vista.',
      'Corte girado concurrente: alinea planos oblicuos.',
    ],
    key: 'Abatida: gira la sección. Concurrente: gira un plano oblicuo.',
    note: '35 s. No leer las tarjetas: responder tres preguntas con los iconos — qué muestra, dónde queda y cuándo se usa. La abatida gira SOLO la sección y la superpone sobre la vista. El corte girado concurrente es distinto: alinea un plano oblicuo para piezas con brazos en ángulo.',
  },

  /* ============ APLICACIÓN Y ENTREGA ============ */
  {
    id: 'aplicacion',
    speaker: 2,
    kind: 'content',
    figure: 'aplicacion',
    eyebrow: 'Aplicación',
    title: 'Un recurso, tres escalas',
    bullets: [
      'Mecánica: radios de volante, palancas, brazos.',
      'Constructiva: el corte revela el perfil I de la viga.',
      'Arquitectura: pasamanos, barandillas, montantes.',
    ],
    key: 'Cambia la pieza y la escala; el recurso es siempre el mismo abatido.',
    note: 'Solo nombrar las tres disciplinas (10–15 s). No repetir "pieza alargada" — eso ya está en Cuándo. Puente al ejercicio: "nuestra pieza es un buje".',
  },
  {
    id: 'ejercicio',
    speaker: 2,
    kind: 'exercise',
    eyebrow: 'Ejercicio gráfico',
    title: 'Ejercicio: el buje',
    bullets: [
      'Marca el plano A–A y las flechas sobre la vista exterior.',
      'Gira la sección 90° y déjala superpuesta con contorno fino.',
      'Raya solo la corona; rotula «Corte A–A» como pide la consigna.',
    ],
    note: 'Mostrar el dibujo físico. Leer SOLO la justificación del recuadro. No narrar la animación del SVG ni el checklist ítem por ítem (ya está en la figura/plantilla).',
  },
  {
    id: 'cierre',
    speaker: 2,
    kind: 'close',
    eyebrow: 'Cierre',
    title: 'De oculto\na medible',
    body: [
      'Un plano revela el interior. Un giro lo convierte en información fabricable.',
      'Corte A–A · giro 90° · verdadera magnitud',
    ],
    note: 'Cierre en 15 s: "lo que estaba oculto ahora es visible y medible". Abrir a preguntas; si sobra tiempo, repetir Abatir 90° en la demo.',
  },
]

export const exerciseWhy =
  'El buje tiene perfil constante. La sección abatida muestra la corona en verdadera magnitud sobre la propia vista y evita otra proyección. Técnicamente es una sección; se rotula «Corte A–A» para cumplir la consigna.'
