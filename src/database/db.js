import { encode } from "../base62.js";
import config from "../config.js";
import cacheClient from "./cache.js";

export async function createShortUrl(pool, longUrl) {
  const client = await pool.connect();
  try {
    const findQuery = "SELECT short_code FROM urls WHERE long_url = $1 LIMIT 1";
    const existing = await pool.query(findQuery, [longUrl]);

    if (existing.rows.length > 0) {
      return existing.rows[0].short_code;
    }

    await client.query("BEGIN");

    const insertQuery = "INSERT INTO urls (long_url) VALUES ($1) RETURNING id";
    const res = await client.query(insertQuery, [longUrl]);
    const id = res.rows[0].id;

    const shortCode = encode(id);

    const updateQuery = "UPDATE urls SET short_code = $1 WHERE id = $2";
    await client.query(updateQuery, [shortCode, id]);

    await client.query("COMMIT");
    return shortCode;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getLongUrl(pool, shortCode) {
  try {
    const cachedUrl = await cacheClient.get(shortCode);
    if (cachedUrl) {
      console.log(`CACHE HIT: ${shortCode}`);
      return cachedUrl;
    }

    console.log(`CACHE MISS: ${shortCode}. Querying DB...`);
    const selectQuery = "SELECT long_url FROM urls WHERE short_code = $1";
    const res = await pool.query(selectQuery, [shortCode]);

    if (res.rows.length > 0) {
      const longUrl = res.rows[0].long_url;
      await cacheClient.set(shortCode, longUrl, {
        EX: config.cache.ttl,
      });
      return longUrl;
    }

    return null;
  } catch (err) {
    console.error("Redis/DB Error:", err);
    throw err;
  }
}

export function incrementClicks(pool, shortCode) {
  const updateQuery =
    "UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1";
  pool.query(updateQuery, [shortCode]).catch((err) => {
    console.error(`Failed to update clicks for ${shortCode}:`, err);
  });
}
