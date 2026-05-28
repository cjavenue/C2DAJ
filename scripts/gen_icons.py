#!/usr/bin/env python3
"""Generate PWA icons (no third-party deps) for MJ Prompt Builder Pro.

Draws a full-bleed indigo radial-gradient background with a white "sparkle"
(astroid star) mark, matching the app's ✨ Optimize theme. PNGs are written by
hand using only zlib + struct from the stdlib so this runs anywhere.
"""
import math
import struct
import zlib
import binascii
import os

# Brand colors
INDIGO = (88, 101, 242)      # #5865F2
DEEP = (18, 18, 30)          # #12121e
WHITE = (255, 255, 255)


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def astroid_coverage(nx, ny, s):
    """Soft coverage [0..1] for a 4-point star (astroid) of half-size s.

    Boundary: |x|^(2/3) + |y|^(2/3) = s^(2/3). We sample the implicit value
    and feather the edge for anti-aliasing.
    """
    if s <= 0:
        return 0.0
    val = (abs(nx) / s) ** (2.0 / 3.0) + (abs(ny) / s) ** (2.0 / 3.0)
    # val < 1 inside, == 1 on boundary. Feather across a small band.
    edge = 0.06
    if val <= 1.0 - edge:
        return 1.0
    if val >= 1.0 + edge:
        return 0.0
    return (1.0 + edge - val) / (2.0 * edge)


def render(size):
    cx = cy = (size - 1) / 2.0
    max_r = math.hypot(cx, cy)
    rows = []
    for y in range(size):
        row = bytearray()
        row.append(0)  # PNG filter byte (none)
        for x in range(size):
            # --- radial gradient background (full bleed) ---
            d = math.hypot(x - cx, y - cy) / max_r
            bg = lerp(INDIGO, DEEP, min(1.0, d * 1.15))

            # normalized coords centered at 0, range ~[-0.5, 0.5]
            nx = (x - cx) / size
            ny = (y - cy) / size

            # main sparkle
            cov = astroid_coverage(nx, ny, 0.30)
            # secondary smaller sparkle (upper-right)
            cov = max(cov, astroid_coverage(nx - 0.26, ny + 0.24, 0.085))
            # tiny accent sparkle (lower-left)
            cov = max(cov, astroid_coverage(nx + 0.27, ny - 0.20, 0.05))

            # soft glow around the main star
            glow_d = math.hypot(nx, ny)
            glow = max(0.0, 1.0 - glow_d / 0.42) * 0.18

            px = lerp(bg, WHITE, min(1.0, cov + glow))
            row += bytes(px)
        rows.append(bytes(row))
    return b"".join(rows)


def write_png(path, size):
    raw = render(size)
    comp = zlib.compress(raw, 9)

    def chunk(tag, data):
        c = tag + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", binascii.crc32(c) & 0xffffffff)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)  # 8-bit RGB
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", comp) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)
    print(f"wrote {path} ({size}x{size}, {len(png)} bytes)")


if __name__ == "__main__":
    base = os.path.join(os.path.dirname(__file__), "..", "icons")
    base = os.path.abspath(base)
    for name, size in [
        ("icon-192.png", 192),
        ("icon-512.png", 512),
        ("maskable-512.png", 512),
        ("apple-touch-icon.png", 180),
    ]:
        write_png(os.path.join(base, name), size)
