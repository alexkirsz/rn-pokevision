export function getData(swLat, swLng, neLat, neLng) {
  return fetch(`https://api.goradar.io/raw_data?&swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}`)
    .then(res => res.json());
}
