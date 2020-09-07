import utils from './utils.js'

// For CLI based results.
const printStarSystem = (results) => {
	let tabs = '\t'
	return `
Star System:
${tabs}${results.starType.type}, ${results.starType.brightness}: ${results.starType.description}
Planetary Bodies (${results.systemObjects.length}):
${printSystemObjects(results.systemObjects, tabs)}
`
}

const printSystemObjects = (systemObjects, tabs) => {
	let out = []
	for (const [i, world] of systemObjects.entries()) {
        out.push(printWorldTitle(i, world, tabs))
        out.push(printWorldDetails(world, tabs + "\t"))
    }
	return out.join('\n')
}

const printWorldTitle = (i, world, tabs) => {
    const formattedI = (''+(i+1)).padStart(2, 0)
    return `${tabs}#${formattedI}: ${world.name ? world.name + ', ': ''}${world.type}${world.feature ? ', ' + world.feature : ''}${world.isMainWorld ? ', ' + world.geosphere.type : ' (Uninhabited)'}${printMoonSummary(world)}`
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

/**
 * Handle all world types: habitable, colonised.
 */
const printWorldDetails = (world, tabs) => {
    let out = []
    // console.debug(`printWorldDetails, world=${world.habitable}, name=${world.name}`)
    if (world.habitable) {
        out.push(`Planet Size: ${utils.formatNumber(world.planetSize.sizeKm)} km, ${world.planetSize.surfaceGravity} G${world.planetSize.examples ? ' (e.g. ' + world.planetSize.examples + ')' : '' }`)
    }
    out.push(`Atmosphere:  ${world.atmosphere.type}`)
    out.push(`Temperature: ${world.temperature.type}, ${world.temperature.average}°C average (${world.temperature.description})`)
    if (world.habitable) {
        out.push(`Geosphere:   ${world.geosphere.type}, ${world.geosphere.description}`)
        out.push(`Terrain:     ${world.terrain.description}`)
    }
    if (world.isMainWorld) {
        out.push(printColonyDetails(world, tabs))
    }
    const output = `${tabs}` + out.join(`\n${tabs}`)
    // console.debug(output)
    return output
}

const printColonyDetails = (world, tabs) => {
	let out = []
	let nestedTabs = tabs + '\t'
	for (const [i, colony] of world.colonies.entries()) {
        out.push(`Colony #${i+1}:
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