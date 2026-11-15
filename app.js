/* SAMARITAN AGRO-DEALERS: app logic (vanilla JS). Edit CONFIG and PRODUCTS below. */
const CONFIG={wa:"256700000000",biz:"Samaritan Agro-Dealers"}; // WhatsApp number: country code, no + or spaces
const CATS=["Herbicides","Insecticides","Fungicides","Fertilizers","Seeds","Veterinary","Equipment"];
const CROPS=["Maize","Beans","Coffee","Tomatoes","Cassava","Banana","Cattle"];
const PROBS=["Weeds","Aphids","Armyworm","Whiteflies","Blight","Leaf rust","Ticks","Poor soil fertility"];
/* Sample data. rate = typical label rate per hectare (calculator); prices in UGX are placeholders. */
const PRODUCTS=[
{id:1,name:"Glyphosate 480 SL",cat:"Herbicides",ai:"Glyphosate",packs:[["1 L",18000],["5 L",80000]],stock:1,crops:["Maize","Cassava","Banana","Coffee"],probs:["Weeds"],rate:3,unit:"L",controls:"Annual and perennial weeds before planting or between rows (directed spray).",dose:"2–4 L/ha in about 200 L water.",method:"Knapsack sprayer with a shield; keep off crop leaves and green stems.",phi:"Keep spray off the crop; follow label",safety:"Harmful if swallowed. Wear gloves, mask, goggles. Keep away from water."},
{id:2,name:"Atrazine 500 SC",cat:"Herbicides",ai:"Atrazine",packs:[["1 L",25000]],stock:1,crops:["Maize"],probs:["Weeds"],rate:3,unit:"L",controls:"Broadleaf and grass weeds in maize.",dose:"2–4 L/ha in about 200 L water.",method:"Spray pre-emergence or early post-emergence.",phi:"Per label",safety:"Do not spray near water or on sandy soils prone to leaching. Wear PPE."},
{id:3,name:"Lambda-cyhalothrin 5 EC",cat:"Insecticides",ai:"Lambda-cyhalothrin",packs:[["250 ml",15000],["1 L",52000]],stock:1,crops:["Maize","Beans","Tomatoes"],probs:["Armyworm","Aphids"],rate:0.3,unit:"L",controls:"Caterpillars, aphids and other chewing or sucking insects.",dose:"0.2–0.4 L/ha in about 200 L water.",method:"Spray in early morning or evening; cover leaf undersides.",phi:"7 days (confirm on label)",safety:"Toxic to bees and fish. Avoid spraying open flowers and water sources."},
{id:4,name:"Emamectin benzoate 5 SG",cat:"Insecticides",ai:"Emamectin benzoate",packs:[["100 g",22000]],stock:1,crops:["Maize","Tomatoes"],probs:["Armyworm"],rate:0.2,unit:"kg",controls:"Fall armyworm and other caterpillars.",dose:"150–250 g/ha in about 200 L water.",method:"Direct the spray into the maize whorl; repeat only as the label allows.",phi:"7 days (confirm on label)",safety:"Harmful if swallowed or inhaled. Wear full PPE."},
{id:5,name:"Imidacloprid 200 SL",cat:"Insecticides",ai:"Imidacloprid",packs:[["100 ml",14000],["500 ml",60000]],stock:0,crops:["Beans","Tomatoes","Coffee"],probs:["Aphids","Whiteflies"],rate:0.3,unit:"L",controls:"Aphids and whiteflies.",dose:"0.2–0.5 L/ha in about 200 L water.",method:"Foliar spray; do not spray when bees are foraging.",phi:"14 days (confirm on label)",safety:"Highly toxic to bees. Do not spray flowering crops."},
{id:6,name:"Mancozeb 80 WP",cat:"Fungicides",ai:"Mancozeb",packs:[["1 kg",18000]],stock:1,crops:["Tomatoes","Beans"],probs:["Blight"],rate:2.5,unit:"kg",controls:"Early and late blight (protective).",dose:"2–3 kg/ha in about 200 L water.",method:"Spray before or at first signs; repeat at label interval.",phi:"7 days (confirm on label)",safety:"May cause skin allergy. Wear PPE and wash after use."},
{id:7,name:"Copper oxychloride 50 WP",cat:"Fungicides",ai:"Copper oxychloride",packs:[["1 kg",24000]],stock:1,crops:["Coffee","Tomatoes","Banana"],probs:["Blight","Leaf rust"],rate:3,unit:"kg",controls:"Coffee leaf rust, blights and leaf spots.",dose:"2.5–4 kg/ha in about 200 L water.",method:"Spray all leaf surfaces; avoid mixing with incompatible products.",phi:"7 days (confirm on label)",safety:"Irritant to eyes. Toxic to fish."},
{id:8,name:"Metalaxyl-M + Mancozeb WP",cat:"Fungicides",ai:"Metalaxyl-M + Mancozeb",packs:[["1 kg",45000]],stock:1,crops:["Tomatoes"],probs:["Blight"],rate:2.5,unit:"kg",controls:"Late blight (curative and protective).",dose:"2–3 kg/ha in about 200 L water.",method:"Alternate with other fungicide groups to slow resistance.",phi:"14 days (confirm on label)",safety:"Wear full PPE. Do not contaminate water."},
{id:9,name:"NPK 17:17:17",cat:"Fertilizers",ai:"Compound fertilizer",packs:[["50 kg",150000]],stock:1,crops:["Maize","Beans","Tomatoes","Banana","Coffee"],probs:["Poor soil fertility"],rate:250,unit:"kg",controls:"Supplies nitrogen, phosphorus and potassium at planting or early growth.",dose:"About 200–300 kg/ha; a soil test gives a better rate.",method:"Place near the plant and cover with soil; do not touch seed or stem.",phi:"Not applicable",safety:"Keep dry and away from food."},
{id:10,name:"Urea 46%",cat:"Fertilizers",ai:"Nitrogen 46%",packs:[["50 kg",140000]],stock:1,crops:["Maize","Banana"],probs:["Poor soil fertility"],rate:100,unit:"kg",controls:"Nitrogen top-dressing for leafy growth.",dose:"About 100 kg/ha, split if possible.",method:"Side-dress when soil is moist, 4–6 weeks after planting.",phi:"Not applicable",safety:"Avoid skin and eye contact."},
{id:11,name:"Certified maize seed (2 kg)",cat:"Seeds",ai:"Certified seed",packs:[["2 kg",20000]],stock:1,crops:["Maize"],probs:[],controls:"Certified seed suited to local conditions; ask staff for varieties in stock.",dose:"About 10 kg/ha (confirm on pack).",method:"Plant at onset of rains with recommended spacing.",phi:"Not applicable",safety:"Treated seed: do not eat or feed to animals."},
{id:12,name:"Amitraz acaricide",cat:"Veterinary",ai:"Amitraz",packs:[["500 ml",30000]],stock:1,crops:["Cattle"],probs:["Ticks"],controls:"Ticks on cattle (dip or spray).",dose:"Dilution varies; follow the label exactly.",method:"Wet the whole animal; keep run-off away from water.",phi:"Observe meat and milk withdrawal period on label",safety:"Wear gloves and mask. Do not use on young calves unless the label allows."},
{id:13,name:"Knapsack sprayer 16 L",cat:"Equipment",ai:"Manual sprayer",packs:[["Each",85000]],stock:1,crops:[],probs:[],controls:"Standard 16-litre back-pack sprayer.",dose:"Not applicable",method:"Calibrate before use; wash after every spray.",phi:"Not applicable",safety:"Never use the same sprayer for herbicides and other crop sprays without washing thoroughly."}
];
const $=s=>document.querySelector(s),ugx=n=>"UGX "+Number(n).toLocaleString("en-UG");
const minP=p=>Math.min(...p.packs.map(x=>x[1]));
let cart=JSON.parse(localStorage.getItem("cart")||"[]");

/* Toast */
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}

/* Dark mode */
if(localStorage.dark==="1")document.documentElement.classList.add("dark");
$("#dark").onclick=()=>{const d=document.documentElement.classList.toggle("dark");localStorage.dark=d?"1":"0"};

/* Catalogue */
$("#cat").innerHTML='<option value="">All categories</option>'+CATS.map(c=>`<option>${c}</option>`).join("");
function card(p){return `<article class="card flex flex-col"><div class="flex justify-between items-start gap-2"><span class="badge" style="background:var(--sand)">${p.cat}</span><span class="badge ${p.stock?"in":"out"}">${p.stock?"In stock":"Out of stock"}</span></div>
<h3 class="font-bold text-lg mt-2">${p.name}</h3><p class="text-sm" style="color:var(--mute)">${p.ai}</p>
<p class="text-sm mt-1">Packs: ${p.packs.map(x=>x[0]).join(", ")}</p><p class="font-extrabold mt-1">From ${ugx(minP(p))}</p>
<div class="flex gap-2 mt-3"><button class="btn btn-out flex-1" data-info="${p.id}">Details</button><button class="btn btn-green flex-1" data-add="${p.id}" ${p.stock?"":"disabled"}>Add</button></div></article>`}
function render(){const q=$("#q").value.toLowerCase(),c=$("#cat").value,s=$("#sort").value;
 let l=PRODUCTS.filter(p=>(!c||p.cat===c)&&(p.name+p.ai).toLowerCase().includes(q));
 l.sort((a,b)=>s==="lo"?minP(a)-minP(b):s==="hi"?minP(b)-minP(a):a.name.localeCompare(b.name));
 $("#grid").innerHTML=l.map(card).join("")||"<p>No products match. Try another search or ask us on WhatsApp.</p>"}
["#q","#cat","#sort"].forEach(i=>$(i).addEventListener("input",render));render();

/* Product details */
function info(id){const p=PRODUCTS.find(x=>x.id==id);const d=$("#pm");
 d.innerHTML=`<h3 class="text-xl font-extrabold">${p.name}</h3><p style="color:var(--mute)">${p.ai}</p>
 <dl class="mt-3 grid gap-2 text-sm"><div><b>Controls / use:</b> ${p.controls}</div><div><b>Suits:</b> ${p.crops.join(", ")||"See staff"}</div><div><b>Dosage (sample):</b> ${p.dose}</div><div><b>How to apply:</b> ${p.method}</div><div><b>Pre-harvest interval:</b> ${p.phi}</div></dl>
 <p class="warn mt-3 text-sm"><b>Safety:</b> ${p.safety} Always read the label.</p>
 <div class="flex gap-2 mt-4"><button class="btn btn-green" data-add="${p.id}" ${p.stock?"":"disabled"}>Add to cart</button><button class="btn btn-out" onclick="this.closest('dialog').close()">Close</button></div>`;d.showModal()}

/* Advisor */
$("#aCrop").innerHTML='<option value="">Choose crop or animal</option>'+CROPS.map(c=>`<option>${c}</option>`).join("");
$("#aProb").innerHTML='<option value="">Choose problem</option>'+PROBS.map(c=>`<option>${c}</option>`).join("");
function advise(){const c=$("#aCrop").value,pr=$("#aProb").value,o=$("#aOut");
 if(!c||!pr){o.innerHTML='<p>Pick a crop and a problem to see matching products.</p>';return}
 const m=PRODUCTS.filter(p=>p.crops.includes(c)&&p.probs.includes(pr));
 o.innerHTML=m.length?m.map(card).join(""):"<p>No exact match in our catalogue. Message us on WhatsApp and describe what you see.</p>"}
["#aCrop","#aProb"].forEach(i=>$(i).addEventListener("change",advise));advise();

/* Calculator: product = rate/ha x hectares; water = L/ha x hectares; tanks = water / tank size */
const calcP=PRODUCTS.filter(p=>p.rate);
$("#cProd").innerHTML=calcP.map(p=>`<option value="${p.id}">${p.name}</option>`).join("");
function calc(){const p=PRODUCTS.find(x=>x.id==$("#cProd").value),ha=$("#cArea").value/$("#cUnit").value,tank=+$("#cTank").value,w=+$("#cWater").value,o=$("#cOut");
 if(!(ha>0&&tank>0&&w>0)){o.textContent="Enter valid numbers.";return}
 const tot=p.rate*ha,water=w*ha,tanks=Math.ceil(water/tank),per=tot/(water/tank);
 const f=(v,u)=>u==="kg"&&v<1?(v*1000).toFixed(0)+" g":u==="L"&&v<1?(v*1000).toFixed(0)+" ml":v.toFixed(2)+" "+u;
 o.innerHTML=`Product needed: ${f(tot,p.unit)}<br>Water: ${water.toFixed(0)} L<br>Tank loads: ${tanks} (about ${f(per,p.unit)} per full tank)`}
document.querySelectorAll("#calculator input,#calculator select").forEach(e=>e.addEventListener("input",calc));calc();

/* Cart */
function save(){localStorage.setItem("cart",JSON.stringify(cart));$("#badge").textContent=cart.reduce((a,b)=>a+b.q,0)}
function add(id){const p=PRODUCTS.find(x=>x.id==id),k=cart.find(x=>x.id==id);k?k.q++:cart.push({id:+id,q:1,pack:0});save();toast("Added to cart")}
const line=i=>{const p=PRODUCTS.find(x=>x.id==i.id);return{p,price:p.packs[i.pack][1],t:p.packs[i.pack][1]*i.q}};
function showCart(){const d=$("#cart");const rows=cart.map((i,n)=>{const{p,t}=line(i);return `<div class="flex items-center gap-2 py-2 border-b" style="border-color:var(--line)"><div class="flex-1"><b>${p.name}</b><br><select class="field" data-pack="${n}">${p.packs.map((x,j)=>`<option value="${j}" ${j==i.pack?"selected":""}>${x[0]} · ${ugx(x[1])}</option>`).join("")}</select></div><button class="btn btn-out" data-dec="${n}" aria-label="Less">−</button><b>${i.q}</b><button class="btn btn-out" data-inc="${n}" aria-label="More">+</button><span class="w-28 text-right">${ugx(t)}</span></div>`}).join("");
 const total=cart.reduce((a,i)=>a+line(i).t,0);
 d.innerHTML=`<h3 class="text-xl font-extrabold mb-2">Your cart</h3>${rows||"<p>Your cart is empty.</p>"}<p class="font-extrabold text-lg mt-3">Total: ${ugx(total)}</p>
 ${cart.length?`<input id="oN" class="field mt-3" placeholder="Your name" aria-label="Name"><input id="oP" class="field mt-2" type="tel" placeholder="Phone" aria-label="Phone"><button class="btn btn-green w-full mt-3" data-send>Send order on WhatsApp</button>`:""}
 <button class="btn btn-out w-full mt-2" onclick="this.closest('dialog').close()">Close</button>`;if(!d.open)d.showModal()}
function send(){const n=$("#oN").value.trim(),ph=$("#oP").value.trim();if(!n||ph.length<9){toast("Add your name and a valid phone number");return}
 const lines=cart.map(i=>{const{p,t}=line(i);return `• ${p.name} (${p.packs[i.pack][0]}) x${i.q} = ${ugx(t)}`}).join("\n");
 const total=cart.reduce((a,i)=>a+line(i).t,0);
 const msg=`Hello ${CONFIG.biz}, I would like to order:\n${lines}\nTotal: ${ugx(total)}\nName: ${n}\nPhone: ${ph}`;
 open(`https://wa.me/${CONFIG.wa}?text=${encodeURIComponent(msg)}`,"_blank");}

/* One delegated click handler */
document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t)return;const g=a=>t.dataset[a];
 if(g("info"))info(g("info"));
 else if(g("add")){add(g("add"));if(t.closest("#cart"))showCart()}
 else if(g("inc")){cart[g("inc")].q++;save();showCart()}
 else if(g("dec")){const i=cart[g("dec")];if(--i.q<1)cart.splice(g("dec"),1);save();showCart()}
 else if(t.hasAttribute("data-send"))send();
 else if(t.id==="cartBtn")showCart()});
document.addEventListener("change",e=>{if(e.target.dataset.pack!==undefined){cart[e.target.dataset.pack].pack=+e.target.value;save();showCart()}});
$("#cf").addEventListener("submit",e=>{e.preventDefault();const n=$("#cfN").value.trim(),p=$("#cfP").value.trim(),m=$("#cfM").value.trim();
 if(!n||p.length<9||!m){toast("Please fill in all fields");return}
 open(`https://wa.me/${CONFIG.wa}?text=${encodeURIComponent(`Hello, I'm ${n} (${p}). ${m}`)}`,"_blank")});
$("#waHero").href=`https://wa.me/${CONFIG.wa}?text=${encodeURIComponent("Hello "+CONFIG.biz)}`;
save();
