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

def get_file_size(filepath):
    """Obtiene el tamaño del archivo en formato legible"""
    size = os.path.getsize(filepath)
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"

def guess_category(filename):
    """Intenta adivinar la categoría basándose en el nombre del archivo"""
    filename_lower = filename.lower()
    
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in filename_lower for keyword in keywords):
            return category
    
    return "otros"

def extract_tags(filename, description=""):
    """Extrae tags del nombre de archivo y descripción"""
    tags = []
    text = (filename + " " + description).lower()
    
    # Lista de palabras clave comunes
    keywords = [
        "tributario", "reforma", "impuestos", "calidad", "ISO", "gestión",
        "IA", "educación", "investigación", "civil", "código", "derecho",
        "energía", "sostenibilidad", "tesis", "SST", "trabajo", "seguridad",
        "ambiental", "laboral", "comercio", "penal", "procesal"
    ]
    
    for keyword in keywords:
        if keyword.lower() in text:
            tags.append(keyword)
    
    return tags[:5]  # Máximo 5 tags

def scan_documents():
    """Escanea la carpeta docs/ y genera la estructura de datos"""
    documents = []
    doc_id = 1
    
    if not os.path.exists(DOCS_DIR):
        print(f"⚠️  La carpeta '{DOCS_DIR}' no existe. Creando estructura de ejemplo...")
        create_example_structure()
        return []
    
    # Recorrer todos los archivos en docs/
    for root, dirs, files in os.walk(DOCS_DIR):
        for filename in files:
            # Solo procesar PDFs (puedes agregar más extensiones)
            if not filename.lower().endswith('.pdf'):
                continue
            
            filepath = os.path.join(root, filename)
            relative_path = os.path.relpath(filepath, '.')
            
            # Extraer categoría del path (docs/categoria/archivo.pdf)
            path_parts = Path(relative_path).parts
            category = path_parts[1] if len(path_parts) > 2 else "otros"
            
            # Generar título limpio
            title = filename.replace('.pdf', '').replace('_', ' ').replace('-', ' ')
            title = ' '.join(word.capitalize() for word in title.split())
            
            # Descripción automática (puedes personalizarla después)
            description = f"Documento en categoría {category}. Actualiza esta descripción en catalog.json"
            
            # Crear entrada del documento
            doc = {
                "id": doc_id,
                "title": title,
                "description": description,
                "category": category,
                "path": relative_path.replace('\\', '/'),  # Normalizar path
                "fileType": "pdf",
                "size": get_file_size(filepath),
                "date": datetime.fromtimestamp(os.path.getmtime(filepath)).strftime("%Y-%m-%d"),
                "tags": extract_tags(filename, description)
            }
            
            documents.append(doc)
            doc_id += 1
            print(f"✓ Procesado: {filename}")
    
    return documents

def create_example_structure():
    """Crea una estructura de carpetas de ejemplo"""
    categories = ["leyes", "normas", "proyectos", "academicos", "otros"]
    
    for category in categories:
        path = os.path.join(DOCS_DIR, category)
        os.makedirs(path, exist_ok=True)
        
        # Crear archivo README
        readme_path = os.path.join(path, "README.md")
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(f"# {category.capitalize()}\n\n")
            f.write(f"Coloca aquí tus documentos de tipo {category}.\n")
    
    print(f"✓ Estructura de carpetas creada en '{DOCS_DIR}/'")

def save_catalog(documents):
    """Guarda el catálogo en formato JSON"""
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(documents, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Catálogo guardado en '{OUTPUT_FILE}'")
    print(f"  Total de documentos: {len(documents)}")

def main():
    print("=" * 50)
    print("  GENERADOR DE CATÁLOGO DE DOCUMENTOS")
    print("=" * 50)
    print()
    
    documents = scan_documents()
    
    if not documents:
        print("\n⚠️  No se encontraron documentos PDF.")
        print(f"   Coloca tus archivos PDF en la carpeta '{DOCS_DIR}/'")
        print("   organizados por categorías (leyes, normas, proyectos, etc.)")
    else:
        save_catalog(documents)
        print("\n💡 Sugerencia: Revisa y personaliza las descripciones en catalog.json")
    
    print("\n✨ ¡Proceso completado!")

if __name__ == "__main__":
    main()
