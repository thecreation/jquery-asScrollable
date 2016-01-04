'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'jQuery', '../libs/jquery.asScrollbar.test'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('jQuery'), require('../libs/jquery.asScrollbar.test'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.jQuery, global.jqueryAsScrollbar);
		global.jqueryAsScrollable = mod.exports;
	}
})(this, function (exports, _jQuery, _jqueryAsScrollbar) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _jQuery2 = babelHelpers.interopRequireDefault(_jQuery);

	var _jqueryAsScrollbar2 = babelHelpers.interopRequireDefault(_jqueryAsScrollbar);

	var NAME = 'asScrollable';
	var DEFAULT = {
		namespace: 'asScrollable',
		skin: null,
		contentSelector: null,
		containerSelector: null,
		enabledClass: 'is-enabled',
		disabledClass: 'is-disabled',
		draggingClass: 'is-dragging',
		hoveringClass: 'is-hovering',
		scrollingClass: 'is-scrolling',
		direction: 'vertical',
		showOnHover: true,
		showOnBarHover: false,
		duration: 500,
		easing: 'ease-in',
		responsive: true,
		throttle: 20,
		scrollbar: {}
	};
	var instanceId = 0;

	var getTime = function getTime() {
		if (typeof window.performance !== 'undefined' && window.performance.now) {
			return window.performance.now();
		} else {
			return Date.now();
		}
	};

	var isPercentage = function isPercentage(n) {
		return typeof n === 'string' && n.indexOf('%') != -1;
	};

	var conventToPercentage = function conventToPercentage(n) {
		if (n < 0) {
			n = 0;
		} else if (n > 1) {
			n = 1;
		}

		return parseFloat(n).toFixed(4) * 100 + '%';
	};

	var convertPercentageToFloat = function convertPercentageToFloat(n) {
		return parseFloat(n.slice(0, -1) / 100, 10);
	};

	var isFFLionScrollbar = (function () {
		var isOSXFF = undefined,
		    ua = undefined,
		    version = undefined;
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

	var asScrollable = (function () {
		function asScrollable(options, element) {
			babelHelpers.classCallCheck(this, asScrollable);
			this.$element = (0, _jQuery2.default)(element);
			options = this.options = _jQuery2.default.extend({}, DEFAULT, options || {}, this.$element.data('options') || {});
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
			this._states = {};
			this.horizontal = null;
			this.vertical = null;
			this.$bar = null;
			this._frameId = null;
			this._timeoutId = null;
			this.instanceId = ++instanceId;
			this.easing = _jqueryAsScrollbar2.default.easing[this.options.easing] || _jqueryAsScrollbar2.default.easing.ease;
			var position = this.$element.css('position');

			if (this.options.containerSelector) {
				this.$container = this.$element.find(this.options.containerSelector);
				this.$wrap = this.$element;

				if (position == 'static') {
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

		babelHelpers.createClass(asScrollable, [{
			key: 'init',
			value: function init() {
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
				var _this = this;

				var self = this;

				if (this.options.responsive) {
					(0, _jQuery2.default)(window).on(this.eventNameWithId('orientationchange'), function () {
						_this.update();
					});
					(0, _jQuery2.default)(window).on(this.eventNameWithId('resize'), this.throttle(function () {
						_this.update();
					}, this.options.throttle));
				}

				if (!this.horizontal && !this.vertical) {
					return;
				}

				this.$wrap.on(this.eventName('mouseenter'), function () {
					_this.$wrap.addClass(_this.options.hoveringClass);

					_this.enter('hovering');

					_this.trigger('hover');
				});
				this.$wrap.on(this.eventName('mouseleave'), function () {
					_this.$wrap.removeClass(_this.options.hoveringClass);

					if (!_this.is('hovering')) {
						return;
					}

					_this.leave('hovering');

					_this.trigger('hovered');
				});

				if (this.options.showOnHover) {
					if (this.options.showOnBarHover) {
						this.$bar.on('asScrollbar::hover', function () {
							self.showBar(this.direction);
						}).on('asScrollbar::hovered', function () {
							self.hideBar(this.direction);
						});
					} else {
						this.$element.on(NAME + '::hover', _jQuery2.default.proxy(this.showBar, this));
						this.$element.on(NAME + '::hovered', _jQuery2.default.proxy(this.hideBar, this));
					}
				}

				this.$container.on(this.eventName('scroll'), function () {
					if (_this.horizontal) {
						var oldLeft = _this.offsetLeft;
						_this.offsetLeft = _this.getOffset('horizontal');

						if (oldLeft !== _this.offsetLeft) {
							_this.trigger('scroll', _this.getPercentOffset('horizontal'), 'horizontal');

							if (_this.offsetLeft === 0) {
								_this.trigger('scrolltop', 'horizontal');
							}

							if (_this.offsetLeft === _this.getScrollLength('horizontal')) {
								_this.trigger('scrollend', 'horizontal');
							}
						}
					}

					if (_this.vertical) {
						var oldTop = _this.offsetTop;
						_this.offsetTop = _this.getOffset('vertical');

						if (oldTop !== _this.offsetTop) {
							_this.trigger('scroll', _this.getPercentOffset('vertical'), 'vertical');

							if (_this.offsetTop === 0) {
								_this.trigger('scrolltop', 'vertical');
							}

							if (_this.offsetTop === _this.getScrollLength('vertical')) {
								_this.trigger('scrollend', 'vertical');
							}
						}
					}
				});
				this.$element.on(NAME + '::scroll', function (e, api, value, direction) {
					if (!_this.is('scrolling')) {
						_this.enter('scrolling');

						_this.$wrap.addClass(_this.options.scrollingClass);
					}

					var bar = api.getBarApi(direction);
					bar.moveTo(conventToPercentage(value), false, true);
					clearTimeout(_this._timeoutId);
					_this._timeoutId = setTimeout(function () {
						_this.$wrap.removeClass(_this.options.scrollingClass);

						_this.leave('scrolling');
					}, 200);
				});
				this.$bar.on('asScrollbar::change', function (e, api, value) {
					self.scrollTo(this.direction, conventToPercentage(value), false, true);
				});
				this.$bar.on('asScrollbar::drag', function () {
					_this.$wrap.addClass(_this.options.draggingClass);
				}).on('asScrollbar::dragged', function () {
					_this.$wrap.removeClass(_this.options.draggingClass);
				});
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
				var scrollbarWidth = this.getBrowserScrollbarWidth(direction),
				    parentLength = container.parentNode[attributes.crossClientLength];
				this.$content.css(attributes.crossLength, parentLength + 'px');
				this.$container.css(attributes.crossLength, scrollbarWidth + parentLength + 'px');

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
				for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
					params[_key - 1] = arguments[_key];
				}

				var data = [this].concat(params);
				this.$element.trigger(NAME + '::' + eventType, data);
				eventType = eventType.replace(/\b\w+\b/g, function (word) {
					return word.substring(0, 1).toUpperCase() + word.substring(1);
				});
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

				for (var i = 0; i < length; i++) {
					events[i] = events[i] + '.' + this.options.namespace;
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

				for (var i = 0; i < length; i++) {
					events[i] = events[i] + '.' + this.options.namespace + '-' + this.instanceId;
				}

				return events.join(' ');
			}
		}, {
			key: 'throttle',
			value: function throttle(func, wait) {
				var _now = Date.now || function () {
					return new Date().getTime();
				};

				var context = undefined,
				    args = undefined,
				    result = undefined;
				var timeout = null;
				var previous = 0;

				var later = function later() {
					previous = _now();
					timeout = null;
					result = func.apply(context, args);
					context = args = null;
				};

				return function () {
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
				    outer = undefined,
				    outerStyle = undefined;

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
				var type = typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value);

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
			}
		}, {
			key: 'scrollBy',
			value: function scrollBy(direction, value, trigger, sync) {
				var type = typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value);

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
			}
		}, {
			key: 'move',
			value: function move(direction, value, trigger, sync) {
				var _this2 = this;

				if (this[direction] !== true || typeof value !== "number") {
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
					_this2.leave('moving');
				};

				if (sync) {
					this.$container[0][attributes.scroll] = value;

					if (trigger !== false) {
						this.trigger('change', value / this.getScrollLength(direction));
					}

					callback();
				} else {
					(function () {
						_this2.enter('animating');

						var startTime = getTime();

						var start = _this2.getOffset(direction);

						var end = value;

						var run = function run(time) {
							var percent = (time - startTime) / _this2.options.duration;

							if (percent > 1) {
								percent = 1;
							}

							percent = _this2.easing.fn(percent);
							var current = parseFloat(start + percent * (end - start), 10);
							_this2.$container[0][attributes.scroll] = current;

							if (trigger !== false) {
								_this2.trigger('change', value / _this2.getScrollLength(direction));
							}

							if (percent === 1) {
								window.cancelAnimationFrame(_this2._frameId);
								_this2._frameId = null;

								_this2.leave('animating');

								callback();
							} else {
								_this2._frameId = window.requestAnimationFrame(run);
							}
						};

						_this2._frameId = window.requestAnimationFrame(run);
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
				} else {
					return this.$bar;
				}
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

				var scrollLength = this.getScrollLength(direction),
				    containerLength = this.getContainerLength(direction);

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
						'height': '',
						'padding-bottom': ''
					});
					this.$content.css({
						'height': ''
					});
				}

				if (this.vertical) {
					this.$container.css({
						'width': '',
						'height': '',
						'padding-right': ''
					});
					this.$content.css({
						'width': ''
					});
				}

				if (!this.options.containerSelector) {
					this.$wrap.css({
						'height': ''
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
				"use strict";

				var _this3 = this;

				for (var _len2 = arguments.length, params = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
					params[_key2 - 1] = arguments[_key2];
				}

				if (typeof options === 'string') {
					var _ret2 = (function () {
						var method = options;

						if (/^\_/.test(method)) {
							return {
								v: false
							};
						} else if (/^(get)/.test(method)) {
							var api = _this3.first().data(NAME);

							if (api && typeof api[method] === 'function') {
								return {
									v: api[method].apply(api, params)
								};
							}
						} else {
							return {
								v: _this3.each(function () {
									var api = _jQuery2.default.data(this, NAME);

									if (api && typeof api[method] === 'function') {
										api[method].apply(api, params);
									}
								})
							};
						}
					})();

					if ((typeof _ret2 === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret2)) === "object") return _ret2.v;
				} else {
					return this.each(function () {
						if (!(0, _jQuery2.default)(this).data(NAME)) {
							(0, _jQuery2.default)(this).data(NAME, new asScrollable(options, this));
						} else {
							(0, _jQuery2.default)(this).data(NAME).update();
						}
					});
				}

				return this;
			}
		}]);
		return asScrollable;
	})();

	_jQuery2.default.fn[NAME] = asScrollable._jQueryInterface;
	_jQuery2.default.fn[NAME].constructor = asScrollable;

	_jQuery2.default.fn[NAME].noConflict = function () {
		_jQuery2.default.fn[NAME] = JQUERY_NO_CONFLICT;
		return asScrollable._jQueryInterface;
	};

	exports.default = asScrollable;
});
