<script>

	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte'

    // import utils from '../modules/utils.js'
    import encountersData from '../data/encountersData.json'
	import encounters from '../modules/encounters.js'
	import encountersPrinter from '../modules/encountersPrinter.js'

	// Exported params that you can set from outside.
	export let options // See src/data/options.json
	export let results // Also saved to localStorage
	
	let output = 'Waiting on User.' // Reactive variable! Love Svelte v3 :)
	
	const dispatch = createEventDispatcher();

	function handleStarSystemEncounter(tensMod = 0) {
		results.starSystemEncounter = encounters.createStarSystemEncounter(encountersData, tensMod)
		output = encountersPrinter.printStarSystemEncounter(results.starSystemEncounter, options)
		saveData()
	}

	function handleSurfaceEncounter(type) {
		results.surfaceEncounter = encounters.createSurfaceEncounter(encountersData, type)
		output = encountersPrinter.printSurfaceEncounter(results.surfaceEncounter, options)
		saveData()
	}

	function handleColonyEncounter(tensMod) {
		results.colonyEncounter = encounters.createColonyEncounter(encountersData, tensMod)
		output = encountersPrinter.printColonyEncounter(results.colonyEncounter, options)
		saveData()
	}

	function saveData() {
		dispatch('saveData', {'key': 'results', 'value': results});
	}
	
	function printResults() {
		if (results) {
			if (results.surfaceEncounter) {
				output = encountersPrinter.printSurfaceEncounter(results.surfaceEncounter, options)
			} else if (results.starSystemEncounter) {
				output = encountersPrinter.printStarSystemEncounter(results.starSystemEncounter, options)
			} else if (results.colonyEncounter) {
				output = encountersPrinter.printColonyEncounter(results.colonyEncounter, options)
			} 
		}
	}

	onMount(async () => {
		printResults()
	})

</script>

<div>
    <h4>Star System Encounters</h4>
    <button on:click={e => handleStarSystemEncounter()}>System</button>
    <button on:click={e => handleStarSystemEncounter(-3)}>Rim</button>
    <button on:click={e => handleStarSystemEncounter(-5)}>Uncharted</button>
    
    <h4>Surface Encounters</h4>
    <button on:click={e => handleSurfaceEncounter('uninhabited')}>Uninhabited</button>
    <button on:click={e => handleSurfaceEncounter('colonized')}>Colonized</button>
    
    <h4>Colony Encounters</h4>
    <button on:click={e => handleColonyEncounter(0)}>Young</button>
    <button on:click={e => handleColonyEncounter(+1)}>Established</button>
	
	<h4>Results</h4>
	<pre id="results">{output}</pre>
</div>
