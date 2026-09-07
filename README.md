# StarCraft partial-capture archive

This project is a lightweight browser app based on the public StarCraft teaser collected from the `partial-capture` endpoint described in the linked gist.

## Features

- Discover the eight distinct messages recovered from the endpoint
- Search content by title or text
- Filter by text, binary, or table formats
- Render cargo manifests as readable tables
- View decoded ASCII output for binary transmissions

## Run locally

From the project root:

```bash
node server.js
```

Then open:

```text
http://localhost:8000
```

If port 8000 is already in use, start the server on port 8081 instead:

PowerShell:

```powershell
$env:PORT = "8081"
node server.js
```

Then open `http://localhost:8081`. Keep the terminal running while using the app.

## Files

- `index.html` — app shell
- `style.css` — sci-fi visual styling
- `app.js` — rendering and filtering logic
- `server.js` — local server, API proxy, and fallback handling
- `data/messages.json` — the local archive data and fallback

## Notes

The app uses a curated version of the recovered data from the gist and presents it in a readable interface without requiring any external dependencies. The server tries the live Blizzard endpoint first and falls back to the local archive if the endpoint is unavailable.
