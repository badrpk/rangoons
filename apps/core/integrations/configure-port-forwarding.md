# 🌐 Port Forwarding Configuration for Static IP

## 🎯 Goal
Configure your router to forward external traffic from standard ports to your server, making your website accessible without port numbers.

## 📋 Current Status
- ✅ **Static IP**: 154.57.212.38 (Confirmed working)
- ✅ **DNS**: rangoons.live → 154.57.212.38
- ✅ **Server**: Running on port 8080
- 🔄 **Port Forwarding**: Needs configuration

## 🚀 Port Forwarding Setup

### 1. Router Access
- **Default Gateway**: Usually 192.168.1.1 or 192.168.0.1
- **Access Method**: Open browser → http://[your-router-ip]
- **Login**: Use your router admin credentials

### 2. Port Forwarding Rules

#### HTTP Traffic (Port 80)
```
External Port: 80
Internal IP: 154.57.212.38
Internal Port: 8080
Protocol: TCP
```

#### HTTPS Traffic (Port 443)
```
External Port: 443
Internal IP: 154.57.212.38
Internal Port: 8080
Protocol: TCP
```

### 3. Router-Specific Instructions

#### TP-Link
1. **Advanced** → **NAT Forwarding** → **Port Forwarding**
2. **Add New**
3. Fill in the port forwarding rules above

#### ASUS
1. **WAN** → **Virtual Server / Port Forwarding**
2. **Add Profile**
3. Configure the rules above

#### Netgear
1. **Advanced** → **Port Forwarding / Port Triggering**
2. **Add Custom Service**
3. Set up the forwarding rules

#### Generic
1. Look for **Port Forwarding**, **Virtual Server**, or **NAT**
2. Add rules for ports 80 and 443
3. Point to your static IP (154.57.212.38) on port 8080

## 🧪 Testing Port Forwarding

### Test HTTP (Port 80)
```bash
# Test from external network
curl -I http://rangoons.live
# Should return HTTP 200 OK
```

### Test HTTPS (Port 443)
```bash
# Test from external network
curl -I https://rangoons.live
# May return SSL error initially (expected)
```

## 🎉 Expected Results

After port forwarding:
- **http://rangoons.live** → Works (no port needed)
- **https://rangoons.live** → Works (no port needed)
- **http://www.rangoons.live** → Works (no port needed)

## 🔧 Troubleshooting

### Common Issues
1. **Router not accessible**: Check default gateway IP
2. **Port forwarding not working**: Verify internal IP is correct
3. **Firewall blocking**: Check Windows Firewall settings
4. **ISP blocking**: Some ISPs block ports 80/443

### Windows Firewall Check
```powershell
# Allow incoming connections on port 8080
netsh advfirewall firewall add rule name="Rangoons Server" dir=in action=allow protocol=TCP localport=8080
```

## 📱 Mobile Edge Computing Integration

With port forwarding configured:
- **Primary Server**: http://rangoons.live (port 80)
- **Vivo Edge**: http://192.168.18.22:8080
- **Samsung Edge**: http://192.168.18.160:8080

Your load balancer can now distribute traffic seamlessly across all nodes!

---

**🚀 Ready to configure your router? Let's make your website accessible on standard ports!**
