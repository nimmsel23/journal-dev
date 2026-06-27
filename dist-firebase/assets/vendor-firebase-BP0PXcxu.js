const yg=()=>{};var nl={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ad=function(r){const e=[];let t=0;for(let n=0;n<r.length;n++){let s=r.charCodeAt(n);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&n+1<r.length&&(r.charCodeAt(n+1)&64512)===56320?(s=65536+((s&1023)<<10)+(r.charCodeAt(++n)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Ig=function(r){const e=[];let t=0,n=0;for(;t<r.length;){const s=r[t++];if(s<128)e[n++]=String.fromCharCode(s);else if(s>191&&s<224){const i=r[t++];e[n++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=r[t++],o=r[t++],c=r[t++],u=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[n++]=String.fromCharCode(55296+(u>>10)),e[n++]=String.fromCharCode(56320+(u&1023))}else{const i=r[t++],o=r[t++];e[n++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},cd={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,e){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let s=0;s<r.length;s+=3){const i=r[s],o=s+1<r.length,c=o?r[s+1]:0,u=s+2<r.length,h=u?r[s+2]:0,f=i>>2,m=(i&3)<<4|c>>4;let g=(c&15)<<2|h>>6,S=h&63;u||(S=64,o||(g=64)),n.push(t[f],t[m],t[g],t[S])}return n.join("")},encodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(r):this.encodeByteArray(ad(r),e)},decodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(r):Ig(this.decodeStringToByteArray(r,e))},decodeStringToByteArray(r,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let s=0;s<r.length;){const i=t[r.charAt(s++)],c=s<r.length?t[r.charAt(s)]:0;++s;const h=s<r.length?t[r.charAt(s)]:64;++s;const m=s<r.length?t[r.charAt(s)]:64;if(++s,i==null||c==null||h==null||m==null)throw new Eg;const g=i<<2|c>>4;if(n.push(g),h!==64){const S=c<<4&240|h>>2;if(n.push(S),m!==64){const C=h<<6&192|m;n.push(C)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};let Eg=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}};const vg=function(r){const e=ad(r);return cd.encodeByteArray(e,!0)},ud=function(r){return vg(r).replace(/\./g,"")},Tg=function(r){try{return cd.decodeString(r,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wg(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ag=()=>wg().__FIREBASE_DEFAULTS__,bg=()=>{if(typeof process>"u"||typeof nl>"u")return;const r=nl.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},Sg=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=r&&Tg(r[1]);return e&&JSON.parse(e)},Rg=()=>{try{return yg()||Ag()||bg()||Sg()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},ld=()=>{var r;return(r=Rg())===null||r===void 0?void 0:r.config};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pg{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,n))}}}function Cg(){try{return typeof indexedDB=="object"}catch{return!1}}function Vg(){return new Promise((r,e)=>{try{let t=!0;const n="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(n);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(n),r(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dg="FirebaseError";let Ga=class hd extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name=Dg,Object.setPrototypeOf(this,hd.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,dd.prototype.create)}},dd=class{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?kg(i,n):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new Ga(s,c,n)}};function kg(r,e){return r.replace(Ng,(t,n)=>{const s=e[n];return s!=null?String(s):`<${n}?>`})}const Ng=/\{\$([^}]+)}/g;function la(r,e){if(r===e)return!0;const t=Object.keys(r),n=Object.keys(e);for(const s of t){if(!n.includes(s))return!1;const i=r[s],o=e[s];if(rl(i)&&rl(o)){if(!la(i,o))return!1}else if(i!==o)return!1}for(const s of n)if(!t.includes(s))return!1;return!0}function rl(r){return r!==null&&typeof r=="object"}let Ti=class{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yt="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xg{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const n=new Pg;if(this.instancesDeferred.set(t,n),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&n.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Mg(e))try{this.getOrInitializeService({instanceIdentifier:Yt})}catch{}for(const[t,n]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});n.resolve(i)}catch{}}}}clearInstance(e=Yt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Yt){return this.instances.has(e)}getOptions(e=Yt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[i,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);n===c&&o.resolve(s)}return s}onInit(e,t){var n;const s=this.normalizeInstanceIdentifier(t),i=(n=this.onInitCallbacks.get(s))!==null&&n!==void 0?n:new Set;i.add(e),this.onInitCallbacks.set(s,i);const o=this.instances.get(s);return o&&e(o,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const s of n)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:Og(e),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=Yt){return this.component?this.component.multipleInstances?e:Yt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Og(r){return r===Yt?void 0:r}function Mg(r){return r.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lg{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new xg(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ae;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(ae||(ae={}));const Fg={debug:ae.DEBUG,verbose:ae.VERBOSE,info:ae.INFO,warn:ae.WARN,error:ae.ERROR,silent:ae.SILENT},Bg=ae.INFO,Ug={[ae.DEBUG]:"log",[ae.VERBOSE]:"log",[ae.INFO]:"info",[ae.WARN]:"warn",[ae.ERROR]:"error"},jg=(r,e,...t)=>{if(e<r.logLevel)return;const n=new Date().toISOString(),s=Ug[e];if(s)console[s](`[${n}]  ${r.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};let $g=class{constructor(e){this.name=e,this._logLevel=Bg,this._logHandler=jg,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ae))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Fg[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ae.DEBUG,...e),this._logHandler(this,ae.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ae.VERBOSE,...e),this._logHandler(this,ae.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ae.INFO,...e),this._logHandler(this,ae.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ae.WARN,...e),this._logHandler(this,ae.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ae.ERROR,...e),this._logHandler(this,ae.ERROR,...e)}};const qg=(r,e)=>e.some(t=>r instanceof t);let sl,il;function zg(){return sl||(sl=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Gg(){return il||(il=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const fd=new WeakMap,ha=new WeakMap,pd=new WeakMap,Qo=new WeakMap,Ha=new WeakMap;function Hg(r){const e=new Promise((t,n)=>{const s=()=>{r.removeEventListener("success",i),r.removeEventListener("error",o)},i=()=>{t(Vt(r.result)),s()},o=()=>{n(r.error),s()};r.addEventListener("success",i),r.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&fd.set(t,r)}).catch(()=>{}),Ha.set(e,r),e}function Kg(r){if(ha.has(r))return;const e=new Promise((t,n)=>{const s=()=>{r.removeEventListener("complete",i),r.removeEventListener("error",o),r.removeEventListener("abort",o)},i=()=>{t(),s()},o=()=>{n(r.error||new DOMException("AbortError","AbortError")),s()};r.addEventListener("complete",i),r.addEventListener("error",o),r.addEventListener("abort",o)});ha.set(r,e)}let da={get(r,e,t){if(r instanceof IDBTransaction){if(e==="done")return ha.get(r);if(e==="objectStoreNames")return r.objectStoreNames||pd.get(r);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Vt(r[e])},set(r,e,t){return r[e]=t,!0},has(r,e){return r instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in r}};function Wg(r){da=r(da)}function Qg(r){return r===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const n=r.call(Xo(this),e,...t);return pd.set(n,e.sort?e.sort():[e]),Vt(n)}:Gg().includes(r)?function(...e){return r.apply(Xo(this),e),Vt(fd.get(this))}:function(...e){return Vt(r.apply(Xo(this),e))}}function Xg(r){return typeof r=="function"?Qg(r):(r instanceof IDBTransaction&&Kg(r),qg(r,zg())?new Proxy(r,da):r)}function Vt(r){if(r instanceof IDBRequest)return Hg(r);if(Qo.has(r))return Qo.get(r);const e=Xg(r);return e!==r&&(Qo.set(r,e),Ha.set(e,r)),e}const Xo=r=>Ha.get(r);function Jg(r,e,{blocked:t,upgrade:n,blocking:s,terminated:i}={}){const o=indexedDB.open(r,e),c=Vt(o);return n&&o.addEventListener("upgradeneeded",u=>{n(Vt(o.result),u.oldVersion,u.newVersion,Vt(o.transaction),u)}),t&&o.addEventListener("blocked",u=>t(u.oldVersion,u.newVersion,u)),c.then(u=>{i&&u.addEventListener("close",()=>i()),s&&u.addEventListener("versionchange",h=>s(h.oldVersion,h.newVersion,h))}).catch(()=>{}),c}const Yg=["get","getKey","getAll","getAllKeys","count"],Zg=["put","add","delete","clear"],Jo=new Map;function ol(r,e){if(!(r instanceof IDBDatabase&&!(e in r)&&typeof e=="string"))return;if(Jo.get(e))return Jo.get(e);const t=e.replace(/FromIndex$/,""),n=e!==t,s=Zg.includes(t);if(!(t in(n?IDBIndex:IDBObjectStore).prototype)||!(s||Yg.includes(t)))return;const i=async function(o,...c){const u=this.transaction(o,s?"readwrite":"readonly");let h=u.store;return n&&(h=h.index(c.shift())),(await Promise.all([h[t](...c),s&&u.done]))[0]};return Jo.set(e,i),i}Wg(r=>({...r,get:(e,t,n)=>ol(e,t)||r.get(e,t,n),has:(e,t)=>!!ol(e,t)||r.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class e_{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(t_(t)){const n=t.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(t=>t).join(" ")}}function t_(r){const e=r.getComponent();return(e==null?void 0:e.type)==="VERSION"}const fa="@firebase/app",al="0.13.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lt=new $g("@firebase/app"),n_="@firebase/app-compat",r_="@firebase/analytics-compat",s_="@firebase/analytics",i_="@firebase/app-check-compat",o_="@firebase/app-check",a_="@firebase/auth",c_="@firebase/auth-compat",u_="@firebase/database",l_="@firebase/data-connect",h_="@firebase/database-compat",d_="@firebase/functions",f_="@firebase/functions-compat",p_="@firebase/installations",m_="@firebase/installations-compat",g_="@firebase/messaging",__="@firebase/messaging-compat",y_="@firebase/performance",I_="@firebase/performance-compat",E_="@firebase/remote-config",v_="@firebase/remote-config-compat",T_="@firebase/storage",w_="@firebase/storage-compat",A_="@firebase/firestore",b_="@firebase/ai",S_="@firebase/firestore-compat",R_="firebase",P_="11.10.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pa="[DEFAULT]",C_={[fa]:"fire-core",[n_]:"fire-core-compat",[s_]:"fire-analytics",[r_]:"fire-analytics-compat",[o_]:"fire-app-check",[i_]:"fire-app-check-compat",[a_]:"fire-auth",[c_]:"fire-auth-compat",[u_]:"fire-rtdb",[l_]:"fire-data-connect",[h_]:"fire-rtdb-compat",[d_]:"fire-fn",[f_]:"fire-fn-compat",[p_]:"fire-iid",[m_]:"fire-iid-compat",[g_]:"fire-fcm",[__]:"fire-fcm-compat",[y_]:"fire-perf",[I_]:"fire-perf-compat",[E_]:"fire-rc",[v_]:"fire-rc-compat",[T_]:"fire-gcs",[w_]:"fire-gcs-compat",[A_]:"fire-fst",[S_]:"fire-fst-compat",[b_]:"fire-vertex","fire-js":"fire-js",[R_]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ss=new Map,V_=new Map,ma=new Map;function cl(r,e){try{r.container.addComponent(e)}catch(t){lt.debug(`Component ${e.name} failed to register with FirebaseApp ${r.name}`,t)}}function qn(r){const e=r.name;if(ma.has(e))return lt.debug(`There were multiple attempts to register component ${e}.`),!1;ma.set(e,r);for(const t of ss.values())cl(t,r);for(const t of V_.values())cl(t,r);return!0}function Qi(r,e){const t=r.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),r.container.getProvider(e)}function Ge(r){return r==null?!1:r.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const D_={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Dt=new dd("app","Firebase",D_);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class k_{constructor(e,t,n){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new Ti("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Dt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lr=P_;function N_(r,e={}){let t=r;typeof e!="object"&&(e={name:e});const n=Object.assign({name:pa,automaticDataCollectionEnabled:!0},e),s=n.name;if(typeof s!="string"||!s)throw Dt.create("bad-app-name",{appName:String(s)});if(t||(t=ld()),!t)throw Dt.create("no-options");const i=ss.get(s);if(i){if(la(t,i.options)&&la(n,i.config))return i;throw Dt.create("duplicate-app",{appName:s})}const o=new Lg(s);for(const u of ma.values())o.addComponent(u);const c=new k_(t,n,o);return ss.set(s,c),c}function md(r=pa){const e=ss.get(r);if(!e&&r===pa&&ld())return N_();if(!e)throw Dt.create("no-app",{appName:r});return e}function wA(){return Array.from(ss.values())}function kt(r,e,t){var n;let s=(n=C_[r])!==null&&n!==void 0?n:r;t&&(s+=`-${t}`);const i=s.match(/\s|\//),o=e.match(/\s|\//);if(i||o){const c=[`Unable to register library "${s}" with version "${e}":`];i&&c.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&o&&c.push("and"),o&&c.push(`version name "${e}" contains illegal characters (whitespace or "/")`),lt.warn(c.join(" "));return}qn(new Ti(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const x_="firebase-heartbeat-database",O_=1,is="firebase-heartbeat-store";let Yo=null;function gd(){return Yo||(Yo=Jg(x_,O_,{upgrade:(r,e)=>{switch(e){case 0:try{r.createObjectStore(is)}catch(t){console.warn(t)}}}}).catch(r=>{throw Dt.create("idb-open",{originalErrorMessage:r.message})})),Yo}async function M_(r){try{const t=(await gd()).transaction(is),n=await t.objectStore(is).get(_d(r));return await t.done,n}catch(e){if(e instanceof Ga)lt.warn(e.message);else{const t=Dt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});lt.warn(t.message)}}}async function ul(r,e){try{const n=(await gd()).transaction(is,"readwrite");await n.objectStore(is).put(e,_d(r)),await n.done}catch(t){if(t instanceof Ga)lt.warn(t.message);else{const n=Dt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});lt.warn(n.message)}}}function _d(r){return`${r.name}!${r.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const L_=1024,F_=30;class B_{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new j_(t),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=ll();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>F_){const o=$_(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){lt.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=ll(),{heartbeatsToSend:n,unsentEntries:s}=U_(this._heartbeatsCache.heartbeats),i=ud(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return lt.warn(t),""}}}function ll(){return new Date().toISOString().substring(0,10)}function U_(r,e=L_){const t=[];let n=r.slice();for(const s of r){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),hl(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),hl(t)>e){t.pop();break}n=n.slice(1)}return{heartbeatsToSend:t,unsentEntries:n}}class j_{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Cg()?Vg().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await M_(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return ul(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return ul(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function hl(r){return ud(JSON.stringify({version:2,heartbeats:r})).length}function $_(r){if(r.length===0)return-1;let e=0,t=r[0].date;for(let n=1;n<r.length;n++)r[n].date<t&&(t=r[n].date,e=n);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function q_(r){qn(new Ti("platform-logger",e=>new e_(e),"PRIVATE")),qn(new Ti("heartbeat",e=>new B_(e),"PRIVATE")),kt(fa,al,r),kt(fa,al,"esm2017"),kt("fire-js","")}q_("");const z_=()=>{};var dl={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yd=function(r){const e=[];let t=0;for(let n=0;n<r.length;n++){let s=r.charCodeAt(n);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&n+1<r.length&&(r.charCodeAt(n+1)&64512)===56320?(s=65536+((s&1023)<<10)+(r.charCodeAt(++n)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},G_=function(r){const e=[];let t=0,n=0;for(;t<r.length;){const s=r[t++];if(s<128)e[n++]=String.fromCharCode(s);else if(s>191&&s<224){const i=r[t++];e[n++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=r[t++],o=r[t++],c=r[t++],u=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[n++]=String.fromCharCode(55296+(u>>10)),e[n++]=String.fromCharCode(56320+(u&1023))}else{const i=r[t++],o=r[t++];e[n++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Id={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,e){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let s=0;s<r.length;s+=3){const i=r[s],o=s+1<r.length,c=o?r[s+1]:0,u=s+2<r.length,h=u?r[s+2]:0,f=i>>2,m=(i&3)<<4|c>>4;let g=(c&15)<<2|h>>6,S=h&63;u||(S=64,o||(g=64)),n.push(t[f],t[m],t[g],t[S])}return n.join("")},encodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(r):this.encodeByteArray(yd(r),e)},decodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(r):G_(this.decodeStringToByteArray(r,e))},decodeStringToByteArray(r,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let s=0;s<r.length;){const i=t[r.charAt(s++)],c=s<r.length?t[r.charAt(s)]:0;++s;const h=s<r.length?t[r.charAt(s)]:64;++s;const m=s<r.length?t[r.charAt(s)]:64;if(++s,i==null||c==null||h==null||m==null)throw new H_;const g=i<<2|c>>4;if(n.push(g),h!==64){const S=c<<4&240|h>>2;if(n.push(S),m!==64){const C=h<<6&192|m;n.push(C)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};let H_=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}};const K_=function(r){const e=yd(r);return Id.encodeByteArray(e,!0)},fl=function(r){return K_(r).replace(/\./g,"")},W_=function(r){try{return Id.decodeString(r,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ed(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Q_=()=>Ed().__FIREBASE_DEFAULTS__,X_=()=>{if(typeof process>"u"||typeof dl>"u")return;const r=dl.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},J_=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=r&&W_(r[1]);return e&&JSON.parse(e)},vd=()=>{try{return z_()||Q_()||X_()||J_()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},Y_=r=>{var e,t;return(t=(e=vd())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[r]},Z_=r=>{const e=Y_(r);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const n=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),n]:[e.substring(0,t),n]};/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xi(r){try{return(r.startsWith("http://")||r.startsWith("https://")?new URL(r).hostname:r).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Td(r){return(await fetch(r,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ey(r,e){if(r.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},n=e||"demo-project",s=r.iat||0,i=r.sub||r.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${n}`,aud:n,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},r);return[fl(JSON.stringify(t)),fl(JSON.stringify(o)),""].join(".")}const Hr={};function ty(){const r={prod:[],emulator:[]};for(const e of Object.keys(Hr))Hr[e]?r.emulator.push(e):r.prod.push(e);return r}function ny(r){let e=document.getElementById(r),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",r),t=!0),{created:t,element:e}}let pl=!1;function ry(r,e){if(typeof window>"u"||typeof document>"u"||!Xi(window.location.host)||Hr[r]===e||Hr[r]||pl)return;Hr[r]=e;function t(g){return`__firebase__banner__${g}`}const n="__firebase__banner",i=ty().prod.length>0;function o(){const g=document.getElementById(n);g&&g.remove()}function c(g){g.style.display="flex",g.style.background="#7faaf0",g.style.position="fixed",g.style.bottom="5px",g.style.left="5px",g.style.padding=".5em",g.style.borderRadius="5px",g.style.alignItems="center"}function u(g,S){g.setAttribute("width","24"),g.setAttribute("id",S),g.setAttribute("height","24"),g.setAttribute("viewBox","0 0 24 24"),g.setAttribute("fill","none"),g.style.marginLeft="-6px"}function h(){const g=document.createElement("span");return g.style.cursor="pointer",g.style.marginLeft="16px",g.style.fontSize="24px",g.innerHTML=" &times;",g.onclick=()=>{pl=!0,o()},g}function f(g,S){g.setAttribute("id",S),g.innerText="Learn more",g.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",g.setAttribute("target","__blank"),g.style.paddingLeft="5px",g.style.textDecoration="underline"}function m(){const g=ny(n),S=t("text"),C=document.getElementById(S)||document.createElement("span"),N=t("learnmore"),D=document.getElementById(N)||document.createElement("a"),z=t("preprendIcon"),B=document.getElementById(z)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(g.created){const L=g.element;c(L),f(D,N);const H=h();u(B,z),L.append(B,C,D,H),document.body.appendChild(L)}i?(C.innerText="Preview backend disconnected.",B.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(B.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,C.innerText="Preview backend running in this workspace."),C.setAttribute("id",S)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",m):m()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wi(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function wd(){var r;const e=(r=vd())===null||r===void 0?void 0:r.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Ad(){return!wd()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function bd(){return!wd()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function sy(){try{return typeof indexedDB=="object"}catch{return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iy="FirebaseError";let Sd=class Rd extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name=iy,Object.setPrototypeOf(this,Rd.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,oy.prototype.create)}},oy=class{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?ay(i,n):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new Sd(s,c,n)}};function ay(r,e){return r.replace(cy,(t,n)=>{const s=e[n];return s!=null?String(s):`<${n}?>`})}const cy=/\{\$([^}]+)}/g;function Ka(r,e){if(r===e)return!0;const t=Object.keys(r),n=Object.keys(e);for(const s of t){if(!n.includes(s))return!1;const i=r[s],o=e[s];if(ml(i)&&ml(o)){if(!Ka(i,o))return!1}else if(i!==o)return!1}for(const s of n)if(!t.includes(s))return!1;return!0}function ml(r){return r!==null&&typeof r=="object"}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zn(r){return r&&r._delegate?r._delegate:r}let uy=class{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var X;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(X||(X={}));const ly={debug:X.DEBUG,verbose:X.VERBOSE,info:X.INFO,warn:X.WARN,error:X.ERROR,silent:X.SILENT},hy=X.INFO,dy={[X.DEBUG]:"log",[X.VERBOSE]:"log",[X.INFO]:"info",[X.WARN]:"warn",[X.ERROR]:"error"},fy=(r,e,...t)=>{if(e<r.logLevel)return;const n=new Date().toISOString(),s=dy[e];if(s)console[s](`[${n}]  ${r.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};let py=class{constructor(e){this.name=e,this._logLevel=hy,this._logHandler=fy,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in X))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?ly[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,X.DEBUG,...e),this._logHandler(this,X.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,X.VERBOSE,...e),this._logHandler(this,X.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,X.INFO,...e),this._logHandler(this,X.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,X.WARN,...e),this._logHandler(this,X.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,X.ERROR,...e),this._logHandler(this,X.ERROR,...e)}};var gl=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Nt,Pd;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(E,_){function I(){}I.prototype=_.prototype,E.D=_.prototype,E.prototype=new I,E.prototype.constructor=E,E.C=function(v,T,b){for(var y=Array(arguments.length-2),st=2;st<arguments.length;st++)y[st-2]=arguments[st];return _.prototype[T].apply(v,y)}}function t(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(n,t),n.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(E,_,I){I||(I=0);var v=Array(16);if(typeof _=="string")for(var T=0;16>T;++T)v[T]=_.charCodeAt(I++)|_.charCodeAt(I++)<<8|_.charCodeAt(I++)<<16|_.charCodeAt(I++)<<24;else for(T=0;16>T;++T)v[T]=_[I++]|_[I++]<<8|_[I++]<<16|_[I++]<<24;_=E.g[0],I=E.g[1],T=E.g[2];var b=E.g[3],y=_+(b^I&(T^b))+v[0]+3614090360&4294967295;_=I+(y<<7&4294967295|y>>>25),y=b+(T^_&(I^T))+v[1]+3905402710&4294967295,b=_+(y<<12&4294967295|y>>>20),y=T+(I^b&(_^I))+v[2]+606105819&4294967295,T=b+(y<<17&4294967295|y>>>15),y=I+(_^T&(b^_))+v[3]+3250441966&4294967295,I=T+(y<<22&4294967295|y>>>10),y=_+(b^I&(T^b))+v[4]+4118548399&4294967295,_=I+(y<<7&4294967295|y>>>25),y=b+(T^_&(I^T))+v[5]+1200080426&4294967295,b=_+(y<<12&4294967295|y>>>20),y=T+(I^b&(_^I))+v[6]+2821735955&4294967295,T=b+(y<<17&4294967295|y>>>15),y=I+(_^T&(b^_))+v[7]+4249261313&4294967295,I=T+(y<<22&4294967295|y>>>10),y=_+(b^I&(T^b))+v[8]+1770035416&4294967295,_=I+(y<<7&4294967295|y>>>25),y=b+(T^_&(I^T))+v[9]+2336552879&4294967295,b=_+(y<<12&4294967295|y>>>20),y=T+(I^b&(_^I))+v[10]+4294925233&4294967295,T=b+(y<<17&4294967295|y>>>15),y=I+(_^T&(b^_))+v[11]+2304563134&4294967295,I=T+(y<<22&4294967295|y>>>10),y=_+(b^I&(T^b))+v[12]+1804603682&4294967295,_=I+(y<<7&4294967295|y>>>25),y=b+(T^_&(I^T))+v[13]+4254626195&4294967295,b=_+(y<<12&4294967295|y>>>20),y=T+(I^b&(_^I))+v[14]+2792965006&4294967295,T=b+(y<<17&4294967295|y>>>15),y=I+(_^T&(b^_))+v[15]+1236535329&4294967295,I=T+(y<<22&4294967295|y>>>10),y=_+(T^b&(I^T))+v[1]+4129170786&4294967295,_=I+(y<<5&4294967295|y>>>27),y=b+(I^T&(_^I))+v[6]+3225465664&4294967295,b=_+(y<<9&4294967295|y>>>23),y=T+(_^I&(b^_))+v[11]+643717713&4294967295,T=b+(y<<14&4294967295|y>>>18),y=I+(b^_&(T^b))+v[0]+3921069994&4294967295,I=T+(y<<20&4294967295|y>>>12),y=_+(T^b&(I^T))+v[5]+3593408605&4294967295,_=I+(y<<5&4294967295|y>>>27),y=b+(I^T&(_^I))+v[10]+38016083&4294967295,b=_+(y<<9&4294967295|y>>>23),y=T+(_^I&(b^_))+v[15]+3634488961&4294967295,T=b+(y<<14&4294967295|y>>>18),y=I+(b^_&(T^b))+v[4]+3889429448&4294967295,I=T+(y<<20&4294967295|y>>>12),y=_+(T^b&(I^T))+v[9]+568446438&4294967295,_=I+(y<<5&4294967295|y>>>27),y=b+(I^T&(_^I))+v[14]+3275163606&4294967295,b=_+(y<<9&4294967295|y>>>23),y=T+(_^I&(b^_))+v[3]+4107603335&4294967295,T=b+(y<<14&4294967295|y>>>18),y=I+(b^_&(T^b))+v[8]+1163531501&4294967295,I=T+(y<<20&4294967295|y>>>12),y=_+(T^b&(I^T))+v[13]+2850285829&4294967295,_=I+(y<<5&4294967295|y>>>27),y=b+(I^T&(_^I))+v[2]+4243563512&4294967295,b=_+(y<<9&4294967295|y>>>23),y=T+(_^I&(b^_))+v[7]+1735328473&4294967295,T=b+(y<<14&4294967295|y>>>18),y=I+(b^_&(T^b))+v[12]+2368359562&4294967295,I=T+(y<<20&4294967295|y>>>12),y=_+(I^T^b)+v[5]+4294588738&4294967295,_=I+(y<<4&4294967295|y>>>28),y=b+(_^I^T)+v[8]+2272392833&4294967295,b=_+(y<<11&4294967295|y>>>21),y=T+(b^_^I)+v[11]+1839030562&4294967295,T=b+(y<<16&4294967295|y>>>16),y=I+(T^b^_)+v[14]+4259657740&4294967295,I=T+(y<<23&4294967295|y>>>9),y=_+(I^T^b)+v[1]+2763975236&4294967295,_=I+(y<<4&4294967295|y>>>28),y=b+(_^I^T)+v[4]+1272893353&4294967295,b=_+(y<<11&4294967295|y>>>21),y=T+(b^_^I)+v[7]+4139469664&4294967295,T=b+(y<<16&4294967295|y>>>16),y=I+(T^b^_)+v[10]+3200236656&4294967295,I=T+(y<<23&4294967295|y>>>9),y=_+(I^T^b)+v[13]+681279174&4294967295,_=I+(y<<4&4294967295|y>>>28),y=b+(_^I^T)+v[0]+3936430074&4294967295,b=_+(y<<11&4294967295|y>>>21),y=T+(b^_^I)+v[3]+3572445317&4294967295,T=b+(y<<16&4294967295|y>>>16),y=I+(T^b^_)+v[6]+76029189&4294967295,I=T+(y<<23&4294967295|y>>>9),y=_+(I^T^b)+v[9]+3654602809&4294967295,_=I+(y<<4&4294967295|y>>>28),y=b+(_^I^T)+v[12]+3873151461&4294967295,b=_+(y<<11&4294967295|y>>>21),y=T+(b^_^I)+v[15]+530742520&4294967295,T=b+(y<<16&4294967295|y>>>16),y=I+(T^b^_)+v[2]+3299628645&4294967295,I=T+(y<<23&4294967295|y>>>9),y=_+(T^(I|~b))+v[0]+4096336452&4294967295,_=I+(y<<6&4294967295|y>>>26),y=b+(I^(_|~T))+v[7]+1126891415&4294967295,b=_+(y<<10&4294967295|y>>>22),y=T+(_^(b|~I))+v[14]+2878612391&4294967295,T=b+(y<<15&4294967295|y>>>17),y=I+(b^(T|~_))+v[5]+4237533241&4294967295,I=T+(y<<21&4294967295|y>>>11),y=_+(T^(I|~b))+v[12]+1700485571&4294967295,_=I+(y<<6&4294967295|y>>>26),y=b+(I^(_|~T))+v[3]+2399980690&4294967295,b=_+(y<<10&4294967295|y>>>22),y=T+(_^(b|~I))+v[10]+4293915773&4294967295,T=b+(y<<15&4294967295|y>>>17),y=I+(b^(T|~_))+v[1]+2240044497&4294967295,I=T+(y<<21&4294967295|y>>>11),y=_+(T^(I|~b))+v[8]+1873313359&4294967295,_=I+(y<<6&4294967295|y>>>26),y=b+(I^(_|~T))+v[15]+4264355552&4294967295,b=_+(y<<10&4294967295|y>>>22),y=T+(_^(b|~I))+v[6]+2734768916&4294967295,T=b+(y<<15&4294967295|y>>>17),y=I+(b^(T|~_))+v[13]+1309151649&4294967295,I=T+(y<<21&4294967295|y>>>11),y=_+(T^(I|~b))+v[4]+4149444226&4294967295,_=I+(y<<6&4294967295|y>>>26),y=b+(I^(_|~T))+v[11]+3174756917&4294967295,b=_+(y<<10&4294967295|y>>>22),y=T+(_^(b|~I))+v[2]+718787259&4294967295,T=b+(y<<15&4294967295|y>>>17),y=I+(b^(T|~_))+v[9]+3951481745&4294967295,E.g[0]=E.g[0]+_&4294967295,E.g[1]=E.g[1]+(T+(y<<21&4294967295|y>>>11))&4294967295,E.g[2]=E.g[2]+T&4294967295,E.g[3]=E.g[3]+b&4294967295}n.prototype.u=function(E,_){_===void 0&&(_=E.length);for(var I=_-this.blockSize,v=this.B,T=this.h,b=0;b<_;){if(T==0)for(;b<=I;)s(this,E,b),b+=this.blockSize;if(typeof E=="string"){for(;b<_;)if(v[T++]=E.charCodeAt(b++),T==this.blockSize){s(this,v),T=0;break}}else for(;b<_;)if(v[T++]=E[b++],T==this.blockSize){s(this,v),T=0;break}}this.h=T,this.o+=_},n.prototype.v=function(){var E=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);E[0]=128;for(var _=1;_<E.length-8;++_)E[_]=0;var I=8*this.o;for(_=E.length-8;_<E.length;++_)E[_]=I&255,I/=256;for(this.u(E),E=Array(16),_=I=0;4>_;++_)for(var v=0;32>v;v+=8)E[I++]=this.g[_]>>>v&255;return E};function i(E,_){var I=c;return Object.prototype.hasOwnProperty.call(I,E)?I[E]:I[E]=_(E)}function o(E,_){this.h=_;for(var I=[],v=!0,T=E.length-1;0<=T;T--){var b=E[T]|0;v&&b==_||(I[T]=b,v=!1)}this.g=I}var c={};function u(E){return-128<=E&&128>E?i(E,function(_){return new o([_|0],0>_?-1:0)}):new o([E|0],0>E?-1:0)}function h(E){if(isNaN(E)||!isFinite(E))return m;if(0>E)return D(h(-E));for(var _=[],I=1,v=0;E>=I;v++)_[v]=E/I|0,I*=4294967296;return new o(_,0)}function f(E,_){if(E.length==0)throw Error("number format error: empty string");if(_=_||10,2>_||36<_)throw Error("radix out of range: "+_);if(E.charAt(0)=="-")return D(f(E.substring(1),_));if(0<=E.indexOf("-"))throw Error('number format error: interior "-" character');for(var I=h(Math.pow(_,8)),v=m,T=0;T<E.length;T+=8){var b=Math.min(8,E.length-T),y=parseInt(E.substring(T,T+b),_);8>b?(b=h(Math.pow(_,b)),v=v.j(b).add(h(y))):(v=v.j(I),v=v.add(h(y)))}return v}var m=u(0),g=u(1),S=u(16777216);r=o.prototype,r.m=function(){if(N(this))return-D(this).m();for(var E=0,_=1,I=0;I<this.g.length;I++){var v=this.i(I);E+=(0<=v?v:4294967296+v)*_,_*=4294967296}return E},r.toString=function(E){if(E=E||10,2>E||36<E)throw Error("radix out of range: "+E);if(C(this))return"0";if(N(this))return"-"+D(this).toString(E);for(var _=h(Math.pow(E,6)),I=this,v="";;){var T=H(I,_).g;I=z(I,T.j(_));var b=((0<I.g.length?I.g[0]:I.h)>>>0).toString(E);if(I=T,C(I))return b+v;for(;6>b.length;)b="0"+b;v=b+v}},r.i=function(E){return 0>E?0:E<this.g.length?this.g[E]:this.h};function C(E){if(E.h!=0)return!1;for(var _=0;_<E.g.length;_++)if(E.g[_]!=0)return!1;return!0}function N(E){return E.h==-1}r.l=function(E){return E=z(this,E),N(E)?-1:C(E)?0:1};function D(E){for(var _=E.g.length,I=[],v=0;v<_;v++)I[v]=~E.g[v];return new o(I,~E.h).add(g)}r.abs=function(){return N(this)?D(this):this},r.add=function(E){for(var _=Math.max(this.g.length,E.g.length),I=[],v=0,T=0;T<=_;T++){var b=v+(this.i(T)&65535)+(E.i(T)&65535),y=(b>>>16)+(this.i(T)>>>16)+(E.i(T)>>>16);v=y>>>16,b&=65535,y&=65535,I[T]=y<<16|b}return new o(I,I[I.length-1]&-2147483648?-1:0)};function z(E,_){return E.add(D(_))}r.j=function(E){if(C(this)||C(E))return m;if(N(this))return N(E)?D(this).j(D(E)):D(D(this).j(E));if(N(E))return D(this.j(D(E)));if(0>this.l(S)&&0>E.l(S))return h(this.m()*E.m());for(var _=this.g.length+E.g.length,I=[],v=0;v<2*_;v++)I[v]=0;for(v=0;v<this.g.length;v++)for(var T=0;T<E.g.length;T++){var b=this.i(v)>>>16,y=this.i(v)&65535,st=E.i(T)>>>16,Ir=E.i(T)&65535;I[2*v+2*T]+=y*Ir,B(I,2*v+2*T),I[2*v+2*T+1]+=b*Ir,B(I,2*v+2*T+1),I[2*v+2*T+1]+=y*st,B(I,2*v+2*T+1),I[2*v+2*T+2]+=b*st,B(I,2*v+2*T+2)}for(v=0;v<_;v++)I[v]=I[2*v+1]<<16|I[2*v];for(v=_;v<2*_;v++)I[v]=0;return new o(I,0)};function B(E,_){for(;(E[_]&65535)!=E[_];)E[_+1]+=E[_]>>>16,E[_]&=65535,_++}function L(E,_){this.g=E,this.h=_}function H(E,_){if(C(_))throw Error("division by zero");if(C(E))return new L(m,m);if(N(E))return _=H(D(E),_),new L(D(_.g),D(_.h));if(N(_))return _=H(E,D(_)),new L(D(_.g),_.h);if(30<E.g.length){if(N(E)||N(_))throw Error("slowDivide_ only works with positive integers.");for(var I=g,v=_;0>=v.l(E);)I=Z(I),v=Z(v);var T=K(I,1),b=K(v,1);for(v=K(v,2),I=K(I,2);!C(v);){var y=b.add(v);0>=y.l(E)&&(T=T.add(I),b=y),v=K(v,1),I=K(I,1)}return _=z(E,T.j(_)),new L(T,_)}for(T=m;0<=E.l(_);){for(I=Math.max(1,Math.floor(E.m()/_.m())),v=Math.ceil(Math.log(I)/Math.LN2),v=48>=v?1:Math.pow(2,v-48),b=h(I),y=b.j(_);N(y)||0<y.l(E);)I-=v,b=h(I),y=b.j(_);C(b)&&(b=g),T=T.add(b),E=z(E,y)}return new L(T,E)}r.A=function(E){return H(this,E).h},r.and=function(E){for(var _=Math.max(this.g.length,E.g.length),I=[],v=0;v<_;v++)I[v]=this.i(v)&E.i(v);return new o(I,this.h&E.h)},r.or=function(E){for(var _=Math.max(this.g.length,E.g.length),I=[],v=0;v<_;v++)I[v]=this.i(v)|E.i(v);return new o(I,this.h|E.h)},r.xor=function(E){for(var _=Math.max(this.g.length,E.g.length),I=[],v=0;v<_;v++)I[v]=this.i(v)^E.i(v);return new o(I,this.h^E.h)};function Z(E){for(var _=E.g.length+1,I=[],v=0;v<_;v++)I[v]=E.i(v)<<1|E.i(v-1)>>>31;return new o(I,E.h)}function K(E,_){var I=_>>5;_%=32;for(var v=E.g.length-I,T=[],b=0;b<v;b++)T[b]=0<_?E.i(b+I)>>>_|E.i(b+I+1)<<32-_:E.i(b+I);return new o(T,E.h)}n.prototype.digest=n.prototype.v,n.prototype.reset=n.prototype.s,n.prototype.update=n.prototype.u,Pd=n,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.A,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=h,o.fromString=f,Nt=o}).apply(typeof gl<"u"?gl:typeof self<"u"?self:typeof window<"u"?window:{});var Ys=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Cd,jr,Vd,oi,ga,Dd,kd,Nd;(function(){var r,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,l,d){return a==Array.prototype||a==Object.prototype||(a[l]=d.value),a};function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Ys=="object"&&Ys];for(var l=0;l<a.length;++l){var d=a[l];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var n=t(this);function s(a,l){if(l)e:{var d=n;a=a.split(".");for(var p=0;p<a.length-1;p++){var A=a[p];if(!(A in d))break e;d=d[A]}a=a[a.length-1],p=d[a],l=l(p),l!=p&&l!=null&&e(d,a,{configurable:!0,writable:!0,value:l})}}function i(a,l){a instanceof String&&(a+="");var d=0,p=!1,A={next:function(){if(!p&&d<a.length){var R=d++;return{value:l(R,a[R]),done:!1}}return p=!0,{done:!0,value:void 0}}};return A[Symbol.iterator]=function(){return A},A}s("Array.prototype.values",function(a){return a||function(){return i(this,function(l,d){return d})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var o=o||{},c=this||self;function u(a){var l=typeof a;return l=l!="object"?l:a?Array.isArray(a)?"array":l:"null",l=="array"||l=="object"&&typeof a.length=="number"}function h(a){var l=typeof a;return l=="object"&&a!=null||l=="function"}function f(a,l,d){return a.call.apply(a.bind,arguments)}function m(a,l,d){if(!a)throw Error();if(2<arguments.length){var p=Array.prototype.slice.call(arguments,2);return function(){var A=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(A,p),a.apply(l,A)}}return function(){return a.apply(l,arguments)}}function g(a,l,d){return g=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:m,g.apply(null,arguments)}function S(a,l){var d=Array.prototype.slice.call(arguments,1);return function(){var p=d.slice();return p.push.apply(p,arguments),a.apply(this,p)}}function C(a,l){function d(){}d.prototype=l.prototype,a.aa=l.prototype,a.prototype=new d,a.prototype.constructor=a,a.Qb=function(p,A,R){for(var x=Array(arguments.length-2),re=2;re<arguments.length;re++)x[re-2]=arguments[re];return l.prototype[A].apply(p,x)}}function N(a){const l=a.length;if(0<l){const d=Array(l);for(let p=0;p<l;p++)d[p]=a[p];return d}return[]}function D(a,l){for(let d=1;d<arguments.length;d++){const p=arguments[d];if(u(p)){const A=a.length||0,R=p.length||0;a.length=A+R;for(let x=0;x<R;x++)a[A+x]=p[x]}else a.push(p)}}class z{constructor(l,d){this.i=l,this.j=d,this.h=0,this.g=null}get(){let l;return 0<this.h?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function B(a){return/^[\s\xa0]*$/.test(a)}function L(){var a=c.navigator;return a&&(a=a.userAgent)?a:""}function H(a){return H[" "](a),a}H[" "]=function(){};var Z=L().indexOf("Gecko")!=-1&&!(L().toLowerCase().indexOf("webkit")!=-1&&L().indexOf("Edge")==-1)&&!(L().indexOf("Trident")!=-1||L().indexOf("MSIE")!=-1)&&L().indexOf("Edge")==-1;function K(a,l,d){for(const p in a)l.call(d,a[p],p,a)}function E(a,l){for(const d in a)l.call(void 0,a[d],d,a)}function _(a){const l={};for(const d in a)l[d]=a[d];return l}const I="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function v(a,l){let d,p;for(let A=1;A<arguments.length;A++){p=arguments[A];for(d in p)a[d]=p[d];for(let R=0;R<I.length;R++)d=I[R],Object.prototype.hasOwnProperty.call(p,d)&&(a[d]=p[d])}}function T(a){var l=1;a=a.split(":");const d=[];for(;0<l&&a.length;)d.push(a.shift()),l--;return a.length&&d.push(a.join(":")),d}function b(a){c.setTimeout(()=>{throw a},0)}function y(){var a=bo;let l=null;return a.g&&(l=a.g,a.g=a.g.next,a.g||(a.h=null),l.next=null),l}class st{constructor(){this.h=this.g=null}add(l,d){const p=Ir.get();p.set(l,d),this.h?this.h.next=p:this.g=p,this.h=p}}var Ir=new z(()=>new Lm,a=>a.reset());class Lm{constructor(){this.next=this.g=this.h=null}set(l,d){this.h=l,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let Er,vr=!1,bo=new st,nu=()=>{const a=c.Promise.resolve(void 0);Er=()=>{a.then(Fm)}};var Fm=()=>{for(var a;a=y();){try{a.h.call(a.g)}catch(d){b(d)}var l=Ir;l.j(a),100>l.h&&(l.h++,a.next=l.g,l.g=a)}vr=!1};function gt(){this.s=this.s,this.C=this.C}gt.prototype.s=!1,gt.prototype.ma=function(){this.s||(this.s=!0,this.N())},gt.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Te(a,l){this.type=a,this.g=this.target=l,this.defaultPrevented=!1}Te.prototype.h=function(){this.defaultPrevented=!0};var Bm=function(){if(!c.addEventListener||!Object.defineProperty)return!1;var a=!1,l=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const d=()=>{};c.addEventListener("test",d,l),c.removeEventListener("test",d,l)}catch{}return a}();function Tr(a,l){if(Te.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a){var d=this.type=a.type,p=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;if(this.target=a.target||a.srcElement,this.g=l,l=a.relatedTarget){if(Z){e:{try{H(l.nodeName);var A=!0;break e}catch{}A=!1}A||(l=null)}}else d=="mouseover"?l=a.fromElement:d=="mouseout"&&(l=a.toElement);this.relatedTarget=l,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=typeof a.pointerType=="string"?a.pointerType:Um[a.pointerType]||"",this.state=a.state,this.i=a,a.defaultPrevented&&Tr.aa.h.call(this)}}C(Tr,Te);var Um={2:"touch",3:"pen",4:"mouse"};Tr.prototype.h=function(){Tr.aa.h.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var Ns="closure_listenable_"+(1e6*Math.random()|0),jm=0;function $m(a,l,d,p,A){this.listener=a,this.proxy=null,this.src=l,this.type=d,this.capture=!!p,this.ha=A,this.key=++jm,this.da=this.fa=!1}function xs(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function Os(a){this.src=a,this.g={},this.h=0}Os.prototype.add=function(a,l,d,p,A){var R=a.toString();a=this.g[R],a||(a=this.g[R]=[],this.h++);var x=Ro(a,l,p,A);return-1<x?(l=a[x],d||(l.fa=!1)):(l=new $m(l,this.src,R,!!p,A),l.fa=d,a.push(l)),l};function So(a,l){var d=l.type;if(d in a.g){var p=a.g[d],A=Array.prototype.indexOf.call(p,l,void 0),R;(R=0<=A)&&Array.prototype.splice.call(p,A,1),R&&(xs(l),a.g[d].length==0&&(delete a.g[d],a.h--))}}function Ro(a,l,d,p){for(var A=0;A<a.length;++A){var R=a[A];if(!R.da&&R.listener==l&&R.capture==!!d&&R.ha==p)return A}return-1}var Po="closure_lm_"+(1e6*Math.random()|0),Co={};function ru(a,l,d,p,A){if(Array.isArray(l)){for(var R=0;R<l.length;R++)ru(a,l[R],d,p,A);return null}return d=ou(d),a&&a[Ns]?a.K(l,d,h(p)?!!p.capture:!1,A):qm(a,l,d,!1,p,A)}function qm(a,l,d,p,A,R){if(!l)throw Error("Invalid event type");var x=h(A)?!!A.capture:!!A,re=Do(a);if(re||(a[Po]=re=new Os(a)),d=re.add(l,d,p,x,R),d.proxy)return d;if(p=zm(),d.proxy=p,p.src=a,p.listener=d,a.addEventListener)Bm||(A=x),A===void 0&&(A=!1),a.addEventListener(l.toString(),p,A);else if(a.attachEvent)a.attachEvent(iu(l.toString()),p);else if(a.addListener&&a.removeListener)a.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return d}function zm(){function a(d){return l.call(a.src,a.listener,d)}const l=Gm;return a}function su(a,l,d,p,A){if(Array.isArray(l))for(var R=0;R<l.length;R++)su(a,l[R],d,p,A);else p=h(p)?!!p.capture:!!p,d=ou(d),a&&a[Ns]?(a=a.i,l=String(l).toString(),l in a.g&&(R=a.g[l],d=Ro(R,d,p,A),-1<d&&(xs(R[d]),Array.prototype.splice.call(R,d,1),R.length==0&&(delete a.g[l],a.h--)))):a&&(a=Do(a))&&(l=a.g[l.toString()],a=-1,l&&(a=Ro(l,d,p,A)),(d=-1<a?l[a]:null)&&Vo(d))}function Vo(a){if(typeof a!="number"&&a&&!a.da){var l=a.src;if(l&&l[Ns])So(l.i,a);else{var d=a.type,p=a.proxy;l.removeEventListener?l.removeEventListener(d,p,a.capture):l.detachEvent?l.detachEvent(iu(d),p):l.addListener&&l.removeListener&&l.removeListener(p),(d=Do(l))?(So(d,a),d.h==0&&(d.src=null,l[Po]=null)):xs(a)}}}function iu(a){return a in Co?Co[a]:Co[a]="on"+a}function Gm(a,l){if(a.da)a=!0;else{l=new Tr(l,this);var d=a.listener,p=a.ha||a.src;a.fa&&Vo(a),a=d.call(p,l)}return a}function Do(a){return a=a[Po],a instanceof Os?a:null}var ko="__closure_events_fn_"+(1e9*Math.random()>>>0);function ou(a){return typeof a=="function"?a:(a[ko]||(a[ko]=function(l){return a.handleEvent(l)}),a[ko])}function we(){gt.call(this),this.i=new Os(this),this.M=this,this.F=null}C(we,gt),we.prototype[Ns]=!0,we.prototype.removeEventListener=function(a,l,d,p){su(this,a,l,d,p)};function Ce(a,l){var d,p=a.F;if(p)for(d=[];p;p=p.F)d.push(p);if(a=a.M,p=l.type||l,typeof l=="string")l=new Te(l,a);else if(l instanceof Te)l.target=l.target||a;else{var A=l;l=new Te(p,a),v(l,A)}if(A=!0,d)for(var R=d.length-1;0<=R;R--){var x=l.g=d[R];A=Ms(x,p,!0,l)&&A}if(x=l.g=a,A=Ms(x,p,!0,l)&&A,A=Ms(x,p,!1,l)&&A,d)for(R=0;R<d.length;R++)x=l.g=d[R],A=Ms(x,p,!1,l)&&A}we.prototype.N=function(){if(we.aa.N.call(this),this.i){var a=this.i,l;for(l in a.g){for(var d=a.g[l],p=0;p<d.length;p++)xs(d[p]);delete a.g[l],a.h--}}this.F=null},we.prototype.K=function(a,l,d,p){return this.i.add(String(a),l,!1,d,p)},we.prototype.L=function(a,l,d,p){return this.i.add(String(a),l,!0,d,p)};function Ms(a,l,d,p){if(l=a.i.g[String(l)],!l)return!0;l=l.concat();for(var A=!0,R=0;R<l.length;++R){var x=l[R];if(x&&!x.da&&x.capture==d){var re=x.listener,Ee=x.ha||x.src;x.fa&&So(a.i,x),A=re.call(Ee,p)!==!1&&A}}return A&&!p.defaultPrevented}function au(a,l,d){if(typeof a=="function")d&&(a=g(a,d));else if(a&&typeof a.handleEvent=="function")a=g(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(l)?-1:c.setTimeout(a,l||0)}function cu(a){a.g=au(()=>{a.g=null,a.i&&(a.i=!1,cu(a))},a.l);const l=a.h;a.h=null,a.m.apply(null,l)}class Hm extends gt{constructor(l,d){super(),this.m=l,this.l=d,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:cu(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function wr(a){gt.call(this),this.h=a,this.g={}}C(wr,gt);var uu=[];function lu(a){K(a.g,function(l,d){this.g.hasOwnProperty(d)&&Vo(l)},a),a.g={}}wr.prototype.N=function(){wr.aa.N.call(this),lu(this)},wr.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var No=c.JSON.stringify,Km=c.JSON.parse,Wm=class{stringify(a){return c.JSON.stringify(a,void 0)}parse(a){return c.JSON.parse(a,void 0)}};function xo(){}xo.prototype.h=null;function hu(a){return a.h||(a.h=a.i())}function du(){}var Ar={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Oo(){Te.call(this,"d")}C(Oo,Te);function Mo(){Te.call(this,"c")}C(Mo,Te);var Kt={},fu=null;function Ls(){return fu=fu||new we}Kt.La="serverreachability";function pu(a){Te.call(this,Kt.La,a)}C(pu,Te);function br(a){const l=Ls();Ce(l,new pu(l))}Kt.STAT_EVENT="statevent";function mu(a,l){Te.call(this,Kt.STAT_EVENT,a),this.stat=l}C(mu,Te);function Ve(a){const l=Ls();Ce(l,new mu(l,a))}Kt.Ma="timingevent";function gu(a,l){Te.call(this,Kt.Ma,a),this.size=l}C(gu,Te);function Sr(a,l){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){a()},l)}function Rr(){this.g=!0}Rr.prototype.xa=function(){this.g=!1};function Qm(a,l,d,p,A,R){a.info(function(){if(a.g)if(R)for(var x="",re=R.split("&"),Ee=0;Ee<re.length;Ee++){var J=re[Ee].split("=");if(1<J.length){var Ae=J[0];J=J[1];var be=Ae.split("_");x=2<=be.length&&be[1]=="type"?x+(Ae+"="+J+"&"):x+(Ae+"=redacted&")}}else x=null;else x=R;return"XMLHTTP REQ ("+p+") [attempt "+A+"]: "+l+`
`+d+`
`+x})}function Xm(a,l,d,p,A,R,x){a.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+A+"]: "+l+`
`+d+`
`+R+" "+x})}function wn(a,l,d,p){a.info(function(){return"XMLHTTP TEXT ("+l+"): "+Ym(a,d)+(p?" "+p:"")})}function Jm(a,l){a.info(function(){return"TIMEOUT: "+l})}Rr.prototype.info=function(){};function Ym(a,l){if(!a.g)return l;if(!l)return null;try{var d=JSON.parse(l);if(d){for(a=0;a<d.length;a++)if(Array.isArray(d[a])){var p=d[a];if(!(2>p.length)){var A=p[1];if(Array.isArray(A)&&!(1>A.length)){var R=A[0];if(R!="noop"&&R!="stop"&&R!="close")for(var x=1;x<A.length;x++)A[x]=""}}}}return No(d)}catch{return l}}var Fs={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},_u={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Lo;function Bs(){}C(Bs,xo),Bs.prototype.g=function(){return new XMLHttpRequest},Bs.prototype.i=function(){return{}},Lo=new Bs;function _t(a,l,d,p){this.j=a,this.i=l,this.l=d,this.R=p||1,this.U=new wr(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new yu}function yu(){this.i=null,this.g="",this.h=!1}var Iu={},Fo={};function Bo(a,l,d){a.L=1,a.v=qs(it(l)),a.m=d,a.P=!0,Eu(a,null)}function Eu(a,l){a.F=Date.now(),Us(a),a.A=it(a.v);var d=a.A,p=a.R;Array.isArray(p)||(p=[String(p)]),xu(d.i,"t",p),a.C=0,d=a.j.J,a.h=new yu,a.g=Yu(a.j,d?l:null,!a.m),0<a.O&&(a.M=new Hm(g(a.Y,a,a.g),a.O)),l=a.U,d=a.g,p=a.ca;var A="readystatechange";Array.isArray(A)||(A&&(uu[0]=A.toString()),A=uu);for(var R=0;R<A.length;R++){var x=ru(d,A[R],p||l.handleEvent,!1,l.h||l);if(!x)break;l.g[x.key]=x}l=a.H?_(a.H):{},a.m?(a.u||(a.u="POST"),l["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.A,a.u,a.m,l)):(a.u="GET",a.g.ea(a.A,a.u,null,l)),br(),Qm(a.i,a.u,a.A,a.l,a.R,a.m)}_t.prototype.ca=function(a){a=a.target;const l=this.M;l&&ot(a)==3?l.j():this.Y(a)},_t.prototype.Y=function(a){try{if(a==this.g)e:{const be=ot(this.g);var l=this.g.Ba();const Sn=this.g.Z();if(!(3>be)&&(be!=3||this.g&&(this.h.h||this.g.oa()||ju(this.g)))){this.J||be!=4||l==7||(l==8||0>=Sn?br(3):br(2)),Uo(this);var d=this.g.Z();this.X=d;t:if(vu(this)){var p=ju(this.g);a="";var A=p.length,R=ot(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Wt(this),Pr(this);var x="";break t}this.h.i=new c.TextDecoder}for(l=0;l<A;l++)this.h.h=!0,a+=this.h.i.decode(p[l],{stream:!(R&&l==A-1)});p.length=0,this.h.g+=a,this.C=0,x=this.h.g}else x=this.g.oa();if(this.o=d==200,Xm(this.i,this.u,this.A,this.l,this.R,be,d),this.o){if(this.T&&!this.K){t:{if(this.g){var re,Ee=this.g;if((re=Ee.g?Ee.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!B(re)){var J=re;break t}}J=null}if(d=J)wn(this.i,this.l,d,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,jo(this,d);else{this.o=!1,this.s=3,Ve(12),Wt(this),Pr(this);break e}}if(this.P){d=!0;let qe;for(;!this.J&&this.C<x.length;)if(qe=Zm(this,x),qe==Fo){be==4&&(this.s=4,Ve(14),d=!1),wn(this.i,this.l,null,"[Incomplete Response]");break}else if(qe==Iu){this.s=4,Ve(15),wn(this.i,this.l,x,"[Invalid Chunk]"),d=!1;break}else wn(this.i,this.l,qe,null),jo(this,qe);if(vu(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),be!=4||x.length!=0||this.h.h||(this.s=1,Ve(16),d=!1),this.o=this.o&&d,!d)wn(this.i,this.l,x,"[Invalid Chunked Response]"),Wt(this),Pr(this);else if(0<x.length&&!this.W){this.W=!0;var Ae=this.j;Ae.g==this&&Ae.ba&&!Ae.M&&(Ae.j.info("Great, no buffering proxy detected. Bytes received: "+x.length),Ko(Ae),Ae.M=!0,Ve(11))}}else wn(this.i,this.l,x,null),jo(this,x);be==4&&Wt(this),this.o&&!this.J&&(be==4?Wu(this.j,this):(this.o=!1,Us(this)))}else gg(this.g),d==400&&0<x.indexOf("Unknown SID")?(this.s=3,Ve(12)):(this.s=0,Ve(13)),Wt(this),Pr(this)}}}catch{}finally{}};function vu(a){return a.g?a.u=="GET"&&a.L!=2&&a.j.Ca:!1}function Zm(a,l){var d=a.C,p=l.indexOf(`
`,d);return p==-1?Fo:(d=Number(l.substring(d,p)),isNaN(d)?Iu:(p+=1,p+d>l.length?Fo:(l=l.slice(p,p+d),a.C=p+d,l)))}_t.prototype.cancel=function(){this.J=!0,Wt(this)};function Us(a){a.S=Date.now()+a.I,Tu(a,a.I)}function Tu(a,l){if(a.B!=null)throw Error("WatchDog timer not null");a.B=Sr(g(a.ba,a),l)}function Uo(a){a.B&&(c.clearTimeout(a.B),a.B=null)}_t.prototype.ba=function(){this.B=null;const a=Date.now();0<=a-this.S?(Jm(this.i,this.A),this.L!=2&&(br(),Ve(17)),Wt(this),this.s=2,Pr(this)):Tu(this,this.S-a)};function Pr(a){a.j.G==0||a.J||Wu(a.j,a)}function Wt(a){Uo(a);var l=a.M;l&&typeof l.ma=="function"&&l.ma(),a.M=null,lu(a.U),a.g&&(l=a.g,a.g=null,l.abort(),l.ma())}function jo(a,l){try{var d=a.j;if(d.G!=0&&(d.g==a||$o(d.h,a))){if(!a.K&&$o(d.h,a)&&d.G==3){try{var p=d.Da.g.parse(l)}catch{p=null}if(Array.isArray(p)&&p.length==3){var A=p;if(A[0]==0){e:if(!d.u){if(d.g)if(d.g.F+3e3<a.F)Qs(d),Ks(d);else break e;Ho(d),Ve(18)}}else d.za=A[1],0<d.za-d.T&&37500>A[2]&&d.F&&d.v==0&&!d.C&&(d.C=Sr(g(d.Za,d),6e3));if(1>=bu(d.h)&&d.ca){try{d.ca()}catch{}d.ca=void 0}}else Xt(d,11)}else if((a.K||d.g==a)&&Qs(d),!B(l))for(A=d.Da.g.parse(l),l=0;l<A.length;l++){let J=A[l];if(d.T=J[0],J=J[1],d.G==2)if(J[0]=="c"){d.K=J[1],d.ia=J[2];const Ae=J[3];Ae!=null&&(d.la=Ae,d.j.info("VER="+d.la));const be=J[4];be!=null&&(d.Aa=be,d.j.info("SVER="+d.Aa));const Sn=J[5];Sn!=null&&typeof Sn=="number"&&0<Sn&&(p=1.5*Sn,d.L=p,d.j.info("backChannelRequestTimeoutMs_="+p)),p=d;const qe=a.g;if(qe){const Js=qe.g?qe.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Js){var R=p.h;R.g||Js.indexOf("spdy")==-1&&Js.indexOf("quic")==-1&&Js.indexOf("h2")==-1||(R.j=R.l,R.g=new Set,R.h&&(qo(R,R.h),R.h=null))}if(p.D){const Wo=qe.g?qe.g.getResponseHeader("X-HTTP-Session-Id"):null;Wo&&(p.ya=Wo,oe(p.I,p.D,Wo))}}d.G=3,d.l&&d.l.ua(),d.ba&&(d.R=Date.now()-a.F,d.j.info("Handshake RTT: "+d.R+"ms")),p=d;var x=a;if(p.qa=Ju(p,p.J?p.ia:null,p.W),x.K){Su(p.h,x);var re=x,Ee=p.L;Ee&&(re.I=Ee),re.B&&(Uo(re),Us(re)),p.g=x}else Hu(p);0<d.i.length&&Ws(d)}else J[0]!="stop"&&J[0]!="close"||Xt(d,7);else d.G==3&&(J[0]=="stop"||J[0]=="close"?J[0]=="stop"?Xt(d,7):Go(d):J[0]!="noop"&&d.l&&d.l.ta(J),d.v=0)}}br(4)}catch{}}var eg=class{constructor(a,l){this.g=a,this.map=l}};function wu(a){this.l=a||10,c.PerformanceNavigationTiming?(a=c.performance.getEntriesByType("navigation"),a=0<a.length&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Au(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function bu(a){return a.h?1:a.g?a.g.size:0}function $o(a,l){return a.h?a.h==l:a.g?a.g.has(l):!1}function qo(a,l){a.g?a.g.add(l):a.h=l}function Su(a,l){a.h&&a.h==l?a.h=null:a.g&&a.g.has(l)&&a.g.delete(l)}wu.prototype.cancel=function(){if(this.i=Ru(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function Ru(a){if(a.h!=null)return a.i.concat(a.h.D);if(a.g!=null&&a.g.size!==0){let l=a.i;for(const d of a.g.values())l=l.concat(d.D);return l}return N(a.i)}function tg(a){if(a.V&&typeof a.V=="function")return a.V();if(typeof Map<"u"&&a instanceof Map||typeof Set<"u"&&a instanceof Set)return Array.from(a.values());if(typeof a=="string")return a.split("");if(u(a)){for(var l=[],d=a.length,p=0;p<d;p++)l.push(a[p]);return l}l=[],d=0;for(p in a)l[d++]=a[p];return l}function ng(a){if(a.na&&typeof a.na=="function")return a.na();if(!a.V||typeof a.V!="function"){if(typeof Map<"u"&&a instanceof Map)return Array.from(a.keys());if(!(typeof Set<"u"&&a instanceof Set)){if(u(a)||typeof a=="string"){var l=[];a=a.length;for(var d=0;d<a;d++)l.push(d);return l}l=[],d=0;for(const p in a)l[d++]=p;return l}}}function Pu(a,l){if(a.forEach&&typeof a.forEach=="function")a.forEach(l,void 0);else if(u(a)||typeof a=="string")Array.prototype.forEach.call(a,l,void 0);else for(var d=ng(a),p=tg(a),A=p.length,R=0;R<A;R++)l.call(void 0,p[R],d&&d[R],a)}var Cu=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function rg(a,l){if(a){a=a.split("&");for(var d=0;d<a.length;d++){var p=a[d].indexOf("="),A=null;if(0<=p){var R=a[d].substring(0,p);A=a[d].substring(p+1)}else R=a[d];l(R,A?decodeURIComponent(A.replace(/\+/g," ")):"")}}}function Qt(a){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,a instanceof Qt){this.h=a.h,js(this,a.j),this.o=a.o,this.g=a.g,$s(this,a.s),this.l=a.l;var l=a.i,d=new Dr;d.i=l.i,l.g&&(d.g=new Map(l.g),d.h=l.h),Vu(this,d),this.m=a.m}else a&&(l=String(a).match(Cu))?(this.h=!1,js(this,l[1]||"",!0),this.o=Cr(l[2]||""),this.g=Cr(l[3]||"",!0),$s(this,l[4]),this.l=Cr(l[5]||"",!0),Vu(this,l[6]||"",!0),this.m=Cr(l[7]||"")):(this.h=!1,this.i=new Dr(null,this.h))}Qt.prototype.toString=function(){var a=[],l=this.j;l&&a.push(Vr(l,Du,!0),":");var d=this.g;return(d||l=="file")&&(a.push("//"),(l=this.o)&&a.push(Vr(l,Du,!0),"@"),a.push(encodeURIComponent(String(d)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.s,d!=null&&a.push(":",String(d))),(d=this.l)&&(this.g&&d.charAt(0)!="/"&&a.push("/"),a.push(Vr(d,d.charAt(0)=="/"?og:ig,!0))),(d=this.i.toString())&&a.push("?",d),(d=this.m)&&a.push("#",Vr(d,cg)),a.join("")};function it(a){return new Qt(a)}function js(a,l,d){a.j=d?Cr(l,!0):l,a.j&&(a.j=a.j.replace(/:$/,""))}function $s(a,l){if(l){if(l=Number(l),isNaN(l)||0>l)throw Error("Bad port number "+l);a.s=l}else a.s=null}function Vu(a,l,d){l instanceof Dr?(a.i=l,ug(a.i,a.h)):(d||(l=Vr(l,ag)),a.i=new Dr(l,a.h))}function oe(a,l,d){a.i.set(l,d)}function qs(a){return oe(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),a}function Cr(a,l){return a?l?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Vr(a,l,d){return typeof a=="string"?(a=encodeURI(a).replace(l,sg),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function sg(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var Du=/[#\/\?@]/g,ig=/[#\?:]/g,og=/[#\?]/g,ag=/[#\?@]/g,cg=/#/g;function Dr(a,l){this.h=this.g=null,this.i=a||null,this.j=!!l}function yt(a){a.g||(a.g=new Map,a.h=0,a.i&&rg(a.i,function(l,d){a.add(decodeURIComponent(l.replace(/\+/g," ")),d)}))}r=Dr.prototype,r.add=function(a,l){yt(this),this.i=null,a=An(this,a);var d=this.g.get(a);return d||this.g.set(a,d=[]),d.push(l),this.h+=1,this};function ku(a,l){yt(a),l=An(a,l),a.g.has(l)&&(a.i=null,a.h-=a.g.get(l).length,a.g.delete(l))}function Nu(a,l){return yt(a),l=An(a,l),a.g.has(l)}r.forEach=function(a,l){yt(this),this.g.forEach(function(d,p){d.forEach(function(A){a.call(l,A,p,this)},this)},this)},r.na=function(){yt(this);const a=Array.from(this.g.values()),l=Array.from(this.g.keys()),d=[];for(let p=0;p<l.length;p++){const A=a[p];for(let R=0;R<A.length;R++)d.push(l[p])}return d},r.V=function(a){yt(this);let l=[];if(typeof a=="string")Nu(this,a)&&(l=l.concat(this.g.get(An(this,a))));else{a=Array.from(this.g.values());for(let d=0;d<a.length;d++)l=l.concat(a[d])}return l},r.set=function(a,l){return yt(this),this.i=null,a=An(this,a),Nu(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[l]),this.h+=1,this},r.get=function(a,l){return a?(a=this.V(a),0<a.length?String(a[0]):l):l};function xu(a,l,d){ku(a,l),0<d.length&&(a.i=null,a.g.set(An(a,l),N(d)),a.h+=d.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],l=Array.from(this.g.keys());for(var d=0;d<l.length;d++){var p=l[d];const R=encodeURIComponent(String(p)),x=this.V(p);for(p=0;p<x.length;p++){var A=R;x[p]!==""&&(A+="="+encodeURIComponent(String(x[p]))),a.push(A)}}return this.i=a.join("&")};function An(a,l){return l=String(l),a.j&&(l=l.toLowerCase()),l}function ug(a,l){l&&!a.j&&(yt(a),a.i=null,a.g.forEach(function(d,p){var A=p.toLowerCase();p!=A&&(ku(this,p),xu(this,A,d))},a)),a.j=l}function lg(a,l){const d=new Rr;if(c.Image){const p=new Image;p.onload=S(It,d,"TestLoadImage: loaded",!0,l,p),p.onerror=S(It,d,"TestLoadImage: error",!1,l,p),p.onabort=S(It,d,"TestLoadImage: abort",!1,l,p),p.ontimeout=S(It,d,"TestLoadImage: timeout",!1,l,p),c.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=a}else l(!1)}function hg(a,l){const d=new Rr,p=new AbortController,A=setTimeout(()=>{p.abort(),It(d,"TestPingServer: timeout",!1,l)},1e4);fetch(a,{signal:p.signal}).then(R=>{clearTimeout(A),R.ok?It(d,"TestPingServer: ok",!0,l):It(d,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(A),It(d,"TestPingServer: error",!1,l)})}function It(a,l,d,p,A){try{A&&(A.onload=null,A.onerror=null,A.onabort=null,A.ontimeout=null),p(d)}catch{}}function dg(){this.g=new Wm}function fg(a,l,d){const p=d||"";try{Pu(a,function(A,R){let x=A;h(A)&&(x=No(A)),l.push(p+R+"="+encodeURIComponent(x))})}catch(A){throw l.push(p+"type="+encodeURIComponent("_badmap")),A}}function zs(a){this.l=a.Ub||null,this.j=a.eb||!1}C(zs,xo),zs.prototype.g=function(){return new Gs(this.l,this.j)},zs.prototype.i=function(a){return function(){return a}}({});function Gs(a,l){we.call(this),this.D=a,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}C(Gs,we),r=Gs.prototype,r.open=function(a,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=a,this.A=l,this.readyState=1,Nr(this)},r.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const l={headers:this.u,method:this.B,credentials:this.m,cache:void 0};a&&(l.body=a),(this.D||c).fetch(new Request(this.A,l)).then(this.Sa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,kr(this)),this.readyState=0},r.Sa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,Nr(this)),this.g&&(this.readyState=3,Nr(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Ou(this)}else a.text().then(this.Ra.bind(this),this.ga.bind(this))};function Ou(a){a.j.read().then(a.Pa.bind(a)).catch(a.ga.bind(a))}r.Pa=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var l=a.value?a.value:new Uint8Array(0);(l=this.v.decode(l,{stream:!a.done}))&&(this.response=this.responseText+=l)}a.done?kr(this):Nr(this),this.readyState==3&&Ou(this)}},r.Ra=function(a){this.g&&(this.response=this.responseText=a,kr(this))},r.Qa=function(a){this.g&&(this.response=a,kr(this))},r.ga=function(){this.g&&kr(this)};function kr(a){a.readyState=4,a.l=null,a.j=null,a.v=null,Nr(a)}r.setRequestHeader=function(a,l){this.u.append(a,l)},r.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],l=this.h.entries();for(var d=l.next();!d.done;)d=d.value,a.push(d[0]+": "+d[1]),d=l.next();return a.join(`\r
`)};function Nr(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(Gs.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function Mu(a){let l="";return K(a,function(d,p){l+=p,l+=":",l+=d,l+=`\r
`}),l}function zo(a,l,d){e:{for(p in d){var p=!1;break e}p=!0}p||(d=Mu(d),typeof a=="string"?d!=null&&encodeURIComponent(String(d)):oe(a,l,d))}function le(a){we.call(this),this.headers=new Map,this.o=a||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}C(le,we);var pg=/^https?$/i,mg=["POST","PUT"];r=le.prototype,r.Ha=function(a){this.J=a},r.ea=function(a,l,d,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);l=l?l.toUpperCase():"GET",this.D=a,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Lo.g(),this.v=this.o?hu(this.o):hu(Lo),this.g.onreadystatechange=g(this.Ea,this);try{this.B=!0,this.g.open(l,String(a),!0),this.B=!1}catch(R){Lu(this,R);return}if(a=d||"",d=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var A in p)d.set(A,p[A]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const R of p.keys())d.set(R,p.get(R));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(d.keys()).find(R=>R.toLowerCase()=="content-type"),A=c.FormData&&a instanceof c.FormData,!(0<=Array.prototype.indexOf.call(mg,l,void 0))||p||A||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[R,x]of d)this.g.setRequestHeader(R,x);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Uu(this),this.u=!0,this.g.send(a),this.u=!1}catch(R){Lu(this,R)}};function Lu(a,l){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=l,a.m=5,Fu(a),Hs(a)}function Fu(a){a.A||(a.A=!0,Ce(a,"complete"),Ce(a,"error"))}r.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=a||7,Ce(this,"complete"),Ce(this,"abort"),Hs(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Hs(this,!0)),le.aa.N.call(this)},r.Ea=function(){this.s||(this.B||this.u||this.j?Bu(this):this.bb())},r.bb=function(){Bu(this)};function Bu(a){if(a.h&&typeof o<"u"&&(!a.v[1]||ot(a)!=4||a.Z()!=2)){if(a.u&&ot(a)==4)au(a.Ea,0,a);else if(Ce(a,"readystatechange"),ot(a)==4){a.h=!1;try{const x=a.Z();e:switch(x){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var d;if(!(d=l)){var p;if(p=x===0){var A=String(a.D).match(Cu)[1]||null;!A&&c.self&&c.self.location&&(A=c.self.location.protocol.slice(0,-1)),p=!pg.test(A?A.toLowerCase():"")}d=p}if(d)Ce(a,"complete"),Ce(a,"success");else{a.m=6;try{var R=2<ot(a)?a.g.statusText:""}catch{R=""}a.l=R+" ["+a.Z()+"]",Fu(a)}}finally{Hs(a)}}}}function Hs(a,l){if(a.g){Uu(a);const d=a.g,p=a.v[0]?()=>{}:null;a.g=null,a.v=null,l||Ce(a,"ready");try{d.onreadystatechange=p}catch{}}}function Uu(a){a.I&&(c.clearTimeout(a.I),a.I=null)}r.isActive=function(){return!!this.g};function ot(a){return a.g?a.g.readyState:0}r.Z=function(){try{return 2<ot(this)?this.g.status:-1}catch{return-1}},r.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.Oa=function(a){if(this.g){var l=this.g.responseText;return a&&l.indexOf(a)==0&&(l=l.substring(a.length)),Km(l)}};function ju(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.H){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function gg(a){const l={};a=(a.g&&2<=ot(a)&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<a.length;p++){if(B(a[p]))continue;var d=T(a[p]);const A=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const R=l[A]||[];l[A]=R,R.push(d)}E(l,function(p){return p.join(", ")})}r.Ba=function(){return this.m},r.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function xr(a,l,d){return d&&d.internalChannelParams&&d.internalChannelParams[a]||l}function $u(a){this.Aa=0,this.i=[],this.j=new Rr,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=xr("failFast",!1,a),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=xr("baseRetryDelayMs",5e3,a),this.cb=xr("retryDelaySeedMs",1e4,a),this.Wa=xr("forwardChannelMaxRetries",2,a),this.wa=xr("forwardChannelRequestTimeoutMs",2e4,a),this.pa=a&&a.xmlHttpFactory||void 0,this.Xa=a&&a.Tb||void 0,this.Ca=a&&a.useFetchStreams||!1,this.L=void 0,this.J=a&&a.supportsCrossDomainXhr||!1,this.K="",this.h=new wu(a&&a.concurrentRequestLimit),this.Da=new dg,this.P=a&&a.fastHandshake||!1,this.O=a&&a.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=a&&a.Rb||!1,a&&a.xa&&this.j.xa(),a&&a.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&a&&a.detectBufferingProxy||!1,this.ja=void 0,a&&a.longPollingTimeout&&0<a.longPollingTimeout&&(this.ja=a.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}r=$u.prototype,r.la=8,r.G=1,r.connect=function(a,l,d,p){Ve(0),this.W=a,this.H=l||{},d&&p!==void 0&&(this.H.OSID=d,this.H.OAID=p),this.F=this.X,this.I=Ju(this,null,this.W),Ws(this)};function Go(a){if(qu(a),a.G==3){var l=a.U++,d=it(a.I);if(oe(d,"SID",a.K),oe(d,"RID",l),oe(d,"TYPE","terminate"),Or(a,d),l=new _t(a,a.j,l),l.L=2,l.v=qs(it(d)),d=!1,c.navigator&&c.navigator.sendBeacon)try{d=c.navigator.sendBeacon(l.v.toString(),"")}catch{}!d&&c.Image&&(new Image().src=l.v,d=!0),d||(l.g=Yu(l.j,null),l.g.ea(l.v)),l.F=Date.now(),Us(l)}Xu(a)}function Ks(a){a.g&&(Ko(a),a.g.cancel(),a.g=null)}function qu(a){Ks(a),a.u&&(c.clearTimeout(a.u),a.u=null),Qs(a),a.h.cancel(),a.s&&(typeof a.s=="number"&&c.clearTimeout(a.s),a.s=null)}function Ws(a){if(!Au(a.h)&&!a.s){a.s=!0;var l=a.Ga;Er||nu(),vr||(Er(),vr=!0),bo.add(l,a),a.B=0}}function _g(a,l){return bu(a.h)>=a.h.j-(a.s?1:0)?!1:a.s?(a.i=l.D.concat(a.i),!0):a.G==1||a.G==2||a.B>=(a.Va?0:a.Wa)?!1:(a.s=Sr(g(a.Ga,a,l),Qu(a,a.B)),a.B++,!0)}r.Ga=function(a){if(this.s)if(this.s=null,this.G==1){if(!a){this.U=Math.floor(1e5*Math.random()),a=this.U++;const A=new _t(this,this.j,a);let R=this.o;if(this.S&&(R?(R=_(R),v(R,this.S)):R=this.S),this.m!==null||this.O||(A.H=R,R=null),this.P)e:{for(var l=0,d=0;d<this.i.length;d++){t:{var p=this.i[d];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(l+=p,4096<l){l=d;break e}if(l===4096||d===this.i.length-1){l=d+1;break e}}l=1e3}else l=1e3;l=Gu(this,A,l),d=it(this.I),oe(d,"RID",a),oe(d,"CVER",22),this.D&&oe(d,"X-HTTP-Session-Id",this.D),Or(this,d),R&&(this.O?l="headers="+encodeURIComponent(String(Mu(R)))+"&"+l:this.m&&zo(d,this.m,R)),qo(this.h,A),this.Ua&&oe(d,"TYPE","init"),this.P?(oe(d,"$req",l),oe(d,"SID","null"),A.T=!0,Bo(A,d,null)):Bo(A,d,l),this.G=2}}else this.G==3&&(a?zu(this,a):this.i.length==0||Au(this.h)||zu(this))};function zu(a,l){var d;l?d=l.l:d=a.U++;const p=it(a.I);oe(p,"SID",a.K),oe(p,"RID",d),oe(p,"AID",a.T),Or(a,p),a.m&&a.o&&zo(p,a.m,a.o),d=new _t(a,a.j,d,a.B+1),a.m===null&&(d.H=a.o),l&&(a.i=l.D.concat(a.i)),l=Gu(a,d,1e3),d.I=Math.round(.5*a.wa)+Math.round(.5*a.wa*Math.random()),qo(a.h,d),Bo(d,p,l)}function Or(a,l){a.H&&K(a.H,function(d,p){oe(l,p,d)}),a.l&&Pu({},function(d,p){oe(l,p,d)})}function Gu(a,l,d){d=Math.min(a.i.length,d);var p=a.l?g(a.l.Na,a.l,a):null;e:{var A=a.i;let R=-1;for(;;){const x=["count="+d];R==-1?0<d?(R=A[0].g,x.push("ofs="+R)):R=0:x.push("ofs="+R);let re=!0;for(let Ee=0;Ee<d;Ee++){let J=A[Ee].g;const Ae=A[Ee].map;if(J-=R,0>J)R=Math.max(0,A[Ee].g-100),re=!1;else try{fg(Ae,x,"req"+J+"_")}catch{p&&p(Ae)}}if(re){p=x.join("&");break e}}}return a=a.i.splice(0,d),l.D=a,p}function Hu(a){if(!a.g&&!a.u){a.Y=1;var l=a.Fa;Er||nu(),vr||(Er(),vr=!0),bo.add(l,a),a.v=0}}function Ho(a){return a.g||a.u||3<=a.v?!1:(a.Y++,a.u=Sr(g(a.Fa,a),Qu(a,a.v)),a.v++,!0)}r.Fa=function(){if(this.u=null,Ku(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var a=2*this.R;this.j.info("BP detection timer enabled: "+a),this.A=Sr(g(this.ab,this),a)}},r.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Ve(10),Ks(this),Ku(this))};function Ko(a){a.A!=null&&(c.clearTimeout(a.A),a.A=null)}function Ku(a){a.g=new _t(a,a.j,"rpc",a.Y),a.m===null&&(a.g.H=a.o),a.g.O=0;var l=it(a.qa);oe(l,"RID","rpc"),oe(l,"SID",a.K),oe(l,"AID",a.T),oe(l,"CI",a.F?"0":"1"),!a.F&&a.ja&&oe(l,"TO",a.ja),oe(l,"TYPE","xmlhttp"),Or(a,l),a.m&&a.o&&zo(l,a.m,a.o),a.L&&(a.g.I=a.L);var d=a.g;a=a.ia,d.L=1,d.v=qs(it(l)),d.m=null,d.P=!0,Eu(d,a)}r.Za=function(){this.C!=null&&(this.C=null,Ks(this),Ho(this),Ve(19))};function Qs(a){a.C!=null&&(c.clearTimeout(a.C),a.C=null)}function Wu(a,l){var d=null;if(a.g==l){Qs(a),Ko(a),a.g=null;var p=2}else if($o(a.h,l))d=l.D,Su(a.h,l),p=1;else return;if(a.G!=0){if(l.o)if(p==1){d=l.m?l.m.length:0,l=Date.now()-l.F;var A=a.B;p=Ls(),Ce(p,new gu(p,d)),Ws(a)}else Hu(a);else if(A=l.s,A==3||A==0&&0<l.X||!(p==1&&_g(a,l)||p==2&&Ho(a)))switch(d&&0<d.length&&(l=a.h,l.i=l.i.concat(d)),A){case 1:Xt(a,5);break;case 4:Xt(a,10);break;case 3:Xt(a,6);break;default:Xt(a,2)}}}function Qu(a,l){let d=a.Ta+Math.floor(Math.random()*a.cb);return a.isActive()||(d*=2),d*l}function Xt(a,l){if(a.j.info("Error code "+l),l==2){var d=g(a.fb,a),p=a.Xa;const A=!p;p=new Qt(p||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||js(p,"https"),qs(p),A?lg(p.toString(),d):hg(p.toString(),d)}else Ve(2);a.G=0,a.l&&a.l.sa(l),Xu(a),qu(a)}r.fb=function(a){a?(this.j.info("Successfully pinged google.com"),Ve(2)):(this.j.info("Failed to ping google.com"),Ve(1))};function Xu(a){if(a.G=0,a.ka=[],a.l){const l=Ru(a.h);(l.length!=0||a.i.length!=0)&&(D(a.ka,l),D(a.ka,a.i),a.h.i.length=0,N(a.i),a.i.length=0),a.l.ra()}}function Ju(a,l,d){var p=d instanceof Qt?it(d):new Qt(d);if(p.g!="")l&&(p.g=l+"."+p.g),$s(p,p.s);else{var A=c.location;p=A.protocol,l=l?l+"."+A.hostname:A.hostname,A=+A.port;var R=new Qt(null);p&&js(R,p),l&&(R.g=l),A&&$s(R,A),d&&(R.l=d),p=R}return d=a.D,l=a.ya,d&&l&&oe(p,d,l),oe(p,"VER",a.la),Or(a,p),p}function Yu(a,l,d){if(l&&!a.J)throw Error("Can't create secondary domain capable XhrIo object.");return l=a.Ca&&!a.pa?new le(new zs({eb:d})):new le(a.pa),l.Ha(a.J),l}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function Zu(){}r=Zu.prototype,r.ua=function(){},r.ta=function(){},r.sa=function(){},r.ra=function(){},r.isActive=function(){return!0},r.Na=function(){};function Xs(){}Xs.prototype.g=function(a,l){return new Me(a,l)};function Me(a,l){we.call(this),this.g=new $u(l),this.l=a,this.h=l&&l.messageUrlParams||null,a=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(a?a["X-WebChannel-Content-Type"]=l.messageContentType:a={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.va&&(a?a["X-WebChannel-Client-Profile"]=l.va:a={"X-WebChannel-Client-Profile":l.va}),this.g.S=a,(a=l&&l.Sb)&&!B(a)&&(this.g.m=a),this.v=l&&l.supportsCrossDomainXhr||!1,this.u=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!B(l)&&(this.g.D=l,a=this.h,a!==null&&l in a&&(a=this.h,l in a&&delete a[l])),this.j=new bn(this)}C(Me,we),Me.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Me.prototype.close=function(){Go(this.g)},Me.prototype.o=function(a){var l=this.g;if(typeof a=="string"){var d={};d.__data__=a,a=d}else this.u&&(d={},d.__data__=No(a),a=d);l.i.push(new eg(l.Ya++,a)),l.G==3&&Ws(l)},Me.prototype.N=function(){this.g.l=null,delete this.j,Go(this.g),delete this.g,Me.aa.N.call(this)};function el(a){Oo.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var l=a.__sm__;if(l){e:{for(const d in l){a=d;break e}a=void 0}(this.i=a)&&(a=this.i,l=l!==null&&a in l?l[a]:void 0),this.data=l}else this.data=a}C(el,Oo);function tl(){Mo.call(this),this.status=1}C(tl,Mo);function bn(a){this.g=a}C(bn,Zu),bn.prototype.ua=function(){Ce(this.g,"a")},bn.prototype.ta=function(a){Ce(this.g,new el(a))},bn.prototype.sa=function(a){Ce(this.g,new tl)},bn.prototype.ra=function(){Ce(this.g,"b")},Xs.prototype.createWebChannel=Xs.prototype.g,Me.prototype.send=Me.prototype.o,Me.prototype.open=Me.prototype.m,Me.prototype.close=Me.prototype.close,Nd=function(){return new Xs},kd=function(){return Ls()},Dd=Kt,ga={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Fs.NO_ERROR=0,Fs.TIMEOUT=8,Fs.HTTP_ERROR=6,oi=Fs,_u.COMPLETE="complete",Vd=_u,du.EventType=Ar,Ar.OPEN="a",Ar.CLOSE="b",Ar.ERROR="c",Ar.MESSAGE="d",we.prototype.listen=we.prototype.K,jr=du,le.prototype.listenOnce=le.prototype.L,le.prototype.getLastError=le.prototype.Ka,le.prototype.getLastErrorCode=le.prototype.Ba,le.prototype.getStatus=le.prototype.Z,le.prototype.getResponseJson=le.prototype.Oa,le.prototype.getResponseText=le.prototype.oa,le.prototype.send=le.prototype.ea,le.prototype.setWithCredentials=le.prototype.Ha,Cd=le}).apply(typeof Ys<"u"?Ys:typeof self<"u"?self:typeof window<"u"?window:{});const _l="@firebase/firestore",yl="4.8.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ie{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ie.UNAUTHENTICATED=new Ie(null),Ie.GOOGLE_CREDENTIALS=new Ie("google-credentials-uid"),Ie.FIRST_PARTY=new Ie("first-party-uid"),Ie.MOCK_USER=new Ie("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let hr="11.10.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fn=new py("@firebase/firestore");function Nn(){return fn.logLevel}function V(r,...e){if(fn.logLevel<=X.DEBUG){const t=e.map(Wa);fn.debug(`Firestore (${hr}): ${r}`,...t)}}function de(r,...e){if(fn.logLevel<=X.ERROR){const t=e.map(Wa);fn.error(`Firestore (${hr}): ${r}`,...t)}}function ht(r,...e){if(fn.logLevel<=X.WARN){const t=e.map(Wa);fn.warn(`Firestore (${hr}): ${r}`,...t)}}function Wa(r){if(typeof r=="string")return r;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(r)}catch{return r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function M(r,e,t){let n="Unexpected state";typeof e=="string"?n=e:t=e,xd(r,n,t)}function xd(r,e,t){let n=`FIRESTORE (${hr}) INTERNAL ASSERTION FAILED: ${e} (ID: ${r.toString(16)})`;if(t!==void 0)try{n+=" CONTEXT: "+JSON.stringify(t)}catch{n+=" CONTEXT: "+t}throw de(n),new Error(n)}function U(r,e,t,n){let s="Unexpected state";typeof t=="string"?s=t:n=t,r||xd(e,s,n)}function F(r,e){return r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const P={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class k extends Sd{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ye{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Od{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class my{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Ie.UNAUTHENTICATED))}shutdown(){}}class gy{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class _y{constructor(e){this.t=e,this.currentUser=Ie.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){U(this.o===void 0,42304);let n=this.i;const s=u=>this.i!==n?(n=this.i,t(u)):Promise.resolve();let i=new Ye;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Ye,e.enqueueRetryable(()=>s(this.currentUser))};const o=()=>{const u=i;e.enqueueRetryable(async()=>{await u.promise,await s(this.currentUser)})},c=u=>{V("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(u=>c(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?c(u):(V("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Ye)}},0),o()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(n=>this.i!==e?(V("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(U(typeof n.accessToken=="string",31837,{l:n}),new Od(n.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return U(e===null||typeof e=="string",2055,{h:e}),new Ie(e)}}class yy{constructor(e,t,n){this.P=e,this.T=t,this.I=n,this.type="FirstParty",this.user=Ie.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class Iy{constructor(e,t,n){this.P=e,this.T=t,this.I=n}getToken(){return Promise.resolve(new yy(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(Ie.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Il{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Ey{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Ge(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){U(this.o===void 0,3512);const n=i=>{i.error!=null&&V("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.m;return this.m=i.token,V("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>n(i))};const s=i=>{V("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?s(i):V("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Il(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(U(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new Il(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vy(r){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(r);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let n=0;n<r;n++)t[n]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Md(){return new TextEncoder}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qa{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let n="";for(;n.length<20;){const s=vy(40);for(let i=0;i<s.length;++i)n.length<20&&s[i]<t&&(n+=e.charAt(s[i]%62))}return n}}function $(r,e){return r<e?-1:r>e?1:0}function _a(r,e){let t=0;for(;t<r.length&&t<e.length;){const n=r.codePointAt(t),s=e.codePointAt(t);if(n!==s){if(n<128&&s<128)return $(n,s);{const i=Md(),o=Ty(i.encode(El(r,t)),i.encode(El(e,t)));return o!==0?o:$(n,s)}}t+=n>65535?2:1}return $(r.length,e.length)}function El(r,e){return r.codePointAt(e)>65535?r.substring(e,e+2):r.substring(e,e+1)}function Ty(r,e){for(let t=0;t<r.length&&t<e.length;++t)if(r[t]!==e[t])return $(r[t],e[t]);return $(r.length,e.length)}function Gn(r,e,t){return r.length===e.length&&r.every((n,s)=>t(n,e[s]))}function Ld(r){return r+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vl="__name__";class We{constructor(e,t,n){t===void 0?t=0:t>e.length&&M(637,{offset:t,range:e.length}),n===void 0?n=e.length-t:n>e.length-t&&M(1746,{length:n,range:e.length-t}),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return We.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof We?e.forEach(n=>{t.push(n)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let s=0;s<n;s++){const i=We.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return $(e.length,t.length)}static compareSegments(e,t){const n=We.isNumericId(e),s=We.isNumericId(t);return n&&!s?-1:!n&&s?1:n&&s?We.extractNumericId(e).compare(We.extractNumericId(t)):_a(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Nt.fromString(e.substring(4,e.length-2))}}class Y extends We{construct(e,t,n){return new Y(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new k(P.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter(s=>s.length>0))}return new Y(t)}static emptyPath(){return new Y([])}}const wy=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class ue extends We{construct(e,t,n){return new ue(e,t,n)}static isValidIdentifier(e){return wy.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),ue.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===vl}static keyField(){return new ue([vl])}static fromServerFormat(e){const t=[];let n="",s=0;const i=()=>{if(n.length===0)throw new k(P.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let o=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new k(P.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new k(P.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=u,s+=2}else c==="`"?(o=!o,s++):c!=="."||o?(n+=c,s++):(i(),s++)}if(i(),o)throw new k(P.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new ue(t)}static emptyPath(){return new ue([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O{constructor(e){this.path=e}static fromPath(e){return new O(Y.fromString(e))}static fromName(e){return new O(Y.fromString(e).popFirst(5))}static empty(){return new O(Y.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Y.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return Y.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new O(new Y(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fd(r,e,t){if(!t)throw new k(P.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${e}.`)}function Ay(r,e,t,n){if(e===!0&&n===!0)throw new k(P.INVALID_ARGUMENT,`${r} and ${t} cannot be used together.`)}function Tl(r){if(!O.isDocumentKey(r))throw new k(P.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function wl(r){if(O.isDocumentKey(r))throw new k(P.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`)}function Bd(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}function Ji(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const e=function(n){return n.constructor?n.constructor.name:null}(r);return e?`a custom ${e} object`:"an object"}}return typeof r=="function"?"a function":M(12329,{type:typeof r})}function Mt(r,e){if("_delegate"in r&&(r=r._delegate),!(r instanceof e)){if(e.name===r.constructor.name)throw new k(P.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Ji(r);throw new k(P.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return r}function by(r,e){if(e<=0)throw new k(P.INVALID_ARGUMENT,`Function ${r}() requires a positive number, but it was: ${e}.`)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function me(r,e){const t={typeString:r};return e&&(t.value=e),t}function vs(r,e){if(!Bd(r))throw new k(P.INVALID_ARGUMENT,"JSON must be an object");let t;for(const n in e)if(e[n]){const s=e[n].typeString,i="value"in e[n]?{value:e[n].value}:void 0;if(!(n in r)){t=`JSON missing required field: '${n}'`;break}const o=r[n];if(s&&typeof o!==s){t=`JSON field '${n}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${n}' field to equal '${i.value}'`;break}}if(t)throw new k(P.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Al=-62135596800,bl=1e6;class ee{static now(){return ee.fromMillis(Date.now())}static fromDate(e){return ee.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor((e-1e3*t)*bl);return new ee(t,n)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new k(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new k(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<Al)throw new k(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new k(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/bl}_compareTo(e){return this.seconds===e.seconds?$(this.nanoseconds,e.nanoseconds):$(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:ee._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(vs(e,ee._jsonSchema))return new ee(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-Al;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}ee._jsonSchemaVersion="firestore/timestamp/1.0",ee._jsonSchema={type:me("string",ee._jsonSchemaVersion),seconds:me("number"),nanoseconds:me("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class j{static fromTimestamp(e){return new j(e)}static min(){return new j(new ee(0,0))}static max(){return new j(new ee(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hn=-1;class Ai{constructor(e,t,n,s){this.indexId=e,this.collectionGroup=t,this.fields=n,this.indexState=s}}function ya(r){return r.fields.find(e=>e.kind===2)}function Zt(r){return r.fields.filter(e=>e.kind!==2)}Ai.UNKNOWN_ID=-1;class ai{constructor(e,t){this.fieldPath=e,this.kind=t}}class os{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new os(0,Ue.min())}}function Ud(r,e){const t=r.toTimestamp().seconds,n=r.toTimestamp().nanoseconds+1,s=j.fromTimestamp(n===1e9?new ee(t+1,0):new ee(t,n));return new Ue(s,O.empty(),e)}function jd(r){return new Ue(r.readTime,r.key,Hn)}class Ue{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new Ue(j.min(),O.empty(),Hn)}static max(){return new Ue(j.max(),O.empty(),Hn)}}function Xa(r,e){let t=r.readTime.compareTo(e.readTime);return t!==0?t:(t=O.comparator(r.documentKey,e.documentKey),t!==0?t:$(r.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $d="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class qd{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function jt(r){if(r.code!==P.FAILED_PRECONDITION||r.message!==$d)throw r;V("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class w{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&M(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new w((n,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(n,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(n,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof w?t:w.resolve(t)}catch(t){return w.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):w.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):w.reject(t)}static resolve(e){return new w((t,n)=>{t(e)})}static reject(e){return new w((t,n)=>{n(e)})}static waitFor(e){return new w((t,n)=>{let s=0,i=0,o=!1;e.forEach(c=>{++s,c.next(()=>{++i,o&&i===s&&t()},u=>n(u))}),o=!0,i===s&&t()})}static or(e){let t=w.resolve(!1);for(const n of e)t=t.next(s=>s?w.resolve(s):n());return t}static forEach(e,t){const n=[];return e.forEach((s,i)=>{n.push(t.call(this,s,i))}),this.waitFor(n)}static mapArray(e,t){return new w((n,s)=>{const i=e.length,o=new Array(i);let c=0;for(let u=0;u<i;u++){const h=u;t(e[h]).next(f=>{o[h]=f,++c,c===i&&n(o)},f=>s(f))}})}static doWhile(e,t){return new w((n,s)=>{const i=()=>{e()===!0?t().next(()=>{i()},s):n()};i()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Le="SimpleDb";class Yi{static open(e,t,n,s){try{return new Yi(t,e.transaction(s,n))}catch(i){throw new Kr(t,i)}}constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.S=new Ye,this.transaction.oncomplete=()=>{this.S.resolve()},this.transaction.onabort=()=>{t.error?this.S.reject(new Kr(e,t.error)):this.S.resolve()},this.transaction.onerror=n=>{const s=Ja(n.target.error);this.S.reject(new Kr(e,s))}}get D(){return this.S.promise}abort(e){e&&this.S.reject(e),this.aborted||(V(Le,"Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}v(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new Ry(t)}}class xt{static delete(e){return V(Le,"Removing database:",e),tn(Ed().indexedDB.deleteDatabase(e)).toPromise()}static C(){if(!sy())return!1;if(xt.F())return!0;const e=wi(),t=xt.M(e),n=0<t&&t<10,s=zd(e),i=0<s&&s<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||n||i)}static F(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)===null||e===void 0?void 0:e.O)==="YES"}static N(e,t){return e.store(t)}static M(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),n=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(n)}constructor(e,t,n){this.name=e,this.version=t,this.B=n,this.L=null,xt.M(wi())===12.2&&de("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async k(e){return this.db||(V(Le,"Opening database:",this.name),this.db=await new Promise((t,n)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const o=i.target.result;t(o)},s.onblocked=()=>{n(new Kr(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const o=i.target.error;o.name==="VersionError"?n(new k(P.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?n(new k(P.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):n(new Kr(e,o))},s.onupgradeneeded=i=>{V(Le,'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const o=i.target.result;if(this.L!==null&&this.L!==i.oldVersion)throw new Error(`refusing to open IndexedDB database due to potential corruption of the IndexedDB database data; this corruption could be caused by clicking the "clear site data" button in a web browser; try reloading the web page to re-initialize the IndexedDB database: lastClosedDbVersion=${this.L}, event.oldVersion=${i.oldVersion}, event.newVersion=${i.newVersion}, db.version=${o.version}`);this.B.q(o,s.transaction,i.oldVersion,this.version).next(()=>{V(Le,"Database upgrade to version "+this.version+" complete")})}}),this.db.addEventListener("close",t=>{const n=t.target;this.L=n.version},{passive:!0})),this.db.addEventListener("versionchange",t=>{var n;t.newVersion===null&&(ht('Received "versionchange" event with newVersion===null; notifying the registered DatabaseDeletedListener, if any'),(n=this.databaseDeletedListener)===null||n===void 0||n.call(this))},{passive:!0}),this.db}setDatabaseDeletedListener(e){if(this.databaseDeletedListener)throw new Error("setDatabaseDeletedListener() may only be called once, and it has already been called");this.databaseDeletedListener=e}async runTransaction(e,t,n,s){const i=t==="readonly";let o=0;for(;;){++o;try{this.db=await this.k(e);const c=Yi.open(this.db,e,i?"readonly":"readwrite",n),u=s(c).next(h=>(c.v(),h)).catch(h=>(c.abort(h),w.reject(h))).toPromise();return u.catch(()=>{}),await c.D,u}catch(c){const u=c,h=u.name!=="FirebaseError"&&o<3;if(V(Le,"Transaction failed with error:",u.message,"Retrying:",h),this.close(),!h)return Promise.reject(u)}}}close(){this.db&&this.db.close(),this.db=void 0}}function zd(r){const e=r.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class Sy{constructor(e){this.$=e,this.U=!1,this.K=null}get isDone(){return this.U}get W(){return this.K}set cursor(e){this.$=e}done(){this.U=!0}G(e){this.K=e}delete(){return tn(this.$.delete())}}class Kr extends k{constructor(e,t){super(P.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function $t(r){return r.name==="IndexedDbTransactionError"}class Ry{constructor(e){this.store=e}put(e,t){let n;return t!==void 0?(V(Le,"PUT",this.store.name,e,t),n=this.store.put(t,e)):(V(Le,"PUT",this.store.name,"<auto-key>",e),n=this.store.put(e)),tn(n)}add(e){return V(Le,"ADD",this.store.name,e,e),tn(this.store.add(e))}get(e){return tn(this.store.get(e)).next(t=>(t===void 0&&(t=null),V(Le,"GET",this.store.name,e,t),t))}delete(e){return V(Le,"DELETE",this.store.name,e),tn(this.store.delete(e))}count(){return V(Le,"COUNT",this.store.name),tn(this.store.count())}j(e,t){const n=this.options(e,t),s=n.index?this.store.index(n.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(n.range);return new w((o,c)=>{i.onerror=u=>{c(u.target.error)},i.onsuccess=u=>{o(u.target.result)}})}{const i=this.cursor(n),o=[];return this.J(i,(c,u)=>{o.push(u)}).next(()=>o)}}H(e,t){const n=this.store.getAll(e,t===null?void 0:t);return new w((s,i)=>{n.onerror=o=>{i(o.target.error)},n.onsuccess=o=>{s(o.target.result)}})}Y(e,t){V(Le,"DELETE ALL",this.store.name);const n=this.options(e,t);n.Z=!1;const s=this.cursor(n);return this.J(s,(i,o,c)=>c.delete())}X(e,t){let n;t?n=e:(n={},t=e);const s=this.cursor(n);return this.J(s,t)}ee(e){const t=this.cursor({});return new w((n,s)=>{t.onerror=i=>{const o=Ja(i.target.error);s(o)},t.onsuccess=i=>{const o=i.target.result;o?e(o.primaryKey,o.value).next(c=>{c?o.continue():n()}):n()}})}J(e,t){const n=[];return new w((s,i)=>{e.onerror=o=>{i(o.target.error)},e.onsuccess=o=>{const c=o.target.result;if(!c)return void s();const u=new Sy(c),h=t(c.primaryKey,c.value,u);if(h instanceof w){const f=h.catch(m=>(u.done(),w.reject(m)));n.push(f)}u.isDone?s():u.W===null?c.continue():c.continue(u.W)}}).next(()=>w.waitFor(n))}options(e,t){let n;return e!==void 0&&(typeof e=="string"?n=e:t=e),{index:n,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const n=this.store.index(e.index);return e.Z?n.openKeyCursor(e.range,t):n.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function tn(r){return new w((e,t)=>{r.onsuccess=n=>{const s=n.target.result;e(s)},r.onerror=n=>{const s=Ja(n.target.error);t(s)}})}let Sl=!1;function Ja(r){const e=xt.M(wi());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(r.message.indexOf(t)>=0){const n=new k("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return Sl||(Sl=!0,setTimeout(()=>{throw n},0)),n}}return r}const Wr="IndexBackfiller";class Py{constructor(e,t){this.asyncQueue=e,this.te=t,this.task=null}start(){this.ne(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}ne(e){V(Wr,`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,async()=>{this.task=null;try{const t=await this.te.re();V(Wr,`Documents written: ${t}`)}catch(t){$t(t)?V(Wr,"Ignoring IndexedDB error during index backfill: ",t):await jt(t)}await this.ne(6e4)})}}class Cy{constructor(e,t){this.localStore=e,this.persistence=t}async re(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",t=>this.ie(t,e))}ie(e,t){const n=new Set;let s=t,i=!0;return w.doWhile(()=>i===!0&&s>0,()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next(o=>{if(o!==null&&!n.has(o))return V(Wr,`Processing collection: ${o}`),this.se(e,o,s).next(c=>{s-=c,n.add(o)});i=!1})).next(()=>t-s)}se(e,t,n){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next(s=>this.localStore.localDocuments.getNextDocuments(e,t,s,n).next(i=>{const o=i.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next(()=>this.oe(s,i)).next(c=>(V(Wr,`Updating offset: ${c}`),this.localStore.indexManager.updateCollectionGroup(e,t,c))).next(()=>o.size)}))}oe(e,t){let n=e;return t.changes.forEach((s,i)=>{const o=jd(i);Xa(o,n)>0&&(n=o)}),new Ue(n.readTime,n.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xe{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=n=>this._e(n),this.ae=n=>t.writeSequenceNumber(n))}_e(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ae&&this.ae(e),e}}xe.ue=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cn=-1;function Zi(r){return r==null}function as(r){return r===0&&1/r==-1/0}function Gd(r){return typeof r=="number"&&Number.isInteger(r)&&!as(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bi="";function Pe(r){let e="";for(let t=0;t<r.length;t++)e.length>0&&(e=Rl(e)),e=Vy(r.get(t),e);return Rl(e)}function Vy(r,e){let t=e;const n=r.length;for(let s=0;s<n;s++){const i=r.charAt(s);switch(i){case"\0":t+="";break;case bi:t+="";break;default:t+=i}}return t}function Rl(r){return r+bi+""}function Xe(r){const e=r.length;if(U(e>=2,64408,{path:r}),e===2)return U(r.charAt(0)===bi&&r.charAt(1)==="",56145,{path:r}),Y.emptyPath();const t=e-2,n=[];let s="";for(let i=0;i<e;){const o=r.indexOf(bi,i);switch((o<0||o>t)&&M(50515,{path:r}),r.charAt(o+1)){case"":const c=r.substring(i,o);let u;s.length===0?u=c:(s+=c,u=s,s=""),n.push(u);break;case"":s+=r.substring(i,o),s+="\0";break;case"":s+=r.substring(i,o+1);break;default:M(61167,{path:r})}i=o+2}return new Y(n)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const en="remoteDocuments",Ts="owner",Rn="owner",cs="mutationQueues",Dy="userId",ze="mutations",Pl="batchId",on="userMutationsIndex",Cl=["userId","batchId"];/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ci(r,e){return[r,Pe(e)]}function Hd(r,e,t){return[r,Pe(e),t]}const ky={},Kn="documentMutations",Si="remoteDocumentsV14",Ny=["prefixPath","collectionGroup","readTime","documentId"],ui="documentKeyIndex",xy=["prefixPath","collectionGroup","documentId"],Kd="collectionGroupIndex",Oy=["collectionGroup","readTime","prefixPath","documentId"],us="remoteDocumentGlobal",Ia="remoteDocumentGlobalKey",Wn="targets",Wd="queryTargetsIndex",My=["canonicalId","targetId"],Qn="targetDocuments",Ly=["targetId","path"],Ya="documentTargetsIndex",Fy=["path","targetId"],Ri="targetGlobalKey",un="targetGlobal",ls="collectionParents",By=["collectionId","parent"],Xn="clientMetadata",Uy="clientId",eo="bundles",jy="bundleId",to="namedQueries",$y="name",Za="indexConfiguration",qy="indexId",Ea="collectionGroupIndex",zy="collectionGroup",Qr="indexState",Gy=["indexId","uid"],Qd="sequenceNumberIndex",Hy=["uid","sequenceNumber"],Xr="indexEntries",Ky=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],Xd="documentKeyIndex",Wy=["indexId","uid","orderedDocumentKey"],no="documentOverlays",Qy=["userId","collectionPath","documentId"],va="collectionPathOverlayIndex",Xy=["userId","collectionPath","largestBatchId"],Jd="collectionGroupOverlayIndex",Jy=["userId","collectionGroup","largestBatchId"],ec="globals",Yy="name",Yd=[cs,ze,Kn,en,Wn,Ts,un,Qn,Xn,us,ls,eo,to],Zy=[...Yd,no],Zd=[cs,ze,Kn,Si,Wn,Ts,un,Qn,Xn,us,ls,eo,to,no],ef=Zd,tc=[...ef,Za,Qr,Xr],eI=tc,tf=[...tc,ec],tI=tf;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ta extends qd{constructor(e,t){super(),this.ce=e,this.currentSequenceNumber=t}}function _e(r,e){const t=F(r);return xt.N(t.ce,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vl(r){let e=0;for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e++;return e}function vn(r,e){for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e(t,r[t])}function nf(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ie{constructor(e,t){this.comparator=e,this.root=t||ve.EMPTY}insert(e,t){return new ie(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,ve.BLACK,null,null))}remove(e){return new ie(this.comparator,this.root.remove(e,this.comparator).copy(null,null,ve.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(n===0)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const s=this.comparator(e,n.key);if(s===0)return t+n.left.size;s<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,n)=>(e(t,n),!1))}toString(){const e=[];return this.inorderTraversal((t,n)=>(e.push(`${t}:${n}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Zs(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Zs(this.root,e,this.comparator,!1)}getReverseIterator(){return new Zs(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Zs(this.root,e,this.comparator,!0)}}class Zs{constructor(e,t,n,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?n(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class ve{constructor(e,t,n,s,i){this.key=e,this.value=t,this.color=n??ve.RED,this.left=s??ve.EMPTY,this.right=i??ve.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,s,i){return new ve(e??this.key,t??this.value,n??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let s=this;const i=n(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,n),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,n)),s.fixUp()}removeMin(){if(this.left.isEmpty())return ve.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return ve.EMPTY;n=s.right.min(),s=s.copy(n.key,n.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,ve.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,ve.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw M(43730,{key:this.key,value:this.value});if(this.right.isRed())throw M(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw M(27949);return e+(this.isRed()?0:1)}}ve.EMPTY=null,ve.RED=!0,ve.BLACK=!1;ve.EMPTY=new class{constructor(){this.size=0}get key(){throw M(57766)}get value(){throw M(16141)}get color(){throw M(16727)}get left(){throw M(29726)}get right(){throw M(36894)}copy(e,t,n,s,i){return this}insert(e,t,n){return new ve(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ne{constructor(e){this.comparator=e,this.data=new ie(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,n)=>(e(t),!1))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const s=n.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let n;for(n=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Dl(this.data.getIterator())}getIteratorFrom(e){return new Dl(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(n=>{t=t.add(n)}),t}isEqual(e){if(!(e instanceof ne)||this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new ne(this.comparator);return t.data=e,t}}class Dl{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function Pn(r){return r.hasNext()?r.getNext():void 0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $e{constructor(e){this.fields=e,e.sort(ue.comparator)}static empty(){return new $e([])}unionWith(e){let t=new ne(ue.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new $e(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Gn(this.fields,e.fields,(t,n)=>t.isEqual(n))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rf extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fe{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new rf("Invalid base64 string: "+i):i}}(e);return new fe(t)}static fromUint8Array(e){const t=function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i}(e);return new fe(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return $(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}fe.EMPTY_BYTE_STRING=new fe("");const nI=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function dt(r){if(U(!!r,39018),typeof r=="string"){let e=0;const t=nI.exec(r);if(U(!!t,46558,{timestamp:r}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const n=new Date(r);return{seconds:Math.floor(n.getTime()/1e3),nanos:e}}return{seconds:ce(r.seconds),nanos:ce(r.nanos)}}function ce(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function ft(r){return typeof r=="string"?fe.fromBase64String(r):fe.fromUint8Array(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sf="server_timestamp",of="__type__",af="__previous_value__",cf="__local_write_time__";function nc(r){var e,t;return((t=(((e=r==null?void 0:r.mapValue)===null||e===void 0?void 0:e.fields)||{})[of])===null||t===void 0?void 0:t.stringValue)===sf}function ro(r){const e=r.mapValue.fields[af];return nc(e)?ro(e):e}function hs(r){const e=dt(r.mapValue.fields[cf].timestampValue);return new ee(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rI{constructor(e,t,n,s,i,o,c,u,h,f){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=c,this.longPollingOptions=u,this.useFetchStreams=h,this.isUsingEmulator=f}}const ds="(default)";class pn{constructor(e,t){this.projectId=e,this.database=t||ds}static empty(){return new pn("","")}get isDefaultDatabase(){return this.database===ds}isEqual(e){return e instanceof pn&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rc="__type__",uf="__max__",Ct={mapValue:{fields:{__type__:{stringValue:uf}}}},sc="__vector__",Jn="value",li={nullValue:"NULL_VALUE"};function Lt(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?nc(r)?4:lf(r)?9007199254740991:so(r)?10:11:M(28295,{value:r})}function nt(r,e){if(r===e)return!0;const t=Lt(r);if(t!==Lt(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===e.booleanValue;case 4:return hs(r).isEqual(hs(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const o=dt(s.timestampValue),c=dt(i.timestampValue);return o.seconds===c.seconds&&o.nanos===c.nanos}(r,e);case 5:return r.stringValue===e.stringValue;case 6:return function(s,i){return ft(s.bytesValue).isEqual(ft(i.bytesValue))}(r,e);case 7:return r.referenceValue===e.referenceValue;case 8:return function(s,i){return ce(s.geoPointValue.latitude)===ce(i.geoPointValue.latitude)&&ce(s.geoPointValue.longitude)===ce(i.geoPointValue.longitude)}(r,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return ce(s.integerValue)===ce(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const o=ce(s.doubleValue),c=ce(i.doubleValue);return o===c?as(o)===as(c):isNaN(o)&&isNaN(c)}return!1}(r,e);case 9:return Gn(r.arrayValue.values||[],e.arrayValue.values||[],nt);case 10:case 11:return function(s,i){const o=s.mapValue.fields||{},c=i.mapValue.fields||{};if(Vl(o)!==Vl(c))return!1;for(const u in o)if(o.hasOwnProperty(u)&&(c[u]===void 0||!nt(o[u],c[u])))return!1;return!0}(r,e);default:return M(52216,{left:r})}}function fs(r,e){return(r.values||[]).find(t=>nt(t,e))!==void 0}function Ft(r,e){if(r===e)return 0;const t=Lt(r),n=Lt(e);if(t!==n)return $(t,n);switch(t){case 0:case 9007199254740991:return 0;case 1:return $(r.booleanValue,e.booleanValue);case 2:return function(i,o){const c=ce(i.integerValue||i.doubleValue),u=ce(o.integerValue||o.doubleValue);return c<u?-1:c>u?1:c===u?0:isNaN(c)?isNaN(u)?0:-1:1}(r,e);case 3:return kl(r.timestampValue,e.timestampValue);case 4:return kl(hs(r),hs(e));case 5:return _a(r.stringValue,e.stringValue);case 6:return function(i,o){const c=ft(i),u=ft(o);return c.compareTo(u)}(r.bytesValue,e.bytesValue);case 7:return function(i,o){const c=i.split("/"),u=o.split("/");for(let h=0;h<c.length&&h<u.length;h++){const f=$(c[h],u[h]);if(f!==0)return f}return $(c.length,u.length)}(r.referenceValue,e.referenceValue);case 8:return function(i,o){const c=$(ce(i.latitude),ce(o.latitude));return c!==0?c:$(ce(i.longitude),ce(o.longitude))}(r.geoPointValue,e.geoPointValue);case 9:return Nl(r.arrayValue,e.arrayValue);case 10:return function(i,o){var c,u,h,f;const m=i.fields||{},g=o.fields||{},S=(c=m[Jn])===null||c===void 0?void 0:c.arrayValue,C=(u=g[Jn])===null||u===void 0?void 0:u.arrayValue,N=$(((h=S==null?void 0:S.values)===null||h===void 0?void 0:h.length)||0,((f=C==null?void 0:C.values)===null||f===void 0?void 0:f.length)||0);return N!==0?N:Nl(S,C)}(r.mapValue,e.mapValue);case 11:return function(i,o){if(i===Ct.mapValue&&o===Ct.mapValue)return 0;if(i===Ct.mapValue)return 1;if(o===Ct.mapValue)return-1;const c=i.fields||{},u=Object.keys(c),h=o.fields||{},f=Object.keys(h);u.sort(),f.sort();for(let m=0;m<u.length&&m<f.length;++m){const g=_a(u[m],f[m]);if(g!==0)return g;const S=Ft(c[u[m]],h[f[m]]);if(S!==0)return S}return $(u.length,f.length)}(r.mapValue,e.mapValue);default:throw M(23264,{le:t})}}function kl(r,e){if(typeof r=="string"&&typeof e=="string"&&r.length===e.length)return $(r,e);const t=dt(r),n=dt(e),s=$(t.seconds,n.seconds);return s!==0?s:$(t.nanos,n.nanos)}function Nl(r,e){const t=r.values||[],n=e.values||[];for(let s=0;s<t.length&&s<n.length;++s){const i=Ft(t[s],n[s]);if(i)return i}return $(t.length,n.length)}function Yn(r){return wa(r)}function wa(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?function(t){const n=dt(t);return`time(${n.seconds},${n.nanos})`}(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?function(t){return ft(t).toBase64()}(r.bytesValue):"referenceValue"in r?function(t){return O.fromName(t).toString()}(r.referenceValue):"geoPointValue"in r?function(t){return`geo(${t.latitude},${t.longitude})`}(r.geoPointValue):"arrayValue"in r?function(t){let n="[",s=!0;for(const i of t.values||[])s?s=!1:n+=",",n+=wa(i);return n+"]"}(r.arrayValue):"mapValue"in r?function(t){const n=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of n)i?i=!1:s+=",",s+=`${o}:${wa(t.fields[o])}`;return s+"}"}(r.mapValue):M(61005,{value:r})}function hi(r){switch(Lt(r)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=ro(r);return e?16+hi(e):16;case 5:return 2*r.stringValue.length;case 6:return ft(r.bytesValue).approximateByteSize();case 7:return r.referenceValue.length;case 9:return function(n){return(n.values||[]).reduce((s,i)=>s+hi(i),0)}(r.arrayValue);case 10:case 11:return function(n){let s=0;return vn(n.fields,(i,o)=>{s+=i.length+hi(o)}),s}(r.mapValue);default:throw M(13486,{value:r})}}function ps(r,e){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${e.path.canonicalString()}`}}function Aa(r){return!!r&&"integerValue"in r}function ms(r){return!!r&&"arrayValue"in r}function xl(r){return!!r&&"nullValue"in r}function Ol(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function di(r){return!!r&&"mapValue"in r}function so(r){var e,t;return((t=(((e=r==null?void 0:r.mapValue)===null||e===void 0?void 0:e.fields)||{})[rc])===null||t===void 0?void 0:t.stringValue)===sc}function Jr(r){if(r.geoPointValue)return{geoPointValue:Object.assign({},r.geoPointValue)};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:Object.assign({},r.timestampValue)};if(r.mapValue){const e={mapValue:{fields:{}}};return vn(r.mapValue.fields,(t,n)=>e.mapValue.fields[t]=Jr(n)),e}if(r.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(r.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Jr(r.arrayValue.values[t]);return e}return Object.assign({},r)}function lf(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue===uf}const hf={mapValue:{fields:{[rc]:{stringValue:sc},[Jn]:{arrayValue:{}}}}};function sI(r){return"nullValue"in r?li:"booleanValue"in r?{booleanValue:!1}:"integerValue"in r||"doubleValue"in r?{doubleValue:NaN}:"timestampValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in r?{stringValue:""}:"bytesValue"in r?{bytesValue:""}:"referenceValue"in r?ps(pn.empty(),O.empty()):"geoPointValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in r?{arrayValue:{}}:"mapValue"in r?so(r)?hf:{mapValue:{}}:M(35942,{value:r})}function iI(r){return"nullValue"in r?{booleanValue:!1}:"booleanValue"in r?{doubleValue:NaN}:"integerValue"in r||"doubleValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in r?{stringValue:""}:"stringValue"in r?{bytesValue:""}:"bytesValue"in r?ps(pn.empty(),O.empty()):"referenceValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in r?{arrayValue:{}}:"arrayValue"in r?hf:"mapValue"in r?so(r)?{mapValue:{}}:Ct:M(61959,{value:r})}function Ml(r,e){const t=Ft(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?-1:!r.inclusive&&e.inclusive?1:0}function Ll(r,e){const t=Ft(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?1:!r.inclusive&&e.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ne{constructor(e){this.value=e}static empty(){return new Ne({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!di(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Jr(t)}setAll(e){let t=ue.emptyPath(),n={},s=[];e.forEach((o,c)=>{if(!t.isImmediateParentOf(c)){const u=this.getFieldsMap(t);this.applyChanges(u,n,s),n={},s=[],t=c.popLast()}o?n[c.lastSegment()]=Jr(o):s.push(c.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,n,s)}delete(e){const t=this.field(e.popLast());di(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return nt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let s=t.mapValue.fields[e.get(n)];di(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,n){vn(t,(s,i)=>e[s]=i);for(const s of n)delete e[s]}clone(){return new Ne(Jr(this.value))}}function df(r){const e=[];return vn(r.fields,(t,n)=>{const s=new ue([t]);if(di(n)){const i=df(n.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)}),new $e(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class he{constructor(e,t,n,s,i,o,c){this.key=e,this.documentType=t,this.version=n,this.readTime=s,this.createTime=i,this.data=o,this.documentState=c}static newInvalidDocument(e){return new he(e,0,j.min(),j.min(),j.min(),Ne.empty(),0)}static newFoundDocument(e,t,n,s){return new he(e,1,t,j.min(),n,s,0)}static newNoDocument(e,t){return new he(e,2,t,j.min(),j.min(),Ne.empty(),0)}static newUnknownDocument(e,t){return new he(e,3,t,j.min(),j.min(),Ne.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(j.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Ne.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Ne.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=j.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof he&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new he(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zn{constructor(e,t){this.position=e,this.inclusive=t}}function Fl(r,e,t){let n=0;for(let s=0;s<r.position.length;s++){const i=e[s],o=r.position[s];if(i.field.isKeyField()?n=O.comparator(O.fromName(o.referenceValue),t.key):n=Ft(o,t.data.field(i.field)),i.dir==="desc"&&(n*=-1),n!==0)break}return n}function Bl(r,e){if(r===null)return e===null;if(e===null||r.inclusive!==e.inclusive||r.position.length!==e.position.length)return!1;for(let t=0;t<r.position.length;t++)if(!nt(r.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gs{constructor(e,t="asc"){this.field=e,this.dir=t}}function oI(r,e){return r.dir===e.dir&&r.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ff{}class W extends ff{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,n):new aI(e,t,n):t==="array-contains"?new lI(e,n):t==="in"?new If(e,n):t==="not-in"?new hI(e,n):t==="array-contains-any"?new dI(e,n):new W(e,t,n)}static createKeyFieldInFilter(e,t,n){return t==="in"?new cI(e,n):new uI(e,n)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(Ft(t,this.value)):t!==null&&Lt(this.value)===Lt(t)&&this.matchesComparison(Ft(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return M(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class te extends ff{constructor(e,t){super(),this.filters=e,this.op=t,this.he=null}static create(e,t){return new te(e,t)}matches(e){return er(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.he!==null||(this.he=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.he}getFilters(){return Object.assign([],this.filters)}}function er(r){return r.op==="and"}function ba(r){return r.op==="or"}function ic(r){return pf(r)&&er(r)}function pf(r){for(const e of r.filters)if(e instanceof te)return!1;return!0}function Sa(r){if(r instanceof W)return r.field.canonicalString()+r.op.toString()+Yn(r.value);if(ic(r))return r.filters.map(e=>Sa(e)).join(",");{const e=r.filters.map(t=>Sa(t)).join(",");return`${r.op}(${e})`}}function mf(r,e){return r instanceof W?function(n,s){return s instanceof W&&n.op===s.op&&n.field.isEqual(s.field)&&nt(n.value,s.value)}(r,e):r instanceof te?function(n,s){return s instanceof te&&n.op===s.op&&n.filters.length===s.filters.length?n.filters.reduce((i,o,c)=>i&&mf(o,s.filters[c]),!0):!1}(r,e):void M(19439)}function gf(r,e){const t=r.filters.concat(e);return te.create(t,r.op)}function _f(r){return r instanceof W?function(t){return`${t.field.canonicalString()} ${t.op} ${Yn(t.value)}`}(r):r instanceof te?function(t){return t.op.toString()+" {"+t.getFilters().map(_f).join(" ,")+"}"}(r):"Filter"}class aI extends W{constructor(e,t,n){super(e,t,n),this.key=O.fromName(n.referenceValue)}matches(e){const t=O.comparator(e.key,this.key);return this.matchesComparison(t)}}class cI extends W{constructor(e,t){super(e,"in",t),this.keys=yf("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class uI extends W{constructor(e,t){super(e,"not-in",t),this.keys=yf("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function yf(r,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(n=>O.fromName(n.referenceValue))}class lI extends W{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return ms(t)&&fs(t.arrayValue,this.value)}}class If extends W{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&fs(this.value.arrayValue,t)}}class hI extends W{constructor(e,t){super(e,"not-in",t)}matches(e){if(fs(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!fs(this.value.arrayValue,t)}}class dI extends W{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!ms(t)||!t.arrayValue.values)&&t.arrayValue.values.some(n=>fs(this.value.arrayValue,n))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fI{constructor(e,t=null,n=[],s=[],i=null,o=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=s,this.limit=i,this.startAt=o,this.endAt=c,this.Pe=null}}function Ra(r,e=null,t=[],n=[],s=null,i=null,o=null){return new fI(r,e,t,n,s,i,o)}function mn(r){const e=F(r);if(e.Pe===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(n=>Sa(n)).join(","),t+="|ob:",t+=e.orderBy.map(n=>function(i){return i.field.canonicalString()+i.dir}(n)).join(","),Zi(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(n=>Yn(n)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(n=>Yn(n)).join(",")),e.Pe=t}return e.Pe}function ws(r,e){if(r.limit!==e.limit||r.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<r.orderBy.length;t++)if(!oI(r.orderBy[t],e.orderBy[t]))return!1;if(r.filters.length!==e.filters.length)return!1;for(let t=0;t<r.filters.length;t++)if(!mf(r.filters[t],e.filters[t]))return!1;return r.collectionGroup===e.collectionGroup&&!!r.path.isEqual(e.path)&&!!Bl(r.startAt,e.startAt)&&Bl(r.endAt,e.endAt)}function Pi(r){return O.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function Ci(r,e){return r.filters.filter(t=>t instanceof W&&t.field.isEqual(e))}function Ul(r,e,t){let n=li,s=!0;for(const i of Ci(r,e)){let o=li,c=!0;switch(i.op){case"<":case"<=":o=sI(i.value);break;case"==":case"in":case">=":o=i.value;break;case">":o=i.value,c=!1;break;case"!=":case"not-in":o=li}Ml({value:n,inclusive:s},{value:o,inclusive:c})<0&&(n=o,s=c)}if(t!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(e)){const o=t.position[i];Ml({value:n,inclusive:s},{value:o,inclusive:t.inclusive})<0&&(n=o,s=t.inclusive);break}}return{value:n,inclusive:s}}function jl(r,e,t){let n=Ct,s=!0;for(const i of Ci(r,e)){let o=Ct,c=!0;switch(i.op){case">=":case">":o=iI(i.value),c=!1;break;case"==":case"in":case"<=":o=i.value;break;case"<":o=i.value,c=!1;break;case"!=":case"not-in":o=Ct}Ll({value:n,inclusive:s},{value:o,inclusive:c})>0&&(n=o,s=c)}if(t!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(e)){const o=t.position[i];Ll({value:n,inclusive:s},{value:o,inclusive:t.inclusive})>0&&(n=o,s=t.inclusive);break}}return{value:n,inclusive:s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dr{constructor(e,t=null,n=[],s=[],i=null,o="F",c=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=s,this.limit=i,this.limitType=o,this.startAt=c,this.endAt=u,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}}function Ef(r,e,t,n,s,i,o,c){return new dr(r,e,t,n,s,i,o,c)}function io(r){return new dr(r)}function $l(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function vf(r){return r.collectionGroup!==null}function Yr(r){const e=F(r);if(e.Te===null){e.Te=[];const t=new Set;for(const i of e.explicitOrderBy)e.Te.push(i),t.add(i.field.canonicalString());const n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let c=new ne(ue.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(h=>{h.isInequality()&&(c=c.add(h.field))})}),c})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.Te.push(new gs(i,n))}),t.has(ue.keyField().canonicalString())||e.Te.push(new gs(ue.keyField(),n))}return e.Te}function Be(r){const e=F(r);return e.Ie||(e.Ie=pI(e,Yr(r))),e.Ie}function pI(r,e){if(r.limitType==="F")return Ra(r.path,r.collectionGroup,e,r.filters,r.limit,r.startAt,r.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new gs(s.field,i)});const t=r.endAt?new Zn(r.endAt.position,r.endAt.inclusive):null,n=r.startAt?new Zn(r.startAt.position,r.startAt.inclusive):null;return Ra(r.path,r.collectionGroup,e,r.filters,r.limit,t,n)}}function Pa(r,e){const t=r.filters.concat([e]);return new dr(r.path,r.collectionGroup,r.explicitOrderBy.slice(),t,r.limit,r.limitType,r.startAt,r.endAt)}function Vi(r,e,t){return new dr(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),e,t,r.startAt,r.endAt)}function oo(r,e){return ws(Be(r),Be(e))&&r.limitType===e.limitType}function Tf(r){return`${mn(Be(r))}|lt:${r.limitType}`}function xn(r){return`Query(target=${function(t){let n=t.path.canonicalString();return t.collectionGroup!==null&&(n+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(n+=`, filters: [${t.filters.map(s=>_f(s)).join(", ")}]`),Zi(t.limit)||(n+=", limit: "+t.limit),t.orderBy.length>0&&(n+=`, orderBy: [${t.orderBy.map(s=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(s)).join(", ")}]`),t.startAt&&(n+=", startAt: ",n+=t.startAt.inclusive?"b:":"a:",n+=t.startAt.position.map(s=>Yn(s)).join(",")),t.endAt&&(n+=", endAt: ",n+=t.endAt.inclusive?"a:":"b:",n+=t.endAt.position.map(s=>Yn(s)).join(",")),`Target(${n})`}(Be(r))}; limitType=${r.limitType})`}function As(r,e){return e.isFoundDocument()&&function(n,s){const i=s.key.path;return n.collectionGroup!==null?s.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(i):O.isDocumentKey(n.path)?n.path.isEqual(i):n.path.isImmediateParentOf(i)}(r,e)&&function(n,s){for(const i of Yr(n))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(r,e)&&function(n,s){for(const i of n.filters)if(!i.matches(s))return!1;return!0}(r,e)&&function(n,s){return!(n.startAt&&!function(o,c,u){const h=Fl(o,c,u);return o.inclusive?h<=0:h<0}(n.startAt,Yr(n),s)||n.endAt&&!function(o,c,u){const h=Fl(o,c,u);return o.inclusive?h>=0:h>0}(n.endAt,Yr(n),s))}(r,e)}function wf(r){return r.collectionGroup||(r.path.length%2==1?r.path.lastSegment():r.path.get(r.path.length-2))}function Af(r){return(e,t)=>{let n=!1;for(const s of Yr(r)){const i=mI(s,e,t);if(i!==0)return i;n=n||s.field.isKeyField()}return 0}}function mI(r,e,t){const n=r.field.isKeyField()?O.comparator(e.key,t.key):function(i,o,c){const u=o.data.field(i),h=c.data.field(i);return u!==null&&h!==null?Ft(u,h):M(42886)}(r.field,e,t);switch(r.dir){case"asc":return n;case"desc":return-1*n;default:return M(19790,{direction:r.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mt{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n!==void 0){for(const[s,i]of n)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const n=this.mapKeyFn(e),s=this.inner[n];if(s===void 0)return this.inner[n]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n===void 0)return!1;for(let s=0;s<n.length;s++)if(this.equalsFn(n[s][0],e))return n.length===1?delete this.inner[t]:n.splice(s,1),this.innerSize--,!0;return!1}forEach(e){vn(this.inner,(t,n)=>{for(const[s,i]of n)e(s,i)})}isEmpty(){return nf(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gI=new ie(O.comparator);function Fe(){return gI}const bf=new ie(O.comparator);function $r(...r){let e=bf;for(const t of r)e=e.insert(t.key,t);return e}function Sf(r){let e=bf;return r.forEach((t,n)=>e=e.insert(t,n.overlayedDocument)),e}function Je(){return Zr()}function Rf(){return Zr()}function Zr(){return new mt(r=>r.toString(),(r,e)=>r.isEqual(e))}const _I=new ie(O.comparator),yI=new ne(O.comparator);function G(...r){let e=yI;for(const t of r)e=e.add(t);return e}const II=new ne($);function oc(){return II}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ac(r,e){if(r.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:as(e)?"-0":e}}function Pf(r){return{integerValue:""+r}}function EI(r,e){return Gd(e)?Pf(e):ac(r,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ao{constructor(){this._=void 0}}function vI(r,e,t){return r instanceof tr?function(s,i){const o={fields:{[of]:{stringValue:sf},[cf]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&nc(i)&&(i=ro(i)),i&&(o.fields[af]=i),{mapValue:o}}(t,e):r instanceof nr?Vf(r,e):r instanceof rr?Df(r,e):function(s,i){const o=Cf(s,i),c=ql(o)+ql(s.Ee);return Aa(o)&&Aa(s.Ee)?Pf(c):ac(s.serializer,c)}(r,e)}function TI(r,e,t){return r instanceof nr?Vf(r,e):r instanceof rr?Df(r,e):t}function Cf(r,e){return r instanceof _s?function(n){return Aa(n)||function(i){return!!i&&"doubleValue"in i}(n)}(e)?e:{integerValue:0}:null}class tr extends ao{}class nr extends ao{constructor(e){super(),this.elements=e}}function Vf(r,e){const t=kf(e);for(const n of r.elements)t.some(s=>nt(s,n))||t.push(n);return{arrayValue:{values:t}}}class rr extends ao{constructor(e){super(),this.elements=e}}function Df(r,e){let t=kf(e);for(const n of r.elements)t=t.filter(s=>!nt(s,n));return{arrayValue:{values:t}}}class _s extends ao{constructor(e,t){super(),this.serializer=e,this.Ee=t}}function ql(r){return ce(r.integerValue||r.doubleValue)}function kf(r){return ms(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nf{constructor(e,t){this.field=e,this.transform=t}}function wI(r,e){return r.field.isEqual(e.field)&&function(n,s){return n instanceof nr&&s instanceof nr||n instanceof rr&&s instanceof rr?Gn(n.elements,s.elements,nt):n instanceof _s&&s instanceof _s?nt(n.Ee,s.Ee):n instanceof tr&&s instanceof tr}(r.transform,e.transform)}class AI{constructor(e,t){this.version=e,this.transformResults=t}}class Oe{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Oe}static exists(e){return new Oe(void 0,e)}static updateTime(e){return new Oe(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function fi(r,e){return r.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(r.updateTime):r.exists===void 0||r.exists===e.isFoundDocument()}class co{}function xf(r,e){if(!r.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return r.isNoDocument()?new cc(r.key,Oe.none()):new fr(r.key,r.data,Oe.none());{const t=r.data,n=Ne.empty();let s=new ne(ue.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?n.delete(i):n.set(i,o),s=s.add(i)}return new qt(r.key,n,new $e(s.toArray()),Oe.none())}}function bI(r,e,t){r instanceof fr?function(s,i,o){const c=s.value.clone(),u=Gl(s.fieldTransforms,i,o.transformResults);c.setAll(u),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()}(r,e,t):r instanceof qt?function(s,i,o){if(!fi(s.precondition,i))return void i.convertToUnknownDocument(o.version);const c=Gl(s.fieldTransforms,i,o.transformResults),u=i.data;u.setAll(Of(s)),u.setAll(c),i.convertToFoundDocument(o.version,u).setHasCommittedMutations()}(r,e,t):function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,t)}function es(r,e,t,n){return r instanceof fr?function(i,o,c,u){if(!fi(i.precondition,o))return c;const h=i.value.clone(),f=Hl(i.fieldTransforms,u,o);return h.setAll(f),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),null}(r,e,t,n):r instanceof qt?function(i,o,c,u){if(!fi(i.precondition,o))return c;const h=Hl(i.fieldTransforms,u,o),f=o.data;return f.setAll(Of(i)),f.setAll(h),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(m=>m.field))}(r,e,t,n):function(i,o,c){return fi(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):c}(r,e,t)}function SI(r,e){let t=null;for(const n of r.fieldTransforms){const s=e.data.field(n.field),i=Cf(n.transform,s||null);i!=null&&(t===null&&(t=Ne.empty()),t.set(n.field,i))}return t||null}function zl(r,e){return r.type===e.type&&!!r.key.isEqual(e.key)&&!!r.precondition.isEqual(e.precondition)&&!!function(n,s){return n===void 0&&s===void 0||!(!n||!s)&&Gn(n,s,(i,o)=>wI(i,o))}(r.fieldTransforms,e.fieldTransforms)&&(r.type===0?r.value.isEqual(e.value):r.type!==1||r.data.isEqual(e.data)&&r.fieldMask.isEqual(e.fieldMask))}class fr extends co{constructor(e,t,n,s=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class qt extends co{constructor(e,t,n,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Of(r){const e=new Map;return r.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const n=r.data.field(t);e.set(t,n)}}),e}function Gl(r,e,t){const n=new Map;U(r.length===t.length,32656,{Ae:t.length,Re:r.length});for(let s=0;s<t.length;s++){const i=r[s],o=i.transform,c=e.data.field(i.field);n.set(i.field,TI(o,c,t[s]))}return n}function Hl(r,e,t){const n=new Map;for(const s of r){const i=s.transform,o=t.data.field(s.field);n.set(s.field,vI(i,o,e))}return n}class cc extends co{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Mf extends co{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uc{constructor(e,t,n,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=s}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&bI(i,e,n[s])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=es(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=es(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=Rf();return this.mutations.forEach(s=>{const i=e.get(s.key),o=i.overlayedDocument;let c=this.applyToLocalView(o,i.mutatedFields);c=t.has(s.key)?null:c;const u=xf(o,c);u!==null&&n.set(s.key,u),o.isValidDocument()||o.convertToNoDocument(j.min())}),n}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),G())}isEqual(e){return this.batchId===e.batchId&&Gn(this.mutations,e.mutations,(t,n)=>zl(t,n))&&Gn(this.baseMutations,e.baseMutations,(t,n)=>zl(t,n))}}class lc{constructor(e,t,n,s){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=s}static from(e,t,n){U(e.mutations.length===n.length,58842,{Ve:e.mutations.length,me:n.length});let s=function(){return _I}();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,n[o].version);return new lc(e,t,n,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hc{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RI{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var pe,Q;function PI(r){switch(r){case P.OK:return M(64938);case P.CANCELLED:case P.UNKNOWN:case P.DEADLINE_EXCEEDED:case P.RESOURCE_EXHAUSTED:case P.INTERNAL:case P.UNAVAILABLE:case P.UNAUTHENTICATED:return!1;case P.INVALID_ARGUMENT:case P.NOT_FOUND:case P.ALREADY_EXISTS:case P.PERMISSION_DENIED:case P.FAILED_PRECONDITION:case P.ABORTED:case P.OUT_OF_RANGE:case P.UNIMPLEMENTED:case P.DATA_LOSS:return!0;default:return M(15467,{code:r})}}function Lf(r){if(r===void 0)return de("GRPC error has no .code"),P.UNKNOWN;switch(r){case pe.OK:return P.OK;case pe.CANCELLED:return P.CANCELLED;case pe.UNKNOWN:return P.UNKNOWN;case pe.DEADLINE_EXCEEDED:return P.DEADLINE_EXCEEDED;case pe.RESOURCE_EXHAUSTED:return P.RESOURCE_EXHAUSTED;case pe.INTERNAL:return P.INTERNAL;case pe.UNAVAILABLE:return P.UNAVAILABLE;case pe.UNAUTHENTICATED:return P.UNAUTHENTICATED;case pe.INVALID_ARGUMENT:return P.INVALID_ARGUMENT;case pe.NOT_FOUND:return P.NOT_FOUND;case pe.ALREADY_EXISTS:return P.ALREADY_EXISTS;case pe.PERMISSION_DENIED:return P.PERMISSION_DENIED;case pe.FAILED_PRECONDITION:return P.FAILED_PRECONDITION;case pe.ABORTED:return P.ABORTED;case pe.OUT_OF_RANGE:return P.OUT_OF_RANGE;case pe.UNIMPLEMENTED:return P.UNIMPLEMENTED;case pe.DATA_LOSS:return P.DATA_LOSS;default:return M(39323,{code:r})}}(Q=pe||(pe={}))[Q.OK=0]="OK",Q[Q.CANCELLED=1]="CANCELLED",Q[Q.UNKNOWN=2]="UNKNOWN",Q[Q.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Q[Q.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Q[Q.NOT_FOUND=5]="NOT_FOUND",Q[Q.ALREADY_EXISTS=6]="ALREADY_EXISTS",Q[Q.PERMISSION_DENIED=7]="PERMISSION_DENIED",Q[Q.UNAUTHENTICATED=16]="UNAUTHENTICATED",Q[Q.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Q[Q.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Q[Q.ABORTED=10]="ABORTED",Q[Q.OUT_OF_RANGE=11]="OUT_OF_RANGE",Q[Q.UNIMPLEMENTED=12]="UNIMPLEMENTED",Q[Q.INTERNAL=13]="INTERNAL",Q[Q.UNAVAILABLE=14]="UNAVAILABLE",Q[Q.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CI=new Nt([4294967295,4294967295],0);function Kl(r){const e=Md().encode(r),t=new Pd;return t.update(e),new Uint8Array(t.digest())}function Wl(r){const e=new DataView(r.buffer),t=e.getUint32(0,!0),n=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Nt([t,n],0),new Nt([s,i],0)]}class dc{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new qr(`Invalid padding: ${t}`);if(n<0)throw new qr(`Invalid hash count: ${n}`);if(e.length>0&&this.hashCount===0)throw new qr(`Invalid hash count: ${n}`);if(e.length===0&&t!==0)throw new qr(`Invalid padding when bitmap length is 0: ${t}`);this.fe=8*e.length-t,this.ge=Nt.fromNumber(this.fe)}pe(e,t,n){let s=e.add(t.multiply(Nt.fromNumber(n)));return s.compare(CI)===1&&(s=new Nt([s.getBits(0),s.getBits(1)],0)),s.modulo(this.ge).toNumber()}ye(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.fe===0)return!1;const t=Kl(e),[n,s]=Wl(t);for(let i=0;i<this.hashCount;i++){const o=this.pe(n,s,i);if(!this.ye(o))return!1}return!0}static create(e,t,n){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new dc(i,s,t);return n.forEach(c=>o.insert(c)),o}insert(e){if(this.fe===0)return;const t=Kl(e),[n,s]=Wl(t);for(let i=0;i<this.hashCount;i++){const o=this.pe(n,s,i);this.we(o)}}we(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class qr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bs{constructor(e,t,n,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const s=new Map;return s.set(e,Ss.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new bs(j.min(),s,new ie($),Fe(),G())}}class Ss{constructor(e,t,n,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new Ss(n,t,G(),G(),G())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pi{constructor(e,t,n,s){this.Se=e,this.removedTargetIds=t,this.key=n,this.be=s}}class Ff{constructor(e,t){this.targetId=e,this.De=t}}class Bf{constructor(e,t,n=fe.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=s}}class Ql{constructor(){this.ve=0,this.Ce=Xl(),this.Fe=fe.EMPTY_BYTE_STRING,this.Me=!1,this.xe=!0}get current(){return this.Me}get resumeToken(){return this.Fe}get Oe(){return this.ve!==0}get Ne(){return this.xe}Be(e){e.approximateByteSize()>0&&(this.xe=!0,this.Fe=e)}Le(){let e=G(),t=G(),n=G();return this.Ce.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:n=n.add(s);break;default:M(38017,{changeType:i})}}),new Ss(this.Fe,this.Me,e,t,n)}ke(){this.xe=!1,this.Ce=Xl()}qe(e,t){this.xe=!0,this.Ce=this.Ce.insert(e,t)}Qe(e){this.xe=!0,this.Ce=this.Ce.remove(e)}$e(){this.ve+=1}Ue(){this.ve-=1,U(this.ve>=0,3241,{ve:this.ve})}Ke(){this.xe=!0,this.Me=!0}}class VI{constructor(e){this.We=e,this.Ge=new Map,this.ze=Fe(),this.je=ei(),this.Je=ei(),this.He=new ie($)}Ye(e){for(const t of e.Se)e.be&&e.be.isFoundDocument()?this.Ze(t,e.be):this.Xe(t,e.key,e.be);for(const t of e.removedTargetIds)this.Xe(t,e.key,e.be)}et(e){this.forEachTarget(e,t=>{const n=this.tt(t);switch(e.state){case 0:this.nt(t)&&n.Be(e.resumeToken);break;case 1:n.Ue(),n.Oe||n.ke(),n.Be(e.resumeToken);break;case 2:n.Ue(),n.Oe||this.removeTarget(t);break;case 3:this.nt(t)&&(n.Ke(),n.Be(e.resumeToken));break;case 4:this.nt(t)&&(this.rt(t),n.Be(e.resumeToken));break;default:M(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Ge.forEach((n,s)=>{this.nt(s)&&t(s)})}it(e){const t=e.targetId,n=e.De.count,s=this.st(t);if(s){const i=s.target;if(Pi(i))if(n===0){const o=new O(i.path);this.Xe(t,o,he.newNoDocument(o,j.min()))}else U(n===1,20013,{expectedCount:n});else{const o=this.ot(t);if(o!==n){const c=this._t(e),u=c?this.ut(c,e,o):1;if(u!==0){this.rt(t);const h=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.He=this.He.insert(t,h)}}}}}_t(e){const t=e.De.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:s=0},hashCount:i=0}=t;let o,c;try{o=ft(n).toUint8Array()}catch(u){if(u instanceof rf)return ht("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{c=new dc(o,s,i)}catch(u){return ht(u instanceof qr?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return c.fe===0?null:c}ut(e,t,n){return t.De.count===n-this.ht(e,t.targetId)?0:2}ht(e,t){const n=this.We.getRemoteKeysForTarget(t);let s=0;return n.forEach(i=>{const o=this.We.lt(),c=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.Xe(t,i,null),s++)}),s}Pt(e){const t=new Map;this.Ge.forEach((i,o)=>{const c=this.st(o);if(c){if(i.current&&Pi(c.target)){const u=new O(c.target.path);this.Tt(u).has(o)||this.It(o,u)||this.Xe(o,u,he.newNoDocument(u,e))}i.Ne&&(t.set(o,i.Le()),i.ke())}});let n=G();this.Je.forEach((i,o)=>{let c=!0;o.forEachWhile(u=>{const h=this.st(u);return!h||h.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(n=n.add(i))}),this.ze.forEach((i,o)=>o.setReadTime(e));const s=new bs(e,t,this.He,this.ze,n);return this.ze=Fe(),this.je=ei(),this.Je=ei(),this.He=new ie($),s}Ze(e,t){if(!this.nt(e))return;const n=this.It(e,t.key)?2:0;this.tt(e).qe(t.key,n),this.ze=this.ze.insert(t.key,t),this.je=this.je.insert(t.key,this.Tt(t.key).add(e)),this.Je=this.Je.insert(t.key,this.dt(t.key).add(e))}Xe(e,t,n){if(!this.nt(e))return;const s=this.tt(e);this.It(e,t)?s.qe(t,1):s.Qe(t),this.Je=this.Je.insert(t,this.dt(t).delete(e)),this.Je=this.Je.insert(t,this.dt(t).add(e)),n&&(this.ze=this.ze.insert(t,n))}removeTarget(e){this.Ge.delete(e)}ot(e){const t=this.tt(e).Le();return this.We.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}$e(e){this.tt(e).$e()}tt(e){let t=this.Ge.get(e);return t||(t=new Ql,this.Ge.set(e,t)),t}dt(e){let t=this.Je.get(e);return t||(t=new ne($),this.Je=this.Je.insert(e,t)),t}Tt(e){let t=this.je.get(e);return t||(t=new ne($),this.je=this.je.insert(e,t)),t}nt(e){const t=this.st(e)!==null;return t||V("WatchChangeAggregator","Detected inactive target",e),t}st(e){const t=this.Ge.get(e);return t&&t.Oe?null:this.We.Et(e)}rt(e){this.Ge.set(e,new Ql),this.We.getRemoteKeysForTarget(e).forEach(t=>{this.Xe(e,t,null)})}It(e,t){return this.We.getRemoteKeysForTarget(e).has(t)}}function ei(){return new ie(O.comparator)}function Xl(){return new ie(O.comparator)}const DI={asc:"ASCENDING",desc:"DESCENDING"},kI={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},NI={and:"AND",or:"OR"};class xI{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Ca(r,e){return r.useProto3Json||Zi(e)?e:{value:e}}function sr(r,e){return r.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Uf(r,e){return r.useProto3Json?e.toBase64():e.toUint8Array()}function OI(r,e){return sr(r,e.toTimestamp())}function De(r){return U(!!r,49232),j.fromTimestamp(function(t){const n=dt(t);return new ee(n.seconds,n.nanos)}(r))}function fc(r,e){return Va(r,e).canonicalString()}function Va(r,e){const t=function(s){return new Y(["projects",s.projectId,"databases",s.database])}(r).child("documents");return e===void 0?t:t.child(e)}function jf(r){const e=Y.fromString(r);return U(Xf(e),10190,{key:e.toString()}),e}function Di(r,e){return fc(r.databaseId,e.path)}function ln(r,e){const t=jf(e);if(t.get(1)!==r.databaseId.projectId)throw new k(P.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+r.databaseId.projectId);if(t.get(3)!==r.databaseId.database)throw new k(P.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+r.databaseId.database);return new O(zf(t))}function $f(r,e){return fc(r.databaseId,e)}function qf(r){const e=jf(r);return e.length===4?Y.emptyPath():zf(e)}function Da(r){return new Y(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function zf(r){return U(r.length>4&&r.get(4)==="documents",29091,{key:r.toString()}),r.popFirst(5)}function Jl(r,e,t){return{name:Di(r,e),fields:t.value.mapValue.fields}}function MI(r,e,t){const n=ln(r,e.name),s=De(e.updateTime),i=e.createTime?De(e.createTime):j.min(),o=new Ne({mapValue:{fields:e.fields}}),c=he.newFoundDocument(n,s,i,o);return t&&c.setHasCommittedMutations(),t?c.setHasCommittedMutations():c}function LI(r,e){let t;if("targetChange"in e){e.targetChange;const n=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:M(39313,{state:h})}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(h,f){return h.useProto3Json?(U(f===void 0||typeof f=="string",58123),fe.fromBase64String(f||"")):(U(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),fe.fromUint8Array(f||new Uint8Array))}(r,e.targetChange.resumeToken),o=e.targetChange.cause,c=o&&function(h){const f=h.code===void 0?P.UNKNOWN:Lf(h.code);return new k(f,h.message||"")}(o);t=new Bf(n,s,i,c||null)}else if("documentChange"in e){e.documentChange;const n=e.documentChange;n.document,n.document.name,n.document.updateTime;const s=ln(r,n.document.name),i=De(n.document.updateTime),o=n.document.createTime?De(n.document.createTime):j.min(),c=new Ne({mapValue:{fields:n.document.fields}}),u=he.newFoundDocument(s,i,o,c),h=n.targetIds||[],f=n.removedTargetIds||[];t=new pi(h,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const n=e.documentDelete;n.document;const s=ln(r,n.document),i=n.readTime?De(n.readTime):j.min(),o=he.newNoDocument(s,i),c=n.removedTargetIds||[];t=new pi([],c,o.key,o)}else if("documentRemove"in e){e.documentRemove;const n=e.documentRemove;n.document;const s=ln(r,n.document),i=n.removedTargetIds||[];t=new pi([],i,s,null)}else{if(!("filter"in e))return M(11601,{At:e});{e.filter;const n=e.filter;n.targetId;const{count:s=0,unchangedNames:i}=n,o=new RI(s,i),c=n.targetId;t=new Ff(c,o)}}return t}function ki(r,e){let t;if(e instanceof fr)t={update:Jl(r,e.key,e.value)};else if(e instanceof cc)t={delete:Di(r,e.key)};else if(e instanceof qt)t={update:Jl(r,e.key,e.data),updateMask:qI(e.fieldMask)};else{if(!(e instanceof Mf))return M(16599,{Rt:e.type});t={verify:Di(r,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(n=>function(i,o){const c=o.transform;if(c instanceof tr)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof nr)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof rr)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof _s)return{fieldPath:o.field.canonicalString(),increment:c.Ee};throw M(20930,{transform:o.transform})}(0,n))),e.precondition.isNone||(t.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:OI(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:M(27497)}(r,e.precondition)),t}function ka(r,e){const t=e.currentDocument?function(i){return i.updateTime!==void 0?Oe.updateTime(De(i.updateTime)):i.exists!==void 0?Oe.exists(i.exists):Oe.none()}(e.currentDocument):Oe.none(),n=e.updateTransforms?e.updateTransforms.map(s=>function(o,c){let u=null;if("setToServerValue"in c)U(c.setToServerValue==="REQUEST_TIME",16630,{proto:c}),u=new tr;else if("appendMissingElements"in c){const f=c.appendMissingElements.values||[];u=new nr(f)}else if("removeAllFromArray"in c){const f=c.removeAllFromArray.values||[];u=new rr(f)}else"increment"in c?u=new _s(o,c.increment):M(16584,{proto:c});const h=ue.fromServerFormat(c.fieldPath);return new Nf(h,u)}(r,s)):[];if(e.update){e.update.name;const s=ln(r,e.update.name),i=new Ne({mapValue:{fields:e.update.fields}});if(e.updateMask){const o=function(u){const h=u.fieldPaths||[];return new $e(h.map(f=>ue.fromServerFormat(f)))}(e.updateMask);return new qt(s,i,o,t,n)}return new fr(s,i,t,n)}if(e.delete){const s=ln(r,e.delete);return new cc(s,t)}if(e.verify){const s=ln(r,e.verify);return new Mf(s,t)}return M(1463,{proto:e})}function FI(r,e){return r&&r.length>0?(U(e!==void 0,14353),r.map(t=>function(s,i){let o=s.updateTime?De(s.updateTime):De(i);return o.isEqual(j.min())&&(o=De(i)),new AI(o,s.transformResults||[])}(t,e))):[]}function Gf(r,e){return{documents:[$f(r,e.path)]}}function Hf(r,e){const t={structuredQuery:{}},n=e.path;let s;e.collectionGroup!==null?(s=n,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=n.popLast(),t.structuredQuery.from=[{collectionId:n.lastSegment()}]),t.parent=$f(r,s);const i=function(h){if(h.length!==0)return Qf(te.create(h,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const o=function(h){if(h.length!==0)return h.map(f=>function(g){return{field:On(g.field),direction:UI(g.dir)}}(f))}(e.orderBy);o&&(t.structuredQuery.orderBy=o);const c=Ca(r,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{Vt:t,parent:s}}function Kf(r){let e=qf(r.parent);const t=r.structuredQuery,n=t.from?t.from.length:0;let s=null;if(n>0){U(n===1,65062);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let i=[];t.where&&(i=function(m){const g=Wf(m);return g instanceof te&&ic(g)?g.getFilters():[g]}(t.where));let o=[];t.orderBy&&(o=function(m){return m.map(g=>function(C){return new gs(Mn(C.field),function(D){switch(D){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(C.direction))}(g))}(t.orderBy));let c=null;t.limit&&(c=function(m){let g;return g=typeof m=="object"?m.value:m,Zi(g)?null:g}(t.limit));let u=null;t.startAt&&(u=function(m){const g=!!m.before,S=m.values||[];return new Zn(S,g)}(t.startAt));let h=null;return t.endAt&&(h=function(m){const g=!m.before,S=m.values||[];return new Zn(S,g)}(t.endAt)),Ef(e,s,o,i,c,"F",u,h)}function BI(r,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return M(28987,{purpose:s})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Wf(r){return r.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const n=Mn(t.unaryFilter.field);return W.create(n,"==",{doubleValue:NaN});case"IS_NULL":const s=Mn(t.unaryFilter.field);return W.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Mn(t.unaryFilter.field);return W.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Mn(t.unaryFilter.field);return W.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return M(61313);default:return M(60726)}}(r):r.fieldFilter!==void 0?function(t){return W.create(Mn(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return M(58110);default:return M(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(r):r.compositeFilter!==void 0?function(t){return te.create(t.compositeFilter.filters.map(n=>Wf(n)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return M(1026)}}(t.compositeFilter.op))}(r):M(30097,{filter:r})}function UI(r){return DI[r]}function jI(r){return kI[r]}function $I(r){return NI[r]}function On(r){return{fieldPath:r.canonicalString()}}function Mn(r){return ue.fromServerFormat(r.fieldPath)}function Qf(r){return r instanceof W?function(t){if(t.op==="=="){if(Ol(t.value))return{unaryFilter:{field:On(t.field),op:"IS_NAN"}};if(xl(t.value))return{unaryFilter:{field:On(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Ol(t.value))return{unaryFilter:{field:On(t.field),op:"IS_NOT_NAN"}};if(xl(t.value))return{unaryFilter:{field:On(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:On(t.field),op:jI(t.op),value:t.value}}}(r):r instanceof te?function(t){const n=t.getFilters().map(s=>Qf(s));return n.length===1?n[0]:{compositeFilter:{op:$I(t.op),filters:n}}}(r):M(54877,{filter:r})}function qI(r){const e=[];return r.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function Xf(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class at{constructor(e,t,n,s,i=j.min(),o=j.min(),c=fe.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=c,this.expectedCount=u}withSequenceNumber(e){return new at(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new at(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new at(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new at(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jf{constructor(e){this.gt=e}}function zI(r,e){let t;if(e.document)t=MI(r.gt,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const n=O.fromSegments(e.noDocument.path),s=_n(e.noDocument.readTime);t=he.newNoDocument(n,s),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return M(56709);{const n=O.fromSegments(e.unknownDocument.path),s=_n(e.unknownDocument.version);t=he.newUnknownDocument(n,s)}}return e.readTime&&t.setReadTime(function(s){const i=new ee(s[0],s[1]);return j.fromTimestamp(i)}(e.readTime)),t}function Yl(r,e){const t=e.key,n={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:Ni(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())n.document=function(i,o){return{name:Di(i,o.key),fields:o.data.value.mapValue.fields,updateTime:sr(i,o.version.toTimestamp()),createTime:sr(i,o.createTime.toTimestamp())}}(r.gt,e);else if(e.isNoDocument())n.noDocument={path:t.path.toArray(),readTime:gn(e.version)};else{if(!e.isUnknownDocument())return M(57904,{document:e});n.unknownDocument={path:t.path.toArray(),version:gn(e.version)}}return n}function Ni(r){const e=r.toTimestamp();return[e.seconds,e.nanoseconds]}function gn(r){const e=r.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function _n(r){const e=new ee(r.seconds,r.nanoseconds);return j.fromTimestamp(e)}function nn(r,e){const t=(e.baseMutations||[]).map(i=>ka(r.gt,i));for(let i=0;i<e.mutations.length-1;++i){const o=e.mutations[i];if(i+1<e.mutations.length&&e.mutations[i+1].transform!==void 0){const c=e.mutations[i+1];o.updateTransforms=c.transform.fieldTransforms,e.mutations.splice(i+1,1),++i}}const n=e.mutations.map(i=>ka(r.gt,i)),s=ee.fromMillis(e.localWriteTimeMs);return new uc(e.batchId,s,t,n)}function zr(r){const e=_n(r.readTime),t=r.lastLimboFreeSnapshotVersion!==void 0?_n(r.lastLimboFreeSnapshotVersion):j.min();let n;return n=function(i){return i.documents!==void 0}(r.query)?function(i){const o=i.documents.length;return U(o===1,1966,{count:o}),Be(io(qf(i.documents[0])))}(r.query):function(i){return Be(Kf(i))}(r.query),new at(n,r.targetId,"TargetPurposeListen",r.lastListenSequenceNumber,e,t,fe.fromBase64String(r.resumeToken))}function Yf(r,e){const t=gn(e.snapshotVersion),n=gn(e.lastLimboFreeSnapshotVersion);let s;s=Pi(e.target)?Gf(r.gt,e.target):Hf(r.gt,e.target).Vt;const i=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:mn(e.target),readTime:t,resumeToken:i,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:n,query:s}}function Zf(r){const e=Kf({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?Vi(e,e.limit,"L"):e}function Zo(r,e){return new hc(e.largestBatchId,ka(r.gt,e.overlayMutation))}function Zl(r,e){const t=e.path.lastSegment();return[r,Pe(e.path.popLast()),t]}function eh(r,e,t,n){return{indexId:r,uid:e,sequenceNumber:t,readTime:gn(n.readTime),documentKey:Pe(n.documentKey.path),largestBatchId:n.largestBatchId}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GI{getBundleMetadata(e,t){return th(e).get(t).next(n=>{if(n)return function(i){return{id:i.bundleId,createTime:_n(i.createTime),version:i.version}}(n)})}saveBundleMetadata(e,t){return th(e).put(function(s){return{bundleId:s.id,createTime:gn(De(s.createTime)),version:s.version}}(t))}getNamedQuery(e,t){return nh(e).get(t).next(n=>{if(n)return function(i){return{name:i.name,query:Zf(i.bundledQuery),readTime:_n(i.readTime)}}(n)})}saveNamedQuery(e,t){return nh(e).put(function(s){return{name:s.name,readTime:gn(De(s.readTime)),bundledQuery:s.bundledQuery}}(t))}}function th(r){return _e(r,eo)}function nh(r){return _e(r,to)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uo{constructor(e,t){this.serializer=e,this.userId=t}static yt(e,t){const n=t.uid||"";return new uo(e,n)}getOverlay(e,t){return Mr(e).get(Zl(this.userId,t)).next(n=>n?Zo(this.serializer,n):null)}getOverlays(e,t){const n=Je();return w.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&n.set(s,i)})).next(()=>n)}saveOverlays(e,t,n){const s=[];return n.forEach((i,o)=>{const c=new hc(t,o);s.push(this.wt(e,c))}),w.waitFor(s)}removeOverlaysForBatchId(e,t,n){const s=new Set;t.forEach(o=>s.add(Pe(o.getCollectionPath())));const i=[];return s.forEach(o=>{const c=IDBKeyRange.bound([this.userId,o,n],[this.userId,o,n+1],!1,!0);i.push(Mr(e).Y(va,c))}),w.waitFor(i)}getOverlaysForCollection(e,t,n){const s=Je(),i=Pe(t),o=IDBKeyRange.bound([this.userId,i,n],[this.userId,i,Number.POSITIVE_INFINITY],!0);return Mr(e).j(va,o).next(c=>{for(const u of c){const h=Zo(this.serializer,u);s.set(h.getKey(),h)}return s})}getOverlaysForCollectionGroup(e,t,n,s){const i=Je();let o;const c=IDBKeyRange.bound([this.userId,t,n],[this.userId,t,Number.POSITIVE_INFINITY],!0);return Mr(e).X({index:Jd,range:c},(u,h,f)=>{const m=Zo(this.serializer,h);i.size()<s||m.largestBatchId===o?(i.set(m.getKey(),m),o=m.largestBatchId):f.done()}).next(()=>i)}wt(e,t){return Mr(e).put(function(s,i,o){const[c,u,h]=Zl(i,o.mutation.key);return{userId:i,collectionPath:u,documentId:h,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:ki(s.gt,o.mutation)}}(this.serializer,this.userId,t))}}function Mr(r){return _e(r,no)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HI{St(e){return _e(e,ec)}getSessionToken(e){return this.St(e).get("sessionToken").next(t=>{const n=t==null?void 0:t.value;return n?fe.fromUint8Array(n):fe.EMPTY_BYTE_STRING})}setSessionToken(e,t){return this.St(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rn{constructor(){}bt(e,t){this.Dt(e,t),t.vt()}Dt(e,t){if("nullValue"in e)this.Ct(t,5);else if("booleanValue"in e)this.Ct(t,10),t.Ft(e.booleanValue?1:0);else if("integerValue"in e)this.Ct(t,15),t.Ft(ce(e.integerValue));else if("doubleValue"in e){const n=ce(e.doubleValue);isNaN(n)?this.Ct(t,13):(this.Ct(t,15),as(n)?t.Ft(0):t.Ft(n))}else if("timestampValue"in e){let n=e.timestampValue;this.Ct(t,20),typeof n=="string"&&(n=dt(n)),t.Mt(`${n.seconds||""}`),t.Ft(n.nanos||0)}else if("stringValue"in e)this.xt(e.stringValue,t),this.Ot(t);else if("bytesValue"in e)this.Ct(t,30),t.Nt(ft(e.bytesValue)),this.Ot(t);else if("referenceValue"in e)this.Bt(e.referenceValue,t);else if("geoPointValue"in e){const n=e.geoPointValue;this.Ct(t,45),t.Ft(n.latitude||0),t.Ft(n.longitude||0)}else"mapValue"in e?lf(e)?this.Ct(t,Number.MAX_SAFE_INTEGER):so(e)?this.Lt(e.mapValue,t):(this.kt(e.mapValue,t),this.Ot(t)):"arrayValue"in e?(this.qt(e.arrayValue,t),this.Ot(t)):M(19022,{Qt:e})}xt(e,t){this.Ct(t,25),this.$t(e,t)}$t(e,t){t.Mt(e)}kt(e,t){const n=e.fields||{};this.Ct(t,55);for(const s of Object.keys(n))this.xt(s,t),this.Dt(n[s],t)}Lt(e,t){var n,s;const i=e.fields||{};this.Ct(t,53);const o=Jn,c=((s=(n=i[o].arrayValue)===null||n===void 0?void 0:n.values)===null||s===void 0?void 0:s.length)||0;this.Ct(t,15),t.Ft(ce(c)),this.xt(o,t),this.Dt(i[o],t)}qt(e,t){const n=e.values||[];this.Ct(t,50);for(const s of n)this.Dt(s,t)}Bt(e,t){this.Ct(t,37),O.fromName(e).path.forEach(n=>{this.Ct(t,60),this.$t(n,t)})}Ct(e,t){e.Ft(t)}Ot(e){e.Ft(2)}}rn.Ut=new rn;/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law | agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES | CONDITIONS OF ANY KIND, either express | implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cn=255;function KI(r){if(r===0)return 8;let e=0;return r>>4||(e+=4,r<<=4),r>>6||(e+=2,r<<=2),r>>7||(e+=1),e}function rh(r){const e=64-function(n){let s=0;for(let i=0;i<8;++i){const o=KI(255&n[i]);if(s+=o,o!==8)break}return s}(r);return Math.ceil(e/8)}class WI{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Kt(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Wt(n.value),n=t.next();this.Gt()}zt(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.jt(n.value),n=t.next();this.Jt()}Ht(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.Wt(n);else if(n<2048)this.Wt(960|n>>>6),this.Wt(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.Wt(480|n>>>12),this.Wt(128|63&n>>>6),this.Wt(128|63&n);else{const s=t.codePointAt(0);this.Wt(240|s>>>18),this.Wt(128|63&s>>>12),this.Wt(128|63&s>>>6),this.Wt(128|63&s)}}this.Gt()}Yt(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.jt(n);else if(n<2048)this.jt(960|n>>>6),this.jt(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.jt(480|n>>>12),this.jt(128|63&n>>>6),this.jt(128|63&n);else{const s=t.codePointAt(0);this.jt(240|s>>>18),this.jt(128|63&s>>>12),this.jt(128|63&s>>>6),this.jt(128|63&s)}}this.Jt()}Zt(e){const t=this.Xt(e),n=rh(t);this.en(1+n),this.buffer[this.position++]=255&n;for(let s=t.length-n;s<t.length;++s)this.buffer[this.position++]=255&t[s]}tn(e){const t=this.Xt(e),n=rh(t);this.en(1+n),this.buffer[this.position++]=~(255&n);for(let s=t.length-n;s<t.length;++s)this.buffer[this.position++]=~(255&t[s])}nn(){this.rn(Cn),this.rn(255)}sn(){this._n(Cn),this._n(255)}reset(){this.position=0}seed(e){this.en(e.length),this.buffer.set(e,this.position),this.position+=e.length}an(){return this.buffer.slice(0,this.position)}Xt(e){const t=function(i){const o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,i,!1),new Uint8Array(o.buffer)}(e),n=!!(128&t[0]);t[0]^=n?255:128;for(let s=1;s<t.length;++s)t[s]^=n?255:0;return t}Wt(e){const t=255&e;t===0?(this.rn(0),this.rn(255)):t===Cn?(this.rn(Cn),this.rn(0)):this.rn(t)}jt(e){const t=255&e;t===0?(this._n(0),this._n(255)):t===Cn?(this._n(Cn),this._n(0)):this._n(e)}Gt(){this.rn(0),this.rn(1)}Jt(){this._n(0),this._n(1)}rn(e){this.en(1),this.buffer[this.position++]=e}_n(e){this.en(1),this.buffer[this.position++]=~e}en(e){const t=e+this.position;if(t<=this.buffer.length)return;let n=2*this.buffer.length;n<t&&(n=t);const s=new Uint8Array(n);s.set(this.buffer),this.buffer=s}}class QI{constructor(e){this.un=e}Nt(e){this.un.Kt(e)}Mt(e){this.un.Ht(e)}Ft(e){this.un.Zt(e)}vt(){this.un.nn()}}class XI{constructor(e){this.un=e}Nt(e){this.un.zt(e)}Mt(e){this.un.Yt(e)}Ft(e){this.un.tn(e)}vt(){this.un.sn()}}class Lr{constructor(){this.un=new WI,this.cn=new QI(this.un),this.ln=new XI(this.un)}seed(e){this.un.seed(e)}hn(e){return e===0?this.cn:this.ln}an(){return this.un.an()}reset(){this.un.reset()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sn{constructor(e,t,n,s){this.Pn=e,this.Tn=t,this.In=n,this.dn=s}En(){const e=this.dn.length,t=e===0||this.dn[e-1]===255?e+1:e,n=new Uint8Array(t);return n.set(this.dn,0),t!==e?n.set([0],this.dn.length):++n[n.length-1],new sn(this.Pn,this.Tn,this.In,n)}An(e,t,n){return{indexId:this.Pn,uid:e,arrayValue:mi(this.In),directionalValue:mi(this.dn),orderedDocumentKey:mi(t),documentKey:n.path.toArray()}}Rn(e,t,n){const s=this.An(e,t,n);return[s.indexId,s.uid,s.arrayValue,s.directionalValue,s.orderedDocumentKey,s.documentKey]}}function Et(r,e){let t=r.Pn-e.Pn;return t!==0?t:(t=sh(r.In,e.In),t!==0?t:(t=sh(r.dn,e.dn),t!==0?t:O.comparator(r.Tn,e.Tn)))}function sh(r,e){for(let t=0;t<r.length&&t<e.length;++t){const n=r[t]-e[t];if(n!==0)return n}return r.length-e.length}function mi(r){return bd()?function(t){let n="";for(let s=0;s<t.length;s++)n+=String.fromCharCode(t[s]);return n}(r):r}function ih(r){return typeof r!="string"?r:function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n}(r)}class oh{constructor(e){this.Vn=new ne((t,n)=>ue.comparator(t.field,n.field)),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.mn=e.orderBy,this.fn=[];for(const t of e.filters){const n=t;n.isInequality()?this.Vn=this.Vn.add(n):this.fn.push(n)}}get gn(){return this.Vn.size>1}pn(e){if(U(e.collectionGroup===this.collectionId,49279),this.gn)return!1;const t=ya(e);if(t!==void 0&&!this.yn(t))return!1;const n=Zt(e);let s=new Set,i=0,o=0;for(;i<n.length&&this.yn(n[i]);++i)s=s.add(n[i].fieldPath.canonicalString());if(i===n.length)return!0;if(this.Vn.size>0){const c=this.Vn.getIterator().getNext();if(!s.has(c.field.canonicalString())){const u=n[i];if(!this.wn(c,u)||!this.Sn(this.mn[o++],u))return!1}++i}for(;i<n.length;++i){const c=n[i];if(o>=this.mn.length||!this.Sn(this.mn[o++],c))return!1}return!0}bn(){if(this.gn)return null;let e=new ne(ue.comparator);const t=[];for(const n of this.fn)if(!n.field.isKeyField())if(n.op==="array-contains"||n.op==="array-contains-any")t.push(new ai(n.field,2));else{if(e.has(n.field))continue;e=e.add(n.field),t.push(new ai(n.field,0))}for(const n of this.mn)n.field.isKeyField()||e.has(n.field)||(e=e.add(n.field),t.push(new ai(n.field,n.dir==="asc"?0:1)));return new Ai(Ai.UNKNOWN_ID,this.collectionId,t,os.empty())}yn(e){for(const t of this.fn)if(this.wn(t,e))return!0;return!1}wn(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const n=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===n}Sn(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ep(r){var e,t;if(U(r instanceof W||r instanceof te,20012),r instanceof W){if(r instanceof If){const s=((t=(e=r.value.arrayValue)===null||e===void 0?void 0:e.values)===null||t===void 0?void 0:t.map(i=>W.create(r.field,"==",i)))||[];return te.create(s,"or")}return r}const n=r.filters.map(s=>ep(s));return te.create(n,r.op)}function JI(r){if(r.getFilters().length===0)return[];const e=Oa(ep(r));return U(tp(e),7391),Na(e)||xa(e)?[e]:e.getFilters()}function Na(r){return r instanceof W}function xa(r){return r instanceof te&&ic(r)}function tp(r){return Na(r)||xa(r)||function(t){if(t instanceof te&&ba(t)){for(const n of t.getFilters())if(!Na(n)&&!xa(n))return!1;return!0}return!1}(r)}function Oa(r){if(U(r instanceof W||r instanceof te,34018),r instanceof W)return r;if(r.filters.length===1)return Oa(r.filters[0]);const e=r.filters.map(n=>Oa(n));let t=te.create(e,r.op);return t=xi(t),tp(t)?t:(U(t instanceof te,64498),U(er(t),40251),U(t.filters.length>1,57927),t.filters.reduce((n,s)=>pc(n,s)))}function pc(r,e){let t;return U(r instanceof W||r instanceof te,38388),U(e instanceof W||e instanceof te,25473),t=r instanceof W?e instanceof W?function(s,i){return te.create([s,i],"and")}(r,e):ah(r,e):e instanceof W?ah(e,r):function(s,i){if(U(s.filters.length>0&&i.filters.length>0,48005),er(s)&&er(i))return gf(s,i.getFilters());const o=ba(s)?s:i,c=ba(s)?i:s,u=o.filters.map(h=>pc(h,c));return te.create(u,"or")}(r,e),xi(t)}function ah(r,e){if(er(e))return gf(e,r.getFilters());{const t=e.filters.map(n=>pc(r,n));return te.create(t,"or")}}function xi(r){if(U(r instanceof W||r instanceof te,11850),r instanceof W)return r;const e=r.getFilters();if(e.length===1)return xi(e[0]);if(pf(r))return r;const t=e.map(s=>xi(s)),n=[];return t.forEach(s=>{s instanceof W?n.push(s):s instanceof te&&(s.op===r.op?n.push(...s.filters):n.push(s))}),n.length===1?n[0]:te.create(n,r.op)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class YI{constructor(){this.Dn=new mc}addToCollectionParentIndex(e,t){return this.Dn.add(t),w.resolve()}getCollectionParents(e,t){return w.resolve(this.Dn.getEntries(t))}addFieldIndex(e,t){return w.resolve()}deleteFieldIndex(e,t){return w.resolve()}deleteAllFieldIndexes(e){return w.resolve()}createTargetIndexes(e,t){return w.resolve()}getDocumentsMatchingTarget(e,t){return w.resolve(null)}getIndexType(e,t){return w.resolve(0)}getFieldIndexes(e,t){return w.resolve([])}getNextCollectionGroupToUpdate(e){return w.resolve(null)}getMinOffset(e,t){return w.resolve(Ue.min())}getMinOffsetFromCollectionGroup(e,t){return w.resolve(Ue.min())}updateCollectionGroup(e,t,n){return w.resolve()}updateIndexEntries(e,t){return w.resolve()}}class mc{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t]||new ne(Y.comparator),i=!s.has(n);return this.index[t]=s.add(n),i}has(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t];return s&&s.has(n)}getEntries(e){return(this.index[e]||new ne(Y.comparator)).toArray()}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ch="IndexedDbIndexManager",ti=new Uint8Array(0);class ZI{constructor(e,t){this.databaseId=t,this.vn=new mc,this.Cn=new mt(n=>mn(n),(n,s)=>ws(n,s)),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.vn.has(t)){const n=t.lastSegment(),s=t.popLast();e.addOnCommittedListener(()=>{this.vn.add(t)});const i={collectionId:n,parent:Pe(s)};return uh(e).put(i)}return w.resolve()}getCollectionParents(e,t){const n=[],s=IDBKeyRange.bound([t,""],[Ld(t),""],!1,!0);return uh(e).j(s).next(i=>{for(const o of i){if(o.collectionId!==t)break;n.push(Xe(o.parent))}return n})}addFieldIndex(e,t){const n=Fr(e),s=function(c){return{indexId:c.indexId,collectionGroup:c.collectionGroup,fields:c.fields.map(u=>[u.fieldPath.canonicalString(),u.kind])}}(t);delete s.indexId;const i=n.add(s);if(t.indexState){const o=Dn(e);return i.next(c=>{o.put(eh(c,this.uid,t.indexState.sequenceNumber,t.indexState.offset))})}return i.next()}deleteFieldIndex(e,t){const n=Fr(e),s=Dn(e),i=Vn(e);return n.delete(t.indexId).next(()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))).next(()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))}deleteAllFieldIndexes(e){const t=Fr(e),n=Vn(e),s=Dn(e);return t.Y().next(()=>n.Y()).next(()=>s.Y())}createTargetIndexes(e,t){return w.forEach(this.Fn(t),n=>this.getIndexType(e,n).next(s=>{if(s===0||s===1){const i=new oh(n).bn();if(i!=null)return this.addFieldIndex(e,i)}}))}getDocumentsMatchingTarget(e,t){const n=Vn(e);let s=!0;const i=new Map;return w.forEach(this.Fn(t),o=>this.Mn(e,o).next(c=>{s&&(s=!!c),i.set(o,c)})).next(()=>{if(s){let o=G();const c=[];return w.forEach(i,(u,h)=>{V(ch,`Using index ${function(L){return`id=${L.indexId}|cg=${L.collectionGroup}|f=${L.fields.map(H=>`${H.fieldPath}:${H.kind}`).join(",")}`}(u)} to execute ${mn(t)}`);const f=function(L,H){const Z=ya(H);if(Z===void 0)return null;for(const K of Ci(L,Z.fieldPath))switch(K.op){case"array-contains-any":return K.value.arrayValue.values||[];case"array-contains":return[K.value]}return null}(h,u),m=function(L,H){const Z=new Map;for(const K of Zt(H))for(const E of Ci(L,K.fieldPath))switch(E.op){case"==":case"in":Z.set(K.fieldPath.canonicalString(),E.value);break;case"not-in":case"!=":return Z.set(K.fieldPath.canonicalString(),E.value),Array.from(Z.values())}return null}(h,u),g=function(L,H){const Z=[];let K=!0;for(const E of Zt(H)){const _=E.kind===0?Ul(L,E.fieldPath,L.startAt):jl(L,E.fieldPath,L.startAt);Z.push(_.value),K&&(K=_.inclusive)}return new Zn(Z,K)}(h,u),S=function(L,H){const Z=[];let K=!0;for(const E of Zt(H)){const _=E.kind===0?jl(L,E.fieldPath,L.endAt):Ul(L,E.fieldPath,L.endAt);Z.push(_.value),K&&(K=_.inclusive)}return new Zn(Z,K)}(h,u),C=this.xn(u,h,g),N=this.xn(u,h,S),D=this.On(u,h,m),z=this.Nn(u.indexId,f,C,g.inclusive,N,S.inclusive,D);return w.forEach(z,B=>n.H(B,t.limit).next(L=>{L.forEach(H=>{const Z=O.fromSegments(H.documentKey);o.has(Z)||(o=o.add(Z),c.push(Z))})}))}).next(()=>c)}return w.resolve(null)})}Fn(e){let t=this.Cn.get(e);return t||(e.filters.length===0?t=[e]:t=JI(te.create(e.filters,"and")).map(n=>Ra(e.path,e.collectionGroup,e.orderBy,n.getFilters(),e.limit,e.startAt,e.endAt)),this.Cn.set(e,t),t)}Nn(e,t,n,s,i,o,c){const u=(t!=null?t.length:1)*Math.max(n.length,i.length),h=u/(t!=null?t.length:1),f=[];for(let m=0;m<u;++m){const g=t?this.Bn(t[m/h]):ti,S=this.Ln(e,g,n[m%h],s),C=this.kn(e,g,i[m%h],o),N=c.map(D=>this.Ln(e,g,D,!0));f.push(...this.createRange(S,C,N))}return f}Ln(e,t,n,s){const i=new sn(e,O.empty(),t,n);return s?i:i.En()}kn(e,t,n,s){const i=new sn(e,O.empty(),t,n);return s?i.En():i}Mn(e,t){const n=new oh(t),s=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,s).next(i=>{let o=null;for(const c of i)n.pn(c)&&(!o||c.fields.length>o.fields.length)&&(o=c);return o})}getIndexType(e,t){let n=2;const s=this.Fn(t);return w.forEach(s,i=>this.Mn(e,i).next(o=>{o?n!==0&&o.fields.length<function(u){let h=new ne(ue.comparator),f=!1;for(const m of u.filters)for(const g of m.getFlattenedFilters())g.field.isKeyField()||(g.op==="array-contains"||g.op==="array-contains-any"?f=!0:h=h.add(g.field));for(const m of u.orderBy)m.field.isKeyField()||(h=h.add(m.field));return h.size+(f?1:0)}(i)&&(n=1):n=0})).next(()=>function(o){return o.limit!==null}(t)&&s.length>1&&n===2?1:n)}qn(e,t){const n=new Lr;for(const s of Zt(e)){const i=t.data.field(s.fieldPath);if(i==null)return null;const o=n.hn(s.kind);rn.Ut.bt(i,o)}return n.an()}Bn(e){const t=new Lr;return rn.Ut.bt(e,t.hn(0)),t.an()}Qn(e,t){const n=new Lr;return rn.Ut.bt(ps(this.databaseId,t),n.hn(function(i){const o=Zt(i);return o.length===0?0:o[o.length-1].kind}(e))),n.an()}On(e,t,n){if(n===null)return[];let s=[];s.push(new Lr);let i=0;for(const o of Zt(e)){const c=n[i++];for(const u of s)if(this.$n(t,o.fieldPath)&&ms(c))s=this.Un(s,o,c);else{const h=u.hn(o.kind);rn.Ut.bt(c,h)}}return this.Kn(s)}xn(e,t,n){return this.On(e,t,n.position)}Kn(e){const t=[];for(let n=0;n<e.length;++n)t[n]=e[n].an();return t}Un(e,t,n){const s=[...e],i=[];for(const o of n.arrayValue.values||[])for(const c of s){const u=new Lr;u.seed(c.an()),rn.Ut.bt(o,u.hn(t.kind)),i.push(u)}return i}$n(e,t){return!!e.filters.find(n=>n instanceof W&&n.field.isEqual(t)&&(n.op==="in"||n.op==="not-in"))}getFieldIndexes(e,t){const n=Fr(e),s=Dn(e);return(t?n.j(Ea,IDBKeyRange.bound(t,t)):n.j()).next(i=>{const o=[];return w.forEach(i,c=>s.get([c.indexId,this.uid]).next(u=>{o.push(function(f,m){const g=m?new os(m.sequenceNumber,new Ue(_n(m.readTime),new O(Xe(m.documentKey)),m.largestBatchId)):os.empty(),S=f.fields.map(([C,N])=>new ai(ue.fromServerFormat(C),N));return new Ai(f.indexId,f.collectionGroup,S,g)}(c,u))})).next(()=>o)})}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next(t=>t.length===0?null:(t.sort((n,s)=>{const i=n.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:$(n.collectionGroup,s.collectionGroup)}),t[0].collectionGroup))}updateCollectionGroup(e,t,n){const s=Fr(e),i=Dn(e);return this.Wn(e).next(o=>s.j(Ea,IDBKeyRange.bound(t,t)).next(c=>w.forEach(c,u=>i.put(eh(u.indexId,this.uid,o,n)))))}updateIndexEntries(e,t){const n=new Map;return w.forEach(t,(s,i)=>{const o=n.get(s.collectionGroup);return(o?w.resolve(o):this.getFieldIndexes(e,s.collectionGroup)).next(c=>(n.set(s.collectionGroup,c),w.forEach(c,u=>this.Gn(e,s,u).next(h=>{const f=this.zn(i,u);return h.isEqual(f)?w.resolve():this.jn(e,i,u,h,f)}))))})}Jn(e,t,n,s){return Vn(e).put(s.An(this.uid,this.Qn(n,t.key),t.key))}Hn(e,t,n,s){return Vn(e).delete(s.Rn(this.uid,this.Qn(n,t.key),t.key))}Gn(e,t,n){const s=Vn(e);let i=new ne(Et);return s.X({index:Xd,range:IDBKeyRange.only([n.indexId,this.uid,mi(this.Qn(n,t))])},(o,c)=>{i=i.add(new sn(n.indexId,t,ih(c.arrayValue),ih(c.directionalValue)))}).next(()=>i)}zn(e,t){let n=new ne(Et);const s=this.qn(t,e);if(s==null)return n;const i=ya(t);if(i!=null){const o=e.data.field(i.fieldPath);if(ms(o))for(const c of o.arrayValue.values||[])n=n.add(new sn(t.indexId,e.key,this.Bn(c),s))}else n=n.add(new sn(t.indexId,e.key,ti,s));return n}jn(e,t,n,s,i){V(ch,"Updating index entries for document '%s'",t.key);const o=[];return function(u,h,f,m,g){const S=u.getIterator(),C=h.getIterator();let N=Pn(S),D=Pn(C);for(;N||D;){let z=!1,B=!1;if(N&&D){const L=f(N,D);L<0?B=!0:L>0&&(z=!0)}else N!=null?B=!0:z=!0;z?(m(D),D=Pn(C)):B?(g(N),N=Pn(S)):(N=Pn(S),D=Pn(C))}}(s,i,Et,c=>{o.push(this.Jn(e,t,n,c))},c=>{o.push(this.Hn(e,t,n,c))}),w.waitFor(o)}Wn(e){let t=1;return Dn(e).X({index:Qd,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},(n,s,i)=>{i.done(),t=s.sequenceNumber+1}).next(()=>t)}createRange(e,t,n){n=n.sort((o,c)=>Et(o,c)).filter((o,c,u)=>!c||Et(o,u[c-1])!==0);const s=[];s.push(e);for(const o of n){const c=Et(o,e),u=Et(o,t);if(c===0)s[0]=e.En();else if(c>0&&u<0)s.push(o),s.push(o.En());else if(u>0)break}s.push(t);const i=[];for(let o=0;o<s.length;o+=2){if(this.Yn(s[o],s[o+1]))return[];const c=s[o].Rn(this.uid,ti,O.empty()),u=s[o+1].Rn(this.uid,ti,O.empty());i.push(IDBKeyRange.bound(c,u))}return i}Yn(e,t){return Et(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(lh)}getMinOffset(e,t){return w.mapArray(this.Fn(t),n=>this.Mn(e,n).next(s=>s||M(44426))).next(lh)}}function uh(r){return _e(r,ls)}function Vn(r){return _e(r,Xr)}function Fr(r){return _e(r,Za)}function Dn(r){return _e(r,Qr)}function lh(r){U(r.length!==0,28825);let e=r[0].indexState.offset,t=e.largestBatchId;for(let n=1;n<r.length;n++){const s=r[n].indexState.offset;Xa(s,e)<0&&(e=s),t<s.largestBatchId&&(t=s.largestBatchId)}return new Ue(e.readTime,e.documentKey,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hh={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},np=41943040;class Re{static withCacheSize(e){return new Re(e,Re.DEFAULT_COLLECTION_PERCENTILE,Re.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rp(r,e,t){const n=r.store(ze),s=r.store(Kn),i=[],o=IDBKeyRange.only(t.batchId);let c=0;const u=n.X({range:o},(f,m,g)=>(c++,g.delete()));i.push(u.next(()=>{U(c===1,47070,{batchId:t.batchId})}));const h=[];for(const f of t.mutations){const m=Hd(e,f.key.path,t.batchId);i.push(s.delete(m)),h.push(f.key)}return w.waitFor(i).next(()=>h)}function Oi(r){if(!r)return 0;let e;if(r.document)e=r.document;else if(r.unknownDocument)e=r.unknownDocument;else{if(!r.noDocument)throw M(14731);e=r.noDocument}return JSON.stringify(e).length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Re.DEFAULT_COLLECTION_PERCENTILE=10,Re.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Re.DEFAULT=new Re(np,Re.DEFAULT_COLLECTION_PERCENTILE,Re.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Re.DISABLED=new Re(-1,0,0);class lo{constructor(e,t,n,s){this.userId=e,this.serializer=t,this.indexManager=n,this.referenceDelegate=s,this.Zn={}}static yt(e,t,n,s){U(e.uid!=="",64387);const i=e.isAuthenticated()?e.uid:"";return new lo(i,t,n,s)}checkEmpty(e){let t=!0;const n=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return vt(e).X({index:on,range:n},(s,i,o)=>{t=!1,o.done()}).next(()=>t)}addMutationBatch(e,t,n,s){const i=Ln(e),o=vt(e);return o.add({}).next(c=>{U(typeof c=="number",49019);const u=new uc(c,t,n,s),h=function(S,C,N){const D=N.baseMutations.map(B=>ki(S.gt,B)),z=N.mutations.map(B=>ki(S.gt,B));return{userId:C,batchId:N.batchId,localWriteTimeMs:N.localWriteTime.toMillis(),baseMutations:D,mutations:z}}(this.serializer,this.userId,u),f=[];let m=new ne((g,S)=>$(g.canonicalString(),S.canonicalString()));for(const g of s){const S=Hd(this.userId,g.key.path,c);m=m.add(g.key.path.popLast()),f.push(o.put(h)),f.push(i.put(S,ky))}return m.forEach(g=>{f.push(this.indexManager.addToCollectionParentIndex(e,g))}),e.addOnCommittedListener(()=>{this.Zn[c]=u.keys()}),w.waitFor(f).next(()=>u)})}lookupMutationBatch(e,t){return vt(e).get(t).next(n=>n?(U(n.userId===this.userId,48,"Unexpected user for mutation batch",{userId:n.userId,batchId:t}),nn(this.serializer,n)):null)}Xn(e,t){return this.Zn[t]?w.resolve(this.Zn[t]):this.lookupMutationBatch(e,t).next(n=>{if(n){const s=n.keys();return this.Zn[t]=s,s}return null})}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=IDBKeyRange.lowerBound([this.userId,n]);let i=null;return vt(e).X({index:on,range:s},(o,c,u)=>{c.userId===this.userId&&(U(c.batchId>=n,47524,{er:n}),i=nn(this.serializer,c)),u.done()}).next(()=>i)}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let n=cn;return vt(e).X({index:on,range:t,reverse:!0},(s,i,o)=>{n=i.batchId,o.done()}).next(()=>n)}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,cn],[this.userId,Number.POSITIVE_INFINITY]);return vt(e).j(on,t).next(n=>n.map(s=>nn(this.serializer,s)))}getAllMutationBatchesAffectingDocumentKey(e,t){const n=ci(this.userId,t.path),s=IDBKeyRange.lowerBound(n),i=[];return Ln(e).X({range:s},(o,c,u)=>{const[h,f,m]=o,g=Xe(f);if(h===this.userId&&t.path.isEqual(g))return vt(e).get(m).next(S=>{if(!S)throw M(61480,{tr:o,batchId:m});U(S.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:S.userId,batchId:m}),i.push(nn(this.serializer,S))});u.done()}).next(()=>i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new ne($);const s=[];return t.forEach(i=>{const o=ci(this.userId,i.path),c=IDBKeyRange.lowerBound(o),u=Ln(e).X({range:c},(h,f,m)=>{const[g,S,C]=h,N=Xe(S);g===this.userId&&i.path.isEqual(N)?n=n.add(C):m.done()});s.push(u)}),w.waitFor(s).next(()=>this.nr(e,n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1,i=ci(this.userId,n),o=IDBKeyRange.lowerBound(i);let c=new ne($);return Ln(e).X({range:o},(u,h,f)=>{const[m,g,S]=u,C=Xe(g);m===this.userId&&n.isPrefixOf(C)?C.length===s&&(c=c.add(S)):f.done()}).next(()=>this.nr(e,c))}nr(e,t){const n=[],s=[];return t.forEach(i=>{s.push(vt(e).get(i).next(o=>{if(o===null)throw M(35274,{batchId:i});U(o.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:o.userId,batchId:i}),n.push(nn(this.serializer,o))}))}),w.waitFor(s).next(()=>n)}removeMutationBatch(e,t){return rp(e.ce,this.userId,t).next(n=>(e.addOnCommittedListener(()=>{this.rr(t.batchId)}),w.forEach(n,s=>this.referenceDelegate.markPotentiallyOrphaned(e,s))))}rr(e){delete this.Zn[e]}performConsistencyCheck(e){return this.checkEmpty(e).next(t=>{if(!t)return w.resolve();const n=IDBKeyRange.lowerBound(function(o){return[o]}(this.userId)),s=[];return Ln(e).X({range:n},(i,o,c)=>{if(i[0]===this.userId){const u=Xe(i[1]);s.push(u)}else c.done()}).next(()=>{U(s.length===0,56720,{ir:s.map(i=>i.canonicalString())})})})}containsKey(e,t){return sp(e,this.userId,t)}sr(e){return ip(e).get(this.userId).next(t=>t||{userId:this.userId,lastAcknowledgedBatchId:cn,lastStreamToken:""})}}function sp(r,e,t){const n=ci(e,t.path),s=n[1],i=IDBKeyRange.lowerBound(n);let o=!1;return Ln(r).X({range:i,Z:!0},(c,u,h)=>{const[f,m,g]=c;f===e&&m===s&&(o=!0),h.done()}).next(()=>o)}function vt(r){return _e(r,ze)}function Ln(r){return _e(r,Kn)}function ip(r){return _e(r,cs)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yn{constructor(e){this._r=e}next(){return this._r+=2,this._r}static ar(){return new yn(0)}static ur(){return new yn(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eE{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.cr(e).next(t=>{const n=new yn(t.highestTargetId);return t.highestTargetId=n.next(),this.lr(e,t).next(()=>t.highestTargetId)})}getLastRemoteSnapshotVersion(e){return this.cr(e).next(t=>j.fromTimestamp(new ee(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds)))}getHighestSequenceNumber(e){return this.cr(e).next(t=>t.highestListenSequenceNumber)}setTargetsMetadata(e,t,n){return this.cr(e).next(s=>(s.highestListenSequenceNumber=t,n&&(s.lastRemoteSnapshotVersion=n.toTimestamp()),t>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=t),this.lr(e,s)))}addTargetData(e,t){return this.hr(e,t).next(()=>this.cr(e).next(n=>(n.targetCount+=1,this.Pr(t,n),this.lr(e,n))))}updateTargetData(e,t){return this.hr(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next(()=>kn(e).delete(t.targetId)).next(()=>this.cr(e)).next(n=>(U(n.targetCount>0,8065),n.targetCount-=1,this.lr(e,n)))}removeTargets(e,t,n){let s=0;const i=[];return kn(e).X((o,c)=>{const u=zr(c);u.sequenceNumber<=t&&n.get(u.targetId)===null&&(s++,i.push(this.removeTargetData(e,u)))}).next(()=>w.waitFor(i)).next(()=>s)}forEachTarget(e,t){return kn(e).X((n,s)=>{const i=zr(s);t(i)})}cr(e){return dh(e).get(Ri).next(t=>(U(t!==null,2888),t))}lr(e,t){return dh(e).put(Ri,t)}hr(e,t){return kn(e).put(Yf(this.serializer,t))}Pr(e,t){let n=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,n=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,n=!0),n}getTargetCount(e){return this.cr(e).next(t=>t.targetCount)}getTargetData(e,t){const n=mn(t),s=IDBKeyRange.bound([n,Number.NEGATIVE_INFINITY],[n,Number.POSITIVE_INFINITY]);let i=null;return kn(e).X({range:s,index:Wd},(o,c,u)=>{const h=zr(c);ws(t,h.target)&&(i=h,u.done())}).next(()=>i)}addMatchingKeys(e,t,n){const s=[],i=At(e);return t.forEach(o=>{const c=Pe(o.path);s.push(i.put({targetId:n,path:c})),s.push(this.referenceDelegate.addReference(e,n,o))}),w.waitFor(s)}removeMatchingKeys(e,t,n){const s=At(e);return w.forEach(t,i=>{const o=Pe(i.path);return w.waitFor([s.delete([n,o]),this.referenceDelegate.removeReference(e,n,i)])})}removeMatchingKeysForTargetId(e,t){const n=At(e),s=IDBKeyRange.bound([t],[t+1],!1,!0);return n.delete(s)}getMatchingKeysForTargetId(e,t){const n=IDBKeyRange.bound([t],[t+1],!1,!0),s=At(e);let i=G();return s.X({range:n,Z:!0},(o,c,u)=>{const h=Xe(o[1]),f=new O(h);i=i.add(f)}).next(()=>i)}containsKey(e,t){const n=Pe(t.path),s=IDBKeyRange.bound([n],[Ld(n)],!1,!0);let i=0;return At(e).X({index:Ya,Z:!0,range:s},([o,c],u,h)=>{o!==0&&(i++,h.done())}).next(()=>i>0)}Et(e,t){return kn(e).get(t).next(n=>n?zr(n):null)}}function kn(r){return _e(r,Wn)}function dh(r){return _e(r,un)}function At(r){return _e(r,Qn)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fh="LruGarbageCollector",op=1048576;function ph([r,e],[t,n]){const s=$(r,t);return s===0?$(e,n):s}class tE{constructor(e){this.Tr=e,this.buffer=new ne(ph),this.Ir=0}dr(){return++this.Ir}Er(e){const t=[e,this.dr()];if(this.buffer.size<this.Tr)this.buffer=this.buffer.add(t);else{const n=this.buffer.last();ph(t,n)<0&&(this.buffer=this.buffer.delete(n).add(t))}}get maxValue(){return this.buffer.last()[0]}}class ap{constructor(e,t,n){this.garbageCollector=e,this.asyncQueue=t,this.localStore=n,this.Ar=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Rr(6e4)}stop(){this.Ar&&(this.Ar.cancel(),this.Ar=null)}get started(){return this.Ar!==null}Rr(e){V(fh,`Garbage collection scheduled in ${e}ms`),this.Ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){$t(t)?V(fh,"Ignoring IndexedDB error during garbage collection: ",t):await jt(t)}await this.Rr(3e5)})}}class nE{constructor(e,t){this.Vr=e,this.params=t}calculateTargetCount(e,t){return this.Vr.mr(e).next(n=>Math.floor(t/100*n))}nthSequenceNumber(e,t){if(t===0)return w.resolve(xe.ue);const n=new tE(t);return this.Vr.forEachTarget(e,s=>n.Er(s.sequenceNumber)).next(()=>this.Vr.gr(e,s=>n.Er(s))).next(()=>n.maxValue)}removeTargets(e,t,n){return this.Vr.removeTargets(e,t,n)}removeOrphanedDocuments(e,t){return this.Vr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(V("LruGarbageCollector","Garbage collection skipped; disabled"),w.resolve(hh)):this.getCacheSize(e).next(n=>n<this.params.cacheSizeCollectionThreshold?(V("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),hh):this.pr(e,t))}getCacheSize(e){return this.Vr.getCacheSize(e)}pr(e,t){let n,s,i,o,c,u,h;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(m=>(m>this.params.maximumSequenceNumbersToCollect?(V("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),s=this.params.maximumSequenceNumbersToCollect):s=m,o=Date.now(),this.nthSequenceNumber(e,s))).next(m=>(n=m,c=Date.now(),this.removeTargets(e,n,t))).next(m=>(i=m,u=Date.now(),this.removeOrphanedDocuments(e,n))).next(m=>(h=Date.now(),Nn()<=X.DEBUG&&V("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${s} in `+(c-o)+`ms
	Removed ${i} targets in `+(u-c)+`ms
	Removed ${m} documents in `+(h-u)+`ms
Total Duration: ${h-f}ms`),w.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:m})))}}function cp(r,e){return new nE(r,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rE{constructor(e,t){this.db=e,this.garbageCollector=cp(this,t)}mr(e){const t=this.yr(e);return this.db.getTargetCache().getTargetCount(e).next(n=>t.next(s=>n+s))}yr(e){let t=0;return this.gr(e,n=>{t++}).next(()=>t)}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}gr(e,t){return this.wr(e,(n,s)=>t(s))}addReference(e,t,n){return ni(e,n)}removeReference(e,t,n){return ni(e,n)}removeTargets(e,t,n){return this.db.getTargetCache().removeTargets(e,t,n)}markPotentiallyOrphaned(e,t){return ni(e,t)}Sr(e,t){return function(s,i){let o=!1;return ip(s).ee(c=>sp(s,c,i).next(u=>(u&&(o=!0),w.resolve(!u)))).next(()=>o)}(e,t)}removeOrphanedDocuments(e,t){const n=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.wr(e,(o,c)=>{if(c<=t){const u=this.Sr(e,o).next(h=>{if(!h)return i++,n.getEntry(e,o).next(()=>(n.removeEntry(o,j.min()),At(e).delete(function(m){return[0,Pe(m.path)]}(o))))});s.push(u)}}).next(()=>w.waitFor(s)).next(()=>n.apply(e)).next(()=>i)}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,n)}updateLimboDocument(e,t){return ni(e,t)}wr(e,t){const n=At(e);let s,i=xe.ue;return n.X({index:Ya},([o,c],{path:u,sequenceNumber:h})=>{o===0?(i!==xe.ue&&t(new O(Xe(s)),i),i=h,s=u):i=xe.ue}).next(()=>{i!==xe.ue&&t(new O(Xe(s)),i)})}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function ni(r,e){return At(r).put(function(n,s){return{targetId:0,path:Pe(n.path),sequenceNumber:s}}(e,r.currentSequenceNumber))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class up{constructor(){this.changes=new mt(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,he.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return n!==void 0?w.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sE{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,n){return Jt(e).put(n)}removeEntry(e,t,n){return Jt(e).delete(function(i,o){const c=i.path.toArray();return[c.slice(0,c.length-2),c[c.length-2],Ni(o),c[c.length-1]]}(t,n))}updateMetadata(e,t){return this.getMetadata(e).next(n=>(n.byteSize+=t,this.br(e,n)))}getEntry(e,t){let n=he.newInvalidDocument(t);return Jt(e).X({index:ui,range:IDBKeyRange.only(Br(t))},(s,i)=>{n=this.Dr(t,i)}).next(()=>n)}vr(e,t){let n={size:0,document:he.newInvalidDocument(t)};return Jt(e).X({index:ui,range:IDBKeyRange.only(Br(t))},(s,i)=>{n={document:this.Dr(t,i),size:Oi(i)}}).next(()=>n)}getEntries(e,t){let n=Fe();return this.Cr(e,t,(s,i)=>{const o=this.Dr(s,i);n=n.insert(s,o)}).next(()=>n)}Fr(e,t){let n=Fe(),s=new ie(O.comparator);return this.Cr(e,t,(i,o)=>{const c=this.Dr(i,o);n=n.insert(i,c),s=s.insert(i,Oi(o))}).next(()=>({documents:n,Mr:s}))}Cr(e,t,n){if(t.isEmpty())return w.resolve();let s=new ne(_h);t.forEach(u=>s=s.add(u));const i=IDBKeyRange.bound(Br(s.first()),Br(s.last())),o=s.getIterator();let c=o.getNext();return Jt(e).X({index:ui,range:i},(u,h,f)=>{const m=O.fromSegments([...h.prefixPath,h.collectionGroup,h.documentId]);for(;c&&_h(c,m)<0;)n(c,null),c=o.getNext();c&&c.isEqual(m)&&(n(c,h),c=o.hasNext()?o.getNext():null),c?f.G(Br(c)):f.done()}).next(()=>{for(;c;)n(c,null),c=o.hasNext()?o.getNext():null})}getDocumentsMatchingQuery(e,t,n,s,i){const o=t.path,c=[o.popLast().toArray(),o.lastSegment(),Ni(n.readTime),n.documentKey.path.isEmpty()?"":n.documentKey.path.lastSegment()],u=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return Jt(e).j(IDBKeyRange.bound(c,u,!0)).next(h=>{i==null||i.incrementDocumentReadCount(h.length);let f=Fe();for(const m of h){const g=this.Dr(O.fromSegments(m.prefixPath.concat(m.collectionGroup,m.documentId)),m);g.isFoundDocument()&&(As(t,g)||s.has(g.key))&&(f=f.insert(g.key,g))}return f})}getAllFromCollectionGroup(e,t,n,s){let i=Fe();const o=gh(t,n),c=gh(t,Ue.max());return Jt(e).X({index:Kd,range:IDBKeyRange.bound(o,c,!0)},(u,h,f)=>{const m=this.Dr(O.fromSegments(h.prefixPath.concat(h.collectionGroup,h.documentId)),h);i=i.insert(m.key,m),i.size===s&&f.done()}).next(()=>i)}newChangeBuffer(e){return new iE(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next(t=>t.byteSize)}getMetadata(e){return mh(e).get(Ia).next(t=>(U(!!t,20021),t))}br(e,t){return mh(e).put(Ia,t)}Dr(e,t){if(t){const n=zI(this.serializer,t);if(!(n.isNoDocument()&&n.version.isEqual(j.min())))return n}return he.newInvalidDocument(e)}}function lp(r){return new sE(r)}class iE extends up{constructor(e,t){super(),this.Or=e,this.trackRemovals=t,this.Nr=new mt(n=>n.toString(),(n,s)=>n.isEqual(s))}applyChanges(e){const t=[];let n=0,s=new ne((i,o)=>$(i.canonicalString(),o.canonicalString()));return this.changes.forEach((i,o)=>{const c=this.Nr.get(i);if(t.push(this.Or.removeEntry(e,i,c.readTime)),o.isValidDocument()){const u=Yl(this.Or.serializer,o);s=s.add(i.path.popLast());const h=Oi(u);n+=h-c.size,t.push(this.Or.addEntry(e,i,u))}else if(n-=c.size,this.trackRemovals){const u=Yl(this.Or.serializer,o.convertToNoDocument(j.min()));t.push(this.Or.addEntry(e,i,u))}}),s.forEach(i=>{t.push(this.Or.indexManager.addToCollectionParentIndex(e,i))}),t.push(this.Or.updateMetadata(e,n)),w.waitFor(t)}getFromCache(e,t){return this.Or.vr(e,t).next(n=>(this.Nr.set(t,{size:n.size,readTime:n.document.readTime}),n.document))}getAllFromCache(e,t){return this.Or.Fr(e,t).next(({documents:n,Mr:s})=>(s.forEach((i,o)=>{this.Nr.set(i,{size:o,readTime:n.get(i).readTime})}),n))}}function mh(r){return _e(r,us)}function Jt(r){return _e(r,Si)}function Br(r){const e=r.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function gh(r,e){const t=e.documentKey.path.toArray();return[r,Ni(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function _h(r,e){const t=r.path.toArray(),n=e.path.toArray();let s=0;for(let i=0;i<t.length-2&&i<n.length-2;++i)if(s=$(t[i],n[i]),s)return s;return s=$(t.length,n.length),s||(s=$(t[t.length-2],n[n.length-2]),s||$(t[t.length-1],n[n.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oE{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hp{constructor(e,t,n,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=s}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(n=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(n!==null&&es(n.mutation,s,$e.empty(),ee.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(n=>this.getLocalViewOfDocuments(e,n,G()).next(()=>n))}getLocalViewOfDocuments(e,t,n=G()){const s=Je();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,n).next(i=>{let o=$r();return i.forEach((c,u)=>{o=o.insert(c,u.overlayedDocument)}),o}))}getOverlayedDocuments(e,t){const n=Je();return this.populateOverlays(e,n,t).next(()=>this.computeViews(e,t,n,G()))}populateOverlays(e,t,n){const s=[];return n.forEach(i=>{t.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((o,c)=>{t.set(o,c)})})}computeViews(e,t,n,s){let i=Fe();const o=Zr(),c=function(){return Zr()}();return t.forEach((u,h)=>{const f=n.get(h.key);s.has(h.key)&&(f===void 0||f.mutation instanceof qt)?i=i.insert(h.key,h):f!==void 0?(o.set(h.key,f.mutation.getFieldMask()),es(f.mutation,h,f.mutation.getFieldMask(),ee.now())):o.set(h.key,$e.empty())}),this.recalculateAndSaveOverlays(e,i).next(u=>(u.forEach((h,f)=>o.set(h,f)),t.forEach((h,f)=>{var m;return c.set(h,new oE(f,(m=o.get(h))!==null&&m!==void 0?m:null))}),c))}recalculateAndSaveOverlays(e,t){const n=Zr();let s=new ie((o,c)=>o-c),i=G();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(o=>{for(const c of o)c.keys().forEach(u=>{const h=t.get(u);if(h===null)return;let f=n.get(u)||$e.empty();f=c.applyToLocalView(h,f),n.set(u,f);const m=(s.get(c.batchId)||G()).add(u);s=s.insert(c.batchId,m)})}).next(()=>{const o=[],c=s.getReverseIterator();for(;c.hasNext();){const u=c.getNext(),h=u.key,f=u.value,m=Rf();f.forEach(g=>{if(!i.has(g)){const S=xf(t.get(g),n.get(g));S!==null&&m.set(g,S),i=i.add(g)}}),o.push(this.documentOverlayCache.saveOverlays(e,h,m))}return w.waitFor(o)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(n=>this.recalculateAndSaveOverlays(e,n))}getDocumentsMatchingQuery(e,t,n,s){return function(o){return O.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):vf(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,s):this.getDocumentsMatchingCollectionQuery(e,t,n,s)}getNextDocuments(e,t,n,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,s).next(i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,s-i.size):w.resolve(Je());let c=Hn,u=i;return o.next(h=>w.forEach(h,(f,m)=>(c<m.largestBatchId&&(c=m.largestBatchId),i.get(f)?w.resolve():this.remoteDocumentCache.getEntry(e,f).next(g=>{u=u.insert(f,g)}))).next(()=>this.populateOverlays(e,h,i)).next(()=>this.computeViews(e,u,h,G())).next(f=>({batchId:c,changes:Sf(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new O(t)).next(n=>{let s=$r();return n.isFoundDocument()&&(s=s.insert(n.key,n)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,n,s){const i=t.collectionGroup;let o=$r();return this.indexManager.getCollectionParents(e,i).next(c=>w.forEach(c,u=>{const h=function(m,g){return new dr(g,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(t,u.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,n,s).next(f=>{f.forEach((m,g)=>{o=o.insert(m,g)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,t,n,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next(o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s))).next(o=>{i.forEach((u,h)=>{const f=h.getKey();o.get(f)===null&&(o=o.insert(f,he.newInvalidDocument(f)))});let c=$r();return o.forEach((u,h)=>{const f=i.get(u);f!==void 0&&es(f.mutation,h,$e.empty(),ee.now()),As(t,h)&&(c=c.insert(u,h))}),c})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aE{constructor(e){this.serializer=e,this.Br=new Map,this.Lr=new Map}getBundleMetadata(e,t){return w.resolve(this.Br.get(t))}saveBundleMetadata(e,t){return this.Br.set(t.id,function(s){return{id:s.id,version:s.version,createTime:De(s.createTime)}}(t)),w.resolve()}getNamedQuery(e,t){return w.resolve(this.Lr.get(t))}saveNamedQuery(e,t){return this.Lr.set(t.name,function(s){return{name:s.name,query:Zf(s.bundledQuery),readTime:De(s.readTime)}}(t)),w.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cE{constructor(){this.overlays=new ie(O.comparator),this.kr=new Map}getOverlay(e,t){return w.resolve(this.overlays.get(t))}getOverlays(e,t){const n=Je();return w.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&n.set(s,i)})).next(()=>n)}saveOverlays(e,t,n){return n.forEach((s,i)=>{this.wt(e,t,i)}),w.resolve()}removeOverlaysForBatchId(e,t,n){const s=this.kr.get(n);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.kr.delete(n)),w.resolve()}getOverlaysForCollection(e,t,n){const s=Je(),i=t.length+1,o=new O(t.child("")),c=this.overlays.getIteratorFrom(o);for(;c.hasNext();){const u=c.getNext().value,h=u.getKey();if(!t.isPrefixOf(h.path))break;h.path.length===i&&u.largestBatchId>n&&s.set(u.getKey(),u)}return w.resolve(s)}getOverlaysForCollectionGroup(e,t,n,s){let i=new ie((h,f)=>h-f);const o=this.overlays.getIterator();for(;o.hasNext();){const h=o.getNext().value;if(h.getKey().getCollectionGroup()===t&&h.largestBatchId>n){let f=i.get(h.largestBatchId);f===null&&(f=Je(),i=i.insert(h.largestBatchId,f)),f.set(h.getKey(),h)}}const c=Je(),u=i.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((h,f)=>c.set(h,f)),!(c.size()>=s)););return w.resolve(c)}wt(e,t,n){const s=this.overlays.get(n.key);if(s!==null){const o=this.kr.get(s.largestBatchId).delete(n.key);this.kr.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(n.key,new hc(t,n));let i=this.kr.get(t);i===void 0&&(i=G(),this.kr.set(t,i)),this.kr.set(t,i.add(n.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uE{constructor(){this.sessionToken=fe.EMPTY_BYTE_STRING}getSessionToken(e){return w.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,w.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gc{constructor(){this.qr=new ne(ye.Qr),this.$r=new ne(ye.Ur)}isEmpty(){return this.qr.isEmpty()}addReference(e,t){const n=new ye(e,t);this.qr=this.qr.add(n),this.$r=this.$r.add(n)}Kr(e,t){e.forEach(n=>this.addReference(n,t))}removeReference(e,t){this.Wr(new ye(e,t))}Gr(e,t){e.forEach(n=>this.removeReference(n,t))}zr(e){const t=new O(new Y([])),n=new ye(t,e),s=new ye(t,e+1),i=[];return this.$r.forEachInRange([n,s],o=>{this.Wr(o),i.push(o.key)}),i}jr(){this.qr.forEach(e=>this.Wr(e))}Wr(e){this.qr=this.qr.delete(e),this.$r=this.$r.delete(e)}Jr(e){const t=new O(new Y([])),n=new ye(t,e),s=new ye(t,e+1);let i=G();return this.$r.forEachInRange([n,s],o=>{i=i.add(o.key)}),i}containsKey(e){const t=new ye(e,0),n=this.qr.firstAfterOrEqual(t);return n!==null&&e.isEqual(n.key)}}class ye{constructor(e,t){this.key=e,this.Hr=t}static Qr(e,t){return O.comparator(e.key,t.key)||$(e.Hr,t.Hr)}static Ur(e,t){return $(e.Hr,t.Hr)||O.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lE{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.er=1,this.Yr=new ne(ye.Qr)}checkEmpty(e){return w.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,n,s){const i=this.er;this.er++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new uc(i,t,n,s);this.mutationQueue.push(o);for(const c of s)this.Yr=this.Yr.add(new ye(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return w.resolve(o)}lookupMutationBatch(e,t){return w.resolve(this.Zr(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=this.Xr(n),i=s<0?0:s;return w.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return w.resolve(this.mutationQueue.length===0?cn:this.er-1)}getAllMutationBatches(e){return w.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new ye(t,0),s=new ye(t,Number.POSITIVE_INFINITY),i=[];return this.Yr.forEachInRange([n,s],o=>{const c=this.Zr(o.Hr);i.push(c)}),w.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new ne($);return t.forEach(s=>{const i=new ye(s,0),o=new ye(s,Number.POSITIVE_INFINITY);this.Yr.forEachInRange([i,o],c=>{n=n.add(c.Hr)})}),w.resolve(this.ei(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1;let i=n;O.isDocumentKey(i)||(i=i.child(""));const o=new ye(new O(i),0);let c=new ne($);return this.Yr.forEachWhile(u=>{const h=u.key.path;return!!n.isPrefixOf(h)&&(h.length===s&&(c=c.add(u.Hr)),!0)},o),w.resolve(this.ei(c))}ei(e){const t=[];return e.forEach(n=>{const s=this.Zr(n);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){U(this.ti(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let n=this.Yr;return w.forEach(t.mutations,s=>{const i=new ye(s.key,t.batchId);return n=n.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.Yr=n})}rr(e){}containsKey(e,t){const n=new ye(t,0),s=this.Yr.firstAfterOrEqual(n);return w.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,w.resolve()}ti(e,t){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){const t=this.Xr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hE{constructor(e){this.ni=e,this.docs=function(){return new ie(O.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,s=this.docs.get(n),i=s?s.size:0,o=this.ni(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return w.resolve(n?n.document.mutableCopy():he.newInvalidDocument(t))}getEntries(e,t){let n=Fe();return t.forEach(s=>{const i=this.docs.get(s);n=n.insert(s,i?i.document.mutableCopy():he.newInvalidDocument(s))}),w.resolve(n)}getDocumentsMatchingQuery(e,t,n,s){let i=Fe();const o=t.path,c=new O(o.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(c);for(;u.hasNext();){const{key:h,value:{document:f}}=u.getNext();if(!o.isPrefixOf(h.path))break;h.path.length>o.length+1||Xa(jd(f),n)<=0||(s.has(f.key)||As(t,f))&&(i=i.insert(f.key,f.mutableCopy()))}return w.resolve(i)}getAllFromCollectionGroup(e,t,n,s){M(9500)}ri(e,t){return w.forEach(this.docs,n=>t(n))}newChangeBuffer(e){return new dE(this)}getSize(e){return w.resolve(this.size)}}class dE extends up{constructor(e){super(),this.Or=e}applyChanges(e){const t=[];return this.changes.forEach((n,s)=>{s.isValidDocument()?t.push(this.Or.addEntry(e,s)):this.Or.removeEntry(n)}),w.waitFor(t)}getFromCache(e,t){return this.Or.getEntry(e,t)}getAllFromCache(e,t){return this.Or.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fE{constructor(e){this.persistence=e,this.ii=new mt(t=>mn(t),ws),this.lastRemoteSnapshotVersion=j.min(),this.highestTargetId=0,this.si=0,this.oi=new gc,this.targetCount=0,this._i=yn.ar()}forEachTarget(e,t){return this.ii.forEach((n,s)=>t(s)),w.resolve()}getLastRemoteSnapshotVersion(e){return w.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return w.resolve(this.si)}allocateTargetId(e){return this.highestTargetId=this._i.next(),w.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.si&&(this.si=t),w.resolve()}hr(e){this.ii.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this._i=new yn(t),this.highestTargetId=t),e.sequenceNumber>this.si&&(this.si=e.sequenceNumber)}addTargetData(e,t){return this.hr(t),this.targetCount+=1,w.resolve()}updateTargetData(e,t){return this.hr(t),w.resolve()}removeTargetData(e,t){return this.ii.delete(t.target),this.oi.zr(t.targetId),this.targetCount-=1,w.resolve()}removeTargets(e,t,n){let s=0;const i=[];return this.ii.forEach((o,c)=>{c.sequenceNumber<=t&&n.get(c.targetId)===null&&(this.ii.delete(o),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)}),w.waitFor(i).next(()=>s)}getTargetCount(e){return w.resolve(this.targetCount)}getTargetData(e,t){const n=this.ii.get(t)||null;return w.resolve(n)}addMatchingKeys(e,t,n){return this.oi.Kr(t,n),w.resolve()}removeMatchingKeys(e,t,n){this.oi.Gr(t,n);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach(o=>{i.push(s.markPotentiallyOrphaned(e,o))}),w.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.oi.zr(t),w.resolve()}getMatchingKeysForTargetId(e,t){const n=this.oi.Jr(t);return w.resolve(n)}containsKey(e,t){return w.resolve(this.oi.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _c{constructor(e,t){this.ai={},this.overlays={},this.ui=new xe(0),this.ci=!1,this.ci=!0,this.li=new uE,this.referenceDelegate=e(this),this.hi=new fE(this),this.indexManager=new YI,this.remoteDocumentCache=function(s){return new hE(s)}(n=>this.referenceDelegate.Pi(n)),this.serializer=new Jf(t),this.Ti=new aE(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ci=!1,Promise.resolve()}get started(){return this.ci}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new cE,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.ai[e.toKey()];return n||(n=new lE(t,this.referenceDelegate),this.ai[e.toKey()]=n),n}getGlobalsCache(){return this.li}getTargetCache(){return this.hi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ti}runTransaction(e,t,n){V("MemoryPersistence","Starting transaction:",e);const s=new pE(this.ui.next());return this.referenceDelegate.Ii(),n(s).next(i=>this.referenceDelegate.di(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Ei(e,t){return w.or(Object.values(this.ai).map(n=>()=>n.containsKey(e,t)))}}class pE extends qd{constructor(e){super(),this.currentSequenceNumber=e}}class ho{constructor(e){this.persistence=e,this.Ai=new gc,this.Ri=null}static Vi(e){return new ho(e)}get mi(){if(this.Ri)return this.Ri;throw M(60996)}addReference(e,t,n){return this.Ai.addReference(n,t),this.mi.delete(n.toString()),w.resolve()}removeReference(e,t,n){return this.Ai.removeReference(n,t),this.mi.add(n.toString()),w.resolve()}markPotentiallyOrphaned(e,t){return this.mi.add(t.toString()),w.resolve()}removeTarget(e,t){this.Ai.zr(t.targetId).forEach(s=>this.mi.add(s.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(i=>this.mi.add(i.toString()))}).next(()=>n.removeTargetData(e,t))}Ii(){this.Ri=new Set}di(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return w.forEach(this.mi,n=>{const s=O.fromPath(n);return this.fi(e,s).next(i=>{i||t.removeEntry(s,j.min())})}).next(()=>(this.Ri=null,t.apply(e)))}updateLimboDocument(e,t){return this.fi(e,t).next(n=>{n?this.mi.delete(t.toString()):this.mi.add(t.toString())})}Pi(e){return 0}fi(e,t){return w.or([()=>w.resolve(this.Ai.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ei(e,t)])}}class Mi{constructor(e,t){this.persistence=e,this.gi=new mt(n=>Pe(n.path),(n,s)=>n.isEqual(s)),this.garbageCollector=cp(this,t)}static Vi(e,t){return new Mi(e,t)}Ii(){}di(e){return w.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}mr(e){const t=this.yr(e);return this.persistence.getTargetCache().getTargetCount(e).next(n=>t.next(s=>n+s))}yr(e){let t=0;return this.gr(e,n=>{t++}).next(()=>t)}gr(e,t){return w.forEach(this.gi,(n,s)=>this.Sr(e,n,s).next(i=>i?w.resolve():t(s)))}removeTargets(e,t,n){return this.persistence.getTargetCache().removeTargets(e,t,n)}removeOrphanedDocuments(e,t){let n=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.ri(e,o=>this.Sr(e,o,t).next(c=>{c||(n++,i.removeEntry(o,j.min()))})).next(()=>i.apply(e)).next(()=>n)}markPotentiallyOrphaned(e,t){return this.gi.set(t,e.currentSequenceNumber),w.resolve()}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,t,n){return this.gi.set(n,e.currentSequenceNumber),w.resolve()}removeReference(e,t,n){return this.gi.set(n,e.currentSequenceNumber),w.resolve()}updateLimboDocument(e,t){return this.gi.set(t,e.currentSequenceNumber),w.resolve()}Pi(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=hi(e.data.value)),t}Sr(e,t,n){return w.or([()=>this.persistence.Ei(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.gi.get(t);return w.resolve(s!==void 0&&s>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mE{constructor(e){this.serializer=e}q(e,t,n,s){const i=new Yi("createOrUpgrade",t);n<1&&s>=1&&(function(u){u.createObjectStore(Ts)}(e),function(u){u.createObjectStore(cs,{keyPath:Dy}),u.createObjectStore(ze,{keyPath:Pl,autoIncrement:!0}).createIndex(on,Cl,{unique:!0}),u.createObjectStore(Kn)}(e),yh(e),function(u){u.createObjectStore(en)}(e));let o=w.resolve();return n<3&&s>=3&&(n!==0&&(function(u){u.deleteObjectStore(Qn),u.deleteObjectStore(Wn),u.deleteObjectStore(un)}(e),yh(e)),o=o.next(()=>function(u){const h=u.store(un),f={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:j.min().toTimestamp(),targetCount:0};return h.put(Ri,f)}(i))),n<4&&s>=4&&(n!==0&&(o=o.next(()=>function(u,h){return h.store(ze).j().next(m=>{u.deleteObjectStore(ze),u.createObjectStore(ze,{keyPath:Pl,autoIncrement:!0}).createIndex(on,Cl,{unique:!0});const g=h.store(ze),S=m.map(C=>g.put(C));return w.waitFor(S)})}(e,i))),o=o.next(()=>{(function(u){u.createObjectStore(Xn,{keyPath:Uy})})(e)})),n<5&&s>=5&&(o=o.next(()=>this.pi(i))),n<6&&s>=6&&(o=o.next(()=>(function(u){u.createObjectStore(us)}(e),this.yi(i)))),n<7&&s>=7&&(o=o.next(()=>this.wi(i))),n<8&&s>=8&&(o=o.next(()=>this.Si(e,i))),n<9&&s>=9&&(o=o.next(()=>{(function(u){u.objectStoreNames.contains("remoteDocumentChanges")&&u.deleteObjectStore("remoteDocumentChanges")})(e)})),n<10&&s>=10&&(o=o.next(()=>this.bi(i))),n<11&&s>=11&&(o=o.next(()=>{(function(u){u.createObjectStore(eo,{keyPath:jy})})(e),function(u){u.createObjectStore(to,{keyPath:$y})}(e)})),n<12&&s>=12&&(o=o.next(()=>{(function(u){const h=u.createObjectStore(no,{keyPath:Qy});h.createIndex(va,Xy,{unique:!1}),h.createIndex(Jd,Jy,{unique:!1})})(e)})),n<13&&s>=13&&(o=o.next(()=>function(u){const h=u.createObjectStore(Si,{keyPath:Ny});h.createIndex(ui,xy),h.createIndex(Kd,Oy)}(e)).next(()=>this.Di(e,i)).next(()=>e.deleteObjectStore(en))),n<14&&s>=14&&(o=o.next(()=>this.Ci(e,i))),n<15&&s>=15&&(o=o.next(()=>function(u){u.createObjectStore(Za,{keyPath:qy,autoIncrement:!0}).createIndex(Ea,zy,{unique:!1}),u.createObjectStore(Qr,{keyPath:Gy}).createIndex(Qd,Hy,{unique:!1}),u.createObjectStore(Xr,{keyPath:Ky}).createIndex(Xd,Wy,{unique:!1})}(e))),n<16&&s>=16&&(o=o.next(()=>{t.objectStore(Qr).clear()}).next(()=>{t.objectStore(Xr).clear()})),n<17&&s>=17&&(o=o.next(()=>{(function(u){u.createObjectStore(ec,{keyPath:Yy})})(e)})),n<18&&s>=18&&bd()&&(o=o.next(()=>{t.objectStore(Qr).clear()}).next(()=>{t.objectStore(Xr).clear()})),o}yi(e){let t=0;return e.store(en).X((n,s)=>{t+=Oi(s)}).next(()=>{const n={byteSize:t};return e.store(us).put(Ia,n)})}pi(e){const t=e.store(cs),n=e.store(ze);return t.j().next(s=>w.forEach(s,i=>{const o=IDBKeyRange.bound([i.userId,cn],[i.userId,i.lastAcknowledgedBatchId]);return n.j(on,o).next(c=>w.forEach(c,u=>{U(u.userId===i.userId,18650,"Cannot process batch from unexpected user",{batchId:u.batchId});const h=nn(this.serializer,u);return rp(e,i.userId,h).next(()=>{})}))}))}wi(e){const t=e.store(Qn),n=e.store(en);return e.store(un).get(Ri).next(s=>{const i=[];return n.X((o,c)=>{const u=new Y(o),h=function(m){return[0,Pe(m)]}(u);i.push(t.get(h).next(f=>f?w.resolve():(m=>t.put({targetId:0,path:Pe(m),sequenceNumber:s.highestListenSequenceNumber}))(u)))}).next(()=>w.waitFor(i))})}Si(e,t){e.createObjectStore(ls,{keyPath:By});const n=t.store(ls),s=new mc,i=o=>{if(s.add(o)){const c=o.lastSegment(),u=o.popLast();return n.put({collectionId:c,parent:Pe(u)})}};return t.store(en).X({Z:!0},(o,c)=>{const u=new Y(o);return i(u.popLast())}).next(()=>t.store(Kn).X({Z:!0},([o,c,u],h)=>{const f=Xe(c);return i(f.popLast())}))}bi(e){const t=e.store(Wn);return t.X((n,s)=>{const i=zr(s),o=Yf(this.serializer,i);return t.put(o)})}Di(e,t){const n=t.store(en),s=[];return n.X((i,o)=>{const c=t.store(Si),u=function(m){return m.document?new O(Y.fromString(m.document.name).popFirst(5)):m.noDocument?O.fromSegments(m.noDocument.path):m.unknownDocument?O.fromSegments(m.unknownDocument.path):M(36783)}(o).path.toArray(),h={prefixPath:u.slice(0,u.length-2),collectionGroup:u[u.length-2],documentId:u[u.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};s.push(c.put(h))}).next(()=>w.waitFor(s))}Ci(e,t){const n=t.store(ze),s=lp(this.serializer),i=new _c(ho.Vi,this.serializer.gt);return n.j().next(o=>{const c=new Map;return o.forEach(u=>{var h;let f=(h=c.get(u.userId))!==null&&h!==void 0?h:G();nn(this.serializer,u).keys().forEach(m=>f=f.add(m)),c.set(u.userId,f)}),w.forEach(c,(u,h)=>{const f=new Ie(h),m=uo.yt(this.serializer,f),g=i.getIndexManager(f),S=lo.yt(f,this.serializer,g,i.referenceDelegate);return new hp(s,S,m,g).recalculateAndSaveOverlaysForDocumentKeys(new Ta(t,xe.ue),u).next()})})}}function yh(r){r.createObjectStore(Qn,{keyPath:Ly}).createIndex(Ya,Fy,{unique:!0}),r.createObjectStore(Wn,{keyPath:"targetId"}).createIndex(Wd,My,{unique:!0}),r.createObjectStore(un)}const Tt="IndexedDbPersistence",ea=18e5,ta=5e3,na="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",gE="main";class yc{constructor(e,t,n,s,i,o,c,u,h,f,m=18){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=n,this.Fi=i,this.window=o,this.document=c,this.Mi=h,this.xi=f,this.Oi=m,this.ui=null,this.ci=!1,this.isPrimary=!1,this.networkEnabled=!0,this.Ni=null,this.inForeground=!1,this.Bi=null,this.Li=null,this.ki=Number.NEGATIVE_INFINITY,this.qi=g=>Promise.resolve(),!yc.C())throw new k(P.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new rE(this,s),this.Qi=t+gE,this.serializer=new Jf(u),this.$i=new xt(this.Qi,this.Oi,new mE(this.serializer)),this.li=new HI,this.hi=new eE(this.referenceDelegate,this.serializer),this.remoteDocumentCache=lp(this.serializer),this.Ti=new GI,this.window&&this.window.localStorage?this.Ui=this.window.localStorage:(this.Ui=null,f===!1&&de(Tt,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.Ki().then(()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new k(P.FAILED_PRECONDITION,na);return this.Wi(),this.Gi(),this.zi(),this.runTransaction("getHighestListenSequenceNumber","readonly",e=>this.hi.getHighestSequenceNumber(e))}).then(e=>{this.ui=new xe(e,this.Mi)}).then(()=>{this.ci=!0}).catch(e=>(this.$i&&this.$i.close(),Promise.reject(e)))}ji(e){return this.qi=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.$i.setDatabaseDeletedListener(e)}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.Fi.enqueueAndForget(async()=>{this.started&&await this.Ki()}))}Ki(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",e=>ri(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next(()=>{if(this.isPrimary)return this.Ji(e).next(t=>{t||(this.isPrimary=!1,this.Fi.enqueueRetryable(()=>this.qi(!1)))})}).next(()=>this.Hi(e)).next(t=>this.isPrimary&&!t?this.Yi(e).next(()=>!1):!!t&&this.Zi(e).next(()=>!0))).catch(e=>{if($t(e))return V(Tt,"Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return V(Tt,"Releasing owner lease after error during lease refresh",e),!1}).then(e=>{this.isPrimary!==e&&this.Fi.enqueueRetryable(()=>this.qi(e)),this.isPrimary=e})}Ji(e){return Ur(e).get(Rn).next(t=>w.resolve(this.Xi(t)))}es(e){return ri(e).delete(this.clientId)}async ts(){if(this.isPrimary&&!this.ns(this.ki,ea)){this.ki=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",t=>{const n=_e(t,Xn);return n.j().next(s=>{const i=this.rs(s,ea),o=s.filter(c=>i.indexOf(c)===-1);return w.forEach(o,c=>n.delete(c.clientId)).next(()=>o)})}).catch(()=>[]);if(this.Ui)for(const t of e)this.Ui.removeItem(this.ss(t.clientId))}}zi(){this.Li=this.Fi.enqueueAfterDelay("client_metadata_refresh",4e3,()=>this.Ki().then(()=>this.ts()).then(()=>this.zi()))}Xi(e){return!!e&&e.ownerId===this.clientId}Hi(e){return this.xi?w.resolve(!0):Ur(e).get(Rn).next(t=>{if(t!==null&&this.ns(t.leaseTimestampMs,ta)&&!this._s(t.ownerId)){if(this.Xi(t)&&this.networkEnabled)return!0;if(!this.Xi(t)){if(!t.allowTabSynchronization)throw new k(P.FAILED_PRECONDITION,na);return!1}}return!(!this.networkEnabled||!this.inForeground)||ri(e).j().next(n=>this.rs(n,ta).find(s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,o=!this.inForeground&&s.inForeground,c=this.networkEnabled===s.networkEnabled;if(i||o&&c)return!0}return!1})===void 0)}).next(t=>(this.isPrimary!==t&&V(Tt,`Client ${t?"is":"is not"} eligible for a primary lease.`),t))}async shutdown(){this.ci=!1,this.us(),this.Li&&(this.Li.cancel(),this.Li=null),this.cs(),this.ls(),await this.$i.runTransaction("shutdown","readwrite",[Ts,Xn],e=>{const t=new Ta(e,xe.ue);return this.Yi(t).next(()=>this.es(t))}),this.$i.close(),this.hs()}rs(e,t){return e.filter(n=>this.ns(n.updateTimeMs,t)&&!this._s(n.clientId))}Ps(){return this.runTransaction("getActiveClients","readonly",e=>ri(e).j().next(t=>this.rs(t,ea).map(n=>n.clientId)))}get started(){return this.ci}getGlobalsCache(){return this.li}getMutationQueue(e,t){return lo.yt(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.hi}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new ZI(e,this.serializer.gt.databaseId)}getDocumentOverlayCache(e){return uo.yt(this.serializer,e)}getBundleCache(){return this.Ti}runTransaction(e,t,n){V(Tt,"Starting transaction:",e);const s=t==="readonly"?"readonly":"readwrite",i=function(u){return u===18?tI:u===17?tf:u===16?eI:u===15?tc:u===14?ef:u===13?Zd:u===12?Zy:u===11?Yd:void M(60245)}(this.Oi);let o;return this.$i.runTransaction(e,s,i,c=>(o=new Ta(c,this.ui?this.ui.next():xe.ue),t==="readwrite-primary"?this.Ji(o).next(u=>!!u||this.Hi(o)).next(u=>{if(!u)throw de(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.Fi.enqueueRetryable(()=>this.qi(!1)),new k(P.FAILED_PRECONDITION,$d);return n(o)}).next(u=>this.Zi(o).next(()=>u)):this.Ts(o).next(()=>n(o)))).then(c=>(o.raiseOnCommittedEvent(),c))}Ts(e){return Ur(e).get(Rn).next(t=>{if(t!==null&&this.ns(t.leaseTimestampMs,ta)&&!this._s(t.ownerId)&&!this.Xi(t)&&!(this.xi||this.allowTabSynchronization&&t.allowTabSynchronization))throw new k(P.FAILED_PRECONDITION,na)})}Zi(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return Ur(e).put(Rn,t)}static C(){return xt.C()}Yi(e){const t=Ur(e);return t.get(Rn).next(n=>this.Xi(n)?(V(Tt,"Releasing primary lease."),t.delete(Rn)):w.resolve())}ns(e,t){const n=Date.now();return!(e<n-t)&&(!(e>n)||(de(`Detected an update time that is in the future: ${e} > ${n}`),!1))}Wi(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.Bi=()=>{this.Fi.enqueueAndForget(()=>(this.inForeground=this.document.visibilityState==="visible",this.Ki()))},this.document.addEventListener("visibilitychange",this.Bi),this.inForeground=this.document.visibilityState==="visible")}cs(){this.Bi&&(this.document.removeEventListener("visibilitychange",this.Bi),this.Bi=null)}Gi(){var e;typeof((e=this.window)===null||e===void 0?void 0:e.addEventListener)=="function"&&(this.Ni=()=>{this.us();const t=/(?:Version|Mobile)\/1[456]/;Ad()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.Fi.enterRestrictedMode(!0),this.Fi.enqueueAndForget(()=>this.shutdown())},this.window.addEventListener("pagehide",this.Ni))}ls(){this.Ni&&(this.window.removeEventListener("pagehide",this.Ni),this.Ni=null)}_s(e){var t;try{const n=((t=this.Ui)===null||t===void 0?void 0:t.getItem(this.ss(e)))!==null;return V(Tt,`Client '${e}' ${n?"is":"is not"} zombied in LocalStorage`),n}catch(n){return de(Tt,"Failed to get zombied client id.",n),!1}}us(){if(this.Ui)try{this.Ui.setItem(this.ss(this.clientId),String(Date.now()))}catch(e){de("Failed to set zombie client id.",e)}}hs(){if(this.Ui)try{this.Ui.removeItem(this.ss(this.clientId))}catch{}}ss(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function Ur(r){return _e(r,Ts)}function ri(r){return _e(r,Xn)}function dp(r,e){let t=r.projectId;return r.isDefaultDatabase||(t+="."+r.database),"firestore/"+e+"/"+t+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ic{constructor(e,t,n,s){this.targetId=e,this.fromCache=t,this.Is=n,this.ds=s}static Es(e,t){let n=G(),s=G();for(const i of t.docChanges)switch(i.type){case 0:n=n.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Ic(e,t.fromCache,n,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _E{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fp{constructor(){this.As=!1,this.Rs=!1,this.Vs=100,this.fs=function(){return Ad()?8:zd(wi())>0?6:4}()}initialize(e,t){this.gs=e,this.indexManager=t,this.As=!0}getDocumentsMatchingQuery(e,t,n,s){const i={result:null};return this.ps(e,t).next(o=>{i.result=o}).next(()=>{if(!i.result)return this.ys(e,t,s,n).next(o=>{i.result=o})}).next(()=>{if(i.result)return;const o=new _E;return this.ws(e,t,o).next(c=>{if(i.result=c,this.Rs)return this.Ss(e,t,o,c.size)})}).next(()=>i.result)}Ss(e,t,n,s){return n.documentReadCount<this.Vs?(Nn()<=X.DEBUG&&V("QueryEngine","SDK will not create cache indexes for query:",xn(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),w.resolve()):(Nn()<=X.DEBUG&&V("QueryEngine","Query:",xn(t),"scans",n.documentReadCount,"local documents and returns",s,"documents as results."),n.documentReadCount>this.fs*s?(Nn()<=X.DEBUG&&V("QueryEngine","The SDK decides to create cache indexes for query:",xn(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Be(t))):w.resolve())}ps(e,t){if($l(t))return w.resolve(null);let n=Be(t);return this.indexManager.getIndexType(e,n).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=Vi(t,null,"F"),n=Be(t)),this.indexManager.getDocumentsMatchingTarget(e,n).next(i=>{const o=G(...i);return this.gs.getDocuments(e,o).next(c=>this.indexManager.getMinOffset(e,n).next(u=>{const h=this.bs(t,c);return this.Ds(t,h,o,u.readTime)?this.ps(e,Vi(t,null,"F")):this.vs(e,h,t,u)}))})))}ys(e,t,n,s){return $l(t)||s.isEqual(j.min())?w.resolve(null):this.gs.getDocuments(e,n).next(i=>{const o=this.bs(t,i);return this.Ds(t,o,n,s)?w.resolve(null):(Nn()<=X.DEBUG&&V("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),xn(t)),this.vs(e,o,t,Ud(s,Hn)).next(c=>c))})}bs(e,t){let n=new ne(Af(e));return t.forEach((s,i)=>{As(e,i)&&(n=n.add(i))}),n}Ds(e,t,n,s){if(e.limit===null)return!1;if(n.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}ws(e,t,n){return Nn()<=X.DEBUG&&V("QueryEngine","Using full collection scan to execute query:",xn(t)),this.gs.getDocumentsMatchingQuery(e,t,Ue.min(),n)}vs(e,t,n,s){return this.gs.getDocumentsMatchingQuery(e,n,s).next(i=>(t.forEach(o=>{i=i.insert(o.key,o)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ec="LocalStore",yE=3e8;class IE{constructor(e,t,n,s){this.persistence=e,this.Cs=t,this.serializer=s,this.Fs=new ie($),this.Ms=new mt(i=>mn(i),ws),this.xs=new Map,this.Os=e.getRemoteDocumentCache(),this.hi=e.getTargetCache(),this.Ti=e.getBundleCache(),this.Ns(n)}Ns(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new hp(this.Os,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Os.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.Fs))}}function pp(r,e,t,n){return new IE(r,e,t,n)}async function mp(r,e){const t=F(r);return await t.persistence.runTransaction("Handle user change","readonly",n=>{let s;return t.mutationQueue.getAllMutationBatches(n).next(i=>(s=i,t.Ns(e),t.mutationQueue.getAllMutationBatches(n))).next(i=>{const o=[],c=[];let u=G();for(const h of s){o.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}for(const h of i){c.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}return t.localDocuments.getDocuments(n,u).next(h=>({Bs:h,removedBatchIds:o,addedBatchIds:c}))})})}function EE(r,e){const t=F(r);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",n=>{const s=e.batch.keys(),i=t.Os.newChangeBuffer({trackRemovals:!0});return function(c,u,h,f){const m=h.batch,g=m.keys();let S=w.resolve();return g.forEach(C=>{S=S.next(()=>f.getEntry(u,C)).next(N=>{const D=h.docVersions.get(C);U(D!==null,48541),N.version.compareTo(D)<0&&(m.applyToRemoteDocument(N,h),N.isValidDocument()&&(N.setReadTime(h.commitVersion),f.addEntry(N)))})}),S.next(()=>c.mutationQueue.removeMutationBatch(u,m))}(t,n,e,i).next(()=>i.apply(n)).next(()=>t.mutationQueue.performConsistencyCheck(n)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(n,s,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,function(c){let u=G();for(let h=0;h<c.mutationResults.length;++h)c.mutationResults[h].transformResults.length>0&&(u=u.add(c.batch.mutations[h].key));return u}(e))).next(()=>t.localDocuments.getDocuments(n,s))})}function gp(r){const e=F(r);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.hi.getLastRemoteSnapshotVersion(t))}function vE(r,e){const t=F(r),n=e.snapshotVersion;let s=t.Fs;return t.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const o=t.Os.newChangeBuffer({trackRemovals:!0});s=t.Fs;const c=[];e.targetChanges.forEach((f,m)=>{const g=s.get(m);if(!g)return;c.push(t.hi.removeMatchingKeys(i,f.removedDocuments,m).next(()=>t.hi.addMatchingKeys(i,f.addedDocuments,m)));let S=g.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(m)!==null?S=S.withResumeToken(fe.EMPTY_BYTE_STRING,j.min()).withLastLimboFreeSnapshotVersion(j.min()):f.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(f.resumeToken,n)),s=s.insert(m,S),function(N,D,z){return N.resumeToken.approximateByteSize()===0||D.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=yE?!0:z.addedDocuments.size+z.modifiedDocuments.size+z.removedDocuments.size>0}(g,S,f)&&c.push(t.hi.updateTargetData(i,S))});let u=Fe(),h=G();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,f))}),c.push(TE(i,o,e.documentUpdates).next(f=>{u=f.Ls,h=f.ks})),!n.isEqual(j.min())){const f=t.hi.getLastRemoteSnapshotVersion(i).next(m=>t.hi.setTargetsMetadata(i,i.currentSequenceNumber,n));c.push(f)}return w.waitFor(c).next(()=>o.apply(i)).next(()=>t.localDocuments.getLocalViewOfDocuments(i,u,h)).next(()=>u)}).then(i=>(t.Fs=s,i))}function TE(r,e,t){let n=G(),s=G();return t.forEach(i=>n=n.add(i)),e.getEntries(r,n).next(i=>{let o=Fe();return t.forEach((c,u)=>{const h=i.get(c);u.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(c)),u.isNoDocument()&&u.version.isEqual(j.min())?(e.removeEntry(c,u.readTime),o=o.insert(c,u)):!h.isValidDocument()||u.version.compareTo(h.version)>0||u.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(u),o=o.insert(c,u)):V(Ec,"Ignoring outdated watch update for ",c,". Current version:",h.version," Watch version:",u.version)}),{Ls:o,ks:s}})}function wE(r,e){const t=F(r);return t.persistence.runTransaction("Get next mutation batch","readonly",n=>(e===void 0&&(e=cn),t.mutationQueue.getNextMutationBatchAfterBatchId(n,e)))}function Li(r,e){const t=F(r);return t.persistence.runTransaction("Allocate target","readwrite",n=>{let s;return t.hi.getTargetData(n,e).next(i=>i?(s=i,w.resolve(s)):t.hi.allocateTargetId(n).next(o=>(s=new at(e,o,"TargetPurposeListen",n.currentSequenceNumber),t.hi.addTargetData(n,s).next(()=>s))))}).then(n=>{const s=t.Fs.get(n.targetId);return(s===null||n.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.Fs=t.Fs.insert(n.targetId,n),t.Ms.set(e,n.targetId)),n})}async function ir(r,e,t){const n=F(r),s=n.Fs.get(e),i=t?"readwrite":"readwrite-primary";try{t||await n.persistence.runTransaction("Release target",i,o=>n.persistence.referenceDelegate.removeTarget(o,s))}catch(o){if(!$t(o))throw o;V(Ec,`Failed to update sequence numbers for target ${e}: ${o}`)}n.Fs=n.Fs.remove(e),n.Ms.delete(s.target)}function Ma(r,e,t){const n=F(r);let s=j.min(),i=G();return n.persistence.runTransaction("Execute query","readwrite",o=>function(u,h,f){const m=F(u),g=m.Ms.get(f);return g!==void 0?w.resolve(m.Fs.get(g)):m.hi.getTargetData(h,f)}(n,o,Be(e)).next(c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,n.hi.getMatchingKeysForTargetId(o,c.targetId).next(u=>{i=u})}).next(()=>n.Cs.getDocumentsMatchingQuery(o,e,t?s:j.min(),t?i:G())).next(c=>(Ip(n,wf(e),c),{documents:c,qs:i})))}function _p(r,e){const t=F(r),n=F(t.hi),s=t.Fs.get(e);return s?Promise.resolve(s.target):t.persistence.runTransaction("Get target data","readonly",i=>n.Et(i,e).next(o=>o?o.target:null))}function yp(r,e){const t=F(r),n=t.xs.get(e)||j.min();return t.persistence.runTransaction("Get new document changes","readonly",s=>t.Os.getAllFromCollectionGroup(s,e,Ud(n,Hn),Number.MAX_SAFE_INTEGER)).then(s=>(Ip(t,e,s),s))}function Ip(r,e,t){let n=r.xs.get(e)||j.min();t.forEach((s,i)=>{i.readTime.compareTo(n)>0&&(n=i.readTime)}),r.xs.set(e,n)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ep="firestore_clients";function Ih(r,e){return`${Ep}_${r}_${e}`}const vp="firestore_mutations";function Eh(r,e,t){let n=`${vp}_${r}_${t}`;return e.isAuthenticated()&&(n+=`_${e.uid}`),n}const Tp="firestore_targets";function ra(r,e){return`${Tp}_${r}_${e}`}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qe="SharedClientState";class Fi{constructor(e,t,n,s){this.user=e,this.batchId=t,this.state=n,this.error=s}static Ks(e,t,n){const s=JSON.parse(n);let i,o=typeof s=="object"&&["pending","acknowledged","rejected"].indexOf(s.state)!==-1&&(s.error===void 0||typeof s.error=="object");return o&&s.error&&(o=typeof s.error.message=="string"&&typeof s.error.code=="string",o&&(i=new k(s.error.code,s.error.message))),o?new Fi(e,t,s.state,i):(de(Qe,`Failed to parse mutation state for ID '${t}': ${n}`),null)}Ws(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class ts{constructor(e,t,n){this.targetId=e,this.state=t,this.error=n}static Ks(e,t){const n=JSON.parse(t);let s,i=typeof n=="object"&&["not-current","current","rejected"].indexOf(n.state)!==-1&&(n.error===void 0||typeof n.error=="object");return i&&n.error&&(i=typeof n.error.message=="string"&&typeof n.error.code=="string",i&&(s=new k(n.error.code,n.error.message))),i?new ts(e,n.state,s):(de(Qe,`Failed to parse target state for ID '${e}': ${t}`),null)}Ws(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class Bi{constructor(e,t){this.clientId=e,this.activeTargetIds=t}static Ks(e,t){const n=JSON.parse(t);let s=typeof n=="object"&&n.activeTargetIds instanceof Array,i=oc();for(let o=0;s&&o<n.activeTargetIds.length;++o)s=Gd(n.activeTargetIds[o]),i=i.add(n.activeTargetIds[o]);return s?new Bi(e,i):(de(Qe,`Failed to parse client data for instance '${e}': ${t}`),null)}}class vc{constructor(e,t){this.clientId=e,this.onlineState=t}static Ks(e){const t=JSON.parse(e);return typeof t=="object"&&["Unknown","Online","Offline"].indexOf(t.onlineState)!==-1&&typeof t.clientId=="string"?new vc(t.clientId,t.onlineState):(de(Qe,`Failed to parse online state: ${e}`),null)}}class La{constructor(){this.activeTargetIds=oc()}Gs(e){this.activeTargetIds=this.activeTargetIds.add(e)}zs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class sa{constructor(e,t,n,s,i){this.window=e,this.Fi=t,this.persistenceKey=n,this.js=s,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.Js=this.Hs.bind(this),this.Ys=new ie($),this.started=!1,this.Zs=[];const o=n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=i,this.Xs=Ih(this.persistenceKey,this.js),this.eo=function(u){return`firestore_sequence_number_${u}`}(this.persistenceKey),this.Ys=this.Ys.insert(this.js,new La),this.no=new RegExp(`^${Ep}_${o}_([^_]*)$`),this.ro=new RegExp(`^${vp}_${o}_(\\d+)(?:_(.*))?$`),this.io=new RegExp(`^${Tp}_${o}_(\\d+)$`),this.so=function(u){return`firestore_online_state_${u}`}(this.persistenceKey),this.oo=function(u){return`firestore_bundle_loaded_v2_${u}`}(this.persistenceKey),this.window.addEventListener("storage",this.Js)}static C(e){return!(!e||!e.localStorage)}async start(){const e=await this.syncEngine.Ps();for(const n of e){if(n===this.js)continue;const s=this.getItem(Ih(this.persistenceKey,n));if(s){const i=Bi.Ks(n,s);i&&(this.Ys=this.Ys.insert(i.clientId,i))}}this._o();const t=this.storage.getItem(this.so);if(t){const n=this.ao(t);n&&this.uo(n)}for(const n of this.Zs)this.Hs(n);this.Zs=[],this.window.addEventListener("pagehide",()=>this.shutdown()),this.started=!0}writeSequenceNumber(e){this.setItem(this.eo,JSON.stringify(e))}getAllActiveQueryTargets(){return this.co(this.Ys)}isActiveQueryTarget(e){let t=!1;return this.Ys.forEach((n,s)=>{s.activeTargetIds.has(e)&&(t=!0)}),t}addPendingMutation(e){this.lo(e,"pending")}updateMutationState(e,t,n){this.lo(e,t,n),this.ho(e)}addLocalQueryTarget(e,t=!0){let n="not-current";if(this.isActiveQueryTarget(e)){const s=this.storage.getItem(ra(this.persistenceKey,e));if(s){const i=ts.Ks(e,s);i&&(n=i.state)}}return t&&this.Po.Gs(e),this._o(),n}removeLocalQueryTarget(e){this.Po.zs(e),this._o()}isLocalQueryTarget(e){return this.Po.activeTargetIds.has(e)}clearQueryState(e){this.removeItem(ra(this.persistenceKey,e))}updateQueryState(e,t,n){this.To(e,t,n)}handleUserChange(e,t,n){t.forEach(s=>{this.ho(s)}),this.currentUser=e,n.forEach(s=>{this.addPendingMutation(s)})}setOnlineState(e){this.Io(e)}notifyBundleLoaded(e){this.Eo(e)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.Js),this.removeItem(this.Xs),this.started=!1)}getItem(e){const t=this.storage.getItem(e);return V(Qe,"READ",e,t),t}setItem(e,t){V(Qe,"SET",e,t),this.storage.setItem(e,t)}removeItem(e){V(Qe,"REMOVE",e),this.storage.removeItem(e)}Hs(e){const t=e;if(t.storageArea===this.storage){if(V(Qe,"EVENT",t.key,t.newValue),t.key===this.Xs)return void de("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.Fi.enqueueRetryable(async()=>{if(this.started){if(t.key!==null){if(this.no.test(t.key)){if(t.newValue==null){const n=this.Ao(t.key);return this.Ro(n,null)}{const n=this.Vo(t.key,t.newValue);if(n)return this.Ro(n.clientId,n)}}else if(this.ro.test(t.key)){if(t.newValue!==null){const n=this.mo(t.key,t.newValue);if(n)return this.fo(n)}}else if(this.io.test(t.key)){if(t.newValue!==null){const n=this.po(t.key,t.newValue);if(n)return this.yo(n)}}else if(t.key===this.so){if(t.newValue!==null){const n=this.ao(t.newValue);if(n)return this.uo(n)}}else if(t.key===this.eo){const n=function(i){let o=xe.ue;if(i!=null)try{const c=JSON.parse(i);U(typeof c=="number",30636,{wo:i}),o=c}catch(c){de(Qe,"Failed to read sequence number from WebStorage",c)}return o}(t.newValue);n!==xe.ue&&this.sequenceNumberHandler(n)}else if(t.key===this.oo){const n=this.So(t.newValue);await Promise.all(n.map(s=>this.syncEngine.bo(s)))}}}else this.Zs.push(t)})}}get Po(){return this.Ys.get(this.js)}_o(){this.setItem(this.Xs,this.Po.Ws())}lo(e,t,n){const s=new Fi(this.currentUser,e,t,n),i=Eh(this.persistenceKey,this.currentUser,e);this.setItem(i,s.Ws())}ho(e){const t=Eh(this.persistenceKey,this.currentUser,e);this.removeItem(t)}Io(e){const t={clientId:this.js,onlineState:e};this.storage.setItem(this.so,JSON.stringify(t))}To(e,t,n){const s=ra(this.persistenceKey,e),i=new ts(e,t,n);this.setItem(s,i.Ws())}Eo(e){const t=JSON.stringify(Array.from(e));this.setItem(this.oo,t)}Ao(e){const t=this.no.exec(e);return t?t[1]:null}Vo(e,t){const n=this.Ao(e);return Bi.Ks(n,t)}mo(e,t){const n=this.ro.exec(e),s=Number(n[1]),i=n[2]!==void 0?n[2]:null;return Fi.Ks(new Ie(i),s,t)}po(e,t){const n=this.io.exec(e),s=Number(n[1]);return ts.Ks(s,t)}ao(e){return vc.Ks(e)}So(e){return JSON.parse(e)}async fo(e){if(e.user.uid===this.currentUser.uid)return this.syncEngine.Do(e.batchId,e.state,e.error);V(Qe,`Ignoring mutation for non-active user ${e.user.uid}`)}yo(e){return this.syncEngine.vo(e.targetId,e.state,e.error)}Ro(e,t){const n=t?this.Ys.insert(e,t):this.Ys.remove(e),s=this.co(this.Ys),i=this.co(n),o=[],c=[];return i.forEach(u=>{s.has(u)||o.push(u)}),s.forEach(u=>{i.has(u)||c.push(u)}),this.syncEngine.Co(o,c).then(()=>{this.Ys=n})}uo(e){this.Ys.get(e.clientId)&&this.onlineStateHandler(e.onlineState)}co(e){let t=oc();return e.forEach((n,s)=>{t=t.unionWith(s.activeTargetIds)}),t}}class wp{constructor(){this.Fo=new La,this.Mo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.Fo.Gs(e),this.Mo[e]||"not-current"}updateQueryState(e,t,n){this.Mo[e]=t}removeLocalQueryTarget(e){this.Fo.zs(e)}isLocalQueryTarget(e){return this.Fo.activeTargetIds.has(e)}clearQueryState(e){delete this.Mo[e]}getAllActiveQueryTargets(){return this.Fo.activeTargetIds}isActiveQueryTarget(e){return this.Fo.activeTargetIds.has(e)}start(){return this.Fo=new La,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AE{xo(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vh="ConnectivityMonitor";class Th{constructor(){this.Oo=()=>this.No(),this.Bo=()=>this.Lo(),this.ko=[],this.qo()}xo(e){this.ko.push(e)}shutdown(){window.removeEventListener("online",this.Oo),window.removeEventListener("offline",this.Bo)}qo(){window.addEventListener("online",this.Oo),window.addEventListener("offline",this.Bo)}No(){V(vh,"Network connectivity changed: AVAILABLE");for(const e of this.ko)e(0)}Lo(){V(vh,"Network connectivity changed: UNAVAILABLE");for(const e of this.ko)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let si=null;function Fa(){return si===null?si=function(){return 268435456+Math.round(2147483648*Math.random())}():si++,"0x"+si.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ia="RestConnection",bE={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class SE{get Qo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.$o=t+"://"+e.host,this.Uo=`projects/${n}/databases/${s}`,this.Ko=this.databaseId.database===ds?`project_id=${n}`:`project_id=${n}&database_id=${s}`}Wo(e,t,n,s,i){const o=Fa(),c=this.Go(e,t.toUriEncodedString());V(ia,`Sending RPC '${e}' ${o}:`,c,n);const u={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.Ko};this.zo(u,s,i);const{host:h}=new URL(c),f=Xi(h);return this.jo(e,c,u,n,f).then(m=>(V(ia,`Received RPC '${e}' ${o}: `,m),m),m=>{throw ht(ia,`RPC '${e}' ${o} failed with error: `,m,"url: ",c,"request:",n),m})}Jo(e,t,n,s,i,o){return this.Wo(e,t,n,s,i)}zo(e,t,n){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+hr}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((s,i)=>e[i]=s),n&&n.headers.forEach((s,i)=>e[i]=s)}Go(e,t){const n=bE[e];return`${this.$o}/v1/${t}:${n}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RE{constructor(e){this.Ho=e.Ho,this.Yo=e.Yo}Zo(e){this.Xo=e}e_(e){this.t_=e}n_(e){this.r_=e}onMessage(e){this.i_=e}close(){this.Yo()}send(e){this.Ho(e)}s_(){this.Xo()}o_(){this.t_()}__(e){this.r_(e)}a_(e){this.i_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Se="WebChannelConnection";class PE extends SE{constructor(e){super(e),this.u_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}jo(e,t,n,s,i){const o=Fa();return new Promise((c,u)=>{const h=new Cd;h.setWithCredentials(!0),h.listenOnce(Vd.COMPLETE,()=>{try{switch(h.getLastErrorCode()){case oi.NO_ERROR:const m=h.getResponseJson();V(Se,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(m)),c(m);break;case oi.TIMEOUT:V(Se,`RPC '${e}' ${o} timed out`),u(new k(P.DEADLINE_EXCEEDED,"Request time out"));break;case oi.HTTP_ERROR:const g=h.getStatus();if(V(Se,`RPC '${e}' ${o} failed with status:`,g,"response text:",h.getResponseText()),g>0){let S=h.getResponseJson();Array.isArray(S)&&(S=S[0]);const C=S==null?void 0:S.error;if(C&&C.status&&C.message){const N=function(z){const B=z.toLowerCase().replace(/_/g,"-");return Object.values(P).indexOf(B)>=0?B:P.UNKNOWN}(C.status);u(new k(N,C.message))}else u(new k(P.UNKNOWN,"Server responded with status "+h.getStatus()))}else u(new k(P.UNAVAILABLE,"Connection failed."));break;default:M(9055,{c_:e,streamId:o,l_:h.getLastErrorCode(),h_:h.getLastError()})}}finally{V(Se,`RPC '${e}' ${o} completed.`)}});const f=JSON.stringify(s);V(Se,`RPC '${e}' ${o} sending request:`,s),h.send(t,"POST",f,n,15)})}P_(e,t,n){const s=Fa(),i=[this.$o,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=Nd(),c=kd(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(u.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(u.useFetchStreams=!0),this.zo(u.initMessageHeaders,t,n),u.encodeInitMessageHeaders=!0;const f=i.join("");V(Se,`Creating RPC '${e}' stream ${s}: ${f}`,u);const m=o.createWebChannel(f,u);this.T_(m);let g=!1,S=!1;const C=new RE({Ho:D=>{S?V(Se,`Not sending because RPC '${e}' stream ${s} is closed:`,D):(g||(V(Se,`Opening RPC '${e}' stream ${s} transport.`),m.open(),g=!0),V(Se,`RPC '${e}' stream ${s} sending:`,D),m.send(D))},Yo:()=>m.close()}),N=(D,z,B)=>{D.listen(z,L=>{try{B(L)}catch(H){setTimeout(()=>{throw H},0)}})};return N(m,jr.EventType.OPEN,()=>{S||(V(Se,`RPC '${e}' stream ${s} transport opened.`),C.s_())}),N(m,jr.EventType.CLOSE,()=>{S||(S=!0,V(Se,`RPC '${e}' stream ${s} transport closed`),C.__(),this.I_(m))}),N(m,jr.EventType.ERROR,D=>{S||(S=!0,ht(Se,`RPC '${e}' stream ${s} transport errored. Name:`,D.name,"Message:",D.message),C.__(new k(P.UNAVAILABLE,"The operation could not be completed")))}),N(m,jr.EventType.MESSAGE,D=>{var z;if(!S){const B=D.data[0];U(!!B,16349);const L=B,H=(L==null?void 0:L.error)||((z=L[0])===null||z===void 0?void 0:z.error);if(H){V(Se,`RPC '${e}' stream ${s} received error:`,H);const Z=H.status;let K=function(I){const v=pe[I];if(v!==void 0)return Lf(v)}(Z),E=H.message;K===void 0&&(K=P.INTERNAL,E="Unknown error status: "+Z+" with message "+H.message),S=!0,C.__(new k(K,E)),m.close()}else V(Se,`RPC '${e}' stream ${s} received:`,B),C.a_(B)}}),N(c,Dd.STAT_EVENT,D=>{D.stat===ga.PROXY?V(Se,`RPC '${e}' stream ${s} detected buffering proxy`):D.stat===ga.NOPROXY&&V(Se,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{C.o_()},0),C}terminate(){this.u_.forEach(e=>e.close()),this.u_=[]}T_(e){this.u_.push(e)}I_(e){this.u_=this.u_.filter(t=>t===e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ap(){return typeof window<"u"?window:null}function gi(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fo(r){return new xI(r,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bp{constructor(e,t,n=1e3,s=1.5,i=6e4){this.Fi=e,this.timerId=t,this.d_=n,this.E_=s,this.A_=i,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(e){this.cancel();const t=Math.floor(this.R_+this.p_()),n=Math.max(0,Date.now()-this.m_),s=Math.max(0,t-n);s>0&&V("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.R_} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,s,()=>(this.m_=Date.now(),e())),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){this.V_!==null&&(this.V_.skipDelay(),this.V_=null)}cancel(){this.V_!==null&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wh="PersistentStream";class Sp{constructor(e,t,n,s,i,o,c,u){this.Fi=e,this.w_=n,this.S_=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=c,this.listener=u,this.state=0,this.b_=0,this.D_=null,this.v_=null,this.stream=null,this.C_=0,this.F_=new bp(e,t)}M_(){return this.state===1||this.state===5||this.x_()}x_(){return this.state===2||this.state===3}start(){this.C_=0,this.state!==4?this.auth():this.O_()}async stop(){this.M_()&&await this.close(0)}N_(){this.state=0,this.F_.reset()}B_(){this.x_()&&this.D_===null&&(this.D_=this.Fi.enqueueAfterDelay(this.w_,6e4,()=>this.L_()))}k_(e){this.q_(),this.stream.send(e)}async L_(){if(this.x_())return this.close(0)}q_(){this.D_&&(this.D_.cancel(),this.D_=null)}Q_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.q_(),this.Q_(),this.F_.cancel(),this.b_++,e!==4?this.F_.reset():t&&t.code===P.RESOURCE_EXHAUSTED?(de(t.toString()),de("Using maximum backoff delay to prevent overloading the backend."),this.F_.f_()):t&&t.code===P.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.U_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.n_(t)}U_(){}auth(){this.state=1;const e=this.K_(this.b_),t=this.b_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([n,s])=>{this.b_===t&&this.W_(n,s)},n=>{e(()=>{const s=new k(P.UNKNOWN,"Fetching auth token failed: "+n.message);return this.G_(s)})})}W_(e,t){const n=this.K_(this.b_);this.stream=this.z_(e,t),this.stream.Zo(()=>{n(()=>this.listener.Zo())}),this.stream.e_(()=>{n(()=>(this.state=2,this.v_=this.Fi.enqueueAfterDelay(this.S_,1e4,()=>(this.x_()&&(this.state=3),Promise.resolve())),this.listener.e_()))}),this.stream.n_(s=>{n(()=>this.G_(s))}),this.stream.onMessage(s=>{n(()=>++this.C_==1?this.j_(s):this.onNext(s))})}O_(){this.state=5,this.F_.g_(async()=>{this.state=0,this.start()})}G_(e){return V(wh,`close with error: ${e}`),this.stream=null,this.close(4,e)}K_(e){return t=>{this.Fi.enqueueAndForget(()=>this.b_===e?t():(V(wh,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class CE extends Sp{constructor(e,t,n,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,s,o),this.serializer=i}z_(e,t){return this.connection.P_("Listen",e,t)}j_(e){return this.onNext(e)}onNext(e){this.F_.reset();const t=LI(this.serializer,e),n=function(i){if(!("targetChange"in i))return j.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?j.min():o.readTime?De(o.readTime):j.min()}(e);return this.listener.J_(t,n)}H_(e){const t={};t.database=Da(this.serializer),t.addTarget=function(i,o){let c;const u=o.target;if(c=Pi(u)?{documents:Gf(i,u)}:{query:Hf(i,u).Vt},c.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){c.resumeToken=Uf(i,o.resumeToken);const h=Ca(i,o.expectedCount);h!==null&&(c.expectedCount=h)}else if(o.snapshotVersion.compareTo(j.min())>0){c.readTime=sr(i,o.snapshotVersion.toTimestamp());const h=Ca(i,o.expectedCount);h!==null&&(c.expectedCount=h)}return c}(this.serializer,e);const n=BI(this.serializer,e);n&&(t.labels=n),this.k_(t)}Y_(e){const t={};t.database=Da(this.serializer),t.removeTarget=e,this.k_(t)}}class VE extends Sp{constructor(e,t,n,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,s,o),this.serializer=i}get Z_(){return this.C_>0}start(){this.lastStreamToken=void 0,super.start()}U_(){this.Z_&&this.X_([])}z_(e,t){return this.connection.P_("Write",e,t)}j_(e){return U(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,U(!e.writeResults||e.writeResults.length===0,55816),this.listener.ea()}onNext(e){U(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.F_.reset();const t=FI(e.writeResults,e.commitTime),n=De(e.commitTime);return this.listener.ta(n,t)}na(){const e={};e.database=Da(this.serializer),this.k_(e)}X_(e){const t={streamToken:this.lastStreamToken,writes:e.map(n=>ki(this.serializer,n))};this.k_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DE{}class kE extends DE{constructor(e,t,n,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=s,this.ra=!1}ia(){if(this.ra)throw new k(P.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,t,n,s){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.Wo(e,Va(t,n),s,i,o)).catch(i=>{throw i.name==="FirebaseError"?(i.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new k(P.UNKNOWN,i.toString())})}Jo(e,t,n,s,i){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,c])=>this.connection.Jo(e,Va(t,n),s,o,c,i)).catch(o=>{throw o.name==="FirebaseError"?(o.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new k(P.UNKNOWN,o.toString())})}terminate(){this.ra=!0,this.connection.terminate()}}class NE{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.sa=0,this.oa=null,this._a=!0}aa(){this.sa===0&&(this.ua("Unknown"),this.oa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.oa=null,this.ca("Backend didn't respond within 10 seconds."),this.ua("Offline"),Promise.resolve())))}la(e){this.state==="Online"?this.ua("Unknown"):(this.sa++,this.sa>=1&&(this.ha(),this.ca(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ua("Offline")))}set(e){this.ha(),this.sa=0,e==="Online"&&(this._a=!1),this.ua(e)}ua(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ca(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this._a?(de(t),this._a=!1):V("OnlineStateTracker",t)}ha(){this.oa!==null&&(this.oa.cancel(),this.oa=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const In="RemoteStore";class xE{constructor(e,t,n,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.Pa=[],this.Ta=new Map,this.Ia=new Set,this.da=[],this.Ea=i,this.Ea.xo(o=>{n.enqueueAndForget(async()=>{Tn(this)&&(V(In,"Restarting streams for network reachability change."),await async function(u){const h=F(u);h.Ia.add(4),await Rs(h),h.Aa.set("Unknown"),h.Ia.delete(4),await po(h)}(this))})}),this.Aa=new NE(n,s)}}async function po(r){if(Tn(r))for(const e of r.da)await e(!0)}async function Rs(r){for(const e of r.da)await e(!1)}function mo(r,e){const t=F(r);t.Ta.has(e.targetId)||(t.Ta.set(e.targetId,e),Ac(t)?wc(t):mr(t).x_()&&Tc(t,e))}function or(r,e){const t=F(r),n=mr(t);t.Ta.delete(e),n.x_()&&Rp(t,e),t.Ta.size===0&&(n.x_()?n.B_():Tn(t)&&t.Aa.set("Unknown"))}function Tc(r,e){if(r.Ra.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(j.min())>0){const t=r.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}mr(r).H_(e)}function Rp(r,e){r.Ra.$e(e),mr(r).Y_(e)}function wc(r){r.Ra=new VI({getRemoteKeysForTarget:e=>r.remoteSyncer.getRemoteKeysForTarget(e),Et:e=>r.Ta.get(e)||null,lt:()=>r.datastore.serializer.databaseId}),mr(r).start(),r.Aa.aa()}function Ac(r){return Tn(r)&&!mr(r).M_()&&r.Ta.size>0}function Tn(r){return F(r).Ia.size===0}function Pp(r){r.Ra=void 0}async function OE(r){r.Aa.set("Online")}async function ME(r){r.Ta.forEach((e,t)=>{Tc(r,e)})}async function LE(r,e){Pp(r),Ac(r)?(r.Aa.la(e),wc(r)):r.Aa.set("Unknown")}async function FE(r,e,t){if(r.Aa.set("Online"),e instanceof Bf&&e.state===2&&e.cause)try{await async function(s,i){const o=i.cause;for(const c of i.targetIds)s.Ta.has(c)&&(await s.remoteSyncer.rejectListen(c,o),s.Ta.delete(c),s.Ra.removeTarget(c))}(r,e)}catch(n){V(In,"Failed to remove targets %s: %s ",e.targetIds.join(","),n),await Ui(r,n)}else if(e instanceof pi?r.Ra.Ye(e):e instanceof Ff?r.Ra.it(e):r.Ra.et(e),!t.isEqual(j.min()))try{const n=await gp(r.localStore);t.compareTo(n)>=0&&await function(i,o){const c=i.Ra.Pt(o);return c.targetChanges.forEach((u,h)=>{if(u.resumeToken.approximateByteSize()>0){const f=i.Ta.get(h);f&&i.Ta.set(h,f.withResumeToken(u.resumeToken,o))}}),c.targetMismatches.forEach((u,h)=>{const f=i.Ta.get(u);if(!f)return;i.Ta.set(u,f.withResumeToken(fe.EMPTY_BYTE_STRING,f.snapshotVersion)),Rp(i,u);const m=new at(f.target,u,h,f.sequenceNumber);Tc(i,m)}),i.remoteSyncer.applyRemoteEvent(c)}(r,t)}catch(n){V(In,"Failed to raise snapshot:",n),await Ui(r,n)}}async function Ui(r,e,t){if(!$t(e))throw e;r.Ia.add(1),await Rs(r),r.Aa.set("Offline"),t||(t=()=>gp(r.localStore)),r.asyncQueue.enqueueRetryable(async()=>{V(In,"Retrying IndexedDB access"),await t(),r.Ia.delete(1),await po(r)})}function Cp(r,e){return e().catch(t=>Ui(r,t,e))}async function pr(r){const e=F(r),t=Bt(e);let n=e.Pa.length>0?e.Pa[e.Pa.length-1].batchId:cn;for(;BE(e);)try{const s=await wE(e.localStore,n);if(s===null){e.Pa.length===0&&t.B_();break}n=s.batchId,UE(e,s)}catch(s){await Ui(e,s)}Vp(e)&&Dp(e)}function BE(r){return Tn(r)&&r.Pa.length<10}function UE(r,e){r.Pa.push(e);const t=Bt(r);t.x_()&&t.Z_&&t.X_(e.mutations)}function Vp(r){return Tn(r)&&!Bt(r).M_()&&r.Pa.length>0}function Dp(r){Bt(r).start()}async function jE(r){Bt(r).na()}async function $E(r){const e=Bt(r);for(const t of r.Pa)e.X_(t.mutations)}async function qE(r,e,t){const n=r.Pa.shift(),s=lc.from(n,e,t);await Cp(r,()=>r.remoteSyncer.applySuccessfulWrite(s)),await pr(r)}async function zE(r,e){e&&Bt(r).Z_&&await async function(n,s){if(function(o){return PI(o)&&o!==P.ABORTED}(s.code)){const i=n.Pa.shift();Bt(n).N_(),await Cp(n,()=>n.remoteSyncer.rejectFailedWrite(i.batchId,s)),await pr(n)}}(r,e),Vp(r)&&Dp(r)}async function Ah(r,e){const t=F(r);t.asyncQueue.verifyOperationInProgress(),V(In,"RemoteStore received new credentials");const n=Tn(t);t.Ia.add(3),await Rs(t),n&&t.Aa.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.Ia.delete(3),await po(t)}async function Ba(r,e){const t=F(r);e?(t.Ia.delete(2),await po(t)):e||(t.Ia.add(2),await Rs(t),t.Aa.set("Unknown"))}function mr(r){return r.Va||(r.Va=function(t,n,s){const i=F(t);return i.ia(),new CE(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(r.datastore,r.asyncQueue,{Zo:OE.bind(null,r),e_:ME.bind(null,r),n_:LE.bind(null,r),J_:FE.bind(null,r)}),r.da.push(async e=>{e?(r.Va.N_(),Ac(r)?wc(r):r.Aa.set("Unknown")):(await r.Va.stop(),Pp(r))})),r.Va}function Bt(r){return r.ma||(r.ma=function(t,n,s){const i=F(t);return i.ia(),new VE(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(r.datastore,r.asyncQueue,{Zo:()=>Promise.resolve(),e_:jE.bind(null,r),n_:zE.bind(null,r),ea:$E.bind(null,r),ta:qE.bind(null,r)}),r.da.push(async e=>{e?(r.ma.N_(),await pr(r)):(await r.ma.stop(),r.Pa.length>0&&(V(In,`Stopping write stream with ${r.Pa.length} pending writes`),r.Pa=[]))})),r.ma}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bc{constructor(e,t,n,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=s,this.removalCallback=i,this.deferred=new Ye,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,s,i){const o=Date.now()+n,c=new bc(e,t,o,s,i);return c.start(n),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new k(P.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Sc(r,e){if(de("AsyncQueue",`${e}: ${r}`),$t(r))return new k(P.UNAVAILABLE,`${e}: ${r}`);throw r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fn{static emptySet(e){return new Fn(e.comparator)}constructor(e){this.comparator=e?(t,n)=>e(t,n)||O.comparator(t.key,n.key):(t,n)=>O.comparator(t.key,n.key),this.keyedMap=$r(),this.sortedSet=new ie(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,n)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Fn)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const n=new Fn;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bh{constructor(){this.fa=new ie(O.comparator)}track(e){const t=e.doc.key,n=this.fa.get(t);n?e.type!==0&&n.type===3?this.fa=this.fa.insert(t,e):e.type===3&&n.type!==1?this.fa=this.fa.insert(t,{type:n.type,doc:e.doc}):e.type===2&&n.type===2?this.fa=this.fa.insert(t,{type:2,doc:e.doc}):e.type===2&&n.type===0?this.fa=this.fa.insert(t,{type:0,doc:e.doc}):e.type===1&&n.type===0?this.fa=this.fa.remove(t):e.type===1&&n.type===2?this.fa=this.fa.insert(t,{type:1,doc:n.doc}):e.type===0&&n.type===1?this.fa=this.fa.insert(t,{type:2,doc:e.doc}):M(63341,{At:e,ga:n}):this.fa=this.fa.insert(t,e)}pa(){const e=[];return this.fa.inorderTraversal((t,n)=>{e.push(n)}),e}}class ar{constructor(e,t,n,s,i,o,c,u,h){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=c,this.excludesMetadataChanges=u,this.hasCachedResults=h}static fromInitialDocuments(e,t,n,s,i){const o=[];return t.forEach(c=>{o.push({type:0,doc:c})}),new ar(e,t,Fn.emptySet(t),o,n,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&oo(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==n[s].type||!t[s].doc.isEqual(n[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GE{constructor(){this.ya=void 0,this.wa=[]}Sa(){return this.wa.some(e=>e.ba())}}class HE{constructor(){this.queries=Sh(),this.onlineState="Unknown",this.Da=new Set}terminate(){(function(t,n){const s=F(t),i=s.queries;s.queries=Sh(),i.forEach((o,c)=>{for(const u of c.wa)u.onError(n)})})(this,new k(P.ABORTED,"Firestore shutting down"))}}function Sh(){return new mt(r=>Tf(r),oo)}async function kp(r,e){const t=F(r);let n=3;const s=e.query;let i=t.queries.get(s);i?!i.Sa()&&e.ba()&&(n=2):(i=new GE,n=e.ba()?0:1);try{switch(n){case 0:i.ya=await t.onListen(s,!0);break;case 1:i.ya=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const c=Sc(o,`Initialization of query '${xn(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,i),i.wa.push(e),e.va(t.onlineState),i.ya&&e.Ca(i.ya)&&Rc(t)}async function Np(r,e){const t=F(r),n=e.query;let s=3;const i=t.queries.get(n);if(i){const o=i.wa.indexOf(e);o>=0&&(i.wa.splice(o,1),i.wa.length===0?s=e.ba()?0:1:!i.Sa()&&e.ba()&&(s=2))}switch(s){case 0:return t.queries.delete(n),t.onUnlisten(n,!0);case 1:return t.queries.delete(n),t.onUnlisten(n,!1);case 2:return t.onLastRemoteStoreUnlisten(n);default:return}}function KE(r,e){const t=F(r);let n=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const c of o.wa)c.Ca(s)&&(n=!0);o.ya=s}}n&&Rc(t)}function WE(r,e,t){const n=F(r),s=n.queries.get(e);if(s)for(const i of s.wa)i.onError(t);n.queries.delete(e)}function Rc(r){r.Da.forEach(e=>{e.next()})}var Ua,Rh;(Rh=Ua||(Ua={})).Fa="default",Rh.Cache="cache";class xp{constructor(e,t,n){this.query=e,this.Ma=t,this.xa=!1,this.Oa=null,this.onlineState="Unknown",this.options=n||{}}Ca(e){if(!this.options.includeMetadataChanges){const n=[];for(const s of e.docChanges)s.type!==3&&n.push(s);e=new ar(e.query,e.docs,e.oldDocs,n,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.xa?this.Na(e)&&(this.Ma.next(e),t=!0):this.Ba(e,this.onlineState)&&(this.La(e),t=!0),this.Oa=e,t}onError(e){this.Ma.error(e)}va(e){this.onlineState=e;let t=!1;return this.Oa&&!this.xa&&this.Ba(this.Oa,e)&&(this.La(this.Oa),t=!0),t}Ba(e,t){if(!e.fromCache||!this.ba())return!0;const n=t!=="Offline";return(!this.options.ka||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Na(e){if(e.docChanges.length>0)return!0;const t=this.Oa&&this.Oa.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}La(e){e=ar.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.xa=!0,this.Ma.next(e)}ba(){return this.options.source!==Ua.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Op{constructor(e){this.key=e}}class Mp{constructor(e){this.key=e}}class QE{constructor(e,t){this.query=e,this.Ha=t,this.Ya=null,this.hasCachedResults=!1,this.current=!1,this.Za=G(),this.mutatedKeys=G(),this.Xa=Af(e),this.eu=new Fn(this.Xa)}get tu(){return this.Ha}nu(e,t){const n=t?t.ru:new bh,s=t?t.eu:this.eu;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,c=!1;const u=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,h=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((f,m)=>{const g=s.get(f),S=As(this.query,m)?m:null,C=!!g&&this.mutatedKeys.has(g.key),N=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations);let D=!1;g&&S?g.data.isEqual(S.data)?C!==N&&(n.track({type:3,doc:S}),D=!0):this.iu(g,S)||(n.track({type:2,doc:S}),D=!0,(u&&this.Xa(S,u)>0||h&&this.Xa(S,h)<0)&&(c=!0)):!g&&S?(n.track({type:0,doc:S}),D=!0):g&&!S&&(n.track({type:1,doc:g}),D=!0,(u||h)&&(c=!0)),D&&(S?(o=o.add(S),i=N?i.add(f):i.delete(f)):(o=o.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const f=this.query.limitType==="F"?o.last():o.first();o=o.delete(f.key),i=i.delete(f.key),n.track({type:1,doc:f})}return{eu:o,ru:n,Ds:c,mutatedKeys:i}}iu(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,s){const i=this.eu;this.eu=e.eu,this.mutatedKeys=e.mutatedKeys;const o=e.ru.pa();o.sort((f,m)=>function(S,C){const N=D=>{switch(D){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return M(20277,{At:D})}};return N(S)-N(C)}(f.type,m.type)||this.Xa(f.doc,m.doc)),this.su(n),s=s!=null&&s;const c=t&&!s?this.ou():[],u=this.Za.size===0&&this.current&&!s?1:0,h=u!==this.Ya;return this.Ya=u,o.length!==0||h?{snapshot:new ar(this.query,e.eu,i,o,e.mutatedKeys,u===0,h,!1,!!n&&n.resumeToken.approximateByteSize()>0),_u:c}:{_u:c}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({eu:this.eu,ru:new bh,mutatedKeys:this.mutatedKeys,Ds:!1},!1)):{_u:[]}}au(e){return!this.Ha.has(e)&&!!this.eu.has(e)&&!this.eu.get(e).hasLocalMutations}su(e){e&&(e.addedDocuments.forEach(t=>this.Ha=this.Ha.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ha=this.Ha.delete(t)),this.current=e.current)}ou(){if(!this.current)return[];const e=this.Za;this.Za=G(),this.eu.forEach(n=>{this.au(n.key)&&(this.Za=this.Za.add(n.key))});const t=[];return e.forEach(n=>{this.Za.has(n)||t.push(new Mp(n))}),this.Za.forEach(n=>{e.has(n)||t.push(new Op(n))}),t}uu(e){this.Ha=e.qs,this.Za=G();const t=this.nu(e.documents);return this.applyChanges(t,!0)}cu(){return ar.fromInitialDocuments(this.query,this.eu,this.mutatedKeys,this.Ya===0,this.hasCachedResults)}}const gr="SyncEngine";class XE{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class JE{constructor(e){this.key=e,this.lu=!1}}class YE{constructor(e,t,n,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.hu={},this.Pu=new mt(c=>Tf(c),oo),this.Tu=new Map,this.Iu=new Set,this.du=new ie(O.comparator),this.Eu=new Map,this.Au=new gc,this.Ru={},this.Vu=new Map,this.mu=yn.ur(),this.onlineState="Unknown",this.fu=void 0}get isPrimaryClient(){return this.fu===!0}}async function ZE(r,e,t=!0){const n=go(r);let s;const i=n.Pu.get(e);return i?(n.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.cu()):s=await Lp(n,e,t,!0),s}async function ev(r,e){const t=go(r);await Lp(t,e,!0,!1)}async function Lp(r,e,t,n){const s=await Li(r.localStore,Be(e)),i=s.targetId,o=r.sharedClientState.addLocalQueryTarget(i,t);let c;return n&&(c=await Pc(r,e,i,o==="current",s.resumeToken)),r.isPrimaryClient&&t&&mo(r.remoteStore,s),c}async function Pc(r,e,t,n,s){r.gu=(m,g,S)=>async function(N,D,z,B){let L=D.view.nu(z);L.Ds&&(L=await Ma(N.localStore,D.query,!1).then(({documents:E})=>D.view.nu(E,L)));const H=B&&B.targetChanges.get(D.targetId),Z=B&&B.targetMismatches.get(D.targetId)!=null,K=D.view.applyChanges(L,N.isPrimaryClient,H,Z);return ja(N,D.targetId,K._u),K.snapshot}(r,m,g,S);const i=await Ma(r.localStore,e,!0),o=new QE(e,i.qs),c=o.nu(i.documents),u=Ss.createSynthesizedTargetChangeForCurrentChange(t,n&&r.onlineState!=="Offline",s),h=o.applyChanges(c,r.isPrimaryClient,u);ja(r,t,h._u);const f=new XE(e,t,o);return r.Pu.set(e,f),r.Tu.has(t)?r.Tu.get(t).push(e):r.Tu.set(t,[e]),h.snapshot}async function tv(r,e,t){const n=F(r),s=n.Pu.get(e),i=n.Tu.get(s.targetId);if(i.length>1)return n.Tu.set(s.targetId,i.filter(o=>!oo(o,e))),void n.Pu.delete(e);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(s.targetId),n.sharedClientState.isActiveQueryTarget(s.targetId)||await ir(n.localStore,s.targetId,!1).then(()=>{n.sharedClientState.clearQueryState(s.targetId),t&&or(n.remoteStore,s.targetId),cr(n,s.targetId)}).catch(jt)):(cr(n,s.targetId),await ir(n.localStore,s.targetId,!0))}async function nv(r,e){const t=F(r),n=t.Pu.get(e),s=t.Tu.get(n.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(n.targetId),or(t.remoteStore,n.targetId))}async function rv(r,e,t){const n=kc(r);try{const s=await function(o,c){const u=F(o),h=ee.now(),f=c.reduce((S,C)=>S.add(C.key),G());let m,g;return u.persistence.runTransaction("Locally write mutations","readwrite",S=>{let C=Fe(),N=G();return u.Os.getEntries(S,f).next(D=>{C=D,C.forEach((z,B)=>{B.isValidDocument()||(N=N.add(z))})}).next(()=>u.localDocuments.getOverlayedDocuments(S,C)).next(D=>{m=D;const z=[];for(const B of c){const L=SI(B,m.get(B.key).overlayedDocument);L!=null&&z.push(new qt(B.key,L,df(L.value.mapValue),Oe.exists(!0)))}return u.mutationQueue.addMutationBatch(S,h,z,c)}).next(D=>{g=D;const z=D.applyToLocalDocumentSet(m,N);return u.documentOverlayCache.saveOverlays(S,D.batchId,z)})}).then(()=>({batchId:g.batchId,changes:Sf(m)}))}(n.localStore,e);n.sharedClientState.addPendingMutation(s.batchId),function(o,c,u){let h=o.Ru[o.currentUser.toKey()];h||(h=new ie($)),h=h.insert(c,u),o.Ru[o.currentUser.toKey()]=h}(n,s.batchId,t),await zt(n,s.changes),await pr(n.remoteStore)}catch(s){const i=Sc(s,"Failed to persist write");t.reject(i)}}async function Fp(r,e){const t=F(r);try{const n=await vE(t.localStore,e);e.targetChanges.forEach((s,i)=>{const o=t.Eu.get(i);o&&(U(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.lu=!0:s.modifiedDocuments.size>0?U(o.lu,14607):s.removedDocuments.size>0&&(U(o.lu,42227),o.lu=!1))}),await zt(t,n,e)}catch(n){await jt(n)}}function Ph(r,e,t){const n=F(r);if(n.isPrimaryClient&&t===0||!n.isPrimaryClient&&t===1){const s=[];n.Pu.forEach((i,o)=>{const c=o.view.va(e);c.snapshot&&s.push(c.snapshot)}),function(o,c){const u=F(o);u.onlineState=c;let h=!1;u.queries.forEach((f,m)=>{for(const g of m.wa)g.va(c)&&(h=!0)}),h&&Rc(u)}(n.eventManager,e),s.length&&n.hu.J_(s),n.onlineState=e,n.isPrimaryClient&&n.sharedClientState.setOnlineState(e)}}async function sv(r,e,t){const n=F(r);n.sharedClientState.updateQueryState(e,"rejected",t);const s=n.Eu.get(e),i=s&&s.key;if(i){let o=new ie(O.comparator);o=o.insert(i,he.newNoDocument(i,j.min()));const c=G().add(i),u=new bs(j.min(),new Map,new ie($),o,c);await Fp(n,u),n.du=n.du.remove(i),n.Eu.delete(e),Dc(n)}else await ir(n.localStore,e,!1).then(()=>cr(n,e,t)).catch(jt)}async function iv(r,e){const t=F(r),n=e.batch.batchId;try{const s=await EE(t.localStore,e);Vc(t,n,null),Cc(t,n),t.sharedClientState.updateMutationState(n,"acknowledged"),await zt(t,s)}catch(s){await jt(s)}}async function ov(r,e,t){const n=F(r);try{const s=await function(o,c){const u=F(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let f;return u.mutationQueue.lookupMutationBatch(h,c).next(m=>(U(m!==null,37113),f=m.keys(),u.mutationQueue.removeMutationBatch(h,m))).next(()=>u.mutationQueue.performConsistencyCheck(h)).next(()=>u.documentOverlayCache.removeOverlaysForBatchId(h,f,c)).next(()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,f)).next(()=>u.localDocuments.getDocuments(h,f))})}(n.localStore,e);Vc(n,e,t),Cc(n,e),n.sharedClientState.updateMutationState(e,"rejected",t),await zt(n,s)}catch(s){await jt(s)}}function Cc(r,e){(r.Vu.get(e)||[]).forEach(t=>{t.resolve()}),r.Vu.delete(e)}function Vc(r,e,t){const n=F(r);let s=n.Ru[n.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),n.Ru[n.currentUser.toKey()]=s}}function cr(r,e,t=null){r.sharedClientState.removeLocalQueryTarget(e);for(const n of r.Tu.get(e))r.Pu.delete(n),t&&r.hu.pu(n,t);r.Tu.delete(e),r.isPrimaryClient&&r.Au.zr(e).forEach(n=>{r.Au.containsKey(n)||Bp(r,n)})}function Bp(r,e){r.Iu.delete(e.path.canonicalString());const t=r.du.get(e);t!==null&&(or(r.remoteStore,t),r.du=r.du.remove(e),r.Eu.delete(t),Dc(r))}function ja(r,e,t){for(const n of t)n instanceof Op?(r.Au.addReference(n.key,e),av(r,n)):n instanceof Mp?(V(gr,"Document no longer in limbo: "+n.key),r.Au.removeReference(n.key,e),r.Au.containsKey(n.key)||Bp(r,n.key)):M(19791,{yu:n})}function av(r,e){const t=e.key,n=t.path.canonicalString();r.du.get(t)||r.Iu.has(n)||(V(gr,"New document in limbo: "+t),r.Iu.add(n),Dc(r))}function Dc(r){for(;r.Iu.size>0&&r.du.size<r.maxConcurrentLimboResolutions;){const e=r.Iu.values().next().value;r.Iu.delete(e);const t=new O(Y.fromString(e)),n=r.mu.next();r.Eu.set(n,new JE(t)),r.du=r.du.insert(t,n),mo(r.remoteStore,new at(Be(io(t.path)),n,"TargetPurposeLimboResolution",xe.ue))}}async function zt(r,e,t){const n=F(r),s=[],i=[],o=[];n.Pu.isEmpty()||(n.Pu.forEach((c,u)=>{o.push(n.gu(u,e,t).then(h=>{var f;if((h||t)&&n.isPrimaryClient){const m=h?!h.fromCache:(f=t==null?void 0:t.targetChanges.get(u.targetId))===null||f===void 0?void 0:f.current;n.sharedClientState.updateQueryState(u.targetId,m?"current":"not-current")}if(h){s.push(h);const m=Ic.Es(u.targetId,h);i.push(m)}}))}),await Promise.all(o),n.hu.J_(s),await async function(u,h){const f=F(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>w.forEach(h,g=>w.forEach(g.Is,S=>f.persistence.referenceDelegate.addReference(m,g.targetId,S)).next(()=>w.forEach(g.ds,S=>f.persistence.referenceDelegate.removeReference(m,g.targetId,S)))))}catch(m){if(!$t(m))throw m;V(Ec,"Failed to update sequence numbers: "+m)}for(const m of h){const g=m.targetId;if(!m.fromCache){const S=f.Fs.get(g),C=S.snapshotVersion,N=S.withLastLimboFreeSnapshotVersion(C);f.Fs=f.Fs.insert(g,N)}}}(n.localStore,i))}async function cv(r,e){const t=F(r);if(!t.currentUser.isEqual(e)){V(gr,"User change. New user:",e.toKey());const n=await mp(t.localStore,e);t.currentUser=e,function(i,o){i.Vu.forEach(c=>{c.forEach(u=>{u.reject(new k(P.CANCELLED,o))})}),i.Vu.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,n.removedBatchIds,n.addedBatchIds),await zt(t,n.Bs)}}function uv(r,e){const t=F(r),n=t.Eu.get(e);if(n&&n.lu)return G().add(n.key);{let s=G();const i=t.Tu.get(e);if(!i)return s;for(const o of i){const c=t.Pu.get(o);s=s.unionWith(c.view.tu)}return s}}async function lv(r,e){const t=F(r),n=await Ma(t.localStore,e.query,!0),s=e.view.uu(n);return t.isPrimaryClient&&ja(t,e.targetId,s._u),s}async function hv(r,e){const t=F(r);return yp(t.localStore,e).then(n=>zt(t,n))}async function dv(r,e,t,n){const s=F(r),i=await function(c,u){const h=F(c),f=F(h.mutationQueue);return h.persistence.runTransaction("Lookup mutation documents","readonly",m=>f.Xn(m,u).next(g=>g?h.localDocuments.getDocuments(m,g):w.resolve(null)))}(s.localStore,e);i!==null?(t==="pending"?await pr(s.remoteStore):t==="acknowledged"||t==="rejected"?(Vc(s,e,n||null),Cc(s,e),function(c,u){F(F(c).mutationQueue).rr(u)}(s.localStore,e)):M(6720,"Unknown batchState",{wu:t}),await zt(s,i)):V(gr,"Cannot apply mutation batch with id: "+e)}async function fv(r,e){const t=F(r);if(go(t),kc(t),e===!0&&t.fu!==!0){const n=t.sharedClientState.getAllActiveQueryTargets(),s=await Ch(t,n.toArray());t.fu=!0,await Ba(t.remoteStore,!0);for(const i of s)mo(t.remoteStore,i)}else if(e===!1&&t.fu!==!1){const n=[];let s=Promise.resolve();t.Tu.forEach((i,o)=>{t.sharedClientState.isLocalQueryTarget(o)?n.push(o):s=s.then(()=>(cr(t,o),ir(t.localStore,o,!0))),or(t.remoteStore,o)}),await s,await Ch(t,n),function(o){const c=F(o);c.Eu.forEach((u,h)=>{or(c.remoteStore,h)}),c.Au.jr(),c.Eu=new Map,c.du=new ie(O.comparator)}(t),t.fu=!1,await Ba(t.remoteStore,!1)}}async function Ch(r,e,t){const n=F(r),s=[],i=[];for(const o of e){let c;const u=n.Tu.get(o);if(u&&u.length!==0){c=await Li(n.localStore,Be(u[0]));for(const h of u){const f=n.Pu.get(h),m=await lv(n,f);m.snapshot&&i.push(m.snapshot)}}else{const h=await _p(n.localStore,o);c=await Li(n.localStore,h),await Pc(n,Up(h),o,!1,c.resumeToken)}s.push(c)}return n.hu.J_(i),s}function Up(r){return Ef(r.path,r.collectionGroup,r.orderBy,r.filters,r.limit,"F",r.startAt,r.endAt)}function pv(r){return function(t){return F(F(t).persistence).Ps()}(F(r).localStore)}async function mv(r,e,t,n){const s=F(r);if(s.fu)return void V(gr,"Ignoring unexpected query state notification.");const i=s.Tu.get(e);if(i&&i.length>0)switch(t){case"current":case"not-current":{const o=await yp(s.localStore,wf(i[0])),c=bs.createSynthesizedRemoteEventForCurrentChange(e,t==="current",fe.EMPTY_BYTE_STRING);await zt(s,o,c);break}case"rejected":await ir(s.localStore,e,!0),cr(s,e,n);break;default:M(64155,t)}}async function gv(r,e,t){const n=go(r);if(n.fu){for(const s of e){if(n.Tu.has(s)&&n.sharedClientState.isActiveQueryTarget(s)){V(gr,"Adding an already active target "+s);continue}const i=await _p(n.localStore,s),o=await Li(n.localStore,i);await Pc(n,Up(i),o.targetId,!1,o.resumeToken),mo(n.remoteStore,o)}for(const s of t)n.Tu.has(s)&&await ir(n.localStore,s,!1).then(()=>{or(n.remoteStore,s),cr(n,s)}).catch(jt)}}function go(r){const e=F(r);return e.remoteStore.remoteSyncer.applyRemoteEvent=Fp.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=uv.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=sv.bind(null,e),e.hu.J_=KE.bind(null,e.eventManager),e.hu.pu=WE.bind(null,e.eventManager),e}function kc(r){const e=F(r);return e.remoteStore.remoteSyncer.applySuccessfulWrite=iv.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=ov.bind(null,e),e}class ys{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=fo(e.databaseInfo.databaseId),this.sharedClientState=this.bu(e),this.persistence=this.Du(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Cu(e,this.localStore),this.indexBackfillerScheduler=this.Fu(e,this.localStore)}Cu(e,t){return null}Fu(e,t){return null}vu(e){return pp(this.persistence,new fp,e.initialUser,this.serializer)}Du(e){return new _c(ho.Vi,this.serializer)}bu(e){return new wp}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}ys.provider={build:()=>new ys};class _v extends ys{constructor(e){super(),this.cacheSizeBytes=e}Cu(e,t){U(this.persistence.referenceDelegate instanceof Mi,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new ap(n,e.asyncQueue,t)}Du(e){const t=this.cacheSizeBytes!==void 0?Re.withCacheSize(this.cacheSizeBytes):Re.DEFAULT;return new _c(n=>Mi.Vi(n,t),this.serializer)}}class jp extends ys{constructor(e,t,n){super(),this.Mu=e,this.cacheSizeBytes=t,this.forceOwnership=n,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.Mu.initialize(this,e),await kc(this.Mu.syncEngine),await pr(this.Mu.remoteStore),await this.persistence.ji(()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve()))}vu(e){return pp(this.persistence,new fp,e.initialUser,this.serializer)}Cu(e,t){const n=this.persistence.referenceDelegate.garbageCollector;return new ap(n,e.asyncQueue,t)}Fu(e,t){const n=new Cy(t,this.persistence);return new Py(e.asyncQueue,n)}Du(e){const t=dp(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),n=this.cacheSizeBytes!==void 0?Re.withCacheSize(this.cacheSizeBytes):Re.DEFAULT;return new yc(this.synchronizeTabs,t,e.clientId,n,e.asyncQueue,Ap(),gi(),this.serializer,this.sharedClientState,!!this.forceOwnership)}bu(e){return new wp}}class yv extends jp{constructor(e,t){super(e,t,!1),this.Mu=e,this.cacheSizeBytes=t,this.synchronizeTabs=!0}async initialize(e){await super.initialize(e);const t=this.Mu.syncEngine;this.sharedClientState instanceof sa&&(this.sharedClientState.syncEngine={Do:dv.bind(null,t),vo:mv.bind(null,t),Co:gv.bind(null,t),Ps:pv.bind(null,t),bo:hv.bind(null,t)},await this.sharedClientState.start()),await this.persistence.ji(async n=>{await fv(this.Mu.syncEngine,n),this.gcScheduler&&(n&&!this.gcScheduler.started?this.gcScheduler.start():n||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(n&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():n||this.indexBackfillerScheduler.stop())})}bu(e){const t=Ap();if(!sa.C(t))throw new k(P.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const n=dp(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey);return new sa(t,e.asyncQueue,n,e.clientId,e.initialUser)}}class Is{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>Ph(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=cv.bind(null,this.syncEngine),await Ba(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new HE}()}createDatastore(e){const t=fo(e.databaseInfo.databaseId),n=function(i){return new PE(i)}(e.databaseInfo);return function(i,o,c,u){return new kE(i,o,c,u)}(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return function(n,s,i,o,c){return new xE(n,s,i,o,c)}(this.localStore,this.datastore,e.asyncQueue,t=>Ph(this.syncEngine,t,0),function(){return Th.C()?new Th:new AE}())}createSyncEngine(e,t){return function(s,i,o,c,u,h,f){const m=new YE(s,i,o,c,u,h);return f&&(m.fu=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const i=F(s);V(In,"RemoteStore shutting down."),i.Ia.add(5),await Rs(i),i.Ea.shutdown(),i.Aa.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}Is.provider={build:()=>new Is};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $p{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.xu(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.xu(this.observer.error,e):de("Uncaught Error in snapshot listener:",e.toString()))}Ou(){this.muted=!0}xu(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ut="FirestoreClient";class Iv{constructor(e,t,n,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this.databaseInfo=s,this.user=Ie.UNAUTHENTICATED,this.clientId=Qa.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(n,async o=>{V(Ut,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(n,o=>(V(Ut,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Ye;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=Sc(t,"Failed to shutdown persistence");e.reject(n)}}),e.promise}}async function oa(r,e){r.asyncQueue.verifyOperationInProgress(),V(Ut,"Initializing OfflineComponentProvider");const t=r.configuration;await e.initialize(t);let n=t.initialUser;r.setCredentialChangeListener(async s=>{n.isEqual(s)||(await mp(e.localStore,s),n=s)}),e.persistence.setDatabaseDeletedListener(()=>{ht("Terminating Firestore due to IndexedDb database deletion"),r.terminate().then(()=>{V("Terminating Firestore due to IndexedDb database deletion completed successfully")}).catch(s=>{ht("Terminating Firestore due to IndexedDb database deletion failed",s)})}),r._offlineComponents=e}async function Vh(r,e){r.asyncQueue.verifyOperationInProgress();const t=await Ev(r);V(Ut,"Initializing OnlineComponentProvider"),await e.initialize(t,r.configuration),r.setCredentialChangeListener(n=>Ah(e.remoteStore,n)),r.setAppCheckTokenChangeListener((n,s)=>Ah(e.remoteStore,s)),r._onlineComponents=e}async function Ev(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){V(Ut,"Using user provided OfflineComponentProvider");try{await oa(r,r._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===P.FAILED_PRECONDITION||s.code===P.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;ht("Error using user provided cache. Falling back to memory cache: "+t),await oa(r,new ys)}}else V(Ut,"Using default OfflineComponentProvider"),await oa(r,new _v(void 0));return r._offlineComponents}async function qp(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(V(Ut,"Using user provided OnlineComponentProvider"),await Vh(r,r._uninitializedComponentsProvider._online)):(V(Ut,"Using default OnlineComponentProvider"),await Vh(r,new Is))),r._onlineComponents}function vv(r){return qp(r).then(e=>e.syncEngine)}async function zp(r){const e=await qp(r),t=e.eventManager;return t.onListen=ZE.bind(null,e.syncEngine),t.onUnlisten=tv.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=ev.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=nv.bind(null,e.syncEngine),t}function Tv(r,e,t={}){const n=new Ye;return r.asyncQueue.enqueueAndForget(async()=>function(i,o,c,u,h){const f=new $p({next:g=>{f.Ou(),o.enqueueAndForget(()=>Np(i,m));const S=g.docs.has(c);!S&&g.fromCache?h.reject(new k(P.UNAVAILABLE,"Failed to get document because the client is offline.")):S&&g.fromCache&&u&&u.source==="server"?h.reject(new k(P.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):h.resolve(g)},error:g=>h.reject(g)}),m=new xp(io(c.path),f,{includeMetadataChanges:!0,ka:!0});return kp(i,m)}(await zp(r),r.asyncQueue,e,t,n)),n.promise}function wv(r,e,t={}){const n=new Ye;return r.asyncQueue.enqueueAndForget(async()=>function(i,o,c,u,h){const f=new $p({next:g=>{f.Ou(),o.enqueueAndForget(()=>Np(i,m)),g.fromCache&&u.source==="server"?h.reject(new k(P.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(g)},error:g=>h.reject(g)}),m=new xp(c,f,{includeMetadataChanges:!0,ka:!0});return kp(i,m)}(await zp(r),r.asyncQueue,e,t,n)),n.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gp(r){const e={};return r.timeoutSeconds!==void 0&&(e.timeoutSeconds=r.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dh=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hp="firestore.googleapis.com",kh=!0;class Nh{constructor(e){var t,n;if(e.host===void 0){if(e.ssl!==void 0)throw new k(P.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Hp,this.ssl=kh}else this.host=e.host,this.ssl=(t=e.ssl)!==null&&t!==void 0?t:kh;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=np;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<op)throw new k(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Ay("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Gp((n=e.experimentalLongPollingOptions)!==null&&n!==void 0?n:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new k(P.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new k(P.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new k(P.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(n,s){return n.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class _o{constructor(e,t,n,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Nh({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new k(P.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new k(P.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Nh(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(n){if(!n)return new my;switch(n.type){case"firstParty":return new Iy(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new k(P.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const n=Dh.get(t);n&&(V("ComponentProvider","Removing Datastore"),Dh.delete(t),n.terminate())}(this),Promise.resolve()}}function Av(r,e,t,n={}){var s;r=Mt(r,_o);const i=Xi(e),o=r._getSettings(),c=Object.assign(Object.assign({},o),{emulatorOptions:r._getEmulatorOptions()}),u=`${e}:${t}`;i&&(Td(`https://${u}`),ry("Firestore",!0)),o.host!==Hp&&o.host!==u&&ht("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const h=Object.assign(Object.assign({},o),{host:u,ssl:i,emulatorOptions:n});if(!Ka(h,c)&&(r._setSettings(h),n.mockUserToken)){let f,m;if(typeof n.mockUserToken=="string")f=n.mockUserToken,m=Ie.MOCK_USER;else{f=ey(n.mockUserToken,(s=r._app)===null||s===void 0?void 0:s.options.projectId);const g=n.mockUserToken.sub||n.mockUserToken.user_id;if(!g)throw new k(P.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");m=new Ie(g)}r._authCredentials=new gy(new Od(f,m))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gt{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new Gt(this.firestore,e,this._query)}}class ge{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Ot(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new ge(this.firestore,e,this._key)}toJSON(){return{type:ge._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,n){if(vs(t,ge._jsonSchema))return new ge(e,n||null,new O(Y.fromString(t.referencePath)))}}ge._jsonSchemaVersion="firestore/documentReference/1.0",ge._jsonSchema={type:me("string",ge._jsonSchemaVersion),referencePath:me("string")};class Ot extends Gt{constructor(e,t,n){super(e,t,io(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new ge(this.firestore,null,new O(e))}withConverter(e){return new Ot(this.firestore,e,this._path)}}function CA(r,e,...t){if(r=zn(r),Fd("collection","path",e),r instanceof _o){const n=Y.fromString(e,...t);return wl(n),new Ot(r,null,n)}{if(!(r instanceof ge||r instanceof Ot))throw new k(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(Y.fromString(e,...t));return wl(n),new Ot(r.firestore,null,n)}}function bv(r,e,...t){if(r=zn(r),arguments.length===1&&(e=Qa.newId()),Fd("doc","path",e),r instanceof _o){const n=Y.fromString(e,...t);return Tl(n),new ge(r,null,new O(n))}{if(!(r instanceof ge||r instanceof Ot))throw new k(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(Y.fromString(e,...t));return Tl(n),new ge(r.firestore,r instanceof Ot?r.converter:null,new O(n))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xh="AsyncQueue";class Oh{constructor(e=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new bp(this,"async_queue_retry"),this.oc=()=>{const n=gi();n&&V(xh,"Visibility state changed to "+n.visibilityState),this.F_.y_()},this._c=e;const t=gi();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.ac(),this.uc(e)}enterRestrictedMode(e){if(!this.Xu){this.Xu=!0,this.rc=e||!1;const t=gi();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.oc)}}enqueue(e){if(this.ac(),this.Xu)return new Promise(()=>{});const t=new Ye;return this.uc(()=>this.Xu&&this.rc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Zu.push(e),this.cc()))}async cc(){if(this.Zu.length!==0){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(e){if(!$t(e))throw e;V(xh,"Operation failed with retryable error: "+e)}this.Zu.length>0&&this.F_.g_(()=>this.cc())}}uc(e){const t=this._c.then(()=>(this.nc=!0,e().catch(n=>{throw this.tc=n,this.nc=!1,de("INTERNAL UNHANDLED ERROR: ",Mh(n)),n}).then(n=>(this.nc=!1,n))));return this._c=t,t}enqueueAfterDelay(e,t,n){this.ac(),this.sc.indexOf(e)>-1&&(t=0);const s=bc.createAndSchedule(this,e,t,n,i=>this.lc(i));return this.ec.push(s),s}ac(){this.tc&&M(47125,{hc:Mh(this.tc)})}verifyOperationInProgress(){}async Pc(){let e;do e=this._c,await e;while(e!==this._c)}Tc(e){for(const t of this.ec)if(t.timerId===e)return!0;return!1}Ic(e){return this.Pc().then(()=>{this.ec.sort((t,n)=>t.targetTimeMs-n.targetTimeMs);for(const t of this.ec)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Pc()})}dc(e){this.sc.push(e)}lc(e){const t=this.ec.indexOf(e);this.ec.splice(t,1)}}function Mh(r){let e=r.message||"";return r.stack&&(e=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),e}class Ps extends _o{constructor(e,t,n,s){super(e,t,n,s),this.type="firestore",this._queue=new Oh,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Oh(e),this._firestoreClient=void 0,await e}}}function VA(r,e,t){t||(t=ds);const n=Qi(r,"firestore");if(n.isInitialized(t)){const s=n.getImmediate({identifier:t}),i=n.getOptions(t);if(Ka(i,e))return s;throw new k(P.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new k(P.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<op)throw new k(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&Xi(e.host)&&Td(e.host),n.initialize({options:e,instanceIdentifier:t})}function DA(r,e){const t=typeof r=="object"?r:md(),n=typeof r=="string"?r:ds,s=Qi(t,"firestore").getImmediate({identifier:n});if(!s._initialized){const i=Z_("firestore");i&&Av(s,...i)}return s}function Nc(r){if(r._terminated)throw new k(P.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||Sv(r),r._firestoreClient}function Sv(r){var e,t,n;const s=r._freezeSettings(),i=function(c,u,h,f){return new rI(c,u,h,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Gp(f.experimentalLongPollingOptions),f.useFetchStreams,f.isUsingEmulator)}(r._databaseId,((e=r._app)===null||e===void 0?void 0:e.options.appId)||"",r._persistenceKey,s);r._componentsProvider||!((t=s.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((n=s.localCache)===null||n===void 0)&&n._onlineComponentProvider)&&(r._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),r._firestoreClient=new Iv(r._authCredentials,r._appCheckCredentials,r._queue,i,r._componentsProvider&&function(c){const u=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(u),_online:u}}(r._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class je{constructor(e){this._byteString=e}static fromBase64String(e){try{return new je(fe.fromBase64String(e))}catch(t){throw new k(P.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new je(fe.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:je._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(vs(e,je._jsonSchema))return je.fromBase64String(e.bytes)}}je._jsonSchemaVersion="firestore/bytes/1.0",je._jsonSchema={type:me("string",je._jsonSchemaVersion),bytes:me("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xc{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new k(P.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ue(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oc{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ze{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new k(P.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new k(P.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return $(this._lat,e._lat)||$(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Ze._jsonSchemaVersion}}static fromJSON(e){if(vs(e,Ze._jsonSchema))return new Ze(e.latitude,e.longitude)}}Ze._jsonSchemaVersion="firestore/geoPoint/1.0",Ze._jsonSchema={type:me("string",Ze._jsonSchemaVersion),latitude:me("number"),longitude:me("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class et{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(n,s){if(n.length!==s.length)return!1;for(let i=0;i<n.length;++i)if(n[i]!==s[i])return!1;return!0}(this._values,e._values)}toJSON(){return{type:et._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(vs(e,et._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new et(e.vectorValues);throw new k(P.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}et._jsonSchemaVersion="firestore/vectorValue/1.0",et._jsonSchema={type:me("string",et._jsonSchemaVersion),vectorValues:me("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rv=/^__.*__$/;class Pv{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return this.fieldMask!==null?new qt(e,this.data,this.fieldMask,t,this.fieldTransforms):new fr(e,this.data,t,this.fieldTransforms)}}function Kp(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw M(40011,{Ec:r})}}class Mc{constructor(e,t,n,s,i,o){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=s,i===void 0&&this.Ac(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Ec(){return this.settings.Ec}Rc(e){return new Mc(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Vc(e){var t;const n=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Rc({path:n,mc:!1});return s.fc(e),s}gc(e){var t;const n=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Rc({path:n,mc:!1});return s.Ac(),s}yc(e){return this.Rc({path:void 0,mc:!0})}wc(e){return ji(e,this.settings.methodName,this.settings.Sc||!1,this.path,this.settings.bc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}Ac(){if(this.path)for(let e=0;e<this.path.length;e++)this.fc(this.path.get(e))}fc(e){if(e.length===0)throw this.wc("Document fields must not be empty");if(Kp(this.Ec)&&Rv.test(e))throw this.wc('Document fields cannot begin and end with "__"')}}class Cv{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||fo(e)}Dc(e,t,n,s=!1){return new Mc({Ec:e,methodName:t,bc:n,path:ue.emptyPath(),mc:!1,Sc:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Lc(r){const e=r._freezeSettings(),t=fo(r._databaseId);return new Cv(r._databaseId,!!e.ignoreUndefinedProperties,t)}function Wp(r,e,t,n,s,i={}){const o=r.Dc(i.merge||i.mergeFields?2:0,e,t,s);Jp("Data must be an object, but it was:",o,n);const c=Qp(n,o);let u,h;if(i.merge)u=new $e(o.fieldMask),h=o.fieldTransforms;else if(i.mergeFields){const f=[];for(const m of i.mergeFields){const g=Dv(e,m,t);if(!o.contains(g))throw new k(P.INVALID_ARGUMENT,`Field '${g}' is specified in your field mask but missing from your input data.`);Nv(f,g)||f.push(g)}u=new $e(f),h=o.fieldTransforms.filter(m=>u.covers(m.field))}else u=null,h=o.fieldTransforms;return new Pv(new Ne(c),u,h)}class Fc extends Oc{_toFieldTransform(e){return new Nf(e.path,new tr)}isEqual(e){return e instanceof Fc}}function Vv(r,e,t,n=!1){return Bc(t,r.Dc(n?4:3,e))}function Bc(r,e){if(Xp(r=zn(r)))return Jp("Unsupported field value:",e,r),Qp(r,e);if(r instanceof Oc)return function(n,s){if(!Kp(s.Ec))throw s.wc(`${n._methodName}() can only be used with update() and set()`);if(!s.path)throw s.wc(`${n._methodName}() is not currently supported inside arrays`);const i=n._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(r,e),null;if(r===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),r instanceof Array){if(e.settings.mc&&e.Ec!==4)throw e.wc("Nested arrays are not supported");return function(n,s){const i=[];let o=0;for(const c of n){let u=Bc(c,s.yc(o));u==null&&(u={nullValue:"NULL_VALUE"}),i.push(u),o++}return{arrayValue:{values:i}}}(r,e)}return function(n,s){if((n=zn(n))===null)return{nullValue:"NULL_VALUE"};if(typeof n=="number")return EI(s.serializer,n);if(typeof n=="boolean")return{booleanValue:n};if(typeof n=="string")return{stringValue:n};if(n instanceof Date){const i=ee.fromDate(n);return{timestampValue:sr(s.serializer,i)}}if(n instanceof ee){const i=new ee(n.seconds,1e3*Math.floor(n.nanoseconds/1e3));return{timestampValue:sr(s.serializer,i)}}if(n instanceof Ze)return{geoPointValue:{latitude:n.latitude,longitude:n.longitude}};if(n instanceof je)return{bytesValue:Uf(s.serializer,n._byteString)};if(n instanceof ge){const i=s.databaseId,o=n.firestore._databaseId;if(!o.isEqual(i))throw s.wc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:fc(n.firestore._databaseId||s.databaseId,n._key.path)}}if(n instanceof et)return function(o,c){return{mapValue:{fields:{[rc]:{stringValue:sc},[Jn]:{arrayValue:{values:o.toArray().map(h=>{if(typeof h!="number")throw c.wc("VectorValues must only contain numeric values.");return ac(c.serializer,h)})}}}}}}(n,s);throw s.wc(`Unsupported field value: ${Ji(n)}`)}(r,e)}function Qp(r,e){const t={};return nf(r)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):vn(r,(n,s)=>{const i=Bc(s,e.Vc(n));i!=null&&(t[n]=i)}),{mapValue:{fields:t}}}function Xp(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof ee||r instanceof Ze||r instanceof je||r instanceof ge||r instanceof Oc||r instanceof et)}function Jp(r,e,t){if(!Xp(t)||!Bd(t)){const n=Ji(t);throw n==="an object"?e.wc(r+" a custom object"):e.wc(r+" "+n)}}function Dv(r,e,t){if((e=zn(e))instanceof xc)return e._internalPath;if(typeof e=="string")return Yp(r,e);throw ji("Field path arguments must be of type string or ",r,!1,void 0,t)}const kv=new RegExp("[~\\*/\\[\\]]");function Yp(r,e,t){if(e.search(kv)>=0)throw ji(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,t);try{return new xc(...e.split("."))._internalPath}catch{throw ji(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,t)}}function ji(r,e,t,n,s){const i=n&&!n.isEmpty(),o=s!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let u="";return(i||o)&&(u+=" (found",i&&(u+=` in field ${n}`),o&&(u+=` in document ${s}`),u+=")"),new k(P.INVALID_ARGUMENT,c+r+u)}function Nv(r,e){return r.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zp{constructor(e,t,n,s,i){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new ge(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new xv(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(yo("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class xv extends Zp{data(){return super.data()}}function yo(r,e){return typeof e=="string"?Yp(r,e):e instanceof xc?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ov(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new k(P.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Uc{}class jc extends Uc{}function kA(r,e,...t){let n=[];e instanceof Uc&&n.push(e),n=n.concat(t),function(i){const o=i.filter(u=>u instanceof $c).length,c=i.filter(u=>u instanceof Io).length;if(o>1||o>0&&c>0)throw new k(P.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(n);for(const s of n)r=s._apply(r);return r}class Io extends jc{constructor(e,t,n){super(),this._field=e,this._op=t,this._value=n,this.type="where"}static _create(e,t,n){return new Io(e,t,n)}_apply(e){const t=this._parse(e);return em(e._query,t),new Gt(e.firestore,e.converter,Pa(e._query,t))}_parse(e){const t=Lc(e.firestore);return function(i,o,c,u,h,f,m){let g;if(h.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new k(P.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){Fh(m,f);const C=[];for(const N of m)C.push(Lh(u,i,N));g={arrayValue:{values:C}}}else g=Lh(u,i,m)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||Fh(m,f),g=Vv(c,o,m,f==="in"||f==="not-in");return W.create(h,f,g)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function NA(r,e,t){const n=e,s=yo("where",r);return Io._create(s,n,t)}class $c extends Uc{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new $c(e,t)}_parse(e){const t=this._queryConstraints.map(n=>n._parse(e)).filter(n=>n.getFilters().length>0);return t.length===1?t[0]:te.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(s,i){let o=s;const c=i.getFlattenedFilters();for(const u of c)em(o,u),o=Pa(o,u)}(e._query,t),new Gt(e.firestore,e.converter,Pa(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class qc extends jc{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new qc(e,t)}_apply(e){const t=function(s,i,o){if(s.startAt!==null)throw new k(P.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new k(P.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new gs(i,o)}(e._query,this._field,this._direction);return new Gt(e.firestore,e.converter,function(s,i){const o=s.explicitOrderBy.concat([i]);return new dr(s.path,s.collectionGroup,o,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,t))}}function xA(r,e="asc"){const t=e,n=yo("orderBy",r);return qc._create(n,t)}class zc extends jc{constructor(e,t,n){super(),this.type=e,this._limit=t,this._limitType=n}static _create(e,t,n){return new zc(e,t,n)}_apply(e){return new Gt(e.firestore,e.converter,Vi(e._query,this._limit,this._limitType))}}function OA(r){return by("limit",r),zc._create("limit",r,"F")}function Lh(r,e,t){if(typeof(t=zn(t))=="string"){if(t==="")throw new k(P.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!vf(e)&&t.indexOf("/")!==-1)throw new k(P.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const n=e.path.child(Y.fromString(t));if(!O.isDocumentKey(n))throw new k(P.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return ps(r,new O(n))}if(t instanceof ge)return ps(r,t._key);throw new k(P.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Ji(t)}.`)}function Fh(r,e){if(!Array.isArray(r)||r.length===0)throw new k(P.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function em(r,e){const t=function(s,i){for(const o of s)for(const c of o.getFlattenedFilters())if(i.indexOf(c.op)>=0)return c.op;return null}(r.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new k(P.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new k(P.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}class Mv{convertValue(e,t="none"){switch(Lt(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ce(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(ft(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw M(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return vn(e,(s,i)=>{n[s]=this.convertValue(i,t)}),n}convertVectorValue(e){var t,n,s;const i=(s=(n=(t=e.fields)===null||t===void 0?void 0:t[Jn].arrayValue)===null||n===void 0?void 0:n.values)===null||s===void 0?void 0:s.map(o=>ce(o.doubleValue));return new et(i)}convertGeoPoint(e){return new Ze(ce(e.latitude),ce(e.longitude))}convertArray(e,t){return(e.values||[]).map(n=>this.convertValue(n,t))}convertServerTimestamp(e,t){switch(t){case"previous":const n=ro(e);return n==null?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(hs(e));default:return null}}convertTimestamp(e){const t=dt(e);return new ee(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=Y.fromString(e);U(Xf(n),9688,{name:e});const s=new pn(n.get(1),n.get(3)),i=new O(n.popFirst(5));return s.isEqual(t)||de(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tm(r,e,t){let n;return n=r?t&&(t.merge||t.mergeFields)?r.toFirestore(e,t):r.toFirestore(e):e,n}class Gr{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class hn extends Zp{constructor(e,t,n,s,i,o){super(e,t,n,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new _i(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(yo("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new k(P.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=hn._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}hn._jsonSchemaVersion="firestore/documentSnapshot/1.0",hn._jsonSchema={type:me("string",hn._jsonSchemaVersion),bundleSource:me("string","DocumentSnapshot"),bundleName:me("string"),bundle:me("string")};class _i extends hn{data(e={}){return super.data(e)}}class Bn{constructor(e,t,n,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Gr(s.hasPendingWrites,s.fromCache),this.query=n}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(n=>{e.call(t,new _i(this._firestore,this._userDataWriter,n.key,n,new Gr(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new k(P.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map(c=>{const u=new _i(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Gr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}})}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(c=>i||c.type!==3).map(c=>{const u=new _i(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Gr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,f=-1;return c.type!==0&&(h=o.indexOf(c.doc.key),o=o.delete(c.doc.key)),c.type!==1&&(o=o.add(c.doc),f=o.indexOf(c.doc.key)),{type:Lv(c.type),doc:u,oldIndex:h,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new k(P.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Bn._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Qa.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],n=[],s=[];return this.docs.forEach(i=>{i._document!==null&&(t.push(i._document),n.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function Lv(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return M(61501,{type:r})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function MA(r){r=Mt(r,ge);const e=Mt(r.firestore,Ps);return Tv(Nc(e),r._key).then(t=>Fv(e,r,t))}Bn._jsonSchemaVersion="firestore/querySnapshot/1.0",Bn._jsonSchema={type:me("string",Bn._jsonSchemaVersion),bundleSource:me("string","QuerySnapshot"),bundleName:me("string"),bundle:me("string")};class nm extends Mv{constructor(e){super(),this.firestore=e}convertBytes(e){return new je(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new ge(this.firestore,null,t)}}function LA(r){r=Mt(r,Gt);const e=Mt(r.firestore,Ps),t=Nc(e),n=new nm(e);return Ov(r._query),wv(t,r._query).then(s=>new Bn(e,n,r,s))}function FA(r,e,t){r=Mt(r,ge);const n=Mt(r.firestore,Ps),s=tm(r.converter,e,t);return rm(n,[Wp(Lc(n),"setDoc",r._key,s,r.converter!==null,t).toMutation(r._key,Oe.none())])}function BA(r,e){const t=Mt(r.firestore,Ps),n=bv(r),s=tm(r.converter,e);return rm(t,[Wp(Lc(r.firestore),"addDoc",n._key,s,r.converter!==null,{}).toMutation(n._key,Oe.exists(!1))]).then(()=>n)}function rm(r,e){return function(n,s){const i=new Ye;return n.asyncQueue.enqueueAndForget(async()=>rv(await vv(n),s,i)),i.promise}(Nc(r),e)}function Fv(r,e,t){const n=t.docs.get(e._key),s=new nm(r);return new hn(r,s,e._key,n,new Gr(t.hasPendingWrites,t.fromCache),e.converter)}class Bv{constructor(e){let t;this.kind="persistent",e!=null&&e.tabManager?(e.tabManager._initialize(e),t=e.tabManager):(t=$v(),t._initialize(e)),this._onlineComponentProvider=t._onlineComponentProvider,this._offlineComponentProvider=t._offlineComponentProvider}toJSON(){return{kind:this.kind}}}function UA(r){return new Bv(r)}class Uv{constructor(e){this.forceOwnership=e,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Is.provider,this._offlineComponentProvider={build:t=>new jp(t,e==null?void 0:e.cacheSizeBytes,this.forceOwnership)}}}class jv{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Is.provider,this._offlineComponentProvider={build:t=>new yv(t,e==null?void 0:e.cacheSizeBytes)}}}function $v(r){return new Uv(void 0)}function jA(){return new jv}function $A(){return new Fc("serverTimestamp")}(function(e,t=!0){(function(s){hr=s})(lr),qn(new uy("firestore",(n,{instanceIdentifier:s,options:i})=>{const o=n.getProvider("app").getImmediate(),c=new Ps(new _y(n.getProvider("auth-internal")),new Ey(o,n.getProvider("app-check-internal")),function(h,f){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new k(P.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new pn(h.options.projectId,f)}(o,s),o);return i=Object.assign({useFetchStreams:t},i),c._setSettings(i),c},"PUBLIC").setMultipleInstances(!0)),kt(_l,yl,e),kt(_l,yl,"esm2017")})();const qv=()=>{};var Bh={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zv=function(r){const e=[];let t=0;for(let n=0;n<r.length;n++){let s=r.charCodeAt(n);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&n+1<r.length&&(r.charCodeAt(n+1)&64512)===56320?(s=65536+((s&1023)<<10)+(r.charCodeAt(++n)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Gv=function(r){const e=[];let t=0,n=0;for(;t<r.length;){const s=r[t++];if(s<128)e[n++]=String.fromCharCode(s);else if(s>191&&s<224){const i=r[t++];e[n++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=r[t++],o=r[t++],c=r[t++],u=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[n++]=String.fromCharCode(55296+(u>>10)),e[n++]=String.fromCharCode(56320+(u&1023))}else{const i=r[t++],o=r[t++];e[n++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Hv={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,e){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let s=0;s<r.length;s+=3){const i=r[s],o=s+1<r.length,c=o?r[s+1]:0,u=s+2<r.length,h=u?r[s+2]:0,f=i>>2,m=(i&3)<<4|c>>4;let g=(c&15)<<2|h>>6,S=h&63;u||(S=64,o||(g=64)),n.push(t[f],t[m],t[g],t[S])}return n.join("")},encodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(r):this.encodeByteArray(zv(r),e)},decodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(r):Gv(this.decodeStringToByteArray(r,e))},decodeStringToByteArray(r,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let s=0;s<r.length;){const i=t[r.charAt(s++)],c=s<r.length?t[r.charAt(s)]:0;++s;const h=s<r.length?t[r.charAt(s)]:64;++s;const m=s<r.length?t[r.charAt(s)]:64;if(++s,i==null||c==null||h==null||m==null)throw new Kv;const g=i<<2|c>>4;if(n.push(g),h!==64){const S=c<<4&240|h>>2;if(n.push(S),m!==64){const C=h<<6&192|m;n.push(C)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class Kv extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const sm=function(r){try{return Hv.decodeString(r,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wv(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qv=()=>Wv().__FIREBASE_DEFAULTS__,Xv=()=>{if(typeof process>"u"||typeof Bh>"u")return;const r=Bh.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},Jv=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=r&&sm(r[1]);return e&&JSON.parse(e)},im=()=>{try{return qv()||Qv()||Xv()||Jv()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},Yv=r=>{var e,t;return(t=(e=im())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[r]},om=r=>{var e;return(e=im())===null||e===void 0?void 0:e[`_${r}`]};/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Eo(r){try{return(r.startsWith("http://")||r.startsWith("https://")?new URL(r).hostname:r).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Zv(r){return(await fetch(r,{credentials:"include"})).ok}const ns={};function eT(){const r={prod:[],emulator:[]};for(const e of Object.keys(ns))ns[e]?r.emulator.push(e):r.prod.push(e);return r}function tT(r){let e=document.getElementById(r),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",r),t=!0),{created:t,element:e}}let Uh=!1;function nT(r,e){if(typeof window>"u"||typeof document>"u"||!Eo(window.location.host)||ns[r]===e||ns[r]||Uh)return;ns[r]=e;function t(g){return`__firebase__banner__${g}`}const n="__firebase__banner",i=eT().prod.length>0;function o(){const g=document.getElementById(n);g&&g.remove()}function c(g){g.style.display="flex",g.style.background="#7faaf0",g.style.position="fixed",g.style.bottom="5px",g.style.left="5px",g.style.padding=".5em",g.style.borderRadius="5px",g.style.alignItems="center"}function u(g,S){g.setAttribute("width","24"),g.setAttribute("id",S),g.setAttribute("height","24"),g.setAttribute("viewBox","0 0 24 24"),g.setAttribute("fill","none"),g.style.marginLeft="-6px"}function h(){const g=document.createElement("span");return g.style.cursor="pointer",g.style.marginLeft="16px",g.style.fontSize="24px",g.innerHTML=" &times;",g.onclick=()=>{Uh=!0,o()},g}function f(g,S){g.setAttribute("id",S),g.innerText="Learn more",g.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",g.setAttribute("target","__blank"),g.style.paddingLeft="5px",g.style.textDecoration="underline"}function m(){const g=tT(n),S=t("text"),C=document.getElementById(S)||document.createElement("span"),N=t("learnmore"),D=document.getElementById(N)||document.createElement("a"),z=t("preprendIcon"),B=document.getElementById(z)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(g.created){const L=g.element;c(L),f(D,N);const H=h();u(B,z),L.append(B,C,D,H),document.body.appendChild(L)}i?(C.innerText="Preview backend disconnected.",B.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(B.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,C.innerText="Preview backend running in this workspace."),C.setAttribute("id",S)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",m):m()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ke(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function rT(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ke())}function sT(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function iT(){const r=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof r=="object"&&r.id!==void 0}function oT(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function aT(){const r=ke();return r.indexOf("MSIE ")>=0||r.indexOf("Trident/")>=0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cT="FirebaseError";class _r extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name=cT,Object.setPrototypeOf(this,_r.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,vo.prototype.create)}}class vo{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?uT(i,n):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new _r(s,c,n)}}function uT(r,e){return r.replace(lT,(t,n)=>{const s=e[n];return s!=null?String(s):`<${n}?>`})}const lT=/\{\$([^}]+)}/g;function hT(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}function $i(r,e){if(r===e)return!0;const t=Object.keys(r),n=Object.keys(e);for(const s of t){if(!n.includes(s))return!1;const i=r[s],o=e[s];if(jh(i)&&jh(o)){if(!$i(i,o))return!1}else if(i!==o)return!1}for(const s of n)if(!t.includes(s))return!1;return!0}function jh(r){return r!==null&&typeof r=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cs(r){const e=[];for(const[t,n]of Object.entries(r))Array.isArray(n)?n.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}function dT(r,e){const t=new fT(r,e);return t.subscribe.bind(t)}class fT{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(n=>{this.error(n)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,n){let s;if(e===void 0&&t===void 0&&n===void 0)throw new Error("Missing Observer.");pT(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:n},s.next===void 0&&(s.next=aa),s.error===void 0&&(s.error=aa),s.complete===void 0&&(s.complete=aa);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function pT(r,e){if(typeof r!="object"||r===null)return!1;for(const t of e)if(t in r&&typeof r[t]=="function")return!0;return!1}function aa(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ht(r){return r&&r._delegate?r._delegate:r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var se;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(se||(se={}));const mT={debug:se.DEBUG,verbose:se.VERBOSE,info:se.INFO,warn:se.WARN,error:se.ERROR,silent:se.SILENT},gT=se.INFO,_T={[se.DEBUG]:"log",[se.VERBOSE]:"log",[se.INFO]:"info",[se.WARN]:"warn",[se.ERROR]:"error"},yT=(r,e,...t)=>{if(e<r.logLevel)return;const n=new Date().toISOString(),s=_T[e];if(s)console[s](`[${n}]  ${r.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class IT{constructor(e){this.name=e,this._logLevel=gT,this._logHandler=yT,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in se))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?mT[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,se.DEBUG,...e),this._logHandler(this,se.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,se.VERBOSE,...e),this._logHandler(this,se.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,se.INFO,...e),this._logHandler(this,se.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,se.WARN,...e),this._logHandler(this,se.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,se.ERROR,...e),this._logHandler(this,se.ERROR,...e)}}var $h=function(){return $h=Object.assign||function(e){for(var t,n=1,s=arguments.length;n<s;n++){t=arguments[n];for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i])}return e},$h.apply(this,arguments)};function Gc(r,e){var t={};for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&e.indexOf(n)<0&&(t[n]=r[n]);if(r!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,n=Object.getOwnPropertySymbols(r);s<n.length;s++)e.indexOf(n[s])<0&&Object.prototype.propertyIsEnumerable.call(r,n[s])&&(t[n[s]]=r[n[s]]);return t}function qA(r,e,t){if(t||arguments.length===2)for(var n=0,s=e.length,i;n<s;n++)(i||!(n in e))&&(i||(i=Array.prototype.slice.call(e,0,n)),i[n]=e[n]);return r.concat(i||Array.prototype.slice.call(e))}class qh{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}function am(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const ET=am,cm=new vo("auth","Firebase",am());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qi=new IT("@firebase/auth");function vT(r,...e){qi.logLevel<=se.WARN&&qi.warn(`Auth (${lr}): ${r}`,...e)}function yi(r,...e){qi.logLevel<=se.ERROR&&qi.error(`Auth (${lr}): ${r}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rt(r,...e){throw Kc(r,...e)}function Ke(r,...e){return Kc(r,...e)}function Hc(r,e,t){const n=Object.assign(Object.assign({},ET()),{[e]:t});return new vo("auth","Firebase",n).create(e,{appName:r.name})}function dn(r){return Hc(r,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function TT(r,e,t){const n=t;if(!(e instanceof n))throw n.name!==e.constructor.name&&rt(r,"argument-error"),Hc(r,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Kc(r,...e){if(typeof r!="string"){const t=e[0],n=[...e.slice(1)];return n[0]&&(n[0].appName=r.name),r._errorFactory.create(t,...n)}return cm.create(r,...e)}function q(r,e,...t){if(!r)throw Kc(e,...t)}function ct(r){const e="INTERNAL ASSERTION FAILED: "+r;throw yi(e),new Error(e)}function pt(r,e){r||ct(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $a(){var r;return typeof self<"u"&&((r=self.location)===null||r===void 0?void 0:r.href)||""}function wT(){return zh()==="http:"||zh()==="https:"}function zh(){var r;return typeof self<"u"&&((r=self.location)===null||r===void 0?void 0:r.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function AT(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(wT()||iT()||"connection"in navigator)?navigator.onLine:!0}function bT(){if(typeof navigator>"u")return null;const r=navigator;return r.languages&&r.languages[0]||r.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vs{constructor(e,t){this.shortDelay=e,this.longDelay=t,pt(t>e,"Short delay should be less than long delay!"),this.isMobile=rT()||oT()}get(){return AT()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wc(r,e){pt(r.emulator,"Emulator should always be set here");const{url:t}=r.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class um{static initialize(e,t,n){this.fetchImpl=e,t&&(this.headersImpl=t),n&&(this.responseImpl=n)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;ct("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;ct("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;ct("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ST={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const RT=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],PT=new Vs(3e4,6e4);function Qc(r,e){return r.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:r.tenantId}):e}async function yr(r,e,t,n,s={}){return lm(r,s,async()=>{let i={},o={};n&&(e==="GET"?o=n:i={body:JSON.stringify(n)});const c=Cs(Object.assign({key:r.config.apiKey},o)).slice(1),u=await r._getAdditionalHeaders();u["Content-Type"]="application/json",r.languageCode&&(u["X-Firebase-Locale"]=r.languageCode);const h=Object.assign({method:e,headers:u},i);return sT()||(h.referrerPolicy="no-referrer"),r.emulatorConfig&&Eo(r.emulatorConfig.host)&&(h.credentials="include"),um.fetch()(await hm(r,r.config.apiHost,t,c),h)})}async function lm(r,e,t){r._canInitEmulator=!1;const n=Object.assign(Object.assign({},ST),e);try{const s=new VT(r),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw ii(r,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const c=i.ok?o.errorMessage:o.error.message,[u,h]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw ii(r,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw ii(r,"email-already-in-use",o);if(u==="USER_DISABLED")throw ii(r,"user-disabled",o);const f=n[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw Hc(r,f,h);rt(r,f)}}catch(s){if(s instanceof _r)throw s;rt(r,"network-request-failed",{message:String(s)})}}async function CT(r,e,t,n,s={}){const i=await yr(r,e,t,n,s);return"mfaPendingCredential"in i&&rt(r,"multi-factor-auth-required",{_serverResponse:i}),i}async function hm(r,e,t,n){const s=`${e}${t}?${n}`,i=r,o=i.config.emulator?Wc(r.config,s):`${r.config.apiScheme}://${s}`;return RT.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}class VT{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,n)=>{this.timer=setTimeout(()=>n(Ke(this.auth,"network-request-failed")),PT.get())})}}function ii(r,e,t){const n={appName:r.name};t.email&&(n.email=t.email),t.phoneNumber&&(n.phoneNumber=t.phoneNumber);const s=Ke(r,e,n);return s.customData._tokenResponse=t,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function DT(r,e){return yr(r,"POST","/v1/accounts:delete",e)}async function zi(r,e){return yr(r,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rs(r){if(r)try{const e=new Date(Number(r));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function kT(r,e=!1){const t=Ht(r),n=await t.getIdToken(e),s=Xc(n);q(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:n,authTime:rs(ca(s.auth_time)),issuedAtTime:rs(ca(s.iat)),expirationTime:rs(ca(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function ca(r){return Number(r)*1e3}function Xc(r){const[e,t,n]=r.split(".");if(e===void 0||t===void 0||n===void 0)return yi("JWT malformed, contained fewer than 3 sections"),null;try{const s=sm(t);return s?JSON.parse(s):(yi("Failed to decode base64 JWT payload"),null)}catch(s){return yi("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Gh(r){const e=Xc(r);return q(e,"internal-error"),q(typeof e.exp<"u","internal-error"),q(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Es(r,e,t=!1){if(t)return e;try{return await e}catch(n){throw n instanceof _r&&NT(n)&&r.auth.currentUser===r&&await r.auth.signOut(),n}}function NT({code:r}){return r==="auth/user-disabled"||r==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xT{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const s=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qa{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=rs(this.lastLoginAt),this.creationTime=rs(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Gi(r){var e;const t=r.auth,n=await r.getIdToken(),s=await Es(r,zi(t,{idToken:n}));q(s==null?void 0:s.users.length,t,"internal-error");const i=s.users[0];r._notifyReloadListener(i);const o=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?dm(i.providerUserInfo):[],c=MT(r.providerData,o),u=r.isAnonymous,h=!(r.email&&i.passwordHash)&&!(c!=null&&c.length),f=u?h:!1,m={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:c,metadata:new qa(i.createdAt,i.lastLoginAt),isAnonymous:f};Object.assign(r,m)}async function OT(r){const e=Ht(r);await Gi(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function MT(r,e){return[...r.filter(n=>!e.some(s=>s.providerId===n.providerId)),...e]}function dm(r){return r.map(e=>{var{providerId:t}=e,n=Gc(e,["providerId"]);return{providerId:t,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function LT(r,e){const t=await lm(r,{},async()=>{const n=Cs({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=r.config,o=await hm(r,s,"/v1/token",`key=${i}`),c=await r._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:c,body:n};return r.emulatorConfig&&Eo(r.emulatorConfig.host)&&(u.credentials="include"),um.fetch()(o,u)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function FT(r,e){return yr(r,"POST","/v2/accounts:revokeToken",Qc(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Un{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){q(e.idToken,"internal-error"),q(typeof e.idToken<"u","internal-error"),q(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Gh(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){q(e.length!==0,"internal-error");const t=Gh(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(q(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:n,refreshToken:s,expiresIn:i}=await LT(e,t);this.updateTokensAndExpiration(n,s,Number(i))}updateTokensAndExpiration(e,t,n){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+n*1e3}static fromJSON(e,t){const{refreshToken:n,accessToken:s,expirationTime:i}=t,o=new Un;return n&&(q(typeof n=="string","internal-error",{appName:e}),o.refreshToken=n),s&&(q(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(q(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Un,this.toJSON())}_performRefresh(){return ct("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wt(r,e){q(typeof r=="string"||typeof r>"u","internal-error",{appName:e})}class He{constructor(e){var{uid:t,auth:n,stsTokenManager:s}=e,i=Gc(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new xT(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=n,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new qa(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await Es(this,this.stsTokenManager.getToken(this.auth,e));return q(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return kT(this,e)}reload(){return OT(this)}_assign(e){this!==e&&(q(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new He(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){q(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),t&&await Gi(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Ge(this.auth.app))return Promise.reject(dn(this.auth));const e=await this.getIdToken();return await Es(this,DT(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var n,s,i,o,c,u,h,f;const m=(n=t.displayName)!==null&&n!==void 0?n:void 0,g=(s=t.email)!==null&&s!==void 0?s:void 0,S=(i=t.phoneNumber)!==null&&i!==void 0?i:void 0,C=(o=t.photoURL)!==null&&o!==void 0?o:void 0,N=(c=t.tenantId)!==null&&c!==void 0?c:void 0,D=(u=t._redirectEventId)!==null&&u!==void 0?u:void 0,z=(h=t.createdAt)!==null&&h!==void 0?h:void 0,B=(f=t.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:L,emailVerified:H,isAnonymous:Z,providerData:K,stsTokenManager:E}=t;q(L&&E,e,"internal-error");const _=Un.fromJSON(this.name,E);q(typeof L=="string",e,"internal-error"),wt(m,e.name),wt(g,e.name),q(typeof H=="boolean",e,"internal-error"),q(typeof Z=="boolean",e,"internal-error"),wt(S,e.name),wt(C,e.name),wt(N,e.name),wt(D,e.name),wt(z,e.name),wt(B,e.name);const I=new He({uid:L,auth:e,email:g,emailVerified:H,displayName:m,isAnonymous:Z,photoURL:C,phoneNumber:S,tenantId:N,stsTokenManager:_,createdAt:z,lastLoginAt:B});return K&&Array.isArray(K)&&(I.providerData=K.map(v=>Object.assign({},v))),D&&(I._redirectEventId=D),I}static async _fromIdTokenResponse(e,t,n=!1){const s=new Un;s.updateFromServerResponse(t);const i=new He({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:n});return await Gi(i),i}static async _fromGetAccountInfoResponse(e,t,n){const s=t.users[0];q(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?dm(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),c=new Un;c.updateFromIdToken(n);const u=new He({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:o}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new qa(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(u,h),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hh=new Map;function ut(r){pt(r instanceof Function,"Expected a class definition");let e=Hh.get(r);return e?(pt(e instanceof r,"Instance stored in cache mismatched with class"),e):(e=new r,Hh.set(r,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fm{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}fm.type="NONE";const Kh=fm;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ii(r,e,t){return`firebase:${r}:${e}:${t}`}class jn{constructor(e,t,n){this.persistence=e,this.auth=t,this.userKey=n;const{config:s,name:i}=this.auth;this.fullUserKey=Ii(this.userKey,s.apiKey,i),this.fullPersistenceKey=Ii("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await zi(this.auth,{idToken:e}).catch(()=>{});return t?He._fromGetAccountInfoResponse(this.auth,t,e):null}return He._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,n="authUser"){if(!t.length)return new jn(ut(Kh),e,n);const s=(await Promise.all(t.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let i=s[0]||ut(Kh);const o=Ii(n,e.config.apiKey,e.name);let c=null;for(const h of t)try{const f=await h._get(o);if(f){let m;if(typeof f=="string"){const g=await zi(e,{idToken:f}).catch(()=>{});if(!g)break;m=await He._fromGetAccountInfoResponse(e,g,f)}else m=He._fromJSON(e,f);h!==i&&(c=m),i=h;break}}catch{}const u=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!u.length?new jn(i,e,n):(i=u[0],c&&await i._set(o,c.toJSON()),await Promise.all(t.map(async h=>{if(h!==i)try{await h._remove(o)}catch{}})),new jn(i,e,n))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wh(r){const e=r.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(_m(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(pm(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Im(e))return"Blackberry";if(Em(e))return"Webos";if(mm(e))return"Safari";if((e.includes("chrome/")||gm(e))&&!e.includes("edge/"))return"Chrome";if(ym(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=r.match(t);if((n==null?void 0:n.length)===2)return n[1]}return"Other"}function pm(r=ke()){return/firefox\//i.test(r)}function mm(r=ke()){const e=r.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function gm(r=ke()){return/crios\//i.test(r)}function _m(r=ke()){return/iemobile/i.test(r)}function ym(r=ke()){return/android/i.test(r)}function Im(r=ke()){return/blackberry/i.test(r)}function Em(r=ke()){return/webos/i.test(r)}function Jc(r=ke()){return/iphone|ipad|ipod/i.test(r)||/macintosh/i.test(r)&&/mobile/i.test(r)}function BT(r=ke()){var e;return Jc(r)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function UT(){return aT()&&document.documentMode===10}function vm(r=ke()){return Jc(r)||ym(r)||Em(r)||Im(r)||/windows phone/i.test(r)||_m(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tm(r,e=[]){let t;switch(r){case"Browser":t=Wh(ke());break;case"Worker":t=`${Wh(ke())}-${r}`;break;default:t=r}const n=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${lr}/${n}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jT{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const n=i=>new Promise((o,c)=>{try{const u=e(i);o(u)}catch(u){c(u)}});n.onAbort=t,this.queue.push(n);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const n of this.queue)await n(e),n.onAbort&&t.push(n.onAbort)}catch(n){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:n==null?void 0:n.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $T(r,e={}){return yr(r,"GET","/v2/passwordPolicy",Qc(r,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qT=6;class zT{constructor(e){var t,n,s,i;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=o.minPasswordLength)!==null&&t!==void 0?t:qT,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(n=e.allowedNonAlphanumericCharacters)===null||n===void 0?void 0:n.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,n,s,i,o,c;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(t=u.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),u.isValid&&(u.isValid=(n=u.meetsMaxPasswordLength)!==null&&n!==void 0?n:!0),u.isValid&&(u.isValid=(s=u.containsLowercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(i=u.containsUppercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(o=u.containsNumericCharacter)!==null&&o!==void 0?o:!0),u.isValid&&(u.isValid=(c=u.containsNonAlphanumericCharacter)!==null&&c!==void 0?c:!0),u}validatePasswordLengthOptions(e,t){const n=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;n&&(t.meetsMinPasswordLength=e.length>=n),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let n;for(let s=0;s<e.length;s++)n=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,t,n,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GT{constructor(e,t,n,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=n,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Qh(this),this.idTokenSubscription=new Qh(this),this.beforeStateQueue=new jT(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=cm,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=ut(t)),this._initializationPromise=this.queue(async()=>{var n,s,i;if(!this._deleted&&(this.persistenceManager=await jn.create(this,e),(n=this._resolvePersistenceManagerAvailable)===null||n===void 0||n.call(this),!this._deleted)){if(!((s=this._popupRedirectResolver)===null||s===void 0)&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)===null||i===void 0?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await zi(this,{idToken:e}),n=await He._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(n)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(Ge(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let s=n,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,c=s==null?void 0:s._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===c)&&(u!=null&&u.user)&&(s=u.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(o){s=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return q(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Gi(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=bT()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Ge(this.app))return Promise.reject(dn(this));const t=e?Ht(e):null;return t&&q(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&q(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Ge(this.app)?Promise.reject(dn(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Ge(this.app)?Promise.reject(dn(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(ut(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await $T(this),t=new zT(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new vo("auth","Firebase",e())}onAuthStateChanged(e,t,n){return this.registerStateListener(this.authStateSubscription,e,t,n)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,n){return this.registerStateListener(this.idTokenSubscription,e,t,n)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),n={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(n.tenantId=this.tenantId),await FT(this,n)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const n=await this.getOrInitRedirectPersistenceManager(t);return e===null?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&ut(e)||this._popupRedirectResolver;q(t,this,"argument-error"),this.redirectPersistenceManager=await jn.create(this,[ut(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,n;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const n=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==n&&(this.lastNotifiedUid=n,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,n,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(q(c,this,"internal-error"),c.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const u=e.addObserver(t,n,s);return()=>{o=!0,u()}}else{const u=e.addObserver(t);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return q(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Tm(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const n=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());n&&(t["X-Firebase-Client"]=n);const s=await this._getAppCheckToken();return s&&(t["X-Firebase-AppCheck"]=s),t}async _getAppCheckToken(){var e;if(Ge(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&vT(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function To(r){return Ht(r)}class Qh{constructor(e){this.auth=e,this.observer=null,this.addObserver=dT(t=>this.observer=t)}get next(){return q(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Yc={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function HT(r){Yc=r}function KT(r){return Yc.loadJS(r)}function WT(){return Yc.gapiScript}function QT(r){return`__${r}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function XT(r,e){const t=Qi(r,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if($i(i,e??{}))return s;rt(s,"already-initialized")}return t.initialize({options:e})}function JT(r,e){const t=(e==null?void 0:e.persistence)||[],n=(Array.isArray(t)?t:[t]).map(ut);e!=null&&e.errorMap&&r._updateErrorMap(e.errorMap),r._initializeWithPersistence(n,e==null?void 0:e.popupRedirectResolver)}function YT(r,e,t){const n=To(r);q(/^https?:\/\//.test(e),n,"invalid-emulator-scheme");const s=!1,i=wm(e),{host:o,port:c}=ZT(e),u=c===null?"":`:${c}`,h={url:`${i}//${o}${u}/`},f=Object.freeze({host:o,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!n._canInitEmulator){q(n.config.emulator&&n.emulatorConfig,n,"emulator-config-failed"),q($i(h,n.config.emulator)&&$i(f,n.emulatorConfig),n,"emulator-config-failed");return}n.config.emulator=h,n.emulatorConfig=f,n.settings.appVerificationDisabledForTesting=!0,Eo(o)?(Zv(`${i}//${o}${u}`),nT("Auth",!0)):ew()}function wm(r){const e=r.indexOf(":");return e<0?"":r.substr(0,e+1)}function ZT(r){const e=wm(r),t=/(\/\/)?([^?#/]+)/.exec(r.substr(e.length));if(!t)return{host:"",port:null};const n=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(n);if(s){const i=s[1];return{host:i,port:Xh(n.substr(i.length+1))}}else{const[i,o]=n.split(":");return{host:i,port:Xh(o)}}}function Xh(r){if(!r)return null;const e=Number(r);return isNaN(e)?null:e}function ew(){function r(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",r):r())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Am{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return ct("not implemented")}_getIdTokenResponse(e){return ct("not implemented")}_linkToIdToken(e,t){return ct("not implemented")}_getReauthenticationResolver(e){return ct("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $n(r,e){return CT(r,"POST","/v1/accounts:signInWithIdp",Qc(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tw="http://localhost";class En extends Am{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new En(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):rt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:n,signInMethod:s}=t,i=Gc(t,["providerId","signInMethod"]);if(!n||!s)return null;const o=new En(n,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return $n(e,t)}_linkToIdToken(e,t){const n=this.buildRequest();return n.idToken=t,$n(e,n)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,$n(e,t)}buildRequest(){const e={requestUri:tw,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Cs(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zc{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ds extends Zc{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bt extends Ds{constructor(){super("facebook.com")}static credential(e){return En._fromParams({providerId:bt.PROVIDER_ID,signInMethod:bt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return bt.credentialFromTaggedObject(e)}static credentialFromError(e){return bt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return bt.credential(e.oauthAccessToken)}catch{return null}}}bt.FACEBOOK_SIGN_IN_METHOD="facebook.com";bt.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class St extends Ds{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return En._fromParams({providerId:St.PROVIDER_ID,signInMethod:St.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return St.credentialFromTaggedObject(e)}static credentialFromError(e){return St.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:n}=e;if(!t&&!n)return null;try{return St.credential(t,n)}catch{return null}}}St.GOOGLE_SIGN_IN_METHOD="google.com";St.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt extends Ds{constructor(){super("github.com")}static credential(e){return En._fromParams({providerId:Rt.PROVIDER_ID,signInMethod:Rt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Rt.credentialFromTaggedObject(e)}static credentialFromError(e){return Rt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Rt.credential(e.oauthAccessToken)}catch{return null}}}Rt.GITHUB_SIGN_IN_METHOD="github.com";Rt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pt extends Ds{constructor(){super("twitter.com")}static credential(e,t){return En._fromParams({providerId:Pt.PROVIDER_ID,signInMethod:Pt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Pt.credentialFromTaggedObject(e)}static credentialFromError(e){return Pt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:n}=e;if(!t||!n)return null;try{return Pt.credential(t,n)}catch{return null}}}Pt.TWITTER_SIGN_IN_METHOD="twitter.com";Pt.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ur{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,n,s=!1){const i=await He._fromIdTokenResponse(e,n,s),o=Jh(n);return new ur({user:i,providerId:o,_tokenResponse:n,operationType:t})}static async _forOperation(e,t,n){await e._updateTokensIfNecessary(n,!0);const s=Jh(n);return new ur({user:e,providerId:s,_tokenResponse:n,operationType:t})}}function Jh(r){return r.providerId?r.providerId:"phoneNumber"in r?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hi extends _r{constructor(e,t,n,s){var i;super(t.code,t.message),this.operationType=n,this.user=s,Object.setPrototypeOf(this,Hi.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:t.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,t,n,s){return new Hi(e,t,n,s)}}function bm(r,e,t,n){return(e==="reauthenticate"?t._getReauthenticationResolver(r):t._getIdTokenResponse(r)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Hi._fromErrorAndOperation(r,i,e,n):i})}async function nw(r,e,t=!1){const n=await Es(r,e._linkToIdToken(r.auth,await r.getIdToken()),t);return ur._forOperation(r,"link",n)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function rw(r,e,t=!1){const{auth:n}=r;if(Ge(n.app))return Promise.reject(dn(n));const s="reauthenticate";try{const i=await Es(r,bm(n,s,e,r),t);q(i.idToken,n,"internal-error");const o=Xc(i.idToken);q(o,n,"internal-error");const{sub:c}=o;return q(r.uid===c,n,"user-mismatch"),ur._forOperation(r,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&rt(n,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function sw(r,e,t=!1){if(Ge(r.app))return Promise.reject(dn(r));const n="signIn",s=await bm(r,n,e),i=await ur._fromIdTokenResponse(r,n,s);return t||await r._updateCurrentUser(i.user),i}function iw(r,e,t,n){return Ht(r).onIdTokenChanged(e,t,n)}function ow(r,e,t){return Ht(r).beforeAuthStateChanged(e,t)}function zA(r,e,t,n){return Ht(r).onAuthStateChanged(e,t,n)}function GA(r){return Ht(r).signOut()}const Ki="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sm{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Ki,"1"),this.storage.removeItem(Ki),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const aw=1e3,cw=10;class Rm extends Sm{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=vm(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const n=this.storage.getItem(t),s=this.localCache[t];n!==s&&e(t,s,n)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,c,u)=>{this.notifyListeners(o,u)});return}const n=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(n);!t&&this.localCache[n]===o||this.notifyListeners(n,o)},i=this.storage.getItem(n);UT()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,cw):s()}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const s of Array.from(n))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:n}),!0)})},aw)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Rm.type="LOCAL";const uw=Rm;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pm extends Sm{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Pm.type="SESSION";const Cm=Pm;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lw(r){return Promise.all(r.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wo{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const n=new wo(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:n,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:n,eventType:s});const c=Array.from(o).map(async h=>h(t.origin,i)),u=await lw(c);t.ports[0].postMessage({status:"done",eventId:n,eventType:s,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}wo.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eu(r="",e=10){let t="";for(let n=0;n<e;n++)t+=Math.floor(Math.random()*10);return r+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hw{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,n=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((c,u)=>{const h=eu("",20);s.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},n);o={messageChannel:s,onMessage(m){const g=m;if(g.data.eventId===h)switch(g.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(g.data.response);break;default:clearTimeout(f),clearTimeout(i),u(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:h,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tt(){return window}function dw(r){tt().location.href=r}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vm(){return typeof tt().WorkerGlobalScope<"u"&&typeof tt().importScripts=="function"}async function fw(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function pw(){var r;return((r=navigator==null?void 0:navigator.serviceWorker)===null||r===void 0?void 0:r.controller)||null}function mw(){return Vm()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dm="firebaseLocalStorageDb",gw=1,Wi="firebaseLocalStorage",km="fbase_key";class ks{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Ao(r,e){return r.transaction([Wi],e?"readwrite":"readonly").objectStore(Wi)}function _w(){const r=indexedDB.deleteDatabase(Dm);return new ks(r).toPromise()}function za(){const r=indexedDB.open(Dm,gw);return new Promise((e,t)=>{r.addEventListener("error",()=>{t(r.error)}),r.addEventListener("upgradeneeded",()=>{const n=r.result;try{n.createObjectStore(Wi,{keyPath:km})}catch(s){t(s)}}),r.addEventListener("success",async()=>{const n=r.result;n.objectStoreNames.contains(Wi)?e(n):(n.close(),await _w(),e(await za()))})})}async function Yh(r,e,t){const n=Ao(r,!0).put({[km]:e,value:t});return new ks(n).toPromise()}async function yw(r,e){const t=Ao(r,!1).get(e),n=await new ks(t).toPromise();return n===void 0?null:n.value}function Zh(r,e){const t=Ao(r,!0).delete(e);return new ks(t).toPromise()}const Iw=800,Ew=3;class Nm{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await za(),this.db)}async _withRetries(e){let t=0;for(;;)try{const n=await this._openDb();return await e(n)}catch(n){if(t++>Ew)throw n;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Vm()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=wo._getInstance(mw()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await fw(),!this.activeServiceWorker)return;this.sender=new hw(this.activeServiceWorker);const n=await this.sender._send("ping",{},800);n&&!((e=n[0])===null||e===void 0)&&e.fulfilled&&!((t=n[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||pw()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await za();return await Yh(e,Ki,"1"),await Zh(e,Ki),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(n=>Yh(n,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(n=>yw(n,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Zh(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=Ao(s,!1).getAll();return new ks(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],n=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)n.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!n.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const s of Array.from(n))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Iw)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Nm.type="LOCAL";const vw=Nm;new Vs(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xm(r,e){return e?ut(e):(q(r._popupRedirectResolver,r,"argument-error"),r._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tu extends Am{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return $n(e,this._buildIdpRequest())}_linkToIdToken(e,t){return $n(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return $n(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function Tw(r){return sw(r.auth,new tu(r),r.bypassAuthState)}function ww(r){const{auth:e,user:t}=r;return q(t,e,"internal-error"),rw(t,new tu(r),r.bypassAuthState)}async function Aw(r){const{auth:e,user:t}=r;return q(t,e,"internal-error"),nw(t,new tu(r),r.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Om{constructor(e,t,n,s,i=!1){this.auth=e,this.resolver=n,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(n){this.reject(n)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:n,postBody:s,tenantId:i,error:o,type:c}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:t,sessionId:n,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Tw;case"linkViaPopup":case"linkViaRedirect":return Aw;case"reauthViaPopup":case"reauthViaRedirect":return ww;default:rt(this.auth,"internal-error")}}resolve(e){pt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){pt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bw=new Vs(2e3,1e4);async function HA(r,e,t){if(Ge(r.app))return Promise.reject(Ke(r,"operation-not-supported-in-this-environment"));const n=To(r);TT(r,e,Zc);const s=xm(n,t);return new an(n,"signInViaPopup",e,s).executeNotNull()}class an extends Om{constructor(e,t,n,s,i){super(e,t,s,i),this.provider=n,this.authWindow=null,this.pollId=null,an.currentPopupAction&&an.currentPopupAction.cancel(),an.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return q(e,this.auth,"internal-error"),e}async onExecution(){pt(this.filter.length===1,"Popup operations only handle one event");const e=eu();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Ke(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Ke(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,an.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,n;if(!((n=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||n===void 0)&&n.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Ke(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,bw.get())};e()}}an.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sw="pendingRedirect",Ei=new Map;class Rw extends Om{constructor(e,t,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,n),this.eventId=null}async execute(){let e=Ei.get(this.auth._key());if(!e){try{const n=await Pw(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(n)}catch(t){e=()=>Promise.reject(t)}Ei.set(this.auth._key(),e)}return this.bypassAuthState||Ei.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Pw(r,e){const t=Dw(e),n=Vw(r);if(!await n._isAvailable())return!1;const s=await n._get(t)==="true";return await n._remove(t),s}function Cw(r,e){Ei.set(r._key(),e)}function Vw(r){return ut(r._redirectPersistence)}function Dw(r){return Ii(Sw,r.config.apiKey,r.name)}async function kw(r,e,t=!1){if(Ge(r.app))return Promise.reject(dn(r));const n=To(r),s=xm(n,e),o=await new Rw(n,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await n._persistUserIfCurrent(o.user),await n._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nw=10*60*1e3;class xw{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(t=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Ow(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var n;if(e.error&&!Mm(e)){const s=((n=e.error.code)===null||n===void 0?void 0:n.split("auth/")[1])||"internal-error";t.onError(Ke(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const n=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Nw&&this.cachedEventUids.clear(),this.cachedEventUids.has(ed(e))}saveEventToCache(e){this.cachedEventUids.add(ed(e)),this.lastProcessedEventTime=Date.now()}}function ed(r){return[r.type,r.eventId,r.sessionId,r.tenantId].filter(e=>e).join("-")}function Mm({type:r,error:e}){return r==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Ow(r){switch(r.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Mm(r);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Mw(r,e={}){return yr(r,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lw=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Fw=/^https?/;async function Bw(r){if(r.config.emulator)return;const{authorizedDomains:e}=await Mw(r);for(const t of e)try{if(Uw(t))return}catch{}rt(r,"unauthorized-domain")}function Uw(r){const e=$a(),{protocol:t,hostname:n}=new URL(e);if(r.startsWith("chrome-extension://")){const o=new URL(r);return o.hostname===""&&n===""?t==="chrome-extension:"&&r.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===n}if(!Fw.test(t))return!1;if(Lw.test(r))return n===r;const s=r.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(n)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jw=new Vs(3e4,6e4);function td(){const r=tt().___jsl;if(r!=null&&r.H){for(const e of Object.keys(r.H))if(r.H[e].r=r.H[e].r||[],r.H[e].L=r.H[e].L||[],r.H[e].r=[...r.H[e].L],r.CP)for(let t=0;t<r.CP.length;t++)r.CP[t]=null}}function $w(r){return new Promise((e,t)=>{var n,s,i;function o(){td(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{td(),t(Ke(r,"network-request-failed"))},timeout:jw.get()})}if(!((s=(n=tt().gapi)===null||n===void 0?void 0:n.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=tt().gapi)===null||i===void 0)&&i.load)o();else{const c=QT("iframefcb");return tt()[c]=()=>{gapi.load?o():t(Ke(r,"network-request-failed"))},KT(`${WT()}?onload=${c}`).catch(u=>t(u))}}).catch(e=>{throw vi=null,e})}let vi=null;function qw(r){return vi=vi||$w(r),vi}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zw=new Vs(5e3,15e3),Gw="__/auth/iframe",Hw="emulator/auth/iframe",Kw={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Ww=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Qw(r){const e=r.config;q(e.authDomain,r,"auth-domain-config-required");const t=e.emulator?Wc(e,Hw):`https://${r.config.authDomain}/${Gw}`,n={apiKey:e.apiKey,appName:r.name,v:lr},s=Ww.get(r.config.apiHost);s&&(n.eid=s);const i=r._getFrameworks();return i.length&&(n.fw=i.join(",")),`${t}?${Cs(n).slice(1)}`}async function Xw(r){const e=await qw(r),t=tt().gapi;return q(t,r,"internal-error"),e.open({where:document.body,url:Qw(r),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Kw,dontclear:!0},n=>new Promise(async(s,i)=>{await n.restyle({setHideOnLeave:!1});const o=Ke(r,"network-request-failed"),c=tt().setTimeout(()=>{i(o)},zw.get());function u(){tt().clearTimeout(c),s(n)}n.ping(u).then(u,()=>{i(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jw={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Yw=500,Zw=600,eA="_blank",tA="http://localhost";class nd{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function nA(r,e,t,n=Yw,s=Zw){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-n)/2,0).toString();let c="";const u=Object.assign(Object.assign({},Jw),{width:n.toString(),height:s.toString(),top:i,left:o}),h=ke().toLowerCase();t&&(c=gm(h)?eA:t),pm(h)&&(e=e||tA,u.scrollbars="yes");const f=Object.entries(u).reduce((g,[S,C])=>`${g}${S}=${C},`,"");if(BT(h)&&c!=="_self")return rA(e||"",c),new nd(null);const m=window.open(e||"",c,f);q(m,r,"popup-blocked");try{m.focus()}catch{}return new nd(m)}function rA(r,e){const t=document.createElement("a");t.href=r,t.target=e;const n=document.createEvent("MouseEvent");n.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(n)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sA="__/auth/handler",iA="emulator/auth/handler",oA=encodeURIComponent("fac");async function rd(r,e,t,n,s,i){q(r.config.authDomain,r,"auth-domain-config-required"),q(r.config.apiKey,r,"invalid-api-key");const o={apiKey:r.config.apiKey,appName:r.name,authType:t,redirectUrl:n,v:lr,eventId:s};if(e instanceof Zc){e.setDefaultLanguage(r.languageCode),o.providerId=e.providerId||"",hT(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,m]of Object.entries({}))o[f]=m}if(e instanceof Ds){const f=e.getScopes().filter(m=>m!=="");f.length>0&&(o.scopes=f.join(","))}r.tenantId&&(o.tid=r.tenantId);const c=o;for(const f of Object.keys(c))c[f]===void 0&&delete c[f];const u=await r._getAppCheckToken(),h=u?`#${oA}=${encodeURIComponent(u)}`:"";return`${aA(r)}?${Cs(c).slice(1)}${h}`}function aA({config:r}){return r.emulator?Wc(r,iA):`https://${r.authDomain}/${sA}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ua="webStorageSupport";class cA{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Cm,this._completeRedirectFn=kw,this._overrideRedirectResult=Cw}async _openPopup(e,t,n,s){var i;pt((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const o=await rd(e,t,n,$a(),s);return nA(e,o,eu())}async _openRedirect(e,t,n,s){await this._originValidation(e);const i=await rd(e,t,n,$a(),s);return dw(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(pt(i,"If manager is not set, promise should be"),i)}const n=this.initAndGetManager(e);return this.eventManagers[t]={promise:n},n.catch(()=>{delete this.eventManagers[t]}),n}async initAndGetManager(e){const t=await Xw(e),n=new xw(e);return t.register("authEvent",s=>(q(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:n.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=t,n}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(ua,{type:ua},s=>{var i;const o=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[ua];o!==void 0&&t(!!o),rt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=Bw(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return vm()||mm()||Jc()}}const uA=cA;var sd="@firebase/auth",id="1.10.8";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lA{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(n=>{e((n==null?void 0:n.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){q(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hA(r){switch(r){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function dA(r){qn(new qh("auth",(e,{options:t})=>{const n=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=n.options;q(o&&!o.includes(":"),"invalid-api-key",{appName:n.name});const u={apiKey:o,authDomain:c,clientPlatform:r,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Tm(r)},h=new GT(n,s,i,u);return JT(h,t),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,n)=>{e.getProvider("auth-internal").initialize()})),qn(new qh("auth-internal",e=>{const t=To(e.getProvider("auth").getImmediate());return(n=>new lA(n))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),kt(sd,id,hA(r)),kt(sd,id,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fA=5*60,pA=om("authIdTokenMaxAge")||fA;let od=null;const mA=r=>async e=>{const t=e&&await e.getIdTokenResult(),n=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(n&&n>pA)return;const s=t==null?void 0:t.token;od!==s&&(od=s,await fetch(r,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function KA(r=md()){const e=Qi(r,"auth");if(e.isInitialized())return e.getImmediate();const t=XT(r,{popupRedirectResolver:uA,persistence:[vw,uw,Cm]}),n=om("authTokenSyncURL");if(n&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(n,location.origin);if(location.origin===i.origin){const o=mA(i.toString());ow(t,o,()=>o(t.currentUser)),iw(t,c=>o(c))}}const s=Yv("auth");return s&&YT(t,`http://${s}`),t}function gA(){var r,e;return(e=(r=document.getElementsByTagName("head"))===null||r===void 0?void 0:r[0])!==null&&e!==void 0?e:document}HT({loadJS(r){return new Promise((e,t)=>{const n=document.createElement("script");n.setAttribute("src",r),n.onload=e,n.onerror=s=>{const i=Ke("internal-error");i.customData=s,t(i)},n.type="text/javascript",n.charset="UTF-8",gA().appendChild(n)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});dA("Browser");var _A="firebase",yA="11.10.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */kt(_A,yA,"app");export{St as G,$h as _,DA as a,wA as b,md as c,N_ as d,jA as e,HA as f,KA as g,MA as h,VA as i,bv as j,LA as k,CA as l,FA as m,$A as n,zA as o,UA as p,kA as q,OA as r,GA as s,xA as t,BA as u,Gc as v,NA as w,qA as x};
