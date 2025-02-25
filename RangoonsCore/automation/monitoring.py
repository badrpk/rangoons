import psutil

def monitor_resources():
    """Monitor system resources."""
    memory = psutil.virtual_memory()
    cpu = psutil.cpu_percent(interval=1)
    return {"cpu_usage": cpu, "memory_usage": memory.percent}

# Example usage
print(monitor_resources())
