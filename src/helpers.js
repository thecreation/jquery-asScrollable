/**
 * Helper functions
 **/
const getTime = () => {
  'use strict';

  if (typeof window.performance !== 'undefined' && window.performance.now) {
    return window.performance.now();
  }
    return Date.now();
};

const isPercentage = (n) => {
  'use strict';

  return typeof n === 'string' && n.indexOf('%') !== -1;
};

const conventToPercentage = (n) => {
  'use strict';

  if (n < 0) {
    n = 0;
  } else if (n > 1) {
    n = 1;
  }
  return `${parseFloat(n).toFixed(4) * 100}%`;
};

const convertPercentageToFloat = (n) => {
  'use strict';

  return parseFloat(n.slice(0, -1) / 100, 10);
};

let isFFLionScrollbar = (() => {
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

export { getTime, isPercentage, conventToPercentage, convertPercentageToFloat, isFFLionScrollbar };
