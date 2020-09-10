import utils from './utils.js'

const spaceIndent = '  '

const defaultOptions = {
	showSurveyedDetails: true
}

// For CLI based results.
const printStarSystem = (results, options = defaultOptions) => {
	let tabs = spaceIndent
	return `Star System:
${tabs}Location: ${results.starLocation.name} (${results.starLocation.colonyAllegianceKey})
${tabs}Type:     ${results.starType.type}, ${results.starType.brightness}: ${results.starType.description}
Planetary Bodies (${results.systemObjects.length}):
${printSystemObjects(results.systemObjects, tabs, options)}
`
}

const printSystemObjects = (systemObjects, tabs, options) => {
	let out = []
	for (const [i, world] of systemObjects.entries()) {
		out.push(printWorldTitle(i, world, tabs))
		if (world.isColonized || (world.isSurveyed && options.showSurveyedDetails)) {
			out.push(printWorldDetails(world, options, `${tabs}${spaceIndent}`))
		}
    }
	return out.join('\n')
}

const printWorldTitle = (i, world, tabs) => {
	let out = [`${tabs}#${(''+(i+1)).padStart(2, 0)}: `]
	out.push(world.type)
	out.push(world.name ? ' ' + `"${world.name}"`: ' (Unsurveyed)')
	out.push(world.feature ? ', ' + world.feature : '')
	out.push(world.isColonized ? ', ' + world.geosphere.type : '')
	out.push(printMoonSummary(world))
	return out.join('')
}

const printMoonSummary = (world) => {
	let moonCount = 0
	for (const orbitalComponent of world.orbitalComponents) {
		if (orbitalComponent.isMoon) {
			// Default 1 for gas giant moons
			moonCount = moonCount + (orbitalComponent.quantityAmount || 1)
		}
	}
	if (moonCount == 0) { return '' }
	if (moonCount == 1) { return `, ${moonCount} moon` }
	return `, ${moonCount} moons`
}

/**
 * Handle all world types: habitable, colonised.
 */
const printWorldDetails = (world, options, tabs) => {
	const spaces = '     '
	let out = []
	
	// TODO How about only showing surveyed details?
	if (world.isSurveyed && options.showSurveyedDetails) {
		// console.debug(`printWorldDetails, world=${world.habitable}, name=${world.name}`)
		if (world.habitable) {
			out.push(`${tabs}Planet Size:  ${utils.formatNumber(world.planetSize.sizeKm)} km, ${world.planetSize.surfaceGravity} G${world.planetSize.examples ? ' (e.g. ' + world.planetSize.examples + ')' : '' }`)
		}
		out.push(`${tabs}Atmosphere:   ${world.atmosphere.type}`)
		out.push(`${tabs}Temperature:  ${world.temperature.type}, ${world.temperature.average}°C average (e.g. ${world.temperature.description})`)
		if (world.habitable) {
			out.push(`${tabs}Geosphere:    ${world.geosphere.type}, ${world.geosphere.description}`)
			out.push(`${tabs}Terrain:      ${world.terrain.description}`)
		}
	}

	if (world.isColonized) {
		out.push(printOrbitalComponents(world.orbitalComponents, tabs, spaces))
		out.push(`${tabs}Hook:         ${world.scenarioHook.description}`)
		out.push(printColonyDetails(world, tabs, spaces))
	}

    return out.join(`\n`)
}

const printColonyDetails = (world, tabs) => {
	const spaces = '   '
	let out = []
	let nestedTabs = tabs + spaceIndent
	for (const [i, colony] of world.colonies.entries()) {
        out.push(`${tabs}Colony #${i+1}:`)
		out.push(`${nestedTabs}Allegiance: ${colony.allegiance}`)
		out.push(`${nestedTabs}Size:       ${colony.colonySize.size}, ${utils.formatNumber(colony.colonySize.populationAmount)} pax`)
		out.push(printColonyMissions(colony.missions, nestedTabs, spaces))
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

const printOrbitalComponents = (orbitalComponents, tabs, spaces) => {
	let out = []
	for (const orbitalComponent of orbitalComponents) {
		out.push(`${orbitalComponent.type}${orbitalComponent.owner ? ' (' + orbitalComponent.owner + ')' : ''}`)
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