(function (global) {
  'use strict';

  const CB = global.CodesBared = global.CodesBared || {};

  function ok() {
    return { ok: true };
  }

  function fail(message) {
    return { ok: false, message: message };
  }

  function anyText(text) {
    return text ? ok() : fail('enter some text');
  }

  function digits(min, max, label) {
    return function (text) {
      const cleaned = String(text).replace(/[\s-]/g, '');
      if (!/^\d+$/.test(cleaned)) return fail(label + ' must be digits');
      if (cleaned.length < min || cleaned.length > max) {
        const span = min === max ? String(min) : min + '–' + max;
        return fail(label + ' needs ' + span + ' digits');
      }
      return ok();
    };
  }

  function evenDigits(label) {
    return function (text) {
      const cleaned = String(text).replace(/[\s-]/g, '');
      if (!/^\d+$/.test(cleaned)) return fail(label + ' must be digits');
      if (cleaned.length < 2 || cleaned.length % 2 !== 0) {
        return fail(label + ' needs an even number of digits');
      }
      return ok();
    };
  }

  function charset(pattern, message) {
    return function (text) {
      return pattern.test(text) ? ok() : fail(message);
    };
  }

  function rangeInt(min, max, label) {
    return function (text) {
      if (!/^\d+$/.test(text)) return fail(label + ' must be a whole number');
      const n = parseInt(text, 10);
      if (n < min || n > max) return fail(label + ' must be ' + min + '–' + max);
      return ok();
    };
  }

  function stripAI(text, ai) {
    const match = String(text).trim().match(new RegExp('^\\(' + ai + '\\)(.+)$'));
    return match ? match[1] : text;
  }

  function gtinWithAI(ai, min, max, label) {
    return function (text) {
      const cleaned = stripAI(text, ai).replace(/[\s-]/g, '');
      if (!/^\d+$/.test(cleaned)) return fail(label + ' must be digits, optionally wrapped as (' + ai + ')…');
      if (cleaned.length < min || cleaned.length > max) {
        return fail(label + ' needs ' + min + '–' + max + ' digits');
      }
      return ok();
    };
  }

  function wrapAI(ai, min, max) {
    return function (text) {
      const trimmed = String(text).trim();
      if (new RegExp('^\\(' + ai + '\\)').test(trimmed)) return trimmed;
      const cleaned = trimmed.replace(/[\s-]/g, '');
      if (new RegExp('^\\d{' + min + ',' + max + '}$').test(cleaned)) return '(' + ai + ')' + cleaned;
      return trimmed;
    };
  }

  const GROUPS = [
    { id: 'matrix', label: '2D / Matrix' },
    { id: 'linear', label: '1D / Linear' },
    { id: 'retail', label: 'Retail / GTIN' },
    { id: 'gs1', label: 'GS1' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'postal', label: 'Postal' }
  ];

  const FORMATS = [
    {
      id: 'qr',
      group: 'matrix',
      label: 'QR Code',
      engine: 'qr',
      kind: '2d',
      square: true,
      quietDefault: 4,
      hint: 'any text or URL · encoded locally from vendor/qrcode.js',
      placeholder: 'paste a url or type text...',
      validate: anyText
    },
    {
      id: 'microqrcode',
      group: 'matrix',
      label: 'Micro QR',
      engine: 'bwip',
      bcid: 'microqrcode',
      kind: '2d',
      square: true,
      quietDefault: 2,
      hint: 'short payload · versions M1–M4',
      placeholder: 'short text or digits...',
      validate: anyText
    },
    {
      id: 'rectangularmicroqrcode',
      group: 'matrix',
      label: 'rMQR',
      engine: 'bwip',
      bcid: 'rectangularmicroqrcode',
      kind: '2d',
      square: false,
      quietDefault: 2,
      hint: 'rectangular micro QR · defaults to version R7x43',
      placeholder: 'short text...',
      options: { version: 'R7x43' },
      validate: anyText
    },
    {
      id: 'datamatrix',
      group: 'matrix',
      label: 'Data Matrix',
      engine: 'bwip',
      bcid: 'datamatrix',
      kind: '2d',
      square: true,
      quietDefault: 2,
      hint: 'ECC200 · common on parts, electronics, healthcare',
      placeholder: 'serial, GTIN, or text...',
      validate: anyText
    },
    {
      id: 'datamatrixrectangular',
      group: 'matrix',
      label: 'Data Matrix (rectangular)',
      engine: 'bwip',
      bcid: 'datamatrixrectangular',
      kind: '2d',
      square: false,
      quietDefault: 2,
      hint: 'rectangular ECC200 for tight labels',
      placeholder: 'serial or text...',
      validate: anyText
    },
    {
      id: 'azteccode',
      group: 'matrix',
      label: 'Aztec Code',
      engine: 'bwip',
      bcid: 'azteccode',
      kind: '2d',
      square: true,
      quietDefault: 2,
      hint: 'no quiet zone required by spec · used on transport tickets',
      placeholder: 'ticket or text payload...',
      validate: anyText
    },
    {
      id: 'azteccodecompact',
      group: 'matrix',
      label: 'Aztec Compact',
      engine: 'bwip',
      bcid: 'azteccodecompact',
      kind: '2d',
      square: true,
      quietDefault: 2,
      hint: 'smaller Aztec variant for short payloads',
      placeholder: 'short text...',
      validate: anyText
    },
    {
      id: 'pdf417',
      group: 'matrix',
      label: 'PDF417',
      engine: 'bwip',
      bcid: 'pdf417',
      kind: '2d',
      square: false,
      quietDefault: 2,
      hint: 'stacked linear · IDs, shipping, boarding passes',
      placeholder: 'longer text payload...',
      validate: anyText
    },
    {
      id: 'pdf417compact',
      group: 'matrix',
      label: 'PDF417 Compact',
      engine: 'bwip',
      bcid: 'pdf417compact',
      kind: '2d',
      square: false,
      quietDefault: 2,
      hint: 'truncated PDF417 · narrower right-hand side',
      placeholder: 'text payload...',
      validate: anyText
    },
    {
      id: 'micropdf417',
      group: 'matrix',
      label: 'MicroPDF417',
      engine: 'bwip',
      bcid: 'micropdf417',
      kind: '2d',
      square: false,
      quietDefault: 2,
      hint: 'small stacked code · limited capacity',
      placeholder: 'short text...',
      validate: anyText
    },
    {
      id: 'maxicode',
      group: 'matrix',
      label: 'MaxiCode',
      engine: 'bwip',
      bcid: 'maxicode',
      kind: '2d',
      square: true,
      quietDefault: 1,
      hint: 'UPS-style hex mosaic · mode 4 (generic data)',
      placeholder: 'mode 4 payload...',
      options: { mode: 4 },
      validate: anyText
    },
    {
      id: 'hanxin',
      group: 'matrix',
      label: 'Han Xin',
      engine: 'bwip',
      bcid: 'hanxin',
      kind: '2d',
      square: true,
      quietDefault: 3,
      hint: 'Chinese 2D matrix · strong CJK support',
      placeholder: 'text or 汉字...',
      validate: anyText
    },
    {
      id: 'codeone',
      group: 'matrix',
      label: 'Code One',
      engine: 'bwip',
      bcid: 'codeone',
      kind: '2d',
      square: false,
      quietDefault: 2,
      hint: 'public-domain 2D matrix (versions A–H, S, T)',
      placeholder: 'text...',
      validate: anyText
    },
    {
      id: 'dotcode',
      group: 'matrix',
      label: 'DotCode',
      engine: 'bwip',
      bcid: 'dotcode',
      kind: '2d',
      square: false,
      quietDefault: 3,
      hint: 'high-speed dotted matrix · tobacco / industrial',
      placeholder: 'text or GS1 payload...',
      validate: anyText
    },
    {
      id: 'ultracode',
      group: 'matrix',
      label: 'Ultracode',
      engine: 'bwip',
      bcid: 'ultracode',
      kind: '2d',
      square: false,
      quietDefault: 2,
      hint: 'color-capable 2D (rendered here in two tones)',
      placeholder: 'text...',
      validate: anyText
    },

    {
      id: 'code128',
      group: 'linear',
      label: 'Code 128',
      engine: 'bwip',
      bcid: 'code128',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'full ASCII · shipping and warehouse workhorse',
      placeholder: 'any ASCII text...',
      validate: anyText
    },
    {
      id: 'code39',
      group: 'linear',
      label: 'Code 39',
      engine: 'bwip',
      bcid: 'code39',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'A–Z, 0–9, and - . $ / + % space',
      placeholder: 'ABC-123',
      validate: charset(/^[0-9A-Z\-.$/+% ]+$/i, 'Code 39 allows A–Z, 0–9, space, and -.$/+%')
    },
    {
      id: 'code39ext',
      group: 'linear',
      label: 'Code 39 Extended',
      engine: 'bwip',
      bcid: 'code39ext',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'full ASCII via paired Code 39 characters',
      placeholder: 'Text with case...',
      validate: anyText
    },
    {
      id: 'code93',
      group: 'linear',
      label: 'Code 93',
      engine: 'bwip',
      bcid: 'code93',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'compact Code 39 relative · A–Z, 0–9, and symbols',
      placeholder: 'ABC123',
      validate: charset(/^[0-9A-Z\-.$/+% ]+$/i, 'Code 93 allows A–Z, 0–9, space, and -.$/+%')
    },
    {
      id: 'code93ext',
      group: 'linear',
      label: 'Code 93 Extended',
      engine: 'bwip',
      bcid: 'code93ext',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'full ASCII Code 93',
      placeholder: 'Text with case...',
      validate: anyText
    },
    {
      id: 'code11',
      group: 'linear',
      label: 'Code 11',
      engine: 'bwip',
      bcid: 'code11',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'digits and dash · telecom / industrial',
      placeholder: '123-45',
      validate: charset(/^[0-9-]+$/, 'Code 11 allows digits and dash')
    },
    {
      id: 'codabar',
      group: 'linear',
      label: 'Codabar',
      engine: 'bwip',
      bcid: 'rationalizedCodabar',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'start/stop A–D · libraries, blood banks, logistics',
      placeholder: 'A123456A',
      validate: charset(/^[A-Da-d][0-9$/:.\-+]+[A-Da-d]$/, 'Codabar needs A–D start/stop around 0-9 $ / : . + -')
    },
    {
      id: 'interleaved2of5',
      group: 'linear',
      label: 'Interleaved 2 of 5',
      engine: 'bwip',
      bcid: 'interleaved2of5',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'even number of digits · cartons and industrial',
      placeholder: '123456',
      validate: evenDigits('ITF')
    },
    {
      id: 'code2of5',
      group: 'linear',
      label: 'Code 2 of 5',
      engine: 'bwip',
      bcid: 'code2of5',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'industrial / standard 2 of 5 · digits only',
      placeholder: '12345',
      validate: digits(1, 32, 'Code 2 of 5')
    },
    {
      id: 'industrial2of5',
      group: 'linear',
      label: 'Industrial 2 of 5',
      engine: 'bwip',
      bcid: 'industrial2of5',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'wide-bar 2 of 5 · digits only',
      placeholder: '12345',
      validate: digits(1, 32, 'Industrial 2 of 5')
    },
    {
      id: 'msi',
      group: 'linear',
      label: 'MSI Plessey',
      engine: 'bwip',
      bcid: 'msi',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'digits · retail shelves / inventory',
      placeholder: '1234567',
      validate: digits(1, 18, 'MSI')
    },
    {
      id: 'plessey',
      group: 'linear',
      label: 'Plessey',
      engine: 'bwip',
      bcid: 'plessey',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'hex digits 0–9 A–F',
      placeholder: 'A1B2C3',
      validate: charset(/^[0-9A-Fa-f]+$/, 'Plessey allows hex digits 0–9 A–F')
    },
    {
      id: 'telepen',
      group: 'linear',
      label: 'Telepen',
      engine: 'bwip',
      bcid: 'telepen',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'full ASCII · libraries (UK / Europe)',
      placeholder: 'text...',
      validate: anyText
    },
    {
      id: 'codablockf',
      group: 'linear',
      label: 'Codablock F',
      engine: 'bwip',
      bcid: 'codablockf',
      kind: '2d',
      square: false,
      includeText: false,
      quietDefault: 2,
      hint: 'stacked Code 128 rows',
      placeholder: 'longer ASCII text...',
      validate: anyText
    },

    {
      id: 'ean13',
      group: 'retail',
      label: 'EAN-13',
      engine: 'bwip',
      bcid: 'ean13',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: '12 digits + optional check digit',
      placeholder: '5901234123457',
      validate: digits(12, 13, 'EAN-13')
    },
    {
      id: 'ean8',
      group: 'retail',
      label: 'EAN-8',
      engine: 'bwip',
      bcid: 'ean8',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: '7 digits + optional check digit',
      placeholder: '96385074',
      validate: digits(7, 8, 'EAN-8')
    },
    {
      id: 'ean14',
      group: 'retail',
      label: 'EAN-14 / GTIN-14',
      engine: 'bwip',
      bcid: 'ean14',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: '13–14 digit GTIN · (01) prefix added if missing',
      placeholder: '(01)1234567890123',
      normalize: wrapAI('01', 13, 14),
      validate: gtinWithAI('01', 13, 14, 'EAN-14')
    },
    {
      id: 'upca',
      group: 'retail',
      label: 'UPC-A',
      engine: 'bwip',
      bcid: 'upca',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: '11 digits + optional check digit',
      placeholder: '036000291452',
      validate: digits(11, 12, 'UPC-A')
    },
    {
      id: 'upce',
      group: 'retail',
      label: 'UPC-E',
      engine: 'bwip',
      bcid: 'upce',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: '6–8 digits (compressed UPC)',
      placeholder: '04252614',
      validate: digits(6, 8, 'UPC-E')
    },
    {
      id: 'itf14',
      group: 'retail',
      label: 'ITF-14',
      engine: 'bwip',
      bcid: 'itf14',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'carton GTIN · 13 digits + optional check',
      placeholder: '15400141288763',
      validate: digits(13, 14, 'ITF-14')
    },
    {
      id: 'isbn',
      group: 'retail',
      label: 'ISBN',
      engine: 'bwip',
      bcid: 'isbn',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'ISBN-10 or ISBN-13 · hyphens optional',
      placeholder: '978-0-306-40615-7',
      validate: function (text) {
        const cleaned = String(text).replace(/[\s-]/g, '');
        if (!/^\d{9}[\dXx]$/.test(cleaned) && !/^\d{12,13}$/.test(cleaned)) {
          return fail('ISBN needs 10 or 13 digits');
        }
        return ok();
      }
    },
    {
      id: 'issn',
      group: 'retail',
      label: 'ISSN',
      engine: 'bwip',
      bcid: 'issn',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: '8-digit serial identifier · hyphen optional',
      placeholder: '0317-8471',
      validate: function (text) {
        const cleaned = String(text).replace(/[\s-]/g, '');
        if (!/^\d{7}[\dXx]$/.test(cleaned)) return fail('ISSN needs 8 characters (digits / X)');
        return ok();
      }
    },
    {
      id: 'ismn',
      group: 'retail',
      label: 'ISMN',
      engine: 'bwip',
      bcid: 'ismn',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'printed music · ISBN-style 979… or M- hyphenated form',
      placeholder: '979-0-2600-0043-8',
      validate: function (text) {
        const cleaned = String(text).replace(/[\s-]/g, '');
        if (!/^\d{9,13}$/.test(cleaned)) return fail('ISMN needs 10 or 13 digits');
        return ok();
      }
    },
    {
      id: 'sscc18',
      group: 'retail',
      label: 'SSCC-18',
      engine: 'bwip',
      bcid: 'sscc18',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: '17–18 digits · (00) prefix added if missing',
      placeholder: '(00)106141412345678908',
      normalize: wrapAI('00', 17, 18),
      validate: gtinWithAI('00', 17, 18, 'SSCC-18')
    },

    {
      id: 'gs1-128',
      group: 'gs1',
      label: 'GS1-128',
      engine: 'bwip',
      bcid: 'gs1-128',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'AI syntax, e.g. (01)09501101530003',
      placeholder: '(01)09501101530003',
      validate: anyText
    },
    {
      id: 'gs1datamatrix',
      group: 'gs1',
      label: 'GS1 Data Matrix',
      engine: 'bwip',
      bcid: 'gs1datamatrix',
      kind: '2d',
      square: true,
      quietDefault: 2,
      hint: 'GS1 AI syntax in a Data Matrix',
      placeholder: '(01)09501101530003',
      validate: anyText
    },
    {
      id: 'gs1qrcode',
      group: 'gs1',
      label: 'GS1 QR Code',
      engine: 'bwip',
      bcid: 'gs1qrcode',
      kind: '2d',
      square: true,
      quietDefault: 4,
      hint: 'GS1 Digital Link / AI syntax in a QR',
      placeholder: '(01)09501101530003',
      validate: anyText
    },
    {
      id: 'databaromni',
      group: 'gs1',
      label: 'GS1 DataBar Omnidirectional',
      engine: 'bwip',
      bcid: 'databaromni',
      kind: '1d',
      includeText: true,
      quietDefault: 8,
      hint: '13–14 digit GTIN · (01) prefix added if missing',
      placeholder: '(01)00012345678905',
      normalize: wrapAI('01', 13, 14),
      validate: gtinWithAI('01', 13, 14, 'GS1 DataBar')
    },
    {
      id: 'databarexpanded',
      group: 'gs1',
      label: 'GS1 DataBar Expanded',
      engine: 'bwip',
      bcid: 'databarexpanded',
      kind: '1d',
      includeText: true,
      quietDefault: 8,
      hint: 'multiple AIs · weight, lots, expiry',
      placeholder: '(01)09501101530003(3103)000123',
      validate: anyText
    },

    {
      id: 'pharmacode',
      group: 'healthcare',
      label: 'Pharmacode',
      engine: 'bwip',
      bcid: 'pharmacode',
      kind: '1d',
      includeText: true,
      quietDefault: 8,
      hint: 'integer 3–131070 · pharma packaging',
      placeholder: '117480',
      validate: rangeInt(3, 131070, 'Pharmacode')
    },
    {
      id: 'pharmacode2',
      group: 'healthcare',
      label: 'Pharmacode (two-track)',
      engine: 'bwip',
      bcid: 'pharmacode2',
      kind: '1d',
      includeText: true,
      quietDefault: 8,
      hint: 'two-track pharmacode · integer 4–64570080',
      placeholder: '117480',
      validate: rangeInt(4, 64570080, 'Two-track pharmacode')
    },
    {
      id: 'pzn',
      group: 'healthcare',
      label: 'PZN',
      engine: 'bwip',
      bcid: 'pzn',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: 'German Pharmazentralnummer · 7 or 8 digits',
      placeholder: '2758089',
      validate: digits(7, 8, 'PZN')
    },
    {
      id: 'code32',
      group: 'healthcare',
      label: 'Code 32 (Italian pharmacode)',
      engine: 'bwip',
      bcid: 'code32',
      kind: '1d',
      includeText: true,
      quietDefault: 10,
      hint: '8 or 9 digits · Italian pharmaceutical',
      placeholder: '01234567',
      validate: digits(8, 9, 'Code 32')
    },

    {
      id: 'onecode',
      group: 'postal',
      label: 'USPS Intelligent Mail',
      engine: 'bwip',
      bcid: 'onecode',
      kind: '1d',
      includeText: true,
      quietDefault: 4,
      hint: '20, 25, 29 or 31 digits',
      placeholder: '01234567094987654321',
      validate: function (text) {
        const cleaned = String(text).replace(/\s/g, '');
        if (!/^\d+$/.test(cleaned)) return fail('Intelligent Mail must be digits');
        if ([20, 25, 29, 31].indexOf(cleaned.length) === -1) {
          return fail('Intelligent Mail needs 20, 25, 29, or 31 digits');
        }
        return ok();
      }
    },
    {
      id: 'postnet',
      group: 'postal',
      label: 'USPS POSTNET',
      engine: 'bwip',
      bcid: 'postnet',
      kind: '1d',
      includeText: true,
      quietDefault: 6,
      hint: 'ZIP 5, ZIP+4 (9), or ZIP+4+2 (11) digits',
      placeholder: '12345',
      validate: function (text) {
        const cleaned = String(text).replace(/[\s-]/g, '');
        if (!/^\d+$/.test(cleaned)) return fail('POSTNET must be digits');
        if ([5, 9, 11].indexOf(cleaned.length) === -1) return fail('POSTNET needs 5, 9, or 11 digits');
        return ok();
      }
    },
    {
      id: 'planet',
      group: 'postal',
      label: 'USPS PLANET',
      engine: 'bwip',
      bcid: 'planet',
      kind: '1d',
      includeText: true,
      quietDefault: 6,
      hint: '11 or 13 digits (check digit optional)',
      placeholder: '40123456784',
      validate: function (text) {
        const cleaned = String(text).replace(/[\s-]/g, '');
        if (!/^\d+$/.test(cleaned)) return fail('PLANET must be digits');
        if (cleaned.length !== 11 && cleaned.length !== 13) return fail('PLANET needs 11 or 13 digits');
        return ok();
      }
    },
    {
      id: 'royalmail',
      group: 'postal',
      label: 'Royal Mail 4-State',
      engine: 'bwip',
      bcid: 'royalmail',
      kind: '1d',
      includeText: true,
      quietDefault: 6,
      hint: 'alphanumeric UK postal customer code',
      placeholder: 'LE28HS9Z',
      validate: charset(/^[0-9A-Za-z]+$/, 'Royal Mail allows letters and digits')
    },
    {
      id: 'kix',
      group: 'postal',
      label: 'KIX (Dutch Post)',
      engine: 'bwip',
      bcid: 'kix',
      kind: '1d',
      includeText: true,
      quietDefault: 6,
      hint: 'Royal Dutch TPG Post customer code',
      placeholder: '1231FJ1A',
      validate: charset(/^[0-9A-Za-z]+$/, 'KIX allows letters and digits')
    },
    {
      id: 'auspost',
      group: 'postal',
      label: 'Australia Post',
      engine: 'bwip',
      bcid: 'auspost',
      kind: '1d',
      includeText: true,
      quietDefault: 6,
      hint: 'FCC + DPID, e.g. 5956439111 or 62... customer info',
      placeholder: '5956439111',
      validate: anyText
    },
    {
      id: 'japanpost',
      group: 'postal',
      label: 'Japan Post',
      engine: 'bwip',
      bcid: 'japanpost',
      kind: '1d',
      includeText: true,
      quietDefault: 6,
      hint: '7-digit JP postcode plus optional address data',
      placeholder: '6540123789-A-K-Z',
      validate: anyText
    }
  ];

  const BY_ID = {};
  FORMATS.forEach(function (format) {
    BY_ID[format.id] = format;
  });

  function get(id) {
    return BY_ID[id] || BY_ID.qr;
  }

  function search(query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return FORMATS.slice();
    return FORMATS.filter(function (format) {
      return format.label.toLowerCase().indexOf(q) !== -1 ||
        format.id.toLowerCase().indexOf(q) !== -1 ||
        (format.bcid && format.bcid.toLowerCase().indexOf(q) !== -1) ||
        format.hint.toLowerCase().indexOf(q) !== -1;
    });
  }

  function validate(id, text) {
    const format = get(id);
    const value = String(text || '').trim();
    if (!value) return fail('enter some text');
    return format.validate(value);
  }

  function fileStem(id) {
    return (get(id).id || 'code').replace(/[^a-z0-9-]+/gi, '-');
  }

  CB.formats = {
    GROUPS: GROUPS,
    list: FORMATS,
    byId: BY_ID,
    get: get,
    search: search,
    validate: validate,
    fileStem: fileStem
  };
})(typeof window !== 'undefined' ? window : globalThis);
