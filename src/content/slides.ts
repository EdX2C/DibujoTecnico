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
  {
    id: 'hero',
    speaker: 1,
    kind: 'hero',
    eyebrow: 'Portada',
    title: 'Corte girado\no abatido',
    body: [
      'Las vistas muestran los extremos. A–A revela el perfil exacto donde importa.',
    ],
    note: '20 s. Abran con la pregunta: «Si el extremo de esta varilla es un ojo y el otro es una horquilla, ¿qué forma tiene el cuerpo en el centro?». No respondan todavía. El propósito es demostrar que las vistas conocidas no siempre describen el perfil local.',
  },
  {
    id: 'problema',
    speaker: 1,
    kind: 'content',
    figure: 'objetivo',
    eyebrow: 'El límite de las vistas',
    title: 'El extremo no describe el centro',
    bullets: [
      'La vista de perfil muestra el ojo o la horquilla, no la pared del tubo en A–A.',
      'Utilidad: evita deducciones y liga la forma al punto exacto A–A.',
      'Objetivo: leer el perfil exactamente donde trabaja la pieza.',
    ],
    key: 'La pregunta no es qué hay al final, sino qué sección existe en A–A.',
    note: '40 s. Partan de lo familiar: alzado y perfil. Señalen el ojo y la horquilla. Ambos extremos son visibles, pero ninguno permite deducir la pared del tubo central. Con líneas ocultas se insinuaría el hueco, pero no quedaría ligado de forma tan directa a la posición A–A.',
  },
  {
    id: 'idea',
    speaker: 1,
    kind: 'content',
    figure: 'idea',
    eyebrow: 'Definición',
    title: 'Solo gira la sección',
    bullets: [
      'A–A corta transversalmente la pieza.',
      'De canto, la sección se reduce a una línea.',
      'Al girarla 90°, aparece en verdadera magnitud sobre la misma vista.',
    ],
    key: 'Cambia de orientación, no de escala: la pieza permanece quieta.',
    note: '45 s. Este es el concepto central. Digan «sección», no «pieza cortada completa»: se toma únicamente el perfil que toca A–A. Primero está de canto y por eso parece una línea; luego se abate 90° alrededor de la traza hasta quedar paralelo al plano de proyección.',
  },
  {
    id: 'cuando',
    speaker: 1,
    kind: 'content',
    figure: 'cuando',
    eyebrow: 'Decisión de uso',
    title: 'Úsala para un perfil local',
    bullets: [
      'Sí: barras, brazos, radios y tubos largos cuyo perfil importa en un punto.',
      'Sí: cuando evita otra vista y conserva la sección ligada a su posición.',
      'No: si el perfil es complejo o tapa el dibujo; conviene una sección desplazada.',
    ],
    key: 'La sección abatida responde «¿qué forma tiene aquí?».',
    note: '40 s. Den la regla de decisión antes de la norma: perfil local, simple y fácil de leer sobre la propia vista. Si hay demasiados detalles, no se fuerza la superposición; se saca la sección fuera. La ventaja no es solo ahorrar espacio: mantiene el perfil unido al punto exacto donde fue medido.',
  },
  {
    id: 'plano',
    speaker: 1,
    kind: 'content',
    figure: 'plano',
    eyebrow: 'Plano de corte',
    title: 'A–A fija el lugar y la mirada',
    bullets: [
      'Convención del curso: línea fina de trazo y punto, con extremos engrosados.',
      'Letras A–A y flechas perpendiculares, ambas en el mismo sentido.',
      'La sección se obtiene en la posición de la traza y luego se gira 90°.',
    ],
    key: 'La traza responde dónde; las flechas responden desde dónde mirar.',
    note: '45 s. Eviten decir que aquí se retira media pieza: eso describe mejor un corte total. En una sección abatida interesa aislar la figura producida por A–A. Muestren la secuencia: traza, letras, flechas y giro. Handoff: Arantza explica cómo se distingue el material del hueco.',
  },
  {
    id: 'rayado',
    speaker: 2,
    kind: 'content',
    figure: 'rayado',
    eyebrow: 'Rayado / achurado',
    title: 'Material rayado; hueco limpio',
    bullets: [
      'Líneas finas continuas, uniformes y normalmente a 45°.',
      'Misma pieza = mismo ángulo y separación.',
      'El contorno superpuesto se dibuja fino para no dominar la vista.',
    ],
    key: 'Se raya solo el material tocado por A–A; los huecos, nunca.',
    note: '40 s. Señalen primero la corona rayada y después el hueco blanco. En la sección abatida superpuesta, el contorno es fino. Si la sección se desplaza fuera de la vista, su contorno puede dibujarse grueso. Esta distinción aparecerá otra vez en la comparación.',
  },
  {
    id: 'demo',
    speaker: 2,
    kind: 'demo',
    eyebrow: 'Síntesis visual',
    title: 'A–A revela el tubo central',
    body: ['Una misma pieza: leer las vistas, cortar en A–A y girar la sección 90°.'],
    note: 'Tope 1:05. Paso 1: el perfil describe el terminal, no el cuerpo central. Paso 2: A–A aísla la sección transversal; de canto se reduce a una línea. Paso 3: solo esa sección gira 90° y aparecen Ø30, Ø24 y pared nominal de 3 mm. Las cotas son didácticas, no pertenecen a una pieza aeronáutica certificada. Abran el 3D solo si sobra tiempo o durante preguntas.',
  },
  {
    id: 'diferencias',
    speaker: 2,
    kind: 'compare',
    eyebrow: 'Elegir el recurso correcto',
    title: 'Tres respuestas para tres preguntas',
    bullets: [
      'Corte total: muestra la cara cortada y el interior que queda detrás.',
      'Sección desplazada: saca el perfil fuera cuando superponerlo restaría claridad.',
      'Sección abatida: muestra un perfil local simple exactamente sobre su posición.',
    ],
    key: 'Total muestra interior; desplazada separa; abatida localiza.',
    note: '35 s. No lean las tarjetas. Compárenlas con tres verbos: «mostrar», «separar» y «localizar». La sección abatida no compite con todas las técnicas: resuelve específicamente la pregunta «qué perfil tiene la pieza aquí».',
  },
  {
    id: 'aplicacion',
    speaker: 2,
    kind: 'content',
    figure: 'aplicacion',
    eyebrow: 'Aplicación industrial · pieza didáctica',
    title: 'La tolerancia vive en A–A',
    bullets: [
      'La varilla transmite movimiento entre un terminal articulado y una horquilla.',
      'A–A controla Ø exterior, Ø interior y pared en el cuerpo tubular.',
      'Con ±0.05 mm, la pared admisible queda entre 2.95 y 3.05 mm.',
    ],
    key: 'Menos pared reduce sección resistente; más pared añade masa.',
    note: '50 s. Expliquen la consecuencia, no solo las cotas: el control local de la pared afecta resistencia y masa. Cálculo: e = (Ø exterior − Ø interior) / 2. Con Ø30 ±0.05 y Ø24 ±0.05, el peor caso produce 2.95 mm y el opuesto 3.05 mm. Subrayen que es un ejemplo didáctico, no una especificación aeronáutica real.',
  },
  {
    id: 'ejercicio',
    speaker: 2,
    kind: 'exercise',
    eyebrow: 'Ejercicio gráfico',
    title: 'Completa la varilla de control',
    bullets: [
      'Marca A–A y las flechas en el centro del cuerpo tubular.',
      'Gira la sección 90°; raya solo la pared y deja el hueco limpio.',
      'Acota Ø30, Ø24 y calcula e = 3 mm; rotula «Corte A–A».',
    ],
    note: '55 s. La respuesta visual debe contener vista exterior, traza A–A, dirección de observación, sección abatida, rayado, cotas e identificación. Lean solo la justificación. Técnicamente es una sección; se conserva «Corte A–A» porque así lo solicita la consigna del curso.',
  },
  {
    id: 'cierre',
    speaker: 2,
    kind: 'close',
    eyebrow: 'Regla de decisión',
    title: 'Cuando el extremo\nno basta',
    body: [
      'Si una pieza larga oculta su perfil local, corta en ese punto, gira la sección 90° y déjala en su lugar.',
      'A–A · sección local · verdadera magnitud',
    ],
    note: '15 s. Cierre exacto: «Cuando el extremo no basta, A–A responde qué forma tiene la pieza aquí». Luego: «cortar, girar 90° y leer en verdadera magnitud». Abran a preguntas.',
  },
]

export const exerciseWhy =
  'La vista de perfil describe los terminales, no el tubo central. A–A revela la pared justo donde se necesita y mantiene el perfil ligado a su posición; así evita otra proyección. Se rotula «Corte A–A» según la consigna.'
