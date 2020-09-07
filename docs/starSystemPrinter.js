import utils from './utils.js'

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
    printStarSystem
}