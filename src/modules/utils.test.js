import test from '../../node_modules/ava/index.js'
import utils from './utils.js';

const dummy_array = ['a','b','c','d','e'
]
const dummy_array_with_duplicates = ['a','b','c','d','e','e','c','a','a','a','a']

test('countUnique', t => {
    t.is(utils.countUnique(dummy_array_with_duplicates), 5, 'There should be 5 uniques: a,b,c,d,e')
})

test('formatNumber', t => {
    t.is(utils.formatNumber(1), '1', 'Must have the same.')
    t.is(utils.formatNumber(10), '10', 'Must have the same.')
    t.is(utils.formatNumber(10000), '10,000', 'Must have the correct comma.')
    t.is(utils.formatNumber(-1), '-1', 'Must be the same.')
    t.is(utils.formatNumber(-10), '-10', 'Must be the same.')
    t.is(utils.formatNumber(-1000), '-1,000', 'Must have the correct comma.')
    t.is(utils.formatNumber(1000.85), '1,000.85', 'Must have the correct comma.')
})

test('randomArrayItem', t => {
    // Crappy test without monkeypatching - run 20 times and expect they're not all the same item.
    let items = []
    for (let i = 0; i < 20; i++) {
        items.push(utils.randomArrayItem(dummy_array))
    }
    t.assert(utils.countUnique(items) > 1, 'Should be more than one unique item in this array.')
})

test.todo('rollNumberObjects for rolling number + mod')

test('rollD66', t => {

    t.pass()

    for (let i = 0; i < 20; i++) {
        let total = utils.rollD66()
        if (total < 11 || total > 66) {
            t.fail(`total ${total} is outside safe d66 bounds.`)
        }
    }

    // Test with large tensmod
    let largeTotal = utils.rollD66(20)
    if (largeTotal < 61) {
        t.fail(`With positive mod, total ${largeTotal} should be in the 6x range.`)
    }

    let smallTotal = utils.rollD66(-20)
    if (smallTotal > 16) {
        t.fail(`With negative mod, total ${smallTotal} should be in the 1x range.`)
    }

    

})