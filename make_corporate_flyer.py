from PIL import Image, ImageDraw, ImageFont, ImageColor

# Configuration
width, height = 1080, 1350
bg_color = ImageColor.getrgb("#0a0c10")
text_primary = ImageColor.getrgb("#f8fafc")
text_secondary = ImageColor.getrgb("#94a3b8")
accent_red = ImageColor.getrgb("#c3151c")
accent_green = ImageColor.getrgb("#00ff41")

photo_path = r"C:\Users\lenovo\.gemini\antigravity\brain\b9b7f63b-b145-486c-9c11-cefd99da5f85\nigerian_tech_professional_1790872221996.jpg"
logo_path = r"C:\Users\lenovo\OneDrive\Desktop\elitech-hub\elitech-hub-next\public\images\logo.png"
output_path = r"C:\Users\lenovo\.gemini\antigravity\brain\b9b7f63b-b145-486c-9c11-cefd99da5f85\elitech_corporate_flyer.jpg"

# Create Canvas
img = Image.new("RGBA", (width, height), bg_color)
draw = ImageDraw.Draw(img)

# Background Accent Shapes (Subtle)
draw.polygon([(0, 0), (300, 0), (0, 300)], fill=(195, 21, 28, 15)) # subtle red corner
draw.polygon([(width, height), (width-300, height), (width, height-300)], fill=(0, 255, 65, 10)) # subtle green corner

# Load Fonts
try:
    font_bold = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 64)
    font_bold_large = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 72)
    font_regular = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 36)
    font_small_bold = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 32)
except:
    font_bold = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 64)
    font_bold_large = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 72)
    font_regular = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 36)
    font_small_bold = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 32)

margin = 80

# 1. Logo
try:
    logo = Image.open(logo_path).convert("RGBA")
    logo_w = 200
    ratio = logo_w / float(logo.size[0])
    logo_h = int(float(logo.size[1]) * float(ratio))
    logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    
    # Just paste the logo
    img.paste(logo, (margin, margin), mask=logo)
except Exception as e:
    print(f"Error with logo: {e}")

# 2. Headline
headline_y = margin + 120
draw.text((margin, headline_y), "HAPPY", font=font_bold_large, fill=text_primary)
draw.text((margin, headline_y + 80), "INDEPENDENCE DAY,", font=font_bold_large, fill=text_primary)
draw.text((margin, headline_y + 160), "NIGERIA", font=font_bold_large, fill=accent_green)

# 3. Photo
photo_y = headline_y + 280
photo_h = 500
try:
    photo = Image.open(photo_path).convert("RGBA")
    # Crop to wide rectangle
    p_w, p_h = photo.size
    # Target ratio: (width - 2*margin) : photo_h
    target_w = width - 2*margin
    
    # Resize and crop
    scale = max(target_w / p_w, photo_h / p_h)
    new_w = int(p_w * scale)
    new_h = int(p_h * scale)
    photo = photo.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    left = (new_w - target_w) / 2
    top = (new_h - photo_h) / 2
    photo = photo.crop((left, top, left + target_w, top + photo_h))
    
    # Draw a border behind photo
    draw.rectangle([margin - 4, photo_y - 4, width - margin + 4, photo_y + photo_h + 4], fill=accent_red)
    img.paste(photo, (margin, photo_y))
except Exception as e:
    print(f"Error with photo: {e}")

# 4. Message
msg_y = photo_y + photo_h + 60
msg = "Celebrating freedom, progress, knowledge\nand the people building Nigeria's future."
draw.text((margin, msg_y), msg, font=font_regular, fill=text_secondary, spacing=12)

# 5. CTA / Positioning
cta_y = height - margin - 40
draw.line([(margin, cta_y - 30), (width - margin, cta_y - 30)], fill=(255,255,255,30), width=1)
draw.text((margin, cta_y), "Empowering people. Securing technology. Building the future.", font=font_small_bold, fill=text_primary)
# Business tags aligned right
# draw.text((width - margin - 500, cta_y + 40), "CYBERSECURITY | TECHNOLOGY | RESEARCH", font=font_small_bold, fill=text_secondary)

# Save
img.convert("RGB").save(output_path, quality=95)
print(f"Saved to {output_path}")
