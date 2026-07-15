# RangoonsCore - WhatsApp Integrated E-commerce

A modern e-commerce platform with WhatsApp integration for Pakistani businesses.

## 🌟 Features

- **E-commerce Platform**: Product catalog, shopping cart, order management
- **WhatsApp Integration**: Automated customer support, order notifications
- **Cross-platform**: Works on Windows, Linux, and macOS
- **Real-time Updates**: Live order status via WhatsApp
- **Mobile Responsive**: Optimized for mobile devices
- **Custom Domains**: Professional domain names instead of IP addresses

## 🚀 Quick Start (Windows)

### Prerequisites
- Windows 10/11
- Visual Studio Build Tools or Visual Studio Community
- Node.js 18+ (for WhatsApp integration)
- Git

### 1. Build the Core Server
```bash
# Clone the repository
git clone <your-repo-url>
cd rangoons-core

# Build the C++ server
build.bat
# or
build-mingw.bat
```

### 2. Start the E-commerce Server
```bash
# Run the start script
start-rangoons.bat
```

Your server will be accessible at:
- **Local**: http://localhost:8080
- **Network**: http://154.57.212.38:8080

### 3. Start WhatsApp Integration
```bash
# In a new terminal
start-whatsapp.bat
```

WhatsApp webhook will be available at:
- **Webhook**: http://154.57.212.38:3001/webhook
- **Health Check**: http://154.57.212.38:3001/health

## 🌐 Domain Setup (Optional but Recommended)

### Quick Domain Configuration
```bash
# Set up custom domains
setup-domains.bat

# Test domain configuration
test-domains.bat
```

### Benefits of Custom Domains
- **Professional Image**: shop.rangoons.pk vs 154.57.212.38:8080
- **Easy to Remember**: Better customer experience
- **SSL Support**: Enable HTTPS for security
- **Branding**: Consistent with your business name

### Example Domain Structure
- **Main Shop**: https://shop.rangoons.pk
- **API**: https://api.rangoons.pk
- **WhatsApp**: https://wa.rangoons.pk

See [DNS-SETUP.md](DNS-SETUP.md) for detailed domain configuration.

## 📱 WhatsApp Integration Setup

### First Time Setup
1. Run `start-whatsapp.bat`
2. Scan the QR code with your WhatsApp mobile app
3. The bot will automatically respond to customer messages

### Available Commands
Customers can message your WhatsApp number with:
- `order` or `status` - Check order status
- `help` or `menu` - Show help menu
- Any other message - Get welcome message with shop link

### Automated Features
- **Order Notifications**: Customers get order confirmations
- **Status Updates**: Real-time order status via WhatsApp
- **Customer Support**: Automated responses to common queries

## 🗄️ Database Schema

The system automatically creates these tables:
- `products` - Product catalog with pricing
- `product_stats` - Sales analytics
- `carts` - Shopping cart management
- `cart_items` - Cart contents
- `orders` - Customer orders with status tracking

## 🔧 Configuration

### Environment Variables
```bash
RANGOONS_DB=rangoons.db          # Database file path
RANGOONS_HOST=0.0.0.0           # Server host (0.0.0.0 for all interfaces)
RANGOONS_PORT=8080              # E-commerce server port
ADMIN_KEY=secret123             # Admin panel access key
WA_WEBHOOK_PORT=3001            # WhatsApp webhook port

# Custom Domains (after DNS setup)
RANGOONS_DOMAIN=shop.rangoons.pk
SHOP_DOMAIN=shop.rangoons.pk
API_DOMAIN=api.rangoons.pk
WA_DOMAIN=wa.rangoons.pk
WA_NUMBER=92300155681
```

### WhatsApp Configuration
- **Owner Number**: 92300155681 (configured in server.cpp)
- **Bot Name**: RangoonsBot
- **Authentication**: Stored in `integrations/wa-bot/auth/`

## 📊 Import Products

### CSV Import
```bash
python tools/import_csv.py products.csv
```

### CSV Format
```csv
name,description,image_url,category,brand,source,external_id,source_url,price_pkr
Product Name,Description,image.jpg,Category,Brand,Source,123,http://...,1000
```

## 🌐 Network Configuration

### Static IP Setup
Your server is configured for static IP: **154.57.212.38**

### Port Forwarding
Ensure these ports are open on your router:
- **8080** - E-commerce server
- **3001** - WhatsApp webhook

### Firewall Rules
Add Windows Firewall rules for:
- TCP 8080 (E-commerce)
- TCP 3001 (WhatsApp Webhook)

## 🚨 Troubleshooting

### Build Issues
```bash
# Clean and rebuild
make clean
make all
```

### WhatsApp Connection Issues
1. Check internet connection
2. Verify phone number format
3. Clear auth folder and re-scan QR
4. Check firewall settings

### Database Issues
```bash
# Reset database (WARNING: loses all data)
rm rangoons.db
# Restart server to recreate schema
```

### Domain Issues
1. Run `test-domains.bat` to diagnose
2. Check DNS propagation (24-48 hours)
3. Verify A records point to 154.57.212.38
4. Check firewall and port forwarding

## 📈 Monitoring

### Health Checks
- **E-commerce**: http://154.57.212.38:8080/ or https://shop.rangoons.pk
- **WhatsApp**: http://154.57.212.38:3001/health or https://wa.rangoons.pk/health

### Logs
- Server logs: `rangoons.log`
- WhatsApp logs: Console output

## 🔒 Security Notes

- Change default `ADMIN_KEY` in production
- Use HTTPS in production (after domain setup)
- Implement rate limiting
- Regular security updates

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs for error messages
3. Verify network configuration
4. Test WhatsApp connection
5. Run `test-domains.bat` for domain issues

## 📄 License

MIT License - See LICENSE file for details

---

**Made with ❤️ for Pakistani businesses**
