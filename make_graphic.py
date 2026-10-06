from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

base_img_path = r"C:\Users\lenovo\.gemini\antigravity\brain\b9b7f63b-b145-486c-9c11-cefd99da5f85\independence_base_photo_1790871778404.jpg"
logo_path = r"C:\Users\lenovo\OneDrive\Desktop\elitech-hub\elitech-hub-next\public\images\logo.png"
output_path = r"C:\Users\lenovo\.gemini\antigravity\brain\b9b7f63b-b145-486c-9c11-cefd99da5f85\elitech_hub_independence_final.jpg"

img = Image.open(base_img_path).convert("RGBA")
width, height = img.size

# Darken the top and bottom slightly to make text pop
draw = ImageDraw.Draw(img)
draw.rectangle([(0, 0), (width, int(height * 0.25))], fill=(15, 23, 42, 180))
draw.rectangle([(0, int(height * 0.8)), (width, height)], fill=(15, 23, 42, 220))

# Load Logo
try:
    logo = Image.open(logo_path).convert("RGBA")
    # Resize logo
    logo_width = int(width * 0.25)
    ratio = logo_width / float(logo.size[0])
    logo_height = int(float(logo.size[1]) * float(ratio))
    logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
    
    # Place logo top center
    logo_x = int((width - logo_width) / 2)
    logo_y = 60
    
    # Add a soft glow behind logo just in case it's dark
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([(logo_x - 50, logo_y - 20), (logo_x + logo_width + 50, logo_y + logo_height + 20)], fill=(255, 255, 255, 120))
    glow = glow.filter(ImageFilter.GaussianBlur(30))
    img = Image.alpha_composite(img, glow)
    
    img.paste(logo, (logo_x, logo_y), mask=logo)
except Exception as e:
    print(f"Error with logo: {e}")

# Text
draw = ImageDraw.Draw(img)
try:
    font_large = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", int(width * 0.05))
    font_medium = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", int(width * 0.035))
    font_small = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", int(width * 0.025))
except:
    font_large = ImageFont.load_default()
    font_medium = ImageFont.load_default()
    font_small = ImageFont.load_default()

def draw_text_centered(d, text, y, font, fill=(255,255,255)):
    bbox = d.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    x = (width - w) / 2
    d.text((x, y), text, font=font, fill=fill)

draw_text_centered(draw, "HAPPY INDEPENDENCE DAY, NIGERIA", int(height * 0.18), font_large, (255,255,255))
draw_text_centered(draw, "Building a More Secure, Skilled & Digital Future", int(height * 0.23), font_medium, (200,215,230))

draw_text_centered(draw, "Learn. Build. Secure. Grow.", int(height * 0.9), font_large, (255,255,255))
draw_text_centered(draw, "Technology | Cybersecurity | Research | Professional Development", int(height * 0.95), font_small, (150, 160, 175))

img.convert("RGB").save(output_path, quality=95)
print(f"Saved to {output_path}")
