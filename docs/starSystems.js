import utils from './utils.js'

const helloWorld = () => 'Hello, World!'

const getStarSystem = (data) => {
	let results = {}

	// First, we generate the star type.
	results['starType'] = getStarType(data)

	// TODO What about "Spectral Class"?

	return results
}

const getStarType = (data) => {
	return utils.randomArrayItem(data.starTypes)
}

// For CLI based results.
const printStarSystem = (results) => {
	return `
Star System: ${results.starType.type}, ${results.starType.brightness}: ${results.starType.description}
`
}

export default { helloWorld, getStarSystem, printStarSystem }
