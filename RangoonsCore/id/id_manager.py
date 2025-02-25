import uuid

class IDManager:
    def __init__(self):
        self.ids = {}

    def generate_id(self, user_name):
        user_id = str(uuid.uuid4())
        self.ids[user_name] = user_id
        return f"Generated ID for {user_name}: {user_id}"

    def get_user_id(self, user_name):
        return self.ids.get(user_name, f"No ID found for {user_name}")

if __name__ == "__main__":
    manager = IDManager()
    print(manager.generate_id("Alice"))
    print(manager.get_user_id("Alice")
