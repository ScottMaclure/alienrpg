var app=function(){"use strict";function e(){}function t(e){return e()}function o(){return Object.create(null)}function n(e){e.forEach(t)}function i(e){return"function"==typeof e}function r(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function s(e,t){e.appendChild(t)}function a(e){e.parentNode.removeChild(e)}function l(e){return document.createElement(e)}function d(e){return document.createTextNode(e)}function c(){return d(" ")}function p(e,t,o,n){return e.addEventListener(t,o,n),()=>e.removeEventListener(t,o,n)}function u(e,t,o){null==o?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)}function m(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}let h;function y(e){h=e}const f=[],g=[],b=[],M=[],S=Promise.resolve();let v=!1;function w(e){b.push(e)}let $=!1;const P=new Set;function z(){if(!$){$=!0;do{for(let e=0;e<f.length;e+=1){const t=f[e];y(t),k(t.$$)}for(f.length=0;g.length;)g.pop()();for(let e=0;e<b.length;e+=1){const t=b[e];P.has(t)||(P.add(t),t())}b.length=0}while(f.length);for(;M.length;)M.pop()();v=!1,$=!1,P.clear()}}function k(e){if(null!==e.fragment){e.update(),n(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(w)}}const A=new Set;function C(e,t){-1===e.$$.dirty[0]&&(f.push(e),v||(v=!0,S.then(z)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function x(r,s,l,d,c,p,u=[-1]){const m=h;y(r);const f=s.props||{},g=r.$$={fragment:null,ctx:null,props:p,update:e,not_equal:c,bound:o(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(m?m.$$.context:[]),callbacks:o(),dirty:u,skip_bound:!1};let b=!1;if(g.ctx=l?l(r,f,(e,t,...o)=>{const n=o.length?o[0]:t;return g.ctx&&c(g.ctx[e],g.ctx[e]=n)&&(!g.skip_bound&&g.bound[e]&&g.bound[e](n),b&&C(r,e)),t}):[],g.update(),b=!0,n(g.before_update),g.fragment=!!d&&d(g.ctx),s.target){if(s.hydrate){const e=function(e){return Array.from(e.childNodes)}(s.target);g.fragment&&g.fragment.l(e),e.forEach(a)}else g.fragment&&g.fragment.c();s.intro&&((M=r.$$.fragment)&&M.i&&(A.delete(M),M.i(S))),function(e,o,r){const{fragment:s,on_mount:a,on_destroy:l,after_update:d}=e.$$;s&&s.m(o,r),w(()=>{const o=a.map(t).filter(i);l?l.push(...o):n(o),e.$$.on_mount=[]}),d.forEach(w)}(r,s.target,s.anchor),z()}var M,S;y(m)}var D=e=>!(!e||"F"!==e.toString().toUpperCase()),T=e=>{if("string"!=typeof e)throw new Error("parseDieNotation must be called with a dice notation string");const t=e.toLowerCase().split("d");let o=0;const n={count:parseInt(t[0],10)||1,sides:D(t[1])?"F":parseInt(t[1],10)};if(Number.isNaN(Number(t[1]))){const e=/[+-xX*<>]{1}[\dlL]{1,}/,r=t[1].match(e);if(r)if("string"==typeof(i=r[0])&&/[xX*]{1}[\d]{1,}/.test(i))n.multiply=!0,o=parseInt(r[0].substring(1),10);else if((e=>!(!e||"-L"!==e.toString().toUpperCase()))(r[0]))o=0,n.dropLow=!0;else if((e=>!(!e||!/[<>]{1}[\d]{1,}/.test(e)))(r[0])){const e=r[0].charAt(0);n.success=">"===e?1:-1,o=parseInt(r[0].substring(1),10)}else o=parseInt(r[0],10)}var i;return n.mod=o,n},j=(e,t=Math.random)=>{if(!D(e)&&!Number.isInteger(e))throw new Error("rollDie must be called with an integer or F");return D(e)?Math.ceil(2*t())-1:Math.ceil(t()*(e-1)+1)};const U=(e,t)=>{const{mod:o,multiply:n,dropLow:i,success:r}=t;let s=[...e],a=0;return i&&(s=s.sort((e,t)=>e-t)).shift(),r?s.forEach(e=>{(r<0&&e<=o||r>0&&e>=o)&&(a+=1)}):(s.forEach(e=>{a+=e}),n?a*=o:o&&(a+=o)),a};var E=(e,t=Math.random)=>{const{count:o,sides:n,mod:i,multiply:r,dropLow:s,success:a}=T(e),l=[];for(let e=0;e<o;e+=1){const e=j(n,t);l.push(e)}return{results:l,total:U(l,{mod:i,multiply:r,dropLow:s,success:a})}};const G=(e,t,o=0)=>{let n=E(t+" "+o).total;for(const o of e)if(n<=o[t])return o;throw`Couldn't find a random ${t} item for length ${e.length} array.`},L=(e=0)=>{let t=E("d6").total+e;t=t<1?1:t,t=t>6?6:t;let o=E("d6").total;return parseInt(""+t+o,10)};var O=e=>e.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,"$1,"),N=(e,t=0)=>G(e,"2d6",t),I=(e,t=0)=>G(e,"3d6",t),W=e=>e[Math.floor(Math.random()*e.length)],K=(e,t=0)=>G(e,"d6",t),H=(e,t=0)=>{const o=L(t);for(const t of e)if(o<=t.d66)return t;throw`Couldn't find a random d66 item for length ${e.length} array.`},R=(e,t)=>Math.floor(Math.random()*(t-e+1))+e,q=e=>{try{return E(e).total}catch(t){throw new Error(`roll fail, rollString=${e}, err=${t}`)}},_=(e,t)=>{const o=e.modifiers[t]?e.modifiers[t]:e.modifiers.default,n=""+e.number+o,i=E(n);return i.total<0?0:i.total};const B=e=>W(e.starTypes),V=(e,t)=>{t.systemObjects=[];let o=t.starType.type;for(const n of e.systemObjects){let e=_(n,o);for(let o=0;o<e;o++)t.systemObjects.push(J(n))}},J=e=>{let t=e.features?W(e.features):null;return{key:e.key,type:e.type,feature:t,habitable:e.habitable,isColonized:!1,planetSizeMod:e.planetSizeMod,colonies:[]}},F=(e,t)=>{let o=null,n=!1;for(;!n;){o=W(e.iccCodes)+"-"+W(e.planetaryNames),t.includes(o)||(n=!0,t.push(o))}return o},Y=(e,t,o)=>{let n=!1,i=!1;for(;!i;)n=W(t.systemObjects),n.habitable&&(n.isColonized=!0,n.name=F(e,o),i=!0)},Q=(e,t)=>{for(let o of t.systemObjects)X(JSON.parse(JSON.stringify(e)),t,o)},X=(e,t,o)=>{const n=o.key;switch(o.planetSize=N(e.planetSizes,o.planetSizeMod),n){case"gasGiant":o.atmosphere=e.atmospheres[e.atmospheres.length-2],o.temperature=N(e.temperatures,o.atmosphere.temperatureMod);break;case"icePlanet":o.atmosphere=N(e.atmospheres,o.planetSize.atmosphereMod),o.temperature=e.temperatures[0];break;case"asteroidBelt":o.atmosphere=e.atmospheres[0],o.temperature=N(e.temperatures,o.atmosphere.temperatureMod);break;case"terrestrialPlanet":o.atmosphere=N(e.atmospheres,o.planetSize.atmosphereMod),o.temperature=N(e.temperatures,o.atmosphere.temperatureMod);break;default:throw new Error(`Unknown world key=${o.key}, aborting.`)}if(o.temperature.average=R(o.temperature.min,o.temperature.max),o.habitable){const t=o.atmosphere.geosphereMod+o.temperature.geosphereMod;if(o.geosphere=N(e.geospheres,t),"icePlanet"===n)o.terrain=N(e.terrains[n]);else{const t=o.geosphere[n]+o.temperature[n];o.terrain=H(e.terrains[n],t)}}if(o.isColonized){const n=ee(),i=o.planetSize.colonySizeMod+o.atmosphere.colonySizeMod;for(let r=0;r<n;r++){let n={};const r=I(e.colonyAllegiances);n.allegiance=r[t.starLocation.colonyAllegianceKey],n.colonySize=JSON.parse(JSON.stringify(N(e.colonySizes,i))),n.colonySize.populationAmount=q(n.colonySize.population),n.colonySize.missions.toLowerCase().includes("d")?n.colonySize.missionsAmount=q(n.colonySize.missions):n.colonySize.missionsAmount=parseInt(n.colonySize.missions),n.missions=[];const s=o.atmosphere.colonyMissionMod+n.colonySize.colonyMissionMod;let a=[];for(let t=0;t<n.colonySize.missionsAmount;t++){let t="",o=!1;for(;!o;)t=N(e.colonyMissions,s),o=!a.includes(t.type);a.push(t.type),n.missions.push(t)}n.orbitalComponents=[];let l=JSON.parse(JSON.stringify(N(e.orbitalComponents,n.colonySize.orbitalComponenMod)));if(l.multiRoll){const t=q(l.multiRoll);for(let o=0;o<t;o++){let t=JSON.parse(JSON.stringify(N(e.orbitalComponents,n.colonySize.orbitalComponenMod)));void 0!==typeof t.multiRoll?o--:(Z(t),n.orbitalComponents.push(t))}}else Z(l),n.orbitalComponents.push(l);const d=JSON.parse(JSON.stringify(K(e.factionOptions)));if(d.quantity){const e=q(d.quantity);for(let t=0;t<e;t++)d.factions.push({strength:q("d6")})}n.factions=d.factions,o.colonies.push(n)}o.scenarioHook=H(e.scenarioHooks)}},Z=e=>{e.quantity&&(e.quantityAmount=q(e.quantity),e.type=e.quantityAmount+" "+e.type)},ee=()=>q("2d6")>=10?2:1;var te=e=>{let t={};t.starLocation=W(e.starLocations),t.starLocation.colonyAllegianceKeys&&(t.starLocation.colonyAllegianceKey=W(t.starLocation.colonyAllegianceKeys)),t.starType=B(e),V(e,t);return Y(e,t,[]),Q(e,t),t.systemObjects.sort((e,t)=>t.temperature.average-e.temperature.average),t};const oe="  ",ne={showUninhabitedDetails:!0},ie=(e,t,o)=>{let n=[];for(const[i,r]of e.entries())n.push(re(i,r,t)),(r.isColonized||o.showUninhabitedDetails)&&n.push(ae(r,t+"  "));return n.join("\n")},re=(e,t,o)=>`${o}#${(""+(e+1)).padStart(2,0)}: ${t.name?t.name+", ":""}${t.type}${t.feature?", "+t.feature:""}${t.isColonized?", "+t.geosphere.type:" (Uninhabited)"}${se(t)}`,se=e=>{if(!e.habitable)return"";let t=0;for(const o of e.colonies)for(const e of o.orbitalComponents)e.isMoon&&(t+=e.quantityAmount);return 0==t?"":1==t?`, ${t} moon`:`, ${t} moons`},ae=(e,t)=>{let o=[];return e.habitable&&o.push(`${t}Planet Size:  ${O(e.planetSize.sizeKm)} km, ${e.planetSize.surfaceGravity} G${e.planetSize.examples?" (e.g. "+e.planetSize.examples+")":""}`),o.push(`${t}Atmosphere:   ${e.atmosphere.type}`),o.push(`${t}Temperature:  ${e.temperature.type}, ${e.temperature.average}°C average (e.g. ${e.temperature.description})`),e.habitable&&(o.push(`${t}Geosphere:    ${e.geosphere.type}, ${e.geosphere.description}`),o.push(`${t}Terrain:      ${e.terrain.description}`)),e.isColonized&&(o.push(`${t}Hook:         ${e.scenarioHook.description}`),o.push(le(e,t))),o.join("\n")},le=(e,t)=>{let o=[],n=t+oe;const i="   ";for(const[r,s]of e.colonies.entries())o.push(`${t}Colony #${r+1}:`),o.push(`${n}Allegiance: ${s.allegiance}`),o.push(`${n}Size:       ${s.colonySize.size}, ${O(s.colonySize.populationAmount)} pax`),o.push(de(s.missions,n,i)),o.push(ce(s.orbitalComponents,n,i)),o.push(ue(s.factions,n,i));return o.join("\n")},de=(e,t,o)=>{let n=[];for(const[t,o]of e.entries())n.push(""+o.type);return`${t}Missions:${o}`+n.join(", ")},ce=(e,t,o)=>{let n=[];for(const[t,o]of e.entries())n.push(""+o.type);return`${t}Orbitals:${o}`+n.join(", ")},pe=["weak","balanced","balanced","competing","competing","dominant"],ue=(e,t,o)=>{let n={weak:0,balanced:0,competing:0,dominant:0};for(const t of e)n[pe[t.strength-1]]++;let i=[];for(const[e,t]of Object.entries(n))t>0&&i.push(`${t} ${e}`);return`${t}Factions:${o}`+i.join(", ")};var me=(e,t=ne)=>{let o=oe;return`Star System:\n  Location: ${e.starLocation.name} (${e.starLocation.colonyAllegianceKey})\n  Type:     ${e.starType.type}, ${e.starType.brightness}: ${e.starType.description}\nPlanetary Bodies (${e.systemObjects.length}):\n${ie(e.systemObjects,o,t)}\n`};function he(t){let o,i,r,h,y,f,g,b,M,S,v,w,$,P,z,k,A,C,x,D,T,j,U,E,G,L,O,N,I,W,K,H,R,q,_,B,V,J,F,Y=t[0].version+"",Q=t[0].title+"",X=t[0].title+"",Z=t[0].version+"",ee=t[0].copyright+"";return{c(){o=l("main"),i=l("div"),r=l("small"),h=d(Y),y=c(),f=l("h2"),g=d(Q),b=c(),M=l("p"),M.innerHTML="An <strong><i>unofficial</i></strong> web app to help Game Mothers with their prep.",S=c(),v=l("button"),v.textContent="New Star System",w=c(),$=l("form"),P=l("fieldset"),z=l("legend"),z.textContent="Options",k=c(),A=l("div"),C=l("label"),x=l("input"),D=d(" Show uninhabited details"),T=c(),j=l("h3"),j.textContent="Results",U=c(),E=l("pre"),G=d(t[2]),L=c(),O=l("footer"),N=l("small"),I=d(X),W=c(),K=d(Z),H=d(". See the "),R=l("a"),q=d("github repo"),B=d(" for details. "),V=d(ee),u(i,"class","alignRight"),u(x,"type","checkbox"),u(E,"id","results"),u(R,"href",_=t[0].githubUrl)},m(e,n){!function(e,t,o){e.insertBefore(t,o||null)}(e,o,n),s(o,i),s(i,r),s(r,h),s(o,y),s(o,f),s(f,g),s(o,b),s(o,M),s(o,S),s(o,v),s(o,w),s(o,$),s($,P),s(P,z),s(P,k),s(P,A),s(A,C),s(C,x),x.checked=t[1].showUninhabitedDetails,s(C,D),s(o,T),s(o,j),s(o,U),s(o,E),s(E,G),s(o,L),s(o,O),s(O,N),s(N,I),s(N,W),s(N,K),s(N,H),s(N,R),s(R,q),s(N,B),s(N,V),J||(F=[p(v,"click",t[3]),p(x,"click",t[4]),p(x,"change",t[6])],J=!0)},p(e,[t]){1&t&&Y!==(Y=e[0].version+"")&&m(h,Y),1&t&&Q!==(Q=e[0].title+"")&&m(g,Q),2&t&&(x.checked=e[1].showUninhabitedDetails),4&t&&m(G,e[2]),1&t&&X!==(X=e[0].title+"")&&m(I,X),1&t&&Z!==(Z=e[0].version+"")&&m(K,Z),1&t&&_!==(_=e[0].githubUrl)&&u(R,"href",_),1&t&&ee!==(ee=e[0].copyright+"")&&m(V,ee)},i:e,o:e,d(e){e&&a(o),J=!1,n(F)}}}function ye(e,t,o){let{appData:n}=t,{starData:i}=t,r={},s={showUninhabitedDetails:!1},a="Waiting on User.";return e.$$set=e=>{"appData"in e&&o(0,n=e.appData),"starData"in e&&o(5,i=e.starData)},[n,s,a,function(){r=te(i),o(2,a=me(r,s))},function(){o(1,s.showUninhabitedDetails=!s.showUninhabitedDetails,s),o(2,a=me(r,s))},i,function(){s.showUninhabitedDetails=this.checked,o(1,s)}]}var fe={title:"Alien RPG Tools",version:"v0.6.0 Beta",copyright:"Any text taken from the game is used with permission and remains © of their respective owners.",githubUrl:"https://github.com/ScottMaclure/alienrpg/blob/master/README.md"},ge={starTypes:[{type:"Giant",description:"Huge, bright and cool star in a late stage of evolution.",brightness:"Type III"},{type:"Subgiant",description:"A large, bright star, exhausting its fuel.",brightness:"Type IV"},{type:"Main Sequence",description:"Small but incredibly common type of star.",brightness:"Type V"},{type:"White Dwarf",description:"A dead, burnt-out star, tiny and super-dense.",brightness:"Type DA"},{type:"Red Dwarf",description:"A red main sequence star, small and cool. Very common star.",brightness:"Type MV"},{type:"White Main Sequence",description:"White main sequence stars that burn hot and brightly.",brightness:"Type A0V"}],starLocations:[{key:"icsc",name:"The Independent Core System Colonies",colonyAllegianceKey:"icsc"},{key:"aja",name:"Anglo-Japanese Arm",colonyAllegianceKey:"aajm"},{key:"upp",name:"The Union of Progressive Peoples",colonyAllegianceKey:"upp"},{key:"arm",name:"The United Americas",colonyAllegianceKey:"aajm"},{key:"fro",name:"The Frontier",colonyAllegianceKeys:["icsc","aajm","upp"]}],systemObjects:[{key:"gasGiant",type:"Gas Giant",number:"d6",modifiers:{default:"-1",Subgiant:"-2","White Dwarf":"-5"},features:["High Winds","Intense Radiation Fields","Rings","Single Super Storm","Small Gas Giant","Storms"],habitable:!1,planetSizeMod:"-4"},{key:"terrestrialPlanet",type:"Terrestrial Planet",number:"d6",modifiers:{default:"","Red Dwarf":"-3","White Dwarf":"-3"},habitable:!0,planetSizeMod:""},{key:"icePlanet",type:"Ice Planet",number:"d6",modifiers:{default:"+1",Subgiant:"",Giant:"","White Main Sequence":""},habitable:!0,planetSizeMod:"-2"},{key:"asteroidBelt",type:"Asteroid Belt",number:"d6",modifiers:{default:"-3","White Dwarf":"-5",Subgiant:"-5"},features:["Bright and highly visible","Contains several large dwarf planets","Dust Belt","High orbital inclination","Intensely mineral rich asteroids","Very wide—covering several orbits"],habitable:!1,planetSizeMod:""}],iccCodes:["LV","MT","RF"],planetaryNames:["Arges","Aurora","Damnation","Doramin","Euphrates","Hamilton","Hannibal","Magdala","Moab","Monos","Nakaya","Napier","Nemesis","Nero","Nocturne","Phaeton","Prospero","Requiem","Solitude","Steropes","Tracatus"],planetSizes:[{"2d6":2,sizeKm:999,surfaceGravity:0,examples:"Ceres and other asteroids",atmosphereMod:"-6",colonySizeMod:-3},{"2d6":4,sizeKm:2e3,surfaceGravity:.1,examples:"Iapetus",atmosphereMod:-6,colonySizeMod:-3},{"2d6":6,sizeKm:4e3,surfaceGravity:.2,examples:"Luna, Europa",atmosphereMod:-6,colonySizeMod:-3},{"2d6":7,sizeKm:7e3,surfaceGravity:.5,examples:"Mars",atmosphereMod:-2,colonySizeMod:0},{"2d6":8,sizeKm:1e4,surfaceGravity:.7,examples:null,atmosphereMod:0,colonySizeMod:0},{"2d6":10,sizeKm:12500,surfaceGravity:1,examples:"Earth, Venus",atmosphereMod:0,colonySizeMod:0},{"2d6":11,sizeKm:15e3,surfaceGravity:1.3,examples:null,atmosphereMod:0,colonySizeMod:0},{"2d6":50,sizeKm:2e4,surfaceGravity:2,examples:"Super-Earth",atmosphereMod:0,colonySizeMod:0}],atmospheres:[{"2d6":3,type:"Thin",temperatureMod:-4,geosphereMod:-4,colonySizeMod:0,colonyMissionMod:0},{"2d6":6,type:"Breathable",temperatureMod:0,geosphereMod:0,colonySizeMod:1,colonyMissionMod:1},{"2d6":8,type:"Toxic",temperatureMod:0,geosphereMod:0,colonySizeMod:0,colonyMissionMod:-6},{"2d6":9,type:"Dense",temperatureMod:1,geosphereMod:-4,colonySizeMod:0,colonyMissionMod:0},{"2d6":10,type:"Corrosive",temperatureMod:6,geosphereMod:-4,colonySizeMod:-2,colonyMissionMod:-6},{"2d6":11,type:"Infiltrating",temperatureMod:6,geosphereMod:-4,colonySizeMod:-2,colonyMissionMod:-6},{"2d6":50,type:"Special",temperatureMod:0,geosphereMod:8,colonySizeMod:0,colonyMissionMod:0}],temperatures:[{"2d6":3,type:"Frozen",min:-100,max:-50,description:"Titan, Pluto, Enceladus",geosphereMod:-2,terrestrialPlanet:-2,icePlanet:0},{"2d6":5,type:"Cold",min:-50,max:0,description:"Alaska or Antarctica in winter",geosphereMod:0,terrestrialPlanet:0,icePlanet:0},{"2d6":7,type:"Temperate",min:0,max:30,description:"Boston or Paris",geosphereMod:0,terrestrialPlanet:0,icePlanet:0},{"2d6":10,type:"Hot",min:31,max:80,description:"Titan, Pluto, Enceladus",geosphereMod:-2,terrestrialPlanet:0,icePlanet:0},{"2d6":50,type:"Burning",min:80,max:200,description:"Mercury, Venus",geosphereMod:-4,terrestrialPlanet:0,icePlanet:0}],geospheres:[{"2d6":4,type:"Desert World",description:"No surface water",terrestrialPlanet:-3,icePlanet:0},{"2d6":6,type:"Arid World",description:"Global deserts and dry steppes, with some lakes and small seas",terrestrialPlanet:-2,icePlanet:0},{"2d6":8,type:"Temperate-Dry World",description:"Oceans cover 30–40% of the world's surface",terrestrialPlanet:0,icePlanet:0},{"2d6":10,type:"Temperate-Wet World",description:"Oceans cover 60–70% of the world's surface",terrestrialPlanet:0,icePlanet:0},{"2d6":11,type:"Wet World",description:"Global oceans with some islands and archipelagos",terrestrialPlanet:2,icePlanet:0},{"2d6":50,type:"Water World",description:"No dry land",terrestrialPlanet:3,icePlanet:0}],terrains:{terrestrialPlanet:[{d66:11,description:"Huge impact crater"},{d66:12,description:"Plains of silicon glass"},{d66:13,description:"Disturbing wind-cut rock formations"},{d66:14,description:"Permanent global dust-storm"},{d66:15,description:"Eerily colored dust plains"},{d66:16,description:"Active volcanic lava fields"},{d66:21,description:"Extensive salt flats"},{d66:22,description:"Dust-laden, permanent sunset sky"},{d66:23,description:"Ancient, blackened lava plains"},{d66:24,description:"Thermal springs and steam vents"},{d66:25,description:"Tall, gravel-strewn mountains"},{d66:26,description:"Howling winds that never stop"},{d66:31,description:"Daily fog banks roll in"},{d66:32,description:"Deep and wide rift valleys"},{d66:33,description:"Bizarrely eroded, wind-cut badlands"},{d66:34,description:"Steep-sided river gorges cut into soft rocks"},{d66:35,description:"Huge moon dominates day/night sky"},{d66:36,description:"World-spanning super canyon"},{d66:41,description:"Impressive river of great length"},{d66:42,description:"Oddly colored forests of alien vegetation"},{d66:43,description:"Mountains cut by sky-blue lakes"},{d66:44,description:"Sweeping plains of elephant grass"},{d66:45,description:"Highly toxic, but beautiful, plant-life"},{d66:46,description:"Small, bright, incredibly fast moons in orbit"},{d66:51,description:"Vast and complex river delta"},{d66:52,description:"Immense series of waterfalls"},{d66:53,description:"Endless mudflats with twisting water-ways"},{d66:54,description:"Impressive coastline of fjords and cliffs"},{d66:55,description:"Volcanoes, active & widespread"},{d66:56,description:"Impenetrable jungle"},{d66:61,description:"Dangerous tides—fast and loud"},{d66:62,description:"Vast, permanent super storm"},{d66:63,description:"Toxic sea creatures floating with the currents"},{d66:64,description:"Volcanic island chains"},{d66:65,description:"Permanently overcast with unrelenting rainfall"},{d66:100,description:"Mildly acidic oceans and rainfall"}],icePlanet:[{"2d6":2,description:"Huge impact crater"},{"2d6":3,description:"Geysers spew water into low orbit from long fissures"},{"2d6":4,description:"Deep fissures leading to a subsurface ocean"},{"2d6":5,description:"Dramatically colored blue-green ice fissures"},{"2d6":6,description:"Huge and active cryovolcano"},{"2d6":7,description:"Vast range of ice mountains"},{"2d6":8,description:"World-spanning super canyon"},{"2d6":9,description:"Disturbing, wind-cut ice formations"},{"2d6":10,description:"Black, dust-covered ice plains"},{"2d6":11,description:"Impressive ice escarpment of great length"},{"2d6":100,description:"Extensive dune-fields of methane sand grains"}]},colonySizes:[{"2d6":"7",size:"Start-Up",population:"3d6x10",missions:"1",colonyMissionMod:-1,orbitalComponenMod:0},{"2d6":"10",size:"Young",population:"3d6x100",missions:"d3–1",colonyMissionMod:0,orbitalComponenMod:1},{"2d6":"50",size:"Established",population:"2d6x1000",missions:"d3",colonyMissionMod:4,orbitalComponenMod:2}],colonyMissions:[{"2d6":2,type:"Terraforming"},{"2d6":3,type:"Research"},{"2d6":4,type:"Survey and Prospecting"},{"2d6":5,type:"Prison/Secluded or Exile"},{"2d6":6,type:"Mining and Refining"},{"2d6":7,type:"Mineral Drilling"},{"2d6":8,type:"Communications Relay"},{"2d6":9,type:"Military"},{"2d6":10,type:"Cattle Ranching/Logging"},{"2d6":11,type:"Corporate HQ"},{"2d6":50,type:"Government HQ"}],orbitalComponents:[{"2d6":4,type:"Little (perhaps wreckage) or nothing"},{"2d6":5,type:"Ring"},{"2d6":6,type:"Abandoned or Repurposed Satellite or Space Station"},{"2d6":8,type:"Moons",quantity:"d3",isMoon:!0},{"2d6":9,type:"Survey Station"},{"2d6":10,type:"Several Survey and Communications Satellites"},{"2d6":11,type:"Transfer Station"},{"2d6":50,multiRoll:"d6"}],factionOptions:[{d6:1,factions:[{strength:6}]},{d6:2,factions:[{strength:3},{strength:3}]},{d6:3,factions:[{strength:5},{strength:5}]},{d6:4,factions:[{strength:6},{strength:1}]},{d6:5,factions:[{strength:5},{strength:5},{strength:5}]},{d6:6,quantity:"d6",factions:[]}],colonyAllegiances:[{"3d6":4,icsc:"Kelland Mining",aajm:"Kelland Mining",upp:"UPP"},{"3d6":5,icsc:"GeoFund Investor",aajm:"Gustafsson Enterprise",upp:"UPP"},{"3d6":6,icsc:"Gustafsson Enterprise",aajm:"GeoFund Investor",upp:"UPP"},{"3d6":7,icsc:"Seegson",aajm:"Lasalle Bionational",upp:"UPP"},{"3d6":8,icsc:"No allegiance (independent)",aajm:"Weyland-Yutani",upp:"UPP"},{"3d6":11,icsc:"Jĭngtì Lóng Corporation",aajm:"Government representative",upp:"UPP"},{"3d6":12,icsc:"Chigusa Corporation",aajm:"Weyland-Yutani",upp:"UPP"},{"3d6":13,icsc:"Lasalle Bionational",aajm:"Seegson",upp:"UPP"},{"3d6":14,icsc:"Seegson",aajm:"Jĭngtì Lóng Corporation",upp:"UPP"},{"3d6":15,icsc:"Lorenz SysTech",aajm:"Chigusa Corporation",upp:"UPP"},{"3d6":16,icsc:"Gemini Exoplanet",aajm:"Gemini Exoplanet",upp:"UPP"},{"3d6":50,icsc:"Farside Mining",aajm:"Farside Mining",upp:"UPP"}],scenarioHooks:[{d66:11,description:"Pilfering and thefts force security to search rooms and lockers."},{d66:12,description:"Incidents of sabotage are increasing; security suspects an organized campaign."},{d66:13,description:"Colonial Administration is investigating the colony for illegal practices."},{d66:14,description:"Colonists returning to base report sighting a ‘monster’ on the surface."},{d66:15,description:"Petty crime, thefts and sabotage are rife. "},{d66:16,description:"Equipment failure has resulted in rationing at the colony. Tempers are frayed."},{d66:21,description:"Ship recently arrived with some kind of parasite that will soon spread through the colony."},{d66:22,description:"Stolen goods are on offer—cheap! "},{d66:23,description:"Unknown to you an old friend/flame is at the colony."},{d66:24,description:"Unknown to you an old enemy/rival is at the colony."},{d66:25,description:"A minor dignitary/notable is visiting in the company of several aides or guards."},{d66:26,description:"Part of the colony is off-limits temporarily - no reason given."},{d66:31,description:"Sudden restriction on free movement, unless you can find a way to avoid it."},{d66:32,description:"An emergency means repair parts and vital supplies are being shipped in from a nearby colony."},{d66:33,description:"Local crisis about to hit (storm, earthquake, riot, fire, etc.)"},{d66:34,description:"Period of solar flare—will cut communications for one Shift (D6 days if star type MV)."},{d66:35,description:"Spies from a neighboring colony have been discovered and arrested."},{d66:36,description:"Operations manager and his deputy are in conflict; everyone is choosing sides."},{d66:41,description:"PCs are invited to a formal dinner, meeting or party."},{d66:42,description:"The local colonists are not what they seem."},{d66:43,description:"A military ship is in orbit and the landing party is searching for someone/something."},{d66:44,description:"A rival colony or corporation is about to carry out an act of sabotage."},{d66:45,description:"The spaceport is currently quarantined."},{d66:46,description:"Security situation at the colony."},{d66:51,description:"A bunch of asteroid miners causing trouble while on leave."},{d66:52,description:"Mystery ship arrives at the spaceport."},{d66:53,description:"Civil unrest is about to break out."},{d66:54,description:"Colonists are trapped and need rescuing far from the settlement itself."},{d66:55,description:"Authorities have just locked down the colony after a riot."},{d66:56,description:"A religious leader is whipping up discontent."},{d66:61,description:"PCs will be harassed by angry locals. Why the anger? And why directed at off-world personnel?"},{d66:62,description:"An expedition is being assembled for a trek overland—the PCs are invited."},{d66:63,description:"An important colonial official is murdered, only an hour after you arrive."},{d66:64,description:"Several colonists have gone missing — a search is underway."},{d66:65,description:"A lifeboat has crashed on planet, and contained an interesting individual."},{d66:100,description:"The corporation or government paying for the colony keeps ordering teams out to search remote areas—but won’t say what they are searching for."}]};console.debug("appData:",fe),console.debug("starData:",ge);return new class extends class{$destroy(){!function(e,t){const o=e.$$;null!==o.fragment&&(n(o.on_destroy),o.fragment&&o.fragment.d(t),o.on_destroy=o.fragment=null,o.ctx=[])}(this,1),this.$destroy=e}$on(e,t){const o=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return o.push(t),()=>{const e=o.indexOf(t);-1!==e&&o.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}{constructor(e){super(),x(this,e,ye,he,r,{appData:0,starData:5})}}({target:document.body,props:{appData:fe,starData:ge}})}();
//# sourceMappingURL=bundle.js.map
