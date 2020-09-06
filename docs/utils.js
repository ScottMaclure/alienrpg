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

const roll = (rollString) => diceUtils.roll(rollString).total

export default {
	randomArrayItem,
	roll,
	rollNumberObjects,
	shuffleArray
}
