const printStarSystemEncounter = (results, options = {}) => {
    return `Star System Encounter: ${results.encounter.type}
Ship Reaction:         ${results.reaction.type}`
}

const printSurfaceEncounter = (results, options = {}) => {
    let out = [`Date:        ${results.date.toString()}`]
    let type = results.encounter[results.type]
    if (type) {
        out.push(`Type:        ${results.encounter[results.type]}`)
        if (results.encounter.description) {
            out.push(`Description: ${results.encounter.description}`)
        }
    } else {
        out.push(`Type:        (No Encounter)`)
    }
    return out.join('\n')
}

const printColonyEncounter = (results, options = {}) => {
    return `Colony Encounter: ${results.encounter.type}`
}

export default {
    printColonyEncounter,
    printStarSystemEncounter,
    printSurfaceEncounter
}