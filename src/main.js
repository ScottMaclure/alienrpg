import App from './components/App.svelte';

import appData from './data/appData.json'
import starData from './data/starData.json'
import defaultOptions from './data/options.json'

let optionsString = window.localStorage.getItem('options')
let options = optionsString ? JSON.parse(optionsString) : defaultOptions

let resultsString = window.localStorage.getItem('results')
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

// Design choice - keep the use of window.localStorage out of the components and instead keep here together in one place.
// TODO Is there a more idiomatic way to do this?

app.$on('newOptions', event => {
	window.localStorage.setItem('options', JSON.stringify(event.detail))
})

app.$on('newResults', event => {
	window.localStorage.setItem('results', JSON.stringify(event.detail))
})

export default app;