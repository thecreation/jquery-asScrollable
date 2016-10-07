import $ from 'jquery';
import AsScrollable from './asScrollable';
import info from './info';

const NAMESPACE = 'asScrollable';
const OtherAsScrollable = $.fn.asScrollable;

const jQueryAsScrollable = function(options, ...args) {
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
      $(this).data(NAMESPACE, new AsScrollable(this, options));
    }
  });
};

$.fn.asScrollable = jQueryAsScrollable;

$.asScrollable = $.extend({
  setDefaults: AsScrollable.setDefaults,
  noConflict: function() {
    $.fn.asScrollable = OtherAsScrollable;
    return jQueryAsScrollable;
  }
}, info);
