export function getTime() {
  if (typeof window.performance !== 'undefined' && window.performance.now) {
    return window.performance.now();
  }
    return Date.now();
}

export function isPercentage(n) {
  return typeof n === 'string' && n.indexOf('%') !== -1;
}

export function conventToPercentage(n) {
  if (n < 0) {
    n = 0;
  } else if (n > 1) {
    n = 1;
  }
  return `${parseFloat(n).toFixed(4) * 100}%`;
}

export function convertPercentageToFloat(n) {
  return parseFloat(n.slice(0, -1) / 100, 10);
}

export let isFFLionScrollbar = (() => {
  'use strict';

  let isOSXFF, ua, version;
  ua = window.navigator.userAgent;
  isOSXFF = /(?=.+Mac OS X)(?=.+Firefox)/.test(ua);
  if (!isOSXFF) {
    return false;
  }
  version = /Firefox\/\d{2}\./.exec(ua);
  if (version) {
    version = version[0].replace(/\D+/g, '');
  }
  return isOSXFF && +version > 23;
})();
