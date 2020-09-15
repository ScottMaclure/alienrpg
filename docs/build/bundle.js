
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var page = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	 module.exports = factory() ;
    }(commonjsGlobal, (function () {
    var isarray = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]';
    };

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
      // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
      '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {String} str
     * @return {Array}
     */
    function parse (str) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var res;

      while ((res = PATH_REGEXP.exec(str)) != null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          continue
        }

        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = '';
        }

        var prefix = res[2];
        var name = res[3];
        var capture = res[4];
        var group = res[5];
        var suffix = res[6];
        var asterisk = res[7];

        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        var delimiter = prefix || '/';
        var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

        tokens.push({
          name: name || key++,
          prefix: prefix || '',
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          pattern: escapeGroup(pattern)
        });
      }

      // Match any characters still remaining.
      if (index < str.length) {
        path += str.substr(index);
      }

      // If the path exists, push it onto the end.
      if (path) {
        tokens.push(path);
      }

      return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {String}   str
     * @return {Function}
     */
    function compile (str) {
      return tokensToFunction(parse(str))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);

      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^' + tokens[i].pattern + '$');
        }
      }

      return function (obj) {
        var path = '';
        var data = obj || {};

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === 'string') {
            path += token;

            continue
          }

          var value = data[token.name];
          var segment;

          if (value == null) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to be defined')
            }
          }

          if (isarray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
            }

            if (value.length === 0) {
              if (token.optional) {
                continue
              } else {
                throw new TypeError('Expected "' + token.name + '" to not be empty')
              }
            }

            for (var j = 0; j < value.length; j++) {
              segment = encodeURIComponent(value[j]);

              if (!matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
              }

              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }

            continue
          }

          segment = encodeURIComponent(value);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += token.prefix + segment;
        }

        return path
      }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {String} str
     * @return {String}
     */
    function escapeString (str) {
      return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {String} group
     * @return {String}
     */
    function escapeGroup (group) {
      return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    /**
     * Attach the keys as a property of the regexp.
     *
     * @param  {RegExp} re
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function attachKeys (re, keys) {
      re.keys = keys;
      return re
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {String}
     */
    function flags (options) {
      return options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {RegExp} path
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function regexpToRegexp (path, keys) {
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          });
        }
      }

      return attachKeys(path, keys)
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {Array}  path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function arrayToRegexp (path, keys, options) {
      var parts = [];

      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }

      var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

      return attachKeys(regexp, keys)
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {String} path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function stringToRegexp (path, keys, options) {
      var tokens = parse(path);
      var re = tokensToRegExp(tokens, options);

      // Attach keys back to the regexp.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] !== 'string') {
          keys.push(tokens[i]);
        }
      }

      return attachKeys(re, keys)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {Array}  tokens
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function tokensToRegExp (tokens, options) {
      options = options || {};

      var strict = options.strict;
      var end = options.end !== false;
      var route = '';
      var lastToken = tokens[tokens.length - 1];
      var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          route += escapeString(token);
        } else {
          var prefix = escapeString(token.prefix);
          var capture = token.pattern;

          if (token.repeat) {
            capture += '(?:' + prefix + capture + ')*';
          }

          if (token.optional) {
            if (prefix) {
              capture = '(?:' + prefix + '(' + capture + '))?';
            } else {
              capture = '(' + capture + ')?';
            }
          } else {
            capture = prefix + '(' + capture + ')';
          }

          route += capture;
        }
      }

      // In non-strict mode we allow a slash at the end of match. If the path to
      // match already ends with a slash, we remove it for consistency. The slash
      // is valid at the end of a path match, not in the middle. This is important
      // in non-ending mode, where "/test/" shouldn't match "/test//route".
      if (!strict) {
        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
      }

      if (end) {
        route += '$';
      } else {
        // In non-ending mode, we need the capturing groups to match as much as
        // possible by using a positive lookahead to the end or next path segment.
        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
      }

      return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(String|RegExp|Array)} path
     * @param  {Array}                 [keys]
     * @param  {Object}                [options]
     * @return {RegExp}
     */
    function pathToRegexp (path, keys, options) {
      keys = keys || [];

      if (!isarray(keys)) {
        options = keys;
        keys = [];
      } else if (!options) {
        options = {};
      }

      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys)
      }

      if (isarray(path)) {
        return arrayToRegexp(path, keys, options)
      }

      return stringToRegexp(path, keys, options)
    }

    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    /**
       * Module dependencies.
       */

      

      /**
       * Short-cuts for global-object checks
       */

      var hasDocument = ('undefined' !== typeof document);
      var hasWindow = ('undefined' !== typeof window);
      var hasHistory = ('undefined' !== typeof history);
      var hasProcess = typeof process !== 'undefined';

      /**
       * Detect click event
       */
      var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

      /**
       * To work properly with the URL
       * history.location generated polyfill in https://github.com/devote/HTML5-History-API
       */

      var isLocation = hasWindow && !!(window.history.location || window.location);

      /**
       * The page instance
       * @api private
       */
      function Page() {
        // public things
        this.callbacks = [];
        this.exits = [];
        this.current = '';
        this.len = 0;

        // private things
        this._decodeURLComponents = true;
        this._base = '';
        this._strict = false;
        this._running = false;
        this._hashbang = false;

        // bound functions
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
      }

      /**
       * Configure the instance of page. This can be called multiple times.
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.configure = function(options) {
        var opts = options || {};

        this._window = opts.window || (hasWindow && window);
        this._decodeURLComponents = opts.decodeURLComponents !== false;
        this._popstate = opts.popstate !== false && hasWindow;
        this._click = opts.click !== false && hasDocument;
        this._hashbang = !!opts.hashbang;

        var _window = this._window;
        if(this._popstate) {
          _window.addEventListener('popstate', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('popstate', this._onpopstate, false);
        }

        if (this._click) {
          _window.document.addEventListener(clickEvent, this.clickHandler, false);
        } else if(hasDocument) {
          _window.document.removeEventListener(clickEvent, this.clickHandler, false);
        }

        if(this._hashbang && hasWindow && !hasHistory) {
          _window.addEventListener('hashchange', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('hashchange', this._onpopstate, false);
        }
      };

      /**
       * Get or set basepath to `path`.
       *
       * @param {string} path
       * @api public
       */

      Page.prototype.base = function(path) {
        if (0 === arguments.length) return this._base;
        this._base = path;
      };

      /**
       * Gets the `base`, which depends on whether we are using History or
       * hashbang routing.

       * @api private
       */
      Page.prototype._getBase = function() {
        var base = this._base;
        if(!!base) return base;
        var loc = hasWindow && this._window && this._window.location;

        if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
          base = loc.pathname;
        }

        return base;
      };

      /**
       * Get or set strict path matching to `enable`
       *
       * @param {boolean} enable
       * @api public
       */

      Page.prototype.strict = function(enable) {
        if (0 === arguments.length) return this._strict;
        this._strict = enable;
      };


      /**
       * Bind with the given `options`.
       *
       * Options:
       *
       *    - `click` bind to click events [true]
       *    - `popstate` bind to popstate [true]
       *    - `dispatch` perform initial dispatch [true]
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.start = function(options) {
        var opts = options || {};
        this.configure(opts);

        if (false === opts.dispatch) return;
        this._running = true;

        var url;
        if(isLocation) {
          var window = this._window;
          var loc = window.location;

          if(this._hashbang && ~loc.hash.indexOf('#!')) {
            url = loc.hash.substr(2) + loc.search;
          } else if (this._hashbang) {
            url = loc.search + loc.hash;
          } else {
            url = loc.pathname + loc.search + loc.hash;
          }
        }

        this.replace(url, null, true, opts.dispatch);
      };

      /**
       * Unbind click and popstate event handlers.
       *
       * @api public
       */

      Page.prototype.stop = function() {
        if (!this._running) return;
        this.current = '';
        this.len = 0;
        this._running = false;

        var window = this._window;
        this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
        hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
        hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
      };

      /**
       * Show `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} dispatch
       * @param {boolean=} push
       * @return {!Context}
       * @api public
       */

      Page.prototype.show = function(path, state, dispatch, push) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        if (false !== dispatch) this.dispatch(ctx, prev);
        if (false !== ctx.handled && false !== push) ctx.pushState();
        return ctx;
      };

      /**
       * Goes back in the history
       * Back should always let the current route push state and then go back.
       *
       * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
       * @param {Object=} state
       * @api public
       */

      Page.prototype.back = function(path, state) {
        var page = this;
        if (this.len > 0) {
          var window = this._window;
          // this may need more testing to see if all browsers
          // wait for the next tick to go back in history
          hasHistory && window.history.back();
          this.len--;
        } else if (path) {
          setTimeout(function() {
            page.show(path, state);
          });
        } else {
          setTimeout(function() {
            page.show(page._getBase(), state);
          });
        }
      };

      /**
       * Register route to redirect from one path to other
       * or just redirect to another route
       *
       * @param {string} from - if param 'to' is undefined redirects to 'from'
       * @param {string=} to
       * @api public
       */
      Page.prototype.redirect = function(from, to) {
        var inst = this;

        // Define route from a path to another
        if ('string' === typeof from && 'string' === typeof to) {
          page.call(this, from, function(e) {
            setTimeout(function() {
              inst.replace(/** @type {!string} */ (to));
            }, 0);
          });
        }

        // Wait for the push state and replace it with another
        if ('string' === typeof from && 'undefined' === typeof to) {
          setTimeout(function() {
            inst.replace(from);
          }, 0);
        }
      };

      /**
       * Replace `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} init
       * @param {boolean=} dispatch
       * @return {!Context}
       * @api public
       */


      Page.prototype.replace = function(path, state, init, dispatch) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        ctx.init = init;
        ctx.save(); // save before dispatching, which may redirect
        if (false !== dispatch) this.dispatch(ctx, prev);
        return ctx;
      };

      /**
       * Dispatch the given `ctx`.
       *
       * @param {Context} ctx
       * @api private
       */

      Page.prototype.dispatch = function(ctx, prev) {
        var i = 0, j = 0, page = this;

        function nextExit() {
          var fn = page.exits[j++];
          if (!fn) return nextEnter();
          fn(prev, nextExit);
        }

        function nextEnter() {
          var fn = page.callbacks[i++];

          if (ctx.path !== page.current) {
            ctx.handled = false;
            return;
          }
          if (!fn) return unhandled.call(page, ctx);
          fn(ctx, nextEnter);
        }

        if (prev) {
          nextExit();
        } else {
          nextEnter();
        }
      };

      /**
       * Register an exit route on `path` with
       * callback `fn()`, which will be called
       * on the previous context when a new
       * page is visited.
       */
      Page.prototype.exit = function(path, fn) {
        if (typeof path === 'function') {
          return this.exit('*', path);
        }

        var route = new Route(path, null, this);
        for (var i = 1; i < arguments.length; ++i) {
          this.exits.push(route.middleware(arguments[i]));
        }
      };

      /**
       * Handle "click" events.
       */

      /* jshint +W054 */
      Page.prototype.clickHandler = function(e) {
        if (1 !== this._which(e)) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

        // ensure link
        // use shadow dom when available if not, fall back to composedPath()
        // for browsers that only have shady
        var el = e.target;
        var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

        if(eventPath) {
          for (var i = 0; i < eventPath.length; i++) {
            if (!eventPath[i].nodeName) continue;
            if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
            if (!eventPath[i].href) continue;

            el = eventPath[i];
            break;
          }
        }

        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase()) return;

        // check if link is inside an svg
        // in this case, both href and target are always inside an object
        var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

        // ensure non-hash for the same path
        var link = el.getAttribute('href');
        if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

        // Check for mailto: in the href
        if (link && link.indexOf('mailto:') > -1) return;

        // check target
        // svg target is an object and its desired value is in .baseVal property
        if (svg ? el.target.baseVal : el.target) return;

        // x-origin
        // note: svg links that are not relative don't call click events (and skip page.js)
        // consequently, all svg links tested inside page.js are relative and in the same origin
        if (!svg && !this.sameOrigin(el.href)) return;

        // rebuild path
        // There aren't .pathname and .search properties in svg links, so we use href
        // Also, svg href is an object and its desired value is in .baseVal property
        var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

        path = path[0] !== '/' ? '/' + path : path;

        // strip leading "/[drive letter]:" on NW.js on Windows
        if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
          path = path.replace(/^\/[a-zA-Z]:\//, '/');
        }

        // same page
        var orig = path;
        var pageBase = this._getBase();

        if (path.indexOf(pageBase) === 0) {
          path = path.substr(pageBase.length);
        }

        if (this._hashbang) path = path.replace('#!', '');

        if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
          return;
        }

        e.preventDefault();
        this.show(orig);
      };

      /**
       * Handle "populate" events.
       * @api private
       */

      Page.prototype._onpopstate = (function () {
        var loaded = false;
        if ( ! hasWindow ) {
          return function () {};
        }
        if (hasDocument && document.readyState === 'complete') {
          loaded = true;
        } else {
          window.addEventListener('load', function() {
            setTimeout(function() {
              loaded = true;
            }, 0);
          });
        }
        return function onpopstate(e) {
          if (!loaded) return;
          var page = this;
          if (e.state) {
            var path = e.state.path;
            page.replace(path, e.state);
          } else if (isLocation) {
            var loc = page._window.location;
            page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
          }
        };
      })();

      /**
       * Event button.
       */
      Page.prototype._which = function(e) {
        e = e || (hasWindow && this._window.event);
        return null == e.which ? e.button : e.which;
      };

      /**
       * Convert to a URL object
       * @api private
       */
      Page.prototype._toURL = function(href) {
        var window = this._window;
        if(typeof URL === 'function' && isLocation) {
          return new URL(href, window.location.toString());
        } else if (hasDocument) {
          var anc = window.document.createElement('a');
          anc.href = href;
          return anc;
        }
      };

      /**
       * Check if `href` is the same origin.
       * @param {string} href
       * @api public
       */
      Page.prototype.sameOrigin = function(href) {
        if(!href || !isLocation) return false;

        var url = this._toURL(href);
        var window = this._window;

        var loc = window.location;

        /*
           When the port is the default http port 80 for http, or 443 for
           https, internet explorer 11 returns an empty string for loc.port,
           so we need to compare loc.port with an empty string if url.port
           is the default port 80 or 443.
           Also the comparition with `port` is changed from `===` to `==` because
           `port` can be a string sometimes. This only applies to ie11.
        */
        return loc.protocol === url.protocol &&
          loc.hostname === url.hostname &&
          (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
      };

      /**
       * @api private
       */
      Page.prototype._samePath = function(url) {
        if(!isLocation) return false;
        var window = this._window;
        var loc = window.location;
        return url.pathname === loc.pathname &&
          url.search === loc.search;
      };

      /**
       * Remove URL encoding from the given `str`.
       * Accommodates whitespace in both x-www-form-urlencoded
       * and regular percent-encoded form.
       *
       * @param {string} val - URL component to decode
       * @api private
       */
      Page.prototype._decodeURLEncodedURIComponent = function(val) {
        if (typeof val !== 'string') { return val; }
        return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
      };

      /**
       * Create a new `page` instance and function
       */
      function createPage() {
        var pageInstance = new Page();

        function pageFn(/* args */) {
          return page.apply(pageInstance, arguments);
        }

        // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
        pageFn.callbacks = pageInstance.callbacks;
        pageFn.exits = pageInstance.exits;
        pageFn.base = pageInstance.base.bind(pageInstance);
        pageFn.strict = pageInstance.strict.bind(pageInstance);
        pageFn.start = pageInstance.start.bind(pageInstance);
        pageFn.stop = pageInstance.stop.bind(pageInstance);
        pageFn.show = pageInstance.show.bind(pageInstance);
        pageFn.back = pageInstance.back.bind(pageInstance);
        pageFn.redirect = pageInstance.redirect.bind(pageInstance);
        pageFn.replace = pageInstance.replace.bind(pageInstance);
        pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
        pageFn.exit = pageInstance.exit.bind(pageInstance);
        pageFn.configure = pageInstance.configure.bind(pageInstance);
        pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
        pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

        pageFn.create = createPage;

        Object.defineProperty(pageFn, 'len', {
          get: function(){
            return pageInstance.len;
          },
          set: function(val) {
            pageInstance.len = val;
          }
        });

        Object.defineProperty(pageFn, 'current', {
          get: function(){
            return pageInstance.current;
          },
          set: function(val) {
            pageInstance.current = val;
          }
        });

        // In 2.0 these can be named exports
        pageFn.Context = Context;
        pageFn.Route = Route;

        return pageFn;
      }

      /**
       * Register `path` with callback `fn()`,
       * or route `path`, or redirection,
       * or `page.start()`.
       *
       *   page(fn);
       *   page('*', fn);
       *   page('/user/:id', load, user);
       *   page('/user/' + user.id, { some: 'thing' });
       *   page('/user/' + user.id);
       *   page('/from', '/to')
       *   page();
       *
       * @param {string|!Function|!Object} path
       * @param {Function=} fn
       * @api public
       */

      function page(path, fn) {
        // <callback>
        if ('function' === typeof path) {
          return page.call(this, '*', path);
        }

        // route <path> to <callback ...>
        if ('function' === typeof fn) {
          var route = new Route(/** @type {string} */ (path), null, this);
          for (var i = 1; i < arguments.length; ++i) {
            this.callbacks.push(route.middleware(arguments[i]));
          }
          // show <path> with [state]
        } else if ('string' === typeof path) {
          this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
          // start [options]
        } else {
          this.start(path);
        }
      }

      /**
       * Unhandled `ctx`. When it's not the initial
       * popstate then redirect. If you wish to handle
       * 404s on your own use `page('*', callback)`.
       *
       * @param {Context} ctx
       * @api private
       */
      function unhandled(ctx) {
        if (ctx.handled) return;
        var current;
        var page = this;
        var window = page._window;

        if (page._hashbang) {
          current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
        } else {
          current = isLocation && window.location.pathname + window.location.search;
        }

        if (current === ctx.canonicalPath) return;
        page.stop();
        ctx.handled = false;
        isLocation && (window.location.href = ctx.canonicalPath);
      }

      /**
       * Escapes RegExp characters in the given string.
       *
       * @param {string} s
       * @api private
       */
      function escapeRegExp(s) {
        return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
      }

      /**
       * Initialize a new "request" `Context`
       * with the given `path` and optional initial `state`.
       *
       * @constructor
       * @param {string} path
       * @param {Object=} state
       * @api public
       */

      function Context(path, state, pageInstance) {
        var _page = this.page = pageInstance || page;
        var window = _page._window;
        var hashbang = _page._hashbang;

        var pageBase = _page._getBase();
        if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
        var i = path.indexOf('?');

        this.canonicalPath = path;
        var re = new RegExp('^' + escapeRegExp(pageBase));
        this.path = path.replace(re, '') || '/';
        if (hashbang) this.path = this.path.replace('#!', '') || '/';

        this.title = (hasDocument && window.document.title);
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
        this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
        this.params = {};

        // fragment
        this.hash = '';
        if (!hashbang) {
          if (!~this.path.indexOf('#')) return;
          var parts = this.path.split('#');
          this.path = this.pathname = parts[0];
          this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
          this.querystring = this.querystring.split('#')[0];
        }
      }

      /**
       * Push state.
       *
       * @api private
       */

      Context.prototype.pushState = function() {
        var page = this.page;
        var window = page._window;
        var hashbang = page._hashbang;

        page.len++;
        if (hasHistory) {
            window.history.pushState(this.state, this.title,
              hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Save the context state.
       *
       * @api public
       */

      Context.prototype.save = function() {
        var page = this.page;
        if (hasHistory) {
            page._window.history.replaceState(this.state, this.title,
              page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Initialize `Route` with the given HTTP `path`,
       * and an array of `callbacks` and `options`.
       *
       * Options:
       *
       *   - `sensitive`    enable case-sensitive routes
       *   - `strict`       enable strict matching for trailing slashes
       *
       * @constructor
       * @param {string} path
       * @param {Object=} options
       * @api private
       */

      function Route(path, options, page) {
        var _page = this.page = page || globalPage;
        var opts = options || {};
        opts.strict = opts.strict || _page._strict;
        this.path = (path === '*') ? '(.*)' : path;
        this.method = 'GET';
        this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
      }

      /**
       * Return route middleware with
       * the given callback `fn()`.
       *
       * @param {Function} fn
       * @return {Function}
       * @api public
       */

      Route.prototype.middleware = function(fn) {
        var self = this;
        return function(ctx, next) {
          if (self.match(ctx.path, ctx.params)) {
            ctx.routePath = self.path;
            return fn(ctx, next);
          }
          next();
        };
      };

      /**
       * Check if this route matches `path`, if so
       * populate `params`.
       *
       * @param {string} path
       * @param {Object} params
       * @return {boolean}
       * @api private
       */

      Route.prototype.match = function(path, params) {
        var keys = this.keys,
          qsIndex = path.indexOf('?'),
          pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
          m = this.regexp.exec(decodeURIComponent(pathname));

        if (!m) return false;

        delete params[0];

        for (var i = 1, len = m.length; i < len; ++i) {
          var key = keys[i - 1];
          var val = this.page._decodeURLEncodedURIComponent(m[i]);
          if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
            params[key.name] = val;
          }
        }

        return true;
      };


      /**
       * Module exports.
       */

      var globalPage = createPage();
      var page_js = globalPage;
      var default_1 = globalPage;

    page_js.default = default_1;

    return page_js;

    })));
    });

    var title = "Alien RPG Tools";
    var version = "14 Sep 2020 11:26:47";
    var copyright = "Any text taken from the game is used with permission and remains © of their respective owners.";
    var githubUrl = "https://github.com/ScottMaclure/alienrpg/";
    var appData = {
    	title: title,
    	version: version,
    	copyright: copyright,
    	githubUrl: githubUrl
    };

    /* src\components\Home.svelte generated by Svelte v3.24.1 */

    const file = "src\\components\\Home.svelte";

    function create_fragment(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let p;
    	let t2;
    	let strong;
    	let i;
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "What's This?";
    			t1 = space();
    			p = element("p");
    			t2 = text("An ");
    			strong = element("strong");
    			i = element("i");
    			i.textContent = "unofficial";
    			t4 = text(" web app to help Game Mothers with their prep. Click links and then buttons to generate random stuff. Results are in plaintext.");
    			add_location(h4, file, 1, 4, 10);
    			add_location(i, file, 2, 18, 50);
    			add_location(strong, file, 2, 10, 42);
    			add_location(p, file, 2, 4, 36);
    			add_location(div, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(p, strong);
    			append_dev(strong, i);
    			append_dev(p, t4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var starTypes = [
    	{
    		type: "Giant",
    		description: "Huge, bright and cool star in a late stage of evolution.",
    		brightness: "Type III"
    	},
    	{
    		type: "Subgiant",
    		description: "A large, bright star, exhausting its fuel.",
    		brightness: "Type IV"
    	},
    	{
    		type: "Main Sequence",
    		description: "Small but incredibly common type of star.",
    		brightness: "Type V"
    	},
    	{
    		type: "White Dwarf",
    		description: "A dead, burnt-out star, tiny and super-dense.",
    		brightness: "Type DA"
    	},
    	{
    		type: "Red Dwarf",
    		description: "A red main sequence star, small and cool. Very common star.",
    		brightness: "Type MV"
    	},
    	{
    		type: "White Main Sequence",
    		description: "White main sequence stars that burn hot and brightly.",
    		brightness: "Type A0V"
    	}
    ];
    var starLocations = [
    	{
    		key: "icsc",
    		name: "The Independent Core System Colonies",
    		colonyAllegianceKey: "icsc"
    	},
    	{
    		key: "aja",
    		name: "Anglo-Japanese Arm",
    		colonyAllegianceKey: "aajm"
    	},
    	{
    		key: "upp",
    		name: "The Union of Progressive Peoples",
    		colonyAllegianceKey: "upp"
    	},
    	{
    		key: "arm",
    		name: "The United Americas",
    		colonyAllegianceKey: "aajm"
    	},
    	{
    		key: "fro",
    		name: "The Frontier",
    		colonyAllegianceKeys: [
    			"icsc",
    			"aajm",
    			"upp"
    		]
    	}
    ];
    var systemObjects = [
    	{
    		enabled: true,
    		key: "gasGiant",
    		type: "Gas Giant",
    		number: "d6",
    		modifiers: {
    			"default": "-1",
    			Subgiant: "-2",
    			"White Dwarf": "-5"
    		},
    		features: [
    			"High Winds",
    			"Intense Radiation Fields",
    			"Rings",
    			"Single Super Storm",
    			"Small Gas Giant",
    			"Storms"
    		],
    		habitable: false,
    		surveyable: true,
    		planetSizeMod: 0,
    		moonSizeMod: -4
    	},
    	{
    		enabled: true,
    		key: "terrestrialPlanet",
    		type: "Terrestrial Planet",
    		number: "d6",
    		modifiers: {
    			"default": "",
    			"Red Dwarf": "-3",
    			"White Dwarf": "-3"
    		},
    		habitable: true,
    		surveyable: true,
    		planetSizeMod: 0
    	},
    	{
    		enabled: true,
    		key: "icePlanet",
    		type: "Ice Planet",
    		number: "d6",
    		modifiers: {
    			"default": "+1",
    			Subgiant: "",
    			Giant: "",
    			"White Main Sequence": ""
    		},
    		habitable: true,
    		surveyable: true,
    		planetSizeMod: -2
    	},
    	{
    		enabled: true,
    		key: "asteroidBelt",
    		type: "Asteroid Belt",
    		number: "d6",
    		modifiers: {
    			"default": "-3",
    			"White Dwarf": "-5",
    			Subgiant: "-5"
    		},
    		features: [
    			"Bright and highly visible",
    			"Contains several large dwarf planets",
    			"Dust Belt",
    			"High orbital inclination",
    			"Intensely mineral rich asteroids",
    			"Very wide—covering several orbits"
    		],
    		habitable: false,
    		surveyable: false,
    		planetSizeMod: 0
    	}
    ];
    var iccCodes = [
    	"LV",
    	"MT",
    	"RF"
    ];
    var planetaryNames = [
    	"Arges",
    	"Aurora",
    	"Damnation",
    	"Doramin",
    	"Euphrates",
    	"Hamilton",
    	"Hannibal",
    	"Magdala",
    	"Moab",
    	"Monos",
    	"Nakaya",
    	"Napier",
    	"Nemesis",
    	"Nero",
    	"Nocturne",
    	"Phaeton",
    	"Prospero",
    	"Requiem",
    	"Solitude",
    	"Steropes",
    	"Tracatus"
    ];
    var planetSizes = [
    	{
    		"2d6": 2,
    		sizeKm: 999,
    		surfaceGravity: 0,
    		examples: "Ceres and other asteroids",
    		atmosphereMod: "-6",
    		colonySizeMod: -3
    	},
    	{
    		"2d6": 4,
    		sizeKm: 2000,
    		surfaceGravity: 0.1,
    		examples: "Iapetus",
    		atmosphereMod: -6,
    		colonySizeMod: -3
    	},
    	{
    		"2d6": 6,
    		sizeKm: 4000,
    		surfaceGravity: 0.2,
    		examples: "Luna, Europa",
    		atmosphereMod: -6,
    		colonySizeMod: -3
    	},
    	{
    		"2d6": 7,
    		sizeKm: 7000,
    		surfaceGravity: 0.5,
    		examples: "Mars",
    		atmosphereMod: -2,
    		colonySizeMod: 0
    	},
    	{
    		"2d6": 8,
    		sizeKm: 10000,
    		surfaceGravity: 0.7,
    		examples: null,
    		atmosphereMod: 0,
    		colonySizeMod: 0
    	},
    	{
    		"2d6": 10,
    		sizeKm: 12500,
    		surfaceGravity: 1,
    		examples: "Earth, Venus",
    		atmosphereMod: 0,
    		colonySizeMod: 0
    	},
    	{
    		"2d6": 11,
    		sizeKm: 15000,
    		surfaceGravity: 1.3,
    		examples: null,
    		atmosphereMod: 0,
    		colonySizeMod: 0
    	},
    	{
    		"2d6": 50,
    		sizeKm: 20000,
    		surfaceGravity: 2,
    		examples: "Super-Earth",
    		atmosphereMod: 0,
    		colonySizeMod: 0
    	}
    ];
    var atmospheres = [
    	{
    		"2d6": 3,
    		type: "Thin",
    		temperatureMod: -4,
    		geosphereMod: -4,
    		colonySizeMod: 0,
    		colonyMissionMod: 0
    	},
    	{
    		"2d6": 6,
    		type: "Breathable",
    		temperatureMod: 0,
    		geosphereMod: 0,
    		colonySizeMod: 1,
    		colonyMissionMod: 1
    	},
    	{
    		"2d6": 8,
    		type: "Toxic",
    		temperatureMod: 0,
    		geosphereMod: 0,
    		colonySizeMod: 0,
    		colonyMissionMod: -6
    	},
    	{
    		"2d6": 9,
    		type: "Dense",
    		temperatureMod: 1,
    		geosphereMod: -4,
    		colonySizeMod: 0,
    		colonyMissionMod: 0
    	},
    	{
    		"2d6": 10,
    		type: "Corrosive",
    		temperatureMod: 6,
    		geosphereMod: -4,
    		colonySizeMod: -2,
    		colonyMissionMod: -6
    	},
    	{
    		"2d6": 11,
    		type: "Infiltrating",
    		temperatureMod: 6,
    		geosphereMod: -4,
    		colonySizeMod: -2,
    		colonyMissionMod: -6
    	},
    	{
    		"2d6": 50,
    		type: "Special",
    		temperatureMod: 0,
    		geosphereMod: 8,
    		colonySizeMod: 0,
    		colonyMissionMod: 0
    	}
    ];
    var temperatures = [
    	{
    		"2d6": 3,
    		type: "Frozen",
    		min: -100,
    		max: -50,
    		description: "Titan, Pluto, Enceladus",
    		geosphereMod: -2,
    		terrestrialPlanet: -2,
    		icePlanet: 0
    	},
    	{
    		"2d6": 5,
    		type: "Cold",
    		min: -50,
    		max: 0,
    		description: "Alaska or Antarctica in winter",
    		geosphereMod: 0,
    		terrestrialPlanet: 0,
    		icePlanet: 0
    	},
    	{
    		"2d6": 7,
    		type: "Temperate",
    		min: 0,
    		max: 30,
    		description: "Boston or Paris",
    		geosphereMod: 0,
    		terrestrialPlanet: 0,
    		icePlanet: 0
    	},
    	{
    		"2d6": 10,
    		type: "Hot",
    		min: 31,
    		max: 80,
    		description: "Titan, Pluto, Enceladus",
    		geosphereMod: -2,
    		terrestrialPlanet: 0,
    		icePlanet: 0
    	},
    	{
    		"2d6": 50,
    		type: "Burning",
    		min: 80,
    		max: 200,
    		description: "Mercury, Venus",
    		geosphereMod: -4,
    		terrestrialPlanet: 0,
    		icePlanet: 0
    	}
    ];
    var geospheres = [
    	{
    		"2d6": 4,
    		type: "Desert World",
    		description: "No surface water",
    		terrestrialPlanet: -3,
    		icePlanet: 0
    	},
    	{
    		"2d6": 6,
    		type: "Arid World",
    		description: "Global deserts and dry steppes, with some lakes and small seas",
    		terrestrialPlanet: -2,
    		icePlanet: 0
    	},
    	{
    		"2d6": 8,
    		type: "Temperate-Dry World",
    		description: "Oceans cover 30–40% of the world's surface",
    		terrestrialPlanet: 0,
    		icePlanet: 0
    	},
    	{
    		"2d6": 10,
    		type: "Temperate-Wet World",
    		description: "Oceans cover 60–70% of the world's surface",
    		terrestrialPlanet: 0,
    		icePlanet: 0
    	},
    	{
    		"2d6": 11,
    		type: "Wet World",
    		description: "Global oceans with some islands and archipelagos",
    		terrestrialPlanet: 2,
    		icePlanet: 0
    	},
    	{
    		"2d6": 50,
    		type: "Water World",
    		description: "No dry land",
    		terrestrialPlanet: 3,
    		icePlanet: 0
    	}
    ];
    var terrains = {
    	terrestrialPlanet: [
    		{
    			d66: 11,
    			description: "Huge impact crater"
    		},
    		{
    			d66: 12,
    			description: "Plains of silicon glass"
    		},
    		{
    			d66: 13,
    			description: "Disturbing wind-cut rock formations"
    		},
    		{
    			d66: 14,
    			description: "Permanent global dust-storm"
    		},
    		{
    			d66: 15,
    			description: "Eerily colored dust plains"
    		},
    		{
    			d66: 16,
    			description: "Active volcanic lava fields"
    		},
    		{
    			d66: 21,
    			description: "Extensive salt flats"
    		},
    		{
    			d66: 22,
    			description: "Dust-laden, permanent sunset sky"
    		},
    		{
    			d66: 23,
    			description: "Ancient, blackened lava plains"
    		},
    		{
    			d66: 24,
    			description: "Thermal springs and steam vents"
    		},
    		{
    			d66: 25,
    			description: "Tall, gravel-strewn mountains"
    		},
    		{
    			d66: 26,
    			description: "Howling winds that never stop"
    		},
    		{
    			d66: 31,
    			description: "Daily fog banks roll in"
    		},
    		{
    			d66: 32,
    			description: "Deep and wide rift valleys"
    		},
    		{
    			d66: 33,
    			description: "Bizarrely eroded, wind-cut badlands"
    		},
    		{
    			d66: 34,
    			description: "Steep-sided river gorges cut into soft rocks"
    		},
    		{
    			d66: 35,
    			description: "Huge moon dominates day/night sky"
    		},
    		{
    			d66: 36,
    			description: "World-spanning super canyon"
    		},
    		{
    			d66: 41,
    			description: "Impressive river of great length"
    		},
    		{
    			d66: 42,
    			description: "Oddly colored forests of alien vegetation"
    		},
    		{
    			d66: 43,
    			description: "Mountains cut by sky-blue lakes"
    		},
    		{
    			d66: 44,
    			description: "Sweeping plains of elephant grass"
    		},
    		{
    			d66: 45,
    			description: "Highly toxic, but beautiful, plant-life"
    		},
    		{
    			d66: 46,
    			description: "Small, bright, incredibly fast moons in orbit"
    		},
    		{
    			d66: 51,
    			description: "Vast and complex river delta"
    		},
    		{
    			d66: 52,
    			description: "Immense series of waterfalls"
    		},
    		{
    			d66: 53,
    			description: "Endless mudflats with twisting water-ways"
    		},
    		{
    			d66: 54,
    			description: "Impressive coastline of fjords and cliffs"
    		},
    		{
    			d66: 55,
    			description: "Volcanoes, active & widespread"
    		},
    		{
    			d66: 56,
    			description: "Impenetrable jungle"
    		},
    		{
    			d66: 61,
    			description: "Dangerous tides—fast and loud"
    		},
    		{
    			d66: 62,
    			description: "Vast, permanent super storm"
    		},
    		{
    			d66: 63,
    			description: "Toxic sea creatures floating with the currents"
    		},
    		{
    			d66: 64,
    			description: "Volcanic island chains"
    		},
    		{
    			d66: 65,
    			description: "Permanently overcast with unrelenting rainfall"
    		},
    		{
    			d66: 100,
    			description: "Mildly acidic oceans and rainfall"
    		}
    	],
    	icePlanet: [
    		{
    			"2d6": 2,
    			description: "Huge impact crater"
    		},
    		{
    			"2d6": 3,
    			description: "Geysers spew water into low orbit from long fissures"
    		},
    		{
    			"2d6": 4,
    			description: "Deep fissures leading to a subsurface ocean"
    		},
    		{
    			"2d6": 5,
    			description: "Dramatically colored blue-green ice fissures"
    		},
    		{
    			"2d6": 6,
    			description: "Huge and active cryovolcano"
    		},
    		{
    			"2d6": 7,
    			description: "Vast range of ice mountains"
    		},
    		{
    			"2d6": 8,
    			description: "World-spanning super canyon"
    		},
    		{
    			"2d6": 9,
    			description: "Disturbing, wind-cut ice formations"
    		},
    		{
    			"2d6": 10,
    			description: "Black, dust-covered ice plains"
    		},
    		{
    			"2d6": 11,
    			description: "Impressive ice escarpment of great length"
    		},
    		{
    			"2d6": 100,
    			description: "Extensive dune-fields of methane sand grains"
    		}
    	]
    };
    var colonySizes = [
    	{
    		"2d6": "7",
    		size: "Start-Up",
    		population: "3d6x10",
    		missions: "1",
    		colonyMissionMod: -1,
    		orbitalComponenMod: 0
    	},
    	{
    		"2d6": "10",
    		size: "Young",
    		population: "3d6x100",
    		missions: "d3–1",
    		colonyMissionMod: 0,
    		orbitalComponenMod: 1
    	},
    	{
    		"2d6": "50",
    		size: "Established",
    		population: "2d6x1000",
    		missions: "d3",
    		colonyMissionMod: 4,
    		orbitalComponenMod: 2
    	}
    ];
    var colonyMissions = [
    	{
    		"2d6": 2,
    		type: "Terraforming"
    	},
    	{
    		"2d6": 3,
    		type: "Research"
    	},
    	{
    		"2d6": 4,
    		type: "Survey and Prospecting"
    	},
    	{
    		"2d6": 5,
    		type: "Prison/Secluded or Exile"
    	},
    	{
    		"2d6": 6,
    		type: "Mining and Refining"
    	},
    	{
    		"2d6": 7,
    		type: "Mineral Drilling"
    	},
    	{
    		"2d6": 8,
    		type: "Communications Relay"
    	},
    	{
    		"2d6": 9,
    		type: "Military"
    	},
    	{
    		"2d6": 10,
    		type: "Cattle Ranching/Logging"
    	},
    	{
    		"2d6": 11,
    		type: "Corporate HQ"
    	},
    	{
    		"2d6": 50,
    		type: "Government HQ"
    	}
    ];
    var orbitalComponents = [
    	{
    		"2d6": 4,
    		type: "Little (perhaps wreckage) or nothing"
    	},
    	{
    		"2d6": 5,
    		type: "Ring"
    	},
    	{
    		"2d6": 6,
    		type: "Abandoned or Repurposed Satellite or Space Station"
    	},
    	{
    		"2d6": 8,
    		type: "Moons",
    		quantity: "d3",
    		isMoon: true
    	},
    	{
    		"2d6": 9,
    		type: "Survey Station"
    	},
    	{
    		"2d6": 10,
    		type: "Several Survey and Communications Satellites"
    	},
    	{
    		"2d6": 11,
    		type: "Transfer Station"
    	},
    	{
    		"2d6": 50,
    		multiRoll: "d6"
    	}
    ];
    var factionOptions = [
    	{
    		d6: 1,
    		factions: [
    			{
    				strength: 6
    			}
    		]
    	},
    	{
    		d6: 2,
    		factions: [
    			{
    				strength: 3
    			},
    			{
    				strength: 3
    			}
    		]
    	},
    	{
    		d6: 3,
    		factions: [
    			{
    				strength: 5
    			},
    			{
    				strength: 5
    			}
    		]
    	},
    	{
    		d6: 4,
    		factions: [
    			{
    				strength: 6
    			},
    			{
    				strength: 1
    			}
    		]
    	},
    	{
    		d6: 5,
    		factions: [
    			{
    				strength: 5
    			},
    			{
    				strength: 5
    			},
    			{
    				strength: 5
    			}
    		]
    	},
    	{
    		d6: 6,
    		quantity: "d6",
    		factions: [
    		]
    	}
    ];
    var colonyAllegiances = [
    	{
    		"3d6": 4,
    		icsc: "Kelland Mining",
    		aajm: "Kelland Mining",
    		upp: "UPP"
    	},
    	{
    		"3d6": 5,
    		icsc: "GeoFund Investor",
    		aajm: "Gustafsson Enterprise",
    		upp: "UPP"
    	},
    	{
    		"3d6": 6,
    		icsc: "Gustafsson Enterprise",
    		aajm: "GeoFund Investor",
    		upp: "UPP"
    	},
    	{
    		"3d6": 7,
    		icsc: "Seegson",
    		aajm: "Lasalle Bionational",
    		upp: "UPP"
    	},
    	{
    		"3d6": 8,
    		icsc: "No allegiance (independent)",
    		aajm: "Weyland-Yutani",
    		upp: "UPP"
    	},
    	{
    		"3d6": 11,
    		icsc: "Jĭngtì Lóng Corporation",
    		aajm: "Government representative",
    		upp: "UPP"
    	},
    	{
    		"3d6": 12,
    		icsc: "Chigusa Corporation",
    		aajm: "Weyland-Yutani",
    		upp: "UPP"
    	},
    	{
    		"3d6": 13,
    		icsc: "Lasalle Bionational",
    		aajm: "Seegson",
    		upp: "UPP"
    	},
    	{
    		"3d6": 14,
    		icsc: "Seegson",
    		aajm: "Jĭngtì Lóng Corporation",
    		upp: "UPP"
    	},
    	{
    		"3d6": 15,
    		icsc: "Lorenz SysTech",
    		aajm: "Chigusa Corporation",
    		upp: "UPP"
    	},
    	{
    		"3d6": 16,
    		icsc: "Gemini Exoplanet",
    		aajm: "Gemini Exoplanet",
    		upp: "UPP"
    	},
    	{
    		"3d6": 50,
    		icsc: "Farside Mining",
    		aajm: "Farside Mining",
    		upp: "UPP"
    	}
    ];
    var scenarioHooks = [
    	{
    		d66: 11,
    		description: "Pilfering and thefts force security to search rooms and lockers."
    	},
    	{
    		d66: 12,
    		description: "Incidents of sabotage are increasing; security suspects an organized campaign."
    	},
    	{
    		d66: 13,
    		description: "Colonial Administration is investigating the colony for illegal practices."
    	},
    	{
    		d66: 14,
    		description: "Colonists returning to base report sighting a ‘monster’ on the surface."
    	},
    	{
    		d66: 15,
    		description: "Petty crime, thefts and sabotage are rife. "
    	},
    	{
    		d66: 16,
    		description: "Equipment failure has resulted in rationing at the colony. Tempers are frayed."
    	},
    	{
    		d66: 21,
    		description: "Ship recently arrived with some kind of parasite that will soon spread through the colony."
    	},
    	{
    		d66: 22,
    		description: "Stolen goods are on offer—cheap! "
    	},
    	{
    		d66: 23,
    		description: "Unknown to you an old friend/flame is at the colony."
    	},
    	{
    		d66: 24,
    		description: "Unknown to you an old enemy/rival is at the colony."
    	},
    	{
    		d66: 25,
    		description: "A minor dignitary/notable is visiting in the company of several aides or guards."
    	},
    	{
    		d66: 26,
    		description: "Part of the colony is off-limits temporarily - no reason given."
    	},
    	{
    		d66: 31,
    		description: "Sudden restriction on free movement, unless you can find a way to avoid it."
    	},
    	{
    		d66: 32,
    		description: "An emergency means repair parts and vital supplies are being shipped in from a nearby colony."
    	},
    	{
    		d66: 33,
    		description: "Local crisis about to hit (storm, earthquake, riot, fire, etc.)"
    	},
    	{
    		d66: 34,
    		description: "Period of solar flare—will cut communications for one Shift (D6 days if star type MV)."
    	},
    	{
    		d66: 35,
    		description: "Spies from a neighboring colony have been discovered and arrested."
    	},
    	{
    		d66: 36,
    		description: "Operations manager and his deputy are in conflict; everyone is choosing sides."
    	},
    	{
    		d66: 41,
    		description: "PCs are invited to a formal dinner, meeting or party."
    	},
    	{
    		d66: 42,
    		description: "The local colonists are not what they seem."
    	},
    	{
    		d66: 43,
    		description: "A military ship is in orbit and the landing party is searching for someone/something."
    	},
    	{
    		d66: 44,
    		description: "A rival colony or corporation is about to carry out an act of sabotage."
    	},
    	{
    		d66: 45,
    		description: "The spaceport is currently quarantined."
    	},
    	{
    		d66: 46,
    		description: "Security situation at the colony."
    	},
    	{
    		d66: 51,
    		description: "A bunch of asteroid miners causing trouble while on leave."
    	},
    	{
    		d66: 52,
    		description: "Mystery ship arrives at the spaceport."
    	},
    	{
    		d66: 53,
    		description: "Civil unrest is about to break out."
    	},
    	{
    		d66: 54,
    		description: "Colonists are trapped and need rescuing far from the settlement itself."
    	},
    	{
    		d66: 55,
    		description: "Authorities have just locked down the colony after a riot."
    	},
    	{
    		d66: 56,
    		description: "A religious leader is whipping up discontent."
    	},
    	{
    		d66: 61,
    		description: "PCs will be harassed by angry locals. Why the anger? And why directed at off-world personnel?"
    	},
    	{
    		d66: 62,
    		description: "An expedition is being assembled for a trek overland—the PCs are invited."
    	},
    	{
    		d66: 63,
    		description: "An important colonial official is murdered, only an hour after you arrive."
    	},
    	{
    		d66: 64,
    		description: "Several colonists have gone missing — a search is underway."
    	},
    	{
    		d66: 65,
    		description: "A lifeboat has crashed on planet, and contained an interesting individual."
    	},
    	{
    		d66: 100,
    		description: "The corporation or government paying for the colony keeps ordering teams out to search remote areas—but won’t say what they are searching for."
    	}
    ];
    var starData = {
    	starTypes: starTypes,
    	starLocations: starLocations,
    	systemObjects: systemObjects,
    	iccCodes: iccCodes,
    	planetaryNames: planetaryNames,
    	planetSizes: planetSizes,
    	atmospheres: atmospheres,
    	temperatures: temperatures,
    	geospheres: geospheres,
    	terrains: terrains,
    	colonySizes: colonySizes,
    	colonyMissions: colonyMissions,
    	orbitalComponents: orbitalComponents,
    	factionOptions: factionOptions,
    	colonyAllegiances: colonyAllegiances,
    	scenarioHooks: scenarioHooks
    };

    var isMultiplier = (str) => {
      if (typeof str === 'string') {
        return /[xX*]{1}[\d]{1,}/.test(str);
      }
      return false;
    };

    var isFudge = (sides) => (!!((sides && sides.toString().toUpperCase() === 'F')));

    var isDropLowest = (mod) => !!(mod && mod.toString().toUpperCase() === '-L');

    var isSuccessCount = (mod) => !!(mod && /[<>]{1}[\d]{1,}/.test(mod));

    /**
     * Parse a die notation string.
     * @param {int} diceString - A die notation string ie "1d20+5".
     * @return {object} An object containing the parsed components of the die string.
     */
    var parseDieNotation = (diceString) => {
      if (typeof diceString !== 'string') {
        throw new Error('parseDieNotation must be called with a dice notation string');
      }

      const parts = diceString.toLowerCase().split('d');
      const count = parseInt(parts[0], 10) || 1;
      const sides = isFudge(parts[1]) ? 'F' : parseInt(parts[1], 10);
      let mod = 0;
      const result = {
        count,
        sides,
      };

      if (Number.isNaN(Number(parts[1]))) {
        // die notation includes a modifier
        const modifierMatch = /[+-xX*<>]{1}[\dlL]{1,}/;
        const matchResult = parts[1].match(modifierMatch);
        if (matchResult) {
          if (isMultiplier(matchResult[0])) {
            result.multiply = true;
            mod = parseInt(matchResult[0].substring(1), 10);
          } else if (isDropLowest(matchResult[0])) {
            mod = 0;
            result.dropLow = true;
          } else if (isSuccessCount(matchResult[0])) {
            const highOrLow = matchResult[0].charAt(0);
            result.success = highOrLow === '>' ? 1 : -1;
            mod = parseInt(matchResult[0].substring(1), 10);
          } else {
            mod = parseInt(matchResult[0], 10);
          }
        }
      }
      result.mod = mod;

      return result;
    };

    /**
     * Generate a random number between 1 and sides.
     * @param {int} sides - The number of sides on the die.
     * @param {function} randFn - A function that returns a pseudorandom float between 0 and 1.
     * @return {int} The number rolled.
     */
    var rollDie = (sides, randFn = Math.random) => {
      if (!isFudge(sides) && !Number.isInteger(sides)) {
        throw new Error('rollDie must be called with an integer or F');
      }

      if (isFudge(sides)) {
        return Math.ceil(randFn() * 2) - 1;
      }

      return Math.ceil(randFn() * (sides - 1) + 1);
    };

    const getTotal = (results, options) => {
      const {
        mod, multiply, dropLow, success,
      } = options;
      let resultCopy = [...results];
      let total = 0;

      if (dropLow) {
        (resultCopy = resultCopy.sort((a, b) => a - b)).shift();
      }

      if (success) {
        resultCopy.forEach((v) => {
          if ((success < 0 && v <= mod) || (success > 0 && v >= mod)) {
            total += 1;
          }
        });
      } else {
        resultCopy.forEach((v) => {
          total += v;
        });

        if (multiply) {
          total *= mod;
        } else if (mod) {
          total += mod;
        }
      }

      return total;
    };

    /**
     * Parse a die notation string, roll the individual dice, and return the total
     * accounting for any modifiers.
     * @param {int} diceString - A die notation string ie "1d20+5".
     * @param {function} randFn - A function that returns a pseudorandom float between 0 and 1.
     * @return {object} An object containing the results of the invididual die rolls and the
     * total of the modified sum.
     */
    var roll = (diceString, randFn = Math.random) => {
      const {
        count, sides, mod, multiply, dropLow, success,
      } = parseDieNotation(diceString);
      const results = [];

      for (let i = 0; i < count; i += 1) {
        const currentResult = rollDie(sides, randFn);
        results.push(currentResult);
      }

      return {
        results,
        total: getTotal(results, {
          mod, multiply, dropLow, success,
        }),
      };
    };

    var index = {
      parseDieNotation,
      rollDie,
      roll,
    };

    /**
     * Helper methods for randomly selecting items.
     * Will incorporate some rules from Alien's generators.
     */

    const countUnique = arr => {
        return arr.reduce((acc, val, ind, array) => {
           if(array.lastIndexOf(val) === ind){
              return ++acc
           }
           return acc
        }, 0)
    };

    /**
     * Go through an array of objects and return the first item whose key=value matches.
     */
    const findArrayItemByProperty = (arr, key, value) => arr.find(obj => obj[key] === value);

    /**
     * From https://blog.abelotech.com/posts/number-currency-formatting-javascript/
     * @param {number} num E.g. 10000
     * @returns {string} E.g. 10,000
     */
    const formatNumber = (num) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

    const random2D6ArrayItem = (arr, mod = 0) => {
    	return rollArrayItem(arr, '2d6', mod)
    };

    const random3D6ArrayItem = (arr, mod = 0) => {
    	return rollArrayItem(arr, '3d6', mod)
    };

    const randomArrayItem = (arr) => {
    	const idx = Math.floor(Math.random() * arr.length);
    	return arr[idx]
    };

    const randomD6ArrayItem = (arr, mod = 0) => {
    	return rollArrayItem(arr, 'd6', mod)
    };

    // The mod changes the tens die, not the total.
    const randomD66ArrayItem = (arr, tensMod = 0) => {
    	const total = rollD66(tensMod);
    	// console.debug(`randomD66ArrayItem tensMod=${tensMod}, total=${total}`)
    	for (const item of arr) {
    		if (total <= item['d66']) {
    			return item
    		}
    	}
    	throw `Couldn't find a random d66 item for length ${arr.length} array.`
    };

    /**
     * Generate a random int between min and max, inclusive.
     */
    const randomInteger = (min, max) => {
    	return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /**
     * Will keep rolling until it finds one not already in existing.
     */
    const randomUniqueD66Item = (d66Data, existing) => {
        let item = null;
        let foundNewItem = false;
        while (!foundNewItem) {
            item = randomD66ArrayItem(d66Data);
            foundNewItem = !existing.includes(item);
        }
        return item
    };

    /**
     * Interface with dice utils function.
     * @param {*} rollString E.g. '2d6'
     * @returns {number} The total of the roll. e.g. 10.
     */
    const roll$1 = (rollString) => {
    	try {
    		return index.roll(rollString).total
    	} catch (err) {
    		throw new Error(`roll fail, rollString=${rollString}, err=${err}`)
    	}
    };

    const rollArrayItem = (arr, diceString, mod = 0) => {
    	let num = index.roll(diceString + ' ' + mod).total; // e.g. 2d6 -2
    	// console.log(`rollArrayItem, mod=${mod}, total=${num}`)
    	for (const item of arr) {
    		if (num <= item[diceString]) {
    			return item
    		}
    	}
    	throw `Couldn't find a random ${diceString} item for length ${arr.length} array.`
    };

    /**
     * Simulate a "D66" roll, with an optional modifier to tensMod.
     */
    const rollD66 = (tensMod = 0) => {
    	let tensDie = index.roll('d6').total + tensMod;
    	tensDie = tensDie < 1 ? 1 : tensDie; // minimum 1.
    	tensDie = tensDie > 6 ? 6 : tensDie; // maximum 6.
    	
    	let onesDie = index.roll('d6').total;
    	
    	// Change into a d66 number, by adding tens and ones together, then turning into a number.
    	return parseInt('' + tensDie + onesDie, 10)
    };

    /**
     * For an object with number (rollString) and modifiers (including 'default'), generate the number.
     * TODO Should this just be in starSystem.js?
     */
    const rollNumberObjects = (object, modKey) => {
    	// Get the star type mode, else use 'default'
    	const mod = object.modifiers[modKey] ? object.modifiers[modKey] : object.modifiers['default'];
    	const rollString = '' + object.number + mod;
    	const rollResult = index.roll(rollString);
    	return rollResult.total < 0 ? 0 : rollResult.total
    };

    var utils = {
    	countUnique,
    	findArrayItemByProperty,
    	formatNumber,
    	random2D6ArrayItem,
    	random3D6ArrayItem,
    	randomArrayItem,
    	randomD6ArrayItem,
    	randomD66ArrayItem,
    	randomInteger,
    	randomUniqueD66Item,
    	roll: roll$1,
    	rollD66,
    	rollNumberObjects
    	// shuffleArray
    };

    const createStarSystem = (data, options = {}) => {
    	let results = {};

    	if (options.starLocation && options.starLocation !== 'ran') {
    		results.starLocation = utils.findArrayItemByProperty(data.starLocations, 'key', options.starLocation);
    	} else {
    		// TODO Make this an option the user can choose, instead of always rolling randomly.
    		results.starLocation = utils.randomArrayItem(data.starLocations);
    	}

    	// For frontier, pick random allegiance table for later.
    	if (results.starLocation.colonyAllegianceKeys) {
    		results.starLocation.colonyAllegianceKey = utils.randomArrayItem(results.starLocation.colonyAllegianceKeys);
    	}
    	
    	results.starType = getStarType(data);

    	// TODO What about "Spectral Class"?

    	createSystemObjects(data, results);

    	if (results.systemObjects.length === 0) {
    		throw new Error('Failed to generate any system objects.')
    	}
    	pickColonizedWorld(data, results);
    	generateWorlds(data, results);

    	// Sort the system objects by temperature, instead of randomly.
    	results.systemObjects.sort((a, b) => b.temperature.average - a.temperature.average);

    	return results
    };

    const getStarType = (data) => {
    	return utils.randomArrayItem(data.starTypes)
    };

    // Generate random amount of system objects for this system, based on the star type.
    const createSystemObjects = (data, results) => {
    	results['systemObjects'] = [];
    	let modKey = results['starType'].type; // will look up the modifier by this key, else use 'default'.
    	for (const systemObject of data.systemObjects) {
    		if (systemObject.enabled) {
    			let numberOfObjects = utils.rollNumberObjects(systemObject, modKey);
    			// console.log(`systemObject type=${systemObject.type}, numberOfObjects=${numberOfObjects}`)
    			for (let i = 0; i < numberOfObjects; i++) {
    				results['systemObjects'].push(createWorld(data, systemObject));
    			}
    		}
    	}
    };

    /**
     * The main data for a given planetary body.
     * TODO This is where a type system would come in handy. TS or Flow?
     * @param {*} systemObject starData.json system object info.
     */
    const createWorld = (data, systemObject) => {
    	// optional feature
    	let feature = systemObject.features ? utils.randomArrayItem(systemObject.features) : null;
    	
    	// TODO What about making systemObject a child of world? More consistent with other data? Or should we flatten the others instead?

    	let world = {
    		'key': systemObject.key, // used for future reference in starData.json.
    		'type': systemObject.type, // e.g. icePlanet
    		'feature': feature,
    		'habitable': systemObject.habitable,
    		'surveyable': systemObject.surveyable,
    		'isColonized': false, // will be set later for one lucky planetary body. Maybe more later.
    		'isSurveyed': systemObject.surveyable && (utils.randomInteger(0, 1) === 1), // 50/50 chance, will be updated later if isColonized
    		'planetSizeMod': systemObject.planetSizeMod,
    		'orbitalComponents': [], // moons, satellites, etc
    		'colonies': [] // fleshed out later
    	};

    	// If we're creating a gas giant "world", then we have to generate D6+4 moons that are actually terrestrial planets!
    	if (world.key === 'gasGiant') {
    		let numGasGiantMoons = utils.roll('d6+4'); // p.340
    		// console.debug(`Creating ${numGasGiantMoons} significant moons for gas giant world.`)
    		let moonData = JSON.parse(JSON.stringify(utils.findArrayItemByProperty(data.systemObjects, 'key', 'terrestrialPlanet')));
    		// Tweak the data for sizing this moon
    		// TODO Should this live in data?
    		moonData.type = 'Gas Giant Moon';
    		moonData.planetSizeMod = systemObject.moonSizeMod;
    		for (let i = 0; i < numGasGiantMoons; i++) {
    			let moon = createWorld(data, moonData);
    			moon.isMoon = true;
    			moon.isGasGiantMoon = true;
    			world.orbitalComponents.push(moon);
    		}
    	}
    	
    	return world
    };

    /**
     * E.g. LV-426.
     */
    const getSurveyedPlanetName = (data, usedPlanetNames) => {
    	let planetName = null;
    	let foundUniquePlanetName = false;
    	while (!foundUniquePlanetName) {
    		let iccCode = utils.randomArrayItem(data.iccCodes);
    		let planetCode = utils.randomInteger(111, 999);
    		planetName = iccCode + '-' + planetCode;
    		if (!usedPlanetNames.includes(planetName)) {
    			foundUniquePlanetName = true;
    			usedPlanetNames.push(planetName); // TODO should abdicate this logic up the chain, to avoid making data changes deep down.
    		}
    	}
    	return planetName
    };

    /**
     * For now, only one world in a system will be flaggged as colonized - the "main" world.
     * Also set its name, cause it's special.
     * 
     * Added support for gas giant moons.
     */
    const pickColonizedWorld = (data, results, usedPlanetNames) => {
    	let foundWorld = false;
    	while (!foundWorld) {
    		let world = utils.randomArrayItem(results.systemObjects);
    		if (world.key === 'gasGiant') {
    			world.isSurveyed = true;
    			// gas giants are special, they have habitable moons!
    			let moonWorld = utils.randomArrayItem(world.orbitalComponents);
    			colonizeWorld(data, moonWorld);
    			foundWorld = true;
    		} else if (world.habitable) {
    			// ice, terrestrial, asteroid belts, etc
    			colonizeWorld(data, world);
    			foundWorld = true;
    		}
    	}

    };

    const colonizeWorld = (data, world) => {
    	world.isColonized = true;
    	world.isSurveyed = true; // Can't colonize an unsurveyed planet :)
    	world.name = utils.randomArrayItem(data.planetaryNames);
    };

    /**
     * Set properties for ALL system objects. 
     * @param {object} data starData.json
     * @param {object} results Generated system objects etc.
     */
    const generateWorlds = (data, results) => {
    	let surveyedPlanetNames = [];
    	for (let world of results.systemObjects) {
    		// Clone the data to ensure uniqueness each time we generate world data.
    		generateWorld(JSON.parse(JSON.stringify(data)), results, world, surveyedPlanetNames);
    		if (world.key === 'gasGiant') {
    			for (let gasGiantMoon of world.orbitalComponents) {
    				generateWorld(JSON.parse(JSON.stringify(data)), results, gasGiantMoon, surveyedPlanetNames);
    			}
    		}
    	}
    };

    /**
     * The logic for world creation.
     * If the world has been marked as habitable, do a little extra.
     * @param {object} data starData.json
     * @param {object} world See createSystemObjects()
     */
    const generateWorld = (data, results, world, surveyedPlanetNames) => {

    	// Every world gets a name
    	world.name = world.isColonized ? 
    		utils.randomArrayItem(data.planetaryNames) : 
    		(world.isSurveyed ? getSurveyedPlanetName(data, surveyedPlanetNames) : null);

    	world.planetSize = utils.random2D6ArrayItem(data.planetSizes, world.planetSizeMod);
    	// console.debug('planetSize', world.planetSize)

    	// Atmosphere and temperature are driven by the object type (key).
    	switch (world.key) {
    		case 'gasGiant':
    			world.atmosphere = data.atmospheres[data.atmospheres.length -2]; // Infiltrating
    			world.temperature = utils.random2D6ArrayItem(data.temperatures, world.atmosphere.temperatureMod);
    			break
    		case 'icePlanet':
    			world.atmosphere = utils.random2D6ArrayItem(data.atmospheres, world.planetSize.atmosphereMod);
    			world.temperature = data.temperatures[0]; // Frozen
    			break
    		case 'asteroidBelt':
    			world.atmosphere = data.atmospheres[0]; // Thin
    			world.temperature = utils.random2D6ArrayItem(data.temperatures, world.atmosphere.temperatureMod);
    			break
    		case 'terrestrialPlanet':
    			world.atmosphere = utils.random2D6ArrayItem(data.atmospheres, world.planetSize.atmosphereMod);
    			world.temperature = utils.random2D6ArrayItem(data.temperatures, world.atmosphere.temperatureMod);
    			break
    		default:
    			throw new Error(`Unknown world key=${world.key}, aborting.`)
    	}

    	// Calculate average temp after all the atmo and temp fiddling.
    	world.temperature.average = utils.randomInteger(world.temperature.min, world.temperature.max);

    	if (world.habitable) {
    		// Geosphere mods use BOTH atmosphere and temperature mods. Tricky, hey?
    		const geoMod = world.atmosphere.geosphereMod + world.temperature.geosphereMod;
    		world.geosphere = utils.random2D6ArrayItem(data.geospheres, geoMod);

    		if (world.key === 'icePlanet') {
    			world.terrain = utils.random2D6ArrayItem(data.terrains[world.key]);
    		} else {
    			// TODO In future, would need for gas giants with planets
    			const terrainMod = world.geosphere[world.key] + world.temperature[world.key];
    			// console.debug(`terrain mods for ${world.key}, geosphere ${world.geosphere[world.key]} + temperature ${world.temperature[world.key]} = ${terrainMod}`)
    			world.terrain = utils.randomD66ArrayItem(data.terrains[world.key], terrainMod);
    		}
    	}

    	// Only populate worlds flagged as habitable.
    	if (world.isColonized) {
    	
    		// console.log(`Habitating world ${world.name}....`)

    		const numColonies = getNumColonies();
    		const colonySizeMod = world.planetSize.colonySizeMod + world.atmosphere.colonySizeMod;

    		for (let i = 0; i < numColonies; i++) {

    			let colony = {
    				name: `Colony ${i+1}`
    			};

    			const colonyAllegiance = utils.random3D6ArrayItem(data.colonyAllegiances);
    			colony.allegiance = colonyAllegiance[results.starLocation.colonyAllegianceKey];

    			// Clone colonySize data because we modify it.
    			colony.colonySize = JSON.parse(JSON.stringify(utils.random2D6ArrayItem(data.colonySizes, colonySizeMod)));
    			colony.colonySize.populationAmount = utils.roll(colony.colonySize.population);
    			// Missions data can be either a number (as string) or a rollString.
    			// console.debug(`missions=${colony.colonySize.missions}`)
    			if (colony.colonySize.missions.toLowerCase().includes('d')) {
    				colony.colonySize.missionsAmount = utils.roll(colony.colonySize.missions);
    			} else {
    				colony.colonySize.missionsAmount = parseInt(colony.colonySize.missions);
    			}

    			// Generate unique missions
    			colony.missions = [];
    			const colonyMissionMod = world.atmosphere.colonyMissionMod + colony.colonySize.colonyMissionMod;
    			let usedMissionTypes = [];
    			for (let i = 0; i < colony.colonySize.missionsAmount; i++) {
    				let newMission = '';
    				let foundUniqueMission = false;
    				while (!foundUniqueMission) {
    					newMission = utils.random2D6ArrayItem(data.colonyMissions, colonyMissionMod);
    					foundUniqueMission = !usedMissionTypes.includes(newMission.type);
    				}
    				usedMissionTypes.push(newMission.type);
    				colony.missions.push(newMission);
    			}

    			if (!world.isGasGiantMoon) { 
    				// Generate orbital components around the planet for this colony.
    				// Don't generate moons for moons :) (gas giants)
    				// Clone the item from the data.
    				let orbitalComponent = JSON.parse(JSON.stringify(utils.random2D6ArrayItem(data.orbitalComponents, colony.colonySize.orbitalComponenMod)));
    				if (orbitalComponent.multiRoll) {
    					const maxComponents = utils.roll(orbitalComponent.multiRoll);
    					for (let i = 0; i < maxComponents; i++) {
    						let anotherOrbitalComponent = JSON.parse(JSON.stringify(utils.random2D6ArrayItem(data.orbitalComponents, colony.colonySize.orbitalComponenMod)));
    						if (anotherOrbitalComponent.multiRoll) {
    							// Skip this one, get another.
    							i--;
    						} else {
    							anotherOrbitalComponent.owner = colony.name;
    							applyQuantityToType(anotherOrbitalComponent);
    							world.orbitalComponents.push(anotherOrbitalComponent);
    						}
    					}
    				} else {
    					// Just the 1
    					orbitalComponent.owner = colony.name;
    					applyQuantityToType(orbitalComponent);
    					world.orbitalComponents.push(orbitalComponent);
    				}
    			}

    			// Generate factions for this colony.
    			const factionOptions = JSON.parse(JSON.stringify(utils.randomD6ArrayItem(data.factionOptions)));
    			if (factionOptions.quantity) {
    				const numFactions = utils.roll(factionOptions.quantity);
    				for (let i = 0; i < numFactions; i++) {
    					factionOptions.factions.push({
    						strength: utils.roll('d6') // Alien RPG p337
    					});
    				}
    			}
    			colony.factions = factionOptions.factions;
    			
    			// TODO Generate allegiance (I assume they should be unique for 2 colony setup)

    			world.colonies.push(colony);
    		} 

    		// Generate scenario hook.
    		world.scenarioHook = utils.randomD66ArrayItem(data.scenarioHooks);

    	} else {
    		
    		// Not colonised stuff
    		
    		// Moons
    		if (world.key === 'gasGiant') ; else {
    			let moonComponent = {"type":  "Moons", "quantity": "d3-1", "isMoon": true};
    			applyQuantityToType(moonComponent);
    			world.orbitalComponents.push(moonComponent);
    		}

    	}

    };

    const applyQuantityToType = (obj) => {
    	if (obj.quantity) {
    		obj.quantityAmount = utils.roll(obj.quantity); // set the number for future reference
    		obj.type =  obj.quantityAmount + ' ' + obj.type;
    	}
    };

    /**
     * Roll 2D6, with 10 indicating two competing colonies on the same world.
     */
    const getNumColonies = () => utils.roll('2d6') >= 10 ? 2 : 1;

    var starSystems = { 
    	createStarSystem
    };

    const spaceIndent = '  ';

    // For CLI based results.
    const printStarSystem = (results, options = {}) => {
    	let tabs = spaceIndent;
    	return `Star System:
${tabs}Location: ${results.starLocation.name} (${results.starLocation.colonyAllegianceKey})
${tabs}Type:     ${results.starType.type}, ${results.starType.brightness}: ${results.starType.description}
Planetary Bodies (${results.systemObjects.length}):
${printSystemObjects(results.systemObjects, tabs, options)}
`
    };

    const printSystemObjects = (systemObjects, tabs, options) => {
    	let out = [];
    	for (const [i, world] of systemObjects.entries()) {
    		out.push(printWorldTitle(`#${i+1}`, world, tabs));
    		// Workaround for gas giant moons
    		if (world.isColonized || hasColonizedMoon(world) || (world.isSurveyed && options.showSurveyedDetails)) {
    			out.push(printWorldDetails(world, options, `${tabs}${spaceIndent}`));
    		}
        }
    	return out.join('\n')
    };

    /**
     * Helper for gas giant moons.
     */
    const hasColonizedMoon = (world) => {
    	if (world.key !== 'gasGiant') { return false }
    	for (let moon of world.orbitalComponents) {
    		if (moon.isColonized) { 
    			return true
    		}
    	}
    	return false
    };

    const printWorldTitle = (prefix, world, tabs) => {
    	let out = [`${tabs}${(''+(prefix)).padStart(2, 0)}: `];
    	out.push(world.type);
    	out.push(world.name ? ' ' + `"${world.name}"`: ' (Unsurveyed)');
    	out.push(world.feature ? ', ' + world.feature : '');
    	out.push(world.isColonized ? ', ' + world.geosphere.type : '');
    	out.push(printMoonSummary(world));
    	return out.join('')
    };

    const printMoonSummary = (world) => {
    	let moonCount = 0;
    	for (const orbitalComponent of world.orbitalComponents) {
    		if (orbitalComponent.isMoon) {
    			// Default 1 for gas giant moons
    			moonCount = moonCount + (orbitalComponent.quantityAmount || 1);
    		}
    	}
    	if (moonCount == 0) { return '' }
    	if (moonCount == 1) { return `, ${moonCount} moon` }
    	return `, ${moonCount} moons`
    };

    /**
     * Handle all world types: habitable, colonised.
     */
    const printWorldDetails = (world, options, tabs) => {
    	const spaces = '     ';
    	let out = [];
    	
    	// console.debug(`printWorldDetails, world=${world.habitable}, name=${world.name}`)

    	out.push(`${tabs}Planet Size:  ${utils.formatNumber(world.planetSize.sizeKm)} km, ${world.planetSize.surfaceGravity} G${world.planetSize.examples ? ' (e.g. ' + world.planetSize.examples + ')' : '' }`);
    	out.push(`${tabs}Atmosphere:   ${world.atmosphere.type}`);
    	out.push(`${tabs}Temperature:  ${world.temperature.type}, ${world.temperature.average}°C average (e.g. ${world.temperature.description})`);
    	if (world.habitable) {
    		out.push(`${tabs}Geosphere:    ${world.geosphere.type}, ${world.geosphere.description}`);
    		out.push(`${tabs}Terrain:      ${world.terrain.description}`);
    	}

    	if (world.orbitalComponents.length > 0) {
    		if (world.isColonized || hasColonizedMoon(world)) {
    			out.push(printOrbitalComponents(world, options, tabs, spaces));
    		}
    	}

    	if (world.isColonized) {
    		out.push(`${tabs}Hook:         ${world.scenarioHook.description}`);
    		out.push(printColonyDetails(world, tabs));
    	}

        return out.join(`\n`)
    };

    const printColonyDetails = (world, tabs) => {
    	const spaces = '   ';
    	let out = [];
    	let nestedTabs = tabs + spaceIndent;
    	for (const [i, colony] of world.colonies.entries()) {
            out.push(`${tabs}Colony #${i+1}:`);
    		out.push(`${nestedTabs}Allegiance: ${colony.allegiance}`);
    		out.push(`${nestedTabs}Size:       ${colony.colonySize.size}, ${utils.formatNumber(colony.colonySize.populationAmount)} pax`);
    		out.push(printColonyMissions(colony.missions, nestedTabs, spaces));
    		out.push(printColonyFactions(colony.factions, nestedTabs, spaces));
    	}
    	return out.join('\n')
    };

    const printColonyMissions = (missions, tabs, spaces) => {
    	let out = [];
    	for (const [i, mission] of missions.entries()) {
    		out.push(`${mission.type}`);
    	}
    	return `${tabs}Missions:${spaces}` + out.join(', ')
    };

    const printOrbitalComponents = (world, options, tabs, spaces) => {
    	let out = [];
    	if (world.key === 'gasGiant') {
    		for (const [i, moonWorld] of world.orbitalComponents.entries()) {
    			// Recursive
    			out.push('\n');
    			out.push(printWorldTitle(`Moon #${i+1}`, moonWorld, tabs+spaceIndent));
    			if (moonWorld.isColonized || (moonWorld.isSurveyed && options.showSurveyedDetails)) {
    				out.push('\n');
    				out.push(printWorldDetails(moonWorld, options, tabs+spaceIndent+spaceIndent));
    			}
    		}
    		return `${tabs}Orbitals:` + out.join('')
    	} else if (world.orbitalComponents.length > 0) {
    		for (const orbitalComponent of world.orbitalComponents) {
    			out.push(`${orbitalComponent.type}${orbitalComponent.owner ? ' (' + orbitalComponent.owner + ')' : ''}`);
    		}
    		return `${tabs}Orbitals:${spaces}` + out.join(', ')
    	} else {
    		return ''
    	}
    };

    const strengthMap = ["weak", "balanced", "balanced", "competing", "competing", "dominant"]; // d6 roll
    const printColonyFactions = (factions, tabs, spaces) => {
    	
    	let factionOutputs = {
    		'weak': 0,
    		'balanced': 0,
    		'competing': 0,
    		'dominant': 0
    	};

    	for (const faction of factions) {
    		factionOutputs[strengthMap[faction.strength-1]]++;
    	}

    	let out = [];
    	for (const [strength, qty] of Object.entries(factionOutputs)) {
    		if (qty > 0) {
    			out.push(`${qty} ${strength}`);
    		}
    	}

    	return `${tabs}Factions:${spaces}` + out.join(', ')
    };

    var starSystemPrinter = { 
        printStarSystem
    };

    /* src\components\Options.svelte generated by Svelte v3.24.1 */
    const file$1 = "src\\components\\Options.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (38:16) {#each starLocations as item}
    function create_each_block(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*item*/ ctx[9].name + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "radio");
    			input.__value = input_value_value = /*item*/ ctx[9].key;
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[7][0].push(input);
    			add_location(input, file$1, 40, 24, 1551);
    			add_location(label, file$1, 38, 20, 1386);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = input.__value === /*options*/ ctx[0].starLocation;
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "click", /*saveOptions*/ ctx[3], false, false, false),
    					listen_dev(input, "change", /*input_change_handler_1*/ ctx[6])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 1) {
    				input.checked = input.__value === /*options*/ ctx[0].starLocation;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[7][0].splice(/*$$binding_groups*/ ctx[7][0].indexOf(input), 1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(38:16) {#each starLocations as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div4;
    	let form;
    	let fieldset;
    	let legend;
    	let t1;
    	let div0;
    	let t3;
    	let div1;
    	let label;
    	let input;
    	let t4;
    	let t5;
    	let div2;
    	let t7;
    	let div3;
    	let mounted;
    	let dispose;
    	let each_value = /*starLocations*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			form = element("form");
    			fieldset = element("fieldset");
    			legend = element("legend");
    			legend.textContent = "Star System Options";
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "Output Options";
    			t3 = space();
    			div1 = element("div");
    			label = element("label");
    			input = element("input");
    			t4 = text(" Show surveyed details");
    			t5 = space();
    			div2 = element("div");
    			div2.textContent = "Star System Location";
    			t7 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(legend, file$1, 26, 12, 883);
    			attr_dev(div0, "class", "subTitle svelte-1hhmr6j");
    			add_location(div0, file$1, 28, 12, 947);
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$1, 31, 20, 1055);
    			add_location(label, file$1, 30, 16, 1026);
    			add_location(div1, file$1, 29, 12, 1003);
    			attr_dev(div2, "class", "subTitle svelte-1hhmr6j");
    			add_location(div2, file$1, 35, 12, 1250);
    			add_location(div3, file$1, 36, 12, 1312);
    			add_location(fieldset, file$1, 25, 8, 859);
    			add_location(form, file$1, 24, 4, 843);

    			set_style(div4, "display", /*options*/ ctx[0].showOptions === false
    			? "none"
    			: "block");

    			add_location(div4, file$1, 23, 0, 764);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, form);
    			append_dev(form, fieldset);
    			append_dev(fieldset, legend);
    			append_dev(fieldset, t1);
    			append_dev(fieldset, div0);
    			append_dev(fieldset, t3);
    			append_dev(fieldset, div1);
    			append_dev(div1, label);
    			append_dev(label, input);
    			input.checked = /*options*/ ctx[0].showSurveyedDetails;
    			append_dev(label, t4);
    			append_dev(fieldset, t5);
    			append_dev(fieldset, div2);
    			append_dev(fieldset, t7);
    			append_dev(fieldset, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "click", /*toggleHideUninhabited*/ ctx[2], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*options*/ 1) {
    				input.checked = /*options*/ ctx[0].showSurveyedDetails;
    			}

    			if (dirty & /*starLocations, options, saveOptions*/ 11) {
    				each_value = /*starLocations*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*options*/ 1) {
    				set_style(div4, "display", /*options*/ ctx[0].showOptions === false
    				? "none"
    				: "block");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { starData } = $$props;
    	let { options } = $$props; // See src/data/options.json
    	const dispatch = createEventDispatcher();

    	// Create a UI-only version of the data
    	let starLocations = JSON.parse(JSON.stringify(starData.starLocations));

    	starLocations.push({ "key": "ran", "name": "Random" });

    	function toggleHideUninhabited() {
    		$$invalidate(0, options.showSurveyedDetails = !options.showSurveyedDetails, options);
    		dispatch("saveOptions"); // no need to pass options up, it's the same object.
    	}

    	function saveOptions() {
    		// console.log('Options.svelte - saveOptions')
    		dispatch("saveOptions"); // no need to pass options up, it's the same object.
    	}

    	const writable_props = ["starData", "options"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Options> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Options", $$slots, []);
    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		options.showSurveyedDetails = this.checked;
    		$$invalidate(0, options);
    	}

    	function input_change_handler_1() {
    		options.starLocation = this.__value;
    		$$invalidate(0, options);
    	}

    	$$self.$$set = $$props => {
    		if ("starData" in $$props) $$invalidate(4, starData = $$props.starData);
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		starData,
    		options,
    		dispatch,
    		starLocations,
    		toggleHideUninhabited,
    		saveOptions
    	});

    	$$self.$inject_state = $$props => {
    		if ("starData" in $$props) $$invalidate(4, starData = $$props.starData);
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    		if ("starLocations" in $$props) $$invalidate(1, starLocations = $$props.starLocations);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		options,
    		starLocations,
    		toggleHideUninhabited,
    		saveOptions,
    		starData,
    		input_change_handler,
    		input_change_handler_1,
    		$$binding_groups
    	];
    }

    class Options extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { starData: 4, options: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Options",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*starData*/ ctx[4] === undefined && !("starData" in props)) {
    			console.warn("<Options> was created without expected prop 'starData'");
    		}

    		if (/*options*/ ctx[0] === undefined && !("options" in props)) {
    			console.warn("<Options> was created without expected prop 'options'");
    		}
    	}

    	get starData() {
    		throw new Error("<Options>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set starData(value) {
    		throw new Error("<Options>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Options>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Options>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\StarSystems.svelte generated by Svelte v3.24.1 */
    const file$2 = "src\\components\\StarSystems.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h40;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let options_1;
    	let t6;
    	let h41;
    	let t8;
    	let pre;
    	let t9;
    	let current;
    	let mounted;
    	let dispose;

    	options_1 = new Options({
    			props: { starData, options: /*options*/ ctx[0] },
    			$$inline: true
    		});

    	options_1.$on("saveOptions", /*saveOptions*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h40 = element("h4");
    			h40.textContent = "Star Systems";
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Star System";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "(Options)";
    			t5 = space();
    			create_component(options_1.$$.fragment);
    			t6 = space();
    			h41 = element("h4");
    			h41.textContent = "Results";
    			t8 = space();
    			pre = element("pre");
    			t9 = text(/*output*/ ctx[1]);
    			add_location(h40, file$2, 57, 1, 1458);
    			add_location(button0, file$2, 58, 1, 1481);
    			add_location(button1, file$2, 59, 1, 1565);
    			add_location(h41, file$2, 63, 1, 1701);
    			attr_dev(pre, "id", "results");
    			add_location(pre, file$2, 64, 1, 1719);
    			add_location(div, file$2, 55, 0, 1449);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h40);
    			append_dev(div, t1);
    			append_dev(div, button0);
    			append_dev(div, t3);
    			append_dev(div, button1);
    			append_dev(div, t5);
    			mount_component(options_1, div, null);
    			append_dev(div, t6);
    			append_dev(div, h41);
    			append_dev(div, t8);
    			append_dev(div, pre);
    			append_dev(pre, t9);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*saveOptions*/ ctx[4], false, false, false),
    					listen_dev(button0, "click", /*handleNewStarSystem*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*handleOptions*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const options_1_changes = {};
    			if (dirty & /*options*/ 1) options_1_changes.options = /*options*/ ctx[0];
    			options_1.$set(options_1_changes);
    			if (!current || dirty & /*output*/ 2) set_data_dev(t9, /*output*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(options_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(options_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(options_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { options } = $$props; // See src/data/options.json
    	let { results } = $$props; // Also saved to localStorage
    	let output = "Waiting on User."; // Reactive variable! Love Svelte v3 :)
    	const dispatch = createEventDispatcher();

    	function handleOptions() {
    		$$invalidate(0, options.showOptions = !options.showOptions, options);
    		saveOptions();
    	}

    	// Main action - user has clicked the button.
    	function handleNewStarSystem() {
    		$$invalidate(5, results.starSystem = starSystems.createStarSystem(starData, options), results);
    		$$invalidate(1, output = starSystemPrinter.printStarSystem(results.starSystem, options));
    		saveData();
    	}

    	function saveData() {
    		saveOptions();
    		dispatch("saveData", { "key": "results", "value": results });
    	}

    	// Intermediate step - re-render output, and pass the save command up and out.
    	function saveOptions() {
    		printResults();
    		dispatch("saveData", { "key": "options", "value": options });
    	}

    	// Aware of initial load = no results.
    	function printResults() {
    		if (results && results.starSystem) {
    			$$invalidate(1, output = starSystemPrinter.printStarSystem(results.starSystem, options));
    		}
    	}

    	onMount(async () => {
    		printResults();
    	});

    	const writable_props = ["options", "results"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StarSystems> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("StarSystems", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    		if ("results" in $$props) $$invalidate(5, results = $$props.results);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		starData,
    		starSystems,
    		starSystemPrinter,
    		Options,
    		options,
    		results,
    		output,
    		dispatch,
    		handleOptions,
    		handleNewStarSystem,
    		saveData,
    		saveOptions,
    		printResults
    	});

    	$$self.$inject_state = $$props => {
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    		if ("results" in $$props) $$invalidate(5, results = $$props.results);
    		if ("output" in $$props) $$invalidate(1, output = $$props.output);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [options, output, handleOptions, handleNewStarSystem, saveOptions, results];
    }

    class StarSystems extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { options: 0, results: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StarSystems",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*options*/ ctx[0] === undefined && !("options" in props)) {
    			console.warn("<StarSystems> was created without expected prop 'options'");
    		}

    		if (/*results*/ ctx[5] === undefined && !("results" in props)) {
    			console.warn("<StarSystems> was created without expected prop 'results'");
    		}
    	}

    	get options() {
    		throw new Error("<StarSystems>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<StarSystems>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get results() {
    		throw new Error("<StarSystems>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set results(value) {
    		throw new Error("<StarSystems>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var jobTypes = [
    	{
    		d66: 12,
    		type: "Routine",
    		destination: "Within system",
    		complications: 0,
    		baseReward: "20+D6",
    		extraRewards: 0
    	},
    	{
    		d66: 15,
    		type: "Routine",
    		destination: "Within system",
    		complications: 1,
    		baseReward: "20+D6",
    		extraRewards: 0
    	},
    	{
    		d66: 23,
    		type: "Routine",
    		destination: "Within system",
    		complications: 1,
    		baseReward: "30+D6",
    		extraRewards: 0
    	},
    	{
    		d66: 25,
    		type: "Easy",
    		destination: "Within system",
    		complications: 0,
    		baseReward: "20+2D6",
    		extraRewards: 0
    	},
    	{
    		d66: 31,
    		type: "Easy",
    		destination: "Nearby system",
    		complications: 1,
    		baseReward: "20+2D6",
    		extraRewards: 1
    	},
    	{
    		d66: 33,
    		type: "Easy",
    		destination: "Nearby system",
    		complications: 1,
    		baseReward: "25+2D6",
    		extraRewards: 1
    	},
    	{
    		d66: 45,
    		type: "Normal",
    		destination: "Nearby system",
    		complications: 1,
    		baseReward: "30+3D6",
    		extraRewards: 0
    	},
    	{
    		d66: 51,
    		type: "Normal",
    		destination: "Nearby system",
    		complications: 1,
    		baseReward: "30+3D6",
    		extraRewards: 1
    	},
    	{
    		d66: 53,
    		type: "Normal",
    		destination: "Nearby system",
    		complications: 1,
    		baseReward: "40+3D6",
    		extraRewards: 1
    	},
    	{
    		d66: 54,
    		type: "Normal",
    		destination: "Faraway system",
    		complications: 1,
    		baseReward: "50+4D6",
    		extraRewards: 0
    	},
    	{
    		d66: 55,
    		type: "Normal",
    		destination: "Faraway system",
    		complications: 1,
    		baseReward: "50+4D6",
    		extraRewards: 1
    	},
    	{
    		d66: 61,
    		type: "Difficult",
    		destination: "Within system",
    		complications: 2,
    		baseReward: "60+4D6",
    		extraRewards: 1
    	},
    	{
    		d66: 63,
    		type: "Difficult",
    		destination: "Nearby system",
    		complications: 2,
    		baseReward: "50+4D6",
    		extraRewards: 0
    	},
    	{
    		d66: 64,
    		type: "Difficult",
    		destination: "Nearby system",
    		complications: 2,
    		baseReward: "50+4D6",
    		extraRewards: 1
    	},
    	{
    		d66: 65,
    		type: "Difficult",
    		destination: "Faraway system",
    		complications: 2,
    		baseReward: "50+5D6",
    		extraRewards: 1
    	},
    	{
    		d66: 66,
    		type: "Difficult",
    		destination: "Faraway system",
    		complications: 3,
    		baseReward: "50+5D6",
    		extraRewards: 2
    	}
    ];
    var plotTwists = [
    	{
    		d66: 15,
    		type: "Mayday",
    		description: "Before (or after) the starship is in hyperspace, the crew receive a distress signal and are obliged by law to assist. Alternatively, the call may come whilst on-planet."
    	},
    	{
    		d66: 22,
    		type: "Bad Intel",
    		description: "Key mission information will prove false or very misleading."
    	},
    	{
    		d66: 25,
    		type: "Sabotage",
    		description: "A serious malfunction or crisis (fire, etc.) quickly turns out to be sabotage, but who is the saboteur?"
    	},
    	{
    		d66: 35,
    		type: "Secret Plot",
    		description: "NPCs or PCs in the game have another agenda that runs counter to that of the players and they are busy working on it."
    	},
    	{
    		d66: 43,
    		type: "Murder",
    		description: "An NPC is suddenly murdered. Who did it? Why?"
    	},
    	{
    		d66: 46,
    		type: "Flare Event",
    		description: "A burst of stellar radiation reaches the PCs’ location from a red dwarf flare star, a distant neutron star or other phenomenon. This could cause power interruptions, or at the very least complete communications blackouts."
    	},
    	{
    		d66: 55,
    		type: "Malfunction",
    		description: "A key component to the mission fails when needed – an airlock or drive, a demolitions charge or diamond cutting drill. What now?"
    	},
    	{
    		d66: 64,
    		type: "Time Limit",
    		description: "The mission has a deadline; lives (perhaps their own) are depending on it."
    	},
    	{
    		d66: 66,
    		type: "Alien Outbreak",
    		description: "At the heart of this scenario is the presence of the Xenomorph XX121. It may be one egg or dozens; or the massacred remains of an unfortunate group of humans with a Xenomorph warrior still on the prowl. Good luck..."
    	}
    ];
    var spaceTruckers = {
    	employers: [
    		{
    			d66: 16,
    			type: "Colony Representative"
    		},
    		{
    			d66: 24,
    			type: "Colonial Administration"
    		},
    		{
    			d66: 35,
    			type: "Mining Company"
    		},
    		{
    			d66: 46,
    			type: "Major Corporation"
    		},
    		{
    			d66: 53,
    			type: "Military Officer"
    		},
    		{
    			d66: 56,
    			type: "Shipping Corporation"
    		},
    		{
    			d66: 63,
    			type: "Finance Bank"
    		},
    		{
    			d66: 66,
    			type: "Wealthy Individual"
    		}
    	],
    	rewards: [
    		{
    			d66: 13,
    			type: "Discount on new cargo",
    			isMonetaryReward: false
    		},
    		{
    			d66: 16,
    			type: "New, guaranteed contract",
    			isMonetaryReward: false
    		},
    		{
    			d66: 46,
    			type: "Monetary reward",
    			isMonetaryReward: true
    		},
    		{
    			d66: 53,
    			type: "Ship module/feature",
    			isMonetaryReward: false
    		},
    		{
    			d66: 56,
    			type: "Faction contact",
    			isMonetaryReward: false
    		},
    		{
    			d66: 66,
    			type: "Debt cancellation (or credit granted)",
    			isMonetaryReward: false
    		}
    	],
    	destinations: [
    		{
    			d66: 13,
    			description: "Only Coordinates Coordinates for an area in deep space."
    		},
    		{
    			d66: 16,
    			description: "Hostile Forest/Jungle/Desert Landing site is planet-side wilderness, far from human habitation, or on an uninhabited world."
    		},
    		{
    			d66: 26,
    			description: "Mine A mining facility, far from a colony or starport."
    		},
    		{
    			d66: 33,
    			description: "Spaceport Spaceport on an asteroid or moon, or a landing field near a larger settlement."
    		},
    		{
    			d66: 36,
    			description: "Asteroid/Moon The surface of an asteroid or a small moon. Vacuum or dangerous atmosphere."
    		},
    		{
    			d66: 43,
    			description: "Space Station An orbiting space station."
    		},
    		{
    			d66: 46,
    			description: "Earth The busy hub of all interstellar traffic and commerce."
    		},
    		{
    			d66: 53,
    			description: "Young Colony A small colony with only a few hundred inhabitants."
    		},
    		{
    			d66: 56,
    			description: "Established Colony A busy colony with several thousand people and a thriving, local industry."
    		},
    		{
    			d66: 63,
    			description: "Starship A starship in orbit, awaiting your arrival."
    		},
    		{
    			d66: 66,
    			description: "Outpost A small outpost, usually planetside. An outpost is commonly just a single complex with a specific function; corporate, military or scientific."
    		}
    	],
    	goods: [
    		{
    			d66: 12,
    			type: "Industrial gases",
    			description: "Propylene, acetylene, propane, ethyl-formate, chlorofluorocarbon, ammonia, carbon monoxide, ethylene oxide, hydrogen chloride, sulfur dioxide, sulfur hexafluoride."
    		},
    		{
    			d66: 14,
    			type: "Metal ingots or pellets",
    			description: "Gold, platinum, palladium, silver, tungsten, copper, iron, etc."
    		},
    		{
    			d66: 16,
    			type: "Colonists",
    			description: "Humans in stasis, ready to begin a colonization project"
    		},
    		{
    			d66: 21,
    			type: "Timber",
    			description: "Exotic alien tree products destined for Earth"
    		},
    		{
    			d66: 22,
    			type: "Ice/Water",
    			description: "Water, water ice or some other rare frozen solution"
    		},
    		{
    			d66: 23,
    			type: "Industrial chemicals",
    			description: "Aluminium Chloride, Aluminium Sulfate, Calcium Acetate, Monosodium Phosphate, Ferric Sulphate, Sodium Hydroxide, Hydrochloric Acid, Sodium Aluminate, Polyaluminium Chloride, Ferrous Chloride, Borate, Potassium Acetate etc."
    		},
    		{
    			d66: 24,
    			type: "Fertilizer",
    			description: "Multi-nutrient fertilizer compounds made up of nitrogen, potassium and/or phosphate"
    		},
    		{
    			d66: 26,
    			type: "Oil",
    			description: "Crude oil, or liquid petroleum by-products"
    		},
    		{
    			d66: 32,
    			type: "Foodstuff",
    			description: "Bulk foods such as chickpeas, soybeans and other legumes, grains (corn, barley, rice, wheat) or refined versions thereof"
    		},
    		{
    			d66: 36,
    			type: "Ore",
    			description: "Bauxite (aluminum), galena (lead), pentlandite (nickel), gold-quartz, cassiterite (tin), malachite (copper), magnetite (iron), platinum-bearing sand, trimonite (tungsten)"
    		},
    		{
    			d66: 41,
    			type: "Medicinal goods",
    			description: "Vaccines, medicines, disinfectants, surgical gear, scanning machines, hospital beds"
    		},
    		{
    			d66: 43,
    			type: "Technical parts",
    			description: "Different makes and types, for suits, refineries, vehicles, power stations, hospitals, prospecting gear, factories, atmospheric processors, weaponry or life support systems"
    		},
    		{
    			d66: 45,
    			type: "Starship technical parts",
    			description: "Modules, features, parts for/from dismantled ships"
    		},
    		{
    			d66: 46,
    			type: "Pressure suits",
    			description: "Space suits for delivery to the colonies"
    		},
    		{
    			d66: 51,
    			type: "Single oversized item",
    			description: "Wind turbines, power station generator, space station hull frame, solar panel assembly, drilling machinery, ore processing mill or furnace"
    		},
    		{
    			d66: 52,
    			type: "Vehicles",
    			description: "Diggers, tractors, quad-tracks, all-terrain vehicles, power loaders"
    		},
    		{
    			d66: 54,
    			type: "Weapons & armor",
    			description: "Firearms, ammunition and armor for the colonies or remote stations"
    		},
    		{
    			d66: 56,
    			type: "Radioactives",
    			description: "Processed uranium cakes or uranium dioxide powder, or fusion plant fuel pellets such as deuterium, tritium, protium or helium-3"
    		},
    		{
    			d66: 62,
    			type: "Colony construction",
    			description: "Beams, modules, airlocks, outer shells, roofing material, etc."
    		},
    		{
    			d66: 63,
    			type: "Animal feed",
    			description: "Feed concentrates containing grains, high-protein oil meals and byproducts of sugar beet and sugarcane processing"
    		},
    		{
    			d66: 65,
    			type: "Livestock/animals",
    			description: "Cattle in stasis, ready for rearing on an off-world colony"
    		},
    		{
    			d66: 66,
    			type: "Wreckage/Salvage",
    			description: "Shuttle, or escape/cargo pod requiring investigation and study"
    		}
    	],
    	complications: [
    		{
    			d66: 13,
    			type: "Embargo/Quarantine",
    			description: "The destination is placed under quarantine or an embargo."
    		},
    		{
    			d66: 16,
    			type: "Intermission",
    			description: "The ship’s computer brings the ship out of hyperspace early, and then wakes the crew. What’s the story?"
    		},
    		{
    			d66: 26,
    			type: "Military",
    			description: "A military starship sends over a small search party for a “routine” ICC and customs check. Should the PCs be worried?"
    		},
    		{
    			d66: 33,
    			type: "Delay",
    			description: "There is a delay in lift-off/undocking; perhaps fuel for the reaction drives or coolant cannot be pumped aboard. There may be a strike, an administrative hold-up or loading equipment may have broken down."
    		},
    		{
    			d66: 43,
    			type: "Maintenance",
    			description: "A critical part (drive pump, plasma coil, coolant pump, water recycler, gravity compensator control unit, sensor gimbal motor, etc.) requires replacement before it fails, requiring most of the crew’s participation."
    		},
    		{
    			d66: 53,
    			type: "Waiting game",
    			description: "Problems at the destination mean they aren’t ready to accept the cargo. Can the crew help speed things along?"
    		},
    		{
    			d66: 56,
    			type: "Cargo mishap",
    			description: "There is a serious problem with the cargo, either moving, leaking, over-heating or catching fire."
    		},
    		{
    			d66: 66,
    			type: "Wreckage",
    			description: "A small piece of wreckage is spotted on the sensor scope; a cargo container, escape pod, frozen corpse, part of a starship—smashed or blown off, etc."
    		}
    	]
    };
    var colonialMarines = {
    	rewards: [
    		{
    			d66: 13,
    			type: "Faction Contact",
    			isMonetaryReward: false
    		},
    		{
    			d66: 16,
    			type: "Ship Module",
    			isMonetaryReward: false
    		},
    		{
    			d66: 46,
    			type: "Monetary Reward",
    			isMonetaryReward: true
    		},
    		{
    			d66: 53,
    			type: "New Gear",
    			isMonetaryReward: false
    		},
    		{
    			d66: 56,
    			type: "New Weapon",
    			isMonetaryReward: false
    		},
    		{
    			d66: 66,
    			type: "Bronze or Silver Star",
    			isMonetaryReward: false
    		}
    	],
    	missions: [
    		{
    			d66: 13,
    			type: "Recon",
    			description: "Scout a location, gather intelligence and then report back."
    		},
    		{
    			d66: 15,
    			type: "Assault",
    			description: "Attack and hold an objective by force."
    		},
    		{
    			d66: 21,
    			type: "Defense",
    			description: "Defend a location/person/group and repel any attack until relieved or until a set time."
    		},
    		{
    			d66: 23,
    			type: "Combat",
    			description: "Patrol Patrol an area, looking for signs of the enemy."
    		},
    		{
    			d66: 26,
    			type: "Sabotage",
    			description: "Infiltrate an enemy location and destroy a key asset (bridge, uplink tower, radar dish, etc.)"
    		},
    		{
    			d66: 32,
    			type: "Raid",
    			description: "Create chaos and destruction by attacking targets of opportunity behind enemy lines."
    		},
    		{
    			d66: 35,
    			type: "Search and Rescue",
    			description: "Search for a downed pilot, lost colonists, etc."
    		},
    		{
    			d66: 42,
    			type: "Peace-Keeping",
    			description: "Quell a riot and re-establishing order, or protect lines of communication and essential services until authority can be restored."
    		},
    		{
    			d66: 46,
    			type: "Bug Hunt",
    			description: "Exterminate local alien life that is threatening colonists on an off-world planet."
    		},
    		{
    			d66: 52,
    			type: "Civil Evacuation",
    			description: "A colonial or space station population needs immediate rescue from a crisis or natural catastrophe."
    		},
    		{
    			d66: 54,
    			type: "Space Assault",
    			description: "A space station, orbital platform or starship must be captured (or recaptured) by boarding it and seizing control."
    		},
    		{
    			d66: 55,
    			type: "Space Traffic Security",
    			description: "The marines are aboard a military vessel that makes customs and security checks on civilian ships in the area, looking for illegal drugs or other goods, arms, workers being trafficked etc."
    		},
    		{
    			d66: 62,
    			type: "Snatch and Grab",
    			description: "Locate and seize an item, person or group from behind enemy lines. It may be hostages, POWs, an enemy commander or a piece of high technology."
    		},
    		{
    			d66: 66,
    			type: "Investigation",
    			description: "A station, colony or installation is not responding to Network communications. Investigate."
    		}
    	],
    	objectives: [
    		{
    			d66: 23,
    			type: "Colony",
    			description: "Either an established or young colony."
    		},
    		{
    			d66: 26,
    			type: "Isolated Outpost",
    			description: "A research station or remote military outpost."
    		},
    		{
    			d66: 32,
    			type: "Starship in Orbit",
    			description: "An enemy ship, or perhaps an abandoned ship."
    		},
    		{
    			d66: 34,
    			type: "Orbital Space Station",
    			description: "A transfer station, space colony or orbital survey platform."
    		},
    		{
    			d66: 36,
    			type: "Wilderness Location",
    			description: "Far from civilization, a remote spot on a planetary surface."
    		},
    		{
    			d66: 43,
    			type: "Planetary War Zone",
    			description: "An active war zone, fought between colonies, corporations or nation states, with ruined buildings, wrecked vehicles and fortifications."
    		},
    		{
    			d66: 46,
    			type: "Isolated Spaceport",
    			description: "A landing field far from any colony, owned by a corporation, individual or military."
    		},
    		{
    			d66: 52,
    			type: "Scattered Homesteads",
    			description: "Colonial farmsteads, far from civilization and scattered across the planetary surface."
    		},
    		{
    			d66: 55,
    			type: "Mine and Refinery",
    			description: "A huge mining and refining complex, with hundreds of workers and executives."
    		},
    		{
    			d66: 61,
    			type: "Prison Complex",
    			description: "Remote penal colony, housing hardened and violent inmates."
    		},
    		{
    			d66: 63,
    			type: "Radar/Sensor Site",
    			description: "An automated sensor site, perhaps with its own defenses."
    		},
    		{
    			d66: 66,
    			type: "Impenetrable Area",
    			description: "Harsh, inhospitable wilderness such as thick jungle, deep caverns or volcanic lava fields."
    		}
    	],
    	complications: [
    		{
    			d66: 12,
    			type: "Role Reversal",
    			description: "The marines find out that the bad guys are actually good guys."
    		},
    		{
    			d66: 15,
    			type: "Passengers",
    			description: "During the mission, the marines may find themselves saddled with enemy prisoners or innocent civilians that they must now guard/protect."
    		},
    		{
    			d66: 16,
    			type: "Observer",
    			description: "The team is saddled with a reporter/cameraman or a senior officer who gets in the way and asks stupid questions."
    		},
    		{
    			d66: 23,
    			type: "Company Meddling",
    			description: "A corporate representative joins the team and is there to ensure the company’s assets and interests are protected."
    		},
    		{
    			d66: 25,
    			type: "Civilian Advisor",
    			description: "Technical knowledge or on-site advice is provided by a civilian advisor who has little knowledge of military operations. They may get scared or panic easily."
    		},
    		{
    			d66: 32,
    			type: "Captured",
    			description: "An NPC or even a PC is captured by hostile forces."
    		},
    		{
    			d66: 36,
    			type: "Gear Problems",
    			description: "The team has faulty gear. It could be anything from ammo or weapons to sensors or vehicles."
    		},
    		{
    			d66: 44,
    			type: "Tough Resistance",
    			description: "The opponents are far tougher and more ruthless than expected."
    		},
    		{
    			d66: 46,
    			type: "Trapped",
    			description: "During the mission, the team discovers that it is completely trapped, either physically, or tactically."
    		},
    		{
    			d66: 53,
    			type: "Under Fire!",
    			description: "The mission location is hit by an air-strike, mines, or heavy weapons, possibly the result of a mishap by their own forces!"
    		},
    		{
    			d66: 55,
    			type: "Glory Hound",
    			description: "A new commanding office, a lieutenant, is keen to get himself a medal or commendation, and pushes the marine squad into perilous situations. Someone is going to get killed!"
    		},
    		{
    			d66: 62,
    			type: "Traps",
    			description: "There are hidden dangers across the mission site, varying with the nature of the location. They may be mines, IEDs, predatory carnivorous plants or improvised booby traps."
    		},
    		{
    			d66: 64,
    			type: "Restrictions",
    			description: "There are tactical restrictions placed on the mission—how the squad acts, where it can go, what weapons it can use, etc."
    		},
    		{
    			d66: 66,
    			type: "Rookie",
    			description: "Commander A new platoon commander is a green, untested and untried lieutenant. He’s read the books, survived the training and ran the simulations—but he’ll go to pieces once the bullets start flying."
    		}
    	]
    };
    var explorers = {
    	sponsors: [
    		{
    			d66: 16,
    			type: "Colonial Administration"
    		},
    		{
    			d66: 26,
    			type: "Scientist"
    		},
    		{
    			d66: 36,
    			type: "Group of Investors"
    		},
    		{
    			d66: 46,
    			type: "Corporate Representative"
    		},
    		{
    			d66: 56,
    			type: "Company Mining Rep"
    		},
    		{
    			d66: 66,
    			type: "Government Rep"
    		}
    	],
    	rewards: [
    		{
    			d66: 13,
    			type: "Funds for an expedition of their own",
    			isMonetaryReward: false
    		},
    		{
    			d66: 16,
    			type: "Ship module",
    			isMonetaryReward: false
    		},
    		{
    			d66: 46,
    			type: "Monetary reward",
    			isMonetaryReward: true
    		},
    		{
    			d66: 53,
    			type: "Contract with a mining company",
    			isMonetaryReward: false
    		},
    		{
    			d66: 56,
    			type: "Gear",
    			isMonetaryReward: false
    		},
    		{
    			d66: 66,
    			type: "Knowledge to use or sell",
    			isMonetaryReward: false
    		}
    	],
    	missions: [
    		{
    			d66: 16,
    			type: "Salvage",
    			description: "Locate an abandoned or destroyed ship, station or planetary facility. Recover items of value and avoid the wreck’s fate…"
    		},
    		{
    			d66: 24,
    			type: "Survey",
    			description: "Map a location or an area for the employer. Report back with sensor maps and other collected data."
    		},
    		{
    			d66: 32,
    			type: "Mining",
    			description: "Begin test-mining to determine the viability for later investors. The substance being recovered may be cobalt, gold, tungsten, oil, natural gas, lead or something else."
    		},
    		{
    			d66: 36,
    			type: "Colony Assistance",
    			description: "Assist a start-up colony with gear, information or expert knowledge about surface exploration, medicine, prospecting, construction or something else."
    		},
    		{
    			d66: 45,
    			type: "Prospecting",
    			description: "Command a prospecting expedition or secure a claim somewhere. It could be mining, asteroid harvesting, logging or gas trawling."
    		},
    		{
    			d66: 52,
    			type: "Data Collection",
    			description: "Find a specific piece of information for the employer. Sometimes, the group does not know the intended use of the information."
    		},
    		{
    			d66: 55,
    			type: "Courier Make",
    			description: "sure sensitive information, resources or goods are delivered safely from the employer to the receiver—without delay."
    		},
    		{
    			d66: 62,
    			type: "Anomaly Exploration",
    			description: "A unique phenomenon requires speedy investigation—is it a threat, or something that can be exploited for profit? It may be a wormhole, gravity lens, powerful radiation emission or other anomaly."
    		},
    		{
    			d66: 66,
    			type: "Rescue Expedition",
    			description: "Rescue a group, colony, survey expedition or correspondents from an attack or some other peril. Often, the PCs will be unaware of the fate of the missing victims."
    		}
    	],
    	targetAreas: [
    		{
    			d66: 14,
    			type: "Abandoned Orbital Station",
    			description: "Forgotten, abandoned, barely operational."
    		},
    		{
    			d66: 21,
    			type: "Rogue Asteroid",
    			description: "A fast-moving interstellar asteroid or planet passing through a star system."
    		},
    		{
    			d66: 24,
    			type: "Abandoned Mine",
    			description: "A failed mining project with tunnels and buildings, now abandoned and decaying."
    		},
    		{
    			d66: 31,
    			type: "Moon",
    			description: "The rocky moon of a gas giant or planet."
    		},
    		{
    			d66: 35,
    			type: "Asteroid Belt",
    			description: "An asteroid that sits deep within a dense asteroid belt."
    		},
    		{
    			d66: 36,
    			type: "Colonized World",
    			description: "The target area sits in wilderness on a world that already contains colonists."
    		},
    		{
    			d66: 43,
    			type: "Terrestrial Planet",
    			description: "The target area sits on an uninhabited terrestrial planet."
    		},
    		{
    			d66: 44,
    			type: "Abandoned Colony",
    			description: "A failed colony with buildings and structures abandoned and decaying."
    		},
    		{
    			d66: 51,
    			type: "Ice Planet",
    			description: "The target area sits on an uninhabited ice planet."
    		},
    		{
    			d66: 63,
    			type: "Wreckage",
    			description: "The smashed wreckage of a spacecraft, roll again for its current location."
    		},
    		{
    			d66: 66,
    			type: "Comet",
    			description: "A comet heading close to the system’s star, that contains valuable chemical compounds and raw materials."
    		}
    	],
    	complications: [
    		{
    			d66: 21,
    			type: "Natural Phenomenon",
    			description: "Some severe natural event occurs during the mission: a rapid temperature change, forest fire, hurricane, tsunami, earthquake, mudslide, etc."
    		},
    		{
    			d66: 32,
    			type: "Survey Blues",
    			description: "The target area is either difficult to locate, or difficult to survey safely or efficiently."
    		},
    		{
    			d66: 35,
    			type: "Presumed Missing",
    			description: "If the PCs gained a permit to survey their target area, they may or may not realize it is inherited from a previous expedition that vanished without a trace."
    		},
    		{
    			d66: 44,
    			type: "Rival Expedition",
    			description: "A competing party has the same goal as the expedition and tries to get there first or stop the PCs. They have roughly the same gear as the PCs."
    		},
    		{
    			d66: 52,
    			type: "Quarantine",
    			description: "The target area is under quarantine or off-limits, possibly for reasons unknown. The expedition has no permit and will be breaking the law if they choose to proceed."
    		},
    		{
    			d66: 62,
    			type: "Deadly Treasure",
    			description: "Some terrible object(s) exist in the target area, unbeknownst to the PCs. This deadly find may be nuclear waste, a dump of biological weapons, a nest of Xenomorph eggs or something equally horrific and life-threatening!"
    		},
    		{
    			d66: 66,
    			type: "Surveillance",
    			description: "The expedition is under surveillance by the military, government or some other party. They will not intervene, although they may communicate their presence to the team. Why are they watching? What do they really want?"
    		}
    	]
    };
    var jobsData = {
    	jobTypes: jobTypes,
    	plotTwists: plotTwists,
    	spaceTruckers: spaceTruckers,
    	colonialMarines: colonialMarines,
    	explorers: explorers
    };

    const createCargoRunJob = (data, options = {}) => {
        let results = {
            jobName: 'Cargo Run',
            campaignType: 'spaceTruckers',
            jobType: getJobType(data),
            employer: utils.randomD66ArrayItem(data.spaceTruckers.employers),
            destination: utils.randomD66ArrayItem(data.spaceTruckers.destinations),
            goods: utils.randomD66ArrayItem(data.spaceTruckers.goods),
            complications: [],
            plotTwist: utils.randomD66ArrayItem(data.plotTwists),
            rewards: [],
            totalMonetaryReward: 0
        };
        
        // Calculate rewards
        for (let i = 0; i < results.jobType.extraRewards; i++) {
            results.rewards.push(utils.randomUniqueD66Item(data.spaceTruckers.rewards, results.rewards));
        }
        // Calc total reward amount
        results.totalMonetaryReward = calculateTotalMonetaryReward(results);

        addComplications(results, data.spaceTruckers.complications);

        return results
    };

    const createMilitaryMission = (data, options = {}) => {
        let results = {
            jobName: 'Military Mission',
            campaignType: 'colonialMarines',
            jobType: getJobType(data),
            mission: utils.randomD66ArrayItem(data.colonialMarines.missions),
            objective: utils.randomD66ArrayItem(data.colonialMarines.objectives),
            complications: [],
            plotTwist: utils.randomD66ArrayItem(data.plotTwists),
            rewards: [],
            totalMonetaryReward: 0
        };

        // Rewards
        for (let i = 0; i < results.jobType.extraRewards; i++) {
            results.rewards.push(utils.randomUniqueD66Item(data.colonialMarines.rewards, results.rewards));
        }
        // Calc total reward amount
        results.totalMonetaryReward = calculateTotalMonetaryReward(results);

        addComplications(results, data.colonialMarines.complications);

        return results
    };

    const createExpedition = (data, options = {}) => {
        let results = {
            jobName: 'Expedition',
            campaignType: 'explorers',
            jobType: getJobType(data),
            sponsor: utils.randomD66ArrayItem(data.explorers.sponsors),
            mission: utils.randomD66ArrayItem(data.explorers.missions),
            targetArea: utils.randomD66ArrayItem(data.explorers.targetAreas),
            complications: [],
            plotTwist: utils.randomD66ArrayItem(data.plotTwists),
            rewards: [],
            totalMonetaryReward: 0
        };

        // Calculate rewards
        for (let i = 0; i < results.jobType.extraRewards; i++) {
            results.rewards.push(utils.randomUniqueD66Item(data.explorers.rewards, results.rewards));
        }
        // Calc total reward amount
        results.totalMonetaryReward = calculateTotalMonetaryReward(results);

        addComplications(results, data.explorers.complications);

        return results
    };

    const getJobType = (data) => {
        let jobType = utils.randomD66ArrayItem(data.jobTypes);
        // Process baseReward
        jobType.baseRewardAmount = utils.roll(jobType.baseReward);
        return jobType
    };

    const calculateTotalMonetaryReward = (results) => {
        let total = 0;

        switch (results.campaignType) {
            case 'spaceTruckers':
            case 'explorers':
                total += results.jobType.baseRewardAmount;
                break
            case 'colonialMarines':
                total += 0; // No base reward by default for marines.
                break
            default:
                throw new Error(`Unknown campaignType=${results.campaignType}`)   
        }

        for (const extraReward of results.rewards) {
            if (extraReward.isMonetaryReward) {
                // TODO This is an assumption on my part, add another roll of the base amount.
                total += parseInt(utils.roll(results.jobType.baseReward), 10);
            }
        }

        return total
    };

    const addComplications = (results, complicationsData) => {
        for (let i = 0; i < results.jobType.complications; i++) {
            results.complications.push(utils.randomUniqueD66Item(complicationsData, results.complications));
        }
    };

    var jobs = {
        createCargoRunJob,
        createExpedition,
        createMilitaryMission
    };

    const printJob = (results, options = {}) => {
        let out = [];
        
        out.push(`Job Type:          ${results.jobType.type} ${results.jobName}`);
        out.push(`Destination:       ${results.jobType.destination}`);

        switch (results.campaignType) {
            case 'spaceTruckers':
                out.push(printCargoRun(results));
                break
            case 'colonialMarines':
                out.push(printMilitaryMission(results));
                break;
            case 'explorers':
                out.push(printExpedition(results));
                break;
            default:
                throw new Error(`Unknown campaignType=${results.campaignType}`)
        }

        if (results.complications.length > 0) {
            out.push(printComplications(results));
        }

        out.push(`Plot Twist:        ${results.plotTwist.type} (${results.plotTwist.description})`);

        if (results.totalMonetaryReward > 0) {
            out.push(`Monetary Reward:   ${results.totalMonetaryReward} UAD`);
        }
        out.push(`Extra Rewards:     ${printExtraRewards(results)}`);

        return out.join('\n')
    };

    const printCargoRun = (results, options) => {
        let out = [];

        out.push(`Employer:          ${results.employer.type}`);
        out.push(`Destination:       ${results.destination.description}`);
        out.push(`Goods:             ${results.goods.type} (${results.goods.description})`);

        return out.join('\n')
    };

    const printMilitaryMission = (results, options) => {
        let out = [];

        out.push(`Mission:           ${results.mission.type} (${results.mission.description})`);
        out.push(`Objective:         ${results.objective.type} (${results.objective.description})`);

        return out.join('\n')
    };

    const printExpedition = (results, options) => {
        let out = [];

        out.push(`Sponsor:           ${results.sponsor.type}`);
        out.push(`Mission:           ${results.mission.type} (${results.mission.description})`);
        out.push(`Target Area:       ${results.targetArea.type} (${results.targetArea.description})`);

        return out.join('\n')
    };

    const printExtraRewards = (results) => {
        let rewardsOut = [];

        if (results.rewards.length > 0) {
            for (const reward of results.rewards) { 
                if (!reward.isMonetaryReward) {
                    rewardsOut.push(reward.type); 
                }
            }
        }

        if (rewardsOut.length === 0) {
            rewardsOut.push('N/A'); 
        }

        return rewardsOut.join(', ')
    };

    const printComplications = (results) => {
        let out = [];

        for (const [i, complication] of results.complications.entries()) {
            out.push(`Complication #${i+1}:   ${complication.type} (${complication.description})`);
        }

        return out.join('\n')
    };

    var jobsPrinter = {
        printJob
    };

    /* src\components\Jobs.svelte generated by Svelte v3.24.1 */
    const file$3 = "src\\components\\Jobs.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let h40;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let button2;
    	let t7;
    	let h41;
    	let t9;
    	let pre;
    	let t10;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h40 = element("h4");
    			h40.textContent = "Jobs";
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Cargo";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Military";
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "Expedition";
    			t7 = space();
    			h41 = element("h4");
    			h41.textContent = "Results";
    			t9 = space();
    			pre = element("pre");
    			t10 = text(/*output*/ ctx[0]);
    			add_location(h40, file$3, 54, 1, 1376);
    			add_location(button0, file$3, 55, 1, 1391);
    			add_location(button1, file$3, 56, 1, 1459);
    			add_location(button2, file$3, 57, 1, 1537);
    			add_location(h41, file$3, 59, 1, 1614);
    			attr_dev(pre, "id", "results");
    			add_location(pre, file$3, 60, 1, 1632);
    			add_location(div, file$3, 53, 0, 1369);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h40);
    			append_dev(div, t1);
    			append_dev(div, button0);
    			append_dev(div, t3);
    			append_dev(div, button1);
    			append_dev(div, t5);
    			append_dev(div, button2);
    			append_dev(div, t7);
    			append_dev(div, h41);
    			append_dev(div, t9);
    			append_dev(div, pre);
    			append_dev(pre, t10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", prevent_default(/*handleNewCargoJob*/ ctx[1]), false, true, false),
    					listen_dev(button1, "click", prevent_default(/*handleNewMilitaryMission*/ ctx[2]), false, true, false),
    					listen_dev(button2, "click", prevent_default(/*handleNewExpedition*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*output*/ 1) set_data_dev(t10, /*output*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { options } = $$props; // See src/data/options.json
    	let { results } = $$props; // Also saved externally
    	let output = "Waiting on User."; // Reactive variable! Love Svelte v3 :)
    	const dispatch = createEventDispatcher();

    	function handleNewCargoJob() {
    		$$invalidate(4, results.job = jobs.createCargoRunJob(jobsData, options), results);
    		$$invalidate(0, output = jobsPrinter.printJob(results.job, options));
    		saveData();
    	}

    	function handleNewMilitaryMission() {
    		$$invalidate(4, results.job = jobs.createMilitaryMission(jobsData, options), results);
    		$$invalidate(0, output = jobsPrinter.printJob(results.job, options));
    		saveData();
    	}

    	function handleNewExpedition() {
    		$$invalidate(4, results.job = jobs.createExpedition(jobsData, options), results);
    		$$invalidate(0, output = jobsPrinter.printJob(results.job, options));
    		saveData();
    	}

    	// FIXME Change the name. saveResults -> saveData should be how this works.
    	function saveData() {
    		dispatch("saveData", { "key": "results", "value": results });
    	}

    	function printResults() {
    		// Existing session data.
    		if (results && results.job) {
    			$$invalidate(0, output = jobsPrinter.printJob(results.job, options));
    		}
    	}

    	onMount(async () => {
    		printResults();
    	});

    	const writable_props = ["options", "results"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Jobs> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Jobs", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("options" in $$props) $$invalidate(5, options = $$props.options);
    		if ("results" in $$props) $$invalidate(4, results = $$props.results);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		jobsData,
    		jobs,
    		jobsPrinter,
    		options,
    		results,
    		output,
    		dispatch,
    		handleNewCargoJob,
    		handleNewMilitaryMission,
    		handleNewExpedition,
    		saveData,
    		printResults
    	});

    	$$self.$inject_state = $$props => {
    		if ("options" in $$props) $$invalidate(5, options = $$props.options);
    		if ("results" in $$props) $$invalidate(4, results = $$props.results);
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		output,
    		handleNewCargoJob,
    		handleNewMilitaryMission,
    		handleNewExpedition,
    		results,
    		options
    	];
    }

    class Jobs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { options: 5, results: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Jobs",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*options*/ ctx[5] === undefined && !("options" in props)) {
    			console.warn("<Jobs> was created without expected prop 'options'");
    		}

    		if (/*results*/ ctx[4] === undefined && !("results" in props)) {
    			console.warn("<Jobs> was created without expected prop 'results'");
    		}
    	}

    	get options() {
    		throw new Error("<Jobs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Jobs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get results() {
    		throw new Error("<Jobs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set results(value) {
    		throw new Error("<Jobs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var starSystemEncounters = [
    	{
    		d66: 10,
    		type: null
    	},
    	{
    		d66: 11,
    		type: "Research Vessel"
    	},
    	{
    		d66: 12,
    		type: "Asteroid Drill Ship"
    	},
    	{
    		d66: 13,
    		type: "Small Survey Ship"
    	},
    	{
    		d66: 14,
    		type: "Colony Supply Vessel"
    	},
    	{
    		d66: 15,
    		type: "Military Recon Craft"
    	},
    	{
    		d66: 16,
    		type: "Private Executive Transport"
    	},
    	{
    		d66: 21,
    		type: "Hypersleep Transport"
    	},
    	{
    		d66: 22,
    		type: "Light Shuttle"
    	},
    	{
    		d66: 23,
    		type: "Bulk Freighter"
    	},
    	{
    		d66: 24,
    		type: "Liquefied Gas Transport"
    	},
    	{
    		d66: 25,
    		type: "Tugship Towing A Platform"
    	},
    	{
    		d66: 26,
    		type: "Bulk Freighter"
    	},
    	{
    		d66: 31,
    		type: "Container Ship"
    	},
    	{
    		d66: 32,
    		type: "Colony Supply Vessel"
    	},
    	{
    		d66: 33,
    		type: "Petroleum Carrier"
    	},
    	{
    		d66: 34,
    		type: "Salvage Ship"
    	},
    	{
    		d66: 35,
    		type: "Military Patrol Craft"
    	},
    	{
    		d66: 36,
    		type: "Emergency Response Vessel"
    	},
    	{
    		d66: 41,
    		type: "Military Missile Cruiser"
    	},
    	{
    		d66: 43,
    		type: "Heavy Shuttle"
    	},
    	{
    		d66: 44,
    		type: "Fast Courier Vessel"
    	},
    	{
    		d66: 45,
    		type: "Modular Cargo Transport"
    	},
    	{
    		d66: 46,
    		type: "Large Space-Station"
    	},
    	{
    		d66: 51,
    		type: "Light Tugship"
    	},
    	{
    		d66: 52,
    		type: "In-System Shuttle"
    	},
    	{
    		d66: 53,
    		type: "Container Ship"
    	},
    	{
    		d66: 54,
    		type: "Communications Relay Station"
    	},
    	{
    		d66: 55,
    		type: "Military Dropship In Orbit"
    	},
    	{
    		d66: 56,
    		type: "In-System Shuttle"
    	},
    	{
    		d66: 61,
    		type: "Customs Cutter"
    	},
    	{
    		d66: 62,
    		type: "In-System Shuttle"
    	},
    	{
    		d66: 63,
    		type: "Military Assault Ship"
    	},
    	{
    		d66: 64,
    		type: "Corporate Space-Station"
    	},
    	{
    		d66: 65,
    		type: "Private Security Cutter"
    	},
    	{
    		d66: 66,
    		type: "Mobile Construction Rig"
    	}
    ];
    var shipReactions = [
    	{
    		"2d6": 2,
    		type: "UNUSUAL. May be on an unusual trajectory, have the registration of a missing ship or simply refuse to respond to the PCs’ signals."
    	},
    	{
    		"2d6": 4,
    		type: "DISMISSIVE. If asked for information or assistance, the ship will decline."
    	},
    	{
    		"2d6": 8,
    		type: "RADIO SILENCE. Ignores the PCs’ ship, but polite if contacted."
    	},
    	{
    		"2d6": 10,
    		type: "FRIENDLY. May pass on information or advice, if relevant."
    	},
    	{
    		"2d6": 11,
    		type: "ASSISTANCE. May request information, or ask for assistance or a spare part etc."
    	},
    	{
    		"2d6": 12,
    		type: "FAMILIAR VESSEL. The ship is known to you, you may even know the crew."
    	}
    ];
    var surfaceEncounters = [
    	{
    		"3d6": 5,
    		uninhabited: "Temperature Swing",
    		colonized: "Temperature Swing",
    		description: "On a cold world, temperatures will drop dramatically; on a hot world they will rise."
    	},
    	{
    		"3d6": 7,
    		uninhabited: "Unstable Ground",
    		colonized: "Unstable Ground",
    		description: "Ice, soft sand, swamp or other tricky ground."
    	},
    	{
    		"3d6": 8,
    		uninhabited: "Diversion",
    		colonized: "Diversion",
    		description: "An escarpment, canyon or other feature forces the PCs in an undesirable direction for D6 hours."
    	},
    	{
    		"3d6": 9,
    		uninhabited: "Cross Ravine/River",
    		colonized: "Cross Ravine/River",
    		description: "A ravine or river can be negotiated with great care, but it takes D6 hours and some tense moments."
    	},
    	{
    		"3d6": 10,
    		uninhabited: "Rough Terrain",
    		colonized: "Rough Terrain",
    		description: "Rocky ground or thick vegetation slows travel to half speed for D6 hours."
    	},
    	{
    		"3d6": 11,
    		uninhabited: null,
    		colonized: null,
    		description: null
    	},
    	{
    		"3d6": 12,
    		uninhabited: null,
    		colonized: "Wildcatters",
    		description: "Prospectors in a single tractor."
    	},
    	{
    		"3d6": 13,
    		uninhabited: null,
    		colonized: "Mining Operation",
    		description: "Temporary drilling or mining operation."
    	},
    	{
    		"3d6": 14,
    		uninhabited: null,
    		colonized: "Lone Colonist",
    		description: "On foot or in a vehicle."
    	},
    	{
    		"3d6": 15,
    		uninhabited: null,
    		colonized: "Scientists",
    		description: "In a vehicle, studying some natural phenomenon, plant-life or geology."
    	},
    	{
    		"3d6": 16,
    		uninhabited: null,
    		colonized: "Abandoned Kit",
    		description: "Useless, valuable or wrecked…"
    	},
    	{
    		"3d6": 18,
    		uninhabited: null,
    		colonized: "Explorers",
    		description: "In a vehicle, mapping the local area and cataloging what they find."
    	}
    ];
    var colonyEncounters = [
    	{
    		d66: 11,
    		type: "Rowdy miners"
    	},
    	{
    		d66: 12,
    		type: "Technicians making repairs"
    	},
    	{
    		d66: 13,
    		type: "Exhausted workers arriving"
    	},
    	{
    		d66: 14,
    		type: "Workers preparing to leave"
    	},
    	{
    		d66: 15,
    		type: "Supplies being delivered"
    	},
    	{
    		d66: 16,
    		type: "Colony workers off-duty"
    	},
    	{
    		d66: 21,
    		type: "Family off-duty together"
    	},
    	{
    		d66: 22,
    		type: "Medical crisis "
    	},
    	{
    		d66: 23,
    		type: "Colony manager and deputy "
    	},
    	{
    		d66: 24,
    		type: "Loud argument "
    	},
    	{
    		d66: 25,
    		type: "Drunken revelers "
    	},
    	{
    		d66: 26,
    		type: "Kids playing "
    	},
    	{
    		d66: 31,
    		type: "Administrator making the rounds "
    	},
    	{
    		d66: 32,
    		type: "Marshal conducting an investigation "
    	},
    	{
    		d66: 33,
    		type: "Cocky shuttle pilot "
    	},
    	{
    		d66: 34,
    		type: "Unhappy off-world official "
    	},
    	{
    		d66: 35,
    		type: "Sly corporate representative "
    	},
    	{
    		d66: 36,
    		type: "Harassed chief engineer "
    	},
    	{
    		d66: 41,
    		type: "Scientists debating "
    	},
    	{
    		d66: 42,
    		type: "Drug deal in progress "
    	},
    	{
    		d66: 43,
    		type: "Overhear gossip "
    	},
    	{
    		d66: 44,
    		type: "Colonist threatening each other"
    	},
    	{
    		d66: 45,
    		type: "Corporate investigator"
    	},
    	{
    		d66: 46,
    		type: "Miners relaxing"
    	},
    	{
    		d66: 51,
    		type: "Colony damage needing repair"
    	},
    	{
    		d66: 52,
    		type: "Operations team having a discussion"
    	},
    	{
    		d66: 53,
    		type: "Computer engineers at work"
    	},
    	{
    		d66: 54,
    		type: "Unattended supplies"
    	},
    	{
    		d66: 55,
    		type: "Maintenance crew"
    	},
    	{
    		d66: 56,
    		type: "Marshal searching or arresting a suspect"
    	},
    	{
    		d66: 61,
    		type: "Visitors from another colony"
    	},
    	{
    		d66: 62,
    		type: "Security cordon"
    	},
    	{
    		d66: 63,
    		type: "Mysterious scientist"
    	},
    	{
    		d66: 64,
    		type: "Management meeting"
    	},
    	{
    		d66: 65,
    		type: "Helpful android"
    	},
    	{
    		d66: 66,
    		type: "Cleaning crew"
    	},
    	{
    		d66: 71,
    		type: "Starship crew off-duty"
    	},
    	{
    		d66: 72,
    		type: "Thugs"
    	},
    	{
    		d66: 73,
    		type: "Security patrol"
    	},
    	{
    		d66: 74,
    		type: "Colonial official with entourage"
    	},
    	{
    		d66: 75,
    		type: "Accident in progress"
    	},
    	{
    		d66: 76,
    		type: "Colonists on strike or protesting"
    	}
    ];
    var encountersData = {
    	starSystemEncounters: starSystemEncounters,
    	shipReactions: shipReactions,
    	surfaceEncounters: surfaceEncounters,
    	colonyEncounters: colonyEncounters
    };

    const createStarSystemEncounter = (data, tensMod = 0) => {
        return {
            date: new Date(),
            encounter: utils.randomD66ArrayItem(data.starSystemEncounters, tensMod),
            reaction: utils.random2D6ArrayItem(data.shipReactions)
        }
    };

    const createSurfaceEncounter = (data, type) => {
        return {
            date: new Date(),
            type: type,
            encounter: utils.random3D6ArrayItem(data.surfaceEncounters)
        }
    };

    const createColonyEncounter = (data, tensMod = 0) => {
        return {
            date: new Date(),
            encounter: utils.randomD66ArrayItem(data.colonyEncounters, tensMod)
        }
    };

    var encounters = {
        createColonyEncounter,
        createStarSystemEncounter,
        createSurfaceEncounter
    };

    const printStarSystemEncounter = (results, options = {}) => {
        return `Star System Encounter: ${results.encounter.type}
Ship Reaction:         ${results.reaction.type}`
    };

    const printSurfaceEncounter = (results, options = {}) => {
        let out = [`Date:        ${results.date.toString()}`];
        let type = results.encounter[results.type];
        if (type) {
            out.push(`Type:        ${results.encounter[results.type]}`);
            if (results.encounter.description) {
                out.push(`Description: ${results.encounter.description}`);
            }
        } else {
            out.push(`Type:        (No Encounter)`);
        }
        return out.join('\n')
    };

    const printColonyEncounter = (results, options = {}) => {
        return `Colony Encounter: ${results.encounter.type}`
    };

    var encountersPrinter = {
        printColonyEncounter,
        printStarSystemEncounter,
        printSurfaceEncounter
    };

    /* src\components\Encounters.svelte generated by Svelte v3.24.1 */
    const file$4 = "src\\components\\Encounters.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let h40;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let button2;
    	let t7;
    	let h41;
    	let t9;
    	let button3;
    	let t11;
    	let button4;
    	let t13;
    	let h42;
    	let t15;
    	let button5;
    	let t17;
    	let button6;
    	let t19;
    	let h43;
    	let t21;
    	let pre;
    	let t22;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h40 = element("h4");
    			h40.textContent = "Star System Encounters";
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "System";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Rim";
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "Uncharted";
    			t7 = space();
    			h41 = element("h4");
    			h41.textContent = "Surface Encounters";
    			t9 = space();
    			button3 = element("button");
    			button3.textContent = "Uninhabited";
    			t11 = space();
    			button4 = element("button");
    			button4.textContent = "Colonized";
    			t13 = space();
    			h42 = element("h4");
    			h42.textContent = "Colony Encounters";
    			t15 = space();
    			button5 = element("button");
    			button5.textContent = "Young";
    			t17 = space();
    			button6 = element("button");
    			button6.textContent = "Established";
    			t19 = space();
    			h43 = element("h4");
    			h43.textContent = "Results";
    			t21 = space();
    			pre = element("pre");
    			t22 = text(/*output*/ ctx[0]);
    			add_location(h40, file$4, 59, 4, 1906);
    			add_location(button0, file$4, 60, 4, 1942);
    			add_location(button1, file$4, 61, 4, 2014);
    			add_location(button2, file$4, 62, 4, 2085);
    			add_location(h41, file$4, 64, 4, 2167);
    			add_location(button3, file$4, 65, 4, 2199);
    			add_location(button4, file$4, 66, 4, 2286);
    			add_location(h42, file$4, 68, 4, 2374);
    			add_location(button5, file$4, 69, 4, 2405);
    			add_location(button6, file$4, 70, 4, 2473);
    			add_location(h43, file$4, 72, 1, 2547);
    			attr_dev(pre, "id", "results");
    			add_location(pre, file$4, 73, 1, 2565);
    			add_location(div, file$4, 58, 0, 1896);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h40);
    			append_dev(div, t1);
    			append_dev(div, button0);
    			append_dev(div, t3);
    			append_dev(div, button1);
    			append_dev(div, t5);
    			append_dev(div, button2);
    			append_dev(div, t7);
    			append_dev(div, h41);
    			append_dev(div, t9);
    			append_dev(div, button3);
    			append_dev(div, t11);
    			append_dev(div, button4);
    			append_dev(div, t13);
    			append_dev(div, h42);
    			append_dev(div, t15);
    			append_dev(div, button5);
    			append_dev(div, t17);
    			append_dev(div, button6);
    			append_dev(div, t19);
    			append_dev(div, h43);
    			append_dev(div, t21);
    			append_dev(div, pre);
    			append_dev(pre, t22);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[7], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[8], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[9], false, false, false),
    					listen_dev(button4, "click", /*click_handler_4*/ ctx[10], false, false, false),
    					listen_dev(button5, "click", /*click_handler_5*/ ctx[11], false, false, false),
    					listen_dev(button6, "click", /*click_handler_6*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*output*/ 1) set_data_dev(t22, /*output*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { options } = $$props; // See src/data/options.json
    	let { results } = $$props; // Also saved to localStorage
    	let output = "Waiting on User."; // Reactive variable! Love Svelte v3 :)
    	const dispatch = createEventDispatcher();

    	function handleStarSystemEncounter(tensMod = 0) {
    		$$invalidate(4, results.starSystemEncounter = encounters.createStarSystemEncounter(encountersData, tensMod), results);
    		$$invalidate(0, output = encountersPrinter.printStarSystemEncounter(results.starSystemEncounter, options));
    		saveData();
    	}

    	function handleSurfaceEncounter(type) {
    		$$invalidate(4, results.surfaceEncounter = encounters.createSurfaceEncounter(encountersData, type), results);
    		$$invalidate(0, output = encountersPrinter.printSurfaceEncounter(results.surfaceEncounter, options));
    		saveData();
    	}

    	function handleColonyEncounter(tensMod) {
    		$$invalidate(4, results.colonyEncounter = encounters.createColonyEncounter(encountersData, tensMod), results);
    		$$invalidate(0, output = encountersPrinter.printColonyEncounter(results.colonyEncounter, options));
    		saveData();
    	}

    	function saveData() {
    		dispatch("saveData", { "key": "results", "value": results });
    	}

    	function printResults() {
    		if (results) {
    			if (results.surfaceEncounter) {
    				$$invalidate(0, output = encountersPrinter.printSurfaceEncounter(results.surfaceEncounter, options));
    			} else if (results.starSystemEncounter) {
    				$$invalidate(0, output = encountersPrinter.printStarSystemEncounter(results.starSystemEncounter, options));
    			} else if (results.colonyEncounter) {
    				$$invalidate(0, output = encountersPrinter.printColonyEncounter(results.colonyEncounter, options));
    			}
    		}
    	}

    	onMount(async () => {
    		printResults();
    	});

    	const writable_props = ["options", "results"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Encounters> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Encounters", $$slots, []);
    	const click_handler = e => handleStarSystemEncounter();
    	const click_handler_1 = e => handleStarSystemEncounter(-3);
    	const click_handler_2 = e => handleStarSystemEncounter(-5);
    	const click_handler_3 = e => handleSurfaceEncounter("uninhabited");
    	const click_handler_4 = e => handleSurfaceEncounter("colonized");
    	const click_handler_5 = e => handleColonyEncounter(0);
    	const click_handler_6 = e => handleColonyEncounter(+1);

    	$$self.$$set = $$props => {
    		if ("options" in $$props) $$invalidate(5, options = $$props.options);
    		if ("results" in $$props) $$invalidate(4, results = $$props.results);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		encountersData,
    		encounters,
    		encountersPrinter,
    		options,
    		results,
    		output,
    		dispatch,
    		handleStarSystemEncounter,
    		handleSurfaceEncounter,
    		handleColonyEncounter,
    		saveData,
    		printResults
    	});

    	$$self.$inject_state = $$props => {
    		if ("options" in $$props) $$invalidate(5, options = $$props.options);
    		if ("results" in $$props) $$invalidate(4, results = $$props.results);
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		output,
    		handleStarSystemEncounter,
    		handleSurfaceEncounter,
    		handleColonyEncounter,
    		results,
    		options,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6
    	];
    }

    class Encounters extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { options: 5, results: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Encounters",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*options*/ ctx[5] === undefined && !("options" in props)) {
    			console.warn("<Encounters> was created without expected prop 'options'");
    		}

    		if (/*results*/ ctx[4] === undefined && !("results" in props)) {
    			console.warn("<Encounters> was created without expected prop 'results'");
    		}
    	}

    	get options() {
    		throw new Error("<Encounters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Encounters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get results() {
    		throw new Error("<Encounters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set results(value) {
    		throw new Error("<Encounters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\NotFound.svelte generated by Svelte v3.24.1 */

    const file$5 = "src\\components\\NotFound.svelte";

    function create_fragment$5(ctx) {
    	let h4;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Oops!";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Page not found. Might be a xenomorph.";
    			add_location(h4, file$5, 0, 0, 0);
    			add_location(p, file$5, 1, 0, 15);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NotFound", $$slots, []);
    	return [];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    let links = [
        {path: '/', title: 'Home', component: Home},
        {path: '/star-systems', title: 'Star Systems', component: StarSystems},
        {path: '/jobs', title: 'Jobs', component: Jobs},
        {path: '/encounters', title: 'Encounters', component: Encounters},
        {path: '*', component: NotFound, isNav: false}
    ];

    /* src\components\App.svelte generated by Svelte v3.24.1 */
    const file$6 = "src\\components\\App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (49:3) {#if i > 0}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("·");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(49:3) {#if i > 0}",
    		ctx
    	});

    	return block;
    }

    // (48:2) {#each links.filter(e => e.isNav !== false) as link, i}
    function create_each_block$1(ctx) {
    	let t0;
    	let a;
    	let t1_value = /*link*/ ctx[8].title + "";
    	let t1;
    	let a_href_value;
    	let a_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*i*/ ctx[10] > 0 && create_if_block(ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*link*/ ctx[8], ...args);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			a = element("a");
    			t1 = text(t1_value);
    			attr_dev(a, "href", a_href_value = "" + ((/*baseRoute*/ ctx[2] ? /*baseRoute*/ ctx[2] + "/" : "") + "#!" + /*link*/ ctx[8].path));

    			attr_dev(a, "class", a_class_value = "" + (null_to_empty(/*currentLink*/ ctx[3].path === /*link*/ ctx[8].path
    			? "active"
    			: "") + " svelte-81onu1"));

    			add_location(a, file$6, 49, 3, 1293);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, t1);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", stop_propagation(prevent_default(click_handler)), false, true, true);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*baseRoute*/ 4 && a_href_value !== (a_href_value = "" + ((/*baseRoute*/ ctx[2] ? /*baseRoute*/ ctx[2] + "/" : "") + "#!" + /*link*/ ctx[8].path))) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*currentLink*/ 8 && a_class_value !== (a_class_value = "" + (null_to_empty(/*currentLink*/ ctx[3].path === /*link*/ ctx[8].path
    			? "active"
    			: "") + " svelte-81onu1"))) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(48:2) {#each links.filter(e => e.isNav !== false) as link, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let h2;
    	let t1;
    	let nav;
    	let t2;
    	let div;
    	let switch_instance;
    	let t3;
    	let footer;
    	let small;
    	let t4;
    	let a;
    	let t5;
    	let a_href_value;
    	let t6;
    	let t7_value = appData.copyright + "";
    	let t7;
    	let t8;
    	let t9_value = appData.version + "";
    	let t9;
    	let t10;
    	let current;
    	let each_value = links.filter(func);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	var switch_value = /*currentLink*/ ctx[3].component;

    	function switch_props(ctx) {
    		return {
    			props: {
    				options: /*options*/ ctx[0],
    				results: /*results*/ ctx[1]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("saveData", /*saveData_handler*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			h2 = element("h2");
    			h2.textContent = `${appData.title}`;
    			t1 = space();
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t3 = space();
    			footer = element("footer");
    			small = element("small");
    			t4 = text("See the ");
    			a = element("a");
    			t5 = text("github repo");
    			t6 = text(" for details. ");
    			t7 = text(t7_value);
    			t8 = text(" Last updated ");
    			t9 = text(t9_value);
    			t10 = text(".");
    			add_location(h2, file$6, 44, 1, 1170);
    			add_location(nav, file$6, 46, 1, 1198);
    			attr_dev(div, "class", "page");
    			add_location(div, file$6, 55, 1, 1518);
    			attr_dev(a, "href", a_href_value = appData.githubUrl);
    			attr_dev(a, "class", "svelte-81onu1");
    			add_location(a, file$6, 60, 17, 1673);
    			add_location(small, file$6, 60, 2, 1658);
    			add_location(footer, file$6, 59, 1, 1647);
    			add_location(main, file$6, 43, 0, 1162);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h2);
    			append_dev(main, t1);
    			append_dev(main, nav);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(nav, null);
    			}

    			append_dev(main, t2);
    			append_dev(main, div);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(main, t3);
    			append_dev(main, footer);
    			append_dev(footer, small);
    			append_dev(small, t4);
    			append_dev(small, a);
    			append_dev(a, t5);
    			append_dev(small, t6);
    			append_dev(small, t7);
    			append_dev(small, t8);
    			append_dev(small, t9);
    			append_dev(small, t10);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*baseRoute, links, currentLink, handleNav*/ 28) {
    				each_value = links.filter(func);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(nav, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const switch_instance_changes = {};
    			if (dirty & /*options*/ 1) switch_instance_changes.options = /*options*/ ctx[0];
    			if (dirty & /*results*/ 2) switch_instance_changes.results = /*results*/ ctx[1];

    			if (switch_value !== (switch_value = /*currentLink*/ ctx[3].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("saveData", /*saveData_handler*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = e => e.isNav !== false;

    function instance$6($$self, $$props, $$invalidate) {
    	let { options } = $$props; // See src/data/options.json
    	let { results } = $$props; // Saved externally
    	let { isLocal } = $$props;

    	// FIXME Workaround because I can't see how to configure sirv to run locally from a nested path (i.e. localhost/alienrpg).
    	let baseRoute = "";

    	if (!isLocal) {
    		baseRoute = "/alienrpg";
    		page.base(baseRoute);
    	}

    	let currentLink = links[0]; // home

    	for (const link of links) {
    		page(link.path, () => {
    			$$invalidate(3, currentLink = link);
    		});
    	}

    	/**
     * Had to turn off Page.js's automatic click handling, because it would mean the actual URL attributes in the anchor elements is incorrect.
     * Meaning the app works fine when you were clicking it, but if you ctrl+clicked or right-click+copy-link, the link was incorrect. I don't like that.
     */
    	const handleNav = nextLink => {
    		// console.debug(`nextLink.path=${nextLink.path}`)
    		page(nextLink.path);
    	};

    	page.start({
    		click: false, // Required for handleNav
    		hashbang: true
    	});

    	const writable_props = ["options", "results", "isLocal"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const click_handler = (link, e) => handleNav(link);

    	function saveData_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    		if ("results" in $$props) $$invalidate(1, results = $$props.results);
    		if ("isLocal" in $$props) $$invalidate(5, isLocal = $$props.isLocal);
    	};

    	$$self.$capture_state = () => ({
    		router: page,
    		appData,
    		links,
    		options,
    		results,
    		isLocal,
    		baseRoute,
    		currentLink,
    		handleNav
    	});

    	$$self.$inject_state = $$props => {
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    		if ("results" in $$props) $$invalidate(1, results = $$props.results);
    		if ("isLocal" in $$props) $$invalidate(5, isLocal = $$props.isLocal);
    		if ("baseRoute" in $$props) $$invalidate(2, baseRoute = $$props.baseRoute);
    		if ("currentLink" in $$props) $$invalidate(3, currentLink = $$props.currentLink);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		options,
    		results,
    		baseRoute,
    		currentLink,
    		handleNav,
    		isLocal,
    		click_handler,
    		saveData_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { options: 0, results: 1, isLocal: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*options*/ ctx[0] === undefined && !("options" in props)) {
    			console.warn("<App> was created without expected prop 'options'");
    		}

    		if (/*results*/ ctx[1] === undefined && !("results" in props)) {
    			console.warn("<App> was created without expected prop 'results'");
    		}

    		if (/*isLocal*/ ctx[5] === undefined && !("isLocal" in props)) {
    			console.warn("<App> was created without expected prop 'isLocal'");
    		}
    	}

    	get options() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get results() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set results(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isLocal() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isLocal(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var _comments = [
    	"Default options for the UI. Saved to window.localStorage."
    ];
    var starLocation = "ran";
    var showSurveyedDetails = false;
    var showOptions = false;
    var showUI = "starSystems";
    var defaultOptions = {
    	_comments: _comments,
    	starLocation: starLocation,
    	showSurveyedDetails: showSurveyedDetails,
    	showOptions: showOptions,
    	showUI: showUI
    };

    let optionsString = window.sessionStorage.getItem('options');
    let options = optionsString ? JSON.parse(optionsString) : defaultOptions;

    let resultsString = window.sessionStorage.getItem('results');
    let results = resultsString ? JSON.parse(resultsString) : {};

    let isLocal = window.location.hostname === 'localhost';

    const app = new App({
    	target: document.body,
    	props: {
    		isLocal,
    		options: options,
    		results: results
    	}
    });

    // Design choice - keep the use of window.sessionStorage out of the components and instead keep here together in one place.
    // TODO Is there a more idiomatic way to do this?

    app.$on('saveData', event => {
    	// console.debug(`saveData ${event.detail.key}, value:`, event.detail.value)
    	window.sessionStorage.setItem(event.detail.key, JSON.stringify(event.detail.value));
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
