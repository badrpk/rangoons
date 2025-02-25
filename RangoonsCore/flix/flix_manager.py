class FlixManager:
    def __init__(self):
        self.media_library = {}

    def add_movie(self, title, genre, year):
        self.media_library[title] = {"genre": genre, "year": year}
        return f"Added {title} ({year}) to library."

    def get_movie(self, title):
        return self.media_library.get(title, f"{title} not found.")

    def list_movies(self):
        return [{"title": title, "details": details} for title, details in self.media_library.items()]

if __name__ == "__main__":
    manager = FlixManager()
    print(manager.add_movie("Inception", "Sci-Fi", 2010))
    print(manager.get_movie("Inception"))
    print(manager.list_movies())
