/**
 * This will be used to develop the generator code before the UI (docs/index.html).
 */

import fs from 'fs'

import starSystems from './src/modules/starSystems.js'
import starSystemPrinter from './src/modules/starSystemPrinter.js'

import jobs from './src/modules/jobs.js'
import jobsPrinter from './src/modules/jobsPrinter.js'

// TODO ES6 Module loader for nodejs cli that handles json?
let defaultOptions = JSON.parse(fs.readFileSync('./src/data/options.json', 'utf-8'))
let starData = JSON.parse(fs.readFileSync('./src/data/starData.json', 'utf-8'))
let jobsData = JSON.parse(fs.readFileSync('./src/data/jobsData.json', 'utf-8'))

// Star System
// for (let i = 0; i < 20; i++) {
    // Clone data for future repeated generation.
    // let results = starSystems.createStarSystem(JSON.parse(JSON.stringify(starData)), defaultOptions)
    // console.log(results) // Debug
    // console.log(starSystemPrinter.printStarSystem(results, defaultOptions))
// }

// Cargo Run Job (Space Truckers campaign)
let results = jobs.createCargoRunJob(JSON.parse(JSON.stringify(jobsData)), defaultOptions)
console.log(jobsPrinter.printJob(results, defaultOptions))

// console.log('Done')
