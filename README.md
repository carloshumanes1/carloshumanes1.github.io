# carlos-humanes — web de Carlos Humanes (dos caras)

Un solo sitio con dos puertas: la **profesional** (`index.html`, estilo `sanitario-sobrio`) y la
de **CLOSH**, su nombre como músico y DJ (`closh.html`, estilo `closh-basquiat`, D-012). Cada
cara enlaza a la otra con un enlace discreto. Stack vanilla (D-002): HTML + CSS + un JS pequeño
para la demo del hero. Sin build.

- `index.html` — la página (v2 «la web respira», D-013): hero oscuro con el titular que respira
  (Bricolage Grotesque, eje de anchura animado) y una traza viva de presión con la lámpara del
  pulsador todo-o-nada; problema con cifras grandes y barras de precio a escala, propuesta, cómo funciona, estado real,
  material descargable, Contesta, otros proyectos, quién soy y contacto.
- `css/tokens.css` — tokens del estilo (claro + modo oscuro automático). `css/styles.css` — componentes.
- `css/fuentes.css` + `fonts/` — las fuentes alojadas aquí (sin llamadas a Google).
- `favicon.svg`, `icono-180.png`, `icono-512.png`, `manifest.webmanifest`, `material/og.png` (imagen
  para compartir), `404.html`, `.nojekyll` — listos para GitHub Pages (D-016).
- `js/sitio.js` — la vida de la página (v2): titular letra a letra, aparición al hacer scroll,
  contadores, barra de progreso, nariz que sigue al puntero y la traza de presión (simulación
  en el navegador, no mide nada real; si no tocas, respira sola; con `prefers-reduced-motion`
  todo queda quieto y se ve entero).
- `material/` — los PPTX que se descargan desde la página (copias de
  `dj_accesible/presentaciones`, nombres sin espacios) y `material/capturas/` (tres capturas
  reales de DJ Tetris del 7-nov-2026, recortadas a la ventana; ver D-015).
- `closh.html` — la cara CLOSH: hero, reel INFINITE (vídeo incrustado), qué hace, herramientas
  propias con estado honesto y huecos de contacto/redes.
- `css/tokens-closh.css` — copia literal de `styles/closh-basquiat/tokens.css`. `css/closh.css` —
  componentes de esa cara. No tocan `tokens.css` ni `styles.css` de la profesional.
- `material/infinite-zenea-reel.mp4` — el reel recomprimido para la web (10,7 MB; el original pesa
  26,8 MB): 1080×1920, H.264 CRF 26, AAC 160k, `+faststart`. `material/infinite-zenea-portada.jpg` es
  su póster (130 KB). OJO: el `http.server` de Python no atiende rangos, así que en local el vídeo
  suena pero no deja saltar a un minuto concreto; GitHub Pages sí los atiende.

## Ver en local
Desde MANIFIESTO: configuración `web-carlos-humanes` del `.claude/launch.json`
(python -m http.server 8137 sirviendo esta carpeta) → http://127.0.0.1:8137

## Huecos que rellena Carlos antes de publicar (marcados con borde discontinuo)
1. Contacto: correo y teléfono YA puestos (26-nov); falta el enlace a LinkedIn.
2. Vídeo de 30-60 s del aparato y del cursor de nariz (sección Material).
3. Opcional: una foto. Hoy la página no lleva ninguna imagen, solo esquemas SVG.

## Huecos de la cara CLOSH (`closh.html`, borde discontinuo amarillo)
1. Qué es ZENEA para CLOSH (alias, colaboración, encargo) y dónde está publicado el tema.
2. Galería de pintura: elegir qué obras (de las 95 de `Documents\pinturs\extraidas`) se enseñan.
3. Contacto y redes: Instagram, dónde escuchar (Spotify/SoundCloud/YouTube) y correo de CLOSH.

El vídeo del reel ya no es hueco: está incrustado desde el 27-nov-2026 (addenda de D-012).

## Publicada en GitHub Pages (26-nov-2026)
Dirección pública: **https://carloshumanes1.github.io/** (repo público `carloshumanes1/carloshumanes1.github.io`,
rama `main`, raíz). Para publicar cambios: `python publicar.py "mensaje"` desde esta carpeta. El script copia
la carpeta (sin previsualizaciones ni notas internas) al clon `agente_web/_publicado/carloshumanes1.github.io/`,
hace commit y push; GitHub reconstruye la web en un minuto. OJO: el push necesita la sesión de GitHub del
usuario (Git Credential Manager); lanzarlo desde el Terminal de la app o una consola de Carlos, no desde el
sandbox de Claude (ahí GCM se cuelga y puede borrar la credencial). Dominio propio (opcional): fichero `CNAME`
con el dominio + registro DNS, y cambiar `canonical`/`og:url`/`og:image` en el `<head>`.

## Reglas de contenido
Todas las cifras salen de `dj_accesible/docs/ESTUDIO_MERCADO_2026-11-24.md` y de los
guiones de `dj_accesible/presentaciones/guiones/`. No inventar datos: si cambia un precio,
cambiarlo en el estudio y luego aquí.
