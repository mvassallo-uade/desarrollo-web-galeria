// Galería Lavalle - Interactive Map and Search
class GaleriaMap {
  constructor() {
    this.locales = [];
    this.filteredLocales = [];
    this.selectedLocal = null;
    this.searchInput = null;
    this.mapContainer = null;
    this.localesContainer = null;
    this.resultsAnnouncer = null;
    
    this.init();
  }

  async init() {
    try {
      await this.loadLocales();
      this.setupElements();
      this.setupEventListeners();
      this.renderMap();
      this.renderLocalesList();
      this.setupAccessibility();
    } catch (error) {
      console.error('Error initializing map:', error);
      this.showError('Error al cargar los datos de los locales');
    }
  }

  async loadLocales() {
    try {
      const response = await fetch('./data/locales.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.locales = await response.json();
      this.filteredLocales = [...this.locales];
    } catch (error) {
      console.error('Error loading locales:', error);
      throw error;
    }
  }

  setupElements() {
    this.searchInput = document.getElementById('search-locales');
    this.mapContainer = document.getElementById('map-container');
    this.localesContainer = document.getElementById('locales-list');
    this.resultsAnnouncer = document.getElementById('search-results-announcer');
    
    // Create results announcer if it doesn't exist
    if (!this.resultsAnnouncer) {
      this.resultsAnnouncer = document.createElement('div');
      this.resultsAnnouncer.id = 'search-results-announcer';
      this.resultsAnnouncer.setAttribute('aria-live', 'polite');
      this.resultsAnnouncer.setAttribute('aria-atomic', 'true');
      this.resultsAnnouncer.className = 'sr-only';
      document.body.appendChild(this.resultsAnnouncer);
    }
  }

  setupEventListeners() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
      this.searchInput.addEventListener('keydown', this.handleSearchKeydown.bind(this));
    }

    // Reset search button
    const resetButton = document.getElementById('reset-search');
    if (resetButton) {
      resetButton.addEventListener('click', this.resetSearch.bind(this));
    }

    // Filter buttons
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
      button.addEventListener('click', this.handleFilter.bind(this));
    });
  }

  setupAccessibility() {
    // Add ARIA labels and descriptions
    if (this.searchInput) {
      this.searchInput.setAttribute('aria-describedby', 'search-help');
      
      // Create search help text if it doesn't exist
      if (!document.getElementById('search-help')) {
        const helpText = document.createElement('div');
        helpText.id = 'search-help';
        helpText.className = 'sr-only';
        helpText.textContent = 'Busca locales por nombre o rubro. Los resultados se actualizarán automáticamente.';
        this.searchInput.parentNode.appendChild(helpText);
      }
    }

    // Add keyboard navigation for map pins
    this.setupMapKeyboardNavigation();
  }

  setupMapKeyboardNavigation() {
    const mapPins = document.querySelectorAll('.map-pin');
    mapPins.forEach((pin, index) => {
      pin.setAttribute('tabindex', '0');
      pin.setAttribute('role', 'button');
      pin.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectLocal(pin.dataset.localId);
        }
        // Arrow key navigation
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const nextPin = mapPins[index + 1] || mapPins[0];
          nextPin.focus();
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prevPin = mapPins[index - 1] || mapPins[mapPins.length - 1];
          prevPin.focus();
        }
      });
    });
  }

  handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    this.filterLocales(query);
  }

  handleSearchKeydown(event) {
    if (event.key === 'Escape') {
      this.resetSearch();
    }
  }

  handleFilter(event) {
    const filter = event.target.dataset.filter;
    
    // Update active filter button
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');

    if (filter === 'all') {
      this.filteredLocales = [...this.locales];
    } else {
      this.filteredLocales = this.locales.filter(local => 
        local.rubro.toLowerCase() === filter.toLowerCase()
      );
    }

    this.renderLocalesList();
    this.updateMapPins();
    this.announceResults();
  }

  filterLocales(query) {
    if (!query) {
      this.filteredLocales = [...this.locales];
    } else {
      this.filteredLocales = this.locales.filter(local => 
        local.nombre.toLowerCase().includes(query) ||
        local.rubro.toLowerCase().includes(query) ||
        local.ubicacion.toLowerCase().includes(query)
      );
    }

    this.renderLocalesList();
    this.updateMapPins();
    this.announceResults();
  }

  resetSearch() {
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    
    // Reset filter buttons
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector('[data-filter="all"]')?.classList.add('active');

    this.filteredLocales = [...this.locales];
    this.renderLocalesList();
    this.updateMapPins();
    this.selectedLocal = null;
    this.updateMapSelection();
    
    this.resultsAnnouncer.textContent = 'Búsqueda reiniciada. Mostrando todos los locales.';
  }

  announceResults() {
    const count = this.filteredLocales.length;
    const message = count === 0 
      ? 'No se encontraron locales que coincidan con la búsqueda'
      : count === 1 
        ? 'Se encontró 1 local'
        : `Se encontraron ${count} locales`;
    
    this.resultsAnnouncer.textContent = message;
  }

  renderMap() {
    if (!this.mapContainer) return;

    const mapSVG = this.createMapSVG();
    this.mapContainer.innerHTML = mapSVG;
    
    // Add event listeners to pins
    this.setupMapPinListeners();
  }

  createMapSVG() {
    const pins = this.locales.map(local => 
      `<g class="map-pin" data-local-id="${local.id}" tabindex="0" role="button" 
          aria-label="Local ${local.nombre} en ${local.ubicacion}">
        <circle cx="${local.x}%" cy="${local.y}%" r="8" 
                fill="#1e40af" stroke="white" stroke-width="2"/>
        <text x="${local.x}%" y="${local.y}%" dy="0.35em" 
              text-anchor="middle" fill="white" font-size="10" font-weight="bold">
          ${local.id === 'focuz' ? 'F' : local.id === 'game-store' ? 'G' : 'S'}
        </text>
      </g>`
    ).join('');

    return `
      <svg class="map-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
           role="img" aria-label="Mapa interactivo de la galería">
        <!-- Gallery floor plan background -->
        <rect width="100" height="100" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        
        <!-- Pasillo A -->
        <rect x="10" y="20" width="35" height="60" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
        <text x="27.5" y="15" text-anchor="middle" font-size="8" fill="#64748b">Pasillo A</text>
        
        <!-- Pasillo B -->
        <rect x="55" y="20" width="35" height="60" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
        <text x="72.5" y="15" text-anchor="middle" font-size="8" fill="#64748b">Pasillo B</text>
        
        <!-- Central area -->
        <rect x="45" y="30" width="10" height="40" fill="#ddd6fe" stroke="#a78bfa" stroke-width="1"/>
        <text x="50" y="27" text-anchor="middle" font-size="6" fill="#7c3aed">Centro</text>
        
        <!-- Entrance -->
        <rect x="45" y="85" width="10" height="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="1"/>
        <text x="50" y="92" text-anchor="middle" font-size="6" fill="#d97706">Entrada</text>
        
        <!-- Store pins -->
        ${pins}
      </svg>
    `;
  }

  setupMapPinListeners() {
    const pins = document.querySelectorAll('.map-pin');
    pins.forEach(pin => {
      pin.addEventListener('click', () => {
        const localId = pin.dataset.localId;
        this.selectLocal(localId);
      });

      pin.addEventListener('mouseenter', () => {
        this.highlightLocal(pin.dataset.localId);
      });

      pin.addEventListener('mouseleave', () => {
        this.removeHighlight();
      });
    });
  }

  selectLocal(localId) {
    this.selectedLocal = localId;
    const local = this.locales.find(l => l.id === localId);
    
    if (local) {
      this.updateMapSelection();
      this.showLocalDetails(local);
      this.scrollToLocal(localId);
      
      // Announce selection for screen readers
      this.resultsAnnouncer.textContent = `Seleccionado: ${local.nombre}, ${local.rubro}`;
    }
  }

  highlightLocal(localId) {
    // Remove previous highlights
    this.removeHighlight();
    
    // Highlight map pin
    const pin = document.querySelector(`[data-local-id="${localId}"]`);
    if (pin) {
      pin.classList.add('highlighted');
      const circle = pin.querySelector('circle');
      if (circle) {
        circle.setAttribute('fill', '#f59e0b');
        circle.setAttribute('r', '10');
      }
    }

    // Highlight card
    const card = document.querySelector(`[data-local-card="${localId}"]`);
    if (card) {
      card.classList.add('highlighted');
    }
  }

  removeHighlight() {
    // Remove map pin highlights
    document.querySelectorAll('.map-pin.highlighted').forEach(pin => {
      pin.classList.remove('highlighted');
      const circle = pin.querySelector('circle');
      if (circle && pin.dataset.localId !== this.selectedLocal) {
        circle.setAttribute('fill', '#1e40af');
        circle.setAttribute('r', '8');
      }
    });

    // Remove card highlights
    document.querySelectorAll('.card.highlighted').forEach(card => {
      card.classList.remove('highlighted');
    });
  }

  updateMapSelection() {
    // Reset all pins
    document.querySelectorAll('.map-pin').forEach(pin => {
      pin.classList.remove('selected');
      const circle = pin.querySelector('circle');
      if (circle) {
        circle.setAttribute('fill', '#1e40af');
        circle.setAttribute('r', '8');
      }
    });

    // Highlight selected pin
    if (this.selectedLocal) {
      const selectedPin = document.querySelector(`[data-local-id="${this.selectedLocal}"]`);
      if (selectedPin) {
        selectedPin.classList.add('selected');
        const circle = selectedPin.querySelector('circle');
        if (circle) {
          circle.setAttribute('fill', '#dc2626');
          circle.setAttribute('r', '12');
        }
      }
    }
  }

  updateMapPins() {
    const allPins = document.querySelectorAll('.map-pin');
    
    allPins.forEach(pin => {
      const localId = pin.dataset.localId;
      const isVisible = this.filteredLocales.some(local => local.id === localId);
      
      if (isVisible) {
        pin.style.display = 'block';
        pin.style.opacity = '1';
      } else {
        pin.style.display = 'none';
        pin.style.opacity = '0.3';
      }
    });
  }

  renderLocalesList() {
    if (!this.localesContainer) return;

    if (this.filteredLocales.length === 0) {
      this.localesContainer.innerHTML = `
        <div class="no-results">
          <p>No se encontraron locales que coincidan con tu búsqueda.</p>
          <button type="button" class="btn btn-primary" onclick="galeriaMap.resetSearch()">
            Ver todos los locales
          </button>
        </div>
      `;
      return;
    }

    const localesHTML = this.filteredLocales.map(local => `
      <article class="card local-card" data-local-card="${local.id}">
        <img src="${local.imagen}" alt="${local.nombre}" loading="lazy">
        <div class="card-content">
          <h3 class="card-title">${local.nombre}</h3>
          <p class="local-rubro">${local.rubro}</p>
          <p class="local-ubicacion">
            <span class="sr-only">Ubicación:</span>
            📍 ${local.ubicacion}
          </p>
          <p class="local-horarios">
            <span class="sr-only">Horarios:</span>
            🕒 ${local.horarios}
          </p>
          ${local.ofertas ? '<span class="ofertas-badge">¡Ofertas disponibles!</span>' : ''}
          
          <div class="local-accesibilidad">
            <span class="sr-only">Características de accesibilidad:</span>
            ${local.accesibilidad.map(item => `<span class="accesibilidad-tag">${item}</span>`).join('')}
          </div>
          
          <div class="local-actions">
            <button type="button" class="btn btn-secondary" 
                    onclick="galeriaMap.selectLocal('${local.id}')"
                    aria-label="Ver ${local.nombre} en el mapa">
              Ver en mapa
            </button>
            <a href="${local.url}" class="btn btn-primary"
               aria-label="Visitar sitio web de ${local.nombre}">
              Visitar sitio
            </a>
          </div>
        </div>
      </article>
    `).join('');

    this.localesContainer.innerHTML = localesHTML;
    
    // Add hover listeners to cards
    this.setupCardListeners();
  }

  setupCardListeners() {
    const cards = document.querySelectorAll('.local-card');
    cards.forEach(card => {
      const localId = card.dataset.localCard;
      
      card.addEventListener('mouseenter', () => {
        this.highlightLocal(localId);
      });

      card.addEventListener('mouseleave', () => {
        this.removeHighlight();
      });
    });
  }

  showLocalDetails(local) {
    // This could open a modal or update a details panel
    console.log('Showing details for:', local);
  }

  scrollToLocal(localId) {
    const card = document.querySelector(`[data-local-card="${localId}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  showError(message) {
    if (this.localesContainer) {
      this.localesContainer.innerHTML = `
        <div class="error-message">
          <p>⚠️ ${message}</p>
          <button type="button" class="btn btn-primary" onclick="location.reload()">
            Intentar de nuevo
          </button>
        </div>
      `;
    }
  }

  // Utility function for debouncing search input
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize the map when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're on the locales page
  if (document.getElementById('map-container')) {
    window.galeriaMap = new GaleriaMap();
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GaleriaMap;
}
