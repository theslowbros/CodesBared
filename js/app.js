(function (global) {
  'use strict';

  const CB = global.CodesBared;
  const $ = function (id) { return document.getElementById(id); };

  const els = {
    input: $('input'),
    stage: $('stage'),
    output: $('stage-output'),
    status: $('status'),
    download: $('download'),
    downloadSvg: $('downloadSvg'),
    sizeBtns: document.querySelectorAll('.size-btn'),
    sizeCustom: $('sizeCustom'),
    sizeUnitLabel: $('sizeUnitLabel'),
    quietZone: $('quietZone'),
    quietZoneVal: $('quietZoneVal'),
    formatSelect: $('formatSelect'),
    formatFilter: $('formatFilter'),
    formatHint: $('formatHint'),
    branding: $('brandingSection'),
    brandingDivider: $('brandingDivider'),
    offlineTag: $('offlineTag'),
    logoInput: $('logoInput'),
    logoLabel: $('logoLabel'),
    logoThumb: $('logoThumb'),
    logoClear: $('logoClear'),
    logoSizeRow: $('logoSizeRow'),
    logoSize: $('logoSize'),
    logoSizeVal: $('logoSizeVal'),
    darkColor: $('darkColor'),
    lightColor: $('lightColor'),
    darkColorHex: $('darkColorHex'),
    lightColorHex: $('lightColorHex'),
    contrastBadge: $('contrastBadge'),
    fixContrast: $('fixContrast')
  };

  const state = {
    size: 240,
    logoDataUrl: null,
    logoPct: 20,
    png: null,
    svg: null,
    saveTimer: null,
    renderGen: 0
  };

  function currentFormat() {
    return CB.formats.get(els.formatSelect.value);
  }

  function populateFormats(query) {
    const selected = els.formatSelect.value || 'qr';
    const matches = CB.formats.search(query);
    const byGroup = {};
    CB.formats.GROUPS.forEach(function (group) { byGroup[group.id] = []; });
    matches.forEach(function (format) {
      if (!byGroup[format.group]) byGroup[format.group] = [];
      byGroup[format.group].push(format);
    });

    els.formatSelect.innerHTML = '';
    CB.formats.GROUPS.forEach(function (group) {
      const items = byGroup[group.id] || [];
      if (!items.length) return;
      const og = document.createElement('optgroup');
      og.label = group.label;
      items.forEach(function (format) {
        const opt = document.createElement('option');
        opt.value = format.id;
        opt.textContent = format.label;
        og.appendChild(opt);
      });
      els.formatSelect.appendChild(og);
    });

    if (CB.formats.byId[selected] && matches.some(function (f) { return f.id === selected; })) {
      els.formatSelect.value = selected;
    } else if (matches[0]) {
      els.formatSelect.value = matches[0].id;
    }
  }

  function setStatus(text, kind) {
    els.status.textContent = text;
    els.status.classList.toggle('ok', kind === 'ok');
    els.status.classList.toggle('bad', kind === 'bad');
  }

  function setReady(ready) {
    els.download.classList.toggle('ready', ready);
    els.downloadSvg.classList.toggle('ready', ready);
    if (!ready) {
      state.png = null;
      state.svg = null;
    }
  }

  function showEmpty() {
    els.stage.classList.add('empty');
    els.output.innerHTML = '';
    setReady(false);
  }

  function updateContrastBadge() {
    const ratio = CB.colors.contrastRatio(els.darkColor.value, els.lightColor.value);
    const info = CB.colors.contrastLabel(ratio);
    els.contrastBadge.classList.remove('risky', 'poor');
    if (info.level !== 'ok') els.contrastBadge.classList.add(info.level);
    els.contrastBadge.textContent = ratio.toFixed(1) + ':1 · ' + info.label;
    els.fixContrast.classList.toggle('show', ratio < CB.colors.TARGET);
    return ratio;
  }

  function syncHexInputs() {
    els.darkColorHex.value = els.darkColor.value;
    els.lightColorHex.value = els.lightColor.value;
  }

  function applyHexField(hexInput, colorInput) {
    const hex = CB.colors.normalizeHex(hexInput.value);
    if (!hex) return;
    colorInput.value = hex;
    hexInput.value = hex;
    updateContrastBadge();
    render();
  }

  function updateQuietZoneUI(resetValue) {
    const format = currentFormat();
    const isQr = format.engine === 'qr';
    els.quietZone.min = 0;
    els.quietZone.max = format.kind === '1d' ? 20 : 10;
    if (resetValue || Number(els.quietZone.value) > Number(els.quietZone.max)) {
      els.quietZone.value = format.quietDefault;
    }
    const unit = format.kind === '1d' ? 'X' : 'modules';
    els.quietZoneVal.textContent = els.quietZone.value + ' ' + unit;
  }

  function updateFormatUI(resetQuiet) {
    const format = currentFormat();
    const canBrand = format.kind === '2d' && format.square;
    els.branding.style.display = canBrand ? '' : 'none';
    els.brandingDivider.style.display = canBrand ? '' : 'none';
    els.sizeUnitLabel.textContent = format.kind === '1d' ? 'px (height)' : 'px';
    els.input.placeholder = format.placeholder;
    els.formatHint.textContent = format.hint;
    els.formatHint.className = 'format-hint' + (format.engine === 'qr' ? ' offline' : '');
    els.offlineTag.innerHTML = format.engine === 'qr'
      ? 'self-contained · <span>qrcode.js</span> · no network calls'
      : 'self-contained · <span>bwip-js</span> · no network calls';
    updateQuietZoneUI(resetQuiet);
  }

  function snapshot() {
    return {
      text: els.input.value,
      format: els.formatSelect.value,
      size: state.size,
      quiet: Number(els.quietZone.value),
      dark: els.darkColor.value,
      light: els.lightColor.value,
      logoPct: state.logoPct
    };
  }

  function scheduleSave() {
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(function () {
      CB.persist.save(snapshot());
    }, 400);
  }

  function restore() {
    const saved = CB.persist.load();
    if (!saved) return;
    if (saved.format && CB.formats.byId[saved.format]) {
      els.formatSelect.value = saved.format;
    }
    if (typeof saved.text === 'string') els.input.value = saved.text;
    if (saved.size) {
      state.size = Math.max(50, Math.min(2000, Number(saved.size) || 240));
      els.sizeCustom.value = state.size;
      els.sizeBtns.forEach(function (btn) {
        btn.classList.toggle('active', Number(btn.dataset.size) === state.size);
      });
    }
    if (saved.dark) els.darkColor.value = saved.dark;
    if (saved.light) els.lightColor.value = saved.light;
    if (saved.logoPct) {
      state.logoPct = Number(saved.logoPct);
      els.logoSize.value = state.logoPct;
      els.logoSizeVal.textContent = state.logoPct + '%';
    }
    syncHexInputs();
    updateFormatUI(true);
    if (saved.quiet != null) els.quietZone.value = saved.quiet;
    updateQuietZoneUI(false);
  }

  function fitLogo(canvas, svg) {
    if (!state.logoDataUrl || !currentFormat().square) {
      return Promise.resolve({ canvas: canvas, svg: svg });
    }
    return CB.logo.drawOnCanvas(
      canvas.getContext('2d'),
      canvas.width,
      canvas.height,
      state.logoDataUrl,
      state.logoPct,
      els.lightColor.value
    ).then(function () {
      return {
        canvas: canvas,
        svg: CB.logo.injectInSvg(svg, state.logoDataUrl, state.logoPct, els.lightColor.value)
      };
    });
  }

  function render() {
    const raw = els.input.value.trim();
    const format = currentFormat();
    const text = format.normalize ? format.normalize(raw) : raw;
    const gen = state.renderGen += 1;
    els.output.innerHTML = '';
    setReady(false);
    scheduleSave();

    if (!text) {
      showEmpty();
      setStatus('idle');
      els.formatHint.textContent = format.hint;
      els.formatHint.className = 'format-hint' + (format.engine === 'qr' ? ' offline' : '');
      return;
    }

    const check = CB.formats.validate(format.id, text);
    if (!check.ok) {
      showEmpty();
      setStatus(check.message, 'bad');
      els.formatHint.textContent = check.message;
      els.formatHint.className = 'format-hint error';
      return;
    }

    els.formatHint.textContent = format.hint;
    els.formatHint.className = 'format-hint' + (format.engine === 'qr' ? ' offline' : '');

    let result;
    try {
      if (format.engine === 'qr') {
        result = CB.engines.qr.render(text, {
          size: state.size,
          quiet: parseInt(els.quietZone.value, 10),
          dark: els.darkColor.value,
          light: els.lightColor.value,
          logoDataUrl: state.logoDataUrl
        });
      } else {
        result = CB.engines.bwip.render(format, text, {
          size: state.size,
          quiet: parseInt(els.quietZone.value, 10),
          dark: els.darkColor.value,
          light: els.lightColor.value
        });
      }
    } catch (err) {
      showEmpty();
      setStatus(err.message || 'invalid input for this format', 'bad');
      return;
    }

    els.stage.classList.remove('empty');
    fitLogo(result.canvas, result.svg).then(function (final) {
      if (gen !== state.renderGen) return;
      els.output.innerHTML = '';
      els.output.appendChild(final.canvas);
      state.png = final.canvas.toDataURL('image/png');
      state.svg = final.svg;
      setReady(true);
      const bits = ['encoded · ' + text.length + ' chars'];
      if (result.extraStatus) bits.push(result.extraStatus);
      setStatus(bits.join(' · '), 'ok');
    }).catch(function (err) {
      if (gen !== state.renderGen) return;
      showEmpty();
      setStatus(err.message || 'render failed', 'bad');
    });
  }

  function setSize(px) {
    state.size = Math.max(50, Math.min(2000, px));
    els.sizeCustom.value = state.size;
  }

  function downloadBlob(filename, href) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = href;
    link.click();
  }

  els.sizeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      els.sizeBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      setSize(parseInt(btn.dataset.size, 10));
      render();
    });
  });

  els.sizeCustom.addEventListener('input', function () {
    const value = parseInt(els.sizeCustom.value, 10);
    if (!value) return;
    els.sizeBtns.forEach(function (btn) { btn.classList.remove('active'); });
    state.size = Math.max(50, Math.min(2000, value));
    render();
  });

  els.quietZone.addEventListener('input', function () {
    updateQuietZoneUI(false);
    render();
  });

  els.formatFilter.addEventListener('input', function () {
    populateFormats(els.formatFilter.value);
    updateFormatUI(true);
    render();
  });

  els.formatSelect.addEventListener('change', function () {
    updateFormatUI(true);
    render();
  });

  els.darkColor.addEventListener('input', function () {
    syncHexInputs();
    updateContrastBadge();
    render();
  });
  els.lightColor.addEventListener('input', function () {
    syncHexInputs();
    updateContrastBadge();
    render();
  });
  els.darkColorHex.addEventListener('change', function () {
    applyHexField(els.darkColorHex, els.darkColor);
  });
  els.lightColorHex.addEventListener('change', function () {
    applyHexField(els.lightColorHex, els.lightColor);
  });
  els.fixContrast.addEventListener('click', function () {
    const next = CB.colors.boostContrast(els.darkColor.value, els.lightColor.value);
    els.darkColor.value = next.dark;
    els.lightColor.value = next.light;
    syncHexInputs();
    updateContrastBadge();
    render();
  });
  $('swapColors').addEventListener('click', function () {
    const tmp = els.darkColor.value;
    els.darkColor.value = els.lightColor.value;
    els.lightColor.value = tmp;
    syncHexInputs();
    updateContrastBadge();
    render();
  });

  els.logoInput.addEventListener('change', function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      state.logoDataUrl = ev.target.result;
      els.logoThumb.src = state.logoDataUrl;
      els.logoThumb.classList.add('show');
      els.logoClear.classList.add('show');
      els.logoSizeRow.classList.add('show');
      els.logoLabel.textContent = '✓ logo set';
      els.logoLabel.classList.add('has-logo');
      render();
    };
    reader.readAsDataURL(file);
  });

  els.logoClear.addEventListener('click', function () {
    state.logoDataUrl = null;
    els.logoInput.value = '';
    els.logoThumb.classList.remove('show');
    els.logoClear.classList.remove('show');
    els.logoSizeRow.classList.remove('show');
    els.logoLabel.textContent = '+ add logo';
    els.logoLabel.classList.remove('has-logo');
    render();
  });

  els.logoSize.addEventListener('input', function () {
    state.logoPct = parseInt(els.logoSize.value, 10);
    els.logoSizeVal.textContent = state.logoPct + '%';
    render();
  });

  els.input.addEventListener('input', render);

  els.downloadSvg.addEventListener('click', function () {
    if (!state.svg) return;
    const blob = new Blob([state.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    downloadBlob(CB.formats.fileStem(els.formatSelect.value) + '.svg', url);
    URL.revokeObjectURL(url);
  });

  els.download.addEventListener('click', function () {
    if (!state.png) return;
    downloadBlob(CB.formats.fileStem(els.formatSelect.value) + '.png', state.png);
  });

  populateFormats('');
  restore();
  updateFormatUI(false);
  updateContrastBadge();
  render();
})(window);
