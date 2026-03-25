import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import config from "./config.js";
import { createShortUrl, getLongUrl, incrementClicks } from "./database/db.js";
import { connectWithRetry, pool } from "./database/connect.js";
import { connectCache } from "./database/cache.js";

const app = express();
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));

app.post("/api/shorten", async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).json({ error: "No URL provided" });

  try {
    const shortCode = await createShortUrl(pool, longUrl);
    res.json({
      shortCode,
      shortUrl: `${config.server.hostUrl}/${shortCode}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    const longUrl = await getLongUrl(pool, shortCode);
    if (longUrl) {
      incrementClicks(pool, shortCode);
      res.redirect(302, longUrl);
    } else {
      return res.status(404).send("URL not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

async function startServer() {
  try {
    await connectWithRetry();
    await connectCache();

    app.listen(config.server.port, "0.0.0.0", () => {
      console.log(`Cliply is live at ${config.server.hostUrl}`);
    });
  } catch (err) {
    console.error("Critical Failure at startup:", err);
    process.exit(1);
  }
}

startServer();
