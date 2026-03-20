// Global state
let allDocuments = [];
let filteredDocuments = [];
let currentCategory = 'all';

// Category color mapping
const categoryColors = {
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
    const categories = ['all', ...new Set(allDocuments.map(doc => doc.category))];
    const filterChips = document.getElementById('filterChips');
    
    filterChips.innerHTML = categories.map(cat => {
        const displayName = cat === 'all' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1);
        return `<button class="chip ${cat === currentCategory ? 'active' : ''}" 
                        data-category="${cat}"
                        onclick="filterByCategory('${cat}')">
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
        const matchesCategory = currentCategory === 'all' || doc.category === currentCategory;
        const matchesSearch = searchTerm === '' || 
            doc.title.toLowerCase().includes(searchTerm) ||
            doc.description.toLowerCase().includes(searchTerm) ||
            doc.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
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
    const colors = categoryColors[doc.category] || categoryColors.default;
    const fileExtension = doc.fileType.toUpperCase();
    const formattedDate = new Date(doc.date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return `
        <div class="doc-card" 
             onclick="openDocument('${doc.path}', '${doc.title}')"
             style="--doc-color: ${colors.main}; --doc-color-light: ${colors.light}">
            <div class="doc-header">
                <div class="doc-icon">${fileExtension}</div>
                <span class="doc-category">${doc.category}</span>
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
function openDocument(path, title) {
    const modal = document.getElementById('pdfModal');
    const modalTitle = document.getElementById('modalTitle');
    const pdfViewer = document.getElementById('pdfViewer');
    const downloadBtn = document.getElementById('downloadBtn');

    modalTitle.textContent = title;

    // Construir URL absoluta para GitHub Pages
    const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
    const fullPath = baseUrl + path;

    pdfViewer.src = fullPath;
    downloadBtn.href = fullPath;
    downloadBtn.download = title;
    console.log(path);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
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
