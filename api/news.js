
let cache = {
  data: null,
  time: 0
};

function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summarize50(text) {
  const clean = cleanText(text);
  if (!clean) return "";

  const words = clean.split(" ");
  if (words.length <= 50) return clean;

  return words.slice(0, 50).join(" ") + "...";
}

async function extractFirstParagraph(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = await res.text();

    const match = html.match(/<p>(.*?)<\/p>/i);
    if (!match) return "";

    return cleanText(match[1]);

  } catch {
    return "";
  }
}

export default async function handler(req, res) {
  const now = Date.now();

  // Serve cached version (5 min)
  if (cache.data && now - cache.time < 5 * 60 * 1000) {
    return res.status(200).json({ articles: cache.data });
  }

  const rssFeed = "https://feeds.bbci.co.uk/news/rss.xml";

  try {
    const response = await fetch(rssFeed);
    const xml = await response.text();

    const items = xml.split("<item>").slice(1, 16); // limit 15

    let articles = [];

    for (let item of items) {
      let rawTitle = item.split("<title>")[1]?.split("</title>")[0] || "";
      const title = cleanText(rawTitle);

      const link = item.split("<link>")[1]?.split("</link>")[0];
      const image =
        item.match(/<media:content.*?url="(.*?)"/)?.[1] ||
        item.match(/<enclosure.*?url="(.*?)"/)?.[1] ||
        "";

      if (!title || !link) continue;

      const paragraph = await extractFirstParagraph(link);
      const summary = summarize50(paragraph || title);

      articles.push({
        title,
        description: summary,
        url: link.trim(),
        image
      });
    }

    cache = { data: articles, time: now };

    return res.status(200).json({ articles });

  } catch (error) {
    return res.status(500).json({ error: "News fetch failed" });
  }
}
