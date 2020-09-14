<script>

	import router from '../../node_modules/page'

	import appData from '../data/appData.json'

	import Home from './Home.svelte'
	import StarSystems from './StarSystems.svelte'
	import Jobs from './Jobs.svelte'
	import Encounters from './Encounters.svelte'
	import NotFound from './NotFound.svelte'

	// Exported params that you can set from outside.
	export let options // See src/data/options.json
	export let results // Saved externally
	export let isLocal
	
	// FIXME Workaround because I can't see how to configure sirv to run locally from a nested path (i.e. localhost/alienrpg).
	let baseRoute = ''
	if (!isLocal) {
		baseRoute = '/alienrpg'
		router.base(baseRoute) // as per prod hosting
	}

	let links = [
		{path: `${baseRoute}/`, title: 'Home', component: Home},
		{path: `${baseRoute}/star-systems`, title: 'Star Systems', component: StarSystems},
		{path: `${baseRoute}/jobs`, title: 'Jobs', component: Jobs},
		{path: `${baseRoute}/encounters`, title: 'Encounters', component: Encounters},
		{path: '*', component:NotFound, isNav: false}
	]

	let currentLink = links[0] // home
	for (const link of links) {
		router(link.path, () => {
			currentLink = link
		})
	}

	router.start({ 
		hashbang: true // apppend hashbang for github pages compatibility.
	})
	
</script>

<main>
	<h2>{appData.title}</h2>
	
	<nav>
		<!-- <div>currentLink={currentLink.path}</div> -->
		{#each links.filter(e => e.isNav !== false) as link, i}
			{#if i > 0}&middot;{/if}
			<a href="{link.path}" class="{currentLink.path === link.path ? 'active' : ''}">{link.title}</a>
		{/each}
	</nav>

	<div class="page">
		<svelte:component this={currentLink.component} options={options} results={results} on:saveData/>
	</div>
	
	<footer>
		<small>See the <a href="{appData.githubUrl}">github repo</a> for details. {appData.copyright} Last updated {appData.version}.</small>
	</footer>

</main>

<style>
	a {
		opacity: 0.5
	}
	a.active {
		opacity: 1.5;
	}
</style>
