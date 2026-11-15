/* SAMARITAN AGRO-DEALERS: public site logic. Products come from Supabase (see config.js) or fall back to sample-products.js */
const CATS=["Herbicides","Insecticides","Fungicides","Fertilizers","Seeds","Veterinary","Equipment"];
const $=s=>document.querySelector(s),C=window.CFG;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&","<":"<",">":">",'"':""","'":"'"}[c]));
const ugx=n=>"UGX "+Number(n).toLocaleString("en-UG");
const wa=t=>`https://wa.me/${C.WA}?text=${encodeURIComponent(t)}`;
const SUPABASE_STORAGE_HOST = C.SUPA ? new URL(C.SUPA).hostname.replace(/^.*?\./, '') : null;
const isValidStorageUrl = u => {
  try {
    const url = new URL(u);
    return url.protocol === "https:" && url.hostname.endsWith(SUPABASE_STORAGE_HOST || "");
  } catch { return false; }
};
let PRODUCTS=[];

/* Normalise sample items and database rows to one shape */
const fromSample=p=>({...p,packs:p.packs.map(x=>x[0]),price:Math.min(...p.packs.map(x=>x[1]))});
const fromRow=r=>({id:r.id,name:r.name,cat:r.category,ai:r.active_ingredient||"",packs:r.packs||[],price:r.price,stock:r.in_stock,crops:r.crops||[],probs:r.problems||[],controls:r.controls||"",dose:r.dosage||"See label",method:r.application||"See label",phi:r.pre_harvest||"See label",safety:r.safety||"Read the label before use.",rate:r.rate_per_ha,unit:r.unit,img:r.image_url,qty:r.stock_qty});

function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
if(localStorage.dark==="1")document.documentElement.classList.add("dark");
$("#dark").onclick=()=>{const d=document.documentElement.classList.toggle("dark");localStorage.dark=d?"1":"0"};

/* Catalogue */
$("#cat").innerHTML='<option value="">All categories</option>'+CATS.map(c=>`<option>${c}</option>`).join("");
const enq=p=>wa(`Hello ${C.BIZ}, I am interested in ${p.name}. Is it available, and what is the price?`);
function card(p){return `<article class="card flex flex-col">${p.img?`<img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" class="rounded-xl mb-2 w-full object-cover" style="height:9rem">`:""}
<div class="flex justify-between items-start gap-2"><span class="badge" style="background:var(--sand)">${esc(p.cat)}</span><span class="badge ${p.stock?"in":"out"}">${p.stock?(p.qty!=null&&p.qty>0&&p.qty<=5?"Low stock":"In stock"):"Out of stock"}</span></div>
<h3 class="font-bold text-lg mt-2">${esc(p.name)}</h3><p class="text-sm" style="color:var(--mute)">${esc(p.ai)}</p>
${p.packs.length?`<p class="text-sm mt-1">Pack sizes: ${p.packs.map(esc).join(", ")}</p>`:""}
<p class="font-extrabold mt-1">${p.price?"From "+ugx(p.price):"Ask for price"}</p>
<div class="flex gap-2 mt-3"><button class="btn btn-out flex-1" data-info="${p.id}">Details</button><a class="btn btn-green flex-1 text-center" href="${enq(p)}" target="_blank" rel="noopener">Enquire</a></div></article>`}
function render(){const q=$("#q").value.toLowerCase(),c=$("#cat").value,s=$("#sort").value;
 const l=PRODUCTS.filter(p=>(!c||p.cat===c)&&[p.name,p.ai,...p.crops,...p.probs].join(" ").toLowerCase().includes(q));
 l.sort((a,b)=>s==="lo"?(a.price||1e12)-(b.price||1e12):s==="hi"?(b.price||0)-(a.price||0):a.name.localeCompare(b.name));
 $("#grid").innerHTML=l.map(card).join("")||"<p>No products to show yet. Ask us on WhatsApp and we will help.</p>";
 $("#count").textContent=PRODUCTS.length}
["#q","#cat","#sort"].forEach(i=>$(i).addEventListener("input",render));

/* Product details */
function info(id){const p=PRODUCTS.find(x=>x.id==id),d=$("#pm");
 d.innerHTML=`<h3 class="text-xl font-extrabold">${esc(p.name)}</h3><p style="color:var(--mute)">${esc(p.ai)}</p>
 <dl class="mt-3 grid gap-2 text-sm"><div><b>Controls / use:</b> ${esc(p.controls)}</div><div><b>Suits:</b> ${esc(p.crops.join(", ")||"Ask our staff")}</div><div><b>Dosage (guide):</b> ${esc(p.dose)}</div><div><b>How to apply:</b> ${esc(p.method)}</div><div><b>Pre-harvest interval:</b> ${esc(p.phi)}</div></dl>
 <p class="warn mt-3 text-sm"><b>Safety:</b> ${esc(p.safety)} Always read the label.</p>
 <div class="flex gap-2 mt-4"><a class="btn btn-green" href="${enq(p)}" target="_blank" rel="noopener">Enquire on WhatsApp</a><button class="btn btn-out" onclick="this.closest('dialog').close()">Close</button></div>`;d.showModal()}

/* Advisor */
$("#aCrop").innerHTML='<option value="">Choose crop or animal</option>'+CROPS.map(c=>`<option>${c}</option>`).join("");
$("#aProb").innerHTML='<option value="">Choose problem</option>'+PROBS.map(c=>`<option>${c}</option>`).join("");
function advise(){const c=$("#aCrop").value,pr=$("#aProb").value,o=$("#aOut");
 if(!c||!pr){o.innerHTML="<p>Pick a crop and a problem to see matching products.</p>";return}
 const has=(a,x)=>a.some(v=>v.trim().toLowerCase()===x.toLowerCase());
 const m=PRODUCTS.filter(p=>has(p.crops,c)&&has(p.probs,pr));
 o.innerHTML=m.length?m.map(card).join(""):"<p>No exact match in our catalogue. Message us on WhatsApp and describe what you see.</p>"}
["#aCrop","#aProb"].forEach(i=>$(i).addEventListener("change",advise));

/* Calculator: product = rate/ha x hectares; water = L/ha x hectares; tanks = water / tank size */
function fillCalc(){const l=PRODUCTS.filter(p=>p.rate);$("#cProd").innerHTML=l.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")||"<option value=''>No dosage data yet</option>";calc()}
function calc(){const p=PRODUCTS.find(x=>x.id==$("#cProd").value),o=$("#cOut");if(!p){o.textContent="";return}
 const ha=$("#cArea").value/$("#cUnit").value,tank=+$("#cTank").value,w=+$("#cWater").value;
 if(!(ha>0&&tank>0&&w>0)){o.textContent="Enter valid numbers.";return}
 const tot=p.rate*ha,water=w*ha,tanks=Math.ceil(water/tank),per=tot/(water/tank);
 const f=(v,u)=>u==="kg"&&v<1?(v*1000).toFixed(0)+" g":u==="L"&&v<1?(v*1000).toFixed(0)+" ml":v.toFixed(2)+" "+u;
 o.innerHTML=`Product needed: ${f(tot,p.unit)}<br>Water: ${water.toFixed(0)} L<br>Tank loads: ${tanks} (about ${f(per,p.unit)} per full tank)`}
document.querySelectorAll("#calculator input,#calculator select").forEach(e=>e.addEventListener("input",calc));

document.addEventListener("click",e=>{const t=e.target.closest("button[data-info]");if(t)info(t.dataset.info)});
$("#cf").addEventListener("submit",e=>{e.preventDefault();const n=$("#cfN").value.trim(),p=$("#cfP").value.trim(),m=$("#cfM").value.trim();
 if(!n||p.length<9||!m){toast("Please fill in all fields");return}open(wa(`Hello, I'm ${n} (${p}). ${m}`),"_blank")});
$("#waHero").href=wa("Hello "+C.BIZ);

/* Load products: Supabase REST (public read) -> fallback to samples */
async function load(){PRODUCTS=[];
 if(!(C.SUPA&&C.KEY))PRODUCTS=SAMPLE_PRODUCTS.map(fromSample);
 else{try{const r=await fetch(`${C.SUPA}/rest/v1/products?select=*&order=name`,{headers:{apikey:C.KEY,Authorization:"Bearer "+C.KEY}});
  if(!r.ok)throw 0;PRODUCTS=(await r.json()).map(fromRow)}catch(e){toast("Could not load products. Please refresh or WhatsApp us.")}}
 render();advise();fillCalc()}
load();
