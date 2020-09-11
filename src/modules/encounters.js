import utils from './utils.js'

const createStarSystemEncounter = (data, tensMod = 0) => {
    return {
        date: new Date(),
        encounter: utils.randomD66ArrayItem(data.starSystemEncounters, tensMod),
        reaction: utils.random2D6ArrayItem(data.shipReactions)
    }
}

const createSurfaceEncounter = (data, type) => {
    return {
        date: new Date(),
        type: type,
        encounter: utils.random3D6ArrayItem(data.surfaceEncounters)
    }
}

const createColonyEncounter = (data, tensMod = 0) => {
    return {
        date: new Date(),
        encounter: utils.randomD66ArrayItem(data.colonyEncounters, tensMod)
    }
}

export default {
    createColonyEncounter,
    createStarSystemEncounter,
    createSurfaceEncounter
}