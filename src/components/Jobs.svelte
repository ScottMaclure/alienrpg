<script>

	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte'

	import jobsData from '../data/jobsData.json'
	import jobs from '../modules/jobs.js'
	import jobsPrinter from '../modules/jobsPrinter.js'

	// Exported params that you can set from outside.
	export let options // See src/data/options.json
	export let results // Also saved externally
	
	let output = 'Waiting on User.' // Reactive variable! Love Svelte v3 :)
	
	const dispatch = createEventDispatcher();

	function handleNewCargoJob() {
		results.job = jobs.createCargoRunJob(jobsData, options)
		output = jobsPrinter.printJob(results.job, options)
		saveData()
	}

	function handleNewMilitaryMission () {
		results.job = jobs.createMilitaryMission(jobsData, options)
		output = jobsPrinter.printJob(results.job, options)
		saveData()
	}

	function handleNewExpedition () {
		results.job = jobs.createExpedition(jobsData, options)
		output = jobsPrinter.printJob(results.job, options)
		saveData()
	}

	// FIXME Change the name. saveResults -> saveData should be how this works.
	function saveData() {
		dispatch('saveData', {'key': 'results', 'value': results});
	}
	
	function printResults() {
		// Existing session data.
		if (results && results.job) {
			output = jobsPrinter.printJob(results.job, options)
		}
	}

	onMount(async () => {
		printResults()
	})

</script>

<div>
	<h4>Jobs</h4>
	<button on:click|preventDefault={handleNewCargoJob}>Cargo</button>
	<button on:click|preventDefault={handleNewMilitaryMission}>Military</button>
	<button on:click|preventDefault={handleNewExpedition}>Expedition</button>
	
	<h4>Results</h4>
	<pre id="results">{output}</pre>

</div>
