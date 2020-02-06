// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/fetch-jsonp/build/fetch-jsonp.js":[function(require,module,exports) {
var define;
var global = arguments[3];
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod);
    global.fetchJsonp = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  var defaultOptions = {
    timeout: 5000,
    jsonpCallback: 'callback',
    jsonpCallbackFunction: null
  };

  function generateCallbackFunction() {
    return 'jsonp_' + Date.now() + '_' + Math.ceil(Math.random() * 100000);
  }

  function clearFunction(functionName) {
    // IE8 throws an exception when you try to delete a property on window
    // http://stackoverflow.com/a/1824228/751089
    try {
      delete window[functionName];
    } catch (e) {
      window[functionName] = undefined;
    }
  }

  function removeScript(scriptId) {
    var script = document.getElementById(scriptId);
    if (script) {
      document.getElementsByTagName('head')[0].removeChild(script);
    }
  }

  function fetchJsonp(_url) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    // to avoid param reassign
    var url = _url;
    var timeout = options.timeout || defaultOptions.timeout;
    var jsonpCallback = options.jsonpCallback || defaultOptions.jsonpCallback;

    var timeoutId = undefined;

    return new Promise(function (resolve, reject) {
      var callbackFunction = options.jsonpCallbackFunction || generateCallbackFunction();
      var scriptId = jsonpCallback + '_' + callbackFunction;

      window[callbackFunction] = function (response) {
        resolve({
          ok: true,
          // keep consistent with fetch API
          json: function json() {
            return Promise.resolve(response);
          }
        });

        if (timeoutId) clearTimeout(timeoutId);

        removeScript(scriptId);

        clearFunction(callbackFunction);
      };

      // Check if the user set their own params, and if not add a ? to start a list of params
      url += url.indexOf('?') === -1 ? '?' : '&';

      var jsonpScript = document.createElement('script');
      jsonpScript.setAttribute('src', '' + url + jsonpCallback + '=' + callbackFunction);
      if (options.charset) {
        jsonpScript.setAttribute('charset', options.charset);
      }
      jsonpScript.id = scriptId;
      document.getElementsByTagName('head')[0].appendChild(jsonpScript);

      timeoutId = setTimeout(function () {
        reject(new Error('JSONP request to ' + _url + ' timed out'));

        clearFunction(callbackFunction);
        removeScript(scriptId);
        window[callbackFunction] = function () {
          clearFunction(callbackFunction);
        };
      }, timeout);

      // Caught if got 404/500
      jsonpScript.onerror = function () {
        reject(new Error('JSONP request to ' + _url + ' failed'));

        clearFunction(callbackFunction);
        removeScript(scriptId);
        if (timeoutId) clearTimeout(timeoutId);
      };
    });
  }

  // export as global function
  /*
  let local;
  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }
  local.fetchJsonp = fetchJsonp;
  */

  module.exports = fetchJsonp;
});
},{}],"node_modules/chroma-js/chroma.js":[function(require,module,exports) {
var define;
var global = arguments[3];
/**
 * chroma.js - JavaScript library for color conversions
 *
 * Copyright (c) 2011-2019, Gregor Aisch
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. The name Gregor Aisch may not be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * -------------------------------------------------------
 *
 * chroma.js includes colors from colorbrewer2.org, which are released under
 * the following license:
 *
 * Copyright (c) 2002 Cynthia Brewer, Mark Harrower,
 * and The Pennsylvania State University.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 *
 * ------------------------------------------------------
 *
 * Named colors are taken from X11 Color Names.
 * http://www.w3.org/TR/css3-color/#svg-color
 *
 * @preserve
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.chroma = factory());
}(this, (function () { 'use strict';

    var limit = function (x, min, max) {
        if ( min === void 0 ) min=0;
        if ( max === void 0 ) max=1;

        return x < min ? min : x > max ? max : x;
    };

    var clip_rgb = function (rgb) {
        rgb._clipped = false;
        rgb._unclipped = rgb.slice(0);
        for (var i=0; i<=3; i++) {
            if (i < 3) {
                if (rgb[i] < 0 || rgb[i] > 255) { rgb._clipped = true; }
                rgb[i] = limit(rgb[i], 0, 255);
            } else if (i === 3) {
                rgb[i] = limit(rgb[i], 0, 1);
            }
        }
        return rgb;
    };

    // ported from jQuery's $.type
    var classToType = {};
    for (var i = 0, list = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Undefined', 'Null']; i < list.length; i += 1) {
        var name = list[i];

        classToType[("[object " + name + "]")] = name.toLowerCase();
    }
    var type = function(obj) {
        return classToType[Object.prototype.toString.call(obj)] || "object";
    };

    var unpack = function (args, keyOrder) {
        if ( keyOrder === void 0 ) keyOrder=null;

    	// if called with more than 3 arguments, we return the arguments
        if (args.length >= 3) { return Array.prototype.slice.call(args); }
        // with less than 3 args we check if first arg is object
        // and use the keyOrder string to extract and sort properties
    	if (type(args[0]) == 'object' && keyOrder) {
    		return keyOrder.split('')
    			.filter(function (k) { return args[0][k] !== undefined; })
    			.map(function (k) { return args[0][k]; });
    	}
    	// otherwise we just return the first argument
    	// (which we suppose is an array of args)
        return args[0];
    };

    var last = function (args) {
        if (args.length < 2) { return null; }
        var l = args.length-1;
        if (type(args[l]) == 'string') { return args[l].toLowerCase(); }
        return null;
    };

    var PI = Math.PI;

    var utils = {
    	clip_rgb: clip_rgb,
    	limit: limit,
    	type: type,
    	unpack: unpack,
    	last: last,
    	PI: PI,
    	TWOPI: PI*2,
    	PITHIRD: PI/3,
    	DEG2RAD: PI / 180,
    	RAD2DEG: 180 / PI
    };

    var input = {
    	format: {},
    	autodetect: []
    };

    var last$1 = utils.last;
    var clip_rgb$1 = utils.clip_rgb;
    var type$1 = utils.type;


    var Color = function Color() {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var me = this;
        if (type$1(args[0]) === 'object' &&
            args[0].constructor &&
            args[0].constructor === this.constructor) {
            // the argument is already a Color instance
            return args[0];
        }

        // last argument could be the mode
        var mode = last$1(args);
        var autodetect = false;

        if (!mode) {
            autodetect = true;
            if (!input.sorted) {
                input.autodetect = input.autodetect.sort(function (a,b) { return b.p - a.p; });
                input.sorted = true;
            }
            // auto-detect format
            for (var i = 0, list = input.autodetect; i < list.length; i += 1) {
                var chk = list[i];

                mode = chk.test.apply(chk, args);
                if (mode) { break; }
            }
        }

        if (input.format[mode]) {
            var rgb = input.format[mode].apply(null, autodetect ? args : args.slice(0,-1));
            me._rgb = clip_rgb$1(rgb);
        } else {
            throw new Error('unknown format: '+args);
        }

        // add alpha channel
        if (me._rgb.length === 3) { me._rgb.push(1); }
    };

    Color.prototype.toString = function toString () {
        if (type$1(this.hex) == 'function') { return this.hex(); }
        return ("[" + (this._rgb.join(',')) + "]");
    };

    var Color_1 = Color;

    var chroma = function () {
    	var args = [], len = arguments.length;
    	while ( len-- ) args[ len ] = arguments[ len ];

    	return new (Function.prototype.bind.apply( chroma.Color, [ null ].concat( args) ));
    };

    chroma.Color = Color_1;
    chroma.version = '2.1.0';

    var chroma_1 = chroma;

    var unpack$1 = utils.unpack;
    var max = Math.max;

    var rgb2cmyk = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$1(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        r = r / 255;
        g = g / 255;
        b = b / 255;
        var k = 1 - max(r,max(g,b));
        var f = k < 1 ? 1 / (1-k) : 0;
        var c = (1-r-k) * f;
        var m = (1-g-k) * f;
        var y = (1-b-k) * f;
        return [c,m,y,k];
    };

    var rgb2cmyk_1 = rgb2cmyk;

    var unpack$2 = utils.unpack;

    var cmyk2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$2(args, 'cmyk');
        var c = args[0];
        var m = args[1];
        var y = args[2];
        var k = args[3];
        var alpha = args.length > 4 ? args[4] : 1;
        if (k === 1) { return [0,0,0,alpha]; }
        return [
            c >= 1 ? 0 : 255 * (1-c) * (1-k), // r
            m >= 1 ? 0 : 255 * (1-m) * (1-k), // g
            y >= 1 ? 0 : 255 * (1-y) * (1-k), // b
            alpha
        ];
    };

    var cmyk2rgb_1 = cmyk2rgb;

    var unpack$3 = utils.unpack;
    var type$2 = utils.type;



    Color_1.prototype.cmyk = function() {
        return rgb2cmyk_1(this._rgb);
    };

    chroma_1.cmyk = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['cmyk']) ));
    };

    input.format.cmyk = cmyk2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$3(args, 'cmyk');
            if (type$2(args) === 'array' && args.length === 4) {
                return 'cmyk';
            }
        }
    });

    var unpack$4 = utils.unpack;
    var last$2 = utils.last;
    var rnd = function (a) { return Math.round(a*100)/100; };

    /*
     * supported arguments:
     * - hsl2css(h,s,l)
     * - hsl2css(h,s,l,a)
     * - hsl2css([h,s,l], mode)
     * - hsl2css([h,s,l,a], mode)
     * - hsl2css({h,s,l,a}, mode)
     */
    var hsl2css = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var hsla = unpack$4(args, 'hsla');
        var mode = last$2(args) || 'lsa';
        hsla[0] = rnd(hsla[0] || 0);
        hsla[1] = rnd(hsla[1]*100) + '%';
        hsla[2] = rnd(hsla[2]*100) + '%';
        if (mode === 'hsla' || (hsla.length > 3 && hsla[3]<1)) {
            hsla[3] = hsla.length > 3 ? hsla[3] : 1;
            mode = 'hsla';
        } else {
            hsla.length = 3;
        }
        return (mode + "(" + (hsla.join(',')) + ")");
    };

    var hsl2css_1 = hsl2css;

    var unpack$5 = utils.unpack;

    /*
     * supported arguments:
     * - rgb2hsl(r,g,b)
     * - rgb2hsl(r,g,b,a)
     * - rgb2hsl([r,g,b])
     * - rgb2hsl([r,g,b,a])
     * - rgb2hsl({r,g,b,a})
     */
    var rgb2hsl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$5(args, 'rgba');
        var r = args[0];
        var g = args[1];
        var b = args[2];

        r /= 255;
        g /= 255;
        b /= 255;

        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);

        var l = (max + min) / 2;
        var s, h;

        if (max === min){
            s = 0;
            h = Number.NaN;
        } else {
            s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
        }

        if (r == max) { h = (g - b) / (max - min); }
        else if (g == max) { h = 2 + (b - r) / (max - min); }
        else if (b == max) { h = 4 + (r - g) / (max - min); }

        h *= 60;
        if (h < 0) { h += 360; }
        if (args.length>3 && args[3]!==undefined) { return [h,s,l,args[3]]; }
        return [h,s,l];
    };

    var rgb2hsl_1 = rgb2hsl;

    var unpack$6 = utils.unpack;
    var last$3 = utils.last;


    var round = Math.round;

    /*
     * supported arguments:
     * - rgb2css(r,g,b)
     * - rgb2css(r,g,b,a)
     * - rgb2css([r,g,b], mode)
     * - rgb2css([r,g,b,a], mode)
     * - rgb2css({r,g,b,a}, mode)
     */
    var rgb2css = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgba = unpack$6(args, 'rgba');
        var mode = last$3(args) || 'rgb';
        if (mode.substr(0,3) == 'hsl') {
            return hsl2css_1(rgb2hsl_1(rgba), mode);
        }
        rgba[0] = round(rgba[0]);
        rgba[1] = round(rgba[1]);
        rgba[2] = round(rgba[2]);
        if (mode === 'rgba' || (rgba.length > 3 && rgba[3]<1)) {
            rgba[3] = rgba.length > 3 ? rgba[3] : 1;
            mode = 'rgba';
        }
        return (mode + "(" + (rgba.slice(0,mode==='rgb'?3:4).join(',')) + ")");
    };

    var rgb2css_1 = rgb2css;

    var unpack$7 = utils.unpack;
    var round$1 = Math.round;

    var hsl2rgb = function () {
        var assign;

        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];
        args = unpack$7(args, 'hsl');
        var h = args[0];
        var s = args[1];
        var l = args[2];
        var r,g,b;
        if (s === 0) {
            r = g = b = l*255;
        } else {
            var t3 = [0,0,0];
            var c = [0,0,0];
            var t2 = l < 0.5 ? l * (1+s) : l+s-l*s;
            var t1 = 2 * l - t2;
            var h_ = h / 360;
            t3[0] = h_ + 1/3;
            t3[1] = h_;
            t3[2] = h_ - 1/3;
            for (var i=0; i<3; i++) {
                if (t3[i] < 0) { t3[i] += 1; }
                if (t3[i] > 1) { t3[i] -= 1; }
                if (6 * t3[i] < 1)
                    { c[i] = t1 + (t2 - t1) * 6 * t3[i]; }
                else if (2 * t3[i] < 1)
                    { c[i] = t2; }
                else if (3 * t3[i] < 2)
                    { c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6; }
                else
                    { c[i] = t1; }
            }
            (assign = [round$1(c[0]*255),round$1(c[1]*255),round$1(c[2]*255)], r = assign[0], g = assign[1], b = assign[2]);
        }
        if (args.length > 3) {
            // keep alpha channel
            return [r,g,b,args[3]];
        }
        return [r,g,b,1];
    };

    var hsl2rgb_1 = hsl2rgb;

    var RE_RGB = /^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/;
    var RE_RGBA = /^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/;
    var RE_RGB_PCT = /^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
    var RE_RGBA_PCT = /^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;
    var RE_HSL = /^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
    var RE_HSLA = /^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;

    var round$2 = Math.round;

    var css2rgb = function (css) {
        css = css.toLowerCase().trim();
        var m;

        if (input.format.named) {
            try {
                return input.format.named(css);
            } catch (e) {
                // eslint-disable-next-line
            }
        }

        // rgb(250,20,0)
        if ((m = css.match(RE_RGB))) {
            var rgb = m.slice(1,4);
            for (var i=0; i<3; i++) {
                rgb[i] = +rgb[i];
            }
            rgb[3] = 1;  // default alpha
            return rgb;
        }

        // rgba(250,20,0,0.4)
        if ((m = css.match(RE_RGBA))) {
            var rgb$1 = m.slice(1,5);
            for (var i$1=0; i$1<4; i$1++) {
                rgb$1[i$1] = +rgb$1[i$1];
            }
            return rgb$1;
        }

        // rgb(100%,0%,0%)
        if ((m = css.match(RE_RGB_PCT))) {
            var rgb$2 = m.slice(1,4);
            for (var i$2=0; i$2<3; i$2++) {
                rgb$2[i$2] = round$2(rgb$2[i$2] * 2.55);
            }
            rgb$2[3] = 1;  // default alpha
            return rgb$2;
        }

        // rgba(100%,0%,0%,0.4)
        if ((m = css.match(RE_RGBA_PCT))) {
            var rgb$3 = m.slice(1,5);
            for (var i$3=0; i$3<3; i$3++) {
                rgb$3[i$3] = round$2(rgb$3[i$3] * 2.55);
            }
            rgb$3[3] = +rgb$3[3];
            return rgb$3;
        }

        // hsl(0,100%,50%)
        if ((m = css.match(RE_HSL))) {
            var hsl = m.slice(1,4);
            hsl[1] *= 0.01;
            hsl[2] *= 0.01;
            var rgb$4 = hsl2rgb_1(hsl);
            rgb$4[3] = 1;
            return rgb$4;
        }

        // hsla(0,100%,50%,0.5)
        if ((m = css.match(RE_HSLA))) {
            var hsl$1 = m.slice(1,4);
            hsl$1[1] *= 0.01;
            hsl$1[2] *= 0.01;
            var rgb$5 = hsl2rgb_1(hsl$1);
            rgb$5[3] = +m[4];  // default alpha = 1
            return rgb$5;
        }
    };

    css2rgb.test = function (s) {
        return RE_RGB.test(s) ||
            RE_RGBA.test(s) ||
            RE_RGB_PCT.test(s) ||
            RE_RGBA_PCT.test(s) ||
            RE_HSL.test(s) ||
            RE_HSLA.test(s);
    };

    var css2rgb_1 = css2rgb;

    var type$3 = utils.type;




    Color_1.prototype.css = function(mode) {
        return rgb2css_1(this._rgb, mode);
    };

    chroma_1.css = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['css']) ));
    };

    input.format.css = css2rgb_1;

    input.autodetect.push({
        p: 5,
        test: function (h) {
            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

            if (!rest.length && type$3(h) === 'string' && css2rgb_1.test(h)) {
                return 'css';
            }
        }
    });

    var unpack$8 = utils.unpack;

    input.format.gl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgb = unpack$8(args, 'rgba');
        rgb[0] *= 255;
        rgb[1] *= 255;
        rgb[2] *= 255;
        return rgb;
    };

    chroma_1.gl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['gl']) ));
    };

    Color_1.prototype.gl = function() {
        var rgb = this._rgb;
        return [rgb[0]/255, rgb[1]/255, rgb[2]/255, rgb[3]];
    };

    var unpack$9 = utils.unpack;

    var rgb2hcg = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$9(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var delta = max - min;
        var c = delta * 100 / 255;
        var _g = min / (255 - delta) * 100;
        var h;
        if (delta === 0) {
            h = Number.NaN;
        } else {
            if (r === max) { h = (g - b) / delta; }
            if (g === max) { h = 2+(b - r) / delta; }
            if (b === max) { h = 4+(r - g) / delta; }
            h *= 60;
            if (h < 0) { h += 360; }
        }
        return [h, c, _g];
    };

    var rgb2hcg_1 = rgb2hcg;

    var unpack$a = utils.unpack;
    var floor = Math.floor;

    /*
     * this is basically just HSV with some minor tweaks
     *
     * hue.. [0..360]
     * chroma .. [0..1]
     * grayness .. [0..1]
     */

    var hcg2rgb = function () {
        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];
        args = unpack$a(args, 'hcg');
        var h = args[0];
        var c = args[1];
        var _g = args[2];
        var r,g,b;
        _g = _g * 255;
        var _c = c * 255;
        if (c === 0) {
            r = g = b = _g;
        } else {
            if (h === 360) { h = 0; }
            if (h > 360) { h -= 360; }
            if (h < 0) { h += 360; }
            h /= 60;
            var i = floor(h);
            var f = h - i;
            var p = _g * (1 - c);
            var q = p + _c * (1 - f);
            var t = p + _c * f;
            var v = p + _c;
            switch (i) {
                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
            }
        }
        return [r, g, b, args.length > 3 ? args[3] : 1];
    };

    var hcg2rgb_1 = hcg2rgb;

    var unpack$b = utils.unpack;
    var type$4 = utils.type;






    Color_1.prototype.hcg = function() {
        return rgb2hcg_1(this._rgb);
    };

    chroma_1.hcg = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hcg']) ));
    };

    input.format.hcg = hcg2rgb_1;

    input.autodetect.push({
        p: 1,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$b(args, 'hcg');
            if (type$4(args) === 'array' && args.length === 3) {
                return 'hcg';
            }
        }
    });

    var unpack$c = utils.unpack;
    var last$4 = utils.last;
    var round$3 = Math.round;

    var rgb2hex = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$c(args, 'rgba');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var a = ref[3];
        var mode = last$4(args) || 'auto';
        if (a === undefined) { a = 1; }
        if (mode === 'auto') {
            mode = a < 1 ? 'rgba' : 'rgb';
        }
        r = round$3(r);
        g = round$3(g);
        b = round$3(b);
        var u = r << 16 | g << 8 | b;
        var str = "000000" + u.toString(16); //#.toUpperCase();
        str = str.substr(str.length - 6);
        var hxa = '0' + round$3(a * 255).toString(16);
        hxa = hxa.substr(hxa.length - 2);
        switch (mode.toLowerCase()) {
            case 'rgba': return ("#" + str + hxa);
            case 'argb': return ("#" + hxa + str);
            default: return ("#" + str);
        }
    };

    var rgb2hex_1 = rgb2hex;

    var RE_HEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    var RE_HEXA = /^#?([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/;

    var hex2rgb = function (hex) {
        if (hex.match(RE_HEX)) {
            // remove optional leading #
            if (hex.length === 4 || hex.length === 7) {
                hex = hex.substr(1);
            }
            // expand short-notation to full six-digit
            if (hex.length === 3) {
                hex = hex.split('');
                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            }
            var u = parseInt(hex, 16);
            var r = u >> 16;
            var g = u >> 8 & 0xFF;
            var b = u & 0xFF;
            return [r,g,b,1];
        }

        // match rgba hex format, eg #FF000077
        if (hex.match(RE_HEXA)) {
            if (hex.length === 5 || hex.length === 9) {
                // remove optional leading #
                hex = hex.substr(1);
            }
            // expand short-notation to full eight-digit
            if (hex.length === 4) {
                hex = hex.split('');
                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
            }
            var u$1 = parseInt(hex, 16);
            var r$1 = u$1 >> 24 & 0xFF;
            var g$1 = u$1 >> 16 & 0xFF;
            var b$1 = u$1 >> 8 & 0xFF;
            var a = Math.round((u$1 & 0xFF) / 0xFF * 100) / 100;
            return [r$1,g$1,b$1,a];
        }

        // we used to check for css colors here
        // if _input.css? and rgb = _input.css hex
        //     return rgb

        throw new Error(("unknown hex color: " + hex));
    };

    var hex2rgb_1 = hex2rgb;

    var type$5 = utils.type;




    Color_1.prototype.hex = function(mode) {
        return rgb2hex_1(this._rgb, mode);
    };

    chroma_1.hex = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hex']) ));
    };

    input.format.hex = hex2rgb_1;
    input.autodetect.push({
        p: 4,
        test: function (h) {
            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

            if (!rest.length && type$5(h) === 'string' && [3,4,5,6,7,8,9].indexOf(h.length) >= 0) {
                return 'hex';
            }
        }
    });

    var unpack$d = utils.unpack;
    var TWOPI = utils.TWOPI;
    var min = Math.min;
    var sqrt = Math.sqrt;
    var acos = Math.acos;

    var rgb2hsi = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
        */
        var ref = unpack$d(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        r /= 255;
        g /= 255;
        b /= 255;
        var h;
        var min_ = min(r,g,b);
        var i = (r+g+b) / 3;
        var s = i > 0 ? 1 - min_/i : 0;
        if (s === 0) {
            h = NaN;
        } else {
            h = ((r-g)+(r-b)) / 2;
            h /= sqrt((r-g)*(r-g) + (r-b)*(g-b));
            h = acos(h);
            if (b > g) {
                h = TWOPI - h;
            }
            h /= TWOPI;
        }
        return [h*360,s,i];
    };

    var rgb2hsi_1 = rgb2hsi;

    var unpack$e = utils.unpack;
    var limit$1 = utils.limit;
    var TWOPI$1 = utils.TWOPI;
    var PITHIRD = utils.PITHIRD;
    var cos = Math.cos;

    /*
     * hue [0..360]
     * saturation [0..1]
     * intensity [0..1]
     */
    var hsi2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
        */
        args = unpack$e(args, 'hsi');
        var h = args[0];
        var s = args[1];
        var i = args[2];
        var r,g,b;

        if (isNaN(h)) { h = 0; }
        if (isNaN(s)) { s = 0; }
        // normalize hue
        if (h > 360) { h -= 360; }
        if (h < 0) { h += 360; }
        h /= 360;
        if (h < 1/3) {
            b = (1-s)/3;
            r = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
            g = 1 - (b+r);
        } else if (h < 2/3) {
            h -= 1/3;
            r = (1-s)/3;
            g = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
            b = 1 - (r+g);
        } else {
            h -= 2/3;
            g = (1-s)/3;
            b = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
            r = 1 - (g+b);
        }
        r = limit$1(i*r*3);
        g = limit$1(i*g*3);
        b = limit$1(i*b*3);
        return [r*255, g*255, b*255, args.length > 3 ? args[3] : 1];
    };

    var hsi2rgb_1 = hsi2rgb;

    var unpack$f = utils.unpack;
    var type$6 = utils.type;






    Color_1.prototype.hsi = function() {
        return rgb2hsi_1(this._rgb);
    };

    chroma_1.hsi = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsi']) ));
    };

    input.format.hsi = hsi2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$f(args, 'hsi');
            if (type$6(args) === 'array' && args.length === 3) {
                return 'hsi';
            }
        }
    });

    var unpack$g = utils.unpack;
    var type$7 = utils.type;






    Color_1.prototype.hsl = function() {
        return rgb2hsl_1(this._rgb);
    };

    chroma_1.hsl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsl']) ));
    };

    input.format.hsl = hsl2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$g(args, 'hsl');
            if (type$7(args) === 'array' && args.length === 3) {
                return 'hsl';
            }
        }
    });

    var unpack$h = utils.unpack;
    var min$1 = Math.min;
    var max$1 = Math.max;

    /*
     * supported arguments:
     * - rgb2hsv(r,g,b)
     * - rgb2hsv([r,g,b])
     * - rgb2hsv({r,g,b})
     */
    var rgb2hsl$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$h(args, 'rgb');
        var r = args[0];
        var g = args[1];
        var b = args[2];
        var min_ = min$1(r, g, b);
        var max_ = max$1(r, g, b);
        var delta = max_ - min_;
        var h,s,v;
        v = max_ / 255.0;
        if (max_ === 0) {
            h = Number.NaN;
            s = 0;
        } else {
            s = delta / max_;
            if (r === max_) { h = (g - b) / delta; }
            if (g === max_) { h = 2+(b - r) / delta; }
            if (b === max_) { h = 4+(r - g) / delta; }
            h *= 60;
            if (h < 0) { h += 360; }
        }
        return [h, s, v]
    };

    var rgb2hsv = rgb2hsl$1;

    var unpack$i = utils.unpack;
    var floor$1 = Math.floor;

    var hsv2rgb = function () {
        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];
        args = unpack$i(args, 'hsv');
        var h = args[0];
        var s = args[1];
        var v = args[2];
        var r,g,b;
        v *= 255;
        if (s === 0) {
            r = g = b = v;
        } else {
            if (h === 360) { h = 0; }
            if (h > 360) { h -= 360; }
            if (h < 0) { h += 360; }
            h /= 60;

            var i = floor$1(h);
            var f = h - i;
            var p = v * (1 - s);
            var q = v * (1 - s * f);
            var t = v * (1 - s * (1 - f));

            switch (i) {
                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
            }
        }
        return [r,g,b,args.length > 3?args[3]:1];
    };

    var hsv2rgb_1 = hsv2rgb;

    var unpack$j = utils.unpack;
    var type$8 = utils.type;






    Color_1.prototype.hsv = function() {
        return rgb2hsv(this._rgb);
    };

    chroma_1.hsv = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsv']) ));
    };

    input.format.hsv = hsv2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$j(args, 'hsv');
            if (type$8(args) === 'array' && args.length === 3) {
                return 'hsv';
            }
        }
    });

    var labConstants = {
        // Corresponds roughly to RGB brighter/darker
        Kn: 18,

        // D65 standard referent
        Xn: 0.950470,
        Yn: 1,
        Zn: 1.088830,

        t0: 0.137931034,  // 4 / 29
        t1: 0.206896552,  // 6 / 29
        t2: 0.12841855,   // 3 * t1 * t1
        t3: 0.008856452,  // t1 * t1 * t1
    };

    var unpack$k = utils.unpack;
    var pow = Math.pow;

    var rgb2lab = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$k(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = rgb2xyz(r,g,b);
        var x = ref$1[0];
        var y = ref$1[1];
        var z = ref$1[2];
        var l = 116 * y - 16;
        return [l < 0 ? 0 : l, 500 * (x - y), 200 * (y - z)];
    };

    var rgb_xyz = function (r) {
        if ((r /= 255) <= 0.04045) { return r / 12.92; }
        return pow((r + 0.055) / 1.055, 2.4);
    };

    var xyz_lab = function (t) {
        if (t > labConstants.t3) { return pow(t, 1 / 3); }
        return t / labConstants.t2 + labConstants.t0;
    };

    var rgb2xyz = function (r,g,b) {
        r = rgb_xyz(r);
        g = rgb_xyz(g);
        b = rgb_xyz(b);
        var x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / labConstants.Xn);
        var y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / labConstants.Yn);
        var z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / labConstants.Zn);
        return [x,y,z];
    };

    var rgb2lab_1 = rgb2lab;

    var unpack$l = utils.unpack;
    var pow$1 = Math.pow;

    /*
     * L* [0..100]
     * a [-100..100]
     * b [-100..100]
     */
    var lab2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$l(args, 'lab');
        var l = args[0];
        var a = args[1];
        var b = args[2];
        var x,y,z, r,g,b_;

        y = (l + 16) / 116;
        x = isNaN(a) ? y : y + a / 500;
        z = isNaN(b) ? y : y - b / 200;

        y = labConstants.Yn * lab_xyz(y);
        x = labConstants.Xn * lab_xyz(x);
        z = labConstants.Zn * lab_xyz(z);

        r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);  // D65 -> sRGB
        g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
        b_ = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);

        return [r,g,b_,args.length > 3 ? args[3] : 1];
    };

    var xyz_rgb = function (r) {
        return 255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow$1(r, 1 / 2.4) - 0.055)
    };

    var lab_xyz = function (t) {
        return t > labConstants.t1 ? t * t * t : labConstants.t2 * (t - labConstants.t0)
    };

    var lab2rgb_1 = lab2rgb;

    var unpack$m = utils.unpack;
    var type$9 = utils.type;






    Color_1.prototype.lab = function() {
        return rgb2lab_1(this._rgb);
    };

    chroma_1.lab = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['lab']) ));
    };

    input.format.lab = lab2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$m(args, 'lab');
            if (type$9(args) === 'array' && args.length === 3) {
                return 'lab';
            }
        }
    });

    var unpack$n = utils.unpack;
    var RAD2DEG = utils.RAD2DEG;
    var sqrt$1 = Math.sqrt;
    var atan2 = Math.atan2;
    var round$4 = Math.round;

    var lab2lch = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$n(args, 'lab');
        var l = ref[0];
        var a = ref[1];
        var b = ref[2];
        var c = sqrt$1(a * a + b * b);
        var h = (atan2(b, a) * RAD2DEG + 360) % 360;
        if (round$4(c*10000) === 0) { h = Number.NaN; }
        return [l, c, h];
    };

    var lab2lch_1 = lab2lch;

    var unpack$o = utils.unpack;



    var rgb2lch = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$o(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = rgb2lab_1(r,g,b);
        var l = ref$1[0];
        var a = ref$1[1];
        var b_ = ref$1[2];
        return lab2lch_1(l,a,b_);
    };

    var rgb2lch_1 = rgb2lch;

    var unpack$p = utils.unpack;
    var DEG2RAD = utils.DEG2RAD;
    var sin = Math.sin;
    var cos$1 = Math.cos;

    var lch2lab = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        /*
        Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
        These formulas were invented by David Dalrymple to obtain maximum contrast without going
        out of gamut if the parameters are in the range 0-1.

        A saturation multiplier was added by Gregor Aisch
        */
        var ref = unpack$p(args, 'lch');
        var l = ref[0];
        var c = ref[1];
        var h = ref[2];
        if (isNaN(h)) { h = 0; }
        h = h * DEG2RAD;
        return [l, cos$1(h) * c, sin(h) * c]
    };

    var lch2lab_1 = lch2lab;

    var unpack$q = utils.unpack;



    var lch2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$q(args, 'lch');
        var l = args[0];
        var c = args[1];
        var h = args[2];
        var ref = lch2lab_1 (l,c,h);
        var L = ref[0];
        var a = ref[1];
        var b_ = ref[2];
        var ref$1 = lab2rgb_1 (L,a,b_);
        var r = ref$1[0];
        var g = ref$1[1];
        var b = ref$1[2];
        return [r, g, b, args.length > 3 ? args[3] : 1];
    };

    var lch2rgb_1 = lch2rgb;

    var unpack$r = utils.unpack;


    var hcl2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var hcl = unpack$r(args, 'hcl').reverse();
        return lch2rgb_1.apply(void 0, hcl);
    };

    var hcl2rgb_1 = hcl2rgb;

    var unpack$s = utils.unpack;
    var type$a = utils.type;






    Color_1.prototype.lch = function() { return rgb2lch_1(this._rgb); };
    Color_1.prototype.hcl = function() { return rgb2lch_1(this._rgb).reverse(); };

    chroma_1.lch = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['lch']) ));
    };
    chroma_1.hcl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hcl']) ));
    };

    input.format.lch = lch2rgb_1;
    input.format.hcl = hcl2rgb_1;

    ['lch','hcl'].forEach(function (m) { return input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$s(args, m);
            if (type$a(args) === 'array' && args.length === 3) {
                return m;
            }
        }
    }); });

    /**
    	X11 color names

    	http://www.w3.org/TR/css3-color/#svg-color
    */

    var w3cx11 = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflower: '#6495ed',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgreen: '#006400',
        darkgrey: '#a9a9a9',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkslategrey: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1e90ff',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        gold: '#ffd700',
        goldenrod: '#daa520',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        grey: '#808080',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        laserlemon: '#ffff54',
        lavender: '#e6e6fa',
        lavenderblush: '#fff0f5',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrod: '#fafad2',
        lightgoldenrodyellow: '#fafad2',
        lightgray: '#d3d3d3',
        lightgreen: '#90ee90',
        lightgrey: '#d3d3d3',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        maroon2: '#7f0000',
        maroon3: '#b03060',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370db',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#db7093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        purple2: '#7f007f',
        purple3: '#a020f0',
        rebeccapurple: '#663399',
        red: '#ff0000',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32'
    };

    var w3cx11_1 = w3cx11;

    var type$b = utils.type;





    Color_1.prototype.name = function() {
        var hex = rgb2hex_1(this._rgb, 'rgb');
        for (var i = 0, list = Object.keys(w3cx11_1); i < list.length; i += 1) {
            var n = list[i];

            if (w3cx11_1[n] === hex) { return n.toLowerCase(); }
        }
        return hex;
    };

    input.format.named = function (name) {
        name = name.toLowerCase();
        if (w3cx11_1[name]) { return hex2rgb_1(w3cx11_1[name]); }
        throw new Error('unknown color name: '+name);
    };

    input.autodetect.push({
        p: 5,
        test: function (h) {
            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

            if (!rest.length && type$b(h) === 'string' && w3cx11_1[h.toLowerCase()]) {
                return 'named';
            }
        }
    });

    var unpack$t = utils.unpack;

    var rgb2num = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$t(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        return (r << 16) + (g << 8) + b;
    };

    var rgb2num_1 = rgb2num;

    var type$c = utils.type;

    var num2rgb = function (num) {
        if (type$c(num) == "number" && num >= 0 && num <= 0xFFFFFF) {
            var r = num >> 16;
            var g = (num >> 8) & 0xFF;
            var b = num & 0xFF;
            return [r,g,b,1];
        }
        throw new Error("unknown num color: "+num);
    };

    var num2rgb_1 = num2rgb;

    var type$d = utils.type;



    Color_1.prototype.num = function() {
        return rgb2num_1(this._rgb);
    };

    chroma_1.num = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['num']) ));
    };

    input.format.num = num2rgb_1;

    input.autodetect.push({
        p: 5,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            if (args.length === 1 && type$d(args[0]) === 'number' && args[0] >= 0 && args[0] <= 0xFFFFFF) {
                return 'num';
            }
        }
    });

    var unpack$u = utils.unpack;
    var type$e = utils.type;
    var round$5 = Math.round;

    Color_1.prototype.rgb = function(rnd) {
        if ( rnd === void 0 ) rnd=true;

        if (rnd === false) { return this._rgb.slice(0,3); }
        return this._rgb.slice(0,3).map(round$5);
    };

    Color_1.prototype.rgba = function(rnd) {
        if ( rnd === void 0 ) rnd=true;

        return this._rgb.slice(0,4).map(function (v,i) {
            return i<3 ? (rnd === false ? v : round$5(v)) : v;
        });
    };

    chroma_1.rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['rgb']) ));
    };

    input.format.rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgba = unpack$u(args, 'rgba');
        if (rgba[3] === undefined) { rgba[3] = 1; }
        return rgba;
    };

    input.autodetect.push({
        p: 3,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$u(args, 'rgba');
            if (type$e(args) === 'array' && (args.length === 3 ||
                args.length === 4 && type$e(args[3]) == 'number' && args[3] >= 0 && args[3] <= 1)) {
                return 'rgb';
            }
        }
    });

    /*
     * Based on implementation by Neil Bartlett
     * https://github.com/neilbartlett/color-temperature
     */

    var log = Math.log;

    var temperature2rgb = function (kelvin) {
        var temp = kelvin / 100;
        var r,g,b;
        if (temp < 66) {
            r = 255;
            g = -155.25485562709179 - 0.44596950469579133 * (g = temp-2) + 104.49216199393888 * log(g);
            b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp-10) + 115.67994401066147 * log(b);
        } else {
            r = 351.97690566805693 + 0.114206453784165 * (r = temp-55) - 40.25366309332127 * log(r);
            g = 325.4494125711974 + 0.07943456536662342 * (g = temp-50) - 28.0852963507957 * log(g);
            b = 255;
        }
        return [r,g,b,1];
    };

    var temperature2rgb_1 = temperature2rgb;

    /*
     * Based on implementation by Neil Bartlett
     * https://github.com/neilbartlett/color-temperature
     **/


    var unpack$v = utils.unpack;
    var round$6 = Math.round;

    var rgb2temperature = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgb = unpack$v(args, 'rgb');
        var r = rgb[0], b = rgb[2];
        var minTemp = 1000;
        var maxTemp = 40000;
        var eps = 0.4;
        var temp;
        while (maxTemp - minTemp > eps) {
            temp = (maxTemp + minTemp) * 0.5;
            var rgb$1 = temperature2rgb_1(temp);
            if ((rgb$1[2] / rgb$1[0]) >= (b / r)) {
                maxTemp = temp;
            } else {
                minTemp = temp;
            }
        }
        return round$6(temp);
    };

    var rgb2temperature_1 = rgb2temperature;

    Color_1.prototype.temp =
    Color_1.prototype.kelvin =
    Color_1.prototype.temperature = function() {
        return rgb2temperature_1(this._rgb);
    };

    chroma_1.temp =
    chroma_1.kelvin =
    chroma_1.temperature = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['temp']) ));
    };

    input.format.temp =
    input.format.kelvin =
    input.format.temperature = temperature2rgb_1;

    var type$f = utils.type;

    Color_1.prototype.alpha = function(a, mutate) {
        if ( mutate === void 0 ) mutate=false;

        if (a !== undefined && type$f(a) === 'number') {
            if (mutate) {
                this._rgb[3] = a;
                return this;
            }
            return new Color_1([this._rgb[0], this._rgb[1], this._rgb[2], a], 'rgb');
        }
        return this._rgb[3];
    };

    Color_1.prototype.clipped = function() {
        return this._rgb._clipped || false;
    };

    Color_1.prototype.darken = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	var me = this;
    	var lab = me.lab();
    	lab[0] -= labConstants.Kn * amount;
    	return new Color_1(lab, 'lab').alpha(me.alpha(), true);
    };

    Color_1.prototype.brighten = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	return this.darken(-amount);
    };

    Color_1.prototype.darker = Color_1.prototype.darken;
    Color_1.prototype.brighter = Color_1.prototype.brighten;

    Color_1.prototype.get = function(mc) {
        var ref = mc.split('.');
        var mode = ref[0];
        var channel = ref[1];
        var src = this[mode]();
        if (channel) {
            var i = mode.indexOf(channel);
            if (i > -1) { return src[i]; }
            throw new Error(("unknown channel " + channel + " in mode " + mode));
        } else {
            return src;
        }
    };

    var type$g = utils.type;
    var pow$2 = Math.pow;

    var EPS = 1e-7;
    var MAX_ITER = 20;

    Color_1.prototype.luminance = function(lum) {
        if (lum !== undefined && type$g(lum) === 'number') {
            if (lum === 0) {
                // return pure black
                return new Color_1([0,0,0,this._rgb[3]], 'rgb');
            }
            if (lum === 1) {
                // return pure white
                return new Color_1([255,255,255,this._rgb[3]], 'rgb');
            }
            // compute new color using...
            var cur_lum = this.luminance();
            var mode = 'rgb';
            var max_iter = MAX_ITER;

            var test = function (low, high) {
                var mid = low.interpolate(high, 0.5, mode);
                var lm = mid.luminance();
                if (Math.abs(lum - lm) < EPS || !max_iter--) {
                    // close enough
                    return mid;
                }
                return lm > lum ? test(low, mid) : test(mid, high);
            };

            var rgb = (cur_lum > lum ? test(new Color_1([0,0,0]), this) : test(this, new Color_1([255,255,255]))).rgb();
            return new Color_1(rgb.concat( [this._rgb[3]]));
        }
        return rgb2luminance.apply(void 0, (this._rgb).slice(0,3));
    };


    var rgb2luminance = function (r,g,b) {
        // relative luminance
        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
        r = luminance_x(r);
        g = luminance_x(g);
        b = luminance_x(b);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    var luminance_x = function (x) {
        x /= 255;
        return x <= 0.03928 ? x/12.92 : pow$2((x+0.055)/1.055, 2.4);
    };

    var interpolator = {};

    var type$h = utils.type;


    var mix = function (col1, col2, f) {
        if ( f === void 0 ) f=0.5;
        var rest = [], len = arguments.length - 3;
        while ( len-- > 0 ) rest[ len ] = arguments[ len + 3 ];

        var mode = rest[0] || 'lrgb';
        if (!interpolator[mode] && !rest.length) {
            // fall back to the first supported mode
            mode = Object.keys(interpolator)[0];
        }
        if (!interpolator[mode]) {
            throw new Error(("interpolation mode " + mode + " is not defined"));
        }
        if (type$h(col1) !== 'object') { col1 = new Color_1(col1); }
        if (type$h(col2) !== 'object') { col2 = new Color_1(col2); }
        return interpolator[mode](col1, col2, f)
            .alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
    };

    Color_1.prototype.mix =
    Color_1.prototype.interpolate = function(col2, f) {
    	if ( f === void 0 ) f=0.5;
    	var rest = [], len = arguments.length - 2;
    	while ( len-- > 0 ) rest[ len ] = arguments[ len + 2 ];

    	return mix.apply(void 0, [ this, col2, f ].concat( rest ));
    };

    Color_1.prototype.premultiply = function(mutate) {
    	if ( mutate === void 0 ) mutate=false;

    	var rgb = this._rgb;
    	var a = rgb[3];
    	if (mutate) {
    		this._rgb = [rgb[0]*a, rgb[1]*a, rgb[2]*a, a];
    		return this;
    	} else {
    		return new Color_1([rgb[0]*a, rgb[1]*a, rgb[2]*a, a], 'rgb');
    	}
    };

    Color_1.prototype.saturate = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	var me = this;
    	var lch = me.lch();
    	lch[1] += labConstants.Kn * amount;
    	if (lch[1] < 0) { lch[1] = 0; }
    	return new Color_1(lch, 'lch').alpha(me.alpha(), true);
    };

    Color_1.prototype.desaturate = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	return this.saturate(-amount);
    };

    var type$i = utils.type;

    Color_1.prototype.set = function(mc, value, mutate) {
        if ( mutate === void 0 ) mutate=false;

        var ref = mc.split('.');
        var mode = ref[0];
        var channel = ref[1];
        var src = this[mode]();
        if (channel) {
            var i = mode.indexOf(channel);
            if (i > -1) {
                if (type$i(value) == 'string') {
                    switch(value.charAt(0)) {
                        case '+': src[i] += +value; break;
                        case '-': src[i] += +value; break;
                        case '*': src[i] *= +(value.substr(1)); break;
                        case '/': src[i] /= +(value.substr(1)); break;
                        default: src[i] = +value;
                    }
                } else if (type$i(value) === 'number') {
                    src[i] = value;
                } else {
                    throw new Error("unsupported value for Color.set");
                }
                var out = new Color_1(src, mode);
                if (mutate) {
                    this._rgb = out._rgb;
                    return this;
                }
                return out;
            }
            throw new Error(("unknown channel " + channel + " in mode " + mode));
        } else {
            return src;
        }
    };

    var rgb$1 = function (col1, col2, f) {
        var xyz0 = col1._rgb;
        var xyz1 = col2._rgb;
        return new Color_1(
            xyz0[0] + f * (xyz1[0]-xyz0[0]),
            xyz0[1] + f * (xyz1[1]-xyz0[1]),
            xyz0[2] + f * (xyz1[2]-xyz0[2]),
            'rgb'
        )
    };

    // register interpolator
    interpolator.rgb = rgb$1;

    var sqrt$2 = Math.sqrt;
    var pow$3 = Math.pow;

    var lrgb = function (col1, col2, f) {
        var ref = col1._rgb;
        var x1 = ref[0];
        var y1 = ref[1];
        var z1 = ref[2];
        var ref$1 = col2._rgb;
        var x2 = ref$1[0];
        var y2 = ref$1[1];
        var z2 = ref$1[2];
        return new Color_1(
            sqrt$2(pow$3(x1,2) * (1-f) + pow$3(x2,2) * f),
            sqrt$2(pow$3(y1,2) * (1-f) + pow$3(y2,2) * f),
            sqrt$2(pow$3(z1,2) * (1-f) + pow$3(z2,2) * f),
            'rgb'
        )
    };

    // register interpolator
    interpolator.lrgb = lrgb;

    var lab$1 = function (col1, col2, f) {
        var xyz0 = col1.lab();
        var xyz1 = col2.lab();
        return new Color_1(
            xyz0[0] + f * (xyz1[0]-xyz0[0]),
            xyz0[1] + f * (xyz1[1]-xyz0[1]),
            xyz0[2] + f * (xyz1[2]-xyz0[2]),
            'lab'
        )
    };

    // register interpolator
    interpolator.lab = lab$1;

    var _hsx = function (col1, col2, f, m) {
        var assign, assign$1;

        var xyz0, xyz1;
        if (m === 'hsl') {
            xyz0 = col1.hsl();
            xyz1 = col2.hsl();
        } else if (m === 'hsv') {
            xyz0 = col1.hsv();
            xyz1 = col2.hsv();
        } else if (m === 'hcg') {
            xyz0 = col1.hcg();
            xyz1 = col2.hcg();
        } else if (m === 'hsi') {
            xyz0 = col1.hsi();
            xyz1 = col2.hsi();
        } else if (m === 'lch' || m === 'hcl') {
            m = 'hcl';
            xyz0 = col1.hcl();
            xyz1 = col2.hcl();
        }

        var hue0, hue1, sat0, sat1, lbv0, lbv1;
        if (m.substr(0, 1) === 'h') {
            (assign = xyz0, hue0 = assign[0], sat0 = assign[1], lbv0 = assign[2]);
            (assign$1 = xyz1, hue1 = assign$1[0], sat1 = assign$1[1], lbv1 = assign$1[2]);
        }

        var sat, hue, lbv, dh;

        if (!isNaN(hue0) && !isNaN(hue1)) {
            // both colors have hue
            if (hue1 > hue0 && hue1 - hue0 > 180) {
                dh = hue1-(hue0+360);
            } else if (hue1 < hue0 && hue0 - hue1 > 180) {
                dh = hue1+360-hue0;
            } else{
                dh = hue1 - hue0;
            }
            hue = hue0 + f * dh;
        } else if (!isNaN(hue0)) {
            hue = hue0;
            if ((lbv1 == 1 || lbv1 == 0) && m != 'hsv') { sat = sat0; }
        } else if (!isNaN(hue1)) {
            hue = hue1;
            if ((lbv0 == 1 || lbv0 == 0) && m != 'hsv') { sat = sat1; }
        } else {
            hue = Number.NaN;
        }

        if (sat === undefined) { sat = sat0 + f * (sat1 - sat0); }
        lbv = lbv0 + f * (lbv1-lbv0);
        return new Color_1([hue, sat, lbv], m);
    };

    var lch$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'lch');
    };

    // register interpolator
    interpolator.lch = lch$1;
    interpolator.hcl = lch$1;

    var num$1 = function (col1, col2, f) {
        var c1 = col1.num();
        var c2 = col2.num();
        return new Color_1(c1 + f * (c2-c1), 'num')
    };

    // register interpolator
    interpolator.num = num$1;

    var hcg$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hcg');
    };

    // register interpolator
    interpolator.hcg = hcg$1;

    var hsi$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hsi');
    };

    // register interpolator
    interpolator.hsi = hsi$1;

    var hsl$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hsl');
    };

    // register interpolator
    interpolator.hsl = hsl$1;

    var hsv$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hsv');
    };

    // register interpolator
    interpolator.hsv = hsv$1;

    var clip_rgb$2 = utils.clip_rgb;
    var pow$4 = Math.pow;
    var sqrt$3 = Math.sqrt;
    var PI$1 = Math.PI;
    var cos$2 = Math.cos;
    var sin$1 = Math.sin;
    var atan2$1 = Math.atan2;

    var average = function (colors, mode, weights) {
        if ( mode === void 0 ) mode='lrgb';
        if ( weights === void 0 ) weights=null;

        var l = colors.length;
        if (!weights) { weights = Array.from(new Array(l)).map(function () { return 1; }); }
        // normalize weights
        var k = l / weights.reduce(function(a, b) { return a + b; });
        weights.forEach(function (w,i) { weights[i] *= k; });
        // convert colors to Color objects
        colors = colors.map(function (c) { return new Color_1(c); });
        if (mode === 'lrgb') {
            return _average_lrgb(colors, weights)
        }
        var first = colors.shift();
        var xyz = first.get(mode);
        var cnt = [];
        var dx = 0;
        var dy = 0;
        // initial color
        for (var i=0; i<xyz.length; i++) {
            xyz[i] = (xyz[i] || 0) * weights[0];
            cnt.push(isNaN(xyz[i]) ? 0 : weights[0]);
            if (mode.charAt(i) === 'h' && !isNaN(xyz[i])) {
                var A = xyz[i] / 180 * PI$1;
                dx += cos$2(A) * weights[0];
                dy += sin$1(A) * weights[0];
            }
        }

        var alpha = first.alpha() * weights[0];
        colors.forEach(function (c,ci) {
            var xyz2 = c.get(mode);
            alpha += c.alpha() * weights[ci+1];
            for (var i=0; i<xyz.length; i++) {
                if (!isNaN(xyz2[i])) {
                    cnt[i] += weights[ci+1];
                    if (mode.charAt(i) === 'h') {
                        var A = xyz2[i] / 180 * PI$1;
                        dx += cos$2(A) * weights[ci+1];
                        dy += sin$1(A) * weights[ci+1];
                    } else {
                        xyz[i] += xyz2[i] * weights[ci+1];
                    }
                }
            }
        });

        for (var i$1=0; i$1<xyz.length; i$1++) {
            if (mode.charAt(i$1) === 'h') {
                var A$1 = atan2$1(dy / cnt[i$1], dx / cnt[i$1]) / PI$1 * 180;
                while (A$1 < 0) { A$1 += 360; }
                while (A$1 >= 360) { A$1 -= 360; }
                xyz[i$1] = A$1;
            } else {
                xyz[i$1] = xyz[i$1]/cnt[i$1];
            }
        }
        alpha /= l;
        return (new Color_1(xyz, mode)).alpha(alpha > 0.99999 ? 1 : alpha, true);
    };


    var _average_lrgb = function (colors, weights) {
        var l = colors.length;
        var xyz = [0,0,0,0];
        for (var i=0; i < colors.length; i++) {
            var col = colors[i];
            var f = weights[i] / l;
            var rgb = col._rgb;
            xyz[0] += pow$4(rgb[0],2) * f;
            xyz[1] += pow$4(rgb[1],2) * f;
            xyz[2] += pow$4(rgb[2],2) * f;
            xyz[3] += rgb[3] * f;
        }
        xyz[0] = sqrt$3(xyz[0]);
        xyz[1] = sqrt$3(xyz[1]);
        xyz[2] = sqrt$3(xyz[2]);
        if (xyz[3] > 0.9999999) { xyz[3] = 1; }
        return new Color_1(clip_rgb$2(xyz));
    };

    // minimal multi-purpose interface

    // @requires utils color analyze


    var type$j = utils.type;

    var pow$5 = Math.pow;

    var scale = function(colors) {

        // constructor
        var _mode = 'rgb';
        var _nacol = chroma_1('#ccc');
        var _spread = 0;
        // const _fixed = false;
        var _domain = [0, 1];
        var _pos = [];
        var _padding = [0,0];
        var _classes = false;
        var _colors = [];
        var _out = false;
        var _min = 0;
        var _max = 1;
        var _correctLightness = false;
        var _colorCache = {};
        var _useCache = true;
        var _gamma = 1;

        // private methods

        var setColors = function(colors) {
            colors = colors || ['#fff', '#000'];
            if (colors && type$j(colors) === 'string' && chroma_1.brewer &&
                chroma_1.brewer[colors.toLowerCase()]) {
                colors = chroma_1.brewer[colors.toLowerCase()];
            }
            if (type$j(colors) === 'array') {
                // handle single color
                if (colors.length === 1) {
                    colors = [colors[0], colors[0]];
                }
                // make a copy of the colors
                colors = colors.slice(0);
                // convert to chroma classes
                for (var c=0; c<colors.length; c++) {
                    colors[c] = chroma_1(colors[c]);
                }
                // auto-fill color position
                _pos.length = 0;
                for (var c$1=0; c$1<colors.length; c$1++) {
                    _pos.push(c$1/(colors.length-1));
                }
            }
            resetCache();
            return _colors = colors;
        };

        var getClass = function(value) {
            if (_classes != null) {
                var n = _classes.length-1;
                var i = 0;
                while (i < n && value >= _classes[i]) {
                    i++;
                }
                return i-1;
            }
            return 0;
        };

        var tMapLightness = function (t) { return t; };
        var tMapDomain = function (t) { return t; };

        // const classifyValue = function(value) {
        //     let val = value;
        //     if (_classes.length > 2) {
        //         const n = _classes.length-1;
        //         const i = getClass(value);
        //         const minc = _classes[0] + ((_classes[1]-_classes[0]) * (0 + (_spread * 0.5)));  // center of 1st class
        //         const maxc = _classes[n-1] + ((_classes[n]-_classes[n-1]) * (1 - (_spread * 0.5)));  // center of last class
        //         val = _min + ((((_classes[i] + ((_classes[i+1] - _classes[i]) * 0.5)) - minc) / (maxc-minc)) * (_max - _min));
        //     }
        //     return val;
        // };

        var getColor = function(val, bypassMap) {
            var col, t;
            if (bypassMap == null) { bypassMap = false; }
            if (isNaN(val) || (val === null)) { return _nacol; }
            if (!bypassMap) {
                if (_classes && (_classes.length > 2)) {
                    // find the class
                    var c = getClass(val);
                    t = c / (_classes.length-2);
                } else if (_max !== _min) {
                    // just interpolate between min/max
                    t = (val - _min) / (_max - _min);
                } else {
                    t = 1;
                }
            } else {
                t = val;
            }

            // domain map
            t = tMapDomain(t);

            if (!bypassMap) {
                t = tMapLightness(t);  // lightness correction
            }

            if (_gamma !== 1) { t = pow$5(t, _gamma); }

            t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));

            t = Math.min(1, Math.max(0, t));

            var k = Math.floor(t * 10000);

            if (_useCache && _colorCache[k]) {
                col = _colorCache[k];
            } else {
                if (type$j(_colors) === 'array') {
                    //for i in [0.._pos.length-1]
                    for (var i=0; i<_pos.length; i++) {
                        var p = _pos[i];
                        if (t <= p) {
                            col = _colors[i];
                            break;
                        }
                        if ((t >= p) && (i === (_pos.length-1))) {
                            col = _colors[i];
                            break;
                        }
                        if (t > p && t < _pos[i+1]) {
                            t = (t-p)/(_pos[i+1]-p);
                            col = chroma_1.interpolate(_colors[i], _colors[i+1], t, _mode);
                            break;
                        }
                    }
                } else if (type$j(_colors) === 'function') {
                    col = _colors(t);
                }
                if (_useCache) { _colorCache[k] = col; }
            }
            return col;
        };

        var resetCache = function () { return _colorCache = {}; };

        setColors(colors);

        // public interface

        var f = function(v) {
            var c = chroma_1(getColor(v));
            if (_out && c[_out]) { return c[_out](); } else { return c; }
        };

        f.classes = function(classes) {
            if (classes != null) {
                if (type$j(classes) === 'array') {
                    _classes = classes;
                    _domain = [classes[0], classes[classes.length-1]];
                } else {
                    var d = chroma_1.analyze(_domain);
                    if (classes === 0) {
                        _classes = [d.min, d.max];
                    } else {
                        _classes = chroma_1.limits(d, 'e', classes);
                    }
                }
                return f;
            }
            return _classes;
        };


        f.domain = function(domain) {
            if (!arguments.length) {
                return _domain;
            }
            _min = domain[0];
            _max = domain[domain.length-1];
            _pos = [];
            var k = _colors.length;
            if ((domain.length === k) && (_min !== _max)) {
                // update positions
                for (var i = 0, list = Array.from(domain); i < list.length; i += 1) {
                    var d = list[i];

                  _pos.push((d-_min) / (_max-_min));
                }
            } else {
                for (var c=0; c<k; c++) {
                    _pos.push(c/(k-1));
                }
                if (domain.length > 2) {
                    // set domain map
                    var tOut = domain.map(function (d,i) { return i/(domain.length-1); });
                    var tBreaks = domain.map(function (d) { return (d - _min) / (_max - _min); });
                    if (!tBreaks.every(function (val, i) { return tOut[i] === val; })) {
                        tMapDomain = function (t) {
                            if (t <= 0 || t >= 1) { return t; }
                            var i = 0;
                            while (t >= tBreaks[i+1]) { i++; }
                            var f = (t - tBreaks[i]) / (tBreaks[i+1] - tBreaks[i]);
                            var out = tOut[i] + f * (tOut[i+1] - tOut[i]);
                            return out;
                        };
                    }

                }
            }
            _domain = [_min, _max];
            return f;
        };

        f.mode = function(_m) {
            if (!arguments.length) {
                return _mode;
            }
            _mode = _m;
            resetCache();
            return f;
        };

        f.range = function(colors, _pos) {
            setColors(colors, _pos);
            return f;
        };

        f.out = function(_o) {
            _out = _o;
            return f;
        };

        f.spread = function(val) {
            if (!arguments.length) {
                return _spread;
            }
            _spread = val;
            return f;
        };

        f.correctLightness = function(v) {
            if (v == null) { v = true; }
            _correctLightness = v;
            resetCache();
            if (_correctLightness) {
                tMapLightness = function(t) {
                    var L0 = getColor(0, true).lab()[0];
                    var L1 = getColor(1, true).lab()[0];
                    var pol = L0 > L1;
                    var L_actual = getColor(t, true).lab()[0];
                    var L_ideal = L0 + ((L1 - L0) * t);
                    var L_diff = L_actual - L_ideal;
                    var t0 = 0;
                    var t1 = 1;
                    var max_iter = 20;
                    while ((Math.abs(L_diff) > 1e-2) && (max_iter-- > 0)) {
                        (function() {
                            if (pol) { L_diff *= -1; }
                            if (L_diff < 0) {
                                t0 = t;
                                t += (t1 - t) * 0.5;
                            } else {
                                t1 = t;
                                t += (t0 - t) * 0.5;
                            }
                            L_actual = getColor(t, true).lab()[0];
                            return L_diff = L_actual - L_ideal;
                        })();
                    }
                    return t;
                };
            } else {
                tMapLightness = function (t) { return t; };
            }
            return f;
        };

        f.padding = function(p) {
            if (p != null) {
                if (type$j(p) === 'number') {
                    p = [p,p];
                }
                _padding = p;
                return f;
            } else {
                return _padding;
            }
        };

        f.colors = function(numColors, out) {
            // If no arguments are given, return the original colors that were provided
            if (arguments.length < 2) { out = 'hex'; }
            var result = [];

            if (arguments.length === 0) {
                result = _colors.slice(0);

            } else if (numColors === 1) {
                result = [f(0.5)];

            } else if (numColors > 1) {
                var dm = _domain[0];
                var dd = _domain[1] - dm;
                result = __range__(0, numColors, false).map(function (i) { return f( dm + ((i/(numColors-1)) * dd) ); });

            } else { // returns all colors based on the defined classes
                colors = [];
                var samples = [];
                if (_classes && (_classes.length > 2)) {
                    for (var i = 1, end = _classes.length, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                        samples.push((_classes[i-1]+_classes[i])*0.5);
                    }
                } else {
                    samples = _domain;
                }
                result = samples.map(function (v) { return f(v); });
            }

            if (chroma_1[out]) {
                result = result.map(function (c) { return c[out](); });
            }
            return result;
        };

        f.cache = function(c) {
            if (c != null) {
                _useCache = c;
                return f;
            } else {
                return _useCache;
            }
        };

        f.gamma = function(g) {
            if (g != null) {
                _gamma = g;
                return f;
            } else {
                return _gamma;
            }
        };

        f.nodata = function(d) {
            if (d != null) {
                _nacol = chroma_1(d);
                return f;
            } else {
                return _nacol;
            }
        };

        return f;
    };

    function __range__(left, right, inclusive) {
      var range = [];
      var ascending = left < right;
      var end = !inclusive ? right : ascending ? right + 1 : right - 1;
      for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
      }
      return range;
    }

    //
    // interpolates between a set of colors uzing a bezier spline
    //

    // @requires utils lab




    var bezier = function(colors) {
        var assign, assign$1, assign$2;

        var I, lab0, lab1, lab2;
        colors = colors.map(function (c) { return new Color_1(c); });
        if (colors.length === 2) {
            // linear interpolation
            (assign = colors.map(function (c) { return c.lab(); }), lab0 = assign[0], lab1 = assign[1]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return lab0[i] + (t * (lab1[i] - lab0[i])); }));
                return new Color_1(lab, 'lab');
            };
        } else if (colors.length === 3) {
            // quadratic bezier interpolation
            (assign$1 = colors.map(function (c) { return c.lab(); }), lab0 = assign$1[0], lab1 = assign$1[1], lab2 = assign$1[2]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t) * lab0[i]) + (2 * (1-t) * t * lab1[i]) + (t * t * lab2[i]); }));
                return new Color_1(lab, 'lab');
            };
        } else if (colors.length === 4) {
            // cubic bezier interpolation
            var lab3;
            (assign$2 = colors.map(function (c) { return c.lab(); }), lab0 = assign$2[0], lab1 = assign$2[1], lab2 = assign$2[2], lab3 = assign$2[3]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t)*(1-t) * lab0[i]) + (3 * (1-t) * (1-t) * t * lab1[i]) + (3 * (1-t) * t * t * lab2[i]) + (t*t*t * lab3[i]); }));
                return new Color_1(lab, 'lab');
            };
        } else if (colors.length === 5) {
            var I0 = bezier(colors.slice(0, 3));
            var I1 = bezier(colors.slice(2, 5));
            I = function(t) {
                if (t < 0.5) {
                    return I0(t*2);
                } else {
                    return I1((t-0.5)*2);
                }
            };
        }
        return I;
    };

    var bezier_1 = function (colors) {
        var f = bezier(colors);
        f.scale = function () { return scale(f); };
        return f;
    };

    /*
     * interpolates between a set of colors uzing a bezier spline
     * blend mode formulas taken from http://www.venture-ware.com/kevin/coding/lets-learn-math-photoshop-blend-modes/
     */




    var blend = function (bottom, top, mode) {
        if (!blend[mode]) {
            throw new Error('unknown blend mode ' + mode);
        }
        return blend[mode](bottom, top);
    };

    var blend_f = function (f) { return function (bottom,top) {
            var c0 = chroma_1(top).rgb();
            var c1 = chroma_1(bottom).rgb();
            return chroma_1.rgb(f(c0, c1));
        }; };

    var each = function (f) { return function (c0, c1) {
            var out = [];
            out[0] = f(c0[0], c1[0]);
            out[1] = f(c0[1], c1[1]);
            out[2] = f(c0[2], c1[2]);
            return out;
        }; };

    var normal = function (a) { return a; };
    var multiply = function (a,b) { return a * b / 255; };
    var darken$1 = function (a,b) { return a > b ? b : a; };
    var lighten = function (a,b) { return a > b ? a : b; };
    var screen = function (a,b) { return 255 * (1 - (1-a/255) * (1-b/255)); };
    var overlay = function (a,b) { return b < 128 ? 2 * a * b / 255 : 255 * (1 - 2 * (1 - a / 255 ) * ( 1 - b / 255 )); };
    var burn = function (a,b) { return 255 * (1 - (1 - b / 255) / (a/255)); };
    var dodge = function (a,b) {
        if (a === 255) { return 255; }
        a = 255 * (b / 255) / (1 - a / 255);
        return a > 255 ? 255 : a
    };

    // # add = (a,b) ->
    // #     if (a + b > 255) then 255 else a + b

    blend.normal = blend_f(each(normal));
    blend.multiply = blend_f(each(multiply));
    blend.screen = blend_f(each(screen));
    blend.overlay = blend_f(each(overlay));
    blend.darken = blend_f(each(darken$1));
    blend.lighten = blend_f(each(lighten));
    blend.dodge = blend_f(each(dodge));
    blend.burn = blend_f(each(burn));
    // blend.add = blend_f(each(add));

    var blend_1 = blend;

    // cubehelix interpolation
    // based on D.A. Green "A colour scheme for the display of astronomical intensity images"
    // http://astron-soc.in/bulletin/11June/289392011.pdf

    var type$k = utils.type;
    var clip_rgb$3 = utils.clip_rgb;
    var TWOPI$2 = utils.TWOPI;
    var pow$6 = Math.pow;
    var sin$2 = Math.sin;
    var cos$3 = Math.cos;


    var cubehelix = function(start, rotations, hue, gamma, lightness) {
        if ( start === void 0 ) start=300;
        if ( rotations === void 0 ) rotations=-1.5;
        if ( hue === void 0 ) hue=1;
        if ( gamma === void 0 ) gamma=1;
        if ( lightness === void 0 ) lightness=[0,1];

        var dh = 0, dl;
        if (type$k(lightness) === 'array') {
            dl = lightness[1] - lightness[0];
        } else {
            dl = 0;
            lightness = [lightness, lightness];
        }

        var f = function(fract) {
            var a = TWOPI$2 * (((start+120)/360) + (rotations * fract));
            var l = pow$6(lightness[0] + (dl * fract), gamma);
            var h = dh !== 0 ? hue[0] + (fract * dh) : hue;
            var amp = (h * l * (1-l)) / 2;
            var cos_a = cos$3(a);
            var sin_a = sin$2(a);
            var r = l + (amp * ((-0.14861 * cos_a) + (1.78277* sin_a)));
            var g = l + (amp * ((-0.29227 * cos_a) - (0.90649* sin_a)));
            var b = l + (amp * (+1.97294 * cos_a));
            return chroma_1(clip_rgb$3([r*255,g*255,b*255,1]));
        };

        f.start = function(s) {
            if ((s == null)) { return start; }
            start = s;
            return f;
        };

        f.rotations = function(r) {
            if ((r == null)) { return rotations; }
            rotations = r;
            return f;
        };

        f.gamma = function(g) {
            if ((g == null)) { return gamma; }
            gamma = g;
            return f;
        };

        f.hue = function(h) {
            if ((h == null)) { return hue; }
            hue = h;
            if (type$k(hue) === 'array') {
                dh = hue[1] - hue[0];
                if (dh === 0) { hue = hue[1]; }
            } else {
                dh = 0;
            }
            return f;
        };

        f.lightness = function(h) {
            if ((h == null)) { return lightness; }
            if (type$k(h) === 'array') {
                lightness = h;
                dl = h[1] - h[0];
            } else {
                lightness = [h,h];
                dl = 0;
            }
            return f;
        };

        f.scale = function () { return chroma_1.scale(f); };

        f.hue(hue);

        return f;
    };

    var digits = '0123456789abcdef';

    var floor$2 = Math.floor;
    var random = Math.random;

    var random_1 = function () {
        var code = '#';
        for (var i=0; i<6; i++) {
            code += digits.charAt(floor$2(random() * 16));
        }
        return new Color_1(code, 'hex');
    };

    var log$1 = Math.log;
    var pow$7 = Math.pow;
    var floor$3 = Math.floor;
    var abs = Math.abs;


    var analyze = function (data, key) {
        if ( key === void 0 ) key=null;

        var r = {
            min: Number.MAX_VALUE,
            max: Number.MAX_VALUE*-1,
            sum: 0,
            values: [],
            count: 0
        };
        if (type(data) === 'object') {
            data = Object.values(data);
        }
        data.forEach(function (val) {
            if (key && type(val) === 'object') { val = val[key]; }
            if (val !== undefined && val !== null && !isNaN(val)) {
                r.values.push(val);
                r.sum += val;
                if (val < r.min) { r.min = val; }
                if (val > r.max) { r.max = val; }
                r.count += 1;
            }
        });

        r.domain = [r.min, r.max];

        r.limits = function (mode, num) { return limits(r, mode, num); };

        return r;
    };


    var limits = function (data, mode, num) {
        if ( mode === void 0 ) mode='equal';
        if ( num === void 0 ) num=7;

        if (type(data) == 'array') {
            data = analyze(data);
        }
        var min = data.min;
        var max = data.max;
        var values = data.values.sort(function (a,b) { return a-b; });

        if (num === 1) { return [min,max]; }

        var limits = [];

        if (mode.substr(0,1) === 'c') { // continuous
            limits.push(min);
            limits.push(max);
        }

        if (mode.substr(0,1) === 'e') { // equal interval
            limits.push(min);
            for (var i=1; i<num; i++) {
                limits.push(min+((i/num)*(max-min)));
            }
            limits.push(max);
        }

        else if (mode.substr(0,1) === 'l') { // log scale
            if (min <= 0) {
                throw new Error('Logarithmic scales are only possible for values > 0');
            }
            var min_log = Math.LOG10E * log$1(min);
            var max_log = Math.LOG10E * log$1(max);
            limits.push(min);
            for (var i$1=1; i$1<num; i$1++) {
                limits.push(pow$7(10, min_log + ((i$1/num) * (max_log - min_log))));
            }
            limits.push(max);
        }

        else if (mode.substr(0,1) === 'q') { // quantile scale
            limits.push(min);
            for (var i$2=1; i$2<num; i$2++) {
                var p = ((values.length-1) * i$2)/num;
                var pb = floor$3(p);
                if (pb === p) {
                    limits.push(values[pb]);
                } else { // p > pb
                    var pr = p - pb;
                    limits.push((values[pb]*(1-pr)) + (values[pb+1]*pr));
                }
            }
            limits.push(max);

        }

        else if (mode.substr(0,1) === 'k') { // k-means clustering
            /*
            implementation based on
            http://code.google.com/p/figue/source/browse/trunk/figue.js#336
            simplified for 1-d input values
            */
            var cluster;
            var n = values.length;
            var assignments = new Array(n);
            var clusterSizes = new Array(num);
            var repeat = true;
            var nb_iters = 0;
            var centroids = null;

            // get seed values
            centroids = [];
            centroids.push(min);
            for (var i$3=1; i$3<num; i$3++) {
                centroids.push(min + ((i$3/num) * (max-min)));
            }
            centroids.push(max);

            while (repeat) {
                // assignment step
                for (var j=0; j<num; j++) {
                    clusterSizes[j] = 0;
                }
                for (var i$4=0; i$4<n; i$4++) {
                    var value = values[i$4];
                    var mindist = Number.MAX_VALUE;
                    var best = (void 0);
                    for (var j$1=0; j$1<num; j$1++) {
                        var dist = abs(centroids[j$1]-value);
                        if (dist < mindist) {
                            mindist = dist;
                            best = j$1;
                        }
                        clusterSizes[best]++;
                        assignments[i$4] = best;
                    }
                }

                // update centroids step
                var newCentroids = new Array(num);
                for (var j$2=0; j$2<num; j$2++) {
                    newCentroids[j$2] = null;
                }
                for (var i$5=0; i$5<n; i$5++) {
                    cluster = assignments[i$5];
                    if (newCentroids[cluster] === null) {
                        newCentroids[cluster] = values[i$5];
                    } else {
                        newCentroids[cluster] += values[i$5];
                    }
                }
                for (var j$3=0; j$3<num; j$3++) {
                    newCentroids[j$3] *= 1/clusterSizes[j$3];
                }

                // check convergence
                repeat = false;
                for (var j$4=0; j$4<num; j$4++) {
                    if (newCentroids[j$4] !== centroids[j$4]) {
                        repeat = true;
                        break;
                    }
                }

                centroids = newCentroids;
                nb_iters++;

                if (nb_iters > 200) {
                    repeat = false;
                }
            }

            // finished k-means clustering
            // the next part is borrowed from gabrielflor.it
            var kClusters = {};
            for (var j$5=0; j$5<num; j$5++) {
                kClusters[j$5] = [];
            }
            for (var i$6=0; i$6<n; i$6++) {
                cluster = assignments[i$6];
                kClusters[cluster].push(values[i$6]);
            }
            var tmpKMeansBreaks = [];
            for (var j$6=0; j$6<num; j$6++) {
                tmpKMeansBreaks.push(kClusters[j$6][0]);
                tmpKMeansBreaks.push(kClusters[j$6][kClusters[j$6].length-1]);
            }
            tmpKMeansBreaks = tmpKMeansBreaks.sort(function (a,b){ return a-b; });
            limits.push(tmpKMeansBreaks[0]);
            for (var i$7=1; i$7 < tmpKMeansBreaks.length; i$7+= 2) {
                var v = tmpKMeansBreaks[i$7];
                if (!isNaN(v) && (limits.indexOf(v) === -1)) {
                    limits.push(v);
                }
            }
        }
        return limits;
    };

    var analyze_1 = {analyze: analyze, limits: limits};

    var contrast = function (a, b) {
        // WCAG contrast ratio
        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
        a = new Color_1(a);
        b = new Color_1(b);
        var l1 = a.luminance();
        var l2 = b.luminance();
        return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
    };

    var sqrt$4 = Math.sqrt;
    var atan2$2 = Math.atan2;
    var abs$1 = Math.abs;
    var cos$4 = Math.cos;
    var PI$2 = Math.PI;

    var deltaE = function(a, b, L, C) {
        if ( L === void 0 ) L=1;
        if ( C === void 0 ) C=1;

        // Delta E (CMC)
        // see http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CMC.html
        a = new Color_1(a);
        b = new Color_1(b);
        var ref = Array.from(a.lab());
        var L1 = ref[0];
        var a1 = ref[1];
        var b1 = ref[2];
        var ref$1 = Array.from(b.lab());
        var L2 = ref$1[0];
        var a2 = ref$1[1];
        var b2 = ref$1[2];
        var c1 = sqrt$4((a1 * a1) + (b1 * b1));
        var c2 = sqrt$4((a2 * a2) + (b2 * b2));
        var sl = L1 < 16.0 ? 0.511 : (0.040975 * L1) / (1.0 + (0.01765 * L1));
        var sc = ((0.0638 * c1) / (1.0 + (0.0131 * c1))) + 0.638;
        var h1 = c1 < 0.000001 ? 0.0 : (atan2$2(b1, a1) * 180.0) / PI$2;
        while (h1 < 0) { h1 += 360; }
        while (h1 >= 360) { h1 -= 360; }
        var t = (h1 >= 164.0) && (h1 <= 345.0) ? (0.56 + abs$1(0.2 * cos$4((PI$2 * (h1 + 168.0)) / 180.0))) : (0.36 + abs$1(0.4 * cos$4((PI$2 * (h1 + 35.0)) / 180.0)));
        var c4 = c1 * c1 * c1 * c1;
        var f = sqrt$4(c4 / (c4 + 1900.0));
        var sh = sc * (((f * t) + 1.0) - f);
        var delL = L1 - L2;
        var delC = c1 - c2;
        var delA = a1 - a2;
        var delB = b1 - b2;
        var dH2 = ((delA * delA) + (delB * delB)) - (delC * delC);
        var v1 = delL / (L * sl);
        var v2 = delC / (C * sc);
        var v3 = sh;
        return sqrt$4((v1 * v1) + (v2 * v2) + (dH2 / (v3 * v3)));
    };

    // simple Euclidean distance
    var distance = function(a, b, mode) {
        if ( mode === void 0 ) mode='lab';

        // Delta E (CIE 1976)
        // see http://www.brucelindbloom.com/index.html?Equations.html
        a = new Color_1(a);
        b = new Color_1(b);
        var l1 = a.get(mode);
        var l2 = b.get(mode);
        var sum_sq = 0;
        for (var i in l1) {
            var d = (l1[i] || 0) - (l2[i] || 0);
            sum_sq += d*d;
        }
        return Math.sqrt(sum_sq);
    };

    var valid = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        try {
            new (Function.prototype.bind.apply( Color_1, [ null ].concat( args) ));
            return true;
        } catch (e) {
            return false;
        }
    };

    // some pre-defined color scales:




    var scales = {
    	cool: function cool() { return scale([chroma_1.hsl(180,1,.9), chroma_1.hsl(250,.7,.4)]) },
    	hot: function hot() { return scale(['#000','#f00','#ff0','#fff'], [0,.25,.75,1]).mode('rgb') }
    };

    /**
        ColorBrewer colors for chroma.js

        Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The
        Pennsylvania State University.

        Licensed under the Apache License, Version 2.0 (the "License");
        you may not use this file except in compliance with the License.
        You may obtain a copy of the License at
        http://www.apache.org/licenses/LICENSE-2.0

        Unless required by applicable law or agreed to in writing, software distributed
        under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
        CONDITIONS OF ANY KIND, either express or implied. See the License for the
        specific language governing permissions and limitations under the License.
    */

    var colorbrewer = {
        // sequential
        OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
        PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
        BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
        Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
        BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
        YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
        YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
        Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
        RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
        Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
        YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
        Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
        GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
        Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
        YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
        PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
        Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
        PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
        Viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],

        // diverging

        Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
        RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
        RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
        PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
        PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
        RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
        BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
        RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
        PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],

        // qualitative

        Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
        Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
        Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
        Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
        Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
        Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
        Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
        Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'],
    };

    // add lowercase aliases for case-insensitive matches
    for (var i$1 = 0, list$1 = Object.keys(colorbrewer); i$1 < list$1.length; i$1 += 1) {
        var key = list$1[i$1];

        colorbrewer[key.toLowerCase()] = colorbrewer[key];
    }

    var colorbrewer_1 = colorbrewer;

    // feel free to comment out anything to rollup
    // a smaller chroma.js built

    // io --> convert colors















    // operators --> modify existing Colors










    // interpolators










    // generators -- > create new colors
    chroma_1.average = average;
    chroma_1.bezier = bezier_1;
    chroma_1.blend = blend_1;
    chroma_1.cubehelix = cubehelix;
    chroma_1.mix = chroma_1.interpolate = mix;
    chroma_1.random = random_1;
    chroma_1.scale = scale;

    // other utility methods
    chroma_1.analyze = analyze_1.analyze;
    chroma_1.contrast = contrast;
    chroma_1.deltaE = deltaE;
    chroma_1.distance = distance;
    chroma_1.limits = analyze_1.limits;
    chroma_1.valid = valid;

    // scale
    chroma_1.scales = scales;

    // colors
    chroma_1.colors = w3cx11_1;
    chroma_1.brewer = colorbrewer_1;

    var chroma_js = chroma_1;

    return chroma_js;

})));

},{}],"data/china-proj.topo.json":[function(require,module,exports) {
module.exports = {
  "type": "Topology",
  "arcs": [[[23619, 29550], [-40, -11]], [[23579, 29539], [-24, 45], [-69, 1], [-42, 29]], [[23444, 29614], [-41, 61], [-65, 19], [-55, -5], [-92, 67], [-32, -14], [-83, 21]], [[23076, 29763], [1, 148], [8, 58], [70, 9], [57, 69], [61, 9], [35, 47]], [[23308, 30103], [41, -80], [68, -52], [90, -31], [0, -38], [44, -26], [37, 35], [31, -51], [56, -42]], [[23675, 29818], [2, -4]], [[23677, 29814], [-39, -61], [-11, -91], [16, -36], [-41, -58], [17, -18]], [[19165, 21451], [54, -37], [62, -142], [45, -36], [60, 59], [123, -116], [27, -42], [41, -197]], [[19577, 20940], [-24, -7], [-1, -90], [15, -55], [-51, -15], [-1, -59], [57, -75], [-16, -31], [76, -43]], [[19632, 20565], [-41, -59], [-73, -33], [-40, -112], [-46, 15], [-69, 94], [-74, 33], [-45, -8], [-13, -39], [42, -23], [-17, -62], [-48, -59], [-121, 95], [-92, 10], [-28, 25], [-17, 67], [32, 17], [3, 45], [-53, 19], [-11, 35], [26, 43], [-77, 52], [-71, 15], [-49, -22], [-35, 37]], [[18715, 20750], [20, 100]], [[18735, 20850], [-5, 39], [-51, 95], [32, 52], [-46, 39], [28, 83], [-21, 108], [25, 98], [57, 18], [47, -82], [6, -41], [110, 0], [52, 75], [-71, 111], [2, 100], [13, 38], [52, -9], [37, 19], [34, -30], [7, -73], [40, -11], [53, -43], [29, 15]], [[28365, 20645], [20, -78], [30, -39], [61, -17], [19, -38], [-54, -86], [-18, -66], [-5, -112], [61, -19], [46, -36]], [[28525, 20154], [-27, -25], [17, -90], [50, -59], [27, -2], [57, -101], [-4, -45], [-117, -64]], [[28528, 19768], [-49, -9], [-50, 15], [-18, 40], [-9, 92], [-57, 18], [-140, 111], [-38, -34], [-52, 9]], [[28115, 20010], [-55, 58], [-67, 41], [-81, -13], [-121, -78], [-123, 21]], [[27668, 20039], [-24, 30], [4, 59], [-69, 78], [-55, 35], [-35, -25], [-68, -2], [14, 111], [-18, 20], [-104, -42], [-18, 15]], [[27295, 20318], [7, 44], [-60, 14], [1, 74], [-90, 41], [-23, -22], [-67, 21], [-49, 43], [-122, 19], [-47, -34], [-35, 24], [2, 91], [-134, 37], [-15, 45], [-57, 51], [-4, 43]], [[26602, 20809], [24, 86], [70, 31], [19, 57], [53, -1], [4, 50]], [[26772, 21032], [41, -54], [43, 49], [71, 51], [129, -67], [78, 62], [62, -6], [100, -65], [24, -47], [-3, -52], [45, -124], [31, -8], [71, -58], [120, -33], [55, 14], [67, 54]], [[27706, 20748], [209, 73], [43, -14], [46, -104], [36, -41], [146, -87], [91, -20], [30, 63], [58, 27]], [[25823, 26213], [-64, -44], [-14, -50], [-31, -19], [24, -79], [-10, -32], [27, -55], [-28, -19], [-83, 53], [-61, -10], [-37, 18], [-48, -12], [-24, -34], [-73, -4], [-72, 12], [-78, -15], [-24, -25], [-77, -19], [24, -50], [-152, -27]], [[25022, 25802], [14, 87], [-6, 100], [43, 48], [-44, 57], [7, 40], [-57, 89], [-68, 73], [-75, 1], [-5, 40]], [[24831, 26337], [44, 54], [63, 33], [43, -8], [49, 55], [53, 6], [14, 72], [75, -49], [63, -63], [58, 52]], [[25293, 26489], [39, -76], [55, -54], [31, 40], [38, 6], [43, -57], [24, 34], [-11, 39], [34, 61], [57, 42], [64, 22]], [[25667, 26546], [55, -37], [48, -110], [50, -2], [23, -73], [47, 43], [41, -26], [-39, -76]], [[25892, 26265], [-58, 15], [-11, -67]], [[9624, 7186], [-99, 13], [7, 94], [-20, 55], [39, 89], [-27, 115]], [[9524, 7552], [41, 11], [27, -112], [64, 22], [30, -99], [-4, -52], [-47, -64], [-11, -72]], [[23756, 29474], [-44, 0], [-79, 84], [-14, -8]], [[23677, 29814], [31, -24], [73, -6], [-11, -37], [44, -30], [30, 48], [70, -133]], [[23914, 29632], [-25, -77], [-68, 17], [-37, -27], [-28, -71]], [[28295, 17013], [-9, -100], [-61, -31], [-61, -7], [-53, 22], [-25, -54], [13, -51], [-52, -47], [-23, -70], [-49, -36]], [[27975, 16639], [-107, 46], [-48, 33], [-63, -56], [-21, -71], [-52, -36], [10, -33], [-35, -43], [-71, 9], [-33, -48], [-52, -5], [-55, 19]], [[27448, 16454], [-38, 47], [-16, 105], [53, 10], [-13, 120], [9, 59], [31, 63]], [[27474, 16858], [35, 63], [25, -6], [93, 41], [39, 40], [28, 83], [-10, 38], [-47, -1], [3, 90], [29, 51], [66, 1], [58, 25], [12, 48], [64, 3], [43, 71], [68, 22], [68, -34]], [[28048, 17393], [-23, -40], [5, -55], [170, 36], [80, 0]], [[28280, 17334], [9, -49], [-9, -120], [38, -33], [4, -56], [-27, -63]], [[26177, 19694], [-73, -20], [-112, 8], [-52, -17], [-19, -31], [-67, -34], [-46, 6]], [[25808, 19606], [31, 55], [-20, 68], [40, 125], [24, 35]], [[25883, 19889], [46, 34], [155, -21], [41, -34], [72, 38], [45, 59], [127, -36], [54, -29], [23, -37]], [[26446, 19863], [-68, -158], [-27, -22]], [[26351, 19683], [-104, -69], [-19, 50], [-51, 30]], [[34665, 4206], [-12, -47], [-46, -41], [9, -188], [-27, -56], [-89, -27], [-52, -63], [-43, -78], [57, -30], [-27, -26], [-19, -63], [29, -50], [-22, -64], [47, -54], [65, 55], [95, 49], [61, -36], [11, -105], [40, -8], [39, -37], [58, 19], [70, -27], [50, -50]], [[34959, 3279], [-41, -62], [-9, -60], [-51, 33], [-37, -67], [-46, -11], [6, -150], [27, -55], [-45, -19], [-54, 32], [-40, -31], [-117, 59], [-19, -22], [-189, -76], [-15, -46], [-49, -14], [-12, -41], [-56, -7], [-11, -42], [-53, -21], [-66, 10], [-31, -76], [-85, -11], [-1, 65], [-42, -2]], [[33923, 2665], [-41, 9], [-16, 73], [62, 77], [11, 61], [24, 21], [106, 2], [4, 34], [61, 35], [3, 59], [-28, 51], [-90, 32], [-4, 35], [-46, 16], [51, 43], [-11, 43], [-49, 19], [-32, 39], [-4, 99], [-22, 65], [10, 81], [-50, 27], [-65, -108], [-40, 2], [-117, 64], [-26, 65], [-11, 120], [-41, 3], [-56, 72]], [[33506, 3804], [26, 19], [13, 78], [38, -4], [68, 25], [-15, 118], [35, 126], [-10, 52], [34, 14], [49, 60], [67, 11], [53, 83], [-16, 53], [-76, 66], [-31, 55], [-70, 39], [-85, -1], [-80, 42], [-31, 44], [-64, 31], [139, 76], [99, 91], [55, 35], [54, 55], [81, 3]], [[33839, 4975], [87, -8], [38, -57], [66, 25], [67, -11], [22, 47], [86, 4], [21, -36], [84, 16], [23, -63], [69, 3], [13, -71], [52, -43], [64, 31], [39, -22]], [[34570, 4790], [30, -83], [58, -20], [-15, -65], [-54, -10], [-71, -106], [10, -45], [59, -26], [35, -118], [-8, -67], [51, -44]], [[5248, 6173], [-13, 23], [21, 62], [45, 27], [37, 71], [-59, 126], [2, 146], [-38, 145], [19, 36], [-12, 67], [20, 72], [-8, 69], [74, 314], [-23, 55], [-42, 41], [53, 31], [-15, 32], [4, 72], [-24, 28], [-68, -17], [-70, 24], [-98, 19], [-21, 44], [48, 53], [59, 34], [-128, 47], [-81, -19], [-52, 91], [-55, 63], [34, 114], [-34, 19], [-9, 92], [28, 39]], [[4842, 8193], [92, 32], [68, -32], [140, 29], [29, 23], [114, -8], [20, 84], [69, 19], [31, -48], [94, 28], [23, -12], [76, 16], [49, -9], [81, 20], [95, 7], [80, -19], [49, 15], [51, -10], [63, -33], [38, 20], [47, -8], [9, -33], [109, 23], [47, -4], [15, -30]], [[6331, 8263], [-1, -103], [-60, -108], [40, -42], [79, 21], [14, -39], [79, 17], [74, -34], [145, 23], [104, -16], [249, -1], [47, -34], [84, 35], [35, -19], [59, 30], [149, -10], [163, 45], [65, -5], [-29, -76], [-4, -61], [41, 4], [48, -48], [-28, -32], [106, -7], [55, 50], [41, -51]], [[7886, 7802], [-18, -76], [-36, -2], [-22, -64], [-28, 6], [-79, -54], [29, -39], [-45, -28], [-144, 0], [-36, -61], [-35, -1], [-78, -95], [-197, -123], [-43, 5], [-16, -37], [-50, -7], [-9, -31]], [[7079, 7195], [-30, 21], [-64, -9], [-48, -73], [-69, -25], [-97, -8], [-31, 16], [-69, -39], [-54, 1], [-8, -35], [-126, -81], [-42, -79], [-112, -20], [-39, -31], [-101, -30], [-97, -55], [-23, -46], [-104, -55], [-169, -57], [-115, -82], [-71, -39], [-115, -88], [24, -23], [-20, -53], [-90, -27], [-45, -32], [-68, -78], [-48, 5]], [[8119, 6784], [-32, -43], [-61, -28], [-32, 12], [18, 96]], [[8012, 6821], [8, 43], [-27, 57], [-6, 57], [-64, 76]], [[7923, 7054], [117, 26], [75, 47]], [[8115, 7127], [29, 4], [51, -101], [26, -8], [7, -82], [-12, -39], [-112, -8], [34, -80], [-19, -29]], [[26222, 25605], [-48, -23], [1, -47], [-61, -2]], [[26114, 25533], [20, 32], [-36, 51], [64, 97], [-66, 148], [49, 117], [-70, 36], [-6, 44], [-37, 35], [-87, 35], [-76, 73], [-46, 12]], [[25892, 26265], [89, -8], [58, -19], [42, 21], [62, -33], [-1, -57], [45, -42], [39, -12], [49, 40], [56, -3], [27, 71], [62, 36]], [[26420, 26259], [56, -71], [50, 4], [42, -37]], [[26568, 26155], [-47, -42], [-56, -117], [0, -62], [-34, -43], [-15, -87], [-21, -54], [-42, -31], [-40, 24], [-71, -54], [-20, -84]], [[37194, 3516], [82, -26], [36, -35], [-5, -33], [43, -81], [-8, -21], [35, -79], [-15, -35], [-66, -30], [-30, -60], [-31, 1], [-48, -49], [-13, -38], [30, -63], [6, -60], [-16, -67], [87, -84], [78, -49], [36, -40], [-53, -14], [-64, 6], [-23, 60], [-31, 25], [-48, -25], [-149, 32], [-49, 48], [-90, 12], [-16, 39], [-59, 12], [-14, 29], [-140, 85], [-4, 52], [-63, 10], [-14, 68], [-92, 17], [-28, 23], [-63, -9], [-90, 37], [-14, 68], [-57, 39], [-23, 59], [-64, -5], [-30, 25], [25, 55], [-28, 63], [13, 42], [-39, 29]], [[36088, 3549], [-27, 44], [15, 34], [-10, 54], [-53, 116], [-84, 51], [-35, 41], [-3, 87], [-123, 10], [-27, 32], [-81, 28], [-69, -7], [-75, 86], [-90, -19], [-41, 35], [-95, -11], [-10, -66], [-97, 43], [-77, -33], [-64, 39], [97, 71], [-27, 51], [-42, 34], [-35, -15], [-47, 25], [-10, 61], [-90, -6], [-48, -29], [-21, -49], [-120, -18], [-34, -32]], [[34570, 4790], [54, 2], [37, 31], [73, 7], [74, -96], [92, 65], [61, 4], [-29, -54], [34, -16], [1, 81], [20, 44], [-22, 44], [-79, 13], [19, 37], [90, 74], [98, 67]], [[35093, 5093], [99, 7], [69, 22], [56, 36], [74, 18], [-4, -46], [95, -42], [96, -17], [22, -72], [-28, -62], [6, -62], [39, -11], [10, -51], [29, -20]], [[35656, 4793], [-28, -23], [-109, -1], [-71, -70], [-33, -56], [-74, 11], [-68, -18], [5, -45], [-45, -44], [-27, -61], [43, -19], [49, -56], [-7, -32], [96, -68], [35, 23], [69, -25], [175, -129], [-2, 40], [28, 101], [191, -38], [-26, -53], [42, -28], [81, -16], [87, 3], [37, 109], [50, -8], [98, -39], [55, 21], [88, -48], [38, 22], [65, -6], [56, -68], [10, -32], [62, -49], [-6, -45], [21, -51], [-17, -78], [15, -86], [-20, -66], [37, -37], [-2, -59], [26, -47], [80, -2], [7, -71], [29, -23], [83, -22], [160, -6], [39, -54], [68, 91], [48, -19]], [[23675, 29818], [16, 40], [91, 32], [-1, 94], [13, 20], [94, -1], [48, -88], [42, -16]], [[23978, 29899], [42, -6], [9, -46], [-35, -16], [25, -72], [-56, -36], [-2, -72]], [[23961, 29651], [-47, -19]], [[27149, 12830], [1, -72], [61, -78], [78, -17], [9, -32], [-21, -146], [65, -114], [53, -58], [24, 16]], [[27419, 12329], [77, -39], [-19, -33], [11, -83], [-69, -35], [-26, -55], [-5, -114], [-50, -1], [2, -65], [31, -60], [35, -14]], [[27406, 11830], [-21, -51], [-47, 13], [-140, 0], [-61, 67], [-48, 4], [-60, -74], [-62, 19], [-57, -59], [2, -194], [-66, -38]], [[26846, 11517], [-75, 179], [-68, 69], [-45, -23], [-44, 7], [-90, 62], [-16, 41], [-88, -18], [-48, 47], [-57, 11]], [[26315, 11892], [-9, 64], [-30, 69], [7, 49], [-29, 38], [16, 110], [-36, 4], [-16, 83], [-145, 34], [-58, -61], [-49, 27]], [[25966, 12309], [-22, 31], [-92, 69], [4, 85], [51, 40], [-6, 67]], [[25901, 12601], [71, 44], [103, 27], [145, -55], [43, 17], [53, -18], [54, 44], [68, 101], [35, 31], [82, -21], [82, 84], [36, 88], [27, 17], [64, -11], [148, -1]], [[26912, 12948], [29, -63], [84, -19], [86, -5], [38, -31]], [[16422, 24399], [39, -15], [-17, -48], [-31, -12], [-42, -69], [-46, 36], [-28, 55], [-54, -1], [-45, 27], [-108, -73], [-29, 10], [-83, -100], [-74, -119], [40, -33], [14, -42], [-69, -79], [-100, 55], [-33, -52], [-54, -25], [10, -58], [-91, -9]], [[15621, 23847], [-19, 67], [-75, -5], [6, -108], [-35, -108], [-3, -42]], [[15495, 23651], [-56, 48], [-51, -43], [-52, 27], [-35, 104], [-35, 18], [-3, 44], [-82, 46], [-33, -50], [-52, -19], [-10, 63], [-37, 25], [16, 43], [-11, 62], [-42, 47]], [[15012, 24066], [24, 47], [49, 35], [-23, 60], [11, 31], [60, 54], [-35, 51], [5, 75], [63, -20], [8, 40], [93, 26], [43, -12], [25, 63], [-71, 38], [-24, 123], [59, 76], [75, -24], [35, 17], [22, 56], [-16, 46], [26, 74], [-22, 62], [17, 64], [-29, 18], [12, 55]], [[15419, 25121], [128, -17]], [[15547, 25104], [25, -25], [142, -39], [91, -81], [48, -89], [44, 23], [26, 94], [-7, 61], [42, 14], [46, -28], [17, -46], [68, -30], [17, -51], [68, -76], [-17, -29], [15, -68], [102, -90], [-30, -41], [46, -45], [28, -53], [-16, -27], [46, -44], [74, -35]], [[27455, 18720], [-9, -75], [29, -30], [34, -104], [130, -127], [60, -13], [81, 3], [18, -127], [4, -131], [-10, -78], [-24, -54], [-41, -217], [-21, -21], [47, -48]], [[27753, 17698], [-27, -4], [-40, 67], [-57, 27], [-73, 68], [-57, -11], [-55, -70], [-50, -30], [-138, -16], [-19, -13]], [[27237, 17716], [-23, 14], [-89, -41], [-83, 3], [-17, 33], [-64, 14], [9, 71], [-154, 26], [8, 68], [53, 28], [-62, 94], [-122, 4], [-25, -59], [-37, 2], [-34, -55], [-59, -20], [-58, 12], [-11, -55], [-73, 19], [-42, -85], [-68, 11]], [[26286, 17800], [-33, 48], [4, 66], [-25, 49]], [[26232, 17963], [31, 36], [-8, 98], [35, 58], [-32, 89], [47, 36], [-22, 42], [45, 18], [16, 75], [58, -6], [31, 17], [0, 51], [46, 17], [69, -36]], [[26548, 18458], [10, -33], [71, 7], [45, 61], [106, 12], [99, -37], [-7, 165]], [[26872, 18633], [60, -15], [40, 43], [41, -5], [27, 38], [105, -7], [55, -48], [65, -9], [1, -57], [78, 28], [-7, 97], [68, 45], [50, -23]], [[23701, 28704], [-62, 20], [-118, -9], [-59, 66], [-30, 59], [-1, 56], [-84, 97], [-107, 66]], [[23240, 29059], [75, 58], [16, 44], [35, -2]], [[23366, 29159], [5, -52], [72, 17], [28, 54], [32, 9], [77, -15], [54, 34], [92, 8], [35, 25], [76, 88], [43, 18]], [[23880, 29345], [14, -36], [-10, -107], [-46, -41], [74, -10]], [[23912, 29151], [16, -145]], [[23928, 29006], [-72, -7], [-9, -26], [-60, -10], [1, -68], [-28, -113], [-50, -13], [-9, -65]], [[3213, 9789], [-22, -50], [-144, -34], [-28, -30], [37, -84], [36, -54], [52, -36], [13, -46], [150, -55], [104, -20], [42, -39], [43, -70], [-8, -61], [125, -19], [82, -43], [27, -80], [-40, -26], [-31, -160], [-152, -208]], [[3499, 8674], [-144, -20], [-43, 107], [-83, 25], [-61, -11], [-87, 38], [-11, 40], [-111, 24], [-106, -12], [-34, -45], [-89, 10], [-66, -25], [-41, -53], [-77, -14], [-151, 54], [-67, 125], [-38, 8], [-25, 117], [-26, 2], [-72, 68], [-7, 38], [-104, 49], [-44, -18], [-22, -50], [-71, 33], [-64, -31], [-55, -1], [-49, 27], [-125, -7], [-34, -59], [63, -77], [-42, -38], [15, -95], [-22, -40], [-87, 27], [-148, 64], [-26, 25], [-58, -28], [-34, 13], [-61, -29], [-76, -78], [-49, 59], [46, 96], [-66, -30], [-59, 0], [-40, 42], [-41, -17], [-57, 47], [-139, 62], [-46, -47], [-142, -8], [-49, 32], [-31, 54], [-40, 31], [-15, 47], [-42, 13], [-27, 66], [40, 16], [0, 125], [-72, 58], [-6, 24], [-96, -8], [-51, -24], [-48, 41], [-70, 4], [13, 47], [-29, 37], [64, 47], [12, 85], [24, 43], [-2, 71], [45, -1], [10, 39], [-22, 60], [-48, -28], [-37, 29], [-5, 242], [61, 81], [75, 17], [78, -82], [56, 24], [119, 25], [66, 39], [17, 37], [43, 9], [42, 70], [47, 10], [40, 65], [-12, 60], [-35, 28], [-19, 63]], [[619, 10637], [71, 21], [25, 34], [80, -7], [17, 54], [72, 28], [46, 111], [-1, 88], [-23, 46], [102, 34], [61, 55], [95, -27], [44, 16], [-2, 45], [-85, 101], [-10, 69], [104, -43], [57, 15], [125, -35], [25, 74], [22, 6], [34, -64], [55, -34], [43, 32], [20, -65], [73, -95], [12, -52], [61, -67], [43, -173], [-78, -79], [-41, 1], [27, -87], [-65, -44], [-98, -10], [11, -32], [-89, -119], [-22, -103], [-70, -89], [113, -36], [8, 27], [83, 14], [50, -26], [-29, -107], [65, -8], [-74, -71], [-71, -10], [-124, 63], [4, 59], [-23, 65], [-72, 15], [-59, -31], [42, -100], [72, -68], [-88, -47], [-44, 44], [-79, 7], [13, -168], [32, -97], [44, -20], [15, -108], [67, -31], [30, 22], [95, 27], [27, 61], [90, 32], [82, 1], [156, 24], [59, 49], [159, 32], [136, -88], [57, -27], [25, -32], [120, 16], [14, -10], [119, 38], [178, 17], [31, -37], [99, 8], [69, -15], [186, 57], [98, -7], [78, 13]], [[8119, 6784], [14, -61], [38, -78], [70, -24], [13, -34], [48, 5], [19, -104], [-22, -48], [47, -99], [-2, -33], [38, -32], [69, -5], [94, -77], [102, -177], [206, -124], [22, -42], [46, -17], [-7, -45], [-44, -61], [-212, -45], [-169, 55], [-21, 31], [17, 45], [-91, 144], [-93, 60], [-51, -4], [-60, 47], [-63, 9], [-49, 67], [-16, 46], [-85, 96], [-50, 26], [35, 114], [-8, 73], [-30, 110], [-26, 129], [58, 90], [56, 0]], [[7923, 7054], [-10, 109], [-45, 92], [68, -37], [43, 10], [41, -76], [95, -25]], [[28761, 18504], [-44, -38], [-100, 24], [-118, 13], [-34, 19], [-48, -39], [-18, -164], [-51, -41], [7, -54], [95, -80], [113, -49], [11, -28], [-58, -93], [44, -67], [-19, -134], [-101, 7], [-35, -127]], [[28405, 17653], [-43, -34], [-22, -44], [-97, 85]], [[28243, 17660], [-52, 20], [-23, 69], [-76, 23], [-58, -59], [-104, 78], [-35, -23], [-26, -57], [-52, -38], [-45, -4], [-19, 29]], [[27455, 18720], [12, 51], [40, -5], [29, 67], [28, -5], [21, 59], [36, 39], [48, -60], [39, 6], [40, 53], [92, 15], [117, 67]], [[27957, 19007], [32, -72], [39, -8], [43, 30], [93, -108], [75, 34], [62, -52], [11, 56], [64, 39], [100, -17], [35, -54], [62, -36], [20, -78], [36, -11]], [[28629, 18730], [21, -32], [-1, -68], [23, -72], [33, -53], [56, -1]], [[19903, 24210], [33, 17], [114, -16], [11, -67], [44, -67], [-2, -38], [-39, -62], [41, -59], [-27, -36], [-4, -54], [53, -55], [-8, -60], [51, -161], [39, -39], [27, 14], [72, -13], [2, 93], [49, 67]], [[20359, 23674], [11, -25], [131, 1], [110, -67], [30, -40], [62, -33], [-44, -27], [-77, -19], [-34, 6], [-31, -36], [47, -79]], [[20564, 23355], [-23, -53], [-113, -47], [-23, -41], [-68, -3], [-9, -37], [-54, -3], [-22, -34], [-45, -129], [7, -23], [-42, -106], [-95, 63], [-27, -38], [-60, 80], [4, 64], [-22, 74], [-32, 29], [-14, 72], [-71, -25]], [[19855, 23198], [48, 56], [33, 92], [-68, 45], [-37, 55], [-17, 73], [5, 57], [-44, 50], [-20, 146], [-98, 188], [18, 42], [68, 19], [6, 47], [36, 22], [53, -9], [-11, 87], [76, 42]], [[19906, 22932], [-30, 53], [20, 57], [32, -20], [24, -54], [-46, -36]], [[19835, 15139], [41, -62], [9, -60], [-48, -126], [2, -100], [-71, 38], [-51, 5], [-128, 37], [-48, -69], [-24, -71], [4, -62], [-41, -23], [-36, -56], [37, -72], [-115, -67], [6, 33], [-60, 4], [-72, -64]], [[19240, 14424], [-85, -10], [-39, 27], [-68, -95], [-56, 7], [-101, -16], [-111, 28], [-3, 46], [-69, 86], [-51, -8]], [[18657, 14489], [-82, 43], [18, 54], [77, 58], [13, 98], [48, 119], [35, 2], [116, 107]], [[18882, 14970], [17, -2], [162, 76], [55, 45], [43, -33], [49, 18], [40, 66], [9, 69]], [[19257, 15209], [50, 9], [74, 58], [16, 46], [89, 56], [104, 100], [23, -26], [35, 60], [57, -19], [5, -84], [48, -62], [36, -169], [41, -39]], [[19233, 14309], [-29, 11], [-81, -29], [-72, 23], [34, 64], [34, -22], [48, 2], [76, 55]], [[19243, 14413], [-32, -59], [22, -45]], [[30651, 7449], [9, -41], [-23, -131], [-31, 1], [-36, -64], [-37, -8], [-32, -79], [22, -37], [-9, -49], [-34, -21], [-44, -69], [18, -15], [-14, -74], [19, -51], [-16, -59], [15, -38], [56, -30], [-10, -53], [-57, -5], [-9, -123], [-105, -38], [-29, -52], [13, -43], [-46, -68], [-49, 3], [-59, 33], [-77, -40], [59, -44], [24, -75], [-18, -116], [144, 35], [40, 55], [69, 14], [44, 42], [49, -93], [44, -4], [39, 26], [13, 55], [30, 20], [110, 36], [30, -70], [-31, -47], [23, -89], [-29, -104], [143, -45], [35, -30], [-10, -37], [33, -64]], [[30927, 5763], [-121, -122], [-28, -123], [98, -49], [49, -42], [61, -28], [127, -30], [11, -33], [-23, -89], [-77, 15], [6, -98], [-62, 12], [-20, 72], [-72, 25], [-28, 92], [-92, 27], [-69, -55], [-21, -109], [-55, 15], [-23, -30], [33, -66], [-87, -11], [-104, -62], [-36, -52], [-74, -66]], [[30320, 4956], [-94, 97], [-99, 73], [-16, -33], [-74, -27], [-80, 6], [-46, 17], [-16, 62], [-63, -8], [-142, 89], [-107, -12], [-72, 52], [-55, -37], [-29, 7], [-60, -50], [-66, -10], [-11, -39], [46, -45], [8, -41], [-52, -33], [-78, -76], [-191, -42], [-62, 30], [-49, 42], [-68, -4], [-66, 116], [-60, 30], [-18, 42], [-75, 33]], [[28625, 5195], [48, 20], [104, 72], [68, 103], [-5, 29], [84, 119], [29, 62], [-4, 98]], [[28949, 5698], [41, 35], [100, 42], [-11, 54], [-68, 63], [-18, 81], [-27, 44], [13, 81], [27, 31], [-36, 77], [41, 48], [73, 29], [-10, 55], [21, 48], [-58, 66], [-20, 74]], [[29017, 6526], [95, 28], [114, -8], [214, 78], [43, 38], [3, 41], [88, 50], [34, 42], [63, -11], [95, 40], [-9, 44], [61, 91], [101, 20], [61, 35], [70, 14], [8, 54], [35, 39], [39, 8], [17, 43], [44, 11], [64, 87], [81, 79], [82, 24], [82, 66], [85, 23], [64, -13]], [[20473, 20830], [16, -44], [-44, -62], [-50, -23], [-18, -63], [17, -39], [78, -76]], [[20472, 20523], [-22, -51], [8, -35], [-61, -29], [-47, 23], [-37, -45], [-50, 16], [-35, -30], [12, -37], [-37, -46], [-53, -28], [-41, 64], [-67, 38], [-34, -10], [-52, -60], [-73, 16], [-23, -49], [-71, -33]], [[19789, 20227], [-4, 71], [30, 47], [-43, 133], [-33, -8], [-55, 33], [-38, 65]], [[19646, 20568], [46, 42], [112, -14], [27, 69], [4, 83], [79, -6], [50, 60], [34, -14], [-1, -70], [64, -8], [83, 42], [57, 11], [17, 59], [42, 54], [57, 30], [40, 44]], [[20357, 20950], [39, -65], [77, -55]], [[18735, 23187], [-19, -99], [-46, -155], [-47, -62], [0, -77], [-16, -18], [32, -95], [-21, -109], [45, -118], [30, 30], [53, -33], [58, -5], [8, -38], [53, -93], [60, 2], [-12, -43], [127, -116], [43, -72], [-4, -57], [27, -35], [-30, -61], [-47, -17], [13, -58], [58, -45], [29, -52], [53, -30], [59, 52], [111, -85], [-9, -68], [-34, -93], [-23, -28]], [[19286, 21509], [-121, -58]], [[18735, 20850], [-45, -13], [-26, 68], [-50, 12], [-39, -27], [-9, 68], [-68, -5], [-28, -42], [-35, 17], [-48, 126], [-39, 74], [8, 28], [-41, 59], [-61, -6], [-60, -36], [-22, -60], [-44, -61]], [[18128, 21052], [-122, 108], [-14, 82], [26, 72], [-55, 44], [-22, 48], [-65, 17], [-56, 45], [1, 36], [-31, 96], [-37, 24], [-31, -21], [-40, 33], [-65, 12], [-7, -74], [-26, -86], [101, 30], [45, -13], [-13, -41], [-43, -50], [-29, 7], [-56, -51], [-45, 12], [-15, -36], [-104, 4], [5, -79], [-23, -31], [18, -88], [-33, -88], [-16, -108], [-22, -28], [-50, 15], [-34, 47], [-32, -44], [-96, 16], [26, 42], [-9, 54], [-69, -27], [-42, 3], [-37, 47], [-51, 1], [-8, 55], [36, 124], [-62, 30], [12, 112], [-34, 68], [-36, 24], [-23, 80], [-2, 52], [-30, 48], [3, 115], [25, 84], [-90, 6], [-23, 35], [-72, -37], [-76, -68]], [[16580, 21810], [92, 127], [9, 52], [61, 9], [-1, 114]], [[16741, 22112], [37, -14], [72, -92], [49, 35], [70, -22], [22, -50], [34, -4], [26, 55], [-12, 33], [49, 67], [9, 51], [34, 3], [-6, 58], [45, 43], [-11, 86], [38, -4], [50, 134], [34, 27], [-10, 57], [53, 9], [35, 38]], [[17359, 22622], [85, -25], [81, 19], [19, -31], [71, -16], [51, -79], [56, 16], [-12, 88], [45, 72], [68, 13], [102, -22], [79, 55], [27, -53], [54, -30], [15, 42], [43, 25], [-33, 223], [-20, 25], [15, 57], [-63, 94], [-33, -19], [-3, -54], [-43, 2], [-6, 62], [27, 59], [10, 64], [-23, 62], [-60, -23], [-8, 106], [-25, 67], [1, 45], [-50, 26], [-2, 66]], [[17827, 23558], [44, -16], [107, 15], [47, 19], [51, -67], [47, -31]], [[18123, 23478], [8, -25], [77, -23], [32, -44], [102, -27], [29, -27], [46, 25], [-23, 72], [55, 39], [49, -54], [68, -29], [27, -28], [80, 1], [17, -26], [-5, -94], [32, -3], [18, -48]], [[24018, 11433], [54, -44], [0, -25], [-60, -55], [-111, -58], [-8, -62], [-36, -11], [-9, -127], [-55, -36], [15, -95], [-61, 5], [-14, -56], [27, -54], [-24, -89], [-63, -107], [108, -85], [52, -3], [63, 54], [43, -26], [45, 32], [71, 14], [46, 33], [48, -52], [71, -20]], [[24220, 10566], [-26, -53], [32, -68], [-13, -70], [-48, -77], [-86, -27], [-90, -62], [-48, -76], [-18, -54], [-79, -126], [-58, -76], [-63, -251], [-109, -98], [-39, -57], [-97, -49]], [[23478, 9422], [-121, 59], [-18, 26], [-127, 12], [-133, 67], [-86, 78], [-94, 23]], [[22899, 9687], [37, 38], [49, 198], [-22, 66], [-49, 37], [-17, 89], [-53, 36], [5, 59], [98, 136], [11, 83], [47, 41], [97, 21], [23, 89], [-33, 41], [7, 67], [45, 69], [-13, 80], [52, 49], [37, -4], [13, 46], [45, 55], [-31, 23], [-46, 77], [-84, 28], [-91, -17], [-54, 45], [-10, 46], [34, 111]], [[22996, 11296], [85, -33], [82, 56], [135, -46], [53, 18], [52, -25], [34, 20], [61, -30], [130, 109], [56, 8], [42, 45], [164, 27], [59, 34], [50, -15], [19, -31]], [[27816, 11643], [-2, -125], [-72, -39], [-45, -54], [8, -60], [33, -20], [80, -9], [42, 12], [38, -36], [76, -30]], [[27974, 11282], [80, -48], [21, -73]], [[28075, 11161], [-64, -36], [-43, -73], [-31, -116], [56, -60], [71, -13], [-12, -86], [-79, 31], [-57, -23], [-154, 4], [-80, -97], [-96, -53], [-28, -49], [3, -55], [-40, -16], [-4, 66], [-100, 14], [20, 64], [-39, 3], [-35, -32]], [[27363, 10634], [-17, 33], [73, 66], [-14, 34], [-60, 13], [-44, -13], [-22, 66], [-52, 65], [2, 24], [-78, 38], [-50, -28], [-49, 31], [-52, 74], [62, 94], [64, 11], [41, 82], [-42, 27], [-13, 42], [-75, 52], [-59, 11], [-88, 61], [-31, 35], [-13, 65]], [[27406, 11830], [69, 49], [66, 1], [-29, -65], [40, -20], [26, -51], [48, -26], [61, 15], [74, -24]], [[27761, 11709], [55, -66]], [[23182, 27410], [93, -11], [45, 136], [19, 277], [10, 45], [63, 78], [51, -2], [7, -71], [-42, -73], [-50, -21], [-10, -201], [18, -27], [176, -7], [65, -16], [56, -78], [66, -14], [73, 59], [43, -5]], [[23865, 27479], [18, -16], [-8, -68], [-26, -51], [6, -92]], [[23855, 27252], [-54, 2], [-9, -80], [13, -31], [-7, -84], [-74, -11]], [[23724, 27048], [-111, 30], [-141, -19], [-14, 43], [-53, 21], [-70, -26], [-29, 31], [-69, 11], [-19, 60], [-64, 21], [-9, 51], [32, 48], [5, 91]], [[24205, 18592], [22, -24], [51, 2], [74, -50], [13, -88], [50, -10], [-4, -45], [45, -45], [51, -18], [24, -66], [-21, -85], [48, -29], [46, -63], [54, -13], [65, -93], [14, -47]], [[24737, 17918], [-123, -136], [-20, -48], [-72, -35], [-33, -60], [16, -46], [-24, -42], [-89, -100], [-41, -7], [-49, -65]], [[24302, 17379], [-46, 38], [-64, 9], [-3, 37], [-67, 28], [-91, -17], [-13, -75], [-49, 23], [-24, 34], [-174, 25], [-43, -37], [-120, 12], [-87, -38], [-101, 17], [-145, 12], [-44, 71]], [[23231, 17518], [134, 22], [50, 0], [71, 36], [-19, 133], [27, 26], [37, -30], [95, 18], [80, 42], [42, 58], [-4, 67], [36, 46], [-35, 34], [-43, -2], [-36, 46], [-96, -39], [-50, 20], [-67, -26], [-72, 10], [-4, 66], [-76, 115], [14, 44], [-16, 41], [77, 63], [-2, 68], [24, 25], [-25, 62], [29, 49], [-7, 76], [22, 56], [-25, 14], [-10, 61]], [[23382, 18719], [103, 19], [19, 78], [-12, 54], [58, -16], [36, 30], [81, 8]], [[23667, 18892], [56, -29], [40, -52], [40, 0], [34, -112], [92, -68], [71, -36], [133, -21], [72, 18]], [[30129, 18515], [17, -40], [-35, -38], [-21, -82], [36, -71], [7, -50]], [[30133, 18234], [-40, -52], [-75, -55], [-59, -12], [7, -47], [60, -42], [-16, -96], [-33, -88], [-30, -40], [61, -37], [55, -6], [10, -28]], [[30073, 17731], [-141, -14], [-6, -90], [-23, -37], [30, -46]], [[29933, 17544], [-39, -44], [-30, 14], [-60, -52], [-48, 9], [-51, -20], [-107, 18], [4, 98], [72, 6], [20, 114], [-27, 25], [17, 43], [-18, 39], [-100, 38], [1, 49], [-67, 62]], [[29500, 17943], [10, 58], [-12, 52], [55, 21], [51, 42], [-8, 56]], [[29596, 18172], [47, 33], [41, -26], [64, 35], [-29, 52], [114, 13], [39, -9], [29, 105], [-12, 91], [-65, 14], [-36, 79]], [[29788, 18559], [83, 49], [196, -33], [62, -60]], [[21554, 19179], [-16, -74], [-53, -46], [-25, -47], [3, -46], [-112, -50], [-40, 46], [-38, -4], [-19, -43], [-64, -21], [0, -37], [-62, -50], [33, -53], [-13, -39]], [[21148, 18715], [-26, -27], [-55, 19], [-51, 39], [-17, -44], [-48, 2], [-13, 78], [-125, 89], [-51, -8], [-52, -87], [-36, 17], [2, 46], [-27, 48], [-29, -1], [-47, 40], [-43, -15], [-39, 47]], [[20491, 18958], [46, 114], [83, -4], [-33, 79], [51, 41], [8, 48], [31, 40], [-4, 94], [-67, 53]], [[20606, 19423], [80, 61], [0, 26], [47, 63], [-3, 76], [12, 73], [49, 66], [-10, 30], [32, 45], [45, -15]], [[20858, 19848], [101, -23], [52, -135], [43, -37], [95, 11], [55, -51], [84, 6], [64, -87]], [[21352, 19532], [40, -114], [38, 1], [31, -69], [71, -54], [1, -69], [21, -48]], [[23700, 26408], [-29, -74], [-52, -18], [-46, -65], [18, -25], [-78, -33], [-55, -64], [30, -45], [-19, -23], [-55, 0], [0, -87], [-38, -82]], [[23376, 25892], [-18, 27], [-58, -16], [-73, -60], [-62, 4], [-21, -57], [-68, -46], [-38, -135], [15, -55], [-26, -55], [-104, 13], [-62, 54], [-101, -98], [32, -45], [-24, -70], [33, -51]], [[22801, 25302], [-81, 9], [-1, 78], [-28, 7], [-34, 82], [-31, 8], [-32, -51], [-138, 97], [18, 43], [-28, 30], [-76, 33], [-18, 31], [-49, -1], [-19, 32], [-52, 12]], [[22232, 25712], [28, 93], [74, 11], [17, 21], [-125, 107], [-88, -7], [-22, 75], [-96, -46], [-34, 14]], [[21986, 25980], [-37, 98], [27, 23], [-23, 46], [85, -4], [40, 58], [-15, 54], [21, 60], [52, -14], [109, -76], [60, 55], [136, 35], [4, 37], [46, 13], [-26, 53], [34, 47], [-28, 47], [13, 46], [-24, 35], [78, 42], [5, 67]], [[22543, 26702], [35, 26], [13, 44], [66, 4], [36, 60]], [[22693, 26836], [102, -53], [63, 24], [37, -62], [6, -89], [82, -18], [64, -65], [69, -31], [35, 26], [83, -28], [89, 22], [80, -10], [43, 24], [19, -79], [39, -42], [125, -14], [71, -33]], [[30255, 22794], [-1, -41], [-92, -31], [-5, -43], [35, -44], [5, -58], [-29, -20], [9, -234], [43, -23], [-10, -52], [61, -16], [70, -78], [10, -56], [38, -29], [43, 14], [83, -3], [41, -44], [-16, -60], [39, -142], [-2, -53]], [[30577, 21781], [-46, 13], [-154, -42], [-53, 34], [-18, -63], [1, -73], [-39, -57], [-62, -184], [-67, -41], [-17, -77], [55, -52], [-18, -105], [-75, -49]], [[30084, 21085], [-50, 52], [-27, -19], [-72, 23], [-41, -16]], [[29894, 21125], [-77, 65], [49, 45], [-10, 67], [-32, 3], [-88, 44], [-72, 79], [-30, -13], [-125, 51], [-46, 51], [-23, 81], [-29, -24], [-78, -22], [-41, -77], [-35, -5], [-43, 41]], [[29214, 21511], [-76, 69], [-35, 1]], [[29103, 21581], [16, 85], [-57, 78], [-50, -3], [-54, 24], [-38, 41], [15, 52], [64, 13], [26, 74], [-10, 96], [57, 51], [-81, 115], [10, 39]], [[29001, 22246], [77, -16], [34, 41], [60, -6], [5, -61], [65, 18], [55, 68], [56, -3], [8, 43], [119, 118], [-15, 58], [-30, 32], [67, 53], [16, -21], [101, -32], [14, 66], [46, 31], [37, -14], [68, 52], [40, 89], [75, -1], [82, -52], [102, 53], [41, -13], [141, 76]], [[30265, 22825], [-10, -31]], [[28526, 21105], [-77, -80], [-9, -67], [-64, -57], [-102, -36], [-3, -57], [66, -8], [33, -73], [-5, -82]], [[27706, 20748], [-7, 20], [57, 97], [-29, 32], [-17, 85], [77, -5], [-1, 93], [18, 45], [4, 152], [49, -14], [10, 42], [46, 7], [90, -64], [33, 72], [68, 21], [86, -17], [36, 41]], [[28226, 21355], [49, 44], [40, -6], [61, -60], [20, 10], [83, -27], [25, -53], [1, -54], [28, -31], [-7, -73]], [[32059, 17975], [-26, -173], [-27, -110], [-23, -30], [-107, -77], [-79, -16], [-150, 0], [-38, -159], [-29, -83], [-33, -19], [-162, -25], [-52, -18], [-91, -63]], [[31242, 17202], [-71, 38], [-58, 45], [-98, -7], [-57, -19], [-93, 18], [-44, -61], [-52, 10], [-59, 32], [-8, 66]], [[30702, 17324], [37, -3], [14, 83], [38, 108], [38, -14], [12, 110], [20, 23], [-2, 74], [56, -1], [57, 19], [34, 62]], [[31006, 17785], [20, 6], [148, -16], [94, 140], [149, 28]], [[31417, 17943], [109, -102], [55, 2], [66, 60], [58, 11], [262, 71], [92, -10]], [[26286, 17800], [-92, -74], [-48, -5], [-33, 92], [-48, 33], [-52, -29], [-33, 29], [-84, -11], [-49, -40], [22, -34], [-45, -125], [22, -71], [-67, -10], [1, -55], [29, -45], [62, -34], [41, 3], [47, -48]], [[25959, 17376], [-14, -43], [14, -70], [-5, -64], [-60, 0], [-59, -24], [-32, -47], [-97, 2], [-6, -78], [-110, -65], [-79, 53], [-81, -32], [-50, -6], [-38, 27], [-28, -42], [-59, -28], [-33, 15], [-79, -44]], [[25143, 16930], [-69, 9], [-57, 96], [-63, 31], [-95, -10], [2, -38], [-50, -28], [-53, -3], [-44, -33], [-88, 4], [-79, -32], [-49, 4], [-37, -24]], [[24461, 16906], [-42, 35], [-7, 60], [-42, 97], [-70, 17]], [[24300, 17115], [18, 62], [-13, 55], [21, 48], [-24, 99]], [[24737, 17918], [21, -19], [74, -2], [34, 39], [82, 42], [50, -15], [48, 54], [106, 50], [29, -10], [78, 52], [59, -45], [30, 23], [69, -48], [148, 35], [80, -52], [81, 19], [25, -51], [65, 38]], [[25816, 18028], [61, -53], [47, 38], [35, 53], [78, 36], [82, -53], [65, -81], [48, -5]], [[7079, 7195], [-10, -106], [31, -94], [32, -20], [40, -70], [2, -47], [82, 8], [83, 21], [-11, -75], [66, -152], [-34, -48], [-26, -74], [-28, -16], [-76, -83], [-51, -12], [-140, -57], [-78, -43], [-74, -54], [-60, -70], [-53, -17], [-37, -46]], [[6737, 6140], [-70, 3], [-83, -48], [-120, 12], [-44, -40], [-70, -96], [-65, -42], [-78, -1], [-127, 52], [-52, -8], [-145, 6], [-41, 25], [-89, -2], [-46, 18], [-69, -48], [-82, 31], [-107, -14], [-31, 36], [-44, -29], [-69, 23], [-71, -34], [-34, 30], [-81, 40], [-3, 70], [26, 53], [106, -4]], [[30039, 24453], [57, -65], [21, -60], [30, -22], [88, -2], [-65, -59], [-8, -129], [-34, -51], [-47, 4], [-38, -51], [-45, 4], [-35, 31], [-54, -31], [-10, 42], [-64, -3]], [[29835, 24061], [32, 14], [0, 92], [25, 56], [-51, 77], [20, 46], [47, 30], [0, 44], [102, 11], [29, 22]], [[36044, 5065], [39, 85], [29, -16], [10, -67], [52, 39], [154, -78], [4, -46], [-25, -46], [39, -35], [93, -6], [45, -72], [3, -39], [49, -68], [90, 27], [48, -69], [-18, -119], [39, -52], [-9, -56], [66, -20], [-9, -86], [43, -39], [40, 35], [63, -18], [40, 10], [71, -26], [48, 12], [30, -21], [51, 11]], [[37129, 4305], [8, -73], [45, -49], [-15, -96], [-19, -43], [10, -236], [39, -11], [-12, -66], [-57, -40], [-6, -64], [40, -45], [32, -66]], [[35656, 4793], [96, 50], [52, -13], [36, 16], [96, -4], [20, 85], [50, 16], [79, -15], [7, 43], [-48, 94]], [[32043, 21087], [92, -27], [39, -36], [6, -60], [-88, -14], [-4, -76], [47, -5], [86, 18], [38, -17], [24, -42], [-22, -73], [146, -46], [23, -25], [-23, -158], [-30, -38], [19, -39], [-25, -142]], [[32371, 20307], [-152, -104], [-32, -81], [-129, -45], [-35, 35], [-118, -8], [-48, 64], [-60, -81], [-51, -27], [18, -73]], [[31764, 19987], [-135, 25], [-30, 37], [-39, -6], [-9, 50], [-74, 22]], [[31477, 20115], [-36, 65], [-4, 51], [35, 98], [-40, 9], [0, 45], [-58, 53], [-48, -2], [-14, 47], [-43, 1]], [[31269, 20482], [-33, 63], [-24, 81], [28, 20], [-4, 59], [-26, 61], [71, 22]], [[31281, 20788], [21, -20], [12, -78], [103, 30], [105, -83], [64, 30], [55, 61], [25, -21], [55, 19], [53, -16], [23, -49], [44, 21], [48, 62], [-5, 113], [-29, 24], [-10, 116], [-16, 47], [49, 58], [75, -29], [90, 14]], [[28761, 18504], [30, -29], [104, -46], [56, -90], [23, -78], [92, -195], [45, -27]], [[29111, 18039], [41, -57], [-33, -127], [-143, -25], [-105, 63], [-75, -59], [14, -73], [-39, -56], [-125, -16], [-23, -121]], [[28623, 17568], [-49, 23], [-52, -11], [-72, 16], [-45, 57]], [[26857, 23414], [122, -59], [74, -22], [57, -63], [37, 12], [104, -126], [84, 39], [133, -16], [30, -24], [105, -2], [25, -57], [-49, -71], [14, -79], [35, -52], [77, -36], [73, -123], [30, 17], [109, -49], [10, 33], [97, -3], [42, -57], [-38, -56], [8, -53], [62, 26], [31, -83], [67, -64]], [[28196, 22446], [-58, -29], [-39, -84], [-66, 13], [-71, -68], [-14, -47], [33, -25], [-2, -75], [27, -72], [-72, -19], [-32, -43], [17, -78], [71, -106]], [[27990, 21813], [-51, -64], [-46, -12], [-79, -51], [-23, -49], [-70, 60], [19, 17]], [[27740, 21714], [-83, 98], [-137, 67], [-46, 0], [-33, 52], [-81, 63], [-56, -25], [-78, 42], [-30, 40], [-72, -45]], [[27124, 22006], [-80, 48], [-105, -15]], [[26939, 22039], [-31, 22], [-37, 99], [-95, 14], [4, 44], [78, 63], [15, 51], [-41, 29], [-5, 34], [-50, 44], [-6, 54], [-50, 89]], [[26721, 22582], [-17, 80], [-37, 55], [28, 120], [37, 38], [66, -5], [19, 22], [65, 5], [-19, 83], [14, 62], [-37, 35], [5, 87], [-56, 74]], [[26789, 23238], [114, -10], [57, -29], [46, 49], [-33, 29], [-108, 57], [-20, 44], [12, 36]], [[34207, 8042], [-47, -60], [-101, -49], [-47, -53], [-9, -54], [69, -133], [-35, -54], [35, -23], [6, -63], [-18, -44], [38, -44], [17, -60], [92, -119], [-3, -42], [-86, -16], [-29, -60], [-60, -34], [-5, -46], [38, -63]], [[34062, 7025], [-88, -16], [-16, -43], [-63, -15], [-27, -28], [9, -47], [-103, -80], [9, -34], [-34, -27], [35, -42], [-3, -44], [-66, -20], [-168, 9], [-43, 32], [-19, 45]], [[33485, 6715], [-30, 35], [-92, 12], [-43, 24], [-129, -19], [-59, 28], [-8, 65], [49, 44], [24, 190], [-137, 21], [-67, 59], [-47, 91], [43, 111], [-46, 41], [-81, 4], [-4, 48], [82, 130], [-3, 110], [24, 30], [71, 26], [22, 53], [-85, 57], [-97, 41]], [[32872, 7916], [-14, 45], [56, 66], [18, 47], [-40, 15]], [[32892, 8089], [51, 32]], [[32943, 8121], [27, -16], [96, 85], [26, 50], [63, 24], [125, -10], [54, -45], [45, 6], [11, 83], [99, 6], [63, -63], [67, 37]], [[33619, 8278], [28, -46], [0, -51], [73, -41], [44, 8], [79, -23], [76, 64], [-14, 88], [48, -31], [83, 39], [34, -3], [4, -61], [58, -41], [21, -60], [54, -78]], [[11698, 8359], [-150, -27], [-31, -25], [-168, 4], [-109, -27], [-38, 9], [-125, -62], [-74, 11], [-88, 53], [-36, -18], [-63, 4], [-54, 30], [-95, -46], [-73, -10], [-59, -93], [-45, 14], [-7, -46], [-66, -20], [-84, -45]], [[10333, 8065], [16, 76], [-45, 89], [-110, 14], [-72, 24], [-73, -1], [-12, 55], [-65, 56], [-45, -31], [-63, -7], [-2, -85], [-36, -10], [-166, 1], [-126, -8], [-80, 10], [-119, -37], [-11, 138], [59, 21], [78, 98], [74, 50], [-15, 42], [-133, -29]], [[9387, 8531], [-16, 31], [0, 77], [81, 24], [96, 13], [38, 56], [-1, 41], [39, 19], [58, 64], [71, 59], [-16, 51], [-63, 55], [-125, 45], [-20, 22], [11, 105], [27, 60], [72, 69], [48, 135], [58, 79], [-8, 88], [-24, 108], [25, 63], [133, 5], [80, 17], [48, 55], [102, 4], [126, 73], [38, -16], [80, -3], [51, 45], [146, 11], [42, 30], [39, -27], [80, 26], [21, 43], [101, 72], [65, 12], [202, 20], [120, 66], [61, -20], [144, 14], [122, 39], [139, 21], [244, -46]], [[11922, 10236], [11, -93], [-47, -97], [2, -61], [32, -160], [-53, -241], [-46, -21], [3, -64], [-60, -47], [-19, -45], [16, -209], [-11, -110], [25, -88], [5, -184], [-10, -113], [-22, -47], [-23, -125], [6, -33], [-42, -99], [9, -40]], [[24423, 14358], [83, -116], [59, -15], [28, -37], [134, -67], [34, -99], [1, -54], [47, -69], [38, -6], [40, 36], [44, -60], [26, -73], [42, -30]], [[24999, 13768], [-111, -173], [-49, -35], [-87, 6], [-45, -64], [-61, 1], [-51, -60], [-100, 17], [-17, -64], [-41, -70], [2, -39], [105, -64], [16, -36], [64, -36]], [[24624, 13151], [-36, -53], [41, -19], [-35, -126], [-49, -46], [34, -25], [-44, -53], [-34, 41], [-65, 45], [-65, -7], [-7, -39], [-65, -26], [-51, 8], [-47, -109], [-53, 15], [-65, 53], [-47, -22], [-4, -38]], [[24032, 12750], [-38, 89], [24, 84], [-23, 63], [-58, 9], [-26, 73], [-50, 46], [-52, 17], [-1, 58], [-39, 32], [0, 81], [19, 114], [50, 26], [66, 111], [39, 15], [-18, 57], [39, 11], [6, 122], [-12, 75], [-67, 15], [-1, 65], [37, 9], [-24, 79], [-72, 100], [-45, 82], [-51, 43], [25, 21]], [[23760, 14247], [-3, 63]], [[23757, 14310], [106, 28], [44, -14], [7, -42], [45, -12], [43, 55], [48, 5], [58, -42], [101, -15], [-15, 51], [75, 3], [28, 86], [91, -13], [35, -42]], [[21129, 14627], [32, -58], [59, -57], [34, 14], [-2, -119], [-42, -44], [47, -29], [1, -95], [89, -72], [74, 45], [142, -20], [49, -17], [61, 38]], [[21673, 14213], [27, -8], [18, -56], [-39, -48], [17, -38], [-31, -40], [12, -145], [48, -54], [-4, -53], [16, -70], [51, 7], [25, -71], [72, -6], [21, -78]], [[21906, 13553], [-69, -21], [-34, -34], [-59, -8], [13, -41], [-71, -75], [-63, -23], [-25, -29], [-103, 33], [-138, -35]], [[21357, 13320], [37, 93], [-61, 25], [-12, 31], [34, 40], [5, 61], [32, 46], [-69, 83], [5, 71], [-74, -11], [-51, 48], [-1, 46], [-77, 35], [-49, -23], [-54, -92], [-11, -86], [18, -49], [-13, -72], [8, -60], [-62, -102], [4, -47], [-97, -58], [-135, -56]], [[20734, 13243], [-43, 51], [-11, 66], [20, 66], [30, 40], [-29, 49], [-2, 87], [-36, 42], [-51, 14], [-52, 62]], [[20560, 13720], [79, -14], [168, -6], [39, 40], [-18, 86], [56, 38], [-41, 49], [-36, 4], [-44, 49], [-20, 53], [-83, 60], [24, 64], [-57, 58], [56, 38], [46, 88], [41, 17], [166, 288], [9, 37]], [[20945, 14669], [71, -36], [34, 17], [79, -23]], [[27448, 16454], [-74, -14], [6, 38], [-59, 51], [-116, -18], [-75, 67], [-41, -4], [-23, -209], [-146, -53]], [[26920, 16312], [-47, 6], [-67, 54], [-20, -15], [-118, -26], [-41, -34], [-42, 75], [-94, -12], [-10, 26]], [[26481, 16386], [18, 10], [13, 81], [-16, 31], [34, 82], [20, 183], [-108, -15]], [[26442, 16758], [-36, 73], [20, 62], [84, -50], [21, 91], [23, 29], [0, 72]], [[26554, 17035], [65, 12], [42, -14], [87, 27], [23, 51], [103, 59], [-27, 98], [60, 51], [8, 27], [59, 10], [28, -30]], [[27002, 17326], [19, -58], [44, 39], [98, 10], [28, -28], [85, -42], [-10, -42], [24, -33], [15, -87], [-41, -76], [15, -63], [40, -14], [8, -37], [97, -16], [50, -21]], [[31436, 3485], [20, -121], [-18, -26], [43, -67], [129, 25], [46, -56], [-8, -82], [13, -30], [-22, -88], [-22, -38], [-18, -86], [-51, -10], [33, -48], [-19, -48], [-1, -115], [-46, -61], [52, -48], [-29, -89], [67, -68], [52, -216], [38, -27], [76, -85], [-42, -82], [-21, -68], [47, -30], [29, -87], [31, -25]], [[31815, 1809], [18, -37], [-16, -56], [-97, -64], [-44, -48], [-49, -7], [-64, -81], [-223, -184], [-85, 7], [-53, -19], [-29, 52], [8, 58], [-65, 31], [21, 44], [-35, 57], [-44, -5], [-15, 34], [-59, 33], [-81, -33], [-33, 38], [-2, 56], [-56, -4], [-63, -41], [-120, 43], [-28, 21], [-55, -41], [-71, -17], [-60, 94], [-67, 15], [-95, 45], [-124, -37], [-34, 13], [-31, -57], [-73, -58], [5, -63], [-103, -136], [-1, -44], [-72, -131], [-46, -121], [69, -45], [-15, -61], [-149, -2], [-21, -46], [-84, -40], [-26, -43], [-55, 13], [-42, -26], [-16, 71], [-64, 116], [-52, 11], [-68, -17], [-56, -96], [-67, 4], [-67, -28], [-59, -50], [-81, -10], [91, -79], [46, -78], [52, -47], [0, -52], [26, -22], [16, -70], [35, -19], [8, -41], [-44, -56], [-47, -10], [-6, -57], [-36, -9], [-72, -50]], [[28990, 327], [-90, 22], [-45, 39], [-77, -10], [-75, 17], [-104, 88], [-38, 83], [-40, 24], [-54, 71], [-59, 110], [-130, 94], [29, 51], [3, 81], [81, 5], [41, -39], [107, -21], [145, 62], [-6, 79], [-28, 62], [17, 34], [74, 42], [25, 62], [-3, 39], [-35, 68], [21, 15], [-21, 68], [-96, 78], [-138, 150], [-59, 45], [6, 67], [-27, 54], [4, 68], [-39, 88], [-34, 17], [-20, 56], [20, 26], [-19, 103], [-48, 40], [-62, 114], [20, 99], [-58, 91], [-45, 35], [6, 107], [-27, 52], [1, 50], [90, -19], [-5, 193], [-101, 119], [-76, 7], [-147, 45], [-62, 28], [-37, 68], [-56, 24], [5, 32], [-79, 55], [-73, 99], [-49, 1], [-71, 32], [-25, 62], [-198, -68], [-112, 8], [-127, -31], [-209, -108], [-105, 286], [-192, 533], [26, 39], [-137, 250], [38, 213], [-159, 99], [49, 184], [230, 173], [90, -120], [80, -58], [111, 23], [130, -56], [110, -13], [130, 43], [188, 130], [50, -102], [165, -227], [102, -6], [140, -38], [38, 23], [70, -16], [85, 7], [139, 162], [223, 63], [25, 96], [134, 37], [-16, 25], [100, 85]], [[30320, 4956], [54, -58], [10, -82], [27, -47], [76, -57], [52, -65], [160, -109], [40, -83], [10, -56], [131, -85], [20, -22], [74, -136], [54, -68], [105, -155], [77, -81], [44, 9], [26, 121], [81, 85], [-4, 27], [64, 49], [13, -150], [-49, -75], [4, -47], [-27, -67], [28, -42], [9, -85], [-7, -95], [44, -97]], [[24626, 11973], [17, -156], [146, -293], [46, -103]], [[24835, 11421], [-39, -107], [-98, -110], [-41, -26], [17, -54], [-28, -18], [51, -51], [28, -126], [-31, -73], [-83, -56], [9, -29], [-92, -53], [-30, -88], [-84, -68], [-61, 12], [-71, -22], [-62, 14]], [[24018, 11433], [106, 63], [32, 38], [47, 11], [75, 104], [23, 87], [-15, 73], [-34, 68], [58, 65], [-2, 24]], [[24308, 11966], [55, -19], [79, 10], [94, 40], [33, -27], [57, 3]], [[2583, 14536], [30, -57], [49, -14], [79, 34], [192, 8], [66, 24], [116, 0], [43, -25], [5, -41], [41, -39], [37, -67], [5, -126], [69, 16], [60, -132], [127, -62], [27, -47], [74, 32], [13, -36], [-42, -78], [39, -64], [113, -4], [30, 25], [55, -2], [46, 68], [117, 25], [15, 20], [97, 30], [6, -51], [46, -22], [70, 88], [84, -11], [83, 54], [53, 78], [80, 16], [78, -16], [41, 21], [46, -7], [6, -33], [66, 3], [21, -21], [14, -75], [90, -13], [13, -20], [89, -9], [98, -123], [80, 18], [66, 34], [51, 51], [49, -35], [100, 29], [9, 61], [-19, 57], [10, 51], [37, 16], [30, 67], [39, 17], [46, -21], [76, 50], [89, 4], [25, 40], [223, 36], [31, -31], [94, 10], [26, 50], [39, 11], [70, -26], [54, 1], [89, -42], [5, -57], [180, -25], [86, 1], [70, -41]], [[6725, 14209], [12, -139], [-7, -100], [23, -68], [-111, -89], [-18, -71], [-73, -56], [-75, -28], [-14, -23], [-6, -145], [12, -63], [-27, -54], [-67, -84], [-65, -19], [-33, -59], [-57, -13], [-44, -64], [22, -26], [-2, -110], [27, -37], [6, -73], [31, -94], [99, -134], [28, -97], [27, -191], [1, -232], [-46, -106], [-44, -50], [-142, -124], [-32, -99], [71, -361], [103, -505]], [[6324, 10895], [-621, -118], [-445, -90], [-477, -98], [-525, -98], [-88, -65], [-147, -129]], [[4021, 10297], [-94, 249], [-104, 248], [-34, 107], [-45, 61], [-106, -63], [-90, 4], [-149, 60], [-408, 140], [-410, 305], [-167, 155], [-44, 31], [-51, 65], [-25, 0], [-24, 100], [-85, 123], [20, 34], [-16, 66], [12, 60], [-37, 93], [-37, 37], [-59, -4], [-8, 62], [-26, 45], [76, 107], [-8, 31], [-81, 18], [-30, 36], [-66, -2], [1, 46], [92, 60], [3, 77], [60, 82], [59, 3], [45, 100], [-38, -1], [-96, 48], [-5, 52], [78, 58], [19, 58], [-47, 6], [-4, 84], [-31, 51], [-31, 110], [-51, 35], [16, 33]], [[1995, 13367], [49, 65], [24, -20], [109, 21], [-5, 50], [-75, 47], [-31, 99], [21, 52], [-2, 80], [35, 144], [32, 58], [-17, 63], [-33, 50], [32, 31], [2, 79], [167, 79], [36, 37], [62, 29], [46, 86], [42, 46], [94, 73]], [[27295, 20318], [-39, -24], [-33, -91], [-28, -29], [-66, -2], [-39, -126], [-105, -28], [-23, -24]], [[26962, 19994], [-125, -46], [-77, 38], [-29, -9], [-18, -67], [-67, -94], [-43, -2], [-24, -40], [-48, -27], [-35, 31], [-18, 72]], [[26478, 19850], [57, -24], [96, 59], [-11, 43], [-68, 35], [-113, 112], [-75, 5], [-77, 71]], [[26287, 20151], [-15, 129], [51, 22], [39, -17], [60, 84], [-34, 61], [55, 51], [-14, 45], [-42, 11], [-37, 118], [64, 37], [-21, 31], [22, 67], [48, 19], [16, -31], [91, 49], [32, -18]], [[22254, 16626], [166, 16], [123, -3], [101, -47], [117, -35], [3, -57], [85, -38], [27, -40], [-3, -77], [37, -43], [73, -1], [21, -88]], [[23004, 16213], [-55, -6], [-84, -99]], [[22865, 16108], [-103, 6], [-39, -44], [-52, -6], [-50, -108], [-27, -27], [53, -77], [-22, -27], [78, -113], [76, -45]], [[22779, 15667], [-56, -56], [-23, -67], [-91, -38]], [[22609, 15506], [-10, 19], [23, 100], [-31, 54], [-65, 55], [-64, 1], [-33, -21], [-72, 42], [-14, -36], [-41, -6], [-74, 47], [-53, 12], [-103, -28], [-49, -27]], [[22023, 15718], [-6, 37], [-55, 19], [40, 55], [32, 89], [63, 62], [-18, 22]], [[22079, 16002], [24, 104], [53, 1], [49, 56], [26, 128], [-35, 46], [36, 133], [22, 156]], [[14831, 9307], [-4, -146], [-257, -300], [-17, -38], [-3, -112], [-62, -154], [-51, -217], [-49, -132], [-120, -27], [66, -218], [-247, 15], [-34, -37], [-132, -55], [-59, -91], [-80, -59], [-48, -14], [-90, -129], [-275, -187], [-8, -29], [-118, -71], [-49, 2], [-31, -27], [-50, 0], [-68, -32], [-144, -17], [-111, -33], [-156, 17], [-102, -33], [-48, 6], [-77, -62], [-176, -23], [-74, 6], [-85, -30]], [[12072, 7080], [-11, 43], [21, 107], [-16, 41], [-67, 43], [-43, 46], [-10, 94], [-36, 52], [-8, 68], [-36, 72], [18, 72], [-28, 170], [-17, 54], [26, 47], [79, 88], [22, 87], [-34, 33], [-88, 7], [86, 62], [-75, 32], [-69, -3], [-23, 30], [-65, 34]], [[11922, 10236], [57, 2], [148, 91], [72, 35], [150, 54], [150, 9], [73, 35], [96, 95], [96, 24], [76, 2], [86, 32], [86, 79], [101, 18], [-18, 54], [7, 40]], [[13102, 10806], [32, -69], [2, -76], [31, -23], [96, -130], [162, -150], [216, -154], [134, -8], [122, -118], [119, -50], [44, 45], [22, 95], [96, -76], [86, -57], [64, -22], [107, -6], [106, -43], [85, -70], [4, -45], [-34, -81], [103, -90], [-109, -56], [13, -80], [-28, -33], [73, -116], [37, -11], [146, -75]], [[34228, 6664], [-11, -50], [44, -69], [13, -79], [81, -19], [62, 9], [34, -13], [28, -55], [6, -51], [36, -59], [65, -66], [18, -81], [-11, -62], [29, -107], [35, -25], [-35, -53], [-46, 10], [-16, -52], [57, -37], [-6, -32], [-54, -25], [0, -53], [-36, -65], [73, 8], [46, -39], [14, -49], [-12, -41], [62, -38], [47, -51], [-10, -27], [36, -42], [28, 10], [59, -36], [-7, -58], [32, -18], [74, 48], [96, -34]], [[35059, 5263], [-17, -40], [-6, -75], [57, -55]], [[33839, 4975], [-70, 73], [-109, -36], [-70, -11], [-117, 93], [-45, 1], [-38, -74], [-53, -24], [-116, 39], [-76, 74], [-25, 45], [-64, 36], [-11, 48], [-82, 68], [-14, 121], [-80, 95], [-11, 49], [-120, 43], [30, 59], [40, 0], [45, 57], [33, 123], [-31, 29], [-89, 27], [-64, -4], [-59, 83], [9, 37], [-35, 56], [-61, 6]], [[32556, 6088], [-35, 16]], [[32521, 6104], [34, 92], [-4, 38], [104, 74], [105, 45], [26, -12], [79, 16]], [[32865, 6357], [139, -110], [84, -29], [171, 57], [80, -6], [11, 41], [99, 96], [-39, 45], [-7, 62], [52, 85], [14, 95], [16, 22]], [[34062, 7025], [104, -58], [9, -106], [-29, -20], [-23, -68], [80, -28], [25, -81]], [[29469, 11668], [-47, -15], [-75, 25], [-129, -17], [-20, 15], [-46, -68], [-51, 6], [-22, -50], [-58, -44], [-19, -37], [51, -213], [-23, -80], [39, -74], [-100, -41], [-27, 16], [-123, -67]], [[28819, 11024], [-23, -6], [-30, -84], [-73, -19], [-73, 16], [-17, -26], [-60, 50], [-14, 48], [-49, 47], [-200, 76], [-83, 50]], [[28197, 11176], [67, 70], [58, 12], [27, 92], [-50, -11], [-100, 19], [-16, 56], [40, 93], [-7, 31], [89, 73], [-17, 53], [148, -12], [48, 14], [-29, 104], [66, 37], [52, 97], [27, 16], [6, 52]], [[28606, 11972], [18, 98], [59, 43], [89, -4], [103, 65], [42, 9], [48, -31], [12, -61], [124, -43], [78, -62], [31, -68], [90, -37], [50, -118], [84, -54], [35, -41]], [[28099, 16425], [-57, -99], [20, -24], [-49, -105], [-92, 33], [-16, -45], [-36, -9], [-90, -65], [-18, -26], [17, -97]], [[27778, 15988], [-132, -23], [-32, 26], [-85, 29], [-93, -22], [-49, 23], [-67, 4], [-58, -66], [-13, -94], [-26, -42], [-64, -22], [-40, 15]], [[27119, 15816], [-4, 38], [-52, 23], [-106, 17], [-99, 35], [36, 33], [0, 85], [22, 95], [-39, 39], [23, 50], [-13, 39], [33, 42]], [[27975, 16639], [25, -57], [56, -25], [31, -40], [45, -3], [3, -53], [-36, -36]], [[24300, 17115], [-32, -39], [-88, -42], [-22, -75], [-105, -79], [-37, 3], [-17, -41], [56, -44], [-36, -56], [-27, -4], [-2, -63], [32, -48], [-64, -50], [-76, -20], [27, -99], [-40, -42]], [[23869, 16416], [-100, 20], [-83, -31], [-70, 20], [-34, 39], [10, 105], [-22, 26], [-62, -20], [-46, -38], [-56, 44], [9, 23]], [[23415, 16604], [20, 43], [-26, 54], [-31, -8], [-74, 34], [-33, 78], [48, 34], [-60, 81], [-132, 0], [-45, -21], [-78, 10], [-40, -38], [-162, 93]], [[22802, 16964], [75, 57], [-78, 86], [-30, 76], [-98, 53], [-34, 39], [-1, 136], [62, -18], [93, 51], [104, 105], [66, -68], [81, 33], [46, -26], [53, 14], [25, 33], [65, -17]], [[4021, 10297], [77, -181], [50, -68], [17, -143], [-73, -31], [-92, -74], [-195, -81], [-158, -14], [-53, -38], [-99, 39], [-109, 23], [-66, 52], [-107, 8]], [[619, 10637], [-6, 89], [13, 58], [-37, 60], [34, 10], [-20, 144], [27, 62], [-28, 28], [-46, -13], [-36, 24], [-16, 99], [121, 125], [16, 69], [-31, 57], [-82, 16], [-49, -11], [-48, 46], [-50, -8], [-24, -66], [-126, 7], [-41, -14], [-51, 68], [7, 46], [42, 68], [96, -22], [10, 59], [56, -14], [22, 88], [106, -21], [64, 18], [62, 64], [76, 20], [27, 68], [-24, 88], [7, 48], [65, -23], [118, 50], [98, 131], [-5, 49], [34, 102], [2, 43], [-42, 46], [-19, 147], [-59, 18], [-3, 78], [24, 31], [55, 8], [28, 96], [-13, 84], [39, -9], [85, 34], [90, -32], [82, 14], [-38, 54], [23, 59], [43, 20], [29, 82], [64, 12], [28, 57], [100, 39], [9, 29], [64, 57], [86, 6], [23, 60], [40, 20], [43, -11], [133, 54], [79, -35]], [[3947, 9872], [32, 70], [-10, 134], [-50, 29], [-80, -68], [-63, -7], [14, 59], [-14, 39], [-62, 27], [-71, -11], [-75, 26], [-20, 35], [-76, -20], [-40, -43], [-75, -11], [-14, -74], [71, -34], [32, 37], [-26, 50], [69, 15], [5, -38], [36, -26], [13, -46], [49, -16], [-16, -74], [38, -39], [80, -36], [229, 2], [24, 20]], [[31433, 19237], [64, -47], [74, -94], [48, -43], [53, -20], [71, 16], [143, 120]], [[31886, 19169], [-36, -359]], [[31850, 18810], [-90, 20], [-92, 3], [-58, -79], [-62, 15], [2, -41], [-32, -21], [-34, 29], [-42, -47], [-17, -104], [-62, 5]], [[31363, 18590], [-35, 29], [-55, 3], [-55, 43], [28, 56], [-82, 38], [-61, 87]], [[31103, 18846], [-15, 70], [-75, 42], [-17, 112]], [[30996, 19070], [33, 37], [-9, 62], [78, 60], [25, -65], [125, -25], [71, 86]], [[31319, 19225], [90, 22], [24, -10]], [[15907, 11949], [31, -44], [-35, -62], [67, -32], [47, -53], [-46, -59], [-93, -8], [-16, -16], [-128, 0], [-62, 76], [28, 33], [-58, 62], [-78, 33]], [[15564, 11879], [67, 16], [43, 57], [80, -14], [18, -33], [84, 14], [51, 30]], [[32402, 8108], [95, -84], [84, -25], [54, 53], [52, -17], [1, -51], [67, 7], [26, 80], [111, 18]], [[32872, 7916], [-100, -59], [19, -20], [-50, -43], [-91, -108], [-13, 96], [-36, 33], [-35, -25], [18, -114], [-10, -64], [-108, -47], [-40, -38], [-11, -65], [-90, -16], [-87, -76], [-54, -3], [-19, -72]], [[32165, 7295], [-59, 37], [-74, 19], [-56, 83], [-84, 44], [-57, -4], [-125, 34], [-114, -6], [-76, -58], [-12, 26], [-182, 38]], [[31326, 7508], [114, 161], [67, 158], [-38, 93], [-61, -9], [-24, 18], [23, 50], [57, 26], [36, -27], [72, 64], [76, -5]], [[31648, 8037], [11, -85], [26, -22], [51, 25], [-8, 29], [42, 45], [30, 0], [56, 47], [45, -15], [15, 34], [100, -4], [21, 60], [94, 51], [-45, 74], [74, 36], [-34, 30], [63, 44], [36, -27], [64, -101], [6, -63], [50, -62], [57, -25]], [[21346, 15411], [10, -33], [68, -15], [32, -58], [-38, -70], [29, -30], [30, -128], [-86, -123], [-38, 13], [-143, -64], [-38, 22], [-9, -132], [17, -50], [-43, -13], [-8, -103]], [[20945, 14669], [-66, 20], [-37, 53], [23, 79], [-41, 64], [15, 105], [-44, -16], [-91, 78], [-38, -57], [-41, 30], [-71, -67], [-58, 45]], [[20496, 15003], [-2, 69], [-37, -2], [-58, 61], [-6, 121], [38, 18], [61, 118]], [[20492, 15388], [77, 9], [51, -29], [56, 16], [-27, 68], [45, 56], [60, 37], [83, 9], [46, 24], [32, 112], [54, -52], [34, 15], [3, 43], [84, 101], [84, -77], [-1, -129], [-34, -39], [23, -50], [-28, -86], [46, -43], [41, -2], [125, 40]], [[8736, 7132], [-15, -83], [-51, -77], [-21, -56], [26, -56], [-21, -63], [-46, -68], [-67, -10], [62, -331], [458, 74], [526, 84]], [[9587, 6546], [93, -540], [-107, -428], [123, -153], [22, -106], [-62, -79], [-15, -40], [24, -115], [-275, 12], [-47, -38], [-72, -10], [-84, 20], [-103, -1], [-61, -52], [-94, 3], [-151, -23]], [[8778, 4996], [-92, -11], [-43, -23], [-69, 25], [-82, 59], [-57, 4], [-39, 31], [-40, -73], [-54, -58], [-87, -7], [-51, 9], [-25, -29], [-153, -19], [-42, 19], [-76, -37], [-89, -16], [-43, -39], [-71, -26], [-129, -117], [-66, -23], [-47, -57], [-77, 3], [-41, 106], [-43, 40], [-23, 54], [-59, 49], [-12, 54], [-40, 12], [-8, 42], [-82, 164], [-83, 116], [-42, 96], [-113, 165], [-77, 40], [-18, 110], [-57, 85], [-27, 19], [-3, 97], [76, 85], [47, 116], [-4, 79]], [[7886, 7802], [74, -48], [117, 56], [42, 36], [61, 11], [66, -33], [33, 7]], [[8279, 7831], [16, -29], [82, -41], [26, -74], [28, -22], [16, -61], [95, -64], [132, -135]], [[8674, 7405], [-14, -26], [-55, -11], [11, -135], [-24, -36], [10, -40], [55, 16], [32, -34], [47, -7]], [[32359, 1661], [-72, -50], [-38, -105], [26, -77], [-58, -82], [-76, -19], [20, -63], [-91, -29], [13, -53], [-16, -53], [-77, -44], [-86, -99], [-27, -12], [-21, -60], [31, -13], [14, -64], [-42, -29], [-89, -10], [-39, -102], [8, -50], [-100, -90], [-77, -45], [-35, 20], [-41, -51], [46, -27], [-53, -57], [-108, -90], [-78, 43], [-14, -45], [32, -57], [-37, -9], [-54, -54], [-61, 2], [-146, -42], [-68, -9], [-86, 23], [-65, 49], [-45, 9], [-46, -41], [-62, 12], [-72, -6], [-40, -24], [-34, -48], [-56, -30], [-56, 33], [-44, -37], [-116, -49], [-93, 5], [-51, -32], [-80, 24], [-82, -7], [-36, 12], [-44, 50], [-43, -2], [-117, 57], [-117, 11], [-89, 29], [-55, -38], [-114, 76], [-125, 17], [-90, 40], [-97, 58]], [[31815, 1809], [46, -9], [53, -74], [67, -1], [103, 50], [162, -38], [93, -29], [20, -47]], [[26315, 11892], [-36, -33], [-41, 2], [-28, -40], [0, -81], [15, -32], [-42, -63], [-100, 13], [-117, -38], [-16, -53], [-50, -35], [55, -27], [34, -39], [-27, -63], [94, -18], [6, -19], [163, -65], [21, -62], [-52, -18], [-31, 20], [-63, -12], [-22, -80], [4, -68], [-87, -117], [-50, -33]], [[25945, 10931], [-24, 22], [21, 146], [-78, 26], [-42, 59], [-38, -38], [-78, 52], [-92, 99], [-107, 25], [-34, -3], [-47, -73], [-147, 53], [-71, 33], [-20, 99], [-65, 46], [-85, -57]], [[25038, 11420], [-24, 70], [5, 39], [44, 68], [-23, 158], [39, 79], [33, -28], [80, -9], [78, -69], [10, -49], [121, -11], [43, -41], [96, 36], [42, 43], [-68, 53], [57, 64], [-16, 53], [95, 102], [-2, 29], [45, 40]], [[25693, 12047], [107, 7], [40, 37], [50, -12], [60, 73], [-9, 68], [25, 89]], [[32556, 6088], [-13, -65], [-36, -50], [42, -32], [-51, -40], [-37, -113], [-159, 44], [-78, -198], [-78, 13], [-47, -34], [-39, 34], [57, 22], [-14, 86], [-35, -31], [-75, 10], [-32, -59], [21, -82], [45, -28], [-33, -49], [-4, -97], [123, 9], [13, -56], [-68, -117], [37, -31], [-90, -58], [15, -55], [3, -119], [20, -56], [3, -97], [-12, -114]], [[32034, 4725], [-30, -76], [-138, 21], [-30, -66], [-125, 75], [-1, 18], [-84, 76], [-40, -18], [-63, 12], [-40, 66], [4, 94], [-93, 36], [-60, 113], [-31, 14], [-1, 50], [-27, 45], [16, 47], [49, 41], [-40, 69], [-91, 50], [52, 53], [6, 48], [46, 85], [-2, 76]], [[31311, 5654], [75, 11], [4, 55], [49, 108], [28, 30], [-35, 57], [28, 46], [37, 8], [31, 116], [78, 92], [114, 37], [25, 66]], [[31745, 6280], [62, -8], [53, 32], [19, -38], [115, -9], [62, -77], [79, 4], [21, 56], [85, 7], [72, -33], [43, 11], [15, -36], [150, -85]], [[16977, 24633], [-5, -72], [19, -51], [-27, -46], [43, -16], [-17, -119], [25, -49], [32, 4], [8, -65], [73, 34], [44, -21], [-19, -53], [53, -33], [-56, -73], [11, -95], [31, 0], [-8, -76], [-37, -26], [17, -55], [-50, -68], [36, -30], [19, -74], [-38, -37], [9, -148]], [[17140, 23464], [-33, 9], [-42, -37], [-76, 38], [-46, 47], [13, 71], [-45, 2], [-91, -34], [-7, -83], [-24, -52], [-19, -100], [38, -71], [-27, -140], [-117, -69], [-32, -43], [-55, 68], [-53, -36], [-30, 50], [-71, -57], [-63, 19], [-41, -22], [-37, 18], [-60, -52]], [[16222, 22990], [-17, 39], [-99, 46], [10, 124], [-66, 67], [-79, 17], [-11, 66], [-52, 10], [-69, 56], [-78, -6], [-40, 79], [3, 87], [55, 35], [-6, 94], [-65, 71], [-67, -51], [-29, 2], [9, 121]], [[16422, 24399], [23, 72], [58, -32], [77, 23], [-9, 49], [-40, 76], [-18, 69], [142, -15], [65, 47]], [[16720, 24688], [60, -23], [59, 30], [44, -33], [40, -58], [54, 29]], [[30927, 10869], [-43, 93], [-6, 42], [-118, 39], [-47, 38], [-46, 89], [-8, 81], [-95, 115], [-15, 100], [30, 78], [68, 50], [83, 32], [14, 36], [-42, 60], [-128, 60], [-19, 106], [-83, 37], [17, 65], [60, 48], [71, 98], [55, 4], [57, -51], [79, -23], [62, 10], [85, -52], [66, -68], [105, -56], [15, -82], [34, -43], [144, -21], [160, -14], [425, -69], [45, -31], [-24, -85], [-49, -84], [-21, -157], [14, -107], [53, -67], [12, -51], [112, -26]], [[32049, 11063], [-26, -92], [-53, -88], [-56, -27], [11, -34]], [[31925, 10822], [-17, 9], [-122, -35], [-126, 15], [-56, -83], [-29, -15]], [[31575, 10713], [-38, 90], [-124, 63], [-33, 29], [-18, 87], [-71, -29], [-57, 1], [-48, -27], [-133, -14], [-53, -35], [-73, -9]], [[21184, 16635], [27, -40], [44, 37], [72, -20], [5, -87], [-47, -14], [-40, -68], [-88, -46], [-79, 8], [2, -63], [74, -61], [79, -122], [-38, -68], [-24, -121]], [[21171, 15970], [-60, -18], [-10, -68], [-36, 13], [-33, -46], [-65, 12], [-111, 63], [-55, -6], [-31, 38], [-68, -14], [-26, 39], [-77, -76], [5, -22]], [[20604, 15885], [-41, -27], [-41, 98], [-42, -64], [-45, 60], [-66, 13], [-33, 33], [-22, 63], [-34, -32], [-59, -2], [-34, 43], [-37, -16], [-42, 23], [-11, 46], [-184, -10], [-25, 88], [14, 20], [-6, 77], [64, -16], [-14, 82], [77, 114], [139, 14]], [[20162, 16492], [29, 6], [53, -38], [12, -38], [64, -17], [51, 86], [77, 4], [58, 61], [45, 109], [-8, 58], [12, 56], [53, -1], [17, -48], [37, -25], [124, 45], [78, -35], [78, 40], [68, -7], [35, -92], [32, 7], [7, 99], [52, -7], [39, -35], [9, -85]], [[28385, 12487], [-14, -26], [-13, -107], [13, -68], [54, -65], [67, -43], [-35, -77], [26, -99], [123, -30]], [[28197, 11176], [-88, -41], [-34, 26]], [[27974, 11282], [-15, 37], [13, 60], [-28, 53], [41, 205], [-17, 50], [-74, -21], [-38, 10], [-40, -33]], [[27761, 11709], [-11, 56], [40, 93], [-2, 59], [47, 19], [0, 155], [40, 21], [-27, 62], [-55, -1], [-40, 114], [31, 122], [22, 34]], [[27806, 12443], [61, -7], [14, 50], [107, -34], [13, 54], [34, 41], [70, -39], [28, 57], [97, -27], [49, -41], [106, -10]], [[26052, 19276], [-34, -7], [-49, 65], [-116, 60], [-24, -13], [-56, 70], [-50, 1], [-33, -90], [-69, 51], [-77, 91], [90, 23]], [[25634, 19527], [-12, 55], [59, -14], [29, 58], [48, 6], [50, -26]], [[26177, 19694], [-31, -154], [-10, -174], [-84, -90]], [[24999, 13768], [60, -9], [56, -42], [74, -22], [-36, -86], [53, -96], [12, -88], [41, -34], [1, -49], [40, -53], [69, 2], [80, -61]], [[25449, 13230], [-102, -79], [31, -66], [97, -76], [4, -82]], [[25479, 12927], [-46, 3], [-42, 61], [-98, 38], [-32, 49], [-58, 10], [-54, 35], [-34, -1], [-197, -72], [-33, 54], [35, 55], [-9, 28], [-76, 13], [-89, -34], [-32, 18], [-57, -40], [-33, 7]], [[31106, 13768], [110, -2], [21, -24], [18, -112], [28, -25], [233, -44], [47, 98], [55, -2], [70, -49], [83, -87], [23, -43], [4, -188], [33, -63], [0, -173], [-30, -45], [-41, -5], [-171, 18], [-57, 14], [-106, -98], [-60, 9], [-23, 52], [-52, 61]], [[31291, 13060], [7, 70], [-26, 70], [-39, 27], [-19, 155], [-59, 3], [-57, 31], [-69, -5], [-13, 21], [-70, -13], [-41, 16], [-42, 48], [0, 57], [35, 9], [32, 46], [85, 28], [-11, 32], [33, 39], [52, 9], [17, 65]], [[25669, 22260], [-53, -52], [-107, 8], [17, -67], [-12, -86], [-26, -27], [-82, 49], [-64, 18], [-38, -62], [48, -8], [-7, -69], [-39, -9], [-43, -77]], [[25263, 21878], [-15, -39], [-62, -53]], [[25186, 21786], [-38, -4], [-90, 43], [-45, -22], [-45, 4], [-41, -25], [-50, -63], [7, -59], [-45, -12], [-31, 27], [-58, -44], [-37, 58], [-47, 10], [-81, 145], [-44, -27]], [[24541, 21817], [-30, 72], [8, 29], [-56, 55], [-70, -4], [-14, 37], [73, 132]], [[24452, 22138], [81, -8], [61, 23], [21, 39], [41, 2], [64, 42], [49, -38], [46, 33], [62, -61], [24, 11], [54, -47], [73, 75], [154, 57], [160, 138], [23, 66]], [[25365, 22470], [130, -99], [10, -39], [120, -3], [44, -69]], [[26351, 19683], [43, -40], [74, -122], [34, -18], [5, -84], [-35, -38], [18, -40], [103, -13], [62, 13], [-28, -227], [13, -73], [41, -59], [-54, -62], [37, -73], [29, -21], [38, 34], [74, -2]], [[26805, 18858], [-9, -59], [32, -23], [15, -113], [29, -30]], [[26548, 18458], [0, 64], [20, 42], [-40, 165], [13, 23], [-65, 62], [-179, -48], [-46, 61], [-35, -10], [-57, 26], [-38, -33], [-63, 28], [-35, -7], [-7, 66]], [[26016, 18897], [78, 46], [44, 44], [11, 63], [-10, 80], [-55, 61], [-32, 85]], [[31589, 22522], [-77, -214], [-25, -36], [-43, -2], [-61, 29], [-78, -104], [77, -51], [197, -38], [96, -34], [31, -50], [-4, -53]], [[31702, 21969], [-125, -55], [-87, -7], [-58, -50], [12, -47], [-74, -82], [-53, -13], [-20, -36], [-85, 26], [-65, 73], [-21, -25], [-112, 79], [-51, 2], [-34, -65], [-41, -32], [5, -73], [-30, -47], [-33, -3], [-5, -73]], [[30825, 21541], [-99, 25], [7, 39], [-15, 75], [-70, -2], [-21, 55], [-50, 48]], [[30255, 22794], [37, -46], [57, -17], [-56, -69], [39, -55], [27, 60], [70, -53], [42, -86], [43, -34], [50, 51], [60, -29], [19, 30], [72, -54], [32, -42], [88, -11], [31, 47], [70, 27], [50, -50], [46, -12], [56, 67], [65, 31], [110, 8], [326, -35]], [[32371, 20307], [32, -10], [162, -14], [38, -16], [-6, -41], [-61, -47], [-22, -92], [-16, -349], [-53, 17], [-12, -57]], [[32433, 19698], [-41, -15], [-150, -104], [105, -115], [52, -79], [-104, 15], [-43, -26], [-77, 17], [-71, -32], [-55, -85], [-48, -41], [-115, -64]], [[31433, 19237], [113, 185], [52, 6], [-27, 98], [70, 40], [-4, 42], [-49, 75], [37, 17], [40, 47], [12, 55], [87, 15], [-2, 60], [22, 76], [-20, 34]], [[28528, 19768], [47, -57], [55, -112], [7, -50], [-40, -101], [103, -76], [118, 10], [20, -26], [0, -76], [-25, -35], [81, -57], [84, -3], [80, -77], [82, -37]], [[29140, 19071], [14, -40], [-5, -116]], [[29149, 18915], [-118, 16], [-47, -24], [-90, 55], [-15, -31], [-55, 10], [-77, -76], [-44, 4], [-1, -53], [-38, -61], [-35, -25]], [[27957, 19007], [22, 47], [-43, 10], [-93, 81], [-3, 93], [-46, 5], [-11, 62], [37, 56], [52, 25], [35, 52], [-14, 118], [43, 55], [92, 72], [29, 73], [3, 137], [43, 52], [12, 65]], [[22802, 16964], [-57, -17], [-96, 14], [-21, 53], [-68, -33], [-58, 35], [-36, -23], [-27, 28], [-87, 46], [-87, 4]], [[22265, 17071], [10, 171], [56, 28], [3, 49], [-65, 70], [-13, 62], [55, 83], [-2, 86], [33, 49], [-23, 75], [6, 81], [100, 93], [3, 122], [23, 59], [-66, 60], [-33, -9], [-23, 51], [55, 90], [-15, 28]], [[22369, 18319], [65, -30], [44, 33], [52, -27], [58, -9], [28, 58]], [[22616, 18344], [53, 23], [65, 57], [41, -4], [40, 48], [43, 7], [38, 44], [96, 17], [156, 129], [0, 32], [36, 45], [198, -23]], [[26874, 15383], [21, -31], [-27, -131], [-63, -41], [27, -34], [-24, -82], [33, -49], [16, -132], [-13, -47], [-39, -16]], [[26805, 14820], [-13, -74], [-96, 19], [-30, -12], [-79, 25], [-133, -74], [-102, -27], [-59, 20], [-202, -75], [-38, 23], [-57, -17]], [[25996, 14628], [-16, 49], [6, 146], [-21, 85], [3, 80], [-11, 53], [21, 28]], [[25978, 15069], [55, 12], [42, 62], [-3, 56], [121, -20], [17, -15]], [[26210, 15164], [45, -51], [-42, -74], [41, -57], [-38, -45], [52, -15], [24, -52], [68, 53], [21, 53], [-23, 57], [17, 53], [75, -38], [148, -31], [20, 25], [99, 31], [-13, 51], [-35, 44], [-159, 108], [-7, 50]], [[26503, 15326], [22, 127], [-19, 66], [42, 34], [59, -28], [13, -31], [78, -19], [11, -43], [48, -4], [55, -46], [62, 1]], [[21230, 24204], [-20, -86], [22, -86], [46, -78], [-47, -20], [-42, 17], [-58, -37], [-25, -42], [-13, -70], [40, -78], [1, -61], [-49, -40], [4, -45], [46, -117], [40, -43], [93, 12]], [[21268, 23430], [56, -96], [-48, -3], [-39, -53], [-45, 19], [-31, -23], [-14, -62], [-36, -29], [-48, 20], [-47, -76]], [[21016, 23127], [-16, 115], [-109, 43], [-8, -73], [-48, 5], [-38, 37], [-51, 1], [-110, 42], [-72, 58]], [[20359, 23674], [-1, 26], [54, 49], [36, 6], [13, 70], [72, 51], [33, 46], [34, -17], [87, 71], [70, 121], [-2, 18], [94, 32], [-1, -53], [62, -52], [60, 20], [92, 49], [20, 61], [33, -10], [54, 41], [61, 1]], [[24521, 28994], [-23, -23], [-51, 8], [-77, -109], [-55, 29]], [[24315, 28899], [-31, 57], [-56, -38], [-19, 62], [15, 31]], [[24224, 29011], [80, 29], [-5, 61], [-49, 26], [1, 49], [58, 41], [-3, 73]], [[24306, 29290], [52, 3], [54, -72], [-32, -17], [30, -56], [57, -55], [84, -24]], [[24551, 29069], [-30, -75]], [[20401, 15593], [-62, -3], [-49, 44], [-62, 18], [-103, -68], [38, -167], [-66, -54], [-22, -80], [-63, -40], [-75, -94], [-40, -26], [-62, 16]], [[19257, 15209], [-53, 22], [-26, -34], [-36, 56], [31, 22], [86, 119], [87, 86], [48, 118], [-23, 57], [-54, 79], [-31, 80], [36, 86], [-8, 44], [34, 57], [32, 18]], [[19380, 16019], [54, 7], [75, 77], [-41, 32], [6, 97], [-65, -17], [-24, 139], [-22, 38], [0, 90], [-81, 92], [44, 31], [76, 13], [48, 73], [59, 54]], [[19509, 16745], [26, -56], [64, -15], [-36, -92], [64, -48], [148, 41], [20, 83], [55, 29], [122, -47], [37, 15], [70, -63], [-10, -63], [62, -6], [31, -31]], [[20604, 15885], [-19, -73], [-31, 16], [-47, -128], [-28, 10], [-78, -117]], [[20298, 21903], [49, -53], [80, -19], [-21, -92], [8, -49], [-24, -48], [-4, -65], [-57, -1], [-9, -75], [-29, -96], [29, -26], [15, -96], [-12, -59], [-50, -66]], [[20273, 21158], [-51, 5], [-49, -46], [-80, -48], [-26, 36], [-102, 5], [16, -73], [-81, -105], [-60, 54], [-55, -60], [-43, -24], [-100, 13], [-65, 25]], [[19286, 21509], [43, -55], [56, -35], [20, 24], [132, -28], [83, -2], [54, 21], [27, 52], [-74, 20], [14, 55], [-12, 48], [43, 88], [51, -19], [41, 101], [6, 81], [-38, 24], [-33, 58], [34, 57], [129, 96], [122, -53], [15, 16], [89, -25], [11, -40], [52, -51], [2, -34], [59, -32], [86, 27]], [[24618, 20098], [48, -10], [53, -67], [93, 19], [37, -25], [15, -128], [24, -45], [68, -49], [26, 9], [36, 61], [50, 6], [26, -65], [37, 52], [48, -12], [-57, -51], [-4, -65], [-38, -4], [-3, -47], [58, -31], [-15, -55], [60, -54]], [[25180, 19537], [-32, -142], [-22, -31], [-4, -100], [-32, -27], [-35, -129], [-33, -4], [-24, -45]], [[24998, 19059], [-85, -45], [-2, -63], [-80, 3], [-73, 66], [-63, -12], [-116, -58], [-12, -51], [-68, 1], [-57, 36], [-24, -26], [-5, -92], [-70, -7]], [[24343, 18811], [-63, 62], [-43, -41], [-39, 10], [-41, 51], [-42, 0], [-49, 146], [-65, -7]], [[24001, 19032], [24, 64], [29, 142], [-27, 9], [-23, 130], [8, 34], [-61, 49], [6, 64], [53, -23], [21, 43], [22, 168], [-66, 48], [-16, 95], [17, 54], [-49, 53], [-18, 45], [56, 55], [-20, 49], [3, 71], [75, 18], [49, -56]], [[24084, 20144], [12, -28], [99, -28], [40, 35], [35, -17], [7, -58], [111, 2], [6, 40], [73, 9], [151, -1]], [[27990, 21813], [78, -9], [7, -107], [29, -26], [111, -53], [43, -106], [2, -67], [-48, -12], [14, -78]], [[26772, 21032], [-13, 127], [-21, 59]], [[26738, 21218], [82, 42], [-8, 57], [56, 27], [7, 59], [-75, 73], [-25, 59], [-79, 26], [44, 80], [-54, 21], [-32, 44]], [[26654, 21706], [53, 12], [17, 28], [-72, 46], [54, 105], [72, 12], [41, -27], [39, 30], [28, 79], [53, 48]], [[27124, 22006], [-4, -27], [34, -85], [-7, -72], [-58, -19], [-19, -48], [27, -53], [36, -6], [-5, -91], [60, -39], [81, -7], [1, 47], [76, -4], [82, -31], [113, -12], [4, 40], [-24, 61], [33, 59], [86, 8], [100, -13]], [[21972, 17070], [50, -97], [-5, -85], [46, -17], [28, -38], [58, -7], [69, -85], [0, -41], [36, -74]], [[22079, 16002], [-65, 21], [-83, 0], [-48, 34], [-152, -15], [-16, 26], [-61, 23], [-6, -37], [-52, -22], [-14, -54], [-51, -11], [-21, -33], [-55, -21], [-40, 14], [-75, -18], [-78, 27], [-27, -15], [-35, 52], [-29, -3]], [[21184, 16635], [48, 18], [15, 78], [-52, 21], [-20, 70], [2, 53], [-42, 52], [57, 42], [-21, 25], [16, 98], [28, 10], [39, 57], [3, 37]], [[21257, 17196], [93, -90], [46, 14], [12, -120], [70, -29], [50, 41], [60, -27], [57, 15], [14, 27], [94, 5], [-12, 55], [66, 23], [16, 27], [63, -37], [86, -30]], [[30389, 18603], [-50, 9], [-70, -25], [2, -64], [-77, 26], [-65, -34]], [[29788, 18559], [-25, -3]], [[29763, 18556], [-2, 50], [69, 73], [-31, 32], [3, 38], [-31, 48], [-75, 69], [-9, 155], [-40, -49], [-36, -6], [-39, 29], [-30, 97], [-33, 2], [-75, 74]], [[29434, 19168], [-19, 38], [-51, 27], [-9, 48]], [[29355, 19281], [44, 14], [66, -17], [-5, 67], [68, -44], [21, 52], [61, 42], [12, 53], [-35, 34], [66, 67], [10, 46], [63, -4], [40, 21], [32, 87], [59, -10], [17, -50], [42, -38], [113, -45]], [[30029, 19556], [21, -77], [-34, -105], [48, -45], [82, 38], [17, -19], [82, 18], [82, -80], [52, -8]], [[30379, 19278], [-54, -55], [-16, -73], [-59, 10], [0, -73], [47, -19], [42, -52], [19, 34], [43, -59], [-9, -56], [47, -53], [4, -122], [29, -40], [-11, -103]], [[30461, 18617], [-72, -14]], [[29190, 16533], [-67, -5], [-78, 16], [-50, 33], [-101, -7], [2, -120], [-37, 2], [-36, -66], [-83, -22], [-29, -41], [-59, 41], [-49, -53], [-107, 29], [-47, -45], [-71, -26], [-9, -62], [-32, -24], [-21, -97], [-93, 7], [-79, -62], [-74, -3], [-69, -39], [-72, -86], [-38, 11]], [[27891, 15914], [-58, 41], [-18, 45], [-37, -12]], [[28099, 16425], [139, -10], [2, -51], [57, -22], [56, 73], [23, 49], [-22, 41], [-4, 188], [-31, 3], [-4, 67], [48, 14], [-14, 61], [51, 59], [-25, 72], [6, 29]], [[28381, 16998], [67, 7], [44, -55], [-16, -41], [104, -95], [98, 23], [41, 70], [86, 33], [54, -19], [80, 48], [45, -6], [37, -48], [78, -16]], [[29099, 16899], [35, -139], [39, 11], [-10, -122], [34, -46], [-7, -70]], [[29281, 17009], [25, -20], [113, -2], [52, -72], [176, -92], [-26, -32], [16, -45], [6, -116], [-24, -208], [11, -34], [92, -65], [96, -105], [24, -58]], [[29842, 16160], [-40, -91], [-23, 0], [-22, -85], [-39, -74], [-45, 39], [-88, 7], [-30, 52], [-100, -28]], [[29455, 15980], [-3, 44], [-40, 13], [5, 113], [-36, 11], [-15, 55], [-61, -10], [-104, 5], [-126, -5], [1, 48], [37, 104], [64, 64], [17, 54], [-4, 57]], [[29099, 16899], [22, 129], [59, 27]], [[29180, 17055], [101, -46]], [[24224, 29011], [-31, 10], [-18, 76], [-34, -19], [-75, -2], [-16, 85], [-28, 3]], [[24022, 29164], [-38, 39], [-1, 44], [83, 36], [27, 40], [59, 14], [23, 34], [49, -4]], [[24224, 29367], [29, -53], [53, -24]], [[12326, 21955], [-22, -45], [110, -77], [-25, -27], [33, -70], [-33, -125], [-45, -21], [-43, -91], [14, -21], [-7, -138], [-36, -11], [-64, -76], [-36, 7], [-30, -41], [17, -116], [-103, -145], [-33, 24], [-60, -21], [-108, -4], [-42, -43], [-34, 7], [-22, -50], [-100, 22], [-114, -17], [-81, -45], [-43, 53], [-47, -5], [-23, -45], [-79, -13], [-71, -48], [-36, 67], [-48, -44], [17, -61], [45, -4], [100, 39], [33, -67], [52, -23], [6, -43], [43, -75], [78, -33], [28, -47], [57, -43], [7, -52], [58, -20], [-12, -92], [19, -36], [-19, -66], [-43, -46], [4, -45], [-70, -59], [-22, 23], [-102, 24], [-20, -41], [-79, 19], [-52, 88], [-33, -47], [50, -94], [-6, -57], [-76, -40]], [[11178, 19898], [-27, 58], [13, 23], [-10, 84], [-50, 10], [-27, 33], [-70, -5], [-46, 29], [-143, -65], [-52, -9], [-113, 37], [-36, -48], [-61, -11], [-114, 65], [-85, -42], [-54, -2], [-39, 34], [-176, 77], [-107, 11], [-38, -15], [-72, 44], [-138, 16], [-60, -67]], [[9673, 20155], [-44, 81], [-51, 34], [-3, 88], [-57, 70], [-4, 63], [19, 68], [-48, 47], [5, 24], [-86, 61], [33, 45], [-8, 67], [-37, 35], [16, 106], [76, 12], [-3, 40], [-45, 112]], [[9436, 21108], [80, 17], [47, 83], [57, 24], [38, -11], [55, 43], [103, -25], [199, 205], [54, 16], [37, -34], [13, -64], [66, 9], [52, -72], [94, 55], [20, 60], [76, 41], [-45, 62], [64, 28], [-12, 85], [-54, 50], [13, 87], [105, 90], [54, -34], [75, 39], [52, -3], [27, 33], [49, 137], [-46, 0], [-12, 74], [-23, 13], [0, 94], [27, 18], [23, 69], [-23, 92], [44, 5], [225, -28], [89, -19], [61, 2], [84, 57], [73, -14], [124, 45], [224, -10], [125, 7], [60, -7], [91, -39], [64, -5], [25, -34], [21, -96], [171, -178], [144, -120]], [[26287, 20151], [-117, 114], [-78, 117], [-45, 50], [-42, 85], [-92, -48], [-46, 38], [-37, -130], [-8, -136], [-40, 3], [-44, 43], [-17, 62], [-51, 65], [-81, -22], [-24, 22], [-61, -26], [-60, 85], [-36, 17]], [[25408, 20490], [13, 62], [49, 42], [138, 71], [39, -31], [38, 50], [1, 67], [87, 27], [92, -6], [24, 81], [-82, 120], [-98, 47], [-29, 78], [-74, 75], [-9, 47], [53, 27], [-13, 41], [90, 32]], [[25727, 21320], [61, -17], [47, 21], [105, -10], [13, 45], [59, -56], [57, 40], [29, -75], [-15, -34], [34, -45], [85, 19], [26, -25], [123, 92], [19, -11], [76, 73], [95, -19], [24, -59], [72, -10], [101, -31]], [[21986, 25980], [-24, -68], [-43, -24], [-45, 33], [-43, -12], [-42, 40], [-63, 7], [-71, -22], [-35, 70], [-71, 24], [-33, 54], [27, 97], [-97, 112]], [[21446, 26291], [85, 61], [46, 9], [-55, 63], [-41, 129], [-74, -20], [-38, 117], [17, 80], [62, 31], [34, 97], [-23, 31], [31, 70], [-20, 96], [67, -23], [27, 30], [87, -1], [56, 19], [57, 44], [-44, 56], [62, 18], [88, 72], [40, 14], [39, -34], [47, 64], [22, 57], [33, -43], [40, -9]], [[22091, 27319], [56, -62], [-10, -29], [15, -85], [-21, -21], [25, -66], [76, -99], [-40, -89], [92, -17], [126, -8], [6, -33], [64, -75], [63, -33]], [[29305, 18800], [13, -73], [147, -119], [68, -10], [17, -21], [-32, -88], [28, -98]], [[29546, 18391], [16, -178], [34, -41]], [[29500, 17943], [-96, 120], [-122, 76], [-86, -42], [-41, -3], [-44, -55]], [[29149, 18915], [8, -106], [59, -36], [54, 47], [35, -20]], [[21554, 19179], [58, -62], [39, -10], [52, -80], [17, 1], [89, -96], [106, -54], [24, -38], [3, -79], [30, -75], [-45, -57], [39, -85], [66, -19], [57, -39], [-19, -59], [-72, -33], [44, -54], [19, -89]], [[22061, 18251], [-28, -57], [-52, -15], [-51, 27], [-56, -39], [-15, -88], [-34, -7], [-61, 52], [-35, 65], [-45, -54], [-38, -5], [-26, -58], [9, -59], [-28, -76], [-113, -9], [-84, 13], [-49, -13], [-48, 33]], [[21307, 17961], [13, 53], [-2, 108], [33, 60], [-3, 71], [31, 19], [-14, 45], [-105, 36], [3, 84], [-18, 16], [-25, 87], [-65, 97], [-7, 78]], [[22899, 9687], [-60, 12], [-167, -12], [-109, 53], [-190, -31], [-150, 8], [-33, -19], [-139, 28], [-54, 27], [-130, -6], [-93, 5], [-71, -38], [-104, 43], [-20, 40], [-131, 40], [-171, 25], [-104, 43], [-427, 205], [-126, 52], [-208, 120], [-59, 39], [-38, 0]], [[20315, 10321], [-21, 137], [10, 162], [18, 80], [48, 83], [58, 162], [5, 43], [36, 44], [137, 52], [20, 42], [55, -1], [47, 32], [91, 10], [85, 31], [18, -15], [111, 88], [-10, 60], [52, 118], [64, 4], [93, 32], [18, 35], [115, 111]], [[21365, 11631], [39, -17], [55, -61], [39, -76], [50, -25], [-16, -78], [45, -26], [-30, -59], [75, -36], [19, -27], [78, -16], [29, -35], [59, -26], [2, -27], [87, -8], [-3, -52], [75, -31], [193, 18], [19, -32], [54, 60], [118, -5], [37, 55], [33, 4], [38, 65], [57, 22], [44, 54], [76, 0], [57, 16], [20, -36], [87, 50], [110, 2], [57, 39], [28, -47]], [[9387, 8531], [-77, -58], [-64, -62], [-81, -38], [-51, 23], [-82, -38], [-71, -62]], [[8961, 8296], [-93, -6], [-93, -49], [-53, -80], [-58, -29], [-62, -57], [0, -44], [-30, -42], [-74, -16], [-74, -35], [-145, -107]], [[6331, 8263], [54, 12], [56, -30], [25, 69], [92, -25], [16, 44], [39, 15], [68, -7], [79, 44], [-2, 38], [103, 35], [101, 0], [28, -23], [104, 30], [23, 42], [-23, 82], [11, 74], [-57, 17], [-10, 59], [15, 53], [1, 179], [-30, 88], [-38, 46], [-30, 84], [0, 62], [51, 111], [-35, 222], [19, 67], [-60, 284], [-78, 345], [-85, 262], [-444, 353]], [[6725, 14209], [89, -28], [76, 16], [72, -21], [78, 60], [74, 24], [31, 70], [34, -3], [38, -61], [106, -22], [97, 15], [91, -54]], [[7511, 14205], [47, -56], [24, -59], [39, -30], [18, -62], [32, -19], [73, 5], [61, -43], [38, 30], [136, -17], [34, -32], [83, 5], [15, 34], [77, -22], [92, 23], [43, -44], [68, 6], [93, -43], [58, 16], [20, 69], [118, -21], [23, 12], [136, -4], [8, -20], [121, 15], [56, -20], [64, 14], [94, -7], [20, 32], [52, 0], [13, 61], [103, 84], [40, -37], [56, 6], [30, 48], [41, 2], [67, 66], [61, -27], [56, 54], [54, 32], [25, 37], [160, 88]], [[9960, 14381], [154, 37], [4, -56], [49, -33], [20, -60], [66, 20], [-4, 32], [66, 49], [62, 11], [60, 28], [70, -3], [89, 23], [71, 50], [43, 65], [52, -6], [52, -59], [56, 24], [18, -59]], [[10888, 14444], [5, -50], [-27, -17], [20, -50], [-29, -26], [24, -126], [-12, -57], [-116, -30], [-58, -31], [-15, -64], [24, -115], [113, -90], [72, 15], [108, -67], [117, 9], [-5, -127], [-54, -42], [7, -61], [-33, -43], [-13, -111], [-22, -29], [-65, -3], [-56, -57], [17, -32], [-62, -71], [-153, -104], [26, -189], [40, -184], [34, -100], [-98, -5], [-37, 64], [-45, -8], [-46, -97], [48, -57], [-66, -14], [2, -70], [32, -8], [143, 41], [49, -49], [95, -21], [27, -58], [51, 15], [163, -10], [192, -22], [96, -42], [36, 3], [137, -28], [47, 10], [144, -48], [120, -4], [60, -28], [86, 6], [10, -79]], [[12021, 12083], [-40, -44], [16, -134], [136, -85], [49, -51], [69, -118], [48, -106], [50, -141], [60, -209], [104, -143], [30, -202], [12, -8], [365, -8], [161, 11], [21, -39]], [[30613, 17845], [-43, 8], [-19, -32], [-68, 1], [-12, 91], [14, 40], [-2, 81], [-49, 39], [-53, -16], [-25, -41], [-56, 4], [-44, -23], [-29, 48], [-45, -15], [-13, 40], [17, 120], [-53, 44]], [[30389, 18603], [-15, -70], [-8, -141], [52, -172], [56, 30], [105, -5], [49, -13], [133, 62], [7, -36], [-56, -56], [37, -52], [45, -111], [-52, -84], [-95, 30], [-1, -110]], [[30646, 17875], [-33, -30]], [[24414, 21502], [124, -48], [79, -20], [4, -35], [45, -21], [86, 8], [94, -36], [68, -71], [66, 3], [49, -23], [127, 4], [14, -35], [82, 26], [73, -12], [104, -79], [8, -78], [-28, -32], [-19, -90], [-10, -110], [-43, -26], [28, -63], [-10, -67], [45, -108], [-13, -73]], [[25387, 20516], [7, -81], [-82, -23], [-9, -33], [-81, -11], [4, -51], [-89, -45], [-32, -43], [-37, -1], [-86, -50], [-42, 33], [-96, -3], [-19, -24], [-65, 1], [-99, -42], [-43, -45]], [[24084, 20144], [48, 24], [-34, 61], [34, 59], [50, 15], [12, 58]], [[24194, 20361], [31, 42], [96, 21], [35, -19], [128, 17], [19, 43], [74, 15], [68, -8], [57, 72], [-10, 99], [-31, 3], [-17, 56], [1, 92], [-50, -9], [-38, 25], [-29, 61], [-50, 26], [-26, -18], [-72, 47], [51, 51]], [[24431, 20977], [40, 24], [-15, 44], [126, 160], [-85, 111], [49, 12], [-27, 50], [-105, 124]], [[22023, 15718], [-33, -54], [1, -40], [-107, -47], [-88, -16], [-56, 15], [-24, -27], [-67, 9], [-18, 36], [-50, 3], [-67, -50], [-88, -94], [-80, -42]], [[20492, 15388], [-20, 19], [15, 132], [-86, 54]], [[26059, 16870], [-38, -35], [-57, 20], [-56, -35], [-12, -83], [29, -51], [-20, -78], [-95, -59], [-59, 15], [-29, -19], [-41, -118]], [[25681, 16427], [-49, -25], [-106, 6], [-57, -33]], [[25469, 16375], [-72, 21], [-21, -14], [-60, 67], [11, 43], [49, 61], [-9, 66], [-41, 40], [6, 36], [-30, 56], [15, 49], [-72, 48], [-30, -21], [-60, 32], [-12, 71]], [[25959, 17376], [83, -36], [80, 4], [-20, -73], [15, -100], [31, -48]], [[26148, 17123], [-155, -1], [5, -66], [31, -10], [17, -69], [47, -34], [-34, -73]], [[21307, 17961], [-120, 32], [-31, 30], [-50, -46], [-123, -21], [-78, -58], [22, -49], [-32, -45], [-55, 25], [-100, 21], [-16, 56], [-56, 0], [-65, 49], [-48, -25], [-41, -153]], [[20514, 17777], [-50, -16], [-24, 82], [45, 82], [-60, 22], [-15, 26], [-164, 75], [-56, -48], [-83, 40], [-45, -43], [-74, 16], [-23, -33], [-48, 5]], [[19917, 17985], [-14, 53], [29, 40], [66, 26], [15, 112], [77, 36], [54, 48], [24, 43], [79, -53], [95, -9], [15, 47], [-21, 50], [35, 80], [-26, 25], [-11, 59], [-35, 17], [25, 92], [-11, 42], [59, 38], [30, 137], [89, 90]], [[21813, 19933], [-39, 16], [-67, -99], [31, -31], [-76, -21], [-86, -4], [34, -49], [-15, -45], [-77, -18], [-19, -62], [-147, -88]], [[20858, 19848], [-14, 34], [32, 57]], [[20876, 19939], [79, 49], [49, 12], [-1, 41], [71, 35], [55, -34], [37, 2], [26, -56], [43, 16], [43, -23], [45, 28], [-7, 46], [66, 92], [17, 73], [44, 12], [93, -9], [50, -48], [24, 40], [40, -21], [111, -150], [52, -111]], [[26909, 25839], [28, -42], [-3, -153], [55, 10], [6, -87], [-59, -55], [-83, -103], [16, -37], [56, -52], [80, -31], [3, -136]], [[27008, 25153], [-39, -8], [-98, 12], [-41, 27]], [[26830, 25184], [-84, 82], [-49, 24], [13, 75], [-24, 30], [-38, -25], [-57, 13], [-80, -31], [-14, 55], [-40, 45], [-68, 45], [1, 45], [-168, 63]], [[26568, 26155], [139, 82], [27, 59], [33, 11], [33, 51], [27, -1]], [[26827, 26357], [40, -22], [-25, -88], [-35, -63]], [[26807, 26184], [-93, -113], [-5, -42], [-37, -81], [16, -58], [125, -65], [96, 14]], [[22609, 15506], [-75, -92], [10, -80], [-16, -133], [47, -40], [30, 7], [33, -72], [-4, -49], [19, -52], [-49, -96], [29, -29], [11, -71], [-40, -8], [-23, -41], [-41, -1], [-35, -31], [-29, 40], [-36, -25], [-41, -78], [-192, -27], [-37, -21], [-66, -107], [-161, -68]], [[21943, 14432], [-90, 4], [-2, -31], [-161, -49], [-17, -143]], [[27419, 12329], [12, 27], [69, 59], [78, 23], [11, 48], [-38, 25], [19, 62], [47, 28], [-10, 29], [32, 41], [92, -2], [42, -116], [44, -24], [-11, -86]], [[23892, 15188], [-26, -22], [-1, -77], [-36, -84], [-18, -73], [16, -81], [-14, -70], [24, -131], [-9, -70], [-51, -68], [13, -55], [-30, -43], [-3, -104]], [[23760, 14247], [-100, 3], [-57, -28], [-38, 39], [-67, -54], [-41, -97], [31, -94], [-68, -25], [-76, 32], [-28, -13], [9, -61], [-30, -62], [-50, 8], [-59, -16], [-55, -49], [-22, 34], [-53, 29], [-17, 41], [-114, 69], [-38, -14], [-167, 78], [-5, 70], [-66, 71], [43, 23], [-23, 54], [-59, -12], [-18, -34], [-79, 45], [5, -151], [-46, -97], [-34, -27], [-21, -53], [-125, 50], [32, 48], [-29, 85], [-63, -17], [-10, 51], [-54, 6], [-41, 38], [-46, -27], [-26, -89], [-36, -21], [-64, 84], [13, 57], [-24, 42], [32, 95], [1, 51], [-34, 23]], [[22779, 15667], [36, -17], [42, -63], [2, -33], [42, -65], [86, -30], [18, 42], [111, 3], [64, 28], [-8, 25], [29, 84]], [[23201, 15641], [31, -74], [48, -2], [58, 26], [75, -32], [54, 23], [82, -1], [126, -68], [44, -67], [-81, -123], [80, -5], [57, -42], [26, -46], [91, -42]], [[36251, 7049], [-38, 13], [-50, 52], [-88, -45], [-61, 66], [-30, 10], [-33, -41], [-138, -71], [-54, 6], [-50, -23], [-142, -221], [-85, 37], [-47, 98], [-34, -7], [-27, -84], [-56, -48], [-51, 33], [-42, 117], [-148, 31], [-75, 81], [-64, 0], [-16, 32], [25, 55], [20, 95], [-121, 83], [-43, -19], [-37, 21], [-34, -30], [-55, -96], [-37, -14], [3, -41], [-40, -19], [-6, -45], [-50, -30], [-93, -138], [-44, -31], [-30, -86], [-4, -91], [-48, -72], [-56, -19], [-44, 56]], [[34207, 8042], [57, 13], [49, 84], [47, 19], [56, 63], [20, 55], [-3, 54], [-61, 89], [-32, 9], [113, 137], [82, 90]], [[34535, 8655], [15, -13], [229, -46], [79, 2], [11, -30], [54, 3], [19, -34], [120, 9], [64, -120], [37, -9], [45, -66], [-26, -43], [19, -102], [114, -77], [74, 39], [21, -77], [62, 17], [19, -39], [-23, -74], [7, -101], [-18, -21], [20, -148], [-11, -69], [21, -41], [49, 17], [82, -30], [33, 66], [70, -20], [7, 79], [29, 82], [81, 46], [67, 58], [53, -7], [50, -54], [-39, -59], [-46, -15], [-71, 6], [20, -52], [119, -94], [25, 10], [64, -56], [93, -1], [8, -50], [58, -13], [14, -28], [-42, -55], [5, -43], [37, -57], [-21, -84], [24, -33], [-8, -77], [20, -36], [-17, -66]], [[27119, 15816], [-31, -80], [-104, -39], [-23, 18], [-137, -11]], [[26824, 15704], [-46, 35], [15, 53], [-36, 23], [-48, -32], [-73, 29], [-74, -15], [-123, 31], [-29, -12]], [[26410, 15816], [-19, 129], [-1, 121], [-15, 11], [-26, 116], [-34, -17], [-15, 57], [-71, -8], [-15, 40], [11, 68]], [[26225, 16333], [57, 27], [33, 39], [50, -11], [22, 37], [94, -39]], [[27363, 10634], [-49, -34], [-6, -60], [-44, -56], [-5, -64], [-33, -41], [7, -51], [-50, -35], [-58, -10], [-47, -64], [-13, -61], [-32, -34], [0, -53], [72, -82], [9, -30]], [[27114, 9959], [-46, 4], [-7, -40], [-61, -98], [-55, 19], [-35, 44], [-49, 20], [-19, 34], [-71, 55], [-136, 73], [51, 75], [-72, 26], [-104, -28], [-46, 15], [-76, -18], [-15, -109], [8, -102], [-20, -100], [-36, -73], [-35, -31]], [[26290, 9725], [-31, 31], [-98, -6], [-49, 14], [-23, 69], [29, 48], [-45, 33], [-66, 18], [-16, 48], [-54, 77], [38, 132], [-7, 53], [-119, 37], [-61, 40], [-33, 64], [49, 14], [-22, 73], [61, 30], [9, 63], [-54, 19], [-12, 42], [-38, 21], [103, 93], [6, 30], [63, 69], [-5, 43], [30, 51]], [[24194, 20361], [-74, 58], [-44, -14], [-13, 44], [-49, 27], [-121, -95], [-101, -28], [-35, 17], [-110, -1], [-60, 20], [-13, 60], [-37, 25], [7, 41]], [[23544, 20515], [19, 56], [71, 145], [68, -62], [28, 82], [42, 46], [39, -22], [24, 42], [-18, 48], [20, 56], [34, -8], [115, 43], [0, 44], [31, 25], [-25, 43], [64, 63]], [[24056, 21116], [53, -2], [60, -74], [6, -35], [94, 78], [64, -3], [51, -41], [-5, -40], [52, -22]], [[18266, 13414], [-32, 5], [-27, -58], [-76, -10], [-49, 31], [-48, -27], [-32, 23], [-127, -3], [-39, 20], [12, -102], [53, -53], [-31, -31], [-37, -107], [59, -3], [50, -63], [106, -101], [22, -57]], [[18070, 12878], [-60, -26], [-41, 27], [-35, -48], [-96, -45], [-52, -13], [4, -60], [-61, -9], [-25, -74], [13, -65], [-64, 37], [-100, 27], [-1, -77], [-60, 13], [-19, -339], [-133, 1], [-66, -16], [-41, -54], [-74, -23], [-5, -82], [-38, -68], [-78, -17], [-54, -49], [-67, -19], [-68, -50], [-80, -33], [-127, -3]], [[16642, 11813], [-44, -19], [-103, 7], [-58, 49], [-64, 1], [-66, -24], [-44, 41], [-13, 83], [-61, 12], [-3, 53], [86, 5], [39, -20], [57, 78], [72, 64], [62, 87], [-16, 81], [-102, 28], [-74, -23], [-19, -61], [-107, -32], [-51, -35], [-34, -47], [-74, -22], [-68, -50], [-36, 9], [-15, -54], [1, -75]], [[15564, 11879], [-31, 67], [-160, -7], [-7, 50], [-33, 38], [-8, 47], [39, 44], [-12, 68], [25, 33], [-87, 57], [-43, 54]], [[15247, 12330], [63, 63], [122, 72], [0, 31], [80, 32], [63, 53], [61, 21], [49, 64]], [[15685, 12666], [107, -80], [-3, -36], [37, -88], [69, 16], [24, 52], [84, 32], [34, -18], [84, -105], [90, 44], [40, 46], [84, 33], [-15, 39], [89, 93], [89, 57], [48, 103], [50, 12], [27, 76], [66, 49], [-2, 21], [72, 32], [120, 82], [72, 29], [55, 60], [6, -93], [-93, -126], [44, -32], [108, 66], [45, 99], [88, 53], [54, 17], [49, -13], [62, 13], [68, 80], [73, -1], [-9, 133], [34, 3], [84, 61], [44, 77], [48, 13], [48, 42], [68, -72], [98, 47], [40, 57], [-8, 29], [80, 24], [14, 50], [62, -55], [64, 13], [57, 71]], [[18234, 13771], [16, -83], [59, -109], [-18, -59], [-37, -33], [63, -44], [-51, -29]], [[29288, 15935], [-79, 19], [-77, 46], [-2, -61], [-28, -15], [24, -62], [-74, -13], [3, -72], [-127, 0], [-68, 29]], [[28860, 15806], [8, 106], [-81, -14], [-55, 79], [-68, -1], [-78, -78]], [[28586, 15898], [-77, 26], [-5, 79], [-24, 10], [-48, -53], [-31, -104], [-45, -4], [-1, -54], [-24, -46], [-36, -10], [-23, -66], [-78, -33], [-62, 13], [-95, -5], [-119, 52], [-18, 35]], [[27900, 15738], [5, 85], [-14, 91]], [[29455, 15980], [-6, -68], [-39, 22], [-44, -12], [-36, 33], [-42, -20]], [[15012, 24066], [-111, 91], [-33, 1], [-46, -49], [-37, 94], [-47, 65], [-20, 54], [3, 89], [48, 55], [-73, 3], [-88, 55], [-18, 37], [-6, 96], [-31, 144], [99, -7], [31, 76], [-42, 56], [55, 10], [-17, 144], [-72, 55], [-9, 36], [-44, 16], [-35, 45], [81, 60], [58, -1], [73, -73], [30, 7], [44, -49], [63, -11], [48, -31], [133, -27], [53, 13], [193, -11], [49, 39], [75, -27]], [[28237, 13415], [52, -106], [111, -44], [12, -105], [-21, -56], [-16, -104]], [[28375, 13000], [-14, 61], [-37, 74], [-68, 3], [-47, 26], [-132, 8], [-156, 20], [-36, 34], [-5, 40], [-119, 173], [-56, 63], [-53, -14], [-29, -39]], [[27623, 13449], [-25, 17], [5, 63], [-74, 91], [-121, 52], [3, 82], [-37, 33], [-25, 126]], [[27349, 13913], [-45, 62], [-6, 64]], [[27298, 14039], [108, 11], [113, -4], [50, -37], [31, -89], [68, 36], [67, -10], [27, 21], [-39, 133], [16, 36], [16, 118], [-3, 66], [108, 94]], [[27860, 14414], [47, -24], [-13, -74], [47, -78], [35, -19], [15, -56], [63, -53], [-5, -71], [53, -19], [-11, -60], [-53, -65], [29, -31], [-21, -59], [76, -24], [10, -56], [-21, -63], [-38, -56], [14, -88], [46, -6], [16, -40], [48, -10], [40, -47]], [[20288, 19656], [-30, -37], [-90, -48], [-49, -119], [-37, 6], [-33, -42], [-3, -56], [-36, -39], [-68, -143], [-16, -57], [-50, -24], [0, -36], [-41, -33], [-30, 51], [-95, 0], [-101, -114], [-32, -3], [-9, -58], [-31, -53], [-2, -41]], [[19535, 18810], [-73, 11], [-104, 105], [-28, 105]], [[19330, 19031], [41, 12], [44, 53], [-25, 47], [26, 63], [55, 46], [16, 68], [94, 90], [6, 72], [123, 5], [77, -39], [39, 12], [5, 45], [125, 49], [11, 41], [53, 48], [52, 116]], [[20072, 19759], [48, -32], [42, 82], [55, -7]], [[20217, 19802], [51, -86], [20, -60]], [[25693, 12047], [-33, 75], [-104, 34], [-122, 20], [-44, -44], [-37, 38], [-58, 23], [-73, 103], [-41, 1], [-16, 38], [-86, 43], [-48, -39], [-50, 41], [-113, -15], [-4, -40], [-52, -44], [-15, -37], [-58, 11], [-42, -72], [-26, -75], [-60, -44], [65, -33], [-50, -58]], [[24308, 11966], [0, 114], [-34, 24], [-6, 41], [-45, 16], [-76, -1], [-24, 49]], [[24123, 12209], [45, 46], [18, 58], [-32, 70], [-9, 71], [-101, 88], [21, 36], [4, 77], [-37, 95]], [[25479, 12927], [37, -6], [51, -47], [89, -55], [77, -1]], [[25733, 12818], [4, -32], [164, -185]], [[24541, 21817], [-38, -23], [-48, 3], [-59, -68], [20, -28], [-46, -50], [-30, -87], [74, -62]], [[24056, 21116], [-71, 120], [-17, 62], [-56, 76], [-16, 50], [7, 57], [-31, 41], [75, 53], [-23, 27], [9, 50], [37, 51], [-46, 32], [-45, 159], [-57, 64], [-35, -43], [-67, 11], [-75, -63], [-33, 3], [-8, 60], [-50, 45], [1, 54], [-31, 37], [-60, -9], [-72, 81]], [[23392, 22134], [36, 30], [-8, 83], [-104, 102], [-4, 41], [-54, -20], [-70, 55], [-15, 44], [-43, 53], [-39, 6], [-49, 48], [8, 47], [-28, 35]], [[23022, 22658], [-61, 38], [62, 62], [49, -16], [47, -66], [68, -26], [-7, 47], [71, -19], [27, -44], [88, -16], [72, 32], [2, 36], [47, 8], [33, 89], [-86, 59], [58, 7], [0, 65], [-70, 67], [-92, 30], [46, 31], [45, 102], [-17, 64], [-37, 26], [-33, 110], [74, 14], [45, -9], [25, 108], [-12, 52], [28, 60]], [[23494, 23569], [126, 7], [58, 18], [-35, 60], [6, 36], [59, 1]], [[23708, 23691], [46, -40], [-34, -57], [16, -46], [57, -8], [15, -88], [40, -43]], [[23848, 23409], [16, -33], [10, -116], [-62, -73], [-54, -2], [16, -53], [-45, -65], [21, -32], [68, -45], [51, 24], [31, -105], [-21, -43], [24, -81], [52, -60], [25, -98], [81, -51], [50, -50], [49, 12], [11, -41], [64, -54], [40, -9], [35, -41], [15, -108], [-36, -50], [29, -48], [49, 1], [36, 40], [40, -33], [9, -57]], [[16222, 22990], [-29, -24], [-19, -79], [-5, -89], [-46, -55]], [[16123, 22743], [-51, 0], [-29, 33], [-60, -130], [-63, 70], [-49, -20], [-75, 11], [-13, -51], [-40, -35], [1, -73], [37, -107], [-8, -32], [-52, -15], [-12, -44], [9, -108], [-10, -58], [23, -32], [-59, -80], [24, -62], [-43, -51], [-7, -52], [8, -108], [-13, -71], [-44, -20], [-2, -62]], [[15595, 21646], [-58, 39], [-27, -15], [-143, 49], [-2, -113], [-39, -68], [-10, -53], [-48, 10], [15, 112], [-73, 24], [-23, 54]], [[15187, 21685], [14, 36], [-26, 99], [38, 40], [10, 42], [-28, 32], [38, 51], [1, 88], [35, 34], [17, 113], [40, 14], [44, -32], [37, -71], [80, 47], [84, 25], [-7, 169], [20, 12], [-9, 86], [-26, 31], [6, 115], [38, 24], [-26, 39], [12, 104], [-20, 24], [20, 46], [-16, 86], [22, 66], [-23, 51], [-1, 59], [-23, 116], [-41, 37], [-9, 56], [44, 51], [-14, 46], [-65, -19], [-44, 23], [24, 127], [51, 39], [11, 60]], [[24001, 19032], [-9, -25], [-70, -30], [-71, 75], [-46, 14]], [[23805, 19066], [16, 151], [-40, 25], [34, 86], [-7, 69], [-44, 94], [-46, -21], [-12, -56], [-104, 21], [-86, 53], [-50, 51], [-2, 38], [-97, 57], [-109, 95], [-38, -70], [-104, 91], [-41, -26], [5, -70], [-104, 23], [-80, 102], [-72, 11], [-38, -77], [-78, 97], [-50, -21], [-66, 24], [35, 100], [88, 86], [-6, 85], [-22, 65], [-6, 168], [-54, 0], [-49, 38], [99, 111], [25, -83], [40, -52], [46, 17], [14, 128], [116, 29], [54, 65], [-22, 34], [-3, 73], [51, 32], [-15, 72], [49, -9], [54, -58], [34, 33], [3, 123], [91, 79]], [[23214, 20949], [25, -18], [-13, -73], [68, -51], [-8, -73], [57, -138], [42, -24], [17, -40], [59, -30], [44, 26], [39, -13]], [[28096, 25630], [-9, -28], [-64, -29], [-51, -48], [-105, 21], [-51, 44], [-83, 1], [-71, 145], [-41, -32], [-11, -79], [-114, -88], [37, -51], [-37, -73], [-63, 3], [-54, -101], [-57, 6], [-59, -28], [-34, -82], [12, -53]], [[27241, 25158], [-65, -4], [-32, -33], [-136, 32]], [[26909, 25839], [167, 2], [134, 103], [13, 132]], [[27223, 26076], [24, 21], [48, -26], [78, 50], [30, 59], [101, -7], [26, 79], [34, 34], [-61, 87]], [[27503, 26373], [50, 38], [74, -18], [-27, -88], [41, -17], [72, 9], [69, -32], [13, -67], [51, -70]], [[27846, 26128], [-33, -72], [-45, -28], [-27, -79], [95, -60], [42, -44], [101, -49], [29, -40], [-6, -45], [94, -81]], [[19595, 19973], [73, -147], [70, 16], [19, -95], [62, -1], [57, -26], [61, 18], [13, 49], [59, 56], [72, -19], [-9, -65]], [[19330, 19031], [-74, 36], [-23, 31], [-70, 13], [8, 125], [-57, 127], [1, 60], [-38, 64], [-107, 71], [-32, -28], [-56, -5], [-40, 46], [-71, -3]], [[18771, 19568], [59, 56], [3, 91], [46, 54], [5, 40], [-51, 66], [6, 58], [-48, 54], [10, 71], [50, 12], [95, -48], [65, 35], [-10, 77], [25, 34]], [[19026, 20168], [65, -7], [94, -76], [129, -128], [106, 15], [36, 56], [36, -4], [47, 37], [26, -15], [30, -73]], [[30073, 17731], [105, -17], [46, -37], [59, -21], [45, 16], [65, -29], [25, -37], [54, 6]], [[30472, 17612], [15, -23], [4, -94], [-38, -28], [-14, -113], [60, -24], [-72, -120], [-25, -21], [-20, -85], [-43, 12], [-25, -41], [8, -48], [-50, -68], [-11, -48], [38, -63]], [[30299, 16848], [-16, -62], [-41, 6], [-33, -70], [-28, -13]], [[30181, 16709], [-23, -11], [-57, 34], [-142, 51], [8, 38], [-50, 32], [-9, 37], [54, 16], [11, 30], [62, 24], [44, 72], [-27, 44], [16, 135], [-90, 15]], [[29978, 17226], [53, 185], [-50, 44], [-1, 55], [-47, 34]], [[29161, 10716], [-42, -44], [-77, -22], [-64, -40], [-37, -47], [18, -42], [1, -82], [27, -49], [1, -50], [51, 5], [16, -60], [66, -57], [27, -81], [-11, -23]], [[29137, 10124], [-53, 18], [-176, 16], [-41, -50], [-38, 43], [-102, -13], [-146, 38], [-7, -76], [-39, -49], [-23, -69], [-108, -120], [0, -55], [51, -21], [51, 22], [11, -79], [-50, -42], [19, -41], [-37, -91], [-59, 59], [-8, -51], [-41, -10], [-1, -60], [-88, -40], [49, -45], [-37, -48], [10, -30], [-111, -87], [-52, -91], [-105, 53], [-97, -3], [-2, 60], [-27, 38], [-82, 1], [-63, 19], [-46, -9], [-53, 30], [-58, 59]], [[27578, 9400], [-3, 41], [25, 115], [-67, 6], [-1, 26], [61, 53], [-7, 83], [-89, 60], [-105, 18], [-37, -37], [-104, -11], [-57, 63], [-14, 65], [-40, -2], [-26, 79]], [[28819, 11024], [43, -78], [-31, -47], [50, -55], [49, 4], [29, -47], [63, -6], [77, -73], [62, -6]], [[29103, 21581], [-116, -24], [-75, 53], [13, -75], [-65, -75], [-111, -47], [-101, -78], [21, -46], [50, 4], [11, -36], [-25, -44]], [[28705, 21213], [-49, -47], [-51, 33], [-64, -17], [10, -56], [-25, -21]], [[28196, 22446], [49, -92], [-8, -38], [42, -30], [41, 6], [26, 69], [31, 23], [-25, 65], [22, 38], [-26, 145], [62, 48], [61, 66], [-20, 31], [52, 36], [52, -13], [57, -81], [58, 24]], [[28670, 22743], [7, -71], [-40, -57], [35, -42], [-16, -65], [44, -76], [53, -63], [117, -29], [131, -94]], [[32994, 9321], [-24, -85], [-78, 17], [-3, -60], [-37, -62], [2, -90], [-23, -34], [34, -41], [60, -108], [-115, -26], [-30, -31], [-22, -64]], [[32758, 8737], [-54, 12], [-3, -85], [-64, -45]], [[32637, 8619], [-75, 92], [-103, -8], [2, 63], [-81, 34], [-51, -21], [-3, 70], [-19, 29], [41, 57], [-15, 67], [-43, 20], [-54, 58], [-81, -24], [-84, 0], [-29, 47], [-43, 21], [-51, -14], [-56, 48]], [[31892, 9158], [-30, 24], [18, 82], [-34, 26], [1, 42], [69, -14], [32, 72], [-30, 56], [29, 31], [-36, 29], [21, 32]], [[31932, 9538], [39, 13], [60, -62], [45, -4], [96, 33], [58, -45], [48, 2], [35, 50], [17, 63], [56, 61], [29, -26], [82, 37], [57, -3], [60, -23], [44, -55], [-17, -91], [44, -66], [81, 20], [37, -30], [54, 8], [48, -17], [47, -64], [42, -18]], [[11368, 19577], [-45, -25], [-47, 1], [-55, -32], [-68, -5], [-46, -51], [-46, 79], [-58, -8], [-99, 20], [-16, -88], [-47, -5], [-2, -182], [56, -9], [-4, -55], [-93, -81], [4, -34], [-63, -8], [-42, 28], [-61, 6], [-69, -155], [-14, -194], [-45, -18], [-53, 35], [-65, -36], [-5, 104], [-34, 27], [-62, -54], [1, -33], [-44, -49], [-24, 29], [-55, -38], [-27, 8], [-163, 362], [32, 88], [-66, 41], [-127, 41], [-35, 32], [-80, 8], [-27, 76], [-53, 75], [-62, 55], [-4, 47], [-36, 15], [-95, -45]], [[9424, 19549], [-49, 20], [6, 84], [-14, 39], [20, 54], [-108, 122], [37, 49], [-32, 88], [98, 84], [102, 3], [88, 16], [101, 47]], [[11178, 19898], [-40, -8], [-100, -51], [-2, -50], [56, -3], [56, -36], [22, 16], [93, -95], [52, 4], [53, -98]], [[29005, 25655], [-96, 15], [-67, 60], [-48, -51], [-45, -7], [-12, -39], [41, -150], [18, -18], [-10, -82], [96, -48], [-1, 54], [123, -5]], [[29004, 25384], [-15, -31], [-47, -9], [-31, -109], [-25, -29], [-79, -29], [-31, -30]], [[28776, 25147], [-29, -31], [-84, 53], [-28, 92], [-141, -14], [-65, 28], [-50, -24], [-22, 117], [-55, 9], [-27, -30], [-48, 77]], [[28227, 25424], [57, 49], [0, 45], [74, -32], [36, 38], [-60, 135], [60, 37], [84, -2], [46, 64], [-6, 69], [64, 16], [67, 34], [86, -40], [5, 67]], [[28740, 25904], [80, -38], [65, 18], [70, -19], [76, -76], [-26, -134]], [[17359, 22622], [-23, 119], [88, 61], [1, 45], [71, 19], [24, 38], [-16, 45], [8, 55], [78, -39], [-30, 138], [-48, 0], [-3, 37], [45, 58]], [[17554, 23198], [52, 26], [78, 64], [17, 42], [-49, 34], [25, 69], [46, -16], [30, 22], [43, 94], [31, 25]], [[20585, 26043], [36, -103], [76, -43], [3, -28], [88, -92], [47, -24], [110, 50], [39, -14], [49, -74], [-14, -22], [33, -101], [-20, -63], [44, -37], [-46, -99], [-46, -56], [-41, -14], [-20, -73], [-72, 13], [-7, 59], [-73, 15], [-27, -40], [-84, 32], [-16, -78], [-74, 11], [-28, 82], [-151, -81], [-27, 43], [-59, -58], [48, -64], [-60, -64], [25, -38], [-66, -70], [-45, -27], [-54, 25], [-106, -31], [-93, 7], [1, 73], [-48, -9], [-60, -69]], [[19847, 24981], [-115, 19], [-12, 40], [-64, 16], [-128, -87], [-68, 29], [-40, -23]], [[19420, 24975], [-49, 20], [-57, 53], [-72, 133], [-96, 23], [-54, 74], [4, 31], [92, 124], [-40, 68], [-4, 128], [10, 18], [-53, 93], [38, 30], [62, -36], [4, 48], [57, 20], [12, 101], [67, 41], [17, 38], [-20, 53], [24, 46], [-7, 72], [11, 86], [-30, 32], [7, 55], [-23, 58], [17, 64], [59, 0], [26, -42], [0, -53], [59, -45], [135, 11], [-1, 30]], [[19615, 26349], [-3, 76], [63, 41], [124, -81], [48, -54], [76, 30], [45, -7], [28, -60], [72, -49], [-26, -34], [-19, -103], [45, -5], [13, -36], [231, -94], [29, 6], [27, -62], [51, -41], [36, 62], [46, 13], [45, 66], [39, 26]], [[24692, 29192], [81, -96], [25, -60], [52, -28], [27, -47], [71, -22], [23, -41], [10, -97], [45, -65], [42, -17], [16, -65], [42, -49], [-104, 10], [-44, 41], [-90, -19], [-37, -60], [-98, 4], [-81, -38], [-8, -79], [-96, -49], [-115, 63]], [[24453, 28478], [66, 62], [30, 71], [84, 82], [26, 51], [-45, 47], [-14, 114], [29, 13], [-10, 82], [-55, 24], [-43, -30]], [[24551, 29069], [67, 65], [44, 0], [30, 58]], [[26824, 15704], [-12, -33], [20, -119], [43, -16], [-6, -38], [54, -77]], [[26923, 15421], [-49, -38]], [[26503, 15326], [-53, 40], [-43, -46], [-132, -39], [-26, -95], [-39, -22]], [[25978, 15069], [-55, 15]], [[25923, 15084], [12, 78], [31, 83], [-31, 1], [-46, 55], [0, 41], [-78, 32]], [[25811, 15374], [48, 49], [27, 52], [9, 64], [39, 52], [8, 71], [32, 7], [43, 77], [-28, 90]], [[25989, 15836], [62, 19], [43, -12], [36, 28], [106, -22], [38, -52], [57, -5], [79, 24]], [[30659, 18557], [51, -77], [88, -33], [75, -103], [106, -69], [91, -37], [17, -47], [-12, -154], [-19, -60], [-74, -66], [-82, -24], [-21, -59]], [[30879, 17828], [-67, 52], [-56, 14], [-110, -19]], [[30461, 18617], [29, -36], [70, -18], [99, -6]], [[9424, 19549], [-45, -77], [1, -87], [-74, -51], [-40, -4], [-81, -49], [-72, -16], [-31, 22], [-42, -50], [-51, 9], [-19, -45], [-90, 30], [-54, -9], [-48, 44], [-23, -24], [-44, 15], [-47, -27], [-100, -15], [-65, 60], [-40, 70], [-38, -32], [27, -69], [-40, -71], [-82, -28], [-24, 34], [-50, -11], [-9, -35], [-45, -26], [-2, -74], [-70, -21], [-45, 6], [-102, -21], [-36, 31], [-83, -58], [-60, -10], [12, -80], [-69, -67], [-104, -15], [-63, -28], [11, -133], [-38, -63], [32, -53], [-25, -78], [-47, 28], [-17, 69], [-42, -28], [-11, -81], [-73, 17], [-66, 45], [31, 84], [4, 79], [48, 7], [28, 80], [-58, -14], [-62, 30], [-34, -31], [-37, 21], [6, 56], [-102, 19], [-16, -43], [-47, -13], [-21, -46], [20, -48], [-40, -247], [2, -85], [-78, -57]], [[6944, 18285], [-60, 26], [-1, -84], [-116, -39], [-42, 5], [-74, 39], [-12, 90], [21, 94], [-31, 47], [31, 53], [-41, 8], [-35, -24], [-27, 32], [24, 35], [54, 19], [36, 86], [-26, 95], [39, 38], [-60, 16], [-71, 49], [25, 23], [15, 75], [-59, -9], [-9, 111], [-48, -4], [-41, 23], [11, 63], [-111, 7], [-37, 35], [-56, -30], [-24, 29], [-8, 75], [-72, 20], [-27, -31], [-59, 8], [-140, -169], [-39, -107], [-88, -63], [29, -113], [-16, -80], [-50, -41], [-21, -105], [-65, -23], [-7, -53], [51, -63], [27, -106], [76, -83], [134, -86], [-57, -62], [16, -36], [-50, -39], [22, -78], [-6, -93], [-64, -39], [-102, -29], [-25, -32], [-63, -31], [5, -35], [51, 1], [110, -47], [53, 28], [90, -87], [27, -59], [-102, -37], [-13, -73], [-27, -32], [-37, 14], [6, 126], [-66, -35], [-81, -18], [-51, 42], [-50, -30], [-40, 28], [-156, -7], [-38, -38], [-36, 3], [-123, -23], [-68, -48], [7, -35], [-37, -59], [-67, 57], [-45, -39], [-78, 32], [-61, -32], [-15, 59], [-93, -10], [85, 109], [-17, 38], [7, 138], [-31, 43], [-50, 27], [-53, -6], [-36, 77], [0, 33], [56, 92], [33, 30], [45, 86], [73, 19], [10, 85], [-61, 98], [-52, 58], [-36, -46], [-47, -17], [5, -54], [-37, -70], [-29, -5], [-15, -89], [-98, 19], [-15, 117], [-41, 61], [18, 127], [-67, 10], [-24, -39], [-58, 9], [-87, -65], [-49, 57], [-25, 55], [-88, 53]], [[3996, 18430], [29, 16], [2, 48], [-30, 54], [52, 3], [73, 72], [24, -6], [50, 52], [57, 29], [20, 63], [61, 41], [28, 105], [61, 58], [52, -7], [13, 40], [50, 18], [16, 37], [39, -3], [65, 30], [25, 29], [65, 147], [27, 23], [-2, 90], [44, 45], [6, 46], [59, 50], [71, -58], [65, -1], [16, -35], [120, -1], [93, 61], [33, 140], [-17, 63], [37, 12], [-33, 122], [87, 45], [50, 43], [-5, 45], [31, 34], [47, -5], [52, 22], [33, 92], [106, 77], [95, -3], [66, -64], [39, 3], [50, 65], [-12, 44], [-72, 95], [-20, 80], [67, 18], [44, 53], [75, 19], [51, -39], [154, 55], [27, -62], [29, 59], [-3, 67], [65, 60], [19, 114], [47, 66], [-27, 36], [78, 49], [50, -23], [-23, -74], [59, -84], [39, -2], [2, 134], [145, 89], [49, -36], [37, -74], [55, -36], [103, 23], [19, 68], [51, 1], [48, 65], [74, 24], [45, 106], [73, 21], [32, -18], [34, 26], [81, -16], [43, 20], [71, 1], [54, 50], [48, 8], [89, -111], [100, 71], [40, -10], [52, 40], [34, -77], [81, 28], [64, -25], [51, 11], [64, -46], [40, 16], [19, -44], [56, -14], [16, 38], [59, 5], [54, 62], [19, 111], [-25, 61], [-26, 124], [-72, 76], [15, 32], [-16, 54], [15, 52], [71, 85], [-10, 40], [36, 45], [70, -1], [9, -39], [65, -23], [23, -42], [-48, -91], [15, -52], [45, -30], [-20, -30], [43, -48], [57, -103], [52, -38], [52, -9], [69, -77], [13, -46], [44, -47], [73, -52], [85, 6], [84, -47], [44, 53], [58, 2], [85, 54], [24, -41], [39, 31]], [[30081, 14904], [-94, -52], [-32, 19], [-41, -29], [-5, -80]], [[29909, 14762], [-46, -71], [-65, 36], [-18, -95], [-56, -7], [-51, 32], [-20, -77], [-65, 19], [-38, -10], [-2, -43]], [[29548, 14546], [-99, 37], [-60, 78], [-36, 117], [20, 41], [54, -5], [-1, 45], [-32, 48], [6, 38], [-41, 107], [-36, 45], [38, 29], [60, 5], [69, -18], [82, 22], [34, -52], [91, 35], [35, 61], [-5, 97], [30, 25]], [[29757, 15301], [59, -9], [47, 63]], [[29863, 15355], [73, -14], [202, -10], [70, 42], [59, -39], [-7, -106], [-19, -29], [-142, -111], [-75, -73], [7, -63], [50, -48]], [[19172, 24736], [-16, -61], [13, -56], [-46, -12], [-78, 39], [-42, -78], [18, -60], [-9, -63], [9, -97], [-117, 30], [-36, -63], [42, -101], [-6, -57], [95, -76], [35, -50], [13, -81], [49, -114], [-13, -29], [-98, -11], [-85, -51], [11, -50], [-22, -34], [24, -50], [-38, -64], [2, -43], [-54, -24], [-43, -41], [-40, -244]], [[18740, 23195], [-5, -8]], [[18123, 23478], [16, 48], [72, 54], [-29, 88], [15, 27], [-9, 72], [32, 18], [-21, 85], [25, 24], [-16, 52], [65, 51], [-7, 35], [24, 73], [-35, 60], [-65, 26], [19, 66], [29, 28], [-38, 72], [-20, 80], [-131, -3], [17, 53], [41, 13], [-17, 62]], [[18090, 24562], [45, 25], [16, 58], [-21, 148], [4, 54], [-69, 64], [90, 89], [41, -76], [45, 4], [58, -33], [56, -13], [17, 41], [44, -9], [20, 35], [89, -40], [-18, -37], [30, -96], [67, -83], [2, -81], [86, 1], [-14, 80], [45, 14], [-31, 84], [5, 72], [49, 54]], [[18746, 24917], [25, -18], [62, 22], [29, -83], [54, -16], [70, 29], [79, 55], [72, -67], [2, -54], [33, -49]], [[12072, 7080], [-56, -63], [-42, 33], [-99, -49], [-36, -52], [-77, -9], [-70, 11], [14, -49], [-43, -65], [-25, -108], [-41, -35]], [[11597, 6694], [-110, 40], [-152, 185], [-55, 86], [2, 51], [-656, -87], [-383, -54], [-300, -43]], [[9943, 6872], [-207, 501], [-4, 109], [-40, 84], [29, 3], [17, 53], [68, 76], [0, 88], [37, 59], [66, 55], [50, -51], [77, 43], [54, -37], [72, 75], [39, 11], [31, 50], [52, -5], [49, 79]], [[8736, 7132], [-5, 113], [-24, 97], [-33, 63]], [[8961, 8296], [24, -52], [95, -145], [-12, -52], [53, -32], [28, -50], [64, -34], [137, -155], [5, -98], [88, -87], [81, -39]], [[9624, 7186], [7, -84], [-89, -290]], [[9542, 6812], [45, -266]], [[23240, 29059], [-93, 117], [-132, 42]], [[23015, 29218], [80, 83], [69, 16], [38, -15], [111, 47], [44, 72], [-10, 52], [71, 14], [14, 50], [-16, 54], [28, 23]], [[23579, 29539], [-18, -79], [-82, -20], [-51, -95], [18, -64], [-84, -54], [4, -68]], [[15939, 20785], [-27, -72], [-3, -198], [-34, -75], [19, -143], [43, -95], [-20, -78], [10, -48], [-36, -71], [6, -40], [-13, -109], [2, -100], [-20, -59], [10, -60], [-22, -85], [43, -39], [-125, -155], [26, -70], [-61, -80], [-1, -27], [-68, -60], [10, -103], [54, -22], [35, 60], [101, -82], [-30, -61], [-81, -66], [-20, -37], [-85, -94], [-2, -49], [-57, -77], [-39, -85], [24, -22], [2, -76], [-83, -100], [-22, -66], [-29, -29], [3, -95], [-89, -52], [-74, -66], [-184, -66]], [[15102, 17933], [-45, 10], [-103, -18], [-21, -45], [-97, 39], [1, 52], [32, 36], [11, 49], [-12, 76], [-60, -15], [-31, 93], [31, 46], [-41, 48], [-25, -33], [-43, 68], [-23, -17], [-123, -24], [-35, 47], [-42, 10], [-34, -28], [-38, 13], [2, 46], [38, 43], [-38, 40], [50, 109], [-25, 33], [-57, -2], [-73, -50], [-39, 15], [-85, -77], [-41, -57], [-2, -74], [-108, -15], [-60, 109], [43, 86], [-28, 102], [-39, -17], [-3, -75], [-78, -33], [-11, -85], [-56, -5], [-67, 106], [-29, -70], [-92, -38], [-74, 31], [-40, -28], [-61, -197], [51, -56], [-22, -97], [-52, 27], [-28, -22], [-26, -100], [-27, -14], [-72, 18], [5, -47], [90, -15], [-14, -41], [-107, -2], [-39, -35], [-72, -17], [-31, -26], [-35, -67]], [[13052, 17743], [-32, 48], [-56, 33], [61, 108], [-19, 62], [-51, 31], [-21, 100], [21, 61], [-23, 28], [13, 58], [-23, 36], [4, 49], [73, 39], [11, 56], [-71, 73], [46, 3], [7, 65], [82, 25], [13, 47], [-36, 61], [70, 52], [8, 69], [-17, 121], [-108, 15], [-40, 26], [-37, -67], [4, -62], [46, -84], [-112, -7], [-20, -53], [-53, -9], [-23, 35], [-54, -12], [-22, 47], [-45, -3], [-80, 164], [28, 14], [8, 62], [42, 81], [-38, 57], [-39, -28], [-51, 16], [-69, -28], [-104, 16], [-19, -35], [-65, -18], [-66, -38], [-69, 37], [64, 67], [-12, 53], [52, 43], [52, 64], [76, 31], [37, 78], [87, 35]], [[12482, 19465], [107, -61], [52, 28], [162, 10], [-5, -30], [79, -29], [64, 34], [35, -15], [148, 45], [38, -66], [25, -6], [43, 52], [43, -30], [56, 36], [9, 53], [54, -46], [54, 29], [33, -10], [36, 33], [73, 22], [-15, 55], [42, 39], [14, 44], [53, 33], [-5, 47], [49, 51], [118, 21], [2, 31], [75, -9], [17, -63], [88, -21], [79, 52], [79, -22], [46, 63], [7, 106], [-71, 150], [-34, 32], [-44, 104], [90, 100], [18, 82], [-40, 49], [36, 43], [7, 59], [-54, -14], [-43, 27], [86, 78], [29, 92], [56, -8], [63, 27], [42, -44], [38, -7], [13, -145], [-3, -76], [79, -23], [40, 57], [94, 7], [55, 75], [-9, 57], [26, 13], [10, 90], [-10, 99], [56, -10], [37, -38], [10, -49], [48, -27], [-2, -57], [48, 19], [76, 78], [40, 76], [66, -4], [27, -20], [42, 45], [0, 43], [54, 34], [-19, 30], [34, 58], [41, 31], [24, -37], [50, 36], [14, 70], [28, 21], [52, -16], [26, 49], [-5, 84], [38, 68], [0, 42], [41, 45], [60, 23]], [[15597, 21459], [-40, -49], [7, -65], [-22, -89], [64, -47], [-16, -77], [13, -21], [-22, -113], [54, 9], [59, -23], [23, 68], [0, 84], [49, 22], [56, -27], [-39, -62], [12, -62], [61, -42], [-25, -84], [39, -49], [69, -47]], [[20395, 22207], [-55, -161], [36, -32], [-10, -52], [-40, 6], [-35, -26], [7, -39]], [[18740, 23195], [8, -66], [35, -21], [57, 17], [34, -91], [116, 0], [-14, -59], [57, -160], [32, -18], [86, 4]], [[19151, 22801], [-8, -50], [19, -46], [62, -20], [27, -57], [84, -65], [54, -134], [174, 156], [115, -126], [17, -46], [97, 46], [40, 71], [73, 5], [124, -25], [47, 52], [142, -106], [106, 15], [36, -101], [-15, -35], [47, -46], [3, -82]], [[25994, 14085], [-28, -61], [4, -70], [33, -18], [25, -49], [13, -74], [35, -32], [11, -54], [33, -33]], [[26120, 13694], [31, -105], [22, -31], [2, -76], [-67, -26], [-26, 17]], [[26082, 13473], [-17, 28], [-54, -21], [-78, 42], [-43, -12], [-106, 18], [-41, -16], [-32, -56], [-83, -107], [5, -59], [-55, -45], [-92, -40], [-37, 25]], [[24423, 14358], [44, 23], [51, -14], [22, 61], [64, 13], [57, -23], [114, -6], [44, 13]], [[24819, 14425], [5, -45], [-21, -47], [63, -119], [-17, -22], [79, -44], [83, 40], [77, 14], [63, -45], [-34, -87], [77, 3], [33, -36], [59, 29], [38, 62], [62, 14], [25, 97], [71, -58], [79, -1], [121, -32], [31, 59], [40, 11], [91, 85]], [[25844, 14303], [78, -38], [11, -78], [63, 2], [-23, -68], [21, -36]], [[24932, 15617], [106, 15], [52, 25], [116, -12], [155, -5], [52, 10], [31, -48], [63, 5], [53, -51], [-3, -47], [98, 13], [17, -64], [86, -63], [53, -21]], [[25923, 15084], [-31, -23], [-61, -1], [-20, 23], [-54, -40], [-38, 24], [-55, -24], [-28, 25], [-64, -13], [-43, -33], [-60, 14], [-24, -40], [-136, -23], [-42, -43], [-63, 32]], [[25204, 14962], [12, 50], [-99, 72], [-147, 9], [45, 46], [-30, 19], [-67, -13], [-30, 126], [-52, 57], [21, 51], [-15, 47], [26, 66]], [[24868, 15492], [64, 125]], [[16297, 26920], [21, -47], [44, -23], [33, -87], [63, 4], [25, -43], [46, 6], [61, 40], [36, -71], [-6, -56], [68, -44], [86, -5], [66, -47], [82, 4], [-5, -45], [107, 24], [34, -31], [72, 1], [56, 41], [40, -6], [111, 21], [108, -42], [44, 154], [108, 64]], [[17597, 26732], [1, -68], [26, -52], [76, -19], [62, 96], [35, -39], [67, 7], [20, -21], [80, 21], [94, -18], [58, -82]], [[18116, 26557], [-45, -44], [-139, -45], [-15, -57], [-35, -48], [-50, -34], [-52, 11], [-56, -66], [40, -33], [21, -79], [106, 21], [42, -88], [-60, -60], [-81, 11], [-35, -13], [5, -45], [41, -67], [-13, -28]], [[17790, 25893], [-39, -36], [-56, -22], [28, -36], [-11, -51], [-28, -13], [-35, -82], [-43, -22], [-94, -125], [-54, 43], [10, -105], [23, 4], [54, -60], [-89, -103], [0, -43], [-42, -51], [-6, -47], [-47, -80]], [[17361, 25064], [-76, -46], [-15, -36], [-81, -103], [-16, -68], [-50, -79], [-1, -47], [-53, 3], [-77, -24], [-15, -31]], [[16720, 24688], [36, 96], [50, 76], [10, 41], [-33, 28], [-7, 78], [10, 50], [-1, 99], [-20, 58], [-102, 29], [26, 151], [-38, 16], [-9, 90], [48, 83], [-41, 29], [-134, -2], [-29, 114], [-42, 50], [-18, 56], [3, 72], [-34, 38], [-123, -35], [-65, 41], [-96, -47], [-45, 47], [-92, 60], [9, 28]], [[15983, 26034], [4, 79], [29, 40], [-23, 36], [-68, -39], [9, 76], [-56, 30], [-3, 42], [-48, 9], [39, 152], [-9, 56], [-65, 76], [-54, 95], [-1, 38], [-65, 73], [85, 56], [70, 10], [73, -16], [51, 19], [34, -14], [54, 12], [38, 52], [42, -22], [89, 45], [20, -37], [69, 18]], [[28804, 20045], [-35, 88], [23, 58], [13, 149], [25, 36], [-39, 29], [-3, 45], [62, 96], [-59, 145], [-8, 52], [70, 63], [51, 0], [64, 43], [52, 3], [22, -38], [62, -21], [40, -52], [63, 19], [-1, -65], [-75, -64], [22, -16], [10, -64], [-30, -59], [-69, -11], [-6, -67], [42, -43], [19, -87], [34, -67], [106, -94]], [[29259, 20123], [-40, -49], [-73, 25], [-85, -78], [3, -36], [-42, -52], [11, -36], [-120, -22], [-46, -37]], [[28867, 19838], [-53, 32], [4, 32], [-38, 35], [50, 36], [-26, 72]], [[19847, 24981], [-38, -77], [-25, -87], [32, -79]], [[19816, 24738], [8, -70], [73, -77], [23, -52], [36, -26], [-31, -53], [17, -54], [86, -92], [-26, -40], [-84, -8], [-15, -56]], [[19855, 23198], [-7, -36], [-78, -20], [7, -34], [-33, -51], [-51, 74], [-91, 1], [-80, -16], [-40, 54], [-8, 43], [-145, 8], [-67, -58], [-15, -42], [18, -78], [-34, -16], [-16, -49], [14, -47], [36, -11], [5, -68], [-51, -89], [-68, 38]], [[19172, 24736], [66, 31], [19, -32], [156, 94], [-17, 26], [48, 77], [-24, 43]], [[25038, 11420], [-139, -38], [-64, 39]], [[30109, 10096], [-24, -133], [15, -35], [53, -28], [5, -86], [37, -68], [71, -28], [31, -49], [41, -12], [-9, -70], [20, -28]], [[30349, 9559], [13, -67], [-65, -41], [-11, -30], [-95, -1], [-7, -54], [14, -61], [-55, -99]], [[30143, 9206], [-52, -19], [-38, 17]], [[30053, 9204], [-76, 47], [-74, 64], [-20, -4], [-66, 62], [26, 32], [-46, 75], [-26, -10], [-98, 136], [-28, 62], [9, 39], [-61, 26], [-8, -88], [-41, -67], [-126, -177], [6, -60], [-94, -5], [-59, -19], [-80, -97], [-40, 60], [-90, 59], [-19, 52], [59, 62], [44, 18], [1, 58], [-26, 45], [15, 39], [-4, 152], [16, 78], [71, 37], [-29, 41], [35, 48], [-40, 65], [7, 64], [-54, 26]], [[29161, 10716], [51, -3]], [[29212, 10713], [92, -79], [15, -46], [36, -30], [17, -46], [49, -28], [57, 37], [6, -61], [46, -1], [22, -35], [99, -57], [17, -51], [-23, -62], [69, -7], [30, 58], [87, 38], [22, -49], [67, 30], [19, -43], [-9, -45], [85, -55], [22, -67], [72, -18]], [[31932, 9538], [-72, 16], [-21, 27]], [[31839, 9581], [50, 35], [0, 42], [32, 106], [-43, 30], [55, 71], [27, 63], [-18, 51], [9, 59], [-26, 66]], [[31925, 10104], [72, 23], [78, -51], [74, 14], [20, -34], [106, -15], [-60, -143], [60, 5], [28, -54], [32, -16], [52, 29], [44, -24], [42, 13], [34, -51], [64, -5], [32, -57], [34, 12], [162, -10], [49, 10], [69, -29], [48, 12], [51, 66], [39, -17], [66, 6], [5, 61], [40, -13]], [[33166, 9836], [35, -30], [36, -94], [-13, -104], [6, -45], [-74, -14], [-19, -64], [-40, -11], [-38, -77], [-65, -76]], [[23376, 25892], [-1, -29], [81, -69], [189, 80], [6, -41], [65, -65], [100, -51], [76, -1], [-5, -63], [17, -26], [6, -85], [44, -78], [62, -29], [48, -66], [50, -26], [79, -4], [-22, -44], [12, -45], [62, -25]], [[24245, 25225], [-30, -28], [74, -92], [-76, -36], [-27, -43]], [[24186, 25026], [-43, -22], [-4, -33], [-50, -14], [-7, -54], [-61, -23]], [[24021, 24880], [-32, 20], [-37, 88], [9, 56], [-85, 31], [8, -57], [-135, 83], [-22, 52], [-72, 16], [-18, 58], [-64, 22], [-5, 71], [-47, 51], [-55, -5], [-7, -34], [-43, -37], [0, -36], [-53, -8], [-47, 26], [-46, -47], [-56, -32], [-42, 6], [-28, -42], [-20, -74]], [[23124, 25088], [-41, -10], [-2, -48], [-33, -30], [-60, 3], [1, 46], [-51, 21], [17, 61], [-10, 58], [-45, 11], [-22, 34], [-11, 72], [-66, -4]], [[30856, 19815], [-37, -14], [-3, -41], [70, -31], [25, -53], [92, -111], [66, 4], [29, -44], [-32, -100], [-1, -39], [77, -6], [8, -30], [94, 5], [28, -65], [47, -65]], [[30996, 19070], [-59, 16], [-69, 39], [-28, 44], [-104, -15], [-115, -28], [-57, -29], [25, 101], [-26, 34], [-76, -28], [-34, 40], [-43, 3], [-31, 31]], [[30029, 19556], [31, 58], [4, 77], [-98, 141], [11, 41], [-60, 89], [-52, 11], [-47, 62], [3, 47], [-80, 16], [-23, 33]], [[29718, 20131], [7, 18], [93, 69], [75, 9], [36, 26], [-1, 54], [26, 38], [51, -3], [33, -56], [90, -83], [33, 18], [52, 78], [83, -35], [50, 21], [47, -43]], [[30393, 20242], [55, -66], [-17, -79], [34, -20], [48, 22], [12, 38], [100, -45], [21, -42], [51, -20], [-4, -82], [27, -14], [9, -85], [29, -24], [44, 9], [54, -19]], [[32165, 7295], [-14, -42], [-78, 6], [-11, -115], [-54, -35], [46, -39], [-64, -42], [34, -111], [67, -21], [28, -49], [51, -28], [60, -56], [63, 2], [112, -60], [7, -56], [50, -21], [43, 8], [64, -32], [21, -36], [45, -2], [61, 70], [37, -10], [59, 52], [52, -40], [-3, -84], [45, -52], [13, -40], [-34, -105]], [[31745, 6280], [-87, 86], [-41, 62], [-27, 76], [-77, 25], [-87, 148], [-36, 10], [-43, 67], [-52, 39], [-31, 69], [81, 97], [-59, 55], [-63, 37], [-83, 85], [-12, 34]], [[31128, 7170], [31, 60], [-2, 56], [48, 11], [44, 43], [45, 81], [47, 4], [-15, 83]], [[12326, 21955], [53, -19], [146, 7], [213, -85], [45, -11], [54, -39], [98, -33], [165, -68], [60, -87], [7, -45], [65, -53], [74, -12], [148, -63], [99, -11], [75, 91], [67, 6], [146, -16], [11, 75], [73, 24], [42, -23], [27, 72], [29, -1], [58, 44], [42, 68], [76, 26], [47, 49], [73, 16], [23, 48], [37, -8], [35, 36], [50, -24], [65, -63], [44, -16], [34, 37], [18, -79], [28, -38], [-60, -38], [-8, -32], [38, -60], [-3, -61], [32, 0], [24, -50], [61, -8], [-11, -64], [19, -64], [48, -64], [33, 24], [38, -13], [37, 35], [8, 80], [40, 68], [83, -28], [70, 86], [-6, 50], [49, 8], [42, 56]], [[15595, 21646], [13, -60], [34, -41], [-45, -86]], [[12482, 19465], [-43, 24], [-8, 64], [-51, 1], [-29, 61], [-83, -41], [-27, 32], [-47, 9], [-149, -20], [-81, -36], [-24, -25], [23, -57], [-55, -61], [-69, -10], [-78, 59], [-27, -64], [-49, -36], [2, -49], [-84, -45], [-16, 59], [-35, -8], [-57, 53], [12, 62], [-31, 21], [-33, 65], [-58, -19], [-17, 73]], [[17154, 18057], [19, -82], [72, -24], [83, 27], [30, 24], [45, -17], [61, -49], [53, 23], [50, -53], [11, -87], [-25, -42], [-55, -36], [15, -64], [28, -37], [-27, -136], [52, -74], [73, 44], [54, 15], [67, -4], [96, 101], [46, -82], [28, -25], [-7, -52], [-63, -35], [34, -92], [51, -25], [2, -62]], [[17947, 17213], [-24, 35], [-76, -5], [-2, -85], [-44, -79], [-35, -11], [-76, 46], [-108, -37], [-47, -31], [21, -62], [-22, -43], [-106, -44], [-82, -166], [-68, -82], [31, -60], [11, -59], [53, -48], [37, -5]], [[17410, 16477], [17, -98], [-34, -57], [-15, -77]], [[17378, 16245], [-18, -54], [-78, 32], [-89, -11], [-19, -37], [-69, -64], [-87, -20], [-25, -60], [-91, -6], [-56, 11], [-17, 42], [-73, 12], [-64, -32], [-39, 8], [-118, -93], [-106, -32], [-60, -88], [-4, -42], [-53, -50], [-20, -43], [-63, -56], [47, -64], [54, -113], [-27, -22], [23, -46]], [[16326, 15417], [-128, -11], [-65, 60], [-89, -1], [-37, -51], [-21, 56], [-48, 9], [-57, 36], [-59, 10], [-39, -24], [-57, 7], [-95, -31], [0, 37], [-39, 51], [-60, 1], [-7, 53], [-88, 13], [-121, -60], [-99, -5], [-3, 65], [-42, -4], [-94, -45], [-55, 8]], [[15023, 15591], [-53, 105], [-70, 67], [-3, 44], [-65, 89], [-66, 13], [-36, 77], [24, 53], [50, 24], [1, 48], [79, 51], [-12, 55], [58, 53], [83, 167], [23, 8], [29, 75], [43, 26], [31, -29], [22, 64], [34, -7]], [[15195, 16574], [70, -36], [67, -6], [47, 32], [40, 52], [53, 5], [68, 34], [118, -8], [23, 90], [-28, 95], [37, 18], [43, 75], [48, 46], [22, 141], [62, 64], [-9, 57], [29, 34], [-6, 59], [17, 71], [36, 61], [103, 64], [52, 5], [60, 33], [35, 54], [22, 89], [73, -13], [123, 58], [32, 50], [106, 15], [26, -95], [-9, -60], [52, 12], [34, -80], [39, 78], [66, 19], [38, 58], [14, 122], [-37, 42], [68, 36], [30, -16], [27, -77], [48, 23], [45, -30], [48, 56], [50, 117], [77, 39]], [[28542, 15307], [-16, -26], [-53, -6], [-106, 87], [-83, 18], [-56, 49], [-86, 4], [17, 41], [99, 97], [19, 54], [89, -7], [15, 57], [47, 29], [5, 36], [50, 44], [38, 0], [55, 69], [10, 45]], [[28860, 15806], [8, -87], [-35, -24], [9, -44], [-55, -33], [-30, -143], [-38, -20], [-57, -70], [-39, -12], [-81, -66]], [[24021, 24880], [38, -77], [-13, -79], [-65, -28], [-36, 19], [-67, -47], [6, -37], [-72, -36], [-117, -19], [-60, 1], [-3, -121], [26, -98], [-10, -50], [46, -59], [23, -77], [-9, -57], [16, -31], [4, -105], [-28, -38], [53, -63], [-11, -66], [-60, -56], [26, -65]], [[23494, 23569], [-35, 44], [-1, 56], [-63, 69], [-4, 66], [-26, 39], [-103, -34], [-32, -42], [-64, 15], [-37, 43], [-61, 29], [38, 30], [41, -52], [56, 12], [-25, 55], [5, 69], [-14, 54], [-55, -36], [-66, 1], [-36, 28], [-42, -93], [-54, 14], [-3, 32], [-60, 113], [24, 124]], [[22877, 24205], [25, 79], [30, 42], [-7, 49], [222, -56], [50, -30], [42, 57], [1, 44], [-34, 67], [-49, 41], [14, 27], [51, 2], [32, -30], [29, 29], [-11, 60], [-75, 20], [-29, 55], [-40, 21], [17, 78], [-31, 44], [-48, 19], [69, 82], [40, -15], [8, 94], [-47, 2], [-12, 102]], [[26721, 22582], [-84, -70], [-33, -65], [49, -83], [-25, -127], [-82, 22], [-29, 26], [-54, -25], [9, -33], [-37, -112], [14, -87], [31, -25], [30, -69], [43, -55], [-31, -70]], [[26522, 21809], [-59, 10], [-62, -69], [-57, 26], [-51, 73], [-82, -3], [-28, -54], [-4, -62], [-75, 0], [-16, 87], [-46, -26]], [[26042, 21791], [-37, 107], [21, 54], [-17, 66], [26, 52], [-46, 47], [25, 110]], [[26014, 22227], [38, 71], [11, 55], [61, 64], [12, -39], [74, 5], [26, 39], [-38, 49], [-40, 13], [54, 144], [22, 31], [9, 73]], [[26243, 22732], [19, 44], [38, -34], [70, 31], [-26, 74], [27, 38], [12, 64], [75, -38], [71, 142], [-24, 27], [33, 98], [80, 34], [16, 70], [-28, 45], [45, 41], [52, -41], [86, -89]], [[24738, 24436], [-69, 21], [-45, -102], [32, -104], [78, -46], [-8, -59], [57, -75], [20, 2], [55, -61], [26, -78], [5, -76], [-23, -28], [-7, -62], [97, -56], [-8, -59], [-80, -42], [-28, 43], [-30, -9], [-46, -70], [32, -109], [19, -166], [-55, -24], [-86, 2], [-65, -41]], [[24609, 23237], [-47, -10], [0, 74], [-126, 37], [-33, -40], [-90, -16], [-33, 32], [-3, 46], [-87, 80], [-36, 46], [-33, 100], [-55, -23], [-43, -52], [-25, 44], [-68, -24], [15, -99], [-51, 4], [-46, -27]], [[24186, 25026], [29, -40], [105, -37], [47, -1]], [[24367, 24948], [14, -31], [116, 57], [78, -68], [19, 38], [-15, 60], [32, 16], [39, -65], [26, 33], [35, -33], [-25, -49], [34, -91], [-52, -70], [32, -79], [56, -35], [46, -78], [-10, -87], [-54, -30]], [[28776, 25147], [33, -39], [67, 4], [11, -59], [-22, -21], [75, -54], [22, -71], [38, -3], [8, -61], [38, -35], [26, -63], [43, 0], [45, -60]], [[29160, 24685], [-32, -118]], [[29128, 24567], [-27, -15], [-100, -122], [34, -95], [-13, -19], [-147, 35], [-49, 48], [-44, -94], [-54, -17], [-45, -105], [-52, 69], [-29, 9], [-55, -69], [-30, 34], [-69, -7], [-129, -52]], [[28319, 24167], [-45, 28], [-35, 101], [-2, 50], [38, 87], [4, 55], [-79, 24], [-17, -49], [-87, -24]], [[28096, 24439], [-49, 73], [14, 57], [56, 8], [15, 56], [-17, 68], [35, 73], [-74, 93], [-24, 13], [-17, 63], [32, 75], [-30, 16], [-9, 65], [-21, 27], [30, 92], [57, 19], [-16, 106], [17, 128], [34, 46]], [[28129, 25517], [30, -48], [68, -45]], [[25022, 25802], [-11, -25], [21, -106], [47, -39], [12, -99], [93, -30], [24, -153]], [[25208, 25350], [-4, -78], [-19, -31], [-77, -62], [39, -47], [-14, -41], [-48, -17], [-30, 72], [-49, 12], [16, 111], [-24, 39], [-49, 30], [-47, -15], [-38, -47], [-35, 1], [-47, 94], [-77, 63], [-36, 93], [-32, -35], [4, -37], [-25, -100], [-76, -66], [-45, -6], [18, -52], [-55, -34], [32, -92], [-70, -40], [-13, -51], [-40, -66]], [[24245, 25225], [9, 70], [-30, 65], [100, 28], [13, 36], [55, -4], [-17, 64], [62, 151], [10, 74], [-34, 15], [11, 101], [56, 14], [-6, 48], [-80, 51], [8, 57]], [[24402, 25995], [34, 27], [51, -24], [14, 38], [62, 36], [-17, 118], [57, 53], [-15, 52], [15, 39], [42, 4], [43, 76]], [[24688, 26414], [119, -39], [24, -38]], [[17554, 23198], [13, 43], [-41, 51], [-227, 34], [-49, 26], [-93, 81], [-17, 31]], [[17361, 25064], [131, -77], [21, 123], [18, 20], [58, -19], [58, -104], [77, 49], [65, 65], [63, -11], [55, -31], [22, -83], [-25, -60], [-32, -1], [-38, -93], [41, -17], [-16, -50], [16, -98], [48, -43], [-3, -45], [55, -7], [36, -34], [79, 14]], [[24123, 12209], [-54, -49], [62, -122], [-104, 24], [-64, 35], [-89, 134], [-24, 75], [-44, 4], [-50, -70], [-85, -28], [-22, 67], [-152, -123], [-21, 19], [61, 133], [-161, 84], [-91, 99], [-33, 20], [-43, 65], [-24, 83], [-45, 54], [-43, -7], [-38, 39], [-29, 62], [-41, 14], [0, 85], [-38, -17], [-139, 164], [0, 41], [-33, 28], [-35, 125], [7, 30], [82, 82], [-67, 118], [-72, -62], [-36, 52], [-4, 73], [8, 150], [-59, 28], [-83, 7], [-7, -30], [-69, 30], [-83, 20], [-59, -24], [-69, 40], [-74, -62], [-38, -85], [-135, -44], [-55, -29], [-25, 12]], [[19233, 14309], [2, -58], [63, -122], [84, -92], [-49, -61], [32, -80], [-13, -42], [58, -86]], [[19410, 13768], [-110, -124], [-179, -68], [-25, -152], [5, -40], [110, -56], [-17, -105], [-54, -100], [111, -11], [35, -18], [177, -203], [5, -60], [35, -41], [40, -78], [87, -39], [18, -40], [8, -81], [-19, -57], [-83, -123], [29, -101], [-81, -32], [-81, -5], [-126, 51], [-186, 49], [-63, 58], [-119, 89], [-43, 47], [-43, -6], [-234, -67], [-83, -64], [-66, 19], [-47, 33], [-249, 60], [-42, 17], [59, 77]], [[18179, 12597], [105, 5], [40, 19], [182, 53], [-46, 98], [24, 7], [-9, 109], [38, 40], [2, 48], [52, 51], [17, 71], [50, 5], [29, 54], [-4, 55], [30, 44], [-10, 35], [-47, 26], [-66, -24], [-76, 57], [-36, -27], [-66, 14], [-122, 77]], [[18234, 13771], [-1, 112], [58, 45], [98, 30], [4, 25], [78, 48], [21, 54], [92, 63], [25, 53], [-100, 25]], [[18509, 14226], [8, 49], [-25, 54], [62, 34], [103, 126]], [[19240, 14424], [3, -11]], [[26446, 19863], [32, -13]], [[26962, 19994], [5, -83]], [[26967, 19911], [-34, -49], [21, -96], [29, -46], [-15, -127], [41, -32], [-25, -71], [116, -61]], [[27100, 19429], [46, -28], [-42, -67], [113, -81], [70, -69], [-63, -43], [-8, -39], [-76, -12], [-194, 59], [-78, -58], [19, -54], [-102, -119], [20, -60]], [[21016, 23127], [14, -38], [-3, -95], [-17, -59], [68, -39], [87, 3], [17, -74], [37, -36], [-26, -80], [38, -64], [119, -64], [18, -34], [57, -7]], [[21425, 22540], [-17, -41], [25, -39], [-25, -54], [-76, -56], [-52, 49], [-76, -24], [-38, 28], [-35, -19], [12, -72], [-33, -20], [-87, 36], [-42, -43], [-1, -32], [-70, -8], [-10, -73]], [[20900, 22172], [-71, 1], [-55, 30], [-49, -5], [-46, 35], [-52, 13], [-28, -50], [-39, -28], [-71, -18], [-65, 25], [-29, 32]], [[25672, 24167], [-18, -82], [41, -26], [21, -89], [-70, -98], [-77, -16], [-17, -121], [52, -21], [28, 25], [25, -91], [-39, -72], [-40, -21], [4, -78], [26, -41], [-15, -34], [-67, -15]], [[25526, 23387], [-38, -55], [13, -103], [-49, -40], [-4, -97], [61, -34], [-49, -47], [-21, -47], [-104, -18], [-37, 6], [-17, -45], [-59, -82], [-63, 13], [-53, -48], [-45, 10], [-33, 49], [-46, -44]], [[24982, 22805], [-10, -17], [-123, 4], [-33, 56], [8, 75], [-17, 36], [9, 136], [-68, 50], [-76, -106], [-26, 1], [1, 70], [-38, 127]], [[24738, 24436], [0, -82], [70, -34], [54, -70], [36, 38], [43, -20], [39, 15], [-7, 51], [43, 25], [-27, 43], [25, 27], [-4, 68], [24, 53], [-31, 78], [73, 48], [78, -69], [47, -67], [104, -1], [136, 26]], [[25441, 24565], [6, -26], [94, -88], [4, -51], [-37, -18], [26, -153], [27, -59], [67, 29], [44, -32]], [[22265, 17071], [-104, -30], [-33, 47], [-61, -21], [-95, 3]], [[21257, 17196], [-16, 50], [-71, -13], [-6, -59], [-69, 25], [-38, -18], [-77, 54], [-64, -61], [-85, 12], [-58, 61], [-33, 59], [-2, 69], [-83, -6], [29, 42], [2, 47], [78, 44], [42, -8], [36, 74], [-26, 28], [-4, 82], [-49, 73], [-89, 32], [-94, 22], [-66, -28]], [[22061, 18251], [26, -8], [55, 92], [65, 24], [41, 43], [26, -57], [95, -26]], [[29415, 25237], [-149, 80], [-60, -4], [-2, -62], [-21, -50], [-51, -16], [-31, 59], [-49, -11], [-4, 70], [14, 44], [-58, 37]], [[29005, 25655], [23, -28], [142, -51], [15, -32], [-32, -39], [-1, -46], [61, -38], [91, -14], [64, 50], [73, 27], [48, 49], [74, -32], [-14, -71], [-84, -51], [-39, -71], [-11, -71]], [[27846, 26128], [167, -39], [57, 6], [108, 60], [73, -5], [39, -30], [24, -103], [115, 41], [46, 2], [113, -72], [85, -25], [67, -59]], [[28129, 25517], [3, 52], [-36, 61]], [[26389, 26961], [-16, -205], [18, -90], [52, -41], [12, -109], [56, -30]], [[26511, 26486], [-23, -71], [-43, -52], [-30, -67], [5, -37]], [[25667, 26546], [-20, 44], [-39, -8], [-28, 75], [14, 103], [117, 58], [25, 38], [91, 45], [8, 146], [-20, 66], [15, 134]], [[25830, 27247], [18, 67], [44, 17], [66, -36], [63, -74], [120, -20], [51, 20], [68, -5], [51, -37], [-2, -70], [84, -90], [-4, -58]], [[28867, 19838], [-2, -41], [124, -37], [13, -24], [73, -14], [34, -68], [74, 4], [4, -29], [68, -26], [50, -57], [-27, -23], [72, -84], [7, -57], [-21, -44], [19, -57]], [[29434, 19168], [17, -54], [-20, -26], [-104, -51], [8, -35]], [[29335, 19002], [-35, 9], [-97, 89], [-36, -43], [-27, 14]], [[28525, 20154], [25, 29], [88, -10], [56, -71], [46, -38], [64, -19]], [[31892, 9158], [-30, -53], [-203, -81], [0, -49], [25, -79], [-45, -27], [-7, -67], [80, -54], [43, -9], [26, -41], [-105, -74], [-28, -56], [18, -41], [-17, -102], [-36, -76]], [[31613, 8349], [-61, -22], [-118, 57], [-43, 70], [1, 60], [-45, 60], [-123, 34], [-16, 45]], [[31208, 8653], [-54, 18], [30, 42], [123, 48], [-28, 59], [-50, 21], [11, 57], [54, 45], [-98, 82], [-39, 46], [-129, 104]], [[31028, 9175], [13, 42], [46, 53], [24, 84], [-23, 53], [74, 49], [11, 36], [-32, 139]], [[31141, 9631], [78, 20], [54, 135], [-45, 86], [41, 46]], [[31269, 9918], [31, -22], [18, -88], [24, -42], [45, -16], [63, -118], [78, -73], [61, 7], [137, 34], [13, 15], [100, -34]], [[28375, 13000], [21, -53], [83, -16], [43, -109], [55, -90], [39, -12]], [[28616, 12720], [-70, -44], [-113, -142], [-48, -47]], [[27149, 12830], [89, 11], [7, 54], [72, 101], [76, 18], [3, 76], [41, 61], [41, 24], [98, -66], [13, -31], [148, -17], [-1, 62], [-44, 74], [5, 70], [-55, 103], [5, 41], [-24, 38]], [[22877, 24205], [-31, -48], [-66, -67], [-59, 8], [-17, -43], [-42, -38], [-31, 15]], [[22631, 24032], [-48, 63], [-55, 5], [0, 101], [-12, 77], [-44, 37], [-92, 16], [-85, 55], [-35, 0], [-32, -103], [-44, 12], [-65, -27], [-102, 41], [3, -68], [-35, 9], [-9, -77], [-80, -22], [3, -82], [-107, -63], [-76, 11], [-2, 35], [-43, 24], [-38, 53], [40, 136], [-73, 26], [-18, 53], [-124, 20], [-57, -3], [-13, 38], [-43, 33]], [[21345, 24432], [75, 19], [23, -28], [47, 50], [-31, 22], [30, 54], [50, 38], [8, 32], [-39, 61], [-62, -21], [-24, 36], [115, 73], [-62, 37], [46, 107], [82, 150], [-15, 20], [24, 78], [-38, 25], [27, 65], [104, 70], [35, -20], [90, 67], [66, -16], [37, 66], [44, 7], [34, 56], [67, -51], [37, 73], [56, 25], [71, -24], [62, 39], [16, 43], [-96, 67], [8, 60]], [[28096, 24439], [-5, -34], [-64, -60], [-43, -13], [-86, 27], [-129, 78], [-57, -15], [-21, 29], [-82, 16], [-26, 87], [-66, -37], [-86, 32], [-51, 44], [-42, -12], [-68, 55], [-72, -73], [-34, 17]], [[27164, 24580], [-28, 42], [37, 40], [-49, 50], [10, 52], [34, 5], [-25, 76], [33, 68], [34, 35], [65, -8], [102, -90], [25, 61], [-63, 46], [-76, 93], [4, 35], [-26, 73]], [[30134, 24512], [-5, -36], [178, -41], [-6, -100], [-20, -55], [85, 33], [66, -11], [42, -138], [78, -164], [94, -26], [41, -74]], [[30687, 23900], [-21, -118], [-31, -23], [-17, -71], [-68, -34], [-91, 33], [-70, 66], [-20, -34], [11, -58], [-36, -26], [-87, 18], [-12, -54], [-39, -55], [-19, -89], [46, -56], [-4, -49]], [[30229, 23350], [-91, -60], [-36, -69], [5, -63]], [[30107, 23158], [-82, -27], [-48, 47], [-46, -13], [-116, 54], [8, 142], [-35, 19], [73, 81], [-87, 67], [-50, 13], [-93, -5]], [[29631, 23536], [-11, 51], [6, 111], [-69, 43], [28, 26], [-29, 52]], [[29556, 23819], [63, 35], [24, 42], [49, 31], [-18, 40], [-56, 40], [-5, 74], [65, 16], [56, -7], [76, -47], [25, 18]], [[30039, 24453], [95, 59]], [[28823, 14659], [-97, -4], [-64, -24], [-89, -10], [-31, -27], [-113, -139], [-36, -72], [1, -68]], [[28394, 14315], [-32, -3], [-60, 58], [-22, 49], [-53, 13], [-5, 38], [-63, 52], [-58, -3], [-78, -44], [-37, 33], [-74, 0], [-19, 32], [-46, 8], [-20, 36], [68, 62], [-14, 53], [-54, 13], [-43, -18], [-71, 49], [-11, -69], [-36, -38]], [[27666, 14636], [-78, 58]], [[27588, 14694], [-22, 113]], [[27566, 14807], [28, 58], [55, -1], [107, 100], [59, -23], [91, -57], [44, -77], [34, 31], [-32, 40], [49, 21], [-2, 50], [-37, 45], [132, 16], [45, -7], [53, -39], [19, -72], [181, 8], [34, -23], [147, 54], [57, 62]], [[28630, 14993], [11, -56], [57, -30], [79, -21], [-7, -86], [33, -43], [42, 4], [17, -64]], [[28862, 14697], [-39, -38]], [[30702, 17324], [-63, -3], [-1, -55], [37, -42], [-19, -77], [-7, -99], [72, -6], [15, -60], [-26, -114], [-59, 2], [-97, -24], [-69, 36], [-88, 9], [-63, 28], [-35, -71]], [[30472, 17612], [38, 24], [36, 101], [67, 108]], [[30879, 17828], [37, -45], [90, 2]], [[20900, 22172], [90, -28], [51, 19], [72, -41], [32, -51], [-9, -81], [-63, -60], [17, -33], [-43, -56], [-88, -22], [-52, 36], [-75, -12], [-37, -30], [19, -59], [-48, -58], [-37, -21], [-60, 41], [-36, -33], [3, -92], [-26, -34], [53, -59], [7, -40], [37, -25], [102, 17], [4, -65], [63, -64], [79, 55], [11, 39], [46, -1], [20, 50], [114, 87], [18, -45]], [[21164, 21506], [-52, -105], [-1, -50], [-44, -90], [15, -27], [-65, -61], [-54, 18], [-72, -63], [-63, 48], [-80, -25], [-57, -127], [-15, -66], [3, -62], [-111, -24], [-52, 2], [-43, -44]], [[20357, 20950], [-8, 56], [-46, 70], [60, 34], [-48, 59], [-42, -11]], [[25469, 16375], [-34, -11], [1, -111], [123, -1], [4, -37], [-59, -51], [-19, -87], [52, -40], [-9, -36], [-50, -31]], [[25478, 15970], [-50, 7], [-80, -27], [-5, -55], [-76, -5], [-3, 31], [-128, -29], [-49, 4], [-80, -61], [-76, -19]], [[24931, 15816], [-45, -19]], [[24886, 15797], [11, 93], [-64, 60], [67, 28], [26, 31], [1, 79], [-50, 108], [-72, -37], [-42, 48], [-130, 36], [-117, 83], [-109, 18], [-20, 51], [-29, 12], [33, 71], [-5, 64], [27, 40], [108, 67], [-16, 31], [13, 62], [-34, 51], [-42, -3], [-13, 61], [32, 55]], [[28613, 14094], [12, -53], [-119, -73], [-34, -98], [-101, 28], [-21, -41], [-1, -57], [56, -39], [-33, -130], [-63, -145], [-36, 1], [-36, -72]], [[27860, 14414], [-35, 61], [-100, 52], [-59, 109]], [[28394, 14315], [67, -17], [103, -82], [80, 13]], [[28644, 14229], [-27, -30], [-14, -71], [10, -34]], [[28542, 15307], [29, -19], [-23, -54], [20, -38], [-28, -55], [30, -66], [60, -19], [0, -63]], [[27566, 14807], [-97, 31], [-11, 80]], [[27458, 14918], [4, 40], [87, 31], [81, 65], [21, 159], [60, 18], [26, 83], [-25, 48], [28, 41], [57, 9], [-50, 65], [-65, 127], [72, 97], [146, 37]], [[18649, 15569], [41, -66], [-21, -67], [-40, -45], [-7, -78], [60, -53], [109, 28], [-1, -83], [21, -56], [-25, -46], [36, -112], [60, -21]], [[18509, 14226], [-70, -24], [-179, 36], [-132, -80]], [[18128, 14158], [-20, 21], [-2, 63], [-37, 48], [-18, 67], [-7, 99], [-19, 97], [68, 55], [20, 35], [-11, 65], [-31, 44], [6, 52], [-34, 75], [-67, 10], [-33, 39]], [[17943, 14928], [-3, 59]], [[17940, 14987], [73, 7], [12, 29], [65, 13], [38, 65], [56, 52], [32, 119], [-29, 82], [71, -8], [43, 39], [-2, 37], [43, 35], [44, 7], [48, 56], [0, 77], [20, 9]], [[18454, 15606], [8, -49], [38, -63], [47, 36], [75, 15], [27, 24]], [[17456, 14480], [-5, -49], [38, -17], [39, 33], [44, -15], [64, -53], [61, 47], [11, -47], [31, -22], [-30, -50], [35, -27], [-106, -117], [-28, -74], [-73, -14], [-40, -53], [-6, -55], [39, -43], [77, 19], [111, 3], [28, 27], [111, 17], [35, 53], [137, 51], [99, 64]], [[15685, 12666], [51, 103], [66, 10], [62, 49], [84, 23], [52, 50], [65, 12], [40, 40], [73, 5], [58, 38], [-15, 79], [-30, 38], [87, 34], [136, -54], [14, 43], [54, 26], [56, -9], [56, 15], [149, 91], [12, 68], [-68, -1], [-84, 29], [-75, 10], [-53, 22], [-11, 33], [104, 78], [102, 53], [-19, 22], [32, 53], [-1, 38], [-89, 44], [-58, 74], [-20, 154], [-31, 79], [17, 73]], [[16501, 14088], [39, 12], [179, 137], [45, -19], [-59, -75], [14, -79], [132, -28], [55, 38], [140, -12], [70, 107], [48, 47], [36, 103], [51, 62], [87, 0], [17, 41], [-28, 40], [49, 21], [44, -19], [36, 16]], [[17378, 16245], [70, 15], [42, -23], [30, -55], [-5, -75], [-33, -69], [-56, -31], [-10, -30], [-80, -27], [-81, -68], [-2, -35], [46, -44], [111, -49], [9, -53], [-152, -75], [-5, -25], [98, -12], [94, 26], [99, -2], [179, 68], [72, -8], [-39, -66], [0, -50], [63, 13], [66, -25], [47, -85], [49, -49], [-2, -72], [-49, -8], [7, -133], [-39, -32], [22, -44], [-10, -92], [21, -43]], [[17943, 14928], [-43, -80], [-39, -2], [-130, -70], [-74, 65], [-62, -54], [-41, -84], [-43, -39], [-9, -84], [-46, -100]], [[16501, 14088], [-7, 63], [-42, -33], [-51, 0], [-46, 23], [1, 82], [20, 57], [13, 91], [19, 41], [-75, 143], [7, 44], [-29, 57], [-82, 48], [-69, 24], [-5, 164], [-42, 21], [33, 62], [61, 60], [-13, 43], [32, 52], [1, 95], [43, 53], [52, 30], [-28, 34], [32, 75]], [[24453, 28478], [-84, 48], [-221, 43]], [[24148, 28569], [71, 74], [-11, 68], [14, 44], [42, 24], [21, 55], [-14, 42], [44, 23]], [[15247, 12330], [-113, -45], [-118, -22], [-12, 58], [-38, 80], [20, 38], [-18, 196], [34, 44], [-18, 42], [37, 90], [-69, 33], [-81, -30], [-45, 13], [-13, 56], [-62, 12], [18, 44], [-54, 57], [22, 50], [-8, 65], [-167, -57], [-56, 23], [-17, 74], [-58, 1], [-133, -60], [-42, -64], [-41, -23], [-3, -37], [-111, -62], [-83, 27], [-71, 43], [-93, -27], [-41, 5], [-46, -72], [-55, -40], [-121, -30], [-58, 31], [-137, -16], [-60, 28], [-87, -339], [-45, -20], [-231, -2], [-47, -13], [-49, -52], [-3, -32], [77, 0], [7, -36], [-51, -14], [-45, -44], [-182, -21], [-112, 5], [-76, -44], [30, -91], [-37, -61], [15, -46], [-105, 0], [-33, -23], [-78, 11], [-138, 4], [-64, -14], [-20, 52], [-41, 8]], [[10888, 14444], [165, 98], [64, -4], [34, 33], [95, 14], [39, 33], [61, 15], [54, -8], [53, 18], [14, 32], [85, 47], [145, 41], [63, 8], [142, 37], [113, 14], [160, 72], [104, 32], [135, 18], [220, 57], [45, 28], [65, 8], [76, 65], [61, -17], [74, 33], [38, 1], [100, 39], [73, 11], [-4, 61], [17, 42], [48, 33], [54, 11], [87, 51], [12, -38], [70, 38], [65, 10], [67, 45], [124, 109], [39, 2], [141, 138], [50, 35], [89, 40], [51, -63], [24, -61], [58, 11], [70, -135], [110, 8], [62, -9], [14, 51], [102, 62], [60, -88], [134, -94], [27, -43], [46, 22], [61, 108], [151, 50], [28, 26]], [[11568, 17442], [73, -168], [58, -71], [-3, -54], [-28, -43], [32, -34], [5, -47], [-73, -56], [6, -42], [40, -20], [37, -74], [22, 15], [66, -16], [26, -36], [-30, -38], [-11, -56], [14, -35], [-23, -61], [9, -136], [-25, -32], [60, -73], [41, 6], [23, -46], [-114, 3], [-82, -246], [-77, -39], [-144, -11], [-70, -60], [-126, -67], [38, -57], [-122, -51], [-131, -93], [-43, -14], [-173, -94], [-74, 9], [-47, -16], [-43, 37], [-34, -23], [-12, -61], [-94, -59], [-89, -36], [-124, -21], [-19, -14], [-142, -18], [-23, 40], [-110, -36], [-82, 23], [-48, -33]], [[9902, 15388], [12, 71], [-45, 61], [-46, 3], [-2, 75], [36, 19], [-2, 147], [-22, 53], [39, 58], [-53, 129], [-45, 32], [-72, 14], [-15, 37], [44, 107], [41, 64], [29, 1], [36, 55], [-4, 44], [52, 35], [11, 30], [-23, 65], [19, 58], [38, 20], [1, 52], [101, 53], [34, 70], [63, 57], [109, 60], [42, 74], [90, 31], [72, 3], [125, 39], [64, -41], [37, 1], [96, 72], [48, -25], [49, 23], [21, 49], [82, 56], [73, 66], [39, 1], [12, 42], [40, 33], [19, 45], [61, -28], [70, -12], [59, 45], [-30, 69], [36, 33], [142, -21], [46, 31], [37, -2]], [[29195, 14544], [-14, -39], [-55, 6], [-30, -84], [-90, -86], [-31, -54], [-1, -44], [-43, -81], [17, -46], [9, -94], [39, -41], [71, -31], [33, -47], [-1, -88]], [[29099, 13815], [-33, 12], [-88, -13], [-19, -27]], [[28959, 13787], [-53, 36], [-46, -32], [5, -38], [-53, -45], [-30, -90], [-36, 13], [-34, -56], [-41, 26], [-39, -11], [-32, 33], [-75, -15], [-21, 24], [-27, 110], [37, 24], [79, 11], [69, -9], [2, 33], [90, 92], [-80, 49], [9, 69], [-37, 76], [-33, 7]], [[28644, 14229], [24, 67], [63, 21], [58, 51], [2, 58], [32, 3], [-2, 56], [-35, 15], [7, 59], [28, 17], [2, 83]], [[28862, 14697], [77, -79], [56, 13], [14, 42], [41, 21], [94, -67], [31, 29], [31, -78], [-11, -34]], [[28295, 17013], [40, 18], [46, -33]], [[28623, 17568], [-28, -59], [20, -43]], [[28615, 17466], [-51, -14], [-33, 42], [-200, -137], [-51, -23]], [[28048, 17393], [39, 35], [11, 117], [42, 17], [32, 47], [71, 51]], [[30181, 16709], [32, -37], [-92, -59], [-34, -86], [7, -64], [36, -125], [48, -78], [-60, -68]], [[30118, 16192], [-36, -11], [-49, 51], [-37, -44], [-107, 14], [-47, -42]], [[29281, 17009], [8, 78], [23, 74], [40, 38], [-39, 32], [41, 46], [17, 59], [48, 9], [11, 41], [126, -25], [54, -19], [48, 11], [17, -43], [-6, -64], [48, -12], [16, -89], [60, 8], [58, -22], [6, 42], [73, 64], [48, -11]], [[27223, 26076], [-7, 62], [-43, 38], [-72, -47], [-48, -1], [-13, -30], [-83, -35], [-92, 112], [-58, 9]], [[26827, 26357], [10, 61]], [[26837, 26418], [85, 78], [33, 89]], [[26955, 26585], [28, -84], [-7, -80], [91, -77], [47, 2], [76, -54], [209, -19], [23, 77], [49, 39], [32, -16]], [[26830, 25184], [-66, -79], [83, -80], [-6, -32], [40, -78], [-50, -47], [6, -47], [-40, -60], [-171, -81], [-34, 4], [-72, 50], [-35, -19], [-92, 17], [-16, -25], [-123, 32], [-46, -14], [-64, -84], [-45, 1], [40, -175], [42, -50], [-24, -61]], [[26157, 24356], [-66, 11], [-22, 23], [-69, 5], [-32, -52], [-18, -83], [-54, -59], [-68, 13], [-156, -47]], [[25441, 24565], [-46, 19], [-13, 109], [57, 47], [-12, 47], [57, 76], [-19, 79], [-59, 55]], [[25406, 24997], [74, 36], [33, -61], [35, 40], [51, -1], [37, -36], [-6, -90], [14, -43], [68, 35], [73, 56], [9, 36], [-16, 96], [43, 6], [30, 82], [70, 59], [58, 0], [-1, 92], [49, 62], [-6, 51], [71, 119], [22, -3]], [[31702, 21969], [80, 4], [66, -53], [-29, -41], [-180, -4], [-15, -75], [0, -74], [40, -42], [206, -8], [54, -27], [39, -46], [-12, -118], [44, -60], [-17, -65], [2, -120], [-17, -82], [29, -61], [51, -10]], [[31281, 20788], [1, 39], [-34, 23], [96, 132], [-7, 104], [-47, 126], [-55, 46], [-96, -32], [-62, 51], [-48, -28], [-120, 73], [12, 99], [-61, 43], [-35, 77]], [[23825, 16258], [-69, -12], [-25, -31], [5, -135], [-27, -90], [39, -41], [55, -148], [-2, -95], [37, -106], [53, -109], [31, -41], [17, -89], [-23, -75]], [[23916, 15286], [-24, -98]], [[23201, 15641], [-75, 40], [-52, 43], [13, 55], [31, 30], [45, -5], [12, 65], [-95, 4], [-72, 54], [15, 29], [-73, 21], [-16, 53], [-75, 29], [6, 49]], [[23004, 16213], [87, 0], [41, -45], [32, -5], [31, 159], [-37, 20], [0, 43], [53, 81], [-2, 73], [47, 34], [142, 11], [17, 20]], [[23869, 16416], [-53, -91], [9, -67]], [[31103, 18846], [-53, -100], [-49, 10], [-8, -40], [-82, 16], [-68, -2], [-118, -64], [-66, -109]], [[26042, 21791], [-123, -11], [-96, -81], [-11, 93], [-28, 44], [-76, 19], [-30, -56], [-47, -19], [-26, -51], [-52, 18], [6, 55], [-158, 22], [-31, 46], [-38, 15], [-69, -7]], [[25669, 22260], [66, -36], [48, 36], [70, 17], [49, 30], [63, -6], [1, -56], [48, -18]], [[23214, 20949], [4, 28], [63, 36], [-41, 79], [-16, 71], [7, 77], [42, 24], [-21, 68], [28, 37], [-17, 110]], [[23263, 21479], [-10, 45], [24, 65], [-8, 47], [67, 28], [-13, 96], [-20, 52], [50, 54], [-53, 71], [32, 152], [60, 45]], [[23865, 27479], [-4, 84], [-27, 68], [-58, 68], [11, 94], [-12, 59], [5, 90], [49, 185], [96, 145], [40, 75], [23, 91], [38, -12], [28, 33], [38, -46], [38, 42], [189, 3], [80, -10], [106, -59], [54, -15], [7, -76], [-43, -132], [-73, -121], [-40, -32], [29, -95], [131, 2], [41, -24], [-4, -49], [-45, -77], [14, -95], [-10, -53], [31, -84], [50, -49], [237, -23]], [[24884, 27466], [-87, -50], [-55, -4], [-22, -56], [-47, -43], [-40, -80], [-26, 20], [-2, 76], [-36, 41], [-97, -14], [-10, 33], [-90, -66], [-62, -133], [7, -69], [-21, -40], [30, -38]], [[24326, 27043], [-206, 0], [-52, 39], [-52, -16], [-31, 30], [0, 90], [-25, 74], [-88, 15], [-17, -23]], [[29180, 17055], [-19, 59], [-77, 85], [-39, -39], [-61, -3], [-37, 39], [-21, 82], [-46, -2], [-54, -43], [-18, 99], [-16, 25], [-71, 7], [-76, 41], [-30, 61]], [[28959, 13787], [27, -47], [0, -70], [17, -44], [-11, -60], [-46, -37], [-1, -35], [-62, -24], [-42, 26], [-8, -57], [-37, -28], [37, -71], [-31, -7], [22, -88], [73, -11], [27, -57], [10, -62], [-30, -52], [-49, 21], [-33, -112], [1, -49], [-53, -85]], [[28770, 12838], [-21, 2], [-117, -77], [-16, -43]], [[26442, 16758], [-29, -44], [-12, -61], [-43, -36], [-62, 5], [-58, 36], [-6, 64], [-55, -7], [-13, 122], [-25, 45], [-80, -12]], [[26148, 17123], [74, -28], [44, -42], [46, 8], [74, -61], [89, 67], [79, -32]], [[29415, 25237], [79, -30], [19, 15], [114, -8], [21, -117], [89, -35], [74, -53], [84, -127], [-9, -88], [54, -23], [23, -65], [174, -41], [14, -24], [-17, -129]], [[29556, 23819], [-62, 19], [26, 53], [-6, 124], [-35, 11], [-124, -18], [-71, 116], [-15, 73], [-69, 1], [-17, 80], [27, 43], [-15, 84], [-75, 30], [34, 76], [-26, 56]], [[29160, 24685], [53, 36], [-43, 49], [50, 138], [-7, 41], [38, 45], [45, 129], [58, 38], [53, 8], [8, 68]], [[29909, 14762], [44, -33], [12, -69], [63, -61], [-41, -72], [16, -55], [-54, -14], [16, -96], [42, 11], [56, -24], [-18, -44], [46, -78], [1, -53], [35, -66], [-7, -54], [-145, -21], [-98, -53], [-73, -103], [34, -75], [-19, -79], [11, -51]], [[29830, 13672], [-42, -39], [3, -73]], [[29791, 13560], [-199, 28], [-38, -74], [-65, -1], [-101, -58]], [[29388, 13455], [-66, 45], [-85, 20], [-43, 49], [-20, 53], [27, 65], [-64, 28], [3, 107], [-41, -7]], [[29195, 14544], [65, -90], [67, 15], [15, -43], [64, -12], [19, 71], [116, -7], [26, 21], [-19, 47]], [[25634, 19527], [-44, 2], [-33, 72], [16, 26], [-57, 116]], [[25516, 19743], [6, 102], [30, 33], [13, 85], [56, 25], [114, 7], [-8, -68], [47, -24], [87, 35], [22, -49]], [[24148, 28569], [-196, 33], [11, 23]], [[23963, 28625], [32, 76], [-2, 67], [31, 64], [-8, 47], [-46, 105], [-42, 22]], [[23912, 29151], [41, 28], [69, -15]], [[26923, 15421], [2, -37], [36, -34], [64, -19], [23, 13], [92, -87], [-12, -46], [39, -42], [37, -91], [148, -65], [-1, -73], [84, -7], [23, -15]], [[27588, 14694], [-68, 64], [-118, 42], [-21, 43], [-83, 43], [-38, 3], [-86, 59], [-53, 74], [-20, -13], [12, -83], [-6, -66], [52, -38], [15, -119]], [[27174, 14703], [-56, 6], [-17, 41], [-41, 12], [-51, -80], [-67, -9], [-59, 46], [4, 39], [-31, 40], [-51, 22]], [[31291, 13060], [-97, 21], [-38, -12], [-79, -96], [-163, 8], [-56, 18], [-47, -14], [-47, -43], [-120, -77], [-19, -50], [-60, -427], [-27, -44], [-30, 9], [-88, 205], [-60, 82], [-15, 65], [5, 83], [-10, 128], [-66, 19], [-26, 73], [-91, 27], [-20, 102], [-155, 167], [-36, 27], [-23, 75], [2, 109], [-35, 28], [-99, 17]], [[29830, 13672], [103, 3], [19, -18], [82, 4], [42, -25], [117, -13], [24, -24], [11, -66], [26, -22], [89, 19], [24, -25], [71, 0], [4, 53], [27, 40], [16, 108], [27, 30], [-38, 58], [83, 75], [-1, 73], [49, -46], [55, 24], [50, -36], [70, 39], [82, -7]], [[30862, 13916], [27, -52], [74, -64], [143, -32]], [[24932, 15617], [19, 48], [-6, 142], [-14, 9]], [[25478, 15970], [45, -31], [66, -13], [36, 20], [103, -63], [26, -42], [65, -7], [31, -33], [34, 20], [79, -7], [26, 22]], [[36251, 7049], [-80, -26], [2, -90], [-24, -45], [-27, -112], [11, -67], [-27, -75], [28, -38], [-250, -498], [-107, -101]], [[35777, 5997], [-35, -17], [-19, -45], [-70, -30], [-63, 49], [-63, -72], [-46, -22], [-37, 46], [-46, -19], [-11, -91], [22, -56], [-14, -51], [56, -81], [16, -59], [44, -49], [-4, -78]], [[35507, 5422], [-45, -17], [-22, 56], [-66, -18], [-31, 27], [-73, -43], [-22, 63], [-123, -38], [-11, -159], [-55, -30]], [[24326, 27043], [0, -50], [-29, -21], [1, -128], [-29, -19], [88, -44], [53, 44], [30, -44], [70, 32], [23, -15], [-15, -60], [51, -50], [46, 10], [-65, -100], [40, -132], [98, -52]], [[24402, 25995], [-91, 67], [-70, 3], [-57, 102], [-45, 27], [-67, 8], [-79, -71], [-88, -28], [-50, 45], [17, 48], [-29, 62], [-36, 4], [23, 86], [-91, 67]], [[23739, 26415], [9, 53], [55, 36], [39, -26], [52, 22], [7, 42], [-40, 60], [45, 44], [-40, 64], [-67, -37], [-100, 55], [-5, 85], [-27, 85], [25, 24], [32, 126]], [[15102, 17933], [-74, -69], [-72, -42], [-35, -41], [-29, -85], [10, -29], [-25, -53], [20, -55], [91, -15], [28, -46], [-34, -61], [13, -56], [55, -39], [37, -92], [38, -3], [59, -49], [-88, -56], [-50, -7], [-56, -102], [-36, -42], [23, -45], [-20, -169], [49, -3], [99, -30], [57, 5], [29, -98], [-16, -53], [20, -24]], [[9960, 14381], [-70, 6], [-126, 51], [-14, 62], [148, 80], [80, 0], [-7, 71], [-34, 48], [-9, 114], [-38, 32], [20, 60], [-175, 75], [-9, 52], [-31, 41], [42, 106], [32, 33], [-39, 128], [57, 49], [40, -26], [75, 25]], [[11568, 17442], [48, 22], [30, -34], [90, 41], [35, 31], [89, -27], [28, 43], [7, 58], [122, -17], [89, 126], [57, -20], [31, 71], [76, -33], [24, -33], [50, -5], [68, 32], [26, 66], [64, -3], [32, 36], [31, -17], [55, 36], [48, -65], [64, 17], [58, -13], [22, -57], [97, 6], [75, -34], [68, 74]], [[17790, 25893], [29, -28], [60, 36], [105, 3], [52, -102], [95, 29], [32, -79], [-31, -39], [-16, -64], [-59, -63], [-25, -68], [-32, -40], [25, -44], [74, -16], [2, -51], [-26, -54], [62, -8], [28, -53], [53, 29], [55, 2], [36, 23], [67, -1], [15, 99], [63, -36], [12, -42], [61, -23], [20, 51], [91, -73], [29, 36], [52, -50], [56, -101], [-8, -73], [-38, -36], [17, -140]], [[26837, 26418], [-37, -6], [-119, 60], [31, 118], [-76, 45], [-50, -35], [-28, -67], [-47, -47]], [[26389, 26961], [94, -1], [112, -37], [47, -65], [76, -65], [56, -22], [35, 25], [21, 48], [44, 23], [98, -8], [43, 30], [50, 68], [47, -23], [15, -73], [87, -63], [157, -39], [42, -53], [-60, -78], [-304, 25], [-33, 7], [-52, -31], [-9, -44]], [[23880, 29345], [13, 36], [-107, 57], [-30, 36]], [[23961, 29651], [49, 65], [106, -42], [40, 32]], [[24156, 29706], [67, -68], [-45, -56], [82, -103]], [[24260, 29479], [-28, -38], [-8, -74]], [[24260, 29479], [73, 16], [77, -48], [84, -32], [12, -31], [111, 4]], [[24617, 29388], [10, -54], [65, -142]], [[17947, 17213], [24, -68], [70, 58], [14, 71], [-41, 121], [-53, 79], [43, 111], [41, -44], [32, -70], [38, -21], [51, 31], [19, -80], [54, -14], [54, -54], [83, 4], [40, -50], [19, -65], [-95, -63], [-28, -107], [8, -35], [-80, -130], [65, -49], [79, 19], [34, -98], [20, 13], [102, -21], [1, -54], [59, -28], [21, -33], [91, -55], [64, 8], [14, 85], [92, 21], [7, 91], [20, 51], [-24, 33], [40, 60], [-17, 77], [50, 13], [67, 43], [68, -1], [33, -55], [37, 10], [10, 51], [71, 48], [77, 25], [71, -25], [69, 11], [46, -12], [51, 22], [46, 56], [-15, 43], [44, 121], [35, 12], [16, 51], [54, -14], [43, 22]], [[19781, 17428], [46, -11], [22, 89], [59, -2], [36, -60], [17, -62], [-3, -72], [-54, -30], [-73, -117], [-15, -46], [32, -47], [-49, -27], [-33, -58], [-92, -43], [-113, -85], [-59, -74], [7, -38]], [[19380, 16019], [-53, -5], [-44, -57], [-128, -88], [-9, 21], [-84, -15], [-41, -28], [-30, -52], [-63, 11], [-51, -44], [-93, -27], [3, -87], [-59, -8], [-27, -42], [-52, -29]], [[18454, 15606], [-31, 30], [-79, -12], [15, 69], [56, 139], [-63, 40], [-13, 49], [-82, 32], [-55, 37], [-47, 76], [-66, 37], [-22, 129], [18, 89], [27, 39], [78, 12], [43, 26], [16, 54], [51, 76], [-48, 1], [-39, 67], [-48, 34], [-77, 101], [-40, -21], [-53, 3], [-23, 46], [-85, -40], [-26, -53], [-60, -29], [-28, 11], [-225, -120], [-82, -8], [-56, -43]], [[18128, 21052], [-1, -82], [-38, -48], [16, -40], [-55, -55], [-47, -2], [-24, -41], [41, -121], [95, -15], [47, 48], [84, -67], [-26, -64], [17, -64], [43, -72], [-59, -93], [24, -64], [-22, -103], [52, -111], [54, -52], [15, -262], [34, -56], [12, -85], [-11, -21]], [[18379, 19582], [5, 61], [-62, -14], [-68, 28], [-31, 46], [-56, 22], [-80, -64], [-18, -85], [27, -33], [-4, -53], [100, -38], [-21, -100], [1, -79], [-26, -4], [-66, 48], [-17, -64], [-34, -29], [-37, 27], [-34, -56], [-1, -48], [-98, -22], [-22, -56], [-49, -26], [-135, 28], [-87, -15], [-35, -28], [13, -62], [-13, -45], [-116, 16], [-17, -96], [-55, -68], [-33, -105], [71, -120], [-41, -35], [-70, 16], [-45, -38], [2, -34], [-40, -47], [-39, -102], [-47, -12], [-11, -64], [-35, -35], [9, -41], [41, -27], [49, -72]], [[15939, 20785], [-7, 75], [10, 182], [-26, 88], [11, 123], [35, 95], [3, 82], [-20, 54], [48, 97], [34, 22], [12, 53], [38, 46], [42, -86], [-14, -102], [12, -41], [-11, -75], [108, -40], [22, -100], [46, -25], [10, -61], [70, 7], [-3, 47], [24, 48], [59, 41], [-8, 55], [62, -5], [46, 66], [1, 41], [59, 47], [-15, 47], [83, 39], [8, 64], [-27, 37], [-87, 16], [-10, 35], [26, 53]], [[31311, 5654], [-55, 51], [-215, 59], [-77, -28], [-37, 27]], [[30651, 7449], [40, 19], [67, -6], [89, -61], [50, -8], [44, -81], [48, -28], [96, -97], [43, -17]], [[33684, 9225], [7, -76], [69, -88], [69, -28], [17, -58], [33, -21], [54, 46], [23, 54], [51, 19], [82, 76], [97, 38], [76, -31], [110, 38], [108, -31], [70, -33], [52, -4], [24, 34], [74, -8], [27, -28], [37, -161], [-35, -46], [-78, -35], [-49, -57], [-29, -122], [-38, -48]], [[33619, 8278], [-18, 56], [-46, 34], [21, 78], [-63, 70], [28, 53], [2, 123], [-61, 123], [-44, 32], [-48, 62], [-46, 23], [86, 47], [63, 66], [-10, 60], [26, 39], [69, -6], [-13, 79], [38, 41], [50, 0], [31, -33]], [[20496, 15003], [-20, -36], [11, -57], [-35, -35], [-36, -88], [-3, -43], [-98, -125], [-3, -78], [62, -13], [17, -55], [-52, -64], [-41, -10], [-17, -79], [-147, -44], [-59, -145], [-56, -30], [-36, 34], [-51, 3], [-27, -37], [45, -92], [5, -46], [-141, -7], [-20, -22], [-65, 23], [-26, -11]], [[19703, 13946], [-73, 20], [-67, -55], [-20, -34], [-67, -31], [-66, -78]], [[21345, 24432], [-37, 22]], [[21308, 24454], [-61, 36], [-100, 36], [-67, -5], [-48, 32], [37, 49], [0, 60], [-19, 51], [-94, 61], [-17, 44], [-53, -47], [-9, -30], [-58, -3], [-26, 22], [-49, -14], [-47, -42], [-57, -5], [-29, -26], [-50, 6], [-52, -62], [-6, -38], [-40, -19], [-92, 10], [-43, -55], [-82, 50], [-48, 54], [-3, 72], [-95, 27], [-59, 72], [-52, 15], [-97, -6], [-25, -43], [-51, -18]], [[20585, 26043], [22, 103], [53, -9], [59, 17], [90, 64], [29, 43], [64, -16], [38, -34], [58, -6], [92, 10], [48, 62], [-4, 28], [82, -2], [95, -24], [16, -33], [89, 51], [30, -6]], [[25408, 20490], [-21, 26]], [[25186, 21786], [-1, -64], [17, -62], [52, -68], [75, -29], [87, 33], [153, -87], [72, -7], [21, -71], [65, -111]], [[31242, 17202], [-29, -176], [-41, -147], [-91, -107], [-26, -109], [-54, -1], [-20, -116], [-30, -83], [-90, -150], [-98, -119], [-34, -110], [-78, -88], [-37, -156], [-24, -20], [-174, -64], [-163, -36]], [[30253, 15720], [-33, 72], [17, 72], [-34, 64], [-128, 120], [-2, 45], [50, 32], [-5, 67]], [[31131, 10190], [-2, -46], [42, -42], [-13, -58], [-41, -72], [-93, -22], [17, -115], [-73, -81]], [[30968, 9754], [-53, 57], [-86, 17], [-33, 55], [-94, 5], [-81, 79], [5, 114], [89, 17], [-8, 96], [-35, 82], [-75, 44]], [[30597, 10320], [172, -22], [53, 18], [178, 118]], [[31000, 10434], [73, -55], [-19, -47], [-55, -26], [38, -62], [23, -1], [71, -53]], [[19026, 20168], [-65, 13], [-41, 31], [-22, 60], [-84, 54], [44, 116], [-27, 83], [-52, -3], [-11, -28], [-78, -17], [-6, 138], [-78, 79], [32, 45], [77, 11]], [[19632, 20565], [14, 3]], [[19789, 20227], [-57, -109], [-110, -80], [-27, -65]], [[21445, 12574], [-52, -41], [-69, -116], [8, -72], [-35, -56]], [[21297, 12289], [-36, 28], [-49, -19], [-84, 83], [-124, 9], [11, 97], [-25, 26], [-71, -18], [-23, 27], [-29, 131], [-58, 63], [19, 16]], [[20828, 12732], [33, 7], [43, 46], [67, -3], [96, 38], [47, 59], [21, -13], [70, 21], [48, 52]], [[21253, 12939], [25, -100], [87, -103], [77, -78], [3, -84]], [[26912, 13458], [37, -17], [15, -70], [-1, -137], [57, -47], [-5, -95], [-56, -22], [-28, -47], [-19, -75]], [[25733, 12818], [34, 45], [-35, 37], [17, 61], [-3, 71], [41, 33], [33, -15], [118, 69], [38, 69], [15, 56], [63, 91], [-3, 43], [55, 32], [-24, 63]], [[26120, 13694], [91, -80], [66, 24], [35, -7], [108, -76], [51, 19], [73, -18], [20, -49], [50, -10], [24, -56], [44, -33], [98, -25], [16, -49], [99, 52], [17, 72]], [[23667, 18892], [2, 30], [53, 56], [62, 12], [21, 76]], [[24343, 18811], [17, -71], [-44, -5], [-33, -66], [-57, -41], [-21, -36]], [[31144, 23611], [55, -28], [-1, -99], [102, -54], [-3, -55], [-40, -65], [-14, -101], [-47, -64], [-107, -63], [-8, -62], [25, -27], [74, 0], [95, -17], [-28, -176], [38, -50], [232, -29], [-102, -38], [-2, -76], [152, -26], [48, -16], [-24, -43]], [[30265, 22825], [-11, 36], [-50, 26], [15, 108], [-39, 39], [1, 104], [-60, -6], [-14, 26]], [[30229, 23350], [70, -62], [73, 18], [152, -74], [130, -24], [11, 88], [44, 73], [50, 29], [27, 102], [97, 26], [87, 41], [149, -5], [25, 49]], [[29676, 11198], [-26, -77], [-32, 7], [-35, -42], [11, -34], [-18, -55], [-76, -5], [-47, -197], [-49, -66], [-53, 24], [-97, 14], [-42, -54]], [[29469, 11668], [10, -208], [48, -41], [92, -118], [62, -62], [-5, -41]], [[18116, 26557], [27, -8], [63, -112], [19, -53], [40, -8], [41, 47], [32, -10], [35, 33], [57, 23], [114, 70], [39, 89], [106, 33], [10, -53], [77, -40], [-17, -28], [27, -48], [68, -25], [31, -84], [41, -13], [50, 36], [-5, 46], [55, 83], [56, -56], [-9, -28], [57, -78], [98, 93], [60, 80], [77, 70], [47, -10], [26, -174], [56, -68], [121, -15]], [[30856, 19815], [39, 18], [19, 62], [42, 54], [29, 4], [36, -52], [66, 47], [4, 79], [37, 25], [43, -92], [80, -27], [26, 59], [62, 49], [108, 0], [30, 74]], [[33506, 3804], [-100, 11], [-43, 32], [28, 70], [-41, 69], [10, 20], [-52, 83], [-35, -60], [-45, 8], [-86, 78], [-149, 27], [-119, 82], [-52, -15], [-54, 23], [-15, 34], [-55, 46], [-12, 49]], [[32686, 4361], [4, 86], [-46, 95], [-339, 109], [-229, 68], [-42, 6]], [[20288, 19656], [73, -39], [-8, -64], [-47, -60], [-14, -127], [35, -52], [69, -7], [40, -34], [23, 70], [109, 50], [38, 30]], [[19917, 17985], [-37, -46], [-50, -28], [-36, 5], [-69, -65], [-45, -9], [-11, -49]], [[19669, 17793], [-20, 11], [-101, -107], [-79, -27], [-20, 81], [8, 84], [23, 23], [67, -27], [55, 156], [-7, 113], [-57, -25], [-38, -78], [-101, 9], [-32, 47], [43, 64], [4, 65], [-18, 59], [21, 39], [43, 10], [36, 49], [68, 20], [34, -69], [47, 50], [-60, 58], [-8, 36], [-106, 16], [-16, -19], [-87, -19], [-19, 78], [-47, 61], [3, 44], [79, 25], [31, -21], [37, 74], [101, 21], [37, 77], [-55, 39]], [[27298, 14039], [-27, 29], [-15, 62], [-132, 61]], [[27124, 14191], [-19, 56], [-59, 84], [-31, 104], [77, 130], [65, 46], [17, 92]], [[25406, 24997], [-49, 8], [12, 115], [48, 88], [-92, 89], [12, 46], [-26, 22], [-103, -15]], [[32433, 19698], [83, -87], [40, -119], [77, -79], [73, -32], [-24, -99], [1, -91], [188, -47], [64, -44], [-35, -185], [-25, -92], [-53, -68], [-55, -136], [-45, -50], [-52, -17], [-29, -55], [-62, 16], [-83, 91], [-143, 33], [-73, -18], [-129, 37]], [[32151, 18656], [-186, 102], [-115, 52]], [[29763, 18556], [-57, 18], [-56, -87], [-43, 12], [-19, -66], [-42, -42]], [[29305, 18800], [101, 90], [29, 51], [-39, 38], [-61, 23]], [[31363, 18590], [-28, -96], [87, -13], [47, -32], [-22, -85], [39, -21], [14, -124], [-14, -12], [125, -73], [30, -36], [-49, -26], [-47, -48], [-128, -81]], [[25151, 27353], [17, -47], [-30, -40], [2, -120], [-46, -44], [33, -38], [-107, -76], [-9, -116], [35, -63], [-8, -41], [23, -54], [51, -39], [25, -48], [99, -40], [54, -71], [3, -27]], [[24884, 27466], [52, 11], [84, -4], [88, -29], [43, -91]], [[25516, 19743], [-57, -32], [-78, 38], [-36, -75], [-55, -14], [-63, -43], [-47, -80]], [[26016, 18897], [-58, -9], [-69, -63], [-169, -15], [-21, -72], [-37, -28], [-56, -10]], [[25606, 18700], [-32, 50], [18, 51], [-69, -7], [-27, -38], [-60, -3], [-45, 48], [-72, -1], [-48, -26], [-56, 33], [4, 31], [-77, 21], [-11, 22], [-75, -4], [-23, 155], [-35, 27]], [[30687, 23900], [31, -64], [64, -12], [18, -76], [58, -9], [87, 87], [44, 10], [-13, -119], [168, -106]], [[26654, 21706], [-45, -4], [-73, 63], [-14, 44]], [[31575, 10713], [-22, -84], [27, -36], [-5, -55], [33, -59], [-53, -43], [-66, 9], [-29, -32], [-93, 1], [0, -51], [-25, -78], [-66, -26], [-49, -77], [-35, -30], [-61, 38]], [[31000, 10434], [7, 34], [54, 104], [-48, 161], [-39, 40], [-47, 96]], [[29676, 11198], [46, -18], [14, -41], [41, -32], [146, -65], [55, -67], [95, -16], [24, -67], [-15, -27], [82, -119], [61, -36], [24, -54], [16, -96], [110, -111]], [[30375, 10449], [-70, -71], [11, -48], [-29, -64], [7, -65], [-57, -15], [-9, -43], [-69, -3], [-50, -44]], [[26912, 13458], [-2, 56], [66, 29], [43, -2], [20, 54], [-43, 34], [44, 34], [39, -2], [45, 52], [25, -1], [94, 47], [28, 30], [12, 56], [43, 21], [23, 47]], [[25526, 23387], [55, -17], [85, -53], [97, 29], [33, -58], [28, 61], [39, 19], [66, -37], [185, -29], [-9, -63], [48, -8], [87, -191], [-54, -60], [16, -58], [-14, -68], [-40, -26], [-22, -48], [44, -43], [73, -5]], [[25365, 22470], [-28, 50], [12, 114], [-27, 56], [-57, 3], [-30, -28], [-133, -63], [-40, 33], [-5, 49], [-62, 39], [17, 31], [-30, 51]], [[30084, 21085], [32, -80], [-24, -7], [-9, -67], [69, -58], [39, 18], [18, -80], [58, -78], [48, -45], [73, -35], [45, 1], [49, -40]], [[30482, 20614], [8, -83], [-37, -59], [9, -88], [-65, -51], [-19, -42], [15, -49]], [[29718, 20131], [-16, 47], [-49, -2], [-36, 36]], [[29617, 20212], [15, 39], [-34, 56], [-53, 3], [-18, 71], [7, 92], [29, 20], [24, 69], [53, -3], [79, 51], [33, 77], [46, 6], [64, 151], [-12, 46], [28, 63], [31, 13], [-24, 61], [43, 54], [-34, 44]], [[25606, 18700], [-21, -42], [14, -53], [100, -87], [83, -136], [-31, -4], [-4, -69], [35, -62], [-20, -127], [36, -18], [-13, -57], [31, -17]], [[16297, 26920], [17, 67], [-32, 54], [-16, 72], [27, 90], [48, 40], [65, -22], [28, 34], [-48, 52], [9, 75], [60, 1], [32, 40], [40, -10], [41, -41], [64, -5], [35, 72], [76, 9], [119, -51], [48, -43], [15, -40], [50, -47], [114, -25], [59, -54], [20, 70], [27, 22], [7, 65], [33, 28], [-17, 114], [-40, 13], [36, 65], [46, 34], [-21, 50], [45, 50], [79, -42], [51, 3], [61, -22], [113, 49], [31, 50], [33, 1], [26, -53], [34, -14], [-27, -58], [-29, 3], [-24, -58], [41, -132], [47, -93], [-47, -30], [-17, -78], [30, -60], [-31, -18], [-27, -67], [-53, -28], [-15, -82], [-26, -58], [22, -31], [-40, -64], [15, -37], [44, 0], [22, -48]], [[26225, 16333], [-103, 19], [-49, 38], [-36, -30], [-53, 1], [-87, -25], [-44, -40], [-19, 47], [-53, 15], [-40, 55], [-60, 14]], [[23700, 26408], [39, 7]], [[21268, 23430], [80, 34], [57, -55], [93, 25], [12, 48], [35, 7], [19, -73], [-86, -103], [53, -97], [-9, -38], [62, -34], [-21, -32], [40, -35], [26, -68], [25, -4], [85, -59], [98, 16], [7, -64], [-32, -101], [-51, -28], [5, -94], [52, -19], [9, -48], [-71, -52], [22, -63]], [[21778, 22493], [-86, 28], [-58, -22], [-71, 78], [-67, -50], [-28, 59], [-43, -46]], [[20567, 20100], [-65, -61], [-69, -18], [-25, -29], [-61, 27], [-67, -38], [-46, -65], [-17, -114]], [[20472, 20523], [37, 11], [66, -45], [14, -83], [104, -32], [-22, -55], [35, -79], [-117, -77], [-22, -63]], [[28319, 24167], [-17, -70], [38, -30], [-43, -46], [-21, -85], [52, -26], [8, -42], [41, -38], [-13, -37], [17, -45], [-24, -32], [43, -92], [-19, -47], [40, -73], [13, -51], [32, -25], [-38, -39], [30, -54], [59, -13], [94, -121]], [[28611, 23201], [60, -75], [-10, -43], [-63, -4], [-15, -49], [81, -147], [56, 22], [25, -71], [-42, -69], [-33, -22]], [[26857, 23414], [-1, 86], [-27, 34], [-3, 49], [-30, 67], [63, 96], [-24, 122]], [[26835, 23868], [81, 71], [-13, 66], [71, -35], [55, 8], [138, -31], [120, -94], [63, 66], [56, 4], [34, 35], [-28, 53], [-23, 118], [-60, 0], [-41, 53], [-84, 74], [-6, 71], [-27, 106], [-35, 18], [-40, 66], [54, 26], [14, 37]], [[30053, 9204], [-52, -44], [-37, -53], [-58, -25], [-50, -48], [-119, -192], [3, -62], [-45, -36], [-10, -59], [-54, -88], [58, -70], [7, -45], [51, -48], [25, -76], [32, -26], [-57, -57], [80, -117], [96, -60], [30, -40], [-93, -93], [-50, -39], [-21, -84], [-60, -64], [18, -52], [-9, -47], [-68, -73], [-115, -2], [-49, -58], [-70, -125], [-47, -33], [-40, -65], [-41, -8], [-63, -86], [-124, -90], [-65, -20], [-66, -121], [-83, -63], [-117, -44]], [[28790, 6891], [-11, 23], [-18, 140], [-45, 91], [-67, 23], [3, 48], [64, 58], [19, 57], [-40, 36], [9, 29], [-113, 120], [-50, 30], [-25, 39], [-109, 20], [-61, 49], [-23, 59], [-54, 13], [-45, 68], [-69, 42], [-3, 53], [-29, 28], [-97, -7], [-24, 44], [-102, 17], [-124, -8], [-84, -28], [-27, 9], [-15, 56], [-38, 34], [-120, 33], [-17, 20], [38, 200], [-35, 60], [-47, 14], [-36, 56], [18, 45], [-28, 31], [-67, 2], [-27, 23], [3, 46], [-73, 49], [-19, 105], [-28, 49], [6, 80], [109, 55], [84, 70], [29, 66], [-2, 54], [-29, 122], [49, 31], [82, 4], [45, 33], [2, 46], [29, 72]], [[32402, 8108], [12, 49], [-23, 44], [22, 29], [6, 93], [28, 67], [59, -22], [9, 66], [92, 123], [30, 62]], [[32758, 8737], [77, -74], [27, -5], [63, -57], [3, -61], [61, -68], [-41, -64], [18, -70], [58, -17], [-63, -104], [5, -47], [-23, -49]], [[31269, 9918], [66, 63], [82, 14], [34, -97], [134, -10], [91, 97], [-19, 54], [-41, 5], [-32, 99], [3, 31], [46, 80], [49, 10], [218, -128]], [[31900, 10136], [25, -32]], [[21813, 19933], [31, -82], [107, -161], [-58, -66], [7, -42], [47, -73], [94, 25], [49, -57], [37, 61], [58, 18], [95, -95], [-35, -23], [1, -50], [77, -46], [-22, -44], [44, -95], [-1, -53], [66, -64], [-20, -33], [40, -30], [-20, -68], [106, -19], [32, -32], [6, -47], [92, -61], [-9, -78], [-126, -79], [-44, -50], [-14, -56], [71, -6], [0, -74], [46, -17], [-38, -54], [12, -31], [72, -7]], [[24868, 15492], [-20, 38], [-41, 1], [-34, -66], [20, -42], [-41, -64], [-73, -34], [-49, 6], [-52, 61], [-155, 36], [-28, -5], [-28, -115], [-35, -20], [-35, -81], [-37, 0], [-35, 65], [-63, -22], [-13, 60], [-136, -29], [-52, -40], [-45, 45]], [[23825, 16258], [69, -17], [32, 23], [59, -24], [69, -2], [46, -38], [21, 25], [51, -30], [16, -67], [35, 19], [88, -47], [39, -54], [45, 19], [73, -39], [160, -20], [56, -126], [87, -39], [11, -36], [104, -8]], [[30253, 15720], [-77, -14], [-90, -43], [-49, -116], [-150, -52], [-19, -25], [-5, -115]], [[29757, 15301], [-43, 20], [-10, 35], [-137, 23], [-29, 19], [6, 77], [-44, 127], [14, 61], [-59, 45], [-64, -23], [-34, 12], [-67, 75], [10, 85], [-12, 78]], [[16123, 22743], [-43, -99], [7, -62], [-36, -27], [27, -41], [-13, -47], [35, -53], [-18, -33], [0, -74], [56, -16], [15, -41], [36, -17], [9, 78], [62, 106], [-13, 31], [69, 89], [38, 29], [42, 78], [27, 17], [36, 80], [8, 99], [71, -56], [19, -94], [-16, -50], [76, -113], [66, -61], [-40, -134], [53, -72], [-2, -26], [42, -61], [5, -61]], [[33166, 9836], [48, -3], [44, 38]], [[33258, 9871], [99, -55], [50, 13], [64, -97], [-8, -17], [39, -82], [68, -72], [32, -109], [33, -67], [45, -33], [-14, -41], [18, -86]], [[29017, 6526], [-64, 11], [-80, -22], [-12, 61], [-32, 8], [-21, 64], [-70, 62], [2, 52], [-32, 99], [82, 30]], [[30143, 9206], [53, -39], [97, -138], [49, -40], [85, -22], [47, -32], [48, 57], [128, -129], [7, -98], [81, -34], [50, 13], [64, -17], [86, -3], [21, -75], [-45, 3], [-19, -48], [45, -14], [78, 2], [54, 36], [58, -19], [78, 44]], [[31613, 8349], [25, -79], [21, -177], [-11, -56]], [[20567, 20100], [50, -1], [-9, -46], [77, -14], [-7, -60], [61, -88], [137, 48]], [[21778, 22493], [64, -98], [61, 1], [17, 33], [-12, 52], [81, -14], [16, 52], [-35, 49], [34, 47], [70, -52], [50, 23]], [[22124, 22586], [44, 3], [26, 37], [55, 10], [87, -17], [64, -57], [-31, -41]], [[22369, 22521], [-96, -27], [-35, 19], [-42, -61], [-13, -58], [38, -25], [23, -52], [35, 0], [33, -116], [-7, -96], [-39, -57], [26, -47], [8, -80], [-26, -27], [-43, 13], [-32, -29], [6, -85], [44, -44], [8, -136], [58, -32], [77, -20], [-2, -82], [-32, -46], [69, -45], [30, -38], [32, -90], [-66, -70], [8, -53], [-47, -69], [-6, -63]], [[22378, 21005], [-30, 40], [-71, 6], [-45, 63], [-39, -18], [-19, -53], [17, -79], [-46, -49], [-35, 50], [-65, -20], [-25, -35], [-62, 30], [-63, -7], [10, 76], [-33, 73], [54, 46], [-38, 91], [-41, 34], [-76, 33], [-27, -91], [-85, -10], [-59, 39], [4, 64], [-67, -19], [-51, 36], [48, 53], [-58, 89], [-20, -30], [-39, 82], [17, 54], [-70, -10], [-48, -37], [37, -87], [-17, -47], [-40, -34], [-30, -62], [-48, 17], [43, 49], [-1, 67], [-30, 45], [-49, 13], [-17, 39]], [[25994, 14085], [48, -25], [71, 52], [25, 48], [72, 41], [123, -12], [31, -12], [101, 9], [43, -47], [152, -47], [29, -33], [66, 3], [106, -24], [12, 45], [56, 31], [58, -1], [34, 66], [103, 12]], [[7511, 14205], [14, 59], [82, 79], [30, 90], [-60, 130], [10, 74], [-77, 30], [13, 46], [-11, 49], [14, 48], [-107, 169], [4, 55], [-29, 52], [-63, 74], [6, 49], [-82, 64], [-4, 49], [71, 36], [55, 72], [-1, 39], [-39, 58], [-7, 63], [34, 86], [-17, 72], [34, 112], [-5, 49], [-50, 46], [-31, 58], [-2, 49], [47, 60], [-20, 72], [27, 70], [-49, 35], [-10, 46], [-87, 31], [-68, 12], [-20, 60], [23, 19], [81, 8], [-59, 75], [-55, 122], [29, 48], [-40, 44], [-70, 23], [-60, 40], [-109, -9], [-101, 21], [-77, 37], [-69, -12], [-63, 58], [-30, 1], [-51, 61], [1, 30], [-71, 121], [-90, 99], [31, 52], [24, 87], [-10, 64], [-25, 26], [-2, 89], [-18, 34], [100, 57], [15, 65], [48, -12], [31, 49], [74, 55], [-14, 28], [18, 70], [176, 137], [88, 52], [87, 16], [31, 143], [-12, 39]], [[25844, 14303], [-37, 101], [48, 13], [28, 43], [-22, 59], [26, 29], [86, 24], [23, 56]], [[26157, 24356], [-39, -67], [38, -69], [-27, -65], [40, -25], [-28, -42], [-86, 3], [12, -51], [60, -43], [26, 3], [76, -61], [4, -63], [63, -24], [59, 2], [11, 29], [106, 84], [39, -16], [60, 45], [127, -49], [48, 25], [43, -48], [2, -45], [44, -11]], [[21365, 11631], [-37, 63], [-56, 54], [-9, 108], [32, 51]], [[21295, 11907], [45, -8], [26, 29], [60, -69], [17, 18], [-39, 60], [3, 126], [37, 148], [-3, 129], [16, 48], [85, -35], [32, 52], [-45, 162], [-84, 7]], [[21253, 12939], [-11, 111], [-25, 52], [-82, 73], [44, 69], [178, 76]], [[26967, 19911], [103, 26], [34, -61], [-69, -130], [19, -42], [93, -25], [35, 60], [65, 28], [46, -46], [38, -11]], [[27331, 19710], [2, -60], [-33, -50], [-106, -5], [-53, -54], [-3, -73], [-38, -39]], [[16642, 11813], [74, -58], [123, -60], [57, 0], [49, -107], [106, -86], [10, -118], [-3, -96], [60, -86], [-6, -90], [-68, -126], [-80, -93], [-107, -19], [-287, 128], [-34, 6], [-66, -28], [-5, 100], [-62, 39], [-41, -22], [-37, -81], [-112, 92], [-4, 58], [-56, -53], [-24, -77], [-61, 18], [37, 57], [-166, 111], [-25, 4], [24, -334], [-57, -29], [-121, -114], [-39, -63], [-102, -78], [-138, -147], [-31, -60], [134, -70], [93, -75], [-166, -453], [-44, -112], [-146, -407]], [[15321, 9284], [-123, 24], [-142, -10], [-225, 9]], [[22378, 21005], [60, 26], [105, 2], [21, 79], [23, 20], [2, 97], [26, 32], [-38, 84], [103, 42], [74, -30], [43, 33], [-15, 68], [-25, 36], [27, 52], [-22, 40], [26, 55], [54, -83], [-36, -31], [59, -31], [44, 55], [-10, 102], [-27, 23], [36, 56], [35, -29], [132, 67], [81, -103], [24, -108], [25, -58], [58, -22]], [[30482, 20614], [49, 7], [57, 31], [11, 90], [30, 43], [62, 40], [93, -20], [19, -52], [45, -59], [-1, -29], [56, -68], [9, -36], [43, -6], [46, 29], [90, -28], [56, -86], [-11, -58], [89, 72], [44, -2]], [[18179, 12597], [84, 97], [-66, 72], [-127, 112]], [[22693, 26836], [-53, 28], [5, 59], [-8, 103], [74, 70], [45, -19], [64, 0], [56, 78], [32, 81], [39, 21], [13, 51]], [[22960, 27308], [35, 29], [13, 66], [40, 15], [134, -8]], [[22369, 22521], [60, -24], [39, 9], [51, -31], [89, 6], [76, -73], [59, 6], [19, -54], [43, -34], [86, 1], [18, 29], [53, -20], [117, 7], [46, 63], [-16, 34], [-112, 8], [10, 52], [-24, 63], [2, 40], [37, 55]], [[20828, 12732], [-63, 81], [-6, 74], [-25, 51], [7, 79], [-23, 92], [16, 134]], [[28949, 5698], [-55, 6], [-13, 34], [-52, 41], [-29, -29], [-124, 4], [-25, 30], [-48, 4], [-45, -27], [-76, 11], [-74, -74], [-58, -15], [-39, 10], [-24, 51], [-119, 27], [-83, -2], [-76, -18], [-153, 109], [-62, 18], [-30, 64], [-96, 31], [-71, -64], [-100, 29], [20, 43], [-24, 42], [-2, 96], [-160, 22], [-166, -1], [-29, 43], [-62, 13], [-114, 161], [-19, 12], [-67, 141], [-9, 73], [35, 81], [-57, 72], [-139, 63], [-132, 154], [-191, 74], [-116, 4], [-105, 27], [-39, -1], [-115, -37], [-113, 54], [-6, 74], [-27, 61], [-66, 90], [-95, 76], [-11, 39], [-54, 58], [-90, 18], [-26, 43], [-36, 15], [-93, 93], [-79, -20], [-231, -1], [-121, -28], [-48, 5], [-88, -27], [-70, -37], [-40, -54], [-71, -59], [-30, 14], [-159, 1], [-66, -12], [-126, 91], [-87, 180], [-32, 110], [9, 58], [-50, 76], [-27, 78], [5, 61], [66, 43], [7, 48], [44, 71], [52, 58], [65, 31], [56, 50], [59, 92], [11, 60], [-11, 49], [-95, 22], [-106, 138], [-25, 20], [-67, 2], [-58, 49], [-122, 54]], [[23954, 8864], [150, 141], [68, 0], [53, 37], [39, 87], [154, 109], [-8, 50], [104, 172], [62, 33], [32, 39], [65, 31], [34, 67], [42, 15], [66, -6], [47, -22], [50, 12], [65, 164], [60, 63], [68, 5], [-3, 33], [54, 53], [40, -2], [26, 44], [43, -17], [98, -132], [7, -28], [121, -21], [62, 24], [52, -23], [50, 53], [84, 9], [12, 56], [42, 9], [59, -42], [-5, -94], [40, -1], [77, -63], [24, -3], [86, 63], [12, -31], [-33, -47], [67, -42], [11, -41], [77, 7], [0, 39], [79, 26], [3, 35]], [[30968, 9754], [18, -37], [82, -61], [73, -25]], [[31028, 9175], [-157, 108], [-12, 33], [-111, 132], [-43, 13], [-91, 68], [-85, 10], [-13, 52], [-93, 19], [-28, -40], [-46, -11]], [[30375, 10449], [10, -55], [42, -39], [72, -30], [98, -5]], [[24819, 14425], [31, 37], [6, 48], [84, 59], [35, 87], [27, -5], [71, 56], [65, -2], [33, 62], [33, 4], [26, 109], [-40, 33], [14, 49]], [[27002, 17326], [24, 56], [-28, 26], [47, 44], [60, 18], [79, 1], [42, 56], [-2, 122], [26, 18], [-13, 49]], [[22091, 27319], [21, 51], [55, -17], [72, 8], [89, -45], [65, 5], [18, 42], [46, 46], [62, -7], [61, 33], [94, 16], [64, -38], [13, -50], [40, -5], [20, 46], [49, -4], [69, -49], [31, -43]], [[25151, 27353], [56, -28], [144, -9], [46, -32], [38, 20], [65, 1], [233, -17], [59, -38], [38, -3]], [[4842, 8193], [-13, 63], [-79, 11], [-28, 70], [20, 34], [-39, 32], [-121, -37], [-65, 11], [-71, 92], [-83, -19], [-74, 34], [-35, -24], [-97, 13], [-82, 54], [-58, -11], [-90, 36], [-38, 1], [-95, 52], [-64, -10], [-58, 57], [-53, -17], [-26, 25], [-94, 14]], [[5575, 9509], [-74, 129], [-39, 30], [44, 52], [31, 134], [18, 40], [-93, 7], [-145, -13], [-207, -29], [-135, 6], [-81, -64], [-96, 39], [-81, -24], [-20, -34], [20, -55], [70, -28], [-65, -82], [21, -41], [72, -38], [90, 38], [211, 3], [24, -36], [40, -10], [70, 24], [108, -25], [217, -23]], [[11597, 6694], [16, -91], [38, -101], [95, -120], [119, -96], [5, -83], [-49, -156], [53, -43], [79, -149], [-32, -19], [35, -114], [-52, -98], [-8, -101], [-73, -38], [-109, -217], [-22, -63], [29, -48], [-33, -28], [17, -66], [-37, -48], [-40, -128], [-88, -35], [-33, -51], [-2, -77], [-53, -7], [-8, 33], [-111, -12], [-11, -55], [-40, -13], [-29, -54], [-2, -55], [-99, -11], [-65, 6], [-39, 25], [-99, -23], [-21, -54], [-51, -54], [-51, -1], [-52, -67], [-44, -10], [-28, -82], [29, -47], [-55, -63], [-32, 12], [-52, -77], [-85, -35], [-39, -43], [-41, -8], [-20, -52], [64, -49], [-17, -59], [-49, -12], [-96, -116], [19, -27], [67, -16], [15, -52], [-26, -29], [31, -47], [-22, -51], [-63, -13], [-84, 20], [-81, 40], [-151, -88], [-65, 9], [-86, -16], [-42, 60], [-67, 35], [-1, 80], [30, 46], [-48, 47], [8, 37], [-95, 71], [-44, 64], [-106, 33], [-63, -18], [-53, 40], [-97, -23], [-108, -14], [-44, 6], [-55, 39], [-35, 74], [-59, 45], [-34, 51], [-29, 77], [5, 39], [-36, 390], [30, 61], [-12, 113], [-21, 51], [-69, 54], [-40, 67]], [[9542, 6812], [401, 60]], [[19669, 17793], [20, -50], [46, 4], [10, -40], [-23, -54], [19, -44], [-39, -98], [19, -65], [60, -18]], [[18379, 19582], [87, -65], [65, -8], [26, -57], [105, -6], [19, 42], [-22, 66], [15, 37], [97, -23]], [[20315, 10321], [-140, 139], [-56, -61], [-148, 8], [-103, -14], [6, -178], [-283, 57], [-139, 2], [-275, -71], [-249, -127], [-186, -104], [-106, -11], [-60, 12], [-229, -73], [-166, -236], [-144, -23], [-442, -136], [-329, -25], [-33, 41], [-186, -19], [-292, 55], [-332, -49], [-253, -40], [-223, -27], [-626, -157]], [[19703, 13946], [74, -21], [6, -44], [241, -11], [47, -23], [117, -32], [150, -81], [78, -29], [144, 15]], [[21297, 12289], [-5, -26], [-88, -71], [12, -55], [104, -29], [-18, -37], [-7, -164]], [[2583, 14536], [-44, 9], [-24, 59], [-52, 70], [-29, -24], [-88, 41], [-30, -9], [-41, 46], [51, 39], [-23, 60], [8, 79], [-23, 95], [-67, 32], [29, 64], [-8, 39], [31, 64], [10, 56], [61, 49], [8, 42], [40, 26], [14, 88], [50, 59], [-27, 48], [-3, 77], [30, 96], [-28, 102], [33, 14], [3, 52], [-26, 34], [3, 68], [-45, 61], [-85, 13], [-37, 64], [-78, 2], [-25, 24], [-51, -75], [-38, -31], [-11, -117], [26, -36], [-18, -85], [-90, 46], [-74, 1], [-95, 41], [34, 96], [-16, 89], [16, 28], [-72, 65], [6, 55], [37, 8], [48, 96], [-8, 18], [68, 52], [29, 59], [-81, 40], [-19, 25], [39, 68], [13, 75], [42, 71], [-60, 39], [-26, 46], [23, 42], [-46, 58], [18, 56], [39, 18], [54, 107], [7, 126], [50, 53], [68, -3], [14, 58], [77, 2], [6, -46], [71, -24], [1, 44], [56, 9], [19, 66], [74, 13], [64, 30], [35, 89], [41, 1], [-5, 48], [68, 162], [-1, 32], [54, 46], [52, -15], [75, 37], [16, 41], [98, 51], [27, 40], [47, -8], [77, 76], [55, 89], [50, 19], [22, 34], [54, 31], [19, 92], [-9, 79], [35, 45], [90, -12], [23, -52], [90, -65], [34, -78], [10, -97], [79, 59], [30, -45], [40, -3], [101, 72], [65, 22], [79, 63], [82, -5], [6, 39], [-31, 50], [23, 35]], [[23978, 29899], [23, 197]], [[24001, 30096], [22, -50], [41, -22], [157, -6], [18, -23], [11, -94], [82, -69]], [[24332, 29832], [-90, -12], [-79, -52], [-7, -62]], [[30081, 14904], [96, -51], [55, -96], [124, -50], [24, -103], [79, -42], [120, -94], [29, -47], [86, -25], [69, 131], [65, -25], [-14, -40], [-131, -97], [-14, -82], [47, -26], [106, -8], [184, -32], [70, -22], [26, -58], [-25, -22], [-77, -21], [-115, -68], [-23, -110]], [[31925, 10822], [38, -63], [47, -29], [25, -55], [-34, -19], [33, -66], [44, -42], [18, -89], [-28, -84], [-20, -111], [-126, -46], [13, -48], [-35, -34]], [[35777, 5997], [64, -47], [25, -46], [74, 5], [36, -66], [63, 3], [82, -107], [26, -50], [-31, -19], [6, -54], [57, -30], [37, -92], [42, 40], [50, 12], [533, 34], [69, 18], [47, -36], [45, -73], [-48, -104], [-11, -138], [17, -67], [70, -55], [45, -73], [9, -55], [-34, -96], [8, -64], [58, -23], [-11, -32], [30, -45], [18, -76], [-44, -63], [76, -53], [23, -70], [-45, -54], [36, -43], [-70, -73]], [[36044, 5065], [-35, 15], [-94, 5], [-50, 97], [29, 55], [-65, 45], [11, 39], [-71, 43], [-46, -13], [-125, 11], [3, 33], [-94, 27]], [[36088, 3549], [-113, -7], [-41, 51], [-143, 35], [-86, 51], [-78, -18], [-27, 41], [-50, 7], [-25, -45], [-68, 4], [-28, 22], [-75, 12], [-67, 52], [-56, 10], [-38, -23], [-25, -77], [-77, -78], [-115, -55], [-32, -66], [39, -59], [-8, -27], [31, -66], [-47, -34]], [[29214, 21511], [2, -109], [-28, -39], [-118, -24], [12, -82], [-38, -50], [43, -35], [-17, -152], [-59, -72], [-67, 52], [-56, -30], [-23, 72], [-80, 9], [-33, 87], [10, 37], [-57, 38]], [[27331, 19710], [27, 39], [81, 1], [56, 65], [31, 74], [62, 68], [42, 70], [38, 12]], [[29259, 20123], [70, -32], [52, 21], [52, -28], [58, -3], [48, 18], [45, 102], [33, 11]], [[33923, 2665], [-55, -15], [-32, 45], [-37, 5], [-56, -72], [-75, -10], [-74, 20], [11, -76], [-48, 20], [-97, -14], [-91, 30], [-103, 60], [-55, 3], [-59, -22], [-50, 19], [-56, -2], [-94, -66], [-22, -61], [-56, 1], [-26, -22], [-16, -95], [-37, -34], [-6, -54], [32, -69], [-14, -80], [-120, -11], [-41, -34], [7, -57], [-55, -45], [22, -94], [-60, -59], [-12, -67], [-47, -21], [-84, -99], [-58, -28]], [[31436, 3485], [155, 9], [41, 107], [117, 8], [36, -19], [93, -121], [67, -13], [50, 35], [90, -48], [91, 81], [-62, 60], [-30, 94], [46, 124], [20, 25], [61, 3], [74, 41], [108, -25], [49, 26], [12, 47], [107, -53], [64, 44], [44, 158], [-26, 60], [25, 45], [-23, 84], [23, 99], [18, 5]], [[22124, 22586], [28, 92], [-49, 73], [27, 44], [-49, 70], [34, 39], [33, -3], [56, 34], [-3, 27], [-53, 72], [37, 115], [-39, 3], [-34, -31], [-55, 9], [-41, 41], [-57, -6], [-78, 28], [16, 108], [123, -16], [10, 43], [48, 0], [63, 56], [78, -17], [-21, 119], [39, 47], [44, -12], [50, 16], [32, 36], [50, -22], [105, 42], [42, -12], [-9, 78], [-32, 11], [-11, 57], [-48, 94], [16, 81], [43, -20], [19, 72], [80, 39], [13, 39]], [[21230, 24204], [46, 46], [19, 76], [-40, 29], [56, 64], [-3, 35]], [[29631, 23536], [19, -63], [-85, -66], [-23, 21], [-65, -55], [-103, 15], [-41, -23], [-52, 22], [-25, 126], [-108, -44], [-25, -103], [-40, -62], [-71, 10], [-64, 68], [-67, -56], [1, -34], [-68, -34], [-17, -31], [-46, 7], [-140, -33]], [[24332, 29832], [22, -31], [186, -14], [62, -42], [14, -151], [-7, -73], [8, -133]], [[23308, 30103], [63, 13], [88, -4], [49, 20], [81, 0], [48, 38], [111, 61], [155, -1], [39, -22], [59, -112]], [[32151, 18656], [-33, -189], [-54, -101], [11, -53], [3, -151], [-19, -187]], [[23015, 29218], [-11, 37], [8, 96], [-13, 65], [30, 167], [0, 116], [47, 64]], [[29396, 27391], [-162, 66], [-80, 50], [-54, 59], [-69, 108], [-3, 40], [42, 124], [40, 38], [121, 48], [128, 14], [122, -29], [65, -33], [115, -94], [69, -116], [3, -46], [-18, -112], [-35, -72], [-81, -61], [-115, -5], [-88, 21]], [[29388, 13455], [-17, -135], [72, -95], [105, -28], [25, -23], [-39, -129], [-83, -59], [-34, -46], [-81, -35], [-46, -106], [-65, -27], [-64, 7], [-128, 33], [-263, 26]], [[15547, 25104], [14, 33], [-26, 39], [-73, 33], [-16, 34], [-56, 9], [12, 107], [-8, 47], [70, 9], [28, 47], [11, 77], [23, 39], [-64, 42], [16, 52], [38, -4], [30, 58], [-24, 65], [39, 30], [-52, 96], [90, 31], [81, 62], [90, 4], [99, -22], [57, 39], [57, 3]], [[23963, 28625], [-143, 3], [-62, 17], [-57, 59]], [[32049, 11063], [140, -25], [195, -19], [58, -12], [-7, -129], [31, -77], [66, -45], [7, -53], [-25, -19], [53, -110], [107, -125], [34, -16], [14, -58], [43, -30], [39, -71], [93, 0], [-31, -45], [90, -78], [52, -25], [16, -39], [76, 11], [27, -75], [45, -19], [6, -43], [45, -33], [35, -57]], [[23954, 8864], [-52, 22], [-65, 69], [-105, 151], [-23, 13], [-59, 129], [-95, 87], [-17, 47], [-60, 40]], [[32456, 23361], [-36, 32], [-26, 84], [-39, 33], [-95, 29], [-113, 79], [-46, 104], [-32, 158], [-44, 66], [-36, 19], [-38, 53], [-20, 91], [-50, 83], [-60, 188], [-28, 20], [-17, 113], [-30, 35], [-47, 158], [-46, 67], [1, 47], [-32, 81], [38, 215], [-24, 24], [7, 57], [-14, 119], [-23, 32], [22, 59], [69, 26], [88, 179], [43, 67], [1, 62], [83, 77], [191, 94], [40, 40], [49, 81], [38, 97], [-14, 62], [22, 33], [89, 27], [49, -94], [-38, -241], [36, -200], [33, -107], [64, -53], [45, -74], [65, -161], [25, -105], [21, -21], [-10, -75], [38, -113], [17, -131], [1, -201], [17, -119], [-4, -89], [24, -47], [-29, -66], [27, -45], [-1, -60], [46, -54], [22, -152], [30, -48], [9, -98], [-34, -39], [-36, -130], [13, -72], [49, -78], [7, -48], [-30, -71], [-128, -16], [-97, -55], [-54, -50], [-48, 22]], [[27240, 26299], [-49, -7], [-81, 54], [-46, 2], [-85, 90], [6, 122], [-10, 60], [56, 32], [447, -36], [-14, -160], [-49, -120], [-73, -57], [-65, -1], [-37, 21]]],
  "transform": {
    "scale": [0.025671881267549143, 0.024827755066636155],
    "translate": [-1.1368683772161603e-13, 104.71606829026126]
  },
  "objects": {
    "provinces": {
      "type": "GeometryCollection",
      "geometries": [{
        "arcs": [[0, 1, 2, 3, 4, 5, 6]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 233,
          "NAME": "乐东黎族自治县",
          "KIND": "0137",
          "Shape_Length": 2.71313967873126,
          "Shape_Area": 0.2661026580919982
        }
      }, {
        "arcs": [[7, 8, 9, 10, 11]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 40,
          "NAME": "乐山市",
          "KIND": "0137",
          "Shape_Length": 8.30132865271313,
          "Shape_Area": 1.1888597836745
        }
      }, {
        "arcs": [[12, 13, 14, 15, 16, 17, 18, 19, 20]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 180,
          "NAME": "九江市",
          "KIND": "0137",
          "Shape_Length": 10.44679338154314,
          "Shape_Area": 1.7491073419035064
        }
      }, {
        "arcs": [[21, 22, 23, 24, 25, 26]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 115,
          "NAME": "云浮市",
          "KIND": "0137",
          "Shape_Length": 6.144109692965877,
          "Shape_Area": 0.6852927162930007
        }
      }, {
        "arcs": [[27, 28]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 149,
          "NAME": "五家渠市",
          "KIND": "0137",
          "Shape_Length": 1.780885941947052,
          "Shape_Area": 0.08529354296550126
        }
      }, {
        "arcs": [[29, -7, 30, 31]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 234,
          "NAME": "五指山市",
          "KIND": "0137",
          "Shape_Length": 1.78836935982102,
          "Shape_Area": 0.09679504640950058
        }
      }, {
        "arcs": [[32, 33, 34, 35, 36, 37]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 67,
          "NAME": "亳州市",
          "KIND": "0137",
          "Shape_Length": 5.9348178280474535,
          "Shape_Area": 0.8270503782710025
        }
      }, {
        "arcs": [[38, 39, 40, 41, 42]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 247,
          "NAME": "仙桃市",
          "KIND": "0137",
          "Shape_Length": 2.9742298231243973,
          "Shape_Area": 0.236260400900501
        }
      }, {
        "arcs": [[43, 44, 45, 46, 47, 48]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 351,
          "NAME": "伊春市",
          "KIND": "0137",
          "Shape_Length": 16.96074467185693,
          "Shape_Area": 3.9424202262624957
        }
      }, {
        "arcs": [[[49, 50, 51, 52, 53]], [[54, 55, 56, 57]]],
        "type": "MultiPolygon",
        "properties": {
          "OBJECTID": 150,
          "NAME": "伊犁哈萨克自治州",
          "KIND": "0137",
          "Shape_Length": 19.344922625714293,
          "Shape_Area": 6.2924867302655
        }
      }, {
        "arcs": [[58, 59, -27, 60, 61, 62]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 116,
          "NAME": "佛山市",
          "KIND": "0137",
          "Shape_Length": 5.0176091813825865,
          "Shape_Area": 0.33384726100150036
        }
      }, {
        "arcs": [[63, 64, -49, 65, 66, 67]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 352,
          "NAME": "佳木斯市",
          "KIND": "0137",
          "Shape_Length": 22.418510397358453,
          "Shape_Area": 3.8915782083295003
        }
      }, {
        "arcs": [[-31, -6, 68, 69, 70]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 235,
          "NAME": "保亭黎族苗族自治县",
          "KIND": "0137",
          "Shape_Length": 2.0554203702020666,
          "Shape_Area": 0.09962710166199856
        }
      }, {
        "arcs": [[71, 72, 73, 74, 75, 76, 77, 78]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 190,
          "NAME": "保定市",
          "KIND": "0137",
          "Shape_Length": 9.745061062714385,
          "Shape_Area": 2.3095725617825056
        }
      }, {
        "arcs": [[79, 80, 81, 82, 83, 84]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 4,
          "NAME": "保山市",
          "KIND": "0137",
          "Shape_Length": 9.221895190355676,
          "Shape_Area": 1.7043474102060021
        }
      }, {
        "arcs": [[85, 86, 87, 88, 89, 90, 91]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 202,
          "NAME": "信阳市",
          "KIND": "0137",
          "Shape_Length": 9.874442336657118,
          "Shape_Area": 1.8063222310380052
        }
      }, {
        "arcs": [[92, 93, 94, 95, 96, 97]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 236,
          "NAME": "儋州市",
          "KIND": "0137",
          "Shape_Length": 3.8194806512913866,
          "Shape_Area": 0.32925306065700005
        }
      }, {
        "arcs": [[98, 99, 100]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 151,
          "NAME": "克孜勒苏柯尔克孜自治",
          "KIND": "0137",
          "Shape_Length": 25.49291092680948,
          "Shape_Area": 7.340885435441007
        }
      }, {
        "arcs": [[[101, -55]], [[-57, 102]]],
        "type": "MultiPolygon",
        "properties": {
          "OBJECTID": 152,
          "NAME": "克拉玛依市",
          "KIND": "0137",
          "Shape_Length": 6.740623646885298,
          "Shape_Area": 0.8838533106829999
        }
      }, {
        "arcs": [[103, 104, 105, -86, 106, 107, 108]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 68,
          "NAME": "六安市",
          "KIND": "0137",
          "Shape_Length": 9.100636357234734,
          "Shape_Area": 1.7548455696660021
        }
      }, {
        "arcs": [[[109, 110, 111, 112]], [[113]]],
        "type": "MultiPolygon",
        "properties": {
          "OBJECTID": 308,
          "NAME": "六盘水市大湾镇",
          "KIND": "0137",
          "Shape_Length": 7.846771697038667,
          "Shape_Area": 0.8934352846005008
        }
      }, {
        "arcs": [[[114, 115, 116, 117, 118]], [[119, 120]]],
        "type": "MultiPolygon",
        "properties": {
          "OBJECTID": 279,
          "NAME": "兰州市",
          "KIND": "0137",
          "Shape_Length": 8.166373476200423,
          "Shape_Area": 1.3372283581845001
        }
      }, {
        "arcs": [[121, 122, 123, 124, 125, 126]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 20,
          "NAME": "兴安盟",
          "KIND": "0137",
          "Shape_Length": 20.286715521306938,
          "Shape_Area": 6.3116546912065035
        }
      }, {
        "arcs": [[127, 128, 129, 130, 131]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 41,
          "NAME": "内江市",
          "KIND": "0137",
          "Shape_Length": 6.530729678467373,
          "Shape_Area": 0.499990622773
        }
      }, {
        "arcs": [[132, 133, -12, 134, 135, 136, 137, 138, 139, 140]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 42,
          "NAME": "凉山彝族自治州",
          "KIND": "0137",
          "Shape_Length": 21.81733169871241,
          "Shape_Area": 5.509447190631998
        }
      }, {
        "arcs": [[141, 142, 143, 144, 145]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 21,
          "NAME": "包头市",
          "KIND": "0137",
          "Shape_Length": 11.564396363016197,
          "Shape_Area": 2.998206280194504
        }
      }, {
        "arcs": [[146, 147, 148, 149, -74, 150, 151]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 30,
          "NAME": "北京市",
          "KIND": "0137",
          "Shape_Length": 9.351416592006307,
          "Shape_Area": 1.7347041510244987
        }
      }, {
        "arcs": [[152, 153, 154, 155]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 134,
          "NAME": "北海市",
          "KIND": "0137",
          "Shape_Length": 4.564051315300543,
          "Shape_Area": 0.4292243978265014
        }
      }, {
        "arcs": [[156, 157, 158, 159, 160, 161]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 248,
          "NAME": "十堰市",
          "KIND": "0137",
          "Shape_Length": 11.151372149549314,
          "Shape_Area": 2.268015857141
        }
      }, {
        "arcs": [[162, 163, 164, 165, 166, 167, 168]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 166,
          "NAME": "南京市",
          "KIND": "0137",
          "Shape_Length": 6.917783445079083,
          "Shape_Area": 0.6285515887520032
        }
      }, {
        "arcs": [[169, 170, 171, 172, 173, 174]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 43,
          "NAME": "南充市",
          "KIND": "0137",
          "Shape_Length": 8.146361295571413,
          "Shape_Area": 1.1809376967214984
        }
      }, {
        "arcs": [[175, 176, 177, 178, 179, 180, 181]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 135,
          "NAME": "南宁市",
          "KIND": "0137",
          "Shape_Length": 11.177631964173914,
          "Shape_Area": 1.946719079616504
        }
      }, {
        "arcs": [[182, 183, 184, 185, 186, 187, 188, 189]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 293,
          "NAME": "南平市",
          "KIND": "0137",
          "Shape_Length": 11.338483165435948,
          "Shape_Area": 2.399761208545994
        }
      }, {
        "arcs": [[190, -21, 191, 192]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 181,
          "NAME": "南昌市",
          "KIND": "0137",
          "Shape_Length": 5.354775123916775,
          "Shape_Area": 0.6831608252979983
        }
      }, {
        "arcs": [[193, 194, 195, 196, 197]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 167,
          "NAME": "南通市",
          "KIND": "0137",
          "Shape_Length": 5.53788411942937,
          "Shape_Area": 1.0110616126635088
        }
      }, {
        "arcs": [[198, 199, 200, 201, 202, -158, 203, 204, -89]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 203,
          "NAME": "南阳市",
          "KIND": "0137",
          "Shape_Length": 11.051794928343504,
          "Shape_Area": 2.560365251078001
        }
      }, {
        "arcs": [[-54, 205, 206]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 153,
          "NAME": "博尔塔拉蒙古自治州",
          "KIND": "0137",
          "Shape_Length": 10.517944725657248,
          "Shape_Area": 2.841253468891504
        }
      }, {
        "arcs": [[207, 208]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 294,
          "NAME": "厦门市",
          "KIND": "0137",
          "Shape_Length": 2.2485175212243123,
          "Shape_Area": 0.1675914108190039
        }
      }, {
        "arcs": [[209, 210, -68, 211]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 353,
          "NAME": "双鸭山市",
          "KIND": "0137",
          "Shape_Length": 13.864838163716342,
          "Shape_Area": 2.5900156896994977
        }
      }, {
        "arcs": [[212, 213, 214, 215, 216, 217]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 219,
          "NAME": "台州市",
          "KIND": "0137",
          "Shape_Length": 7.168582580065235,
          "Shape_Area": 1.1963781495364953
        }
      }, {
        "arcs": [[463, 464, -167, 465, -219, -109, -389, 466], [218, 219, 220, -104]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 69,
          "NAME": "合肥市",
          "KIND": "0137",
          "Shape_Length": 5.465224464122079,
          "Shape_Area": 1.61
        }
      }, {
        "arcs": [[221, 222, 223, 224, 225, 226, 227, 228]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 182,
          "NAME": "吉安市",
          "KIND": "0137",
          "Shape_Length": 10.313638997996904,
          "Shape_Area": 2.2975841324009996
        }
      }, {
        "arcs": [[229, 230, 231, 232, 233, 234, 235]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 31,
          "NAME": "吉林市",
          "KIND": "0137",
          "Shape_Length": 11.35166120723887,
          "Shape_Area": 3.097404343899494
        }
      }, {
        "arcs": [[236, 237, 238, 239]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 154,
          "NAME": "吐鲁番地区",
          "KIND": "0137",
          "Shape_Length": 14.945335284837874,
          "Shape_Area": 7.6119537146485134
        }
      }, {
        "arcs": [[240, 241, 242, 243, 244, 245]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 102,
          "NAME": "吕梁市",
          "KIND": "0137",
          "Shape_Length": 9.811547275867783,
          "Shape_Area": 2.1575578728975016
        }
      }, {
        "arcs": [[246, 247, 248, 249, 250, 251, 252]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 63,
          "NAME": "吴忠市",
          "KIND": "0137",
          "Shape_Length": 11.712667691051985,
          "Shape_Area": 1.609251224265504
        }
      }, {
        "arcs": [[-35, 253, 254, 255, 256, 257, 258]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 204,
          "NAME": "周口市",
          "KIND": "0137",
          "Shape_Length": 7.168094949015018,
          "Shape_Area": 1.1653918402784944
        }
      }, {
        "arcs": [[259, 260, 261, -124, 262]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 22,
          "NAME": "呼伦贝尔市",
          "KIND": "0137",
          "Shape_Length": 43.139559672929515,
          "Shape_Area": 31.498843800391494
        }
      }, {
        "arcs": [[263, 264, -142, 265, 266]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 23,
          "NAME": "呼和浩特市",
          "KIND": "0137",
          "Shape_Length": 7.608749401849878,
          "Shape_Area": 1.8269307125374956
        }
      }, {
        "arcs": [[267, 268, 269, 270, 271]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 155,
          "NAME": "和田地区",
          "KIND": "0137",
          "Shape_Length": 27.21212303993407,
          "Shape_Area": 25.25123997797052
        }
      }, {
        "arcs": [[272, 273, 274, 275, -18]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 249,
          "NAME": "咸宁市",
          "KIND": "0137",
          "Shape_Length": 6.517918843287157,
          "Shape_Area": 0.9080128636579945
        }
      }, {
        "arcs": [[276, 277, 278, 279, 280, 281, 282]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 332,
          "NAME": "咸阳市",
          "KIND": "0137",
          "Shape_Length": 7.2124953197238035,
          "Shape_Area": 1.0151158926610002
        }
      }, {
        "arcs": [[283, 284, -240, 285, 286]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 156,
          "NAME": "哈密地区",
          "KIND": "0137",
          "Shape_Length": 17.865931500952616,
          "Shape_Area": 15.144222690270485
        }
      }, {
        "arcs": [[287, 288, -66, -48, 289, 290, 291, 292, -231, 293]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 354,
          "NAME": "哈尔滨市",
          "KIND": "0137",
          "Shape_Length": 19.236454176924926,
          "Shape_Area": 6.125849508329008
        }
      }, {
        "arcs": [[294, 295, 296, 297]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 191,
          "NAME": "唐山市",
          "KIND": "0137",
          "Shape_Length": 8.115671898310708,
          "Shape_Area": 1.5434797901170012
        }
      }, {
        "arcs": [[298, 299, 300, -254, -34, 301]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 205,
          "NAME": "商丘市",
          "KIND": "0137",
          "Shape_Length": 7.021306431716717,
          "Shape_Area": 1.0476055076755006
        }
      }, {
        "arcs": [[302, 303, 304, 305, -159, -203]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 333,
          "NAME": "商洛市",
          "KIND": "0137",
          "Shape_Length": 9.421295315427907,
          "Shape_Area": 1.903245252419503
        }
      }, {
        "arcs": [[-271, 306, -101, 307], [308]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 157,
          "NAME": "喀什地区",
          "KIND": "0137",
          "Shape_Length": 32.21310868353314,
          "Shape_Area": 11.309547920644986
        }
      }, {
        "arcs": [[309, 310, 311, 312, 313, 314, 315]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 220,
          "NAME": "嘉兴市",
          "KIND": "0137",
          "Shape_Length": 4.717211651427223,
          "Shape_Area": 0.5530864839019942
        }
      }, {
        "arcs": [[316, 317]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 280,
          "NAME": "嘉峪关市",
          "KIND": "0137",
          "Shape_Length": 2.1218778597816836,
          "Shape_Area": 0.13957655898800014
        }
      }, {
        "arcs": [[318, -233, 319, 320, 321, 322]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 32,
          "NAME": "四平市",
          "KIND": "0137",
          "Shape_Length": 9.534410042473532,
          "Shape_Area": 1.600454335793503
        }
      }, {
        "arcs": [[323, -253, 324, 325, 326]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 64,
          "NAME": "固原市",
          "KIND": "0137",
          "Shape_Length": 8.90930545696372,
          "Shape_Area": 1.1248352288439982
        }
      }, {
        "arcs": [[-309]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 158,
          "NAME": "图木舒克市",
          "KIND": "0137",
          "Shape_Length": 3.3933732712271953,
          "Shape_Area": 0.22540640250600297
        }
      }, {
        "arcs": [[327, 328, 329, -206, -53, 330, 331, 332], [-102, -58, -103, -56]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 159,
          "NAME": "塔城地区",
          "KIND": "0137",
          "Shape_Length": 26.68709575017067,
          "Shape_Area": 10.990393981076512
        }
      }, {
        "arcs": [[333, -261, 334]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 355,
          "NAME": "大兴安岭地区",
          "KIND": "0137",
          "Shape_Length": 20.925887419459738,
          "Shape_Area": 8.533878235064
        }
      }, {
        "arcs": [[335, 336, 337, 338, -76]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 103,
          "NAME": "大同市",
          "KIND": "0137",
          "Shape_Length": 9.482697547893908,
          "Shape_Area": 1.4844386774189957
        }
      }, {
        "arcs": [[339, 340, 341, 342, -291]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 356,
          "NAME": "大庆市",
          "KIND": "0137",
          "Shape_Length": 12.267399723390506,
          "Shape_Area": 2.473642073627001
        }
      }, {
        "arcs": [[343, 344, 345, -80, 346, 347]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 5,
          "NAME": "大理市",
          "KIND": "0137",
          "Shape_Length": 11.725617915176754,
          "Shape_Area": 2.5503003957790042
        }
      }, {
        "arcs": [[348, 349, 350, 351]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 318,
          "NAME": "大连市",
          "KIND": "0137",
          "Shape_Length": 8.383444626274532,
          "Shape_Area": 2.319433387931495
        }
      }, {
        "arcs": [[352, 353, 354, 355]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 281,
          "NAME": "天水市",
          "KIND": "0137",
          "Shape_Length": 8.904068453254396,
          "Shape_Area": 1.4049973696890026
        }
      }, {
        "arcs": [[356, -297, 357, -148, 358, -152, 359, 360]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 61,
          "NAME": "天津市",
          "KIND": "0137",
          "Shape_Length": 9.657412223967084,
          "Shape_Area": 1.2601887440589987
        }
      }, {
        "arcs": [[361, 362, -39, 363]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 250,
          "NAME": "天门市",
          "KIND": "0137",
          "Shape_Length": 3.1613860798231532,
          "Shape_Area": 0.24602922174950254
        }
      }, {
        "arcs": [[364, 365, 366, -242]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 104,
          "NAME": "太原市",
          "KIND": "0137",
          "Shape_Length": 5.932543634673589,
          "Shape_Area": 0.707277178398501
        }
      }, {
        "arcs": [[367, 368]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 86,
          "NAME": "威海市",
          "KIND": "0137",
          "Shape_Length": 4.811323310274581,
          "Shape_Area": 0.7672836086364958
        }
      }, {
        "arcs": [[369, 370, 371, 372, 373, 374]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 264,
          "NAME": "娄底市",
          "KIND": "0137",
          "Shape_Length": 7.104926006006697,
          "Shape_Area": 0.7416389596055009
        }
      }, {
        "arcs": [[375, 376, -91, 377, 378, -364, -43]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 251,
          "NAME": "孝感市",
          "KIND": "0137",
          "Shape_Length": 7.021793772463325,
          "Shape_Area": 0.8410346497719994
        }
      }, {
        "arcs": [[379, 380, 381, -183, 382]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 295,
          "NAME": "宁德市",
          "KIND": "0137",
          "Shape_Length": 9.59775718086226,
          "Shape_Area": 1.5133104594024984
        }
      }, {
        "arcs": [[-214, 383, 384, -310, 385]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 221,
          "NAME": "宁波市",
          "KIND": "0137",
          "Shape_Length": 6.383641852715421,
          "Shape_Area": 1.2360499746855056
        }
      }, {
        "arcs": [[386, 387, 388, -108, 389, -15]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 70,
          "NAME": "安庆市",
          "KIND": "0137",
          "Shape_Length": 7.116900354739449,
          "Shape_Area": 1.4469175857445025
        }
      }, {
        "arcs": [[-160, -306, 390, 391, 392, 393]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 334,
          "NAME": "安康市",
          "KIND": "0137",
          "Shape_Length": 11.024624361826055,
          "Shape_Area": 2.265394231443501
        }
      }, {
        "arcs": [[394, 395, 396, 397, 398, 399]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 206,
          "NAME": "安阳市",
          "KIND": "0137",
          "Shape_Length": 7.754473489089449,
          "Shape_Area": 0.734454433476996
        }
      }, {
        "arcs": [[400, 401, 402, -111, 403]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 309,
          "NAME": "安顺市",
          "KIND": "0137",
          "Shape_Length": 7.880024192831522,
          "Shape_Area": 0.8317617393965022
        }
      }, {
        "arcs": [[404, 405, 406, 407, 408]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 237,
          "NAME": "定安县",
          "KIND": "0137",
          "Shape_Length": 2.386484876986184,
          "Shape_Area": 0.10165201064399798
        }
      }, {
        "arcs": [[409, -119, 410, 411, 412, -355, 413]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 282,
          "NAME": "定西市",
          "KIND": "0137",
          "Shape_Length": 12.299442483863633,
          "Shape_Area": 1.9421789714069975
        }
      }, {
        "arcs": [[414, 415, -8, -134, 416]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 44,
          "NAME": "宜宾市",
          "KIND": "0137",
          "Shape_Length": 8.4864123413921,
          "Shape_Area": 1.224876962325
        }
      }, {
        "arcs": [[417, 418, 419, 420, 421, 422]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 252,
          "NAME": "宜昌市",
          "KIND": "0137",
          "Shape_Length": 8.957116842984435,
          "Shape_Area": 2.0000146264559993
        }
      }, {
        "arcs": [[-224, 423, -192, -20, 424, 425, 426, -226, 427]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 183,
          "NAME": "宜春市",
          "KIND": "0137",
          "Shape_Length": 10.844524672339928,
          "Shape_Area": 1.7166022616724972
        }
      }, {
        "arcs": [[428, -283, 429, -353, 430, 431]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 335,
          "NAME": "宝鸡市",
          "KIND": "0137",
          "Shape_Length": 9.12844189665453,
          "Shape_Area": 1.7763265687969971
        }
      }, {
        "arcs": [[432, -169, 433, 434, 435, 436, 437, 438, 439]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 71,
          "NAME": "宣城市",
          "KIND": "0137",
          "Shape_Length": 7.621764316640769,
          "Shape_Area": 1.1576498477834996
        }
      }, {
        "arcs": [[440, 441, -299, 442, 443, 444]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 72,
          "NAME": "宿州市",
          "KIND": "0137",
          "Shape_Length": 9.111729328716212,
          "Shape_Area": 0.9683972246279956
        }
      }, {
        "arcs": [[445, 446, 447, -445, 448, 449]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 168,
          "NAME": "宿迁市",
          "KIND": "0137",
          "Shape_Length": 5.727876536123297,
          "Shape_Area": 0.8315742696999976
        }
      }, {
        "arcs": [[-407, 450, 451, 452]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 238,
          "NAME": "屯昌县",
          "KIND": "0137",
          "Shape_Length": 2.0023242344214367,
          "Shape_Area": 0.1063535373330003
        }
      }, {
        "arcs": [[453, 454, 455, 456]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 301,
          "NAME": "山南地区",
          "KIND": "0137",
          "Shape_Length": 17.339635476060966,
          "Shape_Area": 7.274651790915503
        }
      }, {
        "arcs": [[-276, 457, 458, 459, -425, -19]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 265,
          "NAME": "岳阳市",
          "KIND": "0137",
          "Shape_Length": 9.698970007864775,
          "Shape_Area": 1.374898436918008
        }
      }, {
        "arcs": [[-180, 460, 461, 462]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 136,
          "NAME": "崇左市",
          "KIND": "0137",
          "Shape_Length": 8.623805325378992,
          "Shape_Area": 1.5224090318474968
        }
      }, {
        "arcs": [[467, 468, 469, -170]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 45,
          "NAME": "巴中市",
          "KIND": "0137",
          "Shape_Length": 7.08351526988461,
          "Shape_Area": 1.1742044561829978
        }
      }, {
        "arcs": [[-145, 470, 471, 472]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 24,
          "NAME": "巴彦淖尔市",
          "KIND": "0137",
          "Shape_Length": 14.313299462440899,
          "Shape_Area": 6.992892146592011
        }
      }, {
        "arcs": [[-239, 473, 474, -331, -52, 475, -269, 476, 477, 478, 479, 480, -286]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 160,
          "NAME": "巴音郭楞蒙古自治州",
          "KIND": "0137",
          "Shape_Length": 43.75742248119815,
          "Shape_Area": 49.27396220607152
        }
      }, {
        "arcs": [[481, -163, -433, 482, 483]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 169,
          "NAME": "常州市",
          "KIND": "0137",
          "Shape_Length": 5.57363003671633,
          "Shape_Area": 0.4152884948464995
        }
      }, {
        "arcs": [[484, 485, -423, 486, 487, 488]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 266,
          "NAME": "常德市",
          "KIND": "0137",
          "Shape_Length": 9.517403379876036,
          "Shape_Area": 1.688557893216001
        }
      }, {
        "arcs": [[-282, 489, -327, 490, -414, -354, -430]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 283,
          "NAME": "平凉市",
          "KIND": "0137",
          "Shape_Length": 10.570993920392468,
          "Shape_Area": 1.1011960941875036
        }
      }, {
        "arcs": [[491, 492, 493, -200, 494, 495]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 207,
          "NAME": "平顶山市",
          "KIND": "0137",
          "Shape_Length": 6.2029857834989635,
          "Shape_Area": 0.7689777367460003
        }
      }, {
        "arcs": [[-470, 496, 497, 498, -171]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 46,
          "NAME": "广元市",
          "KIND": "0137",
          "Shape_Length": 9.307532683990978,
          "Shape_Area": 1.5631298602035046
        }
      }, {
        "arcs": [[499, -174, 500, 501]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 47,
          "NAME": "广安市",
          "KIND": "0137",
          "Shape_Length": 6.397719142141475,
          "Shape_Area": 0.5964227038760007
        }
      }, {
        "arcs": [[502, 503, 504, -63, 505, 506, 507]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 117,
          "NAME": "广州市",
          "KIND": "0137",
          "Shape_Length": 6.047581489653603,
          "Shape_Area": 0.6469918438460005
        }
      }, {
        "arcs": [[508, 509, -247, -324, -490, -281]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 284,
          "NAME": "庆阳市",
          "KIND": "0137",
          "Shape_Length": 11.583621828753841,
          "Shape_Area": 2.7257218799849983
        }
      }, {
        "arcs": [[[-151, -73, 510, -360]], [[-359, -147]]],
        "type": "MultiPolygon",
        "properties": {
          "OBJECTID": 192,
          "NAME": "廊坊市",
          "KIND": "0137",
          "Shape_Length": 7.705384788001169,
          "Shape_Area": 0.6674507153039924
        }
      }, {
        "arcs": [[511, -245, 512, -509, -280, 513, 514]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 336,
          "NAME": "延安市",
          "KIND": "0137",
          "Shape_Length": 15.064260462554024,
          "Shape_Area": 3.7158056328815046
        }
      }, {
        "arcs": [[515, -294, -230, 516, 517]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 33,
          "NAME": "延边朝鲜族自治州",
          "KIND": "0137",
          "Shape_Length": 18.26818433263915,
          "Shape_Area": 4.784335375719999
        }
      }, {
        "arcs": [[-301, 518, 519, 520, 521, -255]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 208,
          "NAME": "开封市",
          "KIND": "0137",
          "Shape_Length": 5.2202088120115615,
          "Shape_Area": 0.6149629086720005
        }
      }, {
        "arcs": [[522, 523, 524, -336, -75, -150]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 193,
          "NAME": "张家口市",
          "KIND": "0137",
          "Shape_Length": 13.659964923210286,
          "Shape_Area": 3.932375299568003
        }
      }, {
        "arcs": [[-488, 525, 526, 527]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 267,
          "NAME": "张家界市",
          "KIND": "0137",
          "Shape_Length": 6.05227320852988,
          "Shape_Area": 0.8879335664680019
        }
      }, {
        "arcs": [[528, 529, 530, -318, 531, 532, 533, 534]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 285,
          "NAME": "张掖市",
          "KIND": "0137",
          "Shape_Length": 18.195725566125756,
          "Shape_Area": 4.020668615107509
        }
      }, {
        "arcs": [[535, 536, 537, 538, -441, -448, 539]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 170,
          "NAME": "徐州市",
          "KIND": "0137",
          "Shape_Length": 9.126743943162333,
          "Shape_Area": 1.0985177138880005
        }
      }, {
        "arcs": [[-83, 540]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 6,
          "NAME": "德宏州",
          "KIND": "0137",
          "Shape_Length": 6.886983244566415,
          "Shape_Area": 0.9959351310664997
        }
      }, {
        "arcs": [[541, 542, 543, 544, 545, 546]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 87,
          "NAME": "德州市",
          "KIND": "0137",
          "Shape_Length": 7.559399886480452,
          "Shape_Area": 1.0487807650745038
        }
      }, {
        "arcs": [[547, 548, 549, 550, 551]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 48,
          "NAME": "德阳市",
          "KIND": "0137",
          "Shape_Length": 5.635995329824988,
          "Shape_Area": 0.5620572541579985
        }
      }, {
        "arcs": [[-77, -339, 552, -267, 553, 554, -243, -367, 555, 556]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 105,
          "NAME": "忻州市",
          "KIND": "0137",
          "Shape_Length": 10.984032750829918,
          "Shape_Area": 2.6118367327234995
        }
      }, {
        "arcs": [[557, -489, -528, 558, 559, 560, 561, 562, 563, -373]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 268,
          "NAME": "怀化市",
          "KIND": "0137",
          "Shape_Length": 17.288613003469624,
          "Shape_Area": 2.5197916401190015
        }
      }, {
        "arcs": [[-346, 564, 565, 566, 567, -81]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 7,
          "NAME": "怒江州",
          "KIND": "0137",
          "Shape_Length": 11.511162989422875,
          "Shape_Area": 1.3242341547679979
        }
      }, {
        "arcs": [[-422, 568, 569, 570, -526, -487]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 253,
          "NAME": "恩施土家族苗族自治州",
          "KIND": "0137",
          "Shape_Length": 12.941969800167914,
          "Shape_Area": 2.2553218187715105
        }
      }, {
        "arcs": [[571, 572, -503, 573, 574, 575, 576]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 118,
          "NAME": "惠州市",
          "KIND": "0137",
          "Shape_Length": 7.951362760653702,
          "Shape_Area": 1.0815242989990015
        }
      }, {
        "arcs": [[577, -550, 578, 579, 580]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 49,
          "NAME": "成都市",
          "KIND": "0137",
          "Shape_Length": 7.81594349076446,
          "Shape_Area": 1.134401803191499
        }
      }, {
        "arcs": [[581, 582, 583, 584, 585, -165]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 171,
          "NAME": "扬州市",
          "KIND": "0137",
          "Shape_Length": 5.296810586718422,
          "Shape_Area": 0.6394090231379996
        }
      }, {
        "arcs": [[586, 587, 588, -523, -149, -358, -296, 589]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 194,
          "NAME": "承德市",
          "KIND": "0137",
          "Shape_Length": 15.06655346219566,
          "Shape_Area": 4.246303427033511
        }
      }, {
        "arcs": [[-188, 590, 591, -193, -424, -223, 592, 593]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 184,
          "NAME": "抚州市",
          "KIND": "0137",
          "Shape_Length": 9.177423279964744,
          "Shape_Area": 1.7183845499360049
        }
      }, {
        "arcs": [[594, 595, 596, 597, 598]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 319,
          "NAME": "抚顺市",
          "KIND": "0137",
          "Shape_Length": 7.458667949521231,
          "Shape_Area": 1.2226413932024955
        }
      }, {
        "arcs": [[599, 600, -455, 601]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 302,
          "NAME": "拉萨市",
          "KIND": "0137",
          "Shape_Length": 10.967248116347715,
          "Shape_Area": 2.7689106824754957
        }
      }, {
        "arcs": [[602, 603, 604, 605, 606]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 119,
          "NAME": "揭阳市",
          "KIND": "0137",
          "Shape_Length": 5.626896444008823,
          "Shape_Area": 0.49869732582999865
        }
      }, {
        "arcs": [[-139, 607, 608]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 50,
          "NAME": "攀枝花市",
          "KIND": "0137",
          "Shape_Length": 6.166224746599127,
          "Shape_Area": 0.6748380059720019
        }
      }, {
        "arcs": [[609, 610, 611, 612]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 8,
          "NAME": "文山州",
          "KIND": "0137",
          "Shape_Length": 11.991590379631964,
          "Shape_Area": 2.7778992757160057
        }
      }, {
        "arcs": [[613, 614, -409, 615]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 239,
          "NAME": "文昌市",
          "KIND": "0137",
          "Shape_Length": 3.863039610286885,
          "Shape_Area": 0.32748188986099663
        }
      }, {
        "arcs": [[-520, 616, 617, -400, 618, -398, 619, 620, 621, 622]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 209,
          "NAME": "新乡市",
          "KIND": "0137",
          "Shape_Length": 5.865611504297314,
          "Shape_Area": 0.8167292759264962
        }
      }, {
        "arcs": [[-428, -225]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 185,
          "NAME": "新余市",
          "KIND": "0137",
          "Shape_Length": 3.5155249859541757,
          "Shape_Area": 0.2902023827720005
        }
      }, {
        "arcs": [[623, 624, -483, -440, 625]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 172,
          "NAME": "无锡市",
          "KIND": "0137",
          "Shape_Length": 5.222098057014933,
          "Shape_Area": 0.43760370069250126
        }
      }, {
        "arcs": [[-456, -601, 626, 627, 628]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 303,
          "NAME": "日喀则地区",
          "KIND": "0137",
          "Shape_Length": 40.83363942988202,
          "Shape_Area": 16.754595195509506
        }
      }, {
        "arcs": [[629, 630, 631, 632, 633]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 88,
          "NAME": "日照市",
          "KIND": "0137",
          "Shape_Length": 5.325789764375005,
          "Shape_Area": 0.7080454376865023
        }
      }, {
        "arcs": [[634, 635, -141, 636, 637, 638]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 9,
          "NAME": "昆明市",
          "KIND": "0137",
          "Shape_Length": 12.020958933890567,
          "Shape_Area": 1.8836785114719978
        }
      }, {
        "arcs": [[[639, 640, 641, -237, -285]], [[-328, 642, -332, -475, 643, -28, 644, 645]]],
        "type": "MultiPolygon",
        "properties": {
          "OBJECTID": 161,
          "NAME": "昌吉回族自治州",
          "KIND": "0137",
          "Shape_Length": 21.234963609120665,
          "Shape_Area": 8.317289786466993
        }
      }, {
        "arcs": [[646, 647, -2, 648, -94]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 240,
          "NAME": "昌江黎族自治县",
          "KIND": "0137",
          "Shape_Length": 2.520893198025421,
          "Shape_Area": 0.15077409621850188
        }
      }, {
        "arcs": [[649, 650, 651, 652, 653]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 304,
          "NAME": "昌都地区",
          "KIND": "0137",
          "Shape_Length": 30.183141717246205,
          "Shape_Area": 10.395196449630506
        }
      }, {
        "arcs": [[654, -417, -133, -636, 655, 656]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 10,
          "NAME": "昭通市",
          "KIND": "0137",
          "Shape_Length": 11.934580363102654,
          "Shape_Area": 2.0531379306715007
        }
      }, {
        "arcs": [[657, 658, 659, -365, -241, 660, 661, 662]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 106,
          "NAME": "晋中市",
          "KIND": "0137",
          "Shape_Length": 10.141819705905508,
          "Shape_Area": 1.667818538574502
        }
      }, {
        "arcs": [[663, -621, 664, 665, 666]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 107,
          "NAME": "晋城市",
          "KIND": "0137",
          "Shape_Length": 5.713042504576436,
          "Shape_Area": 0.9365472160749982
        }
      }, {
        "arcs": [[667, 668, 669, 670, 671, -348, 672, 673]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 11,
          "NAME": "普洱市",
          "KIND": "0137",
          "Shape_Length": 15.051252139819495,
          "Shape_Area": 3.9023463142550066
        }
      }, {
        "arcs": [[674, 675, 676]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 186,
          "NAME": "景德镇市",
          "KIND": "0137",
          "Shape_Length": 4.821629612079516,
          "Shape_Area": 0.48908868519549653
        }
      }, {
        "arcs": [[677, 678, -113, 679, -656, -635, 680, -611]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 12,
          "NAME": "曲靖市",
          "KIND": "0137",
          "Shape_Length": 12.794253429663298,
          "Shape_Area": 2.602648463237001
        }
      }, {
        "arcs": [[-553, -338, 681, -264]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 108,
          "NAME": "朔州市",
          "KIND": "0137",
          "Shape_Length": 6.412518842689628,
          "Shape_Area": 1.113396851633501
        }
      }, {
        "arcs": [[682, 683, 684, 685, -587, 686, 687]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 320,
          "NAME": "朝阳市",
          "KIND": "0137",
          "Shape_Length": 10.852446209464448,
          "Shape_Area": 2.122034206734496
        }
      }, {
        "arcs": [[-599, 688, 689, 690, 691]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 321,
          "NAME": "本溪市",
          "KIND": "0137",
          "Shape_Length": 7.951598115997246,
          "Shape_Area": 0.902586666504503
        }
      }, {
        "arcs": [[692, 693, 694, 695, 696, -177]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 137,
          "NAME": "来宾市",
          "KIND": "0137",
          "Shape_Length": 8.927931230381404,
          "Shape_Area": 1.1865472446769973
        }
      }, {
        "arcs": [[697, -315, 698, -438, 699, 700, 701]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 222,
          "NAME": "杭州市",
          "KIND": "0137",
          "Shape_Length": 9.335638079244267,
          "Shape_Area": 1.576297902280001
        }
      }, {
        "arcs": [[702, -292, -343, 703, 704, -321]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 34,
          "NAME": "松原市",
          "KIND": "0137",
          "Shape_Length": 10.773022731666071,
          "Shape_Area": 2.4063623718794944
        }
      }, {
        "arcs": [[705, -567, 706, -653, 707, -602, -454]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 305,
          "NAME": "林芝地区",
          "KIND": "0137",
          "Shape_Length": 27.629416394438337,
          "Shape_Area": 10.635177159153498
        }
      }, {
        "arcs": [[708, 709, 710, 711, 712, 713, 714]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 342,
          "NAME": "果洛藏族自治州",
          "KIND": "0137",
          "Shape_Length": 18.130392062118208,
          "Shape_Area": 7.215571694707011
        }
      }, {
        "arcs": [[715, -537, 716]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 89,
          "NAME": "枣庄市",
          "KIND": "0137",
          "Shape_Length": 3.6915868769197644,
          "Shape_Area": 0.4505137748080006
        }
      }, {
        "arcs": [[717, -562, 718, 719, -696]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 138,
          "NAME": "柳州市",
          "KIND": "0137",
          "Shape_Length": 11.689376342675335,
          "Shape_Area": 1.6616017764860054
        }
      }, {
        "arcs": [[-228, 720, 721, 722, 723, 724]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 269,
          "NAME": "株洲市",
          "KIND": "0137",
          "Shape_Length": 8.08119264798453,
          "Shape_Area": 1.0239977089955
        }
      }, {
        "arcs": [[725, 726, -563, -718, -695, 727, 728]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 139,
          "NAME": "桂林市",
          "KIND": "0137",
          "Shape_Length": 10.935694526607838,
          "Shape_Area": 2.4822627948914993
        }
      }, {
        "arcs": [[729, 730, 731, 732, 733, 734, -605]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 120,
          "NAME": "梅州市",
          "KIND": "0137",
          "Shape_Length": 8.280790256192281,
          "Shape_Area": 1.4134977831709985
        }
      }, {
        "arcs": [[735, 736, -728, -694, 737, 738, 739, -23]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 140,
          "NAME": "梧州市",
          "KIND": "0137",
          "Shape_Length": 8.953500092197151,
          "Shape_Area": 1.1110087535665
        }
      }, {
        "arcs": [[-637, -140, -609, 740, -344, -672, 741]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 13,
          "NAME": "楚雄市",
          "KIND": "0137",
          "Shape_Length": 10.668469645157789,
          "Shape_Area": 2.5495873763340002
        }
      }, {
        "arcs": [[-244, -555, 742, -248, -510, -513]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 337,
          "NAME": "榆林市",
          "KIND": "0137",
          "Shape_Length": 19.90851390171447,
          "Shape_Area": 4.4128386881885024
        }
      }, {
        "arcs": [[743, 744, 745, -535, 746, 747, -116, 748, -120]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 286,
          "NAME": "武威市",
          "KIND": "0137",
          "Shape_Length": 13.321638001455112,
          "Shape_Area": 3.3554723868544962
        }
      }, {
        "arcs": [[-376, -42, 749, -274, 750, 751, 752]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 254,
          "NAME": "武汉市",
          "KIND": "0137",
          "Shape_Length": 6.750023086195958,
          "Shape_Area": 0.8062413439429955
        }
      }, {
        "arcs": [[753, 754, 755, -657, -680, -112, -403], [-114]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 310,
          "NAME": "毕节地区",
          "KIND": "0137",
          "Shape_Length": 12.605636330509894,
          "Shape_Area": 2.442968591783999
        }
      }, {
        "arcs": [[756, 757, 758, -726, 759, 760]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 270,
          "NAME": "永州市",
          "KIND": "0137",
          "Shape_Length": 11.059196356863152,
          "Shape_Area": 2.0047602805180005
        }
      }, {
        "arcs": [[-392, 761, -432, 762, -497, -469, 763]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 338,
          "NAME": "汉中市",
          "KIND": "0137",
          "Shape_Length": 12.17634785573973,
          "Shape_Area": 2.6152665041634964
        }
      }, {
        "arcs": [[764, -603, 765]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 121,
          "NAME": "汕头市",
          "KIND": "0137",
          "Shape_Length": 3.97780829863816,
          "Shape_Area": 0.2916859417624988
        }
      }, {
        "arcs": [[766, -606, -735, 767, -577]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 122,
          "NAME": "汕尾市",
          "KIND": "0137",
          "Shape_Length": 4.5262075551970895,
          "Shape_Area": 0.5330772671164967
        }
      }, {
        "arcs": [[768, 769, -61, -26, 770, 771]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 123,
          "NAME": "江门市",
          "KIND": "0137",
          "Shape_Length": 5.604974233903551,
          "Shape_Area": 1.0185152855954962
        }
      }, {
        "arcs": [[772, -436, 773, 774, -387, -14, 775, -677]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 74,
          "NAME": "池州市",
          "KIND": "0137",
          "Shape_Length": 6.165778692788659,
          "Shape_Area": 0.785251059631998
        }
      }, {
        "arcs": [[776, 777, 778, 779, 780, 781, -689, -598]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 322,
          "NAME": "沈阳市",
          "KIND": "0137",
          "Shape_Length": 8.945705307154192,
          "Shape_Area": 1.3981715383095008
        }
      }, {
        "arcs": [[-543, 782, 783, -361, -511, -72, 784]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 195,
          "NAME": "沧州市",
          "KIND": "0137",
          "Shape_Length": 8.730880946856558,
          "Shape_Area": 1.4861333201364904
        }
      }, {
        "arcs": [[-720, 785, 786, 787, -178, -697]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 141,
          "NAME": "河池市",
          "KIND": "0137",
          "Shape_Length": 14.137182916181722,
          "Shape_Area": 2.986130517165998
        }
      }, {
        "arcs": [[-734, 788, 789, -572, -768]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 124,
          "NAME": "河源市",
          "KIND": "0137",
          "Shape_Length": 8.6340385582112,
          "Shape_Area": 1.3898848611100032
        }
      }, {
        "arcs": [[790, 791, 792, 793, 794, 795, -208, 796]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 296,
          "NAME": "泉州市",
          "KIND": "0137",
          "Shape_Length": 7.940255612916566,
          "Shape_Area": 1.1190011779989992
        }
      }, {
        "arcs": [[797, 798, 799, 800, 801, 802, 803]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 90,
          "NAME": "泰安市",
          "KIND": "0137",
          "Shape_Length": 6.949159974036813,
          "Shape_Area": 0.7744917674454983
        }
      }, {
        "arcs": [[-196, 804, -583, 805, -484, -625, 806]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 173,
          "NAME": "泰州市",
          "KIND": "0137",
          "Shape_Length": 5.48809540334893,
          "Shape_Area": 0.5569458937815011
        }
      }, {
        "arcs": [[-756, 807, 808, -132, 809, -415, -655]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 51,
          "NAME": "泸州市",
          "KIND": "0137",
          "Shape_Length": 9.955207330357021,
          "Shape_Area": 1.1282759738965005
        }
      }, {
        "arcs": [[810, 811, 812, 813, -201, -494]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 210,
          "NAME": "洛阳市",
          "KIND": "0137",
          "Shape_Length": 8.090268766504748,
          "Shape_Area": 1.4903102682595049
        }
      }, {
        "arcs": [[814, -547, 815, -799, -843, -817, -798, 817]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 91,
          "NAME": "济南市",
          "KIND": "0137",
          "Shape_Length": 6.762733545134907,
          "Shape_Area": 1.03
        }
      }, {
        "arcs": [[818, -802, 819, 820, -538, -716]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 92,
          "NAME": "济宁市",
          "KIND": "0137",
          "Shape_Length": 9.240245354571867,
          "Shape_Area": 1.1007525491370038
        }
      }, {
        "arcs": [[821, -117, -748, 822, 823, 824, 825, 826]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 343,
          "NAME": "海东地区",
          "KIND": "0137",
          "Shape_Length": 7.348310839835776,
          "Shape_Area": 1.3102352173485001
        }
      }, {
        "arcs": [[827, -823, -747, -534, 828, 829]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 344,
          "NAME": "海北藏族自治州",
          "KIND": "0137",
          "Shape_Length": 18.20886927046046,
          "Shape_Area": 3.2893505429809937
        }
      }, {
        "arcs": [[830, -825, 831, -830, 832, -712]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 345,
          "NAME": "海南藏族自治州",
          "KIND": "0137",
          "Shape_Length": 13.324179490000207,
          "Shape_Area": 4.5381571539495065
        }
      }, {
        "arcs": [[833, 834, -405, -615]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 241,
          "NAME": "海口市",
          "KIND": "0137",
          "Shape_Length": 2.865039176956934,
          "Shape_Area": 0.23317778111200513
        }
      }, {
        "arcs": [[[-833, -829, -533, 835, -480, 836, -713]], [[837, 838]]],
        "type": "MultiPolygon",
        "properties": {
          "OBJECTID": 346,
          "NAME": "海西蒙古族藏族自治州直辖",
          "KIND": "0137",
          "Shape_Length": 45.22739657364985,
          "Shape_Area": 31.107537493597505
        }
      }, {
        "arcs": [[839, 840, 841, -818, 842, -804, 843]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 93,
          "NAME": "淄博市",
          "KIND": "0137",
          "Shape_Length": 6.230969224649223,
          "Shape_Area": 0.6026278706149935
        }
      }, {
        "arcs": [[-443, -302, -33, 844]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 75,
          "NAME": "淮北市",
          "KIND": "0137",
          "Shape_Length": 4.249057877166031,
          "Shape_Area": 0.2658799498955006
        }
      }, {
        "arcs": [[-105, -221, 845, 846, -37, 847]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 76,
          "NAME": "淮南市",
          "KIND": "0137",
          "Shape_Length": 2.6208234591977333,
          "Shape_Area": 0.203485260952501
        }
      }, {
        "arcs": [[848, 849, -446, 850, -585]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 174,
          "NAME": "淮安市",
          "KIND": "0137",
          "Shape_Length": 6.727252377434486,
          "Shape_Area": 0.9680673242109932
        }
      }, {
        "arcs": [[851, -507, 852, 853, 854, -575]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 125,
          "NAME": "深圳市",
          "KIND": "0137",
          "Shape_Length": 3.6031136722320865,
          "Shape_Area": 0.248247423231
        }
      }, {
        "arcs": [[-505, 855, 856, -761, 857, 858, -59]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 126,
          "NAME": "清远市",
          "KIND": "0137",
          "Shape_Length": 9.088342994576786,
          "Shape_Area": 1.6904956149425052
        }
      }, {
        "arcs": [[859, -218, 860, -381]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 223,
          "NAME": "温州市",
          "KIND": "0137",
          "Shape_Length": 8.314813758082586,
          "Shape_Area": 1.4495038210134883
        }
      }, {
        "arcs": [[861, 862, -515, 863, -278, 864, -304, 865]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 339,
          "NAME": "渭南市",
          "KIND": "0137",
          "Shape_Length": 7.93008117929334,
          "Shape_Area": 1.2769465812264982
        }
      }, {
        "arcs": [[-314, 866, -626, -439, -699]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 224,
          "NAME": "湖州市",
          "KIND": "0137",
          "Shape_Length": 4.717667295182347,
          "Shape_Area": 0.5493695484839975
        }
      }, {
        "arcs": [[867, -370, 868, -723]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 271,
          "NAME": "湘潭市",
          "KIND": "0137",
          "Shape_Length": 5.249650801896738,
          "Shape_Area": 0.4589445278504992
        }
      }, {
        "arcs": [[-559, -527, -571, 869, 870]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 272,
          "NAME": "湘西土家族苗族自治州",
          "KIND": "0137",
          "Shape_Length": 8.50514993734949,
          "Shape_Area": 1.4278859414970004
        }
      }, {
        "arcs": [[871, 872, 873, -154]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 127,
          "NAME": "湛江市",
          "KIND": "0137",
          "Shape_Length": 7.106145456534191,
          "Shape_Area": 1.3880598169125022
        }
      }, {
        "arcs": [[-166, -586, -851, -450, 874, -846, -220, -466]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 77,
          "NAME": "滁州市",
          "KIND": "0137",
          "Shape_Length": 9.163076654821852,
          "Shape_Area": 1.2947145401510003
        }
      }, {
        "arcs": [[875, 876, -783, -542, -815, -842]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 94,
          "NAME": "滨州市",
          "KIND": "0137",
          "Shape_Length": 7.804288459774642,
          "Shape_Area": 0.9258738253435043
        }
      }, {
        "arcs": [[-257, 877, -496, 878]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 211,
          "NAME": "漯河市",
          "KIND": "0137",
          "Shape_Length": 3.3796631240674797,
          "Shape_Area": 0.2624676266980011
        }
      }, {
        "arcs": [[879, -797, -209, -796, 880, -731, 881]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 297,
          "NAME": "漳州市",
          "KIND": "0137",
          "Shape_Length": 6.629559131141714,
          "Shape_Area": 1.2856846996800129
        }
      }, {
        "arcs": [[882, 883, 884, 885, -840, 886, -631]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 95,
          "NAME": "潍坊市",
          "KIND": "0137",
          "Shape_Length": 7.860860404160419,
          "Shape_Area": 1.616912413494003
        }
      }, {
        "arcs": [[887, 888, -40, -363]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 255,
          "NAME": "潜江市",
          "KIND": "0137",
          "Shape_Length": 2.7179391626087157,
          "Shape_Area": 0.1880588291859997
        }
      }, {
        "arcs": [[-765, -882, -730, -604]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 128,
          "NAME": "潮州市",
          "KIND": "0137",
          "Shape_Length": 3.7269994546327623,
          "Shape_Area": 0.2973764374529967
        }
      }, {
        "arcs": [[889, 890, -97, 891, -451, -406, -835]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 242,
          "NAME": "澄迈县",
          "KIND": "0137",
          "Shape_Length": 3.1760031560183495,
          "Shape_Area": 0.2083982186470002
        }
      }, {
        "arcs": [[892, -820, -801, 893, 894, -395, -618]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 212,
          "NAME": "濮阳市",
          "KIND": "0137",
          "Shape_Length": 5.174963201426678,
          "Shape_Area": 0.419488123707002
        }
      }, {
        "arcs": [[-369, 895, -884, 896, 897]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 96,
          "NAME": "烟台市",
          "KIND": "0137",
          "Shape_Length": 9.05728227669055,
          "Shape_Area": 1.7718148827460014
        }
      }, {
        "arcs": [[-622, -664, 898, -812, 899]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 213,
          "NAME": "焦作市",
          "KIND": "0137",
          "Shape_Length": 5.121518625524437,
          "Shape_Area": 0.5846726850570001
        }
      }, {
        "arcs": [[900, 901, 902, -288, -516]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 357,
          "NAME": "牡丹江市",
          "KIND": "0137",
          "Shape_Length": 14.715350038773543,
          "Shape_Area": 4.393969358759507
        }
      }, {
        "arcs": [[903, -739, 904, 905, -155, -874]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 142,
          "NAME": "玉林市",
          "KIND": "0137",
          "Shape_Length": 8.222696661416157,
          "Shape_Area": 1.1249171974220027
        }
      }, {
        "arcs": [[906, -714, -837, -479, 907, -838, 908, -651]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 347,
          "NAME": "玉树藏族自治州",
          "KIND": "0137",
          "Shape_Length": 34.55294927934601,
          "Shape_Area": 19.296820736778994
        }
      }, {
        "arcs": [[-638, -742, -671, 909]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 14,
          "NAME": "玉溪市",
          "KIND": "0137",
          "Shape_Length": 11.731468824854574,
          "Shape_Area": 1.3301567678604986
        }
      }, {
        "arcs": [[910, -769, 911, -854]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 129,
          "NAME": "珠海市",
          "KIND": "0137",
          "Shape_Length": 4.5847923552681245,
          "Shape_Area": 0.4425482619165006
        }
      }, {
        "arcs": [[-96, 912, -32, -71, 913, 914, 915, -452, -892]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 243,
          "NAME": "琼中黎族苗族自治县",
          "KIND": "0137",
          "Shape_Length": 2.992593157058686,
          "Shape_Area": 0.23190695270999975
        }
      }, {
        "arcs": [[-408, -453, -916, 916, 917, -616]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 244,
          "NAME": "琼海市",
          "KIND": "0137",
          "Shape_Length": 2.3102303585558457,
          "Shape_Area": 0.15819697186700296
        }
      }, {
        "arcs": [[918, 919, -412, 920, -827, 921, -710]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 287,
          "NAME": "甘南藏族自治州",
          "KIND": "0137",
          "Shape_Length": 19.30118947830417,
          "Shape_Area": 3.5748597872480063
        }
      }, {
        "arcs": [[922, 923, -715, -907, -650, 924, -136]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 52,
          "NAME": "甘孜藏族自治州",
          "KIND": "0137",
          "Shape_Length": 31.650439082405207,
          "Shape_Area": 14.115807097912997
        }
      }, {
        "arcs": [[-342, 925, -122, 926, -704]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 35,
          "NAME": "白城市",
          "KIND": "0137",
          "Shape_Length": 11.027679172692045,
          "Shape_Area": 2.953236995455999
        }
      }, {
        "arcs": [[927, -517, -236, 928]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 36,
          "NAME": "白山市",
          "KIND": "0137",
          "Shape_Length": 9.988114031880725,
          "Shape_Area": 1.8983764158580103
        }
      }, {
        "arcs": [[-95, -649, -1, -30, -913]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 245,
          "NAME": "白沙黎族自治县",
          "KIND": "0137",
          "Shape_Length": 2.650768561997051,
          "Shape_Area": 0.18233008014750038
        }
      }, {
        "arcs": [[929, 930, -744, -121, -749, -115, -410, -491, -326]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 288,
          "NAME": "白银市",
          "KIND": "0137",
          "Shape_Length": 9.734052514554222,
          "Shape_Area": 2.0168245949220016
        }
      }, {
        "arcs": [[-788, 931, 932, -678, -610, 933, -461, -179]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 143,
          "NAME": "百色市",
          "KIND": "0137",
          "Shape_Length": 17.270836490885802,
          "Shape_Area": 3.214963220302003
        }
      }, {
        "arcs": [[-459, 934, -485, -558, -372, 935]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 273,
          "NAME": "益阳市",
          "KIND": "0137",
          "Shape_Length": 9.621573962310428,
          "Shape_Area": 1.1361539874714979
        }
      }, {
        "arcs": [[936, 937, -849, -584, -805, -195]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 175,
          "NAME": "盐城市",
          "KIND": "0137",
          "Shape_Length": 7.7044441558337455,
          "Shape_Area": 1.6632054867270014
        }
      }, {
        "arcs": [[938, 939, 940, 941]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 323,
          "NAME": "盘锦市",
          "KIND": "0137",
          "Shape_Length": 4.46061187063512,
          "Shape_Area": 0.414550974812002
        }
      }, {
        "arcs": [[-581, 942, -10, 943, -130, 944]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 53,
          "NAME": "眉山市",
          "KIND": "0137",
          "Shape_Length": 7.620236630629465,
          "Shape_Area": 0.6724053871495027
        }
      }, {
        "arcs": [[945, 946, 947, 948]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 65,
          "NAME": "石嘴山市",
          "KIND": "0137",
          "Shape_Length": 3.185499618061439,
          "Shape_Area": 0.4159827066904967
        }
      }, {
        "arcs": [[949, -78, -557, 950, -659, 951]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 196,
          "NAME": "石家庄市",
          "KIND": "0137",
          "Shape_Length": 7.368009577660457,
          "Shape_Area": 1.446633158582498
        }
      }, {
        "arcs": [[-333, -643]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 162,
          "NAME": "石河子市",
          "KIND": "0137",
          "Shape_Length": 1.0513420300188712,
          "Shape_Area": 0.05208098181450029
        }
      }, {
        "arcs": [[-162, 952, -569, -421, 953]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 256,
          "NAME": "神农架林区",
          "KIND": "0137",
          "Shape_Length": 3.392599740773742,
          "Shape_Area": 0.30684608205349856
        }
      }, {
        "arcs": [[954, -383, -190, 955, -793, 956]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 298,
          "NAME": "福州市",
          "KIND": "0137",
          "Shape_Length": 8.664931827687868,
          "Shape_Area": 1.4951950843925017
        }
      }, {
        "arcs": [[957, -687, -590, -295, 958]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 197,
          "NAME": "秦皇岛市",
          "KIND": "0137",
          "Shape_Length": 5.031641141729438,
          "Shape_Area": 0.9330899534014897
        }
      }, {
        "arcs": [[-612, -681, -639, -910, -670, 959]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 15,
          "NAME": "红河州",
          "KIND": "0137",
          "Shape_Length": 14.889045896090405,
          "Shape_Area": 2.8410951742354964
        }
      }, {
        "arcs": [[-386, -316, -698, 960, -215]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 225,
          "NAME": "绍兴市",
          "KIND": "0137",
          "Shape_Length": 5.826777498103509,
          "Shape_Area": 0.7713904373389949
        }
      }, {
        "arcs": [[-47, 961, 962, -340, -290]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 358,
          "NAME": "绥化市",
          "KIND": "0137",
          "Shape_Length": 17.766337080299504,
          "Shape_Area": 4.12071732358151
        }
      }, {
        "arcs": [[963, -172, -499, 964, 965, -548]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 54,
          "NAME": "绵阳市",
          "KIND": "0137",
          "Shape_Length": 12.145845047178911,
          "Shape_Area": 1.9298029414195
        }
      }, {
        "arcs": [[-546, 966, 967, -894, -800, -816]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 97,
          "NAME": "聊城市",
          "KIND": "0137",
          "Shape_Length": 4.970414400701337,
          "Shape_Area": 0.8700188337889954
        }
      }, {
        "arcs": [[-60, -859, 968, -736, -22]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 130,
          "NAME": "肇庆市",
          "KIND": "0137",
          "Shape_Length": 7.404777310719365,
          "Shape_Area": 1.3205938088554963
        }
      }, {
        "arcs": [[-131, -944, -9, -416, -810]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 55,
          "NAME": "自贡市",
          "KIND": "0137",
          "Shape_Length": 6.108116263676479,
          "Shape_Area": 0.4057862597929994
        }
      }, {
        "arcs": [[969, 970, -311, -385]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 226,
          "NAME": "舟山市",
          "KIND": "0137",
          "Shape_Length": 5.146654590682008,
          "Shape_Area": 1.2300514719260116
        }
      }, {
        "arcs": [[-435, 971, -464, 972, -774]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 78,
          "NAME": "芜湖市",
          "KIND": "0137",
          "Shape_Length": 3.9628137375489683,
          "Shape_Area": 0.31862525966850364
        }
      }, {
        "arcs": [[973, -197, -807, -624, -867, -313]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 176,
          "NAME": "苏州市",
          "KIND": "0137",
          "Shape_Length": 6.276423298963356,
          "Shape_Area": 0.8204010219355032
        }
      }, {
        "arcs": [[974, -24, -740, -904, -873, 975]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 131,
          "NAME": "茂名市",
          "KIND": "0137",
          "Shape_Length": 7.337433104893554,
          "Shape_Area": 1.0471913485020006
        }
      }, {
        "arcs": [[-458, -275, -750, -41, -889, 976, -418, -486, -935]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 257,
          "NAME": "荆州市",
          "KIND": "0137",
          "Shape_Length": 10.165892678388367,
          "Shape_Area": 1.3174679891195022
        }
      }, {
        "arcs": [[977, 978, -419, -977, -888, -362, -379]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 258,
          "NAME": "荆门市",
          "KIND": "0137",
          "Shape_Length": 6.8383009871099985,
          "Shape_Area": 1.1651238165199984
        }
      }, {
        "arcs": [[-792, 979, -957]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 299,
          "NAME": "莆田市",
          "KIND": "0137",
          "Shape_Length": 4.464785190815905,
          "Shape_Area": 0.48074749851548787
        }
      }, {
        "arcs": [[-821, -893, -617, -519, -300, -442, -539]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 99,
          "NAME": "菏泽市",
          "KIND": "0137",
          "Shape_Length": 6.191386500726968,
          "Shape_Area": 1.2066987455484997
        }
      }, {
        "arcs": [[-227, -427, 980, -721]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 187,
          "NAME": "萍乡市",
          "KIND": "0137",
          "Shape_Length": 4.195846528243919,
          "Shape_Area": 0.3498326164414998
        }
      }, {
        "arcs": [[981, -942, 982, -352]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 324,
          "NAME": "营口市",
          "KIND": "0137",
          "Shape_Length": 4.8310600294917645,
          "Shape_Area": 0.6238320176860037
        }
      }, {
        "arcs": [[983, 984, -688, -958]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 325,
          "NAME": "葫芦岛市",
          "KIND": "0137",
          "Shape_Length": 6.510921863322492,
          "Shape_Area": 1.1951573086964946
        }
      }, {
        "arcs": [[-444, -845, -38, -847, -875, -449]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 79,
          "NAME": "蚌埠市",
          "KIND": "0137",
          "Shape_Length": 5.077938373979459,
          "Shape_Area": 0.5758134591680005
        }
      }, {
        "arcs": [[-785, -79, -950, 985, -544]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 198,
          "NAME": "衡水市",
          "KIND": "0137",
          "Shape_Length": 6.513153600579998,
          "Shape_Area": 0.9025139755064983
        }
      }, {
        "arcs": [[986, -724, -869, -375, 987, -758]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 274,
          "NAME": "衡阳市",
          "KIND": "0137",
          "Shape_Length": 8.745591569848258,
          "Shape_Area": 1.3892263011195012
        }
      }, {
        "arcs": [[988, 989, -701, 990, 991, -185]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 227,
          "NAME": "衢州市",
          "KIND": "0137",
          "Shape_Length": 6.196079001064185,
          "Shape_Area": 0.818557118635503
        }
      }, {
        "arcs": [[992, -204, -157, -954, -420, -979]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 259,
          "NAME": "襄阳市",
          "KIND": "0137",
          "Shape_Length": 9.267744825631151,
          "Shape_Area": 1.8830910377785035
        }
      }, {
        "arcs": [[993, -668]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 16,
          "NAME": "西双版纳",
          "KIND": "0137",
          "Shape_Length": 8.574556667314024,
          "Shape_Area": 1.6706045598835002
        }
      }, {
        "arcs": [[-824, -828, -832]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 348,
          "NAME": "西宁市",
          "KIND": "0137",
          "Shape_Length": 5.234662984396533,
          "Shape_Area": 0.736268710876999
        }
      }, {
        "arcs": [[-865, -277, -429, -762, -391, -305]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 340,
          "NAME": "西安市",
          "KIND": "0137",
          "Shape_Length": 7.043161960232361,
          "Shape_Area": 0.9904372905204973
        }
      }, {
        "arcs": [[-256, -522, 994, -492, -878]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 214,
          "NAME": "许昌市",
          "KIND": "0137",
          "Shape_Length": 4.764309570395676,
          "Shape_Area": 0.4862347905985042
        }
      }, {
        "arcs": [[-905, -738, -693, -176, 995]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 144,
          "NAME": "贵港市",
          "KIND": "0137",
          "Shape_Length": 7.062132710010416,
          "Shape_Area": 0.9365181772125002
        }
      }, {
        "arcs": [[996, 997, -754, -402]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 311,
          "NAME": "贵阳市",
          "KIND": "0137",
          "Shape_Length": 6.804560678925914,
          "Shape_Area": 0.7305142600200011
        }
      }, {
        "arcs": [[-760, -729, -737, -969, -858]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 145,
          "NAME": "贺州市",
          "KIND": "0137",
          "Shape_Length": 8.499289510335698,
          "Shape_Area": 1.0450802559519947
        }
      }, {
        "arcs": [[998, -551, -578, -945, -129, 999]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 56,
          "NAME": "资阳市",
          "KIND": "0137",
          "Shape_Length": 7.283373747805752,
          "Shape_Area": 0.7463513648824996
        }
      }, {
        "arcs": [[1000, 1001, -593, -222, 1002, 1003, -789, -733]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 188,
          "NAME": "赣州市",
          "KIND": "0137",
          "Shape_Length": 14.765922569319958,
          "Shape_Area": 3.5403323056869973
        }
      }, {
        "arcs": [[1004, 1005, -588, -686]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 25,
          "NAME": "赤峰市",
          "KIND": "0137",
          "Shape_Length": 21.65062341231916,
          "Shape_Area": 9.544249523424511
        }
      }, {
        "arcs": [[-319, 1006, -596, 1007, -234]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 37,
          "NAME": "辽源市",
          "KIND": "0137",
          "Shape_Length": 4.295039212123061,
          "Shape_Area": 0.566505715986495
        }
      }, {
        "arcs": [[1008, 1009, -690, -782]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 326,
          "NAME": "辽阳市",
          "KIND": "0137",
          "Shape_Length": 4.576241960190543,
          "Shape_Area": 0.5097820268214993
        }
      }, {
        "arcs": [[1010, -393, -764, -468, -175, -500]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 57,
          "NAME": "达州市",
          "KIND": "0137",
          "Shape_Length": 10.55619220490876,
          "Shape_Area": 1.5731934669675045
        }
      }, {
        "arcs": [[1011, -862, 1012, -813, -899, -667]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 109,
          "NAME": "运城市",
          "KIND": "0137",
          "Shape_Length": 6.829964141713149,
          "Shape_Area": 1.4100644780725033
        }
      }, {
        "arcs": [[-938, 1013, -633, 1014, -540, -447, -850]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 177,
          "NAME": "连云港市",
          "KIND": "0137",
          "Shape_Length": 5.450371683148118,
          "Shape_Area": 0.8159310723420018
        }
      }, {
        "arcs": [[1015, -137, -925, -654, -707, -566]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 17,
          "NAME": "迪庆州",
          "KIND": "0137",
          "Shape_Length": 12.524561038101313,
          "Shape_Area": 2.124999715504002
        }
      }, {
        "arcs": [[-929, -235, -1008, -595, -692, 1016, 1017]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 38,
          "NAME": "通化市",
          "KIND": "0137",
          "Shape_Length": 9.822857850244473,
          "Shape_Area": 1.6926032857449946
        }
      }, {
        "arcs": [[-322, -705, -927, -127, 1018, -1005, -685, 1019, -778, 1020]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 26,
          "NAME": "通辽市",
          "KIND": "0137",
          "Shape_Length": 18.216366902478864,
          "Shape_Area": 6.62317219217999
        }
      }, {
        "arcs": [[1021, -501, -173, -964, -552, -999]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 58,
          "NAME": "遂宁市",
          "KIND": "0137",
          "Shape_Length": 5.073760416591523,
          "Shape_Area": 0.5006303262270013
        }
      }, {
        "arcs": [[-808, -755, -998, 1022, 1023, 1024, 1025]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 312,
          "NAME": "遵义市",
          "KIND": "0137",
          "Shape_Length": 16.921457975914233,
          "Shape_Area": 2.8268377720425013
        }
      }, {
        "arcs": [[-545, -986, -952, -658, 1026, -967]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 199,
          "NAME": "邢台市",
          "KIND": "0137",
          "Shape_Length": 6.551923276080968,
          "Shape_Area": 1.2648502546879965
        }
      }, {
        "arcs": [[-652, -909, -839, -908, -478, 1027, -627, -600, -708]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 306,
          "NAME": "那曲地区",
          "KIND": "0137",
          "Shape_Length": 46.9292643475203,
          "Shape_Area": 33.90386292400652
        }
      }, {
        "arcs": [[-1027, -663, 1028, -396, -895, -968]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 200,
          "NAME": "邯郸市",
          "KIND": "0137",
          "Shape_Length": 7.192201218556419,
          "Shape_Area": 1.2127456251975053
        }
      }, {
        "arcs": [[-374, -564, -727, -759, -988]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 275,
          "NAME": "邵阳市",
          "KIND": "0137",
          "Shape_Length": 9.839082226012469,
          "Shape_Area": 1.8866325375369994
        }
      }, {
        "arcs": [[-521, -623, -900, -811, -493, -995]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 215,
          "NAME": "郑州市",
          "KIND": "0137",
          "Shape_Length": 5.349258475007825,
          "Shape_Area": 0.7436224701159972
        }
      }, {
        "arcs": [[-1003, -229, -725, -987, -757, -857, 1029]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 276,
          "NAME": "郴州市",
          "KIND": "0137",
          "Shape_Length": 11.26456841545237,
          "Shape_Area": 1.7393015396425038
        }
      }, {
        "arcs": [[-146, -473, 1030, 1031, -949, 1032, -249, -743, -554, -266]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 27,
          "NAME": "鄂尔多斯市",
          "KIND": "0137",
          "Shape_Length": 18.786914235856063,
          "Shape_Area": 9.071011100066507
        }
      }, {
        "arcs": [[-752, 1033, 1034]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 260,
          "NAME": "鄂州市",
          "KIND": "0137",
          "Shape_Length": 2.637679219289552,
          "Shape_Area": 0.14848823766800043
        }
      }, {
        "arcs": [[-531, 1035, 1036, -287, -481, -836, -532, -317]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 289,
          "NAME": "酒泉市",
          "KIND": "0137",
          "Shape_Length": 28.453258838730672,
          "Shape_Area": 17.761225613188515
        }
      }, {
        "arcs": [[-953, -161, -394, -1011, -502, -1022, -1000, -128, -809, -1026, 1037, -870, -570]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 331,
          "NAME": "重庆市",
          "KIND": "0137",
          "Shape_Length": 32.087556367857644,
          "Shape_Area": 7.708797246292493
        }
      }, {
        "arcs": [[-961, -702, -990, 1038, -216]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 228,
          "NAME": "金华市",
          "KIND": "0137",
          "Shape_Length": 6.892651551085007,
          "Shape_Area": 1.0131651361780083
        }
      }, {
        "arcs": [[-746, 1039, -529]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 290,
          "NAME": "金昌市",
          "KIND": "0137",
          "Shape_Length": 4.589261972615015,
          "Shape_Area": 0.7338372710840012
        }
      }, {
        "arcs": [[-182, 1040, 1041, -156, -906, -996]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 146,
          "NAME": "钦州市",
          "KIND": "0137",
          "Shape_Length": 7.112077651989531,
          "Shape_Area": 0.9832227984039995
        }
      }, {
        "arcs": [[-597, -1007, -323, -1021, -777]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 327,
          "NAME": "铁岭市",
          "KIND": "0137",
          "Shape_Length": 8.851980292016552,
          "Shape_Area": 1.4236153921955053
        }
      }, {
        "arcs": [[-560, -871, -1038, -1025, 1042]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 313,
          "NAME": "铜仁地区",
          "KIND": "0137",
          "Shape_Length": 12.321380284817531,
          "Shape_Area": 1.6523493412045052
        }
      }, {
        "arcs": [[-864, -514, -279]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 341,
          "NAME": "铜川市",
          "KIND": "0137",
          "Shape_Length": 3.8418294968495026,
          "Shape_Area": 0.3850276387460003
        }
      }, {
        "arcs": [[-467, -388, -775, -973]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 80,
          "NAME": "铜陵市",
          "KIND": "0137",
          "Shape_Length": 1.916522810961009,
          "Shape_Area": 0.10055030118799782
        }
      }, {
        "arcs": [[-1033, -948, 1043, -250]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 66,
          "NAME": "银川市",
          "KIND": "0137",
          "Shape_Length": 5.292961471250061,
          "Shape_Area": 0.7520282265240023
        }
      }, {
        "arcs": [[-1019, -126, 1044, 1045, -524, -589, -1006]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 28,
          "NAME": "锡林郭勒盟",
          "KIND": "0137",
          "Shape_Length": 32.06306405650002,
          "Shape_Area": 22.659345156832504
        }
      }, {
        "arcs": [[1046, -780, 1047, -683, -985, 1048, -940]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 328,
          "NAME": "锦州市",
          "KIND": "0137",
          "Shape_Length": 7.126129325577544,
          "Shape_Area": 1.0979171950555036
        }
      }, {
        "arcs": [[-482, -806, -582, -164]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 178,
          "NAME": "镇江市",
          "KIND": "0137",
          "Shape_Length": 4.388107650212864,
          "Shape_Area": 0.3662685055269993
        }
      }, {
        "arcs": [[-232, -293, -703, -320]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 39,
          "NAME": "长春市",
          "KIND": "0137",
          "Shape_Length": 11.607937554949634,
          "Shape_Area": 2.319484886936002
        }
      }, {
        "arcs": [[-460, -936, -371, -868, -722, -981, -426]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 277,
          "NAME": "长沙市",
          "KIND": "0137",
          "Shape_Length": 8.598504231703277,
          "Shape_Area": 1.0862472032709996
        }
      }, {
        "arcs": [[-397, -1029, -662, 1049, -665, -620]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 110,
          "NAME": "长治市",
          "KIND": "0137",
          "Shape_Length": 7.447585842104086,
          "Shape_Area": 1.4035109391819989
        }
      }, {
        "arcs": [[-779, -1020, -684, -1048]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 329,
          "NAME": "阜新市",
          "KIND": "0137",
          "Shape_Length": 6.674327329432783,
          "Shape_Area": 1.1331284515015012
        }
      }, {
        "arcs": [[-36, -259, 1050, -87, -106, -848]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 81,
          "NAME": "阜阳市",
          "KIND": "0137",
          "Shape_Length": 7.378147488094488,
          "Shape_Area": 0.9757776378619952
        }
      }, {
        "arcs": [[1051, -1041, -181, -463]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 147,
          "NAME": "防城港市",
          "KIND": "0137",
          "Shape_Length": 4.6025329570601565,
          "Shape_Area": 0.5537452224420009
        }
      }, {
        "arcs": [[1052, -771, -25, -975]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 132,
          "NAME": "阳江市",
          "KIND": "0137",
          "Shape_Length": 5.042581204366856,
          "Shape_Area": 0.8144016433255046
        }
      }, {
        "arcs": [[-951, -556, -366, -660]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 111,
          "NAME": "阳泉市",
          "KIND": "0137",
          "Shape_Length": 4.013889338207611,
          "Shape_Area": 0.46858106121750376
        }
      }, {
        "arcs": [[-476, -51, 1053, -99, -307, -270], [1054]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 163,
          "NAME": "阿克苏地区",
          "KIND": "0137",
          "Shape_Length": 23.63946663595122,
          "Shape_Area": 13.631848552817981
        }
      }, {
        "arcs": [[-641, 1055, -329, -646, 1056]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 164,
          "NAME": "阿勒泰地区",
          "KIND": "0137",
          "Shape_Length": 20.15532518390164,
          "Shape_Area": 13.900870669397996
        }
      }, {
        "arcs": [[-966, 1057, -919, -709, -924, 1058, -579, -549]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 59,
          "NAME": "阿坝藏族羌族自治州",
          "KIND": "0137",
          "Shape_Length": 22.942751026256783,
          "Shape_Area": 7.934765116265499
        }
      }, {
        "arcs": [[1059, -1036, -530, -1040, -745, -931, 1060, -251, -1044, -947, 1061, -1031, -472]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 29,
          "NAME": "阿拉善盟",
          "KIND": "0137",
          "Shape_Length": 33.662296852870995,
          "Shape_Area": 25.501493027864502
        }
      }, {
        "arcs": [[-1055]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 165,
          "NAME": "阿拉尔市",
          "KIND": "0137",
          "Shape_Length": 4.090153901168762,
          "Shape_Area": 0.4622168864970074
        }
      }, {
        "arcs": [[-1028, -477, -268, 1062, -628]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 307,
          "NAME": "阿里地区",
          "KIND": "0137",
          "Shape_Length": 44.999280886355436,
          "Shape_Area": 32.55567600865701
        }
      }, {
        "arcs": [[-763, -431, -356, -413, -920, -1058, -965, -498]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 291,
          "NAME": "陇南市",
          "KIND": "0137",
          "Shape_Length": 13.46633141920042,
          "Shape_Area": 2.705466867290004
        }
      }, {
        "arcs": [[-70, 1063, 1064, 1065, -914]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 246,
          "NAME": "陵水黎族自治县",
          "KIND": "0137",
          "Shape_Length": 2.1196511593989973,
          "Shape_Area": 0.11868194568350147
        }
      }, {
        "arcs": [[-378, -90, -205, -993, -978]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 261,
          "NAME": "随州市",
          "KIND": "0137",
          "Shape_Length": 6.3242769116146,
          "Shape_Area": 0.9163804206494958
        }
      }, {
        "arcs": [[-943, -580, -1059, -923, -135, -11]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 60,
          "NAME": "雅安市",
          "KIND": "0137",
          "Shape_Length": 8.655426684415024,
          "Shape_Area": 1.4076354777390019
        }
      }, {
        "arcs": [[1066, -897, -883, -630]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 100,
          "NAME": "青岛市",
          "KIND": "0137",
          "Shape_Length": 8.547456816961715,
          "Shape_Area": 1.4768457484110014
        }
      }, {
        "arcs": [[-1009, -781, -1047, -939, -982, -351, 1067]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 330,
          "NAME": "鞍山市",
          "KIND": "0137",
          "Shape_Length": 8.34987423141274,
          "Shape_Area": 0.9897154053655027
        }
      }, {
        "arcs": [[-1004, -1030, -856, -504, -573, -790]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 133,
          "NAME": "韶关市",
          "KIND": "0137",
          "Shape_Length": 10.313241961378994,
          "Shape_Area": 1.6478486001969945
        }
      }, {
        "arcs": [[-168, -465, -972, -434]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 82,
          "NAME": "马鞍山市",
          "KIND": "0137",
          "Shape_Length": 2.2186492555899537,
          "Shape_Area": 0.16143111103550198
        }
      }, {
        "arcs": [[-88, -1051, -258, -879, -495, -199]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 216,
          "NAME": "驻马店市",
          "KIND": "0137",
          "Shape_Length": 8.27601797348567,
          "Shape_Area": 1.4540129104849968
        }
      }, {
        "arcs": [[1068, -210, 1069, -902]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 359,
          "NAME": "鸡西市",
          "KIND": "0137",
          "Shape_Length": 13.448043064040831,
          "Shape_Area": 2.5951720613914993
        }
      }, {
        "arcs": [[-619, -399]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 217,
          "NAME": "鹤壁市",
          "KIND": "0137",
          "Shape_Length": 2.9436633651100044,
          "Shape_Area": 0.21324807764649992
        }
      }, {
        "arcs": [[1070, -44, -65]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 360,
          "NAME": "鹤岗市",
          "KIND": "0137",
          "Shape_Length": 9.998187514312482,
          "Shape_Area": 1.7530012561344945
        }
      }, {
        "arcs": [[1071, -591, -187]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 189,
          "NAME": "鹰潭市",
          "KIND": "0137",
          "Shape_Length": 3.5836160360045963,
          "Shape_Area": 0.3276724127320001
        }
      }, {
        "arcs": [[-390, -107, -92, -377, -753, -1035, 1072, -16]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 262,
          "NAME": "黄冈市",
          "KIND": "0137",
          "Shape_Length": 9.3584886806129,
          "Shape_Area": 1.6441463076335003
        }
      }, {
        "arcs": [[-922, -826, -831, -711]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 349,
          "NAME": "黄南藏族自治州",
          "KIND": "0137",
          "Shape_Length": 10.044300573433944,
          "Shape_Area": 1.8019004565654997
        }
      }, {
        "arcs": [[-700, -437, -773, -676, 1073, -991]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 83,
          "NAME": "黄山市",
          "KIND": "0137",
          "Shape_Length": 6.4955419075418845,
          "Shape_Area": 0.9039941829220032
        }
      }, {
        "arcs": [[-1034, -751, -273, -17, -1073]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 263,
          "NAME": "黄石市",
          "KIND": "0137",
          "Shape_Length": 4.215001120104124,
          "Shape_Area": 0.42822827296749916
        }
      }, {
        "arcs": [[1074, -335, -260, 1075, -962, -46]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 361,
          "NAME": "黑河市",
          "KIND": "0137",
          "Shape_Length": 20.79174610520864,
          "Shape_Area": 8.263022630529491
        }
      }, {
        "arcs": [[1076, -786, -719, -561, -1043, -1024]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 314,
          "NAME": "黔东南苗族侗族",
          "KIND": "0137",
          "Shape_Length": 16.19354472429556,
          "Shape_Area": 2.7416879305384976
        }
      }, {
        "arcs": [[-1077, -1023, -997, -401, 1077, -932, -787]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 315,
          "NAME": "黔南布依族苗族",
          "KIND": "0137",
          "Shape_Length": 16.757241869926116,
          "Shape_Area": 2.3618951508790005
        }
      }, {
        "arcs": [[-933, -1078, -404, -110, -679]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 316,
          "NAME": "黔西南布依族苗族",
          "KIND": "0137",
          "Shape_Length": 8.978502691188709,
          "Shape_Area": 1.5062954715350025
        }
      }, {
        "arcs": [[-1076, -263, -123, -926, -341, -963]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 362,
          "NAME": "齐齐哈尔市",
          "KIND": "0137",
          "Shape_Length": 19.043916482458997,
          "Shape_Area": 5.060926421658509
        }
      }, {
        "arcs": [[1078, -1001, -732, -881, -795]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 300,
          "NAME": "龙岩市",
          "KIND": "0137",
          "Shape_Length": 9.261474159997741,
          "Shape_Area": 1.7074158062009983
        }
      }, {
        "arcs": [[-212, -67, -289, -903, -1070]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 350,
          "NAME": "七台河市",
          "KIND": "0137",
          "Shape_Length": 6.102992195948363,
          "Shape_Area": 0.7195899007434952
        }
      }, {
        "arcs": [[-917, -915, -1066, 1079]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 229,
          "NAME": "万宁市",
          "KIND": "0137",
          "Shape_Length": 2.271259846984842,
          "Shape_Area": 0.22089098851499797
        }
      }, {
        "arcs": [[-5, 1080, -1064, -69]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 230,
          "NAME": "三亚市",
          "KIND": "0137",
          "Shape_Length": 2.7965813322886217,
          "Shape_Area": 0.23808333571750312
        }
      }, {
        "arcs": [[-189, -594, -1002, -1079, -794, -956]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 292,
          "NAME": "三明市",
          "KIND": "0137",
          "Shape_Length": 10.365453276200988,
          "Shape_Area": 2.075136110624997
        }
      }, {
        "arcs": [[-814, -1013, -866, -303, -202]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 201,
          "NAME": "三门峡市",
          "KIND": "0137",
          "Shape_Length": 7.437917892687362,
          "Shape_Area": 0.9729644635124955
        }
      }, {
        "arcs": [[-971, 1081, -198, -974, -312]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 1,
          "NAME": "上海市",
          "KIND": "0137",
          "Shape_Length": 5.637613777480127,
          "Shape_Area": 0.8780426080414991
        }
      }, {
        "arcs": [[-186, -992, -1074, -675, -776, -13, -191, -592, -1072]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 179,
          "NAME": "上饶市",
          "KIND": "0137",
          "Shape_Length": 12.583278269262493,
          "Shape_Area": 2.104325891374505
        }
      }, {
        "arcs": [[-648, 1082, -3]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 231,
          "NAME": "东方市",
          "KIND": "0137",
          "Shape_Length": 2.249714902723984,
          "Shape_Area": 0.23149737895350153
        }
      }, {
        "arcs": [[1083]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 112,
          "NAME": "东沙群岛",
          "KIND": "0137",
          "Shape_Length": 2.4804082647110115,
          "Shape_Area": 0.45313660378100634
        }
      }, {
        "arcs": [[-508, -852, -574]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 113,
          "NAME": "东莞市",
          "KIND": "0137",
          "Shape_Length": 2.535641343579684,
          "Shape_Area": 0.2182080035469986
        }
      }, {
        "arcs": [[1084, -876, -841, -886]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 84,
          "NAME": "东营市",
          "KIND": "0137",
          "Shape_Length": 5.172109765191794,
          "Shape_Area": 0.8485217491049936
        }
      }, {
        "arcs": [[-252, -1061, -930, -325]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 62,
          "NAME": "中卫市",
          "KIND": "0137",
          "Shape_Length": 8.608840529912253,
          "Shape_Area": 1.3298011732364938
        }
      }, {
        "arcs": [[-506, -62, -770, -911, -853]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 114,
          "NAME": "中山市",
          "KIND": "0137",
          "Shape_Length": 1.9949816193157468,
          "Shape_Area": 0.1619640380069983
        }
      }, {
        "arcs": [[-411, -118, -822, -921]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 278,
          "NAME": "临夏回族自治州",
          "KIND": "0137",
          "Shape_Length": 5.719332471961847,
          "Shape_Area": 0.8013671206550016
        }
      }, {
        "arcs": [[-666, -1050, -661, -246, -512, -863, -1012]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 101,
          "NAME": "临汾市",
          "KIND": "0137",
          "Shape_Length": 9.596098114900258,
          "Shape_Area": 2.035111797173507
        }
      }, {
        "arcs": [[-1015, -632, -887, -844, -803, -819, -717, -536]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 85,
          "NAME": "临沂市",
          "KIND": "0137",
          "Shape_Length": 9.2877950412505,
          "Shape_Area": 1.705721540976006
        }
      }, {
        "arcs": [[-673, -347, -85, 1085]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 2,
          "NAME": "临沧市",
          "KIND": "0137",
          "Shape_Length": 9.085263590692316,
          "Shape_Area": 2.095454217296998
        }
      }, {
        "arcs": [[1086, -98, -891]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 232,
          "NAME": "临高县",
          "KIND": "0137",
          "Shape_Length": 1.9198422433877806,
          "Shape_Area": 0.1327837556200011
        }
      }, {
        "arcs": [[1087, -1017, -691, -1010, -1068, -350]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 317,
          "NAME": "丹东市",
          "KIND": "0137",
          "Shape_Length": 8.438456188794394,
          "Shape_Area": 1.6499481981565005
        }
      }, {
        "arcs": [[-861, -217, -1039, -989, -184, -382]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 218,
          "NAME": "丽水市",
          "KIND": "0137",
          "Shape_Length": 8.522714723483318,
          "Shape_Area": 1.5881297976215025
        }
      }, {
        "arcs": [[-741, -608, -138, -1016, -565, -345]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 3,
          "NAME": "丽江市",
          "KIND": "0137",
          "Shape_Length": 10.447703080901675,
          "Shape_Area": 1.870422593126001
        }
      }, {
        "arcs": [[-525, -1046, 1088, -143, -265, -682, -337]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 18,
          "NAME": "乌兰察布市",
          "KIND": "0137",
          "Shape_Length": 16.41098797826087,
          "Shape_Area": 5.910194737302002
        }
      }, {
        "arcs": [[-1062, -946, -1032]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 19,
          "NAME": "乌海市",
          "KIND": "0137",
          "Shape_Length": 2.8344883311286297,
          "Shape_Area": 0.1942287268849939
        }
      }, {
        "arcs": [[-238, -642, -1057, -645, -29, -644, -474]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 148,
          "NAME": "乌鲁木齐市",
          "KIND": "0137",
          "Shape_Length": 10.592973662957897,
          "Shape_Area": 1.5861411261050038
        }
      }, {
        "arcs": [[1089]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 6,
          "NAME": "台湾省",
          "KIND": 2,
          "Shape_Length": 9.967243749438172,
          "Shape_Area": 3.1865299643560037
        }
      }, {
        "type": null,
        "properties": {
          "OBJECTID": 35,
          "NAME": "澳门",
          "KIND": 2,
          "Shape_Length": 0.12000623572948722,
          "Shape_Area": 0.0007793272830000177
        }
      }, {
        "arcs": [[1090]],
        "type": "Polygon",
        "properties": {
          "OBJECTID": 4,
          "NAME": "香港",
          "KIND": 2,
          "Shape_Length": 1.977761081073926,
          "Shape_Area": 0.2318597904440132
        }
      }]
    }
  }
};
},{}],"data/2010-census.csv":[function(require,module,exports) {
module.exports = "/2010-census.f79f09f3.csv";
},{}],"js/main.js":[function(require,module,exports) {
"use strict";

var _fetchJsonp = _interopRequireDefault(require("fetch-jsonp"));

var _chromaJs = _interopRequireDefault(require("chroma-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var china = require('./../data/china-proj.topo.json');

var topoData = topojson.feature(china, china.objects.provinces).features;

var censUrl = require('./../data/2010-census.csv');

console.log("Geographical Data", topoData);
var data = {};
var maxInfection = 0;
var path = d3.geoPath();

var altSubstr = function altSubstr(str) {
  if (str.substr(0, 2) == '张家') return str.substr(0, 3);
  if (str.substr(0, 3) == '公主岭') return "四平";
  return str.substr(0, 2);
};

var setOpacity = function setOpacity(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
  return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
};

document.body.addEventListener("mousemove", function (e) {
  d3.select('html').style('background-position-x', +e.offsetX / 10.0 + "px");
  d3.select('html').style('background-position-y', +e.offsetY / 10.0 + "px");
});
(0, _fetchJsonp.default)('https://interface.sina.cn/news/wap/fymap2020_data.d.json').then(function (response) {
  return response.json();
}).then(function (raw) {
  console.log("Infection Data from Sina", raw);
  raw.data.list.forEach(function (prov) {
    var special = {
      "北京": 0,
      "天津": 0,
      "重庆": 0,
      "上海": 0,
      "台湾": 1,
      "香港": 1,
      "澳门": 1
    };

    if (prov.name == '西藏' && prov.city.length <= 1) {
      // Representing that Sina has not changed Tibet to city-scale data yet
      data['拉萨'] = {
        conNum: prov.value,
        deathNum: prov.deathNum,
        cureNum: prov.cureNum,
        used: false
      };
    }

    if (prov.name in special) {
      data[prov.name] = {
        conNum: prov.value,
        deathNum: prov.deathNum,
        cureNum: prov.cureNum,
        used: false
      };
    } else {
      prov.city.forEach(function (city) {
        var name = city.name;
        data[altSubstr(name)] = {
          conNum: city.conNum,
          deathNum: city.deathNum,
          cureNum: city.cureNum,
          used: false
        };
        if (city.conNum > maxInfection) maxInfection = city.conNum;
      });
    }
  });
  fetch(censUrl).then(function (res) {
    return res.text();
  }).then(function (cens) {
    var render = function render(method) {
      d3.select("svg-frame").html("");
      var formula = method.formula,
          dataDefault = method.dataDefault,
          style = method.style,
          properties = method.properties;

      var resetRegion = function resetRegion() {
        d3.select(".rate").html(dataDefault.toFixed(method.properties.toFixed));
        d3.select(".city-name").html("China / 全国");
        d3.select('.grad-bar').style('background', "linear-gradient(to right,".concat(style.interpolation(0.2), ",").concat(style.interpolation(0.5), ",").concat(style.interpolation(0.9), ")"));
      };

      resetRegion();
      d3.select('.title .light').text(properties.title);
      d3.select('.desc').text(properties.desc);
      d3.select("svg-frame").append("svg").attr("viewBox", [0, 0, 875, 910]).append("g").selectAll("path").data(topoData).join("path").attr("class", "clickable").attr("fill", function (d) {
        var cut = altSubstr(d.properties.NAME);

        if (cut in data) {
          data[cut].used = true;
          return style.paint(formula(cut, d.properties));
        }

        return '#222';
      }).attr("d", path).on("mouseover", function (d) {
        var cut = altSubstr(d.properties.NAME);
        d3.select('.city-name').text(d.properties.NAME);

        if (cut in data) {
          d3.select('.rate').text(formula(cut, d.properties).toFixed(method.properties.toFixed));
        } else {
          d3.select('.rate').text(0);
        }
      }).on("click", function (d) {
        var cut = altSubstr(d.properties.NAME);

        if (cut in data) {
          var c = style.paint(formula(cut, d.properties));
          d3.select('body').style('background-color', (0, _chromaJs.default)(c).alpha(0.75));
        } else {
          d3.select('body').style('background-color', "");
        }
      }).on("mouseout", function (d) {
        resetRegion();
      });

      for (var city in data) {
        if (!data[city].used) console.warn("Unused city", city);
      }
    };

    var population = new Map(d3.csvParse(cens, function (_ref) {
      var city = _ref.city,
          population = _ref.population;
      return [altSubstr(city), population];
    }));
    console.log("Population Data from Census 2010", population);
    var methods = {
      ratio: {
        formula: function formula(cut, dProp) {
          return data[cut].conNum / population.get(cut);
        },
        dataDefault: +raw.data.gntotal / 138000,
        style: {
          paint: d3.scalePow().interpolate(function () {
            return d3.interpolateInferno;
          }).exponent(0.25).domain([0, 15]),
          interpolation: d3.interpolateInferno
        },
        properties: {
          title: "Infection Ratio",
          abbv: "感染比例 Ratio",
          desc: "Infections per 10,000 People / 每万人感染数",
          toFixed: 4
        }
      },
      density: {
        formula: function formula(cut, dProp) {
          return data[cut].conNum / dProp.Shape_Area;
        },
        dataDefault: +raw.data.gntotal / 960,
        style: {
          paint: d3.scalePow().interpolate(function () {
            return d3.interpolateViridis;
          }).exponent(0.3).domain([0, 1500]),
          interpolation: d3.interpolateViridis
        },
        properties: {
          title: "Infection Density",
          abbv: "感染密度 Density",
          desc: "Infections per 10,000 km² / 每万 km² 感染数",
          toFixed: 2
        }
      },
      absolute: {
        formula: function formula(cut, dProp) {
          return +data[cut].conNum;
        },
        dataDefault: +raw.data.gntotal,
        style: {
          paint: d3.scalePow().interpolate(function () {
            return d3.interpolateCividis;
          }).exponent(0.3).domain([0, 1500]),
          interpolation: d3.interpolateCividis
        },
        properties: {
          title: "Total Infections",
          abbv: "感染人数 Absolute",
          desc: "Number of Infected People / 感染人数",
          toFixed: 0
        }
      },
      cures: {
        formula: function formula(cut, dProp) {
          return +data[cut].cureNum;
        },
        dataDefault: +raw.data.curetotal,
        style: {
          paint: d3.scalePow().interpolate(function () {
            return d3.interpolateGreens;
          }).exponent(0.3).domain([0, 100]),
          interpolation: d3.interpolateGreens
        },
        properties: {
          title: "Total Cured",
          abbv: "治愈 Cures",
          desc: "Number of Cured People / 治愈人数",
          toFixed: 0
        }
      },
      deaths: {
        formula: function formula(cut, dProp) {
          return +data[cut].deathNum;
        },
        dataDefault: +raw.data.deathtotal,
        style: {
          paint: d3.scalePow().interpolate(function () {
            return d3.interpolateGreys;
          }).exponent(0.15).domain([0, 3000]),
          interpolation: d3.interpolateGreys
        },
        properties: {
          title: "Total Deaths",
          abbv: "死亡 Deaths",
          desc: "Number of Deaths / 死亡人数",
          toFixed: 0
        }
      }
    };

    var _loop = function _loop(method) {
      d3.select('.methods').append('input').attr('type', 'radio').attr('name', 'method-ratio').attr('id', method).on('click', function () {
        return render(methods[method]);
      });
      d3.select('.methods').append('label').attr('for', method).attr('class', 'clickable').text(methods[method].properties.abbv);
    };

    for (var method in methods) {
      _loop(method);
    } // Fire the first render


    document.querySelector('label[for="ratio"]').click();
  });
}).catch(function (ex) {
  console.log('parsing failed', ex);
});
},{"fetch-jsonp":"node_modules/fetch-jsonp/build/fetch-jsonp.js","chroma-js":"node_modules/chroma-js/chroma.js","./../data/china-proj.topo.json":"data/china-proj.topo.json","./../data/2010-census.csv":"data/2010-census.csv"}],"C:/Users/Tzingtao/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "11148" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["C:/Users/Tzingtao/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/main.js"], null)
//# sourceMappingURL=/main.fb6bbcaf.js.map