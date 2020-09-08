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
	<h1>{appData.title}</h1>
	
	<button on:click={handleNewStarSystem}>New Star System</button>
    
	<h2>Results</h2>
	<pre id="results">{output}</pre>

	<footer>
		<small>{appData.title} {appData.version}. See the <a href="{appData.githubUrl}">github repo</a> for details. {appData.copyright}</small>
	</footer>
</main>

<style>
	main {
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>