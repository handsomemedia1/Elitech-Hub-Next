from PIL import Image, ImageDraw, ImageFont
import os

base_img_path = r"C:\Users\lenovo\.gemini\antigravity\brain\b9b7f63b-b145-486c-9c11-cefd99da5f85\independence_base_photo_1790871778404.jpg"
logo_path = r"C:\Users\lenovo\OneDrive\Desktop\elitech-hub\elitech-hub-next\public\images\logo.png"
output_path = r"C:\Users\lenovo\.gemini\antigravity\brain\b9b7f63b-b145-486c-9c11-cefd99da5f85\elitech_hub_independence_segoe.jpg"

img = Image.open(base_img_path).convert("RGBA")
width, height = img.size

draw = ImageDraw.Draw(img)

# Solid dark gradient at top and bottom for readability
for y in range(int(height * 0.35)):
    alpha = max(0, 255 - int((y / (height * 0.35)) * 255))
    draw.line([(0, y), (width, y)], fill=(15, 23, 42, alpha))
    
for y in range(int(height * 0.75), height):
    alpha = min(255, int(((y - height * 0.75) / (height * 0.25)) * 255))
    draw.line([(0, y), (width, y)], fill=(15, 23, 42, alpha))

# Load Logo
try:
    logo = Image.open(logo_path).convert("RGBA")
    logo_width = int(width * 0.18)
    ratio = logo_width / float(logo.size[0])
    logo_height = int(float(logo.size[1]) * float(ratio))
    logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
    
    logo_x = int((width - logo_width) / 2)
    logo_y = int(height * 0.05)
    
    # Check if logo is dark. If average brightness is low, invert or tint it white.
    # Elitech Hub's logo might be red/black. We will just paste it. The dark background might hide black text.
    # We will paste it in a subtle white rounded pill box if it's too dark, but let's just use a soft white circle.
    draw.rounded_rectangle([(logo_x - 30, logo_y - 20), (logo_x + logo_width + 30, logo_y + logo_height + 20)], radius=20, fill=(255, 255, 255, 230))
    
    img.paste(logo, (logo_x, logo_y), mask=logo)
except Exception as e:
    print(f"Error with logo: {e}")

try:
    font_large = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", int(width * 0.055))
    font_medium = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", int(width * 0.035))
    font_small = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", int(width * 0.022))
    font_cta = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", int(width * 0.032))
except:
    font_large = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", int(width * 0.055))
    font_medium = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", int(width * 0.035))
    font_small = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", int(width * 0.022))
    font_cta = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", int(width * 0.032))

def draw_text_centered(d, text, y, font, fill=(255,255,255), letter_spacing=0):
    bbox = d.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    x = (width - w) / 2
    d.text((x, y), text, font=font, fill=fill)

draw_text_centered(draw, "HAPPY INDEPENDENCE DAY, NIGERIA", int(height * 0.16), font_large, (255,255,255))
draw_text_centered(draw, "Building a More Secure, Skilled & Digital Future", int(height * 0.23), font_medium, (226, 232, 240))

draw_text_centered(draw, "Learn. Build. Secure. Grow.", int(height * 0.88), font_cta, (255, 255, 255))
draw_text_centered(draw, "CYBERSECURITY  |  TECHNOLOGY  |  RESEARCH  |  PROFESSIONAL DEVELOPMENT", int(height * 0.94), font_small, (148, 163, 184))

img.convert("RGB").save(output_path, quality=95)
print(f"Saved to {output_path}")
