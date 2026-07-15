# 🌐 DNS Setup Guide for RangoonsCore

## 🎯 Recommended Domain Names

### Primary Domain Options
- **rangoons.pk** - Main Pakistani domain
- **rangoons.shop** - E-commerce focused
- **rangoons.store** - Alternative store domain
- **rangoons.com** - International domain

### Subdomain Options
- **shop.rangoons.pk** - Main shop
- **api.rangoons.pk** - API endpoints
- **wa.rangoons.pk** - WhatsApp webhook

## 🚀 Quick DNS Setup

### 1. Domain Registration
Register your domain with any of these providers:
- **Pakistani**: PKNIC (.pk domains)
- **International**: Namecheap, GoDaddy, Google Domains

### 2. DNS Records Configuration

#### A Records (Point to your server IP)
```
Type: A
Name: @ (or leave blank for root domain)
Value: 154.57.212.38
TTL: 300 (5 minutes)

Type: A
Name: shop
Value: 154.57.212.38
TTL: 300

Type: A
Name: api
Value: 154.57.212.38
TTL: 300

Type: A
Name: wa
Value: 154.57.212.38
TTL: 300
```

#### CNAME Records (Aliases)
```
Type: CNAME
Name: www
Value: @ (or your domain)
TTL: 300

Type: CNAME
Name: store
Value: shop
TTL: 300
```

#### MX Records (Email - Optional)
```
Type: MX
Name: @
Value: mail.rangoons.pk
Priority: 10
TTL: 300
```

### 3. Example DNS Configuration

For domain **rangoons.pk**:
```
A     @       154.57.212.38    300
A     shop    154.57.212.38    300
A     api     154.57.212.38    300
A     wa      154.57.212.38    300
CNAME www     @                300
CNAME store  shop             300
```

## 🔧 Server Configuration Updates

### Update Server Files
After setting up DNS, update these files:

1. **server.cpp** - Update WhatsApp links
2. **wa-webhook.js** - Update webhook URLs
3. **simple-server.js** - Update shop links

### Example URLs After DNS Setup
- **Main Shop**: https://shop.rangoons.pk
- **API**: https://api.rangoons.pk
- **WhatsApp**: https://wa.rangoons.pk
- **Direct**: https://rangoons.pk

## 📱 WhatsApp Integration with Domain

### Update WhatsApp Bot Messages
```javascript
// Before (IP address)
const shopUrl = "http://154.57.212.38:8080";

// After (Domain)
const shopUrl = "https://shop.rangoons.pk";
```

### Update QR Code Links
```javascript
// Update in wa-webhook.js
const message = `🛍️ *Rangoons Shop*\n\n` +
               `🌐 Shop online: https://shop.rangoons.pk\n` +
               `📞 Need help? Message us here!`;
```

## 🌍 SSL/HTTPS Setup

### 1. Get Free SSL Certificate
Use Let's Encrypt for free SSL:
```bash
# Install Certbot
# Windows: Download from https://certbot.eff.org/
# Linux: sudo apt install certbot

# Get certificate
certbot certonly --standalone -d rangoons.pk -d shop.rangoons.pk
```

### 2. Update Server Configuration
```javascript
// In your server files, add HTTPS support
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('/path/to/privkey.pem'),
    cert: fs.readFileSync('/path/to/fullchain.pem')
};

https.createServer(options, app).listen(443);
```

## 🔍 DNS Testing

### Test DNS Resolution
```bash
# Test A records
nslookup shop.rangoons.pk
nslookup api.rangoons.pk

# Test from different locations
dig rangoons.pk
```

### Test Website Access
- **Local**: http://localhost:8080
- **IP**: http://154.57.212.38:8080
- **Domain**: http://shop.rangoons.pk (after DNS setup)

## 🚨 Common DNS Issues

### 1. DNS Propagation
- **Time**: 24-48 hours for full propagation
- **Check**: Use online DNS checkers
- **Solution**: Wait and verify with multiple tools

### 2. TTL Settings
- **Low TTL**: Faster updates (300 seconds)
- **High TTL**: Better caching (3600 seconds)
- **Recommendation**: Start with 300, increase later

### 3. Firewall Rules
Ensure these ports are open:
- **80** - HTTP (redirect to HTTPS)
- **443** - HTTPS
- **8080** - Development server
- **3001** - WhatsApp webhook

## 📋 DNS Checklist

- [ ] Domain registered
- [ ] A records pointing to 154.57.212.38
- [ ] CNAME records for subdomains
- [ ] DNS propagation verified
- [ ] Server configuration updated
- [ ] SSL certificate installed (optional)
- [ ] WhatsApp bot updated with new URLs

## 🌟 Benefits of DNS Setup

1. **Professional Image** - Customers trust domains more than IPs
2. **Easy to Remember** - shop.rangoons.pk vs 154.57.212.38:8080
3. **SSL Support** - Enable HTTPS for security
4. **Scalability** - Easy to change server IP later
5. **Branding** - Consistent with your business name

---

**Next Step**: After DNS setup, update your server configuration files with the new domain names!
