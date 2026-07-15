# 🚀 Quick Setup Checklist for Port Forwarding

## ✅ What's Already Working
- [x] **DNS**: rangoons.live → 154.57.212.38
- [x] **Server**: Running on port 8080
- [x] **External Access**: Available via port 8080

## 🔧 What Needs Configuration
- [ ] **Router Port Forwarding**: Ports 80→8080, 443→8080
- [ ] **Windows Firewall**: Allow port 8080 (run as admin)

## 🎯 Quick Setup Steps

### 1. Windows Firewall (Run as Administrator)
```cmd
netsh advfirewall firewall add rule name="Rangoons Server" dir=in action=allow protocol=TCP localport=8080
```

### 2. Router Configuration
- **Access**: http://192.168.18.1
- **Login**: Your router admin credentials
- **Find**: Port Forwarding / Virtual Server / NAT

### 3. Add These Rules
```
Rule 1: HTTP
- External Port: 80
- Internal IP: 154.57.212.38
- Internal Port: 8080
- Protocol: TCP

Rule 2: HTTPS
- External Port: 443
- Internal IP: 154.57.212.38
- Internal Port: 8080
- Protocol: TCP
```

### 4. Test Results
After configuration:
- **http://rangoons.live** → ✅ Works (no port needed)
- **https://rangoons.live** → ✅ Works (no port needed)

## 🧪 Test Commands
```powershell
# Test current status (port 8080)
Invoke-WebRequest -Uri "http://rangoons.live:8080" -Method Head

# Test after port forwarding (port 80)
Invoke-WebRequest -Uri "http://rangoons.live" -Method Head
```

## 🎉 Expected Outcome
Your website will be accessible worldwide at:
- **http://rangoons.live** (no port number needed)
- **http://www.rangoons.live** (no port number needed)

## 📱 Mobile Edge Computing Ready
- **Primary**: http://rangoons.live (port 80)
- **Vivo Edge**: http://192.168.18.22:8080
- **Samsung Edge**: http://192.168.18.160:8080

---

**🚀 Ready to configure? Start with the router at http://192.168.18.1**
