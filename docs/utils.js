/**
 * Helper methods for randomly selecting items.
 * Will incorporate some rules from Alien's generators.
 */

const randomArrayItem = (arr) => {
	const idx = Math.floor(Math.random() * arr.length)
	return arr[idx]
}

export default {
	randomArrayItem
}
