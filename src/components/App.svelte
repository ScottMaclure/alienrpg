<script>

	import { createEventDispatcher } from 'svelte';

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

	if (Object.entries(results).length > 0) { // check for empty object
		output = starSystemPrinter.printStarSystem(results, options)
	}

	function handleNewStarSystem() {
		results = starSystems.createStarSystem(starData)
		dispatch('newResults', results);
		output = starSystemPrinter.printStarSystem(results, options)
	}

	function toggleHideUninhabited() {
		options.showUninhabitedDetails = !options.showUninhabitedDetails
		dispatch('newOptions', options);
		output = starSystemPrinter.printStarSystem(results, options)
	}

</script>

<main>
	<div class="alignRight"><small>{appData.version}</small></div>
	<h2>{appData.title}</h2>
	
	<p>An <strong><i>unofficial</i></strong> web app to help Game Mothers with their prep.</p>
	
	<button on:click={handleNewStarSystem}>New Star System</button>
	<form>
		<fieldset>
			<legend>Options</legend>
			<div>
				<label>
					<input type="checkbox" on:click={toggleHideUninhabited} bind:checked={options.showUninhabitedDetails}> Show uninhabited details
				</label>
			</div>
		</fieldset>
	</form>
    
	<h3>Results</h3>
	<pre id="results">{output}</pre>

	<footer>
		<small>{appData.title} {appData.version}. See the <a href="{appData.githubUrl}">github repo</a> for details. {appData.copyright}</small>
	</footer>
</main>

<style>
</style>