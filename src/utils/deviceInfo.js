/**
 * Parses userAgent, touch points, and screen dimensions to identify the student's
 * device type, operating system, and browser without external dependencies.
 * Accepts optional overrides for unit testing.
 */
export function getDeviceInfo(overrides = null) {
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const win = typeof window !== 'undefined' ? window : {};

  const ua = overrides?.userAgent ?? nav.userAgent ?? '';
  const maxTouch = overrides?.maxTouchPoints ?? nav.maxTouchPoints ?? 0;
  const innerWidth = overrides?.innerWidth ?? win.innerWidth ?? 1024;
  const screenW = overrides?.screenWidth ?? win.screen?.width ?? innerWidth;
  const screenH = overrides?.screenHeight ?? win.screen?.height ?? (win.innerHeight ?? 768);

  // OS detection
  let os = 'Other';
  if (/iPhone|iPod/i.test(ua)) os = 'iOS';
  else if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && maxTouch > 1)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/CrOS/i.test(ua)) os = 'ChromeOS';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // Device type detection
  let deviceType = 'Desktop';
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) || (/Macintosh/i.test(ua) && maxTouch > 1)) {
    deviceType = 'Tablet';
  } else if (/Mobi|iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) || (maxTouch > 1 && innerWidth <= 680)) {
    deviceType = 'Mobile';
  }

  // Browser detection (order matters because Chrome/Edge/Samsung include Safari/Chrome tokens)
  let browser = 'Other';
  const matchVer = (re) => {
    const m = ua.match(re);
    return m?.[1] ? m[1].split('.')[0] : '';
  };

  if (/EdgA?|EdgiOS/i.test(ua)) {
    const v = matchVer(/Edg(?:A|iOS)?\/(\d+)/i);
    browser = v ? `Edge ${v}` : 'Edge';
  } else if (/SamsungBrowser/i.test(ua)) {
    const v = matchVer(/SamsungBrowser\/(\d+)/i);
    browser = v ? `Samsung Internet ${v}` : 'Samsung Internet';
  } else if (/OPR|Opera/i.test(ua)) {
    const v = matchVer(/(?:OPR|Opera)\/(\d+)/i);
    browser = v ? `Opera ${v}` : 'Opera';
  } else if (/FxiOS|Firefox/i.test(ua)) {
    const v = matchVer(/(?:FxiOS|Firefox)\/(\d+)/i);
    browser = v ? `Firefox ${v}` : 'Firefox';
  } else if (/CriOS/i.test(ua)) {
    const v = matchVer(/CriOS\/(\d+)/i);
    browser = v ? `Chrome ${v}` : 'Chrome';
  } else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) {
    const v = matchVer(/Chrome\/(\d+)/i);
    browser = v ? `Chrome ${v}` : 'Chrome';
  } else if (/Safari/i.test(ua) && !/Chrome|CriOS|Chromium/i.test(ua)) {
    const v = matchVer(/Version\/(\d+)/i);
    browser = v ? `Safari ${v}` : 'Safari';
  }

  const screen = `${screenW}x${screenH}`;
  return {
    deviceType,
    os,
    browser,
    screen,
    label: `${deviceType} · ${os} · ${browser}`,
    userAgent: ua.slice(0, 180),
  };
}
