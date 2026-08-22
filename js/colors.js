(function (global) {
  'use strict';

  const CB = global.CodesBared = global.CodesBared || {};
  const TARGET = 7.0;

  function hexToRgb(hex) {
    const h = String(hex || '').replace('#', '');
    const full = h.length === 3 ? h.split('').map(function (c) { return c + c; }).join('') : h;
    const num = parseInt(full, 16);
    if (Number.isNaN(num)) return { r: 0, g: 0, b: 0 };
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (v) {
      return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    }).join('');
  }

  function relLuminance(rgb) {
    const chan = function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * chan(rgb.r) + 0.7152 * chan(rgb.g) + 0.0722 * chan(rgb.b);
  }

  function contrastRatio(hex1, hex2) {
    const L1 = relLuminance(hexToRgb(hex1));
    const L2 = relLuminance(hexToRgb(hex2));
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function rgbToHsl(rgb) {
    let r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return { h: h * 360, s: s, l: l };
  }

  function hslToRgb(hsl) {
    const h = hsl.h / 360, s = hsl.s, l = hsl.l;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = function (p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: r * 255, g: g * 255, b: b * 255 };
  }

  function normalizeHex(value) {
    let v = String(value || '').trim();
    if (!/^#?[0-9a-fA-F]{6}$/.test(v)) return null;
    if (v.charAt(0) !== '#') v = '#' + v;
    return v.toLowerCase();
  }

  function hexForBwip(hex) {
    return String(hex || '').replace('#', '').toLowerCase();
  }

  function contrastLabel(ratio) {
    if (ratio >= TARGET) return { label: 'solid', level: 'ok' };
    if (ratio >= 4.0) return { label: 'risky', level: 'risky' };
    return { label: "won't scan", level: 'poor' };
  }

  function boostContrast(darkHex, lightHex) {
    let dark = darkHex;
    let light = lightHex;
    let dHsl = rgbToHsl(hexToRgb(dark));
    let lHsl = rgbToHsl(hexToRgb(light));
    if (dHsl.l > lHsl.l) {
      const tmpHsl = dHsl; dHsl = lHsl; lHsl = tmpHsl;
      const tmpHex = dark; dark = light; light = tmpHex;
    }
    let guard = 0;
    while (contrastRatio(dark, light) < TARGET && guard < 60) {
      dHsl.l = Math.max(0, dHsl.l - 0.02);
      lHsl.l = Math.min(1, lHsl.l + 0.02);
      const dRgb = hslToRgb(dHsl);
      const lRgb = hslToRgb(lHsl);
      dark = rgbToHex(dRgb.r, dRgb.g, dRgb.b);
      light = rgbToHex(lRgb.r, lRgb.g, lRgb.b);
      guard += 1;
    }
    return { dark: dark, light: light };
  }

  CB.colors = {
    TARGET: TARGET,
    hexToRgb: hexToRgb,
    rgbToHex: rgbToHex,
    contrastRatio: contrastRatio,
    contrastLabel: contrastLabel,
    normalizeHex: normalizeHex,
    hexForBwip: hexForBwip,
    boostContrast: boostContrast
  };
})(typeof window !== 'undefined' ? window : globalThis);
