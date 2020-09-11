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
	
	<p>An <strong><i>unofficial</i></strong> web app to help Game Mothers with their prep.</p>
	
	<div class="bottomSpaced">
		<h4>Star Systems</h4>
		<button on:click={saveOptions} on:click={handleNewStarSystem}>Star System</button>
		<button on:click={handleOptions}>Options</button>
		<Options starData={starData} options={options} on:saveOptions={saveOptions}/>
	</div>
	<div class="bottomSpaced">
		<h4>Jobs</h4>
		<button on:click={handleNewCargoJob}>Cargo Run</button>
		<button on:click={handleNewMilitaryMission}>Military</button>
		<button on:click={handleNewExpedition}>Expedition</button>
	</div>
	<div class="bottomSpaced">
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
	</div>
	
	<h4>Results</h4>
	<pre id="results">{output}</pre>

	<footer>
		<small>See the <a href="{appData.githubUrl}">github repo</a> for details. {appData.copyright} Last updated {appData.version}.</small>
	</footer>
</main>

<style>
</style>