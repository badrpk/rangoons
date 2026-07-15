/**
 * Rangoons WhatsApp-first commerce API
 * Parity target: WhatsApp Business Catalog + Shopify lite
 */
const http = require("http");
const { URL } = require("url");
const crypto = require("crypto");
const PORT = process.env.PORT || 8795;
const uid = (p) => `${p}_${crypto.randomBytes(4).toString("hex")}`;
const iso = () => new Date().toISOString();

const catalog = [
  { id: "c1", title: "Cotton Kurta", price_pkr: 2499, stock: 40, category: "apparel", sku: "KT-01" },
  { id: "c2", title: "Wireless Earbuds", price_pkr: 3999, stock: 25, category: "electronics", sku: "EB-02" },
  { id: "c3", title: "Kitchen Blender", price_pkr: 5499, stock: 15, category: "home", sku: "BL-03" },
];
const carts = {};
const orders = {};
const waInbox = [];

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
    return json(res, 200, { ok: true, service: "rangoons", version: "2.0.0",
      parity_target: "WhatsApp Business Catalog + Shopify checkout" });
  }
  if (p === "/capabilities") return json(res, 200, { ok: true, competitor: "WA Business + Shopify",
    features: ["catalog", "inventory", "cart", "checkout", "whatsapp_webhook", "order_status", "sme_dashboard"] });
  if (p === "/catalog") {
    const cat = u.searchParams.get("category");
    let rows = catalog;
    if (cat) rows = rows.filter(c => c.category === cat);
    return json(res, 200, { ok: true, products: rows });
  }
  if (p === "/inventory") return json(res, 200, { ok: true, inventory: catalog.map(c => ({ sku: c.sku, stock: c.stock, id: c.id })) });
  if (p === "/orders") return json(res, 200, { ok: true, orders: Object.values(orders) });
  if (p === "/wa/inbox") return json(res, 200, { ok: true, messages: waInbox });
  if (p === "/dashboard") {
    const rev = Object.values(orders).reduce((s, o) => s + (o.total_pkr || 0), 0);
    return json(res, 200, { ok: true, sme: { orders: Object.keys(orders).length, revenue_pkr: rev, skus: catalog.length, wa_messages: waInbox.length } });
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
  if (req.method === "POST" && p === "/checkout") {
    const b = await body(req);
    const user = b.user || "guest";
    const items = carts[user] || [];
    if (!items.length) return json(res, 400, { ok: false, error: "cart_empty" });
    for (const line of items) {
      const prod = catalog.find(c => c.id === line.product_id);
      if (!prod || prod.stock < line.qty) return json(res, 400, { ok: false, error: "stock", product_id: line.product_id });
      prod.stock -= line.qty;
    }
    const total = items.reduce((s, i) => s + i.unit_price * i.qty, 0);
    const id = uid("rg");
    const order = {
      id, user, items, total_pkr: total, channel: b.channel || "whatsapp",
      phone: b.phone || "", address: b.address || "", status: "placed",
      payment_method: b.payment_method || "cod", created_at: iso(),
      wa_confirmation: `Order ${id} confirmed. Total Rs ${total}. Reply HELP for support.`,
    };
    orders[id] = order;
    carts[user] = [];
    return json(res, 201, { ok: true, order });
  }
  if (req.method === "POST" && p === "/wa/webhook") {
    const b = await body(req);
    const msg = { id: uid("wa"), from: b.from || "", text: b.text || "", at: iso() };
    waInbox.unshift(msg);
    let reply = "Welcome to Rangoons! Reply CATALOG to browse or ORDER <sku> <qty>.";
    const t = (b.text || "").trim().toUpperCase();
    if (t === "CATALOG") reply = catalog.map(c => `${c.sku}: ${c.title} — Rs ${c.price_pkr}`).join("\n");
    if (t.startsWith("ORDER ")) {
      const parts = t.split(/\s+/);
      const sku = parts[1]; const qty = parseInt(parts[2] || "1", 10);
      const prod = catalog.find(c => c.sku === sku);
      if (prod && prod.stock >= qty) {
        const user = b.from || "wa_user";
        carts[user] = [{ product_id: prod.id, title: prod.title, qty, unit_price: prod.price_pkr }];
        reply = `Added ${qty}x ${prod.title}. Send CHECKOUT to place order.`;
      } else reply = "SKU not available.";
    }
    if (t === "CHECKOUT") {
      const user = b.from || "wa_user";
      const items = carts[user] || [];
      if (!items.length) reply = "Cart empty.";
      else {
        const total = items.reduce((s, i) => s + i.unit_price * i.qty, 0);
        const id = uid("rg");
        orders[id] = { id, user, items, total_pkr: total, channel: "whatsapp", status: "placed", created_at: iso() };
        for (const line of items) {
          const prod = catalog.find(c => c.id === line.product_id);
          if (prod) prod.stock -= line.qty;
        }
        carts[user] = [];
        reply = `Order ${id} placed. Total Rs ${total}.`;
      }
    }
    return json(res, 200, { ok: true, inbound: msg, reply });
  }
  if (req.method === "POST" && p === "/inventory/adjust") {
    const b = await body(req);
    const prod = catalog.find(c => c.id === b.product_id || c.sku === b.sku);
    if (!prod) return json(res, 404, { ok: false });
    prod.stock = Math.max(0, (prod.stock || 0) + Number(b.delta || 0));
    return json(res, 200, { ok: true, product: prod });
  }
  json(res, 404, { ok: false });
}).listen(PORT, "127.0.0.1", () => console.log(`Rangoons commerce v2 http://127.0.0.1:${PORT}`));
