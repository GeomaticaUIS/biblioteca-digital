# Biblioteca Digital

Micrositio estático publicado con GitHub Pages para buscar documentos y
abrirlos desde Google Drive. La página no aloja ni descarga los documentos de
Drive: el repositorio contiene el catálogo y sus metadatos.

Sitio: <https://geomaticauis.github.io/biblioteca-digital/>

## Cómo funciona la búsqueda

La aplicación usa el índice estático comprimido de `catalog/search/`:

- `catalog/search/manifest.json` declara el total de documentos, los tipos de
  archivo disponibles y los fragmentos del índice.
- Los archivos `part-*.json.gz` contienen hasta 10.000 registros cada uno.
- Al abrir la página se carga el primer fragmento y se muestran hasta 50
  tarjetas. El botón **Mostrar más documentos** agrega resultados en lotes de
  50 y carga más fragmentos cuando hace falta.
- Al buscar o elegir un tipo de archivo, el navegador descarga los fragmentos
  restantes para consultar el catálogo completo. La primera búsqueda en una
  sesión puede tardar más; el navegador reutiliza los fragmentos ya
  descargados durante esa sesión.
- La búsqueda considera título, categoría/carpeta, tipo de archivo y
  etiquetas. No busca dentro del contenido de los archivos ni consulta Drive.

El índice contiene los metadatos de los resultados y los enlaces a Drive. En
la versión actual, el catálogo tiene aproximadamente 504.682 documentos en 51
fragmentos, con un tamaño total cercano a 29 MB comprimidos. El tamaño cambia
cuando se actualiza el catálogo.

## Estructura relevante

```text
biblioteca-digital/
├── index.html
├── styles.css
├── app.js
├── catalog/
│   ├── index.json                 # Manifiesto de las partes fuente
│   ├── part*.json                 # Catálogo fuente dividido
│   └── search/
│       ├── manifest.json          # Índice de búsqueda generado
│       └── part-*.json.gz         # Fragmentos comprimidos generados
├── generate_search_index.py       # Genera catalog/search/
└── .github/workflows/
    ├── auto-catalog.yml
    └── generate-search-index.yml
```

`catalog/search/` es generado: no lo edites manualmente. Los documentos
permanecen en Drive y sus enlaces se guardan en los registros del catálogo.

## Publicar el sitio

En GitHub, abre **Settings → Pages** y selecciona **Deploy from a branch**,
rama `main`, carpeta `/ (root)`. La URL del proyecto es:

```text
https://geomaticauis.github.io/biblioteca-digital/
```

## Actualizar o agregar documentos

Para que un documento aparezca en la búsqueda se debe actualizar el catálogo
fuente dividido:

1. Añade o actualiza los registros en `catalog/part*.json`.
2. Actualiza `catalog/index.json` para que enumere las partes correctas.
3. Publica esos cambios en la rama `main`.
4. El workflow `Generar índice de búsqueda` ejecuta
   `generate_search_index.py` y guarda los archivos nuevos de
   `catalog/search/`.
5. Revisa **GitHub → Actions** para confirmar que el workflow terminó sin
   errores.

El generador crea tantos fragmentos como sean necesarios y actualiza el total
y la lista de tipos en el manifiesto. Si baja la cantidad de documentos,
también elimina los fragmentos sobrantes.

**Actualizar solo `catalog.json` no actualiza la búsqueda del sitio.** La
aplicación lee `catalog/search/manifest.json`, que se genera desde
`catalog/index.json` y las partes enumeradas allí.

El workflow `Auto-generar Catálogo` que observa cambios en `docs/**` genera
`catalog.json`; no genera ni actualiza `catalog/part*.json`. Por tanto, ese
workflow por sí solo no alimenta el índice de búsqueda activo. Si se usa como
origen de nuevos datos, primero hay que convertir/sincronizar su resultado a
las partes fuente y actualizar `catalog/index.json`.

### Generar el índice manualmente

Se necesita Python 3; el script usa solo la biblioteca estándar.

Windows PowerShell:

```powershell
python .\generate_search_index.py
```

Linux, macOS o GitHub Actions:

```bash
python3 generate_search_index.py
```

El comando lee `catalog/index.json` y las partes enumeradas allí, y escribe
los archivos de búsqueda en `catalog/search/`. Luego publica el resultado:

```bash
git add catalog/search
git commit -m "Actualizar índice de búsqueda"
git push origin main
```

El tamaño por fragmento se puede cambiar de forma explícita si hace falta:

```bash
python3 generate_search_index.py --shard-size 10000
```

## Campos de cada documento

Un registro fuente normalmente contiene los metadatos de la tarjeta, además
del enlace de vista y descarga de Drive:

```json
{
  "id": 1,
  "title": "Nombre del documento",
  "description": "Descripción breve",
  "category": "carpeta-normalizada",
  "categoryDisplay": "Carpeta",
  "path": "https://drive.google.com/file/d/ID/preview",
  "downloadUrl": "https://drive.google.com/uc?export=download&id=ID",
  "fileType": "pdf",
  "fileTypeDisplay": "PDF",
  "icon": "📄",
  "size": "245760",
  "date": "2026-03-30",
  "tags": ["PDF", "Carpeta"],
  "source": "google-drive"
}
```

Comprueba que los enlaces y permisos de Drive permitan a los usuarios del
micrositio abrir los archivos. Publicar metadatos y enlaces en GitHub Pages
los hace accesibles públicamente.

## Solución de problemas

### La búsqueda o el catálogo no cargan

- Revisa la consola del navegador y la pestaña **Actions** del repositorio.
- Confirma que `catalog/search/manifest.json` y cada archivo `.json.gz`
  enumerado en él estén publicados.
- Si el manifiesto menciona una parte inexistente, ejecuta de nuevo
  `generate_search_index.py` y publica la carpeta `catalog/search/`.
- Usa un navegador actualizado que admita `DecompressionStream` para gzip.

### Los documentos nuevos no aparecen

- Confirma que se hayan actualizado `catalog/part*.json` y
  `catalog/index.json`; modificar solo `catalog.json` no basta.
- Confirma que el workflow **Generar índice de búsqueda** haya terminado.
- Si actualizaste los metadatos directamente, vuelve a ejecutar el generador.

### Un documento no abre

- Comprueba que `path` y `downloadUrl` sean enlaces válidos de Google Drive.
- Revisa los permisos de acceso del documento en Drive.

## Funciones de la interfaz

- Tema claro/oscuro, con preferencia guardada en el navegador.
- Filtros por tipo de archivo.
- Visor modal para documentos compatibles y enlace de descarga.
- Atajo `/` para enfocar la búsqueda y `Esc` para cerrar el visor.
