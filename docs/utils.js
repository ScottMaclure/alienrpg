/**
 * Helper methods for randomly selecting items.
 * Will incorporate some rules from Alien's generators.
 */

import diceUtils from './dice-utils.js';

const randomArrayItem = (arr) => {
	const idx = Math.floor(Math.random() * arr.length)
	return arr[idx]
}

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

const random2d6ArrayItem = (arr, mod) => {
	let num = diceUtils.roll('2d6 ' + mod).total // e.g. 2d6 -2
	// console.log(`random2d6ArrayItem, mod=${mod}, total=${num}`)
	for (const item of arr) {
		if (num <= item['2d6']) {
			return item
		}
	}
	throw `Couldn't find a random 2d6 item for length ${arr.length} array.`
}

// The mod changes the tens die, not the total.
const randomD66ArrayItem = (arr, tensMod) => {
	const total = rollD66(tensMod)
	for (const item of arr) {
		if (total <= item['d66']) {
			return item
		}
	}
	throw `Couldn't find a random d66 item for length ${arr.length} array.`
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
const roll = (rollString) => diceUtils.roll(rollString).total

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

export default {
	formatNumber,
	random2d6ArrayItem,
	randomArrayItem,
	randomD66ArrayItem,
	roll,
	rollD66,
	rollNumberObjects,
	shuffleArray
}
