import os
import subprocess

def deploy_to_cloud():
    print("Starting deployment process...")
    try:
        subprocess.run(["terraform", "init"], check=True)
        subprocess.run(["terraform", "apply", "-auto-approve"], check=True)
        print("Deployment successful!")
    except subprocess.CalledProcessError as e:
        print(f"Deployment failed: {e}")

if __name__ == "__main__":
    deploy_to_cloud()
