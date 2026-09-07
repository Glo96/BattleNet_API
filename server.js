const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8000;
const ROOT = __dirname;
const REMOTE_URL = "https://starcraft.blizzard.com/en-us/partial-capture";

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".ico": "image/x-icon",
      }[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

function fetchRemoteCapture() {
  return new Promise((resolve, reject) => {
    const req = http.get(
      REMOTE_URL,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Cache-Control": "no-cache",
        },
      },
      (res) => {
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          try {
            const payload = JSON.parse(body);
            if (res.statusCode >= 400 || !payload || !payload.data) {
              reject(new Error(`Remote endpoint returned ${res.statusCode}`));
              return;
            }
            resolve(payload);
          } catch (error) {
            reject(new Error("Remote endpoint returned invalid JSON"));
          }
        });
      },
    );

    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error("Request timeout"));
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/partial-capture") {
    try {
      const payload = await fetchRemoteCapture();
      sendJson(res, 200, payload);
    } catch (error) {
      const local = fs.readFileSync(
        path.join(ROOT, "data", "messages.json"),
        "utf-8",
      );
      sendJson(res, 200, JSON.parse(local));
    }
    return;
  }

  let filePath = path.join(
    ROOT,
    url.pathname === "/" ? "index.html" : url.pathname,
  );

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT, "index.html");
  }

  sendFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
