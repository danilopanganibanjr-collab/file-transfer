# TRANSFER

A simple self-hosted file transfer tool. Upload a file, get a short code, share the link — that's it.

![screenshot](https://img.shields.io/badge/node-%3E%3D14-brightgreen) ![license](https://img.shields.io/badge/license-ISC-blue)

## Features

- Drag & drop upload with progress bar
- Short code system (e.g. `a3f2b1c0`) for easy sharing
- File manager — view, copy link, delete
- Works over local network or Tailscale
- Installable as a PWA on mobile
- Up to 500MB per file

## Requirements

- [Node.js](https://nodejs.org/) v14 or higher

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/file-transfer.git
cd file-transfer
npm install
```

## Running

**Windows** — double-click `start.bat`

**Or manually:**
```bash
node server.js
```

Server starts at `http://localhost:3005`. Your network IPs are printed on startup.

## Usage

1. Open `http://localhost:3005` in your browser
2. **Upload** — drag a file in, get a shareable link
3. **Download** — enter the file code to fetch and download
4. **Files** — see all uploaded files, copy links, delete

## Tailscale

If you have [Tailscale](https://tailscale.com/) installed, your Tailscale IP is printed on startup (e.g. `http://100.x.x.x:3005`). Use that URL to access the tool from any device on your Tailscale network, including your phone.

To install as a PWA on mobile, open the Tailscale URL in your phone's browser and tap **Add to Home Screen**.

## Windows Firewall

If other devices on your local network can't connect, allow port 3005 through Windows Firewall (run PowerShell as Administrator):

```powershell
New-NetFirewallRule -DisplayName "File Transfer 3005" -Direction Inbound -Protocol TCP -LocalPort 3005 -Action Allow
```

## File Structure

```
file-transfer/
├── server.js         # Express server
├── start.bat         # Windows launcher
├── uploads/          # Uploaded files (git-ignored)
└── public/
    ├── index.html    # UI
    ├── manifest.json # PWA manifest
    ├── sw.js         # Service worker
    ├── icon-192.png  # PWA icon
    └── icon-512.png  # PWA icon
```

## Notes

- Uploaded files are stored in `uploads/` on disk
- The file registry is in-memory — restarting the server clears the list but not the files on disk
- No authentication — intended for personal/local use only
