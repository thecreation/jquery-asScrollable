/*
 * asScrollbar
 * https://github.com/amazingSurge/jquery-asScrollable
 *
 * Copyright (c) 2015 amazingSurge
 * Licensed under the GPL license.
 */
(function(window, document, $, undefined) {
    "use strict";

    var pluginName = 'asScrollbar';

    /**
     * Animation Frame
     **/
    if (!Date.now) {
        Date.now = function() {
            return new Date().getTime();
        };
    }

    function getTime() {
        if (typeof window.performance !== 'undefined' && window.performance.now) {
            return window.performance.now();
        } else {
            return Date.now();
        }
    }

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS (6|7|8)/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = getTime();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() {
                    callback(lastTime = nextTime);
                },
                nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }

    /**
     * Helper functions
     **/
    function isPercentage(n) {
        return typeof n === 'string' && n.indexOf('%') != -1;
    }

    function convertPercentageToFloat(n) {
        return parseFloat(n.slice(0, -1) / 100, 10);
    }

    function convertMatrixToArray(value) {
        if (value && (value.substr(0, 6) == "matrix")) {
            return value.replace(/^.*\((.*)\)$/g, "$1").replace(/px/g, '').split(/, +/);
        }
        return false;
    }

    /**
     * Plugin constructor
     **/
    var Plugin = $[pluginName] = function(options, bar) {
        this.$bar = $(bar);

        options = this.options = $.extend({}, Plugin.defaults, options || {}, this.$bar.data('options') || {});

        bar.direction = this.options.direction;

        this.classes = {
            directionClass: options.namespace + '-' + options.direction,
            barClass: options.barClass ? options.barClass : options.namespace,
            handleClass: options.handleClass ? options.handleClass : options.namespace + '-handle'
        };

        if (this.options.direction === 'vertical') {
            this.attributes = {
                axis: 'Y',
                position: 'top',
                length: 'height',
                clientLength: 'clientHeight'
            };
        } else if (this.options.direction === 'horizontal') {
            this.attributes = {
                axis: 'X',
                position: 'left',
                length: 'width',
                clientLength: 'clientWidth'
            };
        }

        // Current state information.
        this._states = {};

        // Current state information for the drag operation.
        this._drag = {
            time: null,
            pointer: null
        };

        // Current timeout
        this._frameId = null;

        // Current handle position
        this.handlePosition = 0;

        this.easing = Plugin.easing[this.options.easing] || Plugin.easing.ease;

        this.init();
    };

    Plugin.defaults = {
        namespace: 'asScrollbar',

        skin: null,
        handleSelector: null,
        handleTemplate: '<div class="{{handle}}"></div>',

        barClass: null,
        handleClass: null,

        disabledClass: 'is-disabled',
        draggingClass: 'is-dragging',
        hoveringClass: 'is-hovering',

        direction: 'vertical',

        barLength: null,
        handleLength: null,

        minHandleLength: 30,
        maxHandleLength: null,

        mouseDrag: true,
        touchDrag: true,
        pointerDrag: true,
        clickMove: true,
        clickMoveStep: 0.3, // 0 - 1
        mousewheel: true,
        mousewheelSpeed: 50,

        keyboard: true,

        useCssTransforms3d: true,
        useCssTransforms: true,
        useCssTransitions: true,

        duration: '500',
        easing: 'ease' // linear, ease-in, ease-out, ease-in-out
    };

    /**
     * Css features detect
     **/
    var support = {};
    Plugin.support = support;
    (function(support) {
        /**
         * Borrowed from Owl carousel
         **/
        var style = $('<support>').get(0).style,
            prefixes = ['webkit', 'Moz', 'O', 'ms'],
            events = {
                transition: {
                    end: {
                        WebkitTransition: 'webkitTransitionEnd',
                        MozTransition: 'transitionend',
                        OTransition: 'oTransitionEnd',
                        transition: 'transitionend'
                    }
                },
                animation: {
                    end: {
                        WebkitAnimation: 'webkitAnimationEnd',
                        MozAnimation: 'animationend',
                        OAnimation: 'oAnimationEnd',
                        animation: 'animationend'
                    }
                }
            },
            tests = {
                csstransforms: function() {
                    return !!test('transform');
                },
                csstransforms3d: function() {
                    return !!test('perspective');
                },
                csstransitions: function() {
                    return !!test('transition');
                },
                cssanimations: function() {
                    return !!test('animation');
                }
            };

        function test(property, prefixed) {
            var result = false,
                upper = property.charAt(0).toUpperCase() + property.slice(1);

            if (style[property] !== undefined) {
                result = property;
            }
            if (!result) {
                $.each(prefixes, function(i, prefix) {
                    if (style[prefix + upper] !== undefined) {
                        result = '-' + prefix.toLowerCase() + '-' + upper;
                        return false;
                    }
                });
            }

            if (prefixed) {
                return result;
            }
            if (result) {
                return true;
            } else {
                return false;
            }
        }

        function prefixed(property) {
            return test(property, true);
        }

        if (tests.csstransitions()) {
            /* jshint -W053 */
            support.transition = new String(prefixed('transition'))
            support.transition.end = events.transition.end[support.transition];
        }

        if (tests.cssanimations()) {
            /* jshint -W053 */
            support.animation = new String(prefixed('animation'))
            support.animation.end = events.animation.end[support.animation];
        }

        if (tests.csstransforms()) {
            /* jshint -W053 */
            support.transform = new String(prefixed('transform'));
            support.transform3d = tests.csstransforms3d();
        }

        if (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch) {
            support.touch = true;
        } else {
            support.touch = false;
        }

        if (window.PointerEvent || window.MSPointerEvent) {
            support.pointer = true;
        } else {
            support.pointer = false;
        }

        support.prefixPointerEvent = function(pointerEvent) {
            return window.MSPointerEvent ?
                'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10) :
                pointerEvent;
        }
    })(support);

    var easingBezier = function(mX1, mY1, mX2, mY2) {
        function a(aA1, aA2) {
            return 1.0 - 3.0 * aA2 + 3.0 * aA1;
        }

        function b(aA1, aA2) {
            return 3.0 * aA2 - 6.0 * aA1;
        }

        function c(aA1) {
            return 3.0 * aA1;
        }

        // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
        function calcBezier(aT, aA1, aA2) {
            return ((a(aA1, aA2) * aT + b(aA1, aA2)) * aT + c(aA1)) * aT;
        }

        // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
        function getSlope(aT, aA1, aA2) {
            return 3.0 * a(aA1, aA2) * aT * aT + 2.0 * b(aA1, aA2) * aT + c(aA1);
        }

        function getTForX(aX) {
            // Newton raphson iteration
            var aGuessT = aX;
            for (var i = 0; i < 4; ++i) {
                var currentSlope = getSlope(aGuessT, mX1, mX2);
                if (currentSlope === 0.0) return aGuessT;
                var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
                aGuessT -= currentX / currentSlope;
            }
            return aGuessT;
        }

        if (mX1 === mY1 && mX2 === mY2) {
            return {
                css: 'linear',
                fn: function(aX) {
                    return aX;
                }
            };
        } else {
            return {
                css: 'cubic-bezier(' + mX1 + ',' + mY1 + ',' + mX2 + ',' + mY2 + ')',
                fn: function(aX) {
                    return calcBezier(getTForX(aX), mY1, mY2);
                }
            }
        }
    };

    $.extend(Plugin.easing = {}, {
        'ease': easingBezier(0.25, 0.1, 0.25, 1.0),
        'linear': easingBezier(0.00, 0.0, 1.00, 1.0),
        'ease-in': easingBezier(0.42, 0.0, 1.00, 1.0),
        'ease-out': easingBezier(0.00, 0.0, 0.58, 1.0),
        'ease-in-out': easingBezier(0.42, 0.0, 0.58, 1.0)
    });

    Plugin.prototype = {
        constructor: Plugin,
        init: function() {
            var options = this.options;

            this.$handle = this.$bar.find(this.options.handleSelector);
            if (this.$handle.length === 0) {
                this.$handle = $(options.handleTemplate.replace(/\{\{handle\}\}/g, this.classes.handleClass)).appendTo(this.$bar);
            } else {
                this.$handle.addClass(this.classes.handleClass);
            }

            this.$bar.addClass(this.classes.barClass).addClass(this.classes.directionClass).attr('draggable', false);

            if (options.skin) {
                this.$bar.addClass(options.skin);
            }
            if (options.barLength !== null) {
                this.setBarLength(options.barLength);
            }

            if (options.handleLength !== null) {
                this.setHandleLength(options.handleLength);
            }

            this.updateLength();

            this.bindEvents();
        },

        trigger: function(eventType) {
            var method_arguments = Array.prototype.slice.call(arguments, 1),
                data = [this].concat(method_arguments);

            // event
            this.$bar.trigger(pluginName + '::' + eventType, data);

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

        bindEvents: function() {
            var self = this;

            if (this.options.mouseDrag) {
                this.$handle.on(this.eventName('mousedown'), $.proxy(this.onDragStart, this));
                this.$handle.on(this.eventName('dragstart selectstart'), function() {
                    return false
                });
            }

            if (this.options.touchDrag && support.touch) {
                this.$handle.on(this.eventName('touchstart'), $.proxy(this.onDragStart, this));
                this.$handle.on(this.eventName('touchcancel'), $.proxy(this.onDragEnd, this));
            }

            if (this.options.pointerDrag && support.pointer) {
                this.$handle.on(this.eventName(support.prefixPointerEvent('pointerdown')), $.proxy(this.onDragStart, this));
                this.$handle.on(this.eventName(support.prefixPointerEvent('pointercancel')), $.proxy(this.onDragEnd, this));
            }

            if (this.options.clickMove) {
                this.$bar.on(this.eventName('mousedown'), $.proxy(this.onClick, this));
            }

            if (this.options.mousewheel) {
                this.$bar.on(this.eventName('mousewheel'), function(e, delta) {
                    var offset = self.getHandlePosition();
                    if (offset <= 0 && delta > 0) {
                        return true;
                    } else if (offset >= self.barLength && delta < 0) {
                        return true;
                    } else {
                        offset = offset - self.options.mousewheelSpeed * delta;

                        self.move(offset, true);
                        return false;
                    }
                });
            }

            this.$bar.on(this.eventName('mouseenter'), function() {
                self.$bar.addClass(self.options.hoveringClass);
                self.enter('hovering');
                self.trigger('hover');
            });

            this.$bar.on(this.eventName('mouseleave'), function() {
                self.$bar.removeClass(self.options.hoveringClass);

                if (!self.is('hovering')) {
                    return;
                }
                self.leave('hovering');
                self.trigger('hovered');
            });

            if (this.options.keyboard) {
                $(document).on(this.eventName('keydown'), function(e) {
                    if (e.isDefaultPrevented && e.isDefaultPrevented()) {
                        return;
                    }

                    if (!self.is('hovering')) {
                        return;
                    }
                    var activeElement = document.activeElement;
                    // go deeper if element is a webcomponent
                    while (activeElement.shadowRoot) {
                        activeElement = activeElement.shadowRoot.activeElement;
                    }
                    if ($(activeElement).is(":input,select,option,[contenteditable]")) {
                        return;
                    }
                    var by = 0,
                        to = null;
                    switch (e.which) {
                        case 37: // left
                        case 63232:
                            by = -30;
                            break;
                        case 38: // up
                        case 63233:
                            by = -30;
                            break;
                        case 39: // right
                        case 63234:
                            by = 30;
                            break;
                        case 40: // down
                        case 63235:
                            by = 30;
                            break;
                        case 33: // page up
                        case 63276:
                            by = -90;
                            break;
                        case 32: // space bar
                        case 34: // page down
                        case 63277:
                            by = -90;
                            break;
                        case 35: // end
                        case 63275:
                            to = '100%';
                            break;
                        case 36: // home
                        case 63273:
                            to = 0;
                            break;
                        default:
                            return;
                    }

                    if (by || to !== null) {
                        if (by) {
                            self.moveBy(by, true);
                        } else if (to !== null) {
                            self.moveTo(to, true);
                        }
                        e.preventDefault();
                    }
                });
            }
        },

        onClick: function(event) {
            if (event.which === 3) {
                return;
            }

            if (event.target === this.$handle[0]) {
                return;
            }

            this._drag.time = new Date().getTime();
            this._drag.pointer = this.pointer(event);

            var offset = this.$handle.offset(),
                distance = this.distance({
                    x: offset.left,
                    y: offset.top
                }, this._drag.pointer),
                factor = 1;

            if (distance > 0) {
                distance -= this.handleLength;
            } else {
                distance = Math.abs(distance);
                factor = -1;
            }

            if (distance > this.barLength * this.options.clickMoveStep) {
                distance = this.barLength * this.options.clickMoveStep;
            }
            this.moveBy(factor * distance, true);
        },

        /**
         * Handles `touchstart` and `mousedown` events.
         */
        onDragStart: function(event) {
            var self = this;

            if (event.which === 3) {
                return;
            }

            // this.$bar.toggleClass(this.options.draggingClass, event.type === 'mousedown');
            this.$bar.addClass(this.options.draggingClass);

            this._drag.time = new Date().getTime();
            this._drag.pointer = this.pointer(event);

            var callback = function() {
                self.enter('dragging');
                self.trigger('drag');
            }

            if (this.options.mouseDrag) {
                $(document).on(self.eventName('mouseup'), $.proxy(this.onDragEnd, this));

                $(document).one(self.eventName('mousemove'), $.proxy(function() {
                    $(document).on(self.eventName('mousemove'), $.proxy(this.onDragMove, this));

                    callback();
                }, this));
            }

            if (this.options.touchDrag && support.touch) {
                $(document).on(self.eventName('touchend'), $.proxy(this.onDragEnd, this));

                $(document).one(self.eventName('touchmove'), $.proxy(function() {
                    $(document).on(self.eventName('touchmove'), $.proxy(this.onDragMove, this));

                    callback();
                }, this));
            }

            if (this.options.pointerDrag && support.pointer) {
                $(document).on(self.eventName(support.prefixPointerEvent('pointerup')), $.proxy(this.onDragEnd, this));

                $(document).one(self.eventName(support.prefixPointerEvent('pointermove')), $.proxy(function() {
                    $(document).on(self.eventName(support.prefixPointerEvent('pointermove')), $.proxy(this.onDragMove, this));

                    callback();
                }, this));
            }

            $(document).on(self.eventName('blur'), $.proxy(this.onDragEnd, this));
        },

        /**
         * Handles the `touchmove` and `mousemove` events.
         */
        onDragMove: function(event) {
            var distance = this.distance(this._drag.pointer, this.pointer(event));

            if (!this.is('dragging')) {
                return;
            }

            event.preventDefault();
            this.moveBy(distance, true);
        },

        /**
         * Handles the `touchend` and `mouseup` events.
         */
        onDragEnd: function() {
            $(document).off(this.eventName('mousemove mouseup touchmove touchend pointermove pointerup MSPointerMove MSPointerUp blur'));

            this.$bar.removeClass(this.options.draggingClass);
            this.handlePosition = this.getHandlePosition();

            if (!this.is('dragging')) {
                return;
            }

            this.leave('dragging');
            this.trigger('dragged');
        },

        /**
         * Gets unified pointer coordinates from event.
         * @returns {Object} - Contains `x` and `y` coordinates of current pointer position.
         */
        pointer: function(event) {
            var result = {
                x: null,
                y: null
            };

            event = event.originalEvent || event || window.event;

            event = event.touches && event.touches.length ?
                event.touches[0] : event.changedTouches && event.changedTouches.length ?
                event.changedTouches[0] : event;

            if (event.pageX) {
                result.x = event.pageX;
                result.y = event.pageY;
            } else {
                result.x = event.clientX;
                result.y = event.clientY;
            }

            return result;
        },

        /**
         * Gets the distance of two pointer.
         */
        distance: function(first, second) {
            if (this.options.direction === 'vertical') {
                return second.y - first.y;
            } else {
                return second.x - first.x;
            }
        },

        setBarLength: function(length, update) {
            if (typeof length !== 'undefined') {
                this.$bar.css(this.attributes.length, length);
            }
            if (update !== false) {
                this.updateLength();
            }
        },

        setHandleLength: function(length, update) {
            if (typeof length !== 'undefined') {
                if (length < this.options.minHandleLength) {
                    length = this.options.minHandleLength;
                } else if (this.options.maxHandleLength && length > this.options.maxHandleLength) {
                    length = this.options.maxHandleLength;
                }
                this.$handle.css(this.attributes.length, length);

                if (update !== false) {
                    this.updateLength(length);
                }
            }
        },

        updateLength: function(length, barLength) {
            if (typeof length !== 'undefined') {
                this.handleLength = length;
            } else {
                this.handleLength = this.getHandleLenght();
            }
            if (typeof barLength !== 'undefined') {
                this.barLength = barLength;
            } else {
                this.barLength = this.getBarLength();
            }
        },

        getBarLength: function() {
            return this.$bar[0][this.attributes.clientLength];
        },

        getHandleLenght: function() {
            return this.$handle[0][this.attributes.clientLength];
        },

        getHandlePosition: function() {
            var value;

            if (this.options.useCssTransforms && support.transform) {
                value = convertMatrixToArray(this.$handle.css(support.transform));

                if (!value) {
                    return 0;
                }

                if (this.attributes.axis === 'X') {
                    value = value[12] || value[4];
                } else {
                    value = value[13] || value[5];
                }
            } else {
                value = this.$handle.css(this.attributes.position);
            }

            return parseFloat(value.replace('px', ''));
        },

        makeHandlePositionStyle: function(value) {
            var property, x = '0',
                y = '0';

            if (this.options.useCssTransforms && support.transform) {
                if (this.attributes.axis === 'X') {
                    x = value + 'px';
                } else {
                    y = value + 'px';
                }

                property = support.transform.toString();

                if (this.options.useCssTransforms3d && support.transform3d) {
                    value = "translate3d(" + x + "," + y + ",0)";
                } else {
                    value = "translate(" + x + "," + y + ")";
                }
            } else {
                property = this.attributes.position;
            }
            var temp = {};
            temp[property] = value;

            return temp;
        },

        setHandlePosition: function(value) {
            var style = this.makeHandlePositionStyle(value);
            this.$handle.css(style);

            if (!this.is('dragging')) {
                this.handlePosition = parseFloat(value);
            }
        },

        moveTo: function(value, trigger, sync) {
            var type = typeof value;

            if (type === "string") {
                if (isPercentage(value)) {
                    value = convertPercentageToFloat(value) * (this.barLength - this.handleLength);
                }

                value = parseFloat(value);
                type = "number";
            }

            if (type !== "number") {
                return;
            }

            this.move(value, trigger, sync);
        },

        moveBy: function(value, trigger, sync) {
            var type = typeof value;

            if (type === "string") {
                if (isPercentage(value)) {
                    value = convertPercentageToFloat(value) * (this.barLength - this.handleLength);
                }

                value = parseFloat(value);
                type = "number";
            }

            if (type !== "number") {
                return;
            }

            this.move(this.handlePosition + value, trigger, sync);
        },

        move: function(value, trigger, sync) {
            if (typeof value !== "number" || this.is('disabled')) {
                return;
            }

            if (value < 0) {
                value = 0;
            } else if (value + this.handleLength > this.barLength) {
                value = this.barLength - this.handleLength;
            }

            if (!this.is('dragging') && sync !== true) {
                this.doMove(value, this.options.duration, this.options.easing, trigger);
            } else {
                this.setHandlePosition(value);

                if (trigger) {
                    this.trigger('change', value / (this.barLength - this.handleLength));
                }
            }
        },

        doMove: function(value, duration, easing, trigger) {
            this.enter('moving');
            duration = duration ? duration : this.options.duration;
            easing = easing ? easing : this.options.easing;

            var self = this,
                style = this.makeHandlePositionStyle(value);
            for (var property in style) {
                break;
            }

            if (this.options.useCssTransitions && support.transition) {
                self.enter('transition');
                this.prepareTransition(property, duration, easing);

                this.$handle.one(support.transition.end, function() {
                    self.$handle.css(support.transition, '');

                    if (trigger) {
                        self.trigger('change', value / (self.barLength - self.handleLength));
                    }
                    self.leave('transition');
                    self.leave('moving');
                });

                self.setHandlePosition(value);
            } else {
                self.enter('animating');

                var startTime = getTime();
                var start = self.getHandlePosition();
                var end = value;

                var run = function(time) {
                    var percent = (time - startTime) / self.options.duration;

                    if (percent > 1) {
                        percent = 1;
                    }

                    percent = self.easing.fn(percent);

                    var current = parseFloat(start + percent * (end - start), 10);
                    self.setHandlePosition(current);

                    if (trigger) {
                        self.trigger('change', current / (self.barLength - self.handleLength));
                    }

                    if (percent === 1) {
                        window.cancelAnimationFrame(self._frameId);
                        self._frameId = null;

                        self.leave('animating');
                        self.leave('moving');
                    } else {
                        self._frameId = window.requestAnimationFrame(run);
                    }
                };

                self._frameId = window.requestAnimationFrame(run);
            }
        },

        prepareTransition: function(property, duration, easing, delay) {
            var temp = [];
            if (property) {
                temp.push(property);
            }
            if (duration) {
                if ($.isNumeric(duration)) {
                    duration = duration + 'ms';
                }
                temp.push(duration);
            }
            if (easing) {
                temp.push(easing);
            } else {
                temp.push(this.easing.css);
            }
            if (delay) {
                temp.push(delay);
            }
            this.$handle.css(support.transition, temp.join(' '));
        },

        enable: function() {
            this._states.disabled = 0;

            this.$bar.removeClass(this.options.disabledClass);
        },

        disable: function() {
            this._states.disabled = 1;

            this.$bar.addClass(this.options.disabledClass);
        },

        destory: function() {
            this.$bar.on(this.eventName());
        }
    };

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
                }
            });
        }
    };
})(window, document, jQuery, undefined);
