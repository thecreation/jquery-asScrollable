/*! jQuery asScrollable - v0.1.0 - 2014-12-23
* https://github.com/amazingSurge/jquery-asScrollable
* Copyright (c) 2014 amazingSurge; Licensed GPL */
(function(window, document, $, Scrollbar, undefined) {
    "use strict";

    var pluginName = 'asScrollable';

    /**
     * Helper functions
     **/
    function getTime() {
        if (typeof window.performance !== 'undefined' && window.performance.now) {
            return window.performance.now();
        } else {
            return Date.now();
        }
    }

    function isPercentage(n) {
        return typeof n === 'string' && n.indexOf('%') != -1;
    }

    function conventToPercentage(n) {
        if (n < 0) {
            n = 0;
        } else if (n > 1) {
            n = 1;
        }
        return parseFloat(n).toFixed(4) * 100 + '%';
    }

    function convertPercentageToFloat(n) {
        return parseFloat(n.slice(0, -1) / 100, 10);
    }

    var isFFLionScrollbar = (function() {
        var isOSXFF, ua, version;
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

    var Plugin = $[pluginName] = function(options, element) {
        this.$element = $(element);
        options = this.options = $.extend({}, Plugin.defaults, options || {}, this.$element.data('options') || {});

        this.classes = {
            content: options.namespace + '-content',
            container: options.namespace + '-container',
            bar: options.namespace + '-bar',
            barHide: options.namespace + '-bar-hide',
            skin: options.skin
        };

        this.attributes = {
            vertical: {
                axis: 'Y',
                overflow: 'overflow-y',

                scroll: 'scrollTop',
                scrollLength: 'scrollHeight',
                pageOffset: 'pageYOffset',

                ffPadding: 'padding-right',

                length: 'height',
                clientLength: 'clientHeight',
                offset: 'offsetHeight',

                crossLength: 'width',
                crossClientLength: 'clientWidth',
                crossOffset: 'offsetWidth'
            },
            horizontal: {
                axis: 'X',
                overflow: 'overflow-x',

                scroll: 'scrollLeft',
                scrollLength: 'scrollWidth',
                pageOffset: 'pageXOffset',

                ffPadding: 'padding-bottom',

                length: 'width',
                clientLength: 'clientWidth',
                offset: 'offsetWidth',

                crossLength: 'height',
                crossClientLength: 'clientHeight',
                crossOffset: 'offsetHeight'
            }
        };

        // Current state information.
        this._states = {};

        // Supported direction
        this.horizontal = null;
        this.vertical = null;

        this.$bar = null;

        // Current timeout
        this._frameId = null;

        this._timeoutId = null;

        this.easing = Scrollbar.easing[this.options.easing] || Scrollbar.easing.ease;

        if (this.options.containerSelector) {
            this.$container = this.$element.find(this.options.containerSelector);
        } else {
            this.$container = this.$element.wrap('<div>');
            this.$element = this.$container.parent();
        }

        if (this.options.contentSelector) {
            this.$content = this.$container.find(this.options.contentSelector);
        } else {
            this.$content = this.$container.wrap('<div>');
            this.$container = this.$content.parent();
        }

        this.init();
    };

    Plugin.defaults = {
        namespace: 'asScrollable',

        contentSelector: null,
        containerSelector: null,

        hoveringClass: 'is-hovering',
        scrollingClass: 'is-scrolling',

        direction: 'vertical', // vertical, horizontal, both, auto

        showOnHover: true,
        showOnBarHover: false,

        duration: 500,
        easing: 'ease-in-out', // linear, ease-in, ease-out, ease-in-out

        responsive: true,
        throttle: 20,

        scrollbar: {}
    };

    Plugin.prototype = {
        constructor: Plugin,

        init: function() {
            this.$element.addClass(this.options.namespace);
            this.$container.addClass(this.classes.container);
            this.$content.addClass(this.classes.content);

            if (this.options.skin) {
                this.$element.addClass(this.classes.skin);
            }

            switch (this.options.direction) {
                case 'vertical':
                    this.vertical = true;
                    break;
                case 'horizontal':
                    this.horizontal = true;
                    break;
                case 'both':
                    this.horizontal = true;
                    this.vertical = true;
                    break;
                case 'auto':
                    var overflowX = this.$content.css('overflow-x'),
                        overflowY = this.$content.css('overflow-y');
                    if (overflowX === 'scroll' || overflowX === 'auto') {
                        this.horizontal = true;
                    }
                    if (overflowY === 'scroll' || overflowY === 'auto') {
                        this.vertical = true;
                    }
                    break;
            }

            this.$container.css('overflow', 'hidden');

            if (this.vertical) {
                this.initLayout('vertical');
                this.createBar('vertical');
            }

            if (this.horizontal) {
                this.initLayout('horizontal');
                this.createBar('horizontal');
            }

            this.bindEvents();
        },

        bindEvents: function() {
            var self = this;
            var options = this.options;

            this.$element.on(this.eventName('mouseenter'), function() {
                self.$element.addClass(self.options.hoveringClass);
                self.enter('hovering');
                self.trigger('hover');
            });

            this.$element.on(this.eventName('mouseleave'), function() {
                self.$element.removeClass(self.options.hoveringClass);

                if (!self.is('hovering')) {
                    return;
                }
                self.leave('hovering');
                self.trigger('hovered');
            });

            if (options.showOnHover) {
                if (options.showOnBarHover) {
                    this.$bar.on('asScrollbar::hover', function() {
                        self.showBar(this.direction);
                    }).on('asScrollbar::hovered', function() {
                        self.hideBar(this.direction);
                    });
                } else {
                    this.$element.on(pluginName + '::hover', $.proxy(this.showBar, this));
                    this.$element.on(pluginName + '::hovered', $.proxy(this.hideBar, this));
                }
            }

            this.$container.on(this.eventName('scroll'), function() {
                if (self.horizontal) {
                    var oldLeft = self.offsetLeft;
                    self.offsetLeft = self.getOffset('horizontal');

                    if (oldLeft !== self.offsetLeft) {
                        self.trigger('scroll', self.getPercentOffset('horizontal'), 'horizontal');

                        if (self.offsetLeft === 0) {
                            self.trigger('scrolltop', 'horizontal');
                        }
                        if (self.offsetLeft === self.getScrollLength('horizontal')) {
                            self.trigger('scrollend', 'horizontal');
                        }
                    }
                }

                if (self.vertical) {
                    var oldTop = self.offsetTop;

                    self.offsetTop = self.getOffset('vertical');

                    if (oldTop !== self.offsetTop) {
                        self.trigger('scroll', self.getPercentOffset('vertical'), 'vertical');

                        if (self.offsetTop === 0) {
                            self.trigger('scrolltop', 'vertical');
                        }
                        if (self.offsetTop === self.getScrollLength('vertical')) {
                            self.trigger('scrollend', 'vertical');
                        }
                    }
                }
            });

            this.$element.on(pluginName + '::scroll', function(e, api, value, direction) {
                if (!self.is('scrolling')) {
                    self.enter('scrolling');
                    self.$element.addClass(self.options.scrollingClass);
                }
                var bar = api.getBarApi(direction);

                bar.moveTo(conventToPercentage(value), false, true);

                clearTimeout(self._timeoutId);
                self._timeoutId = setTimeout(function() {
                    self.$element.removeClass(self.options.scrollingClass);
                    self.leave('scrolling');
                }, 200);
            });

            this.$bar.on('asScrollbar::change', function(e, api, value) {
                self.moveTo(this.direction, conventToPercentage(value), false, true);
            });

            if (options.responsive) {
                $(window).on(this.eventName('orientationchange'), function() {
                    self.update.call(self);
                });
                $(window).on(this.eventName('resize'), this.throttle(function() {
                    self.update.call(self);
                }, options.throttle));
            }
        },

        trigger: function(eventType) {
            var method_arguments = Array.prototype.slice.call(arguments, 1),
                data = [this].concat(method_arguments);

            // event
            this.$element.trigger(pluginName + '::' + eventType, data);

            // callback
            eventType = eventType.replace(/\b\w+\b/g, function(word) {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
            var onFunction = 'on' + eventType;

            if (typeof this.options[onFunction] === 'function') {
                this.options[onFunction].apply(this, method_arguments);
            }
        },

        /**
         * Checks whether the carousel is in a specific state or not.
         */
        is: function(state) {
            return this._states[state] && this._states[state] > 0;
        },

        /**
         * Enters a state.
         */
        enter: function(state) {
            if (this._states[state] === undefined) {
                this._states[state] = 0;
            }

            this._states[state] ++;
        },

        /**
         * Leaves a state.
         */
        leave: function(state) {
            this._states[state] --;
        },

        eventName: function(events) {
            if (typeof events !== 'string' || events === '') {
                return '.' + this.options.namespace;
            }
            events = events.split(' ');

            var length = events.length;
            for (var i = 0; i < length; i++) {
                events[i] = events[i] + '.' + this.options.namespace;
            }
            return events.join(' ');
        },

        /**
         * _throttle
         * @description Borrowed from Underscore.js
         */
        throttle: function(func, wait) {
            var _now = Date.now || function() {
                return new Date().getTime();
            };
            var context, args, result;
            var timeout = null;
            var previous = 0;
            var later = function() {
                previous = _now();
                timeout = null;
                result = func.apply(context, args);
                context = args = null;
            };
            return function() {
                var now = _now();
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                    context = args = null;
                } else if (!timeout) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        },

        initLayout: function(direction) {
            if (direction === 'vertical') {
                this.$content.css('height', this.$element.height());
            }
            var attributes = this.attributes[direction],
                container = this.$container[0];

            this.$container.css(attributes.overflow, 'scroll');

            var scrollbarWidth = this.getBrowserScrollbarWidth(direction);

            this.$container.css(attributes.crossLength, scrollbarWidth + container.parentNode[attributes.crossClientLength] + 'px');

            if (scrollbarWidth === 0 && isFFLionScrollbar) {
                this.$container.css(attributes.ffPadding, 16);
            }
        },

        createBar: function(direction) {
            var options = $.extend(this.options.scrollbar, {
                namespace: this.classes.bar,
                direction: direction,
                useCssTransitions: false,
                keyboard: false
            });
            var $bar = $('<div>');
            $bar.asScrollbar(options);

            if (this.options.showOnHover) {
                $bar.addClass(this.classes.barHide);
            }

            $bar.appendTo(this.$element);

            this['$' + direction] = $bar;

            if (this.$bar === null) {
                this.$bar = $bar;
            } else {
                this.$bar = this.$bar.add($bar);
            }

            this.updateBarHandle(direction);
        },

        getBrowserScrollbarWidth: function(direction) {
            var attributes = this.attributes[direction],
                outer, outerStyle;
            if (attributes.scrollbarWidth) {
                return attributes.scrollbarWidth;
            }
            outer = document.createElement('div');
            outerStyle = outer.style;
            outerStyle.position = 'absolute';
            outerStyle.width = '100px';
            outerStyle.height = '100px';
            outerStyle.overflow = 'scroll';
            outerStyle.top = '-9999px';
            document.body.appendChild(outer);
            attributes.scrollbarWidth = outer[attributes.offset] - outer[attributes.clientLength];
            document.body.removeChild(outer);
            return attributes.scrollbarWidth;
        },

        getOffset: function(direction) {
            var attributes = this.attributes[direction],
                container = this.$container[0];

            return (container[attributes.pageOffset] || container[attributes.scroll]);
        },

        getPercentOffset: function(direction) {
            return this.getOffset(direction) / this.getScrollLength(direction);
        },

        getContainerLength: function(direction) {
            return this.$container[0][this.attributes[direction].clientLength];
        },

        getScrollLength: function(direction) {
            var scrollLength = this.$content[0][this.attributes[direction].scrollLength];
            return scrollLength - this.getContainerLength(direction);
        },

        moveTo: function(direction, value, trigger, sync) {
            var type = typeof value;

            if (type === "string") {
                if (isPercentage(value)) {
                    value = convertPercentageToFloat(value) * this.getScrollLength(direction);
                }

                value = parseFloat(value);
                type = "number";
            }

            if (type !== "number") {
                return;
            }

            this.move(direction, value, trigger, sync);
        },

        moveBy: function(direction, value, trigger, sync) {
            var type = typeof value;

            if (type === "string") {
                if (isPercentage(value)) {
                    value = convertPercentageToFloat(value) * this.getScrollLength(direction);
                }

                value = parseFloat(value);
                type = "number";
            }

            if (type !== "number") {
                return;
            }

            this.move(direction, this.getOffset(direction) + value, trigger, sync);
        },

        move: function(direction, value, trigger, sync) {
            if (this[direction] !== true || typeof value !== "number") {
                return;
            }
            var self = this;

            this.enter('moving');

            if (value < 0) {
                value = 0;
            } else if (value > this.getScrollLength(direction)) {
                value = this.getScrollLength(direction);
            }

            var attributes = this.attributes[direction];

            var callback = function() {
                self.leave('moving');
            }

            if (sync) {
                this.$container[0][attributes.scroll] = value;

                if (trigger !== false) {
                    this.trigger('change', value / this.getScrollLength(direction));
                }
                callback();
            } else {
                self.enter('animating');
                var startTime = getTime();
                var start = self.getOffset(direction);
                var end = value;

                var run = function(time) {
                    var percent = (time - startTime) / self.options.duration;

                    if (percent > 1) {
                        percent = 1;
                    }

                    percent = self.easing.fn(percent);

                    var current = parseFloat(start + percent * (end - start), 10);
                    self.$container[0][attributes.scroll] = current;

                    if (trigger !== false) {
                        self.trigger('change', value / self.getScrollLength(direction));
                    }

                    if (percent === 1) {
                        window.cancelAnimationFrame(self._frameId);
                        self._frameId = null;

                        self.leave('animating');
                        callback();
                    } else {
                        self._frameId = window.requestAnimationFrame(run);
                    }
                };

                self._frameId = window.requestAnimationFrame(run);
            }
        },

        moveXto: function(value, trigger, sync) {
            return this.moveTo('horizontal', value, trigger, sync);
        },

        moveYto: function(value, trigger, sync) {
            return this.moveTo('vertical', value, trigger, sync);
        },

        moveXby: function(value, trigger, sync) {
            return this.moveBy('horizontal', value, trigger, sync);
        },

        moveYby: function(value, trigger, sync) {
            return this.moveBy('vertical', value, trigger, sync);
        },

        moveX: function(value, trigger, sync) {
            return this.move('horizontal', value, trigger, sync);
        },

        moveY: function(value, trigger, sync) {
            return this.move('vertical', value, trigger, sync);
        },

        getBar: function(direction) {
            if (direction && this['$' + direction]) {
                return this['$' + direction];
            } else {
                return this.$bar;
            }
        },

        getBarApi: function(direction) {
            return this.getBar(direction).data('asScrollbar');
        },

        getBarX: function() {
            return this.getBar('horizontal');
        },

        getBarY: function() {
            return this.getBar('vertical');
        },

        showBar: function(direction) {
            this.getBar(direction).removeClass(this.classes.barHide);
        },

        hideBar: function(direction) {
            this.getBar(direction).addClass(this.classes.barHide);
        },

        update: function() {
            if (this.vertical) {
                this.initLayout('vertical');
                this.updateBarHandle('vertical');
            }
            if (this.horizontal) {
                this.initLayout('vertical');
                this.updateBarHandle('horizontal');
            }
        },

        updateBarHandle: function(direction) {
            var api = this.getBarApi(direction);

            var scrollLength = this.getScrollLength(direction),
                containerLength = this.getContainerLength(direction);

            if (scrollLength > 0) {
                if (api.is('disabled')) {
                    api.enable();
                }
                api.setHandleLength(api.getBarLength() * containerLength / (scrollLength + containerLength));
            } else {
                api.disable();
            }
        },

        destory: function() {
            this.$bar.remove();
            this.$element.off(this.eventName());
            this.$element.off(pluginName + '::scroll');
            this.$container.off(this.eventName());
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
            return this.each(function() {
                if (!$(this).data(pluginName)) {
                    $(this).data(pluginName, new Plugin(options, this));
                } else {
                    $(this).data(pluginName).reInitLayout();
                }
            });
        }
        return this;
    };

})(window, document, jQuery, (function($) {
    "use strict"
    if ($.asScrollbar === undefined) {
        // console.info('lost dependency lib of $.asScrollbar , please load it first !');
        return false;
    } else {
        return $.asScrollbar;
    }
}(jQuery)));
