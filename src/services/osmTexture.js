/**
 * OpenStreetMap Equirectangular Map Texture Generator
 * Fetches standard OpenStreetMap tiles and composites them into an Equirectangular (Plate Carrée)
 * canvas texture for seamless, 100% authentic cartographic rendering on the 3D globe.
 */

import * as THREE from 'three';

export function createOsmEquirectangularTexture(onUpdate = null) {
  const width = 2048;
  const height = 1024;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // 1. Initial Instant Paint: Classic OpenStreetMap Cartographic Base
  // Water: calm nautical blue (#aad3df)
  ctx.fillStyle = '#aad3df';
  ctx.fillRect(0, 0, width, height);

  // Arctic & Antarctic ice caps
  ctx.fillStyle = '#f0f6fa';
  ctx.fillRect(0, 0, width, Math.round(height * 0.055)); // North Pole
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, Math.round(height * 0.94), width, Math.round(height * 0.06)); // South Pole

  // Coordinate Graticule Lines (every 15 degrees)
  ctx.strokeStyle = '#c4dfe8';
  ctx.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 15) {
    const x = ((lon + 180) / 360) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Create Three.js Texture from Canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  // 2. Fetch & Composite OpenStreetMap Tiles in Parallel
  const loadTilesForZoom = async (zoom) => {
    const n = Math.pow(2, zoom);
    const tileSize = 256;
    const mercSize = n * tileSize;

    const mercCanvas = document.createElement('canvas');
    mercCanvas.width = mercSize;
    mercCanvas.height = mercSize;
    const mercCtx = mercCanvas.getContext('2d');

    // Fill background
    mercCtx.fillStyle = '#aad3df';
    mercCtx.fillRect(0, 0, mercSize, mercSize);

    const tilePromises = [];

    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        const url = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
        const p = new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            mercCtx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
            resolve(true);
          };
          img.onerror = () => {
            resolve(false);
          };
          img.src = url;
        });
        tilePromises.push(p);
      }
    }

    await Promise.all(tilePromises);

    // 3. Re-project Web Mercator into Equirectangular (width x height)
    // Between lat -85.0511° and +85.0511°
    const maxLat = 85.051128;
    const yTop = Math.round(((90 - maxLat) / 180) * height);
    const yBottom = Math.round(((90 + maxLat) / 180) * height);

    // Number of horizontal bands to smoothly project
    const bands = 256;
    const bandH = (yBottom - yTop) / bands;

    for (let b = 0; b < bands; b++) {
      const dstY = yTop + b * bandH;
      const latMid = 90 - ((dstY + bandH * 0.5) / height) * 180;
      const latRad = (latMid * Math.PI) / 180;

      // Mercator formula
      const yRad = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
      const srcY = ((1 - yRad / Math.PI) / 2) * mercSize;
      const srcH = Math.max(1, (bandH / height) * mercSize * Math.cos(latRad));

      ctx.drawImage(
        mercCanvas,
        0, Math.max(0, Math.min(mercSize - 1, srcY)), mercSize, Math.min(srcH, mercSize - srcY),
        0, dstY, width, bandH + 0.5
      );
    }

    texture.needsUpdate = true;
    if (onUpdate) onUpdate(texture);
  };

  // Start with zoom 2 (16 tiles, instant fast load), then upgrade to zoom 3 (64 tiles)
  loadTilesForZoom(2).then(() => {
    // Background upgrade to zoom 3 for sharper detail
    setTimeout(() => {
      loadTilesForZoom(3);
    }, 1200);
  });

  return texture;
}
