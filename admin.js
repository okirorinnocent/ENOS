/* Admin: sign in, add products, delete products, toggle stock. Security is enforced by Supabase RLS (supabase.sql), not by this page. */
const $ = s => document.querySelector(s), C = window.CFG;
const CATS = ["Herbicides", "Insecticides", "Fungicides", "Fertilizers", "Seeds", "Veterinary", "Equipment"];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const list = v => (v || "").split(",").map(x => x.trim()).filter(Boolean);
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2600) }
$("#add").category.innerHTML = '<option value="">Category *</option>' + CATS.map(c => `<option>${c}</option>`).join("");
if (!C.SUPA || !C.KEY) { $("#setup").classList.remove("hidden") }
else {
  const db = supabase.createClient(C.SUPA, C.KEY);
  async function isAdmin() {
    const { data: { user } } = await db.auth.getUser(); if (!user) return false;
    const { data, error } = await db.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
    if (error) window.adminErr = error.message; return !!data
  }
  async function show() {
    const ok = await isAdmin();
    $("#login").classList.toggle("hidden", ok); $("#panel").classList.toggle("hidden", !ok); $("#out").classList.toggle("hidden", !ok);
    if (ok) refresh(); else if ((await db.auth.getUser()).data.user) { $("#lerr").textContent = window.adminErr ? "Could not check admin list: " + window.adminErr : "This account is not an admin."; await db.auth.signOut(); show() }
  }
  async function refresh() {
    const { data, error } = await db.from("products").select("id,name,category,in_stock,image_url").order("name");
    if (error) { toast("Could not load products"); return }
    $("#n").textContent = data.length;
    $("#list").innerHTML = data.map(p => `<div class="card flex items-center gap-3">${p.image_url ? `<img src="${esc(p.image_url)}" alt="" class="rounded" style="width:3rem;height:3rem;object-fit:cover">` : ""}
   <div class="flex-1"><b>${esc(p.name)}</b><br><span class="text-sm" style="color:var(--mute)">${esc(p.category)}</span></div>
   <button class="btn btn-out" data-stock="${p.id}" data-v="${p.in_stock}">${p.in_stock ? "In stock" : "Out of stock"}</button>
   <button class="btn btn-out" style="color:#b3261e" data-del="${p.id}" data-name="${esc(p.name)}" data-img="${esc(p.image_url || "")}">Delete</button></div>`).join("") || "<p>No products yet. Add one above or import the samples.</p>"
  }

  $("#login").onsubmit = async e => {
    e.preventDefault(); $("#lerr").textContent = "";
    const { error } = await db.auth.signInWithPassword({ email: $("#em").value, password: $("#pw").value });
    if (error) { $("#lerr").textContent = "Wrong email or password."; return } show()
  };
  $("#out").onclick = async () => { await db.auth.signOut(); show() };

  $("#add").onsubmit = async e => {
    e.preventDefault(); const f = e.target, v = Object.fromEntries(new FormData(f));
    const btn = f.querySelector("button"); btn.disabled = true;
    let image_url = null; const file = $("#img").files[0];
    if (file) {
      const path = Date.now() + "-" + file.name.replace(/[^\w.-]/g, "_");
      const up = await db.storage.from("product-images").upload(path, file);
      if (up.error) { toast("Image upload failed"); btn.disabled = false; return }
      image_url = db.storage.from("product-images").getPublicUrl(path).data.publicUrl
    }
    const row = {
      name: v.name.trim(), category: v.category, active_ingredient: v.active_ingredient || null, packs: list(v.packs), price: v.price ? +v.price : null, in_stock: f.in_stock.checked,
      crops: list(v.crops), problems: list(v.problems), controls: v.controls || null, dosage: v.dosage || null, application: v.application || null, pre_harvest: v.pre_harvest || null, safety: v.safety || null,
      rate_per_ha: v.rate_per_ha ? +v.rate_per_ha : null, unit: v.unit || null, image_url
    };
    const { error } = await db.from("products").insert(row); btn.disabled = false;
    if (error) { toast("Could not save: " + error.message); return }
    f.reset(); f.in_stock.checked = true; toast("Product saved"); refresh()
  };

  $("#list").onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.del) {
      if (!confirm(`Delete "${b.dataset.name}"? This cannot be undone.`)) return;
      const { error } = await db.from("products").delete().eq("id", b.dataset.del);
      if (error) { toast("Could not delete"); return }
      const m = b.dataset.img.split("/product-images/")[1]; if (m) await db.storage.from("product-images").remove([decodeURIComponent(m)]);
      toast("Product deleted"); refresh()
    }
    else if (b.dataset.stock) {
      const { error } = await db.from("products").update({ in_stock: b.dataset.v !== "true" }).eq("id", b.dataset.stock);
      if (error) { toast("Could not update"); return } refresh()
    }
  };

  $("#imp").onclick = async () => {
    if (!confirm("Add the 13 sample products? Do this only once.")) return;
    const rows = SAMPLE_PRODUCTS.map(p => ({ name: p.name, category: p.cat, active_ingredient: p.ai, packs: p.packs.map(x => x[0]), price: Math.min(...p.packs.map(x => x[1])), in_stock: !!p.stock, crops: p.crops, problems: p.probs, controls: p.controls, dosage: p.dose, application: p.method, pre_harvest: p.phi, safety: p.safety, rate_per_ha: p.rate || null, unit: p.unit || null }));
    const { error } = await db.from("products").insert(rows); toast(error ? "Import failed: " + error.message : "Samples imported"); refresh()
  };
  show();
}