/*
 * Foundation Responsive Library
 * http://foundation.zurb.com
 * Copyright 2013, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/

/*jslint unparam: true, browser: true, indent: 2 */

// Accommodate running jQuery or Zepto in noConflict() mode by
// using an anonymous function to redefine the $ shorthand name.
// See http://docs.jquery.com/Using_jQuery_with_Other_Libraries
// and http://zeptojs.com/
var libFuncName = null;
if (typeof jQuery === "undefined" &&
    typeof Zepto === "undefined" &&
    typeof $ === "function") {
    libFuncName = $;
} else if (typeof jQuery === "function") {
    libFuncName = jQuery;
} else if (typeof Zepto === "function") {
    libFuncName = Zepto;
} else {
    throw new TypeError();
}

(function ($) {

(function () {
  // add dusty browser stuff
  if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun /*, thisp */) {
      "use strict";
   
      if (this == null) {
        throw new TypeError();
      }
   
      var t = Object(this),
          len = t.length >>> 0;
      if (typeof fun != "function") {
        try {
          throw new TypeError();
        } catch (e) {
          return;
        }
      }
   
      var res = [],
          thisp = arguments[1];
      for (var i = 0; i < len; i++) {
        if (i in t) {
          var val = t[i]; // in case fun mutates this
          if (fun && fun.call(thisp, val, i, t)) {
            res.push(val);
          }
        }
      }
   
      return res;
    };

    if (!Function.prototype.bind) {
      Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
          // closest thing possible to the ECMAScript 5 internal IsCallable function
          throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }
     
        var aArgs = Array.prototype.slice.call(arguments, 1), 
            fToBind = this, 
            fNOP = function () {},
            fBound = function () {
              return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
               aArgs.concat(Array.prototype.slice.call(arguments)));
            };
     
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
     
        return fBound;
      };
    }
  }

  // fake stop() for zepto.
  $.fn.stop = $.fn.stop || function() {
    return this;
  };
}());

;(function (window, document, undefined) {
  'use strict';

  window.Foundation = {
    name : 'Foundation',

    version : '4.0.8',

    // global Foundation cache object
    cache : {},

    init : function (scope, libraries, method, options, response, /* internal */ nc) {
      var library_arr,
          args = [scope, method, options, response],
          responses = [],
          nc = nc || false;
          
      // disable library error catching,
      // used for development only
      if (nc) this.nc = nc;

      // set foundation global scope
      this.scope = scope || this.scope;

      if (libraries && typeof libraries === 'string') {
        if (/off/i.test(libraries)) return this.off();

        library_arr = libraries.split(' ');

        if (library_arr.length > 0) {
          for (var i = library_arr.length - 1; i >= 0; i--) {
            responses.push(this.init_lib(library_arr[i], args));
          }
        }
      } else {
        for (var lib in this.libs) {
          responses.push(this.init_lib(lib, args));
        }
      }

      // if first argument is callback, add to args
      if (typeof libraries === 'function') {
        args.unshift(libraries);
      }

      return this.response_obj(responses, args);
    },

    response_obj : function (response_arr, args) {
      for (var callback in args) {
        if (typeof args[callback] === 'function') {
          return args[callback]({
            errors: response_arr.filter(function (s) {
              if (typeof s === 'string') return s;
            })
          });
        }
      }

      return response_arr;
    },

    init_lib : function (lib, args) {
      return this.trap(function () {
        if (this.libs.hasOwnProperty(lib)) {
          this.patch(this.libs[lib]);
          return this.libs[lib].init.apply(this.libs[lib], args);
        }
      }.bind(this), lib);
    },

    trap : function (fun, lib) {
      if (!this.nc) {
        try {
          return fun();
        } catch (e) {
          return this.error({name: lib, message: 'could not be initialized', more: e.name + ' ' + e.message});
        }
      }

      return fun();
    },

    patch : function (lib) {
      this.fix_outer(lib);
    },

    inherit : function (scope, methods) {
      var methods_arr = methods.split(' ');

      for (var i = methods_arr.length - 1; i >= 0; i--) {
        if (this.lib_methods.hasOwnProperty(methods_arr[i])) {
          this.libs[scope.name][methods_arr[i]] = this.lib_methods[methods_arr[i]];
        }
      }
    },

    random_str : function (length) {
      var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
      
      if (!length) {
          length = Math.floor(Math.random() * chars.length);
      }
      
      var str = '';
      for (var i = 0; i < length; i++) {
          str += chars[Math.floor(Math.random() * chars.length)];
      }
      return str;
    },

    libs : {},

    // methods that can be inherited in libraries
    lib_methods : {
      set_data : function (node, data) {
        // this.name references the name of the library calling this method
        var id = [this.name,+new Date(),Foundation.random_str(5)].join('-');

        Foundation.cache[id] = data;
        node.attr('data-' + this.name + '-id', id);
        return data;
      },

      get_data : function (node) {
        return Foundation.cache[node.attr('data-' + this.name + '-id')];
      },

      remove_data : function (node) {
        if (node) {
          delete Foundation.cache[node.attr('data-' + this.name + '-id')];
          node.attr('data-' + this.name + '-id', '');
        } else {
          $('[data-' + this.name + '-id]').each(function () {
            delete Foundation.cache[$(this).attr('data-' + this.name + '-id')];
            $(this).attr('data-' + this.name + '-id', '');
          });
        }
      },

      throttle : function(fun, delay) {
        var timer = null;
        return function () {
          var context = this, args = arguments;
          clearTimeout(timer);
          timer = setTimeout(function () {
            fun.apply(context, args);
          }, delay);
        };
      },

      // parses data-options attribute on nodes and turns
      // them into an object
      data_options : function (el) {
        var opts = {}, ii, p,
            opts_arr = (el.attr('data-options') || ':').split(';'),
            opts_len = opts_arr.length;

        function isNumber (o) {
          return ! isNaN (o-0) && o !== null && o !== "" && o !== false && o !== true;
        }

        function trim(str) {
          if (typeof str === 'string') return $.trim(str);
          return str;
        }

        // parse options
        for (ii = opts_len - 1; ii >= 0; ii--) {
          p = opts_arr[ii].split(':');

          if (/true/i.test(p[1])) p[1] = true;
          if (/false/i.test(p[1])) p[1] = false;
          if (isNumber(p[1])) p[1] = parseInt(p[1], 10);

          if (p.length === 2 && p[0].length > 0) {
            opts[trim(p[0])] = trim(p[1]);
          }
        }

        return opts;
      },

      delay : function (fun, delay) {
        return setTimeout(fun, delay);
      },

      // animated scrolling
      scrollTo : function (el, to, duration) {
        if (duration < 0) return;
        var difference = to - $(window).scrollTop();
        var perTick = difference / duration * 10;

        this.scrollToTimerCache = setTimeout(function() {
          if (!isNaN(parseInt(perTick, 10))) {
            window.scrollTo(0, $(window).scrollTop() + perTick);
            this.scrollTo(el, to, duration - 10);
          }
        }.bind(this), 10);
      },

      // not supported in core Zepto
      scrollLeft : function (el) {
        if (!el.length) return;
        return ('scrollLeft' in el[0]) ? el[0].scrollLeft : el[0].pageXOffset;
      },

      // test for empty object or array
      empty : function (obj) {
        if (obj.length && obj.length > 0)    return false;
        if (obj.length && obj.length === 0)  return true;

        for (var key in obj) {
          if (hasOwnProperty.call(obj, key))    return false;
        }

        return true;
      }
    },

    fix_outer : function (lib) {
      lib.outerHeight = function (el, bool) {
        if (typeof Zepto === 'function') {
          return el.height();
        }

        if (typeof bool !== 'undefined') {
          return el.outerHeight(bool);
        }

        return el.outerHeight();
      };

      lib.outerWidth = function (el) {
        if (typeof Zepto === 'function') {
          return el.width();
        }

        if (typeof bool !== 'undefined') {
          return el.outerWidth(bool);
        }

        return el.outerWidth();
      };
    },

    error : function (error) {
      return error.name + ' ' + error.message + '; ' + error.more;
    },

    // remove all foundation events.
    off: function () {
      $(this.scope).off('.fndtn');
      $(window).off('.fndtn');
      return true;
    },

    zj : function () {
      try {
        return Zepto;
      } catch (e) {
        return jQuery;
      }
    }()
  },

  $.fn.foundation = function () {
    var args = Array.prototype.slice.call(arguments, 0);

    return this.each(function () {
      Foundation.init.apply(Foundation, [this].concat(args));
      return this;
    });
  };

}(this, this.document));

})(libFuncName);


/*jslint unparam: true, browser: true, indent: 2 */

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.topbar = {
    name : 'topbar',

    version : '4.0.0',

    settings : {
      index : 0,
      stickyClass : 'sticky',
      custom_back_text: true,
      back_text: 'Back',
      init : false
    },

    init : function (scope, method, options) {
      var self = this;
      this.scope = scope || this.scope;

      if (typeof method === 'object') {
        $.extend(true, this.settings, method);
      }

      if (typeof method != 'string') {

        $('.top-bar').each(function () {
          self.settings.$w = $(window);
          self.settings.$topbar = $(this);
          self.settings.$section = self.settings.$topbar.find('section');
          self.settings.$titlebar = self.settings.$topbar.children('ul').first();


          self.settings.$topbar.data('index', 0);

          var breakpoint = $("<div class='top-bar-js-breakpoint'/>").insertAfter(self.settings.$topbar);
          self.settings.breakPoint = breakpoint.width();
          breakpoint.remove();

          self.assemble();

          if (self.settings.$topbar.parent().hasClass('fixed')) {
            $('body').css('padding-top', self.outerHeight(self.settings.$topbar));
          }
        });

        if (!self.settings.init) {
          this.events();
        }

        return this.settings.init;
      } else {
        // fire method
        return this[method].call(this, options);
      }
    },

    events : function () {
      var self = this;
      var offst = this.outerHeight($('.top-bar'));
      $(this.scope)
        .on('click.fndtn.topbar', '.top-bar .toggle-topbar', function (e) {
          var topbar = $(this).closest('.top-bar'),
              section = topbar.find('section, .section'),
              titlebar = topbar.children('ul').first();

          if (!topbar.data('height')) self.largestUL();

          e.preventDefault();

          if (self.breakpoint()) {
            topbar
              .toggleClass('expanded')
              .css('min-height', '');
          }

          if (!topbar.hasClass('expanded')) {
            section.css({left: '0%'});
            section.find('>.name').css({left: '100%'});
            section.find('li.moved').removeClass('moved');
            topbar.data('index', 0);
          }

          if (topbar.parent().hasClass('fixed')) {
            topbar.parent().removeClass('fixed');
            $('body').css('padding-top','0');
            window.scrollTo(0);
          } else if (topbar.hasClass('fixed expanded')) {
            topbar.parent().addClass('fixed');
            $('body').css('padding-top',offst);
          }

        })

        .on('click.fndtn.topbar', '.top-bar .has-dropdown>a', function (e) {
          var topbar = $(this).closest('.top-bar'),
              section = topbar.find('section, .section'),
              titlebar = topbar.children('ul').first();

          if (Modernizr.touch || self.breakpoint()) {
            e.preventDefault();
          }

          if (self.breakpoint()) {
            var $this = $(this),
                $selectedLi = $this.closest('li');

            topbar.data('index', topbar.data('index') + 1);
            $selectedLi.addClass('moved');
            section.css({left: -(100 * topbar.data('index')) + '%'});
            section.find('>.name').css({left: 100 * topbar.data('index') + '%'});

            $this.siblings('ul')
              .height(topbar.data('height') + self.outerHeight(titlebar, true));
            topbar
              .css('min-height', topbar.data('height') + self.outerHeight(titlebar, true) * 2)
          }
      });

      $(window).on('resize.fndtn.topbar', function () {
        if (!this.breakpoint()) {
          $('.top-bar').css('min-height', '');
        }
      }.bind(this));

      // Go up a level on Click
      $(this.scope).on('click.fndtn', '.top-bar .has-dropdown .back', function (e) {
        e.preventDefault();

        var $this = $(this),
            topbar = $this.closest('.top-bar'),
            section = topbar.find('section, .section'),
            $movedLi = $this.closest('li.moved'),
            $previousLevelUl = $movedLi.parent();

        topbar.data('index', topbar.data('index') - 1);
        section.css({left: -(100 * topbar.data('index')) + '%'});
        section.find('>.name').css({'left': 100 * topbar.data('index') + '%'});

        if (topbar.data('index') === 0) {
          topbar.css('min-height', 0);
        }

        setTimeout(function () {
          $movedLi.removeClass('moved');
        }, 300);
      });
    },

    breakpoint : function () {
      return $(window).width() <= this.settings.breakPoint || $('html').hasClass('lt-ie9');
    },

    assemble : function () {
      var self = this;
      // Pull element out of the DOM for manipulation
      this.settings.$section.detach();

      this.settings.$section.find('.has-dropdown>a').each(function () {
        var $link = $(this),
            $dropdown = $link.siblings('.dropdown'),
            $titleLi = $('<li class="title back js-generated"><h5><a href="#"></a></h5></li>');

        // Copy link to subnav
        if (self.settings.custom_back_text == true) {
          $titleLi.find('h5>a').html('&laquo; ' + self.settings.back_text);
        } else {
          $titleLi.find('h5>a').html('&laquo; ' + $link.html());
        }
        $dropdown.prepend($titleLi);
      });

      // Put element back in the DOM
      this.settings.$section.appendTo(this.settings.$topbar);

      // check for sticky
      this.sticky();
    },

    largestUL : function () {
      var uls = this.settings.$topbar.find('section ul ul'),
          largest = uls.first(),
          total = 0,
          self = this;

      uls.each(function () {
        if ($(this).children('li').length > largest.children('li').length) {
          largest = $(this);
        }
      });

      largest.children('li').each(function () { total += self.outerHeight($(this), true); });

      this.settings.$topbar.data('height', total);
    },

    sticky : function () {
      var klass = '.' + this.settings.stickyClass;
      if ($(klass).length > 0) {
        var distance = $(klass).length ? $(klass).offset().top: 0,
            $window = $(window);
            var offst = this.outerHeight($('.top-bar'));

          $window.scroll(function() {
            if ($window.scrollTop() >= (distance)) {
              $(klass).addClass("fixed");
              $('body').css('padding-top',offst);
            }

            else if ($window.scrollTop() < distance) {
              $(klass).removeClass("fixed");
              $('body').css('padding-top','0');
            }
        });
      }
    },

    off : function () {
      $(this.scope).off('.fndtn.topbar');
      $(window).off('.fndtn.topbar');
    }
  };
}(Foundation.zj, this, this.document));


/*jslint unparam: true, browser: true, indent: 2 */

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.clearing = {
    name : 'clearing',

    version : '4.0.0',

    settings : {
      templates : {
        viewing : '<a href="#" class="clearing-close">&times;</a>' +
          '<div class="visible-img" style="display: none"><img src="//:0">' +
          '<p class="clearing-caption"></p><a href="#" class="clearing-main-left"><span></span></a>' +
          '<a href="#" class="clearing-main-right"><span></span></a></div>'
      },

      // comma delimited list of selectors that, on click, will close clearing,
      // add 'div.clearing-blackout, div.visible-img' to close on background click
      close_selectors : '.clearing-close',

      // event initializers and locks
      init : false,
      locked : false
    },

    init : function (scope, method, options) {
      this.scope = this.scope || scope;
      Foundation.inherit(this, 'set_data get_data remove_data throttle');

      if (typeof method === 'object') {
        options = $.extend(true, this.settings, method);
      }

      if (typeof method != 'string') {
        $(this.scope).find('ul[data-clearing]').each(function () {
          var self = Foundation.libs.clearing,
              $el = $(this),
              options = options || {},
              settings = self.get_data($el);

          if (!settings) {
            options.$parent = $el.parent();

            self.set_data($el, $.extend(true, self.settings, options));

            self.assemble($el.find('li'));

            if (!self.settings.init) {
              self.events().swipe_events();
            }
          }
        });

        return this.settings.init;
      } else {
        // fire method
        return this[method].call(this, options);
      }
    },

    // event binding and initial setup

    events : function () {
      var self = this;

      $(this.scope)
        .on('click.fndtn.clearing', 'ul[data-clearing] li',
          function (e, current, target) {
            var current = current || $(this),
                target = target || current,
                settings = self.get_data(current.parent());

            e.preventDefault();
            if (!settings) self.init();

            // set current and target to the clicked li if not otherwise defined.
            self.open($(e.target), current, target);
            self.update_paddles(target);
          })

        .on('click.fndtn.clearing', '.clearing-main-right',
          function (e) { this.nav(e, 'next') }.bind(this))
        .on('click.fndtn.clearing', '.clearing-main-left',
          function (e) { this.nav(e, 'prev') }.bind(this))
        .on('click.fndtn.clearing', this.settings.close_selectors,
          function (e) { Foundation.libs.clearing.close(e, this) })
        .on('keydown.fndtn.clearing',
          function (e) { this.keydown(e) }.bind(this));

      $(window).on('resize.fndtn.clearing',
        function (e) { this.resize() }.bind(this));

      this.settings.init = true;
      return this;
    },

    swipe_events : function () {
      var self = this;

      $(this.scope)
        .on('touchstart.fndtn.clearing', '.visible-img', function(e) {
          if (!e.touches) { e = e.originalEvent; }
          var data = {
                start_page_x: e.touches[0].pageX,
                start_page_y: e.touches[0].pageY,
                start_time: (new Date()).getTime(),
                delta_x: 0,
                is_scrolling: undefined
              };

          $(this).data('swipe-transition', data);
          e.stopPropagation();
        })
        .on('touchmove.fndtn.clearing', '.visible-img', function(e) {
          if (!e.touches) { e = e.originalEvent; }
          // Ignore pinch/zoom events
          if(e.touches.length > 1 || e.scale && e.scale !== 1) return;

          var data = $(this).data('swipe-transition');

          if (typeof data === 'undefined') {
            data = {};
          }

          data.delta_x = e.touches[0].pageX - data.start_page_x;

          if ( typeof data.is_scrolling === 'undefined') {
            data.is_scrolling = !!( data.is_scrolling || Math.abs(data.delta_x) < Math.abs(e.touches[0].pageY - data.start_page_y) );
          }

          if (!data.is_scrolling && !data.active) {
            e.preventDefault();
            var direction = (data.delta_x < 0) ? 'next' : 'prev';
            data.active = true;
            self.nav(e, direction);
          }
        })
        .on('touchend.fndtn.clearing', '.visible-img', function(e) {
          $(this).data('swipe-transition', {});
          e.stopPropagation();
        });
    },

    assemble : function ($li) {
      var $el = $li.parent(),
          settings = this.get_data($el),
          grid = $el.detach(),
          data = {
            grid: '<div class="carousel">' + this.outerHTML(grid[0]) + '</div>',
            viewing: settings.templates.viewing
          },
          wrapper = '<div class="clearing-assembled"><div>' + data.viewing +
            data.grid + '</div></div>';

      return settings.$parent.append(wrapper);
    },

    // event callbacks

    open : function ($image, current, target) {
      var root = target.closest('.clearing-assembled'),
          container = root.find('div').first(),
          visible_image = container.find('.visible-img'),
          image = visible_image.find('img').not($image);

      if (!this.locked()) {
        // set the image to the selected thumbnail
        image.attr('src', this.load($image));

        this.loaded(image, function () {
          // toggle the gallery
          root.addClass('clearing-blackout');
          container.addClass('clearing-container');
          visible_image.show();
          this.fix_height(target)
            .caption(visible_image.find('.clearing-caption'), $image)
            .center(image)
            .shift(current, target, function () {
              target.siblings().removeClass('visible');
              target.addClass('visible');
            });
        }.bind(this));
      }
    },

    close : function (e, el) {
      e.preventDefault();

      var root = (function (target) {
            if (/blackout/.test(target.selector)) {
              return target;
            } else {
              return target.closest('.clearing-blackout');
            }
          }($(el))), container, visible_image;

      if (el === e.target && root) {
        container = root.find('div').first(),
        visible_image = container.find('.visible-img');
        this.settings.prev_index = 0;
        root.find('ul[data-clearing]')
          .attr('style', '').closest('.clearing-blackout')
          .removeClass('clearing-blackout');
        container.removeClass('clearing-container');
        visible_image.hide();
      }

      return false;
    },

    keydown : function (e) {
      var clearing = $('.clearing-blackout').find('ul[data-clearing]');

      if (e.which === 39) this.go(clearing, 'next');
      if (e.which === 37) this.go(clearing, 'prev');
      if (e.which === 27) $('a.clearing-close').trigger('click');
    },

    nav : function (e, direction) {
      var clearing = $('.clearing-blackout').find('ul[data-clearing]');

      e.preventDefault();
      this.go(clearing, direction);
    },

    resize : function () {
      var image = $('.clearing-blackout .visible-img').find('img');

      if (image.length) {
        this.center(image);
      }
    },

    // visual adjustments
    fix_height : function (target) {
      var lis = target.parent().children(),
          self = this;

      lis.each(function () {
          var li = $(this),
              image = li.find('img');

          if (li.height() > self.outerHeight(image)) {
            li.addClass('fix-height');
          }
        })
        .closest('ul')
        .width(lis.length * 100 + '%');

      return this;
    },

    update_paddles : function (target) {
      var visible_image = target
        .closest('.carousel')
        .siblings('.visible-img');

      if (target.next().length) {
        visible_image
          .find('.clearing-main-right')
          .removeClass('disabled');
      } else {
        visible_image
          .find('.clearing-main-right')
          .addClass('disabled');
      }

      if (target.prev().length) {
        visible_image
          .find('.clearing-main-left')
          .removeClass('disabled');
      } else {
        visible_image
          .find('.clearing-main-left')
          .addClass('disabled');
      }
    },

    center : function (target) {
      target.css({
        marginLeft : -(this.outerWidth(target) / 2),
        marginTop : -(this.outerHeight(target) / 2)
      });
      return this;
    },

    // image loading and preloading

    load : function ($image) {
      var href = $image.parent().attr('href');

      this.preload($image);

      if (href) return href;
      return $image.attr('src');
    },

    preload : function ($image) {
      this
        .img($image.closest('li').next())
        .img($image.closest('li').prev());
    },

    loaded : function (image, callback) {
      // based on jquery.imageready.js
      // @weblinc, @jsantell, (c) 2012

      function loaded () {
        callback();
      }

      function bindLoad () {
        this.one('load', loaded);

        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
          var src = this.attr( 'src' ),
              param = src.match( /\?/ ) ? '&' : '?';

          param += 'random=' + (new Date()).getTime();
          this.attr('src', src + param);
        }
      }

      if (!image.attr('src')) {
        loaded();
        return;
      }

      if (this.complete || this.readyState === 4) {
        loaded();
      } else {
        bindLoad.call(image);
      }
    },

    img : function (img) {
      if (img.length) {
        var new_img = new Image(),
            new_a = img.find('a');

        if (new_a.length) {
          new_img.src = new_a.attr('href');
        } else {
          new_img.src = img.find('img').attr('src');
        }
      }
      return this;
    },

    // image caption

    caption : function (container, $image) {
      var caption = $image.data('caption');

      if (caption) {
        container
          .text(caption)
          .show();
      } else {
        container
          .text('')
          .hide();
      }
      return this;
    },

    // directional methods

    go : function ($ul, direction) {
      var current = $ul.find('.visible'),
          target = current[direction]();

      if (target.length) {
        target
          .find('img')
          .trigger('click', [current, target]);
      }
    },

    shift : function (current, target, callback) {
      var clearing = target.parent(),
          old_index = this.settings.prev_index || target.index(),
          direction = this.direction(clearing, current, target),
          left = parseInt(clearing.css('left'), 10),
          width = this.outerWidth(target),
          skip_shift;

      // we use jQuery animate instead of CSS transitions because we
      // need a callback to unlock the next animation
      if (target.index() !== old_index && !/skip/.test(direction)){
        if (/left/.test(direction)) {
          this.lock();
          clearing.animate({left : left + width}, 300, this.unlock());
        } else if (/right/.test(direction)) {
          this.lock();
          clearing.animate({left : left - width}, 300, this.unlock());
        }
      } else if (/skip/.test(direction)) {
        // the target image is not adjacent to the current image, so
        // do we scroll right or not
        skip_shift = target.index() - this.settings.up_count;
        this.lock();

        if (skip_shift > 0) {
          clearing.animate({left : -(skip_shift * width)}, 300, this.unlock());
        } else {
          clearing.animate({left : 0}, 300, this.unlock());
        }
      }

      callback();
    },

    direction : function ($el, current, target) {
      var lis = $el.find('li'),
          li_width = this.outerWidth(lis) + (this.outerWidth(lis) / 4),
          up_count = Math.floor(this.outerWidth($('.clearing-container')) / li_width) - 1,
          target_index = lis.index(target),
          response;

      this.settings.up_count = up_count;

      if (this.adjacent(this.settings.prev_index, target_index)) {
        if ((target_index > up_count)
          && target_index > this.settings.prev_index) {
          response = 'right';
        } else if ((target_index > up_count - 1)
          && target_index <= this.settings.prev_index) {
          response = 'left';
        } else {
          response = false;
        }
      } else {
        response = 'skip';
      }

      this.settings.prev_index = target_index;

      return response;
    },

    adjacent : function (current_index, target_index) {
      for (var i = target_index + 1; i >= target_index - 1; i--) {
        if (i === current_index) return true;
      }
      return false;
    },

    // lock management

    lock : function () {
      this.settings.locked = true;
    },

    unlock : function () {
      this.settings.locked = false;
    },

    locked : function () {
      return this.settings.locked;
    },

    // plugin management/browser quirks

    outerHTML : function (el) {
      // support FireFox < 11
      return el.outerHTML || new XMLSerializer().serializeToString(el);
    },

    off : function () {
      $(this.scope).off('.fndtn.clearing');
      $(window).off('.fndtn.clearing');
      this.remove_data(); // empty settings cache
      this.settings.init = false;
    }
  };

}(Foundation.zj, this, this.document));


if (typeof Object.create !== "function") {
  Object.create = function(o) {
    function F() {};
    F.prototype = o;
    return new F();
  };
}
var ua = {
  toString: function() {
    return navigator.userAgent;
  },
  test: function(s) {
    return this.toString().toLowerCase().indexOf(s.toLowerCase()) > -1;
  }
};
ua.version = (ua.toString().toLowerCase().match(/[\s\S]+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1];
ua.webkit = ua.test("webkit");
ua.gecko = ua.test("gecko") && !ua.webkit;
ua.opera = ua.test("opera");
ua.ie = ua.test("msie") && !ua.opera;
ua.ie6 = ua.ie && document.compatMode && typeof document.documentElement.style.maxHeight === "undefined";
ua.ie7 = ua.ie && document.documentElement && typeof document.documentElement.style.maxHeight !== "undefined" && typeof XDomainRequest === "undefined";
ua.ie8 = ua.ie && typeof XDomainRequest !== "undefined";
var domReady = function() {
  var _1 = [];
  var _2 = function() {
    if (!arguments.callee.done) {
      arguments.callee.done = true;
      for (var i = 0; i < _1.length; i++) {
        _1[i]();
      }
    }
  };
  if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", _2, false);
  }
  if (ua.ie) {
    (function() {
      try {
        document.documentElement.doScroll("left");
      }
      catch (e) {
        setTimeout(arguments.callee, 50);
        return;
      }
      _2();
    })();
    document.onreadystatechange = function() {
      if (document.readyState === "complete") {
        document.onreadystatechange = null;
        _2();
      }
    };
  }
  if (ua.webkit && document.readyState) {
    (function() {
      if (document.readyState !== "loading") {
        _2();
      }
      else {
        setTimeout(arguments.callee, 10);
      }
    })();
  }
  window.onload = _2;
  return function(fn) {
    if (typeof fn === "function") {
      _1[_1.length] = fn;
    }
    return fn;
  };
}();
var cssHelper = function() {
  var _3 = {
    BLOCKS: /[^\s{][^{]*\{(?:[^{}]*\{[^{}]*\}[^{}]*|[^{}]*)*\}/g,
    BLOCKS_INSIDE: /[^\s{][^{]*\{[^{}]*\}/g,
    DECLARATIONS: /[a-zA-Z\-]+[^;]*:[^;]+;/g,
    RELATIVE_URLS: /url\(['"]?([^\/\)'"][^:\)'"]+)['"]?\)/g,
    REDUNDANT_COMPONENTS: /(?:\/\*([^*\\\\]|\*(?!\/))+\*\/|@import[^;]+;)/g,
    REDUNDANT_WHITESPACE: /\s*(,|:|;|\{|\})\s*/g,
    MORE_WHITESPACE: /\s{2,}/g,
    FINAL_SEMICOLONS: /;\}/g,
    NOT_WHITESPACE: /\S+/g
  };
  var _4, _5 = false;
  var _6 = [];
  var _7 = function(fn) {
    if (typeof fn === "function") {
      _6[_6.length] = fn;
    }
  };
  var _8 = function() {
    for (var i = 0; i < _6.length; i++) {
      _6[i](_4);
    }
  };
  var _9 = {};
  var _a = function(n, v) {
    if (_9[n]) {
      var _b = _9[n].listeners;
      if (_b) {
        for (var i = 0; i < _b.length; i++) {
          _b[i](v);
        }
      }
    }
  };
  var _c = function(_d, _e, _f) {
    if (ua.ie && !window.XMLHttpRequest) {
      window.XMLHttpRequest = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }
    if (!XMLHttpRequest) {
      return "";
    }
    var r = new XMLHttpRequest();
    try {
      r.open("get", _d, true);
      r.setRequestHeader("X_REQUESTED_WITH", "XMLHttpRequest");
    }
    catch (e) {
      _f();
      return;
    }
    var _10 = false;
    setTimeout(function() {
      _10 = true;
    }, 5000);
    document.documentElement.style.cursor = "progress";
    r.onreadystatechange = function() {
      if (r.readyState === 4 && !_10) {
        if (!r.status && location.protocol === "file:" || (r.status >= 200 && r.status < 300) || r.status === 304 || navigator.userAgent.indexOf("Safari") > -1 && typeof r.status === "undefined") {
          _e(r.responseText);
        }
        else {
          _f();
        }
        document.documentElement.style.cursor = "";
        r = null;
      }
    };
    r.send("");
  };
  var _11 = function(_12) {
    _12 = _12.replace(_3.REDUNDANT_COMPONENTS, "");
    _12 = _12.replace(_3.REDUNDANT_WHITESPACE, "$1");
    _12 = _12.replace(_3.MORE_WHITESPACE, " ");
    _12 = _12.replace(_3.FINAL_SEMICOLONS, "}");
    return _12;
  };
  var _13 = {
    mediaQueryList: function(s) {
      var o = {};
      var idx = s.indexOf("{");
      var lt = s.substring(0, idx);
      s = s.substring(idx + 1, s.length - 1);
      var mqs = [],
        rs = [];
      var qts = lt.toLowerCase().substring(7).split(",");
      for (var i = 0; i < qts.length; i++) {
        mqs[mqs.length] = _13.mediaQuery(qts[i], o);
      }
      var rts = s.match(_3.BLOCKS_INSIDE);
      if (rts !== null) {
        for (i = 0; i < rts.length; i++) {
          rs[rs.length] = _13.rule(rts[i], o);
        }
      }
      o.getMediaQueries = function() {
        return mqs;
      };
      o.getRules = function() {
        return rs;
      };
      o.getListText = function() {
        return lt;
      };
      o.getCssText = function() {
        return s;
      };
      return o;
    },
    mediaQuery: function(s, mql) {
      s = s || "";
      var not = false,
        _14;
      var exp = [];
      var _15 = true;
      var _16 = s.match(_3.NOT_WHITESPACE);
      for (var i = 0; i < _16.length; i++) {
        var _17 = _16[i];
        if (!_14 && (_17 === "not" || _17 === "only")) {
          if (_17 === "not") {
            not = true;
          }
        }
        else {
          if (!_14) {
            _14 = _17;
          }
          else {
            if (_17.charAt(0) === "(") {
              var _18 = _17.substring(1, _17.length - 1).split(":");
              exp[exp.length] = {
                mediaFeature: _18[0],
                value: _18[1] || null
              };
            }
          }
        }
      }
      return {
        getList: function() {
          return mql || null;
        },
        getValid: function() {
          return _15;
        },
        getNot: function() {
          return not;
        },
        getMediaType: function() {
          return _14;
        },
        getExpressions: function() {
          return exp;
        }
      };
    },
    rule: function(s, mql) {
      var o = {};
      var idx = s.indexOf("{");
      var st = s.substring(0, idx);
      var ss = st.split(",");
      var ds = [];
      var dts = s.substring(idx + 1, s.length - 1).split(";");
      for (var i = 0; i < dts.length; i++) {
        ds[ds.length] = _13.declaration(dts[i], o);
      }
      o.getMediaQueryList = function() {
        return mql || null;
      };
      o.getSelectors = function() {
        return ss;
      };
      o.getSelectorText = function() {
        return st;
      };
      o.getDeclarations = function() {
        return ds;
      };
      o.getPropertyValue = function(n) {
        for (var i = 0; i < ds.length; i++) {
          if (ds[i].getProperty() === n) {
            return ds[i].getValue();
          }
        }
        return null;
      };
      return o;
    },
    declaration: function(s, r) {
      var idx = s.indexOf(":");
      var p = s.substring(0, idx);
      var v = s.substring(idx + 1);
      return {
        getRule: function() {
          return r || null;
        },
        getProperty: function() {
          return p;
        },
        getValue: function() {
          return v;
        }
      };
    }
  };
  var _19 = function(el) {
    if (typeof el.cssHelperText !== "string") {
      return;
    }
    var o = {
      mediaQueryLists: [],
      rules: [],
      selectors: {},
      declarations: [],
      properties: {}
    };
    var _1a = o.mediaQueryLists;
    var ors = o.rules;
    var _1b = el.cssHelperText.match(_3.BLOCKS);
    if (_1b !== null) {
      for (var i = 0; i < _1b.length; i++) {
        if (_1b[i].substring(0, 7) === "@media ") {
          _1a[_1a.length] = _13.mediaQueryList(_1b[i]);
          ors = o.rules = ors.concat(_1a[_1a.length - 1].getRules());
        }
        else {
          ors[ors.length] = _13.rule(_1b[i]);
        }
      }
    }
    var oss = o.selectors;
    var _1c = function(r) {
      var ss = r.getSelectors();
      for (var i = 0; i < ss.length; i++) {
        var n = ss[i];
        if (!oss[n]) {
          oss[n] = [];
        }
        oss[n][oss[n].length] = r;
      }
    };
    for (i = 0; i < ors.length; i++) {
      _1c(ors[i]);
    }
    var ods = o.declarations;
    for (i = 0; i < ors.length; i++) {
      ods = o.declarations = ods.concat(ors[i].getDeclarations());
    }
    var ops = o.properties;
    for (i = 0; i < ods.length; i++) {
      var n = ods[i].getProperty();
      if (!ops[n]) {
        ops[n] = [];
      }
      ops[n][ops[n].length] = ods[i];
    }
    el.cssHelperParsed = o;
    _4[_4.length] = el;
    return o;
  };
  var _1d = function(el, s) {
    el.cssHelperText = _11(s || el.innerHTML);
    return _19(el);
  };
  var _1e = function() {
    _5 = true;
    _4 = [];
    var _1f = [];
    var _20 = function() {
      for (var i = 0; i < _1f.length; i++) {
        _19(_1f[i]);
      }
      var _21 = document.getElementsByTagName("style");
      for (i = 0; i < _21.length; i++) {
        _1d(_21[i]);
      }
      _5 = false;
      _8();
    };
    var _22 = document.getElementsByTagName("link");
    for (var i = 0; i < _22.length; i++) {
      var _23 = _22[i];
      if (_23.getAttribute("rel").indexOf("style") > -1 && _23.href && _23.href.length !== 0 && !_23.disabled) {
        _1f[_1f.length] = _23;
      }
    }
    if (_1f.length > 0) {
      var c = 0;
      var _24 = function() {
        c++;
        if (c === _1f.length) {
          _20();
        }
      };
      var _25 = function(_26) {
        var _27 = _26.href;
        _c(_27, function(_28) {
          _28 = _11(_28).replace(_3.RELATIVE_URLS, "url(" + _27.substring(0, _27.lastIndexOf("/")) + "/$1)");
          _26.cssHelperText = _28;
          _24();
        }, _24);
      };
      for (i = 0; i < _1f.length; i++) {
        _25(_1f[i]);
      }
    }
    else {
      _20();
    }
  };
  var _29 = {
    mediaQueryLists: "array",
    rules: "array",
    selectors: "object",
    declarations: "array",
    properties: "object"
  };
  var _2a = {
    mediaQueryLists: null,
    rules: null,
    selectors: null,
    declarations: null,
    properties: null
  };
  var _2b = function(_2c, v) {
    if (_2a[_2c] !== null) {
      if (_29[_2c] === "array") {
        return (_2a[_2c] = _2a[_2c].concat(v));
      }
      else {
        var c = _2a[_2c];
        for (var n in v) {
          if (v.hasOwnProperty(n)) {
            if (!c[n]) {
              c[n] = v[n];
            }
            else {
              c[n] = c[n].concat(v[n]);
            }
          }
        }
        return c;
      }
    }
  };
  var _2d = function(_2e) {
    _2a[_2e] = (_29[_2e] === "array") ? [] : {};
    for (var i = 0; i < _4.length; i++) {
      _2b(_2e, _4[i].cssHelperParsed[_2e]);
    }
    return _2a[_2e];
  };
  domReady(function() {
    var els = document.body.getElementsByTagName("*");
    for (var i = 0; i < els.length; i++) {
      els[i].checkedByCssHelper = true;
    }
    if (document.implementation.hasFeature("MutationEvents", "2.0") || window.MutationEvent) {
      document.body.addEventListener("DOMNodeInserted", function(e) {
        var el = e.target;
        if (el.nodeType === 1) {
          _a("DOMElementInserted", el);
          el.checkedByCssHelper = true;
        }
      }, false);
    }
    else {
      setInterval(function() {
        var els = document.body.getElementsByTagName("*");
        for (var i = 0; i < els.length; i++) {
          if (!els[i].checkedByCssHelper) {
            _a("DOMElementInserted", els[i]);
            els[i].checkedByCssHelper = true;
          }
        }
      }, 1000);
    }
  });
  var _2f = function(d) {
    if (typeof window.innerWidth != "undefined") {
      return window["inner" + d];
    }
    else {
      if (typeof document.documentElement != "undefined" && typeof document.documentElement.clientWidth != "undefined" && document.documentElement.clientWidth != 0) {
        return document.documentElement["client" + d];
      }
    }
  };
  return {
    addStyle: function(s, _30) {
      var el = document.createElement("style");
      el.setAttribute("type", "text/css");
      document.getElementsByTagName("head")[0].appendChild(el);
      if (el.styleSheet) {
        el.styleSheet.cssText = s;
      }
      else {
        el.appendChild(document.createTextNode(s));
      }
      el.addedWithCssHelper = true;
      if (typeof _30 === "undefined" || _30 === true) {
        cssHelper.parsed(function(_31) {
          var o = _1d(el, s);
          for (var n in o) {
            if (o.hasOwnProperty(n)) {
              _2b(n, o[n]);
            }
          }
          _a("newStyleParsed", el);
        });
      }
      else {
        el.parsingDisallowed = true;
      }
      return el;
    },
    removeStyle: function(el) {
      return el.parentNode.removeChild(el);
    },
    parsed: function(fn) {
      if (_5) {
        _7(fn);
      }
      else {
        if (typeof _4 !== "undefined") {
          if (typeof fn === "function") {
            fn(_4);
          }
        }
        else {
          _7(fn);
          _1e();
        }
      }
    },
    mediaQueryLists: function(fn) {
      cssHelper.parsed(function(_32) {
        fn(_2a.mediaQueryLists || _2d("mediaQueryLists"));
      });
    },
    rules: function(fn) {
      cssHelper.parsed(function(_33) {
        fn(_2a.rules || _2d("rules"));
      });
    },
    selectors: function(fn) {
      cssHelper.parsed(function(_34) {
        fn(_2a.selectors || _2d("selectors"));
      });
    },
    declarations: function(fn) {
      cssHelper.parsed(function(_35) {
        fn(_2a.declarations || _2d("declarations"));
      });
    },
    properties: function(fn) {
      cssHelper.parsed(function(_36) {
        fn(_2a.properties || _2d("properties"));
      });
    },
    broadcast: _a,
    addListener: function(n, fn) {
      if (typeof fn === "function") {
        if (!_9[n]) {
          _9[n] = {
            listeners: []
          };
        }
        _9[n].listeners[_9[n].listeners.length] = fn;
      }
    },
    removeListener: function(n, fn) {
      if (typeof fn === "function" && _9[n]) {
        var ls = _9[n].listeners;
        for (var i = 0; i < ls.length; i++) {
          if (ls[i] === fn) {
            ls.splice(i, 1);
            i -= 1;
          }
        }
      }
    },
    getViewportWidth: function() {
      return _2f("Width");
    },
    getViewportHeight: function() {
      return _2f("Height");
    }
  };
}();
domReady(function enableCssMediaQueries() {
  var _37;
  var _38 = {
    LENGTH_UNIT: /[0-9]+(em|ex|px|in|cm|mm|pt|pc)$/,
    RESOLUTION_UNIT: /[0-9]+(dpi|dpcm)$/,
    ASPECT_RATIO: /^[0-9]+\/[0-9]+$/,
    ABSOLUTE_VALUE: /^[0-9]*(\.[0-9]+)*$/
  };
  var _39 = [];
  var _3a = function() {
    var id = "css3-mediaqueries-test";
    var el = document.createElement("div");
    el.id = id;
    var _3b = cssHelper.addStyle("@media all and (width) { #" + id + " { width: 1px !important; } }", false);
    document.body.appendChild(el);
    var ret = el.offsetWidth === 1;
    _3b.parentNode.removeChild(_3b);
    el.parentNode.removeChild(el);
    _3a = function() {
      return ret;
    };
    return ret;
  };
  var _3c = function() {
    _37 = document.createElement("div");
    _37.style.cssText = "position:absolute;top:-9999em;left:-9999em;" + "margin:0;border:none;padding:0;width:1em;font-size:1em;";
    document.body.appendChild(_37);
    if (_37.offsetWidth !== 16) {
      _37.style.fontSize = 16 / _37.offsetWidth + "em";
    }
    _37.style.width = "";
  };
  var _3d = function(_3e) {
    _37.style.width = _3e;
    var _3f = _37.offsetWidth;
    _37.style.width = "";
    return _3f;
  };
  var _40 = function(_41, _42) {
    var l = _41.length;
    var min = (_41.substring(0, 4) === "min-");
    var max = (!min && _41.substring(0, 4) === "max-");
    if (_42 !== null) {
      var _43;
      var _44;
      if (_38.LENGTH_UNIT.exec(_42)) {
        _43 = "length";
        _44 = _3d(_42);
      }
      else {
        if (_38.RESOLUTION_UNIT.exec(_42)) {
          _43 = "resolution";
          _44 = parseInt(_42, 10);
          var _45 = _42.substring((_44 + "").length);
        }
        else {
          if (_38.ASPECT_RATIO.exec(_42)) {
            _43 = "aspect-ratio";
            _44 = _42.split("/");
          }
          else {
            if (_38.ABSOLUTE_VALUE) {
              _43 = "absolute";
              _44 = _42;
            }
            else {
              _43 = "unknown";
            }
          }
        }
      }
    }
    var _46, _47;
    if ("device-width" === _41.substring(l - 12, l)) {
      _46 = screen.width;
      if (_42 !== null) {
        if (_43 === "length") {
          return ((min && _46 >= _44) || (max && _46 < _44) || (!min && !max && _46 === _44));
        }
        else {
          return false;
        }
      }
      else {
        return _46 > 0;
      }
    }
    else {
      if ("device-height" === _41.substring(l - 13, l)) {
        _47 = screen.height;
        if (_42 !== null) {
          if (_43 === "length") {
            return ((min && _47 >= _44) || (max && _47 < _44) || (!min && !max && _47 === _44));
          }
          else {
            return false;
          }
        }
        else {
          return _47 > 0;
        }
      }
      else {
        if ("width" === _41.substring(l - 5, l)) {
          _46 = document.documentElement.clientWidth || document.body.clientWidth;
          if (_42 !== null) {
            if (_43 === "length") {
              return ((min && _46 >= _44) || (max && _46 < _44) || (!min && !max && _46 === _44));
            }
            else {
              return false;
            }
          }
          else {
            return _46 > 0;
          }
        }
        else {
          if ("height" === _41.substring(l - 6, l)) {
            _47 = document.documentElement.clientHeight || document.body.clientHeight;
            if (_42 !== null) {
              if (_43 === "length") {
                return ((min && _47 >= _44) || (max && _47 < _44) || (!min && !max && _47 === _44));
              }
              else {
                return false;
              }
            }
            else {
              return _47 > 0;
            }
          }
          else {
            if ("device-aspect-ratio" === _41.substring(l - 19, l)) {
              return _43 === "aspect-ratio" && screen.width * _44[1] === screen.height * _44[0];
            }
            else {
              if ("color-index" === _41.substring(l - 11, l)) {
                var _48 = Math.pow(2, screen.colorDepth);
                if (_42 !== null) {
                  if (_43 === "absolute") {
                    return ((min && _48 >= _44) || (max && _48 < _44) || (!min && !max && _48 === _44));
                  }
                  else {
                    return false;
                  }
                }
                else {
                  return _48 > 0;
                }
              }
              else {
                if ("color" === _41.substring(l - 5, l)) {
                  var _49 = screen.colorDepth;
                  if (_42 !== null) {
                    if (_43 === "absolute") {
                      return ((min && _49 >= _44) || (max && _49 < _44) || (!min && !max && _49 === _44));
                    }
                    else {
                      return false;
                    }
                  }
                  else {
                    return _49 > 0;
                  }
                }
                else {
                  if ("resolution" === _41.substring(l - 10, l)) {
                    var res;
                    if (_45 === "dpcm") {
                      res = _3d("1cm");
                    }
                    else {
                      res = _3d("1in");
                    }
                    if (_42 !== null) {
                      if (_43 === "resolution") {
                        return ((min && res >= _44) || (max && res < _44) || (!min && !max && res === _44));
                      }
                      else {
                        return false;
                      }
                    }
                    else {
                      return res > 0;
                    }
                  }
                  else {
                    return false;
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  var _4a = function(mq) {
    var _4b = mq.getValid();
    var _4c = mq.getExpressions();
    var l = _4c.length;
    if (l > 0) {
      for (var i = 0; i < l && _4b; i++) {
        _4b = _40(_4c[i].mediaFeature, _4c[i].value);
      }
      var not = mq.getNot();
      return (_4b && !not || not && !_4b);
    }
  };
  var _4d = function(mql) {
    var mqs = mql.getMediaQueries();
    var t = {};
    for (var i = 0; i < mqs.length; i++) {
      if (_4a(mqs[i])) {
        t[mqs[i].getMediaType()] = true;
      }
    }
    var s = [],
      c = 0;
    for (var n in t) {
      if (t.hasOwnProperty(n)) {
        if (c > 0) {
          s[c++] = ",";
        }
        s[c++] = n;
      }
    }
    if (s.length > 0) {
      _39[_39.length] = cssHelper.addStyle("@media " + s.join("") + "{" + mql.getCssText() + "}", false);
    }
  };
  var _4e = function(_4f) {
    for (var i = 0; i < _4f.length; i++) {
      _4d(_4f[i]);
    }
    if (ua.ie) {
      document.documentElement.style.display = "block";
      setTimeout(function() {
        document.documentElement.style.display = "";
      }, 0);
      setTimeout(function() {
        cssHelper.broadcast("cssMediaQueriesTested");
      }, 100);
    }
    else {
      cssHelper.broadcast("cssMediaQueriesTested");
    }
  };
  var _50 = function() {
    for (var i = 0; i < _39.length; i++) {
      cssHelper.removeStyle(_39[i]);
    }
    _39 = [];
    cssHelper.mediaQueryLists(_4e);
  };
  var _51 = 0;
  var _52 = function() {
    var _53 = cssHelper.getViewportWidth();
    var _54 = cssHelper.getViewportHeight();
    if (ua.ie) {
      var el = document.createElement("div");
      el.style.position = "absolute";
      el.style.top = "-9999em";
      el.style.overflow = "scroll";
      document.body.appendChild(el);
      _51 = el.offsetWidth - el.clientWidth;
      document.body.removeChild(el);
    }
    var _55;
    var _56 = function() {
      var vpw = cssHelper.getViewportWidth();
      var vph = cssHelper.getViewportHeight();
      if (Math.abs(vpw - _53) > _51 || Math.abs(vph - _54) > _51) {
        _53 = vpw;
        _54 = vph;
        clearTimeout(_55);
        _55 = setTimeout(function() {
          if (!_3a()) {
            _50();
          }
          else {
            cssHelper.broadcast("cssMediaQueriesTested");
          }
        }, 500);
      }
    };
    window.onresize = function() {
      var x = window.onresize || function() {};
      return function() {
        x();
        _56();
      };
    }();
  };
  var _57 = document.documentElement;
  _57.style.marginLeft = "-32767px";
  setTimeout(function() {
    _57.style.marginTop = "";
  }, 20000);
  return function() {
    if (!_3a()) {
      cssHelper.addListener("newStyleParsed", function(el) {
        _4e(el.cssHelperParsed.mediaQueryLists);
      });
      cssHelper.addListener("cssMediaQueriesTested", function() {
        if (ua.ie) {
          _57.style.width = "1px";
        }
        setTimeout(function() {
          _57.style.width = "";
          _57.style.marginLeft = "";
        }, 0);
        cssHelper.removeListener("cssMediaQueriesTested", arguments.callee);
      });
      _3c();
      _50();
    }
    else {
      _57.style.marginLeft = "";
    }
    _52();
  };
}());
try {
  document.execCommand("BackgroundImageCache", false, true);
}
catch (e) {}


/*! Unobtrusive Slider Control / HTML5 Input Range polyfill - MIT/GPL2 @freqdec */
var fdSlider=(function(){var sliders={},uniqueid=0,mouseWheelEnabled=true,fullARIA=true,describedBy="fd-slider-describedby",varSetRules={onfocus:true,onvalue:true},noRangeBar=false,html5Animation="jump",isOpera=Object.prototype.toString.call(window.opera)==="[object Opera]",fpRegExp=/^([-]{0,1}[0-9]+(\.[0-9]+){0,1})$/,stepRegExp=/^([0-9]+(\.[0-9]+){0,1})$/;var parseJSON=function(str){if(typeof str!=="string"||str==""){return{}}try{if(typeof JSON==="object"&&typeof(JSON.parse)==="function"){return JSON.parse(str)}else{if(/mousewheelenabled|fullaria|describedby|norangebar|html5animation|varsetrules/.test(str.toLowerCase())){var f=Function(["var document,top,self,window,parent,Number,Date,Object,Function,","Array,String,Math,RegExp,Image,ActiveXObject;","return (",str.replace(/<\!--.+-->/gim,"").replace(/\bfunction\b/g,"function-"),");"].join(""));return f()}}}catch(e){}return{err:"Could not parse the JSON object"}};var affectJSON=function(json){if(typeof json!=="object"){return}for(key in json){value=json[key];switch(key.toLowerCase()){case"mousewheelenabled":mouseWheelEnabled=!!value;break;case"fullaria":fullARIA=!!value;break;case"describedby":describedBy=String(value);break;case"norangebar":noRangeBar=!!value;break;case"html5animation":html5Animation=String(value).search(/^(jump|tween|timed)$/i)!=-1?String(value).toLowerCase():"jump";break;case"varsetrules":if("onfocus" in value){varSetRules.onfocus=!!value.onfocus}if("onvalue" in value){varSetRules.onvalue=!!value.onvalue}break}}};var addEvent=function(obj,type,fn){if(obj.attachEvent){obj.attachEvent("on"+type,fn)}else{obj.addEventListener(type,fn,true)}};var removeEvent=function(obj,type,fn){try{if(obj.detachEvent){obj.detachEvent("on"+type,fn)}else{obj.removeEventListener(type,fn,true)}}catch(err){}};var stopEvent=function(e){e=e||window.event;if(e.stopPropagation){e.stopPropagation();e.preventDefault()}
/*@cc_on@*/
/*@if(@_win32)
                e.cancelBubble = true;
                e.returnValue = false;
                /*@end@*/
return false};var preventDefault=function(e){e=e||window.event;if(e.preventDefault){e.preventDefault();return}e.returnValue=false};var addClass=function(e,c){if(new RegExp("(^|\\s)"+c+"(\\s|$)").test(e.className)){return}e.className+=(e.className?" ":"")+c};var removeClass=function(e,c){e.className=!c?"":e.className.replace(new RegExp("(^|\\s)"+c+"(\\s|$)")," ").replace(/^\s\s*/,"").replace(/\s\s*$/,"")};var getValueSet=function(){var obj={};for(id in sliders){obj[id]=sliders[id].getValueSet()}return obj};var setValueSet=function(sliderId,tf){sliders[sliderId].setValueSet(!!tf)};var sliderExists=function(slider){return !!(slider in sliders&&sliders.hasOwnProperty(slider))};var createSlider=function(options){if(!options||!options.inp||!options.inp.tagName||options.inp.tagName.search(/^input|select/i)==-1){return false}options.html5Shim=false;if(options.inp.tagName.toLowerCase()=="select"){if(options.inp.options.length<2){return false}options.min=0;options.max=options.inp.options.length-1;options.step=1;options.precision=0;options.scale=false;options.forceValue=true}else{if(String(options.inp.type).search(/^(text|range)$/i)==-1){return false}options.min=options.min&&String(options.min).search(fpRegExp)!=-1?+options.min:0;options.max=options.max&&String(options.max).search(fpRegExp)!=-1?+options.max:100;options.step=options.step&&String(options.step).search(stepRegExp)!=-1?options.step:1;options.precision=options.precision&&String(options.precision).search(/^[0-9]+$/)!=-1?options.precision:(String(options.step).search(/\.([0-9]+)$/)!=-1?String(options.step).match(/\.([0-9]+)$/)[1].length:0);options.scale=options.scale||false;options.forceValue=("forceValue" in options)?!!options.forceValue:false}options.ariaFormat=("ariaFormat" in options)&&typeof options.ariaFormat=="function"?options.ariaFormat:false;options.maxStep=options.maxStep&&String(options.maxStep).search(stepRegExp)!=-1?+options.maxStep:+options.step*2;options.classNames=options.classNames||"";options.callbacks=options.callbacks||false;destroySingleSlider(options.inp.id);sliders[options.inp.id]=new fdRange(options);return true};var getAttribute=function(elem,att){return elem.getAttribute(att)||""};var init=function(){var inputs=document.getElementsByTagName("input"),options;for(var i=0,inp;inp=inputs[i];i++){if(inp.tagName.toLowerCase()=="input"&&inp.type.toLowerCase()=="text"&&(getAttribute(inp,"min")&&getAttribute(inp,"min").search(fpRegExp)!=-1||getAttribute(inp,"max")&&getAttribute(inp,"max").search(fpRegExp)!=-1||getAttribute(inp,"step")&&getAttribute(inp,"step").search(/^(any|([0-9]+(\.[0-9]+){0,1}))$/i)!=-1)){if(inp.id&&document.getElementById("fd-slider-"+inp.id)){continue}else{if(inp.id&&!document.getElementById("fd-slider-"+inp.id)){destroySingleSlider(inp.id)}}if(!inp.id){inp.id="fd-slider-form-elem-"+uniqueid++}options={inp:inp,callbacks:[],animation:html5Animation,vertical:getAttribute(inp,"data-fd-slider-vertical")?true:!!(inp.offsetHeight>inp.offsetWidth),classNames:getAttribute(inp,"data-fd-slider-vertical"),html5Shim:true};if(options.vertical&&!getAttribute(inp,"data-fd-slider-vertical")){options.inpHeight=inp.offsetHeight}options.min=getAttribute(inp,"min")||0;options.max=getAttribute(inp,"max")||100;options.step=getAttribute(inp,"step").search(/^any$/i)!=-1?options.max-options.min:getAttribute(inp,"step").search(stepRegExp)!=-1?inp.getAttribute("step"):1;options.precision=String(options.step).search(/\.([0-9]+)$/)!=-1?String(options.step).match(/\.([0-9]+)$/)[1].length:0;options.maxStep=options.step*2;destroySingleSlider(options.inp.id);sliders[options.inp.id]=new fdRange(options)}}return true};var destroySingleSlider=function(id){if(id in sliders&&sliders.hasOwnProperty(id)){sliders[id].destroy();delete sliders[id];return true}return false};var destroyAllsliders=function(e){for(slider in sliders){if(sliders.hasOwnProperty(slider)){sliders[slider].destroy()}}sliders=[]};var unload=function(e){destroyAllsliders();sliders=null};var resize=function(e){for(slider in sliders){if(sliders.hasOwnProperty(slider)){sliders[slider].onResize()}}};var onDomReady=function(){removeEvent(window,"load",init);init()};var removeOnLoadEvent=function(){removeEvent(window,"load",init)};function fdRange(options){var inp=options.inp,disabled=false,tagName=inp.tagName.toLowerCase(),min=+options.min,max=+options.max,rMin=+options.min,rMax=+options.max,range=Math.abs(max-min),step=tagName=="select"?1:+options.step,maxStep=options.maxStep?+options.maxStep:step*2,precision=options.precision||0,steps=Math.ceil(range/step),scale=options.scale||false,hideInput=!!options.hideInput,animation=options.animation||"",vertical=!!options.vertical,callbacks=options.callbacks||{},classNames=options.classNames||"",html5Shim=!!options.html5Shim,defaultVal=max<min?min:min+((max-min)/2),resetDef=tagName=="select"?inp.selectedIndex:inp.defaultValue||defaultVal,forceValue=html5Shim||!!options.forceValue,inpHeight=html5Shim&&vertical&&("inpHeight" in options)?options.inpHeight:false,ariaFormat=!html5Shim&&options.ariaFormat?options.ariaFormat:false,timer=null,kbEnabled=true,initialVal=tagName=="select"?inp.selectedIndex:inp.value,sliderH=0,sliderW=0,tweenX=0,tweenB=0,tweenC=0,tweenD=0,frame=0,x=0,y=0,rMaxPx=0,rMinPx=0,handlePos=0,destPos=0,mousePos=0,stepPx=0,userSet=false,touchEvents=false,outerWrapper,innerWrapper,ieBlur,handle,rangeBar,bar;if(tagName=="input"&&forceValue&&!inp.defaultValue){inp.defaultValue=getWorkingValueFromInput()}if(max<min){step=-Math.abs(step);maxStep=-Math.abs(maxStep)}if(scale){scale[100]=max}function valueSet(tf){tf=!!tf;if(tf!=userSet){userSet=tf;valueToPixels(getWorkingValueFromInput())}}function disableSlider(noCallback){if(disabled&&!noCallback){return}try{setTabIndex(handle,-1);removeEvent(handle,"focus",onFocus);removeEvent(handle,"blur",onBlur);if(!isOpera){removeEvent(handle,"keydown",onKeyDown);removeEvent(handle,"keypress",onKeyPress)}else{removeEvent(handle,"keypress",onKeyDown)}removeEvent(outerWrapper,"mouseover",onMouseOver);removeEvent(outerWrapper,"mouseout",onMouseOut);removeEvent(outerWrapper,"mousedown",onMouseDown);removeEvent(outerWrapper,"touchstart",onMouseDown);if(mouseWheelEnabled){if(window.addEventListener&&!window.devicePixelRatio){window.removeEventListener("DOMMouseScroll",trackMouseWheel,false)}else{removeEvent(document,"mousewheel",trackMouseWheel);removeEvent(window,"mousewheel",trackMouseWheel)}}}catch(err){}removeClass(innerWrapper,"fd-slider-focused");removeClass(innerWrapper,"fd-slider-active");addClass(innerWrapper,"fd-slider-disabled");outerWrapper.setAttribute("aria-disabled",true);inp.disabled=disabled=true;clearTimeout(timer);if(!noCallback){callback("disable")}}function enableSlider(noCallback){if(!disabled&&!noCallback){return}setTabIndex(handle,0);addEvent(handle,"focus",onFocus);addEvent(handle,"blur",onBlur);if(!isOpera){addEvent(handle,"keydown",onKeyDown);addEvent(handle,"keypress",onKeyPress)}else{addEvent(handle,"keypress",onKeyDown)}addEvent(outerWrapper,"touchstart",onMouseDown);addEvent(outerWrapper,"mousedown",onMouseDown);addEvent(outerWrapper,"mouseover",onMouseOver);addEvent(outerWrapper,"mouseout",onMouseOut);removeClass(innerWrapper,"fd-slider-disabled");outerWrapper.setAttribute("aria-disabled",false);inp.disabled=disabled=touchEvents=false;if(!noCallback){callback("enable")}}function destroySlider(){clearTimeout(timer);ieBlur=bar=handle=outerWrapper=innerWrapper=timer=null;callback("destroy");callbacks=null}function redraw(){locate();try{var sW=outerWrapper.offsetWidth,sH=outerWrapper.offsetHeight,hW=handle.offsetWidth,hH=handle.offsetHeight,bH=bar.offsetHeight,bW=bar.offsetWidth,mPx=vertical?sH-hH:sW-hW;stepPx=mPx/steps;rMinPx=Math.max(scale?percentToPixels(valueToPercent(rMin)):Math.abs((rMin-min)/step)*stepPx,0);rMaxPx=Math.min(scale?percentToPixels(valueToPercent(rMax)):Math.abs((rMax-min)/step)*stepPx,Math.floor(vertical?sH-hH:sW-hW));sliderW=sW;sliderH=sH;valueToPixels(forceValue?getWorkingValueFromInput():(tagName=="select"?inp.selectedIndex:parseFloat(inp.value)))}catch(err){}callback("redraw")}function callback(type){if(!html5Shim){if(callbacks.hasOwnProperty(type)){var cbObj={userSet:userSet,disabled:disabled,elem:inp,value:tagName=="select"?inp.options[inp.selectedIndex].value:inp.value};for(var i=0,func;func=callbacks[type][i];i++){func.call(inp,cbObj)}}}else{if(type.match(/^(blur|focus|change)$/i)){if(typeof(document.createEventObject)!="undefined"){try{var e=document.createEventObject();inp.fireEvent("on"+type.toLowerCase(),e)}catch(err){}}else{if(typeof(document.createEvent)!="undefined"){var e=document.createEvent("HTMLEvents");e.initEvent(type,true,true);inp.dispatchEvent(e)}}}}}function onFocus(e){addClass(innerWrapper,"fd-slider-focused");if(varSetRules.onfocus){userSet=true;valueToPixels(getWorkingValueFromInput())}if(mouseWheelEnabled){addEvent(window,"DOMMouseScroll",trackMouseWheel);addEvent(document,"mousewheel",trackMouseWheel);if(!isOpera){addEvent(window,"mousewheel",trackMouseWheel)}}callback("focus");return true}function onBlur(e){removeClass(innerWrapper,"fd-slider-focused");if(mouseWheelEnabled){removeEvent(document,"mousewheel",trackMouseWheel);removeEvent(window,"DOMMouseScroll",trackMouseWheel);if(!isOpera){removeEvent(window,"mousewheel",trackMouseWheel)}}kbEnabled=true;callback("blur")}function trackMouseWheel(e){if(!kbEnabled){return}e=e||window.event;var delta=0,value;if(e.wheelDelta){delta=e.wheelDelta/120;if(isOpera&&window.opera.version()<9.2){delta=-delta}}else{if(e.detail){delta=-e.detail/3}}if(vertical){delta=-delta}if(delta){value=getWorkingValueFromInput();value+=(delta<0)?-step:step;userSet=true;valueToPixels(getValidValue(value))}return stopEvent(e)}function onKeyPress(e){e=e||window.event;if((e.keyCode>=33&&e.keyCode<=40)||!kbEnabled||e.keyCode==45||e.keyCode==46){return stopEvent(e)}return true}function onKeyDown(e){if(!kbEnabled){return true}e=e||window.event;var kc=e.keyCode!=null?e.keyCode:e.charCode,value;if(kc<33||(kc>40&&(kc!=45&&kc!=46))){return true}value=getWorkingValueFromInput();if(kc==37||kc==40||kc==46||kc==34){value-=(e.ctrlKey||kc==34?+maxStep:+step)}else{if(kc==39||kc==38||kc==45||kc==33){value+=(e.ctrlKey||kc==33?+maxStep:+step)}else{if(kc==35){value=rMax}else{if(kc==36){value=rMin}}}}userSet=true;valueToPixels(getValidValue(value));callback("update");preventDefault(e)}function onMouseOver(e){addClass(innerWrapper,"fd-slider-hover")}function onMouseOut(e){removeClass(innerWrapper,"fd-slider-hover")}function onMouseDown(e){e=e||window.event;preventDefault(e);var targ;if(e.target){targ=e.target}else{if(e.srcElement){targ=e.srcElement}}if(targ&&targ.nodeType==3){targ=targ.parentNode}if(e.touches){if(e.targetTouches&&e.targetTouches.length!=1){return false}e=e.touches[0];touchEvents=true}clearTimeout(timer);timer=null;kbEnabled=false;userSet=true;if(targ.className.search("fd-slider-handle")!=-1){mousePos=vertical?e.clientY:e.clientX;handlePos=parseInt(vertical?handle.offsetTop:handle.offsetLeft)||0;trackMouse(e);if(!touchEvents){addEvent(document,"mousemove",trackMouse);addEvent(document,"mouseup",stopDrag)}else{addEvent(document,"touchmove",trackMouse);addEvent(document,"touchend",stopDrag);removeEvent(outerWrapper,"mousedown",onMouseDown)}addClass(innerWrapper,"fd-slider-active");addClass(document.body,"fd-slider-drag-"+(vertical?"vertical":"horizontal"));callback("dragstart")}else{locate();var posx=0;if(e.pageX||e.pageY){posx=vertical?e.pageY:e.pageX}else{if(e.clientX||e.clientY){posx=vertical?e.clientY+document.body.scrollTop+document.documentElement.scrollTop:e.clientX+document.body.scrollLeft+document.documentElement.scrollLeft}}posx-=vertical?y+Math.round(handle.offsetHeight/2):x+Math.round(handle.offsetWidth/2);posx=snapToPxValue(posx);if(animation=="tween"){addClass(innerWrapper,"fd-slider-active");tweenTo(posx)}else{if(animation=="timed"){addClass(innerWrapper,"fd-slider-active");addEvent(document,touchEvents?"touchend":"mouseup",onDocMouseUp);destPos=posx;onTimer()}else{pixelsToValue(posx)}}}return stopEvent(e)}function onDocMouseUp(e){e=e||window.event;preventDefault(e);removeEvent(document,touchEvents?"touchend":"mouseup",onDocMouseUp);removeClass(innerWrapper,"fd-slider-active");clearTimeout(timer);timer=null;kbEnabled=true;return stopEvent(e)}function stopDrag(e){e=e||window.event;preventDefault(e);if(touchEvents){removeEvent(document,"touchmove",trackMouse);removeEvent(document,"touchend",stopDrag)}else{removeEvent(document,"mousemove",trackMouse);removeEvent(document,"mouseup",stopDrag)}kbEnabled=true;removeClass(document.body,"fd-slider-drag-"+(vertical?"vertical":"horizontal"));removeClass(innerWrapper,"fd-slider-active");callback("dragend");return stopEvent(e)}function trackMouse(e){e=e||window.event;preventDefault(e);if(e.touches){if(e.targetTouches&&e.targetTouches.length!=1){return false}e=e.touches[0]}pixelsToValue(snapToPxValue(handlePos+(vertical?e.clientY-mousePos:e.clientX-mousePos)));return false}function increment(inc){var value=getWorkingValueFromInput();userSet=true;value+=inc*step;valueToPixels(getValidValue(value))}function locate(){var curleft=0,curtop=0,obj=outerWrapper;try{while(obj.offsetParent){curleft+=obj.offsetLeft;curtop+=obj.offsetTop;obj=obj.offsetParent}}catch(err){}x=curleft;y=curtop}function onTimer(){var xtmp=parseInt(vertical?handle.offsetTop:handle.offsetLeft,10);xtmp=Math.round((destPos<xtmp)?Math.max(destPos,Math.floor(xtmp-stepPx)):Math.min(destPos,Math.ceil(xtmp+stepPx)));pixelsToValue(snapToPxValue(xtmp));if(xtmp!=destPos){timer=setTimeout(onTimer,steps>20?50:100)}else{kbEnabled=true;removeClass(innerWrapper,"fd-slider-active");callback("finalise")}}var tween=function(){frame++;var c=tweenC,d=20,t=frame,b=tweenB,x=Math.ceil((t==d)?b+c:c*(-Math.pow(2,-10*t/d)+1)+b);pixelsToValue(t==d?tweenX:x);if(t!=d){callback("move");timer=setTimeout(tween,20)}else{clearTimeout(timer);timer=null;kbEnabled=true;removeClass(innerWrapper,"fd-slider-focused");removeClass(innerWrapper,"fd-slider-active");callback("finalise")}};function tweenTo(tx){kbEnabled=false;tweenX=parseInt(tx,10);tweenB=parseInt(vertical?handle.offsetTop:handle.offsetLeft,10);tweenC=tweenX-tweenB;tweenD=20;frame=0;if(!timer){timer=setTimeout(tween,20)}}function checkValue(value){if(isNaN(value)||value===""||typeof value=="undefined"){userSet=false;return defaultVal}else{if(value<Math.min(rMin,rMax)){userSet=false;return Math.min(rMin,rMax)}else{if(value>Math.max(rMin,rMax)){userSet=false;return Math.max(rMin,rMax)}}}userSet=true;return value}function getWorkingValueFromInput(){return getValidValue(tagName=="input"?parseFloat(inp.value):inp.selectedIndex)}function getValidValue(value){return(isNaN(value)||value===""||typeof value=="undefined")?defaultVal:Math.min(Math.max(value,Math.min(rMin,rMax)),Math.max(rMin,rMax))}function pixelsToValue(px){var val=getValidValue(scale?percentToValue(pixelsToPercent(px)):vertical?max-(Math.round(px/stepPx)*step):min+(Math.round(px/stepPx)*step));handle.style[vertical?"top":"left"]=(px||0)+"px";redrawRange();setInputValue((tagName=="select"||step==1)?Math.round(val):val)}function valueToPixels(val){var clearVal=false,value;if((typeof val=="undefined"||isNaN(val)||val==="")&&tagName=="input"&&!forceValue){value=defaultVal;clearVal=true;userSet=false}else{value=checkValue(val)}handle.style[vertical?"top":"left"]=(scale?percentToPixels(valueToPercent(value)):vertical?Math.round(((max-value)/step)*stepPx):Math.round(((value-min)/step)*stepPx))+"px";redrawRange();setInputValue(clearVal?"":value)}function snapToPxValue(px){if(scale){return Math.max(Math.min(rMaxPx,px),rMinPx)}else{var rem=px%stepPx;if(rem&&rem>=(stepPx/2)){px+=(stepPx-rem)}else{px-=rem}if(px<Math.min(Math.abs(rMinPx),Math.abs(rMaxPx))){px=Math.min(Math.abs(rMinPx),Math.abs(rMaxPx))}else{if(px>Math.max(Math.abs(rMinPx),Math.abs(rMaxPx))){px=Math.max(Math.abs(rMinPx),Math.abs(rMaxPx))}}return Math.min(Math.max(px,0),rMaxPx)}}function percentToValue(pct){var st=0,fr=min,value;for(var s in scale){if(!scale.hasOwnProperty(s)){continue}if(pct>=st&&pct<=+s){value=fr+((pct-st)*(+scale[s]-fr))/(+s-st)}st=+s;fr=+scale[s]}return value}function valueToPercent(value){var st=0,fr=min,pct=0;for(var s in scale){if(!scale.hasOwnProperty(s)){continue}if(value>=fr&&value<=+scale[s]){pct=st+(value-fr)*(+s-st)/(+scale[s]-fr)}st=+s;fr=+scale[s]}return pct}function percentToPixels(percent){return((outerWrapper[vertical?"offsetHeight":"offsetWidth"]-handle[vertical?"offsetHeight":"offsetWidth"])/100)*percent}function pixelsToPercent(pixels){return pixels/((outerWrapper[vertical?"offsetHeight":"offsetWidth"]-outerWrapper[handle?"offsetHeight":"offsetWidth"])/100)}function setInputValue(val){callback("update");if(!userSet){addClass(innerWrapper,"fd-slider-no-value")}else{removeClass(innerWrapper,"fd-slider-no-value")}if(tagName=="select"){try{val=parseInt(val,10);if(inp.selectedIndex===val){updateAriaValues();return}inp.options[val].selected=true}catch(err){}}else{if(val!=""){val=(min+(Math.round((val-min)/step)*step)).toFixed(precision)}if(inp.value===val){updateAriaValues();return}inp.value=val}updateAriaValues();callback("change")}function checkInputValue(value){return !(isNaN(value)||value===""||value<Math.min(rMin,rMax)||value>Math.max(rMin,rMax))}function setSliderRange(newMin,newMax){if(rMin>rMax){newMin=Math.min(min,Math.max(newMin,newMax));newMax=Math.max(max,Math.min(newMin,newMax));rMin=Math.max(newMin,newMax);rMax=Math.min(newMin,newMax)}else{newMin=Math.max(min,Math.min(newMin,newMax));newMax=Math.min(max,Math.max(newMin,newMax));rMin=Math.min(newMin,newMax);rMax=Math.max(newMin,newMax)}if(defaultVal<Math.min(rMin,rMax)){defaultVal=Math.min(rMin,rMax)}else{if(defaultVal>Math.max(rMin,rMax)){defaultVal=Math.max(rMin,rMax)}}handle.setAttribute("aria-valuemin",rMin);handle.setAttribute("aria-valuemax",rMax);checkValue(tagName=="input"?parseFloat(inp.value):inp.selectedIndex);redraw()}function redrawRange(){if(noRangeBar){return}if(vertical){rangeBar.style.height=Math.max(1,(bar.offsetHeight-handle.offsetTop))+"px"}else{rangeBar.style.width=Math.max(1,handle.offsetLeft)+"px"}}function findLabel(){var label=false,labelList=document.getElementsByTagName("label");for(var i=0,lbl;lbl=labelList[i];i++){if((lbl.htmlFor&&lbl.htmlFor==inp.id)||(lbl.getAttribute("for")==inp.id)){label=lbl;break}}if(label&&!label.id){label.id=inp.id+"_label"}return label}function updateAriaValues(){var val=tagName=="select"?inp.options[inp.selectedIndex].value:inp.value,valTxt=ariaFormat?ariaFormat(val):tagName=="select"?(inp.options[inp.selectedIndex].text?inp.options[inp.selectedIndex].text:val):val;handle.setAttribute("aria-valuenow",val);handle.setAttribute("aria-valuetext",valTxt)}function onInputChange(e){userSet=true;valueToPixels(tagName=="input"?parseFloat(inp.value):inp.selectedIndex);updateAriaValues()}function onReset(e){if(tagName=="input"){inp.value=inp.defaultValue}else{inp.selectedIndex=resetDef}checkValue(tagName=="select"?inp.options[inp.selectedIndex].value:inp.value);redraw();updateAriaValues()}function valueSet(tf){userSet=!!tf}function setTabIndex(e,i){e.setAttribute(!
/*@cc_on!@*/
false?"tabIndex":"tabindex",i);e.tabIndex=i}(function(){if(html5Shim||hideInput){addClass(inp,"fd-form-element-hidden")}else{addEvent(inp,"change",onInputChange)}if(html5Shim){inp.stepUp=function(n){increment(n||1)};inp.stepDown=function(n){increment(n||-1)}}outerWrapper=document.createElement("span");outerWrapper.className="fd-slider"+(vertical?"-vertical ":" ")+classNames;outerWrapper.id="fd-slider-"+inp.id;if(vertical&&inpHeight){outerWrapper.style.height=inpHeight+"px"}innerWrapper=document.createElement("span");innerWrapper.className="fd-slider-wrapper"+(!html5Shim?" fd-slider-no-value":"");ieBlur=document.createElement("span");ieBlur.className="fd-slider-inner";bar=document.createElement("span");bar.className="fd-slider-bar";if(fullARIA){handle=document.createElement("span")}else{handle=document.createElement("a");handle.setAttribute("href","#");addEvent(handle,"click",stopEvent)}setTabIndex(handle,0);handle.className="fd-slider-handle";handle.appendChild(document.createTextNode(String.fromCharCode(160)));innerWrapper.appendChild(ieBlur);if(!noRangeBar){rangeBar=document.createElement("span");rangeBar.className="fd-slider-range";innerWrapper.appendChild(rangeBar)}innerWrapper.appendChild(bar);innerWrapper.appendChild(handle);outerWrapper.appendChild(innerWrapper);inp.parentNode.insertBefore(outerWrapper,inp);if(isOpera||
/*@cc_on!@*/
!true){handle.unselectable="on";bar.unselectable="on";ieBlur.unselectable="on";outerWrapper.unselectable="on";innerWrapper.unselectable="on";if(!noRangeBar){rangeBar.unselectable="on"}}outerWrapper.setAttribute("role","application");handle.setAttribute("role","slider");handle.setAttribute("aria-valuemin",tagName=="select"?inp.options[0].value:min);handle.setAttribute("aria-valuemax",tagName=="select"?inp.options[inp.options.length-1].value:max);var lbl=findLabel();if(lbl){handle.setAttribute("aria-labelledby",lbl.id);handle.id="fd-slider-handle-"+inp.id;
/*@cc_on
                                /*@if(@_win32)
                                lbl.setAttribute("htmlFor", handle.id);
                                @else @*/
lbl.setAttribute("for",handle.id);
/*@end
                                @*/
}if(document.getElementById(describedBy)){handle.setAttribute("aria-describedby",describedBy)}if(inp.getAttribute("disabled")==true){disableSlider(true)}else{enableSlider(true)}if(varSetRules.onvalue){userSet=true;checkValue(tagName=="input"?parseFloat(inp.value):inp.selectedIndex)}if(inp.form){addEvent(inp.form,"reset",onReset)}updateAriaValues();callback("create");redraw()})();return{onResize:function(e){if(outerWrapper.offsetHeight!=sliderH||outerWrapper.offsetWidth!=sliderW){redraw()}},destroy:function(){destroySlider()},reset:function(){valueToPixels(tagName=="input"?parseFloat(inp.value):inp.selectedIndex)},stepUp:function(n){increment(Math.abs(n)||1)},stepDown:function(n){increment(-Math.abs(n)||-1)},increment:function(n){increment(n)},disable:function(){disableSlider()},enable:function(){enableSlider()},setRange:function(mi,mx){setSliderRange(mi,mx)},getValueSet:function(){return !!userSet},setValueSet:function(tf){valueSet(tf)},checkValue:function(){if(varSetRules.onvalue){userSet=true;checkValue(tagName=="input"?parseFloat(inp.value):inp.selectedIndex)}updateAriaValues();redraw()}}}addEvent(window,"load",init);addEvent(window,"load",function(){setTimeout(function(){var slider;for(slider in sliders){sliders[slider].checkValue()}},0)});addEvent(window,"resize",resize);addEvent(window,"unload",unload);(function(){var scriptFiles=document.getElementsByTagName("script"),scriptInner=String(scriptFiles[scriptFiles.length-1].innerHTML).replace(/[\n\r\s\t]+/g," ").replace(/^\s+/,"").replace(/\s+$/,""),json=parseJSON(scriptInner);if(typeof json==="object"&&!("err" in json)){affectJSON(json)}})();
/*@cc_on
        @if (@_jscript_version < 9)
        addClass(document.documentElement, "oldie");
        @end
        @*/
return{createSlider:function(opts){return createSlider(opts)},onDomReady:function(){onDomReady()},destroyAll:function(){destroyAllsliders()},destroySlider:function(id){return destroySingleSlider(id)},redrawAll:function(){resize()},addEvent:addEvent,removeEvent:removeEvent,stopEvent:stopEvent,increment:function(id,numSteps){if(!sliderExists(id)){return false}sliders[id].increment(numSteps)},stepUp:function(id,n){if(!sliderExists(id)){return false}sliders[id].stepUp(Math.abs(n)||1)},stepDown:function(id,n){if(!sliderExists(id)){return false}sliders[id].stepDown(-Math.abs(n)||-1)},setRange:function(id,newMin,newMax){if(!sliderExists(id)){return false}sliders[id].setRange(newMin,newMax)},updateSlider:function(id){if(!sliderExists(id)){return false}sliders[id].reset()},disable:function(id){if(!sliderExists(id)){return false}sliders[id].disable()},enable:function(id){if(!sliderExists(id)){return false}sliders[id].enable()},getValueSet:function(){return getValueSet()},setValueSet:function(a,tf){if(!sliderExists(id)){return false}setValueSet(a,tf)},setGlobalVariables:function(json){affectJSON(json)},removeOnload:function(){removeOnLoadEvent()}}})();

/*jshint asi: false, bitwise: false, boss: false, browser: true,
  camelcase: true, curly: true, debug: false, devel: true, eqeqeq: true,
  eqnull: false, evil: false, forin: false, immed: true, indent: 2,
  laxbreak: true, newcap: true, noarg: true, noempty: false, nomen: false,
  nonew: false, onevar: false, passfail: false, plusplus: false,
  quotmark: 'double', regexp: false, shadow: false, strict: false, sub: true,
  trailing: true, undef: true, white: false */
/*global window: false, self: false, $: false */


if ( top !== self ) {
  top.location = self.location.href;
}
else if ( document.location.host !== "servus.io" && document.location.hostname !== "localhost" ) {
  document.location.href = "https://servus.io";
}


// Initialize Foundation.
$(document).foundation();


// Highlighting the right menu section.
$(document).ready( function() {
  if ( location.pathname === "/" ) {
    return;
  }

  $("#main-nav a[href^='" + location.pathname + "']")
    .closest("li")
    .addClass("active");
});


// TOC generation
$(document).ready( function() {
  if ( !$("#toc").length ) {
    return;
  }

  var $ul = $("<ul id='faq-toc' class='square'>").appendTo("#toc");

  $("#content-column h3").each( function() {
    var $elem = $(this),
      sectionID = "#" + $elem.closest("section").attr("id"),
      $li = $( "<li>", {
        "html": $( "<a>", {
          "html": $.trim( $elem.text() ),
          "href": sectionID
        })
      });

    $ul.append($li);

    // Append link back to TOC to headline.
    $elem.append(
      "&nbsp;",
      $( "<a>", {
        "class": "nav-marker",
        "href": sectionID,
        "title": "Link to this section",
        "html": "&para;"
      })
    );

    // Add back-to-top arrows to each section's last paragraph.
    $elem.closest("section").find("li, p, dl").last().append(
      "&nbsp;",
      $( "<a>", {
        "class": "nav-marker back-to-top",
        "href": "#",
        "title": "Back to top",
        "html": "&uArr;"
      })
    );
  });
});


// Pay-What-You-Want functionality
$(document).ready( function() {
  if ( !$("#pwyw").length ) {
    return;
  }

  var rangeLow = 2,
    rangeHigh = 20,
    suggestedPrice = 5;

  function getComputedPrices(rawValue) {
    return {
      eur: +rawValue,
      usd: +( rawValue * 1.3 ).toPrecision(3)
    };
  }

  function getFormattedComputedPrices(rawValue) {
    var prices = getComputedPrices(rawValue);

    return {
      eur: prices.eur.toFixed(2).replace( /\.00$/, "" ),
      usd: prices.usd.toFixed(2).replace( /\.00$/, "" )
    };
  }

  function updateCurrentPriceDisplay(rawValue) {
    var prices = getFormattedComputedPrices(rawValue);

    $("#pwyw .js-selected-price").text(
      [ "€", prices.eur,
        " / ",
        "$", prices.usd
      ].join("")
    );
  }

  function renderPriceRangeDisplay() {
    var priceLow = getFormattedComputedPrices(rangeLow),
      priceHigh = getFormattedComputedPrices(rangeHigh);

    $("#pwyw")
      .find(".js-range-low").html(
        [ "€", priceLow.eur,
          "<br>",
          "$", priceLow.usd
        ].join("")
      )
      .end()
      .find(".js-range-high").html(
        [ "€", priceHigh.eur,
          "<br>",
          "$", priceHigh.usd
        ].join("")
      );
  }

  function updateStoreLink(rawValue) {
    var prices = getFormattedComputedPrices(rawValue),
      link = document.createElement("a"),
      $elem = $("#pwyw a.button-buy");

    link.href = $elem.attr("href");
    link.search = [
      "?tags=total_eur=",
      prices.eur * 100,
      ",total_usd=",
      prices.usd * 100
    ].join("");

    $("#pwyw a.button-buy").attr({
      href: link.href
    });
  }

  $("#price-selection")
    .on( "change", function() {
      var price = +$(this).val();

      updateCurrentPriceDisplay(price);
      updateStoreLink(price);
    })
    .trigger("focus");

  renderPriceRangeDisplay();
  updateCurrentPriceDisplay(suggestedPrice);
  updateStoreLink(suggestedPrice);

  // Toggle "read more" section visibility
  $("#read-more")
    .data( "height", $("#read-more").height() )
    .height(0)
    .css( "opacity", 0 );

  $(".js-toggle-read-more").one( "click", function() {
    var $section = $("#read-more");

    $section.animate(
      { height: $section.data("height") + 26, opacity: 1 },
      300,
      function() {
        $(this).height("auto");
      }
    );

    $(".js-toggle-read-more").remove();
  });
});


// Frontpage
$(document).ready( function() {
  if ( !$(".page-frontpage").length ) {
    return;
  }

  var $adjective = $("#claim .adjective"),
    $targetDemographic = $("#claim .target-demographic"),
    adjectives = $adjective.data("words").split(","),
    targetDemographics = $targetDemographic.data("words").split(","),
    indexAdjective = 1,
    indexTargetDemographic = 1;

  window.setInterval( function() {
    $adjective.fadeOut( 400, function() {
      $(this)
        .text( adjectives[ indexAdjective++ % adjectives.length ] )
        .fadeIn(400);
    });
  }, 5000 );

  window.setTimeout( function() {
    window.setInterval( function() {
      $targetDemographic.fadeOut( 400, function() {
        $(this)
          .text( targetDemographics[ indexTargetDemographic++ % targetDemographics.length ] + "." )
          .fadeIn(400);
      });
    }, 5000 );
  }, 2500 );
});
