# 🌐 Huawei OptiXstar EG8145X6-10 Router Setup Guide

## 📱 Router Information
- **Model**: Huawei OptiXstar EG8145X6-10 GPON Terminal
- **Router IP**: 192.168.18.1
- **Username**: Epuser
- **Password**: SnnHBC33
- **WiFi SSID**: HUAWEI-2.4G-Ccv5 / HUAWEI-5G-Ccv5
- **WiFi Password**: WXfPJ444

## 🚀 Port Forwarding Configuration

### 1. Access Router Admin Panel
- **Open Browser**: http://192.168.18.1
- **Username**: Epuser
- **Password**: SnnHBC33
- **Click**: Login

### 2. Navigate to Port Forwarding
For Huawei routers, look for:
- **Advanced Settings** → **NAT** → **Port Forwarding**
- **Applications** → **Port Forwarding**
- **Security** → **Port Forwarding**
- **Firewall** → **Port Forwarding**

### 3. Add Port Forwarding Rules

#### Rule 1: HTTP (Port 80)
```
Service Name: Rangoons HTTP
External Port Start: 80
External Port End: 80
Internal Host: 154.57.212.38
Internal Port Start: 8080
Internal Port End: 8080
Protocol: TCP
Status: Enable
```

#### Rule 2: HTTPS (Port 443)
```
Service Name: Rangoons HTTPS
External Port Start: 443
External Port End: 443
Internal Host: 154.57.212.38
Internal Port Start: 8080
Internal Port End: 8080
Protocol: TCP
Status: Enable
```

### 4. Save Configuration
- Click **Apply** or **Save**
- Wait for router to apply changes
- Test the configuration

## 🔧 Alternative Huawei Menu Paths

If you can't find Port Forwarding, try these locations:

### Option 1: NAT Settings
1. **Advanced Settings** → **NAT**
2. **Port Forwarding** or **Virtual Server**
3. **Add New Rule**

### Option 2: Applications
1. **Applications** → **Port Forwarding**
2. **Add New Service**
3. Configure the rules above

### Option 3: Security
1. **Security** → **Firewall**
2. **Port Forwarding** or **Virtual Server**
3. **Add New Rule**

## 🧪 Testing After Configuration

### Test HTTP (Port 80)
```powershell
Invoke-WebRequest -Uri "http://rangoons.live" -Method Head
```

### Test HTTPS (Port 443)
```powershell
Invoke-WebRequest -Uri "https://rangoons.live" -Method Head
```

## 🎯 Expected Results

After successful configuration:
- **http://rangoons.live** → ✅ Works (no port needed)
- **https://rangoons.live** → ✅ Works (no port needed)
- **http://www.rangoons.live** → ✅ Works (no port needed)

## 🔍 Troubleshooting Huawei Router

### Common Issues:
1. **Menu not found**: Huawei routers have different firmware versions
2. **Settings not saving**: Try rebooting router after saving
3. **Port forwarding not working**: Check if internal IP is correct (154.57.212.38)

### If Port Forwarding Menu is Missing:
1. Check **Advanced Settings** → **NAT**
2. Look for **Virtual Server** instead of Port Forwarding
3. Some Huawei routers use **Applications** → **Port Forwarding**

## 📱 Mobile Edge Computing Ready

With port forwarding configured:
- **Primary**: http://rangoons.live (port 80)
- **Vivo Edge**: http://192.168.18.22:8080
- **Samsung Edge**: http://192.168.18.160:8080

---

**🚀 Ready to configure? Access http://192.168.18.1 with Epuser/SnnHBC33**
