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
	
	// Create a UI-only version of the data
	let starLocations = JSON.parse(JSON.stringify(starData.starLocations))
	starLocations.push({"key": "ran", "name": "Random"})

	const dispatch = createEventDispatcher();

	if (Object.entries(results).length > 0) { // check for empty object
		output = starSystemPrinter.printStarSystem(results, options)
	}

	function handleNewStarSystem() {
		results = starSystems.createStarSystem(starData, options)
		dispatch('saveData', {'key': 'results', 'value': results});
		output = starSystemPrinter.printStarSystem(results, options)
	}

	function toggleHideUninhabited() {
		options.showSurveyedDetails = !options.showSurveyedDetails
		dispatch('saveData', {'key': 'options', 'value': options});
		output = starSystemPrinter.printStarSystem(results, options)
	}

	function saveOptions() {
		dispatch('saveData', {'key': 'options', 'value': options});
	}

</script>

<main>
	<h2>{appData.title}</h2>
	
	<p>An <strong><i>unofficial</i></strong> web app to help Game Mothers with their prep.</p>
	
	<button on:click={saveOptions} on:click={handleNewStarSystem}>New Star System</button>
	<form>
		<fieldset>
			<legend>Options</legend>
			<div>
				<label>
					<input type="checkbox" on:click={toggleHideUninhabited} bind:checked={options.showSurveyedDetails}> Show surveyed details
				</label>
			</div>
		</fieldset>
		<fieldset>
			<legend>Star System Location</legend>
			<div>
				{#each starLocations as item}
					<label>
						<!-- FIXME on:change fires before the value is updated to the new value, meaning it's one step behind. -->
						<input type=radio on:change={saveOptions} bind:group={options.starLocation} value={item.key}> {item.name}
					</label>
				{/each}
			</div>
		</fieldset>
	</form>
    
	<h3>Results</h3>
	<pre id="results">{output}</pre>

	<footer>
		<small>{appData.title} {appData.version}. See the <a href="{appData.githubUrl}">github repo</a> for details. {appData.copyright} Last updated {appData.version}.</small>
	</footer>
</main>

<style>
</style>