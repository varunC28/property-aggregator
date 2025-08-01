// Shared scraping utilities
// -------------------------------------------------
// 1. fetchStream()   – early HTML snapshot (returns first N bytes or until </body>)
// 2. selectorRace()  – Puppeteer helper waits for whichever selector appears first
// 3. globalQueue     – P-Queue instance to throttle concurrent HTTP/page loads

const axios = require('axios');


/**
 * Fetch the first `byteLimit` bytes of an HTML page (or until </body> seen).
 * Returns raw HTML string – good enough for Cheerio without waiting for full payload.
 */
async function fetchStream(url, byteLimit = 300 * 1024, timeout = 60000) {
  const { data: stream } = await axios.get(url, {
    responseType: 'stream',
    timeout,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
    }
  });

  return new Promise((resolve, reject) => {
    let html = '';
    let bytes = 0;

    stream.on('data', chunk => {
      bytes += chunk.length;
      html += chunk.toString('utf8');

      if (bytes >= byteLimit || /<\/body>/i.test(html)) {
        stream.destroy(); // stop downloading more
      }
    });

    stream.on('end', () => resolve(html));
    stream.on('error', reject);
  });
}

/**
 * Waits for the first selector in `selectors` to appear, returns that selector string.
 * If none appear within timeout, resolves null.
 */
async function selectorRace(page, selectors = [], timeout = 4000) {
  if (!selectors.length) return null;

  const raced = selectors.map(sel =>
    page.waitForSelector(sel, { timeout }).then(() => sel).catch(() => null)
  );

  try {
    return await Promise.any(raced);
  } catch (_) {
    return null; // all failed
  }
}

module.exports = {
  fetchStream,
  selectorRace
};
