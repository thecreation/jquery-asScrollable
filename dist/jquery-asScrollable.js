/**
* jQuery asScrollable
* a jquery plugin
* Compiled: Fri Aug 12 2016 17:20:54 GMT+0800 (CST)
* @version v0.3.1
* @link https://github.com/amazingSurge/jquery-asScrollable
* @copyright LGPL-3.0
*/
(function(global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'jQuery'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('jQuery'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.jQuery);
    global.jqueryAsScrollable = mod.exports;
  }
})(this,

  function(exports, _jQuery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _jQuery2 = _interopRequireDefault(_jQuery);

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ?

      function(obj) {
        return typeof obj;
      }
      :

      function(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
      };

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;

          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);

        if (staticProps)
          defineProperties(Constructor, staticProps);

        return Constructor;
      };
    }();

    var defaults = {
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

    var easingBezier = function easingBezier(mX1, mY1, mX2, mY2) {
      'use strict';

      var a = function a(aA1, aA2) {
        return 1.0 - 3.0 * aA2 + 3.0 * aA1;
      };

      var b = function b(aA1, aA2) {
        return 3.0 * aA2 - 6.0 * aA1;
      };

      var c = function c(aA1) {
        return 3.0 * aA1;
      };

      // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
      var calcBezier = function calcBezier(aT, aA1, aA2) {
        return ((a(aA1, aA2) * aT + b(aA1, aA2)) * aT + c(aA1)) * aT;
      };

      // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
      var getSlope = function getSlope(aT, aA1, aA2) {
        return 3.0 * a(aA1, aA2) * aT * aT + 2.0 * b(aA1, aA2) * aT + c(aA1);
      };

      var getTForX = function getTForX(aX) {
        // Newton raphson iteration
        var aGuessT = aX;

        for (var i = 0; i < 4; ++i) {
          var currentSlope = getSlope(aGuessT, mX1, mX2);

          if (currentSlope === 0.0) {

            return aGuessT;
          }
          var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
          aGuessT -= currentX / currentSlope;
        }

        return aGuessT;
      };

      if (mX1 === mY1 && mX2 === mY2) {

        return {
          css: 'linear',
          fn: function fn(aX) {
            return aX;
          }
        };
      }

      return {
        css: 'cubic-bezier(' + mX1 + ',' + mY1 + ',' + mX2 + ',' + mY2 + ')',
        fn: function fn(aX) {
          return calcBezier(getTForX(aX), mY1, mY2);
        }
      };
    };

    /**
     * Helper functions
     **/
    var isPercentage = function isPercentage(n) {
      'use strict';

      return typeof n === 'string' && n.indexOf('%') !== -1;
    };

    var convertPercentageToFloat = function convertPercentageToFloat(n) {
      'use strict';

      return parseFloat(n.slice(0, -1) / 100, 10);
    };

    var convertMatrixToArray = function convertMatrixToArray(value) {
      'use strict';

      if (value && value.substr(0, 6) === 'matrix') {

        return value.replace(/^.*\((.*)\)$/g, '$1').replace(/px/g, '').split(/, +/);
      }

      return false;
    };

    var support = {};

    (function(support) {
      /**
       * Borrowed from Owl carousel
       **/
      'use strict';

      var events = {
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
        prefixes = ['webkit', 'Moz', 'O', 'ms'],
        style = (0, _jQuery2.default)('<support>').get(0).style,
        tests = {
          csstransforms: function csstransforms() {
            return Boolean(test('transform'));
          },
          csstransforms3d: function csstransforms3d() {
            return Boolean(test('perspective'));
          },
          csstransitions: function csstransitions() {
            return Boolean(test('transition'));
          },
          cssanimations: function cssanimations() {
            return Boolean(test('animation'));
          }
        };

      var test = function test(property, prefixed) {
        var result = false,
          upper = property.charAt(0).toUpperCase() + property.slice(1);

        if (style[property] !== undefined) {
          result = property;
        }

        if (!result) {
          _jQuery2.default.each(prefixes,

            function(i, prefix) {
              if (style[prefix + upper] !== undefined) {
                result = '-' + prefix.toLowerCase() + '-' + upper;

                return false;
              }

              return true;
            }
          );
        }

        if (prefixed) {

          return result;
        }

        if (result) {

          return true;
        }

        return false;
      };

      var prefixed = function prefixed(property) {
        return test(property, true);
      };

      if (tests.csstransitions()) {
        /* jshint -W053 */
        support.transition = new String(prefixed('transition'));
        support.transition.end = events.transition.end[support.transition];
      }

      if (tests.cssanimations()) {
        /* jshint -W053 */
        support.animation = new String(prefixed('animation'));
        support.animation.end = events.animation.end[support.animation];
      }

      if (tests.csstransforms()) {
        /* jshint -W053 */
        support.transform = new String(prefixed('transform'));
        support.transform3d = tests.csstransforms3d();
      }

      if ('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch) {
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
        var charStart = 9,
          subStart = 10;

        return window.MSPointerEvent ? 'MSPointer' + pointerEvent.charAt(charStart).toUpperCase() + pointerEvent.substr(subStart) : pointerEvent;
      }
      ;
    })(support);

    var NAME$1 = 'asScrollbar';

    /**
     * Animation Frame
     **/

    if (!Date.now) {
      Date.now = function() {
        'use strict';

        return new Date().getTime();
      }
      ;
    }

    var getTime = function getTime() {
      'use strict';

      if (typeof window.performance !== 'undefined' && window.performance.now) {

        return window.performance.now();
      }

      return Date.now();
    };

    var vendors = ['webkit', 'moz'];

    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }

    if (/iP(ad|hone|od).*OS (6|7|8)/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      (function() {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
          'use strict';

          var now = getTime();
          var timePlus = 16;
          var nextTime = Math.max(lastTime + timePlus, now);

          return setTimeout(

            function() {
              callback(lastTime = nextTime);
            }
            , nextTime - now);
        }
        ;
        window.cancelAnimationFrame = clearTimeout;
      })();
    }

    /**
     * Plugin constructor
     **/

    var asScrollbar = function() {
      function asScrollbar(options, bar) {
        _classCallCheck(this, asScrollbar);

        this.$bar = (0, _jQuery2.default)(bar);
        options = this.options = _jQuery2.default.extend({}, defaults, options || {}, this.$bar.data('options') || {});
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

        this.easing = asScrollbar.easing[this.options.easing] || asScrollbar.easing.ease;

        this.init();
      }

      _createClass(asScrollbar, [{
        key: 'init',
        value: function init() {
          var options = this.options;

          this.$handle = this.$bar.find(this.options.handleSelector);

          if (this.$handle.length === 0) {
            this.$handle = (0, _jQuery2.default)(options.handleTemplate.replace(/\{\{handle\}\}/g, this.classes.handleClass)).appendTo(this.$bar);
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
        }
      }, {
        key: 'trigger',
        value: function trigger(eventType) {
          var _ref;

          for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            params[_key - 1] = arguments[_key];
          }

          var data = (_ref = [this]).concat.apply(_ref, params);

          // event
          this.$bar.trigger(NAME$1 + '::' + eventType, data);

          // callback
          eventType = eventType.replace(/\b\w+\b/g,

            function(word) {
              return word.substring(0, 1).toUpperCase() + word.substring(1);
            }
          );
          var onFunction = 'on' + eventType;

          if (typeof this.options[onFunction] === 'function') {
            var _options$onFunction;

            (_options$onFunction = this.options[onFunction]).apply.apply(_options$onFunction, [this].concat(params));
          }
        }
      }, {
        key: 'is',
        value: function is(state) {
          return this._states[state] && this._states[state] > 0;
        }
      }, {
        key: 'enter',
        value: function enter(state) {
          if (this._states[state] === undefined) {
            this._states[state] = 0;
          }

          this._states[state]++;
        }
      }, {
        key: 'leave',
        value: function leave(state) {
          this._states[state]--;
        }
      }, {
        key: 'eventName',
        value: function eventName(events) {
          if (typeof events !== 'string' || events === '') {

            return '.' + this.options.namespace;
          }
          events = events.split(' ');

          var length = events.length;

          for (var _i = 0; _i < length; _i++) {
            events[_i] = events[_i] + '.' + this.options.namespace;
          }

          return events.join(' ');
        }
      }, {
        key: 'bindEvents',
        value: function bindEvents() {
          var _this = this;

          if (this.options.mouseDrag) {
            this.$handle.on(this.eventName('mousedown'), _jQuery2.default.proxy(this.onDragStart, this));
            this.$handle.on(this.eventName('dragstart selectstart'),

              function() {
                return false;
              }
            );
          }

          if (this.options.touchDrag && support.touch) {
            this.$handle.on(this.eventName('touchstart'), _jQuery2.default.proxy(this.onDragStart, this));
            this.$handle.on(this.eventName('touchcancel'), _jQuery2.default.proxy(this.onDragEnd, this));
          }

          if (this.options.pointerDrag && support.pointer) {
            this.$handle.on(this.eventName(support.prefixPointerEvent('pointerdown')), _jQuery2.default.proxy(this.onDragStart, this));
            this.$handle.on(this.eventName(support.prefixPointerEvent('pointercancel')), _jQuery2.default.proxy(this.onDragEnd, this));
          }

          if (this.options.clickMove) {
            this.$bar.on(this.eventName('mousedown'), _jQuery2.default.proxy(this.onClick, this));
          }

          if (this.options.mousewheel) {
            this.$bar.on(this.eventName('mousewheel'),

              function(e, delta) {
                var offset = _this.getHandlePosition();

                if (offset <= 0 && delta > 0) {

                  return true;
                } else if (offset >= _this.barLength && delta < 0) {

                  return true;
                }
                offset -= _this.options.mousewheelSpeed * delta;

                _this.move(offset, true);

                return false;
              }
            );
          }

          this.$bar.on(this.eventName('mouseenter'),

            function() {
              _this.$bar.addClass(_this.options.hoveringClass);
              _this.enter('hovering');
              _this.trigger('hover');
            }
          );

          this.$bar.on(this.eventName('mouseleave'),

            function() {
              _this.$bar.removeClass(_this.options.hoveringClass);

              if (!_this.is('hovering')) {

                return;
              }
              _this.leave('hovering');
              _this.trigger('hovered');
            }
          );

          if (this.options.keyboard) {
            (0, _jQuery2.default)(document).on(this.eventName('keydown'),

              function(e) {
                if (e.isDefaultPrevented && e.isDefaultPrevented()) {

                  return;
                }

                if (!_this.is('hovering')) {

                  return;
                }
                var activeElement = document.activeElement;
                // go deeper if element is a webcomponent
                while (activeElement.shadowRoot) {
                  activeElement = activeElement.shadowRoot.activeElement;
                }

                if ((0, _jQuery2.default)(activeElement).is(':input,select,option,[contenteditable]')) {

                  return;
                }
                var by = 0,
                  to = null;

                var down = 40,
                  end = 35,
                  home = 36,
                  left = 37,
                  pageDown = 34,
                  pageUp = 33,
                  right = 39,
                  spaceBar = 32,
                  up = 38;

                var webkitDown = 63233,
                  webkitEnd = 63275,
                  webkitHome = 63273,
                  webkitLeft = 63234,
                  webkitPageDown = 63277,
                  webkitPageUp = 63276,
                  webkitRight = 63235,
                  webkitUp = 63232;

                switch (e.which) {
                  case left: // left
                  case webkitUp:
                    by = -30;
                    break;
                  case up: // up
                  case webkitDown:
                    by = -30;
                    break;
                  case right: // right
                  case webkitLeft:
                    by = 30;
                    break;
                  case down: // down
                  case webkitRight:
                    by = 30;
                    break;
                  case pageUp: // page up
                  case webkitPageUp:
                    by = -90;
                    break;
                  case spaceBar: // space bar
                  case pageDown: // page down
                  case webkitPageDown:
                    by = -90;
                    break;
                  case end: // end
                  case webkitEnd:
                    to = '100%';
                    break;
                  case home: // home
                  case webkitHome:
                    to = 0;
                    break;
                  default:

                    return;
                }

                if (by || to !== null) {

                  if (by) {
                    _this.moveBy(by, true);
                  } else if (to !== null) {
                    _this.moveTo(to, true);
                  }
                  e.preventDefault();
                }
              }
            );
          }
        }
      }, {
        key: 'onClick',
        value: function onClick(event) {
          var num = 3;

          if (event.which === num) {

            return;
          }

          if (event.target === this.$handle[0]) {

            return;
          }

          this._drag.time = new Date().getTime();
          this._drag.pointer = this.pointer(event);

          var offset = this.$handle.offset();
          var distance = this.distance({
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
        }
      }, {
        key: 'onDragStart',
        value: function onDragStart(event) {
          var _this2 = this;

          var num = 3;

          if (event.which === num) {

            return;
          }

          // this.$bar.toggleClass(this.options.draggingClass, event.type === 'mousedown');
          this.$bar.addClass(this.options.draggingClass);

          this._drag.time = new Date().getTime();
          this._drag.pointer = this.pointer(event);

          var callback = function callback() {
            _this2.enter('dragging');
            _this2.trigger('drag');
          };

          if (this.options.mouseDrag) {
            (0, _jQuery2.default)(document).on(this.eventName('mouseup'), _jQuery2.default.proxy(this.onDragEnd, this));

            (0, _jQuery2.default)(document).one(this.eventName('mousemove'), _jQuery2.default.proxy(

              function() {
                (0, _jQuery2.default)(document).on(_this2.eventName('mousemove'), _jQuery2.default.proxy(_this2.onDragMove, _this2));

                callback();
              }
              , this));
          }

          if (this.options.touchDrag && support.touch) {
            (0, _jQuery2.default)(document).on(this.eventName('touchend'), _jQuery2.default.proxy(this.onDragEnd, this));

            (0, _jQuery2.default)(document).one(this.eventName('touchmove'), _jQuery2.default.proxy(

              function() {
                (0, _jQuery2.default)(document).on(_this2.eventName('touchmove'), _jQuery2.default.proxy(_this2.onDragMove, _this2));

                callback();
              }
              , this));
          }

          if (this.options.pointerDrag && support.pointer) {
            (0, _jQuery2.default)(document).on(this.eventName(support.prefixPointerEvent('pointerup')), _jQuery2.default.proxy(this.onDragEnd, this));

            (0, _jQuery2.default)(document).one(this.eventName(support.prefixPointerEvent('pointermove')), _jQuery2.default.proxy(

              function() {
                (0, _jQuery2.default)(document).on(_this2.eventName(support.prefixPointerEvent('pointermove')), _jQuery2.default.proxy(_this2.onDragMove, _this2));

                callback();
              }
              , this));
          }

          (0, _jQuery2.default)(document).on(this.eventName('blur'), _jQuery2.default.proxy(this.onDragEnd, this));
        }
      }, {
        key: 'onDragMove',
        value: function onDragMove(event) {
          var distance = this.distance(this._drag.pointer, this.pointer(event));

          if (!this.is('dragging')) {

            return;
          }

          event.preventDefault();
          this.moveBy(distance, true);
        }
      }, {
        key: 'onDragEnd',
        value: function onDragEnd() {
          (0, _jQuery2.default)(document).off(this.eventName('mousemove mouseup touchmove touchend pointermove pointerup MSPointerMove MSPointerUp blur'));

          this.$bar.removeClass(this.options.draggingClass);
          this.handlePosition = this.getHandlePosition();

          if (!this.is('dragging')) {

            return;
          }

          this.leave('dragging');
          this.trigger('dragged');
        }
      }, {
        key: 'pointer',
        value: function pointer(event) {
          var result = {
            x: null,
            y: null
          };

          event = event.originalEvent || event || window.event;

          event = event.touches && event.touches.length ? event.touches[0] : event.changedTouches && event.changedTouches.length ? event.changedTouches[0] : event;

          if (event.pageX) {
            result.x = event.pageX;
            result.y = event.pageY;
          } else {
            result.x = event.clientX;
            result.y = event.clientY;
          }

          return result;
        }
      }, {
        key: 'distance',
        value: function distance(first, second) {
          if (this.options.direction === 'vertical') {

            return second.y - first.y;
          }

          return second.x - first.x;
        }
      }, {
        key: 'setBarLength',
        value: function setBarLength(length, update) {
          if (typeof length !== 'undefined') {
            this.$bar.css(this.attributes.length, length);
          }

          if (update !== false) {
            this.updateLength();
          }
        }
      }, {
        key: 'setHandleLength',
        value: function setHandleLength(length, update) {
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
        }
      }, {
        key: 'updateLength',
        value: function updateLength(length, barLength) {
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
        }
      }, {
        key: 'getBarLength',
        value: function getBarLength() {
          return this.$bar[0][this.attributes.clientLength];
        }
      }, {
        key: 'getHandleLenght',
        value: function getHandleLenght() {
          return this.$handle[0][this.attributes.clientLength];
        }
      }, {
        key: 'getHandlePosition',
        value: function getHandlePosition() {
          var value = void 0;

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
        }
      }, {
        key: 'makeHandlePositionStyle',
        value: function makeHandlePositionStyle(value) {
          var property = void 0,
            x = '0',
            y = '0';

          if (this.options.useCssTransforms && support.transform) {

            if (this.attributes.axis === 'X') {
              x = value + 'px';
            } else {
              y = value + 'px';
            }

            property = support.transform.toString();

            if (this.options.useCssTransforms3d && support.transform3d) {
              value = 'translate3d(' + x + ',' + y + ',0)';
            } else {
              value = 'translate(' + x + ',' + y + ')';
            }
          } else {
            property = this.attributes.position;
          }
          var temp = {};
          temp[property] = value;

          return temp;
        }
      }, {
        key: 'setHandlePosition',
        value: function setHandlePosition(value) {
          var style = this.makeHandlePositionStyle(value);
          this.$handle.css(style);

          if (!this.is('dragging')) {
            this.handlePosition = parseFloat(value);
          }
        }
      }, {
        key: 'moveTo',
        value: function moveTo(value, trigger, sync) {
          var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

          if (type === 'string') {

            if (isPercentage(value)) {
              value = convertPercentageToFloat(value) * (this.barLength - this.handleLength);
            }

            value = parseFloat(value);
            type = 'number';
          }

          if (type !== 'number') {

            return;
          }

          this.move(value, trigger, sync);
        }
      }, {
        key: 'moveBy',
        value: function moveBy(value, trigger, sync) {
          var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

          if (type === 'string') {

            if (isPercentage(value)) {
              value = convertPercentageToFloat(value) * (this.barLength - this.handleLength);
            }

            value = parseFloat(value);
            type = 'number';
          }

          if (type !== 'number') {

            return;
          }

          this.move(this.handlePosition + value, trigger, sync);
        }
      }, {
        key: 'move',
        value: function move(value, trigger, sync) {
          if (typeof value !== 'number' || this.is('disabled')) {

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
        }
      }, {
        key: 'doMove',
        value: function doMove(value, duration, easing, trigger) {
          var _this3 = this;

          var property = void 0;
          this.enter('moving');
          duration = duration ? duration : this.options.duration;
          easing = easing ? easing : this.options.easing;

          var style = this.makeHandlePositionStyle(value);

          for (property in style) {

            if ({}.hasOwnProperty.call(style, property)) {
              break;
            }
          }

          if (this.options.useCssTransitions && support.transition) {
            this.enter('transition');
            this.prepareTransition(property, duration, easing);

            this.$handle.one(support.transition.end,

              function() {
                _this3.$handle.css(support.transition, '');

                if (trigger) {
                  _this3.trigger('change', value / (_this3.barLength - _this3.handleLength));
                }
                _this3.leave('transition');
                _this3.leave('moving');
              }
            );

            this.setHandlePosition(value);
          } else {
            (function() {
              _this3.enter('animating');

              var startTime = getTime();
              var start = _this3.getHandlePosition();
              var end = value;

              var run = function run(time) {
                var percent = (time - startTime) / _this3.options.duration;

                if (percent > 1) {
                  percent = 1;
                }

                percent = _this3.easing.fn(percent);
                var scale = 10;
                var current = parseFloat(start + percent * (end - start), scale);
                _this3.setHandlePosition(current);

                if (trigger) {
                  _this3.trigger('change', current / (_this3.barLength - _this3.handleLength));
                }

                if (percent === 1) {
                  window.cancelAnimationFrame(_this3._frameId);
                  _this3._frameId = null;

                  _this3.leave('animating');
                  _this3.leave('moving');
                } else {
                  _this3._frameId = window.requestAnimationFrame(run);
                }
              };

              _this3._frameId = window.requestAnimationFrame(run);
            })();
          }
        }
      }, {
        key: 'prepareTransition',
        value: function prepareTransition(property, duration, easing, delay) {
          var temp = [];

          if (property) {
            temp.push(property);
          }

          if (duration) {

            if (_jQuery2.default.isNumeric(duration)) {
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
        }
      }, {
        key: 'enable',
        value: function enable() {
          this._states.disabled = 0;

          this.$bar.removeClass(this.options.disabledClass);
        }
      }, {
        key: 'disable',
        value: function disable() {
          this._states.disabled = 1;

          this.$bar.addClass(this.options.disabledClass);
        }
      }, {
        key: 'destory',
        value: function destory() {
          this.$bar.on(this.eventName());
        }
      }], [{
        key: '_jQueryInterface',
        value: function _jQueryInterface(options) {
          'use strict';

          for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }

          if (typeof options === 'string') {

            return this.each(

              function() {
                var instance = (0, _jQuery2.default)(this).data(NAME$1);

                if (!instance) {

                  return false;
                }

                if (!_jQuery2.default.isFunction(instance[options]) || options.charAt(0) === '_') {

                  return false;
                }
                // apply method

                return instance[options].apply(instance, args);
              }
            );
          }

          return this.each(

            function() {
              if (!(0, _jQuery2.default)(this).data(NAME$1)) {
                (0, _jQuery2.default)(this).data(NAME$1, new asScrollbar(options, this));
              }
            }
          );
        }
      }]);

      return asScrollbar;
    }();

    asScrollbar.support = support;

    _jQuery2.default.extend(asScrollbar.easing = {}, {
      ease: easingBezier(0.25, 0.1, 0.25, 1.0),
      linear: easingBezier(0.00, 0.0, 1.00, 1.0),
      'ease-in': easingBezier(0.42, 0.0, 1.00, 1.0),
      'ease-out': easingBezier(0.00, 0.0, 0.58, 1.0),
      'ease-in-out': easingBezier(0.42, 0.0, 0.58, 1.0)
    });

    _jQuery2.default.fn[NAME$1] = asScrollbar._jQueryInterface;
    _jQuery2.default.fn[NAME$1].constructor = asScrollbar;
    _jQuery2.default.fn[NAME$1].noConflict = function() {
      'use strict';

      _jQuery2.default.fn[NAME$1] = window.JQUERY_NO_CONFLICT;

      return asScrollbar._jQueryInterface;
    }
    ;

    var defaults$1 = {
      namespace: 'asScrollable',

      skin: null,

      contentSelector: null,
      containerSelector: null,

      enabledClass: 'is-enabled',
      disabledClass: 'is-disabled',

      draggingClass: 'is-dragging',
      hoveringClass: 'is-hovering',
      scrollingClass: 'is-scrolling',

      direction: 'vertical', // vertical, horizontal, both, auto

      showOnHover: true,
      showOnBarHover: false,

      duration: 500,
      easing: 'ease-in', // linear, ease, ease-in, ease-out, ease-in-out

      responsive: true,
      throttle: 20,

      scrollbar: {}
    };

    /**
     * Helper functions
     **/

    var getTime$1 = function getTime$1() {
      'use strict';

      if (typeof window.performance !== 'undefined' && window.performance.now) {

        return window.performance.now();
      }

      return Date.now();
    };

    var isPercentage$1 = function isPercentage$1(n) {
      'use strict';

      return typeof n === 'string' && n.indexOf('%') !== -1;
    };

    var conventToPercentage = function conventToPercentage(n) {
      'use strict';

      if (n < 0) {
        n = 0;
      } else if (n > 1) {
        n = 1;
      }

      return parseFloat(n).toFixed(4) * 100 + '%';
    };

    var convertPercentageToFloat$1 = function convertPercentageToFloat$1(n) {
      'use strict';

      return parseFloat(n.slice(0, -1) / 100, 10);
    };

    var isFFLionScrollbar = function() {
      'use strict';

      var isOSXFF = void 0,
        ua = void 0,
        version = void 0;
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
    }();

    var NAME = 'asScrollable';

    var instanceId = 0;

    var asScrollable = function() {
      function asScrollable(options, element) {
        _classCallCheck(this, asScrollable);

        this.$element = (0, _jQuery2.default)(element);
        options = this.options = _jQuery2.default.extend({}, defaults$1, options || {}, this.$element.data('options') || {});

        this.classes = {
          wrap: options.namespace,
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

        this.instanceId = ++instanceId;

        this.easing = asScrollbar.easing[this.options.easing] || asScrollbar.easing.ease;

        var position = this.$element.css('position');

        if (this.options.containerSelector) {
          this.$container = this.$element.find(this.options.containerSelector);
          this.$wrap = this.$element;

          if (position === 'static') {
            this.$wrap.css('position', 'relative');
          }
        } else {
          this.$container = this.$element.wrap('<div>');
          this.$wrap = this.$container.parent();
          this.$wrap.height(this.$element.height());

          if (position !== 'static') {
            this.$wrap.css('position', position);
          } else {
            this.$wrap.css('position', 'relative');
          }
        }

        if (this.options.contentSelector) {
          this.$content = this.$container.find(this.options.contentSelector);
        } else {
          this.$content = this.$container.wrap('<div>');
          this.$container = this.$content.parent();
        }

        this.init();
      }

      _createClass(asScrollable, [{
        key: 'init',
        value: function init() {
          switch (this.options.direction) {
            case 'vertical': {
              this.vertical = true;
              break;
            }
            case 'horizontal': {
              this.horizontal = true;
              break;
            }
            case 'both': {
              this.horizontal = true;
              this.vertical = true;
              break;
            }
            case 'auto': {
              var overflowX = this.$element.css('overflow-x'),
                overflowY = this.$element.css('overflow-y');

              if (overflowX === 'scroll' || overflowX === 'auto') {
                this.horizontal = true;
              }

              if (overflowY === 'scroll' || overflowY === 'auto') {
                this.vertical = true;
              }
              break;
            }
            default: {
              break;
            }
          }

          if (!this.vertical && !this.horizontal) {

            return;
          }

          this.$wrap.addClass(this.classes.wrap);
          this.$container.addClass(this.classes.container);
          this.$content.addClass(this.classes.content);

          if (this.options.skin) {
            this.$wrap.addClass(this.classes.skin);
          }

          this.$wrap.addClass(this.options.enabledClass);

          if (this.vertical) {
            this.$wrap.addClass(this.classes.wrap + '-vertical');
            this.initLayout('vertical');
            this.createBar('vertical');
          }

          if (this.horizontal) {
            this.$wrap.addClass(this.classes.wrap + '-horizontal');
            this.initLayout('horizontal');
            this.createBar('horizontal');
          }

          this.bindEvents();
        }
      }, {
        key: 'bindEvents',
        value: function bindEvents() {
          var _this4 = this;

          var self = this;

          if (this.options.responsive) {
            (0, _jQuery2.default)(window).on(this.eventNameWithId('orientationchange'),

              function() {
                _this4.update();
              }
            );
            (0, _jQuery2.default)(window).on(this.eventNameWithId('resize'), this.throttle(

              function() {
                _this4.update();
              }
              , this.options.throttle));
          }

          if (!this.horizontal && !this.vertical) {

            return;
          }

          this.$wrap.on(this.eventName('mouseenter'),

            function() {
              _this4.$wrap.addClass(_this4.options.hoveringClass);
              _this4.enter('hovering');
              _this4.trigger('hover');
            }
          );

          this.$wrap.on(this.eventName('mouseleave'),

            function() {
              _this4.$wrap.removeClass(_this4.options.hoveringClass);

              if (!_this4.is('hovering')) {

                return;
              }
              _this4.leave('hovering');
              _this4.trigger('hovered');
            }
          );
          //======>>>>>self<<<<<<<=======

          if (this.options.showOnHover) {

            if (this.options.showOnBarHover) {
              this.$bar.on('asScrollbar::hover',

                function() {
                  self.showBar(this.direction);
                }
              ).on('asScrollbar::hovered',

                function() {
                  self.hideBar(this.direction);
                }
              );
            } else {
              this.$element.on(NAME + '::hover', _jQuery2.default.proxy(this.showBar, this));
              this.$element.on(NAME + '::hovered', _jQuery2.default.proxy(this.hideBar, this));
            }
          }
          //======>>>>>end self<<<<<<<=======

          this.$container.on(this.eventName('scroll'),

            function() {
              if (_this4.horizontal) {
                var oldLeft = _this4.offsetLeft;
                _this4.offsetLeft = _this4.getOffset('horizontal');

                if (oldLeft !== _this4.offsetLeft) {
                  _this4.trigger('scroll', _this4.getPercentOffset('horizontal'), 'horizontal');

                  if (_this4.offsetLeft === 0) {
                    _this4.trigger('scrolltop', 'horizontal');
                  }

                  if (_this4.offsetLeft === _this4.getScrollLength('horizontal')) {
                    _this4.trigger('scrollend', 'horizontal');
                  }
                }
              }

              if (_this4.vertical) {
                var oldTop = _this4.offsetTop;

                _this4.offsetTop = _this4.getOffset('vertical');

                if (oldTop !== _this4.offsetTop) {
                  _this4.trigger('scroll', _this4.getPercentOffset('vertical'), 'vertical');

                  if (_this4.offsetTop === 0) {
                    _this4.trigger('scrolltop', 'vertical');
                  }

                  if (_this4.offsetTop === _this4.getScrollLength('vertical')) {
                    _this4.trigger('scrollend', 'vertical');
                  }
                }
              }
            }
          );

          this.$element.on(NAME + '::scroll',

            function(e, api, value, direction) {
              if (!_this4.is('scrolling')) {
                _this4.enter('scrolling');
                _this4.$wrap.addClass(_this4.options.scrollingClass);
              }
              var bar = api.getBarApi(direction);

              bar.moveTo(conventToPercentage(value), false, true);

              clearTimeout(_this4._timeoutId);
              _this4._timeoutId = setTimeout(

                function() {
                  _this4.$wrap.removeClass(_this4.options.scrollingClass);
                  _this4.leave('scrolling');
                }
                , 200);
            }
          );

          this.$bar.on('asScrollbar::change',

            function(e, api, value) {
              self.scrollTo(this.direction, conventToPercentage(value), false, true);
            }
          );

          this.$bar.on('asScrollbar::drag',

            function() {
              _this4.$wrap.addClass(_this4.options.draggingClass);
            }
          ).on('asScrollbar::dragged',

            function() {
              _this4.$wrap.removeClass(_this4.options.draggingClass);
            }
          );
        }
      }, {
        key: 'unbindEvents',
        value: function unbindEvents() {
          this.$wrap.off(this.eventName());
          this.$element.off(NAME + '::scroll').off(NAME + '::hover').off(NAME + '::hovered');
          this.$container.off(this.eventName());
          (0, _jQuery2.default)(window).off(this.eventNameWithId());
        }
      }, {
        key: 'initLayout',
        value: function initLayout(direction) {
          if (direction === 'vertical') {
            this.$container.css('height', this.$wrap.height());
          }
          var attributes = this.attributes[direction],
            container = this.$container[0];

          // this.$container.css(attributes.overflow, 'scroll');

          var parentLength = container.parentNode[attributes.crossClientLength],
            scrollbarWidth = this.getBrowserScrollbarWidth(direction);

          this.$content.css(attributes.crossLength, parentLength + 'px');
          this.$container.css(attributes.crossLength, '' + scrollbarWidth + parentLength + 'px');

          if (scrollbarWidth === 0 && isFFLionScrollbar) {
            this.$container.css(attributes.ffPadding, 16);
          }
        }
      }, {
        key: 'createBar',
        value: function createBar(direction) {
          var options = _jQuery2.default.extend(this.options.scrollbar, {
            namespace: this.classes.bar,
            direction: direction,
            useCssTransitions: false,
            keyboard: false
          //mousewheel: false
          });
          var $bar = (0, _jQuery2.default)('<div>');
          $bar.asScrollbar(options);

          if (this.options.showOnHover) {
            $bar.addClass(this.classes.barHide);
          }

          $bar.appendTo(this.$wrap);

          this['$' + direction] = $bar;

          if (this.$bar === null) {
            this.$bar = $bar;
          } else {
            this.$bar = this.$bar.add($bar);
          }

          this.updateBarHandle(direction);
        }
      }, {
        key: 'trigger',
        value: function trigger(eventType) {
          for (var _len3 = arguments.length, params = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            params[_key3 - 1] = arguments[_key3];
          }

          var data = [this].concat(params);

          // event
          this.$element.trigger(NAME + '::' + eventType, data);

          // callback
          eventType = eventType.replace(/\b\w+\b/g,

            function(word) {
              return word.substring(0, 1).toUpperCase() + word.substring(1);
            }
          );
          var onFunction = 'on' + eventType;

          if (typeof this.options[onFunction] === 'function') {
            this.options[onFunction].apply(this, params);
          }
        }
      }, {
        key: 'is',
        value: function is(state) {
          return this._states[state] && this._states[state] > 0;
        }
      }, {
        key: 'enter',
        value: function enter(state) {
          if (this._states[state] === undefined) {
            this._states[state] = 0;
          }

          this._states[state]++;
        }
      }, {
        key: 'leave',
        value: function leave(state) {
          this._states[state]--;
        }
      }, {
        key: 'eventName',
        value: function eventName(events) {
          if (typeof events !== 'string' || events === '') {

            return '.' + this.options.namespace;
          }

          events = events.split(' ');
          var length = events.length;

          for (var _i2 = 0; _i2 < length; _i2++) {
            events[_i2] = events[_i2] + '.' + this.options.namespace;
          }

          return events.join(' ');
        }
      }, {
        key: 'eventNameWithId',
        value: function eventNameWithId(events) {
          if (typeof events !== 'string' || events === '') {

            return this.options.namespace + '-' + this.instanceId;
          }

          events = events.split(' ');
          var length = events.length;

          for (var _i3 = 0; _i3 < length; _i3++) {
            events[_i3] = events[_i3] + '.' + this.options.namespace + '-' + this.instanceId;
          }

          return events.join(' ');
        }
      }, {
        key: 'throttle',
        value: function throttle(func, wait) {
          var _now = Date.now ||

          function() {
            return new Date().getTime();
          };
          var args = void 0,
            context = void 0,
            result = void 0;
          var timeout = null;
          var previous = 0;
          var later = function later() {
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
        }
      }, {
        key: 'getBrowserScrollbarWidth',
        value: function getBrowserScrollbarWidth(direction) {
          var attributes = this.attributes[direction],
            outer = void 0,
            outerStyle = void 0;

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
        }
      }, {
        key: 'getOffset',
        value: function getOffset(direction) {
          var attributes = this.attributes[direction],
            container = this.$container[0];

          return container[attributes.pageOffset] || container[attributes.scroll];
        }
      }, {
        key: 'getPercentOffset',
        value: function getPercentOffset(direction) {
          return this.getOffset(direction) / this.getScrollLength(direction);
        }
      }, {
        key: 'getContainerLength',
        value: function getContainerLength(direction) {
          return this.$container[0][this.attributes[direction].clientLength];
        }
      }, {
        key: 'getScrollLength',
        value: function getScrollLength(direction) {
          var scrollLength = this.$content[0][this.attributes[direction].scrollLength];

          return scrollLength - this.getContainerLength(direction);
        }
      }, {
        key: 'scrollTo',
        value: function scrollTo(direction, value, trigger, sync) {
          var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

          if (type === 'string') {

            if (isPercentage$1(value)) {
              value = convertPercentageToFloat$1(value) * this.getScrollLength(direction);
            }

            value = parseFloat(value);
            type = 'number';
          }

          if (type !== 'number') {

            return;
          }

          this.move(direction, value, trigger, sync);
        }
      }, {
        key: 'scrollBy',
        value: function scrollBy(direction, value, trigger, sync) {
          var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

          if (type === 'string') {

            if (isPercentage$1(value)) {
              value = convertPercentageToFloat$1(value) * this.getScrollLength(direction);
            }

            value = parseFloat(value);
            type = 'number';
          }

          if (type !== 'number') {

            return;
          }

          this.move(direction, this.getOffset(direction) + value, trigger, sync);
        }
      }, {
        key: 'move',
        value: function move(direction, value, trigger, sync) {
          var _this5 = this;

          if (this[direction] !== true || typeof value !== 'number') {

            return;
          }

          this.enter('moving');

          if (value < 0) {
            value = 0;
          } else if (value > this.getScrollLength(direction)) {
            value = this.getScrollLength(direction);
          }

          var attributes = this.attributes[direction];

          var callback = function callback() {
            _this5.leave('moving');
          };

          if (sync) {
            this.$container[0][attributes.scroll] = value;

            if (trigger !== false) {
              this.trigger('change', value / this.getScrollLength(direction));
            }
            callback();
          } else {
            (function() {
              _this5.enter('animating');
              var startTime = getTime$1();
              var start = _this5.getOffset(direction);
              var end = value;

              var run = function run(time) {
                var percent = (time - startTime) / _this5.options.duration;

                if (percent > 1) {
                  percent = 1;
                }

                percent = _this5.easing.fn(percent);

                var current = parseFloat(start + percent * (end - start), 10);
                _this5.$container[0][attributes.scroll] = current;

                if (trigger !== false) {
                  _this5.trigger('change', value / _this5.getScrollLength(direction));
                }

                if (percent === 1) {
                  window.cancelAnimationFrame(_this5._frameId);
                  _this5._frameId = null;

                  _this5.leave('animating');
                  callback();
                } else {
                  _this5._frameId = window.requestAnimationFrame(run);
                }
              };

              _this5._frameId = window.requestAnimationFrame(run);
            })();
          }
        }
      }, {
        key: 'scrollXto',
        value: function scrollXto(value, trigger, sync) {
          return this.scrollTo('horizontal', value, trigger, sync);
        }
      }, {
        key: 'scrollYto',
        value: function scrollYto(value, trigger, sync) {
          return this.scrollTo('vertical', value, trigger, sync);
        }
      }, {
        key: 'scrollXby',
        value: function scrollXby(value, trigger, sync) {
          return this.scrollBy('horizontal', value, trigger, sync);
        }
      }, {
        key: 'scrollYby',
        value: function scrollYby(value, trigger, sync) {
          return this.scrollBy('vertical', value, trigger, sync);
        }
      }, {
        key: 'getBar',
        value: function getBar(direction) {
          if (direction && this['$' + direction]) {

            return this['$' + direction];
          }

          return this.$bar;
        }
      }, {
        key: 'getBarApi',
        value: function getBarApi(direction) {
          return this.getBar(direction).data('asScrollbar');
        }
      }, {
        key: 'getBarX',
        value: function getBarX() {
          return this.getBar('horizontal');
        }
      }, {
        key: 'getBarY',
        value: function getBarY() {
          return this.getBar('vertical');
        }
      }, {
        key: 'showBar',
        value: function showBar(direction) {
          this.getBar(direction).removeClass(this.classes.barHide);
        }
      }, {
        key: 'hideBar',
        value: function hideBar(direction) {
          this.getBar(direction).addClass(this.classes.barHide);
        }
      }, {
        key: 'updateBarHandle',
        value: function updateBarHandle(direction) {
          var api = this.getBarApi(direction);

          if (!api) {

            return;
          }

          var containerLength = this.getContainerLength(direction),
            scrollLength = this.getScrollLength(direction);

          if (scrollLength > 0) {

            if (api.is('disabled')) {
              api.enable();
            }
            api.setHandleLength(api.getBarLength() * containerLength / (scrollLength + containerLength), true);
          } else {
            api.disable();
          }
        }
      }, {
        key: 'disable',
        value: function disable() {
          if (!this.is('disabled')) {
            this.enter('disabled');
            this.$wrap.addClass(this.options.disabledClass).removeClass(this.options.enabledClass);

            this.unbindEvents();
            this.unStyle();
          }
        }
      }, {
        key: 'enable',
        value: function enable() {
          if (this.is('disabled')) {
            this.leave('disabled');
            this.$wrap.addClass(this.options.enabledClass).removeClass(this.options.disabledClass);

            this.bindEvents();
            this.update();
          }
        }
      }, {
        key: 'update',
        value: function update() {
          if (this.is('disabled')) {

            return;
          }

          if (this.vertical) {
            this.initLayout('vertical');
            this.updateBarHandle('vertical');
          }

          if (this.horizontal) {
            this.initLayout('horizontal');
            this.updateBarHandle('horizontal');
          }
        }
      }, {
        key: 'unStyle',
        value: function unStyle() {
          if (this.horizontal) {
            this.$container.css({
              height: '',
              'padding-bottom': ''
            });
            this.$content.css({
              height: ''
            });
          }

          if (this.vertical) {
            this.$container.css({
              width: '',
              height: '',
              'padding-right': ''
            });
            this.$content.css({
              width: ''
            });
          }

          if (!this.options.containerSelector) {
            this.$wrap.css({
              height: ''
            });
          }
        }
      }, {
        key: 'destory',
        value: function destory() {
          this.$wrap.removeClass(this.classes.wrap + '-vertical').removeClass(this.classes.wrap + '-horizontal').removeClass(this.classes.wrap).removeClass(this.options.enabledClass).removeClass(this.classes.disabledClass);
          this.unStyle();

          if (this.$bar) {
            this.$bar.remove();
          }

          this.unbindEvents();

          if (this.options.containerSelector) {
            this.$container.removeClass(this.classes.container);
          } else {
            this.$container.unwrap();
          }

          if (!this.options.contentSelector) {
            this.$content.unwrap();
          }
          this.$content.removeClass(this.classes.content);
          this.$element.data(NAME, null);
        }
      }], [{
        key: '_jQueryInterface',
        value: function _jQueryInterface(options) {
          'use strict';

          var _this6 = this;

          for (var _len4 = arguments.length, params = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
            params[_key4 - 1] = arguments[_key4];
          }

          if (typeof options === 'string') {
            var _ret4 = function() {
              var method = options;

              if (/^\_/.test(method)) {

                return {
                  v: false
                };
              } else if (/^(get)/.test(method)) {
                var api = _this6.first().data(NAME);

                if (api && typeof api[method] === 'function') {

                  return {
                    v: api[method].apply(api, params)
                  };
                }
              } else {

                return {
                  v: _this6.each(

                    function() {
                      var api = _jQuery2.default.data(this, NAME);

                      if (api && typeof api[method] === 'function') {
                        api[method].apply(api, params);
                      }
                    }
                  )
                };
              }
            }();

            if ((typeof _ret4 === 'undefined' ? 'undefined' : _typeof(_ret4)) === "object")

              return _ret4.v;
          } else {

            return this.each(

              function() {
                if (!(0, _jQuery2.default)(this).data(NAME)) {
                  (0, _jQuery2.default)(this).data(NAME, new asScrollable(options, this));
                } else {
                  (0, _jQuery2.default)(this).data(NAME).update();
                }
              }
            );
          }

          return this;
        }
      }]);

      return asScrollable;
    }();

    _jQuery2.default.fn[NAME] = asScrollable._jQueryInterface;
    _jQuery2.default.fn[NAME].constructor = asScrollable;
    _jQuery2.default.fn[NAME].noConflict = function() {
      'use strict';

      _jQuery2.default.fn[NAME] = JQUERY_NO_CONFLICT;

      return asScrollable._jQueryInterface;
    }
    ;

    exports.default = asScrollable;
  }
);