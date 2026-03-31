https://geomaticauis.github.io/biblioteca-digital/
# 📚 Biblioteca Digital - Micrositio HTML

Un elegante micrositio para organizar y consultar documentos en GitHub Pages.

## 🌟 Características

- ✨ **Diseño elegante y moderno** - Interfaz distintiva con tema claro/oscuro
- 🔍 **Búsqueda en tiempo real** - Filtra documentos instantáneamente
- 🏷️ **Categorías organizadas** - Filtra por leyes, normas, proyectos, académicos
- 📱 **Totalmente responsive** - Funciona perfecto en móvil y desktop
- 👁️ **Visor de PDF integrado** - Ve documentos sin salir del sitio
- ⚡ **Generación automática** - Script Python para crear el catálogo
- 🎨 **Categorías con colores** - Identificación visual por tipo de documento

## 📁 Estructura del Proyecto

```
tu-repositorio/
├── index.html              # Página principal
├── styles.css              # Estilos del sitio
├── app.js                  # Lógica de JavaScript
├── catalog.json            # Índice de documentos
├── generate_catalog.py     # Script para generar catálogo
└── docs/                   # Tus documentos organizados
    ├── leyes/
    ├── normas/
    ├── proyectos/
    ├── academicos/
    └── otros/
```

## 🚀 Configuración Inicial

### Paso 1: Crear el Repositorio en GitHub

1. Ve a [github.com](https://github.com) y crea un nuevo repositorio
2. Nombra tu repositorio (ej: `biblioteca-digital`)
3. Hazlo público (necesario para GitHub Pages gratuito)
4. Inicializa con un README si quieres

### Paso 2: Subir los Archivos del Sitio

```bash
# Clona tu repositorio
git clone https://github.com/tu-usuario/biblioteca-digital.git
cd biblioteca-digital

# Copia los archivos del micrositio aquí
# (index.html, styles.css, app.js, catalog.json, generate_catalog.py)

# Haz commit y push
git add .
git commit -m "Agregar micrositio de biblioteca digital"
git push origin main
```

### Paso 3: Organizar tus Documentos

```bash
# Crea la estructura de carpetas
mkdir -p docs/{leyes,normas,proyectos,academicos,otros}

# Coloca tus PDFs en las carpetas correspondientes
# Por ejemplo:
# docs/leyes/ley-123.pdf
# docs/normas/ntc-456.pdf
```

### Paso 4: Generar el Catálogo

El script `generate_catalog.py` escanea automáticamente tus documentos:

```bash
# Ejecutar el generador
python3 generate_catalog.py

# Esto creará/actualizará catalog.json con todos tus documentos
```

**El script:**
- Escanea recursivamente la carpeta `docs/`
- Detecta automáticamente la categoría por la carpeta
- Extrae metadatos (tamaño, fecha de modificación)
- Genera títulos limpios desde los nombres de archivo
- Intenta extraer tags relevantes

Después de generar, **revisa y personaliza** `catalog.json`:
- Mejora las descripciones
- Ajusta los tags
- Verifica que las categorías sean correctas

### Paso 5: Activar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Pages**
3. En "Source" selecciona: **Deploy from a branch**
4. En "Branch" selecciona: **main** y carpeta **/ (root)**
5. Click en **Save**

Tu sitio estará disponible en:
```
https://tu-usuario.github.io/biblioteca-digital/
```

(Puede tomar unos minutos en aparecer)

## 📝 Formato de catalog.json

Cada documento tiene esta estructura:

```json
{
  "id": 1,
  "title": "Título del Documento",
  "description": "Descripción detallada del contenido",
  "category": "leyes",
  "path": "docs/leyes/archivo.pdf",
  "fileType": "pdf",
  "size": "2.4 MB",
  "date": "2024-03-15",
  "tags": ["etiqueta1", "etiqueta2"]
}
```

### Categorías Disponibles

- `leyes` - Leyes, decretos, códigos
- `normas` - Normas técnicas, resoluciones
- `proyectos` - Proyectos, propuestas
- `academicos` - Tesis, investigaciones, artículos
- `otros` - Cualquier otro tipo

Puedes agregar más categorías editando:
1. El archivo CSS (colores en `:root`)
2. El `catalog.json` (nuevos documentos)
3. El script `generate_catalog.py` (detección automática)

## 🎨 Personalización

### Cambiar Colores de Categorías

Edita `styles.css` en la sección `:root`:

```css
:root {
    --cat-leyes: #c7522a;        /* Naranja tierra */
    --cat-normas: #2563b3;       /* Azul */
    --cat-proyectos: #8b5cf6;    /* Morado */
    --cat-academicos: #059669;   /* Verde */
    --cat-nuevacategoria: #FF5733; /* Tu color */
}
```

### Cambiar Título y Tagline

Edita `index.html` en la sección del header:

```html
<h1 class="logo">Tu<span class="logo-accent">Biblioteca</span></h1>
<p class="tagline">Tu descripción personalizada</p>
```

### Cambiar Fuentes

Las fuentes actuales son:
- **Fraunces** (serif elegante) para títulos
- **Instrument Sans** (sans-serif moderna) para cuerpo

Para cambiar, modifica el `<link>` de Google Fonts en `index.html` y actualiza los `font-family` en `styles.css`.

## 🔄 Workflow Recomendado

### Agregar Nuevos Documentos

1. **Coloca el PDF** en la carpeta apropiada:
   ```bash
   cp mi-documento.pdf docs/leyes/
   ```

2. **Regenera el catálogo**:
   ```bash
   python3 generate_catalog.py
   ```

3. **Revisa y edita** `catalog.json` para mejorar descripción/tags

4. **Sube los cambios**:
   ```bash
   git add .
   git commit -m "Agregar nuevo documento: mi-documento.pdf"
   git push origin main
   ```

GitHub Pages se actualizará automáticamente en unos minutos.

## 🛠️ Solución de Problemas

### El sitio no carga
- Verifica que GitHub Pages esté activado en Settings
- Espera 2-5 minutos después del primer push
- Revisa que los archivos estén en la raíz del repo

### Los PDFs no se muestran
- Verifica que las rutas en `catalog.json` sean correctas
- Las rutas deben ser relativas: `docs/categoria/archivo.pdf`
- GitHub Pages es case-sensitive (mayúsculas/minúsculas importan)

### La búsqueda no funciona
- Abre la consola del navegador (F12) para ver errores
- Verifica que `catalog.json` sea JSON válido
- Usa un validador: [jsonlint.com](https://jsonlint.com)

### El script Python no funciona
- Asegúrate de tener Python 3 instalado: `python3 --version`
- Verifica que la carpeta `docs/` exista
- El script crea automáticamente la estructura si no existe

## 🌐 Dominio Personalizado (Opcional)

Para usar tu propio dominio:

1. Crea un archivo `CNAME` en la raíz con tu dominio:
   ```
   biblioteca.tudominio.com
   ```

2. En tu proveedor DNS, crea un registro CNAME:
   ```
   biblioteca.tudominio.com → tu-usuario.github.io
   ```

3. En GitHub Settings → Pages, ingresa tu dominio personalizado

## 📱 Características del Sitio

### Búsqueda Inteligente
- Busca en títulos, descripciones y tags
- Resultados instantáneos mientras escribes
- Combinable con filtros de categoría

### Tema Oscuro/Claro
- Switch automático según preferencia del sistema
- Botón manual para cambiar
- Preferencia guardada en localStorage

### Visor de PDF
- Modal full-screen para ver documentos
- Botón de descarga integrado
- Cerrar con ESC o click fuera

### Atajos de Teclado
- `/` - Enfocar búsqueda
- `ESC` - Cerrar modal

## 🤝 Contribuir

Si quieres mejorar este micrositio:

1. Fork el repositorio
2. Crea una rama: `git checkout -b mejora`
3. Haz tus cambios
4. Commit: `git commit -m "Descripción"`
5. Push: `git push origin mejora`
6. Crea un Pull Request

## 📄 Licencia

Este proyecto es de código abierto. Úsalo libremente para tus propios proyectos.

## 💡 Ideas de Mejoras Futuras

- [ ] Sistema de favoritos con localStorage
- [ ] Exportar resultados de búsqueda a PDF
- [ ] Vista de lista vs grid
- [ ] Estadísticas de documentos por categoría
- [ ] Integración con Google Analytics
- [ ] Comentarios por documento
- [ ] Historial de documentos recientes
- [ ] Modo de lectura nocturna ajustable

## 📞 Soporte

¿Problemas o preguntas? Abre un Issue en GitHub.

---

**¡Disfruta tu biblioteca digital! 📚✨**
🗺️ Tipos de Archivos GIS Soportados
Tu biblioteca digital ahora reconoce automáticamente archivos GIS y ArcGIS.
📊 Tipos de Archivos GIS Detectados:
🗺️ Shapefiles (ESRI)
Iconos: 🗺️ | Color: Verde

.shp - Geometría principal
.shx - Índice espacial
.dbf - Tabla de atributos
.prj - Sistema de coordenadas
.sbn / .sbx - Índice espacial binario
.shp.xml - Metadatos

Nota: Los shapefiles se componen de múltiples archivos. El script los detectará todos.
🌍 ArcGIS Projects & Layers
Iconos: 🌍 | Color: Azul cielo

.mxd - ArcMap Document (ArcGIS 10.x)
.aprx - ArcGIS Pro Project (ArcGIS Pro)
.lyr - Layer file (ArcGIS 10.x)
.lyrx - Layer file (ArcGIS Pro)

🗄️ GeoDatabase
Iconos: 🗄️ | Color: Cian

.gdb - File Geodatabase (carpeta)

🛰️ Raster Data
Iconos: 🛰️ | Color: Verde lima

.tif / .tiff - GeoTIFF
.img - ERDAS Imagine

📍 Formatos de Intercambio
Iconos: 📍 / 🌐 / 📌 | Colores variados

.kml / .kmz - Google Earth (naranja)
.geojson - GeoJSON (morado)
.gpx - GPS Exchange (rojo)

🎨 Cómo se Verán en el Sitio:
Shapefile:
┌─────────────────────────────┐
│ 🗺️  Proyecto SIG            │
├─────────────────────────────┤
│ Municipios Colombia         │
│ Shapefile con municipios    │
│ [GIS] [Cartografía]         │
│ 2.5 MB | 15 Mar | ☁️ Drive  │
└─────────────────────────────┘
Proyecto ArcGIS:
┌─────────────────────────────┐
│ 🌍  Proyectos ArcGIS        │
├─────────────────────────────┤
│ Análisis Espacial 2024      │
│ Proyecto ArcGIS Pro         │
│ [ArcGIS] [Análisis]         │
│ 15 MB | 20 Mar | ☁️ Drive   │
└─────────────────────────────┘
Raster:
┌─────────────────────────────┐
│ 🛰️  Imágenes Satélite       │
├─────────────────────────────┤
│ Landsat_2024_03_15          │
│ Imagen satelital GeoTIFF    │
│ [Raster] [Sensores]         │
│ 125 MB | 15 Mar | ☁️ Drive  │
└─────────────────────────────┘
🔍 Filtros Automáticos:
El sitio creará filtros automáticos para:

GIS - Shapefiles y datos vectoriales
ArcGIS - Proyectos y layers de ArcGIS
GeoDatabase - Bases de datos geográficas
Raster - Imágenes y datos raster
KML - Archivos de Google Earth
GeoJSON - Datos JSON geográficos
GPX - Tracks GPS

🚀 Workflow Recomendado:

Organiza tus archivos GIS en Drive por proyecto o tipo
Ejecuta el scanner de Google Apps Script
Genera catalog.json con el script Python
El sitio detectará automáticamente:

Tipo de archivo GIS
Icono apropiado
Color de categoría
Tags automáticos



📦 Shapefiles Completos:
Si subes un shapefile completo (.shp + .shx + .dbf + .prj), el scanner detectará todos los archivos.
Recomendación: Comprime los shapefiles en .zip para compartir más fácilmente:

municipios.zip → Contiene todos los archivos del shapefile
El sitio lo mostrará como 🗜️ Archivo
Los usuarios descargan y descomprimen localmente

🎯 Ejemplo de catalog.json:
json{
  "id": 1,
  "title": "Municipios Colombia",
  "description": "Shapefile con límites municipales",
  "category": "cartografia-base",
  "categoryDisplay": "Cartografía Base",
  "path": "https://drive.google.com/file/d/1ABC.../preview",
  "fileType": "shp",
  "fileTypeDisplay": "GIS",
  "icon": "🗺️",
  "size": "2.5 MB",
  "tags": ["GIS", "Cartografía Base", "Municipios"]
}
🗺️ Visualización de Datos GIS:
Nota: El sitio muestra metadatos y permite descargar archivos GIS, pero NO renderiza mapas directamente.
Para visualizar:

Descarga el archivo
Abre en ArcGIS, QGIS, o Google Earth (según formato)

🔄 Actualización:
Los archivos actualizados ya incluyen:

✅ generate_catalog_drive_auto.py - Detecta tipos GIS
✅ app.js - Colores y categorías GIS
✅ styles.css - Estilos para archivos GIS
✅ DriveScanner.gs - Reconoce extensiones GIS

🔍 Escáner Automático de Drive - Guía Paso a Paso
Este script de Google Apps Script escanea AUTOMÁTICAMENTE toda tu carpeta de Drive (incluyendo todas las subcarpetas) y extrae toda la información necesaria.
✨ Lo que hace:

✅ Escanea TODAS las subcarpetas recursivamente
✅ Extrae nombre, tipo, tamaño, fecha, file_id
✅ Genera CSV listo para usar
✅ Detecta automáticamente tipos de archivo
✅ Organiza por carpetas

📋 Instrucciones (5 minutos):
Paso 1: Crear Google Sheet

Ve a Google Drive
Click en "Nuevo" → "Hojas de cálculo de Google"
Nómbrala: Escáner Drive

Paso 2: Abrir el Editor de Scripts

En la hoja de cálculo nueva
Menú: Extensiones → Apps Script
Se abrirá el editor de código

Paso 3: Pegar el Código

Borra todo el código que aparece por defecto
Copia TODO el contenido de DriveScanner.gs que te di
Pégalo en el editor
Importante: En la línea 25, cambia:

javascript   const FOLDER_ID = "1nLxpKoFpUmccmbNJ-gvuseXlk2HwdPfO";
(Ya está con tu ID, solo verifica)
Paso 4: Guardar

Click en 💾 Guardar (o Ctrl+S)
Dale un nombre al proyecto: Drive Scanner

Paso 5: Ejecutar

En el menú desplegable arriba (donde dice "selecciona una función")
Selecciona: escanearCarpeta
Click en el botón ▶️ Ejecutar

Paso 6: Autorizar (primera vez)
Te pedirá permisos:

Click "Revisar permisos"
Selecciona tu cuenta de Google
Click "Avanzado" (abajo)
Click "Ir a Drive Scanner (no seguro)"
Click "Permitir"

Paso 7: Esperar

Verás en la parte inferior: "Ejecutando..."
Dependiendo de cuántos archivos tengas: 30 segundos a 5 minutos
Cuando termine, verás un mensaje: "¡Escaneo completado!"

Paso 8: Ver Resultados

Vuelve a la hoja de cálculo (pestaña anterior)
Verás una nueva pestaña: "Catálogo Drive"
¡Ahí está TODO! Todos tus archivos listados

Paso 9: Descargar CSV
Opción A: Descargar

Menú: Archivo → Descargar → Valores separados por comas (.csv)
Se descarga como Escaner Drive - Catálogo Drive.csv
Renómbralo a: drive_structure.csv

Opción B: Copiar desde el menú

En la hoja, verás un nuevo menú: 📂 Drive Scanner
Click en 📋 Copiar para Python
Copia todo el texto
Crea un archivo drive_structure.csv y pega

🎯 Formato del CSV generado:
csvarchivo,carpeta,file_id,tipo,tamaño,fecha_modificacion,url_completa
documento.pdf,Tesis/2024,1ABC123,pdf,3.5 MB,2024-03-15,https://...
presentacion.pptx,Proyectos,2DEF456,pptx,2.1 MB,2024-03-10,https://...
datos.xlsx,Análisis/Estadísticas,3GHI789,xlsx,1.8 MB,2024-03-20,https://...
🚀 Usar con Python:
Una vez que tengas el CSV:
bash# Coloca drive_structure.csv en la misma carpeta que el script
python3 generate_catalog_drive_auto.py

# Selecciona opción: 2
# El script leerá el CSV y generará catalog.json
🔧 Personalizar (Opcional):
Si quieres escanear OTRA carpeta:

Ve al script en Apps Script
Línea 25, cambia el FOLDER_ID:

javascript   const FOLDER_ID = "NUEVO_ID_AQUI";

Guarda y vuelve a ejecutar

Para obtener el ID de cualquier carpeta:

Abre la carpeta en Drive
Mira la URL: https://drive.google.com/drive/folders/ESTE_ES_EL_ID

📊 Estadísticas que genera:
El script cuenta automáticamente:

Total de archivos
Archivos por carpeta
Archivos por tipo

💡 Tips:

Primera ejecución tarda más: Autoriza permisos
Muchos archivos: Puede tardar varios minutos (normal)
Actualizar: Vuelve a ejecutar cuando agregues archivos nuevos
Múltiples carpetas: Ejecuta el script para cada carpeta principal

🛠️ Solución de Problemas:
"No se puede acceder a la carpeta"

Verifica el FOLDER_ID
Asegúrate que tienes acceso a la carpeta

"Script tarda mucho"

Normal si tienes 1000+ archivos
Deja que termine, no cierres la pestaña

"Error de permisos"

Vuelve a autorizar: Ejecutar → Revisar permisos

"CSV vacío"

Verifica que la carpeta tenga archivos
Revisa el FOLDER_ID

🎉 Resultado Final:
Después de este proceso tendrás:

✅ CSV completo con todos tus archivos
✅ File IDs de cada documento
✅ Estructura de carpetas organizada
✅ Tamaños y fechas automáticos
✅ Listo para generar catalog.json

🤖 Guía de Automatización con GitHub Actions
Esta guía te explica cómo configurar la actualización automática del catálogo cuando subes documentos.
✨ ¿Qué hace la automatización?
Cada vez que subes un archivo PDF a la carpeta docs/, GitHub Actions automáticamente:

Escanea todos los archivos en docs/
Genera/actualiza el catalog.json
Hace commit y push del catálogo actualizado
¡Tu sitio se actualiza solo!

📋 Configuración (Una sola vez)
Paso 1: Subir el Workflow
Sube el archivo .github/workflows/auto-catalog.yml a tu repositorio:
bash# Estructura que necesitas:
tu-repo/
├── .github/
│   └── workflows/
│       └── auto-catalog.yml    ← Este archivo
├── docs/
├── index.html
├── app.js
└── generate_catalog.py
Desde la web de GitHub:

En tu repo, click "Add file" → "Create new file"
Nombra el archivo: .github/workflows/auto-catalog.yml
Pega el contenido del archivo
Commit

Desde terminal:
bashmkdir -p .github/workflows
cp auto-catalog.yml .github/workflows/
git add .github/workflows/auto-catalog.yml
git commit -m "Agregar automatización de catálogo"
git push
Paso 2: Dar Permisos al Workflow

Ve a tu repositorio en GitHub
Click en Settings → Actions → General
Baja hasta "Workflow permissions"
Selecciona: "Read and write permissions"
✅ Marca: "Allow GitHub Actions to create and approve pull requests"
Click Save

¡Eso es todo! Ya está configurado.
🚀 Cómo Usarlo
Opción 1: Subir archivos desde GitHub Web

Ve a tu repositorio
Navega a docs/leyes/ (o la categoría que quieras)
Click "Add file" → "Upload files"
Arrastra tus PDFs
Commit

¡GitHub Actions hace el resto!
En 1-2 minutos:

Se ejecuta el script
Se actualiza catalog.json
Tu sitio se actualiza automáticamente

Opción 2: Subir archivos desde Terminal
bash# Copia tu PDF
cp mi-documento.pdf docs/leyes/

# Sube el cambio
git add docs/leyes/mi-documento.pdf
git commit -m "Agregar nuevo documento"
git push
El workflow se ejecuta automáticamente y actualiza el catálogo.
Opción 3: Ejecutar Manualmente
Puedes ejecutar el workflow sin subir archivos:

Ve a tu repo → Actions
Click en "Auto-generar Catálogo"
Click "Run workflow" → "Run workflow"

Útil si editaste descripciones manualmente y quieres regenerar.
📊 Ver el Progreso
Para ver si funcionó:

Ve a tu repositorio → pestaña Actions
Verás la lista de ejecuciones del workflow
Click en la más reciente para ver los detalles
✅ Verde = Éxito | ❌ Rojo = Error

🔍 Verificar que Funcionó

Después de subir un PDF, espera 1-2 minutos
Ve a tu repositorio
Abre catalog.json
Deberías ver tu nuevo documento listado
Visita tu sitio web y busca el documento

🛠️ Solución de Problemas
El workflow no se ejecuta
Problema: Subiste un PDF pero no pasó nada.
Solución:

Verifica que el archivo esté en docs/ o subcarpetas
Ve a Settings → Actions → General
Confirma que Actions esté habilitado
Verifica los permisos (Read and write)

Error: "Permission denied"
Problema: El workflow falla al hacer push.
Solución:

Settings → Actions → General
"Workflow permissions" → "Read and write permissions"
Guarda y reintenta

El catálogo no se actualiza
Problema: El workflow corre pero catalog.json no cambia.
Posibles causas:

No hay cambios reales (el documento ya estaba)
El script falló (revisa los logs del workflow)
El archivo no es un PDF válido

Solución:

Ve a Actions y revisa los logs
Busca mensajes de error
Ejecuta el script localmente para debug: python3 generate_catalog.py

Quiero personalizar las descripciones
El script preserva descripciones personalizadas:

Edita catalog.json manualmente en GitHub
Mejora las descripciones que quieras
Haz commit
Futuras ejecuciones NO sobrescribirán tus descripciones personalizadas
Solo se actualizan descripciones que empiecen con "Documento de..."

🎯 Mejoras Opcionales
Ejecutar solo de lunes a viernes
Edita .github/workflows/auto-catalog.yml:
yamlon:
  push:
    paths:
      - 'docs/**'
  schedule:
    - cron: '0 9 * * 1-5'  # 9 AM, lunes a viernes
Notificaciones por email
GitHub ya te notifica si el workflow falla. Para personalizar:
Settings → Notifications → Actions
Agregar más formatos de archivo
Edita generate_catalog.py, línea ~120:
pythonvalid_extensions = ['.pdf', '.docx', '.doc', '.xlsx', '.pptx', '.txt']
📝 Notas Importantes

El workflow solo detecta cambios en docs/**
Si cambias el script Python, NO se ejecutará automáticamente
Para forzar ejecución: usa "Run workflow" manualmente
El bot hace commits como "github-actions[bot]"
Las descripciones personalizadas se preservan siempre

✅ Checklist de Configuración

 Archivo .github/workflows/auto-catalog.yml subido
 Permisos de "Read and write" activados
 GitHub Actions habilitado
 Probado subiendo un PDF de prueba
 Verificado que catalog.json se actualizó
 Sitio web muestra el nuevo documento
