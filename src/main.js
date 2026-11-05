/**
 * EquiDistance — Main Application Controller
 */

import { GlobeScene, CITY_COLORS } from './globe.js';
import {
  EARTH_RADIUS,
  haversineDistance,
  calculateSphericalCircumcenters,
  findMatchingPoints,
  formatCoordinates,
  formatDistance,
  findGreatCircleWaypoints
} from './math.js';
import { MAJOR_CITIES, findNearestPlace, getPoiTypeInfo, getAllPointsOfInterest } from './data/cities.js';
import { CURATED_PLACES } from './data/places.js';
import { searchLocations, reverseGeocode } from './services/geocoding.js';
import { fetchWikipediaSummary } from './services/wikipedia.js';
import { exportToKML, exportToGPX, downloadFile } from './services/exporter.js';

/**
 * Generates 4 diverse random preset options at each reload of the page
 * Exactly 2 options with 2 cities, and 2 options with 3 cities
 */
function generateRandomPresetOptions() {
  if (!MAJOR_CITIES || MAJOR_CITIES.length < 10) return [];

  const pickGroup = (pool, count, minKm) => {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const picked = [];
    for (const city of shuffled) {
      const ok = picked.every(p => haversineDistance(p.lat, p.lon, city.lat, city.lon, 'km') >= minKm);
      if (ok) {
        picked.push({
          name: city.name,
          country: city.country || '',
          lat: city.lat,
          lon: city.lon
        });
        if (picked.length === count) return picked;
      }
    }
    if (picked.length < count) {
      for (const city of shuffled) {
        if (!picked.some(p => p.name === city.name)) {
          picked.push({
            name: city.name,
            country: city.country || '',
            lat: city.lat,
            lon: city.lon
          });
          if (picked.length === count) return picked;
        }
      }
    }
    return picked;
  };

  const presets = [];

  // Option 1: 2 cities
  const pair1 = pickGroup(MAJOR_CITIES, 2, 2800);
  presets.push({
    id: 'rnd-2a',
    citiesCount: 2,
    label: pair1.map(c => c.name).join(' • '),
    cities: pair1
  });

  // Option 2: 2 cities (distinct pool)
  const used1 = new Set(pair1.map(c => c.name));
  const pool2 = MAJOR_CITIES.filter(c => !used1.has(c.name));
  const pair2 = pickGroup(pool2.length >= 6 ? pool2 : MAJOR_CITIES, 2, 2800);
  presets.push({
    id: 'rnd-2b',
    citiesCount: 2,
    label: pair2.map(c => c.name).join(' • '),
    cities: pair2
  });

  // Option 3: 3 cities (triad)
  const used2 = new Set([...pair1, ...pair2].map(c => c.name));
  const pool3 = MAJOR_CITIES.filter(c => !used2.has(c.name));
  const trio1 = pickGroup(pool3.length >= 10 ? pool3 : MAJOR_CITIES, 3, 2200);
  presets.push({
    id: 'rnd-3a',
    citiesCount: 3,
    label: trio1.map(c => c.name).join(' • '),
    cities: trio1
  });

  // Option 4: 3 cities (triad)
  const used3 = new Set([...pair1, ...pair2, ...trio1].map(c => c.name));
  const pool4 = MAJOR_CITIES.filter(c => !used3.has(c.name));
  const trio2 = pickGroup(pool4.length >= 10 ? pool4 : MAJOR_CITIES, 3, 2200);
  presets.push({
    id: 'rnd-3b',
    citiesCount: 3,
    label: trio2.map(c => c.name).join(' • '),
    cities: trio2
  });

  return presets;
}

class AppController {
  constructor() {
    this.dynamicPresets = generateRandomPresetOptions();
    this.activePresetIndex = 0;
    this.locations = this.dynamicPresets.length > 0
      ? this.dynamicPresets[0].cities.map(c => ({ ...c }))
      : [
          { name: "Bergen", country: "Norway", lat: 60.3913, lon: 5.3221 },
          { name: "Oslo", country: "Norway", lat: 59.9139, lon: 10.7522 }
        ];

    this.unit = 'km';
    this.distance = 2500;
    this.tolerance = 100;
    this.candidates = [];
    this.circumcenters = [];
    this.selectedCandidate = null;
    this.equidistantGreatCircleActive = false;
    this.equidistantGreatCircleData = null;
    this.greatCircleWaypoints = [];
    this.isTourRunning = false;
    this.tourSpeed = 1.0;

    // Feature toggles
    this.isDayNightActive = false;
    this.isVoronoiActive = false;
    this.isCinematicMode = false;
    this.hoveredWpName = null;
    this.toastTimer = null;

    this.readUrlHash();

    this.initDOM();
    this.renderDynamicPresets();
    this.initGlobe();
    this.initEvents();
    this.recalculate();
    this.solveAutoEquidistant();

    if (this.isDayNightActive) {
      this.globe.setDayNightMode(true);
      if (this.btnToggleDayNight) this.btnToggleDayNight.classList.add('active');
    }
  }

  initDOM() {
    // Header
    this.dynamicPresetsContainer = document.getElementById('dynamic-presets-container');
    this.btnRandomCities = document.getElementById('btn-random-cities');
    this.unitButtons = document.querySelectorAll('.unit-btn');
    this.mapModeButtons = document.querySelectorAll('.map-mode-btn');
    this.btnToggleRotate = document.getElementById('btn-toggle-rotate');
    this.btnResetView = document.getElementById('btn-reset-view');
    this.btnInfo = document.getElementById('btn-info');
    this.infoModal = document.getElementById('info-modal');
    this.btnCloseModal = document.getElementById('btn-close-modal');

    // Sidebar
    this.locationsBadge = document.getElementById('locations-badge');
    this.btnClearCities = document.getElementById('btn-clear-cities');
    this.citySearchInput = document.getElementById('city-search-input');
    this.btnClearSearch = document.getElementById('btn-clear-search');
    this.searchDropdown = document.getElementById('search-dropdown');
    this.citiesList = document.getElementById('cities-list');

    // Distance Controls
    this.distanceDisplayVal = document.getElementById('distance-display-val');
    this.btnAutoEquidistant = document.getElementById('btn-auto-equidistant');
    this.distanceSlider = document.getElementById('distance-slider');
    this.distanceNumericInput = document.getElementById('distance-numeric-input');
    this.sliderMidLabel = document.getElementById('slider-mid-label');
    this.sliderMaxLabel = document.getElementById('slider-max-label');
    this.unitLabels = document.querySelectorAll('.unit-label');
    this.unitSuffix = document.querySelector('.unit-suffix');
    this.quickRadiiButtons = document.querySelectorAll('.chip-btn');
    this.toleranceSlider = document.getElementById('tolerance-slider');
    this.toleranceVal = document.getElementById('tolerance-val');

    // Bottom Panel
    this.bottomPanel = document.getElementById('bottom-panel');
    this.btnToggleBottom = document.getElementById('btn-toggle-bottom');
    this.matchesCountBadge = document.getElementById('matches-count-badge');
    this.statsSummary = document.getElementById('stats-summary');
    this.matchesList = document.getElementById('matches-list');

    // HUD & Tooltip
    this.hudText = document.getElementById('hud-text');
    this.hudCoords = document.getElementById('hud-coords');
    this.hudMapMode = document.getElementById('hud-map-mode');
    this.globeTooltip = document.getElementById('globe-tooltip');

    // Tour HUD & Waypoints Modal
    this.tourHud = document.getElementById('great-circle-tour-hud');
    this.btnTourPlayPause = document.getElementById('btn-tour-play-pause');
    this.tourPlayIcon = document.getElementById('tour-play-icon');
    this.tourPauseIcon = document.getElementById('tour-pause-icon');
    this.tourPlayText = document.getElementById('tour-play-text');
    this.btnOpenWaypointsModal = document.getElementById('btn-open-waypoints-modal');
    this.waypointsCountPill = document.getElementById('waypoints-count-pill');
    this.tourSpeedButtons = document.querySelectorAll('.tour-speed-btn');
    this.btnTourStop = document.getElementById('btn-tour-stop');
    this.tourProgressBar = document.getElementById('tour-progress-bar');
    this.tourProgressPct = document.getElementById('tour-progress-pct');
    this.tourOrbitStatus = document.getElementById('tour-orbit-status');
    this.tourWaypointSpotlight = document.getElementById('tour-waypoint-spotlight');
    this.spotlightName = document.getElementById('spotlight-name');
    this.spotlightDist = document.getElementById('spotlight-dist');
    this.spotlightCoords = document.getElementById('spotlight-coords');

    this.waypointsModal = document.getElementById('waypoints-modal');
    this.btnCloseWaypointsModal = document.getElementById('btn-close-waypoints-modal');
    this.waypointsSearchInput = document.getElementById('waypoints-search-input');
    this.btnStartTourFromModal = document.getElementById('btn-start-tour-from-modal');
    this.waypointsCardsGrid = document.getElementById('waypoints-cards-grid');
    this.waypointsModalSubtitle = document.getElementById('waypoints-modal-subtitle');

    // Legend
    this.legendSection = document.querySelector('.legend-section');
    this.legendToggleBtn = document.getElementById('legend-toggle-btn');
    this.legendStatusText = document.getElementById('legend-status-text');

    // New Features: Day/Night, Voronoi, Share, Cinematic Mode, Exporter
    this.btnToggleDayNight = document.getElementById('btn-toggle-daynight');
    this.btnToggleVoronoi = document.getElementById('btn-toggle-voronoi');
    this.btnShareLink = document.getElementById('btn-share-link');
    this.btnCinematicMode = document.getElementById('btn-cinematic-mode');
    this.cinematicExitBadge = document.getElementById('cinematic-exit-badge');
    this.toastNotification = document.getElementById('toast-notification');
    this.modalExportDropdownWrap = document.getElementById('modal-export-dropdown-wrap');
    this.btnModalExportToggle = document.getElementById('btn-modal-export-toggle');
    this.modalExportMenu = document.getElementById('modal-export-menu');
    this.btnRandomCities = document.getElementById('btn-random-cities');

    // Tooltip interaction state
    this.isMouseOverTooltip = false;
    this.tooltipHideTimer = null;

    // Search keyboard navigation state
    this.currentSearchResults = [];
    this.selectedSuggestionIndex = -1;
  }

  initGlobe() {
    const container = document.getElementById('globe-container');
    this.globe = new GlobeScene(
      container,
      (point, type) => {
        this.handlePointSelection(point, type);
      },
      (info, event) => {
        this.handleGlobeHover(info, event);
      }
    );
  }

  initEvents() {
    // Map Mode Selector (Auto / Streets / Outdoors / Dark / Satellite)
    this.mapModeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.mapModeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.globe.setMapMode(mode);
        if (this.hudMapMode) {
          if (mode === 'auto') this.hudMapMode.textContent = 'Auto Map';
          else if (mode === 'streets') this.hudMapMode.textContent = 'Streets Map';
          else if (mode === 'outdoors') this.hudMapMode.textContent = 'Outdoors Topo';
          else if (mode === 'dark') this.hudMapMode.textContent = 'Midnight Dark';
          else this.hudMapMode.textContent = 'Satellite View';
        }
      });
    });

    // Tooltip hover retention (allows hovering cursor over tooltip card and clicking Wikipedia link)
    if (this.globeTooltip) {
      this.globeTooltip.addEventListener('mouseenter', () => {
        this.isMouseOverTooltip = true;
        if (this.tooltipHideTimer) {
          clearTimeout(this.tooltipHideTimer);
          this.tooltipHideTimer = null;
        }
      });

      this.globeTooltip.addEventListener('mouseleave', () => {
        this.isMouseOverTooltip = false;
        if (this.tooltipHideTimer) clearTimeout(this.tooltipHideTimer);
        this.tooltipHideTimer = setTimeout(() => {
          if (!this.isMouseOverTooltip) {
            this.hoveredWpName = null;
            this.globeTooltip.classList.add('hidden');
            if (this.globe && !this.isTourRunning) this.globe.highlightBeacon(null);
          }
          this.tooltipHideTimer = null;
        }, 700);
      });
    }

    // Unit Selector
    this.unitButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const newUnit = btn.dataset.unit;
        this.setUnit(newUnit);
      });
    });

    // Randomize Button
    if (this.btnRandomCities) {
      this.btnRandomCities.addEventListener('click', () => this.loadRandomCities());
    }

    // Tour Play/Pause
    if (this.btnTourPlayPause) {
      this.btnTourPlayPause.addEventListener('click', () => this.toggleTourPlayPause());
    }

    // Tour Stop
    if (this.btnTourStop) {
      this.btnTourStop.addEventListener('click', () => this.stopGreatCircleTour());
    }

    // Tour Speed Toggle
    this.tourSpeedButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = parseFloat(btn.dataset.speed || '1');
        this.tourSpeedButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.tourSpeed = speed;
        this.globe.setTourSpeed(speed);
      });
    });

    // Waypoints Modal
    if (this.btnOpenWaypointsModal) {
      this.btnOpenWaypointsModal.addEventListener('click', () => this.openWaypointsModal());
    }
    if (this.btnCloseWaypointsModal) {
      this.btnCloseWaypointsModal.addEventListener('click', () => this.waypointsModal.classList.add('hidden'));
    }
    if (this.waypointsModal) {
      this.waypointsModal.addEventListener('click', (e) => {
        if (e.target === this.waypointsModal) this.waypointsModal.classList.add('hidden');
      });
    }
    if (this.waypointsSearchInput) {
      this.waypointsSearchInput.addEventListener('input', (e) => {
        this.renderWaypointsModalCards(e.target.value);
      });
    }
    if (this.btnStartTourFromModal) {
      this.btnStartTourFromModal.addEventListener('click', () => {
        this.waypointsModal.classList.add('hidden');
        this.startGreatCircleTour(0);
      });
    }

    // Rotate & Reset
    this.btnToggleRotate.addEventListener('click', () => {
      const isRotating = this.globe.toggleAutoRotate();
      this.btnToggleRotate.classList.toggle('active', isRotating);
    });

    this.btnResetView.addEventListener('click', () => {
      this.globe.resetView();
    });

    // Day/Night Terminator Toggle
    if (this.btnToggleDayNight) {
      this.btnToggleDayNight.addEventListener('click', () => {
        this.isDayNightActive = !this.isDayNightActive;
        this.btnToggleDayNight.classList.toggle('active', this.isDayNightActive);
        this.globe.setDayNightMode(this.isDayNightActive);
        this.showToast(this.isDayNightActive ? '☀ Day/Night Solar Terminator Enabled' : 'Day/Night Mode Disabled');
        this.updateUrlHash();
      });
    }

    // Spherical Voronoi Partitioning Toggle
    if (this.btnToggleVoronoi) {
      this.btnToggleVoronoi.addEventListener('click', () => {
        this.isVoronoiActive = !this.isVoronoiActive;
        this.btnToggleVoronoi.classList.toggle('active', this.isVoronoiActive);
        this.globe.setVoronoiMode(this.isVoronoiActive, this.locations);
        this.showToast(this.isVoronoiActive ? '🌐 Spherical Voronoi Territories Enabled' : 'Voronoi Mode Disabled');
        this.updateUrlHash();
      });
    }

    // Share Permalink
    if (this.btnShareLink) {
      this.btnShareLink.addEventListener('click', () => {
        this.updateUrlHash();
        navigator.clipboard.writeText(window.location.href).then(() => {
          this.showToast('✓ Shareable permalink copied to clipboard!');
        }).catch(() => {
          prompt('Shareable URL:', window.location.href);
        });
      });
    }

    // Cinematic View Mode
    if (this.btnCinematicMode) {
      this.btnCinematicMode.addEventListener('click', () => this.toggleCinematicMode());
    }
    if (this.cinematicExitBadge) {
      this.cinematicExitBadge.addEventListener('click', () => this.toggleCinematicMode(false));
    }
    document.addEventListener('keydown', (e) => {
      if (['input', 'textarea'].includes((document.activeElement?.tagName || '').toLowerCase())) {
        return;
      }
      if (e.key === 'c' || e.key === 'C' || e.key === 'h' || e.key === 'H') {
        this.toggleCinematicMode();
      } else if (e.key === 'Escape' && this.isCinematicMode) {
        this.toggleCinematicMode(false);
      }
    });

    // Modal Unified Export Dropdown
    if (this.btnModalExportToggle && this.modalExportMenu) {
      this.btnModalExportToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = this.modalExportMenu.classList.contains('hidden');
        document.querySelectorAll('.export-menu-dropdown').forEach(m => m.classList.add('hidden'));
        document.querySelectorAll('.export-toggle-btn').forEach(b => b.classList.remove('open'));
        if (isHidden) {
          this.modalExportMenu.classList.remove('hidden');
          this.btnModalExportToggle.classList.add('open');
        }
      });

      this.modalExportMenu.querySelectorAll('.export-option-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const format = btn.dataset.format;
          this.modalExportMenu.classList.add('hidden');
          this.btnModalExportToggle.classList.remove('open');
          this.exportCurrentGreatCircle(format);
        });
      });
    }

    // Global click-outside to dismiss any export dropdown
    document.addEventListener('click', () => {
      document.querySelectorAll('.export-menu-dropdown').forEach(m => m.classList.add('hidden'));
      document.querySelectorAll('.export-toggle-btn').forEach(b => b.classList.remove('open'));
    });

    // Info Modal
    this.btnInfo.addEventListener('click', () => this.infoModal.classList.remove('hidden'));
    this.btnCloseModal.addEventListener('click', () => this.infoModal.classList.add('hidden'));
    this.infoModal.addEventListener('click', (e) => {
      if (e.target === this.infoModal) this.infoModal.classList.add('hidden');
    });

    // City Search Input & Keyboard Navigation
    let debounceTimer = null;
    this.citySearchInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      this.btnClearSearch.classList.toggle('hidden', val.length === 0);

      clearTimeout(debounceTimer);
      if (val.length >= 2) {
        debounceTimer = setTimeout(() => this.handleSearch(val), 180);
      } else {
        this.hideDropdown();
      }
    });

    this.citySearchInput.addEventListener('keydown', (e) => {
      if (this.searchDropdown.classList.contains('hidden') || !this.currentSearchResults || this.currentSearchResults.length === 0) {
        if (e.key === 'Enter') e.preventDefault();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % this.currentSearchResults.length;
        this.highlightSelectedSuggestion();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedSuggestionIndex = (this.selectedSuggestionIndex - 1 + this.currentSearchResults.length) % this.currentSearchResults.length;
        this.highlightSelectedSuggestion();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const targetIdx = this.selectedSuggestionIndex >= 0 ? this.selectedSuggestionIndex : 0;
        const target = this.currentSearchResults[targetIdx];
        if (target) {
          this.addLocation({
            name: target.name,
            country: target.country || '',
            lat: target.lat,
            lon: target.lon
          });
          this.citySearchInput.value = '';
          this.btnClearSearch.classList.add('hidden');
          this.hideDropdown();
        }
      } else if (e.key === 'Escape') {
        this.hideDropdown();
      }
    });

    this.btnClearSearch.addEventListener('click', () => {
      this.citySearchInput.value = '';
      this.btnClearSearch.classList.add('hidden');
      this.hideDropdown();
    });

    // Close search dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!this.citySearchInput.contains(e.target) && !this.searchDropdown.contains(e.target)) {
        this.hideDropdown();
      }
    });

    // Clear Cities
    this.btnClearCities.addEventListener('click', () => {
      if (confirm('Clear all locations?')) {
        this.locations = [];
        this.renderCitiesList();
        this.recalculate();
      }
    });

    // Distance Slider & Input
    this.distanceSlider.addEventListener('input', (e) => {
      this.distance = parseFloat(e.target.value);
      this.distanceNumericInput.value = Math.round(this.distance);
      this.updateDistanceDisplay();
      this.globe.updateDistanceRings(this.distance, this.unit);
      this.recalculateCandidatesOnly();
    });

    this.distanceNumericInput.addEventListener('change', (e) => {
      let val = parseFloat(e.target.value);
      const maxDist = Math.PI * EARTH_RADIUS[this.unit];
      val = Math.max(50, Math.min(maxDist, val));
      this.distance = val;
      this.distanceSlider.value = val;
      this.updateDistanceDisplay();
      this.globe.updateDistanceRings(this.distance, this.unit);
      this.recalculateCandidatesOnly();
    });

    // Quick Radii Preset Buttons
    this.quickRadiiButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const ratio = parseFloat(btn.dataset.distRatio);
        const maxDist = Math.PI * EARTH_RADIUS[this.unit];
        this.distance = Math.round(maxDist * ratio);
        this.distanceSlider.value = this.distance;
        this.distanceNumericInput.value = this.distance;
        this.updateDistanceDisplay();
        this.globe.updateDistanceRings(this.distance, this.unit);
        this.recalculateCandidatesOnly();
      });
    });

    // Tolerance Slider
    this.toleranceSlider.addEventListener('input', (e) => {
      this.tolerance = parseFloat(e.target.value);
      this.toleranceVal.textContent = `± ${this.tolerance} ${this.unit}`;
      this.recalculateCandidatesOnly();
    });

    // Auto-Equidistant Circumcenter Button
    this.btnAutoEquidistant.addEventListener('click', () => {
      this.solveAutoEquidistant();
    });

    // Bottom Panel Collapse Toggle
    this.btnToggleBottom.addEventListener('click', () => {
      this.bottomPanel.classList.toggle('collapsed');
    });

    // Map Legend Collapse Toggle
    if (this.legendToggleBtn && this.legendSection) {
      this.legendToggleBtn.addEventListener('click', () => {
        this.legendSection.classList.toggle('collapsed');
        const isCollapsed = this.legendSection.classList.contains('collapsed');
        if (this.legendStatusText) {
          this.legendStatusText.textContent = isCollapsed ? 'Show' : 'Hide';
        }
      });
    }
  }

  renderDynamicPresets() {
    if (!this.dynamicPresetsContainer || !this.dynamicPresets) return;
    this.dynamicPresetsContainer.innerHTML = '';

    this.dynamicPresets.forEach((preset, idx) => {
      const btn = document.createElement('button');
      btn.className = `preset-btn dynamic-preset-btn ${idx === this.activePresetIndex ? 'active' : ''}`;
      btn.dataset.presetIndex = idx;
      btn.title = `Equidistant Preset (${preset.citiesCount} cities): ${preset.cities.map(c => `${c.name} (${c.country})`).join(', ')}`;
      btn.innerHTML = `
        <span class="preset-dot"></span>
        <span class="preset-title">${preset.label}</span>
      `;
      btn.addEventListener('click', () => {
        this.selectDynamicPreset(idx);
      });
      this.dynamicPresetsContainer.appendChild(btn);
    });
  }

  selectDynamicPreset(idx) {
    if (!this.dynamicPresets || !this.dynamicPresets[idx]) return;
    this.activePresetIndex = idx;
    const preset = this.dynamicPresets[idx];
    this.locations = preset.cities.map(c => ({ ...c }));

    if (this.dynamicPresetsContainer) {
      const buttons = this.dynamicPresetsContainer.querySelectorAll('.dynamic-preset-btn');
      buttons.forEach((btn, bIdx) => {
        btn.classList.toggle('active', bIdx === idx);
      });
    }
    if (this.btnRandomCities) this.btnRandomCities.classList.remove('active');

    this.renderCitiesList();
    this.recalculate();
    this.solveAutoEquidistant();
  }

  loadRandomCities() {
    if (!MAJOR_CITIES || MAJOR_CITIES.length < 5) return;
    const count = Math.random() < 0.5 ? 2 : 3;
    const shuffled = [...MAJOR_CITIES].sort(() => 0.5 - Math.random());
    const selected = [];

    for (const city of shuffled) {
      const tooClose = selected.some(s => haversineDistance(s.lat, s.lon, city.lat, city.lon, 'km') < 2000);
      if (!tooClose) {
        selected.push({
          name: city.name,
          country: city.country || '',
          lat: city.lat,
          lon: city.lon
        });
        if (selected.length === count) break;
      }
    }

    if (selected.length >= 2) {
      this.activePresetIndex = -1;
      if (this.dynamicPresetsContainer) {
        const buttons = this.dynamicPresetsContainer.querySelectorAll('.dynamic-preset-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
      }
      if (this.btnRandomCities) this.btnRandomCities.classList.add('active');

      this.locations = selected;
      this.renderCitiesList();
      this.recalculate();
      this.solveAutoEquidistant();
      this.showToast(`🎲 Random Cities: ${selected.map(c => c.name).join(' • ')}`);
    }
  }

  setUnit(newUnit) {
    if (this.unit === newUnit) return;
    const oldRadius = EARTH_RADIUS[this.unit];
    const newRadius = EARTH_RADIUS[newUnit];

    // Convert current distance and tolerance
    this.distance = (this.distance / oldRadius) * newRadius;
    this.tolerance = (this.tolerance / oldRadius) * newRadius;
    this.unit = newUnit;

    // Update buttons
    this.unitButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.unit === newUnit);
    });

    // Update slider limits
    const maxDist = Math.round(Math.PI * newRadius);
    const midDist = Math.round(maxDist / 2);
    this.distanceSlider.max = maxDist;
    this.sliderMaxLabel.innerHTML = `${maxDist.toLocaleString()} <span class="unit-label">${newUnit}</span>`;
    this.sliderMidLabel.innerHTML = `${midDist.toLocaleString()} <span class="unit-label">${newUnit}</span>`;
    this.unitLabels.forEach(el => el.textContent = newUnit);
    this.unitSuffix.textContent = newUnit;

    this.toleranceSlider.max = Math.round(500 * (newRadius / EARTH_RADIUS.km));
    this.toleranceVal.textContent = `± ${Math.round(this.tolerance)} ${newUnit}`;

    this.distanceSlider.value = this.distance;
    this.distanceNumericInput.value = Math.round(this.distance);

    this.updateDistanceDisplay();
    this.recalculate();
  }

  updateDistanceDisplay() {
    this.distanceDisplayVal.textContent = formatDistance(this.distance, this.unit);
    if (this.distanceSlider) this.distanceSlider.value = this.distance;
    if (this.distanceNumericInput) this.distanceNumericInput.value = Math.round(this.distance);
  }

  async handleSearch(query) {
    const results = await searchLocations(query);
    this.renderDropdown(results);
  }

  renderDropdown(results) {
    this.currentSearchResults = results || [];
    this.selectedSuggestionIndex = -1;
    this.searchDropdown.innerHTML = '';
    if (!results || results.length === 0) {
      this.searchDropdown.innerHTML = `<li class="dropdown-item" style="color: var(--text-muted); cursor: default;">No locations found</li>`;
      this.searchDropdown.classList.remove('hidden');
      return;
    }

    results.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'dropdown-item';
      li.dataset.index = idx;
      li.innerHTML = `
        <div>
          <div class="dropdown-name">${item.name}</div>
          <div class="dropdown-sub">${item.country || item.fullName || formatCoordinates(item.lat, item.lon)}</div>
        </div>
        <span class="dropdown-badge">${item.lat.toFixed(1)}°, ${item.lon.toFixed(1)}°</span>
      `;
      li.addEventListener('mouseenter', () => {
        this.selectedSuggestionIndex = idx;
        this.highlightSelectedSuggestion();
      });
      li.addEventListener('click', () => {
        this.addLocation({
          name: item.name,
          country: item.country || '',
          lat: item.lat,
          lon: item.lon
        });
        this.citySearchInput.value = '';
        this.btnClearSearch.classList.add('hidden');
        this.hideDropdown();
      });
      this.searchDropdown.appendChild(li);
    });

    this.searchDropdown.classList.remove('hidden');
  }

  highlightSelectedSuggestion() {
    const items = this.searchDropdown.querySelectorAll('.dropdown-item');
    items.forEach((item, idx) => {
      if (idx === this.selectedSuggestionIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  hideDropdown() {
    this.searchDropdown.classList.add('hidden');
    this.selectedSuggestionIndex = -1;
  }

  addLocation(loc) {
    if (this.locations.length >= 10) {
      alert('Maximum of 10 locations reached. Please remove one before adding another.');
      return;
    }

    // Check duplicate
    const exists = this.locations.some(l => 
      Math.abs(l.lat - loc.lat) < 0.05 && Math.abs(l.lon - loc.lon) < 0.05
    );
    if (exists) {
      alert(`${loc.name} is already in the list.`);
      return;
    }

    this.locations.push(loc);
    this.renderCitiesList();
    this.recalculate();
    this.globe.flyTo(loc.lat, loc.lon, 310);
  }

  removeLocation(index) {
    if (this.locations.length <= 2) {
      alert('You need at least 2 locations to compute equidistant points on Earth.');
      return;
    }
    this.locations.splice(index, 1);
    this.renderCitiesList();
    this.recalculate();
  }

  renderCitiesList() {
    this.locationsBadge.textContent = `${this.locations.length} / 10`;
    this.citiesList.innerHTML = '';

    this.locations.forEach((city, index) => {
      const color = CITY_COLORS[index % CITY_COLORS.length];
      city.color = color;

      const item = document.createElement('div');
      item.className = 'city-item';
      item.innerHTML = `
        <div class="city-info-wrap">
          <div class="city-color-tag" style="background-color: ${color}; color: ${color};"></div>
          <div>
            <div class="city-name">${city.name}</div>
            <div class="city-country">${city.country || ''}</div>
            <div class="city-coords">${formatCoordinates(city.lat, city.lon)}</div>
          </div>
        </div>
        <div class="city-actions">
          <button class="mini-icon-btn fly-btn" title="Focus on globe">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="12 8 16 12 12 16 12 8"></polygon>
            </svg>
          </button>
          <button class="mini-icon-btn delete" title="Remove location">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;

      item.querySelector('.fly-btn').addEventListener('click', () => {
        this.globe.flyTo(city.lat, city.lon, 310);
      });

      item.querySelector('.delete').addEventListener('click', () => {
        this.removeLocation(index);
      });

      this.citiesList.appendChild(item);
    });

    this.globe.updateCities(this.locations);
  }

  /**
   * Recalculates both circumcenters and circle intersection candidates
   */
  recalculate() {
    this.renderCitiesList();
    this.updateDistanceDisplay();

    if (this.locations.length !== 2) {
      this.equidistantGreatCircleActive = false;
      this.equidistantGreatCircleData = null;
      this.greatCircleWaypoints = [];
      this.stopGreatCircleTour();
      this.globe.clearEquidistantGreatCircle();
      if (this.tourHud) this.tourHud.classList.add('hidden');
    } else {
      const circleData = this.globe.showEquidistantGreatCircle(this.locations[0], this.locations[1]);
      this.equidistantGreatCircleActive = true;
      this.equidistantGreatCircleData = circleData;
      this.computeGreatCircleWaypoints(this.locations[0], this.locations[1], circleData);
      if (this.tourHud) this.tourHud.classList.remove('hidden');
    }

    // 1. If 3 locations: compute exact spherical circumcenters (poles)
    if (this.locations.length === 3) {
      this.circumcenters = calculateSphericalCircumcenters(this.locations, this.unit) || [];
    } else {
      this.circumcenters = [];
    }

    // 2. Spherical Voronoi Partitioning (active when 3+ cities)
    if (this.locations.length >= 3) {
      if (this.btnToggleVoronoi) this.btnToggleVoronoi.classList.remove('hidden');
      if (this.isVoronoiActive) {
        this.globe.showSphericalVoronoi(this.locations);
      }
    } else {
      if (this.btnToggleVoronoi) {
        this.btnToggleVoronoi.classList.add('hidden');
        this.btnToggleVoronoi.classList.remove('active');
      }
      this.globe.clearSphericalVoronoi();
    }

    this.recalculateCandidatesOnly();
    this.updateUrlHash();
  }

  recalculateCandidatesOnly() {
    if (this.locations.length < 2) {
      this.candidates = [];
      this.renderMatchingList();
      this.globe.updateCandidates([], []);
      return;
    }

    this.candidates = findMatchingPoints(this.locations, this.distance, this.tolerance, this.unit);
    this.globe.updateCandidates(this.candidates, this.circumcenters);
    this.renderMatchingList();
  }

  /**
   * Solves for the optimal equidistant distance automatically
   */
  solveAutoEquidistant() {
    if (this.locations.length < 2) return;

    // Case 1: Exactly 2 Locations - Complete Great Circle Circling the entire globe
    if (this.locations.length === 2) {
      const loc1 = this.locations[0];
      const loc2 = this.locations[1];
      const circleData = this.globe.showEquidistantGreatCircle(loc1, loc2);
      this.equidistantGreatCircleActive = true;
      this.equidistantGreatCircleData = circleData;
      this.computeGreatCircleWaypoints(loc1, loc2, circleData);
      if (this.tourHud) this.tourHud.classList.remove('hidden');

      // Minimum equidistant distance is at the midpoint between the two locations
      const dMid = haversineDistance(
        loc1.lat, loc1.lon,
        loc2.lat, loc2.lon,
        this.unit
      ) / 2;

      this.distance = Math.round(dMid);
      this.distanceSlider.value = this.distance;
      this.distanceNumericInput.value = this.distance;
      this.updateDistanceDisplay();
      this.globe.updateDistanceRings(this.distance, this.unit);
      this.recalculateCandidatesOnly();

      if (circleData && circleData.midpoint) {
        this.globe.flyTo(circleData.midpoint.lat, circleData.midpoint.lon, 280);
      }
      return;
    }

    // Case 2: >= 3 Locations
    this.equidistantGreatCircleActive = false;
    this.equidistantGreatCircleData = null;
    this.greatCircleWaypoints = [];
    this.stopGreatCircleTour();
    this.globe.clearEquidistantGreatCircle();
    if (this.tourHud) this.tourHud.classList.add('hidden');

    let targetDist = null;

    if (this.locations.length === 3 && this.circumcenters.length > 0) {
      // Primary circumcenter distance
      targetDist = this.circumcenters[0].distance;
    } else {
      // Find average pairwise midpoint distance
      let totalDist = 0;
      let count = 0;
      for (let i = 0; i < this.locations.length; i++) {
        for (let j = i + 1; j < this.locations.length; j++) {
          totalDist += haversineDistance(
            this.locations[i].lat, this.locations[i].lon,
            this.locations[j].lat, this.locations[j].lon,
            this.unit
          );
          count++;
        }
      }
      targetDist = (totalDist / count) * 0.6;
    }

    if (targetDist) {
      this.distance = Math.round(targetDist);
      this.distanceSlider.value = this.distance;
      this.distanceNumericInput.value = this.distance;
      this.updateDistanceDisplay();
      this.globe.updateDistanceRings(this.distance, this.unit);
      this.recalculateCandidatesOnly();

      // Fly to the circumcenter or top candidate
      if (this.circumcenters.length > 0) {
        this.globe.flyTo(this.circumcenters[0].lat, this.circumcenters[0].lon, 310);
        this.globe.highlightPointArcs(this.circumcenters[0]);
      } else if (this.candidates.length > 0) {
        this.globe.flyTo(this.candidates[0].lat, this.candidates[0].lon, 310);
        this.globe.highlightPointArcs(this.candidates[0]);
      }
    }
  }

  renderMatchingList() {
    this.matchesList.innerHTML = '';
    const totalCount = (this.circumcenters ? this.circumcenters.length : 0) + this.candidates.length;
    this.matchesCountBadge.textContent = `${totalCount} Found`;

    // Render Stats Summary
    this.statsSummary.innerHTML = '';
    if (this.circumcenters && this.circumcenters.length > 0) {
      const chip = document.createElement('div');
      chip.className = 'stat-chip';
      chip.innerHTML = `Circumcenter Radius: <strong>${formatDistance(this.circumcenters[0].distance, this.unit)}</strong>`;
      this.statsSummary.appendChild(chip);
    }

    const tolChip = document.createElement('div');
    tolChip.className = 'stat-chip';
    tolChip.innerHTML = `Tolerance: <strong>±${Math.round(this.tolerance)} ${this.unit}</strong>`;
    this.statsSummary.appendChild(tolChip);

    // If 2 locations with active Equidistant Great Circle
    if (this.equidistantGreatCircleActive && this.locations.length === 2 && this.equidistantGreatCircleData) {
      const loc1 = this.locations[0];
      const loc2 = this.locations[1];
      const gc = this.equidistantGreatCircleData;
      const dMid = haversineDistance(loc1.lat, loc1.lon, loc2.lat, loc2.lon, this.unit) / 2;
      const dMax = Math.PI * EARTH_RADIUS[this.unit] - dMid;

      // 1. Hero Banner for Great Circle
      const banner = document.createElement('div');
      banner.className = 'great-circle-hero-banner';
      banner.innerHTML = `
        <div class="gc-banner-header">
          <span class="gc-banner-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <ellipse cx="12" cy="12" rx="10" ry="3.5"></ellipse>
            </svg>
            Equidistant Great Circle
          </span>
          <span class="gc-banner-status">100% Equidistant Locus</span>
        </div>
        <div class="gc-banner-body">
          <div class="gc-banner-title">Perpendicular Bisector Line</div>
          <div class="gc-banner-desc">
            Circling the entire globe in <strong>emerald neon</strong>: Every single point along this line is <strong>equally distant</strong> to both <strong>${loc1.name}</strong> and <strong>${loc2.name}</strong>.
          </div>
        </div>
        <div class="gc-banner-stats">
          <span>Min (Midpoint): <strong>${formatDistance(dMid, this.unit)}</strong></span>
          <span>Max (Antipodal): <strong>${formatDistance(dMax, this.unit)}</strong></span>
        </div>
        <div class="gc-banner-actions">
          <button id="btn-gc-tour-play" class="gc-banner-btn primary" title="Start 360-degree flyover tour along the great circle">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Flyover Tour
          </button>
          <button id="btn-gc-tour-waypoints" class="gc-banner-btn secondary" title="View all locations along the great circle as cards">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Locations (${this.greatCircleWaypoints.length})
          </button>
          <div class="export-dropdown-wrap" id="gc-export-dropdown-wrap">
            <button id="btn-gc-export-toggle" class="gc-banner-btn secondary export-toggle-btn" title="Export Great Circle Route">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Export</span>
              <svg class="dropdown-chevron-icon" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div id="gc-export-menu" class="export-menu-dropdown banner-export-menu glass-panel hidden">
              <button class="export-option-item" data-format="kml">
                <span class="export-opt-icon">🌍</span>
                <div class="export-opt-text">
                  <span class="export-opt-title">Google Earth KML</span>
                  <span class="export-opt-desc">3D path & placemarks (.kml)</span>
                </div>
              </button>
              <button class="export-option-item" data-format="gpx">
                <span class="export-opt-icon">🛰️</span>
                <div class="export-opt-text">
                  <span class="export-opt-title">GPS Track GPX</span>
                  <span class="export-opt-desc">Waypoints & coordinates (.gpx)</span>
                </div>
              </button>
              <div class="export-opt-divider"></div>
              <button class="export-option-item highlight" data-format="both">
                <span class="export-opt-icon">📦</span>
                <div class="export-opt-text">
                  <span class="export-opt-title">Download Both</span>
                  <span class="export-opt-desc">KML and GPX archive files</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      `;

      const btnGcTour = banner.querySelector('#btn-gc-tour-play');
      if (btnGcTour) {
        btnGcTour.addEventListener('click', () => this.toggleTourPlayPause());
      }
      const btnGcWp = banner.querySelector('#btn-gc-tour-waypoints');
      if (btnGcWp) {
        btnGcWp.addEventListener('click', () => this.openWaypointsModal());
      }
      const btnGcExportToggle = banner.querySelector('#btn-gc-export-toggle');
      const gcExportMenu = banner.querySelector('#gc-export-menu');
      if (btnGcExportToggle && gcExportMenu) {
        btnGcExportToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = gcExportMenu.classList.contains('hidden');
          document.querySelectorAll('.export-menu-dropdown').forEach(m => m.classList.add('hidden'));
          document.querySelectorAll('.export-toggle-btn').forEach(b => b.classList.remove('open'));
          if (isHidden) {
            gcExportMenu.classList.remove('hidden');
            btnGcExportToggle.classList.add('open');
          }
        });

        gcExportMenu.querySelectorAll('.export-option-item').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const format = btn.dataset.format;
            gcExportMenu.classList.add('hidden');
            btnGcExportToggle.classList.remove('open');
            this.exportCurrentGreatCircle(format);
          });
        });
      }

      this.matchesList.appendChild(banner);

      // 2. Midpoint Card (closest equidistant point)
      if (gc.midpoint) {
        const midDist = haversineDistance(loc1.lat, loc1.lon, gc.midpoint.lat, gc.midpoint.lon, this.unit);
        const nearest = findNearestPlace(gc.midpoint.lat, gc.midpoint.lon, this.unit);
        const midCard = this.createCard({
          tag: 'Closest Equidistant Midpoint (Min Distance)',
          isCircumcenter: true,
          isGreatCirclePoint: true,
          lat: gc.midpoint.lat,
          lon: gc.midpoint.lon,
          nearest,
          distances: [
            { name: loc1.name, distance: midDist },
            { name: loc2.name, distance: midDist }
          ],
          pointObj: { lat: gc.midpoint.lat, lon: gc.midpoint.lon }
        });
        this.matchesList.appendChild(midCard);
      }

      // 3. Antipodal Midpoint Card
      if (gc.antipodal) {
        const antiDist = haversineDistance(loc1.lat, loc1.lon, gc.antipodal.lat, gc.antipodal.lon, this.unit);
        const nearest = findNearestPlace(gc.antipodal.lat, gc.antipodal.lon, this.unit);
        const antiCard = this.createCard({
          tag: 'Antipodal Equidistant Point (Max Distance)',
          isCircumcenter: true,
          isGreatCirclePoint: true,
          lat: gc.antipodal.lat,
          lon: gc.antipodal.lon,
          nearest,
          distances: [
            { name: loc1.name, distance: antiDist },
            { name: loc2.name, distance: antiDist }
          ],
          pointObj: { lat: gc.antipodal.lat, lon: gc.antipodal.lon }
        });
        this.matchesList.appendChild(antiCard);
      }

      // 4. Candidate Solutions for current distance
      this.candidates.forEach((cand, i) => {
        const nearest = findNearestPlace(cand.lat, cand.lon, this.unit);
        const tag = `Equidistant Solution #${i + 1} (±${Math.round(cand.maxDiff)} ${this.unit})`;
        const card = this.createCard({
          tag,
          isCircumcenter: false,
          isGreatCirclePoint: true,
          lat: cand.lat,
          lon: cand.lon,
          nearest,
          distances: cand.distances,
          pointObj: cand
        });
        this.matchesList.appendChild(card);
      });

      // 5. Sample Points along Great Circle
      if (gc.sampleCoords && gc.sampleCoords.length > 0) {
        gc.sampleCoords.slice(0, 4).forEach((pt, idx) => {
          const ptDist = haversineDistance(loc1.lat, loc1.lon, pt.lat, pt.lon, this.unit);
          const nearest = findNearestPlace(pt.lat, pt.lon, this.unit);
          const sampleCard = this.createCard({
            tag: `Circle Point #${idx + 1} (Equidistant)`,
            isCircumcenter: false,
            isGreatCirclePoint: true,
            lat: pt.lat,
            lon: pt.lon,
            nearest,
            distances: [
              { name: loc1.name, distance: ptDist },
              { name: loc2.name, distance: ptDist }
            ],
            pointObj: { lat: pt.lat, lon: pt.lon }
          });
          this.matchesList.appendChild(sampleCard);
        });
      }

      const totalItems = 2 + this.candidates.length + (gc.sampleCoords ? Math.min(4, gc.sampleCoords.length) : 0);
      this.matchesCountBadge.textContent = `${totalItems} Solutions on Line`;
      return;
    }

    if (totalCount === 0) {
      this.matchesList.innerHTML = `
        <div class="empty-matches-msg">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          No intersection points at ${formatDistance(this.distance, this.unit)}. Try clicking "Auto-Calculate Equidistant Distance" or increasing tolerance.
        </div>
      `;
      return;
    }

    // 1. Render Circumcenters (if 3 cities)
    if (this.circumcenters && this.circumcenters.length > 0) {
      this.circumcenters.forEach((pole, i) => {
        const nearest = findNearestPlace(pole.lat, pole.lon, this.unit);
        const card = this.createCard({
          tag: i === 0 ? 'Primary Spherical Circumcenter' : 'Antipodal Circumcenter',
          isCircumcenter: true,
          lat: pole.lat,
          lon: pole.lon,
          nearest,
          distances: this.locations.map(loc => ({
            name: loc.name,
            distance: pole.distance
          })),
          pointObj: pole
        });
        this.matchesList.appendChild(card);
      });
    }

    // 2. Render Pairwise / Multi-Intersection Candidates
    this.candidates.forEach((cand, i) => {
      const nearest = findNearestPlace(cand.lat, cand.lon, this.unit);
      const isExactMatch = cand.matchesAllWithinTolerance;
      const tag = isExactMatch 
        ? `Equidistant Solution #${i + 1} (±${Math.round(cand.maxDiff)} ${this.unit})`
        : `Intersection (${cand.pair ? cand.pair.join(' ∩ ') : 'Circle Overlap'})`;

      const card = this.createCard({
        tag,
        isCircumcenter: false,
        lat: cand.lat,
        lon: cand.lon,
        nearest,
        distances: cand.distances,
        pointObj: cand
      });
      this.matchesList.appendChild(card);
    });
  }

  createCard({ tag, isCircumcenter, isGreatCirclePoint, lat, lon, nearest, distances, pointObj }) {
    const card = document.createElement('div');
    card.className = `match-card ${isCircumcenter ? 'is-circumcenter' : ''} ${isGreatCirclePoint ? 'is-great-circle' : ''}`;

    const placeTitle = nearest.formattedName || `Near ${nearest.nearestCity?.name || 'Point'}`;

    const distRows = distances.map(d => `
      <div class="dist-row">
        <span class="dist-city-name">${d.name}</span>
        <span class="dist-num">${formatDistance(d.distance, this.unit)}</span>
      </div>
    `).join('');

    const typeInfo = getPoiTypeInfo(nearest.type || 'city');
    const typeBadge = `<span class="poi-badge ${typeInfo.badgeClass}"><span>${typeInfo.icon}</span> <span>${typeInfo.label}</span></span>`;
    const detailHtml = nearest.detail ? `<div class="card-poi-detail">${nearest.detail}</div>` : '';

    card.innerHTML = `
      <div class="card-top">
        <div class="card-title-group">
          <div class="card-tags-row">
            <span class="card-tag">${tag}</span>
            ${typeBadge}
          </div>
          <div class="card-location-name">${placeTitle}</div>
          ${detailHtml}
          <div class="card-coords">${formatCoordinates(lat, lon)}</div>
        </div>
      </div>

      <div class="card-distances-breakdown">
        ${distRows}
      </div>

      <div class="card-actions">
        <button class="card-btn fly-card-btn">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="12 8 16 12 12 16 12 8"></polygon>
          </svg>
          Fly to & Trace Arcs
        </button>
        <button class="card-icon-btn copy-btn" title="Copy Coordinates">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button class="card-icon-btn osm-btn" title="Open in OpenStreetMap">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </button>
      </div>
    `;

    // Asynchronously resolve precise town, municipality, or district from OpenStreetMap
    reverseGeocode(lat, lon).then(geo => {
      if (geo && geo.formatted) {
        const titleEl = card.querySelector('.card-location-name');
        if (titleEl) {
          if (nearest.type && nearest.type !== 'city') {
            titleEl.textContent = `${placeTitle} • ${geo.formatted}`;
          } else {
            titleEl.textContent = geo.formatted;
          }
        }
      }
    });

    card.querySelector('.fly-card-btn').addEventListener('click', () => {
      this.globe.flyTo(lat, lon, 155);
      this.globe.highlightPointArcs(pointObj);
      this.hudCoords.textContent = `${formatCoordinates(lat, lon)} • ${placeTitle}`;
    });

    card.querySelector('.copy-btn').addEventListener('click', () => {
      const coordStr = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      navigator.clipboard.writeText(coordStr);
      const originalHTML = card.querySelector('.copy-btn').innerHTML;
      card.querySelector('.copy-btn').innerHTML = '✓';
      setTimeout(() => {
        card.querySelector('.copy-btn').innerHTML = originalHTML;
      }, 1500);
    });

    card.querySelector('.osm-btn').addEventListener('click', () => {
      window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=7/${lat}/${lon}`, '_blank');
    });

    return card;
  }

  async handlePointSelection(point, type) {
    if (!point) return;
    if (type === 'beacon') {
      const typeInfo = getPoiTypeInfo(point.type || 'city');
      const icon = point.icon || typeInfo.icon;
      const placeStr = point.name + (point.country ? ', ' + point.country : '');
      const detailStr = point.detail ? ` (${point.detail})` : '';
      this.hudCoords.textContent = `${formatCoordinates(point.lat, point.lon)} • ${icon} ${placeStr}${detailStr}`;
      return;
    }
    if (type === 'placeLabel') {
      const placeStr = point.name + (point.country ? ', ' + point.country : '');
      this.hudCoords.textContent = `${formatCoordinates(point.lat, point.lon)} • ${placeStr}`;
      return;
    }
    const nearest = findNearestPlace(point.lat, point.lon, this.unit);
    const initialName = nearest.formattedName || nearest.nearestCity?.name || 'Selected Point';
    this.hudCoords.textContent = `${formatCoordinates(point.lat, point.lon)} • ${initialName}`;

    // Asynchronously fetch exact location name from OpenStreetMap
    const geo = await reverseGeocode(point.lat, point.lon);
    if (geo && geo.formatted) {
      this.hudCoords.textContent = `${formatCoordinates(point.lat, point.lon)} • ${geo.formatted}`;
    }
  }

  handleGlobeHover(info, event) {
    if (!this.globeTooltip) return;

    // 1. If mouse is currently hovering directly inside tooltip reading Wikipedia or clicking links, keep it locked
    if (this.isMouseOverTooltip) {
      return;
    }

    // 2. If no raycast hit (e.g. mouse in deep space or cursor exited canvas)
    if (!info) {
      if (this.hoveredWpName) {
        if (!this.tooltipHideTimer) {
          this.tooltipHideTimer = setTimeout(() => {
            if (!this.isMouseOverTooltip) {
              this.hoveredWpName = null;
              this.globeTooltip.classList.add('hidden');
              if (this.globe && !this.isTourRunning) this.globe.highlightBeacon(null);
            }
            this.tooltipHideTimer = null;
          }, 800);
        }
      } else {
        this.globeTooltip.classList.add('hidden');
      }
      return;
    }

    // 3. Hovering over a Beacon along Great Circle
    if (info.type === 'beacon') {
      const wp = info.data;
      if (this.tooltipHideTimer) {
        clearTimeout(this.tooltipHideTimer);
        this.tooltipHideTimer = null;
      }

      // If already displaying this beacon, keep card STATIONARY so user can comfortably move mouse to it!
      if (this.hoveredWpName === wp.name && !this.globeTooltip.classList.contains('hidden')) {
        return;
      }

      this.hoveredWpName = wp.name;
      const typeInfo = getPoiTypeInfo(wp.type || 'city');
      const icon = wp.icon || typeInfo.icon;
      const countryStr = wp.country ? `, ${wp.country}` : '';
      const detailStr = wp.detail ? `<span class="tooltip-detail">${wp.detail}</span>` : '';
      const distInfo = wp.avgDist
        ? `<span class="tooltip-extra">±${wp.diffDist || 0} ${this.unit} • ${formatDistance(wp.avgDist, this.unit)} to endpoints</span>`
        : '';
      const orthoDist = wp.orthoDistKm !== undefined
        ? `<span class="tooltip-coords">${wp.orthoDistKm} ${this.unit} from Great Circle</span>`
        : `<span class="tooltip-coords">${formatCoordinates(wp.lat, wp.lon)}</span>`;

      this.globeTooltip.innerHTML = `
        <div class="tooltip-title-wrap">
          <span class="tooltip-icon">${icon}</span>
          <span class="tooltip-title">${wp.name}</span>
          <span class="tooltip-tag ${typeInfo.badgeClass}">${typeInfo.label}</span>
        </div>
        <span class="tooltip-sub">${countryStr.replace(/^,\s*/, '') || 'Point of Interest'}</span>
        ${detailStr}
        ${orthoDist}
        ${distInfo}
      `;
      this.positionTooltip(event.clientX, event.clientY);

      // Asynchronously fetch rich Wikipedia instant preview extract & thumbnail
      fetchWikipediaSummary(wp.name).then(wiki => {
        if (wiki && this.hoveredWpName === wp.name && !this.globeTooltip.classList.contains('hidden')) {
          const existing = this.globeTooltip.querySelector('.tooltip-wiki-card');
          if (!existing && (wiki.extract || wiki.thumbnail)) {
            const wikiImg = wiki.thumbnail
              ? `<img src="${wiki.thumbnail}" class="tooltip-wiki-img" alt="${wiki.title}"/>`
              : '';
            const wikiSnippet = wiki.extract
              ? `<div class="tooltip-wiki-text">${wiki.extract}</div>`
              : '';
            const wikiLink = wiki.url
              ? `<a href="${wiki.url}" target="_blank" rel="noopener noreferrer" class="tooltip-wiki-link">Wikipedia &#8599;</a>`
              : '';

            const wikiBlock = document.createElement('div');
            wikiBlock.className = 'tooltip-wiki-card';
            wikiBlock.innerHTML = `${wikiImg}<div class="tooltip-wiki-body">${wikiSnippet}${wikiLink}</div>`;
            this.globeTooltip.appendChild(wikiBlock);
          }
        }
      });
      return;
    }

    // 4. Moving across Earth Surface:
    if (info.type === 'surface') {
      if (this.hudCoords) {
        this.hudCoords.textContent = `${formatCoordinates(info.lat, info.lon)}`;
      }
      // If a beacon tooltip is currently visible, DO NOT overwrite it with "Earth Surface"!
      // Give the user generous 800ms grace time to traverse the canvas into the tooltip card.
      if (this.hoveredWpName) {
        if (!this.tooltipHideTimer) {
          this.tooltipHideTimer = setTimeout(() => {
            if (!this.isMouseOverTooltip) {
              this.hoveredWpName = null;
              this.globeTooltip.classList.add('hidden');
              if (this.globe && !this.isTourRunning) this.globe.highlightBeacon(null);
            }
            this.tooltipHideTimer = null;
          }, 800);
        }
        return;
      }
      // If no beacon is active, keep tooltip hidden (surface coords are already in top-left HUD)
      this.globeTooltip.classList.add('hidden');
      return;
    }

    // Other specific elements (city markers, circumcenters, candidate points, rings)
    if (this.tooltipHideTimer) {
      clearTimeout(this.tooltipHideTimer);
      this.tooltipHideTimer = null;
    }
    this.hoveredWpName = null;

    if (info.type === 'city') {
      const city = info.data;
      this.globeTooltip.innerHTML = `
        <div class="tooltip-title-wrap">
          <span class="tooltip-dot" style="background-color: ${city.color || '#00f0ff'}; color: ${city.color || '#00f0ff'};"></span>
          <span class="tooltip-title">${city.name}</span>
        </div>
        <span class="tooltip-sub">${city.country || 'Reference City'}</span>
        <span class="tooltip-coords">${formatCoordinates(city.lat, city.lon)}</span>
      `;
      this.positionTooltip(event.clientX, event.clientY);
      return;
    }

    if (info.type === 'circumcenter') {
      const nearest = findNearestPlace(info.lat, info.lon, this.unit);
      this.globeTooltip.innerHTML = `
        <div class="tooltip-title-wrap">
          <span class="tooltip-dot" style="background-color: #38ef7d; color: #38ef7d;"></span>
          <span class="tooltip-title">Equidistant Circumcenter Pole</span>
        </div>
        <span class="tooltip-sub">${nearest.formattedName}</span>
        <span class="tooltip-coords">${formatCoordinates(info.lat, info.lon)}</span>
        <span class="tooltip-extra">Distance: ${formatDistance(info.data?.distance || this.distance, this.unit)}</span>
      `;
      this.positionTooltip(event.clientX, event.clientY);
      return;
    }

    if (info.type === 'candidate') {
      const cand = info.data;
      const nearest = findNearestPlace(info.lat, info.lon, this.unit);
      const devText = cand.maxDiff !== undefined ? `Deviation: ±${Math.round(cand.maxDiff)} ${this.unit}` : '';
      this.globeTooltip.innerHTML = `
        <div class="tooltip-title-wrap">
          <span class="tooltip-dot" style="background-color: #ffea00; color: #ffea00;"></span>
          <span class="tooltip-title">Candidate Intersection</span>
        </div>
        <span class="tooltip-sub">${nearest.formattedName}</span>
        <span class="tooltip-coords">${formatCoordinates(info.lat, info.lon)}</span>
        ${devText ? `<span class="tooltip-extra">${devText}</span>` : ''}
      `;
      this.positionTooltip(event.clientX, event.clientY);
      return;
    }

    if (info.type === 'ring') {
      const city = info.city;
      this.globeTooltip.innerHTML = `
        <div class="tooltip-title-wrap">
          <span class="tooltip-dot" style="background-color: ${city?.color || '#ff007f'}; color: ${city?.color || '#ff007f'};"></span>
          <span class="tooltip-title">Distance Ring: ${city?.name || 'City'}</span>
        </div>
        <span class="tooltip-coords">Radius: ${formatDistance(info.distance, info.unit)}</span>
      `;
      this.positionTooltip(event.clientX, event.clientY);
      return;
    }

    this.globeTooltip.classList.add('hidden');
  }

  positionTooltip(clientX, clientY) {
    const tooltipWidth = this.globeTooltip.offsetWidth || 280;
    const tooltipHeight = this.globeTooltip.offsetHeight || 130;
    let posX = clientX + 18;
    let posY = clientY + 14;

    if (posX + tooltipWidth > window.innerWidth - 16) {
      posX = clientX - tooltipWidth - 18;
    }
    if (posY + tooltipHeight > window.innerHeight - 16) {
      posY = clientY - tooltipHeight - 14;
    }
    if (posX < 16) posX = 16;
    if (posY < 16) posY = 16;

    this.globeTooltip.style.left = `${posX}px`;
    this.globeTooltip.style.top = `${posY}px`;
    this.globeTooltip.classList.remove('hidden');
  }

  computeGreatCircleWaypoints(loc1, loc2, circleData) {
    if (!circleData) {
      this.greatCircleWaypoints = [];
      return;
    }

    const allPlaces = getAllPointsOfInterest ? [...getAllPointsOfInterest()] : [...CURATED_PLACES];
    for (const mc of MAJOR_CITIES) {
      if (!allPlaces.some(p => p.name === mc.name)) allPlaces.push(mc);
    }

    this.greatCircleWaypoints = findGreatCircleWaypoints(
      loc1,
      loc2,
      circleData,
      allPlaces,
      280,
      this.unit
    );

    if (this.waypointsCountPill) {
      this.waypointsCountPill.textContent = this.greatCircleWaypoints.length;
    }
    if (this.globe) {
      this.globe.setTourWaypoints(this.greatCircleWaypoints);
    }
  }

  toggleTourPlayPause() {
    if (this.locations.length !== 2 || !this.equidistantGreatCircleData) return;

    if (!this.isTourRunning) {
      let startProgress = this.globe.tourProgress || 0;
      if (startProgress >= 0.99) {
        startProgress = 0;
      }
      this.startGreatCircleTour(startProgress * Math.PI * 2);
    } else {
      this.isTourRunning = false;
      if (this.tourPlayIcon) this.tourPlayIcon.classList.remove('hidden');
      if (this.tourPauseIcon) this.tourPauseIcon.classList.add('hidden');
      if (this.tourPlayText) this.tourPlayText.textContent = 'Resume Tour';
      this.globe.pauseTour();
    }
  }

  startGreatCircleTour(startTheta = 0) {
    if (this.locations.length !== 2 || !this.equidistantGreatCircleData) return;

    const loc1 = this.locations[0];
    const loc2 = this.locations[1];

    if (startTheta >= Math.PI * 2 - 0.05) {
      startTheta = 0;
    }

    this.isTourRunning = true;
    if (this.tourPlayIcon) this.tourPlayIcon.classList.add('hidden');
    if (this.tourPauseIcon) this.tourPauseIcon.classList.remove('hidden');
    if (this.tourPlayText) this.tourPlayText.textContent = 'Pause Tour';
    if (this.tourHud) this.tourHud.classList.remove('hidden');
    if (this.tourOrbitStatus) this.tourOrbitStatus.textContent = '360° Great Circle Orbit';
    if (this.tourWaypointSpotlight) this.tourWaypointSpotlight.classList.add('hidden');

    this.globe.startTour(
      {
        u: this.equidistantGreatCircleData.u,
        v: this.equidistantGreatCircleData.v,
        normal: this.equidistantGreatCircleData.normal,
        waypoints: this.greatCircleWaypoints,
        cityA: loc1,
        cityB: loc2
      },
      startTheta,
      (progress, currentWp, isCompleted) => {
        this.handleTourUpdate(progress, currentWp, isCompleted);
      }
    );
  }

  stopGreatCircleTour() {
    this.isTourRunning = false;
    if (this.tourPlayIcon) this.tourPlayIcon.classList.remove('hidden');
    if (this.tourPauseIcon) this.tourPauseIcon.classList.add('hidden');
    if (this.tourPlayText) this.tourPlayText.textContent = 'Start Tour';
    if (this.tourProgressBar) this.tourProgressBar.style.width = '0%';
    if (this.tourProgressPct) this.tourProgressPct.textContent = '0% Completed';
    if (this.tourOrbitStatus) this.tourOrbitStatus.textContent = '360° Great Circle Orbit';
    if (this.tourWaypointSpotlight) this.tourWaypointSpotlight.classList.add('hidden');
    if (this.globe) this.globe.stopTour();
  }

  handleTourUpdate(progress, currentWp, isCompleted) {
    const pct = Math.round(progress * 100);
    if (this.tourProgressBar) this.tourProgressBar.style.width = `${pct}%`;
    if (this.tourProgressPct) this.tourProgressPct.textContent = `${pct}% Completed`;

    if (isCompleted) {
      this.isTourRunning = false;
      if (this.tourPlayIcon) this.tourPlayIcon.classList.remove('hidden');
      if (this.tourPauseIcon) this.tourPauseIcon.classList.add('hidden');
      if (this.tourPlayText) this.tourPlayText.textContent = 'Replay Tour';
      if (this.tourOrbitStatus) this.tourOrbitStatus.textContent = '360° Orbit Completed';
      if (this.tourWaypointSpotlight) this.tourWaypointSpotlight.classList.add('hidden');
      return;
    }

    if (currentWp) {
      if (this.tourWaypointSpotlight) this.tourWaypointSpotlight.classList.remove('hidden');
      const typeInfo = getPoiTypeInfo(currentWp.type || 'city');
      const icon = currentWp.icon || typeInfo.icon;
      const detailStr = currentWp.detail ? ` • ${currentWp.detail}` : '';
      if (this.spotlightName) {
        this.spotlightName.innerHTML = `<span class="spotlight-poi-icon">${icon}</span> <strong>${currentWp.name}</strong><span class="spotlight-country">${currentWp.country ? ', ' + currentWp.country : ''}</span>${detailStr ? `<span class="spotlight-detail-tag">${detailStr}</span>` : ''}`;
      }
      if (this.spotlightDist) {
        this.spotlightDist.textContent = `${formatDistance(currentWp.avgDist, this.unit)} equidistant to ${this.locations[0].name} & ${this.locations[1].name}`;
      }
      if (this.spotlightCoords) {
        this.spotlightCoords.textContent = formatCoordinates(currentWp.lat, currentWp.lon);
      }
    } else {
      if (this.tourWaypointSpotlight) this.tourWaypointSpotlight.classList.add('hidden');
    }
  }

  openWaypointsModal() {
    if (this.locations.length !== 2 || this.greatCircleWaypoints.length === 0) return;
    this.waypointsModal.classList.remove('hidden');
    const loc1 = this.locations[0];
    const loc2 = this.locations[1];
    if (this.waypointsModalSubtitle) {
      this.waypointsModalSubtitle.innerHTML = `<strong>${this.greatCircleWaypoints.length} locations</strong> along the 40,075 km equidistant path between <strong>${loc1.name}</strong> and <strong>${loc2.name}</strong>`;
    }
    this.renderWaypointsModalCards(this.waypointsSearchInput ? this.waypointsSearchInput.value : '');
  }

  renderWaypointsModalCards(filterText = '') {
    if (!this.waypointsCardsGrid) return;
    this.waypointsCardsGrid.innerHTML = '';

    const q = filterText.toLowerCase().trim();
    const filtered = this.greatCircleWaypoints.filter(wp => {
      if (!q) return true;
      const typeInfo = getPoiTypeInfo(wp.type || 'city');
      return wp.name.toLowerCase().includes(q) ||
        (wp.country && wp.country.toLowerCase().includes(q)) ||
        (wp.type && wp.type.toLowerCase().includes(q)) ||
        (typeInfo.label && typeInfo.label.toLowerCase().includes(q)) ||
        (wp.detail && wp.detail.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      this.waypointsCardsGrid.innerHTML = `
        <div class="empty-waypoints-msg">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>No waypoints found matching "${filterText}"</span>
        </div>
      `;
      return;
    }

    const loc1 = this.locations[0];
    const loc2 = this.locations[1];

    filtered.forEach((wp, idx) => {
      const typeInfo = getPoiTypeInfo(wp.type || 'city');
      const card = document.createElement('div');
      card.className = `waypoint-modal-card ${typeInfo.badgeClass}`;
      card.innerHTML = `
        <div class="waypoint-card-header">
          <div class="waypoint-rank-badge">#${idx + 1}</div>
          <div class="waypoint-titles">
            <div class="waypoint-type-pill ${typeInfo.badgeClass}">
              <span>${typeInfo.icon}</span>
              <span>${typeInfo.label}</span>
            </div>
            <h4 class="waypoint-name">${wp.name}</h4>
            <span class="waypoint-country">${wp.country || 'Region'}</span>
            ${wp.detail ? `<div class="waypoint-detail-snippet">${wp.detail}</div>` : ''}
          </div>
          <span class="waypoint-ortho-tag">${wp.orthoDistKm} ${this.unit} from line</span>
        </div>

        <div class="waypoint-coords-line">
          ${formatCoordinates(wp.lat, wp.lon)}
        </div>

        <div class="waypoint-distances-box">
          <div class="dist-row">
            <span class="dist-city-name">${loc1.name}</span>
            <span class="dist-num">${formatDistance(wp.distA, this.unit)}</span>
          </div>
          <div class="dist-row">
            <span class="dist-city-name">${loc2.name}</span>
            <span class="dist-num">${formatDistance(wp.distB, this.unit)}</span>
          </div>
          <div class="dist-variance-row">
            <span>Variance:</span>
            <span class="dist-variance-val">±${wp.diffDist} ${this.unit}</span>
          </div>
        </div>

        <div class="waypoint-actions">
          <button class="waypoint-action-btn fly-here-btn" title="Center camera on ${wp.name}">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Fly Here
          </button>
          <button class="waypoint-action-btn tour-here-btn" title="Start 360° flyover from ${wp.name}">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Tour From Here
          </button>
        </div>
      `;

      // Asynchronously fetch Wikipedia extract and thumbnail for waypoint card
      fetchWikipediaSummary(wp.name).then(wiki => {
        if (wiki && (wiki.extract || wiki.thumbnail)) {
          const wikiBox = document.createElement('div');
          wikiBox.className = 'waypoint-card-wiki';
          const imgHtml = wiki.thumbnail
            ? `<img src="${wiki.thumbnail}" class="waypoint-wiki-thumb" alt="${wiki.title}"/>`
            : '';
          const extractHtml = wiki.extract
            ? `<div class="waypoint-wiki-snippet">${wiki.extract}</div>`
            : '';
          const linkHtml = wiki.url
            ? `<a href="${wiki.url}" target="_blank" rel="noopener noreferrer" class="waypoint-wiki-link">Wikipedia &#8599;</a>`
            : '';
          wikiBox.innerHTML = `${imgHtml}<div class="waypoint-wiki-body">${extractHtml}${linkHtml}</div>`;
          const actionsEl = card.querySelector('.waypoint-actions');
          if (actionsEl) {
            card.insertBefore(wikiBox, actionsEl);
          }
        }
      });

      const btnFly = card.querySelector('.fly-here-btn');
      btnFly.addEventListener('click', () => {
        this.waypointsModal.classList.add('hidden');
        this.globe.flyTo(wp.lat, wp.lon, 145);
        this.globe.highlightBeacon(wp.name);
      });

      const btnTour = card.querySelector('.tour-here-btn');
      btnTour.addEventListener('click', () => {
        this.waypointsModal.classList.add('hidden');
        this.startGreatCircleTour(wp.theta);
      });

      this.waypointsCardsGrid.appendChild(card);
    });
  }

  /**
   * Export the current Equidistant Great Circle path and waypoints to Google Earth KML or GPS GPX
   */
  exportCurrentGreatCircle(format = 'kml') {
    if (this.locations.length !== 2 || !this.equidistantGreatCircleData) {
      this.showToast('Please select 2 locations to export the Great Circle path');
      return;
    }

    const loc1 = this.locations[0];
    const loc2 = this.locations[1];
    const safeA = loc1.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const safeB = loc2.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    if (format === 'both') {
      const kml = exportToKML(loc1, loc2, this.equidistantGreatCircleData, this.greatCircleWaypoints, this.unit);
      downloadFile(kml, `equidistance-${safeA}-${safeB}.kml`, 'application/vnd.google-earth.kml+xml');
      setTimeout(() => {
        const gpx = exportToGPX(loc1, loc2, this.equidistantGreatCircleData, this.greatCircleWaypoints, this.unit);
        downloadFile(gpx, `equidistance-${safeA}-${safeB}.gpx`, 'application/gpx+xml');
      }, 250);
      this.showToast(`✓ Downloaded both KML & GPX for ${loc1.name} & ${loc2.name}`);
      return;
    }

    const filename = `equidistance-${safeA}-${safeB}.${format}`;

    if (format === 'kml') {
      const kml = exportToKML(loc1, loc2, this.equidistantGreatCircleData, this.greatCircleWaypoints, this.unit);
      downloadFile(kml, filename, 'application/vnd.google-earth.kml+xml');
      this.showToast(`✓ Downloaded ${filename} for Google Earth`);
    } else {
      const gpx = exportToGPX(loc1, loc2, this.equidistantGreatCircleData, this.greatCircleWaypoints, this.unit);
      downloadFile(gpx, filename, 'application/gpx+xml');
      this.showToast(`✓ Downloaded ${filename} for GPS Devices`);
    }
  }

  /**
   * Toggle Cinematic Clean View Mode (hides all overlays for presentations/screen recordings)
   */
  toggleCinematicMode(forceState = null) {
    this.isCinematicMode = forceState !== null ? forceState : !this.isCinematicMode;
    document.body.classList.toggle('cinematic-mode', this.isCinematicMode);

    if (this.cinematicExitBadge) {
      this.cinematicExitBadge.classList.toggle('hidden', !this.isCinematicMode);
    }
    if (this.btnCinematicMode) {
      this.btnCinematicMode.classList.toggle('active', this.isCinematicMode);
    }
    if (this.isCinematicMode) {
      this.showToast('Cinematic Mode Active • Press ESC or C to exit', 2500);
    }
  }

  /**
   * Shows an ephemeral floating toast notification
   */
  showToast(message, duration = 3000) {
    if (!this.toastNotification) return;
    this.toastNotification.textContent = message;
    this.toastNotification.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastNotification.classList.add('hidden');
    }, duration);
  }

  /**
   * Reads shareable permalink configuration from the URL hash
   */
  readUrlHash() {
    if (!window.location.hash || window.location.hash.length <= 1) return;
    try {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      if (params.has('unit')) {
        const u = params.get('unit');
        if (['km', 'mi', 'nm'].includes(u)) this.unit = u;
      }

      if (params.has('dist')) {
        const d = parseFloat(params.get('dist'));
        if (!isNaN(d) && d > 0) this.distance = d;
      }

      if (params.has('daynight')) {
        this.isDayNightActive = params.get('daynight') === '1';
      }

      if (params.has('voronoi')) {
        this.isVoronoiActive = params.get('voronoi') === '1';
      }

      if (params.has('cities')) {
        const citiesRaw = params.get('cities');
        const matchedPresetIdx = this.dynamicPresets ? this.dynamicPresets.findIndex(p => p.id === citiesRaw) : -1;
        if (matchedPresetIdx >= 0) {
          this.activePresetIndex = matchedPresetIdx;
          this.locations = this.dynamicPresets[matchedPresetIdx].cities.map(c => ({ ...c }));
        } else {
          const items = citiesRaw.includes('|') ? citiesRaw.split('|') : citiesRaw.split(',');
          const parsed = [];
          for (const item of items) {
            if (item.includes(':')) {
              const [name, coords] = item.split(':');
              const [latStr, lonStr] = (coords || '').split(',');
              const lat = parseFloat(latStr);
              const lon = parseFloat(lonStr);
              if (!isNaN(lat) && !isNaN(lon)) {
                parsed.push({ name: decodeURIComponent(name), country: '', lat, lon });
              }
            } else {
              const match = MAJOR_CITIES.find(c => c.name.toLowerCase() === item.toLowerCase()) ||
                            CURATED_PLACES.find(p => p.name.toLowerCase() === item.toLowerCase());
              if (match) parsed.push({ ...match });
            }
          }
          if (parsed.length >= 2) {
            this.locations = parsed;
            this.activePresetIndex = -1;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse URL permalink hash', e);
    }
  }

  /**
   * Updates the shareable URL hash without reloading the page
   */
  updateUrlHash() {
    try {
      const params = new URLSearchParams();
      const cityStr = this.locations.map(c => `${encodeURIComponent(c.name)}:${c.lat.toFixed(4)},${c.lon.toFixed(4)}`).join('|');
      params.set('cities', cityStr);

      params.set('unit', this.unit);
      params.set('dist', Math.round(this.distance));
      if (this.isDayNightActive) params.set('daynight', '1');
      if (this.isVoronoiActive) params.set('voronoi', '1');

      const newHash = '#' + params.toString();
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    } catch (e) {
      console.warn('Could not update URL hash', e);
    }
  }
}

// Start app on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new AppController();
});
