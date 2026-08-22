(function (global) {
  'use strict';

  const CB = global.CodesBared = global.CodesBared || {};

  function roundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('logo failed to load')); };
      img.src = src;
    });
  }

  function placement(width, height, pct) {
    const min = Math.min(width, height);
    const box = min * (pct / 100);
    const pad = box * 0.14;
    return {
      box: box,
      pad: pad,
      x: (width - box) / 2,
      y: (height - box) / 2
    };
  }

  function drawOnCanvas(ctx, width, height, logoDataUrl, pct, lightColor) {
    const pos = placement(width, height, pct);
    return loadImage(logoDataUrl).then(function (img) {
      ctx.fillStyle = lightColor;
      roundedRect(ctx, pos.x - pos.pad, pos.y - pos.pad, pos.box + pos.pad * 2, pos.box + pos.pad * 2, 8);
      ctx.fill();
      ctx.drawImage(img, pos.x, pos.y, pos.box, pos.box);
    });
  }

  function injectInSvg(svgString, logoDataUrl, pct, lightColor) {
    const match = /viewBox="0 0 ([0-9.]+) ([0-9.]+)"/.exec(svgString);
    const width = match ? parseFloat(match[1]) : 256;
    const height = match ? parseFloat(match[2]) : 256;
    const pos = placement(width, height, pct);
    const extra =
      '<rect x="' + (pos.x - pos.pad).toFixed(2) + '" y="' + (pos.y - pos.pad).toFixed(2) +
      '" width="' + (pos.box + pos.pad * 2).toFixed(2) + '" height="' + (pos.box + pos.pad * 2).toFixed(2) +
      '" rx="8" fill="' + lightColor + '"/>' +
      '<image x="' + pos.x.toFixed(2) + '" y="' + pos.y.toFixed(2) +
      '" width="' + pos.box.toFixed(2) + '" height="' + pos.box.toFixed(2) +
      '" href="' + logoDataUrl + '"/>';
    if (svgString.indexOf('</svg>') === -1) return svgString + extra;
    return svgString.replace('</svg>', extra + '</svg>');
  }

  CB.logo = {
    drawOnCanvas: drawOnCanvas,
    injectInSvg: injectInSvg
  };
})(typeof window !== 'undefined' ? window : globalThis);
