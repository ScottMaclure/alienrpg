import utils from './utils.js'

const helloWorld = () => 'Hello, World!'

const getStarSystem = (data) => {
	let results = {}

	// First, we generate the star type.
	results['starType'] = getStarType(data)

	// TODO What about "Spectral Class"?

	// Generate random amount of  system objects for this system, based on the star type.
	results['systemObjects'] = []
	let modKey = results['starType'].type // will look up the modifier by this key, else use 'default'.
	let usedPlanetNames = [''] // trick for while loop later.
	for (const systemObject of data.systemObjects) {
		let numberOfObjects = utils.rollNumberObjects(systemObject, modKey)
		console.log(`systemObject type=${systemObject.type}, numberOfObjects=${numberOfObjects}`)
		for (let i = 0; i < numberOfObjects; i++) {
			// generate a unique planet name
			let planetName = getUniquePlanetName(data, usedPlanetNames)
			// optional feature
			let feature = systemObject.features ? utils.randomArrayItem(systemObject.features) : null
			results['systemObjects'].push({
				'name': planetName,
				'type': systemObject.type,
				'feature': feature
			})
		}
	}

	// FIXME Mix up the planetary bodies - not sure what's best here?
	results.systemObjects = utils.shuffleArray(results.systemObjects)

	return results
}

const getStarType = (data) => {
	return utils.randomArrayItem(data.starTypes)
}

const getUniquePlanetName = (data, usedPlanetNames) => {
	let planetName = ''
	while (usedPlanetNames.includes(planetName)) {
		let iccCode = utils.randomArrayItem(data.iccCodes)
		let planetaryName = utils.randomArrayItem(data.planetaryNames)
		planetName = iccCode + '-' + planetaryName
	}
	return planetName
}

// For CLI based results.
const printStarSystem = (results) => {
	return `
Star System:
\t${results.starType.type}, ${results.starType.brightness}: ${results.starType.description}
Planetary Bodies (${results.systemObjects.length}):
${printPlanetaryBodies(results.systemObjects)}
`
}

const printPlanetaryBodies = (systemObjects) => {
	let out = []
	for (const [i, body] of systemObjects.entries()) {
		out.push(`\t#${i+1}: ${body.name}, ${body.type}${body.feature ? ', ' + body.feature : ''}`)
	}
	return out.join('\n')
}

export default { helloWorld, getStarSystem, printStarSystem }
