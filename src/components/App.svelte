<script>

	// import utils from '../modules/utils.js'
	import starSystems from '../modules/starSystems.js'
	import starSystemPrinter from '../modules/starSystemPrinter.js'

	export let appData;
	export let starData;

	// Note: Reactive variable.
	let results = {}
	let output = 'Waiting on User.'

	function handleNewStarSystem() {
		results = starSystems.createStarSystem(starData)
		output = starSystemPrinter.printStarSystem(results)
	}

</script>

<main>
	<div class="alignRight"><small>{appData.version}</small></div>
	<h2>{appData.title}</h2>
	<p>An <strong><i>unofficial</i></strong> web app to help Game Mothers with their prep.</p>
	<button on:click={handleNewStarSystem}>New Star System</button>
    
	<h3>Results</h3>
	<pre id="results">{output}</pre>

	<footer>
		<small>{appData.title} {appData.version}. See the <a href="{appData.githubUrl}">github repo</a> for details. {appData.copyright}</small>
	</footer>
</main>

<style>
</style>