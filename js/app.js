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
    formatCats: $('formatCats'),
    formatChips: $('formatChips'),
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
    lightSwatch: $('lightSwatch'),
    transparentBg: $('transparentBg'),
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
    renderGen: 0,
    category: 'matrix',
    transparent: false
  };

  function currentFormat() {
    return CB.formats.get(els.formatSelect.value);
  }

  function selectFormat(id) {
    const previous = currentFormat();
    const format = CB.formats.get(id);
    els.formatSelect.value = format.id;
    state.category = format.group;
    paintPicker();
    updateFormatUI(previous);
    render();
  }

  function paintPicker() {
    const query = els.formatFilter.value;
    const selected = els.formatSelect.value || 'qr';
    const searching = !!String(query || '').trim();
    const matches = CB.formats.search(query);

    els.formatCats.innerHTML = '';
    CB.formats.GROUPS.forEach(function (group) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'format-cat' + (!searching && group.id === state.category ? ' active' : '');
      btn.textContent = group.short;
      btn.title = group.label;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', (!searching && group.id === state.category) ? 'true' : 'false');
      btn.addEventListener('click', function () {
        state.category = group.id;
        els.formatFilter.value = '';
        const current = currentFormat();
        if (current.group !== group.id) {
          const first = CB.formats.list.filter(function (f) { return f.group === group.id; })[0];
          if (first) {
            selectFormat(first.id);
            return;
          }
        }
        paintPicker();
      });
      els.formatCats.appendChild(btn);
    });

    els.formatChips.innerHTML = '';
    const visible = searching
      ? matches
      : CB.formats.list.filter(function (format) { return format.group === state.category; });

    if (!visible.length) {
      const empty = document.createElement('div');
      empty.className = 'format-empty';
      empty.textContent = 'No matches';
      els.formatChips.appendChild(empty);
      return;
    }

    let lastGroup = null;
    visible.forEach(function (format) {
      if (searching && format.group !== lastGroup) {
        lastGroup = format.group;
        const heading = document.createElement('div');
        heading.className = 'chip-group';
        const group = CB.formats.GROUPS.filter(function (g) { return g.id === format.group; })[0];
        heading.textContent = group ? group.label : format.group;
        els.formatChips.appendChild(heading);
      }
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'format-chip' + (format.id === selected ? ' active' : '');
      chip.textContent = CB.formats.displayName(format);
      chip.title = format.label;
      chip.setAttribute('role', 'option');
      chip.setAttribute('aria-selected', format.id === selected ? 'true' : 'false');
      chip.addEventListener('click', function () {
        selectFormat(format.id);
      });
      els.formatChips.appendChild(chip);
    });
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

  function isTransparent() {
    return !!(els.transparentBg && els.transparentBg.checked);
  }

  function updateTransparentUI() {
    const on = isTransparent();
    state.transparent = on;
    if (els.lightSwatch) els.lightSwatch.classList.toggle('disabled', on);
    els.stage.classList.toggle('checkered', on);
    els.lightColor.disabled = on;
    els.lightColorHex.disabled = on;
  }

  function updateContrastBadge() {
    els.contrastBadge.classList.remove('risky', 'poor');
    if (isTransparent()) {
      els.contrastBadge.textContent = 'Transparent';
      els.fixContrast.classList.remove('show');
      return null;
    }
    const ratio = CB.colors.contrastRatio(els.darkColor.value, els.lightColor.value);
    const info = CB.colors.contrastLabel(ratio);
    if (info.level !== 'ok') els.contrastBadge.classList.add(info.level);
    els.contrastBadge.textContent = info.level === 'ok'
      ? ratio.toFixed(1) + ':1'
      : ratio.toFixed(1) + ':1 · ' + info.label;
    els.fixContrast.classList.toggle('show', ratio < CB.colors.TARGET);
    return ratio;
  }

  function syncHexInputs() {
    els.darkColorHex.value = els.darkColor.value;
    els.lightColorHex.value = els.lightColor.value;
  }

  function applyHexField(hexInput, colorInput) {
    const raw = String(hexInput.value || '').trim().toLowerCase();
    if (raw === 'none' || raw === 'transparent') {
      els.transparentBg.checked = true;
      updateTransparentUI();
      updateContrastBadge();
      render();
      return;
    }
    const hex = CB.colors.normalizeHex(hexInput.value);
    if (!hex) return;
    colorInput.value = hex;
    hexInput.value = hex;
    if (colorInput === els.lightColor && isTransparent()) {
      els.transparentBg.checked = false;
      updateTransparentUI();
    }
    updateContrastBadge();
    render();
  }

  function updateQuietZoneUI(fromFormat) {
    const format = currentFormat();
    els.quietZone.min = 0;
    els.quietZone.max = CB.formats.quietMax(format);
    els.quietZone.value = CB.formats.convertQuiet(els.quietZone.value, fromFormat, format);
    els.quietZoneVal.textContent = els.quietZone.value + ' ' + CB.formats.quietUnit(format);
  }

  function updateFormatUI(fromFormat) {
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
    updateQuietZoneUI(fromFormat);
  }

  function snapshot() {
    return {
      text: els.input.value,
      format: els.formatSelect.value,
      size: state.size,
      quiet: Number(els.quietZone.value),
      dark: els.darkColor.value,
      light: els.lightColor.value,
      transparent: isTransparent(),
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
      state.category = CB.formats.get(saved.format).group;
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
    if (saved.transparent) els.transparentBg.checked = true;
    if (saved.logoPct) {
      state.logoPct = Number(saved.logoPct);
      els.logoSize.value = state.logoPct;
      els.logoSizeVal.textContent = state.logoPct + '%';
    }
    syncHexInputs();
    updateFormatUI();
    if (saved.quiet != null) els.quietZone.value = saved.quiet;
    updateQuietZoneUI();
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
          transparent: isTransparent(),
          logoDataUrl: state.logoDataUrl
        });
      } else {
        result = CB.engines.bwip.render(format, text, {
          size: state.size,
          quiet: parseInt(els.quietZone.value, 10),
          dark: els.darkColor.value,
          light: els.lightColor.value,
          transparent: isTransparent()
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
      if (isTransparent()) bits.push('transparent bg');
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
    paintPicker();
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
  els.transparentBg.addEventListener('change', function () {
    updateTransparentUI();
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
    if (isTransparent()) {
      els.transparentBg.checked = false;
      updateTransparentUI();
    }
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
      els.logoLabel.textContent = 'Change logo';
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
    els.logoLabel.textContent = 'Add logo';
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

  paintPicker();
  restore();
  paintPicker();
  updateFormatUI();
  updateTransparentUI();
  updateContrastBadge();
  render();
})(window);
