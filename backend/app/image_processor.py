import os
import requests
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import textwrap

def download_image(url: str) -> Image.Image:
    # Strip tracking/query params (like ?utm_source=...) that some CDNs (like Wikipedia) block
    clean_url = url.split("?")[0]
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    response = requests.get(clean_url, headers=headers, timeout=10)
    response.raise_for_status()
    img = Image.open(BytesIO(response.content)).convert("RGB")
    if img.width < 50 or img.height < 50:
        raise ValueError(f"Image too small: {img.width}x{img.height}")
    return img

def crop_to_aspect_ratio(image: Image.Image, aspect_ratio: float = 9/16) -> Image.Image:
    """
    Crops the image to the specified aspect ratio (width/height),
    centering the crop.
    """
    img_width, img_height = image.size
    img_ratio = img_width / img_height
    
    if img_ratio > aspect_ratio:
        # Image is wider than target ratio
        new_width = int(aspect_ratio * img_height)
        offset = (img_width - new_width) // 2
        crop_box = (offset, 0, offset + new_width, img_height)
    else:
        # Image is taller than target ratio
        new_height = int(img_width / aspect_ratio)
        offset = (img_height - new_height) // 2
        crop_box = (0, offset, img_width, offset + new_height)
        
    return image.crop(crop_box)

def create_story_image(image_url: str, text: str, output_path: str):
    """
    Downloads an image, crops it to 9:16, darkens it slightly for text readability,
    draws the summary text on it, and saves to output_path.
    """
    img = download_image(image_url)
    img = crop_to_aspect_ratio(img, 9/16)
    
    # Optional: Resize if it's too small or too large (standard story is 1080x1920)
    # But let's just scale it up to a width of 1080 for consistency
    target_width = 1080
    target_height = 1920
    img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    # Darken image to make text pop
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(0.6)
    
    draw = ImageDraw.Draw(img)
    
    # Use robust custom font
    # Use robust custom font
    try:
        current_dir = os.path.abspath(os.path.dirname(__file__))
        font_path = os.path.join(current_dir, "Roboto-Regular.ttf")
        font = ImageFont.truetype(font_path, 60)
    except IOError as e:
        print(f"Failed to load font at {font_path}: {e}")
        font = ImageFont.load_default()
        
    # Wrap text
    # The max character length depends on font size and image width
    # 60pt font on 1080px width: roughly 30-35 chars per line
    wrapped_text = textwrap.fill(text, width=32)
    
    # Calculate text bounding box
    bbox = draw.textbbox((0, 0), wrapped_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center text
    x = (target_width - text_width) // 2
    y = (target_height - text_height) // 2
    
    # Draw text shadow / outline for better readability
    shadow_color = "black"
    text_color = "white"
    offset = 4
    draw.multiline_text((x-offset, y-offset), wrapped_text, font=font, fill=shadow_color, align="center")
    draw.multiline_text((x+offset, y-offset), wrapped_text, font=font, fill=shadow_color, align="center")
    draw.multiline_text((x-offset, y+offset), wrapped_text, font=font, fill=shadow_color, align="center")
    draw.multiline_text((x+offset, y+offset), wrapped_text, font=font, fill=shadow_color, align="center")
    
    # Draw main text
    draw.multiline_text((x, y), wrapped_text, font=font, fill=text_color, align="center")
    
    img.save(output_path, "JPEG", quality=90)
    return output_path
