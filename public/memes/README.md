# Meme Reference Images

This folder holds all reference images for Meme Mode.
Each pack has its own subfolder with exactly 4 numbered images.

## Required folder structure

```
public/
└── memes/
    ├── monkey/
    │   ├── 1.jpg   ← frame 1 — "Point one finger up confidently"
    │   ├── 2.jpg   ← frame 2 — "Finger on chin, deep in thought"
    │   ├── 3.jpg   ← frame 3 — "Look up and to the right"
    │   └── 4.jpg   ← frame 4 — "Open mouth — shocked face"
    │
    ├── spongebob/
    │   ├── 1.jpg   ← frame 1 — "Raise both arms out like a star"
    │   ├── 2.jpg   ← frame 2 — "Cover your friend's eyes"
    │   ├── 3.jpg   ← frame 3 — "Run forward with arms wide open"
    │   └── 4.jpg   ← frame 4 — "Peek over someone's shoulder"
    │
    └── sixseven/
        ├── 1.jpg   ← frame 1 — "Two people arguing face-to-face"
        ├── 2.jpg   ← frame 2 — "Hold up 6 fingers at camera"
        ├── 3.jpg   ← frame 3 — "Hold up 7 fingers at camera"
        └── 4.jpg   ← frame 4 — "Both stare at camera. Done."
```

## Rules for the images

- Format: JPG or PNG (rename to .jpg)
- Minimum size: 600×400px. Bigger is fine — they get center-cropped.
- Aspect ratio: doesn't matter — the compositor uses cover-fit cropping
- Each image should clearly show the pose the user needs to copy

## Where to find these images

### Monkey pack (`monkey/`)
Search Google Images for:
- "Gibraltar monkey meme pointing"    → 1.jpg
- "Gibraltar monkey thinking"         → 2.jpg
- "Gibraltar monkey looking up"       → 3.jpg
- "Gibraltar monkey shocked"          → 4.jpg

### Spongebob pack (`spongebob/`)
These are screenshots from the cartoon. Search:
- "Spongebob arms out meme"           → 1.jpg
- "Patrick covers Spongebob eyes"     → 2.jpg
- "Spongebob running meme"            → 3.jpg
- "Patrick peeks meme"                → 4.jpg

### Six & Seven pack (`sixseven/`)
Search for the original viral "6 & 7" argument video/meme:
- "6 and 7 argument meme"             → 1.jpg, 2.jpg, 3.jpg, 4.jpg

## Important

If an image is missing, the app shows a dark placeholder with "?" — it won't crash.
The compositor handles missing images gracefully so you can test without all images present.

## Custom packs

Users can upload their own 4 images directly in the app — no folder needed.
These are loaded as data URLs via FileReader (client-side only, nothing is uploaded).
