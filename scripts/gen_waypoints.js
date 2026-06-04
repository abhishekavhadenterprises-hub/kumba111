const fs = require('fs');

const waypoints = [
  { name: 'Adgaon', lat: 20.0390629757868, lng: 73.8684010128436 },
  { name: 'Raigadnagar', lat: 19.89105977371951, lng: 73.69509494349445 },
  { name: 'Dahegaon', lat: 19.890739, lng: 73.647997 },
  { name: 'Mulegaon', lat: 19.907721, lng: 73.598154 },
  { name: 'Anjaneri', lat: 19.954490366899034, lng: 73.59180291615209 },
  { name: 'Rajur Bahula', lat: 19.923736611113252, lng: 73.71613633277481 },
  { name: 'Vilholi', lat: 19.923626935279323, lng: 73.7160281310641 },
  { name: 'Beze Phata', lat: 19.95571973602999, lng: 73.60088382149848 },
  { name: 'Beze Dam', lat: 19.98708705208258, lng: 73.56871682037652 },
  { name: 'Talwade', lat: 19.97334412716518, lng: 73.55531761561014 },
  { name: 'Pimlad', lat: 19.96500051566045, lng: 73.527715396395 },
  { name: 'Ganeshbari', lat: 19.95565524861094, lng: 73.52128243048904 },
  { name: 'Bilvatirth', lat: 19.94232203621321, lng: 73.52561642963217 },
  { name: 'Kushavart', lat: 19.933154375361926, lng: 73.52799203605461 },
  { name: 'Nashik', lat: 19.995201155427992, lng: 73.78627004715105 },
  { name: 'Pimpalgaon Bahula', lat: 19.979574337968092, lng: 73.70900129203818 },
  { name: 'Khambale', lat: 19.873821839374262, lng: 73.77839116815535 },
  { name: 'Trimbak', lat: 19.935397282031754, lng: 73.53530375639161 },
  { name: 'Yeola', lat: 20.043814019841363, lng: 74.48347621094261 },
  { name: 'Vinchur', lat: 20.10496713910294, lng: 74.23513223482082 },
  { name: 'Sinnar', lat: 19.849499301143407, lng: 73.98850372750971 },
  { name: 'Riagadnagar', lat: 19.89134390998255, lng: 73.69395417814292 },
  { name: 'Talegaon Anjneri', lat: 19.949188695935888, lng: 73.64520401617153 },
  { name: 'Malegaon', lat: 20.55941501533559, lng: 74.51456892058367 },
  { name: 'Chandvad', lat: 20.325687431560816, lng: 74.24934962917008 },
  { name: 'Pimpalgaon Baswant', lat: 20.14320763041248, lng: 73.96666922038378 },
  { name: 'Dindori', lat: 20.2005, lng: 73.8317 },
  { name: 'Pimplad Nashik', lat: 19.916111217883362, lng: 73.66532383008703 }
];

const geojson = {
  type: 'FeatureCollection',
  features: waypoints.map(wp => ({
    type: 'Feature',
    properties: { name: wp.name },
    geometry: { type: 'Point', coordinates: [wp.lng, wp.lat] }
  }))
};

fs.writeFileSync('public/data/route-waypoints.geojson', JSON.stringify(geojson, null, 2));
console.log('Waypoints generated');
