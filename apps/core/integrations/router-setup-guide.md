# 🌐 Router Port Forwarding Setup Guide

## 🎯 Current Status
- ✅ **DNS**: rangoons.live → 154.57.212.38
- ✅ **Server**: Running on port 8080
- ❌ **Port 80**: Not accessible (needs forwarding)
- ❌ **Port 443**: Not accessible (needs forwarding)

## 🚀 Step-by-Step Router Configuration

### 1. Access Your Router
- **Router IP**: 192.168.18.1
- **Your PC IP**: 192.168.18.73
- **Open Browser**: http://192.168.18.1
- **Login**: Use your router admin credentials

### 2. Find Port Forwarding Section
Look for one of these menu options:
- **Port Forwarding**
- **Virtual Server**
- **NAT Forwarding**
- **Port Mapping**
- **Applications & Gaming**

### 3. Configure Port Forwarding Rules

#### Rule 1: HTTP (Port 80)
```
Service Name: Rangoons HTTP
External Port: 80
Internal IP: 154.57.212.38
Internal Port: 8080
Protocol: TCP
Status: Enabled
```

#### Rule 2: HTTPS (Port 443)
```
Service Name: Rangoons HTTPS
External Port: 443
Internal IP: 154.57.212.38
Internal Port: 8080
Protocol: TCP
Status: Enabled
```

### 4. Save and Apply
- Click **Save** or **Apply**
- Wait for router to restart (if prompted)
- Test the configuration

## 🧪 Testing After Configuration

### Test HTTP (Port 80)
```powershell
# Should work after port forwarding
Invoke-WebRequest -Uri "http://rangoons.live" -Method Head
```

### Test HTTPS (Port 443)
```powershell
# Should work after port forwarding
Invoke-WebRequest -Uri "https://rangoons.live" -Method Head
```

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Router Not Accessible
- Try: 192.168.18.1, 192.168.1.1, 192.168.0.1
- Check if you're on the same network

#### 2. Port Forwarding Not Working
- Verify internal IP is correct (154.57.212.38)
- Check if server is running on port 8080
- Ensure Windows Firewall allows port 8080

#### 3. ISP Blocking Ports
- Some ISPs block ports 80/443
- Contact your ISP to unblock if needed

### Windows Firewall Setup
Run this as Administrator:
```cmd
netsh advfirewall firewall add rule name="Rangoons Server" dir=in action=allow protocol=TCP localport=8080
```

## 📱 Mobile Edge Computing Integration

After port forwarding:
- **Primary**: http://rangoons.live (port 80)
- **Vivo Edge**: http://192.168.18.22:8080
- **Samsung Edge**: http://192.168.18.160:8080

## 🎉 Expected Results

Once configured:
- **http://rangoons.live** → ✅ Works (no port needed)
- **https://rangoons.live** → ✅ Works (no port needed)
- **http://www.rangoons.live** → ✅ Works (no port needed)

## 🚀 Quick Test Commands

After setting up port forwarding, test with:
```powershell
# Test HTTP
curl http://rangoons.live

# Test HTTPS
curl https://rangoons.live

# Test from external (use mobile data)
# Visit: http://rangoons.live
```

---

**🎯 Ready to configure your router? Follow the steps above to enable standard port access!**
