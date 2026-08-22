(function (global) {
  'use strict';

  const CB = global.CodesBared = global.CodesBared || {};
  const KEY = 'codesbared:v1';

  CB.persist = {
    load: function () {
      try {
        if (typeof localStorage === 'undefined') return null;
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        return null;
      }
    },
    save: function (state) {
      try {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch (err) {
        /* quota / private mode */
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
