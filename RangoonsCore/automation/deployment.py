import os

def deploy_application(app_name, server):
    """Automate deployment to a server."""
    print(f"Deploying {app_name} to {server}...")
    # Simulate deployment process
    os.system(f"ssh {server} 'mkdir -p /var/www/{app_name}'")
    return f"Application {app_name} deployed to {server}!"

# Example usage
print(deploy_application("HuobzApp", "user@server.com"))
