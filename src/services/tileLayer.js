/**
 * Dynamic High-Resolution Mapbox Streets (OpenStreetMap) Tile Mesh Layer
 * Dynamically loads and renders official Mapbox Streets tiles as curved spherical patches
 * directly on the 3D globe surface as the user zooms in (Zoom 4 to Zoom 14+).
 */

import * as THREE from 'three';
import { latLonToVector3, vector3ToLatLon, toRad } from '../math.js';

// Mapbox access token (configured via VITE_MAPBOX_TOKEN env var)
const MAPBOX_TOKEN = import.meta.env?.VITE_MAPBOX_TOKEN || '';

// Official Mapbox Style Palettes with High-Contrast options
export const MAPBOX_PALETTES = {
  streets: 'mapbox/streets-v12',
  outdoors: 'mapbox/outdoors-v12',   // High-Contrast Topographical Outdoors
  dark: 'mapbox/dark-v11',           // High-Contrast Midnight Cyber Dark
  satellite: 'mapbox/satellite-streets-v12'
};

export class DynamicTileLayer {
  constructor(earthRadius, parentGroup) {
    this.earthRadius = earthRadius;
    this.group = new THREE.Group();
    this.group.name = 'dynamic-tile-layer';
    parentGroup.add(this.group);

    this.styleId = MAPBOX_PALETTES.streets;
    this.tileCache = new Map(); // key -> { mesh, texture, geometry, material, zoom }
    this.activeKeys = new Set();

    this.textureLoader = new THREE.TextureLoader();
    this.textureLoader.crossOrigin = 'anonymous';

    this.raycaster = new THREE.Raycaster();
    this.currentOpacity = 1.0;

    // Pre-allocate screen sample points covering full widescreen view (9 cols x 6 rows = 54 sample rays)
    this.sampleGrid = [];
    const xSteps = [-1.0, -0.75, -0.5, -0.25, 0.0, 0.25, 0.5, 0.75, 1.0];
    const ySteps = [-1.0, -0.6, -0.2, 0.2, 0.6, 1.0];
    for (const x of xSteps) {
      for (const y of ySteps) {
        this.sampleGrid.push(new THREE.Vector2(x, y));
      }
    }

    this.tempVec = new THREE.Vector3();
    this.lastCheckTime = 0;
    this.lastCenter = { lat: 0, lon: 0 };
    this.lastZoom = -1;
  }

  /**
   * Create curved spherical tile geometry matching Web Mercator bounds for tile (z, x, y)
   */
  createTileGeometry(z, x, y, radius) {
    const n = Math.pow(2, z);
    const lon0 = (x / n) * 360 - 180;
    const lon1 = ((x + 1) / n) * 360 - 180;

    const segments = 8;
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let j = 0; j <= segments; j++) {
      const vNorm = j / segments;
      const mercY = y + vNorm;
      const clampedMercY = Math.max(0.0001, Math.min(n - 0.0001, mercY));
      const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * clampedMercY) / n)));
      const lat = (latRad * 180) / Math.PI;

      for (let i = 0; i <= segments; i++) {
        const uNorm = i / segments;
        const lon = lon0 + uNorm * (lon1 - lon0);
        const pos = latLonToVector3(lat, lon, radius);

        positions.push(pos.x, pos.y, pos.z);
        // Three.js UV: (u, 1 - v) so texture renders upright
        uvs.push(uNorm, 1 - vNorm);
      }
    }

    for (let j = 0; j < segments; j++) {
      for (let i = 0; i < segments; i++) {
        const p00 = j * (segments + 1) + i;
        const p10 = p00 + 1;
        const p01 = (j + 1) * (segments + 1) + i;
        const p11 = p01 + 1;

        indices.push(p00, p01, p10);
        indices.push(p10, p01, p11);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Update dynamic tile meshes based on camera position and zoom level.
   * Uses ultra-fast ray-sphere sampling across the full viewport to load edge-to-edge tiles.
   */
  update(camera, earthMesh, earthGroup, altitude, transition, mapMode) {
    if (mapMode === 'satellite' || transition < 0.04 || altitude > 125) {
      if (this.group.visible) {
        this.group.visible = false;
      }
      return;
    }

    this.group.visible = true;
    const tileOpacity = mapMode === 'traditional' ? 1.0 : transition;
    this.currentOpacity = tileOpacity;

    // Apply opacity to all currently active tile meshes
    this.activeKeys.forEach((key) => {
      const tile = this.tileCache.get(key);
      if (tile && tile.material) {
        tile.material.opacity = tileOpacity;
      }
    });

    const now = performance.now();
    if (now - this.lastCheckTime < 140) {
      return;
    }
    this.lastCheckTime = now;

    // Screen-space ray-sphere intersections across 54 sample points to find exact visible bounding box
    const R = this.earthRadius;
    const hitCoords = [];
    let centerLat = 0;
    let centerLon = 0;
    let centerFound = false;

    for (let k = 0; k < this.sampleGrid.length; k++) {
      const pt = this.sampleGrid[k];
      this.raycaster.setFromCamera(pt, camera);
      const origin = this.raycaster.ray.origin;
      const dir = this.raycaster.ray.direction;

      // Closed-form algebraic ray-sphere intersection (< 0.001ms for all rays)
      const b = origin.dot(dir);
      const c = origin.dot(origin) - R * R;
      const disc = b * b - c;

      if (disc >= 0) {
        const t = -b - Math.sqrt(disc);
        if (t > 0) {
          this.tempVec.copy(origin).addScaledVector(dir, t);
          earthGroup.worldToLocal(this.tempVec);
          const coord = vector3ToLatLon(this.tempVec);
          hitCoords.push(coord);

          if (pt.x === 0.0 && pt.y === 0.0) {
            centerLat = coord.lat;
            centerLon = coord.lon;
            centerFound = true;
          }
        }
      }
    }

    if (!centerFound) {
      if (hitCoords.length > 0) {
        centerLat = hitCoords[0].lat;
        centerLon = hitCoords[0].lon;
      } else {
        // Fallback: camera sub-satellite point
        this.tempVec.copy(camera.position);
        earthGroup.worldToLocal(this.tempVec);
        const fb = vector3ToLatLon(this.tempVec);
        centerLat = fb.lat;
        centerLon = fb.lon;
      }
    }

    // Calibrated altitude-to-zoom mapping:
    // Ensures place names, town names, and street typography render at large, clearly legible sizes (22px-30px screen scale)
    let targetZoom = 4;
    if (altitude < 0.45) {
      targetZoom = 13;
    } else if (altitude < 0.9) {
      targetZoom = 12;
    } else if (altitude < 1.8) {
      targetZoom = 11;
    } else if (altitude < 3.6) {
      targetZoom = 10;
    } else if (altitude < 7.5) {
      targetZoom = 9;
    } else if (altitude < 15.0) {
      targetZoom = 8;
    } else if (altitude < 32.0) {
      targetZoom = 7;
    } else if (altitude < 65.0) {
      targetZoom = 6;
    } else if (altitude < 115.0) {
      targetZoom = 5;
    } else {
      targetZoom = 4;
    }

    // Determine geographic bounding box visible on screen
    let minDLon = -6;
    let maxDLon = 6;
    let minLat = centerLat - 5;
    let maxLat = centerLat + 5;

    if (hitCoords.length > 0) {
      minDLon = 0;
      maxDLon = 0;
      minLat = centerLat;
      maxLat = centerLat;

      for (let i = 0; i < hitCoords.length; i++) {
        const p = hitCoords[i];
        const dLon = ((p.lon - centerLon + 540) % 360) - 180;
        if (dLon < minDLon) minDLon = dLon;
        if (dLon > maxDLon) maxDLon = dLon;
        if (p.lat < minLat) minLat = p.lat;
        if (p.lat > maxLat) maxLat = p.lat;
      }
    }

    const clampedMinLat = Math.max(-85.0511, Math.min(85.0511, minLat));
    const clampedMaxLat = Math.max(-85.0511, Math.min(85.0511, maxLat));

    let n = Math.pow(2, targetZoom);
    let minTileX = 0;
    let maxTileX = 0;
    let minTileY = 0;
    let maxTileY = 0;

    // Viewport tile solver: guarantees 100% full screen coverage with safety margin while capping tile budget
    while (targetZoom >= 4) {
      n = Math.pow(2, targetZoom);

      const latRadMax = toRad(clampedMaxLat);
      const latRadMin = toRad(clampedMinLat);
      const topY = Math.floor(((1 - Math.log(Math.tan(Math.PI / 4 + latRadMax / 2)) / Math.PI) / 2) * n);
      const botY = Math.floor(((1 - Math.log(Math.tan(Math.PI / 4 + latRadMin / 2)) / Math.PI) / 2) * n);

      // 1-tile safety margin around visible screen bounds
      minTileY = Math.max(0, Math.min(topY, botY) - 1);
      maxTileY = Math.min(n - 1, Math.max(topY, botY) + 1);

      const leftLon = centerLon + minDLon;
      const rightLon = centerLon + maxDLon;
      const leftX = Math.floor(((leftLon + 180) / 360) * n);
      const rightX = Math.floor(((rightLon + 180) / 360) * n);

      minTileX = Math.min(leftX, rightX) - 1;
      maxTileX = Math.max(leftX, rightX) + 1;

      if (maxTileX - minTileX + 1 >= n) {
        minTileX = 0;
        maxTileX = n - 1;
      }

      const countX = maxTileX - minTileX + 1;
      const countY = maxTileY - minTileY + 1;
      const totalTiles = countX * countY;

      // Keep active tile count between 12 and 56 for 60fps performance
      if (totalTiles <= 56 || targetZoom <= 4) {
        break;
      }
      targetZoom--;
    }

    const newActiveKeys = new Set();

    for (let x = minTileX; x <= maxTileX; x++) {
      const tileX = ((x % n) + n) % n;
      for (let y = minTileY; y <= maxTileY; y++) {
        const tileY = y;
        const key = `${targetZoom}_${tileX}_${tileY}`;
        newActiveKeys.add(key);

        if (!this.tileCache.has(key)) {
          this.loadTile(targetZoom, tileX, tileY, key, tileOpacity);
        } else {
          const tile = this.tileCache.get(key);
          if (tile.mesh.parent !== this.group) {
            this.group.add(tile.mesh);
          }
          tile.mesh.visible = true;
          if (tile.material) {
            tile.material.opacity = tileOpacity;
          }
        }
      }
    }

    // Hide tiles outside active set
    this.activeKeys.forEach((key) => {
      if (!newActiveKeys.has(key)) {
        const tile = this.tileCache.get(key);
        if (tile) {
          tile.mesh.visible = false;
        }
      }
    });

    this.activeKeys = newActiveKeys;
    this.lastCenter = { lat: centerLat, lon: centerLon };
    this.lastZoom = targetZoom;

    // Prune cache to maintain smooth memory profile
    if (this.tileCache.size > 180) {
      for (const [key, tile] of this.tileCache.entries()) {
        if (!this.activeKeys.has(key)) {
          if (tile.mesh.parent) tile.mesh.parent.remove(tile.mesh);
          if (tile.geometry) tile.geometry.dispose();
          if (tile.texture) tile.texture.dispose();
          if (tile.material) tile.material.dispose();
          this.tileCache.delete(key);
          if (this.tileCache.size <= 100) break;
        }
      }
    }
  }

  /**
   * Change Mapbox style palette dynamically (streets, outdoors, dark, satellite)
   */
  setPalette(paletteKey) {
    const nextStyle = MAPBOX_PALETTES[paletteKey] || MAPBOX_PALETTES.streets;
    if (this.styleId === nextStyle) return;
    this.styleId = nextStyle;

    // Purge cached tiles so new palette tiles load cleanly
    this.tileCache.forEach((tile) => {
      if (tile.mesh.parent) tile.mesh.parent.remove(tile.mesh);
      if (tile.geometry) tile.geometry.dispose();
      if (tile.texture) tile.texture.dispose();
      if (tile.material) tile.material.dispose();
    });
    this.tileCache.clear();
    this.activeKeys.clear();
    this.lastZoom = -1; // force fresh update
  }

  /**
   * Load and construct a curved tile mesh with high-resolution 256@2x Mapbox tiles.
   */
  loadTile(z, x, y, key, opacity) {
    const radius = this.earthRadius * 1.0004;
    const geometry = this.createTileGeometry(z, x, y, radius);

    const style = this.styleId || MAPBOX_PALETTES.streets;
    const primaryUrl = `https://api.mapbox.com/styles/v1/${style}/tiles/256/${z}/${x}/${y}@2x?access_token=${MAPBOX_TOKEN}`;
    const fallbackUrl = `https://api.mapbox.com/styles/v1/${style}/tiles/256/${z}/${x}/${y}?access_token=${MAPBOX_TOKEN}`;
    const osmFallbackUrl = `https://a.tile.openstreetmap.fr/osmfr/${z}/${x}/${y}.png`;

    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.0, // starts transparent until texture is decoded
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 2;
    mesh.name = `mapbox-tile-${key}`;
    this.group.add(mesh);

    const texture = this.textureLoader.load(
      primaryUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        material.map = tex;
        material.opacity = this.currentOpacity !== undefined ? this.currentOpacity : opacity;
        material.needsUpdate = true;
      },
      undefined,
      () => {
        // Fallback 1: standard 256px Mapbox tile
        this.textureLoader.load(
          fallbackUrl,
          (fbTex) => {
            fbTex.colorSpace = THREE.SRGBColorSpace;
            material.map = fbTex;
            material.opacity = this.currentOpacity !== undefined ? this.currentOpacity : opacity;
            material.needsUpdate = true;
          },
          undefined,
          () => {
            // Fallback 2: OpenStreetMap France tile server
            this.textureLoader.load(osmFallbackUrl, (osmTex) => {
              osmTex.colorSpace = THREE.SRGBColorSpace;
              material.map = osmTex;
              material.opacity = this.currentOpacity !== undefined ? this.currentOpacity : opacity;
              material.needsUpdate = true;
            });
          }
        );
      }
    );

    this.tileCache.set(key, { mesh, texture, geometry, material, zoom: z });
  }

  dispose() {
    this.tileCache.forEach((tile) => {
      if (tile.mesh.parent) tile.mesh.parent.remove(tile.mesh);
      if (tile.geometry) tile.geometry.dispose();
      if (tile.texture) tile.texture.dispose();
      if (tile.material) tile.material.dispose();
    });
    this.tileCache.clear();
    this.activeKeys.clear();
  }
}
