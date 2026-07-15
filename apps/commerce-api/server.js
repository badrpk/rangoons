/**
 * Rangoons commerce v3 — WA/Shopify gaps + multi-rail undercut plans
 */
const http = require("http");
const { URL } = require("url");
const crypto = require("crypto");
const pay = require("./payments");
const PORT = process.env.PORT || 8795;
const uid = (p) => `${p}_${crypto.randomBytes(4).toString("hex")}`;
const iso = () => new Date().toISOString();

const catalog = [
  { id: "c1", title: "Cotton Kurta", price_pkr: 1999, competitor_price_pkr: 2800, stock: 40, category: "apparel", sku: "KT-01" },
  { id: "c2", title: "Wireless Earbuds", price_pkr: 2999, competitor_price_pkr: 4500, stock: 25, category: "electronics", sku: "EB-02" },
  { id: "c3", title: "Kitchen Blender", price_pkr: 4299, competitor_price_pkr: 6000, stock: 15, category: "home", sku: "BL-03" },
];
const carts = {}, orders = {}, waInbox = [], abandoned = [], shipping = [
  { id: "std", name: "Standard", days: "3-5", fee_pkr: 150 },
  { id: "express", name: "Express", days: "1-2", fee_pkr: 350 },
];

function json(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify(obj, null, 2));
}
function body(req) {
  return new Promise((r) => { let d=""; req.on("data", c => d+=c); req.on("end", () => { try{r(JSON.parse(d||"{}"))}catch{r({})} }); });
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const p = u.pathname.replace(/\/$/, "") || "/";
  if (p === "/" || p === "/health") {
    return json(res, 200, { ok: true, service: "rangoons", version: "3.0.0",
      gaps_closed: ["shipping_rates", "abandoned_cart", "subscription_plans", "stripe_multi_rail", "undercut"] });
  }
  if (p === "/capabilities") return json(res, 200, { ok: true, competitor: "WA Business + Shopify",
    features: ["catalog","inventory","cart","checkout","wa_webhook","shipping","abandoned","plans","stripe","jazzcash"] });
  if (p === "/pricing") return json(res, 200, { ok: true, ...pay.pricing("rangoons") });
  if (p === "/payments/rails") return json(res, 200, { ok: true, rails: pay.RAILS });
  if (p === "/gap-analysis") return json(res, 200, { ok: true, added: ["shipping", "abandoned cart recovery", "plans $9.99 vs Shopify $29", "stripe"] });
  if (p === "/catalog") {
    const cat = u.searchParams.get("category");
    let rows = catalog; if (cat) rows = rows.filter(c => c.category === cat);
    return json(res, 200, { ok: true, products: rows.map(c => ({...c, save_pkr: c.competitor_price_pkr - c.price_pkr})) });
  }
  if (p === "/inventory") return json(res, 200, { ok: true, inventory: catalog.map(c => ({ sku: c.sku, stock: c.stock, id: c.id })) });
  if (p === "/shipping") return json(res, 200, { ok: true, rates: shipping });
  if (p === "/orders") return json(res, 200, { ok: true, orders: Object.values(orders) });
  if (p === "/wa/inbox") return json(res, 200, { ok: true, messages: waInbox });
  if (p === "/abandoned") return json(res, 200, { ok: true, carts: abandoned });
  if (p === "/dashboard") {
    const rev = Object.values(orders).reduce((s, o) => s + (o.total_pkr || 0), 0);
    return json(res, 200, { ok: true, sme: { orders: Object.keys(orders).length, revenue_pkr: rev, skus: catalog.length, abandoned: abandoned.length } });
  }
  if (req.method === "POST" && p === "/cart/add") {
    const b = await body(req);
    const user = b.user || "guest";
    const prod = catalog.find(c => c.id === b.product_id);
    if (!prod) return json(res, 400, { ok: false, error: "unknown_product" });
    carts[user] = carts[user] || [];
    carts[user].push({ product_id: prod.id, title: prod.title, qty: b.qty || 1, unit_price: prod.price_pkr });
    return json(res, 200, { ok: true, cart: carts[user] });
  }
  if (req.method === "POST" && p === "/cart/abandon") {
    const b = await body(req);
    const user = b.user || "guest";
    abandoned.push({ user, items: carts[user] || [], at: iso(), recovered: false });
    return json(res, 200, { ok: true, abandoned: true });
  }
  if (req.method === "POST" && p === "/checkout") {
    const b = await body(req);
    const user = b.user || "guest";
    const items = carts[user] || [];
    if (!items.length) return json(res, 400, { ok: false, error: "cart_empty" });
    for (const line of items) {
      const prod = catalog.find(c => c.id === line.product_id);
      if (!prod || prod.stock < line.qty) return json(res, 400, { ok: false, error: "stock" });
      prod.stock -= line.qty;
    }
    const ship = shipping.find(s => s.id === b.shipping_id) || shipping[0];
    const sub = items.reduce((s, i) => s + i.unit_price * i.qty, 0);
    const total = sub + ship.fee_pkr;
    const method = b.payment_method || "cod";
    const inv = await pay.createInvoice({ product: "rangoons", amount: total, currency: "PKR", method, customer: user, description: "Rangoons order" });
    const id = uid("rg");
    const order = {
      id, user, items, shipping: ship, subtotal_pkr: sub, total_pkr: total, channel: b.channel || "whatsapp",
      phone: b.phone || "", address: b.address || "", status: "placed", payment_method: method,
      invoice_id: inv.id, payment: inv, created_at: iso(),
      wa_confirmation: `Order ${id} confirmed. Total Rs ${total}.`,
    };
    orders[id] = order; carts[user] = [];
    return json(res, 201, { ok: true, order });
  }
  if (req.method === "POST" && p === "/plans/subscribe") {
    const b = await body(req);
    const inv = await pay.createInvoice({ product: "rangoons", amount: 0, currency: "USD", method: b.method || "stripe", sku: b.sku || "starter", customer: b.user || "sme" });
    return json(res, 201, { ok: true, invoice: inv, note: "$9.99 SME plan vs Shopify $29" });
  }
  if (req.method === "POST" && p === "/wa/webhook") {
    const b = await body(req);
    const msg = { id: uid("wa"), from: b.from || "", text: b.text || "", at: iso() };
    waInbox.unshift(msg);
    let reply = "Welcome to Rangoons! CATALOG | ORDER <sku> <qty> | CHECKOUT";
    const t = (b.text || "").trim().toUpperCase();
    if (t === "CATALOG") reply = catalog.map(c => `${c.sku}: ${c.title} — Rs ${c.price_pkr}`).join("\n");
    if (t.startsWith("ORDER ")) {
      const parts = t.split(/\s+/); const sku = parts[1]; const qty = parseInt(parts[2] || "1", 10);
      const prod = catalog.find(c => c.sku === sku);
      if (prod && prod.stock >= qty) {
        const user = b.from || "wa_user";
        carts[user] = [{ product_id: prod.id, title: prod.title, qty, unit_price: prod.price_pkr }];
        reply = `Added ${qty}x ${prod.title}. Send CHECKOUT.`;
      } else reply = "SKU not available.";
    }
    if (t === "CHECKOUT") {
      const user = b.from || "wa_user";
      const items = carts[user] || [];
      if (!items.length) reply = "Cart empty.";
      else {
        const total = items.reduce((s, i) => s + i.unit_price * i.qty, 0) + 150;
        const id = uid("rg");
        const inv = await pay.createInvoice({ product: "rangoons", amount: total, currency: "PKR", method: "cod", customer: user });
        orders[id] = { id, user, items, total_pkr: total, channel: "whatsapp", status: "placed", payment: inv, created_at: iso() };
        for (const line of items) { const prod = catalog.find(c => c.id === line.product_id); if (prod) prod.stock -= line.qty; }
        carts[user] = [];
        reply = `Order ${id} placed. Total Rs ${total}.`;
      }
    }
    return json(res, 200, { ok: true, inbound: msg, reply });
  }
  if (req.method === "POST" && p === "/payments/create") {
    const b = await body(req);
    const inv = await pay.createInvoice({ product: "rangoons", amount: b.amount, currency: b.currency || "USD", method: b.method || "stripe", sku: b.sku });
    return json(res, 201, { ok: true, invoice: inv });
  }
  json(res, 404, { ok: false });
}).listen(PORT, "127.0.0.1", () => console.log(`Rangoons commerce v3 http://127.0.0.1:${PORT}`));
