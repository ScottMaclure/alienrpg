import utils from './utils.js'

// For CLI based results.
const printStarSystem = (results) => {
	let tabs = '\t'
	return `
Star System:
${tabs}Location: ${results.starLocation.name} (${results.starLocation.colonyAllegianceKey})
${tabs}Type:     ${results.starType.type}, ${results.starType.brightness}: ${results.starType.description}
Planetary Bodies (${results.systemObjects.length}):
${printSystemObjects(results.systemObjects, tabs)}
`
}

const printSystemObjects = (systemObjects, tabs) => {
	let out = []
	for (const [i, world] of systemObjects.entries()) {
        out.push(printWorldTitle(i, world, tabs))
        out.push(printWorldDetails(world, `${tabs}\t`))
    }
	return out.join('\n')
}

const printWorldTitle = (i, world, tabs) => {
    const formattedI = (''+(i+1)).padStart(2, 0)
    return `${tabs}#${formattedI}: ${world.name ? world.name + ', ': ''}${world.type}${world.feature ? ', ' + world.feature : ''}${world.isColonized ? ', ' + world.geosphere.type : ' (Uninhabited)'}${printMoonSummary(world)}`
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
        out.push(`${tabs}Planet Size: ${utils.formatNumber(world.planetSize.sizeKm)} km, ${world.planetSize.surfaceGravity} G${world.planetSize.examples ? ' (e.g. ' + world.planetSize.examples + ')' : '' }`)
    }
    out.push(`${tabs}Atmosphere:  ${world.atmosphere.type}`)
    out.push(`${tabs}Temperature: ${world.temperature.type}, ${world.temperature.average}°C average (e.g. ${world.temperature.description})`)
    if (world.habitable) {
        out.push(`${tabs}Geosphere:   ${world.geosphere.type}, ${world.geosphere.description}`)
        out.push(`${tabs}Terrain:     ${world.terrain.description}`)
    }
    if (world.isColonized) {
		out.push(`${tabs}Hook:        ${world.scenarioHook.description}`)
        out.push(printColonyDetails(world, tabs))
    }
    const output = out.join(`\n`)
    // console.debug(output)
    return output
}

const printColonyDetails = (world, tabs) => {
	let out = []
	let nestedTabs = tabs + '\t'
	const spaces = '   '
	for (const [i, colony] of world.colonies.entries()) {
        out.push(`${tabs}Colony #${i+1}:`)
		out.push(`${nestedTabs}Allegiance: ${colony.allegiance}`)
		out.push(`${nestedTabs}Size:       ${colony.colonySize.size}, ${utils.formatNumber(colony.colonySize.populationAmount)} pax`)
		out.push(printColonyMissions(colony.missions, nestedTabs, spaces))
		out.push(printColonyOrbitalComponents(colony.orbitalComponents, nestedTabs, spaces))
		out.push(printColonyFactions(colony.factions, nestedTabs, spaces))
	}
	return out.join('\n')
}

const printColonyMissions = (missions, tabs, spaces) => {
	let out = []
	for (const [i, mission] of missions.entries()) {
		out.push(`${mission.type}`)
	}
	return `${tabs}Missions:${spaces}` + out.join(', ')
}

const printColonyOrbitalComponents = (orbitalComponents, tabs, spaces) => {
	let out = []
	for (const [i, orbitalComponent] of orbitalComponents.entries()) {
		out.push(`${orbitalComponent.type}`)
	}
	return `${tabs}Orbitals:${spaces}` + out.join(', ')
}

const strengthMap = ["weak", "balanced", "balanced", "competing", "competing", "dominant"] // d6 roll
const printColonyFactions = (factions, tabs, spaces) => {
	
	let factionOutputs = {
		'weak': 0,
		'balanced': 0,
		'competing': 0,
		'dominant': 0
	}

	for (const faction of factions) {
		factionOutputs[strengthMap[faction.strength-1]]++
	}

	let out = []
	for (const [strength, qty] of Object.entries(factionOutputs)) {
		if (qty > 0) {
			out.push(`${qty} ${strength}`)
		}
	}

	return `${tabs}Factions:${spaces}` + out.join(', ')
}

export default { 
    printStarSystem
}