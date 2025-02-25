import requests
import smtplib
from email.mime.text import MIMEText
from bs4 import BeautifulSoup
import sys

# List of shopping platforms to check
SHOPPING_PLATFORMS = {
    "daraz": "https://www.daraz.pk/catalog/?q=",
    "zameen": "https://www.zameen.com/Homes/Pakistan/?q=",
    "pakwheels": "https://www.pakwheels.com/used-cars/search/-/?q=",
    "olx": "https://www.olx.com.pk/items/q-",
    "temu": "https://www.temu.com/search?searchKey=",
    "foodpanda": "https://www.foodpanda.pk/restaurants?q=",
    "rangoons": "https://rangoons.shop/search?q="
}

OFFICIAL_EMAIL = "xepcam@gmail.com"

def fetch_product_info(platform, query):
    """Scrape product details from a shopping platform."""
    url = SHOPPING_PLATFORMS[platform] + query.replace(" ", "+")
    headers = {"User-Agent": "Mozilla/5.0"}
    
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            product_name = soup.find("title").text.strip()[:100]  # Extract product title
            return f"🔹 {platform.capitalize()}: {product_name}\n{url}"
        else:
            return f"❌ No results on {platform.capitalize()}."
    except:
        return f"⚠ Error fetching {platform.capitalize()} data."

def search_products(query):
    """Check all platforms for the requested product."""
    results = [fetch_product_info(platform, query) for platform in SHOPPING_PLATFORMS]
    return "\n".join(results)

def send_email(to_email, subject, message):
    """Send an email notification."""
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    smtp_user = OFFICIAL_EMAIL  # Update with Rangoons.shop email
    smtp_pass = "your_email_password"  # Update with real credentials or use OAuth
    
    msg = MIMEText(message, "plain")
    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = to_email

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, [to_email], msg.as_string())
        print(f"✅ Email sent to {to_email}")
    except Exception as e:
        print(f"⚠ Failed to send email: {e}")

def process_query(query, user_email):
    """Main function to search for products and notify the customer."""
    search_results = search_products(query)

    if "❌ No results" in search_results:
        # If the product is unavailable, request Rangoons.shop to stock it
        email_subject = f"Customer Request: {query}"
        email_message = f"A customer requested {query}, but it is unavailable. Please arrange it in Rangoons.shop.\n\nCC: {user_email}"
        send_email(OFFICIAL_EMAIL, email_subject, email_message)
        
        # Notify customer
        customer_subject = f"Your Request for {query}"
        customer_message = f"Hi,\n\nWe couldn't find {query} at the moment. We've notified Rangoons.shop to stock it, and we will inform you once it's available.\n\n- Rangoons AI"
        send_email(user_email, customer_subject, customer_message)
        
        return f"🔍 Product not found. We've requested Rangoons.shop to stock {query}. You'll be notified soon!"

    return f"🛒 Here are the best options for '{query}':\n\n{search_results}"

if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "--prompt":
        user_query = sys.argv[2]
    else:
        user_query = input("Enter your shopping request: ")
    
    user_email = input("Enter your email for notifications: ")
    
    response = process_query(user_query, user_email)
    print("\n" + response)
