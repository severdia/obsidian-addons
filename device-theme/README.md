# Device-Specific Theme (Obsidian)

Load a different theme — or none — on desktop vs. mobile from a single vault synced
over iCloud (or Dropbox, Syncthing, etc.), without a paid Obsidian Sync plan.

Your use case: **Cupertino on Mac, default appearance on iPad.**

## Why this works where CSS/config tricks don't

Everything about themes lives in the synced `.obsidian` config folder, and the active
theme is one shared value in `appearance.json`. That's why the same theme lands on
every device. This plugin sidesteps that: it keeps `appearance.json` on **Default**
everywhere and injects the chosen theme's CSS at runtime, picking per platform. Nothing
theme-related is ever written to a synced file, so the two devices can't conflict.

The plugin's own settings (which theme for desktop, which for mobile) DO sync — and
that's correct: both devices read the same rule, then each applies the part meant for
its platform.

## Install (no build tools needed)

1. On your Mac, open the vault's config folder and create:
   `<vault>/.obsidian/plugins/device-theme/`
2. Copy **`main.js`** and **`manifest.json`** into that folder.
3. In Obsidian: **Settings → Community plugins**, turn **Community plugins** on if it
   isn't already, then enable **Device-Specific Theme**. (No need to browse the store —
   it appears in the installed list.)
4. **Settings → Appearance → Theme → Default** on BOTH Mac and iPad. This is important:
   if Cupertino is set as the active theme, it will load on the iPad too and defeat the
   purpose.
5. **Settings → Device-Specific Theme:**
   - Desktop theme → **Cupertino**
   - Mobile theme → **Default (Obsidian)**

Once the plugin folder syncs to the iPad via iCloud, enable the plugin there too. It
will read the same settings and, because it's on a tablet, apply the mobile choice
(Default).

## Notes & limits

- "Mobile" includes iPad — `Platform.isMobile` is true on phones and tablets alike.
- The plugin reads `theme.css` straight from the theme folder, so it reproduces a
  standard single-file theme faithfully. If a theme relies on the **Style Settings**
  plugin for customization, those specific tweaks won't carry through injection.
- On desktop you may see a brief flash of the default theme before Cupertino injects.
  That's inherent to runtime injection and is the tradeoff for never touching
  `appearance.json`.
- After editing a theme's CSS, hit **Reapply** in the plugin settings (or reload) to
  re-inject.

## Editing / rebuilding the source

```
npm install
npm run build   # type-checks, then bundles main.ts → main.js
```

`obsidian` is an external at runtime (provided by the app), so it isn't bundled.
