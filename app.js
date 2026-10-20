// Global state
let allDocuments = [];
let filteredDocuments = [];
let currentCategory = 'all';
let currentSearchTerm = '';
let catalogManifest = null;
let catalogManifestUrl = null;
let nextShardIndex = 0;
let visibleDocumentCount = 0;
let currentShardLoadPromise = null;
let loadAllPromise = null;
let searchDebounceTimer = null;
let searchRequestId = 0;

const DOCUMENTS_PER_PAGE = 50;
const SHARD_LOAD_CONCURRENCY = 4;
const shardPromises = new Map();
const pendingShards = new Map();

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
    const loadMoreButton = document.getElementById('loadMoreButton');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');

    themeToggle.addEventListener('click', toggleTheme);
    searchInput.addEventListener('input', handleSearch);
    loadMoreButton.addEventListener('click', loadMoreDocuments);
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
}

// Load Documents
async function loadDocuments() {
    try {
        catalogManifestUrl = new URL('catalog/search/manifest.json', document.baseURI);
        const manifestResponse = await fetch(catalogManifestUrl);
        if (!manifestResponse.ok) {
            throw new Error(`No se pudo cargar el índice (${manifestResponse.status})`);
        }
        catalogManifest = await manifestResponse.json();
        if (!Array.isArray(catalogManifest.shards) || catalogManifest.shards.length === 0) {
            throw new Error('El índice no contiene fragmentos de catálogo');
        }

        renderCategories();
        await loadNextShard();
        if (currentSearchTerm || currentCategory !== 'all') {
            await loadAllShards();
        }
        applyFilters(currentSearchTerm);
        hideLoading();
    } catch (error) {
        console.error('Error loading catalog:', error);
        document.getElementById('resultCount').textContent =
            'No se pudo cargar el catálogo. Recarga la página para intentarlo de nuevo.';
        hideLoading();
    }
}

async function fetchCatalogShard(index) {
    if (!shardPromises.has(index)) {
        const shardUrl = new URL(catalogManifest.shards[index], catalogManifestUrl);
        const request = fetch(shardUrl).then(async response => {
            if (!response.ok) {
                throw new Error(`No se pudo cargar ${shardUrl} (${response.status})`);
            }
            if (typeof DecompressionStream !== 'function') {
                throw new Error('Este navegador no admite la descompresión del índice');
            }

            const compressedData = await response.arrayBuffer();
            const decompressedStream = new Blob([compressedData])
                .stream()
                .pipeThrough(new DecompressionStream('gzip'));
            const documents = await new Response(decompressedStream).json();
            if (!Array.isArray(documents)) {
                throw new Error(`El fragmento ${shardUrl} no contiene una lista`);
            }
            return documents;
        });
        shardPromises.set(index, request);
    }

    try {
        return await shardPromises.get(index);
    } catch (error) {
        shardPromises.delete(index);
        throw error;
    }
}

function integrateShard(index, documents) {
    pendingShards.set(index, documents);
    while (pendingShards.has(nextShardIndex)) {
        allDocuments.push(...pendingShards.get(nextShardIndex));
        pendingShards.delete(nextShardIndex);
        nextShardIndex++;
    }
}

async function loadNextShard() {
    if (loadAllPromise) {
        await loadAllPromise;
        return;
    }
    if (currentShardLoadPromise) {
        await currentShardLoadPromise;
        return;
    }
    if (nextShardIndex >= catalogManifest.shards.length) {
        return;
    }

    const loadPromise = (async () => {
        const index = nextShardIndex;
        const documents = await fetchCatalogShard(index);
        integrateShard(index, documents);
    })();
    currentShardLoadPromise = loadPromise;
    try {
        await loadPromise;
    } finally {
        if (currentShardLoadPromise === loadPromise) {
            currentShardLoadPromise = null;
        }
    }
}

async function loadAllShards() {
    if (loadAllPromise) {
        return loadAllPromise;
    }

    loadAllPromise = (async () => {
        if (currentShardLoadPromise) {
            await currentShardLoadPromise;
        }
        while (nextShardIndex < catalogManifest.shards.length) {
            const firstIndex = nextShardIndex;
            const endIndex = Math.min(
                firstIndex + SHARD_LOAD_CONCURRENCY,
                catalogManifest.shards.length
            );
            const shardDocuments = await Promise.all(
                Array.from({ length: endIndex - firstIndex }, (_, offset) =>
                    fetchCatalogShard(firstIndex + offset)
                )
            );
            shardDocuments.forEach((documents, offset) => {
                integrateShard(firstIndex + offset, documents);
            });
            document.getElementById('resultCount').textContent =
                `Preparando búsqueda: ${allDocuments.length.toLocaleString('es-CO')} de ` +
                `${catalogManifest.totalDocuments.toLocaleString('es-CO')} documentos`;
        }
        applyFilters(currentSearchTerm);
    })();

    try {
        await loadAllPromise;
    } finally {
        loadAllPromise = null;
    }
}

// Render Categories
function renderCategories() {
    const filterChips = document.getElementById('filterChips');
    const fileTypes = ['all', ...catalogManifest.fileTypes];
    
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
async function filterByCategory(category) {
    currentCategory = category;
    const requestId = ++searchRequestId;
    if (category !== 'all' && nextShardIndex < catalogManifest.shards.length) {
        document.getElementById('resultCount').textContent = 'Filtrando todo el catálogo...';
        try {
            await loadAllShards();
        } catch (error) {
            console.error('Error loading catalog for category filter:', error);
            document.getElementById('resultCount').textContent =
                'No se pudo completar el filtro. Intenta de nuevo.';
            return;
        }
    }
    if (requestId === searchRequestId) {
        applyFilters(currentSearchTerm);
    }
}

// Handle Search
function handleSearch(e) {
    currentSearchTerm = e.target.value.trim().toLowerCase();
    const requestId = ++searchRequestId;
    clearTimeout(searchDebounceTimer);

    searchDebounceTimer = setTimeout(async () => {
        if (!catalogManifest) {
            return;
        }
        if (currentSearchTerm && nextShardIndex < catalogManifest.shards.length) {
            document.getElementById('resultCount').textContent = 'Buscando en todo el catálogo...';
            try {
                await loadAllShards();
            } catch (error) {
                console.error('Error loading catalog for search:', error);
                document.getElementById('resultCount').textContent =
                    'No se pudo completar la búsqueda. Intenta de nuevo.';
                return;
            }
        }
        if (requestId === searchRequestId) {
            applyFilters(currentSearchTerm);
        }
    }, 300);
}

// Apply Filters
function applyFilters(searchTerm = currentSearchTerm, resetResults = true) {
    filteredDocuments = allDocuments.filter(doc => {
        // Filtrar por tipo de archivo en vez de por categoría de carpeta
        const fileType = doc.fileTypeDisplay || (doc.fileType || '').toUpperCase();
        const matchesCategory = currentCategory === 'all' || fileType === currentCategory;
        const searchText = [
            doc.title,
            doc.category,
            doc.categoryDisplay,
            doc.fileTypeDisplay,
            doc.fileType,
            ...(doc.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();
        const matchesSearch = searchTerm === '' || searchText.includes(searchTerm);
        
        return matchesCategory && matchesSearch;
    });

    renderDocuments(resetResults);
    updateResultCount();
    updateActiveChip();
}

async function loadMoreDocuments() {
    const button = document.getElementById('loadMoreButton');
    if (visibleDocumentCount < filteredDocuments.length) {
        renderDocuments(false);
        return;
    }
    if (nextShardIndex >= catalogManifest.shards.length) {
        return;
    }

    button.disabled = true;
    button.textContent = 'Cargando...';
    try {
        await loadNextShard();
        applyFilters(currentSearchTerm, false);
    } catch (error) {
        console.error('Error loading next catalog shard:', error);
        document.getElementById('resultCount').textContent =
            'No se pudo cargar más documentos. Intenta de nuevo.';
    } finally {
        button.disabled = false;
        button.textContent = 'Mostrar más documentos';
        updateLoadMoreButton();
    }
}

// Update Active Chip
function updateActiveChip() {
    document.querySelectorAll('.chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.category === currentCategory);
    });
}
//convertir valor tamaño a MB o mas
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return "0 B";

    const unidades = ["B", "KB", "MB", "GB", "TB"];
    const k = 1024;

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = bytes / Math.pow(k, i);

    return parseFloat(size.toFixed(2)) + " " + unidades[i];
}

// Render Documents
function renderDocuments(reset = true) {
    const grid = document.getElementById('documentsGrid');
    const noResults = document.getElementById('noResults');

    if (reset) {
        grid.innerHTML = '';
        visibleDocumentCount = 0;
    }

    if (filteredDocuments.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        updateLoadMoreButton();
        return;
    }

    grid.style.display = 'grid';
    noResults.style.display = 'none';
    const nextDocuments = filteredDocuments.slice(
        visibleDocumentCount,
        visibleDocumentCount + DOCUMENTS_PER_PAGE
    );
    grid.insertAdjacentHTML(
        'beforeend',
        nextDocuments.map(doc => createDocumentCard(doc)).join('')
    );
    visibleDocumentCount += nextDocuments.length;
    updateLoadMoreButton();
}

function updateLoadMoreButton() {
    const button = document.getElementById('loadMoreButton');
    const hasMoreResults = visibleDocumentCount < filteredDocuments.length;
    const hasMoreShards = catalogManifest && nextShardIndex < catalogManifest.shards.length;
    button.hidden = !hasMoreResults && !hasMoreShards;
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
    const size = formatFileSize(Number(doc.size || 0));
    //console.log(size);
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
                    📦 Tamaño: ${size}
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
    const total = catalogManifest.totalDocuments;
    const isFiltered = currentCategory !== 'all' || currentSearchTerm !== '';

    if (isFiltered) {
        resultCount.textContent = `${filteredDocuments.length.toLocaleString('es-CO')} resultado` +
            `${filteredDocuments.length !== 1 ? 's' : ''} de ${total.toLocaleString('es-CO')} documentos`;
    } else if (nextShardIndex < catalogManifest.shards.length) {
        resultCount.textContent = `Mostrando ${visibleDocumentCount.toLocaleString('es-CO')} de ` +
            `${total.toLocaleString('es-CO')} documentos`;
    } else {
        resultCount.textContent = `${total.toLocaleString('es-CO')} documentos en total`;
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
