# AGENTS.md - Arc Survivors (弧光幸存者)

## Project Overview

A single-player Vampire Survivors-style HTML5 Canvas game. No build tools, no bundler, no frameworks.
Open `index.html` directly in a browser or serve via any HTTP server.

## File Structure

```
game/
├── index.html          # Entry point, loads scripts in order
├── css/style.css       # All styles
├── js/
│   ├── config.js       # Constants, global state, entity arrays
│   ├── utils.js        # Math helpers (distance, line-point distance)
│   ├── audio.js        # Web Audio API synthesized sounds (no external files)
│   ├── particle.js     # Particle system
│   ├── gem.js          # Experience gems
│   ├── bullet.js       # Player bullets + laser, EnemyBullet lives in enemy.js
│   ├── enemy.js        # Enemy types, Boss, spawn logic, EnemyBullet class
│   ├── player.js       # Player movement, shooting, damage, leveling
│   ├── upgrades.js     # 15 upgrade definitions, upgrade screen UI
│   ├── renderer.js     # Background, UI bars, danger warnings, hit effects
│   └── game.js         # Main loop, input, pause, status panel, initialization
└── assets/             # Reserved for future use
```

## Running the Game

There is **no build step, no package manager, no test suite, no linter**.
Just open `index.html` in a browser. To serve locally:

```bash
# Any of these work:
python -m http.server 8000        # Python 3
npx serve .                       # Node
# Or just double-click index.html  (file:// protocol works fine)
```

## Architecture

### Global Namespace Pattern
All code lives under `var ArcSurvivors = ArcSurvivors || {};` — every file
starts with this guard. No ES6 modules (`import`/`export`) because they fail
under `file://` protocol.

### Script Load Order (MUST be preserved)
Defined in `index.html`. Dependencies flow downward:
1. `config.js` — must load first, defines the namespace and global state
2. `utils.js` — pure functions, no dependencies
3. `audio.js` — IIFE, self-contained audio engine
4. `particle.js`, `gem.js`, `bullet.js` — entity classes
5. `enemy.js` — depends on bullet.js (EnemyBullet), particle.js, config
6. `player.js` — depends on bullet.js, enemy.js (collision), upgrades
7. `upgrades.js` — depends on player.js
8. `renderer.js` — depends on all entities for drawing
9. `game.js` — main loop, must load last

**When adding a new JS file**, add a `<script>` tag in `index.html` at the
correct position in this chain.

### Entity Pattern
All game entities use constructor functions + prototype methods:
```js
ArcSurvivors.Enemy = function(x, y, type) {
    this.x = x;
    this.y = y;
    // ...
};
ArcSurvivors.Enemy.prototype.update = function(dt) { /* ... */ };
ArcSurvivors.Enemy.prototype.draw = function(ctx) { /* ... */ };
ArcSurvivors.Enemy.prototype.takeDamage = function(damage) { /* ... */ };
```

Every entity has `update(dt)` and `draw(ctx)` methods. `dt` is delta-time in
seconds. The main loop in `game.js` calls these and then filters dead entities:
```js
for (i = 0; i < GS.enemies.length; i++) GS.enemies[i].update(dt);
GS.enemies = GS.enemies.filter(function(e) { return e.active; });
```

### Global Arrays (defined in config.js)
- `ArcSurvivors.enemies` — active enemies
- `ArcSurvivors.bullets` — player bullets + lasers
- `ArcSurvivors.enemyBullets` — boss/projectile bullets
- `ArcSurvivors.gems` — experience pickups
- `ArcSurvivors.particles` — visual particles (capped at 300)

## Code Style

- **No semicolons preferred** — current code uses semicolons; new code should match
- **`var` over `let`/`const`** — keeping ES5 compat for file:// protocol broadness
- **`this.prop` in constructors** — no class syntax
- **Prototype methods** — not arrow functions (need `this` binding)
- **Anonymous IIFE for game.js** — `(function() { ... })();`
- **Chinese** is used in HTML labels, upgrade descriptions, and design docs.
  Code identifiers and comments are in **English**.
- **4-space indentation** throughout
- **No comments unless complex logic** — code should be self-documenting

## Key Game Constants (config.js)

| Constant | Value |
|----------|-------|
| Canvas | 1280 × 720 |
| Player HP | 100 |
| Pickup range | 160px |
| Base exp to level | 60, ×1.3 per level |
| Boss spawn | Every 45s after 30s |
| Particle cap | 300 |

## When Modifying the Game

1. **New enemy type**: Add case in `Enemy` constructor switch + shape in `draw()`
2. **New upgrade**: Push to `ArcSurvivors.UPGRADES` array in `upgrades.js`
3. **New sound**: Add function in `audio.js`, expose in return object, call from game code
4. **UI element**: Add HTML in `index.html`, CSS in `style.css`, update in `renderer.js` or `game.js`
5. **New entity type**: Create constructor + prototype in new file, add `<script>` tag in correct order

## Audio

All sounds are synthesized via Web Audio API — no external audio files needed.
Audio context requires user gesture to start; `game.js` initializes on first
canvas click. Call `ArcSurvivors.Audio.init()` then `resume()` before playing.

## Common Pitfalls

- **Script order matters**: Loading `player.js` before `bullet.js` will break things
- **`var` scoping**: `var` is function-scoped, not block-scoped — use closures in loops
- **Canvas coordinate system**: Origin is top-left, Y increases downward
- **`Set` usage**: `hitEnemies` in Bullet uses ES6 Set — acceptable as the only ES6 feature used
