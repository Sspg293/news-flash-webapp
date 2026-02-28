
// FlashBrief FINAL - Proper Category Separation

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

function extractImage(item, description) {
  return (
    item.match(/<media:thumbnail.*?url="(.*?)"/i)?.[1] ||
    item.match(/<media:content.*?url="(.*?)"/i)?.[1] ||
    item.match(/<enclosure.*?url="(.*?)"/i)?.[1] ||
    description.match(/<img.*?src="(.*?)"/i)?.[1] ||
    ""
  );
}

export default async function handler(req, res) {

  const category = req.query.category || "general";

  // 🔥 Different feeds per category (REAL separated feeds)
  const feeds = {
    general: [
      "https://feeds.bbci.co.uk/hindi/rss.xml"
    ],
    business: [
      "https://feeds.bbci.co.uk/hindi/business/rss.xml"
    ],
    technology: [
      "https://feeds.bbci.co.uk/hindi/science/rss.xml",
      "https://feeds.bbci.co.uk/news/technology/rss.xml"
    ],
    sports: [
      "https://feeds.bbci.co.uk/hindi/sport/rss.xml"
    ],
    science: [
      "https://feeds.bbci.co.uk/hindi/science/rss.xml"
    ]
  };

  const selectedFeeds = feeds[category] || feeds.general;
  const now = Date.now();

  if (cache[category] && now - cache[category].time < CACHE_TIME) {
    return res.status(200).json({ articles: cache[category].data });
  }

  try {

    let allArticles = [];
    let usedTitles = new Set();

    for (let feedUrl of selectedFeeds) {

      const response = await fetch(feedUrl);
      const xml = await response.text();
      const items = xml.split("<item>").slice(1);

      for (let item of items) {

        let rawTitle = item.split("<title>")[1]?.split("</title>")[0] || "";
        let rawDescription = item.split("<description>")[1]?.split("</description>")[0] || "";
        let link = item.split("<link>")[1]?.split("</link>")[0];

        const title = cleanText(rawTitle);
        const description = summarize50(rawDescription);
        const image = extractImage(item, rawDescription);

        if (!title || !link) continue;
        if (usedTitles.has(title)) continue;

        usedTitles.add(title);

        allArticles.push({
          title,
          description,
          url: link.trim(),
          image
        });
      }
    }

    cache[category] = { data: allArticles, time: now };

    return res.status(200).json({ articles: allArticles });

  } catch (error) {
    return res.status(500).json({ error: "समाचार लोड नहीं हो पाए" });
  }
}
