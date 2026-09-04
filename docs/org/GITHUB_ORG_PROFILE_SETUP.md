# GitHub Org Profile Setup — zolai-ai

Alignment with the official GitHub docs:
https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/customizing-your-organizations-profile

## What GitHub renders (official requirements)
- A **public** repo named exactly **`.github`** in the org.
- A `README.md` inside its **`profile/`** folder, committed on the default branch.
- For a **member-only** view: a private `.github-private` repo with `profile/README.md`.

**Our org (status ✅ where setable via API, ⚠️ owner-only):**
| Item | Value | Status |
|------|-------|--------|
| Profile repo | `Zolai-AI/.github` (public) | ✅ |
| Public profile README | `.github/profile/README.md` | ✅ (renders on Overview) |
| Logo embedded | `logo.png` referenced in README | ✅ |
| Org description | "Zolai AI — preserving & teaching Tedim Zolai (ZVS 2018)…" | ✅ |
| Website | `https://zolai-ai.github.io/` (live GitHub Pages site) | ✅ |
| Location | "Zomi (Chin) homeland — digital" | ✅ |
| Repository topics | `zolai, tedim, zomi, zomi-language` (+ per-repo) | ✅ |
| **Org avatar/logo** | Set via Settings → Profile → Upload new picture | ⚠️ **owner-only** (no API) — use `website/zolai-project/public/logo.png` (500×500) |
| **Pinned repositories** | Profile → Customize pins (max 6) | ⚠️ **owner-only** (no API) |
| Member-only README | `.github-private` repo (optional) | not needed yet |
| Org billing | billing alert shown | ⚠️ **owner-only** — resolve payment method |

## Notes
- Public vs Member view: if a members-only README/pins exist, the view defaults to
  `member`; otherwise `public`. Ours is public-only, so public users see the profile.
- Only org **owners** can pin repos and change the avatar (per official docs).
