/**
* jQuery asScrollable
* a jquery plugin
* Compiled: Fri Aug 12 2016 17:20:54 GMT+0800 (CST)
* @version v0.3.1
* @link https://github.com/amazingSurge/jquery-asScrollable
* @copyright LGPL-3.0
*/
import $ from 'jQuery';

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

let easingBezier = (mX1, mY1, mX2, mY2) => {
  'use strict';

  let a = (aA1, aA2) => {
    return 1.0 - 3.0 * aA2 + 3.0 * aA1;
  };

  let b = (aA1, aA2) => {
    return 3.0 * aA2 - 6.0 * aA1;
  };

  let c = (aA1) => {
    return 3.0 * aA1;
  };

  // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
  let calcBezier = (aT, aA1, aA2) => {
    return ((a(aA1, aA2) * aT + b(aA1, aA2)) * aT + c(aA1)) * aT;
  };

  // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
  let getSlope = (aT, aA1, aA2) => {
    return 3.0 * a(aA1, aA2) * aT * aT + 2.0 * b(aA1, aA2) * aT + c(aA1);
  };

  let getTForX = (aX) => {
    // Newton raphson iteration
    let aGuessT = aX;
    for (let i = 0; i < 4; ++i) {
      let currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0.0) {
        return aGuessT;
      }
      let currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  };

  if (mX1 === mY1 && mX2 === mY2) {
    return {
      css: 'linear',
      fn(aX) {
        return aX;
      }
    };
  }

  return {
    css: `cubic-bezier(${mX1},${mY1},${mX2},${mY2})`,
    fn(aX) {
      return calcBezier(getTForX(aX), mY1, mY2);
    }
  };
};

/**
 * Helper functions
 **/
let isPercentage = (n) => {
  'use strict';

  return typeof n === 'string' && n.indexOf('%') !== -1;
};

let convertPercentageToFloat = (n) => {
  'use strict';

  return parseFloat(n.slice(0, -1) / 100, 10);
};

let convertMatrixToArray = (value) => {
  'use strict';

  if (value && (value.substr(0, 6) === 'matrix')) {
    return value.replace(/^.*\((.*)\)$/g, '$1').replace(/px/g, '').split(/, +/);
  }
  return false;
};

let support = {};

((support) => {
  /**
   * Borrowed from Owl carousel
   **/
   'use strict';

  let events = {
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
    style = $('<support>').get(0).style,
    tests = {
      csstransforms() {
        return Boolean(test('transform'));
      },
      csstransforms3d() {
        return Boolean(test('perspective'));
      },
      csstransitions() {
        return Boolean(test('transition'));
      },
      cssanimations() {
        return Boolean(test('animation'));
      }
    };

  let test = (property, prefixed) => {
    let result = false,
      upper = property.charAt(0).toUpperCase() + property.slice(1);

    if (style[property] !== undefined) {
      result = property;
    }
    if (!result) {
      $.each(prefixes, (i, prefix) => {
        if (style[prefix + upper] !== undefined) {
          result = `-${prefix.toLowerCase()}-${upper}`;
          return false;
        }
        return true;
      });
    }

    if (prefixed) {
      return result;
    }
    if (result) {
      return true;
    }
    return false;
  };

  let prefixed = (property) => {
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

  support.prefixPointerEvent = (pointerEvent) => {
    let charStart = 9,
      subStart = 10;

    return window.MSPointerEvent ?
      `MSPointer${pointerEvent.charAt(charStart).toUpperCase()}${pointerEvent.substr(subStart)}` :
      pointerEvent;
  };
})(support);

const NAME$1 = 'asScrollbar';

/**
 * Animation Frame
 **/
if (!Date.now) {
  Date.now = () => {
    'use strict';
    return new Date().getTime();
  };
}

let getTime = () => {
  'use strict';
  if (typeof window.performance !== 'undefined' && window.performance.now) {
    return window.performance.now();
  }
  return Date.now();
};

let vendors = ['webkit', 'moz'];
for (let i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
  let vp = vendors[i];
  window.requestAnimationFrame = window[`${vp}RequestAnimationFrame`];
  window.cancelAnimationFrame = (window[`${vp}CancelAnimationFrame`] || window[`${vp}CancelRequestAnimationFrame`]);
}
if (/iP(ad|hone|od).*OS (6|7|8)/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
  let lastTime = 0;
  window.requestAnimationFrame = (callback) => {
    'use strict';
    let now = getTime();
    let timePlus = 16;
    let nextTime = Math.max(lastTime + timePlus, now);
    return setTimeout(() => {
        callback(lastTime = nextTime);
      },
      nextTime - now);
  };
  window.cancelAnimationFrame = clearTimeout;
}

/**
 * Plugin constructor
 **/
class asScrollbar {
  constructor(options, bar) {
    this.$bar = $(bar);
    options = this.options = $.extend({}, defaults, options || {}, this.$bar.data('options') || {});
    bar.direction = this.options.direction;

    this.classes = {
      directionClass: `${options.namespace}-${options.direction}`,
      barClass: options.barClass ? options.barClass : options.namespace,
      handleClass: options.handleClass ? options.handleClass : `${options.namespace}-handle`
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

  init() {
    let options = this.options;

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
  }

  trigger(eventType, ...params) {
    let data = [this].concat(...params);

    // event
    this.$bar.trigger(`${NAME$1}::${eventType}`, data);

    // callback
    eventType = eventType.replace(/\b\w+\b/g, (word) => {
      return word.substring(0, 1).toUpperCase() + word.substring(1);
    });
    let onFunction = `on${eventType}`;

    if (typeof this.options[onFunction] === 'function') {
      this.options[onFunction].apply(this, ...params);
    }
  }

  /**
   * Checks whether the carousel is in a specific state or not.
   */
  is(state) {
    return this._states[state] && this._states[state] > 0;
  }

  /**
   * Enters a state.
   */
  enter(state) {
    if (this._states[state] === undefined) {
      this._states[state] = 0;
    }

    this._states[state]++;
  }

  /**
   * Leaves a state.
   */
  leave(state) {
    this._states[state]--;
  }

  eventName(events) {
    if (typeof events !== 'string' || events === '') {
      return `.${this.options.namespace}`;
    }
    events = events.split(' ');

    let length = events.length;
    for (let i = 0; i < length; i++) {
      events[i] = `${events[i]}.${this.options.namespace}`;
    }
    return events.join(' ');
  }

  bindEvents() {
    if (this.options.mouseDrag) {
      this.$handle.on(this.eventName('mousedown'), $.proxy(this.onDragStart, this));
      this.$handle.on(this.eventName('dragstart selectstart'), () => {
        return false;
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
      this.$bar.on(this.eventName('mousewheel'), (e, delta) => {
        let offset = this.getHandlePosition();
        if (offset <= 0 && delta > 0) {
          return true;
        } else if (offset >= this.barLength && delta < 0) {
          return true;
        }
        offset -= this.options.mousewheelSpeed * delta;

        this.move(offset, true);
        return false;
      });
    }

    this.$bar.on(this.eventName('mouseenter'), () => {
      this.$bar.addClass(this.options.hoveringClass);
      this.enter('hovering');
      this.trigger('hover');
    });

    this.$bar.on(this.eventName('mouseleave'), () => {
      this.$bar.removeClass(this.options.hoveringClass);

      if (!this.is('hovering')) {
        return;
      }
      this.leave('hovering');
      this.trigger('hovered');
    });

    if (this.options.keyboard) {
      $(document).on(this.eventName('keydown'), (e) => {
        if (e.isDefaultPrevented && e.isDefaultPrevented()) {
          return;
        }

        if (!this.is('hovering')) {
          return;
        }
        let activeElement = document.activeElement;
        // go deeper if element is a webcomponent
        while (activeElement.shadowRoot) {
          activeElement = activeElement.shadowRoot.activeElement;
        }
        if ($(activeElement).is(':input,select,option,[contenteditable]')) {
          return;
        }
        let by = 0,
          to = null;

        let down = 40,
          end = 35,
          home = 36,
          left = 37,
          pageDown = 34,
          pageUp = 33,
          right = 39,
          spaceBar = 32,
          up = 38;

        let webkitDown = 63233,
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
            this.moveBy(by, true);
          } else if (to !== null) {
            this.moveTo(to, true);
          }
          e.preventDefault();
        }
      });
    }
  }

  onClick(event) {
    let num = 3;

    if (event.which === num) {
      return;
    }

    if (event.target === this.$handle[0]) {
      return;
    }

    this._drag.time = new Date().getTime();
    this._drag.pointer = this.pointer(event);

    let offset = this.$handle.offset();
    let distance = this.distance({
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

  /**
   * Handles `touchstart` and `mousedown` events.
   */
  onDragStart(event) {
    let num = 3;
    if (event.which === num) {
      return;
    }

    // this.$bar.toggleClass(this.options.draggingClass, event.type === 'mousedown');
    this.$bar.addClass(this.options.draggingClass);

    this._drag.time = new Date().getTime();
    this._drag.pointer = this.pointer(event);

    let callback = () => {
      this.enter('dragging');
      this.trigger('drag');
    };

    if (this.options.mouseDrag) {
      $(document).on(this.eventName('mouseup'), $.proxy(this.onDragEnd, this));

      $(document).one(this.eventName('mousemove'), $.proxy(() => {
        $(document).on(this.eventName('mousemove'), $.proxy(this.onDragMove, this));

        callback();
      }, this));
    }

    if (this.options.touchDrag && support.touch) {
      $(document).on(this.eventName('touchend'), $.proxy(this.onDragEnd, this));

      $(document).one(this.eventName('touchmove'), $.proxy(() => {
        $(document).on(this.eventName('touchmove'), $.proxy(this.onDragMove, this));

        callback();
      }, this));
    }

    if (this.options.pointerDrag && support.pointer) {
      $(document).on(this.eventName(support.prefixPointerEvent('pointerup')), $.proxy(this.onDragEnd, this));

      $(document).one(this.eventName(support.prefixPointerEvent('pointermove')), $.proxy(() => {
        $(document).on(this.eventName(support.prefixPointerEvent('pointermove')), $.proxy(this.onDragMove, this));

        callback();
      }, this));
    }

    $(document).on(this.eventName('blur'), $.proxy(this.onDragEnd, this));
  }


  /**
   * Handles the `touchmove` and `mousemove` events.
   */
  onDragMove(event) {
    let distance = this.distance(this._drag.pointer, this.pointer(event));

    if (!this.is('dragging')) {
      return;
    }

    event.preventDefault();
    this.moveBy(distance, true);
  }


  /**
   * Handles the `touchend` and `mouseup` events.
   */
  onDragEnd() {
    $(document).off(this.eventName('mousemove mouseup touchmove touchend pointermove pointerup MSPointerMove MSPointerUp blur'));

    this.$bar.removeClass(this.options.draggingClass);
    this.handlePosition = this.getHandlePosition();

    if (!this.is('dragging')) {
      return;
    }

    this.leave('dragging');
    this.trigger('dragged');
  }

  /**
   * Gets unified pointer coordinates from event.
   * @returns {Object} - Contains `x` and `y` coordinates of current pointer position.
   */
  pointer(event) {
    let result = {
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
  }

  /**
   * Gets the distance of two pointer.
   */
  distance(first, second) {
    if (this.options.direction === 'vertical') {
      return second.y - first.y;
    }
    return second.x - first.x;
  }

  setBarLength(length, update) {
    if (typeof length !== 'undefined') {
      this.$bar.css(this.attributes.length, length);
    }
    if (update !== false) {
      this.updateLength();
    }
  }

  setHandleLength(length, update) {
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

  updateLength(length, barLength) {
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

  getBarLength() {
    return this.$bar[0][this.attributes.clientLength];
  }

  getHandleLenght() {
    return this.$handle[0][this.attributes.clientLength];
  }

  getHandlePosition() {
    let value;

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

  makeHandlePositionStyle(value) {
    let property, x = '0',
      y = '0';

    if (this.options.useCssTransforms && support.transform) {
      if (this.attributes.axis === 'X') {
        x = `${value}px`;
      } else {
        y = `${value}px`;
      }

      property = support.transform.toString();

      if (this.options.useCssTransforms3d && support.transform3d) {
        value = `translate3d(${x},${y},0)`;
      } else {
        value = `translate(${x},${y})`;
      }
    } else {
      property = this.attributes.position;
    }
    let temp = {};
    temp[property] = value;

    return temp;
  }

  setHandlePosition(value) {
    let style = this.makeHandlePositionStyle(value);
    this.$handle.css(style);

    if (!this.is('dragging')) {
      this.handlePosition = parseFloat(value);
    }
  }

  moveTo(value, trigger, sync) {
    let type = typeof value;

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

  moveBy(value, trigger, sync) {
    let type = typeof value;

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

  move(value, trigger, sync) {
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

  doMove(value, duration, easing, trigger) {
    let property;
    this.enter('moving');
    duration = duration ? duration : this.options.duration;
    easing = easing ? easing : this.options.easing;

    let style = this.makeHandlePositionStyle(value);
    for (property in style) {
      if ({}.hasOwnProperty.call(style, property)) {
        break;
      }
    }

    if (this.options.useCssTransitions && support.transition) {
      this.enter('transition');
      this.prepareTransition(property, duration, easing);

      this.$handle.one(support.transition.end, () => {
        this.$handle.css(support.transition, '');

        if (trigger) {
          this.trigger('change', value / (this.barLength - this.handleLength));
        }
        this.leave('transition');
        this.leave('moving');
      });

      this.setHandlePosition(value);
    } else {
      this.enter('animating');

      let startTime = getTime();
      let start = this.getHandlePosition();
      let end = value;

      let run = (time) => {
        let percent = (time - startTime) / this.options.duration;

        if (percent > 1) {
          percent = 1;
        }

        percent = this.easing.fn(percent);
        let scale = 10;
        let current = parseFloat(start + percent * (end - start), scale);
        this.setHandlePosition(current);

        if (trigger) {
          this.trigger('change', current / (this.barLength - this.handleLength));
        }

        if (percent === 1) {
          window.cancelAnimationFrame(this._frameId);
          this._frameId = null;

          this.leave('animating');
          this.leave('moving');
        } else {
          this._frameId = window.requestAnimationFrame(run);
        }
      };

      this._frameId = window.requestAnimationFrame(run);
    }
  }

  prepareTransition(property, duration, easing, delay) {
    let temp = [];
    if (property) {
      temp.push(property);
    }
    if (duration) {
      if ($.isNumeric(duration)) {
        duration = `${duration}ms`;
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

  enable() {
    this._states.disabled = 0;

    this.$bar.removeClass(this.options.disabledClass);
  }

  disable() {
    this._states.disabled = 1;

    this.$bar.addClass(this.options.disabledClass);
  }

  destory() {
    this.$bar.on(this.eventName());
  }

  static _jQueryInterface(options, ...args) {
    'use strict';

    if (typeof options === 'string') {
      return this.each(function() {
        let instance = $(this).data(NAME$1);
        if (!instance) {
          return false;
        }
        if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
          return false;
        }
        // apply method
        return instance[options].apply(instance, args);
      });
    }

    return this.each(function() {
      if (!$(this).data(NAME$1)) {
        $(this).data(NAME$1, new asScrollbar(options, this));
      }
    });
  }
}

asScrollbar.support = support;

$.extend(asScrollbar.easing = {}, {
  ease: easingBezier(0.25, 0.1, 0.25, 1.0),
  linear: easingBezier(0.00, 0.0, 1.00, 1.0),
  'ease-in': easingBezier(0.42, 0.0, 1.00, 1.0),
  'ease-out': easingBezier(0.00, 0.0, 0.58, 1.0),
  'ease-in-out': easingBezier(0.42, 0.0, 0.58, 1.0)
});

$.fn[NAME$1] = asScrollbar._jQueryInterface;
$.fn[NAME$1].constructor = asScrollbar;
$.fn[NAME$1].noConflict = () => {
  'use strict';
  $.fn[NAME$1] = window.JQUERY_NO_CONFLICT;
  return asScrollbar._jQueryInterface;
};

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

let getTime$1 = () => {
  'use strict';

  if (typeof window.performance !== 'undefined' && window.performance.now) {
    return window.performance.now();
  } 
    return Date.now();
};

let isPercentage$1 = (n) => {
  'use strict';

  return typeof n === 'string' && n.indexOf('%') !== -1;
};

let conventToPercentage = (n) => {
  'use strict';

  if (n < 0) {
    n = 0;
  } else if (n > 1) {
    n = 1;
  }
  return `${parseFloat(n).toFixed(4) * 100}%`;
};

let convertPercentageToFloat$1 = (n) => {
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

const NAME = 'asScrollable';

let instanceId = 0;

class asScrollable {
  constructor(options, element) {
    this.$element = $(element);
    options = this.options = $.extend({}, defaults$1, options || {}, this.$element.data('options') || {});

    this.classes = {
      wrap: options.namespace,
      content: `${options.namespace}-content`,
      container: `${options.namespace}-container`,
      bar: `${options.namespace}-bar`,
      barHide: `${options.namespace}-bar-hide`,
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

    this.instanceId = (++instanceId);

    this.easing = asScrollbar.easing[this.options.easing] || asScrollbar.easing.ease;

    let position = this.$element.css('position');
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

  init() {
    switch (this.options.direction) {
      case 'vertical':
        {
          this.vertical = true;
          break;
        }
      case 'horizontal':
        {
          this.horizontal = true;
          break;
        }
      case 'both':
        {
          this.horizontal = true;
          this.vertical = true;
          break;
        }
      case 'auto':
        {
          let overflowX = this.$element.css('overflow-x'),
            overflowY = this.$element.css('overflow-y');

          if (overflowX === 'scroll' || overflowX === 'auto') {
            this.horizontal = true;
          }
          if (overflowY === 'scroll' || overflowY === 'auto') {
            this.vertical = true;
          }
          break;
        }
      default:
        {
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
      this.$wrap.addClass(`${this.classes.wrap}-vertical`);
      this.initLayout('vertical');
      this.createBar('vertical');
    }

    if (this.horizontal) {
      this.$wrap.addClass(`${this.classes.wrap}-horizontal`);
      this.initLayout('horizontal');
      this.createBar('horizontal');
    }

    this.bindEvents();
  }

  bindEvents() {
    let self = this;
    if (this.options.responsive) {
      $(window).on(this.eventNameWithId('orientationchange'), () => {
        this.update();
      });
      $(window).on(this.eventNameWithId('resize'), this.throttle(() => {
        this.update();
      }, this.options.throttle));
    }

    if (!this.horizontal && !this.vertical) {
      return;
    }

    this.$wrap.on(this.eventName('mouseenter'), () => {
      this.$wrap.addClass(this.options.hoveringClass);
      this.enter('hovering');
      this.trigger('hover');
    });

    this.$wrap.on(this.eventName('mouseleave'), () => {
      this.$wrap.removeClass(this.options.hoveringClass);

      if (!this.is('hovering')) {
        return;
      }
      this.leave('hovering');
      this.trigger('hovered');
    });
    //======>>>>>self<<<<<<<=======
    if (this.options.showOnHover) {
      if (this.options.showOnBarHover) {
        this.$bar.on('asScrollbar::hover', function() {
          self.showBar(this.direction);
        }).on('asScrollbar::hovered', function() {
          self.hideBar(this.direction);
        });
      } else {
        this.$element.on(`${NAME}::hover`, $.proxy(this.showBar, this));
        this.$element.on(`${NAME}::hovered`, $.proxy(this.hideBar, this));
      }
    }
    //======>>>>>end self<<<<<<<=======

    this.$container.on(this.eventName('scroll'), () => {
      if (this.horizontal) {
        let oldLeft = this.offsetLeft;
        this.offsetLeft = this.getOffset('horizontal');

        if (oldLeft !== this.offsetLeft) {
          this.trigger('scroll', this.getPercentOffset('horizontal'), 'horizontal');

          if (this.offsetLeft === 0) {
            this.trigger('scrolltop', 'horizontal');
          }
          if (this.offsetLeft === this.getScrollLength('horizontal')) {
            this.trigger('scrollend', 'horizontal');
          }
        }
      }

      if (this.vertical) {
        let oldTop = this.offsetTop;

        this.offsetTop = this.getOffset('vertical');

        if (oldTop !== this.offsetTop) {
          this.trigger('scroll', this.getPercentOffset('vertical'), 'vertical');

          if (this.offsetTop === 0) {
            this.trigger('scrolltop', 'vertical');
          }
          if (this.offsetTop === this.getScrollLength('vertical')) {
            this.trigger('scrollend', 'vertical');
          }
        }
      }
    });

    this.$element.on(`${NAME}::scroll`, (e, api, value, direction) => {
      if (!this.is('scrolling')) {
        this.enter('scrolling');
        this.$wrap.addClass(this.options.scrollingClass);
      }
      let bar = api.getBarApi(direction);

      bar.moveTo(conventToPercentage(value), false, true);

      clearTimeout(this._timeoutId);
      this._timeoutId = setTimeout(() => {
        this.$wrap.removeClass(this.options.scrollingClass);
        this.leave('scrolling');
      }, 200);
    });

    this.$bar.on('asScrollbar::change', function(e, api, value) {
      self.scrollTo(this.direction, conventToPercentage(value), false, true);
    });

    this.$bar.on('asScrollbar::drag', () => {
      this.$wrap.addClass(this.options.draggingClass);
    }).on('asScrollbar::dragged', () => {
      this.$wrap.removeClass(this.options.draggingClass);
    });
  }

  unbindEvents() {
    this.$wrap.off(this.eventName());
    this.$element.off(`${NAME}::scroll`).off(`${NAME}::hover`).off(`${NAME}::hovered`);
    this.$container.off(this.eventName());
    $(window).off(this.eventNameWithId());
  }

  initLayout(direction) {
    if (direction === 'vertical') {
      this.$container.css('height', this.$wrap.height());
    }
    let attributes = this.attributes[direction],
      container = this.$container[0];

    // this.$container.css(attributes.overflow, 'scroll');

    let parentLength = container.parentNode[attributes.crossClientLength],
      scrollbarWidth = this.getBrowserScrollbarWidth(direction);

    this.$content.css(attributes.crossLength, `${parentLength}px`);
    this.$container.css(attributes.crossLength, `${scrollbarWidth}${parentLength}px`);

    if (scrollbarWidth === 0 && isFFLionScrollbar) {
      this.$container.css(attributes.ffPadding, 16);
    }
  }

  createBar(direction) {
    let options = $.extend(this.options.scrollbar, {
      namespace: this.classes.bar,
      direction: direction,
      useCssTransitions: false,
      keyboard: false
        //mousewheel: false
    });
    let $bar = $('<div>');
    $bar.asScrollbar(options);

    if (this.options.showOnHover) {
      $bar.addClass(this.classes.barHide);
    }

    $bar.appendTo(this.$wrap);

    this[`$${direction}`] = $bar;

    if (this.$bar === null) {
      this.$bar = $bar;
    } else {
      this.$bar = this.$bar.add($bar);
    }

    this.updateBarHandle(direction);
  }

  trigger(eventType, ...params) {
    let data = [this].concat(params);

    // event
    this.$element.trigger(`${NAME}::${eventType}`, data);

    // callback
    eventType = eventType.replace(/\b\w+\b/g, (word) => {
      return word.substring(0, 1).toUpperCase() + word.substring(1);
    });
    let onFunction = `on${eventType}`;

    if (typeof this.options[onFunction] === 'function') {
      this.options[onFunction].apply(this, params);
    }
  }

  /**
   * Checks whether the carousel is in a specific state or not.
   */
  is(state) {
    return this._states[state] && this._states[state] > 0;
  }

  /**
   * Enters a state.
   */
  enter(state) {
    if (this._states[state] === undefined) {
      this._states[state] = 0;
    }

    this._states[state]++;
  }

  /**
   * Leaves a state.
   */
  leave(state) {
    this._states[state]--;
  }

  eventName(events) {
    if (typeof events !== 'string' || events === '') {
      return `.${this.options.namespace}`;
    }

    events = events.split(' ');
    let length = events.length;
    for (let i = 0; i < length; i++) {
      events[i] = `${events[i]}.${this.options.namespace}`;
    }
    return events.join(' ');
  }

  eventNameWithId(events) {
    if (typeof events !== 'string' || events === '') {
      return `${this.options.namespace}-${this.instanceId}`;
    }

    events = events.split(' ');
    let length = events.length;
    for (let i = 0; i < length; i++) {
      events[i] = `${events[i]}.${this.options.namespace}-${this.instanceId}`;
    }
    return events.join(' ');
  }

  /**
   * _throttle
   * @description Borrowed from Underscore.js
   */
  throttle(func, wait) {
    let _now = Date.now || function() {
      return new Date().getTime();
    };
    let args, context, result;
    let timeout = null;
    let previous = 0;
    let later = function() {
      previous = _now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      let now = _now();
      let remaining = wait - (now - previous);
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

  getBrowserScrollbarWidth(direction) {
    let attributes = this.attributes[direction],
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
  }

  getOffset(direction) {
    let attributes = this.attributes[direction],
      container = this.$container[0];

    return (container[attributes.pageOffset] || container[attributes.scroll]);
  }

  getPercentOffset(direction) {
    return this.getOffset(direction) / this.getScrollLength(direction);
  }

  getContainerLength(direction) {
    return this.$container[0][this.attributes[direction].clientLength];
  }

  getScrollLength(direction) {
    let scrollLength = this.$content[0][this.attributes[direction].scrollLength];
    return scrollLength - this.getContainerLength(direction);
  }

  scrollTo(direction, value, trigger, sync) {
    let type = typeof value;

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

  scrollBy(direction, value, trigger, sync) {
    let type = typeof value;

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

  move(direction, value, trigger, sync) {
    if (this[direction] !== true || typeof value !== 'number') {
      return;
    }

    this.enter('moving');

    if (value < 0) {
      value = 0;
    } else if (value > this.getScrollLength(direction)) {
      value = this.getScrollLength(direction);
    }

    let attributes = this.attributes[direction];

    let callback = () => {
      this.leave('moving');
    };

    if (sync) {
      this.$container[0][attributes.scroll] = value;

      if (trigger !== false) {
        this.trigger('change', value / this.getScrollLength(direction));
      }
      callback();
    } else {
      this.enter('animating');
      let startTime = getTime$1();
      let start = this.getOffset(direction);
      let end = value;

      let run = (time) => {
        let percent = (time - startTime) / this.options.duration;

        if (percent > 1) {
          percent = 1;
        }

        percent = this.easing.fn(percent);

        let current = parseFloat(start + percent * (end - start), 10);
        this.$container[0][attributes.scroll] = current;

        if (trigger !== false) {
          this.trigger('change', value / this.getScrollLength(direction));
        }

        if (percent === 1) {
          window.cancelAnimationFrame(this._frameId);
          this._frameId = null;

          this.leave('animating');
          callback();
        } else {
          this._frameId = window.requestAnimationFrame(run);
        }
      };

      this._frameId = window.requestAnimationFrame(run);
    }
  }

  scrollXto(value, trigger, sync) {
    return this.scrollTo('horizontal', value, trigger, sync);
  }

  scrollYto(value, trigger, sync) {
    return this.scrollTo('vertical', value, trigger, sync);
  }

  scrollXby(value, trigger, sync) {
    return this.scrollBy('horizontal', value, trigger, sync);
  }

  scrollYby(value, trigger, sync) {
    return this.scrollBy('vertical', value, trigger, sync);
  }

  getBar(direction) {
    if (direction && this[`$${direction}`]) {
      return this[`$${direction}`];
    }
    return this.$bar;
  }

  getBarApi(direction) {
    return this.getBar(direction).data('asScrollbar');
  }

  getBarX() {
    return this.getBar('horizontal');
  }

  getBarY() {
    return this.getBar('vertical');
  }

  showBar(direction) {
    this.getBar(direction).removeClass(this.classes.barHide);
  }

  hideBar(direction) {
    this.getBar(direction).addClass(this.classes.barHide);
  }

  updateBarHandle(direction) {
    let api = this.getBarApi(direction);

    if (!api) {
      return;
    }

    let containerLength = this.getContainerLength(direction),
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

  disable() {
    if (!this.is('disabled')) {
      this.enter('disabled');
      this.$wrap.addClass(this.options.disabledClass).removeClass(this.options.enabledClass);

      this.unbindEvents();
      this.unStyle();
    }
  }

  enable() {
    if (this.is('disabled')) {
      this.leave('disabled');
      this.$wrap.addClass(this.options.enabledClass).removeClass(this.options.disabledClass);

      this.bindEvents();
      this.update();
    }
  }

  update() {
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

  unStyle() {
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

  destory() {
    this.$wrap.removeClass(`${this.classes.wrap}-vertical`)
      .removeClass(`${this.classes.wrap}-horizontal`)
      .removeClass(this.classes.wrap)
      .removeClass(this.options.enabledClass)
      .removeClass(this.classes.disabledClass);
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

  static _jQueryInterface(options, ...params) {
    'use strict';

    if (typeof options === 'string') {
      let method = options;

      if (/^\_/.test(method)) {
        return false;
      } else if ((/^(get)/.test(method))) {
        let api = this.first().data(NAME);
        if (api && typeof api[method] === 'function') {
          return api[method].apply(api, params);
        }
      } else {
        return this.each(function() {
          let api = $.data(this, NAME);
          if (api && typeof api[method] === 'function') {
            api[method].apply(api, params);
          }
        });
      }
    } else {
      return this.each(function() {
        if (!$(this).data(NAME)) {
          $(this).data(NAME, new asScrollable(options, this));
        } else {
          $(this).data(NAME).update();
        }
      });
    }
    return this;
  }

}

$.fn[NAME] = asScrollable._jQueryInterface;
$.fn[NAME].constructor = asScrollable;
$.fn[NAME].noConflict = () => {
  'use strict';

  $.fn[NAME] = JQUERY_NO_CONFLICT;
  return asScrollable._jQueryInterface;
};

export default asScrollable;