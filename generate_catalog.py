#!/usr/bin/env python3
"""
Escáner automático de Google Drive
Escanea una carpeta pública de Drive y genera catalog.json
organizando por subcarpetas y tipos de archivo
"""

import json
import re
from datetime import datetime

# ============================================
# CONFIGURACIÓN
# ============================================

# Mapeo de extensiones a tipos de archivo
FILE_TYPE_MAP = {
    'pdf': {'type': 'PDF', 'icon': '📄', 'color': '#c7522a'},
    'doc': {'type': 'Word', 'icon': '📝', 'color': '#2563b3'},
    'docx': {'type': 'Word', 'icon': '📝', 'color': '#2563b3'},
    'xls': {'type': 'Excel', 'icon': '📊', 'color': '#059669'},
    'xlsx': {'type': 'Excel', 'icon': '📊', 'color': '#059669'},
    'ppt': {'type': 'PowerPoint', 'icon': '📽️', 'color': '#f59e0b'},
    'pptx': {'type': 'PowerPoint', 'icon': '📽️', 'color': '#f59e0b'},
    'txt': {'type': 'Texto', 'icon': '📃', 'color': '#6b7280'},
    'zip': {'type': 'Archivo', 'icon': '🗜️', 'color': '#8b5cf6'},
    'rar': {'type': 'Archivo', 'icon': '🗜️', 'color': '#8b5cf6'},
}

# ============================================
# OPCIÓN 1: ESCANEO CON LISTA MANUAL
# ============================================

def scan_drive_manual():
    """
    Escanea Drive usando una lista que tú proporcionas.
    Cada entrada incluye: nombre, carpeta, file_id, tipo
    """
    
    print("=" * 70)
    print("  ESCÁNER DE GOOGLE DRIVE - MODO MANUAL")
    print("=" * 70)
    print()
    print("📋 Para cada archivo, necesito:")
    print("   1. Nombre del archivo (con extensión)")
    print("   2. Carpeta/subcarpeta donde está")
    print("   3. File ID de Google Drive")
    print()
    print("💡 Tip: Abre cada archivo en Drive y copia el ID de la URL")
    print("   URL: https://drive.google.com/file/d/FILE_ID_AQUI/view")
    print()
    print("Escribe 'fin' en el nombre para terminar")
    print()
    
    documents = []
    doc_id = 1
    
    while True:
        print(f"\n--- Archivo #{doc_id} ---")
        
        filename = input("Nombre del archivo (con extensión): ").strip()
        if filename.lower() == 'fin':
            break
        
        folder = input("Carpeta/subcarpeta: ").strip()
        file_id = 1nLxpKoFpUmccmbNJ-gvuseXlk2HwdPfO ##input("File ID: ").strip()
        description = input("Descripción (opcional): ").strip()
        
        # Detectar tipo de archivo por extensión
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'pdf'
        file_info = FILE_TYPE_MAP.get(ext, FILE_TYPE_MAP['pdf'])
        
        # Generar URLs
        view_url = f"https://drive.google.com/file/d/{file_id}/preview"
        download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
        
        # Usar carpeta como categoría
        category = folder.lower().replace(' ', '-').replace('/', '-')
        
        doc = {
            "id": doc_id,
            "title": filename.rsplit('.', 1)[0],  # Sin extensión
            "description": description or f"Documento de tipo {file_info['type']} en {folder}",
            "category": category,
            "categoryDisplay": folder,  # Nombre legible de la carpeta
            "path": view_url,
            "downloadUrl": download_url,
            "fileType": ext,
            "fileTypeDisplay": file_info['type'],
            "icon": file_info['icon'],
            "size": "Desconocido",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "tags": [file_info['type'], folder],
            "source": "google-drive"
        }
        
        documents.append(doc)
        print(f"✓ {file_info['icon']} Agregado: {filename} ({file_info['type']})")
        doc_id += 1
    
    return documents


# ============================================
# OPCIÓN 2: DESDE CSV MEJORADO
# ============================================

def scan_drive_from_csv(csv_file="drive_structure.csv"):
    """
    Lee CSV con estructura completa de Drive.
    
    Formato CSV:
    archivo,carpeta,file_id,descripcion,tamaño
    """
    import csv
    
    documents = []
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for i, row in enumerate(reader, 1):
                filename = row['archivo'].strip()
                folder = row['carpeta'].strip()
                file_id = row['file_id'].strip()
                
                # Detectar extensión y tipo
                ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'pdf'
                file_info = FILE_TYPE_MAP.get(ext, FILE_TYPE_MAP['pdf'])
                
                # Categoría basada en carpeta
                category = folder.lower().replace(' ', '-').replace('/', '-')
                
                doc = {
                    "id": i,
                    "title": filename.rsplit('.', 1)[0],
                    "description": row.get('descripcion', '').strip() or f"Archivo {file_info['type']} - {folder}",
                    "category": category,
                    "categoryDisplay": folder,
                    "path": f"https://drive.google.com/file/d/{file_id}/preview",
                    "downloadUrl": f"https://drive.google.com/uc?export=download&id={file_id}",
                    "fileType": ext,
                    "fileTypeDisplay": file_info['type'],
                    "icon": file_info['icon'],
                    "size": row.get('tamaño', 'Desconocido').strip(),
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "tags": [file_info['type'], folder],
                    "source": "google-drive"
                }
                
                documents.append(doc)
                print(f"✓ {file_info['icon']} {filename} → {folder}")
        
        return documents
        
    except FileNotFoundError:
        print(f"⚠️  Archivo {csv_file} no encontrado")
        print()
        print("Crea un CSV con este formato:")
        print()
        print("archivo,carpeta,file_id,descripcion,tamaño")
        print('documento.pdf,Tesis 2024,1ABC...XYZ,"Mi tesis doctoral",3.5 MB')
        print('presentacion.pptx,Proyectos/IA,2DEF...ABC,"Presentación IA",2.1 MB')
        print()
        return None


# ============================================
# OPCIÓN 3: DESDE TXT CON URLS
# ============================================

def scan_drive_from_urls(txt_file="drive_urls.txt"):
    """
    Lee un archivo TXT con URLs de Drive (una por línea).
    Extrae automáticamente los file IDs.
    """
    
    try:
        with open(txt_file, 'r', encoding='utf-8') as f:
            urls = [line.strip() for line in f if line.strip()]
        
        print(f"\n✓ Encontradas {len(urls)} URLs en {txt_file}")
        print()
        
        documents = []
        
        for i, url in enumerate(urls, 1):
            # Extraer file_id
            match = re.search(r'/d/([a-zA-Z0-9_-]+)', url)
            if not match:
                print(f"⚠️  URL inválida #{i}: {url}")
                continue
            
            file_id = match.group(1)
            
            print(f"\n--- Archivo #{i} / {len(urls)} ---")
            print(f"File ID: {file_id}")
            
            filename = input("Nombre (con extensión): ").strip()
            folder = input("Carpeta: ").strip()
            description = input("Descripción (opcional): ").strip()
            size = input("Tamaño (ej: 2.5 MB): ").strip() or "Desconocido"
            
            # Detectar tipo
            ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'pdf'
            file_info = FILE_TYPE_MAP.get(ext, FILE_TYPE_MAP['pdf'])
            
            category = folder.lower().replace(' ', '-').replace('/', '-')
            
            doc = {
                "id": i,
                "title": filename.rsplit('.', 1)[0],
                "description": description or f"{file_info['type']} - {folder}",
                "category": category,
                "categoryDisplay": folder,
                "path": f"https://drive.google.com/file/d/{file_id}/preview",
                "downloadUrl": f"https://drive.google.com/uc?export=download&id={file_id}",
                "fileType": ext,
                "fileTypeDisplay": file_info['type'],
                "icon": file_info['icon'],
                "size": size,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "tags": [file_info['type'], folder],
                "source": "google-drive"
            }
            
            documents.append(doc)
            print(f"✓ {file_info['icon']} Agregado")
        
        return documents
        
    except FileNotFoundError:
        print(f"⚠️  Archivo {txt_file} no encontrado")
        print()
        print("Crea un archivo TXT con una URL por línea:")
        print("https://drive.google.com/file/d/1ABC.../view")
        print("https://drive.google.com/file/d/2DEF.../view")
        print()
        return None


# ============================================
# OPCIÓN 4: PEGAR URLS INTERACTIVO
# ============================================

def scan_drive_interactive():
    """
    Modo interactivo: pegas las URLs y completas la info.
    """
    
    print("=" * 70)
    print("  ESCÁNER INTERACTIVO DE GOOGLE DRIVE")
    print("=" * 70)
    print()
    print("📎 Paso 1: Pega las URLs de Google Drive")
    print("   (una por línea, 'fin' para terminar)")
    print()
    
    urls = []
    while True:
        url = input("> ").strip()
        if url.lower() == 'fin':
            break
        if url:
            urls.append(url)
    
    if not urls:
        print("⚠️  No se ingresaron URLs")
        return None
    
    print(f"\n✓ {len(urls)} archivos detectados")
    print()
    
    documents = []
    
    for i, url in enumerate(urls, 1):
        # Extraer file_id
        match = re.search(r'/d/([a-zA-Z0-9_-]+)', url)
        if not match:
            print(f"⚠️  URL inválida: {url}")
            continue
        
        file_id = match.group(1)
        
        print(f"\n--- Archivo {i}/{len(urls)} ---")
        print(f"URL: {url[:50]}...")
        
        filename = input("📄 Nombre (con extensión): ").strip()
        folder = input("📁 Carpeta/subcarpeta: ").strip()
        description = input("📝 Descripción: ").strip()
        size = input("📏 Tamaño (ej: 2.5 MB): ").strip() or "Desconocido"
        
        # Detectar tipo
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'pdf'
        file_info = FILE_TYPE_MAP.get(ext, FILE_TYPE_MAP['pdf'])
        
        category = folder.lower().replace(' ', '-').replace('/', '-')
        
        doc = {
            "id": i,
            "title": filename.rsplit('.', 1)[0],
            "description": description or f"{file_info['type']} en {folder}",
            "category": category,
            "categoryDisplay": folder,
            "path": f"https://drive.google.com/file/d/{file_id}/preview",
            "downloadUrl": f"https://drive.google.com/uc?export=download&id={file_id}",
            "fileType": ext,
            "fileTypeDisplay": file_info['type'],
            "icon": file_info['icon'],
            "size": size,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "tags": [file_info['type'], folder],
            "source": "google-drive"
        }
        
        documents.append(doc)
        print(f"✓ {file_info['icon']} {filename} agregado")
    
    return documents


# ============================================
# GUARDAR CATÁLOGO
# ============================================

def save_catalog(documents, output_file="catalog.json"):
    """Guarda el catálogo con estadísticas"""
    
    if not documents:
        print("\n⚠️  No hay documentos para guardar")
        return
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(documents, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*70}")
    print(f"✅ CATÁLOGO GUARDADO: {output_file}")
    print(f"{'='*70}")
    print(f"\n📊 Total de documentos: {len(documents)}")
    
    # Estadísticas por tipo de archivo
    type_count = {}
    for doc in documents:
        file_type = doc['fileTypeDisplay']
        type_count[file_type] = type_count.get(file_type, 0) + 1
    
    print("\n📁 Por tipo de archivo:")
    for file_type, count in sorted(type_count.items()):
        icon = next((v['icon'] for v in FILE_TYPE_MAP.values() if v['type'] == file_type), '📄')
        print(f"   {icon} {file_type}: {count}")
    
    # Estadísticas por carpeta
    folder_count = {}
    for doc in documents:
        folder = doc.get('categoryDisplay', doc['category'])
        folder_count[folder] = folder_count.get(folder, 0) + 1
    
    print("\n📂 Por carpeta:")
    for folder, count in sorted(folder_count.items()):
        print(f"   📁 {folder}: {count}")


# ============================================
# CREAR EJEMPLOS
# ============================================

def create_example_csv():
    """Crea CSV de ejemplo"""
    
    content = """archivo,carpeta,file_id,descripcion,tamaño
proyecto-final.pdf,Tesis 2024,1ABCxyz123,"Proyecto final de grado",3.5 MB
presentacion.pptx,Presentaciones/IA,2DEFabc456,"Presentación sobre IA",2.1 MB
datos.xlsx,Análisis/Estadísticas,3GHIdef789,"Base de datos principal",1.8 MB
documento.docx,Informes,4JKLghi012,"Informe mensual",850 KB
"""
    
    with open("drive_structure.csv", 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Archivo creado: drive_structure.csv")
    print("   Edítalo con tus datos y ejecuta opción 2")


def create_example_txt():
    """Crea TXT de ejemplo"""
    
    content = """https://drive.google.com/file/d/1ABCxyz123def456ghi789/view
https://drive.google.com/file/d/2DEFabc456ghi789jkl012/view
https://drive.google.com/file/d/3GHIdef789jkl012mno345/view
"""
    
    with open("drive_urls.txt", 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Archivo creado: drive_urls.txt")
    print("   Agrega tus URLs y ejecuta opción 3")


# ============================================
# MENÚ PRINCIPAL
# ============================================

def main():
    print()
    print("╔" + "═" * 68 + "╗")
    print("║" + " " * 15 + "ESCÁNER AUTOMÁTICO DE GOOGLE DRIVE" + " " * 19 + "║")
    print("╚" + "═" * 68 + "╝")
    print()
    print("Organiza automáticamente por:")
    print("  • 📁 Subcarpetas de Drive")
    print("  • 📄 Tipo de archivo (PDF, Word, Excel, PowerPoint)")
    print()
    print("Selecciona el método:")
    print()
    print("  1. 📝 Entrada manual (ingresa info de cada archivo)")
    print("  2. 📊 Desde CSV (drive_structure.csv)")
    print("  3. 📎 Desde TXT con URLs (drive_urls.txt)")
    print("  4. 🔗 Pegar URLs interactivamente")
    print("  5. 📄 Crear archivos de ejemplo")
    print()
    
    opcion = input("Opción (1-5): ").strip()
    
    documents = None
    
    if opcion == "1":
        documents = scan_drive_manual()
    elif opcion == "2":
        documents = scan_drive_from_csv()
    elif opcion == "3":
        documents = scan_drive_from_urls()
    elif opcion == "4":
        documents = scan_drive_interactive()
    elif opcion == "5":
        print("\n¿Qué archivo de ejemplo crear?")
        print("  1. CSV (drive_structure.csv)")
        print("  2. TXT (drive_urls.txt)")
        sub_opcion = input("Opción: ").strip()
        if sub_opcion == "1":
            create_example_csv()
        elif sub_opcion == "2":
            create_example_txt()
        return
    else:
        print("⚠️  Opción inválida")
        return
    
    if documents:
        save_catalog(documents)
        print("\n" + "="*70)
        print("🚀 SIGUIENTE PASO:")
        print("   Sube catalog.json a GitHub y actualiza app.js")
        print("="*70)
        print()


if __name__ == "__main__":
    main()
