/*! jQuery asScrollable - v0.1.0 - 2014-12-15
* https://github.com/amazingSurge/jquery-asScrollable
* Copyright (c) 2014 amazingSurge; Licensed GPL */
(function($, document, window, undefined) {
     "use strict";

     var pluginName = 'asScrollable';

     var Plugin = $[pluginName] = function(options, container) {
         var $container = this.$container = $(container);
         options = this.options = $.extend({}, Plugin.defaults, options || {});

         this.classes = {
             contentClass: options.namespace + '-' + options.contentClass,
             wrapperClass: options.namespace + '-' + options.wrapperClass,
             barClass: options.namespace + '-' + options.barClass,
             verticalBarClass: options.namespace + '-' + options.verticalBarClass,
             horizontalBarClass: options.namespace + '-' + options.horizontalBarClass,
             handleClass: options.namespace + '-' + options.handleClass,
             directionClass: options.namespace + '-' + options.direction,
             scrollableClass: options.namespace + '-' + options.scrollableClass,
             scrollingClass: options.namespace + '-' + options.scrollingClass,
             verticalScrollingClass: options.namespace + '-' + options.verticalBarClass + '-' + options.scrollingClass,
             horizontalScrollingClass: options.namespace + '-' + options.horizontalBarClass + '-' + options.scrollingClass
         };

         this.oriAttr = {
             'vertical': { //Vertical
                 x: 'Y',
                 pos: 'top',
                 crossPos: 'left',
                 size: 'height',
                 crossSize: 'width',
                 client: 'clientHeight',
                 crossClient: 'clientWidth',
                 offset: 'offsetHeight',
                 crossOffset: 'offsetWidth',
                 offsetPos: 'offsetTop',
                 scroll: 'scrollTop',
                 scrollSize: 'scrollHeight',
                 overflow: 'overflow-y',
                 pageOffset: 'pageYOffset',
                 mouseAttr: 'pageY'
             },
             'horizontal': { // Horizontal
                 x: 'X',
                 pos: 'left',
                 crossPos: 'top',
                 size: 'width',
                 crossSize: 'height',
                 client: 'clientWidth',
                 crossClient: 'clientHeight',
                 offset: 'offsetWidth',
                 crossOffset: 'offsetHeight',
                 offsetPos: 'offsetLeft',
                 scroll: 'scrollLeft',
                 scrollSize: 'scrollWidth',
                 overflow: 'overflow-x',
                 pageOffset: 'pageXOffset',
                 mouseAttr: 'pageX'
             }
         };

         if (options.skin) {
             this.classes.skinClass = options.namespace + '-' + options.skin;
         }

         var $content = this.$content = $container.find('.' + this.classes.contentClass);

         if ($content.length === 0) {
             $container.wrapInner('<div class="' + this.classes.contentClass + '"/>');
             $content = this.$content = $container.find('.' + this.classes.contentClass);
         }

         var $wrapper = this.$wrapper = $container.find('.' + this.classes.wrapperClass);
         if ($wrapper.length === 0) {
             $content.wrap('<div class="' + this.classes.wrapperClass + '"/>');
             $wrapper = this.$wrapper = $content.parents('.' + this.classes.wrapperClass);
         }

         $wrapper.css('overflow', 'hidden');

         $container.css({
             overflow: 'hidden',
             position: 'relative'
         });

         if (options.skin) {
             $container.addClass(this.classes.skinClass);
         }

         this.origPosition = 0;
         this.origHanlePosition = 0;

         if (options.direction === 'horizontal' || options.direction === 'vertical') {
             this.initLayout(options.direction);
         } else {
             /*this.initLayout('vertical');*/
             this.initLayout('horizontal');
         }

         this.initEvent();
     };

     Plugin.defaults = {
         contentClass: 'content',
         wrapperClass: 'wrapper',
         barClass: 'scrollbar',
         verticalBarClass: 'vertical',
         horizontalBarClass: 'horizontal',
         scrollableClass: 'is-scrollable',
         scrollingClass: 'is_scrolling',
         barTmpl: '<div class="{{scrollbar}}"><div class="{{handle}}"></div></div>',
         handleClass: 'handle',
         direction: 'vertical', //if it's 0, scroll orientation is 'horizontal',else scroll orientation is 'vertical', will add auto.
         namespace: 'asScrollable',
         mousewheel: 10,
         duration: 500,
         skin: false,
         responsive: false,
         showOnhover: false,
         toOffset: 50
     };

     Plugin.prototype = {
         constructor: Plugin,
         initLayout: function(direction) {
             if (typeof direction === 'undefined') {
                 if (this.options.direction === 'horizontal' && this.options.direction === 'vertical') {
                     this.initLayout(this.options.direction);
                 } else {
                     this.initLayout('vertical');
                     this.initLayout('horizontal');
                 }
                 return;
             }
             var $wrapper = this.$wrapper,
                 wrapper = $wrapper[0],
                 $container = this.$container,
                 oriAttr = this.oriAttr[direction];


             if (direction === 'vertical') {
                 $wrapper.css('height', $container.height());
             }

             $wrapper.css(oriAttr.overflow, 'scroll');
             $wrapper.css(oriAttr.crossSize, wrapper.parentNode[oriAttr.crossClient] + wrapper[oriAttr.crossOffset] - wrapper[oriAttr.crossClient] + 'px');

             this[oriAttr.offsetPos] = this.getContentOffset(direction);
             this.initBarLayout(direction);
         },

         initBarLayout: function(direction) {
             var oriAttr = this.oriAttr[direction],
                 options = this.options,
                 wrapper = this.$wrapper[0],
                 content = this.$content[0],
                 classes = this.classes,
                 $bar;

             if (typeof this.getBar(direction) === 'undefined') {
                 $bar = this.$container.find('.' + classes[direction + 'BarClass']);

                 if ($bar.length === 0) {
                     $bar = $(options.barTmpl.replace(/\{\{scrollbar\}\}/g, classes.barClass).replace(/\{\{handle\}\}/g, classes.handleClass));
                     $bar.appendTo(this.$container);
                 }

                 $bar.asScrollable({
                     namespace: options.namespace,
                     skin: options.skin,
                     barClass: options.barClass,
                     directionClass: options[direction + 'BarClass'],
                     handleClass: options.handleClass,
                     direction: direction
                 });

                 this.setBar(direction, $bar);
             } else {
                 $bar = this.getBar(direction);
             }

             var bar = $bar[0],
                 $scrollbar = this.getBarPlugin(direction),
                 contentLength = content[oriAttr.scrollSize],
                 wrapperLength = wrapper[oriAttr.client],
                 percent, hPosition;

             if (contentLength - wrapperLength > 0) {
                 $bar.css('visibility', 'hidden').show();
                 $scrollbar.setHandleLength(bar[oriAttr.client] * wrapperLength / contentLength);
                 $bar.css('visibility', 'visible');

                 percent = this.getPercentOffset(direction);
                 hPosition = percent * $scrollbar.bLength;

                 if (hPosition !== 0) {
                     $scrollbar.handleMove(hPosition, false);
                 }

                 this.hasBar(direction, true);
                 this.$container.addClass(classes.scrollableClass);
                 this.hideBar(direction);
             } else {
                 this.hasBar(direction, false);
                 this.$container.removeClass(classes.scrollableClass);
                 this.hideBar(direction);
             }
         },

         reInitLayout: function() {
             this.$wrapper.removeAttr('style');
             if (this.options.direction === 'horizontal' || this.options.direction === 'vertical') {
                 this.initLayout(this.options.direction);
             } else {
                 this.initLayout('vertical');
                 this.initLayout('horizontal');
             }
         },

         initEvent: function() {
             var self = this,
                 options = this.options,
                 $wrapper = this.$wrapper,
                 $container = this.$container,
                 timeoutId;

             $wrapper.on('scroll', function() {
                 var origOffsetTop = self.offsetTop,
                     origOffsetLeft = self.offsetLeft,
                     percent;

                 self.offsetTop = self.getContentOffset('vertical');
                 self.offsetLeft = self.getContentOffset('horizontal');

                 if (self.offsetTop !== origOffsetTop) {
                     percent = self.getPercentOffset('vertical');
                     $(this).trigger(self.eventName('change'), [percent, 'content', 'vertical']);
                 }

                 if (self.offsetLeft !== origOffsetLeft) {
                     percent = self.getPercentOffset('horizontal');
                     $(this).trigger(self.eventName('change'), [percent, 'content', 'horizontal']);
                 }
             });

             $container.on(this.eventName('change'), function(e, value, type, direction) {
                 if (type === 'bar') {
                     var $target = $(e.target);

                     if ($target.hasClass(self.classes.verticalBarClass)) {
                         self.move(value, true, 'vertical');
                         $container.addClass(self.classes.verticalScrollingClass);
                     } else if ($target.hasClass(self.classes.horizontalBarClass)) {
                         self.move(value, true, 'horizontal');
                         $container.addClass(self.classes.horizontalScrollingClass);
                     }
                 } else if (type === 'content') {
                     self.getBarPlugin(direction).handleMove(value, true);
                     $container.addClass(self.classes[direction + 'ScrollingClass']);
                     clearTimeout(timeoutId);
                     timeoutId = setTimeout(function() {
                         $container.removeClass(self.classes.scrollingClass);
                         $container.removeClass(self.classes.verticalScrollingClass);
                         $container.removeClass(self.classes.horizontalBarClass);
                     }, 200);
                 }

                 $container.addClass(self.classes.scrollingClass);

                 if (value === 0) {
                     self.$container.trigger(self.eventName('hitstart'));
                 } else if (value === 1) {
                     self.$container.trigger(self.eventName('hitend'));
                 }
             });

             $container.on('mouseenter', function() {
                 self.isOverContainer = true;
                 if (options.direction === 'horizontal' || options.direction === 'vertical') {
                     self.showBar(options.direction);
                 } else {
                     self.showBar('vertical');
                     self.showBar('horizontal');
                 }
             });

             $container.on('mouseleave', function() {
                 self.isOverContainer = false;
                 if (options.direction === 'horizontal' || options.direction === 'vertical') {
                     self.hideBar(options.direction);
                 } else {
                     self.hideBar('vertical');
                     self.hideBar('horizontal');
                 }
             });


             $(document).on('blur mouseup', function() {
                 $container.removeClass(self.classes.scrollingClass);
                 $container.removeClass(self.classes.verticalScrollingClass);
                 $container.removeClass(self.classes.horizontalBarClass);
             });

             if (options.responsive) {
                 $(window).resize(function() {
                     self.reInitLayout();
                 });
             }

         },

         eventName: function(events) {
             if (typeof events !== 'string' || events === '') {
                 return false;
             }
             events = events.split(' ');

             var namespace = this.options.namespace,
                 length = events.length;
             for (var i = 0; i < length; i++) {
                 events[i] = events[i] + '.' + namespace;
             }
             return events.join(' ');
         },

         setBar: function(direction, $bar) {
             this['$' + direction + 'Bar'] = $bar;
         },

         getBar: function(direction) {
             return this['$' + direction + 'Bar'];
         },

         hasBar: function(direction, value) {
             if (typeof value !== 'undefined') {
                 this['has' + direction + 'Bar'] = value;
             } else {
                 return this['has' + direction + 'Bar'];
             }
         },

         showBar: function(direction) {
             if (this.hasBar(direction)) {
                 typeof this.getBar(direction) !== 'undefined' ? this.getBar(direction).show() : '';
             }
         },

         hideBar: function(direction) {
             if (this.options.showOnhover && this.hasBar(direction)) {
                 if (!this.isOverContainer && !this.getBarPlugin(direction).isDrag) {
                     typeof this.getBar(direction) !== 'undefined' ? this.getBar(direction).hide() : '';
                 }
             } else if (!this.hasBar(direction)) {
                 typeof this.getBar(direction) !== 'undefined' ? this.getBar(direction).hide() : '';
             }
         },

         getBarPlugin: function(direction) {
             return typeof this.getBar(direction) !== 'undefined' ? this.getBar(direction).data('asScrollable') : '';
         },

         getContentOffset: function(direction) {
             var oriAttr = this.oriAttr[direction],
                 wrapper = this.$wrapper[0];

             return (wrapper[oriAttr.pageOffset] || wrapper[oriAttr.scroll]);
         },

         getPercentOffset: function(direction) {
             var oriAttr = this.oriAttr[direction],
                 wrapper = this.$wrapper[0],
                 content = this.$content[0];
             return this.getContentOffset(direction) / (content[oriAttr.client] - wrapper[oriAttr.offset]);
         },

         getElementOffset: function($target, direction) {
             var offset = 0,
                 oriAttr = this.oriAttr[direction],
                 $parent;

             while (true) {

                 if ($target.is(this.$container)) break;
                 offset += $target.position()[oriAttr.pos];
                 $parent = $target.offsetParent();

                 if ($parent.is('html')) {
                     if ($target.parent().is('html')) break;
                     $target = $target.parent();
                 } else {
                     $target = $parent;
                 }
             }

             return offset;
         },

         move: function(value, isPercent, direction, animate) {
             if (typeof direction === 'undefined') {
                 if (this.options.direction === 'horizontal' && this.options.direction === 'vertical') {
                     this.move(value, isPercent, this.options.direction, animate);
                 } else {
                     this.move(value, isPercent, 'vertical', animate);
                     this.move(value, isPercent, 'horizontal', animate);
                 }
                 return;
             }
             var oriAttr = this.oriAttr[direction],
                 options = this.options,
                 wrapper = this.$wrapper[0],
                 content = this.$content[0];
             if (isPercent) {
                 if (value > 1 || value < 0) {
                     return false;
                 }

                 value = -value * (wrapper[oriAttr.offset] - content[oriAttr.scrollSize]);
             }

             var params = {};
             params[oriAttr.scroll] = value
             if (animate) {
                 this.$wrapper.stop().animate(params, options.duration);
             } else {
                 wrapper[oriAttr.scroll] = value;
             }

             this[oriAttr.offsetPos] = this.getContentOffset(direction);
         },

         to: function(selector, direction, animate) {
             if (typeof direction === 'undefined') {
                 if (this.options.direction === 'horizontal' && this.options.direction === 'vertical') {
                     this.to(selector, this.options.direction, animate);
                 } else {
                     this.to(selector, 'vertical', animate);
                     this.to(selector, 'horizontal', animate);
                 }
                 return;
             }
             var oriAttr = this.oriAttr[direction],
                 wrapper = this.$wrapper[0],
                 $item, offset, size, diff;
             if (typeof selector === 'string') $item = $(selector, this.$content);
             else $item = selector;


             if ($item.length === 0) return;
             if ($item.length > 1) $item = $item.get(0);

             offset = this.getElementOffset($item, direction);
             size = $item[oriAttr.size]();
             diff = size + offset - wrapper[oriAttr.offset];

             if (diff > 0) this.move(offset + this.getContentOffset(direction) - this.options.toOffset, false, direction, animate);
             else if (offset < 0) this.move(offset + this.getContentOffset(direction) - this.options.toOffset, false, direction, animate);
         },

         destory: function() {
             if (this.options.direction === 'horizontal' || this.options.direction === 'vertical') {
                 this.getBar(this.options.direction);
             } else {
                 typeof this.getBar('vertical') !== 'undefined' ? this.getBar('vertical').remove() : '';
                 typeof this.getBar('horizontal') !== 'undefined' ? this.getBar('horizontal').remove() : '';
             }
             this.$container.html(this.$content.html());
             this.$container.removeData(pluginName);
         }

     }

     $.fn[pluginName] = function(options) {
         if (typeof options === 'string') {
             var args = Array.prototype.slice.call(arguments, 1);
             this.each(function() {
                 var instance = $(this).data(pluginName);
                 if (!instance) {
                     return false;
                 }
                 if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                     return false;
                 }
                 // apply method
                 instance[options].apply(instance, args);
             });
         } else {
             this.each(function() {
                 if (!$(this).data(pluginName)) {
                     $(this).data(pluginName, new Plugin(options, this));
                 } else {
                     $(this).data(pluginName).reInitLayout();
                 }
             });

         }
         return this;
     };

 })(jQuery, document, window);
