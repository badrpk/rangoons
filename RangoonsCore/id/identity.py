import uuid

class HuobzID:
    def __init__(self, name, email):
        self.name = name
        self.email = email
        self.hid = str(uuid.uuid4())

    def get_identity(self):
        """Return user's Huobz ID."""
        return {"name": self.name, "email": self.email, "hid": self.hid}

# Example usage
identity = HuobzID("John Doe", "john@example.com")
print(identity.get_identity())
