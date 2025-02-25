class HuobzFlix:
    def __init__(self):
        self.content = []

    def add_content(self, title, genre, url):
        """Add content to the streaming platform."""
        self.content.append({"title": title, "genre": genre, "url": url})
        return f"Content '{title}' added successfully!"

    def list_content(self):
        """List all available content."""
        return self.content

# Example usage
flix = HuobzFlix()
flix.add_content("Movie A", "Action", "https://example.com/movie-a")
print(flix.list_content())
