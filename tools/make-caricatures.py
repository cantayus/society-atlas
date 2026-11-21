#!/usr/bin/env python3
"""Build caricature portraits from the identified source photographs.

Deterministic image processing only (no generative model):
  1. find the face and 68 landmarks (dlib),
  2. crop a square bust,
  3. apply a mild "big head" caricature warp that is the same for everyone
     (uniform head enlargement, slightly larger eyes, narrower shoulders),
  4. cartoon treatment: flat colour regions, limited tones, ink outlines,
  5. cut the figure out, add a white sticker edge and a painted backdrop,
  6. write expression variants made with small landmark warps, plus a rig file
     (eye, mouth and chin positions) that the game uses for talking and blinking.

Usage:  python3 tools/make-caricatures.py SRC_DIR OUT_DIR [--only slug]
Needs:  pip install dlib-bin face_recognition_models opencv-python-headless pillow numpy
The source photograph's attribution and licence status carry over unchanged;
see dist/assets/portraits/caricature/manifest.json.
"""
import json, os, sys, glob, math
import numpy as np, cv2
from PIL import Image

SIZE = 512          # output edge in pixels
WORK = 768          # working edge
EXPRESSIONS = ("neutral", "pleased", "thinking", "sceptical", "worried")


def load(path):
    img = cv2.imread(path)
    if img is None:
        img = cv2.cvtColor(np.array(Image.open(path).convert("RGB")), cv2.COLOR_RGB2BGR)
    return img


def landmarks(img, det, sp):
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    faces = det(rgb, 1) or det(rgb, 2)
    if not faces:
        return None
    face = max(faces, key=lambda r: r.width() * r.height())
    shape = sp(rgb, face)
    return np.array([[shape.part(i).x, shape.part(i).y] for i in range(68)], dtype=np.float32)


def crop_bust(img, pts):
    """Square crop centred a little above the nose, wide enough for hair and shoulders."""
    eye = (pts[36:42].mean(0) + pts[42:48].mean(0)) / 2
    chin = pts[8]
    face_h = np.linalg.norm(chin - eye) * 2.05
    cx, cy = eye[0], eye[1] + face_h * 0.20
    half = face_h * 1.12
    h, w = img.shape[:2]
    valid = np.full((h, w), 255, np.uint8)
    pad = int(max(0, half - cx, half - cy, cx + half - w, cy + half - h)) + 2
    if pad > 2:
        img = cv2.copyMakeBorder(img, pad, pad, pad, pad, cv2.BORDER_REPLICATE)
        valid = cv2.copyMakeBorder(valid, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
        cx, cy, pts = cx + pad, cy + pad, pts + pad
    x0, y0 = int(round(cx - half)), int(round(cy - half))
    side = int(round(half * 2))
    out = img[y0:y0 + side, x0:x0 + side]
    valid = valid[y0:y0 + side, x0:x0 + side]
    scale = WORK / side
    out = cv2.resize(out, (WORK, WORK), interpolation=cv2.INTER_CUBIC if scale > 1 else cv2.INTER_AREA)
    valid = cv2.resize(valid, (WORK, WORK), interpolation=cv2.INTER_NEAREST)
    return out, (pts - [x0, y0]) * scale, valid


def bump(xx, yy, cx, cy, radius):
    r2 = ((xx - cx) ** 2 + (yy - cy) ** 2) / (radius * radius)
    return np.clip(1 - r2, 0, 1) ** 2


class Warp:
    """Inverse-mapped warp field: out(p) = src(p + d(p))."""

    def __init__(self, n=WORK):
        self.n = n
        self.yy, self.xx = np.mgrid[0:n, 0:n].astype(np.float32)
        self.dx = np.zeros((n, n), np.float32)
        self.dy = np.zeros((n, n), np.float32)

    def magnify(self, cx, cy, radius, amount):
        """Enlarge what is around (cx, cy) by `amount` (0.2 = 20 percent)."""
        f = bump(self.xx + self.dx, self.yy + self.dy, cx, cy, radius) * amount / (1 + amount)
        self.dx -= (self.xx + self.dx - cx) * f
        self.dy -= (self.yy + self.dy - cy) * f

    def push(self, cx, cy, radius, vx, vy):
        """Move what is around (cx, cy) by (vx, vy) pixels."""
        f = bump(self.xx, self.yy, cx, cy, radius)
        self.dx -= vx * f
        self.dy -= vy * f

    def taper(self, y_from, cx, amount):
        """Narrow everything below y_from toward the centre line (bobble-head shoulders)."""
        t = np.clip((self.yy - y_from) / (self.n - y_from + 1e-6), 0, 1)
        self.dx += (self.xx - cx) * t * amount

    def rotate(self, cx, cy, degrees):
        a = math.radians(degrees)
        x, y = self.xx + self.dx - cx, self.yy + self.dy - cy
        self.dx += (x * math.cos(a) - y * math.sin(a)) - x
        self.dy += (x * math.sin(a) + y * math.cos(a)) - y

    def apply(self, img, border=cv2.BORDER_REPLICATE):
        return cv2.remap(img, self.xx + self.dx, self.yy + self.dy, cv2.INTER_CUBIC, borderMode=border)

    def forward(self, pts):
        """Where source points end up (fixed-point inverse of the field)."""
        out = pts.astype(np.float32).copy()
        for _ in range(25):
            xi = np.clip(out[:, 0], 0, self.n - 1).astype(int)
            yi = np.clip(out[:, 1], 0, self.n - 1).astype(int)
            src = out + np.stack([self.dx[yi, xi], self.dy[yi, xi]], 1)
            out += (pts - src) * 0.8
        return out


def caricature_warp(pts):
    eye_l, eye_r = pts[36:42].mean(0), pts[42:48].mean(0)
    eyes = (eye_l + eye_r) / 2
    chin, mouth = pts[8], pts[48:68].mean(0)
    face_h = np.linalg.norm(chin - eyes) * 2.05
    centre = eyes * 0.55 + mouth * 0.45
    w = Warp()
    w.taper(chin[1] + face_h * 0.10, centre[0], 0.34)       # narrower shoulders
    w.magnify(centre[0], centre[1] - face_h * 0.06, face_h * 1.05, 0.26)   # bigger head
    eye_r_px = np.linalg.norm(eye_r - eye_l) * 0.42
    w.magnify(eye_l[0], eye_l[1], eye_r_px, 0.13)           # slightly larger eyes
    w.magnify(eye_r[0], eye_r[1], eye_r_px, 0.13)
    return w


def expression_warp(pts, name):
    """Small landmark moves on the finished cartoon. Same recipe for everyone."""
    w = Warp()
    eye_l, eye_r = pts[36:42].mean(0), pts[42:48].mean(0)
    unit = np.linalg.norm(eye_r - eye_l)
    ml, mr = pts[48], pts[54]
    bl, br = pts[17:22].mean(0), pts[22:27].mean(0)
    centre = (eye_l + eye_r) / 2
    if name == "pleased":
        for corner, sx in ((ml, -1), (mr, 1)):
            w.push(corner[0], corner[1], unit * 0.42, sx * unit * 0.045, -unit * 0.085)
        w.push(pts[30][0], pts[57][1] + unit * 0.05, unit * 0.40, 0, unit * 0.025)
        for b in (bl, br):
            w.push(b[0], b[1], unit * 0.40, 0, -unit * 0.03)
    elif name == "worried":
        for corner in (ml, mr):
            w.push(corner[0], corner[1], unit * 0.40, 0, unit * 0.055)
        w.push(pts[21][0], pts[21][1], unit * 0.30, 0, -unit * 0.075)
        w.push(pts[22][0], pts[22][1], unit * 0.30, 0, -unit * 0.075)
    elif name == "sceptical":
        w.push(br[0], br[1], unit * 0.42, 0, -unit * 0.105)
        w.push(bl[0], bl[1], unit * 0.40, 0, unit * 0.03)
        w.push(mr[0], mr[1], unit * 0.38, unit * 0.03, -unit * 0.04)
        w.rotate(centre[0], centre[1] + unit, 2.2)
    elif name == "thinking":
        w.push(pts[21][0], pts[21][1], unit * 0.30, unit * 0.02, unit * 0.04)
        w.push(pts[22][0], pts[22][1], unit * 0.30, -unit * 0.02, unit * 0.04)
        w.push(ml[0], ml[1], unit * 0.36, unit * 0.03, 0)
        w.push(mr[0], mr[1], unit * 0.36, -unit * 0.03, 0)
        w.rotate(centre[0], centre[1] + unit, -3.0)
    return w


def cut_out(img, pts):
    """Foreground mask with GrabCut seeded by the face and a torso wedge."""
    n = img.shape[0]
    small = cv2.resize(img, (384, 384), interpolation=cv2.INTER_AREA)
    s = 384 / n
    p = pts * s
    mask = np.full((384, 384), cv2.GC_PR_BGD, np.uint8)
    hull = cv2.convexHull(np.concatenate([p[0:17], p[17:27] - [0, (p[8][1] - p[27][1]) * 0.55]]).astype(np.int32))
    cv2.fillConvexPoly(mask, hull, cv2.GC_PR_FGD)
    core = cv2.convexHull(p[[1, 15, 4, 12, 8, 19, 24]].astype(np.int32))
    cv2.fillConvexPoly(mask, core, cv2.GC_FGD)
    chin, cx = p[8], p[27][0]
    fw = np.linalg.norm(p[16] - p[0])
    torso = np.array([[cx - fw * 0.42, chin[1]], [cx + fw * 0.42, chin[1]], [cx + fw * 1.25, 383], [cx - fw * 1.25, 383]], np.int32)
    cv2.fillConvexPoly(mask, torso, cv2.GC_PR_FGD)
    neck = np.array([[cx - fw * 0.22, chin[1] - 4], [cx + fw * 0.22, chin[1] - 4], [cx + fw * 0.5, 383], [cx - fw * 0.5, 383]], np.int32)
    cv2.fillConvexPoly(mask, neck, cv2.GC_FGD)
    mask[:10, :] = cv2.GC_BGD
    mask[:int(max(8, p[19][1] - fw * 1.0)), :] = cv2.GC_BGD
    mask[:int(chin[1] - fw * 0.2), :8] = cv2.GC_BGD
    mask[:int(chin[1] - fw * 0.2), -8:] = cv2.GC_BGD
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.setRNGSeed(7)
    try:
        cv2.grabCut(small, mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    except cv2.error:
        return None
    fg = ((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)).astype(np.uint8)
    # keep the component that holds the face, close pinholes
    count, labels = cv2.connectedComponents(fg)
    keep = labels[int(np.clip(p[30][1], 0, 383)), int(np.clip(p[30][0], 0, 383))]
    fg = (labels == keep).astype(np.uint8) if keep else fg
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    share = fg.mean()
    if share < 0.22 or share > 0.86:
        return None
    fg = cv2.resize(fg * 255, (n, n), interpolation=cv2.INTER_LINEAR)
    return cv2.GaussianBlur(fg, (0, 0), 2.2)


def toon(img):
    """Flat colour regions, limited tones and ink lines."""
    base = cv2.bilateralFilter(img, 9, 55, 9)
    flat = cv2.pyrMeanShiftFiltering(base, 14, 26)
    flat = cv2.bilateralFilter(flat, 7, 40, 7)
    lab = cv2.cvtColor(flat, cv2.COLOR_BGR2LAB).astype(np.float32)
    L = lab[..., 0]
    lo, hi = np.percentile(L, 2), np.percentile(L, 98)
    L = np.clip((L - lo) / max(1.0, hi - lo), 0, 1)
    levels = 7
    stepped = np.floor(L * levels) / levels + (1 / levels) * (1 / (1 + np.exp(-(L * levels % 1 - 0.5) * 14)))
    lab[..., 0] = np.clip(stepped * 235 + 12, 0, 255)
    lab[..., 1] = 128 + (lab[..., 1] - 128) * 1.28
    lab[..., 2] = 128 + (lab[..., 2] - 128) * 1.28 + 3
    colour = cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
    gray = cv2.cvtColor(base, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    g1, g2 = cv2.GaussianBlur(gray, (0, 0), 1.3), cv2.GaussianBlur(gray, (0, 0), 2.6)
    dog = g1 - 0.985 * g2
    ink = np.where(dog >= 0.006, 1.0, 1.0 + np.tanh(55 * (dog - 0.006)))
    ink = cv2.GaussianBlur(np.clip(ink, 0, 1).astype(np.float32), (0, 0), 0.7)
    ink = np.clip((ink - 0.35) / 0.5, 0, 1)
    out = colour.astype(np.float32) * (0.22 + 0.78 * ink[..., None])
    return np.clip(out, 0, 255).astype(np.uint8)


def backdrop(n, tint):
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32)
    cx, cy = n * 0.5, n * 0.46
    r = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (n * 0.75)
    ang = np.arctan2(yy - cy, xx - cx)
    rays = (np.sin(ang * 12) > 0).astype(np.float32) * 0.07
    base = np.array(tint, np.float32)[None, None, :]
    paper = np.array([196, 222, 238], np.float32)[None, None, :]     # BGR parchment
    mixv = np.clip(1.0 - r * 0.85 + rays, 0, 1)[..., None]
    bg = paper * mixv + base * (1 - mixv)
    rng = np.random.default_rng(11)
    bg += rng.normal(0, 2.2, (n, n, 1)).astype(np.float32)
    return np.clip(bg, 0, 255).astype(np.uint8)


def compose(figure, alpha, tint):
    n = figure.shape[0]
    bg = backdrop(n, tint)
    if alpha is None:
        return figure
    a = alpha.astype(np.float32) / 255
    edge = cv2.dilate(alpha, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19)))
    edge = cv2.GaussianBlur(edge, (0, 0), 1.6).astype(np.float32) / 255
    shadow = cv2.GaussianBlur(np.roll(np.roll(edge, 7, 0), 6, 1), (0, 0), 6)
    out = bg.astype(np.float32) * (1 - 0.33 * shadow[..., None])
    out = out * (1 - edge[..., None]) + 250 * edge[..., None]
    out = out * (1 - a[..., None]) + figure.astype(np.float32) * a[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)


def rig_of(pts, scale):
    def box(idx, pad):
        p = pts[idx]
        x0, y0 = p.min(0) - pad
        x1, y1 = p.max(0) + pad
        return [round(float(v) * scale / SIZE, 4) for v in (x0, y0, x1 - x0, y1 - y0)]
    unit = float(np.linalg.norm(pts[36:42].mean(0) - pts[42:48].mean(0)))
    return {
        "eyes": [box(list(range(36, 42)), unit * 0.10), box(list(range(42, 48)), unit * 0.10)],
        "mouth": box(list(range(48, 68)), unit * 0.06),
        "chinY": round(float(pts[8][1]) * scale / SIZE, 4),
        "jaw": box(list(range(3, 14)), unit * 0.05),
        "face": box(list(range(0, 27)), unit * 0.10),
    }


TINTS = [(150, 110, 78), (96, 122, 150), (104, 142, 118), (128, 104, 150), (92, 136, 168), (140, 128, 92)]


def build(path, out_dir, det, sp, index):
    slug = os.path.splitext(os.path.basename(path))[0]
    img = load(path)
    pts = landmarks(img, det, sp)
    if pts is None:
        return slug, None
    bust, pts, valid = crop_bust(img, pts)
    if min(img.shape[:2]) < 420:                      # small originals: denoise the upscale
        bust = cv2.fastNlMeansDenoisingColored(bust, None, 4, 4, 5, 15)
    warp = caricature_warp(pts)
    warped = warp.apply(bust)
    wpts = warp.forward(pts)
    alpha = cut_out(warped, wpts)
    if alpha is not None:
        # nothing outside the original photograph belongs to the figure
        inside = warp.apply(valid, cv2.BORDER_CONSTANT)
        inside = cv2.erode(inside, np.ones((5, 5), np.uint8))
        alpha = cv2.min(alpha, cv2.GaussianBlur(inside, (0, 0), 1.5))
        fade = np.clip((WORK - 1 - np.arange(WORK)) / (WORK * 0.05), 0, 1).astype(np.float32)
        alpha = (alpha.astype(np.float32) * fade[:, None]).astype(np.uint8)
    figure = toon(warped)
    tint = TINTS[index % len(TINTS)]
    os.makedirs(os.path.join(out_dir, slug), exist_ok=True)
    rigs = {}
    for name in EXPRESSIONS:
        if name == "neutral":
            fig, a, p = figure, alpha, wpts
        else:
            ew = expression_warp(wpts, name)
            fig = ew.apply(figure)
            a = ew.apply(alpha, cv2.BORDER_CONSTANT) if alpha is not None else None
            p = ew.forward(wpts)
        final = compose(fig, a, tint)
        final = cv2.resize(final, (SIZE, SIZE), interpolation=cv2.INTER_AREA)
        Image.fromarray(cv2.cvtColor(final, cv2.COLOR_BGR2RGB)).save(
            os.path.join(out_dir, slug, name + ".webp"), "WEBP", quality=86, method=6)
        rigs[name] = rig_of(p, SIZE / WORK)
    return slug, {"slug": slug, "expressions": list(EXPRESSIONS), "rig": rigs, "cutout": alpha is not None}


def main():
    import dlib, face_recognition_models as models
    src, out = sys.argv[1], sys.argv[2]
    only = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None
    det, sp = dlib.get_frontal_face_detector(), dlib.shape_predictor(models.pose_predictor_model_location())
    files = sorted(f for f in glob.glob(os.path.join(src, "*.*")) if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")))
    result = {}
    for i, f in enumerate(files):
        slug = os.path.splitext(os.path.basename(f))[0]
        if only and slug != only:
            continue
        slug, info = build(f, out, det, sp, i)
        print(("ok   " if info else "SKIP ") + slug, flush=True)
        if info:
            result[slug] = info
    if not only:
        with open(os.path.join(out, "rig.json"), "w", encoding="utf8") as fh:
            json.dump(result, fh, indent=1, sort_keys=True)


if __name__ == "__main__":
    main()
