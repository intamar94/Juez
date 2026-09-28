// Catálogo de ideas de regalo.
//
// Cada idea es un TIPO de regalo, no un producto concreto: así no caduca, no depende de una
// tienda y el usuario busca la versión que mejor le encaje. Campos:
//   precio     [mín, máx] de referencia (en dólares) para una versión decente; la web solo
//              muestra el nivel ($, $$, $$$) porque cada país tiene su moneda
//   plazo      'hoy' (digital, experiencia o tienda cercana), 'dias' (envío 24–72 h),
//              'semana' (personalizado o hecho a mano)
//   tipo       'objeto' | 'consumible' | 'experiencia' | 'digital' | 'tiempo'
//   intereses  aficiones con las que encaja; vacío = encaja con cualquiera
//   edades     'nino' | 'joven' | 'adulto' | 'mayor'; ausente = todas menos niños
//   relaciones 'pareja' | 'familia' | 'amistad' | 'trabajo'; ausente = todas
//   categorias ids de CATEGORIAS donde aparece destacada
//   porque     por qué suele acertar (lo que se lee en la sección de la idea)
//   busqueda   lo que se escribe en el buscador de la tienda para comprarla

export const INTERESES = {
  cocina: '🍳 Cocina',
  cafe: '☕ Café y té',
  bebidas: '🍷 Vino y cerveza',
  deporte: '🏃 Deporte',
  naturaleza: '🥾 Montaña y aire libre',
  viajes: '✈️ Viajes',
  lectura: '📚 Lectura',
  musica: '🎧 Música',
  cine: '🎬 Cine y series',
  juegos: '🎲 Juegos de mesa',
  videojuegos: '🎮 Videojuegos',
  tecnologia: '💻 Tecnología',
  plantas: '🌱 Plantas y jardín',
  manualidades: '🎨 Arte y manualidades',
  bienestar: '🧖 Autocuidado',
  mascotas: '🐶 Mascotas',
  moda: '👟 Moda',
  foto: '📷 Fotografía',
};

export const CATEGORIAS = [
  {
    id: 'lo-tiene-todo', emoji: '🦄', color: 'violeta',
    nombre: 'Misión imposible',
    lema: 'Para quien lo tiene todo: cosas que se gastan, se viven o no se compraría.',
  },
  {
    id: 'ultima-hora', emoji: '🚨', color: 'rojo',
    nombre: 'Salvavidas de último minuto',
    lema: 'Lo tienes hoy mismo y nadie notará que fue a última hora.',
  },
  {
    id: 'mejora-diaria', emoji: '✨', color: 'ambar',
    nombre: 'Caprichos que nunca se compraría',
    lema: 'Lo que usa cada día, en la versión buena.',
  },
  {
    id: 'experiencias', emoji: '🎟️', color: 'azul',
    nombre: 'Menos cosas, más planes',
    lema: 'Un recuerdo compartido dura más que cualquier objeto.',
  },
  {
    id: 'con-historia', emoji: '🥹', color: 'rosa',
    nombre: 'Lagrimita garantizada',
    lema: 'Fotos, cartas y recuerdos compartidos.',
  },
  {
    id: 'su-obsesion', emoji: '🤓', color: 'naranja',
    nombre: 'Fan nivel experto',
    lema: 'Tiene una afición y quieres estar a la altura.',
  },
  {
    id: 'poco-dinero', emoji: '🪙', color: 'verde',
    nombre: 'Quedar bien gastando poco',
    lema: 'Detalles baratos que se nota que están pensados.',
  },
  {
    id: 'en-grupo', emoji: '🐷', color: 'turquesa',
    nombre: 'Entre todos',
    lema: 'Juntan el dinero y se lucen con algo grande.',
  },
  {
    id: 'compromiso', emoji: '🕵️', color: 'gris',
    nombre: 'Amigo secreto',
    lema: 'Colegas, parientes lejanos y casi desconocidos, sin riesgo.',
  },
  {
    id: 'peques', emoji: '🧸', color: 'cielo',
    nombre: 'Modo niños',
    lema: 'Para niños y niñas que ya tienen demasiados juguetes.',
  },
];

export const IDEAS = [
  // — Lo tiene todo / consumibles —
  {
    id: 'cesta-producto-local',
    nombre: 'Canasta de productos locales buenos',
    porque: 'Se come y desaparece: no ocupa sitio y casi nadie se compra el aceite o el queso caro para sí.',
    precio: [25, 70], plazo: 'dias', tipo: 'consumible',
    intereses: ['cocina', 'bebidas'], categorias: ['lo-tiene-todo', 'compromiso'],
    busqueda: 'canasta gourmet productos locales',
  },
  {
    id: 'cafe-especialidad',
    nombre: 'Suscripción de café de especialidad',
    porque: 'Un paquete distinto cada mes: el regalo se repite y se estrena cada vez.',
    precio: [20, 60], plazo: 'hoy', tipo: 'consumible',
    intereses: ['cafe'], categorias: ['lo-tiene-todo', 'su-obsesion'],
    busqueda: 'suscripción café de especialidad',
  },
  {
    id: 'caja-tes',
    nombre: 'Caja de tés para probar',
    porque: 'Variedad en poco espacio; ideal si ya tiene su té favorito y le gusta curiosear.',
    precio: [15, 35], plazo: 'dias', tipo: 'consumible',
    intereses: ['cafe', 'bienestar'], categorias: ['poco-dinero', 'compromiso'],
    busqueda: 'caja degustación tés',
  },
  {
    id: 'vino-nota',
    nombre: 'Botella especial con una nota tuya',
    porque: 'La botella se bebe; la nota (“para abrir cuando…”) es lo que se recuerda.',
    precio: [15, 50], plazo: 'hoy', tipo: 'consumible',
    intereses: ['bebidas'], edades: ['adulto', 'mayor'], categorias: ['ultima-hora', 'lo-tiene-todo'],
    busqueda: 'vino especial regalo',
  },
  {
    id: 'especias',
    nombre: 'Kit de especias o salsas del mundo',
    porque: 'A quien cocina le da juego durante meses y es difícil que ya lo tenga igual.',
    precio: [15, 40], plazo: 'dias', tipo: 'consumible',
    intereses: ['cocina'], categorias: ['poco-dinero', 'su-obsesion'],
    busqueda: 'kit especias del mundo',
  },
  {
    id: 'cosmetica-buena',
    nombre: 'Jabón, crema o aceite de los buenos',
    porque: 'Convierte un gesto diario en un pequeño lujo y se gasta: no se acumula.',
    precio: [15, 45], plazo: 'hoy', tipo: 'consumible',
    intereses: ['bienestar'], categorias: ['lo-tiene-todo', 'mejora-diaria', 'compromiso'],
    busqueda: 'jabón artesanal crema natural regalo',
  },
  {
    id: 'flores-suscripcion',
    nombre: 'Flores frescas unos meses',
    porque: 'Cada entrega vuelve a recordar quién las regaló.',
    precio: [30, 90], plazo: 'hoy', tipo: 'consumible',
    intereses: ['plantas'], relaciones: ['pareja', 'familia', 'amistad'],
    categorias: ['lo-tiene-todo', 'ultima-hora'],
    busqueda: 'suscripción flores a domicilio',
  },

  // — Mejora diaria —
  {
    id: 'calcetines-buenos',
    nombre: 'Calcetines de lana merino',
    porque: 'Suena aburrido y es de lo más agradecido: se usan cada semana y nadie se los compra.',
    precio: [15, 30], plazo: 'dias', tipo: 'objeto',
    intereses: ['naturaleza', 'deporte'], categorias: ['mejora-diaria', 'poco-dinero'],
    busqueda: 'calcetines lana merino',
  },
  {
    id: 'toalla-grande',
    nombre: 'Toalla de baño grande y gruesa',
    porque: 'Después de probar una “sábana de baño” las normales parecen servilletas.',
    precio: [25, 60], plazo: 'dias', tipo: 'objeto',
    intereses: ['bienestar'], edades: ['adulto', 'mayor'], categorias: ['mejora-diaria'],
    busqueda: 'toalla sábana de baño algodón gruesa',
  },
  {
    id: 'cuchillo-cocinero',
    nombre: 'Un buen cuchillo de cocinero',
    porque: 'Se usa a diario; si cocina con uno barato, notará la diferencia el primer día.',
    precio: [40, 120], plazo: 'dias', tipo: 'objeto',
    intereses: ['cocina'], edades: ['adulto', 'mayor'], categorias: ['mejora-diaria', 'su-obsesion'],
    busqueda: 'cuchillo cocinero acero calidad',
  },
  {
    id: 'botella-termo',
    nombre: 'Botella o termo que no gotea',
    porque: 'Se lleva a todas partes; una buena mantiene el café caliente toda la mañana.',
    precio: [20, 45], plazo: 'hoy', tipo: 'objeto',
    intereses: ['deporte', 'naturaleza', 'cafe', 'viajes'], edades: ['joven', 'adulto', 'mayor'],
    categorias: ['mejora-diaria', 'compromiso'],
    busqueda: 'termo acero inoxidable',
  },
  {
    id: 'auriculares',
    nombre: 'Auriculares con cancelación de ruido',
    porque: 'Cambian el transporte, la oficina y los viajes. Mejor si se juntan varios para comprarlos.',
    precio: [80, 350], plazo: 'dias', tipo: 'objeto',
    intereses: ['musica', 'viajes', 'tecnologia'], edades: ['joven', 'adulto'],
    categorias: ['mejora-diaria', 'en-grupo'],
    busqueda: 'auriculares cancelación de ruido',
  },
  {
    id: 'lector-ebook',
    nombre: 'Lector de libros electrónicos',
    porque: 'Para quien lee mucho y viaja: la biblioteca entera en el bolsillo.',
    precio: [100, 250], plazo: 'dias', tipo: 'objeto',
    intereses: ['lectura', 'viajes'], edades: ['joven', 'adulto', 'mayor'],
    categorias: ['en-grupo', 'su-obsesion'],
    busqueda: 'lector libros electrónicos',
  },
  {
    id: 'bateria-externa',
    nombre: 'Cargador portátil pequeño y rápido',
    porque: 'Útil para todo el mundo y difícil de fallar: siempre se acaba usando.',
    precio: [20, 50], plazo: 'hoy', tipo: 'objeto',
    intereses: ['tecnologia', 'viajes'], edades: ['joven', 'adulto'],
    categorias: ['compromiso', 'ultima-hora'],
    busqueda: 'power bank carga rápida',
  },
  {
    id: 'manta-buena',
    nombre: 'Manta de sofá de las que dan pena soltar',
    porque: 'Se usa cada noche de sofá y series; es el regalo que “no sabía que necesitaba”.',
    precio: [30, 80], plazo: 'dias', tipo: 'objeto',
    intereses: ['cine', 'lectura', 'bienestar'], categorias: ['mejora-diaria'],
    busqueda: 'manta sofá suave gruesa',
  },
  {
    id: 'mochila-buena',
    nombre: 'Mochila o bolso de diario resistente',
    porque: 'Si la suya está gastada, la va a usar a diario durante años.',
    precio: [40, 120], plazo: 'dias', tipo: 'objeto',
    intereses: ['viajes', 'moda', 'tecnologia'], edades: ['joven', 'adulto'],
    categorias: ['mejora-diaria', 'en-grupo'],
    busqueda: 'mochila resistente para laptop',
  },

  // — Experiencias —
  {
    id: 'entradas-concierto',
    nombre: 'Entradas para ver a su grupo o artista',
    porque: 'Es un plan con fecha: la ilusión dura desde que lo abre hasta el concierto.',
    precio: [30, 120], plazo: 'hoy', tipo: 'experiencia',
    intereses: ['musica'], edades: ['joven', 'adulto', 'mayor'],
    categorias: ['experiencias', 'su-obsesion', 'en-grupo'],
    busqueda: 'entradas conciertos',
  },
  {
    id: 'clase-cocina',
    nombre: 'Taller de cocina para dos',
    porque: 'Aprende algo, se lo pasa bien y, si vas con esa persona, es un recuerdo común.',
    precio: [40, 120], plazo: 'hoy', tipo: 'experiencia',
    intereses: ['cocina'], edades: ['joven', 'adulto', 'mayor'], relaciones: ['pareja', 'familia', 'amistad'],
    categorias: ['experiencias', 'lo-tiene-todo'],
    busqueda: 'taller de cocina para dos',
  },
  {
    id: 'taller-ceramica',
    nombre: 'Taller de cerámica o de manualidades',
    porque: 'Una tarde con las manos ocupadas y algo hecho por uno mismo para llevarse.',
    precio: [30, 80], plazo: 'hoy', tipo: 'experiencia',
    intereses: ['manualidades'], categorias: ['experiencias', 'su-obsesion'],
    busqueda: 'taller cerámica iniciación',
  },
  {
    id: 'degustacion',
    nombre: 'Degustación de vinos, cervezas o quesos',
    porque: 'Se aprende, se comparte y no queda nada en un cajón.',
    precio: [25, 70], plazo: 'hoy', tipo: 'experiencia',
    intereses: ['bebidas', 'cocina'], edades: ['adulto', 'mayor'],
    categorias: ['experiencias', 'lo-tiene-todo'],
    busqueda: 'degustación de vinos experiencia',
  },
  {
    id: 'spa-masaje',
    nombre: 'Circuito de spa o masaje',
    porque: 'Casi nadie se regala tiempo para sí; por eso se agradece tanto.',
    precio: [35, 120], plazo: 'hoy', tipo: 'experiencia',
    intereses: ['bienestar'], edades: ['adulto', 'mayor'],
    categorias: ['experiencias', 'lo-tiene-todo', 'ultima-hora', 'en-grupo'],
    busqueda: 'circuito spa masaje regalo',
  },
  {
    id: 'escape-room',
    nombre: 'Escape room con su grupo de amigos',
    porque: 'Plan de una hora que da para cenas y anécdotas durante meses.',
    precio: [60, 120], plazo: 'hoy', tipo: 'experiencia',
    intereses: ['juegos', 'videojuegos', 'cine'], edades: ['joven', 'adulto'], relaciones: ['amistad', 'pareja', 'familia'],
    categorias: ['experiencias', 'en-grupo'],
    busqueda: 'escape room reserva',
  },
  {
    id: 'escapada',
    nombre: 'Escapada de una noche',
    porque: 'El regalo estrella en pareja: tiempo juntos sin rutina.',
    precio: [90, 300], plazo: 'hoy', tipo: 'experiencia',
    intereses: ['viajes', 'naturaleza'], edades: ['adulto', 'mayor'], relaciones: ['pareja', 'familia'],
    categorias: ['experiencias', 'en-grupo'],
    busqueda: 'escapada fin de semana',
  },
  {
    id: 'ruta-guiada',
    nombre: 'Caminata guiada, kayak o rápel',
    porque: 'Para quien siempre dice “algún día hago eso”: le das la fecha.',
    precio: [30, 90], plazo: 'hoy', tipo: 'experiencia',
    intereses: ['naturaleza', 'deporte', 'viajes'], edades: ['joven', 'adulto'],
    categorias: ['experiencias', 'su-obsesion'],
    busqueda: 'actividad aventura kayak caminata guiada',
  },
  {
    id: 'teatro-cine',
    nombre: 'Entradas de teatro, musical o cine de estreno',
    porque: 'Plan fácil, con fecha y para compartir.',
    precio: [15, 80], plazo: 'hoy', tipo: 'experiencia',
    intereses: ['cine'], categorias: ['experiencias', 'ultima-hora'],
    busqueda: 'entradas teatro musical',
  },
  {
    id: 'clase-deporte',
    nombre: 'Paquete de clases (escalada, yoga, baile…)',
    porque: 'Le empuja a probar lo que tiene pendiente sin tener que pagar la matrícula.',
    precio: [30, 100], plazo: 'hoy', tipo: 'experiencia',
    intereses: ['deporte', 'bienestar'], edades: ['joven', 'adulto'],
    categorias: ['experiencias', 'su-obsesion', 'lo-tiene-todo'],
    busqueda: 'paquete clases escalada yoga regalo',
  },

  // — Con historia —
  {
    id: 'album-fotos',
    nombre: 'Álbum de fotos impreso de un año o un viaje',
    porque: 'Las fotos viven en el teléfono y nadie las mira. Impresas se vuelven a abrir durante años.',
    precio: [20, 60], plazo: 'semana', tipo: 'objeto',
    intereses: ['foto', 'viajes'], relaciones: ['pareja', 'familia', 'amistad'],
    categorias: ['con-historia'],
    busqueda: 'álbum fotos personalizado',
  },
  {
    id: 'carta-tarro',
    nombre: 'Tarro de notas o cartas “ábrelas cuando…”',
    porque: 'Cuesta poco dinero y mucho tiempo, y eso es justo lo que se nota.',
    precio: [0, 10], plazo: 'hoy', tipo: 'tiempo',
    intereses: [], relaciones: ['pareja', 'familia', 'amistad'],
    categorias: ['con-historia', 'poco-dinero', 'ultima-hora'],
    busqueda: 'tarro de cartas ábrelas cuando',
  },
  {
    id: 'libro-recetas-familia',
    nombre: 'Libro con las recetas de la familia',
    porque: 'Recoge lo que no está escrito en ningún sitio. Para abuelos es oro.',
    precio: [15, 40], plazo: 'semana', tipo: 'objeto',
    intereses: ['cocina'], relaciones: ['familia'],
    categorias: ['con-historia'],
    busqueda: 'libro de recetas personalizado imprimir',
  },
  {
    id: 'mapa-estrellas',
    nombre: 'Lámina del cielo o del mapa de un día especial',
    porque: 'Pone fecha y lugar a un momento importante (el día en que se conocieron, un nacimiento…).',
    precio: [20, 50], plazo: 'semana', tipo: 'objeto',
    intereses: ['viajes', 'manualidades'], relaciones: ['pareja', 'familia'],
    categorias: ['con-historia'],
    busqueda: 'lámina mapa estrellas fecha personalizada',
  },
  {
    id: 'video-mensajes',
    nombre: 'Vídeo con mensajes de sus amigos y familia',
    porque: 'Gratis y de lo que más emociona: se nota el esfuerzo de coordinar a todos.',
    precio: [0, 0], plazo: 'semana', tipo: 'tiempo',
    intereses: [], relaciones: ['pareja', 'familia', 'amistad'],
    categorias: ['con-historia', 'poco-dinero', 'en-grupo'],
    busqueda: 'montar vídeo sorpresa mensajes',
  },
  {
    id: 'cupones-tiempo',
    nombre: 'Cupones de tiempo (“una cena hecha por mí”, “cuido a los niños”)',
    porque: 'Para quien anda sin tiempo, regalarle una tarde libre es lo mejor.',
    precio: [0, 15], plazo: 'hoy', tipo: 'tiempo',
    intereses: [], relaciones: ['pareja', 'familia', 'amistad'],
    categorias: ['con-historia', 'poco-dinero', 'ultima-hora'],
    busqueda: 'cupones de regalo imprimibles',
  },

  // — Su obsesión —
  {
    id: 'juego-mesa',
    nombre: 'Un juego de mesa que aún no tenga',
    porque: 'Es un regalo y un plan a la vez. Pregunta en la tienda por uno para su grupo.',
    precio: [20, 60], plazo: 'dias', tipo: 'objeto',
    intereses: ['juegos'], edades: ['nino', 'joven', 'adulto', 'mayor'],
    categorias: ['su-obsesion', 'compromiso', 'peques'],
    busqueda: 'juego de mesa recomendado',
  },
  {
    id: 'kit-cultivo',
    nombre: 'Planta bonita o kit para cultivar hongos o hierbas',
    porque: 'Algo vivo que cuidar; se ve crecer y recuerda quién lo dio.',
    precio: [15, 40], plazo: 'dias', tipo: 'objeto',
    intereses: ['plantas', 'cocina'], categorias: ['su-obsesion', 'poco-dinero'],
    busqueda: 'kit cultivo hongos hierbas aromáticas',
  },
  {
    id: 'material-arte',
    nombre: 'Material de calidad para su afición artística',
    porque: 'Quien pinta o dibuja suele ahorrar en material; la versión buena se nota.',
    precio: [20, 80], plazo: 'dias', tipo: 'objeto',
    intereses: ['manualidades'], edades: ['nino', 'joven', 'adulto', 'mayor'],
    categorias: ['su-obsesion', 'mejora-diaria'],
    busqueda: 'acuarelas rotuladores calidad profesional',
  },
  {
    id: 'libro-autor',
    nombre: 'El último libro de su autor favorito (firmado si se puede)',
    porque: 'Aciertas seguro si miras antes qué ha leído; firmado, se convierte en recuerdo.',
    precio: [15, 30], plazo: 'hoy', tipo: 'objeto',
    intereses: ['lectura'], edades: ['nino', 'joven', 'adulto', 'mayor'],
    categorias: ['su-obsesion', 'poco-dinero', 'ultima-hora'],
    busqueda: 'novedades libros',
  },
  {
    id: 'vinilo',
    nombre: 'Vinilo de un disco que le marcó',
    porque: 'Aunque no tenga tocadiscos, se enmarca. Si lo tiene, mejor todavía.',
    precio: [25, 45], plazo: 'dias', tipo: 'objeto',
    intereses: ['musica'], edades: ['joven', 'adulto', 'mayor'],
    categorias: ['su-obsesion', 'con-historia'],
    busqueda: 'vinilo disco',
  },
  {
    id: 'accesorio-mascota',
    nombre: 'Retrato ilustrado de su mascota',
    porque: 'Quien tiene perro o gato lo trata como familia; esto le emociona siempre.',
    precio: [25, 70], plazo: 'semana', tipo: 'objeto',
    intereses: ['mascotas'], categorias: ['su-obsesion', 'con-historia'],
    busqueda: 'retrato ilustrado mascota personalizado',
  },
  {
    id: 'tarjeta-juego',
    nombre: 'Saldo para su tienda de videojuegos',
    porque: 'Nadie sabe qué juegos tiene: así elige y no hay riesgo de repetir.',
    precio: [15, 70], plazo: 'hoy', tipo: 'digital',
    intereses: ['videojuegos'], edades: ['nino', 'joven', 'adulto'],
    categorias: ['su-obsesion', 'ultima-hora'],
    busqueda: 'tarjeta de regalo videojuegos',
  },
  {
    id: 'revelado-foto',
    nombre: 'Correa, carrete o impresión de sus mejores fotos',
    porque: 'A quien le gusta la fotografía casi nunca imprime su trabajo.',
    precio: [15, 50], plazo: 'dias', tipo: 'objeto',
    intereses: ['foto'], categorias: ['su-obsesion'],
    busqueda: 'impresión fotográfica fine art',
  },
  {
    id: 'limpieza-calzado',
    nombre: 'Kit de limpieza para su calzado deportivo',
    porque: 'Para quien cuida sus sneakers como un tesoro: práctico, barato y muy específico.',
    precio: [15, 30], plazo: 'dias', tipo: 'consumible',
    intereses: ['moda', 'deporte'], edades: ['joven', 'adulto'],
    categorias: ['su-obsesion', 'poco-dinero'],
    busqueda: 'kit limpieza sneakers',
  },

  // — Digitales y suscripciones —
  {
    id: 'suscripcion-streaming',
    nombre: 'Unos meses de su plataforma de música o series',
    porque: 'Si comparte cuenta o usa la versión gratis, lo va a notar cada día.',
    precio: [15, 60], plazo: 'hoy', tipo: 'digital',
    intereses: ['musica', 'cine'], edades: ['joven', 'adulto', 'mayor'],
    categorias: ['ultima-hora', 'lo-tiene-todo'],
    busqueda: 'tarjeta de regalo suscripción música series',
  },
  {
    id: 'curso-online',
    nombre: 'Curso de algo que siempre quiso aprender',
    porque: 'Idiomas, guitarra, fotografía… le das el empujón que llevaba tiempo aplazando.',
    precio: [20, 120], plazo: 'hoy', tipo: 'digital',
    intereses: ['musica', 'foto', 'cocina', 'manualidades', 'tecnologia'], edades: ['joven', 'adulto', 'mayor'],
    categorias: ['ultima-hora', 'experiencias'],
    busqueda: 'curso online guitarra fotografía idiomas',
  },
  {
    id: 'audiolibros',
    nombre: 'Suscripción de audiolibros',
    porque: 'Para quien quiere leer y no encuentra el rato: se escucha manejando o caminando.',
    precio: [10, 60], plazo: 'hoy', tipo: 'digital',
    intereses: ['lectura', 'deporte'], edades: ['joven', 'adulto', 'mayor'],
    categorias: ['ultima-hora', 'lo-tiene-todo'],
    busqueda: 'suscripción audiolibros regalo',
  },

  // — Niños —
  {
    id: 'construccion',
    nombre: 'Juego de construcción',
    porque: 'Juego largo y abierto: sirve para muchas edades y se combina con lo que ya tiene.',
    precio: [20, 80], plazo: 'dias', tipo: 'objeto',
    intereses: ['juegos', 'manualidades', 'tecnologia'], edades: ['nino'],
    categorias: ['peques'],
    busqueda: 'juego construcción niños',
  },
  {
    id: 'experimentos',
    nombre: 'Kit de experimentos o de ciencia',
    porque: 'Una tarde entera de “¡mira lo que pasa!”, y aprende sin darse cuenta.',
    precio: [15, 40], plazo: 'dias', tipo: 'objeto',
    intereses: ['tecnologia', 'naturaleza', 'manualidades'], edades: ['nino'],
    categorias: ['peques', 'poco-dinero'],
    busqueda: 'kit experimentos ciencia niños',
  },
  {
    id: 'plan-nino',
    nombre: 'Una salida solo para él o ella',
    porque: 'Zoo, acuario, parque de atracciones… a los niños les llenan más los planes que los juguetes.',
    precio: [15, 60], plazo: 'hoy', tipo: 'experiencia',
    intereses: ['naturaleza', 'mascotas', 'deporte'], edades: ['nino'], relaciones: ['familia', 'amistad'],
    categorias: ['peques', 'ultima-hora'],
    busqueda: 'entradas zoo acuario parque niños',
  },
  {
    id: 'libro-infantil',
    nombre: 'Libro ilustrado o cómic para su edad',
    porque: 'Pide consejo en la librería por edad; es barato y lo va a releer mil veces.',
    precio: [10, 25], plazo: 'hoy', tipo: 'objeto',
    intereses: ['lectura', 'manualidades'], edades: ['nino'],
    categorias: ['peques', 'poco-dinero', 'ultima-hora'],
    busqueda: 'libro ilustrado infantil recomendado',
  },

  // — Compromiso —
  {
    id: 'tarjeta-local',
    nombre: 'Tarjeta de regalo de una tienda o restaurante que le guste',
    porque: 'No es frío si eliges tú el sitio: demuestra que sabes a dónde le gusta ir.',
    precio: [20, 80], plazo: 'hoy', tipo: 'digital',
    intereses: [], categorias: ['compromiso', 'ultima-hora', 'en-grupo'],
    busqueda: 'tarjeta de regalo restaurante',
  },
  {
    id: 'chocolate-bueno',
    nombre: 'Chocolate de calidad o dulces típicos de tu región',
    porque: 'Casi nadie dice que no, se comparte en la oficina y no hay que acertar la talla.',
    precio: [8, 25], plazo: 'hoy', tipo: 'consumible',
    intereses: ['cocina', 'cafe'], categorias: ['compromiso', 'poco-dinero', 'ultima-hora'],
    busqueda: 'chocolate artesanal caja regalo',
  },
  {
    id: 'planta-oficina',
    nombre: 'Planta pequeña que no se muere',
    porque: 'Para la mesa del trabajo: alegra y casi no pide cuidados.',
    precio: [8, 25], plazo: 'hoy', tipo: 'objeto',
    intereses: ['plantas'], categorias: ['compromiso', 'poco-dinero', 'ultima-hora'],
    busqueda: 'planta interior fácil cuidado',
  },

  {
    id:'kit-barista', nombre:'Kit para preparar café como un barista', porque:'Para quien convierte preparar café en un pequeño ritual y disfruta perfeccionando cada detalle.', precio:[25,90], plazo:'dias', tipo:'objeto', intereses:['cafe'], categorias:['su-obsesion','mejora-diaria'], busqueda:'kit barista café especialidad',
  },
  {
    id:'clase-cocina', nombre:'Clase de cocina de una especialidad', porque:'Añade técnica y experiencia sin regalar otro utensilio a una cocina ya equipada.', precio:[35,120], plazo:'hoy', tipo:'experiencia', intereses:['cocina'], categorias:['experiencias','su-obsesion'], busqueda:'clase cocina experiencia',
  },
  {
    id:'entrada-concierto', nombre:'Entrada para ver a un artista que le gusta', porque:'Si ya tiene suficientes cosas, un concierto crea un recuerdo que no ocupa espacio.', precio:[30,150], plazo:'hoy', tipo:'experiencia', intereses:['musica'], categorias:['experiencias','lo-tiene-todo'], busqueda:'entradas concierto música',
  },
  {
    id:'album-viajes', nombre:'Álbum de un viaje compartido', porque:'Reúne fotografías y pequeñas historias para transformar un viaje pasado en un objeto con significado.', precio:[20,70], plazo:'semana', tipo:'objeto', intereses:['viajes','foto'], relaciones:['pareja','familia','amistad'], categorias:['con-historia'], busqueda:'álbum fotos personalizado viaje',
  },
  {
    id:'mapa-recuerdos', nombre:'Mapa personalizado de lugares importantes', porque:'Marca dónde se conocieron, viajaron, vivieron o tuvieron momentos importantes.', precio:[20,80], plazo:'semana', tipo:'objeto', intereses:['viajes'], relaciones:['pareja','familia','amistad'], categorias:['con-historia','poco-dinero'], busqueda:'mapa personalizado lugares recuerdos',
  },
  {
    id:'carta-futuro', nombre:'Carta para abrir en una fecha futura', porque:'El valor está en lo que dices y en el momento elegido para volver a leerla.', precio:[0,15], plazo:'hoy', tipo:'tiempo', relaciones:['pareja','familia','amistad'], categorias:['con-historia','poco-dinero'], busqueda:'carta personalizada regalo',
  },
  {
    id:'recetario-familiar', nombre:'Recetario con las recetas de la familia', porque:'Conserva sabores, nombres e historias que normalmente solo existen en la memoria familiar.', precio:[10,60], plazo:'semana', tipo:'objeto', intereses:['cocina'], relaciones:['familia'], categorias:['con-historia'], busqueda:'recetario familiar personalizado',
  },
  {
    id:'entrevista-recuerdos', nombre:'Entrevista grabada sobre su vida y recuerdos', porque:'Para alguien mayor o con una historia especial, conservar sus recuerdos puede ser el verdadero regalo.', precio:[0,30], plazo:'hoy', tipo:'tiempo', relaciones:['familia'], categorias:['con-historia','poco-dinero'], busqueda:'entrevista recuerdos historia familiar',
  },
  {
    id:'kit-huerto', nombre:'Kit para cultivar algo en casa', porque:'Convierte el interés por las plantas en algo que puede cuidar, observar y cosechar.', precio:[20,70], plazo:'dias', tipo:'objeto', intereses:['plantas','naturaleza'], categorias:['su-obsesion','mejora-diaria'], busqueda:'kit huerto urbano cultivo',
  },
  {
    id:'experiencia-naturaleza', nombre:'Excursión o actividad en la naturaleza', porque:'Para alguien que disfruta salir, vivir algo juntos puede valer más que otro accesorio.', precio:[20,100], plazo:'hoy', tipo:'experiencia', intereses:['naturaleza','deporte'], categorias:['experiencias','lo-tiene-todo'], busqueda:'experiencia naturaleza senderismo',
  },
  {
    id:'clase-fotografia', nombre:'Taller de fotografía', porque:'Permite mejorar una afición que ya tiene en vez de regalarle simplemente otro accesorio.', precio:[30,150], plazo:'hoy', tipo:'experiencia', intereses:['foto'], categorias:['experiencias','su-obsesion'], busqueda:'taller fotografía curso',
  },
  {
    id:'impresion-foto', nombre:'Fotografía favorita impresa en gran formato', porque:'Una imagen importante cambia cuando deja de estar escondida en el teléfono.', precio:[15,60], plazo:'dias', tipo:'objeto', intereses:['foto'], relaciones:['pareja','familia','amistad'], categorias:['con-historia','mejora-diaria'], busqueda:'impresión fotografía gran formato',
  },
  {
    id:'kit-astronomia', nombre:'Experiencia o kit para observar el cielo', porque:'Para una persona curiosa, convierte una noche normal en una actividad para explorar y aprender.', precio:[25,150], plazo:'dias', tipo:'objeto', intereses:['naturaleza','tecnologia'], categorias:['su-obsesion','experiencias'], busqueda:'kit astronomía observación estrellas',
  },
  {
    id:'escape-room', nombre:'Escape room para compartir', porque:'Funciona especialmente bien para grupos y personas que disfrutan resolviendo problemas.', precio:[20,45], plazo:'hoy', tipo:'experiencia', intereses:['juegos'], relaciones:['pareja','familia','amistad'], categorias:['experiencias','en-grupo'], busqueda:'escape room entradas',
  },
  {
    id:'juego-cooperativo', nombre:'Juego de mesa cooperativo', porque:'En lugar de competir por ganar, todos tienen que resolver el mismo problema.', precio:[20,60], plazo:'dias', tipo:'objeto', intereses:['juegos'], categorias:['en-grupo','su-obsesion'], busqueda:'juego mesa cooperativo',
  },
  {
    id:'rompecabezas-personalizado', nombre:'Puzzle hecho con una fotografía', porque:'Combina una actividad tranquila con una imagen que tiene significado.', precio:[20,50], plazo:'semana', tipo:'objeto', intereses:['juegos','foto'], categorias:['con-historia','poco-dinero'], busqueda:'puzzle personalizado fotografía',
  },
  {
    id:'curso-online-profesional', nombre:'Curso para aprender una habilidad profesional nueva', porque:'Puede ser más útil que otro objeto cuando la persona disfruta aprendiendo o está cambiando de etapa.', precio:[15,150], plazo:'hoy', tipo:'digital', intereses:['tecnologia','foto','manualidades'], categorias:['ultima-hora','mejora-diaria'], busqueda:'curso online habilidad profesional',
  },
  {
    id:'libro-profesional', nombre:'Libro especializado de su profesión', porque:'Un buen libro de referencia puede resultar mucho más personal que un regalo genérico.', precio:[15,70], plazo:'dias', tipo:'objeto', intereses:['lectura','tecnologia','cocina','naturaleza'], categorias:['su-obsesion','mejora-diaria'], busqueda:'libro especializado profesional',
  },
  {
    id:'cuaderno-proyecto', nombre:'Cuaderno de calidad para sus proyectos', porque:'Para personas que siempre están planeando, diseñando, dibujando o construyendo cosas.', precio:[10,40], plazo:'dias', tipo:'objeto', intereses:['tecnologia','manualidades'], categorias:['mejora-diaria','poco-dinero'], busqueda:'cuaderno premium proyectos',
  },
  {
    id:'experiencia-aviacion', nombre:'Experiencia relacionada con aviación', porque:'Para un piloto o aficionado a volar, vivir algo distinto puede ser más interesante que otro accesorio.', precio:[40,250], plazo:'hoy', tipo:'experiencia', intereses:['viajes','tecnologia'], categorias:['experiencias','su-obsesion','lo-tiene-todo'], busqueda:'experiencia aviación vuelo simulador',
  },
  {
    id:'taller-bricolaje', nombre:'Taller práctico para aprender un oficio', porque:'Para quien disfruta arreglando cosas, aprender una técnica nueva puede ser mejor que acumular herramientas.', precio:[30,150], plazo:'hoy', tipo:'experiencia', intereses:['manualidades'], categorias:['experiencias','su-obsesion'], busqueda:'taller bricolaje carpintería',
  },
  {
    id:'video-mensajes', nombre:'Vídeo con mensajes de varias personas', porque:'Ideal cuando varias personas quieren regalar algo juntas aunque estén lejos.', precio:[0,30], plazo:'hoy', tipo:'digital', relaciones:['familia','amistad'], categorias:['con-historia','en-grupo','poco-dinero'], busqueda:'video felicitación personalizado',
  },
  {
    id:'cena-tematica', nombre:'Cena temática preparada en casa', porque:'Puedes construir la experiencia alrededor de un país, una película, un viaje o una época.', precio:[20,70], plazo:'hoy', tipo:'tiempo', intereses:['cocina','viajes','cine'], relaciones:['pareja','familia','amistad'], categorias:['experiencias','con-historia','poco-dinero'], busqueda:'cena temática en casa',
  },
  {
    id:'dia-sin-decisiones', nombre:'Un día organizado completamente para esa persona', porque:'Tú resuelves horarios, comida y actividades para que simplemente tenga que disfrutar.', precio:[20,150], plazo:'hoy', tipo:'tiempo', relaciones:['pareja','familia','amistad'], categorias:['experiencias','con-historia'], busqueda:'día experiencia sorpresa',
  },
  {
    id:'regalo-solidario', nombre:'Donación a una causa que le importe', porque:'Para alguien que no quiere objetos, el regalo puede representar algo en lo que realmente cree.', precio:[10,100], plazo:'hoy', tipo:'digital', categorias:['lo-tiene-todo','ultima-hora'], busqueda:'donación regalo causa',
  },
  {
    id:'apadrinamiento', nombre:'Apadrinamiento simbólico de un animal o proyecto', porque:'Es un regalo con continuidad para quien conecta más con una causa que con las cosas.', precio:[20,80], plazo:'hoy', tipo:'digital', intereses:['naturaleza','mascotas'], categorias:['lo-tiene-todo','su-obsesion'], busqueda:'apadrinamiento animal regalo',
  },
  {
    id:'retrato-mascota', nombre:'Ilustración personalizada de su mascota', porque:'Transforma una parte importante de su vida cotidiana en algo único.', precio:[20,100], plazo:'semana', tipo:'objeto', intereses:['mascotas','foto'], categorias:['con-historia'], busqueda:'retrato mascota personalizado',
  },
  {
    id:'experiencia-bienestar', nombre:'Experiencia de bienestar', porque:'Para alguien que necesita parar, reservar tiempo para sí mismo puede ser más útil que otro objeto.', precio:[30,150], plazo:'hoy', tipo:'experiencia', intereses:['bienestar'], categorias:['experiencias','lo-tiene-todo'], busqueda:'experiencia spa bienestar',
  },
  {
    id:'accesorio-viaje-util', nombre:'Accesorio de viaje que resuelve un problema concreto', porque:'El mejor regalo para quien viaja mucho puede ser quitarle una pequeña molestia.', precio:[15,70], plazo:'dias', tipo:'objeto', intereses:['viajes'], categorias:['mejora-diaria','su-obsesion'], busqueda:'accesorio viaje útil organizador',
  },
  {
    id:'guia-personalizada-viaje', nombre:'Guía personalizada para su próximo viaje', porque:'Puedes mezclar lugares que quiere visitar con recomendaciones que sabes que le gustan.', precio:[0,40], plazo:'hoy', tipo:'digital', intereses:['viajes','cocina','foto'], categorias:['con-historia','poco-dinero'], busqueda:'guía viaje personalizada',
  },
  {
    id:'capsula-tiempo', nombre:'Cápsula del tiempo para abrir dentro de un año', porque:'Convierte el presente en una promesa futura y funciona especialmente bien en etapas importantes.', precio:[5,30], plazo:'hoy', tipo:'tiempo', relaciones:['pareja','familia','amistad'], categorias:['con-historia','poco-dinero'], busqueda:'cápsula tiempo regalo',
  },
  {
    id:'kit-nuevo-trabajo', nombre:'Kit para empezar una nueva etapa laboral', porque:'Combina algo útil para el día a día con un mensaje que marque el comienzo de una etapa.', precio:[20,80], plazo:'dias', tipo:'objeto', relaciones:['familia','amistad','trabajo'], categorias:['mejora-diaria','con-historia'], busqueda:'kit nuevo trabajo regalo',
  },
  {
    id:'celebracion-graduacion', nombre:'Experiencia para celebrar una graduación', porque:'Después de meses de estudio, celebrar haciendo algo memorable puede tener más sentido que otro objeto.', precio:[30,150], plazo:'hoy', tipo:'experiencia', categorias:['experiencias','con-historia'], busqueda:'experiencia celebración graduación',
  },
  {
    id:'regalo-jubilacion-historia', nombre:'Libro de recuerdos de su vida laboral', porque:'Una jubilación permite convertir años de trabajo, compañeros y anécdotas en una historia que conservar.', precio:[15,80], plazo:'semana', tipo:'objeto', relaciones:['trabajo','familia'], categorias:['con-historia'], busqueda:'libro recuerdos jubilación personalizado',
  },
  {
    id:'amigo-secreto-comida', nombre:'Pequeño pack de su comida favorita', porque:'Para alguien que conoces poco, una preferencia concreta reduce mucho el riesgo de fallar.', precio:[10,30], plazo:'hoy', tipo:'consumible', intereses:['cocina','cafe','bebidas'], relaciones:['trabajo','amistad'], categorias:['compromiso','poco-dinero','ultima-hora'], busqueda:'pack gourmet regalo',
  },
  {
    id:'actividad-ninos-familia', nombre:'Actividad para hacer en familia', porque:'Para niños suele funcionar mejor regalar una historia que vivir juntos que sumar otro juguete.', precio:[15,80], plazo:'hoy', tipo:'experiencia', edades:['nino'], relaciones:['familia'], categorias:['peques','experiencias'], busqueda:'actividad familiar niños',
  },
  {
    id:'cuento-personalizado', nombre:'Cuento personalizado con la persona como protagonista', porque:'Es especialmente memorable para niños y también puede convertirse en un regalo familiar.', precio:[15,60], plazo:'semana', tipo:'objeto', edades:['nino','joven'], categorias:['peques','con-historia'], busqueda:'cuento personalizado nombre',
  },
];
