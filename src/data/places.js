/**
 * Curated Place Names, Natural Wonders & Points of Interest
 * Comprehensive global catalog covering:
 * - World Megacities, Regional Towns & High-Latitude Settlements
 * - Iconic Mountain Summits & Volcanoes (🏔️)
 * - Major Barrier Reefs & Coral Atolls (🪸)
 * - Greatest Rivers, Deltas & Waterways (🌊)
 * - Great Lakes & Inland Seas (🏞️)
 * - World-Renowned Natural Wonders & Landscapes (✨)
 */

import { haversineDistance } from '../math.js';

// ============================================================================
// 1. REEFS & CORAL ECOSYSTEMS (🪸)
// ============================================================================
export const REEFS = [
  { name: "Great Barrier Reef", country: "Australia", lat: -18.2871, lon: 147.6992, type: "reef", tier: 1, icon: "🪸", detail: "World's Largest Coral Reef System (2,300 km)" },
  { name: "Belize Barrier Reef", country: "Belize", lat: 17.3156, lon: -87.5344, type: "reef", tier: 1, icon: "🪸", detail: "Second Largest Barrier Reef in the World" },
  { name: "Red Sea Coral Reef", country: "Egypt / Saudi Arabia", lat: 27.2800, lon: 34.3000, type: "reef", tier: 1, icon: "🪸", detail: "Ancient Biodiverse Fringing Reefs" },
  { name: "Tubbataha Reefs", country: "Philippines", lat: 8.9564, lon: 119.8692, type: "reef", tier: 1, icon: "🪸", detail: "UNESCO Sulu Sea Marine Sanctuary" },
  { name: "Ningaloo Reef", country: "Australia", lat: -22.5667, lon: 113.8000, type: "reef", tier: 1, icon: "🪸", detail: "Famed Fringing Reef with Whale Sharks" },
  { name: "New Caledonia Barrier Reef", country: "New Caledonia", lat: -21.5000, lon: 165.5000, type: "reef", tier: 1, icon: "🪸", detail: "Second Longest Double Barrier Reef (1,500 km)" },
  { name: "Mesoamerican Barrier Reef", country: "Mexico / Honduras", lat: 18.5000, lon: -87.7500, type: "reef", tier: 1, icon: "🪸", detail: "1,000 km Caribbean Coral Ecosystem" },
  { name: "Raja Ampat Coral Triangle", country: "Indonesia", lat: -0.2333, lon: 130.5167, type: "reef", tier: 1, icon: "🪸", detail: "Global Epicenter of Marine Biodiversity" },
  { name: "Apo Reef", country: "Philippines", lat: 12.6667, lon: 120.4667, type: "reef", tier: 2, icon: "🪸", detail: "Largest Contiguous Reef in the Philippines" },
  { name: "Great Blue Hole", country: "Belize", lat: 17.3156, lon: -87.5344, type: "reef", tier: 1, icon: "🪸", detail: "World-Famous Giant Marine Sinkhole (124 m deep)" },
  { name: "Florida Reef Tract", country: "United States", lat: 24.6200, lon: -81.1000, type: "reef", tier: 2, icon: "🪸", detail: "Third Largest Living Coral Barrier Reef" },
  { name: "Aldabra Atoll", country: "Seychelles", lat: -9.4167, lon: 46.3500, type: "reef", tier: 1, icon: "🪸", detail: "Second Largest Coral Atoll on Earth" },
  { name: "Chagos Archipelago Reefs", country: "Indian Ocean", lat: -6.0000, lon: 71.5000, type: "reef", tier: 2, icon: "🪸", detail: "Pristine Central Indian Ocean Coral Banks" },
  { name: "Bikini Atoll", country: "Marshall Islands", lat: 11.5880, lon: 165.3820, type: "reef", tier: 2, icon: "🪸", detail: "Historic Pacific Coral Atoll Lagoon" },
  { name: "Lord Howe Island Reef", country: "Australia", lat: -31.5553, lon: 159.0833, type: "reef", tier: 2, icon: "🪸", detail: "Southernmost Coral Reef in the World" },
  { name: "Chuuk Lagoon (Truk)", country: "Micronesia", lat: 7.4200, lon: 151.7800, type: "reef", tier: 2, icon: "🪸", detail: "Enclosed Coral Lagoon with Historic Shipwrecks" },
  { name: "Palmyra Atoll", country: "US Outlying Islands", lat: 5.8833, lon: -162.0833, type: "reef", tier: 2, icon: "🪸", detail: "Remote Equatorial Pacific Coral Sanctuary" }
];

// ============================================================================
// 2. MOUNTAINS, SUMMITS & VOLCANOES (🏔️)
// ============================================================================
export const MOUNTAINS = [
  { name: "Mount Everest", country: "Nepal / Tibet", lat: 27.9881, lon: 86.9250, type: "mountain", tier: 1, icon: "🏔️", detail: "8,848 m • Earth's Highest Mountain Peak" },
  { name: "K2 (Godwin-Austen)", country: "Pakistan / China", lat: 35.8813, lon: 76.5133, type: "mountain", tier: 1, icon: "🏔️", detail: "8,611 m • Second Highest Mountain Peak" },
  { name: "Kangchenjunga", country: "India / Nepal", lat: 27.7025, lon: 88.1475, type: "mountain", tier: 1, icon: "🏔️", detail: "8,586 m • Third Highest Mountain Peak" },
  { name: "Lhotse", country: "Nepal / China", lat: 27.9617, lon: 86.9333, type: "mountain", tier: 1, icon: "🏔️", detail: "8,516 m • Fourth Highest Mountain Peak" },
  { name: "Makalu", country: "Nepal / China", lat: 27.8892, lon: 87.0886, type: "mountain", tier: 1, icon: "🏔️", detail: "8,485 m • Pyramid Summit in Himalayas" },
  { name: "Mount Kilimanjaro", country: "Tanzania", lat: -3.0674, lon: 37.3556, type: "mountain", tier: 1, icon: "🏔️", detail: "5,895 m • Highest Peak in Africa" },
  { name: "Mont Blanc", country: "France / Italy", lat: 45.8326, lon: 6.8652, type: "mountain", tier: 1, icon: "🏔️", detail: "4,808 m • Highest Mountain in the Alps" },
  { name: "Matterhorn", country: "Switzerland / Italy", lat: 45.9765, lon: 7.6586, type: "mountain", tier: 1, icon: "🏔️", detail: "4,478 m • Iconic Alpine Pyramid Peak" },
  { name: "Denali (Mount McKinley)", country: "United States", lat: 63.0692, lon: -151.0070, type: "mountain", tier: 1, icon: "🏔️", detail: "6,190 m • Highest Peak in North America" },
  { name: "Mount Aconcagua", country: "Argentina", lat: -32.6532, lon: -70.0109, type: "mountain", tier: 1, icon: "🏔️", detail: "6,961 m • Highest Peak in Western Hemisphere" },
  { name: "Mount Elbrus", country: "Russia", lat: 43.3499, lon: 42.4453, type: "mountain", tier: 1, icon: "🏔️", detail: "5,642 m • Highest Mountain in Europe" },
  { name: "Mount Vinson", country: "Antarctica", lat: -78.5256, lon: -85.6172, type: "mountain", tier: 1, icon: "🏔️", detail: "4,892 m • Highest Peak in Antarctica" },
  { name: "Puncak Jaya (Carstensz)", country: "Indonesia", lat: -4.0833, lon: 137.1833, type: "mountain", tier: 1, icon: "🏔️", detail: "4,884 m • Highest Island Summit on Earth" },
  { name: "Mount Fuji", country: "Japan", lat: 35.3606, lon: 138.7274, type: "mountain", tier: 1, icon: "🏔️", detail: "3,776 m • Sacred Japanese Stratovolcano" },
  { name: "Aoraki / Mount Cook", country: "New Zealand", lat: -43.5950, lon: 170.1417, type: "mountain", tier: 1, icon: "🏔️", detail: "3,724 m • Highest Mountain in New Zealand" },
  { name: "Mount Olympus", country: "Greece", lat: 40.0884, lon: 22.3586, type: "mountain", tier: 2, icon: "🏔️", detail: "2,917 m • Mythic Throne of the Gods" },
  { name: "Mount Etna", country: "Italy", lat: 37.7510, lon: 14.9934, type: "mountain", tier: 1, icon: "🏔️", detail: "3,357 m • Most Active Stratovolcano in Europe" },
  { name: "Mount Vesuvius", country: "Italy", lat: 40.8214, lon: 14.4265, type: "mountain", tier: 2, icon: "🏔️", detail: "1,281 m • Famous Volcano Overlooking Naples" },
  { name: "Mount Rainier", country: "United States", lat: 46.8523, lon: -121.7603, type: "mountain", tier: 2, icon: "🏔️", detail: "4,392 m • Glaciated Cascade Volcano" },
  { name: "Mount Whitney", country: "United States", lat: 36.5785, lon: -118.2923, type: "mountain", tier: 2, icon: "🏔️", detail: "4,421 m • Highest Summit in Contiguous USA" },
  { name: "Mauna Kea", country: "United States", lat: 19.8207, lon: -155.4681, type: "mountain", tier: 1, icon: "🏔️", detail: "4,207 m (10,210 m base to peak) • Tallest Mountain on Earth" },
  { name: "Table Mountain", country: "South Africa", lat: -33.9628, lon: 18.4098, type: "mountain", tier: 1, icon: "🏔️", detail: "1,086 m • Iconic Flat-Topped Cape Landmark" },
  { name: "Galdhøpiggen", country: "Norway", lat: 61.6364, lon: 8.3125, type: "mountain", tier: 2, icon: "🏔️", detail: "2,469 m • Highest Peak in Northern Europe" },
  { name: "Ben Nevis", country: "United Kingdom", lat: 56.7969, lon: -5.0036, type: "mountain", tier: 2, icon: "🏔️", detail: "1,345 m • Highest Peak in British Isles" },
  { name: "Mount Kinabalu", country: "Malaysia", lat: 6.0750, lon: 116.5583, type: "mountain", tier: 2, icon: "🏔️", detail: "4,095 m • Highest Peak on Borneo" },
  { name: "Chimborazo", country: "Ecuador", lat: -1.4692, lon: -78.8169, type: "mountain", tier: 1, icon: "🏔️", detail: "6,263 m • Closest Surface Point to the Sun" },
  { name: "Huascarán", country: "Peru", lat: -9.1219, lon: -77.6033, type: "mountain", tier: 1, icon: "🏔️", detail: "6,768 m • Highest Mountain in the Tropics" },
  { name: "Ojos del Salado", country: "Chile / Argentina", lat: -27.1092, lon: -68.5408, type: "mountain", tier: 1, icon: "🏔️", detail: "6,893 m • Highest Active Volcano on Earth" },
  { name: "Mount Ararat", country: "Turkey", lat: 39.7022, lon: 44.2992, type: "mountain", tier: 1, icon: "🏔️", detail: "5,137 m • Snow-Capped Dormant Stratovolcano" },
  { name: "Mount Damavand", country: "Iran", lat: 35.9514, lon: 52.1094, type: "mountain", tier: 1, icon: "🏔️", detail: "5,610 m • Highest Volcano in Asia" },
  { name: "Mount Kosciuszko", country: "Australia", lat: -36.4559, lon: 148.2636, type: "mountain", tier: 2, icon: "🏔️", detail: "2,228 m • Highest Mainland Summit in Australia" },
  { name: "Mount Teide", country: "Spain", lat: 28.2723, lon: -16.6425, type: "mountain", tier: 1, icon: "🏔️", detail: "3,715 m • Highest Peak in Spain & Atlantic Ocean" },
  { name: "Pico de Orizaba", country: "Mexico", lat: 19.0300, lon: -97.2683, type: "mountain", tier: 1, icon: "🏔️", detail: "5,636 m • Highest Peak in Mexico" }
];

// ============================================================================
// 3. RIVERS & WATERWAYS (🌊)
// ============================================================================
export const RIVERS = [
  { name: "Nile River", country: "Egypt / Sudan", lat: 27.1800, lon: 31.1837, type: "river", tier: 1, icon: "🌊", detail: "6,650 km • Longest River System in the World" },
  { name: "Nile Delta", country: "Egypt", lat: 30.8000, lon: 31.0000, type: "river", tier: 1, icon: "🌊", detail: "Fertile Mediterranean River Delta" },
  { name: "Amazon River", country: "Brazil", lat: -2.1631, lon: -55.1266, type: "river", tier: 1, icon: "🌊", detail: "6,400 km • Largest River by Water Discharge" },
  { name: "Amazon Delta", country: "Brazil", lat: 0.1000, lon: -49.5000, type: "river", tier: 1, icon: "🌊", detail: "Colossal Atlantic Estuary of the Amazon" },
  { name: "Yangtze River", country: "China", lat: 30.7500, lon: 111.3000, type: "river", tier: 1, icon: "🌊", detail: "6,300 km • Longest River in Asia & Three Gorges" },
  { name: "Mississippi River", country: "United States", lat: 35.1495, lon: -90.0490, type: "river", tier: 1, icon: "🌊", detail: "3,730 km • Chief North American River (Memphis)" },
  { name: "Mississippi Delta", country: "United States", lat: 29.1500, lon: -89.2500, type: "river", tier: 1, icon: "🌊", detail: "Bird's-Foot Delta into Gulf of Mexico" },
  { name: "Missouri River", country: "United States", lat: 39.1000, lon: -94.5800, type: "river", tier: 1, icon: "🌊", detail: "3,767 km • Longest River in North America" },
  { name: "Yellow River (Huang He)", country: "China", lat: 34.8000, lon: 113.6000, type: "river", tier: 1, icon: "🌊", detail: "5,464 km • Cradle of Chinese Civilization" },
  { name: "Congo River", country: "DR Congo", lat: -4.3000, lon: 15.3000, type: "river", tier: 1, icon: "🌊", detail: "4,700 km • World's Deepest River (220 m)" },
  { name: "Danube River", country: "Austria / Hungary", lat: 48.2000, lon: 16.4000, type: "river", tier: 1, icon: "🌊", detail: "2,850 km • Traverses 10 European Nations" },
  { name: "Danube Delta", country: "Romania / Ukraine", lat: 45.1667, lon: 29.6500, type: "river", tier: 2, icon: "🌊", detail: "Expansive UNESCO Black Sea Biosphere" },
  { name: "Rhine River", country: "Germany", lat: 50.1500, lon: 7.7000, type: "river", tier: 1, icon: "🌊", detail: "1,230 km • Historic Waterway of Western Europe" },
  { name: "Ganges River", country: "India", lat: 25.3176, lon: 82.9739, type: "river", tier: 1, icon: "🌊", detail: "2,525 km • Sacred Lifeline of India (Varanasi)" },
  { name: "Mekong River", country: "Laos / Thailand", lat: 17.9667, lon: 102.6000, type: "river", tier: 1, icon: "🌊", detail: "4,350 km • Lifeline of Southeast Asia" },
  { name: "Mekong Delta", country: "Vietnam", lat: 10.0333, lon: 105.7833, type: "river", tier: 1, icon: "🌊", detail: "Vast Agricultural Rice Bowl of Vietnam" },
  { name: "Volga River", country: "Russia", lat: 51.5333, lon: 46.0333, type: "river", tier: 1, icon: "🌊", detail: "3,531 km • Longest River in Europe" },
  { name: "Indus River", country: "Pakistan", lat: 25.3800, lon: 68.3700, type: "river", tier: 1, icon: "🌊", detail: "3,180 km • Cradle of the Indus Valley Civilization" },
  { name: "Zambezi River", country: "Zambia / Zimbabwe", lat: -17.9243, lon: 25.8572, type: "river", tier: 1, icon: "🌊", detail: "2,574 km • Feeds Thundering Victoria Falls" },
  { name: "Colorado River", country: "United States", lat: 36.0544, lon: -112.1401, type: "river", tier: 1, icon: "🌊", detail: "2,330 km • Sculptor of the Grand Canyon" },
  { name: "Columbia River", country: "United States / Canada", lat: 46.2500, lon: -123.8000, type: "river", tier: 2, icon: "🌊", detail: "2,000 km • Pacific Northwest Waterway" },
  { name: "Saint Lawrence River", country: "Canada", lat: 46.8000, lon: -71.2000, type: "river", tier: 2, icon: "🌊", detail: "1,197 km • Great Lakes to Atlantic Seaway" },
  { name: "Rio Grande", country: "United States / Mexico", lat: 26.0000, lon: -97.5000, type: "river", tier: 2, icon: "🌊", detail: "3,051 km • Border River of North America" },
  { name: "Yukon River", country: "Canada / United States", lat: 64.0500, lon: -139.4300, type: "river", tier: 2, icon: "🌊", detail: "3,190 km • Klondike Gold Rush Route" },
  { name: "Tigris River", country: "Iraq", lat: 33.3400, lon: 44.4000, type: "river", tier: 2, icon: "🌊", detail: "1,850 km • River of Ancient Mesopotamia" },
  { name: "Euphrates River", country: "Iraq / Syria", lat: 32.0000, lon: 45.0000, type: "river", tier: 2, icon: "🌊", detail: "2,800 km • Historic Fertile Crescent River" },
  { name: "Thames River", country: "United Kingdom", lat: 51.5050, lon: -0.0900, type: "river", tier: 2, icon: "🌊", detail: "346 km • Historic London Waterway" },
  { name: "Seine River", country: "France", lat: 48.8570, lon: 2.3470, type: "river", tier: 2, icon: "🌊", detail: "777 km • Romantic River of Paris" },
  { name: "Elbe River", country: "Germany", lat: 53.5400, lon: 9.9800, type: "river", tier: 2, icon: "🌊", detail: "1,094 km • Central European Maritime Artery" },
  { name: "Glomma", country: "Norway", lat: 59.2167, lon: 10.9500, type: "river", tier: 2, icon: "🌊", detail: "621 km • Longest River in Norway" },
  { name: "Murray River", country: "Australia", lat: -34.2000, lon: 142.1500, type: "river", tier: 1, icon: "🌊", detail: "2,508 km • Australia's Longest River System" },
  { name: "Yenisey River", country: "Russia", lat: 56.0000, lon: 92.8500, type: "river", tier: 1, icon: "🌊", detail: "5,539 km • Siberian Giant Flowing to the Arctic" },
  { name: "Lena River", country: "Russia", lat: 62.0000, lon: 129.7000, type: "river", tier: 1, icon: "🌊", detail: "4,294 km • Eastern Siberian River with Lena Pillars" },
  { name: "Amur River", country: "Russia / China", lat: 48.4800, lon: 135.0700, type: "river", tier: 1, icon: "🌊", detail: "2,824 km • Natural Border of Russia and China" }
];

// ============================================================================
// 4. LAKES & INLAND SEAS (🏞️)
// ============================================================================
export const LAKES = [
  { name: "Lake Baikal", country: "Russia", lat: 53.5587, lon: 108.1650, type: "lake", tier: 1, icon: "🏞️", detail: "1,642 m deep • Deepest & Oldest Freshwater Lake (20% of Earth's unfrozen fresh water)" },
  { name: "Lake Superior", country: "United States / Canada", lat: 47.7000, lon: -87.5000, type: "lake", tier: 1, icon: "🏞️", detail: "82,100 km² • Largest Freshwater Lake by Surface Area" },
  { name: "Lake Victoria", country: "Uganda / Kenya / Tanzania", lat: -1.0000, lon: 33.0000, type: "lake", tier: 1, icon: "🏞️", detail: "59,947 km² • Africa's Largest Lake & Nile Source" },
  { name: "Lake Tanganyika", country: "Tanzania / DR Congo", lat: -6.0000, lon: 29.5000, type: "lake", tier: 1, icon: "🏞️", detail: "1,470 m deep • Second Deepest Lake on Earth" },
  { name: "Caspian Sea", country: "Azerbaijan / Russia / Iran / Kazakhstan", lat: 41.5000, lon: 51.0000, type: "lake", tier: 1, icon: "🏞️", detail: "371,000 km² • World's Largest Inland Body of Water" },
  { name: "Lake Michigan", country: "United States", lat: 44.0000, lon: -87.0000, type: "lake", tier: 1, icon: "🏞️", detail: "58,030 km² • Largest Lake Entirely in One Country" },
  { name: "Lake Huron", country: "United States / Canada", lat: 45.0000, lon: -82.5000, type: "lake", tier: 1, icon: "🏞️", detail: "59,590 km² • Second Largest of Great Lakes" },
  { name: "Lake Erie", country: "United States / Canada", lat: 42.2000, lon: -81.2000, type: "lake", tier: 1, icon: "🏞️", detail: "25,667 km² • Great Lake with Niagara Outflow" },
  { name: "Lake Ontario", country: "United States / Canada", lat: 43.7000, lon: -77.7000, type: "lake", tier: 1, icon: "🏞️", detail: "18,960 km² • Outflow to St. Lawrence River" },
  { name: "Great Bear Lake", country: "Canada", lat: 66.0000, lon: -121.0000, type: "lake", tier: 1, icon: "🏞️", detail: "31,153 km² • Largest Lake Wholly in Canada" },
  { name: "Great Slave Lake", country: "Canada", lat: 61.5000, lon: -114.0000, type: "lake", tier: 1, icon: "🏞️", detail: "614 m deep • Deepest Lake in North America" },
  { name: "Lake Malawi (Nyasa)", country: "Malawi / Mozambique", lat: -12.0000, lon: 34.5000, type: "lake", tier: 1, icon: "🏞️", detail: "Rift Valley Lake with 1,000+ Cichlid Species" },
  { name: "Lake Titicaca", country: "Peru / Bolivia", lat: -15.8000, lon: -69.4000, type: "lake", tier: 1, icon: "🏞️", detail: "3,812 m • Highest Navigable Lake in the World" },
  { name: "Lake Geneva (Lac Léman)", country: "Switzerland / France", lat: 46.4500, lon: 6.5500, type: "lake", tier: 1, icon: "🏞️", detail: "580 km² • Iconic Crescent Alpine Lake" },
  { name: "Lake Como", country: "Italy", lat: 46.0000, lon: 9.2500, type: "lake", tier: 2, icon: "🏞️", detail: "Scenic Glacial Y-Shaped Lake in Lombardy" },
  { name: "Lake Garda", country: "Italy", lat: 45.6500, lon: 10.6800, type: "lake", tier: 2, icon: "🏞️", detail: "370 km² • Largest Lake in Italy" },
  { name: "Lake Constance (Bodensee)", country: "Germany / Switzerland / Austria", lat: 47.6300, lon: 9.3800, type: "lake", tier: 2, icon: "🏞️", detail: "Tri-Border Central European Lake" },
  { name: "Lake Bled", country: "Slovenia", lat: 46.3639, lon: 14.0936, type: "lake", tier: 2, icon: "🏞️", detail: "Picturesque Island Church in Julian Alps" },
  { name: "Loch Ness", country: "United Kingdom", lat: 57.3229, lon: -4.4244, type: "lake", tier: 2, icon: "🏞️", detail: "Deep Scottish Highland Loch of Legend" },
  { name: "Lake Tahoe", country: "United States", lat: 39.0968, lon: -120.0324, type: "lake", tier: 2, icon: "🏞️", detail: "501 m deep • Crystal Clear Sierra Nevada Gem" },
  { name: "Crater Lake", country: "United States", lat: 42.9446, lon: -122.1090, type: "lake", tier: 2, icon: "🏞️", detail: "594 m deep • Deepest Lake in the United States" },
  { name: "Dead Sea", country: "Israel / Jordan", lat: 31.5000, lon: 35.5000, type: "lake", tier: 1, icon: "🏞️", detail: "-430 m • Lowest Elevation on Land on Earth" },
  { name: "Lake Eyre (Kati Thanda)", country: "Australia", lat: -28.3667, lon: 137.3667, type: "lake", tier: 2, icon: "🏞️", detail: "Lowest Natural Point in Australia & Salt Pan" },
  { name: "Lake Maracaibo", country: "Venezuela", lat: 9.8000, lon: -71.5500, type: "lake", tier: 1, icon: "🏞️", detail: "Catatumbo Lightning Capital of the World" },
  { name: "Lake Ladoga", country: "Russia", lat: 60.8333, lon: 31.5000, type: "lake", tier: 1, icon: "🏞️", detail: "17,700 km² • Largest Lake in Europe" },
  { name: "Lake Onega", country: "Russia", lat: 61.7500, lon: 35.5000, type: "lake", tier: 2, icon: "🏞️", detail: "9,700 km² • Second Largest Lake in Europe" },
  { name: "Mjøsa", country: "Norway", lat: 60.7000, lon: 10.9000, type: "lake", tier: 2, icon: "🏞️", detail: "365 km² • Largest Lake in Norway (449 m deep)" },
  { name: "Lake Vänern", country: "Sweden", lat: 58.9000, lon: 13.5000, type: "lake", tier: 1, icon: "🏞️", detail: "5,655 km² • Largest Lake in Sweden & EU" },
  { name: "Lake Vättern", country: "Sweden", lat: 58.4000, lon: 14.5000, type: "lake", tier: 2, icon: "🏞️", detail: "1,893 km² • Famous Clear Water Trench Lake" },
  { name: "Lake Chad", country: "Chad / Niger / Nigeria", lat: 13.0000, lon: 14.0000, type: "lake", tier: 1, icon: "🏞️", detail: "Endorheic Sahelian Lake Basin" }
];

// ============================================================================
// 5. NATURAL WONDERS & LANDMARKS (✨)
// ============================================================================
export const NATURAL_WONDERS = [
  { name: "Grand Canyon", country: "United States", lat: 36.1069, lon: -112.1129, type: "nature", tier: 1, icon: "✨", detail: "Carved by Colorado River • 1.8 km Deep" },
  { name: "Victoria Falls", country: "Zambia / Zimbabwe", lat: -17.9243, lon: 25.8572, type: "nature", tier: 1, icon: "✨", detail: "World's Largest Sheet of Falling Water (108 m high)" },
  { name: "Niagara Falls", country: "United States / Canada", lat: 43.0828, lon: -79.0742, type: "nature", tier: 1, icon: "✨", detail: "Famous Horseshoe & American Thundering Falls" },
  { name: "Iguazu Falls", country: "Argentina / Brazil", lat: -25.6953, lon: -54.4367, type: "nature", tier: 1, icon: "✨", detail: "275 Thundering Waterfalls in Subtropical Rainforest" },
  { name: "Angel Falls (Salto Ángel)", country: "Venezuela", lat: 5.9675, lon: -62.5356, type: "nature", tier: 1, icon: "✨", detail: "979 m • World's Tallest Uninterrupted Waterfall" },
  { name: "Geirangerfjord", country: "Norway", lat: 62.1008, lon: 7.2058, type: "nature", tier: 1, icon: "✨", detail: "UNESCO World Heritage Fjord with Waterfalls" },
  { name: "Ha Long Bay", country: "Vietnam", lat: 20.9101, lon: 107.1839, type: "nature", tier: 1, icon: "✨", detail: "Emerald Waters with 1,600+ Limestone Karst Pillars" },
  { name: "Uluru (Ayers Rock)", country: "Australia", lat: -25.3444, lon: 131.0369, type: "nature", tier: 1, icon: "✨", detail: "Sacred Red Sandstone Monolith in Central Australia" },
  { name: "Salar de Uyuni", country: "Bolivia", lat: -20.1338, lon: -67.4891, type: "nature", tier: 1, icon: "✨", detail: "10,582 km² • World's Largest Salt Flat & Giant Mirror" },
  { name: "Atacama Desert", country: "Chile", lat: -23.8634, lon: -69.1328, type: "nature", tier: 1, icon: "✨", detail: "Driest Non-Polar Desert on Planet Earth" },
  { name: "Erg Chebbi Dunes", country: "Morocco", lat: 31.1667, lon: -3.9667, type: "nature", tier: 1, icon: "✨", detail: "Majestic Sea of Sahara Desert Sand Dunes" },
  { name: "Cliffs of Moher", country: "Ireland", lat: 52.9715, lon: -9.4265, type: "nature", tier: 1, icon: "✨", detail: "214 m Sheer Atlantic Ocean Coastal Cliffs" },
  { name: "Giant's Causeway", country: "United Kingdom", lat: 55.2408, lon: -6.5116, type: "nature", tier: 1, icon: "✨", detail: "40,000 Interlocking Hexagonal Basalt Columns" },
  { name: "Pamukkale", country: "Turkey", lat: 37.9250, lon: 29.1214, type: "nature", tier: 1, icon: "✨", detail: "Terraced Travertine Thermal Pools & Cotton Castle" },
  { name: "Cappadocia Fairy Chimneys", country: "Turkey", lat: 38.6431, lon: 34.8289, type: "nature", tier: 1, icon: "✨", detail: "Surreal Volcanic Tufa Spires & Cave Dwellings" },
  { name: "Galápagos Islands", country: "Ecuador", lat: -0.9538, lon: -90.9656, type: "nature", tier: 1, icon: "✨", detail: "Darwin's Living Evolutionary Laboratory" },
  { name: "Serengeti & Ngorongoro", country: "Tanzania", lat: -2.3333, lon: 34.8333, type: "nature", tier: 1, icon: "✨", detail: "Great Wildlife Migration & Giant Volcanic Caldera" },
  { name: "Zhangjiajie National Forest", country: "China", lat: 29.3167, lon: 110.4333, type: "nature", tier: 1, icon: "✨", detail: "Towering Quartzite Sandstone Avatar Pillars" },
  { name: "Mariana Trench (Challenger Deep)", country: "Pacific Ocean", lat: 11.3733, lon: 142.5917, type: "nature", tier: 1, icon: "✨", detail: "10,994 m • Deepest Oceanic Point on Earth" },
  { name: "Point Nemo", country: "South Pacific Ocean", lat: -48.8767, lon: -123.3933, type: "nature", tier: 1, icon: "✨", detail: "Oceanic Pole of Inaccessibility (2,688 km from land)" },
  { name: "North Pole", country: "Arctic", lat: 90.0000, lon: 0.0000, type: "nature", tier: 1, icon: "✨", detail: "Northernmost Geographic Point of Earth" },
  { name: "South Pole", country: "Antarctica", lat: -90.0000, lon: 0.0000, type: "nature", tier: 1, icon: "✨", detail: "Southernmost Geographic Point of Earth (2,835 m)" },
  { name: "Great Geysir & Gullfoss", country: "Iceland", lat: 64.3138, lon: -20.2995, type: "nature", tier: 1, icon: "✨", detail: "Erupting Hot Springs & Glacial Golden Falls" }
];

// ============================================================================
// 6. EXPANDED GLOBAL CITIES & CAPITALS (🏙️)
// ============================================================================
export const EXPANDED_CITIES = [
  // Europe
  { name: "Oslo", country: "Norway", lat: 59.9139, lon: 10.7522, type: "city", tier: 1 },
  { name: "Bergen", country: "Norway", lat: 60.3913, lon: 5.3221, type: "city", tier: 1 },
  { name: "Trondheim", country: "Norway", lat: 63.4305, lon: 10.3951, type: "city", tier: 2 },
  { name: "Stavanger", country: "Norway", lat: 58.9700, lon: 5.7331, type: "city", tier: 2 },
  { name: "Tromsø", country: "Norway", lat: 69.6492, lon: 18.9553, type: "city", tier: 2 },
  { name: "Kristiansand", country: "Norway", lat: 58.1467, lon: 7.9956, type: "city", tier: 2 },
  { name: "Longyearbyen", country: "Svalbard, Norway", lat: 78.2232, lon: 15.6267, type: "city", tier: 2 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278, type: "city", tier: 1 },
  { name: "Edinburgh", country: "United Kingdom", lat: 55.9533, lon: -3.1883, type: "city", tier: 2 },
  { name: "Manchester", country: "United Kingdom", lat: 53.4808, lon: -2.2426, type: "city", tier: 2 },
  { name: "Dublin", country: "Ireland", lat: 53.3498, lon: -6.2603, type: "city", tier: 1 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522, type: "city", tier: 1 },
  { name: "Marseille", country: "France", lat: 43.2965, lon: 5.3698, type: "city", tier: 2 },
  { name: "Lyon", country: "France", lat: 45.7640, lon: 4.8357, type: "city", tier: 2 },
  { name: "Nice", country: "France", lat: 43.7102, lon: 7.2620, type: "city", tier: 2 },
  { name: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050, type: "city", tier: 1 },
  { name: "Munich", country: "Germany", lat: 48.1351, lon: 11.5820, type: "city", tier: 2 },
  { name: "Hamburg", country: "Germany", lat: 53.5511, lon: 9.9937, type: "city", tier: 2 },
  { name: "Frankfurt", country: "Germany", lat: 50.1109, lon: 8.6821, type: "city", tier: 2 },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lon: 4.9041, type: "city", tier: 1 },
  { name: "Brussels", country: "Belgium", lat: 50.8503, lon: 4.3517, type: "city", tier: 1 },
  { name: "Zurich", country: "Switzerland", lat: 47.3769, lon: 8.5417, type: "city", tier: 2 },
  { name: "Geneva", country: "Switzerland", lat: 46.2044, lon: 6.1432, type: "city", tier: 2 },
  { name: "Vienna", country: "Austria", lat: 48.2082, lon: 16.3738, type: "city", tier: 1 },
  { name: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964, type: "city", tier: 1 },
  { name: "Milan", country: "Italy", lat: 45.4642, lon: 9.1900, type: "city", tier: 2 },
  { name: "Naples", country: "Italy", lat: 40.8518, lon: 14.2681, type: "city", tier: 2 },
  { name: "Venice", country: "Italy", lat: 45.4408, lon: 12.3155, type: "city", tier: 2 },
  { name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038, type: "city", tier: 1 },
  { name: "Barcelona", country: "Spain", lat: 41.3851, lon: 2.1734, type: "city", tier: 2 },
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lon: -9.1393, type: "city", tier: 1 },
  { name: "Athens", country: "Greece", lat: 37.9838, lon: 23.7275, type: "city", tier: 1 },
  { name: "Stockholm", country: "Sweden", lat: 59.3293, lon: 18.0686, type: "city", tier: 1 },
  { name: "Copenhagen", country: "Denmark", lat: 55.6761, lon: 12.5683, type: "city", tier: 1 },
  { name: "Helsinki", country: "Finland", lat: 60.1699, lon: 24.9384, type: "city", tier: 1 },
  { name: "Reykjavik", country: "Iceland", lat: 64.1466, lon: -21.9426, type: "city", tier: 1 },
  { name: "Warsaw", country: "Poland", lat: 52.2297, lon: 21.0122, type: "city", tier: 1 },
  { name: "Prague", country: "Czech Republic", lat: 50.0755, lon: 14.4378, type: "city", tier: 1 },
  { name: "Budapest", country: "Hungary", lat: 47.4979, lon: 19.0402, type: "city", tier: 1 },
  { name: "Bucharest", country: "Romania", lat: 44.4268, lon: 26.1025, type: "city", tier: 2 },
  { name: "Sofia", country: "Bulgaria", lat: 42.6977, lon: 23.3219, type: "city", tier: 2 },
  { name: "Kyiv", country: "Ukraine", lat: 50.4501, lon: 30.5234, type: "city", tier: 1 },
  { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173, type: "city", tier: 1 },
  { name: "Saint Petersburg", country: "Russia", lat: 59.9343, lon: 30.3351, type: "city", tier: 1 },

  // Asia
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, type: "city", tier: 1 },
  { name: "Osaka", country: "Japan", lat: 34.6937, lon: 135.5023, type: "city", tier: 2 },
  { name: "Kyoto", country: "Japan", lat: 35.0116, lon: 135.7681, type: "city", tier: 2 },
  { name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074, type: "city", tier: 1 },
  { name: "Shanghai", country: "China", lat: 31.2304, lon: 121.4737, type: "city", tier: 1 },
  { name: "Guangzhou", country: "China", lat: 23.1291, lon: 113.2644, type: "city", tier: 1 },
  { name: "Hong Kong", country: "China", lat: 22.3193, lon: 114.1694, type: "city", tier: 1 },
  { name: "Taipei", country: "Taiwan", lat: 25.0330, lon: 121.5654, type: "city", tier: 1 },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.9780, type: "city", tier: 1 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198, type: "city", tier: 1 },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018, type: "city", tier: 1 },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lon: 101.6869, type: "city", tier: 1 },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456, type: "city", tier: 1 },
  { name: "Manila", country: "Philippines", lat: 14.5995, lon: 120.9842, type: "city", tier: 1 },
  { name: "Hanoi", country: "Vietnam", lat: 21.0285, lon: 105.8542, type: "city", tier: 1 },
  { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lon: 106.6297, type: "city", tier: 1 },
  { name: "New Delhi", country: "India", lat: 28.6139, lon: 77.2090, type: "city", tier: 1 },
  { name: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777, type: "city", tier: 1 },
  { name: "Bengaluru", country: "India", lat: 12.9716, lon: 77.5946, type: "city", tier: 2 },
  { name: "Kathmandu", country: "Nepal", lat: 27.7172, lon: 85.3240, type: "city", tier: 2 },
  { name: "Colombo", country: "Sri Lanka", lat: 6.9271, lon: 79.8612, type: "city", tier: 2 },
  { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lon: 90.4125, type: "city", tier: 1 },
  { name: "Karachi", country: "Pakistan", lat: 24.8607, lon: 67.0011, type: "city", tier: 1 },
  { name: "Almaty", country: "Kazakhstan", lat: 43.2220, lon: 76.8512, type: "city", tier: 2 },
  { name: "Tashkent", country: "Uzbekistan", lat: 41.2995, lon: 69.2401, type: "city", tier: 2 },

  // Middle East
  { name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708, type: "city", tier: 1 },
  { name: "Doha", country: "Qatar", lat: 25.2854, lon: 51.5310, type: "city", tier: 2 },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lon: 46.6753, type: "city", tier: 1 },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784, type: "city", tier: 1 },
  { name: "Tel Aviv", country: "Israel", lat: 32.0853, lon: 34.7818, type: "city", tier: 2 },
  { name: "Tehran", country: "Iran", lat: 35.6892, lon: 51.3890, type: "city", tier: 1 },
  { name: "Baghdad", country: "Iraq", lat: 33.3152, lon: 44.3661, type: "city", tier: 2 },
  { name: "Muscat", country: "Oman", lat: 23.5880, lon: 58.3829, type: "city", tier: 2 },

  // Americas
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.0060, type: "city", tier: 1 },
  { name: "Washington", country: "United States", lat: 38.9072, lon: -77.0369, type: "city", tier: 1 },
  { name: "Los Angeles", country: "United States", lat: 34.0522, lon: -118.2437, type: "city", tier: 1 },
  { name: "Chicago", country: "United States", lat: 41.8781, lon: -87.6298, type: "city", tier: 1 },
  { name: "San Francisco", country: "United States", lat: 37.7749, lon: -122.4194, type: "city", tier: 1 },
  { name: "Seattle", country: "United States", lat: 47.6062, lon: -122.3321, type: "city", tier: 2 },
  { name: "Miami", country: "United States", lat: 25.7617, lon: -80.1918, type: "city", tier: 2 },
  { name: "Honolulu", country: "United States", lat: 21.3069, lon: -157.8583, type: "city", tier: 2 },
  { name: "Anchorage", country: "United States", lat: 61.2181, lon: -149.9003, type: "city", tier: 2 },
  { name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832, type: "city", tier: 1 },
  { name: "Montreal", country: "Canada", lat: 45.5017, lon: -73.5673, type: "city", tier: 1 },
  { name: "Vancouver", country: "Canada", lat: 49.2827, lon: -123.1207, type: "city", tier: 2 },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332, type: "city", tier: 1 },
  { name: "Cancún", country: "Mexico", lat: 21.1619, lon: -86.8515, type: "city", tier: 2 },
  { name: "Havana", country: "Cuba", lat: 23.1136, lon: -82.3666, type: "city", tier: 2 },
  { name: "Panama City", country: "Panama", lat: 8.9824, lon: -79.5199, type: "city", tier: 2 },
  { name: "Bogotá", country: "Colombia", lat: 4.7110, lon: -74.0721, type: "city", tier: 1 },
  { name: "Lima", country: "Peru", lat: -12.0464, lon: -77.0428, type: "city", tier: 1 },
  { name: "Cusco", country: "Peru", lat: -13.5319, lon: -71.9675, type: "city", tier: 2 },
  { name: "Santiago", country: "Chile", lat: -33.4489, lon: -70.6693, type: "city", tier: 1 },
  { name: "Punta Arenas", country: "Chile", lat: -53.1638, lon: -70.9171, type: "city", tier: 2 },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816, type: "city", tier: 1 },
  { name: "Ushuaia", country: "Argentina", lat: -54.8019, lon: -68.3030, type: "city", tier: 2 },
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333, type: "city", tier: 1 },
  { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lon: -43.1729, type: "city", tier: 1 },
  { name: "Brasília", country: "Brazil", lat: -15.7975, lon: -47.8919, type: "city", tier: 2 },
  { name: "Manaus", country: "Brazil", lat: -3.1190, lon: -60.0217, type: "city", tier: 2 },

  // Africa
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357, type: "city", tier: 1 },
  { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241, type: "city", tier: 1 },
  { name: "Johannesburg", country: "South Africa", lat: -26.2041, lon: 28.0473, type: "city", tier: 1 },
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219, type: "city", tier: 1 },
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792, type: "city", tier: 1 },
  { name: "Casablanca", country: "Morocco", lat: 33.5731, lon: -7.5898, type: "city", tier: 2 },
  { name: "Marrakech", country: "Morocco", lat: 31.6295, lon: -7.9811, type: "city", tier: 2 },
  { name: "Addis Ababa", country: "Ethiopia", lat: 9.0300, lon: 38.7400, type: "city", tier: 2 },
  { name: "Dakar", country: "Senegal", lat: 14.7167, lon: -17.4677, type: "city", tier: 2 },

  // Oceania
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, type: "city", tier: 1 },
  { name: "Melbourne", country: "Australia", lat: -37.8136, lon: 144.9631, type: "city", tier: 1 },
  { name: "Brisbane", country: "Australia", lat: -27.4698, lon: 153.0251, type: "city", tier: 2 },
  { name: "Perth", country: "Australia", lat: -31.9505, lon: 115.8605, type: "city", tier: 2 },
  { name: "Cairns", country: "Australia", lat: -16.9186, lon: 145.7781, type: "city", tier: 2 },
  { name: "Alice Springs", country: "Australia", lat: -23.6980, lon: 133.8807, type: "city", tier: 2 },
  { name: "Auckland", country: "New Zealand", lat: -36.8485, lon: 174.7633, type: "city", tier: 1 },
  { name: "Wellington", country: "New Zealand", lat: -41.2865, lon: 174.7762, type: "city", tier: 2 },
  { name: "Christchurch", country: "New Zealand", lat: -43.5321, lon: 172.6362, type: "city", tier: 2 },
  { name: "Suva", country: "Fiji", lat: -18.1416, lon: 178.4419, type: "city", tier: 2 },
  { name: "Papeete", country: "French Polynesia (Tahiti)", lat: -17.5350, lon: -149.5696, type: "city", tier: 2 }
];

// ============================================================================
// 7. REGIONAL NORWEGIAN & EUROPEAN TOWNS (Curated for precision local matches)
// ============================================================================
export const REGIONAL_TOWNS = [
  { name: "Geilo", country: "Norway", lat: 60.5333, lon: 8.2056, type: "city", tier: 3 },
  { name: "Voss", country: "Norway", lat: 60.6286, lon: 6.4178, type: "city", tier: 3 },
  { name: "Gol", country: "Norway", lat: 60.6997, lon: 8.9497, type: "city", tier: 3 },
  { name: "Ål", country: "Norway", lat: 60.6289, lon: 8.5603, type: "city", tier: 3 },
  { name: "Hol", country: "Norway", lat: 60.6158, lon: 8.3039, type: "city", tier: 3 },
  { name: "Nesbyen", country: "Norway", lat: 60.5681, lon: 9.1028, type: "city", tier: 3 },
  { name: "Flå", country: "Norway", lat: 60.4294, lon: 9.4636, type: "city", tier: 3 },
  { name: "Dagali", country: "Norway", lat: 60.4122, lon: 8.5147, type: "city", tier: 3 },
  { name: "Uvdal", country: "Norway", lat: 60.2644, lon: 8.8319, type: "city", tier: 3 },
  { name: "Nore", country: "Norway", lat: 60.1633, lon: 9.0114, type: "city", tier: 3 },
  { name: "Flåm", country: "Norway", lat: 60.8631, lon: 7.1136, type: "city", tier: 3 },
  { name: "Aurland", country: "Norway", lat: 60.9067, lon: 7.1883, type: "city", tier: 3 },
  { name: "Gudvangen", country: "Norway", lat: 60.8797, lon: 6.8414, type: "city", tier: 3 },
  { name: "Lærdal", country: "Norway", lat: 61.0989, lon: 7.4800, type: "city", tier: 3 },
  { name: "Årdal", country: "Norway", lat: 61.2367, lon: 7.7028, type: "city", tier: 3 },
  { name: "Hemsedal", country: "Norway", lat: 60.8617, lon: 8.5539, type: "city", tier: 3 },
  { name: "Borgund", country: "Norway", lat: 61.0478, lon: 7.8119, type: "city", tier: 3 },
  { name: "Finse", country: "Norway", lat: 60.6019, lon: 7.5042, type: "city", tier: 3 },
  { name: "Myrdal", country: "Norway", lat: 60.7350, lon: 7.1231, type: "city", tier: 3 },
  { name: "Eidfjord", country: "Norway", lat: 60.4678, lon: 7.0700, type: "city", tier: 3 },
  { name: "Ulvik", country: "Norway", lat: 60.5694, lon: 6.9175, type: "city", tier: 3 },
  { name: "Granvin", country: "Norway", lat: 60.5256, lon: 6.7214, type: "city", tier: 3 },
  { name: "Odda", country: "Norway", lat: 60.0694, lon: 6.5458, type: "city", tier: 3 },
  { name: "Lillehammer", country: "Norway", lat: 61.1153, lon: 10.4664, type: "city", tier: 3 },
  { name: "Kongsberg", country: "Norway", lat: 59.6683, lon: 9.6503, type: "city", tier: 3 },
  { name: "Hønefoss", country: "Norway", lat: 60.1683, lon: 10.2572, type: "city", tier: 3 },
  { name: "Ålesund", country: "Norway", lat: 62.4722, lon: 6.1547, type: "city", tier: 3 },
  { name: "Molde", country: "Norway", lat: 62.7375, lon: 7.1608, type: "city", tier: 3 },
  { name: "Chamonix", country: "France", lat: 45.9237, lon: 6.8694, type: "city", tier: 3 },
  { name: "Zermatt", country: "Switzerland", lat: 45.9765, lon: 7.7491, type: "city", tier: 3 },
  { name: "Interlaken", country: "Switzerland", lat: 46.6863, lon: 7.8632, type: "city", tier: 3 },
  { name: "Innsbruck", country: "Austria", lat: 47.2692, lon: 11.4041, type: "city", tier: 2 },
  { name: "Salzburg", country: "Austria", lat: 47.8095, lon: 13.0550, type: "city", tier: 2 }
];

// ============================================================================
// 8. WORLD FAMOUS NATIONAL PARKS & NATURE RESERVES (🏞️)
// ============================================================================
export const NATIONAL_PARKS = [
  { name: "Yellowstone National Park", country: "United States", lat: 44.4280, lon: -110.5885, type: "national_park", tier: 1, icon: "🏞️", detail: "World's First National Park • Geysers, Hot Springs & Wildlife" },
  { name: "Yosemite National Park", country: "United States", lat: 37.8651, lon: -119.5383, type: "national_park", tier: 1, icon: "🏞️", detail: "Iconic Granite Cliffs of El Capitan & Half Dome" },
  { name: "Grand Canyon National Park", country: "United States", lat: 36.1069, lon: -112.1129, type: "national_park", tier: 1, icon: "🏞️", detail: "Immense Colorado River Gorge (446 km long)" },
  { name: "Banff National Park", country: "Canada", lat: 51.4968, lon: -115.9281, type: "national_park", tier: 1, icon: "🏞️", detail: "Turquoise Glacial Lakes of the Canadian Rockies" },
  { name: "Torres del Paine", country: "Chile", lat: -51.2532, lon: -72.8814, type: "national_park", tier: 1, icon: "🏞️", detail: "Granite Horns & Glaciers of Chilean Patagonia" },
  { name: "Kruger National Park", country: "South Africa", lat: -23.9884, lon: 31.5547, type: "national_park", tier: 1, icon: "🏞️", detail: "Renowned African Game Reserve & Big Five Safari" },
  { name: "Serengeti National Park", country: "Tanzania", lat: -2.3333, lon: 34.8333, type: "national_park", tier: 1, icon: "🏞️", detail: "Great Annual Wildebeest & Zebra Migration" },
  { name: "Fiordland National Park", country: "New Zealand", lat: -45.4167, lon: 167.7167, type: "national_park", tier: 1, icon: "🏞️", detail: "Dramatic Glacial Fjords including Milford Sound" },
  { name: "Plitvice Lakes National Park", country: "Croatia", lat: 44.8654, lon: 15.6038, type: "national_park", tier: 1, icon: "🏞️", detail: "Cascading Terraced Emerald Lakes & Waterfalls" },
  { name: "Galápagos National Park", country: "Ecuador", lat: -0.9538, lon: -90.9656, type: "national_park", tier: 1, icon: "🏞️", detail: "UNESCO Biosphere with Unique Endemic Wildlife" },
  { name: "Iguazú National Park", country: "Argentina / Brazil", lat: -25.6953, lon: -54.4367, type: "national_park", tier: 1, icon: "🏞️", detail: "Spectacular Crescent of 275 Roaring Waterfalls" },
  { name: "Sagarmatha National Park", country: "Nepal", lat: 27.9333, lon: 86.7333, type: "national_park", tier: 1, icon: "🏞️", detail: "Himalayan Reserve Encompassing Mount Everest" },
  { name: "Fuji-Hakone-Izu National Park", country: "Japan", lat: 35.3606, lon: 138.7274, type: "national_park", tier: 1, icon: "🏞️", detail: "Mount Fuji, Volcanic Lakes & Hot Springs" },
  { name: "Jotunheimen National Park", country: "Norway", lat: 61.5000, lon: 8.4000, type: "national_park", tier: 1, icon: "🏞️", detail: "Home of the Giants • Highest Peaks in Northern Europe" },
  { name: "Hardangervidda National Park", country: "Norway", lat: 60.1333, lon: 7.5000, type: "national_park", tier: 1, icon: "🏞️", detail: "Northern Europe's Largest High Mountain Plateau" },
  { name: "Tongariro National Park", country: "New Zealand", lat: -39.2908, lon: 175.5622, type: "national_park", tier: 1, icon: "🏞️", detail: "Active Volcanic Peaks & Emerald Alpine Crater Lakes" },
  { name: "Zion National Park", country: "United States", lat: 37.2982, lon: -113.0263, type: "national_park", tier: 1, icon: "🏞️", detail: "Towering Navajo Sandstone Canyons & The Narrows" },
  { name: "Jasper National Park", country: "Canada", lat: 52.8734, lon: -117.9543, type: "national_park", tier: 1, icon: "🏞️", detail: "Glacier-Fed Athabasca Falls & Columbia Icefield" },
  { name: "Swiss National Park", country: "Switzerland", lat: 46.6667, lon: 10.2000, type: "national_park", tier: 1, icon: "🏞️", detail: "Oldest National Park in the Alps & Strict Nature Reserve" },
  { name: "Jiuzhaigou Valley", country: "China", lat: 33.2600, lon: 103.9200, type: "national_park", tier: 1, icon: "🏞️", detail: "Multi-Tiered Waterfalls and Colorful Alpine Lakes" },
  { name: "Kakadu National Park", country: "Australia", lat: -12.8333, lon: 132.8333, type: "national_park", tier: 1, icon: "🏞️", detail: "Ancient Indigenous Rock Art & Tropical Wetlands" },
  { name: "Etosha National Park", country: "Namibia", lat: -18.9400, lon: 15.9000, type: "national_park", tier: 1, icon: "🏞️", detail: "Immense Shimmering Salt Pan with Desert Wildlife" },
  { name: "Cinque Terre National Park", country: "Italy", lat: 44.1333, lon: 9.7000, type: "national_park", tier: 1, icon: "🏞️", detail: "Pastel Terraced Coastal Villages along the Ligurian Sea" },
  { name: "Olympic National Park", country: "United States", lat: 47.8021, lon: -123.6044, type: "national_park", tier: 1, icon: "🏞️", detail: "Glaciated Mountains, Temperate Rainforests & Wild Coastlines" },
  { name: "Great Smoky Mountains", country: "United States", lat: 35.6131, lon: -83.5532, type: "national_park", tier: 1, icon: "🏞️", detail: "Ancient Mist-Shrouded Appalachian Mountains & Rich Forests" },
  { name: "Lake District National Park", country: "United Kingdom", lat: 54.4609, lon: -3.0886, type: "national_park", tier: 1, icon: "🏞️", detail: "Picturesque Glacial Lakes, Rugged Fells & Literary Heritage" },
  { name: "Cairngorms National Park", country: "United Kingdom", lat: 57.0800, lon: -3.6800, type: "national_park", tier: 1, icon: "🏞️", detail: "Britain's Largest National Park • Wild Scottish Highlands" },
  { name: "Dolomiti Bellunesi", country: "Italy", lat: 46.2167, lon: 12.0833, type: "national_park", tier: 1, icon: "🏞️", detail: "Pale Dolomite Peaks, Deep Valleys & Alpine Meadows" },
  { name: "Vatnajökull National Park", country: "Iceland", lat: 64.4000, lon: -16.8000, type: "national_park", tier: 1, icon: "🏞️", detail: "Massive Ice Cap, Active Subglacial Volcanoes & Basalt Canyons" },
  { name: "Guilin and Lijiang River", country: "China", lat: 25.2736, lon: 110.2902, type: "national_park", tier: 1, icon: "🏞️", detail: "Spectacular Karst Mountain Cones along Jade-Green Waters" },
  { name: "Zhangjiajie National Forest", country: "China", lat: 29.3150, lon: 110.4344, type: "national_park", tier: 1, icon: "🏞️", detail: "Towering Pillar Sandstone Formations (Avatar Mountains)" },
  { name: "Komodo National Park", country: "Indonesia", lat: -8.5433, lon: 119.4894, type: "national_park", tier: 1, icon: "🏞️", detail: "Rugged Volcanic Islands & Ancient Komodo Dragons" },
  { name: "Bwindi Impenetrable Park", country: "Uganda", lat: -1.0500, lon: 29.6833, type: "national_park", tier: 1, icon: "🏞️", detail: "Primeval Mountain Rainforest Home of Endangered Mountain Gorillas" },
  { name: "Okavango Delta", country: "Botswana", lat: -19.3000, lon: 22.9000, type: "national_park", tier: 1, icon: "🏞️", detail: "Vast Inland River Delta Oasis Teeming with African Wildlife" },
  { name: "Los Glaciares National Park", country: "Argentina", lat: -50.5000, lon: -73.2000, type: "national_park", tier: 1, icon: "🏞️", detail: "Colossal Advancing Perito Moreno Glacier & Mount Fitz Roy" },
  { name: "Uluru-Kata Tjuta National Park", country: "Australia", lat: -25.3444, lon: 131.0369, type: "national_park", tier: 1, icon: "🏞️", detail: "Sacred Red Sandstone Monolith in Central Australia" },
  { name: "Berchtesgaden National Park", country: "Germany", lat: 47.5500, lon: 12.9167, type: "national_park", tier: 1, icon: "🏞️", detail: "High Alpine Biosphere with the Emerald Königssee Fjord Lake" },
  { name: "Triglav National Park", country: "Slovenia", lat: 46.3800, lon: 13.8400, type: "national_park", tier: 1, icon: "🏞️", detail: "Julian Alps Sanctuary with Lake Bohinj and Emerald Soča River" }
];

// Combine all curated points of interest into master array
export const CURATED_PLACES = [
  ...EXPANDED_CITIES,
  ...MOUNTAINS,
  ...REEFS,
  ...RIVERS,
  ...LAKES,
  ...NATURAL_WONDERS,
  ...NATIONAL_PARKS,
  ...REGIONAL_TOWNS
];

export const MARITIME_REGIONS = [
  { name: "North Atlantic Ocean", lat: 35.0, lon: -40.0 },
  { name: "South Atlantic Ocean", lat: -25.0, lon: -20.0 },
  { name: "North Pacific Ocean", lat: 30.0, lon: 170.0 },
  { name: "South Pacific Ocean", lat: -25.0, lon: -130.0 },
  { name: "Indian Ocean", lat: -15.0, lon: 75.0 },
  { name: "Southern Ocean", lat: -60.0, lon: 0.0 },
  { name: "Arctic Ocean", lat: 82.0, lon: 0.0 },
  { name: "Mediterranean Sea", lat: 35.0, lon: 18.0 },
  { name: "Caribbean Sea", lat: 15.0, lon: -75.0 },
  { name: "Arabian Sea", lat: 15.0, lon: 65.0 },
  { name: "Coral Sea", lat: -18.0, lon: 155.0 },
  { name: "Bering Sea", lat: 58.0, lon: -175.0 },
  { name: "Norwegian Sea", lat: 68.0, lon: 0.0 },
  { name: "Tasman Sea", lat: -38.0, lon: 160.0 }
];

let allPlaces = [...CURATED_PLACES];
let placesLoaded = false;
let osmCache = new Map();
let lastOsmFetchTime = 0;

/**
 * Returns UI metadata (label, icon, badgeClass) for a POI type
 */
export function getPoiTypeInfo(type) {
  switch (type) {
    case 'mountain':
      return { label: 'Mountain', icon: '🏔️', badgeClass: 'poi-type-mountain' };
    case 'reef':
      return { label: 'Coral Reef', icon: '🪸', badgeClass: 'poi-type-reef' };
    case 'river':
      return { label: 'River', icon: '🌊', badgeClass: 'poi-type-river' };
    case 'lake':
      return { label: 'Lake', icon: '🏞️', badgeClass: 'poi-type-lake' };
    case 'nature':
      return { label: 'Natural Wonder', icon: '✨', badgeClass: 'poi-type-nature' };
    case 'national_park':
    case 'park':
      return { label: 'National Park', icon: '🏞️', badgeClass: 'poi-type-park' };
    case 'city':
      return { label: 'City', icon: '🏙️', badgeClass: 'poi-type-city' };
    default:
      return { label: 'Point of Interest', icon: '📍', badgeClass: 'poi-type-default' };
  }
}

/**
 * Load Natural Earth 50m populated places dataset and merge into allPlaces
 */
export async function loadAdditionalPlaces() {
  if (placesLoaded) return allPlaces;
  try {
    const resp = await fetch('/data/ne_50m_populated_places.geojson');
    if (!resp.ok) return allPlaces;
    const geojson = await resp.json();

    const existingNames = new Set(allPlaces.map(p => p.name.toLowerCase()));

    for (const f of geojson.features || []) {
      const p = f.properties;
      if (!p || !p.name) continue;
      if (existingNames.has(p.name.toLowerCase())) continue;

      const rank = p.scalerank !== undefined ? p.scalerank : 5;
      let tier = 3;
      if (rank <= 2) tier = 1;
      else if (rank <= 5) tier = 2;

      allPlaces.push({
        name: p.name,
        country: p.adm0name || p.sov0name || '',
        lat: p.latitude || f.geometry.coordinates[1],
        lon: p.longitude || f.geometry.coordinates[0],
        type: 'city',
        tier
      });
      existingNames.add(p.name.toLowerCase());
    }
    placesLoaded = true;
  } catch (err) {
    console.warn('Could not load additional populated places:', err);
  }
  return allPlaces;
}

/**
 * Dynamic OpenStreetMap viewport fetching
 */
export async function fetchOSMPlacesForViewport(centerLat, centerLon, spanDeg = 2.0) {
  const now = Date.now();
  if (now - lastOsmFetchTime < 1800) return;
  lastOsmFetchTime = now;

  const latMin = Math.max(-85, centerLat - spanDeg);
  const latMax = Math.min(85, centerLat + spanDeg);
  const lonMin = Math.max(-180, centerLon - spanDeg);
  const lonMax = Math.min(180, centerLon + spanDeg);

  const boxKey = `${latMin.toFixed(1)}_${lonMin.toFixed(1)}`;
  if (osmCache.has(boxKey)) return osmCache.get(boxKey);

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=city+town&bounded=1&viewbox=${lonMin},${latMax},${lonMax},${latMin}&limit=35`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'EquiDistance-Explorer/1.0' }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (!Array.isArray(data)) return;

    const existingNames = new Set(allPlaces.map(p => p.name.toLowerCase()));
    const newPlaces = [];

    for (const item of data) {
      const name = item.name || (item.display_name ? item.display_name.split(',')[0].trim() : '');
      if (!name || name.length > 25 || existingNames.has(name.toLowerCase())) continue;

      const p = {
        name,
        country: '',
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: 'city',
        tier: 3
      };
      allPlaces.push(p);
      existingNames.add(name.toLowerCase());
      newPlaces.push(p);
    }

    osmCache.set(boxKey, newPlaces);
    return newPlaces;
  } catch (err) {
    // Graceful offline fallback
  }
}

/**
 * Filter places for altitude
 */
export function getPlacesForAltitude(altitude) {
  if (altitude > 130) {
    return [];
  } else if (altitude > 65) {
    return allPlaces.filter(p => p.tier === 1);
  } else if (altitude > 28) {
    return allPlaces.filter(p => p.tier <= 2);
  } else {
    return allPlaces;
  }
}

/**
 * Returns all points of interest
 */
export function getAllPointsOfInterest() {
  return allPlaces;
}

/**
 * Accurately find the nearest populated place, city, mountain, reef, river, lake, or ocean basin
 * Evaluates against all curated POIs, mountains, reefs, rivers, lakes, and regional cities.
 */
export function findNearestPlace(lat, lon, unit = 'km') {
  let nearestPlace = null;
  let minDist = Infinity;

  let nearestCity = null;
  let minCityDist = Infinity;

  let nearestFeature = null;
  let minFeatureDist = Infinity;

  for (const place of allPlaces) {
    const d = haversineDistance(lat, lon, place.lat, place.lon, unit);
    if (d < minDist) {
      minDist = d;
      nearestPlace = place;
    }

    const isCity = !place.type || place.type === 'city';
    if (isCity) {
      if (d < minCityDist) {
        minCityDist = d;
        nearestCity = place;
      }
    } else {
      if (d < minFeatureDist) {
        minFeatureDist = d;
        nearestFeature = place;
      }
    }
  }

  // Major open maritime basins
  let nearestSea = null;
  let minSeaDist = Infinity;
  for (const sea of MARITIME_REGIONS) {
    const d = haversineDistance(lat, lon, sea.lat, sea.lon, unit);
    if (d < minSeaDist) {
      minSeaDist = d;
      nearestSea = sea;
    }
  }

  // A location is oceanic if it is far (> 280 km) from any settlement or natural landmark
  const isOcean = minDist > 280 && minSeaDist < minDist * 0.85;

  let formattedName = '';
  let primaryType = nearestPlace?.type || 'city';
  let icon = nearestPlace?.icon || getPoiTypeInfo(primaryType).icon;
  let detail = nearestPlace?.detail || '';

  // If a famous natural feature (reef, mountain, river, lake, wonder) is within 120 km
  // or closer than the nearest city, give it prominent spotlight
  if (nearestFeature && minFeatureDist <= 135 && (minFeatureDist <= minCityDist * 1.5 || minCityDist > 45)) {
    const featIcon = nearestFeature.icon || getPoiTypeInfo(nearestFeature.type).icon;
    const countryPart = nearestFeature.country ? ` (${nearestFeature.country})` : '';
    if (minFeatureDist <= 20) {
      formattedName = `${featIcon} Near ${nearestFeature.name}${countryPart}`;
    } else {
      formattedName = `${featIcon} ~${Math.round(minFeatureDist)} ${unit} from ${nearestFeature.name}${countryPart}`;
    }
    primaryType = nearestFeature.type;
    icon = featIcon;
    detail = nearestFeature.detail || '';
  } else if (!isOcean && nearestPlace) {
    const countryPart = nearestPlace.country ? `, ${nearestPlace.country}` : '';
    const prefix = nearestPlace.icon ? `${nearestPlace.icon} ` : '';
    if (minDist <= 25) {
      formattedName = `${prefix}Near ${nearestPlace.name}${countryPart}`;
    } else {
      formattedName = `${prefix}~${Math.round(minDist)} ${unit} from ${nearestPlace.name}${countryPart}`;
    }
  } else if (nearestSea) {
    if (nearestPlace && minDist < 1500) {
      formattedName = `🌊 ${nearestSea.name} (~${Math.round(minDist)} ${unit} from ${nearestPlace.name})`;
    } else {
      formattedName = `🌊 ${nearestSea.name}`;
    }
    primaryType = 'ocean';
    icon = '🌊';
  } else {
    formattedName = nearestPlace ? `Near ${nearestPlace.name}` : 'Open Waters';
  }

  return {
    nearestPlace,
    nearestCity: nearestCity || nearestPlace,
    nearestFeature,
    cityDistance: Math.round(minCityDist === Infinity ? minDist : minCityDist),
    minDistance: Math.round(minDist),
    nearestSea,
    seaDistance: Math.round(minSeaDist),
    isOcean,
    formattedName,
    type: primaryType,
    icon,
    detail
  };
}
