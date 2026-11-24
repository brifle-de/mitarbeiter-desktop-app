# Releases

Brifle Business is built, tagged and published by GitHub Actions. Installed
apps update themselves from this repository's GitHub Releases
(electron-updater). Nobody builds or uploads a release by hand.

| Step | What you do | What CI does |
|---|---|---|
| Start a minor | push a new branch `release/X.Y` (e.g. `release/0.5`) | commits `package.json` version `X.Y.0` |
| Release candidate | merge a PR into `release/X.Y` | runs the CI checks, tags `vX.Y.Z-rc.N`, builds the Windows and Linux installers (and macOS once enabled) and publishes them as a GitHub **prerelease** ([release-candidate.yml](workflows/release-candidate.yml)) |
| Release | Actions → *Promote release candidate to stable* → `vX.Y.Z-rc.N` | after the `production` approval: rebuilds that rc's commit as `X.Y.Z`, creates the tag `vX.Y.Z` and the GitHub Release, marked "latest" for the newest version ([promote.yml](workflows/promote.yml)) |

`Z` is one more than the last stable `vX.Y.Z` tag, so fixes for an older
minor go into its own `release/X.Y` branch. Promoting such a fix does not mark
it "latest", so no installed app moves backwards.

## Who gets which version

| App setting | Updates to |
|---|---|
| default (stable) | the release GitHub marks **latest**: only promoted versions |
| Einstellungen → Updates → **Testkanal** | also release candidates (prereleases) |

Release candidates never reach stable installs: electron-updater on the stable
channel only reads GitHub's "latest" release, which is never a prerelease.
Leaving the Testkanal goes back to the newest stable version.

Updates download in the background and are installed when the user clicks
"Neu starten und aktualisieren" or quits the app; the app never restarts on its
own.

Why promote rebuilds instead of reusing the rc's files: the version is baked
into the app and into `latest*.yml`. An app built as `X.Y.Z-rc.N` would see the
stable `X.Y.Z` as newer than itself forever. The rebuild differs from the rc
only in the version (`.github/scripts/set-version.sh`), and the stable tag
points at exactly that tree.

## Platforms and files

| Platform | Files | Updates |
|---|---|---|
| Windows x64 | `Brifle-Business-Setup-X.Y.Z.exe` (+ `.blockmap`), `latest.yml` | yes |
| Linux x64 | `Brifle-Business-X.Y.Z-x86_64.AppImage`, `Brifle-Business-X.Y.Z-amd64.deb`, `latest-linux.yml` | AppImage: yes; deb: yes (asks for the password to install) |
| macOS (arm64, x64) | `.dmg`, `.zip`, `latest-mac.yml` | only when built (see below), needs signing |

`appId` (`de.brifle.mitarbeiter`), the product name and the data folder
(`~/brifle-business`) must never change: installed apps update in place and keep
their encrypted accounts only while they stay the same.

## One-time setup

Variables (Settings → Secrets and variables → Actions → Variables):

| Variable | Value |
|---|---|
| `RELEASE_APP_ID` | ID of the release GitHub App |
| `MAC_RELEASE_ENABLED` | `true` once the macOS secrets below exist; unset = no macOS build |

Secrets:

| Secret | Value |
|---|---|
| `RELEASE_APP_PRIVATE_KEY` | the App's private key |

Repository settings:

1. Install the release GitHub App on this repository (contents: write, workflows: write).
2. Rules → new **tag** ruleset on `v*`, restrict creations, updates and
   deletions, with the release App as the only bypass actor.
3. Environments → `production` with a required reviewer: promote waits for that approval.
4. Release bot commits (`chore(release): version …`) are pushed to
   `release/X.Y`: if the branch is protected, add the App as a bypass actor.

## macOS (later)

macOS only updates signed and notarised apps. To switch it on:

| Secret | Value |
|---|---|
| `MAC_CSC_LINK` | the **Developer ID Application** certificate with its private key, as base64 of the `.p12` (the one from the mobile setup) |
| `MAC_CSC_KEY_PASSWORD` | the `.p12` password |
| `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_API_KEY_P8` | the App Store Connect API key, the same one the mobile repository uses; electron-builder notarises with it |

Then set the variable `MAC_RELEASE_ENABLED` to `true`. The next release
candidate also builds `dmg` and `zip` for arm64 and x64 on `macos-15`
(hardened runtime, entitlements in `src-electron/build/entitlements.mac.plist`).

## Windows signing (optional)

The Windows installer is unsigned for now, so SmartScreen shows a warning on
first install (updates are not affected). To sign later, add electron-builder's
`win.azureSignOptions` (Azure Trusted Signing) or a certificate (`WIN_CSC_LINK`)
in `quasar.config.ts` and pass the secrets in `build.yml`.
