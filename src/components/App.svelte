<script>

	// import utils from '../modules/utils.js'
	import starSystems from '../modules/starSystems.js'
	import starSystemPrinter from '../modules/starSystemPrinter.js'

	export let appData;
	export let starData;

	// Note: Reactive variable.
	let results = {}
	let options = {
		showUninhabitedDetails: false
	}
	let output = 'Waiting on User.'

	function handleNewStarSystem() {
		results = starSystems.createStarSystem(starData)
		output = starSystemPrinter.printStarSystem(results, options)
	}

	function toggleHideUninhabited() {
		options.showUninhabitedDetails = !options.showUninhabitedDetails
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