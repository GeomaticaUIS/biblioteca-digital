# 🤖 Guía de Automatización con GitHub Actions

Esta guía te explica cómo configurar la actualización automática del catálogo cuando subes documentos.

## ✨ ¿Qué hace la automatización?

Cada vez que subes un archivo PDF a la carpeta `docs/`, GitHub Actions automáticamente:
1. Escanea todos los archivos en `docs/`
2. Genera/actualiza el `catalog.json`
3. Hace commit y push del catálogo actualizado
4. ¡Tu sitio se actualiza solo!

## 📋 Configuración (Una sola vez)

### Paso 1: Subir el Workflow

Sube el archivo `.github/workflows/auto-catalog.yml` a tu repositorio:

```bash
# Estructura que necesitas:
tu-repo/
├── .github/
│   └── workflows/
│       └── auto-catalog.yml    ← Este archivo
├── docs/
├── index.html
├── app.js
└── generate_catalog.py
```

**Desde la web de GitHub:**
1. En tu repo, click "Add file" → "Create new file"
2. Nombra el archivo: `.github/workflows/auto-catalog.yml`
3. Pega el contenido del archivo
4. Commit

**Desde terminal:**
```bash
mkdir -p .github/workflows
cp auto-catalog.yml .github/workflows/
git add .github/workflows/auto-catalog.yml
git commit -m "Agregar automatización de catálogo"
git push
```

### Paso 2: Dar Permisos al Workflow

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Actions** → **General**
3. Baja hasta "Workflow permissions"
4. Selecciona: **"Read and write permissions"**
5. ✅ Marca: **"Allow GitHub Actions to create and approve pull requests"**
6. Click **Save**

¡Eso es todo! Ya está configurado.

## 🚀 Cómo Usarlo

### Opción 1: Subir archivos desde GitHub Web

1. Ve a tu repositorio
2. Navega a `docs/leyes/` (o la categoría que quieras)
3. Click "Add file" → "Upload files"
4. Arrastra tus PDFs
5. Commit

**¡GitHub Actions hace el resto!**

En 1-2 minutos:
- Se ejecuta el script
- Se actualiza `catalog.json`
- Tu sitio se actualiza automáticamente

### Opción 2: Subir archivos desde Terminal

```bash
# Copia tu PDF
cp mi-documento.pdf docs/leyes/

# Sube el cambio
git add docs/leyes/mi-documento.pdf
git commit -m "Agregar nuevo documento"
git push
```

El workflow se ejecuta automáticamente y actualiza el catálogo.

### Opción 3: Ejecutar Manualmente

Puedes ejecutar el workflow sin subir archivos:

1. Ve a tu repo → **Actions**
2. Click en "Auto-generar Catálogo"
3. Click "Run workflow" → "Run workflow"

Útil si editaste descripciones manualmente y quieres regenerar.

## 📊 Ver el Progreso

Para ver si funcionó:

1. Ve a tu repositorio → pestaña **Actions**
2. Verás la lista de ejecuciones del workflow
3. Click en la más reciente para ver los detalles
4. ✅ Verde = Éxito | ❌ Rojo = Error

## 🔍 Verificar que Funcionó

1. Después de subir un PDF, espera 1-2 minutos
2. Ve a tu repositorio
3. Abre `catalog.json`
4. Deberías ver tu nuevo documento listado
5. Visita tu sitio web y busca el documento

## 🛠️ Solución de Problemas

### El workflow no se ejecuta

**Problema:** Subiste un PDF pero no pasó nada.

**Solución:**
- Verifica que el archivo esté en `docs/` o subcarpetas
- Ve a Settings → Actions → General
- Confirma que Actions esté habilitado
- Verifica los permisos (Read and write)

### Error: "Permission denied"

**Problema:** El workflow falla al hacer push.

**Solución:**
1. Settings → Actions → General
2. "Workflow permissions" → "Read and write permissions"
3. Guarda y reintenta

### El catálogo no se actualiza

**Problema:** El workflow corre pero catalog.json no cambia.

**Posibles causas:**
- No hay cambios reales (el documento ya estaba)
- El script falló (revisa los logs del workflow)
- El archivo no es un PDF válido

**Solución:**
- Ve a Actions y revisa los logs
- Busca mensajes de error
- Ejecuta el script localmente para debug: `python3 generate_catalog.py`

### Quiero personalizar las descripciones

El script **preserva descripciones personalizadas**:

1. Edita `catalog.json` manualmente en GitHub
2. Mejora las descripciones que quieras
3. Haz commit
4. Futuras ejecuciones NO sobrescribirán tus descripciones personalizadas
5. Solo se actualizan descripciones que empiecen con "Documento de..."

## 🎯 Mejoras Opcionales

### Ejecutar solo de lunes a viernes

Edita `.github/workflows/auto-catalog.yml`:

```yaml
on:
  push:
    paths:
      - 'docs/**'
  schedule:
    - cron: '0 9 * * 1-5'  # 9 AM, lunes a viernes
```

### Notificaciones por email

GitHub ya te notifica si el workflow falla. Para personalizar:

Settings → Notifications → Actions

### Agregar más formatos de archivo

Edita `generate_catalog.py`, línea ~120:

```python
valid_extensions = ['.pdf', '.docx', '.doc', '.xlsx', '.pptx', '.txt']
```

## 📝 Notas Importantes

- El workflow solo detecta cambios en `docs/**`
- Si cambias el script Python, NO se ejecutará automáticamente
- Para forzar ejecución: usa "Run workflow" manualmente
- El bot hace commits como "github-actions[bot]"
- Las descripciones personalizadas se preservan siempre

## ✅ Checklist de Configuración

- [ ] Archivo `.github/workflows/auto-catalog.yml` subido
- [ ] Permisos de "Read and write" activados
- [ ] GitHub Actions habilitado
- [ ] Probado subiendo un PDF de prueba
- [ ] Verificado que catalog.json se actualizó
- [ ] Sitio web muestra el nuevo documento

---

**¿Todo funcionando? ¡Ahora solo sube PDFs y olvídate del catálogo! 🎉**
