/**
 * Helper methods for randomly selecting items.
 * Will incorporate some rules from Alien's generators.
 */

// FIXME Because the node module's package.json doesn't have type=module, nodejs fails because it's using cjs.
// import diceUtils from '../../node_modules/dice-utils/dist/dice-utils.js';
import diceUtils from './vendor/dice-utils.js';

const randomArrayItem = (arr) => {
	const idx = Math.floor(Math.random() * arr.length)
	return arr[idx]
}

/**
 * For an object with number (rollString) and modifiers (including 'default'), generate the number.
 * TODO Should this just be in starSystem.js?
 */
const rollNumberObjects = (object, modKey) => {
	// Get the star type mode, else use 'default'
	const mod = object.modifiers[modKey] ? object.modifiers[modKey] : object.modifiers['default']
	const rollString = '' + object.number + mod
	const rollResult = diceUtils.roll(rollString)
	return rollResult.total < 0 ? 0 : rollResult.total
}

const shuffleArray = (arr) => {
   for (var i = arr.length - 1; i > 0; i--) {
       var j = Math.floor(Math.random() * (i + 1));
       var temp = arr[i];
       arr[i] = arr[j];
       arr[j] = temp;
   }
   return arr;
}

const randomD6ArrayItem = (arr, mod = 0) => {
	return rollArrayItem(arr, 'd6', mod)
}

const random2D6ArrayItem = (arr, mod = 0) => {
	return rollArrayItem(arr, '2d6', mod)
}

const random3D6ArrayItem = (arr, mod = 0) => {
	return rollArrayItem(arr, '3d6', mod)
}

// The mod changes the tens die, not the total.
const randomD66ArrayItem = (arr, tensMod = 0) => {
	const total = rollD66(tensMod)
	// console.debug(`randomD66ArrayItem tensMod=${tensMod}, total=${total}`)
	for (const item of arr) {
		if (total <= item['d66']) {
			return item
		}
	}
	throw `Couldn't find a random d66 item for length ${arr.length} array.`
}

const rollArrayItem = (arr, diceString, mod = 0) => {
	let num = diceUtils.roll(diceString + ' ' + mod).total // e.g. 2d6 -2
	// console.log(`rollArrayItem, mod=${mod}, total=${num}`)
	for (const item of arr) {
		if (num <= item[diceString]) {
			return item
		}
	}
	throw `Couldn't find a random ${diceString} item for length ${arr.length} array.`
}

/**
 * From https://blog.abelotech.com/posts/number-currency-formatting-javascript/
 * @param {number} num E.g. 10000
 * @returns {string} E.g. 10,000
 */
const formatNumber = (num) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')

/**
 * Interface with dice utils function.
 * @param {*} rollString E.g. '2d6'
 * @returns {number} The total of the roll. e.g. 10.
 */
const roll = (rollString) => {
	try {
		return diceUtils.roll(rollString).total
	} catch (err) {
		throw new Error(`roll fail, rollString=${rollString}, err=${err}`)
	}
}

/**
 * Simulate a "D66" roll, with an optional modifier to tensMod.
 */
const rollD66 = (tensMod = 0) => {
	let tensDie = diceUtils.roll('d6').total + tensMod
	tensDie = tensDie < 1 ? 1 : tensDie // minimum 1.
	tensDie = tensDie > 6 ? 6 : tensDie // maximum 6.
	
	let onesDie = diceUtils.roll('d6').total
	
	// Change into a d66 number, by adding tens and ones together, then turning into a number.
	return parseInt('' + tensDie + onesDie, 10)
}

/**
 * Generate a random int between min and max, inclusive.
 */
const randomInteger = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
	formatNumber,
	random2D6ArrayItem,
	random3D6ArrayItem,
	randomArrayItem,
	randomD6ArrayItem,
	randomD66ArrayItem,
	randomInteger,
	roll,
	rollD66,
	rollNumberObjects,
	shuffleArray
}
