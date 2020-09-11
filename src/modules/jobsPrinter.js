import utils from './utils.js'

const printJob = (results, options = {}) => {
    let out = []
    
    out.push(`Job Type:          ${results.jobType.type} ${results.jobName}`)
    out.push(`Destination:       ${results.jobType.destination}`)

    switch (results.campaignType) {
        case 'spaceTruckers':
            out.push(printCargoRun(results, options))
            break
        case 'colonialMarines':
            out.push(printMilitaryMission(results, options))
            break;
        case 'explorers':
            out.push(printExpedition(results, options))
            break;
        default:
            throw new Error(`Unknown campaignType=${results.campaignType}`)
    }

    if (results.complications.length > 0) {
        out.push(printComplications(results))
    }

    out.push(`Plot Twist:        ${results.plotTwist.type} (${results.plotTwist.description})`)

    if (results.totalMonetaryReward > 0) {
        out.push(`Monetary Reward:   ${results.totalMonetaryReward} UAD`)
    }
    out.push(`Extra Rewards:     ${printExtraRewards(results)}`)

    return out.join('\n')
}

const printCargoRun = (results, options) => {
    let out = []

    out.push(`Employer:          ${results.employer.type}`)
    out.push(`Destination:       ${results.destination.description}`)
    out.push(`Goods:             ${results.goods.type} (${results.goods.description})`)

    return out.join('\n')
}

const printMilitaryMission = (results, options) => {
    let out = []

    out.push(`Mission:           ${results.mission.type} (${results.mission.description})`)
    out.push(`Objective:         ${results.objective.type} (${results.objective.description})`)

    return out.join('\n')
}

const printExpedition = (results, options) => {
    let out = []

    out.push(`Sponsor:           ${results.sponsor.type}`)
    out.push(`Mission:           ${results.mission.type} (${results.mission.description})`)
    out.push(`Target Area:       ${results.targetArea.type} (${results.targetArea.description})`)

    return out.join('\n')
}

const printExtraRewards = (results) => {
    let rewardsOut = []

    if (results.rewards.length > 0) {
        for (const reward of results.rewards) { 
            if (!reward.isMonetaryReward) {
                rewardsOut.push(reward.type) 
            }
        }
    }

    if (rewardsOut.length === 0) {
        rewardsOut.push('N/A') 
    }

    return rewardsOut.join(', ')
}

const printComplications = (results) => {
    let out = []

    for (const [i, complication] of results.complications.entries()) {
        out.push(`Complication #${i+1}:   ${complication.type} (${complication.description})`)
    }

    return out.join('\n')
}

export default {
    printJob
}