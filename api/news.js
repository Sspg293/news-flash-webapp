
// FINAL Hindi Backend with Strong Image Extraction

let cache = {};
const CACHE_TIME = 5 * 60 * 1000;

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

async function extractArticleData(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const html = await res.text();

    // Extract first paragraph
    const paragraphMatch = html.match(/<p>(.*?)<\/p>/i);
    const paragraph = paragraphMatch ? cleanText(paragraphMatch[1]) : "";

    // Extract og:image
    const ogImageMatch = html.match(/property="og:image" content="(.*?)"/i);
    const ogImage = ogImageMatch ? ogImageMatch[1] : "";

    return { paragraph, ogImage };

  } catch {
    return { paragraph: "", ogImage: "" };
  }
}

export default async function handler(req, res) {
  const category = req.query.category || "general";

  const feeds = {
    general: "https://feeds.bbci.co.uk/hindi/rss.xml",
    business: "https://feeds.bbci.co.uk/hindi/business/rss.xml",
    technology: "https://feeds.bbci.co.uk/hindi/science/rss.xml",
    sports: "https://feeds.bbci.co.uk/hindi/sport/rss.xml",
    health: "https://feeds.bbci.co.uk/hindi/rss.xml",
    science: "https://feeds.bbci.co.uk/hindi/science/rss.xml",
    entertainment: "https://feeds.bbci.co.uk/hindi/rss.xml"
  };

  const rssFeed = feeds[category] || feeds.general;
  const now = Date.now();

  if (cache[category] && now - cache[category].time < CACHE_TIME) {
    return res.status(200).json({ articles: cache[category].data });
  }

  try {
    const response = await fetch(rssFeed);
    const xml = await response.text();
    const items = xml.split("<item>").slice(1, 16);

    let articles = [];

    for (let item of items) {
      let rawTitle = item.split("<title>")[1]?.split("</title>")[0] || "";
      const title = cleanText(rawTitle);

      const link = item.split("<link>")[1]?.split("</link>")[0];

      // Try RSS image first
      let image =
        item.match(/<media:content.*?url="(.*?)"/)?.[1] ||
        item.match(/<enclosure.*?url="(.*?)"/)?.[1] ||
        "";

      if (!title || !link) continue;

      const { paragraph, ogImage } = await extractArticleData(link);

      if (!image && ogImage) {
        image = ogImage;
      }

      const summary = summarize50(paragraph || title);

      articles.push({
        title,
        description: summary,
        url: link.trim(),
        image: image || "https://via.placeholder.com/800x400?text=FlashBrief"
      });
    }

    cache[category] = { data: articles, time: now };
    return res.status(200).json({ articles });

  } catch {
    return res.status(500).json({ error: "समाचार लोड नहीं हो पाए" });
  }
}
