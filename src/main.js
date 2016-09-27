import $ from 'jquery';
import asScrollable from './asScrollable';
import info from './info';

const NAMESPACE = 'asScrollable';
const OtherAsScrollable = $.fn.asScrollable;

const jQueryasScrollable = function(options, ...args) {
  if (typeof options === 'string') {
    let method = options;

    if (/^_/.test(method)) {
      return false;
    } else if ((/^(get)/.test(method))) {
      let instance = this.first().data(NAMESPACE);
      if (instance && typeof instance[method] === 'function') {
        return instance[method](...args);
      }
    } else {
      return this.each(function() {
        let instance = $.data(this, NAMESPACE);
        if (instance && typeof instance[method] === 'function') {
          instance[method](...args);
        }
      });
    }
  }

  return this.each(function() {
    if (!$(this).data(NAMESPACE)) {
      $(this).data(NAMESPACE, new asScrollable(this, options));
    }
  });
};

$.fn.asScrollable = jQueryasScrollable;

$.asScrollable = $.extend({
  setDefaults: asScrollable.setDefaults,
  noConflict: function() {
    $.fn.asScrollable = OtherAsScrollable;
    return jQueryasScrollable;
  }
}, info);
