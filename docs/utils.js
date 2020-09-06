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

export default {
	randomArrayItem,
	rollNumberObjects
}
