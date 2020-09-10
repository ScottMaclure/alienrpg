import utils from './utils.js'

const createCargoRunJob = (data, options = {}) => {
    let results = {
        campaignType: 'spaceTruckers',
        jobType: getJobType(data),
        employer: utils.randomD66ArrayItem(data.spaceTruckers.employers),
        rewards: [],
        destination: utils.randomD66ArrayItem(data.spaceTruckers.destinations),
        goods: utils.randomD66ArrayItem(data.spaceTruckers.goods),
        complications: []
    }
    
    // Calculate rewards
    for (let i = 0; i < results.jobType.extraRewards; i++) {
        results.rewards.push(getUniqueD66Item(data.spaceTruckers.rewards, results.rewards))
    }

    for (let i = 0; i < results.jobType.complications; i++) {
        results.complications.push(getUniqueD66Item(data.spaceTruckers.complications, results.complications))
    }

    return results
}

const getUniqueD66Item = (d66Data, existing) => {
    let item = null
    let foundNewItem = false
    while (!foundNewItem) {
        item = utils.randomD66ArrayItem(d66Data)
        foundNewItem = !existing.includes(item)
    }
    return item
}

const createMilitaryMission = (data, options = {}) => {
    console.log('TODO createMilitaryMission')
    let results = {}
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

export default {
    createCargoRunJob,
    createExpedition,
    createMilitaryMission
}