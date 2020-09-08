import test from './node_modules/ava/index.js'

test('foo', t => {
    t.pass() // failing is assumed
    // t.fail() // if you fail after pass, you still fail
})

test.skip('bar', t => {
	t.fail()
})
