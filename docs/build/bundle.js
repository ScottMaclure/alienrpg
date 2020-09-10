var app=function(){"use strict";function e(){}function t(e){return e()}function o(){return Object.create(null)}function n(e){e.forEach(t)}function i(e){return"function"==typeof e}function s(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function r(e,t){e.appendChild(t)}function a(e,t,o){e.insertBefore(t,o||null)}function l(e){e.parentNode.removeChild(e)}function d(e){return document.createElement(e)}function c(e){return document.createTextNode(e)}function p(){return c(" ")}function u(e,t,o,n){return e.addEventListener(t,o,n),()=>e.removeEventListener(t,o,n)}function m(e,t,o){null==o?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)}function y(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}let h;function f(e){h=e}function g(){const e=function(){if(!h)throw new Error("Function called outside component initialization");return h}();return(t,o)=>{const n=e.$$.callbacks[t];if(n){const i=function(e,t){const o=document.createEvent("CustomEvent");return o.initCustomEvent(e,!1,!1,t),o}(t,o);n.slice().forEach(t=>{t.call(e,i)})}}}const b=[],S=[],v=[],M=[],w=Promise.resolve();let $=!1;function k(e){v.push(e)}let z=!1;const P=new Set;function C(){if(!z){z=!0;do{for(let e=0;e<b.length;e+=1){const t=b[e];f(t),A(t.$$)}for(b.length=0;S.length;)S.pop()();for(let e=0;e<v.length;e+=1){const t=v[e];P.has(t)||(P.add(t),t())}v.length=0}while(b.length);for(;M.length;)M.pop()();$=!1,z=!1,P.clear()}}function A(e){if(null!==e.fragment){e.update(),n(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(k)}}const x=new Set;function D(e,t){e&&e.i&&(x.delete(e),e.i(t))}function O(e,o,s){const{fragment:r,on_mount:a,on_destroy:l,after_update:d}=e.$$;r&&r.m(o,s),k(()=>{const o=a.map(t).filter(i);l?l.push(...o):n(o),e.$$.on_mount=[]}),d.forEach(k)}function j(e,t){const o=e.$$;null!==o.fragment&&(n(o.on_destroy),o.fragment&&o.fragment.d(t),o.on_destroy=o.fragment=null,o.ctx=[])}function G(e,t){-1===e.$$.dirty[0]&&(b.push(e),$||($=!0,w.then(C)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function T(t,i,s,r,a,d,c=[-1]){const p=h;f(t);const u=i.props||{},m=t.$$={fragment:null,ctx:null,props:d,update:e,not_equal:a,bound:o(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(p?p.$$.context:[]),callbacks:o(),dirty:c,skip_bound:!1};let y=!1;if(m.ctx=s?s(t,u,(e,o,...n)=>{const i=n.length?n[0]:o;return m.ctx&&a(m.ctx[e],m.ctx[e]=i)&&(!m.skip_bound&&m.bound[e]&&m.bound[e](i),y&&G(t,e)),o}):[],m.update(),y=!0,n(m.before_update),m.fragment=!!r&&r(m.ctx),i.target){if(i.hydrate){const e=function(e){return Array.from(e.childNodes)}(i.target);m.fragment&&m.fragment.l(e),e.forEach(l)}else m.fragment&&m.fragment.c();i.intro&&D(t.$$.fragment),O(t,i.target,i.anchor),C()}f(p)}class L{$destroy(){j(this,1),this.$destroy=e}$on(e,t){const o=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return o.push(t),()=>{const e=o.indexOf(t);-1!==e&&o.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}function N(e,t,o){const n=e.slice();return n[9]=t[o],n}function E(e){let t,o,i,s,y,h,f,g,b=e[9].name+"";return{c(){t=d("label"),o=d("input"),s=p(),y=c(b),h=p(),m(o,"type","radio"),o.__value=i=e[9].key,o.value=o.__value,e[7][0].push(o)},m(n,i){a(n,t,i),r(t,o),o.checked=o.__value===e[0].starLocation,r(t,s),r(t,y),r(t,h),f||(g=[u(o,"click",e[3]),u(o,"change",e[6])],f=!0)},p(e,t){1&t&&(o.checked=o.__value===e[0].starLocation)},d(i){i&&l(t),e[7][0].splice(e[7][0].indexOf(o),1),f=!1,n(g)}}}function I(t){let o,i,s,y,h,f,g,b,S,v,M,w,$,k,z,P,C=t[1],A=[];for(let e=0;e<C.length;e+=1)A[e]=E(N(t,C,e));return{c(){o=d("div"),i=d("form"),s=d("fieldset"),y=d("legend"),y.textContent="Options",h=p(),f=d("div"),g=d("label"),b=d("input"),S=c(" Show surveyed details"),v=p(),M=d("fieldset"),w=d("legend"),w.textContent="Star System Location",$=p(),k=d("div");for(let e=0;e<A.length;e+=1)A[e].c();m(b,"type","checkbox")},m(e,n){a(e,o,n),r(o,i),r(i,s),r(s,y),r(s,h),r(s,f),r(f,g),r(g,b),b.checked=t[0].showSurveyedDetails,r(g,S),r(i,v),r(i,M),r(M,w),r(M,$),r(M,k);for(let e=0;e<A.length;e+=1)A[e].m(k,null);z||(P=[u(b,"click",t[2]),u(b,"change",t[5])],z=!0)},p(e,[t]){if(1&t&&(b.checked=e[0].showSurveyedDetails),11&t){let o;for(C=e[1],o=0;o<C.length;o+=1){const n=N(e,C,o);A[o]?A[o].p(n,t):(A[o]=E(n),A[o].c(),A[o].m(k,null))}for(;o<A.length;o+=1)A[o].d(1);A.length=C.length}},i:e,o:e,d(e){e&&l(o),function(e,t){for(let o=0;o<e.length;o+=1)e[o]&&e[o].d(t)}(A,e),z=!1,n(P)}}}function _(e,t,o){let{starData:n}=t,{options:i}=t;const s=g();let r=JSON.parse(JSON.stringify(n.starLocations));r.push({key:"ran",name:"Random"});return e.$$set=e=>{"starData"in e&&o(4,n=e.starData),"options"in e&&o(0,i=e.options)},[i,r,function(){o(0,i.showSurveyedDetails=!i.showSurveyedDetails,i),s("saveOptions")},function(){s("saveOptions")},n,function(){i.showSurveyedDetails=this.checked,o(0,i)},function(){i.starLocation=this.__value,o(0,i)},[[]]]}class U extends L{constructor(e){super(),T(this,e,_,I,s,{starData:4,options:0})}}var W=e=>!(!e||"F"!==e.toString().toUpperCase()),J=e=>{if("string"!=typeof e)throw new Error("parseDieNotation must be called with a dice notation string");const t=e.toLowerCase().split("d");let o=0;const n={count:parseInt(t[0],10)||1,sides:W(t[1])?"F":parseInt(t[1],10)};if(Number.isNaN(Number(t[1]))){const e=/[+-xX*<>]{1}[\dlL]{1,}/,s=t[1].match(e);if(s)if("string"==typeof(i=s[0])&&/[xX*]{1}[\d]{1,}/.test(i))n.multiply=!0,o=parseInt(s[0].substring(1),10);else if((e=>!(!e||"-L"!==e.toString().toUpperCase()))(s[0]))o=0,n.dropLow=!0;else if((e=>!(!e||!/[<>]{1}[\d]{1,}/.test(e)))(s[0])){const e=s[0].charAt(0);n.success=">"===e?1:-1,o=parseInt(s[0].substring(1),10)}else o=parseInt(s[0],10)}var i;return n.mod=o,n},K=(e,t=Math.random)=>{if(!W(e)&&!Number.isInteger(e))throw new Error("rollDie must be called with an integer or F");return W(e)?Math.ceil(2*t())-1:Math.ceil(t()*(e-1)+1)};const q=(e,t)=>{const{mod:o,multiply:n,dropLow:i,success:s}=t;let r=[...e],a=0;return i&&(r=r.sort((e,t)=>e-t)).shift(),s?r.forEach(e=>{(s<0&&e<=o||s>0&&e>=o)&&(a+=1)}):(r.forEach(e=>{a+=e}),n?a*=o:o&&(a+=o)),a};var H=(e,t=Math.random)=>{const{count:o,sides:n,mod:i,multiply:s,dropLow:r,success:a}=J(e),l=[];for(let e=0;e<o;e+=1){const e=K(n,t);l.push(e)}return{results:l,total:q(l,{mod:i,multiply:s,dropLow:r,success:a})}};const R=(e,t,o=0)=>{let n=H(t+" "+o).total;for(const o of e)if(n<=o[t])return o;throw`Couldn't find a random ${t} item for length ${e.length} array.`},V=(e=0)=>{let t=H("d6").total+e;t=t<1?1:t,t=t>6?6:t;let o=H("d6").total;return parseInt(""+t+o,10)};var B=(e,t,o)=>e.find(e=>e[t]===o),F=e=>e.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,"$1,"),Y=(e,t=0)=>R(e,"2d6",t),Q=(e,t=0)=>R(e,"3d6",t),X=e=>e[Math.floor(Math.random()*e.length)],Z=(e,t=0)=>R(e,"d6",t),ee=(e,t=0)=>{const o=V(t);for(const t of e)if(o<=t.d66)return t;throw`Couldn't find a random d66 item for length ${e.length} array.`},te=(e,t)=>Math.floor(Math.random()*(t-e+1))+e,oe=e=>{try{return H(e).total}catch(t){throw new Error(`roll fail, rollString=${e}, err=${t}`)}},ne=(e,t)=>{const o=e.modifiers[t]?e.modifiers[t]:e.modifiers.default,n=""+e.number+o,i=H(n);return i.total<0?0:i.total};const ie=e=>X(e.starTypes),se=(e,t)=>{t.systemObjects=[];let o=t.starType.type;for(const n of e.systemObjects)if(n.enabled){let i=ne(n,o);for(let o=0;o<i;o++)t.systemObjects.push(re(e,n))}},re=(e,t)=>{let o=t.features?X(t.features):null,n={key:t.key,type:t.type,feature:o,habitable:t.habitable,surveyable:t.surveyable,isColonized:!1,isSurveyed:t.surveyable&&1===te(0,1),planetSizeMod:t.planetSizeMod,orbitalComponents:[],colonies:[]};if("gasGiant"===n.key){let o=oe("d6+4"),i=JSON.parse(JSON.stringify(B(e.systemObjects,"key","terrestrialPlanet")));i.type="Gas Giant Moon",i.planetSizeMod=t.moonSizeMod;for(let t=0;t<o;t++){let t=re(e,i);t.isMoon=!0,t.isGasGiantMoon=!0,n.orbitalComponents.push(t)}}return n},ae=(e,t,o)=>{let n=!1;for(;!n;){let o=X(t.systemObjects);if("gasGiant"===o.key){o.isSurveyed=!0;let t=X(o.orbitalComponents);le(e,t),n=!0}else o.habitable&&(le(e,o),n=!0)}},le=(e,t)=>{t.isColonized=!0,t.isSurveyed=!0,t.name=X(e.planetaryNames)},de=(e,t)=>{let o=[];for(let n of t.systemObjects)if(ce(JSON.parse(JSON.stringify(e)),t,n,o),"gasGiant"===n.key)for(let i of n.orbitalComponents)ce(JSON.parse(JSON.stringify(e)),t,i,o)},ce=(e,t,o,n)=>{switch(o.name=o.isColonized?X(e.planetaryNames):o.isSurveyed?((e,t)=>{let o=null,n=!1;for(;!n;)o=X(e.iccCodes)+"-"+te(111,999),t.includes(o)||(n=!0,t.push(o));return o})(e,n):null,o.planetSize=Y(e.planetSizes,o.planetSizeMod),o.key){case"gasGiant":o.atmosphere=e.atmospheres[e.atmospheres.length-2],o.temperature=Y(e.temperatures,o.atmosphere.temperatureMod);break;case"icePlanet":o.atmosphere=Y(e.atmospheres,o.planetSize.atmosphereMod),o.temperature=e.temperatures[0];break;case"asteroidBelt":o.atmosphere=e.atmospheres[0],o.temperature=Y(e.temperatures,o.atmosphere.temperatureMod);break;case"terrestrialPlanet":o.atmosphere=Y(e.atmospheres,o.planetSize.atmosphereMod),o.temperature=Y(e.temperatures,o.atmosphere.temperatureMod);break;default:throw new Error(`Unknown world key=${o.key}, aborting.`)}if(o.temperature.average=te(o.temperature.min,o.temperature.max),o.habitable){const t=o.atmosphere.geosphereMod+o.temperature.geosphereMod;if(o.geosphere=Y(e.geospheres,t),"icePlanet"===o.key)o.terrain=Y(e.terrains[o.key]);else{const t=o.geosphere[o.key]+o.temperature[o.key];o.terrain=ee(e.terrains[o.key],t)}}if(o.isColonized){const n=ue(),i=o.planetSize.colonySizeMod+o.atmosphere.colonySizeMod;for(let s=0;s<n;s++){let n={name:"Colony "+(s+1)};const r=Q(e.colonyAllegiances);n.allegiance=r[t.starLocation.colonyAllegianceKey],n.colonySize=JSON.parse(JSON.stringify(Y(e.colonySizes,i))),n.colonySize.populationAmount=oe(n.colonySize.population),n.colonySize.missions.toLowerCase().includes("d")?n.colonySize.missionsAmount=oe(n.colonySize.missions):n.colonySize.missionsAmount=parseInt(n.colonySize.missions),n.missions=[];const a=o.atmosphere.colonyMissionMod+n.colonySize.colonyMissionMod;let l=[];for(let t=0;t<n.colonySize.missionsAmount;t++){let t="",o=!1;for(;!o;)t=Y(e.colonyMissions,a),o=!l.includes(t.type);l.push(t.type),n.missions.push(t)}if(!o.isGasGiantMoon){let t=JSON.parse(JSON.stringify(Y(e.orbitalComponents,n.colonySize.orbitalComponenMod)));if(t.multiRoll){const i=oe(t.multiRoll);for(let t=0;t<i;t++){let i=JSON.parse(JSON.stringify(Y(e.orbitalComponents,n.colonySize.orbitalComponenMod)));i.multiRoll?t--:(i.owner=n.name,pe(i),o.orbitalComponents.push(i))}}else t.owner=n.name,pe(t),o.orbitalComponents.push(t)}const d=JSON.parse(JSON.stringify(Z(e.factionOptions)));if(d.quantity){const e=oe(d.quantity);for(let t=0;t<e;t++)d.factions.push({strength:oe("d6")})}n.factions=d.factions,o.colonies.push(n)}o.scenarioHook=ee(e.scenarioHooks)}else if("gasGiant"===o.key);else{let e={type:"Moons",quantity:"d3-1",isMoon:!0};pe(e),o.orbitalComponents.push(e)}},pe=e=>{e.quantity&&(e.quantityAmount=oe(e.quantity),e.type=e.quantityAmount+" "+e.type)},ue=()=>oe("2d6")>=10?2:1;var me=(e,t={})=>{let o={};if(t.starLocation&&"ran"!==t.starLocation?o.starLocation=B(e.starLocations,"key",t.starLocation):o.starLocation=X(e.starLocations),o.starLocation.colonyAllegianceKeys&&(o.starLocation.colonyAllegianceKey=X(o.starLocation.colonyAllegianceKeys)),o.starType=ie(e),se(e,o),0===o.systemObjects.length)throw new Error("Failed to generate any system objects.");return ae(e,o),de(e,o),o.systemObjects.sort((e,t)=>t.temperature.average-e.temperature.average),o};const ye="  ",he={showSurveyedDetails:!0},fe=(e,t,o)=>{let n=[];for(const[i,s]of e.entries())n.push(be("#"+(i+1),s,t)),(s.isColonized||ge(s)||s.isSurveyed&&o.showSurveyedDetails)&&n.push(ve(s,o,t+"  "));return n.join("\n")},ge=e=>{if("gasGiant"!==e.key)return!1;for(let t of e.orbitalComponents)if(t.isColonized)return!0;return!1},be=(e,t,o)=>{let n=[`${o}${(""+e).padStart(2,0)}: `];return n.push(t.type),n.push(t.name?` "${t.name}"`:" (Unsurveyed)"),n.push(t.feature?", "+t.feature:""),n.push(t.isColonized?", "+t.geosphere.type:""),n.push(Se(t)),n.join("")},Se=e=>{let t=0;for(const o of e.orbitalComponents)o.isMoon&&(t+=o.quantityAmount||1);return 0==t?"":1==t?`, ${t} moon`:`, ${t} moons`},ve=(e,t,o)=>{let n=[];return n.push(`${o}Planet Size:  ${F(e.planetSize.sizeKm)} km, ${e.planetSize.surfaceGravity} G${e.planetSize.examples?" (e.g. "+e.planetSize.examples+")":""}`),n.push(`${o}Atmosphere:   ${e.atmosphere.type}`),n.push(`${o}Temperature:  ${e.temperature.type}, ${e.temperature.average}°C average (e.g. ${e.temperature.description})`),e.habitable&&(n.push(`${o}Geosphere:    ${e.geosphere.type}, ${e.geosphere.description}`),n.push(`${o}Terrain:      ${e.terrain.description}`)),e.orbitalComponents.length>0&&(e.isColonized||ge(e))&&n.push($e(e,t,o,"     ")),e.isColonized&&(n.push(`${o}Hook:         ${e.scenarioHook.description}`),n.push(Me(e,o))),n.join("\n")},Me=(e,t)=>{let o=[],n=t+ye;for(const[i,s]of e.colonies.entries())o.push(`${t}Colony #${i+1}:`),o.push(`${n}Allegiance: ${s.allegiance}`),o.push(`${n}Size:       ${s.colonySize.size}, ${F(s.colonySize.populationAmount)} pax`),o.push(we(s.missions,n,"   ")),o.push(ze(s.factions,n,"   "));return o.join("\n")},we=(e,t,o)=>{let n=[];for(const[t,o]of e.entries())n.push(""+o.type);return`${t}Missions:${o}`+n.join(", ")},$e=(e,t,o,n)=>{let i=[];if("gasGiant"===e.key){for(const[n,s]of e.orbitalComponents.entries())i.push("\n"),i.push(be("Moon #"+(n+1),s,o+ye)),(s.isColonized||s.isSurveyed&&t.showSurveyedDetails)&&(i.push("\n"),i.push(ve(s,t,o+ye+ye)));return o+"Orbitals:"+i.join("")}if(e.orbitalComponents.length>0){for(const t of e.orbitalComponents)i.push(`${t.type}${t.owner?" ("+t.owner+")":""}`);return`${o}Orbitals:${n}`+i.join(", ")}return""},ke=["weak","balanced","balanced","competing","competing","dominant"],ze=(e,t,o)=>{let n={weak:0,balanced:0,competing:0,dominant:0};for(const t of e)n[ke[t.strength-1]]++;let i=[];for(const[e,t]of Object.entries(n))t>0&&i.push(`${t} ${e}`);return`${t}Factions:${o}`+i.join(", ")};var Pe=(e,t=he)=>{let o=ye;return`Star System:\n  Location: ${e.starLocation.name} (${e.starLocation.colonyAllegianceKey})\n  Type:     ${e.starType.type}, ${e.starType.brightness}: ${e.starType.description}\nPlanetary Bodies (${e.systemObjects.length}):\n${fe(e.systemObjects,o,t)}\n`};function Ce(e){let t,o,i,s,h,f,g,b,S,v,M,w,$,k,z,P,C,A,G,T,L,N,E,I,_,W,J,K,q,H,R,V,B=e[0].title+"",F=e[0].title+"",Y=e[0].version+"",Q=e[0].copyright+"",X=e[0].version+"";return S=new U({props:{starData:e[1],options:e[2]}}),S.$on("saveOptions",e[5]),{c(){var n;t=d("main"),o=d("h2"),i=c(B),s=p(),h=d("p"),h.innerHTML="An <strong><i>unofficial</i></strong> web app to help Game Mothers with their prep.",f=p(),g=d("button"),g.textContent="New Star System",b=p(),(n=S.$$.fragment)&&n.c(),v=p(),M=d("h3"),M.textContent="Results",w=p(),$=d("pre"),k=c(e[3]),z=p(),P=d("footer"),C=d("small"),A=c(F),G=p(),T=c(Y),L=c(". See the "),N=d("a"),E=c("github repo"),_=c(" for details. "),W=c(Q),J=c(" Last updated "),K=c(X),q=c("."),m($,"id","results"),m(N,"href",I=e[0].githubUrl)},m(n,l){a(n,t,l),r(t,o),r(o,i),r(t,s),r(t,h),r(t,f),r(t,g),r(t,b),O(S,t,null),r(t,v),r(t,M),r(t,w),r(t,$),r($,k),r(t,z),r(t,P),r(P,C),r(C,A),r(C,G),r(C,T),r(C,L),r(C,N),r(N,E),r(C,_),r(C,W),r(C,J),r(C,K),r(C,q),H=!0,R||(V=[u(g,"click",e[5]),u(g,"click",e[4])],R=!0)},p(e,[t]){(!H||1&t)&&B!==(B=e[0].title+"")&&y(i,B);const o={};2&t&&(o.starData=e[1]),4&t&&(o.options=e[2]),S.$set(o),(!H||8&t)&&y(k,e[3]),(!H||1&t)&&F!==(F=e[0].title+"")&&y(A,F),(!H||1&t)&&Y!==(Y=e[0].version+"")&&y(T,Y),(!H||1&t&&I!==(I=e[0].githubUrl))&&m(N,"href",I),(!H||1&t)&&Q!==(Q=e[0].copyright+"")&&y(W,Q),(!H||1&t)&&X!==(X=e[0].version+"")&&y(K,X)},i(e){H||(D(S.$$.fragment,e),H=!0)},o(e){!function(e,t,o,n){if(e&&e.o){if(x.has(e))return;x.add(e),(void 0).c.push(()=>{x.delete(e),n&&(o&&e.d(1),n())}),e.o(t)}}(S.$$.fragment,e),H=!1},d(e){e&&l(t),j(S),R=!1,n(V)}}}function Ae(e,t,o){let{appData:n}=t,{starData:i}=t,{options:s}=t,{results:r}=t,a="Waiting on User.";const l=g();return Object.entries(r).length>0&&(a=Pe(r,s)),e.$$set=e=>{"appData"in e&&o(0,n=e.appData),"starData"in e&&o(1,i=e.starData),"options"in e&&o(2,s=e.options),"results"in e&&o(6,r=e.results)},[n,i,s,a,function(){o(6,r=me(i,s)),o(3,a=Pe(r,s)),l("saveData",{key:"options",value:s}),l("saveData",{key:"results",value:r})},function(){Object.keys(r).length>0&&o(3,a=Pe(r,s)),l("saveData",{key:"options",value:s})},r]}var xe={title:"Alien RPG Tools",version:"10 Sep 2020 15:31:29",copyright:"Any text taken from the game is used with permission and remains © of their respective owners.",githubUrl:"https://github.com/ScottMaclure/alienrpg/"},De={starTypes:[{type:"Giant",description:"Huge, bright and cool star in a late stage of evolution.",brightness:"Type III"},{type:"Subgiant",description:"A large, bright star, exhausting its fuel.",brightness:"Type IV"},{type:"Main Sequence",description:"Small but incredibly common type of star.",brightness:"Type V"},{type:"White Dwarf",description:"A dead, burnt-out star, tiny and super-dense.",brightness:"Type DA"},{type:"Red Dwarf",description:"A red main sequence star, small and cool. Very common star.",brightness:"Type MV"},{type:"White Main Sequence",description:"White main sequence stars that burn hot and brightly.",brightness:"Type A0V"}],starLocations:[{key:"icsc",name:"The Independent Core System Colonies",colonyAllegianceKey:"icsc"},{key:"aja",name:"Anglo-Japanese Arm",colonyAllegianceKey:"aajm"},{key:"upp",name:"The Union of Progressive Peoples",colonyAllegianceKey:"upp"},{key:"arm",name:"The United Americas",colonyAllegianceKey:"aajm"},{key:"fro",name:"The Frontier",colonyAllegianceKeys:["icsc","aajm","upp"]}],systemObjects:[{enabled:!0,key:"gasGiant",type:"Gas Giant",number:"d6",modifiers:{default:"-1",Subgiant:"-2","White Dwarf":"-5"},features:["High Winds","Intense Radiation Fields","Rings","Single Super Storm","Small Gas Giant","Storms"],habitable:!1,surveyable:!0,planetSizeMod:0,moonSizeMod:-4},{enabled:!0,key:"terrestrialPlanet",type:"Terrestrial Planet",number:"d6",modifiers:{default:"","Red Dwarf":"-3","White Dwarf":"-3"},habitable:!0,surveyable:!0,planetSizeMod:0},{enabled:!0,key:"icePlanet",type:"Ice Planet",number:"d6",modifiers:{default:"+1",Subgiant:"",Giant:"","White Main Sequence":""},habitable:!0,surveyable:!0,planetSizeMod:-2},{enabled:!0,key:"asteroidBelt",type:"Asteroid Belt",number:"d6",modifiers:{default:"-3","White Dwarf":"-5",Subgiant:"-5"},features:["Bright and highly visible","Contains several large dwarf planets","Dust Belt","High orbital inclination","Intensely mineral rich asteroids","Very wide—covering several orbits"],habitable:!1,surveyable:!1,planetSizeMod:0}],iccCodes:["LV","MT","RF"],planetaryNames:["Arges","Aurora","Damnation","Doramin","Euphrates","Hamilton","Hannibal","Magdala","Moab","Monos","Nakaya","Napier","Nemesis","Nero","Nocturne","Phaeton","Prospero","Requiem","Solitude","Steropes","Tracatus"],planetSizes:[{"2d6":2,sizeKm:999,surfaceGravity:0,examples:"Ceres and other asteroids",atmosphereMod:"-6",colonySizeMod:-3},{"2d6":4,sizeKm:2e3,surfaceGravity:.1,examples:"Iapetus",atmosphereMod:-6,colonySizeMod:-3},{"2d6":6,sizeKm:4e3,surfaceGravity:.2,examples:"Luna, Europa",atmosphereMod:-6,colonySizeMod:-3},{"2d6":7,sizeKm:7e3,surfaceGravity:.5,examples:"Mars",atmosphereMod:-2,colonySizeMod:0},{"2d6":8,sizeKm:1e4,surfaceGravity:.7,examples:null,atmosphereMod:0,colonySizeMod:0},{"2d6":10,sizeKm:12500,surfaceGravity:1,examples:"Earth, Venus",atmosphereMod:0,colonySizeMod:0},{"2d6":11,sizeKm:15e3,surfaceGravity:1.3,examples:null,atmosphereMod:0,colonySizeMod:0},{"2d6":50,sizeKm:2e4,surfaceGravity:2,examples:"Super-Earth",atmosphereMod:0,colonySizeMod:0}],atmospheres:[{"2d6":3,type:"Thin",temperatureMod:-4,geosphereMod:-4,colonySizeMod:0,colonyMissionMod:0},{"2d6":6,type:"Breathable",temperatureMod:0,geosphereMod:0,colonySizeMod:1,colonyMissionMod:1},{"2d6":8,type:"Toxic",temperatureMod:0,geosphereMod:0,colonySizeMod:0,colonyMissionMod:-6},{"2d6":9,type:"Dense",temperatureMod:1,geosphereMod:-4,colonySizeMod:0,colonyMissionMod:0},{"2d6":10,type:"Corrosive",temperatureMod:6,geosphereMod:-4,colonySizeMod:-2,colonyMissionMod:-6},{"2d6":11,type:"Infiltrating",temperatureMod:6,geosphereMod:-4,colonySizeMod:-2,colonyMissionMod:-6},{"2d6":50,type:"Special",temperatureMod:0,geosphereMod:8,colonySizeMod:0,colonyMissionMod:0}],temperatures:[{"2d6":3,type:"Frozen",min:-100,max:-50,description:"Titan, Pluto, Enceladus",geosphereMod:-2,terrestrialPlanet:-2,icePlanet:0},{"2d6":5,type:"Cold",min:-50,max:0,description:"Alaska or Antarctica in winter",geosphereMod:0,terrestrialPlanet:0,icePlanet:0},{"2d6":7,type:"Temperate",min:0,max:30,description:"Boston or Paris",geosphereMod:0,terrestrialPlanet:0,icePlanet:0},{"2d6":10,type:"Hot",min:31,max:80,description:"Titan, Pluto, Enceladus",geosphereMod:-2,terrestrialPlanet:0,icePlanet:0},{"2d6":50,type:"Burning",min:80,max:200,description:"Mercury, Venus",geosphereMod:-4,terrestrialPlanet:0,icePlanet:0}],geospheres:[{"2d6":4,type:"Desert World",description:"No surface water",terrestrialPlanet:-3,icePlanet:0},{"2d6":6,type:"Arid World",description:"Global deserts and dry steppes, with some lakes and small seas",terrestrialPlanet:-2,icePlanet:0},{"2d6":8,type:"Temperate-Dry World",description:"Oceans cover 30–40% of the world's surface",terrestrialPlanet:0,icePlanet:0},{"2d6":10,type:"Temperate-Wet World",description:"Oceans cover 60–70% of the world's surface",terrestrialPlanet:0,icePlanet:0},{"2d6":11,type:"Wet World",description:"Global oceans with some islands and archipelagos",terrestrialPlanet:2,icePlanet:0},{"2d6":50,type:"Water World",description:"No dry land",terrestrialPlanet:3,icePlanet:0}],terrains:{terrestrialPlanet:[{d66:11,description:"Huge impact crater"},{d66:12,description:"Plains of silicon glass"},{d66:13,description:"Disturbing wind-cut rock formations"},{d66:14,description:"Permanent global dust-storm"},{d66:15,description:"Eerily colored dust plains"},{d66:16,description:"Active volcanic lava fields"},{d66:21,description:"Extensive salt flats"},{d66:22,description:"Dust-laden, permanent sunset sky"},{d66:23,description:"Ancient, blackened lava plains"},{d66:24,description:"Thermal springs and steam vents"},{d66:25,description:"Tall, gravel-strewn mountains"},{d66:26,description:"Howling winds that never stop"},{d66:31,description:"Daily fog banks roll in"},{d66:32,description:"Deep and wide rift valleys"},{d66:33,description:"Bizarrely eroded, wind-cut badlands"},{d66:34,description:"Steep-sided river gorges cut into soft rocks"},{d66:35,description:"Huge moon dominates day/night sky"},{d66:36,description:"World-spanning super canyon"},{d66:41,description:"Impressive river of great length"},{d66:42,description:"Oddly colored forests of alien vegetation"},{d66:43,description:"Mountains cut by sky-blue lakes"},{d66:44,description:"Sweeping plains of elephant grass"},{d66:45,description:"Highly toxic, but beautiful, plant-life"},{d66:46,description:"Small, bright, incredibly fast moons in orbit"},{d66:51,description:"Vast and complex river delta"},{d66:52,description:"Immense series of waterfalls"},{d66:53,description:"Endless mudflats with twisting water-ways"},{d66:54,description:"Impressive coastline of fjords and cliffs"},{d66:55,description:"Volcanoes, active & widespread"},{d66:56,description:"Impenetrable jungle"},{d66:61,description:"Dangerous tides—fast and loud"},{d66:62,description:"Vast, permanent super storm"},{d66:63,description:"Toxic sea creatures floating with the currents"},{d66:64,description:"Volcanic island chains"},{d66:65,description:"Permanently overcast with unrelenting rainfall"},{d66:100,description:"Mildly acidic oceans and rainfall"}],icePlanet:[{"2d6":2,description:"Huge impact crater"},{"2d6":3,description:"Geysers spew water into low orbit from long fissures"},{"2d6":4,description:"Deep fissures leading to a subsurface ocean"},{"2d6":5,description:"Dramatically colored blue-green ice fissures"},{"2d6":6,description:"Huge and active cryovolcano"},{"2d6":7,description:"Vast range of ice mountains"},{"2d6":8,description:"World-spanning super canyon"},{"2d6":9,description:"Disturbing, wind-cut ice formations"},{"2d6":10,description:"Black, dust-covered ice plains"},{"2d6":11,description:"Impressive ice escarpment of great length"},{"2d6":100,description:"Extensive dune-fields of methane sand grains"}]},colonySizes:[{"2d6":"7",size:"Start-Up",population:"3d6x10",missions:"1",colonyMissionMod:-1,orbitalComponenMod:0},{"2d6":"10",size:"Young",population:"3d6x100",missions:"d3–1",colonyMissionMod:0,orbitalComponenMod:1},{"2d6":"50",size:"Established",population:"2d6x1000",missions:"d3",colonyMissionMod:4,orbitalComponenMod:2}],colonyMissions:[{"2d6":2,type:"Terraforming"},{"2d6":3,type:"Research"},{"2d6":4,type:"Survey and Prospecting"},{"2d6":5,type:"Prison/Secluded or Exile"},{"2d6":6,type:"Mining and Refining"},{"2d6":7,type:"Mineral Drilling"},{"2d6":8,type:"Communications Relay"},{"2d6":9,type:"Military"},{"2d6":10,type:"Cattle Ranching/Logging"},{"2d6":11,type:"Corporate HQ"},{"2d6":50,type:"Government HQ"}],orbitalComponents:[{"2d6":4,type:"Little (perhaps wreckage) or nothing"},{"2d6":5,type:"Ring"},{"2d6":6,type:"Abandoned or Repurposed Satellite or Space Station"},{"2d6":8,type:"Moons",quantity:"d3",isMoon:!0},{"2d6":9,type:"Survey Station"},{"2d6":10,type:"Several Survey and Communications Satellites"},{"2d6":11,type:"Transfer Station"},{"2d6":50,multiRoll:"d6"}],factionOptions:[{d6:1,factions:[{strength:6}]},{d6:2,factions:[{strength:3},{strength:3}]},{d6:3,factions:[{strength:5},{strength:5}]},{d6:4,factions:[{strength:6},{strength:1}]},{d6:5,factions:[{strength:5},{strength:5},{strength:5}]},{d6:6,quantity:"d6",factions:[]}],colonyAllegiances:[{"3d6":4,icsc:"Kelland Mining",aajm:"Kelland Mining",upp:"UPP"},{"3d6":5,icsc:"GeoFund Investor",aajm:"Gustafsson Enterprise",upp:"UPP"},{"3d6":6,icsc:"Gustafsson Enterprise",aajm:"GeoFund Investor",upp:"UPP"},{"3d6":7,icsc:"Seegson",aajm:"Lasalle Bionational",upp:"UPP"},{"3d6":8,icsc:"No allegiance (independent)",aajm:"Weyland-Yutani",upp:"UPP"},{"3d6":11,icsc:"Jĭngtì Lóng Corporation",aajm:"Government representative",upp:"UPP"},{"3d6":12,icsc:"Chigusa Corporation",aajm:"Weyland-Yutani",upp:"UPP"},{"3d6":13,icsc:"Lasalle Bionational",aajm:"Seegson",upp:"UPP"},{"3d6":14,icsc:"Seegson",aajm:"Jĭngtì Lóng Corporation",upp:"UPP"},{"3d6":15,icsc:"Lorenz SysTech",aajm:"Chigusa Corporation",upp:"UPP"},{"3d6":16,icsc:"Gemini Exoplanet",aajm:"Gemini Exoplanet",upp:"UPP"},{"3d6":50,icsc:"Farside Mining",aajm:"Farside Mining",upp:"UPP"}],scenarioHooks:[{d66:11,description:"Pilfering and thefts force security to search rooms and lockers."},{d66:12,description:"Incidents of sabotage are increasing; security suspects an organized campaign."},{d66:13,description:"Colonial Administration is investigating the colony for illegal practices."},{d66:14,description:"Colonists returning to base report sighting a ‘monster’ on the surface."},{d66:15,description:"Petty crime, thefts and sabotage are rife. "},{d66:16,description:"Equipment failure has resulted in rationing at the colony. Tempers are frayed."},{d66:21,description:"Ship recently arrived with some kind of parasite that will soon spread through the colony."},{d66:22,description:"Stolen goods are on offer—cheap! "},{d66:23,description:"Unknown to you an old friend/flame is at the colony."},{d66:24,description:"Unknown to you an old enemy/rival is at the colony."},{d66:25,description:"A minor dignitary/notable is visiting in the company of several aides or guards."},{d66:26,description:"Part of the colony is off-limits temporarily - no reason given."},{d66:31,description:"Sudden restriction on free movement, unless you can find a way to avoid it."},{d66:32,description:"An emergency means repair parts and vital supplies are being shipped in from a nearby colony."},{d66:33,description:"Local crisis about to hit (storm, earthquake, riot, fire, etc.)"},{d66:34,description:"Period of solar flare—will cut communications for one Shift (D6 days if star type MV)."},{d66:35,description:"Spies from a neighboring colony have been discovered and arrested."},{d66:36,description:"Operations manager and his deputy are in conflict; everyone is choosing sides."},{d66:41,description:"PCs are invited to a formal dinner, meeting or party."},{d66:42,description:"The local colonists are not what they seem."},{d66:43,description:"A military ship is in orbit and the landing party is searching for someone/something."},{d66:44,description:"A rival colony or corporation is about to carry out an act of sabotage."},{d66:45,description:"The spaceport is currently quarantined."},{d66:46,description:"Security situation at the colony."},{d66:51,description:"A bunch of asteroid miners causing trouble while on leave."},{d66:52,description:"Mystery ship arrives at the spaceport."},{d66:53,description:"Civil unrest is about to break out."},{d66:54,description:"Colonists are trapped and need rescuing far from the settlement itself."},{d66:55,description:"Authorities have just locked down the colony after a riot."},{d66:56,description:"A religious leader is whipping up discontent."},{d66:61,description:"PCs will be harassed by angry locals. Why the anger? And why directed at off-world personnel?"},{d66:62,description:"An expedition is being assembled for a trek overland—the PCs are invited."},{d66:63,description:"An important colonial official is murdered, only an hour after you arrive."},{d66:64,description:"Several colonists have gone missing — a search is underway."},{d66:65,description:"A lifeboat has crashed on planet, and contained an interesting individual."},{d66:100,description:"The corporation or government paying for the colony keeps ordering teams out to search remote areas—but won’t say what they are searching for."}]},Oe={_comments:["Default options for the UI. Saved to window.localStorage."],starLocation:"ran",showSurveyedDetails:!1};let je=window.sessionStorage.getItem("options"),Ge=je?JSON.parse(je):Oe,Te=window.sessionStorage.getItem("results"),Le=Te?JSON.parse(Te):{};const Ne=new class extends L{constructor(e){super(),T(this,e,Ae,Ce,s,{appData:0,starData:1,options:2,results:6})}}({target:document.body,props:{appData:xe,starData:De,options:Ge,results:Le}});return Ne.$on("saveData",e=>{window.sessionStorage.setItem(e.detail.key,JSON.stringify(e.detail.value))}),Ne}();
//# sourceMappingURL=bundle.js.map
