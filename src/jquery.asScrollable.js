/*
 * asScrollable
 * https://github.com/amazingSurge/jquery-asScrollable
 *
 * Copyright (c) 2014 amazingSurge
 * Licensed under the GPL license.
 */

(function(window, document, $, Scrollbar, undefined) {
    "use strict";

    var pluginName = 'asScrollable';

    function conventToPercentage(n) {
        if (n < 0) {
            n = 0;
        } else if (n > 1) {
            n = 1;
        }
        return n * 100 + '%';
    }

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
                position: 'top',
                overflow: 'overflow-y',

                scroll: 'scrollTop',
                scrollLength: 'scrollHeight',
                pageOffset: 'pageYOffset',

                length: 'height',
                clientLength: 'clientHeight',
                offset: 'offsetHeight',

                crossLength: 'width',
                crossClientLength: 'clientWidth',
                crossOffset: 'offsetWidth'
           },
           horizontal: {
                axis: 'X',
                position: 'left',
                overflow: 'overflow-x',

                scroll: 'scrollLeft',
                scrollLength: 'scrollWidth',
                pageOffset: 'pageXOffset',

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

        // Current position information.
        this._position = {
            x: 0,
            y: 0
        };

        this.horizontal = null;
        this.vertical = null;

        this.$bar = null;

        if(this.options.containerSelector) {
            this.$container = this.$element.find(this.options.containerSelector);
        } else {
            this.$container = this.$element.wrap('<div>');
            this.$element = this.$container.parent();
        }

        if(this.options.contentSelector) {
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

        scrollableClass: 'is-scrollable',
        scrollingClass: 'is-scrolling',
        hoveringClass: 'is-hovering',
        
        direction: 'vertical', // vertical, horizontal, both, auto
        
        responsive: false,
        showOnHover: false,
        showOnBarHover: true,
        scrollbar: {}
    };

    Plugin.prototype = {
        constructor: Plugin,

        init: function(){
            this.$element.addClass(this.options.namespace);
            this.$container.addClass(this.classes.container);
            this.$content.addClass(this.classes.content);
            
            if (this.options.skin) {
                this.$element.addClass(this.classes.skin);
            }

            switch(this.options.direction){
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
                default:
                    var overflowX = this.$content.css('overflow-x'), overflowY = this.$content.css('overflow-y');
                    if(overflowX === 'scroll' || overflowX === 'auto') {
                        this.horizontal = true;
                    }
                    if(overflowY === 'scroll' || overflowY === 'auto') {
                        this.vertical = true;
                    }
                    break;
            }

            this.$container.css('overflow', 'hidden');

            this.$element.css({
                overflow: 'hidden',
                position: 'relative'
            });

            if(this.horizontal) {
                this.initLayout('horizontal');
                this.createBar('horizontal');
            }

            if(this.vertical) {
                this.initLayout('vertical');
                this.createBar('vertical');
            }

            this.bindEvents();
        },

        bindEvents: function() {
            var self = this;
            var options = this.options;

            this.$element.on(this.eventName('mouseenter'), function(e) {
                self.$element.addClass(self.options.hoveringClass);
                self.enter('hovering');
                self.trigger('hover');
            });

            this.$element.on(this.eventName('mouseleave'), function(e) {
                self.$element.removeClass(self.options.hoveringClass);

                if (!self.is('hovering')) {
                    return;
                }
                self.leave('hovering');
                self.trigger('hovered');
            });

            if(options.showOnHover){
                if(options.showOnBarHover){
                    this.$bar.on('asScrollbar::hover', function(){
                        self.showBar(this.direction);
                    }).on('asScrollbar::hovered', function(){
                        self.hideBar(this.direction);
                    });
                } else {
                    this.$element.on(pluginName + '::hover', $.proxy(this.showBar, this));
                    this.$element.on(pluginName + '::hovered', $.proxy(this.hideBar, this));
                }
            }

            this.$container.on(this.eventName('scroll'), function(){
                if(self.horizontal) {
                    var oldLeft = self.offsetLeft;
                    self.offsetLeft = self.getOffset('horizontal');

                    if(oldLeft !== self.offsetLeft ) {
                        self.trigger('scroll', self.getPercentOffset('horizontal'), 'horizontal');
                    }
                }

                if(self.vertical) {
                    var oldTop = self.offsetTop;
                    
                    self.offsetTop = self.getOffset('vertical');

                    if(oldTop !== self.offsetTop ) {
                        self.trigger('scroll', self.getPercentOffset('vertical'), 'vertical');
                    }
                }
            });

            this.$element.on(pluginName + '::scroll', function(e, api, value, direction){
                var bar = api.getBarApi(direction);

                bar.moveTo(conventToPercentage(value), false, true);
            });

            this.$bar.on('asScrollbar::change', function(e, api, value){

            });
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


        initLayout: function(direction) {
            if(direction === 'vertical') {
                this.$content.css('height', this.$element.height());
            }
            var attributes = this.attributes[direction], container = this.$container[0];

            this.$container.css(attributes.overflow, 'scroll');
            this.$container.css(attributes.crossLength, container.parentNode[attributes.crossClientLength] + container[attributes.crossOffset] - container[attributes.crossClientLength] + 'px');
        },

        createBar: function(direction) {
            var options = $.extend(this.options.scrollbar, {
                namespace: this.classes.bar,
                direction: direction,
                keyboard: false
            });
            var $bar = $('<div>').asScrollbar(options);

            if(this.options.showOnHover){
                $bar.addClass(this.classes.barHide);
            }

            $bar.appendTo(this.$element);

            this['$'+direction] = $bar;

            if(this.$bar === null) {
                this.$bar = $bar;
            } else {
                this.$bar.add($bar);
            }

            this.updateBarHandle(direction);
        },

        move: function() {
            
        },

        updateBarHandle: function(direction) {
            var api = this.getBarApi(direction);

            var attributes = this.attributes[direction], 
                contentLength = this.$content[0][attributes.scrollLength],
                containerLength = this.$element[0][attributes.clientLength];

                console.info(contentLength);
                console.info(containerLength);

            if(contentLength > containerLength) {
                api.setHandleLength(api.getBarLength() * containerLength/contentLength);
            }

            //api.setHandleLength();
            //api.setHandlePosition();
        },

        getOffset: function(direction) {
            var attributes = this.attributes[direction],
            container = this.$container[0];

            return (container[attributes.pageOffset] || container[attributes.scroll]);
        },

        getPercentOffset: function(direction) {
            var attributes = this.attributes[direction],
                content = this.$content[0];
            return this.getOffset(direction) / content[attributes.clientLength];
        },

        getBar: function(direction) {
            if(direction && this['$'+direction]){
                return this['$'+direction]; 
            } else {
                return this.$bar;
            }
        },

        getBarApi: function(direction) {
            return this.getBar(direction).data('asScrollbar');
        },

        getBarX: function(){
            return this.getBar('horizontal');
        },

        getBarY: function(){
            return this.getBar('vertical');
        },

        showBar: function(direction) {
            this.getBar(direction).removeClass(this.classes.barHide);
        },

        hideBar: function(direction) {
            this.getBar(direction).addClass(this.classes.barHide);
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

})(window, document, jQuery, (function($) {
    if ($.asScrollbar === undefined) {
        // console.info('lost dependency lib of $.asScrollbar , please load it first !');
        return false;
    } else {
        return $.asScrollbar;
    }
}(jQuery)));