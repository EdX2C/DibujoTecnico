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
    id: 'puente',
    speaker: 1,
    kind: 'content',
    figure: 'puente',
    eyebrow: 'Lo que ya dominan',
    title: 'Esto ya lo saben hacer',
    bullets: [
      'Del isométrico de un cilindro con agujero ya sacan las tres vistas: PV, PH y PL.',
      'Ninguna muestra el material cortado: el interior queda en líneas ocultas.',
    ],
    key: 'Hoy: lo que daría la PL, rayado y sin salir de la PV.',
    note: '30 s. Arrancar desde lo conocido: "esto ya lo hacen ustedes". Decir mirando la figura (no leer): PV y PH son rectángulos con el agujero en discontinuas; la PL son dos círculos. El gancho, cuando la PL se enciende en cian: "hoy vamos a conseguir exactamente esto, pero rayado y sin dibujar la PL aparte" — es lo que dice la Clave, no repetirla. No definir nada todavía. Puente: "veamos el gesto".',
  },
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
    key: 'El giro no crea la forma: cambia perpendicular (línea) por paralela (verdadera magnitud).',
    note: '30 s. Hablar mirando la animación, no las viñetas. Anclar en lo que la clase ya hace: al sacar las vistas de un isométrico ya deciden qué caras salen como una raya y cuáles con su forma real — la perpendicular al plano se proyecta como línea, la paralela en verdadera magnitud. De canto, la cara cortada es perpendicular: por eso es una raya. Girar 90° la apoya sobre el plano de la vista. NO decir que en isométrico "no se puede acotar" (falso: las medidas sobre los ejes sí son verdaderas; lo que se deforma es la forma). Cierre-puente: "ya entendemos el gesto; ahora pongámosle el nombre correcto".',
  },
  {
    id: 'definicion',
    speaker: 1,
    kind: 'content',
    figure: 'definicion',
    eyebrow: 'Definición',
    title: 'Corte no es lo mismo que sección',
    bullets: [
      'Sección abatida: la cara cortada, que está de canto, gira 90° alrededor de la traza del plano de corte.',
      'Tras el giro queda apoyada sobre el plano de la vista: por eso se dibuja superpuesta.',
      'En el buje escalonado: el corte conserva el contorno de la brida que queda detrás; la sección muestra solo la corona.',
    ],
    key: 'Sección = cara cortada. Corte = cara + fondo. Aquí gira la sección, no la pieza.',
    note: '45 s. Definición formal: la cara cortada gira 90° ALREDEDOR DE LA TRAZA hasta APOYARSE sobre el plano de la vista (coincidente, no solo paralela) — ahí deja de estar de canto y se ve en verdadera magnitud. Ojo: el contorno fino es prescripción de la norma, no algo que se deduzca del giro. Después usar el buje escalonado: en CORTE aparece la corona rayada y también la brida posterior; en SECCIÓN queda solo la corona. No decir que la sección gira "en su propio plano". Puente: "¿cuándo vale la pena usarla?".',
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
    key: 'Dentro de la PV → contorno fino. Fuera de la PV (lámina Diferencias) → grueso.',
    note: '30 s. La chip Clave lleva la norma fina/gruesa — no la lean dos veces. La "desplazada" se define en la lámina Diferencias; aquí basta decir "si se saca de la vista, cambia la regla". Hablar ejemplos: mango de herramienta, radio de volante, ala de perfil. No re-explicar el "por qué 90°" (ya está en Idea; el demo lo integrará luego). Puente: "elegida la pieza, hay que indicar por dónde se corta".',
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
    key: 'La traza A–A vive en la PV: una sola vista indica todo el corte.',
    note: '50 s. Esta lámina reúne plano de corte y dirección de observación. Primero: traza de trazo y punto, extremos gruesos y letras A–A, marcada sobre la PV. Segundo: las flechas son perpendiculares y apuntan igual — es la misma dirección de mirada con la que ya deciden si algo va en PH, PV o PL. El observador está en la cola; se elimina mentalmente la mitad entre observador y plano. Handoff: "ya sabemos por dónde mirar; Arantza mostrará qué superficies se rayan".',
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
    note: 'Tope duro 1:00. La leyenda de colores está en pantalla (abajo a la derecha): naranja = plano de corte, cian = observación y sección, verde = cotas en mm — señalarla, no recitarla. Paso 1: la abertura no revela el espesor interior. Paso 2: se retira la mitad frente al plano y la sección queda de canto. Paso 3: solo la sección gira 90° y aparece la corona rayada en verdadera magnitud: Ø40 exterior, Ø18 interior y pared (40 − 18) / 2 = 11 mm — las mismas cotas del dibujo físico. Abrir el 3D únicamente si preguntan o sobra tiempo. Cierre-puente: "ahora comparemos este recurso con los demás".',
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
      'Corte por planos concurrentes: alinea planos oblicuos.',
    ],
    key: 'Abatida: gira la sección. Concurrente: gira un plano oblicuo.',
    note: '35 s. No leer las tarjetas: responder tres preguntas con los iconos — qué muestra, dónde queda y cuándo se usa. La abatida gira SOLO la sección y la superpone sobre la vista. El corte por planos concurrentes es distinto: alinea un plano oblicuo para piezas con brazos en ángulo.',
  },

  /* ============ APLICACIÓN Y ENTREGA ============ */
  {
    id: 'aplicacion',
    speaker: 2,
    kind: 'content',
    figure: 'aplicacion',
    eyebrow: 'Segundo ejemplo · Mango ovalado',
    title: 'Una línea se convierte en óvalo',
    bullets: [
      'La vista lateral muestra el largo, pero no la forma real del agarre.',
      'A–A corta perpendicularmente el mango: la sección se ve de canto como una línea.',
      'Al girarla 90°, aparece el óvalo 26 × 38 mm sobre la misma vista.',
    ],
    key: 'No se mueve el mango: gira únicamente la sección A–A.',
    note: '25–30 s. Señalen tres momentos: línea de canto, giro de 90° y óvalo acotado. Frase de cierre: "la pieza no gira; solo abatimos la sección para verla en verdadera forma".',
  },
  {
    id: 'ejercicio',
    speaker: 2,
    kind: 'exercise',
    eyebrow: 'Ejercicio gráfico',
    title: 'Ejercicio: el buje',
    bullets: [
      'Marca el plano A–A y las flechas sobre la PV del buje (la de los 100 mm de largo).',
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
  'El buje tiene sección constante. De canto, la cara cortada solo daba una línea; abatida 90° queda apoyada sobre la misma PV y la corona se ve en verdadera magnitud, lista para acotar, sin dibujar la PL aparte. Técnicamente es una sección; se rotula «Corte A–A» para cumplir la consigna.'
