# 🌐 DNS Setup Guide for Porkbun

This guide will help you configure DNS records on Porkbun to make `www.rangoons.my` accessible from the internet.

## 🔑 **Required Information**

- **Domain**: `rangoons.my`
- **Static IP**: `154.57.212.38`
- **Porkbun API Key**: `pk1_1cbdd6744bd2857132ac1e03b0e2b0d0a7cd964d3aeab7fb1a36f296a1da388c`
- **Porkbun Secret API Key**: Will be prompted for during execution

## 📋 **Method 1: Automated API Configuration (Recommended)**

### **Step 1: Get Your Secret API Key**

1. **Login to Porkbun** at https://porkbun.com
2. **Go to Account** → **API Access**
3. **Copy your Secret API Key** (it looks like: `sk1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### **Step 2: Run the Configuration**

The script will automatically prompt you for your Secret API Key - no manual editing required!

```bash
# Option 1: Use the batch file (easiest)
integrations\configure-dns.bat

# Option 2: Run directly
cd integrations
node configure-porkbun-dns.js
```

### **Step 3: Enter Your Secret Key**

When prompted, simply paste your Secret API Key and press Enter. The script will:
- ✅ Validate your credentials
- ✅ Fetch current DNS records
- ✅ Create/update required records
- ✅ Test DNS resolution
- ✅ Provide detailed feedback

## 📋 **Method 2: Manual DNS Configuration**

### **Step 1: Access Porkbun DNS Management**

1. **Login to Porkbun** at https://porkbun.com
2. **Click on your domain** `rangoons.my`
3. **Click "DNS Records"** or "DNS Management"

### **Step 2: Create Required DNS Records**

#### **A Record for Root Domain**
```
Type: A
Name: @ (or leave blank)
Value: 154.57.212.38
TTL: 300
Notes: Rangoons Primary Server
```

#### **A Record for WWW Subdomain**
```
Type: A
Name: www
Value: 154.57.212.38
TTL: 300
Notes: Rangoons WWW Subdomain
```

### **Step 3: Verify Records**

Your DNS records should look like this:
```
@    A    154.57.212.38    300
www  A    154.57.212.38    300
```

## 🚨 **Important: Port Forwarding Required**

Even after DNS is configured, you need **router port forwarding**:

### **Required Port Forwarding**
- **External Port 80** → **Internal Port 8080** (HTTP)
- **External Port 443** → **Internal Port 8080** (HTTPS later)

### **Why Port Forwarding is Needed**
- DNS points `www.rangoons.my` to your static IP `154.57.212.38`
- But your C++ server runs on port `8080` (internal)
- External traffic comes on port `80` (standard HTTP)
- Router must forward port 80 to your computer's port 8080

## 🔍 **Testing DNS Configuration**

### **Test DNS Resolution**
```bash
# Windows
nslookup www.rangoons.my
ping www.rangoons.my

# Check if it resolves to your IP
# Should show: 154.57.212.38
```

### **Test HTTP Access**
```bash
# Test with port 80 (requires port forwarding)
curl -I http://www.rangoons.my

# Test with direct IP and port
curl -I http://154.57.212.38:8080
```

## ⏱️ **DNS Propagation Timeline**

- **Local**: 15 minutes
- **Regional**: 1-4 hours
- **Global**: 24-48 hours
- **Usually**: 2-6 hours for most users

## 🚨 **Common Issues & Solutions**

### **Issue: DNS Not Propagating**
- **Solution**: Wait longer (up to 48 hours)
- **Check**: Use online DNS checkers like whatsmydns.net

### **Issue: Can't Access Website**
- **Check**: DNS resolution with `nslookup www.rangoons.my`
- **Check**: Port forwarding on router
- **Check**: C++ server is running on port 8080

### **Issue: API Errors**
- **Check**: API key and secret key are correct
- **Check**: Domain ownership on Porkbun
- **Check**: API access is enabled

## 📱 **Mobile Testing**

### **Test on Mobile Devices**
1. **Connect to different WiFi** (not your home network)
2. **Try accessing**: `http://www.rangoons.my`
3. **Should work** if DNS and port forwarding are correct

### **Test on Mobile Data**
1. **Turn off WiFi** on your phone
2. **Use mobile data**
3. **Try accessing**: `http://www.rangoons.my`

## 🔒 **Security Considerations**

### **Current Setup**
- **HTTP only** (not encrypted)
- **Local network access** to your server
- **Basic security** with C++ server

### **Future Improvements**
- **HTTPS/SSL**: Add SSL certificate
- **Firewall**: Configure Windows Firewall
- **Authentication**: Add admin login
- **Rate limiting**: Prevent abuse

## 📊 **Monitoring & Maintenance**

### **DNS Health Checks**
```bash
# Check DNS resolution
nslookup www.rangoons.my

# Check website accessibility
curl -I http://www.rangoons.my

# Check server status
curl http://localhost:8080/health
```

### **Regular Maintenance**
- **Monitor DNS propagation**
- **Check port forwarding**
- **Verify server uptime**
- **Update SSL certificates** (when added)

## 🎯 **Success Checklist**

- [ ] DNS records created on Porkbun
- [ ] DNS propagation confirmed (`nslookup` shows correct IP)
- [ ] Router port forwarding configured (80→8080)
- [ ] C++ server running on port 8080
- [ ] Website accessible at `http://www.rangoons.my`
- [ ] Mobile devices can access the site
- [ ] Edge computing nodes are accessible

## 🆘 **Need Help?**

### **DNS Issues**
- Check Porkbun support
- Verify domain ownership
- Test with different DNS servers

### **Port Forwarding Issues**
- Check router manual
- Verify internal IP address
- Test with direct IP access

### **Server Issues**
- Check C++ server logs
- Verify PostgreSQL is running
- Test local access first

---

## 🎉 **Quick Start Summary**

1. **Get Secret API Key** from Porkbun (Account → API Access)
2. **Run DNS configuration**: `integrations\configure-dns.bat`
3. **Enter Secret Key** when prompted (no editing required!)
4. **Configure router port forwarding** (80→8080)
5. **Wait for DNS propagation** (2-6 hours)
6. **Test external access**: `http://www.rangoons.my`

Your Rangoons edge computing system will then be accessible from anywhere on the internet! 🌐🚀
