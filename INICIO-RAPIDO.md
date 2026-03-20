# 🚀 Guía Rápida de Inicio

Esta es una guía simplificada para poner tu biblioteca digital en línea en **15 minutos**.

## ✅ Requisitos Previos

- Una cuenta de GitHub (gratuita)
- Tus documentos PDF organizados
- Python 3 instalado (solo para generar el catálogo automáticamente)

## 📋 Pasos Rápidos

### 1. Crear Repositorio en GitHub (3 minutos)

1. Ve a https://github.com/new
2. Nombre del repositorio: `biblioteca-digital` (o el que prefieras)
3. Selecciona **Public**
4. ✅ Marca "Add a README file"
5. Click **Create repository**

### 2. Subir los Archivos del Sitio (5 minutos)

**Opción A: Desde la Web (más fácil)**

1. En tu repositorio, click en **Add file** → **Upload files**
2. Arrastra estos 5 archivos:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `catalog.json`
   - `generate_catalog.py`
3. Escribe un mensaje: "Agregar micrositio"
4. Click **Commit changes**

**Opción B: Desde Terminal**

```bash
git clone https://github.com/TU-USUARIO/biblioteca-digital.git
cd biblioteca-digital
# Copia los archivos aquí
git add .
git commit -m "Agregar micrositio"
git push
```

### 3. Organizar tus Documentos (5 minutos)

1. En GitHub, crea estas carpetas:
   - Click **Add file** → **Create new file**
   - Escribe: `docs/leyes/README.md`
   - Agrega cualquier texto
   - Commit
   
2. Repite para crear:
   - `docs/normas/README.md`
   - `docs/proyectos/README.md`
   - `docs/academicos/README.md`

3. Sube tus PDFs:
   - Click en la carpeta apropiada
   - **Add file** → **Upload files**
   - Arrastra tus PDFs
   - Commit

### 4. Generar el Catálogo

**Opción A: Manualmente**

Edita `catalog.json` directamente en GitHub agregando cada documento:

```json
{
  "id": 1,
  "title": "Mi Documento",
  "description": "Descripción del documento",
  "category": "leyes",
  "path": "docs/leyes/mi-documento.pdf",
  "fileType": "pdf",
  "size": "1.5 MB",
  "date": "2024-03-15",
  "tags": ["etiqueta1", "etiqueta2"]
}
```

**Opción B: Automáticamente (requiere Python)**

```bash
# Clona el repo localmente
git clone https://github.com/TU-USUARIO/biblioteca-digital.git
cd biblioteca-digital

# Ejecuta el script
python3 generate_catalog.py

# Sube los cambios
git add catalog.json
git commit -m "Actualizar catálogo"
git push
```

### 5. Activar GitHub Pages (2 minutos)

1. En tu repositorio, ve a **Settings**
2. En el menú izquierdo, click **Pages**
3. En "Source": selecciona **Deploy from a branch**
4. En "Branch": selecciona **main** y **/ (root)**
5. Click **Save**

¡Espera 2-5 minutos!

Tu sitio estará en:
```
https://TU-USUARIO.github.io/biblioteca-digital/
```

## ✨ ¡Listo!

Tu biblioteca digital ya está en línea. Comparte el link con quien quieras.

## 🔄 Para Agregar Más Documentos

1. Sube el PDF a la carpeta correspondiente en `docs/`
2. Si usas el script:
   ```bash
   python3 generate_catalog.py
   git add .
   git commit -m "Agregar nuevo documento"
   git push
   ```
3. Si editas manual: actualiza `catalog.json` en GitHub

El sitio se actualiza automáticamente en minutos.

## 🆘 Problemas Comunes

**"No veo mi sitio"**
- Espera 5 minutos más
- Verifica que GitHub Pages esté activado
- Revisa que la rama sea "main"

**"Los PDFs no cargan"**
- Verifica la ruta en catalog.json
- Debe ser: `docs/categoria/archivo.pdf`
- Respeta mayúsculas/minúsculas

**"El catálogo está vacío"**
- Verifica que `catalog.json` tenga contenido
- Usa https://jsonlint.com para validar el JSON

## 📞 ¿Necesitas Ayuda?

Abre un Issue en tu repositorio o revisa el README completo.
