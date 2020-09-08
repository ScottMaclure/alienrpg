import App from './components/App.svelte';

import appData from './data/appData.json'
import starData from './data/starData.json'

console.debug('appData:', appData)
console.debug('starData:', starData)

const app = new App({
	target: document.body,
	props: {
		appData: appData,
		starData: starData
	}
});

export default app;