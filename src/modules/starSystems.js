import utils from './utils.js'

const createStarSystem = (data, options = {}) => {
	let results = {}

	if (options.starLocation && options.starLocation !== 'ran') {
		results.starLocation = utils.findArrayItemByProperty(data.starLocations, 'key', options.starLocation)
	} else {
		// TODO Make this an option the user can choose, instead of always rolling randomly.
		results.starLocation = utils.randomArrayItem(data.starLocations)
	}

	// For frontier, pick random allegiance table for later.
	if (results.starLocation.colonyAllegianceKeys) {
		results.starLocation.colonyAllegianceKey = utils.randomArrayItem(results.starLocation.colonyAllegianceKeys)
	}
	
	results.starType = getStarType(data)

	// TODO What about "Spectral Class"?

	createSystemObjects(data, results)

	if (results.systemObjects.length === 0) {
		throw new Error('Failed to generate any system objects.')
	}

	// Pick which planetary body will be the "main" world, which has been colonized.
	let usedPlanetNames = []
	pickColonizedWorld(data, results, usedPlanetNames)
	generateWorlds(data, results)

	// Sort the system objects by temperature, instead of randomly.
	results.systemObjects.sort((a, b) => b.temperature.average - a.temperature.average)

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
		if (systemObject.enabled) {
			let numberOfObjects = utils.rollNumberObjects(systemObject, modKey)
			// console.log(`systemObject type=${systemObject.type}, numberOfObjects=${numberOfObjects}`)
			for (let i = 0; i < numberOfObjects; i++) {
				results['systemObjects'].push(createWorld(data, systemObject))
			}
		}
	}
}

/**
 * The main data for a given planetary body.
 * TODO This is where a type system would come in handy. TS or Flow?
 * @param {*} systemObject starData.json system object info.
 */
const createWorld = (data, systemObject) => {
	// optional feature
	let feature = systemObject.features ? utils.randomArrayItem(systemObject.features) : null
	
	// TODO What about making systemObject a child of world? More consistent with other data? Or should we flatten the others instead?

	let world = {
		'key': systemObject.key, // used for future reference in starData.json.
		'type': systemObject.type, // e.g. icePlanet
		'feature': feature,
		'habitable': systemObject.habitable,
		'surveyable': systemObject.surveyable,
		'isColonized': false, // will be set later for one lucky planetary body. Maybe more later.
		'isSurveyed': systemObject.surveyable && (utils.randomInteger(0, 1) === 1), // 50/50 chance, will be updated later if isColonized
		'planetSizeMod': systemObject.planetSizeMod,
		'orbitalComponents': [], // moons, satellites, etc
		'colonies': [] // fleshed out later
	}

	// If we're creating a gas giant "world", then we have to generate D6+4 moons that are actually terrestrial planets!
	if (world.key === 'gasGiant') {
		let numGasGiantMoons = utils.roll('d6+4') // p.340
		// console.debug(`Creating ${numGasGiantMoons} significant moons for gas giant world.`)
		let moonData = JSON.parse(JSON.stringify(utils.findArrayItemByProperty(data.systemObjects, 'key', 'terrestrialPlanet')))
		// Tweak the data for sizing this moon
		// TODO Should this live in data?
		moonData.type = 'Gas Giant Moon'
		moonData.planetSizeMod = systemObject.moonSizeMod
		for (let i = 0; i < numGasGiantMoons; i++) {
			let moon = createWorld(data, moonData)
			moon.isMoon = true
			moon.isGasGiantMoon = true
			world.orbitalComponents.push(moon)
		}
	}
	
	return world
}

/**
 * E.g. LV-426.
 */
const getSurveyedPlanetName = (data, usedPlanetNames) => {
	let planetName = null
	let foundUniquePlanetName = false
	while (!foundUniquePlanetName) {
		let iccCode = utils.randomArrayItem(data.iccCodes)
		let planetCode = utils.randomInteger(111, 999)
		planetName = iccCode + '-' + planetCode
		if (!usedPlanetNames.includes(planetName)) {
			foundUniquePlanetName = true
			usedPlanetNames.push(planetName) // TODO should abdicate this logic up the chain, to avoid making data changes deep down.
		}
	}
	return planetName
}

/**
 * For now, only one world in a system will be flaggged as colonized - the "main" world.
 * Also set its name, cause it's special.
 * 
 * Added support for gas giant moons.
 */
const pickColonizedWorld = (data, results, usedPlanetNames) => {
	let foundWorld = false
	while (!foundWorld) {
		let world = utils.randomArrayItem(results.systemObjects)
		if (world.key === 'gasGiant') {
			world.isSurveyed = true
			// gas giants are special, they have habitable moons!
			let moonWorld = utils.randomArrayItem(world.orbitalComponents)
			colonizeWorld(data, moonWorld)
			foundWorld = true
		} else if (world.habitable) {
			// ice, terrestrial, asteroid belts, etc
			colonizeWorld(data, world)
			foundWorld = true
		}
	}

}

const colonizeWorld = (data, world) => {
	world.isColonized = true
	world.isSurveyed = true // Can't colonize an unsurveyed planet :)
	world.name = utils.randomArrayItem(data.planetaryNames)
}

/**
 * Set properties for ALL system objects. 
 * @param {object} data starData.json
 * @param {object} results Generated system objects etc.
 */
const generateWorlds = (data, results) => {
	let surveyedPlanetNames = []
	for (let world of results.systemObjects) {
		// Clone the data to ensure uniqueness each time we generate world data.
		generateWorld(JSON.parse(JSON.stringify(data)), results, world, surveyedPlanetNames)
		if (world.key === 'gasGiant') {
			for (let gasGiantMoon of world.orbitalComponents) {
				generateWorld(JSON.parse(JSON.stringify(data)), results, gasGiantMoon, surveyedPlanetNames)
			}
		}
	}
}

/**
 * The logic for world creation.
 * If the world has been marked as habitable, do a little extra.
 * @param {object} data starData.json
 * @param {object} world See createSystemObjects()
 */
const generateWorld = (data, results, world, surveyedPlanetNames) => {

	// Every world gets a name
	world.name = world.isColonized ? 
		utils.randomArrayItem(data.planetaryNames) : 
		(world.isSurveyed ? getSurveyedPlanetName(data, surveyedPlanetNames) : null)

	world.planetSize = utils.random2D6ArrayItem(data.planetSizes, world.planetSizeMod)
	// console.debug('planetSize', world.planetSize)

	// Atmosphere and temperature are driven by the object type (key).
	switch (world.key) {
		case 'gasGiant':
			world.atmosphere = data.atmospheres[data.atmospheres.length -2] // Infiltrating
			world.temperature = utils.random2D6ArrayItem(data.temperatures, world.atmosphere.temperatureMod)
			break
		case 'icePlanet':
			world.atmosphere = utils.random2D6ArrayItem(data.atmospheres, world.planetSize.atmosphereMod)
			world.temperature = data.temperatures[0] // Frozen
			break
		case 'asteroidBelt':
			world.atmosphere = data.atmospheres[0] // Thin
			world.temperature = utils.random2D6ArrayItem(data.temperatures, world.atmosphere.temperatureMod)
			break
		case 'terrestrialPlanet':
			world.atmosphere = utils.random2D6ArrayItem(data.atmospheres, world.planetSize.atmosphereMod)
			world.temperature = utils.random2D6ArrayItem(data.temperatures, world.atmosphere.temperatureMod)
			break
		default:
			throw new Error(`Unknown world key=${world.key}, aborting.`)
	}

	// Calculate average temp after all the atmo and temp fiddling.
	world.temperature.average = utils.randomInteger(world.temperature.min, world.temperature.max)

	if (world.habitable) {
		// Geosphere mods use BOTH atmosphere and temperature mods. Tricky, hey?
		const geoMod = world.atmosphere.geosphereMod + world.temperature.geosphereMod
		world.geosphere = utils.random2D6ArrayItem(data.geospheres, geoMod)

		if (world.key === 'icePlanet') {
			world.terrain = utils.random2D6ArrayItem(data.terrains[world.key])
		} else {
			// TODO In future, would need for gas giants with planets
			const terrainMod = world.geosphere[world.key] + world.temperature[world.key]
			// console.debug(`terrain mods for ${world.key}, geosphere ${world.geosphere[world.key]} + temperature ${world.temperature[world.key]} = ${terrainMod}`)
			world.terrain = utils.randomD66ArrayItem(data.terrains[world.key], terrainMod)
		}
	}

	// Only populate worlds flagged as habitable.
	if (world.isColonized) {
	
		// console.log(`Habitating world ${world.name}....`)

		const numColonies = getNumColonies()
		const colonySizeMod = world.planetSize.colonySizeMod + world.atmosphere.colonySizeMod

		for (let i = 0; i < numColonies; i++) {

			let colony = {
				name: `Colony ${i+1}`
			}

			const colonyAllegiance = utils.random3D6ArrayItem(data.colonyAllegiances)
			colony.allegiance = colonyAllegiance[results.starLocation.colonyAllegianceKey]

			// Clone colonySize data because we modify it.
			colony.colonySize = JSON.parse(JSON.stringify(utils.random2D6ArrayItem(data.colonySizes, colonySizeMod)))
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
					newMission = utils.random2D6ArrayItem(data.colonyMissions, colonyMissionMod)
					foundUniqueMission = !usedMissionTypes.includes(newMission.type)
				}
				usedMissionTypes.push(newMission.type)
				colony.missions.push(newMission)
			}

			if (!world.isGasGiantMoon) { 
				// Generate orbital components around the planet for this colony.
				// Don't generate moons for moons :) (gas giants)
				// Clone the item from the data.
				let orbitalComponent = JSON.parse(JSON.stringify(utils.random2D6ArrayItem(data.orbitalComponents, colony.colonySize.orbitalComponenMod)))
				if (orbitalComponent.multiRoll) {
					const maxComponents = utils.roll(orbitalComponent.multiRoll)
					for (let i = 0; i < maxComponents; i++) {
						let anotherOrbitalComponent = JSON.parse(JSON.stringify(utils.random2D6ArrayItem(data.orbitalComponents, colony.colonySize.orbitalComponenMod)))
						if (anotherOrbitalComponent.multiRoll) {
							// Skip this one, get another.
							i--
						} else {
							anotherOrbitalComponent.owner = colony.name
							applyQuantityToType(anotherOrbitalComponent)
							world.orbitalComponents.push(anotherOrbitalComponent)
						}
					}
				} else {
					// Just the 1
					orbitalComponent.owner = colony.name
					applyQuantityToType(orbitalComponent)
					world.orbitalComponents.push(orbitalComponent)
				}
			}

			// Generate factions for this colony.
			const factionOptions = JSON.parse(JSON.stringify(utils.randomD6ArrayItem(data.factionOptions)))
			if (factionOptions.quantity) {
				const numFactions = utils.roll(factionOptions.quantity)
				for (let i = 0; i < numFactions; i++) {
					factionOptions.factions.push({
						strength: utils.roll('d6') // Alien RPG p337
					})
				}
			}
			colony.factions = factionOptions.factions
			
			// TODO Generate allegiance (I assume they should be unique for 2 colony setup)

			world.colonies.push(colony)
		} 

		// Generate scenario hook.
		world.scenarioHook = utils.randomD66ArrayItem(data.scenarioHooks)

	} else {
		
		// Not colonised stuff
		
		// Moons
		if (world.key === 'gasGiant') {	
			// TODO Gas giant moons, which are themselves terrestrial planets.
		} else {
			let moonComponent = {"type":  "Moons", "quantity": "d3-1", "isMoon": true}
			applyQuantityToType(moonComponent)
			world.orbitalComponents.push(moonComponent)
		}

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

export default { 
	createStarSystem
}
