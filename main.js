/**
 * This will be used to develop the generator code before the UI (docs/index.html).
 */

import fs from 'fs'

import starSystems from './docs/starSystems.js'
import starSystemPrinter from './docs/starSystemPrinter.js'

let starData = JSON.parse(fs.readFileSync('./docs/starData.json', 'utf-8'))

let results = starSystems.createStarSystem(starData)

// console.log(results) // Debug

console.log(starSystemPrinter.printStarSystem(results))
