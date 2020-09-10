import utils from './utils.js'

const printJob = (results, options = {}) => {
    let out = []
    
    out.push(`Job Type:          ${results.jobType.type}`)
    out.push(`Destination:       ${results.jobType.destination}`)
    out.push(`Base Reward:       ${results.jobType.baseRewardAmount} UAD`)

    switch (results.campaignType) {
        case 'spaceTruckers':
            out.push(printCargoRun(results, options))
            break
        default:
            throw new Error(`Unknown campaignType=${results.campaignType}`)
    }

    return out.join('\n')
}

const printCargoRun = (results, options) => {
    let out = []
    
    let rewardsOut = []
    if (results.rewards.length > 0) {
        for (const reward of results.rewards) { 
            rewardsOut.push(reward.type) 
        }
    } else {
        rewardsOut.push("N/A") 
    }
    out.push(`Extra Rewards:     ${rewardsOut.join(', ')}`)

    out.push(`Employer:          ${results.employer.type}`)
    out.push(`Destination:       ${results.destination.description}`)
    out.push(`Goods:             ${results.goods.name} (${results.goods.description})`)
    
    return out.join('\n')
}

export default {
    printJob
}