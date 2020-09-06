/**
 * This will be used to develop the generator code before the UI (docs/index.html).
 */

import fs from 'fs'

import starSystems from './docs/starSystems.js'

let starData = JSON.parse(fs.readFileSync('./docs/starData.json', 'utf-8'))

let results = starSystems.getStarSystem(starData)

console.log('Results:')
console.log(results)

console.log(starSystems.printStarSystem(results))
