// Google Encoded Polyline, precision 5. Points are [lat, lng].

function encodeValue(v) {
  v = v < 0 ? ~(v << 1) : v << 1;
  let out = '';
  while (v >= 0x20) {
    out += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
    v >>= 5;
  }
  return out + String.fromCharCode(v + 63);
}

export function encodePolyline(points) {
  let pLat = 0, pLng = 0, out = '';
  for (const [lat, lng] of points) {
    const iLat = Math.round(lat * 1e5), iLng = Math.round(lng * 1e5);
    out += encodeValue(iLat - pLat) + encodeValue(iLng - pLng);
    pLat = iLat; pLng = iLng;
  }
  return out;
}

export function decodePolyline(str) {
  const pts = [];
  let i = 0, lat = 0, lng = 0;
  const next = () => {
    let shift = 0, result = 0, b;
    do {
      b = str.charCodeAt(i++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };
  while (i < str.length) {
    lat += next(); lng += next();
    pts.push([lat / 1e5, lng / 1e5]);
  }
  return pts;
}
