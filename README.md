# Vehicle Document Dossier

A mobile-friendly, installable web app for capturing vehicle and owner
documents in the field (Aadhaar, RC book, insurance, vehicle photos,
odometer, chassis plate) and generating a single PDF report.

## Live app

https://techie-sathish.github.io/vehicle-dossier/

## Features

- Camera capture or file upload for each document slot
- Crop and straighten photos before saving
- GPS location tagging on vehicle side photos (best-effort — never blocks capture)
- Autosaves to the device (IndexedDB) so nothing is lost if the browser reloads
- Generates a single downloadable PDF report
- Share the finished PDF directly to WhatsApp
- Installable as a PWA (Android, Windows, iOS, tablets) — works offline after first load

## Files

| File | Purpose |
|---|---|
| `index.html` | The app itself (UI, logic, and the bundled jsPDF library) |
| `manifest.json` | PWA metadata (name, icons, display mode) |
| `sw.js` | Service worker — caches the app shell for offline use |
| `icon-*.png`, `apple-touch-icon.png` | App icons for install/home screen |

## Installing on a device

- **Android / Windows (Chrome, Edge):** open the live link above, then use the browser's "Install app" option.
- **iOS (Safari):** open the live link, tap Share → Add to Home Screen.

All data (captured photos, form fields) stays on the device until a PDF is generated — nothing is uploaded to a server.
