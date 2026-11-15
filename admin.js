/* Admin: sign in, add / edit / delete products, add stock, change photos. Security is enforced by Supabase RLS (supabase.sql), not by this page. */
const $=s=>document.querySelector(s),C=window.CFG;
const CATS=["Herbicides","Insecticides","Fungicides","Fertilizers","Seeds","Veterinary","Equipment"];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const list=v=>(v||"").split(",").map(x=>x.trim()).filter(Boolean);
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
const F=$("#add");F.category.innerHTML='<option value="">Category *</option>'+CATS.map(c=>`<option>${c}</option>`).join("");
if(!C.SUPA||!C.KEY){$("#setup").classList.remove("hidden")}
else{
 const db=supabase.createClient(C.SUPA,C.KEY);let ROWS=[],editing=null;
 const imgPath=u=>{const m=(u||"").split("/product-images/")[1];return m?decodeURIComponent(m):null};
 async function isAdmin(){const{data:{user}}=await db.auth.getUser();if(!user)return false;
  const{data,error}=await db.from("admins").select("user_id").eq("user_id",user.id).maybeSingle();
  if(error)window.adminErr=error.message;return !!data}
 async function show(){const ok=await isAdmin();
  $("#login").classList.toggle("hidden",ok);$("#panel").classList.toggle("hidden",!ok);$("#out").classList.toggle("hidden",!ok);
  if(ok)refresh();else if((await db.auth.getUser()).data.user){$("#lerr").textContent=window.adminErr?"Could not check admin list: "+window.adminErr:"This account is not an admin.";await db.auth.signOut();show()}}
 async function refresh(){const{data,error}=await db.from("products").select("*").order("name");
  if(error){toast("Could not load products");return}
  ROWS=data;$("#n").textContent=data.length;
  $("#list").innerHTML=data.map(p=>`<div class="card flex flex-wrap items-center gap-2">${p.image_url?`<img src="${esc(p.image_url)}" alt="" class="rounded" style="width:3rem;height:3rem;object-fit:cover">`:""}
   <div class="flex-1" style="min-width:10rem"><b>${esc(p.name)}</b><br><span class="text-sm" style="color:var(--mute)">${esc(p.category)}${p.stock_qty!=null?" · Qty: "+p.stock_qty:""}</span></div>
   <button class="btn btn-out" data-addstock="${p.id}">+ Add stock</button>
   <button class="btn btn-out" data-stock="${p.id}">${p.in_stock?"In stock":"Out of stock"}</button>
   <button class="btn btn-out" data-edit="${p.id}">Edit</button>
   <button class="btn btn-out" style="color:#b3261e" data-del="${p.id}">Delete</button></div>`).join("")||"<p>No products yet. Add one above or import the samples.</p>"}

 function reset(){F.reset();F.in_stock.checked=true;F.id.value="";editing=null;$("#ftitle").textContent="Add a product";$("#save").textContent="Save product";
  $("#cancel").classList.add("hidden");$("#curimg").classList.add("hidden");$("#imglbl").textContent="Photo (optional)"}
 function edit(id){const p=ROWS.find(x=>x.id==id);editing=p;reset();editing=p;
  F.id.value=p.id;F.name.value=p.name;F.category.value=p.category;F.active_ingredient.value=p.active_ingredient||"";F.packs.value=(p.packs||[]).join(", ");
  F.price.value=p.price??"";F.stock_qty.value=p.stock_qty??"";F.in_stock.checked=p.in_stock;F.crops.value=(p.crops||[]).join(", ");F.problems.value=(p.problems||[]).join(", ");
  F.controls.value=p.controls||"";F.dosage.value=p.dosage||"";F.application.value=p.application||"";F.pre_harvest.value=p.pre_harvest||"";F.safety.value=p.safety||"";
  F.rate_per_ha.value=p.rate_per_ha??"";F.unit.value=p.unit||"";
  $("#ftitle").textContent="Edit: "+p.name;$("#save").textContent="Save changes";$("#cancel").classList.remove("hidden");
  if(p.image_url){$("#curpic").src=p.image_url;$("#curimg").classList.remove("hidden");$("#rmimg").checked=false;$("#imglbl").textContent="Replace photo (optional)"}
  F.scrollIntoView({behavior:"smooth"})}
 $("#cancel").onclick=reset;

 $("#login").onsubmit=async e=>{e.preventDefault();$("#lerr").textContent="";
  const{error}=await db.auth.signInWithPassword({email:$("#em").value,password:$("#pw").value});
  if(error){$("#lerr").textContent="Wrong email or password.";return}show()};
 $("#out").onclick=async()=>{await db.auth.signOut();show()};

 F.onsubmit=async e=>{e.preventDefault();const v=Object.fromEntries(new FormData(F)),btn=$("#save");btn.disabled=true;
  let image_url=editing?editing.image_url:null,oldPath=null;const file=$("#img").files[0];
  if(file){const path=Date.now()+"-"+file.name.replace(/[^\w.-]/g,"_");
   const up=await db.storage.from("product-images").upload(path,file);
   if(up.error){toast("Image upload failed: "+up.error.message);btn.disabled=false;return}
   oldPath=imgPath(image_url);image_url=db.storage.from("product-images").getPublicUrl(path).data.publicUrl}
  else if(editing&&$("#rmimg").checked){oldPath=imgPath(image_url);image_url=null}
  const row={name:v.name.trim(),category:v.category,active_ingredient:v.active_ingredient||null,packs:list(v.packs),price:v.price?+v.price:null,
   stock_qty:v.stock_qty!==""?+v.stock_qty:null,in_stock:F.in_stock.checked,crops:list(v.crops),problems:list(v.problems),controls:v.controls||null,dosage:v.dosage||null,
   application:v.application||null,pre_harvest:v.pre_harvest||null,safety:v.safety||null,rate_per_ha:v.rate_per_ha?+v.rate_per_ha:null,unit:v.unit||null,image_url};
  const q=editing?db.from("products").update(row).eq("id",editing.id):db.from("products").insert(row);
  const{error}=await q;btn.disabled=false;
  if(error){toast("Could not save: "+error.message);return}
  if(oldPath)await db.storage.from("product-images").remove([oldPath]);
  const was=!!editing;reset();toast(was?"Changes saved":"Product saved");refresh()};

 $("#list").onclick=async e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  if(d.edit)return edit(d.edit);
  if(d.del){const p=ROWS.find(x=>x.id==d.del);if(!confirm(`Delete "${p.name}"? This cannot be undone.`))return;
   const{error}=await db.from("products").delete().eq("id",p.id);if(error){toast("Could not delete");return}
   const m=imgPath(p.image_url);if(m)await db.storage.from("product-images").remove([m]);toast("Product deleted");refresh()}
  else if(d.stock){const p=ROWS.find(x=>x.id==d.stock);const{error}=await db.from("products").update({in_stock:!p.in_stock}).eq("id",p.id);
   if(error){toast("Could not update");return}refresh()}
  else if(d.addstock){const p=ROWS.find(x=>x.id==d.addstock);const n=parseInt(prompt(`How many units of "${p.name}" to add to stock?`,"1"),10);
   if(!(n>0))return;const{error}=await db.from("products").update({stock_qty:(p.stock_qty||0)+n,in_stock:true}).eq("id",p.id);
   if(error){toast("Could not update stock");return}toast("Stock updated");refresh()}};

 $("#imp").onclick=async()=>{if(!confirm("Add the 13 sample products? Do this only once."))return;
  const rows=SAMPLE_PRODUCTS.map(p=>({name:p.name,category:p.cat,active_ingredient:p.ai,packs:p.packs.map(x=>x[0]),price:Math.min(...p.packs.map(x=>x[1])),in_stock:!!p.stock,crops:p.crops,problems:p.probs,controls:p.controls,dosage:p.dose,application:p.method,pre_harvest:p.phi,safety:p.safety,rate_per_ha:p.rate||null,unit:p.unit||null}));
  const{error}=await db.from("products").insert(rows);toast(error?"Import failed: "+error.message:"Samples imported");refresh()};
 show();
}
