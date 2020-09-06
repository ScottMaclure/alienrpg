import utils from './utils.js'

const helloWorld = () => 'Hello, World!'

const createStarSystem = (data) => {
	let results = {}

	// First, we generate the star type.
	results['starType'] = getStarType(data)

	// TODO What about "Spectral Class"?

	createSystemObjects(data, results)

	createMainWorld(data, results)

	// TODO Sort the system objects by temperature, instead of randomly. Perhaps have a weighting by type, plus random amount, then sort.
	// results.systemObjects = utils.shuffleArray(results.systemObjects)
	results.systemObjects.sort((a, b) => a.weight - b.weight)

	return results
}

const getStarType = (data) => {
	return utils.randomArrayItem(data.starTypes)
}

// Generate random amount of system objects for this system, based on the star type.
const createSystemObjects = (data, results) => {
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
				'feature': feature,
				'weight': utils.roll(systemObject.weightRoll),
				'habitable': systemObject.habitable,
				'isMainWorld': false // will be set later for one lucky planetary body.
			})
		}
	}
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

const createMainWorld = (data, results) => {

	// Find the main world
	let mainWorld = null
	let foundMainWorld = false
	while (!foundMainWorld) {
		mainWorld = utils.randomArrayItem(results.systemObjects)
		foundMainWorld = mainWorld.habitable
		mainWorld.isMainWorld = true
	}

	mainWorld.planetSize = utils.random2d6ArrayItem(data.planetSizes)

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
		out.push(`\t#${i+1}: ${body.isMainWorld ? '(main)' : ''} ${body.name}, ${body.type}${body.feature ? ', ' + body.feature : ''}`)
		if (body.isMainWorld) {
			out.push(printMainWorldDetails(body))
		}
	}
	return out.join('\n')
}

const printMainWorldDetails = (mainWorld) => {
	return `\t\tPlanet size: ${utils.formatNumber(mainWorld.planetSize.sizeKm)} km, surface gravity: ${mainWorld.planetSize.surfaceGravity} G${mainWorld.planetSize.examples ? ' (e.g. ' + mainWorld.planetSize.examples + ')' : '' }`
}

export default { helloWorld, createStarSystem, printStarSystem }
