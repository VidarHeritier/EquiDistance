async function test() {
  const headers = { 'User-Agent': 'EquiDistance-Explorer/1.0 (contact: github.com)' };
  
  // Test 1: Overpass with User-Agent
  try {
    const q = '[out:json][timeout:8];node["place"~"city|town"](48.5,2.0,49.2,2.8);out 25;';
    const res = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q), { headers });
    const text = await res.text();
    if (text.startsWith('{')) {
      const data = JSON.parse(text);
      console.log('Overpass success with User-Agent! Elements:', data.elements.length);
      console.log(data.elements.slice(0, 5).map(e => e.tags.name));
      return;
    } else {
      console.log('Overpass returned non-JSON:', text.slice(0, 100));
    }
  } catch (err) {
    console.log('Overpass failed:', err.message);
  }

  // Test 2: Nominatim bounding box query
  try {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&viewbox=2.0,49.2,2.8,48.5&bounded=1&featuretype=city&limit=25';
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log('Nominatim success! Items:', data.length);
    console.log(data.slice(0, 5).map(i => i.display_name));
  } catch (err) {
    console.log('Nominatim failed:', err.message);
  }
}
test();
