import utils from './utils.js'

const createCargoRunJob = (data, options = {}) => {
    let results = {
        campaignType: 'spaceTruckers',
        jobType: getJobType(data),
        employer: utils.randomD66ArrayItem(data.spaceTruckers.employers),
        rewards: [],
        destination: utils.randomD66ArrayItem(data.spaceTruckers.destinations),
        goods: utils.randomD66ArrayItem(data.spaceTruckers.goods),
        complications: [],
        totalMonetaryReward: 0
    }
    
    // Calculate rewards
    for (let i = 0; i < results.jobType.extraRewards; i++) {
        results.rewards.push(utils.randomUniqueD66Item(data.spaceTruckers.rewards, results.rewards))
    }
    // Calc total reward amount
    results.totalMonetaryReward = calculateTotalMonetaryReward(results)

    addComplications(results, data.spaceTruckers.complications)

    return results
}

const createMilitaryMission = (data, options = {}) => {
    let results = {
        campaignType: 'colonialMarines',
        jobType: getJobType(data),
        rewards: [],
        mission: utils.randomD66ArrayItem(data.colonialMarines.missions),
        objective: utils.randomD66ArrayItem(data.colonialMarines.objectives),
        complications: [],
        totalMonetaryReward: 0
    }

    // Rewards
    for (let i = 0; i < results.jobType.extraRewards; i++) {
        results.rewards.push(utils.randomUniqueD66Item(data.colonialMarines.rewards, results.rewards))
    }
    // Calc total reward amount
    results.totalMonetaryReward = calculateTotalMonetaryReward(results)

    addComplications(results, data.colonialMarines.complications)

    return results
}

const createExpedition = (data, options = {}) => {
    console.log('TODO createExpedition')
    let results = {}
    return results
}

const getJobType = (data) => {
    let jobType = utils.randomD66ArrayItem(data.jobTypes)
    // Process baseReward
    jobType.baseRewardAmount = utils.roll(jobType.baseReward)
    return jobType
}

const calculateTotalMonetaryReward = (results) => {
    let total = 0

    switch (results.campaignType) {
        case 'spaceTruckers':
            total += results.jobType.baseRewardAmount
            break
        case 'colonialMarines':
            total += 0 // No base reward by default for marines.
            break
        default:
            throw new Error(`Unknown campaignType=${results.campaignType}`)   
    }

    for (const extraReward of results.rewards) {
        if (extraReward.isMonetaryReward) {
            // TODO This is an assumption on my part, add another roll of the base amount.
            total += parseInt(utils.roll(results.jobType.baseReward), 10)
        }
    }

    return total
}

const addComplications = (results, complicationsData) => {
    for (let i = 0; i < results.jobType.complications; i++) {
        results.complications.push(utils.randomUniqueD66Item(complicationsData, results.complications))
    }
}

export default {
    createCargoRunJob,
    createExpedition,
    createMilitaryMission
}