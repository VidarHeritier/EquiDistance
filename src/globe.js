/**
 * 3D Globe with Space Background, Atmospheric Shaders, and Interactive Distance Overlays
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  latLonToVector3,
  vector3ToLatLon,
  generateDistanceRingPoints,
  calculateEquidistantGreatCircle,
  getSubsolarPoint,
  computeSolarTerminator,
  computeSphericalVoronoiEdges,
  generateVoronoiCanvas
} from './math.js';
import { getPlacesForAltitude, loadAdditionalPlaces, fetchOSMPlacesForViewport } from './data/places.js';
import { DynamicTileLayer } from './services/tileLayer.js';

export const CITY_COLORS = [
  '#00f0ff', // Electric Cyan
  '#ff007f', // Hot Magenta
  '#ffb703', // Vivid Amber
  '#a855f7', // Electric Violet
  '#10b981', // Emerald
  '#f43f5e', // Rose Red
  '#3b82f6', // Neon Blue
  '#eab308', // Solar Yellow
  '#06b6d4', // Aqua
  '#f97316'  // Orange
];

export class GlobeScene {
  constructor(containerElement, onPointSelect = null, onHover = null) {
    this.container = containerElement;
    this.onPointSelect = onPointSelect;
    this.onHover = onHover;
    this.earthRadius = 100;
    
    this.locations = [];
    this.candidatePoints = [];
    this.currentDistance = 5000;
    this.currentUnit = 'km';

    this.mapMode = 'auto'; // 'auto' | 'traditional' | 'satellite'
    this.uTransition = { value: 0.0 };
    this.transitionVal = 0.0;
    this.lastFrameTime = performance.now();
    this.lastLabelUpdateTime = 0;
    this.dynamicTileLayer = null;
    this.labelsContainer = document.getElementById('globe-labels-container');
    this.placeLabelsMap = new Map();
    this.coastlinesMat = null;
    this.bordersMat = null;
    this.lastOsmFetchTime = 0;

    this.cityMeshGroup = new THREE.Group();
    this.ringsGroup = new THREE.Group();
    this.bisectorLineGroup = new THREE.Group();
    this.candidatesGroup = new THREE.Group();
    this.arcsGroup = new THREE.Group();
    this.tourBeaconGroup = new THREE.Group();
    this.voronoiGroup = new THREE.Group();
    this.terminatorGroup = new THREE.Group();

    // Day/Night and Voronoi state
    this.isDayNightActive = false;
    this.isVoronoiActive = false;
    this.uDayNight = { value: 0.0 };
    this.uSunDirection = { value: new THREE.Vector3(1, 0, 0) };
    this.lastSolarUpdateTime = 0;
    
    // Great Circle Flyover Tour State
    this.isTourActive = false;
    this.tourProgress = 0.0;
    this.tourDuration = 48; // seconds for full 360 rotation at 1x
    this.tourSpeed = 1.0;
    this.tourData = null; // { u, v, normal, waypoints, cityA, cityB }
    this.onTourUpdate = null;
    
    // Easter Eggs State (Moon in background)
    this.moonEl = null;

    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Line = { threshold: 3.5 };
    this.mouse = new THREE.Vector2();

    this.isAutoRotating = true;
    this.animationId = null;

    this.initScene();
    this.createSpaceEnvironment();
    this.createEarth();
    this.createAtmosphere();
    this.initEventListeners();
    this.initEasterEggs();
    this.animate = this.animate.bind(this);
    this.animate();

    loadAdditionalPlaces();
  }

  setMapMode(mode) {
    this.mapMode = mode;
    if (this.dynamicTileLayer) {
      if (mode === 'outdoors') {
        this.dynamicTileLayer.setPalette('outdoors');
      } else if (mode === 'dark') {
        this.dynamicTileLayer.setPalette('dark');
      } else if (mode === 'satellite') {
        this.dynamicTileLayer.setPalette('satellite');
      } else {
        this.dynamicTileLayer.setPalette('streets');
      }
    }
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x02030a, 0.0006);

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.05, 12000);
    // Initial camera position farther back so the full globe is comfortably visible above bottom panel
    this.camera.position.set(0, 42, 395);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.container.appendChild(this.renderer.domElement);

    // Orbit Controls - deep zoom enabled right down to 0.25 units above surface (~16 km above ground)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 100.25;
    this.controls.maxDistance = 1200;
    this.controls.rotateSpeed = 0.6;
    this.controls.zoomSpeed = 0.8;

    // Position camera view offset so the globe sits slightly to the left (avoiding the sidebar)
    this.updateCameraViewport();

    // Balanced bright lighting so continents, landmasses and oceans are distinct and vivid
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x476382, 1.25);
    this.scene.add(hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.9);
    this.sunLight.position.set(400, 200, 300);
    this.scene.add(this.sunLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.35);
    fillLight.position.set(-400, -100, -300);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
    rimLight.position.set(0, 350, -300);
    this.scene.add(rimLight);

    // Groups
    this.earthGroup = new THREE.Group();
    this.earthGroup.add(this.cityMeshGroup);
    this.earthGroup.add(this.ringsGroup);
    this.earthGroup.add(this.bisectorLineGroup);
    this.earthGroup.add(this.candidatesGroup);
    this.earthGroup.add(this.arcsGroup);
    this.earthGroup.add(this.tourBeaconGroup);
    this.earthGroup.add(this.voronoiGroup);
    this.earthGroup.add(this.terminatorGroup);
    this.scene.add(this.earthGroup);
  }

  createSpaceEnvironment() {
    // 1. Procedural Deep Cosmic Starfield (3,500 stars with varied brightness & colors)
    const starCount = 3500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#93c5fd'),
      new THREE.Color('#fde047'),
      new THREE.Color('#c084fc'),
      new THREE.Color('#67e8f9')
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 1200 + Math.random() * 2000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;

      starSizes[i] = 1.0 + Math.random() * 2.5;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    // Custom star shader for round glowing stars
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float twinkle = sin(time * 2.0 + position.x * 0.05) * 0.25 + 0.85;
          gl_PointSize = size * twinkle * (800.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, dist);
          gl_FragColor = vec4(vColor, alpha * 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starField);

    // 2. Cosmic Nebula Background Dome
    const nebulaGeo = new THREE.SphereGeometry(3200, 32, 32);
    const nebulaMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float y = vNormal.y;
          vec3 darkSpace = vec3(0.01, 0.015, 0.04);
          vec3 cosmicBlue = vec3(0.02, 0.05, 0.12);
          vec3 nebulaPurple = vec3(0.06, 0.02, 0.08);
          
          float blend1 = smoothstep(-1.0, 0.4, y);
          float blend2 = smoothstep(0.0, 1.0, vNormal.x);
          
          vec3 col = mix(darkSpace, cosmicBlue, blend1 * 0.5);
          col = mix(col, nebulaPurple, blend2 * 0.25);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      depthWrite: false
    });
    this.scene.add(new THREE.Mesh(nebulaGeo, nebulaMat));
  }

  createEarth() {
    const textureLoader = new THREE.TextureLoader();
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    
    // Day earth texture - 16x anisotropic filtering for crisp detail at extreme angles & deep zoom
    const dayTexture = textureLoader.load('/textures/earth-blue-marble.jpg');
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    dayTexture.anisotropy = maxAnisotropy;
    dayTexture.minFilter = THREE.LinearMipmapLinearFilter;
    dayTexture.magFilter = THREE.LinearFilter;
    dayTexture.generateMipmaps = true;

    // Bump map for terrain topography elevation
    const bumpTexture = textureLoader.load('/textures/earth-topology.png');
    bumpTexture.anisotropy = maxAnisotropy;
    bumpTexture.minFilter = THREE.LinearMipmapLinearFilter;
    bumpTexture.magFilter = THREE.LinearFilter;
    bumpTexture.generateMipmaps = true;

    // Ultra-dense sphere geometry (128 x 128 segments) for seamless, smooth surface curvature when zoomed in close
    const earthGeometry = new THREE.SphereGeometry(this.earthRadius, 128, 128);
    
    this.earthMaterial = new THREE.MeshStandardMaterial({
      map: dayTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.8,
      roughness: 0.52,
      metalness: 0.04,
      color: new THREE.Color(1.35, 1.35, 1.35)
    });

    // High-resolution authentic OpenStreetMap Cartographic Map (CartoDB Voyager 4096x2048)
    const cartoTexture = textureLoader.load('/textures/earth-cartographic.jpg');
    cartoTexture.colorSpace = THREE.NoColorSpace; // preserve raw sRGB for direct screen output
    cartoTexture.anisotropy = maxAnisotropy;
    cartoTexture.minFilter = THREE.LinearMipmapLinearFilter;
    cartoTexture.magFilter = THREE.LinearFilter;
    cartoTexture.generateMipmaps = true;
    this.cartoTexture = cartoTexture;

    // NASA City Night Lights texture for real-time Day/Night visualization
    const nightTexture = textureLoader.load('/textures/earth-night.jpg');
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.anisotropy = maxAnisotropy;
    nightTexture.minFilter = THREE.LinearMipmapLinearFilter;
    nightTexture.magFilter = THREE.LinearFilter;
    nightTexture.generateMipmaps = true;
    this.nightTexture = nightTexture;

    // Custom shader transformation: Blends Traditional Map and real-time Day/Night illumination with City Night Lights
    this.earthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTransition = this.uTransition;
      shader.uniforms.uCartoTexture = { value: this.cartoTexture };
      shader.uniforms.uNightTexture = { value: this.nightTexture };
      shader.uniforms.uDayNight = this.uDayNight;
      shader.uniforms.uSunDirection = this.uSunDirection;

      shader.vertexShader = `
        varying vec3 vModelNormal;
      ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <defaultnormal_vertex>',
        `
        #include <defaultnormal_vertex>
        vModelNormal = normalize(position);
        `
      );

      shader.fragmentShader = `
        uniform float uTransition;
        uniform sampler2D uCartoTexture;
        uniform sampler2D uNightTexture;
        uniform float uDayNight;
        uniform vec3 uSunDirection;
        varying vec3 vModelNormal;
      ` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>

        // 1. Traditional Cartographic Map transformation: Pure authentic OpenStreetMap
        if (uTransition > 0.001) {
          vec4 cartoCol = texture2D(uCartoTexture, vMapUv);
          // Luminous, crystal-clear cartographic blend with no directional shadow darkening
          gl_FragColor.rgb = mix(gl_FragColor.rgb, cartoCol.rgb, uTransition);
        }

        // 2. Real-time Solar Terminator & City Night Lights blending
        if (uDayNight > 0.001) {
          float sunDot = dot(normalize(vModelNormal), normalize(uSunDirection));
          float dayFactor = smoothstep(-0.08, 0.08, sunDot);

          vec4 nightCol = texture2D(uNightTexture, vMapUv);
          vec3 darkBase = gl_FragColor.rgb * vec3(0.04, 0.07, 0.14);
          vec3 nightCities = nightCol.rgb * vec3(1.4, 1.25, 0.9);
          vec3 nightSide = darkBase + nightCities;

          // Atmospheric golden twilight glow along the dusk/dawn terminator
          float twilight = (1.0 - smoothstep(0.0, 0.09, abs(sunDot))) * 0.22;
          vec3 twilightCol = vec3(1.0, 0.60, 0.22) * twilight;

          vec3 shaded = mix(nightSide, gl_FragColor.rgb, dayFactor) + twilightCol;
          gl_FragColor.rgb = mix(gl_FragColor.rgb, shaded, uDayNight);
        }
        `
      );
      this.earthShader = shader;
    };

    this.earthMesh = new THREE.Mesh(earthGeometry, this.earthMaterial);
    this.earthGroup.add(this.earthMesh);

    // Dynamic slippy tile layer for native high-resolution OpenStreetMap rendering at deep zoom
    this.dynamicTileLayer = new DynamicTileLayer(this.earthRadius, this.earthGroup);

    // Asynchronously load high-resolution vector coastlines and national boundaries
    this.loadVectorOverlays();
  }

  /**
   * Load Natural Earth 50m vector coastlines and country borders
   * Renders as resolution-independent 3D vector lines that remain razor-sharp at any zoom level
   */
  async loadVectorOverlays() {
    this.vectorGroup = new THREE.Group();
    this.earthGroup.add(this.vectorGroup);

    const loadGeoJsonLines = async (url, color, opacity, isCoastline = false) => {
      try {
        const resp = await fetch(url);
        if (!resp.ok) return;
        const geojson = await resp.json();

        const positions = [];
        const r = this.earthRadius * 1.0006;

        const addLineString = (coords) => {
          if (!coords || coords.length < 2) return;
          for (let i = 0; i < coords.length - 1; i++) {
            const p1 = coords[i];
            const p2 = coords[i + 1];
            // Skip international date line anti-meridian wrap jump (|lon1 - lon2| > 180)
            if (Math.abs(p1[0] - p2[0]) > 180) continue;

            const v1 = latLonToVector3(p1[1], p1[0], r);
            const v2 = latLonToVector3(p2[1], p2[0], r);
            positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
          }
        };

        for (const feature of geojson.features || []) {
          if (!feature.geometry) continue;
          const geom = feature.geometry;
          if (geom.type === 'LineString') {
            addLineString(geom.coordinates);
          } else if (geom.type === 'MultiLineString') {
            for (const line of geom.coordinates) {
              addLineString(line);
            }
          } else if (geom.type === 'Polygon') {
            for (const ring of geom.coordinates) {
              addLineString(ring);
            }
          } else if (geom.type === 'MultiPolygon') {
            for (const poly of geom.coordinates) {
              for (const ring of poly) {
                addLineString(ring);
              }
            }
          }
        }

        if (positions.length > 0) {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
          const material = new THREE.LineBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: opacity,
            depthWrite: false
          });

          if (isCoastline) {
            this.coastlinesMat = material;
          } else {
            this.bordersMat = material;
          }

          const segments = new THREE.LineSegments(geometry, material);
          this.vectorGroup.add(segments);
        }
      } catch (err) {
        console.warn('Vector overlay load failed:', url, err);
      }
    };

    // Load 50m high-res coastlines (cerulean azure) and borders (slate) for crisp atlas borders
    await Promise.all([
      loadGeoJsonLines('/data/ne_50m_coastline.geojson', 0x0284c7, 0.55, true),
      loadGeoJsonLines('/data/ne_50m_admin_0_boundary_lines_land.geojson', 0x475569, 0.45, false)
    ]);
  }

  createAtmosphere() {
    // 1. Inner Rayleigh Glow (Soft blue rim on horizon, fades when camera approaches surface)
    const innerAtmoGeo = new THREE.SphereGeometry(this.earthRadius * 1.006, 64, 64);
    this.innerAtmoMat = new THREE.ShaderMaterial({
      uniforms: {
        opacityMultiplier: { value: 1.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float opacityMultiplier;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float fresnel = 1.0 - max(0.0, dot(viewDir, vNormal));
          fresnel = pow(fresnel, 2.5);
          vec3 atmoColor = vec3(0.2, 0.65, 1.0);
          gl_FragColor = vec4(atmoColor, fresnel * 0.55 * opacityMultiplier);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false
    });
    this.innerAtmoMesh = new THREE.Mesh(innerAtmoGeo, this.innerAtmoMat);
    this.earthGroup.add(this.innerAtmoMesh);

    // 2. Outer Atmospheric Halo (Glow in the vacuum of space)
    const outerAtmoGeo = new THREE.SphereGeometry(this.earthRadius * 1.15, 64, 64);
    const outerAtmoMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float fresnel = dot(viewDir, vNormal);
          fresnel = pow(1.0 - abs(fresnel), 4.5);
          vec3 glowColor = vec3(0.1, 0.45, 0.95);
          gl_FragColor = vec4(glowColor, fresnel * 0.45);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    this.scene.add(new THREE.Mesh(outerAtmoGeo, outerAtmoMat));
  }

  /**
   * Update the city markers on the globe
   */
  updateCities(locations) {
    this.locations = locations;
    
    // Clear old city markers
    while (this.cityMeshGroup.children.length > 0) {
      const obj = this.cityMeshGroup.children[0];
      this.cityMeshGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    locations.forEach((city, index) => {
      const color = city.color || CITY_COLORS[index % CITY_COLORS.length];
      const pos = latLonToVector3(city.lat, city.lon, this.earthRadius * 1.0008);

      // Marker Group
      const markerGroup = new THREE.Group();
      markerGroup.position.set(pos.x, pos.y, pos.z);

      // Up vector pointing outward from sphere center
      const normal = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
      markerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      // 1. Central Pin Core: A hollow torus ring (see-through center aperture)
      const coreGeo = new THREE.TorusGeometry(1.2, 0.18, 12, 24);
      const coreMat = new THREE.MeshBasicMaterial({ 
        color: color, 
        transparent: true, 
        opacity: 0.9 
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.y = 1.4;
      coreMesh.rotation.x = Math.PI / 2;
      markerGroup.add(coreMesh);

      // 2. Pin Stem: Ultra-thin needle line pointing precisely to the location
      const stemGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.85 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = 1.3;
      markerGroup.add(stemMesh);

      // 3. Hollow Target Reticle with open center (radius 0 to 1.3 is completely open!)
      const ringGeo = new THREE.RingGeometry(1.3, 1.7, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.04;
      ringMesh.userData = { isPulse: true, baseScale: 1.0 };
      markerGroup.add(ringMesh);

      // Store metadata for clicking/hovering
      markerGroup.userData = { type: 'city', city, index };

      this.cityMeshGroup.add(markerGroup);
    });

    // Rebuild distance rings
    this.updateDistanceRings(this.currentDistance, this.currentUnit);
  }

  /**
   * Update the distance rings (spherical circles) drawn around each city
   */
  updateDistanceRings(distance, unit = 'km') {
    this.currentDistance = distance;
    this.currentUnit = unit;

    // Clear old rings
    while (this.ringsGroup.children.length > 0) {
      const obj = this.ringsGroup.children[0];
      this.ringsGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    if (!this.locations || this.locations.length === 0 || distance <= 0) return;

    this.locations.forEach((city, index) => {
      const color = city.color || CITY_COLORS[index % CITY_COLORS.length];
      const points = generateDistanceRingPoints(city.lat, city.lon, distance, 180, unit);

      if (points.length < 2) return;

      const vertices = [];
      for (const p of points) {
        // Elevate slightly above globe surface (radius * 1.0012) to avoid z-fighting
        const scale = this.earthRadius * 1.0012;
        vertices.push(new THREE.Vector3(p.x * scale, p.y * scale, p.z * scale));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        linewidth: 2,
        transparent: true,
        opacity: 0.9
      });

      const line = new THREE.LineLoop(geometry, material);
      line.userData = { type: 'distanceRing', city, index };
      this.ringsGroup.add(line);
    });
  }

  /**
   * Update matching / equidistant candidate markers
   */
  updateCandidates(candidatePoints, circumcenters = []) {
    this.candidatePoints = candidatePoints;

    // Clear old candidate markers
    while (this.candidatesGroup.children.length > 0) {
      const obj = this.candidatesGroup.children[0];
      this.candidatesGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    // Render circumcenters if provided (Exact Equidistant Poles)
    if (circumcenters && circumcenters.length > 0) {
      circumcenters.forEach((pole, i) => {
        const pos = latLonToVector3(pole.lat, pole.lon, this.earthRadius * 1.0010);
        const markerGroup = new THREE.Group();
        markerGroup.position.set(pos.x, pos.y, pos.z);

        const normal = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
        markerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

        // Glowing Star/Octahedron: Wireframe with see-through center
        const geom = new THREE.OctahedronGeometry(2.4, 0);
        const mat = new THREE.MeshBasicMaterial({ color: 0x38ef7d, wireframe: true, transparent: true, opacity: 0.85 });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.y = 2.0;
        mesh.userData = { isRotatingCandidate: true };
        markerGroup.add(mesh);

        // Hollow Outer Reticle (open center aperture)
        const ringGeo = new THREE.RingGeometry(1.8, 2.4, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x38ef7d,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.04;
        markerGroup.add(ring);

        markerGroup.userData = {
          type: 'circumcenter',
          pole,
          index: i,
          lat: pole.lat,
          lon: pole.lon
        };

        this.candidatesGroup.add(markerGroup);
      });
    }

    // Render candidate points
    candidatePoints.forEach((cand, index) => {
      // Highlight top matching points
      const isTopMatch = cand.matchesAllWithinTolerance || index < 4;
      const markerColor = isTopMatch ? 0xffea00 : 0x00f0ff;
      const pos = latLonToVector3(cand.lat, cand.lon, this.earthRadius * 1.0010);

      const markerGroup = new THREE.Group();
      markerGroup.position.set(pos.x, pos.y, pos.z);

      const normal = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
      markerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      // Diamond Marker: Wireframe with see-through center
      const diamGeo = new THREE.OctahedronGeometry(isTopMatch ? 1.6 : 1.2, 0);
      const diamMat = new THREE.MeshBasicMaterial({ 
        color: markerColor, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.85 
      });
      const diamMesh = new THREE.Mesh(diamGeo, diamMat);
      diamMesh.position.y = 1.5;
      diamMesh.userData = { isRotatingCandidate: true };
      markerGroup.add(diamMesh);

      // Hollow Base Target Reticle (radius 0 to 1.2 is completely open!)
      const ringGeo = new THREE.RingGeometry(1.2, 1.6, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isTopMatch ? 0.8 : 0.55
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.04;
      markerGroup.add(ring);

      markerGroup.userData = {
        type: 'candidate',
        candidate: cand,
        index,
        lat: cand.lat,
        lon: cand.lon
      };

      this.candidatesGroup.add(markerGroup);
    });
  }

  /**
   * Draw great circle arcs from a selected candidate point to all cities
   * Visually proving they have equal distance!
   */
  highlightPointArcs(point) {
    while (this.arcsGroup.children.length > 0) {
      const obj = this.arcsGroup.children[0];
      this.arcsGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    if (!point || !this.locations || this.locations.length === 0) return;

    const pVec = latLonToVector3(point.lat, point.lon, this.earthRadius * 1.005);
    const start = new THREE.Vector3(pVec.x, pVec.y, pVec.z);

    this.locations.forEach((city, index) => {
      const cVec = latLonToVector3(city.lat, city.lon, this.earthRadius * 1.005);
      const end = new THREE.Vector3(cVec.x, cVec.y, cVec.z);

      // Generate curved arc between start and end elevated above sphere
      const arcPoints = [];
      const numSegments = 50;

      for (let i = 0; i <= numSegments; i++) {
        const t = i / numSegments;
        // Spherical linear interpolation (SLERP)
        const p = new THREE.Vector3().copy(start).lerp(end, t).normalize();
        // Arch upward in the middle
        const heightMultiplier = 1.0 + Math.sin(t * Math.PI) * 0.08;
        p.multiplyScalar(this.earthRadius * 1.008 * heightMultiplier);
        arcPoints.push(p);
      }

      const curveGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
      const color = city.color || CITY_COLORS[index % CITY_COLORS.length];
      const curveMat = new THREE.LineDashedMaterial({
        color: new THREE.Color(color),
        dashSize: 3,
        gapSize: 1.5,
        linewidth: 2,
        transparent: true,
        opacity: 0.95
      });

      const line = new THREE.Line(curveGeo, curveMat);
      line.computeLineDistances();
      this.arcsGroup.add(line);
    });
  }

  /**
   * Render the complete Spherical Perpendicular Bisector Great Circle circling the entire globe
   * Every single point along this line is mathematically equidistant to both cityA and cityB
   */
  showEquidistantGreatCircle(cityA, cityB) {
    this.clearEquidistantGreatCircle();
    if (!cityA || !cityB) return null;

    const result = calculateEquidistantGreatCircle(cityA, cityB, 360, this.earthRadius * 1.0014);
    if (!result || !result.points || result.points.length === 0) return null;

    // 1. Primary Great Circle Line Loop (vivid emerald neon)
    const vertices = result.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      linewidth: 3,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });
    const lineLoop = new THREE.LineLoop(geometry, lineMat);
    this.bisectorLineGroup.add(lineLoop);

    // 2. Outer luminous halo loop for high visibility against all terrains
    const haloMat = new THREE.LineBasicMaterial({
      color: 0x34d399,
      linewidth: 1,
      transparent: true,
      opacity: 0.50,
      depthWrite: false
    });
    const haloLoop = new THREE.LineLoop(geometry, haloMat);
    haloLoop.scale.set(1.0003, 1.0003, 1.0003);
    this.bisectorLineGroup.add(haloLoop);

    // 3. Highlight the Spherical Midpoint along the circle
    if (result.midpoint) {
      const midPos = latLonToVector3(result.midpoint.lat, result.midpoint.lon, this.earthRadius * 1.0016);
      const midGroup = new THREE.Group();
      midGroup.position.set(midPos.x, midPos.y, midPos.z);
      const normal = new THREE.Vector3(midPos.x, midPos.y, midPos.z).normalize();
      midGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      const ringGeo = new THREE.RingGeometry(1.2, 1.8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      midGroup.add(ring);
      this.bisectorLineGroup.add(midGroup);
    }

    return result;
  }

  clearEquidistantGreatCircle() {
    this.stopTour();
    this.clearTourWaypoints();
    while (this.bisectorLineGroup.children.length > 0) {
      const obj = this.bisectorLineGroup.children[0];
      this.bisectorLineGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      if (obj.children) {
        obj.children.forEach(c => {
          if (c.geometry) c.geometry.dispose();
          if (c.material) c.material.dispose();
        });
      }
    }
  }

  /**
   * Real-time Solar Terminator and Sun illumination with NASA City Night Lights
   */
  updateSolarTerminator(date = new Date()) {
    const subsolar = getSubsolarPoint(date);
    if (!subsolar) return;

    // Subsolar unit vector in Earth's local model coordinates
    const sunModelPos = latLonToVector3(subsolar.lat, subsolar.lon, 1);
    this.uSunDirection.value.set(sunModelPos.x, sunModelPos.y, sunModelPos.z).normalize();

    // Three.js Directional light in world coordinates
    if (this.sunLight && this.earthGroup) {
      const sunWorld = new THREE.Vector3(sunModelPos.x * 600, sunModelPos.y * 600, sunModelPos.z * 600);
      sunWorld.applyMatrix4(this.earthGroup.matrixWorld);
      this.sunLight.position.copy(sunWorld);
    }

    // Rebuild terminator line in earthGroup model coordinates
    while (this.terminatorGroup.children.length > 0) {
      const obj = this.terminatorGroup.children[0];
      this.terminatorGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    const termPoints = computeSolarTerminator(subsolar, 240, this.earthRadius * 1.002);
    const vertices = termPoints.map(p => new THREE.Vector3(p.x, p.y, p.z));
    const termGeo = new THREE.BufferGeometry().setFromPoints(vertices);
    const termMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b, // Warm golden dusk/dawn amber
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const termLine = new THREE.LineLoop(termGeo, termMat);
    this.terminatorGroup.add(termLine);
  }

  setDayNightMode(enabled) {
    this.isDayNightActive = enabled;
    this.uDayNight.value = enabled ? 1.0 : 0.0;
    this.terminatorGroup.visible = enabled;
    if (enabled) {
      this.updateSolarTerminator();
    }
  }

  /**
   * Spherical Voronoi Partitioning (N >= 3 cities)
   * Divides Earth into colored territories showing nearest jurisdiction
   */
  showSphericalVoronoi(sites) {
    this.clearSphericalVoronoi();
    if (!sites || sites.length < 3) return;

    this.isVoronoiActive = true;

    // 1. High-resolution equirectangular Canvas with smooth antialiased territory wash
    const canvas = generateVoronoiCanvas(sites, CITY_COLORS, 1024, 512);
    const texture = new THREE.CanvasTexture(canvas);
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = maxAniso;

    // 128x128 segments to match earthMesh geometry exactly, avoiding polygon moire
    const geo = new THREE.SphereGeometry(this.earthRadius * 1.0015, 128, 128);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3
    });
    const mesh = new THREE.Mesh(geo, mat);
    this.voronoiGroup.add(mesh);

    // 2. High-precision neon Great Circle boundary arcs
    const edges = computeSphericalVoronoiEdges(sites, this.earthRadius * 1.0022);
    edges.forEach(edge => {
      if (edge.points && edge.points.length >= 2) {
        const vertices = edge.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
        const lineGeo = new THREE.BufferGeometry().setFromPoints(vertices);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x00f0ff,
          linewidth: 2,
          transparent: true,
          opacity: 0.95,
          depthWrite: false
        });
        const line = new THREE.Line(lineGeo, lineMat);
        this.voronoiGroup.add(line);
      }
    });

    this.voronoiGroup.visible = true;
  }

  clearSphericalVoronoi() {
    this.isVoronoiActive = false;
    while (this.voronoiGroup.children.length > 0) {
      const obj = this.voronoiGroup.children[0];
      this.voronoiGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
      }
    }
  }

  setVoronoiMode(enabled, sites = null) {
    if (enabled && sites && sites.length >= 3) {
      this.showSphericalVoronoi(sites);
    } else {
      this.clearSphericalVoronoi();
    }
  }

  /**
   * Starts a 360-degree flyover tour along the Equidistant Great Circle
   */
  startTour(tourData, startTheta = 0, onUpdate = null) {
    if (!tourData || !tourData.u || !tourData.v) return;
    this.tourData = tourData;
    let progress = startTheta / (Math.PI * 2);
    if (progress >= 0.99 || isNaN(progress)) {
      progress = 0;
      startTheta = 0;
    }
    this.tourProgress = Math.max(0, Math.min(1.0, progress));
    this.isTourActive = true;
    this.isAutoRotating = false;
    this.onTourUpdate = onUpdate;
    this.setTourWaypoints(tourData.waypoints);
    this.updateTourCamera(this.tourProgress * Math.PI * 2);
  }

  pauseTour() {
    this.isTourActive = false;
  }

  resumeTour() {
    if (this.tourData) {
      this.isTourActive = true;
      this.isAutoRotating = false;
    }
  }

  stopTour() {
    this.isTourActive = false;
    this.tourProgress = 0.0;
    this.highlightBeacon(null);
    if (this.onTourUpdate) {
      this.onTourUpdate(0.0, null, false);
    }
  }

  setTourSpeed(speed) {
    this.tourSpeed = Math.max(0.5, Math.min(6.0, speed));
  }

  /**
   * Spawns glowing 3D waypoint beacons along the Great Circle
   */
  setTourWaypoints(waypoints) {
    this.clearTourWaypoints();
    if (!waypoints || waypoints.length === 0) return;

    waypoints.forEach((wp, index) => {
      // 7 Completely Distinct High-Contrast Colors across the spectrum
      let hexColor = 0xff007f; // City: Neon Hot Pink / Magenta
      if (wp.type === 'mountain') hexColor = 0xf97316; // Mountain: Sunburst Orange
      else if (wp.type === 'nature') hexColor = 0xffea00; // Natural Wonder: Canary Solar Yellow
      else if (wp.type === 'national_park' || wp.type === 'park') hexColor = 0x10b981; // National Park: Vivid Emerald Green
      else if (wp.type === 'reef') hexColor = 0x00f5d4; // Reef: Electric Turquoise Cyan
      else if (wp.type === 'river') hexColor = 0x2563eb; // River: Royal Azure Blue
      else if (wp.type === 'lake') hexColor = 0xa855f7; // Lake: Vivid Purple / Orchid

      const pos = latLonToVector3(wp.lat, wp.lon, this.earthRadius * 1.002);
      const beacon = new THREE.Group();
      beacon.position.set(pos.x, pos.y, pos.z);
      beacon.name = `beacon_${wp.name}`;
      beacon.userData = { waypoint: wp, index, type: 'beacon', hexColor };

      const norm = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
      beacon.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), norm);

      // Radar ground ring
      const ringGeo = new THREE.RingGeometry(0.8, 1.4, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hexColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      beacon.add(ring);

      // Slender vertical neon beacon pillar
      const beamGeo = new THREE.CylinderGeometry(0.12, 0.35, 7, 12, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: hexColor,
        transparent: true,
        opacity: 0.75,
        depthWrite: false
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 3.5;
      beacon.add(beam);

      // Generous interaction collider for smooth hover & click detection
      const hitGeo = new THREE.CylinderGeometry(3.2, 3.2, 11, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.y = 4.5;
      beacon.add(hitMesh);

      this.tourBeaconGroup.add(beacon);
    });
  }

  clearTourWaypoints() {
    while (this.tourBeaconGroup.children.length > 0) {
      const b = this.tourBeaconGroup.children[0];
      this.tourBeaconGroup.remove(b);
      if (b.children) {
        b.children.forEach(c => {
          if (c.geometry) c.geometry.dispose();
          if (c.material) c.material.dispose();
        });
      }
    }
  }

  highlightBeacon(name) {
    this.tourBeaconGroup.children.forEach(beacon => {
      const isMatch = Boolean(name && beacon.userData && beacon.userData.waypoint && beacon.userData.waypoint.name === name);
      if (beacon.children && beacon.children.length >= 2) {
        const ring = beacon.children[0];
        const beam = beacon.children[1];
        const origColor = beacon.userData?.hexColor || 0x10b981;
        if (isMatch) {
          ring.material.color.setHex(0x00f0ff);
          ring.scale.set(1.7, 1.7, 1);
          beam.material.color.setHex(0x00f0ff);
          beam.material.opacity = 1.0;
        } else {
          ring.material.color.setHex(origColor);
          ring.scale.set(1.0, 1.0, 1);
          beam.material.color.setHex(origColor);
          beam.material.opacity = 0.75;
        }
      }
    });
  }

  /**
   * Positions and orients camera along Great Circle at flight angle theta
   */
  updateTourCamera(theta) {
    if (!this.tourData || !this.tourData.u || !this.tourData.v) return;
    const { u, v } = this.tourData;

    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    // Surface position
    const px = cosT * u.x + sinT * v.x;
    const py = cosT * u.y + sinT * v.y;
    const pz = cosT * u.z + sinT * v.z;

    // Tangent vector along flight
    const tx = -sinT * u.x + cosT * v.x;
    const ty = -sinT * u.y + cosT * v.y;
    const tz = -sinT * u.z + cosT * v.z;

    // Flight altitude above globe: ~36 units for stunning Mapbox & terrain views
    const flightAlt = 36.0;
    const camDist = this.earthRadius + flightAlt;

    const camLocal = new THREE.Vector3(
      px * camDist - tx * 4.5,
      py * camDist - ty * 4.5,
      pz * camDist - tz * 4.5
    );

    // Target point ahead on the surface
    const lookAhead = theta + 0.08;
    const targetLocal = new THREE.Vector3(
      (Math.cos(lookAhead) * u.x + Math.sin(lookAhead) * v.x) * (this.earthRadius * 1.001),
      (Math.cos(lookAhead) * u.y + Math.sin(lookAhead) * v.y) * (this.earthRadius * 1.001),
      (Math.cos(lookAhead) * u.z + Math.sin(lookAhead) * v.z) * (this.earthRadius * 1.001)
    );

    camLocal.applyEuler(this.earthGroup.rotation);
    targetLocal.applyEuler(this.earthGroup.rotation);

    this.camera.position.copy(camLocal);
    this.camera.lookAt(targetLocal);
    this.controls.target.copy(targetLocal);
  }

  findClosestTourWaypoint(theta) {
    if (!this.tourData || !this.tourData.waypoints || this.tourData.waypoints.length === 0) return null;
    const wps = this.tourData.waypoints;
    let closest = null;
    let minDiff = Infinity;

    for (let i = 0; i < wps.length; i++) {
      const wp = wps[i];
      let diff = Math.abs(theta - wp.theta);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff < minDiff) {
        minDiff = diff;
        closest = wp;
      }
    }

    if (minDiff <= 0.14) {
      this.highlightBeacon(closest.name);
      return closest;
    }
    this.highlightBeacon(null);
    return null;
  }

  /**
   * Initialize Easter Egg: Moon in the background (upper left)
   */
  initEasterEggs() {
    this.moonEl = document.getElementById('easter-egg-moon');

    // Prevent any click or drag on the moon from shifting or rotating the globe
    if (this.moonEl) {
      ['pointerdown', 'mousedown', 'touchstart', 'click'].forEach(evt => {
        this.moonEl.addEventListener(evt, e => {
          e.stopPropagation();
        });
      });
    }
  }

  /**
   * Adjust camera viewport offset to ensure the globe is centered in the open
   * visual space to the left of the right sidebar and comfortably above the bottom panel
   */
  updateCameraViewport() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;

    if (w > 1024) {
      // Offset camera horizontally by 185px and vertically by 75px
      // This shifts the rendered 3D scene into the visible pocket above the bottom panel
      const xOffset = 185;
      const yOffset = 75;
      this.camera.setViewOffset(w, h, xOffset, yOffset, w, h);
    } else {
      this.camera.clearViewOffset();
    }

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /**
   * Smoothly fly camera to center on a target lat/lon
   * Takes current Earth group rotation into account so the camera flies to the exact visual location
   */
  flyTo(lat, lon, distance = 220) {
    const localTarget = latLonToVector3(lat, lon, distance);
    const worldTarget = new THREE.Vector3(localTarget.x, localTarget.y, localTarget.z);
    worldTarget.applyEuler(this.earthGroup.rotation);

    const startPos = this.camera.position.clone();
    const startTime = performance.now();
    const duration = 1200; // ms

    // Pause auto-rotation while user is flying to a point
    this.isAutoRotating = false;

    const animateFly = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Smooth easeInOutCubic
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.camera.position.lerpVectors(startPos, worldTarget, ease);
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animateFly);
      }
    };

    requestAnimationFrame(animateFly);
  }

  initEventListeners() {
    window.addEventListener('resize', () => {
      this.updateCameraViewport();
    });

    // Raycast on click to select candidate points or cities
    this.renderer.domElement.addEventListener('click', (event) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Check tour beacons first
      const beaconClickIntersects = this.raycaster.intersectObjects(this.tourBeaconGroup.children, true);
      if (beaconClickIntersects.length > 0) {
        let root = beaconClickIntersects[0].object;
        while (root.parent && root.parent !== this.tourBeaconGroup) {
          root = root.parent;
        }
        if (root.userData && root.userData.waypoint) {
          const wp = root.userData.waypoint;
          this.flyTo(wp.lat, wp.lon, 145);
          this.highlightBeacon(wp.name);
          if (this.onPointSelect) {
            this.onPointSelect(wp, 'beacon');
          }
          return;
        }
      }

      // Check candidates
      const candidateIntersects = this.raycaster.intersectObjects(this.candidatesGroup.children, true);
      if (candidateIntersects.length > 0) {
        let root = candidateIntersects[0].object;
        while (root.parent && root.parent !== this.candidatesGroup) {
          root = root.parent;
        }
        if (root.userData && (root.userData.candidate || root.userData.pole)) {
          const point = root.userData.candidate || root.userData.pole;
          this.highlightPointArcs(point);
          if (this.onPointSelect) {
            this.onPointSelect(point, root.userData.type);
          }
          return;
        }
      }

      // Check city markers
      const cityIntersects = this.raycaster.intersectObjects(this.cityMeshGroup.children, true);
      if (cityIntersects.length > 0) {
        let root = cityIntersects[0].object;
        while (root.parent && root.parent !== this.cityMeshGroup) {
          root = root.parent;
        }
        if (root.userData && root.userData.city) {
          this.flyTo(root.userData.city.lat, root.userData.city.lon, 165);
          return;
        }
      }

      // Check click on Earth sphere to read coordinates
      const earthIntersects = this.raycaster.intersectObject(this.earthMesh);
      if (earthIntersects.length > 0) {
        const hit = earthIntersects[0].point;
        // Transform hit point to earth group local space if rotated
        const localHit = hit.clone();
        this.earthGroup.worldToLocal(localHit);
        const coords = vector3ToLatLon(localHit);
        if (this.onPointSelect) {
          this.onPointSelect({ lat: coords.lat, lon: coords.lon }, 'globeClick');
        }
      }
    });

    // Hover detection on globe elements (pointermove)
    this.renderer.domElement.addEventListener('pointermove', (event) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      // 0. Check tour beacons (points of interest along Great Circle)
      const beaconIntersects = this.raycaster.intersectObjects(this.tourBeaconGroup.children, true);
      if (beaconIntersects.length > 0) {
        let root = beaconIntersects[0].object;
        while (root.parent && root.parent !== this.tourBeaconGroup) {
          root = root.parent;
        }
        if (root.userData && root.userData.waypoint) {
          this.renderer.domElement.style.cursor = 'pointer';
          this.highlightBeacon(root.userData.waypoint.name);
          if (this.onHover) {
            this.onHover({
              type: 'beacon',
              data: root.userData.waypoint,
              lat: root.userData.waypoint.lat,
              lon: root.userData.waypoint.lon
            }, event);
          }
          return;
        }
      } else {
        if (!this.isTourActive) {
          this.highlightBeacon(null);
        }
      }

      // 1. Check candidates / circumcenters
      const candidateIntersects = this.raycaster.intersectObjects(this.candidatesGroup.children, true);
      if (candidateIntersects.length > 0) {
        let root = candidateIntersects[0].object;
        while (root.parent && root.parent !== this.candidatesGroup) {
          root = root.parent;
        }
        if (root.userData && (root.userData.candidate || root.userData.pole)) {
          this.renderer.domElement.style.cursor = 'pointer';
          if (this.onHover) {
            this.onHover({
              type: root.userData.type,
              data: root.userData.candidate || root.userData.pole,
              lat: root.userData.lat,
              lon: root.userData.lon
            }, event);
          }
          return;
        }
      }

      // 2. Check city markers
      const cityIntersects = this.raycaster.intersectObjects(this.cityMeshGroup.children, true);
      if (cityIntersects.length > 0) {
        let root = cityIntersects[0].object;
        while (root.parent && root.parent !== this.cityMeshGroup) {
          root = root.parent;
        }
        if (root.userData && root.userData.city) {
          this.renderer.domElement.style.cursor = 'pointer';
          if (this.onHover) {
            this.onHover({
              type: 'city',
              data: root.userData.city,
              index: root.userData.index,
              lat: root.userData.city.lat,
              lon: root.userData.city.lon
            }, event);
          }
          return;
        }
      }

      // 3. Check distance rings
      const ringIntersects = this.raycaster.intersectObjects(this.ringsGroup.children, true);
      if (ringIntersects.length > 0) {
        const ringObj = ringIntersects[0].object;
        if (ringObj.userData && ringObj.userData.city) {
          this.renderer.domElement.style.cursor = 'pointer';
          if (this.onHover) {
            this.onHover({
              type: 'ring',
              city: ringObj.userData.city,
              distance: this.currentDistance,
              unit: this.currentUnit
            }, event);
          }
          return;
        }
      }

      // 4. Check Earth surface
      const earthIntersects = this.raycaster.intersectObject(this.earthMesh);
      if (earthIntersects.length > 0) {
        this.renderer.domElement.style.cursor = 'grab';
        const hit = earthIntersects[0].point;
        const localHit = hit.clone();
        this.earthGroup.worldToLocal(localHit);
        const coords = vector3ToLatLon(localHit);
        if (this.onHover) {
          this.onHover({
            type: 'surface',
            lat: coords.lat,
            lon: coords.lon
          }, event);
        }
        return;
      }

      // Empty space
      this.renderer.domElement.style.cursor = 'default';
      if (this.onHover) {
        this.onHover(null, event);
      }
    });

    this.renderer.domElement.addEventListener('pointerleave', (event) => {
      this.renderer.domElement.style.cursor = 'default';
      if (!this.isTourActive) {
        this.highlightBeacon(null);
      }
      if (this.onHover) {
        this.onHover(null, event);
      }
    });

    // Pause auto-rotate when user drags
    this.controls.addEventListener('start', () => {
      this.isAutoRotating = false;
    });
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate);

    const time = performance.now() * 0.001;

    // Slow peaceful earth rotation
    if (this.isAutoRotating) {
      this.earthGroup.rotation.y += 0.0008;
    }

    // Starfield subtle twinkling
    if (this.starField && this.starField.material.uniforms) {
      this.starField.material.uniforms.time.value = time;
    }

    const now = performance.now();
    const delta = Math.min(0.05, (now - (this.lastFrameTime || now)) * 0.001);
    this.lastFrameTime = now;

    // Periodic Day/Night terminator update
    if (this.isDayNightActive && now - (this.lastSolarUpdateTime || 0) > 1000) {
      this.lastSolarUpdateTime = now;
      this.updateSolarTerminator();
    }

    // Altitude calculation (distance from camera to globe surface)
    const cameraDist = this.camera.position.length();
    const altitude = Math.max(0.2, cameraDist - this.earthRadius);

    // Easter Egg: Moon visibility and perspective scaling when zooming out into deep space
    if (this.moonEl) {
      const moonT = THREE.MathUtils.clamp((altitude - 200) / 100, 0, 1);
      this.moonEl.style.opacity = moonT;
      this.moonEl.style.pointerEvents = moonT > 0.4 ? 'auto' : 'none';
      // Scale moon according to zoom altitude so it recedes / advances naturally in deep space
      const scale = THREE.MathUtils.clamp(0.55 + ((altitude - 200) / 600) * 0.55, 0.45, 1.15);
      this.moonEl.style.transform = `scale(${scale.toFixed(3)})`;
      this.moonEl.style.transformOrigin = 'center center';
    }

    // Dynamic transition into Traditional Cartographic Map with smoothstep easing
    const linearRatio = THREE.MathUtils.clamp((130 - altitude) / 80, 0.0, 1.0);
    const smoothRatio = THREE.MathUtils.smoothstep(linearRatio, 0.0, 1.0);
    const targetTransition = this.mapMode === 'satellite' ? 0.0 : ((this.mapMode === 'traditional' || this.mapMode === 'streets' || this.mapMode === 'outdoors' || this.mapMode === 'dark') ? 1.0 : smoothRatio);

    // Equidistant Great Circle 360-degree Flyover Tour
    if (this.isTourActive && this.tourData) {
      this.isAutoRotating = false;
      this.tourProgress += (delta * this.tourSpeed) / this.tourDuration;

      if (this.tourProgress >= 1.0) {
        this.tourProgress = 1.0;
        this.isTourActive = false;
        this.updateTourCamera(Math.PI * 2);
        if (this.onTourUpdate) {
          this.onTourUpdate(1.0, null, true);
        }
      } else {
        const theta = this.tourProgress * Math.PI * 2;
        this.updateTourCamera(theta);
        const closestWp = this.findClosestTourWaypoint(theta);
        if (this.onTourUpdate) {
          this.onTourUpdate(this.tourProgress, closestWp, false);
        }
      }
    }

    // Buttery smooth transition damping across frames
    this.transitionVal = THREE.MathUtils.damp(this.transitionVal, targetTransition, 7, delta);
    this.uTransition.value = this.transitionVal;
    const transition = this.transitionVal;

    // Dynamic high-resolution OpenStreetMap tile layer (curved slippy tiles Zoom 4 to 8+)
    if (this.dynamicTileLayer) {
      this.dynamicTileLayer.update(this.camera, this.earthMesh, this.earthGroup, altitude, transition, this.mapMode);
    }

    // Dynamic marker scaling: scale down gracefully as you zoom in close
    // Down to ~0.065 at close zoom so the marker is a slender precision reticle
    const markerScale = THREE.MathUtils.clamp(0.06 + Math.pow(altitude / 220, 0.85) * 1.0, 0.065, 1.25);

    // Apply scaling to reference city markers
    this.cityMeshGroup.children.forEach(marker => {
      marker.scale.set(markerScale, markerScale, markerScale);
    });

    // Apply scaling to candidate intersection markers and circumcenters
    this.candidatesGroup.children.forEach(cand => {
      cand.scale.set(markerScale, markerScale, markerScale);
    });

    // Dynamically adjust orbit controls sensitivity so close-up navigation is ultra-precise
    const altRatio = THREE.MathUtils.clamp(altitude / 180, 0.08, 1.0);
    this.controls.rotateSpeed = 0.55 * Math.max(0.12, Math.sqrt(altRatio));
    this.controls.zoomSpeed = 0.8 * Math.max(0.18, Math.min(1.0, altRatio));

    // Coastlines and boundary lines increase in vibrancy in traditional map mode
    if (this.coastlinesMat) {
      this.coastlinesMat.opacity = 0.40 + transition * 0.45;
    }
    if (this.bordersMat) {
      this.bordersMat.opacity = 0.30 + transition * 0.50;
    }

    // Smoothly fade inner Rayleigh atmosphere when camera enters lower altitude
    if (this.innerAtmoMat && this.innerAtmoMat.uniforms && this.innerAtmoMat.uniforms.opacityMultiplier) {
      const atmoFade = THREE.MathUtils.clamp((altitude - 2.5) / 20.0, 0.0, 1.0);
      this.innerAtmoMat.uniforms.opacityMultiplier.value = atmoFade * (1.0 - transition * 0.7);
    }

    // Pulsating city rings
    this.cityMeshGroup.children.forEach(marker => {
      const ring = marker.children.find(c => c.userData && c.userData.isPulse);
      if (ring) {
        const pulse = 1.0 + Math.sin(time * 3.5 + (marker.userData.index || 0)) * 0.25;
        ring.scale.set(pulse, pulse, 1);
        ring.material.opacity = 0.85 - (pulse - 1.0) * 1.5;
      }
    });

    // Rotating candidate diamonds
    this.candidatesGroup.children.forEach(cand => {
      const diamond = cand.children.find(c => c.userData && c.userData.isRotatingCandidate);
      if (diamond) {
        diamond.rotation.y += 0.03;
        diamond.rotation.x = Math.sin(time * 2.0) * 0.2;
      }
    });

    // Pulsating animation for Tour Waypoint Beacons
    if (this.tourBeaconGroup.children.length > 0) {
      this.tourBeaconGroup.children.forEach(b => {
        if (b.children && b.children.length >= 1) {
          const ring = b.children[0];
          const bp = 1.0 + Math.sin(time * 3.5 + (b.userData.index || 0)) * 0.2;
          ring.scale.set(bp, bp, 1);
        }
      });
    }

    // Live OpenStreetMap viewport fetching when zoomed in close (< 40 altitude)
    if (altitude < 40 && (!this.lastOsmFetchTime || performance.now() - this.lastOsmFetchTime > 3000)) {
      this.lastOsmFetchTime = performance.now();
      this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
      const hits = this.raycaster.intersectObject(this.earthMesh);
      if (hits.length > 0) {
        const localHit = hits[0].point.clone();
        this.earthGroup.worldToLocal(localHit);
        const center = vector3ToLatLon(localHit);
        const spanDeg = Math.max(1.5, Math.min(8.0, altitude * 0.25));
        fetchOSMPlacesForViewport(center.lat, center.lon, spanDeg).catch(() => {});
      }
    }

    // Update dynamic place labels projected onto screen space
    this.updatePlaceLabels(altitude, transition);

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Floating DOM place labels are disabled because Mapbox renders high-res
   * cartographic vector/raster labels directly onto the globe tiles.
   */
  updatePlaceLabels(altitude, transition) {
    if (this.labelsContainer) {
      this.labelsContainer.style.display = 'none';
      if (this.placeLabelsMap.size > 0) {
        this.placeLabelsMap.forEach(el => el.remove());
        this.placeLabelsMap.clear();
      }
    }
  }

  toggleAutoRotate(forceState = null) {
    if (forceState !== null) {
      this.isAutoRotating = forceState;
    } else {
      this.isAutoRotating = !this.isAutoRotating;
    }
    return this.isAutoRotating;
  }

  resetView() {
    this.flyTo(20, 0, 330);
    this.isAutoRotating = true;
  }
}
