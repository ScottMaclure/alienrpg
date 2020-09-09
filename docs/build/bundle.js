var app=function(){"use strict";function e(){}function t(e){return e()}function o(){return Object.create(null)}function n(e){e.forEach(t)}function i(e){return"function"==typeof e}function s(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function r(e,t){e.appendChild(t)}function a(e,t,o){e.insertBefore(t,o||null)}function l(e){e.parentNode.removeChild(e)}function d(e){return document.createElement(e)}function c(e){return document.createTextNode(e)}function p(){return c(" ")}function u(e,t,o,n){return e.addEventListener(t,o,n),()=>e.removeEventListener(t,o,n)}function m(e,t,o){null==o?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)}function h(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}let y;function f(e){y=e}function g(){const e=function(){if(!y)throw new Error("Function called outside component initialization");return y}();return(t,o)=>{const n=e.$$.callbacks[t];if(n){const i=function(e,t){const o=document.createEvent("CustomEvent");return o.initCustomEvent(e,!1,!1,t),o}(t,o);n.slice().forEach(t=>{t.call(e,i)})}}}const b=[],S=[],M=[],v=[],w=Promise.resolve();let $=!1;function P(e){M.push(e)}let k=!1;const z=new Set;function A(){if(!k){k=!0;do{for(let e=0;e<b.length;e+=1){const t=b[e];f(t),C(t.$$)}for(b.length=0;S.length;)S.pop()();for(let e=0;e<M.length;e+=1){const t=M[e];z.has(t)||(z.add(t),t())}M.length=0}while(b.length);for(;v.length;)v.pop()();$=!1,k=!1,z.clear()}}function C(e){if(null!==e.fragment){e.update(),n(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(P)}}const x=new Set;function D(e,t){-1===e.$$.dirty[0]&&(b.push(e),$||($=!0,w.then(A)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function T(s,r,a,d,c,p,u=[-1]){const m=y;f(s);const h=r.props||{},g=s.$$={fragment:null,ctx:null,props:p,update:e,not_equal:c,bound:o(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(m?m.$$.context:[]),callbacks:o(),dirty:u,skip_bound:!1};let b=!1;if(g.ctx=a?a(s,h,(e,t,...o)=>{const n=o.length?o[0]:t;return g.ctx&&c(g.ctx[e],g.ctx[e]=n)&&(!g.skip_bound&&g.bound[e]&&g.bound[e](n),b&&D(s,e)),t}):[],g.update(),b=!0,n(g.before_update),g.fragment=!!d&&d(g.ctx),r.target){if(r.hydrate){const e=function(e){return Array.from(e.childNodes)}(r.target);g.fragment&&g.fragment.l(e),e.forEach(l)}else g.fragment&&g.fragment.c();r.intro&&((S=s.$$.fragment)&&S.i&&(x.delete(S),S.i(M))),function(e,o,s){const{fragment:r,on_mount:a,on_destroy:l,after_update:d}=e.$$;r&&r.m(o,s),P(()=>{const o=a.map(t).filter(i);l?l.push(...o):n(o),e.$$.on_mount=[]}),d.forEach(P)}(s,r.target,r.anchor),A()}var S,M;f(m)}var L=e=>!(!e||"F"!==e.toString().toUpperCase()),j=e=>{if("string"!=typeof e)throw new Error("parseDieNotation must be called with a dice notation string");const t=e.toLowerCase().split("d");let o=0;const n={count:parseInt(t[0],10)||1,sides:L(t[1])?"F":parseInt(t[1],10)};if(Number.isNaN(Number(t[1]))){const e=/[+-xX*<>]{1}[\dlL]{1,}/,s=t[1].match(e);if(s)if("string"==typeof(i=s[0])&&/[xX*]{1}[\d]{1,}/.test(i))n.multiply=!0,o=parseInt(s[0].substring(1),10);else if((e=>!(!e||"-L"!==e.toString().toUpperCase()))(s[0]))o=0,n.dropLow=!0;else if((e=>!(!e||!/[<>]{1}[\d]{1,}/.test(e)))(s[0])){const e=s[0].charAt(0);n.success=">"===e?1:-1,o=parseInt(s[0].substring(1),10)}else o=parseInt(s[0],10)}var i;return n.mod=o,n},O=(e,t=Math.random)=>{if(!L(e)&&!Number.isInteger(e))throw new Error("rollDie must be called with an integer or F");return L(e)?Math.ceil(2*t())-1:Math.ceil(t()*(e-1)+1)};const E=(e,t)=>{const{mod:o,multiply:n,dropLow:i,success:s}=t;let r=[...e],a=0;return i&&(r=r.sort((e,t)=>e-t)).shift(),s?r.forEach(e=>{(s<0&&e<=o||s>0&&e>=o)&&(a+=1)}):(r.forEach(e=>{a+=e}),n?a*=o:o&&(a+=o)),a};var N=(e,t=Math.random)=>{const{count:o,sides:n,mod:i,multiply:s,dropLow:r,success:a}=j(e),l=[];for(let e=0;e<o;e+=1){const e=O(n,t);l.push(e)}return{results:l,total:E(l,{mod:i,multiply:s,dropLow:r,success:a})}};const U=(e,t,o=0)=>{let n=N(t+" "+o).total;for(const o of e)if(n<=o[t])return o;throw`Couldn't find a random ${t} item for length ${e.length} array.`},G=(e=0)=>{let t=N("d6").total+e;t=t<1?1:t,t=t>6?6:t;let o=N("d6").total;return parseInt(""+t+o,10)};var I=(e,t,o)=>e.find(e=>e[t]===o),_=e=>e.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,"$1,"),W=(e,t=0)=>U(e,"2d6",t),K=(e,t=0)=>U(e,"3d6",t),R=e=>e[Math.floor(Math.random()*e.length)],H=(e,t=0)=>U(e,"d6",t),q=(e,t=0)=>{const o=G(t);for(const t of e)if(o<=t.d66)return t;throw`Couldn't find a random d66 item for length ${e.length} array.`},J=(e,t)=>Math.floor(Math.random()*(t-e+1))+e,B=e=>{try{return N(e).total}catch(t){throw new Error(`roll fail, rollString=${e}, err=${t}`)}},V=(e,t)=>{const o=e.modifiers[t]?e.modifiers[t]:e.modifiers.default,n=""+e.number+o,i=N(n);return i.total<0?0:i.total};const F=e=>R(e.starTypes),Y=(e,t)=>{t.systemObjects=[];let o=t.starType.type;for(const n of e.systemObjects){let e=V(n,o);for(let o=0;o<e;o++)t.systemObjects.push(Q(n))}},Q=e=>{let t=e.features?R(e.features):null;return{key:e.key,type:e.type,feature:t,habitable:e.habitable,isColonized:!1,planetSizeMod:e.planetSizeMod,colonies:[]}},X=(e,t)=>{let o=null,n=!1;for(;!n;){o=R(e.iccCodes)+"-"+R(e.planetaryNames),t.includes(o)||(n=!0,t.push(o))}return o},Z=(e,t,o)=>{let n=!1,i=!1;for(;!i;)n=R(t.systemObjects),n.habitable&&(n.isColonized=!0,n.name=X(e,o),i=!0)},ee=(e,t)=>{for(let o of t.systemObjects)te(JSON.parse(JSON.stringify(e)),t,o)},te=(e,t,o)=>{const n=o.key;switch(o.planetSize=W(e.planetSizes,o.planetSizeMod),n){case"gasGiant":o.atmosphere=e.atmospheres[e.atmospheres.length-2],o.temperature=W(e.temperatures,o.atmosphere.temperatureMod);break;case"icePlanet":o.atmosphere=W(e.atmospheres,o.planetSize.atmosphereMod),o.temperature=e.temperatures[0];break;case"asteroidBelt":o.atmosphere=e.atmospheres[0],o.temperature=W(e.temperatures,o.atmosphere.temperatureMod);break;case"terrestrialPlanet":o.atmosphere=W(e.atmospheres,o.planetSize.atmosphereMod),o.temperature=W(e.temperatures,o.atmosphere.temperatureMod);break;default:throw new Error(`Unknown world key=${o.key}, aborting.`)}if(o.temperature.average=J(o.temperature.min,o.temperature.max),o.habitable){const t=o.atmosphere.geosphereMod+o.temperature.geosphereMod;if(o.geosphere=W(e.geospheres,t),"icePlanet"===n)o.terrain=W(e.terrains[n]);else{const t=o.geosphere[n]+o.temperature[n];o.terrain=q(e.terrains[n],t)}}if(o.isColonized){const n=ne(),i=o.planetSize.colonySizeMod+o.atmosphere.colonySizeMod;for(let s=0;s<n;s++){let n={};const s=K(e.colonyAllegiances);n.allegiance=s[t.starLocation.colonyAllegianceKey],n.colonySize=JSON.parse(JSON.stringify(W(e.colonySizes,i))),n.colonySize.populationAmount=B(n.colonySize.population),n.colonySize.missions.toLowerCase().includes("d")?n.colonySize.missionsAmount=B(n.colonySize.missions):n.colonySize.missionsAmount=parseInt(n.colonySize.missions),n.missions=[];const r=o.atmosphere.colonyMissionMod+n.colonySize.colonyMissionMod;let a=[];for(let t=0;t<n.colonySize.missionsAmount;t++){let t="",o=!1;for(;!o;)t=W(e.colonyMissions,r),o=!a.includes(t.type);a.push(t.type),n.missions.push(t)}n.orbitalComponents=[];let l=JSON.parse(JSON.stringify(W(e.orbitalComponents,n.colonySize.orbitalComponenMod)));if(l.multiRoll){const t=B(l.multiRoll);for(let o=0;o<t;o++){let t=JSON.parse(JSON.stringify(W(e.orbitalComponents,n.colonySize.orbitalComponenMod)));t.multiRoll?o--:(oe(t),n.orbitalComponents.push(t))}}else oe(l),n.orbitalComponents.push(l);const d=JSON.parse(JSON.stringify(H(e.factionOptions)));if(d.quantity){const e=B(d.quantity);for(let t=0;t<e;t++)d.factions.push({strength:B("d6")})}n.factions=d.factions,o.colonies.push(n)}o.scenarioHook=q(e.scenarioHooks)}},oe=e=>{e.quantity&&(e.quantityAmount=B(e.quantity),e.type=e.quantityAmount+" "+e.type)},ne=()=>B("2d6")>=10?2:1;var ie=(e,t)=>{let o={};t.starLocation&&"ran"!==t.starLocation?o.starLocation=I(e.starLocations,"key",t.starLocation):o.starLocation=R(e.starLocations),o.starLocation.colonyAllegianceKeys&&(o.starLocation.colonyAllegianceKey=R(o.starLocation.colonyAllegianceKeys)),o.starType=F(e),Y(e,o);return Z(e,o,[]),ee(e,o),o.systemObjects.sort((e,t)=>t.temperature.average-e.temperature.average),o};const se="  ",re={showUninhabitedDetails:!0},ae=(e,t,o)=>{let n=[];for(const[i,s]of e.entries())n.push(le(i,s,t)),(s.isColonized||o.showUninhabitedDetails)&&n.push(ce(s,t+"  "));return n.join("\n")},le=(e,t,o)=>`${o}#${(""+(e+1)).padStart(2,0)}: ${t.name?t.name+", ":""}${t.type}${t.feature?", "+t.feature:""}${t.isColonized?", "+t.geosphere.type:" (Uninhabited)"}${de(t)}`,de=e=>{if(!e.habitable)return"";let t=0;for(const o of e.colonies)for(const e of o.orbitalComponents)e.isMoon&&(t+=e.quantityAmount);return 0==t?"":1==t?`, ${t} moon`:`, ${t} moons`},ce=(e,t)=>{let o=[];return e.habitable&&o.push(`${t}Planet Size:  ${_(e.planetSize.sizeKm)} km, ${e.planetSize.surfaceGravity} G${e.planetSize.examples?" (e.g. "+e.planetSize.examples+")":""}`),o.push(`${t}Atmosphere:   ${e.atmosphere.type}`),o.push(`${t}Temperature:  ${e.temperature.type}, ${e.temperature.average}°C average (e.g. ${e.temperature.description})`),e.habitable&&(o.push(`${t}Geosphere:    ${e.geosphere.type}, ${e.geosphere.description}`),o.push(`${t}Terrain:      ${e.terrain.description}`)),e.isColonized&&(o.push(`${t}Hook:         ${e.scenarioHook.description}`),o.push(pe(e,t))),o.join("\n")},pe=(e,t)=>{let o=[],n=t+se;const i="   ";for(const[s,r]of e.colonies.entries())o.push(`${t}Colony #${s+1}:`),o.push(`${n}Allegiance: ${r.allegiance}`),o.push(`${n}Size:       ${r.colonySize.size}, ${_(r.colonySize.populationAmount)} pax`),o.push(ue(r.missions,n,i)),o.push(me(r.orbitalComponents,n,i)),o.push(ye(r.factions,n,i));return o.join("\n")},ue=(e,t,o)=>{let n=[];for(const[t,o]of e.entries())n.push(""+o.type);return`${t}Missions:${o}`+n.join(", ")},me=(e,t,o)=>{let n=[];for(const[t,o]of e.entries())n.push(o.type);return`${t}Orbitals:${o}`+n.join(", ")},he=["weak","balanced","balanced","competing","competing","dominant"],ye=(e,t,o)=>{let n={weak:0,balanced:0,competing:0,dominant:0};for(const t of e)n[he[t.strength-1]]++;let i=[];for(const[e,t]of Object.entries(n))t>0&&i.push(`${t} ${e}`);return`${t}Factions:${o}`+i.join(", ")};var fe=(e,t=re)=>{let o=se;return`Star System:\n  Location: ${e.starLocation.name} (${e.starLocation.colonyAllegianceKey})\n  Type:     ${e.starType.type}, ${e.starType.brightness}: ${e.starType.description}\nPlanetary Bodies (${e.systemObjects.length}):\n${ae(e.systemObjects,o,t)}\n`};function ge(e,t,o){const n=e.slice();return n[13]=t[o],n}function be(e){let t,o,i,s,h,y,f,g,b=e[13].name+"";return{c(){t=d("label"),o=d("input"),s=p(),h=c(b),y=p(),m(o,"type","radio"),o.__value=i=e[13].key,o.value=o.__value,e[11][0].push(o)},m(n,i){a(n,t,i),r(t,o),o.checked=o.__value===e[0].starLocation,r(t,s),r(t,h),r(t,y),f||(g=[u(o,"change",e[6]),u(o,"change",e[10])],f=!0)},p(e,t){1&t&&(o.checked=o.__value===e[0].starLocation)},d(i){i&&l(t),e[11][0].splice(e[11][0].indexOf(o),1),f=!1,n(g)}}}function Se(t){let o,i,s,y,f,g,b,S,M,v,w,$,P,k,z,A,C,x,D,T,L,j,O,E,N,U,G,I,_,W,K,R,H,q,J,B,V,F,Y,Q,X,Z,ee,te,oe=t[1].version+"",ne=t[1].title+"",ie=t[1].title+"",se=t[1].version+"",re=t[1].copyright+"",ae=t[3],le=[];for(let e=0;e<ae.length;e+=1)le[e]=be(ge(t,ae,e));return{c(){o=d("main"),i=d("div"),s=d("small"),y=c(oe),f=p(),g=d("h2"),b=c(ne),S=p(),M=d("p"),M.innerHTML="An <strong><i>unofficial</i></strong> web app to help Game Mothers with their prep.",v=p(),w=d("button"),w.textContent="New Star System",$=p(),P=d("form"),k=d("fieldset"),z=d("legend"),z.textContent="Options",A=p(),C=d("div"),x=d("label"),D=d("input"),T=c(" Show uninhabited details"),L=p(),j=d("fieldset"),O=d("legend"),O.textContent="Star System Location (Pick One)",E=p(),N=d("div");for(let e=0;e<le.length;e+=1)le[e].c();U=p(),G=d("h3"),G.textContent="Results",I=p(),_=d("pre"),W=c(t[2]),K=p(),R=d("footer"),H=d("small"),q=c(ie),J=p(),B=c(se),V=c(". See the "),F=d("a"),Y=c("github repo"),X=c(" for details. "),Z=c(re),m(i,"class","alignRight"),m(D,"type","checkbox"),m(_,"id","results"),m(F,"href",Q=t[1].githubUrl)},m(e,n){a(e,o,n),r(o,i),r(i,s),r(s,y),r(o,f),r(o,g),r(g,b),r(o,S),r(o,M),r(o,v),r(o,w),r(o,$),r(o,P),r(P,k),r(k,z),r(k,A),r(k,C),r(C,x),r(x,D),D.checked=t[0].showUninhabitedDetails,r(x,T),r(P,L),r(P,j),r(j,O),r(j,E),r(j,N);for(let e=0;e<le.length;e+=1)le[e].m(N,null);r(o,U),r(o,G),r(o,I),r(o,_),r(_,W),r(o,K),r(o,R),r(R,H),r(H,q),r(H,J),r(H,B),r(H,V),r(H,F),r(F,Y),r(H,X),r(H,Z),ee||(te=[u(w,"click",t[6]),u(w,"click",t[4]),u(D,"click",t[5]),u(D,"change",t[9])],ee=!0)},p(e,[t]){if(2&t&&oe!==(oe=e[1].version+"")&&h(y,oe),2&t&&ne!==(ne=e[1].title+"")&&h(b,ne),1&t&&(D.checked=e[0].showUninhabitedDetails),73&t){let o;for(ae=e[3],o=0;o<ae.length;o+=1){const n=ge(e,ae,o);le[o]?le[o].p(n,t):(le[o]=be(n),le[o].c(),le[o].m(N,null))}for(;o<le.length;o+=1)le[o].d(1);le.length=ae.length}4&t&&h(W,e[2]),2&t&&ie!==(ie=e[1].title+"")&&h(q,ie),2&t&&se!==(se=e[1].version+"")&&h(B,se),2&t&&Q!==(Q=e[1].githubUrl)&&m(F,"href",Q),2&t&&re!==(re=e[1].copyright+"")&&h(Z,re)},i:e,o:e,d(e){e&&l(o),function(e,t){for(let o=0;o<e.length;o+=1)e[o]&&e[o].d(t)}(le,e),ee=!1,n(te)}}}function Me(e,t,o){let{appData:n}=t,{starData:i}=t,{options:s}=t,{results:r}=t,a="Waiting on User.",l=JSON.parse(JSON.stringify(i.starLocations));l.push({key:"ran",name:"Random"});const d=g();Object.entries(r).length>0&&(a=fe(r,s));return e.$$set=e=>{"appData"in e&&o(1,n=e.appData),"starData"in e&&o(8,i=e.starData),"options"in e&&o(0,s=e.options),"results"in e&&o(7,r=e.results)},[s,n,a,l,function(){o(7,r=ie(i,s)),d("saveData",{key:"results",value:r}),o(2,a=fe(r,s))},function(){o(0,s.showUninhabitedDetails=!s.showUninhabitedDetails,s),d("saveData",{key:"options",value:s}),o(2,a=fe(r,s))},function(){d("saveData",{key:"options",value:s})},r,i,function(){s.showUninhabitedDetails=this.checked,o(0,s)},function(){s.starLocation=this.__value,o(0,s)},[[]]]}var ve={title:"Alien RPG Tools",version:"v0.6.3 Beta",copyright:"Any text taken from the game is used with permission and remains © of their respective owners.",githubUrl:"https://github.com/ScottMaclure/alienrpg/blob/master/README.md"},we={starTypes:[{type:"Giant",description:"Huge, bright and cool star in a late stage of evolution.",brightness:"Type III"},{type:"Subgiant",description:"A large, bright star, exhausting its fuel.",brightness:"Type IV"},{type:"Main Sequence",description:"Small but incredibly common type of star.",brightness:"Type V"},{type:"White Dwarf",description:"A dead, burnt-out star, tiny and super-dense.",brightness:"Type DA"},{type:"Red Dwarf",description:"A red main sequence star, small and cool. Very common star.",brightness:"Type MV"},{type:"White Main Sequence",description:"White main sequence stars that burn hot and brightly.",brightness:"Type A0V"}],starLocations:[{key:"icsc",name:"The Independent Core System Colonies",colonyAllegianceKey:"icsc"},{key:"aja",name:"Anglo-Japanese Arm",colonyAllegianceKey:"aajm"},{key:"upp",name:"The Union of Progressive Peoples",colonyAllegianceKey:"upp"},{key:"arm",name:"The United Americas",colonyAllegianceKey:"aajm"},{key:"fro",name:"The Frontier",colonyAllegianceKeys:["icsc","aajm","upp"]}],systemObjects:[{key:"gasGiant",type:"Gas Giant",number:"d6",modifiers:{default:"-1",Subgiant:"-2","White Dwarf":"-5"},features:["High Winds","Intense Radiation Fields","Rings","Single Super Storm","Small Gas Giant","Storms"],habitable:!1,planetSizeMod:"-4"},{key:"terrestrialPlanet",type:"Terrestrial Planet",number:"d6",modifiers:{default:"","Red Dwarf":"-3","White Dwarf":"-3"},habitable:!0,planetSizeMod:""},{key:"icePlanet",type:"Ice Planet",number:"d6",modifiers:{default:"+1",Subgiant:"",Giant:"","White Main Sequence":""},habitable:!0,planetSizeMod:"-2"},{key:"asteroidBelt",type:"Asteroid Belt",number:"d6",modifiers:{default:"-3","White Dwarf":"-5",Subgiant:"-5"},features:["Bright and highly visible","Contains several large dwarf planets","Dust Belt","High orbital inclination","Intensely mineral rich asteroids","Very wide—covering several orbits"],habitable:!1,planetSizeMod:""}],iccCodes:["LV","MT","RF"],planetaryNames:["Arges","Aurora","Damnation","Doramin","Euphrates","Hamilton","Hannibal","Magdala","Moab","Monos","Nakaya","Napier","Nemesis","Nero","Nocturne","Phaeton","Prospero","Requiem","Solitude","Steropes","Tracatus"],planetSizes:[{"2d6":2,sizeKm:999,surfaceGravity:0,examples:"Ceres and other asteroids",atmosphereMod:"-6",colonySizeMod:-3},{"2d6":4,sizeKm:2e3,surfaceGravity:.1,examples:"Iapetus",atmosphereMod:-6,colonySizeMod:-3},{"2d6":6,sizeKm:4e3,surfaceGravity:.2,examples:"Luna, Europa",atmosphereMod:-6,colonySizeMod:-3},{"2d6":7,sizeKm:7e3,surfaceGravity:.5,examples:"Mars",atmosphereMod:-2,colonySizeMod:0},{"2d6":8,sizeKm:1e4,surfaceGravity:.7,examples:null,atmosphereMod:0,colonySizeMod:0},{"2d6":10,sizeKm:12500,surfaceGravity:1,examples:"Earth, Venus",atmosphereMod:0,colonySizeMod:0},{"2d6":11,sizeKm:15e3,surfaceGravity:1.3,examples:null,atmosphereMod:0,colonySizeMod:0},{"2d6":50,sizeKm:2e4,surfaceGravity:2,examples:"Super-Earth",atmosphereMod:0,colonySizeMod:0}],atmospheres:[{"2d6":3,type:"Thin",temperatureMod:-4,geosphereMod:-4,colonySizeMod:0,colonyMissionMod:0},{"2d6":6,type:"Breathable",temperatureMod:0,geosphereMod:0,colonySizeMod:1,colonyMissionMod:1},{"2d6":8,type:"Toxic",temperatureMod:0,geosphereMod:0,colonySizeMod:0,colonyMissionMod:-6},{"2d6":9,type:"Dense",temperatureMod:1,geosphereMod:-4,colonySizeMod:0,colonyMissionMod:0},{"2d6":10,type:"Corrosive",temperatureMod:6,geosphereMod:-4,colonySizeMod:-2,colonyMissionMod:-6},{"2d6":11,type:"Infiltrating",temperatureMod:6,geosphereMod:-4,colonySizeMod:-2,colonyMissionMod:-6},{"2d6":50,type:"Special",temperatureMod:0,geosphereMod:8,colonySizeMod:0,colonyMissionMod:0}],temperatures:[{"2d6":3,type:"Frozen",min:-100,max:-50,description:"Titan, Pluto, Enceladus",geosphereMod:-2,terrestrialPlanet:-2,icePlanet:0},{"2d6":5,type:"Cold",min:-50,max:0,description:"Alaska or Antarctica in winter",geosphereMod:0,terrestrialPlanet:0,icePlanet:0},{"2d6":7,type:"Temperate",min:0,max:30,description:"Boston or Paris",geosphereMod:0,terrestrialPlanet:0,icePlanet:0},{"2d6":10,type:"Hot",min:31,max:80,description:"Titan, Pluto, Enceladus",geosphereMod:-2,terrestrialPlanet:0,icePlanet:0},{"2d6":50,type:"Burning",min:80,max:200,description:"Mercury, Venus",geosphereMod:-4,terrestrialPlanet:0,icePlanet:0}],geospheres:[{"2d6":4,type:"Desert World",description:"No surface water",terrestrialPlanet:-3,icePlanet:0},{"2d6":6,type:"Arid World",description:"Global deserts and dry steppes, with some lakes and small seas",terrestrialPlanet:-2,icePlanet:0},{"2d6":8,type:"Temperate-Dry World",description:"Oceans cover 30–40% of the world's surface",terrestrialPlanet:0,icePlanet:0},{"2d6":10,type:"Temperate-Wet World",description:"Oceans cover 60–70% of the world's surface",terrestrialPlanet:0,icePlanet:0},{"2d6":11,type:"Wet World",description:"Global oceans with some islands and archipelagos",terrestrialPlanet:2,icePlanet:0},{"2d6":50,type:"Water World",description:"No dry land",terrestrialPlanet:3,icePlanet:0}],terrains:{terrestrialPlanet:[{d66:11,description:"Huge impact crater"},{d66:12,description:"Plains of silicon glass"},{d66:13,description:"Disturbing wind-cut rock formations"},{d66:14,description:"Permanent global dust-storm"},{d66:15,description:"Eerily colored dust plains"},{d66:16,description:"Active volcanic lava fields"},{d66:21,description:"Extensive salt flats"},{d66:22,description:"Dust-laden, permanent sunset sky"},{d66:23,description:"Ancient, blackened lava plains"},{d66:24,description:"Thermal springs and steam vents"},{d66:25,description:"Tall, gravel-strewn mountains"},{d66:26,description:"Howling winds that never stop"},{d66:31,description:"Daily fog banks roll in"},{d66:32,description:"Deep and wide rift valleys"},{d66:33,description:"Bizarrely eroded, wind-cut badlands"},{d66:34,description:"Steep-sided river gorges cut into soft rocks"},{d66:35,description:"Huge moon dominates day/night sky"},{d66:36,description:"World-spanning super canyon"},{d66:41,description:"Impressive river of great length"},{d66:42,description:"Oddly colored forests of alien vegetation"},{d66:43,description:"Mountains cut by sky-blue lakes"},{d66:44,description:"Sweeping plains of elephant grass"},{d66:45,description:"Highly toxic, but beautiful, plant-life"},{d66:46,description:"Small, bright, incredibly fast moons in orbit"},{d66:51,description:"Vast and complex river delta"},{d66:52,description:"Immense series of waterfalls"},{d66:53,description:"Endless mudflats with twisting water-ways"},{d66:54,description:"Impressive coastline of fjords and cliffs"},{d66:55,description:"Volcanoes, active & widespread"},{d66:56,description:"Impenetrable jungle"},{d66:61,description:"Dangerous tides—fast and loud"},{d66:62,description:"Vast, permanent super storm"},{d66:63,description:"Toxic sea creatures floating with the currents"},{d66:64,description:"Volcanic island chains"},{d66:65,description:"Permanently overcast with unrelenting rainfall"},{d66:100,description:"Mildly acidic oceans and rainfall"}],icePlanet:[{"2d6":2,description:"Huge impact crater"},{"2d6":3,description:"Geysers spew water into low orbit from long fissures"},{"2d6":4,description:"Deep fissures leading to a subsurface ocean"},{"2d6":5,description:"Dramatically colored blue-green ice fissures"},{"2d6":6,description:"Huge and active cryovolcano"},{"2d6":7,description:"Vast range of ice mountains"},{"2d6":8,description:"World-spanning super canyon"},{"2d6":9,description:"Disturbing, wind-cut ice formations"},{"2d6":10,description:"Black, dust-covered ice plains"},{"2d6":11,description:"Impressive ice escarpment of great length"},{"2d6":100,description:"Extensive dune-fields of methane sand grains"}]},colonySizes:[{"2d6":"7",size:"Start-Up",population:"3d6x10",missions:"1",colonyMissionMod:-1,orbitalComponenMod:0},{"2d6":"10",size:"Young",population:"3d6x100",missions:"d3–1",colonyMissionMod:0,orbitalComponenMod:1},{"2d6":"50",size:"Established",population:"2d6x1000",missions:"d3",colonyMissionMod:4,orbitalComponenMod:2}],colonyMissions:[{"2d6":2,type:"Terraforming"},{"2d6":3,type:"Research"},{"2d6":4,type:"Survey and Prospecting"},{"2d6":5,type:"Prison/Secluded or Exile"},{"2d6":6,type:"Mining and Refining"},{"2d6":7,type:"Mineral Drilling"},{"2d6":8,type:"Communications Relay"},{"2d6":9,type:"Military"},{"2d6":10,type:"Cattle Ranching/Logging"},{"2d6":11,type:"Corporate HQ"},{"2d6":50,type:"Government HQ"}],orbitalComponents:[{"2d6":4,type:"Little (perhaps wreckage) or nothing"},{"2d6":5,type:"Ring"},{"2d6":6,type:"Abandoned or Repurposed Satellite or Space Station"},{"2d6":8,type:"Moons",quantity:"d3",isMoon:!0},{"2d6":9,type:"Survey Station"},{"2d6":10,type:"Several Survey and Communications Satellites"},{"2d6":11,type:"Transfer Station"},{"2d6":50,multiRoll:"d6"}],factionOptions:[{d6:1,factions:[{strength:6}]},{d6:2,factions:[{strength:3},{strength:3}]},{d6:3,factions:[{strength:5},{strength:5}]},{d6:4,factions:[{strength:6},{strength:1}]},{d6:5,factions:[{strength:5},{strength:5},{strength:5}]},{d6:6,quantity:"d6",factions:[]}],colonyAllegiances:[{"3d6":4,icsc:"Kelland Mining",aajm:"Kelland Mining",upp:"UPP"},{"3d6":5,icsc:"GeoFund Investor",aajm:"Gustafsson Enterprise",upp:"UPP"},{"3d6":6,icsc:"Gustafsson Enterprise",aajm:"GeoFund Investor",upp:"UPP"},{"3d6":7,icsc:"Seegson",aajm:"Lasalle Bionational",upp:"UPP"},{"3d6":8,icsc:"No allegiance (independent)",aajm:"Weyland-Yutani",upp:"UPP"},{"3d6":11,icsc:"Jĭngtì Lóng Corporation",aajm:"Government representative",upp:"UPP"},{"3d6":12,icsc:"Chigusa Corporation",aajm:"Weyland-Yutani",upp:"UPP"},{"3d6":13,icsc:"Lasalle Bionational",aajm:"Seegson",upp:"UPP"},{"3d6":14,icsc:"Seegson",aajm:"Jĭngtì Lóng Corporation",upp:"UPP"},{"3d6":15,icsc:"Lorenz SysTech",aajm:"Chigusa Corporation",upp:"UPP"},{"3d6":16,icsc:"Gemini Exoplanet",aajm:"Gemini Exoplanet",upp:"UPP"},{"3d6":50,icsc:"Farside Mining",aajm:"Farside Mining",upp:"UPP"}],scenarioHooks:[{d66:11,description:"Pilfering and thefts force security to search rooms and lockers."},{d66:12,description:"Incidents of sabotage are increasing; security suspects an organized campaign."},{d66:13,description:"Colonial Administration is investigating the colony for illegal practices."},{d66:14,description:"Colonists returning to base report sighting a ‘monster’ on the surface."},{d66:15,description:"Petty crime, thefts and sabotage are rife. "},{d66:16,description:"Equipment failure has resulted in rationing at the colony. Tempers are frayed."},{d66:21,description:"Ship recently arrived with some kind of parasite that will soon spread through the colony."},{d66:22,description:"Stolen goods are on offer—cheap! "},{d66:23,description:"Unknown to you an old friend/flame is at the colony."},{d66:24,description:"Unknown to you an old enemy/rival is at the colony."},{d66:25,description:"A minor dignitary/notable is visiting in the company of several aides or guards."},{d66:26,description:"Part of the colony is off-limits temporarily - no reason given."},{d66:31,description:"Sudden restriction on free movement, unless you can find a way to avoid it."},{d66:32,description:"An emergency means repair parts and vital supplies are being shipped in from a nearby colony."},{d66:33,description:"Local crisis about to hit (storm, earthquake, riot, fire, etc.)"},{d66:34,description:"Period of solar flare—will cut communications for one Shift (D6 days if star type MV)."},{d66:35,description:"Spies from a neighboring colony have been discovered and arrested."},{d66:36,description:"Operations manager and his deputy are in conflict; everyone is choosing sides."},{d66:41,description:"PCs are invited to a formal dinner, meeting or party."},{d66:42,description:"The local colonists are not what they seem."},{d66:43,description:"A military ship is in orbit and the landing party is searching for someone/something."},{d66:44,description:"A rival colony or corporation is about to carry out an act of sabotage."},{d66:45,description:"The spaceport is currently quarantined."},{d66:46,description:"Security situation at the colony."},{d66:51,description:"A bunch of asteroid miners causing trouble while on leave."},{d66:52,description:"Mystery ship arrives at the spaceport."},{d66:53,description:"Civil unrest is about to break out."},{d66:54,description:"Colonists are trapped and need rescuing far from the settlement itself."},{d66:55,description:"Authorities have just locked down the colony after a riot."},{d66:56,description:"A religious leader is whipping up discontent."},{d66:61,description:"PCs will be harassed by angry locals. Why the anger? And why directed at off-world personnel?"},{d66:62,description:"An expedition is being assembled for a trek overland—the PCs are invited."},{d66:63,description:"An important colonial official is murdered, only an hour after you arrive."},{d66:64,description:"Several colonists have gone missing — a search is underway."},{d66:65,description:"A lifeboat has crashed on planet, and contained an interesting individual."},{d66:100,description:"The corporation or government paying for the colony keeps ordering teams out to search remote areas—but won’t say what they are searching for."}]},$e={_comments:["Default options for the UI. Saved to window.localStorage."],starLocation:"ran",showUninhabitedDetails:!1};let Pe=window.sessionStorage.getItem("options"),ke=Pe?JSON.parse(Pe):$e,ze=window.sessionStorage.getItem("results"),Ae=ze?JSON.parse(ze):{};const Ce=new class extends class{$destroy(){!function(e,t){const o=e.$$;null!==o.fragment&&(n(o.on_destroy),o.fragment&&o.fragment.d(t),o.on_destroy=o.fragment=null,o.ctx=[])}(this,1),this.$destroy=e}$on(e,t){const o=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return o.push(t),()=>{const e=o.indexOf(t);-1!==e&&o.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}{constructor(e){super(),T(this,e,Me,Se,s,{appData:1,starData:8,options:0,results:7})}}({target:document.body,props:{appData:ve,starData:we,options:ke,results:Ae}});return Ce.$on("saveData",e=>{console.debug(`saveData: Saving ${e.detail.key} to sessionStorage.`),window.sessionStorage.setItem(e.detail.key,JSON.stringify(e.detail.value))}),Ce}();
//# sourceMappingURL=bundle.js.map
