export interface LocationData {
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

const GEOLOCATION_API = 'https://ipapi.co/json/';

export async function getLocationFromIp(ip: string): Promise<LocationData> {
  // Skip private IPs
  if (isPrivateIp(ip)) {
    return {};
  }

  try {
    const response = await fetch(`${GEOLOCATION_API}?ip=${ip}`, {
      headers: { 'User-Agent': 'Zolai-Auth' },
    });

    if (!response.ok) return {};

    const data = await response.json();
    return {
      country: data.country_name,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch {
    return {};
  }
}

function isPrivateIp(ip: string): boolean {
  const privateRanges = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^::1$/,
    /^fc00:/i,
    /^fe80:/i,
  ];
  return privateRanges.some(range => range.test(ip));
}
