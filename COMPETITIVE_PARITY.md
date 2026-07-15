# Rangoons — competitive parity

**Target:** WhatsApp Business Catalog + Shopify lite

| Feature | API (`apps/commerce-api`) |
|---------|---------------------------|
| Catalog + inventory | `GET /catalog`, `/inventory` |
| Cart + checkout | multi-channel incl. WhatsApp |
| WA webhook commerce | `POST /wa/webhook` (CATALOG / ORDER / CHECKOUT) |
| SME dashboard | `GET /dashboard` |

```bash
cd apps/commerce-api && node server.js
```
