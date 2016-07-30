export function getData(lat, lng) {
  return fetch(`https://pokevision.com/map/data/${lat}/${lng}`)
    .then(res => res.json());
}

export function getScanData(lat, lng, scan) {
  return fetch(`https://pokevision.com/map/data/${lat}/${lng}/${scan}`)
    .then(res => res.json());
}

export function runScan(lat, lng) {
  return fetch(`https://pokevision.com/map/scan/${lat}/${lng}`)
    .then(res => res.json());
}
