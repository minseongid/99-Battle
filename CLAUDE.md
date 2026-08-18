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

The document/page itself must never scroll. Two sanctioned exceptions exist:

1. A genuinely unbounded list (e.g. the public room list), where a
   self-contained inner region scrolls while the header/footer stay pinned.
2. Home's entered/lobby state (nickname input + buttons), by explicit user
   decision: the mascot is sized for brand identity first — matching its
   desktop proportions — even if that means this one screen scrolls on a
   short phone (SE-class ~667px height gets ~84px of scroll; most real
   phones, being taller, get none). See "Home's mascot: identity over
   zero-scroll" below.

Everywhere else (Room, CreateRoom, Game, Result, and any future screen) must
still fit its viewport exactly — this is not a blanket loosening of the
policy, just this one screen.

### How it's implemented

`frontend/src/index.css` defines a shared set of CSS custom properties
(`--room-*`, `--home-*`, `--lobby-*`) that pages reference via
`className="...-[var(--foo)]"` instead of hardcoded Tailwind spacing. Two
tiers exist:

- **Comfortable** (`:root` defaults) — used on tall-enough screens.
- **Compact** — overrides triggered by
  `@media (max-height: 820px), (min-width: 640px) and (max-height: 900px)`.
  (820px, not 700px — see "Chrome emulation isn't real mobile Safari" below.)

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

### Chrome emulation isn't real mobile Safari

Chrome DevTools viewport resize treats the pixels you give it as pure content
area. Real phones don't: the browser's own chrome (address bar, toolbar) eats
into that budget, and how much depends on the browser and its current state.
Two concrete lessons from getting this wrong on Home:

- A screen that measures `0` overflow in Chrome emulation at some height can
  still scroll on a real device at that same CSS height, because the real
  usable space was smaller than what emulation gave credit for. Build in
  margin beyond what emulation shows as the exact boundary — this is why the
  compact breakpoint is 820px, not the 800px actually measured as the exact
  cutoff (see git history on `index.css` for the measurement).
- `dvh` is supposed to track the *current* visible viewport, shrinking when
  browser chrome is showing and growing once it collapses. But on a page that
  never scrolls, iOS Safari's toolbar never gets a scroll gesture to trigger
  its auto-collapse, and `dvh` was observed sizing against the larger
  toolbar-hidden reference anyway — leaving a real gap between the page's own
  content and where the (still-visible) toolbar actually starts. `svh` (small
  viewport — chrome always assumed visible) matched reality for that
  never-scrolls case; `dvh` remains correct for pages that do scroll.
- A `flex-1` region only shrinks to fit if something above it in the
  ancestor chain has a genuine height ceiling. `min-h-dvh` (PageShell's
  outer wrapper) is a *minimum*, not a cap — on mobile widths nothing bounds
  height at all (the `sm:max-h` cap is desktop-only), so `flex-1` on its own
  just renders at natural size and the page grows past viewport instead of
  shrinking. Needs an explicit `h-dvh`/`h-svh` (or `sm:h-[calc(100vh-4rem)]`
  on desktop) on a real ancestor for flex-shrink to have anything to shrink
  against. Also: never combine `flex-1` (which forces `flex-basis: 0%`) with
  an explicit height on the same element for this purpose — they fight, and
  `flex-1` silently wins, making the explicit height a no-op. Caught this one
  by stress-testing at an absurdly short height (360×560) where the element
  should have visibly shrunk and didn't.

### Home's mascot: identity over zero-scroll

By explicit user decision, Home's entered/lobby state prioritizes the mascot
looking correctly sized for brand identity — matching its desktop proportions
— over strictly guaranteeing zero scroll on the shortest phones. It uses a
plain fixed-size image (`--home-mascot-size`, no flex-shrink trick, no forced
`h-` on the wrapper) so desktop sizes to its actual content like every other
page. Don't "fix" this back to a shrink-to-fit mascot without checking with
the user first — that was tried and explicitly reverted.

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