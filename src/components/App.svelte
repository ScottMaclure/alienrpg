<script>

	import { createEventDispatcher } from 'svelte'
	import Options from './Options.svelte'

	// import utils from '../modules/utils.js'
	import starSystems from '../modules/starSystems.js'
	import starSystemPrinter from '../modules/starSystemPrinter.js'

	// Exported params that you can set from outside.
	export let appData;
	export let starData;
	export let options; // See src/data/options.json
	export let results; // Also saved to localStorage
	
	let output = 'Waiting on User.' // Reactive variable! Love Svelte v3 :)
	
	const dispatch = createEventDispatcher();

	// Existing session data.
	if (Object.entries(results).length > 0) { // check for empty object
		output = starSystemPrinter.printStarSystem(results, options)
	}

	// Main action - user has clicked the button.
	function handleNewStarSystem() {
		results = starSystems.createStarSystem(starData, options)
		output = starSystemPrinter.printStarSystem(results, options)
		dispatch('saveData', {'key': 'options', 'value': options});
		dispatch('saveData', {'key': 'results', 'value': results});
	}

	// Intermediate step - re-render output, and pass the save command up and out.
	function saveOptions() {
		if (Object.keys(results).length > 0) {
			// Only regen output if you have results (i.e. first load issue).
			output = starSystemPrinter.printStarSystem(results, options)
		}
		dispatch('saveData', {'key': 'options', 'value': options});
	}

</script>

<main>
	<h2>{appData.title}</h2>
	
	<p>An <strong><i>unofficial</i></strong> web app to help Game Mothers with their prep.</p>
	
	<button on:click={saveOptions} on:click={handleNewStarSystem}>New Star System</button>
	
	<Options starData={starData} options={options} on:saveOptions={saveOptions}/>
    
	<h3>Results</h3>
	<pre id="results">{output}</pre>

	<footer>
		<small>{appData.title} {appData.version}. See the <a href="{appData.githubUrl}">github repo</a> for details. {appData.copyright} Last updated {appData.version}.</small>
	</footer>
</main>

<style>
</style>