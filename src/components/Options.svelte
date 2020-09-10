<script>
    import { createEventDispatcher } from 'svelte'
    
    export let starData;
    export let options; // See src/data/options.json

    const dispatch = createEventDispatcher();

    // Create a UI-only version of the data
	let starLocations = JSON.parse(JSON.stringify(starData.starLocations))
	starLocations.push({"key": "ran", "name": "Random"})

    function toggleHideUninhabited() {
        options.showSurveyedDetails = !options.showSurveyedDetails
        dispatch('saveOptions') // no need to pass options up, it's the same object.
    }
    
    function saveOptions() {
        // console.log('Options.svelte - saveOptions')
		dispatch('saveOptions') // no need to pass options up, it's the same object.
	}
</script>

<div>
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
                        <input type=radio on:click={saveOptions} bind:group={options.starLocation} value={item.key}> {item.name}
                    </label>
                {/each}
            </div>
        </fieldset>
    </form>
</div>