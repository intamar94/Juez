// Red semántica local de Acierto.
// No es una lista cerrada de categorías: cada concepto puede conectar profesiones,
// aficiones, actividades, personalidad, contexto y oportunidades de regalo.
//
// El motor puede usar esta red sin ninguna API de pago. La IA podrá sustituir o ampliar
// la extracción más adelante, pero esta capa seguirá siendo la base estructural.

const n = (aliases = [], related = {}, opportunities = []) => ({ aliases, related, opportunities });

export const INTERESTS = {
  cocina:['cocina','cocinar','chef','receta','gastronomía','gastronomia','hornear','repostería','reposteria'],
  cafe:['café','cafe','barista','espresso','tostado'],
  bebidas:['vino','cerveza','whisky','ron','gin','coctel','cocktail','sommelier'],
  deporte:['fútbol','futbol','tenis','golf','correr','deporte','ciclismo','escalada','yoga','fitness','padel','surf','ski','esquí'],
  naturaleza:['montaña','montana','senderismo','naturaleza','campo','jardín','jardin','aire libre','camping','bosque','pesca'],
  viajes:['viaja','viajes','viajar','avión','avion','turismo','hotel','mochila','ruta','escapada'],
  lectura:['libro','leer','lectura','novela','poesía','poesia','cómic','comic','ensayo'],
  musica:['música','musica','concierto','guitarra','banda','piano','vinilo','cantante','instrumento'],
  cine:['cine','película','pelicula','series','netflix','filme'],
  juegos:['juego de mesa','juegos','ajedrez','cartas','puzzle','puzle','trivia'],
  videojuegos:['videojuego','gaming','playstation','xbox','nintendo','steam','gamer'],
  tecnologia:['tecnología','tecnologia','programador','programación','programacion','informatica','informática','computación','computacion','ordenador','pc','software','electrónica','electronica','gadget'],
  plantas:['plantas','jardín','jardin','botánica','botanica','huerto','cultivar'],
  manualidades:['arte','pinta','pintar','dibuj','cerámica','ceramica','manualidad','coser','bordar','tejer','crochet','madera','bricolaje'],
  bienestar:['spa','relaj','bienestar','cuidado','autocuidado','meditación','meditacion','yoga','calma'],
  mascotas:['perro','gato','mascota','caballo','animales'],
  moda:['moda','ropa','zapatos','sneaker','accesorios'],
  foto:['fotografía','fotografia','cámara','camara','foto'],
  historia:['historia','histórico','historico','civilización','civilizacion'],
  ciencia:['ciencia','científico','cientifica','laboratorio','experimento'],
  coches:['coche','coches','auto','automóvil','automovil','motor'],
  aviacion:['piloto','aviación','aviacion','avión','avion','aeropuerto','vuelo'],
  bricolaje:['bricolaje','diy','reparar','arreglar','construir'],
  pesca:['pesca','pescar','pescador','caña','anzuelo'],
  astronomia:['astronomía','astronomia','estrellas','universo','cosmos','telescopio'],
  idiomas:['idiomas','alemán','aleman','inglés','ingles','español','espanol','francés','frances','italiano','portugués','portugues'],
  baile:['baile','bailar','danza','salsa','bachata','tango'],
  coleccionismo:['coleccionismo','coleccionista','colecciona','sellos','monedas','figuras'],
  escritura:['escribir','escritura','autor','poeta','poesía','poesia','novela','cuento','guion','guión'],
  familia:['familia','madre','padre','abuelo','abuela','hijos'],
  juegosReto:['acertijos','puzles','puzzles','rompecabezas','trivia','enigmas'],
  sostenibilidad:['sostenibilidad','sostenible','ecología','ecologia','reciclaje','cero residuos','zero waste']
};

export const REL = {
  pareja:['pareja','novio','novia','esposo','esposa','marido','mujer','compañero sentimental','compañera sentimental'],
  familia:['madre','mamá','mama','padre','papá','papa','suegra','suegro','hermano','hermana','abuelo','abuela','hijo','hija','familia','tío','tia','primo','prima'],
  amistad:['amigo','amiga','mejor amigo','mejor amiga','colega cercano','compañero de aventuras'],
  trabajo:['jefe','jefa','compañero','compañera','colega','profesor','profesora','cliente','equipo','mentor','mentora']
};

export const OCC = {
  graduacion:['graduación','graduacion','grado','se gradúa','se gradua','doctorado','tesis','master','máster','fin de carrera'],
  cumpleanos:['cumpleaños','cumple','aniversario de nacimiento'],
  aniversario:['aniversario','años juntos','aniversario de pareja'],
  navidad:['navidad','reyes','nochebuena','fin de año'],
  jubilacion:['jubilación','jubilacion','se retira','retiro','pension'],
  nuevoTrabajo:['nuevo trabajo','nuevo puesto','ascenso','promoción','promocion','primer día','nuevo empleo','nuevo proyecto profesional'],
  mudanza:['mudanza','casa nueva','piso nuevo','se muda','hogar nuevo'],
  nacimiento:['bebé','bebe','nacimiento','embarazo','nuevo hijo','nueva hija'],
  despedida:['despedida','se va','dejar el trabajo','mudanza al extranjero','hasta pronto'],
  reunion:['reencuentro','reunión','reunion','volver a ver','familia reunida'],
  viajeEspecial:['gran viaje','viaje soñado','viaje especial','vacaciones','aventura juntos'],
  logro:['logro','meta cumplida','hito','proyecto terminado','lo consiguió','lo consiguio'],
  agradecimiento:['gracias','agradecimiento','para darle las gracias','detalle de agradecimiento'],
  sinMotivo:['porque sí','porque si','sin motivo','solo porque','por sorpresa']
};

export const PROFESSIONS = {
  arqueologia:['arqueólogo','arqueóloga','arqueologia','arqueología','excavación arqueológica','excavaciones'],
  antropologia:['antropólogo','antropóloga','antropologia','antropología'],
  historia:['historiador','historiadora','historia','historiografía','historiografia'],
  patrimonio:['patrimonio','conservador de patrimonio','patrimonio cultural'],
  museo:['museo','museólogo','museologa','museografía','museografia','comisario de exposiciones','curador'],
  arquitectura:['arquitecto','arquitecta','arquitectura','urbanismo','urbanista'],
  ingenieria:['ingeniero','ingeniera','ingeniería','ingenieria'],
  civil:['ingeniero civil','obra civil','construcción','construccion','estructuras'],
  mecanica:['mecánico','mecanica','mecánica','automoción','automocion','taller mecánico','taller mecanico'],
  electronica:['electrónica','electronica','electrónico','electronico','microcontrolador'],
  electricidad:['electricista','electricidad','instalador eléctrico','instalador electrico'],
  metalurgia:['metalúrgico','metalurgica','metalurgia','soldador','soldadura'],
  carpinteria:['carpintero','carpintera','carpintería','carpinteria','ebanista'],
  artesania:['artesano','artesana','artesanía','artesania','oficio artesanal'],
  aviacion:['piloto','pilota','aviación','aviacion','aeropuerto','vuelo','azafata','tripulante','controlador aéreo','controlador aereo'],
  marina:['marinero','marinera','náutica','nautica','capitán de barco','capitan de barco','barco','puerto'],
  medicina:['médico','medica','médica','medicina','cirujano','cirujana'],
  enfermeria:['enfermero','enfermera','enfermería','enfermeria'],
  odontologia:['dentista','odontólogo','odontologa','odontología','odontologia'],
  farmacia:['farmacéutico','farmaceutica','farmacia'],
  veterinaria:['veterinario','veterinaria','veterinaria clínica'],
  psicologia:['psicólogo','psicologa','psicología','psicologia'],
  biologia:['biólogo','biologa','bióloga','biologia','biología'],
  botanica:['botánico','botanica','botánica','botanico'],
  zoologia:['zoólogo','zoologia','zoología','zoologo'],
  geologia:['geólogo','geologa','geología','geologia','geociencias'],
  astronomia:['astrónomo','astronoma','astronomía','astronomia','astrofísica','astrofisica'],
  fisica:['físico','fisica','física','fisica de partículas','fisica teorica'],
  quimica:['químico','quimica','química','quimico','laboratorio químico','laboratorio quimico'],
  matematicas:['matemático','matematica','matemáticas','matematicas','estadística','estadistica'],
  informatica:['informático','informatica','informática','sistemas','sysadmin','administrador de sistemas'],
  programacion:['programador','programadora','desarrollador','desarrolladora','developer','software engineer','ingeniero de software'],
  ia:['inteligencia artificial','machine learning','aprendizaje automático','aprendizaje automatico','ai engineer','ml engineer'],
  datos:['científico de datos','cientifica de datos','data scientist','data analyst','analista de datos','big data'],
  ciberseguridad:['ciberseguridad','cybersecurity','hacker ético','hacker etico','pentester','seguridad informática','seguridad informatica'],
  redes:['redes','networking','ingeniero de redes','administrador de redes'],
  finanzas:['finanzas','financiero','financiera','contable','contador','contadora'],
  economia:['economista','economía','economia','microeconomía','macroeconomía','microeconomia','macroeconomia'],
  derecho:['abogado','abogada','derecho','jurista','notario','notaria'],
  marketing:['marketing','mercadotecnia','brand manager','publicidad'],
  ventas:['ventas','comercial','account manager','vendedor','vendedora'],
  rrhh:['recursos humanos','rrhh','reclutador','reclutadora','people manager'],
  educacion:['profesor','profesora','maestro','maestra','docente','educador','educadora'],
  linguistica:['lingüista','linguista','lingüística','linguistica','filólogo','filologa'],
  traduccion:['traductor','traductora','intérprete','interprete','traducción','traduccion'],
  periodismo:['periodista','periodismo','reportero','reportera','corresponsal'],
  escritura:['escritor','escritora','novelista','poeta','poetisa','guionista','autor'],
  arte:['artista','pintor','pintora','escultor','escultora','artes visuales'],
  diseno:['diseñador','diseñadora','diseño','design','ux','ui'],
  ilustracion:['ilustrador','ilustradora','ilustración','ilustracion'],
  fotografia:['fotógrafo','fotografo','fotógrafa','fotografia','fotografía'],
  cine:['director de cine','directora de cine','cineasta','montador','montadora','producción audiovisual'],
  musica:['músico','musica','músic','compositor','compositora','cantante','productor musical'],
  teatro:['actor','actriz','teatro','dramaturgo','dramaturga'],
  danza:['bailarín','bailarina','danza','coreógrafo','coreografa'],
  moda:['diseñador de moda','diseñadora de moda','moda','estilista','sastre','modista'],
  cocina:['chef','cocinero','cocinera','gastronomía','gastronomia','chef pastelero'],
  pasteleria:['pastelero','pastelera','repostero','repostera','panadero','panadera','repostería','reposteria'],
  cafe:['barista','café de especialidad','cafe de especialidad','tostador de café','tostador de cafe'],
  vino:['enólogo','enologa','vino','sommelier','viticultor','viticultora'],
  agricultura:['agricultor','agricultora','agronomo','agrónoma','agronomía','agronomia','cultivo'],
  paisajismo:['paisajista','paisajismo','jardinería profesional','jardineria profesional'],
  cuidadoAnimales:['adiestrador','adiestradora','cuidador de animales','cuidadora de animales'],
  docenciaInfantil:['educación infantil','educacion infantil','maestra infantil','maestro infantil'],
  trabajoSocial:['trabajador social','trabajadora social','trabajo social'],
  turismo:['guía turístico','guia turistico','turismo','agente de viajes','hostelería','hosteleria'],
  gastronomia:['gastrónomo','gastronoma','gastronomía','gastronomia'],
  arqueozoologia:['arqueozoología','arqueozoologia','zooarqueología','zooarqueologia'],
  conservacion:['conservador','conservadora','restaurador','restauradora','conservación','conservacion'],
  investigacion:['investigador','investigadora','investigación','investigacion','científico','cientifica']
};

export const PERSONALITY = {
  practico:['práctico','practica','práctica','util','útil','funcional','resuelve','no quiere adornos'],
  minimalista:['minimalista','sencillo','sencilla','simple','no acumula','odia el trasto','pocos objetos'],
  curioso:['curioso','curiosa','aprender','experimentos','investigar','preguntar','explorar ideas'],
  aventurero:['aventurero','aventurera','aventura','arriesgado','explorar','espontáneo','espontanea'],
  sentimental:['sentimental','emocional','recuerdo','recuerdos','nostalgia','historia juntos','le emociona'],
  creativo:['creativo','creativa','original','inventar','crear','manualidades','artístico','artistica'],
  foodie:['gourmet','foodie','comida','ingredientes','degustar','paladar'],
  analitico:['analítico','analitica','analítica','datos','detalles','lógica','logica','comparar'],
  tecnico:['técnico','tecnica','técnica','tech','preciso','precisa','ingenio'],
  social:['social','gente','amigos','fiesta','grupo','le encanta reunirse'],
  tranquilo:['tranquilo','tranquila','hogareño','hogareña','calma','casa'],
  espontaneo:['espontáneo','espontanea','improvisa','improvisar','sorpresas'],
  coleccionista:['colecciona','coleccionista','le gusta reunir','ediciones'],
  perfeccionista:['perfeccionista','detalle','calidad','acabado','meticuloso','meticulosa'],
  explorador:['explorador','exploradora','descubrir','nuevos lugares','curiosea'],
  autodidacta:['autodidacta','aprende solo','aprende sola','aprendizaje continuo'],
  nostalgico:['nostálgico','nostalgia','vintage','retro','recuerdos de infancia'],
  funcionalista:['funcionalista','útil antes que bonito','util antes que bonito'],
  romantico:['romántico','romantica','romántica','romantico','detalles de pareja'],
  bromista:['bromista','gracioso','graciosa','humor','bromas','risa']
};

export const SPECIAL = {
  todo:['no necesita nada','tiene de todo','ya tiene todo','tiene casi todo','difícil de regalar','dificil de regalar','es imposible regalarle','no quiere cosas','no necesita regalos','nada le hace falta'],
  personal:['personal','personalizado','hecho para','con su nombre','con nuestros recuerdos','sentimental','emocional','único para él','unico para el','único para ella','unico para ella'],
  unusual:['sorpresa','original','único','unico','raro','diferente','poco común','poco comun','inusual','fuera de lo típico','fuera de lo tipico','no quiero lo de siempre'],
  experience:['experiencia','plan','salida','viaje','concierto','entrada','reservar','hacer algo juntos','actividad'],
  urgent:['hoy','mañana','manana','última hora','ultima hora','lo necesito ya','para esta tarde','para esta noche'],
  cheap:['barato','barata','económico','economico','poco dinero','presupuesto bajo','menos de','hasta 20','hasta 30','gratis']
};

export const CONCEPTS = {
  arqueologia:n(['arqueología','arqueologia','arqueólogo','arqueologa','excavación','excavacion'],{
    historia:.90, patrimonio:.95, excavacion:.98, antropologia:.72, museo:.65, campo:.82, cartografia:.55, investigacion:.78, viajes:.42
  },['historia','patrimonio','excavacion','campo','mapa','museo','libro','experiencia','viaje','personalizado']),
  antropologia:n(['antropología','antropologia','antropólogo','antropologa'],{
    cultura:.92, historia:.72, sociedad:.75, etnografia:.90, investigacion:.78, museo:.62, viajes:.50
  },['cultura','historia','museo','libro','experiencia','viaje','personalizado']),
  historia:n(['historia','historiador','historiadora','histórico','historico','civilización','civilizacion','época','epoca'],{
    patrimonio:.78, museo:.70, cultura:.82, coleccionismo:.42, lectura:.55, viajes:.50, cartografia:.60
  },['historia','museo','libro','mapa','viaje','experiencia','coleccion']),
  patrimonio:n(['patrimonio','patrimonio cultural','patrimonio histórico','patrimonio historico'],{
    historia:.90, museo:.86, arquitectura:.48, cultura:.82, conservacion:.90
  },['historia','museo','arquitectura','libro','experiencia','personalizado']),
  museo:n(['museo','museología','museologia','exposición','exposicion','curaduría','curaduria'],{
    historia:.75, arte:.62, patrimonio:.88, cultura:.80, coleccionismo:.66
  },['museo','arte','historia','experiencia','libro','coleccion']),
  cultura:n(['cultura','culturas','tradición','tradicion','folclore','identidad cultural','identidad'],{
    historia:.72, antropologia:.72, patrimonio:.80, viajes:.52, gastronomia:.48
  },['historia','viaje','experiencia','libro','personalizado','gastronomia']),
  excavacion:n(['excavación','excavacion','excavar','yacimiento','yacimiento arqueológico','yacimiento arqueologico','campo'],{
    arqueologia:.98, geologia:.48, campo:.95, herramientas:.48, investigacion:.76
  },['campo','herramienta','cuaderno','experiencia','personalizado']),
  etnografia:n(['etnografía','etnografia','trabajo de campo antropológico','trabajo de campo antropologico'],{
    antropologia:.92, cultura:.88, campo:.86, investigacion:.76, fotografia:.50
  },['campo','libro','fotografia','viaje','experiencia','personalizado']),
  arquitectura:n(['arquitectura','arquitecto','arquitecta','edificio','urbanismo','diseño urbano','diseno urbano'],{
    diseno:.72, historia:.42, ciudad:.65, geometria:.38, patrimonio:.60, dibujo:.46
  },['diseño','mapa','libro','herramienta','experiencia','personalizado']),
  ingenieria:n(['ingeniería','ingenieria','ingeniero','ingeniera'],{
    tecnico:.82, matematica:.66, fisica:.62, tecnologia:.68, proyectos:.52, herramientas:.54
  },['herramienta','tecnologia','libro','curso','proyecto','experiencia']),
  mecanica:n(['mecánica','mecanica','mecánico','mecanico','automoción','automocion','taller'],{
    coches:.88, bricolaje:.65, herramientas:.88, tecnico:.76, proyectos:.55
  },['herramienta','taller','objeto_util','experiencia','proyecto','personalizado']),
  electricidad:n(['electricidad','electricista','instalación eléctrica','instalacion electrica'],{
    electronica:.58, herramientas:.90, bricolaje:.72, tecnico:.76, hogar:.42
  },['herramienta','taller','objeto_util','curso']),
  electronica:n(['electrónica','electronica','electrónico','electronico','arduino','microcontrolador'],{
    tecnologia:.82, programacion:.52, bricolaje:.64, tecnico:.82, proyectos:.72
  },['tecnologia','kit','proyecto','curso','herramienta']),
  carpinteria:n(['carpintería','carpinteria','carpintero','carpintera','ebanista','madera'],{
    bricolaje:.88, herramientas:.88, artesania:.74, proyectos:.70, hogar:.50
  },['herramienta','material','proyecto','taller','personalizado']),
  artesania:n(['artesanía','artesania','artesano','artesana','hecho a mano','oficio artesanal'],{
    manualidades:.88, creatividad:.78, materiales:.78, coleccionismo:.40
  },['artesanal','material','taller','personalizado','objeto_unico']),
  aviacion:n(['aviación','aviacion','piloto','aeropuerto','vuelo','aviones','avion'],{
    viajes:.70, tecnologia:.52, aventura:.48, cartografia:.45, fotografia:.38
  },['aviacion','viaje','experiencia','libro','objeto_util','personalizado']),
  marina:n(['náutica','nautica','marinero','marinera','barco','puerto','navegación marítima','navegacion maritima'],{
    viajes:.62, naturaleza:.55, aventura:.62, cartografia:.54, pesca:.45
  },['viaje','experiencia','mapa','naturaleza','objeto_util']),
  medicina:n(['medicina','médico','medico','médica','medica','cirujano','cirujana'],{
    ciencia:.72, investigacion:.65, precision:.66, bienestar:.48
  },['libro','curso','objeto_util','experiencia','personalizado']),
  enfermeria:n(['enfermería','enfermeria','enfermero','enfermera'],{
    medicina:.76, cuidado:.72, bienestar:.62, social:.42
  },['bienestar','objeto_util','experiencia','personalizado']),
  veterinaria:n(['veterinaria','veterinario','veterinaria clínica','animales'],{
    animales:.92, ciencia:.52, cuidado:.72
  },['mascota','naturaleza','experiencia','personalizado']),
  biologia:n(['biología','biologia','biólogo','biologo','bióloga','biologa'],{
    ciencia:.86, naturaleza:.78, investigacion:.76, ecologia:.68
  },['ciencia','naturaleza','libro','experiencia','proyecto']),
  botanica:n(['botánica','botanica','botánico','botanico','plantas'],{
    biologia:.74, plantas:.95, naturaleza:.78, ecologia:.62
  },['plantas','jardin','kit','libro','experiencia']),
  zoologia:n(['zoología','zoologia','zoólogo','zoologo'],{
    biologia:.82, animales:.95, naturaleza:.82
  },['animales','naturaleza','experiencia','libro']),
  geologia:n(['geología','geologia','geólogo','geologa','rocas','minerales'],{
    ciencia:.84, naturaleza:.72, campo:.72, coleccionismo:.55, cartografia:.48
  },['naturaleza','coleccion','campo','libro','experiencia','mapa']),
  astronomia:n(['astronomía','astronomia','astrónomo','astronoma','estrellas','universo','cosmos'],{
    ciencia:.84, fisica:.62, noche:.52, tecnologia:.42, curiosidad:.78
  },['astronomia','libro','experiencia','objeto','noche','personalizado']),
  fisica:n(['física','fisica','físico','fisico','partículas','particulas','relatividad','cuántica','cuantica'],{
    ciencia:.92, matematica:.70, astronomia:.58, tecnologia:.48
  },['ciencia','libro','curso','experiencia','objeto']),
  quimica:n(['química','quimica','químico','quimico','laboratorio'],{
    ciencia:.92, experimentacion:.82, investigacion:.76
  },['ciencia','kit','libro','curso','experiencia']),
  matematicas:n(['matemáticas','matematicas','matemático','matematico','estadística','estadistica'],{
    ciencia:.62, logica:.86, datos:.66, puzzles:.58
  },['libro','puzzle','curso','tecnologia']),
  programacion:n(['programación','programacion','programador','programadora','developer','desarrollador','desarrolladora','software'],{
    tecnologia:.94, informatica:.82, ia:.60, datos:.54, videojuegos:.42, proyectos:.72
  },['tecnologia','curso','libro','proyecto','objeto_util']),
  ia:n(['inteligencia artificial','machine learning','aprendizaje automático','aprendizaje automatico','ia','ai'],{
    programacion:.70, datos:.78, ciencia:.56, tecnologia:.92, curiosidad:.76
  },['tecnologia','curso','libro','proyecto','experiencia']),
  datos:n(['datos','data','data scientist','data analyst','científico de datos','cientifica de datos','big data'],{
    matematica:.66, programacion:.66, ia:.72, investigacion:.62
  },['tecnologia','curso','libro','proyecto']),
  ciberseguridad:n(['ciberseguridad','cybersecurity','pentester','seguridad informática','seguridad informatica','hacker ético','hacker etico'],{
    informatica:.78, tecnologia:.80, redes:.70, curiosidad:.55
  },['tecnologia','curso','libro','experiencia','objeto_util']),
  cocina:n(['cocina','cocinar','chef','receta','gastronomía','gastronomia','hornear','repostería','reposteria'],{
    gastronomia:.86, ingredientes:.72, cafe:.35, creatividad:.52
  },['cocina','consumible','taller','experiencia','libro','kit']),
  pasteleria:n(['pastelería','pasteleria','repostería','reposteria','panadería','panaderia','dulces'],{
    cocina:.86, creatividad:.58, ingredientes:.72
  },['cocina','consumible','taller','kit','experiencia']),
  cafe:n(['café','cafe','barista','espresso','tostado','tostador'],{
    cocina:.52, bebidas:.72, coleccionismo:.30
  },['cafe','consumible','experiencia','curso','kit']),
  vino:n(['vino','enología','enologia','sommelier','viticultura','cerveza','gin','whisky','ron','coctel','cocktail'],{
    bebidas:.96, gastronomia:.58, viajes:.30
  },['bebida','consumible','experiencia','curso']),
  lectura:n(['libro','leer','lectura','novela','poesía','poesia','cómic','comic','ensayo'],{
    escritura:.54, historia:.42, idiomas:.32, curiosidad:.50
  },['libro','suscripcion','experiencia','personalizado']),
  escritura:n(['escribir','escritura','autor','poeta','poesía','poesia','novela','cuento','guion','guión'],{
    lectura:.76, creatividad:.72, cine:.35
  },['libro','cuaderno','personalizado','curso']),
  musica:n(['música','musica','concierto','guitarra','banda','piano','vinilo','cantante','instrumento'],{
    creatividad:.62, cine:.28, coleccionismo:.42
  },['musica','concierto','experiencia','objeto','curso','personalizado']),
  fotografia:n(['fotografía','fotografia','cámara','camara','foto','fotógrafo','fotografo'],{
    arte:.62, viajes:.46, memoria:.50, tecnologia:.36
  },['foto','experiencia','curso','personalizado','objeto']),
  cine:n(['cine','película','pelicula','series','netflix','filme','director'],{
    musica:.28, escritura:.36, teatro:.40
  },['cine','experiencia','suscripcion','personalizado']),
  arte:n(['arte','pintar','pintura','dibujo','escultura','galería','galeria'],{
    creatividad:.84, manualidades:.72, museo:.44
  },['arte','material','taller','experiencia','personalizado']),
  diseno:n(['diseño','diseno','diseñador','diseñadora','ux','ui','tipografía','tipografia'],{
    creatividad:.78, tecnologia:.42, arte:.62
  },['diseño','curso','libro','personalizado','objeto']),
  manualidades:n(['manualidades','cerámica','ceramica','coser','bordar','tejer','crochet','knitting','papel'],{
    creatividad:.84, artesania:.82, bricolaje:.42
  },['material','taller','personalizado','objeto_unico']),
  bricolaje:n(['bricolaje','hazlo tú mismo','hazlo tu mismo','diy','arreglar','construir','reparar'],{
    herramientas:.88, proyectos:.82, tecnica:.62, hogar:.52
  },['herramienta','proyecto','taller','curso']),
  jardines:n(['jardín','jardin','huerto','cultivar','jardinería','jardineria','plantas'],{
    plantas:.96, naturaleza:.74, sostenibilidad:.48, cocina:.32
  },['plantas','kit','jardin','experiencia','libro']),
  mascotas:n(['perro','gato','mascota','caballo','animal de compañía','animal de compania'],{
    animales:.96, familia:.42, naturaleza:.38
  },['mascota','personalizado','experiencia','objeto_util']),
  viajes:n(['viaje','viajes','viajar','turismo','hotel','avión','avion','mochila','ruta','escapada'],{
    aventura:.62, fotografia:.38, cartografia:.48, cultura:.44
  },['viaje','experiencia','mapa','foto','objeto_util','personalizado']),
  naturaleza:n(['montaña','montana','senderismo','naturaleza','campo','aire libre','camping','bosque','lago'],{
    aventura:.66, deporte:.50, sostenibilidad:.46, pesca:.35
  },['naturaleza','experiencia','objeto_util','viaje']),
  deporte:n(['deporte','fútbol','futbol','tenis','golf','correr','ciclismo','escalada','yoga','fitness','padel','surf','ski','esquí'],{
    aventura:.45, bienestar:.60, outdoors:.54
  },['deporte','experiencia','objeto_util','curso']),
  pesca:n(['pesca','pescador','pescadora','caña','anzuelo','río','rio','pescar'],{
    naturaleza:.74, campo:.66, paciencia:.48
  },['pesca','naturaleza','experiencia','objeto_util','personalizado']),
  videojuegos:n(['videojuego','gaming','playstation','xbox','nintendo','steam','gamer'],{
    tecnologia:.60, juegos:.72, creatividad:.25
  },['videojuego','digital','experiencia','objeto']),
  juegos:n(['juego de mesa','juegos','ajedrez','cartas','puzle','puzzle','trivia'],{
    social:.55, logica:.62, familia:.30
  },['juego','experiencia','grupo','puzzle']),
  astronomiaAficion:n(['telescopio','observar estrellas','estrellas','constelaciones','stargazing'],{
    astronomia:.92, naturaleza:.40, curiosidad:.72
  },['astronomia','experiencia','libro','objeto']),
  idiomas:n(['idiomas','alemán','aleman','inglés','ingles','español','espanol','francés','frances','italiano','portugués','portugues'],{
    viajes:.46, lectura:.34, curiosidad:.56
  },['curso','libro','viaje','experiencia']),
  baile:n(['baile','bailar','danza','salsa','bachata','tango'],{
    musica:.66, deporte:.32, social:.48
  },['experiencia','curso','musica']),
  coleccionismo:n(['coleccionismo','coleccionista','colecciona','edición limitada','edicion limitada','figuras','sellos','monedas','vinilos'],{
    historia:.32, musica:.30, arte:.34
  },['coleccion','objeto_unico','experiencia']),
  sostenibilidad:n(['sostenibilidad','sostenible','ecología','ecologia','reciclaje','cero residuos','zero waste','medio ambiente'],{
    naturaleza:.78, agricultura:.45, consumo:.55
  },['sostenible','consumible','experiencia','objeto_util']),
  aventura:n(['aventura','aventurero','aventurera','explorar','exploración','exploracion','adrenalina'],{
    viajes:.68, naturaleza:.72, deporte:.58
  },['experiencia','viaje','deporte']),
  ciencia:n(['ciencia','científico','cientifica','laboratorio','investigación','investigacion','experimento'],{
    curiosidad:.74, investigacion:.86, tecnologia:.42
  },['ciencia','libro','curso','experiencia','kit']),
  tecnologia:n(['tecnología','tecnologia','ordenador','computadora','pc','software','electrónica','electronica','gadget'],{
    programacion:.60, electronica:.66, ia:.38, videojuegos:.32
  },['tecnologia','curso','objeto_util','digital']),
  investigacion:n(['investigación','investigacion','investigar','estudiar','tesis','paper','artículo científico','articulo cientifico'],{
    ciencia:.72, lectura:.48, curiosidad:.76
  },['libro','curso','cuaderno','experiencia','personalizado']),
  campo:n(['trabajo de campo','trabajo de campo','campo','expedición','expedicion','terreno','salida de campo'],{
    naturaleza:.72, arqueologia:.64, geologia:.60, biologia:.55
  },['campo','objeto_util','cuaderno','experiencia','viaje']),
  cartografia:n(['cartografía','cartografia','mapa','mapas','atlas','geografía','geografia','topografía','topografia'],{
    historia:.55, viajes:.54, arqueologia:.50, arquitectura:.35
  },['mapa','atlas','viaje','libro','personalizado']),
  sociedad:n(['sociedad','comunidad','personas','social'],{
    antropologia:.62, historia:.42, trabajoSocial:.58
  },['experiencia','grupo','personalizado']),
  cienciaExacta:n(['ciencias exactas','lógica','logica','razonamiento','teoría','teoria'],{
    matematicas:.78, fisica:.62, tecnologia:.46
  },['puzzle','libro','curso']),
  animales:n(['animales','fauna','perros','gatos','caballos','aves'],{
    naturaleza:.64, zoologia:.62, mascotas:.82
  },['mascota','experiencia','naturaleza','personalizado']),
  gastronomia:n(['gastronomía','gastronomia','comida','sabores','restaurante','cocina'],{
    cocina:.84, vino:.50, viajes:.35
  },['comida','experiencia','consumible','taller']),
  patrimonioNatural:n(['patrimonio natural','parque natural','reserva natural'],{
    naturaleza:.82, patrimonio:.74, viajes:.45
  },['naturaleza','experiencia','viaje','libro'])
};

// Conceptos puente reutilizables: conectan señales específicas con oportunidades generales.
Object.assign(CONCEPTS, {
  tecnico:n(['técnico','tecnico','preciso','precisa','ingenioso','ingeniosa'],{tecnologia:.60, herramientas:.65, proyectos:.60},['tecnologia','herramienta','proyecto']),
  matematica:n(['matemática','matematica','matemáticas','matematicas','números','numeros'],{logica:.86, ciencia:.55, datos:.62},['libro','curso','puzzle']),
  precision:n(['precisión','precision','exactitud','meticuloso','meticulosa'],{tecnico:.72, perfeccionista:.60},['herramienta','objeto_util','curso']),
  puzzles:n(['puzzle','puzle','rompecabezas','acertijo','acertijos','enigmas'],{logica:.82, juegos:.74},['puzzle','juego','experiencia']),
  geometria:n(['geometría','geometria','formas','espacio','volúmenes','volumenes'],{arquitectura:.42, matematica:.65, diseno:.50},['libro','puzzle','curso']),
  ciudad:n(['ciudad','urbano','urbana','urbanismo'],{arquitectura:.74, viajes:.40, patrimonio:.45},['mapa','experiencia','libro']),
  proyectos:n(['proyecto','proyectos','prototipo','prototipos','hacer algo'],{tecnologia:.42, bricolaje:.55, creatividad:.55},['proyecto','kit','curso','herramienta']),
  herramientas:n(['herramienta','herramientas','destornillador','taladro','llave','instrumentos de trabajo'],{bricolaje:.76, mecanica:.72, carpinteria:.70},['herramienta','objeto_util','taller']),
  hogar:n(['hogar','casa','piso','salón','salon','habitación','habitacion'],{familia:.42, bienestar:.35, jardines:.35},['hogar','objeto_util','personalizado']),
  materiales:n(['material','materiales','papel','arcilla','madera','tela','pintura'],{manualidades:.72, artesania:.70, arte:.60},['material','taller','personalizado']),
  creatividad:n(['creatividad','creativo','creativa','crear','inventar'],{arte:.60, escritura:.60, diseno:.64, manualidades:.58},['personalizado','taller','curso']),
  noche:n(['noche','nocturno','nocturna','cielo nocturno'],{astronomia:.70, naturaleza:.28},['astronomia','experiencia']),
  cuidado:n(['cuidado','cuidar','atender','ayudar'],{bienestar:.52, mascotas:.42, familia:.42},['bienestar','personalizado','experiencia']),
  animales:n(['animales','fauna','perros','gatos','caballos','aves'],{zoologia:.68, mascotas:.84, naturaleza:.62},['mascota','naturaleza','experiencia','personalizado']),
  logica:n(['lógica','logica','razonamiento','deducción','deduccion'],{matematicas:.70, puzzles:.82, juegos:.58},['puzzle','juego','libro']),
  outdoors:n(['aire libre','outdoor','outdoors','exterior'],{naturaleza:.82, aventura:.58, deporte:.45},['naturaleza','experiencia','viaje','objeto_util']),
  curiosidad:n(['curiosidad','curioso','curiosa','descubrir','preguntar'],{investigacion:.70, ciencia:.65, aventura:.42},['libro','curso','experiencia']),
  familia:n(['familia','padres','madre','padre','abuelo','abuela','hijos','hermanos'],{memoria:.66, social:.45},['familia','personalizado','experiencia']),
  consumo:n(['consumo','compras','comprar menos','consumo responsable'],{sostenibilidad:.66, minimalista:.50},['sostenible','consumible','experiencia']),
  trabajoSocial:n(['trabajo social','trabajador social','trabajadora social','comunidad'],{sociedad:.72, social:.60},['experiencia','grupo','personalizado']),
  estetica:n(['estética','estetica','bonito','bonita','elegante','bello','bella'],{arte:.58, diseno:.62, moda:.46},['diseño','personalizado','objeto']),
  memoria:n(['memoria','recuerdo','recuerdos','nostalgia','historia juntos'],{fotografia:.52, historia:.46, sentimental:.50},['memoria','foto','personalizado']),
  personalizado:n(['personalizado','personalizar','con su nombre','hecho para él','hecho para ella'],{memoria:.62, creatividad:.55},['personalizado','objeto_unico']),
  grupo:n(['grupo','amigos','familia','entre todos','para dos'],{social:.62, familia:.42},['grupo','experiencia']),
  suscripcion:n(['suscripción','suscripcion','mensual','cada mes'],{consumo:.40, digital:.62},['suscripcion','digital','consumible']),
  gratis:n(['gratis','sin gastar','cero euros','0 euros'],{},['tiempo','digital','personalizado']),
  tiempo:n(['tiempo','tiempo juntos','día libre','dia libre'],{experiencia:.58, memoria:.44},['tiempo','experiencia','personalizado']),
  digital:n(['digital','online','en línea','en linea','app','suscripción','suscripcion'],{tecnologia:.52, programacion:.30},['digital','curso','suscripcion'])
});


export const OPPORTUNITY_TERMS = {
  experiencia:['experiencia','taller','entradas','escape room','spa','degustación','degustacion','escapada','actividad','clase'],
  libro:['libro','lector','audiolibro','lectura','autor'],
  mapa:['mapa','atlas','lámina','lamina','cartografía','cartografia'],
  museo:['museo','exposición','exposicion','galería','galeria'],
  viaje:['viaje','escapada','ruta','turismo'],
  personalizado:['personalizado','personalizar','nombre','recuerdos','historia','carta','álbum','album','retrato'],
  memoria:['foto','álbum','album','carta','recuerdo','historia','video'],
  campo:['campo','kit','cuaderno','mochila','linterna'],
  herramienta:['herramienta','kit','taller','bricolaje'],
  tecnologia:['tecnología','tecnologia','gadget','ordenador','auriculares','software'],
  objeto_util:['útil','util','funcional','termo','mochila','cargador','accesorio'],
  consumible:['café','cafe','té','te','vino','queso','especias','comida','crema','flores'],
  aprendizaje:['curso','clase','taller','libro','aprender'],
  grupo:['grupo','amigos','familia','para dos','para todos'],
  ciencia:['ciencia','experimento','laboratorio','astronomía','astronomia'],
  arte:['arte','ilustración','ilustracion','pintura','cerámica','ceramica','dibujo'],
  coleccion:['colección','coleccion','edición','edicion','vinilo','monedas','figuras'],
  digital:['digital','suscripción','suscripcion','online','video','tarjeta'],
  hogar:['hogar','casa','jardín','jardin','cocina'],
  bienestar:['bienestar','spa','masaje','relajación','relajacion','autocuidado'],
  deporte:['deporte','correr','ciclismo','yoga','escalada','surf'],
  musica:['música','musica','concierto','vinilo','guitarra'],
  fotografia:['foto','fotografía','fotografia','cámara','camara'],
  cocina:['cocina','receta','chef','degustación','degustacion'],
  sostenible:['sostenible','local','reutilizable','reciclado','solidario'],
  objeto_unico:['único','unico','artesanal','hecho a mano','edición limitada','edicion limitada'],
  sorpresa:['sorpresa','inesperado','original','inusual'],
  tiempo:['tiempo','hecho por ti','cena hecha por mí','video de mensajes'],
  familia:['familia','padres','madre','padre','abuelo','abuela','hijos']
};

export function normalizeLocal(value){
  return String(value||'').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9ñü ]/gi,' ')
    .replace(/\s+/g,' ').trim();
}

function matchAlias(text, alias){
  const a=normalizeLocal(alias);
  if(!a)return false;
  if(a.length<=3){
    const padded=' '+text+' ';
    return padded.includes(' '+a+' ');
  }
  return text===a || text.includes(a);
}

export function conceptosDesdeTexto(text, groups = CONCEPTS){
  const t=normalizeLocal(text);
  return Object.entries(groups)
    .filter(([,node]) => node.aliases?.some(alias => matchAlias(t,alias)))
    .map(([id]) => id);
}

export function expandConceptos(detected, maxHops=2){
  const result = new Map();
  const queue = detected.map(id => ({id, weight:1, depth:0}));

  while(queue.length){
    const item=queue.shift();
    const prev=result.get(item.id)||0;
    if(item.weight<=prev || item.depth>maxHops)continue;
    result.set(item.id,item.weight);
    const node=CONCEPTS[item.id];
    if(!node || item.depth===maxHops)continue;
    for(const [next,edge] of Object.entries(node.related||{})){
      const w=item.weight*Number(edge||0)*(item.depth===0?.88:.55);
      if(w>=0.20)queue.push({id:next,weight:w,depth:item.depth+1});
    }
  }
  return [...result.entries()].sort((a,b)=>b[1]-a[1]);
}

export function oportunidadesDesdeConceptos(concepts){
  const out=new Map();
  for(const [id,weight] of concepts){
    const node=CONCEPTS[id];
    (node?.opportunities||[]).forEach(op=>{
      const value=(out.get(op)||0)+(weight);
      out.set(op,value);
    });
  }
  return [...out.entries()].sort((a,b)=>b[1]-a[1]);
}

export function textoDeConcepto(id){
  const node=CONCEPTS[id];
  return [id,...(node?.aliases||[])].join(' ');
}

export function scoreConceptoEnIdea(id, ideaText){
  const node=CONCEPTS[id];
  if(!node)return 0;
  const t=normalizeLocal(ideaText);
  let hit=0;
  for(const alias of node.aliases||[]){
    if(matchAlias(t,alias))hit=Math.max(hit,1);
  }
  return hit;
}

export function scoreOportunidadEnIdea(id, ideaText){
  const terms=OPPORTUNITY_TERMS[id]||[];
  const t=normalizeLocal(ideaText);
  return terms.some(x=>matchAlias(t,x)) ? 1 : 0;
}

export const SEMANTIC_ENGINE_VERSION = 'local-network-1.0';
