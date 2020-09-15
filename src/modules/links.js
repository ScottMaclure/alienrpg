import Home from '../components/Home.svelte'
import StarSystems from '../components/StarSystems.svelte'
import Jobs from '../components/Jobs.svelte'
import Encounters from '../components/Encounters.svelte'
import NotFound from '../components/NotFound.svelte'

export let links = [
    {path: '/', title: 'Home', component: Home},
    {path: '/star-systems', title: 'Star Systems', component: StarSystems},
    {path: '/jobs', title: 'Jobs', component: Jobs},
    {path: '/encounters', title: 'Encounters', component: Encounters},
    {path: '*', component: NotFound, isNav: false}
]
