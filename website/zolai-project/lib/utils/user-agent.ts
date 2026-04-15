export interface ParsedUserAgent {
  deviceName?: string;
  deviceType?: string;
  osName?: string;
  osVersion?: string;
  browserName?: string;
  browserVersion?: string;
}

export function parseUserAgent(ua: string): ParsedUserAgent {
  if (!ua) return {};

  const result: ParsedUserAgent = {};

  // Device type
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    result.deviceType = 'mobile';
  } else if (/ipad|tablet|playbook|silk/i.test(ua)) {
    result.deviceType = 'tablet';
  } else {
    result.deviceType = 'desktop';
  }

  // OS
  if (/windows/i.test(ua)) {
    result.osName = 'Windows';
    const match = ua.match(/windows nt ([\d.]+)/i);
    if (match) result.osVersion = match[1];
  } else if (/macintosh|mac os/i.test(ua)) {
    result.osName = 'macOS';
    const match = ua.match(/mac os x ([\d_]+)/i);
    if (match) result.osVersion = match[1].replace(/_/g, '.');
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    result.osName = 'iOS';
    const match = ua.match(/os ([\d_]+)/i);
    if (match) result.osVersion = match[1].replace(/_/g, '.');
  } else if (/android/i.test(ua)) {
    result.osName = 'Android';
    const match = ua.match(/android ([\d.]+)/i);
    if (match) result.osVersion = match[1];
  } else if (/linux/i.test(ua)) {
    result.osName = 'Linux';
  }

  // Browser
  if (/edg/i.test(ua)) {
    result.browserName = 'Edge';
    const match = ua.match(/edg[e]?\/([\d.]+)/i);
    if (match) result.browserVersion = match[1];
  } else if (/chrome/i.test(ua) && !/chromium/i.test(ua)) {
    result.browserName = 'Chrome';
    const match = ua.match(/chrome\/([\d.]+)/i);
    if (match) result.browserVersion = match[1];
  } else if (/safari/i.test(ua)) {
    result.browserName = 'Safari';
    const match = ua.match(/version\/([\d.]+)/i);
    if (match) result.browserVersion = match[1];
  } else if (/firefox/i.test(ua)) {
    result.browserName = 'Firefox';
    const match = ua.match(/firefox\/([\d.]+)/i);
    if (match) result.browserVersion = match[1];
  }

  // Device name
  if (result.browserName && result.osName) {
    result.deviceName = `${result.browserName} on ${result.osName}`;
  }

  return result;
}
