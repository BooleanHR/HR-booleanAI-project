import sys
from PIL import Image

def remove_white_background(input_path, output_path):
    # Open the image and convert it to RGBA
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # Check if the pixel is white (or very close to white)
        # item is (R, G, B, A)
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            # Change to transparent
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python rm_bg.py <input> <output>")
        sys.exit(1)
    remove_white_background(sys.argv[1], sys.argv[2])
    print("Done")
