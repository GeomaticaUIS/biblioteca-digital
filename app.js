// Global state
let allDocuments = [];
let filteredDocuments = [];
let currentCategory = 'all';

// Category color mapping (soporta tipos de archivo y categorías personalizadas)
const categoryColors = {
    // Tipos de archivo comunes
    'pdf': { main: '#c7522a', light: '#e67e4e' },
    'word': { main: '#2563b3', light: '#3b82f6' },
    'excel': { main: '#059669', light: '#10b981' },
    'powerpoint': { main: '#f59e0b', light: '#fbbf24' },
    'texto': { main: '#6b7280', light: '#9ca3af' },
    'archivo': { main: '#8b5cf6', light: '#a78bfa' },
    // Tipos GIS/ArcGIS
    'gis': { main: '#16a34a', light: '#22c55e' },
    'arcgis': { main: '#0ea5e9', light: '#38bdf8' },
    'geodatabase': { main: '#0891b2', light: '#06b6d4' },
    'raster': { main: '#84cc16', light: '#a3e635' },
    'kml': { main: '#ea580c', light: '#fb923c' },
    'geojson': { main: '#7c3aed', light: '#a78bfa' },
    'gpx': { main: '#dc2626', light: '#ef4444' },
    // Categorías tradicionales (mantener compatibilidad)
    'leyes': { main: '#c7522a', light: '#e67e4e' },
    'normas': { main: '#2563b3', light: '#3b82f6' },
    'proyectos': { main: '#8b5cf6', light: '#a78bfa' },
    'academicos': { main: '#059669', light: '#10b981' },
    'default': { main: '#6b7280', light: '#9ca3af' }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadDocuments();
    setupEventListeners();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Event Listeners
function setupEventListeners() {
    const themeToggle = document.getElementById('themeToggle');
    const searchInput = document.getElementById('searchInput');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');

    themeToggle.addEventListener('click', toggleTheme);
    searchInput.addEventListener('input', handleSearch);
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
}

// Load Documents
async function loadDocuments() {
    try {
        // Try to fetch catalog.json
        const response = await fetch('catalog.json');
        
        if (!response.ok) {
            // If catalog doesn't exist, load sample data
            allDocuments = getSampleDocuments();
        } else {
            allDocuments = await response.json();
        }

        filteredDocuments = allDocuments;
        renderCategories();
        renderDocuments();
        updateResultCount();
        hideLoading();
    } catch (error) {
        console.error('Error loading documents:', error);
        // Load sample data as fallback
        allDocuments = getSampleDocuments();
        filteredDocuments = allDocuments;
        renderCategories();
        renderDocuments();
        updateResultCount();
        hideLoading();
    }
}

// Sample Documents (for demonstration)
function getSampleDocuments() {
    return [
        {
            id: 1,
            title: "Ley 1819 de 2016 - Reforma Tributaria",
            description: "Reforma tributaria estructural que modifica el sistema impositivo colombiano, incluyendo cambios en renta, IVA y procedimientos tributarios.",
            category: "leyes",
            path: "docs/leyes/ley-1819-2016.pdf",
            fileType: "pdf",
            size: "2.4 MB",
            date: "2024-03-15",
            tags: ["tributario", "reforma", "impuestos"]
        },
        {
            id: 2,
            title: "NTC-ISO 9001:2015 - Sistemas de Gestión de Calidad",
            description: "Norma técnica colombiana sobre requisitos para sistemas de gestión de calidad en organizaciones.",
            category: "normas",
            path: "docs/normas/ntc-iso-9001-2015.pdf",
            fileType: "pdf",
            size: "1.8 MB",
            date: "2024-02-20",
            tags: ["calidad", "ISO", "gestión"]
        },
        {
            id: 3,
            title: "Proyecto de Investigación - IA en Educación",
            description: "Análisis del impacto de la inteligencia artificial en metodologías educativas modernas y su aplicación en el aula.",
            category: "proyectos",
            path: "docs/proyectos/ia-educacion.pdf",
            fileType: "pdf",
            size: "3.2 MB",
            date: "2024-03-10",
            tags: ["IA", "educación", "investigación"]
        },
        {
            id: 4,
            title: "Código Civil Colombiano - Actualizado 2024",
            description: "Compilación actualizada del código civil con las últimas reformas y jurisprudencia relevante.",
            category: "leyes",
            path: "docs/leyes/codigo-civil-2024.pdf",
            fileType: "pdf",
            size: "5.6 MB",
            date: "2024-01-15",
            tags: ["civil", "código", "derecho"]
        },
        {
            id: 5,
            title: "Tesis Doctoral - Energías Renovables en Colombia",
            description: "Análisis técnico-económico del potencial de energías renovables en diferentes regiones del país.",
            category: "academicos",
            path: "docs/academicos/tesis-energias-renovables.pdf",
            fileType: "pdf",
            size: "4.1 MB",
            date: "2024-02-28",
            tags: ["energía", "sostenibilidad", "tesis"]
        },
        {
            id: 6,
            title: "Resolución 0312 de 2019 - MinTrabajo",
            description: "Estándares mínimos del Sistema de Gestión de Seguridad y Salud en el Trabajo.",
            category: "normas",
            path: "docs/normas/resolucion-0312-2019.pdf",
            fileType: "pdf",
            size: "1.5 MB",
            date: "2024-03-05",
            tags: ["SST", "trabajo", "seguridad"]
        }
    ];
}

// Render Categories
function renderCategories() {
    // Extraer tipos de archivo únicos en vez de categorías de carpetas
    const fileTypes = ['all', ...new Set(allDocuments.map(doc => doc.fileTypeDisplay || doc.fileType.toUpperCase()))];
    const filterChips = document.getElementById('filterChips');
    
    filterChips.innerHTML = fileTypes.map(type => {
        const displayName = type === 'all' ? 'Todos' : type;
        return `<button class="chip ${type === currentCategory ? 'active' : ''}" 
                        data-category="${type}"
                        onclick="filterByCategory('${type}')">
                    ${displayName}
                </button>`;
    }).join('');
}

// Filter by Category
function filterByCategory(category) {
    currentCategory = category;
    applyFilters();
}

// Handle Search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    applyFilters(searchTerm);
}

// Apply Filters
function applyFilters(searchTerm = '') {
    filteredDocuments = allDocuments.filter(doc => {
        // Filtrar por tipo de archivo en vez de por categoría de carpeta
        const fileType = doc.fileTypeDisplay || doc.fileType.toUpperCase();
        const matchesCategory = currentCategory === 'all' || fileType === currentCategory;
        
        const matchesSearch = searchTerm === '' || 
            doc.title.toLowerCase().includes(searchTerm) ||
            doc.description.toLowerCase().includes(searchTerm) ||
            (doc.categoryDisplay && doc.categoryDisplay.toLowerCase().includes(searchTerm)) ||
            (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
        
        return matchesCategory && matchesSearch;
    });

    renderDocuments();
    updateResultCount();
    updateActiveChip();
}

// Update Active Chip
function updateActiveChip() {
    document.querySelectorAll('.chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.category === currentCategory);
    });
}

// Render Documents
function renderDocuments() {
    const grid = document.getElementById('documentsGrid');
    const noResults = document.getElementById('noResults');

    if (filteredDocuments.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    noResults.style.display = 'none';

    grid.innerHTML = filteredDocuments.map(doc => createDocumentCard(doc)).join('');
}

// Create Document Card
function createDocumentCard(doc) {
    // Usar fileTypeDisplay para los colores en vez de category
    const fileType = (doc.fileTypeDisplay || doc.fileType).toLowerCase();
    const colors = categoryColors[fileType] || categoryColors.default;
    
    const fileExtension = doc.icon || doc.fileType.toUpperCase();
    const formattedDate = new Date(doc.date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const downloadUrl = doc.downloadUrl || doc.path;
    const source = doc.source === 'google-drive' ? '☁️ Drive' : '📁 GitHub';
    
    // Mostrar la carpeta en el badge, pero usar tipo de archivo para colores
    const categoryName = doc.categoryDisplay || doc.category;

    return `
        <div class="doc-card" 
             onclick="openDocument('${doc.path}', '${doc.title}', '${downloadUrl}')"
             style="--doc-color: ${colors.main}; --doc-color-light: ${colors.light}">
            <div class="doc-header">
                <div class="doc-icon">${fileExtension}</div>
                <span class="doc-category">${categoryName}</span>
            </div>
            <h3 class="doc-title">${doc.title}</h3>
            <p class="doc-description">${doc.description}</p>
            ${doc.tags && doc.tags.length > 0 ? `
                <div class="doc-tags">
                    ${doc.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            <div class="doc-meta">
                <span class="doc-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="9" y1="3" x2="9" y2="21"/>
                    </svg>
                    ${doc.size}
                </span>
                <span class="doc-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ${formattedDate}
                </span>
                ${doc.source ? `
                <span class="doc-meta-item">
                    ${source}
                </span>
                ` : ''}
            </div>
        </div>
    `;
}

// Update Result Count
function updateResultCount() {
    const resultCount = document.getElementById('resultCount');
    const count = filteredDocuments.length;
    const total = allDocuments.length;
    
    if (currentCategory === 'all' && count === total) {
        resultCount.textContent = `${total} documento${total !== 1 ? 's' : ''} en total`;
    } else {
        resultCount.textContent = `${count} de ${total} documento${count !== 1 ? 's' : ''}`;
    }
}

// Open Document
function openDocument(path, title, downloadUrl = null) {
    const modal = document.getElementById('pdfModal');
    const modalTitle = document.getElementById('modalTitle');
    const pdfViewer = document.getElementById('pdfViewer');
    const downloadBtn = document.getElementById('downloadBtn');

    modalTitle.textContent = title;
    
    // Check if it's a Google Drive link
    const isDriveLink = path.includes('drive.google.com');
    
    if (isDriveLink) {
        // Google Drive: load directly
        pdfViewer.src = path;
        downloadBtn.href = downloadUrl || path;
        downloadBtn.style.display = 'inline-flex';
    } else {
        // GitHub: check if file exists first
        fetch(path, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    // File exists, load it
                    pdfViewer.src = path;
                    downloadBtn.href = downloadUrl || path;
                    downloadBtn.style.display = 'inline-flex';
                } else {
                    // File doesn't exist, show custom message
                    showFileNotFound(pdfViewer, title, path);
                    downloadBtn.style.display = 'none';
                }
            })
            .catch(error => {
                // Network error or file not found
                showFileNotFound(pdfViewer, title, path);
                downloadBtn.style.display = 'none';
            });
    }

    downloadBtn.download = title;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Show custom "file not found" message
function showFileNotFound(iframe, title, path) {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const isDark = theme === 'dark';
    
    iframe.srcdoc = `
        <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        background: ${isDark ? '#1a1816' : '#fdfcf9'};
                        color: ${isDark ? '#f5f2ed' : '#1a1614'};
                    }
                    .message {
                        text-align: center;
                        padding: 3rem;
                        max-width: 500px;
                    }
                    .icon {
                        font-size: 5rem;
                        margin-bottom: 1.5rem;
                        opacity: 0.5;
                    }
                    h2 {
                        margin: 0 0 1rem 0;
                        font-size: 1.75rem;
                        font-weight: 600;
                        color: ${isDark ? '#f5f2ed' : '#1a1614'};
                    }
                    p {
                        color: ${isDark ? '#bfb9b3' : '#5c5551'};
                        margin: 0.5rem 0;
                        line-height: 1.6;
                    }
                    .path {
                        background: ${isDark ? '#252321' : '#f5f2ed'};
                        padding: 0.75rem 1rem;
                        border-radius: 8px;
                        font-family: monospace;
                        font-size: 0.875rem;
                        margin: 1.5rem 0;
                        color: ${isDark ? '#8b8783' : '#5c5551'};
                        word-break: break-all;
                    }
                    .suggestion {
                        font-size: 0.875rem;
                        color: ${isDark ? '#8b8783' : '#8b8783'};
                        margin-top: 1.5rem;
                    }
                </style>
            </head>
            <body>
                <div class="message">
                    <div class="icon">📭</div>
                    <h2>Documento no encontrado</h2>
                    <p>El archivo <strong>"${title}"</strong> aún no ha sido subido al repositorio.</p>
                    <div class="path">${path}</div>
                    <p class="suggestion">💡 Sube el archivo PDF a esta ruta en GitHub y regenera el catálogo.</p>
                </div>
            </body>
        </html>
    `;
}

// Close Modal
function closeModal() {
    const modal = document.getElementById('pdfModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Hide Loading
function hideLoading() {
    const loadingState = document.getElementById('loadingState');
    setTimeout(() => {
        loadingState.classList.add('hidden');
    }, 500);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
    if (e.key === '/' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});
