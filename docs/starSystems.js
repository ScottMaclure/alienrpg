import utils from './utils.js'

const helloWorld = () => 'Hello, World!'

const createStarSystem = (data) => {
	let results = {}

	// First, we generate the star type.
	results['starType'] = getStarType(data)

	// TODO What about "Spectral Class"?

	createSystemObjects(data, results)

	// Pick which planetary body will be the "main" world, which has been colonized.
	let usedPlanetNames = [''] // trick for while loop later.
	let world = pickMainWorld(data, results, usedPlanetNames)

	// Generate details for this world.
	createWorld(data, world)

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
	for (const systemObject of data.systemObjects) {
		let numberOfObjects = utils.rollNumberObjects(systemObject, modKey)
		// console.log(`systemObject type=${systemObject.type}, numberOfObjects=${numberOfObjects}`)
		for (let i = 0; i < numberOfObjects; i++) {
			// optional feature
			let feature = systemObject.features ? utils.randomArrayItem(systemObject.features) : null
			// The main data for a given planetary body.
			// TODO This is where a type system would come in handy.
			results['systemObjects'].push({
				'type': systemObject.type,
				'feature': feature,
				'weight': utils.roll(systemObject.weightRoll),
				'habitable': systemObject.habitable,
				'isMainWorld': false, // will be set later for one lucky planetary body.
				'planetSizeMod': systemObject.planetSizeMod
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

const pickMainWorld = (data, results, usedPlanetNames) => {

	// Find the main world
	let mainWorld = null
	let foundMainWorld = false
	while (!foundMainWorld) {
		mainWorld = utils.randomArrayItem(results.systemObjects)
		if (mainWorld.habitable) {
			mainWorld.isMainWorld = true
			// generate a unique planet name
			mainWorld.name = getUniquePlanetName(data, usedPlanetNames)
			foundMainWorld = true
		}
	}

	return mainWorld
}

const createWorld = (data, world) => {

	world.planetSize = utils.random2d6ArrayItem(data.planetSizes, world.planetSizeMod)
	// console.debug('planetSize', world.planetSize)

	world.atmosphere = utils.random2d6ArrayItem(data.atmospheres, world.planetSize.atmosphereMod)
	// console.debug('atmosphere', world.atmosphere)

	world.temperature = utils.random2d6ArrayItem(data.temperatures, world.atmosphere.temperatureMod)

	// Geosphere mods use BOTH atmosphere and temperature mods. Tricky, hey?
	const geoMod = world.planetSize.atmosphereMod + world.atmosphere.temperatureMod
	// console.debug(`atmosphereMod ${world.planetSize.atmosphereMod} + temperatureMod ${world.atmosphere.temperatureMod} = geoMod ${geoMod}`)
	world.geosphere = utils.random2d6ArrayItem(data.geospheres, geoMod)

}

// For CLI based results.
const printStarSystem = (results) => {
	let tabs = '\t'
	return `
Star System:
${tabs}${results.starType.type}, ${results.starType.brightness}: ${results.starType.description}
Planetary Bodies (${results.systemObjects.length}):
${printPlanetaryBodies(results.systemObjects, tabs)}
`
}

const printPlanetaryBodies = (systemObjects, tabs) => {
	let out = []
	for (const [i, body] of systemObjects.entries()) {
		out.push(`${tabs}#${i+1}: ${body.type}${body.feature ? ', ' + body.feature : ''}${body.isMainWorld ? ', ' + body.geosphere.type : ' (Uninhabited)'}`)
		if (body.isMainWorld === true) {
			out.push(printWorldDetails(body, tabs + "\t"))
		}
	}
	return out.join('\n')
}

const printWorldDetails = (world, tabs) => {
	// console.debug('printWorldDetails, world:', world)
	return `${tabs}Planet size: ${utils.formatNumber(world.planetSize.sizeKm)} km
${tabs}Surface gravity: ${world.planetSize.surfaceGravity} G${world.planetSize.examples ? ' (e.g. ' + world.planetSize.examples + ')' : '' }
${tabs}Atmosphere: ${world.atmosphere.type}
${tabs}Temperature: ${world.temperature.type}, up to ${world.temperature.average}°C (${world.temperature.description})
${tabs}Geosphere: ${world.geosphere.type}. ${world.geosphere.description}`
}

export default { helloWorld, createStarSystem, printStarSystem }
