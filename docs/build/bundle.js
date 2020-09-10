
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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

    const defaultOptions = {
    	showSurveyedDetails: true
    };

    // For CLI based results.
    const printStarSystem = (results, options = defaultOptions) => {
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

    	if (world.isColonized || hasColonizedMoon(world)) {
    		out.push(printOrbitalComponents(world, options, tabs, spaces));
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
    	} else {
    		for (const orbitalComponent of world.orbitalComponents) {
    			out.push(`${orbitalComponent.type}${orbitalComponent.owner ? ' (' + orbitalComponent.owner + ')' : ''}`);
    		}
    		return `${tabs}Orbitals:${spaces}` + out.join(', ')
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

    /* src\components\App.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1 } = globals;
    const file = "src\\components\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (63:4) {#each starLocations as item}
    function create_each_block(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*item*/ ctx[13].name + "";
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
    			input.__value = input_value_value = /*item*/ ctx[13].key;
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[11][0].push(input);
    			add_location(input, file, 65, 6, 2075);
    			add_location(label, file, 63, 5, 1948);
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
    					listen_dev(input, "change", /*saveOptions*/ ctx[6], false, false, false),
    					listen_dev(input, "change", /*input_change_handler_1*/ ctx[10])
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
    			/*$$binding_groups*/ ctx[11][0].splice(/*$$binding_groups*/ ctx[11][0].indexOf(input), 1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(63:4) {#each starLocations as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h2;
    	let t0_value = /*appData*/ ctx[1].title + "";
    	let t0;
    	let t1;
    	let p;
    	let t2;
    	let strong;
    	let i;
    	let t4;
    	let t5;
    	let button;
    	let t7;
    	let form;
    	let fieldset0;
    	let legend0;
    	let t9;
    	let div0;
    	let label;
    	let input;
    	let t10;
    	let t11;
    	let fieldset1;
    	let legend1;
    	let t13;
    	let div1;
    	let t14;
    	let h3;
    	let t16;
    	let pre;
    	let t17;
    	let t18;
    	let footer;
    	let small;
    	let t19_value = /*appData*/ ctx[1].title + "";
    	let t19;
    	let t20;
    	let t21_value = /*appData*/ ctx[1].version + "";
    	let t21;
    	let t22;
    	let a;
    	let t23;
    	let a_href_value;
    	let t24;
    	let t25_value = /*appData*/ ctx[1].copyright + "";
    	let t25;
    	let t26;
    	let t27_value = /*appData*/ ctx[1].version + "";
    	let t27;
    	let t28;
    	let mounted;
    	let dispose;
    	let each_value = /*starLocations*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text("An ");
    			strong = element("strong");
    			i = element("i");
    			i.textContent = "unofficial";
    			t4 = text(" web app to help Game Mothers with their prep.");
    			t5 = space();
    			button = element("button");
    			button.textContent = "New Star System";
    			t7 = space();
    			form = element("form");
    			fieldset0 = element("fieldset");
    			legend0 = element("legend");
    			legend0.textContent = "Options";
    			t9 = space();
    			div0 = element("div");
    			label = element("label");
    			input = element("input");
    			t10 = text(" Show surveyed details");
    			t11 = space();
    			fieldset1 = element("fieldset");
    			legend1 = element("legend");
    			legend1.textContent = "Star System Location";
    			t13 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t14 = space();
    			h3 = element("h3");
    			h3.textContent = "Results";
    			t16 = space();
    			pre = element("pre");
    			t17 = text(/*output*/ ctx[2]);
    			t18 = space();
    			footer = element("footer");
    			small = element("small");
    			t19 = text(t19_value);
    			t20 = space();
    			t21 = text(t21_value);
    			t22 = text(". See the ");
    			a = element("a");
    			t23 = text("github repo");
    			t24 = text(" for details. ");
    			t25 = text(t25_value);
    			t26 = text(" Last updated ");
    			t27 = text(t27_value);
    			t28 = text(".");
    			add_location(h2, file, 45, 1, 1403);
    			add_location(i, file, 47, 15, 1445);
    			add_location(strong, file, 47, 7, 1437);
    			add_location(p, file, 47, 1, 1431);
    			add_location(button, file, 49, 1, 1525);
    			add_location(legend0, file, 52, 3, 1636);
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file, 55, 5, 1687);
    			add_location(label, file, 54, 4, 1674);
    			add_location(div0, file, 53, 3, 1664);
    			add_location(fieldset0, file, 51, 2, 1622);
    			add_location(legend1, file, 60, 3, 1862);
    			add_location(div1, file, 61, 3, 1903);
    			add_location(fieldset1, file, 59, 2, 1848);
    			add_location(form, file, 50, 1, 1613);
    			add_location(h3, file, 72, 1, 2246);
    			attr_dev(pre, "id", "results");
    			add_location(pre, file, 73, 1, 2264);
    			attr_dev(a, "href", a_href_value = /*appData*/ ctx[1].githubUrl);
    			add_location(a, file, 76, 52, 2360);
    			add_location(small, file, 76, 2, 2310);
    			add_location(footer, file, 75, 1, 2299);
    			add_location(main, file, 44, 0, 1395);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h2);
    			append_dev(h2, t0);
    			append_dev(main, t1);
    			append_dev(main, p);
    			append_dev(p, t2);
    			append_dev(p, strong);
    			append_dev(strong, i);
    			append_dev(p, t4);
    			append_dev(main, t5);
    			append_dev(main, button);
    			append_dev(main, t7);
    			append_dev(main, form);
    			append_dev(form, fieldset0);
    			append_dev(fieldset0, legend0);
    			append_dev(fieldset0, t9);
    			append_dev(fieldset0, div0);
    			append_dev(div0, label);
    			append_dev(label, input);
    			input.checked = /*options*/ ctx[0].showSurveyedDetails;
    			append_dev(label, t10);
    			append_dev(form, t11);
    			append_dev(form, fieldset1);
    			append_dev(fieldset1, legend1);
    			append_dev(fieldset1, t13);
    			append_dev(fieldset1, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(main, t14);
    			append_dev(main, h3);
    			append_dev(main, t16);
    			append_dev(main, pre);
    			append_dev(pre, t17);
    			append_dev(main, t18);
    			append_dev(main, footer);
    			append_dev(footer, small);
    			append_dev(small, t19);
    			append_dev(small, t20);
    			append_dev(small, t21);
    			append_dev(small, t22);
    			append_dev(small, a);
    			append_dev(a, t23);
    			append_dev(small, t24);
    			append_dev(small, t25);
    			append_dev(small, t26);
    			append_dev(small, t27);
    			append_dev(small, t28);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*saveOptions*/ ctx[6], false, false, false),
    					listen_dev(button, "click", /*handleNewStarSystem*/ ctx[4], false, false, false),
    					listen_dev(input, "click", /*toggleHideUninhabited*/ ctx[5], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[9])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*appData*/ 2 && t0_value !== (t0_value = /*appData*/ ctx[1].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*options*/ 1) {
    				input.checked = /*options*/ ctx[0].showSurveyedDetails;
    			}

    			if (dirty & /*starLocations, options, saveOptions*/ 73) {
    				each_value = /*starLocations*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*output*/ 4) set_data_dev(t17, /*output*/ ctx[2]);
    			if (dirty & /*appData*/ 2 && t19_value !== (t19_value = /*appData*/ ctx[1].title + "")) set_data_dev(t19, t19_value);
    			if (dirty & /*appData*/ 2 && t21_value !== (t21_value = /*appData*/ ctx[1].version + "")) set_data_dev(t21, t21_value);

    			if (dirty & /*appData*/ 2 && a_href_value !== (a_href_value = /*appData*/ ctx[1].githubUrl)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*appData*/ 2 && t25_value !== (t25_value = /*appData*/ ctx[1].copyright + "")) set_data_dev(t25, t25_value);
    			if (dirty & /*appData*/ 2 && t27_value !== (t27_value = /*appData*/ ctx[1].version + "")) set_data_dev(t27, t27_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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

    function instance($$self, $$props, $$invalidate) {
    	let { appData } = $$props;
    	let { starData } = $$props;
    	let { options } = $$props; // See src/data/options.json
    	let { results } = $$props; // Also saved to localStorage
    	let output = "Waiting on User."; // Reactive variable! Love Svelte v3 :)

    	// Create a UI-only version of the data
    	let starLocations = JSON.parse(JSON.stringify(starData.starLocations));

    	starLocations.push({ "key": "ran", "name": "Random" });
    	const dispatch = createEventDispatcher();

    	if (Object.entries(results).length > 0) {
    		// check for empty object
    		output = starSystemPrinter.printStarSystem(results, options);
    	}

    	function handleNewStarSystem() {
    		$$invalidate(7, results = starSystems.createStarSystem(starData, options));
    		dispatch("saveData", { "key": "results", "value": results });
    		$$invalidate(2, output = starSystemPrinter.printStarSystem(results, options));
    	}

    	function toggleHideUninhabited() {
    		$$invalidate(0, options.showSurveyedDetails = !options.showSurveyedDetails, options);
    		dispatch("saveData", { "key": "options", "value": options });
    		$$invalidate(2, output = starSystemPrinter.printStarSystem(results, options));
    	}

    	function saveOptions() {
    		dispatch("saveData", { "key": "options", "value": options });
    	}

    	const writable_props = ["appData", "starData", "options", "results"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
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
    		if ("appData" in $$props) $$invalidate(1, appData = $$props.appData);
    		if ("starData" in $$props) $$invalidate(8, starData = $$props.starData);
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    		if ("results" in $$props) $$invalidate(7, results = $$props.results);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		starSystems,
    		starSystemPrinter,
    		appData,
    		starData,
    		options,
    		results,
    		output,
    		starLocations,
    		dispatch,
    		handleNewStarSystem,
    		toggleHideUninhabited,
    		saveOptions
    	});

    	$$self.$inject_state = $$props => {
    		if ("appData" in $$props) $$invalidate(1, appData = $$props.appData);
    		if ("starData" in $$props) $$invalidate(8, starData = $$props.starData);
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    		if ("results" in $$props) $$invalidate(7, results = $$props.results);
    		if ("output" in $$props) $$invalidate(2, output = $$props.output);
    		if ("starLocations" in $$props) $$invalidate(3, starLocations = $$props.starLocations);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		options,
    		appData,
    		output,
    		starLocations,
    		handleNewStarSystem,
    		toggleHideUninhabited,
    		saveOptions,
    		results,
    		starData,
    		input_change_handler,
    		input_change_handler_1,
    		$$binding_groups
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			appData: 1,
    			starData: 8,
    			options: 0,
    			results: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*appData*/ ctx[1] === undefined && !("appData" in props)) {
    			console.warn("<App> was created without expected prop 'appData'");
    		}

    		if (/*starData*/ ctx[8] === undefined && !("starData" in props)) {
    			console.warn("<App> was created without expected prop 'starData'");
    		}

    		if (/*options*/ ctx[0] === undefined && !("options" in props)) {
    			console.warn("<App> was created without expected prop 'options'");
    		}

    		if (/*results*/ ctx[7] === undefined && !("results" in props)) {
    			console.warn("<App> was created without expected prop 'results'");
    		}
    	}

    	get appData() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appData(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get starData() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set starData(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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
    }

    var title = "Alien RPG Tools";
    var version = "10 Sep 2020 10:58:43";
    var copyright = "Any text taken from the game is used with permission and remains © of their respective owners.";
    var githubUrl = "https://github.com/ScottMaclure/alienrpg/blob/master/README.md";
    var appData = {
    	title: title,
    	version: version,
    	copyright: copyright,
    	githubUrl: githubUrl
    };

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

    var _comments = [
    	"Default options for the UI. Saved to window.localStorage."
    ];
    var starLocation = "ran";
    var showSurveyedDetails = false;
    var defaultOptions$1 = {
    	_comments: _comments,
    	starLocation: starLocation,
    	showSurveyedDetails: showSurveyedDetails
    };

    let optionsString = window.sessionStorage.getItem('options');
    let options = optionsString ? JSON.parse(optionsString) : defaultOptions$1;

    let resultsString = window.sessionStorage.getItem('results');
    let results = resultsString ? JSON.parse(resultsString) : {};

    const app = new App({
    	target: document.body,
    	props: {
    		appData: appData,
    		starData: starData,
    		options: options,
    		results: results
    	}
    });

    // Design choice - keep the use of window.sessionStorage out of the components and instead keep here together in one place.
    // TODO Is there a more idiomatic way to do this?

    app.$on('saveData', event => {
    	console.debug(`saveData: Saving ${event.detail.key} to sessionStorage.`);
    	window.sessionStorage.setItem(event.detail.key, JSON.stringify(event.detail.value));
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
