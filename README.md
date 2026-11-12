<p align="center">
  <img src="favicon.png" alt="Logo KB" width="120">
</p>

<h1 align="center">Keiri Blest</h1>

<p align="center">
  Web oficial con la música y los lanzamientos de Keiri Blest.<br>
  Pop · Hip Hop/Rap · Latin Trap
</p>

<p align="center">
  <a href="https://keiriblest.github.io/keiri-blest/">Ver la web</a>
</p>

---

## Características

- Carrusel de lanzamientos con portadas y navegación por flechas o gestos táctiles.
- Vista de detalle de cada canción con portada en 3D hecha con Three.js.
- Reproducción de previews, letras y créditos de cada tema.
- Enlaces a todas las plataformas: Spotify, Apple Music, YouTube, YouTube Music, Amazon Music, Tidal, Deezer y Pandora.
- Modo claro y oscuro, que se guarda en el navegador.
- Efectos de sonido en la interfaz, que se pueden silenciar.
- Diseño adaptable a móvil y escritorio, inspirado en el estilo de Apple.

## Estructura del proyecto

## Tecnologías

- HTML, CSS y JavaScript sin frameworks
- [Three.js](https://threejs.org/) para las portadas en 3D
- [iTunes Search API](https://performance-partners.apple.com/search-api) para las previews de audio
- GitHub Pages para el despliegue

## Ejecutar en local

Necesitas un servidor local, porque la web carga `letras.json` con `fetch`.

```bash
git clone [https://github.com/keiriblest/keiri-blest.git](https://github.com/keiriblest/keiri-blest.git)
cd keiri-blest
python -m http.server 8000
```

Abre `http://localhost:8000` en el navegador.

## Añadir un lanzamiento

1. Sube la portada a `assets/covers/` con el mismo identificador que uses en `c`, por ejemplo `mi-cancion.jpg`.
2. Añade un objeto nuevo al array `R` dentro de `index.html`, con título, año, colores, créditos y enlaces.
3. Añade la letra en `letras.json`.
4. Haz commit y GitHub Pages publicará el cambio.

## Contacto

- Instagram: [@keiriblest](https://www.instagram.com/keiriblest/)
- TikTok: [@keiriblest](https://www.tiktok.com/@keiriblest)
- X: [@BlestKeiri](https://x.com/BlestKeiri)
- YouTube: [@keiriblest](https://www.youtube.com/@keiriblest)
- Email: blestkeiri@gmail.com

---

<p align="center">© Keiri Blest</p>
