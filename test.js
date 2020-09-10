import test from './node_modules/ava/index.js'
import fs from 'fs'
import starSystems from './src/modules/starSystems.js'

let defaultOptions = JSON.parse(fs.readFileSync('./src/data/options.json', 'utf-8'))
let starData = JSON.parse(fs.readFileSync('./src/data/starData.json', 'utf-8'))

test('foo', t => {
    t.pass() // failing is assumed
    // t.fail() // if you fail after pass, you still fail
})

test('generate 50 systems', t => {
    let results = []
    for (let i = 0; i < 50; i++) {
        results.push(starSystems.createStarSystem(JSON.parse(JSON.stringify(starData)), defaultOptions))
    }
    t.is(results.length, 50, 'Should have generated 50 systems without crashing.')
})

test.skip('bar', t => {
	t.fail()
})
