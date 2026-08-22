(function (global) {
  'use strict';

  const CB = global.CodesBared = global.CodesBared || {};
  CB.engines = CB.engines || {};

  function requireBwip() {
    if (typeof bwipjs === 'undefined') {
      throw new Error('bwip-js is not loaded');
    }
  }

  function errorMessage(err) {
    if (!err) return 'encode failed';
    if (typeof err === 'string') return err;
    return err.message || String(err);
  }

  function buildOptions(format, text, state) {
    const colors = CB.colors;
    const opts = {
      bcid: format.bcid,
      text: text,
      backgroundcolor: colors.hexForBwip(state.light),
      barcolor: colors.hexForBwip(state.dark),
      padding: state.quiet
    };

    if (format.options) {
      Object.keys(format.options).forEach(function (key) {
        opts[key] = format.options[key];
      });
    }

    if (format.kind === '1d' || format.includeText) {
      opts.includetext = true;
      opts.textxalign = 'center';
      opts.textcolor = colors.hexForBwip(state.dark);
      opts.height = Math.max(8, Math.round(state.size / 14));
      opts.scale = 3;
    } else {
      opts.scale = 4;
    }

    return opts;
  }

  function scaleCanvas(source, target, mode) {
    const basis = mode === 'height'
      ? source.height
      : Math.max(source.width, source.height);
    if (!basis) return source;
    const ratio = target / basis;
    if (Math.abs(ratio - 1) < 0.02) return source;
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(source.width * ratio));
    out.height = Math.max(1, Math.round(source.height * ratio));
    const ctx = out.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(source, 0, 0, out.width, out.height);
    return out;
  }

  function sizeSvg(svg, width, height) {
    if (/ width="/.test(svg)) {
      svg = svg.replace(/ width="[^"]*"/, ' width="' + width + '"');
    } else {
      svg = svg.replace('<svg', '<svg width="' + width + '"');
    }
    if (/ height="/.test(svg)) {
      svg = svg.replace(/ height="[^"]*"/, ' height="' + height + '"');
    } else {
      svg = svg.replace('<svg', '<svg height="' + height + '"');
    }
    return svg;
  }

  CB.engines.bwip = {
    available: function () {
      return typeof bwipjs !== 'undefined';
    },
    errorMessage: errorMessage,
    render: function (format, text, state) {
      requireBwip();
      const opts = buildOptions(format, text, state);
      const canvas = document.createElement('canvas');
      try {
        bwipjs.toCanvas(canvas, opts);
      } catch (err) {
        throw new Error(errorMessage(err));
      }
      const fitted = scaleCanvas(canvas, state.size, format.kind === '1d' ? 'height' : 'max');
      let svg;
      try {
        svg = bwipjs.toSVG(opts);
      } catch (err) {
        throw new Error(errorMessage(err));
      }
      svg = sizeSvg(svg, fitted.width, fitted.height);
      return {
        canvas: fitted,
        svg: svg,
        extraStatus: format.label
      };
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
