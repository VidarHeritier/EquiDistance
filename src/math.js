/**
 * Spherical Trigonometry & Equidistance Engine for Earth
 * Earth is modeled as a sphere of radius R = 6371.0088 km
 */

export const EARTH_RADIUS = {
  km: 6371.0088,
  mi: 3958.7613,
  nm: 3440.065
};

export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export function toRad(deg) {
  return deg * DEG2RAD;
}

export function toDeg(rad) {
  return rad * RAD2DEG;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Convert lat/lon in degrees to 3D unit vector for Three.js
 * Aligned with Three.js SphereGeometry equirectangular UV mapping:
 * - North Pole (+Y at lat +90)
 * - South Pole (-Y at lat -90)
 * - Prime Meridian (lon 0, lat 0) at +X
 * - East longitudes (lon > 0, e.g. Shanghai +121.5) in -Z / -X quadrant
 * - West longitudes (lon < 0, e.g. New York -74.0) in +Z / +X quadrant
 */
export function latLonToVector3(lat, lon, radius = 1) {
  const phi = toRad(lat);
  const lambda = toRad(lon);
  
  const x = radius * Math.cos(phi) * Math.cos(lambda);
  const y = radius * Math.sin(phi);
  const z = -radius * Math.cos(phi) * Math.sin(lambda);

  return { x, y, z };
}

/**
 * Convert 3D vector to lat/lon degrees
 */
export function vector3ToLatLon(v) {
  const norm = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (norm < 1e-12) return { lat: 0, lon: 0 };
  
  const ny = v.y / norm;
  const lat = Math.asin(clamp(ny, -1, 1)) * RAD2DEG;
  
  // x = radius * cos(lat) * cos(lon)
  // -z = radius * cos(lat) * sin(lon)
  // lon = atan2(-z, x)
  let lon = Math.atan2(-v.z, v.x) * RAD2DEG;
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;

  return { lat, lon };
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

export function length(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function normalize(v) {
  const len = length(v);
  if (len < 1e-12) return { x: 0, y: 1, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

export function scale(v, s) {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

/**
 * Great-circle distance between two lat/lon coordinates using Haversine
 */
export function haversineDistance(lat1, lon1, lat2, lon2, unit = 'km') {
  const R = EARTH_RADIUS[unit] || EARTH_RADIUS.km;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  return R * c;
}

/**
 * Great-circle angular distance (in radians) between two 3D unit vectors
 */
export function angularDistance(v1, v2) {
  const d = dot(normalize(v1), normalize(v2));
  return Math.acos(clamp(d, -1, 1));
}

/**
 * Generate points along a small circle of given angular distance from center
 * Returns array of 3D points on unit sphere
 */
export function generateDistanceRingPoints(centerLat, centerLon, distance, numPoints = 128, unit = 'km') {
  const R = EARTH_RADIUS[unit] || EARTH_RADIUS.km;
  const theta = distance / R; // angular radius in radians
  
  if (theta <= 0 || theta >= Math.PI) {
    return [];
  }

  const centerVec = normalize(latLonToVector3(centerLat, centerLon, 1));
  
  // Find two orthonormal vectors perpendicular to centerVec
  let arbitrary = { x: 0, y: 1, z: 0 };
  if (Math.abs(centerVec.y) > 0.9) {
    arbitrary = { x: 1, y: 0, z: 0 };
  }
  
  const u = normalize(cross(centerVec, arbitrary));
  const v = normalize(cross(centerVec, u));

  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);

  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    // p = center * cosTheta + (u * cosAngle + v * sinAngle) * sinTheta
    const pt = {
      x: centerVec.x * cosTheta + (u.x * cosAngle + v.x * sinAngle) * sinTheta,
      y: centerVec.y * cosTheta + (u.y * cosAngle + v.y * sinAngle) * sinTheta,
      z: centerVec.z * cosTheta + (u.z * cosAngle + v.z * sinAngle) * sinTheta
    };
    points.push(pt);
  }

  return points;
}

/**
 * Intersect two spherical circles
 * c1, c2: unit 3D vectors
 * theta1, theta2: angular radii in radians
 * Returns array of 0, 1, or 2 unit vectors
 */
export function intersectTwoCircles(c1, c2, theta1, theta2) {
  const v1 = normalize(c1);
  const v2 = normalize(c2);

  const delta = angularDistance(v1, v2);

  // Check if circles can intersect
  if (delta > theta1 + theta2 + 1e-7 || delta < Math.abs(theta1 - theta2) - 1e-7) {
    return [];
  }

  if (delta < 1e-9) {
    // Concentric
    return [];
  }

  // Construct orthonormal basis {ex, ey, ez}
  const ex = v1;
  const proj = dot(v2, ex);
  const diff = sub(v2, scale(ex, proj));
  const ey = normalize(diff);
  const ez = cross(ex, ey);

  // In this basis:
  // c1 = (1, 0, 0)
  // c2 = (cos(delta), sin(delta), 0)
  // Point x must satisfy:
  // x = cos(theta1)
  // x*cos(delta) + y*sin(delta) = cos(theta2) => y = (cos(theta2) - x*cos(delta)) / sin(delta)
  // x^2 + y^2 + z^2 = 1 => z = +/- sqrt(1 - x^2 - y^2)

  const x = Math.cos(theta1);
  const sinDelta = Math.sin(delta);
  const y = (Math.cos(theta2) - x * Math.cos(delta)) / sinDelta;

  const zSq = 1 - x * x - y * y;
  if (zSq < -1e-6) {
    return [];
  }

  const z = Math.sqrt(Math.max(0, zSq));

  if (z < 1e-7) {
    // Single tangent point
    const pt = add(scale(ex, x), scale(ey, y));
    return [normalize(pt)];
  }

  const pt1 = add(add(scale(ex, x), scale(ey, y)), scale(ez, z));
  const pt2 = add(add(scale(ex, x), scale(ey, y)), scale(ez, -z));

  return [normalize(pt1), normalize(pt2)];
}

/**
 * Calculate the exact spherical circumcenter(s) for 3 points
 * The circumcenters are the two antipodal points on the sphere equidistant to all three points.
 */
export function calculateSphericalCircumcenters(points, unit = 'km') {
  if (points.length < 3) return null;

  const R = EARTH_RADIUS[unit] || EARTH_RADIUS.km;
  const v1 = normalize(latLonToVector3(points[0].lat, points[0].lon, 1));
  const v2 = normalize(latLonToVector3(points[1].lat, points[1].lon, 1));
  const v3 = normalize(latLonToVector3(points[2].lat, points[2].lon, 1));

  // Normal to the plane formed by v1, v2, v3
  const edge1 = sub(v2, v1);
  const edge2 = sub(v3, v1);
  const norm = cross(edge1, edge2);

  const len = length(norm);
  if (len < 1e-8) {
    // Collinear on a great circle
    return null;
  }

  const center1 = normalize(norm);
  const center2 = scale(center1, -1);

  const d1 = angularDistance(center1, v1) * R;
  const d2 = angularDistance(center2, v1) * R;

  const coords1 = vector3ToLatLon(center1);
  const coords2 = vector3ToLatLon(center2);

  return [
    {
      vector: center1,
      lat: coords1.lat,
      lon: coords1.lon,
      distance: d1,
      type: 'primary-circumcenter'
    },
    {
      vector: center2,
      lat: coords2.lat,
      lon: coords2.lon,
      distance: d2,
      type: 'antipodal-circumcenter'
    }
  ];
}

/**
 * Find points on Earth that match the distance criteria from all given locations
 * If N = 2: Returns the 2 intersection points of the two distance circles
 * If N = 3+: Computes pairwise circle intersections and evaluates distance variance to all points
 * Also returns exact circumcenters if equidistant mode is enabled.
 */
export function findMatchingPoints(locations, targetDistance, tolerance = 100, unit = 'km') {
  if (!locations || locations.length < 2) return [];

  const R = EARTH_RADIUS[unit] || EARTH_RADIUS.km;
  const theta = targetDistance / R;

  const candidatePoints = [];

  // 1. Calculate pairwise intersections of the distance circles
  const n = locations.length;
  for (let i = 0; i < n; i++) {
    const locA = locations[i];
    const vA = latLonToVector3(locA.lat, locA.lon, 1);

    for (let j = i + 1; j < n; j++) {
      const locB = locations[j];
      const vB = latLonToVector3(locB.lat, locB.lon, 1);

      const intersections = intersectTwoCircles(vA, vB, theta, theta);
      for (const pt of intersections) {
        const coords = vector3ToLatLon(pt);
        
        // Measure distances to ALL locations
        const distances = locations.map(loc => ({
          name: loc.name,
          distance: haversineDistance(coords.lat, coords.lon, loc.lat, loc.lon, unit)
        }));

        // Calculate maximum difference from target distance
        const diffs = distances.map(d => Math.abs(d.distance - targetDistance));
        const maxDiff = Math.max(...diffs);
        const avgDistance = distances.reduce((sum, d) => sum + d.distance, 0) / n;
        const variance = distances.reduce((sum, d) => sum + Math.pow(d.distance - avgDistance, 2), 0) / n;
        const stdDev = Math.sqrt(variance);

        // Keep candidates that are within tolerance for all points (or best matches)
        candidatePoints.push({
          vector: pt,
          lat: coords.lat,
          lon: coords.lon,
          distances,
          maxDiff,
          stdDev,
          avgDistance,
          matchesAllWithinTolerance: maxDiff <= tolerance,
          pair: [locA.name, locB.name]
        });
      }
    }
  }

  // Filter out duplicates (points very close to each other on the sphere)
  const uniqueCandidates = [];
  for (const cand of candidatePoints) {
    const isDuplicate = uniqueCandidates.some(existing => {
      const dist = haversineDistance(cand.lat, cand.lon, existing.lat, existing.lon, unit);
      return dist < 30; // within 30 km is considered same cluster point
    });
    if (!isDuplicate) {
      uniqueCandidates.push(cand);
    }
  }

  // Sort candidates by match quality (smallest max difference first)
  uniqueCandidates.sort((a, b) => a.maxDiff - b.maxDiff);

  return uniqueCandidates;
}

/**
 * Format coordinates nicely (e.g. 31.23° N, 121.47° E)
 */
export function formatCoordinates(lat, lon) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(3)}° ${latDir}, ${Math.abs(lon).toFixed(3)}° ${lonDir}`;
}

/**
 * Format distance nicely with unit
 */
export function formatDistance(val, unit = 'km') {
  const rounded = Math.round(val);
  const formatted = rounded.toLocaleString();
  return `${formatted} ${unit}`;
}

/**
 * Calculate the spherical perpendicular bisector Great Circle for two points.
 * Every point on this circle circling the entire globe is equidistant to cityA and cityB.
 */
export function calculateEquidistantGreatCircle(cityA, cityB, numSegments = 360, radius = 1) {
  const vA = latLonToVector3(cityA.lat, cityA.lon, 1);
  const vB = latLonToVector3(cityB.lat, cityB.lon, 1);

  // Normal to bisector plane passing through origin: N = (A - B) / |A - B|
  const diff = {
    x: vA.x - vB.x,
    y: vA.y - vB.y,
    z: vA.z - vB.z
  };
  const diffLen = Math.sqrt(diff.x * diff.x + diff.y * diff.y + diff.z * diff.z);
  if (diffLen < 1e-10) return null; // Identical points

  const nx = diff.x / diffLen;
  const ny = diff.y / diffLen;
  const nz = diff.z / diffLen;

  // Midpoint between A and B
  const midSum = { x: vA.x + vB.x, y: vA.y + vB.y, z: vA.z + vB.z };
  const midSumLen = Math.sqrt(midSum.x * midSum.x + midSum.y * midSum.y + midSum.z * midSum.z);
  const midVec = { x: midSum.x / midSumLen, y: midSum.y / midSumLen, z: midSum.z / midSumLen };
  const midpointCoords = vector3ToLatLon(midVec);

  // Antipodal midpoint (on other side of the planet)
  const antipodalCoords = vector3ToLatLon({ x: -midVec.x, y: -midVec.y, z: -midVec.z });

  // Use midpoint as basis vector u (theta = 0 corresponds to closest equidistant midpoint)
  const ux = midVec.x;
  const uy = midVec.y;
  const uz = midVec.z;

  // v = n x u (orthonormal basis in plane)
  const vx = ny * uz - nz * uy;
  const vy = nz * ux - nx * uz;
  const vz = nx * uy - ny * ux;

  // Angular distance between A and B
  const dotAB = clamp(vA.x * vB.x + vA.y * vB.y + vA.z * vB.z, -1, 1);
  const angDistRad = Math.acos(dotAB);
  const minDistanceKm = (angDistRad / 2) * EARTH_RADIUS.km;
  const maxDistanceKm = (Math.PI - angDistRad / 2) * EARTH_RADIUS.km;

  // Generate 3D points along the great circle
  const points = [];
  const coordsList = [];
  const step = (Math.PI * 2) / numSegments;

  for (let i = 0; i <= numSegments; i++) {
    const theta = i * step;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const px = radius * (cosT * ux + sinT * vx);
    const py = radius * (cosT * uy + sinT * vy);
    const pz = radius * (cosT * uz + sinT * vz);

    points.push({ x: px, y: py, z: pz });

    // Store sample lat/lon along the ring
    if (i % 15 === 0 && i < numSegments) {
      const c = vector3ToLatLon({ x: px / radius, y: py / radius, z: pz / radius });
      coordsList.push(c);
    }
  }

  return {
    normal: { x: nx, y: ny, z: nz },
    u: { x: ux, y: uy, z: uz },
    v: { x: vx, y: vy, z: vz },
    points,
    sampleCoords: coordsList,
    midpoint: midpointCoords,
    antipodal: antipodalCoords,
    minDistanceKm,
    maxDistanceKm
  };
}

/**
 * Discovers and sequences points of interest along an equidistant Great Circle.
 * Filters locations within maxDistanceKm of the bisector plane and sorts them along theta (0 to 2*PI).
 */
export function findGreatCircleWaypoints(cityA, cityB, greatCircleData, placesList, maxDistanceKm = 280, unit = 'km') {
  if (!greatCircleData || !greatCircleData.normal || !greatCircleData.u || !greatCircleData.v || !placesList || placesList.length === 0) {
    return [];
  }

  const { normal, u, v } = greatCircleData;
  const R = EARTH_RADIUS[unit] || EARTH_RADIUS.km;
  const sinMaxDist = Math.sin(maxDistanceKm / R);

  const waypoints = [];

  for (const place of placesList) {
    // Skip reference cities themselves
    if (
      (Math.abs(place.lat - cityA.lat) < 0.25 && Math.abs(place.lon - cityA.lon) < 0.25) ||
      (Math.abs(place.lat - cityB.lat) < 0.25 && Math.abs(place.lon - cityB.lon) < 0.25)
    ) {
      continue;
    }

    const pos = latLonToVector3(place.lat, place.lon, 1);
    const dotN = pos.x * normal.x + pos.y * normal.y + pos.z * normal.z;
    const absDotN = Math.abs(dotN);

    if (absDotN <= sinMaxDist) {
      const orthoDistKm = Math.asin(Math.min(1, absDotN)) * R;

      // Project onto Great Circle plane
      const px = pos.x - dotN * normal.x;
      const py = pos.y - dotN * normal.y;
      const pz = pos.z - dotN * normal.z;

      // Decompose into orthonormal basis (u, v)
      const dotU = px * u.x + py * u.y + pz * u.z;
      const dotV = px * v.x + py * v.y + pz * v.z;

      let theta = Math.atan2(dotV, dotU);
      if (theta < 0) theta += Math.PI * 2;

      const distA = haversineDistance(place.lat, place.lon, cityA.lat, cityA.lon, unit);
      const distB = haversineDistance(place.lat, place.lon, cityB.lat, cityB.lon, unit);
      const avgDist = (distA + distB) / 2;
      const diffDist = Math.abs(distA - distB);

      waypoints.push({
        name: place.name,
        country: place.country || '',
        lat: place.lat,
        lon: place.lon,
        theta,
        orthoDistKm: Math.round(orthoDistKm),
        distA: Math.round(distA),
        distB: Math.round(distB),
        avgDist: Math.round(avgDist),
        diffDist: Math.round(diffDist),
        tier: place.tier || 2,
        type: place.type || 'city',
        icon: place.icon || '',
        detail: place.detail || ''
      });
    }
  }

  // Sort sequentially along flight path
  waypoints.sort((a, b) => a.theta - b.theta);

  // Spacing filter: prioritize major cities & iconic natural POIs (mountains, reefs, rivers, lakes)
  const filtered = [];
  const minAngularSep = (Math.PI * 2) / 60; // ~6 degrees separation

  for (const wp of waypoints) {
    const isSpecialPoi = wp.type && wp.type !== 'city';
    const isClose = filtered.some(existing => {
      const dTheta = Math.abs(wp.theta - existing.theta);
      const wrapDTheta = Math.min(dTheta, Math.PI * 2 - dTheta);
      return wrapDTheta < minAngularSep;
    });

    if (!isClose || wp.tier === 1 || isSpecialPoi) {
      filtered.push(wp);
    }
  }

  return filtered.slice(0, 48);
}

/**
 * Calculates the exact subsolar point (declination and Greenwich hour angle) for a given timestamp
 * Based on standard NOAA solar position algorithms
 */
export function getSubsolarPoint(date = new Date()) {
  // Day of year calculation
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = (date - startOfYear) / 86400000;

  // Fractional year in radians (gamma)
  const gamma = (2 * Math.PI / 365.25) * (dayOfYear + date.getUTCHours() / 24);

  // Equation of time in minutes (Spencer 1971 / NOAA)
  const eqtime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

  // Solar declination in radians (Spencer 1971 / NOAA)
  const decl = 0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.001480 * Math.sin(3 * gamma);
  const lat = decl * RAD2DEG;

  // UTC time in decimal hours
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  // Subsolar longitude: 15° per hour away from Greenwich noon, adjusted by Equation of Time
  let lon = -((utcHours - 12) * 15 + eqtime / 4);
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;

  return { lat, lon };
}

/**
 * Computes points on the 360° great circle of the solar day/night terminator
 * The terminator is the great circle perpendicular to the subsolar unit vector
 */
export function computeSolarTerminator(subsolarPoint, numPoints = 180, radius = 1) {
  if (!subsolarPoint) return [];
  const normal = latLonToVector3(subsolarPoint.lat, subsolarPoint.lon, 1);
  const u = normalize(getOrthogonalVector(normal));
  const v = normalize(cross(normal, u));

  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const theta = (i / numPoints) * Math.PI * 2;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const pt = {
      x: (u.x * cosT + v.x * sinT) * radius,
      y: (u.y * cosT + v.y * sinT) * radius,
      z: (u.z * cosT + v.z * sinT) * radius
    };
    points.push(pt);
  }
  return points;
}

/**
 * Computes Spherical Voronoi boundary edges for N >= 3 sites
 * Returns line segments tracing the perpendicular bisector boundaries between adjacent Voronoi cells
 */
export function computeSphericalVoronoiEdges(sites, radius = 1) {
  if (!sites || sites.length < 3) return [];

  const siteVectors = sites.map(s => latLonToVector3(s.lat, s.lon, 1));
  const n = siteVectors.length;
  const edges = [];
  const samples = 120; // angular resolution along great circle bisector

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const vA = siteVectors[i];
      const vB = siteVectors[j];

      // Normal to the perpendicular bisector plane
      const diff = sub(vA, vB);
      const normal = normalize(diff);
      const u = normalize(getOrthogonalVector(normal));
      const v = normalize(cross(normal, u));

      let currentSegment = [];

      for (let s = 0; s <= samples; s++) {
        const theta = (s / samples) * Math.PI * 2;
        const pt = {
          x: u.x * Math.cos(theta) + v.x * Math.sin(theta),
          y: u.y * Math.cos(theta) + v.y * Math.sin(theta),
          z: u.z * Math.cos(theta) + v.z * Math.sin(theta)
        };

        const dotAB = dot(pt, vA); // equals dot(pt, vB)

        // Point is on Voronoi boundary if dot with A and B is >= dot with all other sites
        let isBoundary = true;
        for (let k = 0; k < n; k++) {
          if (k !== i && k !== j) {
            const dotK = dot(pt, siteVectors[k]);
            if (dotK > dotAB + 0.003) {
              isBoundary = false;
              break;
            }
          }
        }

        if (isBoundary) {
          currentSegment.push(scale(pt, radius));
        } else {
          if (currentSegment.length >= 2) {
            edges.push({ siteA: i, siteB: j, points: currentSegment });
          }
          currentSegment = [];
        }
      }

      if (currentSegment.length >= 2) {
        edges.push({ siteA: i, siteB: j, points: currentSegment });
      }
    }
  }

  return edges;
}

/**
 * Generates an equirectangular Canvas with smooth Voronoi color territories
 */
export function generateVoronoiCanvas(sites, colors, width = 1024, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  const siteVectors = sites.map(s => latLonToVector3(s.lat, s.lon, 1));
  const n = siteVectors.length;

  // Pre-parse hex colors to RGB
  const rgbColors = colors.map(c => {
    let hex = typeof c === 'string' ? c.replace('#', '') : c.toString(16).padStart(6, '0');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  });

  for (let y = 0; y < height; y++) {
    const lat = 90 - (y / height) * 180;
    const phi = toRad(lat);
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * 360 - 180;
      const lambda = toRad(lon);

      // Unit vector on sphere matching Three.js mapping
      const px = cosPhi * Math.cos(lambda);
      const py = sinPhi;
      const pz = -cosPhi * Math.sin(lambda);

      // Find top 2 nearest sites by maximizing dot product
      let maxDot1 = -2;
      let maxDot2 = -2;
      let bestIdx = 0;

      for (let k = 0; k < n; k++) {
        const sv = siteVectors[k];
        const d = px * sv.x + py * sv.y + pz * sv.z;
        if (d > maxDot1) {
          maxDot2 = maxDot1;
          maxDot1 = d;
          bestIdx = k;
        } else if (d > maxDot2) {
          maxDot2 = d;
        }
      }

      const pixelIdx = (y * width + x) * 4;
      const color = rgbColors[bestIdx % rgbColors.length];

      // Clean, silky smooth territory fill without pixel grating or moire
      data[pixelIdx] = color.r;
      data[pixelIdx + 1] = color.g;
      data[pixelIdx + 2] = color.b;
      data[pixelIdx + 3] = 68; // Smooth translucent territory wash
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

