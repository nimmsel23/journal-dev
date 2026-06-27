import{h as M,k as w,q as A,l as j,t as N,r as z,m as x,n as m,u as I,j as v}from"./vendor-firebase-BP0PXcxu.js";import{d as b,a as E}from"./index-DPIoYn_q.js";import{r as p,j as c}from"./vendor-query-d2QCAZXe.js";function g(){const t=new Date;return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}function rt(){return!0}function h(){var e,a;const t=(a=(e=E)==null?void 0:e.currentUser)==null?void 0:a.uid;if(!t)throw new Error("not authenticated");return t}function f(t){return j(b,"fitness",t,"habits")}function O(t){const e=(t==null?void 0:t.date)||((t==null?void 0:t.epochDay)!==void 0?new Date(Number(t.epochDay)*864e5).toISOString().slice(0,10):null);return e?{...t,date:e,completion:(t==null?void 0:t.completion)||(t!=null&&t.done?"DONE":"MISSED")}:null}async function C(t){const e=t.data()||{},a=(e.records||[]).map(O).filter(Boolean);return{uuid:t.id,name:e.name||"",icon:e.icon||"Activity",deleted:!!e.deleted,source:e.source||"user",records:a,hasRecord:n=>a.some(s=>s.date===n&&s.completion==="DONE")}}async function q(){try{const t=h(),e=await w(f(t));return(await Promise.all(e.docs.map(C))).filter(n=>!n.deleted)}catch{return[]}}async function it(t,e="Activity"){const a=h();return{ok:!0,uuid:(await I(f(a),{name:String(t||"").trim(),icon:e,deleted:!1,source:"user",records:[],created_at:m(),updated_at:m()})).id}}async function ct(t){const e=h();return await x(v(f(e),t),{deleted:!0,updated_at:m()},{merge:!0}),{ok:!0}}async function ot(t,e,a){const n=h();return await x(v(f(n),t),{name:String(e||"").trim(),icon:a||"Activity",updated_at:m()},{merge:!0}),{ok:!0}}async function D(t,e,a){const n=h(),s=v(f(n),t),d=await M(s);if(!d.exists())return{ok:!1};const o=(d.data().records||[]).filter(r=>(r==null?void 0:r.date)!==e);return a&&o.push({date:e,completion:"DONE",logged_at:new Date().toISOString()}),await x(s,{records:o,updated_at:m()},{merge:!0}),{ok:!0}}async function dt(t,e=g()){return D(t,e,!0)}async function lt(t,e=g()){return D(t,e,!1)}async function ut(t=g()){return(await q()).filter(a=>a.hasRecord(t)).map(a=>a.uuid)}function H(t,e,a){return v(b,"fitness",t,"habits",e,"journal",a)}async function pt(t,e){var a,n,s,d;try{const u=h(),o=await M(H(u,t,e));if(!o.exists())return null;const r=o.data();return{date:e,text:(r==null?void 0:r.text)||"",updated_at:(d=(s=(n=(a=r==null?void 0:r.updated_at)==null?void 0:a.toDate)==null?void 0:n.call(a))==null?void 0:s.toISOString)==null?void 0:d.call(s)}}catch{return null}}async function ht(t){try{const e=h();return(await w(A(j(b,"fitness",e,"habits",t,"journal"),N("date","desc"),z(60)))).docs.map(n=>{var s,d,u,o,r,y;return{date:n.id,text:((s=n.data())==null?void 0:s.text)||"",updated_at:((y=(r=(o=(u=(d=n.data())==null?void 0:d.updated_at)==null?void 0:u.toDate)==null?void 0:o.call(u))==null?void 0:r.toISOString)==null?void 0:y.call(r))||n.id}})}catch{return[]}}async function yt(t,e,a){try{const n=h();return await x(H(n,t,e),{text:String(a||"").trim(),updated_at:m()},{merge:!0}),{ok:!0}}catch{return{ok:!1}}}/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),S=(...t)=>t.filter((e,a,n)=>!!e&&n.indexOf(e)===a).join(" ");/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var L={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=p.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:a=2,absoluteStrokeWidth:n,className:s="",children:d,iconNode:u,...o},r)=>p.createElement("svg",{ref:r,...L,width:e,height:e,stroke:t,strokeWidth:n?Number(a)*24/Number(e):a,className:S("lucide",s),...o},[...u.map(([y,l])=>p.createElement(y,l)),...Array.isArray(d)?d:[d]]));/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=(t,e)=>{const a=p.forwardRef(({className:n,...s},d)=>p.createElement(Z,{ref:d,iconNode:e,className:S(`lucide-${_(t)}`,n),...s}));return a.displayName=`${t}`,a};/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=i("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=i("Apple",[["path",{d:"M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z",key:"3s7exb"}],["path",{d:"M10 2c1 .5 2 2 2 5",key:"fcco2y"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F=i("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mt=i("Brain",[["path",{d:"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",key:"l5xja"}],["path",{d:"M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",key:"ep3f8r"}],["path",{d:"M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4",key:"1p4c4q"}],["path",{d:"M17.599 6.5a3 3 0 0 0 .399-1.375",key:"tmeiqw"}],["path",{d:"M6.003 5.125A3 3 0 0 0 6.401 6.5",key:"105sqy"}],["path",{d:"M3.477 10.896a4 4 0 0 1 .585-.396",key:"ql3yin"}],["path",{d:"M19.938 10.5a4 4 0 0 1 .585.396",key:"1qfode"}],["path",{d:"M6 18a4 4 0 0 1-1.967-.516",key:"2e4loj"}],["path",{d:"M19.967 17.484A4 4 0 0 1 18 18",key:"159ez6"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=i("Coffee",[["path",{d:"M10 2v2",key:"7u0qdc"}],["path",{d:"M14 2v2",key:"6buw04"}],["path",{d:"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1",key:"pwadti"}],["path",{d:"M6 2v2",key:"colzsn"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=i("Droplet",[["path",{d:"M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z",key:"c7niix"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=i("Dumbbell",[["path",{d:"M14.4 14.4 9.6 9.6",key:"ic80wn"}],["path",{d:"M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z",key:"nnl7wr"}],["path",{d:"m21.5 21.5-1.4-1.4",key:"1f1ice"}],["path",{d:"M3.9 3.9 2.5 2.5",key:"1evmna"}],["path",{d:"M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z",key:"yhosts"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=i("Feather",[["path",{d:"M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z",key:"18jl4k"}],["path",{d:"M16 8 2 22",key:"vp34q"}],["path",{d:"M17.5 15H9",key:"1oz8nu"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=i("Footprints",[["path",{d:"M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z",key:"1dudjm"}],["path",{d:"M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z",key:"l2t8xc"}],["path",{d:"M16 17h4",key:"1dejxt"}],["path",{d:"M4 13h4",key:"1bwh8b"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=i("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=i("House",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=i("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ft=i("PenLine",[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y=i("Save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kt=i("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=i("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=i("Sunrise",[["path",{d:"M12 2v8",key:"1q4o3n"}],["path",{d:"m4.93 10.93 1.41 1.41",key:"2a7f42"}],["path",{d:"M2 18h2",key:"j10viu"}],["path",{d:"M20 18h2",key:"wocana"}],["path",{d:"m19.07 10.93-1.41 1.41",key:"15zs5n"}],["path",{d:"M22 22H2",key:"19qnx5"}],["path",{d:"m8 6 4-4 4 4",key:"ybng9g"}],["path",{d:"M16 18a4 4 0 0 0-8 0",key:"1lzouq"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xt=i("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=i("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tt=i("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]),vt=["Activity","Footprints","Apple","BookOpen","Coffee","Droplet","Dumbbell","Feather","Heart","Home","Moon","Sunrise","Sun","Zap"],et={Activity:B,Footprints:K,Apple:R,BookOpen:F,Coffee:P,Droplet:T,Dumbbell:V,Feather:$,Heart:X,Home:U,Moon:W,Sunrise:J,Sun:G,Zap:tt};function bt(t){const e=[],a=new Date;for(let n=t-1;n>=0;n--){const s=new Date(a);s.setDate(a.getDate()-n),e.push(s.toISOString().slice(0,10))}return e}function gt({open:t,onClose:e,habit:a,date:n,journalText:s,setJournalText:d,isJournalSaving:u,onSaveJournal:o}){const r=p.useRef(null);if(p.useEffect(()=>{if(!t)return;const l=setTimeout(()=>{var k;return(k=r.current)==null?void 0:k.focus()},50);return()=>clearTimeout(l)},[t]),p.useEffect(()=>{if(!t)return;function l(k){k.key==="Escape"&&(o(),e())}return window.addEventListener("keydown",l),()=>window.removeEventListener("keydown",l)},[t,e,o]),!t||!a)return null;const y=et[a.icon||"Activity"];return c.jsxs("div",{className:"fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200",children:[c.jsx("div",{className:"absolute inset-0",onClick:()=>{o(),e()}}),c.jsxs("div",{className:"relative w-full max-w-3xl max-h-full bg-[var(--card)] rounded-3xl shadow-2xl border border-[var(--line)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200",children:[c.jsxs("div",{className:"flex items-center justify-between px-8 py-6 border-b border-[var(--line)]/40",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[y&&c.jsx(y,{size:28,className:"text-[var(--ink)]"}),c.jsxs("div",{children:[c.jsx("h2",{className:"text-2xl font-black text-[var(--ink)] leading-tight",children:a.name}),c.jsx("div",{className:"text-[10px] font-black uppercase tracking-widest opacity-40 mt-0.5",children:n})]})]}),c.jsx("button",{onClick:()=>{o(),e()},className:"p-2 text-[var(--dim)] hover:text-[var(--red)] transition-all","aria-label":"Schließen",children:c.jsx(Q,{size:24})})]}),c.jsx("div",{className:"flex-1 px-8 py-6 overflow-y-auto",children:c.jsx("textarea",{ref:r,value:s,onChange:l=>d(l.target.value),onBlur:()=>o(),onKeyDown:l=>{l.key==="Enter"&&(l.ctrlKey||l.metaKey)&&(l.preventDefault(),o(),e())},placeholder:"",className:"w-full min-h-[60vh] bg-transparent border-0 text-base font-medium leading-relaxed text-[var(--ink)] focus:outline-none resize-none"})}),c.jsxs("div",{className:"flex items-center justify-between px-8 py-4 border-t border-[var(--line)]/40 text-[10px] font-black uppercase tracking-widest opacity-40",children:[c.jsx("span",{children:"Esc · schließen + speichern"}),c.jsxs("div",{className:"flex items-center gap-2",children:[u&&c.jsx(Y,{size:12,className:"text-[var(--accent)] animate-pulse"}),c.jsx("span",{children:"Strg + Enter · speichern"})]})]})]})]})}export{B as A,mt as B,V as D,K as F,gt as H,et as I,ft as P,kt as S,xt as T,Q as X,tt as Z,q as a,vt as b,i as c,bt as d,Y as e,ht as f,pt as g,ut as h,rt as i,it as j,ct as k,g as l,ot as m,dt as r,yt as s,lt as u};
