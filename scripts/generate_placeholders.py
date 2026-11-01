#!/usr/bin/env python3
"""
Generates the placeholder pixel-art assets used by the portfolio.

You do NOT need to run this to use the project - the generated PNGs are already
committed under public/assets. It exists so the placeholders are reproducible and
so you can see exactly what size/layout each replacement asset should have.

    npm run assets:generate        (needs Python 3 + Pillow)

Replace any generated file with your own art of the same name and the game picks
it up. See public/assets/README.md for the exact specs.
"""
import math
import os
import random

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "public", "assets")


def out(*parts):
    path = os.path.join(ASSETS, *parts)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path


def hexc(h, a=255):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def add_outline(img, color):
    """1px outline around every opaque pixel (4-neighbour)."""
    src = img.load()
    w, h = img.size
    res = img.copy()
    dst = res.load()
    for y in range(h):
        for x in range(w):
            if src[x, y][3] == 0:
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and src[nx, ny][3] > 0:
                        dst[x, y] = color
                        break
    return res


# --------------------------------------------------------------------------- #
#  ROOM  (320 x 180)
# --------------------------------------------------------------------------- #
def make_room():
    W, H = 320, 180
    img = Image.new("RGBA", (W, H), hexc("#e6c3a1"))
    d = ImageDraw.Draw(img)
    rng = random.Random(3)

    FLOOR_Y = 114

    # --- wall + subtle wallpaper dots
    d.rectangle([0, 0, W, FLOOR_Y], fill=hexc("#e8c6a4"))
    for y in range(6, 84, 14):
        for x in range((y // 14 % 2) * 7 + 3, W, 14):
            d.point((x, y), fill=hexc("#dcb592"))
            d.point((x + 1, y), fill=hexc("#dcb592"))
            d.point((x, y + 1), fill=hexc("#dcb592"))
    # wainscot
    d.rectangle([0, 86, W, FLOOR_Y], fill=hexc("#cf9f7f"))
    for x in range(0, W, 20):
        d.line([(x, 88), (x, FLOOR_Y)], fill=hexc("#c0906f"))
    d.line([(0, 84), (W, 84)], fill=hexc("#f3dfc3"))
    d.line([(0, 85), (W, 85)], fill=hexc("#a8795a"))
    # baseboard
    d.rectangle([0, FLOOR_Y - 3, W, FLOOR_Y + 1], fill=hexc("#6b3e22"))
    d.line([(0, FLOOR_Y - 3), (W, FLOOR_Y - 3)], fill=hexc("#8b5a38"))

    # --- wooden floor
    d.rectangle([0, FLOOR_Y + 2, W, H], fill=hexc("#b07640"))
    row = 0
    for y in range(FLOOR_Y + 2, H, 9):
        tone = hexc("#b47843") if row % 2 == 0 else hexc("#a96c3a")
        d.rectangle([0, y, W, y + 8], fill=tone)
        d.line([(0, y + 8), (W, y + 8)], fill=hexc("#8f5a2e"))
        off = (row * 37) % 52
        for x in range(-off, W, 52):
            d.line([(x, y), (x, y + 8)], fill=hexc("#8f5a2e"))
        # tiny wood grain
        for _ in range(5):
            gx = rng.randint(0, W - 6)
            d.line([(gx, y + 3), (gx + rng.randint(2, 5), y + 3)], fill=hexc("#bd8449"))
        row += 1

    # --- rug
    d.ellipse([78, 126, 242, 176], fill=hexc("#7a2f3a"))
    d.ellipse([82, 129, 238, 173], fill=hexc("#b5483f"))
    d.ellipse([88, 133, 232, 169], outline=hexc("#e8b84a"))
    d.ellipse([98, 138, 222, 164], fill=hexc("#c25a4c"))
    for x in range(110, 212, 12):
        d.polygon([(x, 151), (x + 4, 147), (x + 8, 151), (x + 4, 155)], fill=hexc("#f0cf7a"))
    # rug fringe
    for x in range(84, 238, 6):
        pass

    # --- cat bed (the cat's "home")
    d.ellipse([128, 142, 184, 168], fill=hexc("#6e4130"))
    d.ellipse([131, 143, 181, 165], fill=hexc("#d98a93"))
    d.ellipse([137, 147, 175, 161], fill=hexc("#c0707c"))
    d.ellipse([141, 149, 171, 159], fill=hexc("#a95b69"))
    d.arc([131, 143, 181, 165], 200, 340, fill=hexc("#f0b0b6"))

    # --- window
    wx0, wy0, wx1, wy1 = 104, 20, 146, 70
    d.rectangle([wx0 - 3, wy0 - 3, wx1 + 3, wy1 + 3], fill=hexc("#7a4a2a"))
    sky_top, sky_bot = hexc("#232f6e"), hexc("#e78a5e")
    for y in range(wy0, wy1 + 1):
        t = (y - wy0) / (wy1 - wy0)
        c = tuple(int(sky_top[i] + (sky_bot[i] - sky_top[i]) * t) for i in range(3)) + (255,)
        d.line([(wx0, y), (wx1, y)], fill=c)
    for _ in range(16):
        sx, sy = rng.randint(wx0 + 2, wx1 - 2), rng.randint(wy0 + 2, wy0 + 24)
        d.point((sx, sy), fill=hexc("#fff6d0"))
    # moon
    d.ellipse([wx0 + 26, wy0 + 5, wx0 + 36, wy0 + 15], fill=hexc("#fff1b8"))
    d.ellipse([wx0 + 29, wy0 + 3, wx0 + 39, wy0 + 13], fill=hexc("#2a3980"))
    # skyline
    x = wx0
    while x < wx1:
        bw = rng.randint(5, 9)
        bh = rng.randint(10, 24)
        d.rectangle([x, wy1 - bh, min(x + bw, wx1), wy1], fill=hexc("#1c1a38"))
        for wyy in range(wy1 - bh + 3, wy1 - 2, 4):
            for wxx in range(x + 1, min(x + bw, wx1) - 1, 3):
                if rng.random() < 0.45:
                    d.point((wxx, wyy), fill=hexc("#ffd866"))
        x += bw + 1
    # cross bars
    d.rectangle([wx0 + 20, wy0, wx0 + 22, wy1], fill=hexc("#7a4a2a"))
    d.rectangle([wx0, wy0 + 24, wx1, wy0 + 26], fill=hexc("#7a4a2a"))
    # sill
    d.rectangle([wx0 - 6, wy1 + 3, wx1 + 6, wy1 + 6], fill=hexc("#8f5d38"))
    d.line([(wx0 - 6, wy1 + 3), (wx1 + 6, wy1 + 3)], fill=hexc("#b07d52"))
    # curtains + rod
    d.line([(wx0 - 10, wy0 - 7), (wx1 + 10, wy0 - 7)], fill=hexc("#5a3a22"), width=2)
    d.rectangle([wx0 - 12, wy0 - 9, wx0 - 9, wy0 - 5], fill=hexc("#c9a24a"))
    d.rectangle([wx1 + 9, wy0 - 9, wx1 + 12, wy0 - 5], fill=hexc("#c9a24a"))
    for side in (0, 1):
        cx0 = wx0 - 6 if side == 0 else wx1 - 6
        d.rectangle([cx0, wy0 - 6, cx0 + 11, wy1 + 2], fill=hexc("#c8554a"))
        for fx in range(cx0 + 2, cx0 + 11, 4):
            d.line([(fx, wy0 - 6), (fx, wy1 + 2)], fill=hexc("#a8403a"))
        d.rectangle([cx0, wy0 + 30, cx0 + 11, wy0 + 32], fill=hexc("#f0d070"))

    # --- fairy lights (soft glow drawn on an overlay)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    pts = []
    for x in range(0, W + 1):
        y = 5 + 7 * math.sin(math.pi * ((x % 80) / 80))
        pts.append((x, round(y)))
    d.line(pts, fill=hexc("#3a2a2a"))
    colors = ["#ffd866", "#ff9ec0", "#9eefff", "#b6ff9e"]
    for i, x in enumerate(range(8, W, 16)):
        y = 5 + 7 * math.sin(math.pi * ((x % 80) / 80))
        y = round(y) + 3
        c = hexc(colors[i % len(colors)])
        gd.ellipse([x - 4, y - 4, x + 4, y + 4], fill=c[:3] + (46,))
        d.rectangle([x - 1, y - 1, x + 1, y + 1], fill=c)
        d.point((x, y - 2), fill=hexc("#3a2a2a"))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img)

    # --- poster (mountains + sun)
    px0, py0, px1, py1 = 262, 26, 296, 62
    d.rectangle([px0 - 2, py0 - 2, px1 + 2, py1 + 2], fill=hexc("#5a3a22"))
    d.rectangle([px0, py0, px1, py1], fill=hexc("#f5d28a"))
    d.ellipse([px0 + 18, py0 + 5, px0 + 28, py0 + 15], fill=hexc("#e8664a"))
    d.polygon([(px0, py1), (px0 + 12, py0 + 18), (px0 + 22, py1)], fill=hexc("#4a7a8a"))
    d.polygon([(px0 + 10, py1), (px0 + 24, py0 + 12), (px1, py1)], fill=hexc("#33566a"))
    d.polygon([(px0 + 24, py0 + 12), (px0 + 21, py0 + 17), (px0 + 27, py0 + 17)], fill=hexc("#f6f0e0"))

    # --- wall clock
    d.ellipse([222, 28, 240, 46], fill=hexc("#5a3a22"))
    d.ellipse([224, 30, 238, 44], fill=hexc("#fff4dc"))
    d.line([(231, 37), (231, 32)], fill=hexc("#3b2216"))
    d.line([(231, 37), (235, 38)], fill=hexc("#3b2216"))
    d.point((231, 37), fill=hexc("#c8554a"))

    # --- bed (side view, headboard on the left)
    d.rectangle([4, 64, 12, 120], fill=hexc("#7a4a2a"))
    d.rectangle([4, 64, 12, 66], fill=hexc("#9a6338"))
    d.rectangle([5, 70, 6, 118], fill=hexc("#8f5d38"))
    d.rectangle([86, 96, 92, 120], fill=hexc("#7a4a2a"))
    d.rectangle([86, 96, 92, 98], fill=hexc("#9a6338"))
    d.rectangle([8, 102, 88, 114], fill=hexc("#8a5a38"))
    d.line([(8, 102), (88, 102)], fill=hexc("#a87450"))
    d.rectangle([12, 114, 15, 120], fill=hexc("#6b3e22"))
    d.rectangle([82, 114, 85, 120], fill=hexc("#6b3e22"))
    # mattress + sheet
    d.rectangle([12, 92, 86, 103], fill=hexc("#f4e8da"))
    # quilt
    d.rectangle([34, 87, 86, 103], fill=hexc("#5b7fb8"))
    d.rectangle([34, 87, 86, 89], fill=hexc("#8fb0dc"))
    for qx in range(36, 86, 8):
        d.line([(qx, 90), (qx, 103)], fill=hexc("#486a9f"))
    for qy in (94, 98):
        d.line([(34, qy), (86, qy)], fill=hexc("#486a9f"))
    for qx in range(40, 84, 16):
        d.rectangle([qx, 94, qx + 3, 97], fill=hexc("#f0cf7a"))
    # sheet fold
    d.rectangle([30, 87, 34, 103], fill=hexc("#fbf3e6"))
    # pillow
    d.ellipse([13, 82, 36, 96], fill=hexc("#fff6e8"))
    d.arc([13, 82, 36, 96], 20, 160, fill=hexc("#e0d0b8"))
    d.ellipse([20, 84, 28, 88], fill=hexc("#ffffff"))
    # bed shadow on floor
    shade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shade).rectangle([4, 120, 98, 125], fill=(40, 20, 10, 70))
    img = Image.alpha_composite(img, shade)
    d = ImageDraw.Draw(img)

    # --- desk (right side)
    d.rectangle([204, 94, 316, 98], fill=hexc("#8a5a38"))
    d.line([(204, 94), (316, 94)], fill=hexc("#b07d52"))
    d.rectangle([206, 99, 314, 102], fill=hexc("#6f4527"))
    d.rectangle([208, 103, 214, 128], fill=hexc("#6f4527"))
    d.rectangle([209, 103, 210, 128], fill=hexc("#85553a"))
    d.rectangle([268, 103, 314, 126], fill=hexc("#7a4a2a"))
    d.rectangle([270, 105, 312, 114], fill=hexc("#8a5a38"))
    d.rectangle([270, 116, 312, 124], fill=hexc("#8a5a38"))
    d.rectangle([287, 108, 295, 110], fill=hexc("#e8b84a"))
    d.rectangle([287, 119, 295, 121], fill=hexc("#e8b84a"))
    # desk shadow
    shade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shade).rectangle([204, 128, 316, 133], fill=(40, 20, 10, 70))
    img = Image.alpha_composite(img, shade)
    d = ImageDraw.Draw(img)

    # desk lamp
    d.ellipse([207, 91, 219, 95], fill=hexc("#3a3a4a"))
    d.line([(213, 91), (213, 76)], fill=hexc("#3a3a4a"), width=2)
    d.line([(213, 76), (218, 68)], fill=hexc("#3a3a4a"), width=2)
    d.polygon([(212, 62), (226, 62), (230, 72), (208, 72)], fill=hexc("#e8b84a"))
    d.rectangle([212, 62, 226, 63], fill=hexc("#f5d78a"))
    cone = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(cone).polygon([(210, 72), (228, 72), (250, 94), (196, 94)], fill=(255, 226, 150, 34))
    img = Image.alpha_composite(img, cone)
    d = ImageDraw.Draw(img)

    # mug
    d.rectangle([255, 87, 261, 94], fill=hexc("#f4f0e8"))
    d.rectangle([255, 87, 261, 88], fill=hexc("#6b3e22"))
    d.rectangle([262, 89, 263, 92], fill=hexc("#f4f0e8"))
    d.rectangle([255, 93, 261, 94], fill=hexc("#d8d0c0"))

    # --- floor plant (far right corner)
    d.rectangle([299, 154, 313, 172], fill=hexc("#c0653a"))
    d.rectangle([297, 152, 315, 156], fill=hexc("#d9794a"))
    d.rectangle([299, 168, 313, 172], fill=hexc("#a8532e"))
    for lx, ly, lr, col in [(306, 138, 8, "#4f9a4a"), (299, 143, 7, "#3f8a3f"), (313, 143, 7, "#3f8a3f"), (306, 130, 6, "#5fb05a")]:
        d.ellipse([lx - lr, ly - lr, lx + lr, ly + lr], fill=hexc(col))
    d.line([(306, 152), (306, 134)], fill=hexc("#2f6a30"))

    # --- warm vignette + window light
    light = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(light).polygon([(104, 74), (146, 74), (186, 150), (112, 150)], fill=(255, 214, 150, 22))
    img = Image.alpha_composite(img, light)
    vig = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vp = vig.load()
    for y in range(H):
        for x in range(W):
            dx = (x - W / 2) / (W / 2)
            dy = (y - H / 2) / (H / 2)
            r = math.sqrt(dx * dx + dy * dy)
            a = max(0, min(70, int((r - 0.75) * 120)))
            if a:
                vp[x, y] = (30, 12, 30, a)
    img = Image.alpha_composite(img, vig)

    img.save(out("room", "room.png"))


# --------------------------------------------------------------------------- #
#  CAT SPRITE SHEET  (6 cols x 5 rows of 32x32 frames)
# --------------------------------------------------------------------------- #
OUT_C = hexc("#3b2216")
BASE = hexc("#ee9340")
DARK = hexc("#c9651f")
CREAM = hexc("#f9deae")
PINK = hexc("#f2909e")
EYE = hexc("#2a1810")
WHITE = hexc("#ffffff")

FRAME = 32
COLS, ROWS = 6, 5


def new_frame():
    return Image.new("RGBA", (FRAME, FRAME), (0, 0, 0, 0))


def pts_line(d, pts, fill, width=2):
    d.line(pts, fill=fill, width=width)


TAILS_SIT = [
    [(9, 28), (4, 28), (2, 24), (2, 19)],
    [(9, 28), (4, 28), (2, 24), (3, 18)],
    [(9, 28), (4, 28), (2, 24), (4, 18)],
    [(9, 28), (4, 28), (2, 24), (3, 18)],
]


def draw_sit(tail=0, blink=False, happy=False, ear=0, surprised=False):
    """Sitting cat, facing right. Used for idle + react rows."""
    f = new_frame()
    d = ImageDraw.Draw(f)
    # tail (behind body)
    t = TAILS_SIT[tail % 4]
    pts_line(d, t, DARK, 3)
    d.rectangle([t[-1][0] - 1, t[-1][1] - 1, t[-1][0] + 1, t[-1][1] + 1], fill=CREAM)
    # body / haunch
    d.ellipse([6, 13, 25, 30], fill=BASE)
    d.ellipse([5, 19, 17, 30], fill=BASE)
    # chest
    d.ellipse([17, 14, 26, 29], fill=CREAM)
    # front legs
    d.rectangle([19, 24, 23, 29], fill=BASE)
    d.rectangle([19, 27, 24, 29], fill=CREAM)
    # hind paw
    d.rectangle([9, 28, 16, 29], fill=CREAM)
    # head
    d.ellipse([14, 3, 29, 18], fill=BASE)
    # ears
    e = -1 if ear else 0
    d.polygon([(15, 8), (15, 1 + e), (21, 5)], fill=BASE)
    d.polygon([(22, 5), (28, 1), (29, 9)], fill=BASE)
    d.polygon([(16, 7), (16, 3 + e), (19, 6)], fill=PINK)
    d.polygon([(25, 5), (27, 3), (28, 7)], fill=PINK)
    # cheek / muzzle
    d.ellipse([21, 10, 29, 17], fill=CREAM)
    # stripes: forehead
    for x in (19, 22):
        d.line([(x, 3), (x, 5)], fill=DARK)
    # stripes: back + haunch
    d.line([(8, 17), (11, 19)], fill=DARK)
    d.line([(7, 21), (10, 22)], fill=DARK)
    d.line([(8, 25), (11, 25)], fill=DARK)
    d.line([(13, 14), (15, 16)], fill=DARK)

    f = add_outline(f, OUT_C)
    d = ImageDraw.Draw(f)

    # face
    if happy:
        # ^ ^ eyes
        for ex in (19, 24):
            d.point((ex, 9), fill=EYE)
            d.point((ex + 1, 8), fill=EYE)
            d.point((ex + 2, 9), fill=EYE)
        d.rectangle([26, 13, 27, 14], fill=hexc("#c2475a"))  # open mouth
        d.point((26, 12), fill=PINK)
    elif blink:
        d.line([(19, 9), (21, 9)], fill=EYE)
        d.line([(24, 9), (26, 9)], fill=EYE)
        d.point((27, 12), fill=PINK)
    elif surprised:
        for ex in (19, 24):
            d.rectangle([ex, 7, ex + 2, 10], fill=EYE)
            d.point((ex, 7), fill=WHITE)
        d.point((27, 12), fill=PINK)
        d.point((27, 13), fill=hexc("#c2475a"))
    else:
        for ex in (19, 24):
            d.rectangle([ex, 7, ex + 1, 10], fill=EYE)
            d.point((ex, 7), fill=WHITE)
        d.point((27, 12), fill=PINK)
    # whisker hints
    d.point((29, 13), fill=CREAM)
    d.point((29, 15), fill=CREAM)
    return f


def draw_walk(phase_i, n=6):
    """Cat walking right. Frame i of n."""
    f = new_frame()
    d = ImageDraw.Draw(f)
    ph = 2 * math.pi * phase_i / n
    bob = 1 if phase_i % (n // 2) in (1, 2) else 0

    def leg(hx, off, color, near):
        sw = round(3 * math.sin(ph + off))
        lift = 2 if math.cos(ph + off) > 0.35 else 0
        foot = (hx + sw, 29 - lift)
        d.line([(hx, 21 + bob), foot], fill=color, width=2)
        d.rectangle([foot[0] - 1, foot[1] - 1, foot[0] + 1, foot[1]], fill=CREAM if near else hexc("#e2c493"))

    # far legs first (darker)
    leg(9, math.pi, DARK, False)
    leg(22, 0, DARK, False)
    # tail
    sway = round(2 * math.sin(ph))
    pts_line(d, [(7, 16 + bob), (3, 14 + bob), (2 + sway, 9), (4 + sway, 5)], DARK, 3)
    d.rectangle([3 + sway, 4, 5 + sway, 6], fill=CREAM)
    # body
    d.ellipse([4, 11 + bob, 25, 24 + bob], fill=BASE)
    d.ellipse([16, 14 + bob, 26, 25 + bob], fill=CREAM)
    # head
    d.ellipse([19, 5 + bob, 31, 19 + bob], fill=BASE)
    d.polygon([(20, 9 + bob), (20, 2 + bob), (25, 6 + bob)], fill=BASE)
    d.polygon([(26, 6 + bob), (30, 2 + bob), (31, 10 + bob)], fill=BASE)
    d.polygon([(21, 8 + bob), (21, 4 + bob), (23, 7 + bob)], fill=PINK)
    d.ellipse([25, 12 + bob, 31, 18 + bob], fill=CREAM)
    # stripes
    for sx in (8, 12, 16):
        d.line([(sx, 12 + bob), (sx + 1, 15 + bob)], fill=DARK)
    d.line([(24, 5 + bob), (24, 7 + bob)], fill=DARK)
    # near legs (lighter, drawn on top)
    leg(11, 0, BASE, True)
    leg(24, math.pi, BASE, True)

    f = add_outline(f, OUT_C)
    d = ImageDraw.Draw(f)
    d.rectangle([26, 8 + bob, 27, 10 + bob], fill=EYE)
    d.point((26, 8 + bob), fill=WHITE)
    d.point((31, 13 + bob), fill=PINK)
    return f


def draw_sleep(breath, zs):
    f = new_frame()
    d = ImageDraw.Draw(f)
    top = 15 - (1 if breath in (1, 2) else 0)
    # body loaf
    d.ellipse([2, top, 29, 30], fill=BASE)
    # head tucked front-right
    d.ellipse([15, 17, 30, 30], fill=BASE)
    d.polygon([(17, 20), (18, 14), (23, 18)], fill=BASE)
    d.polygon([(24, 18), (29, 14), (30, 21)], fill=BASE)
    d.polygon([(19, 19), (19, 16), (21, 18)], fill=PINK)
    d.polygon([(26, 18), (28, 16), (29, 20)], fill=PINK)
    d.ellipse([19, 24, 29, 30], fill=CREAM)
    # back stripes
    for sx in (6, 10, 14):
        d.line([(sx, top + 2), (sx + 2, top + 5)], fill=DARK)
    # tail wrapped around the front
    pts_line(d, [(3, 26), (6, 29), (13, 30)], DARK, 2)
    d.rectangle([12, 29, 14, 30], fill=CREAM)
    f = add_outline(f, OUT_C)
    d = ImageDraw.Draw(f)
    # closed eyes
    d.line([(19, 23), (21, 23)], fill=EYE)
    d.line([(25, 23), (27, 23)], fill=EYE)
    d.point((19, 22), fill=EYE)
    d.point((27, 22), fill=EYE)
    d.point((23, 26), fill=PINK)
    # floating Zs
    zc = hexc("#d7e9ff")
    zshadow = hexc("#5a6ca8")

    def z(x, y, big=False):
        s = 3 if not big else 4
        pat = [(0, 0), (1, 0), (2, 0), (2, 1), (1, 2), (0, 3), (1, 3), (2, 3)]
        for ox, oy in pat:
            d.point((x + ox + 1, y + oy + 1), fill=zshadow)
        for ox, oy in pat:
            d.point((x + ox, y + oy), fill=zc)

    for (zx, zy) in zs:
        z(zx, zy)
    return f


def draw_drag(sway):
    """Cat held by the scruff: dangling, front-facing."""
    f = new_frame()
    d = ImageDraw.Draw(f)
    s = sway
    # tail dangling
    pts_line(d, [(21, 20), (24 + s, 25), (24 + 2 * s, 30)], DARK, 2)
    # dangling legs
    d.line([(12, 21), (11 - s, 29)], fill=BASE, width=2)
    d.line([(16, 22), (15 - s, 30)], fill=BASE, width=2)
    d.line([(19, 21), (19 + s, 29)], fill=BASE, width=2)
    for fx, fy in ((11 - s, 29), (15 - s, 30), (19 + s, 29)):
        d.rectangle([fx - 1, fy - 1, fx + 1, fy], fill=CREAM)
    # body
    d.ellipse([10, 12, 24, 27], fill=BASE)
    d.ellipse([13, 15, 21, 26], fill=CREAM)
    # head
    d.ellipse([9, 3, 25, 17], fill=BASE)
    d.polygon([(9, 8), (9, 1), (15, 5)], fill=BASE)
    d.polygon([(19, 5), (25, 1), (25, 8)], fill=BASE)
    d.polygon([(10, 6), (10, 3), (13, 5)], fill=PINK)
    d.polygon([(21, 5), (24, 3), (24, 6)], fill=PINK)
    d.ellipse([13, 11, 21, 17], fill=CREAM)
    for x in (15, 17, 19):
        d.line([(x, 3), (x, 5)], fill=DARK)
    d.line([(11, 14), (12, 16)], fill=DARK)
    d.line([(10, 18), (12, 19)], fill=DARK)

    f = add_outline(f, OUT_C)
    d = ImageDraw.Draw(f)
    # big worried eyes
    for ex in (12, 19):
        d.rectangle([ex, 7, ex + 2, 11], fill=EYE)
        d.point((ex, 7), fill=WHITE)
    d.point((16, 13), fill=PINK)
    d.rectangle([16, 14, 17, 15], fill=hexc("#c2475a"))
    # sweat drop
    d.point((6, 7), fill=hexc("#8fd3ff"))
    d.rectangle([6, 8, 7, 9], fill=hexc("#8fd3ff"))
    return f


def make_cat_sheet():
    sheet = Image.new("RGBA", (FRAME * COLS, FRAME * ROWS), (0, 0, 0, 0))

    def put(col, row, frame):
        sheet.paste(frame, (col * FRAME, row * FRAME))

    # row 0: idle (4)  - tail swish + a blink
    put(0, 0, draw_sit(tail=0))
    put(1, 0, draw_sit(tail=1))
    put(2, 0, draw_sit(tail=2, blink=True))
    put(3, 0, draw_sit(tail=3, ear=1))
    # row 1: walk (6)
    for i in range(6):
        put(i, 1, draw_walk(i))
    # row 2: sleep (4)
    put(0, 2, draw_sleep(0, []))
    put(1, 2, draw_sleep(1, [(24, 7)]))
    put(2, 2, draw_sleep(2, [(23, 8), (27, 2)]))
    put(3, 2, draw_sleep(3, [(27, 3)]))
    # row 3: react / happy (4)
    put(0, 3, draw_sit(tail=0, surprised=True, ear=1))
    put(1, 3, draw_sit(tail=1, happy=True))
    put(2, 3, draw_sit(tail=2, happy=True, ear=1))
    put(3, 3, draw_sit(tail=3, happy=True))
    # row 4: dragged (2)
    put(0, 4, draw_drag(-1))
    put(1, 4, draw_drag(1))

    sheet.save(out("cat", "cat-sheet.png"))
    return sheet


# --------------------------------------------------------------------------- #
#  OBJECTS
# --------------------------------------------------------------------------- #
GLYPHS = {
    "C": ["XXX", "X..", "X..", "X..", "XXX"],
    "V": ["X.X", "X.X", "X.X", "X.X", ".X."],
}


def draw_glyph(d, ch, x, y, color):
    for gy, row in enumerate(GLYPHS[ch]):
        for gx, c in enumerate(row):
            if c == "X":
                d.point((x + gx, y + gy), fill=color)


def make_laptop():
    img = Image.new("RGBA", (32, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([4, 0, 27, 16], fill=hexc("#2c2c3a"))
    d.rectangle([5, 1, 26, 15], fill=hexc("#1b2548"))
    codes = [(7, 3, 9, "#7fd1ff"), (10, 5, 14, "#ffd479"), (10, 7, 8, "#b4f08a"),
             (7, 9, 12, "#ff8fb0"), (10, 11, 10, "#7fd1ff"), (7, 13, 5, "#ffd479")]
    for x, y, w, c in codes:
        d.line([(x, y), (x + w - 1, y)], fill=hexc(c))
    d.point((24, 3), fill=hexc("#ff6b6b"))
    # base
    d.polygon([(1, 22), (4, 17), (27, 17), (30, 22)], fill=hexc("#c4c4d4"))
    d.rectangle([1, 22, 30, 23], fill=hexc("#8a8a9c"))
    d.line([(4, 17), (27, 17)], fill=hexc("#e6e6f2"))
    for ky in (19, 21):
        for kx in range(6, 26, 3):
            d.point((kx, ky), fill=hexc("#8a8a9c"))
    d.rectangle([13, 21, 18, 21], fill=hexc("#8a8a9c"))
    img = add_outline(img, OUT_C)
    img.save(out("objects", "laptop.png"))


def make_folder():
    img = Image.new("RGBA", (26, 18), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([3, 1, 22, 8], fill=hexc("#ffffff"))  # paper peeking out
    d.line([(5, 3), (19, 3)], fill=hexc("#b8c4d8"))
    d.line([(5, 5), (16, 5)], fill=hexc("#b8c4d8"))
    d.rectangle([1, 4, 10, 6], fill=hexc("#d8a548"))  # tab
    d.rectangle([0, 6, 25, 17], fill=hexc("#ecbd5e"))
    d.rectangle([0, 6, 25, 7], fill=hexc("#f5d58a"))
    d.rectangle([0, 16, 25, 17], fill=hexc("#c99a3e"))
    d.rectangle([8, 9, 17, 15], fill=hexc("#fff8e6"))
    draw_glyph(d, "C", 9, 10, hexc("#c8554a"))
    draw_glyph(d, "V", 13, 10, hexc("#c8554a"))
    img = add_outline(img, OUT_C)
    img.save(out("objects", "folder.png"))


def make_bookshelf():
    W, H = 44, 84
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    rng = random.Random(11)
    d.rectangle([0, 0, W - 1, H - 1], fill=hexc("#7a4a2a"))
    d.rectangle([3, 3, W - 4, H - 4], fill=hexc("#3d2416"))
    shelf_ys = [3, 24, 45, 66]  # tops of the 4 compartments
    comp_h = 15
    palette = ["#c8554a", "#e8b84a", "#5b7fb8", "#4f9a4a", "#9a6bc0", "#e08a4a", "#3f8a8a", "#d97a9a"]
    for i, sy in enumerate(shelf_ys):
        bottom = sy + comp_h + 3
        if bottom > H - 4:
            bottom = H - 4
        d.rectangle([3, bottom, W - 4, bottom + 2], fill=hexc("#8f5d38"))
        d.line([(3, bottom), (W - 4, bottom)], fill=hexc("#b07d52"))
        x = 5
        base_y = bottom - 1
        while x < W - 6:
            if i == 1 and 22 <= x <= 28:
                # tiny trophy
                d.rectangle([x, base_y - 9, x + 6, base_y - 8], fill=hexc("#f0cf7a"))
                d.rectangle([x + 2, base_y - 7, x + 4, base_y - 3], fill=hexc("#d4a93a"))
                d.rectangle([x, base_y - 2, x + 6, base_y], fill=hexc("#8f5d38"))
                x += 9
                continue
            if i == 3 and x > 28:
                # little plant
                d.rectangle([x, base_y - 5, x + 6, base_y], fill=hexc("#c0653a"))
                d.ellipse([x - 1, base_y - 13, x + 7, base_y - 4], fill=hexc("#4f9a4a"))
                break
            bw = rng.choice([3, 3, 4, 4, 5])
            bh = rng.randint(10, 15)
            col = hexc(rng.choice(palette))
            d.rectangle([x, base_y - bh, x + bw - 1, base_y], fill=col)
            d.line([(x, base_y - bh), (x, base_y)], fill=tuple(min(255, c + 40) for c in col[:3]) + (255,))
            d.line([(x + 1, base_y - bh + 3), (x + bw - 2, base_y - bh + 3)], fill=hexc("#f6e9c8"))
            x += bw
            if rng.random() < 0.12:
                x += 3  # gap
    img = add_outline(img, OUT_C)
    img.save(out("objects", "bookshelf.png"))


def make_frame():
    W, H = 26, 28
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W - 1, H - 1], fill=hexc("#8a5a38"))
    d.rectangle([1, 1, W - 2, 2], fill=hexc("#b07d52"))
    d.rectangle([1, 1, 2, H - 2], fill=hexc("#a06c44"))
    d.rectangle([3, 3, W - 4, H - 4], fill=hexc("#f4ecdc"))
    # picture
    pic = Image.new("RGBA", (16, 18), hexc("#9fd3f0"))
    pd = ImageDraw.Draw(pic)
    pd.rectangle([0, 12, 15, 17], fill=hexc("#7fb86a"))
    pd.ellipse([3, 11, 13, 24], fill=hexc("#5b7fb8"))  # shoulders
    pd.rectangle([6, 9, 10, 12], fill=hexc("#f1c9a0"))  # neck
    pd.ellipse([4, 2, 12, 11], fill=hexc("#f1c9a0"))  # head
    pd.pieslice([3, 0, 13, 9], 180, 360, fill=hexc("#4a2a1a"))  # hair
    pd.point((6, 7), fill=EYE)
    pd.point((10, 7), fill=EYE)
    pd.line([(7, 9), (9, 9)], fill=hexc("#c2475a"))
    img.paste(pic, (5, 5))
    img = add_outline(img, OUT_C)
    img.save(out("objects", "frame.png"))


def make_phone():
    img = Image.new("RGBA", (12, 20), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([1, 0, 10, 17], fill=hexc("#2b2b3b"))
    d.rectangle([2, 2, 9, 15], fill=hexc("#4aa8e8"))
    d.rectangle([2, 2, 9, 5], fill=hexc("#7fd1ff"))
    # chat bubble
    d.rectangle([3, 8, 8, 11], fill=hexc("#ffffff"))
    d.point((4, 12), fill=hexc("#ffffff"))
    d.point((4, 9), fill=hexc("#4aa8e8"))
    d.point((6, 9), fill=hexc("#4aa8e8"))
    d.point((5, 10), fill=hexc("#4aa8e8"))
    d.point((7, 10), fill=hexc("#4aa8e8"))
    d.point((5, 16), fill=hexc("#8a8a9a"))
    d.point((6, 16), fill=hexc("#8a8a9a"))
    # little stand
    d.rectangle([3, 18, 8, 19], fill=hexc("#8a8a9a"))
    img = add_outline(img, OUT_C)
    img.save(out("objects", "phone.png"))


def make_tictactoe():
    W, H = 30, 22
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W - 1, H - 1], fill=hexc("#8a5a38"))
    d.rectangle([1, 1, W - 2, 2], fill=hexc("#b07d52"))
    d.rectangle([3, 3, W - 4, H - 4], fill=hexc("#f4e1b8"))
    for gx in (11, 18):
        d.line([(gx, 4), (gx, H - 5)], fill=hexc("#6b3e22"))
    for gy in (8, 13):
        d.line([(4, gy), (W - 5, gy)], fill=hexc("#6b3e22"))
    red, blue = hexc("#c8554a"), hexc("#2f5f9a")

    def mark_x(cx, cy):
        for dx, dy in ((-1, -1), (1, -1), (0, 0), (-1, 1), (1, 1)):
            d.point((cx + dx, cy + dy), fill=red)

    def mark_o(cx, cy):
        d.rectangle([cx - 1, cy - 1, cx + 1, cy + 1], outline=blue)

    mark_x(7, 5)
    mark_x(14, 10)
    mark_x(22, 16)
    mark_o(14, 5)
    mark_o(7, 16)
    img = add_outline(img, OUT_C)
    img.save(out("objects", "tictactoe.png"))


def make_minesweeper():
    W, H = 18, 26
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([1, 0, 16, 24], fill=hexc("#c4c4d4"))
    d.rectangle([15, 1, 16, 24], fill=hexc("#9a9ab0"))
    d.rectangle([1, 23, 16, 24], fill=hexc("#9a9ab0"))
    d.line([(1, 0), (16, 0)], fill=hexc("#e6e6f2"))
    # screen
    d.rectangle([3, 2, 14, 12], fill=hexc("#3a3a4a"))
    d.rectangle([4, 3, 13, 11], fill=hexc("#9fd36a"))
    dark = hexc("#4a7a3a")
    for gx in (7, 10):
        d.line([(gx, 3), (gx, 11)], fill=hexc("#86bd54"))
    for gy in (6, 9):
        d.line([(4, gy), (13, gy)], fill=hexc("#86bd54"))
    d.point((5, 4), fill=dark)
    d.point((11, 4), fill=hexc("#2f5f9a"))
    d.rectangle([8, 7, 9, 8], fill=hexc("#1c1a38"))  # a tiny mine
    d.point((5, 10), fill=hexc("#c8554a"))
    d.point((12, 10), fill=dark)
    # d-pad
    d.rectangle([5, 17, 7, 21], fill=hexc("#3a3a4a"))
    d.rectangle([4, 18, 8, 20], fill=hexc("#3a3a4a"))
    # buttons
    d.rectangle([11, 15, 12, 16], fill=hexc("#c8554a"))
    d.rectangle([13, 18, 14, 19], fill=hexc("#c8554a"))
    # speaker slits
    for sy in (22, 23):
        d.line([(10, sy), (14, sy)], fill=hexc("#8a8a9c"))
    img = add_outline(img, OUT_C)
    img.save(out("objects", "minesweeper.png"))


# --------------------------------------------------------------------------- #
#  FX
# --------------------------------------------------------------------------- #
def make_fx():
    # heart 9x8
    heart = Image.new("RGBA", (9, 8), (0, 0, 0, 0))
    hd = ImageDraw.Draw(heart)
    pat = [
        ".XX...XX.",
        "XXXX.XXXX",
        "XXXXXXXXX",
        "XXXXXXXXX",
        ".XXXXXXX.",
        "..XXXXX..",
        "...XXX...",
        "....X....",
    ]
    for y, row in enumerate(pat):
        for x, c in enumerate(row):
            if c == "X":
                hd.point((x, y), fill=hexc("#ff5d7a"))
    hd.point((1, 1), fill=hexc("#ffc0cc"))
    hd.point((2, 1), fill=hexc("#ffc0cc"))
    heart = add_outline(heart.resize((9, 8)), hexc("#7a1f3a"))
    heart.save(out("fx", "heart.png"))

    # sparkle 7x7
    sp = Image.new("RGBA", (7, 7), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sp)
    for i in range(7):
        sd.point((3, i), fill=hexc("#fff2a8"))
        sd.point((i, 3), fill=hexc("#fff2a8"))
    sd.rectangle([2, 2, 4, 4], fill=hexc("#ffffff"))
    sp.save(out("fx", "sparkle.png"))

    # shadow 24x8
    sh = Image.new("RGBA", (24, 8), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([0, 0, 23, 7], fill=(30, 12, 20, 90))
    sh.save(out("fx", "shadow.png"))


def make_favicon(sheet):
    # crop the sitting cat's head from idle frame 0
    frame = sheet.crop((0, 0, FRAME, FRAME))
    head = frame.crop((10, 0, 32, 20)).resize((22 * 3, 20 * 3), Image.NEAREST)
    fav = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    fav.paste(head, ((64 - head.width) // 2, (64 - head.height) // 2), head)
    fav.save(out("fx", "favicon.png"))


# --------------------------------------------------------------------------- #
#  PLACEHOLDER RESUME PDF
# --------------------------------------------------------------------------- #
def make_resume():
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
    except ImportError:
        print("reportlab not installed - skipping placeholder resume.pdf")
        return
    path = os.path.join(ROOT, "public", "resume", "resume.pdf")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    c = canvas.Canvas(path, pagesize=A4)
    w, h = A4
    c.setFont("Helvetica-Bold", 26)
    c.drawString(60, h - 90, "Your Name")
    c.setFont("Helvetica", 13)
    c.drawString(60, h - 112, "Your Job Title")
    c.line(60, h - 126, w - 60, h - 126)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(60, h - 170, "This is a placeholder resume")
    c.setFont("Helvetica", 11)
    lines = [
        "Replace this file with your own PDF:",
        "    public/resume/resume.pdf",
        "",
        "Or point `resume.file` in src/content/portfolio.js at a different path.",
    ]
    y = h - 195
    for ln in lines:
        c.drawString(60, y, ln)
        y -= 16
    c.save()


def main():
    make_room()
    sheet = make_cat_sheet()
    make_laptop()
    make_folder()
    make_bookshelf()
    make_frame()
    make_phone()
    make_tictactoe()
    make_minesweeper()
    make_fx()
    make_favicon(sheet)
    make_resume()
    print("Placeholder assets written to", ASSETS)


if __name__ == "__main__":
    main()
