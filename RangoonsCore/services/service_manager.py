class ServiceManager:
    def __init__(self):
        self.services = []

    def register_service(self, service_name, description):
        self.services.append({"name": service_name, "description": description})
        return f"Service {service_name} registered."

    def list_services(self):
        return self.services

if __name__ == "__main__":
    manager = ServiceManager()
    print(manager.register_service("HuobzMart", "E-commerce platform"))
    print(manager.list_services())
