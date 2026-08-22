(function (global) {
  'use strict';

  const CB = global.CodesBared = global.CodesBared || {};

  const KINDS = [
    { id: 'text', label: 'Text', fields: ['value'] },
    { id: 'url', label: 'URL', fields: ['value'] },
    { id: 'wifi', label: 'Wi-Fi', fields: ['ssid', 'password', 'security'] },
    { id: 'email', label: 'Email', fields: ['address', 'subject', 'body'] },
    { id: 'phone', label: 'Phone', fields: ['number'] },
    { id: 'sms', label: 'SMS', fields: ['number', 'message'] },
    { id: 'vcard', label: 'Contact', fields: ['name', 'phone', 'email'] },
    { id: 'geo', label: 'Place', fields: ['lat', 'lon'] }
  ];

  const LABELS = {
    value: 'Content',
    ssid: 'Network',
    password: 'Password',
    security: 'Security',
    address: 'Address',
    subject: 'Subject',
    body: 'Body',
    number: 'Number',
    message: 'Message',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    lat: 'Latitude',
    lon: 'Longitude'
  };

  function escWifi(value) {
    return String(value || '').replace(/([\\;,:"])/g, '\\$1');
  }

  function build(kind, fields) {
    fields = fields || {};
    const value = String(fields.value || '').trim();
    if (kind === 'url') {
      if (!value) return '';
      return /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : 'https://' + value;
    }
    if (kind === 'wifi') {
      const ssid = String(fields.ssid || '').trim();
      if (!ssid) return '';
      const type = fields.security || 'WPA';
      return 'WIFI:T:' + type + ';S:' + escWifi(ssid) + ';P:' + escWifi(fields.password || '') + ';;';
    }
    if (kind === 'email') {
      const address = String(fields.address || '').trim();
      if (!address) return '';
      const q = [];
      if (fields.subject) q.push('subject=' + encodeURIComponent(fields.subject));
      if (fields.body) q.push('body=' + encodeURIComponent(fields.body));
      return 'mailto:' + address + (q.length ? '?' + q.join('&') : '');
    }
    if (kind === 'phone') {
      const number = String(fields.number || '').trim();
      return number ? 'tel:' + number.replace(/\s+/g, '') : '';
    }
    if (kind === 'sms') {
      const number = String(fields.number || '').trim();
      if (!number) return '';
      const msg = String(fields.message || '').trim();
      return 'sms:' + number.replace(/\s+/g, '') + (msg ? '?body=' + encodeURIComponent(msg) : '');
    }
    if (kind === 'vcard') {
      const name = String(fields.name || '').trim();
      if (!name) return '';
      const lines = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + name];
      if (fields.phone) lines.push('TEL:' + fields.phone);
      if (fields.email) lines.push('EMAIL:' + fields.email);
      lines.push('END:VCARD');
      return lines.join('\n');
    }
    if (kind === 'geo') {
      const lat = String(fields.lat || '').trim();
      const lon = String(fields.lon || '').trim();
      if (!lat || !lon) return '';
      return 'geo:' + lat + ',' + lon;
    }
    return value;
  }

  function detect(text) {
    const raw = String(text || '');
    if (/^WIFI:/i.test(raw)) return 'wifi';
    if (/^mailto:/i.test(raw)) return 'email';
    if (/^sms:/i.test(raw) || /^smsto:/i.test(raw)) return 'sms';
    if (/^tel:/i.test(raw)) return 'phone';
    if (/^BEGIN:VCARD/i.test(raw)) return 'vcard';
    if (/^geo:/i.test(raw)) return 'geo';
    if (/^https?:\/\//i.test(raw)) return 'url';
    return 'text';
  }

  function parse(text) {
    const kind = detect(text);
    const raw = String(text || '');
    const fields = {};
    if (kind === 'wifi') {
      const grab = function (key) {
        const match = raw.match(new RegExp('(?:^|;)' + key + ':((?:[^\\\\;]|\\\\.)*)', 'i'));
        return match ? match[1].replace(/\\([\\;,:"])/g, '$1') : '';
      };
      fields.ssid = grab('S');
      fields.password = grab('P');
      fields.security = grab('T') || 'WPA';
    } else if (kind === 'email') {
      const body = raw.replace(/^mailto:/i, '');
      const parts = body.split('?');
      fields.address = decodeURIComponent(parts[0] || '');
      const query = parts[1] || '';
      query.split('&').forEach(function (pair) {
        const bits = pair.split('=');
        const key = (bits[0] || '').toLowerCase();
        const val = decodeURIComponent((bits[1] || '').replace(/\+/g, ' '));
        if (key === 'subject') fields.subject = val;
        if (key === 'body') fields.body = val;
      });
    } else if (kind === 'phone') {
      fields.number = raw.replace(/^tel:/i, '');
    } else if (kind === 'sms') {
      const body = raw.replace(/^sms(to)?:/i, '');
      const parts = body.split('?');
      fields.number = parts[0] || '';
      const q = parts[1] || '';
      const match = q.match(/(?:^|&)body=([^&]*)/i);
      fields.message = match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : '';
    } else if (kind === 'vcard') {
      raw.split(/\r?\n/).forEach(function (line) {
        if (/^FN:/i.test(line)) fields.name = line.slice(3);
        if (/^TEL:/i.test(line)) fields.phone = line.slice(4);
        if (/^EMAIL:/i.test(line)) fields.email = line.slice(6);
      });
    } else if (kind === 'geo') {
      const bits = raw.replace(/^geo:/i, '').split(',');
      fields.lat = bits[0] || '';
      fields.lon = bits[1] || '';
    } else {
      fields.value = raw;
    }
    return { kind: kind, fields: fields };
  }

  CB.payloads = {
    KINDS: KINDS,
    LABELS: LABELS,
    build: build,
    detect: detect,
    parse: parse
  };
})(typeof window !== 'undefined' ? window : globalThis);
