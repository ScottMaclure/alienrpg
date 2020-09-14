<script>

	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte'
	
	import starData from '../data/starData.json'
	import starSystems from '../modules/starSystems.js'
	import starSystemPrinter from '../modules/starSystemPrinter.js'
	
	import Options from './Options.svelte'

	// Exported params that you can set from outside.
	export let options // See src/data/options.json
	export let results // Also saved to localStorage
	
	let output = 'Waiting on User.' // Reactive variable! Love Svelte v3 :)
	
	const dispatch = createEventDispatcher();

	function handleOptions() {
		options.showOptions = !options.showOptions
		saveOptions()
	}

	// Main action - user has clicked the button.
	function handleNewStarSystem() {
		results.starSystem = starSystems.createStarSystem(starData, options)
		output = starSystemPrinter.printStarSystem(results.starSystem, options)
		saveData()
	}

	function saveData() {
		saveOptions()
		dispatch('saveData', {'key': 'results', 'value': results});
	}
	
	// Intermediate step - re-render output, and pass the save command up and out.
	function saveOptions() {
		printResults()
		dispatch('saveData', {'key': 'options', 'value': options});
	}

	// Aware of initial load = no results.
	function printResults() {
		if (results && results.starSystem) {
			output = starSystemPrinter.printStarSystem(results.starSystem, options)
		}
	}

	onMount(async () => {
		printResults()
	})

</script>

<div>
	
	<h4>Star Systems</h4>
	<button on:click={saveOptions} on:click={handleNewStarSystem}>Star System</button>
	<button on:click={handleOptions}>(Options)</button>
	
	<Options starData={starData} options={options} on:saveOptions={saveOptions}/>
	
	<h4>Results</h4>
	<pre id="results">{output}</pre>

</div>
