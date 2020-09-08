/**
 * This will be used to develop the generator code before the UI (docs/index.html).
 */

import fs from 'fs'

import starSystems from './src/modules/starSystems.js'
import starSystemPrinter from './src/modules/starSystemPrinter.js'

// TODO ES6 Module loader for nodejs cli that handles json?
let starData = JSON.parse(fs.readFileSync('./src/data/starData.json', 'utf-8'))

// for (let i = 0; i < 20; i++) {
    // Clone data for future repeated generation.
    let results = starSystems.createStarSystem(JSON.parse(JSON.stringify(starData)))
    // console.log(results) // Debug
    console.log(starSystemPrinter.printStarSystem(results))
// }

// console.log('Done')
