import App from './components/App.svelte';

import appData from './data/appData.json'
import starData from './data/starData.json'
import defaultOptions from './data/options.json'

let optionsString = window.sessionStorage.getItem('options')
let options = optionsString ? JSON.parse(optionsString) : defaultOptions

let resultsString = window.sessionStorage.getItem('results')
let results = resultsString ? JSON.parse(resultsString) : {}

const app = new App({
	target: document.body,
	props: {
		appData: appData,
		starData: starData,
		options: options,
		results: results
	}
});

// Design choice - keep the use of window.sessionStorage out of the components and instead keep here together in one place.
// TODO Is there a more idiomatic way to do this?

app.$on('saveData', event => {
	// console.debug(`saveData ${event.detail.key}, value:`, event.detail.value)
	window.sessionStorage.setItem(event.detail.key, JSON.stringify(event.detail.value))
})

export default app;