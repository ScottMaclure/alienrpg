<script>

	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte'
	import Options from './Options.svelte'

	// import utils from '../modules/utils.js'
	import starSystems from '../modules/starSystems.js'
	import starSystemPrinter from '../modules/starSystemPrinter.js'
	import jobs from '../modules/jobs.js'
	import jobsPrinter from '../modules/jobsPrinter.js'
	import encounters from '../modules/encounters.js'
	import encountersPrinter from '../modules/encountersPrinter.js'

	// Exported params that you can set from outside.
	export let appData
	export let starData
	export let jobsData
	export let encountersData
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
		results = {}
		results.starSystem = starSystems.createStarSystem(starData, options)
		output = starSystemPrinter.printStarSystem(results.starSystem, options)
		saveData()
	}

	function handleNewCargoJob() {
		results = {}
		results.job = jobs.createCargoRunJob(jobsData, options)
		output = jobsPrinter.printJob(results.job, options)
		saveData()
	}

	function handleNewMilitaryMission () {
		results = {}
		results.job = jobs.createMilitaryMission(jobsData, options)
		output = jobsPrinter.printJob(results.job, options)
		saveData()
	}

	function handleNewExpedition () {
		results = {}
		results.job = jobs.createExpedition(jobsData, options)
		output = jobsPrinter.printJob(results.job, options)
		saveData()
	}

	function handleStarSystemEncounter(tensMod = 0) {
		results = {}
		results.starSystemEncounter = encounters.createStarSystemEncounter(encountersData, tensMod)
		output = encountersPrinter.printStarSystemEncounter(results.starSystemEncounter, options)
		saveData()
	}

	function handleSurfaceEncounter(type) {
		results = {}
		results.surfaceEncounter = encounters.createSurfaceEncounter(encountersData, type)
		output = encountersPrinter.printSurfaceEncounter(results.surfaceEncounter, options)
		saveData()
	}

	function handleColonyEncounter(tensMod) {
		results = {}
		results.colonyEncounter = encounters.createColonyEncounter(encountersData, tensMod)
		output = encountersPrinter.printColonyEncounter(results.colonyEncounter, options)
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

	function printResults() {
		// Existing session data.
		// TODO Keep all output separately, and add more UI to display them in tabs or similar.
		if (Object.entries(results).length > 0) { // check for empty object
			if (results.surfaceEncounter) {
				output = encountersPrinter.printSurfaceEncounter(results.surfaceEncounter, options)
			} else if (results.starSystemEncounter) {
				output = encountersPrinter.printStarSystemEncounter(results.starSystemEncounter, options)
			} else if (results.job) {
				output = jobsPrinter.printJob(results.job, options)
			} else if (results.starSystem) {
				output = starSystemPrinter.printStarSystem(results.starSystem, options)
			} 
		}
	}

	onMount(async () => {
		printResults()
	})

</script>

<main>
	<h2>{appData.title}</h2>
	
	<p>An <strong><i>unofficial</i></strong> web app to help Game Mothers with their prep. Click buttons and then links to generate random stuff. Results at bottom in plaintext.</p>
	
	<button on:click={e => options.showUI = 'starSystems'}>Star Systems</button>
	<button on:click={e => options.showUI = 'jobs'}>Jobs</button>
	<button on:click={e => options.showUI = 'encounters'}>Encounters</button>
	
	<div style="display: {options.showUI === 'starSystems' ? 'block' : 'none'}">
		<h4>Star Systems</h4>
		&middot; <a href="." on:click|preventDefault={saveOptions} on:click={handleNewStarSystem}>Star System</a>
		&middot; <a href="." on:click|preventDefault={handleOptions}>(Options)</a>
		<Options starData={starData} options={options} on:saveOptions={saveOptions}/>
	</div>
	<div style="display: {options.showUI === 'jobs' ? 'block' : 'none'}">
		<h4>Jobs</h4>
		&middot; <a href="." on:click|preventDefault={handleNewCargoJob}>Cargo</a>
		&middot; <a href="." on:click|preventDefault={handleNewMilitaryMission}>Military</a>
		&middot; <a href="." on:click|preventDefault={handleNewExpedition}>Expedition</a>
	</div>
	<div style="display: {options.showUI === 'encounters' ? 'block' : 'none'}">
		<h4>Star System Encounters</h4>
		&middot; <a href="." on:click|preventDefault={e => handleStarSystemEncounter()}>System</a>
		&middot; <a href="." on:click|preventDefault={e => handleStarSystemEncounter(-3)}>Rim/Frontier</a>
		&middot; <a href="." on:click|preventDefault={e => handleStarSystemEncounter(-5)}>Uncharted</a>
		<h4>Surface Encounters</h4>
		&middot; <a href="." on:click|preventDefault={e => handleSurfaceEncounter('uninhabited')}>Uninhabited</a>
		&middot; <a href="." on:click|preventDefault={e => handleSurfaceEncounter('colonized')}>Colonized</a>
		<h4>Colony Encounters</h4>
		&middot; <a href="." on:click|preventDefault={e => handleColonyEncounter(0)}>Young</a>
		&middot; <a href="." on:click|preventDefault={e => handleColonyEncounter(+1)}>Established</a>
	</div>
	
	<h4>Results</h4>
	<pre id="results">{output}</pre>

	<footer>
		<small>See the <a href="{appData.githubUrl}">github repo</a> for details. {appData.copyright} Last updated {appData.version}.</small>
	</footer>
</main>

<style>
</style>