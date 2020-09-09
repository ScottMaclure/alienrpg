
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
    };

    const createStarSystem = (data) => {
    	let results = {};

    	// TODO Make this an option the user can choose, instead of always rolling randomly.
    	results.starLocation = utils.randomArrayItem(data.starLocations);
    	// For frontier, pick random allegiance table for later.
    	if (results.starLocation.colonyAllegianceKeys) {
    		results.starLocation.colonyAllegianceKey = utils.randomArrayItem(results.starLocation.colonyAllegianceKeys);
    	}
    	
    	results.starType = getStarType(data);

    	// TODO What about "Spectral Class"?

    	createSystemObjects(data, results);

    	// TODO Gas giant planets?

    	// TODO What about generating planetary details for all planets?
    	// Pick which planetary body will be the "main" world, which has been colonized.
    	let usedPlanetNames = [];
    	pickColonizedWorlds(data, results, usedPlanetNames);
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
    		let numberOfObjects = utils.rollNumberObjects(systemObject, modKey);
    		// console.log(`systemObject type=${systemObject.type}, numberOfObjects=${numberOfObjects}`)
    		for (let i = 0; i < numberOfObjects; i++) {
    			results['systemObjects'].push(createWorld(systemObject));
    		}
    	}
    };

    /**
     * The main data for a given planetary body.
     * TODO This is where a type system would come in handy. TS or Flow?
     * @param {*} systemObject starData.json system object info.
     */
    const createWorld = (systemObject) => {
    	// optional feature
    	let feature = systemObject.features ? utils.randomArrayItem(systemObject.features) : null;
    	// TODO What about making systemObject a child of world? More consistent with other data? Or should we flatten the others instead?
    	return({
    		'key': systemObject.key, // used for future reference in starData.json.
    		'type': systemObject.type, // e.g. icePlanet
    		'feature': feature,
    		'habitable': systemObject.habitable,
    		'isColonized': false, // will be set later for one lucky planetary body. Maybe more later.
    		'planetSizeMod': systemObject.planetSizeMod,
    		'colonies': [] // fleshed out later
    	})
    };

    const getUniquePlanetName = (data, usedPlanetNames) => {
    	let planetName = null;
    	let foundUniquePlanetName = false;
    	while (!foundUniquePlanetName) {
    		let iccCode = utils.randomArrayItem(data.iccCodes);
    		let planetaryName = utils.randomArrayItem(data.planetaryNames);
    		
    		// TODO Correct formats?
    		planetName = iccCode + '-' + planetaryName;
    		
    		if (!usedPlanetNames.includes(planetName)) {
    			foundUniquePlanetName = true;
    			usedPlanetNames.push(planetName);
    		}
    	}
    	return planetName
    };

    /**
     * For now, only one world in a system will be flaggged as colonized - the "main" world.
     * Also set its name, cause it's special.
     */
    const pickColonizedWorlds = (data, results, usedPlanetNames) => {

    	let world = false;
    	let foundWorld = false;
    	while (!foundWorld) {
    		world = utils.randomArrayItem(results.systemObjects);
    		if (world.habitable) {
    			world.isColonized = true;
    			// TODO Only habitated worlds get a name for now.
    			world.name = getUniquePlanetName(data, usedPlanetNames);
    			foundWorld = true;
    		}
    	}

    };

    /**
     * Set properties for ALL system objects. 
     * @param {object} data starData.json
     * @param {object} results Generated system objects etc.
     */
    const generateWorlds = (data, results) => {
    	for (let world of results.systemObjects) {
    		// Clone the data to ensure uniqueness each time we generate world data.
    		generateWorld(JSON.parse(JSON.stringify(data)), results, world);
    	}
    };

    /**
     * The logic for world creation.
     * If the world has been marked as habitable, do a little extra.
     * @param {object} data starData.json
     * @param {object} world See createSystemObjects()
     */
    const generateWorld = (data, results, world) => {

    	const worldTypeKey = world.key; // e.g. terrestrialPlanet, icePlanet

    	world.planetSize = utils.random2D6ArrayItem(data.planetSizes, world.planetSizeMod);
    	// console.debug('planetSize', world.planetSize)

    	// Atmosphere and temperature are driven by the object type (key).
    	switch (worldTypeKey) {
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

    		if (worldTypeKey === 'icePlanet') {
    			world.terrain = utils.random2D6ArrayItem(data.terrains[worldTypeKey]);
    		} else {
    			// TODO In future, would need for gas giants with planets
    			const terrainMod = world.geosphere[worldTypeKey] + world.temperature[worldTypeKey];
    			// console.debug(`terrain mods for ${worldTypeKey}, geosphere ${world.geosphere[worldTypeKey]} + temperature ${world.temperature[worldTypeKey]} = ${terrainMod}`)
    			world.terrain = utils.randomD66ArrayItem(data.terrains[worldTypeKey], terrainMod);
    		}
    	}
    	
    	// Only populate worlds flagged as habitable.
    	if (world.isColonized) {
    	
    		// console.log(`Habitating world ${world.name}....`)

    		const numColonies = getNumColonies();
    		const colonySizeMod = world.planetSize.colonySizeMod + world.atmosphere.colonySizeMod;

    		for (let i = 0; i < numColonies; i++) {

    			let colony = {};

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

    			// Generate orbital components around the planet for this colony.
    			colony.orbitalComponents = [];
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
    						applyQuantityToType(anotherOrbitalComponent);
    						colony.orbitalComponents.push(anotherOrbitalComponent);
    					}
    				}
    			} else {
    				// Just the 1
    				applyQuantityToType(orbitalComponent);
    				colony.orbitalComponents.push(orbitalComponent);
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
    	showUninhabitedDetails: true
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
    		out.push(printWorldTitle(i, world, tabs));
    		if (world.isColonized || options.showUninhabitedDetails) {
    			out.push(printWorldDetails(world, `${tabs}${spaceIndent}`));
    		}
        }
    	return out.join('\n')
    };

    const printWorldTitle = (i, world, tabs) => {
        const formattedI = (''+(i+1)).padStart(2, 0);
        return `${tabs}#${formattedI}: ${world.name ? world.name + ', ': ''}${world.type}${world.feature ? ', ' + world.feature : ''}${world.isColonized ? ', ' + world.geosphere.type : ' (Uninhabited)'}${printMoonSummary(world)}`
    };

    const printMoonSummary = (world) => {
    	if (!world.habitable) { return '' }
    	let moonCount = 0;
    	for (const colony of world.colonies) {
    		for (const orbitalComponent of colony.orbitalComponents) {
    			if (orbitalComponent.isMoon) {
    				moonCount = moonCount + orbitalComponent.quantityAmount;
    			}
    		}
    	}
    	if (moonCount == 0) { return '' }
    	if (moonCount == 1) { return `, ${moonCount} moon` }
    	return `, ${moonCount} moons`
    };

    /**
     * Handle all world types: habitable, colonised.
     */
    const printWorldDetails = (world, tabs) => {
        let out = [];
        // console.debug(`printWorldDetails, world=${world.habitable}, name=${world.name}`)
        if (world.habitable) {
            out.push(`${tabs}Planet Size:  ${utils.formatNumber(world.planetSize.sizeKm)} km, ${world.planetSize.surfaceGravity} G${world.planetSize.examples ? ' (e.g. ' + world.planetSize.examples + ')' : '' }`);
    	}
    	out.push(`${tabs}Atmosphere:   ${world.atmosphere.type}`);
    	out.push(`${tabs}Temperature:  ${world.temperature.type}, ${world.temperature.average}°C average (e.g. ${world.temperature.description})`);
    	if (world.habitable) {
    		out.push(`${tabs}Geosphere:    ${world.geosphere.type}, ${world.geosphere.description}`);
    		out.push(`${tabs}Terrain:      ${world.terrain.description}`);
    	}
    	if (world.isColonized) {
    		out.push(`${tabs}Hook:         ${world.scenarioHook.description}`);
    		out.push(printColonyDetails(world, tabs));
    	}
        return out.join(`\n`)
    };

    const printColonyDetails = (world, tabs) => {
    	let out = [];
    	let nestedTabs = tabs + spaceIndent;
    	const spaces = '   ';
    	for (const [i, colony] of world.colonies.entries()) {
            out.push(`${tabs}Colony #${i+1}:`);
    		out.push(`${nestedTabs}Allegiance: ${colony.allegiance}`);
    		out.push(`${nestedTabs}Size:       ${colony.colonySize.size}, ${utils.formatNumber(colony.colonySize.populationAmount)} pax`);
    		out.push(printColonyMissions(colony.missions, nestedTabs, spaces));
    		out.push(printColonyOrbitalComponents(colony.orbitalComponents, nestedTabs, spaces));
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

    const printColonyOrbitalComponents = (orbitalComponents, tabs, spaces) => {
    	let out = [];
    	for (const [i, orbitalComponent] of orbitalComponents.entries()) {
    		out.push(orbitalComponent.type);
    	}
    	return `${tabs}Orbitals:${spaces}` + out.join(', ')
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

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let small0;
    	let t0_value = /*appData*/ ctx[1].version + "";
    	let t0;
    	let t1;
    	let h2;
    	let t2_value = /*appData*/ ctx[1].title + "";
    	let t2;
    	let t3;
    	let p;
    	let t4;
    	let strong;
    	let i;
    	let t6;
    	let t7;
    	let button;
    	let t9;
    	let form;
    	let fieldset;
    	let legend;
    	let t11;
    	let div1;
    	let label;
    	let input;
    	let t12;
    	let t13;
    	let h3;
    	let t15;
    	let pre;
    	let t16;
    	let t17;
    	let footer;
    	let small1;
    	let t18_value = /*appData*/ ctx[1].title + "";
    	let t18;
    	let t19;
    	let t20_value = /*appData*/ ctx[1].version + "";
    	let t20;
    	let t21;
    	let a;
    	let t22;
    	let a_href_value;
    	let t23;
    	let t24_value = /*appData*/ ctx[1].copyright + "";
    	let t24;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			small0 = element("small");
    			t0 = text(t0_value);
    			t1 = space();
    			h2 = element("h2");
    			t2 = text(t2_value);
    			t3 = space();
    			p = element("p");
    			t4 = text("An ");
    			strong = element("strong");
    			i = element("i");
    			i.textContent = "unofficial";
    			t6 = text(" web app to help Game Mothers with their prep.");
    			t7 = space();
    			button = element("button");
    			button.textContent = "New Star System";
    			t9 = space();
    			form = element("form");
    			fieldset = element("fieldset");
    			legend = element("legend");
    			legend.textContent = "Options";
    			t11 = space();
    			div1 = element("div");
    			label = element("label");
    			input = element("input");
    			t12 = text(" Show uninhabited details");
    			t13 = space();
    			h3 = element("h3");
    			h3.textContent = "Results";
    			t15 = space();
    			pre = element("pre");
    			t16 = text(/*output*/ ctx[2]);
    			t17 = space();
    			footer = element("footer");
    			small1 = element("small");
    			t18 = text(t18_value);
    			t19 = space();
    			t20 = text(t20_value);
    			t21 = text(". See the ");
    			a = element("a");
    			t22 = text("github repo");
    			t23 = text(" for details. ");
    			t24 = text(t24_value);
    			add_location(small0, file, 36, 25, 1107);
    			attr_dev(div0, "class", "alignRight");
    			add_location(div0, file, 36, 1, 1083);
    			add_location(h2, file, 37, 1, 1147);
    			add_location(i, file, 39, 15, 1189);
    			add_location(strong, file, 39, 7, 1181);
    			add_location(p, file, 39, 1, 1175);
    			add_location(button, file, 41, 1, 1269);
    			add_location(legend, file, 44, 3, 1357);
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file, 47, 5, 1408);
    			add_location(label, file, 46, 4, 1395);
    			add_location(div1, file, 45, 3, 1385);
    			add_location(fieldset, file, 43, 2, 1343);
    			add_location(form, file, 42, 1, 1334);
    			add_location(h3, file, 53, 1, 1588);
    			attr_dev(pre, "id", "results");
    			add_location(pre, file, 54, 1, 1606);
    			attr_dev(a, "href", a_href_value = /*appData*/ ctx[1].githubUrl);
    			add_location(a, file, 57, 52, 1702);
    			add_location(small1, file, 57, 2, 1652);
    			add_location(footer, file, 56, 1, 1641);
    			add_location(main, file, 35, 0, 1075);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, small0);
    			append_dev(small0, t0);
    			append_dev(main, t1);
    			append_dev(main, h2);
    			append_dev(h2, t2);
    			append_dev(main, t3);
    			append_dev(main, p);
    			append_dev(p, t4);
    			append_dev(p, strong);
    			append_dev(strong, i);
    			append_dev(p, t6);
    			append_dev(main, t7);
    			append_dev(main, button);
    			append_dev(main, t9);
    			append_dev(main, form);
    			append_dev(form, fieldset);
    			append_dev(fieldset, legend);
    			append_dev(fieldset, t11);
    			append_dev(fieldset, div1);
    			append_dev(div1, label);
    			append_dev(label, input);
    			input.checked = /*options*/ ctx[0].showUninhabitedDetails;
    			append_dev(label, t12);
    			append_dev(main, t13);
    			append_dev(main, h3);
    			append_dev(main, t15);
    			append_dev(main, pre);
    			append_dev(pre, t16);
    			append_dev(main, t17);
    			append_dev(main, footer);
    			append_dev(footer, small1);
    			append_dev(small1, t18);
    			append_dev(small1, t19);
    			append_dev(small1, t20);
    			append_dev(small1, t21);
    			append_dev(small1, a);
    			append_dev(a, t22);
    			append_dev(small1, t23);
    			append_dev(small1, t24);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*handleNewStarSystem*/ ctx[3], false, false, false),
    					listen_dev(input, "click", /*toggleHideUninhabited*/ ctx[4], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*appData*/ 2 && t0_value !== (t0_value = /*appData*/ ctx[1].version + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*appData*/ 2 && t2_value !== (t2_value = /*appData*/ ctx[1].title + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*options*/ 1) {
    				input.checked = /*options*/ ctx[0].showUninhabitedDetails;
    			}

    			if (dirty & /*output*/ 4) set_data_dev(t16, /*output*/ ctx[2]);
    			if (dirty & /*appData*/ 2 && t18_value !== (t18_value = /*appData*/ ctx[1].title + "")) set_data_dev(t18, t18_value);
    			if (dirty & /*appData*/ 2 && t20_value !== (t20_value = /*appData*/ ctx[1].version + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*appData*/ 2 && a_href_value !== (a_href_value = /*appData*/ ctx[1].githubUrl)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*appData*/ 2 && t24_value !== (t24_value = /*appData*/ ctx[1].copyright + "")) set_data_dev(t24, t24_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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
    	const dispatch = createEventDispatcher();

    	if (Object.entries(results).length > 0) {
    		// check for empty object
    		output = starSystemPrinter.printStarSystem(results, options);
    	}

    	function handleNewStarSystem() {
    		$$invalidate(5, results = starSystems.createStarSystem(starData));
    		dispatch("newResults", results);
    		$$invalidate(2, output = starSystemPrinter.printStarSystem(results, options));
    	}

    	function toggleHideUninhabited() {
    		$$invalidate(0, options.showUninhabitedDetails = !options.showUninhabitedDetails, options);
    		dispatch("newOptions", options);
    		$$invalidate(2, output = starSystemPrinter.printStarSystem(results, options));
    	}

    	const writable_props = ["appData", "starData", "options", "results"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function input_change_handler() {
    		options.showUninhabitedDetails = this.checked;
    		$$invalidate(0, options);
    	}

    	$$self.$$set = $$props => {
    		if ("appData" in $$props) $$invalidate(1, appData = $$props.appData);
    		if ("starData" in $$props) $$invalidate(6, starData = $$props.starData);
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    		if ("results" in $$props) $$invalidate(5, results = $$props.results);
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
    		dispatch,
    		handleNewStarSystem,
    		toggleHideUninhabited
    	});

    	$$self.$inject_state = $$props => {
    		if ("appData" in $$props) $$invalidate(1, appData = $$props.appData);
    		if ("starData" in $$props) $$invalidate(6, starData = $$props.starData);
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    		if ("results" in $$props) $$invalidate(5, results = $$props.results);
    		if ("output" in $$props) $$invalidate(2, output = $$props.output);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		options,
    		appData,
    		output,
    		handleNewStarSystem,
    		toggleHideUninhabited,
    		results,
    		starData,
    		input_change_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			appData: 1,
    			starData: 6,
    			options: 0,
    			results: 5
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

    		if (/*starData*/ ctx[6] === undefined && !("starData" in props)) {
    			console.warn("<App> was created without expected prop 'starData'");
    		}

    		if (/*options*/ ctx[0] === undefined && !("options" in props)) {
    			console.warn("<App> was created without expected prop 'options'");
    		}

    		if (/*results*/ ctx[5] === undefined && !("results" in props)) {
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
    var version = "v0.6.1 Beta";
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
    		planetSizeMod: "-4"
    	},
    	{
    		key: "terrestrialPlanet",
    		type: "Terrestrial Planet",
    		number: "d6",
    		modifiers: {
    			"default": "",
    			"Red Dwarf": "-3",
    			"White Dwarf": "-3"
    		},
    		habitable: true,
    		planetSizeMod: ""
    	},
    	{
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
    		planetSizeMod: "-2"
    	},
    	{
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
    		planetSizeMod: ""
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
    var showUninhabitedDetails = false;
    var defaultOptions$1 = {
    	_comments: _comments,
    	showUninhabitedDetails: showUninhabitedDetails
    };

    let optionsString = window.localStorage.getItem('options');
    let options = optionsString ? JSON.parse(optionsString) : defaultOptions$1;

    let resultsString = window.localStorage.getItem('results');
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

    // Design choice - keep the use of window.localStorage out of the components and instead keep here together in one place.
    // TODO Is there a more idiomatic way to do this?

    app.$on('newOptions', event => {
    	window.localStorage.setItem('options', JSON.stringify(event.detail));
    });

    app.$on('newResults', event => {
    	window.localStorage.setItem('results', JSON.stringify(event.detail));
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
