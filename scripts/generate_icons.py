import os
from PIL import Image

source_img = "/tmp/file_attachments/favicon_red_white_blue_flag_behind_capitol.png"
public_dir = "public"

# Define the icons to generate
icons = [
    ("android-icon-36x36.png", (36, 36)),
    ("android-icon-48x48.png", (48, 48)),
    ("android-icon-72x72.png", (72, 72)),
    ("android-icon-96x96.png", (96, 96)),
    ("android-icon-144x144.png", (144, 144)),
    ("android-icon-192x192.png", (192, 192)),
    ("favicon-16x16.png", (16, 16)),
    ("favicon-32x32.png", (32, 32)),
    ("favicon-96x96.png", (96, 96)),
    ("apple-icon-57x57.png", (57, 57)),
    ("apple-icon-60x60.png", (60, 60)),
    ("apple-icon-72x72.png", (72, 72)),
    ("apple-icon-76x76.png", (76, 76)),
    ("apple-icon-114x114.png", (114, 114)),
    ("apple-icon-120x120.png", (120, 120)),
    ("apple-icon-144x144.png", (144, 144)),
    ("apple-icon-152x152.png", (152, 152)),
    ("apple-icon-180x180.png", (180, 180)),
    ("apple-icon.png", (192, 192)),
    ("favicon.png", (192, 192)),
]

with Image.open(source_img) as img:
    # Ensure background is transparent (Pillow handles PNG transparency well if original has it)
    # The source image seems to have it based on its look.

    for filename, size in icons:
        resized_img = img.resize(size, Image.Resampling.LANCZOS)
        resized_img.save(os.path.join(public_dir, filename))
        print(f"Generated {filename}")

    # Special case for favicon.ico (multi-resolution)
    ico_img = img.resize((48, 48), Image.Resampling.LANCZOS)
    ico_img.save(os.path.join(public_dir, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
    print("Generated favicon.ico")
