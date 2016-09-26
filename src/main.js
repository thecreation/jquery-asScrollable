import $ from 'jquery';
import asScrollable from './asScrollable';
import info from './info';

const NAME = 'asScrollable';
const OtherAsScrollable = $.fn.asScrollable;

$.fn.asScrollable = function jQueryAsScrollable(options, ...args) {
  if (typeof options === 'string') {
    let method = options;

    if (/^_/.test(method)) {
      return false;
    } else if ((/^(get)/.test(method))) {
      let instance = this.first().data(NAME);
      if (instance && typeof instance[method] === 'function') {
        return instance[method](...args);
      }
    } else {
      return this.each(function() {
        let instance = $.data(this, NAME);
        if (instance && typeof instance[method] === 'function') {
          instance[method](...args);
        }
      });
    }
  }

  return this.each(function() {
    if (!$(this).data(NAME)) {
      $(this).data(NAME, new asScrollable(options, this));
    }
  });
};

$.asScrollable = $.extend({
  setDefaults: asScrollable.setDefaults,
  noConflict: function() {
    $.fn.asScrollable = OtherAsScrollable;
    return this;
  }
}, info);
