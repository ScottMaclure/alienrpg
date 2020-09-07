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
				'key': systemObject.key,
				'type': systemObject.type,
				'feature': feature,
				'weight': utils.roll(systemObject.weightRoll),
				'habitable': systemObject.habitable,
				'isMainWorld': false, // will be set later for one lucky planetary body.
				'planetSizeMod': systemObject.planetSizeMod,
				'colonies': []
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

/**
 * The logic for world creation.
 * @param {object} data starData.json
 * @param {object} world See createSystemObjects()
 */
const createWorld = (data, world) => {

	const worldTypeKey = world.key // e.g. terrestrialPlanet, icePlanet

	world.planetSize = utils.random2d6ArrayItem(data.planetSizes, world.planetSizeMod)
	// console.debug('planetSize', world.planetSize)

	world.atmosphere = utils.random2d6ArrayItem(data.atmospheres, world.planetSize.atmosphereMod)
	// console.debug('atmosphere', world.atmosphere)

	// FIXME Ice planet is broken, you can get hot/burning temps easily.
	world.temperature = utils.random2d6ArrayItem(data.temperatures, world.atmosphere.temperatureMod)

	// Geosphere mods use BOTH atmosphere and temperature mods. Tricky, hey?
	const geoMod = world.atmosphere.geosphereMod + world.temperature.geosphereMod
	world.geosphere = utils.random2d6ArrayItem(data.geospheres, geoMod)
	
	// Terrain mods use both geosphere and temperature.
	const terrainMod = world.geosphere[worldTypeKey] + world.temperature[worldTypeKey]
	// console.debug(`terrain mods for ${worldTypeKey}, geosphere ${world.geosphere[worldTypeKey]} + temperature ${world.temperature[worldTypeKey]} = ${terrainMod}`)
	world.terrain = utils.randomD66ArrayItem(data.terrains[worldTypeKey], terrainMod)

	// TODO In future, createWorld may be used for uninhabited worlds in the system.
	if (world.habitable) {

		const numColonies = getNumColonies()
		const colonySizeMod = world.planetSize.colonySizeMod + world.atmosphere.colonySizeMod

		for (let i = 0; i < numColonies; i++) {

			let colony = {}

			// Clone colonySize data because we modify it.
			colony.colonySize = JSON.parse(JSON.stringify(utils.random2d6ArrayItem(data.colonySizes, colonySizeMod)))
			colony.colonySize.populationAmount = utils.roll(colony.colonySize.population)
			// Missions data can be either a number (as string) or a rollString.
			// console.debug(`missions=${colony.colonySize.missions}`)
			if (colony.colonySize.missions.toLowerCase().includes('d')) {
				colony.colonySize.missionsAmount = utils.roll(colony.colonySize.missions)
			} else {
				colony.colonySize.missionsAmount = parseInt(colony.colonySize.missions)
			}

			// Generate unique missions
			colony.missions = []
			const colonyMissionMod = world.atmosphere.colonyMissionMod + colony.colonySize.colonyMissionMod
			let usedMissionTypes = []
			for (let i = 0; i < colony.colonySize.missionsAmount; i++) {
				let newMission = ''
				let foundUniqueMission = false
				while (!foundUniqueMission) {
					newMission = utils.random2d6ArrayItem(data.colonyMissions, colonyMissionMod)
					foundUniqueMission = !usedMissionTypes.includes(newMission.type)
				}
				usedMissionTypes.push(newMission.type)
				colony.missions.push(newMission)
			}

			// Generate orbital components for this planet.
			colony.orbitalComponents = []
			// Clone the item from the data.
			let orbitalComponent = JSON.parse(JSON.stringify(utils.random2d6ArrayItem(data.orbitalComponents, colony.colonySize.orbitalComponenMod)))
			if (orbitalComponent.multiRoll) {
				const maxComponents = utils.roll(orbitalComponent.multiRoll)
				for (let i = 0; i < maxComponents; i++) {
					let anotherOrbitalComponent = utils.random2d6ArrayItem(data.orbitalComponents, colony.colonySize.orbitalComponenMod) 
					if (anotherOrbitalComponent.multiRoll) {
						// Skip this one, get another.
						i--
					} else {
						applyQuantityToType(anotherOrbitalComponent)
						colony.orbitalComponents.push(anotherOrbitalComponent)
					}
				}
			} else {
				// Just the 1
				applyQuantityToType(orbitalComponent)
				colony.orbitalComponents.push(orbitalComponent)
			}
			
			

			// TODO Generate factions

			// TODO Generate allegiance (I assume they should be unique for 2 colony setup)

			world.colonies.push(colony)
		}


		// TODO Generate scenario hook.

	}

}

const applyQuantityToType = (obj) => {
	if (obj.quantity) {
		obj.quantityAmount = utils.roll(obj.quantity) // set the number for future reference
		obj.type =  obj.quantityAmount + ' ' + obj.type
	}
}

/**
 * Roll 2D6, with 10 indicating two competing colonies on the same world.
 */
const getNumColonies = () => utils.roll('2d6') >= 10 ? 2 : 1

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
	for (const [i, world] of systemObjects.entries()) {
		out.push(`${tabs}#${i+1}: ${world.type}${world.feature ? ', ' + world.feature : ''}${world.isMainWorld ? ', ' + world.geosphere.type : ' (Uninhabited)'}${printMoonSummary(world)}`)
		if (world.isMainWorld === true) {
			out.push(printWorldDetails(world, tabs + "\t"))
		}
	}
	return out.join('\n')
}

const printMoonSummary = (world) => {
	if (!world.habitable) { return '' }
	let moonCount = 0
	for (const colony of world.colonies) {
		for (const orbitalComponent of colony.orbitalComponents) {
			if (orbitalComponent.isMoon) {
				moonCount = moonCount + orbitalComponent.quantityAmount
			}
		}
	}
	if (moonCount == 0) { return '' }
	if (moonCount == 1) { return `, ${moonCount} moon` }
	return `, ${moonCount} moons`
}

const printWorldDetails = (world, tabs) => {
	// console.debug('printWorldDetails, world:', world)
	return `${tabs}Planet Size: ${utils.formatNumber(world.planetSize.sizeKm)} km, ${world.planetSize.surfaceGravity} G${world.planetSize.examples ? ' (e.g. ' + world.planetSize.examples + ')' : '' }
${tabs}Atmosphere:  ${world.atmosphere.type}
${tabs}Temperature: ${world.temperature.type}, up to ${world.temperature.average}°C (${world.temperature.description})
${tabs}Geosphere:   ${world.geosphere.type}. ${world.geosphere.description}
${tabs}Terrain:     ${world.terrain.description}${world.habitable ? printColonyDetails(world, tabs) : ''}`
}

const printColonyDetails = (world, tabs) => {
	let out = []
	let nestedTabs = tabs + '\t'
	for (const [i, colony] of world.colonies.entries()) {
		out.push(`
${tabs}Colony #${i+1}:
${nestedTabs}Colony Size: ${colony.colonySize.size}, ${utils.formatNumber(colony.colonySize.populationAmount)} pax (Missions: ${colony.colonySize.missionsAmount})${printColonyMissions(colony.missions, nestedTabs)}${printColonyOrbitalComponent(colony.orbitalComponents, nestedTabs)}`)
	}
	return out.join('')
}

const printColonyMissions = (missions, tabs) => {
	let out = []
	for (const [i, mission] of missions.entries()) {
		out.push(`\n${tabs}Mission #${i+1}: ${mission.type}`)
	}
	return out.join('')
}

const printColonyOrbitalComponent = (orbitalComponents, tabs) => {
	let out = []
	for (const [i, orbitalComponent] of orbitalComponents.entries()) {
		out.push(`\n${tabs}Orbital #${i+1}: ${orbitalComponent.type}`)
	}
	return out.join('')
}

export default { 
	createStarSystem, 
	helloWorld, 
	printStarSystem 
}
