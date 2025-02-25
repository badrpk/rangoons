def recommend_content(content_list, genre):
    """Recommend content based on genre."""
    return [content for content in content_list if content["genre"] == genre]

# Example usage
content = [
    {"title": "Movie A", "genre": "Action"},
    {"title": "Movie B", "genre": "Drama"},
]
print(recommend_content(content, "Action"))
