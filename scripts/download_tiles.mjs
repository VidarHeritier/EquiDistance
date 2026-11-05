import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, 'temp_tiles');

if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

const token = process.env.VITE_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN || "";
const zoom = 4;
const n = Math.pow(2, zoom); // 16 -> 256 tiles
console.log(`Downloading ${n * n} Mapbox Streets tiles at zoom ${zoom}...`);

const allCoords = [];
for (let x = 0; x < n; x++) {
  for (let y = 0; y < n; y++) {
    allCoords.push({ x, y });
  }
}

// Batch in chunks of 20
const chunkSize = 20;
for (let i = 0; i < allCoords.length; i += chunkSize) {
  const chunk = allCoords.slice(i, i + chunkSize);
  await Promise.all(
    chunk.map(async ({ x, y }) => {
      const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/${zoom}/${x}/${y}?access_token=${token}`;
      const outPath = path.join(tempDir, `${x}_${y}.png`);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(outPath, buf);
      } catch (err) {
        console.error(`Error ${x}_${y}:`, err.message);
      }
    })
  );
}

console.log('All 256 Mapbox Streets tiles downloaded successfully!');
