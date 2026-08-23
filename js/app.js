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
    quietZoneUnit: $('quietZoneUnit'),
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
    fixContrast: $('fixContrast'),
    randomBtn: $('randomBtn'),
    typeTip: $('typeTip'),
    typeTipName: $('typeTipName'),
    typeTipBubble: $('typeTipBubble'),
    qrContentSection: $('qrContentSection'),
    qrStyleSection: $('qrStyleSection'),
    qrKindBtns: $('qrKindBtns'),
    qrFields: $('qrFields'),
    qrModuleBtns: $('qrModuleBtns'),
    qrModuleStamps: $('qrModuleStamps'),
    qrEyeBorderBtns: $('qrEyeBorderBtns'),
    qrEyeCenterBtns: $('qrEyeCenterBtns'),
    qrEyeCenterStamps: $('qrEyeCenterStamps'),
    qrEyeOuterR: $('qrEyeOuterR'),
    qrEyeInnerR: $('qrEyeInnerR'),
    qrEyeOuterRVal: $('qrEyeOuterRVal'),
    qrEyeInnerRVal: $('qrEyeInnerRVal'),
    qrEyeCenterR: $('qrEyeCenterR'),
    qrEyeCenterRVal: $('qrEyeCenterRVal'),
    centerRadiusRow: $('centerRadiusRow'),
    qrModuleR: $('qrModuleR'),
    qrModuleRVal: $('qrModuleRVal'),
    moduleRadiusRow: $('moduleRadiusRow'),
    moduleOrientWrap: $('moduleOrientWrap'),
    qrOrientBtns: $('qrOrientBtns'),
    moduleRotRow: $('moduleRotRow'),
    qrModuleRot: $('qrModuleRot'),
    qrModuleRotVal: $('qrModuleRotVal'),
    moduleAimRow: $('moduleAimRow'),
    qrAimPad: $('qrAimPad'),
    qrAimDot: $('qrAimDot'),
    qrAimPresetBtns: $('qrAimPresetBtns'),
    previewModeBtns: $('previewModeBtns'),
    dotCustomRow: $('dotCustomRow'),
    dotCustomInput: $('dotCustomInput'),
    dotCustomLabel: $('dotCustomLabel'),
    dotCustomThumb: $('dotCustomThumb'),
    dotCustomClear: $('dotCustomClear'),
    qrGradient: $('qrGradient'),
    gradientColors: $('gradientColors'),
    gradientControls: $('gradientControls'),
    darkColor2: $('darkColor2'),
    darkColor2Hex: $('darkColor2Hex'),
    gradientDirBtns: $('gradientDirBtns'),
    qrGradientAngle: $('qrGradientAngle'),
    qrGradientAngleVal: $('qrGradientAngleVal'),
    qrSplitInk: $('qrSplitInk'),
    qrInkModule: $('qrInkModule'),
    qrInkModuleHex: $('qrInkModuleHex'),
    qrInkBorder: $('qrInkBorder'),
    qrInkBorderHex: $('qrInkBorderHex'),
    qrInkCenter: $('qrInkCenter'),
    qrInkCenterHex: $('qrInkCenterHex'),
    patternInkField: $('patternInkField'),
    borderInkField: $('borderInkField'),
    centerInkField: $('centerInkField'),
    mixInkRow: $('mixInkRow'),
    swapGradient: $('swapGradient'),
    qrModuleScale: $('qrModuleScale'),
    qrModuleScaleVal: $('qrModuleScaleVal'),
    qrEyeCenterScale: $('qrEyeCenterScale'),
    qrEyeCenterScaleVal: $('qrEyeCenterScaleVal'),
    qrEyeRing: $('qrEyeRing'),
    qrEyeRingVal: $('qrEyeRingVal'),
    qrEyeRot: $('qrEyeRot'),
    qrEyeRotVal: $('qrEyeRotVal'),
    qrEyeSlotBtns: $('qrEyeSlotBtns'),
    eyeCornerRows: $('eyeCornerRows'),
    mixHint: $('mixHint')
  };

  const state = {
    size: 240,
    logoDataUrl: null,
    logoPct: 20,
    png: null,
    svg: null,
    saveTimer: null,
    renderGen: 0,
    category: 'qr',
    transparent: false,
    qrKind: 'text',
    qrModule: 'square',
    qrEyeBorder: 'square',
    qrEyeCenter: 'square',
    qrEyeOuterR: 0,
    qrEyeInnerR: 0,
    qrEyeCenterR: 0,
    qrModuleR: 80,
    qrModuleScale: 100,
    qrEyeCenterScale: 100,
    qrEyeRing: 100,
    qrEyeRot: 0,
    qrEyeSlot: 'all',
    qrEyes: [
      { qrEyeBorder: 'square', qrEyeCenter: 'square', qrEyeOuterR: 0, qrEyeInnerR: 0, qrEyeCenterR: 0, qrEyeCenterScale: 100, qrEyeRing: 100, qrEyeRot: 0, qrInkBorder: '', qrInkCenter: '' },
      { qrEyeBorder: 'square', qrEyeCenter: 'square', qrEyeOuterR: 0, qrEyeInnerR: 0, qrEyeCenterR: 0, qrEyeCenterScale: 100, qrEyeRing: 100, qrEyeRot: 0, qrInkBorder: '', qrInkCenter: '' },
      { qrEyeBorder: 'square', qrEyeCenter: 'square', qrEyeOuterR: 0, qrEyeInnerR: 0, qrEyeCenterR: 0, qrEyeCenterScale: 100, qrEyeRing: 100, qrEyeRot: 0, qrInkBorder: '', qrInkCenter: '' }
    ],
    qrMix: [],
    qrOrient: 'none',
    qrModuleRot: 0,
    qrAimX: 50,
    qrAimY: 50,
    previewMode: 'svg',
    previewCanvas: null,
    qrDotCustom: null,
    qrDotImage: null,
    qrDotSrc: '',
    qrGradient: false,
    qrGradientDir: 'd',
    qrGradientAngle: 45,
    qrSplitInk: false,
    qrInkModule: '',
    qrInkMix: {},
    qrInkBorder: '',
    qrInkCenter: ''
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

    const hideBrowse = !searching && state.category === 'qr';
    if (els.formatFilter) els.formatFilter.classList.toggle('is-off', hideBrowse);
    if (els.formatChips) els.formatChips.classList.toggle('is-off', hideBrowse);

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

  function paintPreview() {
    if (!els.output) return;
    els.output.innerHTML = '';
    if (state.previewMode === 'svg' && state.svg) {
      els.output.innerHTML = state.svg;
      const node = els.output.querySelector('svg');
      if (node) {
        if (!node.getAttribute('width') || !node.getAttribute('height')) {
          const box = node.viewBox && node.viewBox.baseVal;
          if (box && box.width && box.height) {
            node.setAttribute('width', String(box.width));
            node.setAttribute('height', String(box.height));
          }
        }
      }
      return;
    }
    if (state.previewCanvas) {
      els.output.appendChild(state.previewCanvas);
    }
  }

  function setReady(ready) {
    els.download.classList.toggle('ready', ready);
    els.downloadSvg.classList.toggle('ready', ready);
    if (!ready) {
      state.png = null;
      state.svg = null;
      state.previewCanvas = null;
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
    let ratio = CB.colors.contrastRatio(els.darkColor.value, els.lightColor.value);
    if (state.qrGradient && isQrStyle() && !state.qrSplitInk) {
      ratio = Math.min(ratio, CB.colors.contrastRatio(els.darkColor2.value, els.lightColor.value));
    }
    if (state.qrSplitInk && isQrStyle()) {
      activeSplitInks().forEach(function (hex) {
        ratio = Math.min(ratio, CB.colors.contrastRatio(hex, els.lightColor.value));
      });
    }
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
    if (els.darkColor2Hex && els.darkColor2) els.darkColor2Hex.value = els.darkColor2.value;
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
    if (els.quietZoneVal) {
      els.quietZoneVal.min = '0';
      els.quietZoneVal.max = String(els.quietZone.max);
      if (document.activeElement !== els.quietZoneVal) {
        els.quietZoneVal.value = String(els.quietZone.value);
      }
    }
    if (els.quietZoneUnit) els.quietZoneUnit.textContent = CB.formats.quietUnit(format);
  }

  function isQrStyle() {
    return currentFormat().engine === 'qr';
  }

  function paintChoice(container, attr, value) {
    if (!container) return;
    Array.prototype.forEach.call(container.querySelectorAll('.choice-btn'), function (btn) {
      btn.classList.toggle('active', btn.getAttribute(attr) === value);
    });
  }

  function paintStampButtons() {
    const stamps = CB.engines.qr.stamps || [];
    function fill(container, attr) {
      if (!container) return;
      container.innerHTML = '';
      stamps.forEach(function (stamp) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-btn stamp';
        btn.setAttribute(attr, stamp.id);
        btn.title = stamp.label;
        btn.setAttribute('aria-label', stamp.label);
        btn.innerHTML = CB.engines.qr.stampIcon(stamp.id);
        container.appendChild(btn);
      });
    }
    fill(els.qrModuleStamps, 'data-module');
    fill(els.qrEyeCenterStamps, 'data-eye-center');
  }

  function paintQrKinds() {
    if (!els.qrKindBtns) return;
    els.qrKindBtns.innerHTML = '';
    CB.payloads.KINDS.forEach(function (kind) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn' + (kind.id === state.qrKind ? ' active' : '');
      btn.textContent = kind.label;
      btn.addEventListener('click', function () {
        state.qrKind = kind.id;
        paintQrKinds();
        paintQrFields();
        syncPayloadFromFields();
        render();
      });
      els.qrKindBtns.appendChild(btn);
    });
  }

  function paintQrFields() {
    if (!els.qrFields) return;
    els.qrFields.innerHTML = '';
    const spec = CB.payloads.KINDS.filter(function (k) { return k.id === state.qrKind; })[0];
    const fields = spec && spec.fields[0] === 'value' ? [] : (spec ? spec.fields : []);
    fields.forEach(function (name) {
      if (name === 'security') {
        const select = document.createElement('select');
        select.dataset.field = name;
        ['WPA', 'WEP', 'nopass'].forEach(function (opt) {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt === 'nopass' ? 'Open' : opt;
          select.appendChild(option);
        });
        select.addEventListener('change', function () {
          syncPayloadFromFields();
          render();
        });
        els.qrFields.appendChild(select);
        return;
      }
      const input = document.createElement('input');
      input.type = 'text';
      input.dataset.field = name;
      input.placeholder = CB.payloads.LABELS[name] || name;
      input.addEventListener('input', function () {
        syncPayloadFromFields();
        render();
      });
      els.qrFields.appendChild(input);
    });
  }

  function readQrFields() {
    const fields = { value: els.input.value };
    if (!els.qrFields) return fields;
    Array.prototype.forEach.call(els.qrFields.querySelectorAll('[data-field]'), function (el) {
      fields[el.dataset.field] = el.value;
    });
    return fields;
  }

  function writeQrFields(fields) {
    if (!els.qrFields || !fields) return;
    Array.prototype.forEach.call(els.qrFields.querySelectorAll('[data-field]'), function (el) {
      if (fields[el.dataset.field] != null) el.value = fields[el.dataset.field];
    });
  }

  function syncPayloadFromFields() {
    if (!isQrStyle() || state.qrKind === 'text' || state.qrKind === 'url') return;
    const built = CB.payloads.build(state.qrKind, readQrFields());
    if (built) setInputValue(built);
  }

  function applyPayloadKind(text) {
    const parsed = CB.payloads.parse(text);
    state.qrKind = parsed.kind;
    paintQrKinds();
    paintQrFields();
    writeQrFields(parsed.fields);
  }

  function matchGradientPreset(angle) {
    const a = ((Number(angle) % 360) + 360) % 360;
    if (Math.abs(a - 45) <= 2) return '45';
    if (a <= 2 || a >= 358) return '0';
    if (Math.abs(a - 90) <= 2) return '90';
    return '';
  }

  function currentGradient() {
    if (!state.qrGradient || !isQrStyle() || state.qrSplitInk) return null;
    return {
      from: els.darkColor.value,
      to: els.darkColor2.value,
      angle: state.qrGradientAngle,
      dir: state.qrGradientDir
    };
  }

  function updateQrStyleUI() {
    const on = isQrStyle();
    if (els.qrContentSection) {
      els.qrContentSection.classList.toggle('is-off', !on);
      els.qrContentSection.setAttribute('aria-disabled', on ? 'false' : 'true');
    }
    if (els.qrStyleSection) {
      els.qrStyleSection.classList.toggle('is-off', !on);
      els.qrStyleSection.setAttribute('aria-disabled', on ? 'false' : 'true');
    }
    if (els.gradientControls) {
      els.gradientControls.classList.toggle('is-off', !state.qrGradient);
    } else if (els.gradientColors) {
      els.gradientColors.classList.toggle('is-off', !state.qrGradient);
    }
    paintModuleChoice();
    paintChoice(els.qrEyeSlotBtns, 'data-eye-slot', String(state.qrEyeSlot));
    paintChoice(els.qrEyeBorderBtns, 'data-eye-border', state.qrEyeBorder);
    paintChoice(els.qrEyeCenterBtns, 'data-eye-center', state.qrEyeCenter);
    paintChoice(els.gradientDirBtns, 'data-angle', matchGradientPreset(state.qrGradientAngle));
    paintChoice(els.previewModeBtns, 'data-preview', state.previewMode);
    paintChoice(els.qrOrientBtns, 'data-orient', state.qrOrient);
    if (els.centerRadiusRow) {
      els.centerRadiusRow.classList.toggle('is-off', !CB.engines.qr.isGeometricCenter(state.qrEyeCenter));
    }
    if (els.moduleRadiusRow) {
      els.moduleRadiusRow.classList.toggle('is-off', state.qrModule !== 'smooth');
    }
    const orientOn = CB.engines.qr.canOrient(state.qrModule);
    if (els.moduleOrientWrap) {
      els.moduleOrientWrap.classList.toggle('is-off', !orientOn);
    }
    if (els.moduleRotRow) {
      els.moduleRotRow.classList.toggle('is-off', !orientOn || state.qrOrient === 'none');
    }
    if (els.moduleAimRow) {
      els.moduleAimRow.classList.toggle('is-off', !orientOn || state.qrOrient !== 'converge');
    }
    if (els.mixHint) {
      els.mixHint.classList.toggle('is-off', state.qrModule !== 'mix');
    }
    const splitOn = on && state.qrSplitInk;
    if (els.patternInkField) {
      els.patternInkField.classList.toggle('is-off', !splitOn || state.qrModule === 'mix');
    }
    if (els.mixInkRow) {
      els.mixInkRow.classList.toggle('is-off', !splitOn || state.qrModule !== 'mix');
    }
    if (els.borderInkField) els.borderInkField.classList.toggle('is-off', !splitOn);
    if (els.centerInkField) els.centerInkField.classList.toggle('is-off', !splitOn);
    if (els.qrSplitInk) els.qrSplitInk.checked = !!state.qrSplitInk;
    syncInkFields();
    paintMixInkRow();
    syncEyeRadiusUI();
    syncAimDot();
    paintAimPresets();
    updateDotCustomUI();
  }

  function setNum(el, value) {
    if (!el) return;
    if (document.activeElement === el) return;
    el.value = String(value);
  }

  function syncEyeRadiusUI() {
    if (els.qrEyeOuterR) els.qrEyeOuterR.value = String(state.qrEyeOuterR);
    if (els.qrEyeInnerR) els.qrEyeInnerR.value = String(state.qrEyeInnerR);
    if (els.qrEyeCenterR) els.qrEyeCenterR.value = String(state.qrEyeCenterR);
    if (els.qrModuleR) els.qrModuleR.value = String(state.qrModuleR);
    setNum(els.qrEyeOuterRVal, Math.round(state.qrEyeOuterR));
    setNum(els.qrEyeInnerRVal, Math.round(state.qrEyeInnerR));
    setNum(els.qrEyeCenterRVal, Math.round(state.qrEyeCenterR));
    setNum(els.qrModuleRVal, Math.round(state.qrModuleR));
    if (els.qrModuleRot) els.qrModuleRot.value = String(state.qrModuleRot);
    setNum(els.qrModuleRotVal, Math.round(state.qrModuleRot));
    if (els.qrModuleScale) els.qrModuleScale.value = String(state.qrModuleScale);
    setNum(els.qrModuleScaleVal, Math.round(state.qrModuleScale));
    if (els.qrEyeCenterScale) els.qrEyeCenterScale.value = String(state.qrEyeCenterScale);
    setNum(els.qrEyeCenterScaleVal, Math.round(state.qrEyeCenterScale));
    if (els.qrEyeRing) els.qrEyeRing.value = String(state.qrEyeRing);
    setNum(els.qrEyeRingVal, Math.round(state.qrEyeRing));
    if (els.qrEyeRot) els.qrEyeRot.value = String(state.qrEyeRot);
    setNum(els.qrEyeRotVal, Math.round(state.qrEyeRot));
    if (els.qrGradientAngle) els.qrGradientAngle.value = String(state.qrGradientAngle);
    setNum(els.qrGradientAngleVal, Math.round(state.qrGradientAngle));
  }

  function codeInk() {
    return els.darkColor.value || '#10131a';
  }

  function setInkField(colorEl, hexEl, value) {
    const hex = CB.colors.normalizeHex(value) || codeInk();
    if (colorEl && document.activeElement !== colorEl && document.activeElement !== hexEl) {
      colorEl.value = hex;
    }
    if (hexEl && document.activeElement !== hexEl) hexEl.value = hex;
  }

  function syncInkFields() {
    setInkField(els.qrInkModule, els.qrInkModuleHex, state.qrInkModule || codeInk());
    setInkField(els.qrInkBorder, els.qrInkBorderHex, state.qrInkBorder || codeInk());
    setInkField(els.qrInkCenter, els.qrInkCenterHex, state.qrInkCenter || codeInk());
  }

  function paintMixInkRow() {
    if (!els.mixInkRow) return;
    els.mixInkRow.innerHTML = '';
    if (!state.qrSplitInk || state.qrModule !== 'mix') return;
    const list = CB.engines.qr.mixList({ moduleMix: state.qrMix });
    list.forEach(function (id) {
      const label = document.createElement('label');
      label.className = 'ink-mix-item';
      const stamp = (CB.engines.qr.stamps || []).filter(function (item) { return item.id === id; })[0];
      label.title = stamp ? stamp.label : id;
      label.innerHTML = CB.engines.qr.stampIcon(id);
      const input = document.createElement('input');
      input.type = 'color';
      input.value = CB.colors.normalizeHex(state.qrInkMix[id]) || state.qrInkModule || codeInk();
      input.setAttribute('aria-label', (stamp ? stamp.label : id) + ' color');
      input.addEventListener('input', function () {
        state.qrInkMix[id] = input.value;
        updateContrastBadge();
        render();
      });
      label.appendChild(input);
      els.mixInkRow.appendChild(label);
    });
  }

  function seedMixInk(id) {
    if (state.qrInkMix[id]) return;
    state.qrInkMix[id] = state.qrInkModule || codeInk();
  }

  function seedSplitInks() {
    const hex = codeInk();
    if (!state.qrInkModule) state.qrInkModule = hex;
    if (!state.qrInkBorder) state.qrInkBorder = hex;
    if (!state.qrInkCenter) state.qrInkCenter = hex;
    state.qrEyes.forEach(function (eye) {
      if (!eye.qrInkBorder) eye.qrInkBorder = hex;
      if (!eye.qrInkCenter) eye.qrInkCenter = hex;
    });
    CB.engines.qr.mixList({ moduleMix: state.qrMix }).forEach(seedMixInk);
    commitEyes();
  }

  function activeSplitInks() {
    const seen = {};
    const out = [];
    function add(hex) {
      const n = CB.colors.normalizeHex(hex);
      if (!n || seen[n]) return;
      seen[n] = true;
      out.push(n);
    }
    add(state.qrInkModule || codeInk());
    if (state.qrModule === 'mix') {
      CB.engines.qr.mixList({ moduleMix: state.qrMix }).forEach(function (id) {
        add(state.qrInkMix[id] || state.qrInkModule || codeInk());
      });
    }
    state.qrEyes.forEach(function (eye) {
      add(eye.qrInkBorder || state.qrInkModule || codeInk());
      add(eye.qrInkCenter || state.qrInkModule || codeInk());
    });
    return out;
  }

  const AIM_PRESETS = {
    center: { x: 50, y: 50 },
    top: { x: 50, y: 0 },
    right: { x: 100, y: 50 },
    bottom: { x: 50, y: 100 },
    left: { x: 0, y: 50 }
  };

  function nearPct(a, b) {
    return Math.abs(a - b) <= 1;
  }

  function matchAimPreset() {
    const ids = Object.keys(AIM_PRESETS);
    for (let i = 0; i < ids.length; i++) {
      const p = AIM_PRESETS[ids[i]];
      if (nearPct(state.qrAimX, p.x) && nearPct(state.qrAimY, p.y)) return ids[i];
    }
    return '';
  }

  function syncAimDot() {
    if (!els.qrAimDot) return;
    els.qrAimDot.style.left = state.qrAimX + '%';
    els.qrAimDot.style.top = state.qrAimY + '%';
  }

  function paintAimPresets() {
    paintChoice(els.qrAimPresetBtns, 'data-aim', matchAimPreset());
  }

  function paintModuleChoice() {
    if (!els.qrModuleBtns) return;
    Array.prototype.forEach.call(els.qrModuleBtns.querySelectorAll('.choice-btn'), function (btn) {
      const id = btn.getAttribute('data-module');
      if (state.qrModule === 'mix') {
        btn.classList.toggle('active', id === 'mix' || state.qrMix.indexOf(id) !== -1);
      } else {
        btn.classList.toggle('active', id === state.qrModule);
      }
    });
  }

  function isStampId(id) {
    return (CB.engines.qr.stamps || []).some(function (stamp) { return stamp.id === id; });
  }

  const EYE_KEYS = [
    'qrEyeBorder', 'qrEyeCenter', 'qrEyeOuterR', 'qrEyeInnerR',
    'qrEyeCenterR', 'qrEyeCenterScale', 'qrEyeRing', 'qrEyeRot',
    'qrInkBorder', 'qrInkCenter'
  ];
  const EYE_VALUE_KEYS = {
    qrEyeBorder: 1,
    qrEyeCenter: 1,
    qrEyeOuterR: 1,
    qrEyeInnerR: 1,
    qrEyeCenterR: 1,
    qrEyeCenterScale: 1,
    qrEyeRing: 1,
    qrEyeRot: 1,
    qrInkBorder: 1,
    qrInkCenter: 1
  };

  function blankEye() {
    return {
      qrEyeBorder: 'square',
      qrEyeCenter: 'square',
      qrEyeOuterR: 0,
      qrEyeInnerR: 0,
      qrEyeCenterR: 0,
      qrEyeCenterScale: 100,
      qrEyeRing: 100,
      qrEyeRot: 0,
      qrInkBorder: '',
      qrInkCenter: ''
    };
  }

  function copyEye(from) {
    const eye = blankEye();
    EYE_KEYS.forEach(function (key) {
      if (from[key] != null) eye[key] = from[key];
    });
    return eye;
  }

  function applyEyeToState(eye) {
    const next = copyEye(eye);
    EYE_KEYS.forEach(function (key) { state[key] = next[key]; });
  }

  function commitEyes() {
    const eye = copyEye(state);
    if (state.qrEyeSlot === 'all') {
      state.qrEyes = [copyEye(eye), copyEye(eye), copyEye(eye)];
    } else {
      state.qrEyes[state.qrEyeSlot] = copyEye(eye);
    }
  }

  function selectEyeSlot(slot) {
    if (slot === 'all') {
      const src = copyEye(state);
      state.qrEyeSlot = 'all';
      state.qrEyes = [copyEye(src), copyEye(src), copyEye(src)];
      applyEyeToState(src);
      return;
    }
    const i = parseInt(slot, 10);
    if (i !== 0 && i !== 1 && i !== 2) return;
    state.qrEyeSlot = i;
    applyEyeToState(state.qrEyes[i] || blankEye());
  }

  function engineEye(eye) {
    const out = {
      eyeBorder: eye.qrEyeBorder,
      eyeCenter: eye.qrEyeCenter,
      eyeOuterR: eye.qrEyeOuterR,
      eyeInnerR: eye.qrEyeInnerR,
      eyeCenterR: eye.qrEyeCenterR,
      eyeCenterScale: eye.qrEyeCenterScale,
      eyeRing: eye.qrEyeRing,
      eyeRot: eye.qrEyeRot
    };
    if (eye.qrInkBorder) out.inkBorder = eye.qrInkBorder;
    if (eye.qrInkCenter) out.inkCenter = eye.qrInkCenter;
    return out;
  }

  function applyEyeBorderPreset(id) {
    state.qrEyeBorder = id;
    if (id === 'hexagon') {
      commitEyes();
      return;
    }
    const preset = CB.engines.qr.borderPreset(id);
    state.qrEyeOuterR = preset.outer;
    state.qrEyeInnerR = preset.inner;
    commitEyes();
  }

  function applyEyeCenterPreset(id) {
    state.qrEyeCenter = CB.engines.qr.mapCenterShape(id);
    if (CB.engines.qr.isGeometricCenter(state.qrEyeCenter)) {
      state.qrEyeCenterR = CB.engines.qr.centerPreset(state.qrEyeCenter);
    }
    commitEyes();
  }

  function syncEyeBorderFromRadii() {
    if (state.qrEyeBorder === 'hexagon') return;
    state.qrEyeBorder = CB.engines.qr.matchBorderPreset(state.qrEyeOuterR, state.qrEyeInnerR);
  }

  function syncEyeCenterFromRadius() {
    if (!CB.engines.qr.isGeometricCenter(state.qrEyeCenter)) return;
    const matched = CB.engines.qr.matchCenterPreset(state.qrEyeCenterR);
    if (matched) state.qrEyeCenter = matched;
  }

  function usesCustomShape() {
    if (state.qrModule === 'custom' || state.qrEyeCenter === 'custom') return true;
    return (state.qrEyes || []).some(function (eye) { return eye.qrEyeCenter === 'custom'; });
  }

  function updateDotCustomUI() {
    if (!els.dotCustomRow) return;
    const on = usesCustomShape();
    els.dotCustomRow.classList.toggle('is-off', !on);
    if (els.dotCustomThumb) {
      if (state.qrDotCustom) {
        els.dotCustomThumb.src = state.qrDotCustom;
        els.dotCustomThumb.classList.add('show');
      } else {
        els.dotCustomThumb.removeAttribute('src');
        els.dotCustomThumb.classList.remove('show');
      }
    }
    if (els.dotCustomClear) els.dotCustomClear.classList.toggle('show', !!state.qrDotCustom);
    if (els.dotCustomLabel) els.dotCustomLabel.textContent = state.qrDotCustom ? 'Change shape' : 'Upload shape';
  }

  function loadDotImage() {
    if (!usesCustomShape() || !state.qrDotCustom) return Promise.resolve(null);
    if (state.qrDotImage && state.qrDotSrc === state.qrDotCustom && state.qrDotImage.complete) {
      return Promise.resolve(state.qrDotImage);
    }
    return new Promise(function (resolve) {
      const img = new Image();
      img.onload = function () {
        state.qrDotImage = img;
        state.qrDotSrc = state.qrDotCustom;
        resolve(img);
      };
      img.onerror = function () { resolve(null); };
      img.src = state.qrDotCustom;
    });
  }

  function updateFormatUI(fromFormat) {
    const format = currentFormat();
    const canBrand = format.kind === '2d' && format.square;
    els.branding.classList.toggle('is-off', !canBrand);
    els.branding.setAttribute('aria-disabled', canBrand ? 'false' : 'true');
    if (els.brandingDivider) els.brandingDivider.style.display = 'none';
    els.sizeUnitLabel.textContent = format.kind === '1d' ? 'px (height)' : 'px';
    els.input.placeholder = format.placeholder;
    syncInputSize();
    updateTypeTip();
    els.formatHint.textContent = format.hint;
    els.formatHint.className = 'format-hint' + (format.engine === 'qr' ? ' offline' : '');
    els.offlineTag.innerHTML = format.engine === 'qr'
      ? 'self-contained · <span>qrcode.js</span> · no network calls'
      : 'self-contained · <span>bwip-js</span> · no network calls';
    updateQrStyleUI();
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
      logoPct: state.logoPct,
      qrKind: state.qrKind,
      qrModule: state.qrModule,
      qrEye: state.qrEyeBorder,
      qrEyeBorder: state.qrEyeBorder,
      qrEyeCenter: state.qrEyeCenter,
      qrEyeOuterR: state.qrEyeOuterR,
      qrEyeInnerR: state.qrEyeInnerR,
      qrEyeCenterR: state.qrEyeCenterR,
      qrModuleR: state.qrModuleR,
      qrModuleScale: state.qrModuleScale,
      qrEyeCenterScale: state.qrEyeCenterScale,
      qrEyeRing: state.qrEyeRing,
      qrEyeRot: state.qrEyeRot,
      qrEyeSlot: state.qrEyeSlot,
      qrEyes: state.qrEyes.map(copyEye),
      qrMix: state.qrMix.slice(),
      qrOrient: state.qrOrient,
      qrModuleRot: state.qrModuleRot,
      qrAimX: state.qrAimX,
      qrAimY: state.qrAimY,
      previewMode: state.previewMode,
      qrDotCustom: (state.qrDotCustom && state.qrDotCustom.length < 80000) ? state.qrDotCustom : null,
      qrGradient: state.qrGradient,
      qrGradientDir: state.qrGradientDir,
      qrGradientAngle: state.qrGradientAngle,
      qrSplitInk: state.qrSplitInk,
      qrInkModule: state.qrInkModule,
      qrInkMix: state.qrInkMix,
      qrInkBorder: state.qrInkBorder,
      qrInkCenter: state.qrInkCenter,
      dark2: els.darkColor2 ? els.darkColor2.value : '#0b6e4f'
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
    if (typeof saved.text === 'string') setInputValue(saved.text);
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
    if (saved.dark2 && els.darkColor2) {
      els.darkColor2.value = saved.dark2;
      if (els.darkColor2Hex) els.darkColor2Hex.value = saved.dark2;
    }
    if (saved.qrKind) state.qrKind = saved.qrKind;
    if (saved.qrModule) state.qrModule = saved.qrModule;
    if (saved.qrModuleR != null) state.qrModuleR = Math.max(0, Math.min(100, Number(saved.qrModuleR) || 0));
    if (saved.qrModuleScale != null) state.qrModuleScale = CB.engines.qr.clampModuleScale(saved.qrModuleScale);
    if (saved.qrEyeCenterScale != null) state.qrEyeCenterScale = CB.engines.qr.clampCenterScale(saved.qrEyeCenterScale);
    if (saved.qrEyeRing != null) state.qrEyeRing = CB.engines.qr.clampRing(saved.qrEyeRing);
    if (saved.qrEyeRot != null) {
      state.qrEyeRot = ((Number(saved.qrEyeRot) % 360) + 360) % 360;
    }
    if (saved.qrMix) state.qrMix = CB.engines.qr.normalizeMix(saved.qrMix);
    if (saved.qrModule === 'mix' && !state.qrMix.length) {
      state.qrMix = CB.engines.qr.mixList({ moduleMix: [] });
    }
    if (saved.qrOrient === 'rotate' || saved.qrOrient === 'converge' || saved.qrOrient === 'none') {
      state.qrOrient = saved.qrOrient;
    }
    if (saved.qrModuleRot != null) {
      state.qrModuleRot = Math.max(0, Math.min(360, Number(saved.qrModuleRot) || 0));
    }
    if (saved.qrAimX != null) state.qrAimX = Math.max(0, Math.min(100, Number(saved.qrAimX)));
    if (saved.qrAimY != null) state.qrAimY = Math.max(0, Math.min(100, Number(saved.qrAimY)));
    if (saved.qrEyeBorder || saved.qrEye) {
      const border = saved.qrEyeBorder || saved.qrEye;
      if (border === 'hexagon') {
        state.qrEyeBorder = 'hexagon';
        if (saved.qrEyeOuterR != null) state.qrEyeOuterR = Number(saved.qrEyeOuterR);
        if (saved.qrEyeInnerR != null) state.qrEyeInnerR = Number(saved.qrEyeInnerR);
      } else if (saved.qrEyeOuterR != null || saved.qrEyeInnerR != null) {
        state.qrEyeBorder = border;
        if (saved.qrEyeOuterR != null) state.qrEyeOuterR = Number(saved.qrEyeOuterR);
        if (saved.qrEyeInnerR != null) state.qrEyeInnerR = Number(saved.qrEyeInnerR);
        syncEyeBorderFromRadii();
      } else {
        applyEyeBorderPreset(border);
      }
    }
    if (saved.qrEyeCenter || saved.qrEye) {
      let center = saved.qrEyeCenter || saved.qrEye;
      if (!saved.qrEyeCenter && (center === 'circle' || center === 'hexagon')) {
        center = center === 'circle' ? 'dots' : 'square';
      }
      state.qrEyeCenter = CB.engines.qr.mapCenterShape(center);
      if (CB.engines.qr.isGeometricCenter(state.qrEyeCenter)) {
        if (saved.qrEyeCenterR != null) state.qrEyeCenterR = Number(saved.qrEyeCenterR);
        else state.qrEyeCenterR = CB.engines.qr.centerPreset(state.qrEyeCenter);
      }
    }
    if (Array.isArray(saved.qrEyes) && saved.qrEyes.length === 3) {
      state.qrEyes = saved.qrEyes.map(function (eye) { return copyEye(eye || {}); });
      if (saved.qrEyeSlot === 0 || saved.qrEyeSlot === 1 || saved.qrEyeSlot === 2) {
        state.qrEyeSlot = saved.qrEyeSlot;
        applyEyeToState(state.qrEyes[state.qrEyeSlot]);
      } else {
        state.qrEyeSlot = 'all';
        applyEyeToState(state.qrEyes[0]);
      }
    } else {
      state.qrEyes = [copyEye(state), copyEye(state), copyEye(state)];
      state.qrEyeSlot = 'all';
    }
    if (saved.previewMode === 'png' || saved.previewMode === 'svg') {
      state.previewMode = saved.previewMode;
    }
    if (typeof saved.qrDotCustom === 'string' && saved.qrDotCustom.indexOf('data:image') === 0) {
      state.qrDotCustom = saved.qrDotCustom;
    }
    if (saved.qrGradient) {
      state.qrGradient = true;
      if (els.qrGradient) els.qrGradient.checked = true;
    }
    if (saved.qrGradientDir) state.qrGradientDir = saved.qrGradientDir;
    if (saved.qrGradientAngle != null && isFinite(Number(saved.qrGradientAngle))) {
      state.qrGradientAngle = ((Number(saved.qrGradientAngle) % 360) + 360) % 360;
    } else if (saved.qrGradientDir === 'h') {
      state.qrGradientAngle = 0;
    } else if (saved.qrGradientDir === 'v') {
      state.qrGradientAngle = 90;
    } else if (saved.qrGradientDir === 'd') {
      state.qrGradientAngle = 45;
    }
    if (saved.qrSplitInk) {
      state.qrSplitInk = true;
      if (els.qrSplitInk) els.qrSplitInk.checked = true;
    }
    if (saved.qrInkModule) state.qrInkModule = saved.qrInkModule;
    if (saved.qrInkMix && typeof saved.qrInkMix === 'object') {
      state.qrInkMix = CB.engines.qr.normalizeInkMap(saved.qrInkMix);
    }
    if (saved.qrInkBorder) state.qrInkBorder = saved.qrInkBorder;
    if (saved.qrInkCenter) state.qrInkCenter = saved.qrInkCenter;
    if (state.qrSplitInk) seedSplitInks();
    if (saved.logoPct) {
      state.logoPct = Number(saved.logoPct);
      els.logoSize.value = state.logoPct;
      setNum(els.logoSizeVal, state.logoPct);
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
    let text = format.normalize ? format.normalize(raw) : raw;
    if (format.engine === 'qr' && state.qrKind !== 'text') {
      const built = CB.payloads.build(state.qrKind, readQrFields());
      if (built) text = built;
    }
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

    const ready = format.engine === 'qr' ? loadDotImage() : Promise.resolve(null);
    ready.then(function (moduleImage) {
      if (gen !== state.renderGen) return;
      let result;
      if (format.engine === 'qr') {
        result = CB.engines.qr.render(text, {
          size: state.size,
          quiet: parseInt(els.quietZone.value, 10),
          dark: els.darkColor.value,
          light: els.lightColor.value,
          transparent: isTransparent(),
          logoDataUrl: state.logoDataUrl,
          module: state.qrModule,
          eyeBorder: state.qrEyeBorder,
          eyeCenter: state.qrEyeCenter,
          eyeOuterR: state.qrEyeOuterR,
          eyeInnerR: state.qrEyeInnerR,
          eyeCenterR: state.qrEyeCenterR,
          moduleR: state.qrModuleR,
          moduleScale: state.qrModuleScale,
          eyeCenterScale: state.qrEyeCenterScale,
          eyeRing: state.qrEyeRing,
          eyeRot: state.qrEyeRot,
          eyeMarks: state.qrEyes.map(engineEye),
          moduleMix: state.qrMix,
          moduleAim: state.qrOrient,
          moduleRot: state.qrModuleRot,
          aimX: state.qrAimX,
          aimY: state.qrAimY,
          moduleImage: moduleImage,
          moduleImageUrl: usesCustomShape() ? state.qrDotCustom : null,
          gradient: currentGradient(),
          splitInk: state.qrSplitInk,
          inkModule: state.qrInkModule,
          inkMix: state.qrInkMix,
          inkBorder: state.qrInkBorder,
          inkCenter: state.qrInkCenter
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
      els.stage.classList.remove('empty');
      return fitLogo(result.canvas, result.svg).then(function (final) {
        return { final: final, extraStatus: result.extraStatus };
      });
    }).then(function (pack) {
      if (!pack || gen !== state.renderGen) return;
      state.previewCanvas = pack.final.canvas;
      state.png = pack.final.canvas.toDataURL('image/png');
      state.svg = pack.final.svg;
      paintPreview();
      setReady(true);
      const bits = ['encoded · ' + text.length + ' chars'];
      if (pack.extraStatus) bits.push(pack.extraStatus);
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
  if (els.quietZoneVal) {
    const commitQuiet = function () {
      const min = Number(els.quietZone.min);
      const max = Number(els.quietZone.max);
      let n = parseInt(els.quietZoneVal.value, 10);
      if (!isFinite(n)) n = parseInt(els.quietZone.value, 10) || 0;
      if (isFinite(min)) n = Math.max(min, n);
      if (isFinite(max)) n = Math.min(max, n);
      els.quietZone.value = String(n);
      els.quietZoneVal.value = String(n);
      render();
    };
    els.quietZoneVal.addEventListener('change', commitQuiet);
    els.quietZoneVal.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitQuiet();
        els.quietZoneVal.blur();
      }
    });
  }

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
  if (els.darkColor2) {
    els.darkColor2.addEventListener('input', function () {
      syncHexInputs();
      updateContrastBadge();
      render();
    });
  }
  if (els.darkColor2Hex) {
    els.darkColor2Hex.addEventListener('change', function () {
      applyHexField(els.darkColor2Hex, els.darkColor2);
    });
  }
  if (els.qrGradient) {
    els.qrGradient.addEventListener('change', function () {
      state.qrGradient = !!els.qrGradient.checked;
      if (state.qrGradient && state.qrSplitInk) {
        state.qrSplitInk = false;
        if (els.qrSplitInk) els.qrSplitInk.checked = false;
      }
      updateQrStyleUI();
      updateContrastBadge();
      render();
    });
  }
  if (els.qrSplitInk) {
    els.qrSplitInk.addEventListener('change', function () {
      state.qrSplitInk = !!els.qrSplitInk.checked;
      if (state.qrSplitInk) {
        state.qrGradient = false;
        if (els.qrGradient) els.qrGradient.checked = false;
        seedSplitInks();
      }
      updateQrStyleUI();
      updateContrastBadge();
      render();
    });
  }
  function bindInkPair(colorEl, hexEl, apply) {
    if (!colorEl) return;
    colorEl.addEventListener('input', function () {
      if (hexEl) hexEl.value = colorEl.value;
      apply(colorEl.value);
      updateContrastBadge();
      render();
    });
    if (!hexEl) return;
    hexEl.addEventListener('change', function () {
      const hex = CB.colors.normalizeHex(hexEl.value);
      if (!hex) return;
      colorEl.value = hex;
      hexEl.value = hex;
      apply(hex);
      updateContrastBadge();
      render();
    });
  }
  bindInkPair(els.qrInkModule, els.qrInkModuleHex, function (hex) {
    state.qrInkModule = hex;
  });
  bindInkPair(els.qrInkBorder, els.qrInkBorderHex, function (hex) {
    state.qrInkBorder = hex;
    commitEyes();
  });
  bindInkPair(els.qrInkCenter, els.qrInkCenterHex, function (hex) {
    state.qrInkCenter = hex;
    commitEyes();
  });
  function bindChoices(container, attr, apply) {
    if (!container) return;
    container.addEventListener('click', function (event) {
      const btn = event.target.closest('.choice-btn');
      if (!btn) return;
      apply(btn.getAttribute(attr));
      updateQrStyleUI();
      render();
    });
  }
  if (els.qrModuleBtns) {
    els.qrModuleBtns.addEventListener('click', function (event) {
      const btn = event.target.closest('.choice-btn');
      if (!btn) return;
      const value = btn.getAttribute('data-module');
      if (!value) return;
      if (value === 'mix') {
        state.qrModule = 'mix';
        if (!state.qrMix.length) state.qrMix = CB.engines.qr.mixList({ moduleMix: [] });
        state.qrMix.forEach(seedMixInk);
      } else if (state.qrModule === 'mix' && isStampId(value)) {
        const i = state.qrMix.indexOf(value);
        if (i >= 0) {
          if (state.qrMix.length > 1) {
            state.qrMix = state.qrMix.filter(function (id) { return id !== value; });
          }
        } else {
          state.qrMix = state.qrMix.concat([value]);
          seedMixInk(value);
        }
      } else {
        state.qrModule = value;
        if (value === 'smooth' && !state.qrModuleR) state.qrModuleR = 80;
        if (value === 'custom' && !state.qrDotCustom && els.dotCustomInput) {
          els.dotCustomInput.click();
        }
      }
      updateQrStyleUI();
      render();
    });
  }
  bindChoices(els.qrEyeSlotBtns, 'data-eye-slot', function (value) {
    selectEyeSlot(value === 'all' ? 'all' : value);
  });
  bindChoices(els.qrEyeBorderBtns, 'data-eye-border', function (value) {
    applyEyeBorderPreset(value);
  });
  bindChoices(els.qrEyeCenterBtns, 'data-eye-center', function (value) {
    applyEyeCenterPreset(value);
    if (value === 'custom' && !state.qrDotCustom && els.dotCustomInput) {
      els.dotCustomInput.click();
    }
  });
  bindChoices(els.qrOrientBtns, 'data-orient', function (value) {
    state.qrOrient = value === 'rotate' || value === 'converge' ? value : 'none';
  });
  bindChoices(els.qrAimPresetBtns, 'data-aim', function (value) {
    const preset = AIM_PRESETS[value];
    if (!preset) return;
    state.qrAimX = preset.x;
    state.qrAimY = preset.y;
  });
  bindChoices(els.gradientDirBtns, 'data-angle', function (value) {
    const angle = parseInt(value, 10);
    state.qrGradientAngle = isFinite(angle) ? angle : 45;
    if (state.qrGradientAngle === 0) state.qrGradientDir = 'h';
    else if (state.qrGradientAngle === 90) state.qrGradientDir = 'v';
    else state.qrGradientDir = 'd';
  });
  if (els.previewModeBtns) {
    els.previewModeBtns.addEventListener('click', function (event) {
      const btn = event.target.closest('.choice-btn');
      if (!btn) return;
      state.previewMode = btn.getAttribute('data-preview') === 'png' ? 'png' : 'svg';
      paintChoice(els.previewModeBtns, 'data-preview', state.previewMode);
      paintPreview();
      scheduleSave();
    });
  }
  function bindSlider(range, num, key, after) {
    if (!range) return;
    function apply(raw) {
      const min = Number(range.min);
      const max = Number(range.max);
      let n = parseInt(raw, 10);
      if (!isFinite(n)) n = parseInt(range.value, 10) || 0;
      if (isFinite(min)) n = Math.max(min, n);
      if (isFinite(max)) n = Math.min(max, n);
      state[key] = n;
      range.value = String(n);
      if (num) num.value = String(n);
      if (after) after();
      if (EYE_VALUE_KEYS[key]) commitEyes();
      updateQrStyleUI();
      render();
    }
    range.addEventListener('input', function () { apply(range.value); });
    if (!num) return;
    num.addEventListener('change', function () { apply(num.value); });
    num.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        apply(num.value);
        num.blur();
      }
    });
  }
  bindSlider(els.qrEyeOuterR, els.qrEyeOuterRVal, 'qrEyeOuterR', syncEyeBorderFromRadii);
  bindSlider(els.qrEyeInnerR, els.qrEyeInnerRVal, 'qrEyeInnerR', syncEyeBorderFromRadii);
  bindSlider(els.qrEyeCenterR, els.qrEyeCenterRVal, 'qrEyeCenterR', syncEyeCenterFromRadius);
  bindSlider(els.qrModuleR, els.qrModuleRVal, 'qrModuleR');
  bindSlider(els.qrModuleRot, els.qrModuleRotVal, 'qrModuleRot');
  bindSlider(els.qrModuleScale, els.qrModuleScaleVal, 'qrModuleScale');
  bindSlider(els.qrEyeCenterScale, els.qrEyeCenterScaleVal, 'qrEyeCenterScale');
  bindSlider(els.qrEyeRing, els.qrEyeRingVal, 'qrEyeRing');
  bindSlider(els.qrEyeRot, els.qrEyeRotVal, 'qrEyeRot');
  bindSlider(els.qrGradientAngle, els.qrGradientAngleVal, 'qrGradientAngle', function () {
    const preset = matchGradientPreset(state.qrGradientAngle);
    if (preset === '0') state.qrGradientDir = 'h';
    else if (preset === '90') state.qrGradientDir = 'v';
    else if (preset === '45') state.qrGradientDir = 'd';
  });
  if (els.qrAimPad) {
    const setAimFromEvent = function (event) {
      const rect = els.qrAimPad.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      state.qrAimX = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      state.qrAimY = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
      syncAimDot();
      paintAimPresets();
      render();
    };
    els.qrAimPad.addEventListener('pointerdown', function (event) {
      els.qrAimPad.setPointerCapture(event.pointerId);
      setAimFromEvent(event);
    });
    els.qrAimPad.addEventListener('pointermove', function (event) {
      if (!els.qrAimPad.hasPointerCapture(event.pointerId)) return;
      setAimFromEvent(event);
    });
  }
  if (els.dotCustomInput) {
    els.dotCustomInput.addEventListener('change', function (event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (ev) {
      if (state.qrModule !== 'custom' && !usesCustomShape()) {
          state.qrModule = 'custom';
        }
        state.qrDotCustom = ev.target.result;
        state.qrDotImage = null;
        state.qrDotSrc = '';
        updateQrStyleUI();
        render();
      };
      reader.readAsDataURL(file);
    });
  }
  if (els.dotCustomClear) {
    els.dotCustomClear.addEventListener('click', function () {
      state.qrDotCustom = null;
      state.qrDotImage = null;
      state.qrDotSrc = '';
      if (els.dotCustomInput) els.dotCustomInput.value = '';
      if (state.qrModule === 'custom') state.qrModule = 'dots';
      if (state.qrEyeCenter === 'custom') state.qrEyeCenter = 'square';
      state.qrEyes.forEach(function (eye) {
        if (eye.qrEyeCenter === 'custom') eye.qrEyeCenter = 'square';
      });
      commitEyes();
      updateQrStyleUI();
      render();
    });
  }
  els.fixContrast.addEventListener('click', function () {
    if (state.qrSplitInk && isQrStyle()) {
      const current = activeSplitInks();
      const next = CB.colors.boostMany(current, els.lightColor.value);
      els.lightColor.value = next.light;
      const remap = {};
      current.forEach(function (hex, i) { remap[hex] = next.inks[i]; });
      function bumped(hex) {
        const n = CB.colors.normalizeHex(hex) || hex;
        return remap[n] || n;
      }
      state.qrInkModule = bumped(state.qrInkModule || codeInk());
      Object.keys(state.qrInkMix).forEach(function (id) {
        state.qrInkMix[id] = bumped(state.qrInkMix[id]);
      });
      state.qrInkBorder = bumped(state.qrInkBorder || codeInk());
      state.qrInkCenter = bumped(state.qrInkCenter || codeInk());
      state.qrEyes.forEach(function (eye) {
        eye.qrInkBorder = bumped(eye.qrInkBorder || codeInk());
        eye.qrInkCenter = bumped(eye.qrInkCenter || codeInk());
      });
      commitEyes();
      syncHexInputs();
      syncInkFields();
      updateContrastBadge();
      render();
      return;
    }
    const next = CB.colors.boostInk(
      els.darkColor.value,
      els.lightColor.value,
      els.darkColor2 ? els.darkColor2.value : els.darkColor.value,
      !!(state.qrGradient && isQrStyle())
    );
    els.darkColor.value = next.dark;
    els.lightColor.value = next.light;
    if (els.darkColor2) els.darkColor2.value = next.dark2;
    syncHexInputs();
    updateContrastBadge();
    render();
  });
  if (els.swapGradient) {
    els.swapGradient.addEventListener('click', function () {
      if (!els.darkColor2) return;
      const tmp = els.darkColor.value;
      els.darkColor.value = els.darkColor2.value;
      els.darkColor2.value = tmp;
      syncHexInputs();
      updateContrastBadge();
      render();
    });
  }
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
    setNum(els.logoSizeVal, state.logoPct);
    render();
  });
  if (els.logoSizeVal) {
    const commitLogo = function () {
      const min = Number(els.logoSize.min);
      const max = Number(els.logoSize.max);
      let n = parseInt(els.logoSizeVal.value, 10);
      if (!isFinite(n)) n = parseInt(els.logoSize.value, 10) || 20;
      if (isFinite(min)) n = Math.max(min, n);
      if (isFinite(max)) n = Math.min(max, n);
      state.logoPct = n;
      els.logoSize.value = String(n);
      els.logoSizeVal.value = String(n);
      render();
    };
    els.logoSizeVal.addEventListener('change', commitLogo);
    els.logoSizeVal.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitLogo();
        els.logoSizeVal.blur();
      }
    });
  }

  function setInputValue(value) {
    els.input.value = value;
    syncInputSize();
  }

  function syncInputSize() {
    const el = els.input;
    if (!el || el.tagName !== 'TEXTAREA') return;
    el.style.height = '0px';
    el.style.height = Math.max(33, Math.min(168, el.scrollHeight)) + 'px';
  }

  function updateTypeTip() {
    const format = currentFormat();
    const text = CB.formats.about(format);
    if (els.typeTipName) els.typeTipName.textContent = format.label;
    if (els.typeTipBubble) els.typeTipBubble.textContent = text;
    if (els.typeTip) els.typeTip.setAttribute('aria-label', format.label + ': ' + text);
  }

  function fillRandom() {
    const format = currentFormat();
    if (format.engine === 'qr' && state.qrKind && state.qrKind !== 'text') {
      const made = CB.payloads.random(state.qrKind);
      setInputValue(made.text);
      writeQrFields(made.fields);
    } else {
      if (format.engine === 'qr') state.qrKind = 'text';
      setInputValue(CB.formats.random(format));
      paintQrKinds();
      paintQrFields();
    }
    render();
  }

  if (els.randomBtn) els.randomBtn.addEventListener('click', fillRandom);
  els.input.addEventListener('input', function () {
    syncInputSize();
    render();
  });

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

  paintStampButtons();
  paintQrKinds();
  paintQrFields();
  paintPicker();
  restore();
  paintQrKinds();
  paintQrFields();
  if (els.input.value) writeQrFields(CB.payloads.parse(els.input.value).fields);
  paintPicker();
  updateFormatUI();
  updateTransparentUI();
  updateContrastBadge();
  render();
})(window);
