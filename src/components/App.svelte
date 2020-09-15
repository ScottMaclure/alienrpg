<script>

	import router from '../../node_modules/page'

	import appData from '../data/appData.json'

	import {links} from '../modules/links.js'

	// Exported params that you can set from outside.
	export let options // See src/data/options.json
	export let results // Saved externally
	export let isLocal
	
	// FIXME Workaround because I can't see how to configure sirv to run locally from a nested path (i.e. localhost/alienrpg).
	let baseRoute = ''
	if (!isLocal) {
		baseRoute = '/alienrpg'
		router.base(baseRoute)
	}

	let currentLink = links[0] // home
	for (const link of links) {
		router(link.path, () => {
			currentLink = link
		})
	}

	/**
	 * Had to turn off Page.js's automatic click handling, because it would mean the actual URL attributes in the anchor elements are incorrect.
	 * Meaning the app works fine when you were clicking it, but if you ctrl+clicked or right-click+copy-link into a new tab, the link was incorrect.
	 */
	const handleNav = (nextLink) => { 
		// console.debug(`nextLink.path=${nextLink.path}`)
		router(nextLink.path) 
	}

	router.start({  
		click: false, // Required for handleNav
		hashbang: true
	})
	
</script>

<main>
	<h2>{appData.title}</h2>
	
	<nav>
		{#each links.filter(e => e.isNav !== false) as link, i}
			{#if i > 0}&middot;{/if}
			<a on:click|preventDefault|stopPropagation={e => handleNav(link)} 
				href="{baseRoute ? baseRoute + '/' : ''}#!{link.path}" 
				class="{currentLink.path === link.path ? 'active' : ''}">{link.title}</a>
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
