# Changelog

## 1.13.1 - 2026-11-20

Release-readiness pass for the OpenChamber directory.

- Corrected the declared OpenChamber floor to `>=2.5.0`: 1.13.0 advertised
  1.24, but status sections and status controls are newer.
- Added the public extension name **Agent Groceries** to the manifest and Work
  Status title; X5/7-Eleven remain card themes.
- Declared the service's clipboard executables in `service.permissions.exec`.
- Faster month/week queries: only the small token/model fields are selected
  from `session_message`, not the full message JSON.
- Better OpenCode database discovery, including macOS Application Support.
- Hardened the custom club-name render path against HTML injection.
- Updated README/PUBLISHING for mobile, `OPENCODE_DB`, the official directory
  email process, release ZIP contents and the 2.5+ requirement.

## 1.13.0 - 2026-11-06

First public snapshot of the extension. Earlier internal versions (1.0–1.12)
were developed privately and were not published, so the version starts at
1.13.0.

- Work Status card and rail panel for OpenChamber 1.24+, reading the local
  OpenCode SQLite database in read-only mode.
- Day, week and month views with per-day breakdowns and the sessions that used
  the most tokens.
- PNG posters and a 1280×720 animated GIF, copied to the OS clipboard.
- Russian and English UI; X5 Club and 7-Eleven Club themes, or any club name
  set in Settings. Russian plurals and date ranges use the correct grammatical
  forms.
- Custom daily supply, product selection and per-device preferences.
- The displayed INPUT/OUTPUT split includes reasoning and cache writes, so it
  adds up to the headline total.
- Local service on `127.0.0.1` with no telemetry and no outbound network.
