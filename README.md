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
