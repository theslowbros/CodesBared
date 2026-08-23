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
    { id: 'qr', label: 'QR Code', short: 'QR' },
    { id: 'matrix', label: '2D / Matrix', short: '2D' },
    { id: 'linear', label: '1D / Linear', short: '1D' },
    { id: 'retail', label: 'Retail / GTIN', short: 'Retail' },
    { id: 'gs1', label: 'GS1', short: 'GS1' },
    { id: 'healthcare', label: 'Healthcare', short: 'Health' },
    { id: 'postal', label: 'Postal', short: 'Post' }
  ];

  const FORMATS = [
    {
      id: 'qr',
      group: 'qr',
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

  const SHORT = {
    datamatrixrectangular: 'DM Rect',
    azteccodecompact: 'Aztec Compact',
    pdf417compact: 'PDF417 Compact',
    micropdf417: 'MicroPDF417',
    rectangularmicroqrcode: 'rMQR',
    code39ext: 'Code 39 Ext',
    code93ext: 'Code 93 Ext',
    interleaved2of5: 'ITF',
    industrial2of5: 'Ind 2 of 5',
    code2of5: 'Code 2 of 5',
    codablockf: 'Codablock F',
    gs1datamatrix: 'GS1 DM',
    gs1qrcode: 'GS1 QR',
    databaromni: 'DataBar Omni',
    databarexpanded: 'DataBar Exp',
    pharmacode2: 'Pharmacode 2',
    code32: 'Code 32',
    onecode: 'USPS IMb',
    royalmail: 'Royal Mail',
    japanpost: 'Japan Post',
    auspost: 'AusPost'
  };

  const SAMPLES = {
    qr: 'https://example.com',
    microqrcode: 'HELLO',
    rectangularmicroqrcode: 'ABC123',
    datamatrix: 'DM-TEST-001',
    datamatrixrectangular: 'DM-RECT-001',
    azteccode: 'AZTEC-TICKET',
    azteccodecompact: 'AZC',
    pdf417: 'PDF417 sample payload',
    pdf417compact: 'PDF417C',
    micropdf417: 'uPDF',
    maxicode: 'MaxiCode mode 4',
    hanxin: 'HanXin',
    codeone: 'CODEONE',
    dotcode: 'DOTCODE',
    ultracode: 'ULTRA',
    code128: 'HELLO-128',
    code39: 'ABC-123',
    code39ext: 'Aa-123',
    code93: 'ABC123',
    code93ext: 'Aa123',
    code11: '123-45',
    codabar: 'A123456A',
    interleaved2of5: '123456',
    code2of5: '12345',
    industrial2of5: '12345',
    msi: '1234567',
    plessey: 'A1B2C3',
    telepen: 'TELEPEN',
    codablockf: 'CODABLOCK-F',
    ean13: '5901234123457',
    ean8: '96385074',
    ean14: '(01)1234567890123',
    upca: '036000291452',
    upce: '04252614',
    itf14: '15400141288763',
    isbn: '978-0-306-40615-7',
    issn: '0317-8471',
    ismn: '979-0-2600-0043-8',
    sscc18: '(00)106141412345678908',
    'gs1-128': '(01)09501101530003',
    gs1datamatrix: '(01)09501101530003',
    gs1qrcode: '(01)09501101530003',
    databaromni: '(01)00012345678905',
    databarexpanded: '(01)09501101530003(3103)000123',
    pharmacode: '117480',
    pharmacode2: '117480',
    pzn: '2758089',
    code32: '01234567',
    onecode: '01234567094987654321',
    postnet: '12345',
    planet: '40123456784',
    royalmail: 'LE28HS9Z',
    kix: '1231FJ1A',
    auspost: '5956439111',
    japanpost: '6540123789-A-K-Z'
  };

  function addBwip(id, group, label, kind, spec) {
    spec = spec || {};
    FORMATS.push({
      id: id,
      group: group,
      label: label,
      engine: 'bwip',
      bcid: spec.bcid || id,
      kind: kind,
      square: !!spec.square,
      includeText: spec.includeText != null ? spec.includeText : kind === '1d',
      quietDefault: spec.quiet != null ? spec.quiet : (kind === '1d' ? 10 : 2),
      hint: spec.hint || label,
      placeholder: spec.placeholder || spec.sample || '',
      validate: spec.validate || anyText,
      normalize: spec.normalize,
      options: spec.options
    });
    if (spec.short) SHORT[id] = spec.short;
    if (spec.sample) SAMPLES[id] = spec.sample;
  }

  const hibc = charset(/^\+[A-Za-z0-9][A-Za-z0-9-.\/+$ ]*$/, 'HIBC starts with + then the label');
  const composite = charset(/^.+\|.+$/, 'composite needs primary|secondary data');

  addBwip('aztecrune', 'matrix', 'Aztec Rune', '2d', {
    square: true, quiet: 2, short: 'Aztec Rune', sample: '1',
    hint: 'Aztec rune 0–255', placeholder: '0–255', validate: rangeInt(0, 255, 'Aztec rune')
  });
  addBwip('datamatrixrectangularextension', 'matrix', 'Data Matrix (DMRE)', '2d', {
    short: 'DMRE', sample: 'DM-RECT-EXT',
    hint: 'Data Matrix Rectangular Extension'
  });
  addBwip('swissqrcode', 'matrix', 'Swiss QR', '2d', {
    square: true, quiet: 4, short: 'Swiss QR',
    sample: 'SPC\n0200\n1\nCH5800791123000889012\nS\nRobert Schneider AG\nRue du Lac\n1268\n2501\nBiel\nCH\n\n\n\n\n\n\n\n1949.75\nCHF\nS\nPia-Maria Rutschmann-Schnyder\nGrosse Marktgasse\n28\n9400\nRorschach\nCH\nQRR\n210000000003139471430009017\nOrder 15\nEPD',
    hint: 'Swiss Payment Code (SPC) payload',
    placeholder: 'SPC ...',
    validate: charset(/^SPC\b/, 'Swiss QR starts with SPC')
  });

  addBwip('code16k', 'linear', 'Code 16K', '2d', {
    includeText: false, quiet: 2, sample: 'HELLO', hint: 'stacked multi-row 1D'
  });
  addBwip('code49', 'linear', 'Code 49', '2d', {
    includeText: false, quiet: 2, sample: 'HELLO', hint: 'stacked multi-row 1D'
  });
  addBwip('bc412', 'linear', 'BC412', '1d', {
    sample: 'BC412', hint: 'semiconductor / wafer ID',
    validate: charset(/^[0-9A-Z]+$/i, 'BC412 allows digits and A–Z')
  });
  addBwip('channelcode', 'linear', 'Channel Code', '1d', {
    sample: '12', hint: 'digits · compact channel encoding', validate: digits(1, 7, 'Channel Code')
  });
  addBwip('coop2of5', 'linear', 'COOP 2 of 5', '1d', {
    sample: '123456', hint: 'digits', validate: digits(1, 32, 'COOP 2 of 5')
  });
  addBwip('datalogic2of5', 'linear', 'Datalogic 2 of 5', '1d', {
    short: 'DL 2 of 5', sample: '12345', hint: 'digits', validate: digits(1, 32, 'Datalogic 2 of 5')
  });
  addBwip('iata2of5', 'linear', 'IATA 2 of 5', '1d', {
    sample: '12345', hint: 'airline cargo · digits', validate: digits(1, 32, 'IATA 2 of 5')
  });
  addBwip('matrix2of5', 'linear', 'Matrix 2 of 5', '1d', {
    sample: '12345', hint: 'digits', validate: digits(1, 32, 'Matrix 2 of 5')
  });
  addBwip('posicode', 'linear', 'PosiCode', '1d', {
    sample: 'POSICODE', hint: 'full ASCII industrial'
  });
  addBwip('telepennumeric', 'linear', 'Telepen Numeric', '1d', {
    short: 'Telepen #', sample: '123456', hint: 'digits', validate: digits(1, 32, 'Telepen Numeric')
  });
  addBwip('flattermarken', 'linear', 'Flattermarken', '1d', {
    sample: '1', hint: 'printer signature marks · digits', validate: digits(1, 8, 'Flattermarken')
  });
  addBwip('daft', 'postal', 'DAFT', '1d', {
    sample: 'DADT', quiet: 6, hint: 'custom 4-state using D/A/F/T bars',
    validate: charset(/^[DAFTdaft]+$/, 'DAFT uses only D, A, F, T')
  });

  addBwip('ean2', 'retail', 'EAN-2', '1d', {
    sample: '12', hint: '2-digit add-on', validate: digits(2, 2, 'EAN-2')
  });
  addBwip('ean5', 'retail', 'EAN-5', '1d', {
    sample: '12345', hint: '5-digit add-on', validate: digits(5, 5, 'EAN-5')
  });
  addBwip('ean13composite', 'retail', 'EAN-13 Composite', '1d', {
    short: 'EAN-13 CC', sample: '5901234123457|(99)1234-abcd',
    hint: 'EAN-13 plus CC-A/B', validate: composite
  });
  addBwip('ean8composite', 'retail', 'EAN-8 Composite', '1d', {
    short: 'EAN-8 CC', sample: '96385074|(21)A12345678',
    hint: 'EAN-8 plus CC-A/B', validate: composite
  });
  addBwip('upcacomposite', 'retail', 'UPC-A Composite', '1d', {
    short: 'UPC-A CC', sample: '036000291452|(99)1234-abcd',
    hint: 'UPC-A plus CC-A/B', validate: composite
  });
  addBwip('upcecomposite', 'retail', 'UPC-E Composite', '1d', {
    short: 'UPC-E CC', sample: '04252614|(21)A12345678',
    hint: 'UPC-E plus CC-A/B', validate: composite
  });

  addBwip('databarlimited', 'gs1', 'GS1 DataBar Limited', '1d', {
    short: 'DataBar Ltd', sample: '(01)15012345678907',
    hint: 'GTIN with indicator 0 or 1', validate: anyText
  });
  addBwip('databarstacked', 'gs1', 'GS1 DataBar Stacked', '1d', {
    short: 'DataBar Stack', sample: '(01)00012345678905', hint: 'two-row DataBar'
  });
  addBwip('databarstackedomni', 'gs1', 'GS1 DataBar Stacked Omni', '1d', {
    short: 'DataBar Stack Omni', sample: '(01)00012345678905', hint: 'two-row omnidirectional'
  });
  addBwip('databartruncated', 'gs1', 'GS1 DataBar Truncated', '1d', {
    short: 'DataBar Trunc', sample: '(01)00012345678905', hint: 'shorter DataBar height'
  });
  addBwip('databarexpandedstacked', 'gs1', 'GS1 DataBar Expanded Stacked', '1d', {
    short: 'DataBar Exp Stack', sample: '(01)09501101530003(3103)000123',
    hint: 'multi-row expanded DataBar'
  });
  addBwip('databaromnicomposite', 'gs1', 'GS1 DataBar Omni Composite', '1d', {
    short: 'DataBar Omni CC', sample: '(01)00012345678905|(21)A123', validate: composite
  });
  addBwip('databarlimitedcomposite', 'gs1', 'GS1 DataBar Limited Composite', '1d', {
    short: 'DataBar Ltd CC', sample: '(01)15012345678907|(21)A123', validate: composite
  });
  addBwip('databarexpandedcomposite', 'gs1', 'GS1 DataBar Expanded Composite', '1d', {
    short: 'DataBar Exp CC', sample: '(01)09501101530003(3103)000123|(10)ABC', validate: composite
  });
  addBwip('gs1-128composite', 'gs1', 'GS1-128 Composite', '1d', {
    short: 'GS1-128 CC', sample: '(01)09501101530003|(10)ABC123', validate: composite
  });
  addBwip('gs1datamatrixrectangular', 'gs1', 'GS1 Data Matrix (rect)', '2d', {
    short: 'GS1 DM Rect', sample: '(01)09501101530003', hint: 'rectangular GS1 Data Matrix'
  });
  addBwip('gs1dldatamatrix', 'gs1', 'GS1 Digital Link DM', '2d', {
    square: true, short: 'GS1 DL DM', sample: 'https://id.gs1.org/01/09501101530003',
    hint: 'Digital Link URL in Data Matrix',
    validate: charset(/^https?:\/\//i, 'Digital Link is an https URL')
  });
  addBwip('gs1dlqrcode', 'gs1', 'GS1 Digital Link QR', '2d', {
    square: true, quiet: 4, short: 'GS1 DL QR', sample: 'https://id.gs1.org/01/09501101530003',
    hint: 'Digital Link URL in QR',
    validate: charset(/^https?:\/\//i, 'Digital Link is an https URL')
  });
  addBwip('gs1dotcode', 'gs1', 'GS1 DotCode', '2d', {
    short: 'GS1 DotCode', sample: '(01)09501101530003', hint: 'GS1 in DotCode'
  });

  addBwip('hibcqrcode', 'healthcare', 'HIBC QR', '2d', {
    square: true, quiet: 4, sample: '+A123ABCDE1', validate: hibc, hint: 'HIBC in QR'
  });
  addBwip('hibcdatamatrix', 'healthcare', 'HIBC Data Matrix', '2d', {
    square: true, sample: '+A123ABCDE1', validate: hibc
  });
  addBwip('hibcdatamatrixrectangular', 'healthcare', 'HIBC Data Matrix (rect)', '2d', {
    short: 'HIBC DM Rect', sample: '+A123ABCDE1', validate: hibc
  });
  addBwip('hibcazteccode', 'healthcare', 'HIBC Aztec', '2d', {
    square: true, sample: '+A123ABCDE1', validate: hibc
  });
  addBwip('hibcpdf417', 'healthcare', 'HIBC PDF417', '2d', {
    sample: '+A123ABCDE1', validate: hibc
  });
  addBwip('hibcmicropdf417', 'healthcare', 'HIBC MicroPDF417', '2d', {
    short: 'HIBC uPDF', sample: '+A123ABCDE1', validate: hibc
  });
  addBwip('hibccode128', 'healthcare', 'HIBC Code 128', '1d', {
    sample: '+A123ABCDE1', validate: hibc
  });
  addBwip('hibccode39', 'healthcare', 'HIBC Code 39', '1d', {
    sample: '+A123ABCDE1', validate: hibc
  });
  addBwip('hibccodablockf', 'healthcare', 'HIBC Codablock F', '2d', {
    short: 'HIBC CBF', includeText: false, sample: '+A123ABCDE1', validate: hibc
  });

  addBwip('identcode', 'postal', 'Deutsche Post Identcode', '1d', {
    short: 'Identcode', sample: '12345678901', quiet: 8,
    hint: '11–12 digits', validate: digits(11, 12, 'Identcode')
  });
  addBwip('leitcode', 'postal', 'Deutsche Post Leitcode', '1d', {
    short: 'Leitcode', sample: '1234567890123', quiet: 8,
    hint: '13–14 digits', validate: digits(13, 14, 'Leitcode')
  });

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
      const short = SHORT[format.id] || '';
      const aboutText = ABOUT[format.id] || '';
      return format.label.toLowerCase().indexOf(q) !== -1 ||
        short.toLowerCase().indexOf(q) !== -1 ||
        format.id.toLowerCase().indexOf(q) !== -1 ||
        (format.bcid && format.bcid.toLowerCase().indexOf(q) !== -1) ||
        format.hint.toLowerCase().indexOf(q) !== -1 ||
        aboutText.toLowerCase().indexOf(q) !== -1;
    });
  }

  const ABOUT = {
    qr: 'Any text, URL, Wi-Fi, vCard, or other payload. General-purpose 2D code for phones, posters, and packaging.',
    microqrcode: 'A short string or number (versions M1–M4). Compact QR for tiny labels and electronics.',
    rectangularmicroqrcode: 'Short text in a wide rectangle. Used where a square QR will not fit.',
    datamatrix: 'Short industrial text or IDs. Parts marking, electronics, and healthcare labels.',
    datamatrixrectangular: 'Same Data Matrix payload in a wide rectangle for narrow parts.',
    datamatrixrectangularextension: 'Longer Data Matrix text in extra-wide DMRE rectangles.',
    azteccode: 'Ticket and travel text. Boarding passes, transit tickets, and event stubs.',
    azteccodecompact: 'A short Aztec payload for small tickets.',
    aztecrune: 'A whole number from 0–255. Special compact Aztec marker.',
    pdf417: 'Longer text or IDs stacked in rows. Driver licenses, boarding passes, and inventory.',
    pdf417compact: 'A shorter PDF417 for tighter labels.',
    micropdf417: 'Very short stacked 2D data for small healthcare or industrial labels.',
    maxicode: 'Shipping address and service data (UPS-style, modes 2–4). Parcel sortation.',
    hanxin: 'Chinese and Latin text. Logistics and marketing codes used in China.',
    codeone: 'Industrial 2D text used in closed marking systems.',
    dotcode: 'High-speed printed dots. Tobacco and other fast production lines.',
    ultracode: 'Color 2D with high data density for industrial tracking.',
    swissqrcode: 'A Swiss Payment Code: IBAN, creditor, amount, currency, debtor, and reference, one field per line. Used on Swiss QR-bills so banking apps can pay an invoice.',
    code128: 'Any ASCII text. Warehousing, shipping labels, and general 1D barcodes.',
    code39: 'A–Z, 0–9, and a few marks. Legacy industrial and military labels.',
    code39ext: 'Full ASCII via Code 39 pair encoding. Older systems that need lowercase or punctuation.',
    code93: 'Compact alphanumeric industrial labels.',
    code93ext: 'Full ASCII Code 93 for denser legacy labels.',
    code11: 'Digits and dashes. Telecom equipment labeling.',
    codabar: 'Digits with A–D start and stop letters. Libraries, blood banks, and airbills.',
    interleaved2of5: 'An even number of digits. Cartons and industrial numeric tracking.',
    code2of5: 'Digits in discrete 2 of 5. Older industrial numbering.',
    industrial2of5: 'Digits in industrial 2 of 5. Factory and warehouse labels.',
    coop2of5: 'Digits in the COOP 2 of 5 variant.',
    datalogic2of5: 'Digits in the Datalogic 2 of 5 variant.',
    iata2of5: 'Digits in IATA 2 of 5. Older airline cargo labels.',
    matrix2of5: 'Digits in Matrix 2 of 5.',
    msi: 'Digits only. Shelf labels and inventory.',
    plessey: 'Hex digits. Legacy library and retail spine labels.',
    telepen: 'ASCII text. UK library barcodes.',
    telepennumeric: 'An even number of digits in numeric Telepen.',
    codablockf: 'Multi-row Code 128 stacked for more data in less width.',
    code16k: 'Stacked 1D rows for more data on a short label.',
    code49: 'Stacked 1D from Intermec for compact industrial text.',
    bc412: 'Alphanumeric wafer IDs (no letter O). Semiconductor tracking.',
    channelcode: 'A channel-width number from 10–26. Specialty width encoding.',
    posicode: 'Alphanumeric POS / shelf codes.',
    flattermarken: 'A short digit run. Book-binding collation marks.',
    daft: 'The letters D, A, F, and T. Generic 4-state postal tester.',
    ean13: 'A 12–13 digit GTIN. Retail products worldwide.',
    ean8: 'A 7–8 digit GTIN. Small retail packages.',
    ean14: 'A GTIN-14, often written as (01)…. Trade items and cartons in GS1.',
    ean2: 'A 2-digit add-on. Magazine issue numbers next to an EAN.',
    ean5: 'A 5-digit add-on. Suggested price next to an EAN.',
    upca: 'An 11–12 digit UPC. North American retail products.',
    upce: 'A compressed 6–8 digit UPC for small packages.',
    itf14: 'A 13–14 digit GTIN with no GS1 prefix. Printed on corrugated shipping cases so warehouses can scan the outer pack.',
    isbn: 'An ISBN-13 (book number), often hyphenated. Book-trade checkout.',
    issn: 'An 8-character ISSN (last may be X). Magazines and other serials.',
    ismn: 'An ISMN for printed music.',
    ean13composite: 'An EAN-13 plus a GS1 2D composite (primary|secondary). Extra lot or date on a retail pack.',
    ean8composite: 'An EAN-8 plus a GS1 2D composite (primary|secondary).',
    upcacomposite: 'A UPC-A plus a GS1 2D composite (primary|secondary).',
    upcecomposite: 'A UPC-E plus a GS1 2D composite (primary|secondary).',
    sscc18: 'AI (00) plus an 18-digit SSCC. Pallet and logistics-unit tracking.',
    'gs1-128': 'GS1 Application Identifiers in Code 128, e.g. (01)GTIN. Shipping and warehouse labels.',
    gs1datamatrix: 'GS1 AIs in a Data Matrix. Healthcare and retail item marking.',
    gs1qrcode: 'GS1 AIs in a QR Code. Consumer and supply-chain scanning.',
    gs1datamatrixrectangular: 'GS1 AIs in a rectangular Data Matrix.',
    gs1dldatamatrix: 'A GS1 Digital Link URL (https://id.gs1.org/01/…). Resolves a product to the web.',
    gs1dlqrcode: 'A GS1 Digital Link URL in a QR Code. Product pages and traceability.',
    gs1dotcode: 'GS1 AIs in DotCode. High-speed GS1 marking.',
    databaromni: 'GTIN as (01) in GS1 DataBar Omnidirectional. Fresh food and coupons.',
    databarlimited: 'A restricted-range GTIN as (01) in DataBar Limited. Small loose items.',
    databarstacked: 'GTIN as (01) in two-row DataBar. Very small packs.',
    databarstackedomni: 'GTIN as (01) in stacked omnidirectional DataBar.',
    databartruncated: 'GTIN as (01) in a short DataBar. Tight label height.',
    databarexpanded: 'Several GS1 AIs, e.g. (01)GTIN(3103)weight. Variable-measure retail.',
    databarexpandedstacked: 'Expanded DataBar stacked into extra rows.',
    databaromnicomposite: 'DataBar Omni plus a GS1 2D composite (primary|secondary).',
    databarlimitedcomposite: 'DataBar Limited plus a GS1 2D composite (primary|secondary).',
    databarexpandedcomposite: 'Expanded DataBar plus a GS1 2D composite (primary|secondary).',
    'gs1-128composite': 'GS1-128 plus a GS1 2D composite (primary|secondary).',
    pharmacode: 'An integer from 3–131070 as binary bars. Pharma packaging control.',
    pharmacode2: 'A larger integer as two-track pharmacode. Pharma pack lines.',
    pzn: 'A 7-digit German Pharmazentralnummer (check included). Pharmacy products in DE/AT.',
    code32: 'An 8-digit Italian pharmaceutical code (MINSAN / Code 32).',
    hibcqrcode: 'A HIBC label starting with +. Healthcare inventory in a QR Code.',
    hibcdatamatrix: 'A HIBC label starting with +. Healthcare inventory in Data Matrix.',
    hibcdatamatrixrectangular: 'A HIBC label in a rectangular Data Matrix.',
    hibcazteccode: 'A HIBC label in Aztec.',
    hibcpdf417: 'A HIBC label in PDF417.',
    hibcmicropdf417: 'A HIBC label in MicroPDF417.',
    hibccode128: 'A HIBC label in Code 128.',
    hibccode39: 'A HIBC label in Code 39.',
    hibccodablockf: 'A HIBC label in Codablock F.',
    onecode: '20 digits for the USPS Intelligent Mail barcode. US letter and flat mail.',
    postnet: 'A US ZIP of 5, 9, or 11 digits. Legacy USPS routing.',
    planet: '11 or 13 digits. Legacy USPS PLANET confirmations.',
    royalmail: 'Alphanumeric UK postcode data (RM4SCC). Royal Mail letters.',
    kix: 'Dutch postcode and house data (KIX).',
    auspost: 'Australia Post DPN digits (often starting 59…).',
    japanpost: 'Japan Post customer barcode (digits plus A–Z marks).',
    identcode: '11 digits. Deutsche Post Identcode for domestic parcels.',
    leitcode: '13 digits. Deutsche Post Leitcode routing.'
  };

  function about(formatOrId) {
    const format = resolveFormat(formatOrId) || BY_ID.qr;
    return ABOUT[format.id] || format.hint || format.label;
  }

  function validate(id, text) {
    const format = get(id);
    let value = String(text || '').trim();
    if (format.normalize) value = format.normalize(value);
    if (!value) return fail('enter some text');
    return format.validate(value);
  }

  function fileStem(id) {
    return (get(id).id || 'code').replace(/[^a-z0-9-]+/gi, '-');
  }

  function displayName(formatOrId) {
    const format = typeof formatOrId === 'string' ? get(formatOrId) : formatOrId;
    return SHORT[format.id] || format.label;
  }

  function sample(formatOrId) {
    const format = typeof formatOrId === 'string' ? get(formatOrId) : formatOrId;
    return SAMPLES[format.id] || format.placeholder;
  }

  function payload(formatOrId) {
    const format = typeof formatOrId === 'string' ? get(formatOrId) : formatOrId;
    const text = sample(format);
    return format.normalize ? format.normalize(text) : text;
  }

  function resolveFormat(formatOrId) {
    if (formatOrId == null) return null;
    if (typeof formatOrId === 'string') return get(formatOrId);
    if (typeof formatOrId === 'object' && formatOrId.kind) return formatOrId;
    return null;
  }

  function quietMax(formatOrId) {
    const format = resolveFormat(formatOrId) || BY_ID.qr;
    return format.kind === '1d' ? 20 : 10;
  }

  function quietUnit(formatOrId) {
    const format = resolveFormat(formatOrId) || BY_ID.qr;
    return format.kind === '1d' ? 'X' : 'modules';
  }

  function clampQuiet(value, formatOrId) {
    const max = quietMax(formatOrId);
    const n = Math.round(Number(value));
    if (!isFinite(n)) return 0;
    return Math.max(0, Math.min(max, n));
  }

  // Typical quiet zones: 4 modules on 2D, 10X on 1D. Same-kind switches
  // keep the current count; 2D ↔ 1D scales so the relative amount stays put.
  function convertQuiet(value, fromFormat, toFormat) {
    const to = resolveFormat(toFormat) || BY_ID.qr;
    const n = Number(value);
    const current = isFinite(n) ? n : to.quietDefault;
    const from = resolveFormat(fromFormat);
    if (!from || from.kind === to.kind) {
      return clampQuiet(current, to);
    }
    const fromRef = from.kind === '1d' ? 10 : 4;
    const toRef = to.kind === '1d' ? 10 : 4;
    return clampQuiet(current * toRef / fromRef, to);
  }

  function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function randChars(alphabet, len) {
    let out = '';
    for (let i = 0; i < len; i++) out += alphabet.charAt(randInt(0, alphabet.length - 1));
    return out;
  }

  function randDigits(len) {
    return randChars('0123456789', len);
  }

  function gs1Check(body) {
    let sum = 0;
    for (let i = 0; i < body.length; i++) {
      const fromRight = body.length - i;
      sum += (body.charCodeAt(i) - 48) * (fromRight % 2 === 1 ? 3 : 1);
    }
    return String((10 - (sum % 10)) % 10);
  }

  function gtin(totalLen) {
    const body = randDigits(totalLen - 1);
    return body + gs1Check(body);
  }

  function ai01() {
    return '(01)' + gtin(14);
  }

  function randomFor(format) {
    const id = format.id;
    const words = 'ALPHA BRAVO CHERRY DELTA EMBER FLUX GROVE HELIX IVORY JOLT'.split(' ');
    const word = words[randInt(0, words.length - 1)];
    const token = word + randDigits(3);

    if (id === 'qr' || id === 'microqrcode' || id === 'rectangularmicroqrcode' ||
        id === 'datamatrix' || id === 'datamatrixrectangular' || id === 'datamatrixrectangularextension' ||
        id === 'azteccode' || id === 'azteccodecompact' || id === 'pdf417' || id === 'pdf417compact' ||
        id === 'micropdf417' || id === 'maxicode' || id === 'hanxin' || id === 'codeone' ||
        id === 'dotcode' || id === 'ultracode' || id === 'code128' || id === 'code39ext' ||
        id === 'code93ext' || id === 'telepen' || id === 'codablockf' || id === 'code16k' ||
        id === 'code49' || id === 'posicode') {
      if (id === 'microqrcode' || id === 'azteccodecompact' || id === 'micropdf417' ||
          id === 'rectangularmicroqrcode') {
        return word.slice(0, 3) + randDigits(3);
      }
      return token;
    }
    if (id === 'code39' || id === 'code93') {
      return randChars('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', randInt(6, 10));
    }
    if (id === 'bc412') {
      return randChars('0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ', randInt(6, 10));
    }
    if (id === 'code11') return randDigits(4) + '-' + randDigits(2);
    if (id === 'codabar') return 'A' + randDigits(randInt(6, 10)) + 'A';
    if (id === 'interleaved2of5') return randDigits(randInt(3, 6) * 2);
    if (id === 'code2of5' || id === 'industrial2of5' || id === 'coop2of5' ||
        id === 'datalogic2of5' || id === 'iata2of5' || id === 'matrix2of5') {
      return randDigits(randInt(4, 10));
    }
    if (id === 'telepennumeric') return randDigits(randInt(3, 6) * 2);
    if (id === 'msi') return randDigits(randInt(6, 12));
    if (id === 'plessey') return randChars('0123456789ABCDEF', randInt(6, 10));
    if (id === 'channelcode') return String(randInt(10, 26));
    if (id === 'flattermarken') return randDigits(randInt(1, 5));
    if (id === 'daft') return randChars('DAFT', randInt(4, 10));
    if (id === 'aztecrune') return String(randInt(0, 255));
    if (id === 'ean2') return randDigits(2);
    if (id === 'ean5') return randDigits(5);
    if (id === 'ean8') return gtin(8);
    if (id === 'ean13') {
      const body = randDigits(12);
      return body + gs1Check(body);
    }
    if (id === 'isbn') {
      const body = '978' + randDigits(9);
      const check = gs1Check(body);
      return '978-' + body.slice(3, 4) + '-' + body.slice(4, 8) + '-' + body.slice(8, 12) + '-' + check;
    }
    if (id === 'ismn') {
      const body = '9790' + randDigits(8);
      const check = gs1Check(body);
      return '979-0-' + body.slice(4, 8) + '-' + body.slice(8, 12) + '-' + check;
    }
    if (id === 'ean14') return '(01)' + gtin(14);
    if (id === 'itf14') return gtin(14);
    if (id === 'databaromni' || id === 'databarstacked' ||
        id === 'databarstackedomni' || id === 'databartruncated') {
      return '(01)' + gtin(14);
    }
    if (id === 'databarlimited') {
      const body = String(randInt(0, 1)) + randDigits(12);
      return '(01)' + body + gs1Check(body);
    }
    if (id === 'upca') return gtin(12);
    if (id === 'upce') return String(randInt(0, 1)) + randDigits(6);
    if (id === 'issn') {
      const body = randDigits(7);
      let sum = 0;
      for (let i = 0; i < 7; i++) sum += (8 - i) * (body.charCodeAt(i) - 48);
      const mod = (11 - (sum % 11)) % 11;
      const check = mod === 10 ? 'X' : String(mod);
      return body.slice(0, 4) + '-' + body.slice(4) + check;
    }
    if (id === 'sscc18') return '(00)' + gtin(18);
    if (id === 'gs1-128' || id === 'gs1datamatrix' || id === 'gs1qrcode' ||
        id === 'gs1datamatrixrectangular' || id === 'gs1dotcode') {
      return ai01();
    }
    if (id === 'databarexpanded' || id === 'databarexpandedstacked') {
      return ai01() + '(3103)' + randDigits(6);
    }
    if (id === 'gs1dldatamatrix' || id === 'gs1dlqrcode') {
      return 'https://id.gs1.org/01/' + gtin(14);
    }
    if (id === 'ean13composite') return gtin(13) + '|(99)' + randChars('abcdefghijklmnopqrstuvwxyz0123456789', 8);
    if (id === 'ean8composite') return gtin(8) + '|(21)' + randChars('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789', 8);
    if (id === 'upcacomposite') return gtin(12) + '|(99)' + randChars('abcdefghijklmnopqrstuvwxyz0123456789', 8);
    if (id === 'upcecomposite') return String(randInt(0, 1)) + randDigits(6) + '|(21)' + randChars('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789', 8);
    if (id === 'databaromnicomposite' || id === 'databarlimitedcomposite') {
      let g;
      if (id === 'databarlimitedcomposite') {
        const body = String(randInt(0, 1)) + randDigits(12);
        g = '(01)' + body + gs1Check(body);
      } else {
        g = ai01();
      }
      return g + '|(21)' + randChars('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789', 6);
    }
    if (id === 'databarexpandedcomposite' || id === 'gs1-128composite') {
      return ai01() + '|(10)' + randChars('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789', 6);
    }
    if (id === 'pharmacode') return String(randInt(3, 131070));
    if (id === 'pharmacode2') return String(randInt(4, 64570080));
    if (id === 'pzn') {
      let body;
      let check;
      do {
        body = randDigits(6);
        let sum = 0;
        for (let i = 0; i < 6; i++) sum += (i + 2) * (body.charCodeAt(i) - 48);
        check = sum % 11;
      } while (check === 10);
      return body + String(check);
    }
    if (id === 'code32') return randDigits(8);
    if (id.indexOf('hibc') === 0) {
      return '+' + randChars('ABCDEFGHJKLMNPQRSTUVWXYZ', 1) + randChars('0123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);
    }
    if (id === 'onecode') return randDigits(20);
    if (id === 'postnet') return randDigits([5, 9, 11][randInt(0, 2)]);
    if (id === 'planet') return randDigits(randInt(0, 1) ? 11 : 13);
    if (id === 'royalmail' || id === 'kix') {
      return randChars('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', randInt(6, 10));
    }
    if (id === 'identcode') return randDigits(11);
    if (id === 'leitcode') return randDigits(13);
    if (id === 'auspost') return '59' + randDigits(8);
    if (id === 'japanpost') return randDigits(10) + '-' + randChars('ABCDEFGHJKLMNPQRSTUVWXYZ', 1) + '-K-Z';
    if (id === 'swissqrcode') {
      const amount = (randInt(100, 250000) / 100).toFixed(2);
      const streetNo = String(randInt(1, 80));
      return [
        'SPC', '0200', '1',
        'CH5800791123000889012',
        'S', word + ' AG', 'Rue du Lac', streetNo, '2501', 'Biel', 'CH',
        '', '', '', '', '', '', '',
        amount, 'CHF',
        'S', 'Pia-Maria Rutschmann-Schnyder', 'Grosse Marktgasse', '28', '9400', 'Rorschach', 'CH',
        'QRR', '210000000003139471430009017',
        'Order ' + randDigits(4),
        'EPD'
      ].join('\n');
    }
    return token;
  }

  function random(formatOrId) {
    const format = resolveFormat(formatOrId) || BY_ID.qr;
    let value = randomFor(format);
    if (format.normalize) value = format.normalize(value);
    const check = format.validate(value);
    if (check && check.ok === false) value = payload(format);
    return value;
  }

  CB.formats = {
    GROUPS: GROUPS,
    list: FORMATS,
    byId: BY_ID,
    get: get,
    search: search,
    validate: validate,
    fileStem: fileStem,
    displayName: displayName,
    sample: sample,
    payload: payload,
    random: random,
    about: about,
    quietMax: quietMax,
    quietUnit: quietUnit,
    convertQuiet: convertQuiet
  };
})(typeof window !== 'undefined' ? window : globalThis);
