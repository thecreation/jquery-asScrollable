/*
 * asScrollable
 * https://github.com/amazingSurge/jquery-asScrollable
 *
 * Copyright (c) 2014 amazingSurge
 * Licensed under the GPL license.
 */

(function($, document, window, undefined) {
    "use strict";

    var pluginName = 'asScrollable';

    var Plugin = $[pluginName] = function(options, container) {
        this.$container = $(container);
        options = this.options = $.extend({}, Plugin.defaults, options || {}, this.$container.data('options') || {});

        this.classes = {
            content: options.namespace + '-' + 'content',
            container: options.namespace + '-' + 'container',
            skin: options.skin
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

        scrollableClass: 'is-scrollable',
        scrollingClass: 'is-scrolling',
        
        direction: 'vertical',
        
        responsive: false,
        showOnhover: false
    };

    Plugin.prototype = {
        constructor: Plugin,

        init: function(){
            this.$content.addClass(this.classes.content);
            this.$container.addClass(this.classes.container);

            this.$content.css('overflow', 'hidden');

            this.$container.css({
                overflow: 'hidden',
                position: 'relative'
            });

            if (this.options.skin) {
                this.$container.addClass(this.classes.skin);
            }
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