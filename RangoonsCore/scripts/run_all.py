import subprocess

def run_all_components():
    components = [
        "python ../api/api.py",
        "python ../blockchain/huobzcoins.py",
        "python ../savings/savings_manager.py",
        "python ../mart/mart_manager.py",
        "python ../flix/flix_manager.py",
    ]

    for component in components:
        try:
            print(f"Running: {component}")
            subprocess.run(component, shell=True)
        except Exception as e:
            print(f"Error running {component}: {e}")

if __name__ == "__main__":
    run_all_components()
