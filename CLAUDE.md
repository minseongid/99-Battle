# CLAUDE.md

## Project

99 Battle

## Tech Stack

- Spring Boot
- React
- TypeScript
- MySQL
- WebSocket

## Development Principles

- Mobile First
- Portrait Mode
- Clean UI
- Blue & White Theme
- Custom Numeric Keypad
- Responsive Layout

## Documents

Read these before implementation.

- GAME_DESIGN.md
- SYSTEM_DESIGN.md
- UI_UX.md

## Important

Never implement features that are not defined in the documents without asking first.

## No-Scroll Policy (established via user feedback)

The document/page itself must never scroll. The only sanctioned exception is a
genuinely unbounded list (e.g. the public room list), where a self-contained
inner region scrolls while the header/footer stay pinned — everything else
(Home, Room, CreateRoom, and any future screen) must fit its viewport exactly.

### How it's implemented

`frontend/src/index.css` defines a shared set of CSS custom properties
(`--room-*`, `--home-*`, `--lobby-*`) that pages reference via
`className="...-[var(--foo)]"` instead of hardcoded Tailwind spacing. Two
tiers exist:

- **Comfortable** (`:root` defaults) — used on tall-enough screens.
- **Compact** — overrides triggered by
  `@media (max-height: 700px), (min-width: 640px) and (max-height: 900px)`.

### The desktop trap (bit us once — don't repeat it)

`PageShell` caps its card at `sm:max-h-[calc(100vh-4rem)]` on desktop widths
(≥640px), so **the usable height on desktop is always 64px less than the raw
window height** — mobile has no such cap. A breakpoint tuned only against raw
mobile heights (e.g. "compact below 700px") is silently wrong on desktop: a
1366×768 laptop window (a very common size) only has 704px of real card
height, well inside what "comfortable" mode assumes will fit. This is why the
compact media query above has two branches — the second one (`min-width:640px
and max-height:900px`) exists specifically to compensate for that 64px tax on
desktop, not to duplicate the mobile rule.

**Do not add a `sm:`-only override (e.g. `sm:max-w-[320px]`) to make
something bigger on desktop without also re-measuring at a short desktop
window (1366×768 is the realistic worst case, not just a tall 1280×1200
window).** That exact mistake caused a real regression once — a desktop-only
enlarged mascot image was verified only against a tall window and broke on
ordinary laptop heights.

### Checklist before calling a new/changed screen done

Measure `document.documentElement.scrollHeight - window.innerHeight` (expect
`0`) at minimum:

1. 375×667 (iPhone SE — smallest realistic mobile)
2. 1366×768 (most common laptop height — the desktop case most likely to break)
3. 1280×1200 or similar (confirms "comfortable" tier's true content height,
   with no cap interference, so you know what threshold it actually needs)

If a screen has a genuinely unbounded list, it should use the same pattern as
`LobbyPage`'s public room list: an explicit `h-dvh` / `sm:h-[calc(100vh-4rem)]`
wrapper with `overflow-hidden`, and only the list itself scrolls
(`overflow-y-auto`), never the outer page.