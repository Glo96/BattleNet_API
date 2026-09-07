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
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Files

- `index.html` — app shell
- `style.css` — sci-fi visual styling
- `app.js` — rendering and filtering logic
- `data/messages.json` — the local archive data

## Notes

The app uses a curated version of the recovered data from the gist and presents it in a readable interface without requiring any external dependencies.
