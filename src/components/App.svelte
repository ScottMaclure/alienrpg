<script>
	export let appData;
	export let starData;

	// Note: Reactive variable.
	let count = 0
	let results = {'TODO': 'Waiting on User.'}

	function handleNewStarSystem(event) {
		console.log('TODO handleNewStarSystem')
		count++
		results = {'TODO': `User clicked ${count} time(s).`}
	}

</script>

<main>
	<h1>{appData.title}</h1>
	
	<button on:click={handleNewStarSystem}>New Star System</button>
    
	<h2>Results</h2>
	<pre id="results">{JSON.stringify(results, null, 2)}</pre>

	<footer>
		<small>{appData.title} {appData.version}. {appData.copyright}</small>
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