#!/usr/bin/env python3
"""
Generador automático de catalog.json
Este script escanea la carpeta docs/ y genera el archivo catalog.json
con los metadatos de todos los documentos encontrados.
"""

import os
import json
from pathlib import Path
from datetime import datetime
import hashlib

# Configuración
DOCS_DIR = "docs"
OUTPUT_FILE = "catalog.json"

# Mapeo de categorías (puedes agregar más)
CATEGORY_KEYWORDS = {
    "leyes": ["ley", "decreto", "codigo", "estatuto"],
    "normas": ["norma", "ntc", "iso", "resolucion", "circular"],
    "proyectos": ["proyecto", "propuesta", "plan"],
    "academicos": ["tesis", "investigacion", "articulo", "paper", "estudio"]
}

# Colores por categoría (deben coincidir con CSS)
CATEGORY_INFO = {
    "leyes": {"color": "#c7522a", "name": "Leyes"},
    "normas": {"color": "#2563b3", "name": "Normas"},
    "proyectos": {"color": "#8b5cf6", "name": "Proyectos"},
    "academicos": {"color": "#059669", "name": "Académicos"},
    "otros": {"color": "#6b7280", "name": "Otros"}
}

def get_file_size(filepath):
    """Obtiene el tamaño del archivo en formato legible"""
    size = os.path.getsize(filepath)
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"

def extract_tags(filename, description=""):
    """Extrae tags del nombre de archivo y descripción"""
    tags = []
    text = (filename + " " + description).lower()
    
    # Lista de palabras clave comunes
    keywords = [
        "tributario", "reforma", "impuestos", "calidad", "ISO", "gestión",
        "IA", "educación", "investigación", "civil", "código", "derecho",
        "energía", "sostenibilidad", "tesis", "SST", "trabajo", "seguridad",
        "ambiental", "laboral", "comercio", "penal", "procesal", "constitucional",
        "administrativo", "financiero", "contable", "auditoría"
    ]
    
    for keyword in keywords:
        if keyword.lower() in text:
            tags.append(keyword)
    
    return tags[:5]  # Máximo 5 tags

def generate_description(filename, category):
    """Genera una descripción básica si no existe"""
    clean_name = filename.replace('.pdf', '').replace('_', ' ').replace('-', ' ')
    category_name = CATEGORY_INFO.get(category, CATEGORY_INFO["otros"])["name"]
    
    return f"Documento de {category_name.lower()}: {clean_name}. Actualiza esta descripción en catalog.json para mayor detalle."

def load_existing_catalog():
    """Carga el catálogo existente para preservar descripciones personalizadas"""
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
                return {doc['path']: doc for doc in json.load(f)}
        except:
            return {}
    return {}

def scan_documents():
    """Escanea la carpeta docs/ y genera la estructura de datos"""
    documents = []
    doc_id = 1
    
    if not os.path.exists(DOCS_DIR):
        print(f"⚠️  La carpeta '{DOCS_DIR}' no existe. Creando estructura de ejemplo...")
        create_example_structure()
        return []
    
    # Cargar catálogo existente para preservar descripciones
    existing_catalog = load_existing_catalog()
    
    # Recorrer todos los archivos en docs/
    for root, dirs, files in os.walk(DOCS_DIR):
        # Ordenar para consistencia
        files.sort()
        
        for filename in files:
            # Ignorar archivos ocultos y README
            if filename.startswith('.') or filename.upper() == 'README.MD':
                continue
            
            # Solo procesar PDFs y otros documentos comunes
            valid_extensions = ['.pdf', '.docx', '.doc', '.xlsx', '.pptx']
            if not any(filename.lower().endswith(ext) for ext in valid_extensions):
                continue
            
            filepath = os.path.join(root, filename)
            relative_path = os.path.relpath(filepath, '.').replace('\\', '/')
            
            # Extraer categoría del path (docs/categoria/archivo.pdf)
            path_parts = Path(relative_path).parts
            category = path_parts[1] if len(path_parts) > 2 else "otros"
            
            # Validar que la categoría exista
            if category not in CATEGORY_INFO:
                category = "otros"
            
            # Generar título limpio
            title = filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ')
            title = ' '.join(word.capitalize() for word in title.split())
            
            # Usar descripción existente si ya estaba en el catálogo
            existing_doc = existing_catalog.get(relative_path)
            if existing_doc and not existing_doc['description'].startswith('Documento de'):
                # Preservar descripción personalizada
                description = existing_doc['description']
                tags = existing_doc.get('tags', extract_tags(filename, description))
            else:
                # Generar nueva descripción
                description = generate_description(filename, category)
                tags = extract_tags(filename, description)
            
            # Detectar tipo de archivo
            file_type = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'pdf'
            
            # Crear entrada del documento
            doc = {
                "id": doc_id,
                "title": title,
                "description": description,
                "category": category,
                "path": relative_path,
                "fileType": file_type,
                "size": get_file_size(filepath),
                "date": datetime.fromtimestamp(os.path.getmtime(filepath)).strftime("%Y-%m-%d"),
                "tags": tags
            }
            
            documents.append(doc)
            doc_id += 1
            print(f"✓ Procesado: {filename} ({category})")
    
    return documents

def create_example_structure():
    """Crea una estructura de carpetas de ejemplo"""
    for category in CATEGORY_INFO.keys():
        if category == "otros":
            continue
        
        path = os.path.join(DOCS_DIR, category)
        os.makedirs(path, exist_ok=True)
        
        # Crear archivo README
        readme_path = os.path.join(path, "README.md")
        if not os.path.exists(readme_path):
            with open(readme_path, 'w', encoding='utf-8') as f:
                f.write(f"# {CATEGORY_INFO[category]['name']}\n\n")
                f.write(f"Coloca aquí tus documentos de tipo {category}.\n")
    
    print(f"✓ Estructura de carpetas creada en '{DOCS_DIR}/'")

def save_catalog(documents):
    """Guarda el catálogo en formato JSON"""
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(documents, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Catálogo guardado en '{OUTPUT_FILE}'")
    print(f"  Total de documentos: {len(documents)}")
    
    # Mostrar resumen por categoría
    category_count = {}
    for doc in documents:
        cat = doc['category']
        category_count[cat] = category_count.get(cat, 0) + 1
    
    if category_count:
        print("\n📊 Resumen por categoría:")
        for cat, count in sorted(category_count.items()):
            print(f"  • {CATEGORY_INFO[cat]['name']}: {count}")

def main():
    print("=" * 60)
    print("  GENERADOR AUTOMÁTICO DE CATÁLOGO DE DOCUMENTOS")
    print("=" * 60)
    print()
    
    documents = scan_documents()
    
    if not documents:
        print("\n⚠️  No se encontraron documentos PDF.")
        print(f"   Coloca tus archivos PDF en la carpeta '{DOCS_DIR}/'")
        print("   organizados por categorías (leyes, normas, proyectos, etc.)")
    else:
        save_catalog(documents)
        print("\n💡 Sugerencia: Revisa y personaliza las descripciones en catalog.json")
        print("   Las descripciones personalizadas se preservarán en futuras ejecuciones.")
    
    print("\n✨ ¡Proceso completado!")

if __name__ == "__main__":
    main()
