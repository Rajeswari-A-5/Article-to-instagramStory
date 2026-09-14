import newspaper
from newspaper import Config

def get_article_data(url: str):
    """
    Downloads and parses the article using newspaper3k.
    Returns title, text, and top image URLs.
    """
    config = Config()
    config.browser_user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    
    article = newspaper.Article(url, config=config)
    article.download()
    article.parse()
    
    # We might want to get all images, but some are tiny or just icons.
    # newspaper3k filters some out, but we can also use article.top_image and article.images
    images = list(article.images)
    if article.top_image and article.top_image not in images:
        images.insert(0, article.top_image)
        
    return {
        "title": article.title,
        "text": article.text,
        "images": images
    }
