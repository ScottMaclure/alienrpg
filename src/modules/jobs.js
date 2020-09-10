import utils from './utils.js'

const createCargoRunJob = (data, options = {}) => {
    let results = {
        campaignType: 'spaceTruckers',
        jobType: getJobType(data),
        employer: utils.randomD66ArrayItem(data.spaceTruckers.employers),
        rewards: [],
        destination: utils.randomD66ArrayItem(data.spaceTruckers.destinations),
        goods: utils.randomD66ArrayItem(data.spaceTruckers.goods),
    }
    // Calculate rewards
    for (let i = 0; i < results.jobType.extraRewards; i++) {
        results.rewards.push(getUniqueReward(data, results.rewards))
    }
    return results
}

const getUniqueReward = (data, rewards) => {
    let reward = null
    let foundNewReward = false
    while (!foundNewReward) {
        reward = utils.randomD66ArrayItem(data.spaceTruckers.rewards)
        foundNewReward = !rewards.includes(reward)
    }
    return reward
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