/**
 * Exporter Service — KML and GPX Export for Google Earth and GPS Navigation
 */

/**
 * Downloads a string as a file in the browser
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Exports the Equidistant Great Circle and its waypoints to Google Earth KML
 */
export function exportToKML(cityA, cityB, circleData, waypoints = [], unit = 'km') {
  const title = `EquiDistance — ${cityA.name} & ${cityB.name}`;
  const desc = `Spherical Perpendicular Bisector Great Circle. Every point along this line is equidistant to both ${cityA.name} (${cityA.country || ''}) and ${cityB.name} (${cityB.country || ''}).`;

  let coordString = '';
  if (circleData && circleData.sampleCoords) {
    coordString = circleData.sampleCoords
      .map(pt => `${pt.lon.toFixed(6)},${pt.lat.toFixed(6)},500`)
      .join('\n            ');
  }

  let waypointsKml = '';
  if (waypoints && waypoints.length > 0) {
    waypointsKml = waypoints.map(wp => `
    <Placemark>
      <name>${escapeXml(wp.name)}</name>
      <description><![CDATA[
        <p><strong>Category:</strong> ${escapeXml(wp.type || 'Landmark')}</p>
        <p><strong>Country:</strong> ${escapeXml(wp.country || 'N/A')}</p>
        ${wp.detail ? `<p><strong>Detail:</strong> ${escapeXml(wp.detail)}</p>` : ''}
        <p><strong>Equidistant Distance:</strong> ~${wp.avgDist || 0} ${unit} to both ${escapeXml(cityA.name)} and ${escapeXml(cityB.name)}</p>
      ]]></description>
      <Point>
        <coordinates>${wp.lon.toFixed(6)},${wp.lat.toFixed(6)},0</coordinates>
      </Point>
    </Placemark>`).join('');
  }

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(title)}</name>
    <description>${escapeXml(desc)}</description>
    <Style id="greatCircleLine">
      <LineStyle>
        <color>ff81b910</color> <!-- Emerald Green aabbggrr -->
        <width>4</width>
      </LineStyle>
    </Style>
    <Placemark>
      <name>Equidistant Great Circle Path</name>
      <styleUrl>#greatCircleLine</styleUrl>
      <LineString>
        <extrude>1</extrude>
        <tessellate>1</tessellate>
        <altitudeMode>relativeToGround</altitudeMode>
        <coordinates>
            ${coordString}
        </coordinates>
      </LineString>
    </Placemark>
    <Folder>
      <name>Reference Cities</name>
      <Placemark>
        <name>${escapeXml(cityA.name)}</name>
        <Point>
          <coordinates>${cityA.lon.toFixed(6)},${cityA.lat.toFixed(6)},0</coordinates>
        </Point>
      </Placemark>
      <Placemark>
        <name>${escapeXml(cityB.name)}</name>
        <Point>
          <coordinates>${cityB.lon.toFixed(6)},${cityB.lat.toFixed(6)},0</coordinates>
        </Point>
      </Placemark>
    </Folder>
    <Folder>
      <name>Waypoints along Great Circle (${waypoints.length})</name>
      ${waypointsKml}
    </Folder>
  </Document>
</kml>`;

  return kml;
}

/**
 * Exports the Great Circle route and waypoints to standard GPS Exchange Format (GPX)
 */
export function exportToGPX(cityA, cityB, circleData, waypoints = [], unit = 'km') {
  const title = `EquiDistance — ${cityA.name} to ${cityB.name}`;

  let waypointsGpx = '';
  if (waypoints && waypoints.length > 0) {
    waypointsGpx = waypoints.map(wp => `
  <wpt lat="${wp.lat.toFixed(6)}" lon="${wp.lon.toFixed(6)}">
    <name>${escapeXml(wp.name)}</name>
    <desc>${escapeXml(wp.detail || wp.type || 'Landmark')} (${wp.country || ''}) - Equidistant to ${cityA.name} &amp; ${cityB.name}</desc>
    <type>${escapeXml(wp.type || 'Landmark')}</type>
  </wpt>`).join('');
  }

  let trkpts = '';
  if (circleData && circleData.sampleCoords) {
    trkpts = circleData.sampleCoords
      .map(pt => `      <trkpt lat="${pt.lat.toFixed(6)}" lon="${pt.lon.toFixed(6)}"></trkpt>`)
      .join('\n');
  }

  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="EquiDistance - https://equidistance.app" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(title)}</name>
    <desc>Equidistant Great Circle track between ${escapeXml(cityA.name)} and ${escapeXml(cityB.name)}</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <wpt lat="${cityA.lat.toFixed(6)}" lon="${cityA.lon.toFixed(6)}">
    <name>${escapeXml(cityA.name)}</name>
    <desc>Reference Endpoint A</desc>
  </wpt>
  <wpt lat="${cityB.lat.toFixed(6)}" lon="${cityB.lon.toFixed(6)}">
    <name>${escapeXml(cityB.name)}</name>
    <desc>Reference Endpoint B</desc>
  </wpt>
  ${waypointsGpx}
  <trk>
    <name>Equidistant Great Circle</name>
    <desc>Global spherical perpendicular bisector path</desc>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;

  return gpx;
}

function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}
