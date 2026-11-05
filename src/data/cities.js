/**
 * Comprehensive Global Cities, Regional Capitals, Remote Islands & Sovereign Nations
 * Every sovereign country on Earth is represented, with proportionally more entries
 * for geographically large and highly populated nations.
 * Used for instant autocomplete search, preset demos, offline reverse-geocoding, and distance calculations.
 */

export const MAJOR_CITIES = [
  // ============================================================================
  // NORTH AMERICA & CARIBBEAN
  // ============================================================================
  // United States (Proportional coverage across coasts, plains, mountains, territories)
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.0060, region: "North America", pop: "8.5M" },
  { name: "Los Angeles", country: "United States", lat: 34.0522, lon: -118.2437, region: "North America", pop: "3.9M" },
  { name: "Chicago", country: "United States", lat: 41.8781, lon: -87.6298, region: "North America", pop: "2.7M" },
  { name: "Houston", country: "United States", lat: 29.7604, lon: -95.3698, region: "North America", pop: "2.3M" },
  { name: "Phoenix", country: "United States", lat: 33.4484, lon: -112.0740, region: "North America" },
  { name: "Philadelphia", country: "United States", lat: 39.9526, lon: -75.1652, region: "North America" },
  { name: "San Antonio", country: "United States", lat: 29.4241, lon: -98.4936, region: "North America" },
  { name: "San Diego", country: "United States", lat: 32.7157, lon: -117.1611, region: "North America" },
  { name: "Dallas", country: "United States", lat: 32.7767, lon: -96.7970, region: "North America" },
  { name: "San Francisco", country: "United States", lat: 37.7749, lon: -122.4194, region: "North America" },
  { name: "Austin", country: "United States", lat: 30.2672, lon: -97.7431, region: "North America" },
  { name: "Seattle", country: "United States", lat: 47.6062, lon: -122.3321, region: "North America" },
  { name: "Denver", country: "United States", lat: 39.7392, lon: -104.9903, region: "North America" },
  { name: "Washington, D.C.", country: "United States", lat: 38.9072, lon: -77.0369, region: "North America" },
  { name: "Boston", country: "United States", lat: 42.3601, lon: -71.0589, region: "North America" },
  { name: "Miami", country: "United States", lat: 25.7617, lon: -80.1918, region: "North America" },
  { name: "Atlanta", country: "United States", lat: 33.7490, lon: -84.3880, region: "North America" },
  { name: "Detroit", country: "United States", lat: 42.3314, lon: -83.0458, region: "North America" },
  { name: "Minneapolis", country: "United States", lat: 44.9778, lon: -93.2650, region: "North America" },
  { name: "Las Vegas", country: "United States", lat: 36.1699, lon: -115.1398, region: "North America" },
  { name: "Honolulu", country: "United States (Hawaii)", lat: 21.3069, lon: -157.8583, region: "Oceania" },
  { name: "Anchorage", country: "United States (Alaska)", lat: 61.2181, lon: -149.9003, region: "North America" },
  { name: "San Juan", country: "Puerto Rico (US)", lat: 18.4655, lon: -66.1057, region: "Caribbean" },
  { name: "Tamuning (Guam)", country: "Guam (US)", lat: 13.4877, lon: 144.7816, region: "Oceania" },

  // Canada (Trans-Canada coverage)
  { name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832, region: "North America", pop: "2.9M" },
  { name: "Montreal", country: "Canada", lat: 45.5017, lon: -73.5673, region: "North America", pop: "1.8M" },
  { name: "Vancouver", country: "Canada", lat: 49.2827, lon: -123.1207, region: "North America" },
  { name: "Calgary", country: "Canada", lat: 51.0447, lon: -114.0719, region: "North America" },
  { name: "Edmonton", country: "Canada", lat: 53.5461, lon: -113.4938, region: "North America" },
  { name: "Ottawa", country: "Canada", lat: 45.4215, lon: -75.6972, region: "North America" },
  { name: "Quebec City", country: "Canada", lat: 46.8139, lon: -71.2080, region: "North America" },
  { name: "Winnipeg", country: "Canada", lat: 49.8951, lon: -97.1384, region: "North America" },
  { name: "Halifax", country: "Canada", lat: 44.6488, lon: -63.5752, region: "North America" },
  { name: "Whitehorse", country: "Canada (Yukon)", lat: 60.7212, lon: -135.0568, region: "North America" },
  { name: "Yellowknife", country: "Canada (NWT)", lat: 62.4540, lon: -114.3718, region: "North America" },
  { name: "Iqaluit", country: "Canada (Nunavut)", lat: 63.7467, lon: -68.5170, region: "North America" },

  // Mexico
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332, region: "North America", pop: "9.2M" },
  { name: "Guadalajara", country: "Mexico", lat: 20.6597, lon: -103.3496, region: "North America" },
  { name: "Monterrey", country: "Mexico", lat: 25.6866, lon: -100.3161, region: "North America" },
  { name: "Puebla", country: "Mexico", lat: 19.0414, lon: -98.2063, region: "North America" },
  { name: "Tijuana", country: "Mexico", lat: 32.5149, lon: -117.0382, region: "North America" },
  { name: "Cancun", country: "Mexico", lat: 21.1619, lon: -86.8515, region: "North America" },
  { name: "Merida", country: "Mexico", lat: 20.9674, lon: -89.5926, region: "North America" },

  // Central America
  { name: "Guatemala City", country: "Guatemala", lat: 14.6349, lon: -90.5069, region: "Central America" },
  { name: "Belize City", country: "Belize", lat: 17.5046, lon: -88.1962, region: "Central America" },
  { name: "Belmopan", country: "Belize", lat: 17.2510, lon: -88.7590, region: "Central America" },
  { name: "San Salvador", country: "El Salvador", lat: 13.6929, lon: -89.2182, region: "Central America" },
  { name: "Tegucigalpa", country: "Honduras", lat: 14.0723, lon: -87.1921, region: "Central America" },
  { name: "San Pedro Sula", country: "Honduras", lat: 15.5000, lon: -88.0333, region: "Central America" },
  { name: "Managua", country: "Nicaragua", lat: 12.1150, lon: -86.2362, region: "Central America" },
  { name: "San Jose", country: "Costa Rica", lat: 9.9281, lon: -84.0907, region: "Central America" },
  { name: "Panama City", country: "Panama", lat: 8.9824, lon: -79.5199, region: "Central America" },

  // Caribbean Nations
  { name: "Havana", country: "Cuba", lat: 23.1136, lon: -82.3666, region: "Caribbean" },
  { name: "Santiago de Cuba", country: "Cuba", lat: 20.0208, lon: -75.8267, region: "Caribbean" },
  { name: "Kingston", country: "Jamaica", lat: 17.9712, lon: -76.7936, region: "Caribbean" },
  { name: "Santo Domingo", country: "Dominican Republic", lat: 18.4861, lon: -69.9312, region: "Caribbean" },
  { name: "Port-au-Prince", country: "Haiti", lat: 18.5944, lon: -72.3074, region: "Caribbean" },
  { name: "Nassau", country: "Bahamas", lat: 25.0443, lon: -77.3504, region: "Caribbean" },
  { name: "Bridgetown", country: "Barbados", lat: 13.1060, lon: -59.6132, region: "Caribbean" },
  { name: "Port of Spain", country: "Trinidad and Tobago", lat: 10.6549, lon: -61.5019, region: "Caribbean" },
  { name: "Castries", country: "Saint Lucia", lat: 14.0101, lon: -60.9875, region: "Caribbean" },
  { name: "St. George's", country: "Grenada", lat: 12.0561, lon: -61.7488, region: "Caribbean" },
  { name: "St. John's", country: "Antigua and Barbuda", lat: 17.1274, lon: -61.8468, region: "Caribbean" },
  { name: "Basseterre", country: "Saint Kitts and Nevis", lat: 17.3026, lon: -62.7177, region: "Caribbean" },
  { name: "Roseau", country: "Dominica", lat: 15.3017, lon: -61.3881, region: "Caribbean" },
  { name: "Kingstown", country: "Saint Vincent and the Grenadines", lat: 13.1600, lon: -61.2248, region: "Caribbean" },

  // ============================================================================
  // SOUTH AMERICA
  // ============================================================================
  // Brazil
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333, region: "South America", pop: "12.3M" },
  { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lon: -43.1729, region: "South America", pop: "6.7M" },
  { name: "Brasília", country: "Brazil", lat: -15.8267, lon: -47.9218, region: "South America", pop: "3.1M" },
  { name: "Salvador", country: "Brazil", lat: -12.9777, lon: -38.5016, region: "South America" },
  { name: "Fortaleza", country: "Brazil", lat: -3.7319, lon: -38.5267, region: "South America" },
  { name: "Belo Horizonte", country: "Brazil", lat: -19.9167, lon: -43.9345, region: "South America" },
  { name: "Manaus", country: "Brazil", lat: -3.1190, lon: -60.0217, region: "South America" },
  { name: "Curitiba", country: "Brazil", lat: -25.4284, lon: -49.2733, region: "South America" },
  { name: "Recife", country: "Brazil", lat: -8.0543, lon: -34.8813, region: "South America" },
  { name: "Porto Alegre", country: "Brazil", lat: -30.0346, lon: -51.2177, region: "South America" },
  { name: "Belém", country: "Brazil", lat: -1.4558, lon: -48.4902, region: "South America" },

  // Argentina
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816, region: "South America", pop: "3.1M" },
  { name: "Córdoba", country: "Argentina", lat: -31.4201, lon: -64.1888, region: "South America" },
  { name: "Rosario", country: "Argentina", lat: -32.9468, lon: -60.6393, region: "South America" },
  { name: "Mendoza", country: "Argentina", lat: -32.8895, lon: -68.8458, region: "South America" },
  { name: "Ushuaia", country: "Argentina", lat: -54.8019, lon: -68.3030, region: "South America" },
  { name: "Salta", country: "Argentina", lat: -24.7821, lon: -65.4232, region: "South America" },
  { name: "Bariloche", country: "Argentina", lat: -41.1335, lon: -71.3103, region: "South America" },

  // Colombia
  { name: "Bogota", country: "Colombia", lat: 4.7110, lon: -74.0721, region: "South America", pop: "8.0M" },
  { name: "Medellín", country: "Colombia", lat: 6.2442, lon: -75.5812, region: "South America" },
  { name: "Cali", country: "Colombia", lat: 3.4516, lon: -76.5320, region: "South America" },
  { name: "Barranquilla", country: "Colombia", lat: 10.9685, lon: -74.7813, region: "South America" },
  { name: "Cartagena", country: "Colombia", lat: 10.3910, lon: -75.4794, region: "South America" },

  // Peru
  { name: "Lima", country: "Peru", lat: -12.0464, lon: -77.0428, region: "South America", pop: "9.7M" },
  { name: "Arequipa", country: "Peru", lat: -16.4090, lon: -71.5375, region: "South America" },
  { name: "Cusco", country: "Peru", lat: -13.5319, lon: -71.9675, region: "South America" },
  { name: "Trujillo", country: "Peru", lat: -8.1160, lon: -79.0300, region: "South America" },
  { name: "Iquitos", country: "Peru", lat: -3.7491, lon: -73.2538, region: "South America" },

  // Chile
  { name: "Santiago", country: "Chile", lat: -33.4489, lon: -70.6693, region: "South America", pop: "6.2M" },
  { name: "Valparaíso", country: "Chile", lat: -33.0472, lon: -71.6127, region: "South America" },
  { name: "Concepción", country: "Chile", lat: -36.8201, lon: -73.0444, region: "South America" },
  { name: "Antofagasta", country: "Chile", lat: -23.6509, lon: -70.3975, region: "South America" },
  { name: "Punta Arenas", country: "Chile", lat: -53.1638, lon: -70.9171, region: "South America" },

  // Venezuela, Ecuador, Bolivia, Paraguay, Uruguay, Guyanas
  { name: "Caracas", country: "Venezuela", lat: 10.4806, lon: -66.9036, region: "South America" },
  { name: "Maracaibo", country: "Venezuela", lat: 10.6427, lon: -71.6125, region: "South America" },
  { name: "Quito", country: "Ecuador", lat: -0.1807, lon: -78.4678, region: "South America" },
  { name: "Guayaquil", country: "Ecuador", lat: -2.1894, lon: -79.8891, region: "South America" },
  { name: "La Paz", country: "Bolivia", lat: -16.5000, lon: -68.1500, region: "South America" },
  { name: "Santa Cruz de la Sierra", country: "Bolivia", lat: -17.7833, lon: -63.1821, region: "South America" },
  { name: "Sucre", country: "Bolivia", lat: -19.0196, lon: -65.2620, region: "South America" },
  { name: "Asunción", country: "Paraguay", lat: -25.2637, lon: -57.5759, region: "South America" },
  { name: "Ciudad del Este", country: "Paraguay", lat: -25.5097, lon: -54.6111, region: "South America" },
  { name: "Montevideo", country: "Uruguay", lat: -34.9011, lon: -56.1645, region: "South America" },
  { name: "Punta del Este", country: "Uruguay", lat: -34.9644, lon: -54.9439, region: "South America" },
  { name: "Georgetown", country: "Guyana", lat: 6.8013, lon: -58.1551, region: "South America" },
  { name: "Paramaribo", country: "Suriname", lat: 5.8520, lon: -55.2038, region: "South America" },
  { name: "Cayenne", country: "French Guiana", lat: 4.9372, lon: -52.3260, region: "South America" },

  // ============================================================================
  // EUROPE
  // ============================================================================
  // United Kingdom
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278, region: "Europe", pop: "9.0M" },
  { name: "Birmingham", country: "United Kingdom", lat: 52.4862, lon: -1.8904, region: "Europe" },
  { name: "Manchester", country: "United Kingdom", lat: 53.4808, lon: -2.2426, region: "Europe" },
  { name: "Glasgow", country: "United Kingdom", lat: 55.8642, lon: -4.2518, region: "Europe" },
  { name: "Edinburgh", country: "United Kingdom", lat: 55.9533, lon: -3.1883, region: "Europe" },
  { name: "Belfast", country: "United Kingdom", lat: 54.5973, lon: -5.9301, region: "Europe" },
  { name: "Cardiff", country: "United Kingdom", lat: 51.4816, lon: -3.1791, region: "Europe" },

  // France
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522, region: "Europe", pop: "2.1M" },
  { name: "Marseille", country: "France", lat: 43.2965, lon: 5.3698, region: "Europe" },
  { name: "Lyon", country: "France", lat: 45.7640, lon: 4.8357, region: "Europe" },
  { name: "Toulouse", country: "France", lat: 43.6047, lon: 1.4442, region: "Europe" },
  { name: "Nice", country: "France", lat: 43.7102, lon: 7.2620, region: "Europe" },
  { name: "Bordeaux", country: "France", lat: 44.8378, lon: -0.5792, region: "Europe" },
  { name: "Strasbourg", country: "France", lat: 48.5734, lon: 7.7521, region: "Europe" },

  // Germany
  { name: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050, region: "Europe", pop: "3.7M" },
  { name: "Hamburg", country: "Germany", lat: 53.5511, lon: 9.9937, region: "Europe" },
  { name: "Munich", country: "Germany", lat: 48.1351, lon: 11.5820, region: "Europe" },
  { name: "Cologne", country: "Germany", lat: 50.9375, lon: 6.9603, region: "Europe" },
  { name: "Frankfurt", country: "Germany", lat: 50.1109, lon: 8.6821, region: "Europe" },
  { name: "Stuttgart", country: "Germany", lat: 48.7758, lon: 9.1829, region: "Europe" },
  { name: "Leipzig", country: "Germany", lat: 51.3397, lon: 12.3731, region: "Europe" },

  // Italy
  { name: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964, region: "Europe", pop: "2.8M" },
  { name: "Milan", country: "Italy", lat: 45.4642, lon: 9.1900, region: "Europe" },
  { name: "Naples", country: "Italy", lat: 40.8518, lon: 14.2681, region: "Europe" },
  { name: "Turin", country: "Italy", lat: 45.0703, lon: 7.6869, region: "Europe" },
  { name: "Palermo", country: "Italy", lat: 38.1157, lon: 13.3615, region: "Europe" },
  { name: "Florence", country: "Italy", lat: 43.7696, lon: 11.2558, region: "Europe" },
  { name: "Venice", country: "Italy", lat: 45.4408, lon: 12.3155, region: "Europe" },

  // Spain
  { name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038, region: "Europe", pop: "3.3M" },
  { name: "Barcelona", country: "Spain", lat: 41.3851, lon: 2.1734, region: "Europe", pop: "1.6M" },
  { name: "Valencia", country: "Spain", lat: 39.4699, lon: -0.3763, region: "Europe" },
  { name: "Seville", country: "Spain", lat: 37.3891, lon: -5.9845, region: "Europe" },
  { name: "Bilbao", country: "Spain", lat: 43.2630, lon: -2.9350, region: "Europe" },
  { name: "Malaga", country: "Spain", lat: 36.7213, lon: -4.4214, region: "Europe" },

  // Nordic Countries
  { name: "Oslo", country: "Norway", lat: 59.9139, lon: 10.7522, region: "Europe" },
  { name: "Bergen", country: "Norway", lat: 60.3913, lon: 5.3221, region: "Europe" },
  { name: "Trondheim", country: "Norway", lat: 63.4305, lon: 10.3951, region: "Europe" },
  { name: "Stavanger", country: "Norway", lat: 58.9690, lon: 5.7331, region: "Europe" },
  { name: "Tromsø", country: "Norway", lat: 69.6492, lon: 18.9553, region: "Europe" },
  { name: "Kristiansand", country: "Norway", lat: 58.1599, lon: 8.0182, region: "Europe" },
  { name: "Bodø", country: "Norway", lat: 67.2804, lon: 14.4049, region: "Europe" },
  { name: "Stockholm", country: "Sweden", lat: 59.3293, lon: 18.0686, region: "Europe" },
  { name: "Gothenburg", country: "Sweden", lat: 57.7089, lon: 11.9746, region: "Europe" },
  { name: "Malmö", country: "Sweden", lat: 55.6050, lon: 13.0038, region: "Europe" },
  { name: "Kiruna", country: "Sweden", lat: 67.8558, lon: 20.2253, region: "Europe" },
  { name: "Copenhagen", country: "Denmark", lat: 55.6761, lon: 12.5683, region: "Europe" },
  { name: "Aarhus", country: "Denmark", lat: 56.1629, lon: 10.2039, region: "Europe" },
  { name: "Helsinki", country: "Finland", lat: 60.1699, lon: 24.9384, region: "Europe" },
  { name: "Tampere", country: "Finland", lat: 61.4978, lon: 23.7610, region: "Europe" },
  { name: "Oulu", country: "Finland", lat: 65.0121, lon: 25.4651, region: "Europe" },
  { name: "Reykjavik", country: "Iceland", lat: 64.1466, lon: -21.9426, region: "Europe" },
  { name: "Akureyri", country: "Iceland", lat: 65.6885, lon: -18.1262, region: "Europe" },
  { name: "Tórshavn", country: "Faroe Islands", lat: 62.0079, lon: -6.7900, region: "Europe" },

  // Rest of Western & Central Europe
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lon: 4.9041, region: "Europe" },
  { name: "Rotterdam", country: "Netherlands", lat: 51.9244, lon: 4.4777, region: "Europe" },
  { name: "Brussels", country: "Belgium", lat: 50.8503, lon: 4.3517, region: "Europe" },
  { name: "Antwerp", country: "Belgium", lat: 51.2194, lon: 4.4025, region: "Europe" },
  { name: "Dublin", country: "Ireland", lat: 53.3498, lon: -6.2603, region: "Europe" },
  { name: "Cork", country: "Ireland", lat: 51.8985, lon: -8.4756, region: "Europe" },
  { name: "Zurich", country: "Switzerland", lat: 47.3769, lon: 8.5417, region: "Europe" },
  { name: "Geneva", country: "Switzerland", lat: 46.2044, lon: 6.1432, region: "Europe" },
  { name: "Bern", country: "Switzerland", lat: 46.9480, lon: 7.4474, region: "Europe" },
  { name: "Vienna", country: "Austria", lat: 48.2082, lon: 16.3738, region: "Europe" },
  { name: "Salzburg", country: "Austria", lat: 47.8095, lon: 13.0550, region: "Europe" },
  { name: "Innsbruck", country: "Austria", lat: 47.2692, lon: 11.4041, region: "Europe" },
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lon: -9.1393, region: "Europe" },
  { name: "Porto", country: "Portugal", lat: 41.1579, lon: -8.6291, region: "Europe" },
  { name: "Funchal", country: "Portugal (Madeira)", lat: 32.6669, lon: -16.9241, region: "Atlantic" },
  { name: "Athens", country: "Greece", lat: 37.9838, lon: 23.7275, region: "Europe" },
  { name: "Thessaloniki", country: "Greece", lat: 40.6401, lon: 22.9444, region: "Europe" },

  // Eastern & Southeastern Europe
  { name: "Warsaw", country: "Poland", lat: 52.2297, lon: 21.0122, region: "Europe" },
  { name: "Kraków", country: "Poland", lat: 50.0647, lon: 19.9450, region: "Europe" },
  { name: "Gdańsk", country: "Poland", lat: 54.3520, lon: 18.6466, region: "Europe" },
  { name: "Prague", country: "Czech Republic", lat: 50.0755, lon: 14.4378, region: "Europe" },
  { name: "Brno", country: "Czech Republic", lat: 49.1951, lon: 16.6068, region: "Europe" },
  { name: "Bratislava", country: "Slovakia", lat: 48.1486, lon: 17.1077, region: "Europe" },
  { name: "Budapest", country: "Hungary", lat: 47.4979, lon: 19.0402, region: "Europe" },
  { name: "Bucharest", country: "Romania", lat: 44.4268, lon: 26.1025, region: "Europe" },
  { name: "Cluj-Napoca", country: "Romania", lat: 46.7712, lon: 23.6236, region: "Europe" },
  { name: "Sofia", country: "Bulgaria", lat: 42.6977, lon: 23.3219, region: "Europe" },
  { name: "Belgrade", country: "Serbia", lat: 44.7866, lon: 20.4489, region: "Europe" },
  { name: "Zagreb", country: "Croatia", lat: 45.8150, lon: 15.9819, region: "Europe" },
  { name: "Split", country: "Croatia", lat: 43.5081, lon: 16.4402, region: "Europe" },
  { name: "Dubrovnik", country: "Croatia", lat: 42.6507, lon: 18.0944, region: "Europe" },
  { name: "Ljubljana", country: "Slovenia", lat: 46.0569, lon: 14.5058, region: "Europe" },
  { name: "Sarajevo", country: "Bosnia and Herzegovina", lat: 43.8563, lon: 18.4131, region: "Europe" },
  { name: "Tirana", country: "Albania", lat: 41.3275, lon: 19.8187, region: "Europe" },
  { name: "Skopje", country: "North Macedonia", lat: 41.9981, lon: 21.4254, region: "Europe" },
  { name: "Podgorica", country: "Montenegro", lat: 42.4304, lon: 19.2594, region: "Europe" },
  { name: "Pristina", country: "Kosovo", lat: 42.6629, lon: 21.1655, region: "Europe" },

  // Baltic & Micro-States
  { name: "Vilnius", country: "Lithuania", lat: 54.6872, lon: 25.2797, region: "Europe" },
  { name: "Riga", country: "Latvia", lat: 56.9496, lon: 24.1052, region: "Europe" },
  { name: "Tallinn", country: "Estonia", lat: 59.4370, lon: 24.7536, region: "Europe" },
  { name: "Minsk", country: "Belarus", lat: 53.9045, lon: 27.5615, region: "Europe" },
  { name: "Chișinău", country: "Moldova", lat: 47.0105, lon: 28.8638, region: "Europe" },
  { name: "Kyiv", country: "Ukraine", lat: 50.4501, lon: 30.5234, region: "Europe", pop: "2.9M" },
  { name: "Odesa", country: "Ukraine", lat: 46.4825, lon: 30.7233, region: "Europe" },
  { name: "Lviv", country: "Ukraine", lat: 49.8397, lon: 24.0297, region: "Europe" },
  { name: "Luxembourg City", country: "Luxembourg", lat: 49.6116, lon: 6.1319, region: "Europe" },
  { name: "Valletta", country: "Malta", lat: 35.8989, lon: 14.5146, region: "Europe" },
  { name: "Nicosia", country: "Cyprus", lat: 35.1856, lon: 33.3823, region: "Europe" },
  { name: "Andorra la Vella", country: "Andorra", lat: 42.5063, lon: 1.5218, region: "Europe" },
  { name: "Monaco", country: "Monaco", lat: 43.7384, lon: 7.4246, region: "Europe" },
  { name: "San Marino", country: "San Marino", lat: 43.9424, lon: 12.4578, region: "Europe" },
  { name: "Vaduz", country: "Liechtenstein", lat: 47.1410, lon: 9.5215, region: "Europe" },
  { name: "Vatican City", country: "Vatican City", lat: 41.9029, lon: 12.4534, region: "Europe" },

  // Russia (Continental trans-Eurasian coverage)
  { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173, region: "Europe", pop: "13.0M" },
  { name: "Saint Petersburg", country: "Russia", lat: 59.9343, lon: 30.3351, region: "Europe", pop: "5.4M" },
  { name: "Novosibirsk", country: "Russia", lat: 55.0084, lon: 82.9357, region: "Asia" },
  { name: "Yekaterinburg", country: "Russia", lat: 56.8389, lon: 60.6057, region: "Asia/Europe" },
  { name: "Kazan", country: "Russia", lat: 55.8304, lon: 49.0661, region: "Europe" },
  { name: "Nizhny Novgorod", country: "Russia", lat: 56.2965, lon: 43.9361, region: "Europe" },
  { name: "Vladivostok", country: "Russia", lat: 43.1155, lon: 131.8855, region: "Asia" },
  { name: "Irkutsk", country: "Russia", lat: 52.2870, lon: 104.3050, region: "Asia" },
  { name: "Sochi", country: "Russia", lat: 43.6028, lon: 39.7342, region: "Europe" },
  { name: "Murmansk", country: "Russia", lat: 68.9585, lon: 33.0827, region: "Europe" },

  // ============================================================================
  // ASIA & OCEANIA
  // ============================================================================
  // China
  { name: "Shanghai", country: "China", lat: 31.2304, lon: 121.4737, region: "Asia", pop: "26M" },
  { name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074, region: "Asia", pop: "21M" },
  { name: "Guangzhou", country: "China", lat: 23.1291, lon: 113.2644, region: "Asia", pop: "18M" },
  { name: "Shenzhen", country: "China", lat: 22.5431, lon: 114.0579, region: "Asia", pop: "17M" },
  { name: "Chengdu", country: "China", lat: 30.5728, lon: 104.0668, region: "Asia", pop: "16M" },
  { name: "Chongqing", country: "China", lat: 29.5630, lon: 106.5516, region: "Asia", pop: "32M" },
  { name: "Wuhan", country: "China", lat: 30.5928, lon: 114.3055, region: "Asia" },
  { name: "Xi'an", country: "China", lat: 34.3416, lon: 108.9398, region: "Asia" },
  { name: "Hangzhou", country: "China", lat: 30.2741, lon: 120.1551, region: "Asia" },
  { name: "Hong Kong", country: "China", lat: 22.3193, lon: 114.1694, region: "Asia", pop: "7.4M" },
  { name: "Macau", country: "China", lat: 22.1987, lon: 113.5439, region: "Asia" },
  { name: "Ürümqi", country: "China", lat: 43.8256, lon: 87.6168, region: "Asia" },
  { name: "Lhasa", country: "China (Tibet)", lat: 29.6500, lon: 91.1000, region: "Asia" },
  { name: "Harbin", country: "China", lat: 45.8038, lon: 126.5350, region: "Asia" },

  // India
  { name: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777, region: "Asia", pop: "20M" },
  { name: "Delhi", country: "India", lat: 28.6139, lon: 77.2090, region: "Asia", pop: "30M" },
  { name: "Bengaluru", country: "India", lat: 12.9716, lon: 77.5946, region: "Asia", pop: "13M" },
  { name: "Kolkata", country: "India", lat: 22.5726, lon: 88.3639, region: "Asia", pop: "14M" },
  { name: "Chennai", country: "India", lat: 13.0827, lon: 80.2707, region: "Asia", pop: "11M" },
  { name: "Hyderabad", country: "India", lat: 17.3850, lon: 78.4867, region: "Asia", pop: "10M" },
  { name: "Ahmedabad", country: "India", lat: 23.0225, lon: 72.5714, region: "Asia" },
  { name: "Jaipur", country: "India", lat: 26.9124, lon: 75.7873, region: "Asia" },
  { name: "Varanasi", country: "India", lat: 25.3176, lon: 82.9739, region: "Asia" },
  { name: "Kochi", country: "India", lat: 9.9312, lon: 76.2673, region: "Asia" },

  // Japan
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, region: "Asia", pop: "37M" },
  { name: "Osaka", country: "Japan", lat: 34.6937, lon: 135.5023, region: "Asia", pop: "19M" },
  { name: "Kyoto", country: "Japan", lat: 35.0116, lon: 135.7681, region: "Asia" },
  { name: "Sapporo", country: "Japan", lat: 43.0618, lon: 141.3545, region: "Asia" },
  { name: "Fukuoka", country: "Japan", lat: 33.5902, lon: 130.4017, region: "Asia" },
  { name: "Hiroshima", country: "Japan", lat: 34.3853, lon: 132.4553, region: "Asia" },
  { name: "Naha (Okinawa)", country: "Japan", lat: 26.2124, lon: 127.6809, region: "Asia" },

  // Southeast & East Asia
  { name: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.9780, region: "Asia", pop: "9.7M" },
  { name: "Busan", country: "South Korea", lat: 35.1796, lon: 129.0756, region: "Asia" },
  { name: "Pyongyang", country: "North Korea", lat: 39.0392, lon: 125.7625, region: "Asia" },
  { name: "Taipei", country: "Taiwan", lat: 25.0330, lon: 121.5654, region: "Asia" },
  { name: "Kaohsiung", country: "Taiwan", lat: 22.6273, lon: 120.3014, region: "Asia" },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456, region: "Asia", pop: "10.5M" },
  { name: "Surabaya", country: "Indonesia", lat: -7.2575, lon: 112.7521, region: "Asia" },
  { name: "Denpasar (Bali)", country: "Indonesia", lat: -8.6705, lon: 115.2126, region: "Asia" },
  { name: "Manila", country: "Philippines", lat: 14.5995, lon: 120.9842, region: "Asia", pop: "13M" },
  { name: "Cebu City", country: "Philippines", lat: 10.3157, lon: 123.8854, region: "Asia" },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018, region: "Asia", pop: "10M" },
  { name: "Chiang Mai", country: "Thailand", lat: 18.7883, lon: 98.9853, region: "Asia" },
  { name: "Phuket", country: "Thailand", lat: 7.8804, lon: 98.3923, region: "Asia" },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198, region: "Asia", pop: "5.7M" },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lon: 101.6869, region: "Asia" },
  { name: "George Town (Penang)", country: "Malaysia", lat: 5.4141, lon: 100.3288, region: "Asia" },
  { name: "Kota Kinabalu", country: "Malaysia", lat: 5.9804, lon: 116.0735, region: "Asia" },
  { name: "Hanoi", country: "Vietnam", lat: 21.0285, lon: 105.8542, region: "Asia" },
  { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lon: 106.6297, region: "Asia", pop: "9M" },
  { name: "Da Nang", country: "Vietnam", lat: 16.0544, lon: 108.2022, region: "Asia" },
  { name: "Yangon", country: "Myanmar", lat: 16.8661, lon: 96.1951, region: "Asia" },
  { name: "Mandalay", country: "Myanmar", lat: 21.9588, lon: 96.0891, region: "Asia" },
  { name: "Phnom Penh", country: "Cambodia", lat: 11.5564, lon: 104.9282, region: "Asia" },
  { name: "Siem Reap", country: "Cambodia", lat: 13.3671, lon: 103.8448, region: "Asia" },
  { name: "Vientiane", country: "Laos", lat: 17.9757, lon: 102.6331, region: "Asia" },
  { name: "Luang Prabang", country: "Laos", lat: 19.8893, lon: 102.1347, region: "Asia" },
  { name: "Bandar Seri Begawan", country: "Brunei", lat: 4.9031, lon: 114.9398, region: "Asia" },
  { name: "Dili", country: "Timor-Leste", lat: -8.5569, lon: 125.5603, region: "Asia" },

  // South & Central Asia
  { name: "Karachi", country: "Pakistan", lat: 24.8607, lon: 67.0011, region: "Asia", pop: "16M" },
  { name: "Lahore", country: "Pakistan", lat: 31.5204, lon: 74.3587, region: "Asia", pop: "11M" },
  { name: "Islamabad", country: "Pakistan", lat: 33.6844, lon: 73.0479, region: "Asia" },
  { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lon: 90.4125, region: "Asia", pop: "21M" },
  { name: "Chittagong", country: "Bangladesh", lat: 22.3569, lon: 91.7832, region: "Asia" },
  { name: "Colombo", country: "Sri Lanka", lat: 6.9271, lon: 79.8612, region: "Asia" },
  { name: "Kandy", country: "Sri Lanka", lat: 7.2906, lon: 80.6337, region: "Asia" },
  { name: "Kathmandu", country: "Nepal", lat: 27.7172, lon: 85.3240, region: "Asia" },
  { name: "Pokhara", country: "Nepal", lat: 28.2096, lon: 83.9856, region: "Asia" },
  { name: "Thimphu", country: "Bhutan", lat: 27.4728, lon: 89.6393, region: "Asia" },
  { name: "Male", country: "Maldives", lat: 4.1755, lon: 73.5093, region: "Asia" },
  { name: "Almaty", country: "Kazakhstan", lat: 43.2220, lon: 76.8512, region: "Asia" },
  { name: "Astana", country: "Kazakhstan", lat: 51.1694, lon: 71.4491, region: "Asia" },
  { name: "Tashkent", country: "Uzbekistan", lat: 41.2995, lon: 69.2401, region: "Asia" },
  { name: "Samarkand", country: "Uzbekistan", lat: 39.6542, lon: 66.9597, region: "Asia" },
  { name: "Ashgabat", country: "Turkmenistan", lat: 37.9601, lon: 58.3261, region: "Asia" },
  { name: "Bishkek", country: "Kyrgyzstan", lat: 42.8746, lon: 74.5698, region: "Asia" },
  { name: "Dushanbe", country: "Tajikistan", lat: 38.5598, lon: 68.7870, region: "Asia" },
  { name: "Kabul", country: "Afghanistan", lat: 34.5553, lon: 69.2075, region: "Asia" },
  { name: "Ulaanbaatar", country: "Mongolia", lat: 47.8864, lon: 106.9057, region: "Asia" },

  // Middle East & Caucasus
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784, region: "Europe/Asia", pop: "15.5M" },
  { name: "Ankara", country: "Turkey", lat: 39.9334, lon: 32.8597, region: "Middle East" },
  { name: "Izmir", country: "Turkey", lat: 38.4237, lon: 27.1428, region: "Middle East" },
  { name: "Antalya", country: "Turkey", lat: 36.8969, lon: 30.7133, region: "Middle East" },
  { name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708, region: "Middle East", pop: "3.5M" },
  { name: "Abu Dhabi", country: "United Arab Emirates", lat: 24.4539, lon: 54.3773, region: "Middle East" },
  { name: "Doha", country: "Qatar", lat: 25.2854, lon: 51.5310, region: "Middle East" },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lon: 46.6753, region: "Middle East", pop: "7.6M" },
  { name: "Jeddah", country: "Saudi Arabia", lat: 21.4858, lon: 39.1925, region: "Middle East" },
  { name: "Mecca", country: "Saudi Arabia", lat: 21.3891, lon: 39.8579, region: "Middle East" },
  { name: "Tel Aviv", country: "Israel", lat: 32.0853, lon: 34.7818, region: "Middle East" },
  { name: "Jerusalem", country: "Israel / Palestine", lat: 31.7683, lon: 35.2137, region: "Middle East" },
  { name: "Tehran", country: "Iran", lat: 35.6892, lon: 51.3890, region: "Middle East", pop: "9M" },
  { name: "Isfahan", country: "Iran", lat: 32.6546, lon: 51.6680, region: "Middle East" },
  { name: "Baghdad", country: "Iraq", lat: 33.3152, lon: 44.3661, region: "Middle East", pop: "7.5M" },
  { name: "Erbil", country: "Iraq (Kurdistan)", lat: 36.1901, lon: 43.9930, region: "Middle East" },
  { name: "Amman", country: "Jordan", lat: 31.9454, lon: 35.9284, region: "Middle East" },
  { name: "Beirut", country: "Lebanon", lat: 33.8938, lon: 35.5018, region: "Middle East" },
  { name: "Damascus", country: "Syria", lat: 33.5138, lon: 36.2765, region: "Middle East" },
  { name: "Muscat", country: "Oman", lat: 23.5880, lon: 58.3829, region: "Middle East" },
  { name: "Kuwait City", country: "Kuwait", lat: 29.3759, lon: 47.9774, region: "Middle East" },
  { name: "Manama", country: "Bahrain", lat: 26.2285, lon: 50.5860, region: "Middle East" },
  { name: "Sana'a", country: "Yemen", lat: 15.3694, lon: 44.1910, region: "Middle East" },
  { name: "Aden", country: "Yemen", lat: 12.7855, lon: 45.0187, region: "Middle East" },
  { name: "Tbilisi", country: "Georgia", lat: 41.7151, lon: 44.8271, region: "Caucasus" },
  { name: "Yerevan", country: "Armenia", lat: 40.1792, lon: 44.4991, region: "Caucasus" },
  { name: "Baku", country: "Azerbaijan", lat: 40.4093, lon: 49.8671, region: "Caucasus" },

  // ============================================================================
  // AFRICA
  // ============================================================================
  // North Africa
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357, region: "Africa", pop: "20M" },
  { name: "Alexandria", country: "Egypt", lat: 31.2001, lon: 29.9187, region: "Africa" },
  { name: "Casablanca", country: "Morocco", lat: 33.5731, lon: -7.5898, region: "Africa", pop: "3.7M" },
  { name: "Marrakech", country: "Morocco", lat: 31.6295, lon: -7.9811, region: "Africa" },
  { name: "Rabat", country: "Morocco", lat: 34.0209, lon: -6.8416, region: "Africa" },
  { name: "Algiers", country: "Algeria", lat: 36.7538, lon: 3.0588, region: "Africa", pop: "3.5M" },
  { name: "Oran", country: "Algeria", lat: 35.6987, lon: -0.6349, region: "Africa" },
  { name: "Tunis", country: "Tunisia", lat: 36.8065, lon: 10.1815, region: "Africa" },
  { name: "Tripoli", country: "Libya", lat: 32.8872, lon: 13.1913, region: "Africa" },
  { name: "Khartoum", country: "Sudan", lat: 15.5007, lon: 32.5599, region: "Africa" },

  // Sub-Saharan West & Central Africa
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792, region: "Africa", pop: "15M" },
  { name: "Abuja", country: "Nigeria", lat: 9.0765, lon: 7.3986, region: "Africa" },
  { name: "Kano", country: "Nigeria", lat: 12.0022, lon: 8.5920, region: "Africa" },
  { name: "Accra", country: "Ghana", lat: 5.6037, lon: -0.1870, region: "Africa" },
  { name: "Kumasi", country: "Ghana", lat: 6.6885, lon: -1.6244, region: "Africa" },
  { name: "Dakar", country: "Senegal", lat: 14.7167, lon: -17.4677, region: "Africa" },
  { name: "Abidjan", country: "Ivory Coast", lat: 5.3600, lon: -4.0083, region: "Africa" },
  { name: "Douala", country: "Cameroon", lat: 4.0511, lon: 9.7679, region: "Africa" },
  { name: "Yaoundé", country: "Cameroon", lat: 3.8480, lon: 11.5021, region: "Africa" },
  { name: "Kinshasa", country: "DR Congo", lat: -4.4419, lon: 15.2663, region: "Africa", pop: "17M" },
  { name: "Lubumbashi", country: "DR Congo", lat: -11.6876, lon: 27.5026, region: "Africa" },
  { name: "Brazzaville", country: "Republic of the Congo", lat: -4.2634, lon: 15.2429, region: "Africa" },
  { name: "Luanda", country: "Angola", lat: -8.8390, lon: 13.2894, region: "Africa" },
  { name: "Bamako", country: "Mali", lat: 12.6392, lon: -8.0029, region: "Africa" },
  { name: "Ouagadougou", country: "Burkina Faso", lat: 12.3714, lon: -1.5197, region: "Africa" },
  { name: "Niamey", country: "Niger", lat: 13.5116, lon: 2.1254, region: "Africa" },
  { name: "N'Djamena", country: "Chad", lat: 12.1348, lon: 15.0557, region: "Africa" },
  { name: "Conakry", country: "Guinea", lat: 9.6412, lon: -13.5784, region: "Africa" },
  { name: "Freetown", country: "Sierra Leone", lat: 8.4840, lon: -13.2299, region: "Africa" },
  { name: "Monrovia", country: "Liberia", lat: 6.3156, lon: -10.8074, region: "Africa" },
  { name: "Lomé", country: "Togo", lat: 6.1375, lon: 1.2123, region: "Africa" },
  { name: "Porto-Novo", country: "Benin", lat: 6.4969, lon: 2.6289, region: "Africa" },
  { name: "Cotonou", country: "Benin", lat: 6.3703, lon: 2.4183, region: "Africa" },
  { name: "Nouakchott", country: "Mauritania", lat: 18.0735, lon: -15.9582, region: "Africa" },
  { name: "Banjul", country: "The Gambia", lat: 13.4549, lon: -16.5790, region: "Africa" },
  { name: "Bissau", country: "Guinea-Bissau", lat: 11.8632, lon: -15.5984, region: "Africa" },
  { name: "Malabo", country: "Equatorial Guinea", lat: 3.7504, lon: 8.7844, region: "Africa" },
  { name: "Bangui", country: "Central African Republic", lat: 4.3947, lon: 18.5582, region: "Africa" },
  { name: "Libreville", country: "Gabon", lat: 0.4162, lon: 9.4673, region: "Africa" },
  { name: "São Tomé", country: "São Tomé and Príncipe", lat: 0.3365, lon: 6.7273, region: "Africa" },

  // East & Southern Africa
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219, region: "Africa", pop: "4.4M" },
  { name: "Mombasa", country: "Kenya", lat: -4.0435, lon: 39.6682, region: "Africa" },
  { name: "Addis Ababa", country: "Ethiopia", lat: 9.0300, lon: 38.7400, region: "Africa", pop: "5.2M" },
  { name: "Dar es Salaam", country: "Tanzania", lat: -6.7924, lon: 39.2083, region: "Africa", pop: "6M" },
  { name: "Zanzibar City", country: "Tanzania", lat: -6.1659, lon: 39.2026, region: "Africa" },
  { name: "Kampala", country: "Uganda", lat: 0.3476, lon: 32.5825, region: "Africa" },
  { name: "Kigali", country: "Rwanda", lat: -1.9441, lon: 30.0619, region: "Africa" },
  { name: "Bujumbura", country: "Burundi", lat: -3.3822, lon: 29.3644, region: "Africa" },
  { name: "Juba", country: "South Sudan", lat: 4.8594, lon: 31.5713, region: "Africa" },
  { name: "Mogadishu", country: "Somalia", lat: 2.0469, lon: 45.3182, region: "Africa" },
  { name: "Asmara", country: "Eritrea", lat: 15.3229, lon: 38.9251, region: "Africa" },
  { name: "Djibouti", country: "Djibouti", lat: 11.8251, lon: 42.5903, region: "Africa" },
  { name: "Johannesburg", country: "South Africa", lat: -26.2041, lon: 28.0473, region: "Africa", pop: "5.6M" },
  { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241, region: "Africa", pop: "4.6M" },
  { name: "Durban", country: "South Africa", lat: -29.8587, lon: 31.0218, region: "Africa" },
  { name: "Pretoria", country: "South Africa", lat: -25.7479, lon: 28.2293, region: "Africa" },
  { name: "Windhoek", country: "Namibia", lat: -22.5609, lon: 17.0658, region: "Africa" },
  { name: "Gaborone", country: "Botswana", lat: -24.6282, lon: 25.9231, region: "Africa" },
  { name: "Harare", country: "Zimbabwe", lat: -17.8252, lon: 31.0335, region: "Africa" },
  { name: "Lusaka", country: "Zambia", lat: -15.3875, lon: 28.3228, region: "Africa" },
  { name: "Maputo", country: "Mozambique", lat: -25.9692, lon: 32.5732, region: "Africa" },
  { name: "Lilongwe", country: "Malawi", lat: -13.9626, lon: 33.7741, region: "Africa" },
  { name: "Antananarivo", country: "Madagascar", lat: -18.8792, lon: 47.5079, region: "Africa" },
  { name: "Port Louis", country: "Mauritius", lat: -20.1609, lon: 57.5012, region: "Indian Ocean" },
  { name: "Victoria", country: "Seychelles", lat: -4.6191, lon: 55.4513, region: "Indian Ocean" },
  { name: "Moroni", country: "Comoros", lat: -11.7172, lon: 43.2473, region: "Indian Ocean" },
  { name: "Praia", country: "Cape Verde", lat: 14.9330, lon: -23.5133, region: "Atlantic" },
  { name: "Maseru", country: "Lesotho", lat: -29.3151, lon: 27.4869, region: "Africa" },
  { name: "Mbabane", country: "Eswatini", lat: -26.3055, lon: 31.1367, region: "Africa" },

  // ============================================================================
  // OCEANIA & AUSTRALASIA
  // ============================================================================
  // Australia
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, region: "Oceania", pop: "5.3M" },
  { name: "Melbourne", country: "Australia", lat: -37.8136, lon: 144.9631, region: "Oceania", pop: "5.0M" },
  { name: "Brisbane", country: "Australia", lat: -27.4698, lon: 153.0251, region: "Oceania" },
  { name: "Perth", country: "Australia", lat: -31.9505, lon: 115.8605, region: "Oceania" },
  { name: "Adelaide", country: "Australia", lat: -34.9285, lon: 138.6007, region: "Oceania" },
  { name: "Canberra", country: "Australia", lat: -35.2809, lon: 149.1300, region: "Oceania" },
  { name: "Darwin", country: "Australia", lat: -12.4634, lon: 130.8456, region: "Oceania" },
  { name: "Hobart", country: "Australia (Tasmania)", lat: -42.8821, lon: 147.3272, region: "Oceania" },
  { name: "Alice Springs", country: "Australia (Red Centre)", lat: -23.6980, lon: 133.8807, region: "Oceania" },
  { name: "Cairns", country: "Australia", lat: -16.9186, lon: 145.7781, region: "Oceania" },

  // New Zealand
  { name: "Auckland", country: "New Zealand", lat: -36.8485, lon: 174.7633, region: "Oceania", pop: "1.6M" },
  { name: "Wellington", country: "New Zealand", lat: -41.2865, lon: 174.7762, region: "Oceania" },
  { name: "Christchurch", country: "New Zealand", lat: -43.5321, lon: 172.6362, region: "Oceania" },
  { name: "Queenstown", country: "New Zealand", lat: -45.0312, lon: 168.6626, region: "Oceania" },

  // Pacific Island Nations
  { name: "Port Moresby", country: "Papua New Guinea", lat: -9.4438, lon: 147.1803, region: "Oceania" },
  { name: "Suva", country: "Fiji", lat: -18.1416, lon: 178.4419, region: "Oceania" },
  { name: "Nadi", country: "Fiji", lat: -17.8000, lon: 177.4167, region: "Oceania" },
  { name: "Honiara", country: "Solomon Islands", lat: -9.4456, lon: 159.9729, region: "Oceania" },
  { name: "Port Vila", country: "Vanuatu", lat: -17.7333, lon: 168.3273, region: "Oceania" },
  { name: "Apia", country: "Samoa", lat: -13.8333, lon: -171.7667, region: "Oceania" },
  { name: "Pago Pago", country: "American Samoa", lat: -14.2756, lon: -170.7020, region: "Oceania" },
  { name: "Nuku'alofa", country: "Tonga", lat: -21.1393, lon: -175.2018, region: "Oceania" },
  { name: "South Tarawa", country: "Kiribati", lat: 1.3278, lon: 172.9770, region: "Oceania" },
  { name: "Majuro", country: "Marshall Islands", lat: 7.1164, lon: 171.1858, region: "Oceania" },
  { name: "Palikir", country: "Micronesia", lat: 6.9248, lon: 158.1611, region: "Oceania" },
  { name: "Koror", country: "Palau", lat: 7.3419, lon: 134.4789, region: "Oceania" },
  { name: "Funafuti", country: "Tuvalu", lat: -8.5211, lon: 179.1962, region: "Oceania" },
  { name: "Yaren", country: "Nauru", lat: -0.5477, lon: 166.9209, region: "Oceania" },
  { name: "Papeete (Tahiti)", country: "French Polynesia", lat: -17.5516, lon: -149.5584, region: "Oceania" },
  { name: "Nouméa", country: "New Caledonia", lat: -22.2711, lon: 166.4416, region: "Oceania" },

  // ============================================================================
  // REMOTE ISLANDS, POLAR REGIONS & GEOGRAPHIC EXTREMITIES
  // ============================================================================
  { name: "Point Nemo (Oceanic Inaccessibility)", country: "South Pacific", lat: -48.8767, lon: -123.3933, region: "Ocean" },
  { name: "Easter Island (Rapa Nui)", country: "Chile", lat: -27.1127, lon: -109.3497, region: "Oceania" },
  { name: "Tristan da Cunha", country: "UK Overseas Territory", lat: -37.1052, lon: -12.2777, region: "Atlantic" },
  { name: "Ascension Island", country: "UK Overseas Territory", lat: -7.9467, lon: -14.3559, region: "Atlantic" },
  { name: "Saint Helena", country: "UK Overseas Territory", lat: -15.9650, lon: -5.7089, region: "Atlantic" },
  { name: "Kerguelen Islands", country: "French Southern Lands", lat: -49.3500, lon: 70.2167, region: "Indian Ocean" },
  { name: "South Georgia", country: "UK Overseas Territory", lat: -54.4296, lon: -36.5879, region: "Southern Ocean" },
  { name: "Stanley", country: "Falkland Islands", lat: -51.6977, lon: -57.8517, region: "South Atlantic" },
  { name: "Svalbard (Longyearbyen)", country: "Norway", lat: 78.2232, lon: 15.6267, region: "Arctic" },
  { name: "Nuuk", country: "Greenland", lat: 64.1814, lon: -51.6941, region: "Arctic" },
  { name: "Ilulissat", country: "Greenland", lat: 69.2167, lon: -51.1000, region: "Arctic" },
  { name: "Azores (Ponta Delgada)", country: "Portugal", lat: 37.7412, lon: -25.6756, region: "Atlantic" },
  { name: "Canary Islands (Tenerife)", country: "Spain", lat: 28.2916, lon: -16.6291, region: "Atlantic" },
  { name: "Bermuda", country: "UK Overseas Territory", lat: 32.3078, lon: -64.7505, region: "Atlantic" },
  { name: "Galapagos Islands (Puerto Ayora)", country: "Ecuador", lat: -0.7436, lon: -90.3142, region: "Pacific" },
  { name: "Chatham Islands", country: "New Zealand", lat: -43.9535, lon: -176.5597, region: "Oceania" },
  { name: "Pitcairn Island (Adamstown)", country: "UK Overseas Territory", lat: -25.0667, lon: -130.1002, region: "Pacific" },
  { name: "South Pole (Amundsen-Scott)", country: "Antarctica", lat: -90.0, lon: 0.0, region: "Antarctica" },
  { name: "McMurdo Station", country: "Antarctica", lat: -77.8460, lon: 166.6681, region: "Antarctica" },
  { name: "Vostok Station", country: "Antarctica", lat: -78.4644, lon: 106.8373, region: "Antarctica" },
  { name: "North Pole", country: "Arctic Ocean", lat: 90.0, lon: 0.0, region: "Arctic" }
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
  { name: "Norwegian Sea", lat: 67.0, lon: 2.0 },
  { name: "Sargasso Sea", lat: 28.0, lon: -66.0 },
  { name: "Tasman Sea", lat: -38.0, lon: 160.0 },
  { name: "Weddell Sea", lat: -73.0, lon: -45.0 },
  { name: "Ross Sea", lat: -75.0, lon: 175.0 }
];

import { haversineDistance } from '../math.js';
import { CURATED_PLACES, getPoiTypeInfo, getAllPointsOfInterest, REEFS, MOUNTAINS, RIVERS, LAKES, NATURAL_WONDERS, NATIONAL_PARKS } from './places.js';

export { findNearestPlace, getPoiTypeInfo, getAllPointsOfInterest, CURATED_PLACES, REEFS, MOUNTAINS, RIVERS, LAKES, NATURAL_WONDERS, NATIONAL_PARKS } from './places.js';

/**
 * Filter cities and points of interest matching a search query string
 */
export function searchCities(query, limit = 10) {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  
  const pool = [...MAJOR_CITIES];
  for (const p of CURATED_PLACES) {
    if (!pool.some(item => item.name.toLowerCase() === p.name.toLowerCase())) {
      pool.push(p);
    }
  }

  const matches = pool.filter(place => {
    return place.name.toLowerCase().includes(q) ||
           (place.country && place.country.toLowerCase().includes(q)) ||
           (place.region && place.region.toLowerCase().includes(q)) ||
           (place.type && place.type.toLowerCase().includes(q));
  });

  return matches.slice(0, limit);
}
